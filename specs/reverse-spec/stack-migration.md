# Stack Migration Guide: Cherry Studio -> Angdu Studio

> This document covers the TWO major technology migrations required.
> All other stack components (Electron, React, TypeScript, Tiptap, Drizzle ORM, Vercel AI SDK, Vitest, Playwright, i18next) remain unchanged.

---

## Migration 1: UI Framework

**Ant Design + Styled Components + Tailwind -> Tailwind CSS 4 + shadcn/ui**

**Risk: HIGH** -- Every UI component must be rewritten. This is the largest migration effort.

**Mitigation:** Use shadcn/ui CLI to scaffold components, migrate page by page.

| Aspect | Current (Cherry) | New (Angdu) | Migration Notes |
|--------|-----------------|-------------|-----------------|
| Component library | antd (40+ components) | shadcn/ui | Replace each AntD component with shadcn equivalent. Many are 1:1 (Button, Input, Select, Modal->Dialog, Table, Tabs). Some need custom (Collapse->Accordion, Drawer->Sheet) |
| Styling | styled-components (sc-* classes) | Tailwind utility classes | Remove all styled() calls, replace with className + Tailwind utilities |
| CSS-in-JS | @ant-design/cssinjs | Tailwind CSS 4 | No CSS-in-JS needed, use Tailwind's built-in layer system |
| Theming | AntD ConfigProvider + CSS variables | Tailwind dark mode + CSS variables | Keep CSS custom properties, integrate with Tailwind theme config |
| Form | antd Form | React Hook Form + Zod | Better TypeScript integration, schema-based validation |
| Icons | @ant-design/icons + lucide-react | lucide-react only | Consolidate to one icon library |

### Key AntD -> shadcn/ui Component Mapping

| AntD Component | shadcn/ui Equivalent | Notes |
|----------------|---------------------|-------|
| Button | Button | 1:1, variant prop differs |
| Input | Input | 1:1 |
| Select | Select | 1:1, API structure differs |
| Modal | Dialog | Rename + API change |
| Drawer | Sheet | Rename + API change |
| Collapse | Accordion | Rename + API change |
| Table | Table | shadcn Table is unstyled, add sorting/pagination manually |
| Tabs | Tabs | 1:1 |
| Switch | Switch | 1:1 |
| Checkbox | Checkbox | 1:1 |
| Tooltip | Tooltip | 1:1 |
| Popover | Popover | 1:1 |
| Dropdown | DropdownMenu | Rename + API change |
| Notification | Toast (sonner) | Different pattern: imperative -> declarative |
| Slider | Slider | 1:1 |
| Avatar | Avatar | 1:1 |
| Badge | Badge | 1:1 |

---

## Migration 2: State Management

**Redux Toolkit + redux-persist -> Zustand + persist**

**Risk: MEDIUM** -- Logic is 1:1 translatable, but 27 slices x tests is significant volume.

**Mitigation:** Migrate slice by slice, starting with independent slices (settings, notes, translate).

| Aspect | Current (Cherry) | New (Angdu) | Migration Notes |
|--------|-----------------|-------------|-----------------|
| Store | 27 Redux slices, central store | Zustand stores (one per domain) | Each slice -> independent Zustand store |
| Persist | redux-persist (localStorage) | zustand/middleware persist | Built-in persist middleware, same localStorage target |
| Cross-window sync | StoreSyncService middleware | Custom Zustand middleware | Replicate sync via BroadcastChannel or IPC |
| Selectors | useSelector + createSelector | Zustand selector functions | Simpler API, no memoization wrappers needed |
| Actions | createSlice reducers + thunks | Store actions (set/get) | Direct state mutations via immer (built-in) |
| DevTools | Redux DevTools | Zustand devtools middleware | Similar DX |

### Zustand Store Grouping Plan

The 27 Redux slices map to domain-scoped Zustand stores:

| Zustand Store | Cherry Slices Absorbed | Feature Owner |
|---------------|----------------------|---------------|
| useSettingsStore | settings | F002 |
| useProviderStore | llm, provider | F003 |
| useAssistantStore | assistants, assistant | F005 |
| useChatStore | messages, blocks, runtime, topics | F006 |
| useKnowledgeStore | knowledge | F007 |
| useMcpStore | mcp | F008 |
| useBackupStore | backup, nutstore | F010 |
| useNotesStore | notes | F011 |
| useTranslateStore | translate | F012 |
| useAppStore | app, shortcuts, ui | F001/F014 |

### Slice Migration Priority

1. **Independent first** (no cross-slice deps): settings, notes, translate
2. **Foundation next**: app, shortcuts, ui
3. **Provider chain**: llm, provider -> assistants
4. **Core flow**: messages, blocks, runtime, topics (most complex, do last)
5. **Support**: knowledge, mcp, backup, nutstore

---

## Kept Technologies (No Migration Needed)

| Technology | Purpose | Version Target |
|------------|---------|---------------|
| Electron | Desktop shell | Latest stable |
| electron-vite | Build tooling | Latest stable |
| TypeScript | Type system | 5.x |
| React | UI framework | 19.x |
| Tiptap | Rich text editor | 2.x |
| Drizzle ORM | Database | Latest stable |
| Vercel AI SDK | AI streaming | Latest stable |
| Vitest | Unit testing | Latest stable |
| Playwright | E2E testing | Latest stable |
| i18next | Internationalization | Latest stable |

---

## Per-Feature Migration Impact

| Feature | UI Impact | State Impact | Notes |
|---------|-----------|--------------|-------|
| F001-app-shell | Low | Low | Mostly Electron APIs, minimal UI |
| F002-settings | High | Medium | Many AntD form components + settings slice |
| F003-provider | Medium | Medium | Provider config forms + llm slice |
| F004-ai-core | None | Low | No UI, stream processing unchanged |
| F005-assistant | Medium | Medium | Assistant forms + assistants slice |
| F006-chat | High | High | Most complex UI + messages/blocks/runtime slices |
| F007-knowledge | Medium | Low | Knowledge management UI + knowledge slice |
| F008-mcp | Medium | Low | MCP server management UI + mcp slice |
| F009-web-search | Low | Low | Small UI surface |
| F010-backup-sync | Medium | Medium | Backup UI + backup/nutstore slices |
| F011-notes | Medium | Low | Tiptap stays, sidebar UI changes |
| F012-translate | Low | Low | Simple split-pane UI |
| F013-agent | Low | Low | API server + minimal UI |
| F014-extras | Medium | Medium | Multiple small UIs + many small slices |

### Total Effort Distribution

- **UI migration** accounts for ~65% of total migration work
- **State migration** accounts for ~25% of total migration work
- **Wiring / integration** accounts for ~10% of total migration work

F006-chat alone represents roughly 30% of the entire migration effort due to the combination of high UI complexity and high state complexity.
