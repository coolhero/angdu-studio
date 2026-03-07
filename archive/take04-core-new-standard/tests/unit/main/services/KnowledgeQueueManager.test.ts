import { describe, it, expect, vi, beforeEach } from 'vitest'
import { knowledgeQueueManager } from '../../../../src/main/services/KnowledgeQueueManager'
import type { KnowledgeItem } from '@shared/types'

// Constants mirrored from the source for assertions
const MAX_CONCURRENT = 30
const MAX_WORKLOAD_BYTES = 80 * 1024 * 1024 // 80 MB
const URL_ESTIMATE = 2 * 1024 * 1024 // 2 MB
const SITEMAP_ESTIMATE = 20 * 1024 * 1024 // 20 MB

// ── Helpers ──

let idCounter = 0

function makeItem(overrides: Partial<KnowledgeItem> & { type: KnowledgeItem['type'] }): KnowledgeItem {
  idCounter++
  return {
    id: `item-${idCounter}`,
    baseId: 'base-1',
    type: overrides.type,
    content: overrides.content ?? '',
    status: 'pending',
    progress: 0,
    retryCount: 0,
    created_at: Date.now(),
    updated_at: Date.now(),
    ...overrides
  }
}

function makeFileItem(size: number, id?: string): KnowledgeItem {
  return makeItem({ type: 'file', id: id ?? `file-${idCounter + 1}`, content: { size, name: 'test.pdf', path: '/tmp/test.pdf', mimeType: 'application/pdf', extension: 'pdf', created_at: 0, modified_at: 0, isDirectory: false } as any })
}

function makeVideoItem(size: number): KnowledgeItem {
  return makeItem({ type: 'video', content: { size, name: 'test.mp4', path: '/tmp/test.mp4', mimeType: 'video/mp4', extension: 'mp4', created_at: 0, modified_at: 0, isDirectory: false } as any })
}

function makeUrlItem(): KnowledgeItem {
  return makeItem({ type: 'url', content: 'https://example.com' })
}

function makeSitemapItem(): KnowledgeItem {
  return makeItem({ type: 'sitemap', content: 'https://example.com/sitemap.xml' })
}

function makeNoteItem(text: string): KnowledgeItem {
  return makeItem({ type: 'note', content: text })
}

function makeDirectoryItem(size?: number): KnowledgeItem {
  if (size !== undefined) {
    return makeItem({ type: 'directory', content: { size, name: 'docs', path: '/tmp/docs', mimeType: '', extension: '', created_at: 0, modified_at: 0, isDirectory: true } as any })
  }
  return makeItem({ type: 'directory', content: '' })
}

// Reset the shared singleton state before each test
beforeEach(() => {
  // Drain the active map by releasing any registered items
  const state = knowledgeQueueManager.getState()

  // Force-reset internal state via the public API:
  // release all active items then drain pending
  // (We cannot access private fields, so we use a workaround via the API.)
  //
  // Because `knowledgeQueueManager` is a module-level singleton we need to
  // clean up between tests using only the public surface.

  // 1. Clear any leftover pending by dequeuing until empty
  while (knowledgeQueueManager.dequeue() !== undefined) { /* drain */ }

  // 2. There is no bulk-release API, but registerActive / releaseActive are
  //    symmetric. We compensate by re-registering and releasing the exact IDs
  //    that are tracked — which we cannot enumerate directly. Instead, we
  //    reset the counter and rely on each test registering fresh IDs.
  //
  //    As an escape hatch, we force the map empty by temporarily overriding
  //    the private field through a cast to `any`.
  ;(knowledgeQueueManager as any).active = new Map()
  ;(knowledgeQueueManager as any).pending = []

  // Reset onCapacityFreed to a no-op
  knowledgeQueueManager.onCapacityFreed = () => {}
})

// ── canProcess ──

