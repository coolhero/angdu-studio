import { describe, it, expect, vi, beforeEach } from 'vitest'
import { IpcChannel } from '../../../../packages/shared/IpcChannel'

// ── fs mocks ──────────────────────────────────────────────────────────────────

const mockExistsSync = vi.fn(() => false)
const mockMkdirSync = vi.fn()
const mockRmSync = vi.fn()
const mockReadFileSync = vi.fn(() => '[]')
const mockWriteFileSync = vi.fn()

vi.mock('fs', () => ({
  existsSync: mockExistsSync,
  mkdirSync: mockMkdirSync,
  rmSync: mockRmSync,
  readFileSync: mockReadFileSync,
  writeFileSync: mockWriteFileSync
}))

// ── crypto mock ───────────────────────────────────────────────────────────────

const mockRandomUUID = vi.fn(() => 'test-uuid-1234')

vi.mock('crypto', () => ({
  randomUUID: mockRandomUUID
}))

// ── electron mock ─────────────────────────────────────────────────────────────

const mockIpcHandle = vi.fn()
const mockGetAllWindows = vi.fn(() => [])

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/tmp/test-userdata')
  },
  ipcMain: {
    handle: mockIpcHandle
  },
  BrowserWindow: {
    getAllWindows: mockGetAllWindows
  }
}))

// ── vectra mock ───────────────────────────────────────────────────────────────

const mockCreateIndex = vi.fn().mockResolvedValue(undefined)
const mockIsIndexCreated = vi.fn().mockResolvedValue(true)
const mockInsertItem = vi.fn().mockResolvedValue(undefined)
const mockDeleteItem = vi.fn().mockResolvedValue(undefined)
const mockListItems = vi.fn().mockResolvedValue([])
const mockQueryItems = vi.fn().mockResolvedValue([])

const MockLocalIndex = vi.fn().mockImplementation(() => ({
  createIndex: mockCreateIndex,
  isIndexCreated: mockIsIndexCreated,
  insertItem: mockInsertItem,
  deleteItem: mockDeleteItem,
  listItems: mockListItems,
  queryItems: mockQueryItems
}))

vi.mock('vectra', () => ({
  LocalIndex: MockLocalIndex
}))

// ── ai SDK mock ───────────────────────────────────────────────────────────────

const mockEmbed = vi.fn().mockResolvedValue({ embedding: [0.1, 0.2, 0.3] })
const mockEmbedMany = vi.fn().mockResolvedValue({ embeddings: [[0.1, 0.2, 0.3]] })

vi.mock('ai', () => ({
  embed: mockEmbed,
  embedMany: mockEmbedMany
}))

// ── logger mock ───────────────────────────────────────────────────────────────

const mockLog = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn()
}

vi.mock('../../../../src/main/logger', () => ({
  withContext: vi.fn(() => mockLog)
}))

// ── KnowledgeQueueManager mock ────────────────────────────────────────────────

vi.mock('../../../../src/main/services/KnowledgeQueueManager', () => ({
  knowledgeQueueManager: {
    onCapacityFreed: vi.fn(),
    canProcess: vi.fn(() => true),
    estimateWorkload: vi.fn(() => 1024),
    registerActive: vi.fn(),
    releaseActive: vi.fn(),
    enqueue: vi.fn(),
    dequeue: vi.fn(() => undefined),
    removePending: vi.fn()
  }
}))

// ── KnowledgeLoaders mock ─────────────────────────────────────────────────────

vi.mock('../../../../src/main/services/KnowledgeLoaders', () => ({
  loadFile: vi.fn().mockResolvedValue('file content'),
  loadUrl: vi.fn().mockResolvedValue('url content'),
  loadSitemap: vi.fn().mockResolvedValue([]),
  loadNote: vi.fn().mockResolvedValue('note content'),
  loadDirectory: vi.fn().mockResolvedValue([]),
  loadVideo: vi.fn().mockResolvedValue('video transcript')
}))

// ── KnowledgeChunker mock ─────────────────────────────────────────────────────

