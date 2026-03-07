// KnowledgeQueueManager — Queue-based processing with backpressure (F004)

import type { KnowledgeItem } from '@shared/types'

const MAX_CONCURRENT = 30
const MAX_WORKLOAD_BYTES = 80 * 1024 * 1024 // 80 MB

// Workload estimation constants (bytes)
const URL_ESTIMATE = 2 * 1024 * 1024 // 2 MB
const SITEMAP_ESTIMATE = 20 * 1024 * 1024 // 20 MB

interface ActiveEntry {
  itemId: string
  workload: number
}

class KnowledgeQueueManager {
  private active = new Map<string, ActiveEntry>()
  private pending: KnowledgeItem[] = []

  /** Called when capacity frees up — set by orchestrator to trigger next item */
  onCapacityFreed: () => void = () => {}

  // ── Capacity checks ──

  canProcess(workload: number): boolean {
    return (
      this.active.size < MAX_CONCURRENT &&
      this.getActiveWorkload() + workload <= MAX_WORKLOAD_BYTES
    )
  }

  registerActive(itemId: string, workload: number): void {
    this.active.set(itemId, { itemId, workload })
  }

  releaseActive(itemId: string): void {
    this.active.delete(itemId)
    this.onCapacityFreed()
  }

  // ── Pending queue ──

  enqueue(item: KnowledgeItem): void {
    this.pending.push(item)
  }

  dequeue(): KnowledgeItem | undefined {
    return this.pending.shift()
  }

  removePending(itemId: string): void {
    this.pending = this.pending.filter((i) => i.id !== itemId)
  }

  // ── Workload estimation ──

  estimateWorkload(item: KnowledgeItem): number {
    switch (item.type) {
      case 'file':
      case 'video': {
        // content is FileMetadata for file/video — use actual size
        if (typeof item.content === 'object' && item.content !== null && 'size' in item.content) {
          return (item.content as { size: number }).size
        }
        return URL_ESTIMATE // fallback
      }
      case 'url':
        return URL_ESTIMATE
      case 'sitemap':
        return SITEMAP_ESTIMATE
      case 'note': {
        // content is string for notes — byte count
        if (typeof item.content === 'string') {
          return Buffer.byteLength(item.content, 'utf-8')
        }
        return 1024
      }
      case 'directory': {
        // content is FileMetadata (directory) — use size as aggregate estimate
        if (typeof item.content === 'object' && item.content !== null && 'size' in item.content) {
          return (item.content as { size: number }).size
        }
        return SITEMAP_ESTIMATE // directory could be large
      }
      default:
        return URL_ESTIMATE
    }
  }

  // ── State introspection ──

  getState(): { activeCount: number; activeWorkload: number; pendingCount: number } {
    return {
      activeCount: this.active.size,
      activeWorkload: this.getActiveWorkload(),
      pendingCount: this.pending.length
    }
  }

  private getActiveWorkload(): number {
    let total = 0
    for (const entry of this.active.values()) {
      total += entry.workload
    }
    return total
  }
}

export const knowledgeQueueManager = new KnowledgeQueueManager()
