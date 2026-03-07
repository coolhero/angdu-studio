# Business Logic Map

Source: /Users/coolhero/Study/oss/cherry-studio
Generated: 2026-03-04

---

## Logic Index

| Feature | Rules | Validations | Workflows | Cross-Feature Rules |
|---------|-------|-------------|-----------|---------------------|
| F001-core-platform | Platform detection, dev mode, portable mode | -- | App init, window mgmt, encrypted storage | Settings (F008) affect platform behavior |
| F002-provider-management | Auth/charge allowlists, model unique ID, name resolution with CherryAI remap | Model existence across enabled providers | -- | Provider rate limits gate F005 |
| F003-ai-core-engine | Plugin execution order (pre/default/post), recursive call safety (max 10), V3 model enforcement | -- | Plugin hook chain (First/Sequential/Parallel), runtime executor factory, provider registration with aliases | All AI operations route through aiCore |
| F004-knowledge-base | Queue limits (30 concurrent, 80MB), PDF preprocessing gate, score threshold, chunk size cap | Embedding model URL adaptation per provider | Knowledge search pipeline, multi-question search with dedup, reference injection | Embedding infra reused by F011 |
| F005-ai-chat | Context window mgmt, rate limiting, generation lock, message interleaving, Qwen3 think suffix | Message must have blocks, topic queue serialization | Message send flow, stream chunk state machine, block manager smart update, callback composition, topic prompt concat | Central consumer of F002-F004, F006, F010-F012 |
| F006-mcp-integration | Tool ID format (serverId__toolName), sensitive data redaction, LRU tool caching | -- | Client connection with failover, transport selection, active server tool aggregation | Tools available to F005, F012 |
| F007-backup-sync | Naming convention, per-device retention, format versioning (v1-v5) | Connection caching invalidation, ZIP64 for large backups | Auto-sync with exponential backoff, factory reset double confirm, temp backup security check | Serializes entire store (all features) |
| F008-settings-ui | Shortcut registration, theme application, locale management | -- | -- | Affects all features globally |
| F009-notes-editor | Safe file naming, rename conflict detection, tree sorting (6 modes) | -- | Full-text search with scoring, batch upload with watcher pause, legacy upload concurrency | -- |
| F010-auxiliary-features | Translation history, painting provider params, mini app type/region | -- | -- | Web search injection into F005 |
| F011-memory-system | SHA-256 dedup, similarity threshold (0.85), embedding dim normalization (1536), default user protection, soft delete | -- | Fact extraction pipeline, memory update decision engine, config sync, DB migration | Memory context injected into F005; reuses F004 embedding |
| F012-agent-framework | Agent ID format, path validation (absolute only), tool permission 60s timeout, auto-deny on no window, MCP tool ID normalization | -- | Tool permission approval flow, slash command merge, session inheritance, agent session auto-rename, SSE stream parsing | Consumes F006 tools; sessions flow into F005 |

---

## F001-core-platform

### Rules

**R001-01 Platform detection**
- `isMac`: `process.platform === 'darwin'`
- `isWin`: `process.platform === 'win32'`
- `isLinux`: `process.platform === 'linux'`
- Platform flag is resolved once at startup and treated as immutable for the lifetime of the process.

**R001-02 Dev mode detection**
- Dev mode is active when Electron is not packaged (`!app.isPackaged`) or the `NODE_ENV` environment variable is set to `development`.
- Dev mode enables additional logging, dev tools access, and relaxed CSP.

**R001-03 Portable mode detection**
- Portable mode is detected by the presence of a `portable` marker file or directory adjacent to the application executable.
- When portable mode is active, all user data (config, database, logs) is stored relative to the executable path instead of the OS-standard user data directory.

### Workflows

**W001-01 App initialization**
1. **Bootstrap**: Electron `app.whenReady()` fires.
2. **Config**: Load persisted configuration from disk (JSON or encrypted store). Merge with defaults.
3. **IPC registration**: Register all main-process IPC handlers before any renderer is created.
4. **Services**: Initialize background services (database connections, file watchers, scheduled tasks).
5. **Window creation**: Create the main BrowserWindow; load the renderer entry point.

