# Feature Specification: Model Provider

**Feature Branch**: `004-model-provider`
**Created**: 2026-03-16
**Status**: Draft
**Input**: Model and provider management — multi-provider abstraction supporting 50+ system providers, model capabilities metadata, endpoint type routing, provider-specific API options. Provider settings UI embedded within Settings page as the default sub-page. Provides the AI core abstraction layer consumed by chat (F005) and downstream features.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Provider Configuration and Connection Testing (Priority: P1)

A user opens the Settings page and sees "Model Provider" as the first item in the settings sidebar (it is the default sub-page). The page lists all configured providers with visual status indicators showing enabled/disabled and connection status. The user clicks "Add Provider", selects a provider type (e.g., OpenAI) from a categorized list, enters their API key and optional custom endpoint URL, and clicks "Test Connection." The system validates the API key by making a lightweight API call and shows a success or failure result within 5 seconds. On success, the provider is saved and the model list is automatically fetched. The API key field masks the value by default with a show/hide toggle.

**Why this priority**: Without at least one configured provider, no AI feature can function. Provider setup is the absolute prerequisite for chat, knowledge, and all AI-powered features.

**Independent Test**: Add a provider with a valid API key, test the connection, and verify the model list appears. Add a provider with an invalid key and verify the error message.

**Acceptance Scenarios**:

1. **Given** the user navigates to Settings, **When** the page loads, **Then** the "Model Provider" sub-page is selected by default and shows the provider list [source: B081, B098]
2. **Given** the user clicks "Add Provider", **When** the provider type selector appears, **Then** it lists all available provider types (OpenAI, Anthropic, Google, Azure, Ollama, etc.) with icons [source: B089, B099]
3. **Given** the user has selected a provider type and entered an API key, **When** they click "Test Connection", **Then** the system validates the key via an API call and shows success/error within 5 seconds [source: B088]
4. **Given** a provider is successfully added, **When** the provider list refreshes, **Then** the new provider appears with an enabled status indicator [source: B084, B098]
5. **Given** the user views a provider's API key field, **When** the field is displayed, **Then** the key is masked by default; clicking the show/hide toggle reveals it [source: B100]
6. **Given** the user edits a provider's configuration, **When** they change the endpoint URL or API key, **Then** the changes are saved immediately without an explicit save action [source: B086]
7. **Given** the user wants to delete a provider that has models in use by assistants, **When** they click delete, **Then** a warning dialog shows which assistants depend on this provider before confirming [source: B087, B101]
8. **Given** a provider type does not require an API key (e.g., Ollama, LM Studio), **When** the add form is shown, **Then** the API key field is optional or hidden [source: B085]
9. **Given** a provider has a custom configuration field specific to its type (e.g., API version for Azure, Vertex project for Google), **When** the add/edit form is shown, **Then** type-specific fields are displayed [source: B090]

---

### User Story 2 - Model List Management (Priority: P1)

A user has configured a provider and wants to see available models. The system automatically fetches the model list from the provider API after initial setup. Models are displayed grouped by provider, showing name, capabilities (text, vision, function calling, reasoning), and optional pricing info. The user can manually refresh the model list, search/filter models, enable or disable individual models, and add custom models that are not listed in the provider's API.

**Why this priority**: Model selection is the second half of the provider setup flow. Users must be able to see, search, and select models before any AI operation can occur.

**Independent Test**: Fetch models from a configured provider, verify they appear grouped correctly. Search for a specific model name and verify filtering works. Add a custom model manually.

**Acceptance Scenarios**:

1. **Given** a provider is configured and connected, **When** the model list is fetched, **Then** models appear grouped by provider with name and capability badges [source: B082, B091, B093, B102]
2. **Given** the model list is displayed, **When** the user types in the search box, **Then** the list filters in real-time to show only matching models [source: B103]
3. **Given** the user clicks "Refresh" on the model list, **When** the refresh completes, **Then** the list updates with any new models from the provider API within 3 seconds [source: B091]
4. **Given** the provider API is unreachable during model fetch, **When** the fetch fails, **Then** the system falls back to the locally cached model list and shows an offline indicator
5. **Given** the user wants to add a custom model, **When** they click "Add Custom Model" and enter the model ID and capabilities, **Then** the custom model appears in the list for that provider [source: B095]
6. **Given** the user toggles a model's enabled/disabled switch, **When** the toggle changes, **Then** the model's availability for selection in chat is updated immediately [source: B104]
7. **Given** model pricing information is available, **When** the model detail is shown, **Then** input/output cost per million tokens is displayed [source: B094]
8. **Given** the user has model capability overrides (e.g., manually toggled "vision" capability), **When** the model list refreshes from API, **Then** user-set capability overrides are preserved [source: B093]

