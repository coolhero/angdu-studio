# Business Logic Map

> Angdu Studio Reverse-Spec | Generated 2026-03-14
> Source: Cherry Studio business rule analysis

---

## F001-shell: Application Shell & Window Management

### Window State Persistence
- Window bounds (x, y, width, height) saved to electron-store on every resize/move event (debounced 500ms)
- On app launch, restore last saved bounds; if bounds fall outside current display, reset to center of primary display
- Maximized state tracked separately; restored on launch

### Tray Behavior
- When tray is enabled and user clicks window close: window hides instead of closing (app stays in tray)
- When tray is disabled: window close quits the app
- Tray context menu provides: Show Window, Check for Updates, Quit
- macOS: tray icon adapts to dark/light menu bar

### Auto-Update
- Check for updates on app launch (after 5s delay to avoid blocking startup)
- Check interval: every 4 hours while running
- User can manually trigger check via Settings
- Download happens in background; user prompted to install and restart
- Update channel: stable only (no beta/canary)

### Deep Linking
- Protocol: `cherrystudio://` (Angdu: `angdustudio://`)
- Supported actions: open assistant, import provider config, open specific route
- When app not running: launch app first, then handle URL
- When app running: bring window to front, then handle URL

### Multi-Window State Sync (StoreSyncService)
- Uses IPC broadcast pattern: window A dispatches state change -> main process -> broadcasts to all other windows
- Selective sync: only specific store slices are synced (providers, assistants, settings)
- Conflict resolution: last-write-wins (no CRDT)
- New window inherits full state snapshot on creation

---

## F003-providers: Provider Management

### Provider Type Validation
- Each provider type has a hardcoded configuration schema defining: required fields, optional fields, auth type, default API host
- System providers (isSystem: true) cannot be deleted, only disabled
- Custom providers can be created by duplicating any provider type

### API Key Handling
- API keys encrypted using Electron safeStorage API before persisting to store
- Keys decrypted only at the moment of API call construction
- Keys never included in export/backup (user must re-enter)
- Multiple keys per provider supported (for key rotation / load balancing)

### Rate Limiting
- Per-provider configurable rate limit (requests per minute)
- Enforced in renderer before sending request
- Queue system: excess requests queued with FIFO ordering
- Rate limit of 0 means unlimited

### Service Tier / Region Selection
- AWS Bedrock: requires region + IAM auth (access key + secret key) or profile
- Azure OpenAI: requires deployment name + resource name + API version
- Google Vertex: requires project ID + location + service account JSON

### Auth Type Handling
- Most providers: API key in Authorization header
- AWS Bedrock: IAM Signature V4 (access key + secret key)
- Azure: API key in `api-key` header (not Authorization)
- OAuth providers: token refresh flow managed by provider class
- Custom headers: user can add arbitrary headers per provider

### Model Auto-Discovery
- On provider enable: attempt to fetch model list from provider API
- If API returns models: merge with any user-configured models
- If API unavailable: fall back to hardcoded model list
- User can manually add/remove models regardless of API availability

---

## F005-assistants: Assistant Management

### Default Assistant Creation
- App ships with one default assistant (cannot be deleted)
- Default assistant uses no specific model (inherits from global default)
- Default assistant has empty system prompt

### System Prompt Injection
- System prompt prepended to every conversation as first system message
- If assistant has no system prompt, no system message is sent
- System prompt supports variable interpolation: `{{date}}`, `{{time}}`, `{{language}}`

### Model Binding
- Each assistant can bind to a specific model, or leave unbound (uses global default)
- If bound model becomes unavailable (provider disabled/deleted): warn user, fall back to global default
- Model change mid-conversation: applies from next message onward (does not re-process history)

### Emoji Avatar
- Random emoji assigned at creation from a curated set
- User can change to any emoji
- Emoji stored as Unicode string, rendered natively

### Preset Import/Export
- Export format: JSON file containing assistant config (no topics/messages)
- Import: validates JSON structure, generates new UUID, merges into assistant list
- Batch import supported (JSON array)

---

## F006-chat-core: Chat & Messaging

### Message Streaming Pipeline
1. User submits message (text + optional attachments)
2. System constructs message array (system prompt + context window messages)
3. If knowledge base attached: run semantic search, inject results as context
4. If MCP tools enabled: include tool definitions in request
5. Send to AI SDK `streamText()` or `streamObject()`
6. Stream chunks arrive as SSE events
7. Each chunk is dispatched to the appropriate MessageBlock:
   - Text chunks -> MainText block (append)
   - Thinking chunks -> Thinking block (append)
   - Tool call chunks -> Tool block (accumulate args, then execute)
   - Image generation -> Image block
8. On stream complete: finalize all blocks (status -> SUCCESS)
9. On stream error: set block status -> ERROR, store error details

### Message Block State Machine
```
PENDING     -- stream starts -->  PROCESSING
PROCESSING  -- first chunk -->    STREAMING
STREAMING   -- stream ends -->    SUCCESS
STREAMING   -- error occurs -->   ERROR
PROCESSING  -- error occurs -->   ERROR
ERROR       -- user retries -->   PENDING (new block created)
```

### Topic Auto-Naming
- After first assistant response in a new topic: generate topic title
- Uses a short summarization prompt sent to the same model
- Title limited to 50 characters
- User can manually rename at any time

### Context Window Management
- `contextLength` setting controls how many previous message pairs to include
- Messages are taken from the end (most recent)
- System prompt always included (does not count toward context length)
- If total tokens would exceed model's context limit: truncate from oldest

