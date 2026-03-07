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

vi.mock('@main/services/ConfigManager', () => ({
  configManager: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    getTheme: vi.fn().mockReturnValue('system'),
    setTheme: vi.fn(),
    getUpdateChannel: vi.fn().mockReturnValue('stable'),
    setUpdateChannel: vi.fn()
  }
}))

vi.mock('fs', () => ({
  default: { existsSync: vi.fn().mockReturnValue(false) },
  existsSync: vi.fn().mockReturnValue(false)
}))

vi.mock('fs/promises', () => ({
  default: { mkdir: vi.fn().mockResolvedValue(undefined), cp: vi.fn().mockResolvedValue(undefined) },
  mkdir: vi.fn().mockResolvedValue(undefined),
  cp: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@main/constant', () => ({
  isMac: false,
  isWin: false,
  isLinux: false,
  isDev: false
}))

describe('AppService', () => {
  let AppService: typeof import('../AppService').AppService

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    const mod = await import('../AppService')
    AppService = mod.AppService
  })

  describe('getInfo', () => {
    it('should return a valid AppInfo object', () => {
      const service = new AppService()
      const info = service.getInfo()

      expect(info).toBeDefined()
      expect(info).toHaveProperty('version')
      expect(info).toHaveProperty('isPackaged')
      expect(info).toHaveProperty('appPath')
      expect(info).toHaveProperty('appDataPath')
      expect(info).toHaveProperty('platform')
      expect(info).toHaveProperty('arch')
    })

    it('should return version from app.getVersion()', () => {
      const service = new AppService()
      const info = service.getInfo()
      expect(info.version).toBe('1.0.0')
    })

    it('should return isPackaged from app.isPackaged', () => {
      const service = new AppService()
      const info = service.getInfo()
      expect(info.isPackaged).toBe(false)
    })

    it('should return appPath from app.getAppPath()', () => {
      const service = new AppService()
      const info = service.getInfo()
      expect(info.appPath).toBe('/mock/app/path')
    })

    it('should return appDataPath from app.getPath("userData")', () => {
      const service = new AppService()
      const info = service.getInfo()
      expect(info.appDataPath).toBe('/mock/user/data')
      expect(mockApp.getPath).toHaveBeenCalledWith('userData')
    })

    it('should return platform from process.platform', () => {
      const service = new AppService()
      const info = service.getInfo()
      expect(typeof info.platform).toBe('string')
      expect(info.platform).toBe(process.platform)
    })

    it('should return arch from process.arch', () => {
      const service = new AppService()
      const info = service.getInfo()
      expect(typeof info.arch).toBe('string')
      expect(info.arch).toBe(process.arch)
    })
  })

  describe('quit', () => {
    it('should call app.quit()', () => {
      const service = new AppService()
      service.quit()
      expect(mockApp.quit).toHaveBeenCalledOnce()
    })
  })

  describe('relaunch', () => {
    it('should call app.relaunch()', () => {
      const service = new AppService()
      service.relaunch()
      expect(mockApp.relaunch).toHaveBeenCalledOnce()
    })

    it('should call app.exit(0) after relaunch', () => {
      const service = new AppService()
      service.relaunch()
      expect(mockApp.exit).toHaveBeenCalledWith(0)
    })

    it('should call relaunch before exit', () => {
      const callOrder: string[] = []
      mockApp.relaunch.mockImplementation(() => callOrder.push('relaunch'))
      mockApp.exit.mockImplementation(() => callOrder.push('exit'))

      const service = new AppService()
      service.relaunch()

      expect(callOrder).toEqual(['relaunch', 'exit'])
    })
  })

  describe('getLocale', () => {
    it('should return the app locale', () => {
      const service = new AppService()
      const locale = service.getLocale()
      expect(locale).toBe('en-US')
      expect(mockApp.getLocale).toHaveBeenCalled()
    })
  })

  describe('setLocale', () => {
    it('should store the locale value', () => {
      const service = new AppService()
      service.setLocale('zh-CN')
      // After setting, getLocale should return the set value
      expect(service.getLocale()).toBe('zh-CN')
    })

    it('should accept any valid locale string', () => {
      const service = new AppService()
      service.setLocale('ja-JP')
      expect(service.getLocale()).toBe('ja-JP')
    })
  })

  describe('getDataPath', () => {
    it('should return the userData path', () => {
      const service = new AppService()
      const path = service.getDataPath()
      expect(path).toBe('/mock/user/data')
      expect(mockApp.getPath).toHaveBeenCalledWith('userData')
    })
  })
})