**W001-02 Window management**
- Single main window with optional secondary windows (mini apps, settings panels).
- Window state (position, size, maximized) is persisted and restored on next launch.
- On macOS, closing the window hides it instead of quitting unless explicitly quit.

**W001-03 File storage with encryption**
- Sensitive values (API keys, tokens) are stored using Electron `safeStorage` encryption.
- Encrypted values are base64-encoded before writing to the config file.
- Decryption happens lazily on first read after app startup.

---

## F002-provider-management

### Rules

**R002-01 Provider auth/charge support allowlists**
- Each provider has a static allowlist declaring whether it supports API-key auth, OAuth, or both.
- A separate charge-support allowlist determines which providers expose balance/usage endpoints.
- Providers not on the auth allowlist cannot be enabled in settings.

**R002-02 Model unique identification**
- Every model is uniquely identified by the tuple `(providerId, modelId)`.
- `modelId` is the canonical string returned by the provider API (e.g., `gpt-4o`, `claude-opus-4-6`).
- Display names may differ from `modelId` but are never used for programmatic lookup.

**R002-03 Provider name resolution with CherryAI remapping**
- Provider names are resolved through a mapping table.
- The CherryAI provider is remapped to its underlying provider name for API calls while retaining the CherryAI branding in the UI.
- Resolution order: user override > CherryAI remap table > provider default name.

### Validations

**V002-01 Model existence validation across enabled providers**
- Before any AI operation, the system validates that the requested model exists and belongs to an enabled provider.
- If the model is not found among enabled providers, the operation is rejected with a user-facing error.
- This validation runs at the chat-send boundary, not at model-selection time, to allow toggling providers without losing draft state.

---

## F003-ai-core-engine

### Rules

**R003-01 Plugin execution order**
- Plugins declare an execution phase: `pre`, `default`, or `post`.
- Within a phase, plugins run in registration order.
- Phase ordering is strict: all `pre` plugins complete before any `default` plugin starts; all `default` plugins complete before any `post` plugin starts.

**R003-02 Recursive call safety**
- AI operations that trigger further AI operations (e.g., tool calls invoking another completion) track recursion depth.
- Maximum recursion depth is **10**.
- Exceeding the limit aborts the operation and returns an error to the caller.

**R003-03 V3 model enforcement**
- Certain features require models that conform to the V3 capability set (structured output, tool use, streaming).
- If a non-V3 model is selected for a V3-required feature, the system either upgrades to the nearest V3 model or blocks the operation with an explanation.

### Workflows

**W003-01 Plugin hook chain**
- **First**: Returns the result of the first plugin that produces a non-null value. Remaining plugins are skipped.
- **Sequential**: Each plugin receives the output of the previous plugin as input. Final output is the last plugin's result.
- **Parallel**: All plugins execute concurrently. Results are collected into an array.

**W003-02 Runtime executor factory pattern**
- The `createExecutor(provider)` factory inspects the provider configuration and returns the appropriate executor instance (OpenAI-compatible, Anthropic, Google, Ollama, etc.).
- Executors share a common interface: `sendMessage`, `streamMessage`, `abort`.
- The factory caches executor instances per provider to avoid repeated construction.

**W003-03 Provider registration with aliases**
- Providers register with a primary ID and zero or more aliases.
- Aliases allow backward compatibility when provider IDs change (e.g., renaming).
- Alias lookup is O(1) via a flat map built at registration time.

---

## F004-knowledge-base

### Rules

**R004-01 Processing queue limits**
- Maximum **30 concurrent** document processing tasks.
- Maximum file size: **80 MB** per document.
- Files exceeding the size limit are rejected before entering the queue.

**R004-02 PDF preprocessing gate**
- PDF files pass through a preprocessing step that extracts text, images, and metadata before chunking.
- If the PDF preprocessor fails (corrupt file, encrypted PDF without password), the document is marked as failed and removed from the queue.

**R004-03 Score threshold filtering**
- Search results below the configured relevance score threshold are discarded.
- The threshold is configurable per knowledge base; the default is determined by the embedding model.