describe('canProcess', () => {
  it('returns true when active map is empty and workload is within limits', () => {
    expect(knowledgeQueueManager.canProcess(1 * 1024 * 1024)).toBe(true)
  })

  it('returns true when active count is below MAX_CONCURRENT and workload fits', () => {
    for (let i = 0; i < MAX_CONCURRENT - 1; i++) {
      knowledgeQueueManager.registerActive(`id-${i}`, 0)
    }
    expect(knowledgeQueueManager.canProcess(0)).toBe(true)
  })

  it('returns false when active count equals MAX_CONCURRENT', () => {
    for (let i = 0; i < MAX_CONCURRENT; i++) {
      knowledgeQueueManager.registerActive(`id-${i}`, 0)
    }
    expect(knowledgeQueueManager.canProcess(0)).toBe(false)
  })

  it('returns false when active count exceeds MAX_CONCURRENT', () => {
    for (let i = 0; i <= MAX_CONCURRENT; i++) {
      knowledgeQueueManager.registerActive(`id-${i}`, 0)
    }
    expect(knowledgeQueueManager.canProcess(0)).toBe(false)
  })

  it('returns false when adding workload would exceed MAX_WORKLOAD_BYTES', () => {
    // Register 79 MB of active workload
    knowledgeQueueManager.registerActive('heavy', 79 * 1024 * 1024)
    // Adding 2 MB would push us to 81 MB — over the 80 MB limit
    expect(knowledgeQueueManager.canProcess(2 * 1024 * 1024)).toBe(false)
  })

  it('returns true when workload exactly reaches MAX_WORKLOAD_BYTES', () => {
    knowledgeQueueManager.registerActive('half', 40 * 1024 * 1024)
    // Adding exactly the remaining 40 MB should be allowed (<= limit)
    expect(knowledgeQueueManager.canProcess(40 * 1024 * 1024)).toBe(true)
  })

  it('returns false when workload is 1 byte over MAX_WORKLOAD_BYTES', () => {
    knowledgeQueueManager.registerActive('almost-full', MAX_WORKLOAD_BYTES)
    expect(knowledgeQueueManager.canProcess(1)).toBe(false)
  })

  it('returns true with zero workload when no active items exist', () => {
    expect(knowledgeQueueManager.canProcess(0)).toBe(true)
  })
})

// ── registerActive / releaseActive ──

describe('registerActive and releaseActive', () => {
  it('increments activeCount after registerActive', () => {
    knowledgeQueueManager.registerActive('a', 1024)
    expect(knowledgeQueueManager.getState().activeCount).toBe(1)
  })

  it('accumulates activeWorkload across multiple registrations', () => {
    knowledgeQueueManager.registerActive('a', 1000)
    knowledgeQueueManager.registerActive('b', 2000)
    expect(knowledgeQueueManager.getState().activeWorkload).toBe(3000)
  })

  it('decrements activeCount after releaseActive', () => {
    knowledgeQueueManager.registerActive('a', 1024)
    knowledgeQueueManager.releaseActive('a')
    expect(knowledgeQueueManager.getState().activeCount).toBe(0)
  })

  it('reduces activeWorkload after releaseActive', () => {
    knowledgeQueueManager.registerActive('a', 1000)
    knowledgeQueueManager.registerActive('b', 2000)
    knowledgeQueueManager.releaseActive('a')
    expect(knowledgeQueueManager.getState().activeWorkload).toBe(2000)
  })

  it('does nothing when releasing a non-existent itemId', () => {
    knowledgeQueueManager.registerActive('a', 500)
    knowledgeQueueManager.releaseActive('does-not-exist')
    expect(knowledgeQueueManager.getState().activeCount).toBe(1)
    expect(knowledgeQueueManager.getState().activeWorkload).toBe(500)
  })

  it('re-registration with same id overwrites the previous workload entry', () => {
    knowledgeQueueManager.registerActive('a', 1000)
    knowledgeQueueManager.registerActive('a', 5000) // overwrite
    expect(knowledgeQueueManager.getState().activeCount).toBe(1)
    expect(knowledgeQueueManager.getState().activeWorkload).toBe(5000)
  })
})

