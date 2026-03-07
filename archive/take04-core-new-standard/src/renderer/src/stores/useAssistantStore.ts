import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { broadcastSync } from './middleware/broadcastSync'

import type { Assistant, AssistantSettings, Topic } from '@shared/types'

// ── Default Assistant ──

const DEFAULT_ASSISTANT: Assistant = {
  id: 'default',
  name: 'Default Assistant',
  prompt: '',
  model: null,
  defaultModel: null,
  settings: { contextCount: 5, streamOutput: true },
  topics: [],
  type: 'default'
}

// ── Store Interface ──

interface AssistantStoreState {
  // ── State ──
  defaultAssistant: Assistant
  assistants: Assistant[]
  tagsOrder: string[]
  collapsedTags: Record<string, boolean>

  // ── Actions ──
  addAssistant: (assistant: Assistant) => void
  removeAssistant: (id: string) => void
  updateAssistant: (id: string, updates: Partial<Assistant>) => void
  updateAssistantSettings: (id: string, settings: Partial<AssistantSettings>) => void
  addTopic: (assistantId: string, topic: Topic) => void
  removeTopic: (assistantId: string, topicId: string) => void
  updateTopic: (assistantId: string, topic: Partial<Topic> & { id: string }) => void
  updateTopics: (assistantId: string, topics: Topic[]) => void
  removeAllTopics: (assistantId: string) => void
  setDefaultAssistant: (assistant: Assistant) => void

  // ── Selectors ──
  getAssistant: (id: string) => Assistant | undefined
  getAllTopics: () => Topic[]
  getTopicsForAssistant: (id: string) => Topic[]
}

// ── Store ──

export const useAssistantStore = create<AssistantStoreState>()(
  persist(
    broadcastSync(
      (set, get) => ({
        // ── State ──
        defaultAssistant: DEFAULT_ASSISTANT,
        assistants: [],
        tagsOrder: [],
        collapsedTags: {},

        // ── Actions ──

        addAssistant: (assistant) =>
          set((state) => ({
            assistants: [assistant, ...state.assistants]
          })),

        removeAssistant: (id) =>
          set((state) => ({
            assistants: state.assistants.filter((a) => a.id !== id)
          })),

        updateAssistant: (id, updates) =>
          set((state) => ({
            assistants: state.assistants.map((a) => (a.id === id ? { ...a, ...updates } : a))
          })),

        updateAssistantSettings: (id, settings) =>
          set((state) => ({
            assistants: state.assistants.map((a) =>
              a.id === id ? { ...a, settings: { ...a.settings, ...settings } } : a
            )
          })),

        addTopic: (assistantId, topic) =>
          set((state) => ({
            assistants: state.assistants.map((a) => {
              if (a.id !== assistantId) return a
              const isDuplicate = a.topics.some((t) => t.id === topic.id)
              if (isDuplicate) return a
              return { ...a, topics: [topic, ...a.topics] }
            })
          })),

        removeTopic: (assistantId, topicId) =>
          set((state) => ({
            assistants: state.assistants.map((a) => {
              if (a.id !== assistantId) return a
              return { ...a, topics: a.topics.filter((t) => t.id !== topicId) }
            })
          })),

        updateTopic: (assistantId, topic) =>
          set((state) => ({
            assistants: state.assistants.map((a) => {
              if (a.id !== assistantId) return a
              return {
                ...a,
                topics: a.topics.map((t) => (t.id === topic.id ? { ...t, ...topic } : t))
              }
            })
          })),

        updateTopics: (assistantId, topics) =>
          set((state) => ({
            assistants: state.assistants.map((a) =>
              a.id === assistantId ? { ...a, topics } : a
            )
          })),

        removeAllTopics: (assistantId) =>
          set((state) => ({
            assistants: state.assistants.map((a) =>
              a.id === assistantId ? { ...a, topics: [] } : a
            )
          })),

        setDefaultAssistant: (assistant) => set({ defaultAssistant: assistant }),

        // ── Selectors ──

        getAssistant: (id) => get().assistants.find((a) => a.id === id),

        getAllTopics: () => get().assistants.flatMap((a) => a.topics),

        getTopicsForAssistant: (id) => get().assistants.find((a) => a.id === id)?.topics ?? []
      }),
      'cherry-studio-assistant'
    ),
    {
      name: 'cherry-studio-assistant',
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0) {
          return persistedState as AssistantStoreState
        }
        return persistedState as AssistantStoreState
      },
      partialize: (state) => ({
        defaultAssistant: state.defaultAssistant,
        assistants: state.assistants,
        tagsOrder: state.tagsOrder,
        collapsedTags: state.collapsedTags
      })
    }
  )
)
