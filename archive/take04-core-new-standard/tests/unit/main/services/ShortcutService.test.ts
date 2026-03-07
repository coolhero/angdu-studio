import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGlobalShortcut = {
  register: vi.fn(() => true),
  unregisterAll: vi.fn(),
  isRegistered: vi.fn(() => true),
  unregister: vi.fn()
}

vi.mock('electron', () => ({
  globalShortcut: mockGlobalShortcut,
  app: {
    getPath: vi.fn(() => '/tmp'),
    setPath: vi.fn()
  }
}))

vi.mock('../../../../src/main/logger', () => ({
  withContext: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }))
}))

describe('ShortcutService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should register shortcuts', async () => {
    const { ShortcutService } = await import('../../../../src/main/services/ShortcutService')
    const service = new ShortcutService()
    service.registerShortcuts([
      { key: 'showMainWindow', shortcut: ['CommandOrControl+Shift+S'], enabled: true }
    ])
    expect(mockGlobalShortcut.register).toHaveBeenCalled()
  })

  it('should unregister all shortcuts', async () => {
    const { ShortcutService } = await import('../../../../src/main/services/ShortcutService')
    const service = new ShortcutService()
    service.unregisterAll()
    expect(mockGlobalShortcut.unregisterAll).toHaveBeenCalled()
  })

  it('should skip disabled shortcuts', async () => {
    const { ShortcutService } = await import('../../../../src/main/services/ShortcutService')
    const service = new ShortcutService()
    service.registerShortcuts([
      { key: 'showMainWindow', shortcut: ['CommandOrControl+Shift+S'], enabled: false }
    ])
    expect(mockGlobalShortcut.register).not.toHaveBeenCalled()
  })
})
