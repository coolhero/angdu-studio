# Tasks: App Core (F001)

**Feature Branch**: `001-app-core`
**Date**: 2026-03-02
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Data Model**: [data-model.md](./data-model.md)

---

## Phase 1: Project Setup & Infrastructure

- [ ] T001 [P1] [US3] Create pnpm monorepo workspace configuration with `pnpm-workspace.yaml` defining `packages/*` and root `package.json` with workspace scripts (`dev`, `build`, `test`, `package`) at `pnpm-workspace.yaml` and `package.json`
- [ ] T002 [P1] [US3] Initialize root TypeScript configuration with path aliases for `@shared`, `@main`, `@renderer`, `@preload` at `tsconfig.json` and per-process configs at `src/main/tsconfig.json`, `src/preload/tsconfig.json`, `src/renderer/tsconfig.json`
- [ ] T003 [P1] [US3] Configure Electron-Vite build configuration with main, preload, and renderer entry points, Rolldown bundler, and path alias resolution at `electron.vite.config.ts`
- [ ] T004 [P1] [US3] Configure Electron Builder for cross-platform packaging (Windows NSIS, macOS DMG, Linux AppImage) with custom protocol `cherrystudio://` registration at `electron-builder.yml`
- [ ] T005 [P1] [US3] Install core dependencies: `electron`, `react@19`, `react-dom@19`, `zustand`, `i18next`, `react-i18next`, `electron-store`, `electron-log`, `better-sqlite3`, `drizzle-orm`, `dexie`, `tailwindcss`, `@radix-ui/*` (Shadcn/ui primitives) via `pnpm add` at root and relevant workspace packages
- [ ] T006 [P1] [US3] Install dev dependencies: `typescript@5.x`, `vitest`, `@playwright/test`, `electron-vite`, `@types/better-sqlite3`, `@types/react`, `@types/react-dom`, `eslint`, `prettier` via `pnpm add -D`
- [ ] T007 [P1] [US3] Configure TailwindCSS with Shadcn/ui theme tokens, dark mode class strategy, and content paths at `tailwind.config.ts` and base styles at `src/renderer/src/assets/styles/globals.css`
- [ ] T008 [P1] [US3] Configure Vitest for unit and integration tests with path aliases, jsdom environment for renderer tests, and coverage reporting at `vitest.config.ts`
- [ ] T009 [P1] [US3] Configure Playwright for E2E tests targeting the Electron app binary with test fixtures for app launch at `playwright.config.ts` and `tests/e2e/fixtures/electron.ts`

---

## Phase 2: Foundational — IPC Bridge (US3)

### Phase 2a: Shared Package & Channel Registry

- [ ] T010 [P1] [US3] Create shared package entry point exporting all shared types, constants, and the IPC channel enum at `packages/shared/index.ts`
- [ ] T011 [P1] [US3] Write unit tests for `IpcChannel` enum: verify all expected channel names exist, verify enum values match `prefix:action` format, verify no duplicate values at `tests/unit/shared/IpcChannel.test.ts`
- [ ] T012 [P1] [US3] Implement `IpcChannel` enum with all F001 channel names: `AppInfo`, `AppSelect`, `AppSetLanguage`, `AppSetTheme`, `AppCheckForUpdate`, `FileSelect`, `FileUpload`, `FileRead`, `FileWrite`, `FileDelete`, `FileDownload`, `ConfigGet`, `ConfigSet`, `WindowMinimize`, `WindowMaximize`, `WindowClose`, `WindowSetAlwaysOnTop`, `ShortcutsUpdate`, `ShortcutsGet`, `SystemGetDeviceType`, `ZipCompress`, `ZipDecompress` at `packages/shared/IpcChannel.ts`
- [ ] T013 [P1] [US3] Define `IpcChannelMap` interface mapping each `IpcChannel` to its `{ request, response }` type pair, importing types from `packages/shared/types/ipc.ts`. Include all request/response types from contracts (`AppInfo`, `OpenDialogOptions`, `FileMetadata`, `FileSelectOptions`, `FileUploadRequest`, `FileWriteRequest`, `ConfigSetRequest`, `DeviceInfo`, `ZipCompressRequest`, `ZipDecompressRequest`, `UpdateCheckResult`, `Shortcut`) at `packages/shared/types/ipc.ts`
- [ ] T014 [P1] [US3] Define shared type definitions: `FileMetadata` interface, `FileType` enum (`image`, `video`, `audio`, `text`, `document`, `other`), `Shortcut` interface (`key`, `shortcut`, `editable`, `enabled`) at `packages/shared/types/file.ts` and `packages/shared/types/shortcut.ts`
- [ ] T015 [P1] [US3] Define `ConfigSchema` interface with typed config keys and defaults: `language: string`, `theme: 'light' | 'dark' | 'system'`, `windowState.width: number`, `windowState.height: number`, `windowState.x: number`, `windowState.y: number`, `windowState.maximized: boolean` at `packages/shared/types/config.ts`
- [ ] T016 [P1] [US3] Define shared constants: `MIN_WINDOW_WIDTH = 1000`, `MIN_WINDOW_HEIGHT = 600`, `DEFAULT_LANGUAGE = 'en-us'`, `SUPPORTED_LANGUAGES` array of 14 locale codes, `DEFAULT_SHORTCUTS` array, `FILE_TYPE_MAP` extension-to-FileType mapping at `packages/shared/constants/index.ts`

