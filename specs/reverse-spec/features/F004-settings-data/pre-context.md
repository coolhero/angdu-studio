# F004-settings-data — Pre-Context

**Feature**: Settings pages, backup/restore, import/export, file management, mini apps, keyboard shortcuts, quick phrases
**Release Group**: RG-2 | **Tier**: T2

---

## 1. Runtime Exploration Results

- **Settings Pages**: 15+ settings sections — General, Model, Provider, Display, MCP, Data, Shortcuts, Quick Assistant, Quick Phrases, Selection Assistant, Agent, Doc Processing, About, Web Search, Memory, Translation, Tool Settings.
- **Backup/Restore**: Three backends — local directory, WebDAV, S3. Backup data is JSON-compressed. Supports listing, deleting, and restoring from backup files.
- **File Management**: Upload, download, delete, rename, move files and directories. Supports images (base64, binary), PDFs, text files. File watcher for live directory monitoring.
- **Mini Apps**: Embedded web apps with custom URLs. CRUD management with settings page.
- **Keyboard Shortcuts**: Configurable global shortcuts with UI for rebinding.
- **Quick Phrases**: Saved text snippets for quick insertion into chat.
- **Settings State**: Large Redux slice with 80+ fields covering all app preferences.
- **Sidebar Icons**: Customizable sidebar navigation with configurable icon visibility.
- **Data Path**: User-configurable app data directory with copy/migration support.
- **Nutstore Sync**: Integration with Nutstore cloud storage for backup.
- **LAN Transfer**: Local network device discovery and file transfer.
- **Export**: Export conversations to Word documents.

---

## 2. Source Reference

| File | Role |
|------|------|
| `src/renderer/src/store/settings.ts` | Redux slice: 80+ settings fields |
| `src/renderer/src/store/backup.ts` | Backup/restore state management |
| `src/renderer/src/store/shortcuts.ts` | Shortcut state management |
| `src/renderer/src/store/nutstore.ts` | Nutstore sync state |
| `src/renderer/src/pages/settings/SettingsPage.tsx` | Settings page layout/router |
| `src/renderer/src/pages/settings/GeneralSettings.tsx` | General settings (language, launch, proxy) |
| `src/renderer/src/pages/settings/ModelSettings/` | Model configuration settings |
| `src/renderer/src/pages/settings/ProviderSettings/` | Provider configuration UI |
| `src/renderer/src/pages/settings/DisplaySettings/` | Theme, font, layout settings |
| `src/renderer/src/pages/settings/DataSettings/` | Backup, restore, data path settings |
| `src/renderer/src/pages/settings/ShortcutSettings.tsx` | Keyboard shortcut configuration |
| `src/renderer/src/pages/settings/QuickPhraseSettings.tsx` | Quick phrase management |
| `src/renderer/src/pages/settings/QuickAssistantSettings.tsx` | Quick assistant configuration |
| `src/renderer/src/pages/settings/SelectionAssistantSettings/` | Selection assistant settings |
| `src/renderer/src/pages/settings/AboutSettings.tsx` | About page, version info |
| `src/renderer/src/pages/settings/AgentSettings/` | Agent configuration |
| `src/renderer/src/pages/settings/DocProcessSettings/` | Document processing settings |
| `src/renderer/src/pages/settings/WebSearchSettings/` | Web search provider settings |
| `src/renderer/src/pages/settings/MemorySettings/` | Memory/context settings |
| `src/renderer/src/pages/settings/ToolSettings/` | Tool permission settings |
| `src/renderer/src/pages/settings/TranslateSettingsPopup/` | Translation settings |
| `src/renderer/src/pages/minapps/MinAppsPage.tsx` | Mini apps listing |
| `src/renderer/src/pages/minapps/MinAppPage.tsx` | Individual mini app view |
| `src/renderer/src/pages/files/FilesPage.tsx` | File browser page |
| `src/renderer/src/pages/files/FileList.tsx` | File listing component |
| `src/renderer/src/store/minapps.ts` | Mini apps state |
| `src/renderer/src/config/sidebar.ts` | Sidebar icon configuration |
| `src/main/services/BackupManager.ts` | Main-process backup operations |
| `src/main/services/FileStorage.ts` | File upload and storage |
| `src/main/services/FileSystemService.ts` | File system operations |
| `src/main/services/WebDav.ts` | WebDAV client |
| `src/main/services/S3Storage.ts` | S3 backup client |
| `src/main/services/NutstoreService.ts` | Nutstore integration |
| `src/main/services/ExportService.ts` | Export to Word |
| `src/main/services/LocalTransferService.ts` | LAN file transfer |
| `src/main/services/ExternalAppsService.ts` | External app detection |

