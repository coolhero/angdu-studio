import { useAppDispatch, useAppSelector } from '@renderer/store'
import { setTheme } from '@renderer/store/settings'
import type { ThemeMode } from '@renderer/types'
import { Divider, Segmented, Typography } from 'antd'

const { Title, Text } = Typography

const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' }
]

export default function DisplaySettings() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.settings.theme)

  const handleThemeChange = async (mode: ThemeMode) => {
    dispatch(setTheme(mode))
    try {
      await window.api.setTheme(mode)
    } catch {
      // Error setting theme via IPC - the Redux state is already updated
      // so the UI will still reflect the change
    }
  }

  const effectiveTheme =
    theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme

  return (
    <div className="max-w-xl">
      <Title level={4}>Display Settings</Title>

      <Divider />

      <div className="mb-6">
        <div className="mb-3">
          <Text strong>Theme Mode</Text>
          <br />
          <Text type="secondary">Choose the appearance of Cherry Studio</Text>
        </div>
        <Segmented value={theme} onChange={(value) => handleThemeChange(value as ThemeMode)} options={themeOptions} />
        <div className="mt-2">
          <Text type="secondary">
            {theme === 'system'
              ? 'Automatically matches your operating system theme'
              : theme === 'dark'
                ? 'Dark mode reduces eye strain in low-light environments'
                : 'Light mode provides a bright, clean interface'}
          </Text>
        </div>
        <div className="mt-2">
          <Text type="secondary">
            Current effective theme: <Text strong>{effectiveTheme}</Text>
          </Text>
        </div>
      </div>
    </div>
  )
}
