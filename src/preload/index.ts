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
import type { FileMetadata, BackupFileInfo, BackupProgress, DirectoryEntry } from '@shared/types/settings'
import type {
  MCPServer,
  MCPTool,
  MCPPrompt,
  MCPCallToolResponse,
  MCPProgressEvent,
  GetResourceResponse,
} from '@shared/types/mcp'

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
  },

  // ── F004: File Operations ──
  file: {
    upload: (filePath: string, fileName?: string, type?: string): Promise<FileMetadata> =>
      ipcRenderer.invoke(IpcChannel.File_Upload, filePath, fileName, type),
    read: (idOrPath: string): Promise<ArrayBuffer> =>
      ipcRenderer.invoke(IpcChannel.File_Read, idOrPath),
    delete: (id: string, filePath: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.File_Delete, id, filePath),
    rename: (filePath: string, newName: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.File_Rename, filePath, newName),
    move: (from: string, to: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.File_Move, from, to),
    download: (url: string, destPath?: string): Promise<string> =>
      ipcRenderer.invoke(IpcChannel.File_Download, url, destPath),
    base64Image: (filePath: string): Promise<string> =>
      ipcRenderer.invoke(IpcChannel.File_Base64Image, filePath),
    binaryImage: (filePath: string): Promise<ArrayBuffer> =>
      ipcRenderer.invoke(IpcChannel.File_BinaryImage, filePath),
    saveBase64Image: (base64: string, ext?: string): Promise<FileMetadata> =>
      ipcRenderer.invoke(IpcChannel.File_SaveBase64Image, base64, ext),
    select: (filters?: Electron.FileFilter[], multiple?: boolean): Promise<string[]> =>
      ipcRenderer.invoke(IpcChannel.File_Select, filters, multiple),
    selectFolder: (): Promise<string> =>
      ipcRenderer.invoke(IpcChannel.File_SelectFolder),
    listDirectory: (dirPath: string): Promise<DirectoryEntry[]> =>
      ipcRenderer.invoke(IpcChannel.File_ListDirectory, dirPath),
    showInFolder: (filePath: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.File_ShowInFolder, filePath),
    open: (filePath: string): Promise<string> =>
      ipcRenderer.invoke(IpcChannel.File_Open, filePath),
    save: (filePath: string, data: Buffer | string): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.File_Save, filePath, data),
    mkdir: (dirPath: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.File_Mkdir, dirPath),
    write: (filePath: string, data: Buffer | string): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.File_Write, filePath, data),
    copy: (from: string, to: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.File_Copy, from, to),
    isTextFile: (filePath: string): Promise<boolean> =>
      ipcRenderer.invoke(IpcChannel.File_IsTextFile, filePath),
    isDirectory: (filePath: string): Promise<boolean> =>
      ipcRenderer.invoke(IpcChannel.File_IsDirectory, filePath),
    get: (filePath: string): Promise<{ name: string; path: string; size: number; isDirectory: boolean; isFile: boolean }> =>
      ipcRenderer.invoke(IpcChannel.File_Get, filePath),
    createTempFile: (prefix: string, ext: string, data?: Buffer | string): Promise<string> =>
      ipcRenderer.invoke(IpcChannel.File_CreateTempFile, prefix, ext, data)
  },

  // ── F004: Filesystem Direct ──
  fs: {
    read: (filePath: string): Promise<ArrayBuffer> =>
      ipcRenderer.invoke(IpcChannel.Fs_Read, filePath),
    readText: (filePath: string, encoding?: string): Promise<string> =>
      ipcRenderer.invoke(IpcChannel.Fs_ReadText, filePath, encoding)
  },

  // ── F004: Backup & Restore ──
  backup: {
    backupToLocal: (dirPath: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Backup_ToLocalDir, dirPath),
    restoreFromLocal: (filePath: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Backup_RestoreFromLocal, filePath),
    listLocalFiles: (): Promise<BackupFileInfo[]> =>
      ipcRenderer.invoke(IpcChannel.Backup_ListLocalFiles),
    deleteLocalFile: (filePath: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Backup_DeleteLocalFile, filePath),
    checkWebdavConnection: (config: { url: string; username: string; password: string; basePath: string }): Promise<boolean> =>
      ipcRenderer.invoke(IpcChannel.Backup_CheckWebdavConnection, config),
    backupToWebdav: (config: { url: string; username: string; password: string; basePath: string }): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Backup_ToWebdav, config),
    restoreFromWebdav: (args: { config: { url: string; username: string; password: string; basePath: string }; fileName: string }): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Backup_RestoreFromWebdav, args),
    listWebdavFiles: (config: { url: string; username: string; password: string; basePath: string }): Promise<BackupFileInfo[]> =>
      ipcRenderer.invoke(IpcChannel.Backup_ListWebdavFiles, config),
    deleteWebdavFile: (args: { config: { url: string; username: string; password: string; basePath: string }; fileName: string }): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Backup_DeleteWebdavFile, args),
    checkS3Connection: (config: { endpoint: string; region: string; bucket: string; accessKeyId: string; secretAccessKey: string }): Promise<boolean> =>
      ipcRenderer.invoke(IpcChannel.Backup_CheckS3Connection, config),
    backupToS3: (config: { endpoint: string; region: string; bucket: string; accessKeyId: string; secretAccessKey: string }): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Backup_ToS3, config),
    restoreFromS3: (args: { config: { endpoint: string; region: string; bucket: string; accessKeyId: string; secretAccessKey: string }; key: string }): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Backup_RestoreFromS3, args),
    listS3Files: (config: { endpoint: string; region: string; bucket: string; accessKeyId: string; secretAccessKey: string }): Promise<BackupFileInfo[]> =>
      ipcRenderer.invoke(IpcChannel.Backup_ListS3Files, config),
    deleteS3File: (args: { config: { endpoint: string; region: string; bucket: string; accessKeyId: string; secretAccessKey: string }; key: string }): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Backup_DeleteS3File, args),
    onProgress: (cb: (progress: BackupProgress) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, progress: BackupProgress) => cb(progress)
      ipcRenderer.on(IpcChannel.Backup_Progress, handler)
      return () => ipcRenderer.removeListener(IpcChannel.Backup_Progress, handler)
    },
    onRestoreProgress: (cb: (progress: BackupProgress) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, progress: BackupProgress) => cb(progress)
      ipcRenderer.on(IpcChannel.Restore_Progress, handler)
      return () => ipcRenderer.removeListener(IpcChannel.Restore_Progress, handler)
    }
  },

  // ── F006: MCP ──
  mcp: {
    restartServer: (server: MCPServer): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Mcp_RestartServer, server),
    stopServer: (server: MCPServer): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Mcp_StopServer, server),
    removeServer: (server: MCPServer): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Mcp_RemoveServer, server),
    checkConnectivity: (server: MCPServer): Promise<boolean> =>
      ipcRenderer.invoke(IpcChannel.Mcp_CheckConnectivity, server),
    getServerVersion: (server: MCPServer): Promise<string | null> =>
      ipcRenderer.invoke(IpcChannel.Mcp_GetServerVersion, server),
    listTools: (server: MCPServer): Promise<MCPTool[]> =>
      ipcRenderer.invoke(IpcChannel.Mcp_ListTools, server),
    callTool: (args: { server: MCPServer; name: string; args: unknown; callId?: string }): Promise<MCPCallToolResponse> =>
      ipcRenderer.invoke(IpcChannel.Mcp_CallTool, args),
    abortTool: (callId: string): Promise<boolean> =>
      ipcRenderer.invoke(IpcChannel.Mcp_AbortTool, callId),
    listPrompts: (server: MCPServer): Promise<MCPPrompt[]> =>
      ipcRenderer.invoke(IpcChannel.Mcp_ListPrompts, server),
    getPrompt: (args: { server: MCPServer; name: string; args?: Record<string, string> }): Promise<unknown> =>
      ipcRenderer.invoke(IpcChannel.Mcp_GetPrompt, args),
    listResources: (server: MCPServer): Promise<unknown[]> =>
      ipcRenderer.invoke(IpcChannel.Mcp_ListResources, server),
    getResource: (args: { server: MCPServer; uri: string }): Promise<GetResourceResponse> =>
      ipcRenderer.invoke(IpcChannel.Mcp_GetResource, args),
    getServerLogs: (server: MCPServer): Promise<unknown[]> =>
      ipcRenderer.invoke(IpcChannel.Mcp_GetServerLogs, server),
    uploadDxt: (filePath: string): Promise<MCPServer> =>
      ipcRenderer.invoke(IpcChannel.Mcp_UploadDxt, filePath),
    onServersChanged: (cb: (servers: MCPServer[]) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, servers: MCPServer[]) => cb(servers)
      ipcRenderer.on(IpcChannel.Mcp_ServersChanged, handler)
      return () => ipcRenderer.removeListener(IpcChannel.Mcp_ServersChanged, handler)
    },
    onServersUpdated: (cb: (data: { id: string; updates: Partial<MCPServer> }) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: { id: string; updates: Partial<MCPServer> }) => cb(data)
      ipcRenderer.on(IpcChannel.Mcp_ServersUpdated, handler)
      return () => ipcRenderer.removeListener(IpcChannel.Mcp_ServersUpdated, handler)
    },
    onProgress: (cb: (event: MCPProgressEvent) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, progress: MCPProgressEvent) => cb(progress)
      ipcRenderer.on(IpcChannel.Mcp_Progress, handler)
      return () => ipcRenderer.removeListener(IpcChannel.Mcp_Progress, handler)
    },
    onServerLog: (cb: (entry: unknown) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, entry: unknown) => cb(entry)
      ipcRenderer.on(IpcChannel.Mcp_ServerLog, handler)
      return () => ipcRenderer.removeListener(IpcChannel.Mcp_ServerLog, handler)
    },
  },

  // ── F004: Data Migration ──
  data: {
    setDataPath: (dataPath: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Data_SetDataPath, dataPath),
    getDataPath: (): Promise<string> =>
      ipcRenderer.invoke(IpcChannel.Data_GetDataPath),
    migrateData: (oldPath: string, newPath: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.Data_MigrateData, { oldPath, newPath }),
    onMigrateProgress: (cb: (progress: BackupProgress) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, progress: BackupProgress) => cb(progress)
      ipcRenderer.on(IpcChannel.Data_MigrateProgress, handler)
      return () => ipcRenderer.removeListener(IpcChannel.Data_MigrateProgress, handler)
    }
  }
}

export type WindowApi = typeof api

contextBridge.exposeInMainWorld('api', api)
