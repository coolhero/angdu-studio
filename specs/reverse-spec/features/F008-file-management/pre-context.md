# Pre-Context: File Management

**Feature ID**: F008-file-management
**Tier**: Tier 2
**Generated**: 2026-03-07

---

## Source Reference

**Source Root**: `/Users/coolhero/Develop/cherry-studio`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/main/services/FileStorage.ts` | Core file operations (upload, read, delete, extract content) |
| `src/main/services/BackupManager.ts` | Backup/restore orchestration (local, WebDAV, S3) |
| `src/main/services/ExportService.ts` | Export conversations to various formats (DOCX, Markdown, etc.) |
| `src/main/services/S3Storage.ts` | S3-compatible object storage operations |
| `src/main/services/WebDav.ts` | WebDAV storage operations |
| `src/main/services/FileSystemService.ts` | Low-level file system utilities |
| `src/renderer/src/services/FileManager.ts` | Renderer-side file management (IPC wrapper) |
| `src/renderer/src/services/BackupService.ts` | Renderer-side backup service (IPC wrapper) |
| `src/renderer/src/hooks/useFiles.ts` | React hooks for file operations |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding **file upload with duplicate detection and image compression (>1MB), file read with encoding detection, file deletion with reference counting, content extraction (PDF, DOCX, TXT, etc.), backup orchestration (full app state -> zip -> upload), restore orchestration (download -> unzip -> merge), WebDAV operations (upload, download, list, delete, mkdir), S3 operations (upload, download, list, delete), local backup (copy to path), export to DOCX/Markdown/PDF, file watcher with debounce, ripgrep integration for content search**
- Do not reference: Redux patterns (migrating to Zustand), Ant Design components in file-related UI (migrating to shadcn/ui + Radix), styled-components styling (migrating to Tailwind-only)
- **Extract**: File upload pipeline (duplicate detection by hash, image compression >1MB, FileMetadata creation), file content extraction strategies per document type, backup/restore state serialization format, WebDAV client configuration and operations, S3 client configuration and operations, export template rendering for DOCX/Markdown, file watcher configuration (patterns, debounce 1000ms, stability 500ms, max depth 10), ripgrep binary bundling and search API
- **Ignore**: Ant Design `Upload` / `Modal` / `Progress` / `Button` components, styled-components wrappers, Redux slice patterns

### Naming Remapping

| Original | Angdu Equivalent | Scope |
|----------|-----------------|-------|
| `cherry-studio` in backup paths | `angdu-studio` | Backup file/directory naming |
| `cherry-studio` in export metadata | `angdu-studio` | Export file metadata |

### Static Resources

> Non-code files used by this Feature that must be **copied from the original source** during implementation.
> These files cannot be regenerated -- they must be copied as-is and placed in the appropriate location in the new project.
> Source Path is **relative to Source Root** (same as file paths above). Resolve as `[Source Root]/[Source Path]` at runtime.

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| (none) | | | File management has no static resources; all files are user-generated at runtime |

> If resources need modification (e.g., resizing images, updating translation keys), note it in the Usage column.

### Environment Variables

> Environment variables required by this Feature at runtime. Variables marked as `secret` must NOT have their actual values recorded here -- only the variable name and purpose.

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| (none specific to F008) | | | WebDAV/S3 credentials come from user settings | |

**Shared variables** (defined by other Features but also used here):

| Variable | Owner Feature | Usage in This Feature |
|----------|--------------|----------------------|
| `CSLOGGER_MAIN_LEVEL` | F001-app-core | Log level for main process file operations |

---

## SBI Coverage

**SBI Range**: B251-B290

| SBI ID | Priority | Description |
|--------|----------|-------------|
| B251 | P1 | FileStorage.upload -- upload file with duplicate detection (hash), image compression (>1MB), FileMetadata creation |
| B252 | P1 | FileStorage.read -- read file with encoding detection (chardet) |
| B253 | P1 | FileStorage.delete -- delete file with reference count check |
| B254 | P1 | FileStorage.extractContent -- extract text content from documents (PDF, DOCX, TXT, etc.) |
| B255 | P1 | BackupManager.backup -- serialize full app state, create zip archive |
| B256 | P1 | BackupManager.restore -- download archive, unzip, merge state |
| B257 | P2 | BackupManager.backupToWebDAV -- upload backup archive to WebDAV server |
| B258 | P2 | BackupManager.backupToS3 -- upload backup archive to S3-compatible storage |
| B259 | P2 | BackupManager.backupToLocal -- copy backup archive to local path |
| B260 | P2 | ExportService.exportToDocx -- render conversation as DOCX document |
| B261 | P2 | S3Storage.upload -- upload file to S3-compatible bucket |
| B262 | P2 | S3Storage.download -- download file from S3-compatible bucket |
| B263 | P2 | WebDav.upload -- upload file to WebDAV server |
| B264 | P2 | WebDav.download -- download file from WebDAV server |
| B265 | P2 | WebDav.list -- list files on WebDAV server |
| B266 | P2 | WebDav.delete -- delete file from WebDAV server |
| B267 | P3 | File watcher -- watch directory for changes (debounce 1000ms, stability 500ms, max depth 10) |
| B268 | P3 | Ripgrep integration -- bundled ripgrep binary for fast content search |
| B269-B290 | P2-P3 | Additional file behaviors: export to Markdown, export to PDF, S3 list/delete, WebDav mkdir, backup scheduling, backup encryption, incremental backup detection, restore conflict resolution, file move/rename operations, file copy operations, base64 encoding/decoding, image thumbnail generation, file type detection, temp file cleanup, file size validation, storage quota tracking, backup history management, export template customization, multi-file zip download, file integrity verification |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F008-file-management provides comprehensive file operations including upload with duplicate detection (content hash) and automatic image compression (>1MB), file reading with encoding detection, content extraction from various document types (PDF, DOCX, TXT, Markdown, code), backup/restore orchestration supporting three backends (local filesystem, WebDAV, S3-compatible storage), conversation export to multiple formats (DOCX, Markdown), file watching with configurable debounce/stability, and ripgrep integration for fast content search. The backup system serializes full application state into zip archives for portability.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | File upload | User uploads a file; system detects duplicates by hash, compresses images >1MB, creates FileMetadata record |
| P1 | File read | User or system reads a file; encoding auto-detected for text files |
| P1 | Backup to cloud | User triggers backup; full app state serialized, zipped, uploaded to WebDAV or S3 |
| P1 | Restore from backup | User restores from backup; archive downloaded, unzipped, state merged |
| P2 | Export conversation | User exports a conversation to DOCX or Markdown format |
| P2 | Local backup | User backs up to a local directory |
| P2 | WebDAV sync | User configures WebDAV server for backup storage; upload/download/list operations |
| P2 | S3 sync | User configures S3-compatible storage for backup; upload/download operations |
| P2 | Content extraction | System extracts text from uploaded PDF/DOCX for knowledge base ingestion |
| P3 | File watching | System watches a directory for file changes with debounce |
| P3 | Content search | User searches file contents using ripgrep backend |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: File upload with duplicate detection (content hash) and image compression (>1MB)
- **FR-002**: File read with encoding detection (chardet)
- **FR-003**: File delete with reference count check
- **FR-004**: Document content extraction (PDF, DOCX, TXT, Markdown, code files)
- **FR-005**: Backup orchestration (serialize -> zip -> upload) with 3 backends (local, WebDAV, S3)
- **FR-006**: Restore orchestration (download -> unzip -> merge state)
- **FR-007**: WebDAV operations (upload, download, list, delete, mkdir)
- **FR-008**: S3-compatible storage operations (upload, download, list, delete)
- **FR-009**: Export to DOCX format
- **FR-010**: Export to Markdown format
- **FR-011**: File watcher (configurable patterns, debounce 1000ms, stability 500ms, max depth 10)
- **FR-012**: Ripgrep content search integration
- **FR-013**: File move, rename, copy operations
- **FR-014**: Base64 encoding/decoding for file content

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: File upload correctly detects duplicate files by content hash
- **SC-002**: Images >1MB are automatically compressed before storage
- **SC-003**: Backup creates a valid zip archive containing full app state
- **SC-004**: Restore successfully merges state from backup archive without data loss
- **SC-005**: WebDAV upload/download completes within 30 seconds for files up to 50MB
- **SC-006**: S3 upload/download completes within 30 seconds for files up to 50MB
- **SC-007**: Content extraction produces valid text from PDF, DOCX, and TXT files
- **SC-008**: DOCX export produces a valid, readable document
- **SC-009**: File watcher detects changes within debounce window (1000ms)

### Edge Cases

- Duplicate file upload (same content hash); return existing FileMetadata without re-upload
- Very large file upload (>100MB); streaming upload with progress tracking
- Corrupted backup archive; validation before restore attempt with error reporting
- WebDAV server authentication failure; retry with credentials prompt
- S3 bucket permission denied; clear error message with credentials guidance
- File encoding detection failure; fallback to UTF-8 with warning
- Content extraction from password-protected PDF; skip with error message
- Backup during active file operations; snapshot consistency
- Restore with version mismatch; migration or compatibility check
- File watcher on network drive; increased stability threshold
- Ripgrep binary not found; fallback to slower Node.js-based search

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-app-core | Infrastructure | Uses IPC framework, config persistence for backup/S3/WebDAV settings, file system utilities, app paths |

### Related Entities (data-model.md draft)

#### Owned Entities

**FileMetadata** -- Metadata for managed files

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique file identifier (UUID) |
| name | string | required | Original file name |
| path | string | required | Storage path relative to app data directory |
| size | number | required | File size in bytes |
| ext | string | required | File extension |
| type | string | required | MIME type |
| hash | string | optional | Content hash for duplicate detection |
| count | number | optional | Reference count |
| created_at | number | required | Creation timestamp |

**BackupRecord** -- Backup history entry

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique backup identifier |
| type | string | enum | `local`, `webdav`, `s3` |
| path | string | required | Backup location (path or URL) |
| size | number | required | Archive size in bytes |
| status | string | enum | `success`, `failed` |
| created_at | number | required | Backup timestamp |

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| (none) | | | F008 provides file infrastructure used by other features |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| IPC | `file:upload` | Upload file with duplicate detection and compression |
| IPC | `file:read` | Read file with encoding detection |
| IPC | `file:delete` | Delete file with reference count check |
| IPC | `file:extract-content` | Extract text content from document |
| IPC | `file:move` | Move or rename file |
| IPC | `file:copy` | Copy file |
| IPC | `file:base64` | Get file as base64 string |
| IPC | `backup:create` | Create backup to specified backend |
| IPC | `backup:restore` | Restore from backup archive |
| IPC | `backup:list` | List available backups |
| IPC | `export:docx` | Export conversation to DOCX |
| IPC | `export:markdown` | Export conversation to Markdown |
| Hook | `useFiles()` | React hook for file operations |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| IPC | `config:*` | F001-app-core | Config persistence for backup/WebDAV/S3 settings |
| IPC | `app:*` | F001-app-core | App paths for file storage directories |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: File management is almost entirely main process logic (FileStorage, BackupManager, ExportService, S3Storage, WebDav, FileSystemService). Renderer-side provides IPC wrappers and React hooks. Backup serializes Redux state; this needs updating for Zustand. Export uses docx/markdown libraries in main process.
- **Recommended implementation approach**: Keep ALL main process services intact as they are stack-independent. Update backup serialization to handle Zustand persist format instead of Redux. Replace renderer-side Redux patterns with Zustand store. Rename `cherry-studio` references in backup paths to `angdu-studio`.
- **Caveats**: Backup format must be updated to serialize Zustand stores instead of Redux state. This affects both backup creation (serialize) and restore (deserialize/merge). Ensure backward compatibility with older backup formats is considered. The `cherry-studio` -> `angdu-studio` rename in backup paths affects backup file discovery for existing users.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| File upload for chat | F002-ai-provider | Verify F002 can upload file attachments through F008's file upload API |
| Document storage for KB | F007-knowledge | Verify F007 can store and retrieve documents through F008's file storage |
| Content extraction for KB | F007-knowledge | Verify F007 can extract document content through F008's extraction API |
| Backup settings UI | F009-settings-ui | Verify F009 correctly configures backup/WebDAV/S3 settings through F008's API |
| IPC channel registration | F001-app-core | Verify F008's file:*, backup:*, export:* IPC channels are registered in F001's IPC handler |
| FileMetadata entity | F002-ai-provider | Verify F002 correctly references FileMetadata for message attachments |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F007-knowledge | File API change | If file upload or content extraction API changes, F007's document pipeline needs modification |
| F002-ai-provider | File API change | If file upload API changes, F002's attachment handling needs modification |
| F009-settings-ui | Config change | If backup/WebDAV/S3 configuration schema changes, F009's data settings need modification |
| F001-app-core | Entity change | If FileMetadata schema changes, F001's file-related IPC handlers need modification |
