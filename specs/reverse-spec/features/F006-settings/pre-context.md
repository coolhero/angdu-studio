# F006-settings Pre-Context

> Feature: App settings page with sub-sections (Provider, Model, General, Display, Data, MCP, Web Search, Memories, API Server, Doc Processing, Quick Phrases, Shortcuts, Quick Assistant, Selection Assistant, About)
> Tier: 1 | Screen: `#/settings`
> Dependencies: F001-shell, F002-i18n-theme, F003-providers

---

## 1. Runtime Exploration Results

| Screen / Route | What Happens | Key Observation |
|---|---|---|
| `#/settings` | Left menu sidebar + right content area; 16 menu items organized in 4 groups | Uses react-router `Routes` for sub-pages |
| `/settings/provider` | Provider list and configuration | Links to F003-providers |
| `/settings/model` | Default model selection | `ModelSettings` component |
| `/settings/general` | Language, proxy, launch behavior, tray, notifications, spell check, developer mode | GeneralSettings.tsx (372 lines) |
| `/settings/display` | Theme, font, message style, code viewer, math engine, sidebar icons | DisplaySettings.tsx + SidebarIconsManager.tsx |
| `/settings/data` | Backup (WebDAV, local, S3, Nutstore), export (Notion, Yuque, Joplin, Obsidian, Siyuan), import/export | 13 sub-components in DataSettings/ |
| `/settings/mcp` | MCP server management, marketplace, built-in servers | MCPSettings with 18 sub-components |
| `/settings/websearch` | Web search provider config | WebSearchSettings |
| `/settings/memory` | Memory/RAG settings | MemorySettings |
| `/settings/api-server` | API server enable/port/key | ApiServerSettings |
| `/settings/docprocess` | Document processing settings | DocProcessSettings |
| `/settings/quickphrase` | Quick phrase management | QuickPhraseSettings |
| `/settings/shortcut` | Keyboard shortcuts config | ShortcutSettings |
| `/settings/quickAssistant` | Quick assistant floating window settings | QuickAssistantSettings |
| `/settings/selectionAssistant` | Text selection assistant settings | SelectionAssistantSettings |
| `/settings/about` | App version, update check, links | AboutSettings |

## 2. Source Reference

| File Path (cherry-studio) | Role | Rebuild Target |
|---|---|---|
| `src/renderer/src/pages/settings/SettingsPage.tsx` | Settings page layout: sidebar menu + content routes | `[TBD]` |
| `src/renderer/src/pages/settings/index.tsx` | Shared styled components (SettingContainer, SettingGroup, SettingRow, etc.) | `[TBD]` |
| `src/renderer/src/store/settings.ts` | Redux slice: 100+ settings properties, 90+ reducer actions | `[TBD]` |
| `src/renderer/src/pages/settings/GeneralSettings.tsx` | General settings: language, proxy, launch, tray, notifications, privacy | `[TBD]` |
| `src/renderer/src/pages/settings/DisplaySettings/DisplaySettings.tsx` | Display settings: theme, font, message style, code, math | `[TBD]` |
| `src/renderer/src/pages/settings/DisplaySettings/SidebarIconsManager.tsx` | Sidebar icon visibility/order management | `[TBD]` |
| `src/renderer/src/pages/settings/DataSettings/DataSettings.tsx` | Data settings hub | `[TBD]` |
| `src/renderer/src/pages/settings/DataSettings/WebDavSettings.tsx` | WebDAV backup config | `[TBD]` |
| `src/renderer/src/pages/settings/DataSettings/LocalBackupSettings.tsx` | Local backup config | `[TBD]` |
| `src/renderer/src/pages/settings/DataSettings/S3Settings.tsx` | S3 backup config | `[TBD]` |
| `src/renderer/src/pages/settings/DataSettings/NotionSettings.tsx` | Notion export config | `[TBD]` |
| `src/renderer/src/pages/settings/DataSettings/YuqueSettings.tsx` | Yuque export config | `[TBD]` |
| `src/renderer/src/pages/settings/DataSettings/JoplinSettings.tsx` | Joplin export config | `[TBD]` |
| `src/renderer/src/pages/settings/DataSettings/ObsidianSettings.tsx` | Obsidian export config | `[TBD]` |
| `src/renderer/src/pages/settings/DataSettings/SiyuanSettings.tsx` | Siyuan export config | `[TBD]` |
| `src/renderer/src/pages/settings/MCPSettings/` (18 files) | MCP server management | `[TBD]` |
| `src/renderer/src/pages/settings/WebSearchSettings/` | Web search settings | `[TBD]` |
| `src/renderer/src/pages/settings/MemorySettings/` | Memory settings | `[TBD]` |
| `src/renderer/src/pages/settings/ToolSettings/ApiServerSettings.tsx` | API server config | `[TBD]` |
| `src/renderer/src/pages/settings/ShortcutSettings.tsx` | Keyboard shortcuts | `[TBD]` |
| `src/renderer/src/pages/settings/QuickAssistantSettings.tsx` | Quick assistant config | `[TBD]` |
| `src/renderer/src/pages/settings/QuickPhraseSettings.tsx` | Quick phrases config | `[TBD]` |
| `src/renderer/src/pages/settings/AboutSettings.tsx` | About page | `[TBD]` |

