# Pre-Context: F006-chat

> Chat UI, message display, input toolbar, topic management, message blocks, streaming, markdown rendering
> Generated: 2026-03-14

---

## Feature Overview

F006-chat is the LARGEST feature by file count (~454 files in `src/renderer/src/pages/home/`) and the primary user-facing surface. It encompasses the entire chat experience: message composition, multi-block message display, streaming response rendering, topic/conversation management, rich markdown rendering, and the input toolbar with 8+ action buttons.

### Key Responsibilities

1. **Input Bar**: Message composition with rich toolbar (attachments, web search, file upload, knowledge base, @mentions, code block, translate, send)
2. **Message Display**: Polymorphic MessageBlock rendering (11 block types: main_text, thinking, translation, code, image, tool, file, error, citation, video, compact)
3. **Streaming Responses**: Real-time message rendering during AI generation with status indicators
4. **Topic Management**: Conversation threads within assistants — create, rename, delete, pin, auto-name
5. **Tab System**: Multi-tab interface for parallel conversations
6. **Markdown Rendering**: Rich markdown with syntax highlighting, math (KaTeX/MathJax), mermaid diagrams, tables, and custom plugins
7. **Message Operations**: Edit, regenerate, delete, copy, branch, feedback (thumbs up/down)
8. **Multi-Model**: Send same prompt to multiple models, display results in fold/horizontal/vertical layout
9. **Chat Navigation**: Breadcrumb navigation (Assistant > Topic), search, filter

### Boundaries

- Does NOT own AI completion engine (F004-ai-core owns the completion lifecycle)
- Does NOT own assistant configuration (F005-assistant owns Assistant entity)
- Does NOT own provider/model management (F003-provider owns those)
- Does NOT own settings UI (F002-settings owns settings pages)
- DOES own Topic, Message, MessageBlock entities
- DOES own all chat UI components and message rendering
- DOES own the connection between user actions and F004-ai-core completion calls

---

## Runtime Exploration Results

### Screen: #/ — Home (Chat) — Primary Screen

**Layout**: Top navbar (44px) + Left sidebar (Assistants/Topics, 275px) + Main chat area + Input bar at bottom.

#### Chat Header

| Element | Description |
|---------|-------------|
| Assistant name breadcrumb | "Default Assistant > " with clickable segments |
| Model selector dropdown | Shows current model, click to change |
| Config icon | Opens assistant settings panel |
| Filter icon | Filter messages by type |
| Search icon | Search within conversation |
| Topic count badge | Shows number of topics |

#### Message Area

| Element | Description |
|---------|-------------|
| System greeting | "Hello, I'm Default Assistant. You can start chatting with me right away" |
| User messages | Right-aligned (or left, based on messageStyle setting), with optional timestamp |
| Assistant messages | Left-aligned with model icon, thinking blocks (collapsible), main text, tool results |
| Message actions | Hover toolbar: copy, edit, regenerate, delete, branch, thumbs up/down |
| Streaming indicator | Animated dots/cursor during generation, token-per-second counter |
| Auto-scroll | Scrolls to bottom during streaming (configurable) |

#### Input Bar

| Element | Description |
|---------|-------------|
| Text input area | "Type your message here, press Enter to send" placeholder |
| Prompt library button | Quick access to saved prompts |
| Attachment button | Attach files to message |
| Web search button | Toggle web search for this message |
| File upload button | Upload files |
| Knowledge base button | Select knowledge base for RAG |
| @Mention button | Mention other assistants for multi-model |
| Code block button | Insert code block |
| Translate button | Translate input/output |
| Send button | Send message (Enter shortcut) |
| Token estimate | Optional estimated token count display |

#### Topics Sidebar (Topics Tab)

| Element | Description |
|---------|-------------|
| Topics tab header | "Topics" with count |
| Topic list | Ordered by last updated, pinned topics at top |
| Topic item | Name + timestamp, context menu (rename, pin, delete, clear) |
| "+ New Topic" button | Creates new conversation thread |
| Auto-naming | First response triggers LLM-based topic naming (BR-011) |

### User Flows

