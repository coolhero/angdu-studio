# API Registry

**Source**: /Users/coolhero/Develop/cherry-studio
**Generated**: 2026-03-13
**Total Endpoints**: 233 (IPC: 209, REST: 24)

---

## IPC Channel Index

| # | Channel | Direction | Feature | Description |
|---|---------|-----------|---------|-------------|
| 1 | App_Info | R→M | F001 | Get app version, paths, arch info |
| 2 | App_Proxy | R→M | F001 | Configure proxy settings (system/custom/direct) |
| 3 | App_Reload | R→M | F001 | Reload main window |
| 4 | App_Quit | R→M | F001 | Quit application |
| 5 | Open_Website | R→M | F001 | Open external URL in system browser |
| 6 | App_QuitAndInstall | R→M | F001 | Quit app and install update |
| 7 | App_SetLanguage | R→M | F003 | Set application language |
| 8 | App_SetEnableSpellCheck | R→M | F003 | Enable/disable spell check for all webviews |
| 9 | App_SetSpellCheckLanguages | R→M | F003 | Set spell check languages |
| 10 | App_SetLaunchOnBoot | R→M | F003 | Set auto-launch on system boot |
| 11 | App_SetLaunchToTray | R→M | F003 | Set launch-to-tray behavior |
| 12 | App_SetTray | R→M | F003 | Enable/disable system tray |
| 13 | App_SetTrayOnClose | R→M | F003 | Set minimize-to-tray on close |
| 14 | App_SetAutoUpdate | R→M | F003 | Enable/disable auto-update |
| 15 | App_SetTestPlan | R→M | F003 | Toggle test plan mode |
| 16 | App_SetTestChannel | R→M | F003 | Set upgrade channel (stable/beta) |
| 17 | AgentMessage_PersistExchange | R→M | F005 | Persist agent session message exchange |
| 18 | AgentMessage_GetHistory | R→M | F005 | Get agent session message history |
| 19 | App_MacIsProcessTrusted | R→M | F001 | Check macOS accessibility trust (mac only) |
| 20 | App_MacRequestProcessTrust | R→M | F001 | Request macOS accessibility trust (mac only) |
| 21 | App_SetFullScreen | R→M | F001 | Set fullscreen mode |
| 22 | App_IsFullScreen | R→M | F001 | Check if fullscreen |
| 23 | App_GetSystemFonts | R→M | F001 | List system fonts |
| 24 | App_GetIpCountry | R→M | F001 | Get IP geolocation country |
| 25 | Config_Set | R→M | F003 | Set config key-value pair |
| 26 | Config_Get | R→M | F003 | Get config value by key |
| 27 | App_SetTheme | R→M | F003 | Set theme mode (light/dark/system) |
| 28 | App_HandleZoomFactor | R→M | F003 | Adjust zoom factor (delta/reset) |
| 29 | App_ClearCache | R→M | F001 | Clear all session caches and temp files |
| 30 | App_GetCacheSize | R→M | F001 | Get cache directory size in MB |
| 31 | App_SetStopQuitApp | R→M | F001 | Prevent/allow app quit (for active operations) |
| 32 | App_Select | R→M | F001 | Show native file/folder open dialog |
| 33 | App_HasWritePermission | R→M | F001 | Check write permission on path |
| 34 | App_ResolvePath | R→M | F001 | Resolve and untildify file path |
| 35 | App_IsPathInside | R→M | F001 | Check parent-child path relationship |
| 36 | App_SetAppDataPath | R→M | F003 | Set custom app data storage path |
| 37 | App_GetDataPathFromArgs | R→M | F001 | Get data path from CLI args |
| 38 | App_FlushAppData | R→M | F001 | Flush all session storage data |
| 39 | App_IsNotEmptyDir | R→M | F001 | Check if directory is non-empty |
| 40 | App_Copy | R→M | F001 | Copy directory tree (with exclusions) |
| 41 | App_RelaunchApp | R→M | F001 | Relaunch app (Linux/Win special handling) |
| 42 | App_ResetData | R→M | F001 | Factory reset - delete all data |
| 43 | App_CheckForUpdate | R→M | F001 | Check for app updates |
| 44 | Notification_Send | R→M | F001 | Send system notification |
| 45 | Notification_OnClick | R→M | F001 | Handle notification click |
| 46 | Zip_Compress | R→M | F001 | Compress text to buffer |
| 47 | Zip_Decompress | R→M | F001 | Decompress buffer to text |
| 48 | System_GetDeviceType | R→M | F001 | Get device type |
| 49 | System_GetHostname | R→M | F001 | Get system hostname |
| 50 | System_GetCpuName | R→M | F001 | Get CPU name |
| 51 | System_CheckGitBash | R→M | F001 | Check Git Bash availability (Win) |
| 52 | System_GetGitBashPath | R→M | F001 | Get configured Git Bash path |
| 53 | System_GetGitBashPathInfo | R→M | F001 | Get Git Bash path with source info |
| 54 | System_SetGitBashPath | R→M | F001 | Set/clear custom Git Bash path |
| 55 | System_ToggleDevTools | R→M | F001 | Toggle DevTools for sender window |
| 56 | Backup_Backup | R→M | F011 | Create local backup archive |
| 57 | Backup_Restore | R→M | F011 | Restore from local backup archive |
| 58 | Backup_BackupToWebdav | R→M | F011 | Backup to WebDAV server |
| 59 | Backup_RestoreFromWebdav | R→M | F011 | Restore from WebDAV server |
| 60 | Backup_ListWebdavFiles | R→M | F011 | List WebDAV backup files |
| 61 | Backup_CheckConnection | R→M | F011 | Check WebDAV connection |
| 62 | Backup_CreateDirectory | R→M | F011 | Create WebDAV directory |
| 63 | Backup_DeleteWebdavFile | R→M | F011 | Delete WebDAV backup file |
| 64 | Backup_BackupToLocalDir | R→M | F011 | Backup to local directory |
| 65 | Backup_RestoreFromLocalBackup | R→M | F011 | Restore from local directory backup |
| 66 | Backup_ListLocalBackupFiles | R→M | F011 | List local backup files |
| 67 | Backup_DeleteLocalBackupFile | R→M | F011 | Delete local backup file |
| 68 | Backup_BackupToS3 | R→M | F011 | Backup to S3-compatible storage |
| 69 | Backup_RestoreFromS3 | R→M | F011 | Restore from S3 storage |
| 70 | Backup_ListS3Files | R→M | F011 | List S3 backup files |
| 71 | Backup_DeleteS3File | R→M | F011 | Delete S3 backup file |
| 72 | Backup_CheckS3Connection | R→M | F011 | Check S3 connection |
| 73 | Backup_CreateLanTransferBackup | R→M | F011 | Create backup for LAN transfer |
| 74 | Backup_DeleteTempBackup | R→M | F011 | Delete temp backup file |
| 75 | File_Open | R→M | F007 | Open file in default app |
| 76 | File_OpenPath | R→M | F007 | Open path in system explorer |
| 77 | File_Save | R→M | F007 | Save file dialog |
| 78 | File_Select | R→M | F007 | Select file dialog |
| 79 | File_Upload | R→M | F007 | Upload file to app storage |
| 80 | File_Clear | R→M | F007 | Clear files |
| 81 | File_Read | R→M | F007 | Read file content |
| 82 | File_ReadExternal | R→M | F007 | Read external file |
| 83 | File_Delete | R→M | F007 | Delete managed file |
| 84 | File_DeleteDir | R→M | F007 | Delete directory |
| 85 | File_DeleteExternalFile | R→M | F007 | Delete external file |
| 86 | File_DeleteExternalDir | R→M | F007 | Delete external directory |
| 87 | File_Move | R→M | F007 | Move file |
| 88 | File_MoveDir | R→M | F007 | Move directory |
| 89 | File_Rename | R→M | F007 | Rename file |
| 90 | File_RenameDir | R→M | F007 | Rename directory |
| 91 | File_Get | R→M | F007 | Get file metadata |
| 92 | File_SelectFolder | R→M | F007 | Select folder dialog |
| 93 | File_CreateTempFile | R→M | F007 | Create temporary file |
| 94 | File_Mkdir | R→M | F007 | Create directory |
| 95 | File_Write | R→M | F007 | Write file content |
| 96 | File_WriteWithId | R→M | F007 | Write file with specific ID |
| 97 | File_SaveImage | R→M | F007 | Save image file |
| 98 | File_Base64Image | R→M | F007 | Get image as base64 |
| 99 | File_SaveBase64Image | R→M | F007 | Save base64-encoded image |
| 100 | File_SavePastedImage | R→M | F007 | Save pasted image from clipboard |
| 101 | File_Base64File | R→M | F007 | Get file as base64 |
| 102 | File_GetPdfInfo | R→M | F007 | Get PDF page count |
| 103 | File_Download | R→M | F007 | Download file from URL |
| 104 | File_Copy | R→M | F007 | Copy file |
| 105 | File_BinaryImage | R→M | F007 | Get image as binary |
| 106 | File_OpenWithRelativePath | R→M | F007 | Open file by relative path |
| 107 | File_IsTextFile | R→M | F007 | Check if file is text |
| 108 | File_IsDirectory | R→M | F007 | Check if path is directory |
| 109 | File_ListDirectory | R→M | F007 | List directory contents |
| 110 | File_GetDirectoryStructure | R→M | F007 | Get recursive directory tree |
| 111 | File_CheckFileName | R→M | F007 | Validate file name |
| 112 | File_ValidateNotesDirectory | R→M | F010 | Validate notes directory structure |
| 113 | File_StartWatcher | R→M | F007 | Start file system watcher |
| 114 | File_StopWatcher | R→M | F007 | Stop file system watcher |
| 115 | File_PauseWatcher | R→M | F007 | Pause file watcher |
| 116 | File_ResumeWatcher | R→M | F007 | Resume file watcher |
| 117 | File_BatchUploadMarkdown | R→M | F007 | Batch upload markdown files |
| 118 | File_ShowInFolder | R→M | F007 | Show file in system file manager |
| 119 | FileService_Upload | R→M | F007 | Upload file to remote provider |
| 120 | FileService_List | R→M | F007 | List files on remote provider |
| 121 | FileService_Delete | R→M | F007 | Delete file from remote provider |
| 122 | FileService_Retrieve | R→M | F007 | Retrieve file from remote provider |
| 123 | Fs_Read | R→M | F007 | Read raw file from filesystem |
| 124 | Fs_ReadText | R→M | F007 | Read text file with auto-encoding detection |
| 125 | Export_Word | R→M | F007 | Export conversation to Word document |
| 126 | Open_Path | R→M | F001 | Open system path |
| 127 | Shortcuts_Update | R→M | F003 | Update keyboard shortcuts |
| 128 | KnowledgeBase_Create | R→M | F009 | Create knowledge base |
| 129 | KnowledgeBase_Reset | R→M | F009 | Reset knowledge base |
| 130 | KnowledgeBase_Delete | R→M | F009 | Delete knowledge base |
| 131 | KnowledgeBase_Add | R→M | F009 | Add item to knowledge base |
| 132 | KnowledgeBase_Remove | R→M | F009 | Remove item from knowledge base |
| 133 | KnowledgeBase_Search | R→M | F009 | Search knowledge base (vector) |
| 134 | KnowledgeBase_Rerank | R→M | F009 | Rerank search results |
| 135 | Memory_Add | R→M | F004 | Add memories from messages |
| 136 | Memory_Search | R→M | F004 | Search memory (vector) |
| 137 | Memory_List | R→M | F004 | List all memories |
| 138 | Memory_Delete | R→M | F004 | Delete memory by ID |
| 139 | Memory_Update | R→M | F004 | Update memory content |
| 140 | Memory_Get | R→M | F004 | Get memory by ID |
| 141 | Memory_SetConfig | R→M | F004 | Set memory embedding config |
| 142 | Memory_DeleteUser | R→M | F004 | Delete user from memory |
| 143 | Memory_DeleteAllMemoriesForUser | R→M | F004 | Delete all memories for user |
| 144 | Memory_GetUsersList | R→M | F004 | Get list of memory users |
| 145 | Memory_MigrateMemoryDb | R→M | F004 | Migrate memory database |
| 146 | Windows_SetMinimumSize | R→M | F001 | Set minimum window size |
| 147 | Windows_ResetMinimumSize | R→M | F001 | Reset to default minimum window size |
| 148 | Windows_GetSize | R→M | F001 | Get current window dimensions |
| 149 | Windows_Minimize | R→M | F001 | Minimize window |
| 150 | Windows_Maximize | R→M | F001 | Maximize window |
| 151 | Windows_Unmaximize | R→M | F001 | Unmaximize window |
| 152 | Windows_Close | R→M | F001 | Close window |
| 153 | Windows_IsMaximized | R→M | F001 | Check if maximized |
| 154 | Windows_MaximizedChanged | M→R | F001 | Notify renderer of maximize state change |
| 155 | App_SaveData | M→R | F001 | Signal renderer to save data before shutdown |
| 156 | VertexAI_GetAuthHeaders | R→M | F004 | Get Vertex AI auth headers |
| 157 | VertexAI_GetAccessToken | R→M | F004 | Get Vertex AI access token |
| 158 | VertexAI_ClearAuthCache | R→M | F004 | Clear Vertex AI auth cache |
| 159 | MiniWindow_Show | R→M | F001 | Show mini/quick assistant window |
| 160 | MiniWindow_Hide | R→M | F001 | Hide mini window |
| 161 | MiniWindow_Close | R→M | F001 | Close mini window |
| 162 | MiniWindow_Toggle | R→M | F001 | Toggle mini window visibility |
| 163 | MiniWindow_SetPin | R→M | F001 | Pin/unpin mini window |
| 164 | Aes_Encrypt | R→M | F001 | AES encrypt text |
| 165 | Aes_Decrypt | R→M | F001 | AES decrypt text |
| 166 | Mcp_RemoveServer | R→M | F008 | Remove MCP server instance |
| 167 | Mcp_RestartServer | R→M | F008 | Restart MCP server |
| 168 | Mcp_StopServer | R→M | F008 | Stop MCP server |
| 169 | Mcp_ListTools | R→M | F008 | List available MCP tools |
| 170 | Mcp_CallTool | R→M | F008 | Call MCP tool with args |
| 171 | Mcp_ListPrompts | R→M | F008 | List MCP prompts |
| 172 | Mcp_GetPrompt | R→M | F008 | Get specific MCP prompt |
| 173 | Mcp_ListResources | R→M | F008 | List MCP resources |
| 174 | Mcp_GetResource | R→M | F008 | Get specific MCP resource |
| 175 | Mcp_GetInstallInfo | R→M | F008 | Get MCP install info |
| 176 | Mcp_CheckConnectivity | R→M | F008 | Check MCP server connectivity |
| 177 | Mcp_AbortTool | R→M | F008 | Abort running MCP tool call |
| 178 | Mcp_GetServerVersion | R→M | F008 | Get MCP server version |
| 179 | Mcp_GetServerLogs | R→M | F008 | Get MCP server logs |
| 180 | Mcp_UploadDxt | R→M | F008 | Upload DXT extension package |
| 181 | Python_Execute | R→M | F012 | Execute Python script |
| 182 | App_IsBinaryExist | R→M | F001 | Check if binary exists in PATH |
| 183 | App_GetBinaryPath | R→M | F001 | Get binary path |
| 184 | App_InstallUvBinary | R→M | F008 | Install uv binary for MCP |
| 185 | App_InstallBunBinary | R→M | F008 | Install bun binary for MCP |
| 186 | App_InstallOvmsBinary | R→M | F004 | Install OVMS binary |
| 187 | Copilot_GetAuthMessage | R→M | F004 | Get GitHub Copilot auth message |
| 188 | Copilot_GetCopilotToken | R→M | F004 | Get Copilot API token |
| 189 | Copilot_SaveCopilotToken | R→M | F004 | Save Copilot token |
| 190 | Copilot_GetToken | R→M | F004 | Get cached Copilot token |
| 191 | Copilot_Logout | R→M | F004 | Logout from Copilot |
| 192 | Copilot_GetUser | R→M | F004 | Get Copilot user info |
| 193 | CherryIN_SaveToken | R→M | F004 | Save CherryIN OAuth token |
| 194 | CherryIN_HasToken | R→M | F004 | Check CherryIN token exists |
| 195 | CherryIN_GetBalance | R→M | F004 | Get CherryIN balance |
| 196 | CherryIN_Logout | R→M | F004 | Logout from CherryIN |
| 197 | CherryIN_StartOAuthFlow | R→M | F004 | Start CherryIN OAuth flow |
| 198 | CherryIN_ExchangeToken | R→M | F004 | Exchange CherryIN auth code for token |
| 199 | Obsidian_GetVaults | R→M | F010 | Get Obsidian vaults list |
| 200 | Obsidian_GetFiles | R→M | F010 | Get files from Obsidian vault |
| 201 | Nutstore_GetSsoUrl | R→M | F011 | Get Nutstore SSO URL |
| 202 | Nutstore_DecryptToken | R→M | F011 | Decrypt Nutstore token |
| 203 | Nutstore_GetDirectoryContents | R→M | F011 | Get Nutstore directory listing |
| 204 | SearchWindow_Open | R→M | F006 | Open search/web window |
| 205 | SearchWindow_Close | R→M | F006 | Close search window |
| 206 | SearchWindow_OpenUrl | R→M | F006 | Open URL in search window |
| 207 | Webview_SetOpenLinkExternal | R→M | F001 | Set webview external link behavior |
| 208 | Webview_SetSpellCheckEnabled | R→M | F001 | Set webview spell check |
| 209 | Webview_PrintToPDF | R→M | F007 | Print webview to PDF |
| 210 | Webview_SaveAsHTML | R→M | F007 | Save webview as HTML |
| 211 | App_QuoteToMain | R→M | F006 | Send quote text to main window |
| 212 | App_SetDisableHardwareAcceleration | R→M | F003 | Toggle hardware acceleration |
| 213 | App_SetUseSystemTitleBar | R→M | F003 | Toggle system title bar |
| 214 | TRACE_SAVE_DATA | R→M | F004 | Save trace spans |
| 215 | TRACE_GET_DATA | R→M | F004 | Get trace spans for topic |
| 216 | TRACE_SAVE_ENTITY | R→M | F004 | Save trace entity |
| 217 | TRACE_GET_ENTITY | R→M | F004 | Get trace entity |
| 218 | TRACE_BIND_TOPIC | R→M | F004 | Bind trace to topic |
| 219 | TRACE_CLEAN_TOPIC | R→M | F004 | Clean trace for topic |
| 220 | TRACE_TOKEN_USAGE | R→M | F004 | Record token usage in trace |
| 221 | TRACE_CLEAN_HISTORY | R→M | F004 | Clean history trace data |
| 222 | TRACE_OPEN_WINDOW | R→M | F004 | Open trace viewer window |
| 223 | TRACE_SET_TITLE | R→M | F004 | Set trace window title |
| 224 | TRACE_ADD_END_MESSAGE | R→M | F004 | Add end message to trace |
| 225 | TRACE_CLEAN_LOCAL_DATA | R→M | F004 | Clean all local trace data |
| 226 | TRACE_ADD_STREAM_MESSAGE | R→M | F004 | Add streaming message to trace |
| 227 | App_GetDiskInfo | R→M | F001 | Get disk space info |
| 228 | ApiServer_Start | R→M | F004 | Start internal API server |
| 229 | ApiServer_Stop | R→M | F004 | Stop internal API server |
| 230 | ApiServer_Restart | R→M | F004 | Restart internal API server |
| 231 | ApiServer_GetStatus | R→M | F004 | Get API server status |
| 232 | ApiServer_GetConfig | R→M | F004 | Get API server config |
| 233 | Anthropic_StartOAuthFlow | R→M | F004 | Start Anthropic OAuth |
| 234 | Anthropic_CompleteOAuthWithCode | R→M | F004 | Complete Anthropic OAuth |
| 235 | Anthropic_CancelOAuthFlow | R→M | F004 | Cancel Anthropic OAuth |
| 236 | Anthropic_GetAccessToken | R→M | F004 | Get Anthropic access token |
| 237 | Anthropic_HasCredentials | R→M | F004 | Check Anthropic credentials |
| 238 | Anthropic_ClearCredentials | R→M | F004 | Clear Anthropic credentials |
| 239 | ExternalApps_DetectInstalled | R→M | F001 | Detect installed external apps |
| 240 | CodeTools_Run | R→M | F012 | Run code tool |
| 241 | CodeTools_GetAvailableTerminals | R→M | F012 | List available terminals |
| 242 | CodeTools_SetCustomTerminalPath | R→M | F012 | Set custom terminal path |
| 243 | CodeTools_GetCustomTerminalPath | R→M | F012 | Get custom terminal path |
| 244 | CodeTools_RemoveCustomTerminalPath | R→M | F012 | Remove custom terminal path |
| 245 | OCR_ocr | R→M | F012 | Perform OCR on file |
| 246 | OCR_ListProviders | R→M | F012 | List OCR providers |
| 247 | Ovms_IsSupported | R→M | F004 | Check OVMS platform support |
| 248 | Ovms_AddModel | R→M | F004 | Add local OVMS model |
| 249 | Ovms_StopAddModel | R→M | F004 | Stop model addition |
| 250 | Ovms_GetModels | R→M | F004 | List OVMS models |
| 251 | Ovms_IsRunning | R→M | F004 | Check OVMS running state |
| 252 | Ovms_GetStatus | R→M | F004 | Get OVMS status |
| 253 | Ovms_RunOVMS | R→M | F004 | Start OVMS server |
| 254 | Ovms_StopOVMS | R→M | F004 | Stop OVMS server |
| 255 | Cherryai_GetSignature | R→M | F004 | Generate CherryAI signature |
| 256 | ClaudeCodePlugin_Install | R→M | F008 | Install Claude Code plugin |
| 257 | ClaudeCodePlugin_Uninstall | R→M | F008 | Uninstall plugin |
| 258 | ClaudeCodePlugin_UninstallPackage | R→M | F008 | Uninstall plugin package |
| 259 | ClaudeCodePlugin_ListInstalled | R→M | F008 | List installed plugins |
| 260 | ClaudeCodePlugin_WriteContent | R→M | F008 | Write plugin content |
| 261 | ClaudeCodePlugin_InstallFromZip | R→M | F008 | Install plugin from ZIP |
| 262 | ClaudeCodePlugin_InstallFromDirectory | R→M | F008 | Install plugin from directory |
| 263 | LocalTransfer_ListServices | R→M | F011 | List LAN transfer services |
| 264 | LocalTransfer_StartScan | R→M | F011 | Start LAN discovery scan |
| 265 | LocalTransfer_StopScan | R→M | F011 | Stop LAN discovery |
| 266 | LocalTransfer_Connect | R→M | F011 | Connect to LAN peer |
| 267 | LocalTransfer_Disconnect | R→M | F011 | Disconnect from LAN peer |
| 268 | LocalTransfer_SendFile | R→M | F011 | Send file to LAN peer |
| 269 | LocalTransfer_CancelTransfer | R→M | F011 | Cancel LAN transfer |
| 270 | APP_CrashRenderProcess | R→M | F001 | Force crash renderer (debug) |
| 271 | OpenClaw_CheckInstalled | R→M | F004 | Check OpenClaw installation |
| 272 | OpenClaw_CheckNodeVersion | R→M | F004 | Check Node.js version |
| 273 | OpenClaw_CheckGitAvailable | R→M | F004 | Check Git availability |
| 274 | OpenClaw_GetNodeDownloadUrl | R→M | F004 | Get Node.js download URL |
| 275 | OpenClaw_GetGitDownloadUrl | R→M | F004 | Get Git download URL |
| 276 | OpenClaw_Install | R→M | F004 | Install OpenClaw |
| 277 | OpenClaw_Uninstall | R→M | F004 | Uninstall OpenClaw |
| 278 | OpenClaw_StartGateway | R→M | F004 | Start OpenClaw gateway |
| 279 | OpenClaw_StopGateway | R→M | F004 | Stop OpenClaw gateway |
| 280 | OpenClaw_RestartGateway | R→M | F004 | Restart OpenClaw gateway |
| 281 | OpenClaw_GetStatus | R→M | F004 | Get OpenClaw status |
| 282 | OpenClaw_CheckHealth | R→M | F004 | Check OpenClaw health |
| 283 | OpenClaw_GetDashboardUrl | R→M | F004 | Get OpenClaw dashboard URL |
| 284 | OpenClaw_SyncConfig | R→M | F004 | Sync provider config to OpenClaw |
| 285 | OpenClaw_GetChannels | R→M | F004 | Get OpenClaw channel status |
| 286 | Analytics_TrackTokenUsage | R→M | F004 | Track token usage analytics |
| 287 | StoreSync_* | bidirectional | F001 | Redux store sync between windows |
| 288 | SelectionAssistant_* | R→M | F001 | Selection assistant handlers |

