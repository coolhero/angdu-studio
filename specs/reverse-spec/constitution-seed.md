# Constitution Seed — Angdu Studio

> Generated from reverse-spec analysis of Cherry Studio source code.
> Date: 2026-03-15
> Source: /Users/coolhero/Develop/cherry-studio
> Target: Angdu Studio (rebuild with new stack)

---

## 1. Source Code Reference Principles

### New Stack Strategy

Angdu Studio is a **ground-up rebuild** of Cherry Studio. The source code serves as a **behavioral specification**, not a codebase to fork. Every feature is re-implemented using the new stack while preserving the proven architecture patterns discovered during reverse-spec analysis.

| Aspect | Strategy |
|--------|----------|
| Architecture patterns | **Preserve** — Process isolation, streaming pipeline, provider abstraction, service singletons, dual storage |
| Component structure | **Re-implement** — Same logical decomposition, new primitives (shadcn/ui + Tailwind 4) |
| State management | **Re-implement** — Same state shape concepts, new engine (Zustand replaces Redux Toolkit) |
| Data layer | **Adapt** — Drizzle ORM retained, driver swapped (better-sqlite3 replaces LibSQL) |
| AI integration | **Preserve** — Vercel AI SDK + provider abstraction layer retained |
| Build tooling | **Preserve** — electron-vite retained, versions updated |

### What "Preserve" Means

- The **principle** is carried forward verbatim.
- The **implementation** may differ to leverage new stack capabilities.
- The **test expectations** remain identical (same inputs produce same outputs).

### What "Re-implement" Means

- The **behavior** is replicated.
- The **code** is written from scratch using new stack idioms.
- No copy-paste from source; patterns are extracted, understood, and rebuilt.

---

## 2. Extracted Architecture Principles

### ARC-01: Process Crash Isolation via IPC Bridge

- **Rule**: All communication between main and renderer processes MUST go through a typed IPC bridge defined in a preload script. The renderer MUST NOT have direct access to Node.js APIs.
- **Rationale**: Electron's multi-process model exists for crash isolation and security. If the renderer crashes, the main process (and all persistent services) survive. Direct Node.js access from the renderer bypasses Chromium's sandbox and creates security vulnerabilities.
- **Evidence**: 274 IPC handlers discovered across 42KB preload surface. `contextBridge.exposeInMainWorld` used exclusively. `nodeIntegration: false` and `contextIsolation: true` enforced in BrowserWindow config.

### ARC-02: Streaming-First LLM Pipeline

- **Rule**: All LLM responses MUST be processed as streams, never buffered to completion before rendering. The pipeline follows: Provider SDK stream → ChunkType classification → Block-based message assembly → Incremental DOM update.
- **Rationale**: LLM responses can take 10-60 seconds to complete. Buffering destroys perceived performance. Streaming also enables early cancellation, token-by-token rendering, and progressive UI updates (thinking blocks, code blocks, tool calls).
- **Evidence**: `StreamProcessingService` with `ChunkType` enum (TEXT, THINKING, TOOL_CALL, CODE, etc.). `chat-completion.ts` uses SSE streaming for all providers. `MessageBlockRenderer` renders blocks incrementally as chunks arrive.

### ARC-03: Provider Abstraction Layer

- **Rule**: LLM provider-specific logic MUST be encapsulated behind a unified interface. Application code MUST NOT contain provider-specific conditionals outside the abstraction layer.
- **Rationale**: The AI landscape changes monthly. New providers appear, APIs break, models are deprecated. A clean abstraction layer means adding a provider requires implementing one adapter, not modifying every callsite.
- **Evidence**: `@cherrystudio/ai-core` package abstracts 15+ providers. `ProviderType` enum defines supported backends. Vercel AI SDK provides the unified streaming interface. Provider-specific configuration lives in isolated adapter modules.

### ARC-04: Service Singleton Pattern in Main Process

- **Rule**: Main process services (configuration, file storage, MCP, database, etc.) MUST be implemented as singletons, accessed from renderer exclusively via IPC.
- **Rationale**: Main process services manage shared resources (files, database connections, external tool connections). Multiple instances would cause resource contention, data corruption, and memory waste. Singleton + IPC ensures a single source of truth.
- **Evidence**: `ConfigManager`, `FileStorage`, `MCPService`, `BackupManager` all follow singleton pattern. Each exposes methods via corresponding IPC handlers in preload.

### ARC-05: Dual Storage Architecture

