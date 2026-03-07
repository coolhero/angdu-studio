# IPC Contract: System and Zip Channels

**Feature**: F001-app-core
**Channel Prefix**: `system:*`, `zip:*`
**Date**: 2026-03-02

---

## system:getDeviceType

**Channel**: `IpcChannel.SystemGetDeviceType`
**Direction**: Renderer -> Main
**Description**: Returns information about the current device, including the operating system, architecture, and platform-specific details. Used by the renderer for platform-adaptive UI rendering and by diagnostic/support features.

### Request

```typescript
type Request = void
```

### Response

```typescript
interface DeviceInfo {
  platform: 'win32' | 'darwin' | 'linux'    // Operating system platform
  arch: 'x64' | 'arm64' | 'ia32'            // CPU architecture
  osVersion: string                           // OS version string (e.g., "10.0.22621" for Windows)
  hostname: string                            // Machine hostname
  isAppImage: boolean                         // true if running as Linux AppImage
}
```

### Errors

| Error | Condition |
|-------|-----------|
| None expected | Always succeeds. All values are available from Node.js `os` module. |

---

## zip:compress

**Channel**: `IpcChannel.ZipCompress`
**Direction**: Renderer -> Main
**Description**: Compresses data using gzip or zip compression. Used for backup operations and data export features. Operates on string data (typically JSON-serialized application state).

### Request

```typescript
interface ZipCompressRequest {
  data: string              // Data to compress (typically JSON string)
  format?: 'gzip' | 'zip'  // Compression format (default: 'gzip')
  outputPath?: string       // If provided, write compressed data to this file path instead of returning
}
```

### Response

```typescript
type Response = string | void
// If outputPath is not provided: returns base64-encoded compressed data
// If outputPath is provided: writes to file and returns void
```

### Errors

| Error | Condition |
|-------|-----------|
| Compression error | Input data is too large or compression fails. Throws with message. |
| Write error | Cannot write to outputPath (permissions or disk full). Throws with message. |

---

## zip:decompress

**Channel**: `IpcChannel.ZipDecompress`
**Direction**: Renderer -> Main
**Description**: Decompresses data that was previously compressed with `zip:compress`. Used for restoring backups and importing data.

### Request

```typescript
interface ZipDecompressRequest {
  data?: string             // Base64-encoded compressed data (mutually exclusive with inputPath)
  inputPath?: string        // Path to compressed file (mutually exclusive with data)
  format?: 'gzip' | 'zip'  // Compression format (default: 'gzip')
}
```

One of `data` or `inputPath` must be provided.

### Response

```typescript
type Response = string
// Decompressed data as string
```

### Errors

| Error | Condition |
|-------|-----------|
| Invalid data | Input is not valid compressed data. Throws with message. |
| File not found | inputPath does not exist. Throws with message. |
| Decompression error | Data is corrupted or in wrong format. Throws with message. |
