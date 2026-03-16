import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Settings, Monitor, Database, Keyboard, Cpu, Box } from 'lucide-react'
import { cn } from '@renderer/lib/utils'

const NAV_ITEMS = [
  { to: '/settings/provider', icon: Cpu, labelKey: 'settings.sidebar.provider' },
  { to: '/settings/models', icon: Box, labelKey: 'settings.sidebar.models' },
  { to: '/settings/general', icon: Settings, labelKey: 'settings.sidebar.general' },
  { to: '/settings/display', icon: Monitor, labelKey: 'settings.sidebar.display' },
  { to: '/settings/data', icon: Database, labelKey: 'settings.sidebar.data' },
  { to: '/settings/shortcuts', icon: Keyboard, labelKey: 'settings.sidebar.shortcuts' }
] as const

export function SettingsSidebar() {
  const { t } = useTranslation()

  return (
    <nav className="flex h-full w-48 shrink-0 flex-col border-r border-border bg-background p-3">
      <h2 className="mb-4 px-2 text-lg font-semibold text-foreground">
        {t('settings.title')}
      </h2>
      <div className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, icon: Icon, labelKey }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                isActive
                  ? 'bg-muted font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {t(labelKey)}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
