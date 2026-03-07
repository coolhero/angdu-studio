# Tasks: Core Platform

**Input**: Design documents from `/specs/001-core-platform/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests follow TDD approach per Constitution BP-I (Test-First). Tests are written before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Shared types**: `packages/shared/`
- **Main process**: `src/main/`
- **Preload bridge**: `src/preload/`
- **Renderer**: `src/renderer/src/`
- **Tests**: `tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize Electron project with electron-vite, install all dependencies, create directory structure

- [x] T001 Initialize project with pnpm and create package.json with Electron 40, React 19, TypeScript 5.8, electron-vite 5 as core dependencies
- [x] T002 Create electron-vite.config.ts with 3-section config (main, preload, renderer) including path aliases (@main, @renderer, @shared), react-swc plugin, and multi-input renderer (index.html + miniWindow.html) per R5
- [x] T003 [P] Create tsconfig.json files for main, preload, and renderer processes with path aliases and strict mode enabled
- [x] T004 [P] Create directory structure per plan.md: packages/shared/, src/main/, src/main/services/, src/main/ipc/, src/main/window/, src/main/i18n/, src/preload/, src/preload/api/, src/renderer/src/, src/renderer/src/routes/, src/renderer/src/stores/, src/renderer/src/hooks/, src/renderer/src/i18n/, src/renderer/src/styles/, src/renderer/src/lib/, src/renderer/src/components/ui/, src/resources/icons/, src/resources/tray/, tests/unit/main/, tests/unit/preload/, tests/unit/renderer/, tests/integration/, tests/e2e/
- [x] T005 [P] Create src/renderer/index.html (main window entry) and src/renderer/miniWindow.html (mini window entry) with basic HTML structure linking to React roots
- [x] T006 [P] Install and configure Tailwind CSS 4 with @tailwindcss/vite plugin in tailwind.config.ts
- [x] T007 [P] Install and configure Vitest for unit/integration testing in vitest.config.ts with path aliases matching electron-vite config
- [x] T008 [P] Create .gitignore with node_modules/, dist/, out/, .env*, coverage/, *.log patterns

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, IPC enum, and core infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create packages/shared/types/file.ts with FileMetadata interface (id, name, origin_name, path, size, ext, type, created_at, count, tokens, purpose) and FileType enum (image, video, audio, document, text, code, archive, other) per data-model.md
- [x] T010 [P] Create packages/shared/types/config.ts with ConfigKeys enum (Language, Theme, ZoomFactor, LaunchToTray, Tray, TrayOnClose, Shortcuts, EnableQuickAssistant, ClickTrayToShowQuickAssistant, DisableHardwareAcceleration, UseSystemTitleBar, Proxy, EnableDeveloperMode, ClientId), ProxyConfig interface (mode, url, bypass), and Shortcut interface (key, shortcut, enabled) per data-model.md
- [x] T011 [P] Create packages/shared/types/system.ts with SystemInfo, Display, Rectangle, CpuInfo, FileStat, WindowCreateOptions, and MenuItem type definitions
- [x] T012 [P] Create packages/shared/types/index.ts re-exporting all types from file.ts, config.ts, system.ts
- [x] T013 Create packages/shared/IpcChannel.ts with centralized IPC channel enum containing all ~126 channels using PascalDomain_PascalAction = 'kebab-domain:camelAction' naming convention per R2 and contracts/ipc-channels.md (App domain ~32, Config 2, File ~30, Window 11, System 8, MiniWindow 5, Notification 2, Open 2, AES 2, Zip 2, Shortcuts 1, StoreSync 4, plus ~10 global events)
- [x] T014 Create src/main/bootstrap.ts implementing data directory setup, userData path configuration, portable mode detection (Windows), AppImage detection (Linux), and environment variable loading per R1
- [x] T015 Create src/main/services/PlatformService.ts implementing OS detection (isMacOS, isWindows, isLinux), portable mode check, Wayland detection, AppImage detection, and platform-specific flags per FR-013
- [x] T016 Create src/main/logger.ts implementing Winston logger with daily rotation (10MB max/30d retention), error-specific rotation (10MB/60d), context-scoped logging via withContext(module), and dev overrides via CSLOGGER_MAIN_LEVEL/CSLOGGER_MAIN_SHOW_MODULES env vars per FR-014 and R1
- [x] T017 Create src/main/config.ts implementing ConfigManager class with electron-store backend, generic get<T>/set<T> methods, EventEmitter-based observer pattern (subscribe/unsubscribe), ConfigKeys enum integration, and default values per R3 and data-model.md ConfigKeys
- [x] T018 Create src/renderer/src/lib/db.ts implementing Dexie database class with v1 schema (files: id, name, type, created_at), chromeTransactionDurability: 'strict', and typed table accessor per R4
- [x] T019 Create src/preload/index.ts implementing contextBridge.exposeInMainWorld('api', api) with type export WindowApiType per R6
- [x] T020 Create src/preload/api/index.ts assembling all domain API objects (app, config, file, window, system, miniWindow, notification, open, aes, zip, shortcuts, storeSync) into the unified api object

