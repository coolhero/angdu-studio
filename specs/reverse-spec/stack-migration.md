# Stack Migration Map — Angdu Studio

> Current -> New mapping for each technology with migration rationale.

---

## Overview

| Category | Current (Cherry Studio) | New (Angdu Studio) | Action |
|----------|------------------------|-------------------|--------|
| Language | TypeScript 5.8.3 | TypeScript 5.x (latest) | Keep |
| Runtime | Electron 40 | Electron (latest) | Keep |
| UI Framework | React 19 | React 19 | Keep |
| UI Library | Ant Design 5 | shadcn/ui + Radix UI | Replace |
| CSS | Tailwind CSS + Styled Components | Tailwind CSS 4 only | Simplify |
| State Management | Redux Toolkit + React Query | Zustand + TanStack Query | Replace |
| Client DB | Dexie (IndexedDB) | — (removed) | Remove |
| Server DB | SQLite via Drizzle | SQLite via Drizzle (unified) | Expand |
| AI SDK | Vercel AI SDK 6 | Vercel AI SDK (latest) | Keep |
| Rich Text | TipTap + CodeMirror | TipTap + CodeMirror | Keep |
| Build Tool | electron-vite | electron-vite | Keep |
| Testing | Vitest + Playwright | Vitest + Playwright | Keep |
| i18n | i18next | i18next | Keep |
| Markdown | rehype/remark + KaTeX/MathJax | rehype/remark + KaTeX/MathJax | Keep |
| Icons | Ant Design Icons + Lucide | Lucide only | Simplify |

---

## Detailed Migration Notes

### 1. UI Library: Ant Design 5 -> shadcn/ui

**Rationale**: Ant Design is heavy (large bundle), opinionated styling, and fights with Tailwind. shadcn/ui provides unstyled Radix primitives with Tailwind, giving full control over design tokens.

**Impact**: Every UI component must be rebuilt. This is the highest-effort migration.

**Strategy**:
- Install shadcn/ui CLI and init with project config
- Replace components bottom-up (Button, Input first -> complex layouts last)
- Map Ant Design tokens to CSS custom properties
- Delete all `antd` and `@ant-design/icons` imports

**Key Mappings**:

| Ant Design | shadcn/ui | Notes |
|------------|----------|-------|
| `<Button>` | `<Button>` | variant prop instead of type |
| `<Input>` / `<Input.TextArea>` | `<Input>` / `<Textarea>` | |
| `<Select>` | `<Select>` | Radix-based, accessible |
| `<Modal>` | `<Dialog>` | Controlled by default |
| `<Drawer>` | `<Sheet>` | Side panel |
| `<Tabs>` | `<Tabs>` | |
| `<Dropdown>` | `<DropdownMenu>` | |
| `<Popover>` | `<Popover>` | |
| `<Tooltip>` | `<Tooltip>` | |
| `<Switch>` | `<Switch>` | |
| `<Checkbox>` | `<Checkbox>` | |
| `<Slider>` | `<Slider>` | |
| `<message.success()>` | `toast.success()` (sonner) | |
| `<notification>` | `toast()` (sonner) | |
| `<Spin>` | Custom spinner or `<Loader>` | |
| `<Table>` | TanStack Table + custom | |
| `<Form>` / `<Form.Item>` | react-hook-form + zod | |
| `<Layout>` / `<Sider>` | Tailwind flex/grid | No component needed |
| `<Tree>` | Custom implementation | No built-in |
| `<Tag>` | `<Badge>` | |
| `<Avatar>` | `<Avatar>` | |
| `<Card>` | `<Card>` | |
| `<Collapse>` | `<Accordion>` | |
| `<Empty>` | Custom component | |

### 2. CSS: Tailwind + Styled Components -> Tailwind CSS 4 Only

**Rationale**: Styled Components adds runtime CSS-in-JS overhead and conflicts with Tailwind. Tailwind 4 has built-in CSS-first config.

**Strategy**:
- Remove all `styled()` calls and styled-components imports
- Convert styled component styles to Tailwind classes
- Use `cn()` utility (clsx + tailwind-merge) for conditional classes
- CSS custom properties for theme tokens

