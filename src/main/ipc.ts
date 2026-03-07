import { ipcMain, app, shell, clipboard, screen, nativeTheme, BrowserWindow } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import { AppService } from './services/AppService'
import { ConfigManager } from './services/ConfigManager'
import { WindowService } from './services/WindowService'
import { VersionService } from './services/VersionService'
import { ThemeService } from './services/ThemeService'
import { ProxyManager } from './services/ProxyManager'
import os from 'os'

export function registerIpcHandlers(): void {
  const appService = AppService.getInstance()
  const configManager = ConfigManager.getInstance()
  const windowService = WindowService.getInstance()
  const versionService = VersionService.getInstance()

  // ── app:* ──────────────────────────────────────────
  ipcMain.handle(IpcChannel.AppInfo, () => versionService.getAppInfo())

  ipcMain.handle(IpcChannel.AppGetPath, (_e, { name }: { name: string }) =>
    app.getPath(name as Parameters<typeof app.getPath>[0])
  )

  ipcMain.handle(IpcChannel.AppGetDataPath, () => appService.getDataPath())

  ipcMain.handle(IpcChannel.AppSetDataPath, (_e, { path }: { path: string }) =>
    appService.setDataPath(path)
  )

  ipcMain.handle(IpcChannel.AppGetLanguage, () =>
    configManager.get('language', '')
  )

  ipcMain.handle(IpcChannel.AppSetLanguage, (_e, { language }: { language: string }) => {
    configManager.set('language', language)
  })

  ipcMain.handle(IpcChannel.AppSetLaunchOnBoot, async (_e, { enabled }: { enabled: boolean }) => {
    await appService.setLaunchOnBoot(enabled)
    configManager.set('launchOnBoot', enabled)
  })

  ipcMain.handle(IpcChannel.AppGetLaunchOnBoot, () =>
    configManager.get('launchOnBoot', false)
  )

  ipcMain.handle(IpcChannel.AppSetProxy, (_e, args: { mode: string; url?: string }) => {
    const proxyManager = ProxyManager.getInstance()
    proxyManager.setProxy(args.mode as 'system' | 'fixed' | 'direct', args.url)
    configManager.set('proxyMode', args.mode)
    if (args.url !== undefined) configManager.set('proxyUrl', args.url)
  })

  ipcMain.handle(IpcChannel.AppGetProxy, () => ({
    mode: configManager.get('proxyMode', 'system'),
    url: configManager.get('proxyUrl', '')
  }))

  ipcMain.handle(IpcChannel.AppQuit, () => app.quit())

  ipcMain.handle(IpcChannel.AppRelaunch, () => {
    app.relaunch()
    app.quit()
  })

  // ── config:* ───────────────────────────────────────
  ipcMain.handle(IpcChannel.ConfigGet, (_e, { key }: { key: string }) =>
    configManager.get(key)
  )

  ipcMain.handle(IpcChannel.ConfigSet, (_e, { key, value }: { key: string; value: unknown }) => {
    const oldValue = configManager.get(key)
    configManager.set(key, value)
    // Broadcast to all renderer windows
    for (const win of BrowserWindow.getAllWindows()) {
      win.webContents.send(IpcChannel.ConfigChanged, { key, value, oldValue })
    }
  })

  ipcMain.handle(IpcChannel.ConfigGetAll, () => configManager.getAll())

  ipcMain.handle(IpcChannel.ConfigReset, (_e, { key }: { key: string }) => {
    configManager.reset(key)
  })

  ipcMain.handle(IpcChannel.ConfigResetAll, () => {
    configManager.resetAll()
  })

  // ── window:* ───────────────────────────────────────
  ipcMain.handle(IpcChannel.WindowShow, () => windowService.showMainWindow())
  ipcMain.handle(IpcChannel.WindowHide, () => windowService.hideMainWindow())
  ipcMain.handle(IpcChannel.WindowMinimize, () => windowService.minimizeMainWindow())
  ipcMain.handle(IpcChannel.WindowMaximize, () => windowService.toggleMaximize())
  ipcMain.handle(IpcChannel.WindowClose, () => windowService.closeMainWindow())

  ipcMain.handle(IpcChannel.WindowSetSize, (_e, { width, height }: { width: number; height: number }) =>
    windowService.setSize(width, height)
  )

  ipcMain.handle(IpcChannel.WindowSetPosition, (_e, { x, y }: { x: number; y: number }) =>
    windowService.setPosition(x, y)
  )

  ipcMain.handle(IpcChannel.WindowGetState, () => windowService.getWindowState())

  ipcMain.handle(IpcChannel.WindowSetAlwaysOnTop, (_e, { enabled }: { enabled: boolean }) =>
    windowService.setAlwaysOnTop(enabled)
  )

  ipcMain.handle(IpcChannel.WindowSetFullscreen, (_e, { enabled }: { enabled: boolean }) =>
    windowService.setFullscreen(enabled)
  )

  // ── system:* ───────────────────────────────────────
  ipcMain.handle(IpcChannel.SystemInfo, () => ({
    platform: process.platform,
    arch: process.arch,
    hostname: os.hostname(),
    cpus: os.cpus().length,
    memory: os.totalmem()
  }))

  ipcMain.handle(IpcChannel.SystemClipboardRead, () => clipboard.readText())

  ipcMain.handle(IpcChannel.SystemClipboardWrite, (_e, { text }: { text: string }) => {
    clipboard.writeText(text)
  })

  ipcMain.handle(IpcChannel.SystemGetScreens, () =>
    screen.getAllDisplays().map((d) => ({ id: d.id, bounds: d.bounds }))
  )

  ipcMain.handle(IpcChannel.SystemGetDeviceType, () => {
    const hasBattery = os.cpus().length <= 8
    return hasBattery ? 'laptop' : 'desktop'
  })

  // ── open:* ─────────────────────────────────────────
  ipcMain.handle(IpcChannel.OpenUrl, (_e, { url }: { url: string }) =>
    shell.openExternal(url)
  )

  ipcMain.handle(IpcChannel.OpenPath, (_e, { path }: { path: string }) =>
    shell.openPath(path)
  )

  // ── theme:* ────────────────────────────────────────
  ipcMain.handle(IpcChannel.ThemeGet, () => {
    const themeService = ThemeService.getInstance()
    return themeService.getThemeState()
  })

  ipcMain.handle(IpcChannel.ThemeSet, (_e, { mode }: { mode: string }) => {
    const themeService = ThemeService.getInstance()
    themeService.setTheme(mode as 'light' | 'dark' | 'system')
  })
}