---

### User Story 3 - Model Selection and Provider Resolution (Priority: P1)

A user is in the chat interface and needs to select a model for their conversation. The model picker shows all enabled models from all active providers. When a model is selected, the system resolves the correct provider and endpoint type automatically. The selection persists per assistant so each assistant can use a different model. Switching models in an active conversation has no perceptible delay.

**Why this priority**: Model selection is the bridge between provider configuration and the chat experience. Without it, the user cannot start a conversation.

**Independent Test**: Select a model in the chat interface and verify the provider is correctly resolved. Switch models mid-conversation and verify no delay.

**Acceptance Scenarios**:

1. **Given** the user opens the model picker in chat, **When** the picker appears, **Then** it shows all enabled models from all active providers, grouped by provider [source: B083, B096]
2. **Given** the user selects a model, **When** the selection is made, **Then** the system resolves the correct provider and endpoint type based on the model's configuration [source: B097]
3. **Given** the user selects a model for an assistant, **When** they switch to a different assistant, **Then** each assistant retains its own model selection [source: B096, B097]
4. **Given** the user switches models mid-conversation, **When** the switch occurs, **Then** the change takes effect for the next message with no visible delay [source: B083]
5. **Given** a selected model's provider becomes disabled, **When** the user tries to send a message, **Then** an error message is shown indicating the provider is unavailable

---

### User Story 4 - AI Core Abstraction Layer (Priority: P1)

A downstream feature (chat, knowledge, translation) needs to call an AI model. The AI core provides a unified interface that normalizes request building and response parsing across all provider types. The core handles provider-specific URL transformations (Azure `/v1` suffix, Gemini `/openai` suffix, Ollama `/api` stripping), authentication methods (API key, OAuth), and endpoint type routing (openai, anthropic, gemini formats). Streaming is supported for all providers that offer it.

**Why this priority**: The AI core is the single integration point for all AI features. Every provider-specific quirk is handled here, preventing duplication across consuming features.

**Independent Test**: Send a chat completion request through the AI core for at least 3 different provider types and verify normalized responses.

**Acceptance Scenarios**:

1. **Given** a chat message is sent with an OpenAI-type provider, **When** the AI core processes the request, **Then** it uses the OpenAI chat completions format and returns a normalized response [source: B105, B106]
2. **Given** a chat message is sent with an Anthropic provider, **When** the AI core processes the request, **Then** it uses the Anthropic messages format with the correct x-api-key header [source: B108]
3. **Given** a streaming request is made, **When** the provider supports streaming, **Then** the AI core returns an async iterable of normalized chunks [source: B105]
4. **Given** an Azure OpenAI provider is configured, **When** a request is made, **Then** the AI core appends `/v1` to the base URL automatically
5. **Given** an Ollama provider is configured, **When** a request is made, **Then** the AI core strips the `/api` suffix from the base URL for compatibility
6. **Given** a provider returns an error, **When** the error is provider-specific (rate limit, auth failure, model not found), **Then** the AI core surfaces a user-friendly error message with provider context [source: B107]
7. **Given** a request fails due to a transient error, **When** the retry logic engages, **Then** the request is retried with appropriate backoff [source: B107]
8. **Given** the proxy is configured in app settings, **When** the AI core makes API calls, **Then** all requests route through the configured proxy

---

### User Story 5 - Provider Enable/Disable and System Providers (Priority: P2)

The system comes pre-configured with 50+ system provider definitions (OpenAI, Anthropic, Google, Azure, Ollama, Mistral, Groq, etc.) that include default endpoint URLs and known model lists. Users can enable/disable any provider. System providers cannot be deleted but can be disabled. The user can add custom provider instances of any supported type with their own endpoint and key.

**Why this priority**: System providers reduce setup friction — users only need to add an API key. Enable/disable gives granular control without losing configuration.

**Independent Test**: View the system provider list, enable one by adding an API key, disable another, and verify the model picker reflects the changes.

**Acceptance Scenarios**:

1. **Given** the app launches for the first time, **When** the provider list loads, **Then** 50+ system providers are listed with their default endpoints, all disabled until configured [source: B089]
2. **Given** a system provider entry, **When** the user adds an API key and enables it, **Then** the provider becomes active and its models appear in the model picker [source: B084]
3. **Given** a system provider, **When** the user attempts to delete it, **Then** the delete action is not available (system providers can only be disabled)
4. **Given** the user enables/disables a provider, **When** the toggle changes, **Then** the model picker immediately reflects the change [source: B084]

