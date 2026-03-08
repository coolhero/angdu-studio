import type { ProviderType } from '../../types/provider'
import { DEFAULT_HOSTS } from './constants'

export interface ProviderConfigEntry {
  defaultHost: string
  requiresApiKey: boolean
  supportsStreaming: boolean
  authType: 'apiKey' | 'oauth' | 'none'
}

const PROVIDER_CONFIGS: Record<ProviderType, ProviderConfigEntry> = {
  openai: { defaultHost: DEFAULT_HOSTS.openai, requiresApiKey: true, supportsStreaming: true, authType: 'apiKey' },
  'openai-response': { defaultHost: DEFAULT_HOSTS['openai-response'], requiresApiKey: true, supportsStreaming: true, authType: 'apiKey' },
  anthropic: { defaultHost: DEFAULT_HOSTS.anthropic, requiresApiKey: true, supportsStreaming: true, authType: 'apiKey' },
  gemini: { defaultHost: DEFAULT_HOSTS.gemini, requiresApiKey: true, supportsStreaming: true, authType: 'apiKey' },
  'azure-openai': { defaultHost: '', requiresApiKey: true, supportsStreaming: true, authType: 'apiKey' },
  vertexai: { defaultHost: '', requiresApiKey: false, supportsStreaming: true, authType: 'oauth' },
  mistral: { defaultHost: DEFAULT_HOSTS.mistral, requiresApiKey: true, supportsStreaming: true, authType: 'apiKey' },
  'aws-bedrock': { defaultHost: '', requiresApiKey: false, supportsStreaming: true, authType: 'oauth' },
  'vertex-anthropic': { defaultHost: '', requiresApiKey: false, supportsStreaming: true, authType: 'oauth' },
  'new-api': { defaultHost: '', requiresApiKey: true, supportsStreaming: true, authType: 'apiKey' },
  gateway: { defaultHost: '', requiresApiKey: true, supportsStreaming: true, authType: 'apiKey' },
  ollama: { defaultHost: DEFAULT_HOSTS.ollama, requiresApiKey: false, supportsStreaming: true, authType: 'none' }
}

export function getProviderConfig(type: ProviderType): ProviderConfigEntry {
  return PROVIDER_CONFIGS[type]
}

export function getDefaultHost(type: ProviderType): string {
  return DEFAULT_HOSTS[type]
}

export function requiresApiKey(type: ProviderType): boolean {
  return PROVIDER_CONFIGS[type].requiresApiKey
}
