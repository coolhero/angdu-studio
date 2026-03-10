// ── F006: MCP Service — Core singleton managing MCP client connections ──

import crypto from 'node:crypto'
import EventEmitter from 'node:events'
import os from 'node:os'
import path from 'node:path'

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'
import type { StdioServerParameters } from '@modelcontextprotocol/sdk/client/stdio.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import {
  StreamableHTTPClientTransport,
  type StreamableHTTPClientTransportOptions
} from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import {
  CancelledNotificationSchema,
  type GetPromptResult,
  LoggingMessageNotificationSchema,
  PromptListChangedNotificationSchema,
  ResourceListChangedNotificationSchema,
  ResourceUpdatedNotificationSchema,
  ToolListChangedNotificationSchema
} from '@modelcontextprotocol/sdk/types.js'
import { app, net } from 'electron'
import { nanoid } from 'nanoid'

import { IpcChannel } from '@shared/ipc-channels'
import type {
  MCPServer,
  MCPTool,
  MCPPrompt,
  MCPResource,
  MCPCallToolResponse,
  MCPProgressEvent,
  GetResourceResponse,
  BuiltinMCPServerName
} from '@shared/types/mcp'
import {
  BuiltinMCPServerNames,
  isBuiltinMCPServer
} from '@shared/types/mcp'

import { createInMemoryMCPServer } from '../mcpServers/factory'
import { CallBackServer } from './mcp/oauth/callback'
import { McpOAuthClientProvider } from './mcp/oauth/provider'
import { ServerLogBuffer, type ServerLogEntry } from './mcp/ServerLogBuffer'
import { windowService } from './WindowService'

// ── Sensitive field redaction ──

const SENSITIVE_KEYS = new Set([
  'authorization', 'Authorization', 'apiKey', 'api_key',
  'apikey', 'token', 'access_token', 'secret', 'password'
])
const MAX_STRING_LENGTH = 300

function redactSensitiveFields(input: unknown): unknown {
  if (input == null) return input
  if (typeof input === 'string') {
    return input.length > MAX_STRING_LENGTH
      ? `${input.slice(0, MAX_STRING_LENGTH)}...<${input.length - MAX_STRING_LENGTH} more>`
      : input
  }
  if (Array.isArray(input)) return input.map(redactSensitiveFields)
  if (typeof input === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      out[k] = SENSITIVE_KEYS.has(k) ? '<redacted>' : redactSensitiveFields(v)
    }
    return out
  }
  return input
}

// ── Config hash for connection pooling key ──

function getConfigHash(server: MCPServer): string {
  return JSON.stringify({
    id: server.id,
    baseUrl: server.baseUrl,
    command: server.command,
    args: Array.isArray(server.args) ? server.args : [],
    registryUrl: server.registryUrl,
    env: server.env
  })
}

// ── Shell environment resolution ──

let cachedShellEnv: Record<string, string> | null = null

async function getShellEnvironment(): Promise<Record<string, string>> {
  if (cachedShellEnv) return cachedShellEnv

  // Start with process.env as base
  const env: Record<string, string> = {}
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined) {
      env[key] = value
    }
  }

  // On macOS/Linux, try to get login shell environment for proper PATH
  if (process.platform !== 'win32') {
    try {
      const { execSync } = await import('node:child_process')
      const shell = process.env.SHELL || '/bin/bash'
      const output = execSync(`${shell} -ilc 'env'`, {
        encoding: 'utf-8',
        timeout: 5000
      })
      for (const line of output.split('\n')) {
        const eqIdx = line.indexOf('=')
        if (eqIdx > 0) {
          const key = line.slice(0, eqIdx)
          const value = line.slice(eqIdx + 1)
          env[key] = value
        }
      }
    } catch {
      // Fall back to process.env — already populated above
    }
  }

  cachedShellEnv = env
  return env
}

// ── Types for internal use ──

interface CallToolArgs {
  server: MCPServer
  name: string
  args: unknown
  callId?: string
}

// ── MCPService singleton ──

class MCPService {
  private static instance: MCPService | null = null

