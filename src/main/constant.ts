import { platform } from 'os'

export const isMac = platform() === 'darwin'
export const isWin = platform() === 'win32'
export const isLinux = platform() === 'linux'
export const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
export const isPackaged = !isDev

export const MIN_WINDOW_WIDTH = 960
export const MIN_WINDOW_HEIGHT = 600
export const DEFAULT_WINDOW_WIDTH = 960
export const DEFAULT_WINDOW_HEIGHT = 600
