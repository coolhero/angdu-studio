export interface SystemInfo {
  platform: string
  arch: string
  hostname: string
  cpus: CpuInfo[]
  totalMemory: number
  freeMemory: number
}

export interface CpuInfo {
  model: string
  speed: number
  cores: number
}

export interface Display {
  id: number
  bounds: Rectangle
  workArea: Rectangle
  scaleFactor: number
  rotation: number
}

export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}

export interface FileStat {
  size: number
  isFile: boolean
  isDirectory: boolean
  createdAt: number
  modifiedAt: number
}

export interface WindowCreateOptions {
  width?: number
  height?: number
  x?: number
  y?: number
  title?: string
  frame?: boolean
  alwaysOnTop?: boolean
  url?: string
}

export interface MenuItem {
  label: string
  click?: string
  type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio'
  checked?: boolean
  enabled?: boolean
  submenu?: MenuItem[]
  accelerator?: string
}
