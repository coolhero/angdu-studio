# Source Coverage Baseline

**Source**: `/Users/coolhero/Study/oss/cherry-studio`
**Generated**: 2026-03-04
**Scope**: core
**Stack Strategy**: new

---

## Surface Metrics

| Metric | Source Total | Mapped to Features | Coverage | Notes |
|--------|------------|-------------------|----------|-------|
| Source files | 1,720 | 812 | 47.2% | Excludes node_modules/dist/build/.git directories |
| API endpoints (REST) | 24 | 25 | 96.0% | api-registry.md lists 25 (includes grouped variants) |
| IPC channels | 344 | ~220 | 63.9% | Registry groups by domain; actual enum has 344 entries |
| DB models/entities (persistent) | 12 | 12 | 100% | 4 Drizzle tables + 8 Dexie tables — all mapped |
| Business entities (logical) | 60+ | 60 | ~100% | Core business entities fully covered in entity-registry.md |
| Test files | 214 | 0 | 0% | Tests excluded — will be rewritten TDD in new implementation |
| Business rules | — | 89 | — | 43 Rules + 6 Validations + 32 Workflows + 8 Cross-Feature Rules |

> **How to read**: "Source Total" is what was found in the original source code. "Mapped to Features" is what was assigned to at least one Feature's pre-context.md or registry. The gap between them represents unmapped items classified below.

---

## Unmapped Items

Items found in the original source that are not assigned to any Feature. Each item was classified by the user during Phase 4-3 of `/reverse-spec`.

### Unmapped Source Files

| # | File Path / Group | Count | Detected Role | Classification | Detail |
|---|-------------------|-------|--------------|----------------|--------|
| 1 | `src/renderer/src/components/` | 255 | Shared UI components (Popups, Icons, CodeToolbar, Preview, Tags, dnd, ActionTools, DraggableList, QuickPanel, MinApp) | cross-cutting | Shared UI component library used across multiple Features. Noted in constitution for shared UI layer. |
| 2 | `src/renderer/src/aiCore/` (renderer-side) | 104 | Renderer AI execution layer (legacy provider, middleware chain, client factory, plugins, utils) | assigned:F003+F005 | Split: provider/plugins/middleware → F003-ai-core-engine; legacy clients/streaming → F005-ai-chat |
| 3 | `src/renderer/src/utils/` | 105 | Utility functions (messageUtils, copy, analytics, api helpers, assistant utils, citation utils; ~42 test files) | cross-cutting | Shared utility layer used across Features. Noted in constitution. |
| 4 | `src/renderer/src/hooks/` | 61 | React hooks (useAssistant, useAttachment, useChatContext, useCopilot, useRuntime, etc.) | cross-cutting | Cross-cutting hooks layer. Will be rewritten as Zustand-based hooks. |
| 5 | `src/main/services/` (unmapped portions) | 57 | Main process services (AppService, AppUpdater, CacheService, CherryINOAuth, CodeTools, Copilot, RemoteFile) | assigned:per-Feature | AppService/AppUpdater/CherryINOAuth/RemoteFile → F001; CodeTools/Copilot → F010 |
| 6 | `src/renderer/src/services/` (unmapped) | 49 | Renderer services (import/, db/, ocr/, ApiService, AssistantService, ConversationService) | assigned:per-Feature | Distributed by domain: knowledge svcs → F004, chat svcs → F005, ocr → F010 |
| 7 | `src/renderer/src/pages/` (unmapped) | 41 | Page components (knowledge/:25, store/:8, history/:5, openclaw/:2, launchpad/:1) | assigned:per-Feature | knowledge/ → F004, store/ → F001, history/ → F005, openclaw/ → F010 |
| 8 | `src/renderer/src/config/` | 34 | Configuration files (models/:19, prompts, providers, endpoints) | assigned:per-Feature | models/providers → F002, prompts → F005, endpoints → F002 |
| 9 | `packages/extension-table-plus/` | 21 | TipTap table extension plugin | assigned:F009 | Notes editor's table extension |
| 10 | `packages/aiCore/src/` (extras) | 18 | aiCore package files outside mapped subdirs | assigned:F003 | Additional core engine files |
| 11 | `packages/mcp-trace/` | 14 | MCP tracing/debugging library | assigned:F006 | MCP integration tracing |
| 12 | `packages/shared/` (extras) | 12 | Shared utilities, configs, types | assigned:F001 | Core platform shared infrastructure |
| 13 | `src/renderer/src/windows/` | 21 | Window-specific components (mini, search, selection) | assigned:F001 | Core platform window management |
| 14 | `src/renderer/src/store/` (unmapped) | 13 | Redux store slices not explicitly listed | assigned:per-Feature | Distributed by domain to respective Features |
| 15 | `src/renderer/src/trace/` | 12 | Tracing/debugging utilities | assigned:F001 | Core platform debugging infrastructure |
| 16 | `src/renderer/src/types/` (unmapped) | 17 | Type definitions not explicitly listed | assigned:per-Feature | Distributed by domain to respective Features |
| 17 | `resources/` | 4 | Resource download scripts | assigned:F001 | Core platform resource management |

### Unmapped Endpoints

