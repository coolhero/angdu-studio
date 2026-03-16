import { globalShortcut } from 'electron'
import { configService } from './ConfigService'
import { windowService } from './WindowService'
import { logger } from './LoggerService'

class ShortcutService {
  private static instance: ShortcutService | null = null
  private registeredShortcut: string | null = null
  private keyedShortcuts: Map<string, string> = new Map()

  static getInstance(): ShortcutService {
    if (!ShortcutService.instance) {
      ShortcutService.instance = new ShortcutService()
    }
    return ShortcutService.instance
  }

  initialize(): void {
    const shortcut = configService.get('globalShortcut')
    if (shortcut) {
      this.register(shortcut)
    }
    logger.info('[ShortcutService] Initialized')
  }

  register(accelerator: string): boolean {
    this.unregisterAll()

    try {
      const success = globalShortcut.register(accelerator, () => {
        windowService.toggleMainWindow()
      })

      if (success) {
        this.registeredShortcut = accelerator
        logger.info(`[ShortcutService] Registered: ${accelerator}`)
      } else {
        logger.warn(`[ShortcutService] Failed to register: ${accelerator}`)
      }

      return success
    } catch (err) {
      logger.warn(`[ShortcutService] Error registering shortcut: ${accelerator}`, err)
      return false
    }
  }

  unregisterAll(): void {
    if (this.registeredShortcut) {
      globalShortcut.unregister(this.registeredShortcut)
      this.registeredShortcut = null
    }
  }

  /**
   * Register a keyed shortcut (F003).
   * Returns true if the shortcut was successfully registered.
   */
  registerKeyed(key: string, accelerator: string): boolean {
    // Unregister previous binding for this key if exists
    this.unregisterKeyed(key)

    try {
      const success = globalShortcut.register(accelerator, () => {
        const mainWindow = windowService.getMainWindow?.()
        if (mainWindow) {
          mainWindow.webContents.send('shortcut:triggered', key)
        }
      })

      if (success) {
        this.keyedShortcuts.set(key, accelerator)
        logger.info(`[ShortcutService] Registered keyed: ${key} → ${accelerator}`)
      } else {
        logger.warn(`[ShortcutService] Failed to register keyed: ${key} → ${accelerator}`)
      }

      return success
    } catch (err) {
      logger.warn(`[ShortcutService] Error registering keyed shortcut: ${key}`, err)
      return false
    }
  }

  /**
   * Unregister a keyed shortcut by its key name.
   */
  unregisterKeyed(key: string): void {
    const accelerator = this.keyedShortcuts.get(key)
    if (accelerator) {
      try {
        globalShortcut.unregister(accelerator)
      } catch {
        // already unregistered
      }
      this.keyedShortcuts.delete(key)
      logger.info(`[ShortcutService] Unregistered keyed: ${key}`)
    }
  }

  /**
   * Unregister all keyed shortcuts (F003).
   */
  unregisterAllKeyed(): void {
    for (const [key, accelerator] of this.keyedShortcuts) {
      try {
        globalShortcut.unregister(accelerator)
      } catch {
        // already unregistered
      }
      logger.info(`[ShortcutService] Unregistered keyed: ${key}`)
    }
    this.keyedShortcuts.clear()
  }

  cleanup(): void {
    globalShortcut.unregisterAll()
    this.keyedShortcuts.clear()
  }
}

export const shortcutService = ShortcutService.getInstance()
