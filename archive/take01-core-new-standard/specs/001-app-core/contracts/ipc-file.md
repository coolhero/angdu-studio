# IPC Contract: File Channels

**Feature**: F001-app-core
**Channel Prefix**: `file:*`
**Date**: 2026-03-02

---

## file:select

**Channel**: `IpcChannel.FileSelect`
**Direction**: Renderer -> Main
**Description**: Opens a native file picker dialog, copies selected files to the managed storage directory, and returns metadata for each file. Combines the dialog and upload steps into a single operation for convenience.

### Request

```typescript
interface FileSelectOptions {
  properties?: Array<'openFile' | 'multiSelections' | 'showHiddenFiles'>
  filters?: Array<{
    name: string
    extensions: string[]
  }>
}
```

If no options provided, defaults to single file selection with no filters.

### Response

```typescript
type Response = FileMetadata[] | null
// Array of FileMetadata objects for selected files, or null if cancelled
```

```typescript
interface FileMetadata {
  id: string           // UUID v4 unique identifier
  name: string         // Storage file name (e.g., "a1b2c3d4.pdf")
  origin_name: string  // Original file name (e.g., "my-document.pdf")
  path: string         // Absolute path to file in managed storage
  size: number         // File size in bytes
  ext: string          // Extension with dot (e.g., ".pdf")
  type: FileType       // Categorized type: image|video|audio|text|document|other
  created_at: string   // ISO 8601 timestamp
  count: number        // Reference count (initialized to 0)
  tokens?: number      // Estimated token count (undefined initially)
  purpose?: string     // File purpose (undefined initially)
}
```

### Errors

| Error | Condition |
|-------|-----------|
| Dialog cancelled | User cancelled. Returns `null`. |
| File copy failed | Source file inaccessible or disk full. Throws IPC error with message. |

---

## file:upload

**Channel**: `IpcChannel.FileUpload`
**Direction**: Renderer -> Main
**Description**: Uploads a file to managed storage given its current path. Used for drag-and-drop and programmatic file imports where the renderer already has the file path. The file is copied (not moved) to the managed storage directory.

### Request

```typescript
interface FileUploadRequest {
  filePath: string       // Absolute path to the source file
  origin_name?: string   // Optional override for the original file name
}
```

### Response

```typescript
type Response = FileMetadata
// Complete FileMetadata object for the uploaded file
```

### Errors

| Error | Condition |
|-------|-----------|
| File not found | Source path does not exist. Throws with descriptive message. |
| Permission denied | Cannot read the source file. Throws with descriptive message. |
| Disk full | Cannot copy to storage directory. Throws with descriptive message. |

---

## file:read

**Channel**: `IpcChannel.FileRead`
**Direction**: Renderer -> Main
**Description**: Reads the content of a stored file by its ID or path. Returns the file content as a string (for text files) or base64 (for binary files). Optionally detects file encoding.

### Request

```typescript
type Request = [fileId: string, detectEncoding?: boolean]
// fileId: UUID of the file to read
// detectEncoding: if true, auto-detect text encoding (default: false, assumes UTF-8)
```

### Response

```typescript
type Response = string
// File content as string (UTF-8 or detected encoding for text files)
// Base64-encoded string for binary files
```

### Errors

| Error | Condition |
|-------|-----------|
| File not found | No file exists with the given ID in storage. |
| Read error | File exists in metadata but physical file is missing or unreadable. |

---

## file:write

**Channel**: `IpcChannel.FileWrite`
**Direction**: Renderer -> Main
**Description**: Writes content to a file in the managed storage directory. Used for creating new files from content (e.g., saving clipboard paste data) rather than copying existing files.

### Request

```typescript
interface FileWriteRequest {
  fileName: string        // Desired file name (will be prefixed with UUID)
  content: string         // File content (string for text, base64 for binary)
  encoding?: string       // Encoding: 'utf-8' (default) or 'base64'
}
```

### Response

```typescript
type Response = FileMetadata
// Complete FileMetadata object for the created file
```

### Errors

| Error | Condition |
|-------|-----------|
| Invalid content | Empty or malformed content. |
| Disk full | Cannot write to storage directory. |

---

## file:delete

**Channel**: `IpcChannel.FileDelete`
**Direction**: Renderer -> Main
**Description**: Deletes a file from managed storage by its ID. Removes the physical file from disk. The renderer is responsible for removing the corresponding Dexie record separately.

### Request

```typescript
type Request = string
// UUID of the file to delete
```

### Response

```typescript
type Response = void
```

### Errors

| Error | Condition |
|-------|-----------|
| File not found | No file with the given ID exists. Operation is idempotent -- no error thrown. |
| Delete failed | File exists but cannot be deleted (permissions). Throws with message. |

---

## file:download

**Channel**: `IpcChannel.FileDownload`
**Direction**: Renderer -> Main
**Description**: Downloads a file from a URL, saves it to managed storage, and returns metadata. The main process handles the HTTP request, determines the file name and type from the response headers, and stores the file.

### Request

```typescript
type Request = [url: string, isUseContentType?: boolean]
// url: HTTP(S) URL to download from
// isUseContentType: if true, use the Content-Type header to determine file extension (default: false)
```

### Response

```typescript
type Response = FileMetadata
// Complete FileMetadata object for the downloaded file
```

### Errors

| Error | Condition |
|-------|-----------|
| Network error | URL unreachable or request failed. Throws with HTTP status and message. |
| Invalid URL | Malformed URL string. Throws with validation error. |
| Download timeout | Request exceeds timeout threshold. Throws with timeout message. |
| Disk full | Cannot write downloaded content. Throws with message. |
