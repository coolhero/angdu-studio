# Cherry Studio Constitution (Seed)

**Source**: /Users/coolhero/Study/oss/cherry-studio
**Generated**: 2026-03-04
**Strategy**: Stack: new

> This document is a constitution draft extracted from existing source code analysis.
> Use this document as input when running /speckit.constitution to finalize the constitution.

---

## Source Code Reference Principles

### [New Stack Strategy] Source as Logic Reference Only

- **Original source location**: /Users/coolhero/Study/oss/cherry-studio
- When writing spec/plan for each Feature, read the original files specified in the Source Reference section of `pre-context.md` to **understand the business logic and requirements**
- **Do not reference** existing code's implementation patterns (Ant Design components, styled-components patterns, Redux Toolkit slices, React Router v6 patterns)
- **Extract**: What (functionality), Why (rationale), business rules, edge cases
- **Ignore**: How (implementation approach), technology-dependent patterns
- Prioritize idiomatic patterns of the new stack: shadcn/ui + Radix, Tailwind CSS, Zustand stores, TanStack Router

---

## Extracted Architecture Principles

### I. Electron Process Isolation
- **Rule**: Strict separation between main process (Node.js) and renderer process (browser). All cross-process communication goes through typed IPC channels defined in `@shared/IpcChannel` enum.
- **Rationale**: Security and stability — renderer cannot directly access Node.js APIs. IPC provides clear boundaries.
- **Evidence**: 430+ IPC channels in `packages/shared/IpcChannel.ts`, all main↔renderer communication goes through `ipc.ts` handler registration.

### II. Service Layer Pattern
- **Rule**: Business logic is encapsulated in dedicated service classes (40+ renderer services, 47+ main services). Pages/components consume services via hooks, never directly manipulate data.
- **Rationale**: Separation of concerns — UI components remain focused on rendering, services handle orchestration.
- **Evidence**: `src/renderer/src/services/` (40+ files), `src/main/services/` (47+ files), hooks layer (`src/renderer/src/hooks/` 70+ hooks).

### III. Multi-Provider Abstraction
- **Rule**: All AI provider interactions go through a unified abstraction layer (aiCore). Provider-specific logic is isolated in option builders and provider factories.
- **Rationale**: Supporting 15+ LLM providers requires a clean abstraction to avoid sprawling conditional logic.
- **Evidence**: `packages/aiCore/src/core/providers/registry.ts`, `packages/aiCore/src/core/options/` with per-provider option builders.

### IV. Plugin Architecture for Extensibility
- **Rule**: The aiCore engine uses a plugin system with three hook categories (First/Sequential/Parallel) and enforce ordering (pre/default/post). MCP servers follow a similar extensible pattern.
- **Rationale**: Extensibility without modifying core code. New providers, tools, and behaviors can be added via plugins.
- **Evidence**: `packages/aiCore/src/core/plugins/types.ts`, `src/main/mcpServers/factory.ts`.

### V. Typed IPC Channel System
- **Rule**: Every IPC channel is defined as an enum member in `@shared/IpcChannel`. Both main and renderer reference the same enum, ensuring type-safe communication.
- **Rationale**: Prevents runtime errors from mismatched channel names. Enables IDE navigation and refactoring.
- **Evidence**: `packages/shared/IpcChannel.ts` — single source of truth for 220+ channels.

### VI. Persistent State with Migration
- **Rule**: Redux state (now Zustand) is persisted to localStorage with version tracking. Database schemas use migration services. Backup format uses versioned schemas (currently v5).
- **Rationale**: Desktop apps must gracefully handle schema evolution across updates.
- **Evidence**: `src/renderer/src/store/migrate.ts` (version 199), `src/main/services/agents/database/MigrationService.ts`, backup versioning in `BackupService.ts`.

### VII. Multi-Window State Synchronization
- **Rule**: Select state slices are synchronized across Electron windows via `StoreSyncService`. Changes in one window are broadcast to all others.
- **Rationale**: Desktop apps can have multiple windows (main, mini, selection assistant) that must stay in sync.
- **Evidence**: `src/renderer/src/services/StoreSyncService.ts` — syncs `assistants/`, `settings/`, `llm/`, `selectionStore/`, `note/`.

---

## Extracted Technical Constraints

| Area | Constraint | Source |
|------|-----------|--------|
| Platform | Cross-platform: macOS, Windows, Linux with platform-specific code paths | `src/main/constant.ts` (isMac, isWin, isLinux) |
| Node Version | Node.js >= 24.11.1 | `package.json` engines |
| Performance | Throttled block updates (150ms) with RAF for streaming UI | `messageThunk.ts` LRU cache with throttle |
| Performance | Max 30 concurrent knowledge base processing tasks, 80MB workload limit | `KnowledgeService.ts` processing queue |
| Security | AES encryption for file storage, timing-safe API key comparison | `src/main/utils/aes.ts`, `apiServer/middleware/auth.ts` |
| Security | Sensitive data redaction in MCP logs (authorization, apiKey, token fields) | `MCPService.ts:redactSensitive` |
| Data | Soft-delete pattern for memories with SHA-256 deduplication | `MemoryService.ts` |
| Data | ZIP64 support for large backups, streaming writes | `BackupManager.ts` |
| AI | Rate limiting per provider with configurable intervals | `MessagesService.ts:checkRateLimit` |
| AI | Context window management with configurable message count | `MessagesService.ts:getContextCount` |

---

## Extracted Coding Conventions

