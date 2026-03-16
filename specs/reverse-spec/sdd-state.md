# SDD State

**Project**: Angdu Studio
**Origin**: rebuild
**Domain Profile**: desktop-app
**Interfaces**: gui
**Concerns**: async-state, ipc
**Archetype**: ai-assistant
**Scenario**: rebuild
**Custom**: none
**Source Path**: /Users/coolhero/Develop/cherry-studio
**Clarity Index**: N/A
**CI Dimensions**: N/A
**CI Low-confidence**: N/A
**Scope**: core
**Active Tiers**: T1
**Created**: 2026-03-15T14:00:00
**Last Updated**: 2026-03-15T14:00:00
**Constitution Version**: 1.0.0
**State Schema Version**: 2.0
**Framework**: electron

---

## Rebuild Configuration

| Parameter | Value |
|-----------|-------|
| change_scope | stack |
| preservation_level | functional |
| source_available | running |
| migration_strategy | big-bang |

---

### Foundation Decisions

**Framework**: Electron

#### Decided
| ID | Item | Decision | Date |

#### Deferred
| ID | Item | Reason |

#### T0 Features
| Feature ID | Foundation Category | Status |

---

## Constitution

| Item | Value |
|------|-------|
| Status | completed |
| Version | 1.0.0 |
| Completed At | 2026-03-15T14:00:00 |
| Updates | 0 |

---

## Toolchain

| Tool | Command | Status | Detected At |
|------|---------|--------|-------------|
| Build | pnpm run build (electron-vite build) | ✅ available | 2026-03-16 |
| Test | vitest run | ✅ available | 2026-03-16 |
| Lint | eslint . --ext .ts,.tsx (v10.0.3) | ✅ available | 2026-03-16 |
| Playwright | npx playwright (v1.58.2) | ✅ available | 2026-03-16 |

Foundation Verified: 2026-03-16 | PASS | Build ✅, Toolchain ✅, Platform N/A

---

## Feature Progress

| Feature ID | Feature Name | Tier | specify | plan | tasks | analyze | implement | verify | merge | Status |
|------------|-------------|------|---------|------|-------|---------|-----------|--------|-------|--------|
| F001 | app-shell | T1 | ✅ 03-15 | ✅ 03-15 | ✅ 03-15 | ✅ 03-15 | ✅ 03-15 | ✅ 03-15 | ✅ 03-15 | completed |
| F002 | navigation | T1 | ✅ 03-16 | ✅ 03-16 | ✅ 03-16 | ✅ 03-16 | ✅ 03-16 | ✅ 03-16 | ✅ 03-16 | completed |
| F003 | settings | T1 | ✅ 03-16 | ✅ 03-16 | ✅ 03-16 | ✅ 03-16 | ✅ 03-16 | ✅ 03-16 | ✅ 03-16 | completed |
| F004 | model-provider | T1 | ✅ 03-16 | ✅ 03-16 | ✅ 03-16 | ✅ 03-16 | ✅ 03-16 | ✅ 03-16 | ✅ 03-16 | completed |
| F005 | chat-conversation | T1 | ✅ 03-16 | ✅ 03-16 | ✅ 03-16 | ✅ 03-16 | ✅ 03-16 | ✅ 03-17 | ✅ 03-17 | completed |
| F006 | knowledge-memory | T2 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | deferred |
| F007 | mcp-tools | T2 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | deferred |
| F008 | content-management | T2 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | deferred |
| F009 | web-search | T3 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | deferred |
| F010 | api-server | T3 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | deferred |

---

## Feature Detail Log

### F001-app-shell

| Step | Status | Started | Completed | Notes |
|------|--------|---------|-----------|-------|
| specify | completed | 2026-03-15T14:00:00 | 2026-03-15T14:30:00 | 22 FRs, 10 SCs, 8 user stories, 40/40 SBI mapped |
| plan | completed | 2026-03-15T14:30:00 | 2026-03-15T15:00:00 | 2 entities, 33 IPC channels, 7 phases, 6 research decisions |
| tasks | completed | 2026-03-15T15:00:00 | 2026-03-15T15:30:00 | 54 tasks, 13 phases, 8 user stories |
| analyze | completed | 2026-03-15T15:30:00 | 2026-03-15T15:45:00 | 0 issues, 22/22 FR coverage, 10/10 SC coverage |
| implement | completed | 2026-03-15T15:45:00 | 2026-03-15T16:30:00 | 30+ files, TS clean, build OK, runtime OK. Switched better-sqlite3→electron-store (SKF-019) |
| verify | completed | 2026-03-15T16:30:00 | 2026-03-15T17:00:00 | Build ✅, TS ✅, Runtime ✅ (SC-001/002/007/008/010 via Playwright), Cross-feature 6/6 ✅, Demo ✅ |

