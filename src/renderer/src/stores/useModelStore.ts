import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { shallow } from 'zustand/shallow'
import type { Model } from '@shared/types/provider'

interface ModelState {
  // Per-assistant model selection: assistantId → modelId
  activeModels: Record<string, string>
  // Search query for model list filtering
  searchQuery: string
  // Fetching state per provider
  fetching: Record<string, boolean>
}

interface ModelActions {
  setActiveModel: (assistantId: string, modelId: string) => void
  getActiveModelId: (assistantId: string) => string | undefined
  setSearchQuery: (query: string) => void
  setFetching: (providerId: string, isFetching: boolean) => void
}

export const useModelStore = create<ModelState & ModelActions>()(
  persist(
    (set, get) => ({
      activeModels: {},
      searchQuery: '',
      fetching: {},

      setActiveModel: (assistantId, modelId) =>
        set((state) => ({
          activeModels: { ...state.activeModels, [assistantId]: modelId }
        })),

      getActiveModelId: (assistantId) => get().activeModels[assistantId],

      setSearchQuery: (query) => set({ searchQuery: query }),

      setFetching: (providerId, isFetching) =>
        set((state) => ({
          fetching: { ...state.fetching, [providerId]: isFetching }
        }))
    }),
    {
      name: 'angdu-models',
      partialize: (state) => ({
        activeModels: state.activeModels
      })
    }
  )
)

// Stable selectors
export const useSearchQuery = () => useModelStore((s) => s.searchQuery)
export const useIsFetching = (providerId: string) =>
  useModelStore((s) => s.fetching[providerId] ?? false)
export const useActiveModels = () => useModelStore((s) => s.activeModels, shallow)
