import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock electron app module
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/mock/userData'),
    setPath: vi.fn()
  }
}))

// Mock fs
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  accessSync: vi.fn(),
  constants: { W_OK: 2 }
}))

import { app } from 'electron'
import { existsSync, accessSync } from 'node:fs'
import {
  isPortableMode,
  getAppDataPath,
  getFilesPath,
  getLogsPath,
  getConfigPath,
  getNotesPath,
  validateDirectoryPath,
  setCustomDataDirectory
} from '@main/utils/paths'

describe('paths', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('isPortableMode', () => {
    it('returns false when PORTABLE_EXECUTABLE_DIR is not set', () => {
      delete process.env.PORTABLE_EXECUTABLE_DIR
      expect(isPortableMode()).toBe(false)
    })

    it('returns true when PORTABLE_EXECUTABLE_DIR is set', () => {
      process.env.PORTABLE_EXECUTABLE_DIR = '/some/path'
      expect(isPortableMode()).toBe(true)
    })
  })

  describe('getAppDataPath', () => {
    it('returns userData path in standard mode', () => {
      delete process.env.PORTABLE_EXECUTABLE_DIR
      expect(getAppDataPath()).toBe('/mock/userData')
      expect(app.getPath).toHaveBeenCalledWith('userData')
    })

    it('returns portable data path when in portable mode', () => {
      process.env.PORTABLE_EXECUTABLE_DIR = '/portable/dir'
      const result = getAppDataPath()
      expect(result).toContain('/portable/dir')
      expect(result).toContain('data')
    })
  })

  describe('getFilesPath', () => {
    it('returns files subdirectory of app data path', () => {
      delete process.env.PORTABLE_EXECUTABLE_DIR
      expect(getFilesPath()).toContain('files')
    })
  })

  describe('getLogsPath', () => {
    it('returns logs subdirectory of app data path', () => {
      delete process.env.PORTABLE_EXECUTABLE_DIR
      expect(getLogsPath()).toContain('logs')
    })
  })

  describe('getConfigPath', () => {
    it('returns config subdirectory of app data path', () => {
      delete process.env.PORTABLE_EXECUTABLE_DIR
      expect(getConfigPath()).toContain('config')
    })
  })

  describe('getNotesPath', () => {
    it('returns notes subdirectory of app data path', () => {
      delete process.env.PORTABLE_EXECUTABLE_DIR
      expect(getNotesPath()).toContain('notes')
    })
  })

  describe('validateDirectoryPath', () => {
    it('returns false if directory does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false)
      expect(validateDirectoryPath('/nonexistent')).toBe(false)
    })

    it('returns false if directory is not writable', () => {
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(accessSync).mockImplementation(() => {
        throw new Error('EACCES')
      })
      expect(validateDirectoryPath('/readonly')).toBe(false)
    })

    it('returns true if directory exists and is writable', () => {
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(accessSync).mockImplementation(() => {})
      expect(validateDirectoryPath('/writable')).toBe(true)
    })
  })

  describe('setCustomDataDirectory', () => {
    it('returns false for invalid path', () => {
      vi.mocked(existsSync).mockReturnValue(false)
      expect(setCustomDataDirectory('/invalid')).toBe(false)
      expect(app.setPath).not.toHaveBeenCalled()
    })

    it('sets userData path and returns true for valid path', () => {
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(accessSync).mockImplementation(() => {})
      expect(setCustomDataDirectory('/valid')).toBe(true)
      expect(app.setPath).toHaveBeenCalledWith('userData', '/valid')
    })
  })
})
