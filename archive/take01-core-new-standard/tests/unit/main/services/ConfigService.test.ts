import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock electron-store
const mockStore = {
  get: vi.fn(),
  set: vi.fn(),
  clear: vi.fn(),
  store: {} as Record<string, unknown>
}

vi.mock('electron-store', () => ({
  default: vi.fn().mockImplementation(() => mockStore)
}))

// Mock electron (needed for electron-store internals)
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/mock/userData'),
    getName: vi.fn().mockReturnValue('Cherry Studio'),
    getVersion: vi.fn().mockReturnValue('0.1.0')
  }
}))

import { DEFAULT_CONFIG } from '@shared/constants'
import { ConfigService } from '@main/services/ConfigService'

describe('ConfigService', () => {
  let configService: ConfigService

  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.store = { ...DEFAULT_CONFIG }
    mockStore.get.mockImplementation((key: string) => {
      return (DEFAULT_CONFIG as Record<string, unknown>)[key]
    })
    configService = new ConfigService()
  })

  describe('get', () => {
    it('returns config value for a given key', () => {
      mockStore.get.mockReturnValue('system')
      const result = configService.get('theme')
      expect(mockStore.get).toHaveBeenCalledWith('theme')
      expect(result).toBe('system')
    })
  })

  describe('set', () => {
    it('sets a config value', () => {
      configService.set('theme', 'dark')
      expect(mockStore.set).toHaveBeenCalledWith('theme', 'dark')
    })

    it('sets a number value', () => {
      configService.set('fontSize', 16)
      expect(mockStore.set).toHaveBeenCalledWith('fontSize', 16)
    })
  })

  describe('getAll', () => {
    it('returns the entire config object', () => {
      const result = configService.getAll()
      expect(result).toEqual(DEFAULT_CONFIG)
    })
  })

  describe('reset', () => {
    it('clears the store and returns defaults', () => {
      const result = configService.reset()
      expect(mockStore.clear).toHaveBeenCalled()
      expect(result).toEqual(DEFAULT_CONFIG)
    })
  })
})
