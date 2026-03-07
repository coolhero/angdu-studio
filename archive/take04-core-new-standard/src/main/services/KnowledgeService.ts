// KnowledgeService — Main orchestrator for Knowledge Base (F004)

import { app, ipcMain, BrowserWindow } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, rmSync } from 'fs'
import { randomUUID } from 'crypto'
import { LocalIndex } from 'vectra'
import { embed, embedMany } from 'ai'
import { IpcChannel } from '@shared/IpcChannel'
import type {
  KnowledgeBase,
  KnowledgeBaseParams,
  KnowledgeItem,
  KnowledgeReference,
  KBItemStatusPayload,
  KBDirectoryProgressPayload,
  Model
} from '@shared/types'
import { chunkText } from './KnowledgeChunker'
import { knowledgeQueueManager } from './KnowledgeQueueManager'
import { createDeferredDelete, type KnowledgeDeferredDelete } from './KnowledgeDeferredDelete'
import * as loaders from './KnowledgeLoaders'
import { withContext } from '../logger'

const log = withContext('knowledge:service')

class KnowledgeService {
  private baseDir: string
  private indexes = new Map<string, LocalIndex>()
  private deferredDelete: KnowledgeDeferredDelete

  constructor() {
    this.baseDir = join(app.getPath('userData'), 'knowledge')
    if (!existsSync(this.baseDir)) {
      mkdirSync(this.baseDir, { recursive: true })
    }
    this.deferredDelete = createDeferredDelete(app.getPath('userData'))

    // Wire up queue capacity callback
    knowledgeQueueManager.onCapacityFreed = () => {
      this.processNextInQueue()
    }
  }

  // ── IPC Handler Registration ──

  registerHandlers(): void {
    ipcMain.handle(IpcChannel.KB_Create, (_, params: KnowledgeBaseParams) => {
      return this.create(params)
    })

    ipcMain.handle(IpcChannel.KB_Delete, (_, baseId: string) => {
      return this.delete(baseId)
    })

    ipcMain.handle(IpcChannel.KB_Reset, (_, baseId: string) => {
      return this.reset(baseId)
    })

    ipcMain.handle(
      IpcChannel.KB_AddItem,
      (_, { baseId, item }: { baseId: string; item: KnowledgeItem }) => {
        return this.addItem(baseId, item)
      }
    )

    ipcMain.handle(
      IpcChannel.KB_RemoveItem,
      (_, { baseId, itemId }: { baseId: string; itemId: string }) => {
        return this.removeItem(baseId, itemId)
      }
    )

    ipcMain.handle(
      IpcChannel.KB_Search,
      (_, { baseId, query, count }: { baseId: string; query: string; count?: number }) => {
        return this.search(baseId, query, count)
      }
    )

    ipcMain.handle(
      IpcChannel.KB_Rerank,
      (
        _,
        {
          baseId,
          query,
          results,
          model
        }: { baseId: string; query: string; results: KnowledgeReference[]; model: Model }
      ) => {
        return this.rerank(baseId, query, results, model)
      }
    )

    log.debug('Knowledge IPC handlers registered')
  }

  // ── Core Methods ──

  async create(params: KnowledgeBaseParams): Promise<KnowledgeBase> {
    // Validate chunking parameters (T060)
    const chunkSize = params.chunkSize ?? 1000
    const chunkOverlap = params.chunkOverlap ?? 200
    if (chunkOverlap >= chunkSize) {
      throw new Error(`chunkOverlap (${chunkOverlap}) must be less than chunkSize (${chunkSize})`)
    }
    if (chunkSize < 1) {
      throw new Error(`chunkSize must be at least 1`)
    }

    const id = randomUUID()
    const indexPath = join(this.baseDir, id)
    mkdirSync(indexPath, { recursive: true })

    const index = new LocalIndex(indexPath)
    await index.createIndex()
    this.indexes.set(id, index)

    const base: KnowledgeBase = {
      id,
      name: params.name,
      model: params.model,
      documentCount: params.documentCount ?? 10,
      chunkSize: params.chunkSize ?? 1000,
      chunkOverlap: params.chunkOverlap ?? 200,
      items: [],
      version: 1,
      created_at: Date.now(),
      updated_at: Date.now()
    }

    log.info(`Created knowledge base: ${base.name} (${id})`)
    return base
  }

