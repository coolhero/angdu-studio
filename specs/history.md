# Decision History

> Auto-generated during `/reverse-spec` and `/smart-sdd` execution.
> Records key strategic and architectural decisions with rationale.

## Project Context

| | Details |
|---|---------|
| **Mode** | Rebuild |
| **Original** | Cherry Studio (`/Users/coolhero/Develop/cherry-studio`) |
| **Target** | Angdu Studio (`/Users/coolhero/Develop/angdu-studio`) |
| **Stack** | New Stack: Electron + React + AntD/SC/TW → Electron + React + Tailwind/shadcn + Zustand |
| **Identity** | Cherry Studio → Angdu Studio |
| **What it does** | AI-powered desktop chat application supporting multiple LLM providers with conversation management, knowledge base, and plugin system |

---

## [2026-03-14] /reverse-spec — Project Setup

### Strategy Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | Core | — |
| Stack | New | — |
| Project Identity | Cherry Studio → Angdu Studio | Cherry → Angdu prefix mapping |

### Per-Category Stack Choices (New Stack)

| Category | Original | Chosen | Reason |
|----------|----------|--------|--------|
| Language | TypeScript 5.8 | TypeScript 5.x | Keep — best ecosystem for React/Electron |
| Framework | Electron 40 | Electron (latest) | Keep — proven stability, full Node.js access |
| UI Framework | Ant Design + Styled Components + Tailwind | Tailwind CSS 4 + shadcn/ui | Simplify from 3 styling systems to 1 clean approach |
| State Management | Redux Toolkit + redux-persist | Zustand + persist | Simpler, less boilerplate, built-in persist |
| Rich Text | Tiptap 3 | Tiptap 3 | Keep — best-in-class React rich text editor |
| Database | Drizzle ORM + SQLite | Drizzle ORM + SQLite | Keep — modern, type-safe |
| AI SDK | Vercel AI SDK | Vercel AI SDK | Keep — best multi-provider support |
| Build Tool | electron-vite | electron-vite | Keep — designed for Electron |
| Testing | Vitest + Playwright | Vitest + Playwright | Keep — modern, fast |
| I18n | i18next | i18next | Keep — mature, well-supported |

### Architecture Decisions

| Decision | Choice | Details |
|----------|--------|---------|
| Feature Granularity | Standard (Module-level) | 14 Features |
| Tier Adjustments | None — accepted AI recommendation as-is | T1: 6, T2: 4, T3: 4 |
| Demo Groups | 4 groups defined | DG-01 Basic Chat, DG-02 RAG Chat, DG-03 Tool Chat, DG-04 Data Persistence |