### F002-navigation

| Step | Status | Started | Completed | Notes |
|------|--------|---------|-----------|-------|
| specify | completed | 2026-03-16T07:42:00 | 2026-03-16T07:50:00 | 17 FRs, 10 SCs, 8 user stories, 15 SBI mapped |
| plan | completed | 2026-03-16T07:55:00 | 2026-03-16T08:10:00 | 2 entities (Tab, NavbarConfig), 6 phases, 6 research decisions, 9 interaction chains |
| tasks | completed | 2026-03-16T08:10:00 | 2026-03-16T08:20:00 | 44 tasks, 11 phases, 8 user stories |
| analyze | completed | 2026-03-16T08:20:00 | 2026-03-16T08:30:00 | 0 critical, 0 high blocking, FR-006 clarified in T005 |
| implement | completed | 2026-03-16T08:30:00 | 2026-03-16T09:00:00 | 37 files, TS clean, build OK, runtime OK. Fixed Tailwind CSS plugin + layout mode |
| verify | completed | 2026-03-16T09:00:00 | 2026-03-16T09:15:00 | Build ✅, TS ✅, Smoke ✅, Cross-feature ✅, Demo ✅ |

### F003-settings

| Step | Status | Started | Completed | Notes |
|------|--------|---------|-----------|-------|
| specify | completed | 2026-03-16T10:00:00 | 2026-03-16T10:15:00 | 28 FRs, 10 SCs, 7 user stories, 25 SBI mapped (B056-B080) |
| plan | completed | 2026-03-16T10:15:00 | 2026-03-16T10:45:00 | 3 entities, 8 IPC channels, 6 phases, 16 interaction chains, 7 pattern constraints |
| tasks | completed | 2026-03-16T10:45:00 | 2026-03-16T11:00:00 | 65 tasks, 10 phases, 7 user stories |
| analyze | completed | 2026-03-16T11:00:00 | 2026-03-16T11:15:00 | 0 critical, 3 high (resolved), 28/28 FR coverage |
| implement | completed | 2026-03-16T11:15:00 | 2026-03-16T12:30:00 | 30+ files, TS clean, build OK. Fixed: Tailwind dark variant, useTheme wiring, startup IPC |
| verify | completed | 2026-03-16T12:30:00 | 2026-03-16T13:00:00 | Build ✅, TS ✅, Cross-feature ✅, Runtime ✅ (4 sub-pages, 0 errors), Demo ✅ |

### F004-model-provider

| Step | Status | Started | Completed | Notes |
|------|--------|---------|-----------|-------|
| specify | completed | 2026-03-16T14:00:00 | 2026-03-16T14:30:00 | 32 FRs, 10 SCs, 7 user stories, 30 SBI mapped (B081-B110) |
| plan | completed | 2026-03-16T14:30:00 | 2026-03-16T15:00:00 | 2 entities (Provider, Model), 15 IPC channels, 6 phases, 6 research decisions, 14 interaction chains, 7 pattern constraints |
| tasks | completed | 2026-03-16T15:00:00 | 2026-03-16T15:15:00 | 49 tasks, 10 phases, 7 user stories |
| analyze | completed | 2026-03-16T15:15:00 | 2026-03-16T15:30:00 | 0 critical, 0 high, 2 medium, 3 low. 32/32 FR coverage |
| implement | completed | 2026-03-16T15:30:00 | 2026-03-16T16:30:00 | 17 new files, 5 modified files, build ✅, smoke launch ✅. AI SDK deps installed, provider/model stores + services + IPC + UI complete |
| verify | completed | 2026-03-16T16:30:00 | 2026-03-16T17:00:00 | Build ✅, TS ✅, Playwright UI ✅ (33 switches, provider list, edit panel), Cross-feature ✅, Demo CI ✅. Fixed: Tailwind @theme mapping (SKF-036) |
| merge | completed | 2026-03-16T17:00:00 | 2026-03-16T17:15:00 | Fast-forward merge to main. 50 files, +3720 lines |

