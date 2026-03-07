import { create } from 'zustand'

// ── Store Interface ──

interface RuntimeStoreState {
  // ── State ──
  activeAssistantId: string | null
  activeTopicId: string | null
  generating: Record<string, boolean>
  streamingMessageId: string | null
  renamingTopics: Set<string>

  // ── Actions ──
  setActiveAssistant: (id: string) => void
  setActiveTopic: (id: string) => void
  setGenerating: (topicId: string, value: boolean) => void
  setStreamingMessage: (messageId: string | null) => void
  addRenamingTopic: (topicId: string) => void
  removeRenamingTopic: (topicId: string) => void
}

// ── Store ──

export const useRuntimeStore = create<RuntimeStoreState>()((set) => ({
  // ── State ──
  activeAssistantId: null,
  activeTopicId: null,
  generating: {},
  streamingMessageId: null,
  renamingTopics: new Set(),

  // ── Actions ──

  setActiveAssistant: (id) => set({ activeAssistantId: id }),

  setActiveTopic: (id) => set({ activeTopicId: id }),

  setGenerating: (topicId, value) =>
    set((state) => ({
      generating: { ...state.generating, [topicId]: value }
    })),

  setStreamingMessage: (messageId) => set({ streamingMessageId: messageId }),

  addRenamingTopic: (topicId) =>
    set((state) => ({
      renamingTopics: new Set(state.renamingTopics).add(topicId)
    })),

  removeRenamingTopic: (topicId) =>
    set((state) => {
      const renamingTopics = new Set(state.renamingTopics)
      renamingTopics.delete(topicId)
      return { renamingTopics }
    })
}))
