import { nativeTheme, BrowserWindow } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import { ConfigManager } from './ConfigManager'
import type { ThemeMode, ResolvedTheme, ThemeState } from '@shared/types/theme'

export class ThemeService {
  private static instance: ThemeService
  private mode: ThemeMode

  private constructor() {
    const configManager = ConfigManager.getInstance()
    this.mode = configManager.get<ThemeMode>('theme', 'system')
    this.applyTheme()

    nativeTheme.on('updated', () => {
      if (this.mode === 'system') {
        this.broadcastThemeChange()
      }
    })
  }

  static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService()
    }
    return ThemeService.instance
  }

  setTheme(mode: ThemeMode): void {
    this.mode = mode
    const configManager = ConfigManager.getInstance()
    configManager.set('theme', mode)
    this.applyTheme()
    this.broadcastThemeChange()
  }

  getThemeState(): ThemeState {
    return {
      mode: this.mode,
      resolved: this.resolveTheme()
    }
  }

  private resolveTheme(): ResolvedTheme {
    if (this.mode === 'system') {
      return nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
    }
    return this.mode
  }

  private applyTheme(): void {
    nativeTheme.themeSource = this.mode === 'system' ? 'system' : this.mode
  }

  private broadcastThemeChange(): void {
    const state = this.getThemeState()
    for (const win of BrowserWindow.getAllWindows()) {
      win.webContents.send(IpcChannel.ThemeChanged, state)
    }
  }
}