## 3. Source Behavior Inventory (SBI)

| ID | Behavior | Source Location | Category |
|---|---|---|---|
| B179 | `SettingsState` interface defines 100+ settings properties across General, Display, Data, Code, Export, Proxy, Tray, Theme, etc. | `store/settings.ts:61-251` | type |
| B180 | `initialState` provides defaults for all settings including WebDAV path `/cherry-studio`, painting provider `cherryin`, API server key `cs-sk-{uuid}` | `store/settings.ts:255-453` | constant |
| B181 | `setShowAssistants` / `toggleShowAssistants` controls assistant sidebar visibility | `store/settings.ts:459-464` | mutation |
| B182 | `setShowTopics` / `toggleShowTopics` controls topics sidebar visibility | `store/settings.ts:465-470` | mutation |
| B183 | `setSendMessageShortcut` sets Enter/Shift+Enter/Ctrl+Enter/Command+Enter/Alt+Enter | `store/settings.ts:474-476` | mutation |
| B184 | `setLanguage` sets UI language | `store/settings.ts:477-479` | mutation |
| B185 | `setProxyMode` / `setProxyUrl` / `setProxyBypassRules` configures network proxy | `store/settings.ts:483-491` | mutation |
| B186 | `setTheme` sets ThemeMode (light/dark/system) | `store/settings.ts:519-521` | mutation |
| B187 | `setUserTheme` sets custom theme (colorPrimary, userFontFamily, userCodeFontFamily) | `store/settings.ts:525-527` | mutation |
| B188 | `setFontSize` sets global font size | `store/settings.ts:528-530` | mutation |
| B189 | `setWindowStyle` sets transparent/opaque window chrome | `store/settings.ts:531-533` | mutation |
| B190 | `setTopicPosition` sets left/right topic panel position | `store/settings.ts:534-536` | mutation |
| B191 | `setMessageStyle` sets plain/bubble message display | `store/settings.ts:674-676` | mutation |
| B192 | `setCodeExecution` / `setCodeEditor` / `setCodeViewer` configure code display and execution | `store/settings.ts:594-643` | mutation |
| B193 | `setMathEngine` sets KaTeX or other math renderer | `store/settings.ts:659-661` | mutation |
| B194 | `setWebdavHost` / `setWebdavUser` / `setWebdavPass` / `setWebdavPath` / `setWebdavAutoSync` / `setWebdavSyncInterval` / `setWebdavMaxBackups` configure WebDAV backup | `store/settings.ts:567-593` | mutation |
| B195 | `setLocalBackupDir` / `setLocalBackupAutoSync` / `setLocalBackupSyncInterval` / `setLocalBackupMaxBackups` configure local backup | `store/settings.ts:851-865` | mutation |
| B196 | `setS3` / `setS3Partial` configure S3 backup (endpoint, region, bucket, keys) | `store/settings.ts:869-874` | mutation |
| B197 | `setNotionDatabaseID` / `setNotionApiKey` / `setNotionPageNameKey` configure Notion export | `store/settings.ts:718-726` | mutation |
| B198 | `setYuqueToken` / `setYuqueRepoId` / `setYuqueUrl` configure Yuque export | `store/settings.ts:754-762` | mutation |
| B199 | `setJoplinToken` / `setJoplinUrl` / `setJoplinExportReasoning` configure Joplin export | `store/settings.ts:763-771` | mutation |
| B200 | `setDefaultObsidianVault` configures Obsidian export | `store/settings.ts:775-777` | mutation |
| B201 | `setSiyuanApiUrl` / `setSiyuanToken` / `setSiyuanBoxId` / `setSiyuanRootPath` configure Siyuan export | `store/settings.ts:781-792` | mutation |
| B202 | `setSidebarIcons` sets visible/disabled sidebar icon configuration | `store/settings.ts:695-702` | mutation |
| B203 | `setEnableQuickAssistant` / `setClickTrayToShowQuickAssistant` configure quick assistant | `store/settings.ts:709-712` | mutation |
| B204 | `setApiServerEnabled` / `setApiServerPort` / `setApiServerApiKey` configure API server | `store/settings.ts:882-899` | mutation |
| B205 | `setConfirmDeleteMessage` / `setConfirmRegenerateMessage` configure action confirmations | `store/settings.ts:823-827` | mutation |
| B206 | `setLaunchOnBoot` / `setLaunchToTray` / `setTray` / `setTrayOnClose` configure startup and tray behavior | `store/settings.ts:507-518` | mutation |
| B207 | `setEnableDataCollection` / `setEnableSpellCheck` / `setSpellCheckLanguages` privacy and spell check | `store/settings.ts:808-816` | mutation |
| B208 | `setDisableHardwareAcceleration` toggles GPU acceleration | `store/settings.ts:829-831` | mutation |
| B209 | `setEnableDeveloperMode` toggles developer mode | `store/settings.ts:875-877` | mutation |
| B210 | `setNavbarPosition` sets left/top navbar placement | `store/settings.ts:878-880` | mutation |
| B211 | `setMultiModelMessageStyle` sets horizontal/vertical/fold/grid for multi-model display | `store/settings.ts:715-717` | mutation |
| B212 | `setOpenAISummaryText` / `setOpenAIVerbosity` / `setOpenAIStreamOptionsIncludeUsage` OpenAI-specific settings | `store/settings.ts:835-846` | mutation |
| B213 | `setExportMenuOptions` configures which export formats are shown | `store/settings.ts:817-819` | mutation |
| B214 | `setNotificationSettings` configures notification channels (assistant, backup, knowledge) | `store/settings.ts:847-849` | mutation |
| B215 | `setCustomCss` sets user custom CSS | `store/settings.ts:522-524` | mutation |
| B216 | `setTranslateModelPrompt` / `setAutoTranslateWithSpace` / `setShowTranslateConfirm` configure translation | `store/settings.ts:677-685` | mutation |
| B217 | `setEnableTopicNaming` / `setTopicNamingPrompt` configure auto topic naming | `store/settings.ts:686-694` | mutation |
| B218 | `setAgentssubscribeUrl` sets subscribed assistant source URL | `store/settings.ts:793-795` | mutation |
| B219 | `setDefaultAgent` sets default assistant preset ID | `store/settings.ts:778-780` | mutation |
| B220 | `setMaxKeepAliveMinapps` / `setShowOpenedMinappsInSidebar` / `setMinappsOpenLinkExternal` / `setMinAppRegion` MinApp settings | `store/settings.ts:796-807` | mutation |

