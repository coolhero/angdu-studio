# IPC Channel Contracts: Core Platform

**Feature**: 001-core-platform
**Date**: 2026-03-04

All IPC channels are defined as members of the `IpcChannel` enum in `packages/shared/IpcChannel.ts`.
Direction: **R->M** = Renderer invokes Main (via `ipcRenderer.invoke`); **M->R** = Main pushes to Renderer (via `webContents.send`).

---

## App Domain

| Channel | Direction | Params | Return | Description |
|---------|-----------|--------|--------|-------------|
| `App_Info` | R->M | — | `AppInfo` | Get app version, name, paths, architecture |
| `App_Quit` | R->M | — | void | Quit the application |
| `App_Reload` | R->M | — | void | Reload the renderer |
| `App_Relaunch` | R->M | — | void | Restart the entire application |
| `App_SetLanguage` | R->M | `lang: string` | void | Change display language |
| `App_SetTheme` | R->M | `theme: ThemeMode` | void | Set theme (light/dark/system) |
| `App_ThemeChanged` | M->R | `isDark: boolean` | — | Notify renderer of OS theme change |
| `App_SetProxy` | R->M | `config: ProxyConfig \| null` | void | Configure proxy settings |
| `App_SetLaunchOnBoot` | R->M | `enabled: boolean` | void | Set launch-at-login |
| `App_SetLaunchToTray` | R->M | `enabled: boolean` | void | Set launch-to-tray behavior |
| `App_SetTray` | R->M | `enabled: boolean` | void | Enable/disable system tray |
| `App_SetTrayOnClose` | R->M | `enabled: boolean` | void | Minimize to tray on close |
| `App_HandleZoomFactor` | R->M | `{ delta?: number, reset?: boolean }` | number | Adjust zoom factor |
| `App_SetDisableHardwareAcceleration` | R->M | `disabled: boolean` | void | Toggle hardware acceleration |
| `App_SetUseSystemTitleBar` | R->M | `enabled: boolean` | void | Toggle system title bar (Linux) |
| `App_HandleProtocol` | M->R | `url: string` | — | Incoming deep link URL |
| `App_LogToMain` | R->M | `LogEntry` | void | Forward renderer log to main |
| `App_GetPath` | R->M | `name: string` | string | Get Electron special path |
| `App_GetSystemInfo` | R->M | — | `SystemInfo` | CPU, memory, GPU, OS info |
| `App_SetEnableSpellCheck` | R->M | `enabled: boolean` | void | Toggle spell check |
| `App_SetSpellCheckLanguages` | R->M | `languages: string[]` | void | Set spell check languages |
| `App_ClearCache` | R->M | — | void | Clear HTTP cache and temp files |
| `App_GetCacheSize` | R->M | — | number | Get cache directory size in bytes |

---

## Config Domain

| Channel | Direction | Params | Return | Description |
|---------|-----------|--------|--------|-------------|
| `Config_Get` | R->M | `key: ConfigKey` | any | Get configuration value |
| `Config_Set` | R->M | `{ key: ConfigKey, value: any, notify?: boolean }` | void | Set configuration value |

---

## File Domain

| Channel | Direction | Params | Return | Description |
|---------|-----------|--------|--------|-------------|
| `File_Select` | R->M | `FileSelectOptions` | string[] \| null | Open file dialog |
| `File_Open` | R->M | `path: string` | void | Open file in default app |
| `File_Save` | R->M | `FileSaveOptions` | string \| null | Save file dialog |
| `File_Read` | R->M | `{ path: string, encoding?: string }` | string \| Buffer | Read file contents |
| `File_Write` | R->M | `{ path: string, data: string \| Buffer }` | void | Write content to file |
| `File_Upload` | R->M | `{ filePath: string, purpose?: string }` | FileMetadata | Upload file to storage |
| `File_Delete` | R->M | `{ id: string }` | void | Delete file by metadata id |
| `File_Copy` | R->M | `{ src: string, dest: string }` | void | Copy file |
| `File_Move` | R->M | `{ src: string, dest: string }` | void | Move/rename file |
| `File_IsTextFile` | R->M | `path: string` | boolean | Check if file is text-based |
| `File_IsDirectory` | R->M | `path: string` | boolean | Check if path is directory |
| `File_ListDirectory` | R->M | `DirectoryListOptions` | FileEntry[] | List directory contents |
| `File_GetDirectoryStructure` | R->M | `{ path: string, depth?: number }` | TreeNode | Get directory tree |
| `File_Base64Image` | R->M | `path: string` | string | Get image as base64 |
| `File_BinaryImage` | R->M | `path: string` | Buffer | Get image as binary |
| `File_SavePastedImage` | R->M | `{ data: string, ext: string }` | FileMetadata | Save clipboard image |
| `File_StartWatcher` | R->M | `WatcherConfig` | string | Start file watcher, return watcher id |
| `File_StopWatcher` | R->M | `watcherId: string` | void | Stop file watcher |
| `File_OnChange` | M->R | `FileChangeEvent` | — | File change notification |
| `File_PdfInfo` | R->M | `path: string` | PdfInfo | Get PDF page count/metadata |

