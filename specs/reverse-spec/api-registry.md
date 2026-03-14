# Angdu Studio - API Registry

> Reverse-spec Phase 4 deliverable. Extracted from Cherry Studio `IpcChannel.ts` and API server routes.

---

## Part 1: IPC Channels (Main <-> Renderer)

### F001-shell: App & Window Management

| Channel | IPC Value | Direction | Description |
|---------|-----------|-----------|-------------|
| App_Info | `app:info` | Renderer -> Main | Get AppInfo (version, paths, arch) |
| App_Reload | `app:reload` | Renderer -> Main | Reload window |
| App_Quit | `app:quit` | Renderer -> Main | Quit application |
| App_RelaunchApp | `app:relaunch-app` | Renderer -> Main | Relaunch application |
| App_ResetData | `app:reset-data` | Renderer -> Main | Reset all data |
| App_SetStopQuitApp | `app:set-stop-quit-app` | Renderer -> Main | Prevent quit |
| App_SetFullScreen | `app:set-full-screen` | Renderer -> Main | Toggle fullscreen |
| App_IsFullScreen | `app:is-full-screen` | Renderer -> Main | Check fullscreen |
| App_Proxy | `app:proxy` | Renderer -> Main | Set proxy config |
| App_SetLaunchOnBoot | `app:set-launch-on-boot` | Renderer -> Main | Set auto-launch |
| App_SetLaunchToTray | `app:set-launch-to-tray` | Renderer -> Main | Set tray launch |
| App_SetTray | `app:set-tray` | Renderer -> Main | Toggle tray icon |
| App_SetTrayOnClose | `app:set-tray-on-close` | Renderer -> Main | Minimize to tray on close |
| App_GetCacheSize | `app:get-cache-size` | Renderer -> Main | Get cache size |
| App_ClearCache | `app:clear-cache` | Renderer -> Main | Clear cache |
| App_SetAppDataPath | `app:set-app-data-path` | Renderer -> Main | Set custom data path |
| App_GetDataPathFromArgs | `app:get-data-path-from-args` | Renderer -> Main | Get data path from CLI args |
| App_FlushAppData | `app:flush-app-data` | Renderer -> Main | Flush data to disk |
| App_HasWritePermission | `app:has-write-permission` | Renderer -> Main | Check write permission |
| App_ResolvePath | `app:resolve-path` | Renderer -> Main | Resolve file path |
| App_IsPathInside | `app:is-path-inside` | Renderer -> Main | Check path containment |
| App_Copy | `app:copy` | Renderer -> Main | Copy to clipboard |
| App_GetDiskInfo | `app:get-disk-info` | Renderer -> Main | Get disk space info |
| App_GetSystemFonts | `app:get-system-fonts` | Renderer -> Main | List system fonts |
| App_GetIpCountry | `app:get-ip-country` | Renderer -> Main | Detect IP country |
| App_LogToMain | `app:log-to-main` | Renderer -> Main | Log from renderer |
| App_SaveData | `app:save-data` | Renderer -> Main | Save data to disk |
| App_IsNotEmptyDir | `app:is-not-empty-dir` | Renderer -> Main | Check directory not empty |
| App_Select | `app:select` | Renderer -> Main | Show selection dialog |
| App_SetDisableHardwareAcceleration | `app:set-disable-hardware-acceleration` | Renderer -> Main | Toggle HW acceleration |
| App_SetUseSystemTitleBar | `app:set-use-system-title-bar` | Renderer -> Main | Toggle system titlebar (Linux) |
| App_QuoteToMain | `app:quote-to-main` | Renderer -> Main | Quote text to main process |
| App_HandleZoomFactor | `app:handle-zoom-factor` | Renderer -> Main | Set zoom level |
| App_MacIsProcessTrusted | `app:mac-is-process-trusted` | Renderer -> Main | macOS accessibility check |
| App_MacRequestProcessTrust | `app:mac-request-process-trust` | Renderer -> Main | macOS accessibility request |
| Windows_Minimize | `window:minimize` | Renderer -> Main | Minimize window |
| Windows_Maximize | `window:maximize` | Renderer -> Main | Maximize window |
| Windows_Unmaximize | `window:unmaximize` | Renderer -> Main | Restore window |
| Windows_Close | `window:close` | Renderer -> Main | Close window |
| Windows_IsMaximized | `window:is-maximized` | Renderer -> Main | Check maximized |
| Windows_MaximizedChanged | `window:maximized-changed` | Main -> Renderer | Maximized state change event |
| Windows_Resize | `window:resize` | Renderer -> Main | Resize window |
| Windows_GetSize | `window:get-size` | Renderer -> Main | Get window size |
| Windows_SetMinimumSize | `window:set-minimum-size` | Renderer -> Main | Set min size |
| Windows_ResetMinimumSize | `window:reset-minimum-size` | Renderer -> Main | Reset min size |
| Windows_NavigateToAbout | `window:navigate-to-about` | Renderer -> Main | Navigate to about page |
| MiniWindow_Show | `miniwindow:show` | Renderer -> Main | Show mini window |
| MiniWindow_Hide | `miniwindow:hide` | Renderer -> Main | Hide mini window |
| MiniWindow_Close | `miniwindow:close` | Renderer -> Main | Close mini window |
| MiniWindow_Toggle | `miniwindow:toggle` | Renderer -> Main | Toggle mini window |
| MiniWindow_SetPin | `miniwindow:set-pin` | Renderer -> Main | Pin mini window |
| Notification_Send | `notification:send` | Renderer -> Main | Send system notification |
| Notification_OnClick | `notification:on-click` | Main -> Renderer | Notification click event |
| Webview_SetOpenLinkExternal | `webview:set-open-link-external` | Renderer -> Main | Open links externally |
| Webview_SearchHotkey | `webview:search-hotkey` | Main -> Renderer | Trigger search hotkey |
| Webview_PrintToPDF | `webview:print-to-pdf` | Renderer -> Main | Print to PDF |
| Webview_SaveAsHTML | `webview:save-as-html` | Renderer -> Main | Save as HTML |
| Open_Path | `open:path` | Renderer -> Main | Open file in OS |
| Open_Website | `open:website` | Renderer -> Main | Open URL in browser |
| Minapp | `minapp` | Renderer -> Main | Open mini-app |
| Config_Set | `config:set` | Renderer -> Main | Set config value |
| Config_Get | `config:get` | Renderer -> Main | Get config value |
| ReduxStoreReady | `redux-store-ready` | Renderer -> Main | Store initialized signal |
| FullscreenStatusChanged | `fullscreen-status-changed` | Main -> Renderer | Fullscreen state event |

