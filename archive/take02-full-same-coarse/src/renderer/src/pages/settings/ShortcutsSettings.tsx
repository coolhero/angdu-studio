import { useAppDispatch, useAppSelector } from '@renderer/store'
import { toggleShortcutEnabled } from '@renderer/store/shortcuts'
import type { Shortcut } from '@shared/types'
import { Divider, List, Switch, Tag, Typography } from 'antd'

const { Title, Text } = Typography

const ACTION_LABELS: Record<string, string> = {
  'show-hide-app': 'Show/Hide App'
}

function getActionLabel(key: string): string {
  return ACTION_LABELS[key] || key
}

export default function ShortcutsSettings() {
  const dispatch = useAppDispatch()
  const shortcuts = useAppSelector((state) => state.shortcuts.shortcuts)

  const handleToggle = async (shortcut: Shortcut) => {
    dispatch(toggleShortcutEnabled(shortcut.key))

    const updated = shortcuts.map((s) => (s.key === shortcut.key ? { ...s, enabled: !s.enabled } : s))

    try {
      await window.api.shortcuts.update(updated)
    } catch {
      // Revert on failure
      dispatch(toggleShortcutEnabled(shortcut.key))
    }
  }

  return (
    <div className="max-w-xl">
      <Title level={4}>Keyboard Shortcuts</Title>

      <Divider />

      <Text type="secondary" className="mb-4 block">
        Configure global keyboard shortcuts. These shortcuts work even when the app is not focused.
      </Text>

      <List
        data-testid="shortcuts-list"
        dataSource={shortcuts}
        renderItem={(shortcut: Shortcut) => (
          <div data-testid="shortcut-row" className="flex items-center justify-between mb-4 py-2">
            <div className="flex-1">
              <Text strong>{getActionLabel(shortcut.key)}</Text>
              <div className="mt-1">
                {shortcut.shortcut.map((accelerator) => (
                  <Tag key={accelerator} color={shortcut.enabled ? 'blue' : 'default'}>
                    {accelerator}
                  </Tag>
                ))}
              </div>
            </div>
            <Switch data-testid="shortcut-toggle" checked={shortcut.enabled} onChange={() => handleToggle(shortcut)} />
          </div>
        )}
      />
    </div>
  )
}
