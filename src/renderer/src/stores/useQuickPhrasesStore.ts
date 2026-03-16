import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { QuickPhrase } from '@shared/types/settings'

interface QuickPhrasesState {
  phrases: QuickPhrase[]

  hydrate: () => Promise<void>
  addPhrase: (title: string, content: string) => void
  updatePhrase: (id: string, updates: Partial<Pick<QuickPhrase, 'title' | 'content'>>) => void
  deletePhrase: (id: string) => void
  reorderPhrases: (phrases: QuickPhrase[]) => void
  searchPhrases: (query: string) => QuickPhrase[]
}

function serializePhrases(phrases: QuickPhrase[]): string {
  return JSON.stringify(phrases)
}

function parsePhrases(raw: string): QuickPhrase[] {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as QuickPhrase[]
  } catch {
    return []
  }
}

function generateId(): string {
  return `qp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export const useQuickPhrasesStore = create<QuickPhrasesState>((set, get) => ({
  phrases: [],

  hydrate: async () => {
    try {
      const raw = (await window.api.invoke['config:get']('quickPhrases')) as string
      const phrases = parsePhrases(raw)
      set({ phrases })
    } catch {
      set({ phrases: [] })
    }
  },

  addPhrase: (title: string, content: string) => {
    const { phrases } = get()
    const now = Date.now()
    const newPhrase: QuickPhrase = {
      id: generateId(),
      title,
      content,
      createdAt: now,
      updatedAt: now,
      order: phrases.length
    }
    const updated = [...phrases, newPhrase]
    set({ phrases: updated })
    window.api.invoke['config:set']('quickPhrases', serializePhrases(updated))
  },

  updatePhrase: (id: string, updates: Partial<Pick<QuickPhrase, 'title' | 'content'>>) => {
    const { phrases } = get()
    const updated = phrases.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
    )
    set({ phrases: updated })
    window.api.invoke['config:set']('quickPhrases', serializePhrases(updated))
  },

  deletePhrase: (id: string) => {
    const { phrases } = get()
    const updated = phrases.filter((p) => p.id !== id)
    set({ phrases: updated })
    window.api.invoke['config:set']('quickPhrases', serializePhrases(updated))
  },

  reorderPhrases: (reordered: QuickPhrase[]) => {
    const updated = reordered.map((p, i) => ({ ...p, order: i }))
    set({ phrases: updated })
    window.api.invoke['config:set']('quickPhrases', serializePhrases(updated))
  },

  searchPhrases: (query: string) => {
    const { phrases } = get()
    if (!query.trim()) return phrases
    const lowerQuery = query.toLowerCase()
    return phrases.filter(
      (p) =>
        p.title.toLowerCase().includes(lowerQuery) ||
        p.content.toLowerCase().includes(lowerQuery)
    )
  }
}))

// ─── Referentially stable selectors ─────────────────────────────────────────
export function usePhrasesList(): QuickPhrase[] {
  return useQuickPhrasesStore(useShallow((s) => s.phrases))
}
