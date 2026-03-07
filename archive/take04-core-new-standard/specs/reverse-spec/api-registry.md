# API Registry -- Cherry Studio Reverse-Spec

| Key        | Value                                        |
|------------|----------------------------------------------|
| Source     | `/Users/coolhero/Study/oss/cherry-studio`    |
| Generated  | 2026-03-04                                   |
| IPC Channels   | 344 (311 handlers + 33 events)           |
| REST Endpoints | 24 (4 public + 20 authenticated)         |
| Preload API    | ~240 methods (contextBridge-exposed)     |
| Method     | Static analysis of Express routes, Electron IPC handlers, preload bridge |

---

## Part 1: IPC Channels by Domain

Electron IPC channels connect the renderer process (React UI) to the main process (Node.js).
Direction: **R->M** = Renderer invokes Main (handler); **M->R** = Main pushes to Renderer (event).

Total channels: **344** (311 handlers + 33 events)

---

### IPC Domain Summary

| # | Domain | Count | Owner Feature | Direction |
|---|--------|-------|---------------|-----------|
| 1 | App | ~47 | F001-core-platform | R->M / M->R |
| 2 | File | ~40 | F001-core-platform | R->M / M->R |
| 3 | Selection | 17 | F010-auxiliary-features | R->M / M->R |
| 4 | Backup | 19 | F007-backup-sync | R->M / M->R |
| 5 | MCP | 18 | F006-mcp-integration | R->M / M->R |
| 6 | OpenClaw | 17 | F010-auxiliary-features | R->M / M->R |
| 7 | Trace | 13 | F010-auxiliary-features | R->M |
| 8 | Memory | 12 | F011-memory-system | R->M |
| 9 | Window | 11 | F001-core-platform | R->M |
| 10 | LocalTransfer | 9 | F007-backup-sync | R->M / M->R |
| 11 | System | 8 | F001-core-platform | R->M |
| 12 | OVMS | 8 | F010-auxiliary-features | R->M |
| 13 | KnowledgeBase | 9 | F004-knowledge-base | R->M / M->R |
| 14 | ClaudeCodePlugin | 7 | F012-agent-framework | R->M / M->R |
| 15 | Copilot | 6 | F002-provider-management | R->M / M->R |
| 16 | CherryIN | 6 | F002-provider-management | R->M / M->R |
| 17 | Anthropic OAuth | 6 | F002-provider-management | R->M / M->R |
| 18 | ApiServer | 6 | F010-auxiliary-features | R->M / M->R |
| 19 | Gemini | 5 | F010-auxiliary-features | R->M |
| 20 | CodeTools | 5 | F012-agent-framework | R->M |
| 21 | MiniWindow | 5 | F001-core-platform | R->M / M->R |
| 22 | Webview | 5 | F001-core-platform | R->M / M->R |
| 23 | StoreSync | 4 | F001-core-platform | R->M / M->R |
| 24 | FileService | 4 | F010-auxiliary-features | R->M |
| 25 | AgentToolPermission | 3 | F012-agent-framework | R->M / M->R |
| 26 | VertexAI | 3 | F002-provider-management | R->M |
| 27 | Nutstore | 3 | F010-auxiliary-features | R->M |
| 28 | SearchWindow | 3 | F010-auxiliary-features | R->M / M->R |
| 29 | Config | 2 | F001-core-platform | R->M |
| 30 | Notification | 2 | F001-core-platform | R->M |
| 31 | Open | 2 | F001-core-platform | R->M |
| 32 | AES | 2 | F001-core-platform | R->M |
| 33 | Zip | 2 | F001-core-platform | R->M |
| 34 | AgentMessage | 2 | F012-agent-framework | R->M |
| 35 | Obsidian | 2 | F010-auxiliary-features | R->M |
| 36 | OCR | 2 | F010-auxiliary-features | R->M |
| 37 | Shortcuts | 1 | F001-core-platform | R->M |
| 38 | Export | 1 | F010-auxiliary-features | R->M |
| 39 | ExternalApps | 1 | F010-auxiliary-features | R->M |
| 40 | Minapp | 1 | F010-auxiliary-features | R->M |
| 41 | Analytics | 1 | F010-auxiliary-features | R->M |
| 42 | Python | 1 | F012-agent-framework | R->M |
| 43 | CherryAI | 1 | F002-provider-management | R->M |
| 44 | Provider | 1 | F002-provider-management | R->M |
| — | **Event-only channels** | ~33 | (various) | M->R |

---

### IPC Channel Detail by Domain

#### App Domain (~47 channels) -- Owner: F001-core-platform

| Channel | Direction | Description |
|---------|-----------|-------------|
| `App_Info` | R->M | Get app version, name, paths |
| `App_Reload` | R->M | Reload the application |
| `App_Quit` | R->M | Quit the application |
| `App_Proxy` | R->M | Configure HTTP/SOCKS proxy |
| `App_SetTheme` | R->M | Set native theme (light/dark/auto) |
| `App_SetLanguage` | R->M | Set application language |
| `App_SetLaunchOnBoot` | R->M | Configure launch-at-login |
| `App_GetCacheSize` | R->M | Get cache directory size |
| `App_ClearCache` | R->M | Clear HTTP cache and temp files |
| `App_CheckForUpdate` | R->M | Trigger update check |
| `App_DownloadUpdate` | R->M | Download available update |
| `App_InstallUpdate` | R->M | Install downloaded update and restart |
| `App_SetZoomFactor` | R->M | Set window zoom level |
| `App_GetZoomFactor` | R->M | Get window zoom level |
| `App_SetAlwaysOnTop` | R->M | Set window always-on-top |
| `App_ToggleFullScreen` | R->M | Toggle fullscreen |
| `App_IsFullScreen` | R->M | Check fullscreen state |
| `App_GetPath` | R->M | Get Electron special paths (userData, temp, etc.) |
| `App_GetSystemInfo` | R->M | CPU, memory, GPU, OS info |
| `App_GetLocale` | R->M | System locale string |
| `App_GetLoginItem` | R->M | Check launch-at-login state |
| `App_GetTheme` | R->M | Get current native theme |
| `App_GetProxy` | R->M | Get current proxy settings |
| `App_SetBadgeCount` | R->M | Set dock/taskbar badge count |
| `App_ShowDock` | R->M | Show dock icon (macOS) |
| `App_HideDock` | R->M | Hide dock icon (macOS) |
| `App_SetTrayTitle` | R->M | Set tray icon title/tooltip |
| `App_SetTrayIcon` | R->M | Set tray icon image |
| `App_ShowTrayMenu` | R->M | Show tray context menu |
| `App_RegisterProtocol` | R->M | Register custom URL protocol handler |
| `App_HandleProtocol` | M->R | Incoming URL from protocol handler |
| `App_SetMenu` | R->M | Set application menu |
| `App_SetContextMenu` | R->M | Set right-click context menu |
| `App_GpuInfo` | R->M | Get GPU renderer info |
| `App_GetDisplays` | R->M | Get connected displays info |
| `App_IsFocused` | R->M | Check if app window is focused |
| `App_Focus` | R->M | Focus the main window |
| `App_MinimizeToTray` | R->M | Minimize to system tray |
| `App_RestoreFromTray` | R->M | Restore from system tray |
| `App_SetStartupUrl` | R->M | Set URL to open on next launch |
| `App_GetArgv` | R->M | Get command-line arguments |
| `App_Log` | R->M | Write to main process log |
| `App_GetLogs` | R->M | Read log files |
| `App_OpenLogFolder` | R->M | Open logs directory in file manager |
| `App_SetProgressBar` | R->M | Set taskbar progress bar |
| `App_BounceDock` | R->M | Bounce dock icon (macOS) |
| `App_GetSafeArea` | R->M | Get safe area insets |

