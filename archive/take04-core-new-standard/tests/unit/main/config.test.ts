import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockStore = {
  get: vi.fn(),
  set: vi.fn(),
  store: {}
}

vi.mock('electron-store', () => ({
  default: vi.fn(() => mockStore)
}))

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid')
}))

vi.mock('electron', () => ({
  app: { getPath: vi.fn(() => '/tmp') }
}))

describe('ConfigManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.get.mockImplementation((key: string) => {
      const defaults: Record<string, unknown> = {
        language: 'en-US',
        theme: 'auto',
        zoomFactor: 1.0
      }
      return defaults[key]
    })
  })

  it('should get typed config values', async () => {
    const { configManager } = await import('../../../src/main/config')
    const value = configManager.get<string>('language' as any)
    expect(mockStore.get).toHaveBeenCalled()
  })

  it('should set config values and emit change event', async () => {
    const { configManager } = await import('../../../src/main/config')
    const listener = vi.fn()
    configManager.subscribe('theme' as any, listener)

    configManager.set('theme' as any, 'dark')
    expect(mockStore.set).toHaveBeenCalledWith('theme', 'dark')
    expect(listener).toHaveBeenCalledWith('dark')
  })

  it('should return cleanup function from subscribe', async () => {
    const { configManager } = await import('../../../src/main/config')
    const listener = vi.fn()
    const cleanup = configManager.subscribe('language' as any, listener)
    expect(typeof cleanup).toBe('function')

    cleanup()
    configManager.set('language' as any, 'ko-KR')
    expect(listener).not.toHaveBeenCalled()
  })
})
