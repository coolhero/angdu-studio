# Pre-Context: AI Core Engine

**Feature ID**: F003-ai-core-engine
**Tier**: Tier 1
**Generated**: 2026-03-04

---

## Source Reference

**Source Root**: `/Users/coolhero/Study/oss/cherry-studio`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `packages/aiCore/` | Main package directory |
| `packages/aiCore/src/RuntimeExecutor.ts` | Core execution engine |
| `packages/aiCore/src/plugins/` | Plugin system |
| `packages/aiCore/src/middleware/` | Middleware pipeline |
| `packages/aiCore/src/providers/` | Provider adapters (12+ providers) |
| `packages/aiCore/src/options/` | Options builders per provider |
| `packages/ai-sdk-provider/` | Custom Vercel AI SDK provider implementations |
| `src/renderer/src/services/MessagesService.ts` | Context window, rate limiting |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding **plugin system architecture, runtime executor pattern, provider adapter design (12+ providers), middleware pipeline logic, options builders per provider, context window management (default 5, max 100, unlimited threshold 100000), rate limiting per provider, streaming-first response delivery, multi-model dispatch, and error handling with provider-specific parsing**
- Do not reference: Any UI components (aiCore is a pure TypeScript package with no UI), any Redux state management (if any store references exist)
- **Extract**: Plugin hook categories and lifecycle, RuntimeExecutor pattern, provider adapter registration and lookup (12+ providers), middleware chain composition, options builder interface contracts per provider (temperature, topP, maxTokens, etc.), streaming vs generation execution modes, context window calculation logic (default 5, max 100, unlimited threshold 100000), rate limiting implementation (configurable seconds per provider), multi-model dispatch pattern, error class hierarchy with provider-specific error parsing
- **Ignore**: Any styled-components or Ant Design references (none expected in this package)

### Static Resources

> Non-code files used by this Feature that must be **copied from the original source** during implementation.
> These files cannot be regenerated -- they must be copied as-is and placed in the appropriate location in the new project.
> Source Path is **relative to Source Root** (same as file paths above). Resolve as `[Source Root]/[Source Path]` at runtime.

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| (none) | | | aiCore is a pure TypeScript package with no static resources |

> If resources need modification (e.g., resizing images, updating translation keys), note it in the Usage column.

### Environment Variables

> Environment variables required by this Feature at runtime. Variables marked as `secret` must NOT have their actual values recorded here -- only the variable name and purpose.

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| (none specific to F003) | | | Uses Provider API keys from F002 at runtime | |

**Shared variables** (defined by other Features but also used here):

| Variable | Owner Feature | Usage in This Feature |
|----------|--------------|----------------------|
| `CSLOGGER_RENDERER_LEVEL` | F001-core-platform | Log level for AI execution logging |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F003-ai-core-engine is the Vercel AI SDK integration layer that provides a plugin-based, middleware-enhanced execution pipeline for all AI operations. It implements the RuntimeExecutor as the core execution engine, a plugin system for provider-specific capabilities, provider adapters for 12+ providers, middleware pipeline for pre/post processing hooks, and per-provider options builders (temperature, topP, maxTokens, etc.). It manages context window calculation (default 5, max 100, unlimited threshold 100000), rate limiting per provider (configurable seconds), streaming-first response delivery (token-by-token), multi-model dispatch (different models per message), and error handling with provider-specific error parsing. It also includes custom Vercel AI SDK provider implementations in the `ai-sdk-provider` package.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Streaming chat | AI core receives a chat request, resolves the provider adapter, applies plugins and middleware, streams response tokens back to caller |
| P1 | Text generation | AI core receives a generation request, executes through the pipeline, returns complete response |
| P1 | Provider resolution | Given a provider ID and model ID, AI core creates the correct Vercel AI SDK adapter instance from 12+ provider adapters |
| P1 | Context window | AI core applies context window management (default 5, max 100, unlimited threshold 100000) to limit messages sent to the provider |
| P2 | Plugin execution | Plugins hook into pre/post processing stages for provider-specific capabilities |
| P2 | Rate limiting | AI core enforces rate limiting per provider (configurable seconds between requests) |
| P2 | Multi-model dispatch | AI core dispatches the same message to different models per message for side-by-side comparison |
| P2 | Error handling | AI core catches provider errors, classifies them with provider-specific parsing, and returns typed errors |
| P3 | Middleware chain | Custom middleware transforms requests (add headers, modify parameters) before they reach the provider |
| P3 | Options builders | Per-provider options builders configure temperature, topP, maxTokens, and other provider-specific parameters |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Vercel AI SDK integration with streaming support
- **FR-002**: Plugin system for provider-specific capabilities
- **FR-003**: RuntimeExecutor for unified AI completion across providers
- **FR-004**: Middleware pipeline (pre/post processing hooks)
- **FR-005**: Provider-specific options builders (temperature, topP, maxTokens, etc.)
- **FR-006**: Context window management (default 5, max 100, unlimited threshold 100000)
- **FR-007**: Rate limiting per provider (configurable seconds)
- **FR-008**: Streaming-first response delivery (token-by-token)
- **FR-009**: Multi-model dispatch (different models per message)
- **FR-010**: Error handling with provider-specific error parsing

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: All 12+ provider types successfully resolve to correct Vercel AI SDK adapters
- **SC-002**: Streaming responses deliver first token within 2 seconds of request
- **SC-003**: Plugin hooks execute in correct order (pre-process -> process -> post-process)
- **SC-004**: Error hierarchy correctly classifies provider errors into typed categories
- **SC-005**: Middleware chain applies transformations without corrupting request/response data
- **SC-006**: Context window correctly limits messages to configured count (default 5)
- **SC-007**: Rate limiting enforces configured delay between requests per provider

