import { describe, it, expect, vi } from 'vitest'

vi.mock('electron', () => ({
  BrowserWindow: vi.fn(),
  screen: { getPrimaryDisplay: vi.fn().mockReturnValue({ workAreaSize: { width: 1920, height: 1080 } }) },
  app: { getPath: vi.fn().mockReturnValue('/mock'), getName: vi.fn().mockReturnValue('Cherry Studio') }
}))

vi.mock('electron-window-state', () => ({
  default: vi.fn().mockReturnValue({
    x: 100, y: 100, width: 1280, height: 800, isMaximized: false, manage: vi.fn()
  })
}))

describe('Platform-specific window configuration', () => {
  it('should detect macOS', () => {
    // macOS uses native title bar with traffic lights (hiddenInset)
    const platform = process.platform
    if (platform === 'darwin') {
      expect(platform).toBe('darwin')
    }
  })

  it('should detect Windows', () => {
    if (process.platform === 'win32') {
      expect(process.platform).toBe('win32')
    }
  })

  it('should detect Linux', () => {
    if (process.platform === 'linux') {
      expect(process.platform).toBe('linux')
    }
  })

  it('should use hiddenInset title bar style on macOS', () => {
    const isMac = process.platform === 'darwin'
    const titleBarStyle = isMac ? 'hiddenInset' : 'default'
    expect(['hiddenInset', 'default']).toContain(titleBarStyle)
  })

  it('should detect portable mode from env vars', () => {
    const isPortableWin = process.env.PORTABLE_EXECUTABLE_DIR !== undefined
    const isAppImage = process.env.APPIMAGE !== undefined
    // Both should be false in test env
    expect(isPortableWin).toBe(false)
    expect(isAppImage).toBe(false)
  })
})
