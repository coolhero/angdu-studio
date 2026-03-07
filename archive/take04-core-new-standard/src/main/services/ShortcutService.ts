import { globalShortcut } from 'electron'
import type { Shortcut } from '@shared/types'
import { withContext } from '../logger'

const log = withContext('shortcuts')

type ActionHandler = () => void

export class ShortcutService {
  private actionHandlers = new Map<string, ActionHandler>()

  registerAction(key: string, handler: ActionHandler): void {
    this.actionHandlers.set(key, handler)
  }

  registerShortcuts(shortcuts: Shortcut[]): void {
    for (const shortcut of shortcuts) {
      if (!shortcut.enabled) continue

      for (const accelerator of shortcut.shortcut) {
        const success = globalShortcut.register(accelerator, () => {
          const handler = this.actionHandlers.get(shortcut.key)
          if (handler) {
            handler()
          } else {
            log.warn(`No handler for shortcut action: ${shortcut.key}`)
          }
        })

        if (!success) {
          log.warn(`Failed to register shortcut: ${accelerator} for ${shortcut.key}`)
        }
      }
    }
  }

  updateShortcut(key: string, enabled: boolean): void {
    log.debug(`Shortcut ${key} ${enabled ? 'enabled' : 'disabled'}`)
  }

  unregisterAll(): void {
    globalShortcut.unregisterAll()
  }
}
