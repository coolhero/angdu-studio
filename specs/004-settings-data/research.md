# Research: 004-settings-data

**Date**: 2026-03-09

## R1: Zustand Persist with electron-store

**Decision**: Use Zustand `persist` middleware with a custom storage adapter that delegates to electron-store via IPC, consistent with F001/F002 patterns.

**Rationale**: The F001 app-core already established the pattern: Zustand stores use `persist` middleware with a custom `ElectronStoreAdapter` that calls `config:get`/`config:set` IPC channels. This avoids localStorage limitations (5MB) and keeps data in the main process for backup inclusion.

**Alternatives considered**:
- localStorage via default Zustand persist → Rejected: 5MB limit, not accessible from main process for backup
- Direct electron-store in renderer → Rejected: requires nodeIntegration, violates Constitution II (IPC Bridge Pattern)

## R2: Settings State Decomposition

**Decision**: Split the monolithic ~80-field settings slice into 4 focused Zustand stores: `useSettingsStore` (general/display/behavior), `useBackupStore` (backup config), `useMiniAppsStore` (mini apps), `useShortcutsStore` (keyboard shortcuts). Quick phrases and sidebar icons live in `useSettingsStore` as they are simple arrays.

**Rationale**: Smaller stores reduce selector complexity and re-render blast radius. Each store maps to a distinct settings page section. The original Redux architecture used 5+ separate slices for these concerns.

**Alternatives considered**:
- Single monolithic store → Rejected: 80+ fields causes excessive re-renders, complex selectors
- One store per settings category → Rejected: over-fragmentation, too many stores for simple toggles

## R3: File Management Architecture

**Decision**: FileMetadata stored in Dexie (IndexedDB) via the existing F003 database layer. File binary data stored on filesystem, managed by main-process `FileStorageService`. Renderer interacts via IPC channels only.

**Rationale**: FileMetadata is referenced by Message and KnowledgeItem entities (both in Dexie). Co-locating in Dexie enables efficient joins. Binary file operations (read, write, copy, move) must run in main process for filesystem access.

**Alternatives considered**:
- SQLite for FileMetadata → Rejected: would require cross-database references between SQLite (main) and Dexie (renderer)
- In-memory only → Rejected: files must persist across sessions

## R4: Backup Archive Format

**Decision**: ZIP archive containing: (1) JSON exports of all Zustand stores, (2) Dexie database export (topics, messages, blocks, file metadata), (3) file attachments directory. Use Node.js `archiver` for creation, `adm-zip` or `yauzl` for extraction.

**Rationale**: ZIP is universally supported, compresses well, and can be inspected by users. The original Cherry Studio uses the same format. Including all three data layers ensures complete restore.

**Alternatives considered**:
- SQLite dump → Rejected: doesn't include Dexie data or file attachments
- JSON only → Rejected: doesn't include binary file attachments

## R5: WebDAV and S3 Client Libraries

**Decision**: Use `webdav` npm package for WebDAV operations and `@aws-sdk/client-s3` for S3. Both run in main process only.

**Rationale**: These are the standard, well-maintained libraries for each protocol. Running in main process is required for network access and credential handling. The original Cherry Studio uses the same libraries.

**Alternatives considered**:
- Custom HTTP clients → Rejected: unnecessary complexity, WebDAV and S3 have complex protocol requirements
- `minio` SDK → Rejected: `@aws-sdk/client-s3` is more widely supported and covers all S3-compatible endpoints

## R6: Settings UI Component Architecture

**Decision**: Settings page uses a tabbed layout (shadcn Tabs) with each section as a separate component. Each section receives its settings slice via Zustand selector. Forms use individual controlled components (Switch, Select, Input, Slider) bound directly to store setters — no form-level submit.

**Rationale**: Settings are applied immediately (no save button), so each control writes directly to the store on change. This matches the original Cherry Studio UX and aligns with Constitution principle of simplicity.

**Alternatives considered**:
- react-hook-form for all settings → Rejected: overkill for immediate-apply settings with no validation; appropriate for WebDAV/S3 config forms which do need validation
- Uncontrolled components → Rejected: harder to synchronize with store state

## R7: Keyboard Shortcut Implementation

**Decision**: Use `react-hotkeys-hook` (already in project from F005) for shortcut listening. Store shortcut bindings in `useShortcutsStore`. Conflict detection compares new binding against all existing bindings before save.

**Rationale**: `react-hotkeys-hook` is already a project dependency. Shortcut bindings are simple key-combination strings. Conflict detection is a straightforward array search.

**Alternatives considered**:
- Electron globalShortcut → Rejected: only for app-wide shortcuts, not context-specific
- Custom key listener → Rejected: react-hotkeys-hook already handles cross-platform key normalization
