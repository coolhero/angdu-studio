import fs from 'node:fs/promises'
import path from 'node:path'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { app, dialog, shell } from 'electron'
import { nanoid } from 'nanoid'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FileType = 'image' | 'video' | 'audio' | 'text' | 'document' | 'other'

export interface FileMetadata {
  id: string
  name: string
  origin_name: string
  path: string
  size: number
  ext: string
  type: FileType
  created_at: number
  count: number
  tokens?: number
  purpose?: string
}

export interface DirectoryEntry {
  name: string
  path: string
  isDirectory: boolean
  size: number
  modifiedAt: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'])
const VIDEO_EXTS = new Set(['.mp4', '.avi', '.mov'])
const AUDIO_EXTS = new Set(['.mp3', '.wav'])
const TEXT_EXTS = new Set(['.txt', '.md', '.csv'])
const DOC_EXTS = new Set(['.pdf', '.doc', '.docx', '.xls', '.xlsx'])

function getFileType(ext: string): FileType {
  const lower = ext.toLowerCase()
  if (IMAGE_EXTS.has(lower)) return 'image'
  if (VIDEO_EXTS.has(lower)) return 'video'
  if (AUDIO_EXTS.has(lower)) return 'audio'
  if (TEXT_EXTS.has(lower)) return 'text'
  if (DOC_EXTS.has(lower)) return 'document'
  return 'other'
}

function getStoragePath(): string {
  return path.join(app.getPath('userData'), 'files')
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

class FileStorageService {
  /**
   * Ensure the storage root directory exists.
   */
  private async ensureStorageDir(): Promise<string> {
    const dir = getStoragePath()
    await fs.mkdir(dir, { recursive: true })
    return dir
  }

  /**
   * Copy a file into app storage and return its metadata.
   */
  async upload(filePath: string, fileName?: string, type?: string): Promise<FileMetadata> {
    const storageDir = await this.ensureStorageDir()
    const id = nanoid()
    const originName = path.basename(filePath)
    const ext = path.extname(originName)
    const name = fileName ?? originName
    const destPath = path.join(storageDir, `${id}${ext}`)

    await fs.copyFile(filePath, destPath)
    const stat = await fs.stat(destPath)

    return {
      id,
      name,
      origin_name: originName,
      path: destPath,
      size: stat.size,
      ext,
      type: (type as FileType) ?? getFileType(ext),
      created_at: Date.now(),
      count: 0
    }
  }

  /**
   * Read a file by id (looks up in storage dir) or absolute path.
   */
  async read(idOrPath: string): Promise<Buffer> {
    if (path.isAbsolute(idOrPath)) {
      return fs.readFile(idOrPath) as Promise<Buffer>
    }

    // Treat as an id — scan storage dir for a file starting with this id
    const storageDir = getStoragePath()
    const entries = await fs.readdir(storageDir)
    const match = entries.find((entry) => entry.startsWith(idOrPath))
    if (!match) {
      throw new Error(`File not found for id: ${idOrPath}`)
    }
    return fs.readFile(path.join(storageDir, match)) as Promise<Buffer>
  }

  /**
   * Delete a file from disk.
   */
  async deleteFile(_id: string, filePath: string): Promise<void> {
    await fs.unlink(filePath)
  }

  /**
   * Rename a file.
   */
  async rename(filePath: string, newName: string): Promise<void> {
    const dir = path.dirname(filePath)
    const dest = path.join(dir, newName)
    await fs.rename(filePath, dest)
  }

  /**
   * Move a file from one location to another.
   */
  async move(from: string, to: string): Promise<void> {
    await fs.rename(from, to)
  }

  /**
   * Download a file from a URL. Returns the local file path.
   */
  async download(url: string, destPath?: string): Promise<string> {
    const storageDir = await this.ensureStorageDir()
    const urlObj = new URL(url)
    const basename = path.basename(urlObj.pathname) || `${nanoid()}.bin`
    const filePath = destPath ?? path.join(storageDir, `${nanoid()}_${basename}`)

    const response = await fetch(url)
    if (!response.ok || !response.body) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`)
    }

    const fileStream = createWriteStream(filePath)
    // @ts-expect-error ReadableStream from fetch is compatible with pipeline via Readable.fromWeb
    const { Readable } = await import('node:stream')
    const nodeReadable = Readable.fromWeb(response.body)
    await pipeline(nodeReadable, fileStream)

    return filePath
  }

  /**
   * Read an image file and return its base64 representation (with data URI prefix).
   */
  async base64Image(filePath: string): Promise<string> {
    const buffer = await fs.readFile(filePath)
    const ext = path.extname(filePath).toLowerCase().replace('.', '')
    const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext === 'jpg' ? 'jpeg' : ext}`
    return `data:${mime};base64,${buffer.toString('base64')}`
  }

  /**
   * Read an image file as a raw Buffer.
   */
  async binaryImage(filePath: string): Promise<Buffer> {
    return fs.readFile(filePath) as Promise<Buffer>
  }

  /**
   * Save a base64-encoded image string to app storage. Returns metadata.
   */
  async saveBase64Image(base64: string, ext?: string): Promise<FileMetadata> {
    const storageDir = await this.ensureStorageDir()
    const id = nanoid()

    // Strip data URI prefix if present
    let rawBase64 = base64
    let detectedExt = ext ?? '.png'
    const match = base64.match(/^data:image\/([^;]+);base64,/)
    if (match) {
      rawBase64 = base64.slice(match[0].length)
      if (!ext) {
        detectedExt = `.${match[1] === 'jpeg' ? 'jpg' : match[1]}`
      }
    }

    if (!detectedExt.startsWith('.')) {
      detectedExt = `.${detectedExt}`
    }

    const filePath = path.join(storageDir, `${id}${detectedExt}`)
    const buffer = Buffer.from(rawBase64, 'base64')
    await fs.writeFile(filePath, buffer)

    return {
      id,
      name: `${id}${detectedExt}`,
      origin_name: `${id}${detectedExt}`,
      path: filePath,
      size: buffer.length,
      ext: detectedExt,
      type: 'image',
      created_at: Date.now(),
      count: 0
    }
  }

  /**
   * Open a native file dialog and return selected file paths.
   */
  async selectFiles(
    filters?: Electron.FileFilter[],
    multiple?: boolean
  ): Promise<string[]> {
    const properties: Electron.OpenDialogOptions['properties'] = ['openFile']
    if (multiple) {
      properties.push('multiSelections')
    }

    const result = await dialog.showOpenDialog({
      properties,
      filters: filters ?? []
    })

    return result.canceled ? [] : result.filePaths
  }

  /**
   * Open a native folder selection dialog.
   */
  async selectFolder(): Promise<string | undefined> {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return result.canceled ? undefined : result.filePaths[0]
  }

  /**
   * List the contents of a directory.
   */
  async listDirectory(dirPath: string): Promise<DirectoryEntry[]> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    const results: DirectoryEntry[] = []

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      const stat = await fs.stat(fullPath)
      results.push({
        name: entry.name,
        path: fullPath,
        isDirectory: entry.isDirectory(),
        size: stat.size,
        modifiedAt: stat.mtimeMs
      })
    }

    return results
  }

