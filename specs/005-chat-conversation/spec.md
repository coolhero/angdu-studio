# Feature Specification: Chat Conversation

**Feature Branch**: `005-chat-conversation`
**Created**: 2026-03-16
**Status**: Draft
**Input**: Chat conversation — Primary chat UI with message blocks, streaming output, assistant configuration, topic management, multi-model messages, and mentions. The main user interaction surface handling the complete chat lifecycle from input to rendered output.

## User Scenarios & Testing

### User Story 1 - Send and Receive Chat Messages (Priority: P1)

A user opens Angdu Studio and lands on the home screen, which is the chat interface. The flexible layout shows an assistants panel (togglable, left), the main chat area (center, always visible), and a topic sidebar (togglable, position-switchable). The user selects an assistant, types a message in the rich text editor at the bottom, and presses the send key. The message appears in the chat area as a user message. The assistant's response streams in incrementally — text, code blocks, and thinking blocks render as chunks arrive. The user can see a streaming indicator and can stop generation at any time by clicking the stop button.

**Why this priority**: This is the core value proposition of the application. Without send/receive with streaming, no other chat feature is useful.

**Independent Test**: Type a message, press send, verify the response streams in with visible incremental rendering. Click stop mid-stream and verify partial response is preserved.

**Acceptance Scenarios**:

1. **Given** the user is on the home chat screen with a default assistant selected, **When** they type a message and press the send key (Enter or Ctrl+Enter per settings), **Then** the message appears as a user bubble and the assistant response streams in incrementally [source: B116, B131]
2. **Given** a message is being streamed, **When** the user clicks the stop button, **Then** streaming stops, the partial response is preserved with all blocks received so far, and the message status changes to indicate it was stopped [source: B133, B145]
3. **Given** the assistant has finished responding, **When** the user clicks the regenerate button on the assistant message, **Then** the previous response is replaced and a new response streams in [source: B134]
4. **Given** the chat area has messages, **When** a new message arrives, **Then** the view auto-scrolls to the bottom if the user was already at the bottom [source: B114]
5. **Given** the user has scrolled up in the message list, **When** a new message arrives, **Then** auto-scroll is disabled and a "scroll to bottom" button appears [source: B114]
6. **Given** a streaming response contains text, code, and thinking blocks, **When** the response finishes, **Then** each block type is rendered with its appropriate visual treatment (plain text, syntax-highlighted code, collapsible thinking) [source: B129, B130]

---

### User Story 2 - Assistant Management (Priority: P1)

A user manages their assistants in the left panel. They can see a list of assistants, search by name, and select one to make it active. They can create a new assistant with a custom name, system prompt, model, and parameters (temperature, topP, maxTokens). The default assistant is always available and cannot be deleted. Editing an assistant updates its configuration immediately.

**Why this priority**: Assistants are the configuration layer for how the AI responds. Without assistant management, users cannot customize behavior.

**Independent Test**: Create a new assistant with a custom system prompt and model. Select it, send a message, verify the response respects the assistant's configuration. Delete the assistant and verify fallback to default.

**Acceptance Scenarios**:

1. **Given** the user opens the assistants panel, **When** they view the list, **Then** all assistants are shown with the default assistant always present [source: B118, B122]
2. **Given** the user clicks the create button, **When** they fill in name, system prompt, model, and parameters, **Then** a new assistant is created and appears in the list [source: B119, B120]
3. **Given** an assistant exists, **When** the user edits its name, system prompt, or model settings, **Then** the changes are saved immediately and take effect on the next message [source: B119, B120]
4. **Given** a non-default assistant exists, **When** the user deletes it while it is active, **Then** the assistant is removed and the active selection falls back to the default assistant [source: B119]
5. **Given** multiple assistants exist, **When** the user types in the search field, **Then** the assistant list filters to matching names [source: B112]
6. **Given** the user selects an assistant, **When** they send a message, **Then** the system prompt and model from that assistant are used for the API call [source: B147, B149, B150]

---

### User Story 3 - Topic and Conversation Management (Priority: P1)

A user organizes their conversations into topics. Each topic is a separate conversation thread with its own message history. The user can create new topics, switch between them (loading the message history), rename topics, and delete topics (with all their messages). When a new topic receives its first message exchange, the topic title is auto-generated from the conversation content.

**Why this priority**: Without topic management, all conversations merge into one stream. Topics are essential for organizing multiple conversations.

**Independent Test**: Create a topic, send messages, switch to another topic, verify messages are separate. Delete a topic and verify its messages are removed.

**Acceptance Scenarios**:

1. **Given** the user clicks the new topic button, **When** the topic is created, **Then** an empty topic appears in the sidebar and becomes active with an empty state showing suggested prompts [source: B151]
2. **Given** multiple topics exist, **When** the user clicks a topic in the sidebar, **Then** the chat area loads that topic's message history [source: B152, B138]
3. **Given** a topic has messages, **When** the user deletes the topic, **Then** the topic and all its messages are permanently removed after confirmation [source: B153]
4. **Given** a new topic has no name, **When** the first message exchange completes, **Then** the topic title is auto-generated from the conversation content using a small/quick model [source: B155]
5. **Given** a topic has an auto-generated name, **When** the user renames it manually, **Then** the manual name persists and auto-naming is disabled for that topic [source: B154]
6. **Given** the user switches topics, **When** the target topic has 500+ messages, **Then** the messages load within 1 second using virtual scrolling [source: B138]

---

### User Story 4 - Message Composition and Rich Editor (Priority: P1)

A user composes messages using a rich text editor powered by TipTap. The editor supports markdown shortcuts (bold, italic, code, headings). Users can paste images or drag-and-drop files to attach them to messages. After sending, the composition area clears. The send key behavior respects the user's setting from F003 (Enter or Ctrl+Enter).

**Why this priority**: The message input is the primary interaction point. Rich editing and file attachment are core to the chat experience.

**Independent Test**: Type markdown in the editor and verify formatting. Paste an image, send the message, verify the attachment is included. Change the send key setting and verify behavior changes.

**Acceptance Scenarios**:

1. **Given** the user is in the message editor, **When** they type markdown shortcuts (e.g., **bold**, `code`), **Then** the text is formatted visually in the editor [source: B157]
2. **Given** the user has composed a message, **When** they press the configured send key, **Then** the message is sent and the editor clears [source: B116, B125, B045]
3. **Given** the user pastes an image from clipboard, **When** the model supports vision, **Then** the image is attached and sent as a vision input [source: B158, B148]
4. **Given** the user pastes an image, **When** the current model does not support vision, **Then** a warning is shown and the message can still be sent as text-only [source: B148]
5. **Given** the user drags a file onto the editor, **When** the file is valid, **Then** it is attached to the message with its metadata [source: B158, B124]

---

### User Story 5 - Message Actions and Interaction (Priority: P2)

A user interacts with individual messages. Hovering over a message reveals action buttons: copy, edit, delete, and regenerate. Copying extracts clean markdown without UI artifacts. Editing a user message opens it in the editor for modification and resending. Deleting a message removes it from the conversation.

**Why this priority**: Message-level actions enhance usability but are not required for the core send/receive flow.

**Independent Test**: Hover over a message, verify action buttons appear. Copy a message and verify clean markdown in clipboard. Edit a message and verify it is resent.

**Acceptance Scenarios**:

1. **Given** the user hovers over a message, **When** the hover is detected, **Then** action buttons (copy, edit, delete, regenerate) appear [source: B140, B139, B135, B134]
2. **Given** the user clicks copy on a message, **When** the content is copied, **Then** the clipboard contains clean markdown without UI rendering artifacts [source: B140]
3. **Given** the user clicks edit on their own message, **When** the editor opens with the message content, **Then** they can modify and resend, which creates a new exchange from that point [source: B135]
4. **Given** the user clicks delete on a message, **When** they confirm the deletion, **Then** the message is removed from the conversation [source: B139]

---

### User Story 6 - Message Block Rendering (Priority: P1)

Messages are rendered as a sequence of typed content blocks. During streaming, blocks are created dynamically as the response content type is identified. Text blocks render as markdown. Code blocks render with syntax highlighting. Thinking/reasoning blocks render as collapsible sections. Error blocks display error information clearly. Tool-use blocks show tool invocation details (placeholder for F007).

**Why this priority**: Block-based rendering is core to how AI responses are displayed. Without proper block rendering, the chat output is unusable.

**Independent Test**: Send a prompt that elicits code and thinking. Verify code blocks have syntax highlighting and thinking blocks are collapsible.

**Acceptance Scenarios**:

1. **Given** a streaming response begins, **When** the content type is identified, **Then** the appropriate block type is created (main_text, code, thinking, tool, image, file, error) from an unknown/placeholder initial state [source: B127, B129]
2. **Given** a text block is streaming, **When** chunks arrive, **Then** the markdown is rendered incrementally without layout jumps [source: B128, B141]
3. **Given** a code block is received, **When** it is rendered, **Then** syntax highlighting is applied based on the language identifier [source: B129]
4. **Given** a thinking block is received, **When** the response completes, **Then** the thinking content is shown in a collapsible section [source: B129]
5. **Given** a stream error occurs mid-response, **When** the error block is created, **Then** the partial response is preserved and the error is displayed with an option to retry [source: B130, B143]
6. **Given** a message has multiple blocks (text + code + thinking), **When** rendered, **Then** all blocks appear in order with correct visual treatment [source: B129]

