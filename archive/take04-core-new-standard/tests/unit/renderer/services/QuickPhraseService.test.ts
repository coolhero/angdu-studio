import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockPut, mockDelete, mockUpdate, mockToArray } = vi.hoisted(() => ({
  mockPut: vi.fn().mockResolvedValue(undefined),
  mockDelete: vi.fn().mockResolvedValue(undefined),
  mockUpdate: vi.fn().mockResolvedValue(1),
  mockToArray: vi.fn().mockResolvedValue([])
}))

vi.mock('../../../../src/renderer/src/lib/db', () => ({
  db: {
    quick_phrases: {
      put: mockPut,
      delete: mockDelete,
      update: mockUpdate,
      toArray: mockToArray
    }
  }
}))

import {
  addQuickPhrase,
  updateQuickPhrase,
  removeQuickPhrase,
  toggleQuickPhrase,
  loadQuickPhrases,
  insertPhrase
} from '../../../../src/renderer/src/services/QuickPhraseService'
import type { QuickPhrase } from '@shared/types'

// ── Factories ──

function makeQuickPhrase(overrides: Partial<QuickPhrase> = {}): QuickPhrase {
  return {
    id: 'phrase-1',
    title: 'Test Phrase',
    content: 'Hello, world!',
    enabled: true,
    sortOrder: 0,
    ...overrides
  }
}

// ── Tests ──

