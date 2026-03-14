# Business Logic Map

> Angdu Studio Reverse-Spec — 30 Business Rules extracted from Cherry Studio source analysis
> Generated: 2026-03-14

---

## F004-ai-core / F006-chat — AI Chat Pipeline

### BR-001: Dual-Architecture Provider System

- **Description**: Provider system supports two architectures — Modern (Vercel AI SDK native) and Legacy (custom wrapper). Runtime selection via `isModernSdkSupported()` based on provider capabilities.
- **Logic Summary**: On completion request, check provider against modern SDK support list. Modern path uses AI SDK `streamText`/`generateText` directly. Legacy path uses custom middleware wrapper with manual stream assembly. Both paths converge at the chunk dispatch layer.
- **Source Files**: `src/renderer/services/ProviderSDK.ts`, `src/renderer/services/ApiProviders.ts`

### BR-002: Plugin Pipeline Construction

- **Description**: AI completion pipeline is assembled via `buildPlugins()` which composes ordered plugins — telemetry, reasoning extraction, streaming simulation, cache control, web search, tool use, etc.
- **Logic Summary**: Each plugin wraps the AI SDK middleware chain. Plugin list is dynamic based on assistant settings and provider capabilities. Order matters: telemetry outermost, tool use innermost. Plugins are composable and independently toggleable.
- **Source Files**: `src/renderer/services/PluginFactory.ts`, `src/renderer/services/plugins/`

### BR-003: API Key Rotation

- **Description**: Supports comma-separated API keys per provider. Rotation uses round-robin strategy via `window.keyv` counter.
- **Logic Summary**: On each request, split configured key string by comma, select key at `(counter % keys.length)`, increment counter. Counter persists in `window.keyv` (per-provider namespace). Enables load distribution and quota spreading across multiple keys.
- **Source Files**: `src/renderer/services/ApiProviders.ts`

### BR-004: Message Preparation Pipeline

- **Description**: 9-stage filtering pipeline prepares raw conversation messages for API submission.
- **Logic Summary**: Stages execute in order: (1) context clear marker detection, (2) useful message filtering, (3) error-only message removal, (4) adjacent same-role message merging, (5) context window limit enforcement, (6) empty message removal, (7) user-role-start enforcement (first message must be user), (8) system prompt injection, (9) final validation. Each stage is a pure function `Message[] -> Message[]`.
- **Source Files**: `src/renderer/services/MessagePreparer.ts`

### BR-005: Knowledge Base Injection (RAG)

- **Description**: RAG search results from knowledge base are injected into the last user message using the `REFERENCE_PROMPT` template.
- **Logic Summary**: Before message preparation, if assistant has linked knowledge bases: (1) extract query from last user message, (2) search each linked KB via RAG app, (3) collect and rerank results, (4) format via `REFERENCE_PROMPT` template, (5) append formatted references to last user message content. Injection happens before the 9-stage pipeline.
- **Source Files**: `src/renderer/services/KnowledgeService.ts`, `src/renderer/prompts/reference.ts`
- **Cross-Feature**: Depends on F007-knowledge (BR-013, BR-015)

### BR-006: Provider URL Formatting

- **Description**: Per-provider URL construction rules handle API version path differences.
- **Logic Summary**: Rules by provider type: Anthropic appends `/v1`, Gemini appends `/v1beta`, Azure uses special resource-based URL, Ollama preserves custom path, `#` suffix in base URL suppresses automatic version path appending. URL is normalized (trailing slash handling) before version suffix.
- **Source Files**: `src/renderer/services/ProviderUrlFormatter.ts`

### BR-007: Special Provider Authentication

- **Description**: Certain providers require non-standard authentication flows.
- **Logic Summary**: Three special cases: (1) GitHub Copilot — OAuth token refresh flow, short-lived token cached and refreshed on 401, (2) CherryAI — request signing with HMAC, (3) Anthropic OAuth — Bearer token in Authorization header instead of API key in x-api-key. Auth method selected by provider type before request dispatch.
- **Source Files**: `src/renderer/services/auth/`

### BR-008: Developer-to-System Role Conversion

- **Description**: Messages with `developer` role are converted to `system` role for providers that don't support the developer role.
- **Logic Summary**: Check provider capability flags. If `supportsDeveloperRole === false`, iterate messages and convert `role: 'developer'` to `role: 'system'`. Applied after message preparation, before API serialization.
- **Source Files**: `src/renderer/services/MessagePreparer.ts`

