import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Input } from '@renderer/components/ui/input'
import { useModelStore, useSearchQuery } from '@renderer/stores/useModelStore'

export function ModelSearch() {
  const { t } = useTranslation()
  const searchQuery = useSearchQuery()
  const { setSearchQuery } = useModelStore()

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t('settings.models.searchPlaceholder', 'Search models...')}
        className="pl-9"
      />
    </div>
  )
}
