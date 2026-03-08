# IPC Channel Contract: F001-app-core

**Feature**: App Core
**Date**: 2026-03-08
**Status**: Final

---

## Channel Direction Legend

| Direction | Mechanism | Description |
|-----------|-----------|-------------|
| `invoke` | `ipcRenderer.invoke()` → `ipcMain.handle()` | Renderer calls main, awaits response |
| `send` | `webContents.send()` → `ipcRenderer.on()` | Main pushes to renderer (no response) |

---

## 1. App Lifecycle (`app:*`)

| Channel | Direction | Parameters | Return Type | Description |
|---------|-----------|------------|-------------|-------------|
| `app:info` | invoke | — | `AppInfo` | Get app metadata (version, platform, paths) |
| `app:quit` | invoke | — | `void` | Initiate graceful shutdown |
| `app:reload` | invoke | — | `void` | Reload all renderer windows |
| `app:relaunch` | invoke | `options?: RelaunchOptions` | `void` | Relaunch the entire app |
| `app:get-version` | invoke | — | `string` | Shorthand for `app.getVersion()` |
| `app:get-platform` | invoke | — | `NodeJS.Platform` | `'darwin' \| 'win32' \| 'linux'` |
| `app:get-data-path` | invoke | — | `string` | `app.getPath('userData')` |
| `app:set-stop-quit` | invoke | `stop: boolean, reason: string` | `void` | Prevent/allow app quit (e.g. during export) |

---

## 2. Window Management (`window:*`)

| Channel | Direction | Parameters | Return Type | Description |
|---------|-----------|------------|-------------|-------------|
| `window:minimize` | invoke | — | `void` | Minimize the focused window |
| `window:maximize` | invoke | — | `void` | Maximize the focused window |
| `window:unmaximize` | invoke | — | `void` | Restore the focused window from maximized |
| `window:close` | invoke | — | `void` | Close the focused window (may minimize to tray) |
| `window:is-maximized` | invoke | — | `boolean` | Check if focused window is maximized |
| `window:maximized-changed` | send | `isMaximized: boolean` | — | Pushed when maximize state changes |
| `window:set-fullscreen` | invoke | `value: boolean` | `void` | Enter or exit fullscreen |
| `window:is-fullscreen` | invoke | — | `boolean` | Check fullscreen state |
| `window:set-minimum-size` | invoke | `width: number, height: number` | `void` | Override minimum window dimensions |
| `window:reset-minimum-size` | invoke | — | `void` | Reset to default minimum (1080x600) |
| `window:get-size` | invoke | — | `[number, number]` | Get current `[width, height]` |

---

## 3. Config (`config:*`)

| Channel | Direction | Parameters | Return Type | Description |
|---------|-----------|------------|-------------|-------------|
| `config:get` | invoke | `key: ConfigKeys` | `unknown` | Read a config value |
| `config:set` | invoke | `key: ConfigKeys, value: unknown, notify?: boolean` | `void` | Write a config value. If `notify=true`, triggers subscriber callbacks. |

**Note**: Config subscriptions are handled via `StoreSync_Push`, not a dedicated config channel. When a config value changes with `notify=true`, `ConfigManager` fires subscribers in main process, and relevant services push updates to renderer via `store-sync:push`.

---

## 4. Theme (`theme:*`)

| Channel | Direction | Parameters | Return Type | Description |
|---------|-----------|------------|-------------|-------------|
| `theme:set` | invoke | `theme: ThemeMode` | `void` | Set theme to `'dark' \| 'light' \| 'system'`. Persists to config, applies `nativeTheme.themeSource`, updates title bar overlays. |
| `theme:updated` | send | `resolvedTheme: ThemeMode` | — | Pushed to all windows when effective theme changes (including OS-triggered system theme changes). Value is resolved (`'dark'` or `'light'`, never `'system'`). |

---

## 5. Proxy (`proxy:*`)

| Channel | Direction | Parameters | Return Type | Description |
|---------|-----------|------------|-------------|-------------|
| `proxy:set` | invoke | `url: string \| undefined, bypassRules?: string` | `void` | Apply proxy configuration. `undefined` url = direct connection. Applies to Electron session, http/https agents, undici dispatcher, and env vars. Bypass rules are semicolon-separated. |

**Proxy mode logic** (handled in main process, not separate channels):
- `none` → `proxy:set(undefined)`
- `system` → detect via `os-proxy-config`, then `proxy:set(systemUrl, systemBypass)`
- `custom` → `proxy:set(userUrl, userBypass)`

