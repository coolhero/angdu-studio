export enum IpcChannel {
  // ── App Lifecycle ──
  App_Info = 'app:info',
  App_Quit = 'app:quit',
  App_Reload = 'app:reload',
  App_Relaunch = 'app:relaunch',
  App_GetVersion = 'app:get-version',
  App_GetPlatform = 'app:get-platform',
  App_GetDataPath = 'app:get-data-path',
  App_SetStopQuit = 'app:set-stop-quit',

  // ── Window Management ──
  Window_Minimize = 'window:minimize',
  Window_Maximize = 'window:maximize',
  Window_Unmaximize = 'window:unmaximize',
  Window_Close = 'window:close',
  Window_IsMaximized = 'window:is-maximized',
  Window_MaximizedChanged = 'window:maximized-changed',
  Window_SetFullScreen = 'window:set-fullscreen',
  Window_IsFullScreen = 'window:is-fullscreen',
  Window_SetMinimumSize = 'window:set-minimum-size',
  Window_ResetMinimumSize = 'window:reset-minimum-size',
  Window_GetSize = 'window:get-size',

  // ── Config ──
  Config_Get = 'config:get',
  Config_Set = 'config:set',

  // ── Theme ──
  Theme_Set = 'theme:set',
  Theme_Updated = 'theme:updated',

  // ── Proxy ──
  Proxy_Set = 'proxy:set',

  // ── Notifications ──
  Notification_Show = 'notification:show',
  Notification_Send = 'notification:send',
  Notification_Dismiss = 'notification:dismiss',
  Notification_OnAction = 'notification:on-action',

  // ── System ──
  System_OpenExternal = 'system:open-external',
  System_OpenPath = 'system:open-path',
  System_GetPlatformInfo = 'system:get-platform-info',
  System_ToggleDevTools = 'system:toggle-devtools',

  // ── Mini Window ──
  MiniWindow_Show = 'miniwindow:show',
  MiniWindow_Hide = 'miniwindow:hide',
  MiniWindow_Close = 'miniwindow:close',
  MiniWindow_Toggle = 'miniwindow:toggle',
  MiniWindow_SetPin = 'miniwindow:set-pin',

  // ── Tray ──
  Tray_SetEnabled = 'tray:set-enabled',
  Tray_SetTrayOnClose = 'tray:set-tray-on-close',

  // ── Auto-Update ──
  Update_Check = 'update:check',
  Update_Download = 'update:download',
  Update_Install = 'update:install',
  Update_SetChannel = 'update:set-channel',
  Update_Progress = 'update:progress',
  Update_Available = 'update:available',
  Update_Downloaded = 'update:downloaded',

  // ── Shortcuts ──
  Shortcut_Update = 'shortcut:update',
  Shortcut_GetAll = 'shortcut:get-all',

  // ── Protocol / Deep Links ──
  Protocol_HandleUrl = 'protocol:handle-url',
  Protocol_OnReceive = 'protocol:on-receive',

  // ── Store Sync ──
  StoreSync_Push = 'store-sync:push',
  StoreSync_Pull = 'store-sync:pull',
  StoreSync_Subscribe = 'store-sync:subscribe',
  StoreSync_Unsubscribe = 'store-sync:unsubscribe',
  StoreSync_OnUpdate = 'store-sync:on-update',

  // ── Zoom ──
  Zoom_HandleFactor = 'zoom:handle-factor',

  // ── Crash Reporter ──
  Crash_MockRenderer = 'crash:mock-renderer',

  // ── F002: Provider Management ──
  Provider_AddKey = 'provider:add-key',

  // ── F002: GitHub Copilot Auth ──
  Copilot_GetAuthMessage = 'copilot:get-auth-message',
  Copilot_GetCopilotToken = 'copilot:get-copilot-token',
  Copilot_SaveCopilotToken = 'copilot:save-copilot-token',
  Copilot_GetToken = 'copilot:get-token',
  Copilot_Logout = 'copilot:logout',
  Copilot_GetUser = 'copilot:get-user',

  // ── F002: AngduIN Auth ──
  AngduIN_SaveToken = 'angduin:save-token',
  AngduIN_HasToken = 'angduin:has-token',
  AngduIN_GetBalance = 'angduin:get-balance',
  AngduIN_Logout = 'angduin:logout',
  AngduIN_StartOAuthFlow = 'angduin:start-oauth-flow',
  AngduIN_ExchangeToken = 'angduin:exchange-token',

  // ── F002: Gemini File Operations ──
  Gemini_UploadFile = 'gemini:upload-file',
  Gemini_Base64File = 'gemini:base64-file',
  Gemini_RetrieveFile = 'gemini:retrieve-file',
  Gemini_ListFiles = 'gemini:list-files',
  Gemini_DeleteFile = 'gemini:delete-file',

  // ── F002: Vertex AI Auth ──
  VertexAI_GetAuthHeaders = 'vertexai:get-auth-headers',
  VertexAI_GetAccessToken = 'vertexai:get-access-token',
  VertexAI_ClearAuthCache = 'vertexai:clear-auth-cache',

  // ── F002: Anthropic OAuth ──
  Anthropic_StartOAuthFlow = 'anthropic:start-oauth-flow',
  Anthropic_CompleteOAuthWithCode = 'anthropic:complete-oauth-with-code',
  Anthropic_CancelOAuthFlow = 'anthropic:cancel-oauth-flow',
  Anthropic_GetAccessToken = 'anthropic:get-access-token',
  Anthropic_HasCredentials = 'anthropic:has-credentials',
  Anthropic_ClearCredentials = 'anthropic:clear-credentials',

  // ── F002: Encryption ──
  Aes_Encrypt = 'aes:encrypt',
  Aes_Decrypt = 'aes:decrypt',

  // ── F002: AngduAI Signature ──
  Angduai_GetSignature = 'angduai:get-signature',

  // ── F004: File Operations ──
  File_Upload = 'file:upload',
  File_Read = 'file:read',
  File_Delete = 'file:delete',
  File_Rename = 'file:rename',
  File_Move = 'file:move',
  File_Download = 'file:download',
  File_Base64Image = 'file:base64-image',
  File_BinaryImage = 'file:binary-image',
  File_SaveBase64Image = 'file:save-base64-image',
  File_Select = 'file:select',
  File_SelectFolder = 'file:select-folder',
  File_ListDirectory = 'file:list-directory',
  File_ShowInFolder = 'file:show-in-folder',
  File_Open = 'file:open',
  File_Save = 'file:save',
  File_Mkdir = 'file:mkdir',
  File_Write = 'file:write',
  File_Copy = 'file:copy',
  File_IsTextFile = 'file:is-text-file',
  File_IsDirectory = 'file:is-directory',
  File_Get = 'file:get',
  File_CreateTempFile = 'file:create-temp-file',

  // ── F004: Filesystem Direct ──
  Fs_Read = 'fs:read',
  Fs_ReadText = 'fs:read-text',

  // ── F004: Backup & Restore ──
  Backup_ToLocalDir = 'backup:to-local-dir',
  Backup_RestoreFromLocal = 'backup:restore-from-local',
  Backup_ListLocalFiles = 'backup:list-local-files',
  Backup_DeleteLocalFile = 'backup:delete-local-file',
  Backup_CheckWebdavConnection = 'backup:check-webdav-connection',
  Backup_ToWebdav = 'backup:to-webdav',
  Backup_RestoreFromWebdav = 'backup:restore-from-webdav',
  Backup_ListWebdavFiles = 'backup:list-webdav-files',
  Backup_DeleteWebdavFile = 'backup:delete-webdav-file',
  Backup_CheckS3Connection = 'backup:check-s3-connection',
  Backup_ToS3 = 'backup:to-s3',
  Backup_RestoreFromS3 = 'backup:restore-from-s3',
  Backup_ListS3Files = 'backup:list-s3-files',
  Backup_DeleteS3File = 'backup:delete-s3-file',

  // ── F004: Backup Progress Events ──
  Backup_Progress = 'backup:progress',
  Restore_Progress = 'backup:restore-progress',

  // ── F004: Data Migration ──
  Data_SetDataPath = 'data:set-data-path',
  Data_GetDataPath = 'data:get-data-path',
  Data_MigrateData = 'data:migrate-data',
  Data_MigrateProgress = 'data:migrate-progress',

  // ── F006: MCP Server Management ──
  Mcp_RestartServer = 'mcp:restart-server',
  Mcp_StopServer = 'mcp:stop-server',
  Mcp_RemoveServer = 'mcp:remove-server',
  Mcp_CheckConnectivity = 'mcp:check-connectivity',
  Mcp_GetServerVersion = 'mcp:get-server-version',
  Mcp_UploadDxt = 'mcp:upload-dxt',

  // ── F006: MCP Tools ──
  Mcp_ListTools = 'mcp:list-tools',
  Mcp_CallTool = 'mcp:call-tool',
  Mcp_AbortTool = 'mcp:abort-tool',

  // ── F006: MCP Prompts & Resources ──
  Mcp_ListPrompts = 'mcp:list-prompts',
  Mcp_GetPrompt = 'mcp:get-prompt',
  Mcp_ListResources = 'mcp:list-resources',
  Mcp_GetResource = 'mcp:get-resource',

  // ── F006: MCP Server Logs ──
  Mcp_GetServerLogs = 'mcp:get-server-logs',

  // ── F006: MCP Events (main → renderer) ──
  Mcp_AddServer = 'mcp:add-server',
  Mcp_ServersChanged = 'mcp:servers-changed',
  Mcp_ServersUpdated = 'mcp:servers-updated',
  Mcp_Progress = 'mcp:progress',
  Mcp_ServerLog = 'mcp:server-log',

  // ── F006: Code Tools ──
  CodeTools_Run = 'code-tools:run',
  CodeTools_GetAvailableTerminals = 'code-tools:get-available-terminals',
  CodeTools_SetCustomTerminalPath = 'code-tools:set-custom-terminal-path',
  CodeTools_GetCustomTerminalPath = 'code-tools:get-custom-terminal-path',
  CodeTools_RemoveCustomTerminalPath = 'code-tools:remove-custom-terminal-path',

  // ── F006: Python ──
  Python_Execute = 'python:execute'
}
