import { cn } from '@renderer/lib/utils'
import { Switch } from '@renderer/components/ui/switch'
import { Badge } from '@renderer/components/ui/badge'
import type { MCPServer } from '@renderer/types/mcp'

interface McpServerCardProps {
  server: MCPServer
  isSelected: boolean
  isLoading: boolean
  onToggle: (active: boolean) => void
  onSelect: () => void
  onDelete: () => void // reserved for drag-handle or context menu
}

function statusDot(server: MCPServer, isLoading: boolean): string {
  if (isLoading) return 'bg-yellow-400 animate-pulse'
  if (server.isActive) return 'bg-green-500'
  return 'bg-zinc-300 dark:bg-zinc-600'
}

function typeLabel(type?: string): string {
  switch (type) {
    case 'sse':
      return 'SSE'
    case 'streamableHttp':
      return 'HTTP'
    case 'inMemory':
      return 'Built-in'
    default:
      return 'stdio'
  }
}

export default function McpServerCard({
  server,
  isSelected,
  isLoading,
  onToggle,
  onSelect,
  onDelete: _onDelete,
}: McpServerCardProps): JSX.Element {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'group cursor-pointer rounded-lg border p-3 transition-colors',
        isSelected
          ? 'border-blue-500/50 bg-blue-50/50 dark:border-blue-500/30 dark:bg-blue-950/20'
          : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600',
        !server.isActive && 'opacity-60 hover:opacity-80',
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-2">
        {/* Status dot */}
        <span className={cn('h-2 w-2 shrink-0 rounded-full', statusDot(server, isLoading))} />

        {/* Logo */}
        {server.logoUrl && (
          <img
            src={server.logoUrl}
            alt=""
            className="h-5 w-5 shrink-0 rounded object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        )}

        {/* Name */}
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {server.name}
        </span>

        {/* Actions */}
        <div
          className="flex shrink-0 items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Switch
            checked={server.isActive}
            onCheckedChange={onToggle}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Description */}
      {server.description && (
        <p className="mt-1.5 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
          {server.description}
        </p>
      )}

      {/* Footer tags */}
      <div className="mt-2 flex items-center gap-1.5">
        <Badge variant="outline" className="text-[10px]">
          {typeLabel(server.type)}
        </Badge>
        {server.provider && (
          <Badge variant="secondary" className="text-[10px]">
            {server.provider}
          </Badge>
        )}
      </div>
    </div>
  )
}
