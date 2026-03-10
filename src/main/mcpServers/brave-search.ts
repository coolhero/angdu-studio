// ── F006-T046: @angdu/brave-search built-in MCP server ──
// Brave Search API integration: web search and local search.

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { net } from 'electron'

// ── Tool definitions ──

const WEB_SEARCH_TOOL: Tool = {
  name: 'brave_web_search',
  description:
    'Performs a web search using the Brave Search API. ' +
    'Supports pagination, content filtering, and freshness controls. ' +
    'Maximum 20 results per request.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query (max 400 chars, 50 words)' },
      count: { type: 'number', description: 'Number of results (1-20, default 10)', default: 10 },
      offset: { type: 'number', description: 'Pagination offset (max 9, default 0)', default: 0 }
    },
    required: ['query']
  }
}

const LOCAL_SEARCH_TOOL: Tool = {
  name: 'brave_local_search',
  description:
    'Searches for local businesses and places using Brave Local Search API. ' +
    'Returns business names, addresses, ratings, phone numbers, and hours. ' +
    'Falls back to web search if no local results found.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: "Local search query (e.g. 'pizza near Central Park')" },
      count: { type: 'number', description: 'Number of results (1-20, default 5)', default: 5 }
    },
    required: ['query']
  }
}

// ── Rate limiter ──

const RATE_LIMIT = { perSecond: 1, perMonth: 15000 }
const requestCount = { second: 0, month: 0, lastReset: Date.now() }

function checkRateLimit(): void {
  const now = Date.now()
  if (now - requestCount.lastReset > 1000) {
    requestCount.second = 0
    requestCount.lastReset = now
  }
  if (requestCount.second >= RATE_LIMIT.perSecond || requestCount.month >= RATE_LIMIT.perMonth) {
    throw new Error('Rate limit exceeded')
  }
  requestCount.second++
  requestCount.month++
}

// ── API types ──

interface BraveWeb {
  web?: { results?: Array<{ title: string; description: string; url: string }> }
  locations?: { results?: Array<{ id: string; title?: string }> }
}

interface BraveLocation {
  id: string
  name: string
  address: { streetAddress?: string; addressLocality?: string; addressRegion?: string; postalCode?: string }
  phone?: string
  rating?: { ratingValue?: number; ratingCount?: number }
  openingHours?: string[]
  priceRange?: string
}

interface BravePoiResponse { results: BraveLocation[] }
interface BraveDescription { descriptions: Record<string, string> }

// ── API helpers ──

async function braveApiFetch(apiKey: string, url: URL): Promise<unknown> {
  checkRateLimit()
  const response = await net.fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': apiKey
    }
  })
  if (!response.ok) {
    throw new Error(`Brave API error: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

async function performWebSearch(apiKey: string, query: string, count = 10, offset = 0): Promise<string> {
  const url = new URL('https://api.search.brave.com/res/v1/web/search')
  url.searchParams.set('q', query)
  url.searchParams.set('count', Math.min(count, 20).toString())
  url.searchParams.set('offset', offset.toString())

  const data = await braveApiFetch(apiKey, url) as BraveWeb
  const results = (data.web?.results || []).map((r) => ({
    title: r.title || '',
    description: r.description || '',
    url: r.url || ''
  }))

  return results.map((r) => `Title: ${r.title}\nDescription: ${r.description}\nURL: ${r.url}`).join('\n\n') || 'No results found'
}

async function performLocalSearch(apiKey: string, query: string, count = 5): Promise<string> {
  const webUrl = new URL('https://api.search.brave.com/res/v1/web/search')
  webUrl.searchParams.set('q', query)
  webUrl.searchParams.set('search_lang', 'en')
  webUrl.searchParams.set('result_filter', 'locations')
  webUrl.searchParams.set('count', Math.min(count, 20).toString())

  const webData = await braveApiFetch(apiKey, webUrl) as BraveWeb
  const locationIds = webData.locations?.results?.filter((r) => r.id != null).map((r) => r.id) || []

  if (locationIds.length === 0) {
    return performWebSearch(apiKey, query, count)
  }

  // Fetch POI details and descriptions in parallel
  const poisUrl = new URL('https://api.search.brave.com/res/v1/local/pois')
  locationIds.filter(Boolean).forEach((id) => poisUrl.searchParams.append('ids', id))

  const descUrl = new URL('https://api.search.brave.com/res/v1/local/descriptions')
  locationIds.filter(Boolean).forEach((id) => descUrl.searchParams.append('ids', id))

  const [poisData, descData] = await Promise.all([
    braveApiFetch(apiKey, poisUrl) as Promise<BravePoiResponse>,
    braveApiFetch(apiKey, descUrl) as Promise<BraveDescription>
  ])

  return (poisData.results || []).map((poi) => {
    const address = [poi.address?.streetAddress, poi.address?.addressLocality, poi.address?.addressRegion, poi.address?.postalCode]
      .filter(Boolean).join(', ') || 'N/A'

    return `Name: ${poi.name}\nAddress: ${address}\nPhone: ${poi.phone || 'N/A'}\nRating: ${poi.rating?.ratingValue ?? 'N/A'} (${poi.rating?.ratingCount ?? 0} reviews)\nPrice Range: ${poi.priceRange || 'N/A'}\nHours: ${(poi.openingHours || []).join(', ') || 'N/A'}\nDescription: ${descData.descriptions[poi.id] || 'No description'}`
  }).join('\n---\n') || 'No local results found'
}

// ── Server class ──

class BraveSearchServer {
  public server: Server
  private apiKey: string

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('BRAVE_API_KEY is required for Brave Search MCP server')
    }
    this.apiKey = apiKey

    this.server = new Server(
      { name: 'brave-search-server', version: '0.1.0' },
      { capabilities: { tools: {} } }
    )

    this.initialize()
  }

  private initialize(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [WEB_SEARCH_TOOL, LOCAL_SEARCH_TOOL]
    }))

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params
        if (!args || typeof args.query !== 'string') {
          throw new Error('query parameter is required')
        }

        switch (name) {
          case 'brave_web_search': {
            const results = await performWebSearch(this.apiKey, args.query as string, (args.count as number) || 10, (args.offset as number) || 0)
            return { content: [{ type: 'text', text: results }] }
          }
          case 'brave_local_search': {
            const results = await performLocalSearch(this.apiKey, args.query as string, (args.count as number) || 5)
            return { content: [{ type: 'text', text: results }] }
          }
          default:
            return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true }
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

export default BraveSearchServer