**Direction Key**: R→M = renderer→main (ipcMain.handle), M→R = main→renderer (webContents.send)

---

## REST Endpoint Index

| # | Method | Path | Feature | Auth | Description |
|---|--------|------|---------|------|-------------|
| 1 | POST | /v1/chat/completions | F004 | API Key | OpenAI-compatible chat completion |
| 2 | POST | /v1/messages | F004 | API Key | Anthropic-format message creation |
| 3 | POST | /:provider_id/v1/messages | F004 | API Key | Message creation with provider in path |
| 4 | GET | /v1/models | F004 | API Key | List available models (with filtering) |
| 5 | GET | /v1/mcps | F008 | API Key | List MCP servers |
| 6 | GET | /v1/mcps/:server_id | F008 | API Key | Get MCP server info |
| 7 | ALL | /v1/mcps/:server_id/mcp | F008 | API Key | MCP protocol proxy (JSON-RPC) |
| 8 | POST | /agents | F005 | API Key | Create agent |
| 9 | GET | /agents | F005 | API Key | List agents (paginated) |
| 10 | GET | /agents/:agentId | F005 | API Key | Get agent by ID |
| 11 | PUT | /agents/:agentId | F005 | API Key | Replace agent (full update) |
| 12 | PATCH | /agents/:agentId | F005 | API Key | Partial update agent |
| 13 | DELETE | /agents/:agentId | F005 | API Key | Delete agent |
| 14 | POST | /agents/:agentId/sessions | F006 | API Key | Create session |
| 15 | GET | /agents/:agentId/sessions | F006 | API Key | List sessions (paginated) |
| 16 | GET | /agents/:agentId/sessions/:sessionId | F006 | API Key | Get session |
| 17 | PUT | /agents/:agentId/sessions/:sessionId | F006 | API Key | Replace session |
| 18 | PATCH | /agents/:agentId/sessions/:sessionId | F006 | API Key | Partial update session |
| 19 | DELETE | /agents/:agentId/sessions/:sessionId | F006 | API Key | Delete session |
| 20 | POST | /agents/:agentId/sessions/:sessionId/messages | F006 | API Key | Create message in session |
| 21 | DELETE | /agents/:agentId/sessions/:sessionId/messages/:messageId | F006 | API Key | Delete message |

