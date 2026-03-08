# F011-translate Pre-Context

> Feature: Translation Interface
> Ring: RG-4 | Tier: T3
> Generated: 2026-03-08

---

## 1. Feature Overview and Purpose

The Translate feature provides AI-powered text translation within the desktop app. It uses a split-pane UI with source text input on the left and translated output on the right. The feature leverages configurable AI models (selected via a model selector) to perform translations, with support for language auto-detection, bidirectional translation pairs, OCR for image-to-text, file upload for document translation, and a searchable translation history.

Key capabilities:
- Split-pane translation UI (source textarea | target output)
- Auto-detect source language (via franc algorithm, LLM, or auto-hybrid)
- Manual source/target language selection with language exchange button
- Bidirectional translation mode (e.g., EN <-> CN with auto-direction)
- Token count display (estimated via `estimateTextTokens()`)
- Copy result (manual + auto-copy option)
- Markdown rendering of translated output (via shiki)
- Scroll sync between input and output panes
- Translation history with star/search/delete (Dexie IndexedDB + `useLiveQuery`)
- OCR support for pasted/dropped/uploaded images
- Text file and document file import (drag-and-drop, paste, file picker)
- Abort in-progress translation via `AbortController` pattern
- Settings modal for markdown preview, auto-copy, scroll sync, detection method, bidirectional config
- Enter to translate, Shift+Enter for newline

## 2. Key Source Files and Their Roles

### Page Components

| File | Role |
|------|------|
| `src/renderer/src/pages/translate/TranslatePage.tsx` | Main page (~1060 lines). Monolithic component containing all translation logic: language selection state, model selection, translate/abort handlers, file handling (read, OCR, drag-drop, paste), history drawer toggle, settings modal toggle, markdown rendering, scroll sync, keyboard shortcuts. Renders: Navbar, OperationBar (language selectors + translate button + model selector), AreaContainer (input textarea + output display), TranslateHistoryList (drawer), TranslateSettings (modal). |
| `src/renderer/src/pages/translate/TranslateHistory.tsx` | History drawer component (~325 lines). Renders an antd `Drawer` with `DynamicVirtualList` of past translations (160px item height). Supports search filtering, star/favorite toggle, individual delete with `Popconfirm`, clear all. Uses `useLiveQuery` from `dexie-react-hooks` for reactive queries on `db.translate_history`. |
| `src/renderer/src/pages/translate/TranslateSettings.tsx` | Settings modal (~200 lines). antd `Modal` with controls: markdown preview toggle, auto-copy toggle, scroll sync toggle, auto-detection method (`Radio.Group`: auto/franc/llm), bidirectional mode toggle + language pair selectors. Links to deeper `TranslateSettingsPopup` for additional settings. |

### Services

| File | Role |
|------|------|
| `services/TranslateService.ts` | Core service functions: `translateText()` (calls AI model with streaming, accepts throttled content callback and abort key), `saveTranslateHistory()`, `deleteHistory()`, `clearHistory()`, `updateTranslateHistory()`. Also handles custom language CRUD: `addCustomLanguage()`, `deleteCustomLanguage()`, `updateCustomLanguage()`, `getAllCustomLanguages()`. |

### Store

| File | Role |
|------|------|
| `store/translate.ts` | Redux Toolkit slice. State: `translateInput` (string), `translatedContent` (string), `settings: { autoCopy: boolean }`. Actions: `setTranslateInput`, `setTranslatedContent`, `updateSettings`. |
| `store/runtime.ts` | Contains `translating: boolean` and `translateAbortKey: string` for translation-in-progress tracking and abort control. |

### Hooks (external to feature directory)

| File | Role |
|------|------|
| `hooks/useTranslate.ts` | Provides `prompt` (translation system prompt), `getLanguageByLangcode()` (lookup function), `settings` (from Redux), `updateSettings()`. |
| `hooks/useDefaultModel.ts` | Provides `translateModel` and `setTranslateModel()` for model selection. |
| `hooks/useOcr.ts` | OCR hook: `ocr(file)` returns `{ text: string }`. |
| `hooks/useFiles.ts` | File selection hook: `onSelectFile()`, `selecting`, `clearFiles()`. Accepts extension filter. |
| `hooks/useDrag.ts` | Drag-and-drop state machine: `isDragging`, `handleDragEnter/Leave/Over/Drop`. |
| `hooks/useTemporaryValue.ts` | `useTemporaryValue(false, 2000)` for "copied" feedback auto-reset. |
| `hooks/useTimer.ts` | `setTimeoutTimer('auto-copy', fn, 100)` for delayed auto-copy. |

