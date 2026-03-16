# F003 - settings: Pre-Context

## 1. Runtime Exploration Results

| Observation | Value | Relevance |
|---|---|---|
| Settings route | #/settings | Settings page accessed via hash route |
| Settings sidebar | Separate left sidebar nav within settings | Settings has its own internal navigation |
| Default theme | "light" | Display settings controls theme |
| navbarPosition | "top" | General settings controls this |
| Window size | 960x600 | Settings layout must fit |

**Screens owned**: Settings page with all sub-pages (General, Display, Data, Shortcuts), settings sidebar navigation.

## 2. Source Reference

| File Path | Role | Rebuild Target |
|---|---|---|
| src/renderer/src/pages/settings/ | Settings page directory (all sub-pages) | [TBD] |
| src/renderer/src/pages/settings/GeneralSettings.tsx | General settings (language, startup, navbar position) | [TBD] |
| src/renderer/src/pages/settings/DisplaySettings.tsx | Display settings (theme, font size, avatar style) | [TBD] |
| src/renderer/src/pages/settings/DataSettings.tsx | Data settings (export, import, clear, backup) | [TBD] |
| src/renderer/src/pages/settings/ShortcutSettings.tsx | Keyboard shortcuts configuration | [TBD] |
| src/renderer/src/store/settings.ts | Settings state (Redux slice) | [TBD] |
| src/renderer/src/store/shortcuts.ts | Keyboard shortcuts state | [TBD] |
| src/renderer/src/hooks/useSettings.ts | Settings hook | [TBD] |
| src/renderer/src/hooks/useShortcuts.ts | Shortcuts hook | [TBD] |
| src/renderer/src/services/QuickPhraseService.ts | Quick phrases management | [TBD] |
| src/main/services/ConfigManager.ts | Config persistence (main process) | [TBD] |

## 3. Source Behavior Inventory

| ID | File | Behavior | Priority |
|---|---|---|---|
| B056 | settings/ (index) | Render settings page with sidebar navigation | P1 |
| B057 | settings/ (index) | Settings sidebar → sub-page routing (General, Display, Data, etc.) | P1 |
| B058 | GeneralSettings.tsx | Language selection (i18n locale switch) | P1 |
| B059 | GeneralSettings.tsx | Startup behavior (launch at login, start minimized) | P2 |
| B060 | GeneralSettings.tsx | Navbar position toggle (top/left) | P1 |
| B061 | GeneralSettings.tsx | Proxy settings input (host, port, auth) | P2 |
| B062 | GeneralSettings.tsx | Default send key configuration (Enter vs Ctrl+Enter) | P2 |
| B063 | GeneralSettings.tsx | Auto-update toggle | P2 |
| B064 | DisplaySettings.tsx | Theme selection (light/dark/system) | P1 |
| B065 | DisplaySettings.tsx | Font size adjustment | P2 |
| B066 | DisplaySettings.tsx | Avatar style selection | P3 |
| B067 | DisplaySettings.tsx | Message style options (bubble vs plain) | P2 |
| B068 | DisplaySettings.tsx | Code block theme selection | P3 |
| B069 | DisplaySettings.tsx | Custom CSS injection | P3 |
| B070 | DataSettings.tsx | Export data (conversations, settings) | P1 |
| B071 | DataSettings.tsx | Import data from file | P1 |
| B072 | DataSettings.tsx | Clear all data with confirmation | P1 |
| B073 | DataSettings.tsx | Backup/restore configuration | P2 |
| B074 | DataSettings.tsx | Data storage location display | P2 |
| B075 | ShortcutSettings.tsx | Display current keyboard shortcuts | P2 |
| B076 | ShortcutSettings.tsx | Edit keyboard shortcut binding | P2 |
| B077 | ShortcutSettings.tsx | Reset shortcuts to defaults | P2 |
| B078 | shortcuts.ts | Register/unregister shortcut handlers | P2 |
| B079 | QuickPhraseService.ts | CRUD quick phrases (predefined text snippets) | P3 |
| B080 | QuickPhraseService.ts | Quick phrase search and insertion | P3 |

## 4. UI Component Features

| Source Component | Library | Usage | New Stack Equivalent |
|---|---|---|---|
| Menu | AntD Menu | Settings sidebar navigation | shadcn/ui NavigationMenu or Tabs (vertical) |
| Switch | AntD Switch | Toggle settings (auto-update, launch at login) | shadcn/ui Switch |
| Select | AntD Select | Dropdowns (language, theme, send key) | shadcn/ui Select |
| Slider | AntD Slider | Font size adjustment | shadcn/ui Slider |
| Input | AntD Input | Proxy host/port, custom CSS | shadcn/ui Input |
| Button | AntD Button | Export, Import, Clear data | shadcn/ui Button |
| Modal | AntD Modal | Confirmation dialogs (clear data) | shadcn/ui AlertDialog |
| Radio.Group | AntD Radio | Message style, avatar style | shadcn/ui RadioGroup |
| ColorPicker | AntD ColorPicker | Theme accent color | shadcn/ui custom or native |
| Divider | AntD Divider | Section separators | Tailwind4 border/hr |

