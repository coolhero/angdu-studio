# Feature Specification: Chat UI

**Feature Branch**: `005-chat-ui`
**Created**: 2026-03-09
**Status**: Draft
**Input**: Complete chat user interface — TipTap-based rich input, markdown rendering with syntax highlighting/math/diagrams, real-time streaming display, message actions, conversation visualization, sidebar navigation, and responsive layout.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Send and Receive Messages (Priority: P1)

A user opens a conversation, types a message using the rich text input bar, and sends it. The assistant's response streams in real-time, displaying text blocks progressively with smooth animation. The user sees each block appear and update as tokens arrive, with clear status indicators during generation.

**Why this priority**: Core chat interaction — without send/receive, nothing else matters.

**Independent Test**: Can be tested by opening a conversation, sending a message, and observing a streaming response render progressively.

**Acceptance Scenarios**:

1. **Given** the user has an active conversation with a selected assistant, **When** they type a message and press the send shortcut, **Then** the message appears in the chat and the assistant's response streams in with progressive block rendering.
2. **Given** a response is streaming, **When** the user observes the output, **Then** each block displays a progress indicator and the text animates smoothly without jank.
3. **Given** a response is streaming, **When** the stream completes, **Then** all blocks transition to a final status and the input bar re-enables for the next message.

---

### User Story 2 - Rich Markdown Content Display (Priority: P1)

A user receives assistant responses containing markdown with code blocks, mathematical equations, and diagrams. The content renders with proper syntax highlighting for code, formatted math expressions, and visual diagrams — all without layout shifts or broken formatting.

**Why this priority**: AI assistants produce rich content; proper rendering is essential for usability.

**Independent Test**: Can be tested by viewing a response containing code (multiple languages), LaTeX math, and a Mermaid diagram, verifying each renders correctly.

**Acceptance Scenarios**:

1. **Given** a response contains a code block with a language identifier, **When** the block renders, **Then** syntax highlighting is applied with correct coloring for that language.
2. **Given** a response contains LaTeX math notation, **When** the block renders, **Then** equations display as formatted math without layout shift.
3. **Given** a response contains a Mermaid diagram definition, **When** the block renders, **Then** a visual diagram is produced.
4. **Given** a response contains a markdown table, **When** the table is wider than the viewport, **Then** horizontal scrolling is available.

---

### User Story 3 - Rich Text Input with Tools (Priority: P1)

A user composes messages using a rich text editor with access to input tools. The input bar supports slash commands, file attachments, and other tools accessible via a registry. The user can configure which tools are visible and their order.

**Why this priority**: The input bar is the primary interaction point for every user action.

**Independent Test**: Can be tested by opening the input bar, activating slash commands, attaching a file, and verifying tool visibility and ordering.

**Acceptance Scenarios**:

1. **Given** the user focuses the input bar, **When** they type "/", **Then** a slash command menu appears with available commands.
2. **Given** the user wants to attach a file, **When** they use the attachment tool, **Then** a file picker opens and selected files show a preview before sending.
3. **Given** the user has configured tool visibility, **When** they open the tools area, **Then** only enabled tools appear in the configured order.
4. **Given** the user presses the configured send shortcut (Enter or Shift+Enter), **When** input has content, **Then** the message is sent.

---

### User Story 4 - Message Block Types (Priority: P1)

A user views assistant responses that contain various block types: main text, thinking/reasoning, code execution results, tool calls, errors, citations, images, and more. Each block type renders with appropriate formatting, controls, and status indicators.

**Why this priority**: The 11 block types are the atomic units of all assistant output; correct rendering is foundational.

**Independent Test**: Can be tested by viewing a conversation containing each block type and verifying type-specific rendering.

**Acceptance Scenarios**:

1. **Given** a response contains a thinking block, **When** it renders, **Then** elapsed time is displayed and the block is collapsible.
2. **Given** a response contains a tool call block, **When** it renders, **Then** tool name, arguments, and output are formatted clearly.
3. **Given** a response contains an error block, **When** it renders, **Then** error details are displayed in a distinct error format.
4. **Given** a response contains a citation block, **When** it renders, **Then** source links and tooltips are available.
5. **Given** a response contains an unknown or invalid block type, **When** it renders, **Then** a placeholder is shown instead of crashing.

---

### User Story 5 - Message Actions (Priority: P2)

A user wants to interact with individual messages — copying content, editing a previous message, retrying a failed response, deleting messages, translating content, forking a conversation, or using text-to-speech. A toolbar appears on hover providing these actions.

**Why this priority**: Power-user actions that enhance productivity but not required for basic chat flow.

**Independent Test**: Can be tested by hovering a message, clicking each action, and verifying the expected behavior.

**Acceptance Scenarios**:

1. **Given** the user hovers over a message, **When** the toolbar appears, **Then** available actions (copy, edit, retry, delete, translate, fork, TTS) are shown.
2. **Given** the user clicks "copy", **When** the action completes, **Then** the message content is copied to the clipboard.
3. **Given** the user clicks "edit" on their own message, **When** the inline editor opens, **Then** they can modify the text and save or re-send.
4. **Given** the user clicks "retry" on an assistant message, **When** the retry triggers, **Then** the message is re-generated from the same prompt.
5. **Given** the user clicks "delete", **When** confirmation is provided, **Then** the message is removed from the conversation.

