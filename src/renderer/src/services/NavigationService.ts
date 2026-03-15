import type { NavigateFunction } from 'react-router-dom'
import { useTabsStore } from '../stores/useTabsStore'
import { getRouteConfig } from '../routes'

class NavigationServiceImpl {
  private navigateFn: NavigateFunction | null = null
  private history: string[] = []

  setNavigate(fn: NavigateFunction): void {
    this.navigateFn = fn
  }

  navigate(route: string): void {
    if (!this.navigateFn) return

    const config = getRouteConfig(route)
    if (!config) return

    const store = useTabsStore.getState()
    store.addTab(route)
    this.navigateFn(route)
    this.history.push(route)
  }

  openInNewTab(route: string): void {
    this.navigate(route)
  }

  goBack(): void {
    if (!this.navigateFn || this.history.length < 2) return

    // Pop current route
    this.history.pop()
    const previousRoute = this.history[this.history.length - 1]
    if (previousRoute) {
      const store = useTabsStore.getState()
      const tab = store.tabs.find((t) => t.route === previousRoute)
      if (tab) {
        store.setActiveTab(tab.id)
      }
      this.navigateFn(previousRoute)
    }
  }
}

export const NavigationService = new NavigationServiceImpl()
