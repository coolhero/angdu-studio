# Implementation Plan: App Shell

**Branch**: `001-app-shell` | **Date**: 2026-03-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-app-shell/spec.md`

## Summary

F001-app-shell provides the Electron main process infrastructure: window management (main + mini), system tray, auto-update, global shortcuts, IPC bridge via preload, theme synchronization, config management, and platform-specific behaviors. This is the root feature — all other features depend on the IPC bridge and window management established here.

## Technical Context

**Language/Version**: TypeScript 5.8+ (strict mode)
**Primary Dependencies**: Electron 40, electron-store, electron-updater, electron-window-state
**Storage**: electron-store (main process config, JSON file)
**Testing**: Vitest (unit), Playwright (E2E with `_electron.launch`)
**Target Platform**: macOS, Windows, Linux (Electron desktop)
**Project Type**: desktop-app (Electron)
**Constraints**: contextIsolation: true, nodeIntegration: false, sandbox: false

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. IPC-Based Separation | ✅ PASS | All system ops route through typed IPC channels |
| II. Service-Oriented Main | ✅ PASS | Singleton services (WindowService, TrayService, etc.) |
| III. Feature-Owned State | ✅ PASS | useRuntimeStore (ephemeral), useSelectionStore (persisted) |
| IV. Provider Abstraction | N/A | No AI provider interaction in F001 |
| V. Streaming-First | N/A | No AI streaming in F001 |
| Error Boundary | ✅ PASS | Route-level Error Boundary required |
| TypeScript Strict | ✅ PASS | strict: true in all tsconfig |
| i18n | ✅ PASS | Korean default, English supported |

## Project Structure

### Documentation (this feature)

```text
specs/001-app-shell/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── contracts/
│   └── ipc-channels.md  # IPC channel contracts
├── spec.md              # Feature specification
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
  main/
    index.ts                    # App entry point, lifecycle orchestration
    bootstrap.ts                # Pre-init: data dir setup
    ipc.ts                      # IPC handler registration
    config.ts                   # DATA_PATH, platform configs, defaults
    constant.ts                 # Platform detection (isMac, isWin, isLinux, isDev)
    services/
      WindowService.ts          # Main/Mini window creation and lifecycle
      TrayService.ts            # System tray icon and context menu
      AppUpdater.ts             # Auto-update with electron-updater
      ThemeService.ts           # Native theme sync, titlebar overlay
      ShortcutService.ts        # Global keyboard shortcuts
      ConfigManager.ts          # electron-store wrapper with pub/sub
      PowerMonitorService.ts    # System shutdown handler
      AppMenuService.ts         # macOS application menu
      AppService.ts             # Launch on boot (platform-specific)
      ProtocolClient.ts         # angdustudio:// protocol handler
  preload/
    index.ts                    # contextBridge API exposure
    types.ts                    # PreloadAPI type definitions
  renderer/
    index.html                  # Main window entry
    miniWindow.html             # Mini window entry
    src/
      store/
        useRuntimeStore.ts      # Ephemeral runtime state
        useSelectionStore.ts    # Persisted selection state
packages/
  shared/
    src/
      IpcChannel.ts             # IPC channel enum
      types/
        config.ts               # AppConfig, ShortcutConfig types
        preload.ts              # PreloadAPI interface
```

## Architecture

### Main Process Services (Singleton Pattern)

Each service is a class with `private constructor` and `static getInstance()`. Services are initialized in `index.ts` during `app.whenReady()`.

**Initialization order**:
1. `bootstrap.ts` — data directory setup
2. `ConfigManager` — load config from electron-store
3. `WindowService.createMainWindow()` — main window with state persistence
4. `registerIpc()` — bind all IPC handlers
5. `ThemeService` — apply initial theme
6. `TrayService` — create system tray
7. `ShortcutService` — register global shortcuts
8. `PowerMonitorService` — register shutdown handlers
9. `AppUpdater.checkForUpdates()` — if auto-update enabled
10. `ProtocolClient` — register angdustudio:// protocol

### IPC Bridge Design

The preload script exposes a typed `window.api` object via `contextBridge.exposeInMainWorld`. Each method maps to a specific `IpcChannel` enum value. The renderer never imports Electron or Node.js modules directly.

```
Renderer → window.api.method() → ipcRenderer.invoke(channel, args)
  → ipcMain.handle(channel, handler) → Service method → response
```

### Multi-Window Architecture

| Window | Entry | Preload | State Sync |
|--------|-------|---------|------------|
| Main | index.html | shared preload | Full store sync |
| Mini | miniWindow.html | shared preload | Subset sync (runtime, selection) |

Both windows share the same preload script. State synchronization uses IPC broadcast from main process.

## Pattern Constraints

| Stack Pattern | Constraint | Rationale |
|---|---|---|
| External store + React | Zustand selector return values MUST be referentially stable. No new array/object creation per selector call. Use `shallow` comparison from zustand/shallow | React useSyncExternalStore infinite-loop if selectors create new references |
| Imperative DOM (resize) | Use `useLayoutEffect` for DOM size/position reads, NOT `useEffect` | useEffect runs after paint — one frame of stale layout causes visible flicker |
| Concurrent rendering (React 18+) | No side effects in render path. Pure components MUST be idempotent | React may invoke render multiple times before commit |
| Event handler + state | Batch state updates within event handlers | Unbatched updates cause intermediate renders with inconsistent state |
| Error Boundary | Every route/page component MUST be wrapped with Error Boundary | Uncaught errors must show fallback UI, not crash the app |
| Electron IPC | All IPC handlers MUST validate input and catch errors at boundary. Errors serialized as `{ error: string, code?: string }` | Unhandled main process errors crash the app |
| Window lifecycle | Window references MUST be null-checked before use (isDestroyed check). `checkMainWindow()` guard on all Window_* handlers | Accessing destroyed window crashes the main process |

## Implementation Phases

### Phase 1: Setup
- Initialize Electron project with electron-vite 5
- Configure TypeScript strict mode
- Set up shared package with IpcChannel enum and types
- Configure Tailwind CSS 4 with `@tailwindcss/vite`

### Phase 2: Main Process Core
- Implement bootstrap.ts (data directory init)
- Implement ConfigManager with electron-store
- Implement WindowService (main window creation, state persistence)
- Register core IPC handlers (App_Info, App_Quit, App_Reload)
- Implement preload bridge with contextBridge

### Phase 3: Window Features
- Implement mini window (always-on-top, pin, multi-monitor positioning)
- Implement window close behavior (tray minimize vs quit)
- Implement external link handling (open in system browser)
- Implement crash recovery (throttled reload)
- Implement zoom factor management

### Phase 4: System Services
- Implement TrayService (icon, context menu, click handlers)
- Implement ThemeService (dark/light/system, titlebar overlay sync)
- Implement ShortcutService (global shortcuts, format conversion)
- Implement PowerMonitorService (shutdown handlers)
- Implement AppMenuService (macOS menu)

### Phase 5: Update & Platform
- Implement AppUpdater (check, download, cancel, install)
- Implement ProtocolClient (angdustudio:// handler)
- Implement AppService (launch on boot, platform-specific relaunch)
- Implement proxy configuration (3 modes)
- Implement factory reset and data path migration

### Phase 6: Renderer Foundation
- Set up renderer entry points (index.html, miniWindow.html)
- Implement useRuntimeStore and useSelectionStore (Zustand 5)
- Set up i18n with react-i18next (ko default, en supported)
- Set up Tailwind CSS theme with CSS variables
- Implement Error Boundary wrapper

## Complexity Tracking

No constitution violations. All patterns follow established principles.
