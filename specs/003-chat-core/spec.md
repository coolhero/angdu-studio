# Feature Specification: Chat Core

**Feature Branch**: `003-chat-core`
**Created**: 2026-03-09
**Status**: Draft
**Input**: Core conversation data model implementing assistants (AI personas), topics (conversations), messages (turns), and message blocks (content units). Provides CRUD operations, persistence, streaming state management, message filtering pipeline, and SDK conversion for the chat system.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Assistant Management (Priority: P1)

User creates a new AI assistant by providing a name, system prompt, and selecting a model. The assistant appears in the assistant list immediately. User can edit the assistant's settings (temperature, context window size, max tokens), update its system prompt, or delete it. Assistants can be reordered by drag-and-drop or positioned at a specific index. A default assistant is created automatically on first launch with sensible defaults.

**Why this priority**: Assistants are the primary interaction container. Without at least one assistant, no conversations can happen. This is the entry gate for all chat functionality.

**Independent Test**: Launch app fresh, verify default assistant exists. Create a new assistant with custom name and prompt, verify it appears in the list. Edit settings, verify persistence across restart.

**Acceptance Scenarios**:

1. **Given** a fresh installation, **When** the app starts for the first time, **Then** a default assistant is created with a system prompt and the user's default model [source: B036]
2. **Given** the assistant list, **When** the user creates a new assistant with name, prompt, and model, **Then** the assistant appears at the top of the list immediately [source: B037]
3. **Given** an existing assistant, **When** the user updates its temperature, context count, or max tokens, **Then** the changes are persisted and applied to subsequent conversations [source: B038]
4. **Given** an existing assistant, **When** the user deletes it, **Then** the assistant and all its topics are removed [source: B037]
5. **Given** multiple assistants, **When** the user reorders them, **Then** the new order persists across sessions [source: B037, B052]
6. **Given** an assistant without a model set, **When** the assistant is used, **Then** the system falls back to the user's default model from provider settings

---

### User Story 2 - Topic & Conversation Management (Priority: P1)

User creates a new topic (conversation) within an assistant. Each topic has a name (auto-generated from the first message or manually set), timestamps, and an ordered list of messages. Topics can be renamed, pinned to the top, or deleted along with all their messages. Topics maintain their order within the assistant.

**Why this priority**: Topics are the conversation containers. Without topics, messages have nowhere to live. Core to the chat loop.

**Independent Test**: Create a topic in an assistant, send a message, verify the topic name auto-generates. Rename the topic, pin it, verify ordering. Delete the topic, verify messages are removed.

**Acceptance Scenarios**:

1. **Given** an assistant, **When** the user starts a new conversation, **Then** a new topic is created with an auto-generated name based on the first message [source: B039]
2. **Given** an existing topic, **When** the user manually renames it, **Then** the name persists and auto-rename is disabled for that topic [source: B039]
3. **Given** an existing topic, **When** the user deletes it, **Then** the topic and all its messages and blocks are removed from the database [source: B039]
4. **Given** multiple topics, **When** the user pins a topic, **Then** it appears at the top of the topic list
5. **Given** a topic with a topic-specific prompt override, **When** messages are sent, **Then** the override prompt is used instead of the assistant's default prompt

---

### User Story 3 - Message Sending & Streaming (Priority: P1)

User types a message and sends it. The system creates a user message with associated blocks, applies the message filtering pipeline to build context, converts messages to AI SDK format, assembles stream parameters, and initiates a streaming AI response. As tokens arrive, message blocks are created and updated in real-time (text, thinking, tool calls, etc.). The user sees the response building incrementally. Token usage and timing metrics are recorded.

**Why this priority**: This is the core chat loop — send a message, get a streaming response. Everything else supports this interaction.

**Independent Test**: Send a message to a configured provider, observe streaming response appearing token-by-token, verify blocks are created with correct types and status transitions.

**Acceptance Scenarios**:

1. **Given** an active topic, **When** the user sends a text message, **Then** a user message with a main text block is created atomically and persisted [source: B041, B015]
2. **Given** a user message is sent, **When** the system prepares the request, **Then** the 9-stage message filtering pipeline processes conversation history (context clear, useful messages, error pairs, trailing assistant, adjacent user, context window, empty messages, user-role-start) [source: BL-012]
3. **Given** filtered messages, **When** building SDK parameters, **Then** messages are converted to AI SDK format with appropriate parts (text, image, file, reasoning) based on model capabilities [source: BL-013]
4. **Given** a valid request, **When** the AI response streams, **Then** a stream processing state machine dispatches chunks to create and update message blocks in real-time [source: BL-014, B042]
5. **Given** a streaming response, **When** tokens arrive, **Then** message blocks transition through status states: pending → processing → streaming → success [source: B044]
6. **Given** a completed response, **When** all chunks are processed, **Then** token usage (input/output) and timing metrics (time-to-first-token, completion time) are recorded [source: B042]
7. **Given** the message filtering pipeline produces an empty result, **When** the fallback triggers, **Then** at least the last user message is included [source: BL-012]
8. **Given** a provider with a rate limit configured, **When** the user sends a message within the rate limit window, **Then** the system shows a warning with the remaining wait time and blocks the send [source: BL-016]

---

### User Story 4 - Message Block Types & State Machine (Priority: P1)

The system supports 11 distinct message block types, each with type-specific fields. Blocks follow a defined state machine with 6 states. The stream processing state machine handles 15+ chunk types, routing each to the appropriate block creation/update callback via a BlockManager that orchestrates the block lifecycle.

**Why this priority**: Message blocks are the atomic content units. The block type system and state machine are fundamental to rendering and managing all AI responses correctly.

**Independent Test**: Send a message that triggers multiple block types (e.g., a reasoning model produces text + thinking blocks), verify each block has correct type, status transitions, and variant-specific fields.

**Acceptance Scenarios**:

1. **Given** an AI response with text content, **When** the stream processor receives text chunks, **Then** a MainTextMessageBlock is created with content and optional citation references [source: B043]
2. **Given** a reasoning-capable model, **When** the response contains thinking content, **Then** a ThinkingMessageBlock is created with content and timing in milliseconds [source: B043]
3. **Given** a tool-calling response, **When** tool call chunks arrive, **Then** a ToolMessageBlock is created with toolId, toolName, arguments, and content [source: B043]
4. **Given** an image generation response, **When** image data arrives, **Then** an ImageMessageBlock is created with URL or file metadata [source: B043]
5. **Given** any block, **When** an error occurs during streaming, **Then** the block transitions to ERROR status with serialized error details [source: B044]
6. **Given** a block in STREAMING status, **When** the user pauses generation, **Then** the block transitions to PAUSED status [source: B044]
7. **Given** an invalid status transition attempt, **When** the system detects the violation, **Then** the transition is rejected and an error is logged [source: B044]

---

### User Story 5 - Message Retry & Removal (Priority: P1)

User retries a failed or unsatisfactory response. The system removes the previous assistant response (and optionally the user message) by askId, then sends the message again. Users can also delete individual messages. The askId links user questions to their assistant replies for paired operations.

**Why this priority**: Retry is essential for the chat experience — users frequently need to regenerate responses when they fail or are unsatisfactory.

**Independent Test**: Send a message, receive response, click retry, verify old response is removed and new generation starts. Delete a message, verify it's removed from the topic.

**Acceptance Scenarios**:

1. **Given** an assistant reply, **When** the user retries the message, **Then** the previous assistant response is removed by askId and a new request is initiated [source: B046]
2. **Given** a user message, **When** the user deletes it, **Then** the message and all its blocks are removed from the topic and database [source: B046]
3. **Given** a message with multiple blocks, **When** the message is removed, **Then** all associated blocks are also removed [source: B046]
4. **Given** message removal by askId, **When** both user question and assistant reply share the same askId, **Then** both messages are removed together [source: B046]

---

### User Story 6 - Data Persistence & Database (Priority: P1)

All conversation data (assistants, topics, messages, message blocks) is persisted to the local database. Messages are loaded lazily per topic with pagination support. The topic-to-message mapping is maintained for efficient lookups. Database migrations run automatically on startup to handle schema changes.

**Why this priority**: Without persistence, all conversations would be lost on app restart. Lazy loading is essential for performance with large conversation histories.

**Independent Test**: Create conversations, restart the app, verify all data is intact. Load a topic with 1000+ messages, verify pagination works within performance targets.

**Acceptance Scenarios**:

1. **Given** any conversation data change, **When** the change is committed, **Then** it is persisted to the local Dexie database [source: B048]
2. **Given** a topic with many messages, **When** the user opens the topic, **Then** messages are loaded lazily with pagination [source: B040]
3. **Given** the database, **When** the system needs to look up messages by topic, **Then** the topic-to-message-ID mapping provides efficient lookups [source: B047]
4. **Given** an app update with schema changes, **When** the app starts, **Then** database migrations run idempotently without data loss [source: B049]
5. **Given** a migration failure, **When** the error is detected, **Then** the migration rolls back to the previous state and the user is notified
6. **Given** legacy data with non-array topics, **When** loading assistants, **Then** the topics field is normalized to an array [source: B055]
7. **Given** a topic, **When** tracking pagination state, **Then** the display count is tracked for progressive loading [source: B054]

