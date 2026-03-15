# API Registry — Angdu Studio

> IPC channels extracted from Cherry Studio `src/main/ipc.ts` (1,178 lines)
> Grouped by Feature ownership for the Core rebuild.

---

## IPC Channel Summary

| Feature | Channel Prefix | Count | Direction |
|---------|---------------|-------|-----------|
| F001 Electron Shell | App_* | ~35 | Renderer -> Main |
| F002 Navigation & Layout | Windows_* | ~8 | Bidirectional |
| F003 Theme & Appearance | App_SetTheme, App_HandleZoomFactor, App_GetSystemFonts | 3 | Renderer -> Main |
| F004 Provider Management | Copilot_*, Anthropic_*, VertexAI_*, CherryIN_* | ~15 | Renderer -> Main |
| F005 Model Management | (via Provider APIs, no dedicated IPC) | 0 | — |
| F006 Chat Core | (streaming via Vercel AI SDK, not IPC) | 0 | Renderer-side |
| F007 Settings System | Config_*, App_Set*, Shortcuts_* | ~15 | Renderer -> Main |
| F008 Data & Storage | File_*, Backup_*, Fs_*, Export_*, Zip_* | ~45 | Renderer -> Main |
| F009 i18n | App_SetLanguage | 1 | Renderer -> Main |
| F010 Chat Advanced | (extends F006, no new IPC) | 0 | — |
| F011 Knowledge Base | KnowledgeBase_* | 7 | Renderer -> Main |
| F012 MCP Integration | Mcp_*, Mcp_UploadDxt | ~15 | Renderer -> Main |

---

## F001 — Electron Shell

| Channel | Handler | Description |
|---------|---------|-------------|
| `App_Info` | handle | Returns app version, paths, arch, isPackaged, isPortable |
| `App_Reload` | handle | Reload main window |
| `App_Quit` | handle | Quit application |
| `App_QuitAndInstall` | handle | Auto-update: quit and install |
| `App_CheckForUpdate` | handle | Check for available updates |
| `App_SetFullScreen` | handle | Toggle fullscreen mode |
| `App_IsFullScreen` | handle | Query fullscreen state |
| `App_RelaunchApp` | handle | Relaunch with optional args (handles AppImage, Portable) |
| `App_ResetData` | handle | Factory reset: close connections, delete data dir |
| `App_SetStopQuitApp` | handle | Prevent quit during critical operations |
| `App_CrashRenderProcess` | handle | Force crash renderer (debug) |
| `App_GetDiskInfo` | handle | Check disk space for given path |
| `App_SaveData` | send | Main -> Renderer: signal to save data before quit |
| `Open_Website` | handle | Open URL in external browser |
| `Open_Path` | handle | Open file system path |
| `System_GetDeviceType` | handle | Returns device type |
| `System_GetHostname` | handle | Returns hostname |
| `System_GetCpuName` | handle | Returns CPU name |
| `System_ToggleDevTools` | handle | Toggle DevTools |

## F002 — Navigation & Layout

| Channel | Handler | Description |
|---------|---------|-------------|
| `Windows_Minimize` | handle | Minimize main window |
| `Windows_Maximize` | handle | Maximize main window |
| `Windows_Unmaximize` | handle | Unmaximize main window |
| `Windows_Close` | handle | Close main window |
| `Windows_IsMaximized` | handle | Query maximized state |
| `Windows_GetSize` | handle | Get window dimensions |
| `Windows_SetMinimumSize` | handle | Set minimum window size |
| `Windows_ResetMinimumSize` | handle | Reset to default minimum |
| `Windows_MaximizedChanged` | send | Main -> Renderer: maximize state changed |

## F003 — Theme & Appearance

| Channel | Handler | Description |
|---------|---------|-------------|
| `App_SetTheme` | handle | Set theme mode (dark/light/system) |
| `App_HandleZoomFactor` | handle | Adjust zoom factor, returns new value |
| `App_GetSystemFonts` | handle | List available system fonts |

