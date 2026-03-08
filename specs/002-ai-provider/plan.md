# Implementation Plan: AI Provider

**Branch**: `002-ai-provider` | **Date**: 2026-03-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-ai-provider/spec.md`

## Summary

Multi-provider LLM abstraction layer built on Vercel AI SDK 6. Implements a factory pattern resolving 11+ provider types to SDK clients, a middleware plugin pipeline for request/response transformation, streaming support with chunk processing, and per-provider authentication services in the main process. State managed via Zustand store (migrated from Redux).

## Technical Context

**Language/Version**: TypeScript 5.8, targeting ES2022
**Primary Dependencies**: Vercel AI SDK 6 (`ai`), Zustand 5.x, electron-store 10.x, Zod (provider type validation)
**Storage**: Zustand persist middleware → electron-store via IPC (renderer), electron-store direct (main)
**Testing**: Vitest for unit/integration tests
**Target Platform**: Electron 40 (macOS, Windows, Linux)
**Project Type**: Desktop application (Electron)
**Performance Goals**: Streaming first token < 500ms, factory resolution < 10ms
**Constraints**: All provider communication renderer-side via AI SDK; auth services main-process only via IPC
**Scale/Scope**: 50+ system providers, 200+ system models, 11 provider types

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Singleton Services | ✅ | Main-process auth services (AnthropicService, VertexAIService, CopilotService) as singletons |
| II. IPC Bridge Pattern | ✅ | 25 IPC channels defined in shared IpcChannel enum for auth operations |
| III. Middleware Pipeline | ✅ | Plugin system with definePlugin() lifecycle hooks — core of this Feature |
| IV. Registry & Factory | ✅ | Provider factory resolves type → SDK client; no switch chains in business logic |
| V. Dual Database | ✅ | Provider config in Zustand (renderer); auth credentials in electron-store (main) |
| VI. Test-First | ✅ | Tests planned for factory, store, plugins, IPC handlers |
| VII. Demo-Ready | ✅ | Demo script to configure provider and send test completion |
| VIII. i18n | ✅ | Provider/model UI strings use i18next keys |

No violations. All principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/002-ai-provider/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── ipc-channels.md  # IPC contract
└── tasks.md             # Phase 2 output (speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── main/
│   ├── services/
│   │   ├── AnthropicService.ts        # Anthropic OAuth flow
│   │   ├── VertexAIService.ts         # VertexAI service account auth
│   │   ├── CopilotService.ts          # GitHub Copilot token management
│   │   ├── AngduINOAuthService.ts     # AngduIN OAuth flow
│   │   └── AesService.ts             # AES encryption for credentials
│   └── ipc/
│       └── provider-ipc.ts           # F002 IPC channel handlers
├── renderer/
│   └── src/
│       ├── aiCore/
│       │   ├── index.ts              # Unified AI Core entry point
│       │   ├── provider/
│       │   │   ├── factory.ts        # Provider type → SDK client factory
│       │   │   ├── providerConfig.ts # Provider configuration mapping
│       │   │   └── constants.ts      # Provider constants
│       │   ├── plugins/
│       │   │   ├── PluginBuilder.ts   # Plugin builder + definePlugin()
│       │   │   ├── reasoningExtractionPlugin.ts
│       │   │   ├── anthropicCachePlugin.ts
│       │   │   ├── simulateStreamingPlugin.ts
│       │   │   ├── telemetryPlugin.ts
│       │   │   └── noThinkPlugin.ts
│       │   ├── prepareParams/
│       │   │   ├── parameterBuilder.ts # Build streamText() params
│       │   │   ├── modelCapabilities.ts # Capability detection
│       │   │   └── header.ts          # Provider-specific headers
│       │   ├── chunk/
│       │   │   └── chunkProcessor.ts  # Stream chunk → MessageBlock routing
│       │   └── types/
│       │       └── index.ts           # AI Core type definitions
│       ├── stores/
│       │   └── useProviderStore.ts    # Zustand provider store
│       ├── config/
│       │   ├── providers.ts           # SYSTEM_PROVIDERS definitions
│       │   └── models.ts             # SYSTEM_MODELS definitions
│       └── types/
│           ├── provider.ts            # Provider, Model, ProviderType types
│           └── ai-core.ts            # AI Core shared types
├── shared/
│   └── ipc-channels.ts              # Add F002 IPC channel enums
└── preload/
    └── index.ts                      # Add F002 preload API methods

tests/
├── unit/
│   ├── renderer/
│   │   ├── provider-factory.test.ts   # Factory resolution tests
│   │   ├── useProviderStore.test.ts   # Store CRUD tests
│   │   ├── plugin-pipeline.test.ts    # Plugin ordering/execution tests
│   │   ├── parameter-builder.test.ts  # Param preparation tests
│   │   └── model-capabilities.test.ts # Capability detection tests
│   └── main/
│       ├── anthropic-service.test.ts  # OAuth flow tests
│       ├── vertexai-service.test.ts   # Service account auth tests
│       └── copilot-service.test.ts    # Token management tests
└── integration/
    └── provider-ipc.test.ts           # IPC channel integration tests
```