---

### User Story 7 - Context Window and API Integration (Priority: P1)

The system manages the conversation context window when building API requests. The assistant's contextCount setting determines how many recent messages to include. System prompts with variable replacement are always prepended. Messages are formatted according to the provider's expected format via F004's AI core interface. The streaming response is processed through the chunk processing pipeline.

**Why this priority**: Proper context windowing and API formatting are essential for correct AI responses and token management.

**Independent Test**: Set contextCount to 5 on an assistant, send 10 messages, verify only the last 5 user/assistant messages are sent in the API call (plus system prompt).

**Acceptance Scenarios**:

1. **Given** an assistant has contextCount set to N, **When** a message is sent, **Then** only the most recent N messages are included in the API request [source: B132]
2. **Given** the assistant has a system prompt with variables like {{date}}, **When** a message is sent, **Then** the variables are replaced with current values at send time [source: B147]
3. **Given** the user sends a message, **When** the API request is built, **Then** messages are formatted via F004's unified AI core interface [source: B146]
4. **Given** a stream response includes usage metrics (token counts), **When** the response completes, **Then** token usage is recorded and optionally displayed [source: B144]

---

### User Story 8 - Topic Sidebar Toggle (Priority: P2)

A user can show or hide the topic sidebar panel to maximize the chat area. The toggle state persists across sessions.

**Why this priority**: Sidebar management is a convenience feature that enhances the layout but is not required for core chat.

**Independent Test**: Toggle the sidebar closed, verify the chat area expands. Reopen the app and verify the sidebar state persists.

**Acceptance Scenarios**:

1. **Given** the topic sidebar is visible, **When** the user clicks the toggle button, **Then** the sidebar hides and the chat area expands [source: B117]
2. **Given** the sidebar is hidden, **When** the user clicks the toggle button, **Then** the sidebar reappears with the topic list [source: B117]

---

### User Story 9 - Draft Persistence (Priority: P2)

When a user types a message but switches topics before sending, the unsent draft is preserved per topic. Returning to that topic restores the draft in the editor.

**Why this priority**: Draft persistence prevents accidental loss of composed messages but is not essential for core chat.

**Independent Test**: Type a message in Topic A, switch to Topic B, switch back to Topic A, verify the draft is restored.

**Acceptance Scenarios**:

1. **Given** the user has typed a message in the editor, **When** they switch to a different topic, **Then** the draft is saved for the current topic [source: B126]
2. **Given** a topic has a saved draft, **When** the user switches back to that topic, **Then** the draft is restored in the editor [source: B126]

---

### User Story 10 - Assistant Categories (Priority: P2)

Assistants can be organized into categories or groups. The assistant panel displays grouped assistants, and users can filter by category.

**Why this priority**: Categories help organize many assistants but are not needed for basic assistant selection.

**Independent Test**: Create assistants in different categories. Verify the panel shows grouped assistants and filtering by category works.

**Acceptance Scenarios**:

1. **Given** assistants have category assignments, **When** the user views the assistant panel, **Then** assistants are grouped by category [source: B121]

---

### User Story 11 - Multi-Model Compare Mode (Priority: P3)

A user can mention multiple models in a single message using @ syntax. Each mentioned model generates its own response, displayed according to the multiModelMessageStyle setting (horizontal, vertical, fold, grid).

**Why this priority**: Multi-model comparison is a power-user feature that adds value but is not required for standard chat.

**Independent Test**: Type @modelA @modelB in a message, send it, verify two separate responses appear side-by-side.

**Acceptance Scenarios**:

1. **Given** the user types @model-name in the editor, **When** they send the message, **Then** the mentioned model generates a separate response [source: B136, B159]
2. **Given** multiple models are mentioned, **When** responses arrive, **Then** they are displayed according to the configured layout style (horizontal/vertical/fold/grid) [source: B136]

---

### User Story 12 - Assistant Import/Export (Priority: P3)

A user can export their assistant configurations to a file and import assistants from a file. This enables sharing assistants across devices or with other users.

**Why this priority**: Import/export is a convenience feature for power users.

**Independent Test**: Export an assistant, delete it, import from the file, verify the assistant is restored.

**Acceptance Scenarios**:

1. **Given** the user selects export, **When** they choose assistants to export, **Then** a JSON file is saved with the assistant configurations [source: B123]
2. **Given** the user has an assistant export file, **When** they import it, **Then** the assistants are added to the list [source: B123]

