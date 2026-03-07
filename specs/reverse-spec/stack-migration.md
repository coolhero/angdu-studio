# Stack Migration Plan

**Project**: Angdu Studio (from Cherry Studio)
**Generated**: 2026-03-07
**Decision Made In**: Phase 1-6 (Stack Strategy Details)

---

## Migration Overview

| Category | Current | New | Migration Complexity |
|----------|---------|-----|---------------------|
| Language | TypeScript 5.8 | TypeScript 5.x | None (Keep) |
| Runtime | Electron 40.6 | Electron (latest) | None (Keep) |
| UI Framework | React 19.2 | React 19 | None (Keep) |
| UI Components | Ant Design 5.27 + Styled Components 6.1 + Tailwind CSS | shadcn/ui + Tailwind CSS 4 | High |
| State Management | Redux Toolkit 2.2 + Redux Persist 6.0 | Zustand + persist middleware | Medium |
| Client DB | Dexie 4 (IndexedDB) | Dexie 4 | None (Keep) |
| Server DB | Drizzle ORM + LibSQL | Drizzle ORM + LibSQL | None (Keep) |
| Rich Text Editor | TipTap 3 | TipTap 3 | None (Keep) |
| AI SDK | Vercel AI SDK (ai 6.0) | Vercel AI SDK | None (Keep) |
| Build | electron-vite 5.0 + SWC | electron-vite + SWC | None (Keep) |
| Code Editor | CodeMirror 6 | CodeMirror 6 | None (Keep) |
| Testing | Vitest 3.2 + Playwright 1.55 | Vitest + Playwright | None (Keep) |
| Logging | Winston 3.17 + OpenTelemetry 2.0 | Winston + OTel | None (Keep) |
| i18n | i18next 23.11 | i18next | None (Keep) |

Only two categories require actual migration work. Everything else carries over as-is.

---

## Migration 1: UI Components (High Complexity)

### Ant Design 5.27 + Styled Components 6.1 + Tailwind CSS --> shadcn/ui + Tailwind CSS 4

**Rationale**: The current codebase has a three-way styling split -- Ant Design component library, Styled Components CSS-in-JS, and Tailwind CSS utilities -- creating inconsistency and bloat. Consolidating to shadcn/ui (Radix primitives with full ownership) + Tailwind CSS 4 eliminates two dependencies and unifies styling into a single system.

### Scale of Change

- **488 Ant Design imports** across the renderer codebase
- **290 Styled Components usages** (`styled()` calls, `css` template literals)
- **Mixed Tailwind CSS** usage already present (will become the sole styling approach)
- Every renderer feature is affected

### Component Mapping

| Ant Design | shadcn/ui Equivalent | Notes |
|------------|---------------------|-------|
| `<Button type="primary">` | `<Button variant="default">` | Variant names differ |
| `<Modal>` | `<Dialog>` | Radix Dialog primitive |
| `<Drawer>` | `<Sheet>` | Side panel pattern |
| `<Select>` | `<Select>` | Radix-based, different API |
| `<Input>` | `<Input>` | Simpler, unstyled base |
| `<Input.TextArea>` | `<Textarea>` | Separate component |
| `<Form>` / `<Form.Item>` | React Hook Form + `<Form>` | Need Zod schema validation |
| `<Table>` | `<Table>` + TanStack Table | See risk note below |
| `<Tabs>` | `<Tabs>` | Radix Tabs |
| `<Dropdown>` | `<DropdownMenu>` | Radix DropdownMenu |
| `<Menu>` | `<NavigationMenu>` or custom | Context-dependent |
| `<Tooltip>` | `<Tooltip>` | Radix Tooltip |
| `<Popover>` | `<Popover>` | Radix Popover |
| `<message.success()>` | `toast()` (Sonner) | Imperative notification |
| `<notification>` | `toast()` (Sonner) | Consolidated with messages |
| `<Switch>` | `<Switch>` | Radix Switch |
| `<Checkbox>` | `<Checkbox>` | Radix Checkbox |
| `<Slider>` | `<Slider>` | Radix Slider |
| `<Avatar>` | `<Avatar>` | Direct equivalent |
| `<Badge>` | `<Badge>` | Direct equivalent |
| `<Tag>` | `<Badge variant="outline">` | Closest equivalent |
| `<Collapse>` / `<Collapse.Panel>` | `<Accordion>` | Radix Accordion |
| `<Tree>` | Custom implementation | No shadcn equivalent |
| `<TreeSelect>` | Custom implementation | No shadcn equivalent |
| `<DatePicker>` | Custom (react-day-picker) | No built-in shadcn equivalent |
| `<Spin>` | `<Skeleton>` or custom spinner | Different loading pattern |
| `<Segmented>` | `<ToggleGroup>` | Closest equivalent |
| `<Divider>` | `<Separator>` | Radix Separator |
| `<Empty>` | Custom empty state | No direct equivalent |

### Styled Components Migration

All `styled()` calls and `css` template literals are replaced with Tailwind CSS 4 utility classes:

- **Static styles**: `styled.div` with fixed styles --> `className="..."` with Tailwind utilities
- **Dynamic styles**: `styled.div<{ $active: boolean }>` --> `cn()` helper with conditional classes or CSS variables
- **Theme access**: `${({ theme }) => theme.colors.primary}` --> Tailwind CSS variables (`var(--primary)`, `text-primary`)
- **Global styles**: Styled Components `createGlobalStyle` --> Tailwind CSS `@layer base` in global CSS

### Theme System Migration

- **Current**: Ant Design CSS-in-JS theme tokens configured via `<ConfigProvider theme={...}>`
- **New**: Tailwind CSS 4 theme variables defined in `app.css` using `@theme` directive
- Dark/light mode: Ant Design `algorithm: theme.darkAlgorithm` --> `.dark` class on root element with CSS variable overrides
- Custom color tokens map to CSS custom properties consumed by both Tailwind utilities and shadcn/ui components

### Key Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Ant Design Table has built-in sorting, filtering, pagination, virtual scrolling | High | Use TanStack Table for data logic + shadcn Table for presentation. Build sorting/filtering/pagination as composable pieces. |
| Ant Design Form has built-in field validation, error display, layout | High | Adopt React Hook Form + Zod. Build `<FormField>` wrapper that composes shadcn form primitives. |
| Ant Design Tree/TreeSelect has no shadcn equivalent | Medium | Build custom tree component using Radix primitives or a headless tree library. |
| Styled Components dynamic theming used extensively | Medium | Map all dynamic theme values to CSS variables. Use `cn()` for conditional styling. |
| 488 imports is a large surface area | High | Migrate feature-by-feature, not component-by-component. Each feature spec owns its UI migration. |

---

## Migration 2: State Management (Medium Complexity)

### Redux Toolkit 2.2 + Redux Persist 6.0 --> Zustand + persist middleware

**Rationale**: Zustand eliminates Redux boilerplate (actions, reducers, slices, dispatch, selectors). Cherry Studio's Redux usage is standard CRUD state with async thunks -- a pattern where Zustand excels with less code.

### Pattern Mapping

| Redux Toolkit Pattern | Zustand Equivalent |
|----------------------|-------------------|
| `createSlice({ name, initialState, reducers })` | `create((set, get) => ({ ...initialState, actions }))` |
| `slice.actions.setFoo(value)` | `store.getState().setFoo(value)` or via hook |
| `useSelector(state => state.slice.field)` | `useStore(state => state.field)` |
| `useDispatch() + dispatch(action)` | Direct function call from store |
| `createAsyncThunk('name', async (arg) => ...)` | Async function in store: `async fetchFoo() { set({ loading: true }); ... }` |
| `EntityAdapter` (normalized CRUD) | Manual normalized state or custom `createEntityStore()` utility |
| `createSelector` (memoized selectors) | Zustand `useShallow` or manual `useMemo` |
| `configureStore({ middleware })` | `create(devtools(persist(subscribeWithSelector(...))))` |
| Redux DevTools | `devtools()` middleware (built-in) |
| `redux-persist` with `localStorage` | `persist()` middleware with `localStorage` |
| `redux-persist` migrations (v1..v199) | `persist({ migrate: (state, version) => ... })` |
| `combineReducers` (multiple slices in one store) | Separate Zustand stores per domain (recommended) or `slice` pattern |

### Migration Strategy

Each Redux slice becomes an independent Zustand store:

```
Redux: store/slices/chatSlice.ts     -->  Zustand: stores/chatStore.ts
Redux: store/slices/settingsSlice.ts -->  Zustand: stores/settingsStore.ts
Redux: store/slices/llmSlice.ts      -->  Zustand: stores/providerStore.ts
```

### Cross-Window Sync

- **Current**: Custom `StoreSyncService` using Redux middleware to broadcast state changes across Electron windows
- **New**: BroadcastChannel-based Zustand middleware. Zustand's `subscribe()` makes this simpler than Redux middleware -- subscribe to changes, broadcast via `BroadcastChannel`, apply incoming changes with `set()`.

### Persistence Migration

- **Current**: Redux Persist with 199 versioned migrations in `store/migrations/`
- **New**: Zustand `persist` middleware with a one-time migration loader
- Strategy: On first launch with new stack, read existing Redux Persist localStorage data, transform it into Zustand persist format, and write it back. Subsequent runs use Zustand's native `migrate` option for any future schema changes.

### Key Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| 199 Redux Persist migrations not directly portable | High | Implement a one-time migration bridge that reads the final Redux Persist state (already at v199) and maps it to Zustand initial state. No need to replay all 199 migrations. |
| EntityAdapter normalized patterns used in multiple slices | Medium | Build a reusable `createEntityStore()` helper that provides `addOne`, `updateOne`, `removeOne`, `selectAll`, `selectById` on top of Zustand. |
| Cross-window sync complexity | Medium | BroadcastChannel API is simpler than Redux middleware. Implement as a reusable Zustand middleware: `syncMiddleware(storeName)`. |
| Component-level `useSelector` replaced everywhere | Medium | Mechanical replacement: `useSelector(s => s.chat.messages)` --> `useChatStore(s => s.messages)`. Grep-and-replace friendly. |

