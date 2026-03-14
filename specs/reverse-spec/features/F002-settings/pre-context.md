# F002-settings Pre-Context

## Feature Overview

App configuration persistence, display settings, keyboard shortcuts, and data management. This feature manages the SettingsState (100+ fields) and ShortcutsState in the renderer via Redux, synchronized to the main process ConfigManager via IPC. Settings pages cover general, display, model, provider, assistant, data backup, shortcuts, MCP, memory, web search, translation, tool settings, and more.

Identity remapping: webdavPath default '/cherry-studio' -> '/angdu-studio', CSLOGGER -> ASLOGGER.

## Runtime Exploration Results

- **State management**: Redux Toolkit (createSlice) in renderer, electron-store in main process
- **Settings slice**: ~100+ fields covering UI, behavior, integration, backup, code editor, math rendering, export, privacy, developer mode, API server
- **Shortcuts slice**: 17 default shortcuts, mix of system (global) and non-system (in-app) shortcuts
- **Config sync**: Renderer dispatches Redux actions -> some actions trigger IPC calls to main process ConfigManager
- **Settings pages**: 23 sub-directories under `src/renderer/src/pages/settings/`
- **Shared constants**: `packages/shared/config/constant.ts` provides MIN_WINDOW_WIDTH/HEIGHT, ZOOM_SHORTCUTS, API_SERVER_DEFAULTS, file extensions, etc.
- **i18n**: Multi-language support via i18n framework, locales stored in `src/renderer/src/i18n/`

## Source Reference

All paths relative to cherry-studio root.

| File | Purpose | Lines |
|------|---------|-------|
| `src/renderer/src/store/settings.ts` | Settings Redux slice: SettingsState interface, initialState, 80+ reducers | ~1040 |
| `src/renderer/src/store/shortcuts.ts` | Shortcuts Redux slice: 17 default shortcuts, update/toggle/reset actions | ~186 |
| `src/renderer/src/hooks/useSettings.ts` | Settings hooks for renderer components | - |
| `src/renderer/src/hooks/useShortcuts.ts` | Shortcuts hooks for renderer components | - |
| `src/renderer/src/pages/settings/SettingsPage.tsx` | Settings page router/layout | - |
| `src/renderer/src/pages/settings/GeneralSettings.tsx` | General settings (language, launch, tray, proxy) | - |
| `src/renderer/src/pages/settings/DisplaySettings/` | Display settings (theme, font, message style, code, math) | - |
| `src/renderer/src/pages/settings/ShortcutSettings.tsx` | Shortcut editor UI | - |
| `src/renderer/src/pages/settings/DataSettings/` | Data directory, backup (WebDAV, S3, local), import/export | - |
| `src/renderer/src/pages/settings/ProviderSettings/` | Provider config UI (see F003) | - |
| `src/renderer/src/pages/settings/ModelSettings/` | Model config UI (see F003) | - |
| `src/renderer/src/pages/settings/MCPSettings/` | MCP server management UI | - |
| `src/renderer/src/pages/settings/MemorySettings/` | Memory/RAG settings | - |
| `src/renderer/src/pages/settings/AssistantSettings/` | Default assistant config | - |
| `src/renderer/src/pages/settings/QuickAssistantSettings.tsx` | Quick assistant (mini window) settings | - |
| `src/renderer/src/pages/settings/SelectionAssistantSettings/` | Selection assistant settings | - |
| `src/renderer/src/pages/settings/WebSearchSettings/` | Web search provider settings | - |
| `src/renderer/src/pages/settings/ToolSettings/` | Tool settings | - |
| `src/renderer/src/pages/settings/AboutSettings.tsx` | About page | - |
| `src/renderer/src/pages/settings/AgentSettings/` | Agent settings | - |
| `src/main/services/ConfigManager.ts` | Main process config: electron-store wrapper, subscribe/notify, typed getters/setters | ~297 |
| `src/renderer/src/config/sidebar.ts` | DEFAULT_SIDEBAR_ICONS definition | - |
| `src/renderer/src/config/prompts.ts` | TRANSLATE_PROMPT and other prompt templates | - |
| `packages/shared/config/constant.ts` | Shared constants: MIN_WINDOW dimensions, ZOOM_SHORTCUTS, API_SERVER_DEFAULTS | ~400+ |
| `src/renderer/src/i18n/` | Internationalization resources | - |

## Source Behavior Inventory

