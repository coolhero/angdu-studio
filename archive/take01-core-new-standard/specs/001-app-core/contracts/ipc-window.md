# IPC Contract: Window Channels

**Feature**: F001-app-core
**Channel Prefix**: `window:*`
**Date**: 2026-03-02

---

## window:minimize

**Channel**: `IpcChannel.WindowMinimize`
**Direction**: Renderer -> Main
**Description**: Minimizes the main application window to the taskbar (Windows/Linux) or dock (macOS). Used by custom title bar controls when the native title bar is hidden.

### Request

```typescript
type Request = void
```

### Response

```typescript
type Response = void
```

### Errors

| Error | Condition |
|-------|-----------|
| None expected | Always succeeds. If the window is already minimized, this is a no-op. |

---

## window:maximize

**Channel**: `IpcChannel.WindowMaximize`
**Direction**: Renderer -> Main
**Description**: Toggles the main window between maximized and normal state. If the window is currently maximized, it restores to the previous size and position. If it is not maximized, it fills the screen.

### Request

```typescript
type Request = void
```

### Response

```typescript
type Response = boolean
// Returns the new maximized state: true if now maximized, false if restored
```

### Errors

| Error | Condition |
|-------|-----------|
| None expected | Always succeeds. |

---

## window:close

**Channel**: `IpcChannel.WindowClose`
**Direction**: Renderer -> Main
**Description**: Closes the main application window. On macOS, this hides the window but keeps the app running in the dock (the app only fully quits via the dock menu or Cmd+Q). On Windows and Linux, this closes the window and quits the application unless the "minimize to tray on close" preference is enabled.

### Request

```typescript
type Request = void
```

### Response

```typescript
type Response = void
```

### Platform-Specific Behavior

| Platform | Close Behavior |
|----------|---------------|
| macOS | Window is hidden. App remains in dock. Clicking dock icon or tray icon restores the window. |
| Windows | Window closes and app quits, unless "minimize to tray" is enabled in settings. |
| Linux | Same as Windows behavior. |

### Errors

| Error | Condition |
|-------|-----------|
| None expected | Always succeeds. |

---

## window:set-always-on-top

**Channel**: `IpcChannel.WindowSetAlwaysOnTop`
**Direction**: Renderer -> Main
**Description**: Toggles the "always on top" state of the main window. When enabled, the window stays above all other windows on the desktop. Used for the "pin window" feature.

### Request

```typescript
type Request = boolean
// true to enable always-on-top, false to disable
```

### Response

```typescript
type Response = void
```

### Errors

| Error | Condition |
|-------|-----------|
| None expected | Always succeeds. |
