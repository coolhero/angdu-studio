import { useAppSelector } from '@renderer/store'
import type { UpdateInfo } from '@shared/types'
import { Alert, Button, Divider, Progress, Select, Space, Typography } from 'antd'
import { useCallback, useEffect, useState } from 'react'

const { Title, Text, Paragraph } = Typography

const channelOptions = [
  { value: 'stable', label: 'Stable' },
  { value: 'rc', label: 'Release Candidate' },
  { value: 'beta', label: 'Beta' }
]

interface DownloadProgress {
  percent: number
  bytesPerSecond: number
  total: number
  transferred: number
}

export default function AboutSettings() {
  const appInfo = useAppSelector((state) => state.runtime.appInfo)
  const [updateChannel, setUpdateChannel] = useState('stable')
  const [checking, setChecking] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState<UpdateInfo | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)
  const [updateDownloaded, setUpdateDownloaded] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  useEffect(() => {
    const loadChannel = async () => {
      try {
        const channel = (await window.api.config.get('updateChannel')) as string | null
        if (channel) {
          setUpdateChannel(channel)
        }
      } catch {
        // Use default channel
      }
    }
    loadChannel()
  }, [])

  useEffect(() => {
    const handleUpdateAvailable = (_event: unknown, info: UpdateInfo) => {
      setUpdateAvailable(info)
      setUpdateError(null)
    }
    const handleUpdateProgress = (_event: unknown, progress: DownloadProgress) => {
      setDownloadProgress(progress)
    }
    const handleUpdateDownloaded = () => {
      setUpdateDownloaded(true)
      setDownloadProgress(null)
    }
    const handleUpdateError = (_event: unknown, message: string) => {
      setUpdateError(message)
      setDownloadProgress(null)
    }

    const electron = window.electron
    if (electron?.ipcRenderer) {
      electron.ipcRenderer.on('app:update-available', handleUpdateAvailable)
      electron.ipcRenderer.on('app:update-progress', handleUpdateProgress)
      electron.ipcRenderer.on('app:update-downloaded', handleUpdateDownloaded)
      electron.ipcRenderer.on('app:update-error', handleUpdateError)

      return () => {
        electron.ipcRenderer.removeListener('app:update-available', handleUpdateAvailable)
        electron.ipcRenderer.removeListener('app:update-progress', handleUpdateProgress)
        electron.ipcRenderer.removeListener('app:update-downloaded', handleUpdateDownloaded)
        electron.ipcRenderer.removeListener('app:update-error', handleUpdateError)
      }
    }
  }, [])

  const handleCheckUpdate = useCallback(async () => {
    setChecking(true)
    setUpdateError(null)
    setUpdateAvailable(null)
    setUpdateDownloaded(false)
    setDownloadProgress(null)
    try {
      const result = await window.api.checkUpdate()
      if (result) {
        setUpdateAvailable(result)
      }
    } catch {
      setUpdateError('Failed to check for updates')
    } finally {
      setChecking(false)
    }
  }, [])

  const handleChannelChange = useCallback(async (channel: string) => {
    setUpdateChannel(channel)
    try {
      await window.api.config.set('updateChannel', channel)
    } catch {
      // Error saving channel
    }
  }, [])

  const handleInstallUpdate = useCallback(async () => {
    try {
      await window.api.installUpdate()
    } catch {
      setUpdateError('Failed to install update')
    }
  }, [])

  return (
    <div className="max-w-xl">
      <Title level={4}>About Cherry Studio</Title>

      <Divider />

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Text strong>Version</Text>
          <Text>{appInfo?.version ?? 'Unknown'}</Text>
        </div>
        <div className="flex items-center justify-between mb-2">
          <Text strong>Platform</Text>
          <Text>{appInfo?.platform ?? 'Unknown'}</Text>
        </div>
        <div className="flex items-center justify-between mb-2">
          <Text strong>Architecture</Text>
          <Text>{appInfo?.arch ?? 'Unknown'}</Text>
        </div>
        <div className="flex items-center justify-between mb-2">
          <Text strong>Packaged</Text>
          <Text>{appInfo?.isPackaged ? 'Yes' : 'No'}</Text>
        </div>
      </div>

      <Divider />

      <Title level={5}>Updates</Title>

      <div className="flex items-center justify-between mb-4">
        <div>
          <Text strong>Update Channel</Text>
          <br />
          <Text type="secondary">Select which update channel to follow</Text>
        </div>
        <Select value={updateChannel} onChange={handleChannelChange} options={channelOptions} style={{ width: 180 }} />
      </div>

      <div className="mb-4">
        <Button type="primary" onClick={handleCheckUpdate} loading={checking}>
          Check for Updates
        </Button>
      </div>

      {updateAvailable && !updateDownloaded && !downloadProgress && (
        <Alert
          type="info"
          showIcon
          className="mb-4"
          message={`Update available: v${updateAvailable.version}`}
          description={
            <Space direction="vertical" size="small">
              {updateAvailable.releaseNotes && <Text type="secondary">{updateAvailable.releaseNotes}</Text>}
              <Text type="secondary">Released: {updateAvailable.releaseDate}</Text>
            </Space>
          }
        />
      )}

      {downloadProgress && (
        <div className="mb-4">
          <Text>Downloading update...</Text>
          <Progress percent={Math.round(downloadProgress.percent)} status="active" size="small" />
          <Text type="secondary">
            {formatBytes(downloadProgress.transferred)} / {formatBytes(downloadProgress.total)} (
            {formatBytes(downloadProgress.bytesPerSecond)}/s)
          </Text>
        </div>
      )}

      {updateDownloaded && (
        <Alert
          type="success"
          showIcon
          className="mb-4"
          message="Update downloaded and ready to install"
          description="The application will restart to apply the update."
          action={
            <Button type="primary" size="small" onClick={handleInstallUpdate}>
              Install and Restart
            </Button>
          }
        />
      )}

      {updateError && (
        <Alert
          type="error"
          showIcon
          closable
          className="mb-4"
          message="Update error"
          description={updateError}
          onClose={() => setUpdateError(null)}
        />
      )}

      <Divider />

      <Paragraph type="secondary">Cherry Studio is an open-source multi-LLM AI assistant desktop client.</Paragraph>

      <Space direction="vertical" size="small">
        <Text type="secondary">Built with Electron, React, and TypeScript.</Text>
      </Space>
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`
}
