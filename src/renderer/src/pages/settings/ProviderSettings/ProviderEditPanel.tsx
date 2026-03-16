import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { Textarea } from '@renderer/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@renderer/components/ui/alert-dialog'
import { useProviderStore } from '@renderer/stores/useProviderStore'
import { providerClient } from '@renderer/services/provider-client'
import type { Provider } from '@shared/types/provider'
import { NO_API_KEY_PROVIDERS } from '@shared/types/provider'
import type { ConnectionTestResult } from '@shared/types/ai-core'
import { ProviderApiOptions } from './ProviderApiOptions'

interface ProviderEditPanelProps {
  provider: Provider
}

export function ProviderEditPanel({ provider }: ProviderEditPanelProps) {
  const { t } = useTranslation()
  const { updateProvider, removeProvider } = useProviderStore()
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null)

  const requiresKey = !NO_API_KEY_PROVIDERS.includes(provider.type)

  const handleFieldChange = useCallback(
    async (field: keyof Provider, value: unknown) => {
      updateProvider(provider.id, { [field]: value })
      await providerClient.update(provider.id, { [field]: value })
    },
    [provider.id, updateProvider]
  )

  const handleTestConnection = useCallback(async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const result = await providerClient.testConnection(provider.id)
      setTestResult(result)
      if (result.success) {
        updateProvider(provider.id, { isAuthed: true })
      }
    } finally {
      setTesting(false)
    }
  }, [provider.id, updateProvider])

  const handleDelete = useCallback(async () => {
    try {
      await providerClient.delete(provider.id)
      removeProvider(provider.id)
    } catch (err) {
      // TODO: show error toast if provider is in use
      console.error('Failed to delete provider:', err)
    }
  }, [provider.id, removeProvider])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{provider.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{provider.type}</span>
          {!provider.isSystem && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t('settings.provider.deleteTitle', 'Delete Provider')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t(
                      'settings.provider.deleteDesc',
                      'Are you sure? This will remove the provider and its configuration.'
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    {t('common.delete', 'Delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* API Key */}
      {requiresKey && (
        <div className="flex flex-col gap-2">
          <Label>{t('settings.provider.apiKey', 'API Key')}</Label>
          <div className="flex gap-2">
            <Input
              key={`apikey-${provider.id}-${provider.apiKey}`}
              type={showKey ? 'text' : 'password'}
              defaultValue={provider.apiKey}
              onBlur={(e) => {
                const val = e.target.value.trim()
                if (val && val !== provider.apiKey && val !== '***') {
                  handleFieldChange('apiKey', val)
                }
              }}
              placeholder="sk-..."
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Endpoint URL */}
      <div className="flex flex-col gap-2">
        <Label>{t('settings.provider.endpoint', 'Endpoint URL')}</Label>
        <Input
          defaultValue={provider.apiHost}
          onBlur={(e) => {
            const val = e.target.value.trim().replace(/\/+$/, '')
            if (val !== provider.apiHost) {
              handleFieldChange('apiHost', val)
            }
          }}
          placeholder="https://api.openai.com"
        />
      </div>

      {/* Connection Test */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleTestConnection}
          disabled={testing}
        >
          {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('settings.provider.testConnection', 'Test Connection')}
        </Button>
        {testResult && (
          <span className="flex items-center gap-1 text-sm">
            {testResult.success ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-600">
                  {t('settings.provider.testSuccess', 'Connected')}
                  {testResult.latency && ` (${testResult.latency}ms)`}
                </span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-600">{testResult.error}</span>
              </>
            )}
          </span>
        )}
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-2">
        <Label>{t('settings.provider.notes', 'Notes')}</Label>
        <Textarea
          defaultValue={provider.notes}
          onBlur={(e) => {
            if (e.target.value !== provider.notes) {
              handleFieldChange('notes', e.target.value)
            }
          }}
          placeholder={t('settings.provider.notesPlaceholder', 'Personal notes about this provider...')}
          rows={2}
        />
      </div>

      {/* Advanced API Options */}
      <ProviderApiOptions provider={provider} onChange={handleFieldChange} />
    </div>
  )
}
