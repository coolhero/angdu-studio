import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// ── Types ──

interface WebDavConfig {
  webdavUrl: string
  webdavUsername: string
  webdavPassword: string
  webdavPath: string
}

interface S3Config {
  s3Bucket: string
  s3Region: string
  s3AccessKeyId: string
  s3SecretAccessKey: string
  s3Endpoint: string
}

interface BackupStoreState extends WebDavConfig, S3Config {
  lastBackupTime: string | null
  autoBackupEnabled: boolean
  autoBackupInterval: number

  setWebdavConfig: (config: Partial<WebDavConfig>) => void
  setS3Config: (config: Partial<S3Config>) => void
  setLastBackupTime: (time: string) => void
  setAutoBackup: (enabled: boolean, interval?: number) => void
  resetWebdav: () => void
  resetS3: () => void
}

// ── Defaults ──

const defaultWebdav: WebDavConfig = {
  webdavUrl: '',
  webdavUsername: '',
  webdavPassword: '',
  webdavPath: '/angdu-backup'
}

const defaultS3: S3Config = {
  s3Bucket: '',
  s3Region: '',
  s3AccessKeyId: '',
  s3SecretAccessKey: '',
  s3Endpoint: ''
}

// ── Store ──

export const useBackupStore = create<BackupStoreState>()(
  persist(
    immer((set) => ({
      ...defaultWebdav,
      ...defaultS3,
      lastBackupTime: null,
      autoBackupEnabled: false,
      autoBackupInterval: 24,

      setWebdavConfig: (config: Partial<WebDavConfig>) =>
        set((state) => {
          Object.assign(state, config)
        }),

      setS3Config: (config: Partial<S3Config>) =>
        set((state) => {
          Object.assign(state, config)
        }),

      setLastBackupTime: (time: string) =>
        set((state) => {
          state.lastBackupTime = time
        }),

      setAutoBackup: (enabled: boolean, interval?: number) =>
        set((state) => {
          state.autoBackupEnabled = enabled
          if (interval !== undefined) {
            state.autoBackupInterval = interval
          }
        }),

      resetWebdav: () =>
        set((state) => {
          Object.assign(state, defaultWebdav)
        }),

      resetS3: () =>
        set((state) => {
          Object.assign(state, defaultS3)
        })
    })),
    {
      name: 'angdu-backup',
      partialize: (state) => ({
        webdavUrl: state.webdavUrl,
        webdavUsername: state.webdavUsername,
        webdavPassword: state.webdavPassword,
        webdavPath: state.webdavPath,
        s3Bucket: state.s3Bucket,
        s3Region: state.s3Region,
        s3AccessKeyId: state.s3AccessKeyId,
        s3SecretAccessKey: state.s3SecretAccessKey,
        s3Endpoint: state.s3Endpoint,
        lastBackupTime: state.lastBackupTime,
        autoBackupEnabled: state.autoBackupEnabled,
        autoBackupInterval: state.autoBackupInterval
      })
    }
  )
)
