import { useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Switch } from '@renderer/components/ui/switch'
import { Badge } from '@renderer/components/ui/badge'
import { Skeleton } from '@renderer/components/ui/skeleton'
import { useProviders } from '@renderer/stores/useProviderStore'
import { useModelStore, useSearchQuery, useIsFetching } from '@renderer/stores/useModelStore'
import { providerClient } from '@renderer/services/provider-client'
import type { Provider, Model } from '@shared/types/provider'
import { useProviderStore } from '@renderer/stores/useProviderStore'
import { ModelSearch } from './ModelSearch'

export function ModelList() {
  const { t } = useTranslation()
  const providers = useProviders()
  const searchQuery = useSearchQuery()

  const enabledProviders = useMemo(
    () => providers.filter((p) => p.enabled),
    [providers]
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {t('settings.models.title', 'Models')}
        </h3>
      </div>
      <ModelSearch />
      <div className="flex flex-col gap-6">
        {enabledProviders.map((provider) => (
          <ProviderModelGroup
            key={provider.id}
            provider={provider}
            searchQuery={searchQuery}
          />
        ))}
        {enabledProviders.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {t('settings.models.noProviders', 'Enable a provider to see its models.')}
          </p>
        )}
      </div>
    </div>
  )
}

function ProviderModelGroup({
  provider,
  searchQuery
}: {
  provider: Provider
  searchQuery: string
}) {
  const { t } = useTranslation()
  const fetching = useIsFetching(provider.id)
  const { setFetching } = useModelStore()
  const { updateProvider } = useProviderStore()

  const filteredModels = useMemo(() => {
    const q = searchQuery.toLowerCase()
    if (!q) return provider.models
    return provider.models.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.group.toLowerCase().includes(q)
    )
  }, [provider.models, searchQuery])

  const handleRefresh = useCallback(async () => {
    setFetching(provider.id, true)
    try {
      const result = await providerClient.fetchModels(provider.id)
      updateProvider(provider.id, { models: result.models })
    } finally {
      setFetching(provider.id, false)
    }
  }, [provider.id, setFetching, updateProvider])

  const handleToggleModel = useCallback(
    (modelId: string) => {
      const updatedModels = provider.models.map((m) =>
        m.id === modelId ? { ...m, enabled: !m.enabled } : m
      )
      updateProvider(provider.id, { models: updatedModels })
      providerClient.update(provider.id, { models: updatedModels })
    },
    [provider.id, provider.models, updateProvider]
  )

  const allEnabled = provider.models.length > 0 && provider.models.every((m) => m.enabled)
  const handleToggleAll = useCallback(() => {
    const newEnabled = !allEnabled
    const updatedModels = provider.models.map((m) => ({ ...m, enabled: newEnabled }))
    updateProvider(provider.id, { models: updatedModels })
    providerClient.update(provider.id, { models: updatedModels })
  }, [provider.id, provider.models, allEnabled, updateProvider])

  useEffect(() => {
    if (provider.enabled && provider.models.length === 0 && !fetching) {
      handleRefresh()
    }
  }, [provider.enabled, provider.models.length, fetching, handleRefresh])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-foreground">{provider.name}</h4>
          {provider.models.length > 0 && (
            <button
              onClick={handleToggleAll}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {allEnabled
                ? t('settings.models.deselectAll', 'Deselect all')
                : t('settings.models.selectAll', 'Select all')}
            </button>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={fetching}
        >
          <RefreshCw className={`h-3 w-3 ${fetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      {fetching && provider.models.length === 0 ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {filteredModels.map((model) => (
            <ModelItem
              key={model.id}
              model={model}
              onToggle={() => handleToggleModel(model.id)}
            />
          ))}
          {filteredModels.length === 0 && provider.models.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {t('settings.models.noMatch', 'No models match the search.')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function ModelItem({ model, onToggle }: { model: Model; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted/50">
      <div className="flex-1 truncate">
        <span className="text-sm text-foreground">{model.name || model.id}</span>
      </div>
      <div className="flex items-center gap-1">
        {model.capabilities.map((cap) => (
          <Badge key={cap.type} variant="secondary" className="text-[10px] px-1 py-0">
            {cap.type}
          </Badge>
        ))}
      </div>
      {model.pricing && (
        <span className="text-[10px] text-muted-foreground">
          {model.pricing.currencySymbol ?? '$'}{model.pricing.input_per_million_tokens}/M
        </span>
      )}
      <Switch checked={model.enabled} onCheckedChange={onToggle} />
    </div>
  )
}