**Checkpoint**: Foundation ready — shared types compiled, IPC enum defined, bootstrap/config/logger/db initialized, preload bridge structure ready

---

## Phase 3: User Story 1 — App Launch & Shell (Priority: P1) 🎯 MVP

**Goal**: Application launches, creates main window, restores state, enforces single-instance

**Independent Test**: Launch app → window appears within 3s → close & relaunch → state restored → attempt second instance → existing window focused

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T021 [P] [US1] Write unit test for MainWindow creation and state persistence in tests/unit/main/window/MainWindow.test.ts — verify window creates with correct defaults, persists bounds on close, restores saved bounds on creation
- [x] T022 [P] [US1] Write unit test for bootstrap initialization order in tests/unit/main/bootstrap.test.ts — verify data dir setup runs, userData path is set, environment is detected
- [x] T023 [P] [US1] Write unit test for single-instance lock in tests/unit/main/singleInstance.test.ts — verify lock acquisition, second-instance event handling, window focus on activation

### Implementation for User Story 1

- [x] T024 [US1] Create src/main/window/MainWindow.ts implementing BrowserWindow creation with electron-window-state for position/size persistence, platform-adaptive title bar (native on macOS, frameless on Windows, configurable on Linux), webPreferences (preload script path, contextIsolation: true, nodeIntegration: false), and loadURL for renderer index.html
- [x] T025 [US1] Create src/main/index.ts implementing the full bootstrap sequence: side-effect imports (bootstrap → config), pre-ready synchronous setup (hardware acceleration toggle, platform switches, single-instance lock via app.requestSingleInstanceLock()), app.whenReady() block creating MainWindow, registering IPC handlers, and lifecycle hooks (activate, second-instance, before-quit, will-quit) per R1
- [x] T026 [US1] Create src/main/ipc/app.ipc.ts implementing App domain IPC handlers: App_Info, App_Reload, App_Quit, App_GetPath, App_GetSystemInfo, App_GetCacheSize, App_ClearCache, App_SetLaunchOnBoot, App_GetLoginItem, App_SetAlwaysOnTop, App_ToggleFullScreen, App_IsFullScreen, App_SetBadgeCount, App_ShowDock, App_HideDock, App_SetProgressBar, App_BounceDock, App_GetDisplays, App_IsFocused, App_Focus, App_GetArgv, App_Log, App_OpenLogFolder, App_DisableHardwareAcceleration per contracts/ipc-channels.md
- [x] T027 [P] [US1] Create src/main/ipc/window.ipc.ts implementing Window domain IPC handlers: Windows_Minimize, Windows_Maximize, Windows_Close, Windows_Create, Windows_Focus, Windows_SetTitle, Windows_SetSize, Windows_ToggleDevTools, Windows_ShowContextMenu, Windows_SetFullscreen, Windows_GetBounds per contracts
- [x] T028 [P] [US1] Create src/main/ipc/system.ipc.ts implementing System domain IPC handlers: System_GetLocale, System_GetPlatform, System_GetArch, System_GetMemory, System_GetCPU, System_GetHostname, System_IsDarkMode, System_GetDisplays per contracts
- [x] T029 [US1] Create src/main/ipc/index.ts as the IPC registration hub, importing and registering all domain handlers (app, config, file, window, system, miniWindow, utility) in a single registerAllHandlers() function
- [x] T030 [US1] Create src/preload/api/app.ts implementing window.api.app namespace wrapping ipcRenderer.invoke for all App domain channels, plus event listener helpers (onThemeUpdated, onWindowFocused, onWindowBlurred, onDeepLinkReceived) returning cleanup functions
- [x] T031 [P] [US1] Create src/preload/api/window.ts implementing window.api.window namespace wrapping all Window domain channels
- [x] T032 [P] [US1] Create src/preload/api/system.ts implementing window.api.system namespace wrapping all System domain channels
- [x] T033 [US1] Create src/renderer/src/main.tsx implementing React 19 root with StrictMode, mounting to #root in index.html, wrapping with TanStack RouterProvider
- [x] T034 [US1] Create src/renderer/src/routes/__root.tsx implementing root route with providers shell (theme, i18n, stores will be added incrementally) and basic layout (sidebar placeholder + content outlet)
- [x] T035 [US1] Create src/renderer/src/styles/globals.css with Tailwind CSS 4 imports (@import "tailwindcss"), base CSS variable definitions for light/dark themes (--background, --foreground, --primary, --secondary, --border, --muted, etc.), and dark class variant overrides per R9

