import { create } from 'zustand'
import type { AppInfo, PlatformInfo } from '@shared/types'

interface AppState {
  appInfo: AppInfo | null
  platformInfo: PlatformInfo | null
  hydrated: boolean
  hydrate: () => Promise<void>
}

export const useAppStore = create<AppState>((set) => ({
  appInfo: null,
  platformInfo: null,
  hydrated: false,

  hydrate: async () => {
    const [appInfo, platformInfo] = await Promise.all([
      window.api.getAppInfo(),
      window.api.config.get('platformInfo') as Promise<PlatformInfo | null>
    ])
    set({ appInfo, platformInfo, hydrated: true })
  }
}))
