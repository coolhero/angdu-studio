# Stack Migration Plan (Reverse-Spec)

**Source Project**: /Users/coolhero/Study/oss/cherry-studio
**Generated**: 2026-03-04

---

## Migration Overview (4 changes only -- everything else kept)

| Category | Current | New | Migration Complexity |
|----------|---------|-----|---------------------|
| UI Components | Ant Design 5.27 | shadcn/ui + Radix UI | High |
| Styling | styled-components 6 + Tailwind CSS 4 | Tailwind CSS 4 only | Medium |
| State Management | Redux Toolkit 2.2 + Redux Persist | Zustand + persist middleware | Medium |
| Routing | React Router 6 | TanStack Router | Medium |

---

## Category Details

### 1. UI Components: Ant Design -> shadcn/ui + Radix UI

- **Rationale**: Better tree-shaking, full customization via Tailwind, composable primitives, no CSS-in-JS overhead
- **Component mapping**:
  - Button -> Button
  - Input -> Input
  - Select -> Select
  - Modal -> Dialog
  - Drawer -> Sheet
  - Table -> Table (or @tanstack/react-table)
  - Tabs -> Tabs
  - Form -> Form (react-hook-form + zod)
  - Switch -> Switch
  - Checkbox -> Checkbox
  - Radio -> RadioGroup
  - Tooltip -> Tooltip
  - Dropdown -> DropdownMenu
  - Popover -> Popover
  - Avatar -> Avatar
  - Badge -> Badge
  - Tag -> Badge (variant)
  - Progress -> Progress
  - Spin -> Skeleton
  - ConfigProvider -> CSS variables + Tailwind config
- **Impact**: All renderer components that import from `antd` / `@ant-design`
- **Scope**: All 12 Features affected (any with UI)

### 2. Styling: styled-components -> Tailwind-only

- **Rationale**: Eliminate CSS-in-JS runtime overhead, consistent utility-first approach, better performance
- **Migration**:
  - `styled()` calls -> `className` with Tailwind utilities
  - Theme tokens -> CSS custom properties in `tailwind.config`
  - Dynamic styles -> `cn()` helper with conditional classes
- **Impact**: All renderer components

### 3. State Management: Redux Toolkit -> Zustand

- **Rationale**: Simpler API, smaller bundle, no boilerplate (`createSlice`, `createAsyncThunk`), built-in persist
- **Migration**:
  - `createSlice` -> `create()` stores
  - `useSelector` -> direct store access with selectors
  - `dispatch(action)` -> `store.action()`
  - Redux Persist -> `persist()` middleware
  - `configureStore` -> individual stores
  - 25+ slices -> equivalent Zustand stores
- **Multi-window sync**: StoreSyncService -> BroadcastChannel middleware in Zustand
- **Migration path for 187 state migrations**: New migration system needed for Zustand persisted state
- **Impact**: All Features that read/write state

### 4. Routing: React Router -> TanStack Router

- **Rationale**: Type-safe routing, file-based route generation, better search params handling
- **Migration**:
  - `createBrowserRouter` -> `createRouter` with route tree
  - `useNavigate` -> `useNavigate` (API similar)
  - `useParams` -> `useParams` (type-safe)
  - Route component -> file-based routes
- **14 existing routes to migrate**: `/`, `/store`, `/paintings`, `/translate`, `/files`, `/notes`, `/knowledge`, `/apps`, `/code`, `/openclaw`, `/settings`, `/launchpad`, plus nested routes
- **Impact**: F001 (route setup), all Features with UI routes

---

## Patterns That Transfer Directly

- Electron IPC channel structure (shared enum, typed handlers)
- Service layer pattern (hooks -> services -> IPC)
- Database layer (Dexie, Drizzle -- no changes)
- AI SDK integration (aiCore, Vercel AI SDK -- no changes)
- Build system (electron-vite -- no changes)
- Test framework (Vitest, Playwright -- no changes)

---

## Patterns That Require Rethinking

- **Component composition**: Ant Design prop-based -> shadcn/ui composition-based
- **Form handling**: Ant Design Form -> react-hook-form + zod (shadcn pattern)
- **Theme system**: Ant Design ConfigProvider -> CSS variables + Tailwind theme
- **Global state access**: Redux `useSelector` -> Zustand `use[Store]` hooks
- **Route definitions**: Centralized route config -> file-based route tree

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Ant Design component gap (Table, DatePicker, Tree) | Medium | Use @tanstack/react-table, date-fns + custom, shadcn tree component |
| Redux migration state loss | High | Design new Zustand persistence schema, write one-time migration from Redux persisted state |
| Styling inconsistency during migration | Medium | Establish design tokens early, create Tailwind theme config matching current design |
| TanStack Router learning curve | Low | Well-documented, similar API concepts to React Router |

---

## Per-Feature Migration Notes

| Feature | Key Migration Consideration |
|---------|----------------------------|
| F001-core-platform | Route setup moves to TanStack Router; theme system overhaul from ConfigProvider to CSS vars |
| F002-provider-management | Provider list/edit UI: Ant Design Form -> shadcn form + react-hook-form |
| F003-ai-core-engine | Minimal UI impact -- mostly package-level code. No component migration needed |
| F004-knowledge-base | KB management UI: Ant Design Table/List -> @tanstack/react-table or custom |
| F005-ai-chat | Chat UI: Message rendering, input area, sidebar. Heavy component migration |
| F006-mcp-integration | MCP server management UI: Form/List/Modal migration |
| F007-backup-sync | Settings sub-pages: Form inputs for WebDAV/S3 config |
| F008-settings-ui | Heaviest UI migration -- all settings pages use Ant Design components extensively |
| F009-notes-editor | TipTap editor unaffected; toolbar and file tree UI need migration |
| F010-auxiliary-features | Translation/paintings/mini-app UIs need component migration |
| F011-memory-system | Memory UI relatively simple -- list/search interface |
| F012-agent-framework | Agent management UI: CRUD forms and session views |

---

Version: 0.1.0 | Generated: 2026-03-04
