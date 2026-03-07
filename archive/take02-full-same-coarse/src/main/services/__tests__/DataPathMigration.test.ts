import type { Stats } from 'node:fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockApp = {
  getVersion: vi.fn().mockReturnValue('1.0.0'),
  isPackaged: false,
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

const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn()
}

vi.mock('@main/services/LoggerService', () => ({
  loggerService: {
    withContext: vi.fn().mockReturnValue(mockLogger)
  }
}))

vi.mock('@main/constant', () => ({
  isMac: false,
  isWin: false,
  isLinux: false,
  isDev: false
}))

const mockConfigManager = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn()
}

vi.mock('@main/services/ConfigManager', () => ({
  configManager: mockConfigManager
}))

// Mock fs/promises
const mockFsPromises = {
  access: vi.fn(),
  cp: vi.fn(),
  mkdir: vi.fn(),
  writeFile: vi.fn(),
  stat: vi.fn()
}

vi.mock('fs/promises', () => ({
  default: mockFsPromises,
  ...mockFsPromises
}))

// Mock fs for existsSync and accessSync
const mockFs = {
  existsSync: vi.fn().mockReturnValue(false),
  accessSync: vi.fn(),
  constants: {
    W_OK: 2,
    R_OK: 4
  }
}

vi.mock('fs', () => ({
  default: mockFs,
  ...mockFs
}))

describe('Data Path Migration (AppService.setDataPath)', () => {
  let AppService: typeof import('../AppService').AppService

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    // Reset default mock behavior
    mockFsPromises.access.mockResolvedValue(undefined)
    mockFsPromises.cp.mockResolvedValue(undefined)
    mockFsPromises.mkdir.mockResolvedValue(undefined)
    mockFsPromises.writeFile.mockResolvedValue(undefined)
    mockFsPromises.stat.mockResolvedValue({ isDirectory: () => true } as Stats)
    mockFs.existsSync.mockReturnValue(false)
    mockFs.accessSync.mockReturnValue(undefined)

    const mod = await import('../AppService')
    AppService = mod.AppService
  })

  describe('setDataPath', () => {
    it('should validate that the new path is writable', async () => {
      const service = new AppService()
      const newPath = '/new/data/path'

      await service.setDataPath(newPath)

      // Should have attempted to verify write access by creating/accessing directory
      expect(mockFsPromises.mkdir).toHaveBeenCalledWith(newPath, { recursive: true })
    })

    it('should copy data directory to new location', async () => {
      const service = new AppService()
      const newPath = '/new/data/path'

      await service.setDataPath(newPath)

      expect(mockFsPromises.cp).toHaveBeenCalledWith(
        '/mock/user/data',
        newPath,
        expect.objectContaining({ recursive: true })
      )
    })

    it('should update ConfigManager with new path', async () => {
      const service = new AppService()
      const newPath = '/new/data/path'

      await service.setDataPath(newPath)

      expect(mockConfigManager.set).toHaveBeenCalledWith('dataPath', newPath)
    })

    it('should trigger app.relaunch() after migration', async () => {
      const service = new AppService()
      const newPath = '/new/data/path'

      await service.setDataPath(newPath)

      expect(mockApp.relaunch).toHaveBeenCalled()
    })

    it('should trigger app.quit() after relaunch', async () => {
      const service = new AppService()
      const newPath = '/new/data/path'

      await service.setDataPath(newPath)

      expect(mockApp.exit).toHaveBeenCalledWith(0)
    })

    it('should call relaunch before exit', async () => {
      const callOrder: string[] = []
      mockApp.relaunch.mockImplementation(() => callOrder.push('relaunch'))
      mockApp.exit.mockImplementation(() => callOrder.push('exit'))

      const service = new AppService()
      await service.setDataPath('/new/data/path')

      expect(callOrder).toEqual(['relaunch', 'exit'])
    })

    it('should reject invalid/non-writable paths', async () => {
      mockFsPromises.mkdir.mockRejectedValue(new Error('EACCES: permission denied'))

      const service = new AppService()

      await expect(service.setDataPath('/invalid/path')).rejects.toThrow()
    })

    it('should reject empty path', async () => {
      const service = new AppService()

      await expect(service.setDataPath('')).rejects.toThrow()
    })

    it('should not relaunch if copy fails', async () => {
      mockFsPromises.cp.mockRejectedValue(new Error('Copy failed'))

      const service = new AppService()

      await expect(service.setDataPath('/new/data/path')).rejects.toThrow('Copy failed')
      expect(mockApp.relaunch).not.toHaveBeenCalled()
      expect(mockApp.exit).not.toHaveBeenCalled()
    })

    it('should log the migration operation', async () => {
      const service = new AppService()
      await service.setDataPath('/new/data/path')

      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('data path'), expect.any(Object))
    })
  })
})