**Checkpoint**: App launches, main window appears with correct dimensions, restores saved state on relaunch, second instance activates existing window. `pnpm dev` works end-to-end.

---

## Phase 4: User Story 2 — Configuration & Theme Persistence (Priority: P1)

**Goal**: Config changes persist and apply immediately; theme Light/Dark/System with OS sync and multi-window propagation

**Independent Test**: Change theme → verify visual update <200ms → restart → verify theme persists → change OS dark mode → verify auto-follow

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T036 [P] [US2] Write unit test for ConfigManager get/set/subscribe in tests/unit/main/config.test.ts — verify typed get/set, observer notifications on change, default value fallback for corrupted store
- [x] T037 [P] [US2] Write unit test for ThemeService in tests/unit/main/services/ThemeService.test.ts — verify nativeTheme.themeSource updates, ThemeUpdated event broadcast to all windows, OS theme change listener

### Implementation for User Story 2

- [x] T038 [US2] Create src/main/ipc/config.ipc.ts implementing Config_Get and Config_Set IPC handlers delegating to ConfigManager, with error handling for invalid keys
- [x] T039 [US2] Create src/main/services/ThemeService.ts implementing: setTheme(mode) updating nativeTheme.themeSource, getTheme() returning current mode, OS theme change listener via nativeTheme.on('updated'), broadcasting ThemeUpdated event to all BrowserWindows via webContents.send(), and config persistence via ConfigManager per R9 and FR-009
- [x] T040 [US2] Add theme and proxy IPC handlers to src/main/ipc/app.ipc.ts: App_SetTheme (delegates to ThemeService), App_GetTheme, App_SetProxy (sets session proxy via session.defaultSession.setProxy()), App_GetProxy, App_SetZoomFactor, App_GetZoomFactor per contracts
- [x] T041 [US2] Create src/preload/api/config.ts implementing window.api.config namespace with get(key) and set(key, value) wrapping Config_Get and Config_Set IPC channels
- [x] T042 [US2] Create src/renderer/src/stores/middleware/broadcastSync.ts implementing Zustand middleware that wraps BroadcastChannel to sync state changes across main window and mini window per R7
- [x] T043 [US2] Create src/renderer/src/stores/useAppStore.ts implementing Zustand store with persist middleware and broadcastSync: state includes theme ('light'|'dark'|'auto'), language (string), sidebarOpen (boolean); actions setTheme, setLanguage, toggleSidebar per R7
- [x] T044 [US2] Create src/renderer/src/hooks/useTheme.ts implementing React hook that reads theme from useAppStore, calls window.api.app.setTheme() on change, listens for ThemeUpdated events to sync from main process, and applies dark class to document.documentElement
- [x] T045 [US2] Create src/renderer/src/hooks/useConfig.ts implementing React hook wrapping window.api.config.get/set with caching and stale-while-revalidate pattern
- [x] T046 [US2] Create src/renderer/src/styles/themes/light.css and src/renderer/src/styles/themes/dark.css with complete CSS variable sets for both themes (background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring colors plus radius values)

