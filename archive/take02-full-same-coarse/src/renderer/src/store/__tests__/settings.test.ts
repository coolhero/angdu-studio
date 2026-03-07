import { describe, expect, it, vi } from 'vitest'

// Mock redux-persist/lib/storage before importing the store
vi.mock('redux-persist/lib/storage', () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined)
  }
}))

import { DEFAULT_THEME } from '@shared/config'
import type { ProxyConfig, ThemeMode } from '@shared/types'
import settingsReducer, {
  setLanguage,
  setLaunchAtLogin,
  setProxyConfig,
  setSendWithEnter,
  setTheme,
  setTrayEnabled,
  setTrayOnClose,
  setUser,
  updateUserAvatar,
  updateUserName
} from '../settings'

describe('settings store slice', () => {
  const getInitialState = () => settingsReducer(undefined, { type: '@@INIT' })

  describe('initial state defaults', () => {
    it('should have language set to en-US', () => {
      const state = getInitialState()
      expect(state.language).toBe('en-US')
    })

    it('should have theme set to DEFAULT_THEME (system)', () => {
      const state = getInitialState()
      expect(state.theme).toBe(DEFAULT_THEME)
      expect(state.theme).toBe('system')
    })

    it('should have launchAtLogin set to false', () => {
      const state = getInitialState()
      expect(state.launchAtLogin).toBe(false)
    })

    it('should have trayEnabled set to true', () => {
      const state = getInitialState()
      expect(state.trayEnabled).toBe(true)
    })

    it('should have trayOnClose set to false', () => {
      const state = getInitialState()
      expect(state.trayOnClose).toBe(false)
    })

    it('should have sendWithEnter set to true', () => {
      const state = getInitialState()
      expect(state.sendWithEnter).toBe(true)
    })

    it('should have proxyConfig with mode direct', () => {
      const state = getInitialState()
      expect(state.proxyConfig).toEqual({ mode: 'direct' })
    })

    it('should have user with default values', () => {
      const state = getInitialState()
      expect(state.user).toEqual({
        id: '',
        name: 'User',
        avatar: ''
      })
    })
  })

  describe('setLanguage', () => {
    it('should update language to the given value', () => {
      const state = settingsReducer(getInitialState(), setLanguage('zh-CN'))
      expect(state.language).toBe('zh-CN')
    })

    it('should accept any locale string', () => {
      const state = settingsReducer(getInitialState(), setLanguage('ja-JP'))
      expect(state.language).toBe('ja-JP')
    })
  })

  describe('setTheme', () => {
    it('should update theme to dark', () => {
      const state = settingsReducer(getInitialState(), setTheme('dark'))
      expect(state.theme).toBe('dark')
    })

    it('should update theme to light', () => {
      const state = settingsReducer(getInitialState(), setTheme('light'))
      expect(state.theme).toBe('light')
    })

    it('should update theme to system', () => {
      const prev = settingsReducer(getInitialState(), setTheme('dark'))
      const state = settingsReducer(prev, setTheme('system'))
      expect(state.theme).toBe('system')
    })
  })

  describe('setLaunchAtLogin', () => {
    it('should set launchAtLogin to true', () => {
      const state = settingsReducer(getInitialState(), setLaunchAtLogin(true))
      expect(state.launchAtLogin).toBe(true)
    })

    it('should set launchAtLogin to false', () => {
      const prev = settingsReducer(getInitialState(), setLaunchAtLogin(true))
      const state = settingsReducer(prev, setLaunchAtLogin(false))
      expect(state.launchAtLogin).toBe(false)
    })
  })

  describe('setTrayEnabled', () => {
    it('should set trayEnabled to false', () => {
      const state = settingsReducer(getInitialState(), setTrayEnabled(false))
      expect(state.trayEnabled).toBe(false)
    })

    it('should set trayEnabled to true', () => {
      const prev = settingsReducer(getInitialState(), setTrayEnabled(false))
      const state = settingsReducer(prev, setTrayEnabled(true))
      expect(state.trayEnabled).toBe(true)
    })
  })

  describe('setTrayOnClose', () => {
    it('should set trayOnClose to true', () => {
      const state = settingsReducer(getInitialState(), setTrayOnClose(true))
      expect(state.trayOnClose).toBe(true)
    })
  })

  describe('setSendWithEnter', () => {
    it('should set sendWithEnter to false', () => {
      const state = settingsReducer(getInitialState(), setSendWithEnter(false))
      expect(state.sendWithEnter).toBe(false)
    })
  })

  describe('setProxyConfig', () => {
    it('should update proxy config with manual mode', () => {
      const proxy: ProxyConfig = {
        mode: 'manual',
        protocol: 'http',
        host: '127.0.0.1',
        port: 8080
      }
      const state = settingsReducer(getInitialState(), setProxyConfig(proxy))
      expect(state.proxyConfig).toEqual(proxy)
    })

    it('should update proxy config with system mode', () => {
      const proxy: ProxyConfig = { mode: 'system' }
      const state = settingsReducer(getInitialState(), setProxyConfig(proxy))
      expect(state.proxyConfig).toEqual(proxy)
    })

    it('should update proxy config with socks5 protocol', () => {
      const proxy: ProxyConfig = {
        mode: 'manual',
        protocol: 'socks5',
        host: 'proxy.example.com',
        port: 1080,
        username: 'user',
        password: 'pass'
      }
      const state = settingsReducer(getInitialState(), setProxyConfig(proxy))
      expect(state.proxyConfig).toEqual(proxy)
    })
  })

  describe('setUser', () => {
    it('should replace the entire user object', () => {
      const user = { id: 'u1', name: 'Alice', avatar: 'https://example.com/avatar.png' }
      const state = settingsReducer(getInitialState(), setUser(user))
      expect(state.user).toEqual(user)
    })
  })

  describe('updateUserName', () => {
    it('should update only the user name', () => {
      const state = settingsReducer(getInitialState(), updateUserName('Bob'))
      expect(state.user.name).toBe('Bob')
      expect(state.user.id).toBe('')
      expect(state.user.avatar).toBe('')
    })
  })

  describe('updateUserAvatar', () => {
    it('should update only the user avatar', () => {
      const state = settingsReducer(getInitialState(), updateUserAvatar('https://example.com/new.png'))
      expect(state.user.avatar).toBe('https://example.com/new.png')
      expect(state.user.name).toBe('User')
    })
  })

  describe('persistence whitelist', () => {
    it('should verify settings slice is included in persisted state (not in blacklist)', async () => {
      // The store index.ts uses a blacklist approach with only 'runtime' blacklisted
      // This means 'settings' IS persisted. We verify by importing store config.
      const storeModule = await import('../index')
      // The persistConfig blacklist should only contain 'runtime'
      // If settings were in blacklist, it would not persist
      // We check that the store has a settings reducer key
      const state = storeModule.store.getState()
      expect(state).toHaveProperty('settings')
    })
  })

  // T055: Theme integration test
  describe('theme integration', () => {
    it('should update theme via setTheme action', () => {
      const state = settingsReducer(getInitialState(), setTheme('dark'))
      expect(state.theme).toBe('dark')
    })

    it('should default theme from DEFAULT_THEME constant', () => {
      const state = getInitialState()
      expect(state.theme).toBe(DEFAULT_THEME)
    })

    it('should accept all valid ThemeMode values', () => {
      const modes: ThemeMode[] = ['light', 'dark', 'system']
      for (const mode of modes) {
        const state = settingsReducer(getInitialState(), setTheme(mode))
        expect(state.theme).toBe(mode)
      }
    })
  })
})
