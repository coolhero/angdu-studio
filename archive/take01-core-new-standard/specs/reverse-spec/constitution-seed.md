# Cherry Studio Constitution (Seed)

**Source**: /Users/coolhero/Study/oss/cherry-studio
**Generated**: 2026-03-02
**Strategy**: Stack: new

> This document is a constitution draft extracted from existing source code analysis.
> Use this document as input when running /speckit.constitution to finalize the constitution.

---

## Source Code Reference Principles

### [New Stack Strategy] Source as Logic Reference Only

- **Original source location**: /Users/coolhero/Study/oss/cherry-studio
- When writing spec/plan for each Feature, read the original files specified in the Source Reference section of `pre-context.md` to **understand the business logic and requirements**
- **Do not reference** existing code's implementation patterns for: Redux Toolkit (migrating to Zustand), Ant Design/Styled Components (migrating to Shadcn/ui + TailwindCSS), LibSQL (migrating to better-sqlite3)
- **Extract**: What (functionality), Why (rationale), business rules, edge cases
- **Ignore**: How (implementation approach), technology-dependent patterns
- Prioritize idiomatic patterns of the new stack (Zustand stores, Shadcn/ui components, better-sqlite3 queries)
- **Can reference**: TypeScript patterns, Electron architecture, Drizzle ORM patterns, React patterns, Vitest/Playwright test patterns (these are kept)

---

## Extracted Architecture Principles

### I. Dual-Process Architecture (Electron Main + Renderer)
- **Rule**: Business logic that requires Node.js APIs (file I/O, child processes, network, SQLite) must run in the main process. UI logic runs in the renderer. Communication happens exclusively via typed IPC channels.
- **Rationale**: Electron security model requires context isolation between main and renderer. The existing codebase strictly follows this pattern with 232+ IPC channels.
- **Evidence**: All file operations in `src/main/services/FileStorage.ts`, MCP server management in `src/main/services/MCPService.ts`, knowledge base operations in `src/main/services/KnowledgeService.ts`. Renderer never imports Node.js modules directly.

### II. Centralized IPC Channel Registry
- **Rule**: All IPC channel names must be defined in a single shared enum (`IpcChannel`). Both main and renderer import from this shared source. No string literal channel names.
- **Rationale**: Prevents channel name typos, enables IDE navigation, and ensures compile-time type safety for IPC communication.
- **Evidence**: `packages/shared/IpcChannel.ts` defines ~232 channels. `src/main/ipc.ts` registers handlers. `src/preload/index.ts` exposes typed bridge.

### III. Provider Abstraction Layer
- **Rule**: AI provider specifics must be abstracted behind a unified provider interface. Provider-specific logic is isolated in adapter/client classes. New providers are added without modifying core pipeline code.
- **Rationale**: Cherry Studio supports 50+ AI providers with different API formats. The abstraction enables consistent handling while supporting provider-specific features.
- **Evidence**: `ApiClientFactory` pattern in `src/renderer/src/aiCore/legacy/clients/`, provider config mapping in `src/renderer/src/aiCore/provider/providerConfig.ts`, AI SDK provider registry in `packages/aiCore/`.

### IV. Feature-Scoped Store Slices
- **Rule**: Each logical feature owns its Redux slice with clear boundaries. No cross-slice direct mutations. Cross-feature communication happens via thunks or middleware.
- **Rationale**: Prevents state entanglement between features. Enables independent feature development and testing.
- **Evidence**: 25 separate slices in `src/renderer/src/store/` (assistants, llm, settings, mcp, knowledge, memory, etc.). Cross-window sync via `StoreSyncService` middleware.

### V. Streaming-First Message Architecture
- **Rule**: Messages are split into Message (metadata) + MessageBlock (content) entities. Blocks are updated independently during streaming for efficient partial updates.
- **Rationale**: AI chat responses stream token-by-token. Splitting metadata from content allows throttled block updates without re-rendering the entire message tree.
- **Evidence**: Dexie v7 migration normalized legacy embedded messages into separate `messages` and `message_blocks` tables. Throttled updates with 150ms debounce + requestAnimationFrame batching in `messageThunk.ts`.

### VI. Monorepo Package Isolation
- **Rule**: Shared code (types, constants, utilities) lives in `packages/shared/`. Domain-specific reusable logic in dedicated packages (`aiCore`, `mcp-trace`). No circular dependencies between packages.
- **Rationale**: Enables code sharing between main and renderer processes without duplication. Keeps the codebase organized as it scales.
- **Evidence**: `pnpm-workspace.yaml` defines 5 packages. Path aliases (`@shared/*`, `@cherrystudio/ai-core`) used throughout.

---

## Extracted Technical Constraints

| Area | Constraint | Source |
|------|-----------|--------|
| Platform | Must support Windows, macOS, Linux | `electron-builder.yml` (win/mac/linux targets) |
| Node Version | Node >= 24.11.1 required | `package.json` engines field |
| Security | Context isolation enabled. Renderer cannot access Node.js APIs directly | Electron security model, `src/preload/index.ts` |
| Memory | Node max-old-space-size=8000 for build | `.env.example` |
| Bundle | Main process bundled as single file. Renderer uses code-splitting | `electron.vite.config.ts` |
| DB | SQLite for structured data (main process), IndexedDB for UI state (renderer) | Drizzle schema, Dexie schema |
| i18n | 14+ languages supported. English and Chinese are primary | `src/renderer/src/i18n/` |
| Protocol | Custom protocol `cherrystudio://` for deep linking and OAuth callbacks | `electron-builder.yml` |

---

## Extracted Coding Conventions

