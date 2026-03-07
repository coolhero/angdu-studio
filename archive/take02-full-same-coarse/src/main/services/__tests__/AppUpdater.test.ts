import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockAutoUpdater = {
  checkForUpdates: vi.fn(),
  downloadUpdate: vi.fn(),
  quitAndInstall: vi.fn(),
  setFeedURL: vi.fn(),
  on: vi.fn(),
  autoDownload: true,
  autoInstallOnAppQuit: true,
  channel: 'latest'
}

vi.mock('electron-updater', () => ({
  autoUpdater: mockAutoUpdater
}))

const mockSend = vi.fn()
const mockBrowserWindow = {
  getAllWindows: vi.fn().mockReturnValue([{ webContents: { send: mockSend } }])
}

vi.mock('electron', () => ({
  BrowserWindow: mockBrowserWindow
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

describe('AppUpdater', () => {
  let eventHandlers: Record<string, (...args: unknown[]) => void>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    eventHandlers = {}
    mockAutoUpdater.on.mockImplementation((event: string, handler: (...args: unknown[]) => void) => {
      eventHandlers[event] = handler
      return mockAutoUpdater
    })
    mockAutoUpdater.checkForUpdates.mockResolvedValue({
      updateInfo: {
        version: '2.0.0',
        releaseDate: '2026-03-01',
        releaseNotes: 'New features',
        releaseName: 'v2.0.0'
      }
    })
    mockConfigManager.getUpdateChannel.mockReturnValue('stable')
    mockBrowserWindow.getAllWindows.mockReturnValue([{ webContents: { send: mockSend } }])
  })

  async function createAppUpdater() {
    const mod = await import('../AppUpdater')
    return mod.appUpdater
  }

  describe('init', () => {
    it('should configure autoUpdater with autoDownload disabled', async () => {
      const updater = await createAppUpdater()
      updater.init()
      expect(mockAutoUpdater.autoDownload).toBe(false)
    })

    it('should register event listeners on autoUpdater', async () => {
      const updater = await createAppUpdater()
      updater.init()

      expect(mockAutoUpdater.on).toHaveBeenCalledWith('update-available', expect.any(Function))
      expect(mockAutoUpdater.on).toHaveBeenCalledWith('update-not-available', expect.any(Function))
      expect(mockAutoUpdater.on).toHaveBeenCalledWith('download-progress', expect.any(Function))
      expect(mockAutoUpdater.on).toHaveBeenCalledWith('update-downloaded', expect.any(Function))
      expect(mockAutoUpdater.on).toHaveBeenCalledWith('error', expect.any(Function))
    })
  })

  describe('checkForUpdates', () => {
    it('should call autoUpdater.checkForUpdates()', async () => {
      const updater = await createAppUpdater()
      updater.init()
      await updater.checkForUpdates()
      expect(mockAutoUpdater.checkForUpdates).toHaveBeenCalled()
    })

    it('should return UpdateInfo when update is available', async () => {
      mockAutoUpdater.checkForUpdates.mockResolvedValue({
        updateInfo: {
          version: '2.0.0',
          releaseDate: '2026-03-01',
          releaseNotes: 'New features'
        }
      })

      const updater = await createAppUpdater()
      updater.init()
      const result = await updater.checkForUpdates()

      expect(result).toBeDefined()
      expect(result?.version).toBe('2.0.0')
    })

    it('should return null when no update is available', async () => {
      mockAutoUpdater.checkForUpdates.mockResolvedValue(null)

      const updater = await createAppUpdater()
      updater.init()
      const result = await updater.checkForUpdates()

      expect(result).toBeNull()
    })

    it('should return null on network failure', async () => {
      mockAutoUpdater.checkForUpdates.mockRejectedValue(new Error('Network error'))

      const updater = await createAppUpdater()
      updater.init()
      const result = await updater.checkForUpdates()

      expect(result).toBeNull()
    })
  })

  describe('downloadUpdate', () => {
    it('should call autoUpdater.downloadUpdate()', async () => {
      const updater = await createAppUpdater()
      updater.init()
      updater.downloadUpdate()
      expect(mockAutoUpdater.downloadUpdate).toHaveBeenCalled()
    })
  })

  describe('installUpdate', () => {
    it('should call autoUpdater.quitAndInstall()', async () => {
      const updater = await createAppUpdater()
      updater.init()
      updater.installUpdate()
      expect(mockAutoUpdater.quitAndInstall).toHaveBeenCalled()
    })
  })

  describe('event forwarding', () => {
    it('should forward update-available event to renderer', async () => {
      const updater = await createAppUpdater()
      updater.init()

      const updateInfo = {
        version: '2.0.0',
        releaseDate: '2026-03-01',
        releaseNotes: 'New features'
      }
      eventHandlers['update-available'](updateInfo)

      expect(mockSend).toHaveBeenCalledWith(
        'app:update-available',
        expect.objectContaining({
          version: '2.0.0'
        })
      )
    })

    it('should forward download-progress event to renderer', async () => {
      const updater = await createAppUpdater()
      updater.init()

      const progressInfo = {
        percent: 50,
        bytesPerSecond: 1000,
        total: 10000,
        transferred: 5000
      }
      eventHandlers['download-progress'](progressInfo)

      expect(mockSend).toHaveBeenCalledWith('app:update-progress', progressInfo)
    })

    it('should forward update-downloaded event to renderer', async () => {
      const updater = await createAppUpdater()
      updater.init()

      const updateInfo = {
        version: '2.0.0',
        releaseDate: '2026-03-01',
        releaseNotes: 'Ready to install'
      }
      eventHandlers['update-downloaded'](updateInfo)

      expect(mockSend).toHaveBeenCalledWith(
        'app:update-downloaded',
        expect.objectContaining({
          version: '2.0.0'
        })
      )
    })

    it('should forward error event to renderer', async () => {
      const updater = await createAppUpdater()
      updater.init()

      const error = new Error('Update failed')
      eventHandlers.error(error)

      expect(mockSend).toHaveBeenCalledWith('app:update-error', error.message)
    })

    it('should not fail when no windows are open during event forwarding', async () => {
      mockBrowserWindow.getAllWindows.mockReturnValue([])

      const updater = await createAppUpdater()
      updater.init()

      expect(() => {
        eventHandlers['update-available']({ version: '2.0.0' })
      }).not.toThrow()
    })
  })

  describe('error handling', () => {
    it('should handle network failures gracefully in checkForUpdates', async () => {
      mockAutoUpdater.checkForUpdates.mockRejectedValue(new Error('ENOTFOUND'))

      const updater = await createAppUpdater()
      updater.init()
      const result = await updater.checkForUpdates()

      expect(result).toBeNull()
    })

    it('should handle timeout errors gracefully', async () => {
      mockAutoUpdater.checkForUpdates.mockRejectedValue(new Error('ETIMEDOUT'))

      const updater = await createAppUpdater()
      updater.init()
      const result = await updater.checkForUpdates()

      expect(result).toBeNull()
    })
  })
})
