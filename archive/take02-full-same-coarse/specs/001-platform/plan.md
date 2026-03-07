# Implementation Plan: Platform Infrastructure

**Branch**: `001-platform` | **Date**: 2026-03-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-platform/spec.md`

## Summary

Implementing the foundational Electron desktop application shell for Cherry Studio, providing 3-process architecture (main/preload/renderer), typed IPC bridge with 260+ channels, sandboxed file management, theme switching (light/dark/system), settings UI framework, system tray integration, auto-update with channel selection, configurable global shortcuts, proxy configuration, multi-window support (5 entry points), Dexie database initialization, and Redux store with selective persistence. This is a Same Stack rebuild reusing proven patterns from the original Cherry Studio codebase.

## Technical Context

**Language/Version**: TypeScript 5.8
**Primary Dependencies**: Electron 40.6.1, React 19.2, Redux Toolkit 2.2, Ant Design 5.27, Tailwind CSS 4, Dexie 4.x, electron-vite 5.0, electron-builder 26.8, i18next, redux-persist
**Storage**: Dexie (IndexedDB) in renderer process
**Testing**: Vitest 3.2 + Playwright 1.55
**Target Platform**: Windows (x64/arm64), macOS (x64/arm64), Linux (x64/arm64)
**Project Type**: desktop-app (Electron)
**Performance Goals**: <5s cold start, <100ms IPC round-trip for non-I/O operations, <200ms theme switch
**Constraints**: Offline-capable, <200MB memory footprint, cross-platform compatibility
**Scale/Scope**: ~1,666 source files in original codebase, ~40 files for F001 implementation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Electron 3-Process Isolation | Compliant | Core of this feature: main process for system access, preload for secure bridge, renderer for UI |
| II. Plugin-Based AI Pipeline | N/A | Not in F001 scope (addressed in F002) |
| III. Message Block Decomposition | N/A | Not in F001 scope (addressed in F003) |
| IV. Monorepo Package Separation | Compliant | IPC channel types in packages/shared, shared configs in packages/shared/config |
| V. Provider Abstraction Layer | N/A | Not in F001 scope (addressed in F002) |
| VI. Redux Toolkit State Management | Compliant | Core of this feature: Redux store with selective persistence via redux-persist |
| Test-First Development | Compliant | Tests written before implementation for each user story |
| Simplicity First | Compliant | Reusing existing patterns from original codebase, no unnecessary abstractions |
| Demo-Ready Delivery | Compliant | Demo script covers app launch, theme switching, file management, settings persistence |
| Biome Formatting | Compliant | 2-space indent, single quotes, no semicolons, 120-char line width |

## Project Structure

### Documentation (this feature)

```text
specs/001-platform/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── ipc-channels.md  # IPC channel contract definitions
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── main/                        # Electron main process
│   ├── index.ts                 # Entry point: app lifecycle, single-instance lock
│   ├── bootstrap.ts             # App initialization: service registration, IPC setup
│   ├── ipc.ts                   # IPC handler registration (all channel groups)
│   ├── config.ts                # Config constants (paths, defaults)
│   ├── constant.ts              # Environment constants (isDev, platform checks)
│   └── services/
│       ├── WindowService.ts     # Window creation, state persistence, multi-window
│       ├── AppService.ts        # App-level operations (info, quit, relaunch)
│       ├── ThemeService.ts      # Theme management (light/dark/system detection)
│       ├── TrayService.ts       # System tray icon and context menu
│       ├── ShortcutService.ts   # Global keyboard shortcut registration
│       ├── AppUpdater.ts        # Auto-update with channel selection
│       ├── FileStorage.ts       # Managed file storage (copy, read, delete)
│       ├── FileSystemService.ts # Low-level file system operations
│       ├── ConfigManager.ts     # Persistent config (electron-store)
│       ├── ProxyManager.ts      # HTTP/HTTPS/SOCKS proxy configuration
│       ├── LoggerService.ts     # Structured logging (main process)
│       ├── PowerMonitorService.ts # Power events (sleep, shutdown)
│       ├── NotificationService.ts # Native notifications
│       └── VersionService.ts    # Version info and update channel
├── preload/
│   └── index.ts                 # Preload bridge: contextBridge.exposeInMainWorld
├── renderer/
│   └── src/
│       ├── App.tsx              # Root React component (providers, layout)
│       ├── Router.tsx           # Route definitions (5 entry points)
│       ├── init.ts              # Renderer initialization (store hydration, theme)
│       ├── databases/
│       │   └── index.ts         # Dexie schema definition and migrations
│       ├── store/
│       │   ├── index.ts         # Redux store root (configureStore, persistor)
│       │   ├── runtime.ts       # Runtime state slice (non-persisted)
│       │   ├── settings.ts      # Settings state slice (persisted)
│       │   └── shortcuts.ts     # Shortcuts state slice (persisted)
│       ├── pages/
│       │   └── settings/        # Settings pages (General, Display, Shortcuts, Data, About)
│       ├── services/
│       │   └── LoggerService.ts # Structured logging (renderer process)
│       ├── types/
│       │   └── index.ts         # Core type definitions
│       └── assets/              # Fonts, styles, images, i18n translations
packages/
├── shared/
│   ├── IpcChannel.ts            # IPC channel enum (260+ channels)
│   └── config/                  # Shared configuration constants
electron.vite.config.ts          # Build configuration (main + preload + renderer)
electron-builder.yml             # Distribution configuration (all platforms)
```

**Structure Decision**: Electron monorepo with 3-process separation (main/preload/renderer) plus a shared package for cross-process types. This mirrors the original Cherry Studio structure and follows the Monorepo Package Separation constitution principle. The `packages/shared` directory holds IPC channel definitions and shared configs that both main and renderer processes import at build time.

## Implementation Phases

### Phase 1: Core Shell (US1, US2, US4, US3)

Priority P1 user stories that establish the minimum viable application shell.

| Order | User Story | Key Deliverables |
|-------|-----------|-----------------|
| 1 | US1 - Application Launch and Initialization | main/index.ts, bootstrap.ts, WindowService, single-instance lock, power monitor |
| 2 | US2 - File Management | FileStorage, FileSystemService, file IPC handlers, FileMetadata entity |
| 3 | US4 - Settings Management | Settings pages, settings store slice, config persistence |
| 4 | US3 - Theme and Display Settings | ThemeService, theme IPC handlers, system theme detection |

**Phase 1 Exit Criteria**: App launches on all 3 platforms, files can be uploaded/downloaded/deleted, settings persist across restarts, theme switching works with system-follow mode.

### Phase 2: Platform Services (US5, US6, US7, US8, US9, US10)

Priority P2/P3 user stories that add platform-level services on top of the core shell.

| Order | User Story | Key Deliverables |
|-------|-----------|-----------------|
| 1 | US5 - System Tray Integration | TrayService, platform-specific tray icons |
| 2 | US6 - Auto-Update | AppUpdater, update channel selection, background download |
| 3 | US7 - Keyboard Shortcuts | ShortcutService, shortcut settings UI, shortcuts store slice |
| 4 | US8 - Proxy Configuration | ProxyManager, proxy settings UI, system proxy detection |
| 5 | US9 - Multi-Window Support | Multi-window WindowService, mini window, selection toolbar |
| 6 | US10 - Data Path Management | Data path migration, portable mode detection |

**Phase 2 Exit Criteria**: All 10 user stories pass their acceptance scenarios on all 3 platforms.

## Complexity Tracking

> No constitution violations detected. All principles are either compliant or not applicable to F001 scope.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
