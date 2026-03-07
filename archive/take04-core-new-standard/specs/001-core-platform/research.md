# Research: Core Platform

**Feature**: F001-core-platform
**Date**: 2026-03-04

---

## R1: Electron Bootstrap Initialization Order

**Decision**: Keep side-effect-ordered imports for guaranteed init sequencing, followed by `app.whenReady()` async block.

**Rationale**: Side-effect import ordering (`bootstrap` → `config` → rest) uses ES module evaluation semantics to guarantee critical path initialization (data directory, userData path) before any other module loads. This is a proven Electron pattern.

**Sequence for new stack**:
1. Side-effect imports: bootstrap (data dir) → config (paths, env)
2. Pre-ready synchronous: crash reporter, hardware acceleration, platform switches, single-instance lock
3. `app.whenReady()`: window creation → tray → menu → IPC registration → shortcuts → protocol handler
4. Lifecycle hooks: `activate`, `open-url`, `second-instance`, `before-quit`, `will-quit`

**Alternatives**: Explicit `async init()` chain — rejected because it requires manual ordering that's harder to enforce than import ordering.

---

## R2: IPC Channel Enum Design

**Decision**: Single flat `enum IpcChannel` in a shared package (`packages/shared`), with `Domain_Action = 'domain:action'` naming.

**Rationale**: Single enum prevents string literal typos across the IPC boundary. Shared package ensures the same constant is used in preload (`ipcRenderer.invoke`) and main (`ipcMain.handle`).

**Naming convention**: `PascalDomain_PascalAction = 'kebab-domain:camelAction'`
- Example: `App_SetLanguage = 'app:setLanguage'`
- Fix: Use consistent casing (original had `SCREAMING_SNAKE_CASE` for TRACE domain — avoid this)

**Alternatives**: Per-domain enums (more tree-shakeable but harder to enforce), `const` objects with `as const` (no runtime enum overhead but less IDE support).

---

## R3: Config Manager Pattern

**Decision**: Adapt `electron-store` + typed enum keys + manual pub/sub into a cleaner pattern.

**Rationale**: The original `ConfigManager` has excessive getter/setter boilerplate (every key gets a hand-coded getter and setter). The observer pattern (`subscribe/unsubscribe`) is sound but the Map-based implementation can be simplified.

**New approach**:
- Keep `electron-store` as the persistence backend
- Keep `ConfigKeys` enum for typed access
- Use a generic `get<T>(key: ConfigKeys): T` / `set<T>(key: ConfigKeys, value: T)` instead of per-key getters/setters
- Use EventEmitter (or typed event bus) instead of manual subscriber Map
- IPC handlers for `config:get` and `config:set` from renderer

**Alternatives**: Zustand store wrapping electron-store — rejected because electron-store operates in the main process while Zustand runs in the renderer. The config manager is a main-process concern; renderer access is through IPC.

---

## R4: Dexie Schema & Migration Strategy

**Decision**: Keep Dexie's incremental versioning with upgrade callbacks. Start at version 1 with a clean schema.

**Rationale**: The original codebase has 10 Dexie versions with 8 tables. For the rebuild, we start with a fresh schema containing only the tables needed by F001 (files, settings). Additional tables will be added by downstream features (F002–F005) as their own Dexie version increments.

**Tables for F001 (v1)**:
- `files` — FileMetadata storage (indexed on `id`, `name`, `type`, `created_at`)

**Tables to be added by other Features**:
- `topics`, `message_blocks` — added by F005 (ai-chat)
- `knowledge_notes` — added by F004 (knowledge-base)

**Configuration**: `chromeTransactionDurability: 'strict'` for data safety.

**Alternatives**: Starting with all 8 tables at v1 — rejected because it pre-creates tables for features not yet implemented, violating Simplicity First principle.

---

## R5: electron-vite Multi-Process Configuration

**Decision**: Keep the 3-section `defineConfig({ main, preload, renderer })` pattern from electron-vite.

**Rationale**: This is the standard electron-vite convention. Main process is single-bundled (`inlineDynamicImports: true`), preload is single-bundled, renderer supports multiple HTML entry points.

**Entry points for F001**:
- `main`: `src/main/index.ts`
- `preload`: `src/preload/index.ts`
- `renderer`: `src/renderer/index.html` (main window), `src/renderer/miniWindow.html` (mini window)
- Additional renderer entries (selectionToolbar, traceWindow) deferred to later features

