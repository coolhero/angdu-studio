# Tasks: AI Provider

**Input**: Design documents from `/specs/002-ai-provider/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/ipc-channels.md, quickstart.md

**Tests**: Included per plan.md (Vitest unit/integration tests specified in implementation phases).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, shared types, and IPC channel registration

- [x] T001 Add F002 dependencies: `ai` (Vercel AI SDK 6), `zod`, `immer` to package.json and run install
- [x] T002 [P] Define ProviderType, ModelCapability, EndpointType, ServiceTier enums in `src/renderer/src/types/provider.ts`
- [x] T003 [P] Define Provider, Model, ProviderApiOptions, ModelPricing, AnthropicCacheControlSettings, LlmSettings interfaces in `src/renderer/src/types/provider.ts`
- [x] T004 [P] Define AI Core types (plugin lifecycle, chunk types, streaming context) in `src/renderer/src/types/ai-core.ts`
- [x] T005 Add F002 IPC channel enums (provider:*, copilot:*, angduin:*, gemini:*, vertexai:*, anthropic:*, aes:*, angduai:*) to `src/shared/ipc-channels.ts`
- [x] T006 Add F002 preload API method stubs for all 25 IPC channels in `src/preload/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Zustand provider store — all user stories depend on provider state management

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create `src/renderer/src/stores/useProviderStore.ts` with Zustand + immer + persist middleware, initial state shape per ProviderStoreState
- [x] T008 Implement provider CRUD actions (addProvider, updateProvider, removeProvider, reorderProviders, setEnabled) in `src/renderer/src/stores/useProviderStore.ts`
- [x] T009 Implement model management actions (addModel, removeModel, updateModel) in `src/renderer/src/stores/useProviderStore.ts`
- [x] T010 Implement model selection actions (setDefaultModel, setQuickModel, setTranslateModel) and updateSettings in `src/renderer/src/stores/useProviderStore.ts`
- [x] T011 Write unit tests for useProviderStore CRUD, model management, and persistence in `tests/unit/renderer/useProviderStore.test.ts`

**Checkpoint**: Foundation ready — provider store operational, user story implementation can begin

---

## Phase 3: User Story 1 — Provider Setup & Model Selection (Priority: P1) 🎯 MVP

**Goal**: Users can add providers, configure API keys, see available models, and select default/quick/translate models

**Independent Test**: Add an OpenAI-compatible provider with API key, verify models appear, select a default model, confirm it persists

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T012 [P] [US1] Write unit tests for provider configuration and health check in `tests/unit/renderer/provider-factory.test.ts` (config section)

### Implementation for User Story 1

- [x] T013 [P] [US1] Define SYSTEM_PROVIDERS constant array (11+ built-in provider definitions) in `src/renderer/src/config/providers.ts`
- [x] T014 [P] [US1] Define SYSTEM_MODELS constant array (200+ system model definitions with capabilities) in `src/renderer/src/config/models.ts`
- [x] T015 [US1] Implement provider configuration mapping (provider type → default apiHost, default models, auth requirements) in `src/renderer/src/aiCore/provider/providerConfig.ts`
- [x] T016 [US1] Implement provider constants (default hosts, version strings, provider metadata) in `src/renderer/src/aiCore/provider/constants.ts`
- [x] T017 [US1] Implement provider health check (API key validation, endpoint reachability, model list fetch) in `src/renderer/src/aiCore/provider/factory.ts` (health check section)

**Checkpoint**: User Story 1 complete — providers can be added, configured, validated, and models selected

---

## Phase 4: User Story 2 — AI Completion with Streaming (Priority: P1)

**Goal**: Send messages and receive streaming responses via the AI SDK, with token usage tracking

**Independent Test**: Configure a provider, send a message, observe streaming response, verify token usage recorded

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T018 [P] [US2] Write unit tests for factory resolution (all 11 types + alias + fallback) in `tests/unit/renderer/provider-factory.test.ts`
- [x] T019 [P] [US2] Write unit tests for parameter builder in `tests/unit/renderer/parameter-builder.test.ts`

### Implementation for User Story 2

