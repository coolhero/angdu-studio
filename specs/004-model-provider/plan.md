# Implementation Plan: Model Provider

**Branch**: `004-model-provider` | **Date**: 2026-03-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-model-provider/spec.md`

## Summary

Implement the model and provider management subsystem — the AI abstraction layer for Angdu Studio. This includes: system provider definitions (50+ pre-configured), provider CRUD with encrypted API key storage, model list fetching and caching, endpoint type routing, the unified AI core streaming interface via Vercel AI SDK, and the provider settings UI embedded within the F003 Settings page.

## Technical Context

**Language/Version**: TypeScript 5.8+ (strict mode)
**Primary Dependencies**: Vercel AI SDK v4+ (@ai-sdk/openai, @ai-sdk/anthropic, @ai-sdk/google, @ai-sdk/azure, @ai-sdk/mistral, @ai-sdk/amazon-bedrock), Zustand, React 19, Zod, shadcn/ui
**Storage**: Zustand persist (localStorage) for provider configs + model cache. API keys encrypted via Electron safeStorage.
**Testing**: Vitest (unit), Playwright (E2E via `_electron.launch()`)
**Target Platform**: macOS, Windows, Linux (Electron desktop)
**Project Type**: desktop-app (Electron)
**Performance Goals**: Connection test < 5s, model fetch < 3s, model switch < 100ms
**Constraints**: API keys never in renderer memory (decrypted only in main process), all API calls from main process
**Scale/Scope**: 50+ system providers, 12 provider types, 6 endpoint types, ~15 new IPC channels

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Verification |
|-----------|--------|-------------|
| I. SSoT | ✅ Pass | Provider/Model types in `@shared/types/provider.ts`. ProviderType/EndpointType enums shared across processes |
| II. Explicit Over Implicit | ✅ Pass | Provider-specific logic isolated in AI core adapters, not scattered. IPC channels explicitly registered |
| III. Fail Loudly, Recover Gracefully | ✅ Pass | Connection test shows specific errors (auth, network, rate limit). Offline falls back to cached models |
| IV. Composition Over Inheritance | ✅ Pass | Each provider is a composed adapter via Vercel AI SDK factory, not a class hierarchy |
| V. Test the Contract | ✅ Pass | Provider adapters tested via unified interface contract. IPC tested via request/response |
| VI. Progressive Enhancement | ✅ Pass | Layer 0: types + store → Layer 1: provider CRUD UI → Layer 2: AI core single provider → Layer 3: multi-provider |
| ARC-01 IPC Bridge | ✅ Pass | All provider API calls via IPC. API keys never cross to renderer |
| ARC-03 Provider Abstraction | ✅ Pass | Vercel AI SDK as unified interface. No provider-specific code outside ai-core |
| PSP-02 Config Portability | ✅ Pass | Provider configs serializable, exportable (keys excluded from export) |
| PSP-03 Graceful Degradation | ✅ Pass | Provider errors surface with name, type, and suggested action |
| A1-02 Model Agnosticism | ✅ Pass | Capability flags per model. No hardcoded assumptions about provider capabilities |
| F7-04 Secure by Default | ✅ Pass | safeStorage encryption, main-process-only decryption, masked keys in renderer |

## Project Structure

### Documentation (this feature)

```text
specs/004-model-provider/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── provider-ipc.md  # Provider/model/AI IPC contracts
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── main/
│   ├── services/
│   │   ├── ProviderService.ts        # Provider CRUD, persistence, encryption
│   │   ├── ModelService.ts           # Model fetching, caching, custom models
│   │   └── AICoreService.ts          # Unified AI streaming interface
│   └── ipc/
│       └── provider-handlers.ts      # IPC handler registrations for provider channels
├── shared/
│   └── types/
│       ├── provider.ts               # Provider, Model, ProviderType, EndpointType types
│       └── ai-core.ts                # ChatMessage, ChatOptions, NormalizedChunk types
├── preload/
│   └── index.ts                      # + provider/model/ai IPC channel whitelist
└── renderer/
    └── src/
        ├── stores/
        │   ├── useProviderStore.ts    # Provider state + CRUD actions
        │   └── useModelStore.ts       # Model state + selection + cache
        ├── services/
        │   └── provider-client.ts     # Renderer-side IPC wrappers for provider operations
        └── pages/
            └── settings/
                ├── ProviderSettings/
                │   ├── ProviderList.tsx        # Provider list with status indicators
                │   ├── ProviderAddDialog.tsx   # Add provider dialog (type select + config)
                │   ├── ProviderEditPanel.tsx   # Edit provider (API key, endpoint, options)
                │   └── ProviderApiOptions.tsx  # Advanced API option flags
                └── ModelSettings/
                    ├── ModelList.tsx           # Model list grouped by provider
                    ├── ModelSearch.tsx         # Model search/filter bar
                    └── CustomModelDialog.tsx   # Add custom model dialog
