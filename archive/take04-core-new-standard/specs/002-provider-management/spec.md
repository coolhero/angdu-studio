# Feature Specification: Provider Management

**Feature Branch**: `002-provider-management`
**Created**: 2026-03-04
**Status**: Draft
**Input**: Provider CRUD, model management, API key configuration, OAuth flows (CherryIN, Copilot, Anthropic, VertexAI), provider type registry with 63 system providers

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Provider Setup with API Key (Priority: P1)

A new user opens Cherry Studio and wants to use their existing OpenAI API key. They navigate to the provider list, find OpenAI in the system providers, enter their API key, and test the connection. Once verified, the provider is enabled and its models become available for chat.

**Why this priority**: Without at least one configured provider, no AI functionality works. This is the fundamental entry point for the entire application.

**Independent Test**: Can be fully tested by adding an API key to any system provider, verifying connectivity, and confirming models appear in selection. Delivers: a working AI provider ready for chat.

**Acceptance Scenarios**:

1. **Given** a fresh app install with 63 system providers (all disabled except CherryAI), **When** user selects the OpenAI provider and enters a valid API key, **Then** the provider is persisted and available after app restart
2. **Given** a provider with an API key entered, **When** user clicks "test connection", **Then** the system validates the key against the provider's API and shows pass/fail within 5 seconds
3. **Given** a provider with a valid API key, **When** the provider is enabled, **Then** its models appear in the model selection throughout the app
4. **Given** a provider with an invalid API key, **When** user tests the connection, **Then** a clear error message is shown explaining the failure (e.g., "Invalid API key", "Unauthorized")

---

### User Story 2 - Model Configuration and Capability Detection (Priority: P1)

A user wants to see which models are available from their configured provider and understand their capabilities. The system displays pre-configured models for each provider and detects model capabilities (vision, reasoning, embedding, function calling, web search, rerank) to enable or disable features accordingly.

**Why this priority**: Model selection with capability awareness is required before any AI interaction can occur. Downstream features (chat, knowledge base) rely on capability flags.

**Independent Test**: Can be tested by viewing models for a configured provider, verifying capability flags are present, and confirming model add/remove operations persist.

**Acceptance Scenarios**:

1. **Given** an enabled provider, **When** user views its models, **Then** pre-configured default models are displayed with their capabilities
2. **Given** a model with vision capability, **When** referenced by the chat feature, **Then** the vision flag is correctly reported as true
3. **Given** a provider with models, **When** user adds a custom model by ID, **Then** the model is added to the provider's model list (deduplicated by ID)
4. **Given** a provider with multiple models, **When** user removes a model, **Then** the model is removed from the provider's model list

---

### User Story 3 - Custom Provider Creation (Priority: P1)

A user runs a local LLM server (e.g., Ollama, LM Studio) or uses an OpenAI-compatible third-party service. They create a custom provider by specifying the name, API type, endpoint URL, and optionally an API key. The system normalizes the URL and validates the configuration.

**Why this priority**: Many users rely on local or third-party providers that are not in the system provider list. Custom provider support is essential for real-world usage.

**Independent Test**: Can be tested by creating a custom provider with a local endpoint URL, verifying URL normalization, and testing connectivity.

**Acceptance Scenarios**:

1. **Given** the provider list, **When** user creates a new custom provider with name, type (from 12 available types), and endpoint URL, **Then** the provider is created and added to the beginning of the provider list
2. **Given** a custom provider URL with a trailing slash, **When** the provider is saved, **Then** the trailing slash is automatically removed (URL normalization)
3. **Given** a custom provider, **When** user edits its name, endpoint, or API key, **Then** changes are persisted and reflected immediately
4. **Given** a custom provider, **When** user deletes it, **Then** the provider is removed from the list

---

### User Story 4 - OAuth Authentication (Priority: P2)

A user wants to use a provider that requires OAuth authentication (CherryIN, GitHub Copilot, Anthropic, or VertexAI). They initiate the OAuth flow from the provider settings, complete authentication in the browser or via device code, and the app receives and securely stores the credentials.

**Why this priority**: OAuth providers are important but not required for basic functionality — API key providers cover the majority of use cases.

**Independent Test**: Can be tested by initiating each OAuth flow, completing authentication, and verifying the provider becomes authenticated.

**Acceptance Scenarios**:

1. **Given** the CherryIN provider, **When** user initiates OAuth, **Then** the app opens the authorization URL with PKCE challenge and state parameter, and upon callback with the authorization code, exchanges it for access/refresh tokens and retrieves API keys
2. **Given** the GitHub Copilot provider, **When** user initiates OAuth, **Then** the app requests a device code, displays the user code and verification URL, polls for completion, and securely stores the encrypted access token
3. **Given** the Anthropic provider, **When** user initiates OAuth, **Then** the app opens the authorization URL with PKCE, accepts the pasted authorization code, exchanges it for tokens, and stores credentials with restricted file permissions
4. **Given** the VertexAI provider, **When** user provides GCP service account credentials (private key + client email + project ID + location), **Then** the app validates the credentials and obtains access tokens for API requests
5. **Given** an authenticated OAuth provider, **When** the access token expires, **Then** the system automatically refreshes using the refresh token (for CherryIN and Anthropic)

