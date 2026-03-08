import type { ProviderType } from '../../types/provider'

export const DEFAULT_HOSTS: Record<ProviderType, string> = {
  openai: 'https://api.openai.com',
  'openai-response': 'https://api.openai.com',
  anthropic: 'https://api.anthropic.com',
  gemini: 'https://generativelanguage.googleapis.com',
  'azure-openai': '',
  vertexai: '',
  mistral: 'https://api.mistral.ai',
  'aws-bedrock': '',
  'vertex-anthropic': '',
  'new-api': '',
  gateway: '',
  ollama: 'http://localhost:11434'
}

export const PROVIDER_DISPLAY_NAMES: Record<ProviderType, string> = {
  openai: 'OpenAI',
  'openai-response': 'OpenAI (Response API)',
  anthropic: 'Anthropic',
  gemini: 'Google Gemini',
  'azure-openai': 'Azure OpenAI',
  vertexai: 'Vertex AI',
  mistral: 'Mistral AI',
  'aws-bedrock': 'AWS Bedrock',
  'vertex-anthropic': 'Vertex AI (Anthropic)',
  'new-api': 'New API',
  gateway: 'API Gateway',
  ollama: 'Ollama'
}

export const ANTHROPIC_BETA_HEADERS = {
  promptCaching: 'prompt-caching-2024-07-31',
  computerUse: 'computer-use-2024-10-22',
  extendedThinking: 'extended-thinking-2025-04-11',
  tokenCounting: 'token-counting-2024-11-01'
} as const

export const FILE_SIZE_LIMITS: Partial<Record<ProviderType, number>> = {
  anthropic: 32 * 1024 * 1024, // 32MB
  gemini: 20 * 1024 * 1024 // 20MB inline
} as const
