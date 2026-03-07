import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockBrowserWindow, mockScreen, mockWin } = vi.hoisted(() => {
  const mockWin = {
    show: vi.fn(),
    hide: vi.fn(),
    close: vi.fn(),
    focus: vi.fn(),
    minimize: vi.fn(),
    maximize: vi.fn(),
    unmaximize: vi.fn(),
    restore: vi.fn(),
    isMaximized: vi.fn().mockReturnValue(false),
    isMinimized: vi.fn().mockReturnValue(false),
    isVisible: vi.fn().mockReturnValue(true),
    isDestroyed: vi.fn().mockReturnValue(false),
    getSize: vi.fn().mockReturnValue([1280, 800]),
    setMinimumSize: vi.fn(),
    on: vi.fn(),
    webContents: { on: vi.fn(), send: vi.fn(), reload: vi.fn() },
    loadFile: vi.fn(),
    loadURL: vi.fn()
  }
  const mockBrowserWindow = vi.fn().mockImplementation(() => mockWin)
  ;(mockBrowserWindow as any).getAllWindows = vi.fn().mockReturnValue([])
  const mockScreen = {
    getPrimaryDisplay: vi.fn().mockReturnValue({
      workAreaSize: { width: 1920, height: 1080 }
    })
  }
  return { mockBrowserWindow, mockScreen, mockWin }
})

vi.mock('electron', () => ({
  BrowserWindow: mockBrowserWindow,
  screen: mockScreen,
  app: {
    getPath: vi.fn().mockReturnValue('/mock/user-data'),
    getName: vi.fn().mockReturnValue('Cherry Studio'),
    quit: vi.fn()
  }
}))

vi.mock('electron-window-state', () => ({
  default: vi.fn().mockReturnValue({
    x: 100, y: 100, width: 1280, height: 800, isMaximized: false, manage: vi.fn()
  })
}))

import { WindowService } from '../WindowService'

describe('WindowService', () => {
  let service: WindowService

  beforeEach(() => {
    vi.clearAllMocks()
    mockBrowserWindow.mockImplementation(() => mockWin)
    ;(mockBrowserWindow as any).getAllWindows = vi.fn().mockReturnValue([])
    service = new WindowService()
  })

  describe('createMainWindow', () => {
    it('should create a BrowserWindow with correct defaults', () => {
      service.createMainWindow()
      expect(mockBrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          show: false,
          webPreferences: expect.objectContaining({
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
          })
        })
      )
    })

    it('should use window state for position and size', () => {
      service.createMainWindow()
      expect(mockBrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          x: 100, y: 100, width: 1280, height: 800
        })
      )
    })
  })

  describe('window operations', () => {
    beforeEach(() => {
      service.createMainWindow()
    })

    it('should minimize the window', () => {
      service.minimize()
      expect(mockWin.minimize).toHaveBeenCalled()
    })

    it('should maximize the window', () => {
      service.maximize()
      expect(mockWin.maximize).toHaveBeenCalled()
    })

    it('should unmaximize the window', () => {
      service.unmaximize()
      expect(mockWin.unmaximize).toHaveBeenCalled()
    })

    it('should close the window', () => {
      service.close()
      expect(mockWin.close).toHaveBeenCalled()
    })

    it('should report maximized state', () => {
      mockWin.isMaximized.mockReturnValue(true)
      expect(service.isMaximized()).toBe(true)
    })

    it('should return window size', () => {
      expect(service.getSize()).toEqual([1280, 800])
    })

    it('should set minimum size', () => {
      service.setMinimumSize(800, 600)
      expect(mockWin.setMinimumSize).toHaveBeenCalledWith(800, 600)
    })
  })

  describe('getMainWindow', () => {
    it('should return null before creation', () => {
      expect(service.getMainWindow()).toBeNull()
    })

    it('should return the window after creation', () => {
      service.createMainWindow()
      expect(service.getMainWindow()).toBe(mockWin)
    })
  })
})
