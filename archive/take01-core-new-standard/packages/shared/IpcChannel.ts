/**
 * Central IPC channel enum.
 * All IPC communication between main and renderer processes
 * MUST use one of these channels.
 */
export enum IpcChannel {
  // App lifecycle
  AppGetInfo = 'app:get-info',
  AppQuit = 'app:quit',
  AppRelaunch = 'app:relaunch',
  AppSetLanguage = 'app:set-language',

  // Window management
  WindowMinimize = 'window:minimize',
  WindowMaximize = 'window:maximize',
  WindowClose = 'window:close',
  WindowIsMaximized = 'window:is-maximized',

  // File operations
  FileSelect = 'file:select',
  FileSave = 'file:save',
  FileRead = 'file:read',
  FileDelete = 'file:delete',
  FileGetMetadata = 'file:get-metadata',

  // Config / settings
  ConfigGet = 'config:get',
  ConfigSet = 'config:set',
  ConfigReset = 'config:reset',

  // Shortcuts
  ShortcutRegister = 'shortcut:register',
  ShortcutUnregister = 'shortcut:unregister',
  ShortcutGetAll = 'shortcut:get-all',

  // Shell / OS integration
  ShellOpenExternal = 'shell:open-external',
  ShellShowItemInFolder = 'shell:show-item-in-folder',

  // System
  SystemGetDeviceType = 'system:get-device-type',

  // Zip
  ZipCompress = 'zip:compress',
  ZipDecompress = 'zip:decompress',

  // Dialog
  DialogShowMessage = 'dialog:show-message',
  DialogShowError = 'dialog:show-error'
}
