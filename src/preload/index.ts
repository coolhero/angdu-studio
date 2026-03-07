import { contextBridge, ipcRenderer } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'

const api = {
  app: {
    info: () => ipcRenderer.invoke(IpcChannel.AppInfo),
    getPath: (name: string) => ipcRenderer.invoke(IpcChannel.AppGetPath, { name }),
    getDataPath: () => ipcRenderer.invoke(IpcChannel.AppGetDataPath),
    setDataPath: (path: string) => ipcRenderer.invoke(IpcChannel.AppSetDataPath, { path }),
    getLanguage: () => ipcRenderer.invoke(IpcChannel.AppGetLanguage),
    setLanguage: (language: string) => ipcRenderer.invoke(IpcChannel.AppSetLanguage, { language }),
    setLaunchOnBoot: (enabled: boolean) =>
      ipcRenderer.invoke(IpcChannel.AppSetLaunchOnBoot, { enabled }),
    getLaunchOnBoot: () => ipcRenderer.invoke(IpcChannel.AppGetLaunchOnBoot),
    setProxy: (mode: string, url?: string) =>
      ipcRenderer.invoke(IpcChannel.AppSetProxy, { mode, url }),
    getProxy: () => ipcRenderer.invoke(IpcChannel.AppGetProxy),
    quit: () => ipcRenderer.invoke(IpcChannel.AppQuit),
    relaunch: () => ipcRenderer.invoke(IpcChannel.AppRelaunch)
  },
  config: {
    get: (key: string) => ipcRenderer.invoke(IpcChannel.ConfigGet, { key }),
    set: (key: string, value: unknown) =>
      ipcRenderer.invoke(IpcChannel.ConfigSet, { key, value }),
    getAll: () => ipcRenderer.invoke(IpcChannel.ConfigGetAll),
    reset: (key: string) => ipcRenderer.invoke(IpcChannel.ConfigReset, { key }),
    resetAll: () => ipcRenderer.invoke(IpcChannel.ConfigResetAll),
    onChanged: (callback: (event: { key: string; value: unknown; oldValue: unknown }) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: { key: string; value: unknown; oldValue: unknown }) => callback(data)
      ipcRenderer.on(IpcChannel.ConfigChanged, handler)
      return () => ipcRenderer.removeListener(IpcChannel.ConfigChanged, handler)
    }
  },
  window: {
    show: () => ipcRenderer.invoke(IpcChannel.WindowShow),
    hide: () => ipcRenderer.invoke(IpcChannel.WindowHide),
    minimize: () => ipcRenderer.invoke(IpcChannel.WindowMinimize),
    maximize: () => ipcRenderer.invoke(IpcChannel.WindowMaximize),
    close: () => ipcRenderer.invoke(IpcChannel.WindowClose),
    setSize: (width: number, height: number) =>
      ipcRenderer.invoke(IpcChannel.WindowSetSize, { width, height }),
    setPosition: (x: number, y: number) =>
      ipcRenderer.invoke(IpcChannel.WindowSetPosition, { x, y }),
    getState: () => ipcRenderer.invoke(IpcChannel.WindowGetState),
    setAlwaysOnTop: (enabled: boolean) =>
      ipcRenderer.invoke(IpcChannel.WindowSetAlwaysOnTop, { enabled }),
    setFullscreen: (enabled: boolean) =>
      ipcRenderer.invoke(IpcChannel.WindowSetFullscreen, { enabled })
  },
  system: {
    info: () => ipcRenderer.invoke(IpcChannel.SystemInfo),
    clipboardRead: () => ipcRenderer.invoke(IpcChannel.SystemClipboardRead),
    clipboardWrite: (text: string) =>
      ipcRenderer.invoke(IpcChannel.SystemClipboardWrite, { text }),
    getScreens: () => ipcRenderer.invoke(IpcChannel.SystemGetScreens),
    getDeviceType: () => ipcRenderer.invoke(IpcChannel.SystemGetDeviceType)
  },
  open: {
    url: (url: string) => ipcRenderer.invoke(IpcChannel.OpenUrl, { url }),
    path: (path: string) => ipcRenderer.invoke(IpcChannel.OpenPath, { path })
  },
  theme: {
    get: () => ipcRenderer.invoke(IpcChannel.ThemeGet),
    set: (mode: string) => ipcRenderer.invoke(IpcChannel.ThemeSet, { mode }),
    onChanged: (callback: (state: { mode: string; resolved: string }) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: { mode: string; resolved: string }) => callback(data)
      ipcRenderer.on(IpcChannel.ThemeChanged, handler)
      return () => ipcRenderer.removeListener(IpcChannel.ThemeChanged, handler)
    }
  }
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('api', api)
} else {
  // @ts-expect-error -- fallback for non-isolated contexts
  window.api = api
}

export type WindowApi = typeof api