  async delete(baseId: string): Promise<void> {
    const indexPath = join(this.baseDir, baseId)

    try {
      this.indexes.delete(baseId)
      if (existsSync(indexPath)) {
        rmSync(indexPath, { recursive: true, force: true })
      }
      log.info(`Deleted knowledge base: ${baseId}`)
    } catch (err) {
      log.warn(`Failed to delete base ${baseId}, deferring: ${(err as Error).message}`)
      this.deferredDelete.addPending({
        id: baseId,
        type: 'base',
        paths: [indexPath]
      })
    }
  }

  async reset(baseId: string): Promise<void> {
    const indexPath = join(this.baseDir, baseId)

    // Remove and recreate the index
    this.indexes.delete(baseId)
    if (existsSync(indexPath)) {
      rmSync(indexPath, { recursive: true, force: true })
    }
    mkdirSync(indexPath, { recursive: true })

    const index = new LocalIndex(indexPath)
    await index.createIndex()
    this.indexes.set(baseId, index)

    log.info(`Reset knowledge base: ${baseId}`)
  }

  async addItem(baseId: string, item: KnowledgeItem): Promise<void> {
    const workload = knowledgeQueueManager.estimateWorkload(item)

    if (!knowledgeQueueManager.canProcess(workload)) {
      knowledgeQueueManager.enqueue(item)
      log.debug(`Queued item ${item.id} (workload=${workload})`)
      return
    }

    knowledgeQueueManager.registerActive(item.id, workload)
    this.emitItemStatus(baseId, item.id, 'processing', 0)

    try {
      const index = await this.getOrCreateIndex(baseId)
      const text = await this.loadContent(baseId, item)

      if (!text || !text.trim()) {
        throw new Error('No content extracted from source')
      }

      // Chunk the content (use KB config — caller should provide via addItem params)
      const chunks = chunkText(text, 1000, 200)
      log.debug(`Item ${item.id}: ${chunks.length} chunks from ${text.length} chars`)

      // Generate embeddings for all chunks
      const vectors = await this.embedChunks(chunks, item)

      // Insert into vector index
      for (let i = 0; i < chunks.length; i++) {
        await index.insertItem({
          vector: vectors[i],
          metadata: {
            text: chunks[i],
            itemId: item.id,
            baseId,
            sourceUrl: item.sourceUrl || '',
            type: item.type,
            chunkIndex: i
          }
        })
      }

      this.emitItemStatus(baseId, item.id, 'completed', 100)
      log.info(`Processed item ${item.id}: ${chunks.length} chunks indexed`)
    } catch (err) {
      const message = (err as Error).message
      log.error(`Failed to process item ${item.id}: ${message}`)
      this.emitItemStatus(baseId, item.id, 'error', 0, message)
    } finally {
      knowledgeQueueManager.releaseActive(item.id)
    }
  }

  async removeItem(baseId: string, itemId: string): Promise<void> {
    try {
      const index = await this.getOrCreateIndex(baseId)

      // List all items and remove those matching the itemId
      const items = await index.listItems()
      for (const entry of items) {
        const meta = entry.metadata as Record<string, unknown>
        if (meta.itemId === itemId) {
          await index.deleteItem(entry.id)
        }
      }

      // Also remove from pending queue
      knowledgeQueueManager.removePending(itemId)

      log.info(`Removed item ${itemId} from base ${baseId}`)
    } catch (err) {
      log.warn(`Failed to remove item ${itemId}, deferring: ${(err as Error).message}`)
      this.deferredDelete.addPending({
        id: itemId,
        type: 'item',
        baseId,
        paths: []
      })
    }
  }

  async search(baseId: string, query: string, count = 10): Promise<KnowledgeReference[]> {
    const index = await this.getOrCreateIndex(baseId)

    // Embed the query
    const queryVector = await this.embedQuery(query, baseId)

    const results = await index.queryItems(queryVector, count)

    return results.map((r) => {
      const meta = r.item.metadata as Record<string, unknown>
      return {
        id: r.item.id as string,
        content: (meta.text as string) || '',
        sourceUrl: (meta.sourceUrl as string) || undefined,
        type: (meta.type as string) || undefined,
        score: r.score,
        metadata: meta
      }
    })
  }

  async rerank(
    _baseId: string,
    _query: string,
    results: KnowledgeReference[],
    _model: Model
  ): Promise<KnowledgeReference[]> {
    // TODO: Implement AI-based reranking with the provided model
    // For now, return results sorted by score (already sorted from vector search)
    return results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  }

