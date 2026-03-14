# F010-backup-sync — Pre-Context

> Angdu Studio reverse-spec | Rebuilt from Cherry Studio
> Feature: Multi-Destination Backup & Sync
> Tier: 2 (Recommended) | Demo Group: D2-Enhance
> Dependencies: F002-settings

---

## Feature Overview

Multi-destination backup system supporting WebDAV, S3-compatible storage, and local filesystem. Each destination has independent auto-sync scheduling with interval-based triggers and mutex protection. Backup archive uses versioned format (v5) with migration support from v3 through v5. Includes Nutstore (jianguoyun) integration as a specialized WebDAV destination. Path traversal prevention on restore for security.

---

## Runtime Exploration Results

From `runtime-exploration.md` — Settings > Data Settings:

- **Location**: Settings sidebar > App Settings group > "Data Settings"
- **Layout**: Backup configuration within data settings page
- **Related**: Auto-sync scheduling configured per destination

---

## Source Reference

| Layer | Cherry Studio Path | Purpose |
|-------|-------------------|---------|
| Backup manager | `src/main/services/BackupManager.ts` | Backup orchestration, archive creation |
| WebDAV client | `src/main/services/WebDav.ts` | WebDAV upload/download |
| S3 client | `src/main/services/S3Storage.ts` | S3-compatible storage operations |
| Sync scheduler | `src/main/services/SyncScheduler.ts` | Interval-based auto-sync with mutex |
| Migration | `src/main/services/BackupMigration.ts` | v3->v4->v5 backup format migration |
| Renderer service | `src/renderer/src/services/BackupService.ts` | Client-side backup operations |
| Nutstore service | `src/renderer/src/services/NutstoreService.ts` | Nutstore-specific sync |
| Backup store | `src/renderer/src/store/backup.ts` | Redux slice (backup state) |
| Nutstore store | `src/renderer/src/store/nutstore.ts` | Redux slice (nutstore state) |

---

## Spec Backlog Items (SBI)

| ID | Title | Priority | Description |
|----|-------|----------|-------------|
| B209 | WebDAV backup destination config | P1 | Configure WebDAV server URL, credentials, remote path. Test connection. |
| B210 | S3-compatible backup destination config | P1 | Configure S3 endpoint, bucket, region, access keys. Test connection. |
| B211 | Local filesystem backup destination | P1 | Configure local directory path for backup archives. |
| B212 | Manual backup trigger (create archive) | P1 | Create backup archive containing all app data. Distribute to enabled destinations. |
| B213 | Restore from backup archive | P1 | Select and restore from a backup file. Apply format migrations if needed. |
| B214 | Backup format v5 with migration (v3->v4->v5) | P1 | Versioned backup format. Sequential forward-only migrations on restore. |
| B215 | Auto-sync scheduling per destination | P2 | Configurable interval per destination. Mutex prevents concurrent sync operations. |
| B216 | Path traversal prevention on restore | P1 | Validate all file paths during archive extraction. Reject paths escaping target directory. |
| B217 | Nutstore integration | P2 | Specialized WebDAV integration for Nutstore (jianguoyun) with account/token auth. |
| B218 | Sync status and error reporting | P2 | Show last sync time, sync-in-progress indicator, error messages per destination. |
| B219 | Multiple simultaneous destinations | P2 | Multiple destinations can be active. Single archive distributed to all enabled destinations. |
| B220 | Backup data selection | P3 | Choose which data categories to include in backup (conversations, settings, knowledge bases, etc.). |

---

## Business Rules

- **BR-017**: Backup supports WebDAV, S3, Local destinations with independent auto-sync config
- **BR-018**: Backup uses v5 format with sequential migration support (v3->v4->v5), forward-only
- **BR-019**: Path traversal prevention via startsWith check on all extracted file paths
- **BR-020**: Auto-sync uses interval scheduling with mutex; concurrent manual+auto sync prevented

---

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| (none detected) | All backup config stored in BackupState/NutstoreState via settings | — |

---

## For /speckit.specify

- **Entities**: BackupState, SyncConfig, NutstoreState (see entity-registry.md)
- **Business rules**: BR-017 through BR-020 (see business-logic-map.md)
- **Key screens**: Settings > Data Settings (backup configuration section)
- **IPC channels**: `backup:create`, `backup:restore`, `backup:sync`, `backup:status`, `backup:test-connection`
- **Cross-feature**: Backup archives contain data from all features (settings, assistants, chats, KBs, etc.)

## For /speckit.plan

- **Migration impact**: Medium UI, Medium state (see stack-migration.md)
- **UI migration**: Backup settings forms AntD -> shadcn/ui
- **State migration**: `backup` + `nutstore` Redux slices -> `useBackupStore` Zustand store
- **Main process**: BackupManager, WebDav, S3Storage, SyncScheduler are Node.js — no UI migration
- **Dependencies**: Requires F002-settings for data settings integration
- **Zustand store**: `useBackupStore` absorbs `backup` + `nutstore` slices

---

## Feature Contracts

### Provides to Other Features

| Contract | Consumer | Description |
|----------|----------|-------------|
| `backup:*` IPC channels | F002-settings | Backup operations triggered from settings UI |
| Data export/import | All features | Backup archive contains serialized state from all features |

### Consumes from Other Features

| Contract | Provider | Description |
|----------|----------|-------------|
| All persisted state | F002-F014 | Backup serializes all Redux/Zustand stores + DB data |
| Settings UI integration | F002-settings | Backup config lives within Data Settings page |
