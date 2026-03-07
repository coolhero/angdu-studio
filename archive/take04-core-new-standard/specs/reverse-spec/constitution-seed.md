# Constitution Seed (Reverse-Spec)

**Source**: /Users/coolhero/Study/oss/cherry-studio
**Strategy**: Stack: new

---

## Source Code Reference Principles (New Stack)

- **Original source location**: /Users/coolhero/Study/oss/cherry-studio
- Read original files for business logic/requirements understanding
- **Extract**: What (functionality), Why (rationale), business rules, edge cases
- **Ignore**: How (implementation approach), Ant Design components, Redux patterns, styled-components

---

## Extracted Architecture Principles

### I. Electron Process Isolation

- **Rule**: All inter-process communication MUST go through typed IPC channels defined in a centralized enum. No direct Node.js API access from renderer.
- **Rationale**: Security (context isolation), maintainability (single source of truth for IPC contracts), debugging (centralized channel tracking)
- **Evidence**: 344 IPC channels in `packages/shared/IpcChannel.ts`, contextBridge exposure in `preload/index.ts`

### II. Service Layer Pattern

- **Rule**: Component -> Hook -> Service -> Store/IPC. Components MUST NOT call IPC directly. Hooks abstract IPC calls into clean APIs.
- **Rationale**: Separation of concerns, testability, consistent data flow
- **Evidence**: 80+ hooks in `src/renderer/hooks/`, services in `src/main/services/`

### III. Multi-Provider Abstraction

- **Rule**: AI provider differences MUST be abstracted behind a unified interface. Provider-specific code confined to adapter/plugin layer.
- **Rationale**: Support 60+ providers without coupling business logic to any specific API format
- **Evidence**: aiCore package with plugin system, RuntimeExecutor, OptionsBuilder pattern

### IV. Plugin Architecture (aiCore)

- **Rule**: AI capabilities MUST be extensible via plugins. Core engine provides hooks; plugins register capabilities.
- **Rationale**: Clean separation of AI provider specifics from core streaming/execution logic
- **Evidence**: `packages/aiCore` with plugin registration, middleware pipeline

### V. Typed IPC Channel System

- **Rule**: All IPC channels MUST be defined as enum members in a shared package. No string literal channels.
- **Rationale**: Type safety, refactoring support, compile-time validation
- **Evidence**: IpcChannel enum with 344 members in `packages/shared/`

### VI. Persistent State with Migration

- **Rule**: All persisted state schemas MUST support forward migration. Schema version tracked, migration functions registered.
- **Rationale**: Users upgrade across versions; data must never be lost or corrupted
- **Evidence**: 187 Redux migrations (v2-v199), Dexie v10 schema, Drizzle migrations

### VII. Multi-Window State Synchronization

- **Rule**: State changes in one window MUST propagate to all other windows via BroadcastChannel or IPC.
- **Rationale**: Main window and mini window share state (theme, config, conversation data)
- **Evidence**: StoreSyncService with BroadcastChannel, ThemeService broadcasting

### VIII. Queue-Based Workload Management

- **Rule**: Resource-intensive operations (RAG ingestion, file processing) MUST use bounded queues with backpressure (max items, max bytes).
- **Rationale**: Prevent OOM and UI freezes from unbounded concurrent operations
- **Evidence**: KnowledgeService (30 items / 80MB cap), progress reporting via IPC

### IX. Streaming-First Architecture

- **Rule**: AI responses MUST be streamed token-by-token. No buffering full responses before display.
- **Rationale**: User experience -- immediate feedback, works with large responses
- **Evidence**: aiCore RuntimeExecutor streaming, SSE-based message delivery

### X. Desktop Data Sovereignty

- **Rule**: All user data MUST be stored locally. No mandatory cloud dependency. Optional cloud sync (WebDAV/S3) is user-initiated.
- **Rationale**: Privacy, offline capability, user ownership of data
- **Evidence**: IndexedDB (Dexie), SQLite (Drizzle), electron-store for config, local file storage

---

## Extracted Technical Constraints

| Area | Constraint | Source |
|------|-----------|--------|
| Platform | Cross-platform: macOS, Windows, Linux (inc. Wayland, AppImage, portable) | Platform detection in AppService, WindowService |
| Runtime | Node.js with Electron 40 (Chromium) | package.json |
| Performance | Block-based message updates (throttled), max 30 concurrent KB tasks, 80MB workload cap | MessagesService, KnowledgeService |
| Security | AES encryption for sensitive data, context isolation enabled, web security disabled for cross-origin API calls | preload config, AES IPC channels |
| Data | Forward-only migrations, soft delete for memory, deferred deletion for knowledge files | migrate.ts, MemoryService, KnowledgeService |
| Concurrency | Rate limiting per provider (configurable seconds), debounced file watching (1000ms) | MessagesService, FileStorage |

