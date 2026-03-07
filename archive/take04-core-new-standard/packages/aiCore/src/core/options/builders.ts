// Options Builders (F003)

import type {
  TypedProviderOptions,
  OpenAIProviderOptions,
  AnthropicProviderOptions,
  GoogleProviderOptions,
  OpenRouterProviderOptions,
  XaiProviderOptions
} from './types'

export function createOpenAIOptions(options: OpenAIProviderOptions): TypedProviderOptions {
  return { provider: 'openai', options }
}

export function createAnthropicOptions(options: AnthropicProviderOptions): TypedProviderOptions {
  return { provider: 'anthropic', options }
}

export function createGoogleOptions(options: GoogleProviderOptions): TypedProviderOptions {
  return { provider: 'google', options }
}

export function createOpenRouterOptions(options: OpenRouterProviderOptions): TypedProviderOptions {
  return { provider: 'openrouter', options }
}

export function createXaiOptions(options: XaiProviderOptions): TypedProviderOptions {
  return { provider: 'xai', options }
}

export function createGenericProviderOptions<T extends string>(provider: T, options: Record<string, unknown>): TypedProviderOptions {
  return { provider, options }
}

// Deep merge utility for provider options
function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    const targetVal = target[key]
    const sourceVal = source[key]
    if (targetVal && sourceVal && typeof targetVal === 'object' && typeof sourceVal === 'object' && !Array.isArray(targetVal) && !Array.isArray(sourceVal)) {
      result[key] = deepMerge(targetVal as Record<string, unknown>, sourceVal as Record<string, unknown>)
    } else {
      result[key] = sourceVal
    }
  }
  return result
}

export function mergeProviderOptions(...optionsList: TypedProviderOptions[]): TypedProviderOptions {
  if (optionsList.length === 0) {
    return { provider: 'unknown', options: {} }
  }
  if (optionsList.length === 1) return optionsList[0]

  let merged = optionsList[0]
  for (let i = 1; i < optionsList.length; i++) {
    merged = {
      provider: optionsList[i].provider || merged.provider,
      options: deepMerge(merged.options, optionsList[i].options)
    }
  }
  return merged
}
