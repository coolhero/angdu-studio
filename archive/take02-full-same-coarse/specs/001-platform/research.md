# Research: Platform Infrastructure

**Feature**: F001-platform | **Date**: 2026-03-02 | **Strategy**: Same Stack Rebuild

This is a Same Stack rebuild of Cherry Studio. Research focuses on confirming existing patterns from the original codebase and validating technology choices rather than evaluating novel approaches.

## Decision 1: Electron 3-Process Architecture

**Question**: How should the desktop application architecture be structured for security, performance, and maintainability?

**Decision**: Reuse existing main/preload/renderer pattern with context isolation enabled.

**Rationale**:
- Proven architecture in the original Cherry Studio codebase with ~1,666 source files
- Security best practice: context isolation prevents renderer from directly accessing Node.js APIs
- Main process handles all system-level operations (file I/O, native dialogs, tray, shortcuts)
- Preload script exposes a controlled API surface via `contextBridge.exposeInMainWorld`
- Renderer process runs React in a sandboxed browser context
- Clear separation of concerns maps naturally to the codebase structure

**Alternatives Considered**:
| Alternative | Reason Rejected |
|------------|----------------|
| Single-process (no isolation) | No security boundary between web content and system APIs. Violates Electron security guidelines and Constitution Principle I |
| Web-only (no Electron) | Cannot access native features: file system, global shortcuts, system tray, auto-update. Fundamental requirement mismatch |
| Tauri (Rust backend) | Different stack from original. Constitution mandates Same Stack rebuild strategy. Would require rewriting all main process logic in Rust |

**Evidence**: Original codebase uses this exact pattern in `src/main/`, `src/preload/`, and `src/renderer/`. Electron security documentation recommends context isolation as the default for all new applications.

## Decision 2: IPC Channel Management

**Question**: How should inter-process communication channels be organized and typed across 260+ channel definitions?

**Decision**: Centralized typed enum in `packages/shared/IpcChannel.ts` with namespace grouping.

**Rationale**:
- Single source of truth for all channel names prevents typos and drift between processes
- TypeScript enum provides compile-time type safety for both sender and handler
- Namespace grouping (e.g., `app:*`, `file:*`, `window:*`) keeps channels organized by domain
- Shared package makes the enum importable by both main and renderer at build time
- Original codebase uses this exact pattern with proven scalability to 260+ channels

**Alternatives Considered**:
| Alternative | Reason Rejected |
|------------|----------------|
| String literals throughout codebase | No type safety, prone to typos, no IDE autocomplete. Refactoring channel names requires manual search-and-replace |
| Per-module channel definitions | Fragments the channel registry across multiple files. No central overview of all channels. Risk of name collisions between modules |
| Code generation from schema | Over-engineering for a Same Stack rebuild. The original enum-based approach works well at this scale |

**Evidence**: Original `packages/shared/IpcChannel.ts` contains the full enum with 260+ entries organized by namespace. This has proven maintainable across the project's lifecycle.

## Decision 3: State Management

**Question**: How should application state be managed across the renderer process, with selective persistence across restarts?

**Decision**: Redux Toolkit with selective redux-persist for state persistence.

**Rationale**:
- Proven in the original codebase which manages 28 Redux slices
- Redux Toolkit provides excellent TypeScript support with `createSlice` and typed hooks
- `redux-persist` handles selective persistence: settings and shortcuts persist, runtime state does not
- DevTools integration for debugging state changes during development
- Middleware support for side effects (thunks for IPC calls)
- Compatible with the multi-window architecture: each window gets its own store instance hydrated from persistence

**Alternatives Considered**:
| Alternative | Reason Rejected |
|------------|----------------|
| Zustand | Smaller API surface but less ecosystem support for selective persistence. Would require custom persistence logic. Constitution mandates Same Stack (Principle VI) |
| MobX | Different paradigm (observable/reactive) from the original codebase. Would require rethinking all state management patterns |
| React Context only | Insufficient for complex state with 28+ slices. No built-in persistence. Performance concerns with frequent updates causing re-renders |
| Jotai/Recoil | Atomic state model is a paradigm shift from the slice-based approach used in the original. Not justified for a Same Stack rebuild |

**Evidence**: Original codebase uses Redux Toolkit with `configureStore`, `createSlice`, and `redux-persist` with a whitelist/blacklist configuration for selective persistence. The pattern handles 28 slices without performance issues.

## Decision 4: Database

**Question**: How should structured data (file metadata, message history, etc.) be stored in the renderer process?

**Decision**: Dexie wrapping IndexedDB in the renderer process.

**Rationale**:
- Works natively in the renderer process (browser context) without native module compilation
- Built-in schema versioning and migration support via `db.version(n).stores(...)` API
- Promise-based API with excellent TypeScript support
- Original codebase uses Dexie for all client-side structured storage
- Supports compound indexes for efficient querying
- No cross-platform compilation issues (unlike SQLite native modules)

**Alternatives Considered**:
| Alternative | Reason Rejected |
|------------|----------------|
| SQLite in renderer (better-sqlite3) | Requires native module compilation for each platform/arch combination. Adds build complexity and potential compatibility issues with Electron updates |
| localStorage | 5-10MB size limit. No structured queries. No indexing. Insufficient for file metadata and future message storage |
| SQLite in main process via IPC | Adds IPC overhead to every database query. Complicates transaction management. Original uses renderer-side Dexie |
| PouchDB | Heavier than needed. CouchDB sync protocol is unnecessary for a local-only application |

**Evidence**: Original codebase defines Dexie schemas in `src/renderer/src/databases/` with versioned migrations. The pattern handles file metadata, messages, topics, and other entities without performance issues.

## Decision 5: Build System

**Question**: How should the build system be configured to compile TypeScript for three Electron processes plus multiple renderer entry points?

**Decision**: electron-vite with rolldown-vite backend for unified build pipeline.

**Rationale**:
- Single configuration file (`electron.vite.config.ts`) handles all 3 processes (main, preload, renderer)
- Vite provides fast HMR (Hot Module Replacement) for renderer development
- Supports multiple renderer entry points (main window, mini window, selection toolbar, etc.)
- electron-builder handles platform-specific packaging and distribution
- Original codebase uses this exact build setup

**Alternatives Considered**:
| Alternative | Reason Rejected |
|------------|----------------|
| webpack + electron-webpack | Slower build times, more verbose configuration. Vite's esbuild-based dev server is significantly faster |
| Turbopack | Not yet production-ready for Electron applications. Limited plugin ecosystem compared to Vite |
| esbuild directly | No HMR support. Would require custom dev server setup. Less ecosystem integration for React and CSS processing |
| Rspack | Viable alternative but not used in original. Would require migration effort without clear benefit for Same Stack rebuild |

**Evidence**: Original `electron.vite.config.ts` configures main, preload, and renderer builds with appropriate targets and externals. The setup supports 5 renderer entry points with shared dependencies.
