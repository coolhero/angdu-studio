# Feature Specification: AI Chat

**Feature Branch**: `005-ai-chat`
**Created**: 2026-03-04
**Status**: Draft
**Input**: User description: "AI Chat - Primary chat interface for AI conversations with message streaming, block-based rendering, multi-model dispatch, assistant and topic management, knowledge base and MCP tool integration"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Send Message and Receive Streaming Response (Priority: P1)

User types a message in the chat input and sends it. The system composes the request with the configured context window (previous messages), sends it to the AI provider via the core engine, and streams the response token-by-token. The response accumulates into message blocks (primarily MainText) displayed in real-time. On completion, the message and its blocks are persisted to the database.

**Why this priority**: This is the fundamental capability — without sending and receiving messages, no other chat feature has value.

**Independent Test**: Can be tested by creating a default assistant, typing "Hello", pressing send, and verifying a streamed AI response appears in real-time and persists after page refresh.

**Acceptance Scenarios**:

1. **Given** a chat with an active assistant and topic, **When** user types a message and presses send, **Then** the message appears in the chat, an AI response streams in real-time with block-based rendering, and both messages persist to the database.
2. **Given** a chat with context window set to 5, **When** user sends message #7, **Then** only the 5 most recent previous messages are included in the AI request context.
3. **Given** a message is being streamed, **When** the streaming completes, **Then** the assistant message status transitions from PROCESSING to SUCCESS and the response is fully persisted.
4. **Given** a streaming response in progress, **When** a network error occurs, **Then** the partial response is preserved with an ERROR status indicator and the user can retry.

---

### User Story 2 - Assistant Management (Priority: P1)

User creates, edits, and deletes assistants with custom system prompts, model selections, and per-assistant settings. Each assistant has its own conversation topics and configuration. Four assistant types are supported: default, system, agent, and chat.

**Why this priority**: Assistants are the organizational unit for all conversations — users need to create and configure them before meaningful chat interactions.

**Independent Test**: Can be tested by creating an assistant with a custom system prompt and model, verifying the settings persist, then editing the name and deleting the assistant.

**Acceptance Scenarios**:

1. **Given** the assistant list, **When** user creates a new assistant with name, system prompt, and model, **Then** the assistant appears in the sidebar with the configured settings.
2. **Given** an existing assistant, **When** user edits the system prompt and model, **Then** changes persist and subsequent messages use the updated configuration.
3. **Given** an assistant with topics, **When** user deletes the assistant, **Then** the assistant and all its topics and messages are removed.
4. **Given** an assistant, **When** user configures AssistantSettings (contextCount, temperature, topP, maxTokens, streamOutput, reasoning), **Then** all settings are applied to subsequent AI requests.

---

### User Story 3 - Topic Management (Priority: P1)

User creates, switches between, renames, pins, and deletes conversation topics within an assistant. Each topic is an independent conversation thread. Topics support auto-naming based on the first few messages (via AI summary) and manual name editing.

**Why this priority**: Topics organize conversations within assistants — essential for practical daily use of the chat interface.

**Independent Test**: Can be tested by creating a topic, sending messages, renaming it, pinning it, creating a second topic, switching between them, and verifying all state persists.

**Acceptance Scenarios**:

1. **Given** an assistant, **When** user creates a new topic, **Then** the topic appears in the topic list with a default name and the chat area switches to the new empty topic.
2. **Given** a topic with 2+ messages, **When** auto-naming is enabled and the topic has a default name, **Then** the system generates a descriptive name from the conversation content.
3. **Given** a topic, **When** user manually renames it, **Then** the new name persists and auto-naming is disabled for that topic (isNameManuallyEdited flag set).
4. **Given** multiple topics, **When** user pins a topic, **Then** it appears at the top of the topic list.
5. **Given** a topic with messages, **When** user deletes it, **Then** the topic and all its messages and blocks are removed from the database.

---

### User Story 4 - Block-Based Message Rendering (Priority: P1)

Messages are composed of blocks — independent content units each rendered with appropriate formatting. The system supports 12 block types: MainText, Thinking, Translation, Image, Code, Tool, File, Error, Citation, Video, Compact, and Unknown. Each block type has its own renderer, status tracking, and metadata.

**Why this priority**: Block-based rendering is essential for displaying AI responses that include reasoning, code, images, tool results, citations, and other structured content.

**Independent Test**: Can be tested by triggering responses that produce different block types (e.g., code generation produces Code blocks, reasoning models produce Thinking blocks) and verifying each renders correctly.

**Acceptance Scenarios**:

1. **Given** an AI response with markdown text, **When** rendering completes, **Then** the MainText block renders with proper markdown formatting (headings, lists, bold, links, tables).
2. **Given** an AI response with code, **When** rendering completes, **Then** Code blocks render with syntax highlighting and language detection.
3. **Given** a reasoning model response, **When** rendering completes, **Then** Thinking blocks render with collapsible reasoning content and duration indicator (thinking_millsec).
4. **Given** an AI response with tool calls, **When** the tool returns results, **Then** Tool blocks render the tool name, arguments, and structured results.
5. **Given** a Citation block with web search results, **When** rendering completes, **Then** citations display as numbered references with source URLs, deduplicated and renumbered sequentially.

---

### User Story 5 - Stream Cancellation and Message Control (Priority: P2)

User can cancel an in-progress streaming response, pause/resume generation, edit a previously sent message (triggering regeneration), and retry failed messages. Partial responses are preserved when cancellation occurs.

**Why this priority**: Users need control over AI generation — cancellation saves time and tokens when the response goes in an unwanted direction.

**Independent Test**: Can be tested by sending a message, clicking cancel mid-stream, verifying partial content is preserved, then editing the original message and verifying a new response is generated.

**Acceptance Scenarios**:

1. **Given** an in-progress streaming response, **When** user clicks cancel, **Then** streaming stops within 500ms and the partial response is preserved with a PAUSED status.
2. **Given** a sent user message, **When** user edits the message content, **Then** the system re-sends the edited message and regenerates the AI response.
3. **Given** a message with ERROR status, **When** user clicks retry, **Then** the system re-sends the message and attempts a new response.
4. **Given** a paused response, **When** user resumes, **Then** streaming continues from where it left off or restarts the request.

---

### User Story 6 - Multi-Model Dispatch (Priority: P2)

User sends a message to multiple AI models simultaneously. Each model produces its own response, displayed side-by-side (or in other layout modes: vertical, fold, grid). If one model fails, others continue independently. User can select per-message model or use @mentions to target specific models.

**Why this priority**: Multi-model comparison is a power-user feature that differentiates Cherry Studio from simpler chat interfaces.

**Independent Test**: Can be tested by configuring an assistant with multiple models, sending a message, and verifying independent responses appear from each model.

**Acceptance Scenarios**:

1. **Given** an assistant with multiple models configured, **When** user sends a message, **Then** each model receives the request independently and streams responses in parallel.
2. **Given** multi-model responses, **When** one model returns an error, **Then** other models continue unaffected and the failed model shows an error indicator.
3. **Given** multi-model responses, **When** rendering completes, **Then** responses display in the configured style (horizontal, vertical, fold, or grid) with model identification.
4. **Given** a message input, **When** user @mentions a specific model, **Then** only that model receives the request for this message.

---

### User Story 7 - Knowledge Base Integration (Priority: P2)

User attaches one or more knowledge bases to an assistant. When sending messages, the system automatically performs vector search on the attached KBs and injects relevant context (RAG) into the AI request. Citation blocks reference the knowledge source.

**Why this priority**: RAG enables AI responses grounded in user-specific data, significantly improving answer quality for domain-specific questions.

**Independent Test**: Can be tested by attaching a KB with known content to an assistant, asking a question about that content, and verifying the response includes relevant information with KB citations.

**Acceptance Scenarios**:

1. **Given** an assistant with an attached knowledge base, **When** user sends a message, **Then** the system searches the KB for relevant chunks and injects them into the AI context.
2. **Given** KB search returns results, **When** the AI response includes information from those results, **Then** Citation blocks reference the knowledge base source.
3. **Given** KB search returns empty results, **When** user sends a message, **Then** the chat proceeds normally without RAG injection.
4. **Given** an assistant, **When** user attaches/detaches a knowledge base, **Then** the knowledgeBaseIds are updated and persisted.

---

### User Story 8 - MCP Tool Integration (Priority: P2)

User attaches MCP servers to an assistant, enabling the AI to call external tools during conversations. Tool calls appear as Tool blocks in the AI response with structured input/output. MCP mode can be disabled, auto, or manual per assistant.

**Why this priority**: MCP tool integration enables AI agents to interact with external systems, a key differentiator for power users.

**Independent Test**: Can be tested by attaching an MCP server, sending a message that triggers a tool call, and verifying the Tool block renders the call arguments and results.

**Acceptance Scenarios**:

1. **Given** an assistant with MCP servers attached (mode: auto), **When** the AI decides to call a tool, **Then** a Tool block appears showing the tool name, arguments, and response.
2. **Given** MCP mode set to manual, **When** the AI requests a tool call, **Then** the user is prompted to approve before execution.
3. **Given** an MCP tool call that fails, **When** rendering completes, **Then** an Error block displays the failure with context.
4. **Given** an assistant, **When** user changes MCP mode (disabled/auto/manual), **Then** the setting persists and affects subsequent tool calls.

---

### User Story 9 - Rate Limiting and Message Queueing (Priority: P3)

