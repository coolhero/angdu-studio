<!--
Sync Impact Report
- Version: 0.0.0 → 1.0.0 (MAJOR — initial ratification)
- Added sections: Core Principles (6), Architecture (5), Technical Constraints (8),
  Coding Conventions, Naming, Domain Principles (5), AI Archetype (5),
  Electron Framework (5), Governance
- Removed sections: All template placeholders
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ no update needed (Constitution Check is generic)
  - .specify/templates/spec-template.md ✅ no update needed (structure compatible)
  - .specify/templates/tasks-template.md ✅ no update needed (phase structure compatible)
- Follow-up TODOs: none
-->

# Angdu Studio Constitution

## Core Principles

### I. Single Source of Truth (SSoT)

Every piece of knowledge — a type definition, a configuration default,
a validation rule — MUST exist in exactly one place. All consumers
reference that source.

- **Types**: Shared types live in `@angdu/shared`. Main and renderer
  import from there.
- **Config defaults**: Defined once in a defaults module, spread into
  stores and UI.
- **Validation**: Schema defined once (Zod), used for both runtime
  validation and TypeScript type inference.
- **IPC contracts**: Channel names and payload types defined in shared,
  used by both preload and handlers.

### II. Explicit Over Implicit

No magic. Every behavior MUST be traceable from its trigger to its
effect by reading the code.

- Zustand actions are named functions, not anonymous reducers.
- Side effects are clearly separated from pure state transitions.
- Every IPC handler is registered explicitly with a typed channel name.
- Dependencies are injected, not imported from global scope
  (especially in main process services).

### III. Fail Loudly, Recover Gracefully

Errors MUST be visible to developers and recoverable for users.

- **Development**: Errors throw, warnings are logged with context,
  silent failures are bugs.
- **Production**: User-facing errors include actionable guidance.
  Background operations retry with backoff. Critical failures trigger
  state persistence before crash.
- **IPC boundary**: Errors crossing the IPC bridge are serialized with
  type, message, and context. Never swallowed.

### IV. Composition Over Inheritance

Build behavior by composing small, focused units. Avoid class
hierarchies.

- **UI**: Compose components from shadcn/ui primitives + Tailwind
  utilities.
- **State**: Compose Zustand stores with middleware (persist, devtools,
  immer).
- **Services**: Compose functionality through dependency injection and
  function composition.
- **Providers**: Each LLM provider is a composed adapter, not a
  subclass.

### V. Test the Contract, Not the Implementation

Tests verify behavior, not internal structure. Refactoring MUST NOT
break tests.

- **IPC contracts**: Test that sending message X produces response Y
  across the bridge.
- **Store actions**: Test that dispatching action A produces state B,
  regardless of how.
- **Components**: Test user-visible behavior (render, interact, assert),
  not DOM structure.
- **Providers**: Test that each adapter conforms to the unified
  interface contract.

### VI. Progressive Enhancement of Features

Features are built in layers. Each layer is independently shippable
and testable.

- **Layer 0**: Data model and storage (works without UI).
- **Layer 1**: Basic CRUD UI (works without AI).
- **Layer 2**: AI integration with single provider (works without
  multi-provider).
- **Layer 3**: Multi-provider, advanced features, optimizations.
- Each layer has its own acceptance criteria and can be verified
  independently.

## Architecture Principles

### ARC-01: Process Crash Isolation via IPC Bridge

All communication between main and renderer processes MUST go through
a typed IPC bridge defined in a preload script. The renderer MUST NOT
have direct access to Node.js APIs.

**Rationale**: Electron's multi-process model exists for crash isolation
and security. If the renderer crashes, the main process (and all
persistent services) survive. Direct Node.js access from the renderer
bypasses Chromium's sandbox and creates security vulnerabilities.

### ARC-02: Streaming-First LLM Pipeline

All LLM responses MUST be processed as streams, never buffered to
completion before rendering. The pipeline follows:
Provider SDK stream → ChunkType classification → Block-based message
assembly → Incremental DOM update.

**Rationale**: LLM responses can take 10–60 seconds to complete.
Buffering destroys perceived performance. Streaming also enables early
cancellation, token-by-token rendering, and progressive UI updates
(thinking blocks, code blocks, tool calls).

### ARC-03: Provider Abstraction Layer

