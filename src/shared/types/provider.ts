import { z } from 'zod'

// --- Provider Type ---
export const ProviderTypeSchema = z.enum([
  'openai',
  'openai-response',
  'anthropic',
  'gemini',
  'azure-openai',
  'vertexai',
  'mistral',
  'aws-bedrock',
  'vertex-anthropic',
  'new-api',
  'gateway',
  'ollama'
])
export type ProviderType = z.infer<typeof ProviderTypeSchema>

// --- Endpoint Type ---
export const EndpointTypeSchema = z.enum([
  'openai',
  'openai-response',
  'anthropic',
  'gemini',
  'image-generation',
  'jina-rerank'
])
export type EndpointType = z.infer<typeof EndpointTypeSchema>

// --- Model Type (capability) ---
export const ModelTypeSchema = z.enum([
  'text',
  'vision',
  'embedding',
  'reasoning',
  'function_calling',
  'web_search',
  'rerank'
])
export type ModelType = z.infer<typeof ModelTypeSchema>

// --- Model Capability ---
export interface ModelCapability {
  type: ModelType
  isUserSelected?: boolean
}

// --- Model Pricing ---
export interface ModelPricing {
  input_per_million_tokens: number
  output_per_million_tokens: number
  currencySymbol?: string
}

// --- Model ---
export interface Model {
  id: string
  provider: string
  name: string
  group: string
  owned_by?: string
  capabilities: ModelCapability[]
  endpoint_type: EndpointType
  pricing?: ModelPricing
  enabled: boolean
}

// --- Provider API Options ---
export interface ProviderApiOptions {
  isNotSupportArrayContent?: boolean
  isNotSupportStreamOptions?: boolean
  isSupportDeveloperRole?: boolean
  isSupportServiceTier?: boolean
  isNotSupportEnableThinking?: boolean
}

// --- Provider ---
export interface Provider {
  id: string
  type: ProviderType
  name: string
  apiKey: string
  apiHost: string
  models: Model[]
  enabled: boolean
  isSystem: boolean
  isAuthed: boolean
  rateLimit?: number
  apiOptions: ProviderApiOptions
  extra_headers: Record<string, string>
  notes: string
  authType: 'apiKey' | 'oauth'
}

// --- Providers that don't require API keys ---
export const NO_API_KEY_PROVIDERS: readonly string[] = [
  'ollama',
  'lmstudio',
  'ovms',
  'gpustack'
] as const

// --- URL Transform Providers ---
export const URL_TRANSFORM_RULES: Record<string, (url: string) => string> = {
  'azure-openai': (url) => url.replace(/\/?$/, '/v1'),
  gemini: (url) => url.replace(/\/?$/, '/openai'),
  ollama: (url) => url.replace(/\/api\/?$/, '')
}
