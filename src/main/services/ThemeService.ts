import { BrowserWindow, nativeTheme } from 'electron'
import { ThemeMode } from '@shared/types'
import { IpcChannel } from '@shared/ipc-channels'
import { configManager, ConfigKeys } from './ConfigManager'
import { titleBarOverlayDark, titleBarOverlayLight } from '../config'

class ThemeService {
  private currentTheme: ThemeMode = ThemeMode.System

  init(): void {
    this.currentTheme = configManager.getTheme()
    this.applyTheme(this.currentTheme)

    // Listen for OS theme changes
    nativeTheme.on('updated', () => {
      this.broadcastTheme()
    })
  }

  setTheme(mode: ThemeMode): void {
    this.currentTheme = mode
    configManager.set(ConfigKeys.Theme, mode)
    this.applyTheme(mode)
    this.broadcastTheme()
  }

  getResolvedTheme(): 'dark' | 'light' {
    if (this.currentTheme === ThemeMode.System) {
      return nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
    }
    return this.currentTheme === ThemeMode.Dark ? 'dark' : 'light'
  }

  private applyTheme(mode: ThemeMode): void {
    switch (mode) {
      case ThemeMode.Dark:
        nativeTheme.themeSource = 'dark'
        break
      case ThemeMode.Light:
        nativeTheme.themeSource = 'light'
        break
      case ThemeMode.System:
        nativeTheme.themeSource = 'system'
        break
    }
    this.updateTitleBarOverlays()
  }

  private updateTitleBarOverlays(): void {
    const resolved = this.getResolvedTheme()
    const overlay = resolved === 'dark' ? titleBarOverlayDark : titleBarOverlayLight

    for (const win of BrowserWindow.getAllWindows()) {
      try {
        win.setTitleBarOverlay(overlay)
      } catch {
        // Not all windows support title bar overlay (e.g., macOS)
      }
    }
  }

  private broadcastTheme(): void {
    const resolved = this.getResolvedTheme()
    for (const win of BrowserWindow.getAllWindows()) {
      win.webContents.send(IpcChannel.Theme_Updated, resolved)
    }
  }
}

export const themeService = new ThemeService()