LLM provider-specific logic MUST be encapsulated behind a unified
interface. Application code MUST NOT contain provider-specific
conditionals outside the abstraction layer.

**Rationale**: The AI landscape changes monthly. A clean abstraction
layer means adding a provider requires implementing one adapter, not
modifying every callsite. Vercel AI SDK provides the unified streaming
interface.

### ARC-04: Service Singleton Pattern in Main Process

Main process services (configuration, file storage, MCP, database)
MUST be implemented as singletons, accessed from renderer exclusively
via IPC.

**Rationale**: Main process services manage shared resources. Multiple
instances would cause resource contention, data corruption, and memory
waste. Singleton + IPC ensures a single source of truth.

### ARC-05: Dual Storage Architecture

Structured relational data MUST be stored in SQLite (accessed from main
process via Drizzle ORM). Client-side cache and UI state MUST use
IndexedDB (Dexie) in the renderer. State that must survive renderer
crashes MUST live in SQLite.

**Rationale**: SQLite provides ACID transactions and survives renderer
crashes (runs in main process). IndexedDB provides fast renderer-local
reads without IPC round-trips.

## Technical Constraints

| ID | Constraint | Value | Rationale |
|----|-----------|-------|-----------|
| TC-01 | Electron version | v40+ (latest stable) | BrowserWindow API stability, security patches |
| TC-02 | Node.js version | >= 24.11.1 | ESM support, native module compatibility |
| TC-03 | React version | 19 with concurrent features | Streaming UI requires concurrent rendering |
| TC-04 | TypeScript mode | Strict | IPC type safety across process boundaries |
| TC-05 | V8 heap limit | 8GB max-old-space-size | Large AI contexts (100k+ token conversations) |
| TC-06 | Context isolation | Mandatory (true) | Electron security — prevents prototype pollution |
| TC-07 | Node integration | Disabled (false) | Electron security — renderer uses IPC bridge |
| TC-08 | Sandbox | Enabled | Electron security — renderer in Chromium sandbox |

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Electron v40+ |
| UI Framework | React 19 |
| Component Library | shadcn/ui + Tailwind CSS 4 |
| State Management | Zustand |
| CSS | Tailwind CSS 4 |
| Database | better-sqlite3 + Drizzle ORM |
| Language | TypeScript (strict) |
| AI SDK | Vercel AI SDK |
| API Framework | Express |
| Build | electron-vite |

## Coding Conventions

| Category | Convention | Example |
|----------|-----------|---------|
| Variables & functions | camelCase | `getUserMessages`, `isStreaming` |
| Components & classes | PascalCase | `MessageBlock`, `ConfigManager` |
| Constants & enums | UPPER_SNAKE_CASE / PascalCase | `ChunkType.TEXT`, `MAX_RETRIES` |
| File naming (components) | PascalCase | `MessageBlock.tsx` |
| File naming (utils/services) | camelCase or kebab-case | `chat-completion.ts` |
| Directory structure | Feature-based | `pages/home/`, `pages/settings/` |
| State stores | Domain-based slices | One store per domain |
| IPC handlers | Verb-noun pattern | `get-providers`, `send-message` |
| Imports | Absolute paths with aliases | `@renderer/`, `@main/`, `@shared/` |
| Type definitions | Shared types in `@shared/types` | Types used by both processes |

### Naming — Identity Mapping

| Original | Replacement | Scope |
|----------|-------------|-------|
| Cherry Studio | Angdu Studio | Product name, window titles, about dialogs |
| @cherrystudio/ | @angdu/ | Package scope |
| CherryStudio | AngduStudio | PascalCase (class names, types) |
| CHERRY_STUDIO | ANGDU_STUDIO | UPPER_SNAKE_CASE (env vars, constants) |

No Cherry references in any generated code, comments, or documentation.

## Domain-Specific Principles

### PSP-01: Conversation as First-Class Entity

A conversation is the primary data structure. All messages, tool calls,
attachments, and metadata belong to a conversation. Conversations MUST
be independently portable (exportable, shareable, restorable).

### PSP-02: Model Configuration Portability

Model configurations (provider + model + parameters) MUST be
serializable and storable independently of the conversation that uses
them. Users MUST be able to create, name, and reuse configurations.

### PSP-03: Graceful Provider Degradation

