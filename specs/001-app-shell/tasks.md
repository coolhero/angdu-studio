# Tasks: App Shell

**Input**: Design documents from `/specs/001-app-shell/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/, research.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize electron-vite project, configure build pipeline, install dependencies

- [ ] T001 Initialize electron-vite project with pnpm: `pnpm create @electron-vite angdu-studio --template react-ts`. Configure electron.vite.config.ts with path aliases (@main/, @renderer/, @shared/, @preload/)
- [ ] T002 Configure TypeScript strict mode in tsconfig.json with path aliases matching electron.vite.config.ts. Create tsconfig.node.json (main + preload) and tsconfig.web.json (renderer)
- [ ] T003 [P] Install and configure Tailwind CSS 4 in renderer: tailwind.config.ts, postcss.config.js, global CSS import. Add shadcn/ui init (`npx shadcn@latest init`)
- [ ] T004 [P] Install core dependencies: better-sqlite3, electron-updater, electron-log, zod, zustand. Install devDependencies: @playwright/test, vitest, @types/better-sqlite3
- [ ] T005 [P] Configure Vitest in vitest.config.ts with path aliases. Configure Playwright in playwright.config.ts with `_electron.launch()` setup. Add test scripts to package.json
- [ ] T006 Create shared types directory structure: src/shared/types/ipc.ts, src/shared/types/config.ts, src/shared/types/window.ts (empty files with TODO comments)
- [ ] T007 Verify build pipeline: `pnpm dev` launches a blank Electron window, `pnpm build` produces distributable output

**Checkpoint**: Project scaffold complete — electron-vite builds and launches successfully

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared type definitions and IPC infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 Define IPC channel type map in src/shared/types/ipc.ts: InvokeChannelMap (25 channels with request/response types), EventChannelMap (8 channels with payload types). Use TypeScript mapped types for compile-time safety
- [ ] T009 [P] Define AppConfig type, ConfigKey enum, typed defaults object, and Zod validation schemas in src/shared/types/config.ts per data-model.md AppConfig spec (7 typed keys: theme, language, proxyUrl, autoUpdate, updateInterval, globalShortcut, schemaVersion)
- [ ] T010 [P] Define WindowState type in src/shared/types/window.ts per data-model.md WindowState spec (id, x, y, width, height, isMaximized, displayId)
- [ ] T011 Implement preload bridge in src/preload/index.ts: contextBridge.exposeInMainWorld('api', {...}) with typed wrappers for all 25 invoke channels (ipcRenderer.invoke) and 8 event channels (ipcRenderer.on). Define channel name constants in src/preload/channels.ts
- [ ] T012 Implement IPC handler registration framework in src/main/ipc/index.ts: registerAllHandlers() function that registers all ipcMain.handle() and webContents.send() channels with Zod validation at each handler entry point

**Checkpoint**: Foundation ready — IPC types compile, preload bridge exposes API, handler framework registers channels

---

## Phase 3: User Story 1 - Application Launch and Window Management (Priority: P1) 🎯 MVP

**Goal**: User launches app → frameless window opens at 960×600 → window state persists across restarts → single instance enforced

**Independent Test**: Launch app, verify window appears in <2s. Resize, restart, verify state restored. Launch second instance, verify first window focused.

### Implementation for User Story 1

- [ ] T013 [US1] Implement ConfigService singleton in src/main/services/ConfigService.ts: initialize better-sqlite3 database in app.getPath('userData')/config.db, create config and window_state tables, implement get/set/reset/getAll methods with Zod validation, implement typed defaults fallback, implement corruption detection (try-catch on db open → delete and recreate with defaults + log warning)
- [ ] T014 [US1] Implement config schema migration in ConfigService: read schemaVersion from config, run sequential migration functions if version < current, reset to defaults on migration failure
- [ ] T015 [US1] Implement WindowService singleton in src/main/services/WindowService.ts: createMainWindow() with frameless BrowserWindow (960×600 default, platform-aware frame: macOS hiddenInset, Windows/Linux frame:false), load renderer URL, persist window state (position, size, maximized) on move/resize/maximize events to ConfigService, restore state on create with offscreen detection (reset to primary display center if saved display disconnected)
- [ ] T016 [US1] Implement app lifecycle in src/main/index.ts: app.requestSingleInstanceLock() → quit if not acquired, app.on('second-instance') → focus existing window and forward args, app.on('ready') → bootstrap services, app.on('before-quit') → persist state and cleanup, app.on('activate') → show/recreate window (macOS)
- [ ] T017 [US1] Implement bootstrap sequence in src/main/bootstrap.ts: sequential init of LoggerService → ConfigService → WindowService (order matters — config before window). Export initializeServices() called from index.ts app.on('ready')
- [ ] T018 [US1] Implement window IPC handlers in src/main/ipc/window.ts: handle window:minimize, window:maximize (toggle), window:close (hide to tray, not quit), window:setSize. Emit window:state-changed event (debounced 300ms) on move/resize
- [ ] T019 [US1] Implement config IPC handlers in src/main/ipc/config.ts: handle config:get (returns typed value or default), config:set (validates with Zod then persists), config:reset (reset all to defaults), config:getAll (returns full AppConfig object)

**Checkpoint**: User Story 1 complete — app launches with frameless window, state persists, single-instance works

---

## Phase 4: User Story 2 - IPC Bridge and Cross-Process Communication (Priority: P1)

**Goal**: Typed IPC bridge fully operational — renderer can invoke any channel and receive events

**Independent Test**: Call config:get from renderer, verify response <10ms. Emit theme:changed from main, verify renderer receives it.

### Implementation for User Story 2

- [ ] T020 [US2] Implement theme IPC handlers in src/main/ipc/theme.ts: handle theme:get (resolve 'system' to actual via nativeTheme.shouldUseDarkColors), theme:set (persist preference via ConfigService, emit theme:changed to renderer). Listen to nativeTheme.on('updated') → re-emit theme:changed
- [ ] T021 [US2] Implement app IPC handlers in src/main/ipc/app.ts: handle app:getVersion (app.getVersion()), app:getPlatform (process.platform), app:getPath (app.getPath with whitelist), app:relaunch (app.relaunch()), app:quit (app.quit())
- [ ] T022 [US2] Wire window:focus and window:blur events in WindowService: listen to BrowserWindow 'focus'/'blur' events → send IPC events to renderer

**Checkpoint**: IPC bridge fully operational — invoke round-trip verified, event delivery verified

---

## Phase 5: User Story 3 - Configuration Persistence (Priority: P1)

**Goal**: Config values persist via better-sqlite3, survive corruption, migrate on upgrade

**Independent Test**: Set config value via IPC, restart app, verify value preserved. Corrupt DB file, verify defaults restored.

### Implementation for User Story 3

- [ ] T023 [US3] Implement LoggerService singleton in src/main/services/LoggerService.ts: configure electron-log with file transport, set log path to app.getPath('logs'), configure rotation (10MB max, keep 5 files), expose log.info/warn/error methods. Initialize in bootstrap before ConfigService
- [ ] T024 [US3] Wire ConfigService corruption recovery: on database open failure, log.warn with details, delete corrupted file, recreate with defaults. Verify config:getAll returns defaults after corruption

**Checkpoint**: Configuration persistence complete — CRUD works, corruption recovers, migration handles schema upgrades

---

## Phase 6: User Story 4 - System Tray Integration (Priority: P2)

**Goal**: Window close → hide to tray, tray icon toggles visibility, tray quit exits app

**Independent Test**: Click close → window hides, tray visible. Click tray → window shows. Tray quit → app exits.

### Implementation for User Story 4

- [ ] T025 [US4] Implement TrayService singleton in src/main/services/TrayService.ts: create Tray with app icon from resources/, build context menu (Show/Hide Window, Quit), handle tray click → toggle window visibility via WindowService, handle quit menu → app.quit(). Use platform-appropriate icon (template icon for macOS)
- [ ] T026 [US4] Update WindowService close behavior: on BrowserWindow 'close' event, preventDefault() and hide window instead of destroying (unless app.isQuitting flag is set). Set app.isQuitting=true in before-quit handler
- [ ] T027 [US4] Add TrayService to bootstrap sequence in src/main/bootstrap.ts (after WindowService)

**Checkpoint**: System tray complete — close hides to tray, tray toggles, quit exits

---

## Phase 7: User Story 5 - Auto-Update (Priority: P2)

**Goal**: Check for updates on startup, download in background, notify renderer of progress

**Independent Test**: Simulate update available, verify renderer receives update:available and update:progress events.

### Implementation for User Story 5

- [ ] T028 [US5] Implement UpdateService singleton in src/main/services/UpdateService.ts: configure electron-updater with autoDownload:true, check for updates on init and at configurable interval (from ConfigService updateInterval), emit update:available/progress/ready events to renderer via webContents.send(). Handle download errors gracefully (log warning, retry on next cycle)
- [ ] T029 [US5] Add UpdateService to bootstrap sequence in src/main/bootstrap.ts (after WindowService, so webContents is available for event emission)

**Checkpoint**: Auto-update complete — checks, downloads, notifies renderer

---

## Phase 8: User Story 6 - Utility IPC Services (Priority: P2)

**Goal**: File, shell, dialog, clipboard IPC handlers operational

**Independent Test**: Call shell:openExternal with URL → browser opens. Call clipboard:write/read → text round-trips.

### Implementation for User Story 6

- [ ] T030 [P] [US6] Implement file IPC handlers in src/main/ipc/file.ts: handle file:read (read file at relativePath resolved against app.getPath('userData')), file:write (write Buffer to resolved path), file:delete (unlink resolved path). Validate all paths resolve within userData directory (prevent path traversal). Return typed errors for FILE_NOT_FOUND, PERMISSION_DENIED
- [ ] T031 [P] [US6] Implement shell IPC handlers in src/main/ipc/shell.ts: handle shell:openExternal (validate URL scheme http/https, call shell.openExternal), shell:openPath (call shell.openPath), shell:showItemInFolder (call shell.showItemInFolder)
- [ ] T032 [P] [US6] Implement dialog IPC handlers in src/main/ipc/dialog.ts: handle dialog:openFile (call dialog.showOpenDialog with options, return filePaths or null if cancelled), dialog:saveFile (call dialog.showSaveDialog, return filePath or null)
- [ ] T033 [P] [US6] Implement clipboard IPC handlers in src/main/ipc/clipboard.ts: handle clipboard:read (clipboard.readText()), clipboard:write (clipboard.writeText()), clipboard:readImage (clipboard.readImage() → nativeImage.toBitmap() or null)

**Checkpoint**: All utility IPC services operational — file, shell, dialog, clipboard

---

## Phase 9: User Story 7 - Deep Link Handling (Priority: P3)

**Goal**: angdu:// protocol registered, links routed to feature handler, queued during init

**Independent Test**: Trigger angdu://settings externally, verify app focuses and routes.

### Implementation for User Story 7

- [ ] T034 [US7] Implement ProtocolService singleton in src/main/services/ProtocolService.ts: register angdu:// protocol via app.setAsDefaultProtocolClient('angdu'), maintain a URL queue for links received before renderer ready, flush queue to renderer via deep-link:received event after window loads. Handle protocol URL from second-instance event (Windows/Linux) and open-url event (macOS)
- [ ] T035 [US7] Add ProtocolService to bootstrap sequence and wire second-instance handler in index.ts to forward protocol URLs

**Checkpoint**: Deep link handling complete — protocol registered, links queued and routed

---

## Phase 10: User Story 8 - Global Shortcuts and Power Management (Priority: P3)

**Goal**: Global shortcuts registered, power suspend/resume handled

**Independent Test**: Register shortcut, switch to another app, press shortcut → Angdu focused. Sleep/resume → background tasks restart.

### Implementation for User Story 8

- [ ] T036 [US8] Implement ShortcutService singleton in src/main/services/ShortcutService.ts: register global shortcuts from ConfigService (globalShortcut key), use globalShortcut.register(). Handle shortcut action → toggle window visibility. Unregister all on app will-quit
- [ ] T037 [US8] Implement ProxyService singleton in src/main/services/ProxyService.ts: read proxyUrl from ConfigService, if set call session.defaultSession.setProxy({proxyRules}). Handle invalid proxy URL gracefully (log warning, fallback to direct)
- [ ] T038 [US8] Implement PowerService singleton in src/main/services/PowerService.ts: listen to powerMonitor.on('suspend') → pause UpdateService checks, powerMonitor.on('resume') → resume UpdateService checks
- [ ] T039 [US8] Add ShortcutService, ProxyService, PowerService to bootstrap sequence in src/main/bootstrap.ts

**Checkpoint**: Global shortcuts and power management complete

---

## Phase 11: Renderer Shell (P1 — spans US1/US2/US3)

**Goal**: Renderer has root component with ErrorBoundary, ThemeProvider, TitleBar, and Zustand store

### Implementation

- [ ] T040 Implement useUIStore in src/renderer/src/stores/useUIStore.ts: Zustand store with theme ('light'|'dark'), focused (boolean) state. Actions: setTheme(), setFocused(). Subscribe to IPC events theme:changed and window:focus/blur on store init. Use scalar selectors only (Pattern Constraint: referential stability)
- [ ] T041 Implement TitleBar component in src/renderer/src/components/TitleBar.tsx: platform-aware (macOS: no custom buttons, uses native traffic lights via titleBarStyle:hiddenInset; Windows/Linux: custom minimize/maximize/close buttons). Apply CSS -webkit-app-region: drag on bar container, -webkit-app-region: no-drag on all interactive elements. Call IPC window:minimize/maximize/close on button clicks
- [ ] T042 Implement App.tsx in src/renderer/src/App.tsx: wrap with React ErrorBoundary (fallback UI on crash), ThemeProvider (apply theme class to body from useUIStore), render TitleBar + content placeholder. Load initial theme from IPC theme:get on mount (in useEffect, NOT render)
- [ ] T043 Wire theme interaction chain end-to-end: renderer calls theme:set IPC → main persists + emits theme:changed → renderer useUIStore updates → body class toggles 'dark'. Verify via body.classList contains 'dark' after setting theme to 'dark'

**Checkpoint**: Renderer shell complete — ErrorBoundary, theme switching, title bar with drag regions

---

## Phase 12: Testing + Quality

**Purpose**: Unit tests, integration tests, E2E tests, pattern audit, visual verification

- [ ] T044 [P] Write unit tests in tests/unit/config-service.test.ts: test ConfigService get/set/reset/getAll with defaults, test corruption recovery (mock corrupted DB), test schema migration (version 1→2), test Zod validation rejection
- [ ] T045 [P] Write IPC type contract tests in tests/unit/ipc-types.test.ts: verify InvokeChannelMap has all 25 channels, EventChannelMap has all 8 channels, type narrowing works correctly for each channel
- [ ] T046 Write integration test in tests/integration/ipc-bridge.test.ts: launch Electron app, invoke config:get from renderer → verify response, invoke config:set then config:get → verify persistence, trigger theme:changed event → verify renderer receives it
- [ ] T047 Write E2E tests in tests/e2e/app-shell.spec.ts via Playwright _electron.launch(): test cold start <2s, test window state persistence (resize → restart → verify), test single-instance (launch second → verify first focused), test tray icon visible, test close-to-tray behavior
- [ ] T048 Integration/render smoke test for TitleBar: mount TitleBar with real useUIStore, verify renders without infinite loops, verify drag region CSS applied, verify no console errors
- [ ] T049 Pattern audit: verify all Zustand selectors use scalar values or shallow equality (no new object/array per call), verify no IPC calls in render path (only in useEffect/handlers), verify ErrorBoundary wraps App root, verify all IPC handlers have Zod validation
- [ ] T050 Visual verification: compare rendered app against specs/reverse-spec/visual-references/home-chat.png — verify title bar height matches navbar (44px), verify frameless window chrome, verify window controls placement (left on macOS, right on Windows/Linux)

---

## Phase 13: Demo + Polish

**Purpose**: Demo script, performance verification, cross-cutting cleanup

- [ ] T051 Create demo data fixtures: default config with theme='light', sample window state, demo-friendly settings
- [ ] T052 Write executable demo script in demos/F001-app-shell.sh: starts the Electron app with demo config, prints "Try it" instructions (window management, tray, theme toggle), keeps running until Ctrl+C. Add --ci flag for quick health check (launch → verify window → exit)
- [ ] T053 Performance verification: measure cold start time (target <2s), measure IPC round-trip for config:get (target <10ms), log results
- [ ] T054 End-to-end IPC data flow wiring test: verify complete data path from renderer → preload → ipcMain → service → response → preload → renderer for at least 3 channels (config:get, theme:set, app:getVersion). Verify function names, argument formats, and return types match across all boundaries

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational — core MVP
- **User Story 2 (Phase 4)**: Depends on US1 (needs ConfigService and WindowService running)
- **User Story 3 (Phase 5)**: Depends on US1 (needs ConfigService)
- **User Story 4 (Phase 6)**: Depends on US1 (needs WindowService for hide/show)
- **User Story 5 (Phase 7)**: Depends on US1 (needs WindowService for webContents)
- **User Story 6 (Phase 8)**: Depends on Foundational only — IPC handlers are independent
- **User Story 7 (Phase 9)**: Depends on US1 (needs window focus for deep link handling)
- **User Story 8 (Phase 10)**: Depends on US1 + US5 (PowerService pauses UpdateService)
- **Renderer Shell (Phase 11)**: Depends on US1 + US2 (needs IPC bridge + theme handlers)
- **Testing (Phase 12)**: Depends on all user stories
- **Demo + Polish (Phase 13)**: Depends on Testing phase

### Parallel Opportunities

- T003, T004, T005 can run in parallel (different config files)
- T009, T010 can run in parallel (different type files)
- T030, T031, T032, T033 can run in parallel (different IPC handler files)
- T044, T045 can run in parallel (different test files)
- US4, US5 can start in parallel after US1 completes
- US6 can start after Foundational (independent of other user stories)

---

## Implementation Strategy

### MVP First (User Story 1 + Renderer Shell)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (types + IPC framework)
3. Complete Phase 3: User Story 1 (window + config + lifecycle)
4. Complete Phase 11: Renderer Shell (App.tsx + TitleBar + theme)
5. **STOP and VALIDATE**: App launches with frameless window, state persists, theme toggles

### Incremental Delivery

1. Setup + Foundational → IPC types compile
2. US1 + Renderer → Frameless window launches, state persists (MVP!)
3. US2 → Full IPC bridge operational
4. US3 → Config persistence verified end-to-end
5. US4 → System tray integration
6. US5 → Auto-update
7. US6 → Utility IPC services (file, shell, dialog, clipboard)
8. US7 → Deep link protocol
9. US8 → Global shortcuts + power management
10. Testing + Demo → Full verification + demo script

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- F001 is the foundation — all downstream features (F002–F010) depend on the IPC bridge and services built here