### F001-shell: Binary Management

| Channel | IPC Value | Direction | Description |
|---------|-----------|-----------|-------------|
| App_IsBinaryExist | `app:is-binary-exist` | Renderer -> Main | Check if binary exists |
| App_GetBinaryPath | `app:get-binary-path` | Renderer -> Main | Get binary path |
| App_InstallUvBinary | `app:install-uv-binary` | Renderer -> Main | Install uv binary |
| App_InstallBunBinary | `app:install-bun-binary` | Renderer -> Main | Install bun binary |
| App_InstallOvmsBinary | `app:install-ovms-binary` | Renderer -> Main | Install OVMS binary |

### F001-shell: Encryption

| Channel | IPC Value | Direction | Description |
|---------|-----------|-----------|-------------|
| Aes_Encrypt | `aes:encrypt` | Renderer -> Main | AES encrypt data |
| Aes_Decrypt | `aes:decrypt` | Renderer -> Main | AES decrypt data |

### F002-i18n-theme: Theme & Language

| Channel | IPC Value | Direction | Description |
|---------|-----------|-----------|-------------|
| App_SetLanguage | `app:set-language` | Renderer -> Main | Set UI language |
| App_SetTheme | `app:set-theme` | Renderer -> Main | Set theme mode |
| App_SetEnableSpellCheck | `app:set-enable-spell-check` | Renderer -> Main | Toggle spell check |
| App_SetSpellCheckLanguages | `app:set-spell-check-languages` | Renderer -> Main | Set spell check languages |
| ThemeUpdated | `theme:updated` | Main -> Renderer | Theme change event |

### F003-providers: Provider Management

| Channel | IPC Value | Direction | Description |
|---------|-----------|-----------|-------------|
| Provider_AddKey | `provider:add-key` | Renderer -> Main | Store provider API key |

### F003-providers: Gemini File Management

| Channel | IPC Value | Direction | Description |
|---------|-----------|-----------|-------------|
| Gemini_UploadFile | `gemini:upload-file` | Renderer -> Main | Upload file to Gemini |
| Gemini_Base64File | `gemini:base64-file` | Renderer -> Main | Get base64 file for Gemini |
| Gemini_RetrieveFile | `gemini:retrieve-file` | Renderer -> Main | Retrieve uploaded file |
| Gemini_ListFiles | `gemini:list-files` | Renderer -> Main | List uploaded files |
| Gemini_DeleteFile | `gemini:delete-file` | Renderer -> Main | Delete uploaded file |

