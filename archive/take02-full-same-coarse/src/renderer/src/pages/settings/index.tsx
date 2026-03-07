import {
  BgColorsOutlined,
  DatabaseOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'
import type { SettingsTab } from '@renderer/types'
import { Menu } from 'antd'
import { useState } from 'react'
import AboutSettings from './AboutSettings'
import DataSettings from './DataSettings'
import DisplaySettings from './DisplaySettings'
import GeneralSettings from './GeneralSettings'
import ShortcutsSettings from './ShortcutsSettings'

const tabs: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { key: 'general', label: 'General', icon: <SettingOutlined /> },
  { key: 'display', label: 'Display', icon: <BgColorsOutlined /> },
  { key: 'shortcuts', label: 'Shortcuts', icon: <ThunderboltOutlined /> },
  { key: 'data', label: 'Data', icon: <DatabaseOutlined /> },
  { key: 'about', label: 'About', icon: <InfoCircleOutlined /> }
]

const tabComponents: Record<SettingsTab, React.ReactNode> = {
  general: <GeneralSettings />,
  display: <DisplaySettings />,
  shortcuts: <ShortcutsSettings />,
  data: <DataSettings />,
  about: <AboutSettings />
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')

  return (
    <div className="flex h-screen">
      <div className="border-r border-gray-200 dark:border-gray-700 p-4" style={{ width: 250 }}>
        <Menu
          mode="vertical"
          selectedKeys={[activeTab]}
          onClick={({ key }) => setActiveTab(key as SettingsTab)}
          items={tabs.map((t) => ({ key: t.key, label: t.label, icon: t.icon }))}
        />
      </div>
      <div className="flex-1 overflow-auto p-6">{tabComponents[activeTab]}</div>
    </div>
  )
}
