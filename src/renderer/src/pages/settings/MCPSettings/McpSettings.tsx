import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Save, Trash2, ChevronDown, ScrollText } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Textarea } from '@renderer/components/ui/textarea'
import { Switch } from '@renderer/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@renderer/components/ui/tabs'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { useMCPStore } from '@renderer/stores/useMCPStore'
import { useMCPServers } from '@renderer/hooks/useMCPServers'
import { useMCPServerTrust } from '@renderer/hooks/useMCPServerTrust'
import type { MCPServer, MCPTool, MCPPrompt, MCPResource } from '@renderer/types/mcp'
import MCPToolsSection from './McpTool'
import MCPPromptsSection from './McpPrompt'
import MCPResourcesSection from './McpResource'
import McpDescription from './McpDescription'
import LogViewerDialog from './LogViewerDialog'

interface MCPFormValues {
  name: string
  description: string
  serverType: string
  baseUrl: string
  command: string
  args: string
  env: string
  headers: string
  longRunning: boolean
  timeout: string
  provider: string
  providerUrl: string
  logoUrl: string
  tags: string
}

interface McpSettingsProps {
  serverId: string
}

function parseKeyValueString(str: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const line of str.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx > 0) {
      result[trimmed.substring(0, eqIdx).trim()] = trimmed.substring(eqIdx + 1).trim()
    }
  }
  return result
}

