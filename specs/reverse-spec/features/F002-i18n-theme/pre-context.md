# F002-i18n-theme Pre-Context

> Feature: Internationalization (en, zh-CN, zh-TW + 8 machine-translated locales), theme management (dark/light/system), display settings, CSS custom properties
> Tier: 1 | SBI Range: B046–B070

---

## 1. Runtime Exploration Results

Reference: `specs/reverse-spec/runtime-exploration.md`

- **Theme**: Dark mode default, `--color-background: #181818`, primary `#00b96b`
- **Light mode**: Activated via `[theme-mode='light']` attribute on root element
- **Font**: Ubuntu + system fonts fallback, configurable per user (`--user-font-family`)
- **Locale visible**: Settings menu labels, tray menu, app menu — all localized
- **11 supported locales**: en-US, zh-CN, zh-TW (original); ja-JP, ru-RU, de-DE, el-GR, es-ES, fr-FR, pt-PT, ro-RO (machine-translated)

---

## 2. Source Reference

| File Path | Role | Rebuild Target |
|-----------|------|----------------|
| `src/renderer/src/i18n/index.ts` | i18next initialization, locale resources, dayjs locale mapping | `[TBD]` |
| `src/renderer/src/i18n/label.ts` | Dynamic i18n label helpers (providers, shortcuts, sidebar, theme) | `[TBD]` |
| `src/renderer/src/i18n/locales/en-us.json` | English locale (original) | `[TBD]` |
| `src/renderer/src/i18n/locales/zh-cn.json` | Chinese Simplified locale (original) | `[TBD]` |
| `src/renderer/src/i18n/locales/zh-tw.json` | Chinese Traditional locale (original) | `[TBD]` |
| `src/renderer/src/i18n/translate/*.json` | 8 machine-translated locale files | `[TBD]` |
| `src/renderer/src/assets/styles/color.css` | CSS custom properties: dark (default) + light theme tokens | `[TBD]` |
| `src/renderer/src/assets/styles/font.css` | Font family definitions, Windows-specific font stack | `[TBD]` |
| `src/renderer/src/assets/styles/animation.css` | Keyframe animations (pulse, rotate, modal transitions, highlight) | `[TBD]` |
| `src/renderer/src/assets/styles/index.css` | Global styles root, CSS imports, base layer reset | `[TBD]` |
| `src/renderer/src/assets/styles/scrollbar.css` | Custom scrollbar styling | `[TBD]` |
| `src/renderer/src/assets/styles/container.css` | Layout container styles | `[TBD]` |
| `src/renderer/src/assets/styles/ant.css` | Ant Design component overrides | `[TBD]` |
| `src/renderer/src/assets/styles/markdown.css` | Markdown rendering styles | `[TBD]` |
| `src/renderer/src/assets/styles/responsive.css` | Responsive layout rules | `[TBD]` |
| `src/renderer/src/assets/styles/richtext.css` | Rich text editor styles | `[TBD]` |
| `src/main/services/ThemeService.ts` | Main process theme: nativeTheme sync, titlebar overlay update | `[TBD]` |
| `src/renderer/src/store/settings.ts` | Settings state: theme, language, userTheme, display prefs | `[TBD]` |

---

## 3. Source Behavior Inventory (SBI)

