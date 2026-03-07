import { readFile, writeFile, unlink, copyFile, mkdir } from 'node:fs/promises'
import { join, extname, basename } from 'node:path'
import { existsSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { get as httpsGet } from 'node:https'
import { get as httpGet } from 'node:http'
import { createWriteStream } from 'node:fs'
import type { FileMetadata } from '@shared/types/file'
import { FileType } from '@shared/types/file'
import { getFilesPath } from '../utils/paths'

/**
 * Manages file storage: upload, read, write, delete, download.
 * Files are stored in the user data `files/` directory.
 */
export class FileStorageService {
  private filesDir: string

  constructor(filesDir?: string) {
    this.filesDir = filesDir ?? getFilesPath()
  }

  /** Ensures the files directory exists */
  private async ensureDir(): Promise<void> {
    if (!existsSync(this.filesDir)) {
      await mkdir(this.filesDir, { recursive: true })
    }
  }

  /**
   * Uploads a file by copying it to the files directory with a UUID-based name.
   * Returns metadata about the stored file.
   */
  async upload(filePath: string): Promise<FileMetadata> {
    await this.ensureDir()

    const ext = extname(filePath)
    const id = randomUUID()
    const storedName = `${id}${ext}`
    const destPath = join(this.filesDir, storedName)

    await copyFile(filePath, destPath)

    const { stat } = await import('node:fs/promises')
    const stats = await stat(destPath)

    return {
      name: basename(filePath),
      path: destPath,
      size: stats.size,
      type: getFileType(getMimeType(ext.toLowerCase())),
      mimeType: getMimeType(ext.toLowerCase()),
      createdAt: Date.now(),
      modifiedAt: Date.now()
    }
  }

  /** Reads a file and returns its contents as a Buffer */
  async read(filePath: string): Promise<Buffer> {
    return readFile(filePath)
  }

  /** Writes data to a file */
  async write(filePath: string, data: Buffer): Promise<void> {
    await this.ensureDir()
    await writeFile(filePath, data)
  }

  /** Deletes a file */
  async delete(filePath: string): Promise<void> {
    await unlink(filePath)
  }

  /**
   * Downloads a file from a URL and saves it to the files directory.
   * Returns metadata about the stored file.
   */
  async download(url: string): Promise<FileMetadata> {
    await this.ensureDir()

    const urlObj = new URL(url)
    const urlPath = urlObj.pathname
    const ext = extname(urlPath) || '.bin'
    const originalName = basename(urlPath) || 'download'
    const id = randomUUID()
    const storedName = `${id}${ext}`
    const destPath = join(this.filesDir, storedName)

    await new Promise<void>((resolve, reject) => {
      const getter = url.startsWith('https') ? httpsGet : httpGet
      getter(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Download failed with status ${response.statusCode}`))
          return
        }
        const fileStream = createWriteStream(destPath)
        response.pipe(fileStream)
        fileStream.on('finish', () => {
          fileStream.close()
          resolve()
        })
        fileStream.on('error', reject)
      }).on('error', reject)
    })

    const { stat } = await import('node:fs/promises')
    const stats = await stat(destPath)

    return {
      name: originalName,
      path: destPath,
      size: stats.size,
      type: getFileType(getMimeType(ext.toLowerCase())),
      mimeType: getMimeType(ext.toLowerCase()),
      createdAt: Date.now(),
      modifiedAt: Date.now()
    }
  }
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
