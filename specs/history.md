# Decision History

> Auto-generated during `/reverse-spec` and `/smart-sdd` execution.
> Records key strategic and architectural decisions with rationale.

## Project Context

| | Details |
|---|---------|
| **Mode** | Rebuild |
| **Original** | Cherry Studio (`/Users/coolhero/Develop/cherry-studio`) |
| **Target** | Angdu Studio (`/Users/coolhero/Develop/angdu-studio`) |
| **Stack** | New Stack |
| **Identity** | Cherry Studio → Angdu Studio (Cherry → Angdu) |
| **What it does** | AI 기반 데스크톱 채팅 애플리케이션으로 다수의 LLM 프로바이더를 지원하며, 대화 관리, 지식 베이스, 플러그인 시스템을 제공 |

---

## [2026-03-21] /reverse-spec — Project Setup

### Strategy Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | full | — |
| Stack | new | — |
| Project Identity | Cherry Studio → Angdu Studio | — |

### Per-Category Stack Choices (New Stack)

| Category | Original | Chosen | Reason |
|----------|----------|--------|--------|
| Language | TypeScript 5.8 | TypeScript 5.8+ (유지) | 이미 최신, strict mode 사용 중 |
| Framework | Electron 40 | Electron 40+ (유지) | React 생태계 호환, 성숙한 API |
| Build Tool | electron-vite 5 | electron-vite (유지) | — |
| UI Library | Ant Design + styled-components | shadcn/ui + Radix | 경량화, Tailwind 단일화 |
| State Management | Redux Toolkit + redux-persist | Zustand + persist | 간결한 API, boilerplate 감소 |
| Routing | React Router v6 | react-router-dom v7 | 최신 버전 |
| Rich Text Editor | TipTap 3.2 | TipTap (유지) | — |
| Database (Renderer) | Dexie (IndexedDB) | better-sqlite3 (Main via IPC) | 단일 DB 레이어, LevelDB lock 해소 |
| Database (Main) | better-sqlite3 + Drizzle | better-sqlite3 + Drizzle (유지) | — |
| AI SDK | Vercel AI SDK + LangChain | Vercel AI SDK v4+ (LangChain 제거) | 의존성 단순화 |
| Styling | Tailwind + styled-components + Ant Design | Tailwind CSS 4 (단일화) | 스타일링 레이어 통합 |
| Testing | Vitest + Playwright | Vitest + Playwright (유지) | — |
| Linting | Biome | Biome (유지) | — |

### Architecture Decisions

| Decision | Choice | Details |
|----------|--------|---------|
| Feature Granularity | Standard (Module-level) | 10 Features |
| Demo Groups | 4 groups defined | DG-01 AI 채팅 대화, DG-02 RAG 대화, DG-03 설정/데이터, DG-04 도구/고급 |
| Tier Adjustments | N/A | Full scope — all Features implemented |
| Archetype | ai-assistant | Streaming-First, Model Agnosticism, Token Awareness detected |
