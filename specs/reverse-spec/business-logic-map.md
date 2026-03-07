# Angdu Studio -- Business Logic Map

> Logic Index covering all 12 Features.
> For each feature: Core Rules (BR), Validation Logic (VL), Workflows (WF), and Cross-Feature Rules (XF).
> Source: `/Users/coolhero/Develop/cherry-studio`

---

## F001 -- App Core

### Core Rules (BR)

| ID | Rule | Detail |
|----|------|--------|
| BR-001-01 | Config persistence | All user settings persisted via `electron-store`; read on startup, written on change. |
| BR-001-02 | Platform-specific defaults | Default data path, tray behavior, and window chrome differ per OS (macOS / Windows / Linux). |
| BR-001-03 | Launch on boot | Controlled via `app.setLoginItemSettings({ openAtLogin })`. Stored in settings store, synced to OS on toggle. |
| BR-001-04 | Data path isolation | User data directory is configurable; defaults to `app.getPath('userData')`. Verified writable on startup. |
| BR-001-05 | Window state restoration | Window position, size, and maximized state are persisted and restored on next launch. |
| BR-001-06 | IPC bridge | All renderer-to-main communication goes through typed `ipcMain.handle` / `ipcRenderer.invoke` channels. 280+ IPC endpoints. |

### Workflow: App Initialization

```
Electron app.ready
  -> Check / create data path
  -> Initialize electron-store (config persistence)
  -> Initialize singleton services (47+ services)
  -> Register IPC handlers
  -> Restore window state (position, size, maximized)
  -> Create BrowserWindow
  -> Load renderer
  -> Emit 'app-ready' event
```

---

## F002 -- AI Provider

### Core Rules (BR)

| ID | Rule | Detail |
|----|------|--------|
| BR-002-01 | Model resolution | Models resolved via PluginEngine; provider ID + model ID mapped to SDK adapter. |
| BR-002-02 | Provider factory | Factory creates SDK instances per provider type. 15+ providers supported (OpenAI, Anthropic, Google, Ollama, etc.). |
| BR-002-03 | Streaming-first | All AI responses are streamed. Buffered/batch is the exception, never the default. |
| BR-002-04 | Unified adapter layer | All provider interactions go through the Vercel AI SDK adapter. No provider-specific code in UI. |
| BR-002-05 | Middleware pipeline | Layered middleware stack for request transformation: prompt assembly, context injection, token counting, tool binding. |
| BR-002-06 | Graceful degradation | On provider failure: surface actionable error, retry with backoff, allow fallback to alternative provider. |

### Validation Logic (VL)

| ID | Check | Behavior on Fail |
|----|-------|------------------|
| VL-002-01 | Model ID format | Reject request; surface "invalid model" error. |
| VL-002-02 | API key required per provider | Block request; prompt user to configure credentials. |
| VL-002-03 | Provider connectivity | Timeout after configured interval; surface connection error with retry option. |

### Workflow: AI Request Pipeline

```
User triggers completion
  -> Resolve model (provider ID + model ID)
  -> Plugin transform (PluginEngine middleware)
  -> Assemble prompt (system prompt + context + user input)
  -> Inject context (knowledge base, memory, conversation history)
  -> Token counting / context window check
  -> Tool binding (MCP tools if applicable)
  -> Provider execute (streaming SDK call)
  -> Stream response tokens to renderer
  -> Result transform (provider-specific -> unified format)
  -> Persist final response
```

---

## F003 -- Chat

### Core Rules (BR)

| ID | Rule | Detail |
|----|------|--------|
| BR-003-01 | Message block system | 12 block types: `UNKNOWN`, `MAIN_TEXT`, `THINKING`, `TRANSLATION`, `IMAGE`, `CODE`, `TOOL`, `FILE`, `ERROR`, `CITATION`, `VIDEO`, `COMPACT`. |
| BR-003-02 | Context window management | Default context count: 5 messages (`DEFAULT_CONTEXTCOUNT`). Max slider: 100 (`MAX_CONTEXT_COUNT`). Unlimited sentinel: 100,000. |
| BR-003-03 | Topic auto-naming | New conversations receive an auto-generated topic name after the first assistant response. |
| BR-003-04 | Message roles | Three roles: `user`, `assistant`, `system`. Each message belongs to a topic and an assistant. |
| BR-003-05 | Block composition | Each assistant message is composed of one or more blocks. Blocks are independently typed, statused, and persisted. |
| BR-003-06 | Context filtering | Empty messages and adjacent duplicates are stripped before context assembly. Messages taken from the end of history (`takeRight`). |

