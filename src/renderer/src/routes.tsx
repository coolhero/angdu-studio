import type { RouteConfig } from '@shared/types/navigation'

export const ROUTES: RouteConfig[] = [
  { path: '/', title: 'Home', icon: 'Home', closable: false, showInSidebar: true },
  { path: '/settings', title: 'Settings', icon: 'Settings', closable: true, showInSidebar: true },
  { path: '/chat', title: 'Chat', icon: 'MessageSquare', closable: true, showInSidebar: true },
  { path: '/translate', title: 'Translate', icon: 'Languages', closable: true, showInSidebar: true },
  { path: '/knowledge', title: 'Knowledge', icon: 'BookOpen', closable: true, showInSidebar: true },
  { path: '/files', title: 'Files', icon: 'FolderOpen', closable: true, showInSidebar: true },
  { path: '/notes', title: 'Notes', icon: 'FileText', closable: true, showInSidebar: true }
]

export function getRouteConfig(path: string): RouteConfig | undefined {
  return ROUTES.find((r) => r.path === path)
}
