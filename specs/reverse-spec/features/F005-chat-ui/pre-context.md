# F005-chat-ui — Pre-Context

**Feature**: Input bar, markdown rendering, streaming UI, message tools, content search, chat flow history
**Release Group**: RG-3 | **Tier**: T1

---

## 1. Runtime Exploration Results

- **Input Bar**: Rich editor based on TipTap with 18 input tools -- attachment, clear topic, create session, generate image, knowledge base, MCP tools, mention models, new context, new topic, quick phrases, resource, slash commands, thinking, toggle expand, URL context, web search, plus send button and token count display.
- **Markdown Rendering**: `react-markdown` with custom remark/rehype plugins (heading IDs, scalable SVG, disable constructs). Code blocks via `Shiki` with syntax highlighting. Math via `KaTeX`. Diagrams via `Mermaid`. SVG rendering support.
- **Streaming UI**: Message blocks stream in real-time with smooth scroll. Status indicators per block (pending, streaming, success, error). Thinking blocks show elapsed time. Smooth streaming animation via `useSmoothStream` hook that buffers deltas and renders character-by-character.
- **Message Tools**: Per-message actions -- copy, edit, retry, delete, translate, fork, TTS, bookmark. Context menu and hover toolbar.
- **Chat Flow History**: Visual conversation graph via `@xyflow/react` (React Flow) showing message branching and topic relationships.
- **Chat Navigation**: Jump-to-message, scroll to bottom, message anchoring.
- **Message Components**: Extensive component tree -- Message, MessageGroup, MessageContent, MessageHeader, MessageMenubar, MessageAttachments, MessageImage, MessageVideo, MessageTokens, MessageTranslate, MessageEditor, etc.
- **Rich Editor**: TipTap-based input with extensions, slash commands, mention system, toolbar, and table of contents.
- **Emoji**: Emoji picker integration for assistant icons and chat messages.
- **Content Blocks**: Specialized renderers for each MessageBlockType -- thinking blocks with collapse, tool result blocks, citation blocks, error blocks, code blocks with copy/run.

---

## 2. Source Reference

