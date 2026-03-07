# Tasks: AI Core Engine

**Input**: Design documents from `/specs/003-ai-core-engine/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included (TDD approach per constitution)

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Phase 1: Setup (Core Types and Errors)

**Purpose**: Package structure, types, error hierarchy — needed by all user stories

- [X] T001 Create `packages/aiCore/` package structure with `package.json` (name: `@cherrystudio/ai-core`, TypeScript source)
- [X] T002 Define ProviderId type, ProviderSettingsMap, RuntimeConfig, ModelConfig in `packages/aiCore/src/types.ts`
- [X] T003 [P] Define AiPlugin interface, AiRequestContext, AiRequestMetadata in `packages/aiCore/src/core/plugins/types.ts`
- [X] T004 [P] Implement AiCoreError base class + 6 subclasses in `packages/aiCore/src/core/errors/index.ts`
- [X] T005 Install AI SDK dependencies: `ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`, `@ai-sdk/xai`, `@ai-sdk/azure`

---

## Phase 2: Foundational (Plugin System)

**Purpose**: Plugin infrastructure — ALL execution flows depend on this

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Implement PluginManager in `packages/aiCore/src/core/plugins/manager.ts` — executeFirst, executeTransformParams, executeTransformResult, executeConfigureContext, executeParallel, collectStreamTransforms, plugin sorting (pre/normal/post)
- [X] T007 Implement PluginEngine in `packages/aiCore/src/core/runtime/pluginEngine.ts` — executeWithPlugins, executeStreamWithPlugins, executeImageWithPlugins, plugin registration (use/usePlugins/removePlugin)
- [X] T008 Create plugin helpers in `packages/aiCore/src/core/plugins/index.ts` — definePlugin, createContext

**Checkpoint**: Plugin system ready — hooks execute in correct order

---

## Phase 3: User Story 3 — Provider Adapter Resolution (Priority: P1) 🎯 MVP

**Goal**: Given provider ID and model ID, resolve to correct AI SDK adapter

**Independent Test**: Create executor for each provider type → verify correct adapter

### Tests for US3

- [X] T009 [P] [US3] Unit test for provider factory registry in `tests/unit/aiCore/providers.test.ts` — verify all 7+ provider types resolve correctly
- [X] T010 [P] [US3] Unit test for ModelResolver in `tests/unit/aiCore/modelResolver.test.ts` — traditional format, namespaced format, unknown model

### Implementation for US3

- [X] T011 [US3] Implement provider factory registry in `packages/aiCore/src/core/providers/registry.ts` — maps ProviderId to AI SDK provider factory (createOpenAI, createAnthropic, createGoogle, etc.)
- [X] T012 [US3] Implement ModelResolver in `packages/aiCore/src/core/models/ModelResolver.ts` — resolveLanguageModel (traditional + namespaced), resolveTextEmbeddingModel, resolveImageModel

**Checkpoint**: US3 complete — all providers resolve to correct AI SDK adapters

---

## Phase 4: User Story 1 — Streaming Chat Completion (Priority: P1)

**Goal**: Stream AI responses token-by-token through plugin pipeline

**Independent Test**: Create executor → call streamText → verify tokens stream back

### Tests for US1

- [X] T013 [P] [US1] Unit test for RuntimeExecutor.streamText in `tests/unit/aiCore/executor.test.ts` — stream tokens, plugin hooks fire, error propagation
- [X] T014 [P] [US1] Unit test for PluginManager hook execution order in `tests/unit/aiCore/pluginManager.test.ts` — first-wins, sequential, parallel semantics

### Implementation for US1

- [X] T015 [US1] Implement middleware utilities in `packages/aiCore/src/core/middleware/index.ts` — createMiddlewares, wrapModelWithMiddlewares (wraps via AI SDK wrapLanguageModel)
- [X] T016 [US1] Implement RuntimeExecutor in `packages/aiCore/src/core/runtime/executor.ts` — constructor, streamText (with plugin pipeline), generateText, generateImage, static create/createOpenAICompatible factories
- [X] T017 [US1] Create runtime entry point in `packages/aiCore/src/core/runtime/index.ts` — export createExecutor, createOpenAICompatibleExecutor, streamText, generateText, generateImage
- [X] T018 [US1] Create package entry point in `packages/aiCore/src/index.ts` — export all public API

**Checkpoint**: US1 complete — streaming works through full plugin pipeline

---

## Phase 5: User Story 2 — Text Generation (Priority: P1)

**Goal**: Non-streaming text generation through the same pipeline

**Independent Test**: Call generateText → verify complete result returned

### Tests for US2

- [X] T019 [P] [US2] Unit test for RuntimeExecutor.generateText in `tests/unit/aiCore/executor.test.ts` — complete result, transformResult hooks

### Implementation for US2

- [X] T020 [US2] Verify generateText path in RuntimeExecutor (already implemented in T016) — ensure executeWithPlugins path works for non-streaming

**Checkpoint**: US2 complete — generation returns complete results

---

## Phase 6: User Story 5 — Per-Provider Options Builders (Priority: P2)

**Goal**: Type-safe options configuration for each provider

**Independent Test**: Call each options builder → verify correct typed output

### Tests for US5

- [X] T021 [P] [US5] Unit test for options builders in `tests/unit/aiCore/options.test.ts` — createOpenAIOptions, createAnthropicOptions, createGoogleOptions, mergeProviderOptions

### Implementation for US5

- [X] T022 [US5] Define ProviderOptionsMap and TypedProviderOptions in `packages/aiCore/src/core/options/types.ts`
- [X] T023 [US5] Implement options builders in `packages/aiCore/src/core/options/builders.ts` — createOpenAIOptions, createAnthropicOptions, createGoogleOptions, createOpenRouterOptions, createXaiOptions, createGenericProviderOptions, mergeProviderOptions

**Checkpoint**: US5 complete — all options builders produce correct typed output

---

## Phase 7: User Story 4 — Plugin System (Priority: P2)

**Goal**: Full plugin lifecycle with all hook types

**Independent Test**: Register plugins → execute request → verify all hooks fire correctly

### Tests for US4

- [X] T024 [P] [US4] Unit test for plugin ordering and hooks in `tests/unit/aiCore/pluginEngine.test.ts` — enforce pre/post, transformStream, recursive calls, depth limit

### Implementation for US4

- [X] T025 [US4] Verify plugin system handles all edge cases (already implemented in Phase 2) — recursive calls with depth limit, plugin errors in parallel hooks, stream transforms

**Checkpoint**: US4 complete — plugin system fully tested with all hook types

---

## Phase 8: User Story 6 — Error Handling (Priority: P2)

**Goal**: Typed error hierarchy with correct classification

**Independent Test**: Trigger each error type → verify correct subclass with properties

### Tests for US6

- [X] T026 [P] [US6] Unit test for error hierarchy in `tests/unit/aiCore/errors.test.ts` — all 6 subclasses, toJSON, cause chain, instanceof checks

### Implementation for US6

- [X] T027 [US6] Verify error hierarchy (already implemented in T004) — test toJSON serialization, cause chaining, instanceof narrowing

**Checkpoint**: US6 complete — all error types correctly classified

---

## Phase 9: User Story 7 — Context Window Management (Priority: P2)

**Goal**: Limit messages sent to provider based on configurable window

**Independent Test**: Configure different window sizes → verify correct message filtering

### Tests for US7

- [X] T028 [P] [US7] Unit test for ContextWindowService in `tests/unit/services/contextWindow.test.ts` — default 5, max 100, unlimited, system prompt preservation

### Implementation for US7

- [X] T029 [US7] Implement ContextWindowService in `src/renderer/src/services/ContextWindowService.ts` — filterContextMessages, getContextCount, DEFAULT_CONTEXT_COUNT (5), MAX_CONTEXT_COUNT (100), UNLIMITED_CONTEXT_COUNT (100000)

**Checkpoint**: US7 complete — context window correctly limits messages

---

## Phase 10: User Story 8 — Rate Limiting (Priority: P3)

**Goal**: Per-provider rate limiting with configurable delay

**Independent Test**: Configure rate limit → send rapid requests → verify blocking

### Tests for US8

- [X] T030 [P] [US8] Unit test for rate limiting in `tests/unit/services/contextWindow.test.ts` — blocked within delay, allowed after delay, no limit configured

### Implementation for US8

- [X] T031 [US8] Implement checkRateLimit in ContextWindowService `src/renderer/src/services/ContextWindowService.ts` — check elapsed time since last request, return blocked/waitSeconds

**Checkpoint**: US8 complete — rate limiting enforces delays

---

## Phase 11: User Story 9 — CherryIN Provider (Priority: P3)

**Goal**: Custom AI SDK provider routing to multiple backends

**Independent Test**: Create CherryIN provider → verify correct backend routing

### Tests for US9

- [X] T032 [P] [US9] Unit test for CherryIN provider in `tests/unit/aiCore/cherryIn.test.ts` — endpoint type routing, language model, embedding model

### Implementation for US9

- [X] T033 [US9] Create `packages/ai-sdk-provider/` package with `package.json`
- [X] T034 [US9] Implement CherryInProvider in `packages/ai-sdk-provider/src/cherryin-provider.ts` — routes to OpenAI/Anthropic/Gemini backends based on endpointType
- [X] T035 [US9] Export createCherryIn and cherryIn singleton from `packages/ai-sdk-provider/src/index.ts`

**Checkpoint**: US9 complete — CherryIN routes to correct backends

---

## Phase 12: User Story 10 — Middleware Pipeline (Priority: P3)

**Goal**: Low-level model wrapping via middleware

**Independent Test**: Register middleware → execute → verify transforms applied

### Implementation for US10

- [X] T036 [US10] Verify middleware integration in RuntimeExecutor (already implemented in T015/T016) — middleware from direct registration and plugin configureContext both applied

**Checkpoint**: US10 complete — middleware wraps models correctly

---

## Phase 13: Built-in Plugins (US4 Extension)

**Purpose**: Logging and tool-use built-in plugins

- [X] T037 [P] Implement logging plugin in `packages/aiCore/src/core/plugins/built-in/logging.ts` — configurable levels, performance timing
- [X] T038 [P] Implement tool-use plugin in `packages/aiCore/src/core/plugins/built-in/toolUsePlugin.ts` — prompt-based tool calling for models without native function call

---

## Phase 14: Service Layer Bridge

**Purpose**: Bridge between renderer store and aiCore package

- [X] T039 Implement AiCoreService in `src/renderer/src/services/AiCoreService.ts` — reads Provider from useLlmStore, creates RuntimeExecutor with correct provider settings
- [X] T040 Export services from `src/renderer/src/services/index.ts`

---

## Phase 15: Polish & Cross-Cutting

- [X] T041 Create demo page in `demos/F003-ai-core-engine.md` — step-by-step: create executor, stream text, use plugins, handle errors
- [X] T042 Run all tests and verify type checks pass
- [X] T043 Verify package exports are complete in both packages

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — types and errors first
- **Phase 2 (Plugin System)**: Depends on Phase 1 — plugins need types
- **Phase 3 (Providers)**: Depends on Phase 1 — needs types
- **Phase 4 (Streaming)**: Depends on Phases 2+3 — needs plugins + providers
- **Phase 5 (Generation)**: Depends on Phase 4 — uses same RuntimeExecutor
- **Phase 6-8 (US5-US6-US7)**: Depend on Phase 2 — extend/verify core
- **Phase 9-10 (US8-US9)**: Standalone after Phase 1
- **Phase 11-12**: Depend on Phase 4 — extend RuntimeExecutor
- **Phase 13-15**: Depend on all above

### Parallel Opportunities

```
Phase 1: T001 → T002 → T003 || T004 → T005
Phase 2: T006 → T007 → T008
Phase 3: T009 || T010 → T011 → T012
Phase 4: T013 || T014 → T015 → T016 → T017 → T018
Phase 5: T019 → T020
Phase 6: T021 → T022 → T023
Phase 7: T024 → T025
Phase 8: T026 → T027
Phase 9: T028 → T029
Phase 10: T030 → T031
Phase 11: T032 → T033 → T034 → T035
Phase 12: T036
Phase 13: T037 || T038
Phase 14: T039 → T040
Phase 15: T041 → T042 → T043
```

## Implementation Strategy

### MVP First (US3 + US1)

1. Phase 1: Types + errors
2. Phase 2: Plugin system
3. Phase 3: Provider resolution
4. Phase 4: Streaming through pipeline
5. **VALIDATE**: Stream text works end-to-end

### Full Delivery

Phase 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15
(43 tasks total across 15 phases)
