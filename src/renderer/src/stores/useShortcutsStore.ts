import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export interface Shortcut {
  id: string
  name: string
  keys: string
  action: string
}

const DEFAULT_SHORTCUTS: Shortcut[] = [
  { id: 'newTopic', name: 'shortcuts.newTopic', keys: 'mod+n', action: 'newTopic' },
  { id: 'search', name: 'shortcuts.search', keys: 'mod+f', action: 'search' },
  { id: 'toggleSidebar', name: 'shortcuts.toggleSidebar', keys: 'mod+b', action: 'toggleSidebar' },
  { id: 'settings', name: 'shortcuts.settings', keys: 'mod+,', action: 'settings' },
  {
    id: 'clearMessages',
    name: 'shortcuts.clearMessages',
    keys: 'mod+shift+backspace',
    action: 'clearMessages'
  },
  { id: 'toggleFullScreen', name: 'shortcuts.toggleFullScreen', keys: 'f11', action: 'toggleFullScreen' }
]

interface ShortcutsStoreState {
  shortcuts: Shortcut[]
  updateShortcut: (id: string, keys: string) => void
  resetShortcut: (id: string) => void
  resetAllShortcuts: () => void
  hasConflict: (id: string, keys: string) => Shortcut | undefined
}

export const useShortcutsStore = create<ShortcutsStoreState>()(
  persist(
    immer((set, get) => ({
      shortcuts: structuredClone(DEFAULT_SHORTCUTS),

      updateShortcut: (id: string, keys: string) =>
        set((state) => {
          const shortcut = state.shortcuts.find((s) => s.id === id)
          if (shortcut) shortcut.keys = keys
        }),

      resetShortcut: (id: string) =>
        set((state) => {
          const shortcut = state.shortcuts.find((s) => s.id === id)
          const defaultShortcut = DEFAULT_SHORTCUTS.find((s) => s.id === id)
          if (shortcut && defaultShortcut) {
            shortcut.keys = defaultShortcut.keys
          }
        }),

      resetAllShortcuts: () =>
        set((state) => {
          state.shortcuts = structuredClone(DEFAULT_SHORTCUTS) as Shortcut[]
        }),

      hasConflict: (id: string, keys: string) => {
        return get().shortcuts.find((s) => s.id !== id && s.keys === keys)
      }
    })),
    {
      name: 'angdu-shortcuts',
      partialize: (state) => ({
        shortcuts: state.shortcuts
      })
    }
  )
)
