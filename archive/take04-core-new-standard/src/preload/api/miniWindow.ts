import { ipcRenderer } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'

export const miniWindowApi = {
  show: () => ipcRenderer.invoke(IpcChannel.MiniWindow_Show),
  hide: () => ipcRenderer.invoke(IpcChannel.MiniWindow_Hide),
  setPin: (pinned: boolean) => ipcRenderer.invoke(IpcChannel.MiniWindow_SetPin, pinned),
  toggle: () => ipcRenderer.invoke(IpcChannel.MiniWindow_Toggle),
  getBounds: () => ipcRenderer.invoke(IpcChannel.MiniWindow_GetBounds)
}
