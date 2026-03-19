import { useState, useMemo, useCallback } from 'react'
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
import { Slider } from '@renderer/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { useProviderStore } from '@renderer/stores/useProviderStore'
import { useKnowledgeStore } from '@renderer/stores/useKnowledgeStore'
import { KNOWLEDGE_DEFAULTS } from '@shared/types/knowledge'
import type { Model } from '@shared/types/provider'

interface AddKBPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Default dimensions by common embedding model families. */
const DIMENSION_MAP: Record<string, number> = {
  'text-embedding-3-small': 1536,
  'text-embedding-3-large': 3072,
  'text-embedding-ada-002': 1536,
  'embedding-001': 768,
  'embedding-gecko': 768
}

function guessDimensions(modelId: string): number {
  for (const [pattern, dims] of Object.entries(DIMENSION_MAP)) {
    if (modelId.includes(pattern)) return dims
  }
  return 1536 // safe default
}

export function AddKBPopup({ open, onOpenChange }: AddKBPopupProps) {
  const { t } = useTranslation()
  const providers = useProviderStore((s) => s.providers)

  const [name, setName] = useState('')
  const [selectedModelKey, setSelectedModelKey] = useState('')
  const [dimensions, setDimensions] = useState(1536)
  const [documentCount, setDocumentCount] = useState(KNOWLEDGE_DEFAULTS.documentCount)
  const [submitting, setSubmitting] = useState(false)

  // Gather all embedding-capable models from enabled providers
  const embeddingModels = useMemo(() => {
    const models: Array<Model & { providerName: string }> = []
    for (const provider of providers) {
      if (!provider.enabled) continue
      for (const model of provider.models) {
        const isEmbedding =
          model.capabilities.some((c) => c.type === 'embedding') ||
          /embedding/i.test(model.id)
        if (isEmbedding && model.enabled) {
          models.push({ ...model, providerName: provider.name })
        }
      }
    }
    return models
  }, [providers])

  const handleModelChange = useCallback(
    (key: string) => {
      setSelectedModelKey(key)
      const model = embeddingModels.find(
        (m) => `${m.provider}::${m.id}` === key
      )
      if (model) {
        setDimensions(guessDimensions(model.id))
      }
    },
    [embeddingModels]
  )

  const handleSubmit = useCallback(async () => {
    if (!name.trim() || !selectedModelKey) return

    const model = embeddingModels.find(
      (m) => `${m.provider}::${m.id}` === selectedModelKey
    )
    if (!model) return

    setSubmitting(true)
    try {
      const kb = await window.api.invoke['kb:create']({
        name: name.trim(),
        model: {
          id: model.id,
          provider: model.provider,
          name: model.name,
          group: model.group,
          capabilities: model.capabilities,
          endpoint_type: model.endpoint_type,
          enabled: model.enabled
        },
        dimensions,
        documentCount
      })
      useKnowledgeStore.getState().addBase(kb)
      onOpenChange(false)
      // Reset form
      setName('')
      setSelectedModelKey('')
      setDimensions(1536)
      setDocumentCount(KNOWLEDGE_DEFAULTS.documentCount)
    } catch (err) {
      console.error('[AddKBPopup] Failed to create KB:', err)
    } finally {
      setSubmitting(false)
    }
  }, [name, selectedModelKey, embeddingModels, dimensions, documentCount, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('knowledge.createKB', 'Create Knowledge Base')}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="kb-name">{t('knowledge.name', 'Name')}</Label>
            <Input
              id="kb-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('knowledge.namePlaceholder', 'My Knowledge Base')}
              autoFocus
            />
          </div>

          {/* Embedding Model */}
          <div className="grid gap-2">
            <Label>{t('knowledge.embeddingModel', 'Embedding Model')}</Label>
            <Select value={selectedModelKey} onValueChange={handleModelChange}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t('knowledge.selectModel', 'Select a model')}
                />
              </SelectTrigger>
              <SelectContent>
                {embeddingModels.map((m) => {
                  const key = `${m.provider}::${m.id}`
                  return (
                    <SelectItem key={key} value={key}>
                      {m.name} ({m.providerName})
                    </SelectItem>
                  )
                })}
                {embeddingModels.length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    {t('knowledge.noEmbeddingModels', 'No embedding models available. Enable a provider with embedding models first.')}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Dimensions */}
          <div className="grid gap-2">
            <Label htmlFor="kb-dimensions">
              {t('knowledge.dimensions', 'Dimensions')}
            </Label>
            <Input
              id="kb-dimensions"
              type="number"
              value={dimensions}
              onChange={(e) => setDimensions(Number(e.target.value))}
              min={1}
              max={10000}
            />
          </div>

          {/* Document Count */}
          <div className="grid gap-2">
            <Label>
              {t('knowledge.documentCount', 'Documents per query')}: {documentCount}
            </Label>
            <Slider
              value={[documentCount]}
              onValueChange={([v]) => setDocumentCount(v)}
              min={1}
              max={50}
              step={1}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !selectedModelKey || submitting}
          >
            {submitting
              ? t('common.creating', 'Creating...')
              : t('common.create', 'Create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
