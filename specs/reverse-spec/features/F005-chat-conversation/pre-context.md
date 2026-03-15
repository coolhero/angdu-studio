# F005 - chat-conversation: Pre-Context

## 1. Runtime Exploration Results

| Observation | Value | Relevance |
|---|---|---|
| Home screen | Default landing page, main chat UI | Chat is the primary screen |
| Assistants panel width | 210px | Left panel showing assistant list |
| Navbar height | 44px | Chat area = window height - navbar height |
| navbarPosition | "top" | Chat layout adjusts based on nav mode |
| Window size | 960x600 | Chat must be usable at this minimum size |
| Hash routing | #/ (home) | Chat lives at root route |

**Screens owned**: Home page (chat UI), assistant list panel, chat message area, message input (rich editor), topic sidebar, assistant management.

## 2. Source Reference

| File Path | Role | Rebuild Target |
|---|---|---|
| src/renderer/src/pages/home/ | Home/chat page directory | [TBD] |
| src/renderer/src/store/assistants.ts | Assistant state (Redux slice) | [TBD] |
| src/renderer/src/store/newMessage.ts | Message composition state | [TBD] |
| src/renderer/src/store/messageBlock.ts | Message block state (streaming blocks) | [TBD] |
| src/renderer/src/services/ConversationService.ts | Conversation orchestration | [TBD] |
| src/renderer/src/services/MessagesService.ts | Message CRUD and formatting | [TBD] |
| src/renderer/src/services/StreamProcessingService.ts | SSE/stream parsing and processing | [TBD] |
| src/renderer/src/services/ModelMessageService.ts | Model-specific message formatting | [TBD] |
| src/renderer/src/hooks/useAssistant.ts | Assistant selection and management hook | [TBD] |
| src/renderer/src/hooks/useTopic.ts | Topic management hook | [TBD] |
| src/renderer/src/hooks/useChatContext.ts | Chat context aggregation hook | [TBD] |
| src/renderer/src/components/RichEditor/ | TipTap rich text editor for message input | [TBD] |
| src/renderer/src/databases/index.ts | IndexedDB (Dexie) for topics/messages | [TBD] |
| src/renderer/src/types/index.d.ts | Message/Block/Assistant type definitions | [TBD] |

## 3. Source Behavior Inventory

| ID | File | Behavior | Priority |
|---|---|---|---|
| B111 | pages/home/ | Render three-column layout: assistants panel, chat area, topic sidebar | P1 |
| B112 | pages/home/ | Assistant list panel with search and categories | P1 |
| B113 | pages/home/ | Chat header with assistant name, model selector, topic info | P1 |
| B114 | pages/home/ | Message list with auto-scroll to bottom | P1 |
| B115 | pages/home/ | Message input area with rich editor | P1 |
| B116 | pages/home/ | Send button and keyboard shortcut (Enter or Ctrl+Enter) | P1 |
| B117 | pages/home/ | Topic sidebar toggle (show/hide) | P2 |
| B118 | assistants.ts | Store assistant list with default assistant | P1 |
| B119 | assistants.ts | Add/edit/delete assistant | P1 |
| B120 | assistants.ts | Assistant properties: name, prompt, model, temperature, etc. | P1 |
| B121 | assistants.ts | Assistant categories/groups | P2 |
| B122 | assistants.ts | Default assistant with system prompt | P1 |
| B123 | assistants.ts | Assistant import/export | P3 |
| B124 | newMessage.ts | Compose message with text and attachments | P1 |
| B125 | newMessage.ts | Clear composition after send | P1 |
| B126 | newMessage.ts | Draft persistence (unsent message per topic) | P2 |
| B127 | messageBlock.ts | Create message blocks for streaming response | P1 |
| B128 | messageBlock.ts | Update block content as stream chunks arrive | P1 |
| B129 | messageBlock.ts | Block types: text, code, thinking, tool-use, image, error | P1 |
| B130 | messageBlock.ts | Block status: pending, streaming, complete, error | P1 |
| B131 | ConversationService.ts | Send message flow: compose → format → API call → stream → store | P1 |
| B132 | ConversationService.ts | Conversation context management (history windowing) | P1 |
| B133 | ConversationService.ts | Stop generation (abort stream) | P1 |
| B134 | ConversationService.ts | Regenerate last response | P1 |
| B135 | ConversationService.ts | Edit and resend previous message | P2 |
| B136 | ConversationService.ts | Multi-model response (compare mode) | P3 |
| B137 | MessagesService.ts | Store messages in IndexedDB per topic | P1 |
| B138 | MessagesService.ts | Load message history for topic | P1 |
| B139 | MessagesService.ts | Delete message | P2 |
| B140 | MessagesService.ts | Copy message content | P2 |
| B141 | MessagesService.ts | Message formatting (markdown rendering) | P1 |
| B142 | StreamProcessingService.ts | Parse SSE stream from provider API | P1 |
| B143 | StreamProcessingService.ts | Handle stream errors mid-response | P1 |
| B144 | StreamProcessingService.ts | Token counting during stream | P2 |
| B145 | StreamProcessingService.ts | Stream abort via AbortController | P1 |
| B146 | ModelMessageService.ts | Format messages for provider API (role, content blocks) | P1 |
| B147 | ModelMessageService.ts | Attach system prompt from assistant config | P1 |
| B148 | ModelMessageService.ts | Handle vision messages (image attachments) | P2 |
| B149 | useAssistant.ts | Select active assistant | P1 |
| B150 | useAssistant.ts | Get assistant's model and settings | P1 |
| B151 | useTopic.ts | Create new topic (conversation thread) | P1 |
| B152 | useTopic.ts | Switch between topics | P1 |
| B153 | useTopic.ts | Delete topic with all messages | P1 |
| B154 | useTopic.ts | Rename topic | P2 |
| B155 | useTopic.ts | Auto-generate topic title from first message | P2 |
| B156 | useChatContext.ts | Aggregate chat context (assistant, model, topic, messages) | P1 |
| B157 | RichEditor/ | TipTap editor with markdown shortcuts | P1 |
| B158 | RichEditor/ | File/image paste and drag-drop | P2 |
| B159 | RichEditor/ | @ mention for model/assistant switching | P3 |
| B160 | databases/index.ts | Dexie IndexedDB schema for topics and messages | P1 |

