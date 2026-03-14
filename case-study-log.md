# Case Study Observation Log

**Project**: Angdu Studio
**Domain**: app
**Source**: /Users/coolhero/Develop/cherry-studio
**Started**: 2026-03-14

> Append entries chronologically at each milestone.
> Format: `## [YYYY-MM-DD] M{N} — {Milestone Name}`
> See `/case-study` recording protocol for milestone definitions and guidance.

---

## [2026-03-14] M1 — Project Background

**Context**: Before starting `/reverse-spec` analysis on /Users/coolhero/Develop/cherry-studio

### Observations
- Project: Cherry Studio, Tech stack: Electron + React + TypeScript, Scale: large (monorepo with packages), Structure: desktop-app
- What it does: AI-powered desktop chat application supporting multiple LLM providers (OpenAI, Anthropic, Google, Ollama, etc.) with conversation management, knowledge base, agents, MCP support, and plugin system
- Mode: rebuild Cherry Studio → Angdu Studio

### Anticipated Challenges
- Very large codebase with many AI SDK integrations
- Complex Electron IPC architecture (main/renderer/preload)
- Multiple state management approaches (Redux, electron-store)
- Extensive i18n support
- Many third-party UI library integrations (Ant Design, TipTap, CodeMirror, etc.)

---

## [2026-03-14] M2 — Project Scan

**Context**: Phase 1 complete

### Observations
- Tech stack: Electron 40 + React 19 + TypeScript 5.8 + Ant Design 5 + Redux Toolkit
- Scale: ~1,494 source files, 57 main services, 47 renderer services, 150+ IPC channels
- Domain profile: desktop-app (gui interface, async-state + ipc + i18n + external-sdk concerns)
- Framework: Electron with electron-vite build system

---

## [2026-03-14] M1.5 — Runtime Exploration

- **Timestamp**: 2026-03-14T14:45:00
- **Mode**: automated (Playwright CLI, _electron.launch())
- **Screens explored**: 11
- **Visual references captured**: 11 screenshots
- **Key findings**: Dark theme default (#181818), top tab navigation, sidebar+content layout, hash-based routing

---

## [2026-03-14] M3 — Feature Classification

- **Features identified**: 12 (Standard granularity)
- **Tier 1 (Essential)**: 6 (shell, i18n-theme, providers, assistants, chat, settings)
- **Tier 2 (Recommended)**: 3 (knowledge, mcp, notes)
- **Tier 3 (Optional)**: 3 (files, tools, infra)
- **Demo Groups**: 4 (Basic AI Chat, Knowledge-Augmented Chat, Productivity Tools, MCP & External)

---

## [2026-03-14] M4 — Deliverable Generation

- **SBI total**: 397 items (B001–B397) across 12 Features
- **Entities**: 21 documented in entity registry
- **IPC channels**: 432 (100% coverage)
- **Business rules**: 20 extracted
- **Stack migration**: 2 categories changed (UI Library: Ant Design → shadcn/ui, State: Redux → Zustand)
