import { create } from 'zustand'
import type { ThemeMode } from '@shared/types'

interface ThemeState {
  themeMode: ThemeMode
  resolvedTheme: 'dark' | 'light'
  setThemeMode: (mode: ThemeMode) => void
  setResolvedTheme: (resolved: 'dark' | 'light') => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeMode: 'system' as ThemeMode,
  resolvedTheme: 'light',

  setThemeMode: (mode) => set({ themeMode: mode }),
  setResolvedTheme: (resolved) => {
    set({ resolvedTheme: resolved })
    // Toggle .dark class on <html>
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
}))