| Flow | Steps | Observations |
|------|-------|--------------|
| Send message | Type text -> Enter (or click Send) | Creates user message + triggers completion -> streams assistant response |
| Multi-model | @mention assistants -> Send | Same prompt sent to multiple models, results displayed per multiModelMessageStyle |
| Regenerate | Hover assistant message -> Click regenerate | Re-sends the original user prompt, replaces assistant message |
| Edit message | Hover user message -> Click edit -> Modify -> Resend | Updates message content, re-triggers completion |
| Topic switch | Click topic in sidebar | Loads conversation history, scrolls to bottom |
| New topic | Click "+ New Topic" or start new conversation | Creates blank topic under current assistant |
| Search | Click search icon -> Type query | Filters messages matching search text |
| Branch | Hover message -> Branch | Creates new topic forked from this message |

---

## Source Reference

> All paths relative to cherry-studio root.

### Primary Source Files — Organized by Sub-Module

#### Inputbar/ (~30 files)

| Path | Description | Lines (approx) |
|------|-------------|----------------|
| `src/renderer/src/pages/home/Inputbar/Inputbar.tsx` | Main input bar component | ~300 |
| `src/renderer/src/pages/home/Inputbar/SendMessageBtn.tsx` | Send button with shortcut handling | ~100 |
| `src/renderer/src/pages/home/Inputbar/ToolbarActions/` | Toolbar action buttons (attach, search, KB, mention, etc.) | ~10 files |
| `src/renderer/src/pages/home/Inputbar/ContextMenu.tsx` | Input context menu | ~80 |
| `src/renderer/src/pages/home/Inputbar/TokenEstimate.tsx` | Token count estimation display | ~60 |

#### Messages/ (~80 files)

| Path | Description | Lines (approx) |
|------|-------------|----------------|
| `src/renderer/src/pages/home/Messages/MessageList.tsx` | Virtualized message list container | ~200 |
| `src/renderer/src/pages/home/Messages/MessageItem.tsx` | Single message component (dispatches to blocks) | ~250 |
| `src/renderer/src/pages/home/Messages/MessageActions.tsx` | Hover action toolbar (copy, edit, regen, delete, etc.) | ~200 |
| `src/renderer/src/pages/home/Messages/blocks/` | MessageBlock renderers (11 types) | ~20 files |
| `src/renderer/src/pages/home/Messages/blocks/MainTextBlock.tsx` | Primary text content with markdown | ~150 |
| `src/renderer/src/pages/home/Messages/blocks/ThinkingBlock.tsx` | Collapsible chain-of-thought | ~100 |
| `src/renderer/src/pages/home/Messages/blocks/ToolBlock.tsx` | MCP tool call/result display | ~150 |
| `src/renderer/src/pages/home/Messages/blocks/CodeBlock.tsx` | Code with syntax highlighting + copy | ~120 |
| `src/renderer/src/pages/home/Messages/blocks/ImageBlock.tsx` | Image display with lightbox | ~80 |
| `src/renderer/src/pages/home/Messages/blocks/ErrorBlock.tsx` | Error display with retry action | ~60 |
| `src/renderer/src/pages/home/Messages/MultiModelView.tsx` | Multi-model result layout (fold/horizontal/vertical) | ~200 |

#### Markdown/ (~40 files)

| Path | Description | Lines (approx) |
|------|-------------|----------------|
| `src/renderer/src/pages/home/Markdown/Markdown.tsx` | Rich markdown renderer entry point | ~200 |
| `src/renderer/src/pages/home/Markdown/CodeHighlighter.tsx` | Syntax highlighting (Prism/Shiki) | ~150 |
| `src/renderer/src/pages/home/Markdown/MathRenderer.tsx` | KaTeX/MathJax math rendering | ~100 |
| `src/renderer/src/pages/home/Markdown/MermaidDiagram.tsx` | Mermaid diagram rendering | ~80 |
| `src/renderer/src/pages/home/Markdown/plugins/` | Markdown-it/remark plugins | ~15 files |
| `src/renderer/src/pages/home/Markdown/TableRenderer.tsx` | Enhanced table rendering | ~80 |