---

### User Story 6 - Provider-Specific API Options (Priority: P2)

Advanced users need fine-grained control over how their provider handles API requests. Each provider can have API behavior flags configured: support for array content, stream options, developer role, service tier, thinking parameters, API version, and verbosity. These options affect how request payloads are built for that specific provider.

**Why this priority**: Provider API options handle edge cases in multi-provider compatibility. Without them, some providers fail silently on unsupported parameters.

**Independent Test**: Configure a provider with specific API options (e.g., disable stream options for a legacy endpoint) and verify the request payload respects the flags.

**Acceptance Scenarios**:

1. **Given** the user opens a provider's advanced settings, **When** the API options panel appears, **Then** it shows toggles for provider-specific behaviors (array content support, stream options, developer role, etc.) [source: B090]
2. **Given** a provider has `isNotSupportStreamOptions` set to true, **When** a request is built for this provider, **Then** the stream_options parameter is omitted from the payload
3. **Given** a provider has custom HTTP headers configured, **When** a request is made, **Then** the custom headers are included in every API call

---

### User Story 7 - Provider Rate Limiting and Notes (Priority: P3)

A user can configure a per-provider rate limit (requests per minute) to avoid exceeding their API quota. Users can also add free-text notes to any provider for personal reference (e.g., "Team shared key — use sparingly").

**Why this priority**: Rate limiting and notes are convenience features for power users managing multiple provider accounts.

**Independent Test**: Set a rate limit on a provider, send rapid requests, and verify throttling. Add a note and verify it persists.

**Acceptance Scenarios**:

1. **Given** the user sets a rate limit of 10 RPM on a provider, **When** more than 10 requests are sent within a minute, **Then** excess requests are queued or throttled
2. **Given** the user adds a note to a provider, **When** the provider list is viewed, **Then** the note is visible in the provider details

---

### Edge Cases

- **API key invalid**: Clear, specific error message displayed (e.g., "Invalid API key" not generic "Connection failed"). Provider is not saved with invalid credentials.
- **Provider endpoint unreachable**: Timeout after configurable period, show retry option. Do not block the UI.
- **Rate limit hit during chat**: Surface the provider's rate limit message with cooldown information to the user.
- **Model deprecated by provider**: If a previously saved model ID is no longer in the API response, show a warning badge and suggest the closest alternative.
- **Multiple providers of same type**: Each instance is distinguished by user-given name. No conflict in model IDs.
- **Provider API returns unexpected model list**: Log the anomaly, fall back to locally cached list, show a notification.
- **Network offline**: Use cached model list for display. Show offline indicator. Block connection test with "No network" message.
- **API key with whitespace**: Auto-trim whitespace on paste/input before validation.
- **Provider base URL with trailing slash**: Normalize URL by stripping trailing slash before use.
- **Concurrent model list refresh**: Debounce refresh requests to prevent duplicate API calls.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST store provider configurations (type, name, API key, endpoint URL, enabled state) and persist them across app restarts [source: B081, B085, B086]
- **FR-002**: System MUST store model lists per provider with model ID, name, group, capabilities, endpoint type, and optional pricing [source: B082, B093, B094]
- **FR-003**: System MUST support active provider/model selection per assistant and persist the selection [source: B083, B096, B097]
- **FR-004**: System MUST provide enable/disable toggle for each provider, immediately affecting model availability [source: B084]
- **FR-005**: System MUST support adding new providers with type selection, API key, and endpoint URL configuration [source: B085, B099]
- **FR-006**: System MUST support editing provider configuration including API key, endpoint, and provider-specific fields [source: B086, B090, B100]
- **FR-007**: System MUST support deleting user-created providers with a confirmation dialog that warns if models are in use by assistants [source: B087, B101]
- **FR-008**: System MUST validate provider connection by making a test API call and reporting success or failure with specific error details [source: B088]
- **FR-009**: System MUST list all available provider types with their default configurations, supporting 50+ system provider definitions [source: B089]
- **FR-010**: System MUST fetch available models from provider APIs and cache the results locally for offline access [source: B091, B092]
- **FR-011**: System MUST support manual addition of custom models with user-defined ID, name, and capabilities [source: B095]
- **FR-012**: System MUST render the provider list with status indicators showing enabled/disabled and connection state [source: B098]
- **FR-013**: System MUST render the model list grouped by provider with capability badges (text, vision, function calling, reasoning, embedding, web search, rerank) [source: B102, B093]
- **FR-014**: System MUST support real-time model search and filtering within the model list [source: B103]
- **FR-015**: System MUST support enabling/disabling individual models per provider [source: B104]
- **FR-016**: System MUST provide a unified AI core interface that normalizes request building and response parsing across all provider types (openai, anthropic, gemini, azure-openai, vertexai, mistral, aws-bedrock, ollama, and others) [source: B105, B106]
- **FR-017**: System MUST support streaming responses for all providers that offer it, returning an async iterable of normalized chunks [source: B105]
- **FR-018**: System MUST handle provider-specific URL transformations: Azure OpenAI appends `/v1`, Gemini appends `/openai`, Ollama strips `/api` suffix
- **FR-019**: System MUST handle provider-specific error responses and surface user-friendly error messages with provider context [source: B107]
- **FR-020**: System MUST implement retry logic with appropriate backoff for transient API errors [source: B107]
- **FR-021**: System MUST support Anthropic-specific API integration including the messages API format and x-api-key authentication [source: B108]
- **FR-022**: System MUST route API requests through the configured proxy (from F001/F003 settings) when proxy is enabled
- **FR-023**: System MUST mask API keys in the UI by default with a show/hide toggle, and MUST NOT expose API keys in logs, exports, or IPC messages [source: B100]
- **FR-024**: System MUST support provider-specific API option flags (array content support, stream options, developer role, service tier, thinking parameters, API version, verbosity)
- **FR-025**: System MUST support endpoint type routing based on model configuration: openai, openai-response, anthropic, gemini, image-generation, jina-rerank
- **FR-026**: System MUST support Vertex AI OAuth-based authentication for Google Cloud providers [source: B109]
- **FR-027**: System MUST support per-provider custom HTTP headers
- **FR-028**: System MUST support per-provider rate limiting configuration (requests per minute)
- **FR-029**: System MUST auto-trim whitespace from API keys on input and normalize provider base URLs (strip trailing slash)
- **FR-030**: System MUST preserve user-set model capability overrides when refreshing the model list from the provider API
- **FR-031**: System MUST display the provider settings page as the default sub-page when navigating to Settings
- **FR-032**: System MUST use Angdu Studio branding in all provider identifiers, user agent strings, and configuration keys (no Cherry Studio references)

