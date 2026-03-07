# Pre-Context: Settings UI

**Feature ID**: F008-settings-ui
**Tier**: Tier 2
**Generated**: 2026-03-04

---

## Source Reference

**Source Root**: `/Users/coolhero/Study/oss/cherry-studio`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/renderer/src/pages/settings/` | All settings pages (General, Provider, Model, Shortcuts, Display, Data, About, Proxy) |
| `src/renderer/src/components/Settings/` | Shared settings components (layout, navigation, form primitives) |
| `src/renderer/src/store/settings.ts` | Settings store (Redux slice for all settings state) |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding **general settings behavior (language, theme, zoom, launch behavior, hardware acceleration), provider settings display and configuration flow, model management UI per provider, keyboard shortcuts management (system shortcuts, custom shortcuts, insertion strategy: first/last/after-key), display settings (font size, message style, sidebar position), data management settings (backup configuration, data path), about page (version, update check, links), proxy configuration flow**
- Do not reference: Ant Design components throughout ALL settings pages (migrating to shadcn/ui + Radix), styled-components styling (migrating to Tailwind-only), Redux `createSlice` / `useSelector` / `useDispatch` patterns (migrating to Zustand)
- **Extract**: Settings page structure and navigation hierarchy, form field validation rules, keyboard shortcut registration and conflict detection logic, shortcut insertion strategy (first/last/after-key) with deduplication by key, zoom factor persistence workaround, theme selection and broadcast trigger, proxy mode configuration (system/custom/none), data path selection and migration, hardware acceleration toggle requiring app restart, launch behavior configuration (launch-to-tray, tray-on-close)
- **Ignore**: Ant Design `Form` / `Input` / `Select` / `Switch` / `Slider` / `Modal` / `Table` / `Tabs` / `Radio` / `Checkbox` / `Button` / `ConfigProvider` components (migrating to shadcn/ui equivalents), styled-components wrappers, Redux slice patterns

**Note**: This is the heaviest UI migration -- all settings pages use Ant Design extensively.

### Static Resources

> Non-code files used by this Feature that must be **copied from the original source** during implementation.

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| (none) | | | Settings UI has no static resources; all configuration is dynamic |

### Environment Variables

> Environment variables required by this Feature at runtime.

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| (none specific to F008) | | | | |

**Shared variables** (defined by other Features but also used here):

| Variable | Owner Feature | Usage in This Feature |
|----------|--------------|----------------------|
| `CSLOGGER_RENDERER_LEVEL` | F001-core-platform | Log level for renderer-side settings state updates |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F008-settings-ui provides the unified settings interface for configuring all application features. It encompasses general settings (language, theme, zoom, launch behavior, hardware acceleration), provider settings display and configuration, model management UI per provider, keyboard shortcuts management with system and custom shortcuts using insertion strategies (first/last/after-key) with deduplication, display settings (font size, message style, sidebar position), data management settings (backup configuration, data path), about page (version, update check, links), and proxy configuration. This is the heaviest UI migration target as all settings pages use Ant Design components extensively.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | General settings | User configures language, theme, zoom factor, launch behavior, and hardware acceleration |
| P1 | Provider configuration | User views and configures AI providers with API keys, base URLs, and settings |
| P1 | Model management | User manages models per provider (add, remove, configure capabilities) |
| P2 | Keyboard shortcuts | User views system shortcuts, creates custom shortcuts, manages insertion strategy |
| P2 | Display settings | User configures font size, message style (bubble/plain), sidebar position |
| P2 | Data management | User configures backup settings, changes data storage path |
| P3 | About page | User checks version, triggers update check, accesses project links |
| P3 | Proxy configuration | User configures proxy mode (system/custom/none) and custom proxy settings |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: General settings (language, theme, zoom, launch behavior, hardware acceleration)
- **FR-002**: Provider settings display and configuration
- **FR-003**: Model management UI per provider
- **FR-004**: Keyboard shortcuts management (system shortcuts, custom shortcuts, insertion strategy)
- **FR-005**: Display settings (font size, message style, sidebar position)
- **FR-006**: Data management settings (backup configuration, data path)
- **FR-007**: About page (version, update check, links)
- **FR-008**: Proxy configuration UI

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: All general settings persist across app restarts and take effect immediately (or after restart for hardware acceleration)
- **SC-002**: Provider settings correctly display all 63 system providers and allow user-created providers
- **SC-003**: Model list updates reflect in real-time when models are added or removed per provider
- **SC-004**: Custom keyboard shortcuts register without conflicts with system shortcuts
- **SC-005**: Display settings changes apply immediately to the chat interface
- **SC-006**: Data path migration completes without data loss
- **SC-007**: Proxy settings correctly route all network requests through configured proxy

### Edge Cases

- Hardware acceleration toggle requires app restart; clear notification to user
- Keyboard shortcut conflicts between system and custom shortcuts; conflict detection and resolution
- Data path migration with large data directories; progress indication and error recovery
- Theme change while settings page is open; all settings components re-render correctly
- Proxy configuration with invalid proxy URL; validation before apply
- Zoom factor persistence across window resize events (Electron bug workaround)
- Language change requiring i18n reload; settings page labels update without navigation
- System provider deletion attempt; blocked with explanation (can only be disabled)

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-core-platform | Infrastructure | Uses IPC framework for config get/set, theme management, window management, zoom factor |
| F002-provider-management | Entity | Displays and configures Provider and Model entities owned by F002 |

### Related Entities (data-model.md draft)

#### Owned Entities

**Shortcut** -- Settings-specific entity for keyboard shortcut management

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| key | string | PK, required | Unique shortcut identifier (e.g., `toggle-sidebar`) |
| shortcut | string[] | required | Key combination(s) (e.g., `['Ctrl+B']`) |
| enabled | boolean | default true | Whether shortcut is active |
| system | boolean | default false | Whether this is a system-defined shortcut |

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| Provider | F002-provider-management | Read/Write | Display and configure provider settings |
| Model | F002-provider-management | Read/Write | Display and manage models per provider |
| MCPServer | F006-mcp-integration | Read/Write | Display and configure MCP server settings |
| KnowledgeBase | F004-knowledge-base | Read | Display knowledge base settings |
| Assistant | F005-ai-chat | Read | Display assistant-related settings |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| Zustand | `useSettingsStore` | Settings state management |
| Hook | `useSettings()` | React hook for settings access |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| IPC | `app:*` | F001-core-platform | Theme set, zoom set, language set, launch config, hardware acceleration |
| IPC | `config:*` | F001-core-platform | Config get/set for all settings persistence |
| IPC | `window:*` | F001-core-platform | Window management for settings window |
| IPC | `mcp:*` | F006-mcp-integration | MCP server configuration display |
| IPC | `backup:*` | F007-backup-sync | Backup configuration settings |

### Business Rules

F008 does not own dedicated business rules. It surfaces configuration governed by business rules owned by other features:

| Referenced Rule | Owner Feature | Settings UI Surface |
|-----------------|--------------|---------------------|
| BR-051 | F001 | Config observer pattern for settings change notification |
| BR-052 | F001 | Default config values displayed as placeholders/defaults |
| BR-055 | F001 | Shortcut filtering (system=true persisted to config) |
| BR-056 | F001 | Theme validation (light/dark/system) |
| BR-090 | F001 | Shortcut insertion strategy (first/last/after-key) |
| BR-093 | F002 | System vs user provider separation (system cannot be deleted) |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Settings pages are almost entirely renderer-side UI code using Ant Design forms, tables, modals, and layout components. State is managed via Redux settings slice. Settings changes dispatch IPC calls to the main process for persistence.
- **Recommended implementation approach**: Complete UI rebuild using shadcn/ui + Radix primitives. Replace Ant Design Form with react-hook-form + zod validation (shadcn pattern). Replace Redux settings slice with Zustand store. Replace all styled-components with Tailwind utility classes. This is the highest-effort migration among all features.
- **Caveats**: This is the **heaviest UI migration** since every settings page uses Ant Design extensively. Prioritize settings pages by user impact: General > Provider > Model > Shortcuts > Display > Data > About > Proxy. Consider breaking into sub-tasks per settings page.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Provider settings | F002-provider-management | Verify F008 correctly reads/writes Provider and Model entities through F002's API |
| Theme broadcast | F001-core-platform | Verify theme changes from F008 trigger F001's theme broadcast to all windows |
| MCP settings | F006-mcp-integration | Verify F008 correctly displays and configures MCP servers through F006's API |
| Backup settings | F007-backup-sync | Verify F008 correctly configures backup connection settings through F007's API |
| Shortcut registration | F001-core-platform | Verify F008's shortcut changes register correctly with F001's shortcut service |
| Zoom persistence | F001-core-platform | Verify F008's zoom factor changes persist correctly through F001's workaround |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F001-core-platform | Config schema | If settings page adds new config keys, F001 must handle them in ConfigManager |
| F002-provider-management | UI contract | If provider settings page changes, F002's provider entity display must remain compatible |
| F006-mcp-integration | UI contract | If MCP settings page changes, F006's server configuration flow must remain compatible |
| F007-backup-sync | UI contract | If backup settings page changes, F007's connection configuration must remain compatible |
