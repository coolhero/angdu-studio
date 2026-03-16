# Tasks: Model Provider

**Input**: Design documents from `/specs/004-model-provider/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/provider-ipc.md, research.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared types, system provider definitions, and dependency installation

- [x] T001 Install Vercel AI SDK packages: @ai-sdk/openai, @ai-sdk/anthropic, @ai-sdk/google, @ai-sdk/azure, @ai-sdk/mistral, @ai-sdk/amazon-bedrock, ai (core)
- [x] T002 [P] Define Provider, Model, ProviderType, EndpointType, ProviderApiOptions types with Zod schemas in src/shared/types/provider.ts
- [x] T003 [P] Define ChatMessage, ChatOptions, NormalizedChunk, SerializedError AI core types in src/shared/types/ai-core.ts
- [x] T004 [P] Define system provider registry (50+ providers with id, type, name, defaultApiHost, logo) in src/shared/providers/system-providers.ts
- [x] T005 Add provider/model/ai IPC channel names to preload whitelist in src/preload/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Zustand stores and IPC infrastructure that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Implement useProviderStore with Zustand in src/renderer/src/stores/useProviderStore.ts — providers[], CRUD actions (addProvider, updateProvider, deleteProvider, toggleEnabled), persist middleware, shallow selectors
- [x] T007 [P] Implement useModelStore with Zustand in src/renderer/src/stores/useModelStore.ts — models cache per provider, searchQuery, activeModelSelection per assistant, fetchModels action, persist middleware
- [x] T008 Implement ProviderService in src/main/services/ProviderService.ts — CRUD operations, safeStorage encrypt/decrypt for API keys, config persistence via config:get/set IPC, system provider initialization
- [x] T009 [P] Implement ModelService in src/main/services/ModelService.ts — fetch models from provider API via AI SDK, cache management with per-provider TTL, custom model support
- [x] T010 Register IPC handlers for provider:list, provider:add, provider:update, provider:delete, provider:test-connection, provider:fetch-models, provider:add-custom-model in src/main/ipc/provider-handlers.ts
- [x] T011 Implement renderer-side IPC client wrappers in src/renderer/src/services/provider-client.ts — typed functions matching each IPC channel

**Checkpoint**: Stores functional, IPC channels registered, provider CRUD works via console/DevTools

---

## Phase 3: User Story 1 - Provider Configuration and Connection Testing (Priority: P1) 🎯 MVP

**Goal**: Users can add/edit/delete providers, test connection, and see status indicators

**Independent Test**: Add a provider with API key, test connection, verify success/error indicator

### Implementation for User Story 1

- [x] T012 [US1] Create ProviderList component in src/renderer/src/pages/settings/ProviderSettings/ProviderList.tsx — render system providers with enabled/disabled status indicator (shadcn/ui Switch), provider name, type icon
- [x] T013 [P] [US1] Create ProviderAddDialog component in src/renderer/src/pages/settings/ProviderSettings/ProviderAddDialog.tsx — shadcn/ui Dialog with provider type Select, API key Input (password type with show/hide toggle), endpoint URL Input, conditional fields per provider type
- [x] T014 [P] [US1] Create ProviderEditPanel component in src/renderer/src/pages/settings/ProviderSettings/ProviderEditPanel.tsx — inline edit form for selected provider (API key masked, endpoint, name), auto-save on change, delete button with confirmation Dialog
- [x] T015 [US1] Implement connection test flow — "Test Connection" Button in ProviderEditPanel triggers provider:test-connection IPC, shows spinner during test, displays success (green check) or error (red X with message) within 5s
- [x] T016 [US1] Implement provider deletion with dependency check — provider:delete IPC handler checks if any assistants reference models from this provider, returns assistant list in error if in use, ProviderEditPanel shows warning Dialog listing affected assistants
- [x] T017 [US1] Register ProviderSettings as default sub-page in F003 settings sidebar — update settings route config to show provider list at #/settings/provider, ensure it loads as default when navigating to Settings
- [x] T018 [US1] Implement ProviderApiOptions component in src/renderer/src/pages/settings/ProviderSettings/ProviderApiOptions.tsx — advanced panel with shadcn/ui Switch toggles for each ProviderApiOptions flag, custom headers editor

**Checkpoint**: Provider CRUD fully functional via Settings UI, connection test works, default settings sub-page

---

## Phase 4: User Story 2 - Model List Management (Priority: P1)

**Goal**: Users can view, search, refresh, and manage models per provider

**Independent Test**: Fetch models from a configured provider, search, add custom model, toggle enable/disable

### Implementation for User Story 2

- [x] T019 [US2] Create ModelList component in src/renderer/src/pages/settings/ModelSettings/ModelList.tsx — models grouped by provider, each model shows name, capability Badges (text, vision, function_calling, etc.), pricing if available, enabled Switch
- [x] T020 [P] [US2] Create ModelSearch component in src/renderer/src/pages/settings/ModelSettings/ModelSearch.tsx — shadcn/ui Input with real-time filtering of model list via useModelStore.searchQuery
- [x] T021 [P] [US2] Create CustomModelDialog component in src/renderer/src/pages/settings/ModelSettings/CustomModelDialog.tsx — shadcn/ui Dialog with model ID Input, name Input, capability checkboxes, endpoint type Select
- [x] T022 [US2] Wire model list fetch — after provider add/enable, auto-trigger provider:fetch-models. Show skeleton loaders during fetch. On error, show toast with retry option. On offline, show cached list with offline indicator
- [x] T023 [US2] Implement model enable/disable toggle — Switch in ModelList calls useModelStore action, immediately updates model.enabled, persists via Zustand persist
- [x] T024 [US2] Implement model capability override preservation — when refreshing model list from API, merge new models with existing user overrides (isUserSelected capabilities preserved)

**Checkpoint**: Model list displays correctly, search works, custom models addable, enable/disable functional

---

## Phase 5: User Story 3 - Model Selection and Provider Resolution (Priority: P1)

**Goal**: Model picker works for chat, resolves correct provider, persists per assistant

**Independent Test**: Select model in mock chat context, verify provider resolution, switch models

### Implementation for User Story 3

- [x] T025 [US3] Implement getActiveModel(assistantId) and setActiveModel(assistantId, model) in useModelStore — per-assistant model selection, persisted via Zustand persist
- [x] T026 [US3] Implement getProviderById(id) selector in useProviderStore — referentially stable (use shallow comparator), returns Provider or null
- [x] T027 [US3] Implement provider resolution logic in src/main/services/ProviderService.ts — given modelId, resolve provider by model.provider field, determine endpoint type from model.endpoint_type, apply URL transforms (Azure /v1, Gemini /openai, Ollama strip /api)

**Checkpoint**: Model selection per assistant works, provider resolution returns correct config

---

## Phase 6: User Story 4 - AI Core Abstraction Layer (Priority: P1)

**Goal**: Unified AI interface that normalizes across all provider types with streaming

**Independent Test**: Send chat request through AI core for OpenAI, Anthropic, and Ollama — verify normalized streamed responses

### Implementation for User Story 4

- [x] T028 [US4] Implement AICoreService in src/main/services/AICoreService.ts — createProviderAdapter(provider) factory that maps ProviderType to AI SDK instance, applies URL transforms, sets auth headers
- [x] T029 [US4] Implement streaming chat in AICoreService — ai:chat IPC handler creates AbortController, calls AI SDK streamText(), forwards NormalizedChunk via ai:stream-chunk events, sends ai:stream-complete on finish, ai:stream-error on failure
- [x] T030 [US4] Implement ai:abort IPC handler — looks up AbortController by requestId, calls abort()
- [x] T031 [US4] Implement retry logic with exponential backoff in AICoreService — retry on transient errors (5xx, network timeout), max 3 retries, exponential delay (1s, 2s, 4s)
- [x] T032 [US4] Implement provider-specific error normalization — map provider error responses to user-friendly messages with provider name, error type (auth, rate limit, model not found, network), and suggested action
- [x] T033 [US4] Implement proxy pass-through in AICoreService — read proxy config from F001 config:get('proxyUrl'), apply to all outgoing HTTP requests via fetch agent or session.setProxy()

**Checkpoint**: AI core processes chat requests through 3+ provider types, streams responses, handles errors

---

## Phase 7: User Story 5 - Provider Enable/Disable and System Providers (Priority: P2)

**Goal**: System providers pre-loaded, enable/disable reflects in model picker

**Independent Test**: View system provider list, enable one with API key, verify models appear

### Implementation for User Story 5

- [x] T034 [US5] Implement system provider initialization — on first launch, load system-providers.ts registry into useProviderStore, all disabled by default. On subsequent launches, merge new system providers (added in code updates) with existing user state
- [x] T035 [US5] Implement system provider protection — system providers (isSystem: true) show disable toggle but no delete button. Attempting delete via IPC returns SYSTEM_PROVIDER error

**Checkpoint**: System providers visible, enable/disable works, no accidental deletion

---

## Phase 8: User Story 6 - Provider-Specific API Options (Priority: P2)

**Goal**: Advanced users can configure per-provider API behavior flags

**Independent Test**: Configure API options on a provider, verify request payload respects flags

### Implementation for User Story 6

- [x] T036 [US6] Wire ProviderApiOptions component into ProviderEditPanel — expand/collapse panel for advanced settings, each flag as labeled Switch with tooltip explaining its effect
- [x] T037 [US6] Wire apiOptions into AICoreService request builder — when building AI SDK request params, check provider.apiOptions flags and omit/include parameters accordingly (e.g., skip stream_options if isNotSupportStreamOptions)
- [x] T038 [P] [US6] Implement custom headers editor in ProviderApiOptions — key-value input list for provider.extra_headers, included in every API request for that provider

**Checkpoint**: API options configurable per provider, reflected in API requests

---

## Phase 9: User Story 7 - Provider Rate Limiting and Notes (Priority: P3)

**Goal**: Per-provider rate limiting and notes

**Independent Test**: Set rate limit, verify throttling. Add note, verify persistence.

### Implementation for User Story 7

- [x] T039 [US7] Implement rate limit input in ProviderEditPanel — numeric Input for rateLimit (RPM), stored in provider config
- [x] T040 [US7] Implement rate limiter in AICoreService — token bucket per provider, queue excess requests, respect rateLimit from provider config
- [x] T041 [P] [US7] Implement notes field in ProviderEditPanel — Textarea for provider.notes, auto-saved

**Checkpoint**: Rate limiting and notes functional

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Integration, edge cases, error handling across all stories

- [x] T042 Implement API key whitespace auto-trim — on paste/input in API key field, trim leading/trailing whitespace before save
- [x] T043 Implement base URL normalization — strip trailing slash from apiHost before use
- [x] T044 Implement offline detection and UI indicator — detect navigator.onLine changes, show offline badge on ProviderList, disable refresh and test connection buttons with tooltip
- [x] T045 Implement Error Boundary wrapper around ProviderSettings and ModelSettings pages
- [x] T046 Verify Zustand selector stability — audit all useProviderStore and useModelStore selectors for referential stability (no inline filter/map in selector, use shallow comparator)
- [x] T047 Verify build succeeds with all new dependencies — run pnpm run build, fix any TypeScript or bundling issues
- [x] T048 Verify safeStorage fallback — test on platform without keychain, ensure graceful degradation (warn user, allow plaintext option)
- [x] T049 End-to-end smoke test — launch app, navigate to Settings → Model Provider, add provider, test connection, fetch models, verify model list appears

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1-US4 (Phase 3-6)**: Depend on Foundational completion
  - US1 (Provider CRUD) and US4 (AI Core) can proceed in parallel
  - US2 (Models) depends on US1 (provider must exist)
  - US3 (Selection) depends on US2 (models must exist)
- **US5-US7 (Phase 7-9)**: Can start after Phase 2, independent of other stories
- **Polish (Phase 10)**: Depends on all stories being complete

### User Story Dependencies

- **US1** (Provider Config): After Foundational — no story dependencies
- **US2** (Model List): After US1 (needs providers to fetch models from)
- **US3** (Selection): After US2 (needs models to select)
- **US4** (AI Core): After Foundational — can parallel with US1
- **US5** (System Providers): After Foundational — can parallel with US1
- **US6** (API Options): After US1 + US4 (needs provider config + request builder)
- **US7** (Rate Limit): After US4 (needs AICoreService)

### Parallel Opportunities

- T002, T003, T004 can run in parallel (different files)
- T006, T007 can run in parallel (different stores)
- T008, T009 can run in parallel (different services)
- T012, T013, T014 can be parallelized after T011
- US4 (AI Core) can run in parallel with US1 (Provider UI)
- US5 can run in parallel with US1

---

## Implementation Strategy

### MVP First (US1 + US2 + US3 + US4)

1. Complete Phase 1: Setup (types, dependencies)
2. Complete Phase 2: Foundational (stores, services, IPC)
3. Complete US1: Provider CRUD UI
4. Complete US2: Model list management
5. Complete US3: Model selection
6. Complete US4: AI Core streaming
7. **STOP and VALIDATE**: Full provider→model→AI flow works end-to-end

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. US1 → Provider config works → Demo: "Add OpenAI provider, test connection"
3. US2 → Models work → Demo: "Fetch models, search, custom model"
4. US3 + US4 → AI works → Demo: "Select model, send message, get streaming response"
5. US5 → System providers → Demo: "50+ providers pre-configured"
6. US6 + US7 → Advanced → Demo: "API options, rate limiting"

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- All API key handling stays in main process — renderer only sees masked values
- Zustand selectors must use shallow comparator for array/object returns
- Pattern Constraints from plan.md apply to all implementation tasks