### Validation Logic (VL)

| ID | Check | Behavior on Fail |
|----|-------|------------------|
| VL-003-01 | Message role validation | Must be `user`, `assistant`, or `system`. Reject otherwise. |
| VL-003-02 | Block status transitions | Valid: `PENDING -> PROCESSING -> STREAMING -> SUCCESS`. Error branch: any state -> `ERROR`. Pause branch: `STREAMING -> PAUSED`. |
| VL-003-03 | Block type validation | Must be one of the 12 `MessageBlockType` enum values. |

### Assistant Message Status

| Status | Meaning |
|--------|---------|
| `PENDING` | Waiting to be processed |
| `PROCESSING` | Being processed, awaiting first token |
| `SEARCHING` | Performing web/knowledge search |
| `SUCCESS` | Completed successfully |
| `PAUSED` | Streaming paused by user |
| `ERROR` | Failed with error |

### Workflow: Chat Conversation Flow

```
User types input
  -> Create user message (role: user, topicId, assistantId)
  -> Create placeholder assistant message (status: PENDING)
  -> Prepare context:
       - Filter conversation history (contextCount messages)
       - Strip empty/duplicate messages
       - Inject knowledge base results (F007)
       - Inject memory items (F011)
       - Inject system prompt
  -> Dispatch AI call (F002 pipeline)
  -> Stream response:
       - Create blocks as content arrives (type detection)
       - Update block status: PENDING -> PROCESSING -> STREAMING
       - Append tokens to active block
  -> On stream complete:
       - Set all blocks to SUCCESS
       - Set assistant message status to SUCCESS
       - Persist to Dexie (IndexedDB)
  -> On error:
       - Set block status to ERROR
       - Set assistant message status to ERROR
       - Preserve user draft (never lose user input)
```

### Cross-Feature Rules (XF)

| ID | Rule | Interacts With |
|----|------|----------------|
| XF-003-01 | Knowledge context injection | F007-knowledge: RAG search results prepended to context. |
| XF-003-02 | Memory context injection | F011-memory: Relevant memory items injected into system prompt. |
| XF-003-03 | MCP tool blocks | F006-mcp: Tool call/result blocks created during streaming. |

---

## F004 -- Editor

### Core Rules (BR)

| ID | Rule | Detail |
|----|------|--------|
| BR-004-01 | TipTap extension activation | Rich text editor built on TipTap 3 with composable extensions for formatting, mentions, code blocks. |
| BR-004-02 | CodeMirror language detection | Code blocks use CodeMirror with automatic language detection from content or fenced block hints. |
| BR-004-03 | Mermaid rendering | Mermaid diagrams rendered with 300ms debounce (`useDebouncedRender` hook). SVG, Graphviz, and PlantUML also debounced at 300ms. |
| BR-004-04 | Image compression | Images compressed on paste/upload: max 1200px width/height, 0.8 JPEG quality, output format defaults to JPEG. |
| BR-004-05 | Preview system | Unified preview components for SVG, Graphviz, Mermaid, PlantUML -- all using shared `useDebouncedRender` hook. |

### Validation Logic (VL)

| ID | Check | Behavior on Fail |
|----|-------|------------------|
| VL-004-01 | Image compression threshold | Only compress if image exceeds max dimensions (`shouldCompressImage` guard). |
| VL-004-02 | Link URL validation | URLs validated before insertion into editor content. |
| VL-004-03 | File type for code blocks | Language hint validated against supported CodeMirror languages. |

---

## F005 -- Auth

### Core Rules (BR)

| ID | Rule | Detail |
|----|------|--------|
| BR-005-01 | PKCE OAuth flow | AngduIN (formerly CherryIN) uses PKCE-based OAuth with `code_verifier` / `code_challenge`. |
| BR-005-02 | Token refresh | Automatic token refresh on 401 responses. Refresh token read from persisted store. |
| BR-005-03 | Encrypted credential storage | API keys and tokens encrypted at rest. Environment variables prefixed `ANGDU_` redacted in logs. |
| BR-005-04 | OAuth flow expiry | Pending OAuth flows expire after 10 minutes; cleaned up automatically. |
| BR-005-05 | Copilot device code flow | GitHub Copilot uses device code flow with exponential backoff polling. |