---

## Extracted Coding Conventions

| Area | Convention | Example |
|------|-----------|---------|
| Naming | camelCase for variables/functions, PascalCase for classes/components/types, UPPER_SNAKE for constants | Throughout codebase |
| Project Structure | Feature-based directory structure under `src/renderer/src/`, service-based under `src/main/services/` | Project layout |
| Error Handling | try-catch with logger in migrations, error results in IPC handlers, Promise.allSettled for resilient cleanup | migrate.ts, KnowledgeService |
| Logging | Winston with daily rotation (10MB/30d, error 60d), context-scoped via withContext(module), dev overrides via CSLOGGER_* env vars | LoggerService |
| Testing | Vitest for unit/integration, Playwright for E2E, vi.hoisted() pattern for mocks | Test setup |
| State | Zustand stores (new) with persist middleware, BroadcastChannel sync | Migration target |
| Styling | Tailwind CSS 4 utility classes, CSS variables for theming, no styled-components | Migration target |
| Components | shadcn/ui + Radix UI primitives, composable pattern | Migration target |
| Routing | TanStack Router with file-based route generation | Migration target |
| Validation | Zod for runtime validation (MCP tool schemas), TypeScript for compile-time | MCPService |

---

## Project-Specific Recommended Principles

### 1. Multi-Provider Resilience

- **Observed Trait**: 60+ LLM providers with different API formats, rate limits, and failure modes
- **Recommended Rule**: All provider API calls MUST include timeout, retry with exponential backoff, and graceful degradation to user-friendly error messages
- **Rationale**: Provider APIs are external and unreliable; user experience must not depend on any single provider's availability

### 2. Block-Based Message Rendering

- **Observed Trait**: Messages contain 12 different block types (text, thinking, code, image, tool, citation, etc.) that render differently
- **Recommended Rule**: Message rendering MUST use a composable block system where each block type is an independent, self-contained renderer
- **Rationale**: Extensibility for new block types without modifying core message rendering logic

### 3. Embedding Dimension Normalization

- **Observed Trait**: Different embedding models produce vectors of different dimensions (768, 1024, 1536, etc.)
- **Recommended Rule**: All embedding vectors MUST be normalized to a fixed dimension (1536) via zero-padding or truncation before storage/comparison
- **Rationale**: Consistent vector operations across providers, database schema stability

### 4. Deferred Resource Cleanup

- **Observed Trait**: File deletion failures on locked files, database connections preventing directory removal
- **Recommended Rule**: Resource cleanup operations that can fail MUST use a deferred retry mechanism with persistent tracking (pending deletion list)
- **Rationale**: Desktop apps can't guarantee immediate file access; retry on next startup ensures eventual cleanup

---

## Recommended Development Principles (Best Practices)

### I. Test-First (NON-NEGOTIABLE)

- Write tests before implementing any feature
- Acceptance Scenarios from spec.md are the source of test cases
- Code without tests is not considered complete
- **Verification criterion**: All tests must pass upon implement completion

### II. Think Before Coding

- Do not assume. If unclear, mark as [NEEDS CLARIFICATION]
- Document alternatives and selection rationale in plan.md
- **Verification criterion**: Every design decision must have an answer to "why?"

### III. Simplicity First

- Implement only what is specified in the spec
- No premature abstraction for single-use code
- **Verification criterion**: All code must be directly traceable to a spec requirement

### IV. Surgical Changes

- No "improving" adjacent code when modifying existing code
- Only clean up imports/variables that became unused due to your changes
- **Verification criterion**: Every changed line must be directly traceable to the current task

### V. Goal-Driven Execution

- Every task includes verifiable completion criteria
- Set completion criteria as "tests pass" instead of "implemented"
- **Verification criterion**: Automated verification must pass upon each task completion

### VI. Demo-Ready Delivery

- Each Feature must be demonstrable upon completion
- Maintain `demos/` directory with executable demo scripts per Feature
- "Tests pass" alone does NOT satisfy this criterion
- **Verification criterion**: Running `./demos/F00N-name.sh` demonstrates the Feature works

---

## Global Evolution Layer Operational Principles

### Cross-Feature Consistency

- Before `/speckit.specify`, always read `roadmap.md` and `pre-context.md`
- During `/speckit.plan`, reference `entity-registry.md` and `api-registry.md`
- When defining new entities/APIs, update registries
- When cross-Feature dependencies change, update Dependency Graph in `roadmap.md`

---

Version: 0.1.0-seed | Generated: 2026-03-04
