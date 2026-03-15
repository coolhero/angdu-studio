# Case Study Observation Log

**Project**: Cherry Studio
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
- Project: Cherry Studio, Tech stack: Electron + TypeScript + React, Scale: TBD, Structure: monorepo (pnpm workspace)
- What it does: AI-powered desktop chat application supporting multiple LLM providers with conversation management and extensible features
- Mode: rebuild Cherry Studio → Angdu Studio

### Anticipated Challenges
- Large Electron desktop app with complex IPC patterns
- Multiple LLM provider integrations requiring careful abstraction
- pnpm monorepo with multiple packages

---

## [2026-03-15] M5 — Constitution Finalized

**Context**: After constitution finalization (v1.0.0)

### Observations
- Constitution version: 1.0.0, Key principles: SSoT, Explicit Over Implicit, Composition Over Inheritance, IPC Bridge Isolation, Streaming-First Pipeline
- Archetype principles adopted: A1-01 Streaming-First Rendering, A1-02 Model Agnosticism, A1-03 Offline Resilience, A1-04 Token Awareness, A1-05 Prompt Versioning
- Framework philosophy adopted: F7-01 Process Crash Isolation, F7-02 Memory Budget Discipline, F7-03 Native Feel, F7-04 Secure by Default, F7-05 Auto-Update as First-Class

### Key Decisions
- Accepted as-is

---

## [2026-03-15] M6 — Feature F001-app-shell

**Context**: After F001 app-shell pipeline completion (specify → plan → tasks → analyze → implement → verify)

### Observations
- What it delivers: Electron desktop app shell — window management, typed IPC bridge (33 channels), config persistence, system tray, auto-update, deep links, global shortcuts
- Spec: 22 FRs, 10 SCs, 8 user stories, 40/40 SBI mapped
- Plan: 9 singleton services, 8 IPC handler modules, 7 implementation phases
- Tasks: 54 tasks across 13 phases
- Implementation: 30+ source files, TypeScript clean, electron-vite build passes
- Verify: Runtime verified via Playwright _electron.launch() — SC-001/002/007/008/010 all pass

### Challenges
- better-sqlite3 native build incompatible with Electron 40 + macOS 12 Clang 14 (SKF-019) → switched to electron-store
- electron-store v11 ESM-only import required CJS interop fix in bundled output
- Playwright evaluate() triggers Electron anti-self-XSS DevTools warning (SKF-020)

### Key Decisions
- Config persistence: electron-store instead of better-sqlite3 (native build issue, deferred to F005)
- Window: Platform-aware frameless (macOS hiddenInset, Windows/Linux frame:false)
- IPC: 25 invoke + 8 event channels with Zod validation at boundaries
