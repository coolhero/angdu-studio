# Reverse-Spec 완료 분석 보고서

> 생성: 2026-03-21 | 모드: Rebuild | 소스: Cherry Studio → Angdu Studio

## 1. 프로젝트 프로필

| 항목 | 값 |
|------|-----|
| **원본 프로젝트** | Cherry Studio v1.7.24 |
| **대상 프로젝트** | Angdu Studio |
| **프로젝트 유형** | AI 기반 데스크톱 채팅 애플리케이션 |
| **프레임워크** | Electron 40+ |
| **주 언어** | TypeScript 5.8+ (94% — 1,546 파일) |
| **프로젝트 규모** | Medium (~1,564 파일, ~60 모듈) |
| **Domain Profile** | desktop-app |
| **Archetype** | ai-assistant |
| **Interfaces** | gui |
| **Concerns** | async-state, ipc, llm-agents, persistence, i18n, external-sdk |

## 2. Feature 카탈로그

| ID | Feature | RG | SBI 수 | 설명 |
|----|---------|----|----|------|
| F001 | app-shell | RG-1 | 30 | Electron 부트스트랩, 윈도우, IPC, 설정 영속화, 테마 |
| F002 | navigation | RG-2 | 20 | Navbar, 탭 시스템, 사이드바, 라우팅 |
| F003 | settings | RG-2 | 35 | 설정 페이지, 백업/복원 |
| F004 | model-provider | RG-2 | 35 | 프로바이더/모델 관리, API key, 헬스체크 |
| F005 | chat-conversation | RG-3 | 80 | 채팅 UI, 메시지, 토픽, 어시스턴트, 스트리밍 |
| F006 | knowledge-base | RG-3 | 40 | KB, RAG, 벡터 검색, 리랭킹 |
| F007 | translate | RG-3 | 20 | 번역, OCR |
| F008 | tools-workspace | RG-3 | 60 | Code Tools, Paintings, Notes, Files, MCP, Store |
| F009 | memory | RG-4 | 25 | 시맨틱 메모리, 벡터 검색 |
| F010 | advanced-features | RG-4 | 35 | Selection, Agent, API 서버, 웹 검색 |

## 3. SBI 요약

| 메트릭 | 값 |
|--------|-----|
| **Total SBI** | 380 (B001–B380) |
| **P1 (Core)** | ~160 |
| **P2 (Important)** | ~140 |
| **P3 (Nice-to-have)** | ~80 |
| **Features** | 10 |
| **Release Groups** | 4 |
| **Demo Groups** | 4 |

## 4. 엔티티 & API

| 메트릭 | 값 |
|--------|-----|
| **엔티티** | 20 (Message, Topic, Assistant, Provider, Model, KB, Agent 등) |
| **IPC 채널** | 130+ (14개 도메인) |
| **REST API** | Agent API (Express, /agents/*) |
| **저장소 레이어** | 4 (IndexedDB, SQLite, electron-store, localStorage) |

## 5. 품질 평가

| Phase | 신뢰도 | 비고 |
|-------|--------|------|
| Phase 1 (Scan) | ⭐⭐⭐⭐⭐ | 완전한 기술 스택 감지 |
| Phase 1.5 (Runtime) | ⭐⭐⭐⭐ | 13개 화면 캡처, 일부 interactive flow 제한 |
| Phase 2 (Deep) | ⭐⭐⭐⭐ | 380 SBI 추출, 20 엔티티 |
| Phase 3 (Classify) | ⭐⭐⭐⭐⭐ | 10 Feature 분류, 4 Demo Group |
| Phase 4 (Generate) | ⭐⭐⭐⭐⭐ | 모든 artifact 생성 |

## 6. 스택 마이그레이션 요약

| 변경 | 복잡도 |
|------|--------|
| Ant Design → shadcn/ui + Radix | High |
| Redux Toolkit → Zustand | Medium |
| Dexie/IndexedDB → better-sqlite3 (Main via IPC) | High |
| styled-components → Tailwind CSS 4 | Medium |
| LangChain → Vercel AI SDK only | Medium |
| React Router v6 → v7 | Low |

## 7. 권장 사항

1. **F001 app-shell**을 먼저 구현 — 다른 모든 Feature의 기반
2. **Dexie→SQLite 마이그레이션** 주의 — 렌더러→메인 프로세스 데이터 흐름 아키텍처 변경
3. **F005 chat-conversation**이 가장 큰 Feature (80 SBI) — 점진적 구현 권장
4. **F008 tools-workspace** 범위 재검토 — 필요 시 세분화 가능

## 8. Artifact 인벤토리

### Global Artifacts
| 파일 | 경로 |
|------|------|
| 로드맵 | `specs/_global/roadmap.md` |
| 엔티티 레지스트리 | `specs/_global/entity-registry.md` |
| API 레지스트리 | `specs/_global/api-registry.md` |
| 비즈니스 로직 맵 | `specs/_global/business-logic-map.md` |
| 헌법 시드 | `specs/_global/constitution-seed.md` |
| 스택 마이그레이션 | `specs/_global/stack-migration.md` |
| 커버리지 기준선 | `specs/_global/coverage-baseline.md` |
| 런타임 탐색 결과 | `specs/_global/runtime-exploration.md` |
| 마이크로 인터랙션 | `specs/_global/micro-interactions.md` |
| 비주얼 레퍼런스 | `specs/_global/visual-references/` (13 screenshots) |
| 스타일 토큰 | `specs/_global/visual-references/style-tokens.md` |
| 완료 보고서 | `specs/_global/completion-report.md` |
| speckit-prompt | `specs/_global/speckit-prompt.md` |
| SDD 상태 | `specs/_global/sdd-state.md` |

### Per-Feature Artifacts
| Feature | pre-context.md | spec-draft.md |
|---------|---------------|---------------|
| F001 app-shell | ✅ | ✅ |
| F002 navigation | ✅ | ✅ |
| F003 settings | ✅ | ✅ |
| F004 model-provider | ✅ | ✅ |
| F005 chat-conversation | ✅ | ✅ |
| F006 knowledge-base | ✅ | ✅ |
| F007 translate | ✅ | ✅ |
| F008 tools-workspace | ✅ | ✅ |
| F009 memory | ✅ | ✅ |
| F010 advanced-features | ✅ | ✅ |

### Other
| 파일 | 경로 |
|------|------|
| Decision History | `specs/history.md` |
| .env.example | `.env.example` |