| # | Method | Path | Source Location | Classification | Detail |
|---|--------|------|----------------|----------------|--------|
| — | — | — | — | — | All REST endpoints covered (96%+). Minor count discrepancy due to grouping variants. |

### Unmapped IPC Channels (~124 gap)

| # | Domain | Approx Count | Classification | Detail |
|---|--------|-------------|----------------|--------|
| 1 | App (extended) | ~20 | assigned:F001 | Binary install (uv, bun, ovms), disk info, system fonts, hardware acceleration, full screen |
| 2 | Selection | ~16 | assigned:F010 | Text selection popup, translate, explain, summarize, improve actions |
| 3 | OpenClaw | ~16 | assigned:F010 | Plugin marketplace channels |
| 4 | Trace | ~12 | assigned:F001 | Debugging/tracing channels |
| 5 | Copilot | ~10 | assigned:F010 | In-app copilot sub-channels |
| 6 | CherryIN | ~10 | assigned:F001 | Cloud account channels |
| 7 | Claude Code Plugin | ~7 | assigned:F012 | Agent plugin integration channels |
| 8 | OVMS | ~8 | assigned:F010 | OpenVINO model server channels |
| 9 | Other (scattered) | ~25 | assigned:per-Feature | Various small channel groups |

### Unmapped Entities/Models

| # | Model Name | Source Location | Classification | Detail |
|---|------------|----------------|----------------|--------|
| — | — | — | — | All 12 persistent tables (Drizzle+Dexie) and 60 logical business entities covered. Remaining ~368 TypeScript type/interface definitions are component props, API response types, and utility types — not business entities. |

### Unmapped Test Files

| # | Test File Path | Related Source | Classification | Detail |
|---|---------------|---------------|----------------|--------|
| 1 | `src/renderer/src/utils/**/*.test.ts` | Utility functions | excluded | ~42 test files for utils |
| 2 | `src/renderer/src/services/**/*.test.ts` | Renderer services | excluded | ~9 test files for services |
| 3 | `src/main/services/**/*.test.ts` | Main process services | excluded | ~7 test files |
| 4 | `packages/aiCore/**/*.test.ts` | aiCore package | excluded | ~16 test files |
| 5 | `tests/` | E2E / integration tests | excluded | ~19 test files |
| 6 | Other scattered test files | Various | excluded | ~121 remaining test files |

> **Classification values**:
> - `assigned:F00N` — Added to existing Feature F00N's pre-context.md Source Reference
> - `new-feature` — New Feature created to cover this item (see roadmap.md)
> - `cross-cutting` — Flagged as cross-cutting concern for constitution/infrastructure Feature
> - `excluded` — Intentionally excluded (see Intentional Exclusions below)

---

## Intentional Exclusions

Items classified as intentional exclusions during Phase 4-3 review. These items will be **filtered out** from future parity checks via `/smart-sdd parity`.

| # | Item | Type | Exclusion Reason | Description |
|---|------|------|-----------------|-------------|
| 1 | All test files (214 files) | test | `covered-differently` | Tests will be rewritten TDD-first in the new implementation. Existing test patterns (Redux-based, Ant Design-based) don't apply to the new stack. |
| 2 | Build/dev scripts (24 files in `scripts/`) | file | `replaced` | Build scripts will be replaced by new electron-vite + pnpm workspace scripts appropriate for the new stack configuration. |

### Exclusion Reason Codes

| Code | Meaning | Revisit? |
|------|---------|----------|
| `deprecated` | Functionality already deprecated in the original source | No |
| `replaced` | Superseded by a different approach in the new implementation | No |
| `third-party` | Now handled entirely by an external service/library | Verify integration only |
| `deferred` | Intentionally deferred for future work (linked to roadmap.md) | Yes — during `/smart-sdd expand` |
| `out-of-scope` | Business decision to not include in redevelopment | On business request |
| `covered-differently` | Functionality achieved through a different architecture in the new system | No — verify behavior only |

---

## Coverage Notes

- **Shared UI Components** (255 files in `src/renderer/src/components/`) are the largest unmapped group. Classified as cross-cutting — these will be rebuilt using shadcn/ui + Radix UI per-Feature during implementation. The constitution should include a "Shared Component Library" principle.
- **Renderer-side aiCore** (104 files) was split between F003 (engine) and F005 (chat). The legacy pipeline files are reference-only since the new implementation will consolidate on the Modern pipeline (Vercel AI SDK).
- **Utility functions and hooks** (166 files) are cross-cutting. Many will be rewritten for Zustand-based state management. Key utilities (message formatting, citation parsing) should be extracted during F005 implementation.
- **IPC channel gap** (~124 channels, 63.9% coverage): The api-registry.md captures domain groupings but underestimates individual channel counts. The actual 344 channels should be fully enumerated during F001 implementation. Many ungrouped channels belong to auxiliary features (selection, OpenClaw, copilot, trace).
- **Test files** (214 files) intentionally excluded — the constitution mandates Test-First (TDD) approach, so all tests will be written fresh before implementation.
- **Build scripts** (24 files) intentionally excluded — will be replaced during project scaffolding with new electron-vite configuration.
- **47.2% file coverage is expected** for a core-scope reverse-spec focusing on business logic and architecture rather than every UI component. The persistent data layer (100%), REST APIs (96%), and business entities (100%) are comprehensively covered.
