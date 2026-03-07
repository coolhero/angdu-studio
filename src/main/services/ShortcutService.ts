import { globalShortcut } from 'electron'
import { ConfigManager } from './ConfigManager'
import type { Shortcut } from '@shared/types/shortcut'

export class ShortcutService {
  private static instance: ShortcutService
  private registeredShortcuts: Map<string, Shortcut> = new Map()

  private constructor() {
    this.loadShortcuts()
  }

  static getInstance(): ShortcutService {
    if (!ShortcutService.instance) {
      ShortcutService.instance = new ShortcutService()
    }
    return ShortcutService.instance
  }

  register(shortcut: Shortcut, callback: () => void): boolean {
    this.unregister(shortcut.key)
    this.registeredShortcuts.set(shortcut.key, shortcut)

    if (!shortcut.enabled) return true

    let success = true
    for (const combo of shortcut.shortcut) {
      try {
        const registered = globalShortcut.register(combo, callback)
        if (!registered) success = false
      } catch {
        success = false
      }
    }
    return success
  }

  unregister(key: string): void {
    const shortcut = this.registeredShortcuts.get(key)
    if (shortcut) {
      for (const combo of shortcut.shortcut) {
        try {
          globalShortcut.unregister(combo)
        } catch {
          // May not be registered
        }
      }
      this.registeredShortcuts.delete(key)
    }
  }

  unregisterAll(): void {
    globalShortcut.unregisterAll()
    this.registeredShortcuts.clear()
  }

  setEnabled(key: string, enabled: boolean): void {
    const shortcut = this.registeredShortcuts.get(key)
    if (shortcut) {
      shortcut.enabled = enabled
      this.saveShortcuts()
    }
  }

  private loadShortcuts(): void {
    const configManager = ConfigManager.getInstance()
    const shortcuts = configManager.get<Shortcut[]>('shortcuts', [])
    for (const s of shortcuts) {
      this.registeredShortcuts.set(s.key, s)
    }
  }

  private saveShortcuts(): void {
    const configManager = ConfigManager.getInstance()
    configManager.set('shortcuts', Array.from(this.registeredShortcuts.values()))
  }
}
