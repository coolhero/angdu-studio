import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { initializeServices } from './bootstrap'
import { windowService } from './services/WindowService'
import { protocolService } from './services/ProtocolService'
import { configService } from './services/ConfigService'
import { shortcutService } from './services/ShortcutService'
import { logger } from './services/LoggerService'

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
  process.exit(0)
}

app.on('second-instance', (_event, argv) => {
  windowService.showMainWindow()
  protocolService.handleSecondInstanceArgs(argv)
})

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.angdu.studio')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  await initializeServices()

  logger.info('[App] Ready')
})

app.on('before-quit', () => {
  ;(app as unknown as { isQuitting: boolean }).isQuitting = true
  shortcutService.cleanup()
  configService.close()
  logger.info('[App] Quitting')
})

app.on('window-all-closed', () => {
  // On macOS, don't quit when all windows are closed
  if (process.platform !== 'darwin') {
    // On Windows/Linux, the tray keeps the app running
    // Only quit if explicitly requested via app.quit()
  }
})

app.on('activate', () => {
  // macOS: re-create window when dock icon clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    windowService.createMainWindow()
  } else {
    windowService.showMainWindow()
  }
})
