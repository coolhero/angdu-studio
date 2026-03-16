import type { AppConfig, ConfigKey } from './config'
import type { WindowState } from './window'

// --- Invoke Channels (request/response) ---

export interface InvokeChannelMap {
  // Config
  'config:get': { args: [key: ConfigKey]; return: unknown }
  'config:set': { args: [key: ConfigKey, value: unknown]; return: void }
  'config:reset': { args: []; return: void }
  'config:getAll': { args: []; return: AppConfig }

  // Window
  'window:minimize': { args: []; return: void }
  'window:maximize': { args: []; return: void }
  'window:close': { args: []; return: void }
  'window:setSize': { args: [width: number, height: number]; return: void }

  // File
  'file:read': { args: [relativePath: string]; return: Buffer }
  'file:write': { args: [relativePath: string, data: Buffer]; return: void }
  'file:delete': { args: [relativePath: string]; return: void }

  // Shell
  'shell:openExternal': { args: [url: string]; return: void }
  'shell:openPath': { args: [path: string]; return: void }
  'shell:showItemInFolder': { args: [path: string]; return: void }

  // Dialog
  'dialog:openFile': {
    args: [options?: { filters?: { name: string; extensions: string[] }[]; properties?: string[] }]
    return: string[] | null
  }
  'dialog:saveFile': {
    args: [options?: { defaultPath?: string; filters?: { name: string; extensions: string[] }[] }]
    return: string | null
  }

  // Clipboard
  'clipboard:read': { args: []; return: string }
  'clipboard:write': { args: [text: string]; return: void }
  'clipboard:readImage': { args: []; return: Buffer | null }

  // Theme
  'theme:get': { args: []; return: 'light' | 'dark' }
  'theme:set': { args: [theme: 'light' | 'dark' | 'system']; return: void }

  // App
  'app:getVersion': { args: []; return: string }
  'app:getPlatform': { args: []; return: 'darwin' | 'win32' | 'linux' }
  'app:getPath': {
    args: [name: 'home' | 'appData' | 'userData' | 'temp' | 'logs' | 'documents' | 'downloads']
    return: string
  }
  'app:relaunch': { args: []; return: void }
  'app:quit': { args: []; return: void }

  // Data (F003)
  'data:export': { args: [includeDocs?: boolean]; return: Buffer }
  'data:import': { args: [zipBuffer: ArrayBuffer]; return: void }
  'data:clear': { args: []; return: void }
  'data:getStoragePath': { args: []; return: string }

  // Shortcuts (F003)
  'shortcuts:register': { args: [key: string, accelerator: string]; return: boolean }
  'shortcuts:unregister': { args: [key: string]; return: void }
  'shortcuts:unregisterAll': { args: []; return: void }

  // Startup (F003)
  'startup:setLoginItem': { args: [enabled: boolean]; return: void }
}

// --- Event Channels (main → renderer) ---

export interface EventChannelMap {
  'theme:changed': { payload: 'light' | 'dark' }
  'window:focus': { payload: void }
  'window:blur': { payload: void }
  'window:state-changed': { payload: WindowState }
  'update:available': { payload: { version: string } }
  'update:progress': {
    payload: { percent: number; bytesPerSecond: number; total: number; transferred: number }
  }
  'update:ready': { payload: { version: string } }
  'deep-link:received': { payload: { url: string } }
}

// --- Type utilities ---

export type InvokeChannel = keyof InvokeChannelMap
export type EventChannel = keyof EventChannelMap

export type InvokeArgs<C extends InvokeChannel> = InvokeChannelMap[C]['args']
export type InvokeReturn<C extends InvokeChannel> = InvokeChannelMap[C]['return']
export type EventPayload<C extends EventChannel> = EventChannelMap[C]['payload']
