import { IpcChannel } from '@shared/IpcChannel'
import type { ThemeMode } from '@shared/types'
import { BrowserWindow, nativeTheme } from 'electron'
import { configManager } from './ConfigManager'
import { loggerService } from './LoggerService'

const logger = loggerService.withContext('ThemeService')

class ThemeService {
  private theme: ThemeMode = 'system'

  constructor() {
    this.theme = configManager.getTheme()
    nativeTheme.themeSource = this.theme
    nativeTheme.on('updated', this.handleThemeUpdate.bind(this))
    logger.info(`ThemeService initialized with theme: ${this.theme}`)
  }

  private handleThemeUpdate(): void {
    const isDark = nativeTheme.shouldUseDarkColors
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send(IpcChannel.ThemeUpdated, isDark ? 'dark' : 'light')
    })
  }

  getTheme(): ThemeMode {
    return this.theme
  }

  setTheme(mode: ThemeMode): void {
    this.theme = mode
    nativeTheme.themeSource = mode
    configManager.setTheme(mode)
    logger.info(`Theme set to: ${mode}`)
  }

  getEffectiveTheme(): 'light' | 'dark' {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
  }

  init(webContents: Electron.WebContents): void {
    const effectiveTheme = this.getEffectiveTheme()
    webContents.send(IpcChannel.ThemeUpdated, effectiveTheme)
    logger.info(`ThemeService initialized for webContents with effective theme: ${effectiveTheme}`)
  }
}

export const themeService = new ThemeService()
export default themeService