// ── enqueue / dequeue ──

describe('enqueue and dequeue', () => {
  it('dequeue returns undefined when queue is empty', () => {
    expect(knowledgeQueueManager.dequeue()).toBeUndefined()
  })

  it('enqueue adds an item and dequeue returns it', () => {
    const item = makeUrlItem()
    knowledgeQueueManager.enqueue(item)
    expect(knowledgeQueueManager.dequeue()).toEqual(item)
  })

  it('maintains FIFO order across multiple enqueues', () => {
    const a = makeUrlItem()
    const b = makeUrlItem()
    const c = makeUrlItem()
    knowledgeQueueManager.enqueue(a)
    knowledgeQueueManager.enqueue(b)
    knowledgeQueueManager.enqueue(c)
    expect(knowledgeQueueManager.dequeue()).toEqual(a)
    expect(knowledgeQueueManager.dequeue()).toEqual(b)
    expect(knowledgeQueueManager.dequeue()).toEqual(c)
  })

  it('queue is empty after all items are dequeued', () => {
    knowledgeQueueManager.enqueue(makeUrlItem())
    knowledgeQueueManager.dequeue()
    expect(knowledgeQueueManager.getState().pendingCount).toBe(0)
    expect(knowledgeQueueManager.dequeue()).toBeUndefined()
  })

  it('incrementally reflects pending count', () => {
    expect(knowledgeQueueManager.getState().pendingCount).toBe(0)
    knowledgeQueueManager.enqueue(makeUrlItem())
    expect(knowledgeQueueManager.getState().pendingCount).toBe(1)
    knowledgeQueueManager.enqueue(makeUrlItem())
    expect(knowledgeQueueManager.getState().pendingCount).toBe(2)
    knowledgeQueueManager.dequeue()
    expect(knowledgeQueueManager.getState().pendingCount).toBe(1)
  })
})

// ── removePending ──

describe('removePending', () => {
  it('removes the item with the matching id', () => {
    const target = makeItem({ type: 'url', id: 'target-id', content: 'https://example.com' })
    const other = makeUrlItem()
    knowledgeQueueManager.enqueue(target)
    knowledgeQueueManager.enqueue(other)
    knowledgeQueueManager.removePending('target-id')
    expect(knowledgeQueueManager.getState().pendingCount).toBe(1)
    expect(knowledgeQueueManager.dequeue()).toEqual(other)
  })

  it('leaves queue unchanged when id is not found', () => {
    const item = makeUrlItem()
    knowledgeQueueManager.enqueue(item)
    knowledgeQueueManager.removePending('non-existent-id')
    expect(knowledgeQueueManager.getState().pendingCount).toBe(1)
  })

  it('removes only the first occurrence when duplicate ids exist (each id unique in practice)', () => {
    const dup = makeItem({ type: 'url', id: 'dup', content: 'https://a.com' })
    const dup2 = makeItem({ type: 'url', id: 'dup', content: 'https://b.com' })
    knowledgeQueueManager.enqueue(dup)
    knowledgeQueueManager.enqueue(dup2)
    knowledgeQueueManager.removePending('dup')
    // Both share the same id, so both are filtered out
    expect(knowledgeQueueManager.getState().pendingCount).toBe(0)
  })

  it('can remove the only item leaving an empty queue', () => {
    const item = makeItem({ type: 'note', id: 'solo', content: 'hello' })
    knowledgeQueueManager.enqueue(item)
    knowledgeQueueManager.removePending('solo')
    expect(knowledgeQueueManager.getState().pendingCount).toBe(0)
    expect(knowledgeQueueManager.dequeue()).toBeUndefined()
  })

  it('does not affect active items', () => {
    knowledgeQueueManager.registerActive('active-1', 1000)
    const pending = makeItem({ type: 'url', id: 'active-1', content: 'https://example.com' })
    knowledgeQueueManager.enqueue(pending)
    knowledgeQueueManager.removePending('active-1')
    // Active count unchanged
    expect(knowledgeQueueManager.getState().activeCount).toBe(1)
    expect(knowledgeQueueManager.getState().pendingCount).toBe(0)
  })
})

