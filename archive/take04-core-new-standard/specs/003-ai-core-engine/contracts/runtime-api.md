# Runtime API Contract: AI Core Engine

## Package: `packages/aiCore`

### Public API (index.ts exports)

#### Execution Functions

```typescript
// Create a typed executor for a specific provider
function createExecutor<T extends ProviderId>(
  providerId: T,
  providerSettings: ProviderSettingsMap[T],
  plugins?: AiPlugin[]
): RuntimeExecutor<T>

// Create an executor for custom OpenAI-compatible providers
function createOpenAICompatibleExecutor(
  providerSettings: OpenAICompatibleProviderSettings,
  plugins?: AiPlugin[]
): RuntimeExecutor<'openai-compatible'>

// Direct execution functions (create executor internally)
function streamText(params: StreamTextParams): Promise<StreamTextResult>
function generateText(params: GenerateTextParams): Promise<GenerateTextResult>
function generateImage(params: GenerateImageParams): Promise<GenerateImageResult>
```

#### RuntimeExecutor Class

```typescript
class RuntimeExecutor<T extends ProviderId> {
  // Instance methods
  streamText(params: StreamTextParams): Promise<StreamTextResult>
  generateText(params: GenerateTextParams): Promise<GenerateTextResult>
  generateImage(params: GenerateImageParams): Promise<GenerateImageResult>

  // Static factories
  static create<T>(providerId: T, settings: ProviderSettingsMap[T], plugins?: AiPlugin[]): RuntimeExecutor<T>
  static createOpenAICompatible(settings: OpenAICompatibleSettings, plugins?: AiPlugin[]): RuntimeExecutor
}
```

#### Plugin System

```typescript
// Plugin interface
interface AiPlugin<TParams = unknown, TResult = unknown> {
  name: string
  enforce?: 'pre' | 'post'

  // First-wins hooks
  resolveModel?(modelId: string, context: AiRequestContext): Promise<AiSdkModel | null> | AiSdkModel | null
  loadTemplate?(name: string, context: AiRequestContext): JSONValue | null | Promise<JSONValue | null>

  // Sequential hooks
  configureContext?(context: AiRequestContext): void | Promise<void>
  transformParams?(params: TParams, context: AiRequestContext): Partial<TParams> | Promise<Partial<TParams>>
  transformResult?(result: TResult, context: AiRequestContext): TResult | Promise<TResult>

  // Parallel hooks
  onRequestStart?(context: AiRequestContext): void | Promise<void>
  onRequestEnd?(context: AiRequestContext, result: TResult): void | Promise<void>
  onError?(error: Error, context: AiRequestContext): void | Promise<void>

  // Stream processing
  transformStream?(params: TParams, context: AiRequestContext): TransformStream
}

// Plugin helpers
function definePlugin(plugin: AiPlugin): AiPlugin
function createContext(providerId: ProviderId, model: AiSdkModel, params: unknown): AiRequestContext
```

#### Options Builders

```typescript
function createOpenAIOptions(options: OpenAIProviderOptions): TypedProviderOptions
function createAnthropicOptions(options: AnthropicProviderOptions): TypedProviderOptions
function createGoogleOptions(options: GoogleProviderOptions): TypedProviderOptions
function createOpenRouterOptions(options: OpenRouterProviderOptions): TypedProviderOptions
function createXaiOptions(options: XaiProviderOptions): TypedProviderOptions
function createGenericProviderOptions<T>(provider: T, options: Record<string, any>): TypedProviderOptions
function mergeProviderOptions(...options: TypedProviderOptions[]): TypedProviderOptions
```

#### Error Classes

```typescript
class AiCoreError extends Error {
  code: string
  context: Record<string, unknown>
  cause?: Error
  toJSON(): object
}

class ModelResolutionError extends AiCoreError {}
class ParameterValidationError extends AiCoreError {}
class PluginExecutionError extends AiCoreError {}
class ProviderConfigError extends AiCoreError {}
class TemplateLoadError extends AiCoreError {}
class RecursiveDepthError extends AiCoreError {}
```

#### Model Resolution

```typescript
class ModelResolver {
  resolveLanguageModel(modelId: string, fallbackProviderId: string, options?: any): Promise<LanguageModelV3>
  resolveTextEmbeddingModel(modelId: string, fallbackProviderId: string): Promise<EmbeddingModelV3>
  resolveImageModel(modelId: string, fallbackProviderId: string): Promise<ImageModelV3>
}

const modelResolver: ModelResolver  // Global singleton
```

## Package: `packages/ai-sdk-provider`

### CherryIN Provider

```typescript
interface CherryInProviderSettings {
  apiKey?: string
  baseURL?: string
  anthropicBaseURL?: string
  geminiBaseURL?: string
  headers?: HeadersInput
  endpointType?: 'openai' | 'openai-response' | 'anthropic' | 'gemini' | 'image-generation'
}

interface CherryInProvider extends ProviderV3 {
  (modelId: string): LanguageModelV3
  languageModel(modelId: string): LanguageModelV3
  chat(modelId: string): LanguageModelV3
  responses(modelId: string): LanguageModelV3
  embedding(modelId: string): EmbeddingModelV3
  image(modelId: string): ImageModelV3
  transcription(modelId: string): TranscriptionModelV3
  speech(modelId: string): SpeechModelV3
}

function createCherryIn(settings?: CherryInProviderSettings): CherryInProvider
const cherryIn: CherryInProvider  // Default instance
```

## Context Window Utility (renderer service layer)

```typescript
function filterContextMessages(messages: Message[], contextCount: number): Message[]
function getContextCount(assistant: Assistant, messages: Message[]): { current: number; max: number }

// Constants
const DEFAULT_CONTEXT_COUNT = 5
const MAX_CONTEXT_COUNT = 100
const UNLIMITED_CONTEXT_COUNT = 100000
```

## Rate Limiting Utility (renderer service layer)

```typescript
function checkRateLimit(provider: Provider, lastMessageTime: number): {
  blocked: boolean
  waitSeconds: number
}
```
