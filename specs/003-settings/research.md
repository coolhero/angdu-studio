# Research: Settings

## R-001: Settings State Management Pattern

**Decision**: Zustand store (`useSettingsStore`) with direct IPC sync — no middleware persist layer.

**Rationale**: Settings apply immediately (FR-028). Each change calls `config:set` IPC (F001) which persists to electron-store. On init, `config:getAll` hydrates the store. This avoids dual persistence (Zustand persist + electron-store) and keeps F001 as the single source of truth (SSoT — Constitution I).

**Alternatives considered**:
- Zustand `persist` middleware → rejected: creates a second persistence layer alongside electron-store, violating SSoT
- Direct IPC on every read → rejected: too many IPC round-trips for settings page with many controls

**Pattern**:
```
Init: config:getAll → hydrate Zustand
Write: Zustand set → debounced config:set IPC (300ms for slider/input, immediate for toggle/select)
Read: Zustand selector (local, no IPC)
```

## R-002: Theme Switching Architecture

**Decision**: CSS class strategy with `dark:` variant. `theme:set` IPC → main process nativeTheme sync → `theme:changed` event → toggle `dark` class on `<html>`.

**Rationale**: Tailwind CSS 4 `dark:` variant is the standard approach. F001 already handles `theme:set`/`theme:changed`. The renderer listens for `theme:changed` and toggles the class. System theme follows `nativeTheme.themeSource`.

**Alternatives considered**:
- CSS custom properties only → rejected: Tailwind's dark: variant is more ergonomic
- Multiple CSS files → rejected: unnecessary complexity, Tailwind handles it

## R-003: i18n Library Choice

**Decision**: i18next + react-i18next with bundled JSON locale files.

**Rationale**: Industry standard, same as source app. Supports namespace-based lazy loading, interpolation, pluralization. `useTranslation()` hook integrates with React's render cycle.

**Configuration**:
- Locale files: `src/renderer/src/i18n/locales/{lang}.json`
- Default: English (`en`)
- Fallback: English
- Language change: `i18n.changeLanguage(lang)` + `config:set('language', lang)`

## R-004: Data Export/Import Strategy

**Decision**: JSZip for ZIP creation/extraction. Export collects all config via `config:getAll` + feature-specific data. Import validates schema version before applying.

**Rationale**: JSZip is lightweight, browser-compatible, handles both creation and extraction. ZIP format matches source app convention.

**Export flow**: `config:getAll()` → serialize to JSON → `JSZip.generateAsync('blob')` → `dialog:saveFile` → write to disk
**Import flow**: `dialog:openFile` → read ZIP → `JSZip.loadAsync` → extract JSON → validate `schemaVersion` → `config:set` for each key → reload stores

## R-005: Keyboard Shortcut Recording

**Decision**: Custom `useShortcutRecorder` hook with `keydown` event listener in capture mode.

**Rationale**: No existing shadcn/ui component for shortcut recording. Custom hook captures key combinations, displays human-readable labels, and checks for conflicts against the existing shortcut list.

**Recording flow**: Click field → `isRecording=true` → `keydown` listener captures modifier+key → build combo string → check conflicts in `useShortcutsStore` → display warning or save.

**IPC integration**: Shortcut bindings registered/unregistered in main process via existing `globalShortcut` IPC (from F001).

## R-006: Settings Sub-page Routing

**Decision**: Nested React Router routes under `#/settings/*`. Settings sidebar uses `NavLink` for active state.

**Rationale**: F002 already provides HashRouter. Nested routes keep settings self-contained. `NavLink` provides built-in active class support.

**Routes**:
- `#/settings` → redirect to `#/settings/general`
- `#/settings/general` → GeneralSettings
- `#/settings/display` → DisplaySettings
- `#/settings/data` → DataSettings
- `#/settings/shortcuts` → ShortcutSettings

**Note**: Future features (F004, F007) will add their own settings sub-pages (provider, mcp) to the same sidebar.

## R-007: Quick Phrases Storage

**Decision**: Store quick phrases as JSON array in electron-store via a dedicated config key `quickPhrases`.

**Rationale**: Quick phrases are a small dataset (typically <100 items). JSON serialization in electron-store is sufficient. No need for SQLite table for this entity.

**Alternatives considered**:
- SQLite table → rejected: overkill for small, non-relational data
- Separate JSON file → rejected: violates SSoT, electron-store already handles persistence

## R-008: Custom CSS Injection

**Decision**: Inject user CSS via a `<style>` element with a unique ID, updated on change.

**Rationale**: Simple, immediate, no build step required. The style element is created once and its `textContent` updated on change.

**Security**: Custom CSS is sandboxed to the renderer process. No `@import` from external URLs (strip or warn).
