import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/tmp/angdu-test'),
    isPackaged: false,
    quit: vi.fn()
  },
  BrowserWindow: vi.fn().mockImplementation(() => ({
    loadURL: vi.fn(),
    loadFile: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    show: vi.fn(),
    hide: vi.fn(),
    close: vi.fn(),
    minimize: vi.fn(),
    maximize: vi.fn(),
    unmaximize: vi.fn(),
    isMaximized: vi.fn(() => false),
    isMinimized: vi.fn(() => false),
    isVisible: vi.fn(() => true),
    setSize: vi.fn(),
    setPosition: vi.fn(),
    getBounds: vi.fn(() => ({ x: 100, y: 100, width: 1200, height: 800 })),
    setAlwaysOnTop: vi.fn(),
    setFullScreen: vi.fn(),
    webContents: {
      on: vi.fn(),
      send: vi.fn(),
      setWindowOpenHandler: vi.fn()
    },
    focus: vi.fn()
  })),
  screen: {
    getPrimaryDisplay: vi.fn(() => ({
      workAreaSize: { width: 1920, height: 1080 }
    }))
  }
}))

vi.mock('@electron-toolkit/utils', () => ({
  is: { dev: true },
  electronApp: { setAppUserModelId: vi.fn() },
  optimizer: { watchWindowShortcuts: vi.fn() }
}))

vi.mock('electron-window-state', () => ({
  default: vi.fn(() => ({
    x: 100,
    y: 100,
    width: 1200,
    height: 800,
    isMaximized: false,
    manage: vi.fn()
  }))
}))

describe('WindowService', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('should create a singleton instance', async () => {
    const { WindowService } = await import('../../../src/main/services/WindowService')
    const a = WindowService.getInstance()
    const b = WindowService.getInstance()
    expect(a).toBe(b)
  })

  it('should create main window', async () => {
    const { WindowService } = await import('../../../src/main/services/WindowService')
    const service = WindowService.getInstance()
    const win = service.createMainWindow()
    expect(win).toBeDefined()
  })

  it('should return main window reference', async () => {
    const { WindowService } = await import('../../../src/main/services/WindowService')
    const service = WindowService.getInstance()
    service.createMainWindow()
    expect(service.getMainWindow()).toBeDefined()
  })
})