- [x] T020 [P] [US2] Implement provider factory (`factory.ts`) with 3-step resolution chain (static mapping → alias → fallback) mapping ProviderType to AI SDK provider constructor in `src/renderer/src/aiCore/provider/factory.ts`
- [x] T021 [P] [US2] Implement parameter builder for streamText() param construction (temperature, topK, frequencyPenalty, presencePenalty, stopSequences, seed) in `src/renderer/src/aiCore/prepareParams/parameterBuilder.ts`
- [x] T022 [P] [US2] Implement provider-specific HTTP header builder (Anthropic beta headers, custom extra_headers) in `src/renderer/src/aiCore/prepareParams/header.ts`
- [x] T023 [US2] Implement AI Core entry point using Vercel AI SDK streamText() with abort controller integration in `src/renderer/src/aiCore/index.ts`
- [x] T024 [US2] Implement chunk processor routing stream chunks to message block types (text, reasoning, tool-call, usage) in `src/renderer/src/aiCore/chunk/chunkProcessor.ts`

**Checkpoint**: User Story 2 complete — streaming AI completions work end-to-end with token tracking

---

## Phase 5: User Story 3 — Plugin Pipeline (Priority: P1)

**Goal**: Configurable middleware plugins transform every AI request/response via lifecycle hooks

**Independent Test**: Send a message to a reasoning model, verify thinking content extracted and displayed separately

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T025 [P] [US3] Write unit tests for plugin pipeline (ordering, lifecycle execution, error isolation) in `tests/unit/renderer/plugin-pipeline.test.ts`

### Implementation for User Story 3

- [x] T026 [P] [US3] Implement PluginBuilder with definePlugin() pattern, lifecycle hooks (configureContext, onRequestStart, transformParams, onRequestEnd), and enforce ordering (pre/post) in `src/renderer/src/aiCore/plugins/PluginBuilder.ts`
- [x] T027 [P] [US3] Implement reasoningExtractionPlugin (extract thinking content from reasoning models) in `src/renderer/src/aiCore/plugins/reasoningExtractionPlugin.ts`
- [x] T028 [P] [US3] Implement anthropicCachePlugin (add cache control headers for Anthropic) in `src/renderer/src/aiCore/plugins/anthropicCachePlugin.ts`
- [x] T029 [P] [US3] Implement simulateStreamingPlugin (chunk complete responses for non-streaming providers) in `src/renderer/src/aiCore/plugins/simulateStreamingPlugin.ts`
- [x] T030 [P] [US3] Implement telemetryPlugin (track timing, usage metrics) in `src/renderer/src/aiCore/plugins/telemetryPlugin.ts`
- [x] T031 [P] [US3] Implement noThinkPlugin (strip thinking tags for non-reasoning requests) in `src/renderer/src/aiCore/plugins/noThinkPlugin.ts`
- [x] T032 [US3] Wire plugin pipeline into AI Core entry point (register plugins, execute on each request) in `src/renderer/src/aiCore/index.ts`

**Checkpoint**: User Story 3 complete — plugins transform requests/responses correctly

---

## Phase 6: User Story 4 — Provider CRUD & Reordering (Priority: P1)

**Goal**: Full provider management — add, edit, remove, reorder providers and their models with persistence

**Independent Test**: Add two providers, edit one's API key, disable the other, reorder, verify persistence across restart

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T033 [P] [US4] Write integration test for provider CRUD persistence (add/edit/remove/reorder → restart → verify) in `tests/integration/provider-ipc.test.ts`

### Implementation for User Story 4

- [x] T034 [US4] Implement Zustand persist middleware integration with electron-store via IPC for provider state in `src/renderer/src/stores/useProviderStore.ts` (persist config section)
- [x] T035 [US4] Register store-sync IPC handlers for cross-window provider state synchronization in `src/main/ipc/provider-ipc.ts` (sync section)

**Checkpoint**: User Story 4 complete — provider management persists across sessions

---

## Phase 7: User Story 5 — Provider-Specific Authentication (Priority: P2)

**Goal**: Enterprise providers authenticate via OAuth, service accounts, IAM, and token management

**Independent Test**: Configure VertexAI with service account, verify authentication and model listing

### Tests for User Story 5

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T036 [P] [US5] Write unit tests for AnthropicService in `tests/unit/main/anthropic-service.test.ts`
- [x] T037 [P] [US5] Write unit tests for VertexAIService in `tests/unit/main/vertexai-service.test.ts`
- [x] T038 [P] [US5] Write unit tests for CopilotService in `tests/unit/main/copilot-service.test.ts`

### Implementation for User Story 5

