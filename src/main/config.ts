import process from 'node:process'

const isMac = process.platform === 'darwin'

export const titleBarOverlayDark = {
  color: '#1e1e1e',
  symbolColor: '#cccccc',
  height: 36
}

export const titleBarOverlayLight = {
  color: '#ffffff',
  symbolColor: '#333333',
  height: 36
}

export function getWindowConfig(): Record<string, unknown> {
  if (isMac) {
    return {
      titleBarStyle: 'hiddenInset' as const,
      trafficLightPosition: { x: 8, y: 10 }
    }
  }

  return {
    frame: false,
    titleBarOverlay: titleBarOverlayDark
  }
}
