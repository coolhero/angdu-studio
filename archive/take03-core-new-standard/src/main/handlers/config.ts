import { IpcChannel } from '@shared/IpcChannel'
import { ConfigKey } from '@shared/types'
import type { ConfigManager } from '../services/ConfigManager'
import { registerHandlers } from '../ipc'

export function registerConfigHandlers(configManager: ConfigManager): void {
  registerHandlers([
    [
      IpcChannel.Config_Get,
      (_event, key: unknown) => configManager.get(key as ConfigKey)
    ],
    [
      IpcChannel.Config_Set,
      (_event, key: unknown, value: unknown) => {
        configManager.setAndNotify(key as ConfigKey, value as never)
      }
    ]
  ])
}
