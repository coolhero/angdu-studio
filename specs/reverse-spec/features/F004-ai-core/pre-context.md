# Pre-Context: F004-ai-core

> Multi-provider AI completion engine, middleware pipeline, plugin system, streaming
> Generated: 2026-03-14

---

## Feature Overview

F004-ai-core is the AI completion engine that powers all AI interactions in Angdu Studio. It provides a dual-architecture provider system (Modern via Vercel AI SDK, Legacy via custom wrappers), a composable plugin pipeline, streaming chunk protocol, API key rotation, and message preparation. This feature has NO UI — it is a pure service/library layer consumed by F006-chat, F007-knowledge, F012-translate, and F013-agent.

### Key Responsibilities

1. **Provider Abstraction**: Unified interface over 20+ LLM providers (OpenAI, Anthropic, Google, Azure, Ollama, etc.)
2. **Plugin Pipeline**: Composable middleware chain (telemetry, reasoning extraction, streaming simulation, cache control, web search, tool use)
3. **Message Preparation**: 9-stage filtering pipeline converting raw conversation to API-ready messages
4. **Streaming**: Typed chunk dispatch protocol with 20+ chunk types, provider-agnostic normalization
5. **Key Rotation**: Round-robin API key selection for multi-key configurations
6. **Knowledge Injection**: RAG reference injection before message preparation
7. **MCP Tool Integration**: Tool discovery and execution routing via MCP servers
8. **Provider Authentication**: Standard and special auth flows (OAuth, HMAC signing, token refresh)

### Boundaries

- Does NOT own provider configuration (F003-provider owns Provider/Model entities)
- Does NOT own UI rendering (F006-chat owns message display)
- Does NOT own MCP server lifecycle (F008-mcp owns server management)
- Does NOT own knowledge base operations (F007-knowledge owns RAG infrastructure)
- DOES own the completion request lifecycle from message preparation through stream dispatch

---

## Runtime Exploration Results

F004-ai-core has no direct UI screens. Its runtime behavior is observed through:

- **Chat completion flow**: User sends message in F006-chat -> F004 prepares messages -> selects provider -> executes completion -> streams chunks back to F006
- **Plugin effects**: Reasoning blocks appear in messages (reasoning extraction plugin), web search results injected (web search plugin), tool calls dispatched (tool use plugin)
- **Provider selection**: Model dropdown in chat header triggers provider resolution through F004's factory
- **Streaming indicators**: Token-per-second counters, progress indicators, and partial text rendering all driven by F004's chunk protocol

### Observable Behaviors

| Behavior | Observation Point | Description |
|----------|-------------------|-------------|
| Dual architecture selection | Console/logs | `isModernSdkSupported()` check determines path |
| Plugin pipeline assembly | Console/logs | `buildPlugins()` logs active plugins per request |
| Key rotation | Console/logs | Key index increments per request in `window.keyv` |
| Stream chunks | Message rendering | Text appears incrementally, tool panels expand, thinking blocks fill |
| Rate limiting | Toast notification | "Rate limit exceeded, waiting X seconds" when threshold hit |
| Message filtering | API request payload | 9-stage pipeline reduces message count from conversation history |

---

## Source Reference

> All paths relative to cherry-studio root.

### Primary Source Files

| Path | Description | Lines (approx) |
|------|-------------|----------------|
| `src/renderer/src/aiCore/index_new.ts` | ModernAiProvider — Vercel AI SDK path | 566 |
| `src/renderer/src/aiCore/legacy/index.ts` | LegacyAiProvider — custom wrapper path | ~400 |
| `src/renderer/src/aiCore/legacy/clients/` | Provider SDK adapters (OpenAI, Gemini, Anthropic, Claude, Groq, etc.) | ~15 files |
| `src/renderer/src/aiCore/legacy/middleware/` | Processing pipeline — common/, core/, feat/ subdirectories | ~20 files |
| `src/renderer/src/aiCore/plugins/` | 12 plugin types (PluginBuilder.ts is entry point) | ~15 files |
| `src/renderer/src/aiCore/plugins/PluginBuilder.ts` | Plugin pipeline assembly — `buildPlugins()` | ~200 |
| `src/renderer/src/aiCore/prepareParams/` | Message preparation pipeline stages | ~10 files |
| `src/renderer/src/aiCore/provider/` | Provider config, factory, SDK adapter resolution | ~8 files |
| `src/renderer/src/aiCore/tools/` | Knowledge, memory, web search tool integrations | ~5 files |
| `src/renderer/src/aiCore/utils/` | Image processing, MCP utils, websearch, reasoning utilities | ~10 files |
| `packages/aiCore/` | `@cherrystudio/ai-core` package — plugin system, executor, provider management | ~20 files |
| `packages/ai-sdk-provider/` | `@cherrystudio/ai-sdk-provider` — CherryIN routing provider | ~10 files |