```

**Structure Decision**: Feature code follows the existing Electron three-process architecture (main/preload/renderer). Provider settings UI integrates into the existing `pages/settings/` directory established by F003. Shared types extend `@shared/types/`.

## Architecture

### Layer Architecture

```
┌─────────────────────────────────────────────┐
│  Renderer Process                            │
│  ┌─────────────────────────────────────────┐ │
│  │ UI Components (ProviderSettings, etc.)  │ │
│  │        ↕ Zustand stores                 │ │
│  │ useProviderStore  │  useModelStore      │ │
│  │        ↕ IPC client wrappers            │ │
│  │ provider-client.ts                      │ │
│  └─────────────────────────────────────────┘ │
│                    ↕ IPC Bridge               │
├─────────────────────────────────────────────┤
│  Main Process                                │
│  ┌─────────────────────────────────────────┐ │
│  │ IPC Handlers (provider-handlers.ts)     │ │
│  │        ↕                                │ │
│  │ ProviderService  │  ModelService        │ │
│  │        ↕                                │ │
│  │ AICoreService (Vercel AI SDK adapters)  │ │
│  │        ↕                                │ │
│  │ Config Store  │  safeStorage            │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Provider Resolution Flow

```
Model selected → Provider lookup by model.provider
  → ProviderType determines AI SDK adapter
  → EndpointType determines request format
  → URL transforms applied (Azure /v1, Gemini /openai, Ollama strip /api)
  → API key decrypted from safeStorage
  → Request sent via Vercel AI SDK
  → Response streamed via IPC events
```

## Implementation Phases

### Phase 1: Shared Types and Store Foundation
- Define Provider, Model, ProviderType, EndpointType in `@shared/types/provider.ts`
- Define AI core types (ChatMessage, ChatOptions, NormalizedChunk) in `@shared/types/ai-core.ts`
- Define system provider registry in `@shared/providers/system-providers.ts`
- Implement `useProviderStore` with Zustand (CRUD, persist middleware)
- Implement `useModelStore` with Zustand (selection, cache, persist)

### Phase 2: Main Process Services
- Implement `ProviderService` (CRUD, safeStorage encrypt/decrypt, config persistence)
- Implement `ModelService` (fetch models via AI SDK, cache management, custom model support)
- Register IPC handlers in `provider-handlers.ts`
- Add provider IPC channels to preload whitelist

### Phase 3: AI Core Service
- Implement `AICoreService` with Vercel AI SDK adapter factory
- Implement provider-specific URL transforms
- Implement streaming via IPC events (chunk, complete, error)
- Implement retry logic with exponential backoff
- Implement abort controller management

### Phase 4: Provider Settings UI
- Implement `ProviderList` component (system providers, status indicators, enable/disable)
- Implement `ProviderAddDialog` (type selection, config form, API key masking)
- Implement `ProviderEditPanel` (edit config, test connection, API options)
- Implement `ProviderApiOptions` (advanced flag toggles)
- Register provider settings as default sub-page in settings sidebar

### Phase 5: Model Management UI
- Implement `ModelList` (grouped by provider, capability badges, pricing)
- Implement `ModelSearch` (real-time filtering)
- Implement `CustomModelDialog` (manual model addition)
- Implement model enable/disable toggle
- Wire model refresh action

### Phase 6: Integration and Polish
- Wire provider/model selection into settings navigation
- Implement connection test with progress indicator
- Implement offline indicator and cached model fallback
- Implement provider deletion with assistant dependency check
- End-to-end testing: add provider → test → fetch models → select model

## Interaction Chains

