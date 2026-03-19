import { create } from 'zustand'
import type { MemoryItem, MemoryConfig } from '@shared/types/knowledge'

interface MemoryUser {
  userId: string
  count: number
}

interface MemoryState {
  memories: MemoryItem[]
  total: number
  selectedUserId: string | null
  loading: boolean
  config: MemoryConfig | null
  users: MemoryUser[]
}

interface MemoryActions {
  loadMemories: (userId: string, page?: number, search?: string) => Promise<void>
  addMemory: (userId: string, content: string) => Promise<MemoryItem>
  updateMemory: (id: string, content: string) => Promise<MemoryItem | null>
  deleteMemory: (id: string) => Promise<void>
  loadUsers: () => Promise<void>
  loadConfig: () => Promise<void>
  updateConfig: (partial: Partial<MemoryConfig>) => Promise<MemoryConfig>
  setSelectedUser: (userId: string | null) => void
}

export const useMemoryStore = create<MemoryState & MemoryActions>((set, get) => ({
  memories: [],
  total: 0,
  selectedUserId: null,
  loading: false,
  config: null,
  users: [],

  loadMemories: async (userId: string, page?: number, search?: string) => {
    set({ loading: true })
    try {
      const result = await window.api.invoke['memory:list'](userId, page, undefined, search)
      set({ memories: result.items, total: result.total, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  addMemory: async (userId: string, content: string) => {
    const item = await window.api.invoke['memory:add'](userId, content)
    const { selectedUserId } = get()
    if (selectedUserId === userId) {
      set((s) => ({
        memories: [item, ...s.memories],
        total: s.total + 1
      }))
    }
    return item
  },

  updateMemory: async (id: string, content: string) => {
    const updated = await window.api.invoke['memory:update'](id, content)
    if (updated) {
      set((s) => ({
        memories: s.memories.map((m) => (m.id === id ? updated : m))
      }))
    }
    return updated
  },

  deleteMemory: async (id: string) => {
    await window.api.invoke['memory:delete'](id)
    set((s) => ({
      memories: s.memories.filter((m) => m.id !== id),
      total: Math.max(0, s.total - 1)
    }))
  },

  loadUsers: async () => {
    const users = await window.api.invoke['memory:getUsersList']()
    set({ users })
  },

  loadConfig: async () => {
    const config = await window.api.invoke['memory:getConfig']()
    set({ config })
  },

  updateConfig: async (partial: Partial<MemoryConfig>) => {
    const config = await window.api.invoke['memory:updateConfig'](partial)
    set({ config })
    return config
  },

  setSelectedUser: (userId: string | null) => {
    set({ selectedUserId: userId })
  }
}))

// --- Referentially stable selectors ---

export const useMemories = (): MemoryItem[] => useMemoryStore((s) => s.memories)
export const useMemoryTotal = (): number => useMemoryStore((s) => s.total)
export const useMemoryLoading = (): boolean => useMemoryStore((s) => s.loading)
export const useMemoryConfig = (): MemoryConfig | null => useMemoryStore((s) => s.config)
export const useMemoryUsers = (): MemoryUser[] => useMemoryStore((s) => s.users)
export const useSelectedUserId = (): string | null => useMemoryStore((s) => s.selectedUserId)
