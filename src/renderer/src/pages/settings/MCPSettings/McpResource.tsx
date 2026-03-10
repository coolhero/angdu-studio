import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { Badge } from '@renderer/components/ui/badge'
import type { MCPResource } from '@renderer/types/mcp'

interface MCPResourcesSectionProps {
  resources: MCPResource[]
}

function formatFileSize(size?: number): string {
  if (size === undefined) return 'Unknown'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let s = size
  let idx = 0
  while (s >= 1024 && idx < units.length - 1) {
    s /= 1024
    idx++
  }
  return `${s.toFixed(idx > 0 ? 1 : 0)} ${units[idx]}`
}

function ResourceRow({ resource }: { resource: MCPResource }): JSX.Element {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const hasDetails = !!(resource.mimeType || resource.size !== undefined || resource.text)

  return (
    <div className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800">
      <button
        type="button"
        onClick={() => hasDetails && setExpanded(!expanded)}
        className={cn(
          'flex w-full items-center gap-3 px-3 py-2.5 text-left',
          hasDetails && 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
        )}
      >
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform',
            !hasDetails && 'invisible',
            expanded && 'rotate-180',
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{resource.name}</span>
            {resource.mimeType && (
              <Badge variant="secondary" className="text-[10px]">
                {resource.mimeType}
              </Badge>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">{resource.uri}</p>
          {resource.description && (
            <p className="mt-0.5 truncate text-xs text-zinc-400 dark:text-zinc-500">{resource.description}</p>
          )}
        </div>
      </button>

      {expanded && hasDetails && (
        <div className="space-y-2 border-t border-zinc-100 bg-zinc-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
          {resource.mimeType && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-zinc-600 dark:text-zinc-300">
                {t('settings.mcp.resources.mimeType', 'MIME Type')}:
              </span>
              <Badge variant="secondary">{resource.mimeType}</Badge>
            </div>
          )}
          {resource.size !== undefined && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-zinc-600 dark:text-zinc-300">
                {t('settings.mcp.resources.size', 'Size')}:
              </span>
              <span className="text-zinc-500 dark:text-zinc-400">{formatFileSize(resource.size)}</span>
            </div>
          )}
          {resource.text && (
            <div className="text-xs">
              <span className="font-medium text-zinc-600 dark:text-zinc-300">
                {t('settings.mcp.resources.text', 'Text')}:
              </span>
              <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-zinc-100 p-2 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {resource.text}
              </pre>
            </div>
          )}
          {resource.blob && (
            <div className="text-xs text-zinc-400">
              {t('settings.mcp.resources.blobInvisible', 'Binary data cannot be displayed.')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function MCPResourcesSection({ resources }: MCPResourcesSectionProps): JSX.Element {
  const { t } = useTranslation()

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-sm text-zinc-400">
        {t('settings.mcp.resources.noResourcesAvailable', 'No resources available')}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="border-b border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/50">
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          {t('settings.mcp.resources.availableResources', 'Available Resources')} ({resources.length})
        </span>
      </div>
      {resources.map((resource) => (
        <ResourceRow key={resource.uri} resource={resource} />
      ))}
    </div>
  )
}
