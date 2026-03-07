<!--
Sync Impact Report
==================
Version change: N/A → 1.0.0
Added sections:
  - Core Principles (7 architecture principles)
  - Project-Specific Principles (6 domain principles)
  - Development Best Practices (6 practices)
  - Source Code Reference Strategy
  - Technical Constraints
  - Coding Conventions
  - Global Evolution Layer Operational Principles
  - Governance
Removed sections: None (initial creation)
Templates requiring updates:
  - .specify/templates/plan-template.md — ✅ Compatible (Constitution Check section exists)
  - .specify/templates/spec-template.md — ✅ Compatible (FR/SC structure aligns)
  - .specify/templates/tasks-template.md — ✅ Compatible (test-first pattern aligns)
Follow-up TODOs: None
-->

# Cherry Studio Constitution

## Core Principles

### I. Electron Process Isolation

All cross-process communication between the main process (Node.js) and
renderer process (browser) MUST go through typed IPC channels defined in
the `@shared/IpcChannel` enum. The renderer MUST NOT directly access
Node.js APIs. Every new IPC channel MUST be added to the central enum
before use.

**Rationale**: Security and stability — context isolation enforces clear
boundaries. A single enum prevents channel name mismatches at compile time.

### II. Service Layer Pattern

Business logic MUST be encapsulated in dedicated service classes. Pages
and components consume services via hooks; they MUST NOT directly
manipulate data stores or call IPC channels. The layering is:
Component → Hook → Service → Store/IPC.

**Rationale**: Separation of concerns — UI components remain focused on
rendering, services handle orchestration, and the migration from Redux to
Zustand stays contained in the service/store layer.

### III. Multi-Provider Abstraction

All AI provider interactions MUST go through the unified aiCore
abstraction layer. Provider-specific logic MUST be isolated in option
builders and provider factories. No component or service outside aiCore
may import a provider SDK directly.

**Rationale**: Supporting 15+ LLM providers requires a clean abstraction
to avoid sprawling conditional logic and to enable adding new providers
without modifying consumer code.

### IV. Plugin Architecture for Extensibility

The aiCore engine MUST use a plugin system with three hook categories
(First, Sequential, Parallel) and enforce ordering (pre/default/post).
MCP servers follow a similar extensible pattern. New behaviors MUST be
added via plugins rather than modifying core execution paths.

**Rationale**: Extensibility without core modification. New providers,
tools, and processing behaviors can be added via plugins.

### V. Typed IPC Channel System

Every IPC channel MUST be defined as an enum member in `@shared/IpcChannel`.
Both main and renderer MUST reference the same enum, ensuring type-safe
communication. Orphaned or string-literal channel names are prohibited.

**Rationale**: Prevents runtime errors from mismatched channel names.
Enables IDE navigation, refactoring, and exhaustiveness checks.

### VI. Persistent State with Migration

Every persisted schema change (Zustand stores, Dexie IndexedDB, Drizzle
SQLite, backup format) MUST have a forward migration. Breaking changes
to stored data MUST include a versioned migration path. Migrations MUST
be tested with production-like datasets.

**Rationale**: Desktop app users may skip multiple versions. Migrations
must handle any-to-current upgrades without data loss.

### VII. Multi-Window State Synchronization

Select state slices MUST be synchronized across Electron windows via a
BroadcastChannel-based sync service. Changes in one window MUST be
reflected in all others within one event-loop tick. The set of synced
slices MUST be explicitly declared.

**Rationale**: Desktop apps can have multiple windows (main, mini,
selection assistant) that must stay in sync for a consistent UX.

## Project-Specific Principles

### VIII. AI Provider Idempotency

All AI provider interactions MUST be idempotent. Failed streaming
requests MUST be safely resumable without data corruption. Partial
responses MUST NOT corrupt message state — the block manager MUST
atomically commit or discard partial blocks.

**Rationale**: Network interruptions and provider errors are common.
Users expect to retry without losing their conversation state.

