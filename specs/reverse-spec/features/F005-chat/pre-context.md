# F005-chat Pre-Context

> Feature: Chat UI, message handling, streaming responses, topic/conversation management, message input toolbar, message actions
> Tier: 1 | Screen: `#/` (Home - main chat interface)
> Dependencies: F001-shell, F003-providers, F004-assistants

---

## 1. Runtime Exploration Results

| Screen / Route | What Happens | Key Observation |
|---|---|---|
| `#/` (Home) main area | Three-column layout: assistants sidebar (left), chat area (center), topics sidebar (right or left) | Layout controlled by `topicPosition`, `showAssistants`, `showTopics` settings |
| Chat area - Messages | Virtualized message list with infinite scroll, message groups (user+assistant pairs), context indicator | Uses `displayCount`, `LOAD_MORE_COUNT` for pagination |
| Chat area - Inputbar | Multi-line input with toolbar: file attach, web search, knowledge base, @mention models, code block | Tool system with registry, drag-reorder, scope-based filtering |
| Chat area - Navbar | Top bar with model selector, assistant name, search button | `ChatNavBar` component |
| Message actions | Hover menubar: copy, edit, delete, regenerate, translate, branch, export | `MessageMenubar` with configurable button registry |

## 2. Source Reference

| File Path (cherry-studio) | Role | Rebuild Target |
|---|---|---|
| `src/renderer/src/pages/home/HomePage.tsx` | Home page layout: assistant sidebar + chat + topics | `[TBD]` |
| `src/renderer/src/pages/home/Chat.tsx` | Chat container: messages + inputbar + navbar | `[TBD]` |
| `src/renderer/src/pages/home/Messages/Messages.tsx` | Message list with infinite scroll, grouped display | `[TBD]` |
| `src/renderer/src/pages/home/Messages/MessageGroup.tsx` | User+assistant message pair rendering | `[TBD]` |
| `src/renderer/src/pages/home/Messages/MessageMenubar.tsx` | Message action buttons (copy, edit, delete, regenerate, translate) | `[TBD]` |
| `src/renderer/src/pages/home/Messages/MessageContent.tsx` | Message content rendering (markdown) | `[TBD]` |
| `src/renderer/src/pages/home/Messages/MessageEditor.tsx` | Inline message editing | `[TBD]` |
| `src/renderer/src/pages/home/Inputbar/Inputbar.tsx` | Input area: text input, file handling, send logic | `[TBD]` |
| `src/renderer/src/pages/home/Inputbar/InputbarTools.tsx` | Toolbar with draggable tools (file, search, KB, mention, etc.) | `[TBD]` |
| `src/renderer/src/pages/home/Inputbar/MentionModelsInput.tsx` | @mention models for multi-model responses | `[TBD]` |
| `src/renderer/src/pages/home/Inputbar/KnowledgeBaseInput.tsx` | Knowledge base selection for RAG | `[TBD]` |
| `src/renderer/src/pages/home/Inputbar/TokenCount.tsx` | Estimated token count display | `[TBD]` |
| `src/renderer/src/pages/home/Inputbar/SendMessageButton.tsx` | Send/stop button with shortcut label | `[TBD]` |
| `src/renderer/src/pages/home/Inputbar/AttachmentPreview.tsx` | Preview attached files | `[TBD]` |
| `src/renderer/src/store/newMessage.ts` | Redux slice: normalized message entity state, topic-message mapping | `[TBD]` |
| `src/renderer/src/store/messageBlock.ts` | Redux slice: normalized message blocks (text, thinking, citations, tools, images) | `[TBD]` |
| `src/renderer/src/services/MessagesService.ts` | Message creation, context count, file deletion, rate limiting | `[TBD]` |
| `src/renderer/src/hooks/useMessageOperations.ts` | Hook: delete, edit, resend, regenerate, translate, branch, pause | `[TBD]` |
| `src/renderer/src/types/newMessage.ts` | Message, MessageBlock union types, status enums | `[TBD]` |
| `src/renderer/src/pages/home/Messages/Blocks/` | Block renderers for each MessageBlockType | `[TBD]` |
| `src/renderer/src/pages/home/Navbar.tsx` | Home page top navbar | `[TBD]` |
| `src/renderer/src/pages/home/Tabs/` | Home page tabs (assistants/topics) | `[TBD]` |

## 3. Source Behavior Inventory (SBI)

