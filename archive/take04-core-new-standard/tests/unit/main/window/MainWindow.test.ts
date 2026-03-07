import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Electron modules - must include __esModule for named export support
vi.mock('electron', () => ({
  __esModule: true,
  BrowserWindow: vi.fn().mockImplementation(() => ({
    loadURL: vi.fn(),
    loadFile: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    webContents: {
      on: vi.fn(),
      send: vi.fn(),
      setWindowOpenHandler: vi.fn()
    },
    getBounds: vi.fn(() => ({ x: 100, y: 100, width: 1200, height: 800 })),
    isMaximized: vi.fn(() => false),
    show: vi.fn(),
    focus: vi.fn(),
    close: vi.fn(),
    minimize: vi.fn(),
    maximize: vi.fn(),
    setTitle: vi.fn()
  })),
  app: {
    getPath: vi.fn(() => '/tmp/test'),
    isPackaged: false,
    getName: vi.fn(() => 'Cherry Studio'),
    getVersion: vi.fn(() => '0.1.0'),
    setPath: vi.fn()
  },
  screen: {
    getPrimaryDisplay: vi.fn(() => ({
      workAreaSize: { width: 1920, height: 1080 }
    }))
  },
  shell: {
    openExternal: vi.fn(),
    openPath: vi.fn()
  }
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

vi.mock('@electron-toolkit/utils', () => ({
  is: { dev: false }
}))

vi.mock('@main/services/PlatformService', () => ({
  platformService: {
    isMacOS: process.platform === 'darwin',
    isWindows: process.platform === 'win32',
    isLinux: process.platform === 'linux',
    isPortable: false,
    isAppImage: false,
    isWayland: false,
    platform: process.platform,
    arch: process.arch,
    shouldDisableAnimations: false,
    shouldUseNativeTitleBar: process.platform === 'darwin'
  }
}))

vi.mock('@main/config', () => ({
  configManager: {
    get: vi.fn(() => false),
    set: vi.fn(),
    subscribe: vi.fn(() => () => {}),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn()
  }
}))

describe('MainWindow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('should create a BrowserWindow with correct defaults', async () => {
    const { createMainWindow } = await import('@main/window/MainWindow')
    const win = createMainWindow()
    expect(win).toBeDefined()
  })

  it('should use electron-window-state for position/size persistence', async () => {
    const windowState = await import('electron-window-state')
    const { createMainWindow } = await import('@main/window/MainWindow')
    createMainWindow()
    expect(windowState.default).toHaveBeenCalled()
  })

  it('should enable context isolation and disable node integration', async () => {
    const { BrowserWindow } = await import('electron')
    const { createMainWindow } = await import('@main/window/MainWindow')
    createMainWindow()
    const constructorCall = vi.mocked(BrowserWindow).mock.calls[0][0]
    expect(constructorCall?.webPreferences?.contextIsolation).toBe(true)
    expect(constructorCall?.webPreferences?.nodeIntegration).toBe(false)
  })
})