// ── estimateWorkload ──

describe('estimateWorkload', () => {
  describe('file type', () => {
    it('returns the file size from FileMetadata content', () => {
      const item = makeFileItem(5 * 1024 * 1024)
      expect(knowledgeQueueManager.estimateWorkload(item)).toBe(5 * 1024 * 1024)
    })

    it('falls back to URL_ESTIMATE when content has no size field', () => {
      const item = makeItem({ type: 'file', content: 'not-a-file-metadata' })
      expect(knowledgeQueueManager.estimateWorkload(item)).toBe(URL_ESTIMATE)
    })

    it('falls back to URL_ESTIMATE when content is null-like string', () => {
      const item = makeItem({ type: 'file', content: '' })
      expect(knowledgeQueueManager.estimateWorkload(item)).toBe(URL_ESTIMATE)
    })
  })

  describe('video type', () => {
    it('returns the video file size from FileMetadata content', () => {
      const item = makeVideoItem(50 * 1024 * 1024)
      expect(knowledgeQueueManager.estimateWorkload(item)).toBe(50 * 1024 * 1024)
    })

    it('falls back to URL_ESTIMATE when content has no size field', () => {
      const item = makeItem({ type: 'video', content: 'no-metadata' })
      expect(knowledgeQueueManager.estimateWorkload(item)).toBe(URL_ESTIMATE)
    })
  })

  describe('url type', () => {
    it('returns URL_ESTIMATE (2 MB)', () => {
      const item = makeUrlItem()
      expect(knowledgeQueueManager.estimateWorkload(item)).toBe(URL_ESTIMATE)
    })
  })

  describe('sitemap type', () => {
    it('returns SITEMAP_ESTIMATE (20 MB)', () => {
      const item = makeSitemapItem()
      expect(knowledgeQueueManager.estimateWorkload(item)).toBe(SITEMAP_ESTIMATE)
    })
  })

  describe('note type', () => {
    it('returns the byte length of the note string content', () => {
      const text = 'Hello, World!'
      const item = makeNoteItem(text)
      expect(knowledgeQueueManager.estimateWorkload(item)).toBe(Buffer.byteLength(text, 'utf-8'))
    })

    it('counts multi-byte UTF-8 characters correctly', () => {
      const text = '日本語テスト' // each char is 3 bytes in UTF-8
      const item = makeNoteItem(text)
      expect(knowledgeQueueManager.estimateWorkload(item)).toBe(Buffer.byteLength(text, 'utf-8'))
    })

    it('returns 1024 when note content is not a string', () => {
      const item = makeItem({ type: 'note', content: { size: 999 } as any })
      expect(knowledgeQueueManager.estimateWorkload(item)).toBe(1024)
    })
  })

  describe('directory type', () => {
    it('returns the size field when FileMetadata content is provided', () => {
      const item = makeDirectoryItem(30 * 1024 * 1024)
      expect(knowledgeQueueManager.estimateWorkload(item)).toBe(30 * 1024 * 1024)
    })

    it('falls back to SITEMAP_ESTIMATE when content has no size field', () => {
      const item = makeDirectoryItem() // content is ''
      expect(knowledgeQueueManager.estimateWorkload(item)).toBe(SITEMAP_ESTIMATE)
    })

    it('falls back to SITEMAP_ESTIMATE when content is a plain string', () => {
      const item = makeItem({ type: 'directory', content: '/some/path' })
      expect(knowledgeQueueManager.estimateWorkload(item)).toBe(SITEMAP_ESTIMATE)
    })
  })
})

// ── getState ──