**R004-04 Chunk size capping**
- Documents are split into chunks with a configurable maximum size.
- Chunks that exceed the cap after splitting (edge case with indivisible tokens) are truncated with a trailing ellipsis marker.

### Workflows

**W004-01 Knowledge search pipeline**
1. **Truncate**: Query text is truncated to the embedding model's maximum input length.
2. **Search**: Vector similarity search against the knowledge base index.
3. **Filter**: Results below the score threshold are removed (R004-03).
4. **Rerank**: Remaining results are reranked using a cross-encoder or LLM-based reranker if configured.
5. **Limit**: Final results are capped to the configured top-K.

**W004-02 Multi-question search with deduplication**
- When a user message contains multiple questions (detected by sentence splitting or LLM decomposition), each question is searched independently.
- Results across all sub-queries are merged and deduplicated by chunk ID.
- Deduplication preserves the highest score for each chunk.

**W004-03 Knowledge reference injection into user messages**
- Retrieved knowledge chunks are formatted as a system-level or user-level context block and prepended to the user message.
- The injection point is configurable: before the user message, as a separate system message, or inline.
- Token budget for injected knowledge is enforced to prevent exceeding the model's context window.

### Validations

**V004-01 Embedding model URL adaptation per provider type**
- **Gemini**: Embedding endpoint uses the Gemini-specific `/v1beta/models/{model}:embedContent` path.
- **Azure**: Embedding endpoint is constructed from the Azure deployment URL with `/openai/deployments/{deployment}/embeddings`.
- **Ollama**: Embedding endpoint uses the local Ollama API at `/api/embeddings`.
- The URL adaptation runs at knowledge-base creation time and is re-evaluated when the provider configuration changes.

---

## F005-ai-chat

### Rules

**R005-01 Context window management**
- `contextCount` controls how many previous messages are included in the prompt.
- A special sentinel value `MAX_CONTEXT_COUNT` means "include all messages that fit within the model's token limit."
- When `contextCount` is set, messages are selected from most recent backward, and older messages are dropped.

**R005-02 Rate limiting per provider**
- Each provider may define a rate limit (requests per minute, tokens per minute).
- The rate limiter queues requests that exceed the limit and dispatches them when capacity is available.
- Rate limit errors from the API (HTTP 429) trigger automatic retry with backoff.

**R005-03 Generation lock**
- Only one generation (completion request) may be active per conversation at a time.
- Attempting to send a new message while a generation is in progress is blocked at the UI level.
- The lock is released when the stream ends, an error occurs, or the user explicitly aborts.

**R005-04 Message interleaving for deepseek-reasoner**
- When the model is `deepseek-reasoner`, messages are interleaved to ensure alternating user/assistant turns.
- Consecutive same-role messages are merged or a synthetic separator is inserted.

**R005-05 Qwen3 think/no_think suffix**
- For Qwen3 models, a `/think` or `/no_think` suffix is appended to the user message based on the thinking mode toggle.
- The suffix controls whether the model produces chain-of-thought reasoning in its response.

### Workflows

**W005-01 Message sending flow**
1. **Save**: The user message is persisted to the local database immediately.
2. **Route**: The message is routed to the appropriate executor via the aiCore engine (F003).
3. **Stream**: The response is streamed back as chunks.
4. **Blocks**: Chunks are assembled into message blocks (text, code, tool calls, artifacts).

**W005-02 Stream chunk processing state machine**
- The stream processor handles **30+ chunk types** including: text delta, tool call start, tool call delta, tool call end, reasoning delta, image data, citation, usage stats, error, done.
- State transitions are driven by chunk type: e.g., `tool_call_start` transitions to `in_tool_call` state, `tool_call_end` transitions back to `streaming_text`.
- Unrecognized chunk types are logged and ignored (forward compatibility).

**W005-03 Block manager smart update**
- Block updates are **throttled to 150ms** to avoid excessive re-renders.
- An **immediate flush** occurs when the block type changes (e.g., from text to code), ensuring visual transitions are crisp.
- The block manager maintains an ordered list of blocks per message, appending new blocks as they appear in the stream.

