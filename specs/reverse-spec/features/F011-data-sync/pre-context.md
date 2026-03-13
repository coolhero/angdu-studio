# F011-data-sync Pre-Context

> Feature: Backup/restore, WebDAV/S3/Nutstore cloud sync, local transfer, data migration
> Tier: 3 | Risk Group: RG-3 | Dependencies: F001, F003

---

## 1. Runtime Exploration Results

### Settings: Data Management (inferred from source)

**No dedicated route** -- data sync is managed via Settings sub-pages

**UI Elements (from source files)**:
- `WebdavBackupManager.tsx` -- WebDAV backup/restore UI
- `S3BackupManager.tsx` -- S3 backup/restore UI
- `LocalBackupManager.tsx` -- Local directory backup/restore UI
- Nutstore integration (SSO login, auto-sync)
- LAN transfer via Bonjour/mDNS discovery

---

## 2. Source Reference

| # | Source File | Role | Rebuild Target |
|---|------------|------|----------------|
| 1 | `src/main/services/BackupManager.ts` | Core backup/restore engine: zip archive, WebDAV, S3, local | [TBD] |
| 2 | `src/main/services/WebDav.ts` | WebDAV client wrapper (webdav library) | [TBD] |
| 3 | `src/main/services/S3Storage.ts` | S3 client wrapper (AWS SDK v3) | [TBD] |
| 4 | `src/main/services/NutstoreService.ts` | Nutstore WebDAV + SSO integration | [TBD] |
| 5 | `src/main/services/LocalTransferService.ts` | LAN peer discovery via Bonjour/mDNS | [TBD] |
| 6 | `src/renderer/src/store/backup.ts` | Redux slice for sync state (-> Zustand) | [TBD] |
| 7 | `src/renderer/src/store/nutstore.ts` | Redux slice for Nutstore config (-> Zustand) | [TBD] |
| 8 | `src/renderer/src/store/migrate.ts` | Data migration across app versions | [TBD] |
| 9 | `src/renderer/src/components/WebdavBackupManager.tsx` | WebDAV backup UI component | [TBD] |
| 10 | `src/renderer/src/components/S3BackupManager.tsx` | S3 backup UI component | [TBD] |
| 11 | `src/renderer/src/components/LocalBackupManager.tsx` | Local backup UI component | [TBD] |

**[New Stack] Logic-Only Reference**: BackupManager, WebDav, S3Storage, NutstoreService are stack-independent main-process code. Store: Redux -> Zustand. UI: Ant Design -> shadcn/ui.

---

## 3. Source Behavior Inventory

### BackupManager (main process) -- P1

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B277 | backup | `(_, fileName, data, destinationPath?, skipBackupFile?) => Promise<string>` | P1 |
| B278 | restore | `(_, backupPath) => Promise<string>` | P1 |
| B279 | backupToWebdav | `(_, data, webdavConfig) => Promise<...>` | P1 |
| B280 | restoreFromWebdav | `(_, webdavConfig) => Promise<string>` | P1 |
| B281 | listWebdavFiles | `(_, config) => Promise<FileInfo[]>` | P2 |
| B282 | deleteWebdavFile | `(_, fileName, config) => Promise<void>` | P2 |
| B283 | checkConnection | `(_, webdavConfig) => Promise<boolean>` | P1 |
| B284 | backupToS3 | `(_, data, s3Config) => Promise<...>` | P1 |
| B285 | restoreFromS3 | `(_, s3Config) => Promise<string>` | P1 |
| B286 | listS3Files | `(_, s3Config) => Promise<FileInfo[]>` | P2 |
| B287 | deleteS3File | `(_, fileName, s3Config) => Promise<void>` | P2 |
| B288 | checkS3Connection | `(_, s3Config) => Promise<boolean>` | P1 |
| B289 | backupToLocalDir | `(_, data, fileName, localConfig) => Promise<string>` | P1 |
| B290 | restoreFromLocalBackup | `(_, fileName, localBackupDir) => Promise<string>` | P1 |
| B291 | listLocalBackupFiles | `(_, localBackupDir) => Promise<FileInfo[]>` | P2 |
| B292 | deleteLocalBackupFile | `(_, fileName, localBackupDir) => Promise<boolean>` | P2 |
| B293 | createLanTransferBackup | `(_, data) => Promise<string>` | P2 |
| B294 | deleteTempBackup | `(_, filePath) => Promise<boolean>` | P3 |
| B295 | createDirectory | `(_, webdavConfig, path, options?) => Promise<...>` | P3 |