### BR-009: Stream Processing Chunk Protocol

- **Description**: Streaming responses are processed via a typed chunk dispatch protocol with 20+ chunk types.
- **Logic Summary**: Each SSE/stream chunk is parsed into a typed discriminated union (text-delta, tool-call-begin, tool-result, reasoning, usage, error, finish, etc.). Dispatcher matches chunk type to registered callbacks. Callbacks update UI state (message content, tool panels, token counters). Protocol is provider-agnostic — provider adapters normalize to common chunk types.
- **Source Files**: `src/renderer/services/StreamProcessor.ts`, `src/renderer/types/chunks.ts`

### BR-010: MCP Server Mode Selection

- **Description**: MCP servers operate in three modes: disabled, auto (hub), manual (filtered).
- **Logic Summary**: Mode is per-assistant setting. `disabled` — no MCP tools available. `auto` (hub mode) — all active MCP servers' tools are aggregated and available (see BR-024). `manual` — only explicitly selected servers/tools from the assistant's MCP config are available. Mode determines which tools are injected into the completion request.
- **Source Files**: `src/renderer/services/McpManager.ts`
- **Cross-Feature**: Depends on F008-mcp (BR-021, BR-024)

### BR-011: Topic Auto-Naming

- **Description**: Conversation topics are automatically named by LLM summarization.
- **Logic Summary**: After the first assistant response, take the last 5 messages, send to `quickModel` (lightweight/fast model configured in settings) with a summarization prompt. Response becomes the topic title. Runs asynchronously, does not block conversation. Falls back to first user message truncation if summarization fails.
- **Source Files**: `src/renderer/services/TopicService.ts`

### BR-012: Rate Limiting

- **Description**: Per-provider configurable rate limiting with user notification.
- **Logic Summary**: Each provider has an optional `rateLimit` config (requests per minute). Before each request, check token bucket. If exceeded, show warning toast with wait time and queue the request. Rate limit state is in-memory, resets on app restart. Manual override not available — user must wait or switch provider.
- **Source Files**: `src/renderer/services/RateLimiter.ts`

---

## F007-knowledge — Knowledge Base

### BR-013: RAG Application Architecture

- **Description**: Each knowledge base has its own RAG application instance backed by a LibSqlDb vector database.
- **Logic Summary**: On KB creation, a RAG app is instantiated with dedicated LibSqlDb (SQLite-based vector store). Documents are chunked, embedded (via configured embedding model), and stored as vectors. Each KB is isolated — separate DB file, separate embedding config. RAG app handles add/delete/search lifecycle.
- **Source Files**: `src/main/services/KnowledgeService.ts`, `src/main/services/RagApp.ts`

### BR-014: Workload Management

- **Description**: Document processing uses concurrent limits and queue-based scheduling.
- **Logic Summary**: Concurrent processing capped at 80MB total file size + 30 items max. New items enter a queue. Queue processor picks items when capacity is available. Progress is tracked per-item and reported to renderer via IPC. Large files are chunked for processing to stay within memory limits.
- **Source Files**: `src/main/services/KnowledgeWorker.ts`

### BR-015: Knowledge Search with Reranking

- **Description**: Search results undergo threshold filtering and optional reranking.
- **Logic Summary**: (1) Vector similarity search returns top-N candidates, (2) filter by similarity threshold (configurable per KB), (3) if rerank model configured, send candidates to reranker and re-sort, (4) apply document count limit, (5) return final results with metadata. Reranking is optional — skipped if no rerank model configured.
- **Source Files**: `src/main/services/RagApp.ts`, `src/main/services/RerankerService.ts`
- **Cross-Feature**: Consumed by F004/F006 via BR-005

### BR-016: PDF Preprocessing

- **Description**: PDF documents are preprocessed with caching and fallback.
- **Logic Summary**: On PDF ingestion: (1) check cache for preprocessed version (keyed by file hash), (2) if cached, use preprocessed text, (3) if not cached, run PDF parser (text extraction + OCR fallback), (4) cache result, (5) if preprocessing fails entirely, fall back to raw file content. Cache persists across app restarts.
- **Source Files**: `src/main/services/PdfProcessor.ts`

---

## F010-backup-sync — Backup & Sync

