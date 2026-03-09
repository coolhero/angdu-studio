import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { nanoid } from 'nanoid'
import { useProviderStore } from '@renderer/stores/useProviderStore'
import { SettingSection } from '@renderer/components/settings/SettingSection'
import { SettingItem } from '@renderer/components/settings/SettingItem'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Switch } from '@renderer/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@renderer/components/ui/dialog'
import { PROVIDER_DISPLAY_NAMES, DEFAULT_HOSTS } from '@renderer/aiCore/provider/constants'
import { getProviderConfig } from '@renderer/aiCore/provider/providerConfig'
import { checkProviderHealth } from '@renderer/aiCore/provider/factory'
import type { Provider, ProviderType } from '@renderer/types/provider'
import { Plus, Pencil, Trash2, Loader2, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react'

const PROVIDER_TYPES: ProviderType[] = [
  'openai',
  'anthropic',
  'gemini',
  'ollama',
  'mistral',
  'azure-openai',
  'openai-response',
  'vertexai',
  'aws-bedrock',
  'vertex-anthropic',
  'new-api',
  'gateway'
]

interface ProviderFormData {
  type: ProviderType
  name: string
  apiKey: string
  apiHost: string
}

export default function ProviderSettings(): JSX.Element {
  const { t } = useTranslation()

  const providers = useProviderStore((s) => s.providers)
  const addProvider = useProviderStore((s) => s.addProvider)
  const updateProvider = useProviderStore((s) => s.updateProvider)
  const removeProvider = useProviderStore((s) => s.removeProvider)
  const setEnabled = useProviderStore((s) => s.setEnabled)

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProviderFormData>({
    type: 'openai',
    name: '',
    apiKey: '',
    apiHost: ''
  })
  const [testing, setTesting] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<Record<string, 'success' | 'error'>>({})

  const sortedProviders = useMemo(
    () => [...providers].sort((a, b) => (a.isSystem === b.isSystem ? 0 : a.isSystem ? -1 : 1)),
    [providers]
  )

  const resetForm = useCallback((type: ProviderType = 'openai') => {
    const config = getProviderConfig(type)
    setFormData({
      type,
      name: PROVIDER_DISPLAY_NAMES[type],
      apiKey: '',
      apiHost: config.defaultHost
    })
  }, [])

  const handleTypeChange = useCallback(
    (type: ProviderType) => {
      const config = getProviderConfig(type)
      setFormData((prev) => ({
        ...prev,
        type,
        name: prev.name === PROVIDER_DISPLAY_NAMES[prev.type] ? PROVIDER_DISPLAY_NAMES[type] : prev.name,
        apiHost: DEFAULT_HOSTS[type] || prev.apiHost
      }))
    },
    []
  )

  const handleAdd = useCallback(() => {
    if (!formData.name.trim()) return
    const config = getProviderConfig(formData.type)
    if (config.requiresApiKey && !formData.apiKey.trim()) {
      toast.error(t('settings.provider.apiKeyRequired', 'API Key is required'))
      return
    }

    const provider: Provider = {
      id: nanoid(),
      type: formData.type,
      name: formData.name.trim(),
      apiKey: formData.apiKey.trim(),
      apiHost: formData.apiHost.trim() || DEFAULT_HOSTS[formData.type],
      models: [],
      enabled: true,
      isSystem: false
    }
    addProvider(provider)
    setAddDialogOpen(false)
    resetForm()
    toast.success(t('settings.provider.added', 'Provider added'))
  }, [formData, addProvider, resetForm, t])

  const handleEditSave = useCallback(() => {
    if (!editingId || !formData.name.trim()) return
    updateProvider(editingId, {
      name: formData.name.trim(),
      apiKey: formData.apiKey.trim(),
      apiHost: formData.apiHost.trim()
    })
    setEditingId(null)
    toast.success(t('settings.provider.updated', 'Provider updated'))
  }, [editingId, formData, updateProvider, t])

  const handleDelete = useCallback(
    (id: string) => {
      removeProvider(id)
      toast.success(t('settings.provider.deleted', 'Provider deleted'))
    },
    [removeProvider, t]
  )

  const handleTest = useCallback(
    async (provider: Provider) => {
      setTesting(provider.id)
      setTestResult((prev) => {
        const next = { ...prev }
        delete next[provider.id]
        return next
      })
      try {
        const result = await checkProviderHealth(provider)
        if (result.ok) {
          setTestResult((prev) => ({ ...prev, [provider.id]: 'success' }))
          // Auto-populate models from the API response
          if (result.models && result.models.length > 0) {
            const existingIds = new Set(provider.models.map((m) => m.id))
            let added = 0
            for (const modelId of result.models) {
              if (!existingIds.has(modelId)) {
                useProviderStore.getState().addModel(provider.id, {
                  id: modelId,
                  provider: provider.id,
                  name: modelId,
                  group: provider.name
                })
                added++
              }
            }
            toast.success(
              added > 0
                ? t('settings.provider.testSuccessModels', `Connection successful. ${added} models loaded.`)
                : t('settings.provider.testSuccess', 'Connection successful')
            )
          } else {
            toast.success(t('settings.provider.testSuccess', 'Connection successful'))
          }
        } else {
          setTestResult((prev) => ({ ...prev, [provider.id]: 'error' }))
          toast.error(result.error || t('settings.provider.testFailed', 'Connection failed'))
        }
      } catch {
        setTestResult((prev) => ({ ...prev, [provider.id]: 'error' }))
        toast.error(t('settings.provider.testFailed', 'Connection failed'))
      } finally {
        setTesting(null)
      }
    },
    [t]
  )

  const openEditDialog = useCallback(
    (provider: Provider) => {
      setFormData({
        type: provider.type,
        name: provider.name,
        apiKey: provider.apiKey,
        apiHost: provider.apiHost
      })
      setEditingId(provider.id)
    },
    []
  )

  return (
    <div className="space-y-4 p-6">
      {/* Provider List */}
      <SettingSection title={t('settings.provider.title', 'AI Providers')}>
        <div className="mb-3 flex justify-end">
          <Button
            size="sm"
            onClick={() => {
              resetForm()
              setAddDialogOpen(true)
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            {t('settings.provider.add', 'Add Provider')}
          </Button>
        </div>

        {sortedProviders.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">
            {t('settings.provider.empty', 'No providers configured. Add one to start chatting with AI.')}
          </p>
        ) : (
          <div className="space-y-2">
            {sortedProviders.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-700"
              >
                <div className="flex flex-1 items-center gap-3">
                  <Switch
                    checked={provider.enabled ?? true}
                    onCheckedChange={(checked) => setEnabled(provider.id, checked)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{provider.name}</span>
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        {PROVIDER_DISPLAY_NAMES[provider.type]}
                      </span>
                      {provider.isSystem && (
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          System
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-zinc-400">
                      {provider.apiHost || DEFAULT_HOSTS[provider.type] || 'No host configured'}
                      {provider.apiKey ? ' — API Key set' : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Test result indicator */}
                  {testResult[provider.id] === 'success' && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  {testResult[provider.id] === 'error' && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    disabled={testing === provider.id}
                    onClick={() => handleTest(provider)}
                  >
                    {testing === provider.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      t('settings.provider.test', 'Test')
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditDialog(provider)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  {!provider.isSystem && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(provider.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SettingSection>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('settings.provider.addTitle', 'Add AI Provider')}</DialogTitle>
            <DialogDescription>
              {t('settings.provider.addDesc', 'Configure a new AI provider with API credentials.')}
            </DialogDescription>
          </DialogHeader>
          <ProviderForm formData={formData} setFormData={setFormData} onTypeChange={handleTypeChange} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleAdd} disabled={!formData.name.trim()}>
              {t('settings.provider.add', 'Add Provider')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editingId !== null} onOpenChange={(open) => { if (!open) setEditingId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('settings.provider.editTitle', 'Edit Provider')}</DialogTitle>
            <DialogDescription>
              {t('settings.provider.editDesc', 'Update provider settings and API credentials.')}
            </DialogDescription>
          </DialogHeader>
          <ProviderForm formData={formData} setFormData={setFormData} onTypeChange={handleTypeChange} disableType />
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              disabled={testing === editingId}
              onClick={() => {
                if (!editingId) return
                const tempProvider: Provider = {
                  id: editingId,
                  type: formData.type,
                  name: formData.name,
                  apiKey: formData.apiKey,
                  apiHost: formData.apiHost,
                  models: [],
                  enabled: true,
                  isSystem: false
                }
                handleTest(tempProvider)
              }}
            >
              {testing === editingId ? (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : null}
              {t('settings.provider.test', 'Test')}
            </Button>
            <div className="flex-1" />
            <Button variant="outline" onClick={() => setEditingId(null)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleEditSave} disabled={!formData.name.trim()}>
              {t('common.save', 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ProviderForm({
  formData,
  setFormData,
  onTypeChange,
  disableType = false
}: {
  formData: ProviderFormData
  setFormData: React.Dispatch<React.SetStateAction<ProviderFormData>>
  onTypeChange: (type: ProviderType) => void
  disableType?: boolean
}): JSX.Element {
  const { t } = useTranslation()
  const config = getProviderConfig(formData.type)
  const [showApiKey, setShowApiKey] = useState(false)

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">{t('settings.provider.type', 'Provider Type')}</label>
        <select
          className="h-9 rounded-md border border-zinc-200 bg-transparent px-3 text-sm dark:border-zinc-700"
          value={formData.type}
          disabled={disableType}
          onChange={(e) => onTypeChange(e.target.value as ProviderType)}
        >
          {PROVIDER_TYPES.map((type) => (
            <option key={type} value={type}>
              {PROVIDER_DISPLAY_NAMES[type]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">{t('settings.provider.name', 'Display Name')}</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
        />
      </div>

      {config.requiresApiKey && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">{t('settings.provider.apiKey', 'API Key')}</label>
          <div className="relative">
            <Input
              type={showApiKey ? 'text' : 'password'}
              placeholder="sk-..."
              value={formData.apiKey}
              onChange={(e) => setFormData((prev) => ({ ...prev, apiKey: e.target.value }))}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              onClick={() => setShowApiKey((v) => !v)}
              tabIndex={-1}
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">{t('settings.provider.apiHost', 'API Host')}</label>
        <Input
          placeholder={DEFAULT_HOSTS[formData.type] || 'https://...'}
          value={formData.apiHost}
          onChange={(e) => setFormData((prev) => ({ ...prev, apiHost: e.target.value }))}
        />
      </div>
    </div>
  )
}