**Key configuration**:
- Path aliases: `@main`, `@renderer`, `@shared`, `@types`
- External: all `package.json` dependencies (main process)
- Plugins: `@tailwindcss/vite`, `react-swc`
- Target: `esnext` for renderer

**Alternatives**: Separate vite configs per process — rejected because electron-vite handles the multi-process orchestration automatically.

---

## R6: Preload API Surface Design

**Decision**: Single `window.api` object via `contextBridge.exposeInMainWorld`, with nested domain objects.

**Rationale**: The nested-domain pattern (`window.api.file.read()`, `window.api.config.get()`) organizes 130+ methods into logical groups. Each method wraps `ipcRenderer.invoke(IpcChannel.X)`. Event listeners return cleanup functions for React `useEffect` compatibility.

**F001-owned API namespaces**:
- `window.api.app` — lifecycle, theme, proxy, zoom, paths
- `window.api.file` — file operations (read, write, upload, delete, etc.)
- `window.api.config` — get/set config values
- `window.api.window` — window management
- `window.api.system` — platform info
- `window.api.miniWindow` — mini window control
- `window.api.notification` — system notifications
- `window.api.open` — open URLs/paths externally
- `window.api.aes` — encryption/decryption
- `window.api.zip` — compression
- `window.api.shortcuts` — keyboard shortcuts
- `window.api.storeSync` — cross-window state sync

**Type safety**: Export `type WindowApiType = typeof api` for renderer consumption.

**Alternatives**: Code-generating the preload API from the IpcChannel enum — worth considering but not for initial implementation.

---

## R7: State Management — Zustand Migration Strategy

**Decision**: Zustand stores with `persist()` middleware in the renderer, replacing Redux Toolkit + Redux Persist.

**Rationale**: Zustand is simpler (no reducers, no action types, no dispatch), has built-in `persist` middleware that stores to `localStorage`/`IndexedDB`, and supports middleware composition. Multi-window sync via `BroadcastChannel` middleware.

**Store structure for F001**:
- `useAppStore` — app-level state (theme, language, sidebar state)
- Multi-window sync: Custom Zustand middleware wrapping `BroadcastChannel` to replicate state changes across main and mini windows

**Migration approach**:
- The 187 Redux Persist migrations from the original codebase are NOT migrated
- Fresh Zustand stores start with no migration history
- Users upgrading from the original app would need a one-time data export/import (handled by F007-backup-sync)

**Alternatives**: Keeping Redux Toolkit — rejected per stack migration decision. Jotai/Recoil — more complex atom model not needed for this use case.

---

## R8: Routing — TanStack Router Setup

**Decision**: TanStack Router with file-based route generation, replacing React Router v6.

**Rationale**: TanStack Router provides type-safe routing with automatic route tree generation from the file system. This eliminates the manual route registration that React Router requires.

**Route structure for F001**:
- `/` — main layout (sidebar + content area)
- `/__root.tsx` — root route with providers (theme, i18n, stores)
- TanStack Router's `routeTree.gen.ts` auto-generated from file structure

**Routes deferred to other features**:
- `/chat/$topicId` — F005
- `/knowledge` — F004
- `/settings/*` — F008

**Alternatives**: Keeping React Router — rejected per stack migration decision. Next.js app router — not applicable to Electron renderer.

---

## R9: Theme System — CSS Variables + Tailwind

**Decision**: CSS variables for theming with Tailwind CSS 4's dark mode utility, replacing Ant Design's ConfigProvider token system.

**Rationale**: Tailwind CSS 4 supports CSS-variable-based theming natively. Theme switching sets a `class="dark"` on `<html>` and/or updates CSS custom properties. No runtime JavaScript theme calculation needed.

**Implementation approach**:
- Define CSS variables in `@theme` layer: `--background`, `--foreground`, `--primary`, etc.
- Light/dark themes as separate variable sets
- ThemeService in main process sets `nativeTheme.themeSource` and broadcasts `ThemeUpdated` event
- Renderer listens to `ThemeUpdated`, toggles `dark` class on `<html>`
- Multi-window propagation via IPC (main → all renderer windows)

**Alternatives**: CSS-in-JS theming (runtime overhead), Ant Design's ConfigProvider (being migrated away from).
