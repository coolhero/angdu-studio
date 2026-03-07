# Feature Specification: AI Core Engine

**Feature Branch**: `003-ai-core-engine`
**Created**: 2026-03-04
**Status**: Draft
**Input**: AI Core Engine — Vercel AI SDK integration with plugin system, RuntimeExecutor, middleware pipeline, provider adapters, streaming, and error handling

## User Scenarios & Testing

### User Story 1 - Streaming Chat Completion (Priority: P1)

The AI core receives a chat request with a provider ID, model ID, and messages array. It resolves the correct Vercel AI SDK provider adapter, applies registered plugins and middleware, and streams response tokens back to the caller token-by-token. The caller receives an async iterable stream of text chunks.

**Why this priority**: Streaming chat is the primary user-facing operation — every chat message flows through this path. Without it, the app has no AI functionality.

**Independent Test**: Create a RuntimeExecutor for a provider, call `streamText()` with a prompt, and verify tokens stream back incrementally.

**Acceptance Scenarios**:

1. **Given** a configured OpenAI provider, **When** `streamText()` is called with messages, **Then** tokens stream back as an async iterable
2. **Given** a configured Anthropic provider, **When** `streamText()` is called, **Then** the correct Anthropic adapter is used and tokens stream back
3. **Given** registered plugins, **When** streaming executes, **Then** plugins fire in order: configureContext → onRequestStart → resolveModel → transformParams → execute → onRequestEnd
4. **Given** a stream in progress, **When** an error occurs mid-stream, **Then** the onError hook fires and the error propagates to the caller

---

### User Story 2 - Text Generation (Non-Streaming) (Priority: P1)

The AI core receives a generation request (e.g., for topic naming, translation, quick actions). It executes through the same plugin pipeline but returns the complete response as a single result rather than streaming.

**Why this priority**: Non-streaming generation is used for topic naming, translation, and other background AI tasks that need a complete response.

**Independent Test**: Create a RuntimeExecutor, call `generateText()`, and verify a complete `TextGenerationResult` is returned.

**Acceptance Scenarios**:

1. **Given** a configured provider, **When** `generateText()` is called, **Then** a complete text result is returned
2. **Given** registered transformResult plugins, **When** generation completes, **Then** the result passes through transformResult hooks before being returned

---

### User Story 3 - Provider Adapter Resolution (Priority: P1)

Given a provider type and model ID, the AI core creates the correct Vercel AI SDK adapter instance. It supports both traditional format (`gpt-4` + provider fallback) and namespaced format (`anthropic:claude-3`). It handles 7+ built-in providers plus an openai-compatible mode for custom providers.

**Why this priority**: Every AI operation starts with resolving the correct provider adapter. This is the foundation for all execution.

**Independent Test**: Call `RuntimeExecutor.create()` with each provider type and verify the correct AI SDK adapter is instantiated.

**Acceptance Scenarios**:

1. **Given** provider ID `openai` and model `gpt-4.1`, **When** the executor is created, **Then** the OpenAI AI SDK adapter is used
2. **Given** provider ID `anthropic` and model `claude-sonnet-4-20250514`, **When** the executor is created, **Then** the Anthropic AI SDK adapter is used
3. **Given** a namespaced model ID `anthropic:claude-3`, **When** resolveModel executes, **Then** the model is resolved directly without needing a fallback provider
4. **Given** a custom provider using openai-compatible mode, **When** the executor is created with `createOpenAICompatibleExecutor()`, **Then** it uses the custom API host and API key

---

### User Story 4 - Plugin System (Priority: P2)

Developers can register plugins that hook into the AI execution pipeline. Plugins support 3 execution patterns: first-wins (resolveModel, loadTemplate), sequential/serializing (configureContext, transformParams, transformResult), and parallel (onRequestStart, onRequestEnd, onError). Plugins can be ordered via `enforce: 'pre' | 'post'`. Stream transforms allow plugins to process streaming chunks.

**Why this priority**: Plugins enable extensibility — tool calling, web search, and chat-specific features all use plugins.

**Independent Test**: Register multiple plugins, execute a request, and verify each hook fires in the correct order with correct data.

**Acceptance Scenarios**:

1. **Given** a plugin with `enforce: 'pre'`, **When** plugins execute, **Then** it runs before normal plugins
2. **Given** two plugins both implementing `transformParams`, **When** params are transformed, **Then** they chain sequentially (output of first is input of second)
3. **Given** a plugin implementing `transformStream`, **When** streaming, **Then** stream chunks pass through the transform
4. **Given** a plugin that throws, **When** onError fires, **Then** other plugins' onError hooks still execute (parallel)

---

### User Story 5 - Per-Provider Options Builders (Priority: P2)

Each provider has specific options (temperature, topP, maxTokens, reasoning budget, cache control, etc.). Type-safe options builder functions create provider-specific configuration objects. Options can be merged across multiple sources.

