// KnowledgeDeferredDelete — Persistent pending deletion tracking (F004)

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { withContext } from '../logger'

const log = withContext('knowledge:deferred-delete')

export interface PendingDeletion {
  id: string
  type: 'base' | 'item'
  baseId?: string
  paths: string[]
  createdAt: number
}

class KnowledgeDeferredDelete {
  private filePath: string
  private pending: PendingDeletion[] = []

  constructor(basePath: string) {
    this.filePath = join(basePath, 'knowledge', '_pending_deletions.json')
    this.load()
  }

  addPending(entry: { id: string; type: 'base' | 'item'; baseId?: string; paths: string[] }): void {
    this.pending.push({
      ...entry,
      createdAt: Date.now()
    })
    this.save()
    log.debug(`Added pending deletion: ${entry.type} ${entry.id}`)
  }

  removePending(id: string): void {
    this.pending = this.pending.filter((e) => e.id !== id)
    this.save()
  }

  getPending(): PendingDeletion[] {
    return [...this.pending]
  }

  async retryAll(deleteFn: (entry: PendingDeletion) => Promise<boolean>): Promise<void> {
    const remaining: PendingDeletion[] = []

    for (const entry of this.pending) {
      try {
        const success = await deleteFn(entry)
        if (success) {
          log.debug(`Successfully retried deletion: ${entry.type} ${entry.id}`)
        } else {
          remaining.push(entry)
        }
      } catch (err) {
        log.warn(`Retry failed for ${entry.type} ${entry.id}: ${(err as Error).message}`)
        remaining.push(entry)
      }
    }

    this.pending = remaining
    this.save()
  }

  private load(): void {
    try {
      if (existsSync(this.filePath)) {
        const raw = readFileSync(this.filePath, 'utf-8')
        this.pending = JSON.parse(raw)
      }
    } catch (err) {
      log.warn(`Failed to load pending deletions: ${(err as Error).message}`)
      this.pending = []
    }
  }

  private save(): void {
    try {
      const dir = dirname(this.filePath)
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
      writeFileSync(this.filePath, JSON.stringify(this.pending, null, 2))
    } catch (err) {
      log.warn(`Failed to save pending deletions: ${(err as Error).message}`)
    }
  }
}

export const createDeferredDelete = (basePath: string) => new KnowledgeDeferredDelete(basePath)

export { KnowledgeDeferredDelete }