### Edge Cases

- Provider returns unexpected response format; error hierarchy must classify correctly
- Streaming connection drops mid-response; graceful error recovery needed
- Multiple plugins modifying the same request field; last-write-wins or merge strategy
- Rate limit error from provider triggers appropriate retry or backoff signal
- Empty response from provider handled without crash
- Plugin throws during execution; does not block other plugins in the chain
- Very large response exceeding memory limits during generation mode
- Context window with unlimited threshold (100000) sends all messages
- Multi-model dispatch with one model failing and others succeeding; independent error handling per model

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-core-platform | Infrastructure | Uses IPC framework for main process API access, logging infrastructure |
| F002-provider-management | Entity | Needs Provider configs (type, apiKey, apiHost) and Model entities for AI SDK adapter initialization |

### Related Entities (data-model.md draft)

#### Owned Entities

None -- F003 does not own persistent entities. It operates on transient execution contexts using Provider and Model from F002.

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| Provider | F002-provider-management | Read (provider config) | Provider type, apiKey, apiHost for AI SDK adapter creation |
| Model | F002-provider-management | Read (model config) | Model ID, capabilities for execution configuration |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| Class | `RuntimeExecutor` | Core execution engine for unified AI completion |
| Function | `executeStream()` | Execute a streaming AI request through the pipeline |
| Function | `executeGeneration()` | Execute a non-streaming AI request through the pipeline |
| Function | `registerPlugin()` | Register a plugin with the plugin engine |
| Function | `registerMiddleware()` | Register middleware in the pipeline |
| Class | `AiError` hierarchy | Typed error classes for AI operation failures |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| Zustand | `useProviderStore` | F002-provider-management | Read provider configs for AI SDK adapter initialization |
| IPC | `app:*` | F001-core-platform | App info and proxy configuration for API calls |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: aiCore is a pure TypeScript package with no UI dependencies. It implements the RuntimeExecutor wrapping Vercel AI SDK with plugin system, middleware pipeline, and 12+ provider adapters. Options builders generate provider-specific request parameters. Context window management limits messages sent. Rate limiting enforces delays per provider. Multi-model dispatch supports different models per message. Error handling includes provider-specific parsing.
- **Recommended implementation approach**: Directly reuse the aiCore package architecture as-is since it is stack-independent (pure TypeScript, no UI, no Redux, no styled-components). The only change is that provider config lookup should read from Zustand store instead of Redux store. The ai-sdk-provider custom implementations are also stack-independent.
- **Caveats**: Minimal migration impact. Only the bridge between aiCore and the renderer state layer needs to change from Redux selectors to Zustand store access. All core execution logic, plugin system, middleware pipeline, options builders, and error handling are reusable as-is.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Executor API compatibility | F005-ai-chat | Verify F005 correctly calls RuntimeExecutor and executeStream() for chat message processing |
| Provider config access | F002-provider-management | Verify F003 can read Provider configs from F002's Zustand store for adapter initialization |
| Plugin system extensibility | F005-ai-chat | Verify F005 can register plugins for chat-specific pre/post processing (e.g., knowledge injection) |
| Error hierarchy integration | F005-ai-chat | Verify F005 correctly catches and displays typed AiError subclasses to users |
| Streaming interface | F005-ai-chat | Verify F005's message streaming service correctly consumes the streaming execution output |
| Context window logic | F005-ai-chat | Verify F005's context window settings (default 5, max 100) are correctly applied by F003 |
| Rate limiting | F005-ai-chat | Verify F005's rate limit enforcement correctly uses F003's per-provider rate limiting |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F005-ai-chat | API change impact | If RuntimeExecutor or streaming interface changes, F005's chat pipeline needs modification |
| F005-ai-chat | Plugin change impact | If plugin hook categories or lifecycle changes, F005's registered plugins need modification |
| F005-ai-chat | Error change impact | If error hierarchy changes, F005's error handling and user-facing error display needs modification |
| F004-knowledge-base | API change impact | If generation execution interface changes, F004's embedding operations may need modification |
| F005-ai-chat | Context window impact | If context window calculation logic changes, F005's message inclusion behavior changes |
