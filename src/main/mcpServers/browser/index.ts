// ── F006-T047: @angdu/browser built-in MCP server ──
// Placeholder/scaffold with basic browser automation tool stubs.
// Full Puppeteer/Playwright integration is planned for a later phase.

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js'

const STUB_MESSAGE = 'Browser automation is not yet fully implemented. This is a placeholder server. Full Puppeteer/Playwright integration will be available in a future release.'

class BrowserServer {
  public server: Server

  constructor() {
    this.server = new Server(
      { name: 'browser-server', version: '0.1.0' },
      { capabilities: { tools: {} } }
    )

    this.setupRequestHandlers()
  }

  private setupRequestHandlers(): void {
    const tools = [
      {
        name: 'navigate',
        description: 'Navigate to a URL in the browser. (Stub - not yet implemented)',
        inputSchema: {
          type: 'object' as const,
          properties: { url: { type: 'string', description: 'URL to navigate to' } },
          required: ['url']
        }
      },
      {
        name: 'screenshot',
        description: 'Take a screenshot of the current browser page. (Stub - not yet implemented)',
        inputSchema: {
          type: 'object' as const,
          properties: { selector: { type: 'string', description: 'Optional CSS selector to screenshot' } }
        }
      },
      {
        name: 'click',
        description: 'Click an element on the page. (Stub - not yet implemented)',
        inputSchema: {
          type: 'object' as const,
          properties: { selector: { type: 'string', description: 'CSS selector of element to click' } },
          required: ['selector']
        }
      },
      {
        name: 'fill',
        description: 'Fill a form field with text. (Stub - not yet implemented)',
        inputSchema: {
          type: 'object' as const,
          properties: {
            selector: { type: 'string', description: 'CSS selector of the input field' },
            value: { type: 'string', description: 'Value to fill in' }
          },
          required: ['selector', 'value']
        }
      },
      {
        name: 'evaluate',
        description: 'Evaluate JavaScript in the browser context. (Stub - not yet implemented)',
        inputSchema: {
          type: 'object' as const,
          properties: { script: { type: 'string', description: 'JavaScript code to evaluate' } },
          required: ['script']
        }
      }
    ]

    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }))

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name } = request.params
      const knownTools = tools.map((t) => t.name)

      if (!knownTools.includes(name)) {
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`)
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              tool: name,
              status: 'stub',
              message: STUB_MESSAGE,
              args: request.params.arguments
            }, null, 2)
          }
        ]
      }
    })
  }
}

export { BrowserServer }
export default BrowserServer