### Shared Components

| Component | Role |
|-----------|------|
| `components/LanguageSelect` | Language picker dropdown (antd `Select`) with flag icons, search, and custom `extraOptionsBefore` for "Auto Detect" option. |
| `components/ModelSelectButton` | Model selector button with provider filtering via `modelFilter` predicate. |
| `components/CopyIcon` | Copy icon component. |

### Types

```typescript
// From types/index.ts
type TranslateLanguageCode = string

type TranslateLanguage = {
  langCode: string
  label: () => string    // Returns localized language name
  flag?: string          // Flag emoji
}

interface TranslateHistory {
  id: string
  sourceText: string
  targetText: string
  sourceLanguage: string    // langCode
  targetLanguage: string    // langCode
  createdAt: string
  star?: boolean
}

type AutoDetectionMethod = 'auto' | 'franc' | 'llm'

type CustomTranslateLanguage = {
  id: string
  langCode: string
  label: string
}
```

### Configuration

| File | Role |
|------|------|
| `config/translate.ts` | `LanguagesEnum` (predefined languages with langCodes, labels, flags), `UNKNOWN` sentinel language. |

### Utilities

| File | Role |
|------|------|
| `utils/translate.ts` | `detectLanguage(text)` (auto-detect source language), `determineTargetLanguage()` (handles bidirectional logic, returns `{ success, language, errorType }`), `createInputScrollHandler()`, `createOutputScrollHandler()` (synchronized scroll between input/output). |
| `utils/input.ts` | `getTextFromDropEvent()`, `getFilesFromDropEvent()` for drag-and-drop file handling. |
| `utils/abortController.ts` | `abortCompletion(key)` to abort in-progress translations. |
| `utils/error.ts` | `isAbortError()`, `formatErrorMessageWithPrefix()`. |

### OCR (Main Process)

| File | Purpose |
|------|---------|
| `src/main/services/ocr/OcrService.ts` | OCR service orchestrator |
| `src/main/services/ocr/builtin/TesseractService.ts` | Tesseract OCR provider |
| `src/main/services/ocr/builtin/SystemOcrService.ts` | System OCR (macOS Vision) |
| `src/main/services/ocr/builtin/PpocrService.ts` | PaddleOCR provider |
| `src/main/services/ocr/builtin/OvOcrService.ts` | OpenVINO OCR provider |

## 3. Data Models and State

### TranslateState (Redux slice)

```typescript
interface TranslateState {
  translateInput: string       // Source text in the input textarea
  translatedContent: string    // Translated output text
  settings: {
    autoCopy: boolean          // Auto-copy translated text to clipboard
  }
}
```

### Runtime state (Redux, from store/runtime.ts)

- `translating: boolean` -- whether a translation is in progress
- `translateAbortKey: string` -- UUID key for aborting the current translation

### Local component state (TranslatePage -- significant amount)

```typescript
// Language state
sourceLanguage: TranslateLanguage | 'auto'
targetLanguage: TranslateLanguage
detectedLanguage: TranslateLanguage | null

// Feature toggles
isBidirectional: boolean
bidirectionalPair: [TranslateLanguage, TranslateLanguage]
isScrollSyncEnabled: boolean
enableMarkdown: boolean
autoDetectionMethod: AutoDetectionMethod  // 'auto' | 'franc' | 'llm'

// UI state
historyDrawerVisible: boolean
settingsVisible: boolean
isProcessing: boolean           // File processing in progress
renderedMarkdown: string        // Shiki-rendered HTML
copied: boolean                 // Temporary "copied" feedback
```

### Module-level cache variables (code smell)

```typescript
let _sourceLanguage: TranslateLanguage | 'auto' = 'auto'
let _targetLanguage = LanguagesEnum.enUS
```

These survive component re-mounts and preserve language selection across navigation.

### Persisted settings (Dexie db.settings -- individual keys)

| Key | Type | Purpose |
|-----|------|---------|
| `translate:target:language` | string (langCode) | Last selected target language |
| `translate:source:language` | string (langCode or 'auto') | Last selected source language |
| `translate:bidirectional:pair` | [string, string] | Bidirectional language pair codes |
| `translate:bidirectional:enabled` | boolean | Bidirectional mode on/off |
| `translate:scroll:sync` | boolean | Scroll sync on/off |
| `translate:markdown:enabled` | boolean | Markdown rendering on/off |
| `translate:detect:method` | string | Auto-detection method |
| `translate:model` | string (modelId) | Last selected translation model |

### Translation History (Dexie db.translate_history)

