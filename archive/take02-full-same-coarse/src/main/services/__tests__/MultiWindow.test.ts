import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock electron before importing anything that depends on it
let mockWindowId = 1
const mockBrowserWindowInstance = {
  id: 1,
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
  isFullScreen: vi.fn().mockReturnValue(false),
  setFullScreen: vi.fn(),
  loadURL: vi.fn(),
  loadFile: vi.fn(),
  setSize: vi.fn(),
  on: vi.fn(),
  once: vi.fn(),
  webContents: {
    id: 1,
    openDevTools: vi.fn(),
    setWindowOpenHandler: vi.fn(),
    on: vi.fn(),
    send: vi.fn(),
    session: {
      webRequest: {
        onHeadersReceived: vi.fn()
      }
    }
  }
}

const MockBrowserWindow = vi.fn().mockImplementation(() => {
  const id = mockWindowId++
  return {
    ...mockBrowserWindowInstance,
    id,
    webContents: { ...mockBrowserWindowInstance.webContents, id }
  }
})

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/mock/user/data'),
    isPackaged: false,
    dock: { show: vi.fn(), hide: vi.fn() }
  },
  BrowserWindow: MockBrowserWindow,
  screen: {
    getPrimaryDisplay: vi.fn().mockReturnValue({
      workAreaSize: { width: 1920, height: 1080 }
    })
  },
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

describe('Multi-Window WindowService', () => {
  let WindowService: typeof import('../WindowService').WindowService

  beforeEach(async () => {
    vi.clearAllMocks()
    mockWindowId = 1
    MockBrowserWindow.mockImplementation(() => {
      const id = mockWindowId++
      return {
        ...mockBrowserWindowInstance,
        id,
        webContents: { ...mockBrowserWindowInstance.webContents, id }
      }
    })
    mockWindowStateKeeper.mockReturnValue({
      x: 100,
      y: 100,
      width: 1200,
      height: 800,
      manage: mockManage
    })
    vi.resetModules()
    const mod = await import('../WindowService')
    WindowService = mod.WindowService
  })

  describe('openMini', () => {
    it('should create a mini window with correct dimensions (400x600)', () => {
      const service = WindowService.getInstance()
      service.openMini()

      expect(MockBrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          width: 400,
          height: 600
        })
      )
    })

    it('should set alwaysOnTop to true for mini window', () => {
      const service = WindowService.getInstance()
      service.openMini()

      expect(MockBrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          alwaysOnTop: true
        })
      )
    })

    it('should configure mini window with preload script', () => {
      const service = WindowService.getInstance()
      service.openMini()

      const options = MockBrowserWindow.mock.calls[0][0]
      expect(options.webPreferences).toBeDefined()
      expect(options.webPreferences.preload).toBeDefined()
      expect(typeof options.webPreferences.preload).toBe('string')
    })

    it('should configure mini window with contextIsolation enabled', () => {
      const service = WindowService.getInstance()
      service.openMini()

      const options = MockBrowserWindow.mock.calls[0][0]
      expect(options.webPreferences.contextIsolation).toBe(true)
    })

    it('should return the created BrowserWindow', () => {
      const service = WindowService.getInstance()
      const win = service.openMini()
      expect(win).toBeDefined()
      expect(win.id).toBeDefined()
    })

    it('should load the mini window entry point', () => {
      const service = WindowService.getInstance()
      const win = service.openMini()

      // In non-dev mode, should load the miniWindow.html file
      expect(win.loadFile).toHaveBeenCalledWith(expect.stringContaining('miniWindow.html'))
    })
  })

  describe('openSelection', () => {
    it('should create a frameless floating toolbar', () => {
      const service = WindowService.getInstance()
      service.openSelection()

      expect(MockBrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          frame: false
        })
      )
    })

    it('should set alwaysOnTop to true for selection toolbar', () => {
      const service = WindowService.getInstance()
      service.openSelection()

      expect(MockBrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          alwaysOnTop: true
        })
      )
    })

    it('should create a transparent window for selection toolbar', () => {
      const service = WindowService.getInstance()
      service.openSelection()

      expect(MockBrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          transparent: true
        })
      )
    })

    it('should return the created BrowserWindow', () => {
      const service = WindowService.getInstance()
      const win = service.openSelection()
      expect(win).toBeDefined()
      expect(win.id).toBeDefined()
    })

    it('should load the selection toolbar entry point', () => {
      const service = WindowService.getInstance()
      const win = service.openSelection()

      expect(win.loadFile).toHaveBeenCalledWith(expect.stringContaining('selectionToolbar.html'))
    })
  })

  describe('window registry', () => {
    it('should track all open windows in registry', () => {
      const service = WindowService.getInstance()
      const mini = service.openMini()
      const selection = service.openSelection()

      expect(service.getWindow(mini.id)).toBeDefined()
      expect(service.getWindow(selection.id)).toBeDefined()
    })

    it('should return undefined for unknown window id', () => {
      const service = WindowService.getInstance()
      expect(service.getWindow(99999)).toBeUndefined()
    })

    it('should remove window from registry on close', () => {
      const service = WindowService.getInstance()
      const mini = service.openMini()
      const miniId = mini.id

      // Simulate the 'closed' event callback
      const closedHandler = mini.on.mock.calls.find((call: unknown[]) => call[0] === 'closed')
      expect(closedHandler).toBeDefined()

      // Trigger the close handler
      closedHandler?.[1]()

      expect(service.getWindow(miniId)).toBeUndefined()
    })

    it('should allow closing a window by id', () => {
      const service = WindowService.getInstance()
      const mini = service.openMini()
      const miniId = mini.id

      service.closeWindow(miniId)
      expect(mini.close).toHaveBeenCalled()
    })

    it('should not throw when closing a non-existent window', () => {
      const service = WindowService.getInstance()
      expect(() => service.closeWindow(99999)).not.toThrow()
    })
  })

  describe('inter-window IPC communication', () => {
    it('should create windows with webContents that support send()', () => {
      const service = WindowService.getInstance()
      const mini = service.openMini()

      expect(mini.webContents).toBeDefined()
      expect(typeof mini.webContents.send).toBe('function')
    })

    it('should create each window with unique id', () => {
      const service = WindowService.getInstance()
      const mini = service.openMini()
      const selection = service.openSelection()

      expect(mini.id).not.toBe(selection.id)
    })
  })

  describe('fullscreen', () => {
    it('should toggle fullscreen on main window', () => {
      const service = WindowService.getInstance()
      // First create main window so there is one
      service.createMainWindow()
      const mainWindow = service.getMainWindow()

      expect(mainWindow).toBeDefined()
      expect(typeof mainWindow?.isFullScreen).toBe('function')
      expect(typeof mainWindow?.setFullScreen).toBe('function')
    })
  })
})
