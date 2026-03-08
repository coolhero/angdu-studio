import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Provider, Model, LlmSettings, ProviderStoreState } from '../types/provider'

export const useProviderStore = create<ProviderStoreState>()(
  persist(
    immer((set) => ({
      providers: [] as Provider[],
      defaultModel: undefined,
      quickModel: undefined,
      translateModel: undefined,
      settings: {} as LlmSettings,

      // ── Provider CRUD ──

      addProvider: (provider: Provider) =>
        set((state) => {
          state.providers.push(provider)
        }),

      updateProvider: (id: string, updates: Partial<Provider>) =>
        set((state) => {
          const index = state.providers.findIndex((p) => p.id === id)
          if (index !== -1) {
            Object.assign(state.providers[index], updates)
          }
        }),

      removeProvider: (id: string) =>
        set((state) => {
          const provider = state.providers.find((p) => p.id === id)
          if (provider?.isSystem) return // System providers cannot be deleted
          state.providers = state.providers.filter((p) => p.id !== id)
        }),

      reorderProviders: (ids: string[]) =>
        set((state) => {
          const ordered: Provider[] = []
          for (const id of ids) {
            const provider = state.providers.find((p) => p.id === id)
            if (provider) ordered.push(provider)
          }
          // Append any providers not in the new order
          for (const provider of state.providers) {
            if (!ids.includes(provider.id)) ordered.push(provider)
          }
          state.providers = ordered
        }),

      setEnabled: (id: string, enabled: boolean) =>
        set((state) => {
          const provider = state.providers.find((p) => p.id === id)
          if (provider) provider.enabled = enabled
        }),

      // ── Model Management ──

      addModel: (providerId: string, model: Model) =>
        set((state) => {
          const provider = state.providers.find((p) => p.id === providerId)
          if (provider) {
            provider.models.push(model)
          }
        }),

      removeModel: (providerId: string, modelId: string) =>
        set((state) => {
          const provider = state.providers.find((p) => p.id === providerId)
          if (provider) {
            provider.models = provider.models.filter((m) => m.id !== modelId)
          }
        }),

      updateModel: (providerId: string, modelId: string, updates: Partial<Model>) =>
        set((state) => {
          const provider = state.providers.find((p) => p.id === providerId)
          if (provider) {
            const model = provider.models.find((m) => m.id === modelId)
            if (model) Object.assign(model, updates)
          }
        }),

      // ── Model Selection ──

      setDefaultModel: (model: Model | undefined) =>
        set((state) => {
          state.defaultModel = model as ProviderStoreState['defaultModel']
        }),

      setQuickModel: (model: Model | undefined) =>
        set((state) => {
          state.quickModel = model as ProviderStoreState['quickModel']
        }),

      setTranslateModel: (model: Model | undefined) =>
        set((state) => {
          state.translateModel = model as ProviderStoreState['translateModel']
        }),

      // ── Settings ──

      updateSettings: (updates: Partial<LlmSettings>) =>
        set((state) => {
          Object.assign(state.settings, updates)
        })
    })),
    {
      name: 'provider-store',
      partialize: (state) => ({
        providers: state.providers,
        defaultModel: state.defaultModel,
        quickModel: state.quickModel,
        translateModel: state.translateModel,
        settings: state.settings
      })
    }
  )
)
