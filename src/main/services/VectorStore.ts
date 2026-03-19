import { app } from 'electron'
import { join } from 'node:path'
import { mkdirSync } from 'node:fs'
import Database from 'better-sqlite3'
import type { VectorRecord } from '@shared/types/knowledge'
import { logger } from './LoggerService'

class VectorStore {
  private static instance: VectorStore | null = null
  private db: Database.Database | null = null

  static getInstance(): VectorStore {
    if (!VectorStore.instance) {
      VectorStore.instance = new VectorStore()
    }
    return VectorStore.instance
  }

  initialize(): void {
    const dir = join(app.getPath('userData'), 'knowledge')
    mkdirSync(dir, { recursive: true })

    const dbPath = join(dir, 'vectors.db')
    this.db = new Database(dbPath)
    this.db.pragma('journal_mode = WAL')

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS vectors (
        id TEXT PRIMARY KEY,
        kb_id TEXT NOT NULL,
        item_id TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata TEXT NOT NULL DEFAULT '{}',
        embedding BLOB NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_vectors_kb_id ON vectors(kb_id);
    `)

    logger.info('[VectorStore] Initialized')
  }

  private getDb(): Database.Database {
    if (!this.db) {
      throw new Error('[VectorStore] Not initialized. Call initialize() first.')
    }
    return this.db
  }

  insert(record: VectorRecord): void {
    const db = this.getDb()
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO vectors (id, kb_id, item_id, content, metadata, embedding, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      record.id,
      record.kb_id,
      record.item_id,
      record.content,
      record.metadata,
      record.embedding,
      record.created_at
    )
  }

  search(
    kbId: string,
    queryEmbedding: Float32Array,
    limit: number,
    threshold: number
  ): Array<VectorRecord & { similarity: number }> {
    const db = this.getDb()
    const rows = db
      .prepare('SELECT * FROM vectors WHERE kb_id = ?')
      .all(kbId) as Array<{
      id: string
      kb_id: string
      item_id: string
      content: string
      metadata: string
      embedding: Buffer
      created_at: number
    }>

    const results: Array<VectorRecord & { similarity: number }> = []

    for (const row of rows) {
      const storedEmbedding = bufferToFloat32Array(row.embedding)
      const similarity = cosineSimilarity(queryEmbedding, storedEmbedding)

      if (similarity >= threshold) {
        results.push({
          ...row,
          similarity
        })
      }
    }

    results.sort((a, b) => b.similarity - a.similarity)
    return results.slice(0, limit)
  }

  deleteByKbId(kbId: string): void {
    const db = this.getDb()
    db.prepare('DELETE FROM vectors WHERE kb_id = ?').run(kbId)
    logger.info(`[VectorStore] Deleted vectors for kb ${kbId}`)
  }

  deleteByItemId(itemId: string): void {
    const db = this.getDb()
    db.prepare('DELETE FROM vectors WHERE item_id = ?').run(itemId)
    logger.info(`[VectorStore] Deleted vectors for item ${itemId}`)
  }

  countByKbId(kbId: string): number {
    const db = this.getDb()
    const result = db
      .prepare('SELECT COUNT(*) as count FROM vectors WHERE kb_id = ?')
      .get(kbId) as { count: number }
    return result.count
  }

  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
      logger.info('[VectorStore] Closed')
    }
  }
}

// --- Utility functions ---

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

export { float32ArrayToBuffer, bufferToFloat32Array, cosineSimilarity }
export const vectorStore = VectorStore.getInstance()
