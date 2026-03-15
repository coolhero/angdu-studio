import { useCallback } from 'react'
import {
  Home,
  Settings,
  MessageSquare,
  Languages,
  BookOpen,
  FolderOpen,
  FileText,
  type LucideIcon
} from 'lucide-react'
import type { RouteConfig } from '@shared/types/navigation'
import { useTabsStore } from '../../stores/useTabsStore'
import { NavigationService } from '../../services/NavigationService'

const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  Settings,
  MessageSquare,
  Languages,
  BookOpen,
  FolderOpen,
  FileText
}

interface SidebarItemProps {
  route: RouteConfig
  isActive: boolean
}

export function SidebarItem({ route, isActive }: SidebarItemProps) {
  const Icon = ICON_MAP[route.icon]

  const handleClick = useCallback(() => {
    NavigationService.navigate(route.path)
  }, [route.path])

  if (!Icon) return null

  return (
    <button
      onClick={handleClick}
      title={route.title}
      className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      <Icon className="h-5 w-5" />
    </button>
  )
}
