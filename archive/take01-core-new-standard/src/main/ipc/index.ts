import { app, BrowserWindow, shell, dialog } from 'electron'
import { hostname } from 'node:os'
import { gzipSync, gunzipSync } from 'node:zlib'
import { IpcChannel } from '@shared/IpcChannel'
import { FileType } from '@shared/types/file'
import { DEFAULT_CONFIG } from '@shared/constants'
import { typedHandle } from './typedHandle'

/**
 * Registers all IPC handlers for the main process.
 * Call this once during app initialization, before creating any windows.
 */
export function registerIpcHandlers(): void {
  // App lifecycle
  typedHandle(IpcChannel.AppGetInfo, async () => ({
    name: app.getName(),
    version: app.getVersion(),
    electronVersion: process.versions.electron
  }))

  typedHandle(IpcChannel.AppQuit, async () => {
    app.quit()
  })

  typedHandle(IpcChannel.AppRelaunch, async () => {
    app.relaunch()
    app.quit()
  })

  typedHandle(IpcChannel.AppSetLanguage, async (_event, _language) => {
    // Language is persisted via the config service when wired up
  })

  // Window management
  typedHandle(IpcChannel.WindowMinimize, async (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  typedHandle(IpcChannel.WindowMaximize, async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win?.isMaximized()) {
      win.unmaximize()
    } else {
      win?.maximize()
    }
  })

  typedHandle(IpcChannel.WindowClose, async (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })

  typedHandle(IpcChannel.WindowIsMaximized, async (event) => {
    return BrowserWindow.fromWebContents(event.sender)?.isMaximized() ?? false
  })

  // File operations
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
    const { writeFile } = await import('node:fs/promises')
    await writeFile(path, data)
  })

  typedHandle(IpcChannel.FileRead, async (_event, path) => {
    const { readFile } = await import('node:fs/promises')
    const buffer = await readFile(path)
    return new Uint8Array(buffer)
  })

  typedHandle(IpcChannel.FileDelete, async (_event, path) => {
    const { unlink } = await import('node:fs/promises')
    await unlink(path)
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

  // Config / settings (stub implementations - will be wired to persistence layer)
  typedHandle(IpcChannel.ConfigGet, async () => {
    return { ...DEFAULT_CONFIG }
  })

  typedHandle(IpcChannel.ConfigSet, async (_event, _config) => {
    // Stub: will be connected to persistence in a future phase
  })

  typedHandle(IpcChannel.ConfigReset, async () => {
    return { ...DEFAULT_CONFIG }
  })

  // Shortcuts (stub implementations - will be wired to globalShortcut in a future phase)
  typedHandle(IpcChannel.ShortcutRegister, async (_event, shortcut) => {
    return {
      id: crypto.randomUUID(),
      ...shortcut
    }
  })

  typedHandle(IpcChannel.ShortcutUnregister, async (_event, _id) => {
    // Stub: will be connected to globalShortcut in a future phase
  })

  typedHandle(IpcChannel.ShortcutGetAll, async () => {
    return []
  })

  // Shell / OS integration
  typedHandle(IpcChannel.ShellOpenExternal, async (_event, url) => {
    await shell.openExternal(url)
  })

  typedHandle(IpcChannel.ShellShowItemInFolder, async (_event, path) => {
    shell.showItemInFolder(path)
  })

  // System
  typedHandle(IpcChannel.SystemGetDeviceType, async () => {
    return {
      platform: process.platform,
      arch: process.arch,
      hostname: hostname()
    }
  })

  // Zip
  typedHandle(IpcChannel.ZipCompress, async (_event, data) => {
    const buffer = Buffer.from(data)
    const compressed = gzipSync(buffer)
    return new Uint8Array(compressed)
  })

  typedHandle(IpcChannel.ZipDecompress, async (_event, data) => {
    const buffer = Buffer.from(data)
    const decompressed = gunzipSync(buffer)
    return new Uint8Array(decompressed)
  })

  // Dialog
  typedHandle(IpcChannel.DialogShowMessage, async (event, options) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const result = await dialog.showMessageBox(win!, {
      type: options.type ?? 'info',
      title: options.title,
      message: options.message
    })
    return result.response
  })

  typedHandle(IpcChannel.DialogShowError, async (_event, title, content) => {
    dialog.showErrorBox(title, content)
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
