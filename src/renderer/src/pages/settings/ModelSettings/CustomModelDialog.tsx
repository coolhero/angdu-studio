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
import { Checkbox } from '@renderer/components/ui/checkbox'
import { providerClient } from '@renderer/services/provider-client'
import { useProviderStore } from '@renderer/stores/useProviderStore'
import { ModelTypeSchema } from '@shared/types/provider'
import type { ModelType, ModelCapability } from '@shared/types/provider'

const CAPABILITY_OPTIONS = ModelTypeSchema.options

interface CustomModelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  providerId: string
}

export function CustomModelDialog({ open, onOpenChange, providerId }: CustomModelDialogProps) {
  const { t } = useTranslation()
  const { updateProvider } = useProviderStore()
  const [modelId, setModelId] = useState('')
  const [modelName, setModelName] = useState('')
  const [capabilities, setCapabilities] = useState<ModelType[]>(['text'])
  const [submitting, setSubmitting] = useState(false)

  const toggleCapability = (cap: ModelType) => {
    setCapabilities((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
    )
  }

  const handleSubmit = async () => {
    if (!modelId.trim()) return
    setSubmitting(true)
    try {
      const caps: ModelCapability[] = capabilities.map((c) => ({
        type: c,
        isUserSelected: true
      }))
      const model = await providerClient.addCustomModel(providerId, {
        id: modelId.trim(),
        name: modelName.trim() || modelId.trim(),
        group: 'Custom',
        capabilities: caps,
        endpoint_type: 'openai',
        enabled: true
      })
      // Update local store
      const store = useProviderStore.getState()
      const provider = store.providers.find((p) => p.id === providerId)
      if (provider) {
        updateProvider(providerId, {
          models: [...provider.models, model]
        })
      }
      onOpenChange(false)
      setModelId('')
      setModelName('')
      setCapabilities(['text'])
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('settings.models.addCustom', 'Add Custom Model')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label>{t('settings.models.modelId', 'Model ID')}</Label>
            <Input
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              placeholder="gpt-4o-custom"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t('settings.models.modelName', 'Display Name')}</Label>
            <Input
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="GPT-4o Custom"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t('settings.models.capabilities', 'Capabilities')}</Label>
            <div className="flex flex-wrap gap-3">
              {CAPABILITY_OPTIONS.map((cap) => (
                <label key={cap} className="flex items-center gap-1.5 text-sm">
                  <Checkbox
                    checked={capabilities.includes(cap)}
                    onCheckedChange={() => toggleCapability(cap)}
                  />
                  {cap}
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!modelId.trim() || submitting}>
            {t('settings.models.addButton', 'Add Model')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