  private clients: Map<string, Client> = new Map()
  private pendingClients: Map<string, Promise<Client>> = new Map()
  private activeToolCalls: Map<string, AbortController> = new Map()
  private serverLogs = new ServerLogBuffer(200)

  private constructor() {
    // Bind public methods for IPC handler compatibility (ipcMain.handle passes event as first arg)
    this.restartServer = this.restartServer.bind(this)
    this.stopServer = this.stopServer.bind(this)
    this.removeServer = this.removeServer.bind(this)
    this.checkConnectivity = this.checkConnectivity.bind(this)
    this.getServerVersion = this.getServerVersion.bind(this)
    this.listTools = this.listTools.bind(this)
    this.callTool = this.callTool.bind(this)
    this.abortTool = this.abortTool.bind(this)
    this.listPrompts = this.listPrompts.bind(this)
    this.getPrompt = this.getPrompt.bind(this)
    this.listResources = this.listResources.bind(this)
    this.getResource = this.getResource.bind(this)
    this.getServerLogs = this.getServerLogs.bind(this)
    this.cleanup = this.cleanup.bind(this)
  }

  static getInstance(): MCPService {
    if (!MCPService.instance) {
      MCPService.instance = new MCPService()
    }
    return MCPService.instance
  }

  // ── Server log emission ──

  private emitServerLog(server: MCPServer, entry: ServerLogEntry): void {
    const serverKey = getConfigHash(server)
    this.serverLogs.addLog(serverKey, entry)

    const mainWindow = windowService.getMainWindow()
    if (mainWindow && !mainWindow.isDestroyed()) {
      // Send structured-cloneable data only
      mainWindow.webContents.send(IpcChannel.Mcp_ServerLog, {
        timestamp: entry.timestamp,
        level: entry.level,
        message: entry.message,
        data: entry.data,
        source: entry.source,
        serverId: server.id
      })
    }
  }

  // ── Get server logs ──

  public getServerLogs(_: Electron.IpcMainInvokeEvent, server: MCPServer): ServerLogEntry[] {
    return this.serverLogs.getServerLogs(getConfigHash(server))
  }

  // ── Transport factory ──

  private async createTransport(
    server: MCPServer,
    authProvider?: McpOAuthClientProvider
  ): Promise<StdioClientTransport | SSEClientTransport | StreamableHTTPClientTransport | InMemoryTransport> {
    const args = [...(server.args || [])]

    // In-memory transport for builtin servers
    if (isBuiltinMCPServer(server)) {
      console.debug(`[MCPService] Using in-memory transport for ${server.name}`)
      const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()

      // Create the built-in server and connect it to the server side of the transport
      const builtinServer = createInMemoryMCPServer(
        server.name as BuiltinMCPServerName,
        args,
        server.env || {}
      )
      await builtinServer.connect(serverTransport)

      return clientTransport
    }

    // HTTP-based transports (SSE or StreamableHTTP)
    if (server.baseUrl) {
      const headers: Record<string, string> = { ...server.headers }

      if (server.type === 'streamableHttp') {
        const options: StreamableHTTPClientTransportOptions = {
          fetch: async (url, init) => {
            return net.fetch(typeof url === 'string' ? url : url.toString(), init)
          },
          requestInit: { headers },
          authProvider
        }
        console.debug(`[MCPService] Using StreamableHTTPClientTransport for ${server.name}`)
        return new StreamableHTTPClientTransport(new URL(server.baseUrl), options)
      }

      if (server.type === 'sse') {
        const options = {
          eventSourceInit: {
            fetch: async (url: string | URL, init?: RequestInit) => {
              return net.fetch(typeof url === 'string' ? url : url.toString(), init)
            }
          },
          requestInit: { headers },
          authProvider
        }
        console.debug(`[MCPService] Using SSEClientTransport for ${server.name}`)
        return new SSEClientTransport(new URL(server.baseUrl), options)
      }

      throw new Error(`Invalid server type "${server.type}" for URL-based server "${server.name}"`)
    }

    // Stdio transport
    if (server.command) {
      const cmd = server.command
      const shellEnv = await getShellEnvironment()

      console.debug(`[MCPService] Starting stdio server ${server.name}: ${cmd} ${args.join(' ')}`)

      const transportOptions: StdioServerParameters = {
        command: cmd,
        args,
        env: {
          ...shellEnv,
          ...server.env
        },
        stderr: 'pipe'
      }

      // For DXT servers, set working directory
      if (server.dxtPath) {
        (transportOptions as StdioServerParameters & { cwd?: string }).cwd = server.dxtPath
      }

      const stdioTransport = new StdioClientTransport(transportOptions)

      // Capture stderr for log buffer
      stdioTransport.stderr?.on('data', (data: Buffer) => {
        const msg = data.toString().trim()
        if (msg) {
          this.emitServerLog(server, {
            timestamp: Date.now(),
            level: 'stderr',
            message: msg,
            source: 'stdio'
          })
        }
      })

      return stdioTransport
    }

    throw new Error(`MCPServer "${server.name}" must have either baseUrl or command`)
  }

