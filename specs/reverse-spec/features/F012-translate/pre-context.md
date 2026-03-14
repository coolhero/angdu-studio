# F012-translate Pre-Context

## Feature Identity

| Field | Value |
|-------|-------|
| ID | F012 |
| Name | translate |
| Title | Translation — Language Detection, OCR & Split-Pane UI |
| Tier | 3 |
| Risk Group | RG-4 |
| Dependencies | F003-providers, F002-i18n-theme |
| SBI Range | B196 – B209 |

## Project Context

- **Original**: Cherry Studio (`/Users/coolhero/Develop/cherry-studio`)
- **New**: Angdu Studio — Electron + React 19 + Zustand + Tailwind 4 + shadcn/ui + Vite 7
- **Naming**: Cherry -> Angdu, CS -> AS

## Key Source Files (relative to cherry-studio)

| Path | Role |
|------|------|
| `src/renderer/src/pages/translate/TranslatePage.tsx` | Translation page — split-pane layout |
| `src/renderer/src/store/translate.ts` | Translation state (languages, history) |
| `src/renderer/src/store/ocr.ts` | OCR extraction state |
| `src/renderer/src/databases/index.ts` | IndexedDB — translate_history table |

## SBI Table

| ID | Source File | Function/Method | Behavior Description | Priority | Origin |
|----|-------------|----------------|---------------------|----------|--------|
| B196 | pages/translate/TranslatePage.tsx | renderTranslateLayout() | Renders split-pane with source/target | P1 | extracted |
| B197 | pages/translate/TranslatePage.tsx | handleTranslate() | Sends text to LLM for translation | P1 | extracted |
| B198 | pages/translate/TranslatePage.tsx | handleSwapLanguages() | Swaps source and target languages | P2 | extracted |
| B199 | pages/translate/TranslatePage.tsx | handleOCR() | Triggers OCR on pasted/dropped image | P2 | extracted |
| B200 | store/translate.ts | setSourceLanguage() | Sets source language for translation | P1 | extracted |
| B201 | store/translate.ts | setTargetLanguage() | Sets target language for translation | P1 | extracted |
| B202 | store/translate.ts | addTranslation() | Saves translation to history | P2 | extracted |
| B203 | store/ocr.ts | updateOCR() | Updates OCR extraction results | P2 | extracted |
| B204 | main/services/ocr/ | performOCR() | Executes OCR via system OCR or Tesseract.js | P2 | extracted |
| B205 | main/services/ocr/ | detectLanguage() | Auto-detects language of input text (franc) | P2 | extracted |
| B206 | databases/index.ts | saveTranslateHistory() | Persists translation history to IndexedDB | P2 | extracted |
| B207 | databases/index.ts | getTranslateHistory() | Retrieves translation history | P2 | extracted |
| B208 | pages/translate/ | handleFileTranslate() | Translates uploaded text file content | P3 | extracted |
| B209 | pages/translate/ | handleImageTranslate() | OCR + translate workflow for images | P3 | extracted |

## Priority Summary

- **P1 (Must)**: 4 behaviors — split-pane layout, translate action, source/target language setters
- **P2 (Should)**: 8 behaviors — swap languages, OCR trigger, history save/retrieve, OCR state, OCR execution, language detection, translation history persistence
- **P3 (Nice)**: 2 behaviors — file translate, image translate

## Dependency Notes

- **F003-providers**: LLM provider used for translation requests (`handleTranslate`)
- **F002-i18n-theme**: i18n strings for language names, theme tokens for split-pane styling

## Migration Notes

- Redux slices (`store/translate.ts`, `store/ocr.ts`) migrate to Zustand stores
- IndexedDB translate_history table: verify Dexie.js or equivalent setup in new stack
- OCR: Tesseract.js runs in renderer/worker; system OCR uses main process IPC
- `franc` library for language detection — verify ESM compatibility with Vite 7
- Split-pane UI migrates to Tailwind 4 + shadcn/ui resizable panel components
