# Stack Migration Plan — Angdu Studio

> Generated from reverse-spec analysis of Cherry Studio source code.
> Date: 2026-03-15
> Source: Cherry Studio → Angdu Studio

---

## 1. Migration Overview

Angdu Studio is a ground-up rebuild, not a fork. "Migration" here means: understanding how Cherry Studio uses each technology, then re-implementing with the new stack to preserve the same behavior and architecture patterns.

### Migration Complexity Rating

| Rating | Meaning |
|--------|---------|
| **None** | Same technology, same or newer version. No behavioral change. |
| **Low** | Driver/adapter swap. Same ORM, same patterns, different underlying engine. |
| **Medium** | Different library, same paradigm. Concepts map 1:1 but APIs differ significantly. |
| **High** | Different library, different paradigm. Requires rethinking component structure and patterns. |

---

## 2. Technology Migration Map

### 2.1 Language — TypeScript 5.8 → TypeScript 5.8+

| Aspect | Detail |
|--------|--------|
| **Current** | TypeScript 5.8, strict mode |
| **New** | TypeScript 5.8+ (latest stable), strict mode |
| **Complexity** | None |
| **Migration Rationale** | No change needed. TypeScript strict mode is retained. Minor version bumps are backward compatible. |

**Impact on Features**: None. All features use TypeScript identically.

**Risks**: None.

---

### 2.2 Desktop Framework — Electron 40 → Electron latest

| Aspect | Detail |
|--------|--------|
| **Current** | Electron v40 |
| **New** | Electron latest stable (v40+) |
| **Complexity** | None |
| **Migration Rationale** | Stay on latest stable for security patches and Chromium updates. No breaking API changes expected within the v40+ line. |

**Impact on Features**: None. All features use standard Electron APIs (BrowserWindow, contextBridge, ipcMain/ipcRenderer) that are stable.

**Risks**:
| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Deprecated API warnings | Low | Address during initial scaffold; Electron provides clear deprecation notices |
| Native module compatibility | Low | Rebuild native modules against new Electron headers via electron-rebuild |

---

### 2.3 UI Framework — React 19 → React 19

| Aspect | Detail |
|--------|--------|
| **Current** | React 19 with concurrent features |
| **New** | React 19 (same) |
| **Complexity** | None |
| **Migration Rationale** | No change. React 19 concurrent features (useTransition, Suspense) are essential for streaming UI and retained as-is. |

**Impact on Features**: None.

**Risks**: None.

---

### 2.4 Build Tool — electron-vite 5 → electron-vite latest

| Aspect | Detail |
|--------|--------|
| **Current** | electron-vite 5 |
| **New** | electron-vite latest |
| **Complexity** | None |
| **Migration Rationale** | Same tool, latest version. Provides better Vite 6+ integration, faster HMR, improved chunk splitting. |

**Impact on Features**: None directly. Build performance improvements benefit all features equally.

**Risks**: None.

---

### 2.5 State Management — Redux Toolkit + Persist → Zustand + Persist Middleware

| Aspect | Detail |
|--------|--------|
| **Current** | Redux Toolkit with createSlice, createAsyncThunk, Redux Persist |
| **New** | Zustand with persist middleware, devtools middleware |
| **Complexity** | **Medium** |
| **Migration Rationale** | Zustand eliminates boilerplate (no action types, no reducers, no dispatch). Bundle size is ~1KB vs ~12KB. API is simpler for the common case while supporting advanced patterns via middleware. Zustand's subscribe model integrates naturally with React concurrent rendering. |

#### Concept Mapping

