import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Switch } from '@renderer/components/ui/switch'
import { Button } from '@renderer/components/ui/button'
import { cn } from '@renderer/lib/utils'
import { useProviderStore, useProviders, useSelectedProviderId } from '@renderer/stores/useProviderStore'
import { providerClient } from '@renderer/services/provider-client'
import type { Provider } from '@shared/types/provider'
import { ProviderAddDialog } from './ProviderAddDialog'
import { ProviderEditPanel } from './ProviderEditPanel'

export function ProviderList() {
  const { t } = useTranslation()
  const providers = useProviders()
  const selectedId = useSelectedProviderId()
  const { setProviders, setSelectedProviderId, toggleEnabled, updateProvider } = useProviderStore()
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  useEffect(() => {
    providerClient.list().then(setProviders)
  }, [setProviders])

  const handleToggle = useCallback(
    async (id: string) => {
      toggleEnabled(id)
      const provider = useProviderStore.getState().providers.find((p) => p.id === id)
      if (provider) {
        await providerClient.update(id, { enabled: provider.enabled })
      }
    },
    [toggleEnabled]
  )

  const selectedProvider = providers.find((p) => p.id === selectedId)

  return (
    <div className="flex h-full gap-6">
      {/* Provider List */}
      <div className="flex w-72 shrink-0 flex-col">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            {t('settings.provider.title', 'Model Providers')}
          </h3>
          <Button variant="outline" size="sm" onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            {t('settings.provider.add', 'Add')}
          </Button>
        </div>
        <div className="flex flex-col gap-1 overflow-auto">
          {providers.map((provider) => (
            <ProviderItem
              key={provider.id}
              provider={provider}
              isSelected={provider.id === selectedId}
              onSelect={() => setSelectedProviderId(provider.id)}
              onToggle={() => handleToggle(provider.id)}
            />
          ))}
        </div>
      </div>

      {/* Edit Panel */}
      <div className="flex-1 overflow-auto">
        {selectedProvider ? (
          <ProviderEditPanel provider={selectedProvider} />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            {t('settings.provider.selectPrompt', 'Select a provider to configure')}
          </div>
        )}
      </div>

      <ProviderAddDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  )
}

function ProviderItem({
  provider,
  isSelected,
  onSelect,
  onToggle
}: {
  provider: Provider
  isSelected: boolean
  onSelect: () => void
  onToggle: () => void
}) {
  return (
    <div
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 transition-colors',
        isSelected ? 'bg-muted' : 'hover:bg-muted/50'
      )}
      onClick={onSelect}
    >
      <div className="flex-1 truncate">
        <span className="text-sm font-medium text-foreground">{provider.name}</span>
        <span className="ml-2 text-xs text-muted-foreground">{provider.type}</span>
      </div>
      <Switch
        checked={provider.enabled}
        onCheckedChange={(e) => {
          e && onToggle()
          !e && onToggle()
        }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}
