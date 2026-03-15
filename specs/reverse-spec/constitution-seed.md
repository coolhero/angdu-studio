# Constitution Seed — Angdu Studio

> Foundational constraints and principles for the Angdu Studio rebuild.
> This document seeds the project constitution that will guide all Feature specs.

---

## Source Reference

| | |
|---|---|
| **Original** | Cherry Studio (https://github.com/CherryHQ/cherry-studio) |
| **Target** | Angdu Studio |
| **Naming** | Cherry -> Angdu prefix mapping |
| **Analysis Date** | 2026-03-15 |
| **Source Files** | ~2,206 files |

---

## Architecture Principles

### AP-1: Electron Multi-Process Architecture

The app runs as three distinct processes:

1. **Main Process** — Node.js runtime: window management, IPC handling, file system, native APIs, auto-update, tray
2. **Renderer Process** — Chromium: React UI, state management, AI SDK calls, user interaction
3. **Preload Bridge** — Sandboxed bridge: exposes safe IPC methods to renderer via contextBridge

All cross-process communication goes through typed IPC channels. The renderer never accesses Node.js APIs directly.

### AP-2: IPC Bridge Pattern

```
Renderer (React) -> preload (contextBridge) -> ipcMain (Main) -> Service Layer
                                                                      |
                                                               Response / Event
                                                                      |
Main -> webContents.send() -> Renderer (event listener)
```

- `ipcMain.handle()` for request-response (renderer invokes, main responds)
- `webContents.send()` for push events (main notifies renderer)
- All channels defined in a shared `IpcChannel` enum

### AP-3: Unified SQLite Storage

**Migration from**: Dexie (IndexedDB) + SQLite + Redux-persist split storage

**Target**: Single SQLite database via Drizzle ORM, accessed from main process.

- All entities persisted to SQLite tables
- Zustand stores hydrate from SQLite on startup
- State changes sync back to SQLite via IPC
- No more IndexedDB (Dexie) dependency

### AP-4: Zustand State Architecture

**Migration from**: Redux Toolkit with createSlice pattern

**Target**: Zustand stores with:
- One store per domain (assistants, providers, settings, tabs, etc.)
- Middleware: persist (SQLite), devtools, immer
- No more Redux boilerplate (actions, reducers, selectors, thunks)

### AP-5: Component Library Migration

**Migration from**: Ant Design 5 with styled-components

**Target**: shadcn/ui + Radix UI primitives + Tailwind CSS 4

- Every UI component rebuilt with shadcn/ui
- Design tokens via CSS custom properties
- Tailwind utility classes only (no styled-components)
- Dark/light theme via Tailwind dark mode + CSS variables

---

## Technical Constraints

### TC-1: Platform Support

- macOS (primary): hidden titlebar with traffic lights, vibrancy support
- Windows: custom titlebar, portable mode support
- Linux: AppImage support, custom titlebar

### TC-2: Security

- API keys encrypted at rest (AES)
- preload script with contextIsolation enabled
- No `nodeIntegration` in renderer
- File access only through managed FileStorage service

### TC-3: Performance

- Minimum window: 1080x600
- Streaming-first for all LLM responses
- Lazy loading for heavy components (CodeMirror, TipTap)
- Message blocks stored separately to avoid loading full message content

### TC-4: Data Integrity

- Single-instance lock prevents concurrent data access
- Graceful shutdown: save data signal before quit
- Quit prevention during critical operations (backup, transfer)
- Schema versioning with migration support

---

## Stack Migration Notes

### Ant Design 5 -> shadcn/ui

| Ant Design | shadcn/ui Equivalent | Notes |
|------------|---------------------|-------|
| Button, Input, Select | Button, Input, Select | Direct mapping |
| Modal, Drawer | Dialog, Sheet | Similar API |
| Table | DataTable (TanStack) | More flexible |
| Form | Form (react-hook-form) | Better validation |
| Notification, Message | Toast (sonner) | Simpler API |
| Tabs | Tabs (Radix) | Accessible by default |
| Dropdown, Menu | DropdownMenu, ContextMenu | Radix primitives |
| Tooltip, Popover | Tooltip, Popover | Radix primitives |
| Layout, Sider | Custom layout with Tailwind | No direct equivalent |
| Tree | Custom or third-party | No built-in Tree |

### Redux Toolkit -> Zustand

| Redux Pattern | Zustand Equivalent |
|--------------|-------------------|
| `createSlice` | `create()` with set/get |
| `PayloadAction` | Direct function parameters |
| `createSelector` | `useShallow` or manual selectors |
| `createAsyncThunk` | Async functions in store |
| `configureStore` | Individual store files |
| `useSelector` | `useStore(selector)` |
| `useDispatch` | `useStore.getState().action()` |
| Redux-persist | Zustand persist middleware + SQLite |

### Dexie + SQLite -> Unified SQLite

| Current Layer | Migration Target |
|--------------|-----------------|
| Dexie `files` table | SQLite `files` table |
| Dexie `topics` table | SQLite `topics` + `messages` tables |
| Dexie `message_blocks` table | SQLite `message_blocks` table |
| Dexie `settings` table | SQLite `settings` table |
| Dexie `knowledge_notes` | SQLite `knowledge_items` |
| Dexie `quick_phrases` | SQLite `quick_phrases` |
| Redux-persist (localStorage) | Zustand persist -> SQLite |
| Main process SQLite (agents) | Same SQLite, unified schema |

---

## Recommended Dev Principles

### DP-1: Feature Isolation

Each Feature owns its:
- Directory in `src/renderer/src/features/{feature-name}/`
- Zustand store slice
- IPC channel namespace
- SQLite table(s)
- Component tree

Cross-feature communication only through exported interfaces and shared stores.

### DP-2: Type Safety First

- All entities defined with Zod schemas (validation + types)
- IPC channels typed end-to-end (preload -> main -> response)
- No `any` types except in migration adapters

### DP-3: Streaming First

- All LLM interactions use streaming by default
- UI renders incrementally as tokens arrive
- Abort/pause/resume controls on every streaming response
- Error recovery without losing partial content

### DP-4: Model Agnosticism

- Provider abstraction: same chat interface regardless of LLM provider
- Vercel AI SDK handles provider differences
- Model capabilities detected, not assumed
- Graceful degradation for unsupported features (e.g., reasoning_effort on non-thinking models)

### DP-5: Offline Resilience

- All data stored locally (no cloud dependency for core features)
- Provider configurations work with local models (Ollama, LM Studio, OVMS)
- App functions (navigation, settings, history) without internet

---

## AI Assistant Archetype Principles

These principles define how Angdu Studio's AI assistant system behaves:

1. **Streaming-first**: All responses stream by default; the UI is designed around progressive rendering
2. **Model agnosticism**: The same assistant can use any model from any provider; switching is seamless
3. **Block-based messages**: Responses are decomposed into typed blocks (text, thinking, code, tool, citation, image, error) for rich display
4. **Context awareness**: Assistants manage context windows with configurable message counts and clear markers
5. **Multi-model comparison**: Users can @-mention multiple models and compare responses side-by-side
6. **Tool integration**: Assistants can invoke MCP tools, with results rendered as structured blocks
7. **Knowledge augmentation**: Assistants can query knowledge bases for RAG-enhanced responses
8. **Configurable personality**: System prompts, temperature, reasoning effort, and custom parameters per assistant
