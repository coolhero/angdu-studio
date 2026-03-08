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
  onThemeUpdated: (cb: (resolved: 'dark' | 'light') => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, resolved: 'dark' | 'light') => cb(resolved)
    ipcRenderer.on(IpcChannel.Theme_Updated, handler)
    return () => ipcRenderer.removeListener(IpcChannel.Theme_Updated, handler)
  },

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
  },

  // ── F002: Anthropic OAuth ──
  anthropic: {
    startOAuthFlow: (): Promise<{ url: string }> =>
      ipcRenderer.invoke(IpcChannel.Anthropic_StartOAuthFlow),
    completeOAuthWithCode: (code: string): Promise<{ accessToken: string; refreshToken: string }> =>
      ipcRenderer.invoke(IpcChannel.Anthropic_CompleteOAuthWithCode, code),
    cancelOAuthFlow: (): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Anthropic_CancelOAuthFlow),
    getAccessToken: (): Promise<string> =>
      ipcRenderer.invoke(IpcChannel.Anthropic_GetAccessToken),
    hasCredentials: (): Promise<boolean> =>
      ipcRenderer.invoke(IpcChannel.Anthropic_HasCredentials),
    clearCredentials: (): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Anthropic_ClearCredentials)
  },

  // ── F002: GitHub Copilot ──
  copilot: {
    getAuthMessage: (): Promise<{ userCode: string; verificationUri: string }> =>
      ipcRenderer.invoke(IpcChannel.Copilot_GetAuthMessage),
    getCopilotToken: (): Promise<string> =>
      ipcRenderer.invoke(IpcChannel.Copilot_GetCopilotToken),
    saveCopilotToken: (token: string, expiresAt: number): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Copilot_SaveCopilotToken, { token, expiresAt }),
    getToken: (): Promise<string | null> =>
      ipcRenderer.invoke(IpcChannel.Copilot_GetToken),
    logout: (): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Copilot_Logout),
    getUser: (): Promise<{ login: string; name?: string } | null> =>
      ipcRenderer.invoke(IpcChannel.Copilot_GetUser)
  },

  // ── F002: AngduIN OAuth ──
  angduin: {
    saveToken: (accessToken: string, refreshToken: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.AngduIN_SaveToken, { accessToken, refreshToken }),
    hasToken: (): Promise<boolean> =>
      ipcRenderer.invoke(IpcChannel.AngduIN_HasToken),
    getBalance: (): Promise<{ credits: number; plan: string }> =>
      ipcRenderer.invoke(IpcChannel.AngduIN_GetBalance),
    logout: (): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.AngduIN_Logout),
    startOAuthFlow: (): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.AngduIN_StartOAuthFlow),
    exchangeToken: (code: string): Promise<{ accessToken: string; refreshToken: string }> =>
      ipcRenderer.invoke(IpcChannel.AngduIN_ExchangeToken, code)
  },

  // ── F002: Gemini Files ──
  gemini: {
    uploadFile: (filePath: string, mimeType: string, apiKey: string): Promise<{ name: string; uri: string }> =>
      ipcRenderer.invoke(IpcChannel.Gemini_UploadFile, { filePath, mimeType, apiKey }),
    base64File: (name: string, apiKey: string): Promise<string> =>
      ipcRenderer.invoke(IpcChannel.Gemini_Base64File, { name, apiKey }),
    retrieveFile: (name: string, apiKey: string): Promise<{ state: string; uri: string }> =>
      ipcRenderer.invoke(IpcChannel.Gemini_RetrieveFile, { name, apiKey }),
    listFiles: (apiKey: string): Promise<Array<{ name: string; uri: string; state: string }>> =>
      ipcRenderer.invoke(IpcChannel.Gemini_ListFiles, { apiKey }),
    deleteFile: (name: string, apiKey: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Gemini_DeleteFile, { name, apiKey })
  },

  // ── F002: Vertex AI ──
  vertexai: {
    getAuthHeaders: (projectId: string, clientEmail: string, privateKey: string): Promise<Record<string, string>> =>
      ipcRenderer.invoke(IpcChannel.VertexAI_GetAuthHeaders, { projectId, clientEmail, privateKey }),
    getAccessToken: (projectId: string, clientEmail: string, privateKey: string): Promise<string> =>
      ipcRenderer.invoke(IpcChannel.VertexAI_GetAccessToken, { projectId, clientEmail, privateKey }),
    clearAuthCache: (projectId: string, clientEmail?: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.VertexAI_ClearAuthCache, { projectId, clientEmail })
  },

  // ── F002: AES Encryption ──
  aes: {
    encrypt: (text: string, secretKey: string, iv: string): Promise<string> =>
      ipcRenderer.invoke(IpcChannel.Aes_Encrypt, { text, secretKey, iv }),
    decrypt: (encryptedData: string, secretKey: string, iv: string): Promise<string> =>
      ipcRenderer.invoke(IpcChannel.Aes_Decrypt, { encryptedData, secretKey, iv })
  },

  // ── F002: AngduAI Signature ──
  angduai: {
    getSignature: (params: Record<string, string>): Promise<{ signature: string; timestamp: number }> =>
      ipcRenderer.invoke(IpcChannel.Angduai_GetSignature, params)
  }
}

export type WindowApi = typeof api

contextBridge.exposeInMainWorld('api', api)
