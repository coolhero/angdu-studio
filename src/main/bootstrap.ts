import { logger } from './services/LoggerService'
import { configService } from './services/ConfigService'
import { windowService } from './services/WindowService'
import { trayService } from './services/TrayService'
import { updateService } from './services/UpdateService'
import { protocolService } from './services/ProtocolService'
import { shortcutService } from './services/ShortcutService'
import { proxyService } from './services/ProxyService'
import { powerService } from './services/PowerService'
import { registerAllHandlers } from './ipc'
import { ProviderService } from './services/ProviderService'

export async function initializeServices(): Promise<void> {
  // Phase 1: Core infrastructure (order matters)
  logger.initialize()
  logger.info('[Bootstrap] Starting Angdu Studio...')

  configService.initialize()

  // Phase 1b: Initialize provider service (loads system providers)
  await ProviderService.getInstance().initialize()

  // Phase 2: Register all IPC handlers BEFORE window loads content
  registerAllHandlers()

  // Phase 3: Create window (loads renderer which may call IPC immediately)
  windowService.createMainWindow()

  // Phase 4: System integration services
  trayService.initialize()
  protocolService.initialize()
  shortcutService.initialize()
  await proxyService.initialize()
  updateService.initialize()
  powerService.initialize()

  // Phase 5: Mark ready for deferred operations
  protocolService.markReady()

  logger.info('[Bootstrap] All services initialized')
}