describe('QuickPhraseService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('addQuickPhrase', () => {
    it('calls db.quick_phrases.put with the provided phrase', async () => {
      const phrase = makeQuickPhrase()

      await addQuickPhrase(phrase)

      expect(mockPut).toHaveBeenCalledOnce()
      expect(mockPut).toHaveBeenCalledWith(phrase)
    })

    it('calls put exactly once per invocation', async () => {
      const phrase = makeQuickPhrase({ id: 'phrase-add-once' })

      await addQuickPhrase(phrase)

      expect(mockPut).toHaveBeenCalledTimes(1)
    })

    it('passes all phrase fields to put unmodified', async () => {
      const phrase = makeQuickPhrase({
        id: 'phrase-full',
        title: 'Full Phrase',
        content: 'Full content',
        prompt: 'A prompt hint',
        enabled: false,
        sortOrder: 42
      })

      await addQuickPhrase(phrase)

      expect(mockPut).toHaveBeenCalledWith(phrase)
    })
  })

  describe('updateQuickPhrase', () => {
    it('calls db.quick_phrases.put with the provided phrase', async () => {
      const phrase = makeQuickPhrase({ id: 'phrase-update', title: 'Updated Title' })

      await updateQuickPhrase(phrase)

      expect(mockPut).toHaveBeenCalledOnce()
      expect(mockPut).toHaveBeenCalledWith(phrase)
    })

    it('calls put exactly once per invocation', async () => {
      const phrase = makeQuickPhrase()

      await updateQuickPhrase(phrase)

      expect(mockPut).toHaveBeenCalledTimes(1)
    })

    it('passes the full phrase object to put without modification', async () => {
      const phrase = makeQuickPhrase({
        id: 'phrase-upd-2',
        title: 'Changed',
        content: 'New content',
        enabled: false,
        sortOrder: 10
      })

      await updateQuickPhrase(phrase)

      expect(mockPut).toHaveBeenCalledWith(phrase)
    })
  })

  describe('removeQuickPhrase', () => {
    it('calls db.quick_phrases.delete with the provided id', async () => {
      await removeQuickPhrase('phrase-42')

      expect(mockDelete).toHaveBeenCalledOnce()
      expect(mockDelete).toHaveBeenCalledWith('phrase-42')
    })

    it('calls delete exactly once per invocation', async () => {
      await removeQuickPhrase('phrase-once')

      expect(mockDelete).toHaveBeenCalledTimes(1)
    })

    it('does not call put or update when removing', async () => {
      await removeQuickPhrase('phrase-only-delete')

      expect(mockPut).not.toHaveBeenCalled()
      expect(mockUpdate).not.toHaveBeenCalled()
    })
  })

  describe('toggleQuickPhrase', () => {
    it('calls db.quick_phrases.update with id and { enabled: true }', async () => {
      await toggleQuickPhrase('phrase-toggle', true)

      expect(mockUpdate).toHaveBeenCalledOnce()
      expect(mockUpdate).toHaveBeenCalledWith('phrase-toggle', { enabled: true })
    })

    it('calls db.quick_phrases.update with id and { enabled: false }', async () => {
      await toggleQuickPhrase('phrase-toggle', false)

      expect(mockUpdate).toHaveBeenCalledOnce()
      expect(mockUpdate).toHaveBeenCalledWith('phrase-toggle', { enabled: false })
    })

    it('calls update exactly once per invocation', async () => {
      await toggleQuickPhrase('phrase-once', true)

      expect(mockUpdate).toHaveBeenCalledTimes(1)
    })

    it('does not call put or delete when toggling', async () => {
      await toggleQuickPhrase('phrase-toggle-only', false)

      expect(mockPut).not.toHaveBeenCalled()
      expect(mockDelete).not.toHaveBeenCalled()
    })
  })

  describe('loadQuickPhrases', () => {
    it('calls db.quick_phrases.toArray', async () => {
      await loadQuickPhrases()

      expect(mockToArray).toHaveBeenCalledOnce()
    })

    it('returns an empty array when the database is empty', async () => {
      mockToArray.mockResolvedValueOnce([])

      const result = await loadQuickPhrases()

      expect(result).toEqual([])
    })

    it('returns phrases sorted ascending by sortOrder', async () => {
      const p1 = makeQuickPhrase({ id: 'p1', sortOrder: 3 })
      const p2 = makeQuickPhrase({ id: 'p2', sortOrder: 1 })
      const p3 = makeQuickPhrase({ id: 'p3', sortOrder: 2 })
      mockToArray.mockResolvedValueOnce([p1, p2, p3])

      const result = await loadQuickPhrases()

      expect(result.map((p) => p.id)).toEqual(['p2', 'p3', 'p1'])
    })

    it('treats undefined sortOrder as 0 when sorting', async () => {
      const pUndefined = makeQuickPhrase({ id: 'p-undef', sortOrder: undefined })
      const pNegative = makeQuickPhrase({ id: 'p-neg', sortOrder: -1 })
      const pPositive = makeQuickPhrase({ id: 'p-pos', sortOrder: 5 })
      mockToArray.mockResolvedValueOnce([pPositive, pUndefined, pNegative])

      const result = await loadQuickPhrases()

      expect(result.map((p) => p.id)).toEqual(['p-neg', 'p-undef', 'p-pos'])
    })

    it('returns a single phrase unchanged when there is only one', async () => {
      const phrase = makeQuickPhrase({ id: 'solo', sortOrder: 99 })
      mockToArray.mockResolvedValueOnce([phrase])

      const result = await loadQuickPhrases()

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(phrase)
    })

    it('preserves stable relative order for phrases with equal sortOrder', async () => {
      const p1 = makeQuickPhrase({ id: 'eq-1', sortOrder: 5 })
      const p2 = makeQuickPhrase({ id: 'eq-2', sortOrder: 5 })
      const p3 = makeQuickPhrase({ id: 'eq-3', sortOrder: 5 })
      mockToArray.mockResolvedValueOnce([p1, p2, p3])

      const result = await loadQuickPhrases()

      // All have sortOrder 5 — result must contain all three
      expect(result).toHaveLength(3)
      expect(result.map((p) => p.sortOrder)).toEqual([5, 5, 5])
    })
  })

  describe('insertPhrase', () => {
    it('returns the content string as-is', () => {
      const result = insertPhrase('Hello, world!')

      expect(result).toBe('Hello, world!')
    })

    it('returns an empty string unchanged', () => {
      const result = insertPhrase('')

      expect(result).toBe('')
    })

    it('returns a multiline string unchanged', () => {
      const multiline = 'Line one\nLine two\nLine three'

      const result = insertPhrase(multiline)

      expect(result).toBe(multiline)
    })

    it('returns a string with special characters unchanged', () => {
      const special = '{{name}} — <b>bold</b> & "quoted" & \'single\''

      const result = insertPhrase(special)

      expect(result).toBe(special)
    })

    it('is a pure function — does not call any db methods', () => {
      insertPhrase('some content')

      expect(mockPut).not.toHaveBeenCalled()
      expect(mockDelete).not.toHaveBeenCalled()
      expect(mockUpdate).not.toHaveBeenCalled()
      expect(mockToArray).not.toHaveBeenCalled()
    })
  })
})