Config keys `proxyMode`, `proxyUrl`, `proxyBypassRules` are read/written via `config:get`/`config:set`.

---

## 6. Notifications (`notification:*`)

| Channel | Direction | Parameters | Return Type | Description |
|---------|-----------|------------|-------------|-------------|
| `notification:send` | invoke | `notification: Omit<AppNotification, 'id' \| 'createdAt'>` | `string` | Create and broadcast a notification from renderer. Returns the assigned `id`. |
| `notification:show` | send | `notification: AppNotification` | — | Pushed from main to renderer when a notification should be displayed (originated from main or another renderer). |
| `notification:dismiss` | invoke | `id: string` | `void` | Dismiss a notification by ID. |
| `notification:on-action` | invoke | `id: string, action: string` | `void` | User clicked a notification action button. Main process routes the action to the originating service. |

---

## 7. System (`system:*`)

| Channel | Direction | Parameters | Return Type | Description |
|---------|-----------|------------|-------------|-------------|
| `system:open-external` | invoke | `url: string` | `void` | Open URL in default browser via `shell.openExternal()` |
| `system:open-path` | invoke | `path: string` | `void` | Open file/folder in system file manager via `shell.openPath()` |
| `system:get-platform-info` | invoke | — | `PlatformInfo` | Get OS details: platform, arch, isMac/isWindows/isLinux, osVersion |
| `system:toggle-devtools` | invoke | — | `void` | Toggle Chromium DevTools on the focused window |

---

## 8. Mini Window (`miniwindow:*`)

| Channel | Direction | Parameters | Return Type | Description |
|---------|-----------|------------|-------------|-------------|
| `miniwindow:show` | invoke | — | `void` | Show/create the mini window (550x400) |
| `miniwindow:hide` | invoke | — | `void` | Hide the mini window (keep in memory) |
| `miniwindow:close` | invoke | — | `void` | Destroy the mini window |
| `miniwindow:toggle` | invoke | — | `void` | Toggle mini window visibility |
| `miniwindow:set-pin` | invoke | `isPinned: boolean` | `void` | Set `alwaysOnTop` for the mini window |

---

## 9. Tray (`tray:*`)

| Channel | Direction | Parameters | Return Type | Description |
|---------|-----------|------------|-------------|-------------|
| `tray:set-enabled` | invoke | `enabled: boolean` | `void` | Create or destroy the system tray icon |
| `tray:set-tray-on-close` | invoke | `enabled: boolean` | `void` | Configure close-to-tray behavior |

**Note**: Tray context menu items (Show/Hide, Quick Assistant, Quit) are handled entirely in main process. Tray click events are routed to `WindowService` or `MiniWindowService` directly — no IPC needed.

---

## 10. Auto-Update (`update:*`)

| Channel | Direction | Parameters | Return Type | Description |
|---------|-----------|------------|-------------|-------------|
| `update:check` | invoke | — | `UpdateCheckResult \| null` | Check for available updates. Returns `null` if up to date. |
| `update:download` | invoke | — | `void` | Start downloading the available update |
| `update:install` | invoke | — | `void` | Quit and install the downloaded update |
| `update:set-channel` | invoke | `channel: UpdateChannel` | `void` | Switch update channel (`'latest' \| 'rc' \| 'beta'`). Persists to config. |
| `update:progress` | send | `{ percent: number, bytesPerSecond: number, transferred: number, total: number }` | — | Download progress events pushed to renderer |
| `update:available` | send | `{ version: string, releaseNotes?: string }` | — | Pushed when a new update is detected |
| `update:downloaded` | send | `{ version: string }` | — | Pushed when update download completes |

```typescript
interface UpdateCheckResult {
  version: string;
  releaseDate: string;
  releaseNotes?: string;
}
```

---

## 11. Shortcuts (`shortcut:*`)

| Channel | Direction | Parameters | Return Type | Description |
|---------|-----------|------------|-------------|-------------|
| `shortcut:update` | invoke | `shortcuts: ShortcutBinding[]` | `void` | Replace all shortcut bindings. Unregisters old global shortcuts, registers new ones. Persists to config. |
| `shortcut:get-all` | invoke | — | `ShortcutBinding[]` | Get all current shortcut bindings |

---

## 12. Protocol / Deep Links (`protocol:*`)

| Channel | Direction | Parameters | Return Type | Description |
|---------|-----------|------------|-------------|-------------|
| `protocol:handle-url` | invoke | `url: string` | `void` | Process a deep link URL (called from main when protocol handler fires) |
| `protocol:on-receive` | send | `{ url: string, params: Record<string, string> }` | — | Pushed to renderer when an `angdu-studio://` URL is received |

