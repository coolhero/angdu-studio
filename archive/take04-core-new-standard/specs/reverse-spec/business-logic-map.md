# Business Logic Map: Cherry Studio

**Source**: /Users/coolhero/Study/oss/cherry-studio
**Generated**: 2026-03-04
**Total Rules**: 105

---

## Logic Index

| Feature | Core Rules | Validations | Workflows | Cross-Feature Rules |
|---------|-----------|-------------|-----------|-------------------|
| F001-core-platform | 31 | 12 | 6 | 5 |
| F002-provider-management | 4 | 2 | 1 | 2 |
| F004-knowledge-base | 13 | 5 | 3 | 3 |
| F006-mcp-integration | 17 | 5 | 4 | 3 |
| F007-backup-sync | 10 | 3 | 2 | 2 |
| F011-memory-system | 13 | 4 | 3 | 3 |
| Cross-cutting | 8 | 2 | 0 | 8 |
| **Total** | **96** | **33** | **19** | **26** |

> Note: Some rules appear in multiple categories (Core + Validation, Core + Workflow, etc.). The Logic Index counts each rule once under its primary category. Cross-Feature Rules are rules that span multiple feature boundaries.

---

## F001-core-platform

### Core Rules

| Rule ID | Rule Name | Description | Source File(s) |
|---------|-----------|-------------|----------------|
| BR-051 | ConfigManager observer pattern | `setAndNotify` dispatches observers for Language, Tray, ZoomFactor, Shortcuts, EnableQuickAssistant, SelectionAssistant keys. Listeners react to config changes in real time. | `src/main/services/ConfigManager.ts` |
| BR-052 | Default config values | Language=system locale, Theme=system, LaunchToTray=false, Tray=true, TrayOnClose=true, ZoomFactor=1. Applied on first launch or missing keys. | `src/main/services/ConfigManager.ts` |
| BR-053 | Language fallback | If system locale is not in the supported language list, fallback to `defaultLanguage` constant. | `src/main/services/ConfigManager.ts`, `src/renderer/i18n.ts` |
| BR-054 | ClientId auto-generation | UUID v4 generated on first access if the `clientId` config key is missing. Persisted immediately. | `src/main/services/ConfigManager.ts` |
| BR-055 | Shortcuts filtering | Only shortcuts with `system: true` are persisted to config storage. User-defined shortcuts stored separately. | `src/main/services/ConfigManager.ts`, `src/main/services/ShortcutService.ts` |
| BR-056 | Theme validation | If stored theme value is not in the valid set (`light`, `dark`, `system`), reset to `"system"`. | `src/main/services/ThemeService.ts` |
| BR-057 | Theme no-op | Setting the same theme that is already active returns immediately without broadcast. | `src/main/services/ThemeService.ts` |
| BR-058 | Theme broadcast | When `nativeTheme` is updated, sends `ThemeUpdated` IPC event and updates title bar overlay color on all windows. | `src/main/services/ThemeService.ts` |
| BR-059 | File duplicate detection | Checks by file size first, then MD5 hash. If duplicate found, returns existing `FileMetadata` with `count: 2` instead of creating new entry. | `src/main/services/FileService.ts` |
| BR-060 | Image compression threshold | Images exceeding 1MB are compressed (quality reduction) before writing to storage. | `src/main/services/FileService.ts` |
| BR-061 | Document format routing | `.doc` files use WordExtractor; `.docx`, `.pptx`, `.xlsx` use officeParser; all other formats use raw text read with encoding detection (chardet). | `src/main/services/FileService.ts` |
| BR-062 | 2GB content read limit | Files larger than 2GB return metadata only; content is not loaded into memory. | `src/main/services/FileService.ts` |
| BR-063 | File rename conflict guard | `rename()` throws an error if the target filename already exists in the same directory. | `src/main/services/FileService.ts` |
| BR-064 | File type detection | Uses file extension first. If extension yields `OTHER`, falls back to `isBinaryFile()` check. Non-binary `OTHER` files are upgraded to `TEXT` type. | `src/main/services/FileService.ts` |
| BR-065 | MIME type normalization | Non-standard MIME aliases are normalized (e.g., `JPG` maps to `image/jpeg`). | `src/main/services/FileService.ts` |
| BR-066 | File watcher defaults | Watches `.md` and `.txt` extensions by default. Debounce interval: 1000ms, stability threshold: 500ms, maximum directory depth: 10. | `src/main/services/FileWatcherService.ts` |
| BR-067 | Directory listing exclusions | Excluded directories: `node_modules`, `.git`, `.idea`, `.vscode`, `dist`, `build`, `.next`, `.nuxt`, `coverage`, `.cache`. Maximum 20 entries returned per listing. | `src/main/services/FileService.ts` |
| BR-068 | Base64 image default extension | Base64-encoded image data is always saved with `.png` extension regardless of original format. | `src/main/services/FileService.ts` |
| BR-069 | Crash recovery | If the app crashes and more than 60 seconds have elapsed since last crash, the window reloads. If less than 60 seconds since last crash, the app exits to prevent crash loops. | `src/main/window/MainWindow.ts` |
| BR-070 | Window close behavior matrix | `app.isQuitting` = true: quit. Tray disabled or `trayOnClose` false: Windows/Linux quit, Mac hide. Tray enabled + `trayOnClose`: hide to tray. Mac also hides dock icon. | `src/main/window/MainWindow.ts` |
| BR-071 | Zoom factor persistence workaround | Zoom factor is re-applied on `will-resize`, `restore`, and `did-navigate-in-page` events to work around an Electron bug that resets zoom. | `src/main/window/MainWindow.ts` |
| BR-072 | Platform-specific window frame | Mac: hidden title bar with traffic light buttons at `(8, 13)`. Linux: optional system title bar. Windows: frameless with custom title bar. | `src/main/window/MainWindow.ts` |
| BR-073 | Mini window constraints | Minimum size 350x380, maximum size 1024x768. Always-on-top enabled. Visible on all workspaces (virtual desktops). | `src/main/window/MiniWindow.ts` |
| BR-074 | Mini window show logic | When showing, checks if the mini window's current display differs from the cursor's display. If different, repositions to center of cursor's display. | `src/main/window/MiniWindow.ts` |
| BR-075 | Mini window hide (platform-specific) | Windows: minimize + set opacity to 0. Mac: hide window + hide app. Linux: hide window. | `src/main/window/MiniWindow.ts` |
| BR-076 | OAuth URL allowlist | URLs from SiliconFlow, AiHubMix, 302.ai, aiionly.com are allowed to open in child/popup browser windows for OAuth flows. | `src/main/window/MainWindow.ts` |
| BR-077 | Security header removal | Strips `X-Frame-Options` and `Content-Security-Policy` headers from all HTTP responses to allow iframe embedding. | `src/main/window/MainWindow.ts` |
| BR-078 | Linux window activation workaround | On Linux, window activation requires hide-then-show via `setImmediate` to reliably bring window to front. | `src/main/window/MainWindow.ts` |
| BR-079 | Launch to tray | When `LaunchToTray` is enabled, the main window is created but not shown. Maximization state is deferred until first show. | `src/main/window/MainWindow.ts` |
| BR-080 | Fullscreen toggle protection | `toggleMainWindow()` is a no-op when the window is in fullscreen mode. | `src/main/window/MainWindow.ts` |
| BR-081 | Background throttling disabled | `backgroundThrottling` is set to false on both main and mini windows to ensure continuous processing. | `src/main/window/MainWindow.ts`, `src/main/window/MiniWindow.ts` |