---

## IPC Channel Summary by Feature

| Feature | IPC Count | Key Prefixes |
|---------|-----------|--------------|
| F001-app-shell | 62 | App_*, Windows_*, System_*, MiniWindow_*, Aes_*, Zip_*, Notification_*, Open_*, Webview_* |
| F002-navigation | 0 | (handled in renderer store only) |
| F003-settings | 16 | Config_*, App_Set{Theme,Language,SpellCheck,...}, Shortcuts_* |
| F004-ai-engine | 52 | Memory_*, VertexAI_*, TRACE_*, ApiServer_*, Anthropic_*, Copilot_*, CherryIN_*, Ovms_*, OpenClaw_*, Analytics_* |
| F005-assistant | 4 | AgentMessage_*, (REST agents CRUD) |
| F006-chat | 3 | SearchWindow_*, App_QuoteToMain |
| F007-file-management | 50 | File_*, FileService_*, Fs_*, Export_* |
| F008-mcp | 24 | Mcp_*, ClaudeCodePlugin_*, App_Install{Uv,Bun}Binary |
| F009-knowledge-base | 7 | KnowledgeBase_* |
| F010-notes | 3 | File_ValidateNotesDirectory, Obsidian_* |
| F011-data-sync | 26 | Backup_*, LocalTransfer_*, Nutstore_* |
| F012-creative-tools | 6 | Python_Execute, CodeTools_*, OCR_* |

