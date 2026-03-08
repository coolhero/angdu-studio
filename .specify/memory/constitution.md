<!--
Sync Impact Report
- Version change: 0.0.0 → 1.0.0 (MINOR: initial finalization from constitution-seed)
- Added sections: Core Principles (I–VIII), Technical Constraints, Coding Conventions, Best Practices, Project-Specific Principles, Global Evolution Principles, Governance
- Removed sections: All template placeholders replaced
- Templates requiring updates: ✅ plan-template.md (Constitution Check aligned), ✅ spec-template.md (no changes needed), ✅ tasks-template.md (no changes needed)
- Follow-up TODOs: None
-->

# Angdu Studio Constitution

## Core Principles

### I. Singleton Services

Long-lived service instances MUST manage cross-cutting concerns. Each service owns its lifecycle and exposes a clear API surface.

- **Main process**: `MCPService`, `MemoryService`, `OcrService`, `KnowledgeService`, `FileStorage`, `ConfigManager`
- **Renderer process**: `ApiService`, `AssistantService`, `ConversationService`, `MemoryService`, `NavigationService`
- Services are instantiated once and imported as module-level singletons
- No ad-hoc instantiation — access services through their singleton export

### II. IPC Bridge Pattern

Main and renderer processes MUST communicate exclusively through typed IPC channels. All channels are defined in a shared `IpcChannel` enum.

- Channels are grouped by domain (file operations, provider management, knowledge base, etc.)
- All IPC payloads MUST be structured-cloneable (no functions, class instances, or circular references)
- The preload script exposes a minimal, typed API surface to the renderer
- No direct Node.js access from renderer — all system operations go through IPC

### III. Middleware Pipeline

AI Core MUST use a request/response transformation pipeline for all LLM interactions. Middleware functions compose to handle preprocessing (token estimation, context injection) and postprocessing (streaming, usage tracking).

- Middleware functions are pure transformations: `(request) => request` or `(response) => response`
- Pipeline is extensible — new middleware inserts without modifying existing stages

### IV. Registry & Factory Patterns

Extensible registries MUST manage pluggable providers (OCR, MCP servers, AI model providers, plugins). New providers are added by registering with the appropriate registry without modifying core logic.

- Provider factories resolve the correct SDK adapter from a provider type enum
- Registration is declarative — no switch/case chains in business logic

### V. Dual Database Architecture

The project MUST use a dual-database strategy:

- **SQLite (via Drizzle ORM)**: Persistent, structured data — agents, provider configs, knowledge base metadata, settings. Runs in the **main process only**.
- **Dexie (IndexedDB)**: High-frequency, large-volume data — chat messages, conversation history, message blocks. Runs in the **renderer process only**.
- Schema migrations MUST be forward-compatible and non-destructive
- Drizzle schema changes require migration files

### VI. Test-First Development

Tests MUST be written before implementation. Each Feature starts with failing tests that define expected behavior.

- Red-Green-Refactor cycle enforced
- Tests serve as living documentation and prevent regressions
- **Vitest** for unit and integration tests, **Playwright** for end-to-end tests
- Test files co-located in `__tests__/` directories alongside source
- Mock IPC and services at the boundary, not deep internals

### VII. Demo-Ready Delivery

Every completed Feature MUST be demonstrable. The app MUST build, launch, and show the Feature working.

- Each Feature produces an executable demo script (`demos/F00N-name.sh`)
- Default mode: start the Feature, print "Try it" instructions, keep running
- CI mode (`--ci`): quick health check, exit with status code
- No "it works on my machine" — CI must pass, E2E tests must confirm

### VIII. Internationalization (i18n)

The application MUST support exactly two languages: Korean (ko) and English (en).

- **Default language**: Korean (ko)
- All user-facing text MUST use i18next translation keys
- Locale files: `locales/ko.json` and `locales/en.json` only
- No other locales are supported or planned

## Technical Constraints

### Electron Process Model

- **Main process**: Node.js runtime — file system, native APIs, IPC handlers, background services
- **Renderer process**: Chromium runtime — React app, UI rendering, user interaction
- **Preload scripts**: Bridge layer with `contextIsolation` enabled, whitelisted IPC methods
- No direct Node.js access from renderer

### IPC Serialization

- All data crossing the IPC boundary MUST be structured-cloneable
- Large binary data (files, images) SHOULD use ArrayBuffer or disk path references
- IPC calls are async — design for latency and error handling

### Build System

- **electron-vite** with SWC for fast compilation
- Path aliases: `@renderer`, `@main`, `@shared`, `@types`
- Separate entry points for main, preload, and renderer

### Streaming Requirements

- LLM responses are streamed token-by-token using the Vercel AI SDK
- UI MUST handle incremental rendering without full re-renders
- Message blocks are appended progressively during streaming
- Abort controllers MUST be wired for user cancellation

## Coding Conventions

### TypeScript

