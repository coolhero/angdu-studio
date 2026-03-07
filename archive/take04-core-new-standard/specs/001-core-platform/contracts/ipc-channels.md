# IPC Channel Contracts: Core Platform

**Feature**: F001-core-platform
**Date**: 2026-03-04

All channels are defined in `packages/shared/IpcChannel.ts` as enum members.
Direction: R→M = Renderer invokes Main, M→R = Main pushes to Renderer.

---

## App Domain

| Channel | Direction | Request | Response | Description |
|---------|-----------|---------|----------|-------------|
| `App_Info` | R→M | — | `{ name, version, isPackaged, platform, arch, paths }` | Get app info and paths |
| `App_Reload` | R→M | — | void | Reload the application |
| `App_Quit` | R→M | — | void | Quit the application |
| `App_SetTheme` | R→M | `'light' \| 'dark' \| 'auto'` | void | Set native theme |
| `App_GetTheme` | R→M | — | `'light' \| 'dark' \| 'auto'` | Get current theme |
| `App_SetLanguage` | R→M | `string` (locale code) | void | Set app language |
| `App_GetLocale` | R→M | — | `string` | Get system locale |
| `App_SetProxy` | R→M | `ProxyConfig` | void | Configure proxy |
| `App_GetProxy` | R→M | — | `ProxyConfig` | Get current proxy |
| `App_SetZoomFactor` | R→M | `number` | void | Set window zoom |
| `App_GetZoomFactor` | R→M | — | `number` | Get window zoom |
| `App_GetPath` | R→M | `string` (path name) | `string` (path value) | Get Electron path |
| `App_GetSystemInfo` | R→M | — | `SystemInfo` | CPU, memory, GPU, OS |
| `App_GetCacheSize` | R→M | — | `number` (bytes) | Get cache size |
| `App_ClearCache` | R→M | — | void | Clear HTTP cache |
| `App_SetLaunchOnBoot` | R→M | `boolean` | void | Set launch-at-login |
| `App_GetLoginItem` | R→M | — | `{ openAtLogin: boolean }` | Check login item |
| `App_SetAlwaysOnTop` | R→M | `boolean` | void | Set always-on-top |
| `App_ToggleFullScreen` | R→M | — | void | Toggle fullscreen |
| `App_IsFullScreen` | R→M | — | `boolean` | Check fullscreen |
| `App_SetBadgeCount` | R→M | `number` | void | Set dock badge |
| `App_ShowDock` | R→M | — | void | Show dock (macOS) |
| `App_HideDock` | R→M | — | void | Hide dock (macOS) |
| `App_SetProgressBar` | R→M | `number` (-1 to 1) | void | Set taskbar progress |
| `App_BounceDock` | R→M | `'critical' \| 'informational'` | void | Bounce dock (macOS) |
| `App_GetDisplays` | R→M | — | `Display[]` | Get connected displays |
| `App_IsFocused` | R→M | — | `boolean` | Check window focus |
| `App_Focus` | R→M | — | void | Focus main window |
| `App_MinimizeToTray` | R→M | — | void | Minimize to tray |
| `App_RestoreFromTray` | R→M | — | void | Restore from tray |
| `App_GetArgv` | R→M | — | `string[]` | Get CLI arguments |
| `App_Log` | R→M | `{ level, module, message }` | void | Forward renderer log |
| `App_OpenLogFolder` | R→M | — | void | Open log directory |
| `App_DisableHardwareAcceleration` | R→M | `boolean` | void | Set HW accel flag |

---

## Config Domain

| Channel | Direction | Request | Response | Description |
|---------|-----------|---------|----------|-------------|
| `Config_Get` | R→M | `{ key: ConfigKeys }` | `any` | Read config value |
| `Config_Set` | R→M | `{ key: ConfigKeys, value: any }` | void | Write config value |

---

## File Domain

| Channel | Direction | Request | Response | Description |
|---------|-----------|---------|----------|-------------|
| `File_Open` | R→M | `{ filters?, multiple? }` | `string[]` (paths) | Open file dialog |
| `File_Save` | R→M | `{ defaultPath?, filters? }` | `string` (path) | Save file dialog |
| `File_Read` | R→M | `{ path, encoding? }` | `string \| Buffer` | Read file contents |
| `File_Write` | R→M | `{ path, data }` | void | Write content to file |
| `File_Delete` | R→M | `{ path }` | void | Delete a file |
| `File_Copy` | R→M | `{ src, dest }` | void | Copy file |
| `File_Move` | R→M | `{ src, dest }` | void | Move/rename file |
| `File_Rename` | R→M | `{ path, newName }` | void | Rename file |
| `File_Exists` | R→M | `{ path }` | `boolean` | Check file exists |
| `File_Stat` | R→M | `{ path }` | `FileStat` | Get file metadata |
| `File_Mkdir` | R→M | `{ path }` | void | Create directory |
| `File_Readdir` | R→M | `{ path }` | `string[]` | List directory |
| `File_SelectFolder` | R→M | `{ defaultPath? }` | `string` (path) | Folder dialog |
| `File_Upload` | R→M | `{ filePath, compress? }` | `FileMetadata` | Upload to app data |
| `File_Download` | R→M | `{ url, destPath }` | `string` (path) | Download file |
| `File_Base64Encode` | R→M | `{ path }` | `string` (base64) | File to base64 |
| `File_Base64Decode` | R→M | `{ data, path }` | void | Base64 to file |
| `File_BinaryRead` | R→M | `{ path }` | `ArrayBuffer` | Read binary |
| `File_BinaryWrite` | R→M | `{ path, data }` | void | Write binary |
| `File_Hash` | R→M | `{ path, algo }` | `string` (hash) | Compute hash |
| `File_Compress` | R→M | `{ path }` | `string` (path) | Gzip compress |
| `File_Decompress` | R→M | `{ path }` | `string` (path) | Gzip decompress |
| `File_GetType` | R→M | `{ path }` | `FileType` | Determine type |
| `File_GetSize` | R→M | `{ path }` | `number` (bytes) | Get size |
| `File_OpenInExplorer` | R→M | `{ path }` | void | Open in file manager |
| `File_Append` | R→M | `{ path, data }` | void | Append to file |
| `File_Glob` | R→M | `{ pattern, cwd? }` | `string[]` | Glob search |
| `File_StartWatcher` | R→M | `{ id, path, options }` | void | Start watching |
| `File_StopWatcher` | R→M | `{ id }` | void | Stop watching |
| `File_GetMetadata` | R→M | `{ id }` | `FileMetadata` | Get file metadata |