### Phase 2b: Preload Bridge

- [ ] T017 [P1] [US3] Write unit tests for the preload bridge: verify `window.api.invoke` is exposed via `contextBridge`, verify it accepts only valid `IpcChannel` values, verify context isolation prevents direct Node.js access at `tests/unit/preload/preload.test.ts`
- [ ] T018 [P1] [US3] Implement preload script: expose typed `window.api.invoke<C extends IpcChannel>(channel: C, ...args)` and `window.api.on(channel, callback)` via `contextBridge.exposeInMainWorld`, importing `IpcChannel` from `@shared` at `src/preload/index.ts`

### Phase 2c: Main Process IPC Registration Hub

- [ ] T019 [P1] [US3] Write unit tests for IPC registration hub: verify all IPC handler modules are imported and registered, verify `typedHandle` enforces channel-type mapping at `tests/unit/main/ipc/index.test.ts`
- [ ] T020 [P1] [US3] Implement IPC registration hub that imports and calls all domain-specific IPC handler registration functions (`registerAppIpc`, `registerFileIpc`, `registerConfigIpc`, `registerWindowIpc`, `registerShortcutsIpc`, `registerSystemIpc`) at `src/main/ipc/index.ts`
- [ ] T021 [P1] [US3] Implement `typedHandle` utility function wrapping `ipcMain.handle` with compile-time type checking against `IpcChannelMap` at `src/main/ipc/typed-ipc.ts`

### Phase 2d: Renderer IPC Hook

- [ ] T022 [P1] [US3] Write unit tests for `useIpc` hook: verify it returns typed response for each channel, verify loading/error states, verify it calls `window.api.invoke` with correct channel and args at `tests/unit/renderer/hooks/useIpc.test.ts`
- [ ] T023 [P1] [US3] Implement `useIpc` React hook providing typed IPC invocation with loading and error states, wrapping `window.api.invoke` with `IpcChannelMap` generics at `src/renderer/src/hooks/useIpc.ts`

---

## Phase 3: App Launch & Window Management (US1)

### Phase 3a: Main Process Entry & Lifecycle

- [ ] T024 [P1] [US1] Write unit tests for `AppService`: verify portable mode detection via `PORTABLE_EXECUTABLE_DIR` env var, verify app data path resolution (standard vs. portable), verify custom protocol registration for `cherrystudio://` at `tests/unit/main/services/AppService.test.ts`
- [ ] T025 [P1] [US1] Implement `AppService` with portable mode detection, path resolution for `filesPath`, `configPath`, `logsPath`, `notesPath` (standard: `app.getPath('userData')`, portable: `{execDir}/data/`), and custom protocol registration at `src/main/services/AppService.ts`
- [ ] T026 [P1] [US1] Implement path utilities: `getAppDataPath()`, `getFilesPath()`, `getLogsPath()`, `getConfigPath()`, `isPortableMode()`, `setCustomDataDirectory(path)` with validation (exists, writable check via `fs.accessSync`), `validateDirectoryPath(path): boolean` at `src/main/utils/paths.ts`
- [ ] T026a [P1] [US1] Write unit tests for custom data directory: verify `setCustomDataDirectory` accepts valid writable path, verify it rejects non-existent path, verify it rejects read-only path, verify all `get*Path()` functions reflect the custom root after switching at `tests/unit/main/utils/paths.test.ts`
- [ ] T027 [P1] [US1] Implement platform utilities: `isMacOS()`, `isWindows()`, `isLinux()`, `isAppImage()` at `src/main/utils/platform.ts`

