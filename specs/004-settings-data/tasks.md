# Tasks: Settings & Data Management

**Input**: Design documents from `/specs/004-settings-data/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/ipc-channels.md, research.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared type definitions and new dependencies required by F004

- [x] T001 Install F004 dependencies: `npm install webdav @aws-sdk/client-s3 archiver adm-zip && npm install -D @types/archiver @types/adm-zip`
- [x] T002 Create shared settings types (SettingsState, BackupConfig, MiniApp, Shortcut, QuickPhrase, SidebarIcon, FileType, FileMetadata, SendMessageShortcut, ProxyMode, ThemeMode, TopicPosition, WindowStyle, BackupFileInfo, DirectoryEntry, WebDavConfig, S3Config) in `src/shared/types/settings.ts`
- [x] T003 Add Dexie schema migration for `files` table (`id, type, created_at`) to existing F003 database in `src/renderer/src/db/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core stores and main-process services that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Implement useSettingsStore with all fields (general, proxy, display, behavior, provider-specific), defaults, and persist middleware via electron-store IPC adapter in `src/renderer/src/stores/useSettingsStore.ts`
- [x] T005 [P] Implement useBackupStore with WebDAV config, S3 config, backup state fields, and persist middleware in `src/renderer/src/stores/useBackupStore.ts`
- [x] T006 [P] Implement useMiniAppsStore with CRUD operations (add, update, remove, reorder) and persist middleware in `src/renderer/src/stores/useMiniAppsStore.ts`
- [x] T007 [P] Implement useShortcutsStore with default shortcuts, update/reset operations, conflict detection, and persist middleware in `src/renderer/src/stores/useShortcutsStore.ts`
- [x] T008 Implement FileStorageService singleton with file upload, read, delete, rename, move, download from URL, base64/binary image conversion, directory listing, and show-in-folder in `src/main/services/FileStorageService.ts`
- [x] T009 [P] Implement BackupService singleton with archive creation (ZIP with stores + Dexie export + files), validation, and restoration logic in `src/main/services/BackupService.ts`
- [x] T010 [P] Implement WebDavService singleton with connection test, upload, download, list, and delete operations using `webdav` npm package in `src/main/services/WebDavService.ts`
- [x] T011 [P] Implement S3Service singleton with connection test, upload, download, list, and delete operations using `@aws-sdk/client-s3` in `src/main/services/S3Service.ts`
- [x] T012 Implement IPC handlers for all file:* channels (upload, read, delete, rename, move, download, base64Image, binaryImage, saveBase64Image, select, selectFolder, listDirectory, showInFolder, and remaining 22 channels) in `src/main/ipc/file-handlers.ts`
- [x] T013 Implement IPC handlers for all backup:* channels (backupToLocalDir, restoreFromLocalBackup, listLocalBackupFiles, deleteLocalBackupFile, checkConnection, backupToWebdav, restoreFromWebdav, listWebdavFiles, deleteWebdavFile, checkS3Connection, backupToS3, restoreFromS3, listS3Files, deleteS3File) plus backup-progress/restore-progress event channels in `src/main/ipc/backup-handlers.ts`
- [x] T014 Register file-handlers and backup-handlers in the main process IPC initialization (update existing `src/main/ipc/index.ts` or equivalent)
- [x] T015 [P] Implement useFileManager hook for file CRUD operations via IPC (upload, read, delete, rename, move, download, list) in `src/renderer/src/hooks/useFileManager.ts`
- [x] T016 [P] Implement useBackup hook with backup/restore operations, progress tracking via backup-progress/restore-progress events, and error handling in `src/renderer/src/hooks/useBackup.ts`

**Checkpoint**: Foundation ready — all stores, services, IPC handlers, and hooks are in place

---

## Phase 3: User Story 1 — Application Settings Management (Priority: P1) 🎯 MVP

**Goal**: User opens settings, changes preferences across categories, and all changes take effect immediately and persist across restarts.

**Independent Test**: Open settings, change language/font/theme/proxy/shortcut/launch settings, restart app, verify all persisted.

### Implementation for User Story 1

