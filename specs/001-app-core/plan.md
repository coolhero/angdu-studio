# Implementation Plan: F001-app-core

**Branch**: `main` | **Date**: 2026-03-08 | **Spec**: [`spec.md`](./spec.md)
**Input**: Feature specification from `/specs/001-app-core/spec.md`

## Summary

Build the foundational Electron shell for Angdu Studio: a desktop AI application rebuilt from Cherry Studio. This feature delivers the main window, IPC bridge, configuration store, theme system, proxy manager, auto-update, system tray, mini window, deep links, global shortcuts, notifications, and crash reporting. All downstream features (chat, providers, MCP, etc.) depend on this shell.

Technical approach: Singleton services in main process, typed IPC bridge via shared `IpcChannel` enum, `electron-store` for config persistence, `electron-window-state` for window geometry, `nativeTheme` for theme sync, multi-layer proxy (session + env + undici + http), Zustand stores in renderer synced via IPC push.

## Technical Context

**Language/Version**: TypeScript 5.8, targeting ES2022
**Primary Dependencies**: Electron 40, React 19, electron-vite 3.x + SWC, Zustand 5.x, electron-store 10.x, electron-updater 6.x, electron-window-state 5.x
**Storage**: electron-store (config JSON), electron-window-state (window geometry JSON). SQLite + Dexie reserved for downstream features.
**Testing**: Vitest (unit/integration), Playwright + Electron (E2E)
**Target Platform**: Desktop — macOS (arm64, x64), Windows (x64), Linux (x64, arm64)
**Project Type**: desktop-app
**Performance Goals**: Cold launch to interactive < 3s, IPC local ops < 100ms, theme switch < 100ms, mini window toggle < 200ms, graceful shutdown < 5s
**Constraints**: Context isolation enforced, no `nodeIntegration` in renderer, preload-only bridge
**Scale/Scope**: 19 functional requirements, 10 success criteria, 8 user stories, ~15 services

## Constitution Check

*All 8 principles addressed:*

| # | Principle | How Addressed |
|---|-----------|---------------|
| 1 | **Singleton Services** | Every main-process service (ConfigManager, ThemeService, ProxyManager, etc.) is a module-level singleton exported as `const fooService = new FooService()`. No service registry or DI container. |
| 2 | **IPC Bridge Pattern** | All renderer↔main communication uses `ipcRenderer.invoke()` / `ipcMain.handle()` through the `IpcChannel` enum. No direct `require('electron')` in renderer. `contextIsolation: true` enforced. |
| 3 | **Dual Database** | F001 uses electron-store (JSON file) for config. SQLite (Drizzle) and Dexie (IndexedDB) are initialized but not populated — reserved for F002+ features. |
| 4 | **Test-First** | Each phase includes test tasks. Unit tests for services (Vitest), IPC contract tests, E2E for window management (Playwright). |
| 5 | **Demo-Ready** | Each phase produces a working app. Phase 3 (US1) gives a launchable window. Phase 4 adds working IPC. Each subsequent phase adds visible functionality. |
| 6 | **i18n (Korean default + English)** | i18n scaffolding in Phase 12. Korean (`ko`) is the default locale. English (`en`) as secondary. All user-facing strings use i18n keys. |
| 7 | **Zustand Stores** | Renderer state uses Zustand with `use<Domain>Store` naming: `useAppStore`, `useThemeStore`, `useNotificationStore`. Replaces Cherry Studio's Redux pattern. |
| 8 | **Identity** | All references use "Angdu Studio". Protocol: `angdu-studio://`. App name, tray icon, window titles, crash reports all branded. |

## Project Structure

### Documentation (this feature)

```text
specs/001-app-core/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Research decisions (RD-001 through RD-008)
├── data-model.md        # Entity definitions
├── quickstart.md        # Dev setup and verification guide
├── contracts/
│   └── ipc-channels.md  # IPC channel contract
└── checklists/
    └── requirements.md  # FR/SC tracking
```

### Source Code (repository root)