### Phase 3b: Window Service

- [ ] T028 [P1] [US1] Write unit tests for `WindowService`: verify window creation with min size 1000x600 (FR-002), verify window state persistence on close and restore on create (FR-003), verify tray icon creation with light/dark variants (FR-020), verify single-instance lock behavior (FR-019), verify macOS close-to-dock behavior at `tests/unit/main/services/WindowService.test.ts`
- [ ] T029 [P1] [US1] Implement `WindowService.createMainWindow()`: create `BrowserWindow` with `minWidth: 1000`, `minHeight: 600`, context isolation enabled, nodeIntegration disabled, preload script path, and restored window state from config at `src/main/services/WindowService.ts`
- [ ] T030 [P1] [US1] Implement `WindowService.persistWindowState()`: save window bounds (`x`, `y`, `width`, `height`) and `isMaximized` to config on window `resize`, `move`, and `close` events via `ConfigService` at `src/main/services/WindowService.ts`
- [ ] T031 [P1] [US1] Implement `WindowService.restoreWindowState()`: read saved bounds from config on window creation, apply saved position and size, maximize if previously maximized, fall back to centered 1080x720 default at `src/main/services/WindowService.ts`
- [ ] T032 [P1] [US1] Implement `WindowService.createTray()`: create system tray icon with light/dark variants based on `nativeTheme.shouldUseDarkColors`, set up context menu with Show/Quit items, handle tray click to toggle window visibility at `src/main/services/WindowService.ts`
- [ ] T033 [P1] [US1] Implement tray icon theme switching: listen to `nativeTheme.on('updated')` and swap tray icon between `tray_icon_light.png` and `tray_icon_dark.png` from `build/` directory at `src/main/services/WindowService.ts`

### Phase 3c: Main Entry Point

- [ ] T034 [P1] [US1] Write integration tests for app lifecycle: verify single-instance lock acquires on first launch and rejects second launch (FR-019), verify `app.whenReady()` creates main window, verify `window-all-closed` behavior per platform at `tests/integration/app-lifecycle.test.ts`
- [ ] T035 [P1] [US1] Implement main entry point: acquire single-instance lock (`app.requestSingleInstanceLock()`), register custom protocol `cherrystudio://`, call `app.whenReady()` then initialize services (`AppService`, `WindowService`, `ConfigService`, `LoggerService`), register all IPC handlers via `src/main/ipc/index.ts`, create main window, handle `second-instance` event to focus existing window, handle `window-all-closed` and `activate` events at `src/main/index.ts`

### Phase 3d: Window IPC Handlers

- [ ] T036 [P1] [US1] Write integration tests for window IPC channels: `window:minimize` minimizes window, `window:maximize` toggles maximized state and returns boolean, `window:close` closes window (macOS: hides), `window:set-always-on-top` toggles always-on-top at `tests/integration/ipc-window.test.ts`
- [ ] T037 [P1] [US1] Implement window IPC handlers: `window:minimize` calls `mainWindow.minimize()`, `window:maximize` toggles via `isMaximized()` check, `window:close` on macOS calls `mainWindow.hide()`, on Windows/Linux reads `ConfigService.get('minimizeToTray')` — if true calls `mainWindow.hide()` else calls `mainWindow.close()`, `window:set-always-on-top` calls `mainWindow.setAlwaysOnTop(flag)` at `src/main/ipc/window.ipc.ts`

### Phase 3e: App IPC Handlers