### F003-providers: VertexAI

| Channel | IPC Value | Direction | Description |
|---------|-----------|-----------|-------------|
| VertexAI_GetAuthHeaders | `vertexai:get-auth-headers` | Renderer -> Main | Get auth headers |
| VertexAI_GetAccessToken | `vertexai:get-access-token` | Renderer -> Main | Get access token |
| VertexAI_ClearAuthCache | `vertexai:clear-auth-cache` | Renderer -> Main | Clear auth cache |

### F003-providers: OAuth

| Channel | IPC Value | Direction | Description |
|---------|-----------|-----------|-------------|
| Copilot_GetAuthMessage | `copilot:get-auth-message` | Renderer -> Main | GitHub Copilot auth |
| Copilot_GetCopilotToken | `copilot:get-copilot-token` | Renderer -> Main | Get Copilot token |
| Copilot_SaveCopilotToken | `copilot:save-copilot-token` | Renderer -> Main | Save Copilot token |
| Copilot_GetToken | `copilot:get-token` | Renderer -> Main | Get cached token |
| Copilot_Logout | `copilot:logout` | Renderer -> Main | Logout Copilot |
| Copilot_GetUser | `copilot:get-user` | Renderer -> Main | Get Copilot user info |
| Anthropic_StartOAuthFlow | `anthropic:start-oauth-flow` | Renderer -> Main | Start Anthropic OAuth |
| Anthropic_CompleteOAuthWithCode | `anthropic:complete-oauth-with-code` | Renderer -> Main | Complete OAuth |
| Anthropic_CancelOAuthFlow | `anthropic:cancel-oauth-flow` | Renderer -> Main | Cancel OAuth |
| Anthropic_GetAccessToken | `anthropic:get-access-token` | Renderer -> Main | Get access token |
| Anthropic_HasCredentials | `anthropic:has-credentials` | Renderer -> Main | Check credentials |
| Anthropic_ClearCredentials | `anthropic:clear-credentials` | Renderer -> Main | Clear credentials |
| CherryIN_SaveToken | `cherryin:save-token` | Renderer -> Main | Save CherryIN token |
| CherryIN_HasToken | `cherryin:has-token` | Renderer -> Main | Check token exists |
| CherryIN_GetBalance | `cherryin:get-balance` | Renderer -> Main | Get account balance |
| CherryIN_Logout | `cherryin:logout` | Renderer -> Main | CherryIN logout |
| CherryIN_StartOAuthFlow | `cherryin:start-oauth-flow` | Renderer -> Main | Start OAuth |
| CherryIN_ExchangeToken | `cherryin:exchange-token` | Renderer -> Main | Exchange auth code for token |

### F005-chat: Agent Messages (Claude Code)

| Channel | IPC Value | Direction | Description |
|---------|-----------|-----------|-------------|
| AgentMessage_PersistExchange | `agent-message:persist-exchange` | Renderer -> Main | Save agent message exchange |
| AgentMessage_GetHistory | `agent-message:get-history` | Renderer -> Main | Get agent message history |
| AgentToolPermission_Request | `agent-tool-permission:request` | Main -> Renderer | Request tool permission |
| AgentToolPermission_Response | `agent-tool-permission:response` | Renderer -> Main | Respond to permission |
| AgentToolPermission_Result | `agent-tool-permission:result` | Main -> Renderer | Permission result |

### F005-chat: Memory

| Channel | IPC Value | Direction | Description |
|---------|-----------|-----------|-------------|
| Memory_Add | `memory:add` | Renderer -> Main | Add memory |
| Memory_Search | `memory:search` | Renderer -> Main | Search memories |
| Memory_List | `memory:list` | Renderer -> Main | List memories |
| Memory_Delete | `memory:delete` | Renderer -> Main | Delete memory |
| Memory_Update | `memory:update` | Renderer -> Main | Update memory |
| Memory_Get | `memory:get` | Renderer -> Main | Get specific memory |
| Memory_SetConfig | `memory:set-config` | Renderer -> Main | Set memory config |
| Memory_DeleteUser | `memory:delete-user` | Renderer -> Main | Delete user memories |
| Memory_DeleteAllMemoriesForUser | `memory:delete-all-memories-for-user` | Renderer -> Main | Delete all user memories |
| Memory_GetUsersList | `memory:get-users-list` | Renderer -> Main | List memory users |
| Memory_MigrateMemoryDb | `memory:migrate-memory-db` | Renderer -> Main | Migrate memory DB |

