# Data Model: Model Provider

## Provider

Configured AI service provider instance. Stored via Zustand persist in localStorage, API keys encrypted via safeStorage before persistence.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | uuid | Unique provider identifier |
| type | ProviderType | Yes | — | Provider protocol type (enum) |
| name | string | Yes | — | User-facing display name |
| apiKey | string | Yes | '' | API key (encrypted at rest, decrypted in main process only) |
| apiHost | string | Yes | — | Base URL for API calls |
| models | Model[] | Yes | [] | Available models for this provider |
| enabled | boolean | Yes | true | Whether provider is active |
| isSystem | boolean | Yes | false | Whether this is a built-in system provider |
| isAuthed | boolean | No | false | Whether authentication has been verified |
| rateLimit | number | No | undefined | Rate limit (requests per minute) |
| apiOptions | ProviderApiOptions | No | {} | Provider-specific API behavior flags |
| extra_headers | Record<string, string> | No | {} | Custom HTTP headers for API calls |
| notes | string | No | '' | User-added notes about this provider |
| authType | 'apiKey' \| 'oauth' | No | 'apiKey' | Authentication method |

### ProviderType Enum

```
'openai' | 'openai-response' | 'anthropic' | 'gemini' | 'azure-openai' |
'vertexai' | 'mistral' | 'aws-bedrock' | 'vertex-anthropic' |
'new-api' | 'gateway' | 'ollama'
```

### ProviderApiOptions

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| isNotSupportArrayContent | boolean | false | Array content format not supported |
| isNotSupportStreamOptions | boolean | false | stream_options parameter not supported |
| isSupportDeveloperRole | boolean | false | 'developer' role supported |
| isSupportServiceTier | boolean | false | service_tier parameter supported |
| isNotSupportEnableThinking | boolean | false | enable_thinking parameter not supported |

### Validation Rules

- `id` MUST be unique across all providers
- `type` MUST be a valid ProviderType enum value
- `apiKey` may be empty for local providers (ollama, lmstudio)
- `apiHost` MUST be a valid URL (http:// or https://)
- System providers (`isSystem: true`) cannot be deleted, only disabled
- `rateLimit` if specified, MUST be > 0

### State Transitions

```
[not configured] → addProvider() → [configured, disabled]
[configured, disabled] → enable + set apiKey → [configured, enabled]
[configured, enabled] → testConnection() → [configured, enabled, isAuthed: true]
[configured, enabled] → testConnection() fails → [configured, enabled, isAuthed: false]
[configured, *] → disable → [configured, disabled]
[configured, !isSystem] → delete → [removed]
```

---

## Model

AI model available from a provider. Embedded within Provider.models array. Cached via Zustand persist with per-provider TTL.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | — | Provider-specific model identifier |
| provider | string | Yes | — | Parent provider ID |
| name | string | Yes | — | Display name |
| group | string | Yes | — | Model group/family (e.g., "GPT-4", "Claude 3") |
| capabilities | ModelCapability[] | No | [] | Model capabilities with user override flags |
| endpoint_type | EndpointType | No | 'openai' | Primary endpoint format |
| pricing | ModelPricing | No | undefined | Cost per million tokens |
| enabled | boolean | No | true | Whether model is available for selection |
| owned_by | string | No | — | Organization that owns the model |

### ModelCapability

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | ModelType | Yes | Capability type |
| isUserSelected | boolean | No | Whether user manually toggled this capability |

### ModelType Enum

```
'text' | 'vision' | 'embedding' | 'reasoning' | 'function_calling' | 'web_search' | 'rerank'
```

### EndpointType Enum

```
'openai' | 'openai-response' | 'anthropic' | 'gemini' | 'image-generation' | 'jina-rerank'
```

### ModelPricing

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| input_per_million_tokens | number | Yes | Input token cost |
| output_per_million_tokens | number | Yes | Output token cost |
| currencySymbol | string | No | Currency (default: '$') |

### Validation Rules

- `id` MUST be non-empty
- `provider` MUST reference an existing provider ID
- `endpoint_type` MUST be a valid EndpointType enum value
- `capabilities` user overrides (`isUserSelected: true`) are preserved across model list refresh
- `enabled` defaults to true on fetch, user can toggle off

---

## Relationships

```
Provider 1:N Model (embedded array, models[] field)
Provider → AppConfig (F001) via IPC for persistence (config:get/set)
Model → Assistant (F005, future) via model reference field
Provider.apiKey → safeStorage (F001) for encryption/decryption
```