- [ ] T038 [P1] [US1] Write integration tests for app IPC channels: `app:info` returns complete `AppInfo` with all path fields, `app:select` opens dialog and returns paths or null, `app:set-theme` updates tray icon variant, `app:check-for-update` returns `UpdateCheckResult` at `tests/integration/ipc-app.test.ts`
- [ ] T039 [P1] [US1] Implement app IPC handlers: `app:info` returns `AppInfo` object populated from `AppService` paths and `app.getVersion()`, `app:select` wraps `dialog.showOpenDialog()`, `app:set-theme` calls `nativeTheme.themeSource = theme` and updates tray icon, `app:check-for-update` wraps `autoUpdater.checkForUpdates()` at `src/main/ipc/app.ipc.ts`

### Phase 3f: Renderer Shell

- [ ] T040 [P1] [US1] Write unit tests for `app.store.ts`: verify initial state has empty `appInfo`, verify `setAppInfo` action populates all fields, verify `setTheme` and `setLanguage` actions update state at `tests/unit/renderer/stores/app.store.test.ts`
- [ ] T041 [P1] [US1] Implement `app.store.ts` Zustand store with `persist` middleware: state fields for `appInfo: AppInfo`, `theme: string`, `language: string`; actions `setAppInfo`, `setTheme`, `setLanguage`; persist key `'app-store'` at `src/renderer/src/stores/app.store.ts`
- [ ] T042 [P1] [US1] Implement renderer entry point `main.tsx`: render `<App />` wrapped in `<React.StrictMode>`, initialize i18n, fetch `app:info` on mount and populate `app.store` at `src/renderer/src/main.tsx`
- [ ] T043 [P1] [US1] Implement root `App.tsx` component: set up React Router (if needed), apply theme class to root element, render main layout shell with custom title bar controls (minimize, maximize, close) wired to window IPC channels at `src/renderer/src/App.tsx`

### Phase 3g: E2E Tests for Window Management

- [ ] T044 [P1] [US1] Write E2E tests for app launch: verify main window appears within 3 seconds (SC-001), verify window title, verify window dimensions are at least 1000x600 at `tests/e2e/app-launch.test.ts`
- [ ] T045 [P1] [US1] Write E2E tests for window management: verify minimize/maximize/restore cycle, verify window state persistence across restart (SC-005), verify minimum size enforcement, verify tray icon visibility at `tests/e2e/window-management.test.ts`

---

## Phase 4: File Storage & Management (US2)

### Phase 4a: File Storage Service

- [ ] T046 [P1] [US2] Write unit tests for `FileStorageService`: verify file copy to managed directory with UUID-based name, verify `FileMetadata` generation with correct `id`, `name`, `origin_name`, `path`, `size`, `ext`, `type`, `created_at`, `count=0`, verify file type detection from extension mapping (`FILE_TYPE_MAP`), verify file read returns content as string/base64, verify file delete removes physical file, verify file download from URL at `tests/unit/main/services/FileStorageService.test.ts`
- [ ] T047 [P1] [US2] Implement `FileStorageService.upload(filePath, originName?)`: generate UUID via `crypto.randomUUID()`, determine extension and `FileType` from `FILE_TYPE_MAP`, copy file to `{filesPath}/{uuid}{ext}`, return `FileMetadata` object at `src/main/services/FileStorageService.ts`
- [ ] T048 [P1] [US2] Implement `FileStorageService.select(options)`: open `dialog.showOpenDialog()` with provided options, for each selected file call `upload()`, return array of `FileMetadata` or `null` if cancelled at `src/main/services/FileStorageService.ts`
- [ ] T049 [P1] [US2] Implement `FileStorageService.read(fileId, detectEncoding?)`: resolve file path from `{filesPath}/{fileId}*` glob, read content as UTF-8 string (text) or base64 (binary), optionally auto-detect encoding at `src/main/services/FileStorageService.ts`
- [ ] T050 [P1] [US2] Implement `FileStorageService.write(fileName, content, encoding?)`: generate UUID, write content to `{filesPath}/{uuid}{ext}` with specified encoding (`utf-8` or `base64`), return `FileMetadata` at `src/main/services/FileStorageService.ts`
- [ ] T051 [P1] [US2] Implement `FileStorageService.delete(fileId)`: resolve file path, delete physical file via `fs.unlink`, handle file-not-found idempotently (no error) at `src/main/services/FileStorageService.ts`
- [ ] T052 [P1] [US2] Implement `FileStorageService.download(url, isUseContentType?)`: fetch URL via `net.fetch` or `https`, determine filename from Content-Disposition header or URL path, save to `{filesPath}/{uuid}{ext}`, return `FileMetadata` at `src/main/services/FileStorageService.ts`

