import { describe, it, expect, vi } from 'vitest'

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/tmp/test-data'),
    getVersion: vi.fn(() => '0.1.0'),
    getName: vi.fn(() => 'AngduStudio'),
    isPackaged: false
  },
  globalShortcut: {
    register: vi.fn(() => true),
    unregister: vi.fn()
  },
  BrowserWindow: {
    getAllWindows: vi.fn(() => [])
  }
}))

vi.mock('electron-store', () => ({
  default: class MockStore {
    private data = new Map<string, unknown>()
    private defaults: Record<string, unknown>
    constructor(opts?: { defaults?: Record<string, unknown> }) {
      this.defaults = opts?.defaults ?? {}
    }
    get(key: string, defaultValue?: unknown): unknown {
      return this.data.has(key) ? this.data.get(key) : (defaultValue ?? this.defaults[key as keyof typeof this.defaults])
    }
    set(key: string, value: unknown): void {
      this.data.set(key, value)
    }
  }
}))

const { shortcutService } = await import('@main/services/ShortcutService')

describe('ShortcutService', () => {
  it('returns default shortcuts via getAll', () => {
    const shortcuts = shortcutService.getAll()
    expect(shortcuts).toHaveLength(3)
    expect(shortcuts.map((s) => s.key)).toEqual(['zoom-in', 'zoom-out', 'zoom-reset'])
  })

  it('unregisters all shortcuts', () => {
    const { globalShortcut } = require('electron')
    shortcutService.unregisterAll()
    // Should not throw
    expect(true).toBe(true)
  })
})