### IX. Streaming-First Architecture

All AI response handling MUST be designed as streaming-first.
Non-streaming is a special case of streaming (single chunk). The
block-based message architecture MUST enable progressive rendering.
UI updates during streaming MUST be throttled (150ms minimum) to
prevent layout thrashing.

**Rationale**: Modern LLM APIs are inherently streaming. Treating
non-streaming as the default leads to poor perceived latency.

### X. Desktop Data Sovereignty

All user data MUST be stored locally (SQLite, IndexedDB, filesystem).
No mandatory cloud dependency is permitted. Backup destinations MUST
be user-chosen (WebDAV, S3, local). No telemetry or cloud storage
without explicit opt-in. All data MUST be exportable.

**Rationale**: Privacy-conscious users choose desktop apps specifically
for data sovereignty. Violating this trust is a non-starter.

### XI. Graceful Provider Degradation

Multi-provider operations MUST use the `Promise.allSettled` pattern.
A single provider failure MUST NOT break the entire operation (tool
aggregation, knowledge search, multi-model dispatch). Failed providers
MUST be reported to the user without blocking successful ones.

**Rationale**: Users configure multiple providers. One being down
should not prevent using others.

### XII. Schema Migration Discipline

Every persisted format (Zustand persist, Dexie, Drizzle, backup)
MUST use explicit version numbers. Each version bump MUST include a
migration function. Rollback is not required, but forward-only
migration MUST handle any-version-to-current upgrades.

**Rationale**: Desktop app release cadence means users may skip
multiple versions. Data integrity during upgrade is non-negotiable.

### XIII. MCP Protocol Compliance

MCP integration MUST strictly follow the official Model Context
Protocol specification. Custom extensions MUST be clearly separated
from standard protocol behavior. Transport selection (stdio, SSE,
StreamableHTTP) MUST be configurable per server.

**Rationale**: MCP is an evolving standard. Strict compliance ensures
interoperability with any MCP-compliant tool server.

## Development Best Practices

### XIV. Test-First (NON-NEGOTIABLE)

- Write tests before implementing any feature
- Acceptance Scenarios (Given/When/Then) from spec.md are the source
  of test cases
- In tasks.md, test tasks MUST always precede implementation tasks
- Code without tests is not considered complete
- For bug fixes: write a test that reproduces the bug first, then fix it
- **Verification**: All tests MUST pass upon implement completion

### XV. Think Before Coding

- Do not assume. If unclear, mark it as `[NEEDS CLARIFICATION]` in the spec
- If multiple implementation approaches are possible, document
  alternatives and selection rationale in plan.md Complexity Tracking
- Expose trade-offs explicitly rather than hiding them
- **Verification**: Every design decision MUST have an answer to "why?"

### XVI. Simplicity First

- Implement only what is specified in the spec. No speculative additions
- No premature abstraction for single-use code
- No abstractions/wrappers/utilities justified by "might need it later"
- If something done in 200 lines can be done in 50, rewrite it
- **Verification**: All code MUST be directly traceable to a spec requirement

### XVII. Surgical Changes

- No "improving" adjacent code/comments/formatting when modifying
  existing code
- Do not refactor what already works
- Only clean up imports/variables/functions that became unused due to
  your changes
- Respect existing code style and maintain consistency
- **Verification**: Every changed line MUST be directly traceable to the
  current task

### XVIII. Goal-Driven Execution

- Every task includes verifiable completion criteria
- Set completion criteria as "tests pass" instead of "implemented"
- For multi-step work, define verification methods for each step
  in advance
- **Verification**: Automated verification (tests, build, lint) MUST pass
  upon each task completion

### XIX. Demo-Ready Delivery

- Each Feature MUST be demonstrable upon completion — not just passing
  tests, but runnable and visually/functionally verifiable
- Maintain a centralized `demos/` directory at the project root
- "Demo-ready" means: the Feature can be started, exercised through its
  core user flows, and the results observed
