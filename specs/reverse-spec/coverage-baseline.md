# Source Coverage Baseline

**Source**: `/Users/coolhero/Develop/cherry-studio`
**Generated**: 2026-03-13
**Scope**: core
**Stack Strategy**: new

---

## Surface Metrics

| Metric | Source Total | Mapped to Features | Coverage | Notes |
|--------|------------|-------------------|----------|-------|
| Source files | 1375 | 1375 | 100% | 165 explicitly listed + 1210 by directory association |
| Source behaviors (SBI) | 351 | 351 | 100% | B001-B171 (T1), B150-B351 (T2/T3) across 12 Features |
| IPC channels | 288 | 288 | 100% | All channels in ipc.ts mapped to Features |
| REST endpoints | 21 | 21 | 100% | OpenAI-compatible + agents CRUD + MCP proxy |
| DB entities | 20 | 20 | 100% | Drizzle (3) + Dexie + TypeScript types |
| Test files | 255 | — | N/A | Tests excluded from Feature assignment — will be rewritten |
| Business rules | 58 | 58 | 100% | BR-001 through BR-058 |

> **How to read**: "Source Total" is what was found in the original source code. "Mapped to Features" is what was assigned to at least one Feature's pre-context.md or registry. All items are classified.

---

## Interaction Coverage

| Metric | Total Pairs | Documented | Coverage | Notes |
|--------|------------|------------|----------|-------|
| Feature pairs with interactions | 18 | 18 | 100% | Phase 3-1d intensity analysis |
| Feature Contracts defined | 12 | 12 | 100% | All 12 Features have contracts in pre-context.md |
| Cross-Feature business rules | 29 | 29 | 100% | XR-001 through XR-029 in business-logic-map.md |
| Shared entity relationships | 12 | 12 | 100% | Cross-Feature Entity Dependencies in roadmap.md |

---

## Unmapped Items

All 1375 source files were classified during Phase 4-3 review. No items remain unclassified.

### Classification Summary

| Classification | Count | Details |
|----------------|-------|---------|
| Explicitly listed in pre-context.md | 165 | Key entry-point files per Feature |
| Assigned by directory association | 1210 | Nested sub-components, hooks, utils assigned to parent Feature |
| New Features created | 0 | — |
| Intentional exclusions | 0 | — |

### Bulk Assignment Groups

| Group | Count | Assigned To | Rationale |
|-------|-------|-------------|-----------|
| hooks/ (generic) | 67 | F001-app-shell | Cross-cutting hooks — foundation layer |
| utils/ | 62 | F001-app-shell | Shared utilities — foundation layer |
| types/ | 24 | F001-app-shell | Shared type definitions |
| shared components/ (top-level) | 37 | F001-app-shell | Reusable UI primitives |
| Icons/ | 20 | F001-app-shell | Icon components — shared across all Features |
| contexts/ | 6 | F001-app-shell | React context providers |
| dnd/ | 8 | F001-app-shell | Drag-and-drop utilities |
| store/ (remaining slices) | 11 | Various | websearch→F004, runtime→F001, ocr→F004, etc. |
| Popups/ | 41 | Various | SelectModelPopup→F003, LanTransferPopup→F011, ApiKeyListPopup→F003, etc. |
| RichEditor/ | 46 | F010-notes | TipTap editor extensions and components |
| CodeBlockView/ + CodeToolbar/ | 20 | F006-chat | Code rendering in chat messages |
| Preview/ | 12 | F006-chat | Message preview components |
| QuickPanel/ | 6 | F006-chat | Quick actions panel |
| Tags/ (Model) | 12 | F003-settings | Model tags and labels |
| MinApp/ | 5 | F012-creative-tools | Mini-app container components |
| Windows/ (mini/selection) | 20 | F001-app-shell | Secondary Electron windows |
| Trace/ | 12 | F004-ai-engine | OpenTelemetry trace viewer |
| Renderer services/ | 50 | Various | db→F001, ProviderSDK→F004, WebSearch→F004, etc. |
| Remaining (App.tsx, api/, ActionTools, etc.) | 68 | Various | App.tsx→F002, api/→F004, ActionTools→F006, etc. |

---

## Intentional Exclusions

No items intentionally excluded. All source functionality is assigned to the 12 Features.

### Test Files (255 files)

Test files are not assigned to Features. In the New Stack rebuild, tests will be written fresh following the Test-First principle from constitution-seed.md. Original test files serve as logic reference only.

---

## Coverage Notes

- All 1375 source files are accounted for across 12 Features
- 165 files are explicitly referenced in pre-context.md Source Reference tables (key entry points)
- 1210 files are covered by directory-level Feature association (sub-components, nested modules)
- Cross-cutting shared code (hooks, utils, types, shared components) assigned to F001-app-shell as foundation layer — these will be reimplemented as needed by each Feature during rebuild
- 255 test files excluded from Feature mapping — tests will be rewritten per Feature during /smart-sdd pipeline
- No new Features were created during coverage analysis
- SBI entries: B001-B351 (351 total) across 12 Features