### Validation Logic

| Rule ID | Validation | Error Behavior | Source File(s) |
|---------|-----------|----------------|----------------|
| BR-056 | Theme value must be one of `light`, `dark`, `system` | Invalid values silently reset to `"system"` | `src/main/services/ThemeService.ts` |
| BR-062 | File size must be <= 2GB for content read | Returns metadata-only response; no error thrown | `src/main/services/FileService.ts` |
| BR-063 | Target filename must not exist for rename | Throws error if target exists | `src/main/services/FileService.ts` |
| BR-052 | Config keys must have valid defaults | Missing keys filled with defaults on access | `src/main/services/ConfigManager.ts` |
| BR-053 | System locale must be in supported list | Falls back to `defaultLanguage` | `src/main/services/ConfigManager.ts` |
| BR-066 | File watcher extensions must match configured list | Non-matching extensions ignored | `src/main/services/FileWatcherService.ts` |
| BR-067 | Directory listing capped at 20 entries | Excess entries silently truncated | `src/main/services/FileService.ts` |
| BR-069 | Crash interval must be > 60s for recovery | < 60s triggers app exit | `src/main/window/MainWindow.ts` |
| BR-073 | Mini window dimensions within 350x380 min, 1024x768 max | Enforced by Electron window constraints | `src/main/window/MiniWindow.ts` |
| BR-085 | Assistant ID must be 36-char UUID | Non-conforming IDs regenerated during migration | `src/main/services/MigrationService.ts` |
| BR-055 | Only `system: true` shortcuts persisted | Non-system shortcuts filtered out | `src/main/services/ShortcutService.ts` |
| BR-060 | Image must be > 1MB for compression | Images <= 1MB stored as-is | `src/main/services/FileService.ts` |

### Workflows

