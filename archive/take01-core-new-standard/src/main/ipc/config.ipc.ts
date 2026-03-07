import { IpcChannel } from '@shared/IpcChannel'
import { typedHandle } from './typedHandle'
import type { ConfigService } from '../services/ConfigService'

/**
 * Registers config/settings IPC handlers.
 */
export function registerConfigIpc(configService: ConfigService): void {
  typedHandle(IpcChannel.ConfigGet, async () => {
    return configService.getAll()
  })

  typedHandle(IpcChannel.ConfigSet, async (_event, config) => {
    for (const [key, value] of Object.entries(config)) {
      configService.set(key as keyof typeof config, value as never)
    }
  })

  typedHandle(IpcChannel.ConfigReset, async () => {
    return configService.reset()
  })
}
