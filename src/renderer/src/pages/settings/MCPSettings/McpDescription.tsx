import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { ExternalLink, Globe } from 'lucide-react'
import { Badge } from '@renderer/components/ui/badge'
import type { MCPServer } from '@renderer/types/mcp'

interface McpDescriptionProps {
  server: MCPServer
}

function McpDescription({ server }: McpDescriptionProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="space-y-4 py-2">
      {/* Description */}
      {server.description && (
        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
            {t('settings.mcp.description', 'Description')}
          </h4>
          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {server.description}
          </p>
        </div>
      )}

      {/* Provider info */}
      {(server.provider || server.providerUrl || server.logoUrl) && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
            {t('settings.mcp.provider', 'Provider')}
          </h4>
          <div className="flex items-center gap-3">
            {server.logoUrl && (
              <img
                src={server.logoUrl}
                alt={server.provider || 'Provider'}
                className="h-8 w-8 rounded object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            )}
            <div className="min-w-0 flex-1">
              {server.provider && (
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{server.provider}</span>
              )}
              {server.providerUrl && (
                <button
                  type="button"
                  onClick={() => window.api.shell.openExternal(server.providerUrl!)}
                  className="mt-0.5 flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                >
                  <Globe className="h-3 w-3" />
                  <span className="truncate">{server.providerUrl}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tags */}
      {server.tags && server.tags.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
            {t('settings.mcp.tags', 'Tags')}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {server.tags.filter((tag): tag is string => typeof tag === 'string').map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
          {t('settings.mcp.metadata', 'Metadata')}
        </h4>
        <dl className="space-y-1 text-xs">
          <div className="flex gap-2">
            <dt className="font-medium text-zinc-600 dark:text-zinc-400">ID:</dt>
            <dd className="select-all text-zinc-500 dark:text-zinc-400">{server.id}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-zinc-600 dark:text-zinc-400">
              {t('settings.mcp.type', 'Type')}:
            </dt>
            <dd className="text-zinc-500 dark:text-zinc-400">{server.type || 'stdio'}</dd>
          </div>
          {server.installedAt && (
            <div className="flex gap-2">
              <dt className="font-medium text-zinc-600 dark:text-zinc-400">
                {t('settings.mcp.installedAt', 'Installed')}:
              </dt>
              <dd className="text-zinc-500 dark:text-zinc-400">
                {new Date(server.installedAt).toLocaleDateString()}
              </dd>
            </div>
          )}
          {server.dxtVersion && (
            <div className="flex gap-2">
              <dt className="font-medium text-zinc-600 dark:text-zinc-400">DXT:</dt>
              <dd className="text-zinc-500 dark:text-zinc-400">{server.dxtVersion}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}

export default memo(McpDescription)