  // ── OAuth authentication flow ──

  private async handleOAuth(
    client: Client,
    server: MCPServer,
    authProvider: McpOAuthClientProvider
  ): Promise<void> {
    console.debug(`[MCPService] Starting OAuth flow for ${server.name}`)
    const events = new EventEmitter()

    const callbackServer = new CallBackServer({
      port: authProvider.config.callbackPort,
      path: authProvider.config.callbackPath,
      events
    })

    const timeoutId = setTimeout(() => {
      console.warn(`[MCPService] OAuth flow timed out for ${server.name}`)
      callbackServer.close()
    }, 300000) // 5 minutes

    try {
      const authCode = await callbackServer.waitForAuthCode()
      console.debug(`[MCPService] Received auth code for ${server.name}`)

      const transport = await this.createTransport(server, authProvider)
      if ('finishAuth' in transport && typeof transport.finishAuth === 'function') {
        await transport.finishAuth(authCode)
      }

      await client.connect(transport)
      console.debug(`[MCPService] OAuth authentication succeeded for ${server.name}`)
    } catch (oauthError) {
      console.error(`[MCPService] OAuth authentication failed for ${server.name}:`, oauthError)
      throw new Error(
        `OAuth authentication failed: ${oauthError instanceof Error ? oauthError.message : String(oauthError)}`
      )
    } finally {
      clearTimeout(timeoutId)
      callbackServer.close()
    }
  }

  // ── Client initialization with dedup ──

  async initClient(server: MCPServer): Promise<Client> {
    const serverKey = getConfigHash(server)

    // If there's a pending initialization, wait for it
    const pendingClient = this.pendingClients.get(serverKey)
    if (pendingClient) {
      console.debug(`[MCPService] Waiting for pending client: ${server.name}`)
      return pendingClient
    }

    // Check if we already have a healthy client
    const existingClient = this.clients.get(serverKey)
    if (existingClient) {
      try {
        const pingResult = await existingClient.ping({ timeout: 1000 })
        if (pingResult) {
          return existingClient
        }
        this.clients.delete(serverKey)
      } catch {
        console.warn(`[MCPService] Ping failed for ${server.name}, reconnecting`)
        this.clients.delete(serverKey)
      }
    }

    // Create initialization promise (dedup concurrent calls)
    const initPromise = (async (): Promise<Client> => {
      try {
        const client = new Client(
          { name: 'Angdu Studio', version: app.getVersion() },
          { capabilities: {} }
        )

        // Create OAuth provider for HTTP-based servers
        const authProvider = server.baseUrl
          ? new McpOAuthClientProvider({
              serverUrlHash: crypto.createHash('md5').update(server.baseUrl).digest('hex')
            })
          : undefined

        const transport = await this.createTransport(server, authProvider)

        try {
          await client.connect(transport)
        } catch (error) {
          // Handle OAuth flow for HTTP-based transports
          if (
            authProvider &&
            error instanceof Error &&
            (error.name === 'UnauthorizedError' || error.message.includes('Unauthorized'))
          ) {
            console.debug(`[MCPService] Authentication required for ${server.name}, starting OAuth flow`)
            await this.handleOAuth(client, server, authProvider)
          } else {
            console.error(`[MCPService] Failed to connect to ${server.name}:`, error)
            this.emitServerLog(server, {
              timestamp: Date.now(),
              level: 'error',
              message: `Connection failed: ${(error as Error)?.message}`,
              data: redactSensitiveFields(error),
              source: 'client'
            })
            throw error
          }
        }

        this.emitServerLog(server, {
          timestamp: Date.now(),
          level: 'info',
          message: 'Server connected',
          source: 'client'
        })

        // Store client and set up notifications
        this.clients.set(serverKey, client)
        this.setupNotificationHandlers(client, server)

        console.debug(`[MCPService] Activated server: ${server.name}`)
        this.emitServerLog(server, {
          timestamp: Date.now(),
          level: 'info',
          message: 'Server activated',
          source: 'client'
        })

        return client
      } finally {
        this.pendingClients.delete(serverKey)
      }
    })()

    this.pendingClients.set(serverKey, initPromise)
    return initPromise
  }

