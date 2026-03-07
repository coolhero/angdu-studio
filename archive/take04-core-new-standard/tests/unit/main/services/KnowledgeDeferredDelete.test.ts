import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

// Mock electron and bootstrap so the transitively imported logger does not crash
// in the vitest node environment.
vi.mock('electron', () => ({
  app: { getPath: vi.fn(() => '/tmp') }
}))

vi.mock('../../../../src/main/bootstrap', () => ({
  logsDir: '/tmp/logs'
}))

// Stub out the logger so winston and daily-rotate-file are not loaded
vi.mock('../../../../src/main/logger', () => ({
  withContext: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  })
}))

// Import after mocks are set up
import { KnowledgeDeferredDelete } from '../../../../src/main/services/KnowledgeDeferredDelete'

describe('KnowledgeDeferredDelete', () => {
  let tmpDir: string
  let deferredDelete: KnowledgeDeferredDelete

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kdd-test-'))
    deferredDelete = new KnowledgeDeferredDelete(tmpDir)
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
    vi.clearAllMocks()
  })

  describe('addPending', () => {
    it('should store a base-type entry correctly', () => {
      deferredDelete.addPending({ id: 'base-1', type: 'base', paths: ['/data/base-1'] })
      const pending = deferredDelete.getPending()
      expect(pending).toHaveLength(1)
      expect(pending[0].id).toBe('base-1')
      expect(pending[0].type).toBe('base')
      expect(pending[0].paths).toEqual(['/data/base-1'])
      expect(pending[0].createdAt).toBeTypeOf('number')
    })

    it('should store an item-type entry with baseId correctly', () => {
      deferredDelete.addPending({ id: 'item-1', type: 'item', baseId: 'base-1', paths: ['/data/item-1'] })
      const pending = deferredDelete.getPending()
      expect(pending).toHaveLength(1)
      expect(pending[0].id).toBe('item-1')
      expect(pending[0].type).toBe('item')
      expect(pending[0].baseId).toBe('base-1')
      expect(pending[0].paths).toEqual(['/data/item-1'])
    })

    it('should store multiple entries in insertion order', () => {
      deferredDelete.addPending({ id: 'a', type: 'base', paths: ['/data/a'] })
      deferredDelete.addPending({ id: 'b', type: 'item', baseId: 'a', paths: ['/data/b'] })
      deferredDelete.addPending({ id: 'c', type: 'base', paths: ['/data/c'] })
      const pending = deferredDelete.getPending()
      expect(pending).toHaveLength(3)
      expect(pending.map((e) => e.id)).toEqual(['a', 'b', 'c'])
    })

    it('should persist entries to disk after adding', () => {
      deferredDelete.addPending({ id: 'persisted-1', type: 'base', paths: ['/x'] })
      const filePath = path.join(tmpDir, 'knowledge', '_pending_deletions.json')
      expect(fs.existsSync(filePath)).toBe(true)
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      expect(raw).toHaveLength(1)
      expect(raw[0].id).toBe('persisted-1')
    })
  })

  describe('removePending', () => {
    it('should remove the correct entry by id', () => {
      deferredDelete.addPending({ id: 'keep-me', type: 'base', paths: ['/a'] })
      deferredDelete.addPending({ id: 'remove-me', type: 'item', baseId: 'keep-me', paths: ['/b'] })
      deferredDelete.removePending('remove-me')
      const pending = deferredDelete.getPending()
      expect(pending).toHaveLength(1)
      expect(pending[0].id).toBe('keep-me')
    })

    it('should not remove entries when id does not match', () => {
      deferredDelete.addPending({ id: 'entry-1', type: 'base', paths: ['/a'] })
      deferredDelete.removePending('non-existent')
      expect(deferredDelete.getPending()).toHaveLength(1)
    })

    it('should persist the updated list to disk after removal', () => {
      deferredDelete.addPending({ id: 'x', type: 'base', paths: ['/x'] })
      deferredDelete.addPending({ id: 'y', type: 'base', paths: ['/y'] })
      deferredDelete.removePending('x')
      const filePath = path.join(tmpDir, 'knowledge', '_pending_deletions.json')
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      expect(raw).toHaveLength(1)
      expect(raw[0].id).toBe('y')
    })
  })

  describe('getPending', () => {
    it('should return an empty array when no entries have been added', () => {
      expect(deferredDelete.getPending()).toEqual([])
    })

    it('should return all stored entries', () => {
      deferredDelete.addPending({ id: '1', type: 'base', paths: ['/1'] })
      deferredDelete.addPending({ id: '2', type: 'item', baseId: '1', paths: ['/2'] })
      const pending = deferredDelete.getPending()
      expect(pending).toHaveLength(2)
    })

    it('should return a copy so external mutations do not affect internal state', () => {
      deferredDelete.addPending({ id: 'safe', type: 'base', paths: ['/safe'] })
      const pending = deferredDelete.getPending()
      pending.pop()
      expect(deferredDelete.getPending()).toHaveLength(1)
    })
  })

  describe('retryAll', () => {
    it('should remove entries for which deleteFn returns true', async () => {
      deferredDelete.addPending({ id: 'success-1', type: 'base', paths: ['/s1'] })
      deferredDelete.addPending({ id: 'success-2', type: 'base', paths: ['/s2'] })

      await deferredDelete.retryAll(async () => true)

      expect(deferredDelete.getPending()).toEqual([])
    })

    it('should keep entries for which deleteFn returns false', async () => {
      deferredDelete.addPending({ id: 'fail-1', type: 'base', paths: ['/f1'] })
      deferredDelete.addPending({ id: 'fail-2', type: 'base', paths: ['/f2'] })

      await deferredDelete.retryAll(async () => false)

      expect(deferredDelete.getPending()).toHaveLength(2)
    })

    it('should keep entries for which deleteFn throws', async () => {
      deferredDelete.addPending({ id: 'throw-1', type: 'item', baseId: 'b', paths: ['/t1'] })

      await deferredDelete.retryAll(async () => {
        throw new Error('Network error')
      })

      const pending = deferredDelete.getPending()
      expect(pending).toHaveLength(1)
      expect(pending[0].id).toBe('throw-1')
    })

    it('should selectively remove only successfully deleted entries', async () => {
      deferredDelete.addPending({ id: 'ok', type: 'base', paths: ['/ok'] })
      deferredDelete.addPending({ id: 'fail', type: 'base', paths: ['/fail'] })

      await deferredDelete.retryAll(async (entry) => entry.id === 'ok')

      const pending = deferredDelete.getPending()
      expect(pending).toHaveLength(1)
      expect(pending[0].id).toBe('fail')
    })

    it('should persist the remaining entries to disk after retryAll', async () => {
      deferredDelete.addPending({ id: 'will-succeed', type: 'base', paths: ['/ws'] })
      deferredDelete.addPending({ id: 'will-fail', type: 'base', paths: ['/wf'] })

      await deferredDelete.retryAll(async (entry) => entry.id === 'will-succeed')

      const filePath = path.join(tmpDir, 'knowledge', '_pending_deletions.json')
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      expect(raw).toHaveLength(1)
      expect(raw[0].id).toBe('will-fail')
    })

    it('should handle an empty pending list without error', async () => {
      await expect(deferredDelete.retryAll(async () => true)).resolves.toBeUndefined()
      expect(deferredDelete.getPending()).toEqual([])
    })
  })

  describe('Persistence', () => {
    it('should restore entries after re-creating the instance with the same base path', () => {
      deferredDelete.addPending({ id: 'survived', type: 'base', paths: ['/survive'] })
      deferredDelete.addPending({ id: 'also-survived', type: 'item', baseId: 'survived', paths: ['/also'] })

      // Simulate an app restart by constructing a new instance pointing to the same directory
      const reloaded = new KnowledgeDeferredDelete(tmpDir)
      const pending = reloaded.getPending()
      expect(pending).toHaveLength(2)
      expect(pending[0].id).toBe('survived')
      expect(pending[1].id).toBe('also-survived')
    })

    it('should preserve all entry fields across restarts', () => {
      const before = Date.now()
      deferredDelete.addPending({ id: 'full', type: 'item', baseId: 'parent', paths: ['/p1', '/p2'] })
      const after = Date.now()

      const reloaded = new KnowledgeDeferredDelete(tmpDir)
      const entry = reloaded.getPending()[0]
      expect(entry.id).toBe('full')
      expect(entry.type).toBe('item')
      expect(entry.baseId).toBe('parent')
      expect(entry.paths).toEqual(['/p1', '/p2'])
      expect(entry.createdAt).toBeGreaterThanOrEqual(before)
      expect(entry.createdAt).toBeLessThanOrEqual(after)
    })
  })

  describe('Edge cases', () => {
    it('should start with an empty pending list when no JSON file exists', () => {
      // tmpDir exists but knowledge/_pending_deletions.json has never been written
      const fresh = new KnowledgeDeferredDelete(tmpDir)
      expect(fresh.getPending()).toEqual([])
    })

    it('should fall back to an empty array when the JSON file is corrupted', () => {
      const filePath = path.join(tmpDir, 'knowledge', '_pending_deletions.json')
      fs.mkdirSync(path.dirname(filePath), { recursive: true })
      fs.writeFileSync(filePath, '{ this is not valid json !!!', 'utf-8')

      const instance = new KnowledgeDeferredDelete(tmpDir)
      expect(instance.getPending()).toEqual([])
    })

    it('should handle removing an id from an empty list gracefully', () => {
      expect(() => deferredDelete.removePending('ghost')).not.toThrow()
      expect(deferredDelete.getPending()).toEqual([])
    })
  })
})