Full `TranslateHistory` objects stored in IndexedDB via Dexie, ordered by `createdAt` descending. Queried reactively with `useLiveQuery`.

## 4. Component/Service Architecture

```
TranslatePage (~1060 LOC, monolithic)
  |-- Navbar (title)
  |-- TranslateHistoryList (antd Drawer, left-side overlay)
  |     |-- Search bar (antd Input)
  |     |-- Star filter toggle
  |     |-- DynamicVirtualList (160px items)
  |     |     |-- HistoryListItem (source/target text, languages, date, star, delete)
  |     |-- Clear all (Popconfirm)
  |-- OperationBar
  |     |-- History toggle button (FolderClock icon)
  |     |-- LanguageSelect (source, with "Auto Detect" extra option)
  |     |-- Exchange button (SwapOutlined, disabled when auto+no detection or bidirectional)
  |     |-- LanguageSelect (target) OR BidirectionalLanguageDisplay
  |     |-- TranslateButton (SendOutlined / CirclePause for abort)
  |     |-- ModelSelectButton (with filter: no embedding/rerank/text-to-image)
  |     |-- Settings button (Settings2 icon)
  |-- AreaContainer (CSS Grid: 1fr 1fr)
  |     |-- InputContainer
  |     |     |-- FloatButton (PlusOutlined, file upload, opacity-on-hover)
  |     |     |-- TextArea (antd, borderless, with paste/drop/keydown handlers)
  |     |     |-- DragOverHint (UploadIcon + text)
  |     |     |-- Footer (token count via Popover)
  |     |-- OutputContainer
  |           |-- CopyButton (appears on hover)
  |           |-- OutputText (plain text OR markdown-rendered HTML)
  |-- TranslateSettings (antd Modal)
        |-- Markdown preview toggle (Switch)
        |-- Auto-copy toggle (Switch)
        |-- Scroll sync toggle (Switch)
        |-- Detection method (Radio.Group: auto/franc/llm with tooltips)
        |-- Bidirectional mode (Switch + language pair selectors)
        |-- "More settings" button -> TranslateSettingsPopup

Services:
  TranslateService.translateText(text, targetLang, onContent, abortKey)
    --> AI provider (streaming completion)
  TranslateService.saveTranslateHistory() --> db.translate_history.add()
  TranslateService.*CustomLanguage()     --> db.customLanguages.*

Store:
  store/translate.ts (Redux: input, output, autoCopy)
  store/runtime.ts (Redux: translating, translateAbortKey)

External:
  Dexie db.settings (per-key settings)
  Dexie db.translate_history (history records)
```

### Data Flow

1. User types text -> `setText()` dispatches to `store/translate.translateInput`.
2. User presses Enter (not Shift+Enter) or clicks Translate -> `onTranslate()`:
   - If `sourceLanguage === 'auto'`: calls `detectLanguage(text)` to determine actual source.
   - Calls `determineTargetLanguage()` which handles bidirectional pair logic.
   - Validates same-language and not-in-pair error conditions.
   - Generates UUID `abortKey`, dispatches to runtime store.
   - Calls `translateText()` with `throttle(setTranslatedContent, 100)` for streaming updates.
   - On success: auto-copy if enabled, save history.
3. Abort: `onAbort()` calls `abortCompletion(abortKey)`.
4. History: `useLiveQuery` reactively queries `db.translate_history`, displayed in Drawer with virtual list.

### File/OCR Flow

1. **File upload** (button): `onSelectFile()` -> `processFile()` -> `readFile()` (text/document) or `ocrFile()` (image).
2. **Drag-and-drop**: Outer container drag events + inner input container drag events. `getTextFromDropEvent()` extracts text, `getFilesFromDropEvent()` extracts files.
3. **Paste**: `onPaste()` checks clipboard for text (default handling) or files (process as OCR/text).
4. **OCR**: `useOcr().ocr(file)` -> returns `{ text }` -> appended to input.
5. **Document reading**: `window.api.file.readExternal(path, true)` for document files (docx, etc.), `window.api.fs.readText(path)` for text files.

## 5. Dependencies on Other Features

| Dependency | Usage |
|------------|-------|
| **F001-app-core** | `window.api.file.*` for file reading, temp file creation, path resolution, `getPathForFile()` |
| **F002-ai-provider** | AI model infrastructure for translation. `translateText()` uses the AI streaming completion pipeline. Model filter excludes embedding/rerank/text-to-image models. |
| **F004-settings-data** | Redux store infrastructure, Dexie database for settings and history persistence |
| **F005-chat-ui** | Shared components: `Navbar`, `LanguageSelect`, `ModelSelectButton`, `CopyIcon`, `DynamicVirtualList`, `HStack`, `Layout` |
| **F012-paintings** | Shared OVMS dependency (OVOCR uses OVMS) |