---

### Edge Cases

- **Stream interrupted by network error**: Show partial response with error indicator block and option to retry
- **Model returns empty response**: Display an "empty response" message block with an option to regenerate
- **Very long message**: Use virtual scrolling for the message list and lazy markdown rendering for large content
- **Image paste with non-vision model**: Show warning, allow user to proceed with text-only send
- **Topic with 0 messages**: Show empty state with suggested prompts or greeting
- **Concurrent stream requests**: Queue subsequent requests or reject with a user-friendly message indicating generation is in progress
- **Message with mixed content types**: Render each block type (text + code + images) correctly in order
- **Assistant deleted while in use**: Fall back to the default assistant for the current topic
- **Model removed or unavailable while conversation active**: Show "model unavailable" warning with option to switch models
- **Paste very large text**: Warn about potential token count, offer to truncate
- **Offline mode**: Show cached conversations with message history, disable send button with tooltip explaining offline status

## Requirements

### Functional Requirements

- **FR-001**: System MUST render the home screen as a flexible layout with an assistants panel (togglable, left), a central chat area (always visible), and a topic sidebar (togglable, position-switchable left/right). Column count adapts from 1-3 based on panel visibility settings [source: B111]
- **FR-002**: System MUST display a list of assistants in the left panel with search filtering capability [source: B112, B149]
- **FR-003**: System MUST show a chat header containing the active assistant name, model selector dropdown, and topic information [source: B113]
- **FR-004**: System MUST render messages in chronological order with auto-scroll to bottom when the user is at the bottom of the list [source: B114]
- **FR-005**: System MUST provide a rich text editor (TipTap) for message composition with markdown shortcut support [source: B115, B157]
- **FR-006**: System MUST send messages via the configured send key (Enter or Ctrl+Enter from F003 settings) and provide a send button [source: B116, B045]
- **FR-007**: System MUST allow toggling the topic sidebar visibility with state persistence [source: B117]
- **FR-008**: System MUST maintain a store of assistants with a default assistant that cannot be deleted [source: B118, B122]
- **FR-009**: System MUST support CRUD operations on assistants (add, edit, delete) with properties including name, system prompt, model, temperature, topP, maxTokens, and category [source: B119, B120, B121]
- **FR-010**: System MUST clear the composition area after sending a message [source: B125]
- **FR-011**: System MUST persist unsent message drafts per topic and restore them when switching back [source: B126]
- **FR-012**: System MUST create typed message blocks during streaming (main_text, code, thinking, tool, image, file, error, unknown/placeholder) and update block content as stream chunks arrive. Block type registry MUST be extensible for future types (citation, translation, video, compact) added by downstream Features [source: B127, B128, B129]
- **FR-013**: System MUST track block status through lifecycle stages (pending, streaming, complete, error) [source: B130]
- **FR-014**: System MUST orchestrate the full message send flow: compose, format via F004 AI core, stream, and persist to storage [source: B131, B146]
- **FR-015**: System MUST manage conversation context by windowing messages based on assistant contextCount setting [source: B132]
- **FR-016**: System MUST allow users to stop generation mid-stream via AbortController [source: B133, B145]
- **FR-017**: System MUST allow users to regenerate the last assistant response [source: B134]
- **FR-018**: System MUST allow users to edit and resend a previous user message [source: B135]
- **FR-019**: System MUST store messages and topics in persistent storage (via main process) [source: B137, B160]
- **FR-020**: System MUST load message history when switching topics [source: B138]
- **FR-021**: System MUST support message deletion with confirmation [source: B139]
- **FR-022**: System MUST support copying message content as clean markdown to clipboard [source: B140]
- **FR-023**: System MUST render message text content as formatted markdown [source: B141]
- **FR-024**: System MUST parse streaming responses from provider APIs via F004's streaming interface [source: B142]
- **FR-025**: System MUST handle stream errors mid-response by preserving partial content and displaying an error block [source: B143]
- **FR-026**: System MUST record token usage during streaming when available [source: B144]
- **FR-027**: System MUST format messages for the provider API using F004's unified AI core interface, including role and content block formatting [source: B146]
- **FR-028**: System MUST attach the assistant's system prompt (with variable replacement) to API requests [source: B147]
- **FR-029**: System MUST support image attachments as vision input when the model supports vision capabilities [source: B148]
- **FR-030**: System MUST allow selecting an active assistant from the panel, which determines model and settings for subsequent messages [source: B149, B150]
- **FR-031**: System MUST support creating, switching, deleting, and renaming topics [source: B151, B152, B153, B154]
- **FR-032**: System MUST auto-generate topic titles from the first message exchange using a small model, respecting manual name edits [source: B155]
- **FR-033**: System MUST aggregate chat context (active assistant, selected model, current topic, message history) for API calls [source: B156]
- **FR-034**: System MUST support file and image paste/drag-drop attachment in the editor [source: B158, B124]
- **FR-035**: System MUST display message action buttons (copy, edit, delete, regenerate) on message hover [source: B140, B139, B135, B134]
- **FR-036**: System MUST support multi-model message responses via @ mention syntax with configurable display layout (horizontal, vertical, fold, grid) [source: B136, B159]
- **FR-037**: System MUST support assistant import and export as JSON files [source: B123]
- **FR-038**: System MUST apply reasoning effort settings for thinking models, with effort level caching across model switches