### B001 — SettingsState Structure
- **Source**: `src/renderer/src/store/settings.ts` lines 61-251
- **Behavior**: SettingsState interface with 100+ fields organized into categories: UI layout (showAssistants, showTopics, topicPosition, sidebarIcons, narrowMode, navbarPosition), appearance (theme, userTheme, windowStyle, fontSize, messageStyle, messageFont), behavior (sendMessageShortcut, pasteLongTextAsFile, clickAssistantToShowTopic), proxy (proxyMode, proxyUrl, proxyBypassRules), code display (codeEditor, codeViewer, codeShowLineNumbers, codeCollapsible, codeWrappable), math (mathEngine, mathEnableSingleDollar), backup (webdav*, localBackup*, s3), integrations (notion*, yuque*, joplin*, siyuan*, obsidian*), privacy (enableDataCollection, enableSpellCheck), system (launchOnBoot, launchToTray, tray, trayOnClose, disableHardwareAcceleration, useSystemTitleBar), OpenAI-specific (openAI.summaryText, serviceTier, verbosity, streamOptions), notification, API server.

### B002 — Settings Defaults
- **Source**: `src/renderer/src/store/settings.ts` lines 255-453
- **Behavior**: Key defaults: sendMessageShortcut='Enter', language=navigator.language, proxyMode='system', tray=true, trayOnClose=true, theme=ThemeMode.system, windowStyle='transparent' on macOS / 'opaque' otherwise, fontSize=14, topicPosition='left', mathEngine='KaTeX', messageStyle='plain', enableQuickAssistant=false, enableDataCollection=false, navbarPosition='top', apiServer.port=23333, webdavPath='/cherry-studio'.

### B003 — Shortcuts System
- **Source**: `src/renderer/src/store/shortcuts.ts`
- **Behavior**: Each Shortcut has: key (identifier), shortcut (key combo array), editable (bool), enabled (bool), system (bool -- controls whether registered as global shortcut in main process). 17 default shortcuts including: zoom_in/out/reset (system, non-editable), show_settings (system, non-editable), show_app (system, editable, empty default), mini_window (system, editable, Cmd+E default but disabled), selection_assistant_toggle/select_text (system, editable, disabled), new_topic (Cmd+N), toggle_show_assistants (Cmd+[), toggle_show_topics (Cmd+]), copy_last_message, edit_last_user_message, search_message_in_chat (Cmd+F), search_message (Cmd+Shift+F), clear_topic (Cmd+L), toggle_new_context (Cmd+K), select_model (Cmd+Shift+M), exit_fullscreen (Escape).

### B004 — Shortcut Sync to Main Process
- **Source**: `src/renderer/src/store/shortcuts.ts` lines 168-181
- **Behavior**: On updateShortcut, toggleShortcut, or resetShortcuts, the slice calls window.api.shortcuts.update() with serializable shortcut data. Main process ConfigManager.setShortcuts() filters to system-only shortcuts and persists them. ShortcutService re-registers on next window focus.

### B005 — ConfigManager Key-Value Store
- **Source**: `src/main/services/ConfigManager.ts`
- **Behavior**: Wraps electron-store with typed getters/setters for all ConfigKeys. subscribe(key, callback) pattern for reactive updates. setAndNotify() triggers subscriber callbacks. ConfigKeys enum: Language, Theme, LaunchToTray, Tray, TrayOnClose, ZoomFactor, Shortcuts, ClickTrayToShowQuickAssistant, EnableQuickAssistant, AutoUpdate, TestPlan, TestChannel, EnableDataCollection, SelectionAssistant* (5 keys), DisableHardwareAcceleration, UseSystemTitleBar, Proxy, EnableDeveloperMode, ClientId, GitBashPath, GitBashPathSource.

### B006 — Theme Persistence
- **Source**: `src/renderer/src/store/settings.ts`, `src/main/services/ThemeService.ts`
- **Behavior**: Renderer sets theme via Redux action -> IPC App_SetTheme -> ThemeService.setTheme() -> nativeTheme.themeSource update -> nativeTheme 'updated' event -> ThemeService broadcasts to all windows. UserTheme contains colorPrimary (default '#00b96b'), userFontFamily, userCodeFontFamily.

### B007 — Proxy Settings Flow
- **Source**: `src/renderer/src/store/settings.ts` (proxyMode, proxyUrl, proxyBypassRules)
- **Behavior**: Three modes: 'system' (use OS proxy, polled every 60s), 'custom' (user-specified URL), 'none' (direct). Renderer dispatches setProxyMode/setProxyUrl/setProxyBypassRules -> IPC App_Proxy -> ProxyManager.configureProxy(). Bypass rules support semicolon and comma separators.

### B008 — Backup Configuration
- **Source**: `src/renderer/src/store/settings.ts`
- **Behavior**: Three backup targets: WebDAV (host, user, pass, path, autoSync, syncInterval, maxBackups, skipBackupFile, disableStream), Local directory (dir, autoSync, syncInterval, maxBackups, skipBackupFile), S3 (endpoint, region, bucket, accessKeyId, secretAccessKey, root, autoSync, syncInterval, maxBackups, skipBackupFile).

