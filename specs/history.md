# Decision History

> Auto-generated during `/reverse-spec` and `/smart-sdd` execution.
> Records key strategic and architectural decisions with rationale.

## Project Context

| | Details |
|---|---------|
| **Mode** | Rebuild |
| **Original** | Cherry Studio (`/Users/coolhero/Develop/cherry-studio`) |
| **Target** | Angdu Studio (`/Users/coolhero/Develop/angdu-studio`) |
| **Stack** | New Stack: Redux→Zustand, AntD→shadcn/ui+Tailwind4, LibSQL→better-sqlite3 |
| **Identity** | Cherry Studio → Angdu Studio (Cherry → Angdu, CS → AS) |
| **What it does** | AI-powered desktop chat application supporting multiple LLM providers with conversation management, knowledge base, and plugin system |

---

## [2026-03-15] /reverse-spec — Project Setup

### Strategy Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | Core | — |
| Stack | New | — |
| Project Identity | Cherry Studio → Angdu Studio | Cherry → Angdu, CS → AS |

### Per-Category Stack Choices (New Stack)

| Category | Original | Chosen | Reason |
|----------|----------|--------|--------|
| Language | TypeScript 5.8 | TypeScript 5.8+ | Already optimal |
| Desktop Framework | Electron 40 | Electron (latest) | Mature, keep same |
| UI Framework | React 19 | React 19 | Already latest |
| Build Tool | electron-vite 5 | electron-vite (latest) | Cutting-edge |
| State Management | Redux Toolkit + Persist | Zustand + Persist | Simpler, less boilerplate |
| UI Library | Ant Design + Styled Comp + Tailwind | shadcn/ui + Tailwind 4 | More customizable, modern |
| DB/ORM | Drizzle + LibSQL + Dexie | Drizzle + better-sqlite3 | Native SQLite for Electron |
| AI SDK | Vercel AI SDK 6 | Vercel AI SDK (latest) | Best multi-provider |
| Editor | TipTap 3 | TipTap 3 | No better alternative |
| Testing | Vitest + Playwright | Vitest + Playwright | Already optimal |
| Packaging | electron-builder | electron-builder | Mature |

### Architecture Decisions

| Decision | Choice | Details |
|----------|--------|---------|
| Feature Granularity | Standard (Module-level) | 10 Features |
| Tier Adjustments | None — accepted AI recommendation as-is | T1: 5 Features, T2: 3 Features, T3: 2 Features |
| Demo Groups | 4 groups defined | DG-01 Basic Chat, DG-02 Knowledge RAG, DG-03 Multi-Tool, DG-04 External API |
| Archetype | ai-assistant (detected) | 15+ AI providers, streaming-first, RAG pipeline, embeddings |