---

## 3. Source Behavior Inventory

| ID | Behavior | Priority | Source |
|----|----------|----------|--------|
| B056 | Read/write all settings fields with defaults | P1 | `store/settings.ts` |
| B057 | Switch language and persist preference | P1 | `GeneralSettings.tsx`, IPC |
| B058 | Configure send message shortcut (Enter/Shift+Enter/Ctrl+Enter/etc.) | P1 | `store/settings.ts` |
| B059 | Configure proxy mode and URL | P1 | `GeneralSettings.tsx` |
| B060 | Set launch on boot and launch to tray | P2 | `GeneralSettings.tsx`, IPC |
| B061 | Backup app data to local directory | P1 | `BackupManager.backup()` |
| B062 | Restore app data from local backup | P1 | `BackupManager.restore()` |
| B063 | Backup to WebDAV server (create, list, delete, restore) | P2 | `BackupManager`, `WebDav.ts` |
| B064 | Backup to S3 bucket (create, list, delete, restore) | P2 | `BackupManager`, `S3Storage.ts` |
| B065 | Check WebDAV/S3 connection before backup | P2 | `BackupManager` |
| B066 | Upload files to app storage with metadata | P1 | `FileStorage.ts` |
| B067 | Read, delete, rename, move files and directories | P1 | `FileSystemService.ts` |
| B068 | Download files from URL | P2 | `FileStorage.ts` |
| B069 | Convert images to base64/binary formats | P2 | File IPC handlers |
| B070 | Manage mini apps (add, edit, remove, reorder) | P2 | `store/minapps.ts` |
| B071 | Configure keyboard shortcuts with conflict detection | P2 | `ShortcutSettings.tsx` |
| B072 | Manage quick phrases (CRUD) | P2 | `QuickPhraseSettings.tsx` |
| B073 | Configure sidebar icon visibility and order | P2 | `store/settings.ts` |
| B074 | Set and migrate app data directory path | P2 | IPC `App_SetAppDataPath`, `App_Copy` |
| B075 | Export conversation to Word document | P3 | `ExportService.ts` |
| B076 | Configure display settings (font, theme colors, message dividers) | P2 | `DisplaySettings/` |
| B077 | Manage user theme (primary color, font family, code font) | P2 | `store/settings.ts` |
| B078 | Nutstore SSO and sync | P3 | `NutstoreService.ts` |
| B079 | LAN transfer device discovery and file send | P3 | `LocalTransferService.ts` |
| B080 | Detect externally installed apps | P3 | `ExternalAppsService.ts` |

---

## 4. UI Component Features

| AntD Component (Current) | shadcn/ui Replacement | Usage Context |
|---------------------------|----------------------|---------------|
| Form, Form.Item | Form (react-hook-form + zod) | All settings forms |
| Input, Input.Password | Input | API keys, URLs, paths |
| Select | Select | Language, theme, shortcut selectors |
| Switch | Switch | Toggle settings (50+ instances) |
| Slider | Slider | Font size, opacity |
| Button | Button | Save, backup, restore actions |
| Modal, Confirm | Dialog, AlertDialog | Confirmation dialogs, data path change |
| Tabs | Tabs | Settings section navigation |
| Upload | Custom file input | Backup file import |
| ColorPicker | Custom color picker | Theme primary color |
| Table | Table | Shortcut list, backup file list |
| Collapse | Collapsible/Accordion | Settings groups |
| Progress | Progress | Backup/restore progress |
| Badge | Badge | Update indicators |
| Divider | Separator | Section dividers |

---

## 5. Naming Remapping

