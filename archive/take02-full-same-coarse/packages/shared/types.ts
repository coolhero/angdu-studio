export interface FileFilter {
  name: string
  extensions: string[]
}

export interface FileMetadata {
  id: string
  name: string
  path: string
  size: number
  ext: string
  type: string
  count: number
  created_at: number
}

export interface ProxyConfig {
  mode: 'direct' | 'system' | 'manual'
  protocol?: 'http' | 'https' | 'socks5'
  host?: string
  port?: number
  username?: string
  password?: string
  bypass?: string[]
}

export type ThemeMode = 'light' | 'dark' | 'system'

export interface AppInfo {
  version: string
  isPackaged: boolean
  appPath: string
  appDataPath: string
  platform: string
  arch: string
}

export interface UpdateInfo {
  version: string
  releaseDate: string
  releaseNotes: string
  channel: 'stable' | 'rc' | 'beta'
}

export interface Shortcut {
  key: string
  shortcut: string[]
  enabled: boolean
}
