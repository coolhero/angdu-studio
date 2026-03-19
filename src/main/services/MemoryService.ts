import { app, BrowserWindow } from 'electron'
import { join } from 'node:path'
import { mkdirSync } from 'node:fs'
import { createHash, randomUUID } from 'node:crypto'
import Database from 'better-sqlite3'
import type {
  MemoryItem,
  MemoryConfig,
  MemoryHistoryItem,
  MemoryHistoryOperation
} from '@shared/types/knowledge'
import type { ChatMessage } from '@shared/types/ai-core'
import type { Model } from '@shared/types/provider'
import { logger } from './LoggerService'
import { ProviderService } from './ProviderService'
import { AICoreService } from './AICoreService'

// --- Constants ---

const DEFAULT_FACT_EXTRACTION_PROMPT =
  'Extract key facts, preferences, and personal information from this conversation. Return as a JSON array of fact strings.'

const DEFAULT_PAGE_SIZE = 20
const DEFAULT_SEARCH_LIMIT = 10
const COSINE_THRESHOLD = 0.3

// --- MemoryService ---

export class MemoryService {
  private static instance: MemoryService
  private db: Database.Database | null = null

  static getInstance(): MemoryService {
    if (!MemoryService.instance) {
      MemoryService.instance = new MemoryService()
    }
    return MemoryService.instance
  }

