import { contextBridge, ipcRenderer } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'

const api = {
  // ── App Domain ──
  app: {
    getInfo: () => ipcRenderer.invoke(IpcChannel.App_Info),
    quit: () => ipcRenderer.invoke(IpcChannel.App_Quit),
    reload: () => ipcRenderer.invoke(IpcChannel.App_Reload),
    relaunch: () => ipcRenderer.invoke(IpcChannel.App_Relaunch),
    getPath: (name: string) => ipcRenderer.invoke(IpcChannel.App_GetPath, name),
    getSystemInfo: () => ipcRenderer.invoke(IpcChannel.App_GetSystemInfo),
    clearCache: () => ipcRenderer.invoke(IpcChannel.App_ClearCache),
    getCacheSize: () => ipcRenderer.invoke(IpcChannel.App_GetCacheSize),
    setTheme: (mode: string) => ipcRenderer.invoke(IpcChannel.App_SetTheme, mode),
    setLanguage: (locale: string) => ipcRenderer.invoke(IpcChannel.App_SetLanguage, locale),
    setProxy: (proxy: unknown) => ipcRenderer.invoke(IpcChannel.App_SetProxy, proxy),
    logToMain: (entry: unknown) => ipcRenderer.invoke(IpcChannel.App_LogToMain, entry),
    onThemeChanged: (callback: (mode: string) => void) => {
      const handler = (_event: unknown, mode: string) => callback(mode)
      ipcRenderer.on(IpcChannel.App_ThemeChanged, handler)
      return () => ipcRenderer.removeListener(IpcChannel.App_ThemeChanged, handler)
    },
    onProtocol: (callback: (url: string) => void) => {
      const handler = (_event: unknown, url: string) => callback(url)
      ipcRenderer.on(IpcChannel.App_HandleProtocol, handler)
      return () => ipcRenderer.removeListener(IpcChannel.App_HandleProtocol, handler)
    }
  },

  // ── Config Domain ──
  config: {
    get: (key: string) => ipcRenderer.invoke(IpcChannel.Config_Get, key),
    set: (key: string, value: unknown) => ipcRenderer.invoke(IpcChannel.Config_Set, key, value)
  },

  // ── Window Domain ──
  window: {
    minimize: () => ipcRenderer.invoke(IpcChannel.Window_Minimize),
    maximize: () => ipcRenderer.invoke(IpcChannel.Window_Maximize),
    unmaximize: () => ipcRenderer.invoke(IpcChannel.Window_Unmaximize),
    close: () => ipcRenderer.invoke(IpcChannel.Window_Close),
    isMaximized: () => ipcRenderer.invoke(IpcChannel.Window_IsMaximized),
    getSize: () => ipcRenderer.invoke(IpcChannel.Window_GetSize),
    setMinimumSize: (width: number, height: number) =>
      ipcRenderer.invoke(IpcChannel.Window_SetMinimumSize, width, height),
    resetMinimumSize: () => ipcRenderer.invoke(IpcChannel.Window_ResetMinimumSize),
    onMaximizedChange: (callback: (maximized: boolean) => void) => {
      const handler = (_event: unknown, maximized: boolean) => callback(maximized)
      ipcRenderer.on(IpcChannel.Window_MaximizedChanged, handler)
      return () => ipcRenderer.removeListener(IpcChannel.Window_MaximizedChanged, handler)
    },
    onResize: (callback: (width: number, height: number) => void) => {
      const handler = (_event: unknown, width: number, height: number) =>
        callback(width, height)
      ipcRenderer.on(IpcChannel.Window_Resize, handler)
      return () => ipcRenderer.removeListener(IpcChannel.Window_Resize, handler)
    },
    onFullscreenChange: (callback: (fullscreen: boolean) => void) => {
      const handler = (_event: unknown, fullscreen: boolean) => callback(fullscreen)
      ipcRenderer.on(IpcChannel.Window_FullscreenChanged, handler)
      return () =>
        ipcRenderer.removeListener(IpcChannel.Window_FullscreenChanged, handler)
    }
  },

  // ── File Domain ──
  file: {
    select: (options?: unknown) => ipcRenderer.invoke(IpcChannel.File_Select, options),
    open: (filePath: string) => ipcRenderer.invoke(IpcChannel.File_Open, filePath),
    save: (options: unknown) => ipcRenderer.invoke(IpcChannel.File_Save, options),
    read: (filePath: string) => ipcRenderer.invoke(IpcChannel.File_Read, filePath),
    write: (filePath: string, content: string) =>
      ipcRenderer.invoke(IpcChannel.File_Write, filePath, content),
    upload: (sourcePath: string) => ipcRenderer.invoke(IpcChannel.File_Upload, sourcePath),
    delete: (filePath: string) => ipcRenderer.invoke(IpcChannel.File_Delete, filePath),
    copy: (src: string, dest: string) => ipcRenderer.invoke(IpcChannel.File_Copy, src, dest),
    move: (src: string, dest: string) => ipcRenderer.invoke(IpcChannel.File_Move, src, dest),
    isTextFile: (filePath: string) => ipcRenderer.invoke(IpcChannel.File_IsTextFile, filePath),
    isDirectory: (filePath: string) => ipcRenderer.invoke(IpcChannel.File_IsDirectory, filePath),
    listDirectory: (dirPath: string) =>
      ipcRenderer.invoke(IpcChannel.File_ListDirectory, dirPath),
    base64Image: (imagePath: string) =>
      ipcRenderer.invoke(IpcChannel.File_Base64Image, imagePath),
    startWatcher: (watcherId: string, config: unknown) =>
      ipcRenderer.invoke(IpcChannel.File_StartWatcher, watcherId, config),
    stopWatcher: (watcherId: string) =>
      ipcRenderer.invoke(IpcChannel.File_StopWatcher, watcherId),
    onFileChange: (callback: (event: unknown) => void) => {
      const handler = (_event: unknown, changeEvent: unknown) => callback(changeEvent)
      ipcRenderer.on(IpcChannel.File_OnChange, handler)
      return () => ipcRenderer.removeListener(IpcChannel.File_OnChange, handler)
    }
  },

  // ── Mini Window Domain ──
  miniWindow: {
    show: () => ipcRenderer.invoke(IpcChannel.MiniWindow_Show),
    hide: () => ipcRenderer.invoke(IpcChannel.MiniWindow_Hide),
    close: () => ipcRenderer.invoke(IpcChannel.MiniWindow_Close),
    toggle: () => ipcRenderer.invoke(IpcChannel.MiniWindow_Toggle),
    setPin: (pinned: boolean) => ipcRenderer.invoke(IpcChannel.MiniWindow_SetPin, pinned)
  }
}

export type ElectronAPI = typeof api

contextBridge.exposeInMainWorld('api', api)
