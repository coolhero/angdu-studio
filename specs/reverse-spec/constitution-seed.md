# Constitution Seed

> Angdu Studio Reverse-Spec | Generated 2026-03-14
> Architecture principles and conventions for Angdu Studio, extracted from Cherry Studio analysis

---

## 1. Source Code Reference Principles

### Rebuild, Not Fork
- Cherry Studio source code is a **reference**, not a base to fork
- Every feature is rebuilt from scratch using the Angdu stack
- Reference the original to understand "what" and "why", but implement "how" independently
- No copy-paste of source code; write fresh implementations informed by the original patterns

### What to Carry Forward
- Domain model structure (entities, relationships, validation rules)
- IPC channel contracts (names, params, return types)
- Business rules and edge cases (the hard-won knowledge in the original)
- UX flows and user expectations

### What to Leave Behind
- Legacy patterns (class components, Redux boilerplate, antd specifics)
- Workarounds for old dependency versions
- Dead code and unused features
- Overly complex abstractions that served the old architecture

---

## 2. Architecture Principles

### Multi-Process Architecture
- **Main process**: system operations, file I/O, IPC hub, Express API server, MCP server management
- **Renderer process**: UI rendering, state management, AI SDK streaming, Dexie operations
- **Preload script**: secure bridge between main and renderer via contextBridge
- Principle: renderer should never access Node.js APIs directly

### IPC-First Communication
- All main process capabilities exposed exclusively through IPC channels
- No shared memory or global state between processes
- IPC calls are always async (invoke/handle pattern)
- Preload provides a typed `window.api` object; renderer code never calls `ipcRenderer` directly

### Dual Database Strategy
- **SQLite (via Drizzle + better-sqlite3)**: structured relational data that benefits from queries, joins, and transactions (agents, sessions, agent messages)
- **Dexie (IndexedDB)**: high-volume local data, offline-first access, per-window isolation (topics, messages, message blocks, files)
- Rule of thumb: if the data needs complex queries or server-side access -> SQLite; if it's renderer-local and high-volume -> Dexie

### Provider Abstraction
- All AI providers accessed through a unified interface (Vercel AI SDK)
- Provider-specific logic encapsulated in provider adapter classes
- Adding a new provider = implementing the adapter interface
- No provider-specific code in business logic layers

### State Persistence
- Zustand stores with `persist` middleware for renderer state
- Selective persistence: not all state slices are persisted (transient UI state stays in memory)
- Storage adapter: localStorage by default, can be swapped for custom IPC-based storage

### Multi-Window Sync
- StoreSyncService broadcasts state changes via IPC
- Only selected store slices are synced (providers, assistants, global settings)
- New window bootstraps with full state snapshot
- Conflict resolution: last-write-wins

### Feature Modularity
- Each Feature owns: its Zustand store slice, route definitions, UI components, and service layer
- Features communicate through the shared store, not direct imports
- Feature boundaries align with the Feature IDs from the reverse-spec (F001, F003, etc.)

### Theme & i18n First
- All user-facing strings go through i18next (no hardcoded strings)
- Theming via CSS custom properties (design tokens), not component-level style overrides
- Dark/light/system themes supported from day one
- RTL support designed in (even if not implemented in v1)

---

## 3. Technical Constraints

### Electron
- Target: Electron 34+ (Chromium 134+, Node.js 22+)
- Security: contextIsolation enabled, nodeIntegration disabled
- CSP: strict Content-Security-Policy in production
- Auto-update: electron-updater for all platforms

### Renderer Stack
- React 19 with concurrent features
- Vite 7 for build and dev server
- TypeScript strict mode everywhere
- No class components; function components + hooks only

### Styling
- Tailwind CSS 4 for utility-first styling
- shadcn/ui as component library (copy-paste pattern, not npm dependency)
- CSS custom properties for theme tokens
- No CSS-in-JS libraries (no styled-components, no emotion)

