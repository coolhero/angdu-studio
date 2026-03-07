import { readFile, writeFile, copyFile, rename, unlink, stat, mkdir, readdir } from 'fs/promises'
import { join, extname, basename } from 'path'
import { existsSync } from 'fs'
import { FILE_PROGRESS_THRESHOLD_BYTES } from '@shared/constants'
import type { FileMetadata, FileType } from '@shared/types'

const TEXT_EXTENSIONS = new Set([
  '.txt', '.md', '.markdown', '.json', '.xml', '.csv', '.yaml', '.yml',
  '.html', '.htm', '.css', '.js', '.ts', '.jsx', '.tsx', '.py', '.java',
  '.c', '.cpp', '.h', '.hpp', '.rs', '.go', '.rb', '.php', '.sh', '.bat',
  '.ps1', '.sql', '.toml', '.ini', '.cfg', '.conf', '.env', '.gitignore',
  '.log', '.svg'
])

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif', '.ico', '.bmp'])
const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.avi', '.mkv'])
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.flac', '.aac'])
const DOCUMENT_EXTENSIONS = new Set(['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'])
const ARCHIVE_EXTENSIONS = new Set(['.zip', '.tar', '.gz', '.rar', '.7z'])

export class FileStorageService {
  constructor(private readonly filesDir: string) {
    if (!existsSync(filesDir)) {
      require('fs').mkdirSync(filesDir, { recursive: true })
    }
  }

  async readFile(filePath: string): Promise<Buffer> {
    return readFile(filePath)
  }

  async writeFile(filePath: string, content: string | Buffer): Promise<void> {
    const dir = join(filePath, '..')
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }
    await writeFile(filePath, content)
  }

  async deleteFile(filePath: string): Promise<void> {
    await unlink(filePath)
  }

  async copyFile(src: string, dest: string): Promise<void> {
    await copyFile(src, dest)
  }

  async moveFile(src: string, dest: string): Promise<void> {
    await rename(src, dest)
  }

  async getFileSize(filePath: string): Promise<number> {
    const s = await stat(filePath)
    return s.size
  }

  async uploadFile(
    sourcePath: string,
    onProgress?: (bytesWritten: number, totalBytes: number) => void
  ): Promise<{ storedPath: string; metadata: Omit<FileMetadata, 'id' | 'created_at'> }> {
    const fileStat = await stat(sourcePath)
    const ext = extname(sourcePath)
    const name = basename(sourcePath)
    const fileId = crypto.randomUUID()
    const storedPath = join(this.filesDir, `${fileId}${ext}`)

    if (fileStat.size > FILE_PROGRESS_THRESHOLD_BYTES && onProgress) {
      // Chunked copy with progress
      const { createReadStream, createWriteStream } = require('fs')
      await new Promise<void>((resolve, reject) => {
        const readStream = createReadStream(sourcePath)
        const writeStream = createWriteStream(storedPath)
        let bytesWritten = 0

        readStream.on('data', (chunk: Buffer) => {
          bytesWritten += chunk.length
          onProgress(bytesWritten, fileStat.size)
        })
        readStream.on('error', reject)
        writeStream.on('error', reject)
        writeStream.on('finish', resolve)
        readStream.pipe(writeStream)
      })
    } else {
      const data = await readFile(sourcePath)
      await writeFile(storedPath, data)
    }

    return {
      storedPath,
      metadata: {
        name,
        origin_name: name,
        path: storedPath,
        size: fileStat.size,
        ext,
        type: this.detectFileType(ext)
      }
    }
  }

  isTextFile(filePath: string): boolean {
    const ext = extname(filePath).toLowerCase()
    return TEXT_EXTENSIONS.has(ext)
  }

  detectFileType(ext: string): FileType {
    const e = ext.toLowerCase()
    if (IMAGE_EXTENSIONS.has(e)) return 'image'
    if (VIDEO_EXTENSIONS.has(e)) return 'video'
    if (AUDIO_EXTENSIONS.has(e)) return 'audio'
    if (DOCUMENT_EXTENSIONS.has(e)) return 'document'
    if (TEXT_EXTENSIONS.has(e)) return 'text'
    if (ARCHIVE_EXTENSIONS.has(e)) return 'archive'
    if (['.ts', '.js', '.py', '.java', '.c', '.cpp', '.rs', '.go', '.rb'].includes(e)) return 'code'
    return 'other'
  }

  async imageToBase64(imagePath: string): Promise<string> {
    const data = await readFile(imagePath)
    const ext = extname(imagePath).toLowerCase().replace('.', '')
    const mime = ext === 'svg' ? 'svg+xml' : ext === 'jpg' ? 'jpeg' : ext
    return `data:image/${mime};base64,${data.toString('base64')}`
  }

  async listDirectory(dirPath: string): Promise<Array<{ name: string; path: string; isDirectory: boolean }>> {
    const entries = await readdir(dirPath, { withFileTypes: true })
    return entries.map((entry) => ({
      name: entry.name,
      path: join(dirPath, entry.name),
      isDirectory: entry.isDirectory()
    }))
  }
}
