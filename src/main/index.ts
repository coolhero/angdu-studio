import { app, BrowserWindow, crashReporter } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import process from 'node:process'
import { registerIpc } from './ipc'
import { configManager } from './services/ConfigManager'
import { windowService } from './services/WindowService'
import { themeService } from './services/ThemeService'
import { proxyManager } from './services/ProxyManager'
import { trayService } from './services/TrayService'
import { miniWindowService } from './services/MiniWindowService'
import { updateService } from './services/UpdateService'
import { protocolService } from './services/ProtocolService'
import { shortcutService } from './services/ShortcutService'
import { appMenuService } from './services/AppMenuService'
import { MIN_WINDOW_WIDTH, MIN_WINDOW_HEIGHT } from '@shared/constants'
import { setStopQuit, getStopQuitReason, setIsQuitting, getIsQuitting } from './lifecycle'

const isMac = process.platform === 'darwin'
const isWin = process.platform === 'win32'
const isLinux = process.platform === 'linux'
const isDev = !app.isPackaged

// Enable local crash reports
crashReporter.start({
  companyName: 'AngduHQ',
  productName: 'AngduStudio',
  submitURL: '',
  uploadToServer: false
})

// Disable hardware acceleration if configured
if (configManager.getDisableHardwareAcceleration()) {
  app.disableHardwareAcceleration()
}

// Platform-specific flags
if (isWin) {
  app.commandLine.appendSwitch('wm-window-animations-disabled')
}

if (isLinux && process.env.XDG_SESSION_TYPE === 'wayland') {
  app.commandLine.appendSwitch('enable-features', 'GlobalShortcutsPortal')
}

if (isLinux) {
  app.commandLine.appendSwitch('class', 'AngduStudio')
  app.commandLine.appendSwitch('name', 'AngduStudio')
}

app.commandLine.appendSwitch(
  'enable-features',
  'DocumentPolicyIncludeJSCallStacksInCrashReports,EarlyEstablishGpuChannel,EstablishGpuChannelAsync'
)

// Initialize data directory
function initDataDir(): void {
  const userDataPath = app.getPath('userData')
  const dirs = ['crash-reports', 'logs', 'files']
  for (const dir of dirs) {
    const dirPath = join(userDataPath, dir)
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true })
    }
  }
}

// Crash reporter: write JSON crash reports
function setupCrashHandlers(): void {
  const crashDir = join(app.getPath('userData'), 'crash-reports')

  const writeCrashReport = (type: string, error: Error | string): void => {
    const report = {
      timestamp: new Date().toISOString(),
      type,
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch
    }
    const filename = `crash-${Date.now()}.json`
    try {
      writeFileSync(join(crashDir, filename), JSON.stringify(report, null, 2))
    } catch {
      // Can't write crash report — nothing to do
    }
  }

  process.on('uncaughtException', (error) => {
    writeCrashReport('uncaughtException', error)
    console.error('Uncaught exception:', error)
  })

  process.on('unhandledRejection', (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason))
    writeCrashReport('unhandledRejection', error)
    console.error('Unhandled rejection:', reason)
  })
}

// Graceful shutdown
function setupGracefulShutdown(): void {
  app.on('before-quit', (event) => {
    if (getStopQuitReason()) {
      event.preventDefault()
      return
    }
    setIsQuitting(true)
  })

  app.on('will-quit', async (event) => {
    event.preventDefault()

    const cleanupTimeout = setTimeout(() => {
      console.warn('Cleanup timeout (5s) — forcing quit')
      app.exit(0)
    }, 5000)

    try {
      // Cleanup order: shortcuts → tray → mini window → proxy → update
      shortcutService.unregisterAll()
      trayService.destroy()
      miniWindowService.close()
      proxyManager.stopSystemProxyPolling()
      await proxyManager.cleanup()
    } catch (error) {
      console.error('Cleanup error:', error)
    } finally {
      clearTimeout(cleanupTimeout)
      app.exit(0)
    }
  })
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const mainWindow = windowService.getMainWindow()
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(async () => {
    initDataDir()
    setupCrashHandlers()
    setupGracefulShutdown()

    // Create main window
    const mainWindow = windowService.createMainWindow()

    // Register IPC handlers
    registerIpc(mainWindow)

    // Initialize services
    appMenuService.init()
    themeService.init()
    await proxyManager.init()
    trayService.init(mainWindow)
    shortcutService.init(mainWindow)
    protocolService.init()
    updateService.init()

    // Apply saved zoom factor
    const zoomFactor = configManager.getZoomFactor()
    if (zoomFactor !== 1.0) {
      mainWindow.webContents.setZoomFactor(zoomFactor)
    }

    // Handle close-to-tray
    mainWindow.on('close', (event) => {
      if (!getIsQuitting() && configManager.getTrayOnClose() && trayService.isCreated()) {
        event.preventDefault()
        mainWindow.hide()
      }
    })

    // Handle renderer crash
    mainWindow.webContents.on('render-process-gone', (_event, details) => {
      const crashDir = join(app.getPath('userData'), 'crash-reports')
      const report = {
        timestamp: new Date().toISOString(),
        type: 'render-process-gone',
        reason: details.reason,
        exitCode: details.exitCode,
        version: app.getVersion(),
        platform: process.platform
      }
      try {
        writeFileSync(
          join(crashDir, `renderer-crash-${Date.now()}.json`),
          JSON.stringify(report, null, 2)
        )
      } catch {
        // Ignore write failures
      }
    })

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        const newWindow = windowService.createMainWindow()
        registerIpc(newWindow)
      } else {
        mainWindow.show()
      }
    })
  })
}

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
})
