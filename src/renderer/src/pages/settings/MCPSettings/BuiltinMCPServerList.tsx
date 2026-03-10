import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Plus, Check, Package } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { useMCPStore } from '@renderer/stores/useMCPStore'
import { useMCPServers } from '@renderer/hooks/useMCPServers'
import { BuiltinMCPServerNames } from '@renderer/types/mcp'
import type { MCPServer } from '@renderer/types/mcp'

interface BuiltinServerInfo {
  name: string
  key: string
  description: string
  requiresConfig?: boolean
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

// Builtin server definitions
const builtinServers: BuiltinServerInfo[] = [
  {
    name: BuiltinMCPServerNames.memory,
    key: 'memory',
    description: 'Knowledge graph memory server for persistent context',
  },
  {
    name: BuiltinMCPServerNames.sequentialThinking,
    key: 'sequentialThinking',
    description: 'Sequential thinking and reasoning server',
  },
  {
    name: BuiltinMCPServerNames.braveSearch,
    key: 'braveSearch',
    description: 'Brave Search integration',
    requiresConfig: true,
  },
  {
    name: BuiltinMCPServerNames.fetch,
    key: 'fetch',
    description: 'HTTP fetch server for web requests',
  },
  {
    name: BuiltinMCPServerNames.filesystem,
    key: 'filesystem',
    description: 'Local filesystem access server',
    requiresConfig: true,
  },
  {
    name: BuiltinMCPServerNames.python,
    key: 'python',
    description: 'Python code execution server',
  },
  {
    name: BuiltinMCPServerNames.browser,
    key: 'browser',
    description: 'Browser automation server',
  },
]

export default function BuiltinMCPServerList(): JSX.Element {
  const { t } = useTranslation()
  const servers = useMCPStore((s) => s.servers)
  const { addServer } = useMCPServers()

  const handleAdd = useCallback(
    async (builtin: BuiltinServerInfo) => {
      const isInstalled = servers.some((s) => s.name === builtin.name)
      if (isInstalled) return

      const server: MCPServer = {
        id: generateId(),
        name: builtin.name,
        description: builtin.description,
        type: 'inMemory',
        isActive: false,
        shouldConfig: builtin.requiresConfig,
        installSource: 'builtin',
        isTrusted: true,
        installedAt: Date.now(),
        trustedAt: Date.now(),
      }

      await addServer(server)
      toast.success(t('settings.mcp.addSuccess', 'Server added'))
    },
    [servers, addServer, t],
  )

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-zinc-500" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {t('settings.mcp.builtinServers', 'Built-in Servers')}
          </h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {builtinServers.map((builtin) => {
            const isInstalled = servers.some((s) => s.name === builtin.name)

            return (
              <div
                key={builtin.key}
                className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {builtin.name}
                    </h4>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {builtin.description}
                    </p>
                  </div>
                  <Button
                    variant={isInstalled ? 'ghost' : 'outline'}
                    size="sm"
                    onClick={() => handleAdd(builtin)}
                    disabled={isInstalled}
                    className="ml-2 shrink-0"
                  >
                    {isInstalled ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px]">
                    Built-in
                  </Badge>
                  {builtin.requiresConfig && (
                    <Badge variant="secondary" className="text-[10px] text-yellow-600 dark:text-yellow-400">
                      {t('settings.mcp.requiresConfig', 'Requires Config')}
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </ScrollArea>
  )
}
