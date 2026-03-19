import { app, BrowserWindow } from 'electron'
import { join } from 'node:path'
import { mkdirSync, existsSync, unlinkSync, readdirSync } from 'node:fs'
import { nanoid } from 'nanoid'
import ElectronStore from 'electron-store'
import type {
  KnowledgeBase,
  KnowledgeItem,
  ItemType,
  ItemStatus,
  VectorRecord
} from '@shared/types/knowledge'
import { KNOWLEDGE_DEFAULTS } from '@shared/types/knowledge'
import { vectorStore, float32ArrayToBuffer } from './VectorStore'
import { chunkText } from './TextChunker'
import { workloadManager } from './WorkloadManager'
import { pendingDeleteManager } from './PendingDeleteManager'
import { getPreprocessor } from '../loaders/PreprocessorFactory'
import { loadFile } from '../loaders/FileLoader'
import { logger } from './LoggerService'

const Store = (ElectronStore as unknown as { default?: typeof ElectronStore }).default ?? ElectronStore

/** Prompt template for citation injection into AI conversations. */
export const REFERENCE_PROMPT = `The following context was retrieved from the user's knowledge base. Use it to answer accurately. Cite sources using [ref:N] notation.

---KNOWLEDGE CONTEXT---
{{references}}
---END KNOWLEDGE CONTEXT---`

interface KBStoreSchema {
  bases: KnowledgeBase[]
}

export class KnowledgeService {
  private static instance: KnowledgeService
  private store!: ElectronStore<KBStoreSchema>
  private dataDir = ''

  static getInstance(): KnowledgeService {
    if (!KnowledgeService.instance) {
      KnowledgeService.instance = new KnowledgeService()
    }
    return KnowledgeService.instance
  }

  async initialize(): Promise<void> {
    this.dataDir = join(app.getPath('userData'), 'knowledge')
    mkdirSync(this.dataDir, { recursive: true })
    mkdirSync(join(this.dataDir, 'files'), { recursive: true })

    this.store = new Store<KBStoreSchema>({
      name: 'knowledge-bases',
      defaults: { bases: [] }
    })

    vectorStore.initialize()
    pendingDeleteManager.initialize()

    // Retry any pending deletes from previous sessions
    await pendingDeleteManager.retryAll(async (kbId) => {
      vectorStore.deleteByKbId(kbId)
      this.cleanupFiles(kbId)
    })

    logger.info('[KnowledgeService] Initialized')
  }

  // --- CRUD ---

  create(params: {
    name: string
    model: KnowledgeBase['model']
    dimensions?: number
    documentCount?: number
    chunkSize?: number
    chunkOverlap?: number
    threshold?: number
  }): KnowledgeBase {
    const now = new Date().toISOString()
    const kb: KnowledgeBase = {
      id: nanoid(21),
      name: params.name,
      model: params.model,
      dimensions: params.dimensions,
      items: [],
      documentCount: params.documentCount ?? KNOWLEDGE_DEFAULTS.documentCount,
      chunkSize: params.chunkSize ?? KNOWLEDGE_DEFAULTS.chunkSize,
      chunkOverlap: params.chunkOverlap ?? KNOWLEDGE_DEFAULTS.chunkOverlap,
      threshold: params.threshold ?? KNOWLEDGE_DEFAULTS.threshold,
      version: 1,
      created_at: now,
      updated_at: now
    }

    const bases = this.store.get('bases') ?? []
    bases.push(kb)
    this.store.set('bases', bases)

    logger.info(`[KnowledgeService] Created KB: ${kb.id} (${kb.name})`)
    return kb
  }

  async delete(id: string): Promise<void> {
    try {
      vectorStore.deleteByKbId(id)
      this.cleanupFiles(id)
      pendingDeleteManager.removePending(id)
    } catch (err) {
      logger.warn(`[KnowledgeService] Cleanup failed for ${id}, marking as pending`, err)
      pendingDeleteManager.addPending(id)
    }

    const bases = (this.store.get('bases') ?? []).filter((b) => b.id !== id)
    this.store.set('bases', bases)
    logger.info(`[KnowledgeService] Deleted KB: ${id}`)
  }

  reset(id: string): void {
    vectorStore.deleteByKbId(id)

    const bases = this.store.get('bases') ?? []
    const idx = bases.findIndex((b) => b.id === id)
    if (idx !== -1) {
      bases[idx].items = bases[idx].items.map((item) => ({
        ...item,
        status: 'pending' as ItemStatus,
        progress: 0,
        error: undefined
      }))
      bases[idx].updated_at = new Date().toISOString()
      this.store.set('bases', bases)
    }

    logger.info(`[KnowledgeService] Reset KB: ${id}`)
  }

  update(kb: Partial<KnowledgeBase> & { id: string }): KnowledgeBase {
    const bases = this.store.get('bases') ?? []
    const idx = bases.findIndex((b) => b.id === kb.id)
    if (idx === -1) {
      throw new Error(`Knowledge base not found: ${kb.id}`)
    }

    bases[idx] = {
      ...bases[idx],
      ...kb,
      updated_at: new Date().toISOString()
    }
    this.store.set('bases', bases)

    logger.info(`[KnowledgeService] Updated KB: ${kb.id}`)
    return bases[idx]
  }

