export interface WindowState {
  id: string
  x: number | null
  y: number | null
  width: number
  height: number
  isMaximized: boolean
  displayId: string | null
}

export const MIN_WINDOW_WIDTH = 960
export const MIN_WINDOW_HEIGHT = 600

export const DEFAULT_WINDOW_STATE: WindowState = {
  id: 'main',
  x: null,
  y: null,
  width: MIN_WINDOW_WIDTH,
  height: MIN_WINDOW_HEIGHT,
  isMaximized: false,
  displayId: null
}
