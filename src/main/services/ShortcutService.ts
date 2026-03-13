import { globalShortcut, BrowserWindow } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import { ConfigManager } from './ConfigManager'
import { isMac } from '../constant'

export class ShortcutService {
  private static instance: ShortcutService
  private configManager: ConfigManager
  private registeredShortcuts: string[] = []

  private constructor() {
    this.configManager = ConfigManager.getInstance()
  }

  static getInstance(): ShortcutService {
    if (!ShortcutService.instance) {
      ShortcutService.instance = new ShortcutService()
    }
    return ShortcutService.instance
  }

  /**
   * Register all configured global shortcuts.
   */
  registerShortcuts(): void {
    this.unregisterAllShortcuts()

    const shortcuts = this.configManager.getShortcuts()

    // Show App shortcut
    if (shortcuts.showApp) {
      const accelerator = this.convertShortcutFormat(shortcuts.showApp)
      try {
        globalShortcut.register(accelerator, () => {
          const mainWindow = BrowserWindow.getAllWindows().find((w) => !w.isDestroyed())
          if (mainWindow) {
            if (mainWindow.isVisible() && mainWindow.isFocused()) {
              mainWindow.hide()
            } else {
              mainWindow.show()
              mainWindow.focus()
            }
          }
        })
        this.registeredShortcuts.push(accelerator)
      } catch {
        // Shortcut registration can fail if already taken by another app
      }
    }

    // Mini Window shortcut
    if (shortcuts.miniWindow) {
      const accelerator = this.convertShortcutFormat(shortcuts.miniWindow)
      try {
        globalShortcut.register(accelerator, () => {
          const mainWindow = BrowserWindow.getAllWindows().find((w) => !w.isDestroyed())
          if (mainWindow) {
            mainWindow.webContents.send(IpcChannel.MiniWindow_Toggle)
          }
        })
        this.registeredShortcuts.push(accelerator)
      } catch {
        // Shortcut registration can fail
      }
    }

    // Selection Assistant shortcut
    if (shortcuts.selectionAssistant) {
      const accelerator = this.convertShortcutFormat(shortcuts.selectionAssistant)
      try {
        globalShortcut.register(accelerator, () => {
          const mainWindow = BrowserWindow.getAllWindows().find((w) => !w.isDestroyed())
          if (mainWindow) {
            mainWindow.webContents.send('selection-assistant:toggle')
          }
        })
        this.registeredShortcuts.push(accelerator)
      } catch {
        // Shortcut registration can fail
      }
    }
  }

  /**
   * Unregister all previously registered shortcuts.
   */
  unregisterAllShortcuts(): void {
    for (const shortcut of this.registeredShortcuts) {
      try {
        globalShortcut.unregister(shortcut)
      } catch {
        // May already be unregistered
      }
    }
    this.registeredShortcuts = []
  }

  /**
   * On app blur, keep only the show_app shortcut registered.
   * This prevents capturing shortcuts that should go to other apps.
   */
  handleAppBlur(): void {
    const shortcuts = this.configManager.getShortcuts()
    const showAppAccelerator = shortcuts.showApp
      ? this.convertShortcutFormat(shortcuts.showApp)
      : null

    // Unregister all except showApp
    for (const shortcut of this.registeredShortcuts) {
      if (shortcut !== showAppAccelerator) {
        try {
          globalShortcut.unregister(shortcut)
        } catch {
          // Already unregistered
        }
      }
    }

    // Keep only showApp in the tracked list
    this.registeredShortcuts = showAppAccelerator ? [showAppAccelerator] : []
  }

  /**
   * On app focus, re-register all shortcuts.
   */
  handleAppFocus(): void {
    this.registerShortcuts()
  }

  /**
   * Convert shortcut format to Electron accelerator format.
   * Normalizes platform-specific modifier keys.
   *
   * Input examples: "Alt+Shift+Space", "Ctrl+Shift+A"
   * On macOS, Ctrl maps to Command for user-facing shortcuts.
   */
  convertShortcutFormat(shortcut: string): string {
    let accelerator = shortcut

    if (isMac) {
      // On macOS, convert Ctrl to CommandOrControl for cross-platform compat
      accelerator = accelerator.replace(/\bCtrl\b/g, 'CommandOrControl')
    } else {
      // On Windows/Linux, Ctrl stays as-is but we use CommandOrControl for portability
      accelerator = accelerator.replace(/\bCtrl\b/g, 'CommandOrControl')
    }

    return accelerator
  }
}
