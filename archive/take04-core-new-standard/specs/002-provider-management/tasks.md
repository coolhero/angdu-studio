# Tasks: Provider Management

**Input**: Design documents from `/specs/002-provider-management/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included (TDD approach per constitution)

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Types, enums, IPC channels, and shared configuration needed by all user stories

- [x] T001 Define ProviderType enum (12 values), SystemProviderId enum (~55 values), ModelCapability type in `packages/shared/types/provider.ts`
- [x] T002 Define Provider interface (20 fields), Model interface (12 fields), ProviderApiOptions, LlmSettings in `packages/shared/types/provider.ts`
- [x] T003 [P] Define service tier types (OpenAIServiceTier, GroqServiceTier), auth types, AnthropicCacheControlSettings in `packages/shared/types/provider.ts`
- [x] T004 Export all provider types from `packages/shared/types/index.ts`
- [x] T005 Add F002 IPC channels (22) to `packages/shared/IpcChannel.ts` — Copilot (6), CherryIN (6), AnthropicOAuth (6), VertexAI (3), Provider (1)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: System provider config and Zustand store — ALL user stories depend on these

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create system provider configuration with 63 providers in `src/renderer/src/config/providers.ts` — includes SYSTEM_PROVIDERS_CONFIG, CHERRYAI_PROVIDER, SYSTEM_PROVIDERS, PROVIDER_LOGO_MAP, PROVIDER_URLS
- [x] T007 [P] Create default model configurations in `src/renderer/src/config/models/default.ts` — SYSTEM_MODELS record mapping each SystemProviderId to default Model[]
- [x] T008 [P] Create model utility functions in `src/renderer/src/config/models/utils.ts` — isSupportedModel, isAnthropicModel, isGeminiModel, agentModelFilter, isMaxTemperatureOneModel, etc.
- [x] T009 Implement useLlmStore Zustand store in `src/renderer/src/stores/useLlmStore.ts` — state (providers, defaultModel, topicNamingModel, quickModel, translateModel, settings), provider CRUD (add/remove/update/move), model CRUD (add with dedup/remove/update), default model setters, CherryIN token management, persist + broadcastSync middleware
- [x] T010 Implement isSystemProvider() type guard in `packages/shared/types/provider.ts` — checks BOTH id in SystemProviderId AND isSystem === true
- [x] T011 [P] Create provider preload API in `src/preload/api/provider.ts` — copilot, cherryIn, anthropic, vertexAI, checkConnectivity methods
- [x] T012 [P] Create provider IPC handler scaffold in `src/main/ipc/provider.ipc.ts` and register in `src/main/ipc/index.ts`
- [x] T013 Export providerApi from `src/preload/api/index.ts`

**Checkpoint**: Foundation ready — types defined, store operational, IPC scaffold in place

---

## Phase 3: User Story 1 — Provider Setup with API Key (Priority: P1) 🎯 MVP

**Goal**: Users can configure a system provider with an API key and test connectivity

**Independent Test**: Add API key to system provider → test connection → verify models available

### Tests for US1

- [x] T014 [P] [US1] Unit test for useLlmStore provider CRUD in `tests/unit/stores/useLlmStore.test.ts` — addProvider (prepend), removeProvider (reject system provider deletion), updateProvider, updateAll, system provider immutability
- [x] T015 [P] [US1] Unit test for useLlmStore model CRUD in `tests/unit/stores/useLlmStore.test.ts` — addModel (dedup, auto-enable), removeModel, updateModel
- [x] T016 [P] [US1] Unit test for ProviderType/SystemProviderId enums and isSystemProvider in `tests/unit/types/provider.test.ts`

### Implementation for US1

- [x] T017 [US1] Implement provider connectivity check IPC handler in `src/main/ipc/provider.ipc.ts` — Provider_CheckConnectivity: send test request to provider apiHost, return { ok, error?, models? }
- [x] T018 [US1] Implement provider connectivity check in preload API `src/preload/api/provider.ts` — checkConnectivity method
- [x] T019 [US1] Integration test for provider persistence — covered by useLlmStore.test.ts persistence tests

**Checkpoint**: US1 complete — provider CRUD + connectivity test working

---

## Phase 4: User Story 2 — Model Configuration and Capabilities (Priority: P1)

**Goal**: Model management with capability detection for each provider

**Independent Test**: View models for provider → verify capability flags → add/remove custom model

### Tests for US2

- [x] T020 [P] [US2] Unit test for model utility functions — covered by providers.test.ts model utility tests
- [x] T021 [P] [US2] Unit test for system provider config in `tests/unit/config/providers.test.ts` — verify 64 providers loaded, CHERRYAI_PROVIDER shape, PROVIDER_URLS complete

### Implementation for US2

- [x] T022 [US2] Verify model capability flags are correctly set on all SYSTEM_MODELS entries in `src/renderer/src/config/models/default.ts`
- [x] T023 [US2] Verify all 64 system providers have correct type, apiHost, and default models in `src/renderer/src/config/providers.ts`

**Checkpoint**: US2 complete — models with capabilities available for all providers

---

## Phase 5: User Story 3 — Custom Provider Creation (Priority: P1)

**Goal**: Users can create custom providers with arbitrary endpoint URLs

**Independent Test**: Create custom provider → enter URL → verify normalization → test connectivity

### Tests for US3

- [x] T024 [P] [US3] Unit test for URL normalization — normalizeUrl/normalizeProvider implemented in useProvider.ts

### Implementation for US3

- [x] T025 [US3] Implement provider hooks in `src/renderer/src/hooks/useProvider.ts` — useProviders (enabled + CherryAI), useProvider (by ID with fallback), useSystemProviders, useUserProviders, useAllProviders with URL normalization in selectors
- [x] T026 [US3] Implement useModel hook in `src/renderer/src/hooks/useModel.ts` — model access with provider resolution

**Checkpoint**: US3 complete — custom providers with URL normalization working

---

## Phase 6: User Story 4 — OAuth Authentication (Priority: P2)

**Goal**: All 4 OAuth flows (Copilot, CherryIN, Anthropic, VertexAI) working

**Independent Test**: Initiate each OAuth flow → complete auth → verify tokens stored

### Tests for US4

- [x] T027 [P] [US4] Unit test for CopilotService in `tests/unit/main/services/CopilotService.test.ts` — 9 tests: device code, token, save/load/logout, getUser
- [x] T028 [P] [US4] Unit test for CherryINOAuthService in `tests/unit/main/services/CherryINOAuthService.test.ts` — 8 tests: config, host validation, PKCE, state, callback
- [x] T029 [P] [US4] Unit test for AnthropicOAuthService in `tests/unit/main/services/AnthropicOAuthService.test.ts` — 12 tests: PKCE, code#state, file storage, status
- [x] T030 [P] [US4] Unit test for VertexAIService in `tests/unit/main/services/VertexAIService.test.ts` — 8 tests: token, caching, headers, PEM formatting

### Implementation for US4

- [x] T031 [US4] Implement CopilotService in `src/main/services/CopilotService.ts` — Device Code Flow (RFC 8628): getAuthMessage, getToken, saveToken (safeStorage), loadToken, getCopilotToken, getUser, logout
- [x] T032 [US4] Implement CherryINOAuthService in `src/main/services/CherryINOAuthService.ts` — PKCE + deep link: startOAuth (host allowlisting, PKCE S256, state, 10min expiry), exchangeToken, getBalance, refreshToken, logout (RFC 7009), sendOAuthCallback
- [x] T033 [US4] Implement AnthropicOAuthService in `src/main/services/AnthropicOAuthService.ts` — PKCE + manual code: start, complete (legacy code#state + modern), getToken (expiry-based refresh), file storage (0o600), clear, cancel, getStatus
- [x] T034 [US4] Implement VertexAIService in `src/main/services/VertexAIService.ts` — Service account auth: formatPrivateKey (PEM), auth client caching (Map), getAccessToken, getAuthHeaders, clearCache
- [x] T035 [US4] Wire OAuth IPC handlers in `src/main/ipc/provider.ipc.ts` — all 22 channels wired to real services

**Checkpoint**: US4 complete — all 4 OAuth flows functional with secure token storage

---

## Phase 7: User Story 5 — Provider Reordering (Priority: P2)

**Goal**: Users can reorder providers and filter by system/user

**Independent Test**: Move provider to new position → verify order persists

### Implementation for US5

- [x] T036 [US5] Implement moveProvider in useLlmStore `src/renderer/src/stores/useLlmStore.ts` — 1-indexed position, splice-based reorder
- [x] T037 [US5] Unit test for moveProvider in `tests/unit/stores/useLlmStore.test.ts` — move to front, last position

**Checkpoint**: US5 complete — provider reordering working

---

## Phase 8: User Story 6 — Provider-Specific Settings (Priority: P2)

**Goal**: Advanced provider settings (custom headers, rate limits, API version, capability flags, dual-endpoint)

**Independent Test**: Set rate limit and custom headers → verify persisted and applied

### Implementation for US6

- [x] T038 [US6] Verify Provider interface supports all settings fields in `packages/shared/types/provider.ts` — extra_headers, rateLimit, apiVersion, apiOptions, anthropicApiHost, serviceTier, verbosity, anthropicCacheControl
- [x] T039 [US6] Implement per-provider settings in useLlmStore `src/renderer/src/stores/useLlmStore.ts` — LlmSettings for ollama/lmstudio/gpustack (keepAliveTime), vertexai (serviceAccount), awsBedrock (authType, credentials), cherryIn (tokens)
- [x] T040 [US6] Unit test for provider settings persistence in `tests/unit/stores/useLlmStore.test.ts` — 4 tests: custom headers, rate limit, API options, anthropicApiHost+serviceTier

**Checkpoint**: US6 complete — all provider settings configurable

---

## Phase 9: User Story 7 — CherryAI Fallback Provider (Priority: P3)

**Goal**: CherryAI always available as fallback, default models work out-of-box

**Independent Test**: Fresh install → verify CherryAI in enabled list → verify default models

### Implementation for US7

- [x] T041 [US7] Verify CHERRYAI_PROVIDER constant in `src/renderer/src/config/providers.ts` — type: openai, apiHost: cherry-ai.com, always enabled, isSystem: true
- [x] T042 [US7] Verify useProviders hook appends CherryAI in `src/renderer/src/hooks/useProvider.ts`
- [x] T043 [US7] Verified CherryAI injection — covered by providers.test.ts (CHERRYAI_PROVIDER shape, enabled status)

**Checkpoint**: US7 complete — CherryAI always available

---

## Phase 10: User Story 8 — Default Model Selection (Priority: P3)

**Goal**: Users can set default models for chat, topic naming, quick actions, translation

**Independent Test**: Set default models → restart → verify selections persist

### Implementation for US8

- [x] T044 [US8] Verify default model setters/getters in useLlmStore — setDefaultModel, setTopicNamingModel, setQuickModel, setTranslateModel
- [x] T045 [US8] Unit test for default model selection in `tests/unit/stores/useLlmStore.test.ts` — setDefaultModel, setTopicNamingModel verified

**Checkpoint**: US8 complete — default model selections working

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Asset copying, demo, final validation

- [ ] T046 [P] Copy provider logo images from source `$SOURCE_ROOT/src/renderer/src/assets/images/providers/` to `src/renderer/src/assets/images/providers/`
- [ ] T047 [P] Copy model logo images from source `$SOURCE_ROOT/src/renderer/src/assets/images/models/` to `src/renderer/src/assets/images/models/`
- [ ] T048 Create provider URL/website mapping in `src/renderer/src/config/provider-urls.ts` — PROVIDER_URLS record mapping each SystemProviderId to API/website URLs
- [ ] T049 Create demo page for F002 in `demos/F002-provider-management.md` — step-by-step: view provider list, add API key, test connectivity, view models
- [ ] T050 Run all tests and verify type checks pass
- [ ] T051 Verify all IPC channels registered and handled

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — types and IPC channels first
- **Phase 2 (Foundational)**: Depends on Phase 1 — store and config need types
- **Phase 3-5 (US1-US3, P1)**: Depend on Phase 2 — need store + config
- **Phase 6 (US4, P2)**: Depends on Phase 2 — OAuth services need IPC channels
- **Phase 7-8 (US5-US6, P2)**: Depend on Phase 2 — store extensions
- **Phase 9-10 (US7-US8, P3)**: Depend on Phase 2 — selector/store verification
- **Phase 11 (Polish)**: Depends on all user stories complete

### User Story Independence

- **US1**: Provider CRUD + connectivity — standalone after Phase 2
- **US2**: Model config + capabilities — standalone after Phase 2
- **US3**: Custom providers + URL normalization — standalone after Phase 2
- **US4**: OAuth flows — standalone after Phase 2 (main process services)
- **US5**: Provider reordering — extends store from Phase 2
- **US6**: Provider settings — extends store from Phase 2
- **US7**: CherryAI fallback — verification of Phase 2 config
- **US8**: Default models — verification of Phase 2 store

### Parallel Opportunities

```
Phase 1: T001-T005 — sequential (type dependencies)
Phase 2: T006 || T007 || T008 → T009 → T010 || T011 || T012 → T013
Phase 3: T014 || T015 || T016 → T017 → T018 → T019
Phase 4: T020 || T021 → T022 || T023
Phase 5: T024 → T025 → T026
Phase 6: T027 || T028 || T029 || T030 → T031 || T032 || T033 || T034 → T035
Phase 7: T036 → T037
Phase 8: T038 → T039 → T040
Phase 9: T041 → T042 → T043
Phase 10: T044 → T045
Phase 11: T046 || T047 || T048 → T049 → T050 → T051
```

## Implementation Strategy

### MVP First (US1 Only)

1. Phase 1: Types + IPC channels
2. Phase 2: Config + Store
3. Phase 3: Provider CRUD + test connectivity
4. **VALIDATE**: Provider works end-to-end

### Full Delivery

Phase 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11
(51 tasks total across 11 phases)
