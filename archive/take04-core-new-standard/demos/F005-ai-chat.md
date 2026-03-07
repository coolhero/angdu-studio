# Demo: F005 — AI Chat

**Feature**: AI Chat — message lifecycle, streaming responses, block-based rendering, assistant/topic management
**Status**: Implemented

---

## Demo Components

| Component | Type | Fate | Location |
|-----------|------|------|----------|
| Chat types | Production | Shared types | `packages/shared/types/chat.ts` |
| Dexie v3 schema | Production | DB migration | `src/renderer/src/lib/db.ts` |
| useAssistantStore | Production | Zustand store | `src/renderer/src/stores/useAssistantStore.ts` |
| useMessageStore | Production | Zustand store | `src/renderer/src/stores/useMessageStore.ts` |
| useRuntimeStore | Production | Zustand store | `src/renderer/src/stores/useRuntimeStore.ts` |
| MessagesService | Production | Service | `src/renderer/src/services/MessagesService.ts` |
| TopicNamingService | Production | Service | `src/renderer/src/services/TopicNamingService.ts` |
| TopicManager | Production | Service | `src/renderer/src/services/TopicManager.ts` |
| BlockRenderUtils | Production | Service | `src/renderer/src/services/BlockRenderUtils.ts` |
| QuickPhraseService | Production | Service | `src/renderer/src/services/QuickPhraseService.ts` |
| useMessages | Production | React hook | `src/renderer/src/hooks/useMessages.ts` |
| useAssistant | Production | React hook | `src/renderer/src/hooks/useAssistant.ts` |
| useTopic | Production | React hook | `src/renderer/src/hooks/useTopic.ts` |
| useBlockRenderer | Production | React hook | `src/renderer/src/hooks/useBlockRenderer.ts` |

---

## How to Demo

### Prerequisites
- Node.js 20+, pnpm installed
- A configured AI provider (e.g., OpenAI) in F002

### Step 1: Run Tests
```bash
pnpm test -- --run tests/unit/renderer/
```
Verifies all F005 components: stores, services, hooks, and block rendering.

### Step 2: Architecture Overview

The AI chat implements a block-based message pipeline:

```
User types message → MessagesService.createUserMessage()
  → useMessages.sendMessage() → validate → build context window
  → KB injection (if knowledgeBaseIds) → resolve provider/model
  → F003 RuntimeExecutor.streamText() → stream tokens
  → accumulate blocks (MainText, Thinking, Code, Tool, etc.)
  → persist to Dexie IndexedDB → update Zustand stores
```

### Step 3: Key Features to Verify

1. **12 Block Types**: main_text, thinking, translation, image, code, tool, file, error, citation, video, compact, unknown
2. **Streaming Pipeline**: Token-by-token streaming with real-time block accumulation
3. **Block Ordering**: Thinking blocks prepend (appear before text), others append
4. **Stream Cancellation**: AbortController-based, preserves partial content with PAUSED status
5. **Message Control**: Edit (re-send with new content), retry (re-run failed), delete (cascade)
6. **Multi-Model Dispatch**: Send to multiple models in parallel via Promise.allSettled, isolated failures
7. **Context Window**: Configurable context count with CONTEXT_COUNT_UNLIMITED (-1) support
8. **KB Integration**: RAG injection from F004 knowledge bases into system prompt
9. **Rate Limiting**: Per-provider rate limits with countdown
10. **Topic Auto-Naming**: First user message content truncated at word boundary (50 chars)
11. **Assistant Settings**: Per-assistant model, temperature, topP, maxTokens, reasoning_effort with cache
12. **Quick Phrases**: CRUD with Dexie persistence, sortOrder-based ordering
13. **Citation Deduplication**: Merge web search + KB + memory refs, dedup by URL, sequential renumbering

### Step 4: Data Flow

```
┌─────────────────┐
│   useAssistant   │ ← Assistant CRUD + model switching + reasoning cache
│   useTopic       │ ← Topic CRUD + auto-naming + pin/sort
│   useMessages    │ ← Send/cancel/edit/retry/delete + streaming pipeline
│   useBlockRenderer│ ← Block type dispatch + render data extraction
└────────┬────────┘
         │
┌────────▼────────┐
│  Zustand Stores  │
│  ┌─────────────┐ │
│  │ Assistant    │ │ persist + broadcastSync
│  │ Message      │ │ broadcastSync (Dexie-backed)
│  │ Runtime      │ │ transient (per-window)
│  └─────────────┘ │
└────────┬────────┘
         │
┌────────▼────────┐
│   Dexie IndexedDB │
│   (v3 schema)     │
│   5 new tables    │
└───────────────────┘
```

### Step 5: Cross-Feature Integration Points

| Feature | Integration |
|---------|-------------|
| F001 | Dexie database (v1→v2→v3 migration chain), BroadcastChannel sync |
| F002 | Provider/Model resolution for AI requests |
| F003 | RuntimeExecutor.streamText() for AI streaming |
| F004 | knowledge.search IPC for RAG context injection |

---

## Test Coverage

| Test File | Tests | Focus |
|-----------|-------|-------|
| useAssistantStore.test.ts | 22 | Store actions + selectors |
| useMessageStore.test.ts | 27 | Normalized entities, block management |
| useRuntimeStore.test.ts | 17 | Transient runtime state |
| MessagesService.test.ts | 30 | Message creation, context filtering, rate limiting |
| TopicNamingService.test.ts | 11 | Auto-naming, locks, truncation |
| TopicManager.test.ts | 22 | Topic CRUD, cascade deletes |
| BlockRenderUtils.test.ts | 82 | All 12 block types, citation dedup |
| QuickPhraseService.test.ts | 24 | Phrase CRUD, sorting |
| **Total** | **235** | |
