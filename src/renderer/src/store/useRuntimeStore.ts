import { create } from 'zustand'

interface RuntimeState {
  windowVisible: boolean
  isFullScreen: boolean
  updateAvailable: boolean
  updateVersion: string | null
  setWindowVisible: (visible: boolean) => void
  setFullScreen: (fullScreen: boolean) => void
  setUpdateAvailable: (available: boolean, version?: string) => void
}

export const useRuntimeStore = create<RuntimeState>((set) => ({
  windowVisible: true,
  isFullScreen: false,
  updateAvailable: false,
  updateVersion: null,
  setWindowVisible: (visible) => set({ windowVisible: visible }),
  setFullScreen: (fullScreen) => set({ isFullScreen: fullScreen }),
  setUpdateAvailable: (available, version) =>
    set({ updateAvailable: available, updateVersion: version ?? null }),
}))