---

## Cross-Feature API Dependencies

| API | Provider | Consumer(s) | Call Purpose |
|-----|----------|-------------|-------------|
| Config_Set / Config_Get | F003-settings | F001, F004, F008 | All features read/write config |
| File_Upload / File_Read | F007-file-management | F006-chat, F009-knowledge, F010-notes | File handling for messages, KB ingestion, notes |
| Memory_Search | F004-ai-engine | F006-chat | Inject memories into chat context |
| KnowledgeBase_Search | F009-knowledge-base | F006-chat | RAG retrieval during chat |
| Mcp_CallTool | F008-mcp | F006-chat | Tool execution within AI chat |
| Mcp_ListTools | F008-mcp | F004-ai-engine | Inject tool definitions into API requests |
| Backup_* | F011-data-sync | F003-settings | Backup triggered from settings UI |
| ApiServer_Start/Stop | F004-ai-engine | F003-settings | API server managed from settings |
| StoreSync_* | F001-app-shell | All features | Redux state sync across windows |
| FileService_Upload | F007-file-management | F004-ai-engine | Upload files to AI provider |
| App_SetStopQuitApp | F001-app-shell | F011-data-sync | Prevent quit during backup operations |
| File_ValidateNotesDirectory | F007-file-management | F010-notes | Notes directory validation |
| Obsidian_GetVaults/Files | F010-notes | F009-knowledge-base | Import Obsidian notes to knowledge base |