- [x] T017 [P] [US1] Create SettingItem component (reusable label+control row) in `src/renderer/src/components/settings/SettingItem.tsx`
- [x] T018 [P] [US1] Create SettingSection component (collapsible section wrapper) in `src/renderer/src/components/settings/SettingSection.tsx`
- [x] T019 [P] [US1] Create ColorPicker component for theme primary color selection in `src/renderer/src/components/settings/ColorPicker.tsx`
- [x] T020 [US1] Create SettingsPage with tabbed navigation (General, Display, Data, Shortcuts, Quick Phrases, About) and ErrorBoundary wrapper in `src/renderer/src/pages/settings/SettingsPage.tsx`
- [x] T021 [US1] Create GeneralSettings tab with language selector (ko/en with i18next), send message shortcut selector (Enter/Shift+Enter/Ctrl+Enter/Command+Enter/Alt+Enter), proxy mode (system/custom/none) with URL input, launch on boot toggle, and launch to tray toggle — all bound directly to useSettingsStore in `src/renderer/src/pages/settings/GeneralSettings.tsx`
- [x] T022 [US1] Create DisplaySettings tab with theme mode (dark/light/auto), font size slider (10-24), font family input, code font family input, primary color picker, message divider toggle, topic position (left/right), and window style selector — all bound to useSettingsStore in `src/renderer/src/pages/settings/DisplaySettings.tsx`
- [x] T023 [US1] Create AboutSettings tab with app name (Angdu Studio), version, and links in `src/renderer/src/pages/settings/AboutSettings.tsx`
- [x] T024 [US1] Add i18n keys for all settings labels in `src/renderer/src/i18n/locales/ko.json` and `src/renderer/src/i18n/locales/en.json` (settings.general.*, settings.display.*, settings.data.*, settings.shortcuts.*, settings.quickPhrases.*, settings.about.*)
- [x] T025 [US1] Integrate SettingsPage into app navigation — add settings route and sidebar entry (update existing router and sidebar components)

**Checkpoint**: User Story 1 complete — settings UI is functional with immediate persistence

---

## Phase 4: User Story 2 — Backup and Restore (Priority: P1)

**Goal**: User creates backups to local/WebDAV/S3 targets, tests connections, lists/deletes backups, and restores from any backup.

**Independent Test**: Create backup → modify state → restore → verify data integrity. Test WebDAV/S3 connection test.

### Implementation for User Story 2

- [x] T026 [P] [US2] Create BackupCard component (backup target card with backup/restore/list/delete actions and progress indicator) in `src/renderer/src/components/settings/BackupCard.tsx`
- [x] T027 [US2] Create DataSettings tab with local backup card, WebDAV backup card (with credentials form and test connection using react-hook-form + zod), S3 backup card (with credentials form and test connection using react-hook-form + zod), backup file list, restore button, and data directory display — bound to useBackupStore and useBackup hook in `src/renderer/src/pages/settings/DataSettings.tsx`

**Checkpoint**: User Story 2 complete — backup/restore works across all three targets

---

## Phase 5: User Story 3 — File Management (Priority: P1)

**Goal**: User uploads, browses, renames, moves, and deletes files with metadata tracking.

**Independent Test**: Upload file → verify in list → rename → move → delete → confirm cleanup.

### Implementation for User Story 3

- [x] T028 [P] [US3] Create FileListItem component (file row with name, size, type, date, and action buttons: rename, move, delete, show-in-folder) in `src/renderer/src/components/settings/FileListItem.tsx`
- [x] T029 [US3] Create FilesPage with file browser (list view with type/date filtering, upload button via file:select, download from URL input, directory navigation) and ErrorBoundary wrapper — bound to useFileManager hook in `src/renderer/src/pages/files/FilesPage.tsx`
- [x] T030 [US3] Integrate FilesPage into app navigation — add files route and sidebar entry

**Checkpoint**: User Story 3 complete — file management is fully functional

---

## Phase 6: User Story 4 — Mini App Management (Priority: P2)

**Goal**: User adds web apps as mini apps, views them in embedded webview, reorders and removes them.

**Independent Test**: Add mini app with URL → verify renders → edit properties → reorder → delete.

### Implementation for User Story 4

