// AiCoreService — bridge between renderer store and aiCore package (F003)

import { RuntimeExecutor, type ProviderId, type ProviderSettingsMap, type AiPlugin } from '@aiCore/index'
import type { Provider } from '@shared/types/provider'

// Map F002 ProviderType to F003 ProviderId
const PROVIDER_TYPE_MAP: Record<string, ProviderId> = {
  openai: 'openai',
  'openai-response': 'openai',
  anthropic: 'anthropic',
  gemini: 'google',
  'azure-openai': 'azure',
  vertexai: 'google',
  mistral: 'openai-compatible',
  'aws-bedrock': 'openai-compatible',
  'vertex-anthropic': 'anthropic',
  'new-api': 'openai-compatible',
  gateway: 'openai-compatible',
  ollama: 'openai-compatible'
}

/**
 * Resolves a F002 Provider to a F003 ProviderId
 */
export function resolveProviderId(provider: Provider): ProviderId {
  return PROVIDER_TYPE_MAP[provider.type] ?? 'openai-compatible'
}

/**
 * Builds F003 provider settings from a F002 Provider
 */
export function buildProviderSettings(provider: Provider): ProviderSettingsMap[ProviderId] {
  return {
    apiKey: provider.apiKey,
    baseURL: provider.apiHost || undefined,
    headers: provider.extra_headers
  }
}

/**
 * Creates a RuntimeExecutor from a F002 Provider
 */
export function createExecutorFromProvider(provider: Provider, plugins?: AiPlugin[]): RuntimeExecutor {
  const providerId = resolveProviderId(provider)
  const settings = buildProviderSettings(provider)
  return RuntimeExecutor.create(providerId, settings, plugins)
}
