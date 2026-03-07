import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGlobalShortcut = {
  register: vi.fn().mockReturnValue(true),
  unregisterAll: vi.fn()
}

const mockMainWindow = {
  isVisible: vi.fn().mockReturnValue(true),
  show: vi.fn(),
  hide: vi.fn(),
  focus: vi.fn(),
  isDestroyed: vi.fn().mockReturnValue(false)
}

vi.mock('electron', () => ({
  globalShortcut: mockGlobalShortcut
}))

vi.mock('../WindowService', () => ({
  windowService: {
    getMainWindow: vi.fn().mockReturnValue(mockMainWindow)
  }
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

describe('ShortcutService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockMainWindow.isVisible.mockReturnValue(true)
    mockMainWindow.isDestroyed.mockReturnValue(false)
    mockGlobalShortcut.register.mockReturnValue(true)
  })

  async function createShortcutService() {
    const mod = await import('../ShortcutService')
    return mod.shortcutService
  }

  describe('registerAll', () => {
    it('should call globalShortcut.register for each enabled shortcut', async () => {
      const service = await createShortcutService()
      const shortcuts = [
        { key: 'show-hide-app', shortcut: ['CmdOrCtrl+Shift+Space'], enabled: true },
        { key: 'new-chat', shortcut: ['CmdOrCtrl+N'], enabled: true }
      ]

      service.registerAll(shortcuts)

      expect(mockGlobalShortcut.register).toHaveBeenCalledTimes(2)
      expect(mockGlobalShortcut.register).toHaveBeenCalledWith('CmdOrCtrl+Shift+Space', expect.any(Function))
      expect(mockGlobalShortcut.register).toHaveBeenCalledWith('CmdOrCtrl+N', expect.any(Function))
    })

    it('should skip disabled shortcuts', async () => {
      const service = await createShortcutService()
      const shortcuts = [
        { key: 'show-hide-app', shortcut: ['CmdOrCtrl+Shift+Space'], enabled: true },
        { key: 'new-chat', shortcut: ['CmdOrCtrl+N'], enabled: false }
      ]

      service.registerAll(shortcuts)

      expect(mockGlobalShortcut.register).toHaveBeenCalledTimes(1)
      expect(mockGlobalShortcut.register).toHaveBeenCalledWith('CmdOrCtrl+Shift+Space', expect.any(Function))
    })

    it('should not register shortcuts with empty accelerator arrays', async () => {
      const service = await createShortcutService()
      const shortcuts = [{ key: 'show-hide-app', shortcut: [], enabled: true }]

      service.registerAll(shortcuts)

      expect(mockGlobalShortcut.register).not.toHaveBeenCalled()
    })
  })

  describe('unregisterAll', () => {
    it('should call globalShortcut.unregisterAll', async () => {
      const service = await createShortcutService()

      service.unregisterAll()

      expect(mockGlobalShortcut.unregisterAll).toHaveBeenCalledTimes(1)
    })
  })

  describe('update', () => {
    it('should unregister all then re-register new shortcuts', async () => {
      const service = await createShortcutService()
      const shortcuts = [{ key: 'show-hide-app', shortcut: ['CmdOrCtrl+Shift+Space'], enabled: true }]

      service.update(shortcuts)

      expect(mockGlobalShortcut.unregisterAll).toHaveBeenCalledTimes(1)
      expect(mockGlobalShortcut.register).toHaveBeenCalledWith('CmdOrCtrl+Shift+Space', expect.any(Function))
    })

    it('should unregister before registering new shortcuts', async () => {
      const service = await createShortcutService()
      const callOrder: string[] = []
      mockGlobalShortcut.unregisterAll.mockImplementation(() => {
        callOrder.push('unregister')
      })
      mockGlobalShortcut.register.mockImplementation(() => {
        callOrder.push('register')
        return true
      })

      const shortcuts = [{ key: 'show-hide-app', shortcut: ['CmdOrCtrl+Shift+Space'], enabled: true }]

      service.update(shortcuts)

      expect(callOrder).toEqual(['unregister', 'register'])
    })
  })

  describe('error handling', () => {
    it('should handle error gracefully when register fails with invalid accelerator', async () => {
      mockGlobalShortcut.register.mockImplementation(() => {
        throw new Error('Invalid accelerator')
      })

      const service = await createShortcutService()
      const shortcuts = [{ key: 'show-hide-app', shortcut: ['InvalidKey!!!'], enabled: true }]

      expect(() => service.registerAll(shortcuts)).not.toThrow()
    })

    it('should handle error when register returns false (accelerator in use)', async () => {
      mockGlobalShortcut.register.mockReturnValue(false)

      const service = await createShortcutService()
      const shortcuts = [{ key: 'show-hide-app', shortcut: ['CmdOrCtrl+Shift+Space'], enabled: true }]

      expect(() => service.registerAll(shortcuts)).not.toThrow()
    })
  })

  describe('action dispatch map', () => {
    it('show-hide-app should hide the window when it is visible', async () => {
      mockMainWindow.isVisible.mockReturnValue(true)
      const service = await createShortcutService()
      const shortcuts = [{ key: 'show-hide-app', shortcut: ['CmdOrCtrl+Shift+Space'], enabled: true }]

      service.registerAll(shortcuts)

      // Get the handler that was registered
      const handler = mockGlobalShortcut.register.mock.calls[0][1]
      handler()

      expect(mockMainWindow.hide).toHaveBeenCalled()
    })

    it('show-hide-app should show and focus the window when it is not visible', async () => {
      mockMainWindow.isVisible.mockReturnValue(false)
      const service = await createShortcutService()
      const shortcuts = [{ key: 'show-hide-app', shortcut: ['CmdOrCtrl+Shift+Space'], enabled: true }]

      service.registerAll(shortcuts)

      const handler = mockGlobalShortcut.register.mock.calls[0][1]
      handler()

      expect(mockMainWindow.show).toHaveBeenCalled()
      expect(mockMainWindow.focus).toHaveBeenCalled()
    })

    it('show-hide-app should not throw when main window is null', async () => {
      const { windowService } = await import('../WindowService')
      vi.mocked(windowService.getMainWindow).mockReturnValue(null)

      const service = await createShortcutService()
      const shortcuts = [{ key: 'show-hide-app', shortcut: ['CmdOrCtrl+Shift+Space'], enabled: true }]

      service.registerAll(shortcuts)

      const handler = mockGlobalShortcut.register.mock.calls[0][1]
      expect(() => handler()).not.toThrow()
    })
  })
})