#### File Domain (~40 channels) -- Owner: F001-core-platform

| Channel | Direction | Description |
|---------|-----------|-------------|
| `File_Open` | R->M | Open file dialog and return selected path(s) |
| `File_Save` | R->M | Save file dialog |
| `File_Read` | R->M | Read file contents (text or binary) |
| `File_Write` | R->M | Write content to file |
| `File_Delete` | R->M | Delete a file |
| `File_Copy` | R->M | Copy file to destination |
| `File_Move` | R->M | Move/rename file |
| `File_Upload` | R->M | Upload local file to URL |
| `File_Download` | R->M | Download URL to local file |
| `File_Exists` | R->M | Check if path exists |
| `File_Stat` | R->M | Get file metadata (size, dates, etc.) |
| `File_Mkdir` | R->M | Create directory recursively |
| `File_Readdir` | R->M | List directory contents |
| `File_SelectFolder` | R->M | Open folder selection dialog |
| `File_SelectFile` | R->M | Open file selection dialog with filters |
| `File_GetIcon` | R->M | Get system file icon as data URL |
| `File_CreateTemp` | R->M | Create temporary file |
| `File_Hash` | R->M | Compute file hash (MD5/SHA-256) |
| `File_Base64Encode` | R->M | Read file as base64 |
| `File_Base64Decode` | R->M | Write base64 data to file |
| `File_BinaryRead` | R->M | Read file as ArrayBuffer |
| `File_BinaryWrite` | R->M | Write ArrayBuffer to file |
| `File_Compress` | R->M | Compress file (gzip) |
| `File_Decompress` | R->M | Decompress file (gzip) |
| `File_StartWatcher` | R->M | Start watching file for changes |
| `File_StopWatcher` | R->M | Stop watching file |
| `File_Changed` | M->R | Notify renderer of file change |
| `File_GetMetadata` | R->M | Get extended file metadata |
| `File_Thumbnail` | R->M | Generate thumbnail for image/video |
| `File_GetType` | R->M | Determine file type from path/extension |
| `File_Append` | R->M | Append content to file |
| `File_Truncate` | R->M | Truncate file |
| `File_Rename` | R->M | Rename file/directory |
| `File_Glob` | R->M | Glob pattern file search |
| `File_GetSize` | R->M | Get file or directory size |
| `File_GetTempPath` | R->M | Get temp directory path |
| `File_GetDownloadsPath` | R->M | Get downloads directory path |
| `File_OpenInExplorer` | R->M | Reveal file in OS file manager |
| `File_GetRecent` | R->M | Get recently accessed files |
| `File_ClearRecent` | R->M | Clear recent files list |

#### Selection Domain (17 channels) -- Owner: F010-auxiliary-features

| Channel | Direction | Description |
|---------|-----------|-------------|
| `Selection_TextSelected` | M->R | Notify renderer of text selection event |
| `Selection_SetEnabled` | R->M | Enable/disable selection assistant |
| `Selection_SetTriggerMode` | R->M | Configure trigger mode (hotkey, auto, etc.) |
| `Selection_GetSelection` | R->M | Get current text selection |
| `Selection_Translate` | R->M | Translate selected text |
| `Selection_Explain` | R->M | Explain selected text |
| `Selection_Summarize` | R->M | Summarize selected text |
| `Selection_Improve` | R->M | Improve selected text |
| `Selection_Expand` | R->M | Expand selected text |
| `Selection_Custom` | R->M | Run custom action on selection |
| `Selection_ShowPopup` | R->M | Show selection popup UI |
| `Selection_HidePopup` | R->M | Hide selection popup UI |
| `Selection_CopyResult` | R->M | Copy selection result to clipboard |
| `Selection_GetConfig` | R->M | Get selection assistant configuration |
| `Selection_GetHistory` | R->M | Get selection action history |
| `Selection_ClearHistory` | R->M | Clear selection action history |
| `Selection_SetShortcut` | R->M | Configure selection shortcut key |

#### Backup Domain (19 channels) -- Owner: F007-backup-sync

| Channel | Direction | Description |
|---------|-----------|-------------|
| `Backup_Backup` | R->M | Create a full backup archive |
| `Backup_Restore` | R->M | Restore from a backup archive |
| `Backup_BackupToWebdav` | R->M | Upload backup to WebDAV server |
| `Backup_RestoreFromWebdav` | R->M | Download and restore from WebDAV |
| `Backup_BackupToS3` | R->M | Upload backup to S3-compatible storage |
| `Backup_RestoreFromS3` | R->M | Download and restore from S3 |
| `Backup_List` | R->M | List available local backups |
| `Backup_Delete` | R->M | Delete a local backup |
| `Backup_Export` | R->M | Export data to file (selective) |
| `Backup_Import` | R->M | Import data from file |
| `Backup_Validate` | R->M | Validate backup file integrity |
| `Backup_Migrate` | R->M | Run format migration on backup |
| `Backup_WebdavConnect` | R->M | Test WebDAV connection |
| `Backup_WebdavList` | R->M | List backups on WebDAV |
| `Backup_WebdavDelete` | R->M | Delete backup from WebDAV |
| `Backup_NutstoreSync` | R->M | Sync with Nutstore |
| `Backup_NutstoreList` | R->M | List Nutstore backups |
| `Backup_AutoBackupEnable` | R->M | Enable scheduled auto-backup |
| `Backup_AutoBackupStatus` | R->M | Get auto-backup schedule status |

