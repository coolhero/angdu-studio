import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { Tab, NavbarPosition } from '@shared/types/navigation'
import { ROUTES, getRouteConfig } from '../routes'

interface TabsState {
  tabs: Tab[]
  activeTabId: string
  navbarPosition: NavbarPosition
  addTab: (route: string) => void
  removeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  reorderTabs: (tabs: Tab[]) => void
  closeOthers: (tabId: string) => void
  closeAll: () => void
  setNavbarPosition: (position: NavbarPosition) => void
  restoreTabs: () => Promise<void>
}

const HOME_TAB: Tab = {
  id: 'home',
  route: '/',
  title: 'Home',
  icon: 'Home',
  closable: false,
  order: 0
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function persistTabs(tabs: Tab[], activeTabId: string): void {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    window.api.invoke['config:set']('openTabs', JSON.stringify(tabs))
    window.api.invoke['config:set']('activeTabId', activeTabId)
  }, 500)
}

export const useTabsStore = create<TabsState>((set, get) => ({
  tabs: [HOME_TAB],
  activeTabId: 'home',
  navbarPosition: 'top',

  addTab: (route: string) => {
    const { tabs } = get()
    const existing = tabs.find((t) => t.route === route)
    if (existing) {
      set({ activeTabId: existing.id })
      persistTabs(tabs, existing.id)
      return
    }

    const config = getRouteConfig(route)
    if (!config) return

    const newTab: Tab = {
      id: route === '/' ? 'home' : route.replace(/^\//, ''),
      route,
      title: config.title,
      icon: config.icon,
      closable: config.closable,
      order: tabs.length
    }

    const newTabs = [...tabs, newTab]
    set({ tabs: newTabs, activeTabId: newTab.id })
    persistTabs(newTabs, newTab.id)
  },

  removeTab: (tabId: string) => {
    const { tabs, activeTabId } = get()
    const tab = tabs.find((t) => t.id === tabId)
    if (!tab || !tab.closable) return

    const index = tabs.indexOf(tab)
    const newTabs = tabs.filter((t) => t.id !== tabId)

    let newActiveId = activeTabId
    if (activeTabId === tabId) {
      // Navigate to adjacent tab
      const adjacentTab = newTabs[Math.min(index, newTabs.length - 1)] ?? HOME_TAB
      newActiveId = adjacentTab.id
    }

    set({ tabs: newTabs, activeTabId: newActiveId })
    persistTabs(newTabs, newActiveId)
  },

  setActiveTab: (tabId: string) => {
    const { tabs } = get()
    set({ activeTabId: tabId })
    persistTabs(tabs, tabId)
  },

  reorderTabs: (newTabs: Tab[]) => {
    const { activeTabId } = get()
    const reordered = newTabs.map((t, i) => ({ ...t, order: i }))
    set({ tabs: reordered })
    persistTabs(reordered, activeTabId)
  },

  closeOthers: (tabId: string) => {
    const { tabs } = get()
    const newTabs = tabs.filter((t) => t.id === tabId || !t.closable)
    set({ tabs: newTabs, activeTabId: tabId })
    persistTabs(newTabs, tabId)
  },

  closeAll: () => {
    const newTabs = [HOME_TAB]
    set({ tabs: newTabs, activeTabId: 'home' })
    persistTabs(newTabs, 'home')
  },

  setNavbarPosition: (position: NavbarPosition) => {
    set({ navbarPosition: position })
    window.api.invoke['config:set']('navbarPosition', position)
  },

  restoreTabs: async () => {
    try {
      const [openTabsRaw, activeTabId, navbarPosition] = await Promise.all([
        window.api.invoke['config:get']('openTabs') as Promise<string>,
        window.api.invoke['config:get']('activeTabId') as Promise<string>,
        window.api.invoke['config:get']('navbarPosition') as Promise<NavbarPosition | undefined>
      ])

      const parsed = JSON.parse(openTabsRaw || '[]') as Tab[]

      // Validate: ensure all tabs reference known routes
      const validTabs = parsed.filter((t) => {
        const config = getRouteConfig(t.route)
        return config != null
      })

      // Ensure Home tab is always present
      const hasHome = validTabs.some((t) => t.id === 'home')
      const tabs = hasHome ? validTabs : [HOME_TAB, ...validTabs]

      // Validate activeTabId
      const validActiveId =
        tabs.some((t) => t.id === activeTabId) ? activeTabId : 'home'

      set({
        tabs,
        activeTabId: validActiveId,
        navbarPosition: navbarPosition === 'left' ? 'left' : 'top'
      })
    } catch {
      // Fallback to defaults
      set({ tabs: [HOME_TAB], activeTabId: 'home', navbarPosition: 'top' })
    }
  }
}))

// Selector hooks using useShallow for array/object selectors
export function useTabsList(): Tab[] {
  return useTabsStore(useShallow((s) => s.tabs))
}

export function useActiveTabId(): string {
  return useTabsStore((s) => s.activeTabId)
}

export function useNavbarPosition(): NavbarPosition {
  return useTabsStore((s) => s.navbarPosition)
}
