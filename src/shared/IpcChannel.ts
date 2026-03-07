export enum IpcChannel {
  // app:* — Application Lifecycle
  AppInfo = 'app:info',
  AppGetPath = 'app:get-path',
  AppGetDataPath = 'app:get-data-path',
  AppSetDataPath = 'app:set-data-path',
  AppGetLanguage = 'app:get-language',
  AppSetLanguage = 'app:set-language',
  AppSetLaunchOnBoot = 'app:set-launch-on-boot',
  AppGetLaunchOnBoot = 'app:get-launch-on-boot',
  AppSetProxy = 'app:set-proxy',
  AppGetProxy = 'app:get-proxy',
  AppQuit = 'app:quit',
  AppRelaunch = 'app:relaunch',

  // config:* — Configuration
  ConfigGet = 'config:get',
  ConfigSet = 'config:set',
  ConfigGetAll = 'config:get-all',
  ConfigReset = 'config:reset',
  ConfigResetAll = 'config:reset-all',
  ConfigChanged = 'config:changed',

  // window:* — Window Management
  WindowShow = 'window:show',
  WindowHide = 'window:hide',
  WindowMinimize = 'window:minimize',
  WindowMaximize = 'window:maximize',
  WindowClose = 'window:close',
  WindowSetSize = 'window:set-size',
  WindowSetPosition = 'window:set-position',
  WindowGetState = 'window:get-state',
  WindowSetAlwaysOnTop = 'window:set-always-on-top',
  WindowSetFullscreen = 'window:set-fullscreen',

  // system:* — System Information
  SystemInfo = 'system:info',
  SystemClipboardRead = 'system:clipboard-read',
  SystemClipboardWrite = 'system:clipboard-write',
  SystemGetScreens = 'system:get-screens',
  SystemGetDeviceType = 'system:get-device-type',

  // open:* — External Navigation
  OpenUrl = 'open:url',
  OpenPath = 'open:path',

  // theme:* — Theme Management
  ThemeGet = 'theme:get',
  ThemeSet = 'theme:set',
  ThemeChanged = 'theme:changed'
}
