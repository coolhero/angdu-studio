# Research Decisions: F001-app-core

**Feature**: App Core — Electron shell, window management, IPC bridge, config store, theme, auto-update, proxy, tray, deep links, shortcuts, notifications, crash reporting
**Date**: 2026-03-08
**Status**: Final

---

## RD-001: Electron Window State Persistence

**Decision**: Use `electron-window-state` for window position/size persistence.

**Why**: Battle-tested library that handles multi-monitor edge cases (monitor disconnected, resolution changes). Cherry Studio uses this successfully. It serializes to a JSON file in the app data directory and provides `manage()` to auto-track resize/move events.

**Alternative rejected**: Manual persistence via electron-store. Requires reimplementing monitor-bounds validation, default-centering logic, and debounced save — all of which `electron-window-state` handles out of the box.

**Implementation pattern**:
```typescript
import windowStateKeeper from 'electron-window-state';

const mainWindowState = windowStateKeeper({
  defaultWidth: 1080,
  defaultHeight: 600,
  file: 'main-window-state.json',
});

const mainWindow = new BrowserWindow({
  x: mainWindowState.x,
  y: mainWindowState.y,
  width: mainWindowState.width,
  height: mainWindowState.height,
  minWidth: 1080,
  minHeight: 600,
});

mainWindowState.manage(mainWindow);
```

---

## RD-002: IPC Type Safety Approach

**Decision**: Shared `IpcChannel` enum + typed preload API surface. All channel names live in a single `src/shared/ipc-channels.ts` file imported by both main and preload. The preload script exposes a typed `window.api` object using `contextBridge.exposeInMainWorld`.

**Why**: Cherry Studio's approach (single `IpcChannel` enum in `packages/shared/IpcChannel.ts`) works well at scale — the enum prevents channel name typos at compile time and provides a single source of truth. The preload API surface provides TypeScript return-type safety without runtime overhead.

**Alternative rejected**: `electron-trpc` or `typed-ipc` libraries. These add abstraction layers and dependencies for a problem that a simple enum + typed object solves. The Cherry Studio codebase demonstrates this scales to 200+ channels without issues.

**Implementation pattern**:
```typescript
// src/shared/ipc-channels.ts
export enum IpcChannel {
  App_Info = 'app:info',
  App_Quit = 'app:quit',
  Config_Get = 'config:get',
  Config_Set = 'config:set',
  // ...grouped by domain
}

// src/preload/index.ts
const api = {
  getAppInfo: (): Promise<AppInfo> => ipcRenderer.invoke(IpcChannel.App_Info),
  quit: (): Promise<void> => ipcRenderer.invoke(IpcChannel.App_Quit),
  config: {
    get: (key: string): Promise<unknown> => ipcRenderer.invoke(IpcChannel.Config_Get, key),
    set: (key: string, value: unknown): Promise<void> => ipcRenderer.invoke(IpcChannel.Config_Set, key, value),
  },
};
contextBridge.exposeInMainWorld('api', api);
export type WindowApiType = typeof api;
```

---

## RD-003: Configuration Management

**Decision**: `electron-store` with a typed `ConfigKeys` enum and reactive subscriber pattern for change notification.

**Why**: electron-store is the de facto standard for Electron app configuration. It handles atomic writes, JSON schema validation, and cross-platform paths. Cherry Studio's `ConfigManager` wraps it with typed accessors and a subscriber pattern (`subscribe(key, callback)`) that lets services react to config changes without polling.

**Alternative rejected**:
- SQLite for config: Overkill for key-value settings. SQLite is reserved for structured relational data (conversations, messages).
- Dexie/IndexedDB: Only accessible in renderer process; config must be available in main process at startup.

**Implementation pattern**:
```typescript
export enum ConfigKeys {
  Language = 'language',
  Theme = 'theme',
  ProxyMode = 'proxyMode',
  ProxyUrl = 'proxyUrl',
  ProxyBypassRules = 'proxyBypassRules',
  Tray = 'tray',
  TrayOnClose = 'trayOnClose',
  LaunchToTray = 'launchToTray',
  AutoUpdate = 'autoUpdate',
  UpdateChannel = 'updateChannel',
  Shortcuts = 'shortcuts',
  ZoomFactor = 'zoomFactor',
  ClientId = 'clientId',
}

export class ConfigManager {
  private store: Store;
  private subscribers: Map<string, Array<(value: unknown) => void>> = new Map();

  get<T>(key: ConfigKeys, defaultValue?: T): T { ... }
  set(key: ConfigKeys, value: unknown, notify = false): void { ... }
  subscribe<T>(key: ConfigKeys, cb: (v: T) => void): () => void { ... }
}

export const configManager = new ConfigManager();
```

---

## RD-004: Theme Synchronization

**Decision**: Use Electron's `nativeTheme` API as the single source of truth. Set `nativeTheme.themeSource` to control the theme. Listen to `nativeTheme.on('updated')` to broadcast changes to all windows via IPC. Update `titleBarOverlay` colors on theme change.

**Why**: `nativeTheme` automatically handles system theme detection and CSS `prefers-color-scheme` media query in renderer. Cherry Studio's `ThemeService` is minimal (~48 lines) and effective — it sets `nativeTheme.themeSource`, persists via `configManager`, and broadcasts `ThemeUpdated` to all windows.

**Alternative rejected**: CSS-only theme switching in renderer. This misses the title bar overlay color sync and doesn't propagate to `nativeTheme.shouldUseDarkColors` which other Electron APIs depend on.

