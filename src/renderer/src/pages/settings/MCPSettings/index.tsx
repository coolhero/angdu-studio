import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Wrench, Package, ShoppingBag, Search, Download } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { ErrorBoundary } from '@renderer/components/ErrorBoundary'
import McpServersList from './McpServersList'
import McpSettings from './McpSettings'
import BuiltinMCPServerList from './BuiltinMCPServerList'
import McpMarketList from './McpMarketList'
import NpxSearch from './NpxSearch'
import InstallNpxUv from './InstallNpxUv'

type SidebarView = 'servers' | 'builtin' | 'marketplaces' | 'npx-search' | 'install'

interface NavItem {
  id: SidebarView
  labelKey: string
  icon: typeof Wrench
}

const navItems: NavItem[] = [
  { id: 'servers', labelKey: 'settings.mcp.servers', icon: Wrench },
  { id: 'builtin', labelKey: 'settings.mcp.builtinServers', icon: Package },
  { id: 'marketplaces', labelKey: 'settings.mcp.marketplaces', icon: ShoppingBag },
  { id: 'npx-search', labelKey: 'settings.mcp.npxSearch', icon: Search },
  { id: 'install', labelKey: 'settings.mcp.installRuntimes', icon: Download },
]

export default function MCPSettings(): JSX.Element {
  const { t } = useTranslation()
  const [activeView, setActiveView] = useState<SidebarView>('servers')
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null)

  const handleSelectServer = (id: string) => {
    setSelectedServerId(id)
    setActiveView('servers')
  }

  const handleNavClick = (view: SidebarView) => {
    setActiveView(view)
    if (view !== 'servers') {
      setSelectedServerId(null)
    }
  }

  const renderContent = () => {
    switch (activeView) {
      case 'servers':
        if (selectedServerId) {
          return <McpSettings serverId={selectedServerId} />
        }
        return (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">
            {t('settings.mcp.noServerSelected', 'Select a server to view settings')}
          </div>
        )
      case 'builtin':
        return <BuiltinMCPServerList />
      case 'marketplaces':
        return <McpMarketList />
      case 'npx-search':
        return <NpxSearch />
      case 'install':
        return <InstallNpxUv />
      default:
        return null
    }
  }

  return (
    <ErrorBoundary>
      <div className="flex h-full w-full">
        {/* Left sidebar */}
        <div className="flex w-[280px] shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-700">
          {/* Nav items */}
          <div className="border-b border-zinc-200 p-2 dark:border-zinc-700">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{t(item.labelKey, item.id)}</span>
                </button>
              )
            })}
          </div>

          {/* Server list (always visible when on servers view) */}
          {activeView === 'servers' && (
            <div className="flex-1 overflow-hidden">
              <McpServersList
                selectedId={selectedServerId}
                onSelectServer={handleSelectServer}
              />
            </div>
          )}
        </div>

        {/* Right content */}
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </ErrorBoundary>
  )
}
