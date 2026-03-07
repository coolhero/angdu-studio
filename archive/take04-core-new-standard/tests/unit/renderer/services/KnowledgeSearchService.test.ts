import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock window.api
const mockSearch = vi.fn()
const mockRerank = vi.fn()

vi.stubGlobal('window', {
  api: {
    knowledge: {
      search: mockSearch,
      rerank: mockRerank
    }
  }
})

import { search, rerank } from '../../../../src/renderer/src/services/KnowledgeSearchService'
import type { KnowledgeReference } from '@shared/types'

describe('KnowledgeSearchService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('search', () => {
    it('should call IPC search with correct params', async () => {
      const mockResults: KnowledgeReference[] = [
        { id: 'r1', content: 'chunk text', score: 0.9 }
      ]
      mockSearch.mockResolvedValue(mockResults)

      const results = await search('base-1', 'test query', 5)
      expect(mockSearch).toHaveBeenCalledWith('base-1', 'test query', 5)
      expect(results).toEqual(mockResults)
    })

    it('should return empty array when api returns undefined', async () => {
      mockSearch.mockResolvedValue(undefined)
      const results = await search('base-1', 'query')
      expect(results).toEqual([])
    })

    it('should use default count when not specified', async () => {
      mockSearch.mockResolvedValue([])
      await search('base-1', 'query')
      expect(mockSearch).toHaveBeenCalledWith('base-1', 'query', undefined)
    })
  })

  describe('rerank', () => {
    it('should call IPC rerank with correct params', async () => {
      const inputResults: KnowledgeReference[] = [
        { id: 'r1', content: 'a', score: 0.5 },
        { id: 'r2', content: 'b', score: 0.8 }
      ]
      const rerankedResults: KnowledgeReference[] = [
        { id: 'r2', content: 'b', score: 0.95 },
        { id: 'r1', content: 'a', score: 0.3 }
      ]
      mockRerank.mockResolvedValue(rerankedResults)

      const model = { id: 'reranker', name: 'Reranker', provider: 'test' } as any
      const results = await rerank('base-1', 'query', inputResults, model)

      expect(mockRerank).toHaveBeenCalledWith('base-1', 'query', inputResults, model)
      expect(results).toEqual(rerankedResults)
    })

    it('should return original results when api returns undefined', async () => {
      const inputResults: KnowledgeReference[] = [{ id: 'r1', content: 'a', score: 0.5 }]
      mockRerank.mockResolvedValue(undefined)

      const model = { id: 'reranker', name: 'R', provider: 'test' } as any
      const results = await rerank('base-1', 'query', inputResults, model)
      expect(results).toEqual(inputResults)
    })
  })
})
