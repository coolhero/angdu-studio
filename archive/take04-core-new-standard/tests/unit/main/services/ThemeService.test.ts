import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockNativeTheme = {
  themeSource: 'system' as string,
  shouldUseDarkColors: false,
  on: vi.fn()
}

const mockWebContents = {
  send: vi.fn()
}

const mockBrowserWindow = {
  getAllWindows: vi.fn(() => [{ webContents: mockWebContents }])
}

const mockConfigManager = {
  get: vi.fn(() => 'auto'),
  set: vi.fn()
}

vi.mock('electron', () => ({
  nativeTheme: mockNativeTheme,
  BrowserWindow: mockBrowserWindow
}))

vi.mock('../../../../src/main/config', () => ({
  configManager: mockConfigManager
}))

describe('ThemeService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNativeTheme.themeSource = 'system'
  })

  it('should update nativeTheme.themeSource when setting theme', async () => {
    const { ThemeService } = await import('../../../../src/main/services/ThemeService')
    const service = new ThemeService()

    service.setTheme('dark')
    expect(mockNativeTheme.themeSource).toBe('dark')
  })

  it('should broadcast ThemeUpdated to all windows', async () => {
    const { ThemeService } = await import('../../../../src/main/services/ThemeService')
    const service = new ThemeService()

    service.setTheme('dark')
    expect(mockWebContents.send).toHaveBeenCalledWith(
      expect.stringContaining('themeUpdated'),
      expect.objectContaining({ theme: expect.any(String) })
    )
  })

  it('should persist theme to config', async () => {
    const { ThemeService } = await import('../../../../src/main/services/ThemeService')
    const service = new ThemeService()

    service.setTheme('light')
    expect(mockConfigManager.set).toHaveBeenCalled()
  })

  it('should register OS theme change listener', async () => {
    const { ThemeService } = await import('../../../../src/main/services/ThemeService')
    new ThemeService()
    expect(mockNativeTheme.on).toHaveBeenCalledWith('updated', expect.any(Function))
  })
})