---

## F001-app-shell IPC Channels

### App_Info
**Direction**: renderer→main
**Handler**: inline lambda
**Request**: none
**Response**: `{ version, isPackaged, appPath, filesPath, notesPath, configPath, appDataPath, resourcesPath, logsPath, arch, isPortable, installPath }`

### App_Proxy
**Direction**: renderer→main
**Handler**: proxyManager.configureProxy
**Request**: `(proxy: string, bypassRules?: string)`
**Response**: void
**Logic**: Three modes - 'system' (OS proxy), custom (fixed_servers with bypass rules), '' (direct)

### Windows_Minimize / Maximize / Unmaximize / Close / IsMaximized
**Direction**: renderer→main
**Handler**: mainWindow native methods
**Request**: none
**Response**: void (or boolean for IsMaximized)

### Windows_MaximizedChanged
**Direction**: main→renderer
**Trigger**: mainWindow 'maximize'/'unmaximize' events
**Payload**: `boolean` (isMaximized)

### App_SaveData
**Direction**: main→renderer
**Trigger**: Power monitor shutdown handler
**Purpose**: Signal renderer to persist state before exit

### MiniWindow_Show / Hide / Close / Toggle / SetPin
**Direction**: renderer→main
**Handler**: windowService methods
**Purpose**: Quick assistant mini window lifecycle

