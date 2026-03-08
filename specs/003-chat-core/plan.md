# Implementation Plan: Chat Core

**Branch**: `003-chat-core` | **Date**: 2026-03-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-chat-core/spec.md`

## Summary

Core conversation data model and streaming pipeline for Angdu Studio. Implements assistants (AI personas), topics (conversations), messages (turns), and message blocks (content units) with full CRUD, persistence via Dexie (IndexedDB), Zustand state management, a 9-stage message filtering pipeline, AI SDK message conversion, streaming response processing with a BlockManager state machine, and rate limiting. Migrates from Redux Toolkit (3 slices) to Zustand stores.

## Technical Context

**Language/Version**: TypeScript 5.8, targeting ES2022
**Primary Dependencies**: Zustand 5.x, Dexie 4, Vercel AI SDK 6 (`ai`), nanoid
**Storage**: Dexie (IndexedDB) for messages, topics, blocks; Zustand persist for assistants
**Testing**: Vitest (unit + integration)
**Target Platform**: Electron 40 (Chromium renderer process)
**Project Type**: desktop-app (Electron)
**Performance Goals**: Message load <200ms for 500 messages, streaming chunk-to-UI <50ms, filtering 1000 messages <50ms
**Constraints**: Renderer-only stores (no main process access), structured-cloneable IPC payloads, abort controller support for streaming cancellation
**Scale/Scope**: Hundreds of assistants, thousands of topics, millions of messages over app lifetime

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Singleton Services | PASS | ConversationService, StreamProcessingService, MessagesService as renderer singletons |
| II. IPC Bridge Pattern | PASS | F003 uses no dedicated IPC — all renderer-side stores and Dexie. StoreSync from F001 used for cross-window sync |
| III. Middleware Pipeline | PASS | StreamText parameter assembly uses the F002 plugin pipeline |
| IV. Registry & Factory | PASS | Message block types use discriminated union + type-based dispatch, not switch chains |
| V. Dual Database | PASS | Messages/blocks in Dexie (renderer). No SQLite usage in F003 |
| VI. Test-First | PASS | Tests for store actions, filtering pipeline, SDK conversion, block state machine |
| VII. Demo-Ready | PASS | Demo script will send a message and show streaming response |
| VIII. i18n | PASS | Toast messages (rate limit, errors) use i18n keys |

## Project Structure

### Documentation (this feature)

```text
specs/003-chat-core/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── store-api.md     # Zustand store public API contracts
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/renderer/src/
├── stores/
│   ├── useAssistantsStore.ts       # Assistant CRUD, tags, presets, unified ordering
│   ├── useMessageStore.ts          # Message CRUD, topic-message mapping, pagination
│   └── useMessageBlockStore.ts     # Block CRUD, status transitions, block lifecycle
├── services/
│   ├── ConversationService.ts      # Message filtering pipeline, context calculation
│   ├── MessagesService.ts          # User message construction, rate limiting, retry
│   ├── StreamProcessingService.ts  # Stream chunk dispatcher, BlockManager
│   ├── MessageConverter.ts         # AS Message → AI SDK ModelMessage conversion
│   ├── ParameterBuilder.ts         # StreamText parameter assembly
│   └── AssistantService.ts         # Assistant defaults, preset management
├── databases/
│   ├── ChatDatabase.ts             # Dexie database class with tables + indexes
│   └── migrations/                 # Schema version migrations
├── types/
│   ├── assistant.ts                # Assistant, AssistantSettings, AssistantPreset
│   ├── message.ts                  # Message, MessageStatus enums
│   ├── message-block.ts            # MessageBlock discriminated union, BlockType, BlockStatus
│   └── conversation.ts             # Topic, ChunkType, StreamTextParams
└── config/
    └── defaults.ts                 # DEFAULT_TEMPERATURE, DEFAULT_CONTEXTCOUNT, etc.

tests/
├── unit/
│   ├── stores/
│   │   ├── useAssistantsStore.test.ts
│   │   ├── useMessageStore.test.ts
│   │   └── useMessageBlockStore.test.ts
│   ├── services/
│   │   ├── ConversationService.test.ts
│   │   ├── MessagesService.test.ts
│   │   ├── StreamProcessingService.test.ts
│   │   └── MessageConverter.test.ts
│   └── databases/
│       └── ChatDatabase.test.ts
└── integration/
    └── chat-flow.test.ts           # End-to-end send→stream→persist flow
