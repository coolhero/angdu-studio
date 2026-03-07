import { create } from 'zustand'
import type { Shortcut } from '@shared/types/shortcut'

export interface ShortcutsState {
  shortcuts: Shortcut[]
}

interface ShortcutsActions {
  addShortcut: (shortcut: Shortcut) => void
  removeShortcut: (id: string) => void
  updateShortcut: (id: string, updates: Partial<Omit<Shortcut, 'id'>>) => void
  setShortcuts: (shortcuts: Shortcut[]) => void
}

export const useShortcutsStore = create<ShortcutsState & ShortcutsActions>()((set) => ({
  shortcuts: [],

  addShortcut: (shortcut) =>
    set((state) => ({
      shortcuts: [...state.shortcuts, shortcut]
    })),

  removeShortcut: (id) =>
    set((state) => ({
      shortcuts: state.shortcuts.filter((s) => s.id !== id)
    })),

  updateShortcut: (id, updates) =>
    set((state) => ({
      shortcuts: state.shortcuts.map((s) => (s.id === id ? { ...s, ...updates } : s))
    })),

  setShortcuts: (shortcuts) => set({ shortcuts })
}))
