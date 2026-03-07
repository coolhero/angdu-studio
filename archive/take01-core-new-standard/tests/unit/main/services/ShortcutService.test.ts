import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockGlobalShortcut } = vi.hoisted(() => {
  const mockGlobalShortcut = {
    register: vi.fn(),
    unregister: vi.fn(),
    unregisterAll: vi.fn()
  }
  return { mockGlobalShortcut }
})

vi.mock('electron', () => ({
  globalShortcut: mockGlobalShortcut,
  app: {
    getPath: vi.fn().mockReturnValue('/mock/userData'),
    getName: vi.fn().mockReturnValue('Cherry Studio'),
    getVersion: vi.fn().mockReturnValue('0.1.0')
  }
}))

// Mock crypto.randomUUID
let uuidCounter = 0
vi.stubGlobal('crypto', {
  randomUUID: () => `uuid-${++uuidCounter}`
})

import { ShortcutService } from '@main/services/ShortcutService'

describe('ShortcutService', () => {
  let service: ShortcutService

  beforeEach(() => {
    vi.clearAllMocks()
    uuidCounter = 0
    service = new ShortcutService()
  })

  describe('register', () => {
    it('registers a shortcut and returns it with an id', () => {
      const callback = vi.fn()
      const result = service.register(
        { accelerator: 'CommandOrControl+N', description: 'New Chat', enabled: true },
        callback
      )

      expect(result.id).toBe('uuid-1')
      expect(result.accelerator).toBe('CommandOrControl+N')
      expect(result.description).toBe('New Chat')
      expect(result.enabled).toBe(true)
    })

    it('calls globalShortcut.register when shortcut is enabled', () => {
      const callback = vi.fn()
      service.register(
        { accelerator: 'CommandOrControl+N', description: 'New Chat', enabled: true },
        callback
      )

      expect(mockGlobalShortcut.register).toHaveBeenCalledWith(
        'CommandOrControl+N',
        callback
      )
    })

    it('does not call globalShortcut.register when shortcut is disabled', () => {
      const callback = vi.fn()
      service.register(
        { accelerator: 'CommandOrControl+N', description: 'New Chat', enabled: false },
        callback
      )

      expect(mockGlobalShortcut.register).not.toHaveBeenCalled()
    })
  })

  describe('unregister', () => {
    it('unregisters a shortcut by id', () => {
      const callback = vi.fn()
      const shortcut = service.register(
        { accelerator: 'CommandOrControl+N', description: 'New Chat', enabled: true },
        callback
      )

      service.unregister(shortcut.id)

      expect(mockGlobalShortcut.unregister).toHaveBeenCalledWith('CommandOrControl+N')
      expect(service.getAll()).toHaveLength(0)
    })

    it('does nothing for unknown ids', () => {
      service.unregister('non-existent')
      expect(mockGlobalShortcut.unregister).not.toHaveBeenCalled()
    })
  })

  describe('unregisterAll', () => {
    it('unregisters all shortcuts', () => {
      const callback = vi.fn()
      service.register(
        { accelerator: 'CommandOrControl+N', description: 'New Chat', enabled: true },
        callback
      )
      service.register(
        { accelerator: 'CommandOrControl+S', description: 'Save', enabled: true },
        callback
      )

      service.unregisterAll()

      expect(mockGlobalShortcut.unregister).toHaveBeenCalledTimes(2)
      expect(service.getAll()).toHaveLength(0)
    })
  })

  describe('getAll', () => {
    it('returns empty array initially', () => {
      expect(service.getAll()).toEqual([])
    })

    it('returns all registered shortcuts', () => {
      const callback = vi.fn()
      service.register(
        { accelerator: 'CommandOrControl+N', description: 'New Chat', enabled: true },
        callback
      )
      service.register(
        { accelerator: 'CommandOrControl+S', description: 'Save', enabled: true },
        callback
      )

      const all = service.getAll()
      expect(all).toHaveLength(2)
      expect(all[0].accelerator).toBe('CommandOrControl+N')
      expect(all[1].accelerator).toBe('CommandOrControl+S')
    })
  })
})