- **Rule**: Structured relational data MUST be stored in SQLite (accessed from main process via Drizzle ORM). Client-side cache and UI state MUST use IndexedDB (Dexie) in the renderer. State that must survive renderer crashes MUST live in SQLite.
- **Rationale**: SQLite provides ACID transactions and survives renderer crashes (runs in main process). IndexedDB provides fast renderer-local reads without IPC round-trips. The dual approach balances reliability with performance.
- **Evidence**: Drizzle schema defines tables for conversations, messages, assistants, providers, models. Dexie stores renderer-side caches. Redux persist middleware bridges the two layers for state hydration.

---

## 3. Extracted Technical Constraints

| ID | Constraint | Value | Rationale |
|----|-----------|-------|-----------|
| TC-01 | Electron version | v40+ (latest stable) | BrowserWindow API stability, contextBridge support, security patches |
| TC-02 | Node.js version | >= 24.11.1 | Required by Electron v40+, ESM support, native module compatibility |
| TC-03 | React version | 19 with concurrent features | Streaming UI requires concurrent rendering (useTransition, Suspense) |
| TC-04 | TypeScript mode | Strict | Catch type errors at compile time; essential for IPC type safety |
| TC-05 | V8 heap limit | 8GB max-old-space-size | Large AI contexts (100k+ token conversations) require extended memory |
| TC-06 | Context isolation | Mandatory (true) | Electron security requirement; prevents prototype pollution attacks |
| TC-07 | Node integration | Disabled (false) | Electron security requirement; renderer must use IPC bridge |
| TC-08 | Sandbox | Enabled | Electron security requirement; renderer runs in Chromium sandbox |

---

## 4. Extracted Coding Conventions

| Category | Convention | Example |
|----------|-----------|---------|
| Variables & functions | camelCase | `getUserMessages`, `topicCount`, `isStreaming` |
| Components & classes | PascalCase | `MessageBlock`, `ProviderAdapter`, `ConfigManager` |
| Constants & enums | UPPER_SNAKE_CASE for values, PascalCase for enum names | `ChunkType.TEXT`, `MAX_RETRIES`, `ProviderType` |
| File naming (components) | PascalCase | `MessageBlock.tsx`, `ChatWindow.tsx` |
| File naming (utils/services) | camelCase or kebab-case | `chat-completion.ts`, `fileStorage.ts` |
| Directory structure | Feature-based | `pages/home/`, `pages/settings/`, `pages/agents/` |
| State stores | Domain-based slices | One store per domain (chat, settings, providers, models) |
| IPC handlers | Verb-noun pattern | `get-providers`, `send-message`, `update-settings` |
| Imports | Absolute paths with aliases | `@renderer/`, `@main/`, `@shared/` |
| Logging | Context-specific Winston loggers | `logger.info('[ChatService]', ...)` |
| Error handling | Try-catch with IPC error propagation | Errors cross IPC boundary as serializable objects |
| Type definitions | Shared types in `@shared/types` | Types used by both processes live in shared package |

---

## 5. Naming Conventions

### Identity Mapping

| Original | Replacement | Scope |
|----------|-------------|-------|
| Cherry Studio | Angdu Studio | Product name, window titles, about dialogs |
| Cherry | Angdu | Short name, casual references, logs |
| cherry-studio | angdu-studio | Package name, directory name, repository name |
| CS | AS | Abbreviations in code comments, internal docs |
| @cherrystudio/ | @angdu/ | Package scope (e.g., `@angdu/ai-core`) |
| CherryStudio | AngduStudio | PascalCase compound (class names, types) |
| cherryStudio | angduStudio | camelCase compound (variable names) |
| CHERRY_STUDIO | ANGDU_STUDIO | UPPER_SNAKE_CASE (env vars, constants) |

### Application Rules

1. **No Cherry references** in any generated code, comments, or documentation.
2. **User-facing strings** use "Angdu Studio" (full name with space).
3. **Code identifiers** use compound form matching the casing convention (e.g., `AngduStudio` for PascalCase).
4. **Package scope** is `@angdu/` for all internal packages.
5. **Environment variables** use `ANGDU_STUDIO_` prefix.

---

## 6. Project-Specific Recommended Principles

These principles are derived from the domain: **AI chat application with RAG, multi-provider support, and streaming**.

### PSP-01: Conversation as First-Class Entity

- **Rule**: A conversation is the primary data structure. All messages, tool calls, attachments, and metadata belong to a conversation. Conversations are independently portable (exportable, shareable, restorable).
- **Rationale**: Users think in conversations, not messages. The data model must reflect this to enable features like conversation search, branching, export, and cross-device sync.

### PSP-02: Model Configuration Portability

- **Rule**: Model configurations (provider + model + parameters) MUST be serializable and storable independently of the conversation that uses them. Users must be able to create, name, and reuse model configurations.
- **Rationale**: Users frequently switch between models. Storing the full configuration (temperature, top-p, system prompt, etc.) as a reusable entity eliminates repetitive setup.

