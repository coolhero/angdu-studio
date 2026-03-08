# F002-ai-provider — Pre-Context

**Feature**: Multi-provider LLM abstraction, provider factory, model management, middleware pipeline, plugins
**Release Group**: RG-1 | **Tier**: T1

---

## 1. Runtime Exploration Results

- **Provider Architecture**: Dual-layer system — legacy `AiProvider` (direct SDK calls) and modern `ModernAiProvider` (Vercel AI SDK based). Legacy is default export for backward compatibility.
- **Provider Types**: 11 provider types via `ProviderTypeSchema`: `openai`, `openai-response`, `anthropic`, `gemini`, `azure-openai`, `vertexai`, `mistral`, `aws-bedrock`, `vertex-anthropic`, `new-api`, `gateway`, `ollama`.
- **Provider Factory**: `src/renderer/src/aiCore/provider/factory.ts` maps provider types to SDK client constructors with provider-specific configuration.
- **Plugin System**: 12 plugins in `aiCore/plugins/` for behavior modification — reasoning extraction, thinking mode, cache control, search orchestration, telemetry, streaming simulation.
- **Model Management**: Redux slice `llm.ts` manages providers list, default/quick/translate models, per-provider settings (VertexAI service accounts, AWS Bedrock credentials, Ollama keepAlive).
- **LLM Settings**: Includes provider-specific config (VertexAI project/location/service account, AWS Bedrock auth, CherryIN tokens).
- **System Providers**: `SYSTEM_PROVIDERS` constant defines built-in provider configurations.
- **System Models**: `SYSTEM_MODELS` constant defines default model selections.

---

## 2. Source Reference

| File | Role |
|------|------|
| `src/renderer/src/aiCore/index.ts` | Unified entry point, re-exports legacy and modern providers |
| `src/renderer/src/aiCore/index_new.ts` | Modern AI provider (Vercel AI SDK) |
| `src/renderer/src/aiCore/legacy/` | Legacy provider implementation |
| `src/renderer/src/aiCore/provider/factory.ts` | Provider factory — maps type to SDK client |
| `src/renderer/src/aiCore/provider/providerConfig.ts` | Provider configuration mapping |
| `src/renderer/src/aiCore/provider/providerInitialization.ts` | Provider initialization logic |
| `src/renderer/src/aiCore/provider/constants.ts` | Provider constants |
| `src/renderer/src/aiCore/plugins/PluginBuilder.ts` | Plugin builder pattern for middleware |
| `src/renderer/src/aiCore/plugins/anthropicCachePlugin.ts` | Anthropic cache control |
| `src/renderer/src/aiCore/plugins/noThinkPlugin.ts` | Disable thinking mode |
| `src/renderer/src/aiCore/plugins/reasoningExtractionPlugin.ts` | Extract reasoning from responses |
| `src/renderer/src/aiCore/plugins/reasoningTimePlugin.ts` | Track reasoning time |
| `src/renderer/src/aiCore/plugins/searchOrchestrationPlugin.ts` | Web search orchestration |
| `src/renderer/src/aiCore/plugins/simulateStreamingPlugin.ts` | Simulate streaming for non-streaming APIs |
| `src/renderer/src/aiCore/plugins/telemetryPlugin.ts` | Usage telemetry |
| `src/renderer/src/aiCore/prepareParams/` | Parameter preparation for API calls |
| `src/renderer/src/aiCore/tools/` | Tool integration for AI calls |
| `src/renderer/src/aiCore/chunk/` | Stream chunk processing |
| `src/renderer/src/aiCore/utils/` | AI core utilities |
| `src/renderer/src/aiCore/trace/` | Request tracing |
| `src/renderer/src/aiCore/types/` | AI core type definitions |
| `src/renderer/src/types/provider.ts` | Provider type schema, API options, service tiers |
| `src/renderer/src/types/aiCoreTypes.ts` | AI core shared types |
| `src/renderer/src/types/sdk.ts` | SDK type definitions |
| `src/renderer/src/store/llm.ts` | Redux slice: providers, models, LLM settings |
| `src/renderer/src/config/models.ts` | System model definitions |
| `src/renderer/src/config/providers.ts` | System provider definitions |
| `src/main/services/AnthropicService.ts` | Main-process Anthropic OAuth |
| `src/main/services/VertexAIService.ts` | Main-process VertexAI auth |
| `src/main/services/CopilotService.ts` | GitHub Copilot token management |
| `src/main/services/MistralClientManager.ts` | Mistral client management |

---

## 3. Source Behavior Inventory

| ID | Behavior | Priority | Source |
|----|----------|----------|--------|
| B016 | Resolve provider type to SDK client via factory pattern | P1 | `provider/factory.ts` |
| B017 | Initialize provider with API key, base URL, and provider-specific config | P1 | `provider/providerInitialization.ts` |
| B018 | Execute AI completion request with streaming support | P1 | `aiCore/index_new.ts` |
| B019 | Apply middleware plugin pipeline to requests (cache, reasoning, telemetry) | P1 | `plugins/PluginBuilder.ts` |
| B020 | Process streaming chunks into message blocks | P1 | `aiCore/chunk/` |
| B021 | Manage provider CRUD (add, update, remove, reorder) in store | P1 | `store/llm.ts` |
| B022 | Manage model list per provider (add, remove, update) | P1 | `store/llm.ts` |
| B023 | Set default, quick, and translate model selections | P1 | `store/llm.ts` |
| B024 | Handle VertexAI authentication (service account, project, location) | P2 | `VertexAIService.ts` |
| B025 | Handle AWS Bedrock authentication (access key, IAM, API key modes) | P2 | `store/llm.ts` |
| B026 | Handle Anthropic OAuth flow | P2 | `AnthropicService.ts` |
| B027 | Handle GitHub Copilot token management | P2 | `CopilotService.ts` |
| B028 | Extract reasoning/thinking content from model responses | P2 | `reasoningExtractionPlugin.ts` |
| B029 | Simulate streaming for non-streaming provider APIs | P2 | `simulateStreamingPlugin.ts` |
| B030 | Track and report token usage telemetry | P2 | `telemetryPlugin.ts` |
| B031 | Handle provider-specific API options (service tiers, developer role, stream options) | P2 | `types/provider.ts` |
| B032 | Manage CherryIN OAuth tokens (access + refresh) | P3 | `CherryINOAuthService.ts` |
| B033 | Handle OpenAI Response API format (separate from completions) | P2 | `ProviderTypeSchema` |
| B034 | Prepare request parameters with model-specific overrides | P1 | `aiCore/prepareParams/` |
| B035 | Integrate tools (MCP, web search) into AI request pipeline | P2 | `aiCore/tools/` |

