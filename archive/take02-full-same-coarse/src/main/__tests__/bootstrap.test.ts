import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockMainWindow = {
  show: vi.fn(),
  focus: vi.fn(),
  webContents: { send: vi.fn() }
}

const mockCreateMainWindow = vi.fn().mockReturnValue(mockMainWindow)
const mockOnStateChange = vi.fn()
const mockRegisterIpc = vi.fn()

vi.mock('@main/services/LoggerService', () => ({
  loggerService: {
    withContext: vi.fn().mockReturnValue({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn()
    })
  }
}))

vi.mock('@main/services/WindowService', () => ({
  windowService: {
    createMainWindow: mockCreateMainWindow
  }
}))

vi.mock('@main/services/AppService', () => ({
  appService: {
    getInfo: vi.fn().mockReturnValue({ version: '1.0.0' })
  }
}))

vi.mock('@main/services/PowerMonitorService', () => ({
  powerMonitorService: {
    onStateChange: mockOnStateChange
  }
}))

vi.mock('../ipc', () => ({
  registerIpc: mockRegisterIpc
}))

vi.mock('@main/services/TrayService', () => ({
  trayService: { init: vi.fn(), destroy: vi.fn() }
}))

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/mock/user/data'),
    isPackaged: false
  },
  nativeImage: {
    createFromPath: vi.fn().mockReturnValue({ isEmpty: vi.fn().mockReturnValue(true) }),
    createEmpty: vi.fn().mockReturnValue({})
  }
}))

describe('bootstrap', () => {
  let bootstrap: typeof import('../bootstrap').bootstrap

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    const mod = await import('../bootstrap')
    bootstrap = mod.bootstrap
  })

  it('should call windowService.createMainWindow()', async () => {
    await bootstrap()
    expect(mockCreateMainWindow).toHaveBeenCalledOnce()
  })

  it('should return the main window reference', async () => {
    const result = await bootstrap()
    expect(result).toBe(mockMainWindow)
  })

  it('should register power monitor state change callback', async () => {
    await bootstrap()
    expect(mockOnStateChange).toHaveBeenCalledOnce()
    expect(typeof mockOnStateChange.mock.calls[0][0]).toBe('function')
  })

  it('should call registerIpc with mainWindow and app', async () => {
    await bootstrap()
    expect(mockRegisterIpc).toHaveBeenCalledOnce()
    expect(mockRegisterIpc).toHaveBeenCalledWith(mockMainWindow, expect.anything())
  })

  it('should call services in correct order: window -> power monitor -> ipc', async () => {
    const callOrder: string[] = []
    mockCreateMainWindow.mockImplementation(() => {
      callOrder.push('createMainWindow')
      return mockMainWindow
    })
    mockOnStateChange.mockImplementation(() => {
      callOrder.push('onStateChange')
    })
    mockRegisterIpc.mockImplementation(() => {
      callOrder.push('registerIpc')
    })

    await bootstrap()

    expect(callOrder).toEqual(['createMainWindow', 'onStateChange', 'registerIpc'])
  })

  it('should handle errors during initialization', async () => {
    mockCreateMainWindow.mockImplementationOnce(() => {
      throw new Error('Window creation failed')
    })

    await expect(bootstrap()).rejects.toThrow('Window creation failed')
  })
})
