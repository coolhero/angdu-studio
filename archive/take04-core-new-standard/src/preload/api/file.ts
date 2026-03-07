import { ipcRenderer } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'

export const fileApi = {
  open: (options?: Record<string, unknown>) => ipcRenderer.invoke(IpcChannel.File_Open, options),
  save: (options?: Record<string, unknown>) => ipcRenderer.invoke(IpcChannel.File_Save, options),
  read: (path: string, encoding?: string) => ipcRenderer.invoke(IpcChannel.File_Read, { path, encoding }),
  write: (path: string, data: string | ArrayBuffer) => ipcRenderer.invoke(IpcChannel.File_Write, { path, data }),
  delete: (path: string) => ipcRenderer.invoke(IpcChannel.File_Delete, path),
  copy: (src: string, dest: string) => ipcRenderer.invoke(IpcChannel.File_Copy, { src, dest }),
  move: (src: string, dest: string) => ipcRenderer.invoke(IpcChannel.File_Move, { src, dest }),
  rename: (path: string, newName: string) => ipcRenderer.invoke(IpcChannel.File_Rename, { path, newName }),
  exists: (path: string) => ipcRenderer.invoke(IpcChannel.File_Exists, path),
  stat: (path: string) => ipcRenderer.invoke(IpcChannel.File_Stat, path),
  mkdir: (path: string) => ipcRenderer.invoke(IpcChannel.File_Mkdir, path),
  readdir: (path: string) => ipcRenderer.invoke(IpcChannel.File_Readdir, path),
  selectFolder: () => ipcRenderer.invoke(IpcChannel.File_SelectFolder),
  upload: (filePath: string) => ipcRenderer.invoke(IpcChannel.File_Upload, filePath),
  download: (url: string, destPath: string) => ipcRenderer.invoke(IpcChannel.File_Download, { url, destPath }),
  base64Encode: (path: string) => ipcRenderer.invoke(IpcChannel.File_Base64Encode, path),
  base64Decode: (data: string, destPath: string) => ipcRenderer.invoke(IpcChannel.File_Base64Decode, { data, destPath }),
  binaryRead: (path: string) => ipcRenderer.invoke(IpcChannel.File_BinaryRead, path),
  binaryWrite: (path: string, data: ArrayBuffer) => ipcRenderer.invoke(IpcChannel.File_BinaryWrite, { path, data }),
  hash: (path: string, algorithm?: string) => ipcRenderer.invoke(IpcChannel.File_Hash, { path, algorithm }),
  compress: (src: string, dest: string) => ipcRenderer.invoke(IpcChannel.File_Compress, { src, dest }),
  decompress: (src: string, dest: string) => ipcRenderer.invoke(IpcChannel.File_Decompress, { src, dest }),
  getType: (path: string) => ipcRenderer.invoke(IpcChannel.File_GetType, path),
  getSize: (path: string) => ipcRenderer.invoke(IpcChannel.File_GetSize, path),
  openInExplorer: (path: string) => ipcRenderer.invoke(IpcChannel.File_OpenInExplorer, path),
  append: (path: string, data: string) => ipcRenderer.invoke(IpcChannel.File_Append, { path, data }),
  glob: (pattern: string, cwd: string) => ipcRenderer.invoke(IpcChannel.File_Glob, { pattern, cwd }),
  startWatcher: (id: string, path: string, options?: Record<string, unknown>) =>
    ipcRenderer.invoke(IpcChannel.File_StartWatcher, { id, path, options }),
  stopWatcher: (id: string) => ipcRenderer.invoke(IpcChannel.File_StopWatcher, id),
  getMetadata: (path: string) => ipcRenderer.invoke(IpcChannel.File_GetMetadata, path),

  onFileChanged: (callback: (data: { id: string; event: string; path: string }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: { id: string; event: string; path: string }) => callback(data)
    ipcRenderer.on(IpcChannel.File_Changed, handler)
    return () => ipcRenderer.removeListener(IpcChannel.File_Changed, handler)
  }
}
