# Research: App Shell

## R-001: Electron Config Persistence with better-sqlite3

**Decision**: Use better-sqlite3 directly (without Drizzle ORM) for app config persistence in the main process. Drizzle ORM is reserved for structured domain data (conversations, messages) in later features.

**Rationale**: App config is a simple key-value store with a single table. Drizzle ORM adds unnecessary complexity for this use case. better-sqlite3's synchronous API is ideal for config reads that must complete before window creation.

**Alternatives considered**:
- electron-store: Popular but uses JSON files. Lacks ACID transactions, corruption recovery is manual. better-sqlite3 provides atomic writes and built-in corruption detection.
- Drizzle ORM: Overkill for key-value config. Will be used for domain entities (messages, topics) in F005+.

## R-002: IPC Type Safety Strategy

**Decision**: Define IPC channel contracts as TypeScript types in `src/shared/types/ipc.ts`. Use Zod schemas for runtime validation at the IPC boundary. The preload script maps typed channel names to `ipcRenderer.invoke()` and `ipcRenderer.on()` calls.

**Rationale**: TypeScript alone catches type errors at compile time. Zod schemas catch malformed data at runtime (e.g., corrupt state from a crashed renderer). The combination provides defense-in-depth at the security boundary.

**Alternatives considered**:
- electron-trpc: Type-safe IPC via tRPC. Adds ~15KB and a dependency. Our channel count (25 invoke + 8 event) is small enough for manual typing.
- Typed IPC without runtime validation: Faster but trusts the renderer process completely. Since the renderer loads arbitrary web content (chat responses, markdown), runtime validation is warranted.

## R-003: Window State Persistence

**Decision**: Use `electron-window-state` (or implement equivalent) to persist window bounds. Store in the same better-sqlite3 database as app config.

**Rationale**: Window state persistence is a solved problem. electron-window-state handles multi-monitor detection, offscreen clamping, and maximized state. Storing in SQLite keeps all config in one database.

**Alternatives considered**:
- Manual implementation: More control but duplicates edge case handling (display disconnected, DPI changes). electron-window-state covers these.
- Separate file: Creates two persistence locations. Single SQLite database is simpler.

## R-004: Auto-Update Strategy

**Decision**: Use electron-updater with GitHub Releases as the update source. Support stable and beta channels. Updates download in background, install on next restart.

**Rationale**: electron-updater is the de facto standard for Electron auto-updates. GitHub Releases provides free, reliable hosting with semantic versioning support.

**Alternatives considered**:
- Custom update server: More control over rollout but requires infrastructure. GitHub Releases is sufficient for initial launch.
- Squirrel.Windows / Squirrel.Mac: Lower-level, platform-specific. electron-updater abstracts both.

## R-005: Logging Strategy

**Decision**: Use electron-log for file-based logging with rotation. Logs written to `app.getPath('logs')`. Rotation at 10MB, keep 5 files.

**Rationale**: electron-log integrates with Electron's process model (separate transports for main/renderer). File rotation prevents unbounded disk usage. The logs directory is standard across platforms.

**Alternatives considered**:
- winston: More configurable but not Electron-aware. Requires manual setup for multi-process logging.
- pino: Fast but optimized for Node.js servers, not desktop apps. Lacks built-in file rotation.

## R-006: Custom Title Bar for Frameless Window

**Decision**: Implement a React component (`TitleBar.tsx`) in the renderer with CSS `-webkit-app-region: drag` on the bar and `no-drag` on interactive elements. On macOS, use `titleBarStyle: 'hiddenInset'` to get native traffic lights with custom content. On Windows/Linux, use `frame: false` with custom minimize/maximize/close buttons.

**Rationale**: Platform-native feel (F7-03) requires different approaches per OS. macOS users expect native window controls in the top-left. Windows/Linux users expect custom controls in the top-right.

**Alternatives considered**:
- Same frameless approach on all platforms: Breaks macOS conventions. Users expect native traffic light buttons.
- Native title bar everywhere: Cannot customize the title bar content (tabs, search, etc.) which later features require.
