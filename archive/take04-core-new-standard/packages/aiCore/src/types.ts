// AI Core Engine Types (F003)

import type { LanguageModelV1 as LanguageModel, EmbeddingModelV1 as EmbeddingModel, ImageModelV1 as ImageModel } from 'ai'

// ── Provider IDs supported by AI Core ──

export const PROVIDER_IDS = [
  'openai',
  'anthropic',
  'google',
  'openrouter',
  'xai',
  'azure',
  'deepseek',
  'openai-compatible'
] as const

export type ProviderId = (typeof PROVIDER_IDS)[number]

// ── Per-provider settings ──

export interface BaseProviderSettings {
  apiKey?: string
  baseURL?: string
  headers?: Record<string, string>
}

export interface OpenAIProviderSettings extends BaseProviderSettings {
  organization?: string
  compatibility?: 'strict' | 'compatible'
}

export interface AnthropicProviderSettings extends BaseProviderSettings {
  anthropicApiHost?: string
}

export interface GoogleProviderSettings extends BaseProviderSettings {
  project?: string
  location?: string
}

export interface AzureProviderSettings extends BaseProviderSettings {
  apiVersion?: string
  resourceName?: string
}

export interface OpenAICompatibleProviderSettings extends BaseProviderSettings {
  name?: string
}

export interface ProviderSettingsMap {
  openai: OpenAIProviderSettings
  anthropic: AnthropicProviderSettings
  google: GoogleProviderSettings
  openrouter: OpenAIProviderSettings
  xai: BaseProviderSettings
  azure: AzureProviderSettings
  deepseek: OpenAIProviderSettings
  'openai-compatible': OpenAICompatibleProviderSettings
}

// ── Runtime Configuration ──

export interface RuntimeConfig<T extends ProviderId = ProviderId> {
  providerId: T
  providerSettings: ProviderSettingsMap[T]
}

// ── Model Configuration ──

export interface ModelConfig {
  modelId: string
  providerId?: ProviderId
}

// ── AI SDK Model Types (re-export for convenience) ──

export type AiSdkLanguageModel = LanguageModel
export type AiSdkEmbeddingModel = EmbeddingModel<string>
export type AiSdkImageModel = ImageModel
export type AiSdkModel = AiSdkLanguageModel | AiSdkEmbeddingModel | AiSdkImageModel
