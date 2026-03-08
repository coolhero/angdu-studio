# Data Model: F002-ai-provider

**Feature**: AI Provider
**Date**: 2026-03-08
**Status**: Draft

---

## Entity Definitions

### 1. Provider

The AI service provider configuration. Managed in `useProviderStore` (Zustand).

```typescript
interface Provider {
  id: string;                           // UUID for custom, fixed string for system providers
  type: ProviderType;                   // Provider SDK type
  name: string;                         // Display name
  apiKey: string;                       // API key (comma-separated for rotation)
  apiHost: string;                      // API base URL
  apiVersion?: string;                  // API version (Azure)
  models: Model[];                      // Available models
  enabled?: boolean;                    // Provider active state (default: true)
  isSystem?: boolean;                   // Built-in provider flag
  isAuthed?: boolean;                   // OAuth authentication state
  rateLimit?: number;                   // Rate limit config (requests/min)
  apiOptions?: ProviderApiOptions;      // Feature support flags
  serviceTier?: ServiceTier;            // OpenAI/Groq service tier
  authType?: 'apiKey' | 'oauth';        // Authentication method
  notes?: string;                       // User notes
  extra_headers?: Record<string, string>; // Custom HTTP headers
  anthropicCacheControl?: AnthropicCacheControlSettings; // Anthropic prompt caching
}
```

### 2. Model

An AI model within a provider.

```typescript
interface Model {
  id: string;                           // Model identifier (e.g., 'gpt-4o', 'claude-sonnet-4-20250514')
  provider: string;                     // Parent provider ID
  name: string;                         // Display name
  group: string;                        // Model family group (e.g., 'GPT-4', 'Claude')
  owned_by?: string;                    // Owner organization
  description?: string;                 // Model description
  capabilities?: ModelCapability[];     // vision/embedding/reasoning/function_calling/web_search/rerank
  pricing?: ModelPricing;               // Input/output cost per million tokens
  endpoint_type?: EndpointType;         // openai/anthropic/gemini/image-generation/jina-rerank
  supported_endpoint_types?: EndpointType[]; // All supported endpoint types
}
```

### 3. ProviderType (Enum)

```typescript
type ProviderType =
  | 'openai'
  | 'openai-response'
  | 'anthropic'
  | 'gemini'
  | 'azure-openai'
  | 'vertexai'
  | 'mistral'
  | 'aws-bedrock'
  | 'vertex-anthropic'
  | 'new-api'
  | 'gateway'
  | 'ollama';
```

### 4. ModelCapability (Enum)

```typescript
type ModelCapability =
  | 'vision'
  | 'embedding'
  | 'reasoning'
  | 'function_calling'
  | 'web_search'
  | 'rerank';
```

### 5. ProviderApiOptions

Per-provider feature support flags.

```typescript
interface ProviderApiOptions {
  streamOutput?: boolean;               // Supports streaming (default: true)
  functionCalling?: boolean;            // Supports tool use
  vision?: boolean;                     // Supports image input
  webSearch?: boolean;                  // Supports built-in web search
  reasoning?: boolean;                  // Supports reasoning/thinking mode
}
```

### 6. ModelPricing

```typescript
interface ModelPricing {
  input: number;                        // Cost per 1M input tokens
  output: number;                       // Cost per 1M output tokens
  cachedInput?: number;                 // Cost per 1M cached input tokens
}
```

### 7. ServiceTier

```typescript
type ServiceTier = 'auto' | 'default' | 'flex';
```

### 8. EndpointType

```typescript
type EndpointType =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'image-generation'
  | 'jina-rerank';
```

### 9. AnthropicCacheControlSettings

```typescript
interface AnthropicCacheControlSettings {
  enabled: boolean;
  cacheType: 'ephemeral';
}
```

### 10. LlmSettings (per-provider config)

```typescript
interface LlmSettings {
  // VertexAI
  vertexai?: {
    projectId: string;
    location: string;
    serviceAccountKey?: string;         // JSON service account
  };
  // AWS Bedrock
  awsBedrock?: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    authMode: 'accessKey' | 'iam' | 'apiKey';
  };
  // AngduIN
  angduIn?: {
    accessToken?: string;
    refreshToken?: string;
  };
  // Ollama
  ollama?: {
    keepAlive?: number;                 // Keep model loaded (seconds)
  };
}
```

### 11. ProviderStoreState (Zustand Store Shape)

```typescript
interface ProviderStoreState {
  // Data
  providers: Provider[];
  defaultModel?: Model;
  quickModel?: Model;
  translateModel?: Model;
  settings: LlmSettings;

  // Actions
  addProvider: (provider: Provider) => void;
  updateProvider: (id: string, updates: Partial<Provider>) => void;
  removeProvider: (id: string) => void;
  reorderProviders: (ids: string[]) => void;
  setEnabled: (id: string, enabled: boolean) => void;

  addModel: (providerId: string, model: Model) => void;
  removeModel: (providerId: string, modelId: string) => void;
  updateModel: (providerId: string, modelId: string, updates: Partial<Model>) => void;

  setDefaultModel: (model: Model | undefined) => void;
  setQuickModel: (model: Model | undefined) => void;
  setTranslateModel: (model: Model | undefined) => void;

  updateSettings: (updates: Partial<LlmSettings>) => void;
}
```

---

## Relationships

```
Provider (1) ──has many──> Model (*)
ProviderStoreState ──references──> Provider[]
ProviderStoreState ──references──> Model (defaultModel, quickModel, translateModel)
Provider ──uses──> ProviderType (type field)
Model ──uses──> ModelCapability[] (capabilities field)
```

---

## Validation Rules

- `Provider.id` must be unique across all providers
- `Provider.apiKey` must be non-empty for non-OAuth providers
- `Provider.type` must be one of the ProviderType values
- `Model.id` must be unique within its parent provider
- `Model.provider` must reference a valid Provider.id
- System providers (`isSystem: true`) have fixed IDs and cannot be deleted (only disabled)
- API key rotation: comma-separated keys are selected round-robin per request