| FR | User Action | Handler | Store Mutation | DOM Effect | Visual Result | Verify Method |
|----|-------------|---------|---------------|------------|---------------|---------------|
| FR-004 | Toggle provider enabled | onToggleProvider(id) | providerStore.providers[id].enabled=!prev | Switch component checked state toggles | Provider ON/OFF indicator changes | verify-state switch[data-provider-id] checked |
| FR-005 | Click "Add Provider" | onOpenAddDialog() | ui.addDialogOpen=true | Dialog portal opens | Provider type selection dialog appears | verify-state dialog[data-add-provider] visible |
| FR-005 | Select provider type + submit | onAddProvider(data) | providerStore.providers.push(new) | Dialog closes, list refreshes | New provider appears in list | verify-effect provider-list item count +1 |
| FR-006 | Edit provider field | onUpdateProvider(id, field, value) | providerStore.providers[id][field]=value | Input value updates | Field shows new value, auto-saved | verify-state input[data-field] value |
| FR-008 | Click "Test Connection" | onTestConnection(id) | provider.testing=true → isAuthed=result | Button shows spinner → success/error icon | Test result indicator appears | verify-effect test-result visible |
| FR-014 | Type in model search | onSearchModels(query) | modelStore.searchQuery=query | Model list filters | Only matching models shown | verify-effect model-list filtered |
| FR-015 | Toggle model enabled | onToggleModel(providerId, modelId) | model.enabled=!prev | Switch toggles | Model availability changes | verify-state model-switch checked |
| FR-023 | Click show/hide API key | onToggleKeyVisibility() | ui.keyVisible=!prev | Input type toggles password/text | Key shown or masked | verify-state input[type] |
| FR-031 | Navigate to Settings | — | — | Route to #/settings/provider | Provider settings page loads as default | verify-effect settings-content provider-list visible |

### Async-flow Interaction Chains

| FR | User Action | Handler | Store Mutation | DOM Effect | Visual Result | Verify Method |
|----|-------------|---------|---------------|------------|---------------|---------------|
| FR-008 | async-flow: Test connection start | onTestConnection(id) | provider.testing=true | Spinner shown on test button | Loading indicator during test | verify-state test-button spinner visible |
| FR-008 | async-flow: Test connection complete | onTestResult(id, result) | provider.testing=false, isAuthed=result.success | Spinner → success/error icon | Green check or red X with error message | verify-effect test-result icon |
| FR-010 | async-flow: Fetch models start | onFetchModels(providerId) | modelStore.fetching[providerId]=true | Skeleton loaders in model list | Loading placeholders shown | verify-state model-list skeleton visible |
| FR-010 | async-flow: Fetch models complete | onModelsReceived(models) | modelStore.fetching=false, models updated | Skeleton → real model items | Model list populated with names/badges | verify-effect model-list items |
| FR-010 | async-flow: Fetch models error | onFetchError(err) | modelStore.fetching=false | Error toast shown | "Failed to fetch models" with retry option | verify-state error-toast visible |

## Integration Contracts

| Direction | Target Feature | Interface | Provider Shape | Consumer Shape | Bridge |
|-----------|---------------|-----------|---------------|---------------|--------|
| Provides → | F005-chat | `ai:chat` IPC channel | `{ providerId, modelId, messages, options }` → stream of `NormalizedChunk` | F005 sends message, receives chunks via `ai:stream-chunk` event | — (direct IPC) |
| Provides → | F005-chat | `useModelStore.getActiveModel(assistantId)` | `Model \| null` | F005 reads active model for current assistant | — |
| Provides → | F005-chat | `useProviderStore.getProviderById(id)` | `Provider` | F005 reads provider config for display | — |
| Consumes ← | F001-shell | `config:get` / `config:set` IPC | `{ key, value }` → `ConfigValue` | Provider configs stored as config keys | adapter: `providerConfigKey(id)` → config key |
| Consumes ← | F001-shell | `safeStorage` IPC (new channels) | `string` → `Buffer` (encrypted) | API key encryption/decryption | — |
| Consumes ← | F003-settings | Settings sidebar navigation | Settings page renders sub-pages by route | Provider settings registered at `#/settings/provider` | — (route registration) |

## API Compatibility Matrix

| Provider | Auth Method | Base URL | Key Header | Model List | URL Transform | Notes |
|----------|-----------|----------|-----------|------------|---------------|-------|
| OpenAI | Bearer token | api.openai.com | Authorization: Bearer | GET /v1/models | None | Standard reference |
| Anthropic | API key header | api.anthropic.com | x-api-key | GET /v1/models | None | + anthropic-version header |
| Google Gemini | API key query | generativelanguage.googleapis.com | key= query param | GET /v1/models | Append /openai | Different model format |
| Azure OpenAI | API key header | {resource}.openai.azure.com | api-key | GET /openai/deployments | Append /v1 | + api-version param |
| Ollama | None | localhost:11434 | — | GET /api/tags | Strip /api | Local only |
| Mistral | Bearer token | api.mistral.ai | Authorization: Bearer | GET /v1/models | None | OpenAI-compat |
| AWS Bedrock | IAM Sig V4 | Regional endpoint | AWS Signature | ListFoundationModels | None | AWS credentials |
| Vertex AI | OAuth2 | {region}-aiplatform | Authorization: Bearer | REST API | None | OAuth token flow |
| OpenAI-compat | Bearer token | User-defined | Authorization: Bearer | GET /v1/models | None | Generic compat |

