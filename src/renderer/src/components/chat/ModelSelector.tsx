import { useState, useMemo } from 'react'
import { ChevronDown, Search, Cpu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@renderer/components/ui/popover'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { useProviderStore } from '@renderer/stores/useProviderStore'
import { useAssistantStore } from '@renderer/stores/useAssistantStore'
import { useModelStore } from '@renderer/stores/useModelStore'
import type { Model, Provider } from '@shared/types/provider'
import { isChatCapableModel } from '@shared/types/provider'
import type { ModelReference } from '@shared/types/assistant'

interface ModelSelectorProps {
  compact?: boolean
}

export function ModelSelector({ compact }: ModelSelectorProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const providers = useProviderStore((s) => s.providers)
  const assistant = useAssistantStore((s) => s.getActiveAssistant())
  const currentModel = assistant.model

  // Get all enabled providers with their models, filtered for chat-capable
  const groupedModels = useMemo(() => {
    const groups: { provider: Provider; models: Model[] }[] = []
    for (const provider of providers) {
      if (!provider.enabled) continue
      const chatModels = provider.models.filter(
        (m) =>
          m.enabled &&
          isChatCapableModel(m.id) &&
          m.endpoint_type !== 'image-generation' &&
          m.endpoint_type !== 'jina-rerank'
      )
      if (chatModels.length === 0) continue

      const filtered = search
        ? chatModels.filter(
            (m) =>
              m.name.toLowerCase().includes(search.toLowerCase()) ||
              m.id.toLowerCase().includes(search.toLowerCase())
          )
        : chatModels

      if (filtered.length > 0) {
        groups.push({ provider, models: filtered })
      }
    }
    return groups
  }, [providers, search])

  const handleSelect = async (provider: Provider, model: Model) => {
    const ref: ModelReference = {
      providerId: provider.id,
      modelId: model.id,
      displayName: model.name
    }

    // Update assistant's model binding
    await useAssistantStore.getState().updateAssistant(assistant.id, { model: ref })

    // Also track in model store for per-assistant model memory
    useModelStore.getState().setActiveModel(assistant.id, model.id)

    setOpen(false)
    setSearch('')
  }

  // Find current model display info
  const currentProvider = currentModel
    ? providers.find((p) => p.id === currentModel.providerId)
    : null
  const currentModelObj = currentProvider?.models.find(
    (m) => m.id === currentModel?.modelId
  )
  const displayName =
    currentModel?.displayName ?? currentModelObj?.name ?? currentModel?.modelId

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Cpu className="h-3 w-3" />
          {currentModel ? (
            <span className="max-w-[180px] truncate">
              {displayName}
            </span>
          ) : (
            <span className="text-destructive">
              {t('chat.selectModel', '모델 선택')}
            </span>
          )}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="border-b p-2">
          <div className="relative">
            <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('chat.searchModel', '모델 검색...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-sm"
              autoFocus
            />
          </div>
        </div>
        <ScrollArea className="max-h-[400px]">
          {groupedModels.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {providers.filter((p) => p.enabled).length === 0
                ? t('chat.noProviders', '활성화된 프로바이더가 없습니다. Settings에서 추가하세요.')
                : t('chat.noModels', '모델을 찾을 수 없습니다.')}
            </div>
          ) : (
            groupedModels.map(({ provider, models }) => (
              <div key={provider.id}>
                <div className="sticky top-0 z-10 bg-muted/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground backdrop-blur-sm">
                  {provider.name}
                </div>
                {models.map((model) => {
                  const isActive =
                    currentModel?.providerId === provider.id &&
                    currentModel?.modelId === model.id
                  return (
                    <button
                      key={`${provider.id}-${model.id}`}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                        isActive ? 'bg-accent text-accent-foreground' : ''
                      }`}
                      onClick={() => handleSelect(provider, model)}
                    >
                      <Cpu className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate">{model.name}</span>
                      {isActive && (
                        <span className="shrink-0 text-xs text-primary">✓</span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
