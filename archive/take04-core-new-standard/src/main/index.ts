// Side-effect imports — order matters (R1)
import './bootstrap'
import './config'

import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { configManager } from './config'
import { ConfigKeys } from '@shared/types'
import { withContext } from './logger'
import { createMainWindow, getMainWindow } from './window/MainWindow'
import { showMiniWindow } from './window/MiniWindow'
import { registerAllHandlers } from './ipc'
import { TrayService } from './services/TrayService'
import { join } from 'path'

const log = withContext('main')

// Pre-ready synchronous setup
if (configManager.get<boolean>(ConfigKeys.DisableHardwareAcceleration)) {
  app.disableHardwareAcceleration()
}

// Single-instance lock
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, _argv, _workingDir) => {
    const win = getMainWindow()
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })

  app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.cherrystudio')

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    registerAllHandlers()

    const mainWindow = createMainWindow()
    log.info('Main window created')

    // System tray
    if (configManager.get<boolean>(ConfigKeys.Tray)) {
      const trayService = new TrayService()
      const iconPath = join(__dirname, '../../src/resources/tray/iconTemplate.png')
      trayService.createTray(iconPath, {
        showMainWindow: () => {
          const win = getMainWindow()
          if (win) {
            win.show()
            win.focus()
          }
        },
        showMiniWindow
      })
    }

    // Crash recovery
    let lastCrashTime = 0
    mainWindow.webContents.on('render-process-gone', (_event, details) => {
      log.error(`Renderer process gone: ${details.reason}`)
      const now = Date.now()
      if (now - lastCrashTime > 60_000) {
        lastCrashTime = now
        log.info('Reloading renderer (>60s since last crash)')
        mainWindow.webContents.reload()
      } else {
        log.error('Crash loop detected (<60s), exiting')
        app.exit(1)
      }
    })

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
      } else {
        getMainWindow()?.show()
      }
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}