---

### User Story 5 - Provider Reordering and Organization (Priority: P2)

A user has multiple providers configured and wants to reorder them to put frequently used providers at the top. They also want to see system providers separately from user-created providers.

**Why this priority**: Organization improves usability once multiple providers are configured.

**Independent Test**: Can be tested by reordering providers and verifying the new order persists.

**Acceptance Scenarios**:

1. **Given** multiple configured providers, **When** user moves a provider to a new position, **Then** the provider list reflects the new order and persists across restarts
2. **Given** the provider list, **When** filtered by system/user, **Then** system providers (isSystem: true) appear separately from user-created providers
3. **Given** multiple providers, **When** user enables or disables a provider, **Then** the enabled state persists and only enabled providers are available for model selection

---

### User Story 6 - Provider-Specific Settings (Priority: P2)

A user needs to configure advanced provider settings such as custom HTTP headers, API version overrides, rate limiting, or provider-specific API capability flags.

**Why this priority**: Advanced settings are needed for enterprise/custom setups but not for basic usage.

**Independent Test**: Can be tested by configuring rate limits and custom headers on a provider and verifying they are persisted and applied.

**Acceptance Scenarios**:

1. **Given** a provider, **When** user sets a rate limit (seconds between requests), **Then** the rate limit is persisted and enforced during API calls
2. **Given** a provider, **When** user adds custom HTTP headers, **Then** the headers are included in all API requests to that provider
3. **Given** an Azure OpenAI provider, **When** user sets the API version, **Then** the version is included in API requests
4. **Given** a provider, **When** user configures API capability flags (e.g., disabling stream options), **Then** the flags are persisted and respected by the AI engine
5. **Given** a provider with a dual-endpoint configuration (OpenAI + Anthropic endpoints), **When** a Claude model is used through the provider, **Then** the request routes through the Anthropic endpoint

---

### User Story 7 - CherryAI Fallback Provider (Priority: P3)

The system ensures CherryAI is always available as a fallback provider, even if no other providers are configured. This provides out-of-box AI functionality with default models.

**Why this priority**: A convenience feature that improves first-run experience but is not required for users who configure their own providers.

**Independent Test**: Can be tested by verifying CherryAI appears in the enabled provider list without any configuration.

**Acceptance Scenarios**:

1. **Given** a fresh install with no user configuration, **When** the app starts, **Then** the CherryAI provider is available with its default models (Qwen 3 variants)
2. **Given** the CherryAI provider, **When** user views the enabled provider list, **Then** CherryAI is always present regardless of other provider configurations
3. **Given** a model selection request with no explicitly configured provider, **When** the system resolves the default provider, **Then** CherryAI is used as the fallback

---

### User Story 8 - Default Model Selection (Priority: P3)

A user wants to set default models for different purposes: general chat, topic naming (auto-generated conversation titles), quick actions, and translation. These defaults determine which model is used when no explicit model is specified.

**Why this priority**: Defaults improve UX once providers are configured but the app works without explicit defaults (falls back to CherryAI defaults).

**Independent Test**: Can be tested by setting a default model and verifying it is used for new conversations.

**Acceptance Scenarios**:

1. **Given** one or more configured providers with models, **When** user sets a default model for chat, **Then** new conversations use that model by default
2. **Given** default models configured, **When** the app is restarted, **Then** all default model selections persist
3. **Given** a default model whose provider becomes disabled, **When** a new conversation starts, **Then** the system falls back to the CherryAI default model

---

### Edge Cases

