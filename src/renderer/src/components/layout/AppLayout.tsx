import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from '../navigation/Sidebar'
import { Navbar } from '../navigation/Navbar'
import { useTabsStore, useActiveTabId, useNavbarPosition } from '../../stores/useTabsStore'
import { NavigationService } from '../../services/NavigationService'

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const activeTabId = useActiveTabId()
  const navbarPosition = useNavbarPosition()

  // Register navigate function with NavigationService
  useEffect(() => {
    NavigationService.setNavigate(navigate)
  }, [navigate])

  // Restore tabs on mount
  useEffect(() => {
    useTabsStore.getState().restoreTabs().then(() => {
      const { tabs, activeTabId: restoredId } = useTabsStore.getState()
      const activeTab = tabs.find((t) => t.id === restoredId)
      if (activeTab && activeTab.route !== location.pathname) {
        navigate(activeTab.route)
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync route when activeTabId changes (e.g. from tab click)
  useEffect(() => {
    const { tabs } = useTabsStore.getState()
    const activeTab = tabs.find((t) => t.id === activeTabId)
    if (activeTab && activeTab.route !== location.pathname) {
      navigate(activeTab.route)
    }
  }, [activeTabId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Top mode: full-width tab bar, no sidebar (Cherry Studio default)
  if (navbarPosition === 'top') {
    return (
      <div className="flex h-screen flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 overflow-auto bg-background">
          <Outlet />
        </main>
      </div>
    )
  }

  // Left mode: sidebar + content column with navbar
  return (
    <div className="flex h-screen flex-row bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main
          className="flex-1 overflow-auto bg-background"
          style={{ borderTopLeftRadius: 10 }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
