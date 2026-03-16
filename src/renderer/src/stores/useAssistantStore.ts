import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { Assistant } from '@shared/types/assistant'
import { DEFAULT_ASSISTANT } from '@shared/types/assistant'

interface AssistantState {
  assistants: Assistant[]
  activeAssistantId: string
  isHydrated: boolean
}

interface AssistantActions {
  hydrate: () => Promise<void>
  setActiveAssistantId: (id: string) => void
  getActiveAssistant: () => Assistant
  addAssistant: (data: Omit<Assistant, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Assistant>
  updateAssistant: (id: string, updates: Partial<Assistant>) => Promise<Assistant>
  deleteAssistant: (id: string) => Promise<void>
  importAssistants: (data: string) => Promise<Assistant[]>
  exportAssistants: (ids: string[]) => Promise<string>
}

export const useAssistantStore = create<AssistantState & AssistantActions>((set, get) => ({
  assistants: [DEFAULT_ASSISTANT],
  activeAssistantId: 'default',
  isHydrated: false,

  hydrate: async () => {
    try {
      const assistants = await window.api.invoke['assistant:getAll']()
      const hasDefault = assistants.some((a) => a.id === 'default')
      const list = hasDefault ? assistants : [DEFAULT_ASSISTANT, ...assistants]
      set({ assistants: list, isHydrated: true })
    } catch (err) {
      console.error('[useAssistantStore] Hydration failed', err)
      set({ assistants: [DEFAULT_ASSISTANT], isHydrated: true })
    }
  },

  setActiveAssistantId: (id: string) => {
    set({ activeAssistantId: id })
  },

  getActiveAssistant: () => {
    const { assistants, activeAssistantId } = get()
    return assistants.find((a) => a.id === activeAssistantId) ?? DEFAULT_ASSISTANT
  },

  addAssistant: async (data) => {
    const assistant = await window.api.invoke['assistant:add'](data)
    set((s) => ({ assistants: [...s.assistants, assistant] }))
    return assistant
  },

  updateAssistant: async (id, updates) => {
    const assistant = await window.api.invoke['assistant:update'](id, updates)
    set((s) => ({
      assistants: s.assistants.map((a) => (a.id === id ? assistant : a))
    }))
    return assistant
  },

  deleteAssistant: async (id) => {
    await window.api.invoke['assistant:delete'](id)
    set((s) => ({
      assistants: s.assistants.filter((a) => a.id !== id),
      activeAssistantId: s.activeAssistantId === id ? 'default' : s.activeAssistantId
    }))
  },

  importAssistants: async (data) => {
    const imported = await window.api.invoke['assistant:import'](data)
    set((s) => ({ assistants: [...s.assistants, ...imported] }))
    return imported
  },

  exportAssistants: async (ids) => {
    return window.api.invoke['assistant:export'](ids)
  }
}))

// Stable selectors
export const useAssistants = () => useAssistantStore(useShallow((s) => s.assistants))
export const useActiveAssistantId = () => useAssistantStore((s) => s.activeAssistantId)
export const useAssistantHydrated = () => useAssistantStore((s) => s.isHydrated)
