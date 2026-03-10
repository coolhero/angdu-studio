import { BrowserWindow, ipcMain, app, shell } from 'electron'
import { IpcChannel } from '@shared/ipc-channels'
import type { AppInfo, PlatformInfo, AppNotification, ShortcutBinding } from '@shared/types'
import { ThemeMode } from '@shared/types'
import { configManager } from './services/ConfigManager'
import { themeService } from './services/ThemeService'
import { proxyManager } from './services/ProxyManager'
import { miniWindowService } from './services/MiniWindowService'
import { trayService } from './services/TrayService'
import { updateService } from './services/UpdateService'
import { shortcutService } from './services/ShortcutService'
import { notificationService } from './services/NotificationService'
import { registerFileIpc } from './ipc/file-handlers'
import { registerBackupIpc } from './ipc/backup-handlers'
import { registerMcpIpc } from './ipc/mcp-handlers'
import { setStopQuit } from './lifecycle'
import os from 'node:os'
import process from 'node:process'

const isMac = process.platform === 'darwin'
const isWin = process.platform === 'win32'
const isLinux = process.platform === 'linux'

export function registerIpc(mainWindow: BrowserWindow): void {
  // ── App Lifecycle ──
  ipcMain.handle(IpcChannel.App_Info, (): AppInfo => ({
    version: app.getVersion(),
    name: 'Angdu Studio',
    platform: process.platform,
    arch: process.arch,
    electronVersion: process.versions.electron,
    chromeVersion: process.versions.chrome,
    nodeVersion: process.versions.node,
    dataPath: app.getPath('userData'),
    isPackaged: app.isPackaged,
    locale: app.getLocale()
  }))

  ipcMain.handle(IpcChannel.App_GetVersion, () => app.getVersion())
  ipcMain.handle(IpcChannel.App_GetPlatform, () => process.platform)
  ipcMain.handle(IpcChannel.App_GetDataPath, () => app.getPath('userData'))

  ipcMain.handle(IpcChannel.App_Quit, () => app.quit())

  ipcMain.handle(IpcChannel.App_Reload, () => mainWindow.webContents.reload())

  ipcMain.handle(IpcChannel.App_Relaunch, (_, options?: { args?: string[]; execPath?: string }) => {
    app.relaunch(options)
    app.quit()
  })

  ipcMain.handle(IpcChannel.App_SetStopQuit, (_, stop: boolean, reason: string) => {
    setStopQuit(stop, reason)
  })

  // ── Window Management ──
  ipcMain.handle(IpcChannel.Window_Minimize, () => mainWindow.minimize())
  ipcMain.handle(IpcChannel.Window_Maximize, () => mainWindow.maximize())
  ipcMain.handle(IpcChannel.Window_Unmaximize, () => mainWindow.unmaximize())
  ipcMain.handle(IpcChannel.Window_Close, () => mainWindow.close())
  ipcMain.handle(IpcChannel.Window_IsMaximized, () => mainWindow.isMaximized())

  ipcMain.handle(IpcChannel.Window_SetFullScreen, (_, value: boolean) => {
    mainWindow.setFullScreen(value)
  })

  ipcMain.handle(IpcChannel.Window_IsFullScreen, () => mainWindow.isFullScreen())

  ipcMain.handle(IpcChannel.Window_SetMinimumSize, (_, width: number, height: number) => {
    mainWindow.setMinimumSize(width, height)
  })

  ipcMain.handle(IpcChannel.Window_ResetMinimumSize, () => {
    mainWindow.setMinimumSize(1080, 600)
  })

  ipcMain.handle(IpcChannel.Window_GetSize, () => mainWindow.getSize() as [number, number])

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send(IpcChannel.Window_MaximizedChanged, true)
  })

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send(IpcChannel.Window_MaximizedChanged, false)
  })

  // ── Config ──
  ipcMain.handle(IpcChannel.Config_Get, (_, key: string) => configManager.get(key))

  ipcMain.handle(IpcChannel.Config_Set, (_, key: string, value: unknown, notify?: boolean) => {
    configManager.set(key, value, notify)
  })

  // ── Theme ──
  ipcMain.handle(IpcChannel.Theme_Set, (_, theme: string) => {
    themeService.setTheme(theme as ThemeMode)
  })

  // ── Proxy ──
  ipcMain.handle(IpcChannel.Proxy_Set, async (_, url?: string, bypassRules?: string) => {
    const rules = bypassRules ? bypassRules.split(';').map((r) => r.trim()).filter(Boolean) : []
    await proxyManager.configureProxy({
      mode: url ? 'custom' : 'none',
      url,
      bypassRules: rules
    })
  })

  // ── Notifications ──
  ipcMain.handle(IpcChannel.Notification_Send, (_, notification: Omit<AppNotification, 'id' | 'createdAt'>) => {
    return notificationService.show(notification)
  })

  ipcMain.handle(IpcChannel.Notification_Dismiss, (_, id: string) => {
    notificationService.dismiss(id)
  })

  ipcMain.handle(IpcChannel.Notification_OnAction, (_, id: string, action: string) => {
    notificationService.handleAction(id, action)
  })

  // ── System ──
  ipcMain.handle(IpcChannel.System_OpenExternal, (_, url: string) => shell.openExternal(url))
  ipcMain.handle(IpcChannel.System_OpenPath, (_, path: string) => shell.openPath(path))

  ipcMain.handle(IpcChannel.System_GetPlatformInfo, (): PlatformInfo => ({
    platform: process.platform,
    arch: process.arch,
    isMac,
    isWindows: isWin,
    isLinux,
    osVersion: os.release()
  }))

  ipcMain.handle(IpcChannel.System_ToggleDevTools, () => mainWindow.webContents.toggleDevTools())

  // ── Mini Window ──
  ipcMain.handle(IpcChannel.MiniWindow_Show, () => miniWindowService.show())
  ipcMain.handle(IpcChannel.MiniWindow_Hide, () => miniWindowService.hide())
  ipcMain.handle(IpcChannel.MiniWindow_Close, () => miniWindowService.close())
  ipcMain.handle(IpcChannel.MiniWindow_Toggle, () => miniWindowService.toggle())
  ipcMain.handle(IpcChannel.MiniWindow_SetPin, (_, isPinned: boolean) => miniWindowService.setPin(isPinned))

  // ── Tray ──
  ipcMain.handle(IpcChannel.Tray_SetEnabled, (_, enabled: boolean) => {
    if (enabled) {
      trayService.create(mainWindow)
    } else {
      trayService.destroy()
    }
  })

  ipcMain.handle(IpcChannel.Tray_SetTrayOnClose, (_, enabled: boolean) => {
    configManager.set('trayOnClose', enabled)
  })

  // ── Auto-Update ──
  ipcMain.handle(IpcChannel.Update_Check, () => updateService.checkForUpdates())
  ipcMain.handle(IpcChannel.Update_Download, () => updateService.downloadUpdate())
  ipcMain.handle(IpcChannel.Update_Install, () => updateService.quitAndInstall())
  ipcMain.handle(IpcChannel.Update_SetChannel, (_, channel: string) => {
    updateService.setChannel(channel as 'latest' | 'rc' | 'beta')
  })

  // ── Shortcuts ──
  ipcMain.handle(IpcChannel.Shortcut_Update, (_, shortcuts: ShortcutBinding[]) => {
    shortcutService.update(shortcuts, mainWindow)
  })

  ipcMain.handle(IpcChannel.Shortcut_GetAll, () => shortcutService.getAll())

  // ── Protocol / Deep Links ──
  ipcMain.handle(IpcChannel.Protocol_HandleUrl, (_, url: string) => {
    // Forward to protocol service — handled internally
  })

  // ── Store Sync ──
  ipcMain.handle(IpcChannel.StoreSync_Subscribe, () => {})
  ipcMain.handle(IpcChannel.StoreSync_Unsubscribe, () => {})
  ipcMain.handle(IpcChannel.StoreSync_Pull, (_, key: string) => configManager.get(key))

  ipcMain.handle(IpcChannel.StoreSync_OnUpdate, (_, payload: { type: string; payload: unknown }) => {
    // Reverse direction: renderer → main state mutations
  })

  // ── Zoom ──
  ipcMain.handle(IpcChannel.Zoom_HandleFactor, (_, delta: number, reset?: boolean) => {
    if (reset) {
      mainWindow.webContents.setZoomFactor(1.0)
      configManager.set('zoomFactor', 1.0)
      return
    }
    const current = mainWindow.webContents.getZoomFactor()
    const newFactor = Math.min(3.0, Math.max(0.5, current + delta))
    mainWindow.webContents.setZoomFactor(newFactor)
    configManager.set('zoomFactor', newFactor)
  })

  // ── Crash Reporter ──
  ipcMain.handle(IpcChannel.Crash_MockRenderer, () => {
    if (!app.isPackaged) {
      mainWindow.webContents.forcefullyCrashRenderer()
    }
  })

  // ── F004: File & Backup IPC ──
  registerFileIpc()
  registerBackupIpc(mainWindow)

  // ── F006: MCP IPC ──
  registerMcpIpc()

  // Wire config change notifications to renderer via StoreSync
  const pushConfigToRenderer = (key: string) => {
    configManager.subscribe(key, (newValue) => {
      mainWindow.webContents.send(IpcChannel.StoreSync_Push, { key, value: newValue })
    })
  }

  pushConfigToRenderer('theme')
  pushConfigToRenderer('zoomFactor')
  pushConfigToRenderer('language')
  pushConfigToRenderer('tray')
  pushConfigToRenderer('trayOnClose')
}