```text
src/
├── main/
│   ├── index.ts                    # App entry: lifecycle, single-instance, bootstrap
│   ├── ipc.ts                      # Central IPC channel registration
│   ├── config.ts                   # Window creation config, title bar overlays
│   └── services/
│       ├── ConfigManager.ts        # electron-store wrapper with subscribers
│       ├── ThemeService.ts         # nativeTheme sync, title bar overlay
│       ├── ProxyManager.ts         # Multi-layer proxy (session/env/undici/http)
│       ├── WindowService.ts        # Main window creation, state persistence
│       ├── MiniWindowService.ts    # Mini window (550x400) lifecycle
│       ├── TrayService.ts          # System tray icon and context menu
│       ├── ShortcutService.ts      # Global shortcut registration
│       ├── UpdateService.ts        # electron-updater wrapper
│       ├── NotificationService.ts  # In-app + system notification dispatch
│       ├── ProtocolService.ts      # angdu-studio:// deep link handler
│       └── AppMenuService.ts       # macOS application menu
├── preload/
│   ├── index.ts                    # contextBridge API surface
│   └── preload.d.ts                # Type declarations for window.api
├── renderer/
│   └── src/
│       ├── App.tsx                 # Root component
│       ├── main.tsx                # Renderer entry
│       ├── stores/
│       │   ├── useAppStore.ts      # App-level state (version, platform, config)
│       │   ├── useThemeStore.ts    # Theme state + OS sync
│       │   └── useNotificationStore.ts  # Notification queue
│       ├── components/
│       │   ├── TitleBar.tsx        # Custom window controls (Windows/Linux)
│       │   └── NotificationCenter.tsx   # Toast notification display
│       ├── hooks/
│       │   └── useIpcListener.ts   # Hook for IPC event subscriptions
│       └── i18n/
│           ├── index.ts            # i18n setup
│           ├── ko.json             # Korean (default)
│           └── en.json             # English
└── shared/
    ├── ipc-channels.ts             # IpcChannel enum (shared by main + preload)
    ├── types.ts                    # ThemeMode, ProxyMode, AppInfo, etc.
    └── constants.ts                # MIN_WINDOW_WIDTH/HEIGHT, DEFAULT_SHORTCUTS

tests/
├── unit/
│   ├── main/
│   │   ├── config-manager.test.ts
│   │   ├── theme-service.test.ts
│   │   ├── proxy-manager.test.ts
│   │   ├── shortcut-service.test.ts
│   │   └── notification-service.test.ts
│   └── renderer/
│       ├── useAppStore.test.ts
│       └── useThemeStore.test.ts
├── integration/
│   └── ipc-bridge.test.ts
└── e2e/
    ├── window-management.spec.ts
    ├── theme-switching.spec.ts
    └── tray.spec.ts
```

**Structure Decision**: electron-vite standard layout with `src/main`, `src/preload`, `src/renderer`. Shared types and enums in `src/shared/` (imported by both main and preload via TypeScript path aliases). Tests in a top-level `tests/` directory mirroring the source structure.

## Implementation Phases

---

### Phase 1: Project Scaffold & Build Config

**Goal**: Empty Electron app that launches with electron-vite, SWC compilation, and all dependencies installed.

**Tasks**:
1. Initialize electron-vite project structure (`src/main/index.ts`, `src/preload/index.ts`, `src/renderer/src/main.tsx`)
2. Configure `electron.vite.config.ts` with SWC for main/preload, Vite + React plugin for renderer
3. Configure TypeScript: `tsconfig.json` (base), `tsconfig.main.json`, `tsconfig.preload.json`, `tsconfig.renderer.json` with path aliases (`@main/*`, `@shared/*`, `@renderer/*`)
4. Install core dependencies: `electron`, `react`, `react-dom`, `zustand`, `electron-store`, `electron-window-state`, `electron-updater`
5. Install dev dependencies: `electron-vite`, `@vitejs/plugin-react-swc`, `vitest`, `@playwright/test`, `typescript`, `tailwindcss@4`, `@tailwindcss/vite`
6. Configure `package.json` scripts: `dev`, `build`, `test`, `test:e2e`, `test:coverage`
7. Add `.gitignore` entries for `dist/`, `out/`, `node_modules/`, `*.log`
8. Verify: `pnpm dev` launches an empty Electron window

