import { contextBridge, ipcRenderer } from 'electron'
import type {
  InvokeChannel,
  InvokeArgs,
  InvokeReturn,
  EventChannel,
  EventPayload
} from '@shared/types/ipc'

const INVOKE_CHANNELS: InvokeChannel[] = [
  'config:get', 'config:set', 'config:reset', 'config:getAll',
  'window:minimize', 'window:maximize', 'window:close', 'window:setSize',
  'file:read', 'file:write', 'file:delete',
  'shell:openExternal', 'shell:openPath', 'shell:showItemInFolder',
  'dialog:openFile', 'dialog:saveFile',
  'clipboard:read', 'clipboard:write', 'clipboard:readImage',
  'theme:get', 'theme:set',
  'app:getVersion', 'app:getPlatform', 'app:getPath', 'app:relaunch', 'app:quit',
  'data:export', 'data:import', 'data:clear', 'data:getStoragePath',
  'shortcuts:register', 'shortcuts:unregister', 'shortcuts:unregisterAll',
  'startup:setLoginItem',
  'provider:list', 'provider:add', 'provider:update', 'provider:delete',
  'provider:test-connection', 'provider:fetch-models', 'provider:add-custom-model',
  'ai:chat', 'ai:abort'
]

const EVENT_CHANNELS: EventChannel[] = [
  'theme:changed', 'window:focus', 'window:blur', 'window:state-changed',
  'update:available', 'update:progress', 'update:ready', 'deep-link:received',
  'ai:stream-chunk', 'ai:stream-complete', 'ai:stream-error'
]

function createInvoke() {
  const invoke = {} as {
    [C in InvokeChannel]: (...args: InvokeArgs<C>) => Promise<InvokeReturn<C>>
  }

  for (const channel of INVOKE_CHANNELS) {
    ;(invoke as Record<string, Function>)[channel] = (...args: unknown[]) => {
      return ipcRenderer.invoke(channel, ...args)
    }
  }

  return invoke
}

function createEventAPI() {
  return {
    on<C extends EventChannel>(
      channel: C,
      callback: (payload: EventPayload<C>) => void
    ): () => void {
      if (!EVENT_CHANNELS.includes(channel)) {
        throw new Error(`Event channel not whitelisted: ${channel}`)
      }

      const handler = (_event: Electron.IpcRendererEvent, payload: EventPayload<C>) => {
        callback(payload)
      }

      ipcRenderer.on(channel, handler)

      return () => {
        ipcRenderer.removeListener(channel, handler)
      }
    }
  }
}

const api = {
  invoke: createInvoke(),
  events: createEventAPI()
}

contextBridge.exposeInMainWorld('api', api)

export type AngduAPI = typeof api