---

## Patterns That Transfer Directly

These patterns are framework-agnostic and carry over without changes:

- **TypeScript types and interfaces** -- all domain types (`Message`, `Topic`, `Provider`, `Model`, etc.) are plain TS
- **Business logic in services** -- AI pipeline, MCP protocol, backup/sync, embedding -- all in main process or pure functions
- **Electron IPC architecture** -- main/preload/renderer separation, channel definitions, handler registration
- **Database schemas** -- Dexie table definitions (client), Drizzle schema (server) unchanged
- **TipTap editor extensions** -- custom extensions, node views, plugin logic
- **AI SDK integration patterns** -- provider initialization, streaming, tool calling
- **CodeMirror 6 extensions** -- editor state, view plugins, keymaps
- **Test logic** -- Vitest assertions, Playwright page objects, test fixtures
- **i18n translation keys** -- all `t('key')` calls and JSON translation files
- **Winston + OTel logging** -- logger setup, span creation, context propagation

## Patterns Requiring Rethinking

These patterns are tightly coupled to the current stack and need redesign:

- **All Ant Design component usage** --> shadcn/ui equivalents (different APIs, composition patterns, prop names)
- **Redux `connect()` / `useSelector` / `useDispatch`** --> Zustand `useStore` hooks (different mental model)
- **Styled Components theme provider** --> Tailwind CSS theme variables (CSS custom properties instead of JS theme object)
- **Redux middleware** (logging, sync, persistence) --> Zustand middleware (composable function wrappers)
- **Ant Design Form validation** --> React Hook Form + Zod (declarative schema validation instead of Ant Design rules)
- **Ant Design `message` / `notification` imperative API** --> Sonner toast (different invocation pattern)

---

## Per-Feature Migration Notes

| Feature | UI Components Impact | State Management Impact | Key Consideration |
|---------|---------------------|------------------------|-------------------|
| F01-app-core | Medium -- shell layout, navigation, window chrome | High -- set up Zustand persist infrastructure, cross-window sync middleware | Foundation feature: establish shadcn/ui theme system and Zustand store patterns here first. All other features inherit these patterns. |
| F02-ai-provider | Medium -- provider configuration forms, model selection dropdowns | Medium -- provider/model slice --> Zustand store | Ant Design Form with dynamic fields --> React Hook Form. Provider list uses Table --> TanStack Table. |
| F03-chat | High -- largest UI surface: message list, input bar, message blocks, attachments, context menu | High -- largest Redux slice: messages, topics, streaming state | Most complex migration. Message bubbles use Styled Components extensively. Throttled state updates need Zustand equivalent. Virtual scrolling for message list. |
| F04-editor | Low -- TipTap toolbar, editor chrome | Low -- editor state is mostly TipTap-internal | TipTap toolbar buttons: Ant Design --> shadcn/ui. Bubble menu styling: Styled Components --> Tailwind. |
| F05-auth | Low -- login/registration forms | Low -- auth state is simple | Ant Design Form --> React Hook Form + shadcn. Small surface area. |
| F06-mcp | Medium -- MCP server management UI, tool permission modals | Low -- MCP state is service-driven | Ant Design Modal --> shadcn Dialog for tool permissions. Server list Table --> TanStack Table. |
| F07-knowledge | Medium -- knowledge base management, document upload, search UI | Medium -- knowledge base slice --> Zustand store | File upload UI, document list, embedding status indicators need shadcn equivalents. |
| F08-file-management | Low -- file browser, export dialogs | Low -- file state is transient | Ant Design Tree (file browser) --> custom tree component. Export Modal --> shadcn Dialog. |
| F09-settings-ui | High -- extensive settings forms, theme configuration, all preference panels | High -- settings slice has the most fields and migrations | Largest form surface. Every Ant Design form control (Switch, Select, Input, Slider, ColorPicker) needs shadcn equivalent. Theme preview needs CSS variable integration. |
| F10-agent | Medium -- agent configuration UI, tool selection, workflow builder | Medium -- agent slice --> Zustand store | Agent builder UI uses complex Ant Design components. Workflow visualization may need custom components. |
| F11-memory | Low -- memory display, search | Low -- small state surface | Simple UI migration. Memory list and search bar. |
| F12-extensions | Medium -- extension marketplace UI, extension settings | Low -- extension registry state | Extension cards, install/uninstall actions. Marketplace listing UI. |

---

## Migration Sequencing Recommendation

1. **Foundation** (in F01-app-core): Set up shadcn/ui, Tailwind CSS 4 theme, Zustand store infrastructure, persist middleware, cross-window sync middleware
2. **Feature-by-feature**: Each feature migrates its own UI and state as part of its implementation spec
3. **No parallel stack period**: New features are built exclusively with the new stack -- no Ant Design or Redux in new code
4. **Validation**: Each feature's demo verifies the migrated UI and state management work correctly

---

**Version**: 0.1.0 | **Generated**: 2026-03-07