| Redux Toolkit Concept | Zustand Equivalent | Notes |
|-----------------------|-------------------|-------|
| `createSlice` | `create()` store | Each slice becomes an independent Zustand store |
| `slice.actions` | Store action functions | Actions are plain functions in the store, not auto-generated |
| `slice.reducer` | Direct state mutation via `set()` | Zustand uses immer middleware for immutable updates if desired |
| `createAsyncThunk` | Async action functions | Just async functions that call `set()` when done |
| `useSelector(selectX)` | `useStore(selectX)` | Identical selector pattern, Zustand has built-in shallow compare |
| `useDispatch` + `dispatch(action())` | `useStore.getState().action()` | Direct function call, no dispatch indirection |
| `configureStore` with middleware | `create()` with middleware composition | `persist()`, `devtools()`, `immer()` composed via pipe |
| Redux Persist (storage, transforms) | Zustand `persist` middleware | Built-in, supports custom storage engines and migrations |
| `combineReducers` | Multiple independent stores | Zustand prefers multiple stores over one monolith |
| Redux DevTools integration | `devtools()` middleware | Same browser extension, automatic integration |

#### Migration Strategy per Store Domain

| Domain Store | Current (Redux Slice) | New (Zustand Store) | Key Changes |
|-------------|----------------------|--------------------|----|
| Chat | `chatSlice` — conversations, active conversation, message drafts | `useChatStore` | Messages managed via SQLite queries + local cache; active state in Zustand |
| Settings | `settingsSlice` — user preferences, app config | `useSettingsStore` | Direct persist to SQLite via IPC on change |
| Providers | `providerSlice` — provider configs, API keys | `useProviderStore` | Sensitive data (API keys) encrypted before persist |
| Models | `modelSlice` — available models per provider | `useModelStore` | Cached model lists with TTL-based refresh |
| Assistants | `assistantSlice` — assistant configs, system prompts | `useAssistantStore` | Versioned prompts (new feature, not in source) |
| UI | `uiSlice` — sidebar state, theme, layout | `useUIStore` | Persist subset (theme, layout); transient state not persisted |
| Knowledge | `knowledgeSlice` — knowledge bases, embedding status | `useKnowledgeStore` | Heavy operations dispatched to main process via IPC |

#### Persist Migration

| Aspect | Redux Persist | Zustand Persist | Change |
|--------|--------------|-----------------|--------|
| Storage engine | Custom (localStorage + IndexedDB) | Custom (same engines via `createJSONStorage`) | Adapter interface changes |
| State versioning | `version` + `migrate` function | `version` + `migrate` function | Identical concept |
| Partial persist | `whitelist` / `blacklist` | `partialize` function | More flexible — function-based filtering |
| Rehydration | Automatic on store creation | Automatic via `onRehydrateStorage` callback | Identical behavior |
| Merge strategy | `autoMergeLevel2` | Custom `merge` function | More control, must implement manually |

**Impact on Features**:

| Feature | Impact | Detail |
|---------|--------|--------|
| F001: Shell & Navigation | Low | Sidebar state, theme persistence — simple store swap |
| F002: Provider Management | Low | Provider CRUD — straightforward store migration |
| F003: Model Management | Low | Model list caching — straightforward store migration |
| F004: Agent/Assistant System | Medium | Complex assistant state with nested configs — needs careful store design |
| F005: Conversation Engine | Medium | Active conversation state, message streaming state — core UX path |
| F006: Message Composition | Low | Draft state, attachment state — simple store |
| F007: Message Display | Low | Rendering preferences — simple store |
| F008: Topic Management | Low | Topic list, active topic — simple store |
| F009: Knowledge Base | Medium | Embedding job state, progress tracking — async state patterns change |
| F010: Settings | Low | Direct key-value persist — simplest migration |
| F011: Data Management | Low | Backup/restore state — simple store |
| F012: Mini Programs & Web | Low | Tab state — simple store |

**Risks and Mitigations**:

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Selector performance regression | Low | Medium | Zustand's built-in `shallow` equality check matches Redux's `shallowEqual`. Profile selectors in hot paths (message list, streaming). |
| Persist migration bugs | Medium | High | Write migration tests that verify state shape transformation. Test rehydration from empty, partial, and full state. |
| Devtools integration gaps | Low | Low | Zustand devtools middleware supports Redux DevTools extension. Verify time-travel debugging works. |
| Store isolation causing sync issues | Medium | Medium | Identify cross-store dependencies early. Use Zustand's `subscribe` for inter-store reactions where needed. |

