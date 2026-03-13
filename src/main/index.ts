import { app, BrowserWindow, shell } from 'electron'
import { initAppDataDir } from './bootstrap'
import { registerIpc, isStopQuitApp } from './ipc'
import { ConfigManager } from './services/ConfigManager'
import { WindowService } from './services/WindowService'
import { TrayService } from './services/TrayService'
import { ThemeService } from './services/ThemeService'
import { ShortcutService } from './services/ShortcutService'
import { PowerMonitorService } from './services/PowerMonitorService'
import { AppMenuService } from './services/AppMenuService'
import { ProtocolClient } from './services/ProtocolClient'
import { isMac } from './constant'

let lastCrashTime = 0

// Register protocol before app ready
const protocolClient = ProtocolClient.getInstance()
protocolClient.register()

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, argv) => {
    const windowService = WindowService.getInstance()
    windowService.showMainWindow()
    // Handle protocol URL from second instance (Windows/Linux)
    if (!isMac) {
      protocolClient.handleSecondInstanceArgs(argv)
    }
  })

  app.whenReady().then(() => {
    // 1. Bootstrap — data directory setup
    initAppDataDir()

    // 2. ConfigManager — load config
    const configManager = ConfigManager.getInstance()

    // 3. AppMenuService — macOS native menu (before window creation)
    AppMenuService.getInstance().init()

    // 4. ThemeService — apply initial theme
    ThemeService.getInstance()

    // 5. WindowService — create main window with state persistence
    const windowService = WindowService.getInstance()
    const mainWindow = windowService.createMainWindow()

    // Set up window extras
    setupWebContentsHandlers(mainWindow)
    setupMainWindowMonitor(mainWindow)
    setupWebRequestHeaders(mainWindow)

    // Restore saved zoom factor
    mainWindow.webContents.on('did-finish-load', () => {
      const savedZoom = configManager.get('zoomFactor')
      if (savedZoom && savedZoom !== 1.0) {
        mainWindow.webContents.setZoomFactor(savedZoom)
      }
    })

    // 6. Register IPC handlers
    registerIpc()

    // 7. TrayService — create system tray (if enabled)
    if (configManager.isTrayEnabled()) {
      TrayService.getInstance().createTray()
    }

    // 8. ShortcutService — register global shortcuts
    const shortcutService = ShortcutService.getInstance()
    shortcutService.registerShortcuts()

    // Focus/blur shortcut handling
    mainWindow.on('focus', () => shortcutService.handleAppFocus())
    mainWindow.on('blur', () => shortcutService.handleAppBlur())

    // 9. PowerMonitorService — register shutdown handlers
    PowerMonitorService.getInstance().init()

    // 10. ProtocolClient — set up protocol URL handling
    protocolClient.init()

    // macOS dock click
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        windowService.createMainWindow()
      } else {
        windowService.showMainWindow()
      }
    })
  })

  // Before quit — save data
  app.on('before-quit', (event) => {
    if (isStopQuitApp()) {
      event.preventDefault()
      return
    }

    const windowService = WindowService.getInstance()
    windowService.setForceQuit(true)

    const mainWindow = windowService.getMainWindow()
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('app:save-data')
    }
  })

  app.on('will-quit', () => {
    ShortcutService.getInstance().unregisterAllShortcuts()
  })

  app.on('window-all-closed', () => {
    if (!isMac) {
      app.quit()
    }
  })
}

// ─── Window Extras ───────────────────────────────────────────────

function setupWebContentsHandlers(win: BrowserWindow): void {
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://') && !url.startsWith(process.env.ELECTRON_RENDERER_URL || '')) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })
}

function setupMainWindowMonitor(win: BrowserWindow): void {
  win.webContents.on('render-process-gone', (_event, details) => {
    const now = Date.now()
    const ONE_MINUTE = 60_000

    if (details.reason !== 'clean-exit' && now - lastCrashTime > ONE_MINUTE) {
      lastCrashTime = now
      try {
        win.webContents.reload()
      } catch {
        // Window may be destroyed
      }
    }
  })
}

function setupWebRequestHeaders(win: BrowserWindow): void {
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders }
    const headersToRemove = [
      'x-frame-options',
      'X-Frame-Options',
      'content-security-policy',
      'Content-Security-Policy',
    ]
    for (const header of headersToRemove) {
      delete responseHeaders[header]
    }
    callback({ responseHeaders })
  })
}
