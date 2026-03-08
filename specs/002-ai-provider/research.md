# Research: F002-ai-provider

**Date**: 2026-03-08
**Feature**: AI Provider — Multi-provider LLM abstraction

---

## R1: Provider Factory Pattern — Vercel AI SDK Integration

**Decision**: Use Vercel AI SDK 6 (`ai` package) provider registry with a custom factory wrapper that maps Angdu `ProviderType` to AI SDK provider constructors.

**Rationale**: Cherry Studio already uses Vercel AI SDK in its modern provider path. The SDK handles streaming, tool calling, and provider-specific APIs natively. Our factory wraps `createOpenAI`, `createAnthropic`, `createGoogleGenerativeAI`, etc. with Angdu-specific configuration (proxy, custom headers, API key rotation).

**Alternatives considered**:
- Direct SDK calls without factory → rejected: would scatter provider-specific logic across the codebase
- Custom HTTP client layer → rejected: Vercel AI SDK already handles provider quirks, streaming protocols, and error normalization

---

## R2: State Management — Redux to Zustand Migration for LLM Store

**Decision**: Create `useProviderStore` (Zustand with immer middleware) replacing the Redux `llm` slice. Use `persist` middleware with `createJSONStorage` for electron-store persistence via IPC.

**Rationale**: The constitution mandates Zustand. The `llm` slice is heavily mutative (provider list reordering, nested model updates), making immer middleware essential. Persistence goes through the existing F001 config:get/set IPC bridge.

**Alternatives considered**:
- Zustand without immer → rejected: provider/model mutations are deeply nested, immer significantly reduces boilerplate
- Separate stores per concern (providers, models, settings) → rejected: they're tightly coupled in the original and splitting would create sync issues

---

## R3: Plugin System Architecture

**Decision**: Implement plugins using `definePlugin()` pattern with lifecycle hooks: `configureContext`, `onRequestStart`, `transformParams`, `onRequestEnd`. Plugins declare `enforce: 'pre'` or `'post'` for ordering.

**Rationale**: Direct port of Cherry Studio's plugin architecture which is well-tested and extensible. The Vercel AI SDK's middleware system aligns with this pattern.

**Alternatives considered**:
- Vercel AI SDK native middleware only → rejected: doesn't cover all our lifecycle hooks (e.g., telemetry, reasoning extraction need post-processing)
- Event-based plugin system → rejected: harder to guarantee ordering and data flow

---

## R4: Provider-Specific Authentication Services

**Decision**: Main-process services for OAuth/token management (AnthropicService, VertexAIService, CopilotService, AngduINOAuthService) communicate with renderer via dedicated IPC channels. Credentials stored securely via electron-store with AES encryption for sensitive values.

**Rationale**: OAuth flows require system browser integration (unavailable in renderer). Token refresh needs background scheduling. Keeping auth in main process follows the Electron security model.

**Alternatives considered**:
- Renderer-only auth → rejected: OAuth redirect handling requires system browser
- Separate credentials store → rejected: electron-store with AES encryption is sufficient for desktop app

---

## R5: Streaming Chunk Processing

**Decision**: Use Vercel AI SDK's `streamText()` / `streamObject()` with custom `onChunk` handler that routes chunks to the appropriate message block type (text, thinking, tool call, citation).

**Rationale**: The AI SDK handles SSE parsing, backpressure, and abort controllers. Our chunk processor maps SDK events to Angdu's MessageBlock types (defined in F003 but the interface contract is needed here).

**Alternatives considered**:
- Custom SSE parser → rejected: reinventing what AI SDK already handles well
- Web Streams API directly → rejected: AI SDK abstracts provider differences in streaming protocols

---

## R6: Model Capability Detection

**Decision**: Capability metadata stored as arrays on Model entities (`capabilities: ModelCapability[]`). System models have pre-defined capabilities. Custom models inherit from provider defaults with user overrides.

**Rationale**: Capabilities drive feature gating (vision, reasoning, function calling). Declarative metadata is easier to maintain than runtime detection. Aligns with constitution principle IV (Registry & Factory Patterns).

**Alternatives considered**:
- Runtime capability probing → rejected: unreliable, requires API calls, doesn't work offline
- Hardcoded switch statements → rejected: violates constitution principle IV