**W005-04 Callback composition (8 modules)**
- The chat callback system composes 8 independent modules:
  1. Message persistence
  2. Token counting / usage tracking
  3. Title generation
  4. Knowledge base context injection
  5. Memory context injection
  6. MCP tool execution
  7. Web search result injection
  8. UI state updates (scroll, loading indicators)
- Each module registers hooks for `onStart`, `onChunk`, `onToolCall`, `onComplete`, and `onError`.

**W005-05 Topic prompt concatenation**
- Each topic (conversation) may have a system prompt.
- The final system prompt is constructed by concatenating: global system prompt + topic-specific prompt + agent prompt (if any).
- Concatenation preserves ordering and inserts newline separators between segments.

### Validations

**V005-01 Message must have blocks**
- A message without at least one block is considered invalid and is not displayed.
- On load, messages with zero blocks are either reconstructed from raw content or filtered out.

**V005-02 Topic queue serialization**
- Messages within a topic are serialized: the next message is not sent until the current generation completes.
- This prevents race conditions in context assembly and ensures consistent message ordering.

---

## F006-mcp-integration

### Rules

**R006-01 Tool ID format**
- MCP tool IDs follow the format: `{serverId}__{toolName}` (double underscore separator).
- This format allows deterministic decomposition back into server and tool components.

**R006-02 Sensitive data redaction**
- Tool call arguments and results are scanned for sensitive patterns (API keys, tokens, passwords).
- Matched patterns are replaced with `[REDACTED]` before logging or displaying in the UI.

**R006-03 Tool caching with LRU**
- Tool definitions (schema, description) are cached using an LRU cache.
- Cache entries are keyed by `serverId` and invalidated when the server reconnects or its configuration changes.

### Workflows

**W006-01 MCP client connection with failover**
1. **Dedup**: If a connection attempt is already in progress for the same server, the new request waits for the existing attempt.
2. **Ping**: The existing connection (if any) is pinged to check liveness.
3. **Create**: If the ping fails or no connection exists, a new connection is established using the configured transport.

**W006-02 Transport selection**
- **InMemory**: Used for built-in/bundled MCP servers running in the same process.
- **SSE**: Server-Sent Events transport for HTTP-based remote servers (legacy).
- **StreamableHTTP**: Modern HTTP transport with bidirectional streaming support.
- **Stdio**: Standard I/O transport for local subprocess-based servers.
- Transport is selected based on the server configuration's `transport` field.

**W006-03 Active server tool aggregation with disabled tool filtering**
- On each chat interaction, the system aggregates tools from all active (connected) MCP servers.
- Tools that the user has explicitly disabled are filtered out before injection into the prompt.
- The aggregated tool list is passed to the model as available functions/tools.

---

## F007-backup-sync

### Rules

**R007-01 Backup naming convention**
- Backup filenames follow: `cherry-studio.{timestamp}.{hostname}.{deviceType}.zip`
- `timestamp`: ISO 8601 format with seconds precision.
- `hostname`: Machine hostname, sanitized for filesystem safety.
- `deviceType`: One of `desktop`, `portable`.

**R007-02 Per-device retention**
- Each device has a `maxBackups` setting controlling how many backups are kept.
- When a new backup is created and the count exceeds `maxBackups`, the oldest backup for that device is deleted.
- Retention is per-device: backups from other devices are not counted or affected.

**R007-03 Backup format versioning**
- Backup formats are versioned from **v1** through **v5**.
- Each version defines the schema for the serialized data inside the ZIP.
- The restore process detects the version from the backup metadata and applies the appropriate migration chain to bring it up to the current version.

### Workflows

**W007-01 Auto-sync with exponential backoff**
- Auto-sync is triggered on a configurable interval (default: periodic).
- On failure, retries occur up to **4 times** with exponential backoff: delay = `2^n * 10000 - 3000` ms (where n is the retry attempt, 0-indexed).
- After all retries are exhausted, the sync is marked as failed and the user is notified.

**W007-02 Factory reset with double confirmation**
- Factory reset requires two explicit user confirmations (dialog → second dialog with typed confirmation).
- The reset process: stops all services → deletes all user data → restores default configuration → restarts the app.

