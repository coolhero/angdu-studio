# Pre-Context: Settings UI

**Feature ID**: F008
**Tier**: Tier 2
**Generated**: 2026-03-04

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/renderer/src/pages/settings/` | Settings pages (all subdirs and files) |
| `src/renderer/src/store/settings.ts` | Settings state slice |
| `src/renderer/src/store/shortcuts.ts` | Keyboard shortcuts state slice |
| `src/renderer/src/hooks/useSettings.ts` | Settings access hook |
| `src/renderer/src/hooks/useShortcuts.ts` | Shortcuts management hook |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Extract: Settings key schema and default values, settings category organization, shortcut key definitions and conflict detection, settings persistence logic, settings import/export format, proxy configuration logic, launch-on-boot logic
- Ignore: Redux settings/shortcuts slices (migrating to Zustand), Ant Design settings forms and layout components (migrating to shadcn/ui + Radix), styled-components styling (migrating to Tailwind), React Router settings routes (migrating to TanStack Router)

### Static Resources

None.

### Environment Variables

None.

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

Settings UI provides the comprehensive configuration interface for Cherry Studio. It organizes settings into multiple categories: general (language, theme, launch behavior), display (font, layout, message style), model defaults, provider management links, MCP server configuration, memory settings, agent settings, data management (backup, import/export, clear), shortcut customization, and an about page. Each settings page reads from and writes to the centralized settings store.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | General Settings | User configures language, theme, startup behavior, proxy settings |
| P1 | Display Settings | User adjusts font size, message bubble style, layout preferences |
| P1 | Provider Settings | User navigates to provider configuration (delegates to F002) |
| P2 | Model Settings | User sets default models for chat, translation, etc. |
| P2 | MCP Settings | User configures MCP server connections |
| P2 | Data Settings | User triggers backup, import/export, or data clear operations |
| P2 | Shortcut Customization | User modifies keyboard shortcuts, detects conflicts |
| P3 | Memory Settings | User configures memory extraction and retention |
| P3 | Agent Settings | User configures agent defaults |
| P3 | About Page | User views version info, checks for updates |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Implement general settings page (language, theme, launch-on-boot, proxy, send key)
- **FR-002**: Implement display settings page (font size, message style, code theme, layout)
- **FR-003**: Implement model settings page (default models per use case)
- **FR-004**: Implement provider settings page (links to F002 provider management)
- **FR-005**: Implement MCP settings page (MCP server configuration)
- **FR-006**: Implement memory settings page (memory feature configuration)
- **FR-007**: Implement agent settings page (agent defaults)
- **FR-008**: Implement data settings page (backup triggers, import/export, clear data)
- **FR-009**: Implement shortcut customization with conflict detection
- **FR-010**: Implement about page (version info, update check, links)

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: All settings changes persist across app restarts
- **SC-002**: Language change updates all UI text without app restart
- **SC-003**: Theme change applies immediately across all pages
- **SC-004**: Shortcut conflicts are detected and reported before saving
- **SC-005**: Data clear operations require confirmation and execute completely

### Edge Cases

- Shortcut conflict between user-defined and system shortcuts
- Settings import with incompatible or corrupted format
- Proxy settings with invalid host/port
- Settings migration from older app version
- Concurrent settings changes from multiple windows

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-core-platform | IPC, Config | Settings persistence via electron-store; IPC channels for app config |
| F002-provider-management | Entity reference | Provider settings page references Provider entities |

### Related Entities (data-model.md draft)

#### Owned Entities

**SettingsState** -- Refer to the corresponding section in entity-registry.md

**Shortcut** -- Refer to the corresponding section in entity-registry.md

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| Provider | F002-provider-management | Read access | Provider list for provider settings page |
| Model | F002-provider-management | Read access | Model list for default model selection |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Settings pages use Ant Design forms with Redux-backed state. Shortcuts stored in Redux with conflict detection. Settings are organized into category-based sub-pages with React Router navigation.
- **Recommended implementation approach**: Replace Ant Design forms with shadcn/ui form components (Input, Select, Switch, Slider). Replace Redux settings/shortcuts slices with Zustand stores. Replace React Router settings navigation with TanStack Router nested routes. Use Tailwind for all layout and styling.
- **Caveats**: Settings page is heavily UI-dependent; most logic is presentation-layer. The key extraction targets are settings key schemas, default values, and shortcut conflict detection logic.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Settings keys | F001-core-platform | Verify settings key schema matches electron-store config keys |
| Provider settings | F002-provider-management | Verify provider settings page correctly displays and navigates to provider management |
| Backup triggers | F007-backup-sync | Verify data settings page correctly triggers backup operations |
| MCP config | F006-mcp-integration | Verify MCP settings page correctly configures MCP servers |
| Memory config | F011-memory-system | Verify memory settings page correctly configures memory feature |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F007-backup-sync | Config dependency | If backup-related settings keys change, backup service must adapt |
| F005-ai-chat | Display config | If display settings (font, message style) change, chat rendering must adapt |
| All Features | Theme | If theme settings structure changes, all themed components are affected |
