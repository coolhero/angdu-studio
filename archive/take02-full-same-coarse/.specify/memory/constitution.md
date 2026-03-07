<!--
Sync Impact Report:
  Version change: template → 1.0.0
  Modified principles: All (initial finalization from template placeholders)
  Added sections:
    - Source Code Reference Principles (Same Stack)
    - 6 Architecture Principles (Electron-specific)
    - Technical Constraints (6 items)
    - Coding Conventions (8 areas)
    - 5 Project-Specific Principles
    - 6 Best Practice Principles
    - Global Evolution Layer Operational Principles
  Removed sections: None
  Templates status:
    - .specify/templates/plan-template.md: ✅ Compatible (Constitution Check section present)
    - .specify/templates/spec-template.md: ✅ Compatible (priority-based user stories align)
    - .specify/templates/tasks-template.md: ✅ Compatible (test-first task ordering supported)
  Follow-up TODOs: None
-->

# Cherry Studio Constitution

## Source Code Reference Principles

### Same Stack — Source as Implementation Reference
- **Original source location**: /Users/coolhero/Study/oss/cherry-studio
- When writing spec/plan for each Feature, MUST read and reference the original files specified in the Source Reference section of `pre-context.md`
- MUST prioritize reusing existing implementation patterns (design patterns, error handling, test structure)
- If designing differently from the existing implementation, MUST document the reason for the change in `plan.md`'s Complexity Tracking
- Reference existing code's test cases to ensure equivalent test coverage

## Core Principles

### I. Electron 3-Process Isolation
All inter-process communication goes through a typed IPC channel system defined in `packages/shared/IpcChannel.ts`. Renderer MUST never access Node.js APIs directly. Context isolation is enforced via `contextBridge.exposeInMainWorld` in the preload script.
- 260+ IPC channels define the communication contract between processes
- File operations, system access, and native features are exclusively in the main process
- Renderer is a pure React SPA with no Node.js access
- **Rationale**: Security boundary between web content and system access; prevents XSS from escalating to system-level exploits

### II. Plugin-Based AI Pipeline
AI request processing uses a composable plugin system with lifecycle hooks: `configureContext`, `onRequestStart`, `transformParams`, `transformResult`, `onRequestEnd`. New behaviors MUST be added as plugins, not by modifying the core executor.
- Each plugin is self-contained and composable via `PluginBuilder`
- Provider-specific behaviors (Anthropic cache, OpenRouter reasoning, Qwen thinking) are plugins
- Core executor in `packages/aiCore/` is provider-agnostic
- **Rationale**: 60+ provider support requires extensible, provider-specific behavior without core modification

### III. Message Block Decomposition
AI responses MUST be decomposed into typed blocks: MAIN_TEXT, THINKING, TRANSLATION, IMAGE, CODE, TOOL, FILE, ERROR, CITATION, VIDEO, COMPACT. Each block has its own lifecycle (`pending` → `processing` → `streaming` → `success|error|paused`) and status tracking.
- Blocks are stored independently with their own IDs, referenced by parent Message via `blockIds` array
- Each block type has a dedicated UI renderer component
- **Rationale**: Complex multi-modal responses need independent rendering, state management, and error handling per content type

### IV. Monorepo Package Separation
Core logic (`aiCore`), shared types (`shared`), tracing (`mcp-trace`), and extensions are separate packages with explicit dependency declarations in `pnpm-workspace.yaml`.
- Packages MUST have clear boundaries: no circular dependencies
- Shared types used across processes live in `packages/shared/`
- **Rationale**: Code reuse across Electron processes and potential publishability as npm packages

### V. Provider Abstraction Layer
All AI provider interactions go through a unified pipeline: provider config → AI SDK adapter (via factory) → executor. Provider-specific logic MUST be encapsulated in config files (`src/renderer/src/aiCore/provider/config/`) and plugins, not scattered in business logic.
- Adding a new provider requires only a config entry and optional plugin
- Provider type enum maps to Vercel AI SDK adapter via factory pattern
- **Rationale**: Provider API formats vary widely; isolation enables rapid adaptation to changes

### VI. Redux Toolkit State Management with Persistence
All UI state MUST be managed via Redux Toolkit `createSlice` with selective persistence via `redux-persist`. Runtime-only state (active tabs, tool permissions, streaming state) MUST be blacklisted from persistence.
- 28 Redux slices manage the complete application state
- Persistence uses localStorage with selective whitelist per slice
- State migrations handle schema changes across app versions
- **Rationale**: Consistent state management with crash recovery and version migration support

## Technical Constraints

| Area | Constraint |
|------|-----------|
| Runtime | Electron 40.6.1 + Node.js >=24.11.1 |
| Cross-platform | Windows (x64/arm64), macOS (x64/arm64), Linux (x64/arm64) |
| Database | Dexie (IndexedDB) in renderer process, LibSQL + Drizzle ORM in main process |
| Build | electron-vite with rolldown-vite backend |
| Multi-window | 5 renderer entry points: main, mini, selectionToolbar, selectionAction, traceWindow |
| Package format | pnpm monorepo with 5 internal packages (aiCore, shared, mcp-trace, extension-table-plus, ai-sdk-provider) |

## Coding Conventions

| Area | Convention |
|------|-----------|
| Naming | camelCase for variables/functions, PascalCase for types/classes/components, UPPER_CASE for constants |
| Project Structure | Process-based top level: `src/main/`, `src/preload/`, `src/renderer/` with feature-based pages |
| Error Handling | Chunk-level error handling with status transitions; block-level ErrorBlock for user-visible errors |
| Logging | Winston with daily rotation (main process), console-based with module filtering (renderer) |
| Testing | Vitest with 5 project configs (main, renderer, aiCore, shared, scripts) + Playwright E2E |
| Formatting | Biome: 2-space indent, LF line endings, 120-char width, single quotes, no semicolons |
| Linting | OxLint + ESLint with import sorting, unused import removal |
| i18n | i18next with 3 locale files (en-US, zh-CN, zh-TW) + auto-translation scripts |

