import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { WindowService } from './services/WindowService'
import { LoggerService } from './services/LoggerService'
import { AppService } from './services/AppService'
import { ThemeService } from './services/ThemeService'
import { TrayService } from './services/TrayService'
import { ShortcutService } from './services/ShortcutService'
import { NotificationService } from './services/NotificationService'
import { ContextMenuService } from './services/ContextMenuService'
import { PowerMonitorService } from './services/PowerMonitorService'
import { ProxyManager } from './services/ProxyManager'
import { ConfigManager } from './services/ConfigManager'
import { registerIpcHandlers } from './ipc'

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  const logger = LoggerService.getInstance().withContext('Main')

  app.on('second-instance', () => {
    const windowService = WindowService.getInstance()
    windowService.showMainWindow()
  })

  app.whenReady().then(() => {
    logger.info('App ready, initializing services...')

    electronApp.setAppUserModelId('com.angdu.studio')

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    // Initialize services
    AppService.getInstance()
    ThemeService.getInstance()
    const configManager = ConfigManager.getInstance()

    // Set up proxy from config
    const proxyMode = configManager.get<string>('proxyMode', 'system')
    const proxyUrl = configManager.get<string>('proxyUrl', '')
    ProxyManager.getInstance().setProxy(
      proxyMode as 'system' | 'fixed' | 'direct',
      proxyUrl
    )

    // Register IPC handlers
    registerIpcHandlers()

    // Create main window
    const windowService = WindowService.getInstance()
    const mainWindow = windowService.createMainWindow()

    // Initialize remaining services that need the window
    TrayService.getInstance().init(mainWindow)
    ShortcutService.getInstance()
    NotificationService.getInstance()
    ContextMenuService.getInstance().init(mainWindow)
    PowerMonitorService.getInstance()

    logger.info('All services initialized')
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      WindowService.getInstance().createMainWindow()
    } else {
      WindowService.getInstance().showMainWindow()
    }
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error: error.message, stack: error.stack })
  })

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason: String(reason) })
  })
}
