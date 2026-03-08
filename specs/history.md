# Decision History

> Auto-generated during `/reverse-spec` and `/smart-sdd` execution.
> Records key strategic and architectural decisions with rationale.

## Project Context

| | Details |
|---|---------|
| **Mode** | Rebuild |
| **Original** | Cherry Studio (`/Users/coolhero/Develop/cherry-studio`) |
| **Target** | Angdu Studio (`/Users/coolhero/Develop/angdu-studio`) |
| **Stack** | New Stack: Redux→Zustand, AntD→shadcn/ui (rest kept) |
| **Identity** | Cherry Studio → Angdu Studio |
| **What it does** | AI-powered desktop chat application supporting multiple LLM providers with conversation management, knowledge base, and assistant system |

---

## 2026-03-08 /reverse-spec — Project Setup

### Strategy Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | core | — |
| Stack | new | — |
| Project Identity | Cherry Studio → Angdu Studio | Prefix: Cherry → Angdu, CS → AS |

### Per-Category Stack Choices (New Stack)

| Category | Original | Chosen | Reason |
|----------|----------|--------|--------|
| Language | TypeScript 5.8 | TypeScript 5.8 (Keep) | — |
| Framework | Electron 40 + React 19 | Electron + React (Keep) | — |
| Build Tool | electron-vite + SWC | electron-vite + SWC (Keep) | — |
| ORM/DB | Drizzle + SQLite | Drizzle + SQLite (Keep) | — |
| State Mgmt | Redux Toolkit + Dexie | Zustand + Dexie | Simpler API, less boilerplate |
| UI Library | Ant Design + TailwindCSS + Styled Components | shadcn/ui + TailwindCSS 4 | Ownable components, single styling system |
| Rich Editor | TipTap 3 + CodeMirror 6 | TipTap 3 + CodeMirror 6 (Keep) | — |
| AI/LLM SDK | Vercel AI SDK 6 | Vercel AI SDK 6 (Keep) | — |
| Testing | Vitest + Playwright | Vitest + Playwright (Keep) | — |
| i18n | i18next | i18next (Keep) | — |

### Architecture Decisions

| Decision | Choice | Details |
|----------|--------|---------|
| Feature Granularity | Standard | 12 Features |
| Tier Adjustments | None — accepted AI recommendation as-is | T1: app-core, ai-provider, chat-core, chat-ui; T2: mcp-tools, knowledge, settings-data; T3: agents, memory, notes, translate, paintings |
| Demo Groups | 4 groups defined | DG-01 Basic Chat, DG-02 Knowledge-Enhanced Chat, DG-03 Agent Workflow, DG-04 Productivity Tools |
