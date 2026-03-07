interface MainI18nStrings {
  tray: {
    show: string
    miniWindow: string
    quit: string
  }
  menu: {
    about: string
    preferences: string
    quit: string
    edit: string
    undo: string
    redo: string
    cut: string
    copy: string
    paste: string
    selectAll: string
    view: string
    zoomIn: string
    zoomOut: string
    resetZoom: string
    fullscreen: string
    window: string
    minimize: string
    close: string
    bringAllToFront: string
    help: string
  }
}

const strings: Record<string, MainI18nStrings> = {
  'en-US': {
    tray: { show: 'Show Main Window', miniWindow: 'Quick Assistant', quit: 'Quit' },
    menu: {
      about: 'About Cherry Studio', preferences: 'Preferences', quit: 'Quit Cherry Studio',
      edit: 'Edit', undo: 'Undo', redo: 'Redo', cut: 'Cut', copy: 'Copy', paste: 'Paste', selectAll: 'Select All',
      view: 'View', zoomIn: 'Zoom In', zoomOut: 'Zoom Out', resetZoom: 'Actual Size', fullscreen: 'Toggle Full Screen',
      window: 'Window', minimize: 'Minimize', close: 'Close Window', bringAllToFront: 'Bring All to Front',
      help: 'Help'
    }
  }
}

let currentLocale = 'en-US'

export function setMainLocale(locale: string): void {
  currentLocale = locale
}

export function t(path: string): string {
  const localeStrings = strings[currentLocale] ?? strings['en-US']
  const parts = path.split('.')
  let current: unknown = localeStrings
  for (const part of parts) {
    if (current && typeof current === 'object') {
      current = (current as Record<string, unknown>)[part]
    } else {
      return path
    }
  }
  return typeof current === 'string' ? current : path
}
