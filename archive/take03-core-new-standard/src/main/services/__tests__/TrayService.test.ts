import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockTray, MockTray } = vi.hoisted(() => {
  const mockTray = {
    setContextMenu: vi.fn(),
    setImage: vi.fn(),
    setToolTip: vi.fn(),
    on: vi.fn(),
    destroy: vi.fn()
  }
  const MockTray = vi.fn().mockImplementation(() => mockTray)
  return { mockTray, MockTray }
})

vi.mock('electron', () => ({
  Tray: MockTray,
  Menu: { buildFromTemplate: vi.fn().mockReturnValue({}) },
  nativeImage: {
    createFromPath: vi.fn().mockReturnValue({
      setTemplateImage: vi.fn()
    })
  },
  app: {
    getPath: vi.fn().mockReturnValue('/mock'),
    getName: vi.fn().mockReturnValue('Cherry Studio'),
    quit: vi.fn()
  }
}))

vi.mock('../locales', () => ({
  t: vi.fn().mockImplementation((key: string) => key)
}))

vi.mock('../../utils/platform', () => ({
  isMac: false,
  isWindows: false,
  isLinux: true
}))

import { TrayService } from '../TrayService'

describe('TrayService', () => {
  let trayService: TrayService

  beforeEach(() => {
    vi.clearAllMocks()
    trayService = new TrayService()
  })

  it('should create tray', () => {
    trayService.createTray()
    expect(MockTray).toHaveBeenCalled()
  })

  it('should set context menu', () => {
    trayService.createTray()
    expect(mockTray.setContextMenu).toHaveBeenCalled()
  })

  it('should destroy tray', () => {
    trayService.createTray()
    trayService.destroyTray()
    expect(mockTray.destroy).toHaveBeenCalled()
  })
})