### File Events (M→R)

| Channel | Payload | Description |
|---------|---------|-------------|
| `File_Changed` | `{ id, path, event }` | File watcher notification |

---

## Window Domain

| Channel | Direction | Request | Response | Description |
|---------|-----------|---------|----------|-------------|
| `Windows_Minimize` | R→M | — | void | Minimize window |
| `Windows_Maximize` | R→M | — | void | Maximize/restore |
| `Windows_Close` | R→M | — | void | Close window |
| `Windows_Create` | R→M | `WindowCreateOptions` | `number` (id) | Create window |
| `Windows_Focus` | R→M | `{ id? }` | void | Focus window |
| `Windows_SetTitle` | R→M | `{ title }` | void | Set title |
| `Windows_SetSize` | R→M | `{ width, height }` | void | Set dimensions |
| `Windows_ToggleDevTools` | R→M | — | void | Toggle devtools |
| `Windows_ShowContextMenu` | R→M | `MenuItem[]` | void | Show context menu |
| `Windows_SetFullscreen` | R→M | `boolean` | void | Set fullscreen |
| `Windows_GetBounds` | R→M | — | `Rectangle` | Get bounds |

---

## System Domain

| Channel | Direction | Request | Response | Description |
|---------|-----------|---------|----------|-------------|
| `System_GetLocale` | R→M | — | `string` | System locale |
| `System_GetPlatform` | R→M | — | `string` | OS platform |
| `System_GetArch` | R→M | — | `string` | CPU arch |
| `System_GetMemory` | R→M | — | `{ total, free }` | Memory info |
| `System_GetCPU` | R→M | — | `CpuInfo` | CPU info |
| `System_GetHostname` | R→M | — | `string` | Hostname |
| `System_IsDarkMode` | R→M | — | `boolean` | OS dark mode |
| `System_GetDisplays` | R→M | — | `Display[]` | Display info |

---

## MiniWindow Domain

| Channel | Direction | Request | Response | Description |
|---------|-----------|---------|----------|-------------|
| `MiniWindow_Show` | R→M | `{ center? }` | void | Show mini window |
| `MiniWindow_Hide` | R→M | — | void | Hide mini window |
| `MiniWindow_SetPin` | R→M | `boolean` | void | Pin/unpin |
| `MiniWindow_Toggle` | R→M | — | void | Toggle visibility |
| `MiniWindow_GetBounds` | R→M | — | `Rectangle` | Get bounds |

---

## Utility Domains

### Notification (2 channels)
| Channel | Direction | Request | Response |
|---------|-----------|---------|----------|
| `Notification_Show` | R→M | `{ title, body, icon? }` | void |
| `Notification_Clear` | R→M | — | void |

### Open (2 channels)
| Channel | Direction | Request | Response |
|---------|-----------|---------|----------|
| `Open_Url` | R→M | `{ url }` | void |
| `Open_Path` | R→M | `{ path }` | void |

### AES (2 channels)
| Channel | Direction | Request | Response |
|---------|-----------|---------|----------|
| `AES_Encrypt` | R→M | `{ data, key }` | `string` |
| `AES_Decrypt` | R→M | `{ data, key }` | `string` |

### Zip (2 channels)
| Channel | Direction | Request | Response |
|---------|-----------|---------|----------|
| `Zip_Compress` | R→M | `{ files, dest }` | `string` (path) |
| `Zip_Decompress` | R→M | `{ path, dest }` | `string` (path) |

### Shortcuts (1 channel)
| Channel | Direction | Request | Response |
|---------|-----------|---------|----------|
| `Shortcuts_Register` | R→M | `Shortcut[]` | void |

### StoreSync (4 channels)
| Channel | Direction | Request | Response |
|---------|-----------|---------|----------|
| `StoreSync_GetState` | R→M | `{ key }` | `any` |
| `StoreSync_SetState` | R→M | `{ key, value }` | void |
| `StoreSync_Subscribe` | R→M | `{ key }` | `() => void` (cleanup) |
| `StoreSync_StateChanged` | M→R | `{ key, value }` | — |

---

## Global Events (M→R)

| Channel | Payload | Description |
|---------|---------|-------------|
| `ThemeUpdated` | `{ theme: 'light' \| 'dark' }` | Theme changed |
| `WindowFocused` | — | Window gained focus |
| `WindowBlurred` | — | Window lost focus |
| `WindowResized` | `{ width, height }` | Window resized |
| `WindowMoved` | `{ x, y }` | Window moved |
| `DeepLinkReceived` | `{ url: string }` | Protocol URL received |
| `TrayClicked` | — | Tray icon clicked |
| `PowerMonitor_Suspend` | — | System sleep |
| `PowerMonitor_Resume` | — | System wake |
| `NetworkStatusChanged` | `{ online: boolean }` | Network change |