**Artifacts**: `electron.vite.config.ts`, `tsconfig*.json`, `package.json`, basic `src/` stubs

**Exit criteria**: `pnpm dev` opens a blank Electron window. `pnpm build` produces a runnable binary.

---

### Phase 2: Foundation — IPC Bridge, Preload, Config Store, Data Dir

**Goal**: Working IPC bridge with typed channels, config store with CRUD, and data directory initialization.

**Tasks**:
1. Create `src/shared/ipc-channels.ts` with the `IpcChannel` enum (all F001 channels from contracts)
2. Create `src/shared/types.ts` with `ThemeMode`, `ProxyMode`, `AppInfo`, `PlatformInfo`, `AppNotification`, `ShortcutBinding`, `UpdateChannel`
3. Create `src/shared/constants.ts` with `MIN_WINDOW_WIDTH = 1080`, `MIN_WINDOW_HEIGHT = 600`, `DEFAULT_SHORTCUTS`
4. Implement `src/main/services/ConfigManager.ts`: electron-store wrapper with `get<T>()`, `set()`, `subscribe()`, `ConfigKeys` enum
5. Create `src/preload/index.ts`: minimal preload with `contextBridge.exposeInMainWorld('api', api)` — start with `getAppInfo()`, `config.get()`, `config.set()`
6. Create `src/preload/preload.d.ts`: declare `window.api` type
7. Create `src/main/ipc.ts`: central registration function that calls `ipcMain.handle()` for each channel
8. Initialize data directory on first launch: create subdirs (`crash-reports/`, `logs/`, `files/`) under `app.getPath('userData')`
9. Write unit tests for `ConfigManager` (get/set/subscribe/defaults/corruption recovery)
10. Write IPC contract test: verify all `IpcChannel` enum values have registered handlers

**Artifacts**: `ipc-channels.ts`, `types.ts`, `constants.ts`, `ConfigManager.ts`, `preload/index.ts`, `ipc.ts`

**Exit criteria**: `window.api.config.get('theme')` returns default value. `window.api.config.set('theme', 'dark')` persists. All IPC channels respond without "no handler" errors.

---

### Phase 3: US1 — Window Management

**Goal**: Main window with platform chrome, state persistence, single instance lock, and window controls.

**Tasks**:
1. Implement `src/main/services/WindowService.ts`: `createMainWindow()` using `electron-window-state` for position/size persistence
2. Configure platform-specific chrome in `src/main/config.ts`:
   - macOS: `titleBarStyle: 'hiddenInset'`, `trafficLightPosition: { x: 8, y: 10 }`
   - Windows/Linux: `frame: false`, `titleBarOverlay` with theme-aware colors
3. Enforce minimum window size: `minWidth: 1080, minHeight: 600`
4. Implement single-instance lock: `app.requestSingleInstanceLock()`, focus existing window on `second-instance` event
5. Register window control IPC handlers: `Window_Minimize`, `Window_Maximize`, `Window_Unmaximize`, `Window_Close`, `Window_IsMaximized`, `Window_SetFullScreen`, `Window_IsFullScreen`, `Window_GetSize`
6. Emit `Window_MaximizedChanged` on maximize/unmaximize events
7. Create `src/renderer/src/components/TitleBar.tsx`: custom title bar with minimize/maximize/close buttons (Windows/Linux only)
8. Add preload API: `windowControls.minimize()`, `.maximize()`, `.unmaximize()`, `.close()`, `.isMaximized()`, `.onMaximizedChange()`
9. Write E2E test: launch app → verify window dimensions → resize → quit → relaunch → verify restored dimensions
10. Write E2E test: launch second instance → verify first instance window is focused

