# Stack Migration Map

> Generated during `/reverse-spec` — 2026-03-14
> Project: Angdu Studio (Rebuild of Cherry Studio)

## Stack Comparison

| Category | Current (Cherry Studio) | New (Angdu Studio) | Migration Complexity |
|----------|------------------------|--------------------|--------------------|
| Language | TypeScript 5.8 | TypeScript 5.x | None |
| Desktop Framework | Electron 40 | Electron (latest) | Low (version upgrade) |
| Build Tool | electron-vite 5 | Vite 7 + @electron-toolkit | Low |
| Frontend | React 19 | React 19 | None |
| State Management | Redux Toolkit + Redux Persist (25 slices) | Zustand + zustand/middleware persist | Medium |
| UI Library | Ant Design 5 + Styled Components + Tailwind CSS | Tailwind CSS 4 + shadcn/ui | Medium |
| Rich Editor | TipTap 3.2 | TipTap 3.x | None |
| Code Editor | CodeMirror 4.25 | CodeMirror | None |
| DB (Main) | Drizzle ORM + LibSQL | Drizzle ORM + better-sqlite3 | Low |
| DB (Renderer) | Dexie | Dexie | None |
| Testing | Vitest + Playwright | Vitest + Playwright | None |
| i18n | i18next | i18next | None |
| Data Fetching | TanStack React Query | TanStack React Query | None |
| AI SDK | Vercel AI SDK | Vercel AI SDK | None |

---

## Per-Feature Migration Notes

### F001-shell — Electron Shell & Window Management

- **Build system**: electron-vite 5 → Vite 7 + @electron-toolkit. Config file migration required (`electron.vite.config.ts` → `vite.config.ts` with electron plugin).
- **Electron version**: Upgrade to latest. Review any deprecated APIs.
- **Impact**: Low. Main process code largely unchanged. IPC bridge patterns stay the same.

### F002-i18n-theme — Internationalization & Theming

- **Styled Components theme provider → Tailwind CSS custom properties**: Remove `ThemeProvider` and `styled()` wrappers. Define theme tokens as CSS custom properties in `tailwind.config.ts`.
- **shadcn theme system**: Use shadcn/ui's built-in dark/light mode support via CSS variables and `class` strategy.
- **Font management**: Stays the same (system font stack).
- **Impact**: Medium. Every themed component needs CSS-in-JS removal.

### F003-providers — LLM Provider Management

- **Redux slice → Zustand store**: Convert `providerSlice` to `useProviderStore`. Business logic (50+ provider types, model registry, API key encryption) transfers as-is.
- **UI**: Ant Design form/select → shadcn/ui form/select components.
- **Impact**: Medium. Complex slice with many selectors.

### F004-settings — Settings UI

- **Ant Design form components → shadcn/ui form components**: Major UI rewrite across 16 sub-pages. Every form field, switch, select, input needs replacement.
- **Redux settings slice → Zustand store**: Convert `settingsSlice` with persist middleware.
- **Impact**: Medium-High. Largest UI surface area for component migration.

### F005-assistants — Assistant Management

- **Redux slice → Zustand**: Convert `assistantSlice` (CRUD, presets, store/library).
- **Ant Design → shadcn/ui**: Assistant cards, modal dialogs, form inputs.
- **DnD**: @dnd-kit stays (framework-agnostic).
- **Impact**: Medium.

### F006-chat-core — Chat & Messaging

- **Redux slices → Zustand stores**: Four slices to convert — `messages`, `messageBlocks`, `runtime`, `tabs`. This is the most complex state migration.
- **Styled Components → Tailwind**: Message bubbles, input bar, chat layout.
- **Multi-window sync**: Redux `StoreSyncService` → Zustand BroadcastChannel middleware.
- **Impact**: High. Central feature with most state complexity.

### F007-files — File Management

- **Ant Design table/list → shadcn/ui**: File list with sorting, filter tabs.
- **Redux file slice → Zustand**: Minor — file metadata state.
- **Impact**: Low-Medium. Straightforward component swap.

### F008-mcp — MCP Server Management

- **Redux mcp slice → Zustand**: Convert MCP server config, tool discovery state.
- **Ant Design → shadcn/ui**: Settings UI for server management, OAuth flows.
- **Impact**: Medium.