---

## 4. UI Component Features

| AntD Component (Current) | shadcn/ui Replacement | Usage Context |
|---------------------------|----------------------|---------------|
| Select | Select / Combobox | Provider type selector, model picker |
| Input, Input.Password | Input | API key, base URL fields |
| Switch | Switch | Provider enable/disable |
| Button | Button | Add provider, test connection |
| Modal | Dialog | Provider configuration dialogs |
| List | Custom list | Provider list, model list |
| Tag | Badge | Provider type indicators |

---

## 5. Naming Remapping

| Current Identifier | Location | Suggested Replacement |
|--------------------|----------|-----------------------|
| `cherryIn` (LLM settings key) | `store/llm.ts` | `angduIn` |
| `CherryINOAuthService` | `src/main/services/CherryINOAuthService.ts` | `AngduINOAuthService` |
| `IpcChannel.CherryIN_*` | IPC channels (6 channels) | `IpcChannel.AngduIN_*` |
| `IpcChannel.Cherryai_GetSignature` | IPC channel | `IpcChannel.Angduai_GetSignature` |
| `cherryin` (preload API group) | `src/preload/index.ts` | `angduin` |
| `cherryai` (preload API group) | `src/preload/index.ts` | `angduai` |
| `@cherrystudio/openai` | Package import | `@angdustudio/openai` (or keep if forked) |
| `@cherrystudio/analytics-client` | Package import | `@angdustudio/analytics-client` |

---

## 6. Static Resources

| Resource | Path | Notes |
|----------|------|-------|
| Provider icons | `src/renderer/src/assets/images/providers/` | Per-provider logos |
| Model icons | `src/renderer/src/assets/images/models/` | Per-model/family icons |

---

## 7. Environment Variables

| Variable | Scope | Description |
|----------|-------|-------------|
| `VITE_RENDERER_INTEGRATED_MODEL` | Renderer | Pre-configured integrated model |

---

## 8. For /speckit.specify

**Feature Summary**: Multi-provider LLM abstraction layer supporting 11+ provider types via a factory pattern, with middleware plugin pipeline for request/response transformation, streaming support, and per-provider authentication and configuration management.

**User Scenarios**:
- US-007: User adds a new OpenAI-compatible provider with API key and base URL
- US-008: User selects a default model for conversations
- US-009: User configures VertexAI with service account credentials
- US-010: User enables a provider and its models become available in model picker
- US-011: System streams AI response through plugin pipeline (cache, reasoning extraction, telemetry)

**Draft Requirements**:
- FR-011: System SHALL support at least 11 provider types via factory pattern
- FR-012: System SHALL manage provider configurations (API key, base URL, models)
- FR-013: System SHALL support streaming and non-streaming completions
- FR-014: System SHALL apply configurable middleware plugins to AI requests
- FR-015: System SHALL handle provider-specific authentication (OAuth, service accounts, API keys)
- FR-016: System SHALL track token usage per request
- FR-017: System SHALL support OpenAI Response API format alongside Completions API
- FR-018: System SHALL allow setting default, quick, and translate model selections

**Success Criteria**:
- SC-005: Provider factory resolves all 11 types without error
- SC-006: Streaming response appears within 500ms of request
- SC-007: Token usage is accurately tracked for all providers
- SC-008: Plugin pipeline executes in correct order without data loss

---

## 9. For /speckit.plan

**Dependencies**:
- Upstream: F001 (IPC bridge for main-process auth services, proxy settings)
- Downstream: F003 (chat sends completions via aiCore), F005 (streaming UI consumes chunks)

**Entity/API Contracts**:
- `Provider` — `{ id, name, type: ProviderType, apiKey, apiHost, models: Model[], enabled, ... }`
- `Model` — `{ id, name, provider, group?, ... }`
- `LlmState` — `{ providers, defaultModel, quickModel, translateModel, settings }`
- `ProviderType` — Zod enum of 11 values
- `ProviderApiOptions` — per-provider feature flags
- Store migration: Redux `createSlice('llm')` -> Zustand store with equivalent state shape

---

## 10. For /speckit.analyze

**Cross-Feature Verification Points**:
- F002 <-> F001: Proxy settings must be applied to all provider HTTP clients
- F002 <-> F003: Chat core calls `aiCore` to send messages; must receive streaming chunks
- F002 <-> F005: Streaming UI subscribes to chunk events from aiCore
- F002 <-> F006: MCP tools are injected into AI request pipeline via `aiCore/tools/`
- Redux->Zustand migration: `store/llm.ts` uses `createSlice` with `PayloadAction` — convert to Zustand store with immer middleware. Provider list and model management are heavily mutative.
