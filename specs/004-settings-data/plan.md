# Implementation Plan: Settings & Data Management

**Branch**: `004-settings-data` | **Date**: 2026-03-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/004-settings-data/spec.md`

## Summary

Settings & Data Management provides comprehensive application configuration (50+ fields across 6 categories), multi-backend backup/restore (local, WebDAV, S3), file management with metadata tracking, mini app embedding, keyboard shortcut configuration, and quick phrase management. The technical approach uses 4 Zustand stores persisted via electron-store (IPC), FileMetadata in Dexie, main-process services for file I/O and backup operations, and shadcn/ui settings pages with immediate-apply UX.

## Technical Context

**Language/Version**: TypeScript 5.8, targeting ES2022
**Primary Dependencies**: React 19, Electron 40, Zustand 5.x, electron-store 10.x, Dexie 4, shadcn/ui, Tailwind CSS 4, react-hook-form, zod, i18next, Sonner, lucide-react, webdav, @aws-sdk/client-s3, archiver, adm-zip
**Storage**: Dexie (IndexedDB) for FileMetadata, electron-store for settings/backup/miniapps/shortcuts via IPC
**Testing**: Vitest (unit + integration)
**Target Platform**: macOS / Windows / Linux (Electron desktop)
**Project Type**: Desktop application (Electron)
**Performance Goals**: Settings changes reflect in UI within 100ms, backup/restore handles archives up to 500MB
**Constraints**: No direct Node.js access from renderer, all file ops via IPC, structured-cloneable payloads only
**Scale/Scope**: 50+ settings fields, 75 IPC channels (35 file + 18 backup + 2 fs + 4 file-service; 16 out of scope)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Singleton Services | PASS | FileStorageService, BackupService, WebDavService, S3Service as main-process singletons |
| II. IPC Bridge Pattern | PASS | All file/backup operations via typed IPC channels. No direct Node.js in renderer |
| III. Middleware Pipeline | N/A | F004 does not involve AI/LLM calls |
| IV. Registry & Factory | PASS | Settings categories registered declaratively for tab navigation |
| V. Dual Database | PASS | FileMetadata in Dexie (renderer), settings in electron-store (via IPC) |
| VI. Test-First | PASS | Tests for stores, services, and IPC handlers before implementation |
| VII. Demo-Ready | PASS | Demo script will open settings, change language, create/restore backup |
| VIII. i18n | PASS | All settings labels use i18next keys, ko/en only |

**Post-Phase 1 re-check**: All gates still passing. Data model uses Dexie + electron-store as specified. IPC contracts follow typed channel pattern.

## Project Structure

### Documentation (this feature)

```text
specs/004-settings-data/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── ipc-channels.md  # IPC channel contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── main/
│   ├── services/
│   │   ├── FileStorageService.ts      # File upload, read, delete, rename, move, image conversion
│   │   ├── BackupService.ts           # Backup archive creation, validation, restoration
│   │   ├── WebDavService.ts           # WebDAV client (connection test, upload, download, list, delete)
│   │   └── S3Service.ts               # S3 client (connection test, upload, download, list, delete)
│   └── ipc/
│       ├── file-handlers.ts           # IPC handlers for file:* channels
│       └── backup-handlers.ts         # IPC handlers for backup:* channels
├── renderer/src/
│   ├── stores/
│   │   ├── useSettingsStore.ts        # General, display, behavior, proxy, quick phrases, sidebar icons
│   │   ├── useBackupStore.ts          # Backup config (WebDAV, S3), backup state
│   │   ├── useMiniAppsStore.ts        # Mini app CRUD and ordering
│   │   └── useShortcutsStore.ts       # Keyboard shortcut bindings
│   ├── pages/
│   │   ├── settings/
│   │   │   ├── SettingsPage.tsx       # Tab navigation layout with ErrorBoundary
│   │   │   ├── GeneralSettings.tsx    # Language, send shortcut, proxy, launch config
│   │   │   ├── DisplaySettings.tsx    # Theme, font, sidebar icons, message dividers
│   │   │   ├── DataSettings.tsx       # Backup/restore, data path migration
│   │   │   ├── ShortcutSettings.tsx   # Keyboard shortcut table and editor
│   │   │   ├── QuickPhraseSettings.tsx # Quick phrase CRUD list
│   │   │   └── AboutSettings.tsx      # App info, version, links
│   │   ├── minapps/
│   │   │   ├── MinAppsPage.tsx        # Mini apps grid/list with add/edit/delete
│   │   │   └── MinAppPage.tsx         # Individual mini app webview
│   │   └── files/
│   │       └── FilesPage.tsx          # File management browser
│   ├── components/
│   │   └── settings/
│   │       ├── SettingItem.tsx         # Reusable label+control row
│   │       ├── SettingSection.tsx      # Collapsible section wrapper
│   │       ├── BackupCard.tsx          # Backup target card (local/WebDAV/S3)
│   │       ├── ColorPicker.tsx         # Theme color picker
│   │       ├── ShortcutCapture.tsx     # Key combination capture input
│   │       └── FileListItem.tsx        # File list row with actions
│   └── hooks/
│       ├── useBackup.ts               # Backup/restore operations with progress
│       └── useFileManager.ts          # File CRUD operations via IPC
└── shared/
    └── types/
        └── settings.ts                # SettingsState, BackupConfig, MiniApp, Shortcut, QuickPhrase, SidebarIcon, FileType

