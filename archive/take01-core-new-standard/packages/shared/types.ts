import type { IpcChannel } from './IpcChannel'
import type { FileMetadata } from './types/file'
import type { Shortcut } from './types/shortcut'
import type { ConfigSchema } from './types/config'

/**
 * Maps each IPC channel to its request payload and response type.
 * This is the single source of truth for IPC type safety.
 */
export interface IpcChannelMap {
  // App lifecycle
  [IpcChannel.AppGetInfo]: {
    request: []
    response: { name: string; version: string; electronVersion: string }
  }
  [IpcChannel.AppQuit]: {
    request: []
    response: void
  }
  [IpcChannel.AppRelaunch]: {
    request: []
    response: void
  }
  [IpcChannel.AppSetLanguage]: {
    request: [language: string]
    response: void
  }

  // Window management
  [IpcChannel.WindowMinimize]: {
    request: []
    response: void
  }
  [IpcChannel.WindowMaximize]: {
    request: []
    response: void
  }
  [IpcChannel.WindowClose]: {
    request: []
    response: void
  }
  [IpcChannel.WindowIsMaximized]: {
    request: []
    response: boolean
  }

  // File operations
  [IpcChannel.FileSelect]: {
    request: [options?: { filters?: Array<{ name: string; extensions: string[] }> }]
    response: string[] | null
  }
  [IpcChannel.FileSave]: {
    request: [path: string, data: Uint8Array | string]
    response: void
  }
  [IpcChannel.FileRead]: {
    request: [path: string]
    response: Uint8Array
  }
  [IpcChannel.FileDelete]: {
    request: [path: string]
    response: void
  }
  [IpcChannel.FileGetMetadata]: {
    request: [path: string]
    response: FileMetadata
  }

  // Config / settings
  [IpcChannel.ConfigGet]: {
    request: []
    response: ConfigSchema
  }
  [IpcChannel.ConfigSet]: {
    request: [config: Partial<ConfigSchema>]
    response: void
  }
  [IpcChannel.ConfigReset]: {
    request: []
    response: ConfigSchema
  }

  // Shortcuts
  [IpcChannel.ShortcutRegister]: {
    request: [shortcut: Omit<Shortcut, 'id'>]
    response: Shortcut
  }
  [IpcChannel.ShortcutUnregister]: {
    request: [id: string]
    response: void
  }
  [IpcChannel.ShortcutGetAll]: {
    request: []
    response: Shortcut[]
  }

  // Shell / OS integration
  [IpcChannel.ShellOpenExternal]: {
    request: [url: string]
    response: void
  }
  [IpcChannel.ShellShowItemInFolder]: {
    request: [path: string]
    response: void
  }

  // System
  [IpcChannel.SystemGetDeviceType]: {
    request: []
    response: { platform: string; arch: string; hostname: string }
  }

  // Zip
  [IpcChannel.ZipCompress]: {
    request: [data: Uint8Array]
    response: Uint8Array
  }
  [IpcChannel.ZipDecompress]: {
    request: [data: Uint8Array]
    response: Uint8Array
  }

  // Dialog
  [IpcChannel.DialogShowMessage]: {
    request: [options: { type?: 'info' | 'warning' | 'error'; title: string; message: string }]
    response: number
  }
  [IpcChannel.DialogShowError]: {
    request: [title: string, content: string]
    response: void
  }
}