- [x] T039 [P] [US5] Implement AnthropicService (OAuth flow: start, exchange code, refresh, clear) in `src/main/services/AnthropicService.ts`
- [x] T040 [P] [US5] Implement VertexAIService (service account auth, access token generation, cache management) in `src/main/services/VertexAIService.ts`
- [x] T041 [P] [US5] Implement CopilotService (device auth flow, token management, refresh, user info) in `src/main/services/CopilotService.ts`
- [x] T042 [P] [US5] Implement AngduINOAuthService (OAuth flow, token storage, balance check) in `src/main/services/AngduINOAuthService.ts`
- [x] T043 [P] [US5] Implement AesService (AES encrypt/decrypt for credential storage) in `src/main/services/AesService.ts`
- [x] T044 [US5] Register all F002 IPC handlers (anthropic:*, copilot:*, angduin:*, vertexai:*, gemini:*, aes:*, angduai:*) in `src/main/ipc/provider-ipc.ts`
- [x] T045 [US5] Implement F002 preload API methods (invoke wrappers for all 25 IPC channels) in `src/preload/index.ts`

**Checkpoint**: User Story 5 complete — enterprise auth flows work for all supported providers

---

## Phase 8: User Story 6 — Model Capability Detection & Reasoning (Priority: P2)

**Goal**: Detect model capabilities and adjust behavior; enable reasoning/thinking mode with provider-specific parameters

**Independent Test**: Select a reasoning-capable model, configure reasoning effort, verify thinking content appears

### Tests for User Story 6

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T046 [P] [US6] Write unit tests for model capability detection and reasoning mode in `tests/unit/renderer/model-capabilities.test.ts`

### Implementation for User Story 6

- [x] T047 [P] [US6] Implement model capability detection (vision, reasoning, function calling, web search, rerank) from Model metadata in `src/renderer/src/aiCore/prepareParams/modelCapabilities.ts`
- [x] T048 [US6] Implement reasoning mode detection (3 OR conditions: model capability + reasoning effort + provider-specific) in `src/renderer/src/aiCore/prepareParams/modelCapabilities.ts`
- [x] T049 [US6] Implement provider-specific reasoning parameters (Anthropic extended thinking budget, OpenAI reasoning_effort, Qwen enable_thinking) in `src/renderer/src/aiCore/prepareParams/parameterBuilder.ts` (reasoning section)

**Checkpoint**: User Story 6 complete — capabilities detected, reasoning mode works per provider

---

## Phase 9: User Story 7 — OpenAI Response API Support (Priority: P2)

**Goal**: Support "openai-response" as a distinct provider type using the Response API format

**Independent Test**: Configure "openai-response" provider, send a message, verify Response API format used

### Implementation for User Story 7

- [x] T050 [US7] Add "openai-response" provider type factory mapping and configuration in `src/renderer/src/aiCore/provider/factory.ts` and `src/renderer/src/aiCore/provider/providerConfig.ts`
- [x] T051 [US7] Ensure "openai-response" is distinct from "openai" in SYSTEM_PROVIDERS and parameter building in `src/renderer/src/config/providers.ts` and `src/renderer/src/aiCore/prepareParams/parameterBuilder.ts`

**Checkpoint**: User Story 7 complete — OpenAI Response API works as a distinct provider type

---

## Phase 10: User Story 8 — Tool Integration in AI Pipeline (Priority: P2)

**Goal**: External tools (MCP, web search) integrate into request pipeline when model supports function calling

**Independent Test**: Configure tool-capable model with web search tool, send query, verify tool calls in response

### Implementation for User Story 8

- [x] T052 [US8] Implement tool integration interface in parameter builder (include tools in streamText params when model has function_calling capability) in `src/renderer/src/aiCore/prepareParams/parameterBuilder.ts` (tools section)
- [x] T053 [US8] Implement tool call result processing in chunk processor in `src/renderer/src/aiCore/chunk/chunkProcessor.ts` (tool-call section)

**Checkpoint**: User Story 8 complete — tool calls flow through the AI pipeline

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Integration testing, wiring, and demo readiness