#### Tabs/ (~15 files)

| Path | Description | Lines (approx) |
|------|-------------|----------------|
| `src/renderer/src/pages/home/Tabs/TabBar.tsx` | Tab bar with add/close/reorder | ~150 |
| `src/renderer/src/pages/home/Tabs/TabItem.tsx` | Individual tab component | ~80 |

#### Components/ (~20 files)

| Path | Description | Lines (approx) |
|------|-------------|----------------|
| `src/renderer/src/pages/home/components/ChatNavBar.tsx` | Chat header with breadcrumb, model selector, actions | ~200 |
| `src/renderer/src/pages/home/components/AssistantSidebar.tsx` | Left sidebar assistant/topic lists | ~150 |
| `src/renderer/src/pages/home/components/TopicList.tsx` | Topic list within sidebar | ~180 |

### Services & Hooks

| Path | Description | Lines (approx) |
|------|-------------|----------------|
| `src/renderer/src/store/newMessage.ts` | Messages Redux slice (EntityAdapter) | ~400 |
| `src/renderer/src/store/messageBlock.ts` | MessageBlocks Redux slice | ~300 |
| `src/renderer/src/store/runtime.ts` | Runtime state (editing, generating flags) | ~80 |
| `src/renderer/src/store/tabs.ts` | Tabs state (active tab, tab list) | ~120 |
| `src/renderer/src/services/MessagesService.ts` | Message CRUD operations | ~250 |
| `src/renderer/src/services/ConversationService.ts` | Conversation data loading/saving | ~200 |
| `src/renderer/src/services/StreamProcessingService.ts` | Stream chunk processing and UI state updates | ~300 |
| `src/renderer/src/services/ModelMessageService.ts` | Model message construction for API | ~200 |
| `src/renderer/src/hooks/useChatContext.ts` | Chat context provider (current assistant, topic, messages) | ~100 |
| `src/renderer/src/hooks/useMessageOperations.ts` | Message action handlers (edit, regen, delete, copy, etc.) | ~200 |
| `src/renderer/src/hooks/useTopic.ts` | Topic management hooks (create, rename, delete, pin) | ~150 |
| `src/renderer/src/types/newMessage.ts` | Message, MessageBlock type definitions | ~200 |
| `src/renderer/src/databases/index.ts` | Dexie database (topics, message_blocks tables) | ~100 |

### Total: ~454 files in `src/renderer/src/pages/home/`

---

## Source Behavior Inventory (SBI)

> Organized by sub-module due to feature size.

### Inputbar — Message Composition (B153-B166)

| ID | Behavior | Source File(s) | BR | Priority |
|----|----------|---------------|-----|----------|
| B153 | Text input with Enter-to-send (configurable: Enter or Shift+Enter via F002 settings) | `Inputbar/Inputbar.tsx` | — | MUST |
| B154 | Paste long text detection: auto-convert paste > threshold (1500 chars default) to file attachment | `Inputbar/Inputbar.tsx` | — | SHOULD |
| B155 | File attachment: drag-drop or button, supports images (inline preview), documents, and code files | `Inputbar/ToolbarActions/` | — | MUST |
| B156 | Web search toggle: per-message toggle to enable web search augmentation | `Inputbar/ToolbarActions/` | — | SHOULD |
| B157 | Knowledge base selector: choose KB for RAG injection on this message | `Inputbar/ToolbarActions/` | — | SHOULD |
| B158 | @Mention assistants: mention other assistants for multi-model completion | `Inputbar/ToolbarActions/` | — | SHOULD |
| B159 | Code block insertion: insert fenced code block into input | `Inputbar/ToolbarActions/` | — | COULD |
| B160 | Quick phrases: `/` trigger for quick phrase insertion (when enabled in settings) | `Inputbar/Inputbar.tsx` | — | COULD |
| B161 | Translate button: translate input text before sending | `Inputbar/ToolbarActions/` | — | COULD |
| B162 | Prompt library button: access saved prompts for quick insertion | `Inputbar/ToolbarActions/` | — | COULD |
| B163 | Token estimation: display estimated token count of current input (optional, from settings) | `Inputbar/TokenEstimate.tsx` | — | COULD |
| B164 | Image paste: paste image from clipboard, displays inline preview | `Inputbar/Inputbar.tsx` | — | SHOULD |
| B165 | Multi-line input: Shift+Enter (or Enter, depending on send shortcut config) for new lines | `Inputbar/Inputbar.tsx` | — | MUST |
| B166 | Input history: up/down arrows to navigate previous inputs | `Inputbar/Inputbar.tsx` | — | COULD |

