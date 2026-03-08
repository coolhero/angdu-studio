# Tasks: F001-app-core

**Feature**: Electron shell — window management, IPC bridge, config store, theme, proxy, auto-update, tray, shortcuts, deep links, notifications, crash reporting
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)
**Date**: 2026-03-08

---

## Phase 1: Project Scaffold & Build Config

**Checkpoint**: `pnpm dev` opens a blank Electron window; `pnpm build` produces a runnable binary.

- [ ] T001 [P1] Initialize electron-vite project structure with `src/main/index.ts`, `src/preload/index.ts`, `src/renderer/src/main.tsx`, `src/renderer/src/App.tsx`
- [ ] T002 [P1] Configure `electron.vite.config.ts` with SWC for main/preload, Vite + React SWC plugin for renderer
- [ ] T003 [P1] Configure TypeScript: `tsconfig.json` (base), `tsconfig.main.json`, `tsconfig.preload.json`, `tsconfig.renderer.json` with path aliases (`@main/*`, `@shared/*`, `@renderer/*`)
- [ ] T004 [P1] Install core deps (`electron`, `react`, `react-dom`, `zustand`, `electron-store`, `electron-window-state`, `electron-updater`) and dev deps (`electron-vite`, `@vitejs/plugin-react-swc`, `vitest`, `@playwright/test`, `typescript`, `tailwindcss@4`, `@tailwindcss/vite`)
- [ ] T005 [P1] Configure `package.json` scripts: `dev`, `build`, `test`, `test:e2e`, `test:coverage`
- [ ] T006 [P1] Add `.gitignore` entries for `dist/`, `out/`, `node_modules/`, `*.log`
- [ ] T007 [P1] Verify scaffold: `pnpm dev` launches empty Electron window, `pnpm build` produces binary

---

## Phase 2: Foundation — IPC Bridge, Preload, Config Store, Data Dir

**Checkpoint**: `window.api.config.get('theme')` returns default; `window.api.config.set('theme', 'dark')` persists; all IPC channels respond without "no handler" errors.

- [ ] T008 [P1] Create `src/shared/ipc-channels.ts` with full `IpcChannel` enum (all F001 channels from contracts)
- [ ] T009 [P1] [P] Create `src/shared/types.ts` with `ThemeMode`, `ProxyMode`, `ProxyConfig`, `AppInfo`, `PlatformInfo`, `AppNotification`, `NotificationAction`, `ShortcutBinding`, `UpdateChannel`, `UpdateCheckResult`
- [ ] T010 [P1] [P] Create `src/shared/constants.ts` with `MIN_WINDOW_WIDTH`, `MIN_WINDOW_HEIGHT`, `DEFAULT_SHORTCUTS`
- [ ] T011 [P1] [US2] Implement `src/main/services/ConfigManager.ts`: electron-store wrapper with `get<T>()`, `set()`, `subscribe()`, `ConfigKeys` enum, typed `AppConfigSchema` defaults
- [ ] T012 [P1] [US2] Create `src/preload/index.ts`: `contextBridge.exposeInMainWorld('api', ...)` with initial `getAppInfo()`, `config.get()`, `config.set()`
- [ ] T013 [P1] [US2] Create `src/preload/preload.d.ts`: type declarations for `window.api`
- [ ] T014 [P1] [US2] Create `src/main/ipc.ts`: central registration function calling `ipcMain.handle()` for each IpcChannel
- [ ] T015 [P1] Initialize app data directory on first launch: create `crash-reports/`, `logs/`, `files/` under `app.getPath('userData')`
- [ ] T016 [P1] Write unit tests for `ConfigManager` (get/set/subscribe/defaults/corruption recovery) in `tests/unit/main/config-manager.test.ts`
- [ ] T017 [P1] Write IPC contract test: verify all `IpcChannel` enum values have registered handlers in `tests/integration/ipc-bridge.test.ts`

---

## Phase 3: US1 — Window Management

**Checkpoint**: SC-001 (window interactive < 3s), SC-004 (second instance focuses < 500ms), SC-006 (position persists across restarts).

