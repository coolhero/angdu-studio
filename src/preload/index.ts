import { contextBridge, ipcRenderer } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import type { PreloadAPI } from '@shared/types'

const api: PreloadAPI = {
  windowControls: {
    minimize: () => ipcRenderer.invoke(IpcChannel.Window_Minimize),
    maximize: () => ipcRenderer.invoke(IpcChannel.Window_Maximize),
    close: () => ipcRenderer.invoke(IpcChannel.Window_Close),
    isMaximized: () => ipcRenderer.invoke(IpcChannel.Window_IsMaximized),
  },
  miniWindow: {
    show: () => ipcRenderer.invoke(IpcChannel.MiniWindow_Show),
    hide: () => ipcRenderer.invoke(IpcChannel.MiniWindow_Hide),
    close: () => ipcRenderer.invoke(IpcChannel.MiniWindow_Close),
    toggle: () => ipcRenderer.invoke(IpcChannel.MiniWindow_Toggle),
    setPin: (pinned: boolean) => ipcRenderer.invoke(IpcChannel.MiniWindow_SetPin, pinned),
  },
  setTheme: (theme) => ipcRenderer.invoke(IpcChannel.App_SetTheme, theme),
  app: {
    getInfo: () => ipcRenderer.invoke(IpcChannel.App_Info),
    reload: () => ipcRenderer.invoke(IpcChannel.App_Reload),
    quit: () => ipcRenderer.invoke(IpcChannel.App_Quit),
    quitAndInstall: () => ipcRenderer.invoke(IpcChannel.App_QuitAndInstall),
    clearCache: () => ipcRenderer.invoke(IpcChannel.App_ClearCache),
    getSystemFonts: () => ipcRenderer.invoke(IpcChannel.App_GetSystemFonts),
    getIpCountry: () => ipcRenderer.invoke(IpcChannel.App_GetIpCountry),
    setProxy: (config) => ipcRenderer.invoke(IpcChannel.App_SetProxy, config),
    setFullScreen: (enabled) => ipcRenderer.invoke(IpcChannel.Window_SetFullScreen, enabled),
    isFullScreen: () => ipcRenderer.invoke(IpcChannel.Window_IsFullScreen),
    openExternal: (url) => ipcRenderer.invoke(IpcChannel.Open_Website, url),
    checkForUpdates: () => ipcRenderer.invoke(IpcChannel.App_CheckForUpdates),
    downloadUpdate: () => ipcRenderer.invoke(IpcChannel.App_DownloadUpdate),
    cancelDownload: () => ipcRenderer.invoke(IpcChannel.App_CancelDownload),
  },
  on: (channel, callback) => {
    const listener = (_event: Electron.IpcRendererEvent, ...args: unknown[]) => callback(...args)
    ipcRenderer.on(channel, listener)
    return () => {
      ipcRenderer.removeListener(channel, listener)
    }
  },
}

contextBridge.exposeInMainWorld('api', api)
