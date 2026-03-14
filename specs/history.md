# Decision History

> Auto-generated during `/reverse-spec` and `/smart-sdd` execution.
> Records key strategic and architectural decisions with rationale.

## Project Context

| | Details |
|---|---------|
| **Mode** | Rebuild |
| **Original** | Cherry Studio (`/Users/coolhero/Develop/cherry-studio`) |
| **Target** | Angdu Studio (`/Users/coolhero/Develop/angdu-studio`) |
| **Stack** | New Stack: Electron+React+Redux → Electron+React+Zustand+Tailwind+shadcn/ui |
| **Identity** | Cherry Studio → Angdu Studio |
| **What it does** | AI-powered desktop chat application supporting multiple LLM providers with conversation management, knowledge base, and plugin system |

---

## [2026-03-14] /reverse-spec — Project Setup

### Strategy Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | core | — |
| Stack | new | — |
| Project Identity | Cherry Studio → Angdu Studio | Cherry → Angdu, CS → AS prefix mappings |

### Per-Category Stack Choices (New Stack)

| Category | Original | Chosen | Reason |
|----------|----------|--------|--------|
| Language | TypeScript 5.8 | TypeScript 5.x | Optimal for full-stack Electron+React |
| Desktop Framework | Electron 40 | Electron (latest) | User preference — keep familiar platform |
| Build Tool | electron-vite 5 | Vite 7 + electron-toolkit | Latest Rolldown engine, recommended |
| Frontend | React 19 | React 19 | Already latest, auto-accepted |
| State Management | Redux Toolkit + Persist | Zustand + middleware | Simpler, lighter — auto-accepted |
| UI Library | AntD + Styled Comp + Tailwind | Tailwind 4 + shadcn/ui | Lighter, no CSS-in-JS runtime — auto-accepted |
| Rich Editor | TipTap 3.2 | TipTap 3.x | No better alternative — auto-accepted |
| Code Editor | CodeMirror 4.25 | CodeMirror | Best-in-class — auto-accepted |
| DB (Main) | Drizzle + LibSQL | Drizzle + better-sqlite3 | Synchronous, faster for Electron — auto-accepted |
| DB (Renderer) | Dexie | Dexie | Best IndexedDB wrapper — auto-accepted |
| Testing | Vitest + Playwright | Vitest + Playwright | Already optimal — auto-accepted |
| i18n | i18next | i18next | Mature, well-supported — auto-accepted |
| Data Fetching | React Query | TanStack Query | Same library, latest — auto-accepted |
| AI SDK | Vercel AI SDK | Vercel AI SDK | Best unified provider — auto-accepted |

### Architecture Decisions

| Decision | Choice | Details |
|----------|--------|---------|
| Feature Granularity | Standard | 14 Features |
| Demo Groups | 4 groups | DG-01 Basic Chat, DG-02 KB Chat, DG-03 Agent Workflow, DG-04 Full Experience |
| Tier Adjustments | None — accepted AI recommendation as-is | T1: 6, T2: 4, T3: 4 |
