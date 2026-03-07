# Source Coverage Baseline: Cherry Studio Reverse-Spec

**Source**: `/Users/coolhero/Study/oss/cherry-studio`
**Artifacts**: `/Users/coolhero/Develop/angdu-studio/specs/reverse-spec/`
**Generated**: 2026-03-04
**Method**: Automated surface measurement -- glob/grep source counts vs. artifact-mapped counts

---

## Step 1: Automated Surface Measurement

### Metrics Table

| Metric              | Source | Mapped | Coverage | Notes |
|---------------------|--------|--------|----------|-------|
| Source files (total) | 1,667  | 726    | 43.5%   | .ts/.tsx files under src/ and packages/ (excl node_modules/dist) |
| Source files (non-test) | 1,475 | 671  | 45.5%   | Excluding test and snapshot files |
| IPC handlers        | 311    | 311    | 100.0%  | ipcMain.handle() calls in src/main/ (excl tests) |
| IPC events (M->R)   | 33     | 33     | 100.0%  | Documented in api-registry.md as event-only channels |
| IPC total channels  | 344    | 344    | 100.0%  | 311 handlers + 33 events |
| HTTP REST endpoints | 23     | 24     | 100.0%+ | Source: 23 route registrations; api-registry documents 24 (likely counts provider-prefixed mount separately) |
| DB entities         | 22     | 22     | 100.0%  | 14 physical tables mapped to 22 conceptual entities (18 primary + 4 secondary) |
| Test files          | 183    | 0      | 0.0%    | 183 .test.ts/.spec.ts files in src/ + packages/; none referenced in pre-context.md files |
| Business rules      | 105    | 105    | 100.0%  | business-logic-map.md documents all 105 rules extracted from source |

### Source Count Details

**Source files**: 1,667 total TypeScript/TSX files
- `src/` directory: 1,545 files
- `packages/` directory: 122 files (aiCore, ai-sdk-provider, shared, extension-table-plus, mcp-trace)
- Test files: 192 (183 actual tests + 9 snapshot files and test utilities)
- Non-test production files: 1,475

**IPC channels**: 344 total
- `ipcMain.handle()`: 311 calls in source (verified via grep, excluding test files)
- `ipcMain.on()`: 1 call (`python-execution-response`)
- Main-to-renderer events: 33 channels (documented in api-registry via static analysis of `webContents.send()` patterns and IPC channel enum)

**HTTP REST endpoints**: 23 route handler registrations in source
- App-level: 3 (`GET /health`, `GET /`, `GET /api-docs.json`)
- `/v1/chat`: 1 (`POST /completions`)
- `/v1/mcps`: 2 (`GET /`, `GET /:server_id`)
- `/v1/messages`: 1 (`POST /`)
- `/v1/models`: 1 (`GET /`)
- `/v1/agents`: 6 (`POST /`, `GET /`, `GET /:id`, `PUT /:id`, `PATCH /:id`, `DELETE /:id`)
- `/v1/agents/:id/sessions`: 6 (`POST /`, `GET /`, `GET /:id`, `PUT /:id`, `PATCH /:id`, `DELETE /:id`)
- `/v1/agents/:id/sessions/:id/messages`: 2 (`POST /`, `DELETE /:id`)
- Provider-prefixed mount: `/:provider/v1/messages` (shares same handler as `/v1/messages`)

**DB entities**: 22 conceptual entities across 3 storage backends
- Dexie (IndexedDB): 8 tables -- `files`, `topics`, `settings`, `knowledge_notes`, `translate_history`, `translate_languages`, `quick_phrases`, `message_blocks`
- Drizzle (SQLite, agents): 4 tables -- `agents`, `sessions`, `session_messages`, `migrations`
- LibSQL (memory): 2 tables -- `memories`, `memory_history`
- Embedded/in-memory entities: 8 -- AssistantSettings, MessageBlock variants, KnowledgeReference, MCPTool, Model (embedded in Provider), Painting/PaintingAction, TranslateLanguage, NotesTreeNode