| ID | Source Location | Behavior | Category |
|----|----------------|----------|----------|
| B046 | `i18n/index.ts:34-48` | Initialize i18next with 11 locale resources (3 original + 8 translated) | i18n |
| B047 | `i18n/index.ts:50-52` | `getLanguage()` — resolve language from localStorage or navigator | i18n |
| B048 | `i18n/index.ts:54-56` | `getLanguageCode()` — extract base language code (e.g., 'en' from 'en-US') | i18n |
| B049 | `i18n/index.ts:73-76` | `setDayjsLocale()` — sync dayjs locale with i18n language | i18n |
| B050 | `i18n/index.ts:78-89` | i18next config: fallback to defaultLanguage, missing key logging | i18n |
| B051 | `i18n/label.ts:27-93` | `providerKeyMap` — mapping of 60+ provider IDs to i18n keys | i18n |
| B052 | `i18n/label.ts:104-106` | `getProviderLabel()` — resolve provider display name via i18n | i18n |
| B053 | `i18n/label.ts:136-156` | `getTitleLabel()` — resolve page title labels (home, settings, notes, etc.) | i18n |
| B054 | `i18n/label.ts:158-166` | `getThemeModeLabel()` — resolve theme mode labels (dark/light/system) | i18n |
| B055 | `i18n/label.ts:180-195` | `getSidebarIconLabel()` — resolve sidebar navigation labels | i18n |
| B056 | `i18n/label.ts:197-232` | `getShortcutLabel()` — resolve keyboard shortcut descriptions | i18n |
| B057 | `ThemeService.ts:8-20` | ThemeService constructor: read persisted theme, set `nativeTheme.themeSource`, handle legacy values | theme |
| B058 | `ThemeService.ts:23-34` | `themeUpdatadHandler()` — on native theme change: update all window titlebar overlays + broadcast IPC | theme |
| B059 | `ThemeService.ts:37-44` | `setTheme()` — persist theme + update nativeTheme source | theme |
| B060 | `styles/color.css:1-71` | Dark theme CSS custom properties (default): 40+ color tokens | theme |
| B061 | `styles/color.css:73-137` | Light theme CSS custom properties via `[theme-mode='light']` selector | theme |
| B062 | `styles/color.css:139-147` | Navbar-position-aware color overrides (left navbar + light/dark) | theme |
| B063 | `styles/font.css:1-12` | `--font-family` definition: Ubuntu + system fallback chain | theme |
| B064 | `styles/font.css:11` | `--code-font-family` definition: Cascadia Code + Fira Code + monospace fallback | theme |
| B065 | `styles/font.css:14-24` | Windows-specific font override: adds Twemoji Country Flags, Sarasa Mono SC | theme |
| B066 | `styles/animation.css:1-91` | Animation keyframes: pulse, modal slide, rotate, locate-highlight | theme |
| B067 | `styles/index.css:14-26` | Base layer reset: box-sizing, icon color | theme |
| B068 | `styles/index.css:37-69` | Body defaults: flex layout, color, font-size 14px, user-select none, transition | theme |
| B069 | `store/settings.ts:275-276` | Default settings: `theme: ThemeMode.system`, `userTheme: { colorPrimary: '#00b96b' }` | settings |
| B070 | `store/settings.ts:519-526` | `setTheme()` / `setUserTheme()` reducers — update theme in Redux state | settings |

---

## 4. UI Component Features

| Component | Source Hint | Description |
|-----------|------------|-------------|
| Theme Selector | Settings → Display Settings | Dark / Light / System toggle |
| Language Selector | Settings → General Settings | Dropdown with 11 locales |
| Primary Color Picker | Settings → Display Settings | Custom `--color-primary` override |
| Font Family Setting | Settings → Display Settings | Custom `--user-font-family` override |
| Code Font Setting | Settings → Display Settings | Custom `--user-code-font-family` override |
| Font Size Setting | Settings → Display Settings | Adjusts base font size |
| Window Style | Settings → Display Settings | Transparent / Opaque window option |

---

## 5. Interaction Behavior Inventory

| ID | Trigger | Response | Notes |
|----|---------|----------|-------|
| I008 | User changes theme in Settings | `ThemeService.setTheme()` → nativeTheme update → titlebar overlay recolor → broadcast to all windows | IPC: `ThemeUpdated` |
| I009 | System theme changes (auto) | `nativeTheme.on('updated')` → same broadcast as manual | Only when theme=system |
| I010 | User changes language in Settings | `setLanguage` IPC → ConfigManager persists → tray menu rebuilds → app menu rebuilds | Requires app menu/tray subscription |
| I011 | User changes primary color | Redux `setUserTheme` → CSS variable `--color-primary` updated | Runtime only, persisted via Redux |
| I012 | User changes font family | Redux `setUserTheme` → CSS variable `--user-font-family` updated | Persisted |

---

## 6. Foundation Decisions

| Decision | Cherry Studio Value | Angdu Studio Target |
|----------|-------------------|-------------------|
| i18n library | i18next + react-i18next | Same |
| Default language | `navigator.language` fallback to en-US | Same |
| Theme mechanism | CSS custom properties + `[theme-mode]` attribute | CSS custom properties + Tailwind dark mode (class strategy) |
| Component library styles | Ant Design overrides (`ant.css`) | shadcn/ui + Tailwind (no ant.css) |
| Date library | dayjs with locale sync | Same |
| State management | Redux (settings slice) | Zustand |

---

## 7. Foundation Dependencies

