import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@renderer/components/ui/button'
import { Textarea } from '@renderer/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@renderer/components/ui/dialog'
import { useMCPStore } from '@renderer/stores/useMCPStore'
import type { MCPServer } from '@renderer/types/mcp'

interface EditMcpJsonPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditMcpJsonPopup({ open, onOpenChange }: EditMcpJsonPopupProps): JSX.Element {
  const { t } = useTranslation()
  const servers = useMCPStore((s) => s.servers)
  const setServers = useMCPStore((s) => s.setServers)
  const [jsonConfig, setJsonConfig] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Populate JSON from current servers
  useEffect(() => {
    if (!open) return

    const mcpServersObj: Record<string, Omit<MCPServer, 'id'>> = {}
    for (const server of servers) {
      const { id, ...rest } = server
      mcpServersObj[id] = rest
    }

    setJsonConfig(JSON.stringify({ mcpServers: mcpServersObj }, null, 2))
    setError('')
  }, [open, servers])

  const handleSave = async () => {
    setSaving(true)
    setError('')

    try {
      if (!jsonConfig.trim()) {
        setServers([])
        toast.success(t('settings.mcp.jsonSaveSuccess', 'Configuration saved'))
        onOpenChange(false)
        setSaving(false)
        return
      }

      let parsed: Record<string, unknown>
      try {
        parsed = JSON.parse(jsonConfig)
      } catch {
        setError(t('settings.mcp.addServer.importFrom.invalid', 'Invalid JSON'))
        setSaving(false)
        return
      }

      const serversObj = (parsed.mcpServers || parsed) as Record<string, Record<string, unknown>>
      const serversArray: MCPServer[] = []

      for (const [id, cfg] of Object.entries(serversObj)) {
        serversArray.push({
          id,
          isActive: false,
          name: (cfg.name as string) || id,
          ...cfg,
        } as MCPServer)
      }

      setServers(serversArray)
      toast.success(t('settings.mcp.jsonSaveSuccess', 'Configuration saved'))
      onOpenChange(false)
    } catch (err) {
      setError(String(err))
      toast.error(t('settings.mcp.jsonSaveError', 'Failed to save configuration'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('settings.mcp.editJson', 'Edit JSON Configuration')}</DialogTitle>
        </DialogHeader>

        {error && (
          <pre className="rounded-md bg-red-50 p-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </pre>
        )}

        <Textarea
          value={jsonConfig}
          onChange={(e) => setJsonConfig(e.target.value)}
          rows={20}
          className="font-mono text-sm"
        />

        <p className="text-[11px] text-zinc-400">
          {t('settings.mcp.jsonModeHint', 'Edit the raw JSON configuration for all MCP servers. Be careful with manual edits.')}
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
