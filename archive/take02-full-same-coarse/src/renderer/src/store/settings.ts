import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { DEFAULT_THEME } from '@shared/config'
import type { ProxyConfig, ThemeMode } from '@shared/types'

interface User {
  id: string
  name: string
  avatar: string
}

interface SettingsState {
  language: string
  theme: ThemeMode
  launchAtLogin: boolean
  trayEnabled: boolean
  trayOnClose: boolean
  sendWithEnter: boolean
  proxyConfig: ProxyConfig
  user: User
}

const initialState: SettingsState = {
  language: 'en-US',
  theme: DEFAULT_THEME,
  launchAtLogin: false,
  trayEnabled: true,
  trayOnClose: false,
  sendWithEnter: true,
  proxyConfig: { mode: 'direct' },
  user: {
    id: '',
    name: 'User',
    avatar: ''
  }
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload
    },
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload
    },
    setLaunchAtLogin(state, action: PayloadAction<boolean>) {
      state.launchAtLogin = action.payload
    },
    setTrayEnabled(state, action: PayloadAction<boolean>) {
      state.trayEnabled = action.payload
    },
    setTrayOnClose(state, action: PayloadAction<boolean>) {
      state.trayOnClose = action.payload
    },
    setSendWithEnter(state, action: PayloadAction<boolean>) {
      state.sendWithEnter = action.payload
    },
    setProxyConfig(state, action: PayloadAction<ProxyConfig>) {
      state.proxyConfig = action.payload
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
    },
    updateUserName(state, action: PayloadAction<string>) {
      state.user.name = action.payload
    },
    updateUserAvatar(state, action: PayloadAction<string>) {
      state.user.avatar = action.payload
    }
  }
})

export const {
  setLanguage,
  setTheme,
  setLaunchAtLogin,
  setTrayEnabled,
  setTrayOnClose,
  setSendWithEnter,
  setProxyConfig,
  setUser,
  updateUserName,
  updateUserAvatar
} = settingsSlice.actions

export default settingsSlice.reducer
