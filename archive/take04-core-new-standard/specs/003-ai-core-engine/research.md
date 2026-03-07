# Research: AI Core Engine

## Decision 1: Package Architecture

**Decision**: Implement aiCore as a local package at `packages/aiCore/` — a pure TypeScript package with no UI dependencies, matching the original source architecture.

**Rationale**: The aiCore package is stack-independent — no React, no Redux, no UI framework dependencies. It wraps Vercel AI SDK and can be used from both renderer (via hooks/services) and main process. Keeping it as a separate package maintains clean separation.

**Alternatives considered**:
- Inline in renderer src: Would couple AI logic to renderer process unnecessarily
- Main process only: Would require IPC for every AI call, adding latency

## Decision 2: Vercel AI SDK Version

**Decision**: Use Vercel AI SDK v6 (already in package.json as `ai: "^4.3.16"` — upgrade to v6 for latest provider support and `experimental_transform`).

**Rationale**: v6 provides `streamText()`, `generateText()`, `generateImage()`, `wrapLanguageModel()` middleware, and `experimental_transform` for stream processing — all required by the architecture. The original source uses v6 features.

**Alternatives considered**:
- AI SDK v4 (current): Missing `experimental_transform` for stream plugins and latest provider features
- Direct provider SDKs: Would lose the unified interface and require custom streaming

## Decision 3: Provider Adapter Pattern

**Decision**: Use AI SDK's built-in provider factories (`createOpenAI`, `createAnthropic`, `createGoogleGenerativeAI`, etc.) initialized with per-provider settings from F002's Zustand store.

**Rationale**: AI SDK already implements provider adapters for all target providers. No need to write custom HTTP clients. Just initialize with correct settings (apiKey, baseURL, headers).

**Alternatives considered**:
- Custom HTTP adapters: Massive duplication of AI SDK's existing work
- Single adapter with config switching: Loses type safety and provider-specific features

## Decision 4: Plugin Hook Execution Strategy

**Decision**: Three execution patterns:
1. **First-wins** (resolveModel, loadTemplate): Returns first non-null result from sorted plugins
2. **Sequential/Serializing** (configureContext, transformParams, transformResult): Chains through all plugins in order
3. **Parallel** (onRequestStart, onRequestEnd, onError): All plugins fire concurrently via `Promise.allSettled`

**Rationale**: Matches the original aiCore architecture. Different hooks need different semantics: model resolution needs a single answer, transforms need chaining, lifecycle notifications need independence.

**Alternatives considered**:
- All sequential: Would slow down lifecycle hooks unnecessarily
- All parallel: Would make transformation order non-deterministic

## Decision 5: Store Integration

**Decision**: F003 reads Provider/Model configs from F002's `useLlmStore` Zustand store. No direct store dependency in the aiCore package itself — the caller (F005 chat service) passes provider settings when creating an executor.

**Rationale**: Keeps aiCore store-agnostic. The original source has the renderer service layer bridge between store and aiCore. This maintains clean separation.

**Alternatives considered**:
- Direct Zustand import in aiCore: Would couple the package to a specific state management library
- IPC-based config fetching: Unnecessary overhead — the renderer already has the store

## Decision 6: Context Window Implementation

**Decision**: Context window management lives in a utility function that filters messages before they're passed to the executor. Not part of the RuntimeExecutor itself — it's a pre-processing step.

**Rationale**: Matches the original architecture where `MessagesService.ts` handles context window before calling aiCore. Keeps the executor focused on execution.

**Alternatives considered**:
- Built into RuntimeExecutor: Would couple execution to message management
- As a plugin: Overly complex for a simple filter operation

## Decision 7: Rate Limiting Implementation

**Decision**: Rate limiting is enforced at the caller level (renderer service layer), not inside aiCore. The provider's `rateLimit` field (seconds) is checked before creating/calling the executor.

**Rationale**: Matches the original architecture. Rate limiting is a UI-layer concern (showing toast warnings) that doesn't belong in a pure execution engine.

**Alternatives considered**:
- Inside RuntimeExecutor: Would need UI integration (toasts) in a non-UI package
- As middleware: Would silently delay requests without user feedback

## Decision 8: CherryIN Provider

**Decision**: Implement as a custom AI SDK provider in `packages/ai-sdk-provider/` — a separate package that implements the Vercel AI SDK ProviderV3 interface.

**Rationale**: CherryIN needs custom routing logic (route to OpenAI/Anthropic/Gemini backends based on endpoint type). AI SDK's `createOpenAICompatible` doesn't support this routing. A custom provider keeps this logic encapsulated.

**Alternatives considered**:
- Multiple standard providers with switching: Would require dynamic executor creation per model
- Proxy layer: Unnecessary complexity for client-side routing

## Decision 9: Error Hierarchy

**Decision**: Implement `AiCoreError extends Error` as base with 6 specific subclasses. Each error has `code`, `message`, `context` (Record), and optional `cause` (Error).

**Rationale**: Typed errors enable the UI to show appropriate messages and take recovery actions. The `toJSON()` method enables IPC serialization.

**Alternatives considered**:
- String error codes only: Loses instanceof checking and type narrowing
- Union type discriminated errors: More complex, less extensible
