# Research: App Core (F001)

**Feature Branch**: `001-app-core`
**Date**: 2026-03-02
**Spec**: [spec.md](./spec.md)

---

## Decision 1: Electron IPC Type Safety

**Problem**: The application needs ~90 IPC channels between main and renderer processes. Channel names as string literals are error-prone and untyped, violating Constitution Principle II (Centralized IPC Channel Registry).

**Decision**: Use a typed-ipc pattern with a shared channel enum and TypeScript generics for request/response types.

**Implementation approach**:

1. Define all channel names in a single `IpcChannel` enum in `packages/shared/IpcChannel.ts`:
   ```typescript
   export enum IpcChannel {
     AppInfo = 'app:info',
     AppSelect = 'app:select',
     AppSetLanguage = 'app:set-language',
     FileSelect = 'file:select',
     FileUpload = 'file:upload',
     // ... all channels
   }
   ```

2. Define a type mapping interface that maps each channel to its request and response types:
   ```typescript
   export interface IpcChannelMap {
     [IpcChannel.AppInfo]: { request: void; response: AppInfo }
     [IpcChannel.FileUpload]: { request: FileMetadata; response: void }
     // ... all channel type mappings
   }
   ```

3. Create typed invoke/handle wrappers that enforce compile-time correctness:
   - Preload: `typedInvoke<C extends IpcChannel>(channel: C, ...args): Promise<IpcChannelMap[C]['response']>`
   - Main: `typedHandle<C extends IpcChannel>(channel: C, handler: (event, args: IpcChannelMap[C]['request']) => IpcChannelMap[C]['response'])`

**Alternatives considered**:
- **tRPC-style approach**: Too heavyweight for IPC; designed for HTTP, not Electron IPC. Would add unnecessary abstraction.
- **Plain string channels with manual typing**: Violates Constitution Principle II. No compile-time safety. Rejected.
- **Code generation from schema**: Over-engineering for ~90 channels. The enum + type map pattern provides sufficient safety with less complexity.

**Rationale**: The shared enum + type map is the standard pattern for typed Electron IPC. It provides compile-time channel name validation, request/response type checking, and satisfies the centralized registry requirement with zero runtime overhead.

---

## Decision 2: File Storage Architecture

**Problem**: Files need unique identifiers, managed storage, metadata tracking, reference counting, and support for multiple upload methods (picker, drag-drop, paste, URL download).

**Decision**: UUID v4 for file IDs, store physical files in app data `files/` directory, metadata in Dexie (renderer-side IndexedDB).

**Implementation approach**:

1. **File ID generation**: Use `crypto.randomUUID()` (available in Node.js and browser) to generate UUID v4 identifiers. File is stored as `{uuid}{ext}` in the files directory.

2. **Storage location**: `{appDataPath}/files/` directory. In portable mode, `{executableDir}/data/files/`.

3. **Upload flow** (main process `FileStorageService`):
   - Receive file path or buffer from IPC
   - Generate UUID, determine extension and MIME type
   - Copy/write file to `files/{uuid}{ext}`
   - Return `FileMetadata` object to renderer
   - Renderer stores metadata in Dexie

4. **Reference counting**: The `count` field on `FileMetadata` in Dexie tracks how many entities reference the file. Incrementing/decrementing is managed by consuming features (F004, F006) via Dexie operations in the renderer. Cleanup of files with `count === 0` can be triggered by a periodic sweep.

5. **Upload methods**:
   - **File picker**: `file:select` IPC channel opens `dialog.showOpenDialog()`, returns selected file paths, then `file:upload` copies each file
   - **Drag-and-drop**: Renderer extracts file paths from drop event, sends via `file:upload`
   - **Clipboard paste**: Renderer reads clipboard image data, sends buffer via `file:upload` with generated name
   - **URL download**: `file:download` IPC channel fetches URL content in main process, saves to files directory

**Alternatives considered**:
- **SQLite BLOB storage**: Storing file content in SQLite adds complexity and hurts performance for large files. File system storage with metadata index is simpler and faster. Rejected.
- **Main-process metadata storage**: Storing metadata in SQLite on the main side would require IPC for every metadata query. Dexie in the renderer provides instant access for UI rendering. Rejected.

**Rationale**: UUID guarantees uniqueness without coordination. Dexie provides instant metadata access in the renderer without IPC overhead. Physical files on disk are easy to manage, backup, and debug.