**Checkpoint**: Theme toggle Light→Dark→System works immediately. Config values persist across restarts. OS dark mode changes auto-followed. No flicker on theme switch.

---

## Phase 5: User Story 3 — File Upload & Storage (Priority: P1)

**Goal**: Upload files to app data dir, store metadata in Dexie, support read/write/delete/copy/move/rename operations

**Independent Test**: Upload file → verify stored in app data dir → verify FileMetadata in IndexedDB → delete file → verify removed from both

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T047 [P] [US3] Write unit test for FileService in tests/unit/main/services/FileService.test.ts — verify upload creates file + metadata, read returns content with encoding detection, delete removes file + metadata, copy/move update paths
- [x] T048 [P] [US3] Write integration test for file IPC round-trip in tests/integration/file-operations.test.ts — verify File_Upload, File_Read, File_Delete, File_Copy channels work end-to-end through preload bridge

### Implementation for User Story 3

- [x] T049 [US3] Create src/main/services/FileService.ts implementing: upload(filePath, compress?) — copies file to app data dir with UUID name, auto-compresses images >1MB, returns FileMetadata; read(path, encoding?) — reads with chardet encoding detection; write(path, data); delete(path); copy(src, dest); move(src, dest); rename(path, newName); exists(path); stat(path); mkdir(path); readdir(path); getType(path) — classifies by extension into FileType enum; getSize(path); hash(path, algo); compress/decompress (gzip); base64Encode/Decode; binaryRead/Write; openInExplorer(path) — shell.openPath; glob(pattern, cwd); append(path, data) per FR-010, FR-011, FR-012
- [x] T050 [US3] Create src/main/services/FileWatcherService.ts implementing file watching with chokidar: startWatcher(id, path, options) with debounce 1000ms, stability threshold 500ms, max depth 10; stopWatcher(id); emits File_Changed events to renderer per FR-012
- [x] T051 [US3] Create src/main/ipc/file.ipc.ts implementing all File domain IPC handlers (~30 channels): File_Open (dialog.showOpenDialog), File_Save (dialog.showSaveDialog), File_Read, File_Write, File_Delete, File_Copy, File_Move, File_Rename, File_Exists, File_Stat, File_Mkdir, File_Readdir, File_SelectFolder, File_Upload, File_Download, File_Base64Encode, File_Base64Decode, File_BinaryRead, File_BinaryWrite, File_Hash, File_Compress, File_Decompress, File_GetType, File_GetSize, File_OpenInExplorer, File_Append, File_Glob, File_StartWatcher, File_StopWatcher, File_GetMetadata — all delegating to FileService/FileWatcherService per contracts
- [x] T052 [US3] Create src/preload/api/file.ts implementing window.api.file namespace wrapping all File domain IPC channels, plus onFileChanged event listener returning cleanup function
- [x] T053 [US3] Create src/renderer/src/hooks/useFileUpload.ts implementing React hook for file upload flow: calls window.api.file.upload(), stores FileMetadata in Dexie files table, provides progress state and error handling

