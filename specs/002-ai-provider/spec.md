# Feature Specification: AI Provider

**Feature Branch**: `002-ai-provider`
**Created**: 2026-03-08
**Status**: Draft
**Input**: Multi-provider LLM abstraction layer supporting 11+ provider types via a factory pattern, with middleware plugin pipeline for request/response transformation, streaming support, and per-provider authentication and configuration management.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Provider Setup & Model Selection (Priority: P1)

User opens the provider settings, adds a new AI provider by selecting a provider type (e.g., OpenAI, Anthropic, Gemini), entering an API key and optional base URL. The provider is validated and its models become available for selection. User sets a default model for conversations, a quick model for lightweight tasks, and optionally a translate model.

**Why this priority**: Without at least one configured provider and selected model, no AI features work. This is the entry gate for all downstream functionality.

**Independent Test**: Add an OpenAI-compatible provider with API key, verify models appear, select a default model, start a conversation and confirm it uses the selected model.

**Acceptance Scenarios**:

1. **Given** no providers are configured, **When** the user adds a provider with type "openai", API key, and base URL, **Then** the provider is saved and appears in the provider list [source: B017, B021]
2. **Given** a provider is added, **When** the user clicks "Check" to validate, **Then** the system verifies API key, endpoint reachability, and shows success/failure status [source: BL-010]
3. **Given** a validated provider, **When** the user views its model list, **Then** available models are displayed with their capabilities (vision, reasoning, etc.) [source: B022]
4. **Given** multiple providers with models, **When** the user selects a default model, **Then** it becomes the active model for new conversations [source: B023]
5. **Given** multiple models, **When** the user sets quick and translate model selections, **Then** these are persisted and used for their respective functions [source: B023]

---

### User Story 2 - AI Completion with Streaming (Priority: P1)

User sends a message in a conversation. The system resolves the active provider and model, builds request parameters with model-specific overrides, and sends the completion request. The response streams back in real-time, appearing token-by-token in the chat. Token usage is tracked and reported.

**Why this priority**: Streaming completion is the core interaction loop. Every AI feature depends on this working correctly.

**Independent Test**: Configure a provider, send a message, observe streaming response appearing incrementally, verify token usage is recorded.

**Acceptance Scenarios**:

1. **Given** a configured provider and selected model, **When** the user sends a message, **Then** the system resolves the provider type to the correct SDK client via factory pattern [source: B016, BL-006]
2. **Given** a valid request, **When** the AI starts responding, **Then** the response streams token-by-token to the UI [source: B018, B020]
3. **Given** a streaming response, **When** all tokens are received, **Then** token usage (input/output) is recorded for the request [source: B030]
4. **Given** a provider that does not support streaming, **When** the user sends a message, **Then** the system simulates streaming by chunking the complete response [source: B029]
5. **Given** request parameters, **When** building the API call, **Then** model-specific overrides (temperature, topK, frequencyPenalty, etc.) are applied correctly [source: B034, BL-008]

---

### User Story 3 - Plugin Pipeline (Priority: P1)

The system applies a configurable chain of middleware plugins to every AI request. Plugins modify requests and responses at defined lifecycle hooks. For example, the reasoning extraction plugin extracts thinking content, the cache plugin adds caching headers for Anthropic, and the telemetry plugin tracks performance metrics.

**Why this priority**: The plugin system enables critical behaviors (reasoning display, caching, telemetry) that differentiate the app. Without it, responses would be raw and unprocessed.

**Independent Test**: Send a message to a model that supports reasoning/thinking, verify thinking content is extracted and displayed separately from the main response.

**Acceptance Scenarios**:

1. **Given** plugins are configured, **When** a request is sent, **Then** plugins execute in the correct order (pre-plugins before post-plugins) [source: B019, BL-052]
2. **Given** a model that supports reasoning, **When** the response contains thinking content, **Then** the reasoning extraction plugin separates it into a thinking block [source: B028]
3. **Given** an Anthropic provider with cache control enabled, **When** a request is sent, **Then** the cache plugin adds appropriate cache control headers [source: BL-009]
4. **Given** any AI request, **When** the request completes, **Then** the telemetry plugin records timing and usage metrics [source: B030]
5. **Given** provider-specific options (service tier, developer role, stream options), **When** building the request, **Then** these options are passed correctly to the API call [source: B031]

---

### User Story 4 - Provider CRUD & Reordering (Priority: P1)

User manages their collection of AI providers. They can add new providers, edit existing configurations (API key, base URL, enabled/disabled), remove providers, and reorder them. Each provider's model list can be independently managed (add, remove, update models).

**Why this priority**: Provider management is essential for multi-provider support and user customization.

**Independent Test**: Add two providers, edit one's API key, disable the other, reorder them, verify changes persist across app restarts.

**Acceptance Scenarios**:

