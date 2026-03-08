import { contextBridge, ipcRenderer } from 'electron'
import { IpcChannel } from '@shared/ipc-channels'
import type {
  AppInfo,
  PlatformInfo,
  AppNotification,
  ShortcutBinding,
  UpdateCheckResult,
  RelaunchOptions
} from '@shared/types'

const api = {
  // App lifecycle
  getAppInfo: (): Promise<AppInfo> => ipcRenderer.invoke(IpcChannel.App_Info),
  quit: (): Promise<void> => ipcRenderer.invoke(IpcChannel.App_Quit),
  reload: (): Promise<void> => ipcRenderer.invoke(IpcChannel.App_Reload),
  relaunch: (options?: RelaunchOptions): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.App_Relaunch, options),
  setStopQuit: (stop: boolean, reason: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.App_SetStopQuit, stop, reason),

  // Window controls
  windowControls: {
    minimize: (): Promise<void> => ipcRenderer.invoke(IpcChannel.Window_Minimize),
    maximize: (): Promise<void> => ipcRenderer.invoke(IpcChannel.Window_Maximize),
    unmaximize: (): Promise<void> => ipcRenderer.invoke(IpcChannel.Window_Unmaximize),
    close: (): Promise<void> => ipcRenderer.invoke(IpcChannel.Window_Close),
    isMaximized: (): Promise<boolean> => ipcRenderer.invoke(IpcChannel.Window_IsMaximized),
    onMaximizedChange: (cb: (isMaximized: boolean) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, isMaximized: boolean) => cb(isMaximized)
      ipcRenderer.on(IpcChannel.Window_MaximizedChanged, handler)
      return () => ipcRenderer.removeListener(IpcChannel.Window_MaximizedChanged, handler)
    }
  },

  // Window
  window: {
    setMinimumSize: (width: number, height: number): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Window_SetMinimumSize, width, height),
    resetMinimumSize: (): Promise<void> => ipcRenderer.invoke(IpcChannel.Window_ResetMinimumSize),
    getSize: (): Promise<[number, number]> => ipcRenderer.invoke(IpcChannel.Window_GetSize),
    setFullScreen: (value: boolean): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Window_SetFullScreen, value),
    isFullScreen: (): Promise<boolean> => ipcRenderer.invoke(IpcChannel.Window_IsFullScreen)
  },

  // Config
  config: {
    get: (key: string): Promise<unknown> => ipcRenderer.invoke(IpcChannel.Config_Get, key),
    set: (key: string, value: unknown, notify?: boolean): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Config_Set, key, value, notify)
  },

  // Theme
  setTheme: (theme: string): Promise<void> => ipcRenderer.invoke(IpcChannel.Theme_Set, theme),

  // Proxy
  setProxy: (url: string | undefined, bypassRules?: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.Proxy_Set, url, bypassRules),

  // Notifications
  notification: {
    send: (notification: Omit<AppNotification, 'id' | 'createdAt'>): Promise<string> =>
      ipcRenderer.invoke(IpcChannel.Notification_Send, notification),
    dismiss: (id: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Notification_Dismiss, id)
  },

  // System
  shell: {
    openExternal: (url: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.System_OpenExternal, url)
  },
  openPath: (path: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.System_OpenPath, path),

  // Mini window
  miniWindow: {
    show: (): Promise<void> => ipcRenderer.invoke(IpcChannel.MiniWindow_Show),
    hide: (): Promise<void> => ipcRenderer.invoke(IpcChannel.MiniWindow_Hide),
    close: (): Promise<void> => ipcRenderer.invoke(IpcChannel.MiniWindow_Close),
    toggle: (): Promise<void> => ipcRenderer.invoke(IpcChannel.MiniWindow_Toggle),
    setPin: (isPinned: boolean): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.MiniWindow_SetPin, isPinned)
  },

  // Shortcuts
  shortcuts: {
    update: (shortcuts: ShortcutBinding[]): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Shortcut_Update, shortcuts),
    getAll: (): Promise<ShortcutBinding[]> => ipcRenderer.invoke(IpcChannel.Shortcut_GetAll)
  },

  // Protocol
  protocol: {
    onReceiveData: (
      cb: (data: { url: string; params: Record<string, string> }) => void
    ): (() => void) => {
      const handler = (
        _event: Electron.IpcRendererEvent,
        data: { url: string; params: Record<string, string> }
      ) => cb(data)
      ipcRenderer.on(IpcChannel.Protocol_OnReceive, handler)
      return () => ipcRenderer.removeListener(IpcChannel.Protocol_OnReceive, handler)
    }
  },

  // Store sync
  storeSync: {
    subscribe: (): Promise<void> => ipcRenderer.invoke(IpcChannel.StoreSync_Subscribe),
    unsubscribe: (): Promise<void> => ipcRenderer.invoke(IpcChannel.StoreSync_Unsubscribe),
    onUpdate: (cb: (patch: { key: string; value: unknown }) => void): (() => void) => {
      const handler = (
        _event: Electron.IpcRendererEvent,
        patch: { key: string; value: unknown }
      ) => cb(patch)
      ipcRenderer.on(IpcChannel.StoreSync_Push, handler)
      return () => ipcRenderer.removeListener(IpcChannel.StoreSync_Push, handler)
    }
  },

  // Update
  checkForUpdate: (): Promise<UpdateCheckResult | null> =>
    ipcRenderer.invoke(IpcChannel.Update_Check),
  quitAndInstall: (): Promise<void> => ipcRenderer.invoke(IpcChannel.Update_Install),

  // Zoom
  handleZoomFactor: (delta: number, reset?: boolean): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.Zoom_HandleFactor, delta, reset),

  // Dev
  devTools: {
    toggle: (): Promise<void> => ipcRenderer.invoke(IpcChannel.System_ToggleDevTools)
  }
}

export type WindowApi = typeof api

contextBridge.exposeInMainWorld('api', api)