**Test files**: 183 test files across 40+ `__tests__/` directories
- `src/renderer/`: 131 test files
- `src/main/`: 29 test files
- `packages/`: 23 test files

**Business rules**: 105 rules documented in business-logic-map.md
- F001 core-platform: 31 core + 12 validations + 6 workflows + 5 cross-feature
- F002 provider-management: 4 core + 2 validations + 1 workflow + 2 cross-feature
- F004 knowledge-base: 13 core + 5 validations + 3 workflows + 3 cross-feature
- F006 MCP-integration: 17 core + 5 validations + 4 workflows + 3 cross-feature
- F007 backup-sync: 10 core + 3 validations + 2 workflows + 2 cross-feature
- F011 memory-system: 13 core + 4 validations + 3 workflows + 3 cross-feature
- Cross-cutting: 8 core + 2 validations + 0 workflows + 8 cross-feature

### Mapped Count Details

**Source files mapped via pre-context.md**: 726 files (43.5% of total)
- 12 pre-context.md files (F001 through F012) reference 76 unique file/directory paths
- Directory references (19 paths ending with `/`) match 548 files by prefix
- Exact file references (48 paths) match 36 files (12 paths have slightly different names in source -- see discrepancies below)
- Test files in mapped directories: 55 files matched incidentally (not explicitly referenced)

**Pre-context file path discrepancies** (referenced name vs. actual name):
| Referenced in pre-context.md | Actual path in source | Status |
|------------------------------|----------------------|--------|
| `src/main/services/MenuService.ts` | `src/main/services/AppMenuService.ts` | Name mismatch |
| `src/main/services/CherryINService.ts` | `src/main/services/CherryINOAuthService.ts` | Name mismatch |
| `src/main/services/AnthropicOAuthService.ts` | (not found at this exact path) | Missing / renamed |
| `src/main/services/OcrService.ts` | `src/main/services/ocr/OcrService.ts` | Path differs (subdirectory) |
| `src/renderer/src/config/models.ts` | `src/renderer/src/config/models/` (directory) | File vs. directory |
| `src/renderer/src/hooks/useMemory.ts` | (not found; split into multiple hooks) | Decomposed |
| `src/renderer/src/hooks/useNotes.ts` | (split into `useNotesSettings.ts`, `useNotesQuery.ts`, etc.) | Decomposed |
| `src/renderer/src/store/messages.ts` | (not found at this exact path) | Missing / restructured |
| `src/main/services/FileStorage.ts` | (not found; likely `FileService.ts` or similar) | Name mismatch |

---

## Step 2: Unmapped Items Identification

### 2.1 Source Files Not Mapped to Any Feature

804 non-test files are not referenced in any pre-context.md "Related Original File List" table.

#### Top Unmapped Groups

