import { ipcMain, app, BrowserWindow } from 'electron'
import path from 'node:path'
import fsp from 'node:fs/promises'

import { IpcChannel } from '@shared/ipc-channels'
import { backupService } from '../services/BackupService'
import { webDavService, type WebDavConfig } from '../services/WebDavService'
import { s3Service, type S3Config } from '../services/S3Service'
import { configManager } from '../services/ConfigManager'

export function registerBackupIpc(mainWindow: BrowserWindow): void {
  // ── Local Backup ──

  ipcMain.handle(IpcChannel.Backup_ToLocalDir, async (_, dirPath: string) => {
    try {
      return await backupService.backupToLocalDir(dirPath, mainWindow)
    } catch (error) {
      throw new Error(`Backup to local directory failed: ${(error as Error).message}`)
    }
  })

  ipcMain.handle(IpcChannel.Backup_RestoreFromLocal, async (_, filePath: string) => {
    try {
      return await backupService.restoreFromLocalBackup(filePath, mainWindow)
    } catch (error) {
      throw new Error(`Restore from local backup failed: ${(error as Error).message}`)
    }
  })

  ipcMain.handle(IpcChannel.Backup_ListLocalFiles, async () => {
    try {
      return await backupService.listLocalBackupFiles()
    } catch (error) {
      throw new Error(`List local backup files failed: ${(error as Error).message}`)
    }
  })

  ipcMain.handle(IpcChannel.Backup_DeleteLocalFile, async (_, filePath: string) => {
    try {
      return await backupService.deleteLocalBackupFile(filePath)
    } catch (error) {
      throw new Error(`Delete local backup file failed: ${(error as Error).message}`)
    }
  })

  // ── WebDAV ──

  ipcMain.handle(IpcChannel.Backup_CheckWebdavConnection, async (_, config: WebDavConfig) => {
    try {
      return await webDavService.checkConnection(config)
    } catch (error) {
      throw new Error(`WebDAV connection check failed: ${(error as Error).message}`)
    }
  })

  ipcMain.handle(IpcChannel.Backup_ToWebdav, async (_, config: WebDavConfig) => {
    try {
      const tempDir = path.join(app.getPath('temp'), 'angdu-backup')
      await fsp.mkdir(tempDir, { recursive: true })

      await backupService.backupToLocalDir(tempDir, mainWindow)

      const files = await fsp.readdir(tempDir)
      const latestZip = files
        .filter((f) => f.endsWith('.zip'))
        .sort()
        .pop()

      if (!latestZip) {
        throw new Error('No backup archive was created')
      }

      const localPath = path.join(tempDir, latestZip)
      await webDavService.upload(config, localPath, latestZip)

      await fsp.unlink(localPath)
    } catch (error) {
      throw new Error(`Backup to WebDAV failed: ${(error as Error).message}`)
    }
  })

  ipcMain.handle(
    IpcChannel.Backup_RestoreFromWebdav,
    async (_, args: { config: WebDavConfig; fileName: string }) => {
      try {
        const tempDir = path.join(app.getPath('temp'), 'angdu-backup')
        await fsp.mkdir(tempDir, { recursive: true })

        const localPath = path.join(tempDir, args.fileName)
        await webDavService.download(args.config, args.fileName, localPath)
        await backupService.restoreFromLocalBackup(localPath, mainWindow)
      } catch (error) {
        throw new Error(`Restore from WebDAV failed: ${(error as Error).message}`)
      }
    }
  )

  ipcMain.handle(IpcChannel.Backup_ListWebdavFiles, async (_, config: WebDavConfig) => {
    try {
      return await webDavService.listFiles(config)
    } catch (error) {
      throw new Error(`List WebDAV files failed: ${(error as Error).message}`)
    }
  })

  ipcMain.handle(
    IpcChannel.Backup_DeleteWebdavFile,
    async (_, args: { config: WebDavConfig; fileName: string }) => {
      try {
        return await webDavService.deleteFile(args.config, args.fileName)
      } catch (error) {
        throw new Error(`Delete WebDAV file failed: ${(error as Error).message}`)
      }
    }
  )

  // ── S3 ──

  ipcMain.handle(IpcChannel.Backup_CheckS3Connection, async (_, config: S3Config) => {
    try {
      return await s3Service.checkConnection(config)
    } catch (error) {
      throw new Error(`S3 connection check failed: ${(error as Error).message}`)
    }
  })

  ipcMain.handle(IpcChannel.Backup_ToS3, async (_, config: S3Config) => {
    try {
      const tempDir = path.join(app.getPath('temp'), 'angdu-backup')
      await fsp.mkdir(tempDir, { recursive: true })

      await backupService.backupToLocalDir(tempDir, mainWindow)

      const files = await fsp.readdir(tempDir)
      const latestZip = files
        .filter((f) => f.endsWith('.zip'))
        .sort()
        .pop()

      if (!latestZip) {
        throw new Error('No backup archive was created')
      }

      const localPath = path.join(tempDir, latestZip)
      await s3Service.upload(config, localPath, latestZip)

      await fsp.unlink(localPath)
    } catch (error) {
      throw new Error(`Backup to S3 failed: ${(error as Error).message}`)
    }
  })

  ipcMain.handle(
    IpcChannel.Backup_RestoreFromS3,
    async (_, args: { config: S3Config; key: string }) => {
      try {
        const tempDir = path.join(app.getPath('temp'), 'angdu-backup')
        await fsp.mkdir(tempDir, { recursive: true })

        const fileName = args.key.split('/').pop() ?? args.key
        const localPath = path.join(tempDir, fileName)
        await s3Service.download(args.config, args.key, localPath)
        await backupService.restoreFromLocalBackup(localPath, mainWindow)
      } catch (error) {
        throw new Error(`Restore from S3 failed: ${(error as Error).message}`)
      }
    }
  )

  ipcMain.handle(IpcChannel.Backup_ListS3Files, async (_, config: S3Config) => {
    try {
      return await s3Service.listFiles(config)
    } catch (error) {
      throw new Error(`List S3 files failed: ${(error as Error).message}`)
    }
  })

  ipcMain.handle(
    IpcChannel.Backup_DeleteS3File,
    async (_, args: { config: S3Config; key: string }) => {
      try {
        return await s3Service.deleteFile(args.config, args.key)
      } catch (error) {
        throw new Error(`Delete S3 file failed: ${(error as Error).message}`)
      }
    }
  )

  // ── Data Migration ──

  ipcMain.handle(IpcChannel.Data_SetDataPath, (_, dataPath: string) => {
    try {
      configManager.set('dataPath', dataPath)
    } catch (error) {
      throw new Error(`Set data path failed: ${(error as Error).message}`)
    }
  })

  ipcMain.handle(IpcChannel.Data_GetDataPath, () => {
    try {
      return configManager.get<string>('dataPath', app.getPath('userData'))
    } catch (error) {
      throw new Error(`Get data path failed: ${(error as Error).message}`)
    }
  })

  ipcMain.handle(
    IpcChannel.Data_MigrateData,
    async (_, args: { oldPath: string; newPath: string }) => {
      try {
        return await backupService.migrateDataDirectory(args.oldPath, args.newPath, mainWindow)
      } catch (error) {
        throw new Error(`Data migration failed: ${(error as Error).message}`)
      }
    }
  )
}