- [ ] T018 [P1] [US1] Implement `src/main/services/WindowService.ts`: `createMainWindow()` with `electron-window-state` for position/size persistence
- [ ] T019 [P1] [US1] Configure platform chrome in `src/main/config.ts`: macOS `titleBarStyle: 'hiddenInset'` with `trafficLightPosition`, Windows/Linux `frame: false` with `titleBarOverlay`
- [ ] T020 [P1] [US1] Enforce minimum window size (`minWidth: 1080`, `minHeight: 600`) and default centered position
- [ ] T021 [P1] [US1] Implement single-instance lock via `app.requestSingleInstanceLock()`, focus existing window on `second-instance`
- [ ] T022 [P1] [US1] Register window control IPC handlers: `Window_Minimize`, `Window_Maximize`, `Window_Unmaximize`, `Window_Close`, `Window_IsMaximized`, `Window_SetFullScreen`, `Window_IsFullScreen`, `Window_GetSize`, `Window_SetMinimumSize`, `Window_ResetMinimumSize`
- [ ] T023 [P1] [US1] Emit `Window_MaximizedChanged` on maximize/unmaximize events to renderer
- [ ] T024 [P1] [US1] Create `src/renderer/src/components/TitleBar.tsx`: custom title bar with minimize/maximize/close buttons (Windows/Linux only)
- [ ] T025 [P1] [US1] Add preload API: `windowControls.minimize()`, `.maximize()`, `.unmaximize()`, `.close()`, `.isMaximized()`, `.onMaximizedChange()`
- [ ] T026 [P1] [US1] Write E2E test: launch -> verify dimensions -> resize -> quit -> relaunch -> verify restored dimensions in `tests/e2e/window-management.spec.ts`
- [ ] T027 [P1] [US1] Write E2E test: launch second instance -> verify first instance window focused in `tests/e2e/window-management.spec.ts`

---

## Phase 4: US2 — Full IPC Registration & Config CRUD & Zustand Store Sync

**Checkpoint**: SC-005 (IPC < 100ms for local ops), SC-009 (config durable). All IpcChannel enum members have handlers.

- [ ] T028 [P1] [US2] Register all remaining IPC handlers in `src/main/ipc.ts` (stub handlers for unimplemented services)
- [ ] T029 [P1] [US2] Implement `Config_Get` and `Config_Set` handlers wired to `ConfigManager`
- [ ] T030 [P1] [US2] Create `src/renderer/src/stores/useAppStore.ts`: Zustand store with `appInfo`, `platform`, hydrated from `window.api.getAppInfo()` on mount
- [ ] T031 [P1] [US2] Implement store sync channels: `StoreSync_Subscribe`, `StoreSync_Push`, `StoreSync_Pull`, `StoreSync_OnUpdate` in main process
- [ ] T032 [P1] [US2] Create `src/renderer/src/hooks/useIpcListener.ts`: generic hook for `ipcRenderer.on()` subscriptions with cleanup
- [ ] T033 [P1] [US2] Wire config change notifications: `configManager.subscribe()` -> `webContents.send(StoreSync_Push)` -> `useAppStore.setState()`
- [ ] T034 [P1] [US2] Add `App_Info`, `App_GetVersion`, `App_GetPlatform`, `App_GetDataPath` handlers returning app metadata
- [ ] T035 [P1] [US2] [P] Add `System_GetPlatformInfo`, `System_OpenExternal`, `System_OpenPath`, `System_ToggleDevTools` handlers
- [ ] T036 [P1] [US2] Write unit tests for Zustand store hydration and IPC listener cleanup in `tests/unit/renderer/useAppStore.test.ts`
- [ ] T037 [P1] [US2] Write integration test: change config in main -> verify renderer store update via StoreSync_Push in `tests/integration/ipc-bridge.test.ts`

---

## Phase 5: US3 — Theme System

**Checkpoint**: SC-002 (theme switch visible < 100ms across all windows).

- [ ] T038 [P1] [US3] Implement `src/main/services/ThemeService.ts`: `setTheme(mode)`, `nativeTheme.on('updated')` listener, title bar overlay update loop
- [ ] T039 [P1] [US3] Define title bar overlay color maps in `src/main/config.ts`: dark (`#1e1e1e`/`#cccccc`) and light (`#ffffff`/`#333333`)
- [ ] T040 [P1] [US3] Register `Theme_Set` IPC handler -> calls `themeService.setTheme()`, broadcast `Theme_Updated` to all windows
- [ ] T041 [P1] [US3] Create `src/renderer/src/stores/useThemeStore.ts`: Zustand store tracking `themeMode` and `resolvedTheme`
- [ ] T042 [P1] [US3] Listen for `Theme_Updated` in renderer -> update `useThemeStore` and toggle `.dark` CSS class on `<html>`
- [ ] T043 [P1] [US3] Configure TailwindCSS 4 dark mode: `@custom-variant dark (&:where(.dark, .dark *))` in renderer CSS
- [ ] T044 [P1] [US3] Update `TitleBar.tsx` to use theme-appropriate text and background colors
- [ ] T045 [P1] [US3] Write unit test for `ThemeService`: setTheme sets `nativeTheme.themeSource` and calls `configManager.set` in `tests/unit/main/theme-service.test.ts`
- [ ] T046 [P1] [US3] Write E2E test: switch theme via IPC -> verify CSS class / background color change in `tests/e2e/theme-switching.spec.ts`