---

### User Story 6 - Sidebar Navigation (Priority: P2)

A user navigates between assistants, topics (conversations), and sessions using sidebar tabs. They can create, select, rename, and delete items in each tab. The sidebar adapts to narrow viewports.

**Why this priority**: Navigation structure for managing multiple conversations — important but secondary to core chat.

**Independent Test**: Can be tested by switching between sidebar tabs, creating/selecting/deleting items, and resizing the viewport.

**Acceptance Scenarios**:

1. **Given** the sidebar is visible, **When** the user switches tabs (assistants/topics/sessions), **Then** the corresponding list is displayed.
2. **Given** the user selects a different topic, **When** the topic loads, **Then** messages for that topic are fetched and displayed.
3. **Given** the viewport is narrow, **When** the layout adapts, **Then** the sidebar collapses or overlays without obstructing the chat.

---

### User Story 7 - Smooth Scrolling and Infinite Load (Priority: P2)

A user with a long conversation history scrolls through messages. The list scrolls smoothly even during active streaming, and older messages load on demand as the user scrolls up. Navigation controls (scroll to bottom, jump to message) are available.

**Why this priority**: Performance and UX polish for real-world usage with long conversations.

**Independent Test**: Can be tested by loading a conversation with 100+ messages, scrolling during streaming, and verifying smooth frame rate and lazy loading.

**Acceptance Scenarios**:

1. **Given** a conversation has 100+ messages, **When** the user scrolls up, **Then** older messages load incrementally without freezing the UI.
2. **Given** a response is actively streaming, **When** the user is at the bottom of the list, **Then** the list scrolls smoothly at 60fps to keep the latest content visible.
3. **Given** the user has scrolled up, **When** they click "scroll to bottom", **Then** the view jumps to the latest message.

---

### User Story 8 - Streaming Lifecycle and Error Recovery (Priority: P2)

A user experiences a streaming interruption (network error, rate limit, context overflow). The system preserves partial blocks, displays appropriate error information, and provides retry options. During active streaming, navigation and concurrent sends are blocked to prevent data corruption.

**Why this priority**: Reliability under failure conditions — critical for trust but secondary to happy-path flow.

**Independent Test**: Can be tested by simulating a stream interruption and verifying partial preservation and retry availability.

**Acceptance Scenarios**:

1. **Given** a stream is interrupted, **When** the error occurs, **Then** partial blocks are preserved and an error indicator is shown with a retry option.
2. **Given** a stream is active, **When** the user attempts to switch topics or send another message, **Then** the action is blocked with a clear indication that generation is in progress.
3. **Given** the user hits a rate limit, **When** they attempt to send, **Then** a countdown is displayed showing when they can send again.
4. **Given** the context window would overflow, **When** the system prepares the request, **Then** messages are filtered/truncated according to the configured context limit.

---

### Edge Cases