- [x] T031 [US4] Create MinAppsPage with mini app grid/list, add dialog (name, URL, icon), edit/delete actions, drag-and-drop reordering via @hello-pangea/dnd, and ErrorBoundary wrapper — bound to useMiniAppsStore in `src/renderer/src/pages/minapps/MinAppsPage.tsx`
- [x] T032 [US4] Create MinAppPage with embedded webview for individual mini app rendering in `src/renderer/src/pages/minapps/MinAppPage.tsx`
- [x] T033 [US4] Integrate MinAppsPage and MinAppPage into app navigation — add minapps route and sidebar entry

**Checkpoint**: User Story 4 complete — mini apps CRUD and webview rendering work

---

## Phase 7: User Story 5 — Keyboard Shortcut Configuration (Priority: P2)

**Goal**: User views, reassigns, and manages keyboard shortcuts with conflict detection.

**Independent Test**: View shortcuts → reassign one → trigger conflict → resolve → verify binding works.

### Implementation for User Story 5

- [x] T034 [P] [US5] Create ShortcutCapture component (key combination input that captures keystrokes and displays formatted key combo) in `src/renderer/src/components/settings/ShortcutCapture.tsx`
- [x] T035 [US5] Create ShortcutSettings tab with shortcut table (action name, current binding, edit button), ShortcutCapture for reassignment, conflict detection warning dialog, and reset-to-defaults button — bound to useShortcutsStore in `src/renderer/src/pages/settings/ShortcutSettings.tsx`

**Checkpoint**: User Story 5 complete — shortcut configuration with conflict detection works

---

## Phase 8: User Story 6 — Quick Phrase Management (Priority: P2)

**Goal**: User creates, edits, and deletes quick phrases for rapid chat insertion.

**Independent Test**: Create phrase → insert into chat → edit → delete → verify list updates.

### Implementation for User Story 6

- [x] T036 [US6] Create QuickPhraseSettings tab with phrase list (label + text preview), add/edit dialog, delete confirmation, and drag-and-drop reordering — bound to useSettingsStore.quickPhrases in `src/renderer/src/pages/settings/QuickPhraseSettings.tsx`

**Checkpoint**: User Story 6 complete — quick phrase CRUD works

---

## Phase 9: User Story 7 — Sidebar Customization (Priority: P2)

**Goal**: User toggles sidebar icon visibility and reorders them.

**Independent Test**: Toggle icon off → verify hidden in sidebar → reorder → verify new order persists.

### Implementation for User Story 7

- [x] T037 [US7] Add sidebar icon configuration section to DisplaySettings with visibility toggles and drag-and-drop reordering for sidebarIcons array — bound to useSettingsStore.sidebarIcons in `src/renderer/src/pages/settings/DisplaySettings.tsx` (extend existing file from T022)

**Checkpoint**: User Story 7 complete — sidebar icon customization works

---

## Phase 10: User Story 8 — App Data Directory Migration (Priority: P2)

**Goal**: User changes app data directory, data is copied to new location, app restarts using new path.

**Independent Test**: Change data directory → verify copy progress → restart → verify all data accessible from new location.

### Implementation for User Story 8

- [x] T038 [US8] Add data directory migration section to DataSettings with current path display, "Change Directory" button (file:selectFolder), confirmation dialog (old/new paths), progress indicator, and error handling — bound to BackupService data migration logic via IPC in `src/renderer/src/pages/settings/DataSettings.tsx` (extend existing file from T027)

**Checkpoint**: User Story 8 complete — data directory migration works with progress tracking

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Integration, demo, pattern audit, and cross-cutting improvements

