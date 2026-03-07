import fs from 'node:fs/promises'
import path from 'node:path'
import { DATA_PATH } from '@main/config'
import { loggerService } from './LoggerService'

const logger = loggerService.withContext('FileSystemService')

function ensureWithinSandbox(filePath: string): void {
  const resolved = path.resolve(filePath)
  const dataDir = path.resolve(DATA_PATH)
  if (!resolved.startsWith(dataDir + path.sep) && resolved !== dataDir) {
    throw new Error('Path outside sandbox')
  }
}

export async function readFile(filePath: string): Promise<Buffer> {
  ensureWithinSandbox(filePath)
  logger.debug('Reading file', { path: filePath })
  return fs.readFile(filePath)
}

export async function writeFile(filePath: string, data: Buffer | string): Promise<void> {
  ensureWithinSandbox(filePath)
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, data)
  logger.debug('File written', { path: filePath })
}

export async function copyFile(src: string, dest: string): Promise<void> {
  ensureWithinSandbox(dest)
  await fs.mkdir(path.dirname(dest), { recursive: true })
  await fs.copyFile(src, dest)
  logger.debug('File copied', { src, dest })
}

export async function deleteFile(filePath: string): Promise<void> {
  ensureWithinSandbox(filePath)
  await fs.unlink(filePath)
  logger.debug('File deleted', { path: filePath })
}

export async function moveFile(src: string, dest: string): Promise<void> {
  ensureWithinSandbox(dest)
  await fs.mkdir(path.dirname(dest), { recursive: true })
  await fs.rename(src, dest)
  logger.debug('File moved', { src, dest })
}

export async function renameFile(filePath: string, newName: string): Promise<void> {
  const dir = path.dirname(filePath)
  const dest = path.join(dir, newName)
  ensureWithinSandbox(dest)
  await fs.rename(filePath, dest)
  logger.debug('File renamed', { from: filePath, to: dest })
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true })
}

export async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}