#### MCP Domain (18 channels) -- Owner: F006-mcp-integration

| Channel | Direction | Description |
|---------|-----------|-------------|
| `Mcp_AddServer` | R->M | Add new MCP server configuration |
| `Mcp_RemoveServer` | R->M | Remove MCP server configuration |
| `Mcp_UpdateServer` | R->M | Update MCP server configuration |
| `Mcp_StartServer` | R->M | Start an MCP server process |
| `Mcp_StopServer` | R->M | Stop a running MCP server |
| `Mcp_RestartServer` | R->M | Restart an MCP server |
| `Mcp_ListServers` | R->M | List all configured MCP servers |
| `Mcp_GetServer` | R->M | Get single server details |
| `Mcp_ListTools` | R->M | List tools for a server |
| `Mcp_CallTool` | R->M | Invoke a tool on a server |
| `Mcp_ListPrompts` | R->M | List prompts for a server |
| `Mcp_GetPrompt` | R->M | Get a specific prompt |
| `Mcp_ListResources` | R->M | List resources for a server |
| `Mcp_ReadResource` | R->M | Read a resource from a server |
| `Mcp_Install` | R->M | Install MCP server from registry/URL |
| `Mcp_Marketplace` | R->M | Browse MCP marketplace |
| `Mcp_GetLogs` | R->M | Get server process logs |
| `Mcp_StatusChanged` | M->R | Notify renderer of server status change |

#### OpenClaw Domain (17 channels) -- Owner: F010-auxiliary-features

| Channel | Direction | Description |
|---------|-----------|-------------|
| `OpenClaw_CheckInstalled` | R->M | Check if OpenClaw gateway is installed |
| `OpenClaw_Install` | R->M | Install OpenClaw gateway |
| `OpenClaw_Uninstall` | R->M | Uninstall OpenClaw gateway |
| `OpenClaw_StartGateway` | R->M | Start the OpenClaw gateway process |
| `OpenClaw_StopGateway` | R->M | Stop the OpenClaw gateway process |
| `OpenClaw_GetStatus` | R->M | Get gateway status |
| `OpenClaw_Search` | R->M | Search OpenClaw marketplace |
| `OpenClaw_List` | R->M | List installed OpenClaw items |
| `OpenClaw_Update` | R->M | Update OpenClaw item |
| `OpenClaw_GetInfo` | R->M | Get item info |
| `OpenClaw_GetConfig` | R->M | Get OpenClaw configuration |
| `OpenClaw_SetConfig` | R->M | Set OpenClaw configuration |
| `OpenClaw_Rate` | R->M | Rate an item |
| `OpenClaw_GetCategories` | R->M | Get marketplace categories |
| `OpenClaw_GetFeatured` | R->M | Get featured items |
| `OpenClaw_GetTrending` | R->M | Get trending items |
| `OpenClaw_Subscribe` | R->M | Subscribe to item updates |

#### Trace Domain (13 channels) -- Owner: F010-auxiliary-features

| Channel | Direction | Description |
|---------|-----------|-------------|
| `TRACE_SAVE_DATA` | R->M | Save trace data |
| `TRACE_GET_DATA` | R->M | Get stored trace data |
| `TRACE_START` | R->M | Start a trace session |
| `TRACE_STOP` | R->M | Stop a trace session |
| `TRACE_CLEAR` | R->M | Clear all trace data |
| `TRACE_EXPORT` | R->M | Export trace data to file |
| `TRACE_GET_STATS` | R->M | Get trace statistics |
| `TRACE_LOG_EVENT` | R->M | Log a single trace event |
| `TRACE_SET_LEVEL` | R->M | Set trace verbosity level |
| `TRACE_GET_LEVEL` | R->M | Get current trace level |
| `TRACE_FLUSH` | R->M | Flush trace buffer |
| `TRACE_CONFIGURE` | R->M | Configure trace settings |
| `TRACE_IS_ENABLED` | R->M | Check if tracing is enabled |

#### Window Domain (11 channels) -- Owner: F001-core-platform

| Channel | Direction | Description |
|---------|-----------|-------------|
| `Windows_Minimize` | R->M | Minimize window |
| `Windows_Maximize` | R->M | Maximize/restore window |
| `Windows_Close` | R->M | Close window |
| `Windows_Create` | R->M | Create new window |
| `Windows_Focus` | R->M | Focus a window by ID |
| `Windows_SetTitle` | R->M | Set window title |
| `Windows_SetSize` | R->M | Set window dimensions |
| `Windows_ToggleDevTools` | R->M | Toggle developer tools |
| `Windows_ShowContextMenu` | R->M | Show context menu in window |
| `Windows_SetFullscreen` | R->M | Set window fullscreen state |
| `Windows_GetBounds` | R->M | Get window position and size |

#### Memory Domain (12 channels) -- Owner: F011-memory-system

| Channel | Direction | Description |
|---------|-----------|-------------|
| `Memory_Add` | R->M | Add a memory item |
| `Memory_Search` | R->M | Semantic search across memories |
| `Memory_List` | R->M | List all memory items |
| `Memory_Delete` | R->M | Soft-delete a memory item |
| `Memory_Update` | R->M | Update a memory item |
| `Memory_Clear` | R->M | Clear all memories |
| `Memory_Import` | R->M | Import memories from file |
| `Memory_Export` | R->M | Export memories to file |
| `Memory_GetHistory` | R->M | Get memory extraction history |
| `Memory_GetConfig` | R->M | Get memory system configuration |
| `Memory_SetConfig` | R->M | Set memory system configuration |
| `Memory_GetAll` | R->M | Get all memories (unfiltered) |

#### LocalTransfer Domain (9 channels) -- Owner: F007-backup-sync

| Channel | Direction | Description |
|---------|-----------|-------------|
| `LocalTransfer_Connect` | R->M | Connect to peer device |
| `LocalTransfer_Disconnect` | R->M | Disconnect from peer |
| `LocalTransfer_SendFile` | R->M | Send file to connected peer |
| `LocalTransfer_Discover` | R->M | Discover available peers on LAN |
| `LocalTransfer_Accept` | R->M | Accept incoming transfer |
| `LocalTransfer_Reject` | R->M | Reject incoming transfer |
| `LocalTransfer_GetStatus` | R->M | Get transfer connection status |
| `LocalTransfer_Progress` | M->R | Transfer progress notification |
| `LocalTransfer_Receive` | M->R | Incoming transfer notification |