### Messages — Display & Blocks (B167-B185)

| ID | Behavior | Source File(s) | BR | Priority |
|----|----------|---------------|-----|----------|
| B167 | Virtualized message list for performance with large conversations | `Messages/MessageList.tsx` | — | MUST |
| B168 | Message rendering dispatches to polymorphic MessageBlock renderers based on block.type | `Messages/MessageItem.tsx` | — | MUST |
| B169 | MainTextBlock: renders markdown content with full rich rendering pipeline | `Messages/blocks/MainTextBlock.tsx` | — | MUST |
| B170 | ThinkingBlock: collapsible chain-of-thought panel with token count badge | `Messages/blocks/ThinkingBlock.tsx` | — | MUST |
| B171 | ToolBlock: MCP tool call display — shows tool name, arguments (JSON), result, server name | `Messages/blocks/ToolBlock.tsx` | — | MUST |
| B172 | CodeBlock: syntax-highlighted code with language label, copy button, optional line numbers | `Messages/blocks/CodeBlock.tsx` | — | MUST |
| B173 | ImageBlock: image display with lightbox/zoom on click | `Messages/blocks/ImageBlock.tsx` | — | SHOULD |
| B174 | FileBlock: file attachment display with name, size, mime type, download action | `Messages/blocks/` | — | SHOULD |
| B175 | ErrorBlock: error message display with error code and retry action button | `Messages/blocks/ErrorBlock.tsx` | — | MUST |
| B176 | CitationBlock: source citation with title, URL, and excerpt | `Messages/blocks/` | — | SHOULD |
| B177 | VideoBlock: video playback with mime type detection | `Messages/blocks/` | — | COULD |
| B178 | CompactBlock: collapsed content with expand/collapse toggle | `Messages/blocks/` | — | COULD |
| B179 | TranslationBlock: translated text with target language label | `Messages/blocks/` | — | SHOULD |
| B180 | Message status indicators: PENDING/PROCESSING/SEARCHING/SUCCESS/PAUSED/ERROR states | `Messages/MessageItem.tsx` | — | MUST |
| B181 | Message actions toolbar (hover): copy, edit, regenerate, delete, branch, thumbs up/down | `Messages/MessageActions.tsx` | — | MUST |
| B182 | Token usage display: prompt_tokens, completion_tokens, total_tokens per message | `Messages/MessageItem.tsx` | — | SHOULD |
| B183 | Message metrics display: latency (TTFT), total time, tokens/second | `Messages/MessageItem.tsx` | — | SHOULD |
| B184 | Multi-model message display: fold/horizontal/vertical layout for multi-model responses | `Messages/MultiModelView.tsx` | — | SHOULD |
| B185 | Message timestamp display: optional per-role timestamps (user and/or assistant) | `Messages/MessageItem.tsx` | — | COULD |

### Markdown — Rich Rendering (B186-B195)