- Empty conversation: Show an empty state with prompt suggestions to guide the user.
- Failed markdown parsing: Fall back to displaying raw text instead of crashing.
- Invalid/unknown block type in message data: Render a placeholder block rather than breaking the message list.
- Concurrent block updates during streaming: Batched state updates prevent race conditions.
- Very long single message: Virtualization or content truncation prevents DOM overload.
- Draft text persistence: Input drafts are cached locally with a 24-hour TTL so users don't lose work.
- Multi-model responses: Messages grouped by askId display together with clear model attribution.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System SHALL provide a TipTap-based rich text input editor with slash commands, @mentions, and configurable send shortcut (Enter or Shift+Enter).
- **FR-002**: System SHALL support file attachment with preview before sending, displaying attached images and files in the input area.
- **FR-003**: System SHALL support 18 input tools via a registry/plugin pattern (defineTool/registerTool) with configurable visibility, scoping, and drag-and-drop ordering.
- **FR-004**: System SHALL render markdown content using react-markdown with custom plugins for extended formatting.
- **FR-005**: System SHALL syntax-highlight code blocks via Shiki supporting 20+ programming languages.
- **FR-006**: System SHALL render LaTeX math expressions via KaTeX (with MathJax as configurable alternative) without layout shift.
- **FR-007**: System SHALL render Mermaid diagram definitions as visual diagrams.
- **FR-008**: System SHALL render markdown tables with horizontal scroll when content exceeds container width.
- **FR-009**: System SHALL display streaming assistant responses with block-level progress indicators and smooth text animation via useSmoothStream.
- **FR-010**: System SHALL render all 11 message block types (main_text, thinking, translation, image, code, tool, file, error, citation, video, compact) with type-specific formatting and controls.
- **FR-011**: System SHALL display thinking blocks with elapsed time tracking and collapsible content.
- **FR-012**: System SHALL display tool call/result blocks with formatted tool name, arguments, and output.
- **FR-013**: System SHALL display error blocks with serialized error details in a distinct error format.
- **FR-014**: System SHALL display citation blocks with source links and hover tooltips.
- **FR-015**: System SHALL render an UnknownMessageBlock placeholder for unrecognized block types.
- **FR-016**: System SHALL provide a per-message action toolbar (on hover) with: copy, edit, retry, delete, translate, fork, TTS, and bookmark actions.
- **FR-017**: System SHALL support inline message editing with save and re-send capability.
- **FR-018**: System SHALL support message removal by ID and by askId (group deletion).
- **FR-019**: System SHALL manage the streaming lifecycle via BlockManager with start/update/complete/error callbacks.
- **FR-020**: System SHALL display a tool approval workflow within messages when tool calls require user confirmation.
- **FR-021**: System SHALL implement infinite scroll with lazy message loading for long conversations.
- **FR-022**: System SHALL maintain smooth scrolling (targeting 60fps) during active streaming.
- **FR-023**: System SHALL provide scroll-to-bottom and jump-to-message navigation controls.
- **FR-024**: System SHALL provide sidebar tabs for assistants, topics, and sessions with create/select/rename/delete operations.
- **FR-025**: System SHALL display the system prompt within the chat view when configured.
- **FR-026**: System SHALL group messages by askId for multi-model response display.
- **FR-027**: System SHALL cache input draft text with a 24-hour TTL to prevent data loss.
- **FR-028**: System SHALL display real-time token count for the current input and context window.
- **FR-029**: System SHALL display token usage per message after generation completes.
- **FR-030**: System SHALL support in-chat content search (Ctrl+F / Cmd+F) with match highlighting.
- **FR-031**: System SHALL support narrow viewport layout adaptation with collapsible sidebar.
- **FR-032**: System SHALL block navigation, topic switching, and concurrent message sends during active streaming (generation state guard).
- **FR-033**: System SHALL display a rate-limit countdown when the user is temporarily blocked from sending.
- **FR-034**: System SHALL filter and truncate messages according to the configured context window limit before sending.
- **FR-035**: System SHALL show an empty state with prompt suggestions when a conversation has no messages.
- **FR-036**: System SHALL support message translation inline via the action toolbar.
- **FR-037**: System SHALL render SVG content inline with scalable rendering.
- **FR-038**: System SHALL support message attachment display (images, files) within sent messages.
- **FR-039**: System SHALL support multi-select messages with drag-selection overlay for bulk operations.
- **FR-040**: System SHALL visualize conversation branching via a React Flow graph view.

### Key Entities

- **Message**: A user or assistant message within a topic, containing an ordered list of message blocks and metadata (role, timestamp, askId, model).
- **MessageBlock**: An atomic content unit within a message, typed as one of 11 variants (main_text, thinking, translation, image, code, tool, file, error, citation, video, compact), each with type-specific data and a status state machine.
- **Assistant**: A configured AI persona with model selection, system prompt, temperature, context window settings, and associated topics.
- **Topic**: A conversation thread belonging to an assistant, containing an ordered sequence of messages with optional title generated via LLM summary.
- **InputTool**: A registered input bar tool with metadata (name, icon, scope, order, enabled state) accessible via the tool registry.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The first streaming token renders visibly within 200ms of receiving the initial chunk from the provider.
- **SC-002**: Code blocks render with correct syntax highlighting for at least 20 programming languages.
- **SC-003**: Math expressions render without visible layout shift (no content reflow after initial paint).
- **SC-004**: Input bar tools load and respond to user interaction within 100ms.
- **SC-005**: Message list maintains smooth scrolling (60fps target) during active streaming.
- **SC-006**: Conversations with 200+ messages load and scroll without perceptible frame drops, using lazy loading for off-screen messages.
- **SC-007**: All 11 message block types render with correct type-specific formatting and no unhandled errors.
- **SC-008**: Message actions (copy, edit, delete) complete within 300ms of user interaction.
- **SC-009**: Sidebar tab switching displays the target list within 200ms.
- **SC-010**: The application builds, passes type checking, and all UI component tests pass before deployment.

## Assumptions

- F001 (app-core), F002 (ai-provider), and F003 (chat-core) are fully implemented and provide: window management, theme system, IPC bridge, model/provider entities, Zustand stores (useAssistantsStore, useMessageStore, useMessageBlockStore), services (ConversationService, MessagesService, StreamProcessingService), and Dexie database persistence.
- UI components use shadcn/ui + Tailwind CSS (migrated from Ant Design + styled-components per constitution).
- TipTap, react-markdown, Shiki, KaTeX, Mermaid, @xyflow/react, @hello-pangea/dnd, react-infinite-scroll-component, react-hotkeys-hook, motion/react, lucide-react, and i18next are retained from the source project.
- Imperative modal APIs (window.modal.confirm, window.toast) are replaced with custom Dialog and Sonner/Toast providers.
- The 18 input tools are migrated from the source project's tool registry; exact tool list is inherited.
- Text-to-speech (TTS) uses the browser's Web Speech API or a configured TTS provider — implementation details deferred to planning.
- The configurable send shortcut (Enter vs Shift+Enter) is stored in user settings; default is Enter to send.
