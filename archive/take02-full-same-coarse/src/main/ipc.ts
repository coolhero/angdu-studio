import { appService } from '@main/services/AppService'
import { appUpdater } from '@main/services/AppUpdater'
import { configManager } from '@main/services/ConfigManager'
import type { SelectOptions } from '@main/services/FileStorage'
import * as fileStorage from '@main/services/FileStorage'
import { notificationService } from '@main/services/NotificationService'
import { proxyManager } from '@main/services/ProxyManager'
import { shortcutService } from '@main/services/ShortcutService'
import { themeService } from '@main/services/ThemeService'
import { windowService } from '@main/services/WindowService'
import { IpcChannel } from '@shared/IpcChannel'
import type { ProxyConfig, Shortcut, ThemeMode } from '@shared/types'
import { app, type BrowserWindow, ipcMain, shell } from 'electron'

export function registerIpc(mainWindow: BrowserWindow, _app: typeof app): void {
  // File Operations (registered in US2 - T044)
  ipcMain.handle(IpcChannel.File_Select, (_event, options: SelectOptions) => {
    return fileStorage.select(options)
  })

  ipcMain.handle(IpcChannel.File_Upload, (_event, filePath: string) => {
    return fileStorage.upload(filePath)
  })

  ipcMain.handle(IpcChannel.File_Download, (_event, id: string, ext: string, targetPath?: string) => {
    return fileStorage.download(id, ext, targetPath)
  })

  ipcMain.handle(IpcChannel.File_Read, (_event, id: string, ext: string) => {
    return fileStorage.read(id, ext)
  })

  ipcMain.handle(IpcChannel.File_Delete, (_event, id: string, ext: string) => {
    return fileStorage.deleteFile(id, ext)
  })

  ipcMain.handle(IpcChannel.File_Open, (_event, id: string, ext: string) => {
    return fileStorage.open(id, ext)
  })

  ipcMain.handle(IpcChannel.File_GetPath, (_event, id: string, ext: string) => {
    return fileStorage.getPath(id, ext)
  })

  // App Management (registered in US1 - T030)
  ipcMain.handle(IpcChannel.App_GetInfo, () => {
    return appService.getInfo()
  })

  ipcMain.handle(IpcChannel.App_Quit, () => {
    appService.quit()
  })

  ipcMain.handle(IpcChannel.App_Relaunch, () => {
    appService.relaunch()
  })

  ipcMain.handle(IpcChannel.App_GetLocale, () => {
    return appService.getLocale()
  })

  ipcMain.handle(IpcChannel.App_SetLocale, (_event, locale: string) => {
    appService.setLocale(locale)
  })

  ipcMain.handle(IpcChannel.App_GetDataPath, () => {
    return appService.getDataPath()
  })

  // Window Management (registered in US1 - T030)
  ipcMain.handle(IpcChannel.Window_Show, () => {
    mainWindow.show()
    mainWindow.focus()
  })

  ipcMain.handle(IpcChannel.Window_Hide, () => {
    mainWindow.hide()
  })

  ipcMain.handle(IpcChannel.Window_Minimize, () => {
    mainWindow.minimize()
  })

  ipcMain.handle(IpcChannel.Window_Maximize, () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })

  ipcMain.handle(IpcChannel.Window_Close, () => {
    mainWindow.close()
  })

  ipcMain.handle(IpcChannel.Window_SetSize, (_event, width: number, height: number) => {
    mainWindow.setSize(width, height)
  })

  // Config (registered in US4 - T049)
  ipcMain.handle(IpcChannel.Config_Get, (_event, key: string) => {
    return configManager.get(key)
  })

  ipcMain.handle(IpcChannel.Config_Set, (_event, key: string, value: unknown) => {
    configManager.set(key, value)
  })

  // Theme (registered in US3 - T058)
  ipcMain.handle(IpcChannel.App_GetTheme, () => {
    return themeService.getTheme()
  })

  ipcMain.handle(IpcChannel.App_SetTheme, (_event, mode: ThemeMode) => {
    themeService.setTheme(mode)
  })

  // Auto-Update (registered in US6 - T070)
  ipcMain.handle(IpcChannel.App_CheckUpdate, () => {
    return appUpdater.checkForUpdates()
  })

  ipcMain.handle(IpcChannel.App_InstallUpdate, () => {
    appUpdater.installUpdate()
  })

  // Shortcuts (registered in US7 - T077)
  ipcMain.handle(IpcChannel.Shortcuts_Update, (_event, shortcuts: Shortcut[]) => {
    shortcutService.update(shortcuts)
  })

  // Proxy (registered in US8 - T082)
  ipcMain.handle(IpcChannel.App_GetProxy, () => {
    return proxyManager.getProxy()
  })

  ipcMain.handle(IpcChannel.App_SetProxy, (_event, config: ProxyConfig) => {
    return proxyManager.setProxy(config)
  })

  // Multi-Window (registered in US9 - T087)
  ipcMain.handle(IpcChannel.Window_OpenMini, () => {
    windowService.openMini()
  })

  ipcMain.handle(IpcChannel.Window_OpenSelection, () => {
    windowService.openSelection()
  })

  ipcMain.handle(IpcChannel.Window_FullScreen, () => {
    if (mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(false)
    } else {
      mainWindow.setFullScreen(true)
    }
  })

  ipcMain.handle(IpcChannel.Window_IsFullScreen, () => {
    return mainWindow.isFullScreen()
  })

  // Data Path Management (registered in US10 - T094)
  ipcMain.handle(IpcChannel.App_SetDataPath, (_event, newPath: string) => {
    return appService.setDataPath(newPath)
  })

  ipcMain.handle(IpcChannel.System_IsPortable, () => {
    return appService.isPortable()
  })

  // Notification (registered in Phase 13 - T097)
  ipcMain.handle(IpcChannel.Notification_Show, (_event, options: { title: string; body: string; silent?: boolean }) => {
    notificationService.show(options)
  })

  // System (registered in Phase 13 - T098)
  ipcMain.handle(IpcChannel.System_OpenExternal, (_event, url: string) => {
    return shell.openExternal(url)
  })

  ipcMain.handle(IpcChannel.System_OpenPath, (_event, path: string) => {
    return shell.openPath(path)
  })

  ipcMain.handle(IpcChannel.System_GetMemoryUsage, () => {
    return process.memoryUsage()
  })

  ipcMain.handle(IpcChannel.System_GetPlatform, () => {
    return process.platform
  })

  ipcMain.handle(IpcChannel.System_GetArch, () => {
    return process.arch
  })

  ipcMain.handle(IpcChannel.System_GetLogPath, () => {
    return app.getPath('logs')
  })
}
