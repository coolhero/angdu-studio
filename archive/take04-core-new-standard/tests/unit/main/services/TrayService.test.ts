import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockTray = vi.fn(() => ({
  setContextMenu: vi.fn(),
  setToolTip: vi.fn(),
  on: vi.fn(),
  destroy: vi.fn()
}))

const mockNativeImage = {
  createFromPath: vi.fn(() => ({
    resize: vi.fn(() => ({}))
  }))
}

vi.mock('electron', () => ({
  Tray: mockTray,
  Menu: { buildFromTemplate: vi.fn(() => ({})) },
  nativeImage: mockNativeImage,
  nativeTheme: { shouldUseDarkColors: false, on: vi.fn() },
  app: { quit: vi.fn() }
}))

vi.mock('../../../../src/main/config', () => ({
  configManager: {
    get: vi.fn(() => false),
    subscribe: vi.fn(() => () => {})
  }
}))

vi.mock('../../../../src/main/i18n/locales', () => ({
  t: vi.fn((key: string) => key)
}))

describe('TrayService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a tray instance', async () => {
    const { TrayService } = await import('../../../../src/main/services/TrayService')
    const service = new TrayService()
    service.createTray('/fake/icon.png')
    expect(mockTray).toHaveBeenCalled()
  })

  it('should set context menu on tray', async () => {
    const { TrayService } = await import('../../../../src/main/services/TrayService')
    const service = new TrayService()
    const tray = service.createTray('/fake/icon.png')
    expect(tray.setContextMenu).toHaveBeenCalled()
  })
})