### Validation Logic (VL)

| ID | Check | Behavior on Fail |
|----|-------|------------------|
| VL-005-01 | Token expiration check | Check before each authenticated request. If expired, trigger refresh flow. |
| VL-005-02 | PKCE code_verifier validation | Verifier must match challenge on token exchange. Server rejects on mismatch. |
| VL-005-03 | Refresh token presence | If no refresh token available, log warning and skip refresh attempt. |

### Workflow: AngduIN OAuth (PKCE)

```
User clicks "Sign in with AngduIN"
  -> Generate code_verifier + code_challenge (PKCE)
  -> Store flow state with timestamp
  -> Open browser to authorization URL (with code_challenge)
  -> User authenticates in browser
  -> Callback received with authorization code
  -> Exchange code + code_verifier for access_token + refresh_token
  -> Persist tokens (encrypted)
  -> Clean up flow state
```

### Workflow: Copilot Device Code Flow

```
User initiates Copilot auth
  -> Request device code from GitHub
  -> Display user_code to user
  -> Poll token endpoint (exponential backoff)
  -> On success: persist access token
  -> On timeout/denial: surface error
```

### Cross-Feature Rules (XF)

| ID | Rule | Interacts With |
|----|------|----------------|
| XF-005-01 | Authenticated API endpoints | All provider API calls requiring credentials validate auth state before dispatch. |
| XF-005-02 | Agent OAuth | F010-agent uses OAuth credentials for authenticated tool execution. |

---

## F006 -- MCP (Model Context Protocol)

### Core Rules (BR)

| ID | Rule | Detail |
|----|------|--------|
| BR-006-01 | Transport detection | Four transport types: `StdioClientTransport`, `SSEClientTransport`, `StreamableHTTPClientTransport`, `InMemoryTransport`. Selected based on server config. |
| BR-006-02 | Built-in servers | Ships with built-in MCP servers: filesystem, browser, fetch, brave-search, dify-knowledge, didi-mcp. |
| BR-006-03 | Server lifecycle | Servers initialized on demand, kept alive during session, cleaned up on disconnect. |
| BR-006-04 | Tool listing | After client initialization, tools are listed and cached for UI display. |
| BR-006-05 | Hub bridge | MCP Hub provides a bridge layer for discovering and connecting to community servers. |

### Validation Logic (VL)

| ID | Check | Behavior on Fail |
|----|-------|------------------|
| VL-006-01 | Tool input validation | Tool inputs validated against the tool's input schema before execution. |
| VL-006-02 | Server connectivity check | Health check on server connection; surface error if unreachable. |
| VL-006-03 | Transport type validation | Server config must specify a valid transport type. |

### Workflow: MCP Server Lifecycle

```
User enables MCP server (or auto-load on startup)
  -> Load server config (name, transport type, command/URL)
  -> Detect transport:
       - stdio: spawn child process via StdioClientTransport
       - SSE: connect via SSEClientTransport
       - HTTP: connect via StreamableHTTPClientTransport
       - in-memory: create linked pair via InMemoryTransport
  -> Initialize MCP Client
  -> List available tools (cache for UI)
  -> Subscribe to server notifications
  -> Ready for tool invocations
  -> On disconnect: clean up transport, remove from active servers
```

### Cross-Feature Rules (XF)

| ID | Rule | Interacts With |
|----|------|----------------|
| XF-006-01 | Tool results in chat | F003-chat: Tool call results rendered as `TOOL` type message blocks. |
| XF-006-02 | Agent tool execution | F010-agent: Agent sessions invoke MCP tools through permission gate. |

---

## F007 -- Knowledge Base

### Core Rules (BR)