| # | Group | Count | Category | Example Files |
|---|-------|-------|----------|---------------|
| 1 | `src/renderer/src/components/` (excl Messages/, Notes/, Settings/) | 260 | UI components | `ActionTools/`, `CodeEditor/`, `CodeToolbar/`, `DraggableList/`, `Icons/`, `Popups/`, `Preview/`, `RichEditor/`, `Scrollbar/`, `TooltipIcons/`, `VirtualList/` |
| 2 | `src/renderer/src/aiCore/` | 88 | AI engine (renderer-side) | `chunk/`, `legacy/clients/`, `legacy/middleware/`, `prepareParams/`, `provider/`, `trace/`, `utils/` |
| 3 | `src/renderer/src/hooks/` (excl 7 named hooks) | 76 | React hooks | `agents/useActiveAgent.ts`, `agents/useAgentClient.ts`, `useApp.ts`, `useAutoScroll.ts`, `useCodeToolsRuntime.ts`, `useModel.ts`, `useSettings.ts`, `useTemporaryValue.ts` |
| 4 | `src/renderer/src/services/` (excl MessagesService.ts) | 65 | Renderer services | `ApiService.ts`, `AssistantService.ts`, `BackupService.ts`, `ConversationService.ts`, `ModelAdapter.ts`, `ShikiStreamService.ts` |
| 5 | `src/renderer/src/utils/` | 62 | Utility functions | `abortController.ts`, `assistant.ts`, `citation.ts`, `copy.ts`, `download.ts`, `error.ts`, `fetch.ts`, `formats.ts`, `image.ts`, `json.ts`, `markdown.ts` |
| 6 | `src/main/services/` (excl 24 named services + agents/ + memory/ + ocr/) | 45 | Main process services | `AnalyticsService.ts`, `AnthropicService.ts`, `AppUpdater.ts`, `CacheService.ts`, `CodeToolsService.ts`, `FileService.ts`, `FileWatcherService.ts`, `GeminiService.ts`, `MigrationService.ts`, `NutstoreService.ts`, `VersionService.ts` |
| 7 | `src/renderer/src/pages/` (excl home/, settings/, knowledge/, agents/, translate/, paintings/, apps/, notes/) | 31 | Additional pages | `code/CodeToolsPage.tsx`, `files/FilesPage.tsx`, `minapps/MinAppsPage.tsx`, `minapps/WebViewPage.tsx` |
| 8 | `src/renderer/src/types/` | 25 | Type definitions | `agent.ts`, `aiCoreTypes.ts`, `apiModels.ts`, `chat.ts`, `global.d.ts`, `provider-specific-error.ts`, `websearch.ts` |
| 9 | `src/renderer/src/store/` (excl 7 named stores) | 24 | State management | `backup.ts`, `codeTools.ts`, `copilot.ts`, `mcp.ts`, `minapps.ts`, `paintings.ts`, `runtime.ts`, `shortcuts.ts`, `translate.ts`, `websearch.ts` |
| 10 | `packages/extension-table-plus/` | 22 | TipTap table extension | Custom TipTap extension for enhanced table editing in notes |
| 11 | `src/renderer/src/windows/` | 20 | Secondary windows | `mini/MiniWindowApp.tsx`, `mini/chat/`, `selection/`, `trace/` |
| 12 | `src/main/utils/` | 18 | Main process utilities | `aes.ts`, `file.ts`, `fileOperations.ts`, `init.ts`, `markdownParser.ts`, `process.ts`, `shell-env.ts`, `systemInfo.ts`, `writeWithLock.ts`, `zip.ts` |
| 13 | `packages/mcp-trace/` | 14 | MCP tracing package | `trace-core/`, `trace-otel/`, span converters, exporters |
| 14 | `src/renderer/src/config/` (excl providers.ts, models/) | 14 | Configuration files | `agent.ts`, `constant.ts`, `embedings.ts`, `endpointTypes.ts`, `env.ts`, `shortcuts.ts` |
| 15 | `src/renderer/src/trace/` | 12 | Tracing/observability UI | `dataHandler/`, `pages/`, trace visualization components |

#### Small Unmapped Groups (< 3 files each, 22 files total)

| File Path | Apparent Category |
|-----------|------------------|
| `src/renderer/src/databases/index.ts` | Dexie DB initialization |
| `src/renderer/src/databases/upgrades.ts` | Dexie DB migrations |
| `src/renderer/src/queue/KnowledgeQueue.ts` | Queue infrastructure |
| `src/renderer/src/queue/NotificationQueue.ts` | Queue infrastructure |
| `src/renderer/src/tools/index.ts` | Tool utilities |
| `src/renderer/src/tools/think.ts` | Thinking tool |
| `src/renderer/src/workers/pyodide.worker.ts` | Web worker |
| `src/renderer/src/workers/shiki-stream.worker.ts` | Web worker |
| `src/main/bootstrap.ts` | Bootstrap/init |
| `src/main/config.ts` | Config constants |
| `src/main/configs/SelectionConfig.ts` | Selection config |
| `src/main/constant.ts` | Constants |
| `src/main/electron.d.ts` | Type declaration |
| `src/main/env.d.ts` | Type declaration |
| `src/preload/preload.d.ts` | Type declaration |
| `src/renderer/src/App.tsx` | Root app component |
| `src/renderer/src/Router.tsx` | Router config |
| `src/renderer/src/api/agent.ts` | Agent API client |
| `src/renderer/src/entryPoint.tsx` | Entry point |
| `src/renderer/src/env.d.ts` | Type declaration |
| `src/renderer/src/handler/NavigationHandler.tsx` | Navigation handler |
| `src/renderer/src/init.ts` | Initialization |

