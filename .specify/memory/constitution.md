<!-- Sync Impact Report
  Version change: 0.0.0 → 1.0.0
  Modified principles: N/A (initial creation)
  Added sections:
    - Core Principles (I–V): IPC Separation, Service-Oriented Main, Feature-Owned State, Provider Abstraction, Streaming-First
    - Technical Constraints: Electron Security, Custom Titlebar, Multiple Windows, Build Config
    - Coding & Development Standards: Naming, File Org, TypeScript Strictness, Component Design, Error Handling, Testing, Performance, i18n
  Removed sections: N/A
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ reviewed (Constitution Check aligns)
    - .specify/templates/spec-template.md ✅ reviewed (no conflicts)
    - .specify/templates/tasks-template.md ✅ reviewed (no conflicts)
  Follow-up TODOs: None
-->

# Angdu Studio Constitution

## Core Principles

### I. IPC-Based Main/Renderer Separation

The application strictly separates concerns between Electron's main process and renderer process. All system-level operations MUST route through typed IPC channels. The renderer MUST NEVER import Node.js modules directly.

- **Main process**: Node.js services (file system, database, MCP servers, network requests, system APIs)
- **Renderer process**: React UI, user state, AI SDK streaming, presentation logic
- **Communication**: Typed IPC channels via `IpcChannel` enum — `ipcMain.handle` / `ipcRenderer.invoke`
- **Preload script**: Exposes a narrow `window.api` surface via `contextBridge.exposeInMainWorld`; no direct Node.js access in renderer

**Rationale**: Enforces Electron security model, prevents renderer compromise from accessing system resources, and enables clean process-boundary testing.

### II. Service-Oriented Main Process

The main process MUST be organized as singleton services, each responsible for a bounded domain. Services communicate via direct method calls within the main process, NEVER via IPC internally.

| Service | Responsibility |
|---------|---------------|
| WindowService | Window lifecycle (main, mini, selection, trace) |
| FileStorage | File upload/download, path management |
| MCPService | MCP server spawn/connect/disconnect |
| KnowledgeService | Embedding generation, RAG search |
| BackupManager | Backup/restore, export |
| ProxyManager | HTTP/SOCKS proxy configuration |
| ConfigManager | electron-store based configuration |
| AppUpdater | Auto-update lifecycle |
| TrayService | System tray icon and menu |
| ThemeService | Native theme detection and sync |

**Rationale**: Singleton services with clear domain boundaries prevent tangled dependencies and make each service independently testable.

### III. Feature-Owned State (Zustand)

Each Feature MUST own its store(s). Stores MUST be independent — no combined root store. Cross-store reads use `getState()` directly.

- **Persisted stores**: Settings, assistants, LLM config, MCP config (via `persist` middleware)
- **Ephemeral stores**: Runtime state, active messages, tabs, input tools (no persistence)
- **Multi-window sync**: Custom middleware broadcasts state changes across BrowserWindows via IPC

**Rationale**: Independent stores eliminate cross-feature coupling, simplify Feature-level testing, and enable incremental delivery without global store conflicts.

### IV. Provider Abstraction (AI SDK)

Application code MUST NEVER call provider-specific APIs. All AI interaction MUST go through the Vercel AI SDK abstraction layer.

- **ProviderFactory**: Maps provider ID → AI SDK provider instance
- **Model configuration**: Provider + model ID + parameters (temperature, maxTokens, etc.)
- **Streaming-first**: All AI interactions use `streamText()` / `streamObject()` from AI SDK
- **20+ providers**: OpenAI, Anthropic, Google, Azure, Bedrock, Ollama, OpenRouter, etc.
- **Model-capability awareness**: UI MUST adapt based on model capabilities (vision, function calling, streaming), not provider name
- **Graceful degradation**: If a provider is unavailable, show clear error state without breaking the app

**Rationale**: Provider-agnostic abstraction ensures adding or removing providers never impacts application logic, and enables uniform error handling across all providers.

### V. Streaming-First Message Handling

All AI responses MUST use streaming (`streamText`) by default. Batch completion is a fallback only.

- **Incremental rendering**: Message UI renders chunks as they arrive. No waiting for complete response.
- **Abort support**: Every streaming request MUST be cancellable via AbortController.
- **Error mid-stream**: If streaming fails partway, preserve partial response and show error state.

**Rationale**: Streaming provides immediate user feedback, reduces perceived latency, and is the expected behavior for modern AI chat interfaces.

## Technical Constraints

### Electron Security

| Constraint | Implementation | Rationale |
|-----------|---------------|-----------|
| `contextIsolation: true` | Default for all windows | Prevents renderer from accessing Node.js globals |
| `sandbox: false` | Required for preload script functionality | Preload needs some Node.js APIs; tradeoff accepted |
| `nodeIntegration: false` | Default for all windows | Renderer MUST use IPC, not require() |
| Preload API surface | Narrow typed API via `contextBridge.exposeInMainWorld` | Minimizes attack surface |

### Custom Titlebar (Frameless Window)

| Platform | Approach |
|----------|----------|
| macOS | `titleBarStyle: 'hidden'` + `titleBarOverlay` + `trafficLightPosition: { x: 8, y: 13 }` |
| Windows | `frame: false` — custom titlebar with window controls |
| Linux | `frame: false` (default) or `frame: true` if user enables system titlebar |

CSS constraint: Top-level drag region uses `-webkit-app-region: drag`. Interactive elements within MUST use `-webkit-app-region: no-drag`.

### Multiple Windows