| ID | Behavior | Source File(s) | BR | Priority |
|----|----------|---------------|-----|----------|
| B186 | Full markdown rendering: headings, bold, italic, lists, links, blockquotes, horizontal rules | `Markdown/Markdown.tsx` | — | MUST |
| B187 | Syntax highlighting: Prism or Shiki engine (configurable in settings), auto language detection | `Markdown/CodeHighlighter.tsx` | — | MUST |
| B188 | Math rendering: KaTeX or MathJax engine (configurable), inline `$...$` and block `$$...$$` | `Markdown/MathRenderer.tsx` | — | SHOULD |
| B189 | Mermaid diagram rendering: fenced code blocks with `mermaid` language tag | `Markdown/MermaidDiagram.tsx` | — | SHOULD |
| B190 | Table rendering: enhanced tables with optional sorting and horizontal scroll | `Markdown/TableRenderer.tsx` | — | SHOULD |
| B191 | Code block features: copy button, collapsible (optional), line wrapping (optional), line numbers (optional) | `Markdown/CodeHighlighter.tsx` | — | MUST |
| B192 | Link handling: external links open in default browser, internal links navigate in-app | `Markdown/Markdown.tsx` | — | MUST |
| B193 | Image rendering within markdown: inline images with lazy loading | `Markdown/Markdown.tsx` | — | SHOULD |
| B194 | Custom markdown plugins: extensible plugin system for additional rendering | `Markdown/plugins/` | — | COULD |
| B195 | Render user input as markdown: optional setting to render user messages as markdown (default: plain) | `Markdown/Markdown.tsx` | — | SHOULD |

### Topics — Conversation Management (B196-B207)

| ID | Behavior | Source File(s) | BR | Priority |
|----|----------|---------------|-----|----------|
| B196 | Create new topic under current assistant with uuid, default name "New Topic" | `hooks/useTopic.ts` | — | MUST |
| B197 | Topic auto-naming: after first assistant response, LLM summarizes last 5 messages to generate topic name | `services/MessagesService.ts` | BR-011 | MUST |
| B198 | Auto-naming uses `quickModel` (lightweight/fast model from settings), runs asynchronously | `services/MessagesService.ts` | BR-011 | MUST |
| B199 | Auto-naming fallback: if LLM summarization fails, truncate first user message as name | `services/MessagesService.ts` | BR-011 | MUST |
| B200 | Manual topic rename: user can override auto-generated name, sets `isNameManuallySet = true` | `hooks/useTopic.ts` | — | MUST |
| B201 | Pin topic to top of topic list (persisted) | `hooks/useTopic.ts` | — | SHOULD |
| B202 | Delete topic with confirmation — removes topic and all owned messages/blocks | `hooks/useTopic.ts` | — | MUST |
| B203 | Clear topic messages — keeps topic, removes all messages | `hooks/useTopic.ts` | — | SHOULD |
| B204 | Topic list ordering: pinned first, then by updatedAt descending | `components/TopicList.tsx` | — | MUST |
| B205 | Topic switching: click topic loads conversation history, scrolls to bottom | `hooks/useTopic.ts` | — | MUST |
| B206 | Topic context menu: rename, pin/unpin, clear, delete | `components/TopicList.tsx` | — | MUST |
| B207 | Branch conversation: create new topic forked from a specific message point | `hooks/useMessageOperations.ts` | — | SHOULD |

### Streaming & Runtime (B208-B218)

| ID | Behavior | Source File(s) | BR | Priority |
|----|----------|---------------|-----|----------|
| B208 | Send message triggers F004-ai-core completion, creates PENDING assistant message | `services/MessagesService.ts` | BR-004 | MUST |
| B209 | Stream chunks from F004 update message blocks in real-time (text-delta -> append to MainTextBlock) | `services/StreamProcessingService.ts` | BR-009 | MUST |
| B210 | Thinking chunks create/update ThinkingBlock with progressive content | `services/StreamProcessingService.ts` | BR-009 | MUST |
| B211 | Tool-call chunks create ToolBlock with name, arguments; tool-result updates with result | `services/StreamProcessingService.ts` | BR-009 | MUST |
| B212 | Usage chunk updates Message.usage (prompt_tokens, completion_tokens, total_tokens) | `services/StreamProcessingService.ts` | BR-009 | MUST |
| B213 | Finish chunk transitions message status to SUCCESS, calculates metrics | `services/StreamProcessingService.ts` | BR-009 | MUST |
| B214 | Error chunk transitions message status to ERROR, creates ErrorBlock | `services/StreamProcessingService.ts` | BR-009 | MUST |
| B215 | Pause/resume streaming: user can pause generation, message enters PAUSED state | `services/StreamProcessingService.ts` | — | SHOULD |
| B216 | Auto-scroll during streaming: scrolls to bottom as content grows (configurable) | `Messages/MessageList.tsx` | — | MUST |
| B217 | Cancel generation: stop button aborts active stream, message status -> ERROR or partial SUCCESS | `services/StreamProcessingService.ts` | — | MUST |
| B218 | Runtime state: `generating` flag tracks whether any generation is in progress | `store/runtime.ts` | — | MUST |

