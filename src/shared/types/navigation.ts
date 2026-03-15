export interface Tab {
  id: string
  route: string
  title: string
  icon?: string
  closable: boolean
  order: number
}

export interface RouteConfig {
  path: string
  title: string
  icon: string
  closable: boolean
  showInSidebar: boolean
}

export type NavbarPosition = 'top' | 'left'
