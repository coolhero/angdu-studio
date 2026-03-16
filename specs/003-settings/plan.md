# Implementation Plan: Settings

**Branch**: `003-settings` | **Date**: 2026-03-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-settings/spec.md`

## Summary

Central configuration hub for Angdu Studio with 4 settings sub-pages (General, Display, Data, Shortcuts), quick phrases management, and data export/import. All settings apply immediately without save button. Built with Zustand stores synced to F001's electron-store via IPC, shadcn/ui form components, Tailwind CSS 4 dark mode, and i18next for internationalization.

## Technical Context

**Language/Version**: TypeScript 5.8+ (strict mode)
**Primary Dependencies**: React 19, Zustand, shadcn/ui, Tailwind CSS 4, i18next, react-i18next, JSZip, react-router-dom v7
**Storage**: electron-store via F001 Config API (IPC)
**Testing**: Vitest (unit), Playwright (E2E)
**Target Platform**: Electron v40+ (macOS, Windows, Linux)
**Project Type**: desktop-app
**Performance Goals**: Setting change → visible effect < 100ms, Theme switch < 200ms
**Constraints**: All settings immediate-apply, no save button, offline-capable
**Scale/Scope**: 4 settings sub-pages, ~11 new config keys, 3 Zustand stores

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. SSoT | ✅ PASS | Settings types in `@angdu/shared`, config defaults defined once, Zod schema shared |
| II. Explicit Over Implicit | ✅ PASS | Named Zustand actions, explicit IPC handlers, no magic |
| III. Fail Loudly | ✅ PASS | IPC errors serialized, import validation, corrupt config → reset with notification |
| IV. Composition | ✅ PASS | shadcn/ui primitives composed, Zustand middleware composed |
| V. Test Contract | ✅ PASS | Test store actions produce expected state, IPC contracts, user-visible behavior |
| VI. Progressive Enhancement | ✅ PASS | Layer 0: data model + config keys, Layer 1: settings UI, Layer 2: export/import |
| ARC-01 | ✅ PASS | All persistence via IPC bridge, no direct Node.js access in renderer |
| ARC-04 | ✅ PASS | DataService, ShortcutService as singletons in main process |
| ARC-05 | ⚠️ DEVIATION | F003 uses electron-store (not SQLite) for settings — justified: F001 chose electron-store for config, F003 extends it. Key-value config doesn't need relational storage |
| F7-03 | ✅ PASS | Native file dialogs, system tray integration, OS login item, dark/light mode follow |
| F7-04 | ✅ PASS | All new IPC channels statically typed and whitelisted in preload |

## Project Structure

### Documentation (this feature)

```text
specs/003-settings/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── settings-store.md    # Zustand store contracts
│   └── ipc-extensions.md    # New IPC channels
└── checklists/
    └── requirements.md      # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── shared/types/
│   └── settings.ts              # Settings types, Zod schemas, config key definitions
├── main/
│   ├── ipc/
│   │   ├── data.ts              # data:export/import/clear handlers
│   │   ├── shortcuts.ts         # shortcuts:register/unregister handlers
│   │   └── startup.ts           # startup:setLoginItem handler
│   └── services/
│       ├── DataService.ts       # Export/import/clear business logic
│       └── ShortcutService.ts   # Global shortcut registration
├── renderer/src/
│   ├── stores/
│   │   ├── useSettingsStore.ts      # All user preferences
│   │   ├── useShortcutsStore.ts     # Keyboard shortcuts
│   │   └── useQuickPhrasesStore.ts  # Quick phrases
│   ├── pages/settings/
│   │   ├── SettingsPage.tsx         # Layout: sidebar + Outlet
│   │   ├── SettingsSidebar.tsx      # Left nav links
│   │   ├── GeneralSettings.tsx      # Language, navbar, send key, startup, proxy, auto-update
│   │   ├── DisplaySettings.tsx      # Theme, font size, message style, avatar, code theme, CSS
│   │   ├── DataSettings.tsx         # Export, import, clear, storage path, backup config
│   │   └── ShortcutSettings.tsx     # Shortcut list, recording, conflict, reset
│   ├── components/settings/
│   │   ├── SettingItem.tsx          # Reusable setting row (label + control)
│   │   ├── SettingSection.tsx       # Section with title + divider
│   │   ├── ShortcutRecorder.tsx     # Key combo recording widget
│   │   └── QuickPhraseEditor.tsx    # Quick phrase CRUD list
│   ├── hooks/
│   │   ├── useShortcutRecorder.ts   # Recording mode logic
│   │   └── useTheme.ts             # Theme class toggle + system listener
│   └── i18n/
│       ├── index.ts                 # i18next configuration
│       └── locales/
│           ├── en.json              # English translations
│           └── zh-CN.json           # Chinese translations
└── preload/
    └── index.ts                     # Extended with new IPC channels