---

### User Story 7 - StreamText Parameter Assembly (Priority: P1)

When a message is sent, the system assembles all parameters for the AI SDK streaming call. This includes model resolution via the provider factory, capability detection (reasoning, web search, URL context, image generation), MCP tool setup, provider-specific web search tool injection, system prompt construction with variable replacement, Anthropic beta header assembly, and context count calculation.

**Why this priority**: Parameter assembly is the bridge between the chat data model and the AI provider layer. Without it, no AI responses can be generated.

**Independent Test**: Configure an assistant with a reasoning model, send a message, verify the stream parameters include thinking mode, correct tools, and assembled system prompt.

**Acceptance Scenarios**:

1. **Given** an assistant with a selected model, **When** preparing a request, **Then** the model is resolved to the correct AI SDK provider ID via the factory pattern [source: BL-011]
2. **Given** a model with reasoning support and reasoning effort configured, **When** building parameters, **Then** thinking mode is enabled with provider-specific parameters [source: BL-011]
3. **Given** an assistant with MCP servers configured, **When** building parameters, **Then** MCP tools are set up via the tools configuration service [source: BL-011]
4. **Given** a provider that supports web search natively, **When** the assistant has web search enabled, **Then** the correct provider-specific search tool is injected (Google Vertex, Vertex Anthropic, or Azure) [source: BL-011]
5. **Given** an assistant with a system prompt containing variables, **When** building parameters, **Then** prompt variables are replaced with runtime values [source: BL-011]
6. **Given** an assistant, **When** calculating context window, **Then** the context count from settings determines how many historical messages to include [source: BL-017]

---

### User Story 8 - Assistant Presets & Tags (Priority: P2)

User creates assistant presets (saved configurations) that can be shared and applied to new assistants. Assistants support tags for categorization, with collapsible tag groups and custom tag ordering. Assistants and agents share a unified ordering list.

**Why this priority**: Presets and tags improve organization for power users with many assistants, but basic chat works without them.

**Independent Test**: Create a preset from an assistant, apply it to a new assistant, verify settings are transferred. Add tags to assistants, verify grouping and collapse behavior.

**Acceptance Scenarios**:

1. **Given** an assistant with a custom configuration, **When** the user creates a preset, **Then** the configuration is saved as a reusable template [source: B050]
2. **Given** a saved preset, **When** the user applies it to a new assistant, **Then** the assistant inherits the preset's configuration [source: B050]
3. **Given** assistants with tags, **When** viewing the assistant list, **Then** assistants are grouped by tags with collapsible sections [source: B051]
4. **Given** multiple tag groups, **When** the user reorders tags, **Then** the tag ordering persists [source: B051]
5. **Given** agents and assistants coexist, **When** viewing the unified list, **Then** they are interleaved according to the unified ordering [source: B053]

---

### Edge Cases