  // ── Notification handlers ──

  private setupNotificationHandlers(client: Client, server: MCPServer): void {
    try {
      client.setNotificationHandler(ToolListChangedNotificationSchema, async () => {
        console.debug(`[MCPService] Tools list changed: ${server.name}`)
      })

      client.setNotificationHandler(ResourceListChangedNotificationSchema, async () => {
        console.debug(`[MCPService] Resources list changed: ${server.name}`)
      })

      client.setNotificationHandler(PromptListChangedNotificationSchema, async () => {
        console.debug(`[MCPService] Prompts list changed: ${server.name}`)
      })

      client.setNotificationHandler(ResourceUpdatedNotificationSchema, async () => {
        console.debug(`[MCPService] Resource updated: ${server.name}`)
      })

      client.setNotificationHandler(CancelledNotificationSchema, async (notification) => {
        console.debug(`[MCPService] Operation cancelled: ${server.name}`, notification.params)
      })

      client.setNotificationHandler(LoggingMessageNotificationSchema, async (notification) => {
        const message = typeof notification.params?.data === 'string'
          ? notification.params.data
          : JSON.stringify(notification.params?.data ?? 'No data')

        this.emitServerLog(server, {
          timestamp: Date.now(),
          level: (notification.params?.level as ServerLogEntry['level']) || 'info',
          message,
          data: redactSensitiveFields(notification.params?.data),
          source: notification.params?.logger || 'server'
        })
      })
    } catch (error) {
      console.error(`[MCPService] Failed to set up notification handlers for ${server.name}:`, error)
    }
  }

  // ── Close client ──

  private async closeClient(serverKey: string): Promise<void> {
    const client = this.clients.get(serverKey)
    if (client) {
      try {
        await client.close()
      } catch (error) {
        console.error(`[MCPService] Error closing client:`, error)
      }
      this.clients.delete(serverKey)
      this.serverLogs.clearServerLogs(serverKey)
      console.debug(`[MCPService] Closed server: ${serverKey}`)
    }
  }

  // ── Server lifecycle (IPC handlers) ──

  async restartServer(_: Electron.IpcMainInvokeEvent, server: MCPServer): Promise<void> {
    console.debug(`[MCPService] Restarting server: ${server.name}`)
    const serverKey = getConfigHash(server)
    this.emitServerLog(server, {
      timestamp: Date.now(),
      level: 'info',
      message: 'Restarting server',
      source: 'client'
    })
    await this.closeClient(serverKey)
    await this.initClient(server)
  }

  async stopServer(_: Electron.IpcMainInvokeEvent, server: MCPServer): Promise<void> {
    console.debug(`[MCPService] Stopping server: ${server.name}`)
    this.emitServerLog(server, {
      timestamp: Date.now(),
      level: 'info',
      message: 'Stopping server',
      source: 'client'
    })
    await this.closeClient(getConfigHash(server))
  }

