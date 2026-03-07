# IPC Channel Contracts: Platform Infrastructure

**Feature**: F001-platform | **Date**: 2026-03-02

All IPC channels use the invoke/handle pattern via Electron's `contextBridge`. The renderer calls `window.api.<method>()` which maps to `ipcRenderer.invoke(channel, ...args)` in the preload script. The main process registers handlers via `ipcMain.handle(channel, handler)`.

Channel names are defined as a centralized TypeScript enum in `packages/shared/IpcChannel.ts`.

## File Operations (file:*)

Sandboxed file management within the application data directory. All file paths are validated to prevent directory traversal attacks.

| Channel | Direction | Parameters | Return | Description |
|---------|-----------|-----------|--------|-------------|
| file:select | renderer -> main | `{ multiple?: boolean, filters?: FileFilter[] }` | `FileMetadata[]` | Open native file picker dialog and return selected file metadata |
| file:upload | renderer -> main | `{ filePath: string }` | `FileMetadata` | Copy file to managed data directory and create metadata record |
| file:download | renderer -> main | `{ id: string, targetPath?: string }` | `string` | Save file from managed directory to user-chosen location; returns saved path |
| file:read | renderer -> main | `{ id: string }` | `Buffer` | Read file contents from managed directory |
| file:delete | renderer -> main | `{ id: string }` | `void` | Delete file and its metadata record from managed directory |
| file:open | renderer -> main | `{ id: string }` | `void` | Open file with system default application via `shell.openPath` |
| file:getPath | renderer -> main | `{ id: string }` | `string` | Get absolute file path for a managed file |

**Error Handling**:
- Path traversal attempt: throws `SecurityError` with message "Path outside sandbox"
- File not found: throws `NotFoundError` with the file id
- File too large (>50MB upload): emits progress events via `file:uploadProgress` channel

## App Management (app:*)

Application-level operations including runtime info, proxy, theme, and updates.

| Channel | Direction | Parameters | Return | Description |
|---------|-----------|-----------|--------|-------------|
| app:getInfo | renderer -> main | `void` | `AppInfo` | Get application runtime information (version, paths, platform) |
| app:getProxy | renderer -> main | `void` | `ProxyConfig` | Get current proxy configuration |
| app:setProxy | renderer -> main | `ProxyConfig` | `void` | Set proxy configuration (HTTP/HTTPS/SOCKS with optional auth) |
| app:getTheme | renderer -> main | `void` | `ThemeMode` | Get current theme mode ("light", "dark", or "system") |
| app:setTheme | renderer -> main | `ThemeMode` | `void` | Set theme mode; triggers native theme update |
| app:checkUpdate | renderer -> main | `void` | `UpdateInfo \| null` | Check for available updates on configured channel; returns null if up-to-date |
| app:installUpdate | renderer -> main | `void` | `void` | Download and install pending update; app restarts after install |
| app:getLocale | renderer -> main | `void` | `string` | Get current application locale |
| app:setLocale | renderer -> main | `{ locale: string }` | `void` | Set application locale |
| app:quit | renderer -> main | `void` | `void` | Gracefully quit the application |
| app:relaunch | renderer -> main | `void` | `void` | Relaunch the application (used after data path change) |
| app:getDataPath | renderer -> main | `void` | `string` | Get current user data directory path |
| app:setDataPath | renderer -> main | `{ path: string }` | `void` | Set new data directory path; triggers data migration and relaunch |

## Window Management (window:*)

Control window state, size, and position. Supports multiple window types.

| Channel | Direction | Parameters | Return | Description |
|---------|-----------|-----------|--------|-------------|
| window:show | renderer -> main | `void` | `void` | Show and focus the main window |
| window:hide | renderer -> main | `void` | `void` | Hide the main window (minimize to tray if enabled) |
| window:minimize | renderer -> main | `void` | `void` | Minimize the main window to taskbar |
| window:maximize | renderer -> main | `void` | `void` | Toggle maximize/restore for the main window |
| window:close | renderer -> main | `void` | `void` | Close the current window |
| window:setSize | renderer -> main | `{ width: number, height: number }` | `void` | Set window dimensions |
| window:openMini | renderer -> main | `void` | `void` | Open the mini chat window |
| window:openSelection | renderer -> main | `void` | `void` | Open the selection toolbar window |

## Config (config:*)

General key-value configuration storage using electron-store.

| Channel | Direction | Parameters | Return | Description |
|---------|-----------|-----------|--------|-------------|
| config:get | renderer -> main | `{ key: string }` | `any` | Get a configuration value by key |
| config:set | renderer -> main | `{ key: string, value: any }` | `void` | Set a configuration value |

## Notification (notification:*)

Native OS notification support.

| Channel | Direction | Parameters | Return | Description |
|---------|-----------|-----------|--------|-------------|
| notification:show | renderer -> main | `{ title: string, body: string, icon?: string }` | `void` | Show a native OS notification |
| notification:click | main -> renderer | `void` | `void` | Event emitted when user clicks a notification |

## System (system:*)

System-level operations and information.

| Channel | Direction | Parameters | Return | Description |
|---------|-----------|-----------|--------|-------------|
| system:openExternal | renderer -> main | `{ url: string }` | `void` | Open URL in system default browser |
| system:openPath | renderer -> main | `{ path: string }` | `void` | Open path in system file manager |
| system:getMemoryUsage | renderer -> main | `void` | `{ heapUsed: number, heapTotal: number }` | Get process memory usage |
| system:getPlatform | renderer -> main | `void` | `string` | Get OS platform identifier |
| system:getArch | renderer -> main | `void` | `string` | Get CPU architecture |
| system:isPortable | renderer -> main | `void` | `boolean` | Check if running in portable mode |
| system:getLogPath | renderer -> main | `void` | `string` | Get log file directory path |

## Shortcuts (shortcuts:*)

Global keyboard shortcut management.

| Channel | Direction | Parameters | Return | Description |
|---------|-----------|-----------|--------|-------------|
| shortcuts:update | renderer -> main | `Shortcut[]` | `void` | Register/update global shortcuts from settings |

## Type Definitions

```typescript
// packages/shared/types.ts

interface FileFilter {
  name: string        // e.g., "Images"
  extensions: string[] // e.g., ["jpg", "png", "gif"]
}

interface FileMetadata {
  id: string
  name: string
  path: string
  size: number
  ext: string
  type: string
  count: number
  created_at: number
}

interface ProxyConfig {
  mode: 'direct' | 'system' | 'manual'
  protocol?: 'http' | 'https' | 'socks5'
  host?: string
  port?: number
  username?: string
  password?: string
  bypass?: string[]
}

type ThemeMode = 'light' | 'dark' | 'system'

interface AppInfo {
  version: string
  isPackaged: boolean
  appPath: string
  appDataPath: string
  platform: string
  arch: string
}

interface UpdateInfo {
  version: string
  releaseDate: string
  releaseNotes: string
  channel: 'stable' | 'rc' | 'beta'
}

interface Shortcut {
  key: string
  shortcut: string[]
  enabled: boolean
}
```
