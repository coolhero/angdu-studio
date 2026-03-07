import { ipcRenderer } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'

export const notificationApi = {
  show: (title: string, body: string) =>
    ipcRenderer.invoke(IpcChannel.Notification_Show, { title, body }),
  clear: () => ipcRenderer.invoke(IpcChannel.Notification_Clear)
}

export const openApi = {
  url: (url: string) => ipcRenderer.invoke(IpcChannel.Open_Url, url),
  path: (path: string) => ipcRenderer.invoke(IpcChannel.Open_Path, path)
}

export const aesApi = {
  encrypt: (data: string, key: string) =>
    ipcRenderer.invoke(IpcChannel.AES_Encrypt, { data, key }),
  decrypt: (encrypted: string, key: string, iv: string, authTag: string) =>
    ipcRenderer.invoke(IpcChannel.AES_Decrypt, { encrypted, key, iv, authTag })
}

export const zipApi = {
  compress: (src: string, dest: string) =>
    ipcRenderer.invoke(IpcChannel.Zip_Compress, { src, dest }),
  decompress: (src: string, dest: string) =>
    ipcRenderer.invoke(IpcChannel.Zip_Decompress, { src, dest })
}

export const shortcutsApi = {
  register: () => ipcRenderer.invoke(IpcChannel.Shortcuts_Register)
}

export const storeSyncApi = {
  getState: () => ipcRenderer.invoke(IpcChannel.StoreSync_GetState),
  setState: (state: unknown) => ipcRenderer.invoke(IpcChannel.StoreSync_SetState, state),
  subscribe: () => ipcRenderer.invoke(IpcChannel.StoreSync_Subscribe),
  onStateChanged: (callback: (state: unknown) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, state: unknown) => callback(state)
    ipcRenderer.on(IpcChannel.StoreSync_StateChanged, handler)
    return () => ipcRenderer.removeListener(IpcChannel.StoreSync_StateChanged, handler)
  }
}
