# Case Study Observation Log

**Project**: Angdu Studio
**Domain**: app
**Archetype**: ai-assistant
**Framework**: electron
**Source**: /Users/coolhero/Develop/cherry-studio
**Started**: 2026-03-15

> Append entries chronologically at each milestone.
> Format: `## [YYYY-MM-DD] M{N} — {Milestone Name}`
> See `/case-study` recording protocol for milestone definitions and guidance.

---

## [2026-03-15] M1 — Project Background

**Context**: Before starting `/reverse-spec` analysis on /Users/coolhero/Develop/cherry-studio

### Observations
- Project: Cherry Studio, Tech stack: TypeScript/Electron 40/React 19/Ant Design/Redux/Dexie+SQLite, Scale: 2,206 source files, Structure: monorepo (pnpm workspaces)
- What it does: AI-powered desktop chat application supporting 16+ LLM providers with conversation management, knowledge base (RAG), agent system, MCP protocol, code workspace, and plugin ecosystem
- Mode: rebuild Cherry Studio → Angdu Studio
- Archetype signals: LLM SDKs detected (openai, anthropic, google, etc.), Vercel AI SDK — likely ai-assistant
- Framework: Electron (electron-vite build system)

### Anticipated Challenges
- Large codebase (2,206 files) with deep dependency chains
- Complex IPC patterns between main/renderer processes
- 16+ LLM providers requiring unified abstraction
- Rich editor ecosystem (TipTap + CodeMirror + Mermaid)
- State management migration: Redux → Zustand

## [2026-03-15] M1.5 — Runtime Exploration

- **Timestamp**: 2026-03-15T12:25:00+09:00
- **Mode**: automated (Playwright CLI via CDP)
- **Screens explored**: 2 (main chat, topics view)
- **Visual references captured**: 3 screenshots
- **Key findings**: Dark theme default, sidebar+content layout with vibrancy, tab-based multi-session, rich message input toolbar with 8+ tool buttons

## [2026-03-15] M2 — Project Scan

- **Timestamp**: 2026-03-15T12:30:00+09:00
- Tech stack confirmed: TS 5.8.3 / Electron 40.8.0 / React 19.2.0 / Ant Design 5.27 / Redux Toolkit / Dexie + SQLite(Drizzle) / Vercel AI SDK 6
- New stack decided: Keep TS/Electron/React, migrate UI→shadcn/ui, State→Zustand, DB→unified SQLite
- 213 CSS custom properties extracted
- Style tokens documented

## [2026-03-15] M3 — Feature Classification

- **Timestamp**: 2026-03-15T13:00:00+09:00
- Granularity: Standard (Module-level), 12 Features
- Tier 1 (Essential): 9 Features — Shell, Navigation, Theme, Providers, Models, Chat Core, Settings, Data/Storage, i18n
- Tier 2 (Recommended): 3 Features — Chat Advanced, Knowledge Base, MCP Integration
- Release Groups: 4 (Foundation → Chrome → AI Core → Depth)
- Archetype: ai-assistant detected (LLM SDKs, streaming, multi-provider)
- Demo Groups: 3 defined (First Chat, Provider Setup, Knowledge-Assisted Chat)

## [2026-03-15] M4 — Deliverable Generation

- **Timestamp**: 2026-03-15T14:00:00+09:00
- 21 files generated across specs/reverse-spec/
- 155 source behaviors documented (B001-B155)
- 73 business rules (BL-001 to BL-073)
- ~144 IPC channels mapped
- 13 core entities with full field definitions
- Coverage: 97% IPC, 72% entities, 85% user-facing