---

## F003-settings IPC Channels

### Config_Set / Config_Get
**Direction**: renderer→main
**Handler**: configManager.set / configManager.get
**Request**: `(key: string, value: any, isNotify?: boolean)` / `(key: string)`
**Response**: void / any
**Notes**: isNotify flag triggers subscriber notifications; uses electron-store persistence

### App_SetTheme
**Direction**: renderer→main
**Handler**: themeService.setTheme
**Request**: `(theme: ThemeMode)` — 'light' | 'dark' | 'system'

### Shortcuts_Update
**Direction**: renderer→main
**Handler**: configManager.setShortcuts + re-register global shortcuts
**Request**: `(shortcuts: Shortcut[])`

---

## F004-ai-engine IPC Channels

### Memory_Add / Search / List / Delete / Update / Get
**Direction**: renderer→main
**Handler**: MemoryService singleton (LibSQL + vector embeddings)
**Key types**: `AddMemoryOptions`, `MemorySearchOptions`, `MemoryListOptions`
**Notes**: Uses 1536-dim unified vectors, 0.85 similarity threshold

### VertexAI_GetAuthHeaders / GetAccessToken / ClearAuthCache
**Direction**: renderer→main
**Handler**: VertexAIService singleton
**Purpose**: Google Vertex AI service account authentication

