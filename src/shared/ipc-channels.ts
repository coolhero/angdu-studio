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
  Crash_MockRenderer = 'crash:mock-renderer'
}
