import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock electron before importing anything that depends on it
const mockBrowserWindowInstance = {
  show: vi.fn(),
  focus: vi.fn(),
  hide: vi.fn(),
  close: vi.fn(),
  minimize: vi.fn(),
  maximize: vi.fn(),
  unmaximize: vi.fn(),
  isMaximized: vi.fn().mockReturnValue(false),
  isDestroyed: vi.fn().mockReturnValue(false),
  isVisible: vi.fn().mockReturnValue(true),
  loadURL: vi.fn(),
  loadFile: vi.fn(),
  setSize: vi.fn(),
  on: vi.fn(),
  once: vi.fn(),
  webContents: {
    openDevTools: vi.fn(),
    setWindowOpenHandler: vi.fn(),
    on: vi.fn(),
    session: {
      webRequest: {
        onHeadersReceived: vi.fn()
      }
    },
    send: vi.fn()
  }
}

const MockBrowserWindow = vi.fn().mockReturnValue(mockBrowserWindowInstance)

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/mock/user/data'),
    isPackaged: false,
    dock: { show: vi.fn(), hide: vi.fn() }
  },
  BrowserWindow: MockBrowserWindow,
  nativeTheme: {
    shouldUseDarkColors: false
  },
  shell: {
    openExternal: vi.fn()
  }
}))

const mockManage = vi.fn()
const mockWindowStateKeeper = vi.fn().mockReturnValue({
  x: 100,
  y: 100,
  width: 1200,
  height: 800,
  manage: mockManage
})

