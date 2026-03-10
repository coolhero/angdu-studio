// ── F006-T049: @angdu/dify-knowledge built-in MCP server ──
// Dify Knowledge Base API integration: search and list datasets.

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js'
import { net } from 'electron'

// ── Types ──

interface DifySearchResponse {
  query: { content: string }
  records: Array<{
    segment: {
      id: string
      position: number
      document_id: string
      content: string
      keywords: string[]
      document?: { id: string; data_source_type: string; name: string }
    }
    score: number
  }>
}

// ── Server class ──

class DifyKnowledgeServer {
  public server: Server
  private difyKey: string
  private apiHost: string

  constructor(difyKey: string, args: string[]) {
    if (args.length === 0) {
      throw new Error('DifyKnowledgeServer requires at least one argument (API host URL)')
    }
    this.difyKey = difyKey
    this.apiHost = args[0]

    this.server = new Server(
      { name: '@angdu/dify-knowledge-server', version: '0.1.0' },
      { capabilities: { tools: {} } }
    )

    this.initialize()
  }

  private initialize(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_datasets',
          description: 'List all available knowledge base datasets.',
          inputSchema: { type: 'object', properties: {} }
        },
        {
          name: 'search_knowledge',
          description: 'Search a knowledge base by dataset ID and query string.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Knowledge base dataset ID' },
              query: { type: 'string', description: 'Search query' },
              topK: { type: 'number', description: 'Number of top results (default: 6)' }
            },
            required: ['id', 'query']
          }
        }
      ]
    }))

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params

        switch (name) {
          case 'list_datasets':
            return await this.handleListDatasets()
          case 'search_knowledge': {
            if (!args || typeof args.id !== 'string' || typeof args.query !== 'string') {
              throw new McpError(ErrorCode.InvalidParams, 'id and query parameters are required')
            }
            return await this.handleSearchKnowledge(
              args.id as string,
              args.query as string,
              (args.topK as number) || 6
            )
          }
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`)
        }
      } catch (error) {
        if (error instanceof McpError) throw error
        return {
          content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true
        }
      }
    })
  }

  private async handleListDatasets() {
    const url = `${this.apiHost.replace(/\/$/, '')}/datasets`
    const response = await net.fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${this.difyKey}` }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API request failed (${response.status}): ${errorText}`)
    }

    const apiResponse = (await response.json()) as { data?: Array<{ id: string; name: string; description?: string }> }
    const datasets = apiResponse?.data?.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description || ''
    })) || []

    const text = datasets.length > 0
      ? datasets.map((d) => `- **${d.name}** (ID: ${d.id})\n  ${d.description || 'No description'}`).join('\n')
      : 'No datasets found.'

    return { content: [{ type: 'text', text: `### Available Knowledge Bases:\n\n${text}` }] }
  }

  private async handleSearchKnowledge(id: string, query: string, topK: number) {
    const url = `${this.apiHost.replace(/\/$/, '')}/datasets/${id}/retrieve`
    const response = await net.fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.difyKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        retrieval_model: {
          top_k: topK,
          reranking_enable: null,
          score_threshold_enabled: null
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API request failed (${response.status}): ${errorText}`)
    }

    const data = (await response.json()) as DifySearchResponse

    if (!data || !Array.isArray(data.records)) {
      throw new Error('Invalid response format from Dify API')
    }

    if (data.records.length === 0) {
      return { content: [{ type: 'text', text: `### Query: ${query}\n\nNo results found.` }] }
    }

    const resultsText = data.records.map((record, i) => {
      const docName = record.segment.document?.name || 'Unknown Document'
      const content = record.segment.content.trim()
      const score = (record.score * 100).toFixed(1)
      const keywords = record.segment.keywords || []
      let entry = `#### ${i + 1}. ${docName} (Relevance: ${score}%)\n${content}`
      if (keywords.length > 0) {
        entry += `\n*Keywords: ${keywords.join(', ')}*`
      }
      return entry
    }).join('\n\n')

    return {
      content: [{ type: 'text', text: `### Query: ${query}\n\nFound ${data.records.length} results:\n\n${resultsText}` }]
    }
  }
}

export default DifyKnowledgeServer
