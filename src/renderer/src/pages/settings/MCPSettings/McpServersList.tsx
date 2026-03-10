import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Plus, Search, FileEdit } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { useMCPStore } from '@renderer/stores/useMCPStore'
import { useMCPServers } from '@renderer/hooks/useMCPServers'
import { useMCPServerTrust } from '@renderer/hooks/useMCPServerTrust'
import type { MCPServer } from '@renderer/types/mcp'
import McpServerCard from './McpServerCard'
import AddMcpServerModal from './AddMcpServerModal'
import EditMcpJsonPopup from './EditMcpJsonPopup'

interface McpServersListProps {
  selectedId: string | null
  onSelectServer: (id: string) => void
}

export default function McpServersList({
  selectedId,
  onSelectServer,
}: McpServersListProps): JSX.Element {
  const { t } = useTranslation()
  const servers = useMCPStore((s) => s.servers)
  const { addServer, removeServer, toggleActive } = useMCPServers()
  const { ensureServerTrusted } = useMCPServerTrust()

  const [searchText, setSearchText] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editJsonOpen, setEditJsonOpen] = useState(false)
  const [loadingServerIds, setLoadingServerIds] = useState<Set<string>>(new Set())

  const filteredServers = useMemo(() => {
    if (!searchText.trim()) return servers
    const lower = searchText.toLowerCase()
    return servers.filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.description?.toLowerCase().includes(lower) ||
        s.tags?.some((tag) => tag.toLowerCase().includes(lower)),
    )
  }, [servers, searchText])

  const handleAddServer = useCallback(
    async (server: MCPServer) => {
      await addServer(server)
      onSelectServer(server.id)
    },
    [addServer, onSelectServer],
  )

  const handleToggleActive = useCallback(
    async (server: MCPServer, active: boolean) => {
      if (active) {
        const trusted = await ensureServerTrusted(server)
        if (!trusted) return
      }

      setLoadingServerIds((prev) => new Set(prev).add(server.id))
      try {
        await toggleActive(server.id, active)
      } catch {
        toast.error(t('settings.mcp.startError', 'Failed to toggle server'))
      } finally {
        setLoadingServerIds((prev) => {
          const next = new Set(prev)
          next.delete(server.id)
          return next
        })
      }
    },
    [ensureServerTrusted, toggleActive, t],
  )

  const handleDelete = useCallback(
    async (server: MCPServer) => {
      try {
        await removeServer(server)
        toast.success(t('settings.mcp.deleteSuccess', 'Server deleted'))
      } catch {
        toast.error(t('settings.mcp.deleteError', 'Failed to delete server'))
      }
    },
    [removeServer, t],
  )

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="space-y-2 border-b border-zinc-200 p-3 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t('settings.mcp.servers', 'MCP Servers')}
            </h3>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setEditJsonOpen(true)}
                title={t('settings.mcp.editJson', 'Edit JSON')}
              >
                <FileEdit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setAddModalOpen(true)}
                title={t('common.add', 'Add')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <Input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={t('settings.mcp.search.placeholder', 'Search servers...')}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>

        {/* Server list */}
        <ScrollArea className="flex-1">
          <div className="space-y-2 p-3">
            {filteredServers.length === 0 && (
              <div className="py-8 text-center text-xs text-zinc-400">
                {servers.length === 0
                  ? t('settings.mcp.noServers', 'No servers configured')
                  : t('common.no_results', 'No results found')}
              </div>
            )}
            {filteredServers.map((server) => (
              <McpServerCard
                key={server.id}
                server={server}
                isSelected={selectedId === server.id}
                isLoading={loadingServerIds.has(server.id)}
                onToggle={(active) => handleToggleActive(server, active)}
                onSelect={() => onSelectServer(server.id)}
                onDelete={() => handleDelete(server)}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      <AddMcpServerModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={handleAddServer}
        existingServers={servers}
      />

      <EditMcpJsonPopup open={editJsonOpen} onOpenChange={setEditJsonOpen} />
    </>
  )
}
