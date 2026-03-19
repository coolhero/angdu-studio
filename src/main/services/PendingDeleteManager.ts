import { app } from 'electron'
import { join } from 'node:path'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { logger } from './LoggerService'

class PendingDeleteManager {
  private static instance: PendingDeleteManager | null = null
  private filePath: string = ''
  private pending: string[] = []

  static getInstance(): PendingDeleteManager {
    if (!PendingDeleteManager.instance) {
      PendingDeleteManager.instance = new PendingDeleteManager()
    }
    return PendingDeleteManager.instance
  }

  initialize(): void {
    const dir = join(app.getPath('userData'), 'knowledge')
    mkdirSync(dir, { recursive: true })

    this.filePath = join(dir, 'pending_deletes.json')
    this.load()
    logger.info(`[PendingDeleteManager] Initialized with ${this.pending.length} pending items`)
  }

  private load(): void {
    try {
      if (existsSync(this.filePath)) {
        const raw = readFileSync(this.filePath, 'utf-8')
        const parsed: unknown = JSON.parse(raw)
        this.pending = Array.isArray(parsed) ? (parsed as string[]) : []
      } else {
        this.pending = []
      }
    } catch (err) {
      logger.warn('[PendingDeleteManager] Failed to load pending deletes, starting fresh', err)
      this.pending = []
    }
  }

  private save(): void {
    try {
      writeFileSync(this.filePath, JSON.stringify(this.pending, null, 2), 'utf-8')
    } catch (err) {
      logger.warn('[PendingDeleteManager] Failed to persist pending deletes', err)
    }
  }

  addPending(kbId: string): void {
    if (!this.pending.includes(kbId)) {
      this.pending.push(kbId)
      this.save()
      logger.info(`[PendingDeleteManager] Added pending delete: ${kbId}`)
    }
  }

  removePending(kbId: string): void {
    const index = this.pending.indexOf(kbId)
    if (index !== -1) {
      this.pending.splice(index, 1)
      this.save()
      logger.info(`[PendingDeleteManager] Removed pending delete: ${kbId}`)
    }
  }

  getPending(): string[] {
    return [...this.pending]
  }

  async retryAll(deleteFn: (kbId: string) => Promise<void>): Promise<void> {
    const ids = [...this.pending]
    logger.info(`[PendingDeleteManager] Retrying ${ids.length} pending deletes`)

    for (const kbId of ids) {
      try {
        await deleteFn(kbId)
        this.removePending(kbId)
      } catch (err) {
        logger.warn(`[PendingDeleteManager] Retry failed for ${kbId}:`, err)
      }
    }
  }
}

export const pendingDeleteManager = PendingDeleteManager.getInstance()
