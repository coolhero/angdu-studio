import { ipcMain } from 'electron'
import { configService } from '../services/ConfigService'
import type { ConfigKey } from '@shared/types/config'

export function registerConfigHandlers(): void {
  ipcMain.handle('config:get', (_event, key: ConfigKey) => {
    return configService.get(key)
  })

  ipcMain.handle('config:set', (_event, key: ConfigKey, value: unknown) => {
    configService.set(key, value as never)
  })

  ipcMain.handle('config:reset', () => {
    configService.reset()
  })

  ipcMain.handle('config:getAll', () => {
    return configService.getAll()
  })
}