---

## Decision 3: Configuration Persistence

**Problem**: User preferences and configuration values must persist across restarts, support typed access with defaults, and handle corruption gracefully (FR-009, FR-010).

**Decision**: Use `electron-store` with a typed wrapper class in the main process.

**Implementation approach**:

1. **`ConfigService`** wraps `electron-store` with TypeScript generics:
   ```typescript
   class ConfigService {
     private store: ElectronStore<ConfigSchema>
     get<K extends keyof ConfigSchema>(key: K): ConfigSchema[K]
     set<K extends keyof ConfigSchema>(key: K, value: ConfigSchema[K]): void
   }
   ```

2. **Typed keys**: Define a `ConfigSchema` interface in `packages/shared/types/config.ts` with all known config keys and their types. Default values are provided in the schema definition.

3. **Corruption fallback**: `electron-store` supports `clearInvalidConfig` option. If the JSON file is corrupted on load, it resets to defaults and logs a warning. Additionally, wrap store initialization in a try-catch to handle edge cases.

4. **IPC exposure**: Two channels (`config:get`, `config:set`) provide renderer access to the config store. The wrapper ensures type safety on both sides.

**Alternatives considered**:
- **Custom JSON file management**: Reinventing what electron-store already does well. No advantage over the maintained library. Rejected.
- **SQLite for config**: Over-engineering for a key-value config store. SQLite is reserved for structured relational data in later features. Rejected.
- **Zustand persist for config**: Config values need to be accessible from the main process (for window state, logging, etc.). Zustand only runs in the renderer. Rejected.

**Rationale**: `electron-store` is the de facto standard for Electron config persistence. It handles atomic writes, JSON schema validation, corruption recovery, and works in both packaged and development modes.

---

## Decision 4: Internationalization (i18n)

**Problem**: Support 14+ languages with instant switching (no restart), lazy-loaded locale files, and system locale detection (FR-011, FR-012).

**Decision**: Use `i18next` with `react-i18next` for the renderer, with lazy-loaded locale JSON files.

**Implementation approach**:

1. **i18next configuration**: Initialize with `react-i18next` in `src/renderer/src/i18n/index.ts`. Use `i18next-http-backend` or direct JSON imports for locale loading.

2. **Locale files**: One JSON file per language in `src/renderer/src/i18n/locales/`. Primary languages (en-us, zh-cn) are bundled. Additional languages are lazy-loaded on demand.

3. **Language switching**: Call `i18n.changeLanguage(lng)` which triggers React re-render via `react-i18next` context. Also persist the language choice via `config:set` and notify the main process via `app:set-language` for tray menu and native dialog localization.

4. **System locale detection**: On first launch, use `app.getLocale()` in the main process to detect the system language. Map to the closest supported locale. Store as config value.

5. **Fallback chain**: `i18next` fallback configured as `lng → en-us` so missing keys in any language fall back to English.

**Alternatives considered**:
- **Custom i18n solution**: No justification to build from scratch when i18next is battle-tested and already used in the original project. Rejected.
- **Compile-time i18n (typesafe-i18n)**: Adds build complexity. i18next with TypeScript namespace typing provides sufficient safety. Rejected.

**Rationale**: i18next is already proven in the original Cherry Studio codebase, supports all required features (lazy loading, instant switching, fallback chains, interpolation), and has excellent React integration via react-i18next.

---

## Decision 5: Logging

**Problem**: Centralized logging with configurable levels, daily rotation, source module labels, and console routing (FR-013).

**Decision**: Use `electron-log` for the main process logging solution with daily file rotation.

**Implementation approach**:

1. **`LoggerService`**: A singleton service in the main process that wraps `electron-log`. Provides `silly`, `debug`, `info`, `warn`, `error` level methods.

2. **Source modules**: Each logger instance is created with a module name prefix: `LoggerService.create('FileStorage')` produces entries like `[2026-03-02 10:30:00] [info] [FileStorage] File uploaded: abc123`.

3. **Log rotation**: `electron-log` supports daily rotation out of the box via its file transport. Log files are stored in `{appDataPath}/logs/`.

4. **Level configuration**: Log level is configurable via environment variables (`CSLOGGER_MAIN_LEVEL`, `CSLOGGER_RENDERER_LEVEL`) and config store.