**W007-03 Temp backup security check for LAN transfer**
- Before accepting a backup via LAN transfer, the system creates a temporary copy and validates its integrity (ZIP CRC, schema version, expected file structure).
- If validation fails, the temp file is deleted and the transfer is rejected.

### Validations

**V007-01 Connection caching invalidation**
- Cached WebDAV/S3 connections are invalidated when the backup server configuration changes.
- A configuration change is detected by comparing a hash of the relevant settings fields.

**V007-02 ZIP64 for large backups**
- When the backup data exceeds 4 GB (standard ZIP limit), the system automatically switches to ZIP64 format.
- The restore process detects ZIP64 headers and handles them transparently.

---

## F008-settings-ui

### Rules

**R008-01 Shortcut registration**
- Keyboard shortcuts are registered globally via Electron's `globalShortcut` module.
- Conflicts with OS-level shortcuts are detected at registration time and reported to the user.
- Shortcuts are re-registered when the settings change.

**R008-02 Theme application**
- Themes are applied by setting CSS custom properties on the root element.
- Theme changes are immediate (no page reload required).
- Supported themes: light, dark, system (follows OS preference).

**R008-03 Locale management**
- Locale is stored in settings and applied at app startup via i18n initialization.
- Changing the locale at runtime triggers a re-render of all translated strings.
- Fallback chain: user locale → `en-US`.

### Cross-Feature Rules

- **Proxy settings** (F008) are applied to all HTTP clients across the application, including provider API calls (F002/F003), web search (F010), backup sync (F007), and MCP transports (F006).
- **Theme** (F008) affects all UI components across every feature.
- **Language/locale** (F008) affects all user-facing strings in every feature.
- **Keyboard shortcuts** (F008) can trigger actions in chat (F005), notes (F009), and global navigation.

---

## F009-notes-editor

### Rules

**R009-01 Safe file naming**
- Note file names are sanitized: special characters are removed or replaced with underscores.
- Maximum file name length is enforced (255 characters).
- File names are normalized to NFC Unicode form for cross-platform consistency.

**R009-02 Rename conflict detection**
- When renaming a note, the system checks for an existing note with the target name in the same directory.
- If a conflict is detected, the user is prompted to choose: overwrite, auto-rename (append numeric suffix), or cancel.

**R009-03 Tree sorting (6 modes with locale-aware comparison)**
- Notes tree supports 6 sorting modes:
  1. Name ascending
  2. Name descending
  3. Created date ascending
  4. Created date descending
  5. Modified date ascending
  6. Modified date descending
- Name-based sorting uses `Intl.Collator` for locale-aware string comparison, respecting the user's configured locale.

### Workflows

**W009-01 Full-text search with scoring**
- Search scoring algorithm:
  - **Exact title match**: +200 points
  - **Title contains query**: +100 points
  - **Content match**: +2 points per occurrence, capped at 50 points total
  - **Recency boost**: Additional points based on last-modified time (more recent = higher boost)
- Results are sorted by total score descending.

**W009-02 Batch upload with file watcher pause**
- During batch file upload, the file watcher is paused to avoid triggering redundant change events.
- The watcher is resumed after all files are written to disk.
- If the upload fails partway through, already-written files are not rolled back (eventual consistency).

**W009-03 Legacy upload with concurrency**
- Legacy upload mode processes files in batches of **5** concurrent uploads.
- Each batch must complete before the next batch starts.
- Progress is reported per-file and per-batch.

---

## F010-auxiliary-features

### Rules

**R010-01 Translation history persistence**
- Translation results are persisted to the local database with the source text, target language, and timestamp.
- History is queryable and can be re-used to avoid redundant API calls for identical translations.

**R010-02 Painting provider-specific params**
- Image generation (painting) adapts its API parameters based on the selected provider.
- Provider-specific parameters (e.g., DALL-E's `quality`, Stable Diffusion's `cfg_scale`) are mapped from a unified settings schema.

**R010-03 Mini app type/region support**
- Mini apps declare a `type` (tool, game, utility) and `region` (global, CN, etc.).
- The mini app catalog filters available apps based on the user's configured region.

