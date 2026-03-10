import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Info, Zap, ChevronDown } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { Switch } from '@renderer/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@renderer/components/ui/tooltip'
import type { MCPServer, MCPTool } from '@renderer/types/mcp'

interface MCPToolsSectionProps {
  tools: MCPTool[]
  server: MCPServer
  onToggleTool: (tool: MCPTool, enabled: boolean) => void
  onToggleAutoApprove: (tool: MCPTool, autoApprove: boolean) => void
}

function isToolEnabled(tool: MCPTool, server: MCPServer): boolean {
  return !server.disabledTools?.includes(tool.name)
}

function isToolAutoApproved(tool: MCPTool, server: MCPServer): boolean {
  return !server.disabledAutoApproveTools?.includes(tool.name)
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'string':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'number':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'boolean':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'object':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    case 'array':
      return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
    default:
      return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
  }
}

function SchemaProperties({
  properties,
  required,
  depth = 0,
}: {
  properties: Record<string, Record<string, unknown>>
  required?: string[]
  depth?: number
}): JSX.Element {
  if (depth > 5) return <></>

  return (
    <div className="mt-2 space-y-1 border-l-2 border-zinc-200 pl-3 dark:border-zinc-700">
      {Object.entries(properties).map(([key, prop]) => {
        const propType =
          prop.type === 'array' && (prop.items as Record<string, unknown>)?.type
            ? `${(prop.items as Record<string, unknown>).type}[]`
            : (prop.type as string)

        return (
          <div key={key} className="py-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{key}</span>
              {required?.includes(key) && <span className="text-xs text-red-500">*</span>}
              {propType && (
                <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', getTypeColor(prop.type as string))}>
                  {propType}
                </span>
              )}
            </div>
            {prop.description && (
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{prop.description as string}</p>
            )}
            {prop.enum && (
              <div className="mt-1 flex flex-wrap gap-1">
                {(prop.enum as string[]).map((v, i) => (
                  <span key={i} className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] dark:bg-zinc-800">
                    {String(v)}
                  </span>
                ))}
              </div>
            )}
            {prop.type === 'object' && prop.properties && (
              <SchemaProperties
                properties={prop.properties as Record<string, Record<string, unknown>>}
                required={prop.required as string[] | undefined}
                depth={depth + 1}
              />
            )}
            {prop.type === 'array' &&
              (prop.items as Record<string, unknown>)?.type === 'object' &&
              (prop.items as Record<string, unknown>)?.properties && (
                <SchemaProperties
                  properties={(prop.items as Record<string, unknown>).properties as Record<string, Record<string, unknown>>}
                  required={(prop.items as Record<string, unknown>).required as string[] | undefined}
                  depth={depth + 1}
                />
              )}
          </div>
        )
      })}
    </div>
  )
}

function ToolRow({
  tool,
  server,
  onToggleTool,
  onToggleAutoApprove,
}: {
  tool: MCPTool
  server: MCPServer
  onToggleTool: (tool: MCPTool, enabled: boolean) => void
  onToggleAutoApprove: (tool: MCPTool, autoApprove: boolean) => void
}): JSX.Element {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const enabled = isToolEnabled(tool, server)
  const autoApproved = isToolAutoApproved(tool, server)
  const hasSchema = tool.inputSchema?.properties && Object.keys(tool.inputSchema.properties as object).length > 0

  return (
    <div className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800">
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Expand button */}
        <button
          type="button"
          onClick={() => hasSchema && setExpanded(!expanded)}
          className={cn(
            'shrink-0 rounded p-0.5 transition-transform',
            hasSchema ? 'cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800' : 'invisible',
            expanded && 'rotate-180',
          )}
        >
          <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
        </button>

        {/* Name and description */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{tool.name}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                </TooltipTrigger>
                <TooltipContent>ID: {tool.id}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {tool.description && (
            <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">{tool.description}</p>
          )}
        </div>

        {/* Enable switch */}
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="text-[10px] text-zinc-400">{t('settings.mcp.tools.enable', 'Enable')}</span>
          <Switch
            checked={enabled}
            onCheckedChange={(checked) => onToggleTool(tool, checked)}
          />
        </div>

        {/* Auto-approve switch */}
        <div className="flex shrink-0 items-center gap-1.5">
          <Zap className="h-3 w-3 text-amber-500" />
          <span className="text-[10px] text-zinc-400">{t('settings.mcp.tools.autoApprove.label', 'Auto')}</span>
          <Switch
            checked={autoApproved}
            disabled={!enabled}
            onCheckedChange={(checked) => onToggleAutoApprove(tool, checked)}
          />
        </div>
      </div>

      {/* Expanded schema */}
      {expanded && hasSchema && (
        <div className="border-t border-zinc-100 bg-zinc-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
          <SchemaProperties
            properties={tool.inputSchema.properties as Record<string, Record<string, unknown>>}
            required={tool.inputSchema.required as string[] | undefined}
          />
        </div>
      )}
    </div>
  )
}

export default function MCPToolsSection({
  tools,
  server,
  onToggleTool,
  onToggleAutoApprove,
}: MCPToolsSectionProps): JSX.Element {
  const { t } = useTranslation()

  if (tools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-sm text-zinc-400">
        {t('settings.mcp.tools.noToolsAvailable', 'No tools available')}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="border-b border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/50">
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          {t('settings.mcp.tools.availableTools', 'Available Tools')} ({tools.length})
        </span>
      </div>
      {tools.map((tool) => (
        <ToolRow
          key={tool.id}
          tool={tool}
          server={server}
          onToggleTool={onToggleTool}
          onToggleAutoApprove={onToggleAutoApprove}
        />
      ))}
    </div>
  )
}
