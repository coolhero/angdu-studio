# API Registry

> Angdu Studio Reverse-Spec | Generated 2026-03-14
> Source: Cherry Studio IPC channel and Express API analysis

---

## Communication Architecture

Cherry Studio uses **three** communication layers:

| Layer | Technology | Direction | Purpose |
|---|---|---|---|
| IPC Channels | Electron ipcMain/ipcRenderer | Renderer <-> Main | Core system operations |
| Express API | Express.js (localhost) | External <-> Main | Agent SDK integration |
| AI SDK Streams | Vercel AI SDK | Renderer -> Provider APIs | LLM streaming (renderer-side) |

**Convention:** IPC channel names use `PascalCase:PascalCase` format (e.g., `File:Upload`). In this document, underscores represent this separator for readability.

---

## 1. IPC Channel Index by Feature

### F001-shell: Application Shell & Window Management

#### App Lifecycle

| Channel | Direction | Params | Returns | Description |
|---|---|---|---|---|
| App_Info | R -> M | none | AppInfo | Get app version, paths, platform info |
| App_Proxy | R -> M | ProxyConfig | void | Set network proxy configuration |
| App_Reload | R -> M | none | void | Reload renderer window |
| App_Quit | R -> M | none | void | Quit application |
| App_SetLaunchOnBoot | R -> M | boolean | void | Enable/disable auto-start on login |
| App_SetTray | R -> M | boolean | void | Enable/disable system tray icon |
| App_SetTheme | R -> M | "light"/"dark"/"system" | void | Set application theme |
| App_SetFullScreen | R -> M | boolean | void | Toggle fullscreen mode |
| App_CheckForUpdate | R -> M | none | UpdateInfo / null | Check for app updates |
| App_QuitAndInstall | R -> M | none | void | Install update and restart |
| App_SetLanguage | R -> M | string | void | Set UI language (i18next locale) |

#### System Operations

| Channel | Direction | Params | Returns | Description |
|---|---|---|---|---|
| System_GetHostname | R -> M | none | string | Get machine hostname |
| System_GetLocale | R -> M | none | string | Get OS locale |
| System_OpenExternal | R -> M | url: string | void | Open URL in default browser |
| System_OpenPath | R -> M | path: string | void | Open path in OS file manager |
| System_GetClipboardText | R -> M | none | string | Read clipboard text |
| System_SetClipboardText | R -> M | text: string | void | Write text to clipboard |
| System_SetClipboardImage | R -> M | dataUrl: string | void | Write image to clipboard |

#### Window Management

| Channel | Direction | Params | Returns | Description |
|---|---|---|---|---|
| Window_Minimize | R -> M | none | void | Minimize current window |
| Window_Maximize | R -> M | none | void | Toggle maximize/restore |
| Window_Close | R -> M | none | void | Close current window |
| Window_SetAlwaysOnTop | R -> M | boolean | void | Set always-on-top flag |
| Window_GetBounds | R -> M | none | Rectangle | Get window position and size |
| Window_SetBounds | R -> M | Rectangle | void | Set window position and size |
| Window_Create | R -> M | WindowOptions | windowId | Create new window |

#### Configuration Store

| Channel | Direction | Params | Returns | Description |
|---|---|---|---|---|
| Config_Set | R -> M | key: string, value: any | void | Set a config value (electron-store) |
| Config_Get | R -> M | key: string | any | Get a config value |

---

### F004-settings: User Preferences

Uses `Config_Set` and `Config_Get` from F001-shell, plus:

| Channel | Direction | Params | Returns | Description |
|---|---|---|---|---|
| Shortcuts_Update | R -> M | ShortcutMap | void | Update global keyboard shortcuts |
| App_SetEnableSpellCheck | R -> M | boolean | void | Enable/disable spell checking |

**Note:** Most settings are managed in the renderer Zustand store with `persist` middleware. Only settings that require main process action (theme, tray, shortcuts, proxy) use IPC.

---

### F003-providers: Provider Management

**No dedicated IPC channels.** Provider configuration (API keys, endpoints, models) is managed entirely in the renderer via Zustand store. The main process is not involved in provider CRUD.

AI requests go directly from the renderer to provider APIs via the Vercel AI SDK. The main process only participates when proxy settings need to be applied.

---

### F006-chat-core: Chat & Messaging

**No dedicated IPC channels for message streaming.** The AI SDK streaming pipeline runs entirely in the renderer process:

1. Renderer constructs the request (messages, model, tools)
2. Vercel AI SDK sends the request directly to the provider API
3. Stream chunks are processed in the renderer, creating/updating MessageBlocks
4. MessageBlocks are persisted to Dexie (IndexedDB)

**Multi-window sync** uses the StoreSyncService (IPC-based) to broadcast state changes across windows, but the message streaming itself is renderer-local.

---

### F007-files: File Operations

| Channel | Direction | Params | Returns | Description |
|---|---|---|---|---|
| File_Select | R -> M | FileSelectOptions | string[] / null | Open native file picker dialog |
| File_Upload | R -> M | filePath: string | FileMetadata | Copy file to app data directory |
| File_Delete | R -> M | fileId: string | void | Delete file from app data |
| File_Read | R -> M | filePath: string | Buffer | Read file contents |
| File_Write | R -> M | filePath: string, data: Buffer | void | Write file contents |
| File_Open | R -> M | filePath: string | void | Open file with default OS app |
| File_Save | R -> M | SaveDialogOptions | string / null | Show save dialog and write file |
| File_Download | R -> M | url: string, destPath: string | string | Download URL to local path |
| File_Move | R -> M | src: string, dest: string | void | Move/rename file |
| File_Rename | R -> M | filePath: string, newName: string | string | Rename file, return new path |
| File_SaveImage | R -> M | dataUrl: string | string | Save data URL as image file |
| File_SaveBase64Image | R -> M | base64: string, ext: string | string | Save base64 data as image |
| File_BinaryImage | R -> M | filePath: string | Buffer | Read image as binary |
| File_Base64Image | R -> M | filePath: string | string | Read image as base64 |
| File_GetDirectoryStructure | R -> M | dirPath: string | DirTree | Get recursive directory listing |
| File_StartWatcher | R -> M | paths: string[] | watcherId | Start filesystem watcher |
| File_StopWatcher | R -> M | watcherId: string | void | Stop filesystem watcher |

**FileSelectOptions:**
```
{
  filters?: { name: string, extensions: string[] }[]
  multiSelect?: boolean
  directory?: boolean
}
```

---

### F008-mcp: MCP Server Management

| Channel | Direction | Params | Returns | Description |
|---|---|---|---|---|
| Mcp_ListTools | R -> M | serverId: string | Tool[] | List available tools from server |
| Mcp_CallTool | R -> M | CallToolParams | ToolResult | Execute a tool on the server |
| Mcp_ListPrompts | R -> M | serverId: string | Prompt[] | List available prompts |
| Mcp_GetPrompt | R -> M | serverId: string, name: string, args?: object | PromptResult | Get a specific prompt |
| Mcp_ListResources | R -> M | serverId: string | Resource[] | List available resources |
| Mcp_GetResource | R -> M | serverId: string, uri: string | ResourceContent | Read a specific resource |
| Mcp_RemoveServer | R -> M | serverId: string | void | Remove and stop a server |
| Mcp_RestartServer | R -> M | serverId: string | void | Restart a running server |
| Mcp_StopServer | R -> M | serverId: string | void | Stop a running server |
| Mcp_AbortTool | R -> M | callId: string | void | Abort an in-progress tool call |
| Mcp_GetServerLogs | R -> M | serverId: string | LogEntry[] | Get server stdout/stderr logs |

**CallToolParams:**
```
{
  serverId: string
  toolName: string
  arguments: Record<string, unknown>
  callId: string       // for abort tracking
  timeout?: number     // ms, default 60000
}
```

**Tool Result:**
```
{
  content: (TextContent | ImageContent | EmbeddedResource)[]
  isError?: boolean
}
```

---

### F009-agents: Agent System

#### IPC Channels

| Channel | Direction | Params | Returns | Description |
|---|---|---|---|---|
| AgentMessage_PersistExchange | R -> M | PersistParams | void | Save agent message exchange to SQLite |
| AgentMessage_GetHistory | R -> M | sessionId: string, limit?: number | AgentSessionMessage[] | Retrieve message history for a session |

#### Express API Server (localhost)

The agent system also exposes a local Express API for Claude Code SDK integration:

**Base URL:** `http://localhost:{port}` (port dynamically assigned)

##### Agent CRUD