- [x] T054 Wire provider store with AI Core pipeline (store provides active provider/model to factory) in `src/renderer/src/aiCore/index.ts`
- [x] T055 Write integration tests for IPC channel round-trip (renderer → main → renderer) in `tests/integration/provider-ipc.test.ts`
- [x] T056 Create demo script for F002 verification in `demos/F002-ai-provider.sh`
- [x] T057 Run quickstart.md validation (pnpm install, pnpm test, pnpm build)
- [x] T058 Update CLAUDE.md with F002 technologies (Vercel AI SDK 6, Zod, immer)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (types must exist) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — provider config + health check
- **US2 (Phase 4)**: Depends on Phase 2 — factory + streaming (can parallel with US1)
- **US3 (Phase 5)**: Depends on Phase 2 — plugin pipeline (can parallel with US1, US2)
- **US4 (Phase 6)**: Depends on Phase 2 — persistence (can parallel with US1-US3)
- **US5 (Phase 7)**: Depends on Phase 2 — auth services (can parallel with US1-US4)
- **US6 (Phase 8)**: Depends on US2 (T019 parameter builder exists) — capability detection
- **US7 (Phase 9)**: Depends on US2 (T018 factory exists) — adds a provider type
- **US8 (Phase 10)**: Depends on US2 (T019 parameter builder exists) — tool params
- **Polish (Phase 11)**: Depends on US1-US5 minimum; ideally all stories complete

### User Story Dependencies

- **US1 (P1)**: After Phase 2 — independent
- **US2 (P1)**: After Phase 2 — independent
- **US3 (P1)**: After Phase 2 — independent
- **US4 (P1)**: After Phase 2 — independent
- **US5 (P2)**: After Phase 2 — independent
- **US6 (P2)**: After US2 (needs parameter builder)
- **US7 (P2)**: After US2 (needs factory)
- **US8 (P2)**: After US2 (needs parameter builder)

### Within Each User Story

- Types/models before services
- Services before integration
- Core implementation before tests
- Story complete before moving to next priority

### Parallel Opportunities

- Phase 1: T002, T003, T004 can run in parallel (different files)
- Phase 3: T012, T013 can run in parallel
- Phase 4: T018, T019, T020 can run in parallel
- Phase 5: T025-T030 can all run in parallel (independent plugin files)
- Phase 7: T036-T040 can all run in parallel (independent service files); T043-T045 can run in parallel
- Phase 8: T046 independent of other phases

---

## Parallel Example: User Story 3 (Plugin Pipeline)

```bash
# Launch all plugin implementations in parallel (all independent files):
Task: "Implement PluginBuilder in src/renderer/src/aiCore/plugins/PluginBuilder.ts"
Task: "Implement reasoningExtractionPlugin in src/renderer/src/aiCore/plugins/reasoningExtractionPlugin.ts"
Task: "Implement anthropicCachePlugin in src/renderer/src/aiCore/plugins/anthropicCachePlugin.ts"
Task: "Implement simulateStreamingPlugin in src/renderer/src/aiCore/plugins/simulateStreamingPlugin.ts"
Task: "Implement telemetryPlugin in src/renderer/src/aiCore/plugins/telemetryPlugin.ts"
Task: "Implement noThinkPlugin in src/renderer/src/aiCore/plugins/noThinkPlugin.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1-4)

1. Complete Phase 1: Setup (types + IPC channels)
2. Complete Phase 2: Foundational (Zustand store)
3. Complete Phase 3-6: User Stories 1-4 (P1 stories — can parallelize US1-US4)
4. **STOP and VALIDATE**: Test all P1 stories independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Store operational
2. Add US1 (Provider Setup) → Test independently → Provider management works
3. Add US2 (Streaming) → Test independently → AI completions work
4. Add US3 (Plugins) → Test independently → Request/response transformation works
5. Add US4 (CRUD Persistence) → Test independently → Full persistence works
6. Add US5-US8 (P2 stories) → Test independently → Enterprise auth + capabilities
7. Polish → Integration tests + demo script

### Task Summary

- **Total tasks**: 58
- **Phase 1 (Setup)**: 6 tasks
- **Phase 2 (Foundational)**: 5 tasks
- **US1 (Provider Setup)**: 6 tasks
- **US2 (Streaming)**: 7 tasks
- **US3 (Plugins)**: 8 tasks
- **US4 (CRUD)**: 3 tasks
- **US5 (Auth)**: 10 tasks
- **US6 (Capabilities)**: 4 tasks
- **US7 (Response API)**: 2 tasks
- **US8 (Tools)**: 2 tasks
- **Polish**: 5 tasks
