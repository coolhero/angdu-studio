# Implementation Plan: AI Core Engine

**Feature Branch**: `003-ai-core-engine`
**Created**: 2026-03-04
**Spec**: specs/003-ai-core-engine/spec.md

## Technical Context

### Tech Stack

| Area | Technology |
|------|-----------|
| Language | TypeScript 5.8 |
| AI SDK | Vercel AI SDK (ai package) |
| Provider SDKs | @ai-sdk/openai, @ai-sdk/anthropic, @ai-sdk/google, @ai-sdk/xai, @ai-sdk/azure |
| Testing | Vitest |
| Build | electron-vite (packages compiled as part of monorepo) |

### Architecture

```
packages/aiCore/                   # Pure TypeScript package
├── src/
│   ├── index.ts                   # Public API exports
│   ├── types.ts                   # ProviderId, ProviderSettingsMap, RuntimeConfig
│   ├── core/
│   │   ├── runtime/
│   │   │   ├── executor.ts        # RuntimeExecutor class
│   │   │   ├── pluginEngine.ts    # PluginEngine (orchestrates execution)
│   │   │   └── index.ts           # createExecutor, streamText, generateText
│   │   ├── plugins/
│   │   │   ├── types.ts           # AiPlugin, AiRequestContext, AiRequestMetadata
│   │   │   ├── manager.ts         # PluginManager (hook execution)
│   │   │   ├── index.ts           # createContext, definePlugin
│   │   │   └── built-in/
│   │   │       ├── logging.ts     # Logging plugin
│   │   │       └── toolUsePlugin.ts # Prompt-based tool calling
│   │   ├── options/
│   │   │   ├── types.ts           # ProviderOptionsMap, TypedProviderOptions
│   │   │   ├── builders.ts        # createOpenAIOptions, createAnthropicOptions, etc.
│   │   │   └── index.ts
│   │   ├── models/
│   │   │   ├── ModelResolver.ts   # Model resolution (traditional + namespaced)
│   │   │   └── index.ts
│   │   ├── middleware/
│   │   │   └── index.ts           # createMiddlewares, wrapModelWithMiddlewares
│   │   ├── providers/
│   │   │   ├── registry.ts        # Provider factory registry
│   │   │   └── index.ts
│   │   └── errors/
│   │       └── index.ts           # AiCoreError + 6 subclasses
│
packages/ai-sdk-provider/          # CherryIN custom provider
├── src/
│   ├── index.ts                   # createCherryIn, cherryIn
│   ├── cherryin-provider.ts       # CherryInProvider implementation
│   └── types.ts                   # CherryInProviderSettings
│
src/renderer/src/services/
├── AiCoreService.ts               # Bridge: store → aiCore
└── ContextWindowService.ts        # Context window + rate limiting
```

### Dependencies

| Dependency | Source | Purpose |
|-----------|--------|---------|
| F001-core-platform | Logging (withContext) | Context-scoped logging |
| F002-provider-management | Provider/Model types, useLlmStore | Provider configs for adapter creation |
| ai (Vercel AI SDK) | npm | streamText, generateText, generateImage, wrapLanguageModel |
| @ai-sdk/openai | npm | OpenAI + DeepSeek + OpenRouter provider adapters |
| @ai-sdk/anthropic | npm | Anthropic provider adapter |
| @ai-sdk/google | npm | Google Generative AI provider adapter |
| @ai-sdk/xai | npm | xAI (Grok) provider adapter |
| @ai-sdk/azure | npm | Azure OpenAI provider adapter |

## Constitution Check

| Principle | Compliance | Notes |
|-----------|-----------|-------|
| I. Electron Process Isolation | ✅ | aiCore is a pure TypeScript package, no direct process coupling |
| II. Service Layer Pattern | ✅ | Component → Hook → AiCoreService → aiCore package |
| III. Multi-Provider Abstraction | ✅ | Core purpose of F003 |
| IV. Plugin Architecture | ✅ | Plugin system with 10 hook types |
| IX. Streaming-First Architecture | ✅ | streamText as primary execution mode |
| XIV. Test-First | ✅ | Tests in task plan |
| XVI. Simplicity First | ✅ | Reuses AI SDK built-in providers |

## Implementation Phases

### Phase 1: Core Types and Errors (Setup)
- ProviderId type, ProviderSettingsMap, RuntimeConfig, ModelConfig
- AiCoreError base class + 6 subclasses (ModelResolutionError, ParameterValidationError, PluginExecutionError, ProviderConfigError, TemplateLoadError, RecursiveDepthError)
- AiPlugin interface, AiRequestContext, AiRequestMetadata

### Phase 2: Plugin System (Foundational)
- PluginManager: first/sequential/parallel hook execution, plugin ordering
- PluginEngine: orchestrates full execution pipeline (configureContext → onRequestStart → resolveModel → transformParams → execute → transformResult → onRequestEnd)
- definePlugin helper, createContext helper

### Phase 3: Provider Resolution and Options
- Provider factory registry: maps ProviderId → AI SDK provider factory
- ModelResolver: traditional (`modelId` + fallback) and namespaced (`provider:modelId`) formats
- Type-safe options builders: createOpenAIOptions, createAnthropicOptions, createGoogleOptions, createOpenRouterOptions, createXaiOptions
- mergeProviderOptions deep merge utility

### Phase 4: Middleware and RuntimeExecutor
- Middleware types and wrapModelWithMiddlewares utility
- RuntimeExecutor class: streamText, generateText, generateImage with plugin pipeline
- Static factories: create(), createOpenAICompatible()
- Error wrapping and propagation through pipeline

### Phase 5: Built-in Plugins
- Logging plugin (configurable levels, performance tracking)
- Tool-use plugin (prompt-based tool calling for models without native function call)

### Phase 6: CherryIN Provider (ai-sdk-provider package)
- CherryInProvider implementing Vercel AI SDK ProviderV3
- Multi-backend routing (OpenAI/Anthropic/Gemini based on endpoint type)
- Language model, embedding, image, transcription, speech model support

### Phase 7: Service Layer Bridge
- AiCoreService: reads from useLlmStore, creates RuntimeExecutor instances
- ContextWindowService: filterContextMessages, getContextCount, checkRateLimit
- Constants: DEFAULT_CONTEXT_COUNT (5), MAX_CONTEXT_COUNT (100), UNLIMITED_CONTEXT_COUNT (100000)

### Phase 8: Tests and Demo
- Unit tests for errors, plugin system, options builders, model resolver
- Integration test for RuntimeExecutor pipeline
- Demo page with step-by-step verification
