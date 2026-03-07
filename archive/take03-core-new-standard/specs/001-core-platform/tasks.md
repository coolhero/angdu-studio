# Tasks: Core Platform

**Input**: Design documents from `/specs/001-core-platform/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/ipc-channels.md

**Tests**: Tests are included per Constitution Principle XIV (Test-First).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Project initialization and monorepo structure

- [X] T001 Initialize Electron project with electron-vite 5, pnpm workspace, TypeScript 5.8 config in `package.json`, `tsconfig.json`, `electron.vite.config.ts`
- [X] T002 [P] Create `packages/shared/IpcChannel.ts` with initial IPC channel enum (App, Config, Window, System domains — ~30 core channels)
- [X] T003 [P] Create shared type definitions in `packages/shared/types/app.ts`, `file.ts`, `config.ts`, `theme.ts` per contracts/ipc-channels.md
- [X] T004 [P] Create `packages/shared/constants.ts` with shared constants (MIN_WINDOW_WIDTH, MIN_WINDOW_HEIGHT, default config values)
- [X] T005 [P] Set up Tailwind CSS 4 configuration with theme CSS variables (light/dark tokens) in `src/renderer/src/assets/styles/globals.css`
- [X] T006 [P] Initialize shadcn/ui base setup with `cn()` utility in `src/renderer/src/lib/utils.ts`
- [X] T007 [P] Set up Vitest configuration in `vitest.config.ts` with path aliases matching electron-vite

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [X] T008 Create Electron main process entry point in `src/main/index.ts` with app.whenReady, single-instance lock, and crash handler skeleton
- [X] T009 Create bootstrap sequence in `src/main/bootstrap.ts` with data directory initialization and platform-specific setup
- [X] T010 Create preload bridge skeleton in `src/preload/index.ts` exposing typed `window.api` object via contextBridge with app and window domains
- [X] T011 Create IPC handler registration hub in `src/main/ipc.ts` mapping IpcChannel enum to handler functions
- [X] T012 [P] Create platform detection utilities in `src/main/utils/platform.ts` (isPortable, isMac, isWindows, isLinux, isWayland, isAppImage)
- [X] T013 [P] Create data path resolution utilities in `src/main/utils/paths.ts` (userData, logs, files — with portable mode support)

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - App Launch and Shell Initialization (Priority: P1)

**Goal**: User launches Cherry Studio; main window appears within 3 seconds with restored state. Single-instance enforced. Crash recovery works.

**Independent Test**: Launch app on each platform, verify window appears with correct dimensions and restored state.

### Tests for User Story 1

- [X] T014 [P] [US1] Write unit test for single-instance lock behavior in `src/main/__tests__/index.test.ts`
- [X] T015 [P] [US1] Write unit test for WindowService (create, restore state, minimize, maximize, close) in `src/main/services/__tests__/WindowService.test.ts`
- [X] T016 [P] [US1] Write unit test for renderer crash recovery logic (>60s reload, <60s exit) in `src/main/services/__tests__/WindowService.crash.test.ts`

### Implementation for User Story 1

- [X] T017 [US1] Implement WindowService in `src/main/services/WindowService.ts` — main window creation with electron-window-state, minimize/maximize/close, state persistence, crash recovery with 60s threshold
- [X] T018 [US1] Implement window IPC handlers in `src/main/handlers/window.ts` — Window_Minimize, Window_Maximize, Window_Unmaximize, Window_Close, Window_IsMaximized, Window_GetSize, Window_SetMinimumSize
- [X] T019 [US1] Implement app IPC handlers in `src/main/handlers/app.ts` — App_Info, App_Quit, App_Reload, App_Relaunch, App_GetPath, App_GetSystemInfo
- [X] T020 [US1] Wire up main process startup sequence in `src/main/index.ts` — bootstrap → config → window → IPC registration, single-instance lock, second-instance handler
- [X] T021 [US1] Create renderer entry point `src/renderer/src/App.tsx` with React root, TanStack Router provider, and basic layout shell
- [X] T022 [US1] Set up TanStack Router with hash history in `src/renderer/src/routes/__root.tsx` and `src/renderer/src/routes/index.tsx` (home placeholder)
- [X] T023 [US1] Extend preload bridge in `src/preload/index.ts` with window domain methods (minimize, maximize, close, isMaximized, getSize, onMaximizedChange)

**Checkpoint**: App launches with main window, state persists, single-instance enforced, crash recovery works

---

## Phase 4: User Story 2 - Configuration Persistence (Priority: P1)

**Goal**: User modifies settings; changes take effect immediately, persist across restarts. Observer pattern notifies subscribers.

**Independent Test**: Change each config key, verify immediate effect, restart, confirm retention. Test corrupted config fallback.

### Tests for User Story 2

- [X] T024 [P] [US2] Write unit test for ConfigManager (get/set, observer subscribe/unsubscribe/notify, defaults, corrupted fallback) in `src/main/services/__tests__/ConfigManager.test.ts`
- [X] T025 [P] [US2] Write unit test for config IPC handlers in `src/main/handlers/__tests__/config.test.ts`

### Implementation for User Story 2

- [X] T026 [US2] Implement ConfigManager in `src/main/services/ConfigManager.ts` — electron-store wrapper with typed ConfigKey enum, get/set, subscribe/unsubscribe/setAndNotify observer pattern, defaults for all keys, corrupted config recovery
- [X] T027 [US2] Implement config IPC handlers in `src/main/handlers/config.ts` — Config_Get, Config_Set with optional notify
- [X] T028 [US2] Create useConfig hook in `src/renderer/src/hooks/useConfig.ts` — read/write config via IPC, local cache with subscription
- [X] T029 [US2] Extend preload bridge with config domain methods in `src/preload/index.ts`
- [X] T030 [US2] Implement proxy configuration handler in `src/main/handlers/app.ts` — App_SetProxy with system/fixed_servers/direct modes (FR-021)
- [X] T031 [US2] Implement hardware acceleration toggle in `src/main/index.ts` — App_SetDisableHardwareAcceleration, requires app restart (FR-022)

**Checkpoint**: All config keys persist across restarts, observer pattern notifies subscribers, corrupted config falls back to defaults

---

## Phase 5: User Story 3 - Theme Switching (Priority: P1)

**Goal**: User switches between Light/Dark/System themes; UI updates within 200ms, no flicker. System mode follows OS.

**Independent Test**: Toggle between all three modes, verify visual update. Change OS theme while System is selected.

### Tests for User Story 3

- [X] T032 [P] [US3] Write unit test for ThemeService (set theme, nativeTheme sync, multi-window broadcast) in `src/main/services/__tests__/ThemeService.test.ts`
- [X] T033 [P] [US3] Write unit test for theme Zustand store and broadcast middleware in `src/renderer/src/stores/__tests__/theme.test.ts`

### Implementation for User Story 3

- [X] T034 [US3] Implement ThemeService in `src/main/services/ThemeService.ts` — set nativeTheme.themeSource, broadcast ThemeChanged IPC to all windows, listen to nativeTheme 'updated' event, title bar overlay color updates
- [X] T035 [US3] Implement theme IPC handlers in `src/main/handlers/app.ts` — App_SetTheme, App_ThemeChanged (M->R push)
- [X] T036 [US3] Create Zustand theme store in `src/renderer/src/stores/theme.ts` — theme mode state, persist middleware, listen for ThemeChanged IPC
- [X] T037 [US3] Create BroadcastChannel sync middleware in `src/renderer/src/stores/middleware/broadcast.ts` — cross-window state synchronization for declared slices
- [X] T038 [US3] Create useTheme hook in `src/renderer/src/hooks/useTheme.ts` — access theme state, toggle theme, apply .dark class to html element
- [X] T039 [US3] Configure Tailwind CSS 4 dark mode with `.dark` class selector and define theme CSS variables in `src/renderer/src/assets/styles/globals.css`
- [X] T040 [US3] Extend preload bridge with theme methods in `src/preload/index.ts` — setTheme, onThemeChanged listener

**Checkpoint**: Theme switches reflect within 200ms, System mode follows OS, multi-window sync works

---

## Phase 6: User Story 4 - File Upload and Storage (Priority: P1)

**Goal**: User uploads files; stored locally with metadata in IndexedDB. CRUD operations, image handling, progress for large files.

**Independent Test**: Upload files of various types/sizes, verify metadata creation, retrieve and delete files.

### Tests for User Story 4

- [X] T041 [P] [US4] Write unit test for FileStorageService (upload, read, write, delete, move, copy, image base64/binary, encoding detection) in `src/main/services/__tests__/FileStorageService.test.ts`
- [X] T042 [P] [US4] Write unit test for Dexie database schema and FileMetadata CRUD in `src/renderer/src/databases/__tests__/index.test.ts`
- [X] T043 [P] [US4] Write unit test for FileWatcherService (start/stop watcher, debounce, stability threshold, retry on error, change event emission) in `src/main/services/__tests__/FileWatcherService.test.ts`

### Implementation for User Story 4

- [X] T044 [US4] Initialize Dexie database in `src/renderer/src/databases/index.ts` — version 1 schema with `files` and `settings` tables, strict transaction durability (FR-015)
- [X] T045 [US4] Implement FileStorageService in `src/main/services/FileStorageService.ts` — upload (with progress for >5MB), read (encoding detection via chardet), write, delete, move, copy, rename, image handling (base64, binary, paste), PDF info extraction
- [X] T046 [US4] Implement file IPC handlers in `src/main/handlers/file.ts` — File_Select, File_Open, File_Save, File_Read, File_Write, File_Upload, File_Delete, File_Copy, File_Move, File_IsTextFile, File_IsDirectory, File_ListDirectory, File_Base64Image, File_BinaryImage, File_SavePastedImage, File_PdfInfo
- [X] T047 [US4] Implement FileWatcherService in `src/main/services/FileWatcherService.ts` — chokidar integration with debounce (1000ms), stability threshold (500ms), retry on error, File_StartWatcher, File_StopWatcher, File_OnChange push (FR-012)
- [X] T048 [US4] Add IPC channels for File domain (~20 channels) to `packages/shared/IpcChannel.ts`
- [X] T049 [US4] Extend preload bridge with file domain methods in `src/preload/index.ts` — select, open, save, read, write, upload, delete, copy, move, isTextFile, isDirectory, listDirectory, base64Image, binaryImage, savePastedImage, startWatcher, stopWatcher, onFileChange
- [X] T050 [US4] Create Zustand app store in `src/renderer/src/stores/app.ts` with persist middleware — app-level state (window info, platform detection results)

**Checkpoint**: File upload/download works for files up to 50MB, FileMetadata in IndexedDB, file watching operational

---

## Phase 7: User Story 5 - Internationalization (Priority: P2)

**Goal**: User switches language; all UI text updates immediately across 10 locales. Date formatting follows locale.

**Independent Test**: Switch between each locale, verify UI text and date formatting update without restart.

### Tests for User Story 5

- [X] T051 [P] [US5] Write unit test for i18next initialization, locale loading, and missing key fallback in `src/renderer/src/i18n/__tests__/index.test.ts`

### Implementation for User Story 5

- [X] T052 [P] [US5] Copy 10 locale JSON files to `src/renderer/src/i18n/locales/` (en-us.json, ko-kr.json, ja-jp.json, ru-ru.json, de-de.json, el-gr.json, es-es.json, fr-fr.json, pt-pt.json, ro-ro.json)
- [X] T053 [US5] Initialize i18next with react-i18next in `src/renderer/src/i18n/index.ts` — JSON resources, language detection (localStorage → navigator → default), saveMissing with logger, English fallback
- [X] T054 [US5] Configure dayjs locale integration in `src/renderer/src/i18n/dayjs.ts` — automatic locale mapping per selected language (FR-008)
- [X] T055 [US5] Implement main process i18n in `src/main/services/locales.ts` — simple t(key) lookup function reading same JSON resources, language change listener from ConfigManager
- [X] T056 [US5] Implement App_SetLanguage IPC handler in `src/main/handlers/app.ts` — update ConfigManager language key, notify main process services (tray, menu)

**Checkpoint**: All 10 locales switch immediately, date formatting follows locale, missing keys fall back to English

---

## Phase 8: User Story 6 - System Tray (Priority: P2)

**Goal**: System tray icon with context menu. Platform-specific icons. Conditional creation based on settings.

**Independent Test**: Enable tray, minimize, verify icon and context menu, click to restore.

### Tests for User Story 6

- [X] T057 [P] [US6] Write unit test for TrayService (conditional creation, context menu, click behavior, language/setting updates) in `src/main/services/__tests__/TrayService.test.ts`

### Implementation for User Story 6

- [X] T058 [US6] Copy tray icon assets from original project to `build/` (tray_icon.png, tray_icon_dark.png, tray_icon_light.png)
- [X] T059 [US6] Implement TrayService in `src/main/services/TrayService.ts` — conditional creation based on config, platform-specific icons (16x16 template on macOS), context menu (Show, Mini Window if enabled, Quit), click handler (show main or mini window), ConfigManager subscriptions for Tray/Language/EnableQuickAssistant
- [X] T060 [US6] Wire TrayService into main process startup in `src/main/index.ts` — initialize after window creation, respect launchToTray config

**Checkpoint**: Tray icon appears when enabled, context menu works, click restores window, updates on language/setting change

---

## Phase 9: User Story 7 - Mini Window (Priority: P2)

**Goal**: Quick Assistant floating window — frameless, always-on-top, auto-hide on blur, pin, multi-monitor centering.

**Independent Test**: Activate via shortcut/tray, verify floating behavior, auto-hide, pin, multi-monitor centering.

### Tests for User Story 7

- [X] T061 [P] [US7] Write unit test for mini window creation, show/hide, pin behavior, multi-monitor centering in `src/main/services/__tests__/WindowService.mini.test.ts`

### Implementation for User Story 7

- [X] T062 [US7] Extend WindowService in `src/main/services/WindowService.ts` — mini window creation (frameless, always-on-top 'floating' level, visible on all workspaces, transparent panel on macOS), show centered on cursor's monitor, auto-hide on blur (unless pinned), resize constraints 350x380 to 1024x768 default 550x400, preload when Quick Assistant enabled
- [X] T063 [US7] Implement mini window IPC handlers in `src/main/handlers/window.ts` — MiniWindow_Show, MiniWindow_Hide, MiniWindow_Close, MiniWindow_Toggle, MiniWindow_SetPin
- [X] T064 [US7] Add MiniWindow IPC channels to `packages/shared/IpcChannel.ts`
- [X] T065 [US7] Extend preload bridge with mini window methods in `src/preload/index.ts` — show, hide, close, toggle, setPin

**Checkpoint**: Mini window appears centered on cursor's monitor, auto-hides, pin works, respects size constraints

---

## Phase 10: User Story 8 - Keyboard Shortcuts (Priority: P2)

**Goal**: Global keyboard shortcuts that work when app is unfocused. Per-shortcut enable/disable.

**Independent Test**: Configure shortcuts, verify they work from another app, disable individual shortcuts.

### Tests for User Story 8

- [X] T066 [P] [US8] Write unit test for ShortcutService (register, unregister, enable/disable, conflict detection) in `src/main/services/__tests__/ShortcutService.test.ts`

### Implementation for User Story 8

- [X] T067 [US8] Implement ShortcutService in `src/main/services/ShortcutService.ts` — register/unregister global shortcuts via electron globalShortcut, per-shortcut enable/disable from config, conflict reporting
- [X] T068 [US8] Implement Shortcuts_Register IPC handler in `src/main/handlers/utility.ts`
- [X] T069 [US8] Extend preload bridge with shortcuts methods in `src/preload/index.ts`

**Checkpoint**: Global shortcuts work when app is unfocused, per-shortcut enable/disable

---

## Phase 11: User Story 9 - Platform-Specific Behavior (Priority: P3)

**Goal**: App adapts to macOS/Windows/Linux — window chrome, portable mode, desktop environment integration.

**Independent Test**: Run on each platform, verify title bar style, portable mode paths, Wayland shortcuts.

### Tests for User Story 9

- [X] T070 [P] [US9] Write unit test for platform-specific window configuration (macOS traffic lights, Windows frameless, Linux system title bar) and portable mode path resolution in `src/main/services/__tests__/WindowService.platform.test.ts`

### Implementation for User Story 9

- [X] T071 [P] [US9] Implement macOS-specific window configuration in `src/main/services/WindowService.ts` — native title bar with traffic lights, dock icon visibility management
- [X] T072 [P] [US9] Implement Windows-specific window configuration in `src/main/services/WindowService.ts` — frameless window, disabled animations
- [X] T073 [P] [US9] Implement Linux-specific window configuration in `src/main/services/WindowService.ts` — optional system title bar from config, window class/name, Wayland GlobalShortcutsPortal
- [X] T074 [US9] Implement portable mode path resolution in `src/main/utils/paths.ts` — detect PORTABLE_EXECUTABLE_DIR (Windows) and APPIMAGE (Linux), redirect userData paths
- [X] T075 [US9] Implement AppMenuService in `src/main/services/AppMenuService.ts` — macOS-only application menu (About, Edit, View, Window, Help) with dynamic i18n labels and help links (FR-017)

**Checkpoint**: Platform-specific behaviors verified on macOS, Windows, Linux

---

## Phase 12: User Story 10 - Logging and Diagnostics (Priority: P3)

**Goal**: Structured logging with daily rotation. Renderer→main forwarding. Context-scoped entries.

**Independent Test**: Trigger log events, verify files created, rotated, and contain expected entries.

### Tests for User Story 10

- [X] T076 [P] [US10] Write unit test for LoggerService (levels, rotation, context-scoped, renderer forwarding) in `src/main/services/__tests__/LoggerService.test.ts`

### Implementation for User Story 10

- [X] T077 [US10] Implement LoggerService in `src/main/services/LoggerService.ts` — Winston with daily-rotate-file transport (10MB max, 30d general, 60d error), console transport (dev with colors), withContext(module) for scoped logging, CSLOGGER_MAIN_LEVEL env override (FR-014)
- [X] T078 [US10] Implement App_LogToMain IPC handler in `src/main/handlers/app.ts` — receive LogEntry from renderer, forward to LoggerService with source window and module context
- [X] T079 [US10] Extend preload bridge with log forwarding method in `src/preload/index.ts` — logToMain(entry)

**Checkpoint**: Logs created and rotated, renderer forwarding works, context-scoped entries

---

## Phase 13: User Story 11 - Deep Link Protocol (Priority: P3)

**Goal**: cherry-studio:// protocol registered and handled on all platforms.

**Independent Test**: Invoke cherry-studio:// URL from CLI/browser, verify app receives and processes it.

### Tests for User Story 11

- [X] T080 [P] [US11] Write unit test for ProtocolService (URL parsing, validation, routing) in `src/main/services/__tests__/ProtocolService.test.ts`

### Implementation for User Story 11

- [X] T081 [US11] Implement ProtocolService in `src/main/services/ProtocolService.ts` — register cherry-studio:// protocol, parse incoming URLs, route to appropriate handler, handle malformed URLs gracefully (FR-018)
- [X] T082 [US11] Wire protocol handling into single-instance handler in `src/main/index.ts` — second-instance passes URL to ProtocolService, macOS open-url event
- [X] T083 [US11] Implement App_HandleProtocol IPC push (M->R) in `src/main/handlers/app.ts` — forward parsed URL to renderer

**Checkpoint**: Deep links work on all platforms, both running and not-running scenarios

---

## Phase 14: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that span multiple user stories

### Tests for Polish

- [X] T084 [P] Write unit tests for utility IPC handlers (AES encrypt/decrypt, Zip compress/decompress, StoreSync get/set) in `src/main/handlers/__tests__/utility.test.ts`

### Implementation

- [X] T085 [P] Implement utility IPC handlers in `src/main/handlers/utility.ts` — Aes_Encrypt, Aes_Decrypt, Zip_Compress, Zip_Decompress, Open_Url, Open_Path, Notification_Send, Analytics_Track
- [X] T086 [P] Implement system IPC handlers in `src/main/handlers/system.ts` — System_GetDeviceType, System_GetHostname, System_GetCpuName, System_GetPlatform
- [X] T087 [P] Add remaining IPC channels to `packages/shared/IpcChannel.ts` (Utility, System, StoreSync, Analytics, Notification, Open domains)
- [X] T088 [P] Extend preload bridge with utility, system, and store-sync domain methods in `src/preload/index.ts`
- [X] T089 [P] Implement StoreSync IPC handlers in `src/main/handlers/utility.ts` — StoreSync_GetState, StoreSync_SetState, StoreSync_StateChanged push
- [X] T090 [P] Copy static resources from original project — app icons (`build/icon.*`, `build/icons/`), logo (`build/logo.png`), build configs (`build/entitlements.mac.plist`, `build/nsis-installer.nsh`), fonts (`src/renderer/src/assets/fonts/`)
- [X] T091 Create `src/renderer/src/hooks/useIpc.ts` — generic typed IPC invoke hook wrapping window.api calls
- [X] T092 Run full test suite and fix any failures
- [X] T093 Run quickstart.md validation — verify all 7 user story verification steps pass
- [X] T094 Create demo script `demos/F001-core-platform.md` with step-by-step demonstration instructions per Constitution XIX (Demo-Ready Delivery)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational (Phase 2) — No dependencies on other stories
- **US2 (Phase 4)**: Depends on US1 (needs running app shell to test config)
- **US3 (Phase 5)**: Depends on US2 (needs ConfigManager for theme persistence)
- **US4 (Phase 6)**: Depends on US1 (needs running app shell). Independent of US2/US3
- **US5 (Phase 7)**: Depends on US2 (needs ConfigManager for language setting)
- **US6 (Phase 8)**: Depends on US2 + US5 (needs config + i18n for tray menu labels)
- **US7 (Phase 9)**: Depends on US1 (extends WindowService)
- **US8 (Phase 10)**: Depends on US2 (needs config for shortcut storage)
- **US9 (Phase 11)**: Depends on US1 (extends WindowService with platform specifics)
- **US10 (Phase 12)**: Depends on Foundational only (logging is infrastructure)
- **US11 (Phase 13)**: Depends on US1 (needs single-instance handling)
- **Polish (Phase 14)**: Depends on all desired user stories being complete

### Parallel Opportunities

- **Setup**: T002, T003, T004, T005, T006, T007 can all run in parallel
- **Foundational**: T012, T013 can run in parallel
- **After Foundational**: US4, US7, US9, US10, US11 can run in parallel (all depend only on US1/Foundational)
- **Within each story**: All test tasks marked [P] can run in parallel with each other
- **Polish**: T085, T086, T087, T088, T089, T090 can all run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (App Launch)
4. **STOP and VALIDATE**: Launch app, verify window appears with state persistence

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (App Launch) → Running app shell (MVP!)
3. US2 (Config) → Persistent settings
4. US3 (Theme) → Visual theming
5. US4 (Files) → File storage working
6. US5 (i18n) → Multi-language support
7. US6-US8 (Tray + Mini + Shortcuts) → Desktop integration
8. US9-US11 (Platform + Logging + Protocol) → Platform polish
9. Polish → Utilities, static resources, demo

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (Constitution XIV)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