### Key Entities

- **Assistant**: Represents an AI assistant configuration — name, system prompt, model binding, generation parameters (temperature, topP, maxTokens), category, avatar, default flag. Each assistant determines how messages are processed and which model responds.
- **Topic**: Represents a conversation thread — title, associated assistant, message count, timestamps. Topics organize messages into separate conversations. Title can be auto-generated or manually set.
- **Message**: Represents a single chat message — role (user/assistant/system), content blocks, topic association, timestamps, token count. Messages are the atomic units of conversation.
- **MessageBlock**: Represents a typed content segment within a message — type (text, code, thinking, tool-use, image, error), content, language (for code), status (pending, streaming, complete, error). Blocks enable rich, structured rendering of AI responses.
- **Draft**: Represents an unsent message composition — topic association, editor content, file attachments. Drafts persist per topic to prevent accidental loss.

## Success Criteria

### Measurable Outcomes

- **SC-001**: First stream token is visible to the user within 500ms of pressing send (excluding network latency to provider API)
- **SC-002**: Streaming response rendering maintains smooth visual updates without visible frame drops or layout jank
- **SC-003**: Switching to a topic with 500 messages loads and displays the message list within 1 second
- **SC-004**: Application remains responsive with 10,000+ messages stored across all topics
- **SC-005**: Copying a message produces clean markdown text in the clipboard without any UI rendering artifacts or HTML tags
- **SC-006**: User can complete the full send-receive-copy cycle (type message, send, receive streamed response, copy response) within a single uninterrupted flow
- **SC-007**: Stop generation halts the stream and preserves all content received up to the stop point within 200ms of clicking stop
- **SC-008**: Assistant creation, editing, and deletion take effect immediately on the next message without requiring page reload
- **SC-009**: Topic auto-naming produces a meaningful, concise title that reflects the conversation content
- **SC-010**: Rich editor supports at minimum: bold, italic, inline code, and code block markdown shortcuts with visual formatting feedback

## Scope

### In Scope

- Three-column chat layout (assistants panel, chat area, topic sidebar)
- Full message send/receive lifecycle with streaming
- Message block rendering (text, code, thinking, error, tool-use placeholder, image)
- Assistant CRUD with configuration (name, prompt, model, parameters)
- Topic CRUD with message history
- Rich text editor with TipTap
- Markdown rendering with syntax highlighting
- Message actions (copy, edit, delete, regenerate)
- Context window management
- File and image attachment
- Draft persistence per topic
- Multi-model compare mode (@ mentions)
- Assistant import/export
- Quick phrase insertion from F003

### Out of Scope

- Knowledge base RAG integration (F006)
- MCP tool execution — tool-use blocks render as placeholders (F007)
- Web search result injection (F009)
- Memory service integration (F006)
- API server chat completions endpoint (F010)
- Translation of messages (F008)
- Chat history browsing page (F008 content management)

### Assumptions

- F001 provides a working IPC bridge and Config API for persistent storage
- F002 provides hash routing with the home route (`#/`) landing on the chat screen
- F003 provides settings values (sendKey, fontSize, messageStyle, quickPhrases) accessible via config API or Zustand stores
- F004 provides a unified AI core interface for sending messages and receiving streaming responses, with model registry and provider configuration
- Message and topic storage uses the main process (via IPC) for persistence — specific storage mechanism (electron-store, better-sqlite3) is an implementation detail
- TipTap editor is used as the rich text editor (kept from source project)
- Virtual scrolling is used for message list performance with large histories

### Dependencies

- **F001** (app-shell): IPC bridge, Config API, clipboard, shell, file storage
- **F002** (navigation): Hash routing, tab management, programmatic navigation
- **F003** (settings): sendKey, fontSize, messageStyle, quickPhrases configuration
- **F004** (model-provider): AI core interface, streaming, model registry, provider config, error handling