### Data Layer
- Drizzle ORM for SQLite (type-safe schema, migrations)
- better-sqlite3 for synchronous SQLite access in main process
- Dexie 4 for IndexedDB in renderer
- No ORM for Dexie (Dexie's own API is sufficient)

### Rich Text / Code
- TipTap for rich text editing (notes, system prompts)
- CodeMirror for code display and editing
- Markdown rendering via a unified pipeline (remark/rehype)

### AI Integration
- Vercel AI SDK for all LLM interactions
- Streaming-first: all AI responses are streamed
- Tool/function calling via AI SDK's tool abstraction

### i18n
- i18next + react-i18next
- Translation files: JSON format, one file per language per namespace
- Default language: English
- Supported: English, Korean, Chinese, Japanese (expandable)

---

## 4. Coding Conventions

### TypeScript
- Strict mode (`strict: true` in tsconfig)
- No `any` types except in type guards and external API boundaries
- Prefer `interface` for object shapes, `type` for unions and intersections
- Use `satisfies` for type checking without widening
- Explicit return types on exported functions

### React
- Function components only
- Custom hooks for reusable logic (prefix: `use`)
- Colocate component, hook, and test files
- Props interface named `{ComponentName}Props`
- No default exports for components (named exports only)

### State Management
- Zustand for global state (one store per feature domain)
- React state for component-local state
- No prop drilling beyond 2 levels; use Zustand or context
- Immer middleware for complex state updates

### File Organization
```
src/
  main/           # Electron main process
    services/     # Business logic services
    ipc/          # IPC handler registrations
    db/           # Drizzle schema and migrations
  preload/        # Preload scripts
  renderer/       # React application
    features/     # Feature modules
      {feature}/
        components/
        hooks/
        stores/
        services/
        routes/
    shared/       # Cross-feature shared code
      components/
      hooks/
      utils/
      types/
    assets/       # Static assets
```

### Error Handling
- All IPC handlers wrapped in try/catch; errors serialized to renderer
- AI streaming errors captured in MessageBlock.error
- User-facing errors shown via toast notifications
- All errors logged with structured context (no console.log in production)

---

## 5. Naming Conventions

### Brand Mapping

| Cherry Studio | Angdu Studio |
|---|---|
| CherryStudio | AngduStudio |
| CS | AS |
| cherry-studio | angdu-studio |
| cherrystudio:// | angdustudio:// |
| Cherry AI | Angdu AI |

### Code Naming

| Category | Convention | Example |
|---|---|---|
| Components | PascalCase | `ChatPanel`, `ProviderCard` |
| Hooks | camelCase with `use` prefix | `useAssistant`, `useMcpTools` |
| Stores | camelCase with `Store` suffix | `assistantStore`, `providerStore` |
| Services | PascalCase with `Service` suffix | `FileService`, `McpService` |
| IPC channels | lowercase colon-separated | `file:upload`, `mcp:list-tools` |
| Types/Interfaces | PascalCase | `Assistant`, `MessageBlock` |
| Constants | UPPER_SNAKE_CASE | `MAX_CONTEXT_LENGTH`, `DEFAULT_TEMPERATURE` |
| Files (components) | PascalCase.tsx | `ChatPanel.tsx` |
| Files (utils/hooks) | camelCase.ts | `useAssistant.ts`, `formatDate.ts` |
| Files (stores) | camelCase.ts | `assistantStore.ts` |
| Test files | {name}.test.ts(x) | `ChatPanel.test.tsx` |
| CSS modules | (not used - Tailwind) | - |

### Database Naming

| Category | Convention | Example |
|---|---|---|
| Tables | snake_case, plural | `agents`, `agent_sessions` |
| Columns | snake_case | `created_at`, `agent_id` |
| Foreign keys | {referenced_table_singular}_id | `agent_id`, `session_id` |
| Indexes | idx_{table}_{column} | `idx_agent_sessions_agent_id` |
| Dexie stores | PascalCase, singular | `Topic`, `MessageBlock` |

---

## 6. Recommended Development Principles

### Incremental Delivery
- Build features in dependency order (shell -> providers -> assistants -> chat)
- Each feature is independently testable and demo-able
- No big-bang integration; continuous integration from day one

### Test Strategy
- Unit tests: Vitest for business logic, hooks, and utilities
- Component tests: Vitest + Testing Library for React components
- Integration tests: Playwright for E2E flows
- No test for trivial code (simple props passthrough, CSS-only components)

### Performance Budgets
- App startup: < 3 seconds to interactive
- Message stream: first token visible within 500ms of send
- Window switch: < 100ms to render
- Dexie queries: < 50ms for topic load (up to 1000 messages)

### Accessibility
- All interactive elements keyboard-navigable
- ARIA labels on custom controls
- Focus management for modals and panels
- Minimum contrast ratio 4.5:1

---

## 7. Global Evolution Layer Principles

### Extensibility Points
- Provider system: new providers added via adapter pattern
- MCP: tool ecosystem grows without app changes
- Theme: new themes added via CSS custom property sets
- i18n: new languages added via translation files only
- Slash commands: registerable at runtime

### Migration Strategy
- Drizzle migrations for SQLite schema changes
- Dexie version upgrades for IndexedDB schema changes
- Zustand state migrations via version field in persisted state
- Backward compatibility: support reading data from N-1 version

### Plugin Architecture (Future)
- DXT (Desktop Extension) packages for MCP servers
- Custom theme packages
- Translation packs
- Assistant presets marketplace

---

## 8. Project-Specific Principles

### Angdu Studio Identity
- Angdu Studio is a **desktop AI assistant platform**, not a chat app
- Multi-provider by design: users bring their own API keys
- Privacy-first: all data stays local unless user explicitly enables cloud backup
- Power-user friendly: keyboard shortcuts, slash commands, deep customization

### Non-Goals (v1)
- No cloud-hosted version (desktop only)
- No user accounts or authentication (local app)
- No collaborative editing (single-user)
- No mobile support
- No browser extension

### Quality Bar
- Every shipped feature must have: Korean + English localization, dark/light theme support, keyboard navigation
- No feature ships without error handling for network failures and invalid input
- Performance is a feature: measure and maintain budgets