**Why this priority**: Correct per-provider parameterization is essential for quality AI responses and provider-specific features like Anthropic cache control or OpenAI response format.

**Independent Test**: Call `createOpenAIOptions()`, `createAnthropicOptions()`, etc., and verify the output matches the expected provider-specific schema.

**Acceptance Scenarios**:

1. **Given** OpenAI provider options with temperature 0.7, **When** `createOpenAIOptions()` is called, **Then** a correctly typed OpenAI options object is returned
2. **Given** Anthropic options with cache control, **When** `createAnthropicOptions()` is called, **Then** Anthropic-specific cache fields are included
3. **Given** multiple option sources, **When** `mergeProviderOptions()` is called, **Then** options are deep-merged correctly

---

### User Story 6 - Error Handling and Classification (Priority: P2)

When an AI operation fails, the error is classified into a typed error hierarchy: `AiCoreError` base with subclasses for model resolution, parameter validation, plugin execution, provider config, template loading, and recursive depth. Each error includes a code, message, context, and optional cause chain.

**Why this priority**: Typed errors enable the UI to display appropriate error messages and take recovery actions (e.g., retry, switch model).

**Independent Test**: Trigger each error type and verify the correct subclass is thrown with expected properties.

**Acceptance Scenarios**:

1. **Given** an invalid model ID, **When** model resolution fails, **Then** a `ModelResolutionError` is thrown with the model ID in context
2. **Given** recursive plugin calls exceeding depth 10, **When** the limit is hit, **Then** a `RecursiveDepthError` is thrown
3. **Given** a provider API error, **When** the onError hook fires, **Then** all registered error handler plugins execute

---

### User Story 7 - Context Window Management (Priority: P2)

The AI core limits the number of messages sent to the provider based on a configurable context window. Default is 5 messages, maximum configurable is 100, and an unlimited threshold (100000) sends all messages.

**Why this priority**: Context window management prevents token limit errors and controls cost while ensuring enough context for coherent responses.

**Independent Test**: Configure different context window sizes, send messages, and verify only the correct number of recent messages are included.

**Acceptance Scenarios**:

1. **Given** context window set to 5, **When** 20 messages exist, **Then** only the 5 most recent messages plus system prompt are sent
2. **Given** context window set to unlimited (100000), **When** 500 messages exist, **Then** all messages are sent
3. **Given** context window set to default, **When** no explicit configuration, **Then** 5 messages are used

---

### User Story 8 - Rate Limiting (Priority: P3)

The AI core enforces per-provider rate limiting with a configurable delay in seconds between requests. If a request arrives too soon after the previous one, it is blocked with a warning indicating the remaining wait time.

**Why this priority**: Prevents API rate limit errors from providers and controls request frequency.

**Independent Test**: Configure a rate limit, send two rapid requests, and verify the second is blocked with the correct wait time.

**Acceptance Scenarios**:

1. **Given** provider rate limit of 5 seconds, **When** a second request arrives 2 seconds after the first, **Then** the request is blocked with "wait 3 seconds" signal
2. **Given** no rate limit configured, **When** rapid requests arrive, **Then** all requests proceed without delay

---

### User Story 9 - CherryIN Custom Provider (Priority: P3)

The AI core includes a custom Vercel AI SDK provider for CherryIN that routes model IDs to the appropriate backend (OpenAI, Anthropic, or Gemini) based on endpoint type detection. It supports language models, embeddings, images, transcription, and speech.

**Why this priority**: CherryIN is the default provider for new users, so its adapter must work correctly.

**Independent Test**: Create a CherryIN provider instance, resolve different model types, and verify routing to correct backends.

**Acceptance Scenarios**:

1. **Given** a CherryIN provider with Anthropic endpoint type, **When** a language model is requested, **Then** the request routes to the Anthropic backend
2. **Given** a CherryIN provider, **When** an embedding model is requested, **Then** it uses the OpenAI-compatible endpoint

---

### User Story 10 - Middleware Pipeline (Priority: P3)

Custom middleware can transform requests at a low level before they reach the provider. Middleware wraps the language model via Vercel AI SDK's `wrapLanguageModel()` and can modify parameters, add headers, or intercept responses.

**Why this priority**: Middleware enables advanced features like custom headers and request modification without plugin complexity.

**Independent Test**: Register middleware, execute a request, and verify the middleware transforms are applied.

**Acceptance Scenarios**:

1. **Given** registered middleware, **When** a request executes, **Then** the model is wrapped with middleware before the API call
2. **Given** middleware added via plugin `configureContext`, **When** the plugin adds middleware to context, **Then** the middleware is applied during execution

---

### Edge Cases