| Rule ID | Workflow | Steps | Source File(s) |
|---------|----------|-------|----------------|
| BR-058 | Theme change broadcast | 1. Validate new theme value (BR-056) 2. Check no-op (BR-057) 3. Update `nativeTheme.themeSource` 4. Send `ThemeUpdated` IPC to all windows 5. Update title bar overlay colors | `src/main/services/ThemeService.ts` |
| BR-059 | File upload with dedup | 1. Compute file size 2. Find files with matching size 3. Compute MD5 hash 4. Compare hashes 5. If duplicate: return existing metadata with `count: 2` 6. If unique: check compression threshold (BR-060) 7. Write to storage 8. Return new metadata | `src/main/services/FileService.ts` |
| BR-061 | Document content extraction | 1. Detect file extension 2. Route to appropriate extractor (Word/Office/Text) 3. For text files: detect encoding with chardet 4. Read content with detected encoding 5. Check 2GB limit (BR-062) 6. Return extracted text | `src/main/services/FileService.ts` |
| BR-070 | Window close decision | 1. Check `app.isQuitting` flag 2. If quitting: allow close 3. Check tray enabled + `trayOnClose` config 4. Platform branch: Windows/Linux quit vs Mac hide 5. If tray + trayOnClose: hide to tray 6. On Mac: also hide dock icon | `src/main/window/MainWindow.ts` |
| BR-082 | State migration pipeline | 1. Read current state version 2. Execute migrations v2 through v199 sequentially 3. Each migration wrapped in try-catch (failures logged, not fatal) 4. Update version number after each successful migration 5. Persist migrated state | `src/main/services/MigrationService.ts` |
| BR-069 | Crash recovery flow | 1. `render-process-gone` event fires 2. Record crash timestamp 3. Compare with previous crash timestamp 4. If delta > 60s: reload window 5. If delta <= 60s: exit app | `src/main/window/MainWindow.ts` |

### Cross-Feature Rules

| Rule ID | Features Involved | Description | Source File(s) |
|---------|------------------|-------------|----------------|
| BR-051 | F001, F008 | Config observer pattern notifies settings UI of changes to Language, Tray, ZoomFactor, Shortcuts | `src/main/services/ConfigManager.ts` |
| BR-058 | F001, F005, F008 | Theme broadcast reaches all windows including chat and settings | `src/main/services/ThemeService.ts` |
| BR-076 | F001, F002 | OAuth URL allowlist enables provider OAuth flows in child windows | `src/main/window/MainWindow.ts` |
| BR-082 | F001, F002, F004, F005, F006, F011 | State migrations touch entities across all features (providers, assistants, KB refs, MCP servers) | `src/main/services/MigrationService.ts` |
| BR-071 | F001, F008 | Zoom factor persistence workaround affects all windows; configured via settings | `src/main/window/MainWindow.ts` |

### State Migration Rules

| Rule ID | Rule Name | Description | Source File(s) |
|---------|-----------|-------------|----------------|
| BR-082 | Versioned migrations | 187 versioned migrations (v2 through v199), each individually try-catch wrapped. Failures are logged but do not halt the migration pipeline. | `src/main/services/MigrationService.ts` |
| BR-083 | Provider addition idempotent | Provider is only added during migration if its ID does not already exist in the provider list. | `src/main/services/MigrationService.ts` |
| BR-084 | Provider type assignment (v41) | During migration: `gemini` provider set to type `"gemini"`, `anthropic` to type `"anthropic"`, all others default to `"openai"`. | `src/main/services/MigrationService.ts` |
| BR-085 | Assistant ID normalization (v33) | 36-character UUID strings are kept as-is. All other ID formats are regenerated as new UUID v4 values. | `src/main/services/MigrationService.ts` |
| BR-086 | Emoji extraction from names (v73) | Leading emoji characters in assistant/topic names are extracted into a separate `emoji` field. | `src/main/services/MigrationService.ts` |
| BR-087 | MiniApp logo removal | Base64 data URIs in MiniApp logo fields are stripped to reduce serialized state size. | `src/main/services/MigrationService.ts` |
| BR-088 | Proxy mode migration (v42-43) | Proxy mode value `"none"` is migrated to `"system"` for consistency. | `src/main/services/MigrationService.ts` |
| BR-089 | Default settings injection | Default values injected for missing settings: `fontSize: 14`, `messageFont: 'system'`, and others. | `src/main/services/MigrationService.ts` |
| BR-090 | Shortcut insertion strategy | Shortcuts are inserted using positional strategy: `first`, `last`, or `after-key`. Deduplication by key prevents duplicates. | `src/main/services/MigrationService.ts` |

---

## F002-provider-management

### Core Rules

| Rule ID | Rule Name | Description | Source File(s) |
|---------|-----------|-------------|----------------|
| BR-091 | URL normalization | Trailing slash is removed from provider API base URLs before storage and comparison. | `src/renderer/services/ProviderService.ts` |
| BR-092 | CherryAI provider injection | The CherryAI built-in provider is always appended to the enabled providers list, regardless of user configuration. | `src/renderer/services/ProviderService.ts` |
| BR-093 | System vs user provider separation | System providers (63 built-in) are stored separately from user-created providers. System providers cannot be deleted, only disabled. | `src/renderer/services/ProviderService.ts`, `src/shared/config/providers.ts` |
| BR-094 | Fallback default provider | When a referenced provider ID is not found in the provider list, the system falls back to a default provider to prevent errors. | `src/renderer/services/ProviderService.ts` |

### Validation Logic

| Rule ID | Validation | Error Behavior | Source File(s) |
|---------|-----------|----------------|----------------|
| BR-091 | Provider URL must not end with trailing slash | Trailing slash silently stripped | `src/renderer/services/ProviderService.ts` |
| BR-094 | Provider ID must resolve to existing provider | Falls back to default provider; no error thrown | `src/renderer/services/ProviderService.ts` |

