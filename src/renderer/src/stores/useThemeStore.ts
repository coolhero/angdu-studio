import { create } from 'zustand'
import type { ThemeMode, ResolvedTheme } from '@shared/types/theme'

interface ThemeStore {
  mode: ThemeMode
  resolved: ResolvedTheme
  setTheme: (mode: ThemeMode) => void
  setResolved: (resolved: ResolvedTheme) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: 'system',
  resolved: 'light',
  setTheme: (mode) => {
    set({ mode })
    window.api.theme.set(mode)
  },
  setResolved: (resolved) => set({ resolved })
}))
