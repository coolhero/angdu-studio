import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn()
  },
  app: {
    getPath: vi.fn().mockReturnValue('/mock'),
    getName: vi.fn().mockReturnValue('Cherry Studio')
  }
}))

vi.mock('electron-store', () => ({
  default: vi.fn().mockImplementation((opts?: { defaults?: Record<string, unknown> }) => {
    const data = { ...(opts?.defaults ?? {}) }
    return {
      get: vi.fn().mockImplementation((key: string) => data[key]),
      set: vi.fn().mockImplementation((key: string, value: unknown) => {
        data[key] = value
      }),
      delete: vi.fn(),
      clear: vi.fn(),
      store: data
    }
  })
}))

import { ConfigManager } from '../../services/ConfigManager'
import { ConfigKey } from '@shared/types'

describe('Config IPC handlers', () => {
  let configManager: ConfigManager

  beforeEach(() => {
    vi.clearAllMocks()
    configManager = new ConfigManager()
  })

  it('should handle Config_Get', () => {
    const result = configManager.get(ConfigKey.Theme)
    expect(result).toBeDefined()
  })

  it('should handle Config_Set', () => {
    configManager.set(ConfigKey.Theme, 'dark')
    const result = configManager.get(ConfigKey.Theme)
    expect(result).toBe('dark')
  })
})
