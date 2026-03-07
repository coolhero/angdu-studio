<!--
Sync Impact Report
- Version change: 0.0.0 (template) → 1.0.0
- Added sections: Core Principles (11 principles), Source Code Reference, Technical Constraints, Coding Conventions, Global Evolution Layer, Governance
- Removed sections: All placeholder sections from template
- Templates requiring updates: None (templates are generic and compatible)
- Follow-up TODOs: None
-->

# Cherry Studio Constitution

## Source Code Reference

### New Stack Strategy — Source as Logic Reference Only

- **Original source location**: /Users/coolhero/Study/oss/cherry-studio
- When writing spec/plan for each Feature, read the original files specified in the Source Reference section of `pre-context.md` to **understand the business logic and requirements**
- **Do NOT reference** existing code's implementation patterns for: Redux Toolkit (migrating to Zustand), Ant Design/Styled Components (migrating to Shadcn/ui + TailwindCSS), LibSQL (migrating to better-sqlite3)
- **Extract**: What (functionality), Why (rationale), business rules, edge cases
- **Ignore**: How (implementation approach), technology-dependent patterns
- Prioritize idiomatic patterns of the new stack (Zustand stores, Shadcn/ui components, better-sqlite3 queries)
- **CAN reference**: TypeScript patterns, Electron architecture, Drizzle ORM patterns, React patterns, Vitest/Playwright test patterns (these are kept)

## Core Principles

### I. Dual-Process Architecture (Electron Main + Renderer)

- Business logic requiring Node.js APIs (file I/O, child processes, network, SQLite) MUST run in the main process
- UI logic MUST run in the renderer process
- Communication between processes MUST happen exclusively via typed IPC channels
- Renderer MUST NOT import Node.js modules directly
- Context isolation MUST be enabled at all times

### II. Centralized IPC Channel Registry

- All IPC channel names MUST be defined in a single shared enum (`IpcChannel`)
- Both main and renderer MUST import channel names from this shared source
- No string literal channel names are permitted anywhere in the codebase
- Every IPC channel MUST have TypeScript type definitions for request and response

### III. Provider Abstraction Layer

- AI provider specifics MUST be abstracted behind a unified provider interface
- Provider-specific logic MUST be isolated in adapter/client classes
- New providers MUST be addable without modifying core pipeline code
- Provider configuration MUST be centralized and consistently structured

### IV. Feature-Scoped Zustand Stores

- Each logical feature MUST own its own Zustand store with clear boundaries
- No cross-store direct mutations are permitted
- Cross-feature communication MUST happen via subscriptions or explicit actions
- Each store MUST be independently testable

### V. Streaming-First Message Architecture

- Messages MUST be split into Message (metadata) + MessageBlock (content) entities
- Blocks MUST be updatable independently during streaming for efficient partial updates
- Streaming updates MUST be throttled to prevent UI jank
- Abort/cancel operations MUST cleanly terminate streams and roll back partial state

### VI. Monorepo Package Isolation

- Shared code (types, constants, utilities) MUST live in dedicated packages
- No circular dependencies between packages are permitted
- Path aliases MUST be used for cross-package imports
- Each package MUST be independently buildable

## Project-Specific Principles

### VII. Multi-Provider AI Resilience

- All AI provider calls MUST include retry logic with exponential backoff
- Provider-specific error codes MUST be mapped to a unified error taxonomy
- Fallback to alternative providers SHOULD be configurable per assistant
- API key rotation MUST be supported for load distribution

### VIII. Streaming Pipeline Idempotency

- All streaming operations MUST be idempotent — cancelling and retrying a stream MUST NOT produce duplicate content
- Block IDs MUST be deterministic or deduplicable
- Partial state MUST be cleanable on abort
- No orphaned blocks or messages may remain after cancellation

### IX. Offline-First Desktop Design

- All core features MUST work offline (conversation history, settings, stored knowledge)
- Network-dependent features (AI completion, sync) MUST degrade gracefully with clear user feedback
- Local data MUST NEVER be lost due to sync failures
- The application MUST start and be usable without any network connection

### X. MCP Tool Safety

- All MCP tool executions MUST go through the permission system
- Auto-approved tools MUST be explicitly whitelisted per server
- Tool inputs MUST be sanitized before execution
- Tool execution timeouts MUST be enforced
- No tool may access resources outside its declared scope

### XI. Data Migration Robustness