| ID | Rule | Detail |
|----|------|--------|
| BR-007-01 | RAG pipeline | Configurable chunking, embedding, and retrieval. Documents ingested through load -> preprocess -> chunk -> embed -> store pipeline. |
| BR-007-02 | Embedding dimension compatibility | Embedding dimensions must match between the model used for indexing and the model used for search. Configurable per knowledge base. |
| BR-007-03 | Similarity threshold | Configurable per search; results below threshold are excluded. |
| BR-007-04 | Preprocessing strategies | 6 strategies: `Default`, `Mineru`, `Doc2X`, `Mistral`, `OpenMineru`, `PaddleOCR`. Selected via `PreprocessProviderFactory`. |
| BR-007-05 | Reranking strategies | 5 strategies: `Default`, `Jina`, `Voyage`, `TEI`, `Bailian`. Selected via `StrategyFactory`. |
| BR-007-06 | Embedding factory | `EmbeddingsFactory.create()` accepts an API client and optional dimensions; dispatches to OpenAI-compatible or Voyage embeddings. |

### Validation Logic (VL)

| ID | Check | Behavior on Fail |
|----|-------|------------------|
| VL-007-01 | File type validation | Supported types checked on upload. Unsupported types rejected with error message. |
| VL-007-02 | Embedding dimension match | Dimension mismatch between indexing and query models detected and surfaced as error. |
| VL-007-03 | Processing status transitions | Documents track processing state; failed processing can be retried. |

### Workflow: Knowledge Base Ingestion

```
User uploads document(s)
  -> Validate file type
  -> Queue for processing
  -> Load document (loaders: EPUB, OD, Drafts, Notes, default)
  -> Preprocess (strategy selection):
       - Default: basic text extraction
       - Mineru / OpenMineru: OCR-enhanced extraction
       - Doc2X: document structure preservation
       - Mistral: API-based extraction
       - PaddleOCR: Chinese-optimized OCR
  -> Chunk (configurable chunk size and overlap)
  -> Embed (via EmbeddingsFactory -> provider API)
  -> Store vectors (LibSQL with vector extension)
  -> Update document status to complete
```

### Workflow: Knowledge Search

```
User sends message with knowledge base enabled
  -> Embed user query (same model as indexing)
  -> Vector similarity search in LibSQL
  -> Apply similarity threshold filter
  -> Rerank results (strategy selection):
       - Default: basic relevance scoring
       - Jina / Voyage / TEI / Bailian: API-based reranking
  -> Return top-K results
  -> Inject into chat context (F003)
```

### Cross-Feature Rules (XF)

| ID | Rule | Interacts With |
|----|------|----------------|
| XF-007-01 | Chat context injection | F003-chat: Search results prepended to conversation context. |

---

## F008 -- File Management

### Core Rules (BR)

| ID | Rule | Detail |
|----|------|--------|
| BR-008-01 | File type detection | Automatic detection of binary vs text files. Encoding auto-detected for text files. |
| BR-008-02 | Reference counting | Files tracked by reference count; unreferenced files eligible for cleanup. |
| BR-008-03 | Image compression (server-side) | `FileStorage.compressImageBuffer()` handles server-side image compression for stored files. |
| BR-008-04 | Ignored patterns | Default ignore: dotfiles, `node_modules`, `.git`, `*.tmp`, `*.temp`, `.DS_Store`. |
| BR-008-05 | Backup destinations | Three destinations: Local filesystem, WebDAV (Nutstore integration), S3-compatible storage. |

### Validation Logic (VL)

| ID | Check | Behavior on Fail |
|----|-------|------------------|
| VL-008-01 | File path validation | Paths validated to prevent directory traversal and access outside allowed directories. |
| VL-008-02 | Write permission check | Verify write access before file operations; surface permission error if denied. |
| VL-008-03 | Backup integrity | Backup archives validated (checksum / structure) before restore. |

### Workflow: Backup

```
User initiates backup
  -> Archive user data (conversations, settings, knowledge bases)
  -> Compress archive
  -> Upload to destination:
       - Local: write to selected path
       - WebDAV: authenticate (Nutstore SSO) -> upload
       - S3: use cached connection -> upload
  -> Cleanup temporary files
  -> Confirm success
```

### Workflow: Restore

```
User initiates restore
  -> Download backup from source
  -> Validate archive integrity
  -> Extract archive
  -> Apply data (merge or replace)
  -> Restart application to reload state
```

---

## F009 -- Settings UI

### Core Rules (BR)