## 4. UI Component Features

| Component | Capability | Notes |
|---|---|---|
| `SettingsPage` | Left sidebar menu with icons + right content area via Routes | 16 menu items, 4 groups separated by dividers |
| `SettingContainer` | Scrollable content wrapper | Themed background |
| `SettingGroup` | Bordered card for grouping related settings | Themed border/background |
| `SettingRow` | Label + control row layout | Flex between |
| `GeneralSettings` | Language selector, proxy config, launch/tray toggles, notifications, spell check, developer mode | 372 lines |
| `DisplaySettings` | Theme mode, font size, message style, code viewer themes, math engine, sidebar icons | Complex with many sub-sections |
| `DataSettings` | Hub for 13 sub-components covering backup and export | WebDAV, local, S3, Nutstore, Notion, Yuque, Joplin, Obsidian, Siyuan |
| `MCPSettings` | Server list, marketplace, built-in servers, JSON editor | 18 sub-files |
| `WebSearchSettings` | Web search provider configuration | Provider-specific forms |
| `MemorySettings` | Memory/RAG configuration | Memory management |
| `ApiServerSettings` | Enable/disable, port, API key | Simple toggle + inputs |
| `ShortcutSettings` | Keyboard shortcut customization | Keybinding display |
| `QuickAssistantSettings` | Quick assistant window toggle and tray behavior | Simple toggles |
| `QuickPhraseSettings` | Quick phrase CRUD | Phrase management |
| `AboutSettings` | Version display, update check, links | Info page |

## 5. Interaction Behavior Inventory

| Interaction | Behavior |
|---|---|
| Click menu item in settings sidebar | Routes to sub-page, highlights active item |
| Toggle switch | Dispatches corresponding setter action to Redux |
| Change language | `setLanguage` + i18n language change |
| Set proxy | Mode selection (system/custom/none) + URL input with validation |
| Change theme | `setTheme` applies ThemeMode, triggers CSS variable update |
| Configure WebDAV | Host/user/pass/path inputs, auto-sync toggle with interval |
| Configure Notion export | Database ID + API key + page name key inputs |
| Change send shortcut | Dropdown selection from 5 options |
| Toggle developer mode | Enables additional debug features |
| Configure API server | Enable toggle, port number, auto-generated API key |

## 6. Foundation Decisions (Electron)