### Cross-Feature Rules

- **Web search provider injection into chat context** (F010 -> F005): When web search is enabled for a conversation, search results are fetched for the user's query and injected as context into the chat message before sending to the AI model. The injection format and position follow the same pattern as knowledge base injection (F004).

---

## F011-memory-system

### Rules

**R011-01 SHA-256 deduplication**
- Each memory fact is hashed using SHA-256 over its normalized content.
- Before inserting a new fact, the hash is checked against existing entries.
- Duplicate hashes are rejected (the existing fact is preserved).

**R011-02 Semantic similarity threshold (0.85)**
- When checking for semantically equivalent memories, cosine similarity is computed between embedding vectors.
- A threshold of **0.85** is used: facts above this threshold are considered duplicates or near-duplicates.
- Near-duplicates trigger an update decision rather than a new insertion.

**R011-03 Embedding dimension normalization (1536)**
- All memory embeddings are normalized to **1536 dimensions**.
- If the embedding model produces a different dimensionality, the vector is either zero-padded or truncated to 1536.
- This ensures uniform storage and comparison regardless of the embedding model used.

**R011-04 Default user protection**
- The system maintains a default user profile for memory storage.
- The default user cannot be deleted.
- Attempts to delete the default user are silently ignored or return a user-facing warning.

**R011-05 Soft delete with history tracking**
- Deleted memories are soft-deleted (marked with a `deletedAt` timestamp) rather than physically removed.
- A history log records all mutations (create, update, delete) with timestamps and the acting user.
- Soft-deleted memories are excluded from search results but can be restored.

### Workflows

**W011-01 Fact extraction pipeline**
1. **LLM extraction**: The user's conversation is sent to an LLM with a prompt designed to extract factual statements.
2. **JSON parse**: The LLM response is parsed using `jaison` (a lenient JSON parser that handles common LLM output quirks).
3. **Zod validate**: Parsed facts are validated against a Zod schema defining the expected structure (content, category, confidence).
4. Facts that fail validation are discarded; valid facts proceed to the deduplication check (R011-01, R011-02).

**W011-02 Memory update decision engine**
- For each extracted fact, the engine decides among four actions:
  - **ADD**: Fact is new (no hash match, no semantic near-duplicate). Insert into the database.
  - **UPDATE**: A semantically similar fact exists (similarity >= 0.85). Merge or replace the existing fact.
  - **DELETE**: The new fact contradicts or invalidates an existing fact. Soft-delete the old fact.
  - **NONE**: The fact is an exact duplicate (hash match). No action taken.
- The decision is made by an LLM call that receives the new fact and the top-K existing similar facts.

**W011-03 Config synchronization (Redux -> IPC -> main)**
- Memory system configuration (enabled/disabled, user profiles, thresholds) lives in the Redux store (renderer).
- Changes are propagated via IPC to the main process, which updates the memory service configuration.
- On app startup, the main process reads persisted config and sends it to the renderer to initialize the Redux slice.

**W011-04 DB migration**
- The memory database schema is versioned.
- On startup, the system checks the current schema version and applies pending migrations sequentially.
- Migrations are idempotent and wrapped in transactions for atomicity.

---

## F012-agent-framework

### Rules

**R012-01 Agent ID format**
- Agent IDs follow the format: `agent_{timestamp}_{random}` where `timestamp` is Unix milliseconds and `random` is a short random string.
- This format ensures uniqueness and provides creation-time ordering.

**R012-02 Path validation (absolute only)**
- All file paths provided to agent tools must be absolute paths.
- Relative paths are rejected with an error before any file system operation occurs.
- This prevents path traversal attacks and ensures deterministic behavior.

**R012-03 Tool permission 60-second timeout**
- When an agent requests to use a tool that requires user approval, a permission dialog is shown.
- If the user does not respond within **60 seconds**, the permission request is automatically denied.
- The timeout is reset for each new permission request.

**R012-04 Auto-deny on no window**
- If no application window is available (e.g., app is minimized to tray on some platforms), tool permission requests are automatically denied.
- This prevents agents from silently executing tools when the user cannot see or respond to the approval dialog.

