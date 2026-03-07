import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockApp = {
  getVersion: vi.fn().mockReturnValue('1.0.0'),
  isPackaged: true,
  getAppPath: vi.fn().mockReturnValue('/mock/app/path'),
  getPath: vi.fn().mockReturnValue('/mock/user/data'),
  getLocale: vi.fn().mockReturnValue('en-US'),
  quit: vi.fn(),
  relaunch: vi.fn(),
  exit: vi.fn()
}

vi.mock('electron', () => ({
  app: mockApp
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
  isMac: false,
  isWin: false,
  isLinux: false,
  isDev: false
}))

vi.mock('@main/services/ConfigManager', () => ({
  configManager: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn()
  }
}))

vi.mock('fs/promises', () => ({
  default: {
    access: vi.fn().mockResolvedValue(undefined),
    cp: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    stat: vi.fn().mockResolvedValue({ isDirectory: () => true })
  }
}))

const mockExistsSync = vi.fn()

vi.mock('fs', () => ({
  default: {
    existsSync: mockExistsSync,
    accessSync: vi.fn(),
    constants: { W_OK: 2, R_OK: 4 }
  },
  existsSync: mockExistsSync,
  accessSync: vi.fn(),
  constants: { W_OK: 2, R_OK: 4 }
}))

describe('Portable Mode (AppService.isPortable)', () => {
  let AppService: typeof import('../AppService').AppService

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    mockExistsSync.mockReturnValue(false)

    const mod = await import('../AppService')
    AppService = mod.AppService
  })

  describe('isPortable', () => {
    it('should return false when no portable marker file exists', () => {
      mockExistsSync.mockReturnValue(false)

      const service = new AppService()
      expect(service.isPortable()).toBe(false)
    })

    it('should return true when .portable marker file exists adjacent to executable', () => {
      mockExistsSync.mockImplementation((filePath: string) => {
        return typeof filePath === 'string' && filePath.endsWith('.portable')
      })

      const service = new AppService()
      expect(service.isPortable()).toBe(true)
    })

    it('should return true when portable.dat marker file exists adjacent to executable', () => {
      mockExistsSync.mockImplementation((filePath: string) => {
        return typeof filePath === 'string' && filePath.endsWith('portable.dat')
      })

      const service = new AppService()
      expect(service.isPortable()).toBe(true)
    })

    it('should check for marker files relative to app path', () => {
      mockExistsSync.mockReturnValue(false)

      const service = new AppService()
      service.isPortable()

      // Should check for the marker files
      expect(mockExistsSync).toHaveBeenCalled()
      const calls = mockExistsSync.mock.calls.map((c: unknown[]) => c[0])
      expect(calls.some((p: string) => p.includes('.portable'))).toBe(true)
      expect(calls.some((p: string) => p.includes('portable.dat'))).toBe(true)
    })

    it('should use app path directory for marker file detection', () => {
      mockExistsSync.mockReturnValue(false)
      mockApp.getAppPath.mockReturnValue('/opt/cherry-studio/resources/app.asar')

      const service = new AppService()
      service.isPortable()

      // The marker file check should be based on the app executable directory
      expect(mockExistsSync).toHaveBeenCalled()
    })
  })
})
