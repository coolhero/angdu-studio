import { globalShortcut } from 'electron'

export class ShortcutService {
  private registeredShortcuts = new Map<string, () => void>()

  register(accelerator: string, callback: () => void): boolean {
    try {
      const success = globalShortcut.register(accelerator, callback)
      if (success) {
        this.registeredShortcuts.set(accelerator, callback)
      }
      return success
    } catch {
      return false
    }
  }

  unregister(accelerator: string): void {
    globalShortcut.unregister(accelerator)
    this.registeredShortcuts.delete(accelerator)
  }

  unregisterAll(): void {
    globalShortcut.unregisterAll()
    this.registeredShortcuts.clear()
  }

  isRegistered(accelerator: string): boolean {
    return globalShortcut.isRegistered(accelerator)
  }
}
