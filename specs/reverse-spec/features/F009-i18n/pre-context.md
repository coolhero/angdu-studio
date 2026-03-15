# F009 — i18n — Pre-Context

> Feature ID: F009 | Tier: 1 | Release Group: RG-1

---

## Source Reference

| Key Source Files | Purpose |
|-----------------|---------|
| `src/renderer/src/i18n/index.ts` | i18next initialization and configuration |
| `src/renderer/src/i18n/locales/en-us.json` | English translations |
| `src/renderer/src/i18n/locales/zh-cn.json` | Simplified Chinese translations |
| `src/renderer/src/i18n/locales/zh-tw.json` | Traditional Chinese translations |
| `src/renderer/src/i18n/label.ts` | Label utilities |
| `src/renderer/src/store/settings.ts` | language setting (LanguageVarious) |
| `src/main/ipc.ts` | App_SetLanguage handler |
| `src/main/services/ConfigManager.ts` | Language persistence |

---

## Source Behavior Inventory (SBI)

| ID | Source File | Function/Method | Behavior | Pri | Origin |
|----|-----------|----------------|----------|-----|--------|
| B107 | `i18n/index.ts` | i18next.init() | Initializes i18next with language detection, fallback to en-us, JSON resources | P1 | Source |
| B108 | `i18n/locales/` | JSON files | Translation files: en-us (primary), zh-cn, zh-tw + 8 community locales | P1 | Source |
| B109 | `store/settings.ts` | `language: LanguageVarious` | Current language stored in settings; LanguageVarious = language code enum | P1 | Source |
| B110 | `ipc.ts` | `App_SetLanguage` | Persists language to ConfigManager; applied on next render | P1 | Source |
| B111 | `i18n/index.ts` | Language detection | Auto-detect system language on first launch; fallback chain: localStorage -> system -> en-us | P1 | Source |
| B112 | `i18n/label.ts` | Label helpers | Utilities for formatted labels with interpolation | P2 | Source |
| B113 | `i18n/index.ts` | Namespace support | Single default namespace; all translations in flat key structure | P2 | Source |

---

## For /speckit.specify Hints

- Define supported language list (11 languages)
- Specify translation file format and key naming convention
- Document language switching flow (settings -> persist -> apply)
- Define interpolation and pluralization patterns
- Specify fallback chain

## For /speckit.plan Hints

- Task 1: i18next setup and configuration
- Task 2: Translation file structure (en-us as base)
- Task 3: Language switching in settings
- Task 4: useTranslation hook integration across all UI
- Task 5: Cherry -> Angdu string replacement in translations

---

## Feature Contracts

| Direction | Feature | Contract |
|-----------|---------|----------|
| Depends on F001 | Electron Shell | App_SetLanguage IPC |
| Provides to All | — | t() function, useTranslation hook, translated strings |
