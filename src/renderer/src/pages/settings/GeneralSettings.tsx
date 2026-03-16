import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@renderer/stores/useSettingsStore'
import { useTabsStore } from '@renderer/stores/useTabsStore'
import { SettingSection } from '@renderer/components/settings/SettingSection'
import { SettingItem } from '@renderer/components/settings/SettingItem'
import { Switch } from '@renderer/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@renderer/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@renderer/components/ui/radio-group'
import { Label } from '@renderer/components/ui/label'
import type { SendKey } from '@shared/types/settings'
import type { NavbarPosition } from '@shared/types/config'
import { QuickPhraseEditor } from '@renderer/components/settings/QuickPhraseEditor'

const LANGUAGES = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
  { value: 'zh-CN', label: '中文 (简体)' }
]

export default function GeneralSettings() {
  const { t, i18n } = useTranslation()

  // Scalar selectors for referential stability
  const language = useSettingsStore((s) => s.language)
  const sendKey = useSettingsStore((s) => s.sendKey)
  const launchAtLogin = useSettingsStore((s) => s.launchAtLogin)
  const startMinimized = useSettingsStore((s) => s.startMinimized)
  const proxyUrl = useSettingsStore((s) => s.proxyUrl)
  const autoUpdate = useSettingsStore((s) => s.autoUpdate)
  const navbarPosition = useTabsStore((s) => s.navbarPosition)

  // Use the store's setLanguage (handles config:set internally)
  const setLanguage = useSettingsStore((s) => s.setLanguage)
  const setNavbarPosition = useTabsStore((s) => s.setNavbarPosition)

  const handleLanguageChange = useCallback(
    (value: string) => {
      setLanguage(value)
      i18n.changeLanguage(value)
    },
    [setLanguage, i18n]
  )

  const handleNavbarPositionChange = useCallback(
    (value: string) => {
      setNavbarPosition(value as NavbarPosition)
    },
    [setNavbarPosition]
  )

  const handleSendKeyChange = useCallback(
    (value: string) => {
      useSettingsStore.getState().setSetting('sendKey', value as SendKey)
    },
    []
  )

  const handleLaunchAtLoginChange = useCallback((checked: boolean) => {
    useSettingsStore.getState().setSetting('launchAtLogin', checked)
    window.api.invoke['startup:setLoginItem'](checked)
  }, [])

  const handleStartMinimizedChange = useCallback((checked: boolean) => {
    useSettingsStore.getState().setSetting('startMinimized', checked)
  }, [])

  const handleAutoUpdateChange = useCallback((checked: boolean) => {
    useSettingsStore.getState().setSetting('autoUpdate', checked)
  }, [])

  const handleProxyChange = useCallback(
    (type: 'host' | 'port', value: string) => {
      let host = ''
      let port = ''
      if (proxyUrl) {
        try {
          const url = new URL(proxyUrl)
          host = url.hostname
          port = url.port
        } catch {
          // invalid URL, reset
        }
      }

      if (type === 'host') host = value
      if (type === 'port') port = value

      if (!host && !port) {
        useSettingsStore.getState().setSetting('proxyUrl', null)
      } else {
        const newUrl = `http://${host}${port ? `:${port}` : ''}`
        useSettingsStore.getState().setSetting('proxyUrl', newUrl)
      }
    },
    [proxyUrl]
  )

  // Parse proxy URL into host/port
  let proxyHost = ''
  let proxyPort = ''
  if (proxyUrl) {
    try {
      const url = new URL(proxyUrl)
      proxyHost = url.hostname
      proxyPort = url.port
    } catch {
      // invalid URL
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="mb-6 text-xl font-bold text-foreground">{t('settings.general.title')}</h2>

      <SettingSection title={t('settings.general.language')}>
        <SettingItem label={t('settings.general.language')} description={t('settings.general.languageDesc')}>
          <Select value={language || 'en'} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingItem>
      </SettingSection>

      <SettingSection title={t('settings.general.navbarPosition')}>
        <SettingItem label={t('settings.general.navbarPosition')} description={t('settings.general.navbarPositionDesc')}>
          <RadioGroup value={navbarPosition} onValueChange={handleNavbarPositionChange} className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="top" id="navbar-top" />
              <Label htmlFor="navbar-top">{t('settings.general.navbarTop')}</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="left" id="navbar-left" />
              <Label htmlFor="navbar-left">{t('settings.general.navbarLeft')}</Label>
            </div>
          </RadioGroup>
        </SettingItem>
      </SettingSection>

      <SettingSection title={t('settings.general.sendKey')}>
        <SettingItem label={t('settings.general.sendKey')} description={t('settings.general.sendKeyDesc')}>
          <RadioGroup value={sendKey} onValueChange={handleSendKeyChange} className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="enter" id="send-enter" />
              <Label htmlFor="send-enter">{t('settings.general.enter')}</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="ctrl+enter" id="send-ctrl-enter" />
              <Label htmlFor="send-ctrl-enter">{t('settings.general.ctrlEnter')}</Label>
            </div>
          </RadioGroup>
        </SettingItem>
      </SettingSection>

      <SettingSection title={t('settings.general.startup')}>
        <SettingItem label={t('settings.general.launchAtLogin')} description={t('settings.general.launchAtLoginDesc')}>
          <Switch checked={launchAtLogin} onCheckedChange={handleLaunchAtLoginChange} />
        </SettingItem>
        <SettingItem label={t('settings.general.startMinimized')} description={t('settings.general.startMinimizedDesc')}>
          <Switch checked={startMinimized} onCheckedChange={handleStartMinimizedChange} />
        </SettingItem>
      </SettingSection>

      <SettingSection title={t('settings.general.proxy')}>
        <SettingItem label={t('settings.general.proxyHost')} description={t('settings.general.proxyDesc')}>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={proxyHost}
              onChange={(e) => handleProxyChange('host', e.target.value)}
              placeholder="127.0.0.1"
              className="h-9 w-36 rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <span className="text-sm text-muted-foreground">:</span>
            <input
              type="text"
              value={proxyPort}
              onChange={(e) => handleProxyChange('port', e.target.value)}
              placeholder="7890"
              className="h-9 w-20 rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </SettingItem>
      </SettingSection>

      <SettingSection title={t('settings.general.autoUpdate')}>
        <SettingItem label={t('settings.general.autoUpdate')} description={t('settings.general.autoUpdateDesc')}>
          <Switch checked={autoUpdate} onCheckedChange={handleAutoUpdateChange} />
        </SettingItem>
      </SettingSection>

      <QuickPhraseEditor />
    </div>
  )
}