**Checkpoint**: Files upload to app data directory, metadata stored in IndexedDB. All file operations (read, write, delete, copy, move, rename, watch) work through IPC bridge.

---

## Phase 6: User Story 4 — Internationalization (Priority: P2)

**Goal**: 11 locales with immediate language switching, date/time locale formatting, missing key logging

**Independent Test**: Switch language to each locale → verify all UI text updates immediately → verify date/time formats match locale

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T054 [P] [US4] Write unit test for i18n initialization in tests/unit/renderer/i18n.test.ts — verify all 11 locales load, language switching works, missing keys fall back to en-US and are logged

### Implementation for User Story 4

- [x] T055 [US4] Create src/renderer/src/i18n/locales/en-US.json with complete translation keys for all UI labels (app name, menu items, common actions, settings labels, file operations, theme names, error messages)
- [x] T056 [P] [US4] Create translation JSON files for remaining 10 locales in src/renderer/src/i18n/locales/: zh-CN.json, zh-TW.json, ja-JP.json, ru-RU.json, de-DE.json, el-GR.json, es-ES.json, fr-FR.json, pt-PT.json, ro-RO.json — initially duplicating en-US keys (translations can be refined later)
- [x] T057 [US4] Create src/renderer/src/i18n/index.ts initializing i18next with react-i18next: configure language detection from useAppStore, fallbackLng: 'en-US', interpolation escapeValue: false, missing key handler that logs via window.api.app.log(), and dynamic locale import per FR-007
- [x] T058 [US4] Configure dayjs locale integration in src/renderer/src/i18n/index.ts — import all 11 dayjs locales, set dayjs.locale() when language changes for date/time formatting per FR-008
- [x] T059 [US4] Add App_SetLanguage and App_GetLocale IPC handlers to src/main/ipc/app.ipc.ts — SetLanguage persists to ConfigManager and updates main process i18n; GetLocale returns app.getLocale()
- [x] T060 [US4] Create src/main/i18n/locales.ts with main-process i18n strings for tray menu items, dialog titles, and native menu labels (used by TrayService and MenuService)

**Checkpoint**: Language switching updates all visible UI text immediately. Date/time formatted per locale. Missing keys logged and show English fallback.

---

## Phase 7: User Story 5 — System Tray & Mini Window (Priority: P2)

**Goal**: System tray with context menu, mini window (Quick Assistant) with frameless/always-on-top/auto-hide/pin/multi-monitor centering

**Independent Test**: Minimize to tray → verify tray icon + context menu → open mini window → test auto-hide on blur → pin → verify stays visible → multi-monitor centering

### Tests for User Story 5

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T061 [P] [US5] Write unit test for MiniWindow in tests/unit/main/window/MiniWindow.test.ts — verify frameless creation at 550x400, always-on-top, resize constraints (min 350x380, max 1024x768), multi-monitor centering logic, auto-hide on blur, pin override
- [x] T062 [P] [US5] Write unit test for TrayService in tests/unit/main/services/TrayService.test.ts — verify tray creation with platform-specific icons, context menu items (Show, Mini Window, Quit), click behavior dispatch

### Implementation for User Story 5

- [x] T063 [US5] Create src/main/window/MiniWindow.ts implementing: frameless BrowserWindow (550x400 default, min 350x380, max 1024x768), always-on-top, visibleOnAllWorkspaces, show() with multi-monitor centering (screen.getCursorScreenPoint() → screen.getDisplayNearestPoint()), hide(), toggle(), auto-hide on blur event (unless pinned), setPin(boolean), loadURL for miniWindow.html per FR-004
- [x] T064 [US5] Create src/main/services/TrayService.ts implementing: createTray() with platform-specific icon selection (light/dark on macOS via nativeTheme.shouldUseDarkColors, standard on Win/Linux), buildContextMenu() with i18n-translated items [Show Main Window, Open Mini Window, Quit], click handler dispatching to main window or mini window based on config ClickTrayToShowQuickAssistant, destroy() per FR-016
- [x] T065 [US5] Create src/main/ipc/miniWindow.ipc.ts implementing MiniWindow domain IPC handlers: MiniWindow_Show, MiniWindow_Hide, MiniWindow_SetPin, MiniWindow_Toggle, MiniWindow_GetBounds — delegating to MiniWindow instance
- [x] T066 [US5] Create src/preload/api/miniWindow.ts implementing window.api.miniWindow namespace wrapping all MiniWindow domain channels
- [x] T067 [US5] Create src/renderer/src/miniMain.tsx implementing React root for mini window HTML entry, mounting to #root in miniWindow.html with theme/i18n providers (shared with main window)
- [x] T068 [US5] Integrate TrayService into src/main/index.ts app.whenReady() block — create tray after main window, pass references to main/mini windows, connect config observers for tray-related settings

