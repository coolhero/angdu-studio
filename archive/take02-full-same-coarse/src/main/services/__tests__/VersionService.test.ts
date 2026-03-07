import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockApp = {
  getVersion: vi.fn().mockReturnValue('1.0.0')
}

vi.mock('electron', () => ({
  app: mockApp
}))

const mockConfigManager = {
  getUpdateChannel: vi.fn().mockReturnValue('stable'),
  setUpdateChannel: vi.fn()
}

vi.mock('../ConfigManager', () => ({
  configManager: mockConfigManager
}))

vi.mock('../LoggerService', () => ({
  loggerService: {
    withContext: vi.fn().mockReturnValue({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn()
    })
  }
}))

describe('VersionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockApp.getVersion.mockReturnValue('1.0.0')
    mockConfigManager.getUpdateChannel.mockReturnValue('stable')
  })

  async function createVersionService() {
    const mod = await import('../VersionService')
    return mod.versionService
  }

  describe('getVersion', () => {
    it('should return app.getVersion()', async () => {
      const service = await createVersionService()
      const version = service.getVersion()
      expect(version).toBe('1.0.0')
      expect(mockApp.getVersion).toHaveBeenCalled()
    })

    it('should return the correct version string', async () => {
      mockApp.getVersion.mockReturnValue('2.5.3')
      const service = await createVersionService()
      expect(service.getVersion()).toBe('2.5.3')
    })
  })

  describe('getUpdateChannel', () => {
    it('should return channel from ConfigManager', async () => {
      mockConfigManager.getUpdateChannel.mockReturnValue('stable')
      const service = await createVersionService()
      expect(service.getUpdateChannel()).toBe('stable')
    })

    it('should return beta when configured', async () => {
      mockConfigManager.getUpdateChannel.mockReturnValue('beta')
      const service = await createVersionService()
      expect(service.getUpdateChannel()).toBe('beta')
    })

    it('should return rc when configured', async () => {
      mockConfigManager.getUpdateChannel.mockReturnValue('rc')
      const service = await createVersionService()
      expect(service.getUpdateChannel()).toBe('rc')
    })
  })

  describe('setUpdateChannel', () => {
    it('should persist channel via ConfigManager', async () => {
      const service = await createVersionService()
      service.setUpdateChannel('beta')
      expect(mockConfigManager.setUpdateChannel).toHaveBeenCalledWith('beta')
    })

    it('should persist stable channel', async () => {
      const service = await createVersionService()
      service.setUpdateChannel('stable')
      expect(mockConfigManager.setUpdateChannel).toHaveBeenCalledWith('stable')
    })

    it('should persist rc channel', async () => {
      const service = await createVersionService()
      service.setUpdateChannel('rc')
      expect(mockConfigManager.setUpdateChannel).toHaveBeenCalledWith('rc')
    })
  })

  describe('getFeedUrl', () => {
    it('should construct feed URL for stable channel', async () => {
      const service = await createVersionService()
      const url = service.getFeedUrl('stable')
      expect(url).toContain('stable')
      expect(typeof url).toBe('string')
    })

    it('should construct feed URL for beta channel', async () => {
      const service = await createVersionService()
      const url = service.getFeedUrl('beta')
      expect(url).toContain('beta')
    })

    it('should construct feed URL for rc channel', async () => {
      const service = await createVersionService()
      const url = service.getFeedUrl('rc')
      expect(url).toContain('rc')
    })

    it('should return different URLs for different channels', async () => {
      const service = await createVersionService()
      const stableUrl = service.getFeedUrl('stable')
      const betaUrl = service.getFeedUrl('beta')
      const rcUrl = service.getFeedUrl('rc')

      expect(stableUrl).not.toBe(betaUrl)
      expect(stableUrl).not.toBe(rcUrl)
      expect(betaUrl).not.toBe(rcUrl)
    })
  })
})
