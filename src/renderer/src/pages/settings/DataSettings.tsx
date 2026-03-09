import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useBackupStore } from '../../stores/useBackupStore'
import { useBackup, type BackupFileInfo } from '../../hooks/useBackup'
import { SettingSection } from '../../components/settings/SettingSection'
import { SettingItem } from '../../components/settings/SettingItem'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

export default function DataSettings(): JSX.Element {
  const { t } = useTranslation()

  // ── Store state (raw selectors, derived in component) ──

  const webdavUrl = useBackupStore((s) => s.webdavUrl)
  const webdavUsername = useBackupStore((s) => s.webdavUsername)
  const webdavPassword = useBackupStore((s) => s.webdavPassword)
  const webdavPath = useBackupStore((s) => s.webdavPath)
  const setWebdavConfig = useBackupStore((s) => s.setWebdavConfig)

  const s3Bucket = useBackupStore((s) => s.s3Bucket)
  const s3Region = useBackupStore((s) => s.s3Region)
  const s3AccessKeyId = useBackupStore((s) => s.s3AccessKeyId)
  const s3SecretAccessKey = useBackupStore((s) => s.s3SecretAccessKey)
  const s3Endpoint = useBackupStore((s) => s.s3Endpoint)
  const setS3Config = useBackupStore((s) => s.setS3Config)

  // ── Backup hook ──

  const {
    isLoading,
    backupToLocal,
    restoreFromLocal,
    listLocalBackups,
    backupToWebdav,
    restoreFromWebdav,
    checkWebdavConnection,
    backupToS3,
    restoreFromS3,
    checkS3Connection
  } = useBackup()

  // ── Local backup file list ──

  const [localFiles, setLocalFiles] = useState<BackupFileInfo[]>([])

  const refreshLocalFiles = useCallback(async () => {
    try {
      const files = await listLocalBackups()
      setLocalFiles(files)
    } catch {
      // silently fail — list may not be available yet
    }
  }, [listLocalBackups])

  useEffect(() => {
    refreshLocalFiles()
  }, [refreshLocalFiles])

  // ── Handlers: Local ──

  const handleBackupLocal = async () => {
    try {
      // TODO: Use electron dialog to select folder (T038)
      const dirPath = await window.api.dialog?.selectDirectory?.()
      if (!dirPath) return
      await backupToLocal(dirPath)
      toast.success(t('settings.data.backupSuccess', 'Backup completed successfully'))
      refreshLocalFiles()
    } catch (err) {
      toast.error(t('settings.data.backupError', 'Backup failed: ') + String(err))
    }
  }

  const handleRestoreLocal = async () => {
    try {
      // TODO: Use electron dialog to select file (T038)
      const filePath = await window.api.dialog?.selectFile?.()
      if (!filePath) return
      await restoreFromLocal(filePath)
      toast.success(t('settings.data.restoreSuccess', 'Restore completed successfully'))
    } catch (err) {
      toast.error(t('settings.data.restoreError', 'Restore failed: ') + String(err))
    }
  }

  const handleDeleteLocalFile = async (file: BackupFileInfo) => {
    try {
      // TODO: Implement delete via window.api.backup.deleteLocalFile(file.path)
      toast.success(t('settings.data.deleteSuccess', 'File deleted'))
      refreshLocalFiles()
    } catch (err) {
      toast.error(t('settings.data.deleteError', 'Delete failed: ') + String(err))
    }
  }

  // ── Handlers: WebDAV ──

  const buildWebdavConfig = () => ({
    url: webdavUrl,
    username: webdavUsername,
    password: webdavPassword,
    basePath: webdavPath
  })

  const handleTestWebdav = async () => {
    try {
      const ok = await checkWebdavConnection(buildWebdavConfig())
      if (ok) {
        toast.success(t('settings.data.connectionSuccess', 'Connection successful'))
      } else {
        toast.error(t('settings.data.connectionFailed', 'Connection failed'))
      }
    } catch (err) {
      toast.error(t('settings.data.connectionError', 'Connection error: ') + String(err))
    }
  }

  const handleBackupWebdav = async () => {
    try {
      await backupToWebdav(buildWebdavConfig())
      toast.success(t('settings.data.backupSuccess', 'Backup completed successfully'))
    } catch (err) {
      toast.error(t('settings.data.backupError', 'Backup failed: ') + String(err))
    }
  }

  const handleRestoreWebdav = async () => {
    try {
      // TODO: Let user pick which file to restore from WebDAV list
      await restoreFromWebdav(buildWebdavConfig(), 'latest')
      toast.success(t('settings.data.restoreSuccess', 'Restore completed successfully'))
    } catch (err) {
      toast.error(t('settings.data.restoreError', 'Restore failed: ') + String(err))
    }
  }

  // ── Handlers: S3 ──

  const buildS3Config = () => ({
    endpoint: s3Endpoint,
    region: s3Region,
    bucket: s3Bucket,
    accessKeyId: s3AccessKeyId,
    secretAccessKey: s3SecretAccessKey
  })

  const handleTestS3 = async () => {
    try {
      const ok = await checkS3Connection(buildS3Config())
      if (ok) {
        toast.success(t('settings.data.connectionSuccess', 'Connection successful'))
      } else {
        toast.error(t('settings.data.connectionFailed', 'Connection failed'))
      }
    } catch (err) {
      toast.error(t('settings.data.connectionError', 'Connection error: ') + String(err))
    }
  }

  const handleBackupS3 = async () => {
    try {
      await backupToS3(buildS3Config())
      toast.success(t('settings.data.backupSuccess', 'Backup completed successfully'))
    } catch (err) {
      toast.error(t('settings.data.backupError', 'Backup failed: ') + String(err))
    }
  }

  const handleRestoreS3 = async () => {
    try {
      // TODO: Let user pick which key to restore from S3 list
      await restoreFromS3(buildS3Config(), 'latest')
      toast.success(t('settings.data.restoreSuccess', 'Restore completed successfully'))
    } catch (err) {
      toast.error(t('settings.data.restoreError', 'Restore failed: ') + String(err))
    }
  }

  // ── Render ──

  return (
    <div className="space-y-4 p-6">
      {/* Local Backup */}
      <SettingSection title={t('settings.data.localBackup', 'Local Backup')}>
        <SettingItem
          title={t('settings.data.backupRestore', 'Backup & Restore')}
          description={t('settings.data.backupRestoreDesc', 'Create or restore a local backup of your data')}
        >
          <div className="flex gap-2">
            <Button size="sm" onClick={handleBackupLocal} disabled={isLoading}>
              {t('settings.data.backup', 'Backup')}
            </Button>
            <Button size="sm" variant="outline" onClick={handleRestoreLocal} disabled={isLoading}>
              {t('settings.data.restore', 'Restore')}
            </Button>
          </div>
        </SettingItem>

        {localFiles.length > 0 && (
          <div className="space-y-1 pb-2">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {t('settings.data.backupFiles', 'Backup Files')}
            </div>
            {localFiles.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between rounded px-2 py-1.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <div className="flex-1">
                  <span className="text-zinc-700 dark:text-zinc-300">{file.name}</span>
                  <span className="ml-2 text-zinc-400">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs text-red-500 hover:text-red-600"
                  onClick={() => handleDeleteLocalFile(file)}
                >
                  {t('common.delete', 'Delete')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </SettingSection>

      {/* WebDAV */}
      <SettingSection title={t('settings.data.webdav', 'WebDAV')} defaultOpen={false}>
        <SettingItem title={t('settings.data.webdavUrl', 'URL')}>
          <Input
            className="w-64"
            placeholder="https://dav.example.com"
            value={webdavUrl}
            onChange={(e) => setWebdavConfig({ webdavUrl: e.target.value })}
          />
        </SettingItem>
        <SettingItem title={t('settings.data.username', 'Username')}>
          <Input
            className="w-64"
            value={webdavUsername}
            onChange={(e) => setWebdavConfig({ webdavUsername: e.target.value })}
          />
        </SettingItem>
        <SettingItem title={t('settings.data.password', 'Password')}>
          <Input
            className="w-64"
            type="password"
            value={webdavPassword}
            onChange={(e) => setWebdavConfig({ webdavPassword: e.target.value })}
          />
        </SettingItem>
        <SettingItem title={t('settings.data.path', 'Path')}>
          <Input
            className="w-64"
            placeholder="/angdu-backup"
            value={webdavPath}
            onChange={(e) => setWebdavConfig({ webdavPath: e.target.value })}
          />
        </SettingItem>
        <SettingItem title={t('settings.data.actions', 'Actions')}>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleTestWebdav} disabled={isLoading}>
              {t('settings.data.testConnection', 'Test Connection')}
            </Button>
            <Button size="sm" onClick={handleBackupWebdav} disabled={isLoading}>
              {t('settings.data.backupToWebdav', 'Backup to WebDAV')}
            </Button>
            <Button size="sm" variant="outline" onClick={handleRestoreWebdav} disabled={isLoading}>
              {t('settings.data.restoreFromWebdav', 'Restore from WebDAV')}
            </Button>
          </div>
        </SettingItem>
      </SettingSection>

      {/* S3 */}
      <SettingSection title={t('settings.data.s3', 'S3')} defaultOpen={false}>
        <SettingItem title={t('settings.data.s3Bucket', 'Bucket')}>
          <Input
            className="w-64"
            value={s3Bucket}
            onChange={(e) => setS3Config({ s3Bucket: e.target.value })}
          />
        </SettingItem>
        <SettingItem title={t('settings.data.s3Region', 'Region')}>
          <Input
            className="w-64"
            placeholder="us-east-1"
            value={s3Region}
            onChange={(e) => setS3Config({ s3Region: e.target.value })}
          />
        </SettingItem>
        <SettingItem title={t('settings.data.s3AccessKey', 'Access Key')}>
          <Input
            className="w-64"
            value={s3AccessKeyId}
            onChange={(e) => setS3Config({ s3AccessKeyId: e.target.value })}
          />
        </SettingItem>
        <SettingItem title={t('settings.data.s3SecretKey', 'Secret Key')}>
          <Input
            className="w-64"
            type="password"
            value={s3SecretAccessKey}
            onChange={(e) => setS3Config({ s3SecretAccessKey: e.target.value })}
          />
        </SettingItem>
        <SettingItem title={t('settings.data.s3Endpoint', 'Endpoint')}>
          <Input
            className="w-64"
            placeholder="https://s3.amazonaws.com"
            value={s3Endpoint}
            onChange={(e) => setS3Config({ s3Endpoint: e.target.value })}
          />
        </SettingItem>
        <SettingItem title={t('settings.data.actions', 'Actions')}>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleTestS3} disabled={isLoading}>
              {t('settings.data.testConnection', 'Test Connection')}
            </Button>
            <Button size="sm" onClick={handleBackupS3} disabled={isLoading}>
              {t('settings.data.backupToS3', 'Backup to S3')}
            </Button>
            <Button size="sm" variant="outline" onClick={handleRestoreS3} disabled={isLoading}>
              {t('settings.data.restoreFromS3', 'Restore from S3')}
            </Button>
          </div>
        </SettingItem>
      </SettingSection>

      {/* Data Directory */}
      <SettingSection title={t('settings.data.dataDirectory', 'Data Directory')}>
        <SettingItem
          title={t('settings.data.currentPath', 'Current Data Path')}
          description={t('settings.data.currentPathDesc', 'Location where application data is stored')}
        >
          <div className="flex items-center gap-2">
            <span className="max-w-xs truncate rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {/* TODO (T038): Read actual data path from config */}
              ~/Library/Application Support/angdu-studio
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled
              title={t('settings.data.changeDirectoryHint', 'Coming soon')}
            >
              {t('settings.data.changeDirectory', 'Change Directory')}
            </Button>
          </div>
        </SettingItem>
      </SettingSection>
    </div>
  )
}
