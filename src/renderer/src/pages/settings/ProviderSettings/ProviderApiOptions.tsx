import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Switch } from '@renderer/components/ui/switch'
import { Label } from '@renderer/components/ui/label'
import type { Provider, ProviderApiOptions as ApiOptions } from '@shared/types/provider'

const API_OPTION_FLAGS: { key: keyof ApiOptions; labelKey: string; defaultLabel: string }[] = [
  { key: 'isNotSupportArrayContent', labelKey: 'settings.provider.apiOptions.noArrayContent', defaultLabel: 'Disable array content' },
  { key: 'isNotSupportStreamOptions', labelKey: 'settings.provider.apiOptions.noStreamOptions', defaultLabel: 'Disable stream options' },
  { key: 'isSupportDeveloperRole', labelKey: 'settings.provider.apiOptions.developerRole', defaultLabel: 'Support developer role' },
  { key: 'isSupportServiceTier', labelKey: 'settings.provider.apiOptions.serviceTier', defaultLabel: 'Support service tier' },
  { key: 'isNotSupportEnableThinking', labelKey: 'settings.provider.apiOptions.noThinking', defaultLabel: 'Disable thinking mode' }
]

interface ProviderApiOptionsProps {
  provider: Provider
  onChange: (field: keyof Provider, value: unknown) => void
}

export function ProviderApiOptions({ provider, onChange }: ProviderApiOptionsProps) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const handleToggle = (key: keyof ApiOptions) => {
    const current = provider.apiOptions[key] ?? false
    onChange('apiOptions', { ...provider.apiOptions, [key]: !current })
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        {t('settings.provider.advancedOptions', 'Advanced API Options')}
      </button>
      {expanded && (
        <div className="ml-5 flex flex-col gap-3 rounded-md border border-border p-4">
          {API_OPTION_FLAGS.map(({ key, labelKey, defaultLabel }) => (
            <div key={key} className="flex items-center justify-between">
              <Label className="text-sm">{t(labelKey, defaultLabel)}</Label>
              <Switch
                checked={provider.apiOptions[key] ?? false}
                onCheckedChange={() => handleToggle(key)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
