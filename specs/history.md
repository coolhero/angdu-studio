# Decision History

> Auto-generated during `/reverse-spec` and `/smart-sdd` execution.
> Records key strategic and architectural decisions with rationale.

## Project Context

| | Details |
|---|---------|
| **Mode** | Rebuild |
| **Original** | Cherry Studio (`/Users/coolhero/Develop/cherry-studio`) |
| **Target** | Angdu Studio (`/Users/coolhero/Develop/angdu-studio`) |
| **Stack** | New Stack: Electron 40 + React 19 + Zustand 5 + shadcn/ui + Tailwind CSS 4 |
| **Identity** | Cherry Studio → Angdu Studio |
| **What it does** | AI-powered desktop chat application supporting multiple LLM providers with conversation management, knowledge base, MCP server integration, and agent system |

---

## [2026-03-13] /reverse-spec — Project Setup

### Strategy Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | Core | — |
| Stack | New | — |
| Project Identity | Cherry Studio → Angdu Studio | Cherry → Angdu, CS → AS, @cherrystudio → @angdu |

### Per-Category Stack Choices (New Stack)

| Category | Original | Chosen | Reason |
|----------|----------|--------|--------|
| Language | TypeScript 5.8 | TypeScript 5.8+ (Keep) | Best Electron ecosystem support |
| Desktop Framework | Electron 40 | Electron 40 (Keep) | Full Node.js access for AI/MCP SDKs |
| UI Framework | React 19 | React 19 (Keep) | Latest, largest ecosystem |
| Component Library | Ant Design 5.27 | shadcn/ui + Radix | Tailwind-first, no CSS-in-JS runtime overhead |
| Styling | styled-components + Tailwind | Tailwind CSS 4 only | Drop CSS-in-JS, pure utility-first |
| State Management | Redux Toolkit + Redux Persist | Zustand 5 + Persist | Simpler, less boilerplate |
| Server State | TanStack React Query 5 | React Query 5 (Keep) | Already optimal |
| Database | Drizzle + LibSQL + Dexie | Keep (same) | Already modern stack |
| AI SDK | Vercel AI SDK 6 | Keep (same) | Best multi-provider abstraction |
| Rich Text Editor | TipTap 3.2 | Keep TipTap 3 | Best extensible editor for React |
| Build Tool | electron-vite 5 | Keep (same) | Already optimal |
| Testing | Vitest + Playwright | Keep (same) | Already optimal |

### Architecture Decisions

| Decision | Choice | Details |
|----------|--------|---------|
| Feature Granularity | Standard (Module-level) | 12 Features |
| Demo Groups | 4 groups defined | DG-01 Core Chat, DG-02 Knowledge-Augmented Chat, DG-03 Configuration & Sync, DG-04 Creative Tools Suite |
| Tier Classification | 6 T1, 3 T2, 3 T3 | Accepted AI recommendation as-is |

### Feature Catalog

| ID | Feature | Tier | RG | Description |
|----|---------|------|----|-------------|
| F001 | app-shell | T1 | RG-1 | Electron main process, window management, IPC bridge, titlebar, tray, auto-update |
| F002 | navigation | T1 | RG-2 | Sidebar icon navigation, HashRouter routing, theme toggle, layout |
| F003 | settings | T1 | RG-2 | All settings pages, provider config, display, shortcuts, model/agent settings |
| F004 | ai-engine | T1 | RG-3 | Provider abstraction (20+ providers), model selection, streaming/completion, memory, copilot |
| F005 | assistant | T1 | RG-4 | Assistant CRUD, presets store, agent management, quick phrases |
| F006 | chat | T1 | RG-5 | Chat interface, topics, message display/streaming, input toolbar, message operations |
| F007 | file-management | T2 | RG-2 | File storage service, upload/download, document handling, file browser |
| F008 | mcp | T2 | RG-4 | MCP server lifecycle, tool injection, MCP settings, built-in servers |
| F009 | knowledge-base | T2 | RG-4 | KB management, RAG pipeline, embedding generation, document ingestion |
| F010 | notes | T3 | RG-2 | Notes editor (TipTap rich text), note tree management, Obsidian export |
| F011 | data-sync | T3 | RG-3 | Backup/restore, WebDAV/S3/Nutstore cloud sync, local transfer, data migration |
| F012 | creative-tools | T3 | RG-4 | AI art/paintings, translation, code tools, mini-apps, OpenClaw, launchpad |

---

## [2026-03-13] /smart-sdd pipeline — Constitution Finalization

### Constitution Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Constitution version | 1.0.0 | Initial creation from constitution-seed.md |
| Core principles | 5 principles (IPC Separation, Service-Oriented Main, Feature-Owned State, Provider Abstraction, Streaming-First) | Extracted from Cherry Studio architecture |
| i18n constraint | Korean (ko) + English (en) only, Korean default | User requirement — 다국어는 한국어와 영어만 지원, 한국어 기본 |
| Technical constraints | 7 constraints (Electron Security, Titlebar, Windows, Build, MCP, Offline-First, i18n) | — |
