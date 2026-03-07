import { loggerService } from '@main/services/LoggerService'
import { windowService } from '@main/services/WindowService'
import type { Shortcut } from '@shared/types'
import { globalShortcut } from 'electron'

const logger = loggerService.withContext('ShortcutService')

class ShortcutService {
  private actionHandlers: Record<string, () => void> = {
    'show-hide-app': () => this.toggleMainWindowVisibility()
  }

  registerAll(shortcuts: Shortcut[]): void {
    for (const shortcut of shortcuts) {
      if (!shortcut.enabled) {
        continue
      }

      if (shortcut.shortcut.length === 0) {
        continue
      }

      const accelerator = shortcut.shortcut[0]
      const handler = this.actionHandlers[shortcut.key]

      try {
        const success = globalShortcut.register(
          accelerator,
          handler ??
            (() => {
              logger.warn(`No action handler for shortcut key: ${shortcut.key}`)
            })
        )

        if (!success) {
          logger.warn(`Failed to register shortcut: ${accelerator} (may already be in use)`)
        } else {
          logger.info(`Registered shortcut: ${shortcut.key} -> ${accelerator}`)
        }
      } catch (error) {
        logger.warn(`Error registering shortcut: ${accelerator}`, {
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }
  }

  unregisterAll(): void {
    globalShortcut.unregisterAll()
    logger.info('All shortcuts unregistered')
  }

  update(shortcuts: Shortcut[]): void {
    this.unregisterAll()
    this.registerAll(shortcuts)
  }

  private toggleMainWindowVisibility(): void {
    const mainWindow = windowService.getMainWindow()
    if (!mainWindow || mainWindow.isDestroyed()) {
      return
    }

    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  }
}

export const shortcutService = new ShortcutService()
export default shortcutService
