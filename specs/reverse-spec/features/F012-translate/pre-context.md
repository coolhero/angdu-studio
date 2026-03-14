# F012-translate — Pre-Context

> Angdu Studio reverse-spec | Rebuilt from Cherry Studio
> Feature: AI Translation with OCR Support
> Tier: 3 (Optional) | Demo Group: D3-Extras
> Dependencies: F004-ai-core

---

## Feature Overview

AI-powered translation tool with a split-pane interface (source + translation). Supports automatic language detection, multiple target languages, custom user-defined languages with specialized prompts, and OCR for image-based text extraction. Translation history with star/favorite support. Uses a specialized translate assistant with auto-disabled reasoning (BR-030).

---

## Runtime Exploration Results

From `runtime-exploration.md` — Screen: `#/translate`:

- **Layout**: Split-pane — Left (source text) + Right (translation output), 50/50 horizontal split
- **Header bar**: Model icon, Auto Detect dropdown, swap button, English dropdown, Translate button, model selector, settings icon
- **Left pane**: Text input with placeholder "Text, text files, or images (with OCR support) can be pasted or dragged in", character count
- **Right pane**: "Translation" label, output area (light gray background)
- **OCR support**: Accepts images for text extraction before translation

---

## Source Reference

| Layer | Cherry Studio Path | Purpose |
|-------|-------------------|---------|
| Pages | `src/renderer/src/pages/translate/` | Translation UI (split pane) |
| Translate service | `src/renderer/src/services/TranslateService.ts` | Translation orchestration |
| Store | `src/renderer/src/store/translate.ts` | Redux slice (translate state, history) |
| OCR store | `src/renderer/src/store/ocr.ts` | Redux slice (OCR state) |
| OCR service | `src/main/services/ocr/` | Main process OCR handling |

---

## Spec Backlog Items (SBI)

| ID | Title | Priority | Description |
|----|-------|----------|-------------|
| B231 | Split-pane translation UI | P1 | Left source pane + right translation pane with 50/50 layout. |
| B232 | AI translation via configured model | P1 | Send source text to AI model with translation prompt. Stream response to output pane. |
| B233 | Language detection (auto-detect source) | P1 | Automatically detect source language. Manual override via dropdown. |
| B234 | Target language selection | P1 | Dropdown to select target language from built-in list. |
| B235 | Language swap button | P2 | Swap source and target languages. |
| B236 | Translation history | P2 | Persist translation records. View history list with star/favorite. |
| B237 | Custom translation languages | P3 | User-defined languages with custom prompts for specialized translation. |
| B238 | OCR for image-based text extraction | P2 | Paste or drag images into source pane. Extract text via OCR before translating. |
| B239 | Model selector for translation | P2 | Select which AI model to use for translation from the header bar. |
| B240 | Character count display | P3 | Show character count for source text. |
| B241 | Translate assistant auto-config (BR-030) | P2 | Auto-disable reasoning, inject translation system prompt, lower temperature for accuracy. |

---

## Business Rules

- **BR-030**: Translation assistant has auto-disabled reasoning, specialized system prompt, and adjusted temperature

---

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| (none detected) | Translation uses AI models configured in provider settings | — |

---

## For /speckit.specify

- **Entities**: TranslateHistory, CustomTranslateLanguage, OcrState (see entity-registry.md)
- **Business rules**: BR-030 (see business-logic-map.md)
- **Key screens**: `#/translate` (split-pane translation)
- **Cross-feature**: Uses F004-ai-core completion pipeline with translate-specific assistant config

## For /speckit.plan

- **Migration impact**: Low UI, Low state (see stack-migration.md)
- **UI migration**: Simple split-pane layout, minimal AntD components -> shadcn/ui
- **State migration**: `translate` Redux slice -> `useTranslateStore` Zustand store (independent, early candidate)
- **Dependencies**: Requires F004-ai-core for AI model access
- **Zustand store**: `useTranslateStore` absorbs `translate` slice; OCR state may be inline or separate

---

## Feature Contracts

### Provides to Other Features

| Contract | Consumer | Description |
|----------|----------|-------------|
| Translate button in chat | F006-chat | Input toolbar has a translate action button |

### Consumes from Other Features

| Contract | Provider | Description |
|----------|----------|-------------|
| AI completion pipeline | F004-ai-core | Translation uses the same completion engine |
| Model selection | F003-provider | Translation model selector references provider models |
| Tab system | F001-app-shell | Translate opens as a tab in the top navbar |
| OCR IPC | F001-app-shell | OCR processing runs in main process |