---

### 2.6 UI Library — Ant Design 5 + Styled Components → shadcn/ui + Tailwind CSS 4

| Aspect | Detail |
|--------|--------|
| **Current** | Ant Design 5 (component library) + Styled Components (CSS-in-JS) |
| **New** | shadcn/ui (component primitives) + Tailwind CSS 4 (utility-first CSS) |
| **Complexity** | **High** |
| **Migration Rationale** | Ant Design is opinionated and heavy (~1MB). Customization requires fighting the library's design system. shadcn/ui provides unstyled, accessible primitives that you own (copied into project, not imported from node_modules). Tailwind CSS 4 eliminates CSS-in-JS runtime overhead, provides design tokens via CSS variables, and enables consistent styling without naming conventions. Styled Components adds ~12KB runtime and creates style injection overhead during streaming updates. |

#### Concept Mapping

| Ant Design + Styled Components | shadcn/ui + Tailwind CSS 4 | Notes |
|-------------------------------|---------------------------|-------|
| `<Button type="primary">` | `<Button variant="default">` | shadcn/ui Button with Tailwind variants |
| `<Input>`, `<Input.TextArea>` | `<Input>`, `<Textarea>` | Separate components, not compound |
| `<Select>` with `<Option>` | `<Select>` + `<SelectContent>` + `<SelectItem>` | Radix-based, more composable, fully accessible |
| `<Modal>` | `<Dialog>` | Radix Dialog primitive, portal-based |
| `<Drawer>` | `<Sheet>` | Side panel equivalent |
| `<Tabs>` | `<Tabs>` | Nearly identical API |
| `<Dropdown>` + `<Menu>` | `<DropdownMenu>` | Radix-based, keyboard navigable |
| `<Tooltip>` | `<Tooltip>` | Radix Tooltip with Tailwind styling |
| `<message.success()>` (imperative) | `<Toaster>` + `toast()` (sonner) | Different pattern: component + imperative API |
| `<Popconfirm>` | `<AlertDialog>` | Accessible confirmation dialog |
| `<Table>` | `<Table>` or TanStack Table | shadcn/ui Table for simple, TanStack for complex |
| `<Form>` + `<Form.Item>` | React Hook Form + shadcn/ui `<Form>` | Form library changes from Ant Form to RHF |
| `<Layout>` + `<Sider>` | Custom layout with Tailwind flex/grid | No equivalent — build with utilities |
| `<Spin>` | `<Skeleton>` or custom spinner | Different loading pattern philosophy |
| `styled.div\`...\`` | `className="..."` with Tailwind | No runtime CSS-in-JS; all utility classes |
| `ThemeProvider` | CSS variables + `dark:` variant | Tailwind 4 native dark mode via CSS |
| `theme.token.colorPrimary` | `hsl(var(--primary))` | Design tokens as CSS custom properties |

#### Tailwind CSS 4 Specifics

Tailwind CSS 4 introduces significant changes from v3:

| Aspect | Tailwind 3 | Tailwind 4 | Impact |
|--------|-----------|-----------|--------|
| Configuration | `tailwind.config.js` | CSS-based `@theme` directive | Config lives in CSS, not JS |
| Theme values | `theme.extend.colors` in JS | `@theme { --color-*: ... }` in CSS | More intuitive, CSS-native |
| Dark mode | `darkMode: 'class'` config | Built-in `dark:` variant, auto | No configuration needed |
| Content detection | `content: ['./src/**/*.tsx']` | Automatic detection | Zero config for standard setups |
| Custom utilities | `@layer utilities { }` | `@utility name { }` | New directive syntax |
| Plugins | JS plugin API | CSS-based `@plugin` | Simpler plugin authoring |

#### Migration Strategy by Component Category

**Layout Components** (Highest impact):

