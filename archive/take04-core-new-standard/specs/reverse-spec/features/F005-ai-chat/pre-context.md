# Pre-Context: AI Chat

**Feature ID**: F005-ai-chat
**Tier**: Tier 1
**Generated**: 2026-03-04

---

## Source Reference

**Source Root**: `/Users/coolhero/Study/oss/cherry-studio`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/renderer/src/pages/home/` | Chat UI pages |
| `src/renderer/src/components/Messages/` | Message rendering components |
| `src/renderer/src/hooks/useAssistant.ts` | Assistant management |
| `src/renderer/src/hooks/useTopic.ts` | Topic management |
| `src/renderer/src/services/MessagesService.ts` | Message service (context window, blocks) |
| `src/renderer/src/store/assistants.ts` | Assistant store |
| `src/renderer/src/store/messages.ts` | Message store (Dexie) |
| `packages/shared/types/message.ts` | Message, MessageBlock types |
| `packages/shared/types/assistant.ts` | Assistant, AssistantSettings types |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding **message sending/streaming pipeline, context window management (default 5, max 100), multi-model dispatch logic (per-message model selection, fallback chain), block-based message rendering architecture (12 block types), topic management lifecycle (create, pin, rename, manual name editing, group type), assistant CRUD operations (default, system, agent, chat types), AssistantSettings inheritance (contextCount, temperature, topP, maxTokens, streamOutput, reasoning), rate limiting enforcement, message status lifecycle (sending->sent, error, paused, pending), quick phrases management, knowledge base integration, MCP tool integration, and web search integration**
- Do not reference: Redux slice patterns in `assistants.ts` and `messages.ts` (migrating to Zustand), Ant Design components in chat UI pages (migrating to shadcn/ui + Radix), styled-components in chat pages (migrating to Tailwind-only), React Router navigation in chat pages (migrating to TanStack Router)
- **Extract**: Message sending pipeline (compose -> validate -> stream -> accumulate -> persist), context window calculation logic (default 5, max 100), multi-model dispatch (per-message model selection with fallback chain), block-based message structure (12 block types: MainText, Thinking, Translation, Image, Tool, Code, Error, File, Citation, Search, KnowledgeBase, Doc), topic management (create, pin, rename, manual name editing, group type), assistant CRUD (default, system, agent, chat types), AssistantSettings fields (contextCount, temperature, topP, maxTokens, streamOutput, reasoning, plus 8 more), message status lifecycle (sending->sent, error, paused, pending), streaming cancellation and retry logic, rate limiting implementation (check provider.rateLimit, calculate wait time), quick phrases CRUD, knowledge base attachment to assistant, MCP server attachment to assistant, web search integration
- **Ignore**: Redux `createAsyncThunk` / `createSlice` patterns, `useSelector` / `useDispatch` calls, Ant Design `Button` / `Input` / `Popover` / `Tooltip` / `Drawer` components, styled-components wrappers, React Router `useNavigate` / `useParams`

### Static Resources

> Non-code files used by this Feature that must be **copied from the original source** during implementation.
> These files cannot be regenerated -- they must be copied as-is and placed in the appropriate location in the new project.
> Source Path is **relative to Source Root** (same as file paths above). Resolve as `[Source Root]/[Source Path]` at runtime.

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| `src/renderer/src/assets/images/avatar.png` | Image | `src/renderer/src/assets/images/avatar.png` | Default user avatar in chat messages |
| `src/renderer/src/assets/images/logo.png` | Image | `src/renderer/src/assets/images/logo.png` | App logo displayed in chat header/empty state |

> If resources need modification (e.g., resizing images, updating translation keys), note it in the Usage column.

### Environment Variables

> Environment variables required by this Feature at runtime. Variables marked as `secret` must NOT have their actual values recorded here -- only the variable name and purpose.

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| (none specific to F005) | | | | |

**Shared variables** (defined by other Features but also used here):

| Variable | Owner Feature | Usage in This Feature |
|----------|--------------|----------------------|
| `CSLOGGER_RENDERER_LEVEL` | F001-core-platform | Log level for chat message processing and streaming logging |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F005-ai-chat is the primary user-facing feature -- the chat interface for AI conversations. It manages the full message lifecycle: composing messages, sending them through the AI core engine, streaming response tokens, accumulating them into message blocks (12 block types), and persisting completed messages. It supports multi-model dispatch (per-message model selection with fallback chain), context window management (default 5, max 100 messages), topic management within assistants (create, pin, rename, manual name editing, group type), assistant CRUD with 4 types (default, system, agent, chat) and AssistantSettings (14 fields including contextCount, temperature, topP, maxTokens, streamOutput, reasoning), rate limiting enforcement (check provider.rateLimit, calculate wait time), message status lifecycle (sending->sent, error, paused, pending), quick phrases management, knowledge base integration (attach KB to assistant), MCP tool integration (attach MCP servers to assistant), and web search integration.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Send message | User types a message and sends it; system streams AI response tokens in real-time with block-based rendering (12 block types) |
| P1 | Context management | System manages context window, including the configured number of previous messages (default 5, max 100) in the AI request |
| P1 | Topic management | User creates, switches between, renames, pins, or deletes topics within an assistant; supports manual name editing and group type |
| P1 | Assistant selection | User selects an assistant from the sidebar; chat UI loads the assistant's topics and settings |
| P2 | Multi-model dispatch | User sends a message to multiple models simultaneously (per-message model selection with fallback chain); responses appear side-by-side |
| P2 | Stream cancellation | User cancels an in-progress streaming response; streaming stops and partial response is preserved |
| P2 | Message editing | User edits a previously sent message; system re-sends and regenerates the AI response |
| P2 | Assistant CRUD | User creates, edits, or deletes assistants with custom system prompts and model selections (4 types: default, system, agent, chat) |
| P2 | Knowledge base integration | User attaches a knowledge base to an assistant; RAG results are injected into chat context |
| P2 | MCP tool integration | User attaches MCP servers to an assistant; tool calls appear as blocks in AI responses |
| P3 | Rate limiting | System enforces rate limits per provider (check provider.rateLimit, calculate wait time) |
| P3 | Quick phrases | User inserts pre-configured quick phrases into the message input |
| P3 | Message blocks | Messages render as 12 block types: MainText, Thinking, Translation, Image, Tool, Code, Error, File, Citation, Search, KnowledgeBase, Doc |
| P3 | Web search | System integrates web search results into chat context |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Assistant CRUD (default, system, agent, chat types)
- **FR-002**: AssistantSettings (contextCount, temperature, topP, maxTokens, streamOutput, reasoning, plus 8 additional fields -- 14 total)
- **FR-003**: Topic management (create, pin, rename, manual name editing, group type)
- **FR-004**: Message creation with block-based content (12 block types)
- **FR-005**: Message streaming with real-time block updates
- **FR-006**: Context window management (default 5, max 100 messages)
- **FR-007**: Multi-model dispatch (per-message model selection, fallback chain)
- **FR-008**: Rate limiting enforcement (check provider.rateLimit, calculate wait time)
- **FR-009**: Block rendering (MainText, Thinking, Translation, Image, Tool, Code, Error, File, Citation, Search, KnowledgeBase, Doc)
- **FR-010**: Message status lifecycle (sending->sent, error, paused, pending)
- **FR-011**: Quick phrases management
- **FR-012**: Knowledge base integration (attach KB to assistant)
- **FR-013**: MCP tool integration (attach MCP servers to assistant)
- **FR-014**: Web search integration

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: Message sending and streaming response works for all 12+ provider types
- **SC-002**: First streaming token appears within 2 seconds of message send
- **SC-003**: Stream cancellation stops response within 500ms and preserves partial content
- **SC-004**: Multi-model dispatch correctly displays responses from up to 4 models simultaneously
- **SC-005**: Topic CRUD operations persist across app restarts
- **SC-006**: Context window correctly includes the configured number of previous messages (default 5)
- **SC-007**: All 12 block types render correctly with appropriate formatting (markdown, syntax highlighting, images, tool results)

### Edge Cases

- Streaming response interrupted by network failure; partial response preserved with error indicator
- Context window with very large messages exceeding token limits; truncation strategy needed
- Multi-model dispatch with one model failing and others succeeding; independent error handling per model
- Assistant with deleted model gracefully falls back via fallback chain
- Empty topic with no messages displays appropriate empty state
- Rapid message sending before previous response completes; queue or reject strategy
- Message with very long code blocks; scroll and syntax highlighting performance
- Tool call blocks from MCP tools displaying structured results
- Knowledge base search returns empty results; chat proceeds without RAG injection
- Rate limit wait time displayed to user before next message can be sent
- Message status transitions: sending->error recovery, paused->resume

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-core-platform | Infrastructure | Uses IPC framework, file:* channels for attachments, Zustand store infrastructure, Dexie database, TanStack Router for page navigation |
| F002-provider-management | Entity | Needs Provider and Model entities for model selection, capability checking, and API access |
| F003-ai-core-engine | API | Calls RuntimeExecutor and executeStream() for AI chat execution |

### Related Entities (data-model.md draft)

#### Owned Entities

**Assistant** (25+ fields) -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique assistant identifier |
| name | string | required | Display name |
| prompt | string | optional | System prompt text |
| model | Model | optional | Default model for this assistant |
| settings | AssistantSettings | required | Per-assistant settings (14 fields) |
| topics | Topic[] | required | Conversation topics within this assistant |
| type | string | required | Assistant type (default, system, agent, chat) |
| knowledgeBaseIds | string[] | optional | Associated knowledge base IDs for RAG |
| mcpServerIds | string[] | optional | Associated MCP server IDs for tool calling |

**AssistantSettings** (14 fields) -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| contextCount | number | optional | Number of context messages to include (default 5, max 100) |
| temperature | number | 0-2 | Sampling temperature |
| topP | number | 0-1 | Top-p sampling |
| maxTokens | number | optional | Maximum output tokens |
| streamOutput | boolean | required | Whether to stream responses |
| reasoning | boolean | optional | Whether to enable reasoning/thinking mode |
| hideMessages | boolean | optional | Whether to hide thinking messages |

**Topic** (10 fields) -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique topic identifier |
| assistantId | string | FK -> Assistant | Owning assistant ID |
| name | string | required | Topic display name |
| pinned | boolean | required | Whether topic is pinned to top |
| type | string | optional | Topic type (default, group) |
| isNameManuallyEdited | boolean | optional | Whether name was manually edited by user |
| createdAt | number | required | Creation timestamp |
| updatedAt | number | required | Last update timestamp |

**Message** (22+ fields) -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique message identifier |
| topicId | string | FK -> Topic | Owning topic ID |
| assistantId | string | FK -> Assistant | Owning assistant ID |
| role | string | required | Message role (user, assistant, system) |
| blocks | MessageBlock[] | required | Content blocks within this message (12 block types) |
| modelId | string | optional | Model used for this response |
| createdAt | number | required | Creation timestamp |
| status | string | required | Message status (sending, sent, error, paused, pending) |

**MessageBlock** (12 variant types) -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique block identifier |
| messageId | string | FK -> Message | Owning message ID |
| type | string | required | Block type (MainText, Thinking, Translation, Image, Tool, Code, Error, File, Citation, Search, KnowledgeBase, Doc) |
| content | string | required | Block content |
| language | string | optional | Code language (for Code blocks) |
| toolCallId | string | optional | Tool call ID (for Tool blocks) |
| status | string | optional | Block processing status |

**QuickPhrase** (6 fields) -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique phrase identifier |
| title | string | required | Short label |
| content | string | required | Full phrase text |
| prompt | string | optional | Associated prompt text |
| enabled | boolean | required | Whether phrase is active |
| sortOrder | number | optional | Display sort order |

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| Provider | F002-provider-management | Read (provider config) | Provider configuration for model access during chat |
| Model | F002-provider-management | Read (model config) | Model selection and capability checking for chat features |
| KnowledgeBase | F004-knowledge-base | FK (knowledgeBaseIds) | Assistant-associated knowledge bases for RAG injection |
| FileMetadata | F001-core-platform | FK (file ID) | File attachments in chat messages |
| MCPTool | F006-mcp-integration | Read (tool config) | Available MCP tools for function calling in chat |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| Zustand | `useAssistantStore` | Assistant and topic CRUD state management |
| Zustand | `useRuntimeStore` | Runtime state (active assistant, active topic, streaming status) |
| Zustand | `useMessageStore` | Message CRUD and persistence state (Dexie-backed) |
| Service | `MessagesService.sendMessage()` | Send a message and stream AI response |
| Service | `MessagesService.getMessages()` | Get messages for a topic |
| Hook | `useAssistant()` | React hook for assistant management |
| Hook | `useTopic()` | React hook for topic management |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| Class | `RuntimeExecutor` | F003-ai-core-engine | Create AI execution context for chat |
| Function | `executeStream()` | F003-ai-core-engine | Execute streaming chat request |
| Zustand | `useProviderStore` | F002-provider-management | Read provider/model configs for chat |
| IPC | `file:*` | F001-core-platform | File attachment upload/download |
| IPC | `knowledge-base:*` | F004-knowledge-base | Knowledge search for RAG injection |
| IPC | `mcp:*` | F006-mcp-integration | MCP tool listing and calling |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Chat is the most complex UI feature. Message pipeline: compose -> validate -> apply context window (default 5, max 100) -> inject knowledge -> resolve provider -> execute via aiCore RuntimeExecutor -> stream tokens -> accumulate blocks (12 types) -> persist. Supports multi-model dispatch (per-message model selection with fallback chain), rate limiting (check provider.rateLimit, calculate wait time), message status lifecycle (sending->sent, error, paused, pending), quick phrases, KB attachment, MCP tool attachment, and web search integration. State managed across multiple Redux slices with thunks. UI uses Ant Design components heavily with styled-components.
- **Recommended implementation approach**: Replace Redux slices with Zustand stores (useAssistantStore, useRuntimeStore, useMessageStore). Replace Redux thunks with Zustand actions with async operations. Rebuild entire chat UI with shadcn/ui + Tailwind CSS. Use TanStack Router for chat page navigation. Keep all business logic (message pipeline, streaming, context window, block rendering, multi-model dispatch, rate limiting) intact.
- **Caveats**: This is the heaviest migration feature. The chat UI has the most Ant Design + styled-components usage. Block-based message rendering (12 types) needs custom components (no direct Ant Design equivalent for MainText, Thinking, Translation, Tool, Code, Citation, Search, KnowledgeBase, Doc blocks). Consider using shadcn/ui Card for message containers, custom CodeBlock with syntax highlighting, and custom ToolCallBlock for MCP results. Message status lifecycle transitions need careful state management in Zustand.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| AI executor integration | F003-ai-core-engine | Verify F005 correctly calls RuntimeExecutor and executeStream() from F003 |
| Provider/model access | F002-provider-management | Verify F005 correctly reads Provider and Model entities from F002's store for chat initiation |
| Knowledge injection | F004-knowledge-base | Verify F005 correctly calls knowledge search and injects results into AI context |
| MCP tool calling | F006-mcp-integration | Verify F005 correctly lists MCP tools and handles Tool blocks from AI responses |
| File attachments | F001-core-platform | Verify F005 correctly uses file:* IPC channels for message attachments |
| Zustand store integration | F001-core-platform | Verify F005's Zustand stores integrate correctly with F001's store infrastructure |
| TanStack Router integration | F001-core-platform | Verify F005's chat page routes are registered in F001's router configuration |
| Assistant entity KB reference | F004-knowledge-base | Verify Assistant.knowledgeBaseIds correctly references KnowledgeBase entities |
| Assistant entity MCP reference | F006-mcp-integration | Verify Assistant.mcpServerIds correctly references MCP server entities |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F006-mcp-integration | Entity change impact | If MessageBlock schema changes (especially Tool block type), F006's tool result rendering needs verification |
| F004-knowledge-base | Reference change impact | If Assistant.knowledgeBaseIds reference pattern changes, F004's knowledge base association needs modification |
| F007-backup-sync | Entity change impact | If Message or Topic entity schema changes, F007's backup format needs modification |
| F008-settings-ui | Entity change impact | If Assistant or AssistantSettings entity changes, F008's assistant settings page needs modification |
