export enum IpcChannel {
  // File Operations
  File_Select = 'file:select',
  File_Upload = 'file:upload',
  File_Download = 'file:download',
  File_Read = 'file:read',
  File_Delete = 'file:delete',
  File_Open = 'file:open',
  File_GetPath = 'file:getPath',

  // App Management
  App_GetInfo = 'app:getInfo',
  App_GetProxy = 'app:getProxy',
  App_SetProxy = 'app:setProxy',
  App_GetTheme = 'app:getTheme',
  App_SetTheme = 'app:setTheme',
  App_CheckUpdate = 'app:checkUpdate',
  App_InstallUpdate = 'app:installUpdate',
  App_GetLocale = 'app:getLocale',
  App_SetLocale = 'app:setLocale',
  App_Quit = 'app:quit',
  App_Relaunch = 'app:relaunch',
  App_GetDataPath = 'app:getDataPath',
  App_SetDataPath = 'app:setDataPath',

  // Window Management
  Window_Show = 'window:show',
  Window_Hide = 'window:hide',
  Window_Minimize = 'window:minimize',
  Window_Maximize = 'window:maximize',
  Window_Close = 'window:close',
  Window_SetSize = 'window:setSize',
  Window_OpenMini = 'window:openMini',
  Window_OpenSelection = 'window:openSelection',
  Window_FullScreen = 'window:fullScreen',
  Window_IsFullScreen = 'window:isFullScreen',

  // Config
  Config_Get = 'config:get',
  Config_Set = 'config:set',

  // Notification
  Notification_Show = 'notification:show',
  Notification_Click = 'notification:click',

  // System
  System_OpenExternal = 'system:openExternal',
  System_OpenPath = 'system:openPath',
  System_GetMemoryUsage = 'system:getMemoryUsage',
  System_GetPlatform = 'system:getPlatform',
  System_GetArch = 'system:getArch',
  System_IsPortable = 'system:isPortable',
  System_GetLogPath = 'system:getLogPath',

  // Shortcuts
  Shortcuts_Update = 'shortcuts:update',

  // Events (push from main to renderer)
  ThemeUpdated = 'theme:updated'
}