### Total: ~104 files in `src/renderer/src/aiCore/` + ~30 files in `packages/`

### Key Types & Interfaces

| Type | Location | Description |
|------|----------|-------------|
| `AiCoreConfig` | `src/renderer/src/aiCore/types.ts` | Top-level configuration for a completion request |
| `AiCoreSendOptions` | `src/renderer/src/aiCore/types.ts` | Options passed to send/stream methods |
| `AiCorePlugin` | `packages/aiCore/src/types.ts` | Plugin interface for middleware chain |
| `StreamChunk` | `src/renderer/src/aiCore/types.ts` | Discriminated union of 20+ chunk types |
| `PluginContext` | `packages/aiCore/src/types.ts` | Context object passed through plugin chain |
| `ProviderAdapter` | `src/renderer/src/aiCore/provider/types.ts` | Provider-specific SDK adapter interface |
| `MessagePrepareStage` | `src/renderer/src/aiCore/prepareParams/types.ts` | Pure function `Message[] -> Message[]` |

---

## Source Behavior Inventory (SBI)

### AI Provider Architecture (B076-B082)

| ID | Behavior | Source File(s) | BR | Priority |
|----|----------|---------------|-----|----------|
| B076 | Runtime selection between Modern (AI SDK) and Legacy provider paths via `isModernSdkSupported()` | `aiCore/index_new.ts`, `aiCore/legacy/index.ts` | BR-001 | MUST |
| B077 | Modern path uses Vercel AI SDK `streamText`/`generateText` with middleware wrapping | `aiCore/index_new.ts` | BR-001 | MUST |
| B078 | Legacy path uses custom wrapper with manual stream assembly and provider-specific clients | `aiCore/legacy/index.ts`, `aiCore/legacy/clients/` | BR-001 | SHOULD |
| B079 | Both paths converge at typed chunk dispatch layer for uniform downstream processing | `aiCore/index_new.ts`, `aiCore/legacy/index.ts` | BR-009 | MUST |
| B080 | Provider factory resolves provider type to appropriate SDK adapter | `aiCore/provider/` | BR-001 | MUST |
| B081 | Provider URL formatting with per-provider version path rules (`/v1`, `/v1beta`, `#` suffix suppression) | `aiCore/provider/` | BR-006 | MUST |
| B082 | Special authentication flows: GitHub Copilot OAuth refresh, CherryAI HMAC signing, Anthropic Bearer | `aiCore/provider/`, `aiCore/legacy/clients/` | BR-007 | SHOULD |

### Plugin Pipeline (B083-B090)

| ID | Behavior | Source File(s) | BR | Priority |
|----|----------|---------------|-----|----------|
| B083 | `buildPlugins()` assembles ordered plugin chain based on assistant settings and provider capabilities | `aiCore/plugins/PluginBuilder.ts` | BR-002 | MUST |
| B084 | Plugin ordering: telemetry outermost, tool use innermost; order affects behavior | `aiCore/plugins/PluginBuilder.ts` | BR-002 | MUST |
| B085 | Reasoning extraction plugin captures chain-of-thought into separate MessageBlock | `aiCore/plugins/` | BR-002 | MUST |
| B086 | Streaming simulation plugin for providers that don't natively support streaming | `aiCore/plugins/` | BR-002 | SHOULD |
| B087 | Cache control plugin for prompt caching (Anthropic, etc.) | `aiCore/plugins/` | BR-002 | COULD |
| B088 | Web search plugin injects search results into completion context | `aiCore/plugins/`, `aiCore/tools/` | BR-002 | SHOULD |
| B089 | Tool use plugin handles MCP tool call/result cycle within completion | `aiCore/plugins/`, `aiCore/tools/` | BR-002 | MUST |
| B090 | Telemetry plugin tracks token usage, latency, tokens-per-second metrics | `aiCore/plugins/` | BR-002 | SHOULD |

### API Key Management (B091-B093)

| ID | Behavior | Source File(s) | BR | Priority |
|----|----------|---------------|-----|----------|
| B091 | Comma-separated API keys parsed and selected via round-robin counter | `aiCore/provider/` | BR-003 | MUST |
| B092 | Per-provider counter persists in `window.keyv` namespace, increments per request | `aiCore/provider/` | BR-003 | MUST |
| B093 | Key rotation enables load distribution across multiple API keys | `aiCore/provider/` | BR-003 | SHOULD |

### Message Preparation Pipeline (B094-B103)