### Message Operations (B219-B228)

| ID | Behavior | Source File(s) | BR | Priority |
|----|----------|---------------|-----|----------|
| B219 | Copy message content to clipboard (full text or selected block) | `hooks/useMessageOperations.ts` | — | MUST |
| B220 | Edit user message: inline edit, resend triggers new completion replacing subsequent messages | `hooks/useMessageOperations.ts` | — | MUST |
| B221 | Regenerate assistant message: re-sends original user prompt, replaces assistant response | `hooks/useMessageOperations.ts` | — | MUST |
| B222 | Delete message: remove single message from conversation | `hooks/useMessageOperations.ts` | — | MUST |
| B223 | Feedback: thumbs up/down on assistant messages, stored as `message.useful` boolean | `hooks/useMessageOperations.ts` | — | SHOULD |
| B224 | Message search: filter visible messages by text query | `hooks/useMessageOperations.ts` | — | SHOULD |
| B225 | Export conversation: export topic messages as markdown, PDF, or image | `hooks/useMessageOperations.ts` | — | COULD |
| B226 | Multi-model send: @mentioned assistants receive same prompt, responses displayed per layout style | `services/ModelMessageService.ts` | — | SHOULD |
| B227 | Message divider: optional visual divider between messages (configurable in settings) | `Messages/MessageItem.tsx` | — | COULD |
| B228 | Preserve line breaks: optional setting to preserve newlines in rendered messages | `Markdown/Markdown.tsx` | — | SHOULD |

### Tabs (B229-B232)

| ID | Behavior | Source File(s) | BR | Priority |
|----|----------|---------------|-----|----------|
| B229 | Tab bar with add/close/reorder tabs for parallel conversations | `Tabs/TabBar.tsx` | — | SHOULD |
| B230 | Each tab maintains independent assistant + topic context | `store/tabs.ts` | — | SHOULD |
| B231 | Tab persistence: open tabs survive app restart | `store/tabs.ts` | — | SHOULD |
| B232 | Default tab: Home tab always present, cannot be closed | `Tabs/TabBar.tsx` | — | SHOULD |

### Data Persistence (B233-B237)

| ID | Behavior | Source File(s) | BR | Priority |
|----|----------|---------------|-----|----------|
| B233 | Topics persisted to Dexie (IndexedDB) `topics` table | `databases/index.ts` | — | MUST |
| B234 | MessageBlocks persisted to Dexie `message_blocks` table | `databases/index.ts` | — | MUST |
| B235 | Messages persisted via Redux/Zustand EntityAdapter with persist middleware | `store/newMessage.ts` | — | MUST |
| B236 | Conversation load: on topic switch, load messages + blocks from persistence | `services/ConversationService.ts` | — | MUST |
| B237 | Message block status transitions persisted: PENDING -> PROCESSING -> STREAMING -> SUCCESS/ERROR | `store/messageBlock.ts` | — | MUST |

---

## Environment Variables

| Variable | Purpose | Used By |
|----------|---------|--------|
| None directly | F006 reads display config from F002 settings | — |

### Settings Dependencies (from F002)

