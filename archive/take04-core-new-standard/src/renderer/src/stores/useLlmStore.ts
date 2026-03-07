import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { broadcastSync } from './middleware/broadcastSync'

import type { Provider, Model, LlmSettings, CherryInTokenSettings } from '@shared/types'

// ── Default Models ──

const DEFAULT_MODEL: Model = {
  id: 'qwen3-next-80b',
  name: 'Qwen 3 Next 80B',
  provider: 'cherryin',
  group: 'Qwen'
}

const TOPIC_NAMING_MODEL: Model = {
  id: 'qwen3-8b',
  name: 'Qwen 3 8B',
  provider: 'cherryin',
  group: 'Qwen'
}

// ── Default Settings ──

const DEFAULT_SETTINGS: LlmSettings = {
  ollama: { keepAliveTime: 3600 },
  lmstudio: { keepAliveTime: 3600 },
  gpustack: { keepAliveTime: 3600 },
  vertexai: {
    serviceAccount: { privateKey: '', clientEmail: '' },
    projectId: '',
    location: 'us-central1'
  },
  awsBedrock: {
    authType: 'apiKey',
    accessKeyId: '',
    secretAccessKey: '',
    apiKey: '',
    region: 'us-east-1'
  },
  cherryIn: { accessToken: '', refreshToken: '' }
}

// ── Store Interface ──

interface LlmStoreState {
  // ── State ──
  providers: Provider[]
  defaultModel: Model
  topicNamingModel: Model
  quickModel: Model
  translateModel: Model
  settings: LlmSettings

  // ── Provider CRUD ──
  addProvider: (provider: Provider) => void
  removeProvider: (id: string) => void
  updateProvider: (id: string, update: Partial<Provider>) => void
  updateAll: (providers: Provider[]) => void
  moveProvider: (id: string, position: number) => void

  // ── Model CRUD ──
  addModel: (providerId: string, model: Model) => void
  removeModel: (providerId: string, modelId: string) => void
  updateModel: (providerId: string, modelId: string, update: Partial<Model>) => void

  // ── Default Model Setters ──
  setDefaultModel: (model: Model) => void
  setTopicNamingModel: (model: Model) => void
  setQuickModel: (model: Model) => void
  setTranslateModel: (model: Model) => void

  // ── CherryIN Tokens ──
  setCherryInTokens: (accessToken: string, refreshToken?: string) => void
  clearCherryInTokens: () => void
}

// ── Store ──

export const useLlmStore = create<LlmStoreState>()(
  persist(
    broadcastSync(
      (set) => ({
        // ── State ──
        providers: [],
        defaultModel: DEFAULT_MODEL,
        topicNamingModel: TOPIC_NAMING_MODEL,
        quickModel: DEFAULT_MODEL,
        translateModel: DEFAULT_MODEL,
        settings: DEFAULT_SETTINGS,

        // ── Provider CRUD ──

        addProvider: (provider) =>
          set((state) => ({
            providers: [provider, ...state.providers]
          })),

        removeProvider: (id) =>
          set((state) => {
            const target = state.providers.find((p) => p.id === id)
            if (target?.isSystem) {
              return state
            }
            return { providers: state.providers.filter((p) => p.id !== id) }
          }),

        updateProvider: (id, update) =>
          set((state) => ({
            providers: state.providers.map((p) => (p.id === id ? { ...p, ...update } : p))
          })),

        updateAll: (providers) => set({ providers }),

        moveProvider: (id, position) =>
          set((state) => {
            const providers = [...state.providers]
            const currentIndex = providers.findIndex((p) => p.id === id)
            if (currentIndex === -1) {
              return state
            }
            const [provider] = providers.splice(currentIndex, 1)
            providers.splice(position - 1, 0, provider)
            return { providers }
          }),

        // ── Model CRUD ──

        addModel: (providerId, model) =>
          set((state) => ({
            providers: state.providers.map((p) => {
              if (p.id !== providerId) return p
              const isDuplicate = p.models.some((m) => m.id === model.id)
              if (isDuplicate) return p
              return { ...p, models: [...p.models, model], enabled: true }
            })
          })),

        removeModel: (providerId, modelId) =>
          set((state) => ({
            providers: state.providers.map((p) => {
              if (p.id !== providerId) return p
              return { ...p, models: p.models.filter((m) => m.id !== modelId) }
            })
          })),

        updateModel: (providerId, modelId, update) =>
          set((state) => ({
            providers: state.providers.map((p) => {
              if (p.id !== providerId) return p
              return {
                ...p,
                models: p.models.map((m) => (m.id === modelId ? { ...m, ...update } : m))
              }
            })
          })),

        // ── Default Model Setters ──

        setDefaultModel: (model) => set({ defaultModel: model }),
        setTopicNamingModel: (model) => set({ topicNamingModel: model }),
        setQuickModel: (model) => set({ quickModel: model }),
        setTranslateModel: (model) => set({ translateModel: model }),

        // ── CherryIN Tokens ──

        setCherryInTokens: (accessToken, refreshToken) =>
          set((state) => ({
            settings: {
              ...state.settings,
              cherryIn: {
                accessToken,
                refreshToken: refreshToken ?? state.settings.cherryIn.refreshToken
              }
            }
          })),

        clearCherryInTokens: () =>
          set((state) => ({
            settings: {
              ...state.settings,
              cherryIn: { accessToken: '', refreshToken: '' }
            }
          }))
      }),
      'cherry-studio-llm'
    ),
    {
      name: 'cherry-studio-llm',
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0) {
          return persistedState as LlmStoreState
        }
        return persistedState as LlmStoreState
      },
      partialize: (state) => ({
        providers: state.providers,
        defaultModel: state.defaultModel,
        topicNamingModel: state.topicNamingModel,
        quickModel: state.quickModel,
        translateModel: state.translateModel,
        settings: state.settings
      })
    }
  )
)
