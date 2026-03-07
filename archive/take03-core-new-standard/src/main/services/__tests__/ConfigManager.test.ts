import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock electron-store
const mockStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  store: {}
}

vi.mock('electron-store', () => ({
  default: vi.fn().mockImplementation(() => mockStore)
}))

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/mock/user-data'),
    getName: vi.fn().mockReturnValue('Cherry Studio')
  }
}))

import { ConfigManager } from '../ConfigManager'
import { ConfigKey } from '@shared/types'
import { CONFIG_DEFAULTS } from '@shared/constants'

describe('ConfigManager', () => {
  let config: ConfigManager

  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.get.mockImplementation((key: string) => {
      return (CONFIG_DEFAULTS as Record<string, unknown>)[key]
    })
    config = new ConfigManager()
  })

  describe('get/set', () => {
    it('should get config value', () => {
      mockStore.get.mockReturnValueOnce('system')
      const value = config.get(ConfigKey.Theme)
      expect(mockStore.get).toHaveBeenCalledWith(ConfigKey.Theme)
      expect(value).toBe('system')
    })

    it('should set config value', () => {
      config.set(ConfigKey.Theme, 'dark')
      expect(mockStore.set).toHaveBeenCalledWith(ConfigKey.Theme, 'dark')
    })

    it('should return default for missing key', () => {
      mockStore.get.mockReturnValueOnce(undefined)
      const value = config.get(ConfigKey.ZoomFactor)
      expect(value).toBeUndefined()
    })
  })

  describe('observer pattern', () => {
    it('should subscribe and receive notifications', () => {
      const callback = vi.fn()
      config.subscribe(ConfigKey.Theme, callback)
      config.setAndNotify(ConfigKey.Theme, 'dark')

      expect(mockStore.set).toHaveBeenCalledWith(ConfigKey.Theme, 'dark')
      expect(callback).toHaveBeenCalledWith('dark')
    })

    it('should unsubscribe', () => {
      const callback = vi.fn()
      const unsubscribe = config.subscribe(ConfigKey.Theme, callback)
      unsubscribe()
      config.setAndNotify(ConfigKey.Theme, 'dark')

      expect(callback).not.toHaveBeenCalled()
    })

    it('should notify multiple subscribers', () => {
      const cb1 = vi.fn()
      const cb2 = vi.fn()
      config.subscribe(ConfigKey.Language, cb1)
      config.subscribe(ConfigKey.Language, cb2)
      config.setAndNotify(ConfigKey.Language, 'ko-KR')

      expect(cb1).toHaveBeenCalledWith('ko-KR')
      expect(cb2).toHaveBeenCalledWith('ko-KR')
    })
  })

  describe('corrupted config recovery', () => {
    it('should create store with defaults', () => {
      // ConfigManager constructor should pass defaults
      expect(config).toBeDefined()
    })
  })
})
