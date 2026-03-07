# Tasks: App Core

**Input**: Design documents from `/specs/001-app-core/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/ipc-channels.md, research.md

**Tests**: Constitution requires Test-First approach. Tests are included before implementation tasks.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US10)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Scaffold the Electron + React 19 project with all tooling configured.

- [x] T001 Initialize electron-vite project with SWC and TypeScript strict mode in project root
- [x] T002 Configure Tailwind CSS 4 with `@theme` directive and CSS variables in `src/renderer/src/app.css`
- [x] T003 [P] Install and configure shadcn/ui with `cn()` utility in `src/renderer/src/lib/cn.ts`
- [x] T004 [P] Configure Vitest for unit/integration tests in `vitest.config.ts`
- [x] T005 [P] Configure Playwright for E2E tests in `playwright.config.ts`
- [x] T006 [P] Configure ESLint and Prettier in project root
- [x] T007 [P] Create `.env.example` with all F001 environment variables
- [x] T008 Copy static resources (icons, tray images, NSIS script) from source to `build/` and `resources/angdu-studio/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, IPC infrastructure, and logging that ALL user stories depend on.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T009 Define IPC channel enum with all 36 channel names in `src/shared/IpcChannel.ts`
- [x] T010 [P] Define config key types and Zod schemas in `src/shared/types/config.ts`
- [x] T011 [P] Define WindowState type and Zod schema in `src/shared/types/window.ts`
- [x] T012 [P] Define Shortcut type and Zod schema in `src/shared/types/shortcut.ts`
- [x] T013 [P] Define Theme types (mode, resolved) in `src/shared/types/theme.ts`
- [x] T014 [P] Define app constants (defaults, limits) in `src/shared/constants.ts`
- [x] T015 Write unit test for LoggerService (structured JSON output, module filter, level filter) in `tests/unit/services/LoggerService.test.ts`
- [x] T016 Implement LoggerService with Winston, daily rotation, and module-level filters in `src/main/services/LoggerService.ts`
- [x] T017 Write unit test for ConfigManager (get/set, observer, defaults, corrupted fallback) in `tests/unit/services/ConfigManager.test.ts`
- [x] T018 Implement ConfigManager wrapping electron-store with observer pattern in `src/main/services/ConfigManager.ts`

**Checkpoint**: Foundation ready — shared types, logging, and config persistence are functional.

---

## Phase 3: User Story 1 - App Launch and Initialization (Priority: P1)

**Goal**: User launches the app; main process initializes, creates window, loads renderer, restores window state.

**Independent Test**: Launch app on each platform and verify window appears within 3s.

### Tests for User Story 1

- [x] T019 [P] [US1] Write unit test for AppService (lifecycle, platform detection, data path) in `tests/unit/services/AppService.test.ts`
- [x] T020 [P] [US1] Write unit test for WindowService (create, restore state, crash recovery) in `tests/unit/services/WindowService.test.ts`
- [x] T021 [P] [US1] Write integration test for app startup IPC flow in `tests/integration/ipc/app-startup.test.ts`

### Implementation for User Story 1

- [x] T022 [P] [US1] Implement AppService (single instance, lifecycle, platform detection, data path) in `src/main/services/AppService.ts`
- [x] T023 [P] [US1] Implement VersionService (version tracking, app info) in `src/main/services/VersionService.ts`
- [x] T024 [US1] Implement WindowService (create window, state persistence, crash recovery <60s) in `src/main/services/WindowService.ts`
- [x] T025 [US1] Implement main process entry point (app.ready, service init, window creation) in `src/main/index.ts`
- [x] T026 [US1] Implement preload bridge with typed contextBridge API in `src/preload/index.ts`
- [x] T027 [US1] Define preload type declarations in `src/preload/preload.d.ts`
- [x] T028 [US1] Implement IPC handler registration hub for app:* and window:* channels in `src/main/ipc.ts`
- [x] T029 [US1] Implement renderer App.tsx root component with basic shell layout in `src/renderer/src/App.tsx`
- [x] T030 [US1] Write E2E test for app launch, window appearance, and state restoration in `tests/e2e/app-launch.spec.ts`

