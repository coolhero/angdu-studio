# Tasks: Settings

**Input**: Design documents from `/specs/003-settings/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create shared type definitions

- [ ] T001 Install i18next, react-i18next, jszip dependencies via pnpm
- [ ] T002 [P] Add shadcn/ui components: Switch, Select, Slider, RadioGroup, AlertDialog, Label, Separator, Tabs (if not already present)
- [ ] T003 [P] Define settings types, Zod schemas, and config key defaults in src/shared/types/settings.ts — includes all F003-owned keys (fontSize, sendKey, messageStyle, avatarStyle, codeBlockTheme, customCSS, launchAtLogin, startMinimized, quickPhrases, shortcuts, backupMaxRetained)
- [ ] T004 [P] Define QuickPhrase and Shortcut types with Zod schemas in src/shared/types/settings.ts
- [ ] T005 [P] Define ExportManifest type in src/shared/types/settings.ts
- [ ] T006 Extend AppConfig type and ConfigService to handle new F003-owned config keys with defaults in src/shared/types/config.ts and src/main/services/ConfigService.ts
- [ ] T007 Add new IPC channel names to shared type definitions in src/shared/types/ipc.ts — data:export, data:import, data:clear, data:getStoragePath, shortcuts:register, shortcuts:unregister, shortcuts:unregisterAll, startup:setLoginItem
- [ ] T008 Extend preload whitelist with new IPC channels in src/preload/index.ts

**Checkpoint**: All types defined, dependencies installed, IPC channels registered

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Zustand stores and main process services that all settings sub-pages depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Create useSettingsStore with hydrate, setSetting (with 300ms debounce for continuous inputs), setTheme, setLanguage, setNavbarPosition, resetAll actions in src/renderer/src/stores/useSettingsStore.ts — selectors MUST return referentially stable values per Pattern Constraints. hydrate() MUST handle corrupted/unreadable config: catch errors, reset to defaults via config:reset, and show a toast notification to the user
- [ ] T010 [P] Create useShortcutsStore with hydrate, updateShortcut, resetToDefaults, startRecording, stopRecording, checkConflict actions in src/renderer/src/stores/useShortcutsStore.ts
- [ ] T011 [P] Create useQuickPhrasesStore with hydrate, addPhrase, updatePhrase, deletePhrase, reorderPhrases, searchPhrases actions in src/renderer/src/stores/useQuickPhrasesStore.ts
- [ ] T012 [P] Create DataService singleton in src/main/services/DataService.ts — handles export (JSZip creation), import (ZIP extraction + schema validation), clear (reset all data)
- [ ] T013 [P] Create ShortcutService singleton in src/main/services/ShortcutService.ts — handles register/unregister global shortcuts via Electron globalShortcut API
- [ ] T014 Create IPC handlers for data channels (data:export, data:import, data:clear, data:getStoragePath) in src/main/ipc/data.ts
- [ ] T015 [P] Create IPC handlers for shortcut channels (shortcuts:register, shortcuts:unregister, shortcuts:unregisterAll) in src/main/ipc/shortcuts.ts
- [ ] T016 [P] Create IPC handler for startup:setLoginItem in src/main/ipc/startup.ts
- [ ] T017 Register all new IPC handlers in src/main/ipc/index.ts
- [ ] T018 Hydrate all 3 stores on app start — call useSettingsStore.hydrate(), useShortcutsStore.hydrate(), useQuickPhrasesStore.hydrate() in src/renderer/src/App.tsx or root component

**Checkpoint**: Foundation ready — stores hydrate, IPC channels respond, services initialized

---

## Phase 3: User Story 1 — Settings Page Navigation and Immediate Preference Changes (Priority: P1) 🎯 MVP

**Goal**: Settings page with sidebar nav, sub-page routing, and immediate-apply behavior for General settings

**Independent Test**: Open settings, switch between sub-pages, change navbar position, verify immediate effect and persistence after restart

### Implementation for User Story 1

- [ ] T019 [P] [US1] Create reusable SettingItem component (label + control layout) in src/renderer/src/components/settings/SettingItem.tsx
- [ ] T020 [P] [US1] Create reusable SettingSection component (title + divider group) in src/renderer/src/components/settings/SettingSection.tsx
- [ ] T021 [US1] Create SettingsSidebar with NavLink items (General, Display, Data, Shortcuts) and active highlighting in src/renderer/src/pages/settings/SettingsSidebar.tsx
- [ ] T022 [US1] Create SettingsPage layout (left sidebar + right Outlet) wrapped with Error Boundary in src/renderer/src/pages/settings/SettingsPage.tsx
- [ ] T023 [US1] Add nested routes for settings: /settings → redirect to /settings/general, /settings/general, /settings/display, /settings/data, /settings/shortcuts in router config
- [ ] T024 [US1] Create GeneralSettings sub-page with: language Select, navbar position RadioGroup (top/left default "top"), send key RadioGroup (Enter/Ctrl+Enter), startup Switches (launch at login, start minimized), proxy Input fields (host, port, auth), auto-update Switch — all wired to useSettingsStore.setSetting() for immediate apply in src/renderer/src/pages/settings/GeneralSettings.tsx
- [ ] T025 [US1] Wire navbar position change to trigger F002 layout switch — useSettingsStore.setNavbarPosition() calls config:set('navbarPosition', value) which F002's useTabsStore reads
- [ ] T026 [US1] Wire startup toggles to startup:setLoginItem IPC in GeneralSettings.tsx
- [ ] T027 [US1] Wire proxy input to config:set('proxyUrl', value) with 300ms debounce in GeneralSettings.tsx
- [ ] T028 [US1] E2E wiring verification: change navbar position in General settings → verify F002 layout switches → verify config:get('navbarPosition') returns new value after restart

**Checkpoint**: Settings page navigable, General settings functional, navbar position toggle works end-to-end

---

## Phase 4: User Story 2 — Theme and Display Customization (Priority: P1)

**Goal**: Display settings with theme, font size, message style, avatar, code theme, and custom CSS — all with instant visual feedback

**Independent Test**: Switch theme to dark, verify full repaint. Adjust font size, verify clamping and text resize.

### Implementation for User Story 2

- [ ] T029 [P] [US2] Create useTheme hook — listens for theme:changed IPC event, toggles 'dark' class on html element, handles 'system' theme by listening to nativeTheme changes in src/renderer/src/hooks/useTheme.ts
- [ ] T030 [US2] Create DisplaySettings sub-page with: theme RadioGroup (light/dark/system, default "light"), font size Slider (12-24, default 14 with clamping), message style RadioGroup (bubble/plain), avatar style RadioGroup with visual preview icons/images per style (default/identicon/initials), code block theme Select populated from a static theme list constant, custom CSS textarea — all wired to useSettingsStore in src/renderer/src/pages/settings/DisplaySettings.tsx
- [ ] T031 [US2] Wire theme change: useSettingsStore.setTheme() → config:set('theme') + theme:set IPC → useTheme hook toggles html dark class — full chain: handler → store → IPC → DOM class → visual repaint
- [ ] T032 [US2] Wire font size change: setSetting('fontSize', value) → apply body.style.fontSize = value + 'px' — full chain: handler → store → DOM style → visual text resize. Debounce slider at 300ms
- [ ] T033 [US2] Wire custom CSS injection: on customCSS change, update style#custom-css element textContent — full chain: handler → store → style element → visual change. Debounce textarea at 300ms
- [ ] T034 [US2] E2E wiring verification: change theme to dark → verify html.classList contains 'dark' → change font size → verify body.style.fontSize → restart app → verify settings persisted

**Checkpoint**: Display settings fully functional, theme switch works end-to-end with correct DOM effects

---

## Phase 5: User Story 3 — Language Selection (Priority: P1)

**Goal**: Language change updates all UI text immediately with i18n fallback

**Independent Test**: Change language to zh-CN, verify all UI text updates. Select missing locale, verify English fallback.

### Implementation for User Story 3

- [ ] T035 [P] [US3] Configure i18next with react-i18next in src/renderer/src/i18n/index.ts — default language 'en', fallback 'en', namespace-based loading
- [ ] T036 [P] [US3] Create English locale file with all settings UI strings in src/renderer/src/i18n/locales/en.json
- [ ] T037 [P] [US3] Create Chinese locale file in src/renderer/src/i18n/locales/zh-CN.json
- [ ] T038 [US3] Wire language change in GeneralSettings: useSettingsStore.setLanguage() → config:set('language') + i18n.changeLanguage() — all rendered text updates via useTranslation() hook
- [ ] T039 [US3] Apply useTranslation() hook to all settings page components (SettingsSidebar, GeneralSettings, DisplaySettings, DataSettings, ShortcutSettings) for i18n text
- [ ] T040 [US3] Verify i18n build config: ensure locale JSON files included in electron-vite build output

**Checkpoint**: Language switching works, all settings text translatable

---

## Phase 6: User Story 4 — Data Export, Import, and Clear (Priority: P1)

**Goal**: Data management with ZIP export, validated import, and confirmed clear

**Independent Test**: Export data, import the exported file, clear data with confirmation.

### Implementation for User Story 4

- [ ] T041 [US4] Create DataSettings sub-page with: Export button, Import button, Clear Data button (with AlertDialog confirmation), storage location display, backup retention config — in src/renderer/src/pages/settings/DataSettings.tsx
- [ ] T042 [US4] Wire Export button: click → data:export IPC → DataService collects config:getAll + creates JSZip → dialog:saveFile → write ZIP (angdu-studio.YYYYMMDDHHmm.zip)
- [ ] T043 [US4] Wire Import button: click → dialog:openFile → data:import IPC → DataService reads ZIP → validates schemaVersion → restores config → shows success/error toast
- [ ] T044 [US4] Wire Clear Data: click → AlertDialog opens → confirm → data:clear IPC → DataService resets all → app:relaunch
- [ ] T045 [US4] Wire storage location display: data:getStoragePath IPC → show path as read-only text
- [ ] T046 [US4] Wire backup retention config: setSetting('backupMaxRetained', value) in DataSettings
- [ ] T047 [US4] Handle import error cases: invalid ZIP format → validation error toast, incompatible schemaVersion → version mismatch warning, partial corruption → no data loss
- [ ] T048 [US4] E2E wiring verification: export data → import the exported ZIP → verify data restored → clear data → confirm dialog → verify app restarts

**Checkpoint**: Data export/import/clear works end-to-end

---

## Phase 7: User Story 5 — Keyboard Shortcut Configuration (Priority: P2)

**Goal**: Shortcut list with recording mode, conflict detection, and reset

**Independent Test**: View shortcuts, record a new combo, trigger a conflict, reset to defaults.

### Implementation for User Story 5

- [ ] T049 [P] [US5] Create useShortcutRecorder hook — manages keydown listener, builds combo string, handles recording lifecycle in src/renderer/src/hooks/useShortcutRecorder.ts
- [ ] T050 [P] [US5] Create ShortcutRecorder component — displays current combo, recording mode UI ("Press keys..."), conflict warning display in src/renderer/src/components/settings/ShortcutRecorder.tsx
- [ ] T051 [US5] Create ShortcutSettings sub-page with: shortcuts list using ShortcutRecorder per entry, Reset to Defaults button — in src/renderer/src/pages/settings/ShortcutSettings.tsx
- [ ] T052 [US5] Wire shortcut recording: click field → startRecording → keydown capture → checkConflict → save or show warning → IPC shortcuts:register/unregister
- [ ] T053 [US5] Wire Reset to Defaults: resetToDefaults → config:set('shortcuts') → IPC shortcuts:unregisterAll + re-register defaults
- [ ] T054 [US5] Handle system shortcut conflicts: warn but allow binding (per spec edge case)

**Checkpoint**: Keyboard shortcut configuration works with recording and conflict detection

---

## Phase 8: User Story 6 — Backup Configuration (Priority: P2)

**Goal**: Backup retention settings

**Independent Test**: Configure backup retention, verify it persists.

### Implementation for User Story 6

- [ ] T055 [US6] Add backup configuration controls to DataSettings.tsx — max retained backups input with validation (min 1). Note: retention count is the only backup config in core scope (cloud backends deferred)
- [ ] T056 [US6] Wire backup config to useSettingsStore.setSetting('backupMaxRetained', value) with persistence

**Checkpoint**: Backup config persists across restarts

---

## Phase 9: User Story 7 — Quick Phrases Management (Priority: P3)

**Goal**: CRUD quick phrases with ordering and search

**Independent Test**: Create a phrase, edit it, reorder, delete, search.

### Implementation for User Story 7

- [ ] T057 [P] [US7] Create QuickPhraseEditor component — CRUD list with add/edit/delete, drag reorder (or manual order), inline editing in src/renderer/src/components/settings/QuickPhraseEditor.tsx
- [ ] T058 [US7] Add Quick Phrases section to settings — integrate QuickPhraseEditor in GeneralSettings or as a separate sub-route
- [ ] T059 [US7] Wire CRUD actions to useQuickPhrasesStore: addPhrase, updatePhrase, deletePhrase, reorderPhrases — each persists via config:set('quickPhrases', JSON.stringify(phrases))
- [ ] T060 [US7] Implement search in QuickPhraseEditor — filter phrases by title/content match

**Checkpoint**: Quick phrases CRUD works with persistence

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Pattern compliance, integration verification, and demo

- [ ] T061 Pattern Audit: verify all components comply with Pattern Constraints from plan.md — check Zustand selector stability (no new objects per call), debounced IPC for slider/textarea, Tailwind dark mode class strategy, useTranslation() hook usage, Zod validation on all new config keys, Error Boundary on SettingsPage
- [ ] T062 Integration smoke test: mount SettingsPage with real store state, verify renders without infinite loops, console errors, or layout flicker
- [ ] T063 Visual fidelity check: compare settings page layout against runtime-exploration observations — verify sidebar nav structure, sub-page content areas, form control spacing
- [ ] T064 E2E integration wiring: verify full data flow for all cross-boundary paths — renderer store → config:set IPC → electron-store persist → config:get IPC → store hydrate. Test with app restart cycle
- [ ] T065 Create demo script demos/F003-settings.sh — launches app, navigates to settings, prints instructions for user to try theme switch, language change, export/import, shortcut recording. --ci mode: quick health check (settings page loads, theme toggles, export works)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Phase 2 completion
  - US1 (settings nav) must complete before US2-US7 (sub-pages depend on layout)
  - US2 (display), US3 (language), US4 (data), US5 (shortcuts) can proceed in parallel after US1
  - US6 (backup config) depends on US4 (DataSettings page)
  - US7 (quick phrases) independent after Phase 2
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: After Phase 2 — creates settings layout that all sub-pages use
- **US2 (P1)**: After US1 — Display sub-page in settings layout
- **US3 (P1)**: After US1 — Language selection in General sub-page + i18n for all pages
- **US4 (P1)**: After US1 — Data sub-page in settings layout
- **US5 (P2)**: After US1 — Shortcuts sub-page in settings layout
- **US6 (P2)**: After US4 — Backup config in Data sub-page
- **US7 (P3)**: After US1 — Quick phrases in settings

### Parallel Opportunities

- T002, T003, T004, T005 in Phase 1 (different files)
- T010, T011, T012, T013, T015, T016 in Phase 2 (different stores/services)
- T019, T020 in US1 (different components)
- T029 in US2, T035-T037 in US3 (independent hooks/files)
- T049, T050 in US5, T057 in US7 (independent components)

---

## Parallel Example: Phase 2

```bash
# Launch all store and service tasks together:
Task T009: "Create useSettingsStore in src/renderer/src/stores/useSettingsStore.ts"
Task T010: "Create useShortcutsStore in src/renderer/src/stores/useShortcutsStore.ts"
Task T011: "Create useQuickPhrasesStore in src/renderer/src/stores/useQuickPhrasesStore.ts"
Task T012: "Create DataService in src/main/services/DataService.ts"
Task T013: "Create ShortcutService in src/main/services/ShortcutService.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types, deps)
2. Complete Phase 2: Foundational (stores, services, IPC)
3. Complete Phase 3: US1 — Settings page navigation + General settings
4. **STOP and VALIDATE**: Settings page renders, sub-pages route, navbar toggle works
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (settings nav + general) → Test → MVP!
3. US2 (display/theme) → Test → Theme works
4. US3 (language) → Test → i18n works
5. US4 (data management) → Test → Export/import works
6. US5 (shortcuts) → Test → Shortcuts configurable
7. US6 (backup config) + US7 (quick phrases) → Test → Full feature
8. Polish → Pattern audit, integration test, demo script

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Zustand selectors MUST return referentially stable values (Pattern Constraint)
- Debounce config:set IPC at 300ms for slider and textarea inputs
- Error Boundary required on SettingsPage root
- All new config keys need Zod schemas in shared types
- Demo script uses interactive mode by default, --ci for health check
