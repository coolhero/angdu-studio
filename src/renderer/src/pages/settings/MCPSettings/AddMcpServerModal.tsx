import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Textarea } from '@renderer/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@renderer/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@renderer/components/ui/tabs'
import type { MCPServer } from '@renderer/types/mcp'

interface AddMcpServerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (server: MCPServer) => void
  existingServers: MCPServer[]
}

const stdioSchema = z.object({
  command: z.string().min(1, 'Command is required'),
})

const urlSchema = z.object({
  url: z.string().url('Invalid URL'),
  headers: z.string().optional(),
})

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

// Example JSON for placeholder
const jsonExample = `{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "mcp-server-example"]
    }
  }
}`

export default function AddMcpServerModal({
  open,
  onOpenChange,
  onSuccess,
  existingServers,
}: AddMcpServerModalProps): JSX.Element {
  const { t } = useTranslation()
  const [tab, setTab] = useState('command')
  const [loading, setLoading] = useState(false)

  // Command tab
  const [command, setCommand] = useState('')

  // URL tab
  const [url, setUrl] = useState('')
  const [headers, setHeaders] = useState('')

  // JSON tab
  const [jsonConfig, setJsonConfig] = useState('')

  // DXT tab
  const [dxtPath, setDxtPath] = useState('')

  const resetForm = useCallback(() => {
    setCommand('')
    setUrl('')
    setHeaders('')
    setJsonConfig('')
    setDxtPath('')
    setLoading(false)
  }, [])

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      let server: MCPServer

      if (tab === 'command') {
        const result = stdioSchema.safeParse({ command: command.trim() })
        if (!result.success) {
          toast.error(result.error.errors[0]?.message || 'Invalid command')
          setLoading(false)
          return
        }

        // Parse command string: first word is command, rest are args
        const parts = command.trim().split(/\s+/)
        const cmd = parts[0]
        const args = parts.slice(1)

        server = {
          id: generateId(),
          name: cmd + (args[0] ? ` ${args[0]}` : ''),
          command: cmd,
          args,
          isActive: false,
          type: 'stdio',
          installSource: 'manual',
          isTrusted: true,
          installedAt: Date.now(),
          trustedAt: Date.now(),
        }
      } else if (tab === 'url') {
        const result = urlSchema.safeParse({ url: url.trim(), headers: headers.trim() || undefined })
        if (!result.success) {
          toast.error(result.error.errors[0]?.message || 'Invalid URL')
          setLoading(false)
          return
        }

        const parsedHeaders: Record<string, string> = {}
        if (headers.trim()) {
          for (const line of headers.split('\n')) {
            const eqIdx = line.indexOf('=')
            if (eqIdx > 0) {
              parsedHeaders[line.substring(0, eqIdx).trim()] = line.substring(eqIdx + 1).trim()
            }
          }
        }

        // Detect type from URL
        const isSSE = url.toLowerCase().includes('/sse')
        server = {
          id: generateId(),
          name: new URL(url.trim()).hostname,
          baseUrl: url.trim(),
          isActive: false,
          type: isSSE ? 'sse' : 'streamableHttp',
          headers: Object.keys(parsedHeaders).length > 0 ? parsedHeaders : undefined,
          installSource: 'manual',
          isTrusted: true,
          installedAt: Date.now(),
          trustedAt: Date.now(),
        }
      } else if (tab === 'json') {
        if (!jsonConfig.trim()) {
          toast.error(t('settings.mcp.addServer.importFrom.invalid', 'Invalid JSON'))
          setLoading(false)
          return
        }

        let parsed: Record<string, unknown>
        try {
          // Strip JS-style comments
          const cleaned = jsonConfig.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')
          parsed = JSON.parse(cleaned)
        } catch {
          toast.error(t('settings.mcp.addServer.importFrom.invalid', 'Invalid JSON'))
          setLoading(false)
          return
        }

        // Handle mcpServers wrapper format
        const serversObj = (parsed.mcpServers || parsed) as Record<string, Record<string, unknown>>
        const keys = Object.keys(serversObj)
        if (keys.length === 0) {
          toast.error(t('settings.mcp.addServer.importFrom.invalid', 'No servers found in JSON'))
          setLoading(false)
          return
        }
        if (keys.length > 1) {
          toast.error(t('settings.mcp.addServer.importFrom.error.multipleServers', 'Only one server allowed per import'))
          setLoading(false)
          return
        }

        const name = keys[0]
        const cfg = serversObj[name]

        // Check duplicate name
        if (existingServers.some((s) => s.name === name)) {
          toast.error(t('settings.mcp.addServer.importFrom.nameExists', `Server "${name}" already exists`))
          setLoading(false)
          return
        }

        const serverType = (cfg.type as string) || (cfg.url || cfg.baseUrl ? 'sse' : 'stdio')
        server = {
          id: generateId(),
          name: (cfg.name as string) || name,
          command: cfg.command as string | undefined,
          args: cfg.args as string[] | undefined,
          env: cfg.env as Record<string, string> | undefined,
          baseUrl: (cfg.url || cfg.baseUrl) as string | undefined,
          headers: cfg.headers as Record<string, string> | undefined,
          isActive: false,
          type: serverType as MCPServer['type'],
          installSource: 'manual',
          isTrusted: true,
          installedAt: Date.now(),
          trustedAt: Date.now(),
        }
      } else if (tab === 'dxt') {
        if (!dxtPath) {
          toast.error(t('settings.mcp.addServer.importFrom.noDxtFile', 'No DXT file selected'))
          setLoading(false)
          return
        }

        try {
          const result = await window.api.mcp.uploadDxt(dxtPath) as unknown as MCPServer
          server = {
            ...result,
            id: result.id || generateId(),
            isActive: false,
            installSource: 'manual',
            isTrusted: true,
            installedAt: Date.now(),
            trustedAt: Date.now(),
          }
        } catch {
          toast.error(t('settings.mcp.addServer.importFrom.dxtProcessFailed', 'DXT processing failed'))
          setLoading(false)
          return
        }
      } else {
        setLoading(false)
        return
      }

      onSuccess(server)
      handleClose()
      toast.success(t('settings.mcp.addSuccess', 'Server added successfully'))
    } catch (err) {
      toast.error(String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleSelectDxt = async () => {
    try {
      const files = await window.api.file.select(
        [{ name: 'DXT Package', extensions: ['dxt'] }],
        false,
      )
      if (files && files.length > 0) {
        setDxtPath(files[0])
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('settings.mcp.addServer.title', 'Add MCP Server')}</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="command">{t('settings.mcp.addServer.tabs.command', 'Command')}</TabsTrigger>
            <TabsTrigger value="url">{t('settings.mcp.addServer.tabs.url', 'URL')}</TabsTrigger>
            <TabsTrigger value="json">{t('settings.mcp.addServer.tabs.json', 'JSON')}</TabsTrigger>
            <TabsTrigger value="dxt">{t('settings.mcp.addServer.tabs.dxt', 'DXT')}</TabsTrigger>
          </TabsList>

          <TabsContent value="command" className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {t('settings.mcp.command', 'Command')}
              </label>
              <Input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="npx @modelcontextprotocol/server-filesystem /tmp"
                className="font-mono text-sm"
              />
              <p className="mt-1 text-[11px] text-zinc-400">
                {t('settings.mcp.addServer.commandHint', 'Enter the full stdio command including arguments')}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {t('settings.mcp.url', 'URL')}
              </label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://localhost:3000/sse"
                className="font-mono text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {t('settings.mcp.headers', 'Headers')} ({t('common.optional', 'optional')})
              </label>
              <Textarea
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                placeholder={`Authorization=Bearer token\nContent-Type=application/json`}
                rows={3}
                className="font-mono text-sm"
              />
            </div>
          </TabsContent>

          <TabsContent value="json" className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {t('settings.mcp.addServer.importFrom.tooltip', 'JSON Configuration')}
              </label>
              <Textarea
                value={jsonConfig}
                onChange={(e) => setJsonConfig(e.target.value)}
                placeholder={jsonExample}
                rows={12}
                className="font-mono text-sm"
              />
            </div>
          </TabsContent>

          <TabsContent value="dxt" className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {t('settings.mcp.addServer.importFrom.dxtFile', 'DXT Package File')}
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={dxtPath}
                  readOnly
                  placeholder={t('settings.mcp.addServer.importFrom.selectDxtFile', 'Select .dxt file...')}
                  className="flex-1 text-sm"
                />
                <Button variant="outline" size="sm" onClick={handleSelectDxt}>
                  {t('common.browse', 'Browse')}
                </Button>
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                {t('settings.mcp.addServer.importFrom.dxtHelp', 'Upload a .dxt package to install an MCP server')}
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading
              ? t('common.adding', 'Adding...')
              : t('common.add', 'Add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
