import { Menu, app } from 'electron'
import { t } from '../i18n/locales'
import { platformService } from './PlatformService'

export class MenuService {
  createAppMenu(): void {
    if (!platformService.isMacOS) return

    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: app.getName(),
        submenu: [
          { label: t('menu.about'), role: 'about' },
          { type: 'separator' },
          { label: t('menu.preferences'), accelerator: 'CommandOrControl+,' },
          { type: 'separator' },
          { label: t('app.hide'), role: 'hide' },
          { label: t('app.hideOthers'), role: 'hideOthers' },
          { label: t('app.showAll'), role: 'unhide' },
          { type: 'separator' },
          { label: t('menu.quit'), role: 'quit' }
        ]
      },
      {
        label: t('menu.edit'),
        submenu: [
          { label: t('menu.undo' as any), role: 'undo' },
          { label: t('menu.redo' as any), role: 'redo' },
          { type: 'separator' },
          { label: t('common.cut'), role: 'cut' },
          { label: t('common.copy'), role: 'copy' },
          { label: t('common.paste'), role: 'paste' },
          { label: t('common.selectAll'), role: 'selectAll' }
        ]
      },
      {
        label: t('menu.view'),
        submenu: [
          { label: t('menu.zoomIn'), role: 'zoomIn' },
          { label: t('menu.zoomOut'), role: 'zoomOut' },
          { label: t('menu.resetZoom'), role: 'resetZoom' },
          { type: 'separator' },
          { label: t('menu.fullscreen'), role: 'togglefullscreen' }
        ]
      },
      {
        label: t('menu.window'),
        submenu: [
          { label: t('menu.minimize'), role: 'minimize' },
          { label: t('menu.closeWindow'), role: 'close' },
          { type: 'separator' },
          { label: t('menu.bringAllToFront'), role: 'front' }
        ]
      },
      {
        label: t('menu.help'),
        role: 'help',
        submenu: []
      }
    ]

    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  }
}
