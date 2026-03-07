import { contextBridge, ipcRenderer } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import type { IpcChannelMap } from '@shared/types'

/**
 * Type-safe API exposed to the renderer process via contextBridge.
 * Each method maps to an IpcChannel and is fully typed through IpcChannelMap.
 */
const api = {
  // App lifecycle
  getAppInfo: (): Promise<IpcChannelMap[IpcChannel.AppGetInfo]['response']> =>
    ipcRenderer.invoke(IpcChannel.AppGetInfo),

  quit: (): Promise<void> => ipcRenderer.invoke(IpcChannel.AppQuit),

  relaunch: (): Promise<void> => ipcRenderer.invoke(IpcChannel.AppRelaunch),

  setLanguage: (language: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.AppSetLanguage, language),

  // Window management
  minimizeWindow: (): Promise<void> => ipcRenderer.invoke(IpcChannel.WindowMinimize),

  maximizeWindow: (): Promise<void> => ipcRenderer.invoke(IpcChannel.WindowMaximize),

  closeWindow: (): Promise<void> => ipcRenderer.invoke(IpcChannel.WindowClose),

  isWindowMaximized: (): Promise<boolean> => ipcRenderer.invoke(IpcChannel.WindowIsMaximized),

  // File operations
  selectFile: (
    ...args: IpcChannelMap[IpcChannel.FileSelect]['request']
  ): Promise<IpcChannelMap[IpcChannel.FileSelect]['response']> =>
    ipcRenderer.invoke(IpcChannel.FileSelect, ...args),

  saveFile: (
    ...args: IpcChannelMap[IpcChannel.FileSave]['request']
  ): Promise<void> => ipcRenderer.invoke(IpcChannel.FileSave, ...args),

  readFile: (path: string): Promise<Uint8Array> =>
    ipcRenderer.invoke(IpcChannel.FileRead, path),

  deleteFile: (path: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.FileDelete, path),

  getFileMetadata: (
    path: string
  ): Promise<IpcChannelMap[IpcChannel.FileGetMetadata]['response']> =>
    ipcRenderer.invoke(IpcChannel.FileGetMetadata, path),

  // Config / settings
  getConfig: (): Promise<IpcChannelMap[IpcChannel.ConfigGet]['response']> =>
    ipcRenderer.invoke(IpcChannel.ConfigGet),

  setConfig: (
    ...args: IpcChannelMap[IpcChannel.ConfigSet]['request']
  ): Promise<void> => ipcRenderer.invoke(IpcChannel.ConfigSet, ...args),

  resetConfig: (): Promise<IpcChannelMap[IpcChannel.ConfigReset]['response']> =>
    ipcRenderer.invoke(IpcChannel.ConfigReset),

  // Shortcuts
  registerShortcut: (
    ...args: IpcChannelMap[IpcChannel.ShortcutRegister]['request']
  ): Promise<IpcChannelMap[IpcChannel.ShortcutRegister]['response']> =>
    ipcRenderer.invoke(IpcChannel.ShortcutRegister, ...args),

  unregisterShortcut: (id: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.ShortcutUnregister, id),

  getAllShortcuts: (): Promise<IpcChannelMap[IpcChannel.ShortcutGetAll]['response']> =>
    ipcRenderer.invoke(IpcChannel.ShortcutGetAll),

  // Shell / OS integration
  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.ShellOpenExternal, url),

  showItemInFolder: (path: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.ShellShowItemInFolder, path),

  // System
  getDeviceType: (): Promise<IpcChannelMap[IpcChannel.SystemGetDeviceType]['response']> =>
    ipcRenderer.invoke(IpcChannel.SystemGetDeviceType),

  // Zip
  zipCompress: (data: Uint8Array): Promise<Uint8Array> =>
    ipcRenderer.invoke(IpcChannel.ZipCompress, data),

  zipDecompress: (data: Uint8Array): Promise<Uint8Array> =>
    ipcRenderer.invoke(IpcChannel.ZipDecompress, data),

  // Dialog
  showMessage: (
    ...args: IpcChannelMap[IpcChannel.DialogShowMessage]['request']
  ): Promise<number> => ipcRenderer.invoke(IpcChannel.DialogShowMessage, ...args),

  showError: (title: string, content: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.DialogShowError, title, content)
} as const

contextBridge.exposeInMainWorld('api', api)

/** Type declaration for the renderer process window.api */
export type CherryStudioApi = typeof api
