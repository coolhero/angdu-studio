# F013-backup Pre-Context

## Feature Identity

| Field | Value |
|-------|-------|
| ID | F013 |
| Name | backup |
| Title | Backup & Restore — Local, WebDAV, S3 |
| Tier | 3 |
| Risk Group | RG-4 |
| Dependencies | F004-settings, F007-files |
| SBI Range | B210 – B225 |

## Project Context

- **Original**: Cherry Studio (`/Users/coolhero/Develop/cherry-studio`)
- **New**: Angdu Studio — Electron + React 19 + Zustand + Tailwind 4 + shadcn/ui + Vite 7
- **Naming**: Cherry -> Angdu, CS -> AS

## Key Source Files (relative to cherry-studio)

| Path | Role |
|------|------|
| `src/main/services/BackupManager.ts` | Core backup/restore logic (local, WebDAV, S3) |
| `src/renderer/src/store/backup.ts` | Backup configuration and status state |
| `src/main/ipc.ts` | IPC handlers: Backup_* channel handlers |

## SBI Table

| ID | Source File | Function/Method | Behavior Description | Priority | Origin |
|----|-------------|----------------|---------------------|----------|--------|
| B210 | main/services/BackupManager.ts | backup() | Creates local backup archive | P1 | extracted |
| B211 | main/services/BackupManager.ts | restore() | Restores from local backup | P1 | extracted |
| B212 | main/services/BackupManager.ts | backupToWebdav() | Uploads backup to WebDAV server | P1 | extracted |
| B213 | main/services/BackupManager.ts | restoreFromWebdav() | Downloads and restores from WebDAV | P1 | extracted |
| B214 | main/services/BackupManager.ts | backupToS3() | Uploads backup to S3 bucket | P2 | extracted |
| B215 | main/services/BackupManager.ts | restoreFromS3() | Downloads and restores from S3 | P2 | extracted |
| B216 | main/services/BackupManager.ts | backupToLocalDir() | Creates backup in specified local directory | P2 | extracted |
| B217 | main/services/BackupManager.ts | restoreFromLocalBackup() | Restores from local directory backup | P2 | extracted |
| B218 | main/services/BackupManager.ts | deleteTempBackup() | Cleans up temporary backup files | P3 | extracted |
| B219 | main/ipc.ts | Backup_Backup() | IPC handler for local backup | P1 | extracted |
| B220 | main/ipc.ts | Backup_Restore() | IPC handler for local restore | P1 | extracted |
| B221 | main/ipc.ts | Backup_BackupToWebdav() | IPC handler for WebDAV backup | P1 | extracted |
| B222 | main/ipc.ts | Backup_RestoreFromWebdav() | IPC handler for WebDAV restore | P1 | extracted |
| B223 | main/ipc.ts | Backup_BackupToS3() | IPC handler for S3 backup | P2 | extracted |
| B224 | store/backup.ts | updateBackupConfig() | Updates backup configuration (schedule, targets) | P2 | extracted |
| B225 | store/backup.ts | setLastBackupTime() | Records last successful backup timestamp | P2 | extracted |

## Priority Summary

- **P1 (Must)**: 8 behaviors — local backup/restore, WebDAV backup/restore, and their corresponding IPC handlers
- **P2 (Should)**: 6 behaviors — S3 backup/restore, local-dir backup/restore, S3 IPC handler, config update, last backup time
- **P3 (Nice)**: 1 behavior — temp cleanup

## Dependency Notes

- **F004-settings**: Backup configuration UI lives in settings; schedule and target preferences stored via settings infrastructure
- **F007-files**: File I/O for creating/reading backup archives, directory management

## Migration Notes

- `BackupManager.ts` is a main-process service — no React/UI migration needed, but TypeScript and module format must align with new Electron main config
- Redux slice (`store/backup.ts`) migrates to Zustand store
- IPC handlers follow the Backup_* naming convention; migrate to typed IPC pattern in Angdu Studio
- WebDAV: uses `webdav` npm package — verify compatibility
- S3: uses AWS SDK — verify v3 SDK compatibility with Electron main process bundling
- Backup archive format (zip/tar) and data structure must remain backward-compatible if cross-migration is desired
