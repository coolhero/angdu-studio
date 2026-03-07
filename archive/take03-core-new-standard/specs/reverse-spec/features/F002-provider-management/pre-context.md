# Pre-Context: Provider Management

**Feature ID**: F002-provider-management
**Tier**: Tier 1
**Generated**: 2026-03-04

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/renderer/src/types/provider.ts` | Provider type definitions (ProviderType enum, SystemProviderIds) |
| `src/renderer/src/store/llm.ts` | Provider/model Redux slice (source reference for state shape) |
| `src/renderer/src/services/ProviderService.ts` | Provider CRUD, API key validation, connectivity check |
| `src/renderer/src/services/ModelService.ts` | Model listing, capability detection, model management |
| `src/renderer/src/hooks/useProvider.ts` | React hook for provider state access |
| `src/renderer/src/hooks/useModel.ts` | React hook for model state access |
| `packages/shared/config/providers.ts` | Shared provider utility functions and configurations |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding **provider type registry, model capability schema, API key management logic, provider CRUD operations, and connectivity check patterns**
- Do not reference: Redux slice patterns in `llm.ts` (migrating to Zustand), Ant Design Form components for provider settings (migrating to shadcn/ui + Radix), styled-components in provider UI (migrating to Tailwind-only)
- **Extract**: Provider type enum and its 12 provider categories, model capability flags (vision, embedding, reasoning, function_calling, web_search, rerank), API key storage pattern, provider rate limit configuration schema, provider URL formatting logic
- **Ignore**: Redux `createSlice` / `useSelector` / `useDispatch` patterns, Ant Design `Form` / `Input` / `Select` components, styled-components wrappers

### Static Resources

> Non-code files used by this Feature that must be **copied from the original source** during implementation.
> These files cannot be regenerated -- they must be copied as-is and placed in the appropriate location in the new project.
> Source Path is **relative to Source Root** (same as file paths above). Resolve as `[Source Root]/[Source Path]` at runtime.

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| `src/renderer/src/assets/images/providers/` | Image | `src/renderer/src/assets/images/providers/` | Provider logo files (PNG/SVG) for provider list UI |
| `src/renderer/src/assets/images/models/` | Image | `src/renderer/src/assets/images/models/` | Model logo files (PNG/SVG) for model selection UI |

> If resources need modification (e.g., resizing images, updating translation keys), note it in the Usage column.

### Environment Variables

> Environment variables required by this Feature at runtime. Variables marked as `secret` must NOT have their actual values recorded here -- only the variable name and purpose.

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| (none specific to F002) | | | | |

**Shared variables** (defined by other Features but also used here):

| Variable | Owner Feature | Usage in This Feature |
|----------|--------------|----------------------|
| `CSLOGGER_RENDERER_LEVEL` | F001-core-platform | Log level for provider/model management logging |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F002-provider-management manages the AI provider registry, model catalog, and API key configuration that underpin all AI interactions. It defines 12 provider types (OpenAI, Anthropic, Google, Azure, Ollama, etc.) with their API configurations, provides model listing with capability detection (vision, embedding, reasoning, function_calling, web_search, rerank), and handles provider CRUD with API key validation and connectivity testing. It also manages provider rate limit configuration.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Add a provider | User adds a new AI provider (e.g., OpenAI) by entering API key and endpoint URL; provider becomes available for model selection |
| P1 | Configure models | User views available models for a provider; system detects model capabilities automatically |
| P1 | API key management | User enters, updates, or removes API keys for providers; keys are stored securely |
| P2 | Test connectivity | User clicks "check" on a provider; system validates the API key and endpoint are working |
| P2 | Custom provider | User adds a custom OpenAI-compatible provider with custom API endpoint URL |
| P2 | Rate limit config | User configures rate limiting for a provider to avoid API throttling |
| P3 | Model capability override | User manually adjusts detected model capabilities (e.g., marks a model as supporting vision) |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Provider CRUD (create, read, update, delete) with 12 provider type categories
- **FR-002**: Model listing with automatic capability detection (vision, embedding, reasoning, function_calling, web_search, rerank)
- **FR-003**: API key management with secure storage
- **FR-004**: Provider type registry supporting: openai, anthropic, gemini, azure, ollama, lmstudio, openrouter, together, groq, mistral, deepseek, custom
- **FR-005**: Model capabilities tracking with user override support
- **FR-006**: Provider rate limit configuration

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: All 12 provider types can be configured and tested for connectivity
- **SC-002**: Model capabilities are correctly detected for each provider type
- **SC-003**: Provider API key validation returns pass/fail within 5 seconds
- **SC-004**: Provider CRUD operations persist across app restarts
- **SC-005**: Custom providers with non-standard endpoints work correctly

### Edge Cases

- Provider with invalid or expired API key returns clear error message
- Model list request to unreachable endpoint times out gracefully
- Custom provider with non-standard API response format
- Provider URL with or without trailing slash handled consistently
- Concurrent provider connectivity checks do not interfere with each other
- Model capability override by user takes precedence over auto-detection
- Provider deletion when models are referenced by active assistants

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-core-platform | IPC bridge | Uses config:* IPC channels for provider configuration persistence |
| F001-core-platform | Zustand store | Provider and model Zustand stores integrate into F001's store infrastructure with persistence |
| F001-core-platform | Database | Dexie schema must include tables for providers and models |

### Related Entities (data-model.md draft)

#### Owned Entities

**Provider** -- Refer to the corresponding section in entity-registry.md

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

**Model** -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Model identifier (provider-specific) |
| name | string | required | Display name |
| provider | string | FK -> Provider | Owning provider ID |
| group | string | optional | Model group/family |
| capabilities | object | required | Capability flags (vision, embedding, reasoning, function_calling, web_search, rerank) |
| maxTokens | number | optional | Maximum output tokens |
| contextWindow | number | optional | Maximum context window size |

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| FileMetadata | F001-core-platform | FK (file ID) | Provider logo and model logo file references |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| Zustand | `useProviderStore` | Provider CRUD state management |
| Zustand | `useModelStore` | Model CRUD state management |
| Service | `ProviderService.addProvider()` | Create a new provider with API key |
| Service | `ProviderService.checkProvider()` | Test provider API connectivity |
| Service | `ModelService.getModels()` | List available models for a provider |
| Hook | `useProvider()` | React hook for provider state access |
| Hook | `useModel()` | React hook for model state access |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| IPC | `config:*` | F001-core-platform | Configuration persistence for provider settings |
| IPC | `file:*` | F001-core-platform | File storage for provider/model logos |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Provider type enum maps 12 categories to specific configurations. ProviderService handles CRUD with API key validation and connectivity testing. ModelService lists models with capability detection. State managed via Redux slice with persistence.
- **Recommended implementation approach**: Replace Redux `llmSlice` with Zustand store(s) for provider/model state. Replace Ant Design Form components with shadcn/ui Form + React Hook Form + Zod for provider settings UI. Keep all business logic (provider type registry, capability detection, connectivity check) intact.
- **Caveats**: Provider settings UI is form-heavy; needs careful mapping from Ant Design Form patterns to shadcn/ui Form + Zod validation. API key storage mechanism should use Electron's safeStorage API for encryption.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Provider entity compatibility | F003-ai-core-engine | Verify F003 correctly references Provider configs when initializing AI SDK adapters |
| Provider entity compatibility | F005-ai-chat | Verify F005 correctly references Provider and Model entities when initiating chat requests |
| Model capability flags | F004-knowledge-base | Verify F004 reads model capabilities (embedding, rerank) to select appropriate models for knowledge operations |
| Model capability flags | F005-ai-chat | Verify F005 reads model capabilities (vision, function_calling, web_search) to enable/disable chat features |
| Zustand store integration | F001-core-platform | Verify provider/model Zustand stores integrate correctly with F001's store infrastructure |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F003-ai-core-engine | Entity change impact | If Provider type registry or config schema changes, F003's AI SDK adapter mapping needs modification |
| F005-ai-chat | Entity change impact | If Provider or Model entity schema changes, F005's chat pipeline initialization needs modification |
| F004-knowledge-base | Entity change impact | If Model entity capabilities schema changes, F004's embedding model selection needs modification |
| F005-ai-chat | Capability change impact | If model capability flags change, F005's feature gating for vision/function_calling/web_search needs modification |
