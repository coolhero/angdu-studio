# F014-extras — Pre-Context

> Angdu Studio reverse-spec | Rebuilt from Cherry Studio
> Feature: Mini Apps, Paintings, Code Tools, Memory & More
> Tier: 3 (Optional) | Demo Group: D3-Extras
> Dependencies: F001-app-shell, F002-settings

---

## Feature Overview

Grab-bag of supplementary features: (1) Mini apps — embeddable web apps within the main window, (2) Paintings — AI image generation via 14+ providers (DALL-E, Flux, Stability, etc.), (3) Code tools — Python execution via Pyodide (WebAssembly), code sandboxing, (4) Memory — long-term context retention with two-phase LLM pipeline (extract facts + update memory), (5) Selection assistant — text selection actions, (6) File management — file storage and organization. Each sub-feature is relatively independent.

---

## Runtime Exploration Results

From `runtime-exploration.md`:

- **Mini Apps** (`#/apps`): Grid/list of mini applications, browsable store, each app runs within main window
- **Paintings** (`#/paintings`): AI image generation, multiple provider support (Aihubmix, Dmxapi, NewApi, Ovms, Ppio, Silicon, TokenFlux, Zhipu, etc.)
- **Code Tools** (`#/code`): Code utilities, Python execution via Pyodide (WebAssembly)
- **Launchpad** (`#/launchpad`): Feature discovery/launcher page
- **Settings**: Memories (Settings > Features), Quick Assistant (Settings > Tools), Selection Assistant (Settings > Tools)

---

## Source Reference

| Layer | Cherry Studio Path | Purpose |
|-------|-------------------|---------|
| Paintings pages | `src/renderer/src/pages/paintings/` | Image generation UI per provider |
| Mini apps pages | `src/renderer/src/pages/minapps/` | Mini app browser and runner |
| Code pages | `src/renderer/src/pages/code/` | Code tools UI |
| Memory service | `src/renderer/src/services/MemoryService.ts` | Client-side memory operations |
| Memory processor | `src/renderer/src/services/MemoryProcessor.ts` | Fact extraction + memory update |
| Main memory service | `src/main/services/MemoryService.ts` | Main process memory pipeline |
| Selection service | `src/main/services/SelectionService.ts` | Text selection actions |
| File storage | `src/main/services/FileStorage.ts` | File management service |
| Paintings store | `src/renderer/src/store/paintings.ts` | Redux slice (paintings state) |
| Mini apps store | `src/renderer/src/store/minapps.ts` | Redux slice (mini apps state) |
| Memory store | `src/renderer/src/store/memory.ts` | Redux slice (memory state) |
| Selection store | `src/renderer/src/store/selectionStore.ts` | Redux slice (selection state) |
| Code tools store | `src/renderer/src/store/codeTools.ts` | Redux slice (code tools state) |

---

## Spec Backlog Items (SBI)

| ID | Title | Priority | Description |
|----|-------|----------|-------------|
| B252 | Mini app browser and runner | P2 | Browse and launch embedded web apps. Each app loads in a webview/iframe within the main window. |
| B253 | Mini app management (add, remove, boot) | P2 | Add custom mini apps by URL. Remove apps. Track boot status. |
| B254 | AI image generation UI (multi-provider) | P2 | Image generation interface supporting 14+ providers. Provider-specific settings. |
| B255 | Image generation prompt and parameters | P2 | Text prompt input, size/quality/style parameters per provider. |
| B256 | Generated image gallery and history | P3 | View generated images per provider. Persist generation history. |
| B257 | Code tools with Python execution (Pyodide) | P2 | Execute Python code in browser via Pyodide WebAssembly runtime. |
| B258 | Code sandbox toggle | P3 | Enable/disable sandboxed code execution. Auto-run option. |
| B259 | Memory fact extraction (Phase 1) | P1 | Extract structured facts from conversation via LLM. Uses configured memory model. |
| B260 | Memory update pipeline (Phase 2) | P1 | Merge new facts with existing memories via LLM. Deduplicate, resolve conflicts. |
| B261 | Memory settings and model config | P2 | Enable/disable memory, select memory model, configure store path. Sync config to main process via IPC. |
| B262 | Memory injection into chat | P1 | Inject relevant memories into conversation context during chat. |
| B263 | Memory CRUD UI | P2 | View, edit, delete individual memory items. View memory operation history. |
| B264 | Selection assistant (text selection actions) | P3 | Configure actions triggered on text selection (explain, translate, summarize, etc.). |
| B265 | File storage service | P2 | Centralized file storage for attachments, uploads, and generated content. |
| B266 | Launchpad / feature discovery | P3 | Landing page showcasing available features with quick access links. |
| B267 | Quick assistant (floating shortcut) | P3 | Quick-access floating assistant panel for fast queries. |

---

## Business Rules

- **BR-026**: Memory uses two-phase LLM pipeline — Phase 1 extracts facts, Phase 2 merges with existing memories
- **BR-027**: Memory config syncs from Redux/Zustand (renderer) to main process via IPC; no restart required

---

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| (none detected) | All config via settings UI and store state | — |

---

## For /speckit.specify

- **Entities**: PaintingsState, MinAppType, MemoryItem, MemoryHistoryItem, CopilotState, SelectionState, CodeToolsState (see entity-registry.md)
- **Business rules**: BR-026, BR-027 (see business-logic-map.md)
- **Key screens**: `#/paintings`, `#/apps` (minapps), `#/code`, `#/launchpad`, Settings > Memories, Settings > Selection Assistant, Settings > Quick Assistant
- **IPC channels**: `memory:extract`, `memory:update`, `memory:get`, `memory:config-sync`, `selection:action`, `file:store`, `file:get`
- **Cross-feature**: Memory injection consumed by F006-chat; file storage used by F006-chat, F007-knowledge

## For /speckit.plan

- **Migration impact**: Medium UI, Medium state (see stack-migration.md)
- **UI migration**: Multiple small pages (paintings, minapps, code) AntD -> shadcn/ui
- **State migration**: 5 Redux slices (paintings, minapps, memory, selection, codeTools) -> `useAppStore` or individual small Zustand stores
- **Main process**: MemoryService, SelectionService, FileStorage are Node.js — no UI migration
- **Dependencies**: F001-app-shell for tab system, F002-settings for config UI integration
- **Zustand stores**: Consider `usePaintingsStore`, `useMiniAppsStore`, `useMemoryStore` or consolidate into `useAppStore`
- **Recommended approach**: Implement sub-features incrementally; memory (P1) first, then paintings and mini apps (P2), then selection/code/launchpad (P3)

---

## Feature Contracts

### Provides to Other Features

| Contract | Consumer | Description |
|----------|----------|-------------|
| `memory:*` IPC channels | F006-chat | Memory injection into conversation context |
| `file:*` IPC channels | F006-chat, F007-knowledge | Centralized file storage for attachments |
| Selection actions | System-wide | Text selection triggers configurable AI actions |

### Consumes from Other Features

| Contract | Provider | Description |
|----------|----------|-------------|
| AI completion pipeline | F004-ai-core | Memory extraction and paintings use AI models |
| Tab system | F001-app-shell | Paintings, mini apps, code tools open as tabs |
| Settings integration | F002-settings | Memory, selection, quick assistant config in settings |
| Model selection | F003-provider | Paintings and memory use configured models |
