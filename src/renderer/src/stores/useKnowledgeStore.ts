import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import type { KnowledgeBase, KnowledgeItem, ItemStatus } from '@shared/types/knowledge'

interface KnowledgeState {
  bases: KnowledgeBase[]
  selectedBaseId: string | null
}

interface KnowledgeActions {
  hydrate: () => Promise<void>
  addBase: (base: KnowledgeBase) => void
  deleteBase: (id: string) => void
  updateBase: (id: string, updates: Partial<KnowledgeBase>) => void
  reorderBases: (fromIndex: number, toIndex: number) => void
  setSelectedBaseId: (id: string | null) => void
  addItem: (baseId: string, item: KnowledgeItem) => void
  removeItem: (baseId: string, itemId: string) => void
  updateItemStatus: (
    baseId: string,
    itemId: string,
    status: ItemStatus,
    progress: number,
    error?: string
  ) => void
}

export const useKnowledgeStore = create<KnowledgeState & KnowledgeActions>()(
  persist(
    (set, get) => ({
      bases: [],
      selectedBaseId: null,

      hydrate: async () => {
        try {
          const bases = await window.api.invoke['kb:list']()
          set({ bases })
        } catch (err) {
          console.error('[useKnowledgeStore] hydrate failed:', err)
          set({ bases: [] })
        }
      },

      addBase: (base) =>
        set((state) => ({
          bases: [...state.bases, base],
          selectedBaseId: base.id
        })),

      deleteBase: (id) =>
        set((state) => ({
          bases: state.bases.filter((b) => b.id !== id),
          selectedBaseId:
            state.selectedBaseId === id
              ? state.bases.length > 1
                ? state.bases.find((b) => b.id !== id)?.id ?? null
                : null
              : state.selectedBaseId
        })),

      updateBase: (id, updates) =>
        set((state) => ({
          bases: state.bases.map((b) =>
            b.id === id ? { ...b, ...updates, updated_at: new Date().toISOString() } : b
          )
        })),

      reorderBases: (fromIndex, toIndex) =>
        set((state) => {
          const newBases = [...state.bases]
          const [moved] = newBases.splice(fromIndex, 1)
          newBases.splice(toIndex, 0, moved)
          return { bases: newBases }
        }),

      setSelectedBaseId: (id) => set({ selectedBaseId: id }),

      addItem: (baseId, item) =>
        set((state) => ({
          bases: state.bases.map((b) =>
            b.id === baseId
              ? { ...b, items: [...b.items, item], updated_at: new Date().toISOString() }
              : b
          )
        })),

      removeItem: (baseId, itemId) =>
        set((state) => ({
          bases: state.bases.map((b) =>
            b.id === baseId
              ? {
                  ...b,
                  items: b.items.filter((i) => i.id !== itemId),
                  updated_at: new Date().toISOString()
                }
              : b
          )
        })),

      updateItemStatus: (baseId, itemId, status, progress, error) =>
        set((state) => ({
          bases: state.bases.map((b) =>
            b.id === baseId
              ? {
                  ...b,
                  items: b.items.map((i) =>
                    i.id === itemId
                      ? {
                          ...i,
                          status,
                          progress,
                          ...(error !== undefined ? { error } : {}),
                          updated_at: new Date().toISOString()
                        }
                      : i
                  )
                }
              : b
          )
        }))
    }),
    {
      name: 'angdu-knowledge',
      partialize: (state) => ({
        selectedBaseId: state.selectedBaseId
        // bases are fetched from main process via hydrate(), not persisted in localStorage
      })
    }
  )
)

// Subscribe to item progress events
if (typeof window !== 'undefined' && window.api?.events) {
  window.api.events.on('kb:itemProgress', (payload) => {
    const { baseId, itemId, status, progress, error } = payload as {
      baseId: string
      itemId: string
      status: ItemStatus
      progress: number
      error?: string
    }
    useKnowledgeStore.getState().updateItemStatus(baseId, itemId, status, progress, error)
  })
}

// Stable selectors using useShallow for arrays/objects
export const useKnowledgeBases = () =>
  useKnowledgeStore((s) => s.bases, useShallow)
export const useSelectedBaseId = () =>
  useKnowledgeStore((s) => s.selectedBaseId)
export const useSelectedBase = () =>
  useKnowledgeStore(
    (s) => s.bases.find((b) => b.id === s.selectedBaseId) ?? null
  )
