# Pre-Context: Backup & Sync

**Feature ID**: F007-backup-sync
**Tier**: Tier 2
**Generated**: 2026-03-04

---

## Source Reference

**Source Root**: `/Users/coolhero/Study/oss/cherry-studio`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/main/services/BackupManager.ts` | Multi-backend backup/restore (local, WebDAV, S3, LAN transfer) |
| `src/renderer/src/pages/settings/DataSettings/` | Backup settings UI (configuration forms, backup/restore controls) |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding **local backup/restore with ZIP64 support, WebDAV backup/restore with custom filename and connection caching, S3 backup/restore with hostname+timestamp filename, LAN transfer with lightweight backup and path traversal protection, progress reporting via IPC at 5% granularity, cross-platform file permissions (Windows attrib, Unix chmod), pre-restore connection cleanup (close DB + watchers for Windows EBUSY), file listing (.zip only, sorted newest first)**
- Do not reference: Ant Design components in backup settings UI (migrating to shadcn/ui + Radix), styled-components in settings pages (migrating to Tailwind-only), Redux state patterns (migrating to Zustand)
- **Extract**: ZIP64 archive creation with compression level 1, multi-backend abstraction (local/WebDAV/S3/LAN), default filename generation logic (WebDAV: `cherry-studio.backup.zip`, S3: `{hostname}_{timestamp}.zip`), skip-file backup option (empty Data directory in archive), restore 5-step pipeline (download -> extract -> validate -> close connections -> copy), WebDAV/S3 connection instance caching with invalidation, progress reporting coalescing at 5% increments, path traversal validation for LAN transfer, cross-platform permission handling, pre-restore cleanup for DB and file watchers
- **Ignore**: Redux state management patterns, Ant Design Form/Button/Modal components, styled-components wrappers

### Static Resources

> Non-code files used by this Feature that must be **copied from the original source** during implementation.

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| (none) | | | Backup/sync has no static resources; all configuration is user-generated at runtime |

### Environment Variables

> Environment variables required by this Feature at runtime.

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| (none specific to F007) | | | | |

**Shared variables** (defined by other Features but also used here):

| Variable | Owner Feature | Usage in This Feature |
|----------|--------------|----------------------|
| `CSLOGGER_MAIN_LEVEL` | F001-core-platform | Log level for main process backup/restore operations |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F007-backup-sync implements multi-backend backup and restore with support for local filesystem, WebDAV, S3, and LAN transfer. Backups use ZIP64 format with compression level 1 for performance. The system supports skipping file backup (creating an empty Data directory for structure), custom filenames per backend, and connection instance caching for WebDAV/S3. Restore follows a 5-step pipeline: download, extract to temp, validate structure, close existing DB connections (critical for Windows EBUSY prevention), and copy files. Progress reporting operates at 5% granularity via IPC. LAN transfer includes path traversal protection. Cross-platform file permissions are handled (Windows attrib, Unix chmod).

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Local backup/restore | User creates a local backup archive (ZIP64) and restores from it |
| P1 | WebDAV backup/restore | User configures WebDAV connection; backs up with custom filename; restores from remote |
| P1 | S3 backup/restore | User configures S3 connection; backs up with hostname+timestamp filename |
| P2 | LAN transfer | User transfers application data between machines on the same LAN with path traversal protection |
| P2 | Progress tracking | User sees real-time progress at 5% granularity during backup/restore operations |
| P3 | File listing | User browses remote backups; sees .zip files sorted newest first |
| P3 | Skip file backup | User creates a lightweight backup without large user data files |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Local backup/restore with ZIP64 support
- **FR-002**: WebDAV backup/restore (custom filename, connection caching)
- **FR-003**: S3 backup/restore (hostname+timestamp filename)
- **FR-004**: LAN transfer (lightweight backup, path traversal protection)
- **FR-005**: Progress reporting via IPC (5% granularity increments)
- **FR-006**: Cross-platform file permissions (Windows attrib, Unix chmod)
- **FR-007**: Pre-restore connection cleanup (close DB + watchers for Windows EBUSY)
- **FR-008**: File listing (.zip only, sorted newest first)

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: Local backup creates a valid ZIP64 archive that can be restored to a fresh installation
- **SC-002**: WebDAV backup uploads successfully and can be listed and restored
- **SC-003**: S3 backup uploads with correct hostname+timestamp filename and can be restored
- **SC-004**: LAN transfer rejects paths containing `..` or absolute paths
- **SC-005**: Progress updates arrive at exactly 5% granularity increments (no more frequent)
- **SC-006**: Restore completes without EBUSY errors on Windows after pre-restore cleanup
- **SC-007**: File listing returns only .zip files sorted by modification time (newest first)

### Edge Cases

- Restore on Windows while database is actively being written; pre-restore connection cleanup prevents EBUSY
- WebDAV/S3 connection timeout during large backup upload; retry or resume strategy
- Backup archive exceeds 4GB; ZIP64 format handles this transparently
- LAN transfer with malicious path traversal attempts (`../../../etc/passwd`); rejected with security error
- Progress reporting during very fast operations (< 1 second); minimum 5% granularity prevents flooding
- S3 bucket with thousands of backup files; file listing filtered to .zip only
- Concurrent backup and restore operations; mutual exclusion or error handling
- Restore from an archive created by a different version; structure validation catches incompatibilities
- Network interruption during WebDAV/S3 operations; connection caching invalidation

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-core-platform | Infrastructure | Uses IPC framework for backup/restore commands, file system access for archive operations, config persistence for WebDAV/S3 connection settings |

### Related Entities (data-model.md draft)

#### Owned Entities

None. F007 operates on application state data (database files, user data files, configuration) rather than owning domain entities.

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| (all entities) | F001-F012 | Data inclusion | Backup archives contain all persisted application state across all features |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| IPC | `backup:create` | Create a backup archive |
| IPC | `backup:restore` | Restore from a backup archive |
| IPC | `backup:list-files` | List backup files from a backend (.zip only, newest first) |
| IPC | `backup:delete` | Delete a backup file from a backend |
| IPC | `backup:test-connection` | Test WebDAV/S3 connection |
| IPC | `backup:progress` (event) | Progress reporting event (5% granularity) |
| IPC | ~13 additional channels | LAN transfer, WebDAV/S3 config, auto-backup settings |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| IPC | `app:*` | F001-core-platform | App info, data paths, platform detection |
| IPC | `file:*` | F001-core-platform | File system access for archive operations |
| IPC | `config:*` | F001-core-platform | Config get/set for backup connection settings |

### Business Rules

This feature owns **10 business rules** (BR-041 through BR-050):

| Rule ID | Rule Name | Description |
|---------|-----------|-------------|
| BR-041 | ZIP64 + compression level 1 | Fastest compression for minimal backup time |
| BR-042 | Skip file backup option | Empty Data directory created in archive when files skipped |
| BR-043 | Default filenames | WebDAV: `cherry-studio.backup.zip`, S3: `{hostname}_{timestamp}.zip` |
| BR-044 | Restore 5-step pipeline | Download -> extract to temp -> validate -> close connections -> copy |
| BR-045 | Connection instance caching | WebDAV/S3 clients cached and reused; invalidated on settings change |
| BR-046 | Cross-platform permissions | Unix chmod preserved; Windows ACL applied post-restore |
| BR-047 | File listing filters | Only .zip files, sorted newest first |
| BR-048 | Progress reporting | 5% granularity; more frequent updates coalesced |
| BR-049 | LAN transfer security | Path traversal (`..`, absolute paths) rejected |
| BR-050 | Pre-restore connection cleanup | Close all DB connections before file replacement |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Backup/restore is primarily main process logic (archive creation, multi-backend upload/download, file operations). The renderer side provides configuration UI for WebDAV/S3 connection settings and backup/restore controls via Redux state and Ant Design components.
- **Recommended implementation approach**: Keep ALL main process backup logic intact (BackupManager, archive operations, multi-backend support, LAN transfer). Replace Ant Design components in DataSettings UI with shadcn/ui equivalents (Form, Button, Dialog). Replace Redux state management with Zustand store for backup operation state and progress tracking.
- **Caveats**: Minimal migration impact since core backup logic is in the main process. Only the renderer-side settings UI (Ant Design -> shadcn/ui) and state management (Redux -> Zustand) need migration.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Pre-restore DB cleanup | F001-core-platform | Verify F007 correctly closes F001's database connections before restore |
| Pre-restore KB DB cleanup | F004-knowledge-base | Verify F007 correctly closes F004's SQLite connections before restore |
| Settings integration | F008-settings-ui | Verify backup settings page correctly configures WebDAV/S3 connections |
| Data inclusion | All features | Verify backup archive includes all persisted state from all features |
| IPC channel availability | F001-core-platform | Verify F007's backup:* IPC channels are registered in F001's IPC handler |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F008-settings-ui | Config schema | If backup connection settings schema changes, settings page must update |
| All features | Data format | If backup archive format changes, all features' persisted data must be re-validated |
| F001-core-platform | Connection cleanup | If cleanup protocol changes, F001 must adapt its DB shutdown procedure |
