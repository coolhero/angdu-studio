import { beforeEach, describe, expect, it, vi } from 'vitest'

// Track the nativeTheme 'updated' listener
let nativeThemeUpdateHandler: (() => void) | null = null

const mockBrowserWindow = {
  getAllWindows: vi.fn().mockReturnValue([])
}

const mockNativeTheme = {
  themeSource: 'system' as string,
  shouldUseDarkColors: false,
  on: vi.fn().mockImplementation((event: string, handler: () => void) => {
    if (event === 'updated') {
      nativeThemeUpdateHandler = handler
    }
  })
}

vi.mock('electron', () => ({
  BrowserWindow: mockBrowserWindow,
  nativeTheme: mockNativeTheme
}))

const mockConfigManager = {
  getTheme: vi.fn().mockReturnValue('system'),
  setTheme: vi.fn()
}

vi.mock('../ConfigManager', () => ({
  configManager: mockConfigManager
}))

vi.mock('../LoggerService', () => ({
  loggerService: {
    withContext: vi.fn().mockReturnValue({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn()
    })
  }
}))

describe('ThemeService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    nativeThemeUpdateHandler = null
    mockNativeTheme.themeSource = 'system'
    mockNativeTheme.shouldUseDarkColors = false
    mockConfigManager.getTheme.mockReturnValue('system')
    mockBrowserWindow.getAllWindows.mockReturnValue([])
  })

  async function createThemeService() {
    const mod = await import('../ThemeService')
    return mod.themeService
  }

  describe('initialization', () => {
    it('should read theme from ConfigManager on construction', async () => {
      mockConfigManager.getTheme.mockReturnValue('dark')
      await createThemeService()
      expect(mockConfigManager.getTheme).toHaveBeenCalled()
    })

    it('should set nativeTheme.themeSource to the stored theme', async () => {
      mockConfigManager.getTheme.mockReturnValue('dark')
      await createThemeService()
      expect(mockNativeTheme.themeSource).toBe('dark')
    })

    it('should register a listener on nativeTheme updated event', async () => {
      await createThemeService()
      expect(mockNativeTheme.on).toHaveBeenCalledWith('updated', expect.any(Function))
    })
  })

  describe('getTheme', () => {
    it('should return the current theme mode', async () => {
      mockConfigManager.getTheme.mockReturnValue('dark')
      const service = await createThemeService()
      expect(service.getTheme()).toBe('dark')
    })

    it('should return system when initialized with system theme', async () => {
      mockConfigManager.getTheme.mockReturnValue('system')
      const service = await createThemeService()
      expect(service.getTheme()).toBe('system')
    })

    it('should return light when initialized with light theme', async () => {
      mockConfigManager.getTheme.mockReturnValue('light')
      const service = await createThemeService()
      expect(service.getTheme()).toBe('light')
    })
  })

  describe('setTheme', () => {
    it('should update nativeTheme.themeSource', async () => {
      const service = await createThemeService()
      service.setTheme('dark')
      expect(mockNativeTheme.themeSource).toBe('dark')
    })

    it('should persist theme via ConfigManager', async () => {
      const service = await createThemeService()
      service.setTheme('light')
      expect(mockConfigManager.setTheme).toHaveBeenCalledWith('light')
    })

    it('should update internal theme state', async () => {
      const service = await createThemeService()
      service.setTheme('dark')
      expect(service.getTheme()).toBe('dark')
    })

    it('should set theme to system mode', async () => {
      mockConfigManager.getTheme.mockReturnValue('dark')
      const service = await createThemeService()
      service.setTheme('system')
      expect(mockNativeTheme.themeSource).toBe('system')
      expect(mockConfigManager.setTheme).toHaveBeenCalledWith('system')
    })
  })

  describe('system theme change detection', () => {
    it('should notify all windows when system theme changes to dark', async () => {
      const mockSend = vi.fn()
      const mockWindow = {
        webContents: { send: mockSend }
      }
      mockBrowserWindow.getAllWindows.mockReturnValue([mockWindow])
      mockNativeTheme.shouldUseDarkColors = true

      await createThemeService()

      // Trigger the system theme change
      expect(nativeThemeUpdateHandler).toBeTruthy()
      nativeThemeUpdateHandler?.()

      expect(mockSend).toHaveBeenCalledWith('theme:updated', 'dark')
    })

    it('should notify all windows when system theme changes to light', async () => {
      const mockSend = vi.fn()
      const mockWindow = {
        webContents: { send: mockSend }
      }
      mockBrowserWindow.getAllWindows.mockReturnValue([mockWindow])
      mockNativeTheme.shouldUseDarkColors = false

      await createThemeService()

      nativeThemeUpdateHandler?.()

      expect(mockSend).toHaveBeenCalledWith('theme:updated', 'light')
    })

    it('should notify multiple windows on theme change', async () => {
      const mockSend1 = vi.fn()
      const mockSend2 = vi.fn()
      const windows = [{ webContents: { send: mockSend1 } }, { webContents: { send: mockSend2 } }]
      mockBrowserWindow.getAllWindows.mockReturnValue(windows)
      mockNativeTheme.shouldUseDarkColors = true

      await createThemeService()

      nativeThemeUpdateHandler?.()

      expect(mockSend1).toHaveBeenCalledWith('theme:updated', 'dark')
      expect(mockSend2).toHaveBeenCalledWith('theme:updated', 'dark')
    })

    it('should not fail when no windows are open', async () => {
      mockBrowserWindow.getAllWindows.mockReturnValue([])

      await createThemeService()

      // Should not throw
      expect(() => nativeThemeUpdateHandler?.()).not.toThrow()
    })
  })

  describe('theme persistence via ConfigManager', () => {
    it('should load persisted theme on initialization', async () => {
      mockConfigManager.getTheme.mockReturnValue('dark')
      const service = await createThemeService()
      expect(service.getTheme()).toBe('dark')
    })

    it('should save theme to ConfigManager when setTheme is called', async () => {
      const service = await createThemeService()
      service.setTheme('light')
      expect(mockConfigManager.setTheme).toHaveBeenCalledWith('light')
    })

    it('should persist each theme change individually', async () => {
      const service = await createThemeService()

      service.setTheme('dark')
      expect(mockConfigManager.setTheme).toHaveBeenCalledWith('dark')

      service.setTheme('light')
      expect(mockConfigManager.setTheme).toHaveBeenCalledWith('light')

      service.setTheme('system')
      expect(mockConfigManager.setTheme).toHaveBeenCalledWith('system')

      expect(mockConfigManager.setTheme).toHaveBeenCalledTimes(3)
    })
  })
})
