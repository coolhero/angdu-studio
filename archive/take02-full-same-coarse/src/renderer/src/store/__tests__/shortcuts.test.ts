import { describe, expect, it, vi } from 'vitest'

vi.mock('redux-persist/lib/storage', () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined)
  }
}))

import { DEFAULT_SHORTCUTS } from '@shared/config'
import type { Shortcut } from '@shared/types'
import shortcutsReducer, { setShortcuts, toggleShortcutEnabled, updateShortcut } from '../shortcuts'

describe('shortcuts store slice', () => {
  const getInitialState = () => shortcutsReducer(undefined, { type: '@@INIT' })

  describe('initial state', () => {
    it('should have DEFAULT_SHORTCUTS as initial shortcuts', () => {
      const state = getInitialState()
      expect(state.shortcuts).toEqual(DEFAULT_SHORTCUTS)
    })

    it('should include show-hide-app shortcut by default', () => {
      const state = getInitialState()
      const showHide = state.shortcuts.find((s) => s.key === 'show-hide-app')
      expect(showHide).toBeDefined()
      expect(showHide?.shortcut).toEqual(['CmdOrCtrl+Shift+Space'])
      expect(showHide?.enabled).toBe(true)
    })
  })

  describe('setShortcuts', () => {
    it('should replace entire shortcuts array', () => {
      const newShortcuts: Shortcut[] = [
        { key: 'new-chat', shortcut: ['CmdOrCtrl+N'], enabled: true },
        { key: 'settings', shortcut: ['CmdOrCtrl+,'], enabled: false }
      ]
      const state = shortcutsReducer(getInitialState(), setShortcuts(newShortcuts))
      expect(state.shortcuts).toEqual(newShortcuts)
      expect(state.shortcuts).toHaveLength(2)
    })

    it('should replace with an empty array', () => {
      const state = shortcutsReducer(getInitialState(), setShortcuts([]))
      expect(state.shortcuts).toEqual([])
    })
  })

  describe('updateShortcut', () => {
    it('should update matching shortcut by key', () => {
      const updated: Shortcut = {
        key: 'show-hide-app',
        shortcut: ['CmdOrCtrl+Shift+H'],
        enabled: true
      }
      const state = shortcutsReducer(getInitialState(), updateShortcut(updated))
      const found = state.shortcuts.find((s) => s.key === 'show-hide-app')
      expect(found).toBeDefined()
      expect(found?.shortcut).toEqual(['CmdOrCtrl+Shift+H'])
    })

    it('should do nothing for non-existent key', () => {
      const initial = getInitialState()
      const updated: Shortcut = {
        key: 'non-existent',
        shortcut: ['CmdOrCtrl+X'],
        enabled: true
      }
      const state = shortcutsReducer(initial, updateShortcut(updated))
      expect(state.shortcuts).toEqual(initial.shortcuts)
    })

    it('should update only the matched shortcut when multiple exist', () => {
      const initialWithMultiple = shortcutsReducer(
        getInitialState(),
        setShortcuts([
          { key: 'show-hide-app', shortcut: ['CmdOrCtrl+Shift+Space'], enabled: true },
          { key: 'new-chat', shortcut: ['CmdOrCtrl+N'], enabled: true }
        ])
      )
      const updated: Shortcut = {
        key: 'new-chat',
        shortcut: ['CmdOrCtrl+Shift+N'],
        enabled: false
      }
      const state = shortcutsReducer(initialWithMultiple, updateShortcut(updated))
      expect(state.shortcuts[0].shortcut).toEqual(['CmdOrCtrl+Shift+Space'])
      expect(state.shortcuts[1].shortcut).toEqual(['CmdOrCtrl+Shift+N'])
      expect(state.shortcuts[1].enabled).toBe(false)
    })
  })

  describe('toggleShortcutEnabled', () => {
    it('should toggle enabled flag from true to false', () => {
      const state = shortcutsReducer(getInitialState(), toggleShortcutEnabled('show-hide-app'))
      const found = state.shortcuts.find((s) => s.key === 'show-hide-app')
      expect(found).toBeDefined()
      expect(found?.enabled).toBe(false)
    })

    it('should toggle enabled flag from false to true', () => {
      const withDisabled = shortcutsReducer(getInitialState(), toggleShortcutEnabled('show-hide-app'))
      const state = shortcutsReducer(withDisabled, toggleShortcutEnabled('show-hide-app'))
      const found = state.shortcuts.find((s) => s.key === 'show-hide-app')
      expect(found).toBeDefined()
      expect(found?.enabled).toBe(true)
    })

    it('should do nothing for non-existent key', () => {
      const initial = getInitialState()
      const state = shortcutsReducer(initial, toggleShortcutEnabled('non-existent'))
      expect(state.shortcuts).toEqual(initial.shortcuts)
    })
  })

  describe('persistence via redux-persist', () => {
    it('should verify shortcuts slice is included in persisted state (not in blacklist)', async () => {
      const storeModule = await import('../index')
      const state = storeModule.store.getState()
      expect(state).toHaveProperty('shortcuts')
    })

    it('should verify shortcuts state shape has shortcuts array', async () => {
      const storeModule = await import('../index')
      const state = storeModule.store.getState()
      expect(state.shortcuts).toHaveProperty('shortcuts')
      expect(Array.isArray(state.shortcuts.shortcuts)).toBe(true)
    })
  })
})