| Setting | Impact on F006 |
|---------|---------------|
| `sendMessageShortcut` | Enter vs Shift+Enter for send |
| `messageStyle` | "plain" vs "bubble" message layout |
| `showMessageDivider` | Divider between messages |
| `autoScrollEnabled` | Auto-scroll during streaming |
| `renderInputMessageAsMarkdown` | Render user messages as markdown |
| `preserveLineBreaks` | Newline handling in rendering |
| `codeShowLineNumbers` | Line numbers in code blocks |
| `codeCollapsible` | Collapsible code blocks |
| `codeWrapping` | Code line wrapping |
| `codeEditor` | Prism vs Shiki highlighting engine |
| `codeTheme` | Code block color theme |
| `mathEngine` | KaTeX vs MathJax |
| `fontSize` | Base font size |
| `pasteLongTextAsFile` | Long paste -> file conversion |
| `pasteLongTextThreshold` | Character threshold for long paste |
| `multiModelMessageStyle` | fold/horizontal/vertical layout |
| `showInputEstimatedTokens` | Token estimate in input bar |
| `topicPosition` | Topic list left vs right placement |
| `userMessageTimestamp` | Show user message timestamps |
| `assistantMessageTimestamp` | Show assistant message timestamps |

---

## For /speckit.specify

### Entity Ownership

F006 owns:
- **Topic** — Conversation thread entity (see entity-registry.md)
- **Message** — Single message with blocks, usage, metrics (see entity-registry.md)
- **MessageBlock** — 11 polymorphic variants (see entity-registry.md)
- **QuickPhrase** — Reusable text snippets for input

F006 references (read-only):
- **Assistant** (F005) — conversation context
- **Model** (F003) — model display in messages
- **Provider** (F003) — provider capabilities for rendering decisions

### Business Rules Owned

BR-004 (Message Preparation Pipeline — shared with F004), BR-009 (Stream Processing — shared with F004), BR-011 (Topic Auto-Naming), BR-012 (Rate Limiting — shared with F004).

### Acceptance Criteria Focus

1. User can send a message and see a streamed assistant response with real-time text rendering
2. All 11 MessageBlock types render correctly in their respective components
3. Topics can be created, renamed, pinned, deleted, and auto-named
4. Input toolbar actions (attach, web search, KB, mention, code) function correctly
5. Message operations (copy, edit, regenerate, delete, feedback) work as expected
6. Multi-model send displays results in configured layout style
7. Markdown rendering handles code, math, mermaid, tables, and links
8. Streaming can be paused, resumed, and cancelled
9. Data persists across app restarts (topics, messages, blocks)
10. Auto-scroll works during streaming and can be disabled

---

## For /speckit.plan

### Migration Impact

- **UI Impact**: HIGH — This is the most complex UI feature. Every component uses AntD + Styled Components and must be rewritten with Tailwind + shadcn/ui.
- **State Impact**: HIGH — Four Redux slices (`messages`, `messageBlock`, `runtime`, `tabs`) migrate to `useChatStore` (Zustand). EntityAdapter pattern must be replicated or replaced.
- **Total Effort**: F006 alone represents ~30% of the entire migration effort.

### Implementation Order

1. **Phase 1**: Chat types (`Topic`, `Message`, `MessageBlock` + 11 variants) and `useChatStore` (Zustand)
2. **Phase 2**: Dexie database schema (topics, message_blocks tables)
3. **Phase 3**: Core services (MessagesService, ConversationService, StreamProcessingService)
4. **Phase 4**: Message display — MessageList, MessageItem, MainTextBlock, ErrorBlock (minimum viable)
5. **Phase 5**: Input bar — basic text input + send + attachment
6. **Phase 6**: Markdown rendering pipeline (code highlighting, math, mermaid)
7. **Phase 7**: Remaining MessageBlock renderers (Thinking, Tool, Code, Image, etc.)
8. **Phase 8**: Topic management UI (TopicList, create, rename, delete, auto-name)
9. **Phase 9**: Message operations (edit, regenerate, delete, copy, feedback)
10. **Phase 10**: Tab system, multi-model display, advanced input toolbar actions

### Dependencies to Resolve First

- F004-ai-core must provide `sendCompletion()` API for streaming
- F005-assistant must provide `useAssistantStore` for assistant context
- F003-provider must provide `Model` type for model display
- F002-settings must provide all display-related settings
- F001-app-shell must provide IPC channels and window context

### Zustand Store Design