**Structure Decision**: Extends the existing F001 structure. AI Core lives in `renderer/src/aiCore/` (renderer-side, as AI SDK runs in browser context). Auth services live in `main/services/` (main-process for security). Provider IPC handlers separated into `main/ipc/provider-ipc.ts` for modularity.

## Implementation Phases

### Phase 1: Types & Store Foundation
- Define Provider, Model, ProviderType, ModelCapability types in `src/shared/` and `src/renderer/src/types/`
- Add F002 IPC channel enums to `src/shared/ipc-channels.ts`
- Create `useProviderStore` with Zustand + immer + persist middleware
- Implement provider CRUD actions (add, update, remove, reorder)
- Implement model management actions (add, remove, update per provider)
- Implement model selection actions (default, quick, translate)
- Write unit tests for store

### Phase 2: Provider Factory & Config
- Implement provider factory (`factory.ts`) mapping ProviderType → AI SDK provider constructor
- Implement 3-step resolution chain (static mapping → alias → fallback)
- Define SYSTEM_PROVIDERS and SYSTEM_MODELS constants
- Implement provider configuration mapping
- Write unit tests for factory resolution

### Phase 3: AI Core Pipeline & Plugins
- Implement `PluginBuilder` with `definePlugin()` pattern
- Implement lifecycle hooks (configureContext, onRequestStart, transformParams, onRequestEnd)
- Implement enforce ordering (pre/post)
- Create core plugins: reasoningExtraction, anthropicCache, simulateStreaming, telemetry, noThink
- Write unit tests for plugin pipeline

### Phase 4: Parameter Building & Capabilities
- Implement `parameterBuilder.ts` for streamText() param construction
- Implement model capability detection (vision, reasoning, function calling)
- Implement reasoning mode detection (3 OR conditions)
- Implement provider-specific options builder (Anthropic beta headers, etc.)
- Write unit tests for parameter building

### Phase 5: Streaming & Chunk Processing
- Implement AI Core entry point using Vercel AI SDK streamText()
- Implement chunk processor routing chunks to message block types
- Implement abort controller integration
- Implement simulated streaming for non-streaming providers
- Write integration tests for streaming pipeline

### Phase 6: Main-Process Auth Services
- Implement AnthropicService (OAuth flow)
- Implement VertexAIService (service account auth)
- Implement CopilotService (token management)
- Implement AngduINOAuthService (OAuth flow)
- Implement AesService (credential encryption)
- Register IPC handlers in provider-ipc.ts
- Add preload API methods for F002 channels
- Write unit tests for auth services

### Phase 7: Health Check & Integration
- Implement provider health check (API key validation, endpoint check, model list)
- Implement tool integration interface (prepare for F006 MCP)
- Wire provider store with AI Core pipeline
- End-to-end integration testing
- Demo script creation
