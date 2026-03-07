import { create } from 'zustand'

interface AppStore {
  version: string
  platform: string
  dataPath: string
  isPortable: boolean
  setAppInfo: (info: { version: string; platform: string; isPortable: boolean }) => void
  setDataPath: (path: string) => void
}

export const useAppStore = create<AppStore>((set) => ({
  version: '',
  platform: '',
  dataPath: '',
  isPortable: false,
  setAppInfo: (info) =>
    set({ version: info.version, platform: info.platform, isPortable: info.isPortable }),
  setDataPath: (dataPath) => set({ dataPath })
}))
