# Implementation Plan: App Shell

**Branch**: `001-app-shell` | **Date**: 2026-03-15 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-app-shell/spec.md`

## Summary

Implement the Electron desktop application shell — the foundational layer upon which all Angdu Studio features are built. This includes: app lifecycle management, frameless window with custom title bar, typed IPC bridge (contextBridge), configuration persistence (better-sqlite3), system tray integration, auto-update, deep link protocol, global shortcuts, and utility IPC services (file, shell, dialog, clipboard, theme, app info).

## Technical Context

**Language/Version**: TypeScript 5.8+ (strict mode)
**Primary Dependencies**: Electron v40+, electron-vite, electron-updater, better-sqlite3, Zustand, React 19, Zod
**Storage**: better-sqlite3 for config persistence (main process)
**Testing**: Vitest (unit/integration), Playwright (E2E via `_electron.launch()`)
**Target Platform**: macOS, Windows, Linux (Electron desktop)
**Project Type**: desktop-app (Electron)
**Performance Goals**: Cold start < 2s, IPC round-trip < 10ms
**Constraints**: Context isolation mandatory, nodeIntegration false, sandbox enabled
**Scale/Scope**: Foundation for 10-feature rebuild, 25 invoke + 8 event IPC channels

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Verification |
|-----------|--------|-------------|
| I. SSoT | ✅ Pass | Shared types in `src/shared/types/` used by main, preload, and renderer |
| II. Explicit Over Implicit | ✅ Pass | All IPC handlers explicitly registered with typed channel names |
| III. Fail Loudly, Recover Gracefully | ✅ Pass | Config corruption → defaults + logged warning; IPC errors serialized |
| IV. Composition Over Inheritance | ✅ Pass | Services composed via DI, no class hierarchies |
| V. Test the Contract | ✅ Pass | IPC contracts tested via invoke/response, not internal implementation |
| VI. Progressive Enhancement | ✅ Pass | Layer 0 (config + IPC) → Layer 1 (window + tray) → Layer 2 (update + deep link) |
| ARC-01 IPC Bridge | ✅ Pass | All communication via contextBridge, no direct Node.js access in renderer |
| ARC-04 Singletons | ✅ Pass | All main process services are singletons |
| F7-01 Crash Isolation | ✅ Pass | Critical state in SQLite (main process), renderer is ephemeral |
| F7-04 Secure by Default | ✅ Pass | contextIsolation: true, nodeIntegration: false, sandbox: true |

## Project Structure

### Documentation (this feature)

```text
specs/001-app-shell/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── ipc-invoke.md    # Request/response IPC contracts
│   └── ipc-events.md    # Event-based IPC contracts
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── main/
│   ├── index.ts                 # Entry point: app lifecycle, single-instance
│   ├── bootstrap.ts             # Sequential service initialization
│   ├── services/
│   │   ├── WindowService.ts     # BrowserWindow creation, state persistence
│   │   ├── ConfigService.ts     # better-sqlite3 config CRUD, migration
│   │   ├── TrayService.ts       # System tray icon and menu
│   │   ├── ShortcutService.ts   # Global keyboard shortcuts
│   │   ├── UpdateService.ts     # electron-updater integration
│   │   ├── ProtocolService.ts   # angdu:// deep link handling
│   │   ├── LoggerService.ts     # electron-log file logging with rotation
│   │   ├── ProxyService.ts      # HTTP/SOCKS proxy for session
│   │   └── PowerService.ts      # Power monitor suspend/resume
│   └── ipc/
│       ├── index.ts             # Register all IPC handlers
│       ├── config.ts            # config:get/set/reset/getAll handlers
│       ├── window.ts            # window:minimize/maximize/close/setSize
│       ├── file.ts              # file:read/write/delete handlers
│       ├── shell.ts             # shell:openExternal/openPath/showItemInFolder
│       ├── dialog.ts            # dialog:openFile/saveFile handlers
│       ├── clipboard.ts         # clipboard:read/write/readImage handlers
│       ├── theme.ts             # theme:get/set handlers + nativeTheme sync
│       └── app.ts               # app:getVersion/getPlatform/getPath/relaunch/quit
├── preload/
│   ├── index.ts                 # contextBridge.exposeInMainWorld('api', {...})
│   └── channels.ts             # Channel name constants (DRY with shared types)
├── renderer/
│   └── src/
│       ├── App.tsx              # Root component: ErrorBoundary + ThemeProvider
│       ├── stores/
│       │   └── useUIStore.ts    # Zustand: theme, window focus state
│       └── components/
│           └── TitleBar.tsx     # Custom frameless title bar (platform-aware)
└── shared/
    └── types/
        ├── ipc.ts               # IPC channel type map (InvokeChannels, EventChannels)
        ├── config.ts            # AppConfig type, ConfigKey enum, defaults, Zod schemas
        └── window.ts            # WindowState type

