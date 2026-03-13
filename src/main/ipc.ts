import { ipcMain, app, shell } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import type { ThemeMode } from '@shared/types'
import { ConfigManager } from './services/ConfigManager'
import { WindowService } from './services/WindowService'
import { ThemeService } from './services/ThemeService'
import { AppUpdater } from './services/AppUpdater'

let stopQuitApp = false

export function registerIpc(): void {
  const configManager = ConfigManager.getInstance()
  const windowService = WindowService.getInstance()

  // ─── App Info ────────────────────────────────────────────────

  ipcMain.handle(IpcChannel.App_Info, () => {
    try {
      return {
        version: app.getVersion(),
        arch: process.arch,
        platform: process.platform,
        dataPath: app.getPath('userData'),
        isPackaged: app.isPackaged,
      }
    } catch (err) {
      return { error: String(err) }
    }
  })

  // ─── Window Controls ────────────────────────────────────────

  ipcMain.handle(IpcChannel.Window_Minimize, () => {
    try {
      const win = windowService.checkMainWindow()
      win.minimize()
    } catch (err) {
      return { error: String(err) }
    }
  })

  ipcMain.handle(IpcChannel.Window_Maximize, () => {
    try {
      const win = windowService.checkMainWindow()
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    } catch (err) {
      return { error: String(err) }
    }
  })

  ipcMain.handle(IpcChannel.Window_Close, () => {
    try {
      const win = windowService.checkMainWindow()
      win.close()
    } catch (err) {
      return { error: String(err) }
    }
  })

  ipcMain.handle(IpcChannel.Window_IsMaximized, () => {
    try {
      const win = windowService.getMainWindow()
      if (!win || win.isDestroyed()) return false
      return win.isMaximized()
    } catch {
      return false
    }
  })

  ipcMain.handle(IpcChannel.Window_SetFullScreen, (_event, enabled: boolean) => {
    try {
      const win = windowService.checkMainWindow()
      win.setFullScreen(enabled)
    } catch (err) {
      return { error: String(err) }
    }
  })

  ipcMain.handle(IpcChannel.Window_IsFullScreen, () => {
    try {
      const win = windowService.getMainWindow()
      if (!win || win.isDestroyed()) return false
      return win.isFullScreen()
    } catch {
      return false
    }
  })

  // ─── App Lifecycle ──────────────────────────────────────────

  ipcMain.handle(IpcChannel.App_Reload, () => {
    try {
      const win = windowService.checkMainWindow()
      win.webContents.reload()
    } catch (err) {
      return { error: String(err) }
    }
  })

  ipcMain.handle(IpcChannel.App_Quit, () => {
    try {
      windowService.setForceQuit(true)
      app.quit()
    } catch (err) {
      return { error: String(err) }
    }
  })

  ipcMain.handle(IpcChannel.App_ClearCache, async () => {
    try {
      const win = windowService.getMainWindow()
      if (win && !win.isDestroyed()) {
        await win.webContents.session.clearCache()
        await win.webContents.session.clearStorageData()
      }
    } catch (err) {
      return { error: String(err) }
    }
  })

  // ─── Open External ─────────────────────────────────────────

  ipcMain.handle(IpcChannel.Open_Website, (_event, url: string) => {
    try {
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        shell.openExternal(url)
      }
    } catch (err) {
      return { error: String(err) }
    }
  })

  // ─── Proxy ──────────────────────────────────────────────────

  ipcMain.handle(
    IpcChannel.App_SetProxy,
    async (_event, config: { mode: string; url?: string; bypassRules?: string }) => {
      try {
        const win = windowService.getMainWindow()
        if (!win || win.isDestroyed()) return { error: 'Main window is not available' }

        const session = win.webContents.session
        if (config.mode === 'direct') {
          await session.setProxy({ mode: 'direct' })
        } else if (config.mode === 'custom' && config.url) {
          await session.setProxy({
            proxyRules: config.url,
            proxyBypassRules: config.bypassRules || '',
          })
        } else {
          await session.setProxy({ mode: 'system' })
        }
        configManager.set('proxyMode', config.mode as any)
        if (config.url !== undefined) configManager.set('proxyUrl', config.url)
        if (config.bypassRules !== undefined) configManager.set('proxyBypassRules', config.bypassRules)
      } catch (err) {
        return { error: String(err) }
      }
    }
  )

  // ─── Theme ──────────────────────────────────────────────────

  ipcMain.handle(IpcChannel.App_SetTheme, (_event, theme: string) => {
    try {
      const themeService = ThemeService.getInstance()
      themeService.setTheme(theme as ThemeMode)
    } catch (err) {
      return { error: String(err) }
    }
  })

  // ─── Auto-Update ────────────────────────────────────────────

  ipcMain.handle(IpcChannel.App_CheckForUpdates, async () => {
    try {
      const updater = AppUpdater.getInstance()
      return await updater.checkForUpdates()
    } catch (err) {
      return { currentVersion: app.getVersion(), updateInfo: null, error: String(err) }
    }
  })

  ipcMain.handle(IpcChannel.App_DownloadUpdate, async () => {
    try {
      const updater = AppUpdater.getInstance()
      await updater.downloadUpdate()
    } catch (err) {
      return { error: String(err) }
    }
  })

  ipcMain.handle(IpcChannel.App_CancelDownload, () => {
    try {
      const updater = AppUpdater.getInstance()
      updater.cancelDownload()
    } catch (err) {
      return { error: String(err) }
    }
  })

  ipcMain.handle(IpcChannel.App_QuitAndInstall, () => {
    try {
      const updater = AppUpdater.getInstance()
      updater.quitAndInstall()
    } catch (err) {
      return { error: String(err) }
    }
  })

  // ─── Zoom ───────────────────────────────────────────────────

  ipcMain.handle(IpcChannel.App_HandleZoomFactor, (_event, action: string) => {
    try {
      const win = windowService.checkMainWindow()
      let factor = win.webContents.getZoomFactor()
      if (action === 'in') factor = Math.min(factor + 0.1, 3.0)
      else if (action === 'out') factor = Math.max(factor - 0.1, 0.5)
      else if (action === 'reset') factor = 1.0
      win.webContents.setZoomFactor(factor)
      configManager.set('zoomFactor', factor)
      return { zoomFactor: factor }
    } catch (err) {
      return { error: String(err) }
    }
  })

  // ─── System ─────────────────────────────────────────────────

  ipcMain.handle(IpcChannel.App_GetSystemFonts, async () => {
    return []
  })

  ipcMain.handle(IpcChannel.App_GetIpCountry, async () => {
    return 'unknown'
  })

  ipcMain.handle(IpcChannel.App_MacIsProcessTrusted, () => {
    try {
      if (process.platform === 'darwin') {
        const { systemPreferences } = require('electron')
        return systemPreferences.isTrustedAccessibilityClient(false)
      }
      return true
    } catch (err) {
      return { error: String(err) }
    }
  })

  ipcMain.handle(IpcChannel.App_MacRequestProcessTrust, () => {
    try {
      if (process.platform === 'darwin') {
        const { systemPreferences } = require('electron')
        systemPreferences.isTrustedAccessibilityClient(true)
      }
    } catch (err) {
      return { error: String(err) }
    }
  })

  // ─── Prevent Quit ───────────────────────────────────────────

  ipcMain.handle(IpcChannel.App_SetStopQuitApp, (_event, stop: boolean) => {
    try {
      stopQuitApp = stop
    } catch (err) {
      return { error: String(err) }
    }
  })

  // ─── Relaunch ───────────────────────────────────────────────

  ipcMain.handle(IpcChannel.App_RelaunchApp, () => {
    try {
      app.relaunch()
      app.exit(0)
    } catch (err) {
      return { error: String(err) }
    }
  })

  // ─── Mini Window ────────────────────────────────────────────

  ipcMain.handle(IpcChannel.MiniWindow_Show, () => {
    try {
      windowService.showMiniWindow()
    } catch (err) {
      return { error: String(err) }
    }
  })

  ipcMain.handle(IpcChannel.MiniWindow_Hide, () => {
    try {
      windowService.hideMiniWindow()
    } catch (err) {
      return { error: String(err) }
    }
  })

  ipcMain.handle(IpcChannel.MiniWindow_Toggle, () => {
    try {
      windowService.toggleMiniWindow()
    } catch (err) {
      return { error: String(err) }
    }
  })

  ipcMain.handle(IpcChannel.MiniWindow_Close, () => {
    try {
      windowService.closeMiniWindow()
    } catch (err) {
      return { error: String(err) }
    }
  })

  ipcMain.handle(IpcChannel.MiniWindow_SetPin, (_event, pinned: boolean) => {
    try {
      windowService.setPinMiniWindow(pinned)
    } catch (err) {
      return { error: String(err) }
    }
  })
}

export function isStopQuitApp(): boolean {
  return stopQuitApp
}
