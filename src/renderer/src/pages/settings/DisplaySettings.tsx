import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@renderer/stores/useSettingsStore'
import { SettingSection } from '@renderer/components/settings/SettingSection'
import { SettingItem } from '@renderer/components/settings/SettingItem'
import { RadioGroup, RadioGroupItem } from '@renderer/components/ui/radio-group'
import { Label } from '@renderer/components/ui/label'
import { Slider } from '@renderer/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@renderer/components/ui/select'
import { setThemeIPC } from '@renderer/hooks/useTheme'
import type { Theme } from '@shared/types/config'
import type { MessageStyle, AvatarStyle } from '@shared/types/settings'

const CODE_BLOCK_THEMES = [
  { value: 'github-dark', label: 'GitHub Dark' },
  { value: 'monokai', label: 'Monokai' },
  { value: 'one-dark-pro', label: 'One Dark Pro' },
  { value: 'dracula', label: 'Dracula' },
  { value: 'solarized-dark', label: 'Solarized Dark' },
  { value: 'github-light', label: 'GitHub Light' }
]

export default function DisplaySettings() {
  const { t } = useTranslation()

  // Scalar selectors for referential stability
  const theme = useSettingsStore((s) => s.theme)
  const fontSize = useSettingsStore((s) => s.fontSize)
  const messageStyle = useSettingsStore((s) => s.messageStyle)
  const avatarStyle = useSettingsStore((s) => s.avatarStyle)
  const codeBlockTheme = useSettingsStore((s) => s.codeBlockTheme)
  const customCSS = useSettingsStore((s) => s.customCSS)

  const handleThemeChange = useCallback((value: string) => {
    const newTheme = value as Theme
    useSettingsStore.getState().setTheme(newTheme)
    setThemeIPC(newTheme)
  }, [])

  const handleFontSizeChange = useCallback((value: number[]) => {
    const size = value[0]
    // Immediately update store for UI feedback
    useSettingsStore.getState().setSetting('fontSize', size)
    // The store's setSetting already debounces fontSize IPC calls (it's in DEBOUNCED_KEYS)
  }, [])

  const handleMessageStyleChange = useCallback((value: string) => {
    useSettingsStore.getState().setSetting('messageStyle', value as MessageStyle)
  }, [])

  const handleAvatarStyleChange = useCallback((value: string) => {
    useSettingsStore.getState().setSetting('avatarStyle', value as AvatarStyle)
  }, [])

  const handleCodeBlockThemeChange = useCallback((value: string) => {
    useSettingsStore.getState().setSetting('codeBlockTheme', value)
  }, [])

  const handleCustomCSSChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      // Immediately update store for UI feedback; IPC is debounced internally (customCSS is in DEBOUNCED_KEYS)
      useSettingsStore.getState().setSetting('customCSS', value)
    },
    []
  )

  // Inject custom CSS into a <style> element
  useEffect(() => {
    let styleEl = document.getElementById('custom-css') as HTMLStyleElement | null
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = 'custom-css'
      document.head.appendChild(styleEl)
    }
    styleEl.textContent = customCSS
  }, [customCSS])

  return (
    <div className="max-w-2xl">
      <h2 className="mb-6 text-xl font-bold text-foreground">{t('settings.display.title')}</h2>

      <SettingSection title={t('settings.display.theme')}>
        <SettingItem label={t('settings.display.theme')} description={t('settings.display.themeDesc')}>
          <RadioGroup value={theme} onValueChange={handleThemeChange} className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="light" id="theme-light" />
              <Label htmlFor="theme-light">{t('settings.display.themeLight')}</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="dark" id="theme-dark" />
              <Label htmlFor="theme-dark">{t('settings.display.themeDark')}</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="system" id="theme-system" />
              <Label htmlFor="theme-system">{t('settings.display.themeSystem')}</Label>
            </div>
          </RadioGroup>
        </SettingItem>
      </SettingSection>

      <SettingSection title={t('settings.display.fontSize')}>
        <SettingItem label={t('settings.display.fontSize')} description={t('settings.display.fontSizeDesc')}>
          <div className="flex items-center gap-3">
            <Slider
              value={[fontSize]}
              onValueChange={handleFontSizeChange}
              min={12}
              max={24}
              step={1}
              className="w-40"
            />
            <span className="w-8 text-right text-sm text-muted-foreground">{fontSize}</span>
          </div>
        </SettingItem>
      </SettingSection>

      <SettingSection title={t('settings.display.messageStyle')}>
        <SettingItem label={t('settings.display.messageStyle')} description={t('settings.display.messageStyleDesc')}>
          <RadioGroup value={messageStyle} onValueChange={handleMessageStyleChange} className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="bubble" id="msg-bubble" />
              <Label htmlFor="msg-bubble">{t('settings.display.messageBubble')}</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="plain" id="msg-plain" />
              <Label htmlFor="msg-plain">{t('settings.display.messagePlain')}</Label>
            </div>
          </RadioGroup>
        </SettingItem>
      </SettingSection>

      <SettingSection title={t('settings.display.avatarStyle')}>
        <SettingItem label={t('settings.display.avatarStyle')} description={t('settings.display.avatarStyleDesc')}>
          <RadioGroup value={avatarStyle} onValueChange={handleAvatarStyleChange} className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="default" id="avatar-default" />
              <Label htmlFor="avatar-default">{t('settings.display.avatarDefault')}</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="identicon" id="avatar-identicon" />
              <Label htmlFor="avatar-identicon">{t('settings.display.avatarIdenticon')}</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="initials" id="avatar-initials" />
              <Label htmlFor="avatar-initials">{t('settings.display.avatarInitials')}</Label>
            </div>
          </RadioGroup>
        </SettingItem>
      </SettingSection>

      <SettingSection title={t('settings.display.codeBlockTheme')}>
        <SettingItem label={t('settings.display.codeBlockTheme')} description={t('settings.display.codeBlockThemeDesc')}>
          <Select value={codeBlockTheme} onValueChange={handleCodeBlockThemeChange}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CODE_BLOCK_THEMES.map((ct) => (
                <SelectItem key={ct.value} value={ct.value}>
                  {ct.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingItem>
      </SettingSection>

      <SettingSection title={t('settings.display.customCSS')}>
        <div className="py-3">
          <p className="mb-2 text-xs text-muted-foreground">{t('settings.display.customCSSDesc')}</p>
          <textarea
            value={customCSS}
            onChange={handleCustomCSSChange}
            placeholder={t('settings.display.customCSSPlaceholder')}
            className="h-32 w-full rounded-md border border-border bg-transparent px-3 py-2 font-mono text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            spellCheck={false}
          />
        </div>
      </SettingSection>
    </div>
  )
}
