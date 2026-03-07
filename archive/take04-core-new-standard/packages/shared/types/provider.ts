// Provider Management Types (F002)

// ── Provider Type (12 API protocol types) ──

export const PROVIDER_TYPES = [
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
] as const

export type ProviderType = (typeof PROVIDER_TYPES)[number]

// ── System Provider IDs ──

export const SYSTEM_PROVIDER_IDS = [
  'cherryin',
  'silicon',
  'aihubmix',
  'ocoolai',
  'deepseek',
  'ppio',
  'alayanew',
  'qiniu',
  'dmxapi',
  'burncloud',
  'tokenflux',
  '302ai',
  'cephalon',
  'lanyun',
  'ph8',
  'openrouter',
  'ollama',
  'ovms',
  'new-api',
  'lmstudio',
  'anthropic',
  'openai',
  'azure-openai',
  'gemini',
  'vertexai',
  'github',
  'copilot',
  'zhipu',
  'yi',
  'moonshot',
  'baichuan',
  'dashscope',
  'stepfun',
  'doubao',
  'infini',
  'minimax',
  'groq',
  'together',
  'fireworks',
  'nvidia',
  'grok',
  'hyperbolic',
  'mistral',
  'jina',
  'perplexity',
  'modelscope',
  'xirang',
  'hunyuan',
  'zhinao',
  'gitee-ai',
  'o3',
  'tencent-cloud-ti',
  'baidu-cloud',
  'gpustack',
  'voyageai',
  'aws-bedrock',
  'poe',
  'aionly',
  'longcat',
  'huggingface',
  'sophnet',
  'gateway',
  'cerebras',
  'mimo'
] as const

export type SystemProviderId = (typeof SYSTEM_PROVIDER_IDS)[number]

// ── Model Capability ──

export type ModelCapability = 'vision' | 'embedding' | 'reasoning' | 'function_calling' | 'web_search' | 'rerank'

// ── Endpoint Type ──

export type EndpointType = 'openai' | 'openai-response' | 'anthropic' | 'gemini' | 'image-generation' | 'jina-rerank'

// ── Model Pricing ──

export interface ModelPricing {
  input_per_million_tokens: number
  output_per_million_tokens: number
  currencySymbol?: string
}

// ── Model ──

export interface Model {
  id: string
  name: string
  provider: string
  group?: string
  owned_by?: string
  description?: string
  capabilities?: ModelCapability[]
  pricing?: ModelPricing
  endpoint_type?: EndpointType
  supported_endpoint_types?: EndpointType[]
  maxTokens?: number
  contextWindow?: number
}

// ── Provider API Options ──

export interface ProviderApiOptions {
  isNotSupportArrayContent?: boolean
  isNotSupportStreamOptions?: boolean
  isSupportDeveloperRole?: boolean
  isSupportServiceTier?: boolean
  isNotSupportEnableThinking?: boolean
  isNotSupportAPIVersion?: boolean
  isNotSupportVerbosity?: boolean
}

// ── Service Tiers ──

export type OpenAIServiceTier = 'auto' | 'default' | 'flex'
export type GroqServiceTier = 'auto' | 'on_demand'
export type ServiceTier = OpenAIServiceTier | GroqServiceTier

// ── Verbosity ──

export type OpenAIVerbosity = 'auto' | 'short' | 'medium' | 'long'

// ── Auth Types ──

export type ProviderAuthType = 'apiKey' | 'oauth'
export type AwsBedrockAuthType = 'iam' | 'apiKey'

// ── Anthropic Cache Control ──

export interface AnthropicCacheControlSettings {
  enabled?: boolean
  systemPrompt?: boolean
  history?: boolean
}

// ── Provider ──

export interface Provider {
  id: string
  name: string
  type: ProviderType
  apiKey: string
  apiHost: string
  anthropicApiHost?: string
  apiVersion?: string
  models: Model[]
  enabled?: boolean
  isSystem?: boolean
  isAuthed?: boolean
  rateLimit?: number
  apiOptions?: ProviderApiOptions
  serviceTier?: ServiceTier
  verbosity?: OpenAIVerbosity
  authType?: ProviderAuthType
  isVertex?: boolean
  notes?: string
  extra_headers?: Record<string, string>
  anthropicCacheControl?: AnthropicCacheControlSettings
}

// ── System Provider (extended for config) ──

export interface SystemProvider extends Provider {
  id: SystemProviderId
  isSystem: true
}

// ── LLM Settings (per-provider settings) ──

export interface KeepAliveSettings {
  keepAliveTime: number
}

export interface VertexAISettings {
  serviceAccount: {
    privateKey: string
    clientEmail: string
  }
  projectId: string
  location: string
}

export interface AwsBedrockSettings {
  authType: AwsBedrockAuthType
  accessKeyId: string
  secretAccessKey: string
  apiKey: string
  region: string
}

export interface CherryInTokenSettings {
  accessToken: string
  refreshToken: string
}

export interface LlmSettings {
  ollama: KeepAliveSettings
  lmstudio: KeepAliveSettings
  gpustack: KeepAliveSettings
  vertexai: VertexAISettings
  awsBedrock: AwsBedrockSettings
  cherryIn: CherryInTokenSettings
}

// ── LLM Store State ──

export interface LlmState {
  providers: Provider[]
  defaultModel: Model
  topicNamingModel: Model
  quickModel: Model
  translateModel: Model
  settings: LlmSettings
}

// ── Type Guard ──

const systemProviderIdSet = new Set<string>(SYSTEM_PROVIDER_IDS)

export function isSystemProvider(provider: Provider): provider is SystemProvider {
  return systemProviderIdSet.has(provider.id) && provider.isSystem === true
}

// ── Connectivity Check Result ──

export interface ConnectivityResult {
  ok: boolean
  error?: string
  models?: Model[]
}
