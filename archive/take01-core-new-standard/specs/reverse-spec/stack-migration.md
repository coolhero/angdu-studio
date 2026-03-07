# Stack Migration Plan

**Source Project**: /Users/coolhero/Study/oss/cherry-studio
**Generated**: 2026-03-02
**Decision Made In**: Phase 1-6 (Stack Strategy Details)

---

## Migration Overview

| Category | Current | New | Migration Complexity |
|----------|---------|-----|---------------------|
| Language | TypeScript 5.8 | TypeScript 5.x (Keep) | None |
| Desktop Framework | Electron 40.6 | Electron (latest) | Low |
| UI Framework | React 19.2 | React 19.x (Keep) | None |
| Build Tool | Electron-Vite 5.0 | Electron-Vite (Keep) | None |
| State Management | Redux Toolkit 2.2 | Zustand | Medium |
| UI Component Library | Ant Design 5.27 + Styled Components 6.1 | Shadcn/ui + TailwindCSS | High |
| ORM/DB | Drizzle ORM + LibSQL + Dexie | Drizzle ORM + better-sqlite3 + Dexie | Low |
| Testing | Vitest 3.2 + Playwright 1.55 | Vitest + Playwright (Keep) | None |
| Package Manager | pnpm 10.27 | pnpm (Keep) | None |

---

## Category Details

### State Management: Redux Toolkit → Zustand

- **Rationale**: Zustand eliminates the boilerplate of Redux (actions, reducers, slices, selectors). Cherry Studio has 25 Redux slices — Zustand stores are simpler with the same capabilities. Built-in persistence middleware replaces redux-persist.
- **Key differences**:
  - No more `createSlice` / `createAsyncThunk` ceremony. Zustand stores are plain functions.
  - Selectors are hooks: `useStore(state => state.field)` instead of `useSelector`.
  - Middleware is composable: `persist()`, `devtools()`, `subscribeWithSelector()`.
  - Cross-window sync needs a custom middleware (replace StoreSyncService).
- **Migration pattern**:
  - Each Redux slice → one Zustand store (or merged where logically grouped).
  - `redux-persist` → Zustand `persist` middleware with `localStorage`.
  - Thunks → async functions directly in the store.
  - 199 migrations → Zustand `persist` `migrate` option.
- **Impact on Features**: All Features that read/write state. Heaviest impact on F004-chat-conversation (largest slice) and F002-settings-theme (most migrations).

### UI Component Library: Ant Design + Styled Components → Shadcn/ui + TailwindCSS

- **Rationale**: Ant Design's opinionated styling conflicts with customization needs. Shadcn/ui provides copy-paste Radix UI primitives with full ownership. TailwindCSS (already in the project) replaces Styled Components for all styling.
- **Key differences**:
  - Ant Design components (Button, Modal, Table, Form, etc.) → Shadcn/ui equivalents.
  - `styled()` calls → TailwindCSS utility classes.
  - Ant Design theme tokens → CSS variables + TailwindCSS theme config.
  - Some Ant Design components have no Shadcn equivalent (DatePicker, TreeSelect) — use Radix primitives or headless alternatives.
- **Migration pattern per component**:
  - `<Button type="primary">` → `<Button variant="default">`
  - `<Modal>` → `<Dialog>`
  - `<Select>` → Shadcn `<Select>` (Radix-based)
  - `<message.success()>` → `toast()` (Sonner)
  - `<Tooltip>` → Shadcn `<Tooltip>`
  - `<Dropdown>` → Shadcn `<DropdownMenu>`
  - `<Table>` → Shadcn `<Table>` + TanStack Table
- **Impact on Features**: Every Feature with UI. Heaviest impact on F004-chat-conversation (largest UI surface) and F013-utilities (many diverse UI components).

### ORM/DB: LibSQL → better-sqlite3