## 4. UI Component Features

| Source Component | Library | Usage | New Stack Equivalent |
|---|---|---|---|
| TipTap Editor | @tiptap/react | Rich text message input | TipTap (keep, framework-agnostic) |
| List | AntD List | Assistant list, message list | shadcn/ui custom list / virtual list |
| Avatar | AntD Avatar | Assistant and user avatars | shadcn/ui Avatar |
| Button | AntD Button | Send, stop, regenerate, copy | shadcn/ui Button |
| Dropdown | AntD Dropdown | Model selector, message actions | shadcn/ui DropdownMenu |
| Tooltip | AntD Tooltip | Action button tooltips | shadcn/ui Tooltip |
| Input.Search | AntD Input.Search | Assistant search | shadcn/ui Input with search icon |
| Modal | AntD Modal | Delete confirmation, assistant edit | shadcn/ui Dialog |
| Drawer | AntD Drawer | Topic sidebar on mobile/narrow | shadcn/ui Sheet |
| Spin | AntD Spin | Loading indicator during stream | shadcn/ui Spinner |
| Typography | AntD Typography | Message text rendering | Tailwind4 prose / typography |
| Markdown renderer | react-markdown or similar | Message content rendering | react-markdown (keep) |
| Code block | highlight.js or Prism | Code syntax highlighting | Shiki or Prism (evaluate) |
| Popover | AntD Popover | Quick actions, emoji picker | shadcn/ui Popover |
| Tag | AntD Tag | Model capability tags, topic tags | shadcn/ui Badge |
| Empty | AntD Empty | Empty state (no messages, no topics) | shadcn/ui custom empty state |

## 5. Interaction Behavior Inventory

| Interaction | Trigger | Behavior |
|---|---|---|
| Send message | Press send key (Enter or Ctrl+Enter) | Send message, show streaming response |
| Stop generation | Click stop button | Abort stream, show partial response |
| Regenerate | Click regenerate button | Re-send last user message, replace last assistant response |
| Copy message | Click copy on message | Copy message content to clipboard |
| Edit message | Click edit on user message | Open message in editor, resend on confirm |
| Delete message | Click delete on message | Remove message with confirmation |
| New topic | Click + button in topic sidebar | Create new empty topic |
| Switch topic | Click topic in sidebar | Load topic's message history |
| Delete topic | Right-click → delete topic | Remove topic and all messages |
| Select assistant | Click assistant in left panel | Set active assistant, update system prompt |
| Create assistant | Click + in assistant panel | Open assistant creation form |
| Model switch | Click model selector in chat header | Change model for current assistant |
| Image paste | Paste image in editor | Attach as vision input (if model supports) |
| File drag-drop | Drop file onto editor | Attach file to message |
| Scroll to bottom | New message arrives | Auto-scroll if user was at bottom |
| Scroll up | Scroll up in message list | Disable auto-scroll, show "scroll to bottom" button |
| Quick phrase | Type trigger or click menu | Insert predefined text snippet |
| Message hover | Hover over message | Show action buttons (copy, edit, delete, regenerate) |