### Workflows

| Rule ID | Workflow | Steps | Source File(s) |
|---------|----------|-------|----------------|
| BR-092 | Provider list assembly | 1. Load system providers from built-in config 2. Load user providers from persisted state 3. Merge lists (user overrides for matching IDs) 4. Append CherryAI provider to enabled list 5. Return combined provider list | `src/renderer/services/ProviderService.ts` |

### Cross-Feature Rules

| Rule ID | Features Involved | Description | Source File(s) |
|---------|------------------|-------------|----------------|
| BR-093 | F002, F008 | Settings UI must differentiate system vs user providers (delete disabled for system) | `src/renderer/services/ProviderService.ts` |
| BR-094 | F002, F003, F005 | Fallback default provider ensures AI chat and engine never receive null provider | `src/renderer/services/ProviderService.ts` |

---

## F004-knowledge-base

### Core Rules

| Rule ID | Rule Name | Description | Source File(s) |
|---------|-----------|-------------|----------------|
| BR-001 | Max workload 80MB | Total combined workload of all queued items must not exceed 80MB. New items are rejected if adding them would exceed this limit. | `src/main/services/KnowledgeService.ts` |
| BR-002 | Max 30 concurrent items | No more than 30 items can be in PROCESSING state simultaneously. Excess items remain in PENDING queue. | `src/main/services/KnowledgeService.ts` |
| BR-003 | Item type routing | Processing logic branches by item type: `file`, `directory`, `url`, `sitemap`, `note`. Each type has a dedicated processing handler. | `src/main/services/KnowledgeService.ts` |
| BR-004 | Workload estimation | file = actual file size in bytes; URL = 2MB flat estimate; sitemap = 20MB flat estimate; note = `Buffer.byteLength(content)`. | `src/main/services/KnowledgeService.ts` |
| BR-005 | PDF-only preprocessing | Only PDF files undergo OCR/text-extraction preprocessing before embedding. All other formats go directly to chunking. | `src/main/services/KnowledgeService.ts` |
| BR-006 | Preprocessing cache | Preprocessed PDF content is cached by file hash. Subsequent processing of the same file skips preprocessing. | `src/main/services/KnowledgeService.ts` |
| BR-007 | Deferred deletion with pending file | When a knowledge item is marked for deletion while still processing, a `.pending` marker file is created. Actual deletion occurs when processing completes. | `src/main/services/KnowledgeService.ts` |
| BR-008 | Default 30 search results | Vector similarity search returns a maximum of 30 results by default unless a different limit is specified. | `src/main/services/KnowledgeService.ts` |
| BR-009 | Rerank guard on empty results | Reranking step is skipped entirely if the initial vector search returns zero results. | `src/main/services/KnowledgeService.ts` |
| BR-010 | DB path sanitization | Knowledge base database file paths are sanitized to prevent directory traversal and invalid characters. | `src/main/services/KnowledgeService.ts` |
| BR-095 | Refresh blocked if pending/processing | A knowledge base refresh request is rejected if any items are currently in PENDING or PROCESSING state. | `src/main/services/KnowledgeService.ts` |
| BR-096 | Item refresh sequence | Refresh performs: 1. Remove existing loader/embeddings 2. Reset item status to PENDING 3. Re-queue item for processing. | `src/main/services/KnowledgeService.ts` |
| BR-103 | Queue-based processing | Items transition through states: PENDING -> PROCESSING -> DONE. Queue manager enforces concurrency (BR-002) and workload (BR-001) limits. | `src/main/services/KnowledgeService.ts` |

### Validation Logic

| Rule ID | Validation | Error Behavior | Source File(s) |
|---------|-----------|----------------|----------------|
| BR-001 | Total queued workload must be <= 80MB | New items rejected with workload exceeded error | `src/main/services/KnowledgeService.ts` |
| BR-002 | Concurrent processing items must be <= 30 | Excess items queued in PENDING state | `src/main/services/KnowledgeService.ts` |
| BR-010 | DB path must not contain traversal sequences | Path sanitized; invalid characters removed | `src/main/services/KnowledgeService.ts` |
| BR-095 | No items in PENDING/PROCESSING state for refresh | Refresh request rejected with error | `src/main/services/KnowledgeService.ts` |
| BR-009 | Search results must be non-empty for rerank | Rerank step skipped; empty array returned | `src/main/services/KnowledgeService.ts` |

### Workflows

| Rule ID | Workflow | Steps | Source File(s) |
|---------|----------|-------|----------------|
| BR-103 | Knowledge item processing pipeline | 1. Item enters PENDING state 2. Queue manager checks workload (BR-001) and concurrency (BR-002) 3. Route by item type (BR-003) 4. Estimate workload (BR-004) 5. For PDF: preprocess with cache check (BR-005, BR-006) 6. Chunk content 7. Generate embeddings 8. Store vectors in DB 9. Transition to DONE state | `src/main/services/KnowledgeService.ts` |
| BR-096 | Knowledge item refresh | 1. Check no items pending/processing (BR-095) 2. Remove existing embeddings/loader data 3. Reset status to PENDING 4. Re-queue for processing (re-enters BR-103 pipeline) | `src/main/services/KnowledgeService.ts` |
| BR-007 | Deferred deletion | 1. Mark item for deletion 2. If item is PROCESSING: create `.pending` marker file 3. Wait for processing completion 4. Delete embeddings from vector DB 5. Delete stored files (BR-099) 6. Remove `.pending` marker 7. Remove item record | `src/main/services/KnowledgeService.ts` |