### External Libraries

- `antd` -- Button, Flex, FloatButton, Popover, Tooltip, Typography, TextArea, Drawer, Input, Popconfirm, Modal, Radio, Switch, Select, Empty (very heavy usage)
- `styled-components` -- all styling
- `dexie` + `dexie-react-hooks` (`useLiveQuery`) -- IndexedDB for history and settings
- `lodash` (throttle, isEmpty)
- `dayjs` -- date formatting in history items
- `lucide-react` -- icons (FolderClock, Settings2, CirclePause, UploadIcon, Check, SearchIcon, HelpCircle)
- `react-i18next` -- internationalization
- `shiki` (via `useCodeStyle().shikiMarkdownIt`) -- markdown syntax highlighting for output

## 6. Migration Notes

### Redux Toolkit to Zustand

- `store/translate.ts` is a simple 3-field slice -- straightforward Zustand conversion.
- `store/runtime.ts` fields (`translating`, `translateAbortKey`) should move into the translate Zustand store or a shared runtime store.
- Multiple `useAppDispatch` / `useAppSelector` calls in TranslatePage: `text`, `translatedContent`, `translating`, `abortKey`.
- `setTranslateInput`, `setTranslatedContentAction`, `setTranslatingAction`, `setTranslateAbortKey` are dispatched actions.

### Ant Design to shadcn/ui + TailwindCSS 4

| antd Component | Usage | shadcn/ui Target |
|----------------|-------|------------------|
| `TextArea` (antd) | Source text input (borderless, allowClear) | shadcn `Textarea` |
| `Button` | Translate, abort, copy, history, settings, clear | `Button` |
| `Select` (via LanguageSelect) | Source/target language dropdowns | `Select` / `Combobox` |
| `Drawer` | Translation history panel (left placement) | `Sheet` (side='left') |
| `Modal` | Translate settings | `Dialog` |
| `Input` | History search | `Input` |
| `Switch` | Settings toggles | `Switch` |
| `Radio.Group` / `Radio.Button` | Detection method selector | `RadioGroup` / `ToggleGroup` |
| `FloatButton` | File upload button (bottom-left of input) | Custom floating button |
| `Popover` | Token count tooltip | `Tooltip` or `Popover` |
| `Popconfirm` | Clear all history | `AlertDialog` |
| `Tooltip` | Various button tooltips | `Tooltip` |
| `Typography.Text` | Token count display | Plain text |
| `Flex` | Layout helper | Tailwind flex utilities |
| `Empty` | Empty history state | Custom empty state |

### styled-components to Tailwind

- Every component uses `styled-components` for layout.
- CSS Grid (`grid-template-columns: 1fr 1fr`) for the split pane.
- Container sizing (`calc(100vh - var(--navbar-height) - 70px)`) needs Tailwind equivalent.
- Hover-reveal patterns (copy button, float button) need Tailwind `group-hover`.

### Dexie Persistence

- Translation history uses Dexie directly, not Redux. This pattern persists regardless of state management migration.
- Settings are split between Redux (`autoCopy`) and Dexie (`translate:*` keys) -- should be unified into Zustand store with persistence middleware.
- `useLiveQuery` from `dexie-react-hooks` provides reactive queries and should be preserved.

### Identity Remapping

- No Cherry/CS-specific branding found directly in translate files.
- Check i18n keys (`t('translate.*')`) for any Cherry references.

### Key Considerations

- **TranslatePage is monolithic** (~1060 lines). Strongly consider decomposing into sub-components during migration:
  - `TranslateOperationBar` (language selectors, buttons)
  - `TranslateInputPane` (textarea, file upload, drag-drop, paste)
  - `TranslateOutputPane` (copy, markdown rendering)
- Module-level cache variables (`_sourceLanguage`, `_targetLanguage`) should be eliminated and replaced with store state or refs.
- Many settings are loaded via individual `db.settings.get()` calls in a single `useEffect` -- consolidate into a single settings load.
- OCR and file processing add significant complexity to the input handling.
- The `TranslateSettingsPopup` import (`from '../settings/TranslateSettingsPopup/TranslateSettingsPopup'`) links to the global settings page.

## 7. Complexity Assessment

**Overall: MEDIUM-HIGH**

