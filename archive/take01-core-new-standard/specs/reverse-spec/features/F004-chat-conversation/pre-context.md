# Pre-Context: Chat & Conversation

**Feature ID**: F004
**Tier**: Tier 1
**Generated**: 2026-03-02

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/renderer/src/store/assistants.ts` | Assistants Redux slice |
| `src/renderer/src/store/newMessage.ts` | Messages entity adapter slice |
| `src/renderer/src/store/messageBlock.ts` | MessageBlocks entity adapter slice |
| `src/renderer/src/store/runtime.ts` | Runtime transient state |
| `src/renderer/src/store/tabs.ts` | Tab management |
| `src/renderer/src/store/thunk/messageThunk.ts` | Message send/receive thunks |
| `src/renderer/src/services/ConversationService.ts` | Message preprocessing pipeline |
| `src/renderer/src/services/ApiService.ts` | API orchestration (transformMessagesAndFetch) |
| `src/renderer/src/types/newMessage.ts` | Message and MessageBlock type definitions |
| `src/renderer/src/types/index.ts` | Assistant, Topic, AssistantSettings types |
| `src/renderer/src/databases/index.ts` | Dexie schema for topics/messages/blocks |
| `src/renderer/src/pages/home/` | Chat UI pages (454 files) |
| `src/renderer/src/components/` | Chat components (301 files) |
| `src/renderer/src/hooks/` | Custom hooks (82 files) |
| `src/renderer/src/store/migrate.ts` | State migrations for message format |
| `src/main/services/StoreSyncService.ts` | Cross-window Redux sync |

### Reference Guide

#### [New Stack] Logic-Only Reference
- Extract: Message lifecycle (create → send → stream → complete), context preprocessing pipeline (10 steps), topic naming logic, multi-model dispatch, block update throttling strategy, Dexie persistence patterns
- Ignore: Redux entity adapter patterns, Redux thunk patterns, Ant Design chat components, Styled Components

### Static Resources

None — uses provider/model images from F003.

### Environment Variables

None — uses shared variables from preceding Features.

---

## For /speckit.specify

### Existing Feature Summary

Chat & Conversation is the core user interaction model. Manages Assistants (with system prompts, settings, knowledge bases, MCP servers), Topics (conversation threads), Messages (user/assistant/system with status tracking), and MessageBlocks (content units: text, thinking, tool, citation, image, file, code, error). Features multi-model responses, per-topic message queues, throttled block updates during streaming, 10-step message preprocessing, auto topic naming, and cross-window state sync.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Send Message | User types and sends message; assistant responds with streaming text |
| P1 | Create Assistant | User creates assistant with name, prompt, model; new topic auto-created |
| P1 | Switch Topic | User clicks different topic; messages load from IndexedDB |
| P1 | Multi-Model | User @mentions multiple models; parallel responses shown |
| P2 | Clear Context | User clears context; subsequent messages don't include prior history |
| P2 | Pin Topic | User pins important topic; it stays at top of list |
| P2 | Cancel Stream | User clicks stop; streaming cancels via AbortController |

### Draft Requirements

- **FR-025**: Implement Assistant CRUD with system prompt, model selection, settings, knowledge base attachment, MCP server selection
- **FR-026**: Implement Topic management (create, rename, delete, pin, switch)
- **FR-027**: Implement Message + MessageBlock architecture with normalized storage in Dexie
- **FR-028**: Implement message send flow: user message → context preprocessing → AI call → streaming → block updates
- **FR-029**: Implement 10-step message preprocessing pipeline for context management
- **FR-030**: Implement multi-model response (mention models with @)
- **FR-031**: Implement per-topic message queues for ordered processing
- **FR-032**: Implement throttled block updates during streaming (150ms + requestAnimationFrame)
- **FR-033**: Implement auto topic naming via quickModel summary
- **FR-034**: Implement cross-window state sync for assistants/topics

### Draft Acceptance Criteria

- **SC-014**: Message send-to-first-token latency under 2 seconds (excluding AI provider latency)
- **SC-015**: Streaming updates render smoothly at 60fps with throttled block updates
- **SC-016**: Context preprocessing correctly filters messages per the 10-step pipeline
- **SC-017**: Multi-model responses show parallel outputs from all mentioned models
- **SC-018**: Topic switch loads messages from IndexedDB within 200ms

### Edge Cases

- Empty message (validation: must have content or files)
- Message during active stream (queue ensures ordering)
- Topic with 1000+ messages (pagination/virtualization needed)
- Cross-window topic edit conflicts (sync service handles)
- Assistant deletion while topic is active (graceful cleanup)

---

## For /speckit.plan

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-app-core | Dexie DB | Topics, messages, message_blocks stored in IndexedDB |
| F001-app-core | File storage | Message file attachments use file:upload/read IPC |
| F003-provider-management | Model reference | Assistants reference Model entity for AI calls |

### Related Entities

#### Owned Entities

**Assistant** — 22 fields (see entity-registry.md)
**AssistantSettings** — 14 fields
**Topic** — 11 fields
**Message** — 18 fields
**MessageBlock** — 12 fields (union type with 12 block types)
**QuickPhrase** — 5 fields
**Citation** — 7 fields
**Usage** — 5 fields
**Metrics** — 4 fields
**User** — 4 fields

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| Model | F003-provider-management | Embedded ref | Assistant default model, message model |
| FileMetadata | F001-app-core | ID reference | Message file attachments |
| KnowledgeBase | F006-knowledge-base | Embedded refs | Assistant knowledge base attachment |
| MCPServer | F007-mcp | Embedded refs | Assistant MCP server selection |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Redux entity adapter for normalized message/block state. Thunks orchestrate async message flow. Dexie for persistence. 150ms throttled updates with RAF batching.
- **Recommended implementation approach**: Zustand store with Map-based collections (replacing entity adapter). Keep Dexie for persistence. Implement custom throttle/batch utility for block updates. Keep the 10-step preprocessing pipeline as-is (framework-agnostic logic).
- **Caveats**: The message thunk is the most complex piece (~900 lines). Carefully decompose into smaller functions. Consider a state machine for message lifecycle (pending → streaming → success/error).

---

## For /speckit.analyze

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Message format | F005 | Verify Message/Block format is compatible with AI completion pipeline |
| Knowledge injection | F006 | Verify knowledge search results integrate into message context |
| MCP tool blocks | F007 | Verify tool call/result blocks render correctly |
| Memory extraction | F008 | Verify conversation content feeds memory extraction |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F005 | Message format | If Message/Block schema changes, completion pipeline needs updates |
| F006 | Knowledge refs | If assistant.knowledge_bases changes, RAG injection affected |
| F007 | MCP refs | If assistant.mcpServers changes, tool availability affected |