  async retryPendingDeletions(): Promise<void> {
    await this.deferredDelete.retryAll(async (entry) => {
      if (entry.type === 'base') {
        for (const path of entry.paths) {
          if (existsSync(path)) {
            rmSync(path, { recursive: true, force: true })
          }
        }
        this.indexes.delete(entry.id)
        return true
      }

      if (entry.type === 'item' && entry.baseId) {
        await this.removeItem(entry.baseId, entry.id)
        return true
      }

      return false
    })
  }

  // ── Private Helpers ──

  private async getOrCreateIndex(baseId: string): Promise<LocalIndex> {
    let index = this.indexes.get(baseId)
    if (index) return index

    const indexPath = join(this.baseDir, baseId)
    index = new LocalIndex(indexPath)

    if (!await index.isIndexCreated()) {
      mkdirSync(indexPath, { recursive: true })
      await index.createIndex()
    }

    this.indexes.set(baseId, index)
    return index
  }

  private async loadContent(baseId: string, item: KnowledgeItem): Promise<string> {
    switch (item.type) {
      case 'file': {
        const fileMeta = item.content as { path: string }
        return loaders.loadFile(fileMeta.path)
      }
      case 'url': {
        const url = item.content as string
        return loaders.loadUrl(url)
      }
      case 'sitemap': {
        const sitemapUrl = item.content as string
        const urls = await loaders.loadSitemap(sitemapUrl)
        // Load each URL and concatenate
        const texts: string[] = []
        for (const url of urls) {
          try {
            const text = await loaders.loadUrl(url)
            if (text.trim()) texts.push(text)
          } catch (err) {
            log.warn(`Skipping sitemap URL ${url}: ${(err as Error).message}`)
          }
        }
        return texts.join('\n\n')
      }
      case 'note': {
        const noteContent = item.content as string
        return loaders.loadNote(noteContent)
      }
      case 'directory': {
        const dirMeta = item.content as { path: string }
        const files = await loaders.loadDirectory(dirMeta.path, (percent) => {
          this.emitDirectoryProgress(baseId, item.id, percent)
        })
        return files.map((f) => `--- ${f.filePath} ---\n${f.content}`).join('\n\n')
      }
      case 'video': {
        const videoMeta = item.content as { path: string }
        return loaders.loadVideo(videoMeta.path)
      }
      default:
        throw new Error(`Unknown item type: ${item.type}`)
    }
  }

  private async embedChunks(chunks: string[], _item: KnowledgeItem): Promise<number[][]> {
    // Use AI SDK embedMany for batch embedding
    // The model is determined from the knowledge base config passed via item.baseId
    // For now, use a placeholder model identifier
    try {
      const { embeddings } = await embedMany({
        model: this.getEmbeddingModel(),
        values: chunks
      })
      return embeddings
    } catch (err) {
      log.error(`Embedding failed: ${(err as Error).message}`)
      throw err
    }
  }

  private async embedQuery(query: string, _baseId: string): Promise<number[]> {
    const { embedding } = await embed({
      model: this.getEmbeddingModel(),
      value: query
    })
    return embedding
  }

  private getEmbeddingModel() {
    // TODO: Resolve embedding model from knowledge base configuration
    // This will be wired up when the embedding model registry is available
    // For now, return a placeholder that the AI SDK can use
    return undefined as any
  }

  private processNextInQueue(): void {
    const next = knowledgeQueueManager.dequeue()
    if (!next) return

    const workload = knowledgeQueueManager.estimateWorkload(next)
    if (knowledgeQueueManager.canProcess(workload)) {
      this.addItem(next.baseId, next).catch((err) => {
        log.error(`Queue processing failed for ${next.id}: ${(err as Error).message}`)
      })
    } else {
      // Put it back at the front — re-enqueue
      knowledgeQueueManager.enqueue(next)
    }
  }

  private emitItemStatus(
    baseId: string,
    itemId: string,
    status: KBItemStatusPayload['status'],
    progress: number,
    error?: string
  ): void {
    const payload: KBItemStatusPayload = { baseId, itemId, status, progress, error }
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send(IpcChannel.KB_ItemStatus, payload)
    })
  }

  private emitDirectoryProgress(baseId: string, itemId: string, percent: number): void {
    const payload: KBDirectoryProgressPayload = { baseId, itemId, percent }
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send(IpcChannel.KB_DirectoryProgress, payload)
    })
  }
}

export const knowledgeService = new KnowledgeService()
