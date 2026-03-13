# Case Study Observation Log

**Project**: Cherry Studio → Angdu Studio
**Domain**: desktop-app
**Source**: /Users/coolhero/Develop/cherry-studio
**Started**: 2026-03-13

> Append entries chronologically at each milestone.
> Format: `## [YYYY-MM-DD] M{N} — {Milestone Name}`

---

## [2026-03-13] M1 — Project Background

**Context**: Before starting `/reverse-spec` analysis on /Users/coolhero/Develop/cherry-studio

### Observations
- Project: CherryStudio, Tech stack: Electron 40 + React 19 + TypeScript, Scale: large monorepo with packages/
- What it does: AI-powered desktop chat application supporting 20+ LLM providers with conversation management, knowledge base, MCP server integration, and agent system
- Mode: rebuild Cherry Studio → Angdu Studio

### Anticipated Challenges
- Very large codebase (1375 source files, 400+ packages)
- Complex AI provider integration layer with many SDK variants
- Monorepo structure with workspace packages (@cherrystudio/ai-core, etc.)
- Heavy use of Redux Toolkit (23 slices) → migrating to Zustand 5
- 288 IPC channels across main/renderer boundary
- Ant Design 5 (488 imports) → migrating to shadcn/ui + Radix

## [2026-03-13] M1.5 — Runtime Exploration

- **Mode**: automated (Playwright CLI, _electron.launch)
- **Screens explored**: 12
- **Visual references captured**: 12 screenshots
- **Key findings**: Dark-mode Electron app with icon sidebar (10 nav items), custom titlebar, HashRouter with 13 routes. Chat interface has 7 toolbar actions (new topic, file, web search, KB, MCP, @mentions, commands). MCP popup with Disabled/Auto/Manual modes.

## [2026-03-13] M3 — Feature Classification

- **Granularity**: Standard (Module-level) — 12 Features
- **Tiers**: 6 T1 (Essential), 3 T2 (Recommended), 3 T3 (Optional)
- **Release Groups**: 5 (RG-1 foundation → RG-5 chat)
- **Demo Groups**: 4 (Core Chat, Knowledge-Augmented Chat, Config & Sync, Creative Tools)
- **Key decisions**: ai-engine as hub Feature (6+ connections), chat as final RG-5 (most dependencies)
- **Tier acceptance**: User accepted AI recommendation without modifications

## [2026-03-13] M4 — Coverage Baseline

- **Source files**: 1375 total, 100% classified (165 explicit + 1210 by directory)
- **SBI entries**: 351 (B001-B351) across 12 Features
- **IPC channels**: 288, all mapped
- **REST endpoints**: 21, all mapped
- **Entities**: 20, all mapped
- **Business rules**: 58, all mapped
- **Unmapped classification**: All 530 initially unmapped files bulk-assigned to existing Features
- **New Features created**: 0
- **Intentional exclusions**: 0
