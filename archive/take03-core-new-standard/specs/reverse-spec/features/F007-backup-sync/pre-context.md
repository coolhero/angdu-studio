# Pre-Context: Backup & Sync

**Feature ID**: F007
**Tier**: Tier 2
**Generated**: 2026-03-04

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/renderer/src/services/BackupService.ts` | Backup orchestration service (renderer) |
| `src/renderer/src/store/backup.ts` | Backup state slice |
| `src/main/services/BackupManager.ts` | Backup/restore service (main process) |
| `src/main/services/S3Storage.ts` | S3-compatible storage integration (if exists) |
| `src/main/services/WebDav.ts` | WebDAV storage integration (if exists) |
| `src/main/services/lanTransfer/` | LAN peer-to-peer transfer (mDNS discovery, file transfer) |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Extract: Backup data serialization format (v1-v5), WebDAV protocol usage, S3 SDK integration, LAN mDNS discovery protocol, auto-sync timer logic, max backup cleanup, retry strategies, data versioning/migration logic, per-device retention rules, factory reset procedure
- Ignore: Redux backup slice (migrating to Zustand), Ant Design backup settings forms (migrating to shadcn/ui), styled-components styling (migrating to Tailwind)

### Static Resources

None.

### Environment Variables

None -- uses WebDAV/S3 credentials from settings store.

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

Backup & Sync handles data backup/restore across multiple destinations: WebDAV servers, S3-compatible storage, local directories, and LAN peer-to-peer transfer. The system supports 5 backup format versions (v1-v5) with forward migration on restore. Includes auto-sync with configurable intervals, retry on failure, max backup count enforcement, progress reporting, per-device retention policies, and factory reset capability.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Manual Backup | User triggers backup to WebDAV/S3/local; data is serialized, compressed, and uploaded with progress |
| P1 | Restore | User selects a backup; data is downloaded, migrated if needed, and app state is replaced |
| P1 | Auto-Sync | App periodically backs up to configured destination with configurable interval |
| P2 | LAN Transfer | User discovers peer devices on LAN via mDNS and transfers data directly |
| P2 | Factory Reset | User resets app to default state, clearing all user data |
| P3 | Per-Device Retention | Old backups are pruned per device based on retention policy |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Implement multi-backend backup (WebDAV, S3, local directory)
- **FR-002**: Implement auto-sync with configurable interval and retry on failure
- **FR-003**: Implement data versioning with backup format versions (v1-v5) and restore-time migration
- **FR-004**: Implement restore with state replacement and progress reporting
- **FR-005**: Implement LAN peer-to-peer transfer via mDNS device discovery
- **FR-006**: Implement per-device backup retention and max backup count enforcement
- **FR-007**: Implement factory reset with full data cleanup

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: Backup completes with progress reporting for all backend types
- **SC-002**: Restore correctly replaces app state and handles format migration across versions
- **SC-003**: Auto-sync fires at configured interval and retries on transient failures
- **SC-004**: LAN transfer discovers peers on the same network and completes data transfer
- **SC-005**: Factory reset clears all user data and returns app to initial state

### Edge Cases

- WebDAV server unreachable during auto-sync (retry with backoff)
- S3 credentials expired or rotated mid-backup
- Restore of a v1 backup to current app version (multi-step migration)
- LAN transfer interrupted mid-file (partial state cleanup)
- Concurrent backup attempts from auto-sync and manual trigger
- Backup file corruption detection before restore

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-core-platform | IPC, File | Backup files stored via file system; IPC channels for backup operations |

### Related Entities (data-model.md draft)

#### Owned Entities

**BackupState** -- Refer to the corresponding section in entity-registry.md

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: BackupManager in main process handles serialization and multi-backend upload/download. BackupService in renderer orchestrates UI interactions. Auto-sync is timer-based with configurable interval. Five backup format versions with migration chain.
- **Recommended implementation approach**: Keep main process BackupManager logic. Replace Redux backup slice with Zustand store. Replace Ant Design backup settings forms with shadcn/ui components. Core serialization and protocol logic is framework-agnostic.
- **Caveats**: Backup format versions encode Redux-shaped state; migration logic may need adaptation if the persisted state shape changes significantly under Zustand.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| State format | F001-core-platform | Verify backup format includes all persisted settings and app state |
| Settings integration | F008-settings-ui | Verify backup destination configs (WebDAV, S3, local) are correctly read from settings |
| Chat data inclusion | F005-ai-chat | Verify backup includes all conversation and message data |
| Knowledge data inclusion | F004-knowledge-base | Verify backup includes knowledge base data and embeddings |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F008-settings-ui | Config dependency | If backup destination config schema changes, settings UI must update |
| F001-core-platform | Data format | If backup format version changes, restore migration chain must be extended |