tests/
├── unit/
│   ├── config-service.test.ts   # ConfigService CRUD, migration, corruption
│   └── ipc-types.test.ts        # Type contract verification
├── integration/
│   └── ipc-bridge.test.ts       # End-to-end IPC invoke/event tests
└── e2e/
    └── app-shell.spec.ts        # Playwright: launch, window state, tray, single-instance

electron.vite.config.ts          # Electron-Vite build configuration
package.json                     # Dependencies, scripts
tailwind.config.ts               # Tailwind CSS 4 configuration
tsconfig.json                    # TypeScript strict mode configuration
```

**Structure Decision**: Electron three-process architecture (main/preload/renderer) with shared types package. This matches the Electron security model (ARC-01, F7-04) and enables compile-time type checking across all three processes.

## Pattern Constraints

| Stack Pattern | Constraint | Rationale |
|---|---|---|
| **External store + React** (Zustand + React 19) | Selector return values MUST be referentially stable. No new array/object creation per selector call. Use `shallow` equality or scalar selectors. | `useSyncExternalStore` infinite-loops if selectors create new references on every call |
| **Concurrent rendering** (React 19) | No side effects in render path. Components must be idempotent under concurrent mode. IPC calls MUST be in useEffect or event handlers, never in render. | React 19 concurrent mode may invoke render multiple times before commit |
| **IPC boundary security** | All IPC channels statically typed with Zod validation at the main process handler entry point. Renderer input is untrusted. File paths MUST be resolved and validated against userData directory. | Renderer loads user content (markdown, HTML). Malformed IPC payloads could exploit main process if unvalidated |
| **Error Boundary** | Root `App.tsx` MUST wrap all children in a React Error Boundary. Uncaught render errors display fallback UI, not a white screen. | Unhandled errors in the renderer should not crash the entire app (F7-01) |

### Visual References

- `specs/reverse-spec/visual-references/home-chat.png` — reference for navbar/tab layout that title bar integrates with

## Interaction Chains

| FR | User Action | Handler | Store Mutation | DOM Effect | Visual Result | Verify Method |
|----|-------------|---------|---------------|------------|---------------|---------------|
| FR-002 | Drag title bar | native -webkit-app-region | — | window.move() | Window repositions | verify-effect window position changed |
| FR-002 | Click maximize button | TitleBar.onMaximize() | — | IPC window:maximize | Window toggles maximize/restore | verify-state window isMaximized |
| FR-005 | Click window close | TitleBar.onClose() | — | IPC window:close → hide | Window hides, tray remains | verify-state window hidden, tray visible |
| FR-005 | Click tray icon | TrayService.onClick() | — | window.show() / window.hide() | Window toggles visibility | verify-state window visible toggled |
| FR-017 | async-flow: Theme change | theme:set IPC | useUIStore.theme='dark' | body class 'dark' added | Colors switch to dark palette | verify-effect body class "dark" |
| FR-021 | Window gains focus | WindowService.onFocus() | useUIStore.focused=true | IPC window:focus | — (state only) | verify-state useUIStore.focused true |

## Integration Contracts

| Direction | Target Feature | Interface | Provider Shape | Consumer Shape | Bridge |
|-----------|---------------|-----------|---------------|---------------|--------|
| Provides → | F002-navigation | IPC bridge (contextBridge API) | `window.api.*` methods | IPC invoke/on calls | — (direct) |
| Provides → | F003-settings | config:get/set/getAll IPC | `AppConfig` type | `AppConfig` type | — (same type) |
| Provides → | F003-settings | theme:get/set IPC | `'light' \| 'dark' \| 'system'` | `ThemePreference` | — (same values) |
| Provides → | F004-model-provider | proxy config (config:get proxyUrl) | `string \| null` | proxy URL string | — (direct) |
| Provides → | ALL | file:read/write/delete IPC | `Buffer` | `Buffer` | — (direct) |
| Provides → | ALL | shell:openExternal IPC | URL string | URL string | — (direct) |

## Complexity Tracking

No constitution violations. All patterns align with principles.

---

## Implementation Phases

### Phase 1: Project Scaffold + Build Pipeline

- Initialize electron-vite project structure
- Configure TypeScript strict mode with path aliases (@main/, @renderer/, @shared/)
- Set up Tailwind CSS 4 + shadcn/ui
- Configure Vitest + Playwright
- Verify `pnpm dev` launches a blank Electron window

### Phase 2: Shared Types + IPC Infrastructure

- Define IPC channel type map in `src/shared/types/ipc.ts`
- Define AppConfig and WindowState types with Zod schemas
- Implement preload bridge (`contextBridge.exposeInMainWorld`)
- Implement IPC handler registration framework in `src/main/ipc/`

### Phase 3: Core Services (Config + Window + Lifecycle)

- Implement ConfigService (better-sqlite3 CRUD, defaults, migration)
- Implement WindowService (BrowserWindow creation, state persistence, frameless)
- Implement app lifecycle (single-instance, before-quit, macOS activate)
- Implement bootstrap sequence (service init order)

### Phase 4: Renderer Shell

- Implement App.tsx with ErrorBoundary + ThemeProvider
- Implement TitleBar component (platform-aware, drag regions)
- Implement useUIStore (theme, focused state)
- Wire theme IPC (get/set + nativeTheme sync)

### Phase 5: System Integration Services

- Implement TrayService (icon, context menu, click-toggle)
- Implement ShortcutService (global shortcuts register/unregister)
- Implement UpdateService (electron-updater check/download/notify)
- Implement ProtocolService (angdu:// deep link + queue)
- Implement LoggerService (electron-log with rotation)
- Implement ProxyService (session proxy config)
- Implement PowerService (suspend/resume handlers)

### Phase 6: Utility IPC Handlers

- Implement file IPC (read/write/delete with userData scoping)
- Implement shell IPC (openExternal, openPath, showItemInFolder)
- Implement dialog IPC (openFile, saveFile)
- Implement clipboard IPC (read, write, readImage)
- Implement app IPC (getVersion, getPlatform, getPath, relaunch, quit)

### Phase 7: Testing + Polish

- Unit tests for ConfigService (CRUD, migration, corruption recovery)
- Integration tests for IPC bridge (invoke round-trip, event delivery)
- E2E tests via Playwright _electron.launch() (window state, tray, single-instance)
- Verify cold start < 2s, IPC < 10ms

## Source → Target Component Mapping

| Source Component | Source File | Target Component | Target File | Notes |
|---|---|---|---|---|
| Main entry (200+ lines) | `cherry-studio/src/main/index.ts` | Main entry (57 lines) | `src/main/index.ts` | Simplified: removed crashReporter, hw accel, devtools, platform switches |
| bootstrap (imported) | `cherry-studio/src/main/bootstrap.ts` | bootstrap | `src/main/bootstrap.ts` | 5-phase sequential init. Note: Phase 4-5 init F004/F005 services (layer coupling) |
| preload/index.ts (100+ methods) | `cherry-studio/src/preload/index.ts` | preload/index.ts (typed generic) | `src/preload/index.ts` | 36 invoke + 11 events via typed generic approach |
| ConfigManager (electron-store) | `cherry-studio/.../ConfigManager.ts` | ConfigService (better-sqlite3) | `src/main/services/ConfigService.ts` | Storage engine change: electron-store → better-sqlite3 |
| WindowService | source | WindowService | target | Same concept |
| TrayService | source | TrayService | target | Same |
| ShortcutService | source | ShortcutService | target | Same |
| ProtocolClient (cherry://) | source | ProtocolService (angdu://) | target | Renamed + rebranded |
| PowerMonitorService | source | PowerService | target | Renamed |
| ipc.ts (monolithic, 200+ handlers) | source | ipc/ (modular, 14 files) | target | Split into domain-specific modules |
| AppMenuService | source | — | — | removed (no native menu needed for frameless window) |
| crashReporter | source | — | — | removed |
| MCPService | source | — | — | deferred (F007) |
| ApiServerService | source | — | — | deferred (F010) |
| AnalyticsService | source | — | — | removed (not needed for rebuild) |
| DevTools installer | source | — | — | removed |