## F004 — Provider Management

| Channel | Handler | Description |
|---------|---------|-------------|
| `Copilot_GetAuthMessage` | handle | GitHub Copilot OAuth device code |
| `Copilot_GetCopilotToken` | handle | Exchange device code for token |
| `Copilot_SaveCopilotToken` | handle | Persist Copilot token |
| `Copilot_GetToken` | handle | Retrieve saved token |
| `Copilot_Logout` | handle | Clear Copilot credentials |
| `Copilot_GetUser` | handle | Get Copilot user info |
| `Anthropic_StartOAuthFlow` | handle | Begin Anthropic OAuth |
| `Anthropic_CompleteOAuthWithCode` | handle | Complete OAuth with auth code |
| `Anthropic_CancelOAuthFlow` | handle | Cancel in-progress OAuth |
| `Anthropic_GetAccessToken` | handle | Get valid access token |
| `Anthropic_HasCredentials` | handle | Check if credentials exist |
| `Anthropic_ClearCredentials` | handle | Remove Anthropic credentials |
| `VertexAI_GetAuthHeaders` | handle | Get Vertex AI auth headers |
| `VertexAI_GetAccessToken` | handle | Get Vertex AI access token |
| `VertexAI_ClearAuthCache` | handle | Clear Vertex auth cache |

## F007 — Settings System

| Channel | Handler | Description |
|---------|---------|-------------|
| `Config_Set` | handle | Set config key-value (with optional notify) |
| `Config_Get` | handle | Get config value by key |
| `App_Proxy` | handle | Configure proxy (system/custom/none) |
| `App_SetLaunchOnBoot` | handle | Toggle auto-launch |
| `App_SetLaunchToTray` | handle | Toggle launch-to-tray |
| `App_SetTray` | handle | Toggle tray icon |
| `App_SetTrayOnClose` | handle | Toggle close-to-tray |
| `App_SetAutoUpdate` | handle | Toggle auto-update |
| `App_SetEnableSpellCheck` | handle | Toggle spell check |
| `App_SetSpellCheckLanguages` | handle | Set spell check languages |
| `App_SetDisableHardwareAcceleration` | handle | Toggle hardware acceleration |
| `App_SetUseSystemTitleBar` | handle | Toggle system vs custom titlebar |
| `Shortcuts_Update` | handle | Register/update keyboard shortcuts |
| `Notification_Send` | handle | Send OS notification |

## F008 — Data & Storage

### File Operations

| Channel | Handler | Description |
|---------|---------|-------------|
| `File_Open` | handle | Open file in default app |
| `File_Save` | handle | Save file to disk |
| `File_Select` | handle | Show file picker dialog |
| `File_Upload` | handle | Upload file to managed storage |
| `File_Read` | handle | Read managed file contents |
| `File_Delete` | handle | Delete managed file |
| `File_Move` | handle | Move file |
| `File_Rename` | handle | Rename file |
| `File_Get` | handle | Get file metadata |
| `File_Download` | handle | Download file from URL |
| `File_Copy` | handle | Copy file |
| `File_Write` | handle | Write content to file |
| `File_SaveImage` | handle | Save image file |
| `File_Base64Image` | handle | Convert image to base64 |
| `File_SavePastedImage` | handle | Save pasted image from clipboard |
| `File_GetPdfInfo` | handle | Get PDF page count |
| `File_SelectFolder` | handle | Show folder picker |
| `File_CreateTempFile` | handle | Create temporary file |
| `File_Mkdir` | handle | Create directory |
| `File_IsTextFile` | handle | Check if file is text |
| `File_IsDirectory` | handle | Check if path is directory |
| `File_ListDirectory` | handle | List directory contents |
| `File_ShowInFolder` | handle | Show file in OS file manager |
| `File_BatchUploadMarkdown` | handle | Batch upload markdown files |

### Backup Operations