1. **Given** the provider list, **When** the user adds a new provider, **Then** it appears in the list with correct type and configuration [source: B021]
2. **Given** an existing provider, **When** the user updates its API key or base URL, **Then** the changes are persisted and take effect on next request [source: B021]
3. **Given** multiple providers, **When** the user removes one, **Then** it is deleted and its models are no longer available [source: B021]
4. **Given** a provider, **When** the user adds or removes models, **Then** the model list updates accordingly [source: B022]
5. **Given** multiple providers, **When** the user reorders them, **Then** the new order is persisted [source: B021]

---

### User Story 5 - Provider-Specific Authentication (Priority: P2)

User configures provider-specific authentication methods beyond simple API keys. VertexAI requires a Google Cloud service account with project and location settings. AWS Bedrock requires IAM credentials. Anthropic supports OAuth flow. GitHub Copilot uses token-based authentication.

**Why this priority**: Enterprise and cloud providers require specialized auth. Important for advanced users but not blocking for basic API key providers.

**Independent Test**: Configure a VertexAI provider with service account credentials, verify it authenticates successfully and lists models.

**Acceptance Scenarios**:

1. **Given** a VertexAI provider, **When** the user enters service account JSON, project ID, and location, **Then** the system authenticates and lists available models [source: B024]
2. **Given** an AWS Bedrock provider, **When** the user configures access key, secret, and region, **Then** the system authenticates via IAM [source: B025]
3. **Given** an Anthropic provider, **When** the user initiates OAuth, **Then** the system completes the OAuth flow and stores tokens [source: B026]
4. **Given** a GitHub Copilot provider, **When** the user authenticates, **Then** the system manages access tokens and refreshes them as needed [source: B027]

---

### User Story 6 - Model Capability Detection & Reasoning (Priority: P2)

The system detects model capabilities (vision, reasoning, function calling, web search) and adjusts behavior accordingly. For models with reasoning support, thinking mode is automatically enabled when reasoning effort is configured. Provider-specific reasoning parameters are applied (Anthropic extended thinking, OpenAI reasoning effort, etc.).

**Why this priority**: Capability detection enables proper feature gating and optimal use of each model's strengths.

**Independent Test**: Select a reasoning-capable model, configure reasoning effort, send a message, verify thinking content appears separately.

**Acceptance Scenarios**:

1. **Given** a model with vision capability, **When** the user attaches an image, **Then** the system includes the image in the request [source: BL-007]
2. **Given** a model with reasoning support and configured reasoning effort, **When** a request is sent, **Then** thinking mode is enabled with appropriate provider parameters [source: BL-053]
3. **Given** a model without streaming support, **When** a request is sent, **Then** the system falls back to simulated streaming [source: B029]
4. **Given** a model with provider-specific file size limits, **When** the user uploads a file, **Then** the correct size limit is enforced (e.g., Anthropic 32MB, Gemini 20MB inline) [source: BL-007]

---

### User Story 7 - OpenAI Response API Support (Priority: P2)

The system supports the OpenAI Response API format as a distinct provider type alongside the standard Completions API. This allows users to access response-format-specific features while maintaining backward compatibility.

**Why this priority**: Broadens compatibility with OpenAI's evolving API surface. Not blocking but important for users who need response-format features.

**Independent Test**: Configure a provider with "openai-response" type, send a message, verify the correct API format is used.

**Acceptance Scenarios**:

1. **Given** a provider with type "openai-response", **When** a request is sent, **Then** it uses the Response API format instead of Completions [source: B033]
2. **Given** both "openai" and "openai-response" providers, **When** viewing the provider list, **Then** they are distinguished clearly [source: B033]

---

### User Story 8 - Tool Integration in AI Pipeline (Priority: P2)

The system integrates external tools (MCP tools, web search) into the AI request pipeline. When tools are available and the model supports function calling, tools are included in the request parameters and tool call results are processed in the response.

**Why this priority**: Tool integration enables agent-like behavior but depends on F006 for full MCP support. Core pipeline integration must be ready.

**Independent Test**: Configure a tool-capable model, include a web search tool, send a query, verify tool calls appear in the response.

**Acceptance Scenarios**:

1. **Given** a model with function_calling capability and available tools, **When** a request is sent, **Then** tools are included in the request parameters [source: B035]
2. **Given** a tool call in the response, **When** the tool executes, **Then** the result is fed back into the conversation [source: B035]

---

### Edge Cases