### F006-settings: Shortcuts & Updates

| Channel | IPC Value | Direction | Description |
|---------|-----------|-----------|-------------|
| Shortcuts_Update | `shortcuts:update` | Renderer -> Main | Update keyboard shortcuts |
| App_CheckForUpdate | `app:check-for-update` | Renderer -> Main | Check for updates |
| App_QuitAndInstall | `app:quit-and-install` | Renderer -> Main | Quit and install update |
| App_SetAutoUpdate | `app:set-auto-update` | Renderer -> Main | Toggle auto-update |
| App_SetTestPlan | `app:set-test-plan` | Renderer -> Main | Toggle test plan |
| App_SetTestChannel | `app:set-test-channel` | Renderer -> Main | Set update channel |
| UpdateError | `update-error` | Main -> Renderer | Update error event |
| UpdateAvailable | `update-available` | Main -> Renderer | Update available event |
| UpdateNotAvailable | `update-not-available` | Main -> Renderer | No update event |
| DownloadProgress | `download-progress` | Main -> Renderer | Download progress event |
| UpdateDownloaded | `update-downloaded` | Main -> Renderer | Download complete event |
| DownloadUpdate | `download-update` | Renderer -> Main | Start download |

### F007-knowledge: Knowledge Base

| Channel | IPC Value | Direction | Description |
|---------|-----------|-----------|-------------|
| KnowledgeBase_Create | `knowledge-base:create` | Renderer -> Main | Create knowledge base |
| KnowledgeBase_Reset | `knowledge-base:reset` | Renderer -> Main | Reset knowledge base |
| KnowledgeBase_Delete | `knowledge-base:delete` | Renderer -> Main | Delete knowledge base |
| KnowledgeBase_Add | `knowledge-base:add` | Renderer -> Main | Add item to knowledge base |
| KnowledgeBase_Remove | `knowledge-base:remove` | Renderer -> Main | Remove item |
| KnowledgeBase_Search | `knowledge-base:search` | Renderer -> Main | Search knowledge base |
| KnowledgeBase_Rerank | `knowledge-base:rerank` | Renderer -> Main | Rerank search results |

### F008-mcp: MCP Server Management

| Channel | IPC Value | Direction | Description |
|---------|-----------|-----------|-------------|
| Mcp_AddServer | `mcp:add-server` | Renderer -> Main | Add MCP server |
| Mcp_RemoveServer | `mcp:remove-server` | Renderer -> Main | Remove MCP server |
| Mcp_RestartServer | `mcp:restart-server` | Renderer -> Main | Restart MCP server |
| Mcp_StopServer | `mcp:stop-server` | Renderer -> Main | Stop MCP server |
| Mcp_ListTools | `mcp:list-tools` | Renderer -> Main | List available tools |
| Mcp_CallTool | `mcp:call-tool` | Renderer -> Main | Invoke tool |
| Mcp_AbortTool | `mcp:abort-tool` | Renderer -> Main | Abort tool call |
| Mcp_ListPrompts | `mcp:list-prompts` | Renderer -> Main | List MCP prompts |
| Mcp_GetPrompt | `mcp:get-prompt` | Renderer -> Main | Get prompt content |
| Mcp_ListResources | `mcp:list-resources` | Renderer -> Main | List resources |
| Mcp_GetResource | `mcp:get-resource` | Renderer -> Main | Get resource content |
| Mcp_GetInstallInfo | `mcp:get-install-info` | Renderer -> Main | Get install info |
| Mcp_CheckConnectivity | `mcp:check-connectivity` | Renderer -> Main | Check server connectivity |
| Mcp_UploadDxt | `mcp:upload-dxt` | Renderer -> Main | Upload DXT package |
| Mcp_GetServerVersion | `mcp:get-server-version` | Renderer -> Main | Get server version |
| Mcp_GetServerLogs | `mcp:get-server-logs` | Renderer -> Main | Get server logs |
| Mcp_ServersChanged | `mcp:servers-changed` | Main -> Renderer | Servers changed event |
| Mcp_ServersUpdated | `mcp:servers-updated` | Main -> Renderer | Servers updated event |
| Mcp_Progress | `mcp:progress` | Main -> Renderer | Operation progress event |
| Mcp_ServerLog | `mcp:server-log` | Main -> Renderer | Server log event |

### F009-notes: File Operations for Notes

| Channel | IPC Value | Direction | Description |
|---------|-----------|-----------|-------------|
| File_ValidateNotesDirectory | `file:validateNotesDirectory` | Renderer -> Main | Validate notes dir |
| File_BatchUploadMarkdown | `file:batchUploadMarkdown` | Renderer -> Main | Batch import markdown |

