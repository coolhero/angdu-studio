import { ipcMain, app, session, shell, BrowserWindow, screen } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import { configManager } from '../config'
import { ConfigKeys, type ProxyConfig } from '@shared/types'
import { themeService } from '../services/ThemeService'
import { withContext } from '../logger'
import { logsDir } from '../bootstrap'
import os from 'os'

const log = withContext('ipc:app')

export function registerAppHandlers(): void {
  ipcMain.handle(IpcChannel.App_Info, () => ({
    name: app.getName(),
    version: app.getVersion(),
    isPackaged: app.isPackaged,
    platform: process.platform,
    arch: process.arch,
    paths: {
      userData: app.getPath('userData'),
      temp: app.getPath('temp'),
      home: app.getPath('home'),
      logs: logsDir
    }
  }))

  ipcMain.handle(IpcChannel.App_Reload, (event) => {
    event.sender.reload()
  })

  ipcMain.handle(IpcChannel.App_Quit, () => {
    app.quit()
  })

  ipcMain.handle(IpcChannel.App_SetTheme, (_, mode: string) => {
    themeService.setTheme(mode)
  })

  ipcMain.handle(IpcChannel.App_GetTheme, () => {
    return themeService.getTheme()
  })

  ipcMain.handle(IpcChannel.App_SetLanguage, (_, locale: string) => {
    configManager.set(ConfigKeys.Language, locale)
  })

  ipcMain.handle(IpcChannel.App_GetLocale, () => {
    return app.getLocale()
  })

  ipcMain.handle(IpcChannel.App_SetProxy, async (_, config: ProxyConfig) => {
    configManager.set(ConfigKeys.Proxy, config)
    const proxyRules =
      config.mode === 'direct'
        ? 'direct://'
        : config.mode === 'fixed_servers'
          ? config.url || ''
          : ''
    await session.defaultSession.setProxy({
      proxyRules,
      proxyBypassRules: config.bypass || ''
    })
  })

  ipcMain.handle(IpcChannel.App_GetProxy, () => {
    return configManager.get(ConfigKeys.Proxy)
  })

  ipcMain.handle(IpcChannel.App_SetZoomFactor, (event, factor: number) => {
    configManager.set(ConfigKeys.ZoomFactor, factor)
    event.sender.setZoomFactor(factor)
  })

  ipcMain.handle(IpcChannel.App_GetZoomFactor, (event) => {
    return event.sender.getZoomFactor()
  })

  ipcMain.handle(IpcChannel.App_GetPath, (_, pathName: string) => {
    return app.getPath(pathName as Parameters<typeof app.getPath>[0])
  })

  ipcMain.handle(IpcChannel.App_GetSystemInfo, () => ({
    platform: process.platform,
    arch: process.arch,
    hostname: os.hostname(),
    cpus: os.cpus().map((cpu) => ({
      model: cpu.model,
      speed: cpu.speed,
      cores: os.cpus().length
    })),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem()
  }))

  ipcMain.handle(IpcChannel.App_GetCacheSize, async () => {
    return session.defaultSession.getCacheSize()
  })

  ipcMain.handle(IpcChannel.App_ClearCache, async () => {
    await session.defaultSession.clearCache()
  })

  ipcMain.handle(IpcChannel.App_SetLaunchOnBoot, (_, enabled: boolean) => {
    app.setLoginItemSettings({ openAtLogin: enabled })
  })

  ipcMain.handle(IpcChannel.App_GetLoginItem, () => {
    return app.getLoginItemSettings()
  })

  ipcMain.handle(IpcChannel.App_SetAlwaysOnTop, (event, flag: boolean) => {
    BrowserWindow.fromWebContents(event.sender)?.setAlwaysOnTop(flag)
  })

  ipcMain.handle(IpcChannel.App_ToggleFullScreen, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.setFullScreen(!win.isFullScreen())
  })

  ipcMain.handle(IpcChannel.App_IsFullScreen, (event) => {
    return BrowserWindow.fromWebContents(event.sender)?.isFullScreen() ?? false
  })

  ipcMain.handle(IpcChannel.App_SetBadgeCount, (_, count: number) => {
    app.setBadgeCount(count)
  })

  ipcMain.handle(IpcChannel.App_ShowDock, () => {
    if (process.platform === 'darwin') app.dock?.show()
  })

  ipcMain.handle(IpcChannel.App_HideDock, () => {
    if (process.platform === 'darwin') app.dock?.hide()
  })

  ipcMain.handle(IpcChannel.App_SetProgressBar, (event, progress: number) => {
    BrowserWindow.fromWebContents(event.sender)?.setProgressBar(progress)
  })

  ipcMain.handle(IpcChannel.App_BounceDock, (_, type: 'critical' | 'informational') => {
    if (process.platform === 'darwin') app.dock?.bounce(type)
  })

  ipcMain.handle(IpcChannel.App_GetDisplays, () => {
    return screen.getAllDisplays().map((d) => ({
      id: d.id,
      bounds: d.bounds,
      workArea: d.workArea,
      scaleFactor: d.scaleFactor,
      rotation: d.rotation
    }))
  })

  ipcMain.handle(IpcChannel.App_IsFocused, (event) => {
    return BrowserWindow.fromWebContents(event.sender)?.isFocused() ?? false
  })

  ipcMain.handle(IpcChannel.App_Focus, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })

  ipcMain.handle(IpcChannel.App_MinimizeToTray, (event) => {
    BrowserWindow.fromWebContents(event.sender)?.hide()
  })

  ipcMain.handle(IpcChannel.App_RestoreFromTray, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      win.show()
      win.focus()
    }
  })

  ipcMain.handle(IpcChannel.App_GetArgv, () => {
    return process.argv
  })

  ipcMain.handle(IpcChannel.App_Log, (_, { level, module, message }: { level: string; module: string; message: string }) => {
    const contextLog = withContext(`renderer:${module}`)
    if (level === 'error') contextLog.error(message)
    else if (level === 'warn') contextLog.warn(message)
    else if (level === 'debug') contextLog.debug(message)
    else contextLog.info(message)
  })

  ipcMain.handle(IpcChannel.App_OpenLogFolder, () => {
    shell.openPath(logsDir)
  })

  ipcMain.handle(IpcChannel.App_DisableHardwareAcceleration, (_, disabled: boolean) => {
    configManager.set(ConfigKeys.DisableHardwareAcceleration, disabled)
  })

  log.debug('App IPC handlers registered')
}
