# Pre-Context: Settings UI

**Feature ID**: F009-settings-ui
**Tier**: Tier 2
**Generated**: 2026-03-07

---

## Source Reference

**Source Root**: `/Users/coolhero/Develop/cherry-studio`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/renderer/src/pages/settings/` | All settings pages root (14 subdirectories) |
| `src/renderer/src/pages/settings/AgentSettings/` | Agent-related settings |
| `src/renderer/src/pages/settings/AssistantSettings/` | Default assistant configuration |
| `src/renderer/src/pages/settings/DataSettings/` | Data management, backup config, storage path |
| `src/renderer/src/pages/settings/DisplaySettings/` | Theme, font size, message style, sidebar |
| `src/renderer/src/pages/settings/DocProcessSettings/` | Document processing configuration |
| `src/renderer/src/pages/settings/MCPSettings/` | MCP server management UI |
| `src/renderer/src/pages/settings/MemorySettings/` | Memory/context window configuration |
| `src/renderer/src/pages/settings/ModelSettings/` | Default model selection, model management |
| `src/renderer/src/pages/settings/ProviderSettings/` | AI provider configuration (API keys, URLs) |
| `src/renderer/src/pages/settings/SelectionAssistantSettings/` | Text selection assistant configuration |
| `src/renderer/src/pages/settings/ToolSettings/` | Tool and shortcut configuration |
| `src/renderer/src/pages/settings/TranslateSettingsPopup/` | Translation service configuration |
| `src/renderer/src/pages/settings/WebSearchSettings/` | Web search provider configuration |
| `src/renderer/src/store/settings.ts` | Settings store (Redux slice -> Zustand) |
| `src/renderer/src/hooks/useSettings.ts` | React hook for settings access |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding **settings page structure and navigation hierarchy, provider configuration flow (API key, base URL, model list), model selection and default model assignment, display settings behavior (theme, font size, message style bubble/plain, sidebar position), data management settings (backup config, storage path, data migration), MCP server configuration forms, translation service configuration, web search provider configuration, assistant default settings, memory/context window configuration, agent settings, document processing settings, selection assistant settings, tool and shortcut management, settings persistence via IPC**
- Do not reference: Ant Design components throughout ALL settings pages (migrating to shadcn/ui + Radix), styled-components styling (migrating to Tailwind-only), Redux `createSlice` / `useSelector` / `useDispatch` patterns (migrating to Zustand)
- **Extract**: Settings page structure and navigation hierarchy (14 sections), form field validation rules, provider configuration form fields and validation, model capability configuration, display settings options and defaults, backup configuration schema (local/WebDAV/S3), MCP server configuration form fields, translation provider options, web search provider options, assistant default field definitions, memory configuration parameters, shortcut management with insertion strategy (first/last/after-key), settings persistence IPC call patterns
- **Ignore**: Ant Design `Form` / `Input` / `Select` / `Switch` / `Slider` / `Modal` / `Table` / `Tabs` / `Radio` / `Checkbox` / `Button` / `ConfigProvider` / `Card` / `Collapse` / `Divider` / `Space` / `Typography` / `Upload` / `Popconfirm` / `Tooltip` components (ALL migrating to shadcn/ui equivalents), styled-components wrappers, Redux slice patterns

**Note**: This is the heaviest UI migration -- all 14 settings pages use Ant Design extensively.

### Naming Remapping

No naming remapping required for F009-settings-ui. Settings pages are internal UI with no Cherry-specific branding in code identifiers.

### UI Component Features

> Settings pages use Ant Design extensively; all need shadcn/ui equivalents.

| Ant Design Component | Usage in Settings Pages | shadcn/ui Equivalent |
|----------------------|------------------------|---------------------|
| `Form` | All settings forms (provider config, display, data, etc.) | react-hook-form + zod + shadcn `Form` |
| `Input` | API keys, base URLs, paths, names | `Input` |
| `Input.Password` | Secret API key fields | `Input` with visibility toggle |
| `Select` | Theme, language, model, provider dropdowns | `Select` |
| `Switch` | Toggle settings (launch at login, tray, etc.) | `Switch` |
| `Slider` | Font size, zoom factor, chunk size | `Slider` |
| `Modal` | Confirmation dialogs, detail editors | `Dialog` |
| `Table` | Model lists, shortcut lists, MCP server lists | `DataTable` (TanStack Table + shadcn) |
| `Tabs` | Settings section navigation | `Tabs` |
| `Radio` / `Radio.Group` | Message style (bubble/plain), proxy mode | `RadioGroup` |
| `Checkbox` | Multi-select options | `Checkbox` |
| `Button` | Action buttons (save, test, add, remove) | `Button` |
| `Card` | Settings section containers | `Card` |
| `Collapse` | Expandable settings sections | `Collapsible` or `Accordion` |
| `Divider` | Section separators | `Separator` |
| `Space` | Component spacing | Tailwind flex/gap utilities |
| `Typography` | Section headers, descriptions | HTML elements with Tailwind |
| `Upload` | File upload (data import) | `Input[type=file]` + custom |
| `Popconfirm` | Destructive action confirmation | `AlertDialog` |
| `Tooltip` | Help text on hover | `Tooltip` |
| `Spin` | Loading states | `Skeleton` or spinner |
| `Tag` | Model capability tags | `Badge` |
| `InputNumber` | Numeric settings (port, timeout) | `Input[type=number]` |

### Static Resources

> Non-code files used by this Feature that must be **copied from the original source** during implementation.

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| (none) | | | Settings UI has no static resources; all configuration is dynamic |

> If resources need modification (e.g., resizing images, updating translation keys), note it in the Usage column.

### Environment Variables

> Environment variables required by this Feature at runtime.

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| (none specific to F009) | | | | |

**Shared variables** (defined by other Features but also used here):

| Variable | Owner Feature | Usage in This Feature |
|----------|--------------|----------------------|
| `CSLOGGER_RENDERER_LEVEL` | F001-app-core | Log level for renderer-side settings state updates |

---

## SBI Coverage

**SBI Range**: B291-B310

| SBI ID | Priority | Description |
|--------|----------|-------------|
| B291 | P1 | SettingsPage.render -- main settings page with navigation sidebar and content area |
| B292 | P1 | ProviderSettings.configureProvider -- provider configuration form (API key, base URL, models, options) |
| B293 | P1 | ModelSettings.selectDefaultModel -- default model selection per task type |
| B294 | P2 | DisplaySettings.setTheme -- theme selection (Light/Dark/System) with immediate preview |
| B295 | P2 | DataSettings.setBackupConfig -- backup configuration (backend selection, credentials, schedule) |
| B296 | P2 | MCPSettings.manageMCPServers -- MCP server list with add/remove/edit/restart controls |
| B297 | P2 | TranslateSettings.configureLanguages -- translation service provider and language pair configuration |
| B298 | P2 | WebSearchSettings.configureProviders -- web search provider selection and API key configuration |
| B299 | P2 | AssistantSettings.setDefaults -- default assistant parameters (temperature, top_p, system prompt) |
| B300 | P2 | DisplaySettings.setFontSize -- font size slider with live preview |
| B301 | P2 | DisplaySettings.setMessageStyle -- message style toggle (bubble/plain) |
| B302 | P2 | DisplaySettings.setSidebarPosition -- sidebar position (left/right) |
| B303 | P2 | ToolSettings.manageShortcuts -- keyboard shortcut list with add/edit/remove and conflict detection |
| B304 | P2 | MemorySettings.configureContext -- context window and memory settings |
| B305 | P2 | AgentSettings.configureAgent -- agent behavior configuration |
| B306 | P2 | DocProcessSettings.configureProcessing -- document processing settings (chunk size, splitter) |
| B307 | P2 | SelectionAssistantSettings.configure -- text selection assistant behavior settings |
| B308 | P3 | DataSettings.changeDataPath -- data storage path migration with progress |
| B309 | P3 | DataSettings.importExport -- data import/export for migration |
| B310 | P3 | AboutPage (if included) -- version display, update check, links |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F009-settings-ui provides the unified settings interface for configuring all application features across 14 settings pages. It encompasses provider configuration (API keys, base URLs, model management), model settings (default model per task), display settings (theme, font size, message style, sidebar position), data management (backup configuration for local/WebDAV/S3, storage path, import/export), MCP server management UI, translation service configuration, web search provider configuration, assistant defaults (temperature, system prompt), memory/context window settings, agent configuration, document processing settings, selection assistant settings, and tool/shortcut management. This is the heaviest UI migration target as all 14 settings pages use Ant Design components extensively with over 20 distinct Ant Design component types requiring shadcn/ui equivalents.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Provider configuration | User configures AI provider with API key, base URL; tests connection; manages model list |
| P1 | Default model selection | User selects default model for chat, translation, and other task types |
| P1 | Settings navigation | User navigates between 14 settings sections via sidebar navigation |
| P2 | Display settings | User configures theme (Light/Dark/System), font size, message style (bubble/plain), sidebar position |
| P2 | Backup configuration | User configures backup backend (local/WebDAV/S3), credentials, and schedule |
| P2 | MCP server management | User adds, edits, removes, and restarts MCP servers from settings |
| P2 | Translation settings | User configures translation service provider and language pairs |
| P2 | Web search settings | User configures web search provider and API keys |
| P2 | Assistant defaults | User sets default assistant parameters (temperature, top_p, system prompt) |
| P2 | Shortcut management | User views, adds, edits keyboard shortcuts with conflict detection |
| P3 | Data path migration | User changes data storage path; data migrated with progress indicator |
| P3 | Data import/export | User imports or exports application data for migration |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Settings page layout with sidebar navigation across 14 sections
- **FR-002**: Provider configuration form (API key, base URL, model list, connection test)
- **FR-003**: Model settings (default model selection per task type)
- **FR-004**: Display settings (theme, font size, message style, sidebar position)
- **FR-005**: Data settings (backup backend config, storage path, import/export)
- **FR-006**: MCP settings (server list with CRUD and restart controls)
- **FR-007**: Translation settings (provider and language pair configuration)
- **FR-008**: Web search settings (provider selection and API key configuration)
- **FR-009**: Assistant settings (default parameters: temperature, top_p, system prompt)
- **FR-010**: Memory settings (context window configuration)
- **FR-011**: Agent settings (agent behavior configuration)
- **FR-012**: Document processing settings (chunk size, splitter type)
- **FR-013**: Selection assistant settings (text selection behavior)
- **FR-014**: Tool settings (keyboard shortcut management with conflict detection)

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: All settings persist across app restarts and take effect immediately (or after restart for hardware acceleration)
- **SC-002**: Provider configuration correctly displays all system providers and allows user-created providers
- **SC-003**: Model list updates reflect in real-time when models are added or removed per provider
- **SC-004**: Display settings changes apply immediately to the chat interface
- **SC-005**: Backup configuration correctly validates WebDAV/S3 credentials before saving
- **SC-006**: MCP server management correctly reflects server status (running/stopped/error)
- **SC-007**: Keyboard shortcut conflicts are detected and reported to user
- **SC-008**: Settings navigation between 14 sections is smooth with no loading delays

### Edge Cases

- Hardware acceleration toggle requires app restart; clear notification to user
- Keyboard shortcut conflicts between system and custom shortcuts; conflict detection and resolution
- Data path migration with large data directories; progress indication and error recovery
- Theme change while settings page is open; all settings components re-render correctly
- Invalid API key format; form validation before save with clear error messages
- WebDAV/S3 connection test failure; timeout handling with retry suggestion
- Language change requiring i18n reload; settings page labels update without navigation
- System provider deletion attempt; blocked with explanation (can only be disabled)
- MCP server with invalid configuration; validation before start attempt
- Very long model list (100+ models); virtualized list rendering
- Concurrent settings changes from multiple windows; last-write-wins with conflict warning

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-app-core | Infrastructure | Uses IPC framework for config get/set, theme management, window management, zoom factor, shortcut registration |
| F002-ai-provider | Entity | Displays and configures Provider and Model entities owned by F002 |

### Related Entities (data-model.md draft)

#### Owned Entities

F009-settings-ui does not own persistent entities. It provides the UI surface for configuring entities owned by other features.

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| Provider | F002-ai-provider | Read/Write | Display and configure provider settings |
| Model | F002-ai-provider | Read/Write | Display and manage models per provider |
| MCPServer | F006-mcp | Read/Write | Display and configure MCP server settings |
| KnowledgeBase | F007-knowledge | Read | Display knowledge base configuration |
| FileMetadata | F008-file-management | Read | Display file/backup management |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| Zustand | `useSettingsStore` | Settings UI state management (active tab, form state) |
| Hook | `useSettings()` | React hook for settings access and mutation |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| IPC | `app:*` | F001-app-core | Theme set, zoom set, language set, launch config, hardware acceleration |
| IPC | `config:*` | F001-app-core | Config get/set for all settings persistence |
| IPC | `window:*` | F001-app-core | Window management for settings interactions |
| IPC | `mcp:*` | F006-mcp | MCP server configuration and status |
| IPC | `backup:*` | F008-file-management | Backup configuration and trigger |
| IPC | `knowledge:*` | F007-knowledge | Knowledge base configuration display |
| IPC | `provider:*` | F002-ai-provider | Provider and model configuration |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Settings pages are almost entirely renderer-side UI code using Ant Design forms, tables, modals, and layout components across 14 subdirectories. State is managed via Redux settings slice. Settings changes dispatch IPC calls to the main process for persistence. Over 20 distinct Ant Design component types are used extensively.
- **Recommended implementation approach**: Complete UI rebuild using shadcn/ui + Radix primitives. Replace Ant Design Form with react-hook-form + zod validation (shadcn pattern). Replace Redux settings slice with Zustand store. Replace all styled-components with Tailwind utility classes. This is the highest-effort migration among all features. Prioritize settings pages by user impact: Provider > Model > Display > Data > MCP > Translation > WebSearch > Assistant > Memory > Agent > DocProcess > SelectionAssistant > Tool.
- **Caveats**: This is the **heaviest UI migration** since every settings page uses Ant Design extensively with 20+ component types. Consider breaking into sub-tasks per settings page. Form validation patterns differ significantly between Ant Design Form and react-hook-form + zod. Table components (model lists, server lists, shortcut lists) require TanStack Table integration.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Provider settings | F002-ai-provider | Verify F009 correctly reads/writes Provider and Model entities through F002's API |
| Theme broadcast | F001-app-core | Verify theme changes from F009 trigger F001's theme broadcast to all windows |
| MCP settings | F006-mcp | Verify F009 correctly displays and configures MCP servers through F006's API |
| Backup settings | F008-file-management | Verify F009 correctly configures backup connection settings through F008's API |
| Knowledge settings | F007-knowledge | Verify F009 correctly displays knowledge base configuration through F007's API |
| Shortcut registration | F001-app-core | Verify F009's shortcut changes register correctly with F001's shortcut service |
| Zoom persistence | F001-app-core | Verify F009's zoom factor changes persist correctly |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F001-app-core | Config schema | If settings page adds new config keys, F001 must handle them in ConfigManager |
| F002-ai-provider | UI contract | If provider settings page changes, F002's provider entity display must remain compatible |
| F006-mcp | UI contract | If MCP settings page changes, F006's server configuration flow must remain compatible |
| F008-file-management | UI contract | If backup settings page changes, F008's connection configuration must remain compatible |
| F007-knowledge | UI contract | If knowledge settings page changes, F007's configuration display must remain compatible |
