# IPC Channel Contracts: App Core

**Feature Branch**: `001-app-core`
**Date**: 2026-03-07
**Transport**: Electron IPC (`ipcMain.handle` / `ipcRenderer.invoke`)

All IPC channels use typed request/response pairs. Channel names are defined in `src/shared/IpcChannel.ts`.

---

## app:* — Application Lifecycle

| Channel | Request | Response | Description |
|---------|---------|----------|-------------|
| `app:info` | `void` | `{ name: string, version: string, platform: string, arch: string, isPortable: boolean }` | Get app info |
| `app:get-path` | `{ name: 'userData' \| 'home' \| 'temp' \| 'logs' }` | `string` | Get standard directory path |
| `app:get-data-path` | `void` | `string` | Get active data directory |
| `app:set-data-path` | `{ path: string }` | `{ success: boolean, error?: string }` | Set custom data directory |
| `app:get-language` | `void` | `string` | Get current app language |
| `app:set-language` | `{ language: string }` | `void` | Set app language |
| `app:set-launch-on-boot` | `{ enabled: boolean }` | `void` | Enable/disable launch on boot |
| `app:get-launch-on-boot` | `void` | `boolean` | Get launch on boot status |
| `app:set-proxy` | `{ mode: 'system' \| 'fixed' \| 'direct', url?: string }` | `void` | Set proxy configuration |
| `app:get-proxy` | `void` | `{ mode: string, url: string }` | Get proxy configuration |
| `app:quit` | `void` | `void` | Quit the application |
| `app:relaunch` | `void` | `void` | Relaunch the application |

---

## config:* — Configuration

| Channel | Request | Response | Description |
|---------|---------|----------|-------------|
| `config:get` | `{ key: string }` | `unknown` | Get config value |
| `config:set` | `{ key: string, value: unknown }` | `void` | Set config value (triggers observers) |
| `config:get-all` | `void` | `Record<string, unknown>` | Get all config values |
| `config:reset` | `{ key: string }` | `void` | Reset config key to default |
| `config:reset-all` | `void` | `void` | Reset all config to defaults |

**Observer pattern**: Config changes emit `config:changed` event (main → renderer) with `{ key: string, value: unknown, oldValue: unknown }`.

---

## window:* — Window Management

| Channel | Request | Response | Description |
|---------|---------|----------|-------------|
| `window:show` | `void` | `void` | Show and focus main window |
| `window:hide` | `void` | `void` | Hide main window |
| `window:minimize` | `void` | `void` | Minimize main window |
| `window:maximize` | `void` | `void` | Toggle maximize state |
| `window:close` | `void` | `void` | Close main window (minimize to tray if enabled) |
| `window:set-size` | `{ width: number, height: number }` | `void` | Set window size |
| `window:set-position` | `{ x: number, y: number }` | `void` | Set window position |
| `window:get-state` | `void` | `WindowState` | Get current window state |
| `window:set-always-on-top` | `{ enabled: boolean }` | `void` | Toggle always-on-top |
| `window:set-fullscreen` | `{ enabled: boolean }` | `void` | Toggle fullscreen |

---

## system:* — System Information

| Channel | Request | Response | Description |
|---------|---------|----------|-------------|
| `system:info` | `void` | `{ platform: string, arch: string, hostname: string, cpus: number, memory: number }` | Get system info |
| `system:clipboard-read` | `void` | `string` | Read clipboard text |
| `system:clipboard-write` | `{ text: string }` | `void` | Write text to clipboard |
| `system:get-screens` | `void` | `{ id: number, bounds: Rectangle }[]` | Get display info |
| `system:get-device-type` | `void` | `'desktop' \| 'laptop'` | Get device type |

---

## open:* — External Navigation

| Channel | Request | Response | Description |
|---------|---------|----------|-------------|
| `open:url` | `{ url: string }` | `void` | Open URL in default browser |
| `open:path` | `{ path: string }` | `void` | Open file/folder in system file manager |

---

## theme:* — Theme Management

| Channel | Request | Response | Description |
|---------|---------|----------|-------------|
| `theme:get` | `void` | `{ mode: 'light' \| 'dark' \| 'system', resolved: 'light' \| 'dark' }` | Get current theme |
| `theme:set` | `{ mode: 'light' \| 'dark' \| 'system' }` | `void` | Set theme mode |

**Event**: `theme:changed` (main → renderer) with `{ mode: string, resolved: string }` when theme changes (including OS theme change when mode is 'system').