| ID | Rule | Detail |
|----|------|--------|
| BR-009-01 | Settings page mapping | Each settings page maps to a set of config keys in electron-store. |
| BR-009-02 | Provider configuration | API keys managed per provider with masked display. Test connection validates key. |
| BR-009-03 | Assistant defaults | Default assistant settings include `contextCount: 5` and model selection. |
| BR-009-04 | Theme and display | Theme, language, font size, and layout preferences stored in settings. |

### Cross-Feature Rules (XF)

| ID | Rule | Interacts With |
|----|------|----------------|
| XF-009-01 | Config read/write via IPC | F001-app-core: All settings reads/writes go through IPC to electron-store in main process. |
| XF-009-02 | Provider key management | F002-ai-provider: API keys configured here are consumed by the provider factory. |
| XF-009-03 | MCP server config | F006-mcp: MCP server list and transport config managed in settings. |

---

## F010 -- Agent

### Core Rules (BR)

| ID | Rule | Detail |
|----|------|--------|
| BR-010-01 | Tool permission system | Safe tools auto-approved: Read, Glob, Grep. Risky tools (Write, Edit, Bash) require explicit user approval. |
| BR-010-02 | Session inheritance | Agent sessions inherit configuration from agent template (system prompt, allowed tools, accessible paths). |
| BR-010-03 | Agent type | Currently supports `claude-code` agent type. |
| BR-010-04 | Accessible paths | Agents restricted to configured directory paths. Operations outside allowed paths are blocked. |
| BR-010-05 | CLI invocation | Agent execution invokes the Claude CLI subprocess with configured parameters. |

### Validation Logic (VL)

| ID | Check | Behavior on Fail |
|----|-------|------------------|
| VL-010-01 | Accessible paths validation | Requested file paths checked against allowed paths list. Reject if outside scope. |
| VL-010-02 | Agent type validation | Must be `claude-code`. Unknown types rejected. |
| VL-010-03 | Permission request timeout | User has 60 seconds to approve/deny a risky tool invocation. Timeout defaults to deny. |

### Workflow: Agent Execution

```
User sends prompt to agent
  -> Create agent session (inherit from template)
  -> Invoke CLI subprocess (claude-code)
  -> For each tool call:
       - Check tool name against safe list (Read/Glob/Grep)
       - If safe: auto-approve, execute via MCP (F006)
       - If risky: prompt user for permission (60s timeout)
         - Approved: execute via MCP
         - Denied/Timeout: skip tool, return denial to agent
  -> Stream response tokens to UI
  -> Save messages to agent session store
  -> On completion: finalize session
```

### Cross-Feature Rules (XF)

| ID | Rule | Interacts With |
|----|------|----------------|
| XF-010-01 | MCP tool execution | F006-mcp: All tool invocations route through MCP server infrastructure. |
| XF-010-02 | OAuth credentials | F005-auth: Agent uses stored OAuth credentials for authenticated operations. |

---

## F011 -- Memory

### Core Rules (BR)

| ID | Rule | Detail |
|----|------|--------|
| BR-011-01 | Vector memory storage | Memory items stored as vectors in LibSQL with vector extension. |
| BR-011-02 | Embedding dimensions | Configurable per memory config (`embeddingDimensions`). Voyage code-2 defaults to 1536-dim. |
| BR-011-03 | Similarity threshold | `SIMILARITY_THRESHOLD = 0.85`. New memories with similarity >= 0.85 to existing entries are skipped (deduplication). |
| BR-011-04 | Deduplication | Before storing a new memory, vector search checks for near-duplicates above the similarity threshold. |

### Validation Logic (VL)

| ID | Check | Behavior on Fail |
|----|-------|------------------|
| VL-011-01 | Embedding dimension compatibility | Dimensions must match between memory config and embedding model. Mismatch produces error. |
| VL-011-02 | Duplicate detection | Similarity >= 0.85 triggers skip with debug log. |

### Workflow: Memory Add

```
Extract memory content from conversation
  -> Generate embedding vector (via configured embedding model)
  -> Vector search for existing similar memories
  -> If highest similarity >= 0.85:
       - Skip addition (log: "high similarity, skipping")
  -> Else:
       - Store vector + content in LibSQL
```