- Provider returns unexpected response format; error hierarchy must classify correctly
- Streaming connection drops mid-response; graceful error recovery needed
- Multiple plugins modifying the same request field; sequential chaining (last write wins within chain)
- Rate limit error from provider triggers appropriate retry or backoff signal
- Empty response from provider handled without crash
- Plugin throws during execution; does not block other plugins' parallel hooks
- Very large response exceeding memory limits during generation mode
- Context window with unlimited threshold (100000) sends all messages
- Multi-model dispatch with one model failing and others succeeding; independent error handling per model
- Namespaced model ID (`provider:model`) vs traditional model ID resolution
- Recursive plugin call depth exceeds 10; RecursiveDepthError thrown
- Provider adapter not found for unknown provider type; falls back to openai-compatible

## Requirements

### Functional Requirements

- **FR-001**: System MUST integrate Vercel AI SDK v6 as the foundation for all AI operations, supporting `streamText()`, `generateText()`, and `generateImage()` entry points
- **FR-002**: System MUST implement a RuntimeExecutor class that wraps AI SDK calls with plugin and middleware pipelines, providing static factory methods `create()` and `createOpenAICompatible()`
- **FR-003**: System MUST implement a plugin system with the `AiPlugin` interface supporting 10 hook types: resolveModel, loadTemplate (first-wins), configureContext, transformParams, transformResult (sequential), onRequestStart, onRequestEnd, onError (parallel), and transformStream
- **FR-004**: System MUST implement PluginEngine and PluginManager classes managing plugin registration, ordering (pre/normal/post via `enforce` field), and lifecycle execution
- **FR-005**: System MUST provide provider adapter resolution for 7+ built-in providers (openai, anthropic, google, openrouter, xai, azure, deepseek) plus an openai-compatible mode for custom providers
- **FR-006**: System MUST implement ModelResolver supporting both traditional format (`modelId` + fallback provider) and namespaced format (`provider:modelId`) with caching
- **FR-007**: System MUST implement type-safe per-provider options builders (`createOpenAIOptions`, `createAnthropicOptions`, `createGoogleOptions`, `createOpenRouterOptions`, `createXaiOptions`) with deep merge support via `mergeProviderOptions()`
- **FR-008**: System MUST implement an error hierarchy with `AiCoreError` base class and subclasses: `ModelResolutionError`, `ParameterValidationError`, `PluginExecutionError`, `ProviderConfigError`, `TemplateLoadError`, `RecursiveDepthError`
- **FR-009**: System MUST implement streaming-first response delivery where `streamText()` returns an async iterable of text chunks with plugin stream transforms applied via `experimental_transform`
- **FR-010**: System MUST support recursive plugin calls with depth tracking and a configurable maximum (default 10) that throws `RecursiveDepthError` when exceeded
- **FR-011**: System MUST implement context window management that limits messages sent to the provider (default 5, max configurable 100, unlimited threshold 100000)
- **FR-012**: System MUST implement per-provider rate limiting with configurable delay in seconds between requests, blocking rapid requests with remaining wait time
- **FR-013**: System MUST implement a CherryIN custom AI SDK provider that routes model requests to appropriate backends (OpenAI, Anthropic, Gemini) based on endpoint type, supporting language, embedding, image, transcription, and speech models
- **FR-014**: System MUST implement middleware support where middleware wraps language models via Vercel AI SDK `wrapLanguageModel()`, applicable through direct registration or plugin `configureContext` hooks
- **FR-015**: System MUST include built-in plugins: logging plugin (configurable levels, performance tracking), tool-use plugin (prompt-based tool calling for models without native function call), web-search plugin (unified search across providers)

### Key Entities

- **RuntimeExecutor**: Core execution engine parameterized on ProviderId, holds RuntimeConfig and PluginEngine. No persistent storage — operates on transient execution contexts.
- **AiPlugin**: Plugin interface with 10 optional hooks, `name` identifier, and optional `enforce` ordering. Stateless contract.
- **AiRequestContext**: Per-request context carrying providerId, model, originalParams, metadata, recursion state, MCP tools, extensions map, and middlewares.
- **AiCoreError**: Base error class with code, message, context record, and optional cause chain.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 7+ provider types successfully resolve to correct Vercel AI SDK adapters and return valid responses
- **SC-002**: Streaming responses deliver first token callback within the AI SDK's own latency (no additional overhead from plugin pipeline > 50ms)
- **SC-003**: Plugin hooks execute in documented order: pre-enforce → normal → post-enforce, with first/sequential/parallel semantics verified
- **SC-004**: Error hierarchy correctly classifies provider errors into the 6 typed subclasses with code, message, and context preserved
- **SC-005**: Context window correctly limits messages to configured count (verified with counts 1, 5, 100, unlimited)
- **SC-006**: Rate limiting blocks requests arriving before the configured delay and allows requests after the delay
- **SC-007**: Options builders produce correctly typed provider-specific configuration for all supported providers
- **SC-008**: CherryIN provider correctly routes to OpenAI, Anthropic, and Gemini backends based on endpoint type
