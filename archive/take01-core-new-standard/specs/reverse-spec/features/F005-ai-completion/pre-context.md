# Pre-Context: AI Completion

**Feature ID**: F005
**Tier**: Tier 1
**Generated**: 2026-03-02

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/renderer/src/aiCore/index.ts` | AI provider entry point (exports Legacy + Modern) |
| `src/renderer/src/aiCore/index_new.ts` | ModernAiProvider (Vercel AI SDK based) |
| `src/renderer/src/aiCore/legacy/index.ts` | Legacy AiProvider (raw SDK clients) |
| `src/renderer/src/aiCore/legacy/middleware/register.ts` | Middleware chain registration (13 layers) |
| `src/renderer/src/aiCore/legacy/middleware/` | Individual middleware implementations |
| `src/renderer/src/aiCore/legacy/clients/ApiClientFactory.ts` | Provider-to-client mapping |
| `src/renderer/src/aiCore/legacy/clients/` | Provider-specific client implementations |
| `src/renderer/src/aiCore/provider/providerConfig.ts` | Provider config adaptation |
| `src/renderer/src/services/ApiService.ts` | API orchestration and completion entry |
| `src/renderer/src/services/ConversationService.ts` | Message preprocessing |
| `src/renderer/src/types/chunk.ts` | Chunk types for streaming |
| `packages/aiCore/src/` | AI SDK abstraction layer (providers, plugins, middleware, executor) |
| `packages/ai-sdk-provider/src/` | Custom AI SDK provider (CherryInProvider) |

### Reference Guide

#### [New Stack] Logic-Only Reference
- Extract: Streaming chunk type taxonomy, middleware chain sequence and responsibilities, tool calling mode selection logic, API key rotation, special provider handling, prompt variable replacement, context injection patterns
- Ignore: Redux action dispatches in thunks (will be Zustand)

### Static Resources

None.

### Environment Variables

None — uses provider credentials from F003.

---

## For /speckit.specify

### Existing Feature Summary

AI Completion is the heart of Cherry Studio — the dual-layer streaming pipeline that sends messages to 50+ AI providers and processes responses. The Modern pipeline uses Vercel AI SDK with a plugin-based executor. The Legacy pipeline uses raw SDK clients with a 13-layer middleware chain. Supports streaming/non-streaming, multi-model parallel responses, function calling (native + prompt-based), thinking/reasoning chunks, web search integration, image generation routing, and abort/cancel.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Streaming Chat | User sends message; response streams token-by-token with thinking blocks |
| P1 | Tool Calling | Model invokes MCP tool during response; result fed back for continuation |
| P1 | Multi-Provider | User switches between OpenAI/Anthropic/Gemini; each works seamlessly |
| P2 | Cancel Response | User clicks stop; streaming aborts cleanly, partial response preserved |
| P2 | Prompt Tool Use | Model without native function calling uses XML-based tool invocation |

### Draft Requirements

- **FR-035**: Implement streaming completion pipeline using Vercel AI SDK with provider abstraction
- **FR-036**: Implement chunk type system (TEXT_DELTA, THINKING_DELTA, TOOL_USE, TOOL_RESULT, WEB_SEARCH, IMAGE, etc.)
- **FR-037**: Implement provider-specific SDK client mapping (OpenAI, Anthropic, Gemini, Azure, Bedrock, VertexAI, etc.)
- **FR-038**: Implement function calling mode with native SDK tools and prompt-based fallback
- **FR-039**: Implement abort/cancel via AbortController with clean partial state preservation
- **FR-040**: Implement prompt variable replacement (%date%, %time%, etc.)
- **FR-041**: Implement AiSdkToChunkAdapter for unified stream processing
- **FR-042**: Implement special provider handling (Copilot token refresh, CherryAI signing, Anthropic OAuth)

### Draft Acceptance Criteria

- **SC-019**: Streaming completion works with all supported provider types
- **SC-020**: Tool calling loop completes correctly (call → result → continue → call → ...)
- **SC-021**: Cancel preserves partial response without corruption
- **SC-022**: Prompt variables are correctly replaced before sending
- **SC-023**: Chunk types are correctly categorized for UI rendering

### Edge Cases

- Provider returns error mid-stream (ErrorHandlerMiddleware catches)
- Tool call with timeout (AbortController + timeout)
- Model returns empty response
- Rate limiting from provider (429 handling)
- Concurrent completions on same topic (queue prevents)

---

## For /speckit.plan

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F003-provider-management | Provider config | Resolves Provider → AI SDK config |
| F004-chat-conversation | Message data | Receives preprocessed messages, writes blocks |

### Related Entities

#### Referenced Entities

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| Provider | F003 | Config read | Get API credentials and provider type |
| Model | F003 | Config read | Get model capabilities and endpoint type |
| Message | F004 | Input data | Preprocessed messages as completion input |
| MessageBlock | F004 | Output target | Streaming chunks written as blocks |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Dual-layer pipeline (Legacy raw SDK + Modern Vercel AI SDK). 13-layer middleware chain for legacy. Plugin-based executor for modern. Provider-to-client factory mapping.
- **Recommended implementation approach**: Consolidate to Modern pipeline only (Vercel AI SDK). Keep the plugin architecture from packages/aiCore. The legacy middleware chain's logic should be migrated to AI SDK middleware/plugins. Keep ApiClientFactory as fallback for provider-specific quirks.
- **Caveats**: Some provider-specific behaviors are deeply embedded in legacy middleware (Anthropic raw stream listener, OpenAI thinking tag extraction). These need careful extraction into AI SDK middleware.

---

## For /speckit.analyze

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Provider compatibility | F003 | Verify all provider types route to correct SDK client |
| Message format | F004 | Verify preprocessed messages are valid input for all providers |
| Tool execution | F007 | Verify MCP tool call/result round-trip works correctly |
| Knowledge context | F006 | Verify injected knowledge context is properly formatted for each provider |
| Memory context | F008 | Verify memory search results integrate into system prompt |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F004 | Chunk format | If chunk types change, UI rendering needs updates |
| F010 | Image routing | If image generation routing changes, painting feature affected |
| F012 | API server | If completion pipeline interface changes, REST API routes affected |