### WebDav (main process) -- P1

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B296 | putFileContents | `(filename, data, options?) => Promise<...>` | P1 |
| B297 | getFileContents | `(filename, options?) => Promise<Buffer>` | P1 |
| B298 | getDirectoryContents | `() => Promise<FileStat[]>` | P2 |
| B299 | checkConnection | `() => Promise<boolean>` | P1 |
| B300 | createDirectory | `(path, options?) => Promise<...>` | P3 |
| B301 | deleteFile | `(filename) => Promise<void>` | P2 |

### S3Storage (main process) -- P1

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B302 | putFileContents | `(key, data) => Promise<...>` | P1 |
| B303 | getFileContents | `(key) => Promise<Buffer>` | P1 |
| B304 | deleteFile | `(key) => Promise<void>` | P2 |
| B305 | listFiles | `(prefix?) => Promise<FileInfo[]>` | P2 |
| B306 | checkConnection | `() => Promise<boolean>` | P1 |

### NutstoreService (main process) -- P2

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B307 | getNutstoreSSOUrl | `() => Promise<string>` | P2 |
| B308 | decryptToken | `(token) => Promise<OAuthResponse \| null>` | P2 |
| B309 | getDirectoryContents | `(token, target) => Promise<FileStat[]>` | P2 |

### LocalTransferService (main process) -- P2

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B310 | startDiscovery | `(options?) => LocalTransferState` | P2 |
| B311 | stopDiscovery | `() => LocalTransferState` | P2 |
| B312 | getState | `() => LocalTransferState` | P2 |
| B313 | getPeerById | `(id) => LocalTransferPeer \| undefined` | P3 |
| B314 | dispose | `() => void` | P3 |

### Backup Store (renderer) -- P1

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B315 | setWebDAVSyncState | `(state: Partial<RemoteSyncState>) => void` | P1 |
| B316 | setLocalBackupSyncState | `(state: Partial<RemoteSyncState>) => void` | P1 |
| B317 | setS3SyncState | `(state: Partial<RemoteSyncState>) => void` | P1 |

### Nutstore Store (renderer) -- P2

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B318 | setNutstoreToken | `(token: string) => void` | P2 |
| B319 | setNutstorePath | `(path: string) => void` | P2 |
| B320 | setNutstoreAutoSync | `(enabled: boolean) => void` | P2 |
| B321 | setNutstoreSyncInterval | `(interval: number) => void` | P2 |
| B322 | setNutstoreSyncState | `(state: Partial<RemoteSyncState>) => void` | P2 |
| B323 | setNutstoreSkipBackupFile | `(skip: boolean) => void` | P3 |
| B324 | setNutstoreMaxBackups | `(max: number) => void` | P3 |

---

## 4. UI Component Features

| Source Component | Library | Replacement |
|-----------------|---------|-------------|
| Backup manager components | Ant Design (Button, Input, Switch, Progress, etc.) | shadcn/ui equivalents |
| `styled-components` | styled-components | Tailwind CSS 4 |

---

## 5. Interaction Behavior Inventory

| Pattern | Details |
|---------|---------|
| Backup progress | Real-time progress via IPC (BackupProgress/RestoreProgress channels) |
| Connection check | Test connection before sync with visual feedback |
| Auto-sync | Configurable interval for Nutstore auto-sync |
| File listing | List remote backup files with sort by date |
| Selective backup | Skip Data directory (files only) option |
| LAN discovery | Bonjour/mDNS service discovery with peer list updates |
| LAN transfer | Create lightweight backup for transfer to discovered peer |
| Migration | Version-based data migration on app update |

---

## 6. Naming Remapping

| Original | Location | Remap To |
|----------|----------|----------|
| `cherry-studio` | BackupManager.ts:38-39 (temp dir paths) | `angdu-studio` |
| `cherry-studio.backup.zip` | BackupManager.ts:447,475,646,725 (filenames) | `angdu-studio.backup.zip` |
| `cherry-studio.{timestamp}.zip` | BackupManager.ts:801 (LAN transfer) | `angdu-studio.{timestamp}.zip` |
| `cherry-studio` | BackupManager.ts:802 (temp path) | `angdu-studio` |
| `cherrystudio` | NutstoreService.ts:40,47 (SSO app name) | `angdustudio` |
| `cherrystudio` | LocalTransferService.ts:9 (SERVICE_TYPE) | `angdustudio` |
| `/cherry-studio` | store/nutstore.ts:37 (default Nutstore path) | `/angdu-studio` |
| `CherryHQ/cherry-studio` | store/backup.ts, nutstore.ts (comments) | Remove/update |

---

## 7. Static Resources

- None specific to this feature

---

## 8. Environment Variables

- S3 config: endpoint, region, bucket, accessKeyId, secretAccessKey (user-configured)
- WebDAV config: host, user, pass, path (user-configured)
- Nutstore SSO: OAuth token flow

---

## 9. For /speckit.specify

