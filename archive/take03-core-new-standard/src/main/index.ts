import { app, BrowserWindow } from 'electron'
import { bootstrap } from './bootstrap'
import { WindowService } from './services/WindowService'
import { ConfigManager } from './services/ConfigManager'
import { registerAppHandlers } from './handlers/app'
import { registerWindowHandlers } from './handlers/window'
import { registerConfigHandlers } from './handlers/config'
import { ThemeService } from './services/ThemeService'
import { IpcChannel } from '@shared/IpcChannel'
import { registerHandler } from './ipc'
import { ConfigKey } from '@shared/types'
import type { ThemeMode } from '@shared/types'

// Bootstrap must run before app.whenReady
bootstrap()

// Hardware acceleration toggle (FR-022) — must be set before app.whenReady
const configManager = new ConfigManager()
if (configManager.get(ConfigKey.DisableHardwareAcceleration)) {
  app.disableHardwareAcceleration()
}

// Proxy configuration (FR-021)
const proxyConfig = configManager.get(ConfigKey.Proxy)
if (proxyConfig && proxyConfig.mode === 'fixed_servers' && proxyConfig.url) {
  app.commandLine.appendSwitch('proxy-server', proxyConfig.url)
  if (proxyConfig.bypassRules) {
    app.commandLine.appendSwitch('proxy-bypass-list', proxyConfig.bypassRules)
  }
} else if (proxyConfig && proxyConfig.mode === 'direct') {
  app.commandLine.appendSwitch('no-proxy-server')
}

// Single-instance lock (FR-005)
const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
  app.quit()
} else {
  const windowService = new WindowService()
  const themeService = new ThemeService()

  app.whenReady().then(() => {
    // Register IPC handlers before creating windows
    registerAppHandlers()
    registerWindowHandlers(windowService)
    registerConfigHandlers(configManager)

    // Theme IPC handler (T035)
    registerHandler(IpcChannel.App_SetTheme, (_event, mode: unknown) => {
      themeService.setTheme(mode as ThemeMode)
      configManager.setAndNotify(ConfigKey.Theme, mode as ThemeMode)
    })

    // Proxy IPC handler — App_SetProxy (T030)
    registerHandler(IpcChannel.App_SetProxy, (_event, proxy: unknown) => {
      configManager.setAndNotify(ConfigKey.Proxy, proxy as never)
    })

    // Hardware acceleration IPC handler (T031)
    registerHandler(
      IpcChannel.App_SetDisableHardwareAcceleration,
      (_event, disabled: unknown) => {
        configManager.setAndNotify(ConfigKey.DisableHardwareAcceleration, disabled as boolean)
      }
    )

    // Zoom factor handler
    registerHandler(
      IpcChannel.App_HandleZoomFactor,
      (event, factor: unknown) => {
        const zoomFactor = factor as number
        configManager.setAndNotify(ConfigKey.ZoomFactor, zoomFactor)
        event.sender.setZoomFactor(zoomFactor)
      }
    )

    // Apply saved theme
    const savedTheme = configManager.get(ConfigKey.Theme)
    if (savedTheme) {
      themeService.setTheme(savedTheme)
    }

    // Create main window
    windowService.createMainWindow()

    // Apply zoom factor
    const zoomFactor = configManager.get(ConfigKey.ZoomFactor)
    if (zoomFactor && zoomFactor !== 1.0) {
      const mainWin = windowService.getMainWindow()
      if (mainWin) {
        mainWin.webContents.setZoomFactor(zoomFactor)
      }
    }
  })

  // Second instance — show existing window (FR-005)
  app.on('second-instance', (_event, _commandLine, _workingDirectory) => {
    windowService.showAndFocus()
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      windowService.createMainWindow()
    }
  })
}