System enforces rate limits per provider to prevent API throttling. When a rate limit is active, the user sees a countdown timer before the next message can be sent. Rapid successive messages are queued or rejected based on the current streaming state.

**Why this priority**: Rate limiting protects users from exceeding provider quotas and ensures stable API access.

**Independent Test**: Can be tested by configuring a provider with a rate limit, sending messages in quick succession, and verifying the rate limit countdown appears.

**Acceptance Scenarios**:

1. **Given** a provider with rateLimit configured, **When** user sends a message immediately after a previous response, **Then** the system checks elapsed time and displays a wait countdown if rate limited.
2. **Given** a streaming response in progress, **When** user attempts to send another message, **Then** the send action is blocked or queued until the current response completes.

---

### User Story 10 - Quick Phrases (Priority: P3)

User manages a collection of quick phrases — pre-configured text snippets that can be inserted into the message input. Phrases have titles, content, optional associated prompts, and can be enabled/disabled.

**Why this priority**: Quick phrases improve efficiency for repetitive interactions but are not essential for core chat functionality.

**Independent Test**: Can be tested by creating a quick phrase, inserting it into the message input, and verifying the content appears.

**Acceptance Scenarios**:

1. **Given** the quick phrases panel, **When** user creates a phrase with title and content, **Then** it appears in the phrase list.
2. **Given** a quick phrase, **When** user clicks to insert it, **Then** the phrase content is inserted into the message input.
3. **Given** quick phrases, **When** user disables a phrase, **Then** it no longer appears in the active phrases list.

---

### User Story 11 - Web Search Integration (Priority: P3)

When web search is enabled for an assistant, the system integrates web search results into the AI context. Search results from multiple providers are normalized into Citation blocks with source URLs.

**Why this priority**: Web search extends AI responses with real-time information but is a supplementary capability.

**Independent Test**: Can be tested by enabling web search on an assistant, sending a question about current events, and verifying Citation blocks with web sources appear.

**Acceptance Scenarios**:

1. **Given** an assistant with web search enabled, **When** user sends a factual question, **Then** the AI response includes web search results rendered as Citation blocks.
2. **Given** web search results from multiple providers, **When** citations are rendered, **Then** they are deduplicated by URL and renumbered sequentially.
3. **Given** web search is disabled, **When** user sends a message, **Then** no web search is performed.

---

### Edge Cases

