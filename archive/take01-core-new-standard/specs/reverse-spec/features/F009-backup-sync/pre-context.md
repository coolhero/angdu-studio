# Pre-Context: Backup & Sync

**Feature ID**: F009
**Tier**: Tier 2
**Generated**: 2026-03-02

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/main/services/BackupManager.ts` | Backup/restore service |
| `src/main/services/LocalTransferService.ts` | LAN device discovery (mDNS) |
| `src/main/services/LanTransferClientService.ts` | LAN file transfer |
| `src/main/services/NutstoreService.ts` | Nutstore WebDAV integration |
| `src/renderer/src/store/backup.ts` | Backup state slice |
| `src/renderer/src/store/nutstore.ts` | Nutstore state |
| `src/renderer/src/store/settings.ts` | Backup settings (webdav*, s3*, local*) |

### Reference Guide

#### [New Stack] Logic-Only Reference
- Extract: Backup data serialization format, WebDAV protocol usage, S3 SDK usage, LAN mDNS discovery protocol, auto-sync timer logic, max backup cleanup
- Ignore: Redux backup/nutstore slices, Ant Design backup settings forms

### Static Resources

None.

### Environment Variables

None — uses WebDAV/S3 credentials from settings.

---

## For /speckit.specify

### Existing Feature Summary

Backup & Sync handles data backup/restore across 5 destinations: WebDAV servers, S3-compatible storage, local directories, Nutstore (Chinese cloud), and LAN peer-to-peer transfer. Supports auto-sync with configurable intervals, max backup count, and progress reporting.

### Draft Requirements

- **FR-062**: Implement backup serialization (compress app state to transferable format)
- **FR-063**: Implement WebDAV backup/restore with directory management
- **FR-064**: Implement S3-compatible backup/restore
- **FR-065**: Implement local directory backup/restore
- **FR-066**: Implement LAN peer-to-peer transfer via mDNS discovery
- **FR-067**: Implement auto-sync with configurable interval and max backup count

### Draft Acceptance Criteria

- **SC-035**: Backup completes with progress reporting
- **SC-036**: Restore correctly replaces app state
- **SC-037**: Auto-sync fires at configured interval
- **SC-038**: LAN transfer discovers peers and transfers data

---

## For /speckit.plan

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-app-core | IPC, File | Backup files stored via file system |
| F002-settings-theme | Config | Backup destination configs in settings |

### Related Entities

#### Owned Entities

**WebDavConfig** — 7 fields
**S3Config** — 11 fields

---

## For /speckit.analyze

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| State format | F002 | Verify backup format includes all persisted settings |
| Auto-sync trigger | F002 | Verify auto-sync settings correctly trigger backup |