## 5. Interaction Behavior Inventory

| Interaction | Trigger | Behavior |
|---|---|---|
| Setting change | Toggle/select/input change | Immediately persist to config (no save button) |
| Theme switch | Select theme option | Instant visual theme change across app |
| Navbar mode switch | Toggle navbar position | Instant layout restructure |
| Language change | Select language | Reload i18n, may require restart prompt |
| Data export | Click Export button | Show save dialog, write JSON/ZIP file |
| Data import | Click Import button | Show open dialog, parse and apply data |
| Clear data | Click Clear button | Show confirmation modal, then purge |
| Shortcut edit | Click on shortcut field | Enter recording mode, capture key combo |
| Shortcut conflict | Record existing shortcut combo | Show conflict warning |

## 6. Foundation Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Settings persistence | Immediate write (no explicit save) | UX: settings apply instantly |
| Settings state | Zustand store (new stack) | Replaces Redux settings slice |
| Settings storage | better-sqlite3 via F001 Config API | New stack decision |
| Theme engine | Tailwind4 dark mode + CSS variables | Replaces AntD theme tokens |
| i18n | i18next (keep from source) | Well-supported, same as source |

## 7. Foundation Dependencies

| Relationship | Item | Direction |
|---|---|---|
| **owns** | Settings UI and sub-pages | F003 exclusive |
| **owns** | Settings state (Zustand store) | F003 defines |
| **owns** | Keyboard shortcuts configuration | F003 exclusive |
| **owns** | Quick phrases | F003 exclusive |
| **owns** | Data export/import/clear | F003 exclusive |
| **consumes** | Config API | From F001 (read/write config) |
| **consumes** | Theme API | From F001 (nativeTheme sync) |
| **consumes** | Navigation/Tab API | From F002 (settings opens as tab) |
| **consumes** | IPC bridge | From F001 (dialog, shell, file ops) |
| **extends** | Global shortcuts | F001 owns registration, F003 configures bindings |

## 8. Naming Remapping

| Source Identifier | Target Identifier | Location |
|---|---|---|
| CherryStudio settings labels | AngduStudio | UI strings, i18n keys |
| cherry-studio config keys | angdu-studio config keys | ConfigManager keys |
| CherryINOAuthService references | Remove or rebrand | If settings references Cherry auth |

## 9. Static Resources

| Resource | Path | Usage |
|---|---|---|
| i18n locale files | src/renderer/src/i18n/ | Language translations for settings labels |
| Default avatar images | src/renderer/src/assets/avatars/ | Avatar style preview |
| Code theme previews | (inline or CSS) | Code block theme selection preview |

## 10. Environment Variables

| Variable | Usage | Feature |
|---|---|---|
| ANGDU_DEFAULT_LANGUAGE | Override default language | GeneralSettings |
| ANGDU_CONFIG_PATH | Override config file location | DataSettings |

## 11. Feature Contracts

### Provides
- **Settings State**: All user preferences readable by any feature → F004, F005, F002
- **Theme Setting**: Current theme value → F001 (nativeTheme sync), all UI components
- **Navbar Position**: "top" or "left" → F002 (layout mode)
- **Send Key Config**: Enter vs Ctrl+Enter → F005 (chat input)
- **Proxy Config**: proxy URL, auth → F001 (ProxyManager), F004 (API calls)
- **Data Export/Import**: Full app data backup → standalone
- **Shortcut Config**: Key bindings map → F001 (ShortcutService)
- **Quick Phrases**: Phrase list → F005 (chat input)

### Requires
- **From F001**: Config API (read/write persistent storage)
- **From F001**: IPC bridge (dialogs, shell, file ops)
- **From F001**: Theme API (nativeTheme sync)
- **From F002**: Navigation (settings page route, tab integration)

## 12. For /speckit.specify

### Draft Functional Requirements
- FR-018: Settings must apply immediately without explicit save action
- FR-019: Theme switch must update all UI components instantly
- FR-020: Data export must produce a restorable backup file
- FR-021: Data import must validate format before applying
- FR-022: Clear data must require explicit user confirmation
- FR-023: Keyboard shortcuts must detect and warn on conflicts
- FR-024: Language change must update all visible UI text
- FR-025: Settings sidebar must indicate active sub-page

### Draft Success Criteria
- SC-008: Setting change → visible effect < 100ms
- SC-009: Theme switch → full repaint < 200ms
- SC-010: Data export of 1000 conversations < 5 seconds
- SC-011: All settings survive app restart

### Edge Cases
- Settings file corrupted → reset to defaults with notification
- Data import from incompatible version → show version mismatch warning
- Shortcut conflicts with system shortcuts → warn but allow
- Font size set to extreme values → clamp to min/max
- Export while data is being written → ensure consistent snapshot
- Language file missing → fallback to English

