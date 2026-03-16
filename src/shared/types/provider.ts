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

// --- Non-chat model ID patterns (embedding, tts, whisper, moderation, dall-e, etc.) ---
const NON_CHAT_MODEL_PATTERNS = [
  /^text-embedding/i,
  /^embedding/i,
  /^tts-/i,
  /^whisper/i,
  /^dall-e/i,
  /^davinci/i,
  /^babbage/i,
  /^curie/i,
  /^ada(?!-)/i, // ada but not ada- (which could be a chat model prefix)
  /moderation/i,
  /^text-search/i,
  /^text-similarity/i,
  /^code-search/i,
  /rerank/i
]

/** Check if a model ID looks like a chat-capable model */
export function isChatCapableModel(modelId: string): boolean {
  return !NON_CHAT_MODEL_PATTERNS.some((pattern) => pattern.test(modelId))
}

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