vi.mock('../../../../src/main/services/KnowledgeChunker', () => ({
  chunkText: vi.fn(() => ['chunk one', 'chunk two'])
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeModel() {
  return { id: 'text-embedding-3-small', provider: 'openai', name: 'text-embedding-3-small' } as any
}

function makeKnowledgeItem(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'item-1',
    baseId: 'test-uuid-1234',
    type: 'note' as const,
    content: 'some note content',
    status: 'pending' as const,
    progress: 0,
    retryCount: 0,
    created_at: Date.now(),
    updated_at: Date.now(),
    ...overrides
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('KnowledgeService', () => {
  beforeEach(() => {
    // Reset both call history AND mock implementations so tests are fully isolated
    vi.resetAllMocks()

    // Default fs behaviour: base knowledge dir does not yet exist
    mockExistsSync.mockReturnValue(false)
    // DeferredDelete reads its JSON file on construction — return empty array
    mockReadFileSync.mockReturnValue('[]')
    // Default LocalIndex state: index already created
    mockIsIndexCreated.mockResolvedValue(true)
    mockCreateIndex.mockResolvedValue(undefined)
    mockListItems.mockResolvedValue([])
    mockQueryItems.mockResolvedValue([])
    mockInsertItem.mockResolvedValue(undefined)
    mockDeleteItem.mockResolvedValue(undefined)
    mockEmbed.mockResolvedValue({ embedding: [0.1, 0.2, 0.3] })
    mockEmbedMany.mockResolvedValue({ embeddings: [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]] })
    mockRandomUUID.mockReturnValue('test-uuid-1234')
    mockGetAllWindows.mockReturnValue([])
    MockLocalIndex.mockImplementation(() => ({
      createIndex: mockCreateIndex,
      isIndexCreated: mockIsIndexCreated,
      insertItem: mockInsertItem,
      deleteItem: mockDeleteItem,
      listItems: mockListItems,
      queryItems: mockQueryItems
    }))
  })

  // ── create (US1) ────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates a knowledge base with correct default values', async () => {
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      const result = await knowledgeService.create({
        name: 'My KB',
        model: makeModel()
      })

      expect(result.id).toBe('test-uuid-1234')
      expect(result.name).toBe('My KB')
      expect(result.documentCount).toBe(10)
      expect(result.chunkSize).toBe(1000)
      expect(result.chunkOverlap).toBe(200)
      expect(result.items).toEqual([])
      expect(result.version).toBe(1)
      expect(typeof result.created_at).toBe('number')
      expect(typeof result.updated_at).toBe('number')
    })

    it('respects explicit chunkSize and chunkOverlap when provided', async () => {
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      const result = await knowledgeService.create({
        name: 'Custom KB',
        model: makeModel(),
        chunkSize: 500,
        chunkOverlap: 100,
        documentCount: 20
      })

      expect(result.chunkSize).toBe(500)
      expect(result.chunkOverlap).toBe(100)
      expect(result.documentCount).toBe(20)
    })

    it('creates a LocalIndex directory and calls createIndex', async () => {
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      await knowledgeService.create({ name: 'My KB', model: makeModel() })

      expect(mockMkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('test-uuid-1234'),
        { recursive: true }
      )
      expect(mockCreateIndex).toHaveBeenCalled()
    })

    it('throws when chunkOverlap >= chunkSize', async () => {
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      await expect(
        knowledgeService.create({
          name: 'Bad KB',
          model: makeModel(),
          chunkSize: 200,
          chunkOverlap: 200
        })
      ).rejects.toThrow('chunkOverlap (200) must be less than chunkSize (200)')
    })

    it('throws when chunkOverlap is greater than chunkSize', async () => {
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      await expect(
        knowledgeService.create({
          name: 'Bad KB',
          model: makeModel(),
          chunkSize: 100,
          chunkOverlap: 150
        })
      ).rejects.toThrow('chunkOverlap (150) must be less than chunkSize (100)')
    })

    it('throws when chunkSize is 0 (overlap guard fires first since overlap === chunkSize)', async () => {
      // The source checks chunkOverlap >= chunkSize before chunkSize < 1.
      // When chunkSize=0 and chunkOverlap=0, the overlap check fires first.
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      await expect(
        knowledgeService.create({
          name: 'Bad KB',
          model: makeModel(),
          chunkSize: 0,
          chunkOverlap: 0
        })
      ).rejects.toThrow('chunkOverlap (0) must be less than chunkSize (0)')
    })

    it('throws chunkSize validation error when chunkSize is negative and chunkOverlap is more negative', async () => {
      // With chunkSize=-1, chunkOverlap=-2: overlap(-2) < chunkSize(-1) so the
      // chunkSize < 1 guard is reached.
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      await expect(
        knowledgeService.create({
          name: 'Bad KB',
          model: makeModel(),
          chunkSize: -1,
          chunkOverlap: -2
        })
      ).rejects.toThrow('chunkSize must be at least 1')
    })
  })

  // ── delete (US1) ────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('deletes an existing knowledge base and removes its directory', async () => {
      mockExistsSync.mockReturnValue(true)
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      await knowledgeService.delete('base-42')

      expect(mockRmSync).toHaveBeenCalledWith(
        expect.stringContaining('base-42'),
        { recursive: true, force: true }
      )
    })

    it('skips rmSync when index directory does not exist', async () => {
      mockExistsSync.mockReturnValue(false)
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      await knowledgeService.delete('base-missing')

      expect(mockRmSync).not.toHaveBeenCalled()
    })

    it('falls back to deferred delete when rmSync throws', async () => {
      // existsSync returns true for the index path so rmSync is invoked
      mockExistsSync.mockReturnValue(true)
      mockRmSync.mockImplementation(() => {
        throw new Error('EBUSY: resource busy or locked')
      })

      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      // Should not throw — deferred delete absorbs the error
      await expect(knowledgeService.delete('base-locked')).resolves.toBeUndefined()

      expect(mockLog.warn).toHaveBeenCalledWith(
        expect.stringContaining('base-locked')
      )
    })
  })

  // ── reset (US1) ─────────────────────────────────────────────────────────────

  describe('reset', () => {
    it('removes and recreates the index for the given base', async () => {
      mockExistsSync.mockReturnValue(true)
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      await knowledgeService.reset('base-99')

      // Old directory must have been removed
      expect(mockRmSync).toHaveBeenCalledWith(
        expect.stringContaining('base-99'),
        { recursive: true, force: true }
      )
      // New directory must have been created
      expect(mockMkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('base-99'),
        { recursive: true }
      )
      // A fresh vectra index must have been created
      expect(mockCreateIndex).toHaveBeenCalled()
    })

    it('skips rmSync during reset when directory does not exist', async () => {
      mockExistsSync.mockReturnValue(false)
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      await knowledgeService.reset('base-new')

      expect(mockRmSync).not.toHaveBeenCalled()
      expect(mockMkdirSync).toHaveBeenCalled()
      expect(mockCreateIndex).toHaveBeenCalled()
    })
  })

  // ── removeItem (US6) ────────────────────────────────────────────────────────

  describe('removeItem', () => {
    it('removes all index entries matching the itemId', async () => {
      const matchingEntry = { id: 'vec-1', metadata: { itemId: 'item-to-remove' } }
      const otherEntry = { id: 'vec-2', metadata: { itemId: 'other-item' } }
      mockListItems.mockResolvedValue([matchingEntry, otherEntry])

      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      await knowledgeService.removeItem('base-1', 'item-to-remove')

      expect(mockDeleteItem).toHaveBeenCalledTimes(1)
      expect(mockDeleteItem).toHaveBeenCalledWith('vec-1')
      // The non-matching entry must not be deleted
      expect(mockDeleteItem).not.toHaveBeenCalledWith('vec-2')
    })

    it('does not call deleteItem when no entries match the itemId', async () => {
      mockListItems.mockResolvedValue([
        { id: 'vec-1', metadata: { itemId: 'other-item' } }
      ])

      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      await knowledgeService.removeItem('base-1', 'non-existent-item')

      expect(mockDeleteItem).not.toHaveBeenCalled()
    })

    it('falls back to deferred delete when the index operation throws', async () => {
      mockListItems.mockRejectedValue(new Error('index read error'))

      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      await expect(knowledgeService.removeItem('base-1', 'item-err')).resolves.toBeUndefined()

      // Deferred delete should have persisted the pending entry
      expect(mockWriteFileSync).toHaveBeenCalled()
      expect(mockLog.warn).toHaveBeenCalledWith(
        expect.stringContaining('item-err')
      )
    })
  })

  // ── search (US3) ────────────────────────────────────────────────────────────

  describe('search', () => {
    it('embeds the query before performing a vector search', async () => {
      mockQueryItems.mockResolvedValue([])
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      await knowledgeService.search('base-1', 'what is AI?')

      expect(mockEmbed).toHaveBeenCalledWith(
        expect.objectContaining({ value: 'what is AI?' })
      )
      expect(mockQueryItems).toHaveBeenCalledWith([0.1, 0.2, 0.3], 10)
    })

    it('passes the count argument to queryItems', async () => {
      mockQueryItems.mockResolvedValue([])
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      await knowledgeService.search('base-1', 'hello', 5)

      expect(mockQueryItems).toHaveBeenCalledWith([0.1, 0.2, 0.3], 5)
    })

    it('returns formatted KnowledgeReference results', async () => {
      mockQueryItems.mockResolvedValue([
        {
          score: 0.95,
          item: {
            id: 'vec-a',
            metadata: {
              text: 'chunk about AI',
              sourceUrl: 'https://example.com/ai',
              type: 'url',
              itemId: 'item-1',
              baseId: 'base-1',
              chunkIndex: 0
            }
          }
        },
        {
          score: 0.78,
          item: {
            id: 'vec-b',
            metadata: {
              text: 'another chunk',
              sourceUrl: undefined,
              type: 'note',
              itemId: 'item-2',
              baseId: 'base-1',
              chunkIndex: 1
            }
          }
        }
      ])

      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')
      const results = await knowledgeService.search('base-1', 'AI')

      expect(results).toHaveLength(2)
      expect(results[0]).toMatchObject({
        id: 'vec-a',
        content: 'chunk about AI',
        sourceUrl: 'https://example.com/ai',
        type: 'url',
        score: 0.95
      })
      expect(results[1]).toMatchObject({
        id: 'vec-b',
        content: 'another chunk',
        type: 'note',
        score: 0.78
      })
    })

    it('returns an empty array when no results are found', async () => {
      mockQueryItems.mockResolvedValue([])
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      const results = await knowledgeService.search('base-1', 'unknown query')

      expect(results).toEqual([])
    })

    it('uses empty string for content when metadata.text is missing', async () => {
      mockQueryItems.mockResolvedValue([
        {
          score: 0.5,
          item: {
            id: 'vec-c',
            metadata: {}
          }
        }
      ])

      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')
      const results = await knowledgeService.search('base-1', 'query')

      expect(results[0].content).toBe('')
    })
  })

  // ── rerank (US7) ────────────────────────────────────────────────────────────

  describe('rerank', () => {
    it('returns results sorted by score descending', async () => {
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      const unsorted = [
        { id: 'r1', content: 'low', score: 0.3 },
        { id: 'r2', content: 'high', score: 0.9 },
        { id: 'r3', content: 'mid', score: 0.6 }
      ]

      const result = await knowledgeService.rerank(
        'base-1',
        'my query',
        unsorted,
        makeModel()
      )

      expect(result.map((r) => r.id)).toEqual(['r2', 'r3', 'r1'])
    })

    it('handles results that already have equal scores', async () => {
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      const refs = [
        { id: 'a', content: 'a', score: 0.5 },
        { id: 'b', content: 'b', score: 0.5 }
      ]

      const result = await knowledgeService.rerank('base-1', 'q', refs, makeModel())

      expect(result).toHaveLength(2)
      // Order is not specified when scores tie, but all items are present
      const ids = result.map((r) => r.id)
      expect(ids).toContain('a')
      expect(ids).toContain('b')
    })

    it('treats missing score as 0 during sorting', async () => {
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      const refs = [
        { id: 'no-score', content: 'x' },
        { id: 'has-score', content: 'y', score: 0.8 }
      ]

      const result = await knowledgeService.rerank('base-1', 'q', refs, makeModel())

      expect(result[0].id).toBe('has-score')
      expect(result[1].id).toBe('no-score')
    })

    it('returns an empty array when given an empty results list', async () => {
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      const result = await knowledgeService.rerank('base-1', 'q', [], makeModel())

      expect(result).toEqual([])
    })
  })

  // ── registerHandlers ────────────────────────────────────────────────────────

  describe('registerHandlers', () => {
    it('registers exactly 7 IPC handlers', async () => {
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      knowledgeService.registerHandlers()

      expect(mockIpcHandle).toHaveBeenCalledTimes(7)
    })

    it('registers handler for KB_Create', async () => {
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      knowledgeService.registerHandlers()

      expect(mockIpcHandle).toHaveBeenCalledWith(
        IpcChannel.KB_Create,
        expect.any(Function)
      )
    })

    it('registers handler for KB_Delete', async () => {
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      knowledgeService.registerHandlers()

      expect(mockIpcHandle).toHaveBeenCalledWith(
        IpcChannel.KB_Delete,
        expect.any(Function)
      )
    })

    it('registers handler for KB_Reset', async () => {
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      knowledgeService.registerHandlers()

      expect(mockIpcHandle).toHaveBeenCalledWith(
        IpcChannel.KB_Reset,
        expect.any(Function)
      )
    })

    it('registers handler for KB_AddItem', async () => {
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      knowledgeService.registerHandlers()

      expect(mockIpcHandle).toHaveBeenCalledWith(
        IpcChannel.KB_AddItem,
        expect.any(Function)
      )
    })

    it('registers handler for KB_RemoveItem', async () => {
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      knowledgeService.registerHandlers()

      expect(mockIpcHandle).toHaveBeenCalledWith(
        IpcChannel.KB_RemoveItem,
        expect.any(Function)
      )
    })

    it('registers handler for KB_Search', async () => {
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      knowledgeService.registerHandlers()

      expect(mockIpcHandle).toHaveBeenCalledWith(
        IpcChannel.KB_Search,
        expect.any(Function)
      )
    })

    it('registers handler for KB_Rerank', async () => {
      const { knowledgeService } = await import('../../../../src/main/services/KnowledgeService')

      knowledgeService.registerHandlers()

      expect(mockIpcHandle).toHaveBeenCalledWith(
        IpcChannel.KB_Rerank,
        expect.any(Function)
      )
    })
  })
})
