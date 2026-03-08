# F003-chat-core — Pre-Context

**Feature**: Assistants, topics, messages, message blocks, conversation management
**Release Group**: RG-2 | **Tier**: T1

---

## 1. Runtime Exploration Results

- **Assistant Model**: Assistants are configurable AI personas with system prompts, model preferences, temperature, context count, and topic lists. Default assistant created on first run.
- **Topic Management**: Each assistant has multiple topics (conversations). Topics contain ordered messages. CRUD via Redux slice.
- **Message Architecture**: Two-level structure — `Message` (user/assistant turn) contains `MessageBlock[]` (text, thinking, code, image, tool, citation, error, etc.). Entity adapter pattern for normalized state.
- **Message Block Types**: 11 types — `UNKNOWN`, `MAIN_TEXT`, `THINKING`, `TRANSLATION`, `IMAGE`, `CODE`, `TOOL`, `FILE`, `ERROR`, `CITATION`, `VIDEO`, `COMPACT`.
- **Message Block Status**: 6 states — `PENDING`, `PROCESSING`, `STREAMING`, `SUCCESS`, `ERROR`, `PAUSED`.
- **Database Layer**: `src/renderer/src/databases/` provides persistence with upgrade migrations.
- **Assistant Presets**: Shareable assistant configurations.
- **Tags & Ordering**: Assistants support tags with collapsible groups and custom tag ordering.
- **Unified List**: Agents and assistants share a unified ordering list.

---

## 2. Source Reference

| File | Role |
|------|------|
| `src/renderer/src/store/assistants.ts` | Redux slice: assistant CRUD, topic management, presets, tags |
| `src/renderer/src/store/newMessage.ts` | Redux slice: message entity adapter, topic-message mapping |
| `src/renderer/src/store/messageBlock.ts` | Redux slice: message block entity adapter, block CRUD |
| `src/renderer/src/types/newMessage.ts` | Message, MessageBlock, MessageBlockType/Status enums |
| `src/renderer/src/types/index.ts` | Core type definitions (Assistant, Topic, Model, etc.) |
| `src/renderer/src/types/chat.ts` | Chat-specific types |
| `src/renderer/src/databases/index.ts` | Database initialization and access |
| `src/renderer/src/databases/upgrades.ts` | Database migration scripts |
| `src/renderer/src/services/AssistantService.ts` | Assistant defaults and utilities |
| `src/renderer/src/hooks/useTopic.ts` | `TopicManager` hook for topic operations |
| `src/renderer/src/store/thunk/` | Async thunks for message loading |
| `src/renderer/src/config/constant.ts` | Default temperature, context count |

---

## 3. Source Behavior Inventory

| ID | Behavior | Priority | Source |
|----|----------|----------|--------|
| B036 | Create default assistant with system prompt and default model | P1 | `AssistantService`, `store/assistants.ts` |
| B037 | CRUD assistants (add, update, remove, reorder) | P1 | `store/assistants.ts` |
| B038 | Update assistant settings (temperature, context count, model, prompt) | P1 | `store/assistants.ts` |
| B039 | Create, rename, delete topics within an assistant | P1 | `store/assistants.ts` |
| B040 | Load messages for a topic (lazy, paginated via entity adapter) | P1 | `store/newMessage.ts` |
| B041 | Add user message to topic | P1 | `store/newMessage.ts` |
| B042 | Add assistant message with streaming block updates | P1 | `store/newMessage.ts` |
| B043 | Create and update message blocks (main text, thinking, code, etc.) | P1 | `store/messageBlock.ts` |
| B044 | Track message block status transitions (pending -> streaming -> success/error) | P1 | `store/messageBlock.ts` |
| B045 | Upsert block references within messages | P1 | `store/newMessage.ts` |
| B046 | Remove messages by ID or askId (for retry/regenerate) | P1 | `store/newMessage.ts` |
| B047 | Manage topic-to-message-ID mapping | P1 | `store/newMessage.ts` |
| B048 | Persist messages and blocks to database | P1 | `databases/` |
| B049 | Run database upgrade migrations | P2 | `databases/upgrades.ts` |
| B050 | Manage assistant presets (create, apply, share) | P2 | `store/assistants.ts` |
| B051 | Manage assistant tags with ordering and collapse state | P2 | `store/assistants.ts` |
| B052 | Insert assistant at specific position in list | P2 | `store/assistants.ts` |
| B053 | Manage unified list order (agents + assistants) | P2 | `store/assistants.ts` |
| B054 | Track display count for message pagination | P3 | `store/newMessage.ts` |
| B055 | Normalize topics array (handle legacy data) | P3 | `store/assistants.ts` |

