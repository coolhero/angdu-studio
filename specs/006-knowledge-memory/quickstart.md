# Quickstart: Knowledge & Memory System

## Prerequisites
- F001 (app-shell), F004 (model-provider), F005 (chat-conversation) completed
- better-sqlite3 available (via F001)
- At least one embedding-capable provider configured

## New Dependencies
```bash
pnpm add pdf-parse mammoth
pnpm add -D @types/pdf-parse
```

## Key Files to Create
1. `src/main/services/VectorStore.ts` — SQLite vector storage
2. `src/main/services/KnowledgeService.ts` — KB orchestrator
3. `src/main/services/MemoryService.ts` — Memory service
4. `src/renderer/src/stores/useKnowledgeStore.ts` — KB state
5. `src/renderer/src/pages/knowledge/KnowledgePage.tsx` — Main KB page

## IPC Channels
- KB: `kb:create`, `kb:delete`, `kb:reset`, `kb:update`, `kb:list`, `kb:addItem`, `kb:removeItem`, `kb:search`, `kb:rerank`
- Memory: `memory:list`, `memory:add`, `memory:update`, `memory:delete`, `memory:search`, `memory:extractFacts`
- Embedding: `ai:embed` (extends F004)

## Testing
```bash
pnpm run build          # Build check
pnpm run lint           # Lint check
npx playwright test     # E2E tests
```
