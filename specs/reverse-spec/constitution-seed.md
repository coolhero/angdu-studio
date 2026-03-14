# Constitution Seed

> Angdu Studio — Foundational principles governing all development decisions
> Generated: 2026-03-14

---

## 1. Source Code Reference Principles (New Stack Strategy)

### 1.1 Reference, Don't Replicate

Cherry Studio source code is the **behavioral reference** — use it to understand *what* the app does, *why* certain decisions were made, and *which edge cases matter*. Do NOT copy code patterns, class structures, or implementation details.

### 1.2 Stack Translation Rules

| Cherry Studio (Original) | Angdu Studio (New Stack) | Rationale |
|---|---|---|
| Ant Design (AntD) | shadcn/ui + Radix | Composable, accessible, Tailwind-native |
| Styled Components | Tailwind CSS | Utility-first, no runtime CSS-in-JS overhead |
| Redux Toolkit | Zustand | Simpler API, less boilerplate, better DX for Electron |
| Custom AI SDK wrapper | Vercel AI SDK (direct) | First-class streaming, provider abstraction, maintained by Vercel |
| Legacy middleware chain | AI SDK plugins/middleware | Native extensibility, type-safe, composable |

### 1.3 Vercel AI SDK First

Use Vercel AI SDK patterns directly for all AI completion, streaming, and tool use. Do not build a custom wrapper layer around it. When Cherry Studio's behavior differs from AI SDK conventions, prefer AI SDK conventions unless there is a documented user-facing reason to deviate.

---

## 2. Architecture Principles (Extracted from Cherry Studio)

### 2.1 Electron Process Separation

Three-process architecture is inviolable:

- **Main Process** — Node.js runtime. Owns file system, IPC handlers, background services (knowledge, backup, MCP). No UI code. No renderer imports.
- **Preload Process** — Bridge layer. Exposes typed IPC API to renderer via `contextBridge.exposeInMainWorld`. Minimal logic — mapping only.
- **Renderer Process** — Browser runtime. Owns UI, state management, user interaction. Communicates with main exclusively via exposed preload API.

### 2.2 IPC Contract Pattern

All cross-process communication follows invoke/handle pattern:

```
Renderer → preload.api.someMethod(args)
  → ipcRenderer.invoke('channel:method', args)
    → ipcMain.handle('channel:method', handler)
      → return result
```

- Every IPC channel has a TypeScript type contract shared between main and renderer.
- No `ipcRenderer.send` / `ipcMain.on` for request-response flows (use invoke/handle).
- Event-based IPC (`send`/`on`) only for push notifications (main → renderer).

### 2.3 Service-Oriented Main Process

Main process services are singletons, initialized at app startup:

- Each service owns one domain (KnowledgeService, BackupService, McpService, MemoryService, etc.).
- Services communicate via direct method calls within main process (no IPC between services).
- Services expose IPC handlers for renderer consumption.
- Service lifecycle: `init()` at app ready, `destroy()` at app quit.

### 2.4 Feature-Based Directory Organization

Renderer code organized by feature, not by technical role:

```
src/renderer/
  features/
    chat/           # F006 — chat UI, message components, send logic
    assistants/     # F005 — assistant management UI
    knowledge/      # F007 — knowledge base UI
    settings/       # Settings panels
  shared/
    components/     # Cross-feature UI components
    hooks/          # Cross-feature hooks
    stores/         # Zustand stores
    types/          # Shared type definitions
```

### 2.5 Streaming-First AI Pipeline

All AI completion is streaming by default:

- `streamText` is the primary API. `generateText` only for non-interactive use (topic naming, memory extraction).
- UI renders incrementally from stream chunks — no waiting for complete response.
- Error handling at chunk level, not just request level.
- Abort/cancel supported at any point during stream.

### 2.6 Multi-Provider Abstraction

Provider abstraction is a first-class architectural concern:

- Provider configuration is declarative (model list, capabilities, auth method, URL format).
- Provider-specific logic is isolated in adapter modules — never in shared pipeline code.
- New provider addition should require: one adapter file + one config entry. No pipeline changes.

### 2.7 Plugin-Based Extensibility

AI pipeline behavior is extended via composable plugins/middleware:

- Each plugin is a self-contained unit (telemetry, reasoning, caching, web search, tool use).
- Plugins are ordered and composable — wrapping the AI SDK middleware chain.
- Plugin activation is dynamic — determined by assistant settings and provider capabilities.
- Adding a new plugin should not require modifying existing plugins or core pipeline.

---

## 3. Naming Conventions

| Original | Angdu Studio |
|---|---|
| Cherry | Angdu |
| CherryStudio | AngduStudio |
| cherry-studio | angdu-studio |
| CS (abbreviation) | AS |
| CherryIN | AngduIN |
| `cherrystudio://` (protocol) | `angdustudio://` |
| Cherry AI (service ref) | Angdu AI |

Apply consistently across: code identifiers, IPC channels, protocol handlers, config keys, user-facing strings, file names, environment variables.

