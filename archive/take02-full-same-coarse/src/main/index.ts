import { isMac } from '@main/constant'
import { loggerService } from '@main/services/LoggerService'
import { powerMonitorService } from '@main/services/PowerMonitorService'
import { windowService } from '@main/services/WindowService'
import { app } from 'electron'
import { bootstrap } from './bootstrap'

const logger = loggerService.withContext('MainEntry')

// Check for single instance lock
if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
} else {
  app.whenReady().then(async () => {
    logger.info('App is ready, starting bootstrap...')

    const _mainWindow = await bootstrap()

    powerMonitorService.init()

    app.on('activate', () => {
      const existingWindow = windowService.getMainWindow()
      if (!existingWindow || existingWindow.isDestroyed()) {
        windowService.createMainWindow()
      } else {
        windowService.showMainWindow()
      }
    })

    logger.info('Application started successfully')
  })

  app.on('second-instance', () => {
    windowService.showMainWindow()
  })

  app.on('window-all-closed', () => {
    if (!isMac) {
      app.quit()
    }
  })

  app.on('before-quit', () => {
    logger.info('Application is quitting...')
    ;(app as unknown as { isQuitting: boolean }).isQuitting = true
  })
}