## UX Behavior Contract

| Scenario | Expected Behavior | Failure Behavior | Verify Method |
|----------|-------------------|------------------|---------------|
| Connection test in progress | Test button shows spinner, disabled. Result within 5s | No feedback = user clicks repeatedly | verify-state test-button disabled "true" |
| Model list fetch in progress | Skeleton loaders. Cancel/retry if > 5s | Empty list = user thinks no models | verify-state model-list skeleton visible |
| API key paste | Auto-trim whitespace, immediate persist | Spaces cause auth failures | — (unit test) |
| Network offline + model list | Cached models shown, offline indicator, refresh disabled | Empty list + silent failure | verify-state offline-indicator visible |
| Delete provider with dependents | Warning dialog lists affected assistants | Silent delete = broken assistants | verify-state delete-warning-dialog visible |
| Rate limit exceeded | Toast with provider name + retry time | Generic error confuses user | verify-state rate-limit-toast visible |

## Pattern Constraints

| Stack Pattern | Constraint | Rationale |
|---|---|---|
| **Zustand + React** (External store) | Selector return values MUST be referentially stable. `useProviderStore(state => state.providers.filter(...))` is WRONG — filter creates new array every call. Use `useMemo` + raw state, or Zustand `shallow` comparator | Infinite re-render loop if selector creates new references |
| **IPC serialization** | All data crossing IPC boundary MUST be JSON-serializable. No functions, Buffers, or class instances. Provider objects must be plain objects | Electron IPC serializes/deserializes — non-serializable data is silently dropped |
| **safeStorage availability** | `safeStorage.isEncryptionAvailable()` MUST be checked before encrypt/decrypt. On Linux without keyring, fallback to env-based encryption or plaintext warning | safeStorage throws if platform keychain unavailable |
| **Vercel AI SDK streaming** | Stream consumers MUST handle partial chunks. Text may arrive mid-word. Never parse incomplete JSON from tool call chunks | Partial chunk parsing causes JSON.parse errors |
| **Build-time plugin** | `@tailwindcss/vite` MUST be registered in renderer vite config plugins. Without it, Tailwind classes produce unstyled elements | Missing plugin = build passes, no styles |
| **Error Boundary** | Provider settings page MUST be wrapped in an Error Boundary. One provider's bad config must not crash all settings | Uncaught render error cascades |
| **Proxy pass-through** | All HTTP requests from AICoreService MUST respect the global proxy configuration from F001. Use `session.setProxy()` or node-fetch agent with proxy | Direct requests bypass corporate firewalls |

## Complexity Tracking

No constitution violations. All decisions align with existing principles.

## Source → Target Component Mapping

| Source Component | Source File | Target Component | Target File | Notes |
|---|---|---|---|---|
| Redux llm slice | `cherry-studio/.../store/llm.ts` | useProviderStore + useModelStore | `stores/useProviderStore.ts`, `useModelStore.ts` | Redux → Zustand, split into 2 stores |
| ProviderSettings/ (37 files) | `cherry-studio/.../ProviderSettings/` | ProviderSettings/ (4 files) | `pages/settings/ProviderSettings/` | Simplified: removed OAuth, provider-specific settings |
| ProviderSetting.tsx | source | ProviderEditPanel.tsx | target | Source: full page. Target: side panel in master-detail |
| ModelList/ (13 files) | `cherry-studio/.../ModelList/` | ModelSettings/ (3 files) | `pages/settings/ModelSettings/` | Simplified: ModelList + ModelSearch + CustomModelDialog |
| packages/ai-core/ | `cherry-studio/packages/ai-core/` | AICoreService | `src/main/services/AICoreService.ts` | Separate package → single service class |
| packages/ai-sdk-provider/ | `cherry-studio/packages/ai-sdk-provider/` | AICoreService (createSdkModel) | target | Consolidated into switch statement |
| AnthropicService | source | AI SDK @ai-sdk/anthropic | target | Provider-specific code eliminated |
| VertexAIService | source | AI SDK @ai-sdk/google | target | Provider-specific code eliminated |
| CopilotService | source | — | — | removed (out of scope) |
| CherryINOAuth | source | — | — | removed (Cherry-specific) |
| ManageModelsPopup | source | — | — | removed (bulk model toggle simplified) |
| HealthCheckPopup | source | — | — | removed (test connection in ProviderEditPanel covers this) |
| AddProviderPopup | source | ProviderAddDialog | target | AntD Modal → shadcn Dialog |
| SelectProviderModelPopup | source | ModelSelector (in F005) | target | Moved to ChatHeader context |