## Project-Specific Principles

### 1. Multi-Provider Resilience
All provider-specific logic MUST be isolated in config/plugin layers. Core chat logic MUST be provider-agnostic. Provider failures (API errors, timeouts, rate limits) MUST NOT crash the app — they MUST result in user-visible error blocks with retry options.
- **Observed trait**: 60+ AI provider integrations with varied API formats
- **Rationale**: Provider APIs change frequently; isolation enables rapid adaptation

### 2. Streaming-First Architecture
All AI interactions MUST support streaming from day 1. Data models and UI MUST be designed around incremental updates (chunk-by-chunk), not request-response patterns. Non-streaming fallback is acceptable only as a compatibility shim for providers that do not support streaming.
- **Observed trait**: All chat responses use streaming with chunk-based processing
- **Rationale**: User experience with LLMs depends on perceived responsiveness

### 3. IPC Channel Contract Testing
Every IPC channel MUST have a typed contract (parameter types and return types defined in `packages/shared/`). Changes to IPC contracts MUST be verified against both main process handlers and renderer consumers.
- **Observed trait**: 260+ IPC channels in centralized enum with typed handlers
- **Rationale**: IPC is the critical process boundary; type mismatches cause silent runtime failures

### 4. Offline-First Data Strategy
The app MUST function fully offline. All user data is stored locally (IndexedDB + LibSQL). Cloud services (AI providers, sync backends) are enhancements, not requirements for core operation (settings, UI, data browsing).
- **Observed trait**: All data stored locally, cloud sync is optional backup
- **Rationale**: Desktop app users expect data locality and offline access

### 5. Graceful Degradation for External Services
All external service integrations MUST have explicit failure handling with user-visible feedback. Critical paths (chat, knowledge search, image generation) MUST have fallback mechanisms (modern SDK → legacy, vector search → text search, multiple preprocessing providers).
- **Observed trait**: Multiple fallback paths throughout the codebase
- **Rationale**: AI services, cloud storage, and search providers have varied reliability

## Development Best Practices

### I. Test-First (NON-NEGOTIABLE)
- MUST write tests before implementing any feature
- Acceptance Scenarios (Given/When/Then) from `spec.md` are the source of test cases
- In `tasks.md`, test tasks MUST precede implementation tasks
- Code without tests is not considered complete
- For bug fixes: MUST write a test that reproduces the bug first, then fix it
- **Verification criterion**: All tests MUST pass upon implement completion

### II. Think Before Coding
- MUST NOT assume. If unclear, mark it as `[NEEDS CLARIFICATION]` in the spec
- If multiple implementation approaches are possible, document alternatives and selection rationale in `plan.md`'s Complexity Tracking
- Expose trade-offs explicitly rather than hiding them
- **Verification criterion**: Every design decision MUST have an answer to "why?"

### III. Simplicity First
- Implement only what is specified in the spec. No speculative feature additions
- No premature abstraction for single-use code
- No abstractions/wrappers/utilities justified by "might need it later"
- If something done in 200 lines can be done in 50, rewrite it
- **Verification criterion**: All code MUST be directly traceable to a spec requirement

### IV. Surgical Changes
- MUST NOT "improve" adjacent code/comments/formatting when modifying existing code
- MUST NOT refactor what already works
- Only clean up imports/variables/functions that became unused due to your changes
- Respect existing code style and maintain consistency
- **Verification criterion**: Every changed line MUST be directly traceable to the current task

### V. Goal-Driven Execution
- Every task includes verifiable completion criteria
- Set completion criteria as "tests pass" instead of "implemented"
- For multi-step work, define verification methods for each step in advance
- **Verification criterion**: Automated verification (tests, build, lint) MUST pass upon each task completion

### VI. Demo-Ready Delivery
- Each Feature MUST be demonstrable upon completion — not just passing tests, but runnable and visually/functionally verifiable
- Maintain a centralized `demos/` directory at project root with per-Feature demo entry points
- Each `demos/F00N-name.md` MUST contain: Prerequisites, Setup commands, Demo walkthrough, Expected results
- If the Feature has no UI, MUST implement a minimal demo surface (CLI command, demo page, API playground, or script)
- Demo code MUST be categorized: demo-only (`// @demo-only`) vs promotable (`// @demo-scaffold`)
- **Verification criterion**: A non-developer stakeholder can follow `demos/F00N-name.md` and verify the Feature works

## Global Evolution Layer Operational Principles

### Cross-Feature Consistency
- Before running `/speckit.specify` for any Feature, MUST read `specs/reverse-spec/roadmap.md` and the Feature's `pre-context.md`
- When running `/speckit.plan` for any Feature, MUST reference `specs/reverse-spec/entity-registry.md` and `specs/reverse-spec/api-registry.md` to ensure entity/API compatibility
- When defining new entities or APIs, MUST update `entity-registry.md` and `api-registry.md`
- When cross-Feature dependencies change, MUST update the Dependency Graph in `roadmap.md`

## Governance

- This constitution supersedes all other development practices for the Cherry Studio redevelopment project
- Amendments require: documentation of the change, rationale, and impact analysis on existing Features
- All code reviews MUST verify compliance with the principles above
- Complexity and deviations from existing patterns MUST be justified in `plan.md` Complexity Tracking
- Constitution version follows semantic versioning (MAJOR.MINOR.PATCH)

**Version**: 1.0.0 | **Ratified**: 2026-03-02 | **Last Amended**: 2026-03-02
