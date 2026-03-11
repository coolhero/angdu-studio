# Angdu Studio -- API Registry

> spec-kit SDD artifact -- generated 2026-03-08
> Source: reverse-engineering of Cherry Studio IPC channels, REST API, and external integrations
> Identity remap: Cherry -> Angdu, CS -> AS, CherryStudio -> AngduStudio

---

## Table of Contents

1. [Endpoint Index](#endpoint-index)
2. [IPC Channels (main <-> renderer)](#ipc-channels)
3. [Event Channels (main -> renderer)](#event-channels-main---renderer)
4. [REST API Routes](#rest-api-routes)
5. [External API Integrations](#external-api-integrations)

---

## Endpoint Index

### IPC Channels by Feature

| Feature | Channel Group | Count |
|---------|--------------|-------|
| F001 app-core | App, Window, Config, Notification, System, Open, Selection, StoreSync, Redux, MiniWindow, Webview, SearchWindow | 82 |
| F002 ai-provider | Provider, Copilot, AngduIN (CherryIN), Gemini, VertexAI, Anthropic OAuth, Aes, Cherryai (AngduAI) | 25 |
| F003 chat-core | (uses renderer store directly, no dedicated IPC) | 0 |
| F004 settings-data | File (39), FileService (4), Fs (2), Backup (18), Export (1), Shortcuts (1), Zip (2), LocalTransfer (8) | 75 |
| F005 chat-ui | (renderer-only, no IPC) | 0 |
| F006 mcp-tools | Mcp (16), Python (1), CodeTools (5) | 22 |
| F007 knowledge | KnowledgeBase (7) | 7 |
| F008 memory | Memory (11) | 11 |
| F009 agents | AgentMessage (2), AgentToolPermission (2), ApiServer (5), ClaudeCodePlugin (7) | 16 |
| F010 notes | (uses File IPC channels) | 0 |
| F011 translate | OCR (2) | 2 |
| F012 paintings | (uses ai-provider, no dedicated IPC) | 0 |
| Cross-cutting | TRACE (13), Ovms (8), OpenClaw (15), Analytics (1), ExternalApps (1), Obsidian (2), Nutstore (3) | 43 |

**Total IPC channels: 283**

### REST API Routes by Feature

| Feature | Route Group | Count |
|---------|------------|-------|
| General | `/`, `/health`, `/api-docs`, `/api-docs.json` | 4 |
| F002 ai-provider | `/v1/models` | 1 |
| F003 chat-core | `/v1/chat/completions`, `/v1/messages`, `/:provider/v1/messages` | 3 |
| F006 mcp-tools | `/v1/mcps`, `/v1/mcps/:id`, `/v1/mcps/:id/mcp` | 3 |
| F009 agents | `/v1/agents` CRUD, sessions CRUD, messages CRUD | 14 |

**Total REST routes: 25**

---

## IPC Channels

Direction legend:
- **invoke**: renderer -> main (request/response via `ipcRenderer.invoke` / `ipcMain.handle`)
- **send(M->R)**: main -> renderer push (via `webContents.send`)
- **send(R->M)**: renderer -> main fire-and-forget (via `ipcRenderer.send` / `ipcMain.on`)

### F001: App Core

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-001 | `app:info` | invoke | Get app metadata | -- | `{ version, isPackaged, appPath, configPath, ... }` |
| IPC-002 | `app:proxy` | invoke | Set network proxy | `(proxy: string, bypassRules?: string)` | void |
| IPC-003 | `app:reload` | invoke | Reload renderer window | -- | void |
| IPC-004 | `app:quit` | invoke | Quit application | -- | void |
| IPC-005 | `app:quit-and-install` | invoke | Install update and restart | -- | void |
| IPC-006 | `app:set-language` | invoke | Set UI language | `language: LanguageVarious` | void |
| IPC-007 | `app:set-enable-spell-check` | invoke | Toggle spell check | `boolean` | void |
| IPC-008 | `app:set-spell-check-languages` | invoke | Set spell check languages | `string[]` | void |
| IPC-009 | `app:set-launch-on-boot` | invoke | Set auto-launch on boot | `boolean` | void |
| IPC-010 | `app:set-launch-to-tray` | invoke | Launch minimized to tray | `boolean` | void |
| IPC-011 | `app:set-tray` | invoke | Enable/disable tray icon | `boolean` | void |
| IPC-012 | `app:set-tray-on-close` | invoke | Minimize to tray on close | `boolean` | void |
| IPC-013 | `app:set-auto-update` | invoke | Enable auto-update | `boolean` | void |
| IPC-014 | `app:set-test-plan` | invoke | Enable test plan channel | `boolean` | void |
| IPC-015 | `app:set-test-channel` | invoke | Set upgrade channel | `UpgradeChannel` | void |
| IPC-016 | `app:set-theme` | invoke | Set theme mode | `ThemeMode` | void |
| IPC-017 | `app:handle-zoom-factor` | invoke | Adjust zoom factor | `(delta: number, reset?: boolean)` | void |
| IPC-018 | `app:clear-cache` | invoke | Clear app cache | -- | void |
| IPC-019 | `app:get-cache-size` | invoke | Get total cache size | -- | `number` |
| IPC-020 | `app:set-stop-quit-app` | invoke | Prevent app quit | `(stop: boolean, reason?: string)` | void |
| IPC-021 | `app:select` | invoke | Show open dialog | `Electron.OpenDialogOptions` | `string[]` |
| IPC-022 | `app:has-write-permission` | invoke | Check write permission | `string` (path) | `boolean` |
| IPC-023 | `app:resolve-path` | invoke | Resolve file path | `string` | `string` |
| IPC-024 | `app:is-path-inside` | invoke | Check path containment | `(childPath, parentPath)` | `boolean` |
| IPC-025 | `app:set-app-data-path` | invoke | Change data directory | `string` (path) | void |
| IPC-026 | `app:get-data-path-from-args` | invoke | Get data path from CLI args | -- | `string \| null` |
| IPC-027 | `app:flush-app-data` | invoke | Flush pending data writes | -- | void |
| IPC-028 | `app:is-not-empty-dir` | invoke | Check if directory is non-empty | `string` | `boolean` |
| IPC-029 | `app:copy` | invoke | Copy directory | `(oldPath, newPath, occupiedDirs?)` | void |
| IPC-030 | `app:relaunch-app` | invoke | Relaunch application | `Electron.RelaunchOptions?` | void |
| IPC-031 | `app:reset-data` | invoke | Factory reset all data | -- | void |
| IPC-032 | `app:check-for-update` | invoke | Check for app updates | -- | update info |
| IPC-033 | `app:set-full-screen` | invoke | Set fullscreen mode | `boolean` | void |
| IPC-034 | `app:is-full-screen` | invoke | Check fullscreen state | -- | `boolean` |
| IPC-035 | `app:get-system-fonts` | invoke | List installed system fonts | -- | `string[]` |
| IPC-036 | `app:get-ip-country` | invoke | Get IP geolocation country | -- | `string` |
| IPC-037 | `app:mac-is-process-trusted` | invoke | macOS: check accessibility trust | -- | `boolean` |
| IPC-038 | `app:mac-request-process-trust` | invoke | macOS: request accessibility | -- | `boolean` |
| IPC-039 | `app:quote-to-main` | invoke | Send quoted text to main window | `string` | void |
| IPC-040 | `app:set-disable-hardware-acceleration` | invoke | Toggle GPU acceleration | `boolean` | void |
| IPC-041 | `app:set-use-system-title-bar` | invoke | Use system vs custom title bar | `boolean` | void |
| IPC-042 | `app:is-binary-exist` | invoke | Check if binary is available | `string` (name) | `boolean` |
| IPC-043 | `app:get-binary-path` | invoke | Get binary path | `string` (name) | `string` |
| IPC-044 | `app:install-uv-binary` | invoke | Install uv package manager | -- | void |
| IPC-045 | `app:install-bun-binary` | invoke | Install bun runtime | -- | void |
| IPC-046 | `app:install-ovms-binary` | invoke | Install OpenVINO Model Server | -- | void |
| IPC-047 | `app:get-disk-info` | invoke | Get disk usage info | `string` (directoryPath) | disk info |
| IPC-048 | `app:crash-render-process` | invoke | Force crash renderer (debug) | -- | void |
| IPC-049 | `app:log-to-main` | invoke | Forward renderer log to main | log data | void |
| IPC-050 | `app:save-data` | send(M->R) | Signal renderer to persist state | -- | -- |

### F001: Config

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-051 | `config:set` | invoke | Set config key/value | `(key: string, value: any, isNotify?: boolean)` | void |
| IPC-052 | `config:get` | invoke | Get config value | `string` (key) | `any` |

### F001: Window Management

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-053 | `window:set-minimum-size` | invoke | Set minimum window size | `(width, height)` | void |
| IPC-054 | `window:reset-minimum-size` | invoke | Reset to default minimum size | -- | void |
| IPC-055 | `window:get-size` | invoke | Get current window size | -- | `[width, height]` |
| IPC-056 | `window:minimize` | invoke | Minimize window | -- | void |
| IPC-057 | `window:maximize` | invoke | Maximize window | -- | void |
| IPC-058 | `window:unmaximize` | invoke | Restore from maximized | -- | void |
| IPC-059 | `window:close` | invoke | Close window | -- | void |
| IPC-060 | `window:is-maximized` | invoke | Check if maximized | -- | `boolean` |
| IPC-061 | `window:maximized-changed` | send(M->R) | Maximized state changed | -- | `boolean` |
| IPC-062 | `window:resize` | send(M->R) | Window resized | -- | `[width, height]` |
| IPC-063 | `window:navigate-to-about` | send(M->R) | Navigate to about page | -- | -- |

### F001: Mini Window

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-064 | `miniwindow:show` | invoke | Show mini window | -- | void |
| IPC-065 | `miniwindow:hide` | invoke | Hide mini window | -- | void |
| IPC-066 | `miniwindow:close` | invoke | Close mini window | -- | void |
| IPC-067 | `miniwindow:toggle` | invoke | Toggle mini window visibility | -- | void |
| IPC-068 | `miniwindow:set-pin` | invoke | Pin/unpin mini window | `boolean` | void |
| IPC-069 | `hide-mini-window` | send(M->R) | Signal mini window hidden | -- | -- |
| IPC-070 | `show-mini-window` | send(M->R) | Signal mini window shown | -- | -- |

### F001: Notifications

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-071 | `notification:send` | invoke | Send OS notification | `Notification` | void |
| IPC-072 | `notification:on-click` | invoke | Register notification click | `Notification` | void |

### F001: System

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-073 | `system:getDeviceType` | invoke | Get device type | -- | `string` |
| IPC-074 | `system:getHostname` | invoke | Get hostname | -- | `string` |
| IPC-075 | `system:getCpuName` | invoke | Get CPU name | -- | `string` |
| IPC-076 | `system:checkGitBash` | invoke | Check Git Bash availability | -- | `boolean` |
| IPC-077 | `system:getGitBashPath` | invoke | Get Git Bash path | -- | `string` |
| IPC-078 | `system:getGitBashPathInfo` | invoke | Get Git Bash path info | -- | path info |
| IPC-079 | `system:setGitBashPath` | invoke | Set Git Bash path | `string \| null` | void |
| IPC-080 | `system:toggleDevTools` | invoke | Toggle DevTools | -- | void |

### F001: Open / Navigation

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-081 | `open:website` | invoke | Open URL in external browser | `string` (url) | void |
| IPC-082 | `open:path` | invoke | Open file path in OS | `string` (path) | void |

### F001: Webview

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-083 | `webview:set-open-link-external` | invoke | Set webview external link mode | `(webviewId, isExternal)` | void |
| IPC-084 | `webview:set-spell-check-enabled` | invoke | Set webview spell check | `(webviewId, isEnable)` | void |
| IPC-085 | `webview:print-to-pdf` | invoke | Print webview to PDF | `webviewId: number` | void |
| IPC-086 | `webview:save-as-html` | invoke | Save webview as HTML | `webviewId: number` | void |

### F001: Search Window

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-087 | `search-window:open` | invoke | Open search window | `(uid, show?)` | void |
| IPC-088 | `search-window:close` | invoke | Close search window | `uid: string` | void |
| IPC-089 | `search-window:open-url` | invoke | Open URL in search window | `(uid, url)` | void |

### F001: Selection Assistant

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-090 | `selection:toolbar-hide` | invoke | Hide selection toolbar | -- | void |
| IPC-091 | `selection:write-to-clipboard` | invoke | Write to clipboard | `string` | `boolean` |
| IPC-092 | `selection:toolbar-determine-size` | invoke | Set toolbar dimensions | `(width, height)` | void |
| IPC-093 | `selection:set-enabled` | invoke | Enable/disable selection | `boolean` | void |
| IPC-094 | `selection:set-trigger-mode` | invoke | Set trigger mode | `string` | void |
| IPC-095 | `selection:set-follow-toolbar` | invoke | Set follow toolbar mode | `boolean` | void |
| IPC-096 | `selection:set-remeber-win-size` | invoke | Remember window size | `boolean` | void |
| IPC-097 | `selection:set-filter-mode` | invoke | Set filter mode | `string` | void |
| IPC-098 | `selection:set-filter-list` | invoke | Set filter list | `string[]` | void |
| IPC-099 | `selection:process-action` | invoke | Process selection action | `(ActionItem, isFullScreen?)` | void |
| IPC-100 | `selection:action-window-close` | invoke | Close action window | -- | void |
| IPC-101 | `selection:action-window-minimize` | invoke | Minimize action window | -- | void |
| IPC-102 | `selection:action-window-pin` | invoke | Pin action window | `boolean` | void |
| IPC-103 | `selection:action-window-resize` | invoke | Resize action window (Windows) | size data | void |
| IPC-104 | `selection:text-selected` | send(M->R) | Text selected event | -- | `SelectionData` |
| IPC-105 | `selection:toolbar-visibility-change` | send(M->R) | Toolbar visibility changed | -- | `boolean` |
| IPC-106 | `selection:update-action-data` | send(M->R) | Push action data to window | -- | `ActionItem` |

### F001: Store Sync / Redux

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-107 | `store-sync:subscribe` | invoke | Subscribe window to sync | -- | void |
| IPC-108 | `store-sync:unsubscribe` | invoke | Unsubscribe from sync | -- | void |
| IPC-109 | `store-sync:on-update` | invoke | Push store update action | `StoreSyncAction` | void |
| IPC-110 | `store-sync:broadcast-sync` | send(M->R) | Broadcast sync to windows | -- | `StoreSyncAction` |
| IPC-111 | `redux-store-ready` | invoke | Signal Redux store ready | -- | void |

### F001: Shortcuts / Zip

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-112 | `shortcuts:update` | invoke | Update keyboard shortcuts | `Shortcut[]` | void |
| IPC-113 | `zip:compress` | invoke | Compress string to gzip | `string` | `Buffer` |
| IPC-114 | `zip:decompress` | invoke | Decompress gzip buffer | `Buffer` | `string` |

### F001: Theme / Fullscreen Events

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-115 | `theme:updated` | send(M->R) | Native theme changed | -- | `ThemeMode` |
| IPC-116 | `fullscreen-status-changed` | send(M->R) | Fullscreen state changed | -- | `boolean` |

---

### F002: AI Provider

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-117 | `provider:add-key` | send(M->R) | Notify provider key added | -- | provider data |
| IPC-118 | `copilot:get-auth-message` | invoke | GitHub Copilot auth init | -- | auth message |
| IPC-119 | `copilot:get-copilot-token` | invoke | Get Copilot token | -- | `string` |
| IPC-120 | `copilot:save-copilot-token` | invoke | Save Copilot token | token data | void |
| IPC-121 | `copilot:get-token` | invoke | Get cached Copilot token | -- | `string` |
| IPC-122 | `copilot:logout` | invoke | Clear Copilot auth | -- | void |
| IPC-123 | `copilot:get-user` | invoke | Get Copilot user info | -- | user info |
| IPC-124 | `cherryin:save-token` | invoke | Save AngduIN token | token data | void |
| IPC-125 | `cherryin:has-token` | invoke | Check AngduIN auth | -- | `boolean` |
| IPC-126 | `cherryin:get-balance` | invoke | Get AngduIN balance | -- | balance info |
| IPC-127 | `cherryin:logout` | invoke | Clear AngduIN auth | -- | void |
| IPC-128 | `cherryin:start-oauth-flow` | invoke | Start AngduIN OAuth | -- | void |
| IPC-129 | `cherryin:exchange-token` | invoke | Exchange AngduIN OAuth code | -- | token |
| IPC-130 | `gemini:upload-file` | invoke | Upload file to Gemini API | file data | upload response |
| IPC-131 | `gemini:base64-file` | invoke | Get Gemini file as base64 | file ref | `string` |
| IPC-132 | `gemini:retrieve-file` | invoke | Retrieve Gemini file status | file ref | file info |
| IPC-133 | `gemini:list-files` | invoke | List Gemini uploaded files | -- | file list |
| IPC-134 | `gemini:delete-file` | invoke | Delete Gemini file | `string` (fileId) | void |
| IPC-135 | `vertexai:get-auth-headers` | invoke | Get Vertex AI auth headers | params | `Record<string, string>` |
| IPC-136 | `vertexai:get-access-token` | invoke | Get Vertex AI access token | params | `string` |
| IPC-137 | `vertexai:clear-auth-cache` | invoke | Clear Vertex AI auth cache | `(projectId, clientEmail?)` | void |
| IPC-138 | `anthropic:start-oauth-flow` | invoke | Start Anthropic OAuth | -- | `{ url }` |
| IPC-139 | `anthropic:complete-oauth-with-code` | invoke | Complete Anthropic OAuth | `string` (code) | token |
| IPC-140 | `anthropic:cancel-oauth-flow` | invoke | Cancel Anthropic OAuth | -- | void |
| IPC-141 | `anthropic:get-access-token` | invoke | Get valid Anthropic token | -- | `string` |
| IPC-142 | `anthropic:has-credentials` | invoke | Check Anthropic credentials | -- | `boolean` |
| IPC-143 | `anthropic:clear-credentials` | invoke | Clear Anthropic credentials | -- | void |
| IPC-144 | `aes:encrypt` | invoke | AES encrypt string | `(text, secretKey, iv)` | `string` |
| IPC-145 | `aes:decrypt` | invoke | AES decrypt string | `(encryptedData, iv, secretKey)` | `string` |
| IPC-146 | `cherryai:get-signature` | invoke | Get AngduAI API signature | params | signature |

---

### F004: Settings & Data -- File Operations

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-147 | `file:open` | invoke | Open file in default app | file ref | void |
| IPC-148 | `file:openPath` | invoke | Open path in OS | path | void |
| IPC-149 | `file:save` | invoke | Save file with dialog | save data | `string` (path) |
| IPC-150 | `file:select` | invoke | Select file(s) dialog | options | `string[]` |
| IPC-151 | `file:upload` | invoke | Upload file to app storage | `FileMetadata` | `FileMetadata` |
| IPC-152 | `file:clear` | invoke | Clear file storage | -- | void |
| IPC-153 | `file:read` | invoke | Read file from app storage | file ref | `Buffer` |
| IPC-154 | `file:readExternal` | invoke | Read external file | path | `Buffer` |
| IPC-155 | `file:delete` | invoke | Delete file | file id | void |
| IPC-156 | `file:deleteDir` | invoke | Delete directory | dir ref | void |
| IPC-157 | `file:deleteExternalFile` | invoke | Delete external file | path | void |
| IPC-158 | `file:deleteExternalDir` | invoke | Delete external directory | path | void |
| IPC-159 | `file:move` | invoke | Move file | `(from, to)` | void |
| IPC-160 | `file:moveDir` | invoke | Move directory | `(from, to)` | void |
| IPC-161 | `file:rename` | invoke | Rename file | `(path, newName)` | void |
| IPC-162 | `file:renameDir` | invoke | Rename directory | `(path, newName)` | void |
| IPC-163 | `file:get` | invoke | Get file metadata | file id | `FileMetadata` |
| IPC-164 | `file:selectFolder` | invoke | Select folder dialog | -- | `string` (path) |
| IPC-165 | `file:createTempFile` | invoke | Create temp file | data | `string` (path) |
| IPC-166 | `file:mkdir` | invoke | Create directory | path | void |
| IPC-167 | `file:write` | invoke | Write file | `(path, data)` | void |
| IPC-168 | `file:writeWithId` | invoke | Write file with custom ID | `(id, data)` | void |
| IPC-169 | `file:saveImage` | invoke | Save image to storage | image data | `FileMetadata` |
| IPC-170 | `file:base64Image` | invoke | Get image as base64 | path | `string` |
| IPC-171 | `file:saveBase64Image` | invoke | Save base64 as image | base64 data | `FileMetadata` |
| IPC-172 | `file:savePastedImage` | invoke | Save pasted image | image data | `FileMetadata` |
| IPC-173 | `file:base64File` | invoke | Get file as base64 | path | `string` |
| IPC-174 | `file:getPdfInfo` | invoke | Get PDF page count | path | `number` |
| IPC-175 | `file:download` | invoke | Download URL to file | `(url, path)` | `string` |
| IPC-176 | `file:copy` | invoke | Copy file | `(from, to)` | void |
| IPC-177 | `file:binaryImage` | invoke | Get image as binary | path | `Buffer` |
| IPC-178 | `file:openWithRelativePath` | invoke | Open file by relative path | path | void |
| IPC-179 | `file:isTextFile` | invoke | Check if file is text | path | `boolean` |
| IPC-180 | `file:isDirectory` | invoke | Check if path is directory | path | `boolean` |
| IPC-181 | `file:listDirectory` | invoke | List directory contents | path | entries |
| IPC-182 | `file:getDirectoryStructure` | invoke | Get recursive dir structure | path | tree structure |
| IPC-183 | `file:checkFileName` | invoke | Validate filename | name | validation result |
| IPC-184 | `file:validateNotesDirectory` | invoke | Validate notes directory | path | validation result |
| IPC-185 | `file:startWatcher` | invoke | Start file system watcher | path | void |
| IPC-186 | `file:stopWatcher` | invoke | Stop file system watcher | -- | void |
| IPC-187 | `file:pauseWatcher` | invoke | Pause file system watcher | -- | void |
| IPC-188 | `file:resumeWatcher` | invoke | Resume file system watcher | -- | void |
| IPC-189 | `file:batchUploadMarkdown` | invoke | Batch upload markdown files | files | results |
| IPC-190 | `file:showInFolder` | invoke | Reveal file in OS explorer | path | void |

### F004: FileService (Provider File API)

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-191 | `file-service:upload` | invoke | Upload file to provider | `(Provider, FileMetadata)` | upload result |
| IPC-192 | `file-service:list` | invoke | List provider files | `Provider` | file list |
| IPC-193 | `file-service:delete` | invoke | Delete provider file | `(Provider, fileId)` | void |
| IPC-194 | `file-service:retrieve` | invoke | Retrieve provider file | `(Provider, fileId)` | file info |

### F004: Filesystem Direct

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-195 | `fs:read` | invoke | Read file from filesystem | path | `Buffer` |
| IPC-196 | `fs:readText` | invoke | Read text with auto encoding | path | `string` |

### F004: Export

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-197 | `export:word` | invoke | Export chat to Word doc | export params | void |

### F004: Backup & Restore

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-198 | `backup:backup` | invoke | Create backup archive | -- | `string` (path) |
| IPC-199 | `backup:restore` | invoke | Restore from backup | path | void |
| IPC-200 | `backup:backupToWebdav` | invoke | Backup to WebDAV server | `WebDavConfig` | void |
| IPC-201 | `backup:restoreFromWebdav` | invoke | Restore from WebDAV | `WebDavConfig` | void |
| IPC-202 | `backup:listWebdavFiles` | invoke | List WebDAV backup files | `WebDavConfig` | file list |
| IPC-203 | `backup:checkConnection` | invoke | Test WebDAV connection | `WebDavConfig` | `boolean` |
| IPC-204 | `backup:createDirectory` | invoke | Create WebDAV directory | `WebDavConfig` | void |
| IPC-205 | `backup:deleteWebdavFile` | invoke | Delete WebDAV file | `(WebDavConfig, file)` | void |
| IPC-206 | `backup:backupToLocalDir` | invoke | Backup to local directory | dir path | void |
| IPC-207 | `backup:restoreFromLocalBackup` | invoke | Restore from local backup | path | void |
| IPC-208 | `backup:listLocalBackupFiles` | invoke | List local backup files | -- | file list |
| IPC-209 | `backup:deleteLocalBackupFile` | invoke | Delete local backup file | path | void |
| IPC-210 | `backup:backupToS3` | invoke | Backup to S3 | `S3Config` | void |
| IPC-211 | `backup:restoreFromS3` | invoke | Restore from S3 | `S3Config` | void |
| IPC-212 | `backup:listS3Files` | invoke | List S3 backup files | `S3Config` | file list |
| IPC-213 | `backup:deleteS3File` | invoke | Delete S3 file | `(S3Config, key)` | void |
| IPC-214 | `backup:checkS3Connection` | invoke | Test S3 connection | `S3Config` | `boolean` |
| IPC-215 | `backup:createLanTransferBackup` | invoke | Create LAN transfer backup | -- | `string` (path) |
| IPC-216 | `backup:deleteTempBackup` | invoke | Delete temp backup | -- | void |
| IPC-217 | `backup-progress` | send(M->R) | Backup progress update | -- | `{ percent, ... }` |
| IPC-218 | `restore-progress` | send(M->R) | Restore progress update | -- | `{ percent, ... }` |

### F004: Local (LAN) Transfer

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-219 | `local-transfer:list` | invoke | List discovered services | -- | service state |
| IPC-220 | `local-transfer:start-scan` | invoke | Start LAN device scan | -- | void |
| IPC-221 | `local-transfer:stop-scan` | invoke | Stop LAN device scan | -- | void |
| IPC-222 | `local-transfer:connect` | invoke | Connect to LAN peer | `LocalTransferConnectPayload` | void |
| IPC-223 | `local-transfer:disconnect` | invoke | Disconnect from peer | -- | void |
| IPC-224 | `local-transfer:send-file` | invoke | Send file to peer | `{ filePath }` | void |
| IPC-225 | `local-transfer:cancel-transfer` | invoke | Cancel active transfer | -- | void |
| IPC-226 | `local-transfer:services-updated` | send(M->R) | Services list changed | -- | service state |
| IPC-227 | `local-transfer:client-event` | send(M->R) | Transfer event | -- | event data |

---

### F006: MCP Tools

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-228 | `mcp:add-server` | send(M->R) | Server added notification | -- | `MCPServer` |
| IPC-229 | `mcp:remove-server` | invoke | Remove MCP server | server id | void |
| IPC-230 | `mcp:restart-server` | invoke | Restart MCP server | server id | void |
| IPC-231 | `mcp:stop-server` | invoke | Stop MCP server | server id | void |
| IPC-232 | `mcp:list-tools` | invoke | List tools for server | server id | `MCPTool[]` |
| IPC-233 | `mcp:call-tool` | invoke | Execute MCP tool | `{ serverId, toolName, args }` | `MCPCallToolResponse` |
| IPC-234 | `mcp:list-prompts` | invoke | List MCP prompts | server id | `MCPPrompt[]` |
| IPC-235 | `mcp:get-prompt` | invoke | Get MCP prompt detail | `{ serverId, promptName, args }` | prompt response |
| IPC-236 | `mcp:list-resources` | invoke | List MCP resources | server id | `MCPResource[]` |
| IPC-237 | `mcp:get-resource` | invoke | Get MCP resource | `{ serverId, uri }` | resource response |
| IPC-238 | `mcp:get-install-info` | invoke | Get MCP install info | -- | install info |
| IPC-239 | `mcp:check-connectivity` | invoke | Check server connectivity | server id | connectivity result |
| IPC-240 | `mcp:upload-dxt` | invoke | Upload DXT package | `(ArrayBuffer, fileName)` | void |
| IPC-241 | `mcp:abort-tool` | invoke | Abort running tool | tool call id | void |
| IPC-242 | `mcp:get-server-version` | invoke | Get MCP server version | server id | version info |
| IPC-243 | `mcp:get-server-logs` | invoke | Get server log history | server id | log entries |
| IPC-244 | `mcp:servers-changed` | send(M->R) | Server list changed | -- | server list |
| IPC-245 | `mcp:servers-updated` | send(M->R) | Server status updated | -- | server list |
| IPC-246 | `mcp:progress` | send(M->R) | Tool execution progress | -- | progress data |
| IPC-247 | `mcp:server-log` | send(M->R) | Server log entry | -- | `{ serverId, message }` |

### F006: Python Execution

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-248 | `python:execute` | send(R->M) | Execute Python code | execution request | -- |

### F006: Code Tools

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-249 | `code-tools:run` | invoke | Run code tool | run params | result |
| IPC-250 | `code-tools:get-available-terminals` | invoke | List available terminals | -- | terminal list |
| IPC-251 | `code-tools:set-custom-terminal-path` | invoke | Set custom terminal path | `(terminalId, path)` | void |
| IPC-252 | `code-tools:get-custom-terminal-path` | invoke | Get custom terminal path | `terminalId` | `string` |
| IPC-253 | `code-tools:remove-custom-terminal-path` | invoke | Remove custom terminal | `terminalId` | void |

---

### F007: Knowledge Base

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-254 | `knowledge-base:create` | invoke | Create knowledge base | create params | void |
| IPC-255 | `knowledge-base:reset` | invoke | Reset knowledge base vectors | base id | void |
| IPC-256 | `knowledge-base:delete` | invoke | Delete knowledge base | base id | void |
| IPC-257 | `knowledge-base:add` | invoke | Add item to knowledge base | `{ baseId, item }` | void |
| IPC-258 | `knowledge-base:remove` | invoke | Remove item from knowledge base | `{ baseId, itemId }` | void |
| IPC-259 | `knowledge-base:search` | invoke | Vector search knowledge base | `{ baseId, query, limit }` | `KnowledgeSearchResult[]` |
| IPC-260 | `knowledge-base:rerank` | invoke | Rerank search results | `{ results, query }` | `KnowledgeSearchResult[]` |
| IPC-261 | `directory-processing-percent` | send(M->R) | Knowledge dir processing progress | -- | `{ percent }` |

---

### F008: Memory

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-262 | `memory:add` | invoke | Add memory from messages | `(messages, config)` | void |
| IPC-263 | `memory:search` | invoke | Search memories | `(query, config)` | search results |
| IPC-264 | `memory:list` | invoke | List all memories | `config` | memory list |
| IPC-265 | `memory:delete` | invoke | Delete memory | `id` | void |
| IPC-266 | `memory:update` | invoke | Update memory | `(id, memory, metadata)` | void |
| IPC-267 | `memory:get` | invoke | Get memory by ID | `memoryId` | memory item |
| IPC-268 | `memory:set-config` | invoke | Set memory config | `config` | void |
| IPC-269 | `memory:delete-user` | invoke | Delete user | `userId` | void |
| IPC-270 | `memory:delete-all-memories-for-user` | invoke | Delete all memories for user | `userId` | void |
| IPC-271 | `memory:get-users-list` | invoke | List memory users | -- | user list |
| IPC-272 | `memory:migrate-memory-db` | invoke | Migrate memory database | -- | void |

---

### F009: Agents & API Server

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-273 | `agent-message:persist-exchange` | invoke | Persist agent message exchange | `AgentMessagePersistExchangePayload` | result |
| IPC-274 | `agent-message:get-history` | invoke | Get agent message history | `{ sessionId }` | `AgentPersistedMessage[]` |
| IPC-275 | `agent-tool-permission:request` | send(M->R) | Request tool permission from user | -- | `ToolPermissionRequestPayload` |
| IPC-276 | `agent-tool-permission:response` | invoke | User responds to tool permission | `ToolPermissionResponsePayload` | void |
| IPC-277 | `agent-tool-permission:result` | send(M->R) | Permission decision result | -- | result data |
| IPC-278 | `api-server:start` | invoke | Start REST API server | -- | `StartApiServerStatusResult` |
| IPC-279 | `api-server:stop` | invoke | Stop REST API server | -- | `StopApiServerStatusResult` |
| IPC-280 | `api-server:restart` | invoke | Restart REST API server | -- | `RestartApiServerStatusResult` |
| IPC-281 | `api-server:get-status` | invoke | Get API server status | -- | `GetApiServerStatusResult` |
| IPC-282 | `api-server:get-config` | invoke | Get API server config | -- | config |
| IPC-283 | `api-server:ready` | send(M->R) | API server ready event | -- | -- |

### F009: Claude Code Plugins

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-284 | `claudeCodePlugin:install` | invoke | Install plugin from npm | options | void |
| IPC-285 | `claudeCodePlugin:uninstall` | invoke | Uninstall plugin | options | void |
| IPC-286 | `claudeCodePlugin:uninstall-package` | invoke | Uninstall npm package | options | void |
| IPC-287 | `claudeCodePlugin:list-installed` | invoke | List installed plugins | `agentId` | plugin list |
| IPC-288 | `claudeCodePlugin:write-content` | invoke | Write plugin content | options | void |
| IPC-289 | `claudeCodePlugin:install-from-zip` | invoke | Install from zip file | options | void |
| IPC-290 | `claudeCodePlugin:install-from-directory` | invoke | Install from directory | options | void |

---

### F011: Translate -- OCR

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-291 | `ocr:ocr` | invoke | Perform OCR on file | `(file: SupportedOcrFile, provider: OcrProvider)` | OCR result |
| IPC-292 | `ocr:list-providers` | invoke | List OCR providers | -- | provider IDs |

---

### Cross-cutting: Trace / Observability

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-293 | `trace:saveData` | invoke | Save trace spans | `topicId` | void |
| IPC-294 | `trace:getData` | invoke | Get trace data | `(topicId, traceId, modelName?)` | trace data |
| IPC-295 | `trace:saveEntity` | invoke | Save span entity | `SpanEntity` | void |
| IPC-296 | `trace:getEntity` | invoke | Get span entity | `spanId` | `SpanEntity` |
| IPC-297 | `trace:bindTopic` | invoke | Bind trace to topic | `(topicId, traceId)` | void |
| IPC-298 | `trace:cleanTopic` | invoke | Clean topic traces | `(topicId, traceId?)` | void |
| IPC-299 | `trace:tokenUsage` | invoke | Record token usage | `(spanId, TokenUsage)` | void |
| IPC-300 | `trace:cleanHistory` | invoke | Clean trace history | `(topicId, traceId, modelName?)` | void |
| IPC-301 | `trace:openWindow` | invoke | Open trace window | `(topicId, traceId, modelName?)` | void |
| IPC-302 | `trace:setTitle` | invoke | Set trace window title | `string` | void |
| IPC-303 | `trace:addEndMessage` | invoke | Add end message to trace | `(spanId, modelName, message)` | void |
| IPC-304 | `trace:cleanLocalData` | invoke | Clean all local trace data | -- | void |
| IPC-305 | `trace:addStreamMessage` | invoke | Add streaming message | stream data | void |

### Cross-cutting: OVMS (OpenVINO Model Server)

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-306 | `ovms:is-supported` | invoke | Check OVMS platform support | -- | `boolean` |
| IPC-307 | `ovms:add-model` | invoke | Download/add OVMS model | model params | void |
| IPC-308 | `ovms:stop-addmodel` | invoke | Cancel model download | -- | void |
| IPC-309 | `ovms:get-models` | invoke | List OVMS models | -- | model list |
| IPC-310 | `ovms:is-running` | invoke | Initialize/check OVMS | -- | `boolean` |
| IPC-311 | `ovms:get-status` | invoke | Get OVMS status | -- | status info |
| IPC-312 | `ovms:run-ovms` | invoke | Start OVMS server | -- | void |
| IPC-313 | `ovms:stop-ovms` | invoke | Stop OVMS server | -- | void |

### Cross-cutting: OpenClaw (API Gateway)

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-314 | `openclaw:check-installed` | invoke | Check OpenClaw installed | -- | `boolean` |
| IPC-315 | `openclaw:check-node-version` | invoke | Check Node.js version | -- | version info |
| IPC-316 | `openclaw:check-git-available` | invoke | Check git availability | -- | `boolean` |
| IPC-317 | `openclaw:get-node-download-url` | invoke | Get Node.js download URL | -- | `string` |
| IPC-318 | `openclaw:get-git-download-url` | invoke | Get git download URL | -- | `string` |
| IPC-319 | `openclaw:install` | invoke | Install OpenClaw | -- | void |
| IPC-320 | `openclaw:uninstall` | invoke | Uninstall OpenClaw | -- | void |
| IPC-321 | `openclaw:install-progress` | send(M->R) | Install progress event | -- | `{ message, type }` |
| IPC-322 | `openclaw:start-gateway` | invoke | Start gateway service | -- | void |
| IPC-323 | `openclaw:stop-gateway` | invoke | Stop gateway service | -- | void |
| IPC-324 | `openclaw:restart-gateway` | invoke | Restart gateway service | -- | void |
| IPC-325 | `openclaw:get-status` | invoke | Get gateway status | -- | status info |
| IPC-326 | `openclaw:check-health` | invoke | Health check gateway | -- | health result |
| IPC-327 | `openclaw:get-dashboard-url` | invoke | Get dashboard URL | -- | `string` |
| IPC-328 | `openclaw:sync-config` | invoke | Sync provider config | -- | void |
| IPC-329 | `openclaw:get-channels` | invoke | Get channel status | -- | channel info |

### Cross-cutting: External Integrations

| ID | Channel | Direction | Description | Request Type | Response Type |
|----|---------|-----------|-------------|-------------|---------------|
| IPC-330 | `obsidian:get-vaults` | invoke | List Obsidian vaults | -- | vault list |
| IPC-331 | `obsidian:get-files` | invoke | List Obsidian vault files | `vaultName` | file list |
| IPC-332 | `nutstore:get-sso-url` | invoke | Get Nutstore SSO URL | -- | `string` |
| IPC-333 | `nutstore:decrypt-token` | invoke | Decrypt Nutstore token | `string` | decrypted token |
| IPC-334 | `nutstore:get-directory-contents` | invoke | List Nutstore directory | `(token, path)` | file list |
| IPC-335 | `external-apps:detect-installed` | invoke | Detect installed external apps | -- | app list |
| IPC-336 | `analytics:track-token-usage` | invoke | Track token usage analytics | `TokenUsageData` | void |

---

## Event Channels (main -> renderer)

Summary of all push-only channels from main process to renderer.

| Channel | Feature | Description | Payload |
|---------|---------|-------------|---------|
| `app:save-data` | F001 | Signal renderer to persist state | -- |
| `theme:updated` | F001 | Native theme changed | `ThemeMode` |
| `fullscreen-status-changed` | F001 | Fullscreen state toggled | `boolean` |
| `window:maximized-changed` | F001 | Maximized state changed | `boolean` |
| `window:resize` | F001 | Window resized | `[width, height]` |
| `window:navigate-to-about` | F001 | Navigate to about page | -- |
| `hide-mini-window` | F001 | Mini window hidden | -- |
| `show-mini-window` | F001 | Mini window shown | -- |
| `selection:text-selected` | F001 | Text selected for assistant | `SelectionData` |
| `selection:toolbar-visibility-change` | F001 | Toolbar visibility | `boolean` |
| `selection:update-action-data` | F001 | Action data updated | `ActionItem` |
| `store-sync:broadcast-sync` | F001 | Cross-window store sync | `StoreSyncAction` |
| `notification-click` | F001 | Notification clicked | `Notification` |
| `protocol-data` | F001 | Protocol URL data received | protocol data |
| `update-error` | F001 | Update error | `Error` |
| `update-available` | F001 | Update available | release info |
| `update-not-available` | F001 | No update available | -- |
| `download-progress` | F001 | Download progress | `{ percent, bytesPerSecond }` |
| `update-downloaded` | F001 | Update downloaded | release info |
| `backup-progress` | F004 | Backup progress | process data |
| `restore-progress` | F004 | Restore progress | process data |
| `local-transfer:services-updated` | F004 | LAN services changed | service state |
| `local-transfer:client-event` | F004 | Transfer event | event data |
| `mcp:add-server` | F006 | MCP server added via URL scheme | `MCPServer` |
| `mcp:servers-changed` | F006 | Server list changed | server list |
| `mcp:servers-updated` | F006 | Server status updated | server list |
| `mcp:progress` | F006 | Tool execution progress | progress data |
| `mcp:server-log` | F006 | Server log output | `{ serverId, message }` |
| `directory-processing-percent` | F007 | Knowledge processing progress | `{ percent }` |
| `file-preprocess-progress` | F007 | File preprocessing progress | progress data |
| `file-preprocess-finished` | F007 | File preprocessing done | result data |
| `agent-tool-permission:request` | F009 | Tool permission prompt | permission payload |
| `agent-tool-permission:result` | F009 | Permission decision result | result data |
| `api-server:ready` | F009 | API server started | -- |
| `openclaw:install-progress` | Cross | OpenClaw install progress | `{ message, type }` |
| `python-execution-request` | F006 | Python execution request | request data |
| `set-trace` | Cross | Set trace window context | `{ traceId, topicId, modelName }` |
| `set-language` | Cross | Set trace window language | `{ lang }` |

---

## REST API Routes

All REST routes served by the embedded Express API server (managed via `api-server:*` IPC).
Base URL: `http://localhost:{configuredPort}`
Auth: Bearer token via `Authorization` header (except public endpoints).

### General (Public)

| ID | Method | Path | Auth | Description | Response |
|----|--------|------|------|-------------|----------|
| REST-001 | GET | `/` | No | API info and endpoint listing | `{ name, version, endpoints }` |
| REST-002 | GET | `/health` | No | Health check | `{ status: 'ok', timestamp, version }` |
| REST-003 | GET | `/api-docs` | No | Swagger UI documentation | HTML |
| REST-004 | GET | `/api-docs.json` | No | OpenAPI JSON spec | JSON |

### Models -- F002

| ID | Method | Path | Auth | Description | Request | Response |
|----|--------|------|------|-------------|---------|----------|
| REST-005 | GET | `/v1/models` | Yes | List available models | Query: `providerType?, offset?, limit?` | `{ object: 'list', data: Model[], total?, offset?, limit? }` |

### Chat Completions -- F003 (OpenAI-compatible)

| ID | Method | Path | Auth | Description | Request | Response |
|----|--------|------|------|-------------|---------|----------|
| REST-006 | POST | `/v1/chat/completions` | Yes | Create chat completion | `ChatCompletionCreateParams { model, messages, stream?, temperature?, ... }` | JSON or SSE stream (`data: [DONE]`) |

### Messages -- F003 (Anthropic-compatible)

| ID | Method | Path | Auth | Description | Request | Response |
|----|--------|------|------|-------------|---------|----------|
| REST-007 | POST | `/v1/messages` | Yes | Create message (Anthropic format) | `MessageCreateParams { model, messages, stream?, ... }` | JSON or SSE stream |
| REST-008 | POST | `/:provider/v1/messages` | Yes | Provider-specific messages | `MessageCreateParams` | JSON or SSE stream |

### MCP -- F006

| ID | Method | Path | Auth | Description | Request | Response |
|----|--------|------|------|-------------|---------|----------|
| REST-009 | GET | `/v1/mcps` | Yes | List all MCP servers | -- | `{ success, data: MCPServer[] }` |
| REST-010 | GET | `/v1/mcps/:server_id` | Yes | Get MCP server detail | -- | `{ success, data: MCPServer }` |
| REST-011 | ALL | `/v1/mcps/:server_id/mcp` | Yes | Proxy MCP protocol | MCP JSON-RPC | MCP JSON-RPC |

### Agents -- F009

| ID | Method | Path | Auth | Description | Request | Response |
|----|--------|------|------|-------------|---------|----------|
| REST-012 | POST | `/v1/agents` | Yes | Create agent | `CreateAgentRequest { type, name, model, ... }` | `AgentEntity` (201) |
| REST-013 | GET | `/v1/agents` | Yes | List agents | Query: `limit?, offset?, status?` | `{ agents, total, limit, offset }` |
| REST-014 | GET | `/v1/agents/:agentId` | Yes | Get agent by ID | -- | `AgentEntity` |
| REST-015 | PUT | `/v1/agents/:agentId` | Yes | Replace agent (full) | `ReplaceAgentRequest` | `AgentEntity` |
| REST-016 | PATCH | `/v1/agents/:agentId` | Yes | Partial update agent | `UpdateAgentRequest` | `AgentEntity` |
| REST-017 | DELETE | `/v1/agents/:agentId` | Yes | Delete agent | -- | 204 |

### Sessions -- F009

| ID | Method | Path | Auth | Description | Request | Response |
|----|--------|------|------|-------------|---------|----------|
| REST-018 | POST | `/v1/agents/:agentId/sessions` | Yes | Create session | `CreateSessionRequest { model, ... }` | `SessionEntity` (201) |
| REST-019 | GET | `/v1/agents/:agentId/sessions` | Yes | List sessions | Query: `limit?, offset?, status?` | `{ sessions, total, limit, offset }` |
| REST-020 | GET | `/v1/agents/:agentId/sessions/:sessionId` | Yes | Get session | -- | `SessionEntity` |
| REST-021 | PUT | `/v1/agents/:agentId/sessions/:sessionId` | Yes | Replace session | `ReplaceSessionRequest` | `SessionEntity` |
| REST-022 | PATCH | `/v1/agents/:agentId/sessions/:sessionId` | Yes | Partial update session | `UpdateSessionRequest` | `SessionEntity` |
| REST-023 | DELETE | `/v1/agents/:agentId/sessions/:sessionId` | Yes | Delete session | -- | 204 |

### Session Messages -- F009

| ID | Method | Path | Auth | Description | Request | Response |
|----|--------|------|------|-------------|---------|----------|
| REST-024 | POST | `/v1/agents/:agentId/sessions/:sessionId/messages` | Yes | Create message (triggers agent run) | `{ content }` | message entity (201) |
| REST-025 | DELETE | `/v1/agents/:agentId/sessions/:sessionId/messages/:messageId` | Yes | Delete message | -- | 204 |

---

## External API Integrations

These are the upstream LLM/AI service APIs that Angdu Studio connects to as a client.

### Primary LLM Providers

| ID | Provider | API Type | Default Base URL | Feature | Auth Method |
|----|----------|----------|-----------------|---------|-------------|
| EXT-001 | OpenAI | openai-response | `https://api.openai.com` | F002 | API Key |
| EXT-002 | Anthropic | anthropic | `https://api.anthropic.com` | F002 | API Key / OAuth |
| EXT-003 | Google Gemini | gemini | `https://generativelanguage.googleapis.com` | F002 | API Key |
| EXT-004 | Google Vertex AI | vertexai | (project-specific) | F002 | Service Account JSON |
| EXT-005 | Azure OpenAI | azure-openai | (deployment-specific) | F002 | API Key |
| EXT-006 | AWS Bedrock | aws-bedrock | (region-specific) | F002 | AWS Credentials |
| EXT-007 | GitHub Copilot | openai | `https://api.githubcopilot.com/` | F002 | OAuth Device Flow |
| EXT-008 | GitHub Models | openai | `https://models.github.ai/inference` | F002 | API Key |

### Inference Aggregators / Proxies

| ID | Provider | API Type | Default Base URL | Feature |
|----|----------|----------|-----------------|---------|
| EXT-009 | OpenRouter | openai | `https://openrouter.ai/api/v1/` | F002 |
| EXT-010 | Groq | openai | `https://api.groq.com/openai` | F002 |
| EXT-011 | Together | openai | `https://api.together.xyz` | F002 |
| EXT-012 | Fireworks | openai | `https://api.fireworks.ai/inference` | F002 |
| EXT-013 | Perplexity | openai | `https://api.perplexity.ai/` | F002 |
| EXT-014 | Grok (xAI) | openai | `https://api.x.ai` | F002 |
| EXT-015 | NVIDIA | openai | `https://integrate.api.nvidia.com` | F002 |
| EXT-016 | Mistral | openai | `https://api.mistral.ai` | F002 |
| EXT-017 | Cerebras | openai | `https://api.cerebras.ai/v1` | F002 |
| EXT-018 | Hyperbolic | openai | `https://api.hyperbolic.xyz` | F002 |
| EXT-019 | Hugging Face | openai-response | `https://router.huggingface.co/v1/` | F002 |
| EXT-020 | Vercel AI Gateway | gateway | `https://ai-gateway.vercel.sh/v1/ai` | F002 |

### China-Region Providers

| ID | Provider | API Type | Default Base URL | Feature |
|----|----------|----------|-----------------|---------|
| EXT-021 | DeepSeek | openai | `https://api.deepseek.com` | F002 |
| EXT-022 | SiliconFlow | openai | `https://api.siliconflow.cn` | F002 |
| EXT-023 | Bailian (Alibaba/DashScope) | openai | `https://dashscope.aliyuncs.com/compatible-mode/v1/` | F002 |
| EXT-024 | ZhiPu (GLM) | openai | `https://open.bigmodel.cn/api/paas/v4/` | F002 |
| EXT-025 | Moonshot AI | openai | `https://api.moonshot.cn` | F002 |
| EXT-026 | Doubao (ByteDance) | openai | `https://ark.cn-beijing.volces.com/api/v3/` | F002 |
| EXT-027 | MiniMax | openai | `https://api.minimaxi.com/v1/` | F002 |
| EXT-028 | Baichuan | openai | `https://api.baichuan-ai.com` | F002 |
| EXT-029 | StepFun | openai | `https://api.stepfun.com` | F002 |
| EXT-030 | Yi (Lingyiwanwu) | openai | `https://api.lingyiwanwu.com` | F002 |
| EXT-031 | Infini | openai | `https://cloud.infini-ai.com/maas` | F002 |
| EXT-032 | Hunyuan (Tencent) | openai | `https://api.hunyuan.cloud.tencent.com` | F002 |
| EXT-033 | Tencent Cloud TI | openai | `https://api.lkeap.cloud.tencent.com` | F002 |
| EXT-034 | Baidu Cloud (Qianfan) | openai | `https://qianfan.baidubce.com/v2/` | F002 |
| EXT-035 | ModelScope | openai | `https://api-inference.modelscope.cn/v1/` | F002 |
| EXT-036 | PPIO | openai | `https://api.ppinfra.com/v3/openai/` | F002 |
| EXT-037 | Qiniu | openai | `https://api.qnaigc.com` | F002 |
| EXT-038 | Xirang (CTyun) | openai | `https://wishub-x1.ctyun.cn` | F002 |
| EXT-039 | Xiaomi MiMo | openai | `https://api.xiaomimimo.com` | F002 |
| EXT-040 | AngduIN (CherryIN) | openai | `https://open.cherryin.net` | F002 |

### Proxy / Aggregation Services

| ID | Provider | API Type | Default Base URL | Feature |
|----|----------|----------|-----------------|---------|
| EXT-041 | AiHubMix | openai | `https://aihubmix.com` | F002 |
| EXT-042 | 302.AI | openai | `https://api.302.ai` | F002 |
| EXT-043 | DMXAPI | openai | `https://www.dmxapi.cn` | F002 |
| EXT-044 | TokenFlux | openai | `https://api.tokenflux.ai/openai/v1` | F002 |
| EXT-045 | ocoolAI | openai | `https://api.ocoolai.com` | F002 |
| EXT-046 | AIOnly | openai | `https://api.aiionly.com` | F002 |
| EXT-047 | BurnCloud | openai | `https://ai.burncloud.com` | F002 |
| EXT-048 | AlayaNew | openai | `https://deepseek.alayanew.com` | F002 |
| EXT-049 | Cephalon | openai | `https://cephalon.cloud/user-center/v1/model` | F002 |
| EXT-050 | LANYUN | openai | `https://maas-api.lanyun.net` | F002 |
| EXT-051 | PH8 | openai | `https://ph8.co` | F002 |
| EXT-052 | SophNet | openai | `https://www.sophnet.com/api/open-apis/v1` | F002 |
| EXT-053 | LongCat | openai | `https://api.longcat.chat/openai` | F002 |
| EXT-054 | Poe | openai | `https://api.poe.com/v1/` | F002 |

### Local / Self-Hosted Providers

| ID | Provider | API Type | Default Base URL | Feature |
|----|----------|----------|-----------------|---------|
| EXT-055 | Ollama | ollama | `http://localhost:11434` | F002 |
| EXT-056 | LM Studio | openai | `http://localhost:1234` | F002 |
| EXT-057 | New API | new-api | `http://localhost:3000` | F002 |
| EXT-058 | OpenVINO Model Server | openai | `http://localhost:8000/v3/` | F002 |
| EXT-059 | GPUStack | openai | (user-configured) | F002 |

### Specialty APIs

| ID | Provider | API Type | Default Base URL | Feature |
|----|----------|----------|-----------------|---------|
| EXT-060 | Jina | openai | `https://api.jina.ai` | F002 (embeddings) |
| EXT-061 | VoyageAI | openai | `https://api.voyageai.com` | F002 (embeddings) |
| EXT-062 | AngduAI (CherryAI) | openai | `https://api.cherry-ai.com` | F002 |

### Web Search APIs (Renderer-side)

| ID | Provider | Feature | Description |
|----|----------|---------|-------------|
| EXT-063 | Tavily | F003 | Web search via Tavily API |
| EXT-064 | Exa | F003 | Web search via Exa API |
| EXT-065 | Bocha | F003 | Web search via Bocha API |
| EXT-066 | ZhiPu Web Search | F003 | Web search via ZhiPu API |
| EXT-067 | SearXNG | F003 | Self-hosted meta-search engine |
| EXT-068 | Local Google | F003 | Direct Google scraping |
| EXT-069 | Local Bing | F003 | Direct Bing scraping |
| EXT-070 | Local Baidu | F003 | Direct Baidu scraping |

---

## Inter-Process Communication Patterns

### Pattern 1: Request/Response (invoke/handle)
- **Usage**: ~95% of all IPC channels
- **Flow**: Renderer calls `window.api.invoke(channel, ...args)` -> preload bridge -> `ipcMain.handle(channel)` -> returns Promise
- **Example**: `app:info`, `mcp:call-tool`, `memory:search`

### Pattern 2: Main-to-Renderer Push (webContents.send)
- **Usage**: ~38 event channels
- **Flow**: Main process calls `mainWindow.webContents.send(channel, payload)` -> renderer listens via `window.api.on(channel)`
- **Example**: `update-available`, `mcp:progress`, `backup-progress`

### Pattern 3: Renderer Fire-and-Forget (ipcRenderer.send / ipcMain.on)
- **Usage**: Rare (~2 channels)
- **Flow**: `ipcRenderer.send(channel, data)` -> `ipcMain.on(channel)`, no response
- **Example**: `python-execution-response`

### Pattern 4: Cross-Window Sync
- **Usage**: StoreSync service
- **Flow**: Window A sends update via `store-sync:on-update` -> main broadcasts to all other windows via `store-sync:broadcast-sync`
- **Purpose**: Redux store synchronization between main window, mini window, and action windows

### Pattern 5: REST API Gateway
- **Usage**: 25 REST routes
- **Flow**: External HTTP client -> Express server (in main process) -> same service layer as IPC handlers
- **Purpose**: OpenAI/Anthropic API compatibility for external tools (e.g., VS Code, curl)

---

## Summary Statistics

| Category | Count |
|----------|-------|
| IPC invoke/handle channels | ~245 |
| IPC push event channels | ~38 |
| IPC fire-and-forget channels | ~2 |
| **Total IPC channels** | **~285** |
| REST API routes | 25 |
| External API providers | 70 |
| Web search integrations | 8 |
| **Total external integrations** | **78** |
