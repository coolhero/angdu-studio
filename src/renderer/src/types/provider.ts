// ── Provider Type Enum ──

export type ProviderType =
  | 'openai'
  | 'openai-response'
  | 'anthropic'
  | 'gemini'
  | 'azure-openai'
  | 'vertexai'
  | 'mistral'
  | 'aws-bedrock'
  | 'vertex-anthropic'
  | 'new-api'
  | 'gateway'
  | 'ollama'

// ── Model Capability Enum ──

export type ModelCapability =
  | 'vision'
  | 'embedding'
  | 'reasoning'
  | 'function_calling'
  | 'web_search'
  | 'rerank'

// ── Endpoint Type ──

export type EndpointType =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'image-generation'
  | 'jina-rerank'

// ── Service Tier ──

export type ServiceTier = 'auto' | 'default' | 'flex'

// ── Model Pricing ──

export interface ModelPricing {
  input: number
  output: number
  cachedInput?: number
}

// ── Provider API Options ──

export interface ProviderApiOptions {
  streamOutput?: boolean
  functionCalling?: boolean
  vision?: boolean
  webSearch?: boolean
  reasoning?: boolean
}

// ── Anthropic Cache Control Settings ──

export interface AnthropicCacheControlSettings {
  enabled: boolean
  cacheType: 'ephemeral'
}

// ── Model ──

export interface Model {
  id: string
  provider: string
  name: string
  group: string
  owned_by?: string
  description?: string
  capabilities?: ModelCapability[]
  pricing?: ModelPricing
  endpoint_type?: EndpointType
  supported_endpoint_types?: EndpointType[]
}

// ── Provider ──

export interface Provider {
  id: string
  type: ProviderType
  name: string
  apiKey: string
  apiHost: string
  apiVersion?: string
  models: Model[]
  enabled?: boolean
  isSystem?: boolean
  isAuthed?: boolean
  rateLimit?: number
  apiOptions?: ProviderApiOptions
  serviceTier?: ServiceTier
  authType?: 'apiKey' | 'oauth'
  notes?: string
  extra_headers?: Record<string, string>
  anthropicCacheControl?: AnthropicCacheControlSettings
}

// ── LLM Settings ──

export interface LlmSettings {
  vertexai?: {
    projectId: string
    location: string
    serviceAccountKey?: string
  }
  awsBedrock?: {
    accessKeyId: string
    secretAccessKey: string
    region: string
    authMode: 'accessKey' | 'iam' | 'apiKey'
  }
  angduIn?: {
    accessToken?: string
    refreshToken?: string
  }
  ollama?: {
    keepAlive?: number
  }
}

// ── Provider Store State ──

export interface ProviderStoreState {
  providers: Provider[]
  defaultModel?: Model
  quickModel?: Model
  translateModel?: Model
  settings: LlmSettings

  addProvider: (provider: Provider) => void
  updateProvider: (id: string, updates: Partial<Provider>) => void
  removeProvider: (id: string) => void
  reorderProviders: (ids: string[]) => void
  setEnabled: (id: string, enabled: boolean) => void

  addModel: (providerId: string, model: Model) => void
  removeModel: (providerId: string, modelId: string) => void
  updateModel: (providerId: string, modelId: string, updates: Partial<Model>) => void

  setDefaultModel: (model: Model | undefined) => void
  setQuickModel: (model: Model | undefined) => void
  setTranslateModel: (model: Model | undefined) => void

  updateSettings: (updates: Partial<LlmSettings>) => void
}