| Area | Convention | Example |
|------|-----------|---------|
| Naming | camelCase for variables/functions, PascalCase for components/classes/types | Throughout codebase |
| Project Structure | Feature-based: pages/, components/, hooks/, services/, store/, types/ | `src/renderer/src/` |
| Error Handling | Centralized error middleware for API server; per-service try-catch with logging | `apiServer/middleware/error.ts`, service files |
| Logging | Structured logging via LoggerService with module context (`withContext()`) | `src/main/services/LoggerService.ts` |
| Testing | Vitest with collocated `__tests__/` directories, snapshot tests for components | Throughout src/ |
| State | Store slices define initial state + reducers; async operations in thunks | `src/renderer/src/store/` |
| IPC | Enum-based channel names, `ipcMain.handle` for request-response, `webContents.send` for push | `packages/shared/IpcChannel.ts` |
| Validation | Zod schemas for API input validation, entity schema validation | `src/renderer/src/types/agent.ts`, `apiServer/routes/agents/validators/` |

---

## Project-Specific Recommended Principles

### AI Provider Idempotency
- **Observed Trait**: 15+ AI providers with different APIs, rate limits, error patterns, and authentication methods
- **Recommended Rule**: All AI provider interactions must be idempotent. Failed streaming requests must be safely resumable without data corruption.
- **Rationale**: Network interruptions and provider errors are common. Partial responses must not corrupt message state.

### Streaming-First Architecture
- **Observed Trait**: All chat responses use SSE streaming with 30+ chunk types, throttled UI updates, and block-based message composition
- **Recommended Rule**: Design all AI response handling as streaming-first. Non-streaming is a special case of streaming (single chunk). Block-based message architecture enables progressive rendering.
- **Rationale**: Modern LLM APIs are inherently streaming. Treating non-streaming as the default leads to poor UX.

### Desktop Data Sovereignty
- **Observed Trait**: All data stored locally (SQLite, IndexedDB, filesystem). No mandatory cloud dependency. Backup to user-chosen backends (WebDAV, S3, local).
- **Recommended Rule**: Users must have full control over their data location. No telemetry or cloud storage without explicit opt-in. All data must be exportable.
- **Rationale**: Privacy-conscious users choose desktop apps specifically for data sovereignty.

### Graceful Provider Degradation
- **Observed Trait**: `Promise.allSettled` used for multi-server tool aggregation, knowledge search across multiple bases, and multi-model dispatch
- **Recommended Rule**: Multi-provider operations must use `allSettled` pattern. A single provider failure must not break the entire operation.
- **Rationale**: Users configure multiple providers. One being down should not prevent using others.

### Schema Migration Discipline
- **Observed Trait**: Redux persist version 199, Dexie version 10, Drizzle migration system, backup format version 5
- **Recommended Rule**: Every persisted schema change must have a forward migration. Never break backwards compatibility for stored data. Test migrations with production-like datasets.
- **Rationale**: Desktop app users may skip multiple versions. Migrations must handle any-to-current upgrades.

### MCP Protocol Compliance
- **Observed Trait**: Full MCP protocol implementation with stdio/SSE/StreamableHTTP transports, OAuth support, tool caching, server lifecycle management
- **Recommended Rule**: MCP integration must strictly follow the official protocol specification. Custom extensions must be clearly separated from standard protocol behavior.
- **Rationale**: MCP is an evolving standard. Strict compliance ensures interoperability with any MCP-compliant tool server.

---

## Recommended Development Principles (Best Practices)

### I. Test-First (NON-NEGOTIABLE)
- Write tests before implementing any feature
- Acceptance Scenarios (Given/When/Then) from spec.md are the source of test cases
- In tasks.md, test tasks must always precede implementation tasks
- Code without tests is not considered complete
- For bug fixes: write a test that reproduces the bug first, then fix it
- **Verification criterion**: `All tests must pass upon implement completion`

### II. Think Before Coding
- Do not assume. If unclear, mark it as `[NEEDS CLARIFICATION]` in the spec
- If multiple implementation approaches are possible, document alternatives and selection rationale in plan.md's Complexity Tracking
- Expose trade-offs explicitly rather than hiding them
- **Verification criterion**: `Every design decision must have an answer to "why?"`

### III. Simplicity First
- Implement only what is specified in the spec. No speculative feature additions
- No premature abstraction for single-use code
- No abstractions/wrappers/utilities justified by "might need it later"
- **Verification criterion**: `All code must be directly traceable to a spec requirement`

### IV. Surgical Changes
- No "improving" adjacent code/comments/formatting when modifying existing code
- Do not refactor what already works
- Only clean up imports/variables/functions that became unused due to your changes
- **Verification criterion**: `Every changed line must be directly traceable to the current task`

### V. Goal-Driven Execution
- Every task includes verifiable completion criteria
- Set completion criteria as "tests pass" instead of "implemented"
- For multi-step work, define verification methods for each step in advance
- **Verification criterion**: `Automated verification (tests, build, lint) must pass upon each task completion`

### VI. Demo-Ready Delivery
- Each Feature must be demonstrable upon completion
- Maintain a centralized `demos/` directory at the project root
- "Demo-ready" means: the Feature can be started, exercised through its core user flows, and the results observed
- If the Feature has no UI, implement a minimal demo surface (CLI command, demo script, API playground)
- **Verification criterion**: `A non-developer stakeholder can follow demos/F00N-name.md and verify the Feature works`

---

## Global Evolution Layer Operational Principles

### Cross-Feature Consistency
- Before running /speckit.specify for any Feature, always read `specs/reverse-spec/roadmap.md` and the Feature's `pre-context.md`
- When running /speckit.plan for any Feature, reference `specs/reverse-spec/entity-registry.md` and `specs/reverse-spec/api-registry.md` to ensure entity/API compatibility
- When defining new entities or APIs, update entity-registry.md and api-registry.md
- When cross-Feature dependencies change, update the Dependency Graph in roadmap.md

---

**Version**: 0.1.0-seed | **Generated**: 2026-03-04
