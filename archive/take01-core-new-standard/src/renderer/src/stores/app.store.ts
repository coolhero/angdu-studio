import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AppState {
  theme: 'light' | 'dark' | 'system'
  language: string
  isMaximized: boolean
  platform: string
}

interface AppActions {
  setTheme: (theme: AppState['theme']) => void
  setLanguage: (language: string) => void
  setIsMaximized: (isMaximized: boolean) => void
  setPlatform: (platform: string) => void
}

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set) => ({
      theme: 'system',
      language: 'en',
      isMaximized: false,
      platform: '',

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setIsMaximized: (isMaximized) => set({ isMaximized }),
      setPlatform: (platform) => set({ platform })
    }),
    {
      name: 'cherry-studio-app',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language
      })
    }
  )
)
