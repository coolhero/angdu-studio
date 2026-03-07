// Provider Factory Registry (F003)

import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createXai } from '@ai-sdk/xai'
import { createAzure } from '@ai-sdk/azure'
import type { ProviderId, BaseProviderSettings } from '../../types'
import { ProviderConfigError } from '../errors'

// Each factory takes settings and returns an AI SDK provider instance
type ProviderFactory = (settings: BaseProviderSettings) => unknown

export const PROVIDER_FACTORY_REGISTRY: Record<ProviderId, ProviderFactory> = {
  openai: (settings) =>
    createOpenAI({
      apiKey: settings.apiKey,
      baseURL: settings.baseURL,
      headers: settings.headers
    }),

  anthropic: (settings) =>
    createAnthropic({
      apiKey: settings.apiKey,
      baseURL: settings.baseURL,
      headers: settings.headers
    }),

  google: (settings) =>
    createGoogleGenerativeAI({
      apiKey: settings.apiKey,
      baseURL: settings.baseURL,
      headers: settings.headers
    }),

  openrouter: (settings) =>
    createOpenAI({
      apiKey: settings.apiKey,
      baseURL: settings.baseURL ?? 'https://openrouter.ai/api/v1',
      headers: settings.headers
    }),

  xai: (settings) =>
    createXai({
      apiKey: settings.apiKey,
      baseURL: settings.baseURL,
      headers: settings.headers
    }),

  azure: (settings) =>
    createAzure({
      apiKey: settings.apiKey,
      baseURL: settings.baseURL,
      headers: settings.headers
    }),

  deepseek: (settings) =>
    createOpenAI({
      apiKey: settings.apiKey,
      baseURL: settings.baseURL ?? 'https://api.deepseek.com/v1',
      headers: settings.headers,
      compatibility: 'compatible'
    }),

  'openai-compatible': (settings) =>
    createOpenAI({
      apiKey: settings.apiKey,
      baseURL: settings.baseURL,
      headers: settings.headers,
      compatibility: 'compatible'
    })
}

export function getProviderFactory(providerId: ProviderId): ProviderFactory {
  const factory = PROVIDER_FACTORY_REGISTRY[providerId]
  if (!factory) {
    throw new ProviderConfigError(`Unknown provider: ${providerId}`, { providerId })
  }
  return factory
}