- Every schema change MUST have a forward migration
- Migrations MUST be tested with representative data
- The app MUST handle corrupted/missing migration state gracefully (reset to defaults rather than crash)
- Migration failures MUST be logged and reported, never silently swallowed

## Technical Constraints

| Area | Constraint |
|------|-----------|
| Platform | MUST support Windows, macOS, Linux |
| Node Version | Node >= 24.11.1 required |
| Security | Context isolation enabled; renderer cannot access Node.js APIs directly |
| Memory | Node max-old-space-size=8000 for build |
| Bundle | Main process bundled as single file; renderer uses code-splitting |
| DB | SQLite (better-sqlite3) for structured data (main process), IndexedDB (Dexie) for UI state (renderer) |
| i18n | 14+ languages supported; English and Chinese are primary |
| Protocol | Custom protocol `cherrystudio://` for deep linking and OAuth callbacks |

## Coding Conventions

| Area | Convention |
|------|-----------|
| Naming | camelCase for variables/functions, PascalCase for components/classes/types, SCREAMING_SNAKE for constants |
| Project Structure | Feature-based directory structure with pages/, components/, hooks/, services/, stores/ |
| Error Handling | Centralized via LoggerService (no console.log); structured logging with source modules |
| Logging | Log levels: silly/debug/info/warn/error; daily log rotation in main process |
| Testing | Vitest for unit tests, Playwright for E2E; tests in `__tests__/` directories or `tests/` root |
| Formatting | Biome formatter: 120 char line width, arrow parens always, semicolons as-needed |
| Linting | ESLint flat config + Oxlint; no template literals in i18n, no console.log |
| Imports | Auto-sorted via simple-import-sort; unused imports detected and removed |
| Types | Domain types in dedicated type files; shared types in packages; Zod for runtime validation |
| State | Zustand stores with clear feature boundaries; persist via zustand/middleware |
| UI | Shadcn/ui components + TailwindCSS; no inline styles; design tokens via CSS variables |

## Best Practices

### I. Test-First (NON-NEGOTIABLE)

- Write tests before implementing any feature
- Acceptance Scenarios (Given/When/Then) from spec.md are the source of test cases
- In tasks.md, test tasks MUST always precede implementation tasks
- Code without tests is not considered complete
- For bug fixes: write a test that reproduces the bug first, then fix it
- **Verification criterion**: All tests MUST pass upon implement completion

### II. Think Before Coding

- Do not assume. If unclear, mark it as `[NEEDS CLARIFICATION]` in the spec
- If multiple implementation approaches are possible, document alternatives and selection rationale in plan.md's Complexity Tracking
- Expose trade-offs explicitly rather than hiding them
- **Verification criterion**: Every design decision MUST have an answer to "why?"

### III. Simplicity First

- Implement only what is specified in the spec. No speculative feature additions
- No premature abstraction for single-use code
- No abstractions/wrappers/utilities justified by "might need it later"
- If something done in 200 lines can be done in 50, rewrite it
- **Verification criterion**: All code MUST be directly traceable to a spec requirement

### IV. Surgical Changes

- No "improving" adjacent code/comments/formatting when modifying existing code
- Do not refactor what already works
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
- Maintain a centralized `demos/` directory at the project root
- "Demo-ready" means: the Feature can be started, exercised through its core user flows, and the results observed
- If the Feature has no UI, implement a minimal demo surface (CLI command, simple demo page, or demo script)
- **Verification criterion**: A non-developer stakeholder can follow demos/F00N-name.md and verify the Feature works

## Global Evolution Layer Operational Principles

### Cross-Feature Consistency

- Before running /speckit.specify for any Feature, MUST read `specs/reverse-spec/roadmap.md` and the Feature's `pre-context.md`
- When running /speckit.plan for any Feature, MUST reference `specs/reverse-spec/entity-registry.md` and `specs/reverse-spec/api-registry.md` to ensure entity/API compatibility
- When defining new entities or APIs, MUST update entity-registry.md and api-registry.md
- When cross-Feature dependencies change, MUST update the Dependency Graph in roadmap.md

## Governance

- This Constitution supersedes all other development practices for this project
- Amendments require: documentation of the change, rationale, and impact analysis on existing Features
- All code reviews MUST verify compliance with the principles above
- Complexity beyond what the spec requires MUST be justified in plan.md's Complexity Tracking
- Constitution version follows semantic versioning (MAJOR.MINOR.PATCH)

**Version**: 1.0.0 | **Ratified**: 2026-03-02 | **Last Amended**: 2026-03-02
