# Angdu Studio — Spec-Kit Usage Prompt

> `/reverse-spec` Phase 4에서 자동 생성. 각 `/speckit.*` 명령 실행 시 시드 컨텍스트로 사용.

## Project Metadata

| 항목 | 값 |
|------|-----|
| **PROJECT_NAME** | Angdu Studio |
| **ORIGINAL_SOURCE_PATH** | /Users/coolhero/Develop/cherry-studio |
| **SCOPE** | full |
| **STACK_STRATEGY** | new |
| **FEATURE_COUNT** | 10 |
| **DETECTED_STACK** | TypeScript 5.8+, Electron 40+, React 19, electron-vite |
| **RG_COUNT** | 4 |

---

## Artifact Map

| Artifact | 경로 | 생성 단계 |
|----------|------|----------|
| roadmap.md | `specs/_global/roadmap.md` | reverse-spec Phase 3 |
| entity-registry.md | `specs/_global/entity-registry.md` | reverse-spec Phase 3 |
| api-registry.md | `specs/_global/api-registry.md` | reverse-spec Phase 3 |
| business-logic-map.md | `specs/_global/business-logic-map.md` | reverse-spec Phase 3 |
| stack-migration.md | `specs/_global/stack-migration.md` | reverse-spec Phase 3 |
| constitution-seed.md | `specs/_global/constitution-seed.md` | reverse-spec Phase 3 |
| micro-interactions.md | `specs/_global/micro-interactions.md` | reverse-spec Phase 4 |
| speckit-prompt.md | `specs/_global/speckit-prompt.md` | reverse-spec Phase 4 |
| pre-context.md (×10) | `specs/{NNN-feature}/pre-context.md` | reverse-spec Phase 3 |
| spec-draft.md (×10) | `specs/{NNN-feature}/spec-draft.md` | reverse-spec Phase 4 |
| sdd-state.md | `specs/_global/sdd-state.md` | smart-sdd |
| visual-references/ | `specs/_global/visual-references/` | reverse-spec Phase 2 |

---

## Per-Command Context Guide

### `/speckit.specify` — Feature 명세 생성

**입력 컨텍스트 (반드시 주입)**:
1. `specs/{NNN-feature}/pre-context.md` — 소스 분석 결과
2. `specs/{NNN-feature}/spec-draft.md` — FR/SC 초안
3. `specs/_global/entity-registry.md` — 엔티티 정의/소비 관계
4. `specs/_global/api-registry.md` — IPC/API 채널 의존성
5. `specs/_global/constitution-seed.md` — 아키텍처 원칙
6. `specs/_global/stack-migration.md` — 스택 변경 매핑

**참조 컨텍스트 (필요시)**:
- `specs/_global/roadmap.md` — Feature Catalog, 의존성 그래프
- `specs/_global/business-logic-map.md` — 비즈니스 로직 흐름
- `specs/_global/micro-interactions.md` — 인터랙션 패턴

**출력**: `specs/{NNN-feature}/spec.md`

---

### `/speckit.plan` — Feature 구현 계획 생성

**입력 컨텍스트 (반드시 주입)**:
1. `specs/{NNN-feature}/spec.md` — 확정된 명세
2. `specs/{NNN-feature}/pre-context.md` — 소스 구조 참조
3. `specs/_global/constitution-seed.md` — 아키텍처 제약

**참조 컨텍스트 (필요시)**:
- `specs/_global/roadmap.md` — 의존성 순서
- `specs/_global/entity-registry.md` — 엔티티 소유권
- `specs/_global/api-registry.md` — API 계약
- 선행 Feature의 `spec.md` (의존성이 있는 경우)

**출력**: `specs/{NNN-feature}/plan.md`

---

### `/speckit.implement` — Feature 구현

**입력 컨텍스트 (반드시 주입)**:
1. `specs/{NNN-feature}/plan.md` — 구현 계획
2. `specs/{NNN-feature}/spec.md` — 확정된 명세
3. `specs/_global/constitution-seed.md` — 아키텍처 원칙