| ID | Behavior | Source File(s) | BR | Priority |
|----|----------|---------------|-----|----------|
| B094 | 9-stage sequential filtering pipeline: each stage is pure function `Message[] -> Message[]` | `aiCore/prepareParams/` | BR-004 | MUST |
| B095 | Stage 1: Context clear marker detection — messages before clear marker are dropped | `aiCore/prepareParams/` | BR-004 | MUST |
| B096 | Stage 2: Useful message filtering — removes messages marked as not useful | `aiCore/prepareParams/` | BR-004 | MUST |
| B097 | Stage 3: Error-only message removal — drops messages containing only error blocks | `aiCore/prepareParams/` | BR-004 | SHOULD |
| B098 | Stage 4: Adjacent same-role message merging — merges consecutive messages with same role | `aiCore/prepareParams/` | BR-004 | MUST |
| B099 | Stage 5: Context window limit enforcement — trims to `contextCount` setting | `aiCore/prepareParams/` | BR-004 | MUST |
| B100 | Stage 6: Empty message removal — drops messages with no content | `aiCore/prepareParams/` | BR-004 | MUST |
| B101 | Stage 7: User-role-start enforcement — ensures first message has role=user | `aiCore/prepareParams/` | BR-004 | MUST |
| B102 | Stage 8: System prompt injection — prepends assistant's system prompt as system message | `aiCore/prepareParams/` | BR-004 | MUST |
| B103 | Stage 9: Final validation — ensures message array is well-formed for API submission | `aiCore/prepareParams/` | BR-004 | MUST |

### Knowledge & Tool Integration (B104-B108)

| ID | Behavior | Source File(s) | BR | Priority |
|----|----------|---------------|-----|----------|
| B104 | RAG search results injected into last user message via `REFERENCE_PROMPT` template | `aiCore/tools/` | BR-005 | SHOULD |
| B105 | Knowledge injection happens before the 9-stage message preparation pipeline | `aiCore/tools/` | BR-005 | SHOULD |
| B106 | MCP tool discovery: aggregate tools from assistant's linked MCP servers | `aiCore/tools/` | BR-010 | MUST |
| B107 | MCP hub mode: namespace tool IDs as `serverId__toolName` to prevent collisions | `aiCore/tools/` | BR-010 | MUST |
| B108 | Tool call result routing: parse namespace prefix to route response to originating server | `aiCore/tools/` | BR-010 | MUST |

### Stream Processing (B109-B115)

| ID | Behavior | Source File(s) | BR | Priority |
|----|----------|---------------|-----|----------|
| B109 | SSE/stream chunks parsed into typed discriminated union (20+ types) | `aiCore/index_new.ts`, `aiCore/legacy/index.ts` | BR-009 | MUST |
| B110 | Chunk types include: text-delta, tool-call-begin, tool-result, reasoning, usage, error, finish | `aiCore/types.ts` | BR-009 | MUST |
| B111 | Dispatcher matches chunk type to registered callbacks for UI state updates | `aiCore/index_new.ts` | BR-009 | MUST |
| B112 | Protocol is provider-agnostic — provider adapters normalize to common chunk types | `aiCore/legacy/clients/` | BR-009 | MUST |
| B113 | Developer-to-system role conversion for providers not supporting developer role | `aiCore/prepareParams/` | BR-008 | MUST |
| B114 | Per-provider rate limiting with token bucket, warning toast, and request queuing | `aiCore/provider/` | BR-012 | SHOULD |
| B115 | Rate limit state is in-memory, resets on app restart | `aiCore/provider/` | BR-012 | SHOULD |

### Package Layer (B116-B120)

| ID | Behavior | Source File(s) | BR | Priority |
|----|----------|---------------|-----|----------|
| B116 | `@cherrystudio/ai-core` package: plugin system interfaces and executor | `packages/aiCore/` | BR-002 | MUST |
| B117 | `@cherrystudio/ai-sdk-provider` package: CherryIN routing provider adapter | `packages/ai-sdk-provider/` | BR-001 | SHOULD |
| B118 | Plugin executor runs plugin chain in order, passing context through each plugin | `packages/aiCore/` | BR-002 | MUST |
| B119 | Provider management: registration, capability discovery, health check | `packages/aiCore/` | BR-001 | MUST |
| B120 | Image processing utilities: base64 encoding, URL conversion, dimension extraction | `aiCore/utils/` | — | SHOULD |

---

## Environment Variables

| Variable | Purpose | Used By |
|----------|---------|--------|
| Provider API keys | Authentication per provider | Provider factory, key rotation |
| `window.keyv` | Per-provider key rotation counter | Key rotation (B091-B092) |
| Proxy URL (from F002 settings) | HTTP proxy for API requests | Provider adapters |

---

## For /speckit.specify

### Entity Ownership

F004 does NOT own any persisted entities. It operates on:
- **Provider** / **Model** (owned by F003) — read-only consumption
- **Assistant** / **AssistantSettings** (owned by F005) — read-only consumption for settings
- **Message** / **MessageBlock** (owned by F006) — creates MessageBlock variants during streaming
- **MCPServer** (owned by F008) — read-only for tool discovery