vi.mock('electron-window-state', () => ({
  default: mockWindowStateKeeper
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

vi.mock('@main/config', () => ({
  titleBarOverlayDark: { height: 42, color: '#1a1a1a', symbolColor: '#ffffff' },
  titleBarOverlayLight: { height: 42, color: '#ffffff', symbolColor: '#000000' }
}))

vi.mock('@shared/config/index', () => ({
  DEFAULT_WINDOW_WIDTH: 1200,
  DEFAULT_WINDOW_HEIGHT: 800,
  MIN_WINDOW_WIDTH: 800,
  MIN_WINDOW_HEIGHT: 600
}))

describe('WindowService', () => {
  let WindowService: typeof import('../WindowService').WindowService

  beforeEach(async () => {
    vi.clearAllMocks()
    MockBrowserWindow.mockReturnValue(mockBrowserWindowInstance)
    mockWindowStateKeeper.mockReturnValue({
      x: 100,
      y: 100,
      width: 1200,
      height: 800,
      manage: mockManage
    })
    // Reset singleton between tests
    vi.resetModules()
    const mod = await import('../WindowService')
    WindowService = mod.WindowService
  })

  afterEach(() => {
    // Note: Do not use vi.restoreAllMocks() or vi.resetAllMocks() here
    // as they clear mock implementations set via mockReturnValue on
    // externally-defined mocks (MockBrowserWindow, mockWindowStateKeeper).
  })

  describe('singleton', () => {
    it('should return the same instance', () => {
      const instance1 = WindowService.getInstance()
      const instance2 = WindowService.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('createMainWindow', () => {
    it('should create a BrowserWindow with default dimensions (1200x800)', () => {
      const service = WindowService.getInstance()
      service.createMainWindow()

      expect(mockWindowStateKeeper).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultWidth: 1200,
          defaultHeight: 800
        })
      )
    })

    it('should enforce minimum size (800x600)', () => {
      const service = WindowService.getInstance()
      service.createMainWindow()

      expect(MockBrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          minWidth: 800,
          minHeight: 600
        })
      )
    })

    it('should configure BrowserWindow with preload script', () => {
      const service = WindowService.getInstance()
      service.createMainWindow()

      const options = MockBrowserWindow.mock.calls[0][0]
      expect(options.webPreferences).toBeDefined()
      expect(options.webPreferences.preload).toBeDefined()
      expect(typeof options.webPreferences.preload).toBe('string')
    })

    it('should configure BrowserWindow with contextIsolation enabled', () => {
      const service = WindowService.getInstance()
      service.createMainWindow()

      const options = MockBrowserWindow.mock.calls[0][0]
      expect(options.webPreferences.contextIsolation).toBe(true)
    })

    it('should configure BrowserWindow with webSecurity disabled', () => {
      const service = WindowService.getInstance()
      service.createMainWindow()

      const options = MockBrowserWindow.mock.calls[0][0]
      expect(options.webPreferences.webSecurity).toBe(false)
    })

    it('should use electron-window-state for position and size', () => {
      const service = WindowService.getInstance()
      service.createMainWindow()

      expect(MockBrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          x: 100,
          y: 100,
          width: 1200,
          height: 800
        })
      )
    })

    it('should call windowState.manage() for persistence', () => {
      const service = WindowService.getInstance()
      service.createMainWindow()

      expect(mockManage).toHaveBeenCalledWith(mockBrowserWindowInstance)
    })

    it('should return the created BrowserWindow', () => {
      const service = WindowService.getInstance()
      const win = service.createMainWindow()
      expect(win).toBe(mockBrowserWindowInstance)
    })

    it('should not create a new window if one already exists', () => {
      const service = WindowService.getInstance()
      service.createMainWindow()
      MockBrowserWindow.mockClear()

      service.createMainWindow()
      expect(MockBrowserWindow).not.toHaveBeenCalled()
    })

    it('should show and focus existing window if one already exists', () => {
      const service = WindowService.getInstance()
      service.createMainWindow()
      mockBrowserWindowInstance.show.mockClear()
      mockBrowserWindowInstance.focus.mockClear()

      service.createMainWindow()
      expect(mockBrowserWindowInstance.show).toHaveBeenCalled()
      expect(mockBrowserWindowInstance.focus).toHaveBeenCalled()
    })
  })

  describe('window state persistence', () => {
    it('should save bounds on close via windowState.manage()', () => {
      const service = WindowService.getInstance()
      service.createMainWindow()

      // electron-window-state's manage() automatically handles save on close
      expect(mockManage).toHaveBeenCalledWith(mockBrowserWindowInstance)
    })

    it('should restore position from window state on create', () => {
      mockWindowStateKeeper.mockReturnValueOnce({
        x: 200,
        y: 300,
        width: 1000,
        height: 700,
        manage: mockManage
      })

      const service = WindowService.getInstance()
      service.createMainWindow()

      expect(MockBrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          x: 200,
          y: 300,
          width: 1000,
          height: 700
        })
      )
    })
  })

  describe('getMainWindow', () => {
    it('should return null when no window is created', () => {
      const service = WindowService.getInstance()
      expect(service.getMainWindow()).toBeNull()
    })

    it('should return the main window after creation', () => {
      const service = WindowService.getInstance()
      service.createMainWindow()
      expect(service.getMainWindow()).toBe(mockBrowserWindowInstance)
    })
  })

  describe('platform-specific configuration', () => {
    it('should create window with show: false initially', () => {
      const service = WindowService.getInstance()
      service.createMainWindow()

      expect(MockBrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          show: false
        })
      )
    })

    it('should hide menu bar by default', () => {
      const service = WindowService.getInstance()
      service.createMainWindow()

      expect(MockBrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          autoHideMenuBar: true
        })
      )
    })
  })

  describe('macOS-specific configuration', () => {
    beforeEach(async () => {
      vi.doMock('@main/constant', () => ({
        isMac: true,
        isWin: false,
        isLinux: false,
        isDev: false
      }))
      vi.resetModules()
      const mod = await import('../WindowService')
      WindowService = mod.WindowService
    })

    it('should use hidden titleBarStyle on macOS', () => {
      const service = WindowService.getInstance()
      service.createMainWindow()

      expect(MockBrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          titleBarStyle: 'hidden'
        })
      )
    })

    it('should set trafficLightPosition on macOS', () => {
      const service = WindowService.getInstance()
      service.createMainWindow()

      const options = MockBrowserWindow.mock.calls[0][0]
      expect(options.trafficLightPosition).toBeDefined()
      expect(options.trafficLightPosition.x).toBeGreaterThanOrEqual(0)
      expect(options.trafficLightPosition.y).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Windows/Linux-specific configuration', () => {
    beforeEach(async () => {
      vi.doMock('@main/constant', () => ({
        isMac: false,
        isWin: true,
        isLinux: false,
        isDev: false
      }))
      vi.resetModules()
      const mod = await import('../WindowService')
      WindowService = mod.WindowService
    })

    it('should use frameless window on Windows', () => {
      const service = WindowService.getInstance()
      service.createMainWindow()

      expect(MockBrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          frame: false
        })
      )
    })
  })
})
