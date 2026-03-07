import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockNativeTheme, mockSend } = vi.hoisted(() => {
  const mockSend = vi.fn()
  return {
    mockNativeTheme: {
      themeSource: 'system' as string,
      shouldUseDarkColors: false,
      on: vi.fn(),
      removeAllListeners: vi.fn()
    },
    mockSend
  }
})

vi.mock('electron', () => ({
  nativeTheme: mockNativeTheme,
  BrowserWindow: {
    getAllWindows: vi.fn().mockReturnValue([
      { isDestroyed: () => false, webContents: { send: mockSend } }
    ])
  },
  app: { getPath: vi.fn().mockReturnValue('/mock'), getName: vi.fn().mockReturnValue('Cherry Studio') }
}))

import { ThemeService } from '../ThemeService'

describe('ThemeService', () => {
  let themeService: ThemeService

  beforeEach(() => {
    vi.clearAllMocks()
    mockNativeTheme.themeSource = 'system'
    themeService = new ThemeService()
  })

  it('should set theme to light', () => {
    themeService.setTheme('light')
    expect(mockNativeTheme.themeSource).toBe('light')
  })

  it('should set theme to dark', () => {
    themeService.setTheme('dark')
    expect(mockNativeTheme.themeSource).toBe('dark')
  })

  it('should set theme to system', () => {
    themeService.setTheme('system')
    expect(mockNativeTheme.themeSource).toBe('system')
  })

  it('should broadcast theme changed to all windows', () => {
    themeService.setTheme('dark')
    expect(mockSend).toHaveBeenCalledWith('app:theme-changed', 'dark')
  })

  it('should get current theme', () => {
    mockNativeTheme.themeSource = 'dark'
    expect(themeService.getCurrentTheme()).toBe('dark')
  })

  it('should report dark colors state', () => {
    mockNativeTheme.shouldUseDarkColors = true
    expect(themeService.isDarkMode()).toBe(true)
  })
})