### F010-files: File Management

| Channel | IPC Value | Direction | Description |
|---------|-----------|-----------|-------------|
| File_Open | `file:open` | Renderer -> Main | Open file |
| File_OpenPath | `file:openPath` | Renderer -> Main | Open file at path |
| File_Save | `file:save` | Renderer -> Main | Save file |
| File_Select | `file:select` | Renderer -> Main | File selection dialog |
| File_Upload | `file:upload` | Renderer -> Main | Upload file |
| File_Clear | `file:clear` | Renderer -> Main | Clear files |
| File_Read | `file:read` | Renderer -> Main | Read file |
| File_ReadExternal | `file:readExternal` | Renderer -> Main | Read external file |
| File_Delete | `file:delete` | Renderer -> Main | Delete file |
| File_DeleteDir | `file:deleteDir` | Renderer -> Main | Delete directory |
| File_Move | `file:move` | Renderer -> Main | Move file |
| File_MoveDir | `file:moveDir` | Renderer -> Main | Move directory |
| File_Rename | `file:rename` | Renderer -> Main | Rename file |
| File_RenameDir | `file:renameDir` | Renderer -> Main | Rename directory |
| File_Get | `file:get` | Renderer -> Main | Get file metadata |
| File_SelectFolder | `file:selectFolder` | Renderer -> Main | Folder selection dialog |
| File_CreateTempFile | `file:createTempFile` | Renderer -> Main | Create temp file |
| File_Mkdir | `file:mkdir` | Renderer -> Main | Create directory |
| File_Write | `file:write` | Renderer -> Main | Write file |
| File_WriteWithId | `file:writeWithId` | Renderer -> Main | Write file with ID |
| File_SaveImage | `file:saveImage` | Renderer -> Main | Save image |
| File_Base64Image | `file:base64Image` | Renderer -> Main | Get base64 image |
| File_SaveBase64Image | `file:saveBase64Image` | Renderer -> Main | Save base64 as image |
| File_SavePastedImage | `file:savePastedImage` | Renderer -> Main | Save pasted image |
| File_Download | `file:download` | Renderer -> Main | Download file |
| File_Copy | `file:copy` | Renderer -> Main | Copy file |
| File_BinaryImage | `file:binaryImage` | Renderer -> Main | Get binary image |
| File_Base64File | `file:base64File` | Renderer -> Main | Get base64 file |
| File_GetPdfInfo | `file:getPdfInfo` | Renderer -> Main | Get PDF metadata |
| File_ShowInFolder | `file:showInFolder` | Renderer -> Main | Show in file manager |
| File_IsTextFile | `file:isTextFile` | Renderer -> Main | Check if text file |
| File_IsDirectory | `file:isDirectory` | Renderer -> Main | Check if directory |
| File_ListDirectory | `file:listDirectory` | Renderer -> Main | List directory contents |
| File_GetDirectoryStructure | `file:getDirectoryStructure` | Renderer -> Main | Get directory tree |
| File_CheckFileName | `file:checkFileName` | Renderer -> Main | Validate file name |
| File_StartWatcher | `file:startWatcher` | Renderer -> Main | Start file watcher |
| File_StopWatcher | `file:stopWatcher` | Renderer -> Main | Stop file watcher |
| File_PauseWatcher | `file:pauseWatcher` | Renderer -> Main | Pause file watcher |
| File_ResumeWatcher | `file:resumeWatcher` | Renderer -> Main | Resume file watcher |
| File_OpenWithRelativePath | `file:openWithRelativePath` | Renderer -> Main | Open by relative path |
| Fs_Read | `fs:read` | Renderer -> Main | Raw FS read |
| Fs_ReadText | `fs:readText` | Renderer -> Main | Read as text |
| FileService_Upload | `file-service:upload` | Renderer -> Main | Upload to file service |
| FileService_List | `file-service:list` | Renderer -> Main | List file service files |
| FileService_Delete | `file-service:delete` | Renderer -> Main | Delete from file service |
| FileService_Retrieve | `file-service:retrieve` | Renderer -> Main | Retrieve from file service |
| DirectoryProcessingPercent | `directory-processing-percent` | Main -> Renderer | Directory processing progress |

### F011-tools: Code, OCR, Python