#### OVMS Domain (8 channels) -- Owner: F010-auxiliary-features

| Channel | Direction | Description |
|---------|-----------|-------------|
| `Ovms_IsSupported` | R->M | Check if OVMS is supported on platform |
| `Ovms_AddModel` | R->M | Add a model to OVMS |
| `Ovms_RemoveModel` | R->M | Remove a model from OVMS |
| `Ovms_Start` | R->M | Start OVMS server |
| `Ovms_Stop` | R->M | Stop OVMS server |
| `Ovms_GetStatus` | R->M | Get OVMS server status |
| `Ovms_ListModels` | R->M | List loaded models |
| `Ovms_GetConfig` | R->M | Get OVMS configuration |

#### KnowledgeBase Domain (9 channels) -- Owner: F004-knowledge-base

| Channel | Enum Name | Direction | Description |
|---------|-----------|-----------|-------------|
| `knowledge-base:create` | KB_Create | R->M | Create a new knowledge base with vector index |
| `knowledge-base:delete` | KB_Delete | R->M | Delete knowledge base with cascade cleanup |
| `knowledge-base:reset` | KB_Reset | R->M | Reset knowledge base (remove items, keep config) |
| `knowledge-base:add-item` | KB_AddItem | R->M | Add and process an item via RAG pipeline |
| `knowledge-base:remove-item` | KB_RemoveItem | R->M | Remove item and clean up indexed data + files |
| `knowledge-base:search` | KB_Search | R->M | Semantic search via embedding + Vectra |
| `knowledge-base:rerank` | KB_Rerank | R->M | Rerank search results via model |
| `knowledge-base:item-status` | KB_ItemStatus | M->R | Processing status update (event) |
| `knowledge-base:directory-progress` | KB_DirectoryProgress | M->R | Directory processing progress (event) |

#### ClaudeCodePlugin Domain (7 channels) -- Owner: F012-agent-framework

| Channel | Direction | Description |
|---------|-----------|-------------|
| `ClaudeCodePlugin_Install` | R->M | Install Claude Code plugin |
| `ClaudeCodePlugin_ListInstalled` | R->M | List installed Claude Code plugins |
| `ClaudeCodePlugin_StartSession` | R->M | Start a Claude Code session |
| `ClaudeCodePlugin_SendMessage` | R->M | Send message to active session |
| `ClaudeCodePlugin_StopSession` | R->M | Stop a Claude Code session |
| `ClaudeCodePlugin_GetStatus` | R->M | Get plugin/session status |
| `ClaudeCodePlugin_Stream` | M->R | Stream output from Claude Code session |

#### Copilot Domain (6 channels) -- Owner: F002-provider-management

| Channel | Direction | Description |
|---------|-----------|-------------|
| `Copilot_Suggest` | R->M | Request inline suggestion |
| `Copilot_Accept` | R->M | Accept current suggestion |
| `Copilot_Dismiss` | R->M | Dismiss current suggestion |
| `Copilot_Configure` | R->M | Configure copilot settings |
| `Copilot_GetStatus` | R->M | Get copilot status |
| `Copilot_Stream` | M->R | Stream suggestion content |

#### CherryIN Domain (6 channels) -- Owner: F002-provider-management

| Channel | Direction | Description |
|---------|-----------|-------------|
| `CherryIN_Login` | R->M | Login to Cherry Studio cloud |
| `CherryIN_Logout` | R->M | Logout from Cherry Studio cloud |
| `CherryIN_GetUser` | R->M | Get current user info |
| `CherryIN_SyncStatus` | R->M | Get sync status |
| `CherryIN_Subscribe` | R->M | Subscribe to cloud events |
| `CherryIN_CheckEntitlement` | R->M | Check user entitlement/plan |

#### Anthropic OAuth Domain (6 channels) -- Owner: F002-provider-management

| Channel | Direction | Description |
|---------|-----------|-------------|
| `AnthropicOAuth_Start` | R->M | Start OAuth PKCE flow |
| `AnthropicOAuth_Callback` | M->R | OAuth callback with authorization code |
| `AnthropicOAuth_Refresh` | R->M | Refresh access token |
| `AnthropicOAuth_Revoke` | R->M | Revoke access token |
| `AnthropicOAuth_GetToken` | R->M | Get stored access token |
| `AnthropicOAuth_Status` | R->M | Get OAuth connection status |

#### ApiServer Domain (6 channels) -- Owner: F010-auxiliary-features

| Channel | Direction | Description |
|---------|-----------|-------------|
| `ApiServer_Start` | R->M | Start the embedded API server |
| `ApiServer_Stop` | R->M | Stop the embedded API server |
| `ApiServer_GetStatus` | R->M | Get server running status |
| `ApiServer_SetPort` | R->M | Set server listening port |
| `ApiServer_SetToken` | R->M | Set API bearer token |
| `ApiServer_GetConfig` | R->M | Get server configuration |

#### Gemini Domain (5 channels) -- Owner: F010-auxiliary-features

| Channel | Direction | Description |
|---------|-----------|-------------|
| `Gemini_UploadFile` | R->M | Upload file to Gemini API |
| `Gemini_GetFile` | R->M | Get file status from Gemini |
| `Gemini_ListFiles` | R->M | List uploaded files |
| `Gemini_DeleteFile` | R->M | Delete uploaded file |
| `Gemini_GenerateContent` | R->M | Generate content via Gemini |

#### CodeTools Domain (5 channels) -- Owner: F012-agent-framework

| Channel | Direction | Description |
|---------|-----------|-------------|
| `CodeTools_Run` | R->M | Execute code in sandbox |
| `CodeTools_Lint` | R->M | Lint code snippet |
| `CodeTools_Format` | R->M | Format code snippet |
| `CodeTools_GetLanguages` | R->M | Get supported languages |
| `CodeTools_GetConfig` | R->M | Get code execution config |

#### MiniWindow Domain (5 channels) -- Owner: F001-core-platform

| Channel | Direction | Description |
|---------|-----------|-------------|
| `MiniWindow_Show` | R->M | Show mini floating window |
| `MiniWindow_Hide` | R->M | Hide mini floating window |
| `MiniWindow_SetContent` | R->M | Set mini window content |
| `MiniWindow_SetPosition` | R->M | Set mini window position |
| `MiniWindow_GetBounds` | R->M | Get mini window bounds |

#### Webview Domain (5 channels) -- Owner: F001-core-platform

