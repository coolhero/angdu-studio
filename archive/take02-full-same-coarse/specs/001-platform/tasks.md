# Tasks: Platform Infrastructure

**Input**: Design documents from `/specs/001-platform/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/ipc-channels.md

**Tests**: Constitution mandates Test-First (NON-NEGOTIABLE) -- test tasks MUST precede implementation tasks within each user story phase.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Phase 1 (Core Shell) covers US1, US2, US4, US3. Phase 2 (Platform Services) covers US5, US6, US7, US8, US9, US10.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, tooling, and build configuration

- [x] T001 Initialize pnpm monorepo with `package.json` (name, version, scripts: dev, build, test, test:e2e, lint, format, dist) and `pnpm-workspace.yaml` declaring `packages/*` workspace
- [x] T002 Create `electron-builder.yml` with multi-platform targets (Windows x64/arm64 NSIS, macOS x64/arm64 DMG, Linux x64/arm64 AppImage) and publish configuration
- [x] T003 Create `electron.vite.config.ts` with 3-process build configuration (main target: node, preload target: node with contextIsolation, renderer target: browser with React/Tailwind/Ant Design)
- [x] T004 [P] Configure Biome (`biome.json`) with 2-space indent, single quotes, no semicolons, 120-char line width, LF line endings per constitution coding conventions
- [x] T005 [P] Configure Vitest (`vitest.config.ts`) with 5 project configs (main, renderer, aiCore, shared, scripts) and Playwright (`playwright.config.ts`) for E2E tests
- [x] T006 [P] Configure Tailwind CSS 4 (`tailwind.config.ts`) and PostCSS for renderer process
- [x] T007 [P] Create `.env.example` with environment variable template for development
- [x] T008 Create directory scaffold: `src/main/`, `src/main/services/`, `src/preload/`, `src/renderer/src/`, `src/renderer/src/databases/`, `src/renderer/src/store/`, `src/renderer/src/pages/settings/`, `src/renderer/src/services/`, `src/renderer/src/types/`, `src/renderer/src/assets/`, `packages/shared/`, `packages/shared/config/`

**Checkpoint**: Project builds with `pnpm dev` (empty shell), linting and formatting pass, test runner executes with zero tests.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Define `IpcChannel` enum in `packages/shared/IpcChannel.ts` with all channel namespaces: `file:*` (7 channels), `app:*` (12 channels), `window:*` (8 channels), `config:*` (2 channels), `notification:*` (2 channels), `system:*` (7 channels), `shortcuts:*` (1 channel) per contracts/ipc-channels.md
- [x] T010 [P] Define shared TypeScript types in `packages/shared/types.ts`: `FileMetadata`, `FileFilter`, `ProxyConfig`, `ThemeMode`, `AppInfo`, `UpdateInfo`, `Shortcut` per contracts type definitions
- [x] T011 [P] Define shared configuration constants in `packages/shared/config/index.ts`: default window dimensions, minimum window size, default theme, default shortcuts, app name, data directory name
- [x] T012 Implement preload bridge in `src/preload/index.ts`: `contextBridge.exposeInMainWorld('api', {...})` mapping all IPC channels to `ipcRenderer.invoke()` calls, typed with the shared `IpcChannel` enum
- [x] T013 [P] Create environment constants in `src/main/constant.ts`: `isDev`, `isMac`, `isWindows`, `isLinux`, platform checks using `process.platform` and `app.isPackaged`
- [x] T014 [P] Create config constants in `src/main/config.ts`: default paths, window defaults, app constants referencing `packages/shared/config`
- [x] T015 Implement IPC handler registration framework in `src/main/ipc.ts`: central `registerAllHandlers()` function that registers `ipcMain.handle()` for each channel group (file, app, window, config, notification, system, shortcuts)
- [x] T016 [P] Create core type definitions in `src/renderer/src/types/index.ts`: re-export shared types, add renderer-specific types (RouteConfig, SettingsTab)
- [x] T017 [P] Implement LoggerService for main process in `src/main/services/LoggerService.ts`: structured logging with configurable levels (debug, info, warn, error), file rotation
- [x] T018 [P] Implement LoggerService for renderer process in `src/renderer/src/services/LoggerService.ts`: console-based structured logging with module filtering

**Checkpoint**: Foundation ready -- IPC channel enum compiled, preload bridge exposes typed API, handler registration framework in place, shared types available to all processes. User story implementation can now begin.

---

## Phase 3: US1 -- Application Launch and Initialization (Priority: P1) MVP

**Goal**: App launches on all 3 platforms, creates the main window, restores previous window state, enforces single-instance lock, handles power events.

**Independent Test**: Launch the app binary; verify main window appears within 5 seconds at correct size/position, second instance focuses existing window, and state saves on shutdown.

### Tests for US1

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T019 [P] [US1] Unit test for WindowService in `src/main/services/__tests__/WindowService.test.ts`: test window creation with default dimensions, window state persistence (save on close, restore on create), minimum size enforcement, BrowserWindow option validation
- [x] T020 [P] [US1] Unit test for AppService in `src/main/services/__tests__/AppService.test.ts`: test getInfo returns valid AppInfo, quit/relaunch behavior, locale get/set
- [x] T021 [P] [US1] Unit test for bootstrap in `src/main/__tests__/bootstrap.test.ts`: test service registration order, IPC setup invocation, error handling during init
- [x] T022 [P] [US1] Unit test for main entry in `src/main/__tests__/index.test.ts`: test single-instance lock acquisition, second-instance event handling (focus existing window), app ready lifecycle
- [x] T023 [P] [US1] Unit test for PowerMonitorService in `src/main/services/__tests__/PowerMonitorService.test.ts`: test subscription to suspend/shutdown events, state save callback invocation
- [x] T024 [P] [US1] E2E test for app launch in `tests/e2e/app-launch.spec.ts`: test cold start completes within 5 seconds, main window is visible, window restores previous size/position on relaunch

### Implementation for US1

- [x] T025 [P] [US1] Implement WindowService in `src/main/services/WindowService.ts`: BrowserWindow creation with preload script, window state persistence (electron-store for bounds), restore previous size/position, minimum size enforcement (800x600), show event handling, DevTools in dev mode
- [x] T026 [P] [US1] Implement AppService in `src/main/services/AppService.ts`: `getInfo()` returning AppInfo from Electron APIs, `quit()`, `relaunch()`, `getLocale()`/`setLocale()`, `getDataPath()`
- [x] T027 [P] [US1] Implement PowerMonitorService in `src/main/services/PowerMonitorService.ts`: listen to `powerMonitor` events (suspend, shutdown, lock-screen), trigger state save callbacks before system sleep/shutdown
- [x] T028 [US1] Implement bootstrap in `src/main/bootstrap.ts`: initialize services (LoggerService, ConfigManager, WindowService, AppService, PowerMonitorService), register IPC handlers via `ipc.ts`, load renderer URL
- [x] T029 [US1] Implement main entry point in `src/main/index.ts`: `app.requestSingleInstanceLock()`, handle `second-instance` event (focus existing window), `app.whenReady()` -> bootstrap, `app.on('window-all-closed')` platform-specific quit behavior
- [x] T030 [US1] Register US1 IPC handlers in `src/main/ipc.ts`: wire `app:getInfo`, `app:quit`, `app:relaunch`, `app:getLocale`, `app:setLocale`, `app:getDataPath`, `window:show`, `window:hide`, `window:minimize`, `window:maximize`, `window:close`, `window:setSize` to their service methods
- [x] T031 [US1] Implement renderer initialization in `src/renderer/src/init.ts`: fetch AppInfo via `window.api.getInfo()`, initialize Redux store, hydrate persisted state
- [x] T032 [US1] Implement Redux store root in `src/renderer/src/store/index.ts`: `configureStore` with runtime slice (non-persisted) and settings slice (persisted via redux-persist), persistor setup, typed hooks (`useAppDispatch`, `useAppSelector`)
- [x] T033 [P] [US1] Implement runtime state slice in `src/renderer/src/store/runtime.ts`: AppInfo storage, non-persisted runtime flags (isInitialized, activeTab)
- [x] T034 [P] [US1] Implement settings state slice in `src/renderer/src/store/settings.ts`: user preferences (language, theme, launchAtLogin, trayEnabled, proxyConfig), User entity, persisted via redux-persist
- [x] T035 [US1] Implement root App component in `src/renderer/src/App.tsx`: Redux Provider, PersistGate, Ant Design ConfigProvider, theme provider wrapper, Router outlet
- [x] T036 [US1] Implement Router in `src/renderer/src/Router.tsx`: route definitions for 5 entry points (main, mini, selectionToolbar, selectionAction, trace), lazy-loaded page components
- [x] T037 [US1] Initialize Dexie database in `src/renderer/src/databases/index.ts`: version 1 schema with `files` table (FileMetadata fields), typed database class extending Dexie

**Checkpoint**: App launches with `pnpm dev`, main window appears within 5 seconds, window state persists across restarts, single-instance lock works, Redux store hydrates. VS-001 and VS-007 pass.

---

## Phase 4: US2 -- File Management (Priority: P1) MVP

**Goal**: Users can upload, download, open, and delete files within the sandboxed data directory. File metadata is tracked in Dexie.

**Independent Test**: Upload a file via the UI, verify it appears in the managed files list, download it, open it with system default app, delete it.

### Tests for US2

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T038 [P] [US2] Unit test for FileStorage in `src/main/services/__tests__/FileStorage.test.ts`: test file copy to managed directory, UUID-based naming, metadata creation, path containment validation (reject traversal), large file handling
- [x] T039 [P] [US2] Unit test for FileSystemService in `src/main/services/__tests__/FileSystemService.test.ts`: test read/write/delete/move/rename operations, path validation, error handling for missing files and permission failures
- [x] T040 [P] [US2] Unit test for file IPC handlers: test `file:select`, `file:upload`, `file:download`, `file:read`, `file:delete`, `file:open`, `file:getPath` handler registration and parameter validation
- [x] T041 [P] [US2] E2E test for file operations in `tests/e2e/file-management.spec.ts`: test upload flow (file picker -> copy -> metadata created), download to user-chosen location, open with system app, delete removes file and metadata

### Implementation for US2

- [x] T042 [P] [US2] Implement FileSystemService in `src/main/services/FileSystemService.ts`: low-level file operations (readFile, writeFile, copyFile, deleteFile, moveFile, renameFile, ensureDir), all paths validated against sandbox root
- [x] T043 [US2] Implement FileStorage in `src/main/services/FileStorage.ts`: `upload()` copies file to `{dataDir}/files/{uuid}.{ext}` and returns FileMetadata, `download()` copies to user target, `read()` returns Buffer, `delete()` removes file, `open()` via `shell.openPath`, `getPath()` resolves absolute path, `select()` opens native file dialog via `dialog.showOpenDialog`
- [x] T044 [US2] Register US2 IPC handlers in `src/main/ipc.ts`: wire `file:select`, `file:upload`, `file:download`, `file:read`, `file:delete`, `file:open`, `file:getPath` to FileStorage methods with path containment guard

**Checkpoint**: Files can be uploaded, downloaded, opened, and deleted through IPC. Path traversal is blocked. VS-003 passes.

---

## Phase 5: US4 -- Settings Management (Priority: P1) MVP

**Goal**: Settings UI with tabbed navigation (General, Display, Shortcuts, Data, About). All settings persist across restarts via Redux.

**Independent Test**: Modify settings, restart app, verify all changes persist.

### Tests for US4

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T045 [P] [US4] Unit test for settings store slice in `src/renderer/src/store/__tests__/settings.test.ts`: test initial state defaults, reducer actions (setLanguage, setTheme, setLaunchAtLogin, setTrayEnabled, setProxy, setUser), persistence whitelist includes settings slice
- [x] T046 [P] [US4] Unit test for ConfigManager in `src/main/services/__tests__/ConfigManager.test.ts`: test get/set config values via electron-store, default values, type safety
- [x] T047 [P] [US4] E2E test for settings persistence in `tests/e2e/settings-persistence.spec.ts`: test modify a setting -> close app -> reopen -> verify setting persisted, tab navigation loads correct content

### Implementation for US4

- [x] T048 [US4] Implement ConfigManager in `src/main/services/ConfigManager.ts`: wrapper around electron-store for key-value config, typed get/set, defaults, schema validation
- [x] T049 [US4] Register US4 IPC handlers in `src/main/ipc.ts`: wire `config:get`, `config:set` to ConfigManager methods
- [x] T050 [US4] Create Settings page layout in `src/renderer/src/pages/settings/index.tsx`: tabbed navigation component (General, Display, Shortcuts, Data, About), sidebar tab list with Ant Design Menu, content area rendering active tab
- [x] T051 [P] [US4] Create General settings tab in `src/renderer/src/pages/settings/GeneralSettings.tsx`: language selector (i18next locales), launch at login toggle, minimize to tray toggle, send with Enter/Shift+Enter toggle, User profile editing (name, avatar)
- [x] T052 [P] [US4] Create About settings tab in `src/renderer/src/pages/settings/AboutSettings.tsx`: app version display (from AppInfo), update channel selector, check for updates button, links to GitHub/docs
- [x] T053 [P] [US4] Create Data settings tab in `src/renderer/src/pages/settings/DataSettings.tsx`: data path display and change button, clear cache option, data directory size display

**Checkpoint**: Settings UI renders all tabs, modifications dispatch to Redux store, settings persist via redux-persist across restarts. VS-004 passes.

---

## Phase 6: US3 -- Theme and Display Settings (Priority: P1) MVP

**Goal**: Three theme modes (light, dark, system-follow) with immediate UI update and persistence. Display settings in the Settings > Display tab.

**Independent Test**: Change theme in settings, verify all UI components reflect the change within 200ms, verify system-follow tracks OS theme changes.

### Tests for US3

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T054 [P] [US3] Unit test for ThemeService in `src/main/services/__tests__/ThemeService.test.ts`: test `getTheme()` returns current mode, `setTheme()` updates nativeTheme.themeSource, system theme change detection via nativeTheme listener, theme persistence via ConfigManager
- [x] T055 [P] [US3] Unit test for theme integration in `src/renderer/src/store/__tests__/settings.test.ts`: test setTheme action updates state, theme selector derives effective theme from mode + system preference
- [x] T056 [P] [US3] E2E test for theme switching in `tests/e2e/theme-switching.spec.ts`: test switching to dark mode updates all UI components, switching to system mode follows OS theme, theme persists across restart

### Implementation for US3

- [x] T057 [US3] Implement ThemeService in `src/main/services/ThemeService.ts`: `getTheme()` from ConfigManager, `setTheme(mode)` sets `nativeTheme.themeSource`, listen to `nativeTheme.on('updated')` and notify renderer via IPC event, resolve effective theme when mode is "system"
- [x] T058 [US3] Register US3 IPC handlers in `src/main/ipc.ts`: wire `app:getTheme`, `app:setTheme` to ThemeService, add `nativeTheme.on('updated')` -> `webContents.send()` for system theme change events
- [x] T059 [US3] Create Display settings tab in `src/renderer/src/pages/settings/DisplaySettings.tsx`: theme mode selector (Light/Dark/System radio group or segmented control), font size slider, window opacity slider, Tailwind CSS class toggling for dark mode (`dark:` prefix), Ant Design theme algorithm switching (`theme.darkAlgorithm` / `theme.defaultAlgorithm`)
- [x] T060 [US3] Integrate theme with App component in `src/renderer/src/App.tsx`: read theme from Redux store, apply Ant Design ConfigProvider theme algorithm, apply Tailwind dark class to root element, subscribe to system theme change IPC events and update store

**Checkpoint**: Theme switches between light, dark, and system-follow modes. UI updates within 200ms. Theme persists across restarts. VS-002 passes. All Phase 1 (Core Shell) user stories complete.

---

## Phase 7: US5 -- System Tray Integration (Priority: P2)

**Goal**: App minimizes to system tray with platform-appropriate icon, context menu provides Restore and Quit actions.

**Independent Test**: Minimize to tray, verify icon appears, use context menu to restore, check icon appearance in light/dark system themes.

### Tests for US5

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T061 [P] [US5] Unit test for TrayService in `src/main/services/__tests__/TrayService.test.ts`: test tray icon creation, context menu items (Restore, Quit), icon path selection based on platform and system theme, click handler shows/focuses main window, destroy on app quit
- [x] T062 [P] [US5] E2E test for tray integration in `tests/e2e/system-tray.spec.ts`: test minimize to tray hides window and shows tray icon, restore from tray shows and focuses window

### Implementation for US5

- [x] T063 [US5] Implement TrayService in `src/main/services/TrayService.ts`: create `Tray` with platform-specific icon (Template image on macOS, regular icon on Windows/Linux), context menu with Restore (show + focus window) and Quit (app.quit), click handler toggles window visibility, update icon on system theme change
- [x] T064 [US5] Add tray icon assets in `src/renderer/src/assets/`: tray icon files for each platform variant (trayTemplate.png, trayTemplate@2x.png for macOS, tray.ico for Windows, tray.png for Linux)
- [x] T065 [US5] Integrate TrayService with bootstrap in `src/main/bootstrap.ts`: initialize TrayService when tray is enabled in settings, wire to WindowService for show/hide, register tray setting change listener

**Checkpoint**: Tray icon appears when enabled, context menu works, window show/hide from tray functions on all platforms. VS-005 passes.

---

## Phase 8: US6 -- Auto-Update (Priority: P2)

**Goal**: App checks for updates on startup, notifies user of available updates, supports channel selection (stable/rc/beta), downloads in background.

**Independent Test**: Configure update channel, trigger check, verify notification and download behavior.

### Tests for US6

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T066 [P] [US6] Unit test for AppUpdater in `src/main/services/__tests__/AppUpdater.test.ts`: test `checkForUpdates()` returns UpdateInfo or null, channel switching (stable/rc/beta) updates feed URL, download progress events, install triggers app restart, error handling for network failures
- [x] T067 [P] [US6] Unit test for VersionService in `src/main/services/__tests__/VersionService.test.ts`: test version info retrieval, update channel persistence via ConfigManager

### Implementation for US6

- [x] T068 [US6] Implement VersionService in `src/main/services/VersionService.ts`: version info from `app.getVersion()`, update channel get/set via ConfigManager, channel-specific feed URL construction
- [x] T069 [US6] Implement AppUpdater in `src/main/services/AppUpdater.ts`: electron-updater integration, `checkForUpdates()` using configured channel feed URL, `downloadUpdate()` with progress events emitted to renderer, `installUpdate()` triggers `autoUpdater.quitAndInstall()`, error handling with user notification
- [x] T070 [US6] Register US6 IPC handlers in `src/main/ipc.ts`: wire `app:checkUpdate`, `app:installUpdate` to AppUpdater, add update progress event forwarding to renderer
- [x] T071 [US6] Integrate update channel UI in `src/renderer/src/pages/settings/AboutSettings.tsx`: update channel dropdown (stable/rc/beta), check now button triggering `app:checkUpdate`, update available notification with download/install actions, download progress display

**Checkpoint**: Update check runs on startup and on-demand, channel selection persists, update download and install work. VS passes for update flow.

---

## Phase 9: US7 -- Keyboard Shortcuts (Priority: P2)

**Goal**: Configurable global keyboard shortcuts that work even when the app is not focused. Shortcut bindings editable in Settings > Shortcuts.

**Independent Test**: Register a global shortcut, switch to another app, press the shortcut, verify the action fires.

### Tests for US7

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T072 [P] [US7] Unit test for ShortcutService in `src/main/services/__tests__/ShortcutService.test.ts`: test `register()` calls `globalShortcut.register()` with correct accelerator, `unregister()` cleans up, `updateAll()` unregisters old and registers new, conflict detection, error handling for invalid accelerators
- [x] T073 [P] [US7] Unit test for shortcuts store slice in `src/renderer/src/store/__tests__/shortcuts.test.ts`: test initial default shortcuts, updateShortcut action, toggleEnabled action, persistence via redux-persist
- [x] T074 [P] [US7] E2E test for shortcuts in `tests/e2e/keyboard-shortcuts.spec.ts`: test configuring a shortcut in settings, global shortcut triggers action when app is not focused

### Implementation for US7

- [x] T075 [US7] Implement ShortcutService in `src/main/services/ShortcutService.ts`: `registerAll(shortcuts: Shortcut[])` registers enabled shortcuts via `globalShortcut.register()`, `unregisterAll()` on app quit, `update(shortcuts)` diffs and re-registers changed bindings, action dispatch map (show-hide-app, new-chat, etc.)
- [x] T076 [US7] Implement shortcuts state slice in `src/renderer/src/store/shortcuts.ts`: default shortcuts array (show-hide-app: CmdOrCtrl+Shift+Space), actions: setShortcuts, updateShortcut, toggleShortcutEnabled, persisted via redux-persist
- [x] T077 [US7] Register US7 IPC handlers in `src/main/ipc.ts`: wire `shortcuts:update` to ShortcutService.update(), register initial shortcuts from persisted store on app ready
- [x] T078 [US7] Create Shortcuts settings tab in `src/renderer/src/pages/settings/ShortcutsSettings.tsx`: shortcut list with action name, current binding display, record-new-shortcut input (key capture), enable/disable toggle per shortcut, save dispatches `shortcuts:update` IPC call

**Checkpoint**: Global shortcuts register and fire actions. Settings UI allows editing bindings. Shortcuts persist across restarts. VS-006 passes.

---

## Phase 10: US8 -- Proxy Configuration (Priority: P2)

**Goal**: HTTP, HTTPS, and SOCKS proxy support with system proxy detection. Proxy settings in the Settings UI.

**Independent Test**: Configure a proxy, make a network request, verify it routes through the proxy.

### Tests for US8

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T079 [P] [US8] Unit test for ProxyManager in `src/main/services/__tests__/ProxyManager.test.ts`: test `setProxy()` applies config to session via `session.defaultSession.setProxy()`, modes (direct, system, manual), authentication credentials, bypass rules, `getProxy()` returns current config
- [x] T080 [P] [US8] E2E test for proxy in `tests/e2e/proxy-configuration.spec.ts`: test setting manual proxy and verifying session proxy is applied, switching to system proxy mode

### Implementation for US8

- [x] T081 [US8] Implement ProxyManager in `src/main/services/ProxyManager.ts`: `setProxy(config: ProxyConfig)` constructs proxy rules string and calls `session.defaultSession.setProxy()`, `getProxy()` returns current ProxyConfig from ConfigManager, support for HTTP/HTTPS/SOCKS5 protocols, authentication via `app.on('login')`, bypass rules configuration
- [x] T082 [US8] Register US8 IPC handlers in `src/main/ipc.ts`: wire `app:getProxy`, `app:setProxy` to ProxyManager methods
- [x] T083 [US8] Add proxy settings UI in `src/renderer/src/pages/settings/GeneralSettings.tsx`: proxy mode selector (Direct/System/Manual), protocol dropdown (HTTP/HTTPS/SOCKS5), host/port inputs, username/password fields (shown when manual selected), bypass rules textarea, save applies via `app:setProxy` IPC

**Checkpoint**: Proxy configuration applies to Electron session. All three modes work (direct, system, manual). VS-008 passes.

---

## Phase 11: US9 -- Multi-Window Support (Priority: P3)

**Goal**: Secondary windows (mini chat, selection toolbar) open and communicate with the main window. Each window type operates independently.

**Independent Test**: Open each secondary window type, verify it appears, functions, and communicates with the main window.

### Tests for US9

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T084 [P] [US9] Unit test for multi-window WindowService in `src/main/services/__tests__/WindowService.test.ts`: test `openMini()` creates mini window with correct dimensions and always-on-top, `openSelection()` creates selection toolbar with frameless window, window registry tracks all open windows, inter-window communication via IPC
- [x] T085 [P] [US9] E2E test for multi-window in `tests/e2e/multi-window.spec.ts`: test opening mini window from main, opening selection toolbar, both windows function independently

### Implementation for US9

- [x] T086 [US9] Extend WindowService in `src/main/services/WindowService.ts`: `openMini()` creates compact BrowserWindow (400x600, always-on-top, separate preload), `openSelection()` creates frameless floating toolbar, window registry (Map of windowId -> BrowserWindow), cleanup on close, each window loads its own renderer entry point
- [x] T087 [US9] Register US9 IPC handlers in `src/main/ipc.ts`: wire `window:openMini`, `window:openSelection` to WindowService methods
- [x] T088 [US9] Add mini window renderer entry point in `electron.vite.config.ts`: configure additional renderer entry for mini window HTML, add corresponding route in `src/renderer/src/Router.tsx`
- [x] T089 [US9] Add selection toolbar renderer entry point in `electron.vite.config.ts`: configure additional renderer entry for selection toolbar HTML, add corresponding route in `src/renderer/src/Router.tsx`

**Checkpoint**: Mini window and selection toolbar open from main window, operate independently, and communicate via IPC.

---

## Phase 12: US10 -- Data Path Management (Priority: P3)

**Goal**: Users can change the data storage location. App migrates data and relaunches. Portable mode stores data alongside the executable.

**Independent Test**: Change data path in settings, verify app relaunches, confirm data accessible at new location.

### Tests for US10

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T090 [P] [US10] Unit test for data path migration in `src/main/services/__tests__/AppService.test.ts`: test `setDataPath()` copies data directory to new location, updates ConfigManager, triggers app relaunch, validates new path is writable, rejects invalid paths
- [x] T091 [P] [US10] Unit test for portable mode in `src/main/services/__tests__/AppService.test.ts`: test `isPortable()` detects portable marker file adjacent to executable, data path resolves relative to executable in portable mode
- [x] T092 [P] [US10] E2E test for data path change in `tests/e2e/data-path.spec.ts`: test changing data path triggers migration and relaunch, data is accessible at new location

### Implementation for US10

- [x] T093 [US10] Extend AppService in `src/main/services/AppService.ts`: `setDataPath(newPath)` validates target is writable, copies all data from current path to new path using FileSystemService, updates ConfigManager with new path, calls `app.relaunch()` + `app.quit()`, `isPortable()` checks for portable marker file
- [x] T094 [US10] Register US10 IPC handlers in `src/main/ipc.ts`: wire `app:setDataPath` to AppService, wire `system:isPortable` to AppService.isPortable()
- [x] T095 [US10] Integrate data path UI in `src/renderer/src/pages/settings/DataSettings.tsx`: display current data path, "Change" button opens folder picker via `dialog.showOpenDialog`, confirmation dialog warning about relaunch, progress indicator during migration

**Checkpoint**: Data path change triggers migration and relaunch. Portable mode detected and used when marker is present. All Phase 2 (Platform Services) user stories complete.

---

## Phase 13: Polish and Cross-Cutting Concerns

**Purpose**: Final integration, quality improvements, and validation across all user stories

- [x] T096 [P] Implement NotificationService in `src/main/services/NotificationService.ts`: native OS notifications via `Notification` API, click event forwarding to renderer via `notification:click` channel
- [x] T097 [P] Register notification IPC handlers in `src/main/ipc.ts`: wire `notification:show` to NotificationService, wire `notification:click` event
- [x] T098 [P] Register system IPC handlers in `src/main/ipc.ts`: wire `system:openExternal` (shell.openExternal), `system:openPath` (shell.openPath), `system:getMemoryUsage`, `system:getPlatform`, `system:getArch`, `system:getLogPath`
- [x] T099 [P] Add i18n initialization in `src/renderer/src/init.ts`: configure i18next with en-US, zh-CN, zh-TW locale files, language detection from settings store, locale change handler
- [x] T100 [P] Add global error boundary in `src/renderer/src/App.tsx`: React error boundary component wrapping the app, graceful error display with recovery option
- [x] T101 Integration test: full app lifecycle in `tests/e2e/full-lifecycle.spec.ts`: launch -> change settings -> upload file -> switch theme -> minimize to tray -> restore -> verify all state persisted -> quit cleanly
- [x] T102 Cross-platform validation: run all E2E tests on Windows, macOS, and Linux per quickstart.md validation scenarios (VS-001 through VS-008)
- [x] T103 Performance validation: verify cold start < 5 seconds, IPC round-trip < 100ms for non-I/O operations, theme switch < 200ms per success criteria SC-001, SC-002, SC-004
- [x] T104 Run quickstart.md validation: execute all 8 validation scenarios (VS-001 through VS-008) and verify pass

---

## Dependencies and Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies -- can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion -- BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational (Phase 2) -- first user story, provides app shell
- **US2 (Phase 4)**: Depends on Foundational (Phase 2) + US1 (needs WindowService and IPC framework)
- **US4 (Phase 5)**: Depends on US1 (needs Redux store, App component, Router)
- **US3 (Phase 6)**: Depends on US4 (theme is a display setting, needs settings slice and settings UI)
- **US5 (Phase 7)**: Depends on US1 (needs WindowService for show/hide)
- **US6 (Phase 8)**: Depends on US1 (needs bootstrap, ConfigManager)
- **US7 (Phase 9)**: Depends on US1 + US4 (needs store and settings UI for shortcut editing)
- **US8 (Phase 10)**: Depends on US1 + US4 (needs store and settings UI for proxy config)
- **US9 (Phase 11)**: Depends on US1 (extends WindowService)
- **US10 (Phase 12)**: Depends on US1 + US2 (needs AppService, FileSystemService for migration)
- **Polish (Phase 13)**: Depends on all user stories being complete

### Within Each User Story

- Tests MUST be written and FAIL before implementation begins
- Services before IPC handler registration
- IPC handlers before renderer UI
- Redux slices before components that use them
- Core implementation before integration

### Parallel Opportunities

- **Phase 1**: T004, T005, T006, T007 can all run in parallel
- **Phase 2**: T010, T011 in parallel; T013, T014 in parallel; T016, T017, T018 in parallel
- **Phase 3 (US1)**: All 6 test tasks (T019-T024) in parallel; T025, T026, T027 in parallel; T033, T034 in parallel
- **Phase 4 (US2)**: All 4 test tasks (T038-T041) in parallel; T042 parallel with other prep
- **Phase 5 (US4)**: All 3 test tasks (T045-T047) in parallel; T051, T052, T053 in parallel
- **Phase 6 (US3)**: All 3 test tasks (T054-T056) in parallel
- **Phase 7-12**: Test tasks within each phase run in parallel
- **Cross-story parallelism**: US5, US6 can run in parallel after US1 completes; US7, US8 can run in parallel after US1 + US4 complete; US9, US10 can run in parallel after US1 + US2 complete
- **Phase 13**: T096, T097, T098, T099, T100 can all run in parallel

---

## Implementation Strategy

### MVP First (Phase 1 Core Shell: US1 + US2 + US4 + US3)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T018)
3. Complete Phase 3: US1 -- App Launch (T019-T037)
4. Complete Phase 4: US2 -- File Management (T038-T044)
5. Complete Phase 5: US4 -- Settings Management (T045-T053)
6. Complete Phase 6: US3 -- Theme and Display (T054-T060)
7. **STOP and VALIDATE**: Run VS-001 through VS-004, VS-007. All Core Shell stories functional.

### Incremental Delivery (Phase 2 Platform Services)

8. US5 -- Tray (T061-T065) -> VS-005
9. US6 -- Auto-Update (T066-T071) -> update flow validation
10. US7 -- Shortcuts (T072-T078) -> VS-006
11. US8 -- Proxy (T079-T083) -> VS-008
12. US9 -- Multi-Window (T084-T089) -> multi-window validation
13. US10 -- Data Path (T090-T095) -> data path validation
14. Polish (T096-T104) -> full cross-platform validation

### Parallel Team Strategy

With multiple developers after Foundational phase:

- **Developer A**: US1 (blocks everything) -> US5 -> US9
- **Developer B**: (after US1) US2 -> US10
- **Developer C**: (after US1) US4 -> US3 -> US7 -> US8
- **Developer D**: (after US1) US6 -> Polish

---

## Notes

- [P] tasks = different files, no dependencies, can run simultaneously
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable after its dependencies
- All tests MUST fail before implementation begins (Test-First per constitution)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- File paths reference the project structure defined in plan.md
- IPC channels reference contracts/ipc-channels.md definitions
- Data entities reference data-model.md schemas
- Total: 104 tasks across 13 phases covering 10 user stories