| Channel | IPC Value | Direction | Description |
|---------|-----------|-----------|-------------|
| Python_Execute | `python:execute` | Renderer -> Main | Execute Python code |
| CodeTools_Run | `code-tools:run` | Renderer -> Main | Run code tool |
| CodeTools_GetAvailableTerminals | `code-tools:get-available-terminals` | Renderer -> Main | List terminals |
| CodeTools_SetCustomTerminalPath | `code-tools:set-custom-terminal-path` | Renderer -> Main | Set terminal path |
| CodeTools_GetCustomTerminalPath | `code-tools:get-custom-terminal-path` | Renderer -> Main | Get terminal path |
| CodeTools_RemoveCustomTerminalPath | `code-tools:remove-custom-terminal-path` | Renderer -> Main | Remove custom path |
| OCR_ocr | `ocr:ocr` | Renderer -> Main | Perform OCR |
| OCR_ListProviders | `ocr:list-providers` | Renderer -> Main | List OCR providers |

### F012-infra: Backup & Restore

| Channel | IPC Value | Direction | Description |
|---------|-----------|-----------|-------------|
| Backup_Backup | `backup:backup` | Renderer -> Main | Create local backup |
| Backup_Restore | `backup:restore` | Renderer -> Main | Restore from backup |
| Backup_BackupToWebdav | `backup:backupToWebdav` | Renderer -> Main | Backup to WebDAV |
| Backup_RestoreFromWebdav | `backup:restoreFromWebdav` | Renderer -> Main | Restore from WebDAV |
| Backup_ListWebdavFiles | `backup:listWebdavFiles` | Renderer -> Main | List WebDAV backups |
| Backup_CheckConnection | `backup:checkConnection` | Renderer -> Main | Test WebDAV connection |
| Backup_CreateDirectory | `backup:createDirectory` | Renderer -> Main | Create WebDAV directory |
| Backup_DeleteWebdavFile | `backup:deleteWebdavFile` | Renderer -> Main | Delete WebDAV backup |
| Backup_BackupToLocalDir | `backup:backupToLocalDir` | Renderer -> Main | Backup to local dir |
| Backup_RestoreFromLocalBackup | `backup:restoreFromLocalBackup` | Renderer -> Main | Restore local backup |
| Backup_ListLocalBackupFiles | `backup:listLocalBackupFiles` | Renderer -> Main | List local backups |
| Backup_DeleteLocalBackupFile | `backup:deleteLocalBackupFile` | Renderer -> Main | Delete local backup |
| Backup_BackupToS3 | `backup:backupToS3` | Renderer -> Main | Backup to S3 |
| Backup_RestoreFromS3 | `backup:restoreFromS3` | Renderer -> Main | Restore from S3 |
| Backup_ListS3Files | `backup:listS3Files` | Renderer -> Main | List S3 backups |
| Backup_DeleteS3File | `backup:deleteS3File` | Renderer -> Main | Delete S3 backup |
| Backup_CheckS3Connection | `backup:checkS3Connection` | Renderer -> Main | Test S3 connection |
| Backup_CreateLanTransferBackup | `backup:createLanTransferBackup` | Renderer -> Main | Create LAN transfer backup |
| Backup_DeleteTempBackup | `backup:deleteTempBackup` | Renderer -> Main | Delete temp backup |
| BackupProgress | `backup-progress` | Main -> Renderer | Backup progress event |
| RestoreProgress | `restore-progress` | Main -> Renderer | Restore progress event |

### F012-infra: LAN Transfer

| Channel | IPC Value | Direction | Description |
|---------|-----------|-----------|-------------|
| LocalTransfer_ListServices | `local-transfer:list` | Renderer -> Main | List LAN services |
| LocalTransfer_StartScan | `local-transfer:start-scan` | Renderer -> Main | Start scanning |
| LocalTransfer_StopScan | `local-transfer:stop-scan` | Renderer -> Main | Stop scanning |
| LocalTransfer_ServicesUpdated | `local-transfer:services-updated` | Main -> Renderer | Services updated event |
| LocalTransfer_Connect | `local-transfer:connect` | Renderer -> Main | Connect to peer |
| LocalTransfer_Disconnect | `local-transfer:disconnect` | Renderer -> Main | Disconnect |
| LocalTransfer_ClientEvent | `local-transfer:client-event` | Main -> Renderer | Transfer event |
| LocalTransfer_SendFile | `local-transfer:send-file` | Renderer -> Main | Send file |
| LocalTransfer_CancelTransfer | `local-transfer:cancel-transfer` | Renderer -> Main | Cancel transfer |

### F012-infra: API Server

