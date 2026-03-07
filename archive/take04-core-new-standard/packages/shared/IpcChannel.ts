export enum IpcChannel {
  // ── App Domain ──
  App_Info = 'app:info',
  App_Reload = 'app:reload',
  App_Quit = 'app:quit',
  App_SetTheme = 'app:setTheme',
  App_GetTheme = 'app:getTheme',
  App_SetLanguage = 'app:setLanguage',
  App_GetLocale = 'app:getLocale',
  App_SetProxy = 'app:setProxy',
  App_GetProxy = 'app:getProxy',
  App_SetZoomFactor = 'app:setZoomFactor',
  App_GetZoomFactor = 'app:getZoomFactor',
  App_GetPath = 'app:getPath',
  App_GetSystemInfo = 'app:getSystemInfo',
  App_GetCacheSize = 'app:getCacheSize',
  App_ClearCache = 'app:clearCache',
  App_SetLaunchOnBoot = 'app:setLaunchOnBoot',
  App_GetLoginItem = 'app:getLoginItem',
  App_SetAlwaysOnTop = 'app:setAlwaysOnTop',
  App_ToggleFullScreen = 'app:toggleFullScreen',
  App_IsFullScreen = 'app:isFullScreen',
  App_SetBadgeCount = 'app:setBadgeCount',
  App_ShowDock = 'app:showDock',
  App_HideDock = 'app:hideDock',
  App_SetProgressBar = 'app:setProgressBar',
  App_BounceDock = 'app:bounceDock',
  App_GetDisplays = 'app:getDisplays',
  App_IsFocused = 'app:isFocused',
  App_Focus = 'app:focus',
  App_MinimizeToTray = 'app:minimizeToTray',
  App_RestoreFromTray = 'app:restoreFromTray',
  App_GetArgv = 'app:getArgv',
  App_Log = 'app:log',
  App_OpenLogFolder = 'app:openLogFolder',
  App_DisableHardwareAcceleration = 'app:disableHardwareAcceleration',
  App_CheckForUpdate = 'app:checkForUpdate',
  App_DownloadUpdate = 'app:downloadUpdate',
  App_InstallUpdate = 'app:installUpdate',
  App_SetTrayTitle = 'app:setTrayTitle',
  App_SetTrayIcon = 'app:setTrayIcon',
  App_ShowTrayMenu = 'app:showTrayMenu',
  App_RegisterProtocol = 'app:registerProtocol',
  App_HandleProtocol = 'app:handleProtocol',
  App_SetMenu = 'app:setMenu',
  App_SetContextMenu = 'app:setContextMenu',
  App_GpuInfo = 'app:gpuInfo',
  App_GetSafeArea = 'app:getSafeArea',

  // ── Config Domain ──
  Config_Get = 'config:get',
  Config_Set = 'config:set',

  // ── File Domain ──
  File_Open = 'file:open',
  File_Save = 'file:save',
  File_Read = 'file:read',
  File_Write = 'file:write',
  File_Delete = 'file:delete',
  File_Copy = 'file:copy',
  File_Move = 'file:move',
  File_Rename = 'file:rename',
  File_Exists = 'file:exists',
  File_Stat = 'file:stat',
  File_Mkdir = 'file:mkdir',
  File_Readdir = 'file:readdir',
  File_SelectFolder = 'file:selectFolder',
  File_Upload = 'file:upload',
  File_Download = 'file:download',
  File_Base64Encode = 'file:base64Encode',
  File_Base64Decode = 'file:base64Decode',
  File_BinaryRead = 'file:binaryRead',
  File_BinaryWrite = 'file:binaryWrite',
  File_Hash = 'file:hash',
  File_Compress = 'file:compress',
  File_Decompress = 'file:decompress',
  File_GetType = 'file:getType',
  File_GetSize = 'file:getSize',
  File_OpenInExplorer = 'file:openInExplorer',
  File_Append = 'file:append',
  File_Glob = 'file:glob',
  File_StartWatcher = 'file:startWatcher',
  File_StopWatcher = 'file:stopWatcher',
  File_GetMetadata = 'file:getMetadata',
  File_SelectFile = 'file:selectFile',
  File_GetIcon = 'file:getIcon',
  File_CreateTemp = 'file:createTemp',
  File_Truncate = 'file:truncate',
  File_GetTempPath = 'file:getTempPath',
  File_GetDownloadsPath = 'file:getDownloadsPath',
  File_GetRecent = 'file:getRecent',
  File_ClearRecent = 'file:clearRecent',
  File_Thumbnail = 'file:thumbnail',

  // ── File Events (M→R) ──
  File_Changed = 'file:changed',

  // ── Window Domain ──
  Windows_Minimize = 'windows:minimize',
  Windows_Maximize = 'windows:maximize',
  Windows_Close = 'windows:close',
  Windows_Create = 'windows:create',
  Windows_Focus = 'windows:focus',
  Windows_SetTitle = 'windows:setTitle',
  Windows_SetSize = 'windows:setSize',
  Windows_ToggleDevTools = 'windows:toggleDevTools',
  Windows_ShowContextMenu = 'windows:showContextMenu',
  Windows_SetFullscreen = 'windows:setFullscreen',
  Windows_GetBounds = 'windows:getBounds',

  // ── System Domain ──
  System_GetLocale = 'system:getLocale',
  System_GetPlatform = 'system:getPlatform',
  System_GetArch = 'system:getArch',
  System_GetMemory = 'system:getMemory',
  System_GetCPU = 'system:getCPU',
  System_GetHostname = 'system:getHostname',
  System_IsDarkMode = 'system:isDarkMode',
  System_GetDisplays = 'system:getDisplays',

  // ── MiniWindow Domain ──
  MiniWindow_Show = 'miniWindow:show',
  MiniWindow_Hide = 'miniWindow:hide',
  MiniWindow_SetPin = 'miniWindow:setPin',
  MiniWindow_Toggle = 'miniWindow:toggle',
  MiniWindow_GetBounds = 'miniWindow:getBounds',

  // ── Notification ──
  Notification_Show = 'notification:show',
  Notification_Clear = 'notification:clear',

  // ── Open ──
  Open_Url = 'open:url',
  Open_Path = 'open:path',

  // ── AES ──
  AES_Encrypt = 'aes:encrypt',
  AES_Decrypt = 'aes:decrypt',

  // ── Zip ──
  Zip_Compress = 'zip:compress',
  Zip_Decompress = 'zip:decompress',

  // ── Shortcuts ──
  Shortcuts_Register = 'shortcuts:register',

  // ── StoreSync ──
  StoreSync_GetState = 'storeSync:getState',
  StoreSync_SetState = 'storeSync:setState',
  StoreSync_Subscribe = 'storeSync:subscribe',
  StoreSync_StateChanged = 'storeSync:stateChanged',

  // ── Copilot OAuth (F002) ──
  Copilot_GetAuthMessage = 'copilot:getAuthMessage',
  Copilot_GetToken = 'copilot:getToken',
  Copilot_SaveToken = 'copilot:saveToken',
  Copilot_GetCopilotToken = 'copilot:getCopilotToken',
  Copilot_GetUser = 'copilot:getUser',
  Copilot_Logout = 'copilot:logout',

  // ── CherryIN OAuth (F002) ──
  CherryIN_StartOAuth = 'cherryIn:startOAuth',
  CherryIN_ExchangeToken = 'cherryIn:exchangeToken',
  CherryIN_GetBalance = 'cherryIn:getBalance',
  CherryIN_Logout = 'cherryIn:logout',
  CherryIN_RefreshToken = 'cherryIn:refreshToken',
  CherryIN_OAuthCallback = 'cherryIn:oauthCallback',

  // ── Anthropic OAuth (F002) ──
  AnthropicOAuth_Start = 'anthropicOAuth:start',
  AnthropicOAuth_Complete = 'anthropicOAuth:complete',
  AnthropicOAuth_GetToken = 'anthropicOAuth:getToken',
  AnthropicOAuth_Clear = 'anthropicOAuth:clear',
  AnthropicOAuth_Cancel = 'anthropicOAuth:cancel',
  AnthropicOAuth_Status = 'anthropicOAuth:status',

  // ── VertexAI Auth (F002) ──
  VertexAI_GetAccessToken = 'vertexAI:getAccessToken',
  VertexAI_GetAuthHeaders = 'vertexAI:getAuthHeaders',
  VertexAI_ClearCache = 'vertexAI:clearCache',

  // ── Provider (F002) ──
  Provider_CheckConnectivity = 'provider:checkConnectivity',

  // ── KnowledgeBase Domain (F004) ──
  KB_Create = 'knowledge-base:create',
  KB_Delete = 'knowledge-base:delete',
  KB_Reset = 'knowledge-base:reset',
  KB_AddItem = 'knowledge-base:add-item',
  KB_RemoveItem = 'knowledge-base:remove-item',
  KB_Search = 'knowledge-base:search',
  KB_Rerank = 'knowledge-base:rerank',

  // ── KnowledgeBase Events (M→R) ──
  KB_ItemStatus = 'knowledge-base:item-status',
  KB_DirectoryProgress = 'knowledge-base:directory-progress',

  // ── Global Events (M→R) ──
  ThemeUpdated = 'event:themeUpdated',
  WindowFocused = 'event:windowFocused',
  WindowBlurred = 'event:windowBlurred',
  WindowResized = 'event:windowResized',
  WindowMoved = 'event:windowMoved',
  DeepLinkReceived = 'event:deepLinkReceived',
  TrayClicked = 'event:trayClicked',
  PowerMonitor_Suspend = 'event:powerMonitorSuspend',
  PowerMonitor_Resume = 'event:powerMonitorResume',
  NetworkStatusChanged = 'event:networkStatusChanged'
}
