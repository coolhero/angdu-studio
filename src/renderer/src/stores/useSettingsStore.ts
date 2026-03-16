import { create } from 'zustand'
import i18n from 'i18next'
import type { AppConfig, ConfigKey, Theme } from '@shared/types/config'
import type { NavbarPosition } from '@shared/types/config'
import type { SendKey, MessageStyle, AvatarStyle } from '@shared/types/settings'
import { F003_CONFIG_DEFAULTS } from '@shared/types/settings'

// ─── Debounce utility ───────────────────────────────────────────────────────
const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>()

function debouncedConfigSet<K extends ConfigKey>(key: K, value: AppConfig[K], delayMs: number): void {
  const existing = debounceTimers.get(key)
  if (existing) clearTimeout(existing)
  debounceTimers.set(
    key,
    setTimeout(() => {
      window.api.invoke['config:set'](key, value as never)
      debounceTimers.delete(key)
    }, delayMs)
  )
}

// Keys that require debounced IPC calls (continuous inputs)
const DEBOUNCED_KEYS = new Set<ConfigKey>(['fontSize', 'customCSS', 'proxyUrl'])

// ─── Store types ────────────────────────────────────────────────────────────
interface SettingsState {
  // F001 keys exposed through settings
  theme: Theme
  language: string
  proxyUrl: string | null
  autoUpdate: boolean
  updateInterval: number
  navbarPosition: NavbarPosition

  // F003-owned keys
  fontSize: number
  sendKey: SendKey
  messageStyle: MessageStyle
  avatarStyle: AvatarStyle
  codeBlockTheme: string
  customCSS: string
  launchAtLogin: boolean
  startMinimized: boolean
  backupMaxRetained: number

  // Hydration state
  isHydrated: boolean

  // Actions
  hydrate: () => Promise<void>
  setSetting: <K extends ConfigKey>(key: K, value: AppConfig[K]) => void
  setTheme: (theme: Theme) => void
  setLanguage: (lang: string) => void
  setNavbarPosition: (pos: NavbarPosition) => void
  resetAll: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  // F001 defaults
  theme: 'light',
  language: '',
  proxyUrl: null,
  autoUpdate: true,
  updateInterval: 3600000,
  navbarPosition: 'top',

  // F003 defaults
  fontSize: F003_CONFIG_DEFAULTS.fontSize,
  sendKey: F003_CONFIG_DEFAULTS.sendKey,
  messageStyle: F003_CONFIG_DEFAULTS.messageStyle,
  avatarStyle: F003_CONFIG_DEFAULTS.avatarStyle,
  codeBlockTheme: F003_CONFIG_DEFAULTS.codeBlockTheme,
  customCSS: F003_CONFIG_DEFAULTS.customCSS,
  launchAtLogin: F003_CONFIG_DEFAULTS.launchAtLogin,
  startMinimized: F003_CONFIG_DEFAULTS.startMinimized,
  backupMaxRetained: F003_CONFIG_DEFAULTS.backupMaxRetained,

  isHydrated: false,

  hydrate: async () => {
    try {
      const config = await window.api.invoke['config:getAll']()
      const language = config.language || 'ko'
      set({
        theme: config.theme ?? 'light',
        language,
        proxyUrl: config.proxyUrl ?? null,
        autoUpdate: config.autoUpdate ?? true,
        updateInterval: config.updateInterval ?? 3600000,
        navbarPosition: config.navbarPosition ?? 'top',
        fontSize: config.fontSize ?? F003_CONFIG_DEFAULTS.fontSize,
        sendKey: config.sendKey ?? F003_CONFIG_DEFAULTS.sendKey,
        messageStyle: config.messageStyle ?? F003_CONFIG_DEFAULTS.messageStyle,
        avatarStyle: config.avatarStyle ?? F003_CONFIG_DEFAULTS.avatarStyle,
        codeBlockTheme: config.codeBlockTheme ?? F003_CONFIG_DEFAULTS.codeBlockTheme,
        customCSS: config.customCSS ?? F003_CONFIG_DEFAULTS.customCSS,
        launchAtLogin: config.launchAtLogin ?? F003_CONFIG_DEFAULTS.launchAtLogin,
        startMinimized: config.startMinimized ?? F003_CONFIG_DEFAULTS.startMinimized,
        backupMaxRetained: config.backupMaxRetained ?? F003_CONFIG_DEFAULTS.backupMaxRetained,
        isHydrated: true
      })
      // Sync i18n language with persisted config (SKF-034 fix)
      if (language && i18n.language !== language) {
        i18n.changeLanguage(language)
      }
    } catch (err) {
      console.error('[useSettingsStore] Hydration failed, resetting config', err)
      try {
        await window.api.invoke['config:reset']()
      } catch {
        // reset also failed, use in-memory defaults
      }
      set({ isHydrated: true })
    }
  },

  setSetting: <K extends ConfigKey>(key: K, value: AppConfig[K]) => {
    set({ [key]: value } as Partial<SettingsState>)

    if (DEBOUNCED_KEYS.has(key)) {
      debouncedConfigSet(key, value, 300)
    } else {
      window.api.invoke['config:set'](key, value as never)
    }
  },

  setTheme: (theme: Theme) => {
    get().setSetting('theme', theme)
    window.api.invoke['theme:set'](theme)
  },

  setLanguage: (lang: string) => {
    get().setSetting('language', lang)
    i18n.changeLanguage(lang)
  },

  setNavbarPosition: (pos: NavbarPosition) => {
    get().setSetting('navbarPosition', pos)
  },

  resetAll: async () => {
    await window.api.invoke['config:reset']()
    await get().hydrate()
  }
}))

// ─── Referentially stable selectors ─────────────────────────────────────────
// Each selector returns a scalar value, ensuring referential stability.
export const useTheme = (): Theme => useSettingsStore((s) => s.theme)
export const useLanguage = (): string => useSettingsStore((s) => s.language)
export const useProxyUrl = (): string | null => useSettingsStore((s) => s.proxyUrl)
export const useAutoUpdate = (): boolean => useSettingsStore((s) => s.autoUpdate)
export const useFontSize = (): number => useSettingsStore((s) => s.fontSize)
export const useSendKey = (): SendKey => useSettingsStore((s) => s.sendKey)
export const useMessageStyle = (): MessageStyle => useSettingsStore((s) => s.messageStyle)
export const useAvatarStyle = (): AvatarStyle => useSettingsStore((s) => s.avatarStyle)
export const useCodeBlockTheme = (): string => useSettingsStore((s) => s.codeBlockTheme)
export const useCustomCSS = (): string => useSettingsStore((s) => s.customCSS)
export const useLaunchAtLogin = (): boolean => useSettingsStore((s) => s.launchAtLogin)
export const useStartMinimized = (): boolean => useSettingsStore((s) => s.startMinimized)
export const useBackupMaxRetained = (): number => useSettingsStore((s) => s.backupMaxRetained)
export const useSettingsHydrated = (): boolean => useSettingsStore((s) => s.isHydrated)
