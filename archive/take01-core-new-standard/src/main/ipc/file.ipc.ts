import { BrowserWindow, dialog } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import { FileType } from '@shared/types/file'
import { typedHandle } from './typedHandle'
import type { FileStorageService } from '../services/FileStorageService'

/**
 * Registers file operation IPC handlers.
 */
export function registerFileIpc(fileStorage: FileStorageService): void {
  typedHandle(IpcChannel.FileSelect, async (event, options) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return null
    const result = await dialog.showOpenDialog(win, {
      filters: options?.filters,
      properties: ['openFile', 'multiSelections']
    })
    return result.canceled ? null : result.filePaths
  })

  typedHandle(IpcChannel.FileSave, async (_event, path, data) => {
    await fileStorage.write(path, Buffer.from(data))
  })

  typedHandle(IpcChannel.FileRead, async (_event, path) => {
    const buffer = await fileStorage.read(path)
    return new Uint8Array(buffer)
  })

  typedHandle(IpcChannel.FileDelete, async (_event, path) => {
    await fileStorage.delete(path)
  })

  typedHandle(IpcChannel.FileGetMetadata, async (_event, filePath) => {
    const { stat } = await import('node:fs/promises')
    const { basename, extname } = await import('node:path')
    const stats = await stat(filePath)
    const ext = extname(filePath).toLowerCase()
    const mimeType = getMimeType(ext)
    const fileType = getFileType(mimeType)

    return {
      name: basename(filePath),
      path: filePath,
      size: stats.size,
      type: fileType,
      mimeType,
      createdAt: stats.birthtimeMs,
      modifiedAt: stats.mtimeMs
    }
  })
}

/** Simple MIME type lookup by extension */
function getMimeType(ext: string): string {
  const mimeMap: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.json': 'application/json',
    '.md': 'text/markdown',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.zip': 'application/zip'
  }
  return mimeMap[ext] ?? 'application/octet-stream'
}

/** Derive FileType from MIME type */
function getFileType(mimeType: string): FileType {
  if (mimeType.startsWith('image/')) return FileType.Image
  if (mimeType.startsWith('audio/')) return FileType.Audio
  if (mimeType.startsWith('video/')) return FileType.Video
  if (
    mimeType === 'application/pdf' ||
    mimeType === 'text/plain' ||
    mimeType === 'text/markdown' ||
    mimeType === 'application/json'
  ) {
    return FileType.Document
  }
  if (mimeType === 'application/zip') return FileType.Archive
  return FileType.Other
}
