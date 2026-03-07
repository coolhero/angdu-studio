import { nativeTheme, BrowserWindow } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import type { ThemeMode } from '@shared/types'

export class ThemeService {
  constructor() {
    // Listen for OS theme changes when in system mode
    nativeTheme.on('updated', () => {
      this.broadcastThemeState()
    })
  }

  setTheme(mode: ThemeMode): void {
    nativeTheme.themeSource = mode
    this.broadcastThemeChanged(mode)
  }

  getCurrentTheme(): string {
    return nativeTheme.themeSource
  }

  isDarkMode(): boolean {
    return nativeTheme.shouldUseDarkColors
  }

  private broadcastThemeChanged(mode: ThemeMode): void {
    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed()) {
        win.webContents.send(IpcChannel.App_ThemeChanged, mode)
      }
    }
  }

  private broadcastThemeState(): void {
    const mode = nativeTheme.themeSource as ThemeMode
    this.broadcastThemeChanged(mode)
  }
}
