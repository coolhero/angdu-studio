<!--
Sync Impact Report
===================
- Version change: 0.0.0 (template) → 1.0.0 (initial finalization)
- Added principles:
  I. Multi-Process Architecture
  II. Service-Oriented Design
  III. Plugin / Provider Pattern
  IV. Entity-Store Separation
  V. Event-Driven Communication
  VI. Middleware Pipeline
  VII. Strategy Pattern
  VIII. Test-First
  IX. Type Safety End-to-End
  X. Observable by Default
  XI. Streaming-First Design
  XII. AI Provider Abstraction
  XIII. Graceful Degradation for AI
  XIV. Sensitive Data Protection
- Added sections:
  - Naming Conventions
  - Technical Constraints
  - Technology Stack
  - Coding Conventions
  - Development Workflow
  - Project-Specific Principles
  - Governance (with Global Evolution Operational Principles)
- Removed sections: none (initial)
- Templates requiring updates:
  - .specify/templates/plan-template.md — ✅ no updates needed (Constitution Check section is generic)
  - .specify/templates/spec-template.md — ✅ no updates needed (structure is generic)
  - .specify/templates/tasks-template.md — ✅ no updates needed (structure is generic)
- Follow-up TODOs: none
-->

# Angdu Studio Constitution

## Naming Conventions

All references to the original project (Cherry Studio) MUST be translated:

| Original | New | Context |
|----------|-----|---------|
| Cherry | Angdu | Brand prefix |
| CherryStudio | AngduStudio | App name (PascalCase) |
| cherry-studio | angdu-studio | Package / directory name (kebab-case) |
| CS | AS | Abbreviation |
| CherryIN | AngduIN | OAuth service name |
| CHERRY_ | ANGDU_ | Environment variable prefix |

These substitutions apply everywhere: code identifiers, config keys, UI strings,
documentation, CI scripts, and file/directory names.

## Core Principles

### I. Multi-Process Architecture

Electron main / renderer / preload separation with a typed IPC bridge.

- The **main process** owns all Node.js APIs; it MUST NOT access DOM or `window`.
- The **renderer process** owns the React UI; it MUST NOT import `fs`,
  `child_process`, or any Node-only module.
- The **preload script** exposes a minimal, typed bridge via `contextBridge`.
  No arbitrary Node exposure is permitted.

### II. Service-Oriented Design

The main process hosts singleton services, each with a single clear
responsibility.

- One class per file; singleton pattern enforced.
- Services are accessed from the renderer exclusively through IPC channels.
- Services MUST NOT import each other's internals across process boundaries.

### III. Plugin / Provider Pattern

AI providers integrate via the Vercel AI SDK with a plugin engine. MCP servers
use transport abstraction (stdio, SSE, streamable HTTP) to remain host-agnostic.

- New providers MUST implement the standard adapter contract.
- New MCP transports MUST satisfy the shared transport interface.

### IV. Entity-Store Separation

- **Client DB**: Dexie 4 (IndexedDB) for offline-first user data.
- **Server DB**: Drizzle ORM + LibSQL for optional server-side persistence.
- **Runtime state**: Zustand stores, one per domain slice.
- Clear ownership boundaries per entity — no dual-write across client and server
  DB for the same data.

### V. Event-Driven Communication

- **Cross-process**: Typed IPC channels (`ipcMain.handle` / `ipcRenderer.invoke`).
- **In-process**: Emittery for decoupled event buses within a single process.
- All IPC channel names MUST be defined in a shared type file.

### VI. Middleware Pipeline

The AI core uses a layered middleware stack for request transformation:
prompt assembly, context injection, token counting, and tool binding.

- Middleware MUST be composable and independently testable.
- Order of middleware execution MUST be explicitly declared, not implicit.

### VII. Strategy Pattern

Preprocessing providers, reranking strategies, and search providers are all
pluggable. New implementations MUST satisfy a shared interface and be registered
declaratively. No switch/case blocks for strategy selection.

### VIII. Test-First

Write failing tests before implementation code. A feature is not started until
its acceptance criteria are expressed as tests.

- **Unit tests**: Pure logic (services, utilities, store actions).
- **Integration tests**: IPC round-trips and middleware pipelines.
- **E2E tests**: Critical user flows (conversation create, provider switch,
  export) via Playwright.

### IX. Type Safety End-to-End

Types flow from the database schema to the API contract to the UI component
props. Avoid runtime type assertions; let Zod + TypeScript catch mismatches at
compile time or validation boundaries.

- Zod schemas MUST be defined for all external input (API payloads, IPC
  messages, user config).
- No `any` except at FFI boundaries, and each MUST include a justifying comment.

### X. Observable by Default

Every service emits structured logs. Every store action is traceable.

- Winston structured logging with module-level filters; no bare `console.log`
  in production code.
- Add performance marks for operations exceeding 100 ms.
- Errors MUST include contextual metadata (provider name, model ID, message
  count).

### XI. Streaming-First Design

All AI responses are streamed. UI components consume token streams, not
completed strings. Buffered/batch responses are the exception, never the
default.

- Applies to text generation, tool calls, and image generation where the
  provider supports it.

### XII. AI Provider Abstraction

All AI provider interactions go through the unified Vercel AI SDK adapter layer.

