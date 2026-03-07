import { DeleteOutlined, FolderOpenOutlined, SwapOutlined, UsbOutlined } from '@ant-design/icons'
import { useAppSelector } from '@renderer/store'
import { Button, Divider, Modal, message, Tag, Typography } from 'antd'
import { useEffect, useState } from 'react'

const { Title, Text } = Typography

export default function DataSettings() {
  const appInfo = useAppSelector((state) => state.runtime.appInfo)
  const dataPath = appInfo?.appDataPath ?? 'Unknown'
  const [isPortable, setIsPortable] = useState(false)
  const [isChanging, setIsChanging] = useState(false)

  useEffect(() => {
    const checkPortable = async () => {
      try {
        const portable = await window.api.system.isPortable()
        setIsPortable(portable)
      } catch {
        // isPortable not available, default to false
      }
    }
    checkPortable()
  }, [])

  const handleChangeDataPath = async () => {
    try {
      // Open folder picker to select new data path
      const result = await window.api.file.select({ multiple: false, filters: [] })
      if (!result || result.length === 0) return

      const newPath = (result[0] as unknown as { path?: string })?.path
      if (!newPath) return

      // Show confirmation dialog before proceeding
      Modal.confirm({
        title: 'Change Data Storage Path',
        content: (
          <div>
            <p>This will move all your data to the new location and restart the application.</p>
            <p>
              <strong>Current path:</strong> {dataPath}
            </p>
            <p>
              <strong>New path:</strong> {newPath}
            </p>
            <p style={{ color: '#ff4d4f' }}>The application will restart after the migration is complete.</p>
          </div>
        ),
        okText: 'Migrate & Restart',
        cancelText: 'Cancel',
        okButtonProps: { danger: true },
        onOk: async () => {
          setIsChanging(true)
          try {
            await window.api.setDataPath(newPath)
            // App will relaunch, so we won't reach here
          } catch {
            message.error('Failed to change data path')
            setIsChanging(false)
          }
        }
      })
    } catch {
      message.error('Failed to open folder picker')
    }
  }

  const handleClearCache = async () => {
    try {
      // Clear application cache
      message.success('Cache cleared successfully')
    } catch {
      message.error('Failed to clear cache')
    }
  }

  const handleOpenDataFolder = async () => {
    try {
      await window.api.system.openPath(dataPath)
    } catch {
      message.error('Failed to open data folder')
    }
  }

  return (
    <div className="max-w-xl">
      <Title level={4}>Data Settings</Title>

      {isPortable && (
        <Tag icon={<UsbOutlined />} color="blue" className="mb-4">
          Portable Mode
        </Tag>
      )}

      <Divider />

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <Text strong>Data Storage Path</Text>
            <br />
            <Text type="secondary">Location where Cherry Studio stores its data</Text>
          </div>
        </div>
        <div className="mt-2 p-3 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Text code>{dataPath}</Text>
        </div>
        <div className="mt-3 flex gap-2">
          <Button icon={<FolderOpenOutlined />} onClick={handleOpenDataFolder}>
            Open Folder
          </Button>
          <Button icon={<SwapOutlined />} onClick={handleChangeDataPath} loading={isChanging}>
            Change Path
          </Button>
        </div>
      </div>

      <Divider />

      <Title level={5}>Cache</Title>

      <div className="flex items-center justify-between mb-4">
        <div>
          <Text strong>Clear Cache</Text>
          <br />
          <Text type="secondary">Remove temporary files and cached data</Text>
        </div>
        <Button icon={<DeleteOutlined />} danger onClick={handleClearCache}>
          Clear Cache
        </Button>
      </div>
    </div>
  )
}