**Checkpoint**: App launches, creates window, restores state, preload bridge works. US1 independently functional.

---

## Phase 4: User Story 2 - Configuration Persistence (Priority: P1)

**Goal**: Settings persist across restarts. Config observers notify subscribers of changes.

**Independent Test**: Change a setting, restart, verify it persisted. Verify observer callback fires.

### Tests for User Story 2

- [x] T031 [P] [US2] Write integration test for config:* IPC channels (get/set/reset round-trip) in `tests/integration/ipc/config-channels.test.ts`

### Implementation for User Story 2

- [x] T032 [US2] Register config:* IPC handlers (get, set, get-all, reset, reset-all) in `src/main/ipc.ts`
- [x] T033 [US2] Implement config:changed event emission from main to renderer in `src/main/ipc.ts`
- [x] T034 [US2] Implement portable mode detection and data path adjustment in `src/main/services/AppService.ts`

**Checkpoint**: Config persists, observers fire, portable mode works. US2 independently functional.

---

## Phase 5: User Story 3 - Theme Switching (Priority: P1)

**Goal**: Theme (Light/Dark/System) applies immediately across all windows with OS sync.

**Independent Test**: Switch themes and verify all windows update within 200ms.

### Tests for User Story 3

- [x] T035 [P] [US3] Write unit test for ThemeService (set theme, OS sync, resolve system theme) in `tests/unit/services/ThemeService.test.ts`
- [x] T036 [P] [US3] Write unit test for useThemeStore (mode/resolved state, setTheme action) in `tests/unit/stores/useThemeStore.test.ts`

### Implementation for User Story 3

- [x] T037 [US3] Implement ThemeService (nativeTheme sync, CSS class toggle, multi-window broadcast) in `src/main/services/ThemeService.ts`
- [x] T038 [US3] Register theme:* IPC handlers (get, set) and theme:changed event in `src/main/ipc.ts`
- [x] T039 [US3] Define Tailwind CSS 4 theme variables with light/dark tokens in `src/renderer/src/app.css`
- [x] T040 [US3] Implement useThemeStore with Zustand (mode, resolved, setTheme) in `src/renderer/src/stores/useThemeStore.ts`
- [x] T041 [US3] Implement useTheme hook (subscribe to theme:changed, apply .dark class) in `src/renderer/src/hooks/useTheme.ts`
- [x] T042 [US3] Integrate theme provider in App.tsx (apply theme on mount, listen for changes) in `src/renderer/src/App.tsx`

**Checkpoint**: Theme switching works across windows with OS sync. US3 independently functional.

---

## Phase 6: User Story 4 - IPC Communication Bridge (Priority: P1)

**Goal**: Typed IPC invoke from renderer, typed handle in main. Error handling for invalid channels.

**Independent Test**: Invoke IPC channels from renderer, verify correct typed responses.

### Tests for User Story 4

- [x] T043 [P] [US4] Write unit test for useIpc hook (typed invoke, error handling) in `tests/unit/hooks/useIpc.test.ts`
- [x] T044 [P] [US4] Write integration test for system:* and open:* IPC channels in `tests/integration/ipc/system-channels.test.ts`

### Implementation for User Story 4

- [x] T045 [US4] Implement useIpc hook (typed wrapper for ipcRenderer.invoke) in `src/renderer/src/hooks/useIpc.ts`
- [x] T046 [US4] Register system:* IPC handlers (info, clipboard, screens, device type) in `src/main/ipc.ts`
- [x] T047 [US4] Register open:* IPC handlers (url, path) in `src/main/ipc.ts`
- [x] T048 [US4] Implement useAppStore with Zustand (version, platform, dataPath, isPortable) in `src/renderer/src/stores/useAppStore.ts`