export default function McpSettings({ serverId }: McpSettingsProps): JSX.Element {
  const { t } = useTranslation()
  const server = useMCPStore((s) => s.servers.find((sv) => sv.id === serverId))
  const updateServer = useMCPStore((s) => s.updateServer)
  const { removeServer, toggleActive, restartServer, listTools } = useMCPServers()
  const { ensureServerTrusted } = useMCPServerTrust()

  const [activeTab, setActiveTab] = useState('settings')
  const [tools, setTools] = useState<MCPTool[]>([])
  const [prompts, setPrompts] = useState<MCPPrompt[]>([])
  const [resources, setResources] = useState<MCPResource[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingToggle, setLoadingToggle] = useState(false)
  const [logDialogOpen, setLogDialogOpen] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm<MCPFormValues>()

  const serverType = watch('serverType')

  // Reset form when server changes
  useEffect(() => {
    if (!server) return

    const type = server.type || (server.baseUrl ? 'sse' : 'stdio')
    reset({
      name: server.name || '',
      description: server.description || '',
      serverType: type,
      baseUrl: server.baseUrl || '',
      command: server.command || '',
      args: server.args ? server.args.join('\n') : '',
      env: server.env
        ? Object.entries(server.env)
            .map(([k, v]) => `${k}=${v}`)
            .join('\n')
        : '',
      headers: server.headers
        ? Object.entries(server.headers)
            .map(([k, v]) => `${k}=${v}`)
            .join('\n')
        : '',
      longRunning: server.longRunning || false,
      timeout: server.timeout ? String(server.timeout) : '',
      provider: server.provider || '',
      providerUrl: server.providerUrl || '',
      logoUrl: server.logoUrl || '',
      tags: server.tags ? server.tags.join(', ') : '',
    })
  }, [server?.id, reset])

  // Fetch tools/prompts/resources when server is active
  useEffect(() => {
    if (!server?.isActive) {
      setTools([])
      setPrompts([])
      setResources([])
      return
    }

    const fetchData = async () => {
      try {
        const [fetchedTools, fetchedPrompts, fetchedResources] = await Promise.all([
          window.api.mcp.listTools(server).catch(() => []),
          window.api.mcp.listPrompts(server).catch(() => []),
          window.api.mcp.listResources(server).catch(() => []),
        ])
        setTools(fetchedTools as MCPTool[])
        setPrompts(fetchedPrompts as MCPPrompt[])
        setResources(fetchedResources as MCPResource[])
      } catch {
        // ignore
      }
    }

    fetchData()
  }, [server?.id, server?.isActive])

  const onSave = handleSubmit(async (values) => {
    if (!server) return
    setLoading(true)

    try {
      const updated: Partial<MCPServer> = {
        name: values.name,
        description: values.description || undefined,
        type: values.serverType as MCPServer['type'],
        longRunning: values.longRunning,
        timeout: values.timeout ? Number(values.timeout) : undefined,
        provider: values.provider || undefined,
        providerUrl: values.providerUrl || undefined,
        logoUrl: values.logoUrl || undefined,
        tags: values.tags
          ? values.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
      }

      if (values.serverType === 'sse' || values.serverType === 'streamableHttp') {
        updated.baseUrl = values.baseUrl
        if (values.headers.trim()) {
          updated.headers = parseKeyValueString(values.headers)
        }
      } else if (values.serverType === 'stdio') {
        updated.command = values.command
        updated.args = values.args
          ? values.args.split('\n').filter((a) => a.trim() !== '')
          : []
        if (values.env.trim()) {
          updated.env = parseKeyValueString(values.env)
        }
      }

      updateServer(server.id, updated)

      if (server.isActive) {
        try {
          await restartServer({ ...server, ...updated } as MCPServer)
          toast.success(t('settings.mcp.updateSuccess', 'Server updated and restarted'))
        } catch {
          updateServer(server.id, { isActive: false })
          toast.error(t('settings.mcp.updateError', 'Failed to restart server'))
        }
      } else {
        toast.success(t('settings.mcp.updateSuccess', 'Server configuration saved'))
      }

      reset(values) // Mark form as clean
    } catch (error) {
      toast.error(String(error))
    } finally {
      setLoading(false)
    }
  })

  const handleToggleActive = async (active: boolean) => {
    if (!server) return

    if (isDirty && active) {
      await onSave()
      return
    }

    setLoadingToggle(true)
    try {
      if (active) {
        const trusted = await ensureServerTrusted(server)
        if (!trusted) {
          setLoadingToggle(false)
          return
        }
      }
      await toggleActive(server.id, active)

      if (active) {
        // Refresh tools after activation
        try {
          const fetchedTools = await listTools(server)
          setTools(fetchedTools)
          const fetchedPrompts = await window.api.mcp.listPrompts(server)
          setPrompts(fetchedPrompts as MCPPrompt[])
          const fetchedResources = await window.api.mcp.listResources(server)
          setResources(fetchedResources as MCPResource[])
        } catch {
          /* ignore */
        }
      }
    } catch {
      toast.error(t('settings.mcp.startError', 'Failed to start server'))
    } finally {
      setLoadingToggle(false)
    }
  }

  const handleDelete = async () => {
    if (!server) return
    try {
      await removeServer(server)
      toast.success(t('settings.mcp.deleteSuccess', 'Server deleted'))
    } catch {
      toast.error(t('settings.mcp.deleteError', 'Failed to delete server'))
    }
  }

  const handleToggleTool = useCallback(
    (tool: MCPTool, enabled: boolean) => {
      if (!server) return
      let disabledTools = [...(server.disabledTools || [])]
      if (enabled) {
        disabledTools = disabledTools.filter((name) => name !== tool.name)
      } else if (!disabledTools.includes(tool.name)) {
        disabledTools.push(tool.name)
      }
      updateServer(server.id, { disabledTools })
    },
    [server, updateServer],
  )

  const handleToggleAutoApprove = useCallback(
    (tool: MCPTool, autoApprove: boolean) => {
      if (!server) return
      let disabledAutoApproveTools = [...(server.disabledAutoApproveTools || [])]
      if (autoApprove) {
        disabledAutoApproveTools = disabledAutoApproveTools.filter((name) => name !== tool.name)
      } else if (!disabledAutoApproveTools.includes(tool.name)) {
        disabledAutoApproveTools.push(tool.name)
      }
      updateServer(server.id, { disabledAutoApproveTools })
    },
    [server, updateServer],
  )

  if (!server) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-400">
        {t('settings.mcp.noServerSelected', 'Select a server to view settings')}
      </div>
    )
  }

  return (
    <>
      <ScrollArea className="h-full">
        <div className="space-y-4 p-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{server.name}</h3>
              <Button variant="ghost" size="sm" onClick={() => setLogDialogOpen(true)}>
                <ScrollText className="mr-1 h-3.5 w-3.5" />
                {t('settings.mcp.logs', 'Logs')}
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={server.isActive}
                onCheckedChange={handleToggleActive}
                disabled={loadingToggle}
              />
              <Button size="sm" onClick={onSave} disabled={loading || (!isDirty && activeTab === 'settings')}>
                <Save className="mr-1 h-3.5 w-3.5" />
                {t('common.save', 'Save')}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDelete}>
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="settings">{t('settings.mcp.tabs.general', 'Settings')}</TabsTrigger>
              {server.isActive && (
                <>
                  <TabsTrigger value="tools">
                    {t('settings.mcp.tabs.tools', 'Tools')}
                    {tools.length > 0 && ` (${tools.length})`}
                  </TabsTrigger>
                  <TabsTrigger value="prompts">
                    {t('settings.mcp.tabs.prompts', 'Prompts')}
                    {prompts.length > 0 && ` (${prompts.length})`}
                  </TabsTrigger>
                  <TabsTrigger value="resources">
                    {t('settings.mcp.tabs.resources', 'Resources')}
                    {resources.length > 0 && ` (${resources.length})`}
                  </TabsTrigger>
                </>
              )}
              <TabsTrigger value="description">{t('settings.mcp.tabs.description', 'Description')}</TabsTrigger>
            </TabsList>

            {/* Settings tab */}
            <TabsContent value="settings">
              <form onSubmit={onSave} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {t('settings.mcp.name', 'Name')} *
                  </label>
                  <Input {...register('name', { required: true })} disabled={server.type === 'inMemory'} />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {t('settings.mcp.description', 'Description')}
                  </label>
                  <Textarea {...register('description')} rows={2} />
                </div>

                {/* Type */}
                {server.type !== 'inMemory' && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      {t('settings.mcp.type', 'Type')}
                    </label>
                    <select
                      {...register('serverType')}
                      className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-zinc-700"
                    >
                      <option value="stdio">stdio</option>
                      <option value="sse">SSE</option>
                      <option value="streamableHttp">Streamable HTTP</option>
                    </select>
                  </div>
                )}

                {/* SSE / streamableHttp fields */}
                {(serverType === 'sse' || serverType === 'streamableHttp') && (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {t('settings.mcp.url', 'URL')} *
                      </label>
                      <Input
                        {...register('baseUrl', { required: serverType === 'sse' || serverType === 'streamableHttp' })}
                        placeholder={serverType === 'sse' ? 'http://localhost:3000/sse' : 'http://localhost:3000/mcp'}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {t('settings.mcp.headers', 'Headers')}
                      </label>
                      <Textarea
                        {...register('headers')}
                        rows={3}
                        placeholder={`Content-Type=application/json\nAuthorization=Bearer token`}
                        className="font-mono text-sm"
                      />
                    </div>
                  </>
                )}

                {/* stdio fields */}
                {(serverType === 'stdio' || serverType === 'inMemory') && (
                  <>
                    {serverType === 'stdio' && (
                      <div>
                        <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          {t('settings.mcp.command', 'Command')} *
                        </label>
                        <Input
                          {...register('command', { required: serverType === 'stdio' })}
                          placeholder="npx or uvx"
                          className="font-mono text-sm"
                        />
                      </div>
                    )}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {t('settings.mcp.args', 'Arguments')}
                      </label>
                      <Textarea
                        {...register('args')}
                        rows={3}
                        placeholder={`arg1\narg2`}
                        className="font-mono text-sm"
                      />
                      <p className="mt-0.5 text-[11px] text-zinc-400">
                        {t('settings.mcp.argsTooltip', 'One argument per line')}
                      </p>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {t('settings.mcp.env', 'Environment Variables')}
                      </label>
                      <Textarea
                        {...register('env')}
                        rows={3}
                        placeholder={`KEY1=value1\nKEY2=value2`}
                        className="font-mono text-sm"
                      />
                    </div>
                  </>
                )}

                {/* Long Running */}
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {t('settings.mcp.longRunning', 'Long Running')}
                  </label>
                  <Switch
                    checked={watch('longRunning')}
                    onCheckedChange={(checked) => setValue('longRunning', checked, { shouldDirty: true })}
                  />
                </div>

                {/* Timeout */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {t('settings.mcp.timeout', 'Timeout')} (s)
                  </label>
                  <Input
                    {...register('timeout')}
                    type="number"
                    min={1}
                    placeholder="60"
                    className="w-32"
                  />
                </div>

                {/* Advanced */}
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400"
                >
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      showAdvanced && 'rotate-180',
                    )}
                  />
                  {t('common.advanced_settings', 'Advanced Settings')}
                </button>

                {showAdvanced && (
                  <div className="space-y-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {t('settings.mcp.provider', 'Provider')}
                      </label>
                      <Input {...register('provider')} placeholder="Provider name" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {t('settings.mcp.providerUrl', 'Provider URL')}
                      </label>
                      <Input {...register('providerUrl')} placeholder="https://provider.com" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {t('settings.mcp.logoUrl', 'Logo URL')}
                      </label>
                      <Input {...register('logoUrl')} placeholder="https://example.com/logo.png" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {t('settings.mcp.tags', 'Tags')}
                      </label>
                      <Input {...register('tags')} placeholder="tag1, tag2, tag3" />
                      <p className="mt-0.5 text-[11px] text-zinc-400">
                        {t('settings.mcp.tagsPlaceholder', 'Comma-separated tags')}
                      </p>
                    </div>
                  </div>
                )}
              </form>
            </TabsContent>

            {/* Tools tab */}
            <TabsContent value="tools">
              <MCPToolsSection
                tools={tools}
                server={server}
                onToggleTool={handleToggleTool}
                onToggleAutoApprove={handleToggleAutoApprove}
              />
            </TabsContent>

            {/* Prompts tab */}
            <TabsContent value="prompts">
              <MCPPromptsSection prompts={prompts} />
            </TabsContent>

            {/* Resources tab */}
            <TabsContent value="resources">
              <MCPResourcesSection resources={resources} />
            </TabsContent>

            {/* Description tab */}
            <TabsContent value="description">
              <McpDescription server={server} />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>

      <LogViewerDialog
        open={logDialogOpen}
        onOpenChange={setLogDialogOpen}
        server={server}
      />
    </>
  )
}
