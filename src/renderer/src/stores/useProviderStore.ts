import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { shallow } from 'zustand/shallow'
import type { Provider } from '@shared/types/provider'

interface ProviderState {
  providers: Provider[]
  selectedProviderId: string | null
}

interface ProviderActions {
  setProviders: (providers: Provider[]) => void
  addProvider: (provider: Provider) => void
  updateProvider: (id: string, updates: Partial<Provider>) => void
  removeProvider: (id: string) => void
  toggleEnabled: (id: string) => void
  setSelectedProviderId: (id: string | null) => void
  getProviderById: (id: string) => Provider | undefined
  getEnabledProviders: () => Provider[]
}

export const useProviderStore = create<ProviderState & ProviderActions>()(
  persist(
    (set, get) => ({
      providers: [],
      selectedProviderId: null,

      setProviders: (providers) => set({ providers }),

      addProvider: (provider) =>
        set((state) => ({ providers: [...state.providers, provider] })),

      updateProvider: (id, updates) =>
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          )
        })),

      removeProvider: (id) =>
        set((state) => ({
          providers: state.providers.filter((p) => p.id !== id),
          selectedProviderId:
            state.selectedProviderId === id ? null : state.selectedProviderId
        })),

      toggleEnabled: (id) =>
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === id ? { ...p, enabled: !p.enabled } : p
          )
        })),

      setSelectedProviderId: (id) => set({ selectedProviderId: id }),

      getProviderById: (id) => get().providers.find((p) => p.id === id),

      getEnabledProviders: () => get().providers.filter((p) => p.enabled)
    }),
    {
      name: 'angdu-providers',
      partialize: (state) => ({
        providers: state.providers.map((p) => ({
          ...p,
          apiKey: '' // Never persist API keys in localStorage — they're in safeStorage
        })),
        selectedProviderId: state.selectedProviderId
      })
    }
  )
)

// Stable selectors (avoid re-creating arrays/objects)
export const useProviders = () => useProviderStore((s) => s.providers, shallow)
export const useSelectedProviderId = () =>
  useProviderStore((s) => s.selectedProviderId)
