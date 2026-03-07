import { Menu, app, shell } from 'electron'
import { isMac } from '../utils/platform'
import { t } from './locales'

export class AppMenuService {
  private onReloadCallback?: () => void

  setCallbacks(options: { onReload?: () => void }): void {
    this.onReloadCallback = options.onReload
  }

  createMenu(): void {
    if (!isMac) return // macOS only (FR-017)

    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: app.getName(),
        submenu: [
          { role: 'about', label: t('app.about') },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit', label: t('app.quit') }
        ]
      },
      {
        label: t('menu.edit'),
        submenu: [
          { role: 'undo', label: t('common.undo') },
          { role: 'redo', label: t('common.redo') },
          { type: 'separator' },
          { role: 'cut', label: t('common.cut') },
          { role: 'copy', label: t('common.copy') },
          { role: 'paste', label: t('common.paste') },
          { role: 'selectAll', label: t('common.selectAll') }
        ]
      },
      {
        label: t('menu.view'),
        submenu: [
          { role: 'reload', label: t('menu.reload') },
          { role: 'toggleDevTools', label: t('menu.toggleDevTools') },
          { type: 'separator' },
          { role: 'resetZoom', label: t('menu.resetZoom') },
          { role: 'zoomIn', label: t('menu.zoomIn') },
          { role: 'zoomOut', label: t('menu.zoomOut') },
          { type: 'separator' },
          { role: 'togglefullscreen', label: t('menu.fullscreen') }
        ]
      },
      {
        label: t('menu.window'),
        submenu: [
          { role: 'minimize', label: t('menu.minimize') },
          { role: 'zoom', label: t('menu.zoom') },
          { type: 'separator' },
          { role: 'front', label: t('menu.front') }
        ]
      },
      {
        label: t('menu.help'),
        submenu: [
          {
            label: 'GitHub',
            click: () => shell.openExternal('https://github.com/kangfenmao/cherry-studio')
          }
        ]
      }
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }

  updateMenu(): void {
    this.createMenu()
  }
}
