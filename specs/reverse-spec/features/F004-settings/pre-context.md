# F004-settings Pre-Context

## Feature Summary

| Field | Value |
|-------|-------|
| **Feature ID** | F004-settings |
| **Description** | Settings UI (16 sub-pages), general/display/data config, keyboard shortcuts, quick assistant, selection assistant |
| **Tier** | 1 |
| **Release Group** | RG-2 |
| **Dependencies** | F001-shell, F002-i18n-theme, F003-providers |

## Global Context

- **Original**: Cherry Studio (`/Users/coolhero/Develop/cherry-studio`)
- **Target**: Angdu Studio — Electron + React 19 + Zustand + Tailwind 4 + shadcn/ui + Vite 7
- **Naming**: Cherry -> Angdu, CS -> AS, CherryStudio -> AngduStudio
- All source paths are RELATIVE to `cherry-studio`

## Source Reference

| File | Role |
|------|------|
| `src/renderer/src/pages/settings/SettingsPage.tsx` | Settings page layout |
| `src/renderer/src/pages/settings/` | 16 settings sub-pages |
| `src/renderer/src/store/settings.ts` | Redux settings slice |
| `src/renderer/src/store/shortcuts.ts` | Keyboard shortcuts slice |
| `src/renderer/src/hooks/useSettings.ts` | Settings hooks |

## Source Behavior Inventory (SBI)

| ID | Source File | Function/Method | Behavior Description | Priority | Origin |
|----|-------------|----------------|---------------------|----------|--------|
| B033 | `src/renderer/src/store/settings.ts` | `updateSettings()` | Updates application settings (language, theme, shortcuts, etc.) | P1 | extracted |
| B034 | `src/renderer/src/store/settings.ts` | `setShowAssistants()` | Toggles assistant sidebar visibility | P2 | extracted |
| B035 | `src/renderer/src/store/settings.ts` | `setShowTopics()` | Toggles topic list visibility | P2 | extracted |
| B036 | `src/renderer/src/store/settings.ts` | `setSendMessageShortcut()` | Configures send message key binding | P2 | extracted |
| B037 | `src/renderer/src/store/shortcuts.ts` | `updateShortcuts()` | Saves custom keyboard shortcuts | P2 | extracted |
| B038 | `src/renderer/src/pages/settings/SettingsPage.tsx` | `renderSettingsMenu()` | Renders settings navigation menu with 16 categories | P1 | extracted |
| B039 | `src/renderer/src/pages/settings/` | `ProviderSettings` | Provider configuration UI | P1 | extracted |
| B040 | `src/renderer/src/pages/settings/` | `GeneralSettings` | General app settings (language, startup, proxy) | P1 | extracted |
| B041 | `src/renderer/src/pages/settings/` | `DisplaySettings` | Display config (theme, font, zoom, code style) | P2 | extracted |
| B042 | `src/renderer/src/pages/settings/` | `DataSettings` | Data management (clear cache, app data path) | P2 | extracted |
| B043 | `src/renderer/src/pages/settings/` | `ShortcutSettings` | Keyboard shortcut configuration | P2 | extracted |
| B044 | `src/renderer/src/pages/settings/` | `QuickAssistantSettings` | Quick assistant popup configuration | P3 | extracted |
| B045 | `src/renderer/src/pages/settings/` | `SelectionAssistantSettings` | Selection assistant configuration | P3 | extracted |

## For /speckit.specify

- 16 settings categories:
  1. Model Provider
  2. Default Model
  3. General
  4. Display
  5. Data
  6. MCP Servers
  7. Web Search
  8. Memories
  9. API Server
  10. Document Processing
  11. Quick Phrases
  12. Keyboard Shortcuts
  13. Quick Assistant
  14. Selection Assistant
  15. About

## For /speckit.plan

- Migration: All Ant Design form components -> shadcn/ui form components
- Migration: Settings slice -> Zustand store