**URL format**: `angdu-studio://<action>?<params>`

Supported actions (F001 scope):
- `angdu-studio://settings` — open settings page
- Other actions defined by downstream features (MCP install, provider import, etc.)

---

## 13. Store Sync (`store-sync:*`)

| Channel | Direction | Parameters | Return Type | Description |
|---------|-----------|------------|-------------|-------------|
| `store-sync:push` | send | `{ key: string, value: unknown }` | — | Main pushes a state update to renderer |
| `store-sync:pull` | invoke | `key: string` | `unknown` | Renderer requests current state for a key from main |
| `store-sync:subscribe` | invoke | — | `void` | Renderer signals it wants to receive push updates |
| `store-sync:unsubscribe` | invoke | — | `void` | Renderer signals it no longer wants push updates |
| `store-sync:on-update` | invoke | `{ type: string, payload: unknown }` | `void` | Renderer sends a state mutation to main (reverse direction) |

---

## 14. Zoom (`zoom:*`)

| Channel | Direction | Parameters | Return Type | Description |
|---------|-----------|------------|-------------|-------------|
| `zoom:handle-factor` | invoke | `delta: number, reset?: boolean` | `void` | Adjust zoom: `delta > 0` zooms in, `delta < 0` zooms out, `reset=true` resets to 1.0. Persists to `ConfigKeys.ZoomFactor`. |

---

## 15. Crash Reporter (`crash:*`)

| Channel | Direction | Parameters | Return Type | Description |
|---------|-----------|------------|-------------|-------------|
| `crash:mock-renderer` | invoke | — | `void` | Dev-only: deliberately crash the renderer for testing crash reporter |

**Note**: Crash reports are collected via `webContents.on('render-process-gone')` and `process.on('uncaughtException')` in main. Reports are written to `{userData}/crash-reports/`. No IPC channel is needed for collection — it happens entirely in main process.

---

## Preload API Surface

The preload script groups these channels into a typed `window.api` object:

```typescript
interface WindowApi {
  // App lifecycle
  getAppInfo(): Promise<AppInfo>;
  quit(): Promise<void>;
  reload(): Promise<void>;
  relaunch(options?: RelaunchOptions): Promise<void>;
  setStopQuit(stop: boolean, reason: string): Promise<void>;

  // Window controls
  windowControls: {
    minimize(): Promise<void>;
    maximize(): Promise<void>;
    unmaximize(): Promise<void>;
    close(): Promise<void>;
    isMaximized(): Promise<boolean>;
    onMaximizedChange(cb: (isMaximized: boolean) => void): () => void;
  };

  window: {
    setMinimumSize(width: number, height: number): Promise<void>;
    resetMinimumSize(): Promise<void>;
    getSize(): Promise<[number, number]>;
    setFullScreen(value: boolean): Promise<void>;
    isFullScreen(): Promise<boolean>;
  };

  // Config
  config: {
    get(key: string): Promise<unknown>;
    set(key: string, value: unknown, notify?: boolean): Promise<void>;
  };

  // Theme
  setTheme(theme: ThemeMode): Promise<void>;

  // Proxy
  setProxy(url: string | undefined, bypassRules?: string): Promise<void>;

  // Notifications
  notification: {
    send(notification: Omit<AppNotification, 'id' | 'createdAt'>): Promise<string>;
    dismiss(id: string): Promise<void>;
  };

  // System
  shell: {
    openExternal(url: string): Promise<void>;
  };
  openPath(path: string): Promise<void>;

  // Mini window
  miniWindow: {
    show(): Promise<void>;
    hide(): Promise<void>;
    close(): Promise<void>;
    toggle(): Promise<void>;
    setPin(isPinned: boolean): Promise<void>;
  };

  // Shortcuts
  shortcuts: {
    update(shortcuts: ShortcutBinding[]): Promise<void>;
    getAll(): Promise<ShortcutBinding[]>;
  };

  // Protocol
  protocol: {
    onReceiveData(cb: (data: { url: string; params: Record<string, string> }) => void): () => void;
  };

  // Store sync
  storeSync: {
    subscribe(): Promise<void>;
    unsubscribe(): Promise<void>;
    onUpdate(cb: (patch: { key: string; value: unknown }) => void): () => void;
  };

  // Update
  checkForUpdate(): Promise<UpdateCheckResult | null>;
  quitAndInstall(): Promise<void>;

  // Zoom
  handleZoomFactor(delta: number, reset?: boolean): Promise<void>;

  // Dev
  devTools: {
    toggle(): Promise<void>;
  };
}
```