---

## Phase 6: US4 — Proxy Manager

**Checkpoint**: SC-003 (proxy changes take effect without restart). Bypass rules match CIDR, domain, wildcard, IP, `<local>`.

- [ ] T047 [P2] [US4] [P] Implement `src/main/services/ProxyManager.ts` with `configureProxy()`, `setSessionsProxy()`, `setEnvironment()`, `setGlobalFetchProxy()`, `setGlobalHttpProxy()`
- [ ] T048 [P2] [US4] [P] Implement bypass rule parser: support `<local>`, CIDR, IP, domain, wildcard, scheme/port filters with `isByPass()` function
- [ ] T049 [P2] [US4] Implement system proxy detection via `os-proxy-config` with 60-second polling interval
- [ ] T050 [P2] [US4] Add SOCKS support via `fetch-socks` `socksDispatcher` for SOCKS4/5 protocols
- [ ] T051 [P2] [US4] Register `Proxy_Set` IPC handler, wire config read for `ProxyMode`/`ProxyUrl`/`ProxyBypassRules` on startup
- [ ] T052 [P2] [US4] Install proxy deps: `os-proxy-config`, `fetch-socks`, `proxy-agent`, `undici`, `ipaddr.js`
- [ ] T053 [P2] [US4] Write unit tests for bypass rule parsing (CIDR, wildcard, domain, IP, local) in `tests/unit/main/proxy-manager.test.ts`
- [ ] T054 [P2] [US4] Write integration test: set proxy -> verify env vars set -> clear proxy -> verify env vars cleared

---

## Phase 7: US5 — System Tray & Mini Window

**Checkpoint**: SC-007 (tray functional on all platforms), SC-010 (mini window toggles < 200ms).

- [ ] T055 [P2] [US5] [P] Implement `src/main/services/TrayService.ts`: create `Tray` with platform-appropriate icon (template image on macOS), context menu (Show/Hide, Quick Assistant, Quit)
- [ ] T056 [P2] [US5] [P] Prepare tray icon resources: `resources/tray/iconTemplate.png`, `resources/tray/icon.png`, `@2x` variants
- [ ] T057 [P2] [US5] [P] Implement `src/main/services/MiniWindowService.ts`: `create()` at 550x400, `toggle()`, `setPin(isPinned)` with `alwaysOnTop`
- [ ] T058 [P2] [US5] Register `MiniWindow_Show`, `MiniWindow_Hide`, `MiniWindow_Close`, `MiniWindow_Toggle`, `MiniWindow_SetPin` IPC handlers
- [ ] T059 [P2] [US5] Register `Tray_SetEnabled`, `Tray_SetTrayOnClose` IPC handlers; subscribe to `ConfigKeys.Tray` for dynamic tray create/destroy
- [ ] T060 [P2] [US5] Handle close-to-tray: on main window `close` event, check `trayOnClose` config — if true, hide instead of quit
- [ ] T061 [P2] [US5] Update preload API with `miniWindow.*` and tray methods
- [ ] T062 [P2] [US5] Write unit test for TrayService context menu construction and enable/disable in `tests/unit/main/tray-service.test.ts`
- [ ] T063 [P2] [US5] Write E2E test: verify tray icon appears with expected context menu items in `tests/e2e/tray.spec.ts`
- [ ] T063b [P2] [US5] Write E2E test: toggle mini window, measure toggle latency < 200ms (SC-010) in `tests/e2e/mini-window.spec.ts`

---

## Phase 8: US6 — Auto-Update

**Checkpoint**: Update check returns correct result for configured channel. Download progress events reach renderer.

