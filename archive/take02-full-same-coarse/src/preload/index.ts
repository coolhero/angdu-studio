import { electronAPI } from '@electron-toolkit/preload'
import { IpcChannel } from '@shared/IpcChannel'
import type { AppInfo, FileFilter, FileMetadata, ProxyConfig, Shortcut, ThemeMode, UpdateInfo } from '@shared/types'
import { contextBridge, ipcRenderer } from 'electron'

const api = {
  // App Management
  getInfo: (): Promise<AppInfo> => ipcRenderer.invoke(IpcChannel.App_GetInfo),
  getProxy: (): Promise<ProxyConfig> => ipcRenderer.invoke(IpcChannel.App_GetProxy),
  setProxy: (config: ProxyConfig): Promise<void> => ipcRenderer.invoke(IpcChannel.App_SetProxy, config),
  getTheme: (): Promise<ThemeMode> => ipcRenderer.invoke(IpcChannel.App_GetTheme),
  setTheme: (mode: ThemeMode): Promise<void> => ipcRenderer.invoke(IpcChannel.App_SetTheme, mode),
  checkUpdate: (): Promise<UpdateInfo | null> => ipcRenderer.invoke(IpcChannel.App_CheckUpdate),
  installUpdate: (): Promise<void> => ipcRenderer.invoke(IpcChannel.App_InstallUpdate),
  getLocale: (): Promise<string> => ipcRenderer.invoke(IpcChannel.App_GetLocale),
  setLocale: (locale: string): Promise<void> => ipcRenderer.invoke(IpcChannel.App_SetLocale, locale),
  quit: (): Promise<void> => ipcRenderer.invoke(IpcChannel.App_Quit),
  relaunch: (): Promise<void> => ipcRenderer.invoke(IpcChannel.App_Relaunch),
  getDataPath: (): Promise<string> => ipcRenderer.invoke(IpcChannel.App_GetDataPath),
  setDataPath: (path: string): Promise<void> => ipcRenderer.invoke(IpcChannel.App_SetDataPath, path),

  // File Operations
  file: {
    select: (options?: { multiple?: boolean; filters?: FileFilter[] }): Promise<FileMetadata[]> =>
      ipcRenderer.invoke(IpcChannel.File_Select, options),
    upload: (filePath: string): Promise<FileMetadata> => ipcRenderer.invoke(IpcChannel.File_Upload, filePath),
    download: (id: string, targetPath?: string): Promise<string> =>
      ipcRenderer.invoke(IpcChannel.File_Download, id, targetPath),
    read: (id: string): Promise<Buffer> => ipcRenderer.invoke(IpcChannel.File_Read, id),
    delete: (id: string): Promise<void> => ipcRenderer.invoke(IpcChannel.File_Delete, id),
    open: (id: string): Promise<void> => ipcRenderer.invoke(IpcChannel.File_Open, id),
    getPath: (id: string): Promise<string> => ipcRenderer.invoke(IpcChannel.File_GetPath, id)
  },

  // Window Management
  window: {
    show: (): Promise<void> => ipcRenderer.invoke(IpcChannel.Window_Show),
    hide: (): Promise<void> => ipcRenderer.invoke(IpcChannel.Window_Hide),
    minimize: (): Promise<void> => ipcRenderer.invoke(IpcChannel.Window_Minimize),
    maximize: (): Promise<void> => ipcRenderer.invoke(IpcChannel.Window_Maximize),
    close: (): Promise<void> => ipcRenderer.invoke(IpcChannel.Window_Close),
    setSize: (width: number, height: number): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Window_SetSize, width, height),
    openMini: (): Promise<void> => ipcRenderer.invoke(IpcChannel.Window_OpenMini),
    openSelection: (): Promise<void> => ipcRenderer.invoke(IpcChannel.Window_OpenSelection),
    fullScreen: (): Promise<void> => ipcRenderer.invoke(IpcChannel.Window_FullScreen),
    isFullScreen: (): Promise<boolean> => ipcRenderer.invoke(IpcChannel.Window_IsFullScreen)
  },

  // Config
  config: {
    get: (key: string): Promise<unknown> => ipcRenderer.invoke(IpcChannel.Config_Get, key),
    set: (key: string, value: unknown): Promise<void> => ipcRenderer.invoke(IpcChannel.Config_Set, key, value)
  },

  // Notification
  notification: {
    show: (title: string, body: string, icon?: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Notification_Show, title, body, icon)
  },

  // System
  system: {
    openExternal: (url: string): Promise<void> => ipcRenderer.invoke(IpcChannel.System_OpenExternal, url),
    openPath: (path: string): Promise<void> => ipcRenderer.invoke(IpcChannel.System_OpenPath, path),
    getMemoryUsage: (): Promise<{ heapUsed: number; heapTotal: number }> =>
      ipcRenderer.invoke(IpcChannel.System_GetMemoryUsage),
    getPlatform: (): Promise<string> => ipcRenderer.invoke(IpcChannel.System_GetPlatform),
    getArch: (): Promise<string> => ipcRenderer.invoke(IpcChannel.System_GetArch),
    isPortable: (): Promise<boolean> => ipcRenderer.invoke(IpcChannel.System_IsPortable),
    getLogPath: (): Promise<string> => ipcRenderer.invoke(IpcChannel.System_GetLogPath)
  },

  // Shortcuts
  shortcuts: {
    update: (shortcuts: Shortcut[]): Promise<void> => ipcRenderer.invoke(IpcChannel.Shortcuts_Update, shortcuts)
  },

  // Event listeners
  onThemeUpdated: (callback: (theme: ThemeMode) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, theme: ThemeMode) => callback(theme)
    ipcRenderer.on(IpcChannel.ThemeUpdated, handler)
    return () => ipcRenderer.removeListener(IpcChannel.ThemeUpdated, handler)
  },

  onNotificationClick: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on(IpcChannel.Notification_Click, handler)
    return () => ipcRenderer.removeListener(IpcChannel.Notification_Click, handler)
  }
}

export type WindowApiType = typeof api

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error
  window.electron = electronAPI
  // @ts-expect-error
  window.api = api
}