### Workflow: Memory Search

```
User sends message (memory enabled)
  -> Embed user query
  -> Vector similarity search in LibSQL memory store
  -> Return matching memories above threshold
  -> Inject into chat context (F003)
```

### Cross-Feature Rules (XF)

| ID | Rule | Interacts With |
|----|------|----------------|
| XF-011-01 | Chat context injection | F003-chat: Relevant memory items injected into system prompt / context. |

---

## F012 -- Extensions

### Core Rules (BR)

| ID | Rule | Detail |
|----|------|--------|
| BR-012-01 | Mini app sandboxing | Mini applications (mini programs) run in isolated windows with controlled API access. |
| BR-012-02 | Selection assistant | Trigger modes for text selection assistant: toolbar popup on selection, configurable actions. |
| BR-012-03 | LAN transfer | Binary protocol for local network file transfer between devices. |
| BR-012-04 | OpenClaw gateway | Gateway management for OpenClaw community model routing. Node.js version checked for compatibility. |
| BR-012-05 | Notes system | Tree-structured notes with full-text search (300ms debounced, max 100 results default). |

### Validation Logic (VL)

| ID | Check | Behavior on Fail |
|----|-------|------------------|
| VL-012-01 | Notes directory validation | Notes directory must exist and be writable. |
| VL-012-02 | OpenClaw Node.js version check | Required Node.js version verified before gateway start. Incompatible version blocks launch. |
| VL-012-03 | LAN peer validation | Handshake protocol validates peer identity before file transfer begins. |

### Workflow: LAN Transfer

```
User initiates LAN transfer
  -> Scan local network for peers
  -> Connect to selected peer
  -> Handshake (validate identity, negotiate protocol)
  -> Stream file data (binary protocol)
  -> Verify transfer integrity
  -> Confirm completion
```

### Workflow: Notes Tree Management

```
User creates/edits note
  -> Validate notes directory
  -> Create/update note file in tree structure
  -> Index content for full-text search
  -> Sync tree state to UI
```

---

## Cross-Feature Dependency Matrix

| Source Feature | Target Feature | Interaction |
|----------------|----------------|-------------|
| F003-chat | F002-ai-provider | Chat dispatches AI requests through provider pipeline |
| F003-chat | F007-knowledge | Knowledge search results injected into chat context |
| F003-chat | F011-memory | Memory items injected into chat context |
| F003-chat | F006-mcp | Tool call/result blocks rendered in chat |
| F006-mcp | F010-agent | Agent tool execution routed through MCP infrastructure |
| F005-auth | F002-ai-provider | Credentials required for provider API calls |
| F005-auth | F010-agent | OAuth tokens used for agent authenticated operations |
| F009-settings | F001-app-core | Settings UI reads/writes config via IPC bridge |
| F009-settings | F002-ai-provider | API keys configured in settings consumed by providers |
| F009-settings | F006-mcp | MCP server configuration managed in settings |
| F010-agent | F006-mcp | Agent tool calls execute through MCP servers |
| F007-knowledge | F003-chat | RAG results feed into chat context assembly |
| F011-memory | F003-chat | Memory search results feed into chat context assembly |

---

## Key Constants Reference

| Constant | Value | Location | Feature |
|----------|-------|----------|---------|
| `DEFAULT_CONTEXTCOUNT` | `5` | `renderer/config/constant.ts` | F003 |
| `MAX_CONTEXT_COUNT` | `100` | `renderer/config/constant.ts` | F003 |
| `UNLIMITED_CONTEXT_COUNT` | `100000` | `renderer/config/constant.ts` | F003 |
| `SIMILARITY_THRESHOLD` | `0.85` | `main/services/memory/MemoryService.ts` | F011 |
| Image `maxWidth` | `1200` px | `renderer/components/RichEditor/helpers/imageUtils.ts` | F004 |
| Image `quality` | `0.8` | `renderer/components/RichEditor/helpers/imageUtils.ts` | F004 |
| Debounce delay (preview) | `300` ms | `renderer/components/Preview/hooks/useDebouncedRender.ts` | F004 |
| OAuth flow expiry | `10` min | `main/services/CherryINOAuthService.ts` | F005 |
| Permission timeout | `60` s | Agent tool permission gate | F010 |
