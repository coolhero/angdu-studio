import { useLocation } from 'react-router-dom'
import { ROUTES } from '../../routes'
import { SidebarItem } from './SidebarItem'

const isMac = navigator.userAgent.includes('Macintosh')

export function Sidebar() {
  const location = useLocation()

  const mainRoutes = ROUTES.filter((r) => r.showInSidebar && r.path !== '/settings')
  const settingsRoute = ROUTES.find((r) => r.path === '/settings')

  return (
    <div
      className="flex h-full w-12 flex-col items-center border-r border-border bg-background py-2 select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* macOS traffic light spacer */}
      {isMac && <div className="h-8 shrink-0" />}

      {/* Main navigation items */}
      <div className="flex flex-1 flex-col items-center gap-1">
        {mainRoutes.map((route) => (
          <SidebarItem
            key={route.path}
            route={route}
            isActive={location.pathname === route.path}
          />
        ))}
      </div>

      {/* Bottom: settings */}
      {settingsRoute && (
        <div className="flex flex-col items-center pb-2">
          <SidebarItem
            route={settingsRoute}
            isActive={location.pathname === settingsRoute.path}
          />
        </div>
      )}
    </div>
  )
}