| Channel | IPC Value | Direction | Description |
|---------|-----------|-----------|-------------|
| ApiServer_Start | `api-server:start` | Renderer -> Main | Start API server |
| ApiServer_Stop | `api-server:stop` | Renderer -> Main | Stop API server |
| ApiServer_Restart | `api-server:restart` | Renderer -> Main | Restart API server |
| ApiServer_GetStatus | `api-server:get-status` | Renderer -> Main | Get server status |
| ApiServer_Ready | `api-server:ready` | Main -> Renderer | Server ready event |
| ApiServer_GetConfig | `api-server:get-config` | Renderer -> Main | Get server config |

### F012-infra: Selection Toolbar

| Channel | IPC Value | Direction | Description |
|---------|-----------|-----------|-------------|
| Selection_TextSelected | `selection:text-selected` | Main -> Renderer | Text selected event |
| Selection_ToolbarHide | `selection:toolbar-hide` | Renderer -> Main | Hide toolbar |
| Selection_ToolbarVisibilityChange | `selection:toolbar-visibility-change` | Main -> Renderer | Visibility event |
| Selection_ToolbarDetermineSize | `selection:toolbar-determine-size` | Renderer -> Main | Determine toolbar size |
| Selection_WriteToClipboard | `selection:write-to-clipboard` | Renderer -> Main | Write to clipboard |
| Selection_SetEnabled | `selection:set-enabled` | Renderer -> Main | Enable/disable |
| Selection_SetTriggerMode | `selection:set-trigger-mode` | Renderer -> Main | Set trigger mode |
| Selection_SetFilterMode | `selection:set-filter-mode` | Renderer -> Main | Set filter mode |
| Selection_SetFilterList | `selection:set-filter-list` | Renderer -> Main | Set filter list |
| Selection_SetFollowToolbar | `selection:set-follow-toolbar` | Renderer -> Main | Set follow mode |
| Selection_SetRemeberWinSize | `selection:set-remeber-win-size` | Renderer -> Main | Remember window size |
| Selection_ActionWindowClose | `selection:action-window-close` | Renderer -> Main | Close action window |
| Selection_ActionWindowMinimize | `selection:action-window-minimize` | Renderer -> Main | Minimize action window |
| Selection_ActionWindowPin | `selection:action-window-pin` | Renderer -> Main | Pin action window |
| Selection_ActionWindowResize | `selection:action-window-resize` | Renderer -> Main | Resize action window |
| Selection_ProcessAction | `selection:process-action` | Renderer -> Main | Process action |
| Selection_UpdateActionData | `selection:update-action-data` | Main -> Renderer | Update action data |

### F012-infra: Search Window

| Channel | IPC Value | Direction | Description |
|---------|-----------|-----------|-------------|
| SearchWindow_Open | `search-window:open` | Renderer -> Main | Open search window |
| SearchWindow_Close | `search-window:close` | Renderer -> Main | Close search window |
| SearchWindow_OpenUrl | `search-window:open-url` | Renderer -> Main | Open URL in search window |

### F012-infra: Store Sync

| Channel | IPC Value | Direction | Description |
|---------|-----------|-----------|-------------|
| StoreSync_Subscribe | `store-sync:subscribe` | Renderer -> Main | Subscribe to sync |
| StoreSync_Unsubscribe | `store-sync:unsubscribe` | Renderer -> Main | Unsubscribe |
| StoreSync_OnUpdate | `store-sync:on-update` | Main -> Renderer | Sync update event |
| StoreSync_BroadcastSync | `store-sync:broadcast-sync` | Renderer -> Main | Broadcast sync |

### F012-infra: System & Misc

| Channel | IPC Value | Direction | Description |
|---------|-----------|-----------|-------------|
| System_GetDeviceType | `system:getDeviceType` | Renderer -> Main | Get device type |
| System_GetHostname | `system:getHostname` | Renderer -> Main | Get hostname |
| System_GetCpuName | `system:getCpuName` | Renderer -> Main | Get CPU name |
| System_CheckGitBash | `system:checkGitBash` | Renderer -> Main | Check Git Bash |
| System_GetGitBashPath | `system:getGitBashPath` | Renderer -> Main | Get Git Bash path |
| System_SetGitBashPath | `system:setGitBashPath` | Renderer -> Main | Set Git Bash path |
| System_ToggleDevTools | `system:toggleDevTools` | Renderer -> Main | Toggle DevTools |
| Export_Word | `export:word` | Renderer -> Main | Export to Word |
| Zip_Compress | `zip:compress` | Renderer -> Main | Compress files |
| Zip_Decompress | `zip:decompress` | Renderer -> Main | Decompress files |
| ExternalApps_DetectInstalled | `external-apps:detect-installed` | Renderer -> Main | Detect installed apps |