### ApiServer_Start / Stop / Restart / GetStatus / GetConfig
**Direction**: renderer→main
**Handler**: ApiServerService
**Purpose**: Internal REST API server lifecycle management

### TRACE_* (13 channels)
**Direction**: renderer→main
**Handler**: SpanCacheService functions
**Purpose**: AI inference tracing/observability (spans, entities, token usage)

---

## F007-file-management IPC Channels

### File_Upload
**Direction**: renderer→main
**Handler**: fileStorage.uploadFile
**Purpose**: Upload file to managed app storage with UUID naming

### File_Read / File_ReadExternal
**Direction**: renderer→main
**Handler**: fileStorage.readFile / readExternalFile
**Purpose**: Read managed or external files

### FileService_Upload / List / Delete / Retrieve
**Direction**: renderer→main
**Handler**: FileServiceManager (per-provider service)
**Request**: `(provider: Provider, file: FileMetadata)` or `(provider: Provider, fileId: string)`
**Purpose**: Remote file operations on AI provider storage (e.g., OpenAI files API)

---

## F008-mcp IPC Channels

### Mcp_CallTool
**Direction**: renderer→main
**Handler**: mcpService.callTool
**Request**: `{ server: MCPServer, name: string, args: any, callId?: string }`
**Response**: MCPCallToolResponse
**Notes**: Supports abort via Mcp_AbortTool; traced with @TraceMethod

