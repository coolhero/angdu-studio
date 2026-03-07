# Implementation Plan: App Core

**Branch**: `001-app-core` | **Date**: 2026-03-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-app-core/spec.md`

## Summary

F001-app-core establishes the foundational Electron infrastructure for Cherry Studio: the application shell with window management (main window, system tray, min size 1000x600, state persistence), a typed IPC bridge with a centralized channel registry shared across all processes, a file storage service with UUID-based IDs and reference counting, configuration persistence with corruption fallback, internationalization for 14+ languages, centralized logging with rotation, global keyboard shortcuts, single-instance locking, custom protocol registration, and the monorepo package structure with shared types.

The technical approach uses Electron with context-isolated renderer, a shared `IpcChannel` enum for compile-time channel safety, electron-store for config persistence, i18next for i18n, Zustand for renderer-side state, Dexie for renderer-side IndexedDB persistence (FileMetadata), and better-sqlite3 via Drizzle ORM for main-process structured data in later features.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Electron (latest), React 19, Electron-Vite (Rolldown), Zustand, Shadcn/ui + TailwindCSS, i18next + react-i18next, electron-store, electron-log
**Storage**: better-sqlite3 via Drizzle ORM (main process, initialized here but no F001-owned tables), Dexie/IndexedDB (renderer process, FileMetadata entity), electron-store (config key-value persistence)
**Testing**: Vitest (unit + integration), Playwright (E2E)
**Target Platform**: Windows 10+, macOS 12+, Linux (Ubuntu 22.04+) -- cross-platform desktop
**Project Type**: desktop-app (Electron monolith with pnpm monorepo)
**Performance Goals**: App launch < 3s, IPC response < 100ms, file upload < 2s for 50MB, language switch < 500ms
**Constraints**: Context isolation enabled (renderer cannot access Node.js APIs), max-old-space-size=8000 for build, offline-capable
**Scale/Scope**: ~90 IPC channels provided by this feature, 14+ locale files, 20 functional requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | How Satisfied |
|---|-----------|--------|---------------|
| I | Dual-Process Architecture | PASS | Main process handles all Node.js operations (file I/O, config, logging, shortcuts). Renderer handles UI only. Communication exclusively via typed IPC channels. Context isolation enabled. |
| II | Centralized IPC Channel Registry | PASS | All ~90 channel names defined in a single shared `IpcChannel` enum in `packages/shared/`. Both main and renderer import from this source. No string literals for channel names. Every channel has TypeScript request/response type definitions. |
| III | Provider Abstraction Layer | N/A | No AI provider logic in F001. Provider abstraction is owned by F003/F005. |
| IV | Feature-Scoped Zustand Stores | PASS | F001 provides the Zustand infrastructure. Renderer-side state (shortcuts, app info) lives in feature-scoped stores with clear boundaries. No cross-store direct mutations. |
| V | Streaming-First Message Architecture | N/A | No message/streaming logic in F001. Owned by F004/F005. |
| VI | Monorepo Package Isolation | PASS | FR-017 explicitly requires monorepo structure with shared packages. `packages/shared/` contains types, IpcChannel enum, constants, and utilities. No circular dependencies. Path aliases for cross-package imports. Each package independently buildable. |
| VII | Multi-Provider AI Resilience | N/A | No AI provider calls in F001. |
| VIII | Streaming Pipeline Idempotency | N/A | No streaming pipeline in F001. |
| IX | Offline-First Desktop Design | PASS | All F001 functionality works offline: window management, file storage, config, i18n, logging, shortcuts. No network dependency. |
| X | MCP Tool Safety | N/A | No MCP logic in F001. |
| XI | Data Migration Robustness | PASS | Config corruption handled by FR-010 (reset to defaults). Dexie schema versioning for FileMetadata. Missing locale files fall back to English. |
| BP-I | Test-First | PASS | Tests written before implementation per constitution. Acceptance scenarios from spec.md are source of test cases. |
| BP-II | Think Before Coding | PASS | Research decisions documented in research.md. Data model and contracts defined before implementation. |
| BP-III | Simplicity First | PASS | Only specified functionality implemented. No speculative abstractions. |
| BP-IV | Surgical Changes | PASS | F001 is greenfield -- no existing code to modify. |
| BP-V | Goal-Driven Execution | PASS | Each task will have verifiable completion criteria (tests pass). |
| BP-VI | Demo-Ready Delivery | PASS | quickstart.md defines demo scenarios. App can be launched, window management exercised, IPC channels tested, file round-trip verified. |

**Result**: All applicable constitution principles satisfied. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-app-core/
├── plan.md              # This file
├── research.md          # Phase 0: Technology decisions and rationale
├── data-model.md        # Phase 1: Entity definitions (FileMetadata, Shortcut)
├── quickstart.md        # Phase 1: Validation scenarios and demo guide
├── contracts/           # Phase 1: IPC channel contracts
│   ├── ipc-app.md
│   ├── ipc-file.md
│   ├── ipc-config.md
│   ├── ipc-window.md
│   ├── ipc-shortcuts.md
│   └── ipc-system.md
├── checklists/
│   └── requirements.md  # Spec quality checklist (already exists)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── main/                          # Electron main process
│   ├── index.ts                   # Main entry: app lifecycle, single-instance lock, protocol registration
│   ├── ipc/                       # IPC handler modules (grouped by domain)
│   │   ├── index.ts               # IPC registration hub
│   │   ├── app.ipc.ts             # app:* channel handlers
│   │   ├── file.ipc.ts            # file:* channel handlers
│   │   ├── config.ipc.ts          # config:* channel handlers
│   │   ├── window.ipc.ts          # window:* channel handlers
│   │   ├── shortcuts.ipc.ts       # shortcuts:* channel handlers
│   │   └── system.ipc.ts          # system:*, zip:* channel handlers
│   ├── services/                  # Main process services
│   │   ├── WindowService.ts       # Window creation, state persistence, tray icon
│   │   ├── FileStorageService.ts  # File upload, read, write, delete, download, ref counting
│   │   ├── ConfigService.ts       # electron-store wrapper with typed keys
│   │   ├── LoggerService.ts       # Centralized logging with daily rotation
│   │   ├── ShortcutService.ts     # Global keyboard shortcut management
│   │   └── AppService.ts          # App lifecycle utilities (portable mode, paths)
│   └── utils/                     # Main process utilities
│       ├── paths.ts               # App data paths, portable mode detection
│       └── platform.ts            # Cross-platform utilities
├── preload/
│   └── index.ts                   # Preload bridge: exposes typed window.api via contextBridge
├── renderer/
│   └── src/
│       ├── App.tsx                # Root React component
│       ├── main.tsx               # Renderer entry point
│       ├── components/            # Shared UI components (Shadcn/ui based)
│       │   └── ui/                # Shadcn/ui component copies
│       ├── hooks/                 # Shared React hooks
│       │   └── useIpc.ts          # Typed IPC invocation hook
│       ├── stores/                # Zustand stores (feature-scoped)
│       │   ├── app.store.ts       # App info, theme, language state
│       │   └── shortcuts.store.ts # Keyboard shortcuts state
│       ├── types/                 # Renderer-specific types
│       │   └── file.ts            # FileMetadata, FileType definitions
│       ├── i18n/                  # Internationalization
│       │   ├── index.ts           # i18next initialization
│       │   └── locales/           # Language JSON files (14+ languages)
│       │       ├── en-us.json
│       │       ├── zh-cn.json
│       │       ├── zh-tw.json
│       │       └── ...            # Additional locale files
│       ├── assets/                # Static assets
│       │   ├── images/            # Logo, avatar, icons
│       │   ├── fonts/             # Ubuntu, icon fonts, country flag fonts
│       │   └── styles/            # Base CSS, TailwindCSS config
│       └── databases/             # Dexie IndexedDB schemas
│           └── index.ts           # Dexie DB definition (FileMetadata table)
├── packages/
│   └── shared/                    # Shared across all processes
│       ├── index.ts               # Package entry point
│       ├── IpcChannel.ts          # Centralized IPC channel enum
│       ├── types/                 # Shared type definitions
│       │   ├── ipc.ts             # IPC request/response type mappings
│       │   ├── file.ts            # FileMetadata, FileType (shared version)
│       │   └── config.ts          # Config key type definitions
│       ├── constants/             # Shared constants
│       │   └── index.ts           # App constants, default values
│       └── utils/                 # Shared utility functions
│           └── index.ts           # Common utilities
build/
├── icons/                         # App icons (multiple sizes)
├── icon.ico                       # Windows icon
├── icon.png                       # App icon
├── tray_icon.png                  # System tray icon
├── tray_icon_dark.png             # Dark mode tray icon
└── tray_icon_light.png            # Light mode tray icon
tests/
├── unit/                          # Vitest unit tests
│   ├── main/                      # Main process service tests
│   │   ├── FileStorageService.test.ts
│   │   ├── ConfigService.test.ts
│   │   ├── LoggerService.test.ts
│   │   └── ShortcutService.test.ts
│   ├── renderer/                  # Renderer store/hook tests
│   │   ├── app.store.test.ts
│   │   └── shortcuts.store.test.ts
│   └── shared/                    # Shared package tests
│       └── IpcChannel.test.ts
├── integration/                   # IPC round-trip tests
│   ├── ipc-app.test.ts
│   ├── ipc-file.test.ts
│   ├── ipc-config.test.ts
│   └── ipc-window.test.ts
└── e2e/                           # Playwright E2E tests
    ├── app-launch.test.ts
    ├── window-management.test.ts
    ├── file-operations.test.ts
    └── i18n-switch.test.ts
demos/
└── F001-app-core.md               # Demo guide for stakeholder verification
electron.vite.config.ts            # Electron-Vite build configuration
electron-builder.yml               # Electron Builder packaging configuration
pnpm-workspace.yaml                # pnpm monorepo workspace configuration
package.json                       # Root package.json
tsconfig.json                      # Root TypeScript configuration
tailwind.config.ts                 # TailwindCSS configuration
```

**Structure Decision**: Electron monorepo structure with three process entry points (main, preload, renderer) and a shared packages directory. This maps directly to Electron's process model and satisfies Constitution Principle I (Dual-Process Architecture) and Principle VI (Monorepo Package Isolation). IPC handlers are split by domain in `src/main/ipc/` to keep each file focused while the central registry lives in `packages/shared/IpcChannel.ts`.

## Complexity Tracking

> No constitution violations found. All principles are satisfied by the design.

No entries required.