```typescript
// useChatStore — absorbs Cherry's messages, messageBlock, runtime, tabs slices
interface ChatStore {
  // Messages (EntityAdapter-like)
  messages: Record<string, Message>
  messageIds: string[]
  // Blocks (EntityAdapter-like)
  blocks: Record<string, MessageBlock>
  // Runtime
  generating: boolean
  editing: boolean
  // Tabs
  tabs: TabItem[]
  activeTabId: string
  // Actions
  addMessage: (message: Message) => void
  updateMessage: (id: string, updates: Partial<Message>) => void
  deleteMessage: (id: string) => void
  addBlock: (block: MessageBlock) => void
  updateBlock: (id: string, updates: Partial<MessageBlock>) => void
  appendBlockContent: (id: string, delta: string) => void
  setGenerating: (value: boolean) => void
  // Topic actions
  createTopic: (assistantId: string) => Topic
  renameTopic: (id: string, name: string) => void
  deleteTopic: (id: string) => void
  pinTopic: (id: string) => void
}
```

### AntD -> shadcn/ui Component Mapping for F006

| AntD Usage | shadcn/ui Replacement | Notes |
|------------|----------------------|-------|
| Modal (confirm delete) | AlertDialog | Confirmation dialogs |
| Dropdown (context menus) | DropdownMenu / ContextMenu | Topic + message context menus |
| Tooltip (action buttons) | Tooltip | Hover hints on toolbar buttons |
| Popover (model selector) | Popover / Combobox | Model dropdown in header |
| Button (send, toolbar) | Button | Various button variants |
| Input (search, rename) | Input | Search and rename inputs |
| Avatar (assistant icon) | Avatar | Assistant emoji display |
| Badge (topic count) | Badge | Count indicators |
| Tabs (assistants/topics) | Tabs | Sidebar tab switching |
| Collapse (thinking block) | Accordion / Collapsible | Thinking block expand/collapse |
| Notification (rate limit) | Toast (sonner) | Rate limit warnings |
| Divider (message divider) | Separator | Between messages |

### Sub-Module Implementation Priority

Given the massive size, organize by sub-module:

| Priority | Sub-Module | Rationale |
|----------|-----------|-----------|
| P1 | Messages (core blocks) | Required to display any chat output |
| P2 | Inputbar (basic) | Required to send any message |
| P3 | Topics (core) | Required to manage conversations |
| P4 | Streaming integration | Required for real-time response |
| P5 | Markdown | Required for rich content display |
| P6 | Message operations | Essential UX operations |
| P7 | Tabs | Parallel conversations |
| P8 | Advanced input tools | Enhancement layer |

---

## Feature Contracts

### Provided Contracts (F006 exposes)

| Contract | Consumer(s) | Description |
|----------|-------------|-------------|
| `useChatStore.messages` | F010-backup-sync | Message data for backup |
| `useChatStore.blocks` | F010-backup-sync | Block data for backup |
| `Topic` type | F005-assistant (embedded) | Topic entity definition |
| `Message` / `MessageBlock` types | F004-ai-core | Message types for completion pipeline |
| Chat UI components | F001-app-shell (routing) | Rendered at `#/` route |

### Required Contracts (F006 depends on)

| Contract | Provider | Description |
|----------|----------|-------------|
| `sendCompletion(config, options): AsyncIterable<StreamChunk>` | F004-ai-core | AI completion with streaming |
| `prepareMessages(messages, assistant): Message[]` | F004-ai-core | Message preparation for API |
| `useAssistantStore.getAssistantById(id)` | F005-assistant | Resolve current assistant |
| `useAssistantStore.defaultAssistant` | F005-assistant | Fallback assistant |
| `Model` / `Provider` types | F003-provider | Model display and capability checks |
| Display settings (20+ settings) | F002-settings | All rendering configuration |
| IPC channels | F001-app-shell | File operations, clipboard, notifications |
| `quickModel` setting | F002-settings | Model for topic auto-naming |

### Naming Remapping

| Cherry Studio | Angdu Studio |
|---------------|--------------|
| `cherry-studio` references | `angdu-studio` |
| `cs:` IPC prefix | `as:` IPC prefix |
| `CSLOGGER` | `ASLOGGER` |
