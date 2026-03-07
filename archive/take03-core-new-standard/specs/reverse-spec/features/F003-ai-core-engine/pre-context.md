# Pre-Context: AI Core Engine

**Feature ID**: F003-ai-core-engine
**Tier**: Tier 1
**Generated**: 2026-03-04

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `packages/aiCore/src/core/runtime/` | Runtime executor factory and execution pipeline |
| `packages/aiCore/src/core/plugins/` | Plugin system with 3 hook categories (pre-process, process, post-process) |
| `packages/aiCore/src/core/providers/` | Provider registry and AI SDK adapter integration |
| `packages/aiCore/src/core/options/` | Options builders for provider-specific request parameters |
| `packages/aiCore/src/core/middleware/` | Middleware pipeline for request/response transformation |
| `packages/aiCore/src/core/errors.ts` | Error hierarchy for AI operations |
| `packages/ai-sdk-provider/src/` | Custom AI SDK provider implementations |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding **plugin system architecture, runtime executor pattern, provider registry design, middleware pipeline logic, error hierarchy, and options builder patterns**
- Do not reference: Any UI components (aiCore is a pure TypeScript package with no UI), any Redux state management (if any store references exist)
- **Extract**: Plugin hook categories and lifecycle, runtime executor factory pattern, provider registration and lookup, middleware chain composition, error class hierarchy, options builder interface contracts, streaming vs generation execution modes
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
| (none specific to F003) | | | | |

**Shared variables** (defined by other Features but also used here):

| Variable | Owner Feature | Usage in This Feature |
|----------|--------------|----------------------|
| `CSLOGGER_RENDERER_LEVEL` | F001-core-platform | Log level for AI execution logging |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F003-ai-core-engine is the Vercel AI SDK wrapper layer that provides a plugin-based, middleware-enhanced execution pipeline for all AI operations. It implements a plugin system with 3 hook categories (pre-process, process, post-process), a runtime executor factory for creating execution contexts, a provider registry that maps Cherry Studio provider types to Vercel AI SDK adapters, streaming and generation execution modes, a typed error hierarchy, and a middleware pipeline for request/response transformation. It also includes custom AI SDK provider implementations in the `ai-sdk-provider` package.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Streaming chat | AI core receives a chat request, resolves the provider, applies plugins and middleware, streams response tokens back to caller |
| P1 | Text generation | AI core receives a generation request, executes through the pipeline, returns complete response |
| P1 | Provider resolution | Given a provider ID and model ID, AI core creates the correct Vercel AI SDK adapter instance |
| P2 | Plugin execution | Plugins hook into pre-process (modify request), process (handle execution), and post-process (transform response) stages |
| P2 | Error handling | AI core catches provider errors, classifies them (auth, rate limit, network, etc.), and returns typed errors |
| P3 | Middleware chain | Custom middleware transforms requests (add headers, modify parameters) before they reach the provider |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Plugin system with 3 hook categories: pre-process (request modification), process (execution handling), post-process (response transformation)
- **FR-002**: Runtime executor factory that creates execution contexts from provider + model + options configuration
- **FR-003**: Provider registry mapping Cherry Studio provider types to Vercel AI SDK adapters
- **FR-004**: Streaming execution mode with token-by-token response delivery
- **FR-005**: Generation execution mode with complete response return
- **FR-006**: Typed error hierarchy (authentication, rate limiting, network, provider-specific errors)
- **FR-007**: Middleware pipeline for request/response transformation with composable middleware chain

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: All 12 provider types successfully resolve to correct Vercel AI SDK adapters
- **SC-002**: Streaming responses deliver first token within 2 seconds of request
- **SC-003**: Plugin hooks execute in correct order (pre-process -> process -> post-process)
- **SC-004**: Error hierarchy correctly classifies provider errors into typed categories
- **SC-005**: Middleware chain applies transformations without corrupting request/response data

### Edge Cases

- Provider returns unexpected response format; error hierarchy must classify correctly
- Streaming connection drops mid-response; graceful error recovery needed
- Multiple plugins modifying the same request field; last-write-wins or merge strategy
- Rate limit error from provider triggers appropriate retry or backoff signal
- Empty response from provider handled without crash
- Plugin throws during execution; does not block other plugins in the chain
- Very large response exceeding memory limits during generation mode

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-core-platform | Infrastructure | Uses IPC framework for main process API access |
| F002-provider-management | Entity | Needs Provider configs (type, apiKey, apiHost) for AI SDK adapter initialization |

### Related Entities (data-model.md draft)

#### Owned Entities

**AiPlugin** -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique plugin identifier |
| name | string | required | Plugin display name |
| hooks | object | required | Map of hook category to handler functions (preProcess, process, postProcess) |
| priority | number | optional | Execution order priority |
| enabled | boolean | required | Whether plugin is active |

**PluginEngine** -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| plugins | AiPlugin[] | required | Registered plugins |
| middleware | Middleware[] | required | Registered middleware chain |

**RuntimeExecutor** -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| provider | object | required | Resolved AI SDK provider instance |
| model | string | required | Model identifier |
| options | object | required | Provider-specific options |
| pluginEngine | PluginEngine | required | Plugin engine for this execution |

**AiRequestContext** -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| messages | array | required | Chat messages for the request |
| systemPrompt | string | optional | System prompt text |
| tools | object | optional | Available tools for function calling |
| options | object | required | Request options (temperature, maxTokens, etc.) |

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| Provider | F002-provider-management | Read (provider config) | Provider type, apiKey, apiHost for AI SDK adapter creation |
| Model | F002-provider-management | Read (model config) | Model ID, capabilities for execution configuration |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| Function | `createRuntimeExecutor()` | Factory to create a runtime executor from provider + model config |
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
- **Existing logic summary**: aiCore is a pure TypeScript package with no UI dependencies. It implements a plugin-based execution pipeline wrapping Vercel AI SDK. The provider registry maps 12 Cherry Studio provider types to AI SDK adapters. Middleware chain transforms requests/responses. Error hierarchy classifies provider failures.
- **Recommended implementation approach**: Directly reuse the aiCore package architecture as-is since it is stack-independent (pure TypeScript, no UI, no Redux, no styled-components). The only change is that provider config lookup should read from Zustand store instead of Redux store.
- **Caveats**: Minimal migration impact. The ai-sdk-provider custom implementations are also stack-independent. Only the bridge between aiCore and the renderer state layer needs to change from Redux selectors to Zustand store access.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Executor API compatibility | F005-ai-chat | Verify F005 correctly calls createRuntimeExecutor() and executeStream() for chat message processing |
| Provider config access | F002-provider-management | Verify F003 can read Provider configs from F002's Zustand store for adapter initialization |
| Plugin system extensibility | F005-ai-chat | Verify F005 can register plugins for chat-specific pre/post processing (e.g., knowledge injection) |
| Error hierarchy integration | F005-ai-chat | Verify F005 correctly catches and displays typed AiError subclasses to users |
| Streaming interface | F005-ai-chat | Verify F005's message streaming service correctly consumes the streaming execution output |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F005-ai-chat | API change impact | If executor factory signature or streaming interface changes, F005's chat pipeline needs modification |
| F005-ai-chat | Plugin change impact | If plugin hook categories or lifecycle changes, F005's registered plugins need modification |
| F005-ai-chat | Error change impact | If error hierarchy changes, F005's error handling and user-facing error display needs modification |
| F004-knowledge-base | API change impact | If generation execution interface changes, F004's embedding operations may need modification |