F004 defines runtime-only types: `AiCoreConfig`, `AiCoreSendOptions`, `AiCorePlugin`, `StreamChunk`, `PluginContext`, `ProviderAdapter`, `MessagePrepareStage`.

### Business Rules Owned

BR-001 (Dual Architecture), BR-002 (Plugin Pipeline), BR-003 (Key Rotation), BR-004 (Message Preparation), BR-005 (Knowledge Injection — shared with F007), BR-006 (URL Formatting), BR-007 (Special Auth), BR-008 (Role Conversion), BR-009 (Stream Protocol), BR-012 (Rate Limiting).

### Acceptance Criteria Focus

1. Modern provider path completes streaming request end-to-end
2. Plugin pipeline assembles correct plugins for given assistant/provider config
3. Message preparation pipeline produces valid API payload from conversation history
4. Stream chunks are correctly typed and dispatched to callbacks
5. Key rotation distributes requests across configured keys
6. Rate limiting prevents requests exceeding provider threshold

---

## For /speckit.plan

### Migration Impact

- **UI Impact**: None (F004 has no UI)
- **State Impact**: Low (no Redux slices — config comes from F003/F005 stores)
- **Key Migration**: Package rename `@cherrystudio/ai-core` -> `@angdustudio/ai-core`, `@cherrystudio/ai-sdk-provider` -> `@angdustudio/ai-sdk-provider`

### Implementation Order

1. **Phase 1**: Core types and interfaces (`AiCoreConfig`, `StreamChunk`, `AiCorePlugin`, etc.)
2. **Phase 2**: Message preparation pipeline (9 stages as pure functions — highly testable)
3. **Phase 3**: Provider factory and SDK adapters (Modern path first, Legacy path if needed)
4. **Phase 4**: Plugin system (`PluginBuilder`, individual plugins)
5. **Phase 5**: Stream processing and chunk dispatch
6. **Phase 6**: Integration — key rotation, rate limiting, knowledge injection, MCP tools

### Dependencies to Resolve First

- F003-provider must provide `Provider`, `Model` types and `useProviderStore`
- F001-app-shell must provide IPC channels for MCP tool calls
- F005-assistant must provide `AssistantSettings` type (can use interface stub)

### Zustand Store Impact

F004 does not own a Zustand store. It reads from `useProviderStore` (F003) and `useAssistantStore` (F005). Its runtime state (active streams, rate limit counters) is managed in-memory within service instances.

### Package Structure

```
packages/
  ai-core/           -> @angdustudio/ai-core (plugin system, executor)
  ai-sdk-provider/   -> @angdustudio/ai-sdk-provider (AngduIN routing)
src/renderer/src/
  ai-core/            -> Main AI core implementation
    plugins/           -> Plugin implementations
    prepare-params/    -> Message preparation stages
    provider/          -> Provider factory and adapters
    tools/             -> Knowledge, MCP, web search integrations
    utils/             -> Shared utilities
```

---

## Feature Contracts

### Provided Contracts (F004 exposes)

| Contract | Consumer(s) | Description |
|----------|-------------|-------------|
| `sendCompletion(config: AiCoreConfig, options: AiCoreSendOptions): AsyncIterable<StreamChunk>` | F006-chat, F012-translate, F013-agent | Primary completion API — streams typed chunks |
| `prepareMessages(messages: Message[], assistant: Assistant): Message[]` | F006-chat | 9-stage message preparation pipeline |
| `buildPlugins(assistant: Assistant, provider: Provider): AiCorePlugin[]` | Internal | Plugin chain assembly |
| `resolveProvider(model: Model): ProviderAdapter` | Internal | Provider factory resolution |

### Required Contracts (F004 depends on)

| Contract | Provider | Description |
|----------|----------|-------------|
| `Provider` / `Model` entities | F003-provider | Provider configuration and model metadata |
| `AssistantSettings` type | F005-assistant | Temperature, contextCount, maxTokens, etc. |
| IPC: `as:mcp:list-tools` | F008-mcp (via F001) | MCP tool discovery |
| IPC: `as:mcp:call-tool` | F008-mcp (via F001) | MCP tool execution |
| IPC: `as:knowledge:search` | F007-knowledge (via F001) | RAG search for knowledge injection |
| `SettingsState.proxyUrl` | F002-settings | HTTP proxy configuration |

### Naming Remapping

| Cherry Studio | Angdu Studio |
|---------------|--------------|
| `@cherrystudio/ai-core` | `@angdustudio/ai-core` |
| `@cherrystudio/ai-sdk-provider` | `@angdustudio/ai-sdk-provider` |
| CherryIN | AngduIN |
| `CSLOGGER` prefix | `ASLOGGER` prefix |
| `cs:` IPC prefix | `as:` IPC prefix |
