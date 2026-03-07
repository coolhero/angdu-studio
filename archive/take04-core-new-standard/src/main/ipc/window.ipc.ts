import { ipcMain, BrowserWindow, Menu } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import type { MenuItem } from '@shared/types'

export function registerWindowHandlers(): void {
  ipcMain.handle(IpcChannel.Windows_Minimize, (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  ipcMain.handle(IpcChannel.Windows_Maximize, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      win.isMaximized() ? win.unmaximize() : win.maximize()
    }
  })

  ipcMain.handle(IpcChannel.Windows_Close, (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })

  ipcMain.handle(IpcChannel.Windows_Create, (_, options) => {
    const win = new BrowserWindow(options)
    return win.id
  })

  ipcMain.handle(IpcChannel.Windows_Focus, (event, { id }: { id?: number }) => {
    const win = id ? BrowserWindow.fromId(id) : BrowserWindow.fromWebContents(event.sender)
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })

  ipcMain.handle(IpcChannel.Windows_SetTitle, (event, { title }: { title: string }) => {
    BrowserWindow.fromWebContents(event.sender)?.setTitle(title)
  })

  ipcMain.handle(IpcChannel.Windows_SetSize, (event, { width, height }: { width: number; height: number }) => {
    BrowserWindow.fromWebContents(event.sender)?.setSize(width, height)
  })

  ipcMain.handle(IpcChannel.Windows_ToggleDevTools, (event) => {
    event.sender.toggleDevTools()
  })

  ipcMain.handle(IpcChannel.Windows_ShowContextMenu, (event, items: MenuItem[]) => {
    const buildMenu = (menuItems: MenuItem[]): Electron.MenuItemConstructorOptions[] =>
      menuItems.map((item) => ({
        label: item.label,
        type: item.type as Electron.MenuItemConstructorOptions['type'],
        checked: item.checked,
        enabled: item.enabled,
        accelerator: item.accelerator,
        submenu: item.submenu ? buildMenu(item.submenu) : undefined,
        click: item.click ? () => event.sender.send(item.click!) : undefined
      }))
    const menu = Menu.buildFromTemplate(buildMenu(items))
    menu.popup({ window: BrowserWindow.fromWebContents(event.sender) ?? undefined })
  })

  ipcMain.handle(IpcChannel.Windows_SetFullscreen, (event, fullscreen: boolean) => {
    BrowserWindow.fromWebContents(event.sender)?.setFullScreen(fullscreen)
  })

  ipcMain.handle(IpcChannel.Windows_GetBounds, (event) => {
    return BrowserWindow.fromWebContents(event.sender)?.getBounds()
  })
}