| Cherry Studio Component | Pattern | Angdu Studio Approach |
|------------------------|---------|----------------------|
| App Shell (Layout + Sider) | Ant Design `<Layout>` with styled wrappers | Tailwind flex layout: `flex h-screen` with resizable sidebar |
| Navigation sidebar | Styled `<Menu>` | shadcn/ui `<NavigationMenu>` or custom with Tailwind |
| Content panels | `<Layout.Content>` with styled divs | Tailwind `flex-1 overflow-auto` containers |
| Resizable panels | Custom styled dividers | `react-resizable-panels` (shadcn/ui compatible) |

**Form Components** (Medium impact):

| Cherry Studio Component | Pattern | Angdu Studio Approach |
|------------------------|---------|----------------------|
| Settings forms | Ant Design `<Form>` + `<Form.Item>` | React Hook Form + shadcn/ui Form components + Zod validation |
| Provider config | `<Input>` + `<Select>` + `<Switch>` | shadcn/ui equivalents with Tailwind spacing |
| Model parameters | `<Slider>` + `<InputNumber>` | shadcn/ui `<Slider>` + `<Input type="number">` |

**Chat Components** (Critical path — must support streaming):

| Cherry Studio Component | Pattern | Angdu Studio Approach |
|------------------------|---------|----------------------|
| Message bubbles | Styled divs with conditional classes | Tailwind utility classes with `cn()` helper for conditionals |
| Code blocks | Custom styled `<pre>` + syntax highlighter | Tailwind `prose` for markdown + Shiki for syntax highlighting |
| Thinking blocks | Styled collapsible sections | shadcn/ui `<Collapsible>` with Tailwind transitions |
| Streaming indicators | Styled animated dots/cursor | Tailwind `animate-pulse` or custom `@keyframes` |
| Input area | Styled `<Input.TextArea>` with toolbar | Custom textarea with Tailwind + shadcn/ui toolbar buttons |

**Feedback Components** (Low impact):

| Cherry Studio Component | Pattern | Angdu Studio Approach |
|------------------------|---------|----------------------|
| Toast notifications | `message.success/error()` | Sonner (`toast()`) integrated with shadcn/ui |
| Confirmation dialogs | `<Modal.confirm()>` | shadcn/ui `<AlertDialog>` |
| Loading states | `<Spin>` wrapper | shadcn/ui `<Skeleton>` for content, spinner for actions |
| Empty states | Custom styled empty views | Tailwind-styled empty state components |

**Impact on Features**:

| Feature | Impact | Detail |
|---------|--------|--------|
| F001: Shell & Navigation | **High** | Entire app shell rebuilt. Layout, sidebar, navigation, titlebar — all new components. |
| F002: Provider Management | Medium | Settings forms rebuilt with RHF + shadcn/ui. Mostly form components. |
| F003: Model Management | Medium | Model selection UI, parameter controls — form-heavy. |
| F004: Agent/Assistant System | Medium | Assistant editor forms, prompt input areas. |
| F005: Conversation Engine | **High** | Message rendering is the core UI. Every message component rebuilt. Streaming must work flawlessly. |
| F006: Message Composition | **High** | Input area, toolbar, attachment UI — most interactive component. |
| F007: Message Display | **High** | Markdown rendering, code blocks, thinking blocks, tool call display — complex rendering. |
| F008: Topic Management | Medium | Topic list, topic actions — mostly list UI. |
| F009: Knowledge Base | Medium | File upload, indexing progress, search UI. |
| F010: Settings | Medium | Settings panels — form-heavy pages. |
| F011: Data Management | Low | Import/export dialogs, backup UI — simple. |
| F012: Mini Programs & Web | Medium | Tab-based browser UI, webview integration. |

**Risks and Mitigations**:

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Streaming performance regression | Medium | Critical | Profile message rendering under streaming load early. Tailwind's static classes should outperform styled-components' runtime injection, but verify. |
| Accessibility regression | Medium | High | Ant Design has built-in ARIA. shadcn/ui (Radix-based) also has excellent accessibility. Verify with screen reader testing. |
| Design inconsistency | High | Medium | Define design tokens (colors, spacing, radii) in Tailwind theme before building any components. Create a token reference page. |
| Component velocity decrease | Medium | Medium | shadcn/ui requires more assembly than Ant Design's batteries-included approach. Mitigate by building a project component library on top of shadcn/ui primitives early. |
| Dark mode parity | Low | Medium | Tailwind 4 dark mode is simpler than Ant Design's theme system. Define both themes in CSS variables from the start. |
| Missing Ant Design equivalents | Medium | Medium | Some Ant Design components (Transfer, TreeSelect, Cascader) have no shadcn/ui equivalent. Evaluate per-feature whether these are needed; if so, build custom or find Radix-compatible alternatives. |

