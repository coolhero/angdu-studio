import { globalShortcut } from 'electron'
import { configService } from './ConfigService'
import { windowService } from './WindowService'
import { logger } from './LoggerService'

class ShortcutService {
  private static instance: ShortcutService | null = null
  private registeredShortcut: string | null = null

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

  cleanup(): void {
    globalShortcut.unregisterAll()
  }
}

export const shortcutService = ShortcutService.getInstance()
