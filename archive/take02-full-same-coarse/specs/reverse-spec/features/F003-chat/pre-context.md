# Pre-Context: Chat Pipeline

**Feature ID**: F003-chat
**Tier**: Tier 1
**Generated**: 2026-03-02

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` → `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/renderer/src/aiCore/index_new.ts` | Main AI pipeline executor |
| `src/renderer/src/aiCore/plugins/PluginBuilder.ts` | Plugin-based pipeline builder (12+ plugins) |
| `src/renderer/src/aiCore/plugins/anthropicCachePlugin.ts` | Anthropic cache plugin |
| `src/renderer/src/aiCore/plugins/noThinkPlugin.ts` | No-think plugin |
| `src/renderer/src/aiCore/plugins/openrouterGenerateImagePlugin.ts` | OpenRouter image generation plugin |
| `src/renderer/src/aiCore/plugins/openrouterReasoningPlugin.ts` | OpenRouter reasoning plugin |
| `src/renderer/src/aiCore/plugins/qwenThinkingPlugin.ts` | Qwen thinking plugin |
| `src/renderer/src/aiCore/plugins/reasoningExtractionPlugin.ts` | Reasoning extraction plugin |
| `src/renderer/src/aiCore/plugins/reasoningTimePlugin.ts` | Reasoning time tracking plugin |
| `src/renderer/src/aiCore/plugins/searchOrchestrationPlugin.ts` | Search orchestration plugin |
| `src/renderer/src/aiCore/plugins/simulateStreamingPlugin.ts` | Simulate streaming plugin |
| `src/renderer/src/aiCore/plugins/skipGeminiThoughtSignaturePlugin.ts` | Skip Gemini thought signature plugin |
| `src/renderer/src/aiCore/plugins/telemetryPlugin.ts` | Telemetry plugin |
| `src/renderer/src/aiCore/chunk/AiSdkToChunkAdapter.ts` | Stream-to-chunk adapter |
| `src/renderer/src/aiCore/chunk/handleToolCallChunk.ts` | Tool call chunk processing |
| `src/renderer/src/types/newMessage.ts` | Message and MessageBlock type definitions |
| `src/renderer/src/types/chunk.ts` | Chunk type definitions (30+ types) |
| `src/renderer/src/types/index.ts` | WebSearchProvider, MCPServer types |
| `src/renderer/src/store/newMessage.ts` | Message Redux slice |
| `src/renderer/src/store/messageBlock.ts` | Message blocks Redux slice |
| `src/renderer/src/store/thunk/messageThunk.ts` | Message async thunks |
| `src/renderer/src/store/mcp.ts` | MCP Redux slice |
| `src/renderer/src/store/websearch.ts` | Web search slice |
| `src/renderer/src/store/memory.ts` | Memory Redux slice |
| `src/renderer/src/store/toolPermissions.ts` | Tool permission slice |
| `src/renderer/src/pages/home/Chat.tsx` | Chat page component |
| `src/renderer/src/pages/home/HomePage.tsx` | Home page component |
| `src/renderer/src/pages/home/Navbar.tsx` | Chat navbar component |
| `src/renderer/src/pages/home/Messages/Messages.tsx` | Message list component |
| `src/renderer/src/pages/home/Messages/Message.tsx` | Single message component |
| `src/renderer/src/pages/home/Messages/MessageContent.tsx` | Message content renderer |
| `src/renderer/src/pages/home/Messages/MessageGroup.tsx` | Message group component |
| `src/renderer/src/pages/home/Messages/MessageEditor.tsx` | Message editing component |
| `src/renderer/src/pages/home/Messages/MessageMenubar.tsx` | Message action menu |
| `src/renderer/src/pages/home/Messages/Blocks/index.tsx` | Block renderer registry |
| `src/renderer/src/pages/home/Messages/Blocks/MainTextBlock.tsx` | Main text block component |
| `src/renderer/src/pages/home/Messages/Blocks/ThinkingBlock.tsx` | Thinking block component |
| `src/renderer/src/pages/home/Messages/Blocks/ToolBlock.tsx` | Tool block component |
| `src/renderer/src/pages/home/Messages/Blocks/CitationBlock.tsx` | Citation block component |
| `src/renderer/src/pages/home/Messages/Blocks/ImageBlock.tsx` | Image block component |
| `src/renderer/src/pages/home/Messages/Blocks/CodeBlock.tsx` | Code block component |
| `src/renderer/src/pages/home/Messages/Blocks/ErrorBlock.tsx` | Error block component |
| `src/renderer/src/pages/home/Messages/Blocks/FileBlock.tsx` | File block component |
| `src/renderer/src/pages/home/Messages/Blocks/VideoBlock.tsx` | Video block component |
| `src/renderer/src/pages/home/Messages/Blocks/CompactBlock.tsx` | Compact block component |
| `src/renderer/src/pages/home/Messages/Blocks/TranslationBlock.tsx` | Translation block component |
| `src/renderer/src/pages/home/Messages/Tools/MessageTools.tsx` | Message tools container |
| `src/renderer/src/pages/home/Messages/Tools/MessageMcpTool.tsx` | MCP tool display component |
| `src/renderer/src/pages/home/Messages/Tools/MessageWebSearch.tsx` | Web search tool display |
| `src/renderer/src/pages/home/Messages/Tools/MessageMemorySearch.tsx` | Memory search tool display |
| `src/renderer/src/pages/home/Messages/Tools/MessageKnowledgeSearch.tsx` | Knowledge search tool display |
| `src/renderer/src/pages/home/Messages/Tools/ToolApprovalActions.tsx` | Tool approval actions UI |
| `src/renderer/src/pages/home/Messages/Tools/ToolPermissionRequestCard.tsx` | Tool permission request card |
| `src/renderer/src/pages/home/Inputbar/Inputbar.tsx` | Main input bar component |
| `src/renderer/src/pages/home/Inputbar/SendMessageButton.tsx` | Send/stop button |
| `src/renderer/src/pages/home/Inputbar/AttachmentPreview.tsx` | Attachment preview |
| `src/renderer/src/pages/home/Inputbar/MentionModelsInput.tsx` | @mention models input |
| `src/renderer/src/pages/home/Inputbar/TokenCount.tsx` | Token count display |
| `src/renderer/src/pages/home/Inputbar/InputbarTools.tsx` | Input bar tools |
| `src/renderer/src/pages/home/Inputbar/KnowledgeBaseInput.tsx` | Knowledge base input |
| `src/renderer/src/pages/home/Inputbar/tools/webSearchTool.tsx` | Web search tool toggle |
| `src/renderer/src/pages/home/Inputbar/tools/mcpToolsTool.tsx` | MCP tools toggle |
| `src/renderer/src/pages/home/Inputbar/tools/mentionModelsTool.tsx` | Mention models tool |
| `src/renderer/src/pages/home/Inputbar/tools/attachmentTool.tsx` | Attachment tool |
| `src/renderer/src/pages/home/Inputbar/tools/knowledgeBaseTool.tsx` | Knowledge base tool |
| `src/renderer/src/pages/home/Inputbar/tools/thinkingTool.tsx` | Thinking mode tool |
| `src/renderer/src/pages/home/Tabs/` | Multi-tab conversations |
| `src/renderer/src/pages/home/Markdown/` | Markdown rendering |
| `src/renderer/src/services/MessagesService.ts` | Message persistence service |
| `src/renderer/src/services/MemoryService.ts` | Memory service for conversation memory (renderer) |
| `src/renderer/src/services/KnowledgeService.ts` | Knowledge service (RAG integration in chat) |
| `src/renderer/src/services/WebSearchService.ts` | Web search service |
| `src/renderer/src/services/TokenService.ts` | Token counting service |
| `src/renderer/src/services/messageStreaming/BlockManager.ts` | Block state management with throttled updates |
| `src/renderer/src/services/messageStreaming/index.ts` | Message streaming entry point |
| `src/renderer/src/services/messageStreaming/callbacks/baseCallbacks.ts` | Base streaming callbacks |
| `src/renderer/src/services/messageStreaming/callbacks/textCallbacks.ts` | Text streaming callbacks |
| `src/renderer/src/services/messageStreaming/callbacks/thinkingCallbacks.ts` | Thinking streaming callbacks |
| `src/renderer/src/services/messageStreaming/callbacks/toolCallbacks.ts` | Tool call streaming callbacks |
| `src/renderer/src/services/messageStreaming/callbacks/citationCallbacks.ts` | Citation streaming callbacks |
| `src/renderer/src/services/messageStreaming/callbacks/imageCallbacks.ts` | Image streaming callbacks |
| `src/renderer/src/services/messageStreaming/callbacks/videoCallbacks.ts` | Video streaming callbacks |
| `src/renderer/src/services/messageStreaming/callbacks/compactCallbacks.ts` | Compact streaming callbacks |
| `src/renderer/src/hooks/useMessage.ts` | Message hook |
| `src/renderer/src/hooks/useTopic.ts` | Topic hook |
| `src/renderer/src/utils/abortController.ts` | Abort controller utilities |
| `src/main/services/MCPService.ts` | MCP server management (main process) |
| `src/main/mcpServers/factory.ts` | MCP server factory |
| `src/main/mcpServers/memory.ts` | Built-in memory MCP server |
| `src/main/mcpServers/fetch.ts` | Built-in fetch MCP server |
| `src/main/mcpServers/python.ts` | Built-in Python MCP server |
| `src/main/mcpServers/brave-search.ts` | Built-in Brave search MCP server |
| `src/main/mcpServers/didi-mcp.ts` | Built-in DiDi MCP server |
| `src/main/mcpServers/dify-knowledge.ts` | Built-in Dify knowledge MCP server |
| `src/main/mcpServers/sequentialthinking.ts` | Built-in sequential thinking MCP server |
| `src/main/mcpServers/browser/` | Built-in browser MCP server |
| `src/main/mcpServers/filesystem/` | Built-in filesystem MCP server |
| `src/main/mcpServers/hub/` | MCP server hub |
| `src/main/services/memory/MemoryService.ts` | Memory service (main process) |
| `src/main/services/memory/queries.ts` | Memory SQL queries |
| `packages/shared/IpcChannel.ts` | IPC channel definitions (mcp:*, memory:*) |
| `packages/shared/mcp.ts` | MCP shared utilities |
| `packages/aiCore/` | AI core package (runtime executor, plugin engine) |
| `packages/aiCore/src/core/runtime/executor.ts` | RuntimeExecutor |
| `packages/aiCore/src/core/runtime/pluginEngine.ts` | PluginEngine lifecycle |
| `packages/aiCore/src/core/plugins/` | Plugin system (manager, types, built-in/) |
| `packages/mcp-trace/` | MCP tracing (3 sub-packages) |
| `src/renderer/src/trace/` | Tracing UI |
| `src/main/services/NodeTraceService.ts` | Node trace service |
| `src/main/services/SpanCacheService.ts` | Span cache service |
| `src/renderer/src/aiCore/prepareParams/` | Request parameter preparation |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [Same Stack] Implementation Reference
- Actively reference and reuse existing implementation patterns
- **Key reference points**: Plugin-based AI pipeline with lifecycle hooks; Message->Block decomposition with 11 block types; Chunk adapter converting AI SDK stream parts to Cherry-specific chunks; MCP tool calling with abort support; Multi-model message support with parallel execution
- **Reusable code**:
  - `src/renderer/src/aiCore/plugins/PluginBuilder.ts:PluginBuilder` — Composable plugin builder for AI pipeline; reuse for all AI call processing
  - `src/renderer/src/aiCore/chunk/AiSdkToChunkAdapter.ts:AiSdkToChunkAdapter` — Converts Vercel AI SDK stream parts to Cherry Studio Chunk types
  - `src/renderer/src/aiCore/index_new.ts:fetchChatCompletion` — Main chat completion entry point with provider resolution, plugin execution, and streaming
  - `src/renderer/src/types/newMessage.ts:Message` — Message type with block IDs, mentions, status
  - `src/renderer/src/types/newMessage.ts:MessageBlock` — Block type with 11 variants (text, thinking, code, image, tool, citation, etc.)
  - `src/renderer/src/types/chunk.ts:ChunkType` — 30+ chunk type enum for stream processing
  - `src/renderer/src/store/newMessage.ts:messagesSlice` — Message state management with topic-based organization
  - `src/renderer/src/store/messageBlock.ts:messageBlocksSlice` — Block state management
  - `src/renderer/src/services/MessagesService.ts:MessagesService` — Message CRUD operations
  - `src/renderer/src/hooks/useMessage.ts:useMessage` — React hook for message operations in chat UI
  - `packages/aiCore/src/core/runtime/executor.ts:RuntimeExecutor` — Plugin-based execution pipeline with lifecycle hooks; reuse for composable AI request processing
  - `packages/aiCore/src/core/runtime/pluginEngine.ts:PluginEngine` — Plugin registration, ordering, and lifecycle management; reuse for extensible pipeline architecture
  - `src/renderer/src/aiCore/chunk/handleToolCallChunk.ts:handleToolCallChunk` — Accumulates and processes tool call chunks from streaming responses; reuse for MCP tool integration
  - `src/renderer/src/services/messageStreaming/BlockManager.ts:BlockManager` — Manages message block state with throttled Redux dispatches (prevents UI jank during streaming); reuse for all block lifecycle management
  - `src/main/services/MCPService.ts:MCPService` — MCP server lifecycle management with transport abstraction; reuse for all MCP interactions
  - `src/main/services/memory/MemoryService.ts:MemoryService` — Long-term memory with vector similarity search and semantic dedup; reuse for memory persistence
  - `src/renderer/src/services/WebSearchService.ts:WebSearchService` — Multi-provider web search; reuse for search result integration
  - `src/renderer/src/store/thunk/messageThunk.ts:sendMessage` — Async thunk orchestrating the full message send pipeline; reuse as reference for message flow

### Static Resources

> Non-code files used by this Feature that must be **copied from the original source** during implementation.
> These files cannot be regenerated — they must be copied as-is and placed in the appropriate location in the new project.
> Source Path is **relative to Source Root** (same as file paths above). Resolve as `[Source Root]/[Source Path]` at runtime.

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| `src/renderer/src/assets/images/web-search/` | Image | `src/renderer/src/assets/images/web-search/` | Web search provider icons (Google, Bing, Baidu, etc.) |

> If resources need modification (e.g., resizing images, updating translation keys), note it in the Usage column.

### Environment Variables

> Environment variables required by this Feature at runtime. Variables marked as `secret` must NOT have their actual values recorded here — only the variable name and purpose.

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| `DIDI_API_KEY` | secret | No | DiDi MCP server API key | — |
| `CHERRY_AUTO_ALLOW_TOOLS` | feature-flag | No | Auto-approve Claude Code agent tool calls (set to "1" to enable) | `1` |

**Shared variables** (defined by other Features but also used here):

| Variable | Owner Feature | Usage in This Feature |
|----------|--------------|----------------------|
| `NODE_OPTIONS` | F001-platform | Node.js memory limit for streaming chat operations |
| `CSLOGGER_RENDERER_LEVEL` | F001-platform | Log level for chat pipeline debugging |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F003-chat implements the core AI conversation pipeline that defines Cherry Studio's primary user experience. It features a plugin-based architecture with 12+ composable plugins controlling the chat lifecycle, message->block decomposition with 11 block types (text, thinking, code, image, tool, citation, file, video, error, compact, translation), streaming via Vercel AI SDK with a custom chunk adapter (30+ chunk types), MCP tool calling with abort support, multi-model messages with parallel execution, web search integration (external providers + LLM-native), and conversation memory injection.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Send message | User types a message and sends it; assistant responds with streaming text in real-time |
| P1 | Stream response | Assistant response streams token-by-token with thinking blocks visible when using reasoning models |
| P1 | MCP tool use | Assistant invokes MCP tools (file read, web search, code execution) during response generation; tool results integrated into blocks |
| P1 | Abort response | User clicks stop during streaming; response gracefully terminates with partial content preserved |
| P2 | Multi-model | User @mentions multiple models; parallel responses generated and displayed in configurable layout |
| P2 | Web search | Assistant performs web search via external providers or LLM-native search; citation blocks show sources |
| P2 | Knowledge RAG | Chat context enriched with knowledge base search results; citation blocks reference document sources |
| P2 | Memory injection | Conversation memory items injected into context for personalization |
| P3 | Message editing | User edits a previous message; conversation re-generated from edit point |
| P3 | Block interactions | User copies, collapses, or interacts with individual message blocks (code, thinking, citation) |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Plugin-based AI pipeline with configurable lifecycle hooks (configureContext, onRequestStart, transformParams, transformResult, onRequestEnd)
- **FR-002**: Message->Block decomposition with 11 block types (UNKNOWN, MAIN_TEXT, THINKING, TRANSLATION, IMAGE, CODE, TOOL, FILE, ERROR, CITATION, VIDEO, COMPACT)
- **FR-003**: Streaming chat completion via Vercel AI SDK with custom chunk adapter (30+ chunk types)
- **FR-004**: MCP tool calling with listTools, callTool, abortTool support
- **FR-005**: Web search integration (Tavily, SearXNG, Exa, Bocha, local-google/bing/baidu) and LLM-native search
- **FR-006**: Multi-model messages with parallel execution and configurable display layouts
- **FR-007**: Conversation memory injection for personalization
- **FR-008**: Message CRUD with topic-based organization
- **FR-009**: Abort/cancel support at stream processing boundaries

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: Streaming chat response begins within 2 seconds of sending a message
- **SC-002**: All 11 block types render correctly with appropriate UI components
- **SC-003**: MCP tool calls complete and results display in tool blocks
- **SC-004**: Abort terminates streaming within 500ms with partial content preserved
- **SC-005**: Multi-model responses display correctly in all 4 layout modes (horizontal, vertical, fold, grid)
- **SC-006**: Web search results appear as citation blocks with clickable source links

### Edge Cases

- Network disconnection during streaming preserves partial response
- MCP tool timeout with pending tool blocks shown as error
- Very long responses (>50k tokens) handled with progressive rendering
- Concurrent multi-model responses with different completion times
- Model switching mid-conversation preserves context
- Empty or malformed AI responses handled gracefully
- MCP server crash during tool execution with proper error propagation
- Rate limiting from AI provider with retry/backoff

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-platform | IPC bridge | Uses file:* IPC channels for attachment uploads; uses app:* for proxy config; uses mcp:* for MCP server management |
| F001-platform | Redux store | Messages and messageBlocks slices integrate into F001's Redux store with persistence |
| F001-platform | Database | Dexie schema includes messages and messageBlocks tables |
| F002-ai-foundation | Entity reference | References Provider, Model entities for AI SDK provider instantiation |
| F002-ai-foundation | Entity reference | References Assistant, Topic entities for conversation context and settings |
| F002-ai-foundation | Factory | Uses createProviderInstance() from F002 for AI SDK provider creation |

### Related Entities (data-model.md draft)

#### Owned Entities

**Message** — Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique message identifier |
| role | string | required | 'user' or 'assistant' |
| assistantId | string | FK -> Assistant | Owning assistant |
| topicId | string | FK -> Topic | Owning topic |
| blockIds | string[] | required | Ordered list of block IDs |
| modelId | string | optional | Model used for generation |
| status | AssistantMessageStatus | optional | Processing status for assistant messages |
| mentions | object[] | optional | @mentioned models for multi-model |
| usage | object | optional | Token usage stats |
| metrics | object | optional | Performance metrics (time to first token, total time) |
| createdAt | number | required | Creation timestamp |

**MessageBlock** — Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique block identifier |
| messageId | string | FK -> Message | Parent message |
| type | MessageBlockType | required | Block type enum (11 types) |
| content | string | optional | Text content |
| status | MessageBlockStatus | required | Block processing status |
| metadata | object | optional | Type-specific metadata |
| createdAt | number | required | Creation timestamp |

**MCPServer** — Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Server identifier |
| name | string | required | Display name |
| type | string | required | Transport type (inmemory, streamablehttp, sse, stdio) |
| command | string | optional | Stdio command |
| args | string[] | optional | Command arguments |
| baseUrl | string | optional | HTTP endpoint |
| isActive | boolean | required | Whether server is running |

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| Provider | F002-ai-foundation | Read access | Provider resolution for AI SDK instantiation |
| Model | F002-ai-foundation | Read access | Model selection for chat completion |
| Assistant | F002-ai-foundation | Read access | System prompt and settings for conversations |
| Topic | F002-ai-foundation | Read access | Topic organization for message threading |
| FileMetadata | F001-platform | Write access | Attachment uploads in messages |
| KnowledgeBase | F004-knowledge | Read access | RAG search for knowledge-enriched responses |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| Service | `fetchChatCompletion()` | Main chat completion entry point |
| Service | `MessagesService.createMessage()` | Create new message |
| Service | `MessagesService.getMessages()` | Get messages for topic |
| Service | `MemoryService.search()` | Search conversation memory |
| Service | `MemoryService.add()` | Add to conversation memory |
| IPC | `mcp:*` (15 channels) | MCP server management |
| IPC | `memory:*` (12 channels) | Memory access |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| Factory | `createProviderInstance()` | F002-ai-foundation | AI SDK provider creation for chat |
| Redux | `llmSlice` | F002-ai-foundation | Provider and model data |
| Redux | `assistantsSlice` | F002-ai-foundation | Assistant and topic data |
| IPC | `file:*` | F001-platform | Attachment file operations |
| IPC | `app:*` | F001-platform | Proxy config for API calls |
| IPC | `knowledge-base:*` | F004-knowledge | RAG search in knowledge bases |

### Technical Decisions

#### [Same Stack]
- **Recommended reuse patterns**: Plugin-based pipeline with PluginBuilder; AiSdkToChunkAdapter for stream processing; BlockManager for state management; AbortController pattern for cancellation
- **Existing libraries**: `ai` — Vercel AI SDK core; `@ai-sdk/*` — Provider-specific adapters; `@modelcontextprotocol/sdk` — MCP client SDK
- **Existing architecture decisions**: Message->Block decomposition separates content types for independent rendering; Plugin lifecycle hooks allow composable middleware; Chunk adapter normalizes different AI SDK stream formats into unified Cherry Studio chunk types; MCP tool calls execute in main process via IPC for security

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Provider entity compatibility | F002-ai-foundation | Verify chat pipeline correctly uses createProviderInstance with Provider/Model entities |
| Assistant settings integration | F002-ai-foundation | Verify AssistantSettings (temperature, topP, maxTokens, etc.) are correctly applied to chat requests |
| Knowledge RAG integration | F004-knowledge | Verify knowledge search results correctly format as RAG context in chat messages |
| MCP server compatibility | F007-extensions | Verify MCP servers from F007 agent system share tool access with chat when mcpMode is 'auto' |
| File attachment integration | F001-platform | Verify file:* IPC channels used correctly for message attachments |
| Redux store integration | F001-platform | Verify messages and messageBlocks slices integrate correctly with F001's store |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F007-extensions | API change impact | If chat completion API signature changes, F007's API server chat endpoints need modification |
| F007-extensions | MCP change impact | If MCP server management changes, F007's agent MCP tool access needs modification |
| F006-creative | Pipeline change impact | If fetchChatCompletion changes, F006's translation service (which reuses chat pipeline) needs modification |
| F004-knowledge | Integration change impact | If RAG context injection format changes, F004's knowledge search result formatting needs modification |
