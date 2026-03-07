# Data Model: AI Core Engine

F003 does not own persistent entities. It operates on transient execution contexts.

## Transient Types (not persisted)

### RuntimeConfig

| Field | Type | Description |
|-------|------|-------------|
| providerId | ProviderId | Provider type identifier |
| providerSettings | ProviderSettingsMap[T] | Per-provider configuration |
| plugins | AiPlugin[] | Optional plugins to register |

### AiRequestContext

| Field | Type | Description |
|-------|------|-------------|
| providerId | ProviderId | Provider type |
| model | AiSdkModel | Resolved AI SDK model instance |
| originalParams | TParams | Original request parameters |
| metadata | AiRequestMetadata | Request metadata (topicId, callType, flags) |
| startTime | number | Request start timestamp |
| requestId | string | Unique request identifier |
| recursiveCall | Function | Recursive call capability |
| isRecursiveCall | boolean | Whether this is a recursive invocation |
| recursiveDepth | number | Current recursion depth |
| maxRecursiveDepth | number | Max recursion limit (default 10) |
| mcpTools | ToolSet | Optional MCP tools |
| extensions | Map<string, any> | Plugin extension data |
| middlewares | Middleware[] | Applied middlewares |

### AiRequestMetadata

| Field | Type | Description |
|-------|------|-------------|
| topicId | string? | Associated chat topic |
| callType | string? | Execution type identifier |
| enableReasoning | boolean? | Enable reasoning/thinking |
| enableWebSearch | boolean? | Enable web search plugin |
| enableGenerateImage | boolean? | Enable image generation |
| isPromptToolUse | boolean? | Prompt-based tool calling |
| isSupportedToolUse | boolean? | Native tool calling support |
| custom | object? | Custom metadata |

### AiCoreError

| Field | Type | Description |
|-------|------|-------------|
| code | string | Error classification code |
| message | string | Human-readable error message |
| context | Record<string, unknown> | Contextual data for debugging |
| cause | Error? | Optional underlying error |

**Subclasses**: ModelResolutionError, ParameterValidationError, PluginExecutionError, ProviderConfigError, TemplateLoadError, RecursiveDepthError

## Referenced Entities (from F002)

### Provider (read-only)

Used fields: `id`, `type`, `apiKey`, `apiHost`, `apiVersion`, `models`, `enabled`, `rateLimit`, `extra_headers`, `serviceTier`

### Model (read-only)

Used fields: `id`, `provider`, `name`, `functionCall`, `vision`, `reasoning`, `maxTokens`, `maxContext`