**Artifacts**: `WindowService.ts`, `config.ts`, `TitleBar.tsx`, E2E tests

**Exit criteria**: SC-001 (window interactive < 3s), SC-004 (second instance focuses < 500ms), SC-006 (position persists across 10 restarts).

---

### Phase 4: US2 — Full IPC Registration & Config CRUD & Zustand Store Sync

**Goal**: All F001 IPC channels are registered and functional. Zustand store in renderer syncs with main process config.

**Tasks**:
1. Register all remaining IPC handlers in `src/main/ipc.ts` (stub handlers for services not yet implemented — they'll be filled in subsequent phases)
2. Implement `Config_Get` and `Config_Set` handlers with `configManager`
3. Create `src/renderer/src/stores/useAppStore.ts`: Zustand store with `appInfo`, `platform`, hydrated from `window.api.getAppInfo()` on mount
4. Implement store sync: `StoreSync_Subscribe`, `StoreSync_Push`, `StoreSync_Pull`, `StoreSync_OnUpdate`
5. Create `src/renderer/src/hooks/useIpcListener.ts`: generic hook for `ipcRenderer.on()` subscriptions with cleanup
6. Wire config change notifications: `configManager.subscribe()` → `webContents.send(StoreSync_Push)` → `useAppStore.setState()`
7. Add `App_Info` handler: return `AppInfo` object with version, platform, paths
8. Add `System_GetPlatformInfo`, `System_OpenExternal`, `System_OpenPath`, `System_ToggleDevTools` handlers
9. Write unit tests: Zustand store hydration, IPC listener cleanup
10. Write integration test: change config in main → verify renderer store updates via StoreSync_Push

**Artifacts**: `useAppStore.ts`, `useIpcListener.ts`, updated `ipc.ts`

**Exit criteria**: SC-005 (IPC response < 100ms for local ops), SC-009 (config changes durable). All IpcChannel enum members have handlers.

---

### Phase 5: US3 — Theme System

**Goal**: Dark/light/system theme switching with nativeTheme sync, title bar overlay updates, and renderer reactivity.

**Tasks**:
1. Implement `src/main/services/ThemeService.ts`: singleton with `setTheme(mode)`, `nativeTheme.on('updated')` listener, title bar overlay update loop
2. Define title bar overlay colors in `src/main/config.ts`: `titleBarOverlayDark` (`{ color: '#1e1e1e', symbolColor: '#cccccc' }`), `titleBarOverlayLight` (`{ color: '#ffffff', symbolColor: '#333333' }`)
3. Register `Theme_Set` IPC handler → calls `themeService.setTheme()`
4. On theme change: broadcast `Theme_Updated` to all windows with resolved theme (`'dark'` or `'light'`)
5. Create `src/renderer/src/stores/useThemeStore.ts`: Zustand store tracking `themeMode` and `resolvedTheme`
6. Listen for `Theme_Updated` in renderer → update `useThemeStore`
7. Configure TailwindCSS 4 dark mode: `@custom-variant dark (&:where(.dark, .dark *))` or media query based on `nativeTheme`
8. Update `TitleBar.tsx` to use theme-appropriate colors
9. Write unit test: `ThemeService` setTheme calls `nativeTheme.themeSource` and `configManager.set`
10. Write E2E test: switch theme via IPC → verify CSS class / background color change

**Artifacts**: `ThemeService.ts`, `useThemeStore.ts`, theme config

**Exit criteria**: SC-002 (theme switch visible < 100ms across all windows).

---

### Phase 6: US4 — Proxy Manager

**Goal**: Full proxy support with system/custom/none modes, bypass rules, and multi-layer network patching.

**Tasks**:
1. Implement `src/main/services/ProxyManager.ts` (adapted from Cherry Studio):
   - `configureProxy(config)`: entry point
   - `setSessionsProxy()`: `session.setProxy()` + `app.setProxy()`
   - `setEnvironment()`: set/clear `HTTP_PROXY`, `HTTPS_PROXY`, `SOCKS_PROXY`, `ALL_PROXY`, `no_proxy` env vars
   - `setGlobalFetchProxy()`: undici `setGlobalDispatcher()` with `SelectiveDispatcher` for bypass
   - `setGlobalHttpProxy()`: monkey-patch `http.get/request`, `https.get/request` with `ProxyAgent`
2. Implement bypass rule parser: support `<local>`, CIDR, IP, domain, wildcard, scheme/port filters
3. System proxy detection: `os-proxy-config` with 60-second polling interval
4. SOCKS support: `fetch-socks` `socksDispatcher` for SOCKS4/5
5. Register `Proxy_Set` IPC handler
6. Wire config: read `ProxyMode`, `ProxyUrl`, `ProxyBypassRules` from `configManager` on startup
7. Install dependencies: `os-proxy-config`, `fetch-socks`, `proxy-agent`, `undici`, `ipaddr.js`
8. Write unit tests: bypass rule parsing (CIDR, wildcard, domain, IP, local), `isByPass()` function
9. Write unit test: `ProxyManager.configureProxy()` with mocked session/http/undici
10. Write integration test: set proxy → verify env vars are set → clear proxy → verify env vars are cleared

**Artifacts**: `ProxyManager.ts`

**Exit criteria**: SC-003 (proxy changes take effect without restart). Bypass rules correctly match CIDR, domain, wildcard, IP, `<local>`.

---

### Phase 7: US5 — System Tray & Mini Window

**Goal**: System tray with context menu, mini window for quick assistant.

**Tasks**:
1. Implement `src/main/services/TrayService.ts`:
   - Create `Tray` with platform-appropriate icon (template image on macOS)
   - Build context menu: Show/Hide, Quick Assistant toggle, separator, Quit
   - Handle tray click: toggle main window visibility (or show quick assistant based on config)
   - Subscribe to `ConfigKeys.Tray` — create/destroy tray dynamically
2. Prepare tray icons: `resources/tray/iconTemplate.png` (macOS), `resources/tray/icon.png` (Windows/Linux), `@2x` variants
3. Implement `src/main/services/MiniWindowService.ts`:
   - `create()`: `BrowserWindow` at 550x400, `alwaysOnTop` optional, separate preload
   - `toggle()`: show/hide without destroying
   - `setPin(isPinned)`: `win.setAlwaysOnTop(isPinned)`
4. Register `MiniWindow_*` IPC handlers (Show, Hide, Close, Toggle, SetPin)
5. Register `Tray_SetEnabled`, `Tray_SetTrayOnClose` IPC handlers
6. Update preload API with `miniWindow.*` and tray methods
7. Handle close-to-tray: on main window `close` event, check `trayOnClose` config — if true, hide window instead of quitting
8. Write unit test: TrayService context menu construction, tray enable/disable
9. Write E2E test: verify tray icon appears, context menu has expected items

**Artifacts**: `TrayService.ts`, `MiniWindowService.ts`, tray icon resources

**Exit criteria**: SC-007 (tray functional on all platforms), SC-010 (mini window toggles < 200ms).

---

### Phase 8: US6 — Auto-Update

**Goal**: Update checking, download, and installation via electron-updater.

**Tasks**:
1. Implement `src/main/services/UpdateService.ts`:
   - Initialize `autoUpdater` with channel from config
   - `checkForUpdates()`: call `autoUpdater.checkForUpdates()`, return result
   - Listen to `update-available`, `download-progress`, `update-downloaded` events
   - Broadcast progress/status to renderer via IPC send channels
   - `quitAndInstall()`: trigger update installation
2. Register `Update_Check`, `Update_Download`, `Update_Install`, `Update_SetChannel` IPC handlers
3. Register `Update_Progress`, `Update_Available`, `Update_Downloaded` send channels
4. Configure `electron-builder.yml` (or `electron-vite` build config) with publish settings for GitHub Releases
5. Support channel switching: set `autoUpdater.channel` and `setFeedURL` for custom mirrors
6. Add update notification: when update available, push `AppNotification` via `NotificationService`
7. Write unit test: UpdateService with mocked `autoUpdater` — verify event routing
8. Add preload API: `checkForUpdate()`, `quitAndInstall()`

**Artifacts**: `UpdateService.ts`, build config updates

**Exit criteria**: Update check returns correct result for configured channel. Download progress events reach renderer.

---

### Phase 9: US7 — Deep Links & Global Shortcuts

**Goal**: `angdu-studio://` protocol handling and configurable global keyboard shortcuts.

**Tasks**:
1. Implement `src/main/services/ProtocolService.ts`:
   - Register `angdu-studio` as default protocol client: `app.setAsDefaultProtocolClient('angdu-studio')`
   - Handle `open-url` event (macOS) and `second-instance` args (Windows/Linux)
   - Parse URL: extract action and query params
   - Forward to renderer via `Protocol_OnReceive` send channel
2. Implement `src/main/services/ShortcutService.ts`:
   - `registerAll()`: read shortcuts from config, register global shortcuts via `globalShortcut.register()`
   - `update(shortcuts)`: unregister all, register new set, persist to config
   - `unregisterAll()`: cleanup on quit
   - Handle accelerator conflicts gracefully (log warning, skip registration)
3. Register `Shortcut_Update`, `Shortcut_GetAll` IPC handlers
4. Register `Protocol_HandleUrl`, `Protocol_OnReceive` channels
5. Add preload API: `shortcuts.update()`, `shortcuts.getAll()`, `protocol.onReceiveData()`
6. Add zoom shortcuts: wire `Ctrl+= / Ctrl+- / Ctrl+0` to `Zoom_HandleFactor` handler
7. Write unit test: URL parsing for various deep link formats
8. Write unit test: ShortcutService register/unregister/update flow
9. Write E2E test: trigger protocol URL → verify renderer receives parsed data

**Artifacts**: `ProtocolService.ts`, `ShortcutService.ts`

**Exit criteria**: Deep links activate the app and route to renderer. Global shortcuts trigger actions even when app is unfocused. Shortcut rebinding takes effect immediately.

---

### Phase 10: US8 — Graceful Shutdown & Crash Reporter

**Goal**: Clean service teardown on quit, local crash report collection.

**Tasks**:
1. Implement graceful shutdown in `src/main/index.ts`:
   - `app.on('before-quit')`: set shutdown flag
   - `app.on('will-quit')`: run cleanup sequence with 5-second timeout
   - Cleanup order: shortcuts → tray → mini window → proxy reset → system proxy monitor → update service
   - Log each cleanup step
2. Implement crash reporter:
   - `webContents.on('render-process-gone')`: capture crash reason, write report to `{userData}/crash-reports/`
   - `process.on('uncaughtException')`: write stack trace to crash report file
   - `process.on('unhandledRejection')`: log and write to crash report file
   - Report format: JSON with timestamp, stack trace, app version, platform
3. Register `App_Quit`, `App_Reload`, `App_Relaunch`, `App_SetStopQuit` IPC handlers
4. Implement quit prevention: `App_SetStopQuit(true, reason)` blocks quit (e.g. during data export), `App_SetStopQuit(false)` releases
5. Register `Crash_MockRenderer` handler (dev-only): deliberately crash renderer for testing
6. Write unit test: shutdown sequence order verification
7. Write unit test: crash report file generation with correct format
8. Write E2E test: quit app → verify all services cleaned up within 5 seconds

**Artifacts**: Updated `index.ts`, crash report utilities

**Exit criteria**: SC-008 (quit completes cleanup < 5s). Crash reports are written to disk with JS call stack.

---

### Phase 11: Notification Service

**Goal**: Cross-feature notification system — main process events pushed to renderer as in-app toasts.

**Tasks**:
1. Implement `src/main/services/NotificationService.ts`:
   - `show(notification)`: assign ID, broadcast to all windows via `Notification_Show`
   - `dismiss(id)`: broadcast dismiss to all windows
   - `handleAction(id, action)`: route action back to originating service
   - Optional: system-level `Notification` for critical alerts (e.g. update downloaded)
2. Register `Notification_Send`, `Notification_Dismiss`, `Notification_OnAction` IPC handlers
3. Create `src/renderer/src/stores/useNotificationStore.ts`: queue of active notifications, auto-dismiss timer
4. Create `src/renderer/src/components/NotificationCenter.tsx`: toast stack in bottom-right corner
5. Update preload API: `notification.send()`, `notification.dismiss()`
6. Wire existing services to use notifications: UpdateService (update available), ProxyManager (proxy error)
7. Write unit test: NotificationService show/dismiss/action routing
8. Write unit test: useNotificationStore queue management, auto-dismiss

**Artifacts**: `NotificationService.ts`, `useNotificationStore.ts`, `NotificationCenter.tsx`

**Exit criteria**: Notifications from main process appear as toasts in renderer. Auto-dismiss works. Action buttons route back to main.

---

### Phase 12: Polish — i18n, macOS Menu, Edge Cases

**Goal**: Production polish — internationalization, macOS application menu, edge case handling.

**Tasks**:
1. Set up i18n framework in renderer:
   - Create `src/renderer/src/i18n/index.ts` with `i18next` + `react-i18next`
   - Create `ko.json` (Korean, default) with all user-facing strings for F001
   - Create `en.json` (English) with translations
   - Default language from `configManager.getLanguage()` (falls back to `'ko'`)
2. Implement `src/main/services/AppMenuService.ts`:
   - macOS-only application menu with standard entries: App (About, Quit), Edit (Undo, Redo, Cut, Copy, Paste, Select All), View (Reload, Toggle DevTools, Zoom), Window (Minimize, Close)
   - Set via `Menu.setApplicationMenu()` on macOS, skip on Windows/Linux (custom title bar handles it)
3. Handle edge cases:
   - Config corruption: wrap `electron-store` constructor with try/catch, reset to defaults on parse error, notify user
   - Window off-screen: `electron-window-state` handles this, but add fallback — if restored position is outside all displays, center on primary
   - Invalid proxy URL: catch in `ProxyManager.configureProxy()`, fall back to direct, push error notification
   - Simultaneous deep links: queue in `ProtocolService`, process sequentially
   - Auto-update download interrupted: `electron-updater` handles retry internally; add notification on failure
4. Add `App_SetLanguage` IPC handler: update `configManager`, set `i18next.changeLanguage()`
5. Write unit tests for edge case handlers
6. Final pass: verify all 19 FRs are covered, all 10 SCs are measurable

**Artifacts**: i18n setup, `AppMenuService.ts`, edge case handling code

**Exit criteria**: All 19 FRs (FR-001 through FR-019) pass verification. All 10 SCs (SC-001 through SC-010) are met. App launches with Korean UI by default.

---

## Phase Dependency Graph

```
Phase 1 (Scaffold)
    └── Phase 2 (Foundation: IPC, Config, Preload)
            ├── Phase 3 (US1: Window Management)
            │       └── Phase 4 (US2: Full IPC, Zustand Sync)
            │               ├── Phase 5 (US3: Theme)
            │               ├── Phase 6 (US4: Proxy)
            │               ├── Phase 7 (US5: Tray & Mini Window)
            │               ├── Phase 8 (US6: Auto-Update)
            │               ├── Phase 9 (US7: Deep Links & Shortcuts)
            │               └── Phase 10 (US8: Lifecycle & Crash)
            │
            └── Phase 11 (Notifications) ← depends on Phase 4
                    └── Phase 12 (Polish: i18n, Menu, Edge Cases) ← depends on all above
```

Phases 5–10 can be implemented in parallel after Phase 4. Phase 11 depends on Phase 4 (needs IPC and stores). Phase 12 is the final integration phase.

## Complexity Tracking

No constitution violations. All services are singletons (no DI container). No additional projects beyond the electron-vite standard layout. All patterns follow Cherry Studio conventions adapted for Zustand.