**참조 컨텍스트 (필요시)**:
- `specs/{NNN-feature}/pre-context.md` — 소스 로직 참조
- `specs/_global/stack-migration.md` — 스택 변환 패턴
- 선행 Feature의 구현 코드 (의존성이 있는 경우)

**출력**: 구현 코드 파일들

---

### `/speckit.verify` — Feature 검증

**입력 컨텍스트 (반드시 주입)**:
1. `specs/{NNN-feature}/spec.md` — 검증 기준 (SC)
2. `specs/{NNN-feature}/plan.md` — Verify Method, Interaction Chains
3. 구현 코드 파일들

**참조 컨텍스트 (필요시)**:
- `specs/_global/micro-interactions.md` — 인터랙션 검증
- `specs/_global/visual-references/` — UI 스크린샷 비교

**출력**: 검증 결과 보고서

---

## Cross-Feature Awareness Rules

### 1. 엔티티 소유권 규칙
- 엔티티는 **정의 Feature**에서만 스키마를 정의한다
- **소비 Feature**는 정의 Feature의 export를 import하여 사용한다
- `entity-registry.md`의 "정의 Feature" 열을 반드시 확인한다

### 2. IPC 채널 규칙
- IPC 채널은 **제공 Feature**에서 핸들러를 구현한다
- **소비 Feature**는 preload API를 통해 호출한다
- `api-registry.md`의 채널 매핑을 반드시 확인한다

### 3. 의존성 방향 규칙
- Feature 간 의존성은 `roadmap.md`의 Dependency Graph를 따른다
- 순환 의존성은 금지한다
- 의존하는 Feature의 계약(Contract)만 사용한다

### 4. 스택 변환 규칙
- Cherry Studio 코드를 직접 복사하지 않는다
- `stack-migration.md`의 매핑 테이블에 따라 새 스택으로 재구현한다
- Ant Design → shadcn/ui, Redux → Zustand, styled-components → Tailwind CSS 4

### 5. Cross-Feature 테스트 규칙
- 각 Feature의 SC-X## (Cross-Feature) 시나리오를 verify에서 반드시 검증한다
- 선행 Feature가 구현되지 않은 경우, mock/stub으로 대체한다

---

## Feature Catalog

| ID | Feature | 설명 | 의존성 |
|----|---------|------|--------|
| F001 | app-shell | Electron 부트스트랩, BrowserWindow, IPC 브릿지, config 영속화, 테마 | — |
| F002 | navigation | Navbar (top/left), 탭 시스템, 사이드바 아이콘, HashRouter 라우팅 | F001 |
| F003 | settings | 설정 페이지 (일반/표시/데이터/단축키), 백업/복원 | F001, F002 |
| F004 | model-provider | 프로바이더 CRUD, API key 관리, 모델 관리, 헬스체크 | F001 |
| F005 | chat-conversation | 채팅 UI, 메시지, 토픽, 어시스턴트, 스트리밍, InputBar | F002, F004 |
| F006 | knowledge-base | KB CRUD, RAG 문서 수집, 벡터 검색, 리랭킹 | F004 |
| F007 | translate | 번역 UI, 언어 감지, OCR 연동 | F004 |
| F008 | tools-workspace | Code tools, Paintings, Notes, Files, MCP 서버, Store | F004 |
| F009 | memory | 시맨틱 메모리 저장소, 자동 추출, 메모리 검색 | F005, F006 |
| F010 | advanced-features | Selection assistant, Agent (Claude Code), API 서버, 웹 검색 | F004, F005 |

---

## Release Groups

| RG | Features | 마일스톤 |
|----|----------|---------|
| RG-1 | F001 | Electron 앱 기동, IPC config, 테마 |
| RG-2 | F002, F003, F004 | 네비게이션, 설정, 프로바이더/모델 |
| RG-3 | F005, F006, F007, F008 | 채팅, KB RAG, 번역, 도구 |
| RG-4 | F009, F010 | 시맨틱 메모리, 고급 기능 |
