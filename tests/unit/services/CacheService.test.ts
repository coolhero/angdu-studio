import { describe, it, expect } from 'vitest'
import { CacheService } from '../../../src/main/services/CacheService'

describe('CacheService', () => {
  it('should create a singleton instance', () => {
    const a = CacheService.getInstance(10)
    const b = CacheService.getInstance()
    expect(a).toBe(b)
  })

  it('should get and set values', () => {
    const cache = CacheService.getInstance()
    cache.set('key1', 'value1')
    expect(cache.get('key1')).toBe('value1')
  })

  it('should return undefined for missing keys', () => {
    const cache = CacheService.getInstance()
    expect(cache.get('nonexistent')).toBeUndefined()
  })

  it('should evict LRU item when capacity exceeded', () => {
    // Use the singleton, clear it, and fill to capacity
    const cache = CacheService.getInstance()
    cache.clear()
    // Fill 10 entries (capacity is 10 from first getInstance call)
    for (let i = 0; i < 10; i++) {
      cache.set(`item${i}`, i)
    }
    // Access item0 to make it recently used
    cache.get('item0')
    // Adding item10 should evict item1 (least recently used after item0 was accessed)
    cache.set('item10', 10)
    expect(cache.get('item0')).toBe(0)
    expect(cache.get('item1')).toBeUndefined()
    expect(cache.get('item10')).toBe(10)
  })

  it('should delete entries', () => {
    const cache = CacheService.getInstance()
    cache.set('delkey', 'value')
    cache.delete('delkey')
    expect(cache.get('delkey')).toBeUndefined()
  })

  it('should clear all entries', () => {
    const cache = CacheService.getInstance()
    cache.set('a', 1)
    cache.set('b', 2)
    cache.clear()
    expect(cache.size).toBe(0)
  })
})