When a provider fails (network error, rate limit, auth failure), the
application MUST present a clear error with the provider name, error
type, and suggested action. It MUST NOT crash or show generic errors.

### PSP-04: Attachment Pipeline Abstraction

File attachments MUST be processed through a pipeline that: validates
type/size, extracts content where applicable, stores the artifact, and
references it in the message.

### PSP-05: Knowledge Base Isolation

RAG knowledge bases MUST be isolated per user-defined scope
(per-assistant, per-topic, or global). Embedding indices MUST be
independently rebuildable without affecting other knowledge bases.

## AI Assistant Archetype

### A1-01: Streaming-First Rendering

The UI rendering pipeline MUST be designed around incremental updates.
Components MUST handle partial data (incomplete markdown, mid-code-block,
partial tool call JSON). React concurrent features (useTransition,
Suspense) are required to prevent streaming updates from blocking user
interactions.

### A1-02: Model Agnosticism

No application-level code may assume a specific provider's capabilities.
Feature availability (vision, tool use, streaming, JSON mode) MUST be
checked per-model via capability flags. The AI core package
(`@angdu/ai-core`) is the sole location for provider-specific logic.

### A1-03: Offline Resilience

The application MUST be fully functional for reading and managing
existing conversations without network access. New message sending may
fail gracefully, but browsing, searching, and editing existing data
MUST work offline. All data lives locally by default.

### A1-04: Token Awareness

Token counts MUST be tracked and displayed for every message exchange.
The system MUST support configurable token budget warnings. Cost
estimation SHOULD be available when provider pricing is known.
First-token latency is a key UX metric.

### A1-05: Prompt Versioning

System prompts SHOULD be versioned entities with change history. Users
iterating on prompts need to compare versions and rollback.
Implementation priority is secondary to core features but MUST be
architecturally planned for.

## Electron Framework Philosophy

### F7-01: Process Crash Isolation

The main process MUST survive renderer crashes. Critical state MUST be
persisted outside the renderer. Crash recovery handlers in the main
process detect renderer failures and can restart the window without
data loss.

### F7-02: Memory Budget Discipline

Minimize the number of BrowserWindows (prefer single-window with
tab-based navigation). Offload heavy computation (embedding generation,
file parsing) to worker threads or child processes. Implement
conversation virtualization for long chat histories.

### F7-03: Native Feel

Desktop applications MUST feel native to the platform. Use
platform-appropriate titlebar, respect system keyboard shortcuts,
support native drag-and-drop, integrate with system tray/dock, use
native file dialogs, follow system dark/light mode preference.

### F7-04: Secure by Default

Context isolation and sandbox are mandatory. `nodeIntegration` is
always `false`. Every main→renderer API surface goes through
`contextBridge.exposeInMainWorld`. The preload script is the security
boundary. No dynamic IPC channel creation. All channels are statically
typed and enumerated.

### F7-05: Auto-Update as First-Class

`electron-updater` (or equivalent) is part of the initial architecture.
Update channels (stable, beta) MUST be supported. The update flow
handles: check → download → verify → install → restart gracefully.
Users are notified but not forced.

## Governance

This constitution supersedes all other development practices for the
Angdu Studio project. It governs architecture and design principles
only — not specific library versions, UI copy, business logic rules,
or deployment configuration.

### Amendment Process

1. The constitution is locked during a development phase.
2. Every proposed change MUST include: the specific problem encountered,
   the current rule (or absence) that caused the problem, the proposed
   modification with expected outcome, and at least one concrete example.
3. New principles MUST NOT contradict existing ones. If unavoidable,
   the older principle is explicitly deprecated with a migration path.
4. Every architectural decision is traceable to a constitution principle
   via IDs (ARC-XX, A1-XX, F7-XX, PSP-XX).

### Versioning Policy

- **MAJOR**: Backward-incompatible principle removals or redefinitions.
- **MINOR**: New principle/section added or materially expanded.
- **PATCH**: Clarifications, wording, typo fixes.

### Compliance

All code reviews MUST verify compliance with this constitution.
Complexity that violates a principle MUST be justified and documented
in the Complexity Tracking section of the relevant plan.

**Version**: 1.0.0 | **Ratified**: 2026-03-15 | **Last Amended**: 2026-03-15
