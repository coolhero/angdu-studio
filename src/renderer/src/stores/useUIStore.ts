import { create } from 'zustand'

interface UIState {
  theme: 'light' | 'dark'
  focused: boolean
  setTheme: (theme: 'light' | 'dark') => void
  setFocused: (focused: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  focused: true,
  setTheme: (theme) => set({ theme }),
  setFocused: (focused) => set({ focused })
}))

// Subscribe to IPC events — called once on app mount
export function initUIStoreListeners(): () => void {
  const unsubTheme = window.api.events.on('theme:changed', (theme) => {
    useUIStore.getState().setTheme(theme)
  })

  const unsubFocus = window.api.events.on('window:focus', () => {
    useUIStore.getState().setFocused(true)
  })

  const unsubBlur = window.api.events.on('window:blur', () => {
    useUIStore.getState().setFocused(false)
  })

  return () => {
    unsubTheme()
    unsubFocus()
    unsubBlur()
  }
}