### Multi-Window Message Sync
- Messages are stored in Dexie (IndexedDB), which is per-window
- StoreSyncService broadcasts topic updates across windows
- When window B receives a topic update notification: it reloads the topic from Dexie
- Active streaming is NOT synced in real-time across windows (only final state)

### Input Bar Tool Dispatch
- Input bar detects special prefixes: `@` (mention assistant/model), `/` (slash command), `#` (knowledge base)
- `@model_name` overrides the model for this single message
- `/command` triggers registered slash commands (clear, export, etc.)
- `#kb_name` activates knowledge base retrieval for this message

---

## F008-mcp: MCP Server Management

### Server Lifecycle
```
IDLE --> INITIALIZING --> READY
                      --> ERROR --> IDLE (on remove)
READY --> STOPPING --> IDLE
READY --> ERROR --> INITIALIZING (auto-retry, max 3 attempts)
```

### Tool Caching
- Tool list fetched on server READY and cached
- Cache TTL: 5 minutes
- Cache invalidated on server restart
- `Mcp_ListTools` returns cached list if valid, otherwise re-fetches

### OAuth Flow (HTTP Servers)
- SSE and streamableHttp servers may require OAuth
- Flow: redirect user to auth URL -> receive callback with token -> store token
- Token refresh handled automatically on 401 response
- Token stored in electron-store (encrypted)

### DXT Package Installation
- DXT (Desktop Extension) packages are zip files containing MCP server + manifest
- Installation: extract to app data directory, register as stdio MCP server
- Manifest defines: name, description, command, args, env requirements
- Uninstall: stop server, remove files, remove registration

### Tool Auto-Approval Whitelist
- User can configure tools that skip confirmation dialog
- Whitelist is per-server, stored in McpServerConfig
- Default: all tools require user confirmation
- "Trust all" option available per server (not recommended)

---

## F009-agents: Agent System

### Agent Config Inheritance
- When creating a new AgentSession: snapshot current Agent config into session
- Session config is independent after creation (Agent changes don't propagate)
- Session can override any Agent field
- Rationale: sessions are immutable records of what config was used

### Claude Code SDK Integration
- Agent sessions communicate with Claude Code SDK via the Express API
- Stream transformation: SDK output (text/tool_use/tool_result) mapped to Angdu message format
- SDK process lifecycle: spawned on session start, killed on session end or timeout

### Tool Permission Management
Four permission modes:
1. **default**: every tool call requires user approval
2. **acceptEdits**: file edit tools auto-approved, others require approval
3. **bypassPermissions**: all tools auto-approved (dangerous)
4. **plan**: agent creates plan first, user approves plan, then execution proceeds

### Stream Transformation
- Claude Code SDK outputs a custom stream format
- Transformer converts to standard SSE text/event-stream
- Maps SDK events to MessageBlock types:
  - `text` -> MainText
  - `tool_use` -> Tool (PENDING)
  - `tool_result` -> Tool (SUCCESS/ERROR)
  - `thinking` -> Thinking

---

## F010-knowledge: Knowledge Base Management

### Document Chunking Pipeline
1. Document uploaded (PDF, DOCX, TXT, MD, HTML, etc.)
2. Preprocessing: extract text content
   - PDF: native extraction or OCR via preprocessing provider
   - DOCX/PPTX: xml extraction
   - HTML: strip tags, preserve structure
3. Chunking: split text by configured chunk size with overlap
   - Default: 1000 chars per chunk, 200 chars overlap
   - Respects paragraph/sentence boundaries when possible
4. Each chunk gets metadata: source document, position, page number (if applicable)

### Embedding Generation
- Each chunk is embedded using the configured embedding model
- Batch processing: up to 100 chunks per API call (provider-dependent)
- Vectors stored in local vector store (in-app, not external DB)
- Dimensions must match model output (e.g., 1536 for text-embedding-3-small)

### Reranking Pipeline
- After initial vector similarity search returns top-K candidates
- Reranker re-scores candidates using a cross-encoder model
- Supported rerankers: Jina, Bailian, TEI, Voyage
- Reranking is optional (disabled by default)
- Result: reordered list with relevance scores

### Preprocessing Providers
- Doc2x: high-quality PDF extraction with layout analysis
- Mineru: open-source document extraction
- Custom API: user-configurable preprocessing endpoint
- Fallback: built-in extraction (lower quality but no external dependency)

### Similarity Threshold
- Results below threshold are filtered out (not returned)
- Default: 0.7 (configurable per knowledge base)
- Threshold applies after reranking (if enabled)

---

## F013-backup: Backup & Restore

### Backup Contents
- All Zustand persisted state (settings, providers, assistants, etc.)
- All Dexie data (topics, messages, message blocks, files metadata)
- All SQLite data (agents, sessions, agent messages)
- Uploaded files (from app data directory)
- Does NOT include: API keys (security), MCP server processes, cache data

### Backup Format
- Single compressed archive (zip/tar.gz)
- Contains: state.json, dexie-export.json, sqlite.db, files/
- Version field in archive for migration compatibility

### WebDAV Backup
- Uses webdav-client library
- Supports: NextCloud, ownCloud, any WebDAV-compatible server
- Upload: create archive locally, then upload to remote path
- Restore: download archive, then restore locally
- Conflict handling: overwrite remote file (no versioning)

### S3 Backup
- Uses AWS SDK v3 (compatible with S3, MinIO, Cloudflare R2, etc.)
- Upload: multipart upload for large archives
- Restore: download and extract
- Key format: `{prefix}/angdu-backup-{timestamp}.zip`
