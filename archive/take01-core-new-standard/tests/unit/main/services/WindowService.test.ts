import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock electron
const mockBrowserWindow = {
  getBounds: vi.fn().mockReturnValue({ width: 1200, height: 800, x: 100, y: 100 }),
  isMaximized: vi.fn().mockReturnValue(false),
  isMinimized: vi.fn().mockReturnValue(false),
  isVisible: vi.fn().mockReturnValue(true),
  maximize: vi.fn(),
  minimize: vi.fn(),
  restore: vi.fn(),
  show: vi.fn(),
  hide: vi.fn(),
  focus: vi.fn(),
  close: vi.fn(),
  on: vi.fn(),
  webContents: {
    setWindowOpenHandler: vi.fn()
  }
}

vi.mock('electron', () => ({
  BrowserWindow: vi.fn().mockImplementation(() => mockBrowserWindow),
  nativeTheme: { shouldUseDarkColors: false },
  Tray: vi.fn().mockImplementation(() => ({
    setToolTip: vi.fn(),
    setContextMenu: vi.fn(),
    on: vi.fn()
  })),
  Menu: {
    buildFromTemplate: vi.fn().mockReturnValue({})
  },
  app: {
    requestSingleInstanceLock: vi.fn().mockReturnValue(true),
    quit: vi.fn()
  }
}))

// Mock platform utils
vi.mock('@main/utils/platform', () => ({
  isMacOS: vi.fn().mockReturnValue(false)
}))

import { app } from 'electron'
import { WindowService } from '@main/services/WindowService'

describe('WindowService', () => {
  let windowService: WindowService

  beforeEach(() => {
    vi.clearAllMocks()
    windowService = new WindowService()
  })

  describe('acquireLock', () => {
    it('returns true when lock is acquired', () => {
      vi.mocked(app.requestSingleInstanceLock).mockReturnValue(true)
      expect(windowService.acquireLock()).toBe(true)
    })

    it('returns false when another instance is running', () => {
      vi.mocked(app.requestSingleInstanceLock).mockReturnValue(false)
      expect(windowService.acquireLock()).toBe(false)
    })
  })

  describe('loadWindowState', () => {
    it('loads partial window state', () => {
      windowService.loadWindowState({ width: 1400, height: 900 })
      const state = windowService.getWindowState()
      expect(state.width).toBe(1400)
      expect(state.height).toBe(900)
      expect(state.isMaximized).toBe(false)
    })

    it('uses defaults when state is undefined', () => {
      windowService.loadWindowState(undefined)
      const state = windowService.getWindowState()
      expect(state.width).toBe(1200)
      expect(state.height).toBe(800)
    })
  })

  describe('createMainWindow', () => {
    it('creates a BrowserWindow', () => {
      const win = windowService.createMainWindow()
      expect(win).toBeDefined()
    })
  })

  describe('getMainWindow', () => {
    it('returns null before window is created', () => {
      expect(windowService.getMainWindow()).toBeNull()
    })

    it('returns the window after creation', () => {
      windowService.createMainWindow()
      expect(windowService.getMainWindow()).toBeDefined()
    })
  })

  describe('getWindowState', () => {
    it('returns default state when no window exists', () => {
      const state = windowService.getWindowState()
      expect(state.width).toBe(1200)
      expect(state.height).toBe(800)
      expect(state.isMaximized).toBe(false)
    })

    it('returns current window bounds when window exists', () => {
      windowService.createMainWindow()
      const state = windowService.getWindowState()
      expect(state.width).toBe(1200)
      expect(state.height).toBe(800)
      expect(state.x).toBe(100)
      expect(state.y).toBe(100)
    })
  })

  describe('show', () => {
    it('shows and focuses the window', () => {
      windowService.createMainWindow()
      windowService.show()
      expect(mockBrowserWindow.show).toHaveBeenCalled()
      expect(mockBrowserWindow.focus).toHaveBeenCalled()
    })

    it('restores minimized window before showing', () => {
      mockBrowserWindow.isMinimized.mockReturnValue(true)
      windowService.createMainWindow()
      windowService.show()
      expect(mockBrowserWindow.restore).toHaveBeenCalled()
    })
  })

  describe('hide', () => {
    it('hides the window', () => {
      windowService.createMainWindow()
      windowService.hide()
      expect(mockBrowserWindow.hide).toHaveBeenCalled()
    })
  })

  describe('toggle', () => {
    it('hides when visible', () => {
      mockBrowserWindow.isVisible.mockReturnValue(true)
      windowService.createMainWindow()
      windowService.toggle()
      expect(mockBrowserWindow.hide).toHaveBeenCalled()
    })

    it('shows when hidden', () => {
      mockBrowserWindow.isVisible.mockReturnValue(false)
      windowService.createMainWindow()
      windowService.toggle()
      expect(mockBrowserWindow.show).toHaveBeenCalled()
    })
  })

  describe('isMaximized', () => {
    it('returns false when no window', () => {
      expect(windowService.isMaximized()).toBe(false)
    })

    it('delegates to BrowserWindow.isMaximized', () => {
      mockBrowserWindow.isMaximized.mockReturnValue(true)
      windowService.createMainWindow()
      expect(windowService.isMaximized()).toBe(true)
    })
  })
})
