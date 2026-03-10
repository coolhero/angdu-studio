// ── F006-T051: @angdu/hub built-in MCP server ──
// Hub aggregation server that lists all available tools across active servers.

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js'

import { buildToolNameMapping, resolveToolId } from './toolname'
import type { ToolIdentity, ToolNameMapping } from './toolname'

// ── Types ──

interface HubTool {
  id: string
  serverId: string
  serverName: string
  toolName: string
  description?: string
  inputSchema: Record<string, unknown>
  jsName: string
}

// ── Server class ──

export class HubServer {
  public server: Server
  private cachedTools: HubTool[] | null = null

  constructor() {
    this.server = new Server(
      { name: 'hub-server', version: '1.0.0' },
      { capabilities: { tools: {} } }
    )

    this.setupRequestHandlers()
  }

  private setupRequestHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list',
          description: 'List available MCP tools from all active servers. Results are paginated.',
          inputSchema: {
            type: 'object',
            properties: {
              limit: { type: 'number', description: 'Max results to return (default: 30, max: 100)' },
              offset: { type: 'number', description: 'Zero-based offset for pagination (default: 0)' },
              query: { type: 'string', description: 'Optional search query to filter tools by name or description' }
            }
          }
        },
        {
          name: 'inspect',
          description: 'Get a single tool\'s signature and schema. Use before invoke.',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Tool name (camelCase JS name or serverId__toolName)' }
            },
            required: ['name']
          }
        },
        {
          name: 'invoke',
          description: 'Call a single tool with parameters.',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Tool name (camelCase JS name or serverId__toolName)' },
              params: { type: 'object', description: 'Tool parameters' }
            },
            required: ['name']
          }
        }
      ]
    }))

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      if (!args) {
        throw new McpError(ErrorCode.InvalidParams, 'No arguments provided')
      }

      try {
        switch (name) {
          case 'list':
            return this.handleList(args as { limit?: number; offset?: number; query?: string })
          case 'inspect':
            return this.handleInspect(args as { name: string })
          case 'invoke':
            return this.handleInvoke(args as { name: string; params?: Record<string, unknown> })
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`)
        }
      } catch (error) {
        if (error instanceof McpError) throw error
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    })
  }

  /**
   * Register tools from external sources (called by MCPService when aggregating).
   */
  registerTools(tools: Array<{ id: string; serverId: string; serverName: string; name: string; description?: string; inputSchema: Record<string, unknown> }>): void {
    const identities: ToolIdentity[] = tools.map((t) => ({
      id: `${t.serverId}__${t.name}`,
      serverName: t.serverName,
      toolName: t.name
    }))

    const mapping = buildToolNameMapping(identities)

    this.cachedTools = tools.map((t) => {
      const id = `${t.serverId}__${t.name}`
      return {
        id,
        serverId: t.serverId,
        serverName: t.serverName,
        toolName: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
        jsName: mapping.toJs.get(id) ?? id
      }
    }).sort((a, b) => a.id.localeCompare(b.id))
  }

  invalidateCache(): void {
    this.cachedTools = null
  }

  private handleList(input: { limit?: number; offset?: number; query?: string }) {
    const tools = this.cachedTools || []
    const limit = Math.min(Math.max(input.limit || 30, 1), 100)
    const offset = Math.max(input.offset || 0, 0)
    const query = input.query?.toLowerCase()

    let filtered = tools
    if (query) {
      filtered = tools.filter(
        (t) =>
          t.toolName.toLowerCase().includes(query) ||
          t.jsName.toLowerCase().includes(query) ||
          t.serverName.toLowerCase().includes(query) ||
          (t.description?.toLowerCase().includes(query) ?? false)
      )
    }

    const page = filtered.slice(offset, offset + limit)
    const lines = page.map((t) => `${t.jsName} (${t.id}) - ${t.description || 'No description'}`).join('\n')
    const summary = `Showing ${page.length} of ${filtered.length} tools (offset: ${offset})`

    return {
      content: [{ type: 'text', text: `${summary}\n\n${lines || '(no tools found)'}` }]
    }
  }

  private handleInspect(input: { name: string }) {
    if (!input.name || typeof input.name !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'name parameter is required')
    }

    const tools = this.cachedTools || []
    const tool = this.resolveTool(tools, input.name)

    const schema = JSON.stringify(tool.inputSchema, null, 2)
    const text = `/**\n * ${tool.description || 'No description'}\n * Server: ${tool.serverName}\n * ID: ${tool.id}\n */\nasync function ${tool.jsName}(params: ${schema}): Promise<Result>`

    return { content: [{ type: 'text', text }] }
  }

  private handleInvoke(input: { name: string; params?: Record<string, unknown> }) {
    if (!input.name || typeof input.name !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'name parameter is required')
    }

    const tools = this.cachedTools || []
    const tool = this.resolveTool(tools, input.name)

    // In a full implementation, this would delegate to MCPService.callTool.
    // For now, return a helpful message.
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'pending_implementation',
            tool: tool.id,
            jsName: tool.jsName,
            params: input.params || {},
            message: 'Hub invoke delegation to MCPService will be wired in a later phase.'
          }, null, 2)
        }
      ]
    }
  }

  private resolveTool(tools: HubTool[], nameOrId: string): HubTool {
    const identities: ToolIdentity[] = tools.map((t) => ({
      id: t.id,
      serverName: t.serverName,
      toolName: t.toolName
    }))

    const mapping: ToolNameMapping = buildToolNameMapping(identities)
    const resolvedId = resolveToolId(mapping, nameOrId) ?? nameOrId
    const found = tools.find((t) => t.id === resolvedId) ?? tools.find((t) => t.jsName === nameOrId)

    if (!found) {
      throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${nameOrId}`)
    }

    return found
  }
}

export default HubServer
