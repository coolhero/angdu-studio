# Pre-Context: F011-memory

## Feature Overview

**Feature:** Memory — Long-term vector memory, search, context injection.
**Tier:** 3
**SBI Range:** B351–B370

## Strategy

- **Approach:** Core scope, New Stack
- **Naming:** Cherry → Angdu, CherryStudio → AngduStudio, CherryIN → AngduIN

## Source Files (relative to /Users/coolhero/Develop/cherry-studio)

- `src/main/services/memory/MemoryService.ts`
- `src/renderer/src/services/MemoryService.ts`
- `src/renderer/src/services/MemoryProcessor.ts`
- `src/renderer/src/store/memory.ts` (→ Zustand)
- `src/renderer/src/hooks/useMemory.ts` (if exists)
- `src/renderer/src/pages/settings/MemorySettings/`

## SBI Inventory (B351–B370)

| SBI  | Name                        | Priority |
|------|-----------------------------|----------|
| B351 | MemoryService.add           | P1       |
| B352 | MemoryService.search        | P1       |
| B353 | MemoryService.list          | P1       |
| B354 | MemoryService.delete        | P1       |
| B355 | MemoryService.update        | P2       |
| B356 | MemoryService.setConfig     | P2       |
| B357 | MemoryService.migrateDB     | P3       |
| B358 | MemoryProcessor.process     | P2       |
| B359 | injectMemoryContext          | P1       |
| B360 | embedding generation         | P1       |
| B361 | vector similarity search     | P1       |

## Naming Rules

- `cherry-studio` in memory DB paths → `angdu-studio`
- All other occurrences: Cherry → Angdu, CherryStudio → AngduStudio

## Environment Variables

None.

## Dependencies

- **F001-app-core** — IPC infrastructure, database layer, file-system paths
- **F002-ai-provider** — Embedding model invocation for vector generation
- **F003-chat** — Message types, conversation context for memory injection
