/**
 * Central IPC channel enum — all inter-process communication MUST reference this enum.
 * Constitution Principle V: No string-literal channel names permitted.
 *
 * Naming: Domain_Action (e.g., App_Info, File_Read, Config_Set)
 * Direction: R->M = Renderer invokes Main; M->R = Main pushes to Renderer
 */
export enum IpcChannel {
  // ── App Domain ──
  App_Info = 'app:info',
  App_Quit = 'app:quit',
  App_Reload = 'app:reload',
  App_Relaunch = 'app:relaunch',
  App_SetLanguage = 'app:set-language',
  App_SetTheme = 'app:set-theme',
  App_ThemeChanged = 'app:theme-changed', // M->R
  App_SetProxy = 'app:set-proxy',
  App_SetLaunchOnBoot = 'app:set-launch-on-boot',
  App_SetLaunchToTray = 'app:set-launch-to-tray',
  App_SetTray = 'app:set-tray',
  App_SetTrayOnClose = 'app:set-tray-on-close',
  App_HandleZoomFactor = 'app:handle-zoom-factor',
  App_SetDisableHardwareAcceleration = 'app:set-disable-hardware-acceleration',
  App_SetUseSystemTitleBar = 'app:set-use-system-title-bar',
  App_HandleProtocol = 'app:handle-protocol', // M->R
  App_LogToMain = 'app:log-to-main',
  App_GetPath = 'app:get-path',
  App_GetSystemInfo = 'app:get-system-info',
  App_SetEnableSpellCheck = 'app:set-enable-spell-check',
  App_SetSpellCheckLanguages = 'app:set-spell-check-languages',
  App_ClearCache = 'app:clear-cache',
  App_GetCacheSize = 'app:get-cache-size',

  // ── Config Domain ──
  Config_Get = 'config:get',
  Config_Set = 'config:set',

  // ── Window Domain ──
  Window_Minimize = 'window:minimize',
  Window_Maximize = 'window:maximize',
  Window_Unmaximize = 'window:unmaximize',
  Window_Close = 'window:close',
  Window_IsMaximized = 'window:is-maximized',
  Window_MaximizedChanged = 'window:maximized-changed', // M->R
  Window_GetSize = 'window:get-size',
  Window_SetMinimumSize = 'window:set-minimum-size',
  Window_ResetMinimumSize = 'window:reset-minimum-size',
  Window_Resize = 'window:resize', // M->R
  Window_FullscreenChanged = 'window:fullscreen-changed', // M->R

  // ── File Domain ──
  File_Select = 'file:select',
  File_Open = 'file:open',
  File_Save = 'file:save',
  File_Read = 'file:read',
  File_Write = 'file:write',
  File_Upload = 'file:upload',
  File_Delete = 'file:delete',
  File_Copy = 'file:copy',
  File_Move = 'file:move',
  File_IsTextFile = 'file:is-text-file',
  File_IsDirectory = 'file:is-directory',
  File_ListDirectory = 'file:list-directory',
  File_Base64Image = 'file:base64-image',
  File_BinaryImage = 'file:binary-image',
  File_SavePastedImage = 'file:save-pasted-image',
  File_PdfInfo = 'file:pdf-info',
  File_StartWatcher = 'file:start-watcher',
  File_StopWatcher = 'file:stop-watcher',
  File_OnChange = 'file:on-change', // M->R

  // ── Mini Window Domain ──
  MiniWindow_Show = 'mini-window:show',
  MiniWindow_Hide = 'mini-window:hide',
  MiniWindow_Close = 'mini-window:close',
  MiniWindow_Toggle = 'mini-window:toggle',
  MiniWindow_SetPin = 'mini-window:set-pin',

  // ── System Domain ──
  System_GetDeviceType = 'system:get-device-type',
  System_GetHostname = 'system:get-hostname',
  System_GetCpuName = 'system:get-cpu-name',
  System_GetPlatform = 'system:get-platform',

  // ── Utility Domain ──
  Aes_Encrypt = 'aes:encrypt',
  Aes_Decrypt = 'aes:decrypt',
  Zip_Compress = 'zip:compress',
  Zip_Decompress = 'zip:decompress',
  Open_Url = 'open:url',
  Open_Path = 'open:path',
  Notification_Send = 'notification:send',
  Analytics_Track = 'analytics:track',
  Shortcuts_Register = 'shortcuts:register',

  // ── Store Sync Domain ──
  StoreSync_GetState = 'store-sync:get-state',
  StoreSync_SetState = 'store-sync:set-state',
  StoreSync_StateChanged = 'store-sync:state-changed' // M->R
}
