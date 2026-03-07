# IPC Contract: Config Channels

**Feature**: F001-app-core
**Channel Prefix**: `config:*`
**Date**: 2026-03-02

---

## config:get

**Channel**: `IpcChannel.ConfigGet`
**Direction**: Renderer -> Main
**Description**: Retrieves a configuration value by key from the persistent config store (electron-store). Returns the stored value, or the default value if the key has not been explicitly set. Supports typed access via the shared `ConfigSchema` type map.

### Request

```typescript
type Request = string
// Configuration key path (e.g., "language", "theme", "proxy.host")
// Supports dot-notation for nested keys
```

### Response

```typescript
type Response = unknown
// The stored value for the key, or the default value if not set
// The actual type depends on the key as defined in ConfigSchema:
//   "language" -> string (e.g., "en-us")
//   "theme" -> "light" | "dark" | "system"
//   "proxy.host" -> string
//   "proxy.port" -> number
//   etc.
```

### Type Safety

While the IPC transport returns `unknown`, the typed wrapper in the preload bridge and the Zustand stores provide compile-time type checking:

```typescript
// In shared types
interface ConfigSchema {
  language: string
  theme: 'light' | 'dark' | 'system'
  'proxy.host': string
  'proxy.port': number
  'windowState.width': number
  'windowState.height': number
  'windowState.x': number
  'windowState.y': number
  'windowState.maximized': boolean
  // ... additional keys defined by F002 and other features
}
```

### Errors

| Error | Condition |
|-------|-----------|
| None expected | Unknown keys return `undefined`. No errors thrown. |

---

## config:set

**Channel**: `IpcChannel.ConfigSet`
**Direction**: Renderer -> Main
**Description**: Sets a configuration value by key in the persistent config store. The value is immediately written to disk (atomic JSON file write via electron-store). Supports dot-notation for nested keys. Triggers any registered watchers on the main process side.

### Request

```typescript
interface ConfigSetRequest {
  key: string     // Configuration key path (dot-notation supported)
  value: unknown  // Value to store (must be JSON-serializable)
}
```

### Response

```typescript
type Response = void
```

### Behavior Notes

- Values are persisted immediately and synchronously to disk
- Dot-notation keys create nested objects (e.g., `"proxy.host"` creates `{ proxy: { host: ... } }`)
- Setting a value to `undefined` or `null` removes the key
- The config file is located at `{appDataPath}/config.json` (or `{executableDir}/data/config.json` in portable mode)
- If the config file becomes corrupted, the next read operation resets the entire store to defaults (FR-010)

### Errors

| Error | Condition |
|-------|-----------|
| Serialization error | Value is not JSON-serializable (e.g., contains functions or circular references). Throws with message. |
| Write error | Cannot write to config file (permissions or disk full). Throws with message. |
