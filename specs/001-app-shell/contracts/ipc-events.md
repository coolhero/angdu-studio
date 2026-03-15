# IPC Event Contracts (Main → Renderer)

All event channels use `webContents.send()` from main and `ipcRenderer.on()` in preload. These are one-way notifications from main to renderer.

---

## Theme Events

### `theme:changed`
- **Payload**: `{ theme: 'light' | 'dark' }`
- **Trigger**: nativeTheme change, or user calls `theme:set`
- **Frequency**: On change only (not periodic)

---

## Window Events

### `window:focus`
- **Payload**: `void`
- **Trigger**: BrowserWindow 'focus' event

### `window:blur`
- **Payload**: `void`
- **Trigger**: BrowserWindow 'blur' event

### `window:state-changed`
- **Payload**: `{ state: WindowState }`
- **Trigger**: Window move, resize, maximize, or restore
- **Debounce**: 300ms (avoid flooding during drag)

---

## Update Events

### `update:available`
- **Payload**: `{ version: string }`
- **Trigger**: electron-updater detects new version

### `update:progress`
- **Payload**: `{ percent: number, bytesPerSecond: number, total: number, transferred: number }`
- **Trigger**: Download progress change
- **Frequency**: Throttled to max 1 event per second

### `update:ready`
- **Payload**: `{ version: string }`
- **Trigger**: Download complete, ready to install

---

## Deep Link Events

### `deep-link:received`
- **Payload**: `{ url: string }`
- **Trigger**: `angdu://` protocol URL received (from second-instance or OS protocol handler)
- **Queuing**: If emitted before renderer is ready, queued and replayed after window loads