### Phase 4b: File IPC Handlers

- [ ] T053 [P1] [US2] Write integration tests for file IPC channels: `file:select` returns `FileMetadata[]` or `null`, `file:upload` copies file and returns metadata, `file:read` returns file content, `file:write` creates file from content, `file:delete` removes file, `file:download` fetches URL and returns metadata (SC-002: upload completes within 2s for 50MB) at `tests/integration/ipc-file.test.ts`
- [ ] T054 [P1] [US2] Implement file IPC handlers: wire `file:select`, `file:upload`, `file:read`, `file:write`, `file:delete`, `file:download` channels to corresponding `FileStorageService` methods using `typedHandle` at `src/main/ipc/file.ipc.ts`

### Phase 4c: Dexie Database & Renderer File Store

- [ ] T055 [P1] [US2] Write unit tests for Dexie database: verify `CherryStudioDB` schema has `files` table, verify CRUD operations on `FileMetadata` records, verify indexes on `id`, `name`, `type`, `created_at`, verify reference count increment/decrement at `tests/unit/renderer/databases/index.test.ts`
- [ ] T056 [P1] [US2] Implement Dexie database definition: `CherryStudioDB` class extending `Dexie` with `files: Table<FileMetadata, string>`, version 1 schema `'id, name, type, created_at'` at `src/renderer/src/databases/index.ts`

### Phase 4d: Renderer File Upload Handlers (Drag-Drop & Paste)

- [ ] T057a [P1] [US2] Write unit tests for renderer file upload handlers: verify drag-and-drop handler extracts files from `DragEvent.dataTransfer`, verify clipboard paste handler extracts image from `ClipboardEvent`, verify both call `file:upload` IPC channel, verify invalid drops (no files) are ignored at `tests/unit/renderer/hooks/useFileUpload.test.ts`
- [ ] T057b [P1] [US2] Implement `useFileUpload` hook: handle `onDrop` events by extracting `DataTransfer.files`, handle `onPaste` events by extracting image blobs from `ClipboardEvent.clipboardData`, convert to file paths via temp storage, call `file:upload` IPC for each file, return `FileMetadata[]` at `src/renderer/src/hooks/useFileUpload.ts`

### Phase 4e: Reference Counting Utilities

- [ ] T057c [P1] [US2] Write unit tests for file reference counting: verify `incrementRef(fileId)` increases count by 1, verify `decrementRef(fileId)` decreases count by 1, verify count reaching 0 marks file as eligible for cleanup, verify cleanup removes file from disk via `file:delete` IPC at `tests/unit/renderer/databases/fileRefCount.test.ts`
- [ ] T057d [P1] [US2] Implement file reference counting utilities: `incrementRef(fileId)` updates Dexie `count` field +1, `decrementRef(fileId)` updates count -1 and triggers cleanup when count reaches 0, `cleanupOrphanedFiles()` finds all files with count=0 and deletes via `file:delete` IPC at `src/renderer/src/databases/fileRefCount.ts`

### Phase 4f: Large File & Edge Case Tests

- [ ] T057e [P1] [US2] Write integration tests for large file handling: verify files >100MB upload without crashing or exhausting memory, verify upload progress does not block the renderer process, verify appropriate error for files exceeding disk space at `tests/integration/file-large-upload.test.ts`

### Phase 4g: E2E Tests for File Operations

- [ ] T057f [P1] [US2] Write E2E tests for file operations: upload a file via `file:select`, verify metadata returned, read file back via `file:read` and verify content matches, delete file via `file:delete` and verify removal, test drag-and-drop upload, test clipboard paste upload at `tests/e2e/file-operations.test.ts`

---

## Phase 5: Configuration Persistence (US4)

### Phase 5a: Config Service

