# F007 — Settings System — Pre-Context

> Feature ID: F007 | Tier: 1 | Release Group: RG-2

---

## Source Reference

| Key Source Files | Purpose |
|-----------------|---------|
| `src/renderer/src/store/settings.ts` | SettingsState with 80+ fields, Redux slice |
| `src/renderer/src/store/shortcuts.ts` | Keyboard shortcut management |
| `src/main/services/ConfigManager.ts` | Electron-store config persistence |
| `src/main/services/ProxyManager.ts` | Proxy configuration |
| `src/main/services/ShortcutService.ts` | Global shortcut registration |
| `src/main/ipc.ts` | Config_*, App_Set*, Shortcuts_* handlers |
| `src/renderer/src/pages/settings/` | Settings UI panels |

---

## Source Behavior Inventory (SBI)

| ID | Source File | Function/Method | Behavior | Pri | Origin |
|----|-----------|----------------|----------|-----|--------|
| B079 | `store/settings.ts` | `SettingsState` | 80+ settings fields organized by category: general, display, proxy, code, chat, data | P1 | Source |
| B080 | `store/settings.ts` | `sendMessageShortcut` | Configurable: Enter, Shift+Enter, Ctrl+Enter, Command+Enter, Alt+Enter | P1 | Source |
| B081 | `store/settings.ts` | `proxyMode` / `proxyUrl` | Proxy: 'system' (OS), 'custom' (url+bypass), 'none' (direct) | P1 | Source |
| B082 | `store/settings.ts` | `launchOnBoot` / `launchToTray` / `tray` / `trayOnClose` | Launch behavior settings (4 independent booleans) | P1 | Source |
| B083 | `store/settings.ts` | `language` | Language selection (LanguageVarious type) | P1 | Source |
| B084 | `ConfigManager.ts` | `set()` / `get()` | Key-value config persistence via electron-store; optional notify flag | P1 | Source |
| B085 | `ProxyManager.ts` | `configureProxy()` | Applies proxy config to Electron session: system, fixed_servers, or direct mode | P1 | Source |
| B086 | `ShortcutService.ts` | `registerShortcuts()` / `unregisterAllShortcuts()` | Global keyboard shortcuts via Electron globalShortcut API | P2 | Source |
| B087 | `store/settings.ts` | `autoCheckUpdate` / `testPlan` / `testChannel` | Auto-update settings with test channel support | P2 | Source |
| B088 | `store/settings.ts` | `codeShowLineNumbers` / `codeCollapsible` / `codeWrappable` | Code display settings | P2 | Source |
| B089 | `store/settings.ts` | `confirmDeleteMessage` | Confirmation dialog toggle for destructive actions | P2 | Source |
| B090 | `store/settings.ts` | `enableTopicNaming` / `topicNamingPrompt` | Topic auto-naming toggle and custom prompt | P2 | Source |
| B091 | `ipc.ts` | `App_SetLaunchOnBoot` | Sets OS auto-launch via AppService.setAppLaunchOnBoot() | P1 | Source |

---

## For /speckit.specify Hints

- Define settings schema with types, defaults, and validation
- Specify settings persistence flow (Zustand -> IPC -> ConfigManager -> disk)
- Document proxy configuration protocol
- Define settings panel organization (tabs/sections)
- Specify keyboard shortcut registration lifecycle

## For /speckit.plan Hints

- Task 1: Settings Zustand store with SQLite persist
- Task 2: Settings panels UI (general, display, provider, model, data, shortcuts)
- Task 3: Proxy configuration service
- Task 4: Launch behavior settings
- Task 5: Keyboard shortcut management
- Task 6: Config sync between renderer and main

---

## Feature Contracts

| Direction | Feature | Contract |
|-----------|---------|----------|
| Depends on F001 | Electron Shell | ConfigManager IPC, system APIs (proxy, launch) |
| Depends on F002 | Navigation & Layout | Settings route (/settings) |
| Depends on F003 | Theme & Appearance | Theme settings |
| Depends on F008 | Data & Storage | Settings persistence |
| Provides to All | — | User preferences consumed by all Features |
