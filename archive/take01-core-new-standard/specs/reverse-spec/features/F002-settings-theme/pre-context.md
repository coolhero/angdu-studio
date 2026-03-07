# Pre-Context: Settings & Theme

**Feature ID**: F002
**Tier**: Tier 1
**Generated**: 2026-03-02

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/renderer/src/store/settings.ts` | Settings Redux slice (250+ fields) |
| `src/renderer/src/store/migrate.ts` | 199 numbered Redux persist migrations (3266 lines) |
| `src/renderer/src/store/index.ts` | Redux store configuration with persist |
| `src/main/services/ProxyManager.ts` | HTTP/SOCKS proxy management |
| `src/main/services/ThemeService.ts` | Theme application service |
| `src/renderer/src/pages/settings/` | Settings UI pages |
| `src/renderer/src/hooks/useSettings.ts` | Settings hook |

### Reference Guide

#### [New Stack] Logic-Only Reference
- Extract: Settings field schema, proxy configuration logic, theme modes, migration rules
- Ignore: Redux createSlice pattern, Ant Design form components, Styled Components

### Static Resources

None — this Feature uses resources from F001-app-core.

### Environment Variables

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| `CSLOGGER_MAIN_LEVEL` | config | No | Override main log level | `info` |
| `CSLOGGER_RENDERER_LEVEL` | config | No | Override renderer log level | `info` |

**Shared variables**: Uses `config:get/set` from F001-app-core.

---

## For /speckit.specify

### Existing Feature Summary

Settings & Theme manages 250+ application settings including UI preferences (theme, font, layout), messaging behavior (send shortcut, paste threshold), proxy configuration (system/custom/none), language selection, export integrations (Notion, Yuque, Joplin, Obsidian, SiYuan), and developer mode. Theme supports light/dark/system with custom accent color, fonts, and CSS injection.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Theme Toggle | User switches between light/dark/system theme; UI updates immediately |
| P1 | Proxy Setup | User configures custom proxy URL; all network requests route through it |
| P2 | Send Shortcut | User changes send message shortcut (Enter vs Shift+Enter); input behavior updates |
| P2 | Font Customization | User sets custom font family; all text renders in chosen font |

### Draft Requirements

- **FR-011**: Implement settings store with Zustand persist (replacing Redux, 250+ fields)
- **FR-012**: Implement theme system with light/dark/system modes, custom accent color, custom fonts, CSS injection
- **FR-013**: Implement proxy management (system/custom/none modes) applied globally
- **FR-014**: Implement settings migration framework (to handle future schema changes)
- **FR-015**: Implement settings UI with organized sections

### Draft Acceptance Criteria

- **SC-006**: Theme switch takes effect within 100ms without page reload
- **SC-007**: Proxy settings apply to all HTTP/HTTPS/SOCKS requests globally
- **SC-008**: All 250+ settings persist across app restarts
- **SC-009**: Settings migration handles corrupted/missing data gracefully

### Edge Cases

- Migration from Redux persist format to Zustand persist format (one-time)
- System theme following OS changes in real-time
- Proxy with authentication (username:password in URL)
- Custom CSS injection with invalid CSS (must not break UI)

---

## For /speckit.plan

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-app-core | Config storage | Uses config:get/set IPC for persistent config |
| F001-app-core | IPC | Uses app:set-theme, app:set-proxy IPC channels |

### Related Entities

#### Owned Entities

**SettingsState** — 250+ fields organized into UI, messaging, proxy, language, export, developer, OpenAI, API server sections. See `src/renderer/src/store/settings.ts` for full schema.

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Redux slice with 250+ fields. 199 migrations handle schema evolution. ProxyManager applies proxy to Electron session and Node.js fetch.
- **Recommended implementation approach**: Single Zustand store with `persist` middleware. Use Zustand's `migrate` option for schema versioning. Keep ProxyManager IPC pattern.
- **Caveats**: The 199 Redux persist migrations represent years of schema evolution. For the new project, start fresh with a clean schema but ensure the migration framework can handle future changes.

---

## For /speckit.analyze

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Proxy settings | F003, F005 | Verify proxy applies to all AI provider API calls |
| Theme | All UI Features | Verify theme CSS variables are consumed by all components |
| Send shortcut | F004 | Verify chat input respects sendMessageShortcut setting |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| All Features | Settings access | If setting keys change, consuming Features need updates |
| F005 | OpenAI settings | If openAI.* settings change, completion pipeline is affected |
| F009 | Backup settings | If webdav*/s3* settings change, backup triggers are affected |