| Channel | Handler | Description |
|---------|---------|-------------|
| `Backup_Backup` | handle | Create local backup (ZIP) |
| `Backup_Restore` | handle | Restore from local backup |
| `Backup_BackupToLocalDir` | handle | Backup to specified directory |
| `Backup_RestoreFromLocalBackup` | handle | Restore from directory backup |
| `Backup_ListLocalBackupFiles` | handle | List local backup files |
| `Backup_DeleteLocalBackupFile` | handle | Delete local backup file |

### Other Data

| Channel | Handler | Description |
|---------|---------|-------------|
| `Fs_Read` | handle | Raw file system read |
| `Fs_ReadText` | handle | Read text file with encoding detection |
| `Export_Word` | handle | Export to Word format |
| `Zip_Compress` | handle | Compress text |
| `Zip_Decompress` | handle | Decompress buffer |
| `App_ClearCache` | handle | Clear all caches |
| `App_GetCacheSize` | handle | Get cache size in MB |
| `Aes_Encrypt` | handle | AES encrypt text |
| `Aes_Decrypt` | handle | AES decrypt text |

## F009 — i18n

| Channel | Handler | Description |
|---------|---------|-------------|
| `App_SetLanguage` | handle | Set app language, persists to config |

## F011 — Knowledge Base

| Channel | Handler | Description |
|---------|---------|-------------|
| `KnowledgeBase_Create` | handle | Create new KB with embedding config |
| `KnowledgeBase_Reset` | handle | Reset KB (clear all items) |
| `KnowledgeBase_Delete` | handle | Delete KB and all items |
| `KnowledgeBase_Add` | handle | Add item to KB (file/URL/note/sitemap/directory) |
| `KnowledgeBase_Remove` | handle | Remove item from KB |
| `KnowledgeBase_Search` | handle | Vector similarity search |
| `KnowledgeBase_Rerank` | handle | Re-rank search results |

## F012 — MCP Integration

| Channel | Handler | Description |
|---------|---------|-------------|
| `Mcp_RemoveServer` | handle | Remove MCP server |
| `Mcp_RestartServer` | handle | Restart MCP server |
| `Mcp_StopServer` | handle | Stop MCP server |
| `Mcp_ListTools` | handle | List available tools for a server |
| `Mcp_CallTool` | handle | Execute a tool call |
| `Mcp_AbortTool` | handle | Abort running tool |
| `Mcp_ListPrompts` | handle | List server prompts |
| `Mcp_GetPrompt` | handle | Get specific prompt |
| `Mcp_ListResources` | handle | List server resources |
| `Mcp_GetResource` | handle | Get specific resource |
| `Mcp_GetInstallInfo` | handle | Get server install info |
| `Mcp_CheckConnectivity` | handle | Check server connectivity |
| `Mcp_GetServerVersion` | handle | Get server version |
| `Mcp_GetServerLogs` | handle | Get server logs |
| `Mcp_UploadDxt` | handle | Upload and install DXT package |

---

## Cross-Feature API Dependencies

| Consumer Feature | Depends On | API Contract |
|-----------------|------------|--------------|
| F006 Chat Core | F004 Provider | Provider config for API calls |
| F006 Chat Core | F005 Model | Selected model for streaming |
| F006 Chat Core | F008 Data | File read/write for attachments |
| F010 Chat Advanced | F006 Chat Core | Message/block creation APIs |
| F010 Chat Advanced | F012 MCP | Tool call/response handling |
| F011 Knowledge Base | F005 Model | Embedding model selection |
| F011 Knowledge Base | F008 Data | File ingestion |
| F012 MCP Integration | F008 Data | DXT file handling |

---

## Express API Endpoints (Future — API Server Feature, Not in Core)

Cherry Studio includes an API server (`src/main/apiServer/`) that exposes OpenAI-compatible endpoints. This is **not in Core scope** but noted for future reference:

- `POST /v1/chat/completions` — OpenAI-compatible chat
- `GET /v1/models` — List available models
- `POST /v1/embeddings` — Generate embeddings
