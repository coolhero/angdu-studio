import { useTranslation } from 'react-i18next'

import { ColorPicker } from '@renderer/components/settings/ColorPicker'
import { SettingItem } from '@renderer/components/settings/SettingItem'
import { Input } from '@renderer/components/ui/input'
import { useSettingsStore } from '@renderer/stores/useSettingsStore'

export default function DisplaySettings(): JSX.Element {
  const { t } = useTranslation()

  const themeMode = useSettingsStore((s) => s.themeMode)
  const fontSize = useSettingsStore((s) => s.fontSize)
  const fontFamily = useSettingsStore((s) => s.fontFamily)
  const codeFontFamily = useSettingsStore((s) => s.codeFontFamily)
  const primaryColor = useSettingsStore((s) => s.primaryColor)
  const showMessageDivider = useSettingsStore((s) => s.showMessageDivider)
  const topicPosition = useSettingsStore((s) => s.topicPosition)
  const windowStyle = useSettingsStore((s) => s.windowStyle)
  const setSetting = useSettingsStore((s) => s.setSetting)

  return (
    <div className="p-6">
      <h2 className="mb-4 text-lg font-semibold">{t('settings.display.title', 'Display')}</h2>

      <div className="space-y-1">
        {/* Theme Mode */}
        <SettingItem title={t('settings.display.themeMode', 'Theme Mode')}>
          <select
            className="h-9 rounded-md border border-zinc-200 bg-transparent px-3 text-sm dark:border-zinc-700"
            value={themeMode}
            onChange={(e) => setSetting('themeMode', e.target.value as 'dark' | 'light' | 'auto')}
          >
            <option value="dark">{t('settings.display.themeDark', 'Dark')}</option>
            <option value="light">{t('settings.display.themeLight', 'Light')}</option>
            <option value="auto">{t('settings.display.themeAuto', 'Auto')}</option>
          </select>
        </SettingItem>

        {/* Font Size */}
        <SettingItem title={t('settings.display.fontSize', 'Font Size')}>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={10}
              max={24}
              step={1}
              value={fontSize}
              onChange={(e) => setSetting('fontSize', Number(e.target.value))}
              className="h-1.5 w-32 cursor-pointer appearance-none rounded-full bg-zinc-200 accent-primary dark:bg-zinc-700"
            />
            <span className="w-8 text-right text-sm tabular-nums text-zinc-600 dark:text-zinc-300">
              {fontSize}
            </span>
          </div>
        </SettingItem>

        {/* Font Family */}
        <SettingItem title={t('settings.display.fontFamily', 'Font Family')}>
          <Input
            className="h-9 w-48"
            value={fontFamily}
            onChange={(e) => setSetting('fontFamily', e.target.value)}
          />
        </SettingItem>

        {/* Code Font Family */}
        <SettingItem title={t('settings.display.codeFontFamily', 'Code Font Family')}>
          <Input
            className="h-9 w-48"
            value={codeFontFamily}
            onChange={(e) => setSetting('codeFontFamily', e.target.value)}
          />
        </SettingItem>

        {/* Primary Color */}
        <SettingItem title={t('settings.display.primaryColor', 'Primary Color')}>
          <ColorPicker
            value={primaryColor}
            onChange={(color) => setSetting('primaryColor', color)}
          />
        </SettingItem>

        {/* Show Message Divider */}
        <SettingItem title={t('settings.display.showMessageDivider', 'Show Message Divider')}>
          <button
            type="button"
            role="switch"
            aria-checked={showMessageDivider}
            onClick={() => setSetting('showMessageDivider', !showMessageDivider)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
              showMessageDivider ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                showMessageDivider ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
        </SettingItem>

        {/* Topic Position */}
        <SettingItem title={t('settings.display.topicPosition', 'Topic Position')}>
          <select
            className="h-9 rounded-md border border-zinc-200 bg-transparent px-3 text-sm dark:border-zinc-700"
            value={topicPosition}
            onChange={(e) => setSetting('topicPosition', e.target.value as 'left' | 'right')}
          >
            <option value="left">{t('settings.display.positionLeft', 'Left')}</option>
            <option value="right">{t('settings.display.positionRight', 'Right')}</option>
          </select>
        </SettingItem>

        {/* Window Style */}
        <SettingItem title={t('settings.display.windowStyle', 'Window Style')}>
          <select
            className="h-9 rounded-md border border-zinc-200 bg-transparent px-3 text-sm dark:border-zinc-700"
            value={windowStyle}
            onChange={(e) =>
              setSetting('windowStyle', e.target.value as 'default' | 'transparent')
            }
          >
            <option value="default">{t('settings.display.windowDefault', 'Default')}</option>
            <option value="transparent">
              {t('settings.display.windowTransparent', 'Transparent')}
            </option>
          </select>
        </SettingItem>
      </div>
    </div>
  )
}
