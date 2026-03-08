# Quickstart: F003-chat-core

**Feature**: Chat Core | **Branch**: `003-chat-core`

---

## Prerequisites

- F001 app-core implemented and merged (IPC bridge, config store, Zustand infrastructure)
- F002 ai-provider implemented and merged (Provider/Model entities, useProviderStore, AI SDK streaming)
- Node.js 20+, npm 10+
- Electron 40 dev environment configured

## Setup

```bash
# Switch to feature branch
git checkout 003-chat-core

# Install dependencies (if new packages added)
npm install

# Start dev server
npm run dev
```

## Key Files

| File | Purpose |
|------|---------|
| `src/renderer/src/stores/useAssistantsStore.ts` | Assistant CRUD, topics, tags, presets |
| `src/renderer/src/stores/useMessageStore.ts` | Message management, topic-message mapping |
| `src/renderer/src/stores/useMessageBlockStore.ts` | Block lifecycle, status state machine |
| `src/renderer/src/services/ConversationService.ts` | Message filtering pipeline |
| `src/renderer/src/services/MessagesService.ts` | Send flow, rate limiting, retry |
| `src/renderer/src/services/StreamProcessingService.ts` | Stream chunk dispatcher, BlockManager |
| `src/renderer/src/services/MessageConverter.ts` | AS → AI SDK message conversion |
| `src/renderer/src/services/ParameterBuilder.ts` | StreamText parameter assembly |
| `src/renderer/src/databases/ChatDatabase.ts` | Dexie schema, tables, indexes |

## Testing

```bash
# Run all tests
npm test

# Run F003-specific tests
npx vitest run tests/unit/stores/useAssistantsStore.test.ts
npx vitest run tests/unit/services/ConversationService.test.ts

# Run integration tests
npx vitest run tests/integration/chat-flow.test.ts
```

## Architecture Overview

```
User Input → MessagesService.sendMessage()
  → createUserMessage() (atomic Message + Blocks)
  → checkRateLimit()
  → ConversationService.filterMessagesPipeline() (9 stages)
  → MessageConverter.convertMessagesToSdkMessages()
  → ParameterBuilder.buildStreamTextParams()
  → AI SDK streamText() (via F002)
  → StreamProcessingService.processStream()
    → BlockManager dispatches chunks to block handlers
    → useMessageBlockStore updates blocks in real-time
  → Dexie persistence (write-through)
```