  async removeServer(_: Electron.IpcMainInvokeEvent, server: MCPServer): Promise<void> {
    const serverKey = getConfigHash(server)
    if (this.clients.has(serverKey)) {
      await this.closeClient(serverKey)
    }
  }

  // ── Connectivity check ──

  async checkConnectivity(_: Electron.IpcMainInvokeEvent, server: MCPServer): Promise<boolean> {
    console.debug(`[MCPService] Checking connectivity: ${server.name}`)
    try {
      const client = await this.initClient(server)
      await client.listTools()
      console.debug(`[MCPService] Connectivity OK: ${server.name}`)
      this.emitServerLog(server, {
        timestamp: Date.now(),
        level: 'info',
        message: 'Connectivity check successful',
        source: 'connectivity'
      })
      return true
    } catch (error) {
      console.error(`[MCPService] Connectivity check failed for ${server.name}:`, error)
      this.emitServerLog(server, {
        timestamp: Date.now(),
        level: 'error',
        message: `Connectivity check failed: ${(error as Error).message}`,
        data: redactSensitiveFields(error),
        source: 'connectivity'
      })
      // Close client on failure to ensure clean state for retry
      await this.closeClient(getConfigHash(server))
      return false
    }
  }

  // ── Server version ──

  async getServerVersion(_: Electron.IpcMainInvokeEvent, server: MCPServer): Promise<string | null> {
    try {
      console.debug(`[MCPService] Getting server version: ${server.name}`)
      const client = await this.initClient(server)
      const serverInfo = client.getServerVersion()

      if (serverInfo?.version) {
        console.debug(`[MCPService] Server version for ${server.name}: ${serverInfo.version}`)
        return serverInfo.version
      }

      return null
    } catch (error) {
      console.error(`[MCPService] Failed to get server version for ${server.name}:`, error)
      return null
    }
  }

  // ── List tools ──

  async listTools(_: Electron.IpcMainInvokeEvent, server: MCPServer): Promise<MCPTool[]> {
    const client = await this.initClient(server)
    try {
      const { tools } = await client.listTools()
      return tools.map((tool) => ({
        id: `${server.name}__${tool.name}`,
        serverId: server.id,
        serverName: server.name,
        name: tool.name,
        description: tool.description,
        inputSchema: (tool.inputSchema ?? {}) as Record<string, unknown>
      }))
    } catch (error) {
      console.error(`[MCPService] Failed to list tools from ${server.name}:`, error)
      throw error
    }
  }

  // ── Call tool ──

