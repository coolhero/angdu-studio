export interface AppInfo {
  version: string
  name: string
  paths: {
    userData: string
    temp: string
    logs: string
    downloads: string
  }
  platform: 'darwin' | 'win32' | 'linux'
  arch: string
  isPortable: boolean
}

export interface SystemInfo {
  cpuModel: string
  cpuCores: number
  totalMemory: number
  freeMemory: number
  platform: string
  osVersion: string
  arch: string
}

export interface ProxyConfig {
  mode: 'system' | 'fixed_servers' | 'direct'
  url?: string
  bypassRules?: string
}

export interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'verbose' | 'debug'
  message: string
  module?: string
  context?: Record<string, unknown>
  timestamp?: number
}
