import { ipcMain } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import {
  showMiniWindow,
  hideMiniWindow,
  toggleMiniWindow,
  setMiniWindowPin,
  getMiniWindow
} from '../window/MiniWindow'

export function registerMiniWindowHandlers(): void {
  ipcMain.handle(IpcChannel.MiniWindow_Show, () => {
    showMiniWindow()
  })

  ipcMain.handle(IpcChannel.MiniWindow_Hide, () => {
    hideMiniWindow()
  })

  ipcMain.handle(IpcChannel.MiniWindow_SetPin, (_, pinned: boolean) => {
    setMiniWindowPin(pinned)
  })

  ipcMain.handle(IpcChannel.MiniWindow_Toggle, () => {
    toggleMiniWindow()
  })

  ipcMain.handle(IpcChannel.MiniWindow_GetBounds, () => {
    return getMiniWindow()?.getBounds()
  })
}