| Current Identifier | Location | Suggested Replacement |
|--------------------|----------|-----------------------|
| `CherryStudio` (about page references) | `AboutSettings.tsx` | `AngduStudio` |
| `CherryHQ` (about page) | `AboutSettings.tsx` | `AngduHQ` |
| `cherry-text-logo.svg` | About/branding | `angdu-text-logo.svg` |
| `HOME_CHERRY_DIR` | Backup paths | `HOME_ANGDU_DIR` |
| `cherryIn` (settings key) | `store/settings.ts` | `angduIn` |

---

## 6. Static Resources

| Resource | Path | Notes |
|----------|------|-------|
| App icons in settings | `src/renderer/src/assets/images/apps/` | Mini app default icons |
| Provider icons in settings | `src/renderer/src/assets/images/providers/` | Provider settings icons |
| Search provider icons | `src/renderer/src/assets/images/search/` | Web search provider logos |
| i18n locales | `src/renderer/src/i18n/locales/*.json` | Settings labels, descriptions |

---

## 7. Environment Variables

| Variable | Scope | Description |
|----------|-------|-------------|
| None specific to F004 | — | Settings are stored in Redux/electron-store |

---

## 8. For /speckit.specify

**Feature Summary**: Comprehensive settings management system with 80+ configurable fields, multi-backend backup/restore (local, WebDAV, S3), file management, mini app embedding, keyboard shortcut configuration, and quick phrase management.

**User Scenarios**:
- US-018: User opens settings and changes language; UI updates immediately
- US-019: User creates a local backup of all app data
- US-020: User restores from a WebDAV backup
- US-021: User adds a mini app with custom URL
- US-022: User configures a keyboard shortcut for new topic
- US-023: User creates quick phrases for common prompts
- US-024: User changes app data directory; data migrates to new location

**Draft Requirements**:
- FR-027: System SHALL provide a settings UI with categorized sections
- FR-028: System SHALL support backup to local directory, WebDAV, and S3
- FR-029: System SHALL restore app state from backup with data validation
- FR-030: System SHALL manage file uploads, storage, and metadata
- FR-031: System SHALL support embedding web apps as mini apps
- FR-032: System SHALL allow configuring global keyboard shortcuts
- FR-033: System SHALL manage quick phrases for chat insertion
- FR-034: System SHALL persist all settings changes immediately
- FR-035: System SHALL support app data directory migration

**Success Criteria**:
- SC-013: Settings changes persist across app restart
- SC-014: Backup/restore round-trip preserves all data
- SC-015: WebDAV/S3 connection test completes within 5 seconds
- SC-016: File operations handle errors gracefully with user feedback

---

## 9. For /speckit.plan

**Dependencies**:
- Upstream: F001 (IPC for file operations, config), F002 (provider settings), F003 (conversation data for backup)
- Downstream: None directly; F004 is a leaf feature

**Entity/API Contracts**:
- `SettingsState` — 80+ fields (see `store/settings.ts` for complete shape)
- `WebDavConfig` — `{ url, username, password, path }`
- `S3Config` — `{ bucket, region, accessKeyId, secretAccessKey, endpoint }`
- `FileMetadata` — `{ id, name, path, size, type, createdAt }`
- `Shortcut` — `{ id, name, keys, action }`
- `QuickPhrase` — `{ id, text, label }`
- `SidebarIcon` — `{ id, icon, visible, order }`
- IPC channel groups: `Backup_*` (16 channels), `File_*` (30+ channels), `Shortcuts_*`
- Store migration: `store/settings.ts` is the largest Redux slice — convert to Zustand with persistence middleware.

---

## 10. For /speckit.analyze

**Cross-Feature Verification Points**:
- F004 <-> F001: Settings changes trigger IPC calls to main process (proxy, theme, launch on boot, etc.)
- F004 <-> F002: Provider settings are managed in F002 but displayed in F004's settings UI
- F004 <-> F003: Backup must include all conversation data from F003
- F004 <-> F005: Display settings (font, message dividers, code style) affect F005 rendering
- F004 <-> F006: MCP settings page is in F004's settings layout but managed by F006
- AntD->shadcn: Settings pages are the heaviest AntD consumer — Form, Switch, Select, Input, Modal used extensively. Largest migration surface area.
