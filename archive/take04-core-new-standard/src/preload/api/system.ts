import { ipcRenderer } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'

export const systemApi = {
  getLocale: () => ipcRenderer.invoke(IpcChannel.System_GetLocale),
  getPlatform: () => ipcRenderer.invoke(IpcChannel.System_GetPlatform),
  getArch: () => ipcRenderer.invoke(IpcChannel.System_GetArch),
  getMemory: () => ipcRenderer.invoke(IpcChannel.System_GetMemory),
  getCPU: () => ipcRenderer.invoke(IpcChannel.System_GetCPU),
  getHostname: () => ipcRenderer.invoke(IpcChannel.System_GetHostname),
  isDarkMode: () => ipcRenderer.invoke(IpcChannel.System_IsDarkMode),
  getDisplays: () => ipcRenderer.invoke(IpcChannel.System_GetDisplays)
}
