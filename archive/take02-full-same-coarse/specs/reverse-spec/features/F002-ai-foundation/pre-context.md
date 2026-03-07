# Pre-Context: AI Foundation

**Feature ID**: F002-ai-foundation
**Tier**: Tier 1
**Generated**: 2026-03-02

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` → `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/renderer/src/types/provider.ts` | Provider type definitions (ProviderType, SystemProviderIds) |
| `src/renderer/src/types/index.ts` | Model, Assistant, AssistantSettings, Topic types |
| `src/renderer/src/store/llm.ts` | Provider/model Redux slice |
| `src/renderer/src/store/assistants.ts` | Assistant/topic Redux slice |
| `src/renderer/src/config/providers.ts` | 60+ provider logo configurations |
| `src/renderer/src/config/models/` | Model capability configs |
| `src/renderer/src/services/ProviderService.ts` | Provider service |
| `src/renderer/src/services/ModelService.ts` | Model management service |
| `src/renderer/src/services/AssistantService.ts` | Assistant CRUD service |
| `src/renderer/src/aiCore/provider/factory.ts` | AI SDK provider factory |
| `src/renderer/src/aiCore/provider/providerConfig.ts` | Provider configuration |
| `src/renderer/src/aiCore/provider/providerInitialization.ts` | Provider initialization |
| `src/renderer/src/aiCore/provider/config/` | Provider-specific configs (aihubmix, azure, newApi, etc.) |
| `src/renderer/src/aiCore/provider/constants.ts` | Provider constants |
| `packages/shared/config/providers.ts` | Shared provider utilities |
| `src/renderer/src/pages/settings/ProviderSettings/` | Provider settings UI |
| `src/renderer/src/pages/settings/ModelSettings/` | Model settings UI |
| `src/renderer/src/pages/settings/AssistantSettings/` | Assistant settings UI |
| `src/renderer/src/pages/store/` | Assistant marketplace/store page |
| `src/renderer/src/services/MarketplaceService.ts` | Marketplace service |
| `src/renderer/src/hooks/useAssistant.ts` | Assistant hook |
| `src/renderer/src/hooks/useModel.ts` | Model hook |
| `src/renderer/src/hooks/useProvider.ts` | Provider hook |
| `resources/data/agents-en.json` | Pre-built agent prompts (English) |
| `resources/data/agents-zh.json` | Pre-built agent prompts (Chinese) |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [Same Stack] Implementation Reference
- Actively reference and reuse existing implementation patterns
- **Key reference points**: Redux Toolkit slice pattern for provider/model/assistant state; AI SDK provider mapping from Cherry Studio ID to Vercel AI SDK provider ID; provider configuration factory pattern; assistant preset loading and marketplace integration
- **Reusable code**:
  - `src/renderer/src/store/llm.ts:llmSlice` — Provider and model state management with CRUD reducers; reuse for provider lifecycle
  - `src/renderer/src/store/assistants.ts:assistantsSlice` — Assistant and topic state management with nested entity updates; reuse for assistant/topic lifecycle
  - `src/renderer/src/aiCore/provider/factory.ts:createProviderInstance` — Maps Cherry Studio provider types to Vercel AI SDK adapters; reuse for all AI SDK integrations
  - `src/renderer/src/aiCore/provider/providerConfig.ts:getProviderConfig` — Provider-specific configuration resolution; reuse for API endpoint and auth configuration
  - `src/renderer/src/services/ProviderService.ts:ProviderService` — Provider CRUD with API key validation and connectivity check; reuse for provider management
  - `src/renderer/src/services/ModelService.ts:ModelService` — Model listing with capability detection; reuse for model management
  - `src/renderer/src/services/AssistantService.ts:AssistantService` — Assistant CRUD with default settings inheritance; reuse for assistant lifecycle
  - `src/renderer/src/hooks/useProvider.ts:useProvider` — React hook for provider state access; reuse for UI components
  - `src/renderer/src/config/providers.ts:providerConfigs` — Logo and display name configuration for 60+ providers; reuse for provider UI rendering

### Static Resources

> Non-code files used by this Feature that must be **copied from the original source** during implementation.
> These files cannot be regenerated — they must be copied as-is and placed in the appropriate location in the new project.
> Source Path is **relative to Source Root** (same as file paths above). Resolve as `[Source Root]/[Source Path]` at runtime.

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| `src/renderer/src/assets/images/providers/` | Image | `src/renderer/src/assets/images/providers/` | 80 provider logo files (PNG/SVG) for provider list UI |
| `src/renderer/src/assets/images/models/` | Image | `src/renderer/src/assets/images/models/` | 145 model logo files (PNG/SVG) for model selection UI |
| `resources/data/agents-en.json` | Data | `resources/data/agents-en.json` | Pre-built agent prompts in English (6242 lines) |
| `resources/data/agents-zh.json` | Data | `resources/data/agents-zh.json` | Pre-built agent prompts in Chinese (6242 lines) |

> If resources need modification (e.g., resizing images, updating translation keys), note it in the Usage column.

### Environment Variables

> Environment variables required by this Feature at runtime. Variables marked as `secret` must NOT have their actual values recorded here — only the variable name and purpose.

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| `MAIN_VITE_CHERRYAI_CLIENT_SECRET` | secret | No | CherryAI client secret injected at build time for CherryAI provider integration | — |

**Shared variables** (defined by other Features but also used here):

| Variable | Owner Feature | Usage in This Feature |
|----------|--------------|----------------------|
| `NODE_OPTIONS` | F001-platform | Node.js memory limit for model listing and provider operations |
| `CSLOGGER_MAIN_LEVEL` | F001-platform | Log level for provider-related main process logging |
| `CSLOGGER_RENDERER_LEVEL` | F001-platform | Log level for provider/model/assistant renderer logging |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F002-ai-foundation manages the provider registry, model catalog, and assistant/topic CRUD that underpin all AI interactions. It defines 60+ pre-configured AI providers (OpenAI, Anthropic, Google, Azure, etc.) with their API configurations, maps them to Vercel AI SDK adapters via a factory pattern, and provides model capability detection (vision, embedding, reasoning, function calling, web search, rerank). It also manages the assistant entity lifecycle including system prompts, model selection, per-assistant settings, and a marketplace for pre-built assistant presets.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Add a provider | User adds a new AI provider (e.g., OpenAI) by entering API key and endpoint URL; provider becomes available for model selection |
| P1 | Configure models | User views available models for a provider; system detects model capabilities (vision, function calling, etc.) |
| P1 | Create assistant | User creates a new assistant with a system prompt and model selection; assistant appears in the sidebar |
| P1 | Manage topics | User creates, renames, pins, or deletes topics within an assistant; topics organize conversation threads |
| P2 | Test provider connectivity | User clicks "check" on a provider; system validates the API key and endpoint are working |
| P2 | Browse marketplace | User browses the assistant marketplace; selects and imports a pre-built assistant with configured prompts |
| P2 | Custom provider | User adds a custom OpenAI-compatible provider with custom API endpoint URL |
| P3 | OAuth provider setup | User authenticates with Copilot, CherryIN, Anthropic, or VertexAI providers via OAuth flow |
| P3 | Model capability config | User views and adjusts model capabilities (e.g., marks a model as supporting vision) |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Provider CRUD with 60+ pre-configured providers and custom provider support
- **FR-002**: Model listing with capability detection (vision, embedding, reasoning, function_calling, web_search, rerank)
- **FR-003**: AI SDK integration mapping (12 provider types to Vercel AI SDK adapters)
- **FR-004**: Assistant CRUD with system prompt, model selection, and settings
- **FR-005**: Topic management within assistants (CRUD, pinning, naming)
- **FR-006**: Assistant marketplace with preset loading from bundled JSON and remote sources
- **FR-007**: Provider-specific URL formatting and API compatibility options
- **FR-008**: OAuth support for Copilot, CherryIN, Anthropic, VertexAI providers

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: All 60+ providers can be configured and tested for connectivity
- **SC-002**: Model capabilities correctly detected for each provider type
- **SC-003**: Assistant presets load from marketplace and local JSON data
- **SC-004**: Provider API key validation returns pass/fail within 5 seconds
- **SC-005**: Assistant creation with default settings completes without errors
- **SC-006**: Topic CRUD operations persist across app restarts

### Edge Cases

- Provider with invalid or expired API key returns clear error message
- Model list request to unreachable endpoint times out gracefully
- Custom provider with non-standard API response format handled by compatibility options
- Assistant with deleted model gracefully falls back to default model selection
- Marketplace data fetch failure falls back to bundled agent JSON files
- Concurrent provider connectivity checks do not interfere with each other
- Provider URL with or without trailing slash handled consistently
- Model capability override by user takes precedence over auto-detection

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-platform | IPC bridge | Uses file:* IPC channels for API key secure storage; uses config:* for provider configuration persistence |
| F001-platform | Redux store | Provider, model, and assistant slices integrate into F001's Redux store with selective persistence |
| F001-platform | Settings UI | Provider, model, and assistant settings pages use F001's settings layout components |
| F001-platform | Database | Dexie schema must include tables for providers, models, assistants, and topics |

### Related Entities (data-model.md draft)

#### Owned Entities

**Provider** — Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique provider identifier |
| name | string | required | Display name |
| type | ProviderType | required | Provider type enum (openai, anthropic, gemini, etc.) |
| apiKey | string | optional | API key (encrypted at rest) |
| apiHost | string | optional | Custom API endpoint URL |
| models | Model[] | required | List of available models |
| enabled | boolean | required | Whether provider is active |
| isSystem | boolean | required | Whether provider is pre-configured |
| isAuthed | boolean | optional | Whether OAuth authentication is complete |

**Model** — Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Model identifier (provider-specific) |
| name | string | required | Display name |
| provider | string | FK → Provider | Owning provider ID |
| group | string | optional | Model group/family |
| capabilities | object | required | Capability flags (vision, embedding, reasoning, function_calling, web_search, rerank) |
| maxTokens | number | optional | Maximum output tokens |
| contextWindow | number | optional | Maximum context window size |

**Assistant** — Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique assistant identifier |
| name | string | required | Display name |
| prompt | string | optional | System prompt text |
| model | Model | optional | Default model for this assistant |
| settings | AssistantSettings | required | Per-assistant settings (temperature, topP, maxTokens, etc.) |
| topics | Topic[] | required | Conversation topics within this assistant |
| type | string | required | Assistant type (default, agent) |
| knowledgeBaseIds | string[] | optional | Associated knowledge base IDs |

**AssistantSettings** — Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| temperature | number | 0-2 | Sampling temperature |
| topP | number | 0-1 | Top-p sampling |
| maxTokens | number | optional | Maximum output tokens |
| contextCount | number | optional | Number of context messages to include |
| streamOutput | boolean | required | Whether to stream responses |
| hideMessages | boolean | optional | Whether to hide thinking messages |

**Topic** — Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique topic identifier |
| assistantId | string | FK → Assistant | Owning assistant ID |
| name | string | required | Topic display name |
| pinned | boolean | required | Whether topic is pinned to top |
| createdAt | number | required | Creation timestamp |
| updatedAt | number | required | Last update timestamp |

**QuickPhrase** — Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique phrase identifier |
| title | string | required | Short label |
| content | string | required | Full phrase text |

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| FileMetadata | F001-platform | FK (file ID) | Provider logo and model logo file references |
| KnowledgeBase | F004-knowledge | FK (knowledgeBaseIds) | Assistant-associated knowledge bases for RAG |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| Redux | `llmSlice` | Provider and model CRUD state management |
| Redux | `assistantsSlice` | Assistant and topic CRUD state management |
| Service | `ProviderService.addProvider()` | Create a new provider with API key |
| Service | `ProviderService.checkProvider()` | Test provider API connectivity |
| Service | `ModelService.getModels()` | List available models for a provider |
| Service | `AssistantService.createAssistant()` | Create a new assistant |
| Service | `AssistantService.addTopic()` | Create a topic within an assistant |
| Factory | `createProviderInstance()` | Create Vercel AI SDK provider instance |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| IPC | `file:*` | F001-platform | File storage for provider/model logos |
| IPC | `config:*` | F001-platform | Configuration persistence for provider settings |
| IPC | `app:*` | F001-platform | App info and proxy configuration for API calls |

### Technical Decisions

#### [Same Stack]
- **Recommended reuse patterns**: Redux Toolkit createSlice for provider/model/assistant state; Factory pattern for AI SDK provider instantiation; Hook pattern (useProvider, useModel, useAssistant) for React component integration; Configuration-driven provider setup with provider-specific config modules
- **Existing libraries**: `@ai-sdk/openai` — OpenAI-compatible provider adapter; `@ai-sdk/anthropic` — Anthropic provider adapter; `@ai-sdk/google` — Google Gemini provider adapter; `@ai-sdk/azure` — Azure OpenAI provider adapter; `ai` — Vercel AI SDK core for unified AI interface; `@reduxjs/toolkit` — State management for provider/model/assistant entities
- **Existing architecture decisions**: Provider type enum maps to specific AI SDK adapter via factory; API keys stored in Redux state with persistence (encrypted by Electron's safeStorage in production); Model capabilities stored as boolean flags for feature gating; Assistant settings use inheritance (assistant settings override global defaults); Marketplace agents stored as bundled JSON with remote update capability

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Provider entity compatibility | F003-chat | Verify that F003 correctly references Provider and Model entities when initiating chat requests |
| Assistant entity compatibility | F003-chat | Verify that F003 correctly references Assistant and Topic entities for conversation context |
| Model capability flags | F003-chat | Verify that F003 reads model capabilities (vision, function_calling, web_search) to enable/disable chat features |
| Model capability flags | F004-knowledge | Verify that F004 reads model capabilities (embedding, rerank) to select appropriate models for knowledge operations |
| AI SDK factory | F003-chat | Verify that F003 uses createProviderInstance from F002 to obtain AI SDK provider for chat requests |
| KnowledgeBase reference | F004-knowledge | Verify that Assistant.knowledgeBaseIds correctly references KnowledgeBase entities owned by F004 |
| Redux store integration | F001-platform | Verify that llmSlice and assistantsSlice are correctly registered in F001's Redux store |
| Settings UI integration | F001-platform | Verify that provider/model/assistant settings pages render within F001's settings layout |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F003-chat | Entity change impact | If Provider or Model entity schema changes, F003's chat pipeline initialization needs modification |
| F003-chat | API change impact | If createProviderInstance factory signature changes, F003's AI SDK usage needs modification |
| F004-knowledge | Entity change impact | If Model entity capabilities schema changes, F004's embedding model selection needs modification |
| F003-chat | Settings change impact | If AssistantSettings fields change, F003's parameter preparation for chat requests needs modification |
| F004-knowledge | Reference change impact | If Assistant.knowledgeBaseIds reference pattern changes, F004's knowledge base association needs modification |
