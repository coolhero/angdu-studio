export interface WindowState {
  width: number
  height: number
  x?: number
  y?: number
  isMaximized: boolean
}

export interface ConfigSchema {
  theme: 'light' | 'dark' | 'system'
  language: string
  fontSize: number
  sendWithEnter: boolean
  proxyUrl: string
  autoUpdate: boolean
  windowState?: WindowState
}