## 6. Foundation Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Message storage | better-sqlite3 (new stack) | Replaces IndexedDB/Dexie; better for large conversation history |
| Rich editor | TipTap (keep from source) | Framework-agnostic, extensible, markdown support |
| Markdown render | react-markdown + rehype | Standard, extensible |
| Code highlighting | Shiki (evaluate) or Prism | Better theme support than highlight.js |
| Virtual scrolling | @tanstack/react-virtual | Performance for long conversation history |
| State management | Zustand (new stack) | Replaces Redux slices |
| Stream processing | ReadableStream / AsyncIterator | Modern streaming pattern |

## 7. Foundation Dependencies

| Relationship | Item | Direction |
|---|---|---|
| **owns** | Chat UI and message rendering | F005 exclusive |
| **owns** | Assistant management | F005 exclusive |
| **owns** | Topic/conversation management | F005 exclusive |
| **owns** | Message composition and sending | F005 exclusive |
| **owns** | Stream processing and display | F005 exclusive |
| **owns** | Message storage (topics + messages) | F005 exclusive |
| **consumes** | AI Core Interface | From F004 (send messages, receive streams) |
| **consumes** | Model Registry | From F004 (model selection, capabilities) |
| **consumes** | Provider Config | From F004 (API endpoints for requests) |
| **consumes** | Navigation/Tab API | From F002 (chat as tab, topic as tab) |
| **consumes** | IPC bridge | From F001 (file storage, clipboard, shell) |
| **consumes** | Settings | From F003 (sendKey, fontSize, messageStyle, quickPhrases) |
| **consumes** | Config API | From F001 (persist assistant configs) |

## 8. Naming Remapping

| Source Identifier | Target Identifier | Location |
|---|---|---|
| CherryStudio assistant names | AngduStudio | Default assistant naming |
| cherry-studio message format | angdu-studio message format | Storage schema |
| CherryIN references | Remove | Any Cherry-specific branding in chat |
| Default system prompts mentioning Cherry | Update to Angdu | Assistant default prompts |

## 9. Static Resources

| Resource | Path | Usage |
|---|---|---|
| Default assistant avatars | src/renderer/src/assets/avatars/ | Assistant avatar images |
| Emoji data | (bundled or CDN) | Emoji picker in chat |
| i18n chat strings | src/renderer/src/i18n/ | Chat UI labels, placeholders, tooltips |
| Code themes | (CSS) | Code block syntax highlighting themes |
| Empty state illustrations | src/renderer/src/assets/ | Empty chat, empty topic list |

## 10. Environment Variables

| Variable | Usage | Feature |
|---|---|---|
| ANGDU_MAX_CONTEXT_LENGTH | Override max context window | ConversationService |
| ANGDU_STREAM_TIMEOUT | Stream response timeout (ms) | StreamProcessingService |
| ANGDU_DEFAULT_SYSTEM_PROMPT | Default system prompt for new assistants | assistants.ts |

## 11. Feature Contracts

### Provides
- **Chat UI**: Primary user-facing screen → standalone (root route)
- **Assistant API**: CRUD assistants, get active assistant → internal use
- **Topic API**: CRUD topics, get messages for topic → internal use
- **Message Storage**: Persist and query conversation history → F003 (data export)
- **Conversation Context**: Current assistant + model + messages → internal use

### Requires
- **From F001**: IPC bridge (clipboard for copy, shell for links, file storage for attachments)
- **From F001**: Config API (persist assistant configs, topic metadata)
- **From F002**: Navigation (home route, tab management for multiple chats)
- **From F003**: Settings (sendKey, fontSize, messageStyle, quickPhrases, theme)
- **From F004**: AI Core Interface (chat/stream API)
- **From F004**: Model Registry (model list, capabilities for UI adaptation)
- **From F004**: Provider Config (which provider/model to use for API calls)

## 12. For /speckit.specify