| File | Role |
|------|------|
| `src/renderer/src/pages/home/HomePage.tsx` | Root page component. Composes Navbar, HomeTabs (sidebar), and Chat. Manages `activeAssistant` and `activeTopic` state. Uses `motion/react` for animated sidebar show/hide. |
| `src/renderer/src/pages/home/Chat.tsx` | Central chat container. Orchestrates Messages, Inputbar, ChatNavbar, content search, topic position (left/right), agent session views. Wraps content in `QuickPanelProvider`. |
| `src/renderer/src/pages/home/Navbar.tsx` | Top/left header bar with sidebar toggles, search, narrow-mode toggle, update button. |
| `src/renderer/src/pages/home/Inputbar/Inputbar.tsx` | Main input bar. Manages text state (with draft caching via `CacheService`), file attachments, mentioned models, knowledge bases, send logic, token estimation. Wraps `InputbarToolsProvider`. |
| `src/renderer/src/pages/home/Inputbar/InputbarTools.tsx` | Extensible toolbar with drag-and-drop (`@hello-pangea/dnd`) tool ordering, visible/hidden tool sets, context menu, `QuickPanel` integration. |
| `src/renderer/src/pages/home/Inputbar/components/InputbarCore.tsx` | Core textarea with send button, attachment preview, toolbar slots. |
| `src/renderer/src/pages/home/Inputbar/SendMessageButton.tsx` | Send/stop button |
| `src/renderer/src/pages/home/Inputbar/TokenCount.tsx` | Token count display |
| `src/renderer/src/pages/home/Inputbar/AttachmentPreview.tsx` | File attachment preview |
| `src/renderer/src/pages/home/Inputbar/KnowledgeBaseInput.tsx` | Knowledge base selector |
| `src/renderer/src/pages/home/Inputbar/MentionModelsInput.tsx` | Model mention input |
| `src/renderer/src/pages/home/Inputbar/tools/` | 18 input tool components (each file registers via `defineTool`/`registerTool` pattern) |
| `src/renderer/src/pages/home/Inputbar/registry.ts` | Scope-specific inputbar configuration (`getInputbarConfig(scope)`) |
| `src/renderer/src/pages/home/Inputbar/types.ts` | `ToolDefinition`, `ToolRenderContext`, `ToolQuickPanelApi`, `InputbarScope`, tool registry pattern |
| `src/renderer/src/pages/home/Inputbar/context/InputbarToolsProvider.tsx` | React context providing tool state (files, models, knowledge bases, expansion) and actions |
| `src/renderer/src/pages/home/Inputbar/hooks/` | Input bar hooks |
| `src/renderer/src/pages/home/Markdown/Markdown.tsx` | Core markdown renderer using `react-markdown` with `remark-gfm`, `remark-math`, `remark-github-blockquote-alert`, `remark-cjk-friendly`, `rehype-katex`/`rehype-mathjax`, `rehype-raw`. Smooth streaming via `useSmoothStream`. |
| `src/renderer/src/pages/home/Markdown/CodeBlock.tsx` | Code block with syntax highlighting, copy, run, edit |
| `src/renderer/src/pages/home/Markdown/Table.tsx` | Enhanced table rendering |
| `src/renderer/src/pages/home/Markdown/Link.tsx` | Link rendering with external handling |
| `src/renderer/src/pages/home/Markdown/Hyperlink.tsx` | Hyperlink component |
| `src/renderer/src/pages/home/Markdown/CitationTooltip.tsx` | Citation reference tooltip |
| `src/renderer/src/pages/home/Markdown/MarkdownSvgRenderer.tsx` | SVG rendering within markdown |
| `src/renderer/src/pages/home/Markdown/plugins/` | `rehypeHeadingIds`, `rehypeScalableSvg`, `remarkDisableConstructs` |
| `src/renderer/src/pages/home/Messages/Messages.tsx` | Message list with `react-infinite-scroll-component`, reverse-chronological display, grouped messages, branch/context/clear events, export image support |
| `src/renderer/src/pages/home/Messages/Message.tsx` | Individual message: `MessageHeader`, `MessageContent`, `MessageEditor`, `MessageMenubar`, `MessageOutline`. Handles edit mode, highlight-on-locate, multi-select |
| `src/renderer/src/pages/home/Messages/MessageContent.tsx` | Thin wrapper dispatching to `MessageBlockRenderer` |
| `src/renderer/src/pages/home/Messages/MessageGroup.tsx` | Groups messages by `askId` for multi-model responses |
| `src/renderer/src/pages/home/Messages/MessageMenubar.tsx` | Action bar: copy, edit, regenerate, delete, branch, translate, TTS, useful toggle |
| `src/renderer/src/pages/home/Messages/MessageEditor.tsx` | In-place message editing with save and resend |
| `src/renderer/src/pages/home/Messages/MessageHeader.tsx` | Avatar, model name, timestamp display |
| `src/renderer/src/pages/home/Messages/MessageOutline.tsx` | Heading-based outline sidebar for assistant messages |
| `src/renderer/src/pages/home/Messages/ChatFlowHistory.tsx` | React Flow conversation graph |
| `src/renderer/src/pages/home/Messages/ChatNavigation.tsx` | Scroll navigation buttons or anchor lines |
| `src/renderer/src/pages/home/Messages/NarrowLayout.tsx` | Responsive width constraint wrapper |
| `src/renderer/src/pages/home/Messages/Prompt.tsx` | System prompt display at top |
| `src/renderer/src/pages/home/Messages/SelectionBox.tsx` | Multi-select drag-selection overlay |
| `src/renderer/src/pages/home/Messages/MessageAnchorLine.tsx` | Anchor-based message navigation |
| `src/renderer/src/pages/home/Messages/AgentSessionMessages.tsx` | Agent session message list |
| `src/renderer/src/pages/home/Messages/Blocks/index.tsx` | `MessageBlockRenderer` -- maps `MessageBlock` types to components, groups consecutive IMAGE/TOOL/VIDEO blocks, applies animated wrappers via `motion/react` |
| `src/renderer/src/pages/home/Messages/Blocks/MainTextBlock.tsx` | Main text via Markdown with citation support |
| `src/renderer/src/pages/home/Messages/Blocks/ThinkingBlock.tsx` | Collapsible thinking/reasoning display |
| `src/renderer/src/pages/home/Messages/Blocks/ToolBlock.tsx` | Single tool invocation display |
| `src/renderer/src/pages/home/Messages/Blocks/ToolBlockGroup.tsx` | Grouped display for consecutive tool calls |
| `src/renderer/src/pages/home/Messages/Blocks/ImageBlock.tsx` | Image rendering with viewer |
| `src/renderer/src/pages/home/Messages/Blocks/VideoBlock.tsx` | Video content display |
| `src/renderer/src/pages/home/Messages/Blocks/FileBlock.tsx` | File attachment display |
| `src/renderer/src/pages/home/Messages/Blocks/CitationBlock.tsx` | Web search / knowledge citations |
| `src/renderer/src/pages/home/Messages/Blocks/ErrorBlock.tsx` | Error display with details |
| `src/renderer/src/pages/home/Messages/Blocks/TranslationBlock.tsx` | Translation overlay |
| `src/renderer/src/pages/home/Messages/Blocks/CompactBlock.tsx` | Compact command response |
| `src/renderer/src/pages/home/Messages/Blocks/PlaceholderBlock.tsx` | Loading/pending placeholder |
| `src/renderer/src/pages/home/Messages/Tools/MessageMcpTool.tsx` | MCP tool call display: arguments, response, progress, approval actions |
| `src/renderer/src/pages/home/Messages/Tools/MessageTools.tsx` | Tool list renderer within a message |
| `src/renderer/src/pages/home/Messages/Tools/MessageWebSearch.tsx` | Web search result display |
| `src/renderer/src/pages/home/Messages/Tools/MessageKnowledgeSearch.tsx` | Knowledge base search results |
| `src/renderer/src/pages/home/Messages/Tools/MessageMemorySearch.tsx` | Memory search results |
| `src/renderer/src/pages/home/Messages/Tools/ToolApprovalActions.tsx` | Approve/deny UI for tool calls |
| `src/renderer/src/pages/home/Messages/Tools/ToolPermissionRequestCard.tsx` | Permission request card |
| `src/renderer/src/pages/home/Messages/Tools/hooks/useToolApproval.ts` | Approval state management hook |
| `src/renderer/src/pages/home/Messages/Tools/MessageAgentTools/` | Agent-specific tool display |
| `src/renderer/src/pages/home/Messages/Tools/shared/` | Shared tool UI components (`ArgsTable`, `truncateOutput`) |
| `src/renderer/src/pages/home/Tabs/index.tsx` | Tab container: AssistantsTab, TopicsTab, SessionsTab |
| `src/renderer/src/pages/home/Tabs/AssistantsTab.tsx` | Lists assistants with tag groups |
| `src/renderer/src/pages/home/Tabs/TopicsTab.tsx` | Lists topics for active assistant |
| `src/renderer/src/pages/home/Tabs/SessionsTab.tsx` | Lists agent sessions |
| `src/renderer/src/pages/home/Tabs/components/` | `AssistantItem`, `AgentItem`, `SessionItem`, `Topics`, `Sessions`, `UnifiedList`, `UnifiedTagGroups`, `TopicManageMode`, `AddButton` |
| `src/renderer/src/pages/home/components/` | `AssistantsDrawer`, `ChatNavBar/`, `SelectModelButton`, `SelectAgentBaseModelButton`, `UpdateAppButton` |
| `src/renderer/src/components/RichEditor/` | TipTap rich editor |
| `src/renderer/src/components/QuickPanel/` | Slash-command / trigger-based panel system (`/`, `@`, `#`) |
| `src/renderer/src/components/ContentSearch.tsx` | In-chat text search with highlight |
| `src/renderer/src/components/ContextMenu/` | Right-click context menu |
| `src/renderer/src/components/ImageViewer.tsx` | Image lightbox viewer |
| `src/renderer/src/components/CodeBlockView/` | Code display and editing |
| `src/renderer/src/components/Popups/` | SearchPopup, SelectModelPopup, PromptPopup, MultiSelectionPopup |
| `src/renderer/src/components/ThinkingEffect.tsx` | Animated thinking indicator |
| `src/renderer/src/components/Scrollbar/` | Custom scrollbar wrapper |
| `src/renderer/src/components/Layout/` | HStack, VStack layout primitives |
| `src/renderer/src/components/app/Navbar.tsx` | Shared navbar shell (NavbarLeft, NavbarCenter, NavbarRight) |
| `src/renderer/src/services/messageStreaming/` | Streaming service (BlockManager, callbacks) |
| `src/renderer/src/store/inputTools.ts` | Input tool state (ordering, collapse) |

