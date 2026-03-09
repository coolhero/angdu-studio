import { app, BrowserWindow } from 'electron'
import archiver from 'archiver'
import AdmZip from 'adm-zip'
import path from 'path'
import fs from 'fs'
import fsp from 'fs/promises'

import { configManager } from './ConfigManager'

export interface BackupFileInfo {
  name: string
  path: string
  size: number
  createdAt: string
}

interface BackupMetadata {
  timestamp: string
  appVersion: string
  formatVersion: number
}

const BACKUP_FORMAT_VERSION = 1

class BackupService {
  getBackupDir(): string {
    return path.join(app.getPath('userData'), 'backups')
  }

  private getFilesDir(): string {
    return path.join(app.getPath('userData'), 'files')
  }

  private async ensureDir(dirPath: string): Promise<void> {
    await fsp.mkdir(dirPath, { recursive: true })
  }

  async backupToLocalDir(dirPath: string, mainWindow: BrowserWindow): Promise<void> {
    await this.ensureDir(dirPath)

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const zipFileName = `backup-${timestamp}.zip`
    const zipFilePath = path.join(dirPath, zipFileName)

    const output = fs.createWriteStream(zipFilePath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    return new Promise<void>((resolve, reject) => {
      output.on('close', () => {
        mainWindow.webContents.send('backup-progress', { percent: 100, stage: 'complete' })
        resolve()
      })

      archive.on('error', (err) => {
        reject(err)
      })

      archive.on('progress', (progress) => {
        const percent = Math.round((progress.entries.processed / Math.max(progress.entries.total, 1)) * 90)
        mainWindow.webContents.send('backup-progress', { percent, stage: 'archiving' })
      })

      archive.pipe(output)

      // Stage 1: Export electron-store data
      mainWindow.webContents.send('backup-progress', { percent: 0, stage: 'exporting-stores' })
      const storeData = JSON.stringify(configManager.get<Record<string, unknown>>('') ?? {}, null, 2)
      archive.append(storeData, { name: 'stores/config.json' })

      // Stage 2: Add files directory
      mainWindow.webContents.send('backup-progress', { percent: 10, stage: 'archiving-files' })
      const filesDir = this.getFilesDir()
      if (fs.existsSync(filesDir)) {
        archive.directory(filesDir, 'files')
      }

      // Stage 3: Add metadata
      const metadata: BackupMetadata = {
        timestamp: new Date().toISOString(),
        appVersion: app.getVersion(),
        formatVersion: BACKUP_FORMAT_VERSION
      }
      archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' })

      archive.finalize()
    })
  }

  async restoreFromLocalBackup(filePath: string, mainWindow: BrowserWindow): Promise<void> {
    const isValid = await this.validateArchive(filePath)
    if (!isValid) {
      throw new Error('Invalid backup archive: missing or invalid metadata.json')
    }

    mainWindow.webContents.send('restore-progress', { percent: 0, stage: 'validating' })

    const zip = new AdmZip(filePath)
    const entries = zip.getEntries()
    const totalEntries = entries.length

    // Restore stores
    mainWindow.webContents.send('restore-progress', { percent: 10, stage: 'restoring-stores' })
    const configEntry = zip.getEntry('stores/config.json')
    if (configEntry) {
      const configData = JSON.parse(configEntry.getData().toString('utf8'))
      for (const [key, value] of Object.entries(configData)) {
        configManager.set(key, value)
      }
    }

    // Restore files
    mainWindow.webContents.send('restore-progress', { percent: 30, stage: 'restoring-files' })
    const filesDir = this.getFilesDir()
    await this.ensureDir(filesDir)

    let processed = 0
    for (const entry of entries) {
      if (entry.entryName.startsWith('files/') && !entry.isDirectory) {
        const relativePath = entry.entryName.slice('files/'.length)
        const targetPath = path.join(filesDir, relativePath)
        await this.ensureDir(path.dirname(targetPath))
        await fsp.writeFile(targetPath, entry.getData())
      }
      processed++
      const percent = 30 + Math.round((processed / totalEntries) * 60)
      mainWindow.webContents.send('restore-progress', { percent, stage: 'restoring-files' })
    }

    mainWindow.webContents.send('restore-progress', { percent: 95, stage: 'relaunching' })

    // Relaunch app after restore
    app.relaunch()
    app.exit(0)
  }

  async listLocalBackupFiles(): Promise<BackupFileInfo[]> {
    const backupDir = this.getBackupDir()

    try {
      await fsp.access(backupDir)
    } catch {
      return []
    }

    const files = await fsp.readdir(backupDir)
    const backupFiles: BackupFileInfo[] = []

    for (const file of files) {
      if (!file.endsWith('.zip')) continue

      const filePath = path.join(backupDir, file)
      const stat = await fsp.stat(filePath)
      backupFiles.push({
        name: file,
        path: filePath,
        size: stat.size,
        createdAt: stat.birthtime.toISOString()
      })
    }

    return backupFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async deleteLocalBackupFile(filePath: string): Promise<void> {
    await fsp.unlink(filePath)
  }

  async validateArchive(filePath: string): Promise<boolean> {
    try {
      const zip = new AdmZip(filePath)
      const metadataEntry = zip.getEntry('metadata.json')
      if (!metadataEntry) return false

      const metadata = JSON.parse(metadataEntry.getData().toString('utf8')) as BackupMetadata
      return !!(metadata.timestamp && metadata.appVersion && metadata.formatVersion)
    } catch {
      return false
    }
  }

  async migrateDataDirectory(
    oldPath: string,
    newPath: string,
    mainWindow: BrowserWindow
  ): Promise<void> {
    mainWindow.webContents.send('backup-progress', { percent: 0, stage: 'preparing-migration' })

    await this.ensureDir(newPath)

    const allFiles = await this.collectFiles(oldPath)
    const totalFiles = allFiles.length

    for (let i = 0; i < totalFiles; i++) {
      const file = allFiles[i]
      const relativePath = path.relative(oldPath, file)
      const targetPath = path.join(newPath, relativePath)

      await this.ensureDir(path.dirname(targetPath))
      await fsp.copyFile(file, targetPath)

      const percent = Math.round(((i + 1) / totalFiles) * 100)
      mainWindow.webContents.send('backup-progress', { percent, stage: 'migrating' })
    }

    mainWindow.webContents.send('backup-progress', { percent: 100, stage: 'migration-complete' })
  }

  private async collectFiles(dirPath: string): Promise<string[]> {
    const result: string[] = []

    try {
      const entries = await fsp.readdir(dirPath, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)
        if (entry.isDirectory()) {
          const nested = await this.collectFiles(fullPath)
          result.push(...nested)
        } else {
          result.push(fullPath)
        }
      }
    } catch {
      // Directory doesn't exist or isn't readable
    }

    return result
  }
}

export const backupService = new BackupService()
