import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { broadcastSync } from './middleware/broadcastSync'

import type {
  KnowledgeBase,
  KnowledgeItem,
  ProcessingStatus
} from '@shared/types'

// ── Store Interface ──

interface KnowledgeStoreState {
  // ── State ──
  bases: KnowledgeBase[]

  // ── Base CRUD ──
  addBase: (base: KnowledgeBase) => void
  removeBase: (id: string) => void
  updateBase: (id: string, update: Partial<KnowledgeBase>) => void

  // ── Item CRUD ──
  addItem: (baseId: string, item: KnowledgeItem) => void
  removeItem: (baseId: string, itemId: string) => void
  updateItem: (baseId: string, itemId: string, update: Partial<KnowledgeItem>) => void
  updateItemStatus: (
    baseId: string,
    itemId: string,
    status: ProcessingStatus,
    progress: number,
    error?: string
  ) => void
  clearCompletedProcessing: (baseId: string) => void
}

// ── Store ──

export const useKnowledgeStore = create<KnowledgeStoreState>()(
  persist(
    broadcastSync(
      (set) => ({
        // ── State ──
        bases: [],

        // ── Base CRUD ──

        addBase: (base) =>
          set((state) => ({
            bases: [...state.bases, base]
          })),

        removeBase: (id) =>
          set((state) => ({
            bases: state.bases.filter((b) => b.id !== id)
          })),

        updateBase: (id, update) =>
          set((state) => ({
            bases: state.bases.map((b) =>
              b.id === id ? { ...b, ...update, updated_at: Date.now() } : b
            )
          })),

        // ── Item CRUD ──

        addItem: (baseId, item) =>
          set((state) => ({
            bases: state.bases.map((b) => {
              if (b.id !== baseId) return b
              const isDuplicate = b.items.some((i) => i.id === item.id)
              if (isDuplicate) return b
              return { ...b, items: [...b.items, item], updated_at: Date.now() }
            })
          })),

        removeItem: (baseId, itemId) =>
          set((state) => ({
            bases: state.bases.map((b) => {
              if (b.id !== baseId) return b
              return {
                ...b,
                items: b.items.filter((i) => i.id !== itemId),
                updated_at: Date.now()
              }
            })
          })),

        updateItem: (baseId, itemId, update) =>
          set((state) => ({
            bases: state.bases.map((b) => {
              if (b.id !== baseId) return b
              return {
                ...b,
                items: b.items.map((i) =>
                  i.id === itemId ? { ...i, ...update, updated_at: Date.now() } : i
                ),
                updated_at: Date.now()
              }
            })
          })),

        updateItemStatus: (baseId, itemId, status, progress, error) =>
          set((state) => ({
            bases: state.bases.map((b) => {
              if (b.id !== baseId) return b
              return {
                ...b,
                items: b.items.map((i) =>
                  i.id === itemId
                    ? { ...i, status, progress, error, updated_at: Date.now() }
                    : i
                ),
                updated_at: Date.now()
              }
            })
          })),

        clearCompletedProcessing: (baseId) =>
          set((state) => ({
            bases: state.bases.map((b) => {
              if (b.id !== baseId) return b
              return {
                ...b,
                items: b.items.filter((i) => i.status !== 'completed' || i.type === 'note'),
                updated_at: Date.now()
              }
            })
          }))
      }),
      'cherry-studio-knowledge'
    ),
    {
      name: 'cherry-studio-knowledge',
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0) {
          return persistedState as KnowledgeStoreState
        }
        return persistedState as KnowledgeStoreState
      },
      partialize: (state) => ({
        bases: state.bases
      })
    }
  )
)