**Checkpoint**: Minimize to tray works on all platforms. Tray context menu functional. Mini window opens centered on active monitor, auto-hides on blur, stays when pinned.

---

## Phase 8: User Story 6 — Keyboard Shortcuts & Deep Links (Priority: P2)

**Goal**: Global keyboard shortcuts working when app unfocused, per-shortcut enable/disable, cherry-studio:// protocol handling

**Independent Test**: Register shortcut → switch to another app → press shortcut → verify action fires. Click cherry-studio:// link → verify app processes it.

### Tests for User Story 6

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T069 [P] [US6] Write unit test for ShortcutService in tests/unit/main/services/ShortcutService.test.ts — verify shortcut registration, unregistration, per-shortcut enable/disable, action dispatch
- [x] T070 [P] [US6] Write unit test for ProtocolService in tests/unit/main/services/ProtocolService.test.ts — verify protocol registration, URL parsing, event dispatch for deep links

### Implementation for User Story 6

- [x] T071 [US6] Create src/main/services/ShortcutService.ts implementing: registerShortcuts(shortcuts: Shortcut[]) using globalShortcut.register(), unregisterAll(), updateShortcut(key, enabled) for per-shortcut enable/disable, action handlers mapping shortcut keys to actions (showMainWindow, showMiniWindow, etc.) per FR-020
- [x] T072 [US6] Create src/main/services/ProtocolService.ts implementing: registerProtocol() using app.setAsDefaultProtocolClient('cherry-studio'), handleDeepLink(url) parsing cherry-studio:// URLs and dispatching DeepLinkReceived event to renderer, integration with second-instance handler for when app is already running per FR-018
- [x] T073 [US6] Create src/main/ipc/utility.ipc.ts implementing utility domain IPC handlers: Shortcuts_Register, Notification_Show, Notification_Clear, Open_Url (shell.openExternal), Open_Path (shell.openPath), AES_Encrypt, AES_Decrypt, Zip_Compress, Zip_Decompress, StoreSync_GetState, StoreSync_SetState, StoreSync_Subscribe, plus StoreSync_StateChanged M→R event per contracts
- [x] T074 [US6] Create src/preload/api/utility.ts implementing window.api.notification, window.api.open, window.api.aes, window.api.zip, window.api.shortcuts, and window.api.storeSync namespaces wrapping their respective IPC channels, with event listener helpers for StoreSync_StateChanged

**Checkpoint**: Global shortcuts work when app is unfocused. cherry-studio:// deep links processed. All utility IPC channels functional.

---

## Phase 9: User Story 7 — Platform Adaptation (Priority: P3)

**Goal**: macOS native title bar + app menu, Windows frameless + portable mode, Linux system title bar option + Wayland support

**Independent Test**: Run on each platform → verify title bar style, menu presence (macOS), portable mode (Windows), Wayland flags (Linux)

### Tests for User Story 7

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T075 [US7] Write unit test for PlatformService adaptations in tests/unit/main/services/PlatformService.test.ts — verify platform detection returns correct flags, portable mode path override, Wayland detection

### Implementation for User Story 7