### Cross-Feature Rules

| Rule ID | Features Involved | Description | Source File(s) |
|---------|------------------|-------------|----------------|
| BR-097 | F004, F005, F012 | Cascade delete: removing a knowledge base also removes KB references from all assistants and agent presets | `src/main/services/KnowledgeService.ts` |
| BR-098 | F004, F001 | Migration creates a timestamped copy of the knowledge DB before schema changes | `src/main/services/KnowledgeService.ts` |
| BR-099 | F004, F001 | File cleanup on item removal: file items delete the stored file; video items delete both SRT and video files from file storage | `src/main/services/KnowledgeService.ts` |

---

## F006-mcp-integration

### Core Rules

| Rule ID | Rule Name | Description | Source File(s) |
|---------|-----------|-------------|----------------|
| BR-011 | Client health check | Ping MCP server with 1000ms timeout. If no response within 1 second, client is considered unhealthy and connection is restarted. | `src/main/services/MCPService.ts` |
| BR-012 | Pending client dedup | If a connection attempt is already in progress for a server ID, subsequent connection requests for the same ID are deduplicated (return existing promise). | `src/main/services/MCPService.ts` |
| BR-013 | Transport selection | 5 conditions determine transport: 1. In-memory for built-in servers 2. SSE if URL contains `/sse` 3. Streamable HTTP if URL is HTTP(S) 4. stdio for command-based 5. Default to stdio | `src/main/services/MCPService.ts` |
| BR-014 | npx fallback to bun | If `npx` command is not found on the system PATH, automatically fallback to `bun` as the package runner. | `src/main/services/MCPService.ts` |
| BR-015 | uvx/uv fallback | If `uvx` is not found, attempt `uv` with adjusted arguments. Provides Python tool runner compatibility. | `src/main/services/MCPService.ts` |
| BR-016 | Bun proxy removal | When using `bun` as the transport runner, HTTP proxy environment variables (`HTTP_PROXY`, `HTTPS_PROXY`, etc.) are removed to prevent connection issues. | `src/main/services/MCPService.ts` |
| BR-017 | NPM registry override | If a custom NPM registry is configured, it is injected into the environment for `npx`/`npm` commands used by MCP servers. | `src/main/services/MCPService.ts` |
| BR-018 | OAuth authentication flow | OAuth flow has a 5-minute timeout. If the user does not complete authorization within 5 minutes, the flow is cancelled and an error is returned. | `src/main/services/MCPService.ts` |
| BR-019 | Tool call timeout | Default tool call timeout is 60 seconds. Long-running tools (explicitly marked) get a 10-minute timeout. Timeout exceeded triggers cancellation. | `src/main/services/MCPService.ts` |
| BR-020 | Cache TTLs | Tools list: 5 minutes. Prompts list: 60 minutes. Get prompt: 30 minutes. Resources list: 60 minutes. Get resource: 30 minutes. | `src/main/services/MCPService.ts` |
| BR-021 | Disabled tools filtering | Tools marked as disabled in server configuration are filtered out of the tool list returned to consumers. | `src/main/services/MCPService.ts` |
| BR-022 | Tool ID format | Tool IDs are formatted as `{serverId}__{toolName}` (double underscore separator) to ensure global uniqueness across servers. | `src/main/services/MCPService.ts` |
| BR-023 | Sensitive field redaction | Fields named `authorization`, `apiKey`, `token`, `secret`, `password`, `credential` (case-insensitive) are redacted from server logs and debug output. | `src/main/services/MCPService.ts` |
| BR-024 | Server log buffer | Each MCP server maintains a circular log buffer of 200 entries. Oldest entries are evicted when the buffer is full. | `src/main/services/MCPService.ts` |
| BR-025 | Tool input/output schema validation | Tool call inputs and outputs are validated against their Zod schemas. Invalid inputs are rejected before sending; invalid outputs trigger warnings. | `src/main/services/MCPService.ts` |
| BR-026 | DXT server cleanup on removal | When a DXT (Desktop Extension) server is removed, its installed files and configuration are cleaned up from the file system. | `src/main/services/MCPService.ts` |
| BR-027 | Cache invalidation on notifications | When the MCP server sends `tools/list_changed`, `prompts/list_changed`, or `resources/list_changed` notifications, the corresponding cache is immediately invalidated. | `src/main/services/MCPService.ts` |

### Validation Logic

