import { useAppDispatch, useAppSelector } from '@renderer/store'
import {
  setLanguage,
  setLaunchAtLogin,
  setProxyConfig,
  setSendWithEnter,
  setTrayEnabled,
  setTrayOnClose,
  updateUserName
} from '@renderer/store/settings'
import type { ProxyConfig } from '@shared/types'
import { Button, Divider, Input, InputNumber, message, Radio, Select, Switch, Typography } from 'antd'
import { useState } from 'react'

const { Title, Text } = Typography

const languageOptions = [
  { value: 'en-US', label: 'English' },
  { value: 'zh-CN', label: 'Chinese (Simplified)' },
  { value: 'zh-TW', label: 'Chinese (Traditional)' },
  { value: 'ja-JP', label: 'Japanese' },
  { value: 'ko-KR', label: 'Korean' },
  { value: 'fr-FR', label: 'French' },
  { value: 'de-DE', label: 'German' },
  { value: 'es-ES', label: 'Spanish' },
  { value: 'ru-RU', label: 'Russian' }
]

const protocolOptions = [
  { value: 'http', label: 'HTTP' },
  { value: 'https', label: 'HTTPS' },
  { value: 'socks5', label: 'SOCKS5' }
]

export default function GeneralSettings() {
  const dispatch = useAppDispatch()
  const language = useAppSelector((state) => state.settings.language)
  const launchAtLogin = useAppSelector((state) => state.settings.launchAtLogin)
  const trayEnabled = useAppSelector((state) => state.settings.trayEnabled)
  const trayOnClose = useAppSelector((state) => state.settings.trayOnClose)
  const sendWithEnter = useAppSelector((state) => state.settings.sendWithEnter)
  const userName = useAppSelector((state) => state.settings.user.name)
  const proxyConfig = useAppSelector((state) => state.settings.proxyConfig)

  const [proxyForm, setProxyForm] = useState<ProxyConfig>(proxyConfig)

  const handleProxyModeChange = (mode: ProxyConfig['mode']) => {
    setProxyForm({ ...proxyForm, mode })
  }

  const handleSaveProxy = async () => {
    try {
      dispatch(setProxyConfig(proxyForm))
      await window.api.setProxy(proxyForm)
      message.success('Proxy settings saved')
    } catch {
      message.error('Failed to save proxy settings')
    }
  }

  return (
    <div className="max-w-xl">
      <Title level={4}>General Settings</Title>

      <Divider />

      <div className="flex items-center justify-between mb-4">
        <div>
          <Text strong>Language</Text>
          <br />
          <Text type="secondary">Select the display language</Text>
        </div>
        <Select
          value={language}
          onChange={(value) => dispatch(setLanguage(value))}
          options={languageOptions}
          style={{ width: 200 }}
        />
      </div>

      <Divider />

      <div className="flex items-center justify-between mb-4">
        <div>
          <Text strong>Launch at Login</Text>
          <br />
          <Text type="secondary">Start Cherry Studio when you log in</Text>
        </div>
        <Switch checked={launchAtLogin} onChange={(checked) => dispatch(setLaunchAtLogin(checked))} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <Text strong>Enable System Tray</Text>
          <br />
          <Text type="secondary">Show Cherry Studio in the system tray</Text>
        </div>
        <Switch checked={trayEnabled} onChange={(checked) => dispatch(setTrayEnabled(checked))} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <Text strong>Minimize to Tray on Close</Text>
          <br />
          <Text type="secondary">Minimize to tray instead of quitting when closing the window</Text>
        </div>
        <Switch
          checked={trayOnClose}
          onChange={(checked) => dispatch(setTrayOnClose(checked))}
          disabled={!trayEnabled}
        />
      </div>

      <Divider />

      <div className="flex items-center justify-between mb-4">
        <div>
          <Text strong>Send with Enter</Text>
          <br />
          <Text type="secondary">Press Enter to send messages (Shift+Enter for new line)</Text>
        </div>
        <Switch checked={sendWithEnter} onChange={(checked) => dispatch(setSendWithEnter(checked))} />
      </div>

      <Divider />

      <Title level={5}>User Profile</Title>

      <div className="flex items-center justify-between mb-4">
        <div>
          <Text strong>Display Name</Text>
          <br />
          <Text type="secondary">Your name shown in conversations</Text>
        </div>
        <Input
          value={userName}
          onChange={(e) => dispatch(updateUserName(e.target.value))}
          style={{ width: 200 }}
          placeholder="Enter your name"
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <Text strong>Avatar</Text>
          <br />
          <Text type="secondary">Your profile picture</Text>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
          <Text type="secondary">{userName.charAt(0).toUpperCase()}</Text>
        </div>
      </div>

      <Divider />

      <Title level={5}>Proxy Configuration</Title>

      <div className="mb-4">
        <Text strong>Proxy Mode</Text>
        <br />
        <Text type="secondary" className="mb-2 block">
          Configure how the app connects to the internet
        </Text>
        <Radio.Group value={proxyForm.mode} onChange={(e) => handleProxyModeChange(e.target.value)}>
          <Radio data-testid="proxy-mode-direct" value="direct">
            Direct
          </Radio>
          <Radio data-testid="proxy-mode-system" value="system">
            System
          </Radio>
          <Radio data-testid="proxy-mode-manual" value="manual">
            Manual
          </Radio>
        </Radio.Group>
      </div>

      {proxyForm.mode === 'manual' && (
        <div className="ml-4 mb-4 space-y-3">
          <div className="flex items-center gap-3">
            <Text style={{ width: 80 }}>Protocol</Text>
            <Select
              data-testid="proxy-protocol"
              value={proxyForm.protocol || 'http'}
              onChange={(value) => setProxyForm({ ...proxyForm, protocol: value })}
              options={protocolOptions}
              style={{ width: 120 }}
            />
          </div>

          <div className="flex items-center gap-3">
            <Text style={{ width: 80 }}>Host</Text>
            <Input
              data-testid="proxy-host"
              value={proxyForm.host || ''}
              onChange={(e) => setProxyForm({ ...proxyForm, host: e.target.value })}
              placeholder="e.g. 127.0.0.1"
              style={{ width: 200 }}
            />
          </div>

          <div className="flex items-center gap-3">
            <Text style={{ width: 80 }}>Port</Text>
            <InputNumber
              data-testid="proxy-port"
              value={proxyForm.port}
              onChange={(value) => setProxyForm({ ...proxyForm, port: value || undefined })}
              placeholder="e.g. 8080"
              min={1}
              max={65535}
              style={{ width: 120 }}
            />
          </div>

          <div className="flex items-center gap-3">
            <Text style={{ width: 80 }}>Username</Text>
            <Input
              data-testid="proxy-username"
              value={proxyForm.username || ''}
              onChange={(e) => setProxyForm({ ...proxyForm, username: e.target.value || undefined })}
              placeholder="Optional"
              style={{ width: 200 }}
            />
          </div>

          <div className="flex items-center gap-3">
            <Text style={{ width: 80 }}>Password</Text>
            <Input.Password
              data-testid="proxy-password"
              value={proxyForm.password || ''}
              onChange={(e) => setProxyForm({ ...proxyForm, password: e.target.value || undefined })}
              placeholder="Optional"
              style={{ width: 200 }}
            />
          </div>

          <div className="flex items-start gap-3">
            <Text style={{ width: 80, paddingTop: 4 }}>Bypass</Text>
            <Input.TextArea
              data-testid="proxy-bypass"
              value={proxyForm.bypass?.join('\n') || ''}
              onChange={(e) => {
                const bypass = e.target.value
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean)
                setProxyForm({ ...proxyForm, bypass: bypass.length > 0 ? bypass : undefined })
              }}
              placeholder="One rule per line, e.g. localhost, 127.0.0.1, *.local"
              rows={3}
              style={{ width: 200 }}
            />
          </div>
        </div>
      )}

      <Button data-testid="proxy-save" type="primary" onClick={handleSaveProxy}>
        Save Proxy Settings
      </Button>
    </div>
  )
}