**Checkpoint**: All IPC channels typed and functional. US4 independently functional.

---

## Phase 7: User Story 5 - System Tray and Window Management (Priority: P2)

**Goal**: Tray icon with context menu. Show/hide window from tray. Platform-specific icons.

**Independent Test**: Minimize to tray, restore from tray menu.

### Tests for User Story 5

- [x] T049 [P] [US5] Write unit test for TrayService (create, menu items, platform icons) in `tests/unit/services/TrayService.test.ts`

### Implementation for User Story 5

- [x] T050 [US5] Implement TrayService (create tray, context menu, platform-specific icons) in `src/main/services/TrayService.ts`
- [x] T051 [US5] Wire TrayService into app initialization and WindowService show/hide in `src/main/index.ts`

**Checkpoint**: Tray works on all platforms. US5 independently functional.

---

## Phase 8: User Story 6 - Global Shortcuts and Launch on Boot (Priority: P2)

**Goal**: Global shortcuts fire when unfocused. Per-shortcut enable/disable. Launch on boot.

**Independent Test**: Register shortcut, switch apps, press shortcut — action fires.

### Tests for User Story 6

- [x] T052 [P] [US6] Write unit test for ShortcutService (register, unregister, enable/disable, last-write-wins) in `tests/unit/services/ShortcutService.test.ts`

### Implementation for User Story 6

- [x] T053 [US6] Implement ShortcutService (register, unregister, enable/disable, last-write-wins) in `src/main/services/ShortcutService.ts`
- [x] T054 [US6] Wire launch-on-boot via app:set-launch-on-boot IPC in `src/main/services/AppService.ts`

**Checkpoint**: Shortcuts and boot config work. US6 independently functional.

---

## Phase 9: User Story 7 - Proxy Configuration (Priority: P2)

**Goal**: HTTP/HTTPS/SOCKS proxy routes all outbound requests. Local address bypass.

**Independent Test**: Configure proxy, verify outbound request routes through it.

### Tests for User Story 7

- [x] T055 [P] [US7] Write unit test for ProxyManager (set proxy, bypass rules, mode switching) in `tests/unit/services/ProxyManager.test.ts`

### Implementation for User Story 7

- [x] T056 [US7] Implement ProxyManager (system/fixed/direct modes, bypass for local) in `src/main/services/ProxyManager.ts`
- [x] T057 [US7] Register app:set-proxy and app:get-proxy IPC handlers in `src/main/ipc.ts`

**Checkpoint**: Proxy configuration works. US7 independently functional.

---

## Phase 10: User Story 8 - Logging, Notifications, Context Menus, Version (Priority: P2)

**Goal**: Structured logging, desktop notifications, right-click menus, version info.

**Independent Test**: Trigger log and verify structured output. Send notification.

### Tests for User Story 8

- [x] T058 [P] [US8] Write unit test for NotificationService in `tests/unit/services/NotificationService.test.ts`
- [x] T059 [P] [US8] Write unit test for ContextMenuService in `tests/unit/services/ContextMenuService.test.ts`

### Implementation for User Story 8

- [x] T060 [US8] Implement NotificationService (desktop notifications for background events) in `src/main/services/NotificationService.ts`
- [x] T061 [US8] Implement ContextMenuService (right-click with Cut/Copy/Paste/SelectAll) in `src/main/services/ContextMenuService.ts`
- [x] T062 [US8] Wire NotificationService and ContextMenuService into app initialization in `src/main/index.ts`

**Checkpoint**: Logging, notifications, context menus, version all work. US8 independently functional.

---

## Phase 11: User Story 9 - Zustand Store Sync Across Windows (Priority: P2)

**Goal**: State changes in one window sync to all others via BroadcastChannel.

**Independent Test**: Open two windows, change state in one, verify other reflects change.

### Tests for User Story 9

