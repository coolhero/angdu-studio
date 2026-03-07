// Provider Options Types (F003)

export interface TypedProviderOptions {
  provider: string
  options: Record<string, unknown>
}

export interface OpenAIProviderOptions {
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  responseFormat?: unknown
  seed?: number
  user?: string
  reasoningEffort?: 'low' | 'medium' | 'high'
  serviceTier?: string
}

export interface AnthropicProviderOptions {
  temperature?: number
  maxTokens?: number
  topP?: number
  topK?: number
  cacheControl?: { type: string }
  thinking?: { type: string; budgetTokens?: number }
}

export interface GoogleProviderOptions {
  temperature?: number
  maxTokens?: number
  topP?: number
  topK?: number
  safetySettings?: unknown[]
  thinkingConfig?: { thinkingBudget?: number }
}

export interface OpenRouterProviderOptions extends OpenAIProviderOptions {
  transforms?: string[]
  route?: string
}

export interface XaiProviderOptions {
  temperature?: number
  maxTokens?: number
  topP?: number
}
