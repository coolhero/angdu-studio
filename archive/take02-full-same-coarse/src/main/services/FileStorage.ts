import { stat } from 'node:fs/promises'
import path from 'node:path'
import { DATA_PATH } from '@main/config'
import type { FileMetadata } from '@shared/types'
import { dialog, shell } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import * as fss from './FileSystemService'
import { loggerService } from './LoggerService'

const logger = loggerService.withContext('FileStorage')

const FILES_DIR = path.join(DATA_PATH, 'files')

export interface SelectOptions {
  multiSelections?: boolean
  filters?: { name: string; extensions: string[] }[]
}

function getFileType(ext: string): string {
  const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.webp', '.ico']
  const documentExts = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.md', '.csv']
  const audioExts = ['.mp3', '.wav', '.ogg', '.flac', '.aac']
  const videoExts = ['.mp4', '.avi', '.mkv', '.mov', '.webm']

  const lower = ext.toLowerCase()
  if (imageExts.includes(lower)) return 'image'
  if (documentExts.includes(lower)) return 'document'
  if (audioExts.includes(lower)) return 'audio'
  if (videoExts.includes(lower)) return 'video'
  return 'file'
}

function validatePathSafe(id: string, ext: string): void {
  const filename = ext ? `${id}${ext}` : id
  const resolved = path.resolve(FILES_DIR, filename)
  const filesDir = path.resolve(FILES_DIR)
  if (!resolved.startsWith(filesDir + path.sep) && resolved !== filesDir) {
    throw new Error('Path containment violation: attempted directory traversal')
  }
}

function buildManagedPath(id: string, ext: string): string {
  validatePathSafe(id, ext)
  return path.join(FILES_DIR, ext ? `${id}${ext}` : id)
}

export function getFilesDir(): string {
  return FILES_DIR
}

export async function select(options: SelectOptions): Promise<FileMetadata[]> {
  const properties: ('openFile' | 'multiSelections')[] = ['openFile']
  if (options.multiSelections) {
    properties.push('multiSelections')
  }

  const result = await dialog.showOpenDialog({
    properties,
    filters: options.filters
  })

  if (result.canceled || result.filePaths.length === 0) {
    return []
  }

  const metadataList: FileMetadata[] = []
  for (const filePath of result.filePaths) {
    const metadata = await upload(filePath)
    metadataList.push(metadata)
  }

  return metadataList
}

export async function upload(filePath: string): Promise<FileMetadata> {
  const id = uuidv4()
  const ext = path.extname(filePath)
  const name = path.basename(filePath)
  const fileStats = await stat(filePath)

  await fss.ensureDir(FILES_DIR)
  const destPath = buildManagedPath(id, ext)
  await fss.copyFile(filePath, destPath)

  const metadata: FileMetadata = {
    id,
    name,
    path: destPath,
    size: fileStats.size,
    ext,
    type: getFileType(ext),
    count: 0,
    created_at: Date.now()
  }

  logger.info('File uploaded', { id, name, size: fileStats.size })
  return metadata
}

export async function download(id: string, ext: string, targetPath?: string): Promise<void> {
  const managedPath = buildManagedPath(id, ext)

  if (!targetPath) {
    const result = await dialog.showSaveDialog({
      defaultPath: `${id}${ext}`
    })

    if (result.canceled || !result.filePath) {
      return
    }

    targetPath = result.filePath
  }

  await fss.copyFile(managedPath, targetPath)
  logger.info('File downloaded', { id, targetPath })
}

export async function read(id: string, ext: string): Promise<Buffer> {
  const managedPath = buildManagedPath(id, ext)
  return fss.readFile(managedPath)
}

export async function deleteFile(id: string, ext: string): Promise<void> {
  const managedPath = buildManagedPath(id, ext)
  await fss.deleteFile(managedPath)
  logger.info('File deleted', { id })
}

export async function open(id: string, ext: string): Promise<void> {
  const managedPath = buildManagedPath(id, ext)
  const fileExists = await fss.exists(managedPath)

  if (!fileExists) {
    throw new Error(`File not found: ${id}${ext}`)
  }

  await shell.openPath(managedPath)
  logger.info('File opened', { id })
}

export function getPath(id: string, ext: string): string {
  return buildManagedPath(id, ext)
}