---

## 3. Data Models and State

### Message Model (`src/renderer/src/types/newMessage.ts`)

```
Message {
  id, role ('user'|'assistant'|'system'), assistantId, topicId,
  status (UserMessageStatus | AssistantMessageStatus),
  modelId?, model?, type? ('clear'), useful?, askId?,
  mentions? (Model[]), usage?, metrics?,
  blocks: MessageBlock['id'][],  // Array of block IDs (normalized)
  multiModelMessageStyle?, foldSelected?,
  traceId?, agentSessionId?, providerMetadata?
}

UserMessageStatus: SUCCESS
AssistantMessageStatus: PROCESSING | PENDING | SEARCHING | SUCCESS | PAUSED | ERROR
```

### MessageBlock Types (discriminated union on `type: MessageBlockType`):

All extend `BaseMessageBlock { id, messageId, type, createdAt, updatedAt?, status, model?, metadata?, error? }`

| Block Type | Key Fields |
|---|---|
| `MAIN_TEXT` | `content: string`, `knowledgeBaseIds?`, `citationReferences?` |
| `THINKING` | `content: string`, `thinking_millsec: number` |
| `TRANSLATION` | `content`, `sourceBlockId?`, `sourceLanguage?`, `targetLanguage` |
| `CODE` | `content`, `language` |
| `IMAGE` | `url?`, `file? (FileMetadata)`, `metadata.prompt?`, `metadata.generateImageResponse?` |
| `TOOL` | `toolId`, `toolName?`, `arguments?`, `content?`, `metadata.rawMcpToolResponse?` |
| `FILE` | `file: FileMetadata` |
| `VIDEO` | `url?`, `filePath?` |
| `ERROR` | (inherits `error` from base) |
| `CITATION` | `response? (WebSearchResponse)`, `knowledge? (KnowledgeReference[])`, `memories? (MemoryItem[])` |
| `COMPACT` | `content`, `compactedContent` |
| `UNKNOWN` | (placeholder/loading) |