**R012-05 MCP tool ID normalization (legacy compat)**
- Legacy MCP tool IDs that use single-underscore or dot separators are normalized to the standard double-underscore format (`serverId__toolName`).
- This ensures backward compatibility with older agent configurations that reference tools by legacy IDs.

### Workflows

**W012-01 Tool permission approval flow**
1. **IPC broadcast**: The main process broadcasts a permission request to all renderer windows.
2. **Wait**: The system waits for a response from any window.
3. **Timeout/Response**: Either the user approves/denies within 60 seconds, or the request times out and is auto-denied (R012-03, R012-04).
4. The approval result is returned to the agent runtime, which proceeds or aborts the tool call accordingly.

**W012-02 Slash command merge (builtin + plugin)**
- The agent framework provides builtin slash commands (e.g., `/clear`, `/reset`).
- Plugins can register additional slash commands.
- At runtime, builtin and plugin commands are merged into a single command registry.
- Conflicts are resolved by giving priority to builtin commands.

**W012-03 Session inheritance from agent**
- When a new chat session is created from an agent, the session inherits:
  - The agent's system prompt
  - The agent's tool configuration (which MCP servers and tools are enabled)
  - The agent's model preference
- Inherited settings can be overridden per-session by the user.

**W012-04 Agent session auto-rename via AI**
- After the first few messages in an agent session, the session title is automatically generated by sending the conversation summary to an AI model.
- The rename is non-blocking and happens in the background.
- If the AI rename fails, the session retains its default name (e.g., "New Session").

**W012-05 SSE stream parsing**
- Agent responses that arrive via Server-Sent Events (SSE) are parsed using a streaming parser.
- The parser handles reconnection, event ID tracking, and data buffering across chunked responses.
- Malformed SSE events are logged and skipped without breaking the stream.

---

## Cross-Feature Rules

### CFR-01: AI operations route through aiCore executor
- **F003 -> F005, F010, F011**
- All AI completion requests (chat, translation, memory extraction, web search summarization) must use the aiCore executor factory (F003) to obtain the correct provider executor.
- Direct API calls bypassing aiCore are prohibited to ensure consistent plugin execution, rate limiting, and error handling.

### CFR-02: Knowledge search results injected into chat context
- **F004 -> F005**
- When a conversation has an associated knowledge base, relevant chunks are retrieved via the knowledge search pipeline (W004-01) and injected into the chat context before the message is sent to the AI model.
- The injection respects the token budget and is positioned according to the user's configuration.

### CFR-03: Memory search results injected as context
- **F011 -> F005**
- When the memory system is enabled, relevant memories for the current user are retrieved and injected into the chat context alongside knowledge base results.
- Memory context is clearly demarcated from knowledge base context so the model can distinguish between them.

### CFR-04: MCP tools available to chat and agents
- **F006 -> F005, F012**
- MCP tools from active servers are made available as callable functions during chat completions (F005) and agent executions (F012).
- Tool availability is re-evaluated at the start of each generation to reflect any server connection changes.

### CFR-05: Provider rate limits gate message sending
- **F002 -> F005**
- Provider rate limits defined in F002 are enforced at the F005 message-sending boundary.
- If a provider's rate limit is exhausted, the message is queued and the user is informed of the wait time.

### CFR-06: Backup serializes entire Redux/Zustand store + IndexedDB
- **F007 -> all**
- The backup system captures the complete application state: Redux store (settings, UI state), Zustand stores (chat, notes), and IndexedDB (messages, knowledge base vectors, memory facts).
- Restoring a backup replaces the entire state, affecting all features.

### CFR-07: Settings affect all features globally
- **F008 -> all**
- Proxy, theme, locale, and keyboard shortcut settings are global singletons.
- Any change in F008 propagates to all features without requiring per-feature configuration.

### CFR-08: Memory reuses knowledge-base embedding infrastructure
- **F004 -> F011**
- The memory system (F011) uses the same embedding model and vector storage infrastructure as the knowledge base (F004).
- Embedding model URL adaptation rules (V004-01) apply equally to memory embeddings.
- This ensures consistency in vector dimensions and similarity computations across both systems.
