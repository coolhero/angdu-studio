# Pre-Context: Utilities

**Feature ID**: F013
**Tier**: Tier 3
**Generated**: 2026-03-02

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/renderer/src/store/websearch.ts` | Web search Redux slice |
| `src/renderer/src/store/ocr.ts` | OCR Redux slice |
| `src/renderer/src/store/minapps.ts` | Mini apps Redux slice |
| `src/renderer/src/store/selectionStore.ts` | Selection assistant Redux slice |
| `src/renderer/src/store/note.ts` | Notes Redux slice |
| `src/renderer/src/store/openclaw.ts` | OpenClaw Redux slice |
| `src/main/services/SelectionService.ts` | Selection assistant service |
| `src/main/services/OcrService.ts` | OCR service |
| `src/main/services/ExportService.ts` | Export to Word service |
| `src/main/services/SearchService.ts` | Web search window service |
| `src/main/services/OpenClawService.ts` | OpenClaw gateway service |
| `src/main/services/ObsidianVaultService.ts` | Obsidian integration |
| `src/renderer/src/pages/notes/` | Notes UI |
| `src/renderer/src/pages/minapps/` | Mini apps UI |
| `src/renderer/src/types/ocr.ts` | OCR types |
| `src/renderer/src/types/note.ts` | Notes types |
| `src/renderer/src/types/notification.ts` | Notification types |

### Reference Guide

#### [New Stack] Logic-Only Reference
- Extract: Web search provider API patterns, OCR provider interfaces, notes tree structure, mini app catalog schema, selection assistant trigger/action model, export format logic
- Ignore: All Redux slices, Ant Design component implementations

### Static Resources

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| `src/renderer/src/assets/images/search/` | Image | `src/renderer/src/assets/images/search/` | 9 search provider logos |
| `src/renderer/src/assets/images/ocr/` | Image | `src/renderer/src/assets/images/ocr/` | 2 OCR images |
| `src/renderer/src/assets/images/apps/` | Image | `src/renderer/src/assets/images/apps/` | 53 mini app logos |

### Environment Variables

None.

---

## For /speckit.specify

### Existing Feature Summary

Utilities bundles several supplementary features: Web Search (9 providers: Tavily, SearXNG, Exa, Zhipu, local browser), OCR (Tesseract, system, PaddleOCR, OVMS), Mini Apps (webview catalog with CN/Global regions), Selection Assistant (floating toolbar for text selection), Notes (file-based tree with TipTap editor), Export (Word, PDF, HTML), Mini Window, and OpenClaw (local AI gateway).

### Draft Requirements

- **FR-084**: Implement web search with multiple providers
- **FR-085**: Implement OCR with Tesseract.js and system native providers
- **FR-086**: Implement mini app catalog with webview hosting
- **FR-087**: Implement selection assistant with configurable trigger and actions
- **FR-088**: Implement notes with tree structure and TipTap rich text editor
- **FR-089**: Implement export to Word/PDF/HTML
- **FR-090**: Implement mini window functionality
- **FR-091**: Implement OpenClaw gateway management

### Draft Acceptance Criteria

- **SC-049**: Web search returns results from configured provider
- **SC-050**: OCR extracts text from image
- **SC-051**: Mini apps load and display in embedded webview
- **SC-052**: Notes persist to file system with tree structure

---

## For /speckit.plan

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-app-core | IPC, Window | Uses IPC for all main process services, mini window shell |
| F003-provider-management | Model | Web search and OCR may use AI models |
| F005-ai-completion | API call | Web search results injected into completion context |

### Related Entities

#### Owned Entities

**WebSearchProvider** — 12 fields
**MinAppType** — 10 fields
**Notification** — 11 fields
**NotesTreeNode** — 9 fields
**OcrProvider** — 4 fields

---

## For /speckit.analyze

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Web search chunks | F005 | Verify web search results create proper citation chunks |
| Selection actions | F004 | Verify selection text can be sent to chat |
| Export format | F004 | Verify message export produces valid Word/PDF |