| Rule ID | Validation | Error Behavior | Source File(s) |
|---------|-----------|----------------|----------------|
| BR-011 | Health check response within 1000ms | Client marked unhealthy; reconnection attempted | `src/main/services/MCPService.ts` |
| BR-018 | OAuth flow must complete within 5 minutes | Flow cancelled; error returned to caller | `src/main/services/MCPService.ts` |
| BR-019 | Tool call must complete within timeout (60s/10min) | Call cancelled; timeout error returned | `src/main/services/MCPService.ts` |
| BR-025 | Tool inputs must match Zod schema | Invalid inputs rejected before sending | `src/main/services/MCPService.ts` |
| BR-022 | Tool ID must follow `serverId__toolName` format | Malformed IDs rejected during registration | `src/main/services/MCPService.ts` |

### Workflows

| Rule ID | Workflow | Steps | Source File(s) |
|---------|----------|-------|----------------|
| BR-013 | MCP server connection | 1. Check pending connections for dedup (BR-012) 2. Determine transport type (5 conditions) 3. Apply npx/uvx fallbacks if needed (BR-014, BR-015) 4. Remove bun proxy vars if applicable (BR-016) 5. Inject NPM registry override (BR-017) 6. Establish connection 7. Run health check (BR-011) 8. Cache initial tool/prompt/resource lists (BR-020) | `src/main/services/MCPService.ts` |
| BR-018 | OAuth authentication | 1. Open browser window for OAuth provider 2. Start 5-minute timeout 3. Listen for callback URL 4. Extract authorization code from callback 5. Exchange code for token 6. Store token securely 7. Return success or timeout error | `src/main/services/MCPService.ts` |
| BR-019 | Tool call execution | 1. Resolve tool by composite ID (BR-022) 2. Validate input against schema (BR-025) 3. Send call to MCP server 4. Start timeout timer (60s or 10min) 5. Await response or timeout 6. Validate output schema 7. Log call (with sensitive field redaction, BR-023) 8. Return result | `src/main/services/MCPService.ts` |
| BR-027 | Cache invalidation on notification | 1. Receive `list_changed` notification from server 2. Identify affected cache (tools/prompts/resources) 3. Invalidate specific cache entries 4. Next access triggers fresh fetch from server | `src/main/services/MCPService.ts` |

### Cross-Feature Rules

| Rule ID | Features Involved | Description | Source File(s) |
|---------|------------------|-------------|----------------|
| BR-022 | F006, F005, F012 | Tool ID format (`serverId__toolName`) must be parsed by chat message rendering and agent framework | `src/main/services/MCPService.ts` |
| BR-021 | F006, F005 | Disabled tools filtering affects the tool list available in chat assistant configuration | `src/main/services/MCPService.ts` |
| BR-026 | F006, F001 | DXT cleanup removes files from F001 file storage when an MCP server is uninstalled | `src/main/services/MCPService.ts` |

---

## F007-backup-sync

### Core Rules

| Rule ID | Rule Name | Description | Source File(s) |
|---------|-----------|-------------|----------------|
| BR-041 | ZIP64 + compression level 1 | Backup archives use ZIP64 format (for files > 4GB) with compression level 1 (fastest) to minimize backup time. | `src/main/services/BackupService.ts` |
| BR-042 | Skip file backup option | When file backup is skipped, the Data directory is still created in the archive (empty) to maintain expected structure on restore. | `src/main/services/BackupService.ts` |
| BR-043 | Default filenames | WebDAV backend: `cherry-studio.backup.zip`. S3 backend: `{hostname}_{timestamp}.zip`. Local: user-chosen filename. | `src/main/services/BackupService.ts` |
| BR-044 | Restore 5-step pipeline | 1. Download archive 2. Extract to temp directory 3. Validate structure 4. Close existing DB connections 5. Copy files to app data directory. | `src/main/services/BackupService.ts` |
| BR-045 | Connection instance caching | WebDAV and S3 client instances are cached and reused for subsequent operations. Cache is invalidated on connection settings change. | `src/main/services/BackupService.ts` |
| BR-046 | Cross-platform permission handling | On Unix systems, restored files have permissions preserved from the archive. On Windows, ACL-based permissions are applied post-restore. | `src/main/services/BackupService.ts` |
| BR-047 | File listing filters | Remote file listing returns only `.zip` files, sorted by modification time (newest first). Non-zip files are hidden from the user. | `src/main/services/BackupService.ts` |
| BR-048 | Progress reporting | Backup and restore operations report progress at 5% granularity. Progress updates more frequent than 5% are coalesced. | `src/main/services/BackupService.ts` |
| BR-049 | LAN transfer security | LAN transfer validates all file paths to prevent directory traversal attacks. Paths containing `..` or absolute paths are rejected. | `src/main/services/BackupService.ts` |
| BR-050 | Pre-restore connection cleanup | Before restoring, all active database connections (SQLite, Dexie) are closed to prevent file locking conflicts during file replacement. | `src/main/services/BackupService.ts` |

### Validation Logic

