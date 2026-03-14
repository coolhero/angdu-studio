# F002-i18n-theme Pre-Context

## Feature Summary

| Field | Value |
|-------|-------|
| **Feature ID** | F002-i18n-theme |
| **Description** | Internationalization (11 languages), theming (dark/light), global CSS tokens, font management |
| **Tier** | 1 |
| **Release Group** | RG-1 |
| **Dependencies** | F001-shell |

## Global Context

- **Original**: Cherry Studio (`/Users/coolhero/Develop/cherry-studio`)
- **Target**: Angdu Studio — Electron + React 19 + Zustand + Tailwind 4 + shadcn/ui + Vite 7
- **Naming**: Cherry -> Angdu, CS -> AS, CherryStudio -> AngduStudio
- All source paths are RELATIVE to `cherry-studio`

## Source Reference

| File | Role |
|------|------|
| `src/renderer/src/i18n/` | i18n setup (`index.ts`, `label.ts`) |
| `src/renderer/src/i18n/locales/` | Base translations (en-us, zh-cn, zh-tw) |
| `src/renderer/src/i18n/translate/` | Machine translations (8 languages) |
| `src/renderer/src/App.tsx` | Theme/style provider hierarchy |
| `src/renderer/src/assets/` | Static assets (images, provider logos) |
| `config/` | Configuration files |

## Source Behavior Inventory (SBI)

| ID | Source File | Function/Method | Behavior Description | Priority | Origin |
|----|-------------|----------------|---------------------|----------|--------|
| B019 | `src/renderer/src/i18n/index.ts` | `initI18n()` | Initializes i18next with locale detection and fallback | P1 | extracted |
| B020 | `src/renderer/src/i18n/index.ts` | `changeLanguage()` | Changes app language and syncs DayJS locale | P1 | extracted |
| B021 | `src/renderer/src/App.tsx` | `ThemeProvider` | Provides dark/light theme via CSS custom properties | P1 | extracted |
| B022 | `src/renderer/src/App.tsx` | `AntdProvider` | Configures Ant Design theme tokens | P2 | extracted |
| B023 | `src/renderer/src/App.tsx` | `StyleSheetManager` | Manages styled-components global styles | P2 | extracted |
| B024 | `src/renderer/src/i18n/label.ts` | `getLabel()` | Returns localized label for UI elements | P1 | extracted |

## For /speckit.specify

- i18n with 11 locales
- Dark/light/auto theme
- CSS custom properties for all tokens (200+ vars)
- Font management (user-configurable code/UI fonts)

## For /speckit.plan

- Migration: Styled Components theme -> Tailwind CSS custom properties + shadcn theme system
- Migration: Ant Design theme -> shadcn/ui theme tokens
