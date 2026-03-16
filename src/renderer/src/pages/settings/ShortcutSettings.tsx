import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useShortcutsStore, useShortcutsList } from '@renderer/stores/useShortcutsStore'
import { SettingSection } from '@renderer/components/settings/SettingSection'
import { SettingItem } from '@renderer/components/settings/SettingItem'
import { ShortcutRecorder } from '@renderer/components/settings/ShortcutRecorder'
import { RotateCcw } from 'lucide-react'

export default function ShortcutSettings() {
  const { t } = useTranslation()
  const shortcuts = useShortcutsList()
  const updateShortcut = useShortcutsStore((s) => s.updateShortcut)
  const resetToDefaults = useShortcutsStore((s) => s.resetToDefaults)

  const handleUpdate = useCallback(
    (key: string, combo: string[]) => {
      updateShortcut(key, combo)
    },
    [updateShortcut]
  )

  const handleReset = useCallback(() => {
    resetToDefaults()
  }, [resetToDefaults])

  return (
    <div className="max-w-2xl">
      <h2 className="mb-6 text-xl font-bold text-foreground">{t('settings.shortcuts.title')}</h2>

      <SettingSection title={t('settings.shortcuts.keyBindings')}>
        {shortcuts.map((shortcut) => (
          <SettingItem
            key={shortcut.key}
            label={t(`settings.shortcuts.actions.${shortcut.key}`)}
            description={
              shortcut.system
                ? t('settings.shortcuts.systemShortcut')
                : undefined
            }
          >
            <ShortcutRecorder
              shortcut={shortcut}
              onUpdate={(combo) => handleUpdate(shortcut.key, combo)}
            />
          </SettingItem>
        ))}
      </SettingSection>

      <div className="mt-4">
        <button
          type="button"
          onClick={handleReset}
          className="flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {t('settings.shortcuts.resetToDefaults')}
        </button>
      </div>
    </div>
  )
}