| Decision | Detail |
|---|---|
| Settings persistence | Redux store persisted via electron-store |
| Proxy config | `setProxyMode`/`setProxyUrl` forwarded to Electron main process |
| Launch on boot | `setLaunchOnBoot` calls Electron auto-launch API |
| Tray management | Electron tray icon show/hide/click behavior |
| Hardware acceleration | `setDisableHardwareAcceleration` requires app restart |
| File dialogs | Local backup directory selection uses Electron dialog |

## 7. Foundation Dependencies

| Dependency | Usage | New Stack Equivalent |
|---|---|---|
| `@reduxjs/toolkit` (createSlice) | Settings state management (90+ reducers) | Zustand store |
| `antd` (Switch, Input, Select, Flex, Tooltip, Divider) | Settings UI controls | shadcn/ui (Switch, Input, Select, etc.) |
| `styled-components` | Settings page layout styling | Tailwind CSS |
| `lucide-react` | Menu and setting icons | Same |
| `react-router-dom` (Link, Route, Routes, useLocation) | Settings sub-page routing | Same |
| `react-i18next` | Settings labels and descriptions | Same |

## 8. Naming Remapping

| Original (Cherry) | Target (Angdu) | Location |
|---|---|---|
| `webdavPath: '/cherry-studio'` | `webdavPath: '/angdu-studio'` | `store/settings.ts:332` |
| `defaultPaintingProvider: 'cherryin'` | `defaultPaintingProvider: 'angduin'` | `store/settings.ts:427` |
| `apiKey: 'cs-sk-{uuid}'` (API server) | `apiKey: 'as-sk-{uuid}'` | `store/settings.ts:450` |
| `CherryHQ` (GitHub links in About) | Check and update to Angdu links | AboutSettings.tsx |

## 9. Static Resources

| Resource | Source Path | Notes |
|---|---|---|
| Menu icons | `lucide-react` (Cloud, Package, Settings2, MonitorCog, HardDrive, etc.) | 16 menu icons |
| MCP logo | `McpLogo` custom component | SVG icon |
| Spell check language flags | Emoji flags in `spellCheckLanguageOptions` | Hardcoded |

## 10. Environment Variables

| Variable | Purpose | Notes |
|---|---|---|
| `API_SERVER_DEFAULTS.HOST` | Default API server host | From `@shared/config/constant` |
| `API_SERVER_DEFAULTS.PORT` | Default API server port | From `@shared/config/constant` |

## 11. Feature Contracts

### Provides (to other features)
- All settings state and setter actions (100+ properties)
- `useSettings()` hook for reading settings across the app
- `sendMessageShortcut` for F005-chat
- `showAssistants` / `showTopics` for F001-shell layout
- `theme` / `fontSize` / `messageStyle` for F002-i18n-theme
- `proxyMode` / `proxyUrl` for F003-providers API calls
- `sidebarIcons` for F001-shell sidebar

### Consumes (from other features)
- F001-shell: Page slot in main layout
- F002-i18n-theme: Translations for all setting labels
- F003-providers: Provider list for provider settings sub-page

## 12. For /speckit.specify

- Settings state has 100+ properties - consider grouping into sub-stores (general, display, data, integrations)
- Many setters are trivial `state.x = action.payload` - Zustand can simplify these significantly
- WebDAV path default `/cherry-studio` must be remapped to `/angdu-studio`
- API server key prefix `cs-sk-` must be remapped to `as-sk-`
- Painting provider `cherryin` must be remapped to `angduin`
- Settings page has 16 sub-routes - keep router-based navigation
- Data settings alone has 13 sub-components for various backup/export integrations
- MCP settings is the most complex sub-section with 18 files

## 13. For /speckit.plan

- Zustand store `useSettingsStore` can use a single flat store with selectors
- Consider splitting into domain stores: `useGeneralSettingsStore`, `useDisplaySettingsStore`, `useDataSettingsStore`
- Replace antd controls (Switch, Input, Select) with shadcn/ui equivalents
- Replace styled-components layout with Tailwind utility classes
- Settings page layout: shadcn/ui Sidebar + content area
- Each sub-page can be a lazy-loaded component

## 14. For /speckit.analyze

- `SettingsState` has 100+ properties in a single interface - consider if Zustand benefits from splitting
- Many settings have cross-feature effects (e.g., `showAssistants` affects F001, `sendMessageShortcut` affects F005)
- WebDAV/S3/Local backup settings share similar patterns - consider a generic BackupConfig type
- Export integrations (Notion/Yuque/Joplin/Obsidian/Siyuan) each have 2-4 config fields - similar pattern
- `initialState` hardcodes `webdavPath: '/cherry-studio'` and `apiKey: 'cs-sk-'` - must remap
- `setCodeExecution` / `setCodeEditor` use nested partial updates - Zustand immer handles this naturally
- MCP settings (18 files) is the largest sub-section - may warrant its own feature in future
- `exportMenuOptions` has 11 boolean flags - consider if all are needed for Angdu Studio
