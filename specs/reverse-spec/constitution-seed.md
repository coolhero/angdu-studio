# Angdu Studio -- Constitution Seed

> Canonical reference for every AI coding agent working on this codebase.
> If a pull request contradicts this document, this document wins.

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| Name | Angdu Studio |
| Origin | Rebuild of Cherry Studio |
| Source repo | `/Users/coolhero/Develop/cherry-studio` |
| Target repo | `/Users/coolhero/Develop/angdu-studio` |
| Package name | `angdu-studio` |
| License | TBD |

---

## 2. Naming Conventions

All references to the original project must be translated:

| Original | New | Context |
|----------|-----|---------|
| Cherry | Angdu | Brand prefix |
| CherryStudio | AngduStudio | App name (PascalCase) |
| cherry-studio | angdu-studio | Package / directory name (kebab-case) |
| CS | AS | Abbreviation |
| CherryIN | AngduIN | OAuth service name |
| CHERRY_ | ANGDU_ | Environment variable prefix |

These substitutions apply everywhere: code identifiers, config keys, UI strings, documentation, CI scripts, and file/directory names.

---

## 3. Architecture Principles

### 3.1 Multi-Process Architecture
Electron main / renderer / preload separation with IPC bridge. The main process owns Node.js APIs; the renderer owns the React UI; the preload script exposes a minimal, typed bridge via `contextBridge`.

### 3.2 Service-Oriented Design
47+ singleton services in the main process, each with a single clear responsibility. Services are accessed from the renderer exclusively through IPC channels.

### 3.3 Plugin / Provider Pattern
AI providers are integrated via the Vercel AI SDK with a plugin engine. MCP servers use transport abstraction (stdio, SSE, streamable HTTP) to remain host-agnostic.

### 3.4 Entity-Store Separation
- **Client DB**: Dexie (IndexedDB) for offline-first user data.
- **Server DB**: Drizzle + LibSQL for optional server-side persistence.
- **Runtime state**: Zustand stores, one per domain slice.

### 3.5 Event-Driven Communication
- **Cross-process**: Typed IPC channels (`ipcMain.handle` / `ipcRenderer.invoke`).
- **In-process**: Emittery for decoupled event buses within a single process.

### 3.6 Middleware Pipeline
The AI core uses a layered middleware stack for request transformation (prompt assembly, context injection, token counting, tool binding).

### 3.7 Strategy Pattern
Preprocessing providers, reranking strategies, and search providers are all pluggable. New implementations satisfy a shared interface and are registered declaratively.

---

## 4. Technical Constraints

| Constraint | Detail |
|------------|--------|
| Main process | Node.js APIs only -- no DOM, no `window` |
| Renderer process | Browser APIs + React -- no `fs`, no `child_process` |
| Preload | Limited bridge API via `contextBridge`; no arbitrary Node exposure |
| Cross-platform | Windows, macOS, Linux; test on all three before merge |
| Offline-capable | Core features (local models, cached conversations) must work without internet |
| Payload limit | 50 MB JSON ceiling for the API server |

---

## 5. Technology Stack

### 5.1 Stack Changes (Cherry Studio -> Angdu Studio)

| Layer | Cherry Studio (Original) | Angdu Studio (New) | Migration Complexity |
|-------|--------------------------|---------------------|----------------------|
| UI Components | Ant Design | shadcn/ui + Tailwind CSS 4 | High |
| Styling | Styled Components | Tailwind CSS 4 | High (bundled with above) |
| State Management | Redux Toolkit + Persist | Zustand + persist middleware | Medium |
| Everything else | -- | Keep as-is | -- |

### 5.2 Retained Stack

- **Runtime**: Electron (main + renderer)
- **Language**: TypeScript (strict mode)
- **Framework**: React 19 with hooks
- **AI SDK**: Vercel AI SDK
- **Client DB**: Dexie (IndexedDB)
- **Server DB**: Drizzle ORM + LibSQL
- **Validation**: Zod
- **Logging**: Winston (structured, module-filtered)
- **Events**: Emittery
- **Build**: Vite + electron-builder

---

## 6. Coding Conventions

### 6.1 General

- TypeScript strict mode (`"strict": true`) -- no `any` except at FFI boundaries.
- React 19 functional components with hooks; no class components.
- `camelCase` for variables, functions, and file names.
- `PascalCase` for components, types, interfaces, and enums.
- Feature-based directory structure: `pages/`, `components/`, `services/`, `hooks/`.

### 6.2 Services

- Singleton pattern; one class per file.
- Dependency injection via IPC -- services never import each other's internals across process boundaries.

### 6.3 Validation & Logging

- Zod schemas for all external input (API payloads, IPC messages, user config).
- Winston structured logging with module-level filters; no bare `console.log` in production code.