5. **Console routing**: In production, `console.log` calls are intercepted and routed through the centralized logger to ensure all output is captured in log files.

**Alternatives considered**:
- **Winston with winston-daily-rotate-file**: Winston is more configurable but adds unnecessary complexity for an Electron desktop app. electron-log is specifically designed for Electron and handles main/renderer logging out of the box. Rejected.
- **pino**: Primarily designed for server-side Node.js. Does not integrate natively with Electron's multi-process model. Rejected.

**Rationale**: `electron-log` is purpose-built for Electron applications, handles both main and renderer process logging, supports file rotation, and requires minimal configuration. The original project used Winston, but electron-log provides equivalent functionality with less boilerplate for the Electron context.

---

## Decision 6: Renderer State Management

**Problem**: The renderer needs persistent state for app-level concerns (theme, language, window state) and feature-scoped state (shortcuts). Must support persist middleware and follow Constitution Principle IV (Feature-Scoped Zustand Stores).

**Decision**: Zustand with `persist` middleware for renderer state, one store per feature domain.

**Implementation approach**:

1. **Store structure**: Feature-scoped stores following Zustand conventions:
   - `app.store.ts`: App info (version, paths, arch), current theme, current language
   - `shortcuts.store.ts`: Keyboard shortcut bindings and their enabled/editable state

2. **Persistence**: Use Zustand's `persist` middleware with `localStorage` as the default storage backend. Each store has its own persist key to avoid conflicts.

3. **IPC sync**: Stores that need to reflect main-process state (app info, config values) populate on app launch via IPC calls and subscribe to main-process events for updates.

4. **Store isolation**: No cross-store direct mutations. Cross-feature communication happens via subscriptions or explicit actions as per constitution.

**Alternatives considered**:
- **Redux Toolkit**: The original stack. Zustand is the mandated replacement per stack migration plan. Rejected.
- **Jotai/Recoil**: Atom-based state management adds complexity for this use case. Zustand's simplicity is preferred per constitution. Rejected.
- **React Context**: Does not provide persistence middleware, devtools, or subscriptions. Insufficient for the requirements. Rejected.

**Rationale**: Zustand is the mandated state management solution per the stack migration plan. Its `persist` middleware, composable middleware pattern, and minimal API make it ideal for feature-scoped stores.

---

## Decision 7: Database Layer

**Problem**: F001 needs to establish the database infrastructure for both main process (better-sqlite3 via Drizzle ORM) and renderer process (Dexie/IndexedDB). F001 owns `FileMetadata` in Dexie but has no SQLite tables of its own.

**Decision**: Initialize better-sqlite3 + Drizzle ORM in main process (tables added by later features). Define Dexie schema with FileMetadata table in renderer.

**Implementation approach**:

1. **Main process (better-sqlite3 + Drizzle)**:
   - Initialize `better-sqlite3` Database instance in main process startup
   - Configure Drizzle ORM with the `better-sqlite3` driver
   - Run migrations on app startup
   - F001 sets up the infrastructure; F012 (api-server-agents) defines the first Drizzle tables (Agent, Session, SessionMessage)
   - Database file stored at `{appDataPath}/cherry-studio.db`

2. **Renderer process (Dexie/IndexedDB)**:
   - Define Dexie database in `src/renderer/src/databases/index.ts`
   - Version 1 schema includes `files` table with indexes on `id`, `name`, `type`, `created_at`
   - Dexie handles schema versioning and upgrade migrations automatically

3. **Schema definition** (Dexie):
   ```typescript
   db.version(1).stores({
     files: 'id, name, type, created_at'
   })
   ```

**Alternatives considered**:
- **LibSQL**: Original driver. Migrating to better-sqlite3 per stack migration plan. LibSQL's network abstraction is unnecessary for a local desktop app. Rejected.
- **SQLite for FileMetadata**: Would require IPC for every metadata query from the renderer. Dexie provides direct browser-side access. Rejected.
- **lokijs/RxDB**: Over-engineering. Dexie is the established solution in the original project and handles IndexedDB well. Rejected.

**Rationale**: Dual-database architecture mirrors Electron's dual-process model. better-sqlite3 provides synchronous, fast SQLite access for the main process. Dexie provides instant IndexedDB access for the renderer. This separation avoids IPC overhead for frequently-accessed UI data while keeping structured relational data in SQLite for main-process services.