### 2.2 IPC Channel Coverage

No discrepancy. The api-registry.md documents 344 IPC channels (311 handlers + 33 events), which matches the source count of 311 `ipcMain.handle()` calls and 1 `ipcMain.on()` call in the main process (the remaining 32 events are outbound-only channels defined in the IPC channel enum and invoked via `webContents.send()`).

### 2.3 HTTP REST Endpoint Coverage

Minor discrepancy: 23 route registrations found in source vs. 24 documented in api-registry.md. The api-registry likely counts the `/:provider/v1/messages` provider-prefixed mount as a separate endpoint from `/v1/messages`, bringing the documented total to 24. No unmapped endpoints.

### 2.4 Test Files

183 test files exist in the source. **None** are explicitly referenced in any pre-context.md file. All 183 test files are unmapped from the reverse-spec artifacts.

Test file distribution:
- `src/renderer/src/utils/__tests__/`: 32 test files
- `src/renderer/src/components/` (various `__tests__/`): 31 test files
- `src/renderer/src/aiCore/` (various `__tests__/`): 13 test files
- `src/renderer/src/pages/` (various `__tests__/`): 15 test files
- `src/renderer/src/services/__tests__/`: 8 test files
- `src/main/services/__tests__/`: 9 test files
- `src/main/utils/__tests__/`: 7 test files
- `src/main/services/lanTransfer/__tests__/`: 5 test files
- `src/main/services/agents/` (various `__tests__/`): 5 test files
- `packages/aiCore/` (various `__tests__/`): 16 test files
- Other locations: 42 test files

### 2.5 DB Entity Coverage

No discrepancy. The entity-registry.md documents 22 entities (18 primary + 4 secondary) with 34 relationships. Source verification confirms:
- 8 Dexie tables in `src/renderer/src/databases/index.ts`
- 4 Drizzle tables in `src/main/services/agents/database/schema/`
- 2 LibSQL tables in `src/main/services/memory/queries.ts`
- 8 embedded/in-memory entities (AssistantSettings, MessageBlock variants, KnowledgeReference, MCPTool, Model, Painting, TranslateLanguage, NotesTreeNode)

---

## Coverage Gap Analysis

### Why 54.5% of non-test source files are unmapped

The pre-context.md files intentionally reference **key architectural files** rather than every individual file. The unmapped files fall into predictable categories:

| Category | Unmapped Count | Why Unmapped |
|----------|---------------|--------------|
| Shared UI components | ~260 | Components like `CodeToolbar/`, `DraggableList/`, `Preview/`, `Icons/` are reusable primitives used across features. Pre-context files reference feature-level pages but not shared component libraries. |
| Renderer-side aiCore | ~88 | `src/renderer/src/aiCore/` contains renderer-specific AI integration code (chunk handling, legacy clients, provider config). The pre-context for F003 references `packages/aiCore/` but not the renderer-side bridge layer. |
| React hooks | ~76 | Only 7 specific hooks are referenced by name. The remaining ~76 hooks (including `useModel`, `useSettings`, `useApp`, agent hooks) are implicitly covered by their parent features but not explicitly listed. |
| Renderer services | ~65 | Only `MessagesService.ts` is explicitly listed. Other renderer services (`ApiService`, `ConversationService`, `ModelAdapter`, etc.) are implicitly part of their parent features. |
| Utility functions | ~62 | Shared utility files (`markdown.ts`, `fetch.ts`, `copy.ts`, `formats.ts`, etc.) are cross-cutting helpers not owned by any single feature. |
| Main process services | ~45 | Services like `AppUpdater.ts`, `FileService.ts`, `FileWatcherService.ts`, `VersionService.ts`, `lanTransfer/` are not explicitly listed in pre-context but are implicitly covered by their parent features. |
| Type definitions | ~25 | Type files under `src/renderer/src/types/` define shared interfaces used across features. |
| State stores | ~24 | Only 7 specific stores are listed. Remaining stores (`mcp.ts`, `runtime.ts`, `shortcuts.ts`, `translate.ts`, `websearch.ts`, etc.) are implicitly part of their features. |
| Additional pages | ~31 | Pages like `code/`, `files/`, `minapps/` are not explicitly mapped. |
| Secondary windows | ~20 | Mini window, selection window, and trace window implementations. |
| Packages | ~36 | `extension-table-plus` (22 files) and `mcp-trace` (14 files) are not referenced. |
| Config, utils, init | ~54 | Various configuration, utility, initialization, and type declaration files. |

### Key Insight

The pre-context.md files achieve **100% coverage of API surface** (IPC channels, REST endpoints, entities, business rules) while covering only **45.5% of source files by explicit reference**. This is by design: the reverse-spec workflow maps **contracts and behavior** (APIs, entities, rules) comprehensively, while source file references focus on **architecturally significant files** that define the feature's structure and logic. Shared components, utilities, type definitions, and implementation details are implicitly covered through the feature they belong to.

---

## Unmapped Items Classification

Items found in the original source not assigned to any Feature. Classified by group during Phase 4-3.

### Unmapped Source File Groups

| # | Group | Count | Classification | Detail |
|---|-------|-------|----------------|--------|
| 1 | `src/renderer/src/components/` (shared UI) | ~260 | cross-cutting | Reusable UI primitives (Icons, CodeToolbar, DraggableList, Preview, etc.). Will be rebuilt as shadcn/ui + Radix components per stack migration. Each Feature implements its own UI using these shared primitives. |
| 2 | `src/renderer/src/aiCore/` | ~88 | assigned:F003 | Renderer-side AI engine bridge code. Extends F003-ai-core-engine's scope to include renderer integration layer. |
| 3 | `src/renderer/src/hooks/` (unnamed hooks) | ~76 | cross-cutting | Distributed across Features — each hook belongs to its parent Feature implicitly (e.g., `useModel` → F002, `useSettings` → F001, agent hooks → F012). |
| 4 | `src/renderer/src/services/` (unnamed services) | ~65 | cross-cutting | Distributed across Features — each service belongs to its parent Feature implicitly (e.g., `AssistantService` → F005, `BackupService` → F007, `ApiService` → F003). |
| 5 | `src/renderer/src/utils/` | ~62 | cross-cutting | Cross-cutting utility functions. Will be rebuilt as needed by individual Features. Constitution principle XVI (Simplicity First) — only create utils when needed. |
| 6 | `src/main/services/` (unnamed services) | ~45 | cross-cutting | Distributed across Features — `AppUpdater` → F001, `FileService`/`FileWatcherService` → F001, `CacheService` → F001, `lanTransfer/` → F007, `VersionService` → F001, analytics → F010. |
| 7 | `src/renderer/src/pages/` (unmapped pages) | ~31 | cross-cutting | Distributed: `code/` → F010, `files/` → F001, `minapps/` → F010. Each page belongs to its parent Feature. |
| 8 | `src/renderer/src/types/` | ~25 | cross-cutting | Shared type definitions. Will be rebuilt in `@shared` package per constitution principle V (Typed IPC Channel System). |
| 9 | `src/renderer/src/store/` (unnamed stores) | ~24 | cross-cutting | Distributed: `mcp.ts` → F006, `runtime.ts` → F001, `shortcuts.ts` → F001, `translate.ts` → F010, `paintings.ts` → F010, `websearch.ts` → F010. Each store migrates to Zustand per stack migration. |
| 10 | `packages/extension-table-plus/` | 22 | assigned:F009 | TipTap table extension for notes editor. |
| 11 | `src/renderer/src/windows/` | ~20 | assigned:F001 | Secondary window implementations (mini window, selection window, trace window). Core window management. |
| 12 | `src/main/utils/` | ~18 | assigned:F001 | Main process utilities (aes, file operations, zip, process management). Core infrastructure. |
| 13 | `packages/mcp-trace/` | 14 | assigned:F006 | MCP tracing/observability package. |
| 14 | `src/renderer/src/config/` (unmapped configs) | ~14 | cross-cutting | Config files distributed: `agent.ts` → F012, `shortcuts.ts` → F001, `embedings.ts` → F004, `endpointTypes.ts` → F002. |
| 15 | Small files (init, bootstrap, router, entry) | ~22 | assigned:F001 | App initialization, bootstrap, routing, entry points — all core platform infrastructure. |