`MessageBlockStatus`: PENDING | PROCESSING | STREAMING | SUCCESS | ERROR | PAUSED

### Redux Store Slices (RTK) -- to migrate to Zustand

| Slice | File | Key State |
|---|---|---|
| `newMessage` | `store/newMessage.ts` | Per-topic message arrays, topic fulfilled flags |
| `messageBlock` | `store/messageBlock.ts` | Normalized MessageBlock entities (`EntityAdapter`) |
| `runtime` | `store/runtime.ts` | `chat.activeTopicOrSession`, `chat.activeAgentId`, `chat.activeSessionIdMap`, `chat.isMultiSelectMode` |
| `settings` | `store/settings.ts` | `narrowMode`, `messageStyle`, `messageFont`, `fontSize`, `showPrompt`, `messageNavigation`, `topicPosition`, `showAssistants`, `showTopics`, `sendMessageShortcut`, `showInputEstimatedTokens`, `showMessageOutline`, `enableQuickPanelTriggers`, `mathEngine`, `mathEnableSingleDollar` |
| `inputTools` | `store/inputTools.ts` | Tool ordering per scope (`visible[]`, `hidden[]`), `isCollapsed` |
| `assistants` | `store/assistants.ts` | Assistant definitions and their topics |

### Key Hooks

| Hook | Purpose |
|---|---|
| `useAssistant(id)` | Get/update assistant, model, topics, `addTopic`, `setModel` |
| `useChatContext(topic)` | Multi-select mode, message selection handlers |
| `useMessageOperations(topic)` | CRUD on messages: `editMessageBlocks`, `resendUserMessageWithEdit`, `editMessage`, `deleteMessage`, `pauseMessages`, `clearTopicMessages`, `createTopicBranch` |
| `useTopicMessages(topicId)` | Select messages for a topic from Redux |
| `useTopicLoading(topic)` | Streaming/loading state boolean |
| `useInputText()` | Controlled text input with onChange callback |
| `useTextareaResize()` | Auto-resize textarea with expand/collapse, `maxHeight`/`minHeight` |
| `useScrollPosition(key)` | Persist and restore scroll position per topic |
| `useSmoothStream()` | Character-by-character streaming animation with `addChunk`/`reset` |
| `useSettings()` | Read settings from Redux |
| `useShortcut(name, handler)` | Keyboard shortcut registration (wraps `react-hotkeys-hook`) |
| `useRuntime()` | Access runtime state (active topic/session, agent ID) |
| `useShowAssistants()` / `useShowTopics()` | Toggle sidebar visibility |
| `useNavbarPosition()` | Left or top navbar layout |
| `useTimer()` | Debounced/throttled timer management |

### Event System (`EventService`)

Custom `EventEmitter` with typed event names. Key events:

| Event | Emitted From | Consumed By |
|---|---|---|
| `SEND_MESSAGE` | Inputbar `sendMessage()` | Messages `scrollToBottom`, token estimation |
| `CLEAR_MESSAGES` | Inputbar clear button | Messages confirmation dialog |
| `NEW_CONTEXT` | Inputbar context button | Messages insert clear divider |
| `NEW_BRANCH` | MessageMenubar | Messages clone topic at index |
| `EDIT_CODE_BLOCK` | CodeBlock edit | Messages update block content |
| `EDIT_MESSAGE` | Shortcut / MessageMenubar | Message start editing |
| `LOCATE_MESSAGE` | Navigation | Message scroll + highlight |
| `SHOW_TOPIC_SIDEBAR` | Various | Topics panel |
| `ESTIMATED_TOKEN_COUNT` | Messages | Inputbar token display |
| `COPY_TOPIC_IMAGE` / `EXPORT_TOPIC_IMAGE` | Navbar actions | Messages capture |
| `ADD_NEW_TOPIC` | External | Inputbar `addNewTopic` |

---

## 4. Component / Service Architecture

