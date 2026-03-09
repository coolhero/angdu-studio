import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@renderer/stores/useSettingsStore'
import { SettingItem } from '@renderer/components/settings/SettingItem'
import { SettingSection } from '@renderer/components/settings/SettingSection'
import { Select } from '@renderer/components/ui/select'
import { Switch } from '@renderer/components/ui/switch'
import { Input } from '@renderer/components/ui/input'

export default function GeneralSettings() {
  const { t, i18n } = useTranslation()

  const language = useSettingsStore((s) => s.language)
  const sendMessageShortcut = useSettingsStore((s) => s.sendMessageShortcut)
  const proxyMode = useSettingsStore((s) => s.proxyMode)
  const proxyUrl = useSettingsStore((s) => s.proxyUrl)
  const launchOnBoot = useSettingsStore((s) => s.launchOnBoot)
  const launchToTray = useSettingsStore((s) => s.launchToTray)
  const setSetting = useSettingsStore((s) => s.setSetting)

  return (
    <div className="space-y-4 p-6">
      <SettingSection title={t('settings.general.title', 'General')}>
        <SettingItem
          title={t('settings.general.language', 'Language')}
          description={t('settings.general.language_desc', 'Application display language')}
        >
          <Select
            value={language}
            onChange={(e) => {
              const val = e.target.value
              setSetting('language', val)
              i18n.changeLanguage(val)
            }}
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
          </Select>
        </SettingItem>

        <SettingItem
          title={t('settings.general.send_shortcut', 'Send Message Shortcut')}
          description={t('settings.general.send_shortcut_desc', 'Keyboard shortcut to send messages')}
        >
          <Select
            value={sendMessageShortcut}
            onChange={(e) => {
              setSetting(
                'sendMessageShortcut',
                e.target.value as 'Enter' | 'Shift+Enter' | 'Ctrl+Enter' | 'Meta+Enter',
              )
            }}
          >
            <option value="Enter">Enter</option>
            <option value="Shift+Enter">Shift+Enter</option>
            <option value="Ctrl+Enter">Ctrl+Enter</option>
            <option value="Meta+Enter">Meta+Enter</option>
          </Select>
        </SettingItem>
      </SettingSection>

      <SettingSection title={t('settings.general.proxy', 'Proxy')}>
        <SettingItem
          title={t('settings.general.proxy_mode', 'Proxy Mode')}
          description={t('settings.general.proxy_mode_desc', 'Network proxy configuration')}
        >
          <Select
            value={proxyMode}
            onChange={(e) => {
              setSetting('proxyMode', e.target.value as 'system' | 'custom' | 'none')
            }}
          >
            <option value="system">{t('settings.general.proxy_system', 'System')}</option>
            <option value="custom">{t('settings.general.proxy_custom', 'Custom')}</option>
            <option value="none">{t('settings.general.proxy_none', 'None')}</option>
          </Select>
        </SettingItem>

        {proxyMode === 'custom' && (
          <SettingItem
            title={t('settings.general.proxy_url', 'Proxy URL')}
            description={t('settings.general.proxy_url_desc', 'e.g. http://127.0.0.1:7890')}
          >
            <Input
              className="w-60"
              value={proxyUrl}
              placeholder="http://127.0.0.1:7890"
              onChange={(e) => setSetting('proxyUrl', e.target.value)}
            />
          </SettingItem>
        )}
      </SettingSection>

      <SettingSection title={t('settings.general.startup', 'Startup')}>
        <SettingItem
          title={t('settings.general.launch_on_boot', 'Launch on Boot')}
          description={t('settings.general.launch_on_boot_desc', 'Start application when system boots')}
        >
          <Switch
            checked={launchOnBoot}
            onCheckedChange={(val) => setSetting('launchOnBoot', val)}
          />
        </SettingItem>

        <SettingItem
          title={t('settings.general.launch_to_tray', 'Launch to Tray')}
          description={t('settings.general.launch_to_tray_desc', 'Minimize to system tray on launch')}
        >
          <Switch
            checked={launchToTray}
            onCheckedChange={(val) => setSetting('launchToTray', val)}
          />
        </SettingItem>
      </SettingSection>
    </div>
  )
}