### 6.4 Styling (New)

- Tailwind CSS 4 utility classes; avoid inline `style` props.
- shadcn/ui primitives as the base component library; extend via composition, not fork.
- Design tokens live in the Tailwind config; never hard-code color/spacing values.

### 6.5 State (New)

- One Zustand store per domain slice (e.g., `useAssistantStore`, `useSettingsStore`).
- Persist middleware for stores that survive app restart.
- Selectors via `useShallow` to prevent unnecessary re-renders.

---

## 7. Recommended Development Principles

### 7.1 Test-First

Write failing tests before implementation code. A feature is not started until its acceptance criteria are expressed as tests (unit, integration, or E2E as appropriate). This includes:
- Unit tests for pure logic (services, utilities, store actions).
- Integration tests for IPC round-trips and middleware pipelines.
- E2E tests for critical user flows (conversation create, provider switch, export).

### 7.2 Small, Focused Commits

Each commit should represent a single logical change. Prefer many small PRs over monolithic ones. Commit messages follow Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `test:`, `docs:`).

### 7.3 Continuous Refactoring

Refactor as you go. If touching a file reveals tech debt, fix it in the same PR (if small) or file a follow-up task. Never copy-paste code across modules -- extract shared logic into a utility or hook.

### 7.4 Type Safety End-to-End

Types flow from the database schema to the API contract to the UI component props. Avoid runtime type assertions; let Zod + TypeScript catch mismatches at compile time or validation boundaries.

### 7.5 Observable by Default

Every service emits structured logs. Every store action is traceable. Add performance marks for operations over 100 ms. Errors include contextual metadata (provider name, model ID, message count).

### 7.6 Incremental Delivery

Features are delivered behind feature flags when incomplete. `main` is always deployable. No long-lived feature branches; rebase daily.

### 7.7 Demo-Ready Delivery

Every merged PR should leave the app in a state that can be demonstrated. If a feature is partially built, gate it behind a flag -- never leave broken UI on `main`.

---

## 8. Project-Specific Recommended Principles

### 8.1 AI Provider Abstraction

All AI provider interactions go through the unified Vercel AI SDK adapter layer. No provider-specific code in UI components or stores. Observed: 15+ providers (OpenAI, Anthropic, Google, Ollama, etc.) integrated through a single interface. New providers must implement the same adapter contract.

### 8.2 Streaming-First Design

All AI responses are streamed. UI components consume token streams, not completed strings. Buffered/batch responses are the exception, never the default. This applies to text generation, tool calls, and image generation where the provider supports it.

### 8.3 Multi-Window State Sync

Zustand stores must synchronize state across Electron windows (main window, mini-programs, popouts). Use the Zustand broadcast/sync middleware to ensure all windows reflect the same truth. Observed in the original codebase: Redux sync across Electron windows -- replicate this guarantee with Zustand.

### 8.4 Graceful Degradation for AI

When an AI provider fails (network error, rate limit, model deprecation), the system must:
1. Surface a clear, actionable error to the user.
2. Offer automatic retry with exponential backoff where appropriate.
3. Allow fallback to an alternative provider or local model if configured.
4. Never lose user input -- draft messages survive provider failures.

### 8.5 Sensitive Data Protection

API keys, tokens, and credentials are encrypted at rest and never logged. Environment variable values prefixed with `ANGDU_` are redacted in log output. Credential storage uses the OS keychain where available. Exported data (JSON, Markdown) strips sensitive fields by default.

---

## 9. Global Evolution Layer -- Operational Principles

These principles govern how this constitution and the broader spec system evolve over time.

1. **Single Source of Truth**: This constitution seed is the root authority. Derived specs (feature specs, ADRs, migration plans) must not contradict it. If a conflict is found, escalate to update this document first.

2. **Append-Only History**: Decisions are never silently deleted. Superseded sections are marked `[SUPERSEDED by <link>]` and kept for audit. The `specs/history.md` log records every significant decision with date and rationale.

3. **Spec Versioning**: This document carries a version number in its commit history. Breaking changes (principle removals, stack changes) require a new major version and explicit migration notes.

4. **Agent Compliance**: Any AI coding agent operating on this codebase must read this file before generating code. Agents must cite the relevant section number when a design decision is non-obvious.

5. **Human Override**: A human maintainer may override any principle with a written rationale added to `specs/history.md`. The override is effective immediately and must be reflected in this document within the same PR.

6. **Continuous Validation**: CI checks should verify that naming conventions (Section 2), import boundaries (Section 3.1), and coding conventions (Section 6) are enforced automatically. Manual review is not a substitute for automated enforcement.

7. **Scope Boundary**: This constitution covers architecture, conventions, and principles. It does not prescribe feature requirements, timelines, or team structure. Those belong in separate spec documents under `specs/`.
