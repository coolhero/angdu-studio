import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock electron modules before importing ConfigManager
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/tmp/test-data'),
    getVersion: vi.fn(() => '0.1.0'),
    getName: vi.fn(() => 'AngduStudio'),
    isPackaged: false
  }
}))

vi.mock('electron-store', () => {
  const store = new Map<string, unknown>()
  return {
    default: class MockStore {
      private defaults: Record<string, unknown>
      constructor(opts?: { defaults?: Record<string, unknown> }) {
        this.defaults = opts?.defaults ?? {}
      }
      get(key: string, defaultValue?: unknown): unknown {
        return store.has(key) ? store.get(key) : (defaultValue ?? this.defaults[key as keyof typeof this.defaults])
      }
      set(key: string, value: unknown): void {
        store.set(key, value)
      }
      clear(): void {
        store.clear()
      }
    }
  }
})

// Import after mocks
const { configManager, ConfigKeys } = await import('@main/services/ConfigManager')

describe('ConfigManager', () => {
  it('returns default theme as system', () => {
    expect(configManager.getTheme()).toBe('system')
  })

  it('returns default language as ko', () => {
    expect(configManager.getLanguage()).toBe('ko')
  })

  it('returns default zoom factor as 1.0', () => {
    expect(configManager.getZoomFactor()).toBe(1.0)
  })

  it('gets and sets values', () => {
    configManager.set('testKey', 'testValue')
    expect(configManager.get('testKey')).toBe('testValue')
  })

  it('notifies subscribers when notify flag is set', () => {
    const callback = vi.fn()
    configManager.subscribe('testNotify', callback)

    configManager.set('testNotify', 'newValue', true)
    expect(callback).toHaveBeenCalledWith('newValue')
  })

  it('does not notify when notify flag is false', () => {
    const callback = vi.fn()
    configManager.subscribe('testNoNotify', callback)

    configManager.set('testNoNotify', 'newValue', false)
    expect(callback).not.toHaveBeenCalled()
  })

  it('unsubscribes correctly', () => {
    const callback = vi.fn()
    configManager.subscribe('testUnsub', callback)
    configManager.unsubscribe('testUnsub', callback)

    configManager.set('testUnsub', 'newValue', true)
    expect(callback).not.toHaveBeenCalled()
  })

  it('returns default tray as true', () => {
    expect(configManager.getTray()).toBe(true)
  })

  it('returns default trayOnClose as true', () => {
    expect(configManager.getTrayOnClose()).toBe(true)
  })

  it('returns default proxy mode as system', () => {
    expect(configManager.getProxyMode()).toBe('system')
  })

  it('returns default shortcuts array', () => {
    const shortcuts = configManager.getShortcuts()
    expect(shortcuts).toHaveLength(3)
    expect(shortcuts[0].key).toBe('zoom-in')
  })
})
