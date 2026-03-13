import { nativeTheme, BrowserWindow } from 'electron'
import type { ThemeMode } from '@shared/types'
import { ConfigManager } from './ConfigManager'
import { getTitleBarOverlayConfig } from '../config'
import { isMac } from '../constant'

export class ThemeService {
  private static instance: ThemeService
  private configManager: ConfigManager

  private constructor() {
    this.configManager = ConfigManager.getInstance()

    // Apply initial theme from config
    const theme = this.configManager.getTheme()
    nativeTheme.themeSource = theme

    // Subscribe to native theme changes (triggered by system or programmatic changes)
    nativeTheme.on('updated', () => {
      this.themeUpdatedHandler()
    })
  }

  static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService()
    }
    return ThemeService.instance
  }

  /**
   * Set the application theme and persist to config.
   */
  setTheme(theme: ThemeMode): void {
    this.configManager.set('theme', theme)
    nativeTheme.themeSource = theme
    // themeUpdatedHandler will be called automatically via nativeTheme 'updated' event
    // But if the source didn't actually change, we still broadcast
    this.themeUpdatedHandler()
  }

  /**
   * Handle theme update: update titlebar overlay and broadcast to all renderer windows.
   */
  themeUpdatedHandler(): void {
    const isDark = nativeTheme.shouldUseDarkColors

    // Update titleBarOverlay on all windows (macOS only)
    if (isMac) {
      const overlayConfig = getTitleBarOverlayConfig(isDark)
      if (overlayConfig) {
        for (const win of BrowserWindow.getAllWindows()) {
          try {
            win.setTitleBarOverlay(overlayConfig)
          } catch {
            // Window may not support titleBarOverlay (e.g., frameless non-mac)
          }
        }
      }
    }

    // Broadcast theme-changed to all renderer processes
    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed()) {
        win.webContents.send('theme-changed', {
          theme: this.configManager.getTheme(),
          shouldUseDarkColors: isDark,
        })
      }
    }
  }
}
