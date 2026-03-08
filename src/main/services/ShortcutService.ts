import { globalShortcut, BrowserWindow } from 'electron'
import { IpcChannel } from '@shared/ipc-channels'
import { configManager, ConfigKeys } from './ConfigManager'
import type { ShortcutBinding } from '@shared/types'

class ShortcutService {
  private registeredAccelerators: string[] = []

  init(mainWindow: BrowserWindow): void {
    const shortcuts = configManager.getShortcuts()
    this.registerAll(shortcuts, mainWindow)
  }

  registerAll(shortcuts: ShortcutBinding[], mainWindow: BrowserWindow): void {
    this.unregisterAll()

    for (const shortcut of shortcuts) {
      if (!shortcut.enabled) continue
      if (!shortcut.globalShortcut) continue

      try {
        const success = globalShortcut.register(shortcut.accelerator, () => {
          this.handleShortcut(shortcut.key, mainWindow)
        })

        if (success) {
          this.registeredAccelerators.push(shortcut.accelerator)
        } else {
          console.warn(`Failed to register shortcut: ${shortcut.accelerator}`)
        }
      } catch (error) {
        console.warn(`Shortcut conflict: ${shortcut.accelerator}`, error)
      }
    }
  }

  update(shortcuts: ShortcutBinding[], mainWindow: BrowserWindow): void {
    configManager.set(ConfigKeys.Shortcuts, shortcuts)
    this.registerAll(shortcuts, mainWindow)
  }

  unregisterAll(): void {
    for (const acc of this.registeredAccelerators) {
      try {
        globalShortcut.unregister(acc)
      } catch {
        // Ignore — may already be unregistered
      }
    }
    this.registeredAccelerators = []
  }

  getAll(): ShortcutBinding[] {
    return configManager.getShortcuts()
  }

  private handleShortcut(key: string, mainWindow: BrowserWindow): void {
    switch (key) {
      case 'zoom-in':
        mainWindow.webContents.send(IpcChannel.Zoom_HandleFactor, 0.1)
        break
      case 'zoom-out':
        mainWindow.webContents.send(IpcChannel.Zoom_HandleFactor, -0.1)
        break
      case 'zoom-reset':
        mainWindow.webContents.send(IpcChannel.Zoom_HandleFactor, 0, true)
        break
      case 'quick-assistant':
        // Will be wired to MiniWindowService
        break
    }
  }
}

export const shortcutService = new ShortcutService()
