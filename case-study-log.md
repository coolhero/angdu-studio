# Case Study Observation Log

**Project**: Angdu Studio
**Domain**: app
**Source**: /Users/coolhero/Develop/cherry-studio
**Started**: 2026-03-08

> Append entries chronologically at each milestone.
> Format: `## [YYYY-MM-DD] M{N} — {Milestone Name}`
> See `/case-study` recording protocol for milestone definitions and guidance.

---

## [2026-03-08] M1 — Project Background

**Context**: Before starting `/reverse-spec` analysis on cherry-studio

### Observations
- Project: Cherry Studio → Angdu Studio, Tech stack: Electron + React + TypeScript, Scale: large Electron app, Structure: multi-process (main/renderer/preload)
- What it does: AI-powered desktop chat application supporting 50+ LLM providers with conversation management, knowledge bases, MCP tools, agents, image generation, translation, and notes
- Mode: rebuild Cherry Studio → Angdu Studio (Redux→Zustand, AntD→shadcn/ui)

### Anticipated Challenges
- Large codebase with many interconnected features (12 Features extracted)
- State management migration (Redux Toolkit → Zustand) across ~25 slices
- UI library migration (Ant Design → shadcn/ui) affecting all components
- Dual database architecture (SQLite + Dexie) adds complexity

---

## [2026-03-08] M5 — Constitution Finalized

**Context**: Pipeline Phase 0 — Constitution finalized as v1.0.0

### Observations
- 8 core principles established from constitution-seed
- User added i18n constraint: Korean (default) + English only
- Constitution accepted with minimal modifications (one addition)
- Scope: core (Tier 1 only — 4 Features: F001, F002, F003, F005)