```
HomePage
  +-- Navbar (top/left header bar)
  +-- HomeTabs (sidebar: Assistants | Topics | Sessions)
  |     +-- AssistantsTab -> AssistantItem (draggable)
  |     +-- TopicsTab -> Topics list
  |     +-- SessionsTab -> Sessions list
  +-- Chat
        +-- ChatNavbar (per-chat nav bar: model info, narrow toggle)
        +-- QuickPanelProvider
        +-- Messages (infinite scroll, reverse-chronological)
        |     +-- NarrowLayout (responsive width)
        |     +-- InfiniteScroll (react-infinite-scroll-component)
        |     +-- ContextMenu
        |     +-- MessageGroup
        |           +-- Message
        |                 +-- MessageHeader (avatar, model, timestamp)
        |                 +-- MessageContent
        |                 |     +-- MessageBlockRenderer (groups blocks, animated)
        |                 |           +-- MainTextBlock -> Markdown -> ReactMarkdown
        |                 |           |     +-- CodeBlock (Shiki)
        |                 |           |     +-- Table, Link, ImageViewer, MarkdownSvgRenderer
        |                 |           +-- ThinkingBlock (collapsible)
        |                 |           +-- ToolBlock / ToolBlockGroup -> MessageMcpTool
        |                 |           +-- ImageBlock, FileBlock, VideoBlock
        |                 |           +-- CitationBlock, ErrorBlock, TranslationBlock
        |                 |           +-- CompactBlock, PlaceholderBlock
        |                 +-- MessageEditor (edit mode)
        |                 +-- MessageOutline (heading sidebar)
        |                 +-- MessageMenubar (hover actions)
        |     +-- Prompt (system prompt display)
        |     +-- MessageAnchorLine (anchor navigation)
        |     +-- SelectionBox (multi-select overlay)
        +-- ContentSearch (Ctrl+F in-chat search)
        +-- ChatNavigation (scroll nav buttons)
        +-- Inputbar
              +-- InputbarToolsProvider (React context)
              +-- InputbarCore (textarea + send button)
              +-- InputbarTools (toolbar with DnD ordering)
              |     +-- attachmentTool, webSearchTool, knowledgeBaseTool,
              |     +-- mcpToolsTool, mentionModelsTool, thinkingTool,
              |     +-- generateImageTool, newTopicTool, newContextTool,
              |     +-- clearTopicTool, toggleExpandTool, slashCommandsTool,
              |     +-- quickPhrasesTool, resourceTool, urlContextTool,
              |     +-- createSessionTool
              +-- AttachmentPreview
              +-- KnowledgeBaseInput
              +-- MentionModelsInput
              +-- TokenCount
```

### Input Bar Tool Plugin Architecture

Tools are registered via `defineTool()` + `registerTool()` in `Inputbar/types.ts`. Each tool declares:
- `key` -- unique identifier (e.g., `'attachment'`, `'webSearch'`, `'mcpTools'`)
- `label` -- display name (string or `(t: TFunction) => string`)
- `visibleInScopes` -- which scopes (Chat, Session, mini-window) the tool appears in
- `condition(context)` -- dynamic visibility based on assistant/model
- `dependencies.state[]` / `dependencies.actions[]` -- injected from `InputbarToolsProvider`
- `render(context)` -- returns a React node (button), or `null` for pure menu contributors
- `quickPanel` -- optional QuickPanel menu/trigger registrations (`rootMenu`, `triggers[]`)
- `quickPanelManager` -- optional companion component for lifecycle hooks

Tool ordering is persisted in Redux `store/inputTools.ts` with drag-and-drop reorder via `@hello-pangea/dnd`.

---

## 5. Source Behavior Inventory