  initialize(): void {
    const dir = join(app.getPath('userData'), 'knowledge')
    mkdirSync(dir, { recursive: true })

    const dbPath = join(dir, 'memory.db')
    this.db = new Database(dbPath)
    this.db.pragma('journal_mode = WAL')

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memory_items (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        content TEXT NOT NULL,
        hash TEXT NOT NULL,
        embedding BLOB,
        metadata TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_memory_items_userId ON memory_items(userId);
      CREATE INDEX IF NOT EXISTS idx_memory_items_hash ON memory_items(hash);

      CREATE TABLE IF NOT EXISTS memory_history (
        id TEXT PRIMARY KEY,
        memoryId TEXT NOT NULL,
        operation TEXT NOT NULL,
        previousContent TEXT,
        newContent TEXT,
        timestamp TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_memory_history_memoryId ON memory_history(memoryId);

      CREATE TABLE IF NOT EXISTS memory_config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `)

    logger.info('[MemoryService] Initialized')
  }

  private getDb(): Database.Database {
    if (!this.db) {
      throw new Error('[MemoryService] Not initialized. Call initialize() first.')
    }
    return this.db
  }

  // --- CRUD ---

  list(
    userId: string,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    search?: string
  ): { items: MemoryItem[]; total: number } {
    const db = this.getDb()
    const offset = (page - 1) * pageSize

    let whereClause = 'WHERE userId = ?'
    const params: unknown[] = [userId]

    if (search) {
      whereClause += ' AND content LIKE ?'
      params.push(`%${search}%`)
    }

    const countRow = db
      .prepare(`SELECT COUNT(*) as count FROM memory_items ${whereClause}`)
      .get(...params) as { count: number } | undefined
    const total = countRow?.count ?? 0

    const rows = db
      .prepare(
        `SELECT id, userId, content, hash, metadata, created_at, updated_at
         FROM memory_items ${whereClause}
         ORDER BY updated_at DESC
         LIMIT ? OFFSET ?`
      )
      .all(...params, pageSize, offset) as MemoryItemRow[]

    return {
      items: rows.map(rowToMemoryItem),
      total
    }
  }

  async add(
    userId: string,
    content: string,
    metadata?: Record<string, unknown>
  ): Promise<MemoryItem> {
    const db = this.getDb()
    const hash = generateHash(content)

    // Dedup check
    const existing = db
      .prepare('SELECT id FROM memory_items WHERE userId = ? AND hash = ?')
      .get(userId, hash) as { id: string } | undefined

    if (existing) {
      const item = this.get(existing.id)
      if (item) return item.memory
      // If get() fails somehow, fall through to insert
    }

    const id = randomUUID()
    const now = new Date().toISOString()
    const metadataJson = JSON.stringify(metadata ?? {})

    // Generate embedding (best effort)
    let embeddingBuf: Buffer | null = null
    try {
      const embedding = await this.generateEmbedding(content)
      if (embedding) {
        embeddingBuf = float32ArrayToBuffer(new Float32Array(embedding))
      }
    } catch (err) {
      logger.warn('[MemoryService] Embedding generation failed', err)
    }

    db.prepare(
      `INSERT INTO memory_items (id, userId, content, hash, embedding, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, userId, content, hash, embeddingBuf, metadataJson, now, now)

    // Create ADD history
    this.addHistory(id, 'ADD', undefined, content)

    return {
      id,
      userId,
      content,
      hash,
      metadata: metadata ?? {},
      created_at: now,
      updated_at: now
    }
  }

  async update(id: string, content: string): Promise<MemoryItem | null> {
    const db = this.getDb()

    const existing = db
      .prepare('SELECT * FROM memory_items WHERE id = ?')
      .get(id) as MemoryItemRow | undefined

    if (!existing) return null

    const hash = generateHash(content)
    const now = new Date().toISOString()

    // Re-generate embedding
    let embeddingBuf: Buffer | null = null
    try {
      const embedding = await this.generateEmbedding(content)
      if (embedding) {
        embeddingBuf = float32ArrayToBuffer(new Float32Array(embedding))
      }
    } catch (err) {
      logger.warn('[MemoryService] Embedding re-generation failed', err)
    }

    db.prepare(
      `UPDATE memory_items SET content = ?, hash = ?, embedding = ?, updated_at = ? WHERE id = ?`
    ).run(content, hash, embeddingBuf, now, id)

    // Create UPDATE history
    this.addHistory(id, 'UPDATE', existing.content, content)

    return {
      id,
      userId: existing.userId,
      content,
      hash,
      metadata: parseJson(existing.metadata),
      created_at: existing.created_at,
      updated_at: now
    }
  }

  delete(id: string): void {
    const db = this.getDb()

    const existing = db
      .prepare('SELECT content FROM memory_items WHERE id = ?')
      .get(id) as { content: string } | undefined

    if (existing) {
      this.addHistory(id, 'DELETE', existing.content, undefined)
    }

    db.prepare('DELETE FROM memory_items WHERE id = ?').run(id)
  }

  get(id: string): { memory: MemoryItem; history: MemoryHistoryItem[] } | null {
    const db = this.getDb()

    const row = db
      .prepare(
        `SELECT id, userId, content, hash, metadata, created_at, updated_at
         FROM memory_items WHERE id = ?`
      )
      .get(id) as MemoryItemRow | undefined

    if (!row) return null

    const historyRows = db
      .prepare(
        `SELECT id, memoryId, operation, previousContent, newContent, timestamp
         FROM memory_history WHERE memoryId = ? ORDER BY timestamp DESC`
      )
      .all(id) as MemoryHistoryRow[]

    return {
      memory: rowToMemoryItem(row),
      history: historyRows.map(rowToHistoryItem)
    }
  }

  async search(
    userId: string,
    query: string,
    limit = DEFAULT_SEARCH_LIMIT
  ): Promise<MemoryItem[]> {
    const db = this.getDb()

    // Generate query embedding
    let queryEmbedding: number[] | null = null
    try {
      queryEmbedding = await this.generateEmbedding(query)
    } catch (err) {
      logger.warn('[MemoryService] Query embedding failed, falling back to text search', err)
    }

    if (queryEmbedding) {
      return this.vectorSearch(userId, queryEmbedding, limit)
    }

    // Fallback: text search
    const rows = db
      .prepare(
        `SELECT id, userId, content, hash, metadata, created_at, updated_at
         FROM memory_items
         WHERE userId = ? AND content LIKE ?
         ORDER BY updated_at DESC
         LIMIT ?`
      )
      .all(userId, `%${query}%`, limit) as MemoryItemRow[]

    return rows.map(rowToMemoryItem)
  }

  async searchRelevant(
    userId: string,
    query: string,
    limit = DEFAULT_SEARCH_LIMIT
  ): Promise<MemoryItem[]> {
    // Optimized alias for AI tool context — same as search
    return this.search(userId, query, limit)
  }

  deleteAllForUser(userId: string): void {
    const db = this.getDb()

    // Get all memory IDs for this user
    const ids = db
      .prepare('SELECT id FROM memory_items WHERE userId = ?')
      .all(userId) as Array<{ id: string }>

    if (ids.length === 0) return

    const idList = ids.map((r) => r.id)
    const placeholders = idList.map(() => '?').join(',')

    db.prepare(`DELETE FROM memory_history WHERE memoryId IN (${placeholders})`).run(
      ...idList
    )
    db.prepare('DELETE FROM memory_items WHERE userId = ?').run(userId)

    logger.info(`[MemoryService] Deleted all memories for user ${userId} (${ids.length} items)`)
  }

  getUsersList(): Array<{ userId: string; count: number }> {
    const db = this.getDb()
    const rows = db
      .prepare(
        `SELECT userId, COUNT(*) as count FROM memory_items GROUP BY userId ORDER BY count DESC`
      )
      .all() as Array<{ userId: string; count: number }>
    return rows
  }

  async extractFacts(
    userId: string,
    messages: Array<{ role: string; content: string }>,
    config?: MemoryConfig
  ): Promise<MemoryItem[]> {
    const prompt = config?.customFactExtractionPrompt ?? DEFAULT_FACT_EXTRACTION_PROMPT

    // Find an active provider/model
    const { provider, apiKey, model } = this.resolveModel(config?.llmModel)

    const chatMessages: ChatMessage[] = [
      { role: 'system', content: prompt },
      ...messages.map(
        (m) =>
          ({
            role: m.role as 'user' | 'assistant',
            content: m.content
          }) satisfies ChatMessage
      )
    ]

    // Use AI SDK generateText directly
    let factsText = ''
    try {
      factsText = await this.callLLM(provider, apiKey, model, chatMessages)
    } catch (err) {
      logger.error('[MemoryService] Fact extraction LLM call failed', err)
      return []
    }

    // Parse JSON array of fact strings
    let facts: string[] = []
    try {
      const parsed: unknown = JSON.parse(factsText.trim())
      if (Array.isArray(parsed)) {
        facts = parsed.filter((f): f is string => typeof f === 'string')
      }
    } catch {
      // Try line-by-line fallback
      facts = factsText
        .split('\n')
        .map((line) => line.replace(/^[-*•]\s*/, '').trim())
        .filter((line) => line.length > 0)
    }

    // Store each fact as a memory
    const items: MemoryItem[] = []
    for (const fact of facts) {
      try {
        const item = await this.add(userId, fact, { source: 'extraction' })
        items.push(item)
      } catch (err) {
        logger.warn('[MemoryService] Failed to add extracted fact', err)
      }
    }

    logger.info(`[MemoryService] Extracted ${items.length} facts for user ${userId}`)
    return items
  }

  // --- Config ---

  getConfig(): MemoryConfig {
    const db = this.getDb()
    const row = db
      .prepare("SELECT value FROM memory_config WHERE key = 'config'")
      .get() as { value: string } | undefined

    if (row) {
      try {
        return JSON.parse(row.value) as MemoryConfig
      } catch {
        // fall through to default
      }
    }

    return { enabled: false }
  }

  updateConfig(partial: Partial<MemoryConfig>): MemoryConfig {
    const current = this.getConfig()
    const merged: MemoryConfig = { ...current, ...partial }

    const db = this.getDb()
    db.prepare(
      `INSERT OR REPLACE INTO memory_config (key, value) VALUES ('config', ?)`
    ).run(JSON.stringify(merged))

    return merged
  }

  // --- Private helpers ---

  private addHistory(
    memoryId: string,
    operation: MemoryHistoryOperation,
    previousContent: string | undefined,
    newContent: string | undefined
  ): void {
    const db = this.getDb()
    const id = randomUUID()
    const timestamp = new Date().toISOString()

    db.prepare(
      `INSERT INTO memory_history (id, memoryId, operation, previousContent, newContent, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, memoryId, operation, previousContent ?? null, newContent ?? null, timestamp)
  }

  private vectorSearch(
    userId: string,
    queryEmbedding: number[],
    limit: number
  ): MemoryItem[] {
    const db = this.getDb()

    const rows = db
      .prepare(
        `SELECT id, userId, content, hash, embedding, metadata, created_at, updated_at
         FROM memory_items
         WHERE userId = ? AND embedding IS NOT NULL`
      )
      .all(userId) as Array<MemoryItemRow & { embedding: Buffer | null }>

    const queryVec = new Float32Array(queryEmbedding)
    const scored: Array<MemoryItem & { score: number }> = []

    for (const row of rows) {
      if (!row.embedding) continue

      const storedVec = bufferToFloat32Array(row.embedding)
      const similarity = cosineSimilarity(queryVec, storedVec)

      if (similarity >= COSINE_THRESHOLD) {
        scored.push({
          ...rowToMemoryItem(row),
          score: similarity
        })
      }
    }

    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, limit)
  }

  private async generateEmbedding(text: string): Promise<number[] | null> {
    const config = this.getConfig()
    if (!config.embeddingModel) return null

    try {
      const { provider, apiKey, model } = this.resolveModel(config.embeddingModel)
      const { embed } = await import('ai')

      const sdkModel = await this.createEmbeddingModel(provider, apiKey, model)
      const result = await embed({
        model: sdkModel,
        value: text
      })

      return Array.from(result.embedding)
    } catch (err) {
      logger.warn('[MemoryService] Embedding generation failed', err)
      return null
    }
  }

  private async createEmbeddingModel(
    provider: import('@shared/types/provider').Provider,
    apiKey: string,
    model: Model
  ) {
    const baseURL = provider.apiHost ?? ''

    switch (provider.type) {
      case 'openai':
      case 'new-api':
      case 'gateway':
      case 'ollama': {
        const { createOpenAI } = await import('@ai-sdk/openai')
        return createOpenAI({ apiKey, baseURL }).embedding(model.id)
      }
      case 'gemini': {
        const { createGoogleGenerativeAI } = await import('@ai-sdk/google')
        return createGoogleGenerativeAI({ apiKey }).textEmbeddingModel(model.id)
      }
      case 'mistral': {
        const { createMistral } = await import('@ai-sdk/mistral')
        return createMistral({ apiKey, baseURL }).textEmbeddingModel(model.id)
      }
      default: {
        const { createOpenAI } = await import('@ai-sdk/openai')
        return createOpenAI({ apiKey, baseURL }).embedding(model.id)
      }
    }
  }

  private resolveModel(configModel?: Model): {
    provider: import('@shared/types/provider').Provider
    apiKey: string
    model: Model
  } {
    const providerService = ProviderService.getInstance()

    if (configModel) {
      const prov = providerService.getProviderWithKey(configModel.providerId)
      if (prov) {
        return {
          provider: prov,
          apiKey: providerService.decryptKey(prov.apiKey),
          model: configModel
        }
      }
    }

    // Fallback: find any active provider with an enabled model
    const providers = providerService.getProviders()
    const activeProvider = providers.find((p) => p.enabled && p.models.some((m) => m.enabled))
    if (!activeProvider) {
      throw new Error('[MemoryService] No active provider available')
    }

    const activeModel = activeProvider.models.find((m) => m.enabled)
    if (!activeModel) {
      throw new Error('[MemoryService] No enabled model available')
    }

    const realProvider = providerService.getProviderWithKey(activeProvider.id)
    if (!realProvider) {
      throw new Error('[MemoryService] Provider not found')
    }

    return {
      provider: realProvider,
      apiKey: providerService.decryptKey(realProvider.apiKey),
      model: activeModel
    }
  }

  private async callLLM(
    provider: import('@shared/types/provider').Provider,
    apiKey: string,
    model: Model,
    messages: ChatMessage[]
  ): Promise<string> {
    const window = BrowserWindow.getAllWindows()[0]
    if (!window) {
      throw new Error('[MemoryService] No browser window available')
    }

    const requestId = `memory-extract-${randomUUID()}`
    const aiCore = AICoreService.getInstance()
    let result = ''

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Memory fact extraction timed out'))
      }, 30000)

      const cleanup = () => {
        clearTimeout(timeout)
      }

      const chunkHandler = (
        _event: Electron.Event,
        payload: { requestId: string; chunk: { content: string } }
      ) => {
        if (payload.requestId === requestId) {
          result += payload.chunk.content
        }
      }

      const completeHandler = (
        _event: Electron.Event,
        payload: { requestId: string }
      ) => {
        if (payload.requestId === requestId) {
          cleanup()
          window.webContents.ipc.removeListener('ai:stream-chunk', chunkHandler)
          window.webContents.ipc.removeListener('ai:stream-complete', completeHandler)
          window.webContents.ipc.removeListener('ai:stream-error', errorHandler)
          resolve()
        }
      }

      const errorHandler = (
        _event: Electron.Event,
        payload: { requestId: string; error: { message: string } }
      ) => {
        if (payload.requestId === requestId) {
          cleanup()
          window.webContents.ipc.removeListener('ai:stream-chunk', chunkHandler)
          window.webContents.ipc.removeListener('ai:stream-complete', completeHandler)
          window.webContents.ipc.removeListener('ai:stream-error', errorHandler)
          reject(new Error(payload.error.message))
        }
      }

      window.webContents.ipc.on('ai:stream-chunk', chunkHandler)
      window.webContents.ipc.on('ai:stream-complete', completeHandler)
      window.webContents.ipc.on('ai:stream-error', errorHandler)

      aiCore.chat(provider, apiKey, model, messages, { requestId, stream: true }, window)
    })

    return result
  }

  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
      logger.info('[MemoryService] Closed')
    }
  }
}

// --- Row types ---

interface MemoryItemRow {
  id: string
  userId: string
  content: string
  hash: string
  metadata: string
  created_at: string
  updated_at: string
}

interface MemoryHistoryRow {
  id: string
  memoryId: string
  operation: string
  previousContent: string | null
  newContent: string | null
  timestamp: string
}

// --- Utility functions ---

function rowToMemoryItem(row: MemoryItemRow): MemoryItem {
  return {
    id: row.id,
    userId: row.userId,
    content: row.content,
    hash: row.hash,
    metadata: parseJson(row.metadata),
    created_at: row.created_at,
    updated_at: row.updated_at
  }
}

function rowToHistoryItem(row: MemoryHistoryRow): MemoryHistoryItem {
  return {
    id: row.id,
    memoryId: row.memoryId,
    operation: row.operation as MemoryHistoryItem['operation'],
    previousContent: row.previousContent ?? undefined,
    newContent: row.newContent ?? undefined,
    timestamp: row.timestamp
  }
}

function generateHash(content: string): string {
  return createHash('sha256').update(content).digest('hex')
}

function parseJson(json: string): Record<string, unknown> {
  try {
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return {}
  }
}

function float32ArrayToBuffer(arr: Float32Array): Buffer {
  return Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength)
}

function bufferToFloat32Array(buf: Buffer): Float32Array {
  return new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4)
}

function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) return 0

  let dot = 0
  let magA = 0
  let magB = 0

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }

  const magnitude = Math.sqrt(magA) * Math.sqrt(magB)
  if (magnitude === 0) return 0

  return dot / magnitude
}

export const memoryService = MemoryService.getInstance()
