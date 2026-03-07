import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn()
}

vi.mock('electron-store', () => ({
  default: vi.fn().mockImplementation(() => mockStore)
}))

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/mock/user/data'),
    getLocale: vi.fn().mockReturnValue('en-US'),
    isPackaged: false
  }
}))

vi.mock('@main/services/LoggerService', () => ({
  loggerService: {
    withContext: vi.fn().mockReturnValue({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn()
    })
  }
}))

vi.mock('@main/constant', () => ({
  isDev: false
}))

describe('ConfigManager', () => {
  let configManager: typeof import('../ConfigManager').configManager

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    mockStore.get.mockReset()
    mockStore.set.mockReset()
    mockStore.delete.mockReset()
    const mod = await import('../ConfigManager')
    configManager = mod.configManager
  })

  describe('get', () => {
    it('should retrieve a value by key', () => {
      mockStore.get.mockReturnValue('test-value')
      const result = configManager.get('some-key')
      expect(mockStore.get).toHaveBeenCalledWith('some-key', undefined)
      expect(result).toBe('test-value')
    })

    it('should return default value when key does not exist', () => {
      mockStore.get.mockReturnValue('fallback')
      const result = configManager.get('missing-key', 'fallback')
      expect(mockStore.get).toHaveBeenCalledWith('missing-key', 'fallback')
      expect(result).toBe('fallback')
    })

    it('should support typed return values', () => {
      mockStore.get.mockReturnValue(42)
      const result = configManager.get<number>('numeric-key', 0)
      expect(result).toBe(42)
      expect(typeof result).toBe('number')
    })

    it('should return undefined when no default and key missing', () => {
      mockStore.get.mockReturnValue(undefined)
      const result = configManager.get('nonexistent')
      expect(result).toBeUndefined()
    })
  })

  describe('set', () => {
    it('should store a string value', () => {
      configManager.set('key1', 'value1')
      expect(mockStore.set).toHaveBeenCalledWith('key1', 'value1')
    })

    it('should store a numeric value', () => {
      configManager.set('count', 42)
      expect(mockStore.set).toHaveBeenCalledWith('count', 42)
    })

    it('should store a boolean value', () => {
      configManager.set('enabled', true)
      expect(mockStore.set).toHaveBeenCalledWith('enabled', true)
    })

    it('should store an object value', () => {
      const obj = { host: '127.0.0.1', port: 8080 }
      configManager.set('proxy', obj)
      expect(mockStore.set).toHaveBeenCalledWith('proxy', obj)
    })

    it('should store null value', () => {
      configManager.set('nullable', null)
      expect(mockStore.set).toHaveBeenCalledWith('nullable', null)
    })
  })

  describe('delete', () => {
    it('should delete a key from the store', () => {
      configManager.delete('obsolete-key')
      expect(mockStore.delete).toHaveBeenCalledWith('obsolete-key')
    })
  })

  describe('getTheme', () => {
    it('should return stored theme value', () => {
      mockStore.get.mockReturnValue('dark')
      const theme = configManager.getTheme()
      expect(theme).toBe('dark')
    })

    it('should default to system when no theme stored', () => {
      mockStore.get.mockImplementation((_key: string, defaultValue: unknown) => defaultValue)
      const theme = configManager.getTheme()
      expect(theme).toBe('system')
    })
  })

  describe('setTheme', () => {
    it('should store the theme value', () => {
      configManager.setTheme('dark')
      expect(mockStore.set).toHaveBeenCalledWith('theme', 'dark')
    })

    it('should store light theme', () => {
      configManager.setTheme('light')
      expect(mockStore.set).toHaveBeenCalledWith('theme', 'light')
    })

    it('should store system theme', () => {
      configManager.setTheme('system')
      expect(mockStore.set).toHaveBeenCalledWith('theme', 'system')
    })
  })

  describe('getUpdateChannel', () => {
    it('should return stored update channel', () => {
      mockStore.get.mockReturnValue('beta')
      const channel = configManager.getUpdateChannel()
      expect(channel).toBe('beta')
    })

    it('should default to stable when no channel stored', () => {
      mockStore.get.mockImplementation((_key: string, defaultValue: unknown) => defaultValue)
      const channel = configManager.getUpdateChannel()
      expect(channel).toBe('stable')
    })
  })

  describe('setUpdateChannel', () => {
    it('should store the update channel', () => {
      configManager.setUpdateChannel('beta')
      expect(mockStore.set).toHaveBeenCalledWith('updateChannel', 'beta')
    })

    it('should store rc channel', () => {
      configManager.setUpdateChannel('rc')
      expect(mockStore.set).toHaveBeenCalledWith('updateChannel', 'rc')
    })
  })

  describe('type safety', () => {
    it('should handle string type correctly', () => {
      mockStore.get.mockReturnValue('hello')
      const val = configManager.get<string>('str-key')
      expect(typeof val).toBe('string')
    })

    it('should handle number type correctly', () => {
      mockStore.get.mockReturnValue(100)
      const val = configManager.get<number>('num-key')
      expect(typeof val).toBe('number')
    })

    it('should handle boolean type correctly', () => {
      mockStore.get.mockReturnValue(true)
      const val = configManager.get<boolean>('bool-key')
      expect(typeof val).toBe('boolean')
    })

    it('should handle complex object types', () => {
      const complex = { nested: { deep: true }, arr: [1, 2, 3] }
      mockStore.get.mockReturnValue(complex)
      const val = configManager.get<typeof complex>('complex-key')
      expect(val).toEqual(complex)
    })
  })
})
