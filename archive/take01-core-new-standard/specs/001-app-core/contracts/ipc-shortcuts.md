# IPC Contract: Shortcuts Channels

**Feature**: F001-app-core
**Channel Prefix**: `shortcuts:*`
**Date**: 2026-03-02

---

## shortcuts:update

**Channel**: `IpcChannel.ShortcutsUpdate`
**Direction**: Renderer -> Main
**Description**: Sends the complete list of keyboard shortcuts to the main process for registration with Electron's `globalShortcut` API. The main process unregisters all existing shortcuts and re-registers the provided list. Only enabled shortcuts are registered. Called on app startup and whenever shortcuts are modified by the user.

### Request

```typescript
type Request = Shortcut[]

interface Shortcut {
  key: string         // Logical action identifier (e.g., "showApp", "quickSearch")
  shortcut: string    // Electron accelerator string (e.g., "CommandOrControl+Shift+Space")
  editable: boolean   // Whether the user can customize this shortcut
  enabled: boolean    // Whether this shortcut is currently active
}
```

### Response

```typescript
type Response = void
```

### Behavior Notes

- The main process calls `globalShortcut.unregisterAll()` before registering new shortcuts
- Only shortcuts with `enabled: true` are registered
- If a key combination conflicts with another application's global shortcut, registration silently fails for that shortcut (Electron behavior) -- no error is thrown, but the shortcut will not trigger
- The Electron accelerator format supports: `CommandOrControl`, `Alt`, `Shift`, `Super`, plus key names (letters, numbers, F-keys, etc.)

### Errors

| Error | Condition |
|-------|-----------|
| Invalid accelerator | A shortcut string is not a valid Electron accelerator. Logged as warning; other shortcuts still registered. |

---

## shortcuts:get

**Channel**: `IpcChannel.ShortcutsGet`
**Direction**: Renderer -> Main
**Description**: Retrieves the list of currently registered global shortcuts from the main process. Used to verify which shortcuts are actually active (as opposed to what the renderer thinks is active), particularly useful for diagnosing shortcut conflicts.

### Request

```typescript
type Request = void
```

### Response

```typescript
type Response = Shortcut[]

interface Shortcut {
  key: string         // Logical action identifier
  shortcut: string    // Electron accelerator string
  editable: boolean   // Whether user-customizable
  enabled: boolean    // Whether currently active
}
```

### Errors

| Error | Condition |
|-------|-----------|
| None expected | Always returns the current shortcut list (may be empty). |
