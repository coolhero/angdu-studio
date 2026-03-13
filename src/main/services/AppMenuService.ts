import { app, Menu, shell, type MenuItemConstructorOptions } from 'electron'
import { isMac } from '../constant'

export class AppMenuService {
  private static instance: AppMenuService

  private constructor() {}

  static getInstance(): AppMenuService {
    if (!AppMenuService.instance) {
      AppMenuService.instance = new AppMenuService()
    }
    return AppMenuService.instance
  }

  /**
   * Build and set the application menu.
   * On macOS, this creates the standard app menu with About, Edit, View, Window, Help.
   * On other platforms, the menu is set to null (custom titlebar handles menu).
   */
  init(): void {
    if (!isMac) {
      Menu.setApplicationMenu(null)
      return
    }

    const appName = app.getName()

    const template: MenuItemConstructorOptions[] = [
      // App Menu (macOS only)
      {
        label: appName,
        submenu: [
          { role: 'about', label: `About ${appName}` },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide', label: `Hide ${appName}` },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit', label: `Quit ${appName}` },
        ],
      },
      // Edit Menu
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }],
          },
        ],
      },
      // View Menu
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      },
      // Window Menu
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'zoom' },
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' },
        ],
      },
      // Help Menu
      {
        label: 'Help',
        role: 'help',
        submenu: [
          {
            label: 'Learn More',
            click: () => {
              shell.openExternal('https://github.com/angdu/angdu-studio')
            },
          },
        ],
      },
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }
}