| ID | Behavior | Source Location | Category |
|---|---|---|---|
| B139 | `messagesAdapter` creates normalized entity state for messages with `messageIdsByTopic` map | `store/newMessage.ts:27-45` | state |
| B140 | `setCurrentTopicId` sets active topic, initializes empty arrays if new | `store/newMessage.ts:103-109` | mutation |
| B141 | `messagesReceived` upserts messages and sets topic message order | `store/newMessage.ts:121-127` | mutation |
| B142 | `addMessage` appends message to entity and topic ID list | `store/newMessage.ts:128-141` | mutation |
| B143 | `insertMessageAtIndex` inserts at specific position with bounds safety | `store/newMessage.ts:142-158` | mutation |
| B144 | `updateMessage` handles block instructions (add at position) and partial updates | `store/newMessage.ts:159-193` | mutation |
| B145 | `clearTopicMessages` removes all messages for topic, resets loading/fulfilled | `store/newMessage.ts:194-203` | mutation |
| B146 | `removeMessage` removes single message from topic and entity | `store/newMessage.ts:204-211` | mutation |
| B147 | `removeMessagesByAskId` removes all messages sharing an askId (user+assistant pair) | `store/newMessage.ts:212-228` | mutation |
| B148 | `removeMessages` batch remove by ID list | `store/newMessage.ts:229-237` | mutation |
| B149 | `upsertBlockReference` adds block to message, updates message status based on block status | `store/newMessage.ts:238-283` | mutation |
| B150 | `selectMessagesForTopic` memoized selector: maps ordered IDs to message objects | `store/newMessage.ts:308-321` | query |
| B151 | `messageBlocksAdapter` entity adapter for normalized MessageBlock storage | `store/messageBlock.ts:40-46` | state |
| B152 | `upsertOneBlock` / `upsertManyBlocks` / `removeOneBlock` / `removeManyBlocks` - block CRUD | `store/messageBlock.ts:59-68` | mutation |
| B153 | `formatCitationsFromBlock` formats citations from web search (Gemini, OpenAI, Anthropic, Perplexity, etc.), knowledge, memory | `store/messageBlock.ts:116-324` | transform |
| B154 | `selectActiveTodoInfo` selector for pinned TodoWrite panel in inputbar | `store/messageBlock.ts:388-431` | query |
| B155 | `getUserMessage()` creates user message with text/file/image blocks | `MessagesService.ts:99-167` | factory |
| B156 | `getAssistantMessage()` creates assistant message placeholder | `MessagesService.ts:169-177` | factory |
| B157 | `resetAssistantMessage()` clears blocks, resets status to PENDING | `MessagesService.ts:183-200` | transform |
| B158 | `getContextCount(assistant, messages)` calculates context window with MAX_CONTEXT_COUNT conversion | `MessagesService.ts:46-56` | query |
| B159 | `deleteMessageFiles(message)` deletes associated file blocks from FileManager | `MessagesService.ts:58-69` | mutation |
| B160 | `isGenerating()` checks runtime.generating state, shows warning if active | `MessagesService.ts:71-77` | guard |
| B161 | `locateToMessage()` navigates to message location (assistant + topic + scroll) | `MessagesService.ts:79-90` | navigation |
| B162 | `checkRateLimit(assistant)` enforces per-provider rate limiting | `MessagesService.ts:238-266` | guard |
| B163 | `useMessageOperations(topic)` hook returns: deleteMessage, deleteGroupMessages, editMessage, resendMessage, regenerateAssistantMessage, appendAssistantResponse, clearTopicMessages, pauseMessages, resumeMessage, getTranslationUpdater, createTopicBranch, editMessageBlocks, resendUserMessageWithEdit, removeMessageBlock | `hooks/useMessageOperations.ts:49-466` | hook |
| B164 | `deleteMessage()` dispatches `deleteSingleMessageThunk`, cleans trace history | `hooks/useMessageOperations.ts:56-62` | mutation |
| B165 | `editMessage()` updates message via thunk, distinguishes UI-only updates | `hooks/useMessageOperations.ts:79-98` | mutation |
| B166 | `resendMessage()` restarts trace and dispatches resend thunk | `hooks/useMessageOperations.ts:104-110` | mutation |
| B167 | `regenerateAssistantMessage()` re-generates assistant reply via thunk | `hooks/useMessageOperations.ts:165-175` | mutation |
| B168 | `appendAssistantResponse()` adds new model response to same user query | `hooks/useMessageOperations.ts:181-203` | mutation |
| B169 | `pauseMessages()` aborts streaming completions, pauses trace, sets loading false | `hooks/useMessageOperations.ts:136-149` | mutation |
| B170 | `getTranslationUpdater()` initiates or reuses translation block, returns throttled updater | `hooks/useMessageOperations.ts:213-272` | factory |
| B171 | `createTopicBranch()` clones messages to new topic for branching | `hooks/useMessageOperations.ts:284-290` | mutation |
| B172 | `editMessageBlocks()` compares original/edited blocks, handles add/update/remove in one operation | `hooks/useMessageOperations.ts:298-378` | mutation |
| B173 | `resendUserMessageWithEdit()` edits blocks then resends user message | `hooks/useMessageOperations.ts:384-416` | mutation |
| B174 | `getMessageTitle()` generates title from content or via topic naming API | `MessagesService.ts:202-236` | query |
| B175 | `MessageBlockType` enum: UNKNOWN, MAIN_TEXT, THINKING, TRANSLATION, IMAGE, CODE, TOOL, FILE, ERROR, CITATION, VIDEO, COMPACT | `types/newMessage.ts:23-36` | type |
| B176 | `MessageBlockStatus` enum: PENDING, PROCESSING, STREAMING, SUCCESS, ERROR, PAUSED | `types/newMessage.ts:39-46` | type |
| B177 | `AssistantMessageStatus` enum: PROCESSING, PENDING, SEARCHING, SUCCESS, PAUSED, ERROR | `types/newMessage.ts:175-182` | type |
| B178 | `Message` type: id, role, assistantId, topicId, status, blocks[], model, usage, metrics, askId, mentions, traceId | `types/newMessage.ts:184-219` | type |