### Mcp_RestartServer / StopServer / RemoveServer
**Direction**: renderer→main
**Handler**: mcpService methods
**Purpose**: MCP server lifecycle (stdio/SSE/StreamableHTTP transports)

### ClaudeCodePlugin_Install / Uninstall / ListInstalled / InstallFromZip / InstallFromDirectory
**Direction**: renderer→main
**Handler**: PluginService singleton
**Purpose**: DXT/Claude Code plugin management

---

## F009-knowledge-base IPC Channels

### KnowledgeBase_Create / Reset / Delete
**Direction**: renderer→main
**Handler**: KnowledgeService (RAGApplicationBuilder + LibSqlDb)
**Purpose**: Knowledge base lifecycle

### KnowledgeBase_Add / Remove
**Direction**: renderer→main
**Handler**: KnowledgeService.add / remove
**Purpose**: Add/remove items (files, URLs, sitemaps, notes) from knowledge base

### KnowledgeBase_Search / Rerank
**Direction**: renderer→main
**Handler**: KnowledgeService.search / rerank
**Purpose**: Vector search with optional reranking

---

## F011-data-sync IPC Channels

### Backup_Backup / Restore
**Direction**: renderer→main
**Handler**: BackupManager (archiver + node-stream-zip)
**Purpose**: Local file-based backup/restore

### Backup_BackupToWebdav / RestoreFromWebdav / ListWebdavFiles / CheckConnection
**Direction**: renderer→main
**Handler**: BackupManager (WebDav client)
**Purpose**: WebDAV cloud backup

### Backup_BackupToS3 / RestoreFromS3 / ListS3Files / CheckS3Connection
**Direction**: renderer→main
**Handler**: BackupManager (S3Storage)
**Purpose**: S3-compatible cloud backup

### LocalTransfer_*
**Direction**: renderer→main
**Handler**: localTransferService / lanTransferClientService
**Purpose**: LAN peer-to-peer data transfer (mDNS discovery + file send)
