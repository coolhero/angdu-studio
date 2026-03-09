import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { ipcMain, shell } from 'electron'
import { IpcChannel } from '@shared/ipc-channels'
import { fileStorageService } from '../services/FileStorageService'

export function registerFileIpc(): void {
  // ── File Upload / Read / Delete ──

  ipcMain.handle(IpcChannel.File_Upload, async (_, filePath: string, fileName?: string, type?: string) => {
    try {
      return await fileStorageService.upload(filePath, fileName, type)
    } catch (error) {
      console.error('[File_Upload] Error:', error)
      throw error
    }
  })

  ipcMain.handle(IpcChannel.File_Read, async (_, idOrPath: string) => {
    try {
      return await fileStorageService.read(idOrPath)
    } catch (error) {
      console.error('[File_Read] Error:', error)
      throw error
    }
  })

  ipcMain.handle(IpcChannel.File_Delete, async (_, id: string, filePath: string) => {
    try {
      return await fileStorageService.deleteFile(id, filePath)
    } catch (error) {
      console.error('[File_Delete] Error:', error)
      throw error
    }
  })

  // ── File Rename / Move ──

  ipcMain.handle(IpcChannel.File_Rename, async (_, filePath: string, newName: string) => {
    try {
      return await fileStorageService.rename(filePath, newName)
    } catch (error) {
      console.error('[File_Rename] Error:', error)
      throw error
    }
  })

  ipcMain.handle(IpcChannel.File_Move, async (_, from: string, to: string) => {
    try {
      return await fileStorageService.move(from, to)
    } catch (error) {
      console.error('[File_Move] Error:', error)
      throw error
    }
  })

  // ── File Download ──

  ipcMain.handle(IpcChannel.File_Download, async (_, url: string, destPath?: string) => {
    try {
      return await fileStorageService.download(url, destPath)
    } catch (error) {
      console.error('[File_Download] Error:', error)
      throw error
    }
  })

  // ── Image Operations ──

  ipcMain.handle(IpcChannel.File_Base64Image, async (_, filePath: string) => {
    try {
      return await fileStorageService.base64Image(filePath)
    } catch (error) {
      console.error('[File_Base64Image] Error:', error)
      throw error
    }
  })

  ipcMain.handle(IpcChannel.File_BinaryImage, async (_, filePath: string) => {
    try {
      return await fileStorageService.binaryImage(filePath)
    } catch (error) {
      console.error('[File_BinaryImage] Error:', error)
      throw error
    }
  })

  ipcMain.handle(IpcChannel.File_SaveBase64Image, async (_, base64: string, ext?: string) => {
    try {
      return await fileStorageService.saveBase64Image(base64, ext)
    } catch (error) {
      console.error('[File_SaveBase64Image] Error:', error)
      throw error
    }
  })

  // ── File Dialogs ──

  ipcMain.handle(
    IpcChannel.File_Select,
    async (_, filters?: Electron.FileFilter[], multiple?: boolean) => {
      try {
        return await fileStorageService.selectFiles(filters, multiple)
      } catch (error) {
        console.error('[File_Select] Error:', error)
        throw error
      }
    }
  )

  ipcMain.handle(IpcChannel.File_SelectFolder, async () => {
    try {
      return await fileStorageService.selectFolder()
    } catch (error) {
      console.error('[File_SelectFolder] Error:', error)
      throw error
    }
  })

  // ── Directory Operations ──

  ipcMain.handle(IpcChannel.File_ListDirectory, async (_, dirPath: string) => {
    try {
      return await fileStorageService.listDirectory(dirPath)
    } catch (error) {
      console.error('[File_ListDirectory] Error:', error)
      throw error
    }
  })

  ipcMain.handle(IpcChannel.File_ShowInFolder, (_, filePath: string) => {
    try {
      return fileStorageService.showInFolder(filePath)
    } catch (error) {
      console.error('[File_ShowInFolder] Error:', error)
      throw error
    }
  })

  ipcMain.handle(IpcChannel.File_Open, async (_, filePath: string) => {
    try {
      return await shell.openPath(filePath)
    } catch (error) {
      console.error('[File_Open] Error:', error)
      throw error
    }
  })

  // ── File Write / Save / Copy / Mkdir ──

  ipcMain.handle(IpcChannel.File_Save, async (_, filePath: string, data: Buffer | string) => {
    try {
      return await fileStorageService.writeFile(filePath, data)
    } catch (error) {
      console.error('[File_Save] Error:', error)
      throw error
    }
  })

  ipcMain.handle(IpcChannel.File_Mkdir, async (_, dirPath: string) => {
    try {
      return await fileStorageService.mkdir(dirPath)
    } catch (error) {
      console.error('[File_Mkdir] Error:', error)
      throw error
    }
  })

  ipcMain.handle(IpcChannel.File_Write, async (_, filePath: string, data: Buffer | string) => {
    try {
      return await fileStorageService.writeFile(filePath, data)
    } catch (error) {
      console.error('[File_Write] Error:', error)
      throw error
    }
  })

  ipcMain.handle(IpcChannel.File_Copy, async (_, from: string, to: string) => {
    try {
      return await fileStorageService.copyFile(from, to)
    } catch (error) {
      console.error('[File_Copy] Error:', error)
      throw error
    }
  })

  // ── File Inspection ──

  ipcMain.handle(IpcChannel.File_IsTextFile, async (_, filePath: string) => {
    try {
      return await fileStorageService.isTextFile(filePath)
    } catch (error) {
      console.error('[File_IsTextFile] Error:', error)
      throw error
    }
  })

  ipcMain.handle(IpcChannel.File_IsDirectory, async (_, filePath: string) => {
    try {
      return await fileStorageService.isDirectory(filePath)
    } catch (error) {
      console.error('[File_IsDirectory] Error:', error)
      throw error
    }
  })

  ipcMain.handle(IpcChannel.File_Get, async (_, filePath: string) => {
    try {
      const stat = await fs.stat(filePath)
      return {
        name: path.basename(filePath),
        path: filePath,
        size: stat.size,
        isDirectory: stat.isDirectory(),
        isFile: stat.isFile(),
        createdAt: stat.birthtimeMs,
        modifiedAt: stat.mtimeMs
      }
    } catch (error) {
      console.error('[File_Get] Error:', error)
      throw error
    }
  })

  ipcMain.handle(
    IpcChannel.File_CreateTempFile,
    async (_, prefix: string, ext: string, data?: Buffer | string) => {
      try {
        const tmpDir = os.tmpdir()
        const fileName = `${prefix ?? 'tmp'}-${Date.now()}${ext ?? '.tmp'}`
        const filePath = path.join(tmpDir, fileName)
        await fs.writeFile(filePath, data ?? '')
        return filePath
      } catch (error) {
        console.error('[File_CreateTempFile] Error:', error)
        throw error
      }
    }
  )

  // ── Filesystem Direct ──

  ipcMain.handle(IpcChannel.Fs_Read, async (_, filePath: string) => {
    try {
      return await fs.readFile(filePath)
    } catch (error) {
      console.error('[Fs_Read] Error:', error)
      throw error
    }
  })

  ipcMain.handle(
    IpcChannel.Fs_ReadText,
    async (_, filePath: string, encoding?: BufferEncoding) => {
      try {
        return await fs.readFile(filePath, { encoding: encoding ?? 'utf-8' })
      } catch (error) {
        console.error('[Fs_ReadText] Error:', error)
        throw error
      }
    }
  )
}