- [ ] T058 [P2] [US4] Write unit tests for `ConfigService`: verify `get(key)` returns stored value, verify `get(key)` returns default when key not set, verify `set(key, value)` persists immediately, verify config file corruption resets to defaults (FR-010), verify dot-notation key access for nested values, verify config survives simulated restart (SC-006) at `tests/unit/main/services/ConfigService.test.ts`
- [ ] T059 [P2] [US4] Implement `ConfigService`: wrap `electron-store` with `ConfigSchema` generic, constructor accepts defaults from `packages/shared/constants`, enable `clearInvalidConfig: true` for corruption recovery, implement `get<K>(key: K): ConfigSchema[K]` and `set<K>(key: K, value: ConfigSchema[K]): void`, store file at `{configPath}/config.json` at `src/main/services/ConfigService.ts`

### Phase 5b: Config IPC Handlers

- [ ] T060 [P2] [US4] Write integration tests for config IPC channels: `config:get` returns stored value or default, `config:set` persists value retrievable by `config:get`, verify round-trip persistence across simulated restart (SC-003: IPC responds within 100ms) at `tests/integration/ipc-config.test.ts`
- [ ] T061 [P2] [US4] Implement config IPC handlers: `config:get` calls `ConfigService.get(key)` and returns value, `config:set` calls `ConfigService.set(key, value)` using `typedHandle` at `src/main/ipc/config.ipc.ts`

---

## Phase 6: Internationalization (US5)

### Phase 6a: Locale Files

- [ ] T062 [P2] [US5] Create English (primary) locale JSON file with all F001 UI strings: window title, tray menu items (Show, Quit), common labels, settings labels at `src/renderer/src/i18n/locales/en-us.json`
- [ ] T063 [P2] [US5] Create Chinese Simplified locale JSON file with translations matching all keys from `en-us.json` at `src/renderer/src/i18n/locales/zh-cn.json`
- [ ] T064 [P2] [US5] Create stub locale files for remaining 12 languages (`zh-tw`, `ja-jp`, `ko-kr`, `ru-ru`, `de-de`, `fr-fr`, `es-es`, `pt-br`, `ar-sa`, `vi-vn`, `th-th`, `hi-in`) with at minimum all keys present (values can initially duplicate English) at `src/renderer/src/i18n/locales/`

### Phase 6b: i18n Initialization

- [ ] T065 [P2] [US5] Write unit tests for i18n initialization: verify i18next initializes with `en-us` as default and fallback language, verify `changeLanguage('zh-cn')` loads Chinese translations, verify missing key falls back to English, verify language switch completes within 500ms (SC-004) at `tests/unit/renderer/i18n/i18n.test.ts`
- [ ] T066 [P2] [US5] Implement i18next initialization: configure with `react-i18next`, set fallback language `en-us`, register all locale resources, detect system locale via `navigator.language` on first launch, export configured `i18n` instance at `src/renderer/src/i18n/index.ts`

### Phase 6c: Language Switch IPC

- [ ] T067 [P2] [US5] Write integration tests for `app:set-language` IPC: verify main process receives language code, verify tray menu labels update to target language, verify invalid language code falls back to `en-us` at `tests/integration/ipc-app-language.test.ts`
- [ ] T068 [P2] [US5] Implement `app:set-language` handler in `app.ipc.ts`: update tray menu labels using locale-specific strings, persist language to config via `ConfigService.set('language', code)`, validate language code against `SUPPORTED_LANGUAGES` at `src/main/ipc/app.ipc.ts`

### Phase 6d: E2E Tests for i18n

- [ ] T069 [P2] [US5] Write E2E tests for language switching: switch language from English to Chinese via `app:set-language`, verify all visible UI text updates to Chinese without restart, switch back and verify revert (SC-004: within 500ms) at `tests/e2e/i18n-switch.test.ts`

---

## Phase 7: Logging & Diagnostics (US6)