### Excluded from Angdu Studio (Cherry-specific)

The following IPC channels are Cherry Studio-specific integrations that will not be carried over:
- `Obsidian_*` - Obsidian vault integration
- `Nutstore_*` - Nutstore (Chinese cloud storage)
- `CherryIN_*` - CherryIN OAuth/billing
- `Cherryai_*` - CherryAI signatures
- `Copilot_*` - GitHub Copilot integration
- `OpenClaw_*` - OpenClaw gateway
- `ClaudeCodePlugin_*` - Claude Code plugin system
- `Ovms_*` - OpenVINO Model Server
- `TRACE_*` - Trace analytics
- `Analytics_*` - Usage analytics

---

## Part 2: REST API Endpoints (Express API Server - F012-infra)

The API Server exposes an OpenAI-compatible REST API at `http://{host}:{port}`.

### Authentication

All endpoints require `Authorization: Bearer {apiKey}` header.

### Chat Completions

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/chat/completions` | OpenAI-compatible chat completion (streaming and non-streaming) |

**Request**: `ChatCompletionCreateParams` (OpenAI format)
**Response**: Standard OpenAI chat completion response or SSE stream

### Messages (Anthropic-compatible)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/messages` | Anthropic-compatible message creation (model format: `provider:model_id`) |
| POST | `/{provider_id}/v1/messages` | Message creation with provider in URL path |

**Request**: `MessageCreateParams` (Anthropic format)
**Response**: Anthropic message response or SSE stream

### Models

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/models` | List available models with optional filtering |

**Query Params**: `providerType`, `offset`, `limit`
**Response**: `{ object: 'list', data: Model[], total, offset, limit }`

### MCP Servers

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/mcps` | List all MCP servers |
| GET | `/v1/mcps/{server_id}` | Get MCP server info |
| ALL | `/v1/mcps/{server_id}/mcp` | MCP protocol proxy (JSON-RPC) |

### Agents (Claude Code)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/agents` | Create agent |
| GET | `/agents` | List agents (paginated) |
| GET | `/agents/{agentId}` | Get agent by ID |
| PUT | `/agents/{agentId}` | Replace agent (full update) |
| PATCH | `/agents/{agentId}` | Update agent (partial) |
| DELETE | `/agents/{agentId}` | Delete agent |

### Sessions

| Method | Path | Description |
|--------|------|-------------|
| POST | `/agents/{agentId}/sessions` | Create session |
| GET | `/agents/{agentId}/sessions` | List sessions (paginated) |
| GET | `/agents/{agentId}/sessions/{sessionId}` | Get session |
| PUT | `/agents/{agentId}/sessions/{sessionId}` | Replace session |
| PATCH | `/agents/{agentId}/sessions/{sessionId}` | Update session |
| DELETE | `/agents/{agentId}/sessions/{sessionId}` | Delete session |

### Session Messages

| Method | Path | Description |
|--------|------|-------------|
| POST | `/agents/{agentId}/sessions/{sessionId}/messages` | Create message |
| DELETE | `/agents/{agentId}/sessions/{sessionId}/messages/{messageId}` | Delete message |

---

## IPC Channel Summary by Feature

| Feature | Channel Count | Key Prefixes |
|---------|--------------|-------------|
| F001-shell | ~55 | `app:*`, `window:*`, `miniwindow:*`, `open:*`, `config:*`, `notification:*`, `aes:*` |
| F002-i18n-theme | ~4 | `app:set-language`, `app:set-theme`, `app:set-*-spell-check*`, `theme:*` |
| F003-providers | ~18 | `provider:*`, `gemini:*`, `vertexai:*`, `copilot:*`, `anthropic:*`, `cherryin:*` |
| F005-chat | ~14 | `agent-message:*`, `agent-tool-permission:*`, `memory:*` |
| F006-settings | ~8 | `shortcuts:*`, `app:check-for-update`, `app:quit-and-install`, `update-*`, `download-*` |
| F007-knowledge | ~7 | `knowledge-base:*` |
| F008-mcp | ~17 | `mcp:*` |
| F010-files | ~35 | `file:*`, `fs:*`, `file-service:*` |
| F011-tools | ~7 | `python:*`, `code-tools:*`, `ocr:*` |
| F012-infra | ~35 | `backup:*`, `api-server:*`, `selection:*`, `local-transfer:*`, `search-window:*`, `store-sync:*`, `system:*` |