## 4. UI Component Features

| Component | Capability | Notes |
|---|---|---|
| `Messages` | Infinite scroll list, context indicator, load-more, message grouping, scroll position restore | Uses `InfiniteScroll`, `LOAD_MORE_COUNT` |
| `MessageGroup` | Renders user+assistant message pair, grouped model list for multi-model | Grouping by `askId` |
| `MessageMenubar` | Configurable action buttons: copy, edit, delete, regenerate, translate, export, branch | Registry-based, scope-aware |
| `MessageContent` | Markdown rendering with code blocks, math, thinking blocks | Uses dedicated Block renderers |
| `MessageEditor` | Inline editing of message text blocks | Opens on edit action |
| `Inputbar` | Multi-line textarea, file drag-drop, paste handling, send shortcut, draft caching | Draft cached with 24h TTL |
| `InputbarTools` | Draggable toolbar: file attach, web search, KB, @mention, code | Registry + scope system |
| `MentionModelsInput` | @mention to add models for multi-model response | Cached mentioned models per assistant |
| `KnowledgeBaseInput` | Select knowledge bases for RAG context | KB selection UI |
| `TokenCount` | Estimated token display for input | Optional via settings |
| `SendMessageButton` | Send/stop with shortcut label | Shortcut configurable |
| `AttachmentPreview` | Preview attached files before sending | File type icons |
| `ChatNavBar` | Model selector, assistant name, search | Top of chat area |
| `Prompt` | System prompt display/edit | Optional via `showPrompt` setting |
| `NarrowLayout` | Compact layout for narrow windows | Responsive design |

## 5. Interaction Behavior Inventory

| Interaction | Behavior |
|---|---|
| Type message + press Enter (or configured shortcut) | Sends message: creates user message with blocks, dispatches send thunk, triggers streaming |
| Attach file via toolbar or drag-drop | Creates file/image blocks, previews in AttachmentPreview |
| @mention model | Adds model to mentions array for multi-model response |
| Click copy on message | Copies message text as plain text to clipboard |
| Click edit on message | Opens MessageEditor for inline text editing |
| Click delete on message | Confirms then dispatches deleteSingleMessageThunk |
| Click regenerate on assistant message | Resets assistant message, re-dispatches to API |
| Click translate on message | Initiates translation block, streams translation |
| Click branch on message | Clones messages to new topic up to branch point |
| Click pause during streaming | Aborts completion, pauses trace, sets loading false |
| Scroll up in message list | Loads more messages via infinite scroll |
| New context button | Emits NEW_CONTEXT event to clear messages UI |
| Ctrl+F / search shortcut | Opens content search overlay |

## 6. Foundation Decisions (Electron)

