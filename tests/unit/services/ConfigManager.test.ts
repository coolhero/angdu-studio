import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockStore = new Map<string, unknown>()
vi.mock('electron-store', () => ({
  default: vi.fn().mockImplementation(() => ({
    get: vi.fn((key: string, def?: unknown) => mockStore.get(key) ?? def),
    set: vi.fn((key: string, value: unknown) => mockStore.set(key, value)),
    delete: vi.fn((key: string) => mockStore.delete(key)),
    clear: vi.fn(() => mockStore.clear()),
    store: {}
  }))
}))

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/tmp/angdu-test')
  }
}))

describe('ConfigManager', () => {
  beforeEach(() => {
    vi.resetModules()
    mockStore.clear()
  })

  it('should create a singleton instance', async () => {
    const { ConfigManager } = await import('../../../src/main/services/ConfigManager')
    const a = ConfigManager.getInstance()
    const b = ConfigManager.getInstance()
    expect(a).toBe(b)
  })

  it('should get and set config values', async () => {
    const { ConfigManager } = await import('../../../src/main/services/ConfigManager')
    const cm = ConfigManager.getInstance()
    cm.set('theme', 'dark')
    expect(cm.get('theme')).toBe('dark')
  })

  it('should return default value when key is not set', async () => {
    const { ConfigManager } = await import('../../../src/main/services/ConfigManager')
    const cm = ConfigManager.getInstance()
    expect(cm.get('theme', 'system')).toBe('system')
  })

  it('should notify observers on set', async () => {
    const { ConfigManager } = await import('../../../src/main/services/ConfigManager')
    const cm = ConfigManager.getInstance()
    const callback = vi.fn()
    cm.subscribe('theme', callback)
    cm.set('theme', 'dark')
    expect(callback).toHaveBeenCalledWith('dark', undefined)
  })

  it('should unsubscribe observers', async () => {
    const { ConfigManager } = await import('../../../src/main/services/ConfigManager')
    const cm = ConfigManager.getInstance()
    const callback = vi.fn()
    cm.subscribe('theme', callback)
    cm.unsubscribe('theme', callback)
    cm.set('theme', 'dark')
    expect(callback).not.toHaveBeenCalled()
  })

  it('should reset a key to default', async () => {
    const { ConfigManager } = await import('../../../src/main/services/ConfigManager')
    const cm = ConfigManager.getInstance()
    cm.set('theme', 'dark')
    cm.reset('theme')
    expect(cm.get('theme', 'system')).toBe('system')
  })

  it('should reset all keys', async () => {
    const { ConfigManager } = await import('../../../src/main/services/ConfigManager')
    const cm = ConfigManager.getInstance()
    cm.set('theme', 'dark')
    cm.set('language', 'en')
    cm.resetAll()
    expect(cm.get('theme', 'system')).toBe('system')
    expect(cm.get('language', '')).toBe('')
  })
})
