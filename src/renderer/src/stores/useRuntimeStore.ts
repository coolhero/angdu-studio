import { create } from 'zustand'

export type AppPage = 'chat' | 'settings' | 'files' | 'minapps' | 'minapp'

interface RuntimeState {
  activePage: AppPage
  activeMinAppId: string | null
  activeAssistantId: string | null
  activeTopicId: string | null
  activeSessionId: string | null
  activeAgentId: string | null
  isMultiSelectMode: boolean
  selectedMessageIds: Set<string>
  generatingTopicIds: Set<string>

  isGenerating: (topicId: string) => boolean
  canSendMessage: (topicId: string) => boolean
  canSwitchTopic: () => boolean
  setActivePage: (page: AppPage) => void
  setActiveMinApp: (id: string | null) => void
  setActiveAssistant: (id: string | null) => void
  setActiveTopic: (id: string | null) => void
  setActiveSession: (id: string | null) => void
  setActiveAgent: (id: string | null) => void
  toggleMultiSelect: () => void
  selectMessage: (id: string) => void
  deselectMessage: (id: string) => void
  clearSelection: () => void
  setGenerating: (topicId: string, isGenerating: boolean) => void
}

export const useRuntimeStore = create<RuntimeState>()((set, get) => ({
  activePage: 'chat' as AppPage,
  activeMinAppId: null,
  activeAssistantId: null,
  activeTopicId: null,
  activeSessionId: null,
  activeAgentId: null,
  isMultiSelectMode: false,
  selectedMessageIds: new Set<string>(),
  generatingTopicIds: new Set<string>(),

  isGenerating: (topicId: string) => get().generatingTopicIds.has(topicId),

  canSendMessage: (topicId: string) => !get().generatingTopicIds.has(topicId),

  canSwitchTopic: () => get().generatingTopicIds.size === 0,

  setActivePage: (page) => set({ activePage: page }),
  setActiveMinApp: (id) => set({ activeMinAppId: id }),
  setActiveAssistant: (id) => set({ activeAssistantId: id }),
  setActiveTopic: (id) => set({ activeTopicId: id }),
  setActiveSession: (id) => set({ activeSessionId: id }),
  setActiveAgent: (id) => set({ activeAgentId: id }),

  toggleMultiSelect: () =>
    set((state) => ({
      isMultiSelectMode: !state.isMultiSelectMode,
      selectedMessageIds: state.isMultiSelectMode ? new Set<string>() : state.selectedMessageIds,
    })),

  selectMessage: (id) =>
    set((state) => {
      const next = new Set(state.selectedMessageIds)
      next.add(id)
      return { selectedMessageIds: next }
    }),

  deselectMessage: (id) =>
    set((state) => {
      const next = new Set(state.selectedMessageIds)
      next.delete(id)
      return { selectedMessageIds: next }
    }),

  clearSelection: () => set({ selectedMessageIds: new Set<string>(), isMultiSelectMode: false }),

  setGenerating: (topicId, generating) =>
    set((state) => {
      const next = new Set(state.generatingTopicIds)
      if (generating) {
        next.add(topicId)
      } else {
        next.delete(topicId)
      }
      return { generatingTopicIds: next }
    }),
}))