  /**
   * Reveal a file in the OS file manager.
   */
  showInFolder(filePath: string): void {
    shell.showItemInFolder(filePath)
  }

  /**
   * Create a directory (recursively).
   */
  async mkdir(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true })
  }

  /**
   * Write data to a file.
   */
  async writeFile(filePath: string, data: Buffer | string): Promise<void> {
    await fs.writeFile(filePath, data)
  }

  /**
   * Copy a file.
   */
  async copyFile(from: string, to: string): Promise<void> {
    await fs.copyFile(from, to)
  }

  /**
   * Check whether a file is likely a text file by reading the first chunk
   * and looking for null bytes (binary indicator).
   */
  async isTextFile(filePath: string): Promise<boolean> {
    const handle = await fs.open(filePath, 'r')
    try {
      const buf = Buffer.alloc(8192)
      const { bytesRead } = await handle.read(buf, 0, 8192, 0)
      for (let i = 0; i < bytesRead; i++) {
        if (buf[i] === 0) return false
      }
      return true
    } finally {
      await handle.close()
    }
  }

  /**
   * Check whether a path is a directory.
   */
  async isDirectory(filePath: string): Promise<boolean> {
    try {
      const stat = await fs.stat(filePath)
      return stat.isDirectory()
    } catch {
      return false
    }
  }
}

export const fileStorageService = new FileStorageService()