- **Strict mode enabled** (`strict: true`)
- Prefer `interface` for object shapes, `type` for unions and intersections
- No `any` — use `unknown` with type guards when the type is truly dynamic
- Export types separately from values when possible
- Use `as const` for literal enums and configuration objects

### React

- **Functional components only** — no class components
- Hooks for all state and side effects
- Custom hooks extract reusable logic (e.g., `useAssistant`, `useModel`, `useTopic`)
- Memoize expensive computations with `useMemo` and callbacks with `useCallback`
- Avoid prop drilling — use Zustand stores or React context for shared state

### State Management

- **Zustand** stores with `use<Domain>Store` naming (e.g., `useSettingsStore`, `useAssistantsStore`)
- Domain boundaries preserved from original architecture
- Persistence via zustand/persist middleware where needed

### File Organization

- Feature-based directory structure under `src/renderer/src/`
- Services in `services/`, stores in `store/`, UI components in `components/`
- Pages in `pages/`, organized by route
- Shared types in a top-level `types/` directory
- Constants and configuration in `config/`

### Imports

- Use path aliases (`@renderer/`, `@main/`, `@shared/`, `@types`)
- Group imports: external packages → internal aliases → relative paths
- Prefer named exports over default exports (except for pages/routes)

### Error Handling

- Wrap IPC calls in try/catch with meaningful error messages
- Services MUST never throw unhandled — catch and log via `LoggerService`
- UI MUST show user-friendly error states, not raw exceptions
- Use `Result<T, E>` patterns for operations that can fail predictably

### Naming

| Context | Convention |
|---------|-----------|
| Files (utilities) | kebab-case |
| Files (components/services) | PascalCase |
| Variables/functions | camelCase |
| Types/interfaces | PascalCase |
| Constants | UPPER_SNAKE_CASE |
| Zustand stores | `use<Domain>Store` |
| IPC channels | dot-separated namespace (e.g., `file.upload`, `provider.list`) |

### Identity Mapping

| Original | New | Context |
|----------|-----|---------|
| Cherry | Angdu | Brand name |
| CS | AS | Abbreviation |
| CherryStudio | AngduStudio | Product name |
| cherry-studio | angdu-studio | Package/repo/directory |

## Best Practices

### Think Before Coding

Before writing any code, understand the problem fully. Read the relevant spec, trace the data flow, identify edge cases.

### Simplicity First

Choose the simplest solution that satisfies the requirements. Avoid premature abstraction. Extract patterns only when three or more concrete instances exist.

### Surgical Changes

Each commit SHOULD do one thing. Minimize blast radius. If a change touches more than 5 files, question whether it can be decomposed.

### Goal-Driven Execution

Every task maps to a Feature spec. Work from the spec, not from intuition. If the spec is ambiguous, clarify before implementing.

## Project-Specific Principles

### AI Provider Abstraction

The AI provider system is the core domain. All LLM interactions flow through a unified abstraction layer:

- Provider configuration is declarative (type, API key, base URL, models)
- The AI Core middleware pipeline handles request transformation, streaming, and response normalization
- New providers are added by implementing a provider adapter — no core changes required
- Model capabilities (vision, function calling, web search) are declared as metadata, not hardcoded

### Streaming-First, Virtual Lists

- All LLM interactions use streaming by default — batch mode is the exception
- Long lists (messages, assistants, topics, files) use virtualization for thousands of items
- Image generation and knowledge base operations are queued to prevent resource exhaustion
- Background processing (embedding, indexing) runs in workers or the main process, never blocking the UI thread

### Type Safety & Middleware Composability

- Shared types between main and renderer live in `@shared/` — never duplicate type definitions
- IPC channel names are defined in a shared enum (`IpcChannel`) to catch mismatches at compile time
- Zustand stores use TypeScript generics for full type inference in selectors and actions

## Global Evolution Principles

1. **Additive over destructive**: Prefer adding new code paths over modifying stable ones
2. **Backward-compatible migrations**: Database schema changes MUST include migration scripts. Never drop columns/tables without deprecation
3. **Interface stability**: Public API surfaces (IPC channels, store shapes, service methods) SHOULD be versioned. Breaking changes require a major version bump
4. **Documentation as code**: Type definitions serve as primary documentation. JSDoc for complex business logic only
5. **Dependency hygiene**: Pin major versions. Review changelogs before upgrading. Audit new dependencies for bundle size, maintenance, and security
6. **Performance budgets**: Monitor bundle size, startup time, and memory usage. Set thresholds and fail CI if exceeded

## Governance

- This Constitution supersedes all other practices and conventions in the project
- Amendments require: documentation of the change, rationale, and impact analysis on existing Features
- All code reviews MUST verify compliance with these principles
- Complexity MUST be justified — if a simpler approach exists, use it
- Version increments follow semantic versioning: MAJOR (principle removal/redefinition), MINOR (new principle/section), PATCH (clarifications/wording)

**Version**: 1.0.0 | **Ratified**: 2026-03-08 | **Last Amended**: 2026-03-08