### BR-017: Multi-Destination Backup

- **Description**: Backup supports WebDAV, S3, and Local destinations, each with independent auto-sync configuration.
- **Logic Summary**: Each backup destination is independently configured with: connection params, auto-sync on/off, sync interval. Multiple destinations can be active simultaneously. Backup operation produces a single archive, then distributes to all enabled destinations. Each destination has its own error handling and retry logic.
- **Source Files**: `src/main/services/BackupService.ts`, `src/main/services/backup/`

### BR-018: Backup Data Format & Versioning

- **Description**: Backup uses v5 format with migration support from v3 through v5.
- **Logic Summary**: Backup archive contains versioned JSON with schema version field. On restore: (1) read version, (2) if v3, run v3->v4 migration, (3) if v4, run v4->v5 migration, (4) apply v5 data. Migrations are sequential and composable. Each migration handles schema changes (field renames, structure changes, data transforms). Forward-only — no downgrade support.
- **Source Files**: `src/main/services/BackupMigration.ts`

### BR-019: Backup File Security

- **Description**: Path traversal prevention on backup file restore.
- **Logic Summary**: When extracting backup archive, each file path is validated via `startsWith` check against the intended extraction directory. Any path that escapes the target directory (e.g., `../../etc/passwd`) is rejected and skipped. Logged as security warning.
- **Source Files**: `src/main/services/BackupService.ts`

### BR-020: Auto-Sync Scheduling

- **Description**: Auto-sync uses interval-based scheduling with mutex protection.
- **Logic Summary**: Scheduler checks: `now >= lastSyncTime + syncInterval`. If due, acquire mutex (prevents concurrent manual + auto sync). Execute backup. Update lastSyncTime on success. Release mutex. If manual sync is in progress when auto-sync triggers, auto-sync is skipped (not queued). Interval is per-destination.
- **Source Files**: `src/main/services/SyncScheduler.ts`

---

## F008-mcp — Model Context Protocol

### BR-021: Client Connection Management

- **Description**: MCP clients are cached per config key with ping-based health checks.
- **Logic Summary**: Client instances cached in Map keyed by serialized config. On tool request: (1) check cache, (2) if cached, ping with 1-second timeout, (3) if ping succeeds, reuse client, (4) if ping fails or no cache, create new client and cache. Stale clients are cleaned up on config change. Cache is in-memory, cleared on app restart.
- **Source Files**: `src/main/services/McpClientManager.ts`

### BR-022: Transport Selection

- **Description**: MCP transport type is selected based on server configuration.
- **Logic Summary**: Config field `transport` determines: `stdio` — spawn child process with stdin/stdout, `sse` — Server-Sent Events over HTTP, `streamable-http` — StreamableHTTP protocol, `in-memory` — direct function calls (for bundled servers). Each transport implements the same MCP client interface. Transport is immutable per connection — changing requires reconnect.
- **Source Files**: `src/main/services/McpTransportFactory.ts`

### BR-023: Command Resolution

- **Description**: MCP server commands are resolved with shell environment fallback to bundled runtimes.
- **Logic Summary**: For stdio transport: (1) resolve command in shell PATH (`$PATH` environment), (2) if not found, check bundled runtimes (bun, uv shipped with app), (3) if bundled found, use bundled path. This ensures MCP servers work even without user-installed runtimes. Resolution is logged for debugging.
- **Source Files**: `src/main/services/McpCommandResolver.ts`

### BR-024: Hub Server Aggregation

- **Description**: Hub mode aggregates all active MCP servers' tools with namespaced IDs.
- **Logic Summary**: In hub/auto mode: (1) enumerate all active (connected) MCP servers, (2) list tools from each server, (3) namespace tool IDs as `serverId__toolName` to prevent collisions, (4) merge into unified tool list, (5) inject merged list into completion request. Tool call responses are routed back to the originating server by parsing the namespace prefix.
- **Source Files**: `src/main/services/McpHub.ts`
- **Cross-Feature**: Consumed by F004/F006 via BR-010

### BR-025: Tool Caching

- **Description**: MCP tool definitions are cached with TTL via CacheService.
- **Logic Summary**: After listing tools from an MCP server, cache the tool definitions with a configurable TTL. Subsequent requests within TTL return cached definitions without server round-trip. Cache key includes server ID and config hash. Cache invalidated on: server reconnect, manual refresh, config change.
- **Source Files**: `src/main/services/CacheService.ts`, `src/main/services/McpClientManager.ts`