| Decision | Detail |
|---|---|
| Message storage | Messages stored via `db` (Dexie/IndexedDB), loaded via thunks into Redux entity state |
| Block storage | MessageBlocks in separate entity adapter, normalized by ID |
| Streaming | Uses `abortController` pattern for cancellation; streaming updates via Redux dispatch |
| File handling | Files managed by `FileManager` service with Electron file system access |
| Trace/telemetry | `SpanManagerService` for message tracing |

## 7. Foundation Dependencies

| Dependency | Usage | New Stack Equivalent |
|---|---|---|
| `@reduxjs/toolkit` (createSlice, createEntityAdapter, createSelector) | Normalized message/block state | Zustand with immer |
| `react-infinite-scroll-component` | Infinite scroll for messages | Same or `@tanstack/react-virtual` |
| `styled-components` | Chat UI styling | Tailwind CSS + shadcn/ui |
| `antd` (Flex, Alert, Dropdown, Popconfirm, Tooltip) | UI primitives | shadcn/ui equivalents |
| `motion/react` (framer-motion) | Sidebar animation | framer-motion (keep) |
| `lodash` (debounce, throttle, last, difference) | Utility functions | lodash-es or native |
| `react-hotkeys-hook` | Keyboard shortcuts | Same |
| `dayjs` | Date formatting | Same |
| `react-i18next` | Translations | Same |
| `react-router-dom` | Navigation | Same |

## 8. Naming Remapping

| Original (Cherry) | Target (Angdu) | Location |
|---|---|---|
| No Cherry-specific naming found in chat source code | N/A | Chat code does not reference Cherry brand |

## 9. Static Resources

| Resource | Source Path | Notes |
|---|---|---|
| Loading spinner | `LoadingIcon` component | SVG icon |
| Message action icons | `lucide-react` icons (Copy, Edit, Delete, Refresh, Languages, etc.) | Keep lucide-react |
| Toolbar tool icons | Per-tool icon in registry | Tool definitions |

## 10. Environment Variables

None specific to this feature.

## 11. Feature Contracts

### Provides (to other features)
- Message creation and display (consumed by all features that generate messages)
- `useMessageOperations()` hook for message CRUD
- `selectMessagesForTopic()` selector for reading messages
- Message block rendering system (MAIN_TEXT, THINKING, CITATION, TOOL, etc.)
- Inputbar tool registry system

### Consumes (from other features)
- F001-shell: Page layout, sidebar slots, navbar
- F003-providers: Model for message sending, provider for rate limiting
- F004-assistants: Assistant object, topics, assistant settings
- F002-i18n-theme: Translations, theme (message style, font)

## 12. For /speckit.specify

- Messages use normalized entity adapter pattern (entities + messageIdsByTopic map)
- MessageBlocks are a separate normalized store, referenced by block ID arrays in messages
- Message grouping is by `askId` - user message and its assistant responses share same askId
- 11 MessageBlockType variants: MAIN_TEXT, THINKING, TRANSLATION, IMAGE, CODE, TOOL, FILE, ERROR, CITATION, VIDEO, COMPACT
- Inputbar has a tool registry system with scope-based filtering and drag reorder
- Multi-model support: @mention adds models to message, each gets separate assistant response
- Topic branching creates a new topic by cloning messages up to a branch point
- Draft caching with 24h TTL for unsent input text

## 13. For /speckit.plan

- Zustand stores: `useMessagesStore` (entities + topicMap) and `useMessageBlocksStore` (entities)
- Replace Redux entity adapter with plain Map or immer-based normalized state
- Inputbar tool registry can be a simple registration pattern with Zustand
- Message list: consider `@tanstack/react-virtual` for virtualization instead of InfiniteScroll
- Block renderers should be lazy-loaded components per block type
- Streaming: maintain abort controller pattern, adapt for Zustand

## 14. For /speckit.analyze

- `updateMessage` has special `blockInstruction` handling for positional block insertion - must preserve
- `upsertBlockReference` drives message status from block status - critical for streaming UX
- `formatCitationsFromBlock` handles 10+ web search providers with different response formats
- `selectActiveTodoInfo` traverses all topic messages - performance concern for large topics
- `useMessageOperations` returns 15 functions - consider splitting into focused hooks
- `editMessageBlocks` does three-way diff (add/update/remove) - complex logic to preserve
- Rate limiting is per-provider, checked before send
- `displayCount` controls initial load; `LOAD_MORE_COUNT` for pagination
