import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock electron
vi.mock('electron', () => ({
  app: {
    getName: vi.fn().mockReturnValue('Cherry Studio'),
    getVersion: vi.fn().mockReturnValue('0.1.0'),
    getPath: vi.fn().mockReturnValue('/mock/userData')
  },
  protocol: {
    registerSchemesAsPrivileged: vi.fn()
  }
}))

// Mock paths utility
vi.mock('@main/utils/paths', () => ({
  isPortableMode: vi.fn().mockReturnValue(false),
  getAppDataPath: vi.fn().mockReturnValue('/mock/userData'),
  getFilesPath: vi.fn().mockReturnValue('/mock/userData/files'),
  getLogsPath: vi.fn().mockReturnValue('/mock/userData/logs'),
  getConfigPath: vi.fn().mockReturnValue('/mock/userData/config'),
  getNotesPath: vi.fn().mockReturnValue('/mock/userData/notes')
}))

import { protocol } from 'electron'
import { AppService } from '@main/services/AppService'

describe('AppService', () => {
  let appService: AppService

  beforeEach(() => {
    vi.clearAllMocks()
    appService = new AppService()
  })

  describe('registerProtocol', () => {
    it('registers cherrystudio:// as a privileged scheme', () => {
      appService.registerProtocol()
      expect(protocol.registerSchemesAsPrivileged).toHaveBeenCalledWith([
        {
          scheme: 'cherrystudio',
          privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true
          }
        }
      ])
    })
  })

  describe('getInfo', () => {
    it('returns app info with version, paths, and arch', () => {
      const info = appService.getInfo()

      expect(info.name).toBe('Cherry Studio')
      expect(info.version).toBe('0.1.0')
      // process.versions.electron is undefined in Node test env, only available in Electron
      expect(info).toHaveProperty('electronVersion')
      expect(info.arch).toBe(process.arch)
      expect(info.isPortable).toBe(false)
      expect(info.paths).toEqual({
        appData: '/mock/userData',
        files: '/mock/userData/files',
        logs: '/mock/userData/logs',
        config: '/mock/userData/config',
        notes: '/mock/userData/notes'
      })
    })
  })
})