- [x] T076 [US7] Create src/main/services/MenuService.ts implementing macOS application menu: standard menus (Cherry Studio, Edit with undo/redo/cut/copy/paste, View with zoom/fullscreen, Window with minimize/close, Help with links), i18n labels from main process locales, conditional creation (only on macOS) per FR-017
- [x] T077 [US7] Enhance src/main/window/MainWindow.ts with platform-specific adaptations: macOS titleBarStyle 'hiddenInset' with trafficLightPosition, Windows frameless with titleBarOverlay colors, Linux optional useSystemTitleBar from config, CSS animation disable flag for Windows per FR-013
- [x] T078 [US7] Enhance src/main/bootstrap.ts with platform-specific setup: portable mode path override on Windows (userData → executable dir), AppImage-specific file path handling on Linux, Wayland/X11 detection setting appropriate Electron flags per FR-013

**Checkpoint**: Platform-specific behaviors verified on macOS/Windows/Linux targets. Menu, title bar, and path adaptations correct.

---

## Phase 10: User Story 8 — Logging & Crash Recovery (Priority: P3)

**Goal**: Winston structured logging with rotation, renderer log forwarding via IPC, crash recovery with 60s threshold

**Independent Test**: Generate logs → verify rotation at 10MB → verify error log separation → simulate renderer crash → verify reload vs exit behavior

### Tests for User Story 8

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T079 [P] [US8] Write unit test for logger in tests/unit/main/logger.test.ts — verify daily rotation config, error-specific transport, context-scoped logging via withContext(), log format (timestamp, level, module, message)
- [x] T080 [P] [US8] Write unit test for crash recovery in tests/unit/main/crashRecovery.test.ts — verify >60s crash triggers reload, <60s crash triggers exit, crash timestamp tracking

### Implementation for User Story 8

- [x] T081 [US8] Enhance src/main/logger.ts with complete Winston configuration: DailyRotateFile transport for combined logs (10MB/30d), DailyRotateFile transport for error-only logs (10MB/60d), console transport for dev mode, context-scoped logging factory withContext(module) returning scoped logger, format with timestamp/level/module/message per FR-014
- [x] T082 [US8] Add renderer crash recovery to src/main/window/MainWindow.ts: listen to webContents 'render-process-gone' event, track last crash timestamp, if >60s since last crash reload webContents, if <60s since last crash call app.exit() to prevent crash loop per FR-019
- [x] T083 [US8] Add renderer log forwarding IPC handler in src/main/ipc/app.ipc.ts: App_Log handler receives { level, module, message } from renderer and forwards to Winston logger with context 'renderer:{module}'
- [x] T084 [US8] Add App_OpenLogFolder handler to src/main/ipc/app.ipc.ts: opens the log directory in the system file manager using shell.openPath()

**Checkpoint**: Logs rotate correctly at size limits. Error logs in separate files. Renderer crash triggers reload (>60s) or exit (<60s). Renderer logs forwarded to main process.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Demo script, integration verification, proxy/HW accel, final touches

