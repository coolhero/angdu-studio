<!--
Sync Impact Report
==================
Version change: 0.0.0 (template) → 1.0.0
Added sections:
  - Core Architecture Principles (I–X)
  - Project-Specific Principles (XI–XIV)
  - Technical Constraints
  - Coding Conventions
  - Development Best Practices (I–VI)
  - Source Code Reference (New Stack Strategy)
  - Global Evolution Layer Operational Principles
  - Governance
Removed sections: None (initial creation)
Modified principles: None (initial creation)
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ compatible (Constitution Check section is dynamic)
  - .specify/templates/spec-template.md ✅ compatible (no constitution-specific references)
  - .specify/templates/tasks-template.md ✅ compatible (TDD phase structure aligns with Test-First)
Follow-up TODOs: None
-->

# Cherry Studio Constitution

## Core Architecture Principles

### I. Electron Process Isolation

All inter-process communication MUST go through typed IPC channels
defined in a centralized enum. No direct Node.js API access from the
renderer process. Context isolation MUST be enabled.

**Rationale**: Security boundary enforcement, single source of truth
for IPC contracts, centralized channel tracking for debugging.

### II. Service Layer Pattern

Data flow MUST follow: Component → Hook → Service → Store/IPC.
Components MUST NOT call IPC directly. Hooks abstract IPC calls
into clean, testable APIs.

**Rationale**: Separation of concerns, testability, consistent
and predictable data flow across the application.

### III. Multi-Provider Abstraction

AI provider differences MUST be abstracted behind a unified
interface. Provider-specific code MUST be confined to the
adapter/plugin layer.

**Rationale**: Support 60+ providers without coupling business
logic to any specific API format.

### IV. Plugin Architecture (aiCore)

AI capabilities MUST be extensible via plugins. The core engine
provides hooks; plugins register capabilities. No provider-specific
logic in the core execution path.

**Rationale**: Clean separation of AI provider specifics from core
streaming/execution logic. New providers added without modifying core.

### V. Typed IPC Channel System

All IPC channels MUST be defined as enum members in the shared
package. No string literal channels anywhere in the codebase.

**Rationale**: Type safety, refactoring support, compile-time
validation of channel names across main/preload/renderer.

### VI. Persistent State with Migration

All persisted state schemas MUST support forward migration. Schema
versions MUST be tracked. Migration functions MUST be registered and
run automatically on version mismatch.

**Rationale**: Users upgrade across versions; data MUST never be
lost or corrupted during schema evolution.

### VII. Multi-Window State Synchronization

State changes in one window MUST propagate to all other windows via
BroadcastChannel or IPC. Theme, config, and conversation data MUST
be consistent across main window and mini window.

**Rationale**: Desktop apps with multiple windows require consistent
user experience regardless of which window the user interacts with.

### VIII. Queue-Based Workload Management

Resource-intensive operations (RAG ingestion, file processing) MUST
use bounded queues with backpressure. Limits: max concurrent items
and max aggregate bytes MUST be configurable.

**Rationale**: Prevent OOM and UI freezes from unbounded concurrent
operations on user machines with varying resources.

### IX. Streaming-First Architecture

AI responses MUST be streamed token-by-token. No buffering of full
responses before display. UI MUST render incrementally as tokens
arrive.

**Rationale**: Immediate feedback for the user. Essential for large
responses and long-running generations.

### X. Desktop Data Sovereignty

All user data MUST be stored locally. No mandatory cloud dependency.
Optional cloud sync (WebDAV/S3) is strictly user-initiated and
opt-in.

**Rationale**: Privacy, offline capability, and user ownership of
their data are non-negotiable for a desktop application.

---

## Project-Specific Principles

### XI. Multi-Provider Resilience

All provider API calls MUST include timeout, retry with exponential
backoff, and graceful degradation to user-friendly error messages.
No provider failure may crash the application or block the UI.

**Rationale**: Provider APIs are external and unreliable. User
experience MUST NOT depend on any single provider's availability.

### XII. Block-Based Message Rendering

Message rendering MUST use a composable block system where each
block type (text, thinking, code, image, tool, citation, etc.) is
an independent, self-contained renderer component.

**Rationale**: Extensibility for new block types without modifying
core message rendering logic. Currently 12 block types.

### XIII. Embedding Dimension Normalization

All embedding vectors MUST be normalized to a fixed dimension (1536)
via zero-padding or truncation before storage and comparison.

**Rationale**: Consistent vector operations across providers.
Database schema stability regardless of which embedding model is
used.

### XIV. Deferred Resource Cleanup

Resource cleanup operations that can fail (file deletion on locked
files, directory removal with active DB connections) MUST use a
deferred retry mechanism with persistent tracking.