- Provider with an invalid or expired API key shows a clear, specific error message (not a generic failure)
- Model list request to an unreachable endpoint times out gracefully within 10 seconds
- Custom provider with a non-standard API response format degrades gracefully
- Provider URL with or without trailing slash is handled consistently (always normalized)
- Concurrent provider connectivity checks do not interfere with each other
- Provider deletion when models are actively referenced by assistants warns the user
- OAuth token expiry and refresh are handled transparently without user intervention
- CherryAI injection failure (e.g., network error to cherry-ai.com) does not block other providers
- Fallback provider resolution when both requested and default providers are unavailable returns a meaningful error
- Copilot device code polling respects exponential backoff (1s to 16s, max 8 attempts)
- CherryIN OAuth enforces host allowlisting to prevent SSRF attacks
- Anthropic OAuth handles both legacy (`code#state`) and modern code formats
- VertexAI private key supports multiple PEM format variants (escaped newlines, raw base64, full PEM)
- Adding a model that already exists (same ID) deduplicates silently
- System providers cannot have their `apiOptions` modified (enforced by type system)
- CherryIN pending OAuth flows expire after 10 minutes

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST manage a provider registry with 63 pre-configured system providers and support unlimited user-created providers
- **FR-002**: System MUST support 12 provider API types: `openai`, `openai-response`, `anthropic`, `gemini`, `azure-openai`, `vertexai`, `mistral`, `aws-bedrock`, `vertex-anthropic`, `new-api`, `gateway`, `ollama`
- **FR-003**: System MUST provide provider CRUD operations: create (added to beginning of list), read, update, delete with persistence across app restarts
- **FR-004**: System MUST manage models per provider with add (deduplicated by ID), remove, and update operations; adding a model automatically enables the provider
- **FR-005**: System MUST detect and expose model capabilities: vision, embedding, reasoning, function_calling, web_search, rerank
- **FR-006**: System MUST store API keys and support connectivity testing that returns pass/fail within 5 seconds
- **FR-007**: System MUST implement GitHub Copilot OAuth via Device Code Flow (RFC 8628) with encrypted token storage using OS-level secure storage
- **FR-008**: System MUST implement CherryIN OAuth via Authorization Code Flow with PKCE (RFC 7636), deep link callback, host allowlisting, and automatic token refresh on 401
- **FR-009**: System MUST implement Anthropic OAuth via Authorization Code Flow with PKCE, manual code paste-back, file-based credential storage with restricted permissions (0o600), and expiry-based token refresh
- **FR-010**: System MUST implement VertexAI authentication via GCP service account credentials (private key + client email) with auth client caching and automatic token refresh
- **FR-011**: System MUST normalize provider URLs by removing trailing slashes
- **FR-012**: System MUST inject CherryAI as an always-available provider with default Qwen models, regardless of user configuration
- **FR-013**: System MUST separate system providers (read-only base config, 63 pre-configured) from user-created providers (fully editable)
- **FR-014**: System MUST provide fallback default provider resolution when a requested provider is not found
- **FR-015**: System MUST support provider-specific settings: custom HTTP headers, rate limits (seconds between requests), API version (Azure), API capability flags, service tier (OpenAI/Groq), and dual-endpoint configuration (OpenAI + Anthropic endpoints)
- **FR-016**: System MUST support provider reordering (move to specific position) with persistence
- **FR-017**: System MUST manage default model selections for four purposes: general chat, topic naming, quick actions, and translation
- **FR-018**: System MUST store AWS Bedrock credentials (IAM access key + secret, or API key + region) in provider settings. Actual authentication flow deferred to F003-ai-core-engine (provider adapter layer)
- **FR-019**: System MUST provide per-provider settings storage for: Ollama/LMStudio/GPUStack keep-alive time, VertexAI service account, AWS Bedrock credentials, CherryIN tokens

### Key Entities

- **Provider**: Represents an AI service endpoint. Key attributes: unique ID, display name, API type (12 types), API key, endpoint URL, enabled state, system flag, rate limit, custom headers, API version, models list, authentication state, API capability flags. System providers have fixed IDs from a predefined registry.
- **Model**: Represents an AI model within a provider. Key attributes: model ID, display name, owning provider, group/family, capability flags (vision, embedding, reasoning, function_calling, web_search, rerank), max tokens, context window, pricing, endpoint type.
- **ProviderType**: Enumeration of 12 API protocol types that determines how requests are formatted and sent.
- **SystemProviderId**: Enumeration of ~55 predefined provider identifiers for system providers.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 12 provider API types can be configured and tested for connectivity successfully
- **SC-002**: Model capability flags (vision, embedding, reasoning, function_calling, web_search, rerank) are correctly exposed for each model across all provider types
- **SC-003**: Provider API key validation returns pass/fail within 5 seconds for all provider types
- **SC-004**: All provider CRUD operations (create, read, update, delete, reorder) persist correctly across app restarts
- **SC-005**: Custom providers with non-standard endpoint URLs (local, third-party) connect and return models successfully
- **SC-006**: OAuth flows complete successfully for all 4 supported providers (CherryIN via PKCE + deep link, Copilot via device code, Anthropic via PKCE + manual code, VertexAI via service account)
- **SC-007**: CherryAI fallback provider is always available in the enabled provider list, even with no user configuration
- **SC-008**: Default model selections for all 4 purposes (chat, topic naming, quick actions, translation) persist across restarts
- **SC-009**: Provider URL normalization consistently removes trailing slashes for all provider types
- **SC-010**: Token refresh works transparently for CherryIN (401-triggered) and Anthropic (expiry-based) without user intervention
