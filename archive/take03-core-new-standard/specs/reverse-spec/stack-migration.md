# Stack Migration Plan

**Source Project**: /Users/coolhero/Study/oss/cherry-studio
**Generated**: 2026-03-04
**Decision Made In**: Phase 1-6 (Stack Strategy Details)

---

## Migration Overview

| Category | Current | New | Migration Complexity |
|----------|---------|-----|---------------------|
| Language | TypeScript 5.8 | TypeScript 5.8 | None (keep) |
| Platform | Electron 40 | Electron 40 | None (keep) |
| UI Framework | React 19 | React 19 | None (keep) |
| UI Component Library | Ant Design 5.27 | shadcn/ui + Radix UI | High |
| Styling | styled-components 6 + Tailwind CSS 4 | Tailwind CSS 4 only | Medium |
| State Management | Redux Toolkit 2.2 + Redux Persist | Zustand + zustand/middleware (persist) | Medium |
| Data Fetching | React Query 5 | React Query 5 | None (keep) |
| Routing | React Router 6 | TanStack Router | Medium |
| DB (Main) | SQLite + Drizzle ORM + libsql | SQLite + Drizzle ORM + libsql | None (keep) |
| DB (Renderer) | Dexie 4 (IndexedDB) | Dexie 4 (IndexedDB) | None (keep) |
| Rich Text Editor | TipTap 3 | TipTap 3 | None (keep) |
| AI SDK | Vercel AI SDK 6 | Vercel AI SDK 6 | None (keep) |
| MCP | @modelcontextprotocol/sdk 1.27 | @modelcontextprotocol/sdk 1.27 | None (keep) |
| Build | electron-vite 5 | electron-vite 5 | None (keep) |
| Testing | Vitest + Playwright | Vitest + Playwright | None (keep) |
| Package Manager | pnpm 10 | pnpm 10 | None (keep) |

---

## Category Details

### UI Component Library: Ant Design 5.27 → shadcn/ui + Radix UI
- **Rationale**: shadcn/ui provides headless, copy-paste components built on Radix UI primitives. Full customization control, Tailwind-native, tree-shakable. Eliminates Ant Design's CSS-in-JS overhead and opinionated styling.
- **Key differences**: Ant Design provides complete, styled components with CJK support. shadcn/ui provides unstyled primitives + Tailwind utility classes. Need to build custom CJK/locale support.
- **Impact on Features**: ALL Features with UI (F005-ai-chat, F008-settings-ui most affected). Every component using antd must be replaced.
- **Component mapping**:
  - `Button`, `Input`, `Select`, `Modal`, `Drawer` → shadcn/ui equivalents
  - `Table`, `Form`, `Tabs`, `Menu` → shadcn/ui + custom implementations
  - `message`, `notification` → sonner or custom toast system
  - `Popover`, `Tooltip`, `Dropdown` → Radix UI primitives
  - `ConfigProvider`, `ThemeProvider` → CSS variables + Tailwind config

### Styling: styled-components + Tailwind → Tailwind CSS 4 only
- **Rationale**: Eliminates CSS-in-JS runtime overhead. Tailwind-only is natural for shadcn/ui. Design tokens via CSS variables.
- **Key differences**: No more `styled()` wrappers. All styling via Tailwind utility classes + `cn()` helper for conditional classes.
- **Impact on Features**: ALL Features. Every styled-component must be converted to Tailwind classes.
- **Migration pattern**: `styled.div<Props>` → `<div className={cn("base-classes", conditional && "variant")}>`

### State Management: Redux Toolkit → Zustand
- **Rationale**: Zustand is lighter, less boilerplate, excellent TypeScript DX. Built-in persist middleware. No need for actions/reducers/selectors ceremony.
- **Key differences**: No more `createSlice`, `configureStore`, `useSelector`, `useDispatch`. Instead: `create()` stores with direct state access.
- **Migration pattern**:
  - Redux slice → Zustand store (one store per slice or grouped by domain)
  - `useAppSelector(s => s.settings)` → `useSettingsStore(s => s.theme)`
  - `dispatch(setTheme('dark'))` → `useSettingsStore.getState().setTheme('dark')`
  - Redux Persist → `persist()` middleware in Zustand
  - StoreSyncService → Custom Zustand middleware for BroadcastChannel sync
