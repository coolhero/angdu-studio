import { globalShortcut } from 'electron'
import type { Shortcut } from '@shared/types/shortcut'

/**
 * Manages global keyboard shortcuts using Electron's globalShortcut API.
 * Provides register, unregister, and query operations.
 */
export class ShortcutService {
  private shortcuts: Map<string, Shortcut> = new Map()
  private callbacks: Map<string, () => void> = new Map()

  /**
   * Registers a global shortcut.
   * Returns the registered Shortcut with a generated id.
   */
  register(shortcut: Omit<Shortcut, 'id'>, callback: () => void): Shortcut {
    const id = crypto.randomUUID()
    const registered: Shortcut = { id, ...shortcut }

    if (registered.enabled) {
      globalShortcut.register(registered.accelerator, callback)
    }

    this.shortcuts.set(id, registered)
    this.callbacks.set(id, callback)
    return registered
  }

  /**
   * Unregisters a shortcut by id.
   */
  unregister(id: string): void {
    const shortcut = this.shortcuts.get(id)
    if (shortcut) {
      globalShortcut.unregister(shortcut.accelerator)
      this.shortcuts.delete(id)
      this.callbacks.delete(id)
    }
  }

  /**
   * Unregisters all shortcuts managed by this service.
   */
  unregisterAll(): void {
    for (const shortcut of this.shortcuts.values()) {
      globalShortcut.unregister(shortcut.accelerator)
    }
    this.shortcuts.clear()
    this.callbacks.clear()
  }

  /**
   * Returns all registered shortcuts.
   */
  getAll(): Shortcut[] {
    return Array.from(this.shortcuts.values())
  }
}
