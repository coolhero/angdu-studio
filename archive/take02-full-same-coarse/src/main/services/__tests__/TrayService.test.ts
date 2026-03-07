import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockTrayInstance = {
  setContextMenu: vi.fn(),
  on: vi.fn(),
  destroy: vi.fn(),
  isDestroyed: vi.fn().mockReturnValue(false)
}

const mockTray = vi.fn().mockImplementation(() => mockTrayInstance)

const mockMenuBuildFromTemplate = vi.fn().mockReturnValue('built-menu')

const mockNativeImage = {
  createFromPath: vi.fn().mockReturnValue('native-image'),
  createEmpty: vi.fn().mockReturnValue('empty-image')
}

const mockNativeTheme = {
  shouldUseDarkColors: false,
  on: vi.fn()
}

const mockApp = {
  quit: vi.fn(),
  isPackaged: false
}

vi.mock('electron', () => ({
  Tray: mockTray,
  Menu: {
    buildFromTemplate: mockMenuBuildFromTemplate
  },
  nativeImage: mockNativeImage,
  nativeTheme: mockNativeTheme,
  app: mockApp
}))

const mockMainWindow = {
  show: vi.fn(),
  focus: vi.fn(),
  isVisible: vi.fn().mockReturnValue(true),
  isDestroyed: vi.fn().mockReturnValue(false)
}

const mockWindowService = {
  getMainWindow: vi.fn().mockReturnValue(mockMainWindow),
  showMainWindow: vi.fn()
}

vi.mock('../WindowService', () => ({
  windowService: mockWindowService
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

describe('TrayService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockTrayInstance.isDestroyed.mockReturnValue(false)
    mockMainWindow.isVisible.mockReturnValue(true)
    mockMainWindow.isDestroyed.mockReturnValue(false)
    mockWindowService.getMainWindow.mockReturnValue(mockMainWindow)
  })

  async function createTrayService() {
    const mod = await import('../TrayService')
    return mod.trayService
  }

  describe('init', () => {
    it('should create a Tray instance with an icon', async () => {
      const service = await createTrayService()
      service.init()
      expect(mockTray).toHaveBeenCalled()
    })

    it('should set a context menu on the tray', async () => {
      const service = await createTrayService()
      service.init()
      expect(mockMenuBuildFromTemplate).toHaveBeenCalled()
      expect(mockTrayInstance.setContextMenu).toHaveBeenCalledWith('built-menu')
    })

    it('should register a click handler on the tray', async () => {
      const service = await createTrayService()
      service.init()
      expect(mockTrayInstance.on).toHaveBeenCalledWith('click', expect.any(Function))
    })

    it('should use nativeImage.createFromPath on macOS for template icon', async () => {
      const originalPlatform = process.platform
      Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true })

      const service = await createTrayService()
      service.init()

      // On macOS, should attempt to use template icon
      expect(mockNativeImage.createFromPath).toHaveBeenCalled()
      const callArg = mockNativeImage.createFromPath.mock.calls[0][0]
      expect(callArg).toContain('trayTemplate')

      Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true })
    })

    it('should use regular icon on Windows', async () => {
      const originalPlatform = process.platform
      Object.defineProperty(process, 'platform', { value: 'win32', configurable: true })

      vi.resetModules()
      const service = await createTrayService()
      service.init()

      const callArg = mockNativeImage.createFromPath.mock.calls[0][0]
      expect(callArg).toContain('tray')

      Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true })
    })

    it('should use regular icon on Linux', async () => {
      const originalPlatform = process.platform
      Object.defineProperty(process, 'platform', { value: 'linux', configurable: true })

      vi.resetModules()
      const service = await createTrayService()
      service.init()

      const callArg = mockNativeImage.createFromPath.mock.calls[0][0]
      expect(callArg).toContain('tray')

      Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true })
    })
  })

  describe('context menu', () => {
    it('should have Restore and Quit items', async () => {
      const service = await createTrayService()
      service.init()

      const templateArg = mockMenuBuildFromTemplate.mock.calls[0][0]
      const labels = templateArg.map((item: { label: string }) => item.label)
      expect(labels).toContain('Restore')
      expect(labels).toContain('Quit')
    })

    it('should show and focus main window on Restore click', async () => {
      const service = await createTrayService()
      service.init()

      const templateArg = mockMenuBuildFromTemplate.mock.calls[0][0]
      const restoreItem = templateArg.find((item: { label: string }) => item.label === 'Restore')
      restoreItem.click()

      expect(mockWindowService.showMainWindow).toHaveBeenCalled()
    })

    it('should call app.quit() on Quit click', async () => {
      const service = await createTrayService()
      service.init()

      const templateArg = mockMenuBuildFromTemplate.mock.calls[0][0]
      const quitItem = templateArg.find((item: { label: string }) => item.label === 'Quit')
      quitItem.click()

      expect(mockApp.quit).toHaveBeenCalled()
    })
  })

  describe('click handler', () => {
    it('should show and focus main window when clicked and window is hidden', async () => {
      mockMainWindow.isVisible.mockReturnValue(false)

      const service = await createTrayService()
      service.init()

      const clickHandler = mockTrayInstance.on.mock.calls.find((call: unknown[]) => call[0] === 'click')?.[1]
      expect(clickHandler).toBeDefined()
      clickHandler()

      expect(mockWindowService.showMainWindow).toHaveBeenCalled()
    })

    it('should show and focus main window when clicked and window is visible', async () => {
      mockMainWindow.isVisible.mockReturnValue(true)

      const service = await createTrayService()
      service.init()

      const clickHandler = mockTrayInstance.on.mock.calls.find((call: unknown[]) => call[0] === 'click')?.[1]
      clickHandler()

      expect(mockWindowService.showMainWindow).toHaveBeenCalled()
    })
  })

  describe('destroy', () => {
    it('should destroy the tray on cleanup', async () => {
      const service = await createTrayService()
      service.init()
      service.destroy()

      expect(mockTrayInstance.destroy).toHaveBeenCalled()
    })

    it('should not throw if tray is already destroyed', async () => {
      const service = await createTrayService()
      service.init()
      mockTrayInstance.isDestroyed.mockReturnValue(true)

      expect(() => service.destroy()).not.toThrow()
    })

    it('should not throw if tray was never initialized', async () => {
      const service = await createTrayService()
      expect(() => service.destroy()).not.toThrow()
    })
  })
})