---

## 4. UI Component Features

| AntD Component (Current) | shadcn/ui Replacement | Usage Context |
|---------------------------|----------------------|---------------|
| List, List.Item | Custom list / Card | Assistant list, topic list |
| Input, TextArea | Input, Textarea | Topic rename, system prompt |
| Modal | Dialog | New assistant, delete confirmation |
| Dropdown | DropdownMenu | Assistant actions menu |
| Tag | Badge | Assistant tags |
| Slider | Slider | Temperature, context count |
| Collapse | Collapsible | Tag groups |
| Tooltip | Tooltip | Assistant info |

---

## 5. Naming Remapping

| Current Identifier | Location | Suggested Replacement |
|--------------------|----------|-----------------------|
| No Cherry-specific identifiers in core chat types | — | — |

> F003 entities (Assistant, Topic, Message, MessageBlock) are domain-generic and do not contain Cherry branding.

---

## 6. Static Resources

| Resource | Path | Notes |
|----------|------|-------|
| Default avatar | `src/renderer/src/assets/images/avatar.png` | Default assistant avatar |

---

## 7. Environment Variables

| Variable | Scope | Description |
|----------|-------|-------------|
| None specific to F003 | — | — |

---

## 8. For /speckit.specify

**Feature Summary**: Core conversation data model implementing assistants (AI personas), topics (conversations), messages (turns), and message blocks (content units). Provides CRUD operations, persistence, and state management for the chat system.

**User Scenarios**:
- US-012: User creates a new assistant with custom system prompt and model
- US-013: User starts a new topic within an assistant
- US-014: User sends a message; assistant response streams in as message blocks
- US-015: User retries a failed message (removes old, sends new)
- US-016: User deletes a topic and all its messages
- US-017: User applies an assistant preset

**Draft Requirements**:
- FR-019: System SHALL support creating assistants with configurable system prompts, models, and parameters
- FR-020: System SHALL manage topics as ordered conversation containers within assistants
- FR-021: System SHALL represent messages as containers for typed message blocks
- FR-022: System SHALL support 11 message block types (text, thinking, code, image, tool, etc.)
- FR-023: System SHALL track block status through defined state machine (pending->streaming->success)
- FR-024: System SHALL persist all conversation data to local database
- FR-025: System SHALL support message removal by ID or askId for retry flows
- FR-026: System SHALL support assistant presets for configuration sharing

**Success Criteria**:
- SC-009: Messages load for a topic within 200ms
- SC-010: Block status transitions are atomic and consistent
- SC-011: Database upgrades run idempotently without data loss
- SC-012: Assistant CRUD operations reflect immediately in UI

---

## 9. For /speckit.plan

**Dependencies**:
- Upstream: F001 (IPC for database access if needed), F002 (model references in assistant config)
- Downstream: F005 (chat UI renders messages/blocks), F004 (backup/restore includes conversation data)

**Entity/API Contracts**:
- `Assistant` — `{ id, name, prompt, model, topics: Topic[], settings: AssistantSettings, tags, emoji, ... }`
- `Topic` — `{ id, name, createdAt, updatedAt, ... }`
- `Message` — `{ id, topicId, role, blocks: BlockReference[], askId, createdAt, ... }`
- `MessageBlock` — discriminated union on `type` field (11 variants)
- `AssistantSettings` — `{ temperature, contextCount, maxTokens, ... }`
- `MessageBlockStatus` — enum with 6 states
- Store migration: Three Redux slices (`assistants`, `newMessage`, `messageBlocks`) -> Zustand stores. Entity adapter pattern can be replaced with Map-based normalized state in Zustand.

---

## 10. For /speckit.analyze

**Cross-Feature Verification Points**:
- F003 <-> F002: Assistant model references must resolve to valid providers/models in F002
- F003 <-> F005: Chat UI subscribes to message/block state changes; block status drives UI rendering
- F003 <-> F004: Backup/restore must serialize/deserialize all conversation data faithfully
- F003 <-> F006: Tool message blocks reference MCP tool calls and responses
- Redux->Zustand migration: Three heavily-used slices with entity adapters. `newMessage` and `messageBlock` use `createEntityAdapter` — needs equivalent normalized store in Zustand (consider `zustand-entity` or manual normalized state).
