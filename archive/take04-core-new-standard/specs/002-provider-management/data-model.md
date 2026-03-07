# Data Model: Provider Management

**Feature**: 002-provider-management
**Date**: 2026-03-04

## Entities

### Provider

Primary entity representing an AI service endpoint configuration.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `string` | **PK** | Unique provider identifier (SystemProviderId for system, UUID for user) |
| `name` | `string` | required | Display name |
| `type` | `ProviderType` | required, enum | API protocol type (12 values) |
| `apiKey` | `string` | optional | API authentication key |
| `apiHost` | `string` | optional | Base API URL (normalized, no trailing slash) |
| `anthropicApiHost` | `string` | optional | Anthropic-compatible endpoint for dual-endpoint providers |
| `apiVersion` | `string` | optional | API version string (e.g., Azure OpenAI) |
| `models` | `Model[]` | default `[]` | Available models for this provider |
| `enabled` | `boolean` | default `false` | Whether provider is active |
| `isSystem` | `boolean` | default `false` | Whether it is a built-in system provider |
| `isAuthed` | `boolean` | optional | Whether OAuth authentication is complete |
| `rateLimit` | `number` | optional, >= 0 | Seconds between requests |
| `apiOptions` | `ProviderApiOptions` | optional | API capability flags (system providers: never) |
| `serviceTier` | `OpenAIServiceTier \| GroqServiceTier` | optional | Service tier for OpenAI/Groq |
| `verbosity` | `OpenAIVerbosity` | optional | Verbosity for GPT-5 series |
| `authType` | `'apiKey' \| 'oauth'` | optional | Authentication method |
| `isVertex` | `boolean` | optional | VertexAI flag |
| `notes` | `string` | optional | User notes |
| `extra_headers` | `Record<string, string>` | optional | Custom HTTP headers |
| `anthropicCacheControl` | `AnthropicCacheControlSettings` | optional | Anthropic prompt caching config |

**Relationships**:
- Has many **Model** (1:N, embedded array)
- Referenced by **Assistant** (F005) via model selection
- Referenced by **KnowledgeBase** (F004) via embedding model
- Referenced by **AgentEntity** (F012) via provider config

### Model

Entity representing an AI model available through a provider.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `string` | **PK** | Model identifier (provider-specific, e.g., `gpt-4.1`) |
| `name` | `string` | required | Display name |
| `provider` | `string` | **FK** to Provider.id | Owning provider ID |
| `group` | `string` | optional | Model family grouping (e.g., `'OpenAI'`, `'Claude'`) |
| `owned_by` | `string` | optional | Organization that owns the model |
| `description` | `string` | optional | Model description |
| `capabilities` | `ModelCapability[]` | optional | Capability tags: vision, embedding, reasoning, function_calling, web_search, rerank |
| `pricing` | `ModelPricing` | optional | Cost per million tokens (input/output) |
| `endpoint_type` | `EndpointType` | optional | Which endpoint format to use |
| `supported_endpoint_types` | `EndpointType[]` | optional | Multiple supported endpoints |
| `maxTokens` | `number` | optional, > 0 | Maximum output tokens |
| `contextWindow` | `number` | optional, > 0 | Maximum context window size |

**Relationships**:
- Belongs to **Provider** (N:1)
- Referenced by **Assistant** (F005) via model selection
- Referenced by **Message** (F005) via model that generated a response
- Referenced by **KnowledgeBase** (F004) for embedding/rerank model

### ProviderApiOptions

Embedded value object for per-provider API capability flags.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `isNotSupportArrayContent` | `boolean` | `undefined` (=supported) | Multi-part content arrays |
| `isNotSupportStreamOptions` | `boolean` | `undefined` (=supported) | stream_options parameter |
| `isSupportDeveloperRole` | `boolean` | `undefined` (=not supported) | Developer role in messages |
| `isSupportServiceTier` | `boolean` | `undefined` (=not supported) | Service tier parameter |
| `isNotSupportEnableThinking` | `boolean` | `undefined` (=supported) | Thinking/reasoning toggle |
| `isNotSupportAPIVersion` | `boolean` | `undefined` (=supported) | API version header |
| `isNotSupportVerbosity` | `boolean` | `undefined` (=supported) | Verbosity parameter |

**Convention**: `undefined` means "supported/default" for backward compat.

## Enumerations

### ProviderType

12 API protocol types:
```
openai | openai-response | anthropic | gemini | azure-openai |
vertexai | mistral | aws-bedrock | vertex-anthropic | new-api |
gateway | ollama
```

### SystemProviderId

~55 predefined provider identifiers:
```
openai | anthropic | gemini | copilot | cherryin | ollama |
azure | vertexai | aws-bedrock | groq | mistral | deepseek |
together | openrouter | fireworks | lmstudio | silicon |
aihubmix | zhipu | moonshot | dashscope | minimax |
... (and ~33 more)
```

### ModelCapability

Capability tags for models:
```
vision | embedding | reasoning | function_calling | web_search | rerank
```

## Store State Shape

### LlmStore (Zustand with persist + broadcastSync)

```typescript
interface LlmState {
  providers: Provider[]
  defaultModel: Model
  topicNamingModel: Model
  quickModel: Model
  translateModel: Model
  settings: LlmSettings
}

// Store version for migration support (Constitution VI)
// persist middleware config: { name: 'llm-store', version: 1 }
// Migration stub: version 0→1 is identity (initial schema)
```

### LlmSettings (per-provider settings)

```typescript
interface LlmSettings {
  ollama: { keepAliveTime: number }
  lmstudio: { keepAliveTime: number }
  gpustack: { keepAliveTime: number }
  vertexai: {
    serviceAccount: { privateKey: string; clientEmail: string }
    projectId: string
    location: string
  }
  awsBedrock: {
    authType: 'iam' | 'apiKey'
    accessKeyId: string
    secretAccessKey: string
    apiKey: string
    region: string
  }
  cherryIn: { accessToken: string; refreshToken: string }
}
```

## Validation Rules

- Provider `apiHost` must be URL-normalized (no trailing slash) before storage
- Provider `type` must be one of 12 ProviderType values
- System providers (`isSystem: true`) cannot be deleted, only disabled
- System providers cannot have `apiOptions` modified
- Model `id` must be unique within a provider's model list (deduplicated on add)
- Adding a model to a provider automatically sets `enabled: true`
- New providers are prepended to the list (unshift), not appended
- `isSystemProvider()` check requires BOTH `id in SystemProviderId` AND `isSystem === true`
