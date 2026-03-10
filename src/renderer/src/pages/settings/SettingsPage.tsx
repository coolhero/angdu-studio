import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Settings, Monitor, Database, Keyboard, MessageSquareQuote, Info, ArrowLeft, Bot, Wrench } from 'lucide-react'
import { ErrorBoundary } from '@renderer/components/ErrorBoundary'
import { useRuntimeStore } from '@renderer/stores/useRuntimeStore'
import GeneralSettings from './GeneralSettings'
import ProviderSettings from './ProviderSettings'
import DisplaySettings from './DisplaySettings'
import DataSettings from './DataSettings'
import ShortcutSettings from './ShortcutSettings'
import QuickPhraseSettings from './QuickPhraseSettings'
import AboutSettings from './AboutSettings'
import MCPSettings from './MCPSettings'

type SettingsTab = 'general' | 'provider' | 'mcp' | 'display' | 'data' | 'shortcuts' | 'quickPhrases' | 'about'

interface TabItem {
  id: SettingsTab
  labelKey: string
  icon: typeof Settings
}

const tabs: TabItem[] = [
  { id: 'general', labelKey: 'settings.tabs.general', icon: Settings },
  { id: 'provider', labelKey: 'settings.tabs.provider', icon: Bot },
  { id: 'mcp', labelKey: 'settings.tabs.mcp', icon: Wrench },
  { id: 'display', labelKey: 'settings.tabs.display', icon: Monitor },
  { id: 'data', labelKey: 'settings.tabs.data', icon: Database },
  { id: 'shortcuts', labelKey: 'settings.tabs.shortcuts', icon: Keyboard },
  { id: 'quickPhrases', labelKey: 'settings.tabs.quickPhrases', icon: MessageSquareQuote },
  { id: 'about', labelKey: 'settings.tabs.about', icon: Info }
]

const tabContentMap: Record<SettingsTab, () => JSX.Element> = {
  general: GeneralSettings,
  provider: ProviderSettings,
  mcp: MCPSettings,
  display: DisplaySettings,
  data: DataSettings,
  shortcuts: ShortcutSettings,
  quickPhrases: QuickPhraseSettings,
  about: AboutSettings
}

export default function SettingsPage(): JSX.Element {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const setActivePage = useRuntimeStore((s) => s.setActivePage)

  const ActiveContent = tabContentMap[activeTab]

  // MCP settings has its own internal layout (sidebar + content),
  // so we render it without the outer overflow-y-auto
  const isMcpTab = activeTab === 'mcp'

  return (
    <ErrorBoundary>
      <div className="flex h-full w-full">
        {/* Left sidebar with tab navigation */}
        <nav className="w-56 shrink-0 border-r border-border bg-muted/30 p-3">
          <button
            type="button"
            onClick={() => setActivePage('chat')}
            className="mb-3 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back', 'Back')}
          </button>
          <ul className="flex flex-col gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <li key={tab.id}>
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{t(tab.labelKey)}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Right side with tab content */}
        <main className={isMcpTab ? 'flex-1 overflow-hidden' : 'flex-1 overflow-y-auto'}>
          <ActiveContent />
        </main>
      </div>
    </ErrorBoundary>
  )
}
