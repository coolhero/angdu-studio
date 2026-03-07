# Pre-Context: Data Management

**Feature ID**: F005
**Tier**: Tier 2
**Generated**: 2026-03-02

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` → `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/main/services/BackupManager.ts` | Backup orchestration |
| `src/main/services/WebDav.ts` | WebDAV client |
| `src/main/services/S3Storage.ts` | S3-compatible storage |
| `src/main/services/NutstoreService.ts` | Nutstore SSO integration |
| `src/main/services/lanTransfer/` | LAN file transfer |
| `src/main/services/LocalTransferService.ts` | Local transfer service |
| `src/main/services/StoreSyncService.ts` | Redux state sync across windows |
| `src/main/services/ReduxService.ts` | Redux state persistence (main process) |
| `src/renderer/src/services/BackupService.ts` | Renderer backup service |
| `src/renderer/src/services/NutstoreService.ts` | Renderer Nutstore service |
| `src/renderer/src/store/backup.ts` | Backup Redux slice |
| `src/renderer/src/store/nutstore.ts` | Nutstore Redux slice |
| `src/renderer/src/store/settings.ts` | Settings slice (WebDAV/S3 config) |
| `src/renderer/src/pages/settings/DataSettings.tsx` | Data settings UI |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [Same Stack] Implementation Reference
- Actively reference and reuse existing implementation patterns
- **Key reference points**: Backup orchestration pipeline (BackupManager), WebDAV/S3 client abstractions, Redux state synchronization across Electron windows
- **Reusable code**:
  - `src/main/services/BackupManager.ts:BackupManager` — Backup/restore orchestration with stage-based progress reporting; reuse the 6-stage pipeline pattern
  - `src/main/services/WebDav.ts:WebDav` — WebDAV client with SSL permissive mode and connection testing; reuse auth and error handling patterns
  - `src/main/services/S3Storage.ts:S3Storage` — S3-compatible storage abstraction supporting AWS, Aliyun OSS, Tencent COS, Volcengine TOS
  - `src/main/services/NutstoreService.ts:NutstoreService` — Nutstore SSO OAuth flow integration
  - `src/main/services/lanTransfer/` — mDNS-based peer discovery and file transfer protocol
  - `src/main/services/StoreSyncService.ts:StoreSyncService` — Cross-window Redux state synchronization pattern
  - `src/main/services/ReduxService.ts:ReduxService` — Main-process Redux state persistence and hydration
  - `src/renderer/src/services/BackupService.ts:BackupService` — Renderer-side backup coordination via IPC
  - `src/renderer/src/store/backup.ts` — Backup state management slice with progress tracking

### Static Resources

None

### Environment Variables

None — WebDAV/S3/Nutstore credentials are stored in Redux state (settings slice), not as environment variables.

**Shared variables** (defined by other Features but also used here):

None

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

The Data Management feature provides comprehensive backup, restore, and synchronization capabilities for all application data. It supports multiple storage backends (local ZIP, WebDAV, S3-compatible services, Nutstore) and enables peer-to-peer LAN transfer. It also manages cross-window Redux state synchronization to keep multiple Electron windows in sync.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Local backup | User creates a local ZIP backup of all app data (assistants, topics, messages, settings) and can restore from it later |
| P1 | WebDAV sync | User configures WebDAV server credentials, tests connection, and performs backup/restore operations to remote WebDAV storage |
| P1 | S3 backup | User configures S3-compatible storage (AWS, Aliyun OSS, Tencent COS, Volcengine TOS) and performs backup/restore with optional auto-sync |
| P2 | Nutstore integration | User authenticates via Nutstore SSO OAuth and syncs data through Nutstore cloud storage |
| P2 | LAN transfer | User discovers peers on the same local network via mDNS and transfers app data directly between devices |
| P2 | Redux state sync | Application keeps Redux state synchronized across multiple Electron windows in real time |
| P3 | Auto-sync | User enables automatic S3 sync on a configurable interval for hands-free backup |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Local backup to ZIP archive (zlib level 1, ZIP64 support)
- **FR-002**: WebDAV backup/restore with SSL permissive mode
- **FR-003**: S3-compatible backup/restore (AWS, Aliyun OSS, Tencent COS, Volcengine TOS)
- **FR-004**: Nutstore integration with SSO OAuth
- **FR-005**: LAN peer-to-peer transfer via mDNS discovery
- **FR-006**: Atomic restore (close connections → replace data → reload state)
- **FR-007**: Backup progress reporting with 6 stages
- **FR-008**: Cross-window Redux state synchronization
- **FR-009**: Auto-sync on configurable interval (S3)

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: Backup/restore cycle preserves all app data (assistants, topics, messages, settings)
- **SC-002**: WebDAV connection test validates before sync attempt
- **SC-003**: LAN transfer discovers peers on same network within 5 seconds
- **SC-004**: Restore handles files up to several GB without memory exhaustion

### Edge Cases

- WebDAV server with self-signed SSL certificates requires permissive mode
- S3 endpoint variations across providers (path-style vs virtual-hosted-style)
- ZIP64 handling for backups exceeding 4 GB
- Atomic restore must close all active database connections before replacing data files
- LAN transfer when multiple network interfaces are present
- Redux state conflict resolution when multiple windows modify state simultaneously
- Network interruption during backup/restore requiring retry or rollback
- Nutstore SSO token expiry mid-sync

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-platform | IPC infrastructure | Uses Electron IPC channels for main↔renderer backup communication |
| F001-platform | File system | Uses file system APIs for local backup/restore and data directory management |

### Related Entities (data-model.md draft)

#### Owned Entities

**WebDavConfig** — Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| host | string | required | WebDAV server URL |
| username | string | required | WebDAV username |
| password | string | required | WebDAV password |
| path | string | required | Remote directory path |
| sslPermissive | boolean | optional, default false | Allow self-signed SSL certificates |

**S3Config** — Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| endpoint | string | required | S3-compatible endpoint URL |
| accessKeyId | string | required | Access key ID |
| secretAccessKey | string | required | Secret access key |
| bucket | string | required | Bucket name |
| region | string | optional | AWS region or equivalent |
| autoSyncInterval | number | optional | Auto-sync interval in minutes |

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| FileMetadata | F001-platform | Read access | Backup includes file metadata for all managed files |
| User | F001-platform | Read access | Backup includes user preferences and configuration |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| IPC | backup:create | Create local ZIP backup of all app data |
| IPC | backup:restore | Restore app data from ZIP archive |
| IPC | webdav:test | Test WebDAV connection with provided credentials |
| IPC | webdav:backup | Upload backup to WebDAV server |
| IPC | webdav:restore | Download and restore from WebDAV server |
| IPC | s3:backup | Upload backup to S3-compatible storage |
| IPC | s3:restore | Download and restore from S3-compatible storage |
| IPC | nutstore:auth | Authenticate with Nutstore via SSO OAuth |
| IPC | nutstore:sync | Sync data with Nutstore |
| IPC | lan:discover | Discover peers on LAN via mDNS |
| IPC | lan:transfer | Transfer data to discovered LAN peer |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| IPC | file:read | F001-platform | Read data files for backup packaging |
| IPC | file:write | F001-platform | Write restored data files |

### Technical Decisions

#### [Same Stack]
- **Recommended reuse patterns**: BackupManager orchestration pipeline with stage-based progress; WebDAV/S3 client abstraction pattern; Redux state sync via Electron IPC broadcast
- **Existing libraries**: archiver/ZIP — ZIP archive creation with zlib compression; @aws-sdk/client-s3 — S3-compatible storage client; webdav — WebDAV client library; bonjour/mdns — mDNS peer discovery
- **Existing architecture decisions**: Backup uses a 6-stage pipeline (prepare → export → compress → upload → verify → cleanup); restore is atomic (close connections → replace → reload); S3 supports multiple provider endpoints via unified configuration

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| File system access patterns | F001-platform | Verify that backup file read/write operations use the same file system abstraction as F001 |
| Data completeness | F002-ai-foundation | Verify that backup includes all provider and model configurations owned by F002 |
| Data completeness | F003-chat | Verify that backup includes all chat messages, topics, and assistant data |
| Redux state shape | F001-platform | Verify that StoreSyncService handles all Redux slices from all features consistently |
| Settings slice compatibility | F001-platform | Verify that WebDAV/S3 config fields in settings slice match the entity definitions |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F001-platform | File system dependency | If backup file format changes, F001's file management may need updates |
| F002-ai-foundation | Data format impact | If backup serialization changes, provider/model data export format must stay compatible |
| F003-chat | Data format impact | If backup serialization changes, chat/message data export format must stay compatible |