  list(): KnowledgeBase[] {
    return this.store.get('bases') ?? []
  }

  // --- Item Management ---

  addItem(
    baseId: string,
    type: ItemType,
    content: string,
    remark?: string
  ): KnowledgeItem {
    const now = new Date().toISOString()
    const item: KnowledgeItem = {
      id: nanoid(21),
      baseId,
      type,
      content,
      status: 'pending',
      progress: 0,
      retryCount: 0,
      remark,
      created_at: now,
      updated_at: now
    }

    const bases = this.store.get('bases') ?? []
    const idx = bases.findIndex((b) => b.id === baseId)
    if (idx === -1) throw new Error(`Knowledge base not found: ${baseId}`)

    bases[idx].items.push(item)
    bases[idx].updated_at = now
    this.store.set('bases', bases)

    // Start embedding pipeline async
    this._processItem(baseId, item).catch((err) => {
      logger.error(`[KnowledgeService] Processing failed for item ${item.id}:`, err)
    })

    return item
  }

  removeItem(baseId: string, itemId: string): void {
    vectorStore.deleteByItemId(itemId)

    const bases = this.store.get('bases') ?? []
    const idx = bases.findIndex((b) => b.id === baseId)
    if (idx !== -1) {
      bases[idx].items = bases[idx].items.filter((i) => i.id !== itemId)
      bases[idx].updated_at = new Date().toISOString()
      this.store.set('bases', bases)
    }

    logger.info(`[KnowledgeService] Removed item ${itemId} from KB ${baseId}`)
  }

  addFiles(baseId: string, files: string[]): KnowledgeItem[] {
    const items: KnowledgeItem[] = []
    for (const filePath of files) {
      const item = this.addItem(baseId, 'file', filePath)
      items.push(item)
    }
    return items
  }

  retryItem(baseId: string, itemId: string): void {
    const bases = this.store.get('bases') ?? []
    const kbIdx = bases.findIndex((b) => b.id === baseId)
    if (kbIdx === -1) throw new Error(`Knowledge base not found: ${baseId}`)

    const itemIdx = bases[kbIdx].items.findIndex((i) => i.id === itemId)
    if (itemIdx === -1) throw new Error(`Item not found: ${itemId}`)

    const item = bases[kbIdx].items[itemIdx]
    item.status = 'pending'
    item.progress = 0
    item.error = undefined
    item.retryCount += 1
    item.updated_at = new Date().toISOString()

    this.store.set('bases', bases)

    // Delete old vectors for this item before reprocessing
    vectorStore.deleteByItemId(itemId)

    this._processItem(baseId, item).catch((err) => {
      logger.error(`[KnowledgeService] Retry failed for item ${itemId}:`, err)
    })
  }

  // --- Search ---

  async search(
    kbIds: string[],
    query: string,
    limit?: number,
    threshold?: number
  ): Promise<Array<VectorRecord & { similarity: number }>> {
    const queryEmbedding = await this.embedText(kbIds[0], query)
    if (!queryEmbedding) return []

    const effectiveLimit = limit ?? KNOWLEDGE_DEFAULTS.documentCount
    const effectiveThreshold = threshold ?? KNOWLEDGE_DEFAULTS.threshold

    const allResults: Array<VectorRecord & { similarity: number }> = []

    for (const kbId of kbIds) {
      const results = vectorStore.search(
        kbId,
        queryEmbedding,
        effectiveLimit,
        effectiveThreshold
      )
      allResults.push(...results)
    }

    // Merge and rank by similarity
    allResults.sort((a, b) => b.similarity - a.similarity)
    return allResults.slice(0, effectiveLimit)
  }

  async rerank(
    results: Array<VectorRecord & { similarity: number }>,
    _query: string,
    _rerankModel?: KnowledgeBase['rerankModel']
  ): Promise<Array<VectorRecord & { similarity: number }>> {
    // TODO: implement reranking via external model
    // For now, return as-is (already sorted by similarity)
    return results
  }

  saveContent(
    targetKBId: string,
    content: string,
    type: ItemType,
    remark?: string
  ): KnowledgeItem {
    return this.addItem(targetKBId, type ?? 'note', content, remark)
  }

  closeAll(): void {
    vectorStore.close()
    logger.info('[KnowledgeService] Closed all resources')
  }

  // --- Private: Embedding Pipeline ---

