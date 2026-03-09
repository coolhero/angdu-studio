import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createMistral } from '@ai-sdk/mistral'
import { createAzure } from '@ai-sdk/azure'
import type { Provider, ProviderType } from '../../types/provider'
import { DEFAULT_HOSTS as DEFAULT_HOSTS_IMPORT } from './constants'

// ── Provider SDK Client Type ──

export type ProviderClient = ReturnType<typeof createOpenAI>
  | ReturnType<typeof createAnthropic>
  | ReturnType<typeof createGoogleGenerativeAI>
  | ReturnType<typeof createMistral>
  | ReturnType<typeof createAzure>

// ── Static Mapping: ProviderType → SDK Constructor ──

type FactoryFn = (provider: Provider) => ProviderClient

function selectApiKey(apiKey: string): string {
  const keys = apiKey.split(',').map((k) => k.trim()).filter(Boolean)
  if (keys.length === 0) return ''
  return keys[Math.floor(Math.random() * keys.length)]
}

// Only pass baseURL when user has set a custom host (not the default).
// Each SDK has its own correct default baseURL (e.g. @ai-sdk/anthropic uses
// https://api.anthropic.com/v1, @ai-sdk/openai uses https://api.openai.com/v1).
// Overriding with our DEFAULT_HOSTS (which lack /v1) breaks the SDKs.
function customBaseURL(provider: Provider): string | undefined {
  const defaultHost = DEFAULT_HOSTS_IMPORT[provider.type]
  if (!provider.apiHost || provider.apiHost === defaultHost) return undefined
  return provider.apiHost
}

const STATIC_FACTORIES: Record<string, FactoryFn> = {
  openai: (p) =>
    createOpenAI({
      apiKey: selectApiKey(p.apiKey),
      baseURL: customBaseURL(p),
      headers: p.extra_headers
    }),

  'openai-response': (p) =>
    createOpenAI({
      apiKey: selectApiKey(p.apiKey),
      baseURL: customBaseURL(p),
      headers: p.extra_headers,
      compatibility: 'strict'
    }),

  anthropic: (p) =>
    createAnthropic({
      apiKey: selectApiKey(p.apiKey),
      baseURL: customBaseURL(p),
      headers: p.extra_headers
    }),

  gemini: (p) =>
    createGoogleGenerativeAI({
      apiKey: selectApiKey(p.apiKey),
      baseURL: customBaseURL(p),
      headers: p.extra_headers
    }),

  'azure-openai': (p) =>
    createAzure({
      apiKey: selectApiKey(p.apiKey),
      resourceName: p.apiHost || undefined,
      apiVersion: p.apiVersion
    }),

  mistral: (p) =>
    createMistral({
      apiKey: selectApiKey(p.apiKey),
      baseURL: customBaseURL(p),
      headers: p.extra_headers
    }),

  vertexai: (p) =>
    createOpenAI({
      apiKey: selectApiKey(p.apiKey),
      baseURL: p.apiHost || undefined,
      headers: p.extra_headers
    }),

  'aws-bedrock': (p) =>
    createOpenAI({
      apiKey: selectApiKey(p.apiKey),
      baseURL: p.apiHost || undefined,
      headers: p.extra_headers
    }),

  'vertex-anthropic': (p) =>
    createAnthropic({
      apiKey: selectApiKey(p.apiKey),
      baseURL: customBaseURL(p),
      headers: p.extra_headers
    }),

  'new-api': (p) =>
    createOpenAI({
      apiKey: selectApiKey(p.apiKey),
      baseURL: p.apiHost || undefined,
      headers: p.extra_headers
    }),

  gateway: (p) =>
    createOpenAI({
      apiKey: selectApiKey(p.apiKey),
      baseURL: p.apiHost || undefined,
      headers: p.extra_headers
    }),

  ollama: (p) =>
    createOpenAI({
      apiKey: 'ollama',
      baseURL: `${p.apiHost || 'http://localhost:11434'}/v1`,
      headers: p.extra_headers
    })
}

// ── Alias mapping for alternative type names ──

const ALIAS_MAP: Record<string, ProviderType> = {
  'openai-compatible': 'openai',
  'gpt': 'openai',
  'claude': 'anthropic',
  'google': 'gemini',
  'bedrock': 'aws-bedrock',
  'vertex': 'vertexai',
  'local': 'ollama'
}

// ── Factory Resolution: 3-step chain ──

export function resolveProviderClient(provider: Provider): ProviderClient {
  // Step 1: Static mapping
  const factory = STATIC_FACTORIES[provider.type]
  if (factory) return factory(provider)

  // Step 2: Alias resolution
  const aliasType = ALIAS_MAP[provider.type]
  if (aliasType) {
    const aliasFactory = STATIC_FACTORIES[aliasType]
    if (aliasFactory) return aliasFactory(provider)
  }

  // Step 3: Fallback to OpenAI-compatible
  return STATIC_FACTORIES.openai(provider)
}

// ── Health Check ──

export async function checkProviderHealth(provider: Provider): Promise<{
  ok: boolean
  error?: string
  models?: string[]
}> {
  try {
    const apiKey = selectApiKey(provider.apiKey)
    if (!apiKey && provider.authType !== 'oauth' && provider.type !== 'ollama') {
      return { ok: false, error: 'API key is required' }
    }

    const baseUrl = provider.apiHost || DEFAULT_HOSTS_IMPORT[provider.type] || 'https://api.openai.com'

    // Provider-specific health check endpoints and headers
    let url: string
    let headers: Record<string, string> = { ...provider.extra_headers }

    switch (provider.type) {
      case 'anthropic':
      case 'vertex-anthropic':
        // Anthropic uses /v1/messages — just validate with a minimal request
        url = `${baseUrl}/v1/models`
        headers['x-api-key'] = apiKey
        headers['anthropic-version'] = '2023-06-01'
        break
      case 'gemini': {
        // Google Gemini uses a different endpoint
        url = `${baseUrl}/v1beta/models?key=${apiKey}`
        break
      }
      case 'ollama':
        url = `${baseUrl}/api/tags`
        break
      default:
        // OpenAI-compatible: /v1/models
        url = `${baseUrl}/v1/models`
        headers['Authorization'] = `Bearer ${apiKey}`
        break
    }

    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      const detail = body.length > 200 ? body.substring(0, 200) + '...' : body
      return { ok: false, error: `HTTP ${response.status}: ${response.statusText}${detail ? ' — ' + detail : ''}` }
    }

    // Parse models from response
    const data = await response.json()
    let models: string[] = []

    if (provider.type === 'gemini') {
      // Gemini returns { models: [{ name: "models/gemini-pro" }] }
      const geminiModels = data?.models as Array<{ name: string }> | undefined
      models = geminiModels?.map((m) => m.name.replace('models/', '')) ?? []
    } else if (provider.type === 'ollama') {
      // Ollama returns { models: [{ name: "llama3" }] }
      const ollamaModels = data?.models as Array<{ name: string }> | undefined
      models = ollamaModels?.map((m) => m.name) ?? []
    } else {
      // OpenAI-compatible and Anthropic return { data: [{ id: "gpt-4" }] }
      const openaiModels = data?.data as Array<{ id: string }> | undefined
      models = openaiModels?.map((m) => m.id) ?? []
    }

    return { ok: true, models }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { ok: false, error: message }
  }
}
