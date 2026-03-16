import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { useProviderStore } from '@renderer/stores/useProviderStore'
import { providerClient } from '@renderer/services/provider-client'
import { ProviderTypeSchema, NO_API_KEY_PROVIDERS } from '@shared/types/provider'
import type { ProviderType } from '@shared/types/provider'

const PROVIDER_TYPES = ProviderTypeSchema.options

interface ProviderAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProviderAddDialog({ open, onOpenChange }: ProviderAddDialogProps) {
  const { t } = useTranslation()
  const { addProvider } = useProviderStore()
  const [type, setType] = useState<ProviderType>('openai')
  const [name, setName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [apiHost, setApiHost] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const requiresKey = !NO_API_KEY_PROVIDERS.includes(type)

  const handleSubmit = async () => {
    if (!name.trim()) return
    setSubmitting(true)
    try {
      const provider = await providerClient.add({
        type,
        name: name.trim(),
        apiKey: apiKey.trim(),
        apiHost: apiHost.trim(),
        enabled: true,
        isSystem: false,
        apiOptions: {},
        extra_headers: {},
        notes: '',
        authType: 'apiKey'
      })
      addProvider(provider)
      onOpenChange(false)
      resetForm()
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setType('openai')
    setName('')
    setApiKey('')
    setApiHost('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('settings.provider.addTitle', 'Add Provider')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label>{t('settings.provider.type', 'Provider Type')}</Label>
            <Select value={type} onValueChange={(v) => setType(v as ProviderType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDER_TYPES.map((pt) => (
                  <SelectItem key={pt} value={pt}>
                    {pt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t('settings.provider.name', 'Name')}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My OpenAI"
            />
          </div>
          {requiresKey && (
            <div className="flex flex-col gap-2">
              <Label>{t('settings.provider.apiKey', 'API Key')}</Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label>{t('settings.provider.endpoint', 'Endpoint URL')}</Label>
            <Input
              value={apiHost}
              onChange={(e) => setApiHost(e.target.value)}
              placeholder="https://api.openai.com"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || submitting}>
            {t('settings.provider.addButton', 'Add Provider')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