| Rule ID | Validation | Error Behavior | Source File(s) |
|---------|-----------|----------------|----------------|
| BR-049 | File paths must not contain `..` or be absolute | Paths rejected; transfer aborted with security error | `src/main/services/BackupService.ts` |
| BR-044 | Archive structure must be valid on restore | Invalid structure aborts restore with descriptive error | `src/main/services/BackupService.ts` |
| BR-047 | Listed files must have `.zip` extension | Non-zip files filtered out silently | `src/main/services/BackupService.ts` |

### Workflows

| Rule ID | Workflow | Steps | Source File(s) |
|---------|----------|-------|----------------|
| BR-041 | Backup creation | 1. Collect state data and DB files 2. Optionally include user data files (BR-042) 3. Create ZIP64 archive with level 1 compression 4. Generate filename (BR-043) 5. Upload to backend (WebDAV/S3/local) 6. Report progress at 5% intervals (BR-048) | `src/main/services/BackupService.ts` |
| BR-044 | Restore pipeline | 1. Close existing DB connections (BR-050) 2. Download archive from backend 3. Extract to temp directory 4. Validate archive structure 5. Copy files to app data directory 6. Handle platform-specific permissions (BR-046) 7. Report progress at 5% intervals (BR-048) 8. Restart app | `src/main/services/BackupService.ts` |

### Cross-Feature Rules

| Rule ID | Features Involved | Description | Source File(s) |
|---------|------------------|-------------|----------------|
| BR-050 | F007, F001, F004 | Pre-restore connection cleanup closes SQLite connections owned by knowledge base (F004) and core platform (F001) | `src/main/services/BackupService.ts` |
| BR-044 | F007, F001 | Restore pipeline replaces files in F001 file storage directories and triggers app restart | `src/main/services/BackupService.ts` |

---

## F011-memory-system

### Core Rules

| Rule ID | Rule Name | Description | Source File(s) |
|---------|-----------|-------------|----------------|
| BR-028 | Unified 1536 embedding dimension | All embedding vectors are normalized to 1536 dimensions. Vectors shorter than 1536 are zero-padded; vectors longer are truncated. | `src/main/services/MemoryService.ts` |
| BR-029 | Similarity dedup threshold | Memory entries with cosine similarity >= 0.85 to an existing entry are considered duplicates. The existing entry is updated instead of creating a new one. | `src/main/services/MemoryService.ts` |
| BR-030 | Hash-based dedup | SHA-256 hash of normalized memory content is computed. Exact content matches (same hash) are deduplicated before embedding comparison. | `src/main/services/MemoryService.ts` |
| BR-031 | Soft delete | Individual memory deletions set an `is_deleted` flag rather than removing the row. Soft-deleted entries are excluded from search results. | `src/main/services/MemoryService.ts` |
| BR-032 | Restore deleted memory | When adding a memory whose content hash matches a soft-deleted entry, the existing entry is restored (undeleted) rather than creating a duplicate. | `src/main/services/MemoryService.ts` |
| BR-033 | History tracking | All memory mutations are recorded in a history table with operation type: `ADD`, `UPDATE`, or `DELETE`. History entries include timestamp and before/after values. | `src/main/services/MemoryService.ts` |
| BR-034 | Metadata merge | When updating a memory entry, metadata fields are merged using object spread (new values override existing keys, existing keys not in update are preserved). | `src/main/services/MemoryService.ts` |
| BR-035 | Default user protection | The `"default-user"` user ID cannot be deleted. Deletion attempts for this user are silently ignored. | `src/main/services/MemoryService.ts` |
| BR-036 | User ID required validation | All memory operations require a valid `userId` parameter. Operations with missing or empty `userId` are rejected. | `src/main/services/MemoryService.ts` |
| BR-037 | Hard vs soft delete | Individual memory item deletion uses soft delete (BR-031). User-level deletion (delete all memories for a user) uses hard delete (permanent row removal). | `src/main/services/MemoryService.ts` |
| BR-038 | Search fallback | Primary search uses vector similarity. If vector search returns no results, falls back to text-based `LIKE` search on memory content. | `src/main/services/MemoryService.ts` |
| BR-039 | DB migration | On first access, if an old-path database file exists, it is migrated to the new canonical path. Migration is atomic (copy then delete). | `src/main/services/MemoryService.ts` |
| BR-040 | Singleton pattern with reload | MemoryService uses singleton pattern. The `reload()` method destroys and recreates the instance, used after DB migration or config changes. | `src/main/services/MemoryService.ts` |

### Validation Logic

| Rule ID | Validation | Error Behavior | Source File(s) |
|---------|-----------|----------------|----------------|
| BR-036 | `userId` must be non-empty string | Operation rejected with validation error | `src/main/services/MemoryService.ts` |
| BR-035 | `"default-user"` cannot be deleted | Deletion silently ignored; no error thrown | `src/main/services/MemoryService.ts` |
| BR-028 | Embedding vector must be normalizable to 1536 dimensions | Vectors padded or truncated automatically | `src/main/services/MemoryService.ts` |
| BR-029 | New memory content similarity must be < 0.85 to all existing entries | Duplicate entries merged into existing; caller notified | `src/main/services/MemoryService.ts` |

### Workflows

