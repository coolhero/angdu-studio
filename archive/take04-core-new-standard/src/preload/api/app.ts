import { ipcRenderer } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import type { ProxyConfig } from '@shared/types'

export const appApi = {
  info: () => ipcRenderer.invoke(IpcChannel.App_Info),
  reload: () => ipcRenderer.invoke(IpcChannel.App_Reload),
  quit: () => ipcRenderer.invoke(IpcChannel.App_Quit),
  setTheme: (mode: string) => ipcRenderer.invoke(IpcChannel.App_SetTheme, mode),
  getTheme: () => ipcRenderer.invoke(IpcChannel.App_GetTheme),
  setLanguage: (locale: string) => ipcRenderer.invoke(IpcChannel.App_SetLanguage, locale),
  getLocale: () => ipcRenderer.invoke(IpcChannel.App_GetLocale),
  setProxy: (config: ProxyConfig) => ipcRenderer.invoke(IpcChannel.App_SetProxy, config),
  getProxy: () => ipcRenderer.invoke(IpcChannel.App_GetProxy),
  setZoomFactor: (factor: number) => ipcRenderer.invoke(IpcChannel.App_SetZoomFactor, factor),
  getZoomFactor: () => ipcRenderer.invoke(IpcChannel.App_GetZoomFactor),
  getPath: (name: string) => ipcRenderer.invoke(IpcChannel.App_GetPath, name),
  getSystemInfo: () => ipcRenderer.invoke(IpcChannel.App_GetSystemInfo),
  getCacheSize: () => ipcRenderer.invoke(IpcChannel.App_GetCacheSize),
  clearCache: () => ipcRenderer.invoke(IpcChannel.App_ClearCache),
  setLaunchOnBoot: (enabled: boolean) => ipcRenderer.invoke(IpcChannel.App_SetLaunchOnBoot, enabled),
  getLoginItem: () => ipcRenderer.invoke(IpcChannel.App_GetLoginItem),
  setAlwaysOnTop: (flag: boolean) => ipcRenderer.invoke(IpcChannel.App_SetAlwaysOnTop, flag),
  toggleFullScreen: () => ipcRenderer.invoke(IpcChannel.App_ToggleFullScreen),
  isFullScreen: () => ipcRenderer.invoke(IpcChannel.App_IsFullScreen),
  setBadgeCount: (count: number) => ipcRenderer.invoke(IpcChannel.App_SetBadgeCount, count),
  showDock: () => ipcRenderer.invoke(IpcChannel.App_ShowDock),
  hideDock: () => ipcRenderer.invoke(IpcChannel.App_HideDock),
  setProgressBar: (progress: number) => ipcRenderer.invoke(IpcChannel.App_SetProgressBar, progress),
  bounceDock: (type: 'critical' | 'informational') => ipcRenderer.invoke(IpcChannel.App_BounceDock, type),
  getDisplays: () => ipcRenderer.invoke(IpcChannel.App_GetDisplays),
  isFocused: () => ipcRenderer.invoke(IpcChannel.App_IsFocused),
  focus: () => ipcRenderer.invoke(IpcChannel.App_Focus),
  minimizeToTray: () => ipcRenderer.invoke(IpcChannel.App_MinimizeToTray),
  restoreFromTray: () => ipcRenderer.invoke(IpcChannel.App_RestoreFromTray),
  getArgv: () => ipcRenderer.invoke(IpcChannel.App_GetArgv),
  log: (level: string, module: string, message: string) =>
    ipcRenderer.invoke(IpcChannel.App_Log, { level, module, message }),
  openLogFolder: () => ipcRenderer.invoke(IpcChannel.App_OpenLogFolder),
  disableHardwareAcceleration: (disabled: boolean) =>
    ipcRenderer.invoke(IpcChannel.App_DisableHardwareAcceleration, disabled),

  // Event listeners (M→R) returning cleanup functions
  onThemeUpdated: (callback: (data: { theme: string }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: { theme: string }) => callback(data)
    ipcRenderer.on(IpcChannel.ThemeUpdated, handler)
    return () => ipcRenderer.removeListener(IpcChannel.ThemeUpdated, handler)
  },
  onWindowFocused: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on(IpcChannel.WindowFocused, handler)
    return () => ipcRenderer.removeListener(IpcChannel.WindowFocused, handler)
  },
  onWindowBlurred: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on(IpcChannel.WindowBlurred, handler)
    return () => ipcRenderer.removeListener(IpcChannel.WindowBlurred, handler)
  },
  onDeepLinkReceived: (callback: (url: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, url: string) => callback(url)
    ipcRenderer.on(IpcChannel.DeepLinkReceived, handler)
    return () => ipcRenderer.removeListener(IpcChannel.DeepLinkReceived, handler)
  }
}
