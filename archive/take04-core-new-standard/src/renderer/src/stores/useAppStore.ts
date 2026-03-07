import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { broadcastSync } from './middleware/broadcastSync'

interface AppState {
  theme: 'light' | 'dark' | 'auto'
  language: string
  sidebarOpen: boolean
  setTheme: (theme: 'light' | 'dark' | 'auto') => void
  setLanguage: (language: string) => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    broadcastSync(
      (set) => ({
        theme: 'auto',
        language: 'en-US',
        sidebarOpen: true,
        setTheme: (theme) => set({ theme }),
        setLanguage: (language) => set({ language }),
        toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen }))
      }),
      'cherry-studio-app'
    ),
    {
      name: 'cherry-studio-app',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        sidebarOpen: state.sidebarOpen
      })
    }
  )
)
