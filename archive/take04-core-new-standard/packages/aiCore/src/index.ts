// AI Core Engine — Public API (F003)

// ── Types ──
export type {
  ProviderId,
  ProviderSettingsMap,
  BaseProviderSettings,
  OpenAIProviderSettings,
  AnthropicProviderSettings,
  GoogleProviderSettings,
  AzureProviderSettings,
  OpenAICompatibleProviderSettings,
  RuntimeConfig,
  ModelConfig,
  AiSdkLanguageModel,
  AiSdkEmbeddingModel,
  AiSdkImageModel,
  AiSdkModel
} from './types'
export { PROVIDER_IDS } from './types'

// ── Runtime ──
export {
  RuntimeExecutor,
  type StreamTextParams,
  type GenerateTextParams,
  type GenerateImageParams,
  createExecutor,
  createOpenAICompatibleExecutor,
  streamText,
  generateText,
  PluginEngine
} from './core/runtime'

// ── Plugins ──
export { definePlugin, createContext, PluginManager } from './core/plugins'
export type { AiPlugin, AiRequestContext, AiRequestMetadata, ToolSet } from './core/plugins'

// ── Providers ──
export { getProviderFactory, PROVIDER_FACTORY_REGISTRY } from './core/providers'

// ── Models ──
export { ModelResolver, modelResolver } from './core/models'

// ── Middleware ──
export { createMiddlewares, wrapModelWithMiddlewares } from './core/middleware'
export type { LanguageModelMiddleware } from './core/middleware'

// ── Options ──
export {
  createOpenAIOptions,
  createAnthropicOptions,
  createGoogleOptions,
  createOpenRouterOptions,
  createXaiOptions,
  createGenericProviderOptions,
  mergeProviderOptions
} from './core/options'
export type {
  TypedProviderOptions,
  OpenAIProviderOptions,
  AnthropicProviderOptions,
  GoogleProviderOptions,
  OpenRouterProviderOptions,
  XaiProviderOptions
} from './core/options'

// ── Built-in Plugins ──
export { createLoggingPlugin, type LoggingPluginOptions } from './core/plugins/built-in/logging'
export { createToolUsePlugin, type ToolUsePluginOptions } from './core/plugins/built-in/toolUsePlugin'

// ── Errors ──
export {
  AiCoreError,
  ModelResolutionError,
  ParameterValidationError,
  PluginExecutionError,
  ProviderConfigError,
  TemplateLoadError,
  RecursiveDepthError
} from './core/errors'