- Streaming response interrupted by network failure: partial response preserved with ERROR status and retry option
- Context window with messages exceeding combined token limit: truncation from oldest messages while preserving system prompt
- Multi-model dispatch with one model failing: independent error handling per model, other models unaffected
- Assistant with deleted/unavailable model: graceful fallback via fallback chain to next available model
- Empty topic with no messages: displays appropriate empty state with suggestions
- Rapid message sending before previous response completes: new send blocked while streaming in progress
- Very long code blocks in response: scroll container with syntax highlighting, performance-safe rendering
- Tool call with very large structured results: scrollable Tool block with collapsible content
- Knowledge base search returns empty: chat proceeds without RAG injection, no error shown
- Rate limit countdown displayed to user before next message can be sent
- Message status recovery: sending→error can be retried, paused→resumed
- Thinking block with very long reasoning content: collapsible with duration indicator
- Citation deduplication across web search, KB refs, and memory refs
- Topic auto-naming lock prevents concurrent rename operations
- isNameManuallyEdited prevents auto-naming from overwriting user's chosen name
- Block status transitions: THINKING blocks prepended (reasoning before content), others appended
- Message-block status sync: block ERROR → message ERROR, block PROCESSING → message PROCESSING

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support Assistant CRUD operations with 4 types: default, system, agent, chat. Each assistant has a name, system prompt, model selection, topics, and per-assistant settings.
- **FR-002**: System MUST support AssistantSettings with the following configurable fields: contextCount (default 5, max 100), temperature (0-2), topP (0-1), maxTokens, streamOutput (boolean), reasoning_effort (none/low/medium/high/xhigh/auto/default), reasoning_effort_cache (preserves value on model switch), qwenThinkMode (boolean), toolUseMode (function/prompt), enableMaxTokens (boolean), enableTemperature (boolean), enableTopP (boolean), customParameters (key-value pairs), and defaultModel.
- **FR-003**: System MUST support Topic management within assistants: create (with default name and timestamps), pin/unpin (pinned topics appear first), rename (manual), auto-name (AI-based summary from conversation when enabled, respects isNameManuallyEdited flag, requires 2+ messages, lock to prevent concurrent renames), delete (cascades to messages and blocks), and type (chat/session).
- **FR-004**: System MUST create user messages with block-based content. User messages produce MainText blocks (from text input), File blocks (from file attachments), and Image blocks (from image uploads/pastes). Messages include role, assistantId, topicId, timestamps, and status.
- **FR-005**: System MUST stream AI responses token-by-token via the core engine (F003 RuntimeExecutor/executeStream). During streaming, the assistant message has PROCESSING status. Blocks accumulate in real-time: THINKING blocks prepended, other blocks appended. On completion, status transitions to SUCCESS. On failure, status transitions to ERROR with partial content preserved.
- **FR-006**: System MUST manage the context window by including the configured number of previous messages (contextCount, default 5, special UNLIMITED value supported) in each AI request. Messages are filtered and ordered chronologically.
- **FR-007**: System MUST support multi-model dispatch: user can send a message to multiple models simultaneously via @mentions or assistant configuration. Each model streams an independent response. Display styles: horizontal, vertical, fold, grid. If one model fails, others continue independently.
- **FR-008**: System MUST enforce rate limiting per provider. Before sending, the system checks provider.rateLimit, calculates elapsed time since last message, and blocks/delays if the rate limit has not expired. Rate limit countdown is visible to the user.
- **FR-009**: System MUST support 12 message block types with appropriate rendering: MainText (markdown with citations), Thinking (collapsible reasoning with duration), Translation (source/target language), Image (URL or file), Code (syntax highlighting with language), Tool (name, arguments, raw MCP response), File (file metadata), Error (error message), Citation (web search/KB/memory refs, deduplicated, renumbered), Video (URL or file path), Compact (compacted content), Unknown (fallback).
- **FR-010**: System MUST track message status lifecycle. User messages: always SUCCESS. Assistant messages: PENDING → PROCESSING → SUCCESS or ERROR, with PAUSED and SEARCHING as intermediate states. Status transitions must be atomic and consistent with block statuses.
- **FR-011**: System MUST support Quick Phrases CRUD: create (title, content, prompt, enabled, sortOrder), read, update, delete, toggle enabled/disabled, insert into message input.
- **FR-012**: System MUST integrate with Knowledge Bases (F004): assistant.knowledgeBaseIds references KBs, system performs vector search on send, injects top results into AI context as RAG, Citation blocks reference KB sources.
- **FR-013**: System MUST integrate with MCP Tools (F006): assistant.mcpServers references MCP servers, mcpMode (disabled/auto/manual) controls tool calling behavior, Tool blocks display call arguments and results, manual mode prompts user before execution.
- **FR-014**: System MUST integrate Web Search: assistant.enableWebSearch flag, web search results from multiple providers normalized into Citation blocks with source URLs, deduplicated by URL, renumbered sequentially.
- **FR-015**: System MUST support message control actions: cancel (stop streaming, preserve partial), edit (re-send edited message, regenerate response), retry (re-send failed message), and delete (remove message and blocks from DB).

### Key Entities

- **Assistant**: Core organizational unit with id, name, prompt, model, settings, topics, type (default/system/agent/chat), knowledgeBaseIds, mcpServers, mcpMode, enableWebSearch, tags, regularPhrases, emoji, description.
- **AssistantSettings**: Per-assistant configuration embedded in Assistant. 14+ fields controlling context, temperature, sampling, streaming, reasoning, tool use, and custom parameters.
- **Topic**: Conversation thread within an assistant. Has id, assistantId, name, type (chat/session), pinned, isNameManuallyEdited, createdAt, updatedAt.
- **Message**: Individual message in a topic. Has id, topicId, assistantId, role (user/assistant/system), blocks (array of block IDs), modelId, status, timestamps, usage, metrics, mentions, multiModelMessageStyle.
- **MessageBlock**: Content unit within a message. 12 variant types each with type-specific fields (content, language, toolId, url, citations, etc.). Has its own status lifecycle (PENDING → PROCESSING → STREAMING → SUCCESS/ERROR/PAUSED).
- **QuickPhrase**: Reusable text snippet with id, title, content, prompt, enabled, sortOrder.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Message sending and streaming response works for all configured provider types with first token appearing within 2 seconds of send.
- **SC-002**: Stream cancellation stops response generation within 500ms and preserves all accumulated partial content.
- **SC-003**: Multi-model dispatch correctly displays independent responses from up to 4 models simultaneously, with per-model error isolation.
- **SC-004**: Topic CRUD operations (create, rename, pin, delete) persist correctly across app restarts with no data loss.
- **SC-005**: Context window correctly includes exactly the configured number of previous messages (default 5) in each AI request, verified via request inspection.
- **SC-006**: All 12 block types render correctly: MainText with markdown, Code with syntax highlighting, Thinking with collapsible content, Tool with structured results, Citation with numbered references, and all others with appropriate formatting.
- **SC-007**: Message status lifecycle transitions are consistent — no stuck PROCESSING states after completion/error, no status desync between message and its blocks.