- [x] T063 [P] [US9] Write unit test for zustand-sync middleware (broadcast, receive, initial state) in `tests/unit/lib/zustand-sync.test.ts`

### Implementation for User Story 9

- [x] T064 [US9] Implement BroadcastChannel-based Zustand sync middleware in `src/renderer/src/lib/zustand-sync.ts`
- [x] T065 [US9] Implement ZustandSyncService in main process (coordinate sync for new windows) in `src/main/services/ZustandSyncService.ts`
- [x] T066 [US9] Apply sync middleware to useThemeStore and useAppStore in `src/renderer/src/stores/`

**Checkpoint**: Cross-window sync works. US9 independently functional.

---

## Phase 12: User Story 10 - Power Monitor and Cache (Priority: P3)

**Goal**: Pause/resume background tasks on sleep/wake. LRU cache service.

**Independent Test**: Trigger suspend event, verify tasks pause. Test cache eviction.

### Tests for User Story 10

- [x] T067 [P] [US10] Write unit test for PowerMonitorService in `tests/unit/services/PowerMonitorService.test.ts`
- [x] T068 [P] [US10] Write unit test for CacheService (get/set/evict LRU) in `tests/unit/services/CacheService.test.ts`

### Implementation for User Story 10

- [x] T069 [US10] Implement PowerMonitorService (suspend/resume event handlers) in `src/main/services/PowerMonitorService.ts`
- [x] T070 [US10] Implement CacheService (in-memory LRU with configurable capacity) in `src/main/services/CacheService.ts`
- [x] T071 [US10] Wire PowerMonitorService and CacheService into app initialization in `src/main/index.ts`

**Checkpoint**: Power monitor and cache work. US10 independently functional.

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: Integration, cleanup, and final verification across all user stories.

- [x] T072 [P] Run full Vitest test suite and fix any failures
- [x] T073 [P] Run ESLint/Prettier and fix all violations
- [x] T074 Write comprehensive E2E test covering multi-story flows in `tests/e2e/app-core-integration.spec.ts`
- [x] T075 Verify app builds for all platforms (electron-builder)
- [x] T076 Update quickstart.md with final verification steps in `specs/001-app-core/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — first story to implement (app must launch)
- **US2 (Phase 4)**: Depends on US1 (needs running app to test config)
- **US3 (Phase 5)**: Depends on US1 (needs window), US2 (needs config for theme persistence)
- **US4 (Phase 6)**: Depends on US1 (needs preload bridge)
- **US5-US10 (Phases 7-12)**: Depend on US1 + US4 (need running app with IPC). Can run in parallel after that.
- **Polish (Phase 13)**: Depends on all user stories

### User Story Dependencies

- **US1 (P1)**: Foundation — must complete first
- **US2 (P1)**: Depends on US1
- **US3 (P1)**: Depends on US1, US2
- **US4 (P1)**: Depends on US1
- **US5-US8 (P2)**: Can start after US1+US4, run in parallel
- **US9 (P2)**: Can start after US3 (needs theme store to test sync)
- **US10 (P3)**: Can start after US1

### Parallel Opportunities

After US1+US2+US3+US4 complete:
- US5 (Tray), US6 (Shortcuts), US7 (Proxy), US8 (Notifications) can all run in parallel
- US9 (Sync) can run after US3
- US10 (Power/Cache) can run independently

---

## Implementation Strategy

### MVP First (User Stories 1-4)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (types, logging, config)
3. Complete Phase 3: US1 — App launches with window
4. Complete Phase 4: US2 — Config persists
5. Complete Phase 5: US3 — Theme switching
6. Complete Phase 6: US4 — Full IPC bridge
7. **STOP and VALIDATE**: App launches, persists config, switches themes, IPC works

### Incremental Delivery

After MVP:
8. Add US5-US8 in parallel → Tray, shortcuts, proxy, notifications
9. Add US9 → Cross-window sync
10. Add US10 → Power monitor, cache
11. Polish phase → Full test suite, build verification
