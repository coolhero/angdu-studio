import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock zustand persist and broadcastSync middleware
vi.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn
}))

vi.mock('../../../../src/renderer/src/stores/middleware/broadcastSync', () => ({
  broadcastSync: (fn: any, _name: string) => fn
}))

import { useKnowledgeStore } from '../../../../src/renderer/src/stores/useKnowledgeStore'
import type { KnowledgeBase, KnowledgeItem } from '@shared/types'

function makeBase(overrides: Partial<KnowledgeBase> = {}): KnowledgeBase {
  return {
    id: 'base-1',
    name: 'Test KB',
    model: { id: 'embed-model', name: 'Embed', provider: 'test' } as any,
    documentCount: 10,
    chunkSize: 1000,
    chunkOverlap: 200,
    items: [],
    version: 1,
    created_at: Date.now(),
    updated_at: Date.now(),
    ...overrides
  }
}

function makeItem(overrides: Partial<KnowledgeItem> = {}): KnowledgeItem {
  return {
    id: 'item-1',
    baseId: 'base-1',
    type: 'file',
    content: { path: '/test.txt', name: 'test.txt', size: 100 } as any,
    status: 'pending',
    progress: 0,
    retryCount: 0,
    created_at: Date.now(),
    updated_at: Date.now(),
    ...overrides
  }
}

describe('useKnowledgeStore', () => {
  beforeEach(() => {
    // Reset store state
    useKnowledgeStore.setState({ bases: [] })
  })

  describe('addBase', () => {
    it('should add a base to the store', () => {
      const base = makeBase()
      useKnowledgeStore.getState().addBase(base)
      expect(useKnowledgeStore.getState().bases).toHaveLength(1)
      expect(useKnowledgeStore.getState().bases[0].id).toBe('base-1')
    })

    it('should add multiple bases', () => {
      useKnowledgeStore.getState().addBase(makeBase({ id: 'b1' }))
      useKnowledgeStore.getState().addBase(makeBase({ id: 'b2' }))
      expect(useKnowledgeStore.getState().bases).toHaveLength(2)
    })
  })

  describe('removeBase', () => {
    it('should remove the correct base', () => {
      useKnowledgeStore.getState().addBase(makeBase({ id: 'b1' }))
      useKnowledgeStore.getState().addBase(makeBase({ id: 'b2' }))
      useKnowledgeStore.getState().removeBase('b1')
      expect(useKnowledgeStore.getState().bases).toHaveLength(1)
      expect(useKnowledgeStore.getState().bases[0].id).toBe('b2')
    })

    it('should do nothing for non-existent id', () => {
      useKnowledgeStore.getState().addBase(makeBase())
      useKnowledgeStore.getState().removeBase('nonexistent')
      expect(useKnowledgeStore.getState().bases).toHaveLength(1)
    })
  })

  describe('updateBase', () => {
    it('should update base properties', () => {
      useKnowledgeStore.getState().addBase(makeBase())
      useKnowledgeStore.getState().updateBase('base-1', { name: 'Updated' })
      expect(useKnowledgeStore.getState().bases[0].name).toBe('Updated')
    })

    it('should set updated_at timestamp', () => {
      const base = makeBase({ updated_at: 1000 })
      useKnowledgeStore.getState().addBase(base)
      useKnowledgeStore.getState().updateBase('base-1', { name: 'X' })
      expect(useKnowledgeStore.getState().bases[0].updated_at).toBeGreaterThan(1000)
    })
  })

  describe('addItem', () => {
    it('should add an item to the correct base', () => {
      useKnowledgeStore.getState().addBase(makeBase())
      const item = makeItem()
      useKnowledgeStore.getState().addItem('base-1', item)
      expect(useKnowledgeStore.getState().bases[0].items).toHaveLength(1)
      expect(useKnowledgeStore.getState().bases[0].items[0].id).toBe('item-1')
    })

    it('should prevent duplicate item ids', () => {
      useKnowledgeStore.getState().addBase(makeBase())
      const item = makeItem()
      useKnowledgeStore.getState().addItem('base-1', item)
      useKnowledgeStore.getState().addItem('base-1', item) // duplicate
      expect(useKnowledgeStore.getState().bases[0].items).toHaveLength(1)
    })
  })

  describe('removeItem', () => {
    it('should remove the correct item', () => {
      useKnowledgeStore.getState().addBase(makeBase())
      useKnowledgeStore.getState().addItem('base-1', makeItem({ id: 'i1' }))
      useKnowledgeStore.getState().addItem('base-1', makeItem({ id: 'i2' }))
      useKnowledgeStore.getState().removeItem('base-1', 'i1')
      const items = useKnowledgeStore.getState().bases[0].items
      expect(items).toHaveLength(1)
      expect(items[0].id).toBe('i2')
    })
  })

  describe('updateItem', () => {
    it('should update item properties', () => {
      useKnowledgeStore.getState().addBase(makeBase())
      useKnowledgeStore.getState().addItem('base-1', makeItem())
      useKnowledgeStore.getState().updateItem('base-1', 'item-1', { remark: 'test' })
      expect(useKnowledgeStore.getState().bases[0].items[0].remark).toBe('test')
    })
  })

  describe('updateItemStatus', () => {
    it('should update status, progress, and error', () => {
      useKnowledgeStore.getState().addBase(makeBase())
      useKnowledgeStore.getState().addItem('base-1', makeItem())
      useKnowledgeStore.getState().updateItemStatus('base-1', 'item-1', 'error', 0, 'fail')
      const item = useKnowledgeStore.getState().bases[0].items[0]
      expect(item.status).toBe('error')
      expect(item.progress).toBe(0)
      expect(item.error).toBe('fail')
    })
  })

  describe('clearCompletedProcessing', () => {
    it('should remove completed items except notes', () => {
      useKnowledgeStore.getState().addBase(makeBase())
      useKnowledgeStore.getState().addItem('base-1', makeItem({ id: 'i1', status: 'completed', type: 'file' }))
      useKnowledgeStore.getState().addItem('base-1', makeItem({ id: 'i2', status: 'completed', type: 'note' }))
      useKnowledgeStore.getState().addItem('base-1', makeItem({ id: 'i3', status: 'pending' }))
      useKnowledgeStore.getState().clearCompletedProcessing('base-1')
      const items = useKnowledgeStore.getState().bases[0].items
      expect(items).toHaveLength(2)
      expect(items.map((i) => i.id)).toEqual(['i2', 'i3'])
    })
  })
})