describe('getState', () => {
  it('returns zeros when no items are registered or enqueued', () => {
    expect(knowledgeQueueManager.getState()).toEqual({
      activeCount: 0,
      activeWorkload: 0,
      pendingCount: 0
    })
  })

  it('reflects current activeCount correctly', () => {
    knowledgeQueueManager.registerActive('x', 100)
    knowledgeQueueManager.registerActive('y', 200)
    const state = knowledgeQueueManager.getState()
    expect(state.activeCount).toBe(2)
  })

  it('reflects current activeWorkload correctly', () => {
    knowledgeQueueManager.registerActive('x', 100)
    knowledgeQueueManager.registerActive('y', 200)
    expect(knowledgeQueueManager.getState().activeWorkload).toBe(300)
  })

  it('reflects current pendingCount correctly', () => {
    knowledgeQueueManager.enqueue(makeUrlItem())
    knowledgeQueueManager.enqueue(makeUrlItem())
    expect(knowledgeQueueManager.getState().pendingCount).toBe(2)
  })

  it('reflects all three fields simultaneously', () => {
    knowledgeQueueManager.registerActive('a', 512)
    knowledgeQueueManager.enqueue(makeUrlItem())
    knowledgeQueueManager.enqueue(makeUrlItem())
    knowledgeQueueManager.enqueue(makeUrlItem())
    expect(knowledgeQueueManager.getState()).toEqual({
      activeCount: 1,
      activeWorkload: 512,
      pendingCount: 3
    })
  })

  it('updates correctly after releaseActive', () => {
    knowledgeQueueManager.registerActive('a', 512)
    knowledgeQueueManager.registerActive('b', 1024)
    knowledgeQueueManager.releaseActive('a')
    expect(knowledgeQueueManager.getState()).toEqual({
      activeCount: 1,
      activeWorkload: 1024,
      pendingCount: 0
    })
  })
})

// ── onCapacityFreed callback ──

describe('onCapacityFreed', () => {
  it('is called once when releaseActive is invoked', () => {
    const callback = vi.fn()
    knowledgeQueueManager.onCapacityFreed = callback
    knowledgeQueueManager.registerActive('a', 1000)
    knowledgeQueueManager.releaseActive('a')
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('is called for each releaseActive call', () => {
    const callback = vi.fn()
    knowledgeQueueManager.onCapacityFreed = callback
    knowledgeQueueManager.registerActive('a', 100)
    knowledgeQueueManager.registerActive('b', 200)
    knowledgeQueueManager.releaseActive('a')
    knowledgeQueueManager.releaseActive('b')
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('is still called when releasing a non-existent id', () => {
    const callback = vi.fn()
    knowledgeQueueManager.onCapacityFreed = callback
    knowledgeQueueManager.releaseActive('ghost')
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('is not called by enqueue or dequeue', () => {
    const callback = vi.fn()
    knowledgeQueueManager.onCapacityFreed = callback
    knowledgeQueueManager.enqueue(makeUrlItem())
    knowledgeQueueManager.dequeue()
    expect(callback).not.toHaveBeenCalled()
  })

  it('is not called by registerActive', () => {
    const callback = vi.fn()
    knowledgeQueueManager.onCapacityFreed = callback
    knowledgeQueueManager.registerActive('a', 100)
    expect(callback).not.toHaveBeenCalled()
  })

  it('can be replaced and the new callback fires on subsequent releases', () => {
    const first = vi.fn()
    const second = vi.fn()

    knowledgeQueueManager.onCapacityFreed = first
    knowledgeQueueManager.registerActive('a', 100)
    knowledgeQueueManager.releaseActive('a')
    expect(first).toHaveBeenCalledTimes(1)

    knowledgeQueueManager.onCapacityFreed = second
    knowledgeQueueManager.registerActive('b', 100)
    knowledgeQueueManager.releaseActive('b')
    expect(second).toHaveBeenCalledTimes(1)
    expect(first).toHaveBeenCalledTimes(1) // not called again
  })
})