- [ ] T070 [P3] [US6] Write unit tests for `LoggerService`: verify log entry format includes timestamp, level, source module, and message, verify log level filtering (e.g., `warn` level suppresses `debug` messages), verify daily log file rotation creates new file, verify log file path is `{logsPath}/main-{date}.log`, verify `create(module)` returns module-scoped logger at `tests/unit/main/services/LoggerService.test.ts`
- [ ] T071 [P3] [US6] Implement `LoggerService`: singleton wrapping `electron-log`, configure file transport to write to `{logsPath}/`, configure daily rotation via `electron-log` archiving, implement `create(moduleName: string)` returning a logger that prefixes entries with `[moduleName]`, support levels: `silly`, `debug`, `info`, `warn`, `error`, read initial level from env `CSLOGGER_MAIN_LEVEL` or config at `src/main/services/LoggerService.ts`
- [ ] T072 [P3] [US6] Wire `LoggerService` into main entry point: initialize before other services, create module-scoped loggers for `WindowService`, `FileStorageService`, `ConfigService`, `ShortcutService`, route `console.log` through logger in production at `src/main/index.ts`

---

## Phase 8: Keyboard Shortcuts (US7)

### Phase 8a: Shortcut Service (Main Process)

- [ ] T073 [P3] [US7] Write unit tests for `ShortcutService`: verify `registerAll(shortcuts)` calls `globalShortcut.register` for each enabled shortcut, verify disabled shortcuts are skipped, verify `unregisterAll()` is called before re-registering, verify invalid accelerator is logged as warning but does not block other registrations, verify `showApp` shortcut brings window to foreground at `tests/unit/main/services/ShortcutService.test.ts`
- [ ] T074 [P3] [US7] Implement `ShortcutService`: `registerAll(shortcuts: Shortcut[])` calls `globalShortcut.unregisterAll()` then iterates and registers each enabled shortcut with its action handler, `unregisterAll()` calls `globalShortcut.unregisterAll()`, implement action handlers for known keys (`showApp` -> focus window, `quickSearch` -> emit event, `captureScreen` -> emit event) at `src/main/services/ShortcutService.ts`

### Phase 8b: Shortcuts IPC Handlers

- [ ] T075 [P3] [US7] Write integration tests for shortcuts IPC channels: `shortcuts:update` registers provided shortcuts, `shortcuts:get` returns currently registered shortcuts, verify shortcut modification takes effect immediately (SC-010) at `tests/integration/ipc-shortcuts.test.ts`
- [ ] T076 [P3] [US7] Implement shortcuts IPC handlers: `shortcuts:update` calls `ShortcutService.registerAll(shortcuts)`, `shortcuts:get` returns current shortcut list from `ShortcutService` using `typedHandle` at `src/main/ipc/shortcuts.ipc.ts`

### Phase 8c: Shortcuts Zustand Store (Renderer)

- [ ] T077 [P3] [US7] Write unit tests for `shortcuts.store.ts`: verify initial state contains `DEFAULT_SHORTCUTS` from constants, verify `updateShortcut(key, partial)` merges partial update into matching shortcut, verify `getShortcut(key)` returns correct shortcut, verify persist middleware saves to localStorage at `tests/unit/renderer/stores/shortcuts.store.test.ts`
- [ ] T078 [P3] [US7] Implement `shortcuts.store.ts` Zustand store with `persist` middleware: state field `shortcuts: Shortcut[]` initialized from `DEFAULT_SHORTCUTS`, actions `updateShortcut(key, partial)`, `getShortcut(key)`, subscribe to changes and send `shortcuts:update` IPC on every mutation, persist key `'shortcuts-store'` at `src/renderer/src/stores/shortcuts.store.ts`

---

## Phase 9: System IPC & Utilities (US3)

- [ ] T079 [P1] [US3] Write integration tests for system IPC channels: `system:getDeviceType` returns valid `DeviceInfo` with `platform`, `arch`, `osVersion`, `hostname`, `isAppImage`, `zip:compress` returns base64 compressed data, `zip:decompress` restores original data at `tests/integration/ipc-system.test.ts`
- [ ] T080 [P1] [US3] Implement system IPC handlers: `system:getDeviceType` returns `DeviceInfo` from `os` module and `process.env.APPIMAGE`, `zip:compress` uses `zlib.gzipSync` or `archiver` to compress data, `zip:decompress` uses `zlib.gunzipSync` to decompress, support `outputPath`/`inputPath` for file-based operations at `src/main/ipc/system.ipc.ts`

---

## Phase 10: Database Infrastructure (US3)

