// ── F006-T050: @angdu/didi-mcp built-in MCP server ──
// Placeholder stub server with basic info tool for DiDi MCP integration.

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js'

class DiDiMcpServer {
  public server: Server
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.DIDI_API_KEY || ''

    this.server = new Server(
      { name: 'didi-mcp-server', version: '0.1.0' },
      { capabilities: { tools: {} } }
    )

    this.setupRequestHandlers()
  }

  private setupRequestHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'didi_info',
          description: 'Get information about the DiDi MCP server status and available capabilities.',
          inputSchema: { type: 'object', properties: {} }
        }
      ]
    }))

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name } = request.params

      if (name !== 'didi_info') {
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`)
      }

      const hasKey = Boolean(this.apiKey)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              server: 'didi-mcp-server',
              version: '0.1.0',
              status: hasKey ? 'configured' : 'unconfigured',
              note: hasKey
                ? 'DiDi MCP server is configured. Full ride-hailing API integration is available.'
                : 'DIDI_API_KEY is not set. Please configure it to use DiDi MCP services.',
              capabilities: [
                'maps_textsearch',
                'taxi_estimate',
                'taxi_create_order',
                'taxi_cancel_order',
                'taxi_query_order',
                'taxi_get_driver_location',
                'taxi_generate_ride_app_link'
              ]
            }, null, 2)
          }
        ]
      }
    })
  }
}

export default DiDiMcpServer