| Rule ID | Workflow | Steps | Source File(s) |
|---------|----------|-------|----------------|
| BR-030 | Memory addition with dedup | 1. Validate userId (BR-036) 2. Compute SHA-256 hash (BR-030) 3. Check for hash match in deleted entries (BR-032: restore if found) 4. Check for hash match in active entries (skip if found) 5. Generate embedding vector 6. Normalize to 1536 dimensions (BR-028) 7. Check cosine similarity against existing entries (BR-029) 8. If similar: update existing entry (BR-034 metadata merge) 9. If unique: insert new entry 10. Record in history (BR-033) | `src/main/services/MemoryService.ts` |
| BR-038 | Memory search with fallback | 1. Generate embedding for query text 2. Normalize to 1536 dimensions (BR-028) 3. Execute vector similarity search 4. If results found: return ranked results 5. If no results: fall back to text LIKE search on content field 6. Return combined results | `src/main/services/MemoryService.ts` |
| BR-037 | Memory deletion (item vs user) | 1. If single item: set `is_deleted = true` (BR-031) 2. Record DELETE in history (BR-033) 3. If user-level: check not `"default-user"` (BR-035) 4. Hard delete all rows for user 5. Record DELETE in history (BR-033) | `src/main/services/MemoryService.ts` |

### Cross-Feature Rules

| Rule ID | Features Involved | Description | Source File(s) |
|---------|------------------|-------------|----------------|
| BR-028 | F011, F004 | Unified 1536 embedding dimension aligns with knowledge base embedding infrastructure for consistency | `src/main/services/MemoryService.ts` |
| BR-038 | F011, F005 | Memory search results are injected into chat context when memory-enabled assistants are used | `src/main/services/MemoryService.ts` |
| BR-039 | F011, F001 | DB migration uses F001 file storage paths for old and new database locations | `src/main/services/MemoryService.ts` |

---

## Cross-cutting Rules

### Core Rules

| Rule ID | Rule Name | Description | Features Affected | Source File(s) |
|---------|-----------|-------------|-------------------|----------------|
| BR-100 | Web security disabled | `webSecurity` is set to `false` on both main and mini BrowserWindow instances. Allows cross-origin requests from renderer. | F001, F005, F010 | `src/main/window/MainWindow.ts`, `src/main/window/MiniWindow.ts` |
| BR-101 | MCP server key identity | MCP server identity is a composite key of `baseUrl + command + args + env + id`. Used for deduplication and connection caching. | F006, F001 | `src/main/services/MCPService.ts` |
| BR-102 | File storage 3-directory structure | Files are organized into three directories: `Data` (user files), `Cache` (temporary), and `Config` (app configuration). All features use this structure. | F001, F004, F007, F009 | `src/main/services/FileService.ts` |
| BR-103 | Queue-based processing | Knowledge items use a state machine: PENDING -> PROCESSING -> DONE. This pattern is also referenced by memory system batch operations. | F004, F011 | `src/main/services/KnowledgeService.ts` |
| BR-104 | Spell check languages conditional | Spell check language list is only populated when spell check is enabled in config. Disabled spell check returns empty language array. | F001, F008 | `src/main/services/ConfigManager.ts` |
| BR-105 | WindowService singleton | WindowService maintains a single instance managing all BrowserWindows. Accessed globally by IPC handlers and other services. | F001, F005, F006, F008, F010 | `src/main/services/WindowService.ts` |
| BR-097 | Cascade delete (KB) | Removing a knowledge base cascades to remove KB references from assistants (F005) and agent presets (F012). | F004, F005, F012 | `src/main/services/KnowledgeService.ts` |
| BR-099 | File cleanup on item removal | File items delete the stored file from disk. Video items delete both the SRT subtitle file and the video file. | F004, F001 | `src/main/services/KnowledgeService.ts` |

### Validation Logic

| Rule ID | Validation | Error Behavior | Features Affected |
|---------|-----------|----------------|-------------------|
| BR-049 | Path traversal prevention in LAN transfer | Paths with `..` or absolute paths rejected with security error | F007, F001 |
| BR-101 | MCP server composite key must be unique | Duplicate keys resolved by returning cached connection | F006, F001 |

---

## Appendix: Rule ID Quick Reference

| Rule ID Range | Feature Area | Count |
|---------------|-------------|-------|
| BR-001 - BR-010 | F004-knowledge-base | 10 |
| BR-011 - BR-027 | F006-mcp-integration | 17 |
| BR-028 - BR-040 | F011-memory-system | 13 |
| BR-041 - BR-050 | F007-backup-sync | 10 |
| BR-051 - BR-090 | F001-core-platform | 40 |
| BR-091 - BR-094 | F002-provider-management | 4 |
| BR-095 - BR-099 | F004-knowledge-base (additional) | 5 |
| BR-100 - BR-105 | Cross-cutting | 6 |
| **Total** | | **105** |

---

## Change Log

| Date | Author | Changes |
|------|--------|---------|
| 2026-03-04 | reverse-spec | Initial extraction of 105 business rules from Cherry Studio source |