| ID | Behavior | Priority | Source |
|----|----------|----------|--------|
| B081 | Render TipTap rich editor with slash commands and mentions | P1 | `components/RichEditor/` |
| B082 | Display 18 input tools (attachment, web search, MCP, etc.) with registry | P1 | `Inputbar/tools/`, `types.ts` |
| B083 | Send message on configurable shortcut (Enter/Shift+Enter/etc.) | P1 | `SendMessageButton.tsx`, `Inputbar.tsx` |
| B084 | Show real-time token count for input and context | P2 | `TokenCount.tsx` |
| B085 | Preview attached files before sending | P1 | `AttachmentPreview.tsx` |
| B086 | Render markdown with react-markdown + custom plugins | P1 | `Markdown/Markdown.tsx` |
| B087 | Syntax highlight code blocks via Shiki | P1 | `Markdown/CodeBlock.tsx` |
| B088 | Render LaTeX math via KaTeX or MathJax (configurable) | P2 | Markdown pipeline |
| B089 | Render Mermaid diagrams | P2 | Markdown pipeline |
| B090 | Render SVG content inline with scalable rendering | P3 | `MarkdownSvgRenderer.tsx` |
| B091 | Render tables with horizontal scroll | P2 | `Markdown/Table.tsx` |
| B092 | Stream message blocks with smooth animation via `useSmoothStream` | P1 | `Markdown.tsx`, `Messages.tsx` |
| B093 | Display thinking blocks with elapsed time and collapse | P1 | `Blocks/ThinkingBlock.tsx` |
| B094 | Display tool call/result blocks with formatted arguments/output | P1 | `Messages/Tools/`, `Blocks/ToolBlock.tsx` |
| B095 | Display citation blocks with source links and tooltips | P2 | `CitationBlock.tsx`, `CitationTooltip.tsx` |
| B096 | Display error blocks with serialized error details | P1 | `Blocks/ErrorBlock.tsx` |
| B097 | Provide message actions (copy, edit, retry, delete, translate, fork, TTS) | P1 | `MessageMenubar.tsx` |
| B098 | Inline message editing with save or resend | P2 | `MessageEditor.tsx` |
| B099 | Display message attachments (images, files) | P1 | `MessageAttachments.tsx`, `ImageBlock.tsx`, `FileBlock.tsx` |
| B100 | Display and play message videos | P3 | `VideoBlock.tsx` |
| B101 | Show token usage per message | P2 | `MessageTokens.tsx` |
| B102 | Translate message content inline | P2 | `MessageTranslate.tsx`, `TranslationBlock.tsx` |
| B103 | Visualize conversation flow via React Flow graph | P3 | `ChatFlowHistory.tsx` |
| B104 | Navigate between messages (jump, scroll to bottom, anchoring) | P2 | `ChatNavigation.tsx`, `MessageAnchorLine.tsx` |
| B105 | Manage sidebar tabs (assistants, topics, sessions) | P2 | `Tabs/` |
| B106 | Display system prompt in chat | P2 | `Prompt.tsx` |
| B107 | Handle multi-select with drag-selection overlay | P2 | `SelectionBox.tsx` |
| B108 | Support narrow viewport layout adaptation | P2 | `NarrowLayout.tsx` |
| B109 | Message grouping by askId for multi-model responses | P2 | `MessageGroup.tsx` |
| B110 | Manage streaming lifecycle (BlockManager, callbacks) | P1 | `services/messageStreaming/` |
| B111 | Draft caching for input text with 24h TTL | P2 | `Inputbar.tsx` (CacheService) |
| B112 | Tool approval workflow display in messages | P1 | `ToolApprovalActions.tsx`, `ToolPermissionRequestCard.tsx` |
| B113 | Infinite scroll with lazy loading for long conversations | P1 | `Messages.tsx` (InfiniteScroll) |
| B114 | In-chat content search (Ctrl+F) with highlight | P2 | `ContentSearch.tsx` |

---

## 6. UI Component Features

| Library/AntD Component | shadcn/ui Replacement | Usage Context |
|------------------------|----------------------|---------------|
| `Flex` | Native flexbox / Tailwind | Ubiquitous layout |
| `Button` | Button | Send, stop, tool buttons |
| `Tooltip` | Tooltip | Tool descriptions, message actions, navbar |
| `Dropdown` | DropdownMenu | Message context menu, model selector, tool ordering |
| `Modal` (`window.modal.confirm`) | Dialog | Confirmations (clear, delete) -- **imperative API** |
| `message` (`window.toast.*`) | Sonner / Toast | Success/error toasts -- **imperative API** |
| `Input`, `TextArea` | Input, Textarea | Message editing |
| `Popover` | Popover | Emoji picker, citation tooltips |
| `Alert` | Alert | Agent session warnings |
| `Divider` | Separator | Message dividers, context separators |
| `Tag` | Badge | Model indicators, mention tags |
| `Collapse` | Collapsible / Accordion | Thinking blocks, tool details |
| `ConfigProvider` | N/A | Ant Design theme provider (removed) |
| `Radio`, `Select`, `Switch`, `Form` | shadcn equivalents | Only in settings, not directly in chat |
| `styled-components` | Tailwind CSS utility classes | Every container/layout component |
| **TipTap** | Keep (no change) | Rich text editor |
| **react-markdown** | Keep (no change) | Markdown rendering |
| **Shiki** | Keep (no change) | Code highlighting |
| **KaTeX** / **MathJax** | Keep (no change) | Math rendering |
| **Mermaid** | Keep (no change) | Diagram rendering |
| **@xyflow/react** | Keep (no change) | Chat flow graph |
| **@hello-pangea/dnd** | Keep or migrate to `@dnd-kit` | InputbarTools drag-drop |
| **react-infinite-scroll-component** | Keep | Message list infinite scroll |
| **react-hotkeys-hook** | Keep | Keyboard shortcuts |
| **motion/react** (Framer Motion) | Keep | Sidebar/block animations |
| **lucide-react** | Keep (aligned with shadcn) | Icons |
| **i18next** | Keep | Internationalization |

---

## 7. Naming Remapping

