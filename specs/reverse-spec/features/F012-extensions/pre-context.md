# Pre-Context: F012-extensions

## Feature Overview

**Feature:** Extensions — Mini apps, selection assistant, notes, API server, LAN transfer, paintings, OpenClaw.
**Tier:** 3
**SBI Range:** B371–B420

## Strategy

- **Approach:** Core scope, New Stack
- **Naming:** Cherry → Angdu, CherryStudio → AngduStudio, CherryIN → AngduIN

## Source Files (relative to /Users/coolhero/Develop/cherry-studio)

### Mini Apps
- `src/renderer/src/pages/minapps/`
- `src/renderer/src/hooks/useMinapps.ts`
- `src/renderer/src/hooks/useMinappPopup.ts`
- `src/renderer/src/store/minapps.ts`

### Selection Assistant
- `src/main/services/SelectionService.ts`
- `src/renderer/src/windows/selection/`

### Notes
- `src/renderer/src/pages/notes/`
- `src/renderer/src/services/NotesService.ts`
- `src/renderer/src/services/NotesTreeService.ts`
- `src/main/services/ObsidianVaultService.ts`

### API Server
- `src/main/apiServer/` (entire directory)
- `src/main/services/ApiServerService.ts`

### LAN Transfer
- `src/main/services/LocalTransferService.ts`

### Paintings
- `src/renderer/src/pages/paintings/`
- `src/renderer/src/store/paintings.ts`

### OpenClaw
- `src/main/services/OpenClawService.ts`
- `src/renderer/src/store/openclaw.ts`

### Translate
- `src/renderer/src/pages/translate/`
- `src/renderer/src/store/translate.ts`

### OCR
- `src/main/services/ocr/`
- `src/renderer/src/hooks/useOcr.ts`

## SBI Inventory (B371–B420)

| SBI  | Name                                    | Priority |
|------|-----------------------------------------|----------|
| B371 | MiniApp.load                            | P2       |
| B372 | SelectionService.init                   | P2       |
| B373 | SelectionService.showToolbar            | P2       |
| B374–B377 | NotesService.crud                  | P2       |
| B378 | NotesTreeService.buildTree              | P2       |
| B379 | ApiServerService.start                  | P2       |
| B380 | ApiServerService.stop                   | P2       |
| B381 | LocalTransferService.scan               | P3       |
| B382 | LocalTransferService.connect            | P3       |
| B383 | LocalTransferService.send               | P3       |
| B384 | PaintingsService.generate               | P3       |
| B385 | OpenClawService.install                 | P3       |
| B386 | OpenClawService.start                   | P3       |
| B387 | OpenClawService.stop                    | P3       |
| B388 | TranslateService.translate              | P2       |
| B389 | OCR.recognize                           | P2       |
| B390 | ObsidianVaultService.getVaults          | P3       |

## Naming Rules

- `cherry-studio` in API server config → `angdu-studio`
- `CherryAI` → `AngduAI`
- All other occurrences: Cherry → Angdu, CherryStudio → AngduStudio

## Environment Variables

| Original              | Renamed               | Notes            |
|-----------------------|-----------------------|------------------|
| DIDI_API_KEY          | DIDI_API_KEY          | Secret, optional — no rename |
| npm_package_version   | npm_package_version   | Config — no rename |

## Dependencies

- **F001-app-core** — IPC infrastructure, database layer, window management, file-system paths
- **F002-ai-provider** — LLM invocation for paintings, translate, OCR, selection assistant
- **F003-chat** — Message types, conversation context for mini apps and selection assistant