---

## 4. Recommended Development Principles

### 4.1 Test-First

Write tests before implementation. Tests define the expected behavior contract. If you cannot write a test for a feature, the feature is not well-defined enough to build.

### 4.2 Think Before Coding

Before writing any code, articulate: (1) what problem this solves, (2) what the success criteria are, (3) what the simplest solution is. If you cannot answer all three, stop and clarify.

### 4.3 Simplicity First

Prefer the simplest solution that meets requirements. No speculative abstractions. No "we might need this later" code. Add complexity only when proven necessary by a concrete requirement.

### 4.4 Surgical Changes

Each change should be as small as possible while being complete. One commit = one logical change. No "while I'm here" modifications. Side effects are bugs.

### 4.5 Goal-Driven Execution

Every task starts with a clear goal and ends with verification that the goal was met. If the goal shifts during execution, stop, redefine, then continue. Never drift.

### 4.6 Demo-Ready Delivery

Every merged change should be demonstrable. If you cannot show it working, it is not done. "It compiles" is not done. "Here is the behavior change" is done.

---

## 5. Global Evolution Layer Operational Principles

### 5.1 Additive Evolution

New features extend the system — they do not rewrite existing features. Breaking changes require migration paths (see BR-018 for precedent).

### 5.2 Reversible Decisions

Prefer decisions that can be reversed cheaply. When an irreversible decision is required, document the reasoning and alternatives considered.

### 5.3 Incremental Delivery

Large features are decomposed into independently deliverable increments. Each increment is functional (not just "scaffolding") and adds user-visible value.

### 5.4 Specification-Driven Development

Features are specified before implementation. The SDD (Smart Design Document) is the source of truth for what will be built. Implementation that deviates from SDD requires SDD update first.

### 5.5 Continuous Verification

Verification is not a phase — it is continuous. Every commit is verified against its SDD acceptance criteria. Drift is caught early and corrected immediately.

### 5.6 Knowledge Preservation

Decisions, trade-offs, and learnings are captured in specs and commit messages. The codebase should be understandable by reading its history, not by asking the original author.

---

## 6. Project-Specific Recommended Principles

### 6.1 Domain: AI Desktop Application

**Streaming UX Priority** — The primary user experience is watching AI responses stream in real-time. Streaming performance, visual smoothness, and responsiveness are not optional polish — they are core product quality. Any change that degrades streaming UX is a regression.

**Provider Error Handling** — 20+ AI providers means 20+ ways things can fail. Every provider interaction must have explicit error handling with user-comprehensible messages. "Something went wrong" is never acceptable. Show: what failed, why (if known), and what the user can do (retry, check key, switch provider).

**Graceful Degradation** — When an optional feature fails (knowledge base search, MCP tool, memory extraction), the core chat must continue working. Feature failures are warnings, not blockers. The user's conversation must never be lost or interrupted by a peripheral feature failure.

### 6.2 Architecture: Electron IPC Boundary

**Type-Safe IPC Contracts** — Every IPC channel has a shared TypeScript type definition used by both main and renderer. No `any` types crossing the IPC boundary. No implicit contracts. The type definition IS the contract.

**No Direct Main Process Access** — Renderer process code must never assume it has direct access to Node.js APIs, file system, or main process services. All access goes through the preload-exposed API. Violations are architectural bugs, regardless of whether they "work."

**IPC Payload Serialization** — All data crossing IPC boundary must be serializable (no functions, no class instances, no circular references). Design data structures for IPC-friendliness from the start.

### 6.3 Scale: 20+ AI Providers

**Provider Abstraction is First-Class** — Provider abstraction is not a utility layer — it is a core architectural component. Adding a new provider must be a localized change (adapter + config), not a cross-cutting modification.

**Provider Capability Matrix** — Not all providers support all features (reasoning, vision, tool use, streaming, developer role). The system must query provider capabilities and adapt behavior, not assume universal support.

**Provider-Specific Isolation** — Provider-specific workarounds (URL formatting, auth flows, rate limits) are isolated in provider adapter modules. They never leak into shared pipeline code. When a provider's quirk is found, it is fixed in its adapter, not worked around in the pipeline.

### 6.4 Quality: User Data at Stake

**Backup & Sync Reliability** — User data (conversations, assistants, knowledge bases) is irreplaceable. Backup operations must be atomic (succeed completely or not at all). Partial backups are worse than no backup. Restore must be verified before old data is modified.

**Data Migration Safety** — Schema migrations (BR-018) must be forward-only, sequential, and tested. Every migration has a verification step. Migration failures halt the process with user notification — never silently proceed with partially migrated data.

**Defensive File Operations** — All file operations (backup extraction, knowledge base ingestion, export) validate paths against traversal attacks (BR-019 precedent). All file writes use temp-then-rename pattern to prevent corruption on crash.

**Offline Resilience** — Core app functionality (viewing existing conversations, managing assistants, local model access) must work without internet. Cloud-dependent features degrade gracefully with clear status indication.