### F009-agents — Agent Framework

- **DB**: LibSQL → better-sqlite3. Drizzle schema stays, change driver config.
- **Express API**: Internal HTTP server stays unchanged.
- **Redux agent slice → Zustand**: Session state, tool permissions.
- **Impact**: Low-Medium. DB driver swap is mechanical.

### F010-knowledge — Knowledge Base

- **DB**: LibSQL → better-sqlite3 for embedding storage. Same Drizzle schema.
- **embedjs**: Library stays, no migration needed.
- **Impact**: Low. DB driver swap only.

### F011-notes — Rich Text Notes

- **TipTap**: Stays as-is (TipTap 3.x).
- **Styled Components wrapper → Tailwind**: Editor container and toolbar styling.
- **Impact**: Low. Editor logic unchanged, only wrapper styles.

### F012-translate — Translation UI

- **Ant Design → shadcn/ui**: Split-pane layout, language selectors, buttons.
- **franc** (language detection): Stays.
- **Impact**: Low. Small UI surface.

### F013-backup — Backup & Restore

- **Redux backup slice → Zustand**: Backup state, progress tracking.
- **WebDAV/S3 logic**: Business logic unchanged.
- **Impact**: Low. Minor state migration.

### F014-mini-apps — Webview Mini Apps

- **Minimal change**: Webview wrappers are Electron-native, not UI-library dependent.
- **Launchpad grid**: Ant Design grid → Tailwind grid + shadcn/ui card.
- **Impact**: Low.

---

## Migration Risks

### Risk 1: Redux → Zustand (25 slices)

- **Probability**: Medium
- **Impact**: High
- **Description**: 25 Redux slices must be converted to Zustand stores. State shape differences between Redux Toolkit's `createSlice` (immer-powered) and Zustand's `set()` could introduce subtle bugs. Redux Persist's serialization format differs from zustand/middleware persist.
- **Mitigation**:
  - One-to-one slice-to-store mapping — do not restructure state during migration.
  - Zustand's `immer` middleware preserves the same mutation style as Redux Toolkit.
  - Write migration tests comparing old and new state shapes.
  - Convert in dependency order: foundation stores first (settings, theme), then domain stores (providers, assistants), then complex stores (chat, messages).

### Risk 2: Ant Design → shadcn/ui Component Parity

- **Probability**: Medium
- **Impact**: Medium-High
- **Description**: Ant Design has 60+ components; shadcn/ui has ~40. Some Ant Design components (Cascader, TreeSelect, Transfer, Tour) have no direct shadcn equivalent. Custom implementations may be needed.
- **Mitigation**:
  - Audit every Ant Design component used per feature before starting migration.
  - Map each to shadcn/ui equivalent or identify gaps early.
  - For missing components: use Radix UI primitives (shadcn's foundation) to build custom ones.
  - Component mapping reference:
    - `Select` → `Select` (direct)
    - `Modal` → `Dialog` (direct)
    - `Drawer` → `Sheet` (direct)
    - `Table` → `Table` (needs manual pagination)
    - `Form` → `Form` (react-hook-form based)
    - `Message/notification` → `Toast` (sonner)
    - `Tabs` → `Tabs` (direct)
    - `Popover` → `Popover` (direct)
    - `Tooltip` → `Tooltip` (direct)

### Risk 3: Multi-Window State Sync

- **Probability**: Medium
- **Impact**: High
- **Description**: Cherry Studio uses a custom `StoreSyncService` built on Redux to sync state across Electron windows. Zustand has no built-in multi-window sync.
- **Mitigation**:
  - Use `BroadcastChannel` API with a custom Zustand middleware.
  - Alternative: Electron IPC-based sync (main process as state hub).
  - Test with multi-window scenarios early in F001-shell development.

### Risk 4: Styled Components Removal

- **Probability**: Low
- **Impact**: Medium
- **Description**: Styled Components are deeply intertwined with component logic via props-based styling (`${props => ...}`). Extracting to Tailwind requires understanding every dynamic style.
- **Mitigation**:
  - Since this is a rebuild (not refactor), write components from scratch with Tailwind.
  - Use original styled components only as visual reference, not as migration source.
  - Leverage `cn()` utility (clsx + tailwind-merge) for conditional classes.
