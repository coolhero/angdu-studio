// Re-export shared types for renderer convenience
export type {
  AppInfo,
  FileFilter,
  FileMetadata,
  ProxyConfig,
  Shortcut,
  ThemeMode,
  UpdateInfo
} from '@shared/types'

// Renderer-specific types
export interface RouteConfig {
  path: string
  element: React.ReactNode
  title?: string
}

export type SettingsTab = 'general' | 'display' | 'shortcuts' | 'data' | 'about'
