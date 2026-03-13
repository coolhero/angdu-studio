export enum IpcChannel {
  // Window Controls
  Window_Minimize = 'window:minimize',
  Window_Maximize = 'window:maximize',
  Window_Close = 'window:close',
  Window_IsMaximized = 'window:is-maximized',
  Window_SetFullScreen = 'window:set-fullscreen',
  Window_IsFullScreen = 'window:is-fullscreen',
  // Mini Window
  MiniWindow_Show = 'mini-window:show',
  MiniWindow_Hide = 'mini-window:hide',
  MiniWindow_Toggle = 'mini-window:toggle',
  MiniWindow_Close = 'mini-window:close',
  MiniWindow_SetPin = 'mini-window:set-pin',
  // App Lifecycle
  App_Info = 'app:info',
  App_Reload = 'app:reload',
  App_Quit = 'app:quit',
  App_SaveData = 'app:save-data',
  App_QuitAndInstall = 'app:quit-and-install',
  App_ClearCache = 'app:clear-cache',
  // Config
  App_SetProxy = 'app:set-proxy',
  App_SetTheme = 'app:set-theme',
  App_HandleZoomFactor = 'app:handle-zoom-factor',
  // System
  Open_Website = 'app:open-website',
  App_GetSystemFonts = 'app:get-system-fonts',
  App_GetIpCountry = 'app:get-ip-country',
  App_MacIsProcessTrusted = 'app:mac-is-process-trusted',
  App_MacRequestProcessTrust = 'app:mac-request-process-trust',
  // Update
  App_CheckForUpdates = 'app:check-for-updates',
  App_DownloadUpdate = 'app:download-update',
  App_CancelDownload = 'app:cancel-download',
  App_UpdateProgress = 'app:update-progress',
  // Prevent quit
  App_SetStopQuitApp = 'app:set-stop-quit-app',
  // Data path
  App_RelaunchApp = 'app:relaunch-app',
}