- [ ] T085 Implement proxy configuration in src/main/services/ThemeService.ts or a dedicated ProxyService: apply session.defaultSession.setProxy() for system/fixed_servers/direct modes with bypass rules per FR-021
- [ ] T086 Implement hardware acceleration toggle in src/main/index.ts: read DisableHardwareAcceleration from config before app.ready, call app.disableHardwareAcceleration() if true per FR-022
- [ ] T087 [P] Create src/renderer/src/lib/utils.ts with shared utility functions: cn() for Tailwind class merging (clsx + tailwind-merge), formatFileSize(), formatDate() using dayjs with locale
- [ ] T088 [P] Create placeholder shadcn/ui button component in src/renderer/src/components/ui/button.tsx for demo surface
- [ ] T089 Create demos/F001-core-platform.md with step-by-step demo script: 1) pnpm dev → window appears, 2) theme toggle Light/Dark/System, 3) language switch, 4) file upload via dialog, 5) minimize to tray → restore, 6) open mini window, 7) global shortcut test, 8) restart → verify persistence
- [ ] T090 Run all tests via `pnpm test` and verify all pass. Fix any failures.
- [ ] T091 Run `pnpm dev` end-to-end smoke test verifying all user stories work together: launch → theme → config → file upload → tray → mini window → shortcuts → logging

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1 — App Launch (Phase 3)**: Depends on Phase 2
- **US2 — Config & Theme (Phase 4)**: Depends on Phase 2, benefits from US1 (window exists)
- **US3 — File Storage (Phase 5)**: Depends on Phase 2 (Dexie db.ts)
- **US4 — i18n (Phase 6)**: Depends on Phase 2, benefits from US2 (useAppStore language)
- **US5 — Tray & Mini Window (Phase 7)**: Depends on US1 (MainWindow), US2 (config), US4 (i18n for tray labels)
- **US6 — Shortcuts & Deep Links (Phase 8)**: Depends on US1 (window targets for actions)
- **US7 — Platform Adaptation (Phase 9)**: Depends on US1 (MainWindow to enhance)
- **US8 — Logging & Crash Recovery (Phase 10)**: Depends on US1 (MainWindow webContents), Phase 2 (logger.ts base)
- **Polish (Phase 11)**: Depends on all user stories

### User Story Dependencies

```
Phase 2 (Foundation)
  ├─→ US1 (App Launch)
  │     ├─→ US5 (Tray & Mini Window)
  │     ├─→ US6 (Shortcuts & Deep Links)
  │     ├─→ US7 (Platform Adaptation)
  │     └─→ US8 (Logging & Crash Recovery)
  ├─→ US2 (Config & Theme) ─→ US5 (tray config)
  ├─→ US3 (File Storage)
  └─→ US4 (i18n) ─→ US5 (tray labels)
```

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Types/models before services
- Services before IPC handlers
- IPC handlers before preload wrappers
- Preload before renderer hooks/components

### Parallel Opportunities

- All Phase 1 tasks marked [P] can run in parallel
- All Phase 2 type definition tasks (T009-T012) can run in parallel
- Within each user story, test tasks [P] can run in parallel
- US1, US2, US3, US4 can all start after Phase 2 (US2/US3/US4 are mostly independent of US1)
- US7 and US8 can run in parallel (both only enhance MainWindow)
- All IPC handler files across domains can be developed in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all US1 tests together:
Task T021: "Unit test for MainWindow in tests/unit/main/window/MainWindow.test.ts"
Task T022: "Unit test for bootstrap in tests/unit/main/bootstrap.test.ts"
Task T023: "Unit test for single-instance in tests/unit/main/singleInstance.test.ts"

# Launch parallel IPC handler files:
Task T027: "Window domain IPC handlers in src/main/ipc/window.ipc.ts"
Task T028: "System domain IPC handlers in src/main/ipc/system.ipc.ts"

# Launch parallel preload API files:
Task T031: "window.api.window in src/preload/api/window.ts"
Task T032: "window.api.system in src/preload/api/system.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (App Launch & Shell)
4. **STOP and VALIDATE**: `pnpm dev` → app launches, window appears, state persists
5. Demo-ready: basic Electron shell running

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (App Launch) → `pnpm dev` works (MVP!)
3. US2 (Config & Theme) → Settings persist, theme switching works
4. US3 (File Storage) → File operations functional
5. US4 (i18n) → Multi-language support
6. US5 (Tray & Mini Window) → System tray + Quick Assistant
7. US6 (Shortcuts & Deep Links) → Power user features
8. US7 (Platform Adaptation) → Native platform feel
9. US8 (Logging & Crash Recovery) → Production reliability
10. Polish → Demo script validated, all tests green

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Constitution BP-I requires all tests to pass before implementation is considered complete
- Constitution BP-VI requires demos/F001-core-platform.md to be completed for Demo-Ready Delivery