### F005-chat-conversation

| Step | Status | Started | Completed | Notes |
|------|--------|---------|-----------|-------|
| specify | completed | 2026-03-16T18:00:00 | 2026-03-16T18:30:00 | 38 FRs, 10 SCs, 12 user stories, 50 SBI mapped (B111-B160). SBI cross-check corrected layout flexibility + block types (8+extensible) |
| plan | completed | 2026-03-16T18:30:00 | 2026-03-16T19:30:00 | 5 entities, 18 IPC channels, 6 phases, 9 research decisions, 16+8 interaction chains, 11 UX contracts, 14 integration contracts, 9 pattern constraints |
| tasks | completed | 2026-03-16T19:30:00 | 2026-03-16T20:00:00 | 88 tasks, 14 phases, 12 user stories |
| analyze | completed | 2026-03-16T20:00:00 | 2026-03-16T20:15:00 | 0 critical, 0 high, 1 medium (FR-038 reasoning effort cache detail), 38/38 FR coverage |
| implement | completed | 2026-03-16T20:15:00 | 2026-03-16T22:00:00 | 40+ new files, 6 modified files, build ✅. 6 stores, 3 services, 8 block components, 8 chat components, 4 page components. TipTap editor, Shiki highlighting, @tanstack/react-virtual. Demo script created |
| verify | completed | 2026-03-16T22:00:00 | 2026-03-17T05:00:00 | Build ✅, TS ✅, Playwright E2E 6/6+4/4 pass. 채팅 동작 확인 (사용자 환경). Fixed: TipTap crash, ModelSelector 추가, HomeSidebar 탭 전환, AI SDK .chat() API, baseURL /v1, provider hydrate, block upsert, min-h-0 레이아웃. SKF-037~041 기록 |

---

## Feature Mapping

| Feature ID | spec-kit Name | spec-kit Path | Branch | Merged |
|------------|---------------|---------------|--------|--------|
| F001 | 001-app-shell | specs/001-app-shell/ | 001-app-shell | ✅ |
| F002 | 002-navigation | specs/002-navigation/ | 002-navigation | ✅ |
| F003 | 003-settings | specs/003-settings/ | 003-settings | ✅ |
| F004 | 004-model-provider | specs/004-model-provider/ | 004-model-provider | ✅ |
| F005 | 005-chat-conversation | specs/005-chat-conversation/ | 005-chat-conversation | |
| F006 | | | | |
| F007 | | | | |
| F008 | | | | |
| F009 | | | | |
| F010 | | | | |

---

## Global Evolution Log

| Date/Time | Trigger Feature | Target File | Change Description |
|-----------|----------------|-------------|-------------------|
| 2026-03-15 | F001-app-shell (plan) | entity-registry.md | Added WindowState, AppConfig entities (finalized from plan) |

---

## Restructure Log

| Date/Time | Operation | Details | Affected Features |
|-----------|-----------|---------|-------------------|

---

## Parity Check Log

| Date/Time | Source Path | Structural Parity | Logic Parity | Gaps Found | New Features | Exclusions | Deferred | Status |
|-----------|------------|-------------------|-------------|------------|-------------|------------|----------|--------|

---

## Source Behavior Coverage

