export class CacheService {
  private static instance: CacheService
  private cache: Map<string, { value: unknown; accessOrder: number }> = new Map()
  private capacity: number
  private accessCounter = 0

  private constructor(capacity = 100) {
    this.capacity = capacity
  }

  static getInstance(capacity?: number): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService(capacity)
    }
    return CacheService.instance
  }

  get<T = unknown>(key: string): T | undefined {
    const entry = this.cache.get(key)
    if (entry) {
      entry.accessOrder = ++this.accessCounter
      return entry.value as T
    }
    return undefined
  }

  set(key: string, value: unknown): void {
    if (this.cache.size >= this.capacity && !this.cache.has(key)) {
      this.evictLRU()
    }
    this.cache.set(key, { value, accessOrder: ++this.accessCounter })
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  get size(): number {
    return this.cache.size
  }

  private evictLRU(): void {
    let oldestKey: string | null = null
    let oldestOrder = Infinity

    for (const [key, entry] of this.cache) {
      if (entry.accessOrder < oldestOrder) {
        oldestOrder = entry.accessOrder
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }
}
