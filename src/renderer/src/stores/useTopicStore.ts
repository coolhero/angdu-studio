import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import type { Topic } from '@shared/types/topic'

interface TopicState {
  topics: Topic[]
  activeTopicId: string | null
  sidebarVisible: boolean
}

interface TopicActions {
  loadTopics: (assistantId: string) => Promise<void>
  createTopic: (assistantId: string, name?: string) => Promise<Topic>
  deleteTopic: (topicId: string) => Promise<void>
  renameTopic: (topicId: string, name: string) => Promise<void>
  setActiveTopicId: (id: string | null) => void
  toggleSidebar: () => void
  setSidebarVisible: (visible: boolean) => void
  clearTopics: () => void
}

export const useTopicStore = create<TopicState & TopicActions>()(
  persist(
    (set, get) => ({
      topics: [],
      activeTopicId: null,
      sidebarVisible: true,

      loadTopics: async (assistantId: string) => {
        try {
          const topics = await window.api.invoke['chat:getTopics'](assistantId)
          set({ topics })
        } catch (err) {
          console.error('[useTopicStore] Failed to load topics', err)
          set({ topics: [] })
        }
      },

      createTopic: async (assistantId: string, name?: string) => {
        const topic = await window.api.invoke['chat:createTopic'](assistantId, name)
        set((s) => ({ topics: [topic, ...s.topics], activeTopicId: topic.id }))
        return topic
      },

      deleteTopic: async (topicId: string) => {
        await window.api.invoke['chat:deleteTopic'](topicId)
        set((s) => {
          const topics = s.topics.filter((t) => t.id !== topicId)
          const activeTopicId =
            s.activeTopicId === topicId ? (topics[0]?.id ?? null) : s.activeTopicId
          return { topics, activeTopicId }
        })
      },

      renameTopic: async (topicId: string, name: string) => {
        await window.api.invoke['chat:renameTopic'](topicId, name)
        set((s) => ({
          topics: s.topics.map((t) =>
            t.id === topicId ? { ...t, name, isNameManuallyEdited: true } : t
          )
        }))
      },

      setActiveTopicId: (id) => set({ activeTopicId: id }),

      toggleSidebar: () => set((s) => ({ sidebarVisible: !s.sidebarVisible })),

      setSidebarVisible: (visible) => set({ sidebarVisible: visible }),

      clearTopics: () => set({ topics: [], activeTopicId: null })
    }),
    {
      name: 'angdu-topics',
      partialize: (state) => ({
        activeTopicId: state.activeTopicId,
        sidebarVisible: state.sidebarVisible
      })
    }
  )
)

// Stable selectors
export const useTopics = () => useTopicStore(useShallow((s) => s.topics))
export const useActiveTopicId = () => useTopicStore((s) => s.activeTopicId)
export const useSidebarVisible = () => useTopicStore((s) => s.sidebarVisible)