- [ ] T064 [P2] [US6] [P] Implement `src/main/services/UpdateService.ts`: initialize `autoUpdater`, `checkForUpdates()`, listen to `update-available`/`download-progress`/`update-downloaded`, `quitAndInstall()`
- [ ] T065 [P2] [US6] Register `Update_Check`, `Update_Download`, `Update_Install`, `Update_SetChannel` IPC handlers
- [ ] T066 [P2] [US6] Register `Update_Progress`, `Update_Available`, `Update_Downloaded` send channels to broadcast to renderer
- [ ] T067 [P2] [US6] Support channel switching: set `autoUpdater.channel` and `setFeedURL` for custom mirrors
- [ ] T068 [P2] [US6] Configure `electron-builder.yml` with publish settings for GitHub Releases
- [ ] T069 [P2] [US6] Add preload API: `checkForUpdate()`, `quitAndInstall()`
- [ ] T070 [P2] [US6] Write unit test for UpdateService with mocked `autoUpdater` — verify event routing in `tests/unit/main/update-service.test.ts`

---

## Phase 9: US7 — Deep Links & Global Shortcuts

**Checkpoint**: Deep links activate app and route to renderer. Global shortcuts trigger when app is unfocused. Rebinding takes effect immediately.

- [ ] T071 [P2] [US7] [P] Implement `src/main/services/ProtocolService.ts`: register `angdu-studio` protocol via `app.setAsDefaultProtocolClient()`, handle `open-url` (macOS) and `second-instance` args (Windows/Linux), parse URL, forward via `Protocol_OnReceive`
- [ ] T072 [P2] [US7] [P] Implement `src/main/services/ShortcutService.ts`: `registerAll()`, `update(shortcuts)`, `unregisterAll()` via `globalShortcut`, handle accelerator conflicts gracefully
- [ ] T073 [P2] [US7] Register `Shortcut_Update`, `Shortcut_GetAll`, `Protocol_HandleUrl`, `Protocol_OnReceive` IPC channels
- [ ] T074 [P2] [US7] Add preload API: `shortcuts.update()`, `shortcuts.getAll()`, `protocol.onReceiveData()`
- [ ] T075 [P2] [US7] Wire zoom shortcuts: `Ctrl+=/Ctrl+-/Ctrl+0` to `Zoom_HandleFactor` handler with `configManager` persistence
- [ ] T076 [P2] [US7] Write unit test for URL parsing (various deep link formats) in `tests/unit/main/protocol-service.test.ts`
- [ ] T077 [P2] [US7] Write unit test for ShortcutService register/unregister/update flow in `tests/unit/main/shortcut-service.test.ts`
- [ ] T077b [P2] [US7] Write E2E test: trigger `angdu-studio://` protocol URL, verify renderer receives parsed data in `tests/e2e/protocol.spec.ts`

---

## Phase 10: US8 — Graceful Shutdown & Crash Reporter

**Checkpoint**: SC-008 (quit completes cleanup < 5s). Crash reports written to disk with JS call stack.

- [ ] T078 [P1] [US8] Implement graceful shutdown in `src/main/index.ts`: `before-quit` flag, `will-quit` cleanup sequence (shortcuts -> tray -> mini window -> proxy -> update) with 5s timeout
- [ ] T079 [P1] [US8] Implement crash reporter: `webContents.on('render-process-gone')`, `process.on('uncaughtException')`, `process.on('unhandledRejection')` — write JSON reports to `{userData}/crash-reports/`
- [ ] T080 [P1] [US8] Register `App_Quit`, `App_Reload`, `App_Relaunch`, `App_SetStopQuit` IPC handlers
- [ ] T081 [P1] [US8] Implement quit prevention: `App_SetStopQuit(true, reason)` blocks quit, `App_SetStopQuit(false)` releases
- [ ] T082 [P1] [US8] Register `Crash_MockRenderer` handler (dev-only): deliberately crash renderer for testing
- [ ] T083 [P1] [US8] Write unit test for shutdown sequence order verification in `tests/unit/main/lifecycle.test.ts`
- [ ] T084 [P1] [US8] Write unit test for crash report file generation with correct JSON format in `tests/unit/main/crash-reporter.test.ts`
- [ ] T084b [P1] [US8] Write E2E test: quit app with active services, measure total cleanup time < 5s (SC-008) in `tests/e2e/lifecycle.spec.ts`

---

## Phase 11: Notification Service

**Checkpoint**: Notifications from main process appear as toasts in renderer. Auto-dismiss works. Action buttons route back to main.