```

**Structure Decision**: Feature-based directory under `pages/settings/` with shared components in `components/settings/`. Stores are domain-based per Constitution. Main process services follow singleton pattern (ARC-04).

## Implementation Phases

### Phase 1: Foundation — Types, Config Keys, and Stores

**Deliverables**: Settings type definitions, Zod schemas, config key extensions, Zustand stores (useSettingsStore, useShortcutsStore, useQuickPhrasesStore)

**Details**:
1. Define settings types and Zod schemas in `src/shared/types/settings.ts`
2. Extend AppConfig type with F003-owned keys (fontSize, sendKey, messageStyle, etc.)
3. Update ConfigService to handle new keys with defaults
4. Create `useSettingsStore` with hydrate, setSetting, setTheme, setLanguage actions
5. Create `useShortcutsStore` with hydrate, updateShortcut, checkConflict actions
6. Create `useQuickPhrasesStore` with hydrate, CRUD, reorder actions

### Phase 2: Settings UI Shell — Page Layout and Routing

**Deliverables**: SettingsPage layout, SettingsSidebar, nested routing, SettingItem/SettingSection components

**Details**:
1. Create SettingsPage with left sidebar + right content (Outlet)
2. Add nested routes: /settings → redirect to /settings/general, /settings/general, /settings/display, /settings/data, /settings/shortcuts
3. Create SettingsSidebar with NavLink items and active highlighting
4. Create reusable SettingItem (label + control) and SettingSection (title + divider) components
5. Register settings route in F002's router

### Phase 3: General & Display Settings Sub-pages

**Deliverables**: GeneralSettings, DisplaySettings with all form controls

**Details**:
1. GeneralSettings: language Select, navbar position toggle, send key RadioGroup, startup Switches, proxy Inputs, auto-update Switch
2. DisplaySettings: theme RadioGroup (light/dark/system), font size Slider, message style RadioGroup, avatar style RadioGroup, code block theme Select, custom CSS textarea
3. Wire all controls to useSettingsStore actions (immediate-apply)
4. Implement useTheme hook for dark class toggle + system theme listener
5. Implement i18n with i18next + locale files

### Phase 4: Data Management Sub-page

**Deliverables**: DataSettings with export/import/clear, IPC handlers, DataService

**Details**:
1. Create DataService in main process (export/import/clear logic)
2. Add IPC handlers: data:export, data:import, data:clear, data:getStoragePath
3. Extend preload whitelist with new channels
4. DataSettings UI: export Button, import Button, clear AlertDialog, storage path display, backup config
5. JSZip integration for ZIP creation/extraction

### Phase 5: Keyboard Shortcuts Sub-page

**Deliverables**: ShortcutSettings, ShortcutRecorder, ShortcutService, IPC handlers

**Details**:
1. Create ShortcutService in main process (register/unregister global shortcuts)
2. Add IPC handlers: shortcuts:register, shortcuts:unregister, shortcuts:unregisterAll
3. Extend preload whitelist
4. Create ShortcutRecorder component with recording mode
5. ShortcutSettings UI: shortcut list, edit via recording, conflict warnings, reset button
6. Create useShortcutRecorder hook

### Phase 6: Quick Phrases and Startup Integration

**Deliverables**: QuickPhraseEditor, startup IPC, final integration

**Details**:
1. Create QuickPhraseEditor component (CRUD list with drag reorder)
2. Add startup:setLoginItem IPC handler
3. Wire launchAtLogin/startMinimized to startup IPC
4. Store hydration on app start (all 3 stores)
5. Error boundary wrapping on SettingsPage

## Interaction Chains

| FR | User Action | Handler | Store Mutation | DOM Effect | Visual Result | Verify Method |
|----|-------------|---------|---------------|------------|---------------|---------------|
| FR-009 | Click dark theme | onThemeChange('dark') | settings.theme='dark' | html.classList.add('dark') | All UI → dark colors | verify-effect html class "dark" |
| FR-009 | Click system theme | onThemeChange('system') | settings.theme='system' | html class follows OS | Theme matches OS pref | verify-effect html class matches-os |
| FR-005 | Toggle navbar to left | onNavbarChange('left') | settings.navbarPosition='left' | F002 layout re-renders | Tab bar → sidebar icons | verify-state [data-navbar] "left" |
| FR-010 | Drag font slider to 18 | onFontSize(18) | settings.fontSize=18 | body.style.fontSize='18px' | All text enlarges | verify-effect body style.fontSize "18px" |
| FR-003 | Select language zh-CN | onLanguage('zh-CN') | settings.language='zh-CN' | All text nodes update | UI text in Chinese | verify-effect [data-i18n] textContent "non-empty" |
| FR-012 | Select bubble style | onMessageStyle('bubble') | settings.messageStyle='bubble' | config:set persists | Chat uses bubbles | verify-state config messageStyle "bubble" |
| FR-014 | Type custom CSS | onCustomCSS(css) | settings.customCSS=css | style#custom-css updated | Visual change per CSS | verify-effect style#custom-css textContent "non-empty" |
| FR-002 | Click Display in sidebar | NavLink click | — (route change) | Outlet renders DisplaySettings | Display sub-page shown | verify-state [data-active-page] "display" |
| FR-017 | Click Clear Data | onClearData() | — | AlertDialog opens | Confirmation modal shown | verify-state [role=alertdialog] visible |
| FR-017 | Confirm Clear | onClearConfirm() | data:clear IPC | All data purged | App restarts | verify-effect app:relaunch called |
| FR-015 | Click Export | onExport() | — | dialog:saveFile opens | Save dialog shown | verify-state dialog visible |
| FR-021 | Click shortcut field | startRecording('newChat') | shortcuts.isRecording=true | Field enters capture mode | Field highlighted, "Press keys..." | verify-state .shortcut-field class "recording" |
| FR-021 | Press Ctrl+N | onKeyDown(event) | shortcuts['newChat']=['Ctrl','N'] | Field shows "Ctrl+N" | Key combo displayed | verify-effect .shortcut-field textContent "Ctrl+N" |
| FR-022 | Record conflicting combo | checkConflict(['Ctrl','N']) | — | Warning dialog opens | "Conflicts with: New Chat" | verify-state .conflict-warning visible |
| FR-025 | Click Add Phrase | onAddPhrase() | phrases.push(new) | List item added | New phrase row appears | verify-state .phrase-list children-count "+1" |
| FR-028 | Toggle any Switch | onToggle(key, value) | settings[key]=value | config:set IPC fired | Switch reflects new state | verify-state input[role=switch] checked |

## Integration Contracts

| Direction | Target Feature | Interface | Provider Shape | Consumer Shape | Bridge |
|-----------|---------------|-----------|---------------|---------------|--------|
| Consumes ← | F001-app-shell | config:get/set/reset/getAll IPC | `AppConfig` typed keys | `SettingsState` (same keys) | Direct mapping — same key names |
| Consumes ← | F001-app-shell | theme:set/get IPC | `{theme: 'light'\|'dark'\|'system'}` | `ThemeMode` | Type alias — compatible |
| Consumes ← | F001-app-shell | dialog:openFile/saveFile IPC | `{filePaths: string[]}` | Same | Direct — no bridge |
| Consumes ← | F002-navigation | Tab/Route system | `Tab {route, title}` | `{path: '/settings', label: 'Settings'}` | Route registered in router config |
| Provides → | F002-navigation | navbarPosition config | `'top' \| 'left'` | F002 reads via `config:get('navbarPosition')` | — |
| Provides → | F005-chat | sendKey, fontSize, messageStyle, quickPhrases | Config values | F005 reads via `config:get` or store | — |
| Provides → | F004-model-provider | proxyUrl config | `string \| null` | F004/F001 reads via `config:get('proxyUrl')` | — |

## Pattern Constraints

| Stack Pattern | Constraint | Rationale |
|---|---|---|
| **Zustand + React** (external store + reactive framework) | Selectors MUST return referentially stable values. No `store => ({ ...store })` or `store => store.items.filter(...)`. Use individual field selectors: `store => store.theme`. | React's `useSyncExternalStore` will infinite-loop if selector creates new references every call |
| **Zustand debounced persistence** | `setSetting` for continuous inputs (slider, textarea) MUST debounce IPC calls (300ms). Toggle/select changes fire immediately. | Rapid IPC calls during slider drag flood the main process and cause jank |
| **Tailwind CSS dark mode** | Dark mode MUST use `class` strategy (not `media`). The `dark` class is toggled on `<html>` element. All components use `dark:` variant for color overrides. | `media` strategy doesn't support manual theme toggle — only OS preference |
| **i18next + React** | `useTranslation()` hook MUST be used (not direct `i18next.t()`). Language changes trigger re-render via React context. | Direct `t()` calls don't trigger re-render on language change |
| **Electron IPC + Zod** | All new config keys MUST have Zod schemas. `config:set` validates server-side. Client-side validation is optional (for UX) but server-side is mandatory (for safety). | Unvalidated config values can corrupt the store |
| **Build-time plugin registration** | i18next locale files MUST be included in electron-vite build config. Tailwind CSS plugin MUST be registered. Verify build output includes locale files. | Missing locale files = raw i18n keys shown. Missing Tailwind = unstyled UI |
| **Error Boundary** | SettingsPage MUST be wrapped with an Error Boundary. Uncaught render errors display a fallback UI, not a blank page. | Per Constitution III — errors visible, gracefully recoverable |

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| ARC-05 deviation: electron-store instead of SQLite for settings | F001 chose electron-store for AppConfig. F003 extends the same store. Key-value settings don't need relational queries. | Adding SQLite table for flat key-value config adds complexity without benefit. SQLite is used for relational data (conversations, messages) in later features. |

## Source → Target Component Mapping

| Source Component | Source File | Target Component | Target File | Notes |
|---|---|---|---|---|
| SettingsPage | `cherry-studio/.../SettingsPage.tsx` | SettingsPage | `pages/settings/SettingsPage.tsx` | Source: styled-components + AntD + Routes. Target: Tailwind + shadcn + Outlet |
| Sidebar (14+ items) | `cherry-studio/.../SettingsPage.tsx` | SettingsSidebar (6 items) | `pages/settings/SettingsSidebar.tsx` | Reduced: 8+ source-only settings pages removed |
| GeneralSettings | `cherry-studio/.../GeneralSettings.tsx` | GeneralSettings | `pages/settings/GeneralSettings.tsx` | Source: 15+ controls. Target: 8 controls. Removed: tray, spell check, hw accel, notifications, data collection |
| DisplaySettings | source | DisplaySettings | target | AntD → shadcn/ui. Same control set |
| DataSettings/ (subdir) | source | DataSettings (flat file) | target | Source: AntD + WebDAV sync. Target: simplified, no WebDAV |
| ShortcutSettings | source | ShortcutSettings | target | Same concept |
| MCPSettings/ (21 subdirs) | source | — | — | deferred (F007) |
| WebSearchSettings/ (10 subdirs) | source | — | — | deferred (F009) |
| MemorySettings/ | source | — | — | deferred (F006) |
| QuickAssistantSettings/ | source | — | — | removed |
| SelectionAssistantSettings/ (8 subdirs) | source | — | — | removed |
| DocProcessSettings/ (12 subdirs) | source | — | — | removed |
| AboutSettings | source | — | — | removed |
| AgentSettings/ (8 subdirs) | source | — | — | deferred |
| ApiServerSettings | source | — | — | deferred (F010) |