  async _processItem(baseId: string, item: KnowledgeItem): Promise<void> {
    const sizeEstimate = Buffer.byteLength(item.content, 'utf-8')
    const release = await workloadManager.acquire(sizeEstimate)

    try {
      this.updateItemStatus(baseId, item.id, 'processing', 10)

      // Step 1: Load content
      let rawText: string
      if (item.type === 'file') {
        rawText = loadFile(item.content)
      } else if (item.type === 'note') {
        rawText = item.content
      } else {
        // For url, sitemap, directory, video — load via type
        // Currently fall back to content as text
        rawText = item.content
      }

      this.updateItemStatus(baseId, item.id, 'processing', 30)

      // Step 2: Preprocess
      const bases = this.store.get('bases') ?? []
      const kb = bases.find((b) => b.id === baseId)
      if (!kb) throw new Error(`KB not found: ${baseId}`)

      const preprocessor = getPreprocessor(kb.preprocessProvider)
      const processed = await preprocessor.process(rawText)

      this.updateItemStatus(baseId, item.id, 'processing', 50)

      // Step 3: Chunk
      const chunks = chunkText(
        processed,
        kb.chunkSize ?? KNOWLEDGE_DEFAULTS.chunkSize,
        kb.chunkOverlap ?? KNOWLEDGE_DEFAULTS.chunkOverlap
      )

      this.updateItemStatus(baseId, item.id, 'processing', 60)

      // Step 4: Embed each chunk and store
      for (let i = 0; i < chunks.length; i++) {
        const embedding = await this.embedText(baseId, chunks[i])
        if (!embedding) {
          throw new Error('Failed to generate embedding')
        }

        const record: VectorRecord = {
          id: nanoid(21),
          kb_id: baseId,
          item_id: item.id,
          content: chunks[i],
          metadata: JSON.stringify({
            source: item.content,
            type: item.type,
            chunkIndex: i,
            totalChunks: chunks.length
          }),
          embedding: float32ArrayToBuffer(embedding),
          created_at: Date.now()
        }

        vectorStore.insert(record)

        const progress = 60 + Math.round(((i + 1) / chunks.length) * 35)
        this.updateItemStatus(baseId, item.id, 'processing', progress)
      }

      this.updateItemStatus(baseId, item.id, 'completed', 100)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      this.updateItemStatus(baseId, item.id, 'failed', 0, errorMsg)
      throw err
    } finally {
      release()
    }
  }

  private updateItemStatus(
    baseId: string,
    itemId: string,
    status: ItemStatus,
    progress: number,
    error?: string
  ): void {
    const bases = this.store.get('bases') ?? []
    const kbIdx = bases.findIndex((b) => b.id === baseId)
    if (kbIdx === -1) return

    const itemIdx = bases[kbIdx].items.findIndex((i) => i.id === itemId)
    if (itemIdx === -1) return

    bases[kbIdx].items[itemIdx].status = status
    bases[kbIdx].items[itemIdx].progress = progress
    if (error !== undefined) bases[kbIdx].items[itemIdx].error = error
    bases[kbIdx].items[itemIdx].updated_at = new Date().toISOString()

    this.store.set('bases', bases)

    // Notify renderer of progress
    const win = BrowserWindow.getAllWindows()[0]
    if (win) {
      win.webContents.send('kb:itemProgress', {
        baseId,
        itemId,
        status,
        progress,
        error
      })
    }
  }

  private async embedText(
    baseId: string,
    text: string
  ): Promise<Float32Array | null> {
    const bases = this.store.get('bases') ?? []
    const kb = bases.find((b) => b.id === baseId)
    if (!kb) return null

    const { ProviderService } = await import('./ProviderService')
    const providerService = ProviderService.getInstance()

    const providerId = kb.model.provider
    const provider = providerService.getProviderWithKey(providerId)
    if (!provider) {
      throw new Error(`Provider not found for embedding: ${providerId}`)
    }

    const apiKey = providerService.decryptKey(provider.apiKey)
    const baseURL = this.getEmbeddingBaseURL(provider)

    const { createOpenAI } = await import('@ai-sdk/openai')
    const { embedMany } = await import('ai')

    const openai = createOpenAI({
      apiKey,
      baseURL
    })

    const embeddingModel = openai.embedding(kb.model.id, {
      dimensions: kb.dimensions
    })

    const { embeddings } = await embedMany({
      model: embeddingModel,
      values: [text]
    })

    if (embeddings.length === 0) return null
    return new Float32Array(embeddings[0])
  }

  private getEmbeddingBaseURL(provider: { type: string; apiHost: string }): string {
    const url = provider.apiHost.replace(/\/+$/, '')
    // Apply same URL transform rules as AICoreService
    const { URL_TRANSFORM_RULES } = require('@shared/types/provider')
    const transform = URL_TRANSFORM_RULES[provider.type]
    const transformed: string = transform ? transform(url) : url

    if (
      (provider.type === 'openai' || provider.type === 'new-api' || provider.type === 'gateway') &&
      !transformed.endsWith('/v1') &&
      !transformed.includes('/v1/')
    ) {
      return `${transformed}/v1`
    }
    return transformed
  }

  private cleanupFiles(kbId: string): void {
    const dir = join(this.dataDir, 'files', kbId)
    if (existsSync(dir)) {
      try {
        const files = readdirSync(dir)
        for (const f of files) {
          unlinkSync(join(dir, f))
        }
      } catch (err) {
        logger.warn(`[KnowledgeService] Failed to cleanup files for ${kbId}:`, err)
      }
    }
  }
}
