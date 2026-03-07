import { Tray, Menu, nativeImage, nativeTheme, app } from 'electron'
import { t } from '../i18n/locales'
import { configManager } from '../config'
import { ConfigKeys } from '@shared/types'

type WindowActions = {
  showMainWindow: () => void
  showMiniWindow: () => void
}

export class TrayService {
  private tray: Tray | null = null
  private actions: WindowActions | null = null

  createTray(iconPath: string, actions?: WindowActions): Tray {
    this.actions = actions ?? null
    const icon = nativeImage.createFromPath(iconPath)
    this.tray = new Tray(icon.resize({ width: 16, height: 16 }))
    this.tray.setToolTip('Cherry Studio')

    this.buildContextMenu()

    this.tray.on('click', () => {
      const showQuickAssistant = configManager.get<boolean>(ConfigKeys.ClickTrayToShowQuickAssistant)
      if (showQuickAssistant) {
        this.actions?.showMiniWindow()
      } else {
        this.actions?.showMainWindow()
      }
    })

    nativeTheme.on('updated', () => {
      this.buildContextMenu()
    })

    return this.tray
  }

  private buildContextMenu(): void {
    if (!this.tray) return

    const menu = Menu.buildFromTemplate([
      {
        label: t('tray.show'),
        click: () => this.actions?.showMainWindow()
      },
      {
        label: t('tray.miniWindow'),
        click: () => this.actions?.showMiniWindow()
      },
      { type: 'separator' },
      {
        label: t('tray.quit'),
        click: () => app.quit()
      }
    ])

    this.tray.setContextMenu(menu)
  }

  destroy(): void {
    this.tray?.destroy()
    this.tray = null
  }
}