| Current Identifier | Location | Suggested Replacement |
|--------------------|----------|-----------------------|
| `@cherrystudio/openai` | `types/newMessage.ts` import | `@angdustudio/openai` or direct `openai` SDK |
| No other Cherry-specific identifiers in chat UI | -- | -- |

> F005 components are domain-generic. Branding appears only in static resources handled by F001/F004.

---

## 8. Migration Notes (Stack Changes)

### Redux Toolkit -> Zustand

- **6 Redux slices** to convert: `newMessage`, `messageBlock`, `runtime`, `settings`, `inputTools`, `assistants`
- Replace `useAppDispatch`, `useAppSelector`, `useSelector`, `useDispatch` with Zustand `useStore` selectors
- `createSlice` reducers -> Zustand store actions
- `EntityAdapter` for `messageBlock` normalized state -> manual normalized map or `immer` middleware in Zustand
- `useDispatch(action)` pattern -> direct store method calls
- `store/thunk/messageThunk.ts` async thunks (`sendMessage`, `saveMessageAndBlocksToDB`, `updateMessageAndBlocksThunk`) -> Zustand async actions
- `newMessagesActions.addMessage`, `newMessagesActions.setTopicFulfilled` -> Zustand actions

### Ant Design -> shadcn/ui + TailwindCSS 4

- **Heavy Ant Design usage throughout**: `Flex`, `Divider`, `Alert`, `Tooltip`, `Dropdown`, `Modal`, `Button`, `Collapse`, `ConfigProvider`, `message` (toast)
- **Imperative APIs are the hardest migration point**:
  - `window.modal.confirm()` used in Messages.tsx, Chat.tsx -> needs custom Dialog-based confirm system
  - `window.toast.success/error()` -> Sonner toast provider
- `antd Tooltip` -> shadcn `Tooltip` (API compatible)
- `antd Collapse` (ThinkingBlock, ToolBlock) -> shadcn `Collapsible` or `Accordion`
- `antd Dropdown` with `trigger={['contextMenu']}` -> shadcn `ContextMenu` or `DropdownMenu`
- `antd Divider` with `dashed` and `plain` props -> shadcn `Separator` + custom styling

### styled-components -> TailwindCSS

- **Every container and layout component** uses `styled-components` (`Container`, `Main`, `MessageContainer`, `MessageContentContainer`, `MessageFooter`, `ToolsContainer`, etc.)
- CSS variable usage (`--color-*`, `--navbar-height`, `--assistants-width`, `--font-family-serif`) -> keep as CSS custom properties, integrate with Tailwind theme config
- Attribute selectors (`[navbar-position='left'] &`) -> data attributes with Tailwind `data-[position=left]:` variants
- `classNames()` utility -> `cn()` from `tailwind-merge` + `clsx`
- Hover-based menubar visibility (`.menubar { opacity: 0 }` / `:hover { opacity: 1 }`) -> Tailwind `group-hover:opacity-100`

### Animation

- `motion/react` (Framer Motion) -> keep as-is (framework-agnostic)
- `AnimatePresence` used for sidebar show/hide, block entrance animations, tab transitions
- Block wrapper variants (`visible`, `hidden`, `static`) -> keep

### Drag and Drop

- `@hello-pangea/dnd` used in InputbarTools -> keep or migrate to `@dnd-kit`

### Other Libraries to Retain

- `react-markdown` + remark/rehype plugins (core markdown pipeline)
- `react-infinite-scroll-component` (reverse infinite scroll)
- `react-hotkeys-hook` + custom `useShortcut`
- `katex` / `rehype-katex` / `rehype-mathjax`
- `i18next` / `react-i18next`
- `lucide-react` icons
- `partial-json` (for streaming JSON parsing in tool blocks)

---

## 9. Complexity Assessment

**Overall: HIGH**

| Dimension | Rating | Notes |
|---|---|---|
| File count | Very High | 70+ files across Messages, Blocks, Inputbar, Markdown, Tabs, Tools |
| State complexity | High | 6 Redux slices, normalized entities, event-driven coordination, context providers |
| UI complexity | Very High | Markdown rendering pipeline, smooth streaming animation, infinite scroll, drag-drop, multi-select, responsive layout |
| Ant Design surface | Very High | Used in virtually every sub-component; `window.modal`/`window.toast` imperative APIs need replacement |
| styled-components surface | Very High | Every container/layout uses styled-components with CSS variable integration |
| Cross-feature coupling | High | Depends on assistants, topics, providers, MCP, knowledge, web search, settings |
| Plugin architecture | Medium | InputbarTools plugin system is well-abstracted with `defineTool`/`registerTool`, should port cleanly |
| Testing surface | Low-Medium | `__tests__` directories exist under Markdown and Blocks, but coverage appears limited |

### Recommended Migration Order

