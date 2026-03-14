# Decision History

> Auto-generated during `/reverse-spec` and `/smart-sdd` execution.
> Records key strategic and architectural decisions with rationale.

## Project Context

| | Details |
|---|---------|
| **Mode** | Rebuild |
| **Original** | Cherry Studio (`/Users/coolhero/Develop/cherry-studio`) |
| **Target** | Angdu Studio (`/Users/coolhero/Develop/angdu-studio`) |
| **Stack** | New Stack: AntDesign+styled-components→shadcn/ui+Tailwind, Redux→Zustand |
| **Identity** | Cherry Studio → Angdu Studio (Cherry → Angdu, CS → AS) |
| **What it does** | AI-powered desktop chat application supporting multiple LLM providers with conversation management, knowledge base, agents, MCP support, and plugin system |

---

## [2026-03-14] /reverse-spec — Project Setup

### Strategy Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | core | — |
| Stack | new | — |
| Project Identity | Cherry Studio → Angdu Studio | — |

### Per-Category Stack Choices (New Stack)

| Category | Original | Chosen | Reason |
|----------|----------|--------|--------|
| Language | TypeScript 5.8 | TypeScript 5.8 (keep) | — |
| Framework | Electron 40 | Electron (keep) | — |
| Frontend | React 19 | React 19 (keep) | — |
| UI Library | Ant Design + styled-components + Tailwind | shadcn/ui + Tailwind CSS | Modern, copy-paste model, full control |
| State Management | Redux Toolkit + redux-persist | Zustand + electron-store | Lightweight, less boilerplate |
| DB/ORM | SQLite (libsql + Drizzle) | SQLite (libsql + Drizzle) (keep) | — |
| Build Tool | electron-vite | electron-vite (keep) | — |
| Rich Text Editor | TipTap 3.2 | TipTap 3.x (keep) | — |
| Code Editor | CodeMirror 6 | CodeMirror 6 (keep) | — |
| AI SDK | Vercel AI SDK 6 | Vercel AI SDK (keep) | — |
| i18n | i18next | i18next (keep) | — |
| Testing | Vitest + Playwright | Vitest + Playwright (keep) | — |
| Packaging | electron-builder | electron-builder (keep) | — |

### Architecture Decisions

| Decision | Choice | Details |
|----------|--------|---------|
| Feature Granularity | Standard | 12 Features |
| Demo Groups | 4 groups defined | DG-01 Basic AI Chat, DG-02 Knowledge-Augmented Chat, DG-03 Productivity Tools, DG-04 MCP & External Integration |
| Tier Adjustments | None — accepted AI recommendation as-is | T1: 6 Features, T2: 3 Features, T3: 3 Features |
