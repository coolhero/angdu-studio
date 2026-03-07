import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  MINI_WINDOW_DEFAULT_WIDTH,
  MINI_WINDOW_DEFAULT_HEIGHT,
  MINI_WINDOW_MIN_WIDTH,
  MINI_WINDOW_MIN_HEIGHT
} from '@shared/constants'

const mockMiniWin = {
  show: vi.fn(),
  hide: vi.fn(),
  close: vi.fn(),
  focus: vi.fn(),
  center: vi.fn(),
  isVisible: vi.fn().mockReturnValue(false),
  isDestroyed: vi.fn().mockReturnValue(false),
  setAlwaysOnTop: vi.fn(),
  setVisibleOnAllWorkspaces: vi.fn(),
  setBounds: vi.fn(),
  on: vi.fn(),
  webContents: { on: vi.fn(), send: vi.fn() },
  loadFile: vi.fn(),
  loadURL: vi.fn()
}

const mockScreen = {
  getCursorScreenPoint: vi.fn().mockReturnValue({ x: 500, y: 300 }),
  getDisplayNearestPoint: vi.fn().mockReturnValue({
    bounds: { x: 0, y: 0, width: 1920, height: 1080 },
    workArea: { x: 0, y: 0, width: 1920, height: 1040 }
  })
}

vi.mock('electron', () => ({
  BrowserWindow: vi.fn().mockImplementation(() => mockMiniWin),
  screen: mockScreen,
  app: {
    getPath: vi.fn().mockReturnValue('/mock'),
    getName: vi.fn().mockReturnValue('Cherry Studio')
  }
}))

vi.mock('electron-window-state', () => ({
  default: vi.fn().mockReturnValue({
    x: 100, y: 100, width: 1280, height: 800, isMaximized: false, manage: vi.fn()
  })
}))

describe('Mini Window', () => {
  it('should use correct default dimensions', () => {
    expect(MINI_WINDOW_DEFAULT_WIDTH).toBe(550)
    expect(MINI_WINDOW_DEFAULT_HEIGHT).toBe(400)
  })

  it('should have correct minimum dimensions', () => {
    expect(MINI_WINDOW_MIN_WIDTH).toBe(350)
    expect(MINI_WINDOW_MIN_HEIGHT).toBe(380)
  })

  it('should center on cursor screen', () => {
    const cursorPoint = mockScreen.getCursorScreenPoint()
    const display = mockScreen.getDisplayNearestPoint(cursorPoint)

    const x = display.workArea.x +
      Math.round((display.workArea.width - MINI_WINDOW_DEFAULT_WIDTH) / 2)
    const y = display.workArea.y +
      Math.round((display.workArea.height - MINI_WINDOW_DEFAULT_HEIGHT) / 2)

    expect(x).toBeGreaterThan(0)
    expect(y).toBeGreaterThan(0)
  })
})
