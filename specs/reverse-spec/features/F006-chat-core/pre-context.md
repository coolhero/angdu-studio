# F006-chat-core Pre-Context

## Feature Overview

| Field | Value |
|-------|-------|
| Feature ID | F006-chat-core |
| Title | Chat Core |
| Tier | 1 (Core) |
| Risk Group | RG-3 |
| Dependencies | F005-assistants, F003-providers, F007-files |
| SBI Range | B059 - B090 |

## Scope

Conversations/topics, message streaming, input bar, message blocks, multi-window sync, and tab management. This is the largest feature by SBI count and the central interaction surface of the application. It covers the full message lifecycle: composing, sending, streaming responses, rendering blocks (text, code, thinking, tool calls, images, citations), and managing conversation history.

## Migration Notes

- **Original**: Cherry Studio
- **Target**: Angdu Studio (Electron + React 19 + Zustand + Tailwind 4 + shadcn/ui + Vite 7)
- **Naming**: Cherry -> Angdu, CS -> AS, CherryStudio -> AngduStudio
- **State management**: Redux slices migrate to Zustand stores

## Key Source Files (relative to cherry-studio)

| Path | Role |
|------|------|
| src/renderer/src/pages/home/ | Chat page components (input bar, message list, navbar, topic list) |
| src/renderer/src/store/messages.ts | Message store (newMessage.ts format) |
| src/renderer/src/store/messageBlocks.ts | Message block store |
| src/renderer/src/store/runtime.ts | Runtime state (active topic, generating flag) |
| src/renderer/src/store/tabs.ts | Tab bar state |
| src/renderer/src/services/messageStreaming/ | Stream callbacks, block manager |
| src/renderer/src/services/ConversationService.ts | Conversation/topic CRUD |
| src/renderer/src/services/StoreSyncService.ts | Cross-window Redux sync via IPC |
| src/renderer/src/types/newMessage.ts | Message block types |
| src/renderer/src/handler/ | Event handlers |

## Source Behavior Inventory

| ID | Source File | Function/Method | Behavior Description | Priority | Origin |
|----|-------------|----------------|---------------------|----------|--------|
| B059 | store/runtime.ts | setActiveTopicOrSession() | Sets the active conversation or agent session | P1 | extracted |
| B060 | services/ConversationService.ts | createTopic() | Creates new conversation topic | P1 | extracted |
| B061 | services/ConversationService.ts | deleteTopic() | Deletes topic and all messages | P1 | extracted |
| B062 | services/ConversationService.ts | addMessage() | Adds user message to topic | P1 | extracted |
| B063 | services/ConversationService.ts | updateMessage() | Updates message content or status | P1 | extracted |
| B064 | services/messageStreaming/BlockManager.ts | createBlock() | Creates message block during streaming | P1 | extracted |
| B065 | services/messageStreaming/BlockManager.ts | updateBlockStatus() | Updates block status (PENDING->STREAMING->SUCCESS) | P1 | extracted |
| B066 | services/messageStreaming/ | onTextDelta() | Handles streaming text delta callback | P1 | extracted |
| B067 | services/messageStreaming/ | onThinkingDelta() | Handles thinking block streaming | P1 | extracted |
| B068 | services/messageStreaming/ | onToolStart() | Handles tool invocation start | P2 | extracted |
| B069 | services/messageStreaming/ | onToolEnd() | Handles tool invocation result | P2 | extracted |
| B070 | services/messageStreaming/ | onImageGenerated() | Handles image generation result | P2 | extracted |
| B071 | services/messageStreaming/ | onCitationFound() | Handles citation/reference from web search | P2 | extracted |
| B072 | store/tabs.ts | addTab() | Adds new tab to top tab bar | P1 | extracted |
| B073 | store/tabs.ts | removeTab() | Closes tab | P1 | extracted |
| B074 | store/tabs.ts | setActiveTab() | Switches active tab | P1 | extracted |
| B075 | pages/home/ | renderInputBar() | Renders message input with tool buttons | P1 | extracted |
| B076 | pages/home/ | renderChatMessages() | Renders message list with blocks | P1 | extracted |
| B077 | pages/home/ | renderChatNavBar() | Renders chat header (assistant name, model, actions) | P1 | extracted |
| B078 | services/ | StoreSyncService | Synchronizes Redux state across windows via IPC | P1 | extracted |
| B079 | store/runtime.ts | setGenerating() | Sets generating state (blocks new messages while streaming) | P1 | extracted |
| B080 | pages/home/ | handleSendMessage() | Dispatches message send with model/assistant context | P1 | extracted |
| B081 | pages/home/ | handleStopGeneration() | Stops active message streaming | P1 | extracted |
| B082 | services/ConversationService.ts | clearTopic() | Clears all messages in a topic | P2 | extracted |
| B083 | store/messages.ts | updateMessageBlock() | Updates a specific block within a message | P1 | extracted |
| B084 | pages/home/ | renderTopicList() | Renders topic sidebar with search | P2 | extracted |
| B085 | store/tabs.ts | updateTab() | Updates tab title/properties | P2 | extracted |
| B086 | pages/home/ | handleNewTopic() | Creates new topic for current assistant | P1 | extracted |
| B087 | pages/home/ | handleRenameTopic() | Renames conversation topic | P2 | extracted |
| B088 | pages/home/ | handleDeleteTopic() | Deletes topic with confirmation | P2 | extracted |
| B089 | services/messageStreaming/ | onCodeBlock() | Handles code block extraction from stream | P2 | extracted |
| B090 | store/runtime.ts | setTranslating() | Sets translation state flag | P3 | extracted |

## Priority Breakdown

| Priority | Count | IDs |
|----------|-------|-----|
| P1 | 20 | B059-B067, B072-B081, B083, B086 |
| P2 | 11 | B068-B071, B082, B084, B085, B087-B089 |
| P3 | 1 | B090 |

## Dependency Graph

```
F005-assistants ──┐
                  │
F003-providers ───┼──> F006-chat-core ──> F009-agents
                  │                   ──> F010-knowledge
F007-files ───────┘
```

- **F005-assistants**: Each conversation is scoped to an assistant. The assistant provides system prompt, model binding, and generation settings.
- **F003-providers**: Message streaming requires an active provider/model to call the LLM API.
- **F007-files**: File attachments in messages depend on the file management layer.

## Key Design Decisions for Angdu Studio

1. **Message block architecture**: Retain the block-based message model (text, thinking, tool_call, image, citation, code). Each message contains an ordered array of blocks.
2. **Streaming callbacks**: Migrate streaming callbacks to a clean event-based pattern. The BlockManager remains the central coordinator.
3. **Zustand stores**: runtime.ts, tabs.ts, messages.ts all migrate from Redux to Zustand with immer.
4. **Multi-window sync**: StoreSyncService migrates from Redux-based sync to Zustand-compatible IPC sync. Consider zustand-middleware or custom IPC bridge.
5. **Tab management**: Top tab bar for multiple conversations. Each tab maps to a topic+assistant pair.
6. **Generating guard**: The `setGenerating()` flag prevents concurrent message sends during active streaming. This is critical for UX correctness.