| Area | Convention | Example |
|------|-----------|---------|
| Naming | camelCase for variables/functions, PascalCase for components/classes, SCREAMING_SNAKE for constants | Throughout codebase |
| Project Structure | Feature-based directory structure with pages/, components/, hooks/, services/, store/ | `src/renderer/src/` |
| Error Handling | Centralized via LoggerService (no console.log). Winston-based with daily rotation in main process | `src/main/services/LoggerService.ts`, ESLint rule enforcing LoggerService |
| Logging | Structured logging with source modules. Log levels: silly/debug/info/warn/error | `packages/shared/config/logger.ts` |
| Testing | Vitest for unit tests, Playwright for E2E. Tests in `__tests__/` directories or `tests/` root | `vitest.config.ts`, `playwright.config.ts` |
| Formatting | Biome formatter: 120 char line width, arrow parens always, semicolons as-needed | `biome.jsonc` |
| Linting | ESLint flat config + Oxlint. Custom rules: no template literals in i18n, no console.log | `eslint.config.mjs`, `.oxlintrc.json` |
| Imports | Auto-sorted via simple-import-sort. Unused imports detected and removed | ESLint config |
| Types | Domain types in `src/renderer/src/types/`. Shared types in `packages/shared/`. Zod for runtime validation | `src/renderer/src/types/`, agent schemas |
| State | Redux Toolkit with createSlice/createAsyncThunk (migrating to Zustand). Persist via redux-persist | `src/renderer/src/store/` |

---

## Project-Specific Recommended Principles

### Multi-Provider AI Resilience
- **Observed Trait**: Cherry Studio integrates 50+ AI providers with different API formats, auth mechanisms, and error patterns. API key rotation is implemented for load distribution.
- **Recommended Rule**: All AI provider calls must include retry logic with exponential backoff. Provider-specific error codes must be mapped to a unified error taxonomy. Fallback to alternative providers should be configurable per assistant.
- **Rationale**: Users depend on uninterrupted AI access. Provider outages are common. Resilient multi-provider handling is critical for a production AI client.

### Streaming Pipeline Idempotency
- **Observed Trait**: Complex streaming pipeline with 13+ middleware layers. Blocks are updated via throttled dispatches during streaming. AbortController supports cancellation.
- **Recommended Rule**: All streaming operations must be idempotent — cancelling and retrying a stream must not produce duplicate content. Block IDs must be deterministic or deduplicable. Partial state must be cleanable on abort.
- **Rationale**: Users frequently cancel and retry AI responses. The streaming pipeline must handle this gracefully without corrupting message state.

### Offline-First Desktop Design
- **Observed Trait**: Application uses local SQLite + IndexedDB for primary storage. WebDAV/S3/LAN backup for sync. No cloud dependency for core functionality.
- **Recommended Rule**: All core features must work offline. Network-dependent features (AI completion, sync) must degrade gracefully with clear user feedback. Local data must never be lost due to sync failures.
- **Rationale**: Desktop apps must be reliable without internet. Users' conversation history and settings are local-first assets.

### MCP Tool Safety
- **Observed Trait**: MCP tool permission system with pending/allow/deny states. Auto-approve lists. Tool input editing before execution. DXT package sandboxing.
- **Recommended Rule**: All MCP tool executions must go through the permission system. Auto-approved tools must be explicitly whitelisted per server. Tool inputs must be sanitized. Tool execution timeouts must be enforced.
- **Rationale**: MCP tools can execute arbitrary code (file system access, shell commands). Security boundaries must be clear and enforceable.

### Data Migration Robustness
- **Observed Trait**: 199 numbered Redux persist migrations (3266 lines). Dexie version migrations with data transformation. Drizzle schema migrations.
- **Recommended Rule**: Every schema change must have a forward migration. Migrations must be tested with representative data. The app must handle corrupted/missing migration state gracefully (reset to defaults rather than crash).
- **Rationale**: Desktop apps accumulate years of user data across versions. Migration failures can cause data loss or app crashes.

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
- If something done in 200 lines can be done in 50, rewrite it
- **Verification criterion**: `All code must be directly traceable to a spec requirement`

### IV. Surgical Changes
- No "improving" adjacent code/comments/formatting when modifying existing code
- Do not refactor what already works
- Only clean up imports/variables/functions that became unused due to your changes
- Respect existing code style and maintain consistency
- **Verification criterion**: `Every changed line must be directly traceable to the current task`

### V. Goal-Driven Execution
- Every task includes verifiable completion criteria
- Set completion criteria as "tests pass" instead of "implemented"
- For multi-step work, define verification methods for each step in advance
- **Verification criterion**: `Automated verification (tests, build, lint) must pass upon each task completion`

### VI. Demo-Ready Delivery
- Each Feature must be demonstrable upon completion
- spec-kit generates `quickstart.md` per Feature during `/speckit.plan`
- Maintain a centralized `demos/` directory at the project root
- "Demo-ready" means: the Feature can be started, exercised through its core user flows, and the results observed
- **Verification criterion**: `A non-developer stakeholder can follow demos/F00N-name.md and verify the Feature works`

---

## Global Evolution Layer Operational Principles

### Cross-Feature Consistency
- Before running /speckit.specify for any Feature, always read `specs/reverse-spec/roadmap.md` and the Feature's `pre-context.md`
- When running /speckit.plan for any Feature, reference `specs/reverse-spec/entity-registry.md` and `specs/reverse-spec/api-registry.md` to ensure entity/API compatibility
- When defining new entities or APIs, update entity-registry.md and api-registry.md
- When cross-Feature dependencies change, update the Dependency Graph in roadmap.md

---

**Version**: 0.1.0-seed | **Generated**: 2026-03-02