| Dimension | Rating | Notes |
|-----------|--------|-------|
| Component count | Low | 3 page components (but TranslatePage is massive) |
| State complexity | High | Split across Redux (2 slices), Dexie (8 keys + history table), local state (~12 useState), module-level vars |
| AI integration | Medium | Single `translateText()` call with streaming and abort |
| File handling | Medium-High | OCR, text files, document files, drag-drop, paste, file picker |
| UI complexity | Medium | Split-pane CSS Grid, scroll sync, markdown rendering, history drawer |
| Migration effort | High | Very heavy antd usage (15+ components), styled-components, monolithic component |
| Lines of code | ~1500 | TranslatePage ~1060, History ~325, Settings ~200 |

### Risk Areas

- Monolithic TranslatePage component makes migration error-prone; decompose first
- Settings scattered across Redux and Dexie need consolidation
- Module-level mutable state (`_sourceLanguage`, `_targetLanguage`) could cause subtle bugs across navigation
- Bidirectional translation logic (`determineTargetLanguage()`) is non-trivial
- File/OCR processing paths have many error states to handle
- Scroll sync implementation depends on antd TextArea internals (`resizableTextArea.textArea`)
- Token count is estimated, not exact (uses `estimateTextTokens(text + prompt)`)

---

## 8. Source Behavior Inventory

| ID | Behavior | Priority | Notes |
|----|----------|----------|-------|
| B211 | Translate text using LLM (streaming, throttled updates) | P1 | Core translation with abort support |
| B212 | Auto-detect source language (franc/llm/auto methods) | P1 | Configurable detection method |
| B213 | Swap source and target languages | P1 | Exchange button, disabled during auto-detect without result |
| B214 | Split-pane UI (source input, target output) | P1 | CSS Grid 1fr 1fr |
| B215 | Copy translated text to clipboard (manual + auto-copy) | P1 | Auto-copy with 100ms delay |
| B216 | Translation history persistence (Dexie IndexedDB) | P1 | Reactive via useLiveQuery |
| B217 | Star/favorite translations in history | P2 | Toggle per history item |
| B218 | Search translation history | P2 | Text filter across source/target/languages |
| B219 | Delete/clear translation history | P2 | Individual delete + clear all |
| B220 | OCR integration: paste/drop/upload image -> extract text -> translate | P2 | Multiple OCR providers |
| B221 | File upload for text/document translation | P2 | Drag-drop, paste, file picker |
| B222 | Bidirectional translation mode | P2 | Auto-determine direction from language pair |
| B223 | Markdown rendering of translated output | P2 | Via shiki syntax highlighting |
| B224 | Scroll sync between input and output | P3 | Bidirectional synchronized scrolling |
| B225 | Custom language definitions | P3 | User-defined language codes |
| B226 | Token count estimation | P3 | Displayed in input footer |
| B227 | Abort in-progress translation | P1 | Via abort key + abortCompletion() |
| B228 | Model selector with filter (no embedding/rerank/t2i) | P1 | Model predicate filter |

---

## 9. Key Scenarios

| SC-ID | Scenario | Behaviors |
|-------|----------|-----------|
| SC-110 | User translates text from auto-detected language to English | B211, B212, B214, B215 |
| SC-111 | User swaps source and target languages | B213 |
| SC-112 | User pastes an image and translates via OCR | B220 |
| SC-113 | User views and searches translation history | B216, B218 |
| SC-114 | User stars a translation in history | B217 |
| SC-115 | User enables bidirectional mode and translates | B222, B211 |
| SC-116 | User enables markdown rendering of output | B223 |
| SC-117 | User drags a document file to translate | B221, B211 |
| SC-118 | User aborts a long-running translation | B227 |

---

## 10. Cross-Feature Verification

| Check | Features | Status |
|-------|----------|--------|
| LLM provider for translation | F011 <-> F002-ai-provider | Shared AI completion pipeline |
| TranslateService used by paintings prompt translate | F011 <-> F012-paintings | `translateText()` called from painting pages |
| OCR shared with knowledge preprocessing | F011 <-> F007-knowledge | PaddleOCR used in both |
| Translate button in chat input toolbar | F011 <-> F005-chat-ui | Quick translate from chat |
| Redux translate/runtime slice migration | F011 | Two slices to Zustand |
| OCR IPC channels | F011 <-> F001-app-core | ocr:* channel registration |
| System OCR availability (macOS only) | F011 | Platform-specific behavior |
| OVOCR requires OVMS | F011 <-> F012-paintings | Shared OVMS dependency |
| Dexie settings unification | F011 | Scattered across Redux + Dexie keys |
