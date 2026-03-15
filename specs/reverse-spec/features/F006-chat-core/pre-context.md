# F006 — Chat Core — Pre-Context

> Feature ID: F006 | Tier: 1 | Release Group: RG-3

---

## Source Reference

| Key Source Files | Purpose |
|-----------------|---------|
| `src/renderer/src/types/index.ts` | Assistant, Topic, AssistantSettings, QuickPhrase types |
| `src/renderer/src/types/newMessage.ts` | Message, MessageBlock types and enums |
| `src/renderer/src/store/assistants.ts` | Assistant CRUD, topic management |
| `src/renderer/src/store/messageBlock.ts` | MessageBlock store |
| `src/renderer/src/store/newMessage.ts` | Message composition and state |
| `src/renderer/src/services/AssistantService.ts` | Default assistant/topic factory |
| `src/renderer/src/aiCore/` | Vercel AI SDK integration, streaming |
| `src/renderer/src/pages/home/` | Chat page UI |
| `src/renderer/src/databases/index.ts` | Dexie topics + message_blocks tables |
| `src/renderer/src/hooks/useTopic.ts` | Topic management hooks |

---

## Source Behavior Inventory (SBI)

| ID | Source File | Function/Method | Behavior | Pri | Origin |
|----|-----------|----------------|----------|-----|--------|
| B061 | `types/index.ts` | `Assistant` type | Assistant: id, name, prompt, emoji, model, topics[], settings, mcpMode, knowledge_bases | P1 | Source |
| B062 | `services/AssistantService.ts` | `getDefaultAssistant()` | Creates default assistant with default settings (temp=0.7, contextCount=20, stream=true) | P1 | Source |
| B063 | `store/assistants.ts` | `addAssistant()` / `removeAssistant()` | Add to front of list; remove by ID | P1 | Source |
| B064 | `store/assistants.ts` | `updateAssistantSettings()` | Merges partial settings into assistant; initializes settings if missing | P1 | Source |
| B065 | `types/index.ts` | `Topic` type | Topic: id, type, assistantId, name, messages[], pinned, isNameManuallyEdited | P1 | Source |
| B066 | `hooks/useTopic.ts` | `TopicManager` | Topic CRUD: create, rename, delete, pin/unpin, auto-name from first message | P1 | Source |
| B067 | `types/newMessage.ts` | `Message` type | Message: id, role, status, blocks[], model, usage, metrics, askId, mentions | P1 | Source |
| B068 | `types/newMessage.ts` | `MessageBlockType` enum | Block types: unknown, main_text, thinking, translation, image, code, tool, file, error, citation, video, compact | P1 | Source |
| B069 | `types/newMessage.ts` | `MessageBlockStatus` enum | Status: pending, processing, streaming, success, error, paused | P1 | Source |
| B070 | `types/newMessage.ts` | `MainTextMessageBlock` | Text content block with optional knowledgeBaseIds and citation references | P1 | Source |
| B071 | `types/newMessage.ts` | `ThinkingMessageBlock` | Thinking/reasoning content with thinking_millsec duration | P1 | Source |
| B072 | `aiCore/` | Streaming integration | Vercel AI SDK streamText/generateText; handles streaming lifecycle, abort, retry | P1 | Source |
| B073 | `types/index.ts` | `AssistantSettings` | Per-assistant: temperature, topP, maxTokens, contextCount, streamOutput, reasoning_effort, toolUseMode | P1 | Source |
| B074 | `types/index.ts` | `getEffectiveMcpMode()` | MCP mode fallback: explicit mcpMode or legacy detection from mcpServers presence | P2 | Source |
| B075 | `types/index.ts` | `Usage` / `Metrics` | Token usage (prompt, completion, thoughts) and timing metrics (first token, completion, thinking) | P2 | Source |
| B076 | `store/assistants.ts` | `tagsOrder` / `collapsedTags` | Assistant organization by tags with ordering and collapse state | P2 | Source |
| B077 | `types/index.ts` | `AssistantMessage[]` | Preset conversation starters (role + content pairs) | P2 | Source |
| B078 | `types/newMessage.ts` | `askId` linking | Assistant message references user message via askId for threading | P1 | Source |

---

## For /speckit.specify Hints

- Define assistant lifecycle (create, edit, delete, duplicate)
- Specify topic auto-naming protocol
- Document message composition flow (user types -> send -> stream -> display)
- Define block architecture: message contains block IDs, blocks stored separately
- Specify streaming state machine (pending -> processing -> streaming -> success/error/paused)
- Document context window management (contextCount, clear markers)

## For /speckit.plan Hints

- Task 1: Assistant Zustand store with CRUD
- Task 2: Topic store and management
- Task 3: Message/block store with SQLite persistence
- Task 4: Message composer component with toolbar
- Task 5: Vercel AI SDK streaming integration
- Task 6: Message display with block rendering (text, thinking, code)
- Task 7: Message actions (copy, edit, regenerate, delete)
- Task 8: Topic auto-naming service

---

## Feature Contracts

| Direction | Feature | Contract |
|-----------|---------|----------|
| Depends on F004 | Provider Management | Provider config for API calls |
| Depends on F005 | Model Management | Model selection |
| Depends on F008 | Data & Storage | Message/block persistence, file attachments |
| Depends on F002 | Navigation & Layout | Route: /chat/:assistantId |
| Provides to F010 | Chat Advanced | Message/block architecture, streaming infrastructure |
| Provides to F011 | Knowledge Base | Assistant.knowledge_bases attachment |
| Provides to F012 | MCP Integration | Assistant.mcpMode and mcpServers |