### B009 — Sidebar Icons Configuration
- **Source**: `src/renderer/src/store/settings.ts`, `src/renderer/src/config/sidebar.ts`
- **Behavior**: sidebarIcons has visible (displayed in order) and disabled (hidden) arrays of SidebarIcon. DEFAULT_SIDEBAR_ICONS provides the initial visible set. setSidebarIcons action allows partial update of visible or disabled arrays.

### B010 — Export Menu Options
- **Source**: `src/renderer/src/store/settings.ts` lines 206-218
- **Behavior**: Per-format toggle for export menu: image, markdown, markdown_reason, notion, yuque, joplin, obsidian, siyuan, docx, plain_text, notes. All enabled by default.

### B011 — API Server Settings
- **Source**: `src/renderer/src/store/settings.ts` lines 246-250, 446-451
- **Behavior**: ApiServerConfig with enabled, host (default '127.0.0.1'), port (default 23333), apiKey (auto-generated 'cs-sk-' + uuid). Three Redux actions: setApiServerEnabled, setApiServerPort, setApiServerApiKey.

### B012 — Code Editor & Viewer Settings
- **Source**: `src/renderer/src/store/settings.ts` lines 97-118
- **Behavior**: codeEditor: enabled, themeLight, themeDark, highlightActiveLine, foldGutter, autocompletion, keymap. codeViewer: themeLight, themeDark. Additional: codeShowLineNumbers, codeCollapsible, codeWrappable, codeImageTools, codeFancyBlock.

### B013 — OpenAI-Specific Settings
- **Source**: `src/renderer/src/store/settings.ts` lines 219-229
- **Behavior**: openAI.summaryText (OpenAIReasoningSummary, default 'auto'), serviceTier (deprecated, moved to Provider), verbosity (OpenAIVerbosity), streamOptions.includeUsage.

## Environment Variables

| Variable | Context | Purpose |
|----------|---------|---------|
| (No F002-specific env vars) | - | Settings are persisted via electron-store and Redux |

## For /speckit.specify

- Configuration schema: SettingsState (100+ fields), ShortcutsState (17 shortcuts), ConfigManager (25+ keys)
- Persistence model: Dual-store (Redux in renderer, electron-store in main) with IPC sync
- Settings UI: 23 settings pages covering general, display, provider, model, data, shortcuts, MCP, memory, assistant, tools, web search, about
- Theme system: dark/light/system with user customization (colorPrimary, fontFamily)
- Shortcut system: System (global via Electron globalShortcut) vs non-system (in-app) shortcuts

## For /speckit.plan

- State architecture: Redux Toolkit slices in renderer, electron-store in main, IPC bridge for sync
- Migration: Cherry Studio uses Redux -- Angdu Studio will use Zustand (per stack decision). SettingsState shape and defaults are the primary migration target
- Settings pages: Component-per-category pattern under pages/settings/
- Config key mapping: ConfigManager ConfigKeys enum -> Zustand store keys
- i18n: Existing locale files provide translation keys for all settings labels

## Feature Contracts

### Provided (downstream features depend on these)

| Contract | Consumer | Description |
|----------|----------|-------------|
| `SettingsState.proxyMode/Url/BypassRules` | F003-provider, network features | Proxy configuration |
| `SettingsState.theme` | All UI features | Theme mode selection |
| `SettingsState.language` | All features | App language |
| `SettingsState.sidebarIcons` | Layout/navigation features | Sidebar composition |
| `SettingsState.enableQuickAssistant` | F001-app-shell (mini window) | Quick assistant toggle |
| `ShortcutsState.shortcuts` | F001-app-shell (ShortcutService) | Shortcut definitions |
| `SettingsState.openAI.*` | F003-provider, chat features | OpenAI-specific parameters |
| `SettingsState.apiServer` | API server feature | Server config |
| `ConfigManager.get/set` | All main-process services | Config persistence API |

### Required (this feature depends on)

| Contract | Provider | Description |
|----------|----------|-------------|
| `window.api.config.get/set` | F001-app-shell | IPC bridge for config read/write |
| `window.api.setTheme()` | F001-app-shell | Theme change IPC |
| `window.api.setProxy()` | F001-app-shell | Proxy configuration IPC |
| `window.api.shortcuts.update()` | F001-app-shell | Shortcut registration IPC |
| `window.api.setLaunchOnBoot()` | F001-app-shell | Launch-on-boot IPC |
| `window.api.setTray()` | F001-app-shell | Tray toggle IPC |
