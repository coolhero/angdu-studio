# F008 — Data & Storage — Pre-Context

> Feature ID: F008 | Tier: 1 | Release Group: RG-1

---

## Source Reference

| Key Source Files | Purpose |
|-----------------|---------|
| `src/renderer/src/databases/index.ts` | Dexie database: files, topics, message_blocks, settings, etc. |
| `src/renderer/src/databases/upgrades.ts` | Dexie schema migrations (v5, v7, v8) |
| `src/main/services/FileStorage.ts` | File upload, download, delete, temp file management |
| `src/main/services/BackupManager.ts` | Local backup/restore (ZIP) |
| `src/main/services/CacheService.ts` | Cache management |
| `src/main/ipc.ts` | File_*, Backup_*, Fs_*, Zip_*, App_ClearCache handlers |
| `src/main/utils/file.ts` | File path utilities (getFilesDir, getCacheDir, etc.) |
| `src/renderer/src/types/file.ts` | FileMetadata, FileType types |

---

## Source Behavior Inventory (SBI)

| ID | Source File | Function/Method | Behavior | Pri | Origin |
|----|-----------|----------------|----------|-----|--------|
| B092 | `databases/index.ts` | `db = new Dexie('CherryStudio')` | IndexedDB with tables: files, topics, message_blocks, settings, knowledge_notes, quick_phrases | P1 | Source |
| B093 | `databases/index.ts` | Schema versions 1-10 | Progressive schema migrations; v7 extracts message_blocks from messages | P1 | Source |
| B094 | `FileStorage.ts` | `uploadFile()` | Upload file to managed storage; assigns UUID name, preserves origin_name | P1 | Source |
| B095 | `FileStorage.ts` | `deleteFile()` / `clear()` | Delete single file or clear all; removes from filesystem | P1 | Source |
| B096 | `FileStorage.ts` | `readFile()` / `readExternalFile()` | Read managed or external file contents | P1 | Source |
| B097 | `FileStorage.ts` | `createTempFile()` / `clearTemp()` | Temp file lifecycle management | P2 | Source |
| B098 | `BackupManager.ts` | `backup()` / `restore()` | Create/restore ZIP backup of all app data | P1 | Source |
| B099 | `BackupManager.ts` | `backupToLocalDir()` / `restoreFromLocalBackup()` | Directory-based backup/restore | P1 | Source |
| B100 | `BackupManager.ts` | `listLocalBackupFiles()` / `deleteLocalBackupFile()` | Backup file management | P2 | Source |
| B101 | `ipc.ts` | `App_ClearCache` | Clears session storage, cookies, filesystem, shader cache + temp files | P2 | Source |
| B102 | `ipc.ts` | `App_GetCacheSize` | Calculates cache directory size in MB | P2 | Source |
| B103 | `types/file.ts` | `FileMetadata` | File entity: id, name, origin_name, path, size, ext, type, created_at, count, tokens | P1 | Source |
| B104 | `ipc.ts` | `App_SetAppDataPath` / `App_Copy` | Data directory migration: copy to new location, update path | P2 | Source |
| B105 | `utils/file.ts` | `getFilesDir()` / `getCacheDir()` / `getConfigDir()` | Platform-specific path resolution | P1 | Source |
| B106 | `ipc.ts` | `Aes_Encrypt` / `Aes_Decrypt` | AES encryption for sensitive data at rest | P1 | Source |

---

## For /speckit.specify Hints

- Define unified SQLite schema (replaces Dexie)
- Specify Drizzle ORM table definitions
- Document file storage directory structure
- Define backup format (ZIP contents)
- Specify data migration from Dexie schema to SQLite

## For /speckit.plan Hints

- Task 1: SQLite database setup with Drizzle ORM
- Task 2: Schema definitions for all entities
- Task 3: File storage service (main process)
- Task 4: Backup/restore service (ZIP)
- Task 5: Cache management
- Task 6: Data path and directory utilities
- Task 7: AES encryption service

---

## Feature Contracts

| Direction | Feature | Contract |
|-----------|---------|----------|
| Provides to F001 | Electron Shell | Data path init, close connections on shutdown |
| Provides to F006 | Chat Core | Message/block persistence, file attachments |
| Provides to F007 | Settings System | Settings persistence |
| Provides to F011 | Knowledge Base | File ingestion, item storage |
| Provides to F012 | MCP Integration | DXT file handling |
| Provides to All | — | SQLite database, file storage, encryption |