| Channel | Direction | Description |
|---------|-----------|-------------|
| `Webview_Create` | R->M | Create a managed webview |
| `Webview_Destroy` | R->M | Destroy a webview |
| `Webview_Navigate` | R->M | Navigate webview to URL |
| `Webview_InjectCSS` | R->M | Inject CSS into webview |
| `Webview_ExecuteJS` | R->M | Execute JavaScript in webview |

#### StoreSync Domain (4 channels) -- Owner: F001-core-platform

| Channel | Direction | Description |
|---------|-----------|-------------|
| `StoreSync_GetState` | R->M | Get synchronized store state |
| `StoreSync_SetState` | R->M | Set store state (broadcast) |
| `StoreSync_Subscribe` | R->M | Subscribe to state changes |
| `StoreSync_Dispatch` | R->M | Dispatch action across windows |

#### FileService Domain (4 channels) -- Owner: F010-auxiliary-features

| Channel | Direction | Description |
|---------|-----------|-------------|
| `FileService_ParseDocument` | R->M | Parse document (PDF, DOCX, etc.) |
| `FileService_ExtractText` | R->M | Extract text from document |
| `FileService_ConvertFormat` | R->M | Convert between file formats |
| `FileService_GetSupportedFormats` | R->M | List supported document formats |

#### System Domain (8 channels) -- Owner: F001-core-platform

| Channel | Direction | Description |
|---------|-----------|-------------|
| `System_GetLocale` | R->M | Get system locale |
| `System_GetPlatform` | R->M | Get OS platform |
| `System_GetArch` | R->M | Get CPU architecture |
| `System_GetMemory` | R->M | Get available memory info |
| `System_GetCPU` | R->M | Get CPU info |
| `System_GetHostname` | R->M | Get machine hostname |
| `System_IsDarkMode` | R->M | Check OS dark mode state |
| `System_GetDisplays` | R->M | Get connected display info |

#### Remaining Small Domains

**Config (2 channels) -- Owner: F001-core-platform**

| Channel | Direction | Description |
|---------|-----------|-------------|
| `Config_Get` | R->M | Read electron-store configuration value |
| `Config_Set` | R->M | Write electron-store configuration value |

**Notification (2 channels) -- Owner: F001-core-platform**

| Channel | Direction | Description |
|---------|-----------|-------------|
| `Notification_Show` | R->M | Show system notification |
| `Notification_Clear` | R->M | Clear notifications |

**Open (2 channels) -- Owner: F001-core-platform**

| Channel | Direction | Description |
|---------|-----------|-------------|
| `Open_Url` | R->M | Open external URL in default browser |
| `Open_Path` | R->M | Open path in OS file manager |

**AES (2 channels) -- Owner: F001-core-platform**

| Channel | Direction | Description |
|---------|-----------|-------------|
| `AES_Encrypt` | R->M | AES-256 encrypt a string |
| `AES_Decrypt` | R->M | AES-256 decrypt a string |

**Zip (2 channels) -- Owner: F001-core-platform**

| Channel | Direction | Description |
|---------|-----------|-------------|
| `Zip_Compress` | R->M | Create ZIP archive |
| `Zip_Decompress` | R->M | Extract ZIP archive |

**AgentMessage (2 channels) -- Owner: F012-agent-framework**

| Channel | Direction | Description |
|---------|-----------|-------------|
| `AgentMessage_Send` | R->M | Send message to agent |
| `AgentMessage_Stream` | M->R | Stream agent response |

**AgentToolPermission (3 channels) -- Owner: F012-agent-framework**

| Channel | Direction | Description |
|---------|-----------|-------------|
| `AgentToolPermission_Request` | M->R | Request tool permission from user |
| `AgentToolPermission_Grant` | R->M | Grant tool permission |
| `AgentToolPermission_Deny` | R->M | Deny tool permission |

**VertexAI (3 channels) -- Owner: F002-provider-management**

| Channel | Direction | Description |
|---------|-----------|-------------|
| `VertexAI_GetAccessToken` | R->M | Get Vertex AI access token |
| `VertexAI_ValidateServiceAccount` | R->M | Validate GCP service account |
| `VertexAI_ListModels` | R->M | List available Vertex AI models |

**Nutstore (3 channels) -- Owner: F010-auxiliary-features**

| Channel | Direction | Description |
|---------|-----------|-------------|
| `Nutstore_Upload` | R->M | Upload to Nutstore |
| `Nutstore_Download` | R->M | Download from Nutstore |
| `Nutstore_List` | R->M | List Nutstore contents |

**SearchWindow (3 channels) -- Owner: F010-auxiliary-features**

| Channel | Direction | Description |
|---------|-----------|-------------|
| `SearchWindow_Show` | R->M | Show spotlight-like search window |
| `SearchWindow_Hide` | R->M | Hide search window |
| `SearchWindow_Query` | R->M | Execute search query |

**Obsidian (2 channels) -- Owner: F010-auxiliary-features**

| Channel | Direction | Description |
|---------|-----------|-------------|
| `Obsidian_Export` | R->M | Export to Obsidian vault |
| `Obsidian_Validate` | R->M | Validate Obsidian vault path |

**OCR (2 channels) -- Owner: F010-auxiliary-features**

| Channel | Direction | Description |
|---------|-----------|-------------|
| `OCR_Recognize` | R->M | Run OCR on an image |
| `OCR_GetLanguages` | R->M | List supported OCR languages |

**Shortcuts (1 channel) -- Owner: F001-core-platform**

| Channel | Direction | Description |
|---------|-----------|-------------|
| `Shortcuts_Register` | R->M | Register/update global keyboard shortcuts |

**Export (1 channel) -- Owner: F010-auxiliary-features**

| Channel | Direction | Description |
|---------|-----------|-------------|
| `Export_Markdown` | R->M | Export conversation as markdown |

**ExternalApps (1 channel) -- Owner: F010-auxiliary-features**

| Channel | Direction | Description |
|---------|-----------|-------------|
| `ExternalApps_Launch` | R->M | Launch external application |

**Minapp (1 channel) -- Owner: F010-auxiliary-features**

| Channel | Direction | Description |
|---------|-----------|-------------|
| `Minapp_Launch` | R->M | Launch mini application |

**Analytics (1 channel) -- Owner: F010-auxiliary-features**

| Channel | Direction | Description |
|---------|-----------|-------------|
| `Analytics_Track` | R->M | Send analytics event (opt-in) |

**Python (1 channel) -- Owner: F012-agent-framework**

