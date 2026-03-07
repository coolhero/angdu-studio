import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { broadcast } from './middleware/broadcast'
import type { ThemeMode } from '@shared/types'

interface ThemeState {
  mode: ThemeMode
  isDark: boolean
  setMode: (mode: ThemeMode) => void
  setIsDark: (isDark: boolean) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    broadcast(
      (set) => ({
        mode: 'system' as ThemeMode,
        isDark: false,
        setMode: (mode) => set({ mode }),
        setIsDark: (isDark) => set({ isDark })
      }),
      { channelName: 'theme-sync', syncedKeys: ['mode', 'isDark'] }
    ),
    {
      name: 'cherry-studio-theme',
      version: 1,
      partialize: (state) => ({ mode: state.mode })
    }
  )
)
