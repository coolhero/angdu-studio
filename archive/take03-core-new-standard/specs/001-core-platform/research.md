# Research: Core Platform

**Feature**: 001-core-platform
**Date**: 2026-03-04
**Status**: Complete

---

## R1: Electron 3-Process Architecture with electron-vite

**Decision**: Use electron-vite 5 with the standard main/preload/renderer split. Context isolation enabled via `contextIsolation: true` in BrowserWindow webPreferences.

**Rationale**: electron-vite already provides the build configuration for all three process targets. The original Cherry Studio uses this exact setup. Context isolation is the Electron security best practice and enforces Constitution Principle I.

**Alternatives considered**:
- electron-forge: Heavier tooling, not needed since electron-vite already handles builds
- Custom webpack: Unnecessary complexity when electron-vite works out of the box

---

## R2: IPC Channel Enum Design

**Decision**: Define a single TypeScript `enum IpcChannel` in `packages/shared/IpcChannel.ts` containing all channel names as enum values. Use domain prefixes (e.g., `App_Info`, `File_Read`, `Config_Set`). Both main and renderer import the same enum.

**Rationale**: Constitution Principle V mandates enum-based IPC channels. The original project uses this pattern with ~220 channels. F001 owns ~126 of those channels. Using underscore-separated naming (e.g., `App_Info`) keeps enum values valid identifiers while maintaining domain grouping.

**Alternatives considered**:
- String literal unions: No IDE navigation to definition, no exhaustiveness check
- Namespace objects: More boilerplate, less IDE support than enums
- Per-domain separate enums: Harder to enforce uniqueness across domains

---

## R3: Zustand Store Architecture (replacing Redux)

**Decision**: Use Zustand with `persist()` middleware for configuration state. One store per domain (e.g., `useAppStore`, `useThemeStore`, `useFileStore`). Use `subscribeWithSelector` for fine-grained reactivity. Cross-window sync via custom `broadcast` middleware using BroadcastChannel API.

**Rationale**: Constitution Principle VII requires BroadcastChannel-based sync. Zustand's middleware system natively supports this. The persist middleware replaces Redux Persist with zero configuration overhead.

**Alternatives considered**:
- Single global store: Too large, poor code splitting
- Jotai/Recoil: Atomic state is overkill for this use case; Zustand is simpler

---

## R4: TanStack Router Setup (replacing React Router)

**Decision**: Use TanStack Router with hash-based history (required for Electron file:// protocol). File-based route generation via `@tanstack/router-vite-plugin`. Routes defined in `src/renderer/src/routes/` directory.

**Rationale**: Hash-based routing is required because Electron loads the renderer from `file://` protocol, which doesn't support HTML5 history API pushState. TanStack Router provides type-safe routes with search params validation.

**Alternatives considered**:
- React Router v7: Less type-safe, no built-in file-based routing
- Wouter: Too minimal, lacks search params and loader patterns

---

## R5: Theme System (replacing Ant Design ConfigProvider)

**Decision**: CSS variables for theme tokens, defined in `:root` and `.dark` selectors. Tailwind CSS 4's `@theme` directive for design tokens. ThemeService in main process syncs with `nativeTheme`. Renderer reads theme via CSS class on `<html>` element. shadcn/ui components auto-respond to dark class.

**Rationale**: Tailwind CSS 4's native dark mode uses the `.dark` class on the root element, which aligns perfectly with shadcn/ui's theming approach. No runtime CSS-in-JS needed.

**Alternatives considered**:
- CSS Modules: Not composable with Tailwind utilities
- styled-components theming: Being removed per stack migration decision
- next-themes: Next.js-specific, not applicable to Electron

---

## R6: File Storage Architecture

**Decision**: FileStorageService in main process handles all file I/O. Files stored in `app.getPath('userData')/files/` (or portable equivalent). FileMetadata stored in Dexie IndexedDB in renderer. File operations exposed via IPC channels in the `file:*` domain. Chunked upload with progress via streaming IPC.

**Rationale**: Constitution Principle X requires all data local. Main process handles filesystem access (Principle I). Metadata in Dexie allows renderer-side queries without IPC round-trips.

**Alternatives considered**:
- SQLite for metadata: Adds main-process dependency for metadata queries; Dexie is faster for renderer-side lookups
- File-based metadata (JSON sidecar): No query capability, poor for listing/searching

---

## R7: Logging Architecture

**Decision**: Winston logger in main process with daily-rotate-file transport. Two transports: general logs (10MB/30d) and error logs (10MB/60d). Context-scoped via `logger.withContext(module)`. Renderer logs forwarded via `app:log` IPC channel.

**Rationale**: Winston is the established Node.js logging library. Daily rotation prevents disk bloat. Separate error logs aid debugging. Context scoping follows the original project's pattern.

**Alternatives considered**:
- pino: Faster but less ecosystem support for file rotation in Electron
- electron-log: Too simple, lacks structured logging and module context

---

## R8: Dexie IndexedDB Schema Strategy

**Decision**: Start fresh with Dexie version 1 in the new codebase. Define base tables needed by F001 (files) and placeholder schema hooks for downstream features. Use Dexie's upgrade mechanism for future migrations.

**Rationale**: The original project has 10 schema versions reflecting historical changes. Starting fresh avoids carrying legacy migration baggage. Schema is extensible — F002-F005 will add their tables via version bumps.

**Alternatives considered**:
- Copy all 10 versions: Unnecessary complexity for a rebuild
- SQLite instead of Dexie: Would require IPC for every renderer-side query

---

## R9: i18n Architecture

**Decision**: react-i18next in renderer with JSON resource files per locale. 10 locales: en-US (default), ko-KR, ja-JP, ru-RU, de-DE, el-GR, es-ES, fr-FR, pt-PT, ro-RO. Main process i18n via simple lookup function reading same JSON files. dayjs locale integration for date formatting.

**Rationale**: react-i18next is the standard React i18n library. JSON resources are easy to maintain and translate. The same JSON files serve both processes.

**Alternatives considered**:
- lingui: More complex setup, less community support
- Format.js/react-intl: ICU message format is overkill for this use case

---

## R10: Preload Bridge Design

**Decision**: Single preload script exposes a typed `window.api` object via `contextBridge.exposeInMainWorld`. The API object is organized by domain (e.g., `window.api.file.read()`, `window.api.app.getInfo()`). Each method wraps `ipcRenderer.invoke(IpcChannel.XXX, ...args)`.

**Rationale**: Constitution Principle I requires the preload bridge as the only communication path. Organizing by domain mirrors the IPC channel structure. TypeScript types for the API object ensure type safety across the bridge.

**Alternatives considered**:
- Multiple preload scripts: Unnecessarily complex, one is sufficient
- Direct ipcRenderer exposure: Security violation, breaks context isolation
