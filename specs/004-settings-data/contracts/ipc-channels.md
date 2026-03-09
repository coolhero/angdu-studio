# IPC Channel Contracts: 004-settings-data

## File Operations (In Scope: 35 channels)

### file:upload
- **Direction**: renderer → main (invoke)
- **Request**: `{ filePath: string; fileName?: string; type?: FileType }`
- **Response**: `FileMetadata`
- **Description**: Upload file to app storage directory, generate metadata

### file:read
- **Direction**: renderer → main (invoke)
- **Request**: `{ id: string }` or `{ path: string }`
- **Response**: `ArrayBuffer`
- **Description**: Read file contents from app storage

### file:delete
- **Direction**: renderer → main (invoke)
- **Request**: `{ id: string }`
- **Response**: `void`
- **Description**: Delete file from app storage and clean up

### file:rename
- **Direction**: renderer → main (invoke)
- **Request**: `{ path: string; newName: string }`
- **Response**: `void`
- **Description**: Rename file at given path

### file:move
- **Direction**: renderer → main (invoke)
- **Request**: `{ from: string; to: string }`
- **Response**: `void`
- **Description**: Move file to new location

### file:download
- **Direction**: renderer → main (invoke)
- **Request**: `{ url: string; destPath?: string }`
- **Response**: `string` (saved path)
- **Description**: Download file from URL to app storage

### file:base64Image
- **Direction**: renderer → main (invoke)
- **Request**: `{ path: string }`
- **Response**: `string` (base64 data)
- **Description**: Read image and return as base64 string

### file:binaryImage
- **Direction**: renderer → main (invoke)
- **Request**: `{ path: string }`
- **Response**: `ArrayBuffer`
- **Description**: Read image and return as binary data

### file:saveBase64Image
- **Direction**: renderer → main (invoke)
- **Request**: `{ base64: string; ext?: string }`
- **Response**: `FileMetadata`
- **Description**: Decode base64 and save as image file

### file:select
- **Direction**: renderer → main (invoke)
- **Request**: `{ filters?: FileFilter[]; multiple?: boolean }`
- **Response**: `string[]` (selected file paths)
- **Description**: Open native file picker dialog

### file:selectFolder
- **Direction**: renderer → main (invoke)
- **Request**: `void`
- **Response**: `string` (selected folder path)
- **Description**: Open native folder picker dialog

### file:listDirectory
- **Direction**: renderer → main (invoke)
- **Request**: `{ path: string }`
- **Response**: `DirectoryEntry[]`
- **Description**: List contents of a directory

### file:showInFolder
- **Direction**: renderer → main (invoke)
- **Request**: `{ path: string }`
- **Response**: `void`
- **Description**: Reveal file in OS file explorer

*Additional file channels (file:open, file:openPath, file:save, file:readExternal, file:deleteDir, file:deleteExternalFile, file:deleteExternalDir, file:moveDir, file:renameDir, file:get, file:createTempFile, file:mkdir, file:write, file:writeWithId, file:saveImage, file:savePastedImage, file:base64File, file:getPdfInfo, file:copy, file:openWithRelativePath, file:isTextFile, file:isDirectory) follow the same invoke pattern with appropriate request/response types.*

---

## Backup & Restore (18 channels)

### backup:backupToLocalDir
- **Direction**: renderer → main (invoke)
- **Request**: `{ dirPath: string }`
- **Response**: `void`
- **Description**: Create ZIP backup archive and save to specified directory

### backup:restoreFromLocalBackup
- **Direction**: renderer → main (invoke)
- **Request**: `{ filePath: string }`
- **Response**: `void`
- **Description**: Validate and restore from local backup archive. App restarts after restore.

### backup:listLocalBackupFiles
- **Direction**: renderer → main (invoke)
- **Request**: `void`
- **Response**: `BackupFileInfo[]` — `{ name: string; path: string; size: number; createdAt: string }`
- **Description**: List available local backup files

### backup:deleteLocalBackupFile
- **Direction**: renderer → main (invoke)
- **Request**: `{ path: string }`
- **Response**: `void`
- **Description**: Delete a local backup file

### backup:checkConnection
- **Direction**: renderer → main (invoke)
- **Request**: `WebDavConfig`
- **Response**: `boolean`
- **Description**: Test WebDAV server connectivity

### backup:backupToWebdav
- **Direction**: renderer → main (invoke)
- **Request**: `WebDavConfig`
- **Response**: `void`
- **Description**: Create backup and upload to WebDAV server

### backup:restoreFromWebdav
- **Direction**: renderer → main (invoke)
- **Request**: `WebDavConfig & { fileName: string }`
- **Response**: `void`
- **Description**: Download and restore backup from WebDAV. App restarts after restore.

### backup:listWebdavFiles
- **Direction**: renderer → main (invoke)
- **Request**: `WebDavConfig`
- **Response**: `BackupFileInfo[]`
- **Description**: List backup files on WebDAV server

### backup:deleteWebdavFile
- **Direction**: renderer → main (invoke)
- **Request**: `WebDavConfig & { fileName: string }`
- **Response**: `void`
- **Description**: Delete backup file from WebDAV server

### backup:checkS3Connection
- **Direction**: renderer → main (invoke)
- **Request**: `S3Config`
- **Response**: `boolean`
- **Description**: Test S3 bucket connectivity

### backup:backupToS3
- **Direction**: renderer → main (invoke)
- **Request**: `S3Config`
- **Response**: `void`
- **Description**: Create backup and upload to S3

### backup:restoreFromS3
- **Direction**: renderer → main (invoke)
- **Request**: `S3Config & { key: string }`
- **Response**: `void`
- **Description**: Download and restore backup from S3. App restarts after restore.

### backup:listS3Files
- **Direction**: renderer → main (invoke)
- **Request**: `S3Config`
- **Response**: `BackupFileInfo[]`
- **Description**: List backup files in S3 bucket

### backup:deleteS3File
- **Direction**: renderer → main (invoke)
- **Request**: `S3Config & { key: string }`
- **Response**: `void`
- **Description**: Delete backup file from S3

### backup-progress (Event)
- **Direction**: main → renderer (send)
- **Payload**: `{ percent: number; stage: string }`
- **Description**: Backup progress updates

### restore-progress (Event)
- **Direction**: main → renderer (send)
- **Payload**: `{ percent: number; stage: string }`
- **Description**: Restore progress updates

---

## Filesystem Direct (2 channels)

### fs:read
- **Direction**: renderer → main (invoke)
- **Request**: `{ path: string }`
- **Response**: `ArrayBuffer`

### fs:readText
- **Direction**: renderer → main (invoke)
- **Request**: `{ path: string }`
- **Response**: `string`
- **Description**: Read text file with auto encoding detection

---

## Out of Scope (P3)

- `export:word` — Export to Word document
- `local-transfer:*` (8 channels) — LAN file transfer