tests/
├── unit/
│   ├── stores/
│   │   ├── useSettingsStore.test.ts
│   │   ├── useBackupStore.test.ts
│   │   ├── useMiniAppsStore.test.ts
│   │   └── useShortcutsStore.test.ts
│   └── services/
│       ├── FileStorageService.test.ts
│       └── BackupService.test.ts
└── integration/
    ├── backup-restore.test.ts
    └── file-operations.test.ts
```

**Structure Decision**: Electron split architecture (main/renderer/shared), consistent with F001-F005 patterns. Main process handles file I/O and backup; renderer handles UI and stores.

## Implementation Phases

### Phase 1: Shared Types & Settings Store Foundation

**Deliverables**: Shared type definitions, useSettingsStore with all fields and defaults, persistence via electron-store IPC adapter.

**Files**:
- `src/shared/types/settings.ts` — All type definitions
- `src/renderer/src/stores/useSettingsStore.ts` — Main settings store
- `tests/unit/stores/useSettingsStore.test.ts` — Store tests

**FR Coverage**: FR-001 (settings structure), FR-002 (immediate persistence), FR-004 (send shortcut), FR-005 (proxy), FR-006 (launch config), FR-021 (display settings)

### Phase 2: File Storage Service & IPC

**Deliverables**: Main-process FileStorageService with all file operations, IPC handlers for file:* channels, FileMetadata Dexie table.

**Files**:
- `src/main/services/FileStorageService.ts`
- `src/main/ipc/file-handlers.ts`
- Dexie schema migration for `files` table
- `tests/unit/services/FileStorageService.test.ts`

**FR Coverage**: FR-012 (file upload), FR-013 (file CRUD), FR-014 (URL download), FR-015 (image conversion)

### Phase 3: Backup Service & Remote Storage

**Deliverables**: BackupService (archive creation/restore), WebDavService, S3Service, IPC handlers for backup:* channels, useBackupStore.

**Files**:
- `src/main/services/BackupService.ts`
- `src/main/services/WebDavService.ts`
- `src/main/services/S3Service.ts`
- `src/main/ipc/backup-handlers.ts`
- `src/renderer/src/stores/useBackupStore.ts`
- `tests/unit/services/BackupService.test.ts`
- `tests/integration/backup-restore.test.ts`

**FR Coverage**: FR-007 (local backup), FR-008 (local restore), FR-009 (WebDAV), FR-010 (S3), FR-011 (connection verify)

### Phase 4: Settings Pages UI

**Deliverables**: SettingsPage with tabbed navigation, GeneralSettings, DisplaySettings, DataSettings, AboutSettings, reusable SettingItem/SettingSection components.

**Files**:
- `src/renderer/src/pages/settings/SettingsPage.tsx`
- `src/renderer/src/pages/settings/GeneralSettings.tsx`
- `src/renderer/src/pages/settings/DisplaySettings.tsx`
- `src/renderer/src/pages/settings/DataSettings.tsx`
- `src/renderer/src/pages/settings/AboutSettings.tsx`
- `src/renderer/src/components/settings/SettingItem.tsx`
- `src/renderer/src/components/settings/SettingSection.tsx`
- `src/renderer/src/components/settings/ColorPicker.tsx`
- `src/renderer/src/components/settings/BackupCard.tsx`

**FR Coverage**: FR-001 (settings UI), FR-003 (language switch), FR-021 (display settings)

### Phase 5: Keyboard Shortcuts & Quick Phrases

**Deliverables**: useShortcutsStore, ShortcutSettings page with conflict detection, QuickPhraseSettings page, ShortcutCapture component.

**Files**:
- `src/renderer/src/stores/useShortcutsStore.ts`
- `src/renderer/src/pages/settings/ShortcutSettings.tsx`
- `src/renderer/src/pages/settings/QuickPhraseSettings.tsx`
- `src/renderer/src/components/settings/ShortcutCapture.tsx`
- `tests/unit/stores/useShortcutsStore.test.ts`

**FR Coverage**: FR-017 (shortcuts), FR-018 (quick phrases), FR-019 (sidebar config)

### Phase 6: Mini Apps & File Browser

**Deliverables**: useMiniAppsStore, MinAppsPage, MinAppPage (webview), FilesPage with file browser.

**Files**:
- `src/renderer/src/stores/useMiniAppsStore.ts`
- `src/renderer/src/pages/minapps/MinAppsPage.tsx`
- `src/renderer/src/pages/minapps/MinAppPage.tsx`
- `src/renderer/src/pages/files/FilesPage.tsx`
- `src/renderer/src/components/settings/FileListItem.tsx`
- `src/renderer/src/hooks/useFileManager.ts`
- `tests/unit/stores/useMiniAppsStore.test.ts`

**FR Coverage**: FR-016 (mini apps), FR-012/FR-013 (file management UI)

### Phase 7: Data Migration & Hooks

**Deliverables**: App data directory migration, useBackup hook with progress tracking, backup progress event handling.

**Files**:
- `src/renderer/src/hooks/useBackup.ts`
- Data migration logic in BackupService
- `tests/integration/file-operations.test.ts`

**FR Coverage**: FR-020 (data directory migration)

### Phase 8: i18n, Integration & Demo

**Deliverables**: i18n keys for all settings labels, navigation integration (settings in sidebar/tab), demo script.

**Files**:
- `src/renderer/src/i18n/locales/ko.json` (settings keys)
- `src/renderer/src/i18n/locales/en.json` (settings keys)
- `demos/F004-settings-data.sh`
- Navigation integration with F001 sidebar

**FR Coverage**: FR-003 (language switching with i18next)

## Pattern Constraints

### External Store + Reactive Framework (Zustand + React 19)

Selector return values MUST be referentially stable. No new array/object/filtered-list creation per selector call. Use shallow comparison, memoized selectors, or select raw state + derive in component.

**Rationale**: React 19's useSyncExternalStore will infinite-loop if selectors create new references on every call.

**Example**:
```typescript
// WRONG: creates new array each call → infinite re-render
const icons = useSettingsStore(s => s.sidebarIcons.filter(i => i.visible))

// CORRECT: select raw state, derive in component
const sidebarIcons = useSettingsStore(s => s.sidebarIcons)
const visibleIcons = useMemo(() => sidebarIcons.filter(i => i.visible), [sidebarIcons])
```

### Event Handler + State Update (React 18+)

Batch state updates within event handlers. Avoid sequential setState calls triggering multiple re-renders.

**Rationale**: Unbatched updates cause intermediate renders with inconsistent state.

### Error Boundary Requirement

Every route/page-level component (SettingsPage, MinAppsPage, FilesPage) MUST be wrapped with an Error Boundary. Uncaught render errors must not crash the entire application — they must be caught, reported, and display a fallback UI.

### IPC Boundary Safety (B-3)

- All IPC payloads must be structured-cloneable (no functions, class instances, circular refs)
- File binary data uses ArrayBuffer or disk path references
- Large operations (backup, file copy) stream progress via event channels

### Data Persistence Safety (B-3)

- Settings writes use Zustand `set()` which auto-persists via middleware — no manual save needed
- Backup restore validates archive structure before applying
- Data directory migration copies before switching — old data preserved on failure

## Complexity Tracking

No constitution violations — no entries needed.
