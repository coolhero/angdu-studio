import { useState, useCallback, useEffect } from 'react'

// ── Local Types ──

export interface WebDavConfig {
  url: string
  username: string
  password: string
  basePath?: string
}

export interface S3Config {
  endpoint: string
  region: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  prefix?: string
}

export interface BackupFileInfo {
  name: string
  size: number
  createdAt: number
  path?: string
}

export interface BackupProgress {
  percent: number
  stage: string
}

/**
 * Hook for backup/restore operations with progress tracking.
 *
 * Listens for 'backup-progress' and 'restore-progress' IPC events
 * and exposes methods for local, WebDAV, and S3 backup/restore.
 */
export function useBackup() {
  const [backupProgress, setBackupProgress] = useState<BackupProgress | null>(null)
  const [restoreProgress, setRestoreProgress] = useState<BackupProgress | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Listen for progress events from the main process
  useEffect(() => {
    if (!window.api?.backup?.onProgress) return
    const cleanupBackup = window.api.backup.onProgress(
      (progress: BackupProgress) => setBackupProgress(progress)
    )
    const cleanupRestore = window.api.backup.onRestoreProgress(
      (progress: BackupProgress) => setRestoreProgress(progress)
    )
    return () => {
      cleanupBackup()
      cleanupRestore()
    }
  }, [])

  // ── Local Backup ──

  const backupToLocal = useCallback(async (dirPath: string): Promise<void> => {
    setIsLoading(true)
    setBackupProgress(null)
    try {
      await window.api.backup.backupToLocalDir(dirPath)
    } finally {
      setIsLoading(false)
      setBackupProgress(null)
    }
  }, [])

  const restoreFromLocal = useCallback(async (filePath: string): Promise<void> => {
    setIsLoading(true)
    setRestoreProgress(null)
    try {
      await window.api.backup.restoreFromLocal(filePath)
    } finally {
      setIsLoading(false)
      setRestoreProgress(null)
    }
  }, [])

  const listLocalBackups = useCallback(async (): Promise<BackupFileInfo[]> => {
    return window.api.backup.listLocalFiles()
  }, [])

  // ── WebDAV Backup ──

  const backupToWebdav = useCallback(async (config: WebDavConfig): Promise<void> => {
    setIsLoading(true)
    setBackupProgress(null)
    try {
      await window.api.backup.backupToWebdav(config)
    } finally {
      setIsLoading(false)
      setBackupProgress(null)
    }
  }, [])

  const restoreFromWebdav = useCallback(
    async (config: WebDavConfig, fileName: string): Promise<void> => {
      setIsLoading(true)
      setRestoreProgress(null)
      try {
        await window.api.backup.restoreFromWebdav(config, fileName)
      } finally {
        setIsLoading(false)
        setRestoreProgress(null)
      }
    },
    []
  )

  const checkWebdavConnection = useCallback(async (config: WebDavConfig): Promise<boolean> => {
    return window.api.backup.checkWebdavConnection(config)
  }, [])

  const listWebdavBackups = useCallback(
    async (config: WebDavConfig): Promise<BackupFileInfo[]> => {
      return window.api.backup.listWebdavFiles(config)
    },
    []
  )

  // ── S3 Backup ──

  const backupToS3 = useCallback(async (config: S3Config): Promise<void> => {
    setIsLoading(true)
    setBackupProgress(null)
    try {
      await window.api.backup.backupToS3(config)
    } finally {
      setIsLoading(false)
      setBackupProgress(null)
    }
  }, [])

  const restoreFromS3 = useCallback(async (config: S3Config, key: string): Promise<void> => {
    setIsLoading(true)
    setRestoreProgress(null)
    try {
      await window.api.backup.restoreFromS3(config, key)
    } finally {
      setIsLoading(false)
      setRestoreProgress(null)
    }
  }, [])

  const checkS3Connection = useCallback(async (config: S3Config): Promise<boolean> => {
    return window.api.backup.checkS3Connection(config)
  }, [])

  const listS3Backups = useCallback(async (config: S3Config): Promise<BackupFileInfo[]> => {
    return window.api.backup.listS3Files(config)
  }, [])

  return {
    // Progress state
    backupProgress,
    restoreProgress,
    isLoading,

    // Local
    backupToLocal,
    restoreFromLocal,
    listLocalBackups,

    // WebDAV
    backupToWebdav,
    restoreFromWebdav,
    checkWebdavConnection,
    listWebdavBackups,

    // S3
    backupToS3,
    restoreFromS3,
    checkS3Connection,
    listS3Backups
  }
}