### Summary
Data sync feature provides backup/restore functionality to multiple destinations (local directory, WebDAV, S3, Nutstore) and LAN peer-to-peer transfer. Backups serialize Redux state as data.json plus the Data directory into a ZIP archive.

### Key Scenarios
- SC-F011-01: User creates a backup to local directory
- SC-F011-02: User restores from a local backup file
- SC-F011-03: User configures and syncs to WebDAV server
- SC-F011-04: User configures and syncs to S3 bucket
- SC-F011-05: User connects Nutstore via SSO and enables auto-sync
- SC-F011-06: User discovers LAN peers and transfers data
- SC-F011-07: User lists and deletes old backup files

### Draft Functional Requirements
- FR-F011-01: Backup shall serialize app state + Data directory into a ZIP archive
- FR-F011-02: Restore shall extract ZIP, write data.json back to store, copy Data directory
- FR-F011-03: WebDAV sync shall support stream and buffer upload modes
- FR-F011-04: S3 sync shall use AWS SDK v3 with virtual/path-style detection
- FR-F011-05: Backup progress shall be reported in real-time via IPC
- FR-F011-06: Restore shall close all DB connections before replacing Data directory
- FR-F011-07: LAN transfer shall use Bonjour/mDNS for peer discovery
- FR-F011-08: Nutstore shall support SSO OAuth login and auto-sync intervals

### Edge Cases
- Backup during active file operations -> potential data inconsistency
- Restore fails mid-way -> partial state corruption
- WebDAV server timeout -> retry logic needed
- S3 bucket permissions insufficient -> clear error message
- LAN peer disappears during transfer -> graceful failure
- ZIP file > 4GB -> ZIP64 support enabled

---

## 10. For /speckit.plan

### Dependencies
- F001 (Core): IPC, store persistence, app paths
- F003 (Settings): Backup/sync configuration UI in settings

### Entities Owned
- `BackupState`: webdavSync, localBackupSync, s3Sync (each: lastSyncTime, syncing, lastSyncError)
- `NutstoreState`: token, path, autoSync, syncInterval, syncState, skipBackupFile, maxBackups
- `WebDavConfig`, `S3Config`: connection configuration types
- `LocalTransferPeer`, `LocalTransferState`: LAN discovery types

### Key APIs (IPC)
- `backup.backup`, `backup.restore`
- `backup.backupToWebdav`, `backup.restoreFromWebdav`, `backup.listWebdavFiles`, `backup.deleteWebdavFile`
- `backup.backupToS3`, `backup.restoreFromS3`, `backup.listS3Files`, `backup.deleteS3File`
- `backup.backupToLocalDir`, `backup.restoreFromLocalBackup`, `backup.listLocalBackupFiles`
- `backup.checkConnection`, `backup.checkS3Connection`
- `backup.createLanTransferBackup`, `backup.deleteTempBackup`
- `nutstore.getSSOUrl`, `nutstore.decryptToken`, `nutstore.getDirectoryContents`
- `localTransfer.startDiscovery`, `localTransfer.stopDiscovery`, `localTransfer.getState`

### Tech Decisions
- Archive format: ZIP with ZIP64 support (archiver library, zlib level 1)
- S3: AWS SDK v3 (`@aws-sdk/client-s3`)
- WebDAV: `webdav` npm package
- Nutstore: Custom WebDAV + SSO via `fast-xml-parser`
- LAN: `bonjour-service` for mDNS discovery
- Stream-based file operations for large backups
- Close all DB connections before restore (`closeAllDataConnections`)

---

## 11. Feature Contracts

### Guarantees
- Backup creates a complete snapshot (state + files)
- Restore is atomic: closes all connections, replaces Data dir, returns state JSON
- Temp files cleaned up after backup/restore (even on error)
- Security: temp backup deletion restricted to temp directory path

### Dependencies on Other Features
- F001: App paths, IPC infrastructure
- F003: Configuration UI
- F009: Knowledge base DB connections closed via `closeAll()` before restore

### Failure Modes
- Disk full during backup -> error thrown, temp cleaned up
- Network error during cloud sync -> error propagated to UI
- Read-only files in Data dir (Windows) -> force chmod before operations
- Restore interrupted -> partial data loss possible
- Nutstore token expired -> re-auth required

---

## 12. For /speckit.analyze

### Cross-Feature Verification
- F011 <-> F001 (Core): Operates on entire app state and Data directory
- F011 <-> F009 (Knowledge): Must close all KB connections before restore
- F011 <-> F010 (Notes): Notes path may become invalid after cross-platform restore
- F011 <-> F003 (Settings): Sync configuration stored in settings

### Impact Scope
- Backup/restore affects ALL features -- it serializes/deserializes the entire app state
- Migration logic (migrate.ts) runs on every app update to transform stored data
- Cloud sync is a background operation that can conflict with active user operations
