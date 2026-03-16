import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { Message } from '@shared/types/message'

interface MessageState {
  messages: Message[]
  hasMore: boolean
  isLoading: boolean
  currentTopicId: string | null
}

interface MessageActions {
  loadMessages: (topicId: string) => Promise<void>
  loadMore: () => Promise<void>
  addMessage: (data: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Message>
  updateMessage: (id: string, updates: Partial<Message>) => Promise<Message>
  deleteMessage: (id: string) => Promise<void>
  deleteMessagesAfter: (topicId: string, afterMessageId: string) => Promise<void>
  /** In-memory update without IPC — used during streaming */
  patchMessageLocal: (id: string, updates: Partial<Message>) => void
  clearMessages: () => void
}

const PAGE_SIZE = 50

export const useMessageStore = create<MessageState & MessageActions>((set, get) => ({
  messages: [],
  hasMore: false,
  isLoading: false,
  currentTopicId: null,

  loadMessages: async (topicId: string) => {
    if (get().isLoading) return
    set({ isLoading: true, currentTopicId: topicId })
    try {
      const result = await window.api.invoke['chat:getMessages'](topicId, 0, PAGE_SIZE)
      set({ messages: result.messages, hasMore: result.hasMore, isLoading: false })
    } catch (err) {
      console.error('[useMessageStore] Failed to load messages', err)
      set({ messages: [], hasMore: false, isLoading: false })
    }
  },

  loadMore: async () => {
    const { currentTopicId, messages, hasMore, isLoading } = get()
    if (!currentTopicId || !hasMore || isLoading) return
    set({ isLoading: true })
    try {
      const result = await window.api.invoke['chat:getMessages'](
        currentTopicId,
        messages.length,
        PAGE_SIZE
      )
      set((s) => ({
        messages: [...s.messages, ...result.messages],
        hasMore: result.hasMore,
        isLoading: false
      }))
    } catch (err) {
      console.error('[useMessageStore] Failed to load more messages', err)
      set({ isLoading: false })
    }
  },

  addMessage: async (data) => {
    const message = await window.api.invoke['chat:addMessage'](data)
    set((s) => ({ messages: [...s.messages, message] }))
    return message
  },

  updateMessage: async (id, updates) => {
    const message = await window.api.invoke['chat:updateMessage'](id, updates)
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? message : m))
    }))
    return message
  },

  deleteMessage: async (id) => {
    await window.api.invoke['chat:deleteMessage'](id)
    set((s) => ({ messages: s.messages.filter((m) => m.id !== id) }))
  },

  deleteMessagesAfter: async (topicId, afterMessageId) => {
    await window.api.invoke['chat:deleteMessagesAfter'](topicId, afterMessageId)
    const idx = get().messages.findIndex((m) => m.id === afterMessageId)
    if (idx >= 0) {
      set((s) => ({ messages: s.messages.slice(0, idx + 1) }))
    }
  },

  patchMessageLocal: (id, updates) => {
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...updates } : m))
    }))
  },

  clearMessages: () => set({ messages: [], hasMore: false, currentTopicId: null })
}))

// Stable selectors
export const useMessages = () => useMessageStore(useShallow((s) => s.messages))
export const useHasMoreMessages = () => useMessageStore((s) => s.hasMore)
export const useMessagesLoading = () => useMessageStore((s) => s.isLoading)