---

## F014-extras — Memory

### BR-026: Memory Processing Pipeline

- **Description**: Memory uses a two-phase LLM pipeline — fact extraction followed by memory update.
- **Logic Summary**: Phase 1 (Extract): Take conversation messages, send to LLM with fact-extraction prompt, receive structured facts. Phase 2 (Update): Load existing memory store, send existing memories + new facts to LLM with update prompt (merge, deduplicate, resolve conflicts), receive updated memory set. Write updated set to persistent store. Both phases use the configured memory model (may differ from chat model).
- **Source Files**: `src/main/services/MemoryService.ts`

### BR-027: Memory Service Configuration Sync

- **Description**: Memory configuration syncs from Redux store (renderer) to main process service.
- **Logic Summary**: When memory settings change in Redux (renderer process), an IPC message is sent to main process to update MemoryService configuration. This includes: enabled/disabled toggle, memory model selection, memory store path. Main process MemoryService re-initializes with new config on receipt. No restart required.
- **Source Files**: `src/main/services/MemoryService.ts`, `src/renderer/store/memorySlice.ts`

---

## F005-assistant — Assistant

### BR-028: Settings Normalization

- **Description**: Assistant settings undergo normalization for context count and token limits.
- **Logic Summary**: On assistant settings load/save: (1) `MAX_CONTEXT_COUNT` — convert special values (0 = unlimited, negative = default), cap at provider maximum, (2) `maxTokens` — validate against model's max output tokens, clamp to valid range, warn if adjusted. Normalization runs on both settings UI display and before API request construction.
- **Source Files**: `src/renderer/services/AssistantService.ts`

### BR-029: Reasoning Effort Auto-Sync

- **Description**: Reasoning effort setting auto-syncs when the model changes.
- **Logic Summary**: Watch assistant's model field. On model change: (1) check if new model supports reasoning, (2) if yes and no explicit reasoning_effort set, apply model's default, (3) if no, clear reasoning_effort field. This prevents invalid reasoning_effort values from being sent to non-reasoning models. Sync is reactive (triggered by model change event).
- **Source Files**: `src/renderer/services/AssistantService.ts`

### BR-030: Translate Assistant Configuration

- **Description**: Translation assistant has specialized configuration with auto-disabled reasoning.
- **Logic Summary**: When assistant type is `translate`: (1) auto-disable reasoning (reasoning_effort = null), (2) inject specialized translation system prompt, (3) adjust temperature for translation task (lower for accuracy). Configuration is enforced on assistant creation and on type change. Prevents incompatible settings combinations for translation use case.
- **Source Files**: `src/renderer/services/AssistantService.ts`

---

## Cross-Feature Dependencies

| Source Rule | Target Rule | Relationship |
|---|---|---|
| BR-005 (RAG Injection) | BR-013, BR-015 (KB Architecture, Search) | Chat pipeline invokes KB search for reference injection |
| BR-010 (MCP Mode) | BR-021, BR-024 (Client Mgmt, Hub) | Chat pipeline uses MCP tools based on mode selection |
| BR-024 (Hub Aggregation) | BR-021, BR-022 (Client Mgmt, Transport) | Hub iterates connected clients for tool aggregation |
| BR-025 (Tool Cache) | BR-021 (Client Mgmt) | Cache invalidated on client reconnect |
| BR-004 (Message Prep) | BR-008 (Role Conversion) | Role conversion is a stage within message preparation |
| BR-005 (RAG Injection) | BR-004 (Message Prep) | RAG injection happens before the 9-stage pipeline |
| BR-001 (Dual Architecture) | BR-002 (Plugin Pipeline) | Plugin pipeline applies to modern architecture path |
| BR-009 (Stream Protocol) | BR-001 (Dual Architecture) | Both architecture paths converge at chunk dispatch |
| BR-027 (Memory Config Sync) | BR-026 (Memory Pipeline) | Config sync triggers pipeline re-initialization |
| BR-017 (Multi-Dest Backup) | BR-020 (Auto-Sync) | Each destination has independent auto-sync scheduling |
| BR-018 (Format & Version) | BR-019 (File Security) | Security checks applied during versioned archive extraction |
