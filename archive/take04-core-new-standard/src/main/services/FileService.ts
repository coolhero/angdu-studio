import {
  existsSync, mkdirSync, copyFileSync, renameSync, unlinkSync,
  readFileSync, writeFileSync, statSync, readdirSync, appendFileSync
} from 'fs'
import { join, extname, basename, dirname } from 'path'
import { createHash, randomUUID } from 'crypto'
import { shell } from 'electron'
import { filesDir } from '../bootstrap'
import { FileType } from '@shared/types'
import type { FileMetadata } from '@shared/types'
import { createGzip, createGunzip } from 'zlib'
import { createReadStream, createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import { glob as globFn } from 'glob'

const EXT_MAP: Record<string, FileType> = {
  '.jpg': FileType.Image, '.jpeg': FileType.Image, '.png': FileType.Image,
  '.gif': FileType.Image, '.svg': FileType.Image, '.webp': FileType.Image,
  '.ico': FileType.Image, '.bmp': FileType.Image, '.avif': FileType.Image,
  '.mp4': FileType.Video, '.webm': FileType.Video, '.avi': FileType.Video,
  '.mov': FileType.Video, '.mkv': FileType.Video,
  '.mp3': FileType.Audio, '.wav': FileType.Audio, '.ogg': FileType.Audio,
  '.flac': FileType.Audio, '.aac': FileType.Audio,
  '.pdf': FileType.Document, '.doc': FileType.Document, '.docx': FileType.Document,
  '.xls': FileType.Document, '.xlsx': FileType.Document, '.ppt': FileType.Document,
  '.pptx': FileType.Document,
  '.txt': FileType.Text, '.md': FileType.Text, '.csv': FileType.Text,
  '.log': FileType.Text, '.json': FileType.Text, '.xml': FileType.Text,
  '.yaml': FileType.Text, '.yml': FileType.Text,
  '.js': FileType.Code, '.ts': FileType.Code, '.tsx': FileType.Code,
  '.jsx': FileType.Code, '.py': FileType.Code, '.java': FileType.Code,
  '.go': FileType.Code, '.rs': FileType.Code, '.c': FileType.Code,
  '.cpp': FileType.Code, '.h': FileType.Code, '.css': FileType.Code,
  '.html': FileType.Code, '.sql': FileType.Code,
  '.zip': FileType.Archive, '.tar': FileType.Archive, '.gz': FileType.Archive,
  '.rar': FileType.Archive, '.7z': FileType.Archive
}

class FileService {
  upload(filePath: string): FileMetadata {
    const id = randomUUID()
    const ext = extname(filePath)
    const originalName = basename(filePath)
    const destPath = join(filesDir, `${id}${ext}`)

    if (!existsSync(filesDir)) {
      mkdirSync(filesDir, { recursive: true })
    }
    copyFileSync(filePath, destPath)

    const stats = statSync(destPath)
    return {
      id,
      name: originalName,
      origin_name: originalName,
      path: destPath,
      size: stats.size,
      ext: ext.replace('.', ''),
      type: this.getType(filePath),
      created_at: Date.now()
    }
  }

  read(filePath: string, encoding?: string): string | Buffer {
    if (encoding) {
      return readFileSync(filePath, { encoding: encoding as BufferEncoding })
    }
    return readFileSync(filePath, { encoding: 'utf-8' })
  }

  write(filePath: string, data: string | Buffer): void {
    const dir = dirname(filePath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    writeFileSync(filePath, data)
  }

  delete(filePath: string): void {
    unlinkSync(filePath)
  }

  copy(src: string, dest: string): void {
    const dir = dirname(dest)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    copyFileSync(src, dest)
  }

  move(src: string, dest: string): void {
    const dir = dirname(dest)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    renameSync(src, dest)
  }

  rename(filePath: string, newName: string): string {
    const dir = dirname(filePath)
    const newPath = join(dir, newName)
    renameSync(filePath, newPath)
    return newPath
  }

  exists(filePath: string): boolean {
    return existsSync(filePath)
  }

  stat(filePath: string) {
    const s = statSync(filePath)
    return {
      size: s.size,
      isFile: s.isFile(),
      isDirectory: s.isDirectory(),
      mtime: s.mtime.getTime(),
      ctime: s.ctime.getTime()
    }
  }

  mkdir(dirPath: string): void {
    mkdirSync(dirPath, { recursive: true })
  }

  readdir(dirPath: string): string[] {
    return readdirSync(dirPath)
  }

  getType(filePath: string): FileType {
    const ext = extname(filePath).toLowerCase()
    return EXT_MAP[ext] ?? FileType.Other
  }

  getSize(filePath: string): number {
    return statSync(filePath).size
  }

  hash(filePath: string, algorithm = 'sha256'): string {
    const content = readFileSync(filePath)
    return createHash(algorithm).update(content).digest('hex')
  }

  async compress(srcPath: string, destPath: string): Promise<void> {
    await pipeline(createReadStream(srcPath), createGzip(), createWriteStream(destPath))
  }

  async decompress(srcPath: string, destPath: string): Promise<void> {
    await pipeline(createReadStream(srcPath), createGunzip(), createWriteStream(destPath))
  }

  base64Encode(filePath: string): string {
    return readFileSync(filePath).toString('base64')
  }

  base64Decode(data: string, destPath: string): void {
    writeFileSync(destPath, Buffer.from(data, 'base64'))
  }

  binaryRead(filePath: string): Buffer {
    return readFileSync(filePath)
  }

  binaryWrite(filePath: string, data: Buffer): void {
    writeFileSync(filePath, data)
  }

  openInExplorer(filePath: string): void {
    shell.openPath(filePath)
  }

  async glob(pattern: string, cwd: string): Promise<string[]> {
    return globFn(pattern, { cwd })
  }

  append(filePath: string, data: string): void {
    appendFileSync(filePath, data)
  }
}

export const fileService = new FileService()