### Key Entities

- **Provider**: Represents a configured AI service provider — type, name, API key (encrypted), endpoint URL, enabled state, API options, models, system/custom flag, rate limit, notes, custom headers
- **Model**: Represents an AI model available from a provider — ID, provider reference, name, group, capabilities (text/vision/function calling/reasoning/embedding/web search/rerank with user override flags), endpoint type, pricing, supported endpoint types

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Provider add with connection test completes within 5 seconds of clicking "Test Connection" [source: B088]
- **SC-002**: Model list fetch from provider API completes within 3 seconds [source: B091]
- **SC-003**: Switching model selection in chat has no perceptible delay (< 100ms UI response) [source: B083]
- **SC-004**: API keys are never visible in plaintext in logs, data exports, or IPC messages [source: B100]
- **SC-005**: Offline mode: when network is unavailable, cached model list is displayed and provider settings remain fully navigable
- **SC-006**: User adds a provider, tests connection, fetches models, selects a model in chat — end-to-end flow completes without errors
- **SC-007**: User navigates to Settings → Model Provider is the default sub-page displayed [source: B098]
- **SC-008**: At least 3 different provider types (OpenAI, Anthropic, Ollama) produce correct normalized responses through the AI core [source: B105, B106]
- **SC-009**: Provider deletion warning correctly identifies all assistants using models from that provider [source: B087, B101]
- **SC-010**: Model search filters the list in real-time as the user types with no perceptible lag [source: B103]

### Assumptions

- Provider settings UI is embedded within the F003 Settings page as a sub-page, not a standalone page
- Model Provider is the first and default item in the settings sidebar (verified at runtime from source app)
- System providers are pre-defined in code, not fetched from a remote registry
- API key encryption uses Electron's safeStorage API (from F001 Config API)
- The Vercel AI SDK is used as the primary abstraction for multi-provider integration
- GitHub Copilot integration (B110) is excluded from core scope as a P3 edge case provider
- CherryAI-specific model remapping logic is dropped (Cherry-specific, not carried to Angdu Studio)
- All provider API calls are made from the main process (not renderer) for security