**Rationale**: Desktop apps cannot guarantee immediate file access.
Retry on next startup ensures eventual cleanup.

---

## Technical Constraints

| Area | Constraint |
|------|-----------|
| Platform | Cross-platform: macOS, Windows, Linux (inc. Wayland, AppImage, portable mode) |
| Runtime | Node.js with Electron 40 (Chromium) |
| Performance | Block-based message updates (throttled), max 30 concurrent KB tasks, 80MB workload cap |
| Security | AES encryption for sensitive data, context isolation enabled, web security disabled for cross-origin API calls |
| Data | Forward-only migrations, soft delete for memory, deferred deletion for knowledge files |
| Concurrency | Rate limiting per provider (configurable), debounced file watching (1000ms) |

---

## Coding Conventions

| Area | Convention |
|------|-----------|
| Naming | camelCase for variables/functions, PascalCase for classes/components/types, UPPER_SNAKE_CASE for constants |
| Project Structure | Feature-based directories under `src/renderer/src/`, service-based under `src/main/services/` |
| Error Handling | try-catch with logger in services/migrations, error results in IPC handlers, `Promise.allSettled` for resilient cleanup |
| Logging | Winston with daily rotation (10MB/30d, error 60d), context-scoped via `withContext(module)`, dev overrides via `CSLOGGER_*` env vars |
| Testing | Vitest for unit/integration, Playwright for E2E, `vi.hoisted()` pattern for mocks |
| State | Zustand stores with persist middleware, BroadcastChannel sync across windows |
| Styling | Tailwind CSS 4 utility classes, CSS variables for theming, no styled-components |
| Components | shadcn/ui + Radix UI primitives, composable pattern |
| Routing | TanStack Router with file-based route generation |
| Validation | Zod for runtime validation, TypeScript for compile-time type safety |

---

## Development Best Practices

### I. Test-First (NON-NEGOTIABLE)

Write tests before implementing any feature. Acceptance Scenarios
from spec.md are the source of test cases. Code without tests is
not considered complete.

**Verification**: All tests MUST pass upon implement completion.

### II. Think Before Coding

Do not assume. If unclear, mark as `[NEEDS CLARIFICATION]`.
Document alternatives and selection rationale in plan.md. Every
design decision MUST have an answer to "why?"

### III. Simplicity First

Implement only what is specified in the spec. No premature
abstraction for single-use code. All code MUST be directly
traceable to a spec requirement.

### IV. Surgical Changes

No "improving" adjacent code when modifying existing code. Only
clean up imports/variables that became unused due to your changes.
Every changed line MUST be directly traceable to the current task.

### V. Goal-Driven Execution

Every task includes verifiable completion criteria. Set completion
criteria as "tests pass" instead of "implemented". Automated
verification MUST pass upon each task completion.

### VI. Demo-Ready Delivery

Each Feature MUST be demonstrable upon completion. Maintain
`demos/` directory with executable demo scripts per Feature.
"Tests pass" alone does NOT satisfy this criterion.

**Verification**: Running `./demos/F00N-name.sh` demonstrates
the Feature works end-to-end.

---

## Source Code Reference (New Stack Strategy)

- **Original source**: `/Users/coolhero/Study/oss/cherry-studio`
- **Extract**: What (functionality), Why (rationale), business rules,
  edge cases, user scenarios
- **Ignore**: How (implementation approach), Ant Design components,
  Redux patterns, styled-components, React Router v6 patterns

---

## Global Evolution Layer Operational Principles

- Before `/speckit.specify`, always read `roadmap.md` and the
  Feature's `pre-context.md`
- During `/speckit.plan`, reference `entity-registry.md` and
  `api-registry.md` for cross-Feature consistency
- When defining new entities/APIs, update the corresponding
  registries immediately
- When cross-Feature dependencies change, update the Dependency
  Graph in `roadmap.md`

---

## Governance

This constitution supersedes all other development practices for
the Cherry Studio project. Compliance is verified at each pipeline
step.

**Amendment Procedure**:
1. Propose change with rationale
2. Evaluate impact on existing Features (completed and in-progress)
3. Version bump per semantic versioning (MAJOR/MINOR/PATCH)
4. Update all affected templates and downstream artifacts

**Versioning Policy**:
- MAJOR: Principle removal or backward-incompatible redefinition
- MINOR: New principle added or materially expanded guidance
- PATCH: Clarifications, wording, non-semantic refinements

**Compliance Review**:
- `speckit-plan` Constitution Check gate validates alignment
- `speckit-analyze` checks cross-artifact consistency
- `smart-sdd verify` confirms implementation matches principles

**Version**: 1.0.0 | **Ratified**: 2026-03-04 | **Last Amended**: 2026-03-04
