import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createMistral } from '@ai-sdk/mistral'
import { createAzure } from '@ai-sdk/azure'
import type { Provider, ProviderType } from '../../types/provider'

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
  // Round-robin via simple random selection
  return keys[Math.floor(Math.random() * keys.length)]
}

const STATIC_FACTORIES: Record<string, FactoryFn> = {
  openai: (p) =>
    createOpenAI({
      apiKey: selectApiKey(p.apiKey),
      baseURL: p.apiHost || undefined,
      headers: p.extra_headers
    }),

  'openai-response': (p) =>
    createOpenAI({
      apiKey: selectApiKey(p.apiKey),
      baseURL: p.apiHost || undefined,
      headers: p.extra_headers,
      compatibility: 'strict'
    }),

  anthropic: (p) =>
    createAnthropic({
      apiKey: selectApiKey(p.apiKey),
      baseURL: p.apiHost || undefined,
      headers: p.extra_headers
    }),

  gemini: (p) =>
    createGoogleGenerativeAI({
      apiKey: selectApiKey(p.apiKey),
      baseURL: p.apiHost || undefined,
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
      baseURL: p.apiHost || undefined,
      headers: p.extra_headers
    }),

  // Vertex AI, AWS Bedrock, and vertex-anthropic use OpenAI-compatible
  // endpoints with auth headers injected via IPC
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
      baseURL: p.apiHost || undefined,
      headers: p.extra_headers
    }),

  // Generic OpenAI-compatible endpoints
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
    if (!provider.apiKey && provider.authType !== 'oauth') {
      return { ok: false, error: 'API key is required' }
    }

    const baseUrl = provider.apiHost || 'https://api.openai.com'
    const response = await fetch(`${baseUrl}/v1/models`, {
      headers: {
        Authorization: `Bearer ${selectApiKey(provider.apiKey)}`,
        ...provider.extra_headers
      },
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}: ${response.statusText}` }
    }

    const data = (await response.json()) as { data?: Array<{ id: string }> }
    const models = data.data?.map((m) => m.id) ?? []
    return { ok: true, models }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { ok: false, error: message }
  }
}