- **Impact on Features**: ALL Features that access store. 26 slices → Zustand stores.

### Routing: React Router 6 → TanStack Router
- **Rationale**: Fully type-safe routing with TypeScript inference. Built-in search params validation, loader/action patterns.
- **Key differences**: File-based route definitions, type-safe `Link` components, search params as typed objects.
- **Migration pattern**:
  - `<Route path="/settings/*" element={<SettingsPage />}>` → file-based route in `routes/settings/`
  - `useNavigate()` → `useNavigate()` (similar API, better types)
  - `useParams()` → type-safe `useParams()` with route inference
  - HashRouter → TanStack's hash-based history
- **Impact on Features**: F001-core-platform (Router setup), ALL page-level Features.

---

## Migration Considerations

### Patterns That Transfer Directly
- Electron IPC architecture — channel definitions, handler patterns, preload bridge
- AI SDK integration — Vercel AI SDK usage, provider configs, streaming
- Database schemas — Drizzle ORM models, Dexie IndexedDB schemas
- MCP protocol — Transport layers, tool calling, server lifecycle
- Business logic — All rules, validations, workflows are stack-independent
- Testing approach — Vitest tests, Playwright e2e structure

### Patterns That Require Rethinking
- Component styling — styled-components → Tailwind utility classes
- State management ceremony — Redux slices/thunks → Zustand stores/actions
- Component library usage — Ant Design specific components → shadcn/ui or custom
- Theme system — Ant Design ConfigProvider → CSS variables + Tailwind dark mode
- Form handling — Ant Design Form → React Hook Form or custom with Zod
- Route definitions — React Router JSX routes → TanStack file-based routes

### Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Loss of Ant Design CJK-optimized components | Medium | Build CJK text handling as a shared utility; use proper font stacks |
| Loss of Ant Design Form validation UX | Medium | Use React Hook Form + Zod for equivalent validation; shadcn/ui form primitives |
| Zustand learning curve for complex state | Low | Zustand is simpler than Redux; well-documented patterns |
| TanStack Router ecosystem maturity | Low | TanStack Router is stable and well-maintained; Electron only uses basic routing |
| styled-components to Tailwind conversion effort | High | Systematic conversion per Feature; use `cn()` utility for complex conditional styles |

---

## Per-Feature Migration Notes

| Feature | Key Migration Consideration |
|---------|----------------------------|
| F001-core-platform | Router setup changes (TanStack Router). Theme system overhaul (CSS vars). State store initialization (Zustand). |
| F002-provider-management | Redux slice → Zustand store. Ant Design Form → shadcn/ui Form + Zod. |
| F003-ai-core-engine | Minimal impact — mostly TypeScript logic. No UI changes. |
| F004-knowledge-base | UI components (Ant Design → shadcn/ui). Redux knowledge slice → Zustand. |
| F005-ai-chat | Heaviest migration: chat UI components, message blocks, input bar all use Ant Design + styled-components. Redux thunks → Zustand actions. |
| F006-mcp-integration | Mostly main process logic (no UI change). Settings UI portion needs component migration. |
| F007-backup-sync | Redux backup slice → Zustand. Ant Design modals → shadcn/ui Dialog. |
| F008-settings-ui | All settings forms use Ant Design Form + Input + Select. Full UI rewrite with shadcn/ui. |
| F009-notes-editor | TipTap stays. Sidebar/toolbar components need shadcn/ui migration. |
| F010-auxiliary-features | Translation, paintings, mini apps UI → shadcn/ui. Multiple Redux slices → Zustand stores. |
| F011-memory-system | Minimal UI. Main logic is in services (no change). |
| F012-agent-framework | Mostly main process logic. Session UI needs component migration. |

---

**Version**: 0.1.0 | **Generated**: 2026-03-04