---

### 2.7 Database — Drizzle + LibSQL → Drizzle + better-sqlite3

| Aspect | Detail |
|--------|--------|
| **Current** | Drizzle ORM with LibSQL (SQLite-compatible, Turso-backed) |
| **New** | Drizzle ORM with better-sqlite3 (native SQLite binding) |
| **Complexity** | **Low** |
| **Migration Rationale** | LibSQL adds complexity for a feature (Turso cloud sync) that Angdu Studio does not need in its core scope. better-sqlite3 is the most popular Node.js SQLite binding — synchronous API, zero network dependency, excellent performance, widely battle-tested. Drizzle ORM supports both drivers, so the schema and query layer remain identical. |

#### Concept Mapping

| Drizzle + LibSQL | Drizzle + better-sqlite3 | Notes |
|-----------------|-------------------------|-------|
| `drizzle(createClient({url}))` | `drizzle(new Database(path))` | Driver initialization differs |
| Async queries (`await db.select()`) | Sync-capable queries | better-sqlite3 is synchronous by default; Drizzle wraps it |
| `@libsql/client` | `better-sqlite3` | Different npm package |
| Network-capable (Turso) | Local-only | Simpler; no network configuration |
| WAL mode support | WAL mode support | Both support Write-Ahead Logging |
| `libsql` migrations | Standard SQLite migrations | Drizzle Kit handles both identically |

#### Schema Compatibility

Drizzle ORM's schema definition is driver-agnostic for SQLite:

```typescript
// This schema works identically with both LibSQL and better-sqlite3
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const conversations = sqliteTable('conversations', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  // ...
});
```

The only change is the driver initialization in the database setup module.

#### Migration Steps

1. Replace `@libsql/client` with `better-sqlite3` in dependencies.
2. Update the database initialization module to use `better-sqlite3` driver.
3. Verify all Drizzle migrations run against better-sqlite3.
4. Verify WAL mode is enabled for concurrent read performance.
5. Test database file portability (import old SQLite databases).

**Impact on Features**:

| Feature | Impact | Detail |
|---------|--------|--------|
| All features | Negligible | Drizzle ORM abstracts the driver. Query code is identical. Only the initialization module changes. |

**Risks and Mitigations**:

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Native module build failures | Medium | High | better-sqlite3 requires native compilation. Use `electron-rebuild` in postinstall. Test on all target platforms (macOS, Windows, Linux). |
| Sync vs async API confusion | Low | Low | Drizzle normalizes the API. Application code remains the same regardless of driver. |
| Database file locking on Windows | Low | Medium | Enable WAL mode. Test concurrent access patterns (main process writes while renderer reads via IPC). |

---

### 2.8 AI SDK — Vercel AI SDK 6 → Vercel AI SDK latest

| Aspect | Detail |
|--------|--------|
| **Current** | Vercel AI SDK 6 (ai package) |
| **New** | Vercel AI SDK latest |
| **Complexity** | None |
| **Migration Rationale** | Same library, latest version. The Vercel AI SDK is a core dependency for the provider abstraction layer. Staying current ensures access to new provider integrations and streaming improvements. |

**Impact on Features**: None. The `@angdu/ai-core` package wraps the SDK; internal API changes are absorbed by the wrapper.

**Risks**:
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Breaking changes in major version bump | Low | Medium | Pin to a specific version. Upgrade intentionally with testing. The `@angdu/ai-core` wrapper isolates the application from SDK API changes. |

---

### 2.9 Rich Text Editor — TipTap 3 → TipTap 3