| Method | Path | Body | Response | Description |
|---|---|---|---|---|
| GET | /agents | - | Agent[] | List all agents |
| POST | /agents | AgentCreate | Agent | Create a new agent |
| GET | /agents/:id | - | Agent | Get agent by id |
| PUT | /agents/:id | AgentUpdate | Agent | Update agent |
| DELETE | /agents/:id | - | void | Delete agent and all sessions |

##### Session Management

| Method | Path | Body | Response | Description |
|---|---|---|---|---|
| GET | /agents/:agentId/sessions | - | AgentSession[] | List sessions for agent |
| POST | /agents/:agentId/sessions | SessionCreate | AgentSession | Create new session (inherits agent config) |
| GET | /agents/:agentId/sessions/:sessionId | - | AgentSession | Get session details |

##### Messaging

| Method | Path | Body | Response | Description |
|---|---|---|---|---|
| POST | /agents/:agentId/sessions/:sessionId/messages | { content: string, role: string } | SSE stream | Send message and stream response |

##### System

| Method | Path | Body | Response | Description |
|---|---|---|---|---|
| GET | /health | - | { status: "ok" } | Health check |
| GET | /models | - | Model[] | List available models |
| POST | /chat | ChatRequest | SSE stream | Direct chat without agent context |

---

### F010-knowledge: Knowledge Base Management

| Channel | Direction | Params | Returns | Description |
|---|---|---|---|---|
| KnowledgeBase_Create | R -> M | CreateParams | KBInfo | Create vector store and index |
| KnowledgeBase_Delete | R -> M | kbId: string | void | Delete vector store and all documents |
| KnowledgeBase_Add | R -> M | kbId: string, items: DocItem[] | void | Add documents to knowledge base |
| KnowledgeBase_Remove | R -> M | kbId: string, itemIds: string[] | void | Remove documents from knowledge base |
| KnowledgeBase_Search | R -> M | SearchParams | SearchResult[] | Semantic search across knowledge base |
| KnowledgeBase_Rerank | R -> M | RerankParams | RerankResult[] | Rerank search results |

**SearchParams:**
```
{
  kbId: string
  query: string
  topK?: number          // default 5
  threshold?: number     // default from KB config
  filter?: object        // metadata filter
}
```

**RerankParams:**
```
{
  model: string          // reranker model id
  query: string
  documents: string[]
  topN?: number
}
```

---

### F013-backup: Backup & Restore

| Channel | Direction | Params | Returns | Description |
|---|---|---|---|---|
| Backup_Backup | R -> M | destPath: string | void | Create local backup archive |
| Backup_Restore | R -> M | srcPath: string | void | Restore from local backup archive |
| Backup_BackupToWebdav | R -> M | WebdavConfig | void | Backup to WebDAV server |
| Backup_RestoreFromWebdav | R -> M | WebdavConfig | void | Restore from WebDAV server |
| Backup_BackupToS3 | R -> M | S3Config | void | Backup to S3-compatible storage |
| Backup_RestoreFromS3 | R -> M | S3Config | void | Restore from S3-compatible storage |

**WebdavConfig:**
```
{
  url: string
  username: string
  password: string
  path?: string         // remote directory path
}
```

**S3Config:**
```
{
  bucket: string
  region: string
  accessKeyId: string
  secretAccessKey: string
  endpoint?: string     // for S3-compatible services
  prefix?: string       // key prefix
}
```

---

## 2. IPC Bridge Pattern

All IPC channels follow a consistent bridge pattern:

```
Renderer                    Preload (contextBridge)           Main Process
---------                   ----------------------           ------------
store.action()  -->  window.api.channel(args)  -->  ipcMain.handle('channel')
                                                         |
                                                    Service.method()
                                                         |
                <--  Promise<result>              <--  return result
```

**Key implementation details:**
- All IPC calls are **async** (invoke/handle pattern, not send/on)
- Preload script exposes a typed `window.api` object via `contextBridge`
- Error handling: main process errors are serialized and re-thrown in renderer
- Large data (files, images) use Buffer transfer for efficiency

---

## 3. Channel Naming Convention (Angdu Studio)

Cherry Studio uses inconsistent naming. Angdu Studio should standardize:

| Pattern | Example | Usage |
|---|---|---|
| `{domain}:{action}` | `file:upload` | Standard IPC channel |
| `{domain}:{entity}:{action}` | `kb:document:add` | Nested resource operations |

All channel names in lowercase with colon separators.