**Implementation pattern**:
```typescript
class ThemeService {
  setTheme(mode: ThemeMode): void {
    nativeTheme.themeSource = mode; // 'dark' | 'light' | 'system'
    configManager.set(ConfigKeys.Theme, mode);
  }
  // nativeTheme.on('updated') → broadcast to all BrowserWindows
  // Update titleBarOverlay on each window
}
```

---

## RD-005: Proxy Implementation

**Decision**: Multi-layer proxy application — `session.setProxy()` for Electron network, environment variables for Node.js native modules, `undici` global dispatcher for `fetch()`, and `ProxyAgent` for `http/https` modules. Bypass rules support CIDR, IP, domain, wildcard, and `<local>`.

**Why**: Cherry Studio's `ProxyManager` (~590 lines) demonstrates that Electron apps need proxy at four layers because different parts of the app use different network stacks (Electron session, Node.js http/https, undici/fetch, axios). A single `session.setProxy()` call is insufficient.

**Alternative rejected**: Simple `session.setProxy()` only. This misses Node.js-level requests (e.g., MCP server communication via `http` module, axios calls to AI provider APIs).

**Key implementation details**:
- System proxy mode: poll OS proxy via `os-proxy-config` every 60 seconds
- SOCKS support: use `fetch-socks` `socksDispatcher` for SOCKS4/5 via undici
- Bypass matching: parse rules into typed structs, match per-request
- Selective dispatcher: `Dispatcher` subclass that checks bypass rules before routing

---

## RD-006: Auto-Update

**Decision**: `electron-updater` with configurable update channels (latest, rc, beta) and optional mirror URLs. Check on launch, notify user, download in background, install on quit.

**Why**: electron-updater integrates with electron-builder/electron-vite build pipelines and supports differential updates, multiple channels, and custom feed URLs. Cherry Studio's `AppUpdater` handles channel switching via `autoUpdater.channel` and custom `setFeedURL` for mirror support.

**Alternative rejected**:
- Manual update check via GitHub API: Requires reimplementing download, verification, and platform-specific installation.
- Squirrel: macOS only, doesn't support Linux.

**Implementation pattern**:
```typescript
import { autoUpdater } from 'electron-updater';

autoUpdater.channel = configManager.get(ConfigKeys.UpdateChannel, 'latest');
autoUpdater.autoDownload = false;
autoUpdater.on('update-available', (info) => { /* notify renderer */ });
autoUpdater.on('download-progress', (progress) => { /* broadcast progress */ });
autoUpdater.on('update-downloaded', () => { /* prompt install */ });
```

---

## RD-007: Store Sync (Main ↔ Renderer)

**Decision**: Replace Cherry Studio's Redux-based `StoreSyncService` with Zustand `subscribe()` + IPC push pattern. Main process pushes config changes to renderer via `webContents.send()`. Renderer pushes state updates to main via `ipcRenderer.invoke()`.

**Why**: The project constitution mandates Zustand over Redux. Zustand's `subscribe()` API provides fine-grained reactivity without middleware. The sync pattern is simpler: main process owns config state (electron-store), renderer owns UI state (Zustand). Changes flow uni-directionally per domain.

**Alternative rejected**:
- Shared state via IPC polling: Wasteful and introduces latency.
- Redux + redux-electron-store: Adds complexity of Redux middleware; project is migrating away from Redux.

**Implementation pattern**:
```typescript
// Main → Renderer: push config changes
configManager.subscribe(ConfigKeys.Theme, (newTheme) => {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send(IpcChannel.StoreSync_Push, { key: 'theme', value: newTheme });
  });
});

// Renderer: Zustand store reacts to IPC
const useAppStore = create<AppState>((set) => ({
  theme: 'system',
  // hydrate from main on init
}));

// Listen for pushes from main
window.api.storeSync.onUpdate((patch) => {
  useAppStore.setState({ [patch.key]: patch.value });
});
```

---

## RD-008: Notification System

**Decision**: Event-emitter pattern in main process with IPC push to renderer. Notifications are runtime-only (in-memory, not persisted). Support both system-level notifications (via Electron `Notification` API) and in-app notifications (rendered by the UI).

**Why**: Notifications in Cherry Studio are ephemeral UI events (update available, proxy error, MCP status). They don't need persistence. The main process creates notification objects and pushes them to the renderer which displays them in a toast/notification center component.

**Alternative rejected**:
- Persisting notifications in SQLite: Overkill for transient status messages.
- Renderer-only notifications: Misses main-process events (update downloaded, crash detected, proxy change).

**Implementation pattern**:
```typescript
interface AppNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  source: string;         // originating service
  progress?: number;       // 0-100 for download progress
  actions?: NotificationAction[];
  dismissAfterMs?: number; // auto-dismiss timeout
  createdAt: number;
}

class NotificationService {
  show(notification: Omit<AppNotification, 'id' | 'createdAt'>): string {
    const n = { ...notification, id: nanoid(), createdAt: Date.now() };
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send(IpcChannel.Notification_Show, n);
    });
    return n.id;
  }
}
```

---

## Dependencies Summary

| Package | Purpose | Version Target |
|---------|---------|---------------|
| `electron` | Core runtime | ^40.x |
| `electron-vite` | Build toolchain | ^3.x |
| `electron-store` | Config persistence | ^10.x |
| `electron-window-state` | Window state persistence | ^5.x |
| `electron-updater` | Auto-update | ^6.x |
| `zustand` | State management (renderer) | ^5.x |
| `os-proxy-config` | System proxy detection | ^2.x |
| `fetch-socks` | SOCKS proxy for undici/fetch | ^1.x |
| `proxy-agent` | HTTP/HTTPS proxy agent | ^6.x |
| `undici` | Modern HTTP client | ^7.x |
| `nanoid` | Notification IDs | ^5.x |
