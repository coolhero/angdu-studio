import { ipcMain } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import { configManager } from '../config'
import type { ConfigKeys } from '@shared/types'

export function registerConfigHandlers(): void {
  ipcMain.handle(IpcChannel.Config_Get, (_, key: string) => {
    return configManager.get(key as ConfigKeys)
  })

  ipcMain.handle(IpcChannel.Config_Set, (_, { key, value }: { key: string; value: unknown }) => {
    configManager.set(key as ConfigKeys, value)
  })
}
