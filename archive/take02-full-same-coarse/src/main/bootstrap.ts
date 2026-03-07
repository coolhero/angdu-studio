import { loggerService } from '@main/services/LoggerService'
import { powerMonitorService } from '@main/services/PowerMonitorService'
import { trayService } from '@main/services/TrayService'
import { windowService } from '@main/services/WindowService'
import { app } from 'electron'
import { registerIpc } from './ipc'

const logger = loggerService.withContext('Bootstrap')

export async function bootstrap() {
  logger.info('Initializing Cherry Studio...')

  const mainWindow = windowService.createMainWindow()

  powerMonitorService.onStateChange(() => {
    logger.info('Power state change detected, saving state...')
  })

  registerIpc(mainWindow, app)

  // Initialize system tray (always enabled for now)
  trayService.init()

  logger.info('Cherry Studio initialized successfully')
  return mainWindow
}