### 3. State: Redux Toolkit -> Zustand

**Rationale**: Redux is verbose for this app's needs. Cherry Studio's Redux stores are already being refactored (v2 migration in progress). Zustand provides the same capabilities with ~90% less boilerplate.

**Migration per store**:

| Redux Store | Zustand Store | Key Changes |
|-------------|--------------|-------------|
| `store/assistants.ts` | `stores/assistant-store.ts` | createSlice -> create(); PayloadAction -> direct params |
| `store/llm.ts` | `stores/provider-store.ts` | Providers + model selection |
| `store/settings.ts` | `stores/settings-store.ts` | Largest store; split into logical groups |
| `store/tabs.ts` | `stores/tab-store.ts` | Simple state |
| `store/knowledge.ts` | `stores/knowledge-store.ts` | |
| `store/mcp.ts` | `stores/mcp-store.ts` | |
| `store/messageBlock.ts` | `stores/message-block-store.ts` | |

**Pattern**:
```typescript
// Redux (current)
const slice = createSlice({
  name: 'assistants',
  initialState,
  reducers: {
    addAssistant: (state, action: PayloadAction<Assistant>) => {
      state.assistants.unshift(action.payload)
    }
  }
})

// Zustand (target)
const useAssistantStore = create<AssistantState>()(
  persist(
    (set) => ({
      assistants: [],
      addAssistant: (assistant: Assistant) =>
        set((state) => ({ assistants: [assistant, ...state.assistants] }))
    }),
    { name: 'assistant-store', storage: sqliteStorage }
  )
)
```

### 4. Storage: Dexie + SQLite -> Unified SQLite

**Rationale**: Two storage engines (IndexedDB via Dexie + SQLite) create sync complexity and data integrity risks. Unifying on SQLite simplifies the data layer.

**Current Dexie tables to migrate**:

| Dexie Table | SQLite Table | Schema Notes |
|-------------|-------------|-------------|
| `files` | `files` | Direct mapping, add indexes |
| `topics` | `topics` + `messages` | Normalize: extract messages to own table |
| `message_blocks` | `message_blocks` | Direct mapping, FK to messages |
| `settings` | `settings` | Key-value store |
| `knowledge_notes` | `knowledge_items` | Merge with existing KB items |
| `quick_phrases` | `quick_phrases` | Direct mapping |

**Access pattern**:
- Main process owns SQLite connection (via Drizzle ORM)
- Renderer requests data via IPC
- Zustand persist middleware serializes to SQLite via IPC bridge

### 5. Icons: Ant Design Icons + Lucide -> Lucide Only

**Rationale**: Ant Design Icons won't be available without antd. Lucide provides comprehensive, tree-shakeable icons with React components.

**Strategy**: Map each antd icon usage to Lucide equivalent. Where no equivalent exists, use custom SVG.

---

## Migration Risk Assessment

| Migration | Risk | Mitigation |
|-----------|------|-----------|
| Ant Design -> shadcn/ui | High (every component) | Build component-by-component, use feature boundaries |
| Redux -> Zustand | Medium (state logic) | Same patterns, less boilerplate; test each store |
| Dexie -> SQLite | Medium (data migration) | Write migration scripts; test with production data dumps |
| Styled Components removal | Low | Mechanical conversion to Tailwind classes |
| Icon replacement | Low | Find-and-replace with mappings |

---

## Dependencies to Add

```json
{
  "dependencies": {
    "@radix-ui/react-*": "latest",
    "zustand": "^5",
    "@tanstack/react-query": "^5",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "sonner": "latest",
    "lucide-react": "latest",
    "drizzle-orm": "latest",
    "better-sqlite3": "latest"
  }
}
```

## Dependencies to Remove

```json
{
  "remove": [
    "antd",
    "@ant-design/icons",
    "@ant-design/cssinjs",
    "styled-components",
    "@reduxjs/toolkit",
    "react-redux",
    "redux-persist",
    "dexie",
    "dexie-react-hooks"
  ]
}
```
