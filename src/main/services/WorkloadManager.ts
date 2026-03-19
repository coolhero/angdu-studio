import { logger } from './LoggerService'

const MAX_BYTES = 80 * 1024 * 1024 // 80 MB
const MAX_ITEMS = 30

interface QueueEntry {
  sizeBytes: number
  resolve: (release: () => void) => void
}

class WorkloadManager {
  private static instance: WorkloadManager | null = null

  private currentBytes = 0
  private processingCount = 0
  private queue: QueueEntry[] = []

  static getInstance(): WorkloadManager {
    if (!WorkloadManager.instance) {
      WorkloadManager.instance = new WorkloadManager()
    }
    return WorkloadManager.instance
  }

  /**
   * Check if a workload of `sizeBytes` can be processed right now.
   */
  canProcess(sizeBytes: number): boolean {
    return (
      this.currentBytes + sizeBytes <= MAX_BYTES &&
      this.processingCount < MAX_ITEMS
    )
  }

  /**
   * Acquire capacity for processing. Returns a release function.
   * If at capacity, the call is queued and resolves when capacity is available.
   */
  acquire(sizeBytes: number): Promise<() => void> {
    if (this.canProcess(sizeBytes)) {
      return Promise.resolve(this.doAcquire(sizeBytes))
    }

    // Queue until capacity frees up
    return new Promise<() => void>((resolve) => {
      this.queue.push({ sizeBytes, resolve })
      logger.info(
        `[WorkloadManager] Queued item (${sizeBytes} bytes). Queue length: ${this.queue.length}`
      )
    })
  }

  private doAcquire(sizeBytes: number): () => void {
    this.currentBytes += sizeBytes
    this.processingCount += 1

    logger.info(
      `[WorkloadManager] Acquired: ${sizeBytes} bytes. Active: ${this.processingCount}/${MAX_ITEMS}, Bytes: ${this.currentBytes}/${MAX_BYTES}`
    )

    let released = false
    return () => {
      if (released) return
      released = true

      this.currentBytes -= sizeBytes
      this.processingCount -= 1

      logger.info(
        `[WorkloadManager] Released: ${sizeBytes} bytes. Active: ${this.processingCount}/${MAX_ITEMS}, Bytes: ${this.currentBytes}/${MAX_BYTES}`
      )

      this.processNext()
    }
  }

  /**
   * Process the next queued item if capacity is available.
   */
  private processNext(): void {
    while (this.queue.length > 0) {
      const next = this.queue[0]
      if (!this.canProcess(next.sizeBytes)) break

      this.queue.shift()
      const release = this.doAcquire(next.sizeBytes)
      next.resolve(release)
    }
  }

  /**
   * Get current workload stats.
   */
  getStats(): { currentBytes: number; processingCount: number; queueLength: number } {
    return {
      currentBytes: this.currentBytes,
      processingCount: this.processingCount,
      queueLength: this.queue.length
    }
  }
}

export const workloadManager = WorkloadManager.getInstance()