### Draft Functional Requirements
- FR-035: Chat must display messages in chronological order with user/assistant distinction
- FR-036: Streaming responses must render incrementally as chunks arrive
- FR-037: User must be able to stop generation mid-stream
- FR-038: User must be able to regenerate the last assistant response
- FR-039: User must be able to edit and resend a previous message
- FR-040: Assistants must be configurable with name, system prompt, model, and parameters
- FR-041: Topics must organize conversations; switching topics loads history
- FR-042: Topic title must be auto-generated from first message exchange
- FR-043: Rich editor must support markdown shortcuts, image paste, file drop
- FR-044: Message actions (copy, edit, delete, regenerate) must be accessible on hover
- FR-045: Chat must respect sendKey setting from F003
- FR-046: Assistant panel must support search and categorization
- FR-047: Message blocks must render differently by type (text, code, thinking, error)
- FR-048: Conversation history must be windowed to respect model context limits

### Draft Success Criteria
- SC-016: First stream token visible < 500ms after send (network permitting)
- SC-017: Stream rendering maintains 60fps (no jank during streaming)
- SC-018: Topic switch with 500 messages loads in < 1 second
- SC-019: 10,000+ messages in storage does not degrade app performance
- SC-020: Copy message copies clean markdown without UI artifacts

### Edge Cases
- Stream interrupted by network error → show partial response with error indicator, option to retry
- Model returns empty response → show "empty response" message
- Very long message → virtual scrolling, lazy markdown rendering
- Image paste with non-vision model → show warning, allow send as text-only
- Topic with 0 messages → show empty state with suggested prompts
- Concurrent stream requests → queue or reject with message
- Message with mixed content (text + code + images) → render each block type correctly
- Assistant deleted while in use → fallback to default assistant
- Model removed while conversation active → show model unavailable warning
- Paste very large text → warn about token count, offer to truncate
- Offline mode → show cached conversations, disable send

## 13. For /speckit.plan

### Dependencies
- @tiptap/react + extensions (rich editor)
- react-markdown + rehype-* (markdown rendering)
- Shiki or Prism (code highlighting)
- @tanstack/react-virtual (virtual scrolling)
- Zustand (state management)
- better-sqlite3 via F001 (message/topic storage)
- Vercel AI SDK or ai-core from F004 (streaming)

### Entity Drafts
- **Assistant**: { id, name, systemPrompt, modelId, providerId, temperature, topP, maxTokens, category, avatar, isDefault, createdAt }
- **Topic**: { id, assistantId, title, lastMessageAt, messageCount, createdAt }
- **Message**: { id, topicId, role: "user"|"assistant"|"system", content, blocks[], createdAt, tokenCount? }
- **MessageBlock**: { id, messageId, type: "text"|"code"|"thinking"|"tool_use"|"image"|"error", content, language?, status }
- **Draft**: { topicId, content, attachments[] }

### API Drafts
- Store: `useAssistantStore` — assistants[], activeAssistantId, addAssistant, updateAssistant, deleteAssistant
- Store: `useTopicStore` — topics[], activeTopicId, createTopic, deleteTopic, renameTopic
- Store: `useMessageStore` — messages[] (for active topic), addMessage, updateMessage, deleteMessage
- Store: `useChatStore` — isStreaming, abortController, sendMessage, stopGeneration, regenerate
- Service: `ConversationService.send(assistant, topic, message)` → stream handling
- DB: `MessagesDB.getByTopic(topicId, offset, limit)`, `.insert(message)`, `.delete(id)`

### Tech Decisions
- better-sqlite3 for messages/topics (replaces Dexie/IndexedDB) — better query, larger capacity
- Zustand for all chat state (replaces Redux slices)
- TipTap for rich editor (keep from source)
- @tanstack/react-virtual for message list performance
- Shiki for code highlighting (better theme integration with Tailwind)

## 14. For /speckit.analyze

### Cross-Feature Verification Points
- F005↔F001: File storage API must handle attachment persistence; clipboard API for copy
- F005↔F002: Chat tabs must preserve scroll position and draft when switching; home route must load correctly
- F005↔F003: sendKey, fontSize, messageStyle, quickPhrases must reactively apply to chat UI
- F005↔F003: Data export must include all conversations, topics, messages, and assistants
- F005↔F004: Model switching must immediately affect next message; capabilities must drive UI (vision, function calling)
- F005↔F004: Stream processing must handle all provider response formats via ai-core normalization
- F005↔F004: Token counting must use model-specific tokenizer
- Message storage migration: source uses IndexedDB/Dexie → rebuild uses better-sqlite3; migration path needed for data import
- Performance: streaming + rendering + state updates must not cause frame drops
- Assistant system prompts must not contain Cherry-specific references in defaults