- [ ] T085 [P1] [P] Implement `src/main/services/NotificationService.ts`: `show(notification)`, `dismiss(id)`, `handleAction(id, action)`, broadcast `Notification_Show` to all windows
- [ ] T086 [P1] Register `Notification_Send`, `Notification_Dismiss`, `Notification_OnAction` IPC handlers
- [ ] T087 [P1] [P] Create `src/renderer/src/stores/useNotificationStore.ts`: queue of active notifications with auto-dismiss timer
- [ ] T088 [P1] [P] Create `src/renderer/src/components/NotificationCenter.tsx`: toast stack in bottom-right corner
- [ ] T089 [P1] Update preload API: `notification.send()`, `notification.dismiss()`
- [ ] T090 [P1] Wire existing services to use notifications: UpdateService (update available), ProxyManager (proxy error)
- [ ] T091 [P1] Write unit test for NotificationService show/dismiss/action routing in `tests/unit/main/notification-service.test.ts`
- [ ] T092 [P1] Write unit test for useNotificationStore queue management and auto-dismiss in `tests/unit/renderer/useNotificationStore.test.ts`

---

## Phase 12: Polish — i18n, macOS Menu, Edge Cases, Demo Script

**Checkpoint**: All 19 FRs (FR-001–FR-019) pass verification. All 10 SCs (SC-001–SC-010) met. App launches with Korean UI. Demo script runs end-to-end.

- [ ] T093 [P1] Set up i18n: create `src/renderer/src/i18n/index.ts` with `i18next` + `react-i18next`, default language from config (fallback `'ko'`)
- [ ] T094 [P1] [P] Create `src/renderer/src/i18n/ko.json` with all F001 user-facing strings in Korean
- [ ] T095 [P1] [P] Create `src/renderer/src/i18n/en.json` with all F001 user-facing strings in English
- [ ] T096 [P1] Add `App_SetLanguage` IPC handler: update `configManager`, call `i18next.changeLanguage()`
- [ ] T097 [P1] Implement `src/main/services/AppMenuService.ts`: macOS application menu with App/Edit/View/Window entries via `Menu.setApplicationMenu()`
- [ ] T098 [P1] Handle edge case: config corruption — wrap `electron-store` constructor with try/catch, reset to defaults on parse error, notify user
- [ ] T099 [P1] Handle edge case: window off-screen — if restored position is outside all displays, center on primary monitor
- [ ] T100 [P1] Handle edge case: invalid proxy URL — catch in `ProxyManager.configureProxy()`, fall back to direct, push error notification
- [ ] T101 [P1] Handle edge case: simultaneous deep links — queue in `ProtocolService`, process sequentially
- [ ] T102 [P1] Write unit tests for edge case handlers (config corruption, off-screen, invalid proxy, deep link queue)
- [ ] T103 [P1] Create demo data fixture: sample config with theme/proxy/shortcuts pre-configured in `demos/fixtures/f001-config.json`
- [ ] T104 [P1] Create demo script `demos/F001-app-core.sh`: launch app, verify window, cycle themes, toggle tray, exercise window controls, test config persistence
- [ ] T105 [P1] Final verification pass: confirm all 19 FRs covered, all 10 SCs measurable, all IpcChannel handlers registered

---

## Summary

| Phase | Tasks | Priority | Stories |
|-------|-------|----------|---------|
| 1. Scaffold | T001–T007 | P1 | — |
| 2. Foundation | T008–T017 | P1 | US2 |
| 3. Window Mgmt | T018–T027 | P1 | US1 |
| 4. IPC + Zustand | T028–T037 | P1 | US2 |
| 5. Theme | T038–T046 | P1 | US3 |
| 6. Proxy | T047–T054 | P2 | US4 |
| 7. Tray + Mini | T055–T063 | P2 | US5 |
| 8. Auto-Update | T064–T070 | P2 | US6 |
| 9. Deep Links | T071–T077 | P2 | US7 |
| 10. Lifecycle | T078–T084 | P1 | US8 |
| 11. Notifications | T085–T092 | P1 | — |
| 12. Polish + Demo | T093–T105 | P1 | — |
| **Total** | **108 tasks** | | |

**Parallelizable phases**: Phases 5–10 can run in parallel after Phase 4. Tasks marked `[P]` within a phase can run in parallel with each other.

**Dependency graph**:
```
Phase 1 -> Phase 2 -> Phase 3 -> Phase 4
                                    |-> Phase 5 (Theme)     \
                                    |-> Phase 6 (Proxy)      |
                                    |-> Phase 7 (Tray)       |-> Phase 12 (Polish + Demo)
                                    |-> Phase 8 (Update)     |
                                    |-> Phase 9 (Deep Links) |
                                    |-> Phase 10 (Lifecycle) /
                                    |-> Phase 11 (Notifications) ---^
```