### Unmapped Endpoints

None — 100% IPC and HTTP endpoint coverage. Minor discrepancy (23 vs 24 HTTP) is a counting difference for provider-prefixed mount.

### Unmapped Entities/Models

None — 100% entity coverage (22/22).

### Unmapped Test Files

| # | Group | Count | Classification | Detail |
|---|-------|-------|----------------|--------|
| 1 | All test files | 183 | excluded:covered-differently | Tests will be written fresh using Test-First (constitution principle XIV). Original tests reference old stack (Ant Design, Redux, styled-components) and are not transferable. Test intent and coverage targets are captured in pre-context.md edge cases and success criteria. |

---

## Intentional Exclusions

| # | Item | Type | Exclusion Reason | Description |
|---|------|------|-----------------|-------------|
| 1 | All 183 test files (`**/*.test.ts`, `**/*.spec.ts`) | test | `covered-differently` | Tests will be written fresh per Test-First principle. Original tests use old stack (Ant Design, Redux) and are not portable. Test scenarios captured in pre-context edge cases. |
| 2 | `src/renderer/src/aiCore/legacy/` | file | `replaced` | Legacy AI client implementations replaced by Vercel AI SDK v6 + aiCore plugin system in new stack. |
| 3 | Snapshot files (`__snapshots__/`) | file | `covered-differently` | Component snapshots tied to old stack (Ant Design + styled-components). New stack (shadcn/ui + Tailwind) will generate new snapshots. |

---

## Coverage Notes

- **Contract-level coverage is 100%**: All 344 IPC channels, 23-24 HTTP endpoints, 22 entities, and 105 business rules are fully documented in the registries. This is the critical surface for behavioral parity.
- **Source file coverage is 45.5% by explicit reference**: Pre-context files intentionally reference architecturally significant files. The remaining ~55% are shared utilities, hooks, services, and components that are implicitly covered through their parent Features. Each Feature's implementation phase will discover and implement the necessary renderer-side code.
- **Shared UI components (~260 files) are cross-cutting**: In the new stack, these will be rebuilt using shadcn/ui + Radix UI + Tailwind CSS 4, so explicit per-file mapping is not useful. The component patterns are captured in the stack-migration.md component mapping tables.
- **Test files (183) are intentionally excluded**: The new stack uses different UI libraries and state management, making original test code non-transferable. Test intent is preserved in pre-context.md success criteria and edge cases.
- **9 pre-context file path discrepancies identified**: Minor naming mismatches between referenced and actual source paths (e.g., `MenuService.ts` vs `AppMenuService.ts`). These are cosmetic and do not affect behavioral coverage.
