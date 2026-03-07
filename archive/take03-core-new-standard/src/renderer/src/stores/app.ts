import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  platform: 'darwin' | 'win32' | 'linux' | ''
  isPortable: boolean
  version: string
  setPlatform: (platform: AppState['platform']) => void
  setIsPortable: (isPortable: boolean) => void
  setVersion: (version: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      platform: '',
      isPortable: false,
      version: '',
      setPlatform: (platform) => set({ platform }),
      setIsPortable: (isPortable) => set({ isPortable }),
      setVersion: (version) => set({ version })
    }),
    {
      name: 'cherry-studio-app',
      version: 1,
      partialize: (state) => ({
        platform: state.platform,
        isPortable: state.isPortable,
        version: state.version
      })
    }
  )
)