- No provider-specific code in UI components or stores.
- 15+ providers (OpenAI, Anthropic, Google, Ollama, etc.) integrated through a
  single interface.
- New providers MUST implement the same adapter contract.

### XIII. Graceful Degradation for AI

When an AI provider fails (network error, rate limit, model deprecation):

1. Surface a clear, actionable error to the user.
2. Offer automatic retry with exponential backoff where appropriate.
3. Allow fallback to an alternative provider or local model if configured.
4. Never lose user input — draft messages MUST survive provider failures.

### XIV. Sensitive Data Protection

- API keys, tokens, and credentials MUST be encrypted at rest and never logged.
- Environment variable values prefixed with `ANGDU_` MUST be redacted in log
  output.
- Credential storage MUST use the OS keychain where available.
- Exported data (JSON, Markdown) MUST strip sensitive fields by default.

## Technical Constraints

| Constraint | Detail |
|------------|--------|
| Main process | Node.js APIs only — no DOM, no `window` |
| Renderer process | Browser APIs + React — no `fs`, no `child_process` |
| Preload | Limited bridge API via `contextBridge`; no arbitrary Node exposure |
| Cross-platform | Windows, macOS, Linux; test on all three before merge |
| Offline-capable | Core features (local models, cached conversations) MUST work without internet |
| Payload limit | 50 MB JSON ceiling for the API server |

## Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Runtime | Electron (main + renderer) | |
| Language | TypeScript (strict mode) | |
| Framework | React 19 with hooks | No class components |
| UI Components | shadcn/ui + Tailwind CSS 4 | Migrated from Ant Design |
| State | Zustand + persist middleware | Migrated from Redux Toolkit |
| AI SDK | Vercel AI SDK | |
| Client DB | Dexie 4 (IndexedDB) | |
| Server DB | Drizzle ORM + LibSQL | |
| Validation | Zod | |
| Logging | Winston | Structured, module-filtered |
| Events | Emittery | |
| Build | Vite + electron-builder | |
| Testing | Vitest + Playwright | |
| i18n | i18next | |

## Coding Conventions

- TypeScript strict mode (`"strict": true`) — no `any` except at FFI
  boundaries.
- React 19 functional components with hooks; no class components.
- `camelCase` for variables, functions, and file names.
- `PascalCase` for components, types, interfaces, and enums.
- Feature-based directory structure: `pages/`, `components/`, `services/`,
  `hooks/`.
- Zod schemas for all external input (API payloads, IPC messages, user config).
- Winston structured logging with module-level filters; no bare `console.log`
  in production code.
- Tailwind CSS 4 utility classes; avoid inline `style` props.
- shadcn/ui primitives as the base component library; extend via composition,
  not fork.
- Design tokens live in the Tailwind config; never hard-code color/spacing
  values.
- One Zustand store per domain slice (e.g., `useAssistantStore`,
  `useSettingsStore`).
- Persist middleware for stores that survive app restart.
- Selectors via `useShallow` to prevent unnecessary re-renders.
- Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:`, `test:`,
  `docs:`.

## Development Workflow

### Small, Focused Commits

Each commit MUST represent a single logical change. Prefer many small PRs over
monolithic ones.

### Continuous Refactoring

Refactor as you go. If touching a file reveals tech debt, fix it in the same PR
(if small) or file a follow-up task. Never copy-paste code across modules —
extract shared logic into a utility or hook.

### Incremental Delivery

Features are delivered behind feature flags when incomplete. `main` is always
deployable. No long-lived feature branches; rebase daily.

### Demo-Ready Delivery

Every merged PR MUST leave the app in a state that can be demonstrated. If a
feature is partially built, gate it behind a flag — never leave broken UI on
`main`.

### Multi-Window State Sync

Zustand stores MUST synchronize state across Electron windows (main window,
mini-programs, popouts). Use the Zustand broadcast/sync middleware to ensure all
windows reflect the same truth.

## Governance

This constitution is the canonical reference for every AI coding agent and human
contributor working on the Angdu Studio codebase. If a pull request contradicts
this document, this document wins.

### Amendment Procedure

1. Propose the change with a written rationale.
2. Record the decision in `specs/history.md` with date and reasoning.
3. Update this document in the same PR.
4. Increment the version number per semantic versioning:
   - **MAJOR**: Principle removals or backward-incompatible redefinitions.
   - **MINOR**: New principles added or materially expanded guidance.
   - **PATCH**: Clarifications, wording, typo fixes.

### Operational Principles

1. **Single Source of Truth**: This constitution is the root authority. Derived
   specs MUST NOT contradict it.
2. **Append-Only History**: Decisions are never silently deleted. Superseded
   sections are marked `[SUPERSEDED]` and kept for audit.
3. **Agent Compliance**: Any AI coding agent MUST read this file before
   generating code and cite the relevant section when a design decision is
   non-obvious.
4. **Human Override**: A human maintainer may override any principle with a
   written rationale in `specs/history.md`, effective immediately.
5. **Continuous Validation**: CI checks SHOULD verify naming conventions,
   import boundaries, and coding conventions automatically.
6. **Scope Boundary**: This constitution covers architecture, conventions, and
   principles. Feature requirements, timelines, and team structure belong in
   separate spec documents.

**Version**: 1.0.0 | **Ratified**: 2026-03-07 | **Last Amended**: 2026-03-07