### PSP-03: Graceful Provider Degradation

- **Rule**: When a provider fails (network error, rate limit, auth failure), the application MUST present a clear error with the provider name, error type, and suggested action. It MUST NOT crash or show generic errors.
- **Rationale**: Multi-provider apps expose users to many failure modes. Each provider has different error semantics. Clear, actionable errors reduce support burden and user frustration.

### PSP-04: Attachment Pipeline Abstraction

- **Rule**: File attachments (images, documents, code) MUST be processed through a pipeline that: validates type/size, extracts content where applicable (OCR, PDF parse), stores the artifact, and references it in the message.
- **Rationale**: Different LLM providers support different attachment types. The pipeline normalizes attachments into a provider-agnostic format, enabling provider switching without losing attachment context.

### PSP-05: Knowledge Base Isolation

- **Rule**: RAG knowledge bases MUST be isolated per user-defined scope (per-assistant, per-topic, or global). Embedding indices MUST be independently rebuildable without affecting other knowledge bases.
- **Rationale**: Users organize knowledge differently. A coding assistant's knowledge base should not pollute a writing assistant's retrieval results. Independent indices also enable incremental updates.

---

## 7. Archetype-Specific Principles — AI Assistant (A1)

### A1-01: Streaming-First Rendering

- **Observed Trait**: SSE streaming in `chat-completion.ts`. `StreamProcessingService` classifies chunks via `ChunkType` enum. `MessageBlockRenderer` renders blocks incrementally.
- **Implication**: The UI rendering pipeline MUST be designed around incremental updates. Components must handle partial data (incomplete markdown, mid-code-block, partial tool call JSON). React concurrent features (useTransition, Suspense) are required to prevent streaming updates from blocking user interactions.

### A1-02: Model Agnosticism

- **Observed Trait**: `@cherrystudio/ai-core` abstracts 15+ providers behind unified interface. `ProviderType` enum covers OpenAI, Anthropic, Google, Ollama, Azure, and more. Vercel AI SDK provides the streaming abstraction.
- **Implication**: No application-level code may assume a specific provider's capabilities. Feature availability (vision, tool use, streaming, JSON mode) must be checked per-model via capability flags. The AI core package (`@angdu/ai-core`) is the sole location for provider-specific logic.

### A1-03: Offline Resilience

- **Observed Trait**: SQLite stores conversations persistently. IndexedDB caches UI state. Redux persist rehydrates state on restart. Local file storage for attachments.
- **Implication**: The application MUST be fully functional for reading and managing existing conversations without network access. New message sending may fail gracefully, but browsing, searching, and editing existing data must work offline. All data lives locally by default.

### A1-04: Token Awareness

- **Observed Trait**: Usage tracking with `completion_tokens`, `prompt_tokens`, `total_tokens`. Performance metrics include `time_first_token_millsec`. Cost tracking per conversation.
- **Implication**: Token counts MUST be tracked and displayed for every message exchange. The system must support configurable token budget warnings. Cost estimation should be available when provider pricing is known. First-token latency is a key UX metric that should be measured and optimizable.

### A1-05: Prompt Versioning

- **Observed Trait**: Not implemented in source. Prompts are inline in assistant settings with no version history.
- **Implication**: This is an **improvement opportunity** for Angdu Studio. System prompts should be versioned entities with change history. Users iterating on prompts need to compare versions and rollback. Implementation priority is secondary to core features but should be architecturally planned for.

---

## 8. Framework Philosophy — Electron F7

### F7-01: Process Crash Isolation

- **Principle**: The main process MUST survive renderer crashes. Critical state MUST be persisted outside the renderer.
- **Implication**: All persistent data flows through the main process (SQLite, file system). The renderer is treated as ephemeral. Crash recovery handlers in the main process detect renderer failures and can restart the window without data loss. IPC error boundaries prevent renderer exceptions from propagating to main.

### F7-02: Memory Budget Discipline

- **Principle**: Each BrowserWindow spawns a full Chromium process. Memory usage must be actively managed.
- **Implication**: Minimize the number of BrowserWindows (prefer single-window with tab-based navigation). Offload heavy computation (embedding generation, file parsing) to worker threads or child processes, not the renderer. Monitor and enforce the 8GB V8 heap limit. Implement conversation virtualization for long chat histories.

### F7-03: Native Feel

- **Principle**: Desktop applications must feel native to the platform, not like web pages in a frame.
- **Implication**: Use platform-appropriate titlebar (frameless with custom controls on macOS, native on Windows). Respect system-level keyboard shortcuts (Cmd+Q, Cmd+W, Cmd+,). Support native drag-and-drop for files. Integrate with system tray/dock. Use native file dialogs for import/export. Dark/light mode follows system preference.