| Aspect | Detail |
|--------|--------|
| **Current** | TipTap 3 (ProseMirror-based editor) |
| **New** | TipTap 3 (same) |
| **Complexity** | None |
| **Migration Rationale** | No change. TipTap is used for rich text input in the message composer. The editor itself is framework-agnostic and unaffected by the UI library migration. |

**Impact on Features**: None. TipTap renders its own DOM and is styled independently.

**Risks**: None.

---

### 2.10 Testing — Vitest + Playwright → Vitest + Playwright

| Aspect | Detail |
|--------|--------|
| **Current** | Vitest (unit/integration) + Playwright (e2e) |
| **New** | Vitest + Playwright (same) |
| **Complexity** | None |
| **Migration Rationale** | No change. Testing tools are independent of the application stack. Test code will be written fresh for Angdu Studio since this is a rebuild. |

**Impact on Features**: None.

**Risks**: None.

---

## 3. Migration Dependency Order

Some migrations are interdependent. This is the recommended order:

```
Phase 1: Foundation (no dependencies)
├── TypeScript 5.8+ (no change)
├── Electron latest (no change)
├── React 19 (no change)
├── electron-vite latest (no change)
├── Vitest + Playwright (no change)
└── TipTap 3 (no change)

Phase 2: Data Layer (depends on Electron)
├── better-sqlite3 + Drizzle (driver swap)
└── Vercel AI SDK latest (no change)

Phase 3: State Layer (depends on Data Layer)
└── Zustand + Persist (replaces Redux Toolkit)
    - Stores must be designed to work with better-sqlite3 via IPC
    - Persist middleware configured for dual storage (SQLite + IndexedDB)

Phase 4: UI Layer (depends on State Layer)
└── shadcn/ui + Tailwind CSS 4 (replaces Ant Design + Styled Components)
    - Components consume Zustand stores
    - Layout system rebuilt from scratch
    - Design tokens defined in Tailwind theme
```

---

## 4. Migration Risk Summary

| Change | Complexity | Biggest Risk | Overall Risk Level |
|--------|-----------|-------------|-------------------|
| TypeScript 5.8+ | None | N/A | Negligible |
| Electron latest | None | Native module compat | Low |
| React 19 | None | N/A | Negligible |
| electron-vite latest | None | N/A | Negligible |
| **Zustand** | **Medium** | Persist migration, cross-store sync | **Medium** |
| **shadcn/ui + Tailwind 4** | **High** | Streaming perf, design consistency, dev velocity | **High** |
| better-sqlite3 | Low | Native build on Windows | Low |
| Vercel AI SDK latest | None | Breaking API changes | Low |
| TipTap 3 | None | N/A | Negligible |
| Vitest + Playwright | None | N/A | Negligible |

**Overall Migration Risk**: **Medium-High**, driven primarily by the UI library change (Ant Design → shadcn/ui + Tailwind 4). This is the highest-effort, highest-risk change and should receive the most architectural attention and early prototyping.

---

## 5. Key Recommendations

1. **Prototype the chat message renderer first** — This is the intersection of the two hardest migrations (Zustand for streaming state + Tailwind for rendering). Build a standalone prototype that streams mock LLM responses through the full pipeline: Zustand store → React concurrent rendering → Tailwind-styled message blocks.

2. **Define design tokens before any UI work** — Create the complete Tailwind 4 theme (colors, spacing, typography, radii, shadows) in CSS before building any components. This prevents ad-hoc styling decisions from creating inconsistency.

3. **Build a component showcase early** — Create an internal Storybook-like page that renders all shadcn/ui components with the Angdu Studio theme. This serves as both a design reference and a regression test surface.

4. **Test better-sqlite3 native builds in CI first** — Set up cross-platform CI (macOS, Windows, Linux) and verify that better-sqlite3 compiles and passes basic tests before writing any database code.

5. **Migrate state stores incrementally** — Do not attempt to design all Zustand stores at once. Start with the simplest (UIStore, SettingsStore) to establish patterns, then tackle complex ones (ChatStore, KnowledgeStore).