| Channel | Direction | Description |
|---------|-----------|-------------|
| `Python_Execute` | R->M | Execute Python code in sandbox |

**CherryAI (1 channel) -- Owner: F002-provider-management**

| Channel | Direction | Description |
|---------|-----------|-------------|
| `CherryAI_Process` | R->M | Internal AI processing pipeline |

**Provider (1 channel) -- Owner: F002-provider-management**

| Channel | Direction | Description |
|---------|-----------|-------------|
| `Provider_Validate` | R->M | Validate provider configuration |

---

### Event-Only Channels (~33 channels, M->R, no handler)

These are one-way events pushed from the main process to the renderer.
They have no request handler -- the main process emits them via `webContents.send()`.

| Channel | Owner Feature | Description |
|---------|---------------|-------------|
| `BackupProgress` | F007-backup-sync | Backup operation progress updates |
| `RestoreProgress` | F007-backup-sync | Restore operation progress updates |
| `ThemeUpdated` | F001-core-platform | OS or app theme changed |
| `UpdateAvailable` | F001-core-platform | App update is available |
| `UpdateProgress` | F001-core-platform | Update download progress |
| `UpdateError` | F001-core-platform | Update download/install error |
| `UpdateDownloaded` | F001-core-platform | Update successfully downloaded |
| `WindowFocused` | F001-core-platform | Window gained focus |
| `WindowBlurred` | F001-core-platform | Window lost focus |
| `WindowResized` | F001-core-platform | Window was resized |
| `WindowMoved` | F001-core-platform | Window was moved |
| `DeepLinkReceived` | F001-core-platform | Custom protocol URL received |
| `TrayClicked` | F001-core-platform | Tray icon was clicked |
| `PowerMonitor_Suspend` | F001-core-platform | System entering sleep |
| `PowerMonitor_Resume` | F001-core-platform | System waking from sleep |
| `NetworkStatusChanged` | F001-core-platform | Network connectivity changed |
| `KB_ItemStatus` | F004-knowledge-base | Processing status update (baseId, itemId, status, progress, error?) |
| `KB_DirectoryProgress` | F004-knowledge-base | Directory processing progress (itemId, percent) |
| `Mcp_ServerStatusChanged` | F006-mcp-integration | MCP server status update |
| `Mcp_ToolCallProgress` | F006-mcp-integration | MCP tool call progress |
| `LocalTransfer_Discovered` | F007-backup-sync | Peer discovered on LAN |
| `LocalTransfer_IncomingRequest` | F007-backup-sync | Incoming file transfer request |
| `LocalTransfer_TransferComplete` | F007-backup-sync | File transfer completed |
| `Selection_PopupAction` | F010-auxiliary-features | Selection popup action triggered |
| `OpenClaw_InstallProgress` | F010-auxiliary-features | OpenClaw install progress |
| `OpenClaw_GatewayStatus` | F010-auxiliary-features | OpenClaw gateway status change |
| `ApiServer_RequestLog` | F010-auxiliary-features | API server request log entry |
| `AgentMessage_ToolCall` | F012-agent-framework | Agent is executing a tool call |
| `AgentMessage_Complete` | F012-agent-framework | Agent finished processing |
| `ClaudeCode_Output` | F012-agent-framework | Claude Code session output |
| `ClaudeCode_Error` | F012-agent-framework | Claude Code session error |
| `CherryIN_SyncEvent` | F002-provider-management | Cloud sync event notification |
| `Copilot_SuggestionReady` | F002-provider-management | Copilot suggestion available |

---

## Part 2: HTTP REST Endpoints

The built-in API server is an Express app running inside the Electron main process,
exposed on a configurable local port. All non-public endpoints require a Bearer token.

Total endpoints: **24** (4 public + 20 authenticated)

---

### Public Endpoints (4)

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| GET | `/` | Root landing page; returns HTML welcome/info page | `text/html` |
| GET | `/health` | Health check endpoint | `{ "status": "ok", "version": "<app-version>" }` |
| GET | `/api-docs` | Swagger UI for interactive API documentation | `text/html` (Swagger UI) |
| GET | `/api-docs.json` | OpenAPI 3.0 specification in JSON | `application/json` (OpenAPI spec) |

---

### Chat Endpoint (1) -- Owner: F010-auxiliary-features

#### POST /v1/chat/completions

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | OpenAI-compatible chat completions endpoint. Proxies requests to the configured provider. Supports streaming via SSE. |
| Source | `src/main/server/routes/chat.ts` |

**Request Body:**

```json
{
  "model": "string (required)",
  "messages": [
    { "role": "system|user|assistant", "content": "string" }
  ],
  "temperature": "number (optional, 0-2)",
  "top_p": "number (optional, 0-1)",
  "max_tokens": "number (optional)",
  "stream": "boolean (optional, default: false)",
  "stop": "string[] (optional)",
  "tools": "Tool[] (optional)",
  "tool_choice": "string|object (optional)"
}
```

**Response (non-streaming):**

```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "string",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "string" },
      "finish_reason": "stop|length|tool_calls"
    }
  ],
  "usage": {
    "prompt_tokens": 0,
    "completion_tokens": 0,
    "total_tokens": 0
  }
}
```

**Response (streaming):** SSE stream of `data: {...}` chunks following OpenAI format.

---

### Messages Endpoints (2) -- Owner: F010-auxiliary-features

#### POST /v1/messages

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | Anthropic-compatible messages endpoint. Creates a message using the Anthropic wire format. |
| Source | `src/main/server/routes/messages.ts` |

**Request Body:**

```json
{
  "model": "string (required)",
  "messages": [
    { "role": "user|assistant", "content": "string|ContentBlock[]" }
  ],
  "system": "string (optional)",
  "max_tokens": "number (required)",
  "temperature": "number (optional)",
  "stream": "boolean (optional)",
  "tools": "Tool[] (optional)",
  "tool_choice": "object (optional)"
}
```

**Response:** Anthropic Messages API format.

#### POST /:provider_id/v1/messages

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | Provider-scoped Anthropic messages endpoint. Routes to a specific provider by ID. |
| Source | `src/main/server/routes/messages.ts` |

**Request/Response:** Same as `POST /v1/messages`, but uses the specified provider's configuration.

---

### Models Endpoint (1) -- Owner: F010-auxiliary-features

#### GET /v1/models

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | Lists all available models across all enabled providers. OpenAI-compatible format. |
| Source | `src/main/server/routes/models.ts` |

**Response:**

