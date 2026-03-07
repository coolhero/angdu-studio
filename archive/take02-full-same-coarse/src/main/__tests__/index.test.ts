import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockMainWindow = {
  show: vi.fn(),
  focus: vi.fn(),
  isDestroyed: vi.fn().mockReturnValue(false),
  isMinimized: vi.fn().mockReturnValue(false),
  restore: vi.fn(),
  webContents: { send: vi.fn() }
}

let whenReadyCallback: (() => Promise<void>) | null = null

const mockApp = {
  requestSingleInstanceLock: vi.fn().mockReturnValue(true),
  quit: vi.fn(),
  on: vi.fn(),
  whenReady: vi.fn().mockImplementation(() => {
    const promise = Promise.resolve()
    const original = promise.then.bind(promise)
    // biome-ignore lint/suspicious/noThenProperty: mocking Electron's app.whenReady() thenable
    promise.then = (cb: () => Promise<void>) => {
      whenReadyCallback = cb
      return original(() => undefined)
    }
    return promise
  }),
  isQuitting: false
}

const mockBootstrap = vi.fn().mockResolvedValue(mockMainWindow)

// Mock process.exit to prevent test runner from exiting
const mockProcessExit = vi.spyOn(process, 'exit').mockImplementation((() => {}) as never)

vi.mock('electron', () => ({
  app: mockApp,
  BrowserWindow: vi.fn()
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

vi.mock('../bootstrap', () => ({
  bootstrap: mockBootstrap
}))

vi.mock('@main/services/WindowService', () => ({
  windowService: {
    getMainWindow: vi.fn().mockReturnValue(mockMainWindow),
    createMainWindow: vi.fn().mockReturnValue(mockMainWindow),
    showMainWindow: vi.fn()
  }
}))

vi.mock('@main/services/PowerMonitorService', () => ({
  powerMonitorService: {
    init: vi.fn(),
    onStateChange: vi.fn()
  }
}))

describe('Main Entry (index.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    whenReadyCallback = null
    mockProcessExit.mockClear()
  })

  describe('single-instance lock', () => {
    it('should request single instance lock', async () => {
      mockApp.requestSingleInstanceLock.mockReturnValue(true)
      vi.resetModules()
      await import('../index')
      expect(mockApp.requestSingleInstanceLock).toHaveBeenCalled()
    })

    it('should quit if single instance lock is not acquired', async () => {
      mockApp.requestSingleInstanceLock.mockReturnValueOnce(false)
      vi.resetModules()
      await import('../index')
      expect(mockApp.quit).toHaveBeenCalled()
    })
  })

  describe('second-instance event', () => {
    it('should register a second-instance event handler', async () => {
      mockApp.requestSingleInstanceLock.mockReturnValue(true)
      vi.resetModules()
      await import('../index')

      expect(mockApp.on).toHaveBeenCalledWith('second-instance', expect.any(Function))
    })

    it('should focus existing window on second-instance event', async () => {
      mockApp.requestSingleInstanceLock.mockReturnValue(true)
      vi.resetModules()
      await import('../index')

      const secondInstanceCall = mockApp.on.mock.calls.find((call: unknown[]) => call[0] === 'second-instance')
      expect(secondInstanceCall).toBeDefined()

      if (secondInstanceCall) {
        const handler = secondInstanceCall[1] as () => void
        handler()
        const { windowService } = await import('@main/services/WindowService')
        expect(windowService.showMainWindow).toHaveBeenCalled()
      }
    })
  })

  describe('app ready lifecycle', () => {
    it('should call app.whenReady()', async () => {
      mockApp.requestSingleInstanceLock.mockReturnValue(true)
      vi.resetModules()
      await import('../index')
      expect(mockApp.whenReady).toHaveBeenCalled()
    })

    it('should call bootstrap after app is ready', async () => {
      mockApp.requestSingleInstanceLock.mockReturnValue(true)
      vi.resetModules()
      await import('../index')

      // Execute the whenReady callback
      if (whenReadyCallback) {
        await whenReadyCallback()
      }
      expect(mockBootstrap).toHaveBeenCalled()
    })

    it('should initialize power monitor after bootstrap', async () => {
      mockApp.requestSingleInstanceLock.mockReturnValue(true)
      vi.resetModules()
      await import('../index')

      if (whenReadyCallback) {
        await whenReadyCallback()
      }

      const { powerMonitorService } = await import('@main/services/PowerMonitorService')
      expect(powerMonitorService.init).toHaveBeenCalled()
    })
  })

  describe('activate event (macOS)', () => {
    it('should register activate handler after app is ready', async () => {
      mockApp.requestSingleInstanceLock.mockReturnValue(true)
      vi.resetModules()
      await import('../index')

      // activate is registered inside whenReady callback
      if (whenReadyCallback) {
        await whenReadyCallback()
      }

      expect(mockApp.on).toHaveBeenCalledWith('activate', expect.any(Function))
    })
  })

  describe('window-all-closed event', () => {
    it('should register window-all-closed handler', async () => {
      mockApp.requestSingleInstanceLock.mockReturnValue(true)
      vi.resetModules()
      await import('../index')
      expect(mockApp.on).toHaveBeenCalledWith('window-all-closed', expect.any(Function))
    })

    it('should quit on non-macOS when all windows are closed', async () => {
      mockApp.requestSingleInstanceLock.mockReturnValue(true)
      vi.resetModules()
      await import('../index')

      const windowAllClosedCall = mockApp.on.mock.calls.find((call: unknown[]) => call[0] === 'window-all-closed')
      expect(windowAllClosedCall).toBeDefined()

      if (windowAllClosedCall) {
        mockApp.quit.mockClear()
        const handler = windowAllClosedCall[1] as () => void
        handler()
        // isMac is false in our mock, so app.quit should be called
        expect(mockApp.quit).toHaveBeenCalled()
      }
    })
  })

  describe('before-quit event', () => {
    it('should register before-quit handler', async () => {
      mockApp.requestSingleInstanceLock.mockReturnValue(true)
      vi.resetModules()
      await import('../index')
      expect(mockApp.on).toHaveBeenCalledWith('before-quit', expect.any(Function))
    })

    it('should set isQuitting flag on before-quit', async () => {
      mockApp.requestSingleInstanceLock.mockReturnValue(true)
      vi.resetModules()
      await import('../index')

      const beforeQuitCall = mockApp.on.mock.calls.find((call: unknown[]) => call[0] === 'before-quit')
      expect(beforeQuitCall).toBeDefined()

      if (beforeQuitCall) {
        const handler = beforeQuitCall[1] as () => void
        handler()
        expect(mockApp.isQuitting).toBe(true)
      }
    })
  })
})