- What happens when an API key is invalid or expired? → Provider health check shows failure, requests return clear error message to user
- What happens when a provider endpoint is unreachable? → Timeout after configurable period, error displayed, fallback to other configured providers not attempted (user must switch manually)
- What happens when streaming is interrupted mid-response? → Partial response is preserved, user can retry from the last message
- What happens when token limit is exceeded? → Clear error message with token count, user can shorten input or switch to a model with higher limits
- What happens when the provider factory encounters an unknown type? → Error logged, user notified with supported provider types list
- What happens when multiple API keys are configured (comma-separated)? → Keys are rotated per-request for load distribution
- What happens when the plugin pipeline throws an error? → Error is caught, request continues without the failing plugin, warning logged

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support at least 11 provider types (openai, openai-response, anthropic, gemini, azure-openai, vertexai, mistral, aws-bedrock, vertex-anthropic, new-api, gateway, ollama) via a factory pattern that resolves provider type to SDK client [source: B016, BL-006]
- **FR-002**: System MUST manage provider configurations including API key, base URL, enabled/disabled state, and per-provider options with full CRUD operations and reordering [source: B021]
- **FR-003**: System MUST support streaming AI completions, delivering tokens incrementally to the UI as they are received [source: B018, B020]
- **FR-004**: System MUST support non-streaming completions with simulated streaming for providers that lack native streaming [source: B029]
- **FR-005**: System MUST apply a configurable middleware plugin pipeline to AI requests with lifecycle hooks (configureContext, onRequestStart, transformParams, onRequestEnd) and enforce ordering (pre/post) [source: B019, BL-052]
- **FR-006**: System MUST handle provider-specific authentication: API keys, OAuth flows (Anthropic), service accounts (VertexAI), IAM credentials (AWS Bedrock), and token management (GitHub Copilot) [source: B024, B025, B026, B027]
- **FR-007**: System MUST track and report token usage (input/output tokens) per request for all providers [source: B030]
- **FR-008**: System MUST manage per-provider model lists with add, remove, and update operations [source: B022]
- **FR-009**: System MUST allow setting default, quick, and translate model selections that persist across sessions [source: B023]
- **FR-010**: System MUST detect model capabilities (vision, reasoning, function calling, web search, reranking) and adjust request behavior accordingly [source: BL-007]
- **FR-011**: System MUST support reasoning/thinking mode detection and configuration with provider-specific parameters (Anthropic extended thinking, OpenAI reasoning effort, Qwen think toggle) [source: BL-053]
- **FR-012**: System MUST support the OpenAI Response API format as a distinct provider type alongside the Completions API [source: B033]
- **FR-013**: System MUST prepare request parameters with model-specific overrides (temperature, topK, frequencyPenalty, presencePenalty, stopSequences, seed) [source: B034, BL-008]
- **FR-014**: System MUST validate provider connectivity via health check (API key presence, endpoint reachability, model list availability) [source: BL-010]
- **FR-015**: System MUST integrate external tools (MCP, web search) into the AI request pipeline when available [source: B035]
- **FR-016**: System MUST extract reasoning/thinking content from model responses into separate display blocks [source: B028]
- **FR-017**: System MUST handle Anthropic-specific beta header injection, conditionally assembling feature flags while skipping for AWS Bedrock providers [source: BL-009]
- **FR-018**: System MUST support provider-specific API options including service tiers, developer roles, and stream options [source: B031]
- **FR-019**: System MUST persist all provider and model configurations using Zustand store (migrated from Redux) with reactive updates [source: B021, B022]
- **FR-020**: System MUST use Angdu-branded identifiers (angduIn, AngduINOAuthService, IpcChannel.AngduIN_*, angduai) replacing all Cherry-branded identifiers

### Key Entities

- **Provider**: AI service provider configuration — id, name, type (ProviderType), apiKey, apiHost, models[], enabled, isSystem, apiOptions, authType, extra_headers
- **Model**: AI model within a provider — id, name, provider, group, capabilities[], pricing, endpoint_type
- **LlmState**: Application-level AI state — providers[], defaultModel, quickModel, translateModel, settings (per-provider config)
- **ProviderType**: Enumeration of supported provider types (11 values)
- **ProviderApiOptions**: Per-provider feature support flags (streaming, function calling, vision, etc.)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 11 provider types resolve through the factory without errors when properly configured
- **SC-002**: Streaming response tokens appear in the UI within 500ms of the first token arriving at the application
- **SC-003**: Token usage (input/output) is accurately tracked and reported for 100% of completed requests
- **SC-004**: Plugin pipeline executes all registered plugins in correct order (pre before post) without data loss between plugins
- **SC-005**: Provider CRUD operations (add, edit, remove, reorder) persist correctly across app restarts
- **SC-006**: Provider health check completes within 10 seconds and accurately reports connectivity status
- **SC-007**: Model capability detection correctly identifies vision, reasoning, and function calling support for all system-defined models
- **SC-008**: Default, quick, and translate model selections persist across sessions and are correctly applied in their respective contexts
- **SC-009**: Non-streaming providers deliver responses via simulated streaming indistinguishable from native streaming in UI behavior
- **SC-010**: Provider-specific authentication (OAuth, service accounts, IAM) completes successfully when valid credentials are provided
