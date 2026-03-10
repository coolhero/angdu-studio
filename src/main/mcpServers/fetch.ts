// ── F006-T043: @angdu/fetch built-in MCP server ──
// Provides HTTP fetch tools: fetch (GET/POST) and fetchPage (extract text content).

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js'
import { net } from 'electron'

// ── Fetch helper ──

async function doFetch(url: string, options: {
  method?: string
  headers?: Record<string, string>
  body?: string
} = {}): Promise<Response> {
  const response = await net.fetch(url, {
    method: options.method || 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; AngduStudio/1.0)',
      ...options.headers
    },
    ...(options.body ? { body: options.body } : {})
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return response
}

// ── Extract readable text from HTML ──

function extractTextFromHtml(html: string): string {
  // Strip script and style tags and their content
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  // Strip HTML tags
  text = text.replace(/<[^>]+>/g, ' ')
  // Decode common HTML entities
  text = text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim()
  return text
}

// ── Server class ──

class FetchServer {
  public server: Server

  constructor() {
    this.server = new Server(
      { name: 'fetch-server', version: '1.0.0' },
      { capabilities: { tools: {} } }
    )

    this.initialize()
  }

  private initialize(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'fetch',
          description: 'Make an HTTP request (GET or POST) and return the response body as text or JSON.',
          inputSchema: {
            type: 'object',
            properties: {
              url: { type: 'string', description: 'URL to fetch' },
              method: { type: 'string', description: 'HTTP method (GET or POST)', default: 'GET' },
              headers: { type: 'object', description: 'Optional HTTP headers', additionalProperties: { type: 'string' } },
              body: { type: 'string', description: 'Request body (for POST)' }
            },
            required: ['url']
          }
        },
        {
          name: 'fetch_page',
          description: 'Fetch a web page and extract its text content (strips HTML tags, scripts, and styles).',
          inputSchema: {
            type: 'object',
            properties: {
              url: { type: 'string', description: 'URL of the web page to fetch' },
              headers: { type: 'object', description: 'Optional HTTP headers', additionalProperties: { type: 'string' } }
            },
            required: ['url']
          }
        }
      ]
    }))

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      if (!args || typeof args.url !== 'string') {
        throw new McpError(ErrorCode.InvalidParams, 'url parameter is required')
      }

      try {
        switch (name) {
          case 'fetch': {
            const response = await doFetch(args.url as string, {
              method: (args.method as string) || 'GET',
              headers: args.headers as Record<string, string> | undefined,
              body: args.body as string | undefined
            })
            const text = await response.text()
            return { content: [{ type: 'text', text }] }
          }
          case 'fetch_page': {
            const response = await doFetch(args.url as string, {
              headers: args.headers as Record<string, string> | undefined
            })
            const html = await response.text()
            const text = extractTextFromHtml(html)
            return { content: [{ type: 'text', text }] }
          }
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`)
        }
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true
        }
      }
    })
  }
}

export default FetchServer