```

**Structure Decision**: Feature-based layout within the existing renderer directory structure, following the constitution's file organization conventions. Services are renderer singletons. Stores use `use<Domain>Store` naming convention.

## Implementation Phases

### Phase 1: Type Definitions & Database Schema
Define all TypeScript types (Assistant, Topic, Message, MessageBlock with 11 variants, AssistantSettings, enums) and set up the Dexie database with tables and indexes. Create configuration constants.

**Deliverables**: `types/`, `databases/ChatDatabase.ts`, `config/defaults.ts`

### Phase 2: Zustand Stores — Assistant Management
Implement `useAssistantsStore` with full CRUD, tags, presets, unified ordering, persistence via Dexie. Create `AssistantService` for defaults and preset management.

**Deliverables**: `stores/useAssistantsStore.ts`, `services/AssistantService.ts`

### Phase 3: Zustand Stores — Message & Block Management
Implement `useMessageStore` (message CRUD, topic-message mapping, pagination, display count) and `useMessageBlockStore` (block CRUD, status state machine, atomic transitions). Both persist to Dexie.

**Deliverables**: `stores/useMessageStore.ts`, `stores/useMessageBlockStore.ts`

### Phase 4: Message Filtering Pipeline
Implement the 9-stage filtering pipeline in `ConversationService`: context clear, useful messages, error pairs, trailing assistant, adjacent user, context window, re-apply clear, empty messages, user-role-start. Plus context count calculation and fallback.

**Deliverables**: `services/ConversationService.ts`

### Phase 5: Message-to-SDK Conversion
Implement `MessageConverter` to transform AS Messages to AI SDK ModelMessage format with TextPart, ImagePart, FilePart, ReasoningPart handling. Support fileid:// protocol, Gemini [Image] placeholder, image enhancement merge.

**Deliverables**: `services/MessageConverter.ts`

### Phase 6: StreamText Parameter Assembly
Implement `ParameterBuilder` to assemble streamText() parameters: model resolution, capability detection (reasoning, web search, URL context, image generation), MCP tool setup, system prompt with variable replacement, Anthropic beta headers.

**Deliverables**: `services/ParameterBuilder.ts`

### Phase 7: Stream Processing & Block Manager
Implement `StreamProcessingService` with chunk-based dispatcher for 15+ chunk types and `BlockManager` that orchestrates block lifecycle (creation, updates, status transitions, completion). Wire abort controllers.

**Deliverables**: `services/StreamProcessingService.ts`

### Phase 8: User Message Construction & Send Flow
Implement `MessagesService` for atomic user message + block creation, rate limiting guard, retry/regenerate flow, and the complete send pipeline (construct → filter → convert → assemble → stream → process).

**Deliverables**: `services/MessagesService.ts`

### Phase 9: Database Migrations & Legacy Support
Implement schema versioning in Dexie, migration scripts for schema evolution, and legacy data normalization (non-array topics, orphan cleanup, deduplication).

**Deliverables**: `databases/migrations/`

### Phase 10: Tests
Write unit tests for all stores and services, integration test for the full chat flow (send → stream → persist → load).

**Deliverables**: `tests/unit/`, `tests/integration/`

## Bug Prevention (B-1)

### Runtime Compatibility
- Target: Electron 40 (Chromium 134), ES2022. All Web APIs used (IndexedDB, structuredClone, AbortController) are available.
- Dexie 4 is IndexedDB-native, no polyfills needed.

### State Management Anti-patterns
- **No circular deps**: `useAssistantsStore` is independent. `useMessageStore` references assistant IDs (not the store). `useMessageBlockStore` references message IDs (not the store). Services coordinate stores — stores don't import each other.
- **Store initialization**: No order dependency. Each store initializes independently with Dexie hydration.

### Async & Concurrency
- **Streaming race conditions**: One active stream per topic enforced via abort controller. New send aborts previous. Generation state guard prevents concurrent sends.
- **Block update batching**: Streaming block updates are debounced via requestAnimationFrame to prevent React re-render thrashing.
- **Dexie transactions**: Multi-entity writes (message + blocks) use Dexie.transaction for atomicity.

### Cleanup
- **Abort controllers**: Created per streaming session, wired to AI SDK's `abortSignal`. Cleaned up on topic switch, component unmount, or user cancel.
- **Store subscriptions**: Zustand selectors auto-cleanup. No manual subscription management needed.

## Complexity Tracking

No constitution violations — no entries needed.