- What happens when the messages array for a topic is empty? → Show empty state, ready for first message
- What happens when a block status transition is invalid? → Reject the transition and log an error with current and attempted states
- What happens when a database migration fails mid-way? → Roll back to the previous schema version and notify the user
- What happens when an assistant has no model set? → Fall back to the user's default model from provider settings
- What happens when message blocks reference a non-existent message? → Orphan cleanup removes the blocks during database maintenance
- What happens when a topic has duplicate message IDs? → Deduplicate on load, keeping the most recent version
- What happens when the message filtering pipeline produces zero messages? → Fallback ensures at least the last user message is included
- What happens when a provider's rate limit blocks a send? → Show a warning toast with the remaining wait time in seconds
- What happens when streaming is interrupted mid-response? → Partial blocks are preserved with their current status; user can retry
- What happens when the context window limit is exceeded? → The filtering pipeline truncates to the configured context count plus 2 messages
- What happens when the user sends a message with file attachments to a non-vision model? → Files are converted to text extraction with fallback

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST create a default assistant with system prompt and default model on first launch [source: B036]
- **FR-002**: System MUST support full CRUD operations for assistants (create, read, update, delete) with immediate list reflection and configurable positioning [source: B037, B052]
- **FR-003**: System MUST support updating assistant settings including temperature, context count, max tokens, top-p, stream output mode, and custom parameters [source: B038]
- **FR-004**: System MUST manage topics as ordered conversation containers within assistants, supporting create, rename, delete, and pin operations [source: B039]
- **FR-005**: System MUST load messages for a topic lazily with pagination support [source: B040]
- **FR-006**: System MUST create user messages with associated message blocks atomically (main text block always created, plus image and file blocks for attachments) [source: B041, BL-015]
- **FR-007**: System MUST support streaming assistant messages with real-time block creation and updates via a chunk-based stream processing state machine [source: B042, BL-014]
- **FR-008**: System MUST support 11 message block types: main_text, thinking, translation, image, code, tool, file, error, citation, video, and compact, each with type-specific variant fields [source: B043]
- **FR-009**: System MUST track message block status through a defined state machine with 6 states: pending, processing, streaming, success, error, and paused [source: B044]
- **FR-010**: System MUST support upserting block references within messages to maintain the message-to-blocks relationship [source: B045]
- **FR-011**: System MUST support message removal by ID or by askId for retry/regenerate flows, cascading to associated blocks [source: B046]
- **FR-012**: System MUST maintain topic-to-message-ID mappings for efficient message lookups [source: B047]
- **FR-013**: System MUST persist all conversation data (assistants, topics, messages, blocks) to the local database with automatic write-through [source: B048]
- **FR-014**: System MUST run database upgrade migrations idempotently on startup without data loss [source: B049]
- **FR-015**: System MUST support assistant presets for saving, sharing, and applying assistant configurations [source: B050]
- **FR-016**: System MUST support assistant tags with custom ordering and collapsible tag groups [source: B051]
- **FR-017**: System MUST manage a unified ordering list for both agents and assistants [source: B053]
- **FR-018**: System MUST track display count per topic for progressive message pagination [source: B054]
- **FR-019**: System MUST normalize legacy topic data (non-array formats) to arrays on load [source: B055]
- **FR-020**: System MUST implement a 9-stage message filtering pipeline that transforms conversation history into model-ready messages, with a fallback guaranteeing at least the last user message [source: BL-012]
- **FR-021**: System MUST convert internal message format to AI SDK ModelMessage format, handling text, image, file, and reasoning parts based on model capabilities [source: BL-013]
- **FR-022**: System MUST assemble streaming request parameters including model resolution, capability detection, MCP tool setup, web search injection, system prompt construction, and Anthropic header assembly [source: BL-011]
- **FR-023**: System MUST enforce per-provider rate limiting, blocking sends within the rate limit window with user-visible feedback [source: BL-016]
- **FR-024**: System MUST calculate context window size from assistant settings, supporting configurable and unlimited context modes [source: BL-017]

### Key Entities

- **Assistant**: An AI persona with identity (name, emoji, description), behavior (system prompt, model, settings), organization (topics, tags, presets), and integration points (MCP servers, knowledge bases, web search, memory)
- **Topic**: A conversation container within an assistant, with identity (name, type), ordering (pinned, timestamps), and an ordered collection of messages
- **Message**: A single turn in a conversation, authored by a user, assistant, or system, containing metadata (model, usage, metrics, askId) and referencing an ordered list of message blocks
- **MessageBlock**: An atomic content unit within a message, discriminated by type (11 variants) with a status state machine (6 states) and type-specific variant fields (content, tool info, file metadata, etc.)
- **AssistantSettings**: Configuration for AI behavior including temperature, context count, max tokens, top-p, stream output mode, reasoning effort, tool use mode, and custom parameters
- **AssistantPreset**: A saved, shareable assistant configuration template

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Messages for a topic load and display within 200ms for topics with up to 500 messages
- **SC-002**: Block status transitions are atomic — no intermediate or inconsistent states are observable by the UI
- **SC-003**: Database upgrades run without data loss across all supported migration paths
- **SC-004**: Assistant CRUD operations (create, update, delete, reorder) reflect in the UI within 100ms
- **SC-005**: Streaming response tokens appear as message block updates within 50ms of chunk arrival
- **SC-006**: The message filtering pipeline processes 1000 messages within 50ms
- **SC-007**: All 20 P1/P2 source behaviors (B036-B053) have corresponding functional requirements with verified coverage
- **SC-008**: All conversation data (assistants, topics, messages, blocks) survives app restart without loss
- **SC-009**: Rate limit enforcement correctly blocks rapid sends with accurate countdown display
- **SC-010**: Context window calculation correctly limits history to the configured message count