- **Rationale**: LibSQL adds an unnecessary network abstraction layer for a local desktop app. better-sqlite3 is a direct SQLite binding — synchronous, faster, no network overhead, better Electron compatibility.
- **Key differences**:
  - LibSQL client → better-sqlite3 Database instance.
  - Async queries → synchronous queries (better-sqlite3 is sync by design).
  - Drizzle adapter: `drizzle(libsql)` → `drizzle(betterSqlite3)`.
- **Migration pattern**: Drizzle schema files remain identical. Only the driver initialization changes.
- **Impact on Features**: F001-app-core (database initialization), F012-api-server-agents (Drizzle schema for agents). Minimal impact — Drizzle abstracts the driver.

---

## Migration Considerations

### Patterns That Transfer Directly
- TypeScript types and interfaces — all domain types are stack-independent
- Electron IPC architecture — main/preload/renderer separation unchanged
- Drizzle ORM schema definitions — same schema, different driver
- Dexie/IndexedDB usage — unchanged
- Vitest/Playwright test structure — unchanged
- AI SDK provider integrations — unchanged
- MCP protocol handling — unchanged
- i18next internationalization — unchanged
- TailwindCSS usage — already in project, expanded to replace Styled Components

### Patterns That Require Rethinking
- Redux slices + selectors → Zustand stores + hooks (different mental model)
- Redux middleware (StoreSyncService) → Zustand subscribe/middleware
- redux-persist migrations → Zustand persist migrate function
- Ant Design component API → Shadcn/ui component API (different props, composition patterns)
- Styled Components `styled()` → TailwindCSS `className` strings
- Ant Design theme system → CSS variables + TailwindCSS theme
- Ant Design form validation → React Hook Form + Zod (or similar)

### Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| 199 Redux persist migrations not portable | High | Implement a one-time migration loader that reads old localStorage format and converts to Zustand persist format |
| Ant Design component feature gaps in Shadcn | Medium | Identify gaps early during F001 planning. Use Radix primitives directly or headless-ui for complex components |
| Cross-window sync complexity with Zustand | Medium | Implement a BroadcastChannel-based sync middleware for Zustand (simpler than Redux middleware) |
| better-sqlite3 native addon compilation | Low | Use electron-rebuild. better-sqlite3 has excellent Electron support |
| Styled Components dynamic styling migration | Medium | Use TailwindCSS `cn()` helper with conditional classes. Complex dynamic styles → CSS variables |

---

## Per-Feature Migration Notes

| Feature | Key Migration Consideration |
|---------|----------------------------|
| F001-app-core | Database driver change (LibSQL → better-sqlite3). Set up Zustand persist infrastructure. Configure Shadcn/ui + TailwindCSS theme. |
| F002-settings-theme | Largest migration impact: 250+ settings fields, theme system, 199 migrations. Design Zustand persist migration strategy. |
| F003-provider-management | Redux llm slice → Zustand store. Provider OAuth flows unchanged. API key management logic transfers directly. |
| F004-chat-conversation | Heaviest UI rewrite: chat components use extensive Ant Design. Message/block state management Redux → Zustand. Throttled updates pattern needs Zustand equivalent. |
| F005-ai-completion | Minimal migration: AI pipeline logic is framework-agnostic. Only touch points are state reads (Redux selectors → Zustand hooks). |
| F006-knowledge-base | UI migration for knowledge management pages. Core embedding/retrieval logic in main process is unchanged. |
| F007-mcp | UI migration for MCP server management. Tool permission UI uses Ant Design modals → Shadcn dialogs. Core MCP service logic unchanged. |
| F008-memory | Small feature. Store migration straightforward. |
| F009-backup-sync | Settings UI uses Ant Design forms → Shadcn form components. Core backup logic in main process unchanged. |
| F010-image-generation | Provider-specific painting UIs need Shadcn rewrite. Generation logic unchanged. |
| F011-translation | Simple UI. Translation logic unchanged. |
| F012-api-server-agents | Express API server and Drizzle schema unchanged. Agent UI needs Shadcn migration. |
| F013-utilities | Multiple diverse UIs (OCR, notes, mini apps, selection). Each needs individual Shadcn treatment. |

---

**Version**: 0.1.0 | **Generated**: 2026-03-02
