# Implementation Plan: App Core

**Branch**: `001-app-core` | **Date**: 2026-03-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-app-core/spec.md`

## Summary

F001-app-core establishes the foundational Electron shell for Angdu Studio. It provides the 3-process architecture (main/renderer/preload), typed IPC bridge, window management with state persistence, config persistence with observer pattern, theming (Light/Dark/System), system tray, global keyboard shortcuts, desktop notifications, context menus, structured logging, proxy configuration, Zustand store sync across windows, and auxiliary services (version, power monitor, cache). This is the foundation upon which all other features are built.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Electron, React 19, shadcn/ui, Tailwind CSS 4, Zustand, electron-store, Winston, Emittery, Zod
**Storage**: electron-store (config persistence), Zustand persist (runtime state)
**Testing**: Vitest (unit/integration), Playwright (E2E)
**Target Platform**: Windows, macOS, Linux (desktop)
**Project Type**: desktop-app (Electron)
**Performance Goals**: App launch < 3s, IPC < 100ms, theme switch < 200ms
**Constraints**: Offline-capable, cross-platform, 50MB JSON payload limit
**Scale/Scope**: Foundation for 12 features, 280+ IPC handlers, 47+ services

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Multi-Process Architecture | PASS | Main/renderer/preload separation with typed IPC |
| II. Service-Oriented Design | PASS | Singleton services in main process, IPC-only access |
| IV. Entity-Store Separation | PASS | electron-store (config), Zustand (runtime) |
| V. Event-Driven Communication | PASS | Typed IPC + Emittery + config observer |
| VIII. Test-First | PASS | Tests defined before implementation in task breakdown |
| IX. Type Safety End-to-End | PASS | Zod schemas at IPC boundary, typed channel enum |
| X. Observable by Default | PASS | Winston structured logging, module filters |
| XIV. Sensitive Data Protection | PASS | Env vars with ANGDU_ prefix redacted in logs |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-app-core/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── ipc-channels.md  # IPC channel contracts
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── main/                       # Main process (Node.js)
│   ├── index.ts                # App entry, single instance lock, platform detection
│   ├── ipc.ts                  # IPC handler registration hub
│   └── services/
│       ├── AppService.ts       # App lifecycle, launch-on-boot, platform detection
│       ├── ConfigManager.ts    # Config persistence with observer pattern
│       ├── WindowService.ts    # Window lifecycle, state persistence, crash recovery
│       ├── ThemeService.ts     # Theme management with OS sync
│       ├── TrayService.ts      # System tray icon and menu
│       ├── ShortcutService.ts  # Global keyboard shortcuts
│       ├── NotificationService.ts  # Desktop notifications
│       ├── ContextMenuService.ts   # Right-click context menus
│       ├── LoggerService.ts    # Winston logging with rotation
│       ├── VersionService.ts   # Version tracking
│       ├── PowerMonitorService.ts  # System sleep/wake events
│       ├── ZustandSyncService.ts   # Cross-window state sync (replaces ReduxService)
│       ├── CacheService.ts     # In-memory LRU cache
│       └── ProxyManager.ts     # HTTP/SOCKS proxy configuration
├── preload/
│   ├── index.ts                # contextBridge API exposure
│   └── preload.d.ts            # Type definitions for bridge
├── renderer/
│   └── src/
│       ├── App.tsx             # Root component with theme provider
│       ├── app.css             # Tailwind CSS 4 theme (@theme directive, dark mode)
│       ├── stores/
│       │   ├── useThemeStore.ts    # Theme state (mode, resolved)
│       │   └── useAppStore.ts      # App info state (version, platform, dataPath)
│       ├── hooks/
│       │   ├── useIpc.ts           # Typed IPC invoke wrapper
│       │   └── useTheme.ts         # Theme hook with OS sync
│       ├── components/
│       │   └── ui/                 # shadcn/ui primitives
│       └── lib/
│           ├── cn.ts               # clsx + tailwind-merge utility
│           └── zustand-sync.ts     # BroadcastChannel sync middleware
└── shared/
    ├── IpcChannel.ts           # IPC channel enum (typed channel names)
    ├── types/
    │   ├── config.ts           # Config key types and Zod schemas
    │   ├── window.ts           # WindowState type
    │   ├── shortcut.ts         # Shortcut type
    │   └── theme.ts            # Theme types
    └── constants.ts            # App constants (default config, etc.)

tests/
├── unit/
│   ├── services/               # Service unit tests
│   └── stores/                 # Store unit tests
├── integration/
│   └── ipc/                    # IPC round-trip tests
└── e2e/
    └── app-launch.spec.ts      # E2E launch and basic interaction tests
```

**Structure Decision**: Electron monorepo with main/preload/renderer/shared separation. This is the standard Electron structure matching the original Cherry Studio architecture and Constitution Principle I (Multi-Process Architecture).

## Complexity Tracking

No violations to justify. All patterns align with constitution principles.