- [x] T039 Pattern Audit: verify all components comply with Pattern Constraints — check Zustand selector reference stability (no new array/object per call, use raw state + useMemo), Error Boundary coverage (SettingsPage, MinAppsPage, FilesPage), IPC payload structured-cloneability, and batch state updates in event handlers
- [ ] T040 [P] Integration smoke test: mount SettingsPage, MinAppsPage, and FilesPage with real store state — verify renders without infinite loops, console errors, or layout flicker in `tests/integration/settings-ui.test.ts`
- [ ] T041 [P] Unit tests for stores: useSettingsStore (defaults, persistence, field updates), useBackupStore (config CRUD), useMiniAppsStore (CRUD + reorder), useShortcutsStore (CRUD + conflict detection) in `tests/unit/stores/useSettingsStore.test.ts`, `tests/unit/stores/useBackupStore.test.ts`, `tests/unit/stores/useMiniAppsStore.test.ts`, `tests/unit/stores/useShortcutsStore.test.ts`
- [ ] T042 [P] Unit tests for services: FileStorageService (upload, read, delete, rename, move, image conversion), BackupService (archive creation, validation, restore) in `tests/unit/services/FileStorageService.test.ts`, `tests/unit/services/BackupService.test.ts`
- [ ] T043 [P] Integration tests: backup-restore round-trip (create backup → modify state → restore → verify), file-operations (upload → rename → move → delete) in `tests/integration/backup-restore.test.ts`, `tests/integration/file-operations.test.ts`
- [ ] T044 Create demo script that opens settings, changes language, modifies display settings, creates a local backup, and shows file management in `demos/F004-settings-data.sh`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **User Stories (Phases 3–10)**: All depend on Phase 2 completion
  - US1 (Settings Management) should be first — provides the UI container for other stories
  - US2 (Backup/Restore), US3 (File Management), US4 (Mini Apps) can proceed in parallel after US1
  - US5 (Shortcuts), US6 (Quick Phrases), US7 (Sidebar) can proceed in parallel after US1
  - US8 (Data Migration) depends on US2 (DataSettings page exists)
- **Polish (Phase 11)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: No dependencies on other stories — provides SettingsPage shell
- **US2 (P1)**: Depends on US1 (DataSettings tab needs SettingsPage) — can extend existing DataSettings
- **US3 (P1)**: Independent page (FilesPage) — only needs Phase 2 foundation
- **US4 (P2)**: Independent page (MinAppsPage) — only needs Phase 2 foundation
- **US5 (P2)**: Depends on US1 (ShortcutSettings tab needs SettingsPage)
- **US6 (P2)**: Depends on US1 (QuickPhraseSettings tab needs SettingsPage)
- **US7 (P2)**: Depends on US1 (extends DisplaySettings from US1)
- **US8 (P2)**: Depends on US2 (extends DataSettings from US2)

### Within Each User Story

- Components before pages (parallel where possible)
- Pages bind to stores/hooks from Phase 2
- Integration with navigation comes last

### Parallel Opportunities

- Phase 2: T005, T006, T007 can run in parallel (independent stores)
- Phase 2: T009, T010, T011 can run in parallel (independent services)
- Phase 2: T015, T016 can run in parallel (independent hooks)
- Phase 3: T017, T018, T019 can run in parallel (independent components)
- After US1: US2, US3, US4 can run in parallel
- After US1: US5, US6, US7 can run in parallel
- Phase 11: T040, T041, T042, T043 can all run in parallel

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch all independent stores together:
Task T005: "Implement useBackupStore in src/renderer/src/stores/useBackupStore.ts"
Task T006: "Implement useMiniAppsStore in src/renderer/src/stores/useMiniAppsStore.ts"
Task T007: "Implement useShortcutsStore in src/renderer/src/stores/useShortcutsStore.ts"

# Launch all independent services together:
Task T009: "Implement BackupService in src/main/services/BackupService.ts"
Task T010: "Implement WebDavService in src/main/services/WebDavService.ts"
Task T011: "Implement S3Service in src/main/services/S3Service.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types + dependencies)
2. Complete Phase 2: Foundational (stores + services + IPC + hooks)
3. Complete Phase 3: User Story 1 (Settings pages)
4. **STOP and VALIDATE**: Test settings persistence independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Settings Management) → MVP — settings work
3. Add US2 (Backup/Restore) → Data protection works
4. Add US3 (File Management) → File browser works
5. Add US4-US8 → All P2 features complete
6. Polish → Tests, demo, pattern audit

### Parallel Team Strategy

With multiple developers after Phase 2:
- Developer A: US1 (Settings pages) → US5 (Shortcuts) → US7 (Sidebar)
- Developer B: US2 (Backup) → US8 (Data Migration)
- Developer C: US3 (Files) → US4 (Mini Apps) → US6 (Quick Phrases)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Zustand selectors: ALWAYS select raw state + derive in component with useMemo — NEVER create new objects/arrays in selectors
- Error Boundary: MUST wrap SettingsPage, MinAppsPage, FilesPage
- IPC payloads: MUST be structured-cloneable (no functions, class instances, circular refs)