- [ ] T081 [P1] [US3] Write unit tests for better-sqlite3 + Drizzle initialization: verify database file created at `{appDataPath}/cherry-studio.db`, verify Drizzle ORM connects successfully, verify migrations run on startup at `tests/unit/main/services/DatabaseService.test.ts`
- [ ] T082 [P1] [US3] Implement better-sqlite3 + Drizzle ORM initialization in main process: create database file, configure Drizzle with `better-sqlite3` driver, run pending migrations on app startup, export `db` instance for use by later features (F012) at `src/main/services/DatabaseService.ts`

---

## Phase 11: Polish, Integration & Demo Readiness

### Phase 11a: Cross-Cutting Integration Tests

- [ ] T083 [P1] Full IPC round-trip integration test: for every registered channel, send a request from a simulated renderer context and verify the response type matches `IpcChannelMap` (SC-003: all channels respond within 100ms) at `tests/integration/ipc-roundtrip.test.ts`
- [ ] T084 [P2] Configuration corruption recovery test: corrupt the config JSON file on disk, launch the app, verify it starts with default values and does not crash (FR-010, SC-009) at `tests/integration/config-corruption.test.ts`
- [ ] T085 [P2] Missing locale file recovery test: remove a locale JSON file, launch the app, switch to that language, verify English fallback is used without crash (SC-009) at `tests/integration/i18n-fallback.test.ts`

### Phase 11b: E2E Smoke Tests

- [ ] T086 [P1] Write E2E smoke test combining all demo scenarios from `quickstart.md`: launch app, exercise window controls, upload and read a file, set and get config value, switch language, register shortcut at `tests/e2e/smoke.test.ts`

### Phase 11c: Build Verification

- [ ] T087 [P1] Verify `pnpm build` completes without errors for all three entry points (main, preload, renderer) and produces valid output in `dist/`
- [ ] T088 [P1] Verify `pnpm package` produces installable binaries for the current platform via Electron Builder
- [ ] T089 [P1] Verify all unit tests pass: `pnpm test:unit` exits with code 0
- [ ] T090 [P1] Verify all integration tests pass: `pnpm test:integration` exits with code 0
- [ ] T091 [P1] Verify all E2E tests pass: `pnpm test:e2e` exits with code 0

### Phase 11d: Demo Assets

- [ ] T092 [P1] Add placeholder tray icon files: `build/tray_icon.png`, `build/tray_icon_dark.png`, `build/tray_icon_light.png` (16x16 or 22x22 PNG icons for system tray)
- [ ] T093 [P1] Add placeholder app icon files: `build/icon.png` (512x512), `build/icon.ico` (Windows), `build/icons/` directory with multiple sizes (16, 32, 64, 128, 256, 512)

---

## Summary

| Phase | Tasks | Priority | User Story |
|-------|-------|----------|------------|
| 1. Setup | T001-T009 | P1 | US3 |
| 2. IPC Bridge | T010-T023 | P1 | US3 |
| 3. App Launch & Window | T024-T045 | P1 | US1 |
| 4. File Storage | T046-T057 | P1 | US2 |
| 5. Config Persistence | T058-T061 | P2 | US4 |
| 6. Internationalization | T062-T069 | P2 | US5 |
| 7. Logging | T070-T072 | P3 | US6 |
| 8. Shortcuts | T073-T078 | P3 | US7 |
| 9. System IPC | T079-T080 | P1 | US3 |
| 10. Database Infra | T081-T082 | P1 | US3 |
| 11. Polish & Demo | T083-T093 | P1-P2 | -- |
| **Total** | **93 tasks** | | |

### Dependency Chain

```
Phase 1 (Setup)
  └─> Phase 2 (IPC Bridge - US3)
        ├─> Phase 3 (Window - US1)
        ├─> Phase 4 (File Storage - US2)
        ├─> Phase 5 (Config - US4, needed by Phase 3 for window state)
        ├─> Phase 6 (i18n - US5)
        ├─> Phase 7 (Logging - US6)
        ├─> Phase 8 (Shortcuts - US7)
        ├─> Phase 9 (System IPC - US3)
        └─> Phase 10 (Database Infra - US3)
              └─> Phase 11 (Polish & Demo)
```

Note: Phase 5 (Config) is a soft dependency of Phase 3 (Window) since `WindowService` uses `ConfigService` for state persistence. Tasks T029-T031 depend on T059 being complete.