## 13. For /speckit.plan

### Dependencies
- i18next + react-i18next (i18n)
- Zustand (settings store)
- better-sqlite3 via F001 (persistence)

### Entity Drafts
- **UserSettings**: { language, theme, navbarPosition, fontSize, sendKey, autoUpdate, proxyConfig, ... }
- **KeyboardShortcut**: { id, action, keys, isDefault, isGlobal }
- **QuickPhrase**: { id, title, content, order }

### API Drafts
- Store: `useSettingsStore` — all settings + setters
- Store: `useShortcutsStore` — shortcuts[], updateShortcut, resetDefaults
- IPC: `config:get(key)`, `config:set(key, value)`, `config:export()`, `config:import(data)`

### Tech Decisions
- Zustand for settings state (replaces Redux)
- Tailwind4 dark: variant for theme (replaces AntD theme tokens)
- shadcn/ui form components (replaces AntD form components)
- better-sqlite3 for config persistence (replaces electron-store)

## 14. For /speckit.analyze

### Cross-Feature Verification Points
- F003↔F001: Config API must handle all settings keys; theme sync must be bidirectional
- F003↔F002: navbarPosition change must trigger F002 layout switch without page reload
- F003↔F004: Provider-specific settings (API keys, endpoints) may live in F004 but share persistence layer
- F003↔F005: sendKey, fontSize, messageStyle, quickPhrases must be accessible by chat UI
- F003 data export must include data from ALL features (conversations from F005, providers from F004)
- Settings migration must handle schema changes across versions

### Component Tree

#### Source App (Cherry Studio)
```
SettingsPage (pages/settings/SettingsPage.tsx) — styled-components + AntD
├── Sidebar (14+ items)
│   ├── Provider, Model, General, Display, Data
│   ├── MCP, WebSearch, Memory, QuickAssistant
│   ├── SelectionAssistant, DocProcess, Shortcut
│   ├── ApiServer, About
│   └── Version display
├── Routes (inline Switch)
│   ├── GeneralSettings — 15+ controls
│   │   ├── Language Select, Launch at login, Tray toggle
│   │   ├── Tray-on-close, Hardware accel, Spell check
│   │   ├── Notification, Data collection, Proxy mode
│   │   ├── Proxy host/port, Send key, Quick phrases
│   │   └── Provider-specific settings slots
│   ├── DisplaySettings — 6+ controls
│   │   ├── Theme RadioGroup, Font size, Message style
│   │   ├── Avatar style, Code theme, Custom CSS
│   │   └── Window opacity, TopicPosition
│   ├── DataSettings/ — 4+ actions
│   │   ├── Export, Import, Clear (with confirmation)
│   │   └── WebDAV sync, Backup path
│   ├── ShortcutSettings
│   ├── MCPSettings/ (21 subdirs)
│   ├── WebSearchSettings/ (10 subdirs)
│   ├── MemorySettings/
│   ├── QuickAssistantSettings/
│   ├── SelectionAssistantSettings/
│   ├── DocProcessSettings/ (12 subdirs)
│   ├── AboutSettings
│   └── AgentSettings/ (8 subdirs)
```

#### Target App (Angdu Studio)
```
SettingsPage (pages/settings/SettingsPage.tsx) — Tailwind + shadcn/ui
├── SettingsSidebar (6 items)
│   ├── Provider, Models, General, Display, Data, Shortcuts
│   └── Active item highlighting
├── <Outlet /> (react-router v7)
│   ├── GeneralSettings — 8 controls
│   │   ├── Language Select, Navbar position RadioGroup
│   │   ├── Send key RadioGroup, Launch at login Switch
│   │   ├── Start minimized Switch, Auto-update Switch
│   │   ├── Proxy host/port Inputs
│   │   └── QuickPhraseEditor (CRUD list)
│   ├── DisplaySettings — 6 controls
│   │   ├── Theme RadioGroup (light/dark/system)
│   │   ├── Font size Slider (12-24)
│   │   ├── Message style RadioGroup (bubble/plain)
│   │   ├── Avatar style RadioGroup
│   │   ├── Code theme Select
│   │   └── Custom CSS Textarea
│   ├── DataSettings — 4 actions
│   │   ├── Export (dialog → Blob download)
│   │   ├── Import (dialog → file:// fetch)
│   │   ├── Clear data (inline confirm)
│   │   └── Open storage folder, Backup retention
│   └── ShortcutSettings
│       └── Shortcut rows with ShortcutRecorder
```

#### UI Control Density Check
- **GeneralSettings**: 8 interactive controls (below 5-control threshold when counting logical groups, but QuickPhraseEditor adds variable controls) → Manageable
- **DisplaySettings**: 6 interactive controls → At threshold. Each control independently verified.
