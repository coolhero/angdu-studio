# Decision History

> Auto-generated during `/reverse-spec` and `/smart-sdd` execution.
> Records key strategic and architectural decisions with rationale.

## Project Context

| | Details |
|---|---------|
| **Mode** | Rebuild |
| **Original** | Cherry Studio (`/Users/coolhero/Develop/cherry-studio`) |
| **Target** | Angdu Studio (`/Users/coolhero/Develop/angdu-studio`) |
| **Stack** | New Stack: Keep Electron/React/TS, migrate UI to shadcn/ui, state to Zustand, DB to unified SQLite |
| **Identity** | Cherry Studio → Angdu Studio (Cherry → Angdu) |
| **What it does** | AI-powered desktop chat application supporting 16+ LLM providers with conversation management, knowledge base (RAG), MCP protocol support, agent system, code workspace, and plugin ecosystem |

---

## [2026-03-15] /reverse-spec — Project Setup

### Strategy Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | Core | — |
| Stack | New | — |
| Project Identity | Cherry Studio → Angdu Studio | Cherry → Angdu prefix mapping |

### Per-Category Stack Choices (New Stack)

| Category | Original | Chosen | Reason |
|----------|----------|--------|--------|
| Language | TypeScript 5.8.3 | TypeScript 5.x | Keep — already optimal |
| Framework | Electron 40 | Electron (latest) | Keep — proven for AI desktop apps |
| UI Framework | React 19 | React 19 | Keep — latest, excellent ecosystem |
| UI Library | Ant Design 5 | shadcn/ui + Radix | Modern, composable, Tailwind-native |
| CSS | Tailwind + Styled Components | Tailwind CSS 4 only | Simplify, drop Styled Components |
| State Mgmt | Redux Toolkit + React Query | Zustand + TanStack Query | Lighter, simpler API |
| DB/Storage | Dexie + SQLite/Drizzle | SQLite (Drizzle) unified | Eliminate IndexedDB complexity |
| AI SDK | Vercel AI SDK 6 | Vercel AI SDK | Keep — best multi-provider abstraction |
| Rich Text | TipTap + CodeMirror | TipTap + CodeMirror | Keep — best-in-class |
| Build | electron-vite | electron-vite | Keep — purpose-built |
| Testing | Vitest + Playwright | Vitest + Playwright | Keep — already optimal |
| i18n | i18next | i18next | Keep — mature |

---

## [2026-03-15] /reverse-spec — Phase 3 & 4 Complete

### Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Feature granularity | Level 2 Standard (12 Features) | Right-sized for spec writing; clean module boundaries |
| Feature ID scheme | F001-F009 (T1), F010-F012 (T2) | Tier-first ordering for clear priority |
| Release groups | RG-1 Foundation -> RG-2 Chrome -> RG-3 AI Core -> RG-4 Depth | Dependency-resolved build order |
| Entity storage | All entities in unified SQLite | Eliminates Dexie/IndexedDB; single source of truth |
| IPC bridge | Typed channels via shared enum | End-to-end type safety across processes |
| Block architecture | Messages contain block ID arrays; blocks stored separately | Enables lazy loading and mixed block types |

### Deliverables Produced

| File | Purpose |
|------|---------|
| `specs/reverse-spec/roadmap.md` | Feature catalog, dependency graph, release groups, demo scenarios |
| `specs/reverse-spec/entity-registry.md` | 13 core entities with fields, types, relationships |
| `specs/reverse-spec/api-registry.md` | ~144 IPC channels grouped by Feature |
| `specs/reverse-spec/business-logic-map.md` | 73 business rules across 12 Features |
| `specs/reverse-spec/constitution-seed.md` | Architecture principles, constraints, migration notes |
| `specs/reverse-spec/stack-migration.md` | Technology mapping with migration rationale |
| `specs/reverse-spec/coverage-baseline.md` | Coverage metrics: 97% IPC, 72% entities, 85% user-facing |
| `.env.example` | Environment variable template |
| `specs/reverse-spec/features/F00N-*/pre-context.md` | 12 Feature pre-contexts with SBI (B001-B155) |

### Key Metrics

| Metric | Value |
|--------|-------|
| Total Features | 12 (9 Tier 1, 3 Tier 2) |
| Source behaviors documented | 155 (B001-B155) |
| Business rules documented | 73 (BL-001 to BL-073) |
| IPC channels mapped | ~144 core + ~100 deferred |
| Entities defined | 13 core entities |
| Release groups | 4 (Foundation, Chrome, AI Core, Depth) |