| Package | Role |
|---------|------|
| `i18next` | Internationalization framework |
| `react-i18next` | React bindings for i18next |
| `dayjs` | Date formatting with locale support |
| Ubuntu font (bundled) | Default UI font (`assets/fonts/ubuntu/`) |
| Country flag font (bundled) | Flag emoji rendering (`assets/fonts/country-flag-fonts/`) |
| Icon font (bundled) | Custom icons (`assets/fonts/icon-fonts/`) |

---

## 8. Naming Remapping

| Cherry Studio Identifier | Angdu Studio Identifier |
|--------------------------|------------------------|
| `CherryIN` (provider label in locale) | `AngduIN` |
| `cherryin` (provider key in label.ts) | `angduin` |
| `provider.cherryin` (i18n key) | `provider.angduin` |
| `CherryAI` (provider name) | `AngduAI` |
| `cherry-ai.com` (help URLs in app menu) | TBD |
| All locale files referencing "Cherry" | Replace with "Angdu" |

---

## 9. Static Resources

| Resource | Source Path | Notes |
|----------|-----------|-------|
| Ubuntu font files | `src/renderer/src/assets/fonts/ubuntu/` | Bundled web font |
| Country flag font | `src/renderer/src/assets/fonts/country-flag-fonts/` | Windows flag emoji support |
| Icon font | `src/renderer/src/assets/fonts/icon-fonts/` | Custom icon glyphs |
| Locale JSON files | `src/renderer/src/i18n/locales/` | 3 original translations |
| Translated JSON files | `src/renderer/src/i18n/translate/` | 8 machine translations |

---

## 10. Environment Variables

| Variable | Usage |
|----------|-------|
| None specific to F002 | Theme and language are persisted via ConfigManager (main) and Redux/localStorage (renderer) |

---

## 11. Feature Contracts

### Provides (exported by F002)

| Contract | Consumer | Type |
|----------|----------|------|
| `i18n.t()` function | All renderer features | import |
| `getLanguage()` / `getLanguageCode()` | Everywhere needing locale | import |
| CSS custom properties (`--color-*`, `--font-*`) | All UI components | CSS cascade |
| `ThemeMode` enum (`dark`, `light`, `system`) | Settings, window service | type |
| `getProviderLabel()` | F003-providers, settings UI | import |
| `getThemeModeLabel()` | Settings UI | import |
| `getSidebarIconLabel()` | Navigation UI | import |

### Consumes (required by F002)

| Contract | Provider | Type |
|----------|----------|------|
| `configManager.getTheme()` / `setTheme()` | F001-shell (ConfigManager) | IPC |
| `configManager.getLanguage()` | F001-shell (ConfigManager) | IPC |
| `IpcChannel.App_SetTheme` | F001-shell (IPC infrastructure) | IPC |
| `IpcChannel.App_SetLanguage` | F001-shell (IPC infrastructure) | IPC |
| `IpcChannel.ThemeUpdated` | F001-shell (IPC event) | IPC event |

---

## 12. For /speckit.specify

- Theme system spans two processes: main (nativeTheme + titlebar) and renderer (CSS variables + React state)
- The `color.css` file is the single source of truth for all color tokens — must be migrated to Tailwind CSS config
- Ant Design overrides in `ant.css` will be replaced entirely by shadcn/ui + Tailwind
- Font bundling (Ubuntu, country flags, icons) must be preserved — they are loaded via CSS `@import`
- The `label.ts` pattern (lazy i18n key maps) is reusable in Zustand-based architecture

---

## 13. For /speckit.plan

- **Phase 1**: i18next setup with 3 original locales + Tailwind CSS dark mode configuration
- **Phase 2**: CSS custom properties migration → Tailwind theme config (colors, fonts)
- **Phase 3**: ThemeService (main process) + theme state in Zustand store
- **Phase 4**: Font bundling + animation CSS + remaining style files
- **Phase 5**: Machine-translated locales (8 files) + label.ts helper system

---

## 14. For /speckit.analyze

- **Key migration**: `ant.css` (268+ overrides for Ant Design) is completely unnecessary for shadcn/ui — drop it
- **Key migration**: `color.css` dark/light tokens → Tailwind `theme.extend.colors` + CSS variables
- **Key migration**: Redux `settings.theme` / `settings.language` → Zustand store
- The `[theme-mode='light']` CSS attribute pattern can be replaced by Tailwind's `dark:` prefix with `class` strategy
- Bubble/chat CSS in `index.css` should belong to F-chat feature, not F002
