import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockRegister, mockUnregister, mockUnregisterAll } = vi.hoisted(() => ({
  mockRegister: vi.fn().mockReturnValue(true),
  mockUnregister: vi.fn(),
  mockUnregisterAll: vi.fn()
}))

vi.mock('electron', () => ({
  globalShortcut: {
    register: mockRegister,
    unregister: mockUnregister,
    unregisterAll: mockUnregisterAll,
    isRegistered: vi.fn().mockReturnValue(false)
  },
  app: {
    getPath: vi.fn().mockReturnValue('/mock'),
    getName: vi.fn().mockReturnValue('Cherry Studio')
  }
}))

import { ShortcutService } from '../ShortcutService'

describe('ShortcutService', () => {
  let service: ShortcutService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ShortcutService()
  })

  it('should register a shortcut', () => {
    const callback = vi.fn()
    service.register('CommandOrControl+Shift+A', callback)
    expect(mockRegister).toHaveBeenCalledWith('CommandOrControl+Shift+A', callback)
  })

  it('should unregister a shortcut', () => {
    service.unregister('CommandOrControl+Shift+A')
    expect(mockUnregister).toHaveBeenCalledWith('CommandOrControl+Shift+A')
  })

  it('should unregister all shortcuts', () => {
    service.unregisterAll()
    expect(mockUnregisterAll).toHaveBeenCalled()
  })
})