- If the Feature has no UI, implement a minimal demo surface (CLI
  command, demo script, API playground)
- **Verification**: A non-developer stakeholder can follow
  `demos/F00N-name.md` and verify the Feature works — "npm test passes"
  alone does NOT satisfy this criterion

## Source Code Reference Strategy

### New Stack — Source as Logic Reference Only

- **Original source location**: `/Users/coolhero/Study/oss/cherry-studio`
- When writing spec/plan for each Feature, read the original files in
  the Source Reference section of `pre-context.md` to understand the
  business logic and requirements
- **Do not reference** existing code's implementation patterns (Ant Design
  components, styled-components, Redux Toolkit slices, React Router v6)
- **Extract**: What (functionality), Why (rationale), business rules,
  edge cases
- **Ignore**: How (implementation approach), technology-dependent patterns
- Prioritize idiomatic patterns of the new stack: shadcn/ui + Radix,
  Tailwind CSS 4, Zustand stores, TanStack Router

## Technical Constraints

| Area | Constraint |
|------|-----------|
| Platform | Cross-platform: macOS, Windows, Linux with platform-specific code paths |
| Node Version | Node.js >= 24.11.1 |
| Performance | Throttled block updates (150ms) with RAF for streaming UI |
| Performance | Max 30 concurrent knowledge base processing tasks, 80MB workload limit |
| Security | AES encryption for file storage, timing-safe API key comparison |
| Security | Sensitive data redaction in MCP logs (authorization, apiKey, token fields) |
| Data | Soft-delete pattern for memories with SHA-256 deduplication |
| Data | ZIP64 support for large backups, streaming writes |
| AI | Rate limiting per provider with configurable intervals |
| AI | Context window management with configurable message count |

## Coding Conventions

| Area | Convention |
|------|-----------|
| Naming | camelCase for variables/functions, PascalCase for components/classes/types |
| Project Structure | Feature-based: pages/, components/, hooks/, services/, store/, types/ |
| Error Handling | Centralized error middleware for API server; per-service try-catch with logging |
| Logging | Structured logging via LoggerService with module context (`withContext()`) |
| Testing | Vitest with collocated `__tests__/` directories |
| State | Zustand stores with persist middleware; async operations as store actions |
| IPC | Enum-based channel names, `ipcMain.handle` for request-response, `webContents.send` for push |
| Validation | Zod schemas for API input validation and entity schema validation |
| Styling | Tailwind CSS 4 utility classes only; `cn()` helper for conditional classes |
| Components | shadcn/ui + Radix UI primitives; no Ant Design |
| Routing | TanStack Router with type-safe routes and search params |

## Global Evolution Layer Operational Principles

### Cross-Feature Consistency

- Before running /speckit.specify for any Feature, MUST read
  `specs/reverse-spec/roadmap.md` and the Feature's `pre-context.md`
- When running /speckit.plan for any Feature, MUST reference
  `specs/reverse-spec/entity-registry.md` and
  `specs/reverse-spec/api-registry.md` to ensure entity/API compatibility
- When defining new entities or APIs, MUST update entity-registry.md
  and api-registry.md after the plan step
- When cross-Feature dependencies change, MUST update the Dependency
  Graph in roadmap.md

## Governance

This constitution is the supreme governing document for Cherry Studio
development. All spec.md, plan.md, and tasks.md artifacts MUST comply
with these principles.

**Amendment procedure**:
1. Propose the change with rationale in the current pipeline step
2. Obtain explicit user approval via checkpoint
3. Apply the change with a MINOR version bump (or MAJOR if removing
   or redefining an existing principle)
4. Record the change in `sdd-state.md` Constitution Update Log
5. If the change affects already-completed Features, document the
   impact scope

**Compliance review**: Every plan.md Constitution Check section MUST
verify alignment with all principles above. Violations MUST be
justified in the Complexity Tracking section.

**Version**: 1.0.0 | **Ratified**: 2026-03-04 | **Last Amended**: 2026-03-04
