import { ipcRenderer } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'

export const configApi = {
  get: (key: string) => ipcRenderer.invoke(IpcChannel.Config_Get, key),
  set: (key: string, value: unknown) =>
    ipcRenderer.invoke(IpcChannel.Config_Set, { key, value })
}