---

## Window Domain

| Channel | Direction | Params | Return | Description |
|---------|-----------|--------|--------|-------------|
| `Window_Minimize` | R->M | — | void | Minimize main window |
| `Window_Maximize` | R->M | — | void | Maximize main window |
| `Window_Unmaximize` | R->M | — | void | Unmaximize main window |
| `Window_Close` | R->M | — | void | Close main window |
| `Window_IsMaximized` | R->M | — | boolean | Check if maximized |
| `Window_MaximizedChanged` | M->R | `isMaximized: boolean` | — | Maximize state changed |
| `Window_GetSize` | R->M | — | `{ width: number, height: number }` | Get window size |
| `Window_SetMinimumSize` | R->M | `{ width: number, height: number }` | void | Set minimum window size |
| `Window_ResetMinimumSize` | R->M | — | void | Reset to default minimum |
| `Window_Resize` | M->R | `{ width: number, height: number }` | — | Window resized notification |
| `Window_FullscreenChanged` | M->R | `isFullscreen: boolean` | — | Fullscreen state changed |

---

## MiniWindow Domain

| Channel | Direction | Params | Return | Description |
|---------|-----------|--------|--------|-------------|
| `MiniWindow_Show` | R->M | — | void | Show mini window |
| `MiniWindow_Hide` | R->M | — | void | Hide mini window |
| `MiniWindow_Close` | R->M | — | void | Close mini window |
| `MiniWindow_Toggle` | R->M | — | void | Toggle mini window visibility |
| `MiniWindow_SetPin` | R->M | `pinned: boolean` | void | Pin/unpin mini window |

---

## System Domain

| Channel | Direction | Params | Return | Description |
|---------|-----------|--------|--------|-------------|
| `System_GetDeviceType` | R->M | — | string | Get device type |
| `System_GetHostname` | R->M | — | string | Get hostname |
| `System_GetCpuName` | R->M | — | string | Get CPU name |
| `System_GetPlatform` | R->M | — | `'darwin' \| 'win32' \| 'linux'` | Get OS platform |

---

## Utility Domains

| Channel | Direction | Params | Return | Description |
|---------|-----------|--------|--------|-------------|
| `Aes_Encrypt` | R->M | `{ data: string, key: string }` | string | AES-256 encrypt |
| `Aes_Decrypt` | R->M | `{ data: string, key: string }` | string | AES-256 decrypt |
| `Zip_Compress` | R->M | `{ input: string, output: string }` | void | Create ZIP archive |
| `Zip_Decompress` | R->M | `{ input: string, output: string }` | void | Extract ZIP archive |
| `Open_Url` | R->M | `url: string` | void | Open URL in default browser |
| `Open_Path` | R->M | `path: string` | void | Open path in file manager |
| `Notification_Send` | R->M | `{ title: string, body: string }` | void | Show system notification |
| `Shortcuts_Register` | R->M | `Shortcut[]` | void | Register global shortcuts |
| `StoreSync_GetState` | R->M | `storeName: string` | any | Get store state for sync |
| `StoreSync_SetState` | R->M | `{ storeName: string, state: any }` | void | Set store state for sync |
| `StoreSync_StateChanged` | M->R | `{ storeName: string, state: any }` | — | Store state changed in another window |
| `Analytics_Track` | R->M | `{ event: string, properties?: Record<string, any> }` | void | Track analytics event |

---

## Type Definitions

```typescript
interface AppInfo {
  version: string;
  name: string;
  paths: {
    userData: string;
    temp: string;
    logs: string;
    downloads: string;
  };
  platform: 'darwin' | 'win32' | 'linux';
  arch: string;
  isPortable: boolean;
}

interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'verbose' | 'debug';
  message: string;
  module?: string;
  context?: Record<string, any>;
  timestamp?: number;
}

interface FileSelectOptions {
  filters?: { name: string; extensions: string[] }[];
  multiple?: boolean;
  directory?: boolean;
}

interface FileSaveOptions {
  defaultPath?: string;
  filters?: { name: string; extensions: string[] }[];
  data: string | Buffer;
}

interface DirectoryListOptions {
  path: string;
  recursive?: boolean;
  maxDepth?: number;
  includeHidden?: boolean;
  pattern?: string;
  maxEntries?: number;
}

interface WatcherConfig {
  path: string;
  extensions?: string[];
  ignorePatterns?: string[];
  debounceMs?: number;
  stabilityThresholdMs?: number;
}

interface FileChangeEvent {
  watcherId: string;
  type: 'add' | 'change' | 'unlink';
  path: string;
}

type ThemeMode = 'light' | 'dark' | 'system';
```
