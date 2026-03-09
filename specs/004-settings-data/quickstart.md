# Quickstart: 004-settings-data

## Prerequisites

- Node.js 20+, npm 10+
- F001 (app-core), F002 (ai-provider), F003 (chat-core) completed and merged

## Key Dependencies

```bash
# Already installed (from F001/F005):
# zustand, electron-store, dexie, shadcn/ui components, react-hotkeys-hook, sonner, lucide-react

# New dependencies for F004:
npm install webdav @aws-sdk/client-s3 archiver adm-zip
npm install -D @types/archiver @types/adm-zip
```

## Store Architecture

```
useSettingsStore     → General, Display, Behavior, Proxy, Quick Phrases, Sidebar Icons
useBackupStore       → WebDAV config, S3 config, backup state
useMiniAppsStore     → Mini app CRUD and ordering
useShortcutsStore    → Keyboard shortcut bindings
```

All stores use Zustand `persist` → electron-store via IPC (same pattern as F001/F002).

## File Structure

```
src/
├── main/
│   └── services/
│       ├── FileStorageService.ts      # File upload, read, delete, rename, move
│       ├── BackupService.ts           # Backup archive creation/restoration
│       ├── WebDavService.ts           # WebDAV client operations
│       └── S3Service.ts               # S3 client operations
├── renderer/src/
│   ├── stores/
│   │   ├── useSettingsStore.ts        # General/display/behavior settings
│   │   ├── useBackupStore.ts          # Backup configuration
│   │   ├── useMiniAppsStore.ts        # Mini app management
│   │   └── useShortcutsStore.ts       # Keyboard shortcuts
│   ├── pages/settings/
│   │   ├── SettingsPage.tsx           # Tab navigation layout
│   │   ├── GeneralSettings.tsx        # Language, proxy, launch
│   │   ├── DisplaySettings.tsx        # Theme, font, sidebar
│   │   ├── DataSettings.tsx           # Backup/restore, data path
│   │   ├── ShortcutSettings.tsx       # Shortcut configuration
│   │   ├── QuickPhraseSettings.tsx    # Quick phrase CRUD
│   │   └── AboutSettings.tsx          # App info, version
│   ├── pages/minapps/
│   │   ├── MinAppsPage.tsx            # Mini apps list
│   │   └── MinAppPage.tsx             # Individual mini app view
│   └── pages/files/
│       └── FilesPage.tsx              # File management
└── shared/
    └── types/
        └── settings.ts                # Shared settings types
```

## Run Tests

```bash
npm test -- --filter settings
```

## Key Patterns

1. **Settings are applied immediately** — no save button. Each control writes to store on change.
2. **Backup runs in main process** — creates ZIP with stores + Dexie export + files.
3. **File operations via IPC** — renderer never touches filesystem directly.
4. **Shortcuts use react-hotkeys-hook** — already available from F005.
