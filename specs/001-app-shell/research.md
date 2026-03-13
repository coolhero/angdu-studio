# Research: App Shell

## Decision 1: Window State Persistence Library

- **Decision**: Use `electron-window-state` (keep from Cherry Studio)
- **Rationale**: Proven library for persisting BrowserWindow position/size/maximized state. No migration needed.
- **Alternatives considered**: Custom implementation with electron-store — rejected (reinventing tested wheel)

## Decision 2: Auto-Update Library

- **Decision**: Use `electron-updater` (keep from Cherry Studio)
- **Rationale**: De facto standard for Electron auto-update. Supports multiple channels, custom feed URLs, and differential downloads.
- **Alternatives considered**: Electron's built-in autoUpdater — rejected (no custom feed URL support, no differential updates)

## Decision 3: Config Persistence

- **Decision**: Use `electron-store` for main process configuration
- **Rationale**: Simple key-value store backed by JSON file. Provides typed access, defaults, and migration support.
- **Alternatives considered**: Drizzle/SQLite for config — rejected (overkill for simple key-value config)

## Decision 4: Preload API Design

- **Decision**: Typed contextBridge API with domain-grouped methods
- **Rationale**: Groups API surface by domain (windowControls, miniWindow, theme, app) for clarity. TypeScript interfaces ensure type safety across the IPC boundary.
- **Alternatives considered**: Single flat API object — rejected (too many methods, poor discoverability)

## Decision 5: Zustand Stores for F001

- **Decision**: Two stores — `useRuntimeStore` (ephemeral) and `useSelectionStore` (persisted)
- **Rationale**: Runtime state (window visibility, update status) is ephemeral. Selection state (text selection for assistant) persists across sessions.
- **Alternatives considered**: Single store — rejected (mixing persist/ephemeral concerns)

## Decision 6: Protocol Handler

- **Decision**: `angdustudio://` URL scheme, registered via Electron's `setAsDefaultProtocolClient`
- **Rationale**: Standard Electron approach. Handles both macOS (open-url event) and Windows/Linux (second-instance with URL arg).
- **Alternatives considered**: None — this is the standard approach
