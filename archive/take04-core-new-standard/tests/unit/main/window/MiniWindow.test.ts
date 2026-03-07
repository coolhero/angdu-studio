import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockBrowserWindow = vi.fn(() => ({
  loadURL: vi.fn(),
  loadFile: vi.fn(),
  on: vi.fn(),
  once: vi.fn(),
  show: vi.fn(),
  hide: vi.fn(),
  focus: vi.fn(),
  close: vi.fn(),
  isVisible: vi.fn(() => false),
  isDestroyed: vi.fn(() => false),
  setAlwaysOnTop: vi.fn(),
  setVisibleOnAllWorkspaces: vi.fn(),
  setPosition: vi.fn(),
  getBounds: vi.fn(() => ({ x: 0, y: 0, width: 550, height: 400 })),
  webContents: { on: vi.fn() }
}))

const mockScreen = {
  getCursorScreenPoint: vi.fn(() => ({ x: 500, y: 500 })),
  getDisplayNearestPoint: vi.fn(() => ({
    workArea: { x: 0, y: 0, width: 1920, height: 1080 }
  }))
}

vi.mock('electron', () => ({
  BrowserWindow: mockBrowserWindow,
  screen: mockScreen
}))

vi.mock('electron-vite', () => ({
  is: { dev: true }
}))

vi.mock('@electron-toolkit/utils', () => ({
  is: { dev: true }
}))

describe('MiniWindow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('should create frameless window with correct defaults', async () => {
    const { createMiniWindow } = await import('../../../../src/main/window/MiniWindow')
    createMiniWindow()

    expect(mockBrowserWindow).toHaveBeenCalledWith(
      expect.objectContaining({
        width: 550,
        height: 400,
        frame: false,
        alwaysOnTop: true,
        minWidth: 350,
        minHeight: 380,
        maxWidth: 1024,
        maxHeight: 768
      })
    )
  })

  it('should set visible on all workspaces', async () => {
    const { createMiniWindow } = await import('../../../../src/main/window/MiniWindow')
    const win = createMiniWindow()
    expect(win.setVisibleOnAllWorkspaces).toHaveBeenCalledWith(true)
  })
})