### F7-04: Secure by Default

- **Principle**: Context isolation and sandbox are mandatory. `nodeIntegration` is always `false`.
- **Implication**: Every main→renderer API surface goes through `contextBridge.exposeInMainWorld`. The preload script is the security boundary — it defines the complete API available to the renderer. No dynamic IPC channel creation. All channels are statically typed and enumerated. CSP headers restrict renderer resource loading.

### F7-05: Auto-Update as First-Class

- **Principle**: The update mechanism is designed from day one, not bolted on later.
- **Implication**: `electron-updater` (or equivalent) is part of the initial architecture. Update channels (stable, beta) are supported. The update flow handles: check → download → verify → install → restart gracefully. Users are notified but not forced. Delta updates are preferred for bandwidth efficiency. Update state is persisted so interrupted updates resume.

---

## 9. Recommended Development Principles

### I. Single Source of Truth (SSoT)

Every piece of knowledge — a type definition, a configuration default, a validation rule — MUST exist in exactly one place. All consumers reference that source.

- **Types**: Shared types live in `@angdu/shared`. Main and renderer import from there.
- **Config defaults**: Defined once in a defaults module, spread into stores and UI.
- **Validation**: Schema defined once (Zod), used for both runtime validation and TypeScript type inference.
- **IPC contracts**: Channel names and payload types defined in shared, used by both preload and handlers.

### II. Explicit Over Implicit

No magic. Every behavior must be traceable from its trigger to its effect by reading the code.

- **State changes**: Zustand actions are named functions, not anonymous reducers.
- **Side effects**: Clearly separated from pure state transitions.
- **IPC flow**: Every handler is registered explicitly with a typed channel name.
- **Dependencies**: Injected, not imported from global scope (especially in main process services).

### III. Fail Loudly, Recover Gracefully

Errors must be visible to developers and recoverable for users.

- **Development**: Errors throw, warnings are logged with context, silent failures are bugs.
- **Production**: User-facing errors include actionable guidance. Background operations retry with backoff. Critical failures trigger state persistence before crash.
- **IPC boundary**: Errors crossing the IPC bridge are serialized with type, message, and context. Never swallowed.

### IV. Composition Over Inheritance

Build behavior by composing small, focused units. Avoid class hierarchies.

- **UI**: Compose components from shadcn/ui primitives + Tailwind utilities.
- **State**: Compose Zustand stores with middleware (persist, devtools, immer).
- **Services**: Compose functionality through dependency injection and function composition.
- **Providers**: Each LLM provider is a composed adapter, not a subclass.

### V. Test the Contract, Not the Implementation

Tests verify behavior, not internal structure. Refactoring should not break tests.

- **IPC contracts**: Test that sending message X produces response Y across the bridge.
- **Store actions**: Test that dispatching action A produces state B, regardless of how.
- **Components**: Test user-visible behavior (render, interact, assert), not DOM structure.
- **Providers**: Test that each adapter conforms to the unified interface contract.

### VI. Progressive Enhancement of Features

Features are built in layers. Each layer is independently shippable and testable.

- **Layer 0**: Data model and storage (works without UI).
- **Layer 1**: Basic CRUD UI (works without AI).
- **Layer 2**: AI integration with single provider (works without multi-provider).
- **Layer 3**: Multi-provider, advanced features, optimizations.
- Each layer has its own acceptance criteria and can be verified independently.

---

## 10. Global Evolution Layer — Operational Principles

### GEL-01: Constitution Immutability Within a Phase

The constitution is locked during a development phase. Changes are proposed, collected, and applied between phases during a constitutional review.

### GEL-02: Evidence-Based Evolution

Every proposed change to the constitution MUST include:
- The specific problem encountered.
- The current rule (or absence) that caused the problem.
- The proposed modification with expected outcome.
- At least one concrete example demonstrating the improvement.

### GEL-03: Backward Compatibility of Principles

New principles must not contradict existing ones. If a contradiction is unavoidable, the older principle is explicitly deprecated with a migration path for affected code.

### GEL-04: Traceability

Every architectural decision is traceable to a constitution principle. Code reviews can reference principle IDs (ARC-XX, A1-XX, F7-XX, PSP-XX) to justify or challenge implementation choices.

### GEL-05: Scope Containment

The constitution governs architecture and design principles. It does NOT govern:
- Specific library versions (those go in `package.json`).
- UI copy or content (those go in localization files).
- Business logic rules (those go in feature specs).
- Deployment configuration (those go in CI/CD config).
