# Pre-Context: Chat

**Feature ID**: F003-chat
**Tier**: Tier 1
**Generated**: 2026-03-07

---

## Source Reference

**Source Root**: `/Users/coolhero/Develop/cherry-studio`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/renderer/src/store/newMessage.ts` | Message state (Redux slice -> Zustand store) |
| `src/renderer/src/store/messageBlock.ts` | Block state (Redux slice -> Zustand store) |
| `src/renderer/src/store/assistants.ts` | Assistant state (Redux slice -> Zustand store) |
| `src/renderer/src/store/thunk/messageThunk.ts` | Message operations (Redux thunks -> Zustand actions) |
| `src/renderer/src/services/MessagesService.ts` | Message creation, file attachment, context filtering |
| `src/renderer/src/services/AssistantService.ts` | Assistant CRUD and default settings |
| `src/renderer/src/services/ConversationService.ts` | Conversation/topic management |
| `src/renderer/src/services/messageStreaming/` | BlockManager, streaming pipeline |
| `src/renderer/src/services/ApiService.ts` | AI API call orchestration |
| `src/renderer/src/services/TokenService.ts` | Token counting and estimation |
| `src/renderer/src/pages/home/` | Chat UI page root |
| `src/renderer/src/pages/home/Messages/` | Message list components |
| `src/renderer/src/pages/home/Inputbar/` | Input bar with auto-resize |
| `src/renderer/src/pages/home/Tabs/` | Conversation tabs |
| `src/renderer/src/hooks/useChatContext.ts` | Chat context hook |
| `src/renderer/src/hooks/useMessageOperations.ts` | Message operation hooks |
| `src/renderer/src/hooks/useAssistant.ts` | Assistant hooks |
| `src/renderer/src/hooks/useTopic.ts` | Topic hooks |
| `src/renderer/src/databases/index.ts` | Dexie schema (topics, messages, messageBlocks) |
| `src/renderer/src/types/index.ts` | Topic, Assistant type definitions |
| `src/renderer/src/types/newMessage.ts` | Message, MessageBlock type definitions |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding **message sending pipeline (thunk chain), message block system (text, thinking, code, image, tool, file, video, citation, error), streaming response handling (BlockManager), context window management (configurable message limit), assistant CRUD and default settings, topic lifecycle, token estimation, API call orchestration, MCP server integration for tools, multi-model message support (horizontal/vertical/fold/grid), message operations (edit, resend, regenerate, delete, clone), and translation initiation**
- Do not reference: Redux slice patterns (`createSlice`, `createAsyncThunk`, `useSelector`, `useDispatch`) -- migrating to Zustand; Ant Design UI components (`List`, `Input.TextArea`, `Menu`, `Dropdown`, `Select`) -- migrating to shadcn/ui; styled-components styling -- migrating to Tailwind CSS 4
- **Extract**: Message thunk chain (sendMessage, loadTopicMessages, resendMessage, regenerateAssistantResponse, deleteSingleMessage, deleteMessageGroup, clearTopicMessages, resendUserMessageWithEdit, updateMessageAndBlocks, cloneMessagesToNewTopic, appendAssistantResponse, removeBlocks, initiateTranslation), MessagesService logic (createMessage, attachFileBlocks, filterContextMessages), AssistantService logic (createAssistant, getDefaultSettings), BlockManager streaming handlers (handleTextBlock, handleToolBlock, handleImageBlock, handleThinkingBlock, handleCitationBlock), ApiService orchestration (transformMessagesAndFetch, getMcpServersForAssistant, fetchAllActiveServerTools), TokenService estimation, Dexie schema definitions
- **Ignore**: Redux-specific patterns (`createSlice`, `extraReducers`, `createAsyncThunk`), Ant Design component props, styled-components CSS-in-JS

### SBI Table (B061-B110)

| SBI ID | Behavior | Priority | Description |
|--------|----------|----------|-------------|
| B061 | sendMessage (thunk) | P1 | Main message sending with streaming |
| B062 | loadTopicMessagesThunk | P1 | Load messages from database |
| B063 | resendMessageThunk | P1 | Resend existing message |
| B064 | regenerateAssistantResponseThunk | P1 | Regenerate response |
| B065 | deleteSingleMessageThunk | P1 | Delete single message |
| B066 | deleteMessageGroupThunk | P1 | Delete message group |
| B067 | clearTopicMessagesThunk | P1 | Clear all topic messages |
| B068 | resendUserMessageWithEditThunk | P1 | Edit and resend |
| B069 | updateMessageAndBlocksThunk | P1 | Update message and blocks |
| B070 | cloneMessagesToNewTopicThunk | P2 | Clone to new conversation |
| B071 | appendAssistantResponseThunk | P2 | Append to response |
| B072 | removeBlocksThunk | P2 | Remove message blocks |
| B073 | initiateTranslationThunk | P2 | Start translation |
| B074 | MessagesService.createMessage | P1 | Build message from input |
| B075 | MessagesService.attachFileBlocks | P1 | Attach files to message |
| B076 | MessagesService.filterContextMessages | P1 | Filter by context window |
| B077 | AssistantService.createAssistant | P1 | Create new assistant |
| B078 | AssistantService.getDefaultSettings | P1 | Default assistant config |
| B079 | BlockManager.handleTextBlock | P1 | Process text streaming |
| B080 | BlockManager.handleToolBlock | P2 | Process tool calls |
| B081 | BlockManager.handleImageBlock | P2 | Process images |
| B082 | BlockManager.handleThinkingBlock | P2 | Process thinking blocks |
| B083 | BlockManager.handleCitationBlock | P2 | Process citations |
| B084 | ApiService.transformMessagesAndFetch | P1 | Transform and call AI |
| B085 | ApiService.getMcpServersForAssistant | P2 | Get MCP servers for assistant |
| B086 | ApiService.fetchAllActiveServerTools | P2 | Fetch active tools from MCP servers |
| B087 | TokenService.estimateTokens | P2 | Estimate token usage |
| B088 | useChatContext | P1 | Chat context provider hook |
| B089 | useMessageOperations | P1 | Message operation hooks (copy, edit, delete) |
| B090 | useAssistant | P1 | Assistant selection and management hook |
| B091 | useTopic | P1 | Topic creation and navigation hook |
| B092 | ChatMessages.render | P1 | Render message list with virtual scrolling |
| B093 | InputBar.submit | P1 | Handle message input and submission |
| B094 | InputBar.autoResize | P2 | Auto-resize textarea on content change |
| B095 | TopicList.render | P1 | Render topic list with drag reordering |
| B096 | AssistantList.render | P1 | Render assistant selection sidebar |
| B097 | MessageActions.copy | P2 | Copy message content to clipboard |
| B098 | MessageActions.edit | P2 | Edit existing message |
| B099 | MessageActions.regenerate | P2 | Regenerate assistant response |
| B100 | ModelSelector.select | P2 | Select model from dropdown |
| B101 | ConversationTabs.switch | P2 | Switch between conversation tabs |
| B102 | ConversationService.createTopic | P1 | Create new conversation topic |
| B103 | ConversationService.deleteTopic | P1 | Delete conversation topic |
| B104 | ConversationService.renameTopic | P2 | Rename conversation topic |
| B105 | MultiModelView.horizontal | P2 | Side-by-side model comparison |
| B106 | MultiModelView.vertical | P2 | Stacked model comparison |
| B107 | MultiModelView.fold | P3 | Collapsed model comparison |
| B108 | MultiModelView.grid | P3 | Grid model comparison |
| B109 | MessageBlock.renderByType | P1 | Render block based on type discriminator |
| B110 | StreamingIndicator.show | P2 | Display streaming progress indicator |

### UI Component Features

| Component | Library | Feature | Category |
|-----------|---------|---------|----------|
| ChatMessages | Ant Design List -> shadcn/ui ScrollArea | Virtual scrolling message list | messaging |
| InputBar | Ant Design Input.TextArea -> shadcn/ui Textarea | Auto-resize input with shortcuts | input |
| AssistantList | Ant Design Menu -> shadcn/ui Sidebar | Assistant selection sidebar | navigation |
| TopicList | Ant Design List -> shadcn/ui List | Conversation topic list with drag | navigation |
| MessageActions | Ant Design Dropdown -> shadcn/ui DropdownMenu | Copy, edit, delete, regenerate | actions |
| ModelSelector | Ant Design Select -> shadcn/ui Select | Model dropdown selection | selection |

### Static Resources

> Non-code files used by this Feature that must be **copied from the original source** during implementation.
> These files cannot be regenerated -- they must be copied as-is and placed in the appropriate location in the new project.
> Source Path is **relative to Source Root** (same as file paths above). Resolve as `[Source Root]/[Source Path]` at runtime.

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| (none) | | | Chat feature has no standalone static resources; icons and assets are shared from F001 |

> If resources need modification (e.g., resizing images, updating translation keys), note it in the Usage column.

### Environment Variables

> Environment variables required by this Feature at runtime. Variables marked as `secret` must NOT have their actual values recorded here -- only the variable name and purpose.

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| (none specific to F003) | | | Uses shared variables from F001 and F002 | |

**Shared variables** (defined by other Features but also used here):

| Variable | Owner Feature | Usage in This Feature |
|----------|--------------|----------------------|
| `ANGDU_LOGGER_MAIN_LEVEL` | F001-app-core | Log level for chat-related logging |

### Naming Remapping

| Original | Replacement | Location |
|----------|------------|----------|
| (none specific to F003) | | Brand names handled in F001; no chat-specific Cherry references |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F003-chat is the core conversation management feature that handles the full message lifecycle: creating conversations (topics), sending messages, streaming AI responses, managing assistants, and organizing message blocks. It implements a message block system supporting 9 block types (text, thinking, code, image, tool, file, video, citation, error), streaming response handling via BlockManager, context window management with configurable message limits, assistant CRUD with customizable settings (temperature, topP, maxTokens, system prompt), topic lifecycle (create, rename, delete, pin, clone), token usage estimation, API call orchestration through ApiService, MCP server integration for tool calling, and multi-model message support with 4 display modes (horizontal, vertical, fold, grid). The Redux thunk chain (13 thunks) orchestrates all message operations and will be migrated to Zustand actions.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Send message | User types in InputBar and sends; message is created, AI is called via streaming, response blocks are rendered incrementally |
| P1 | New conversation | User creates a new topic; assistant is assigned, topic appears in sidebar |
| P1 | Load conversation | User selects a topic; messages are loaded from Dexie database and rendered |
| P1 | Regenerate response | User clicks regenerate on an assistant message; previous response is replaced with new streaming response |
| P1 | Edit and resend | User edits a previous message and resends; downstream messages are regenerated |
| P1 | Delete message | User deletes a single message or message group; messages and blocks removed from database |
| P2 | Create assistant | User creates a custom assistant with specific settings (model, temperature, system prompt) |
| P2 | Clone conversation | User clones messages to a new topic for branching |
| P2 | Multi-model comparison | User sends same message to multiple models; responses displayed side-by-side |
| P2 | Tool calling | AI response includes tool calls; ToolExecutor processes them and results are appended |
| P2 | Token estimation | Token usage is estimated and displayed per message |
| P3 | Translation | User initiates translation of a message to another language |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Create/manage conversation topics with assistants
- **FR-002**: Send messages with streaming AI responses
- **FR-003**: Message block system (text, thinking, code, image, tool, file, video, citation, error)
- **FR-004**: Context window management with configurable message limit
- **FR-005**: Assistant CRUD with customizable settings
- **FR-006**: Message operations (edit, resend, regenerate, delete, clone)
- **FR-007**: Token usage tracking and estimation
- **FR-008**: Multi-model message support (horizontal/vertical/fold/grid)

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: Messages send and stream responses without errors for all supported providers
- **SC-002**: All 9 block types render correctly in message view
- **SC-003**: Context window correctly limits messages to configured count
- **SC-004**: Assistant settings persist and correctly configure AI requests
- **SC-005**: Edit-and-resend regenerates all downstream messages
- **SC-006**: Message operations (copy, delete, regenerate) complete without data corruption
- **SC-007**: Multi-model comparison displays responses from all selected models
- **SC-008**: Topic list correctly reflects create, rename, delete, and pin operations

### Edge Cases

- Streaming connection drops mid-response; partial blocks must be preserved and error block appended
- Context window with zero messages configured; only system prompt is sent
- Assistant deletion while conversation is active; graceful fallback to default assistant
- Concurrent message sends in same topic; must queue or reject
- Very long messages exceeding provider token limits; proper error surfacing
- Tool call returns error; error block appended, not crash
- Multi-model dispatch with one model failing; independent error handling per model
- Topic rename during active streaming; rename must not interrupt stream
- Message clone to new topic with blocks referencing deleted files
- Empty message submission (whitespace only); must be rejected

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-app-core | Infrastructure | Uses IPC framework, window management, config persistence, theme system |
| F002-ai-provider | Runtime | Uses RuntimeExecutor, streamText(), generateText() for AI calls; PluginEngine for tool use and web search; ModelResolver for model selection |
| F004-editor | Rendering | Uses markdown rendering, code highlighting, and mermaid diagrams for message block display |

### Related Entities (data-model.md draft)

#### Owned Entities

**Topic** -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique topic identifier (UUID) |
| type | string | required | Topic type discriminator |
| assistantId | string | FK | Reference to Assistant |
| name | string | required | Display name |
| createdAt | number | required | Creation timestamp |
| updatedAt | number | required | Last update timestamp |
| pinned | boolean | optional | Whether topic is pinned |
| prompt | string | optional | System prompt override |
| isNameManuallyEdited | boolean | optional | Prevents auto-rename |

**Message** -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique message identifier (UUID) |
| topicId | string | FK | Reference to Topic |
| role | string | required | user / assistant / system |
| assistantId | string | optional | Reference to Assistant (for assistant messages) |
| modelId | string | optional | Model used for this message |
| createdAt | number | required | Creation timestamp |
| status | string | required | pending / streaming / success / error |

**MessageBlock** -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique block identifier (UUID) |
| messageId | string | FK | Reference to Message |
| type | string | required | text / thinking / code / image / tool / file / video / citation / error |
| content | string | optional | Block content |
| metadata | object | optional | Type-specific metadata |
| createdAt | number | required | Creation timestamp |

**Assistant** -- Domain type (Zustand store, not Dexie)

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique assistant identifier (UUID) |
| name | string | required | Display name |
| prompt | string | optional | System prompt |
| modelId | string | optional | Default model |
| settings | object | optional | Temperature, topP, maxTokens, etc. |

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| Provider config | F002-ai-provider (runtime) | Read | Provider type and API key for AI calls |
| Model config | F002-ai-provider (runtime) | Read | Model ID and capabilities for execution |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| Zustand | `useMessageStore` | Message state and operations |
| Zustand | `useAssistantStore` | Assistant state and CRUD |
| Zustand | `useTopicStore` | Topic state and lifecycle |
| Hook | `useChatContext()` | Chat context provider |
| Hook | `useMessageOperations()` | Message operation hooks |
| Service | `MessagesService` | Message creation and filtering |
| Service | `ApiService` | AI API call orchestration |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| Function | `streamText()` | F002-ai-provider | Stream AI responses |
| Function | `generateText()` | F002-ai-provider | Generate non-streaming responses |
| Class | `ModelResolver` | F002-ai-provider | Resolve model ID to model object |
| Class | `PluginEngine` | F002-ai-provider | Execute plugins (tool use, web search) |
| IPC | `config:*` | F001-app-core | Read/write configuration |
| IPC | `window:*` | F001-app-core | Window operations |
| Component | Markdown rendering | F004-editor | Render message content as markdown |
| Component | Code highlighting | F004-editor | Syntax highlighting in code blocks |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Chat uses 13 Redux thunks for message operations, 3 Redux slices (newMessage, messageBlock, assistants), MessagesService for message construction and context filtering, BlockManager for streaming response handling with 5 block type handlers, ApiService for AI call orchestration with MCP server integration, TokenService for estimation, and Dexie for persistence. UI uses Ant Design List, Input.TextArea, Menu, Dropdown, and Select components with styled-components.
- **Recommended implementation approach**: Migrate Redux thunks to Zustand actions within the message/assistant/topic stores. Replace Ant Design UI components with shadcn/ui equivalents (ScrollArea, Textarea, Sidebar, DropdownMenu, Select). Replace styled-components with Tailwind CSS 4 utility classes. Keep MessagesService, BlockManager, ApiService, and TokenService logic as-is since they are framework-independent. Keep Dexie for persistence.
- **Caveats**: The 13 Redux thunks contain significant business logic that must be carefully migrated to Zustand actions while preserving the exact same operation semantics. BlockManager's streaming handlers are tightly coupled to the Redux dispatch pattern and need to be adapted for Zustand's setState. Multi-model view modes (horizontal/vertical/fold/grid) require layout rework with Tailwind CSS 4 instead of styled-components.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| AI execution integration | F002-ai-provider | Verify F003 correctly calls streamText/generateText through RuntimeExecutor |
| Plugin registration | F002-ai-provider | Verify F003 can register chat-specific plugins (tool use, web search) |
| Markdown rendering | F004-editor | Verify F003's message blocks render correctly through F004's markdown pipeline |
| Code block rendering | F004-editor | Verify F003's code blocks use F004's syntax highlighting |
| Mermaid diagrams | F004-editor | Verify F003's mermaid code blocks render as diagrams via F004 |
| IPC access | F001-app-core | Verify F003 can access config, window, and system IPC channels |
| Theme compatibility | F001-app-core | Verify F003's UI components respond correctly to theme changes |
| Dexie schema | F001-app-core | Verify Dexie schema includes Topic, Message, and MessageBlock tables |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F004-editor | Rendering impact | If message block types or content format changes, F004's rendering pipeline needs modification |
| F002-ai-provider | API usage impact | If message construction or context filtering logic changes, F002's expected input format may be affected |
