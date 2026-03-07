# IPC Contract: App Channels

**Feature**: F001-app-core
**Channel Prefix**: `app:*`
**Date**: 2026-03-02

---

## app:info

**Channel**: `IpcChannel.AppInfo`
**Direction**: Renderer -> Main
**Description**: Retrieves comprehensive application information including version, paths, architecture, and portable mode status. Used by the renderer on startup to populate the app store and configure path-dependent features.

### Request

```typescript
type Request = void
```

No parameters required.

### Response

```typescript
interface AppInfo {
  version: string          // Semantic version (e.g., "1.0.0")
  isPackaged: boolean      // true if running from packaged binary, false in dev
  appPath: string          // Path to the app directory
  filesPath: string        // Path to managed file storage directory
  notesPath: string        // Path to notes storage directory
  configPath: string       // Path to configuration files
  appDataPath: string      // Path to app data root directory
  resourcesPath: string    // Path to bundled resources
  logsPath: string         // Path to log files directory
  arch: string             // CPU architecture (e.g., "x64", "arm64")
  isPortable: boolean      // true if running in portable mode
  installPath: string      // Installation directory path
}
```

### Errors

| Error | Condition |
|-------|-----------|
| None expected | This channel always succeeds |

---

## app:select

**Channel**: `IpcChannel.AppSelect`
**Direction**: Renderer -> Main
**Description**: Opens a native file or folder picker dialog. Wraps Electron's `dialog.showOpenDialog()` with configurable options for file type filtering, multi-selection, and directory selection.

### Request

```typescript
interface OpenDialogOptions {
  title?: string                            // Dialog title
  defaultPath?: string                      // Default directory to open
  buttonLabel?: string                      // Custom button label
  filters?: Array<{                         // File type filters
    name: string
    extensions: string[]
  }>
  properties?: Array<                       // Dialog behavior flags
    'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles'
  >
}
```

### Response

```typescript
type Response = string[] | null
// Array of selected file/directory paths, or null if dialog was cancelled
```

### Errors

| Error | Condition |
|-------|-----------|
| Dialog cancelled | User closed the dialog without selecting. Returns `null` (not an error). |

---

## app:set-language

**Channel**: `IpcChannel.AppSetLanguage`
**Direction**: Renderer -> Main
**Description**: Notifies the main process of a language change. The main process updates the tray menu, native dialog labels, and persists the language preference in configuration. The renderer handles its own i18n switching via i18next independently.

### Request

```typescript
type Request = string
// Language code (e.g., "en-us", "zh-cn", "zh-tw", "ja-jp", "ko-kr", "ru-ru")
```

### Response

```typescript
type Response = void
```

### Errors

| Error | Condition |
|-------|-----------|
| Invalid language code | Language code not in the supported locale list. Falls back to "en-us". |

### Supported Language Codes

`en-us`, `zh-cn`, `zh-tw`, `ja-jp`, `ko-kr`, `ru-ru`, `de-de`, `fr-fr`, `es-es`, `pt-br`, `ar-sa`, `vi-vn`, `th-th`, `hi-in`

---

## app:set-theme

**Channel**: `IpcChannel.AppSetTheme`
**Direction**: Renderer -> Main
**Description**: Notifies the main process of a theme change. The main process updates the tray icon variant (light/dark) and the native window title bar appearance. The renderer handles its own theme rendering independently.

### Request

```typescript
type Request = 'light' | 'dark' | 'system'
// Theme mode to apply
```

### Response

```typescript
type Response = void
```

### Errors

| Error | Condition |
|-------|-----------|
| None expected | Invalid values are ignored; the system theme is used as fallback. |

---

## app:check-for-update

**Channel**: `IpcChannel.AppCheckForUpdate`
**Direction**: Renderer -> Main
**Description**: Triggers a check for application updates using Electron's auto-updater. Returns the current update status. On Linux AppImage, behavior may differ (manual download link instead of auto-update).

### Request

```typescript
type Request = void
```

### Response

```typescript
interface UpdateCheckResult {
  updateAvailable: boolean     // Whether a newer version is available
  currentVersion: string       // Current installed version
  latestVersion?: string       // Latest available version (if update available)
  releaseNotes?: string        // Release notes for the new version
  downloadUrl?: string         // Direct download URL (for manual update on Linux)
}
```

### Errors

| Error | Condition |
|-------|-----------|
| Network error | Cannot reach update server. Returns `{ updateAvailable: false }` with current version. |
| Update check failed | Server returned an error. Logged and returns graceful fallback. |
