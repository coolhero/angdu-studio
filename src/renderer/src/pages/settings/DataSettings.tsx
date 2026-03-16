import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore, useBackupMaxRetained } from '@renderer/stores/useSettingsStore'
import { SettingSection } from '@renderer/components/settings/SettingSection'
import { SettingItem } from '@renderer/components/settings/SettingItem'
import { Download, Upload, Trash2, FolderOpen, AlertTriangle } from 'lucide-react'

export default function DataSettings() {
  const { t } = useTranslation()
  const backupMaxRetained = useBackupMaxRetained()

  const [storagePath, setStoragePath] = useState('')
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Fetch storage path on mount
  useEffect(() => {
    window.api.invoke['data:getStoragePath']()
      .then(setStoragePath)
      .catch((err) => console.error('[DataSettings] Failed to get storage path', err))
  }, [])

  // ─── Export ────────────────────────────────────────────────────────────────
  const handleExport = useCallback(async () => {
    setExportStatus('loading')
    setStatusMessage('')
    try {
      // Get save path from user
      const savePath = await window.api.invoke['dialog:saveFile']({
        defaultPath: `angdu-backup-${new Date().toISOString().slice(0, 10)}.zip`,
        filters: [{ name: 'Backup', extensions: ['zip'] }]
      })
      if (!savePath) {
        setExportStatus('idle')
        return
      }

      // Export data — returns Buffer
      const buffer = await window.api.invoke['data:export']()
      // Write using file:write (relative to userData)
      // Since savePath is absolute, use shell to write via a trick:
      // Actually, we need to write to the user-selected path.
      // Use file:write with the save path as-is — the main process handler
      // resolves paths relative to userData, but we pass the absolute path.
      // For now, we use the buffer directly with a Blob download approach.
      const blob = new Blob([new Uint8Array(buffer)], { type: 'application/zip' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = savePath.split('/').pop() ?? 'angdu-backup.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setExportStatus('success')
      setStatusMessage(t('settings.data.exportSuccess'))
      setTimeout(() => setExportStatus('idle'), 3000)
    } catch (err) {
      console.error('[DataSettings] Export failed', err)
      setExportStatus('error')
      setStatusMessage(t('settings.data.exportError'))
      setTimeout(() => setExportStatus('idle'), 3000)
    }
  }, [t])

  // ─── Import ────────────────────────────────────────────────────────────────
  const handleImport = useCallback(async () => {
    setImportStatus('loading')
    setStatusMessage('')
    try {
      const filePaths = await window.api.invoke['dialog:openFile']({
        filters: [{ name: 'Backup', extensions: ['zip', 'bak'] }]
      })
      if (!filePaths || filePaths.length === 0) {
        setImportStatus('idle')
        return
      }

      // Read the file using fetch with file:// protocol (works in Electron)
      const filePath = filePaths[0]
      const response = await fetch(`file://${filePath}`)
      const arrayBuffer = await response.arrayBuffer()

      await window.api.invoke['data:import'](arrayBuffer)
      setImportStatus('success')
      setStatusMessage(t('settings.data.importSuccess'))
      setTimeout(() => setImportStatus('idle'), 3000)
    } catch (err) {
      console.error('[DataSettings] Import failed', err)
      setImportStatus('error')
      setStatusMessage(t('settings.data.importError'))
      setTimeout(() => setImportStatus('idle'), 3000)
    }
  }, [t])

  // ─── Clear Data ────────────────────────────────────────────────────────────
  const handleClear = useCallback(async () => {
    try {
      await window.api.invoke['data:clear']()
      await window.api.invoke['app:relaunch']()
    } catch (err) {
      console.error('[DataSettings] Clear data failed', err)
    }
  }, [])

  // ─── Open Folder ───────────────────────────────────────────────────────────
  const handleOpenFolder = useCallback(() => {
    if (storagePath) {
      window.api.invoke['shell:openPath'](storagePath)
    }
  }, [storagePath])

  // ─── Backup Retention ─────────────────────────────────────────────────────
  const handleBackupRetentionChange = useCallback((value: string) => {
    const num = parseInt(value, 10)
    if (!isNaN(num) && num >= 1 && num <= 100) {
      useSettingsStore.getState().setSetting('backupMaxRetained', num)
    }
  }, [])

  return (
    <div className="max-w-2xl">
      <h2 className="mb-6 text-xl font-bold text-foreground">{t('settings.data.title')}</h2>

      {/* Status message */}
      {statusMessage && (
        <div
          className={`mb-4 rounded-md px-3 py-2 text-sm ${
            exportStatus === 'success' || importStatus === 'success'
              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
              : exportStatus === 'error' || importStatus === 'error'
                ? 'bg-destructive/10 text-destructive'
                : ''
          }`}
        >
          {statusMessage}
        </div>
      )}

      {/* Export & Import */}
      <SettingSection title={t('settings.data.backupRestore')}>
        <SettingItem label={t('settings.data.export')} description={t('settings.data.exportDesc')}>
          <button
            type="button"
            onClick={handleExport}
            disabled={exportStatus === 'loading'}
            className="flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            {exportStatus === 'loading' ? t('common.loading') : t('settings.data.export')}
          </button>
        </SettingItem>

        <SettingItem label={t('settings.data.import')} description={t('settings.data.importDesc')}>
          <button
            type="button"
            onClick={handleImport}
            disabled={importStatus === 'loading'}
            className="flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs text-foreground hover:bg-muted disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" />
            {importStatus === 'loading' ? t('common.loading') : t('settings.data.import')}
          </button>
        </SettingItem>
      </SettingSection>

      {/* Backup Retention */}
      <SettingSection title={t('settings.data.backupRetention')}>
        <SettingItem
          label={t('settings.data.backupMaxRetained')}
          description={t('settings.data.backupMaxRetainedDesc')}
        >
          <input
            type="number"
            min={1}
            max={100}
            value={backupMaxRetained}
            onChange={(e) => handleBackupRetentionChange(e.target.value)}
            className="h-8 w-20 rounded-md border border-border bg-transparent px-3 text-sm shadow-sm text-center focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </SettingItem>
      </SettingSection>

      {/* Storage Location */}
      <SettingSection title={t('settings.data.storage')}>
        <SettingItem label={t('settings.data.storagePath')} description={t('settings.data.storagePathDesc')}>
          <div className="flex items-center gap-2">
            <span className="max-w-[200px] truncate text-xs text-muted-foreground" title={storagePath}>
              {storagePath || '...'}
            </span>
            <button
              type="button"
              onClick={handleOpenFolder}
              disabled={!storagePath}
              className="flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs text-foreground hover:bg-muted disabled:opacity-50"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              {t('settings.data.openFolder')}
            </button>
          </div>
        </SettingItem>
      </SettingSection>

      {/* Clear Data */}
      <SettingSection title={t('settings.data.dangerZone')}>
        <SettingItem label={t('settings.data.clearData')} description={t('settings.data.clearDataDesc')}>
          {showClearConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-destructive">{t('settings.data.clearDataConfirm')}</span>
              <button
                type="button"
                onClick={handleClear}
                className="flex h-8 items-center gap-1.5 rounded-md bg-destructive px-3 text-xs text-destructive-foreground hover:bg-destructive/90"
              >
                {t('settings.data.clearDataConfirmYes')}
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex h-8 items-center rounded-md border border-border px-3 text-xs text-muted-foreground hover:bg-muted"
              >
                {t('common.cancel')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="flex h-8 items-center gap-1.5 rounded-md border border-destructive/50 px-3 text-xs text-destructive hover:bg-destructive/10"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {t('settings.data.clearData')}
            </button>
          )}
        </SettingItem>
      </SettingSection>
    </div>
  )
}
