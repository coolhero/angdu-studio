# Tasks: App Shell

**Input**: Design documents from `/specs/001-app-shell/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US7)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and build toolchain

- [ ] T001 Create monorepo project structure with pnpm workspaces: `src/main/`, `src/preload/`, `src/renderer/`, `packages/shared/`
- [ ] T002 Initialize electron-vite 5 configuration with rolldown-vite 7: main (single-file, external Node deps), renderer (multi-entry, ESNext), preload
- [ ] T003 [P] Configure TypeScript strict mode: tsconfig.base.json, tsconfig.main.json, tsconfig.preload.json, tsconfig.renderer.json, tsconfig.shared.json
- [ ] T004 [P] Configure Tailwind CSS 4 with `@tailwindcss/vite` plugin and CSS variables (--bg-primary, --text-primary, --sidebar-width, --navbar-height)
- [ ] T005 [P] Configure ESLint + Prettier for TypeScript + React
- [ ] T006 [P] Configure Vitest for unit testing
- [ ] T007 [P] Create `packages/shared/src/IpcChannel.ts` — IPC channel enum with all channel names from contracts/ipc-channels.md
- [ ] T008 [P] Create `packages/shared/src/types/config.ts` — AppConfig, ShortcutConfig, ProxyConfig types from data-model.md
- [ ] T009 [P] Create `packages/shared/src/types/preload.ts` — PreloadAPI interface from data-model.md
- [ ] T010 [P] Create `packages/shared/src/types/index.ts` — barrel export for all shared types

**Checkpoint**: Project builds cleanly with `pnpm build`. All TypeScript compiles without errors.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T011 [US7] Create `src/main/constant.ts` — platform detection: isMac, isWin, isLinux, isDev, isPackaged
- [ ] T012 [US7] Create `src/main/config.ts` — DATA_PATH resolution, default config values, titleBarOverlay config per platform
- [ ] T013 [US7] Create `src/main/bootstrap.ts` — app data directory initialization, create subdirectories if missing
- [ ] T014 [US7] Implement `src/main/services/ConfigManager.ts` — electron-store wrapper with get/set/subscribe/setAndNotify, typed getters (getTheme, getLanguage, getTray, getShortcuts)
- [ ] T015 [US7] Create `src/preload/index.ts` — contextBridge.exposeInMainWorld('api', api) with all PreloadAPI methods mapped to ipcRenderer.invoke
- [ ] T016 [US7] Create `src/main/ipc.ts` — register all IPC handlers using ipcMain.handle, delegate to services
- [ ] T017 [US7] Create `src/main/index.ts` — app entry point skeleton: app.whenReady, bootstrap, create window, register IPC, before-quit handler

**Checkpoint**: Foundation ready — main process starts, preload bridge loaded, IPC functional.

---

## Phase 3: User Story 1 - App Launch and Window Management (Priority: P1) 🎯 MVP

**Goal**: Main window creates with correct platform frame, state persistence, and single-instance enforcement

- [ ] T018 [US1] Implement `src/main/services/WindowService.ts` — createMainWindow(): BrowserWindow with electron-window-state, frameless config per platform (macOS hidden titlebar + trafficLightPosition, Win/Linux frame:false), contextIsolation:true
- [ ] T019 [US1] Implement WindowService.setupMainWindow() — maximize restore, context menu, spell check toggle, navigate event handlers
- [ ] T020 [US1] Implement single instance lock in `src/main/index.ts` — app.requestSingleInstanceLock(), second-instance handler focuses existing window
- [ ] T021 [US1] Implement app activate handler (macOS dock click) — show main window if hidden
- [ ] T022 [US1] Create `src/renderer/index.html` — main window entry point with Vite + React mount point
- [ ] T023 [US1] Create `src/renderer/src/entryPoint.tsx` — React root render with StrictMode

**Checkpoint**: App launches with single-instance enforcement, correct platform frame, window state restored.

---

## Phase 4: User Story 7 - IPC Bridge and Preload (Priority: P1)

**Goal**: All IPC channels work end-to-end between renderer and main process

- [ ] T024 [US7] Wire App_Info IPC handler — returns version, arch, platform, dataPath, isPackaged
- [ ] T025 [P] [US7] Wire Window_* IPC handlers — minimize, maximize, close, isMaximized, setFullScreen, isFullScreen
- [ ] T026 [P] [US7] Wire App lifecycle handlers — App_Reload, App_Quit, App_ClearCache
- [ ] T027 [P] [US7] Wire App_SetProxy handler — 3-mode proxy config (system/custom/direct) via session.setProxy
- [ ] T028 [P] [US7] Wire Open_Website handler — shell.openExternal(url)
- [ ] T029 [US7] Wire App_SaveData broadcast (M→R) in before-quit handler

**Checkpoint**: All IPC channels respond correctly from renderer.

---

## Phase 5: User Story 2 - Mini Window (Priority: P1)

**Goal**: Quick assistant mini window with always-on-top, pin, multi-monitor positioning

- [ ] T030 [US2] Implement WindowService.createMiniWindow() — compact BrowserWindow (always-on-top, panel type on Mac), alwaysOnTop:true
- [ ] T031 [US2] Implement WindowService.showMiniWindow() — position on cursor's current monitor (multi-monitor aware)
- [ ] T032 [US2] Implement WindowService.hideMiniWindow() — platform-specific focus restoration
- [ ] T033 [US2] Implement WindowService.toggleMiniWindow() — show/hide toggle
- [ ] T034 [US2] Implement WindowService.setPinMiniWindow(pinned) — prevent auto-hide on blur when pinned
- [ ] T035 [US2] Implement WindowService.quoteToMainWindow(text) — send text from mini to main
- [ ] T036 [US2] Create `src/renderer/miniWindow.html` — mini window entry point
- [ ] T037 [US2] Wire MiniWindow_* IPC handlers — show, hide, close, toggle, setPin

**Checkpoint**: Mini window toggles via IPC, positions on cursor's monitor, auto-hides on blur, stays visible when pinned.

---

## Phase 6: User Story 3 - System Tray (Priority: P1)

**Goal**: System tray icon with context menu and configurable click behavior

- [ ] T038 [US3] Implement `src/main/services/TrayService.ts` — createTray() with platform-specific icon selection (light/dark for macOS, standard for Win/Linux)
- [ ] T039 [US3] Implement TrayService.updateContextMenu() — menu items: Show Window, Mini Window, Selection Assistant toggle, Quit
- [ ] T040 [US3] Implement TrayService click handler — show main window or mini window based on clickTrayToShowQuickAssistant config
- [ ] T041 [US3] Implement TrayService.watchConfigChanges() — subscribe to tray, language, quickAssistant config changes via ConfigManager
- [ ] T042 [US3] Implement window close behavior in WindowService — tray minimize (if trayOnClose) vs quit, macOS hide behavior

**Checkpoint**: Tray icon visible, right-click shows menu, click toggles window, close-to-tray works.

---

## Phase 7: User Story 4 - Theme Synchronization (Priority: P2)

**Goal**: Dark/light/system theme propagates to all windows with titlebar overlay sync

- [ ] T043 [US4] Implement `src/main/services/ThemeService.ts` — constructor reads initial theme from ConfigManager, subscribes to nativeTheme changes
- [ ] T044 [US4] Implement ThemeService.setTheme() — update nativeTheme.themeSource, broadcast to all windows via IPC
- [ ] T045 [US4] Implement ThemeService.themeUpdatedHandler() — update titleBarOverlay color, send theme-changed event to all renderers
- [ ] T046 [US4] Wire App_SetTheme IPC handler — delegates to ThemeService.setTheme()
- [ ] T047 [US4] Set up Tailwind CSS dark mode — `darkMode: 'class'`, CSS variables for theme colors (--bg-primary, --text-primary, etc.)

**Checkpoint**: Theme toggle propagates to all windows, titlebar overlay color matches.

---

## Phase 8: User Story 5 - Auto-Update (Priority: P2)

**Goal**: Check, download, cancel, and install updates

- [ ] T048 [US5] Implement `src/main/services/AppUpdater.ts` — configure electron-updater, set feed URL based on config channel
- [ ] T049 [US5] Implement AppUpdater.checkForUpdates() — returns {currentVersion, updateInfo}
- [ ] T050 [US5] Implement AppUpdater.quitAndInstall() and cancelDownload()
- [ ] T051 [US5] Wire App_CheckForUpdates, App_DownloadUpdate, App_CancelDownload, App_QuitAndInstall handlers
- [ ] T052 [US5] Implement update progress event (App_UpdateProgress M→R) — emit download percent/speed/transferred/total

**Checkpoint**: Update check returns version info, download emits progress, install triggers app restart.

---

## Phase 9: User Story 6 - Global Shortcuts and Platform (Priority: P2)

**Goal**: Global keyboard shortcuts and platform-specific behaviors

- [ ] T053 [US6] Implement `src/main/services/ShortcutService.ts` — registerShortcuts() from config, unregisterAllShortcuts(), convertShortcutFormat()
- [ ] T054 [US6] Implement focus/blur shortcut handling — keep universal shortcuts on blur (show_app), unregister app-specific on blur
- [ ] T055 [US6] Implement `src/main/services/AppService.ts` — setAppLaunchOnBoot() with platform-specific logic (macOS login items, Windows registry, Linux .desktop)
- [ ] T056 [US6] Implement platform-specific relaunch in ipc.ts — AppImage (APPIMAGE env), Windows portable (PORTABLE_EXECUTABLE_FILE)
- [ ] T057 [US6] Implement `src/main/services/PowerMonitorService.ts` — init() with platform detection (Windows: electron-shutdown-handler, Mac/Linux: powerMonitor)
- [ ] T058 [US6] Implement `src/main/services/AppMenuService.ts` — macOS application menu (About, Edit with clipboard, View, Window, Help)
- [ ] T059 [US6] Implement `src/main/services/ProtocolClient.ts` — register angdustudio:// protocol, handle open-url event (macOS) and second-instance with URL arg (Win/Linux)

**Checkpoint**: Global shortcuts work from any app. Launch on boot toggles correctly. macOS menu present.

---

## Phase 10: User Story 8 + Remaining Features (Priority: P2-P3)

**Goal**: Protocol handler, renderer crash recovery, external links, factory reset, data path migration

- [ ] T060 [US8] Wire protocol URL handling — parse angdustudio:// URLs, dispatch to appropriate handler
- [ ] T061 Implement WindowService.setupWebContentsHandlers() — external links open in system browser (shell.openExternal)
- [ ] T062 Implement WindowService.setupMainWindowMonitor() — crash recovery: reload if > 1min since last crash, log and quit if rapid crashes
- [ ] T063 Implement WindowService.setupWebRequestHeaders() — remove X-Frame-Options/CSP for webview compatibility
- [ ] T064 Implement WindowService.setupWindowEvents() — zoom factor management on resize/restore/navigate
- [ ] T065 Implement prevent-quit guard in ipc.ts — App_SetStopQuitApp sets flag, before-quit checks flag, shows notification if blocked
- [ ] T066 Implement factory reset in ipc.ts — close all data connections, delete data directory, relaunch
- [ ] T067 Implement data path migration — validate write permission, copy with exclusion filters, set new path, relaunch with --new-data-path arg
- [ ] T068 Implement App_MacIsProcessTrusted and App_MacRequestProcessTrust handlers (macOS only)
- [ ] T069 Implement App_GetSystemFonts and App_GetIpCountry handlers

**Checkpoint**: All remaining features work: crash recovery, factory reset, data migration.

---

## Phase 11: Renderer Foundation

**Goal**: React app bootstrap, Zustand stores, i18n, Error Boundary

- [ ] T070 [P] Create `src/renderer/src/App.tsx` — root component with Error Boundary wrapper
- [ ] T071 [P] Implement `src/renderer/src/store/useRuntimeStore.ts` — ephemeral state: windowVisible, updateStatus, isFullScreen
- [ ] T072 [P] Implement `src/renderer/src/store/useSelectionStore.ts` — persisted state: selectedText, selectionHistory (zustand persist)
- [ ] T073 [P] Set up i18n with react-i18next — ko.json (default), en.json, language detection from ConfigManager
- [ ] T074 [P] Create Error Boundary component — catches route-level errors, shows fallback UI, reports to console

**Checkpoint**: Renderer loads with React, Zustand stores initialized, i18n working in Korean.

---

## Phase 12: Polish & Cross-Cutting

**Purpose**: Integration wiring, pattern audit, and demo

- [ ] T075 E2E integration wiring: verify full IPC data flow (renderer → preload → main → service → response → renderer) for all 28 channels
- [ ] T076 Pattern Audit: verify all components comply with Pattern Constraints
  - Zustand selector reference stability (no new array/object per call)
  - DOM measurement with useLayoutEffect (not useEffect)
  - Error Boundary coverage (App.tsx wraps all routes)
  - IPC handler error serialization (all handlers try/catch)
  - Window null-check guards (checkMainWindow before all Window_* handlers)
- [ ] T077 Create demo script `demos/F001-app-shell.sh` — starts Electron app in dev mode, prints usage instructions (window management, tray, shortcuts), keeps running until Ctrl+C. --ci flag: launch, verify window visible, verify tray icon, exit
- [ ] T078 Create demo data/config — demo electron-store config with all features enabled (tray, shortcuts, auto-update)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 Window (Phase 3)**: Depends on Phase 2
- **US7 IPC (Phase 4)**: Depends on Phase 2 + Phase 3 (needs window for some handlers)
- **US2 Mini Window (Phase 5)**: Depends on Phase 3 (WindowService)
- **US3 Tray (Phase 6)**: Depends on Phase 3 + Phase 5 (references both windows)
- **US4 Theme (Phase 7)**: Depends on Phase 2 (ConfigManager)
- **US5 Update (Phase 8)**: Depends on Phase 2 (ConfigManager)
- **US6 Shortcuts (Phase 9)**: Depends on Phase 3 (main window reference)
- **US8 + Others (Phase 10)**: Depends on Phases 3-6
- **Renderer (Phase 11)**: Depends on Phase 1 (build setup), can run in parallel with Phases 7-10
- **Polish (Phase 12)**: Depends on all previous phases

### Parallel Opportunities

- T003, T004, T005, T006 can run in parallel (different config files)
- T007, T008, T009, T010 can run in parallel (different shared types)
- T025, T026, T027, T028 can run in parallel (different IPC handlers)
- T070, T071, T072, T073, T074 can run in parallel (different renderer files)
- Phases 7, 8, 9 can run in parallel (independent services)
