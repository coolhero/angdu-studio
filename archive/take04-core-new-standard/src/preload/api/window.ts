import { ipcRenderer } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import type { MenuItem, WindowCreateOptions } from '@shared/types'

export const windowApi = {
  minimize: () => ipcRenderer.invoke(IpcChannel.Windows_Minimize),
  maximize: () => ipcRenderer.invoke(IpcChannel.Windows_Maximize),
  close: () => ipcRenderer.invoke(IpcChannel.Windows_Close),
  create: (options: WindowCreateOptions) => ipcRenderer.invoke(IpcChannel.Windows_Create, options),
  focus: (id?: number) => ipcRenderer.invoke(IpcChannel.Windows_Focus, { id }),
  setTitle: (title: string) => ipcRenderer.invoke(IpcChannel.Windows_SetTitle, { title }),
  setSize: (width: number, height: number) =>
    ipcRenderer.invoke(IpcChannel.Windows_SetSize, { width, height }),
  toggleDevTools: () => ipcRenderer.invoke(IpcChannel.Windows_ToggleDevTools),
  showContextMenu: (items: MenuItem[]) =>
    ipcRenderer.invoke(IpcChannel.Windows_ShowContextMenu, items),
  setFullscreen: (fullscreen: boolean) =>
    ipcRenderer.invoke(IpcChannel.Windows_SetFullscreen, fullscreen),
  getBounds: () => ipcRenderer.invoke(IpcChannel.Windows_GetBounds)
}