  async callTool(
    _: Electron.IpcMainInvokeEvent,
    { server, name, args, callId }: CallToolArgs
  ): Promise<MCPCallToolResponse> {
    const toolCallId = callId || nanoid()
    const abortController = new AbortController()
    this.activeToolCalls.set(toolCallId, abortController)

    try {
      console.debug(`[MCPService] Calling tool ${name} on ${server.name}`, {
        args: redactSensitiveFields(args)
      })

      // Parse string args
      let parsedArgs = args
      if (typeof parsedArgs === 'string') {
        try {
          parsedArgs = JSON.parse(parsedArgs)
        } catch {
          console.error(`[MCPService] Failed to parse args for tool ${name}`)
        }
        if (parsedArgs === '') {
          parsedArgs = {}
        }
      }

      const client = await this.initClient(server)
      const result = await client.callTool(
        { name, arguments: parsedArgs as Record<string, unknown> },
        undefined,
        {
          onprogress: (progress) => {
            const ratio = progress.progress / (progress.total || 1)
            console.debug(`[MCPService] Tool ${name} progress: ${ratio}`)

            const mainWindow = windowService.getMainWindow()
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send(IpcChannel.Mcp_Progress, {
                callId: toolCallId,
                progress: ratio
              } satisfies MCPProgressEvent)
            }
          },
          timeout: server.timeout ? server.timeout * 1000 : 60000,
          resetTimeoutOnProgress: server.longRunning,
          maxTotalTimeout: server.longRunning ? 10 * 60 * 1000 : undefined,
          signal: abortController.signal
        }
      )

      return result as MCPCallToolResponse
    } catch (error) {
      console.error(`[MCPService] Error calling tool ${name} on ${server.name}:`, error)
      throw error
    } finally {
      this.activeToolCalls.delete(toolCallId)
    }
  }

  // ── Abort tool ──

  async abortTool(_: Electron.IpcMainInvokeEvent, callId: string): Promise<boolean> {
    const controller = this.activeToolCalls.get(callId)
    if (controller) {
      controller.abort()
      this.activeToolCalls.delete(callId)
      console.debug(`[MCPService] Aborted tool call: ${callId}`)
      return true
    }
    console.warn(`[MCPService] No active tool call found for: ${callId}`)
    return false
  }

  // ── List prompts ──

  async listPrompts(_: Electron.IpcMainInvokeEvent, server: MCPServer): Promise<MCPPrompt[]> {
    const client = await this.initClient(server)
    try {
      const { prompts } = await client.listPrompts()
      return prompts.map((prompt) => ({
        id: `p${nanoid()}`,
        name: prompt.name,
        description: prompt.description,
        arguments: prompt.arguments?.map((arg) => ({
          name: arg.name,
          description: arg.description,
          required: arg.required
        })),
        serverId: server.id,
        serverName: server.name
      }))
    } catch (error: unknown) {
      // -32601 = method not found — server doesn't support prompts
      if (error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === -32601) {
        return []
      }
      console.error(`[MCPService] Failed to list prompts from ${server.name}:`, error)
      return []
    }
  }

  // ── Get prompt ──

  async getPrompt(
    _: Electron.IpcMainInvokeEvent,
    { server, name, args }: { server: MCPServer; name: string; args?: Record<string, string> }
  ): Promise<GetPromptResult> {
    console.debug(`[MCPService] Getting prompt ${name} from ${server.name}`)
    const client = await this.initClient(server)
    return await client.getPrompt({ name, arguments: args })
  }

  // ── List resources ──

  async listResources(_: Electron.IpcMainInvokeEvent, server: MCPServer): Promise<MCPResource[]> {
    const client = await this.initClient(server)
    try {
      const result = await client.listResources()
      const resources = result.resources || []
      return (Array.isArray(resources) ? resources : []).map((resource) => ({
        ...resource,
        serverId: server.id,
        serverName: server.name
      }))
    } catch (error: unknown) {
      // -32601 = method not found — server doesn't support resources
      if (error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === -32601) {
        return []
      }
      console.error(`[MCPService] Failed to list resources from ${server.name}:`, error)
      return []
    }
  }

  // ── Get resource ──

  async getResource(
    _: Electron.IpcMainInvokeEvent,
    { server, uri }: { server: MCPServer; uri: string }
  ): Promise<GetResourceResponse> {
    console.debug(`[MCPService] Getting resource ${uri} from ${server.name}`)
    const client = await this.initClient(server)
    try {
      const result = await client.readResource({ uri })
      const contents: MCPResource[] = []
      if (result.contents?.length) {
        for (const content of result.contents) {
          contents.push({
            ...(content as unknown as MCPResource),
            serverId: server.id,
            serverName: server.name
          })
        }
      }
      return { contents }
    } catch (error) {
      console.error(`[MCPService] Failed to get resource ${uri} from ${server.name}:`, error)
      throw new Error(`Failed to get resource ${uri} from server ${server.name}: ${(error as Error).message}`)
    }
  }

  // ── Cleanup on app quit ──

  async cleanup(): Promise<void> {
    console.debug('[MCPService] Cleaning up all clients...')
    const keys = [...this.clients.keys()]
    for (const key of keys) {
      try {
        await this.closeClient(key)
      } catch (error) {
        console.error(`[MCPService] Failed to close client during cleanup:`, error)
      }
    }
    this.serverLogs.clearAll()
  }
}

// Export singleton instance
export const mcpService = MCPService.getInstance()
export default mcpService