| Window | Entry Point | Purpose |
|--------|-------------|---------|
| Main | `src/renderer/index.html` | Full application |
| Mini | `src/renderer/miniWindow.html` | Compact quick-chat |
| Selection Toolbar | `src/renderer/selectionToolbar.html` | Text selection floating bar |
| Selection Action | `src/renderer/selectionAction.html` | Selection action handler |
| Trace | `src/renderer/traceWindow.html` | OpenTelemetry trace viewer |

Each window has its own entry point but shares preload script and some state (via StoreSyncService).

### Build Configuration

- **electron-vite 5** with rolldown-vite 7 as the underlying bundler
- **Main process**: Single-file output (inlineDynamicImports: true), external Node.js deps
- **Renderer**: Multi-entry (5 HTML files), ESNext target, Tailwind CSS via `@tailwindcss/vite`
- **SWC**: Used via `@vitejs/plugin-react-swc` for fast JSX transforms

### MCP Tool Isolation

- MCP servers MUST run as child processes, not in the renderer
- Tool execution MUST require explicit user permission (auto/manual modes)
- MCP tools are injected into AI requests only when enabled — toggled via `mcpEnabled` state
- MCP server crashes MUST NOT affect the main app

### Offline-First Data

- All user data (messages, assistants, settings) MUST be stored locally (IndexedDB + localStorage + file system)
- Cloud sync (WebDAV/S3/Nutstore) is opt-in, never required
- The app MUST be fully functional without internet (except for AI provider API calls)

### Internationalization (i18n)

- **Supported languages**: Korean (`ko`) and English (`en`) only. No other locales.
- **Default language**: Korean (`ko`). The app launches in Korean unless the user explicitly switches to English.
- **i18n framework**: All user-facing strings MUST use i18n keys (via `react-i18next`). No hardcoded display strings in components.
- **Translation completeness**: Both `ko` and `en` translation files MUST be kept in sync — every key present in one MUST exist in the other.

## Coding & Development Standards

### Naming Conventions

| Entity | Convention | Examples |
|--------|-----------|----------|
| Variables, functions | camelCase | `createMainWindow`, `getFilesDir` |
| React components | PascalCase | `ChatContainer`, `SettingsPage` |
| Types, interfaces | PascalCase | `FileMetadata`, `ThemeMode` |
| Constants | UPPER_SNAKE_CASE | `MIN_WINDOW_WIDTH` |
| IPC channels | PascalCase with underscore | `IpcChannel.App_Info` |
| Store hooks | use + PascalCase + Store | `useAssistantStore` |
| Service classes | PascalCase + Service | `WindowService`, `MCPService` |
| CSS classes | Tailwind utility classes | `flex`, `items-center` |
| File names | PascalCase (components), camelCase (utils) | `SettingsPage.tsx`, `fileUtils.ts` |
| Directory names | camelCase | `services`, `components` |

### Identity Mapping (Cherry → Angdu)

| Context | Value |
|---------|-------|
| App name | Angdu Studio |
| Package scope | @angdu/* |
| Store persist key | angdu-studio |
| CSS prefix | as- |
| Logger context prefix | AS |
| Environment var prefix | ANGDU_ |
| Config dir | AngduStudio (userData) |

All user-facing strings MUST use "Angdu Studio". All package scopes MUST use `@angdu/`. No references to "Cherry Studio" in source code.

### TypeScript Strictness

- `strict: true` in all tsconfig files
- No `any` without explicit justification comment
- Prefer `unknown` over `any` for external data
- Use discriminated unions for complex state
- All IPC channel handlers MUST have typed request/response signatures

### Component Design

- Components MUST be pure functions (no class components)
- Props interfaces MUST be explicitly defined (no inline object types for public components)
- Side effects in hooks, not in render
- Prefer composition over prop drilling (use Zustand stores for cross-component state)
- Every page component MUST handle its loading, error, and empty states

### Error Handling

- Main process: Errors caught at IPC handler boundary, serialized as Error objects to renderer
- Renderer: React Error Boundary wraps route-level components
- Network errors: Retry logic with exponential backoff for transient failures
- User-facing errors: Toast notifications via Sonner; never raw error messages

### Testing Strategy

- **Unit tests**: Vitest for business logic, store logic, utilities
- **Component tests**: @testing-library/react for UI components
- **E2E tests**: Playwright for critical user flows
- **Test file location**: `__tests__/` directories adjacent to source, or `tests/` at root for E2E

### Performance

- Lazy-load route pages (React.lazy + Suspense)
- Virtualized lists for large datasets (messages, assistants) via @tanstack/react-virtual
- Debounce expensive operations (search, settings save)
- Avoid re-renders: Zustand selectors with shallow equality comparison

## Governance

This constitution is the authoritative source for architectural decisions and coding standards in Angdu Studio. All code contributions MUST comply with the principles and constraints defined here.

- **Amendment process**: Propose changes with rationale → review impact on existing code → update constitution → propagate to dependent templates
- **Versioning**: Semantic versioning (MAJOR.MINOR.PATCH). MAJOR for principle removals/redefinitions, MINOR for new principles/sections, PATCH for clarifications
- **Compliance review**: Every PR MUST be checked against Core Principles (I–V) and Technical Constraints
- **Incremental delivery**: Each Release Group (RG-1 through RG-5) MUST be independently demoable. Features within an RG MUST NOT break previously shipped features
- **Migration discipline**: Within a single Feature, do NOT mix old stack (Ant Design, Redux, styled-components) with new stack. Migrate completely or not at all
- **Feature boundary**: Each Feature is migrated as a unit. Cross-Feature dependencies use interfaces, not implementations

**Version**: 1.0.0 | **Ratified**: 2026-03-13 | **Last Amended**: 2026-03-13
