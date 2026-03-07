import { Menu, BrowserWindow } from 'electron'

export class ContextMenuService {
  private static instance: ContextMenuService

  private constructor() {}

  static getInstance(): ContextMenuService {
    if (!ContextMenuService.instance) {
      ContextMenuService.instance = new ContextMenuService()
    }
    return ContextMenuService.instance
  }

  init(mainWindow: BrowserWindow): void {
    mainWindow.webContents.on('context-menu', (_event, params) => {
      if (params.isEditable || params.selectionText) {
        const menu = Menu.buildFromTemplate([
          { role: 'cut', enabled: params.isEditable },
          { role: 'copy', enabled: !!params.selectionText },
          { role: 'paste', enabled: params.isEditable },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
        menu.popup({ window: mainWindow })
      }
    })
  }
}
