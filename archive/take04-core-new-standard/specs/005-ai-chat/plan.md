# Implementation Plan: AI Chat

**Branch**: `005-ai-chat` | **Date**: 2026-03-04 | **Spec**: specs/005-ai-chat/spec.md
**Input**: Feature specification from `/specs/005-ai-chat/spec.md`

## Summary

F005 implements the primary AI chat interface — the most user-facing Feature in Cherry Studio. It manages the full message lifecycle: composing messages, streaming AI responses token-by-token via F003's RuntimeExecutor, accumulating responses into 12 block types, and persisting conversations. Key capabilities include assistant and topic management, multi-model dispatch, context window management, RAG integration via F004, and block-based rendering with support for reasoning, code, tools, citations, and more.

## Technical Context

**Language/Version**: TypeScript 5.8
**Primary Dependencies**: React 19, Zustand (state), Dexie 4 (persistence), AI SDK v6 via F003 (streaming), shadcn/ui + Radix (UI), Tailwind CSS 4 (styling), TanStack Router (navigation)
**Storage**: Dexie IndexedDB (messages, blocks, topics, assistants, quick phrases)
**Testing**: Vitest (unit/integration)
**Target Platform**: Electron 40 (macOS, Windows, Linux)
**Project Type**: Desktop app (Electron renderer process)
**Performance Goals**: First streaming token <2s, stream cancellation <500ms, smooth block rendering
**Constraints**: Block rendering must handle 1000+ messages per topic without UI jank, multi-window state sync required
**Scale/Scope**: 6 entities, 3 Zustand stores, ~15 source files, 11 user stories

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Electron Process Isolation | ✅ | F005 operates in renderer; uses F003 API directly (same process), F004 via IPC |
| II. Service Layer Pattern | ✅ | Component → Hook → Service → Store pattern followed |
| III. Multi-Provider Abstraction | ✅ | F005 delegates provider handling to F003 |
| V. Typed IPC Channel System | ✅ | Uses existing typed channels from F001/F004 |
| VI. Persistent State with Migration | ✅ | Dexie v3 with forward migration |
| VII. Multi-Window State Sync | ✅ | broadcastSync on useAssistantStore |
| IX. Streaming-First Architecture | ✅ | Token-by-token streaming is the core pipeline |
| X. Desktop Data Sovereignty | ✅ | All messages stored locally in IndexedDB |
| XIV. Test-First | ✅ | Tests written before implementation per task plan |
| XVI. Simplicity First | ✅ | No speculative features beyond spec |
| XIX. Demo-Ready Delivery | ✅ | demos/F005-ai-chat.md will be created |

## Architecture

### File Structure

```
packages/shared/types/
  chat.ts                          # Assistant, Topic, Message, MessageBlock, QuickPhrase types

src/renderer/src/
  stores/
    useAssistantStore.ts           # Assistant + topic CRUD state
    useMessageStore.ts             # Message + block normalized state
    useRuntimeStore.ts             # Transient runtime state (active assistant/topic, generating)
  services/
    MessagesService.ts             # Message pipeline (compose, context, KB inject, stream, persist)
    TopicNamingService.ts          # Topic auto-naming logic
  hooks/
    useAssistant.ts                # Assistant management hook
    useTopic.ts                    # Topic management hook
    useMessages.ts                 # Message operations hook
    useBlockRenderer.ts            # Block rendering dispatch hook
  lib/
    db.ts                          # (MODIFY) Dexie v3 schema — add 5 new tables

tests/unit/renderer/
  stores/
    useAssistantStore.test.ts
    useMessageStore.test.ts
    useRuntimeStore.test.ts
  services/
    MessagesService.test.ts
    TopicNamingService.test.ts
  hooks/
    useAssistant.test.ts
    useTopic.test.ts

demos/
  F005-ai-chat.md                  # Demo guide
```

### Data Flow

```
User Input → useMessages.sendMessage()
  → MessagesService.createUserMessage()
  → useMessageStore.addMessage() + Dexie persist
  → MessagesService.createAssistantMessage()
  → MessagesService.filterContextMessages(contextCount)
  → [KB search if knowledgeBaseIds] → inject RAG context
  → F003 RuntimeExecutor.executeStream()
  → Token stream → accumulate blocks → upsertBlock()
  → On complete: message status → SUCCESS, Dexie persist
  → [Auto-rename topic if applicable]
```

### Dexie Schema Migration (v2 → v3)

```typescript
this.version(3).stores({
  files: 'id, name, type, created_at',           // v1 (F001)
  knowledge_notes: '&id',                          // v2 (F004)
  assistants: '&id, type',                         // v3 (F005)
  topics: '&id, assistantId, pinned',              // v3 (F005)
  messages: '&id, topicId, assistantId, createdAt',// v3 (F005)
  message_blocks: '&id, messageId, type',          // v3 (F005)
  quick_phrases: '&id, enabled'                    // v3 (F005)
})
```

### Dependencies on Completed Features

| Feature | What is Used | How |
|---------|-------------|-----|
| F001 | Dexie database, IPC bridge, broadcastSync, TanStack Router, file:* channels | Direct import |
| F002 | Provider/Model entities, useProviderStore | Read-only access for model resolution |
| F003 | RuntimeExecutor, executeStream() | Direct import for AI streaming |
| F004 | KB search via window.api.knowledge.search() | IPC call for RAG injection |

### Dependencies on Deferred Features (Stubs)

| Feature | Interface | Stub Behavior |
|---------|-----------|---------------|
| F006 (MCP) | assistant.mcpServers, mcpMode, Tool blocks | MCP fields stored but no server communication; Tool blocks render if AI returns them |

## Implementation Phases

### Phase 1: Setup & Types (Foundation)
- Define shared types (Assistant, AssistantSettings, Topic, Message, MessageBlock, QuickPhrase, enums)
- Dexie v3 schema migration
- Verify type compatibility with F001/F002/F003/F004

### Phase 2: Stores (State Management)
- useAssistantStore (persist + broadcastSync)
- useMessageStore (Dexie-backed, broadcastSync for active topic)
- useRuntimeStore (transient, per-window)

### Phase 3: Core Services
- MessagesService (message pipeline, context window, block creation)
- TopicNamingService (auto-naming with lock, fallback)

### Phase 4: Hooks
- useAssistant (assistant management, reasoning sync)
- useTopic (topic management, active topic)
- useMessages (send message, cancel, edit, retry, delete)
- useBlockRenderer (block type dispatch)

### Phase 5: Message Streaming Pipeline
- Integration with F003 executeStream
- Block accumulation during streaming
- Status lifecycle management (PENDING → PROCESSING → SUCCESS/ERROR)
- KB injection (F004 integration)
- Rate limiting check

### Phase 6: Multi-Model Dispatch
- Parallel execution via Promise.allSettled
- Independent message per model
- Display style configuration

### Phase 7: Quick Phrases
- QuickPhrase CRUD in store
- Insert into message input

### Phase 8: Tests
- Store tests (useAssistantStore, useMessageStore, useRuntimeStore)
- Service tests (MessagesService, TopicNamingService)
- Hook tests (useAssistant, useTopic)
- Integration tests (streaming pipeline, multi-model)

### Phase 9: Demo
- demos/F005-ai-chat.md
- Verification instructions

### Phase 10: Polish
- Edge case handling
- Error recovery
- Performance optimization for large topics