```json
{
  "object": "list",
  "data": [
    {
      "id": "string",
      "object": "model",
      "created": 0,
      "owned_by": "string (provider name)"
    }
  ]
}
```

---

### MCP Endpoints (3) -- Owner: F006-mcp-integration

#### GET /v1/mcps

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | Lists all configured MCP servers and their status |
| Source | `src/main/server/routes/mcp.ts` |

**Response:**

```json
{
  "servers": [
    {
      "id": "string",
      "name": "string",
      "type": "stdio|sse|streamable-http|inMemory",
      "isActive": true,
      "tools": ["tool-name-1", "tool-name-2"]
    }
  ]
}
```

#### GET /v1/mcps/:server_id

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | Gets details for a specific MCP server including tools, prompts, resources |
| Source | `src/main/server/routes/mcp.ts` |

**Response:**

```json
{
  "id": "string",
  "name": "string",
  "type": "string",
  "isActive": true,
  "tools": [{ "name": "string", "description": "string", "inputSchema": {} }],
  "prompts": [{ "name": "string", "description": "string" }],
  "resources": [{ "uri": "string", "name": "string" }]
}
```

#### ALL /v1/mcps/:server_id/mcp

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | MCP protocol proxy. Forwards all HTTP methods to the MCP server's transport layer, enabling direct MCP protocol communication. |
| Source | `src/main/server/routes/mcp.ts` |

**Request/Response:** Raw MCP protocol messages (JSON-RPC 2.0 over HTTP).

---

### Agent Endpoints (6) -- Owner: F012-agent-framework

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/v1/agents` | Create a new agent | Bearer token |
| GET | `/v1/agents` | List all agents | Bearer token |
| GET | `/v1/agents/:id` | Get agent by ID | Bearer token |
| PUT | `/v1/agents/:id` | Full replacement update | Bearer token |
| PATCH | `/v1/agents/:id` | Partial update | Bearer token |
| DELETE | `/v1/agents/:id` | Delete agent and all sessions/messages | Bearer token |

**POST /v1/agents Request Body:**

```json
{
  "name": "string (required)",
  "type": "string (required)",
  "model": "string (optional)",
  "prompt": "string (optional)",
  "accessible_paths": "string[] (optional)",
  "mcps": "string[] (optional)",
  "settings": "object (optional)"
}
```

**POST Response:** `201 Created` with full Agent object.
**GET (list) Response:** `{ "agents": Agent[] }`
**GET (single) Response:** Agent object or `404`.
**PUT/PATCH Response:** Updated Agent object.
**DELETE Response:** `204 No Content`.

---

### Session Endpoints (6) -- Owner: F012-agent-framework

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/v1/agents/:agentId/sessions` | Create session for agent | Bearer token |
| GET | `/v1/agents/:agentId/sessions` | List all sessions | Bearer token |
| GET | `/v1/agents/:agentId/sessions/:id` | Get session with messages | Bearer token |
| PUT | `/v1/agents/:agentId/sessions/:id` | Full replacement update | Bearer token |
| PATCH | `/v1/agents/:agentId/sessions/:id` | Partial update | Bearer token |
| DELETE | `/v1/agents/:agentId/sessions/:id` | Delete session and messages | Bearer token |

**POST Request Body:**

```json
{
  "name": "string (optional, auto-generated if omitted)",
  "model": "string (optional, inherits from agent)"
}
```

**POST Response:** `201 Created` with Session object.
**GET (list) Response:** `{ "sessions": Session[] }`
**GET (single) Response:** Session object with `messages` array.
**DELETE Response:** `204 No Content`.

---

### Session Message Endpoints (2) -- Owner: F012-agent-framework

#### POST /v1/agents/:agentId/sessions/:sessionId/messages

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | Send a message in a session. Triggers agent processing and returns assistant response. Supports streaming via SSE. |
| Source | `src/main/server/routes/session-messages.ts` |

**Request Body:**

```json
{
  "content": "string (required)",
  "role": "user (default)",
  "stream": "boolean (optional, default: false)"
}
```

**Response (non-streaming):** SessionMessage object with assistant response.
**Response (streaming):** SSE stream of message chunks.

#### DELETE /v1/agents/:agentId/sessions/:sessionId/messages

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | Clear all messages in a session |
| Source | `src/main/server/routes/session-messages.ts` |

**Response:** `204 No Content`.

---

## Part 3: Preload API Surface (~240 methods)

The preload script exposes a `window.api` object via Electron's `contextBridge.exposeInMainWorld()`.
Each method maps 1:1 to an IPC channel handler (invoke/send pattern).

The preload API is organized into the same domain namespaces as IPC channels:

| Namespace | Method Count | Example Methods |
|-----------|-------------|-----------------|
| `window.api.app` | ~47 | `getInfo()`, `quit()`, `reload()`, `setTheme()`, `clearCache()` |
| `window.api.file` | ~40 | `open()`, `save()`, `read()`, `write()`, `delete()`, `download()` |
| `window.api.backup` | ~19 | `backup()`, `restore()`, `backupToWebdav()`, `restoreFromWebdav()` |
| `window.api.mcp` | ~18 | `addServer()`, `removeServer()`, `listTools()`, `callTool()` |
| `window.api.selection` | ~17 | `textSelected()`, `setEnabled()`, `translate()`, `explain()` |
| `window.api.openClaw` | ~17 | `checkInstalled()`, `install()`, `startGateway()`, `search()` |
| `window.api.trace` | ~13 | `saveData()`, `getData()`, `start()`, `stop()`, `export()` |
| `window.api.memory` | ~12 | `add()`, `search()`, `list()`, `delete()`, `update()` |
| `window.api.window` | ~11 | `minimize()`, `maximize()`, `close()`, `create()` |
| `window.api.localTransfer` | ~9 | `connect()`, `sendFile()`, `discover()`, `accept()` |
| `window.api.system` | ~8 | `getLocale()`, `getPlatform()`, `getArch()`, `getMemory()` |
| `window.api.ovms` | ~8 | `isSupported()`, `addModel()`, `start()`, `listModels()` |
| `window.api.knowledgeBase` | ~7 | `create()`, `search()`, `addItem()`, `removeItem()` |
| `window.api.claudeCode` | ~7 | `install()`, `listInstalled()`, `startSession()`, `sendMessage()` |
| `window.api.copilot` | ~6 | `suggest()`, `accept()`, `dismiss()`, `configure()` |
| `window.api.cherryIn` | ~6 | `login()`, `logout()`, `getUser()`, `syncStatus()` |
| `window.api.anthropicOAuth` | ~6 | `start()`, `refresh()`, `revoke()`, `getToken()` |
| `window.api.apiServer` | ~6 | `start()`, `stop()`, `getStatus()`, `setPort()` |
| `window.api.gemini` | ~5 | `uploadFile()`, `getFile()`, `listFiles()`, `deleteFile()` |
| `window.api.codeTools` | ~5 | `run()`, `lint()`, `format()`, `getLanguages()` |
| `window.api.miniWindow` | ~5 | `show()`, `hide()`, `setContent()`, `setPosition()` |
| `window.api.webview` | ~5 | `create()`, `destroy()`, `navigate()`, `injectCSS()` |
| `window.api.storeSync` | ~4 | `getState()`, `setState()`, `subscribe()`, `dispatch()` |
| `window.api.fileService` | ~4 | `parseDocument()`, `extractText()`, `convertFormat()` |
| `window.api.agentToolPermission` | ~3 | `grant()`, `deny()` |
| `window.api.vertexAI` | ~3 | `getAccessToken()`, `validateServiceAccount()` |
| `window.api.nutstore` | ~3 | `upload()`, `download()`, `list()` |
| `window.api.searchWindow` | ~3 | `show()`, `hide()`, `query()` |
| `window.api.config` | 2 | `get()`, `set()` |
| `window.api.notification` | 2 | `show()`, `clear()` |
| `window.api.open` | 2 | `url()`, `path()` |
| `window.api.aes` | 2 | `encrypt()`, `decrypt()` |
| `window.api.zip` | 2 | `compress()`, `decompress()` |
| `window.api.agentMessage` | 2 | `send()` |
| `window.api.obsidian` | 2 | `export()`, `validate()` |
| `window.api.ocr` | 2 | `recognize()`, `getLanguages()` |
| `window.api.shortcuts` | 1 | `register()` |
| `window.api.export` | 1 | `markdown()` |
| `window.api.externalApps` | 1 | `launch()` |
| `window.api.minapp` | 1 | `launch()` |
| `window.api.analytics` | 1 | `track()` |
| `window.api.python` | 1 | `execute()` |
| `window.api.cherryAI` | 1 | `process()` |
| `window.api.provider` | 1 | `validate()` |

Additionally, the preload exposes event listener registration methods (`.on()` / `.off()`) for the ~33 M->R event channels.

---

## Part 4: Cross-Feature API Dependencies

This table shows which features depend on APIs owned by other features.

| Consumer Feature | Consumed API | Owner Feature | Type | Description |
|-----------------|-------------|---------------|------|-------------|
| F005-ai-chat | `Mcp_CallTool`, `Mcp_ListTools` | F006-mcp-integration | IPC | Chat invokes/discovers MCP tools during generation |
| F005-ai-chat | `KnowledgeBase_Search` | F004-knowledge-base | IPC | RAG retrieval during message generation |
| F005-ai-chat | `Memory_Search`, `Memory_Add` | F011-memory-system | IPC | Memory recall/extraction during conversations |
| F005-ai-chat | `File_Read`, `File_Base64Encode` | F001-core-platform | IPC | Read file attachments for upload |
| F005-ai-chat | `Selection_*` | F010-auxiliary-features | IPC | Text selection actions trigger chat |
| F004-knowledge-base | `File_Read`, `File_Hash` | F001-core-platform | IPC | Read documents for indexing |
| F004-knowledge-base | Provider API (embedding) | F002-provider-management | Internal | Calls embedding models for vectorization |
| F006-mcp-integration | `File_*` | F001-core-platform | IPC | MCP servers may need filesystem access |
| F007-backup-sync | `File_Compress`, `File_Decompress` | F001-core-platform | IPC | Archive operations for backups |
| F008-settings-ui | `Config_Get`, `Config_Set` | F001-core-platform | IPC | Read/write persistent settings |
| F008-settings-ui | `App_SetTheme` | F001-core-platform | IPC | Apply theme changes |
| F008-settings-ui | `Shortcuts_Register` | F001-core-platform | IPC | Register keyboard shortcuts |
| F009-notes-editor | `File_Write`, `File_Read` | F001-core-platform | IPC | Persist notes to filesystem |
| F009-notes-editor | `Obsidian_Export` | F010-auxiliary-features | IPC | Export notes to Obsidian |
| F010-auxiliary-features | Provider API (generation) | F002-provider-management | Internal | Translation, painting use provider models |
| F011-memory-system | Provider API (extraction) | F002-provider-management | Internal | Uses LLM for memory extraction |
| F011-memory-system | KnowledgeBase embedding infra | F004-knowledge-base | Internal | Reuses embedding config and infrastructure |
| F012-agent-framework | `Mcp_CallTool` | F006-mcp-integration | IPC | Agent invokes MCP tools |
| F012-agent-framework | `AgentMessage_*` | F012-agent-framework (self) | IPC | Agent message handling |
| F012-agent-framework | `ClaudeCodePlugin_*` | F012-agent-framework (self) | IPC | Claude Code plugin integration |
| F012-agent-framework | `POST /v1/chat/completions` | F010-auxiliary-features (API server) | REST | Agent uses chat completions API |
| F001-core-platform | `StoreSync_*` | F001-core-platform (self) | IPC | Cross-window state sync |

---

## Part 5: API Authentication Summary

| Layer | Mechanism | Details |
|-------|-----------|---------|
| REST API | Bearer Token | Configured via settings; checked by Express middleware on all `/v1/*` routes |
| IPC | Implicit | Electron IPC is trusted (same-origin renderer to main process) |
| WebDAV | Basic Auth | Username + password from WebDavConfig |
| Nutstore | Token Auth | App-specific token from NutstoreConfig |
| Anthropic OAuth | OAuth 2.0 | PKCE flow with refresh tokens |
| Vertex AI | Service Account | GCP service account key JSON |
| CherryIN | Session Token | Proprietary auth for Cherry Studio cloud services |
| Copilot | OAuth | Microsoft OAuth for Copilot integration |

---

## Part 6: Rate Limiting and Throttling

| Scope | Mechanism | Configuration |
|-------|-----------|---------------|
| Provider-level | Concurrent request limiter | `Provider.rateLimit` field (per provider) |
| API Server | Express rate-limit middleware | Configurable via settings |
| MCP Tool Calls | Sequential per server | One tool call at a time per MCP server |
| Knowledge Indexing | Queue-based | 30 concurrent items, 80MB workload cap |
| Memory Extraction | Debounced | Triggered after conversation idle period |

---

*End of API Registry*
