import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Search, Plus, Check } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { Badge } from '@renderer/components/ui/badge'
import { useMCPStore } from '@renderer/stores/useMCPStore'
import { useMCPServers } from '@renderer/hooks/useMCPServers'
import type { MCPServer } from '@renderer/types/mcp'

interface SearchResult {
  name: string
  description: string
  version: string
  fullName: string
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

export default function NpxSearch(): JSX.Element {
  const { t } = useTranslation()
  const servers = useMCPStore((s) => s.servers)
  const { addServer } = useMCPServers()
  const [scope, setScope] = useState('@modelcontextprotocol')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])

  const handleSearch = useCallback(async () => {
    if (!scope.trim()) {
      toast.warning(t('settings.mcp.npx_list.scope_required', 'Please enter an npm scope'))
      return
    }
    if (loading) return

    setLoading(true)
    try {
      // Use npm registry API to search
      const response = await fetch(
        `https://registry.npmjs.org/-/v1/search?text=scope:${encodeURIComponent(scope.replace('@', ''))}&size=50`,
      )
      if (!response.ok) throw new Error('Search failed')
      const data = await response.json()

      setResults(
        (data.objects || []).map((obj: Record<string, Record<string, string>>) => ({
          name: obj.package?.name?.split('/')[1] || obj.package?.name || '',
          description: obj.package?.description || 'No description',
          version: obj.package?.version || 'latest',
          fullName: obj.package?.name || '',
        })),
      )
    } catch {
      toast.error(t('settings.mcp.npx_list.search_error', 'Search failed'))
    } finally {
      setLoading(false)
    }
  }, [scope, loading, t])

  const handleInstall = useCallback(
    async (result: SearchResult) => {
      const isInstalled = servers.some((s) => s.name === result.fullName)
      if (isInstalled) return

      const server: MCPServer = {
        id: generateId(),
        name: result.fullName,
        description: result.description,
        command: 'npx',
        args: ['-y', result.fullName],
        isActive: false,
        type: 'stdio',
        searchKey: result.fullName,
        installSource: 'manual',
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
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {t('settings.mcp.npx_list.title', 'NPX Package Search')}
        </h3>

        <div className="flex items-center gap-2">
          <Input
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            placeholder="@modelcontextprotocol"
            className="flex-1 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading} size="sm">
            <Search className="mr-1 h-3.5 w-3.5" />
            {loading ? t('common.searching', 'Searching...') : t('common.search', 'Search')}
          </Button>
        </div>

        <div className="space-y-2">
          {results.map((result) => {
            const isInstalled = servers.some((s) => s.name === result.fullName)
            return (
              <div
                key={result.fullName}
                className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {result.name}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      v{result.version}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {result.description}
                  </p>
                </div>
                <Button
                  variant={isInstalled ? 'ghost' : 'outline'}
                  size="sm"
                  onClick={() => handleInstall(result)}
                  disabled={isInstalled}
                >
                  {isInstalled ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            )
          })}
          {results.length === 0 && !loading && (
            <p className="py-8 text-center text-xs text-zinc-400">
              {t('settings.mcp.npx_list.hint', 'Enter an npm scope and search to find MCP servers')}
            </p>
          )}
        </div>
      </div>
    </ScrollArea>
  )
}