| SBI | Priority | Origin | FR | Feature | Status |
|-----|----------|--------|----|---------|--------|
| B001 | P1 | extracted | FR-002 | F001-app-shell | 🔄 in_progress |
| B002 | P1 | extracted | FR-001 | F001-app-shell | 🔄 in_progress |
| B003 | P1 | extracted | FR-012 | F001-app-shell | 🔄 in_progress |
| B004 | P1 | extracted | FR-012 | F001-app-shell | 🔄 in_progress |
| B005 | P1 | extracted | FR-011 | F001-app-shell | 🔄 in_progress |
| B006 | P1 | extracted | FR-011 | F001-app-shell | 🔄 in_progress |
| B007 | P1 | extracted | FR-004 | F001-app-shell | 🔄 in_progress |
| B008 | P1 | extracted | FR-004 | F001-app-shell | 🔄 in_progress |
| B009 | P1 | extracted | FR-004 | F001-app-shell | 🔄 in_progress |
| B010 | P1 | extracted | FR-004 | F001-app-shell | 🔄 in_progress |
| B011 | P1 | extracted | FR-013 | F001-app-shell | 🔄 in_progress |
| B012 | P1 | extracted | FR-009 | F001-app-shell | 🔄 in_progress |
| B013 | P1 | extracted | FR-002 | F001-app-shell | 🔄 in_progress |
| B014 | P2 | extracted | FR-014 | F001-app-shell | 🔄 in_progress |
| B015 | P2 | extracted | FR-015 | F001-app-shell | 🔄 in_progress |
| B016 | P2 | extracted | FR-016 | F001-app-shell | 🔄 in_progress |
| B017 | P2 | extracted | FR-017 | F001-app-shell | 🔄 in_progress |
| B018 | P2 | extracted | FR-018 | F001-app-shell | 🔄 in_progress |
| B019 | P1 | extracted | FR-002 | F001-app-shell | 🔄 in_progress |
| B020 | P2 | extracted | FR-003 | F001-app-shell | 🔄 in_progress |
| B021 | P2 | extracted | FR-021 | F001-app-shell | 🔄 in_progress |
| B022 | P1 | extracted | FR-002 | F001-app-shell | 🔄 in_progress |
| B023 | P2 | extracted | FR-005 | F001-app-shell | 🔄 in_progress |
| B024 | P2 | extracted | FR-005 | F001-app-shell | 🔄 in_progress |
| B025 | P2 | extracted | FR-005 | F001-app-shell | 🔄 in_progress |
| B026 | P2 | extracted | FR-006 | F001-app-shell | 🔄 in_progress |
| B027 | P2 | extracted | FR-006 | F001-app-shell | 🔄 in_progress |
| B028 | P1 | extracted | FR-012 | F001-app-shell | 🔄 in_progress |
| B029 | P2 | extracted | FR-022 | F001-app-shell | 🔄 in_progress |
| B030 | P2 | extracted | FR-018 | F001-app-shell | 🔄 in_progress |
| B031 | P2 | extracted | FR-007 | F001-app-shell | 🔄 in_progress |
| B032 | P2 | extracted | FR-007 | F001-app-shell | 🔄 in_progress |
| B033 | P2 | extracted | FR-007 | F001-app-shell | 🔄 in_progress |
| B034 | P3 | extracted | FR-008 | F001-app-shell | 🔄 in_progress |
| B035 | P3 | extracted | FR-008 | F001-app-shell | 🔄 in_progress |
| B036 | P1 | extracted | FR-009 | F001-app-shell | 🔄 in_progress |
| B037 | P2 | extracted | FR-009 | F001-app-shell | 🔄 in_progress |
| B038 | P2 | extracted | FR-019 | F001-app-shell | 🔄 in_progress |
| B039 | P2 | extracted | FR-020 | F001-app-shell | 🔄 in_progress |
| B040 | P3 | extracted | FR-010 | F001-app-shell | 🔄 in_progress |

**Summary (extracted only — original source coverage):**
P1: 15/15 (100%) ✅
P2: 19/19 (100%) ✅
P3: 3/3 (100%) ✅
Overall: 40/40 (100%)

---

## Demo Group Progress

| Group | Scenario | Features | Completed | Status | Last Demo |
|-------|----------|----------|-----------|--------|-----------|
| DG-01 | Basic Chat | F001,F002,F004,F005 | 0/4 | ⏳ F001,F002,F004,F005 pending | — |
| DG-02 | Knowledge RAG | F004,F005,F006 | 0/3 | ⏳ F006 deferred | — |
| DG-03 | Multi-Tool | F003,F007,F008,F009 | 0/4 | ⏳ F007,F008,F009 deferred | — |
| DG-04 | External API | F004,F005,F010 | 0/3 | ⏳ F010 deferred | — |

---

## Constitution Update Log

| Version | Date/Time | Trigger | Change Description |
|---------|-----------|---------|-------------------|
| 1.0.0 | 2026-03-15 | Initial finalization | Finalized based on constitution-seed from reverse-spec |
