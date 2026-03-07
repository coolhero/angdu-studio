import { ipcMain, dialog, BrowserWindow } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import { fileService } from '../services/FileService'
import { fileWatcherService } from '../services/FileWatcherService'

export function registerFileHandlers(): void {
  ipcMain.handle(IpcChannel.File_Open, async (event, options?: Electron.OpenDialogOptions) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return dialog.showOpenDialog(win!, options ?? {})
  })

  ipcMain.handle(IpcChannel.File_Save, async (event, options?: Electron.SaveDialogOptions) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return dialog.showSaveDialog(win!, options ?? {})
  })

  ipcMain.handle(IpcChannel.File_Read, (_, { path, encoding }: { path: string; encoding?: string }) => {
    return fileService.read(path, encoding)
  })

  ipcMain.handle(IpcChannel.File_Write, (_, { path, data }: { path: string; data: string | Buffer }) => {
    fileService.write(path, data)
  })

  ipcMain.handle(IpcChannel.File_Delete, (_, path: string) => {
    fileService.delete(path)
  })

  ipcMain.handle(IpcChannel.File_Copy, (_, { src, dest }: { src: string; dest: string }) => {
    fileService.copy(src, dest)
  })

  ipcMain.handle(IpcChannel.File_Move, (_, { src, dest }: { src: string; dest: string }) => {
    fileService.move(src, dest)
  })

  ipcMain.handle(IpcChannel.File_Rename, (_, { path, newName }: { path: string; newName: string }) => {
    return fileService.rename(path, newName)
  })

  ipcMain.handle(IpcChannel.File_Exists, (_, path: string) => {
    return fileService.exists(path)
  })

  ipcMain.handle(IpcChannel.File_Stat, (_, path: string) => {
    return fileService.stat(path)
  })

  ipcMain.handle(IpcChannel.File_Mkdir, (_, path: string) => {
    fileService.mkdir(path)
  })

  ipcMain.handle(IpcChannel.File_Readdir, (_, path: string) => {
    return fileService.readdir(path)
  })

  ipcMain.handle(IpcChannel.File_SelectFolder, async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return dialog.showOpenDialog(win!, { properties: ['openDirectory'] })
  })

  ipcMain.handle(IpcChannel.File_Upload, (_, filePath: string) => {
    return fileService.upload(filePath)
  })

  ipcMain.handle(IpcChannel.File_Download, (_, { url, destPath }: { url: string; destPath: string }) => {
    // Placeholder — full download implementation in later phase
    return { url, destPath }
  })

  ipcMain.handle(IpcChannel.File_Base64Encode, (_, path: string) => {
    return fileService.base64Encode(path)
  })

  ipcMain.handle(IpcChannel.File_Base64Decode, (_, { data, destPath }: { data: string; destPath: string }) => {
    fileService.base64Decode(data, destPath)
  })

  ipcMain.handle(IpcChannel.File_BinaryRead, (_, path: string) => {
    return fileService.binaryRead(path)
  })

  ipcMain.handle(IpcChannel.File_BinaryWrite, (_, { path, data }: { path: string; data: Buffer }) => {
    fileService.binaryWrite(path, data)
  })

  ipcMain.handle(IpcChannel.File_Hash, (_, { path, algorithm }: { path: string; algorithm?: string }) => {
    return fileService.hash(path, algorithm)
  })

  ipcMain.handle(IpcChannel.File_Compress, async (_, { src, dest }: { src: string; dest: string }) => {
    await fileService.compress(src, dest)
  })

  ipcMain.handle(IpcChannel.File_Decompress, async (_, { src, dest }: { src: string; dest: string }) => {
    await fileService.decompress(src, dest)
  })

  ipcMain.handle(IpcChannel.File_GetType, (_, path: string) => {
    return fileService.getType(path)
  })

  ipcMain.handle(IpcChannel.File_GetSize, (_, path: string) => {
    return fileService.getSize(path)
  })

  ipcMain.handle(IpcChannel.File_OpenInExplorer, (_, path: string) => {
    fileService.openInExplorer(path)
  })

  ipcMain.handle(IpcChannel.File_Append, (_, { path, data }: { path: string; data: string }) => {
    fileService.append(path, data)
  })

  ipcMain.handle(IpcChannel.File_Glob, async (_, { pattern, cwd }: { pattern: string; cwd: string }) => {
    return fileService.glob(pattern, cwd)
  })

  ipcMain.handle(IpcChannel.File_StartWatcher, (_, { id, path, options }: { id: string; path: string; options?: Record<string, unknown> }) => {
    fileWatcherService.startWatcher(id, path, options)
  })

  ipcMain.handle(IpcChannel.File_StopWatcher, (_, id: string) => {
    fileWatcherService.stopWatcher(id)
  })

  ipcMain.handle(IpcChannel.File_GetMetadata, (_, filePath: string) => {
    const stat = fileService.stat(filePath)
    return {
      path: filePath,
      size: stat.size,
      isFile: stat.isFile,
      isDirectory: stat.isDirectory,
      mtime: stat.mtime
    }
  })
}
