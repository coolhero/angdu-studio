<!-- Sync Impact Report
Version change: 0.0.0 → 1.0.0
Added: All principles (initial constitution)
Modified principles: N/A (first version)
Propagation: N/A (no dependent artifacts yet)
-->

# Angdu Studio Constitution

## Core Principles

### I. Electron Multi-Process Architecture
The app runs as three distinct processes with strict separation:
- **Main Process** (Node.js): window management, IPC handling, file system, native APIs, SQLite access
- **Renderer Process** (Chromium): React UI, Zustand state, AI SDK, user interaction
- **Preload Bridge** (sandboxed): exposes safe IPC methods to renderer via contextBridge
All cross-process communication goes through typed IPC channels. The renderer never accesses Node.js APIs directly. No `nodeIntegration` in renderer.

### II. IPC Bridge Pattern
All main↔renderer communication uses typed channels:
- `ipcMain.handle()` for request-response (renderer invokes, main responds)
- `webContents.send()` for push events (main notifies renderer)
- All channels defined in a shared `IpcChannel` enum for end-to-end type safety
- Preload script exposes only the declared API surface — no raw IPC access in renderer

### III. Unified SQLite Storage
Single SQLite database via Drizzle ORM, accessed exclusively from main process:
- All entities persisted to SQLite tables (replacing Dexie/IndexedDB + Redux-persist split)
- Zustand stores hydrate from SQLite on startup via IPC
- State changes sync back to SQLite through debounced IPC writes
- Schema versioned with Drizzle Kit migrations

### IV. Streaming First
All LLM interactions use streaming by default:
- UI renders incrementally as tokens arrive (block-based message architecture)
- Abort/pause/resume controls on every streaming response
- Error recovery without losing partial content
- Non-streaming fallback only when provider doesn't support it

### V. Model Agnosticism
Provider abstraction ensures same chat interface regardless of LLM provider:
- Vercel AI SDK handles provider-specific differences
- Model capabilities detected at runtime, not assumed
- Graceful degradation for unsupported features (e.g., reasoning_effort on non-thinking models)
- Supports local models (Ollama, LM Studio) with same UX as cloud providers

### VI. Feature Isolation
Each Feature owns its complete vertical slice:
- Directory: `src/renderer/src/features/{feature-name}/`
- Zustand store file(s)
- IPC channel namespace
- SQLite table(s) via Drizzle schema
- Component tree
Cross-feature communication only through exported interfaces and shared type definitions.

### VII. Type Safety First
All boundaries are typed:
- Entities defined with Zod schemas (runtime validation + TypeScript types)
- IPC channels typed end-to-end (preload → main → response)
- No `any` types except in legacy migration adapters
- Strict TypeScript with `noUncheckedIndexedAccess`

## Technical Constraints

### Platform Support
- macOS (primary): hidden titlebar with traffic lights (`titleBarStyle: 'hidden'`), vibrancy support
- Windows: custom frameless window with titlebar overlay, portable mode support
- Linux: AppImage packaging, optional system titlebar

### Security
- API keys encrypted at rest (AES via main process)
- Preload script with `contextIsolation: true`, `sandbox: false` (for IPC)
- File access only through managed FileStorage service in main process
- No direct `eval()` or remote code execution in renderer

### Performance
- Minimum window: 1080×600
- Message blocks stored separately (lazy loading — don't load full message content upfront)
- Lazy loading for heavy editor components (CodeMirror, TipTap)
- Virtual scrolling for long message lists

### Data Integrity
- Single-instance lock (Electron `requestSingleInstanceLock()`) prevents concurrent data access
- Graceful shutdown: flush state to SQLite before quit
- Quit prevention during critical operations (backup, LAN transfer)
- Schema versioning with forward-compatible migrations via Drizzle Kit

## Stack & Conventions

### Technology Stack
| Layer | Technology |
|-------|-----------|
| Runtime | Electron (latest) |
| Language | TypeScript 5.x (strict mode) |
| UI Framework | React 19 |
| Components | shadcn/ui + Radix UI primitives |
| Styling | Tailwind CSS 4 (utility-first, no styled-components) |
| State | Zustand + TanStack Query |
| Database | SQLite via Drizzle ORM (unified, main process only) |
| AI | Vercel AI SDK |
| Rich Text | TipTap + CodeMirror |
| Build | electron-vite |
| i18n | i18next |
| Testing | Vitest + Playwright |

### Naming Conventions
- **Project name mapping**: Cherry → Angdu (all code, configs, branding)
- **Feature directories**: `src/renderer/src/features/{kebab-case}/`
- **Components**: PascalCase files, one component per file
- **Stores**: `src/renderer/src/stores/{feature}.ts` — Zustand `create()` pattern
- **IPC channels**: `IpcChannel.{Namespace}_{Action}` enum members
- **SQLite tables**: snake_case via Drizzle schema files in `src/main/database/schema/`

### AI Assistant Archetype
This is an AI assistant application. Architectural decisions prioritize:
1. **Streaming UX**: Progressive rendering, thinking indicators, abort controls
2. **Block-based messages**: Responses decomposed into typed blocks (text, thinking, code, tool, citation, image, error)
3. **Multi-provider**: Same assistant uses any model from any of 16+ providers
4. **Context awareness**: Configurable context windows with message count controls
5. **Tool integration**: MCP tools invoked by assistants with structured result blocks
6. **Knowledge augmentation**: RAG-enhanced responses via knowledge base queries

## Governance

This constitution is the authoritative guide for all Angdu Studio development. All specs, plans, and implementations must comply with these principles. Amendments require:
1. Documenting the proposed change with rationale
2. Updating this file with a version bump
3. Propagating changes to affected specs and plans

**Version**: 1.0.0 | **Ratified**: 2026-03-15 | **Last Amended**: 2026-03-15