1. **Types and data models** (`MessageBlock`, `Message`) -- low coupling, foundation for all other work
2. **Zustand stores** -- convert slices first so components can migrate incrementally
3. **Markdown rendering pipeline** -- self-contained, high reuse, retain 3rd-party libraries
4. **Message Blocks** -- one component per type, independently testable
5. **Messages list and Message component** -- core layout, depends on blocks
6. **Input bar core and tools** -- plugin system is modular
7. **Message Tools** (MCP tool display, approval) -- depends on blocks + MCP types
8. **Sidebar/Tabs** -- separate surface area
9. **Page-level layout** (HomePage, Chat, Navbar) -- final assembly

### Key Risks

- **Imperative modal/toast APIs** (`window.modal.confirm()`, `window.toast.success()`) are used pervasively -- needs a global provider replacement strategy before component migration
- **styled-components nesting** with attribute selectors (`[navbar-position='left'] &`) is complex to migrate to Tailwind
- **Event system** (`EventEmitter`) creates implicit coupling between components; should be preserved as-is initially, then gradually replaced with Zustand subscriptions where appropriate
- **`react-infinite-scroll-component` with reverse scroll** is sensitive to DOM structure changes during the styling migration
- **EntityAdapter** in `messageBlock` store provides selector memoization that must be replicated in Zustand
- **Smooth streaming** (`useSmoothStream`) relies on precise React state batching behavior

---

## 10. For /speckit.specify

**Feature Summary**: Complete chat user interface including a TipTap-based rich input bar with 18 tools, react-markdown-based message rendering with Shiki/KaTeX/Mermaid support, real-time streaming display with block-level status tracking, message action toolbar, and React Flow-based conversation history visualization.

**User Scenarios**:
- US-025: User types a message with slash commands and sends it
- US-026: User attaches a file and image to a message
- US-027: Assistant response streams in with thinking block collapsing and main text rendering
- US-028: User copies a code block from an assistant response
- US-029: User retries a failed message
- US-030: User views conversation flow history as a graph
- US-031: User edits a previously sent message inline
- US-032: User translates an assistant response

**Draft Requirements**:
- FR-036: System SHALL provide a rich text input with slash commands and file attachment
- FR-037: System SHALL render markdown with code highlighting, math, and diagrams
- FR-038: System SHALL display streaming responses with block-level progress indicators
- FR-039: System SHALL provide per-message action toolbar (copy, edit, retry, delete, translate)
- FR-040: System SHALL support inline message editing with re-send
- FR-041: System SHALL visualize conversation branching via flow graph
- FR-042: System SHALL support 18 input tools via registry pattern
- FR-043: System SHALL handle smooth scrolling during streaming
- FR-044: System SHALL render all 11 message block types with appropriate formatting

**Success Criteria**:
- SC-017: First token of streaming response renders within 200ms of receipt
- SC-018: Code blocks render with correct syntax highlighting for 20+ languages
- SC-019: KaTeX math renders without layout shift
- SC-020: Input bar tools load and respond within 100ms
- SC-021: Message list scrolls smoothly during streaming (60fps)

---

## 11. For /speckit.plan

**Dependencies**:
- Upstream: F001 (window, theme, IPC), F002 (model info for display), F003 (message/block data), F006 (MCP tool results display)
- Downstream: None; F005 is a leaf UI feature

**Entity/API Contracts**:
- Consumes: `Message`, `MessageBlock`, `Assistant`, `Topic` from F003
- Consumes: `Model`, `Provider` from F002 for display
- Input tool registry: `ToolDefinition { key, label, condition?, visibleInScopes?, dependencies?, render, quickPanel? }`
- Streaming callback interface: `BlockManager` with `onBlockUpdate`, `onBlockComplete`, `onError`
- No new entities; F005 is purely presentational over F003 data

---

## 12. For /speckit.analyze

**Cross-Feature Verification Points**:
- F005 <-> F003: Message/block state changes must trigger re-renders; normalized entity selectors must be efficient
- F005 <-> F002: Model icons and names displayed in message headers and group labels
- F005 <-> F001: Theme changes must update Shiki code themes and markdown styles
- F005 <-> F004: Display settings (font family, code font, message dividers, code style) directly affect rendering
- F005 <-> F006: MCP tool call/result blocks rendered in `Messages/Tools/`; tool permission/approval UI
- F005 <-> F007: Knowledge base selection in inputbar, citation display in messages
- F005 <-> F008: Web search toggle in inputbar, search result rendering in messages
- AntD->shadcn: **High migration surface** -- Button, Tooltip, Dropdown, Modal, Divider, Collapse, Alert, ConfigProvider, plus imperative `window.modal`/`window.toast` APIs
- styled-components->Tailwind: **Very high surface** -- every layout component needs rewriting
