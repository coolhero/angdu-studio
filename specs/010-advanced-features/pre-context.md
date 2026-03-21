# F010 — advanced-features Pre-Context

> **모드**: Rebuild, New Stack
> **소스 루트**: `/Users/coolhero/Develop/cherry-studio` (상대 경로 사용)

---

## 1. Brief Summary

고급/확장 기능을 묶은 Feature로, 6개 하위 기능을 포함한다:

1. **Selection Assistant** — 네이티브 텍스트 선택 감지 → 플로팅 툴바 표시 → 액션 윈도우(번역, 요약, 질문 등) 실행
2. **Agent System** — Claude Code 통합 기반 자율 에이전트. 세션 관리, 도구 권한, Drizzle ORM DB
3. **API Server** — Express 기반 HTTP API 서버. 에이전트/채팅 엔드포인트, OpenAPI 호환
4. **Web Search** — Bing/Google 등 다수 웹 검색 프로바이더 통합. RAG 문서 수 설정, KB 연동
5. **LAN Transfer** — Bonjour(mDNS) 기반 로컬 네트워크 디바이스 검색 및 데이터 전송
6. **OpenClaw** — OpenClaw 게이트웨이 통합. Node.js 기반 프록시 서버, 프로바이더 관리

---

## 2. Runtime Exploration Results

| 하위 기능 | 관찰 결과 |
|----------|----------|
| Selection Assistant | 텍스트 선택 시 플로팅 툴바 표시, 클릭 시 액션 윈도우 열림 (번역, 요약 등) |
| Agent System | 에이전트 목록, 세션 관리, 도구 권한 설정, 실행 로그 |
| API Server | 설정에서 포트/호스트 지정, 시작/중지, 상태 표시 |
| Web Search | 검색 프로바이더 설정, API 키 입력, 문서 수 설정 |
| LAN Transfer | 네트워크 스캔, 디바이스 목록, 전송 상태 |
| OpenClaw | 게이트웨이 상태(stopped/starting/running/error), 포트 설정, 채널 관리 |

---

## 3. Source Reference

| File Path | Role | Rebuild Target |
|-----------|------|---------------|
| `src/main/services/SelectionService.ts` | 선택 감지 서비스 (selection-hook 네이티브 모듈) | TBD |
| `src/main/configs/SelectionConfig.ts` | 선택 필터 설정 (블랙리스트, 미세 조정) | TBD |
| `src/renderer/src/windows/selection/toolbar/SelectionToolbar.tsx` | 플로팅 툴바 UI | TBD |
| `src/renderer/src/windows/selection/action/SelectionActionApp.tsx` | 액션 윈도우 앱 | TBD |
| `src/renderer/src/windows/selection/action/components/ActionTranslate.tsx` | 번역 액션 | TBD |
| `src/renderer/src/hooks/useSelectionAssistant.ts` | 선택 도우미 훅 | TBD |
| `src/renderer/src/store/selectionStore.ts` | 선택 상태 관리 | TBD |
| `src/renderer/src/types/selectionTypes.d.ts` | 선택 타입 정의 | TBD |
| `src/renderer/src/pages/settings/SelectionAssistantSettings/SelectionAssistantSettings.tsx` | 선택 도우미 설정 | TBD |
| `src/renderer/src/pages/settings/SelectionAssistantSettings/components/SelectionActionsList.tsx` | 액션 목록 설정 | TBD |
| `src/renderer/src/pages/settings/SelectionAssistantSettings/components/SelectionActionSearchModal.tsx` | 액션 검색 모달 | TBD |
| `src/renderer/src/pages/settings/SelectionAssistantSettings/components/SelectionActionUserModal.tsx` | 사용자 액션 모달 | TBD |
| `src/renderer/src/pages/settings/SelectionAssistantSettings/components/SelectionFilterListModal.tsx` | 필터 목록 모달 | TBD |
| `src/renderer/selectionAction.html` | 액션 윈도우 HTML | TBD |
| `src/renderer/selectionToolbar.html` | 툴바 윈도우 HTML | TBD |
| `src/renderer/src/assets/styles/selection-toolbar.css` | 툴바 스타일 | TBD |
| `src/main/services/agents/services/AgentService.ts` | 에이전트 CRUD 서비스 | TBD |
| `src/main/services/agents/services/SessionService.ts` | 세션 관리 서비스 | TBD |
| `src/main/services/agents/services/SessionMessageService.ts` | 세션 메시지 서비스 | TBD |
| `src/main/services/agents/services/claudecode/` | Claude Code 통합 | TBD |
| `src/main/services/agents/BaseService.ts` | 에이전트 베이스 서비스 | TBD |
| `src/main/services/agents/database/` | Drizzle ORM 스키마/마이그레이션 | TBD |
| `src/main/services/agents/interfaces/` | 에이전트 인터페이스 정의 | TBD |
| `src/main/services/agents/plugins/` | 에이전트 플러그인 | TBD |
| `src/main/services/agents/errors.ts` | 에이전트 에러 타입 | TBD |
| `src/main/services/agents/index.ts` | 에이전트 모듈 인덱스 | TBD |
| `src/main/apiServer/server.ts` | API 서버 (HTTP, Express) | TBD |
| `src/main/apiServer/app.ts` | Express 앱 설정 | TBD |
| `src/main/apiServer/config.ts` | 서버 설정 (포트, 호스트) | TBD |
| `src/main/apiServer/config/` | 서버 설정 디렉토리 | TBD |
| `src/main/apiServer/routes/` | API 라우트 | TBD |
| `src/main/apiServer/middleware/` | 미들웨어 | TBD |
| `src/main/apiServer/services/` | API 서비스 레이어 | TBD |
| `src/main/apiServer/generated/` | 생성된 코드 (OpenAPI 등) | TBD |
| `src/main/apiServer/utils/` | API 유틸리티 | TBD |
| `src/renderer/src/services/WebSearchService.ts` | 웹 검색 서비스 | TBD |
| `src/renderer/src/providers/WebSearchProvider/BaseWebSearchProvider.ts` | 웹 검색 프로바이더 베이스 | TBD |
| `src/renderer/src/providers/WebSearchProvider/WebSearchProviderFactory.ts` | 웹 검색 프로바이더 팩토리 | TBD |
| `src/renderer/src/config/webSearchProviders.ts` | 웹 검색 프로바이더 설정 | TBD |
| `src/renderer/src/hooks/useWebSearchProviders.ts` | 웹 검색 프로바이더 훅 | TBD |
| `src/renderer/src/pages/settings/WebSearchSettings/WebSearchGeneralSettings.tsx` | 웹 검색 일반 설정 | TBD |
| `src/renderer/src/pages/settings/WebSearchSettings/WebSearchProviderSettings.tsx` | 웹 검색 프로바이더 설정 | TBD |
| `src/renderer/src/pages/settings/WebSearchSettings/WebSearchProviderSetting.tsx` | 개별 프로바이더 설정 | TBD |
| `src/renderer/src/aiCore/tools/WebSearchTool.ts` | AI Tool — 웹 검색 | TBD |
| `src/renderer/src/pages/home/Inputbar/tools/webSearchTool.tsx` | 입력바 웹 검색 도구 | TBD |
| `src/renderer/src/pages/home/Inputbar/tools/components/WebSearchButton.tsx` | 웹 검색 버튼 | TBD |
| `src/renderer/src/pages/home/Inputbar/tools/components/WebSearchQuickPanelManager.tsx` | 웹 검색 퀵 패널 | TBD |
| `src/renderer/src/pages/home/Messages/Tools/MessageWebSearch.tsx` | 웹 검색 결과 표시 | TBD |
| `src/main/services/LocalTransferService.ts` | LAN 전송 서비스 (Bonjour/mDNS) | TBD |
| `src/renderer/src/components/Popups/LanTransferPopup/` | LAN 전송 팝업 UI | TBD |
| `src/main/services/lanTransfer/LanTransferClientService.ts` | LAN 전송 클라이언트 | TBD |
| `src/main/services/OpenClawService.ts` | OpenClaw 게이트웨이 서비스 | TBD |
| `src/renderer/src/pages/openclaw/OpenClawPage.tsx` | OpenClaw 관리 페이지 | TBD |

---

## 4. Source Behavior Inventory

| ID | Source File | Function/Method | Behavior | Priority | Origin |
|----|------------|-----------------|----------|----------|--------|
| B346 | `SelectionService.ts` | `constructor` | 싱글톤, selection-hook 네이티브 모듈 로드 (Win/Mac) | P0 | Source |
| B347 | `SelectionService.ts` | 텍스트 선택 감지 | selection-hook으로 텍스트 선택 이벤트 감지 | P0 | Source |
| B348 | `SelectionService.ts` | 플로팅 툴바 표시 | BrowserWindow로 선택 위치에 툴바 표시 (스크린 경계 인식) | P0 | Source |
| B349 | `SelectionService.ts` | 액션 윈도우 생성 | 프리로드된 BrowserWindow 풀에서 액션 윈도우 재사용 | P1 | Source |
| B350 | `SelectionService.ts` | 트리거 모드 | Selected/Ctrlkey/Shortcut 3가지 트리거 모드 | P1 | Source |
| B351 | `SelectionService.ts` | 필터 모드 | default/whitelist/blacklist 필터로 앱별 활성화 제어 | P1 | Source |
| B352 | `SelectionConfig.ts` | 필터 설정 | 블랙리스트(SELECTION_PREDEFINED_BLACKLIST) + 미세 조정 목록 | P2 | Source |
| B353 | `SelectionToolbar.tsx` | 툴바 UI | 액션 아이콘 목록, 클릭 시 액션 윈도우 열기 | P0 | Source |
| B354 | `SelectionActionApp.tsx` | 액션 윈도우 | 선택된 텍스트 + 선택된 액션으로 LLM 호출 | P0 | Source |
| B355 | `selectionStore.ts` | 선택 상태 | 선택 도우미 활성화 상태, 액션 목록, 트리거 모드 | P0 | Source |
| B356 | `AgentService.ts` | 에이전트 CRUD | 에이전트 생성/조회/수정/삭제 | P1 | Source |
| B357 | `SessionService.ts` | 세션 관리 | 에이전트 실행 세션 생성/조회/종료 | P1 | Source |
| B358 | `SessionMessageService.ts` | 세션 메시지 | 세션 내 메시지 저장/조회 | P1 | Source |
| B359 | `agents/services/claudecode/` | Claude Code 통합 | Claude Code CLI 연동, 도구 권한 관리 | P1 | Source |
| B360 | `agents/database/` | Drizzle ORM DB | 에이전트/세션/메시지 테이블 스키마 + 마이그레이션 | P1 | Source |
| B361 | `agents/plugins/` | 에이전트 플러그인 | 플러그인 훅 시스템 (메모리 주입 등) | P2 | Source |
| B362 | `agents/errors.ts` | 에러 타입 | AgentModelValidationError 등 도메인 에러 | P2 | Source |
| B363 | `apiServer/server.ts` | `ApiServer.start` | HTTP 서버 시작 (포트, 호스트 설정, 타임아웃) | P1 | Source |
| B364 | `apiServer/server.ts` | `ApiServer.stop` | HTTP 서버 중지 | P1 | Source |
| B365 | `apiServer/server.ts` | `ApiServer.restart` | 서버 재시작 | P2 | Source |
| B366 | `apiServer/app.ts` | Express 앱 | 라우트 등록, 미들웨어 설정 | P1 | Source |
| B367 | `apiServer/routes/` | API 라우트 | 에이전트, 채팅, 모델 엔드포인트 | P1 | Source |
| B368 | `apiServer/middleware/` | 미들웨어 | 인증, 로깅, 에러 핸들링 | P2 | Source |
| B369 | `WebSearchService.ts` | 웹 검색 실행 | 웹 검색 프로바이더 호출 → 결과 수집 → KB에 임시 저장 → 참조 | P0 | Source |
| B370 | `WebSearchProviderFactory.ts` | 프로바이더 팩토리 | Bing/Google 등 프로바이더 인스턴스 생성 | P0 | Source |
| B371 | `BaseWebSearchProvider.ts` | 프로바이더 베이스 | 웹 검색 프로바이더 추상 클래스 | P0 | Source |
| B372 | `webSearchProviders.ts` | 프로바이더 설정 | 지원 검색 프로바이더 목록 및 설정 | P0 | Source |
| B373 | `WebSearchTool.ts` | AI Tool | 채팅에서 웹 검색 결과를 AI Tool로 주입 | P0 | Source |
| B374 | `WebSearchService.ts` | 요청 상태 관리 | requestStates Map으로 동시 검색 요청 추적 | P1 | Source |
| B375 | `LocalTransferService.ts` | `startDiscovery` | Bonjour mDNS로 로컬 네트워크 디바이스 스캔 시작 | P2 | Source |
| B376 | `LocalTransferService.ts` | `stopDiscovery` | 네트워크 스캔 중지 | P2 | Source |
| B377 | `LocalTransferService.ts` | `getState` | 현재 스캔 상태 + 발견된 디바이스 목록 반환 | P2 | Source |
| B378 | `OpenClawService.ts` | 게이트웨이 시작/중지 | OpenClaw 프록시 서버 프로세스 관리 | P2 | Source |
| B379 | `OpenClawService.ts` | 상태 관리 | GatewayStatus (stopped/starting/running/error) 추적 | P2 | Source |
| B380 | `OpenClawService.ts` | 채널 관리 | 프로바이더 채널 연결/해제 관리 | P2 | Source |

---

## 5. UI Component Features

### Selection Assistant
| 컴포넌트 | 기능 설명 |
|----------|----------|
| SelectionToolbar | 텍스트 선택 시 표시되는 플로팅 액션 바 |
| SelectionActionApp | 액션 실행 윈도우 — LLM 응답 표시 |
| SelectionAssistantSettings | 설정 — 트리거 모드, 액션 목록, 필터 |
| SelectionActionsList | 사용 가능한 액션 목록 관리 |

### Agent System
| 컴포넌트 | 기능 설명 |
|----------|----------|
| (API 위주) | 에이전트 CRUD, 세션 관리는 주로 API 서버 연동 |

### Web Search
| 컴포넌트 | 기능 설명 |
|----------|----------|
| WebSearchGeneralSettings | 웹 검색 일반 설정 |
| WebSearchProviderSettings | 프로바이더별 API 키, 활성화 |
| WebSearchButton | 채팅 입력바 웹 검색 토글 |
| WebSearchQuickPanelManager | 퀵 검색 패널 |
| MessageWebSearch | 검색 결과 메시지 표시 |

### LAN Transfer
| 컴포넌트 | 기능 설명 |
|----------|----------|
| LanTransferPopup | 디바이스 목록, 전송 상태 팝업 |

### OpenClaw
| 컴포넌트 | 기능 설명 |
|----------|----------|
| OpenClawPage | 게이트웨이 상태, 포트 설정, 채널 관리 |

---

## 6. Interaction Behavior Inventory

| 사용자 동작 | 시스템 응답 |
|------------|-----------|
| 텍스트 선택 (외부 앱) | selection-hook 감지 → 플로팅 툴바 표시 |
| 툴바 액션 클릭 | 액션 윈도우 열기 → 선택 텍스트 + 액션 프롬프트로 LLM 호출 |
| 선택 도우미 설정 변경 | 트리거 모드/필터 즉시 적용 |
| 채팅에서 웹 검색 활성화 | 메시지 전송 시 웹 검색 → 결과를 컨텍스트에 주입 |
| 웹 검색 프로바이더 설정 | API 키 입력, 활성화 토글 |
| API 서버 시작 | 지정 포트에서 HTTP 서버 시작, 상태 표시 |
| LAN 전송: 스캔 시작 | Bonjour mDNS로 디바이스 검색, 목록 표시 |
| OpenClaw: 게이트웨이 시작 | Node.js 프록시 서버 프로세스 실행 |
| 에이전트 생성 | Drizzle DB에 에이전트 레코드 저장 |
| 에이전트 실행 | 세션 생성 → Claude Code CLI 호출 → 도구 실행 |

---

## 7. Component Tree

```
[Selection Assistant]
SelectionService (Main Process)
├── selection-hook (네이티브 모듈)
├── SelectionToolbar (BrowserWindow)
│   └── 액션 아이콘 × N
└── ActionWindow (BrowserWindow, 프리로드 풀)
    └── SelectionActionApp
        ├── ActionTranslate
        └── (기타 액션)

Settings
└── SelectionAssistantSettings
    ├── 트리거 모드 (Selected/Ctrlkey/Shortcut)
    ├── SelectionActionsList
    └── SelectionFilterListModal

[Agent System]
AgentService (Main Process)
├── SessionService
│   └── SessionMessageService
├── claudecode/ (Claude Code 통합)
└── plugins/ (플러그인)

[API Server]
ApiServer (Main Process)
├── Express App
│   ├── Routes
│   ├── Middleware
│   └── Services
└── Config (port, host)

[Web Search]
WebSearchService (Renderer)
├── WebSearchProviderFactory
│   └── BaseWebSearchProvider 구현체 × N
├── WebSearchTool (AI Tool)
└── Settings
    ├── WebSearchGeneralSettings
    └── WebSearchProviderSettings

[LAN Transfer]
LocalTransferService (Main Process)
├── Bonjour (mDNS)
└── LanTransferPopup (Renderer)

[OpenClaw]
OpenClawService (Main Process)
├── 게이트웨이 프로세스
└── OpenClawPage (Renderer)
```

---

## 8. Data Lifecycle Patterns

| 데이터 | 생성 계기 | 저장소 | 갱신 시점 | 삭제 시점 |
|--------|---------|--------|---------|---------|
| 선택 상태 | 텍스트 선택 이벤트 | selectionStore (메모리) | 새 선택 시 | 선택 해제 시 |
| 액션 목록 | 설정에서 구성 | store (persist) | 설정 변경 시 | 리셋 시 |
| Agent | opt-in: 사용자 생성 | Drizzle ORM (SQLite) | 설정 수정 시 | 사용자 삭제 |
| Session | auto: 에이전트 실행 시 | Drizzle ORM (SQLite) | 메시지 추가 시 | 에이전트 삭제 시 또는 수동 |
| API 서버 설정 | 사용자 구성 | 설정 파일 | 설정 변경 시 | — |
| 웹 검색 프로바이더 | 설정에서 구성 | store (persist) | API 키/설정 변경 시 | — |
| 웹 검색 결과 | 검색 실행 시 | 임시 KB (벡터 DB) | — | 세션 종료 시 |
| LAN 디바이스 | 네트워크 스캔 시 | services Map (메모리) | 스캔 갱신 시 | 스캔 중지 시 |
| OpenClaw 설정 | 사용자 구성 | JSON 파일 (openclaw.cherry.json) | 설정 변경 시 | — |

---

## 9. Naming Remapping

| 소스 이름 | Angdu 이름 | 사유 |
|----------|-----------|------|
| `selection-hook` | 유지 | 네이티브 npm 모듈 |
| `cherrystudio` (Bonjour 서비스 타입) | `angdustudio` | 프로젝트 리브랜딩 |
| `openclaw.cherry.json` | `openclaw.angdu.json` | 프로젝트 리브랜딩 |
| Redux 기반 상태 | Zustand stores | 상태 관리 전환 |
| `styled-components` | Tailwind CSS 4 | 스타일링 전환 |

---

## 10. Static Resources

| 리소스 | 경로 | 용도 |
|--------|------|------|
| selection-toolbar.css | `src/renderer/src/assets/styles/selection-toolbar.css` | 플로팅 툴바 스타일 |
| selectionAction.html | `src/renderer/selectionAction.html` | 액션 윈도우 HTML |
| selectionToolbar.html | `src/renderer/selectionToolbar.html` | 툴바 윈도우 HTML |
| WebSearchIcon | `src/renderer/src/components/Icons/WebSearchIcon.tsx` | 웹 검색 아이콘 |

---

## 11. Environment Variables

| 변수 | 용도 | 기본값 |
|------|------|--------|
| `OPENCLAW_CONFIG_PATH` | OpenClaw 설정 파일 경로 | `~/.openclaw/openclaw.cherry.json` |
| API 서버 port | API 서버 리스닝 포트 | 설정 파일에서 로드 |
| API 서버 host | API 서버 바인딩 호스트 | 설정 파일에서 로드 |

---

## 12. Feature Contracts

### 의존하는 Feature
| Feature | 계약 | 용도 |
|---------|------|------|
| F001 (app-shell) | BrowserWindow, IPC, 프로세스 관리 | 선택 툴바/액션 윈도우, API 서버, OpenClaw 프로세스 |
| F004 (model-provider) | LLM API | 선택 도우미 LLM 호출, 에이전트 모델 |
| F005 (chat-conversation) | AI Tool 시스템 | WebSearchTool 주입 |
| F006 (knowledge-base) | KB 벡터 DB | 웹 검색 결과 임시 저장 |
| F007 (translate) | translateText | 선택 도우미 번역 액션 |

### 제공하는 계약
| 계약 | 소비자 | 설명 |
|------|--------|------|
| WebSearchTool | F005 (chat) | 채팅에서 웹 검색 결과 주입 |
| API 엔드포인트 | 외부 클라이언트 | HTTP API로 에이전트/채팅 접근 |
| 선택 도우미 | 시스템 전역 | OS 레벨 텍스트 선택 감지 |

---

## 13. For /speckit.specify

- Selection Assistant: selection-hook 네이티브 모듈 (Win/Mac 전용). Linux 미지원
- 플로팅 툴바: BrowserWindow 기반, 스크린 경계 인식 위치 계산, PRELOAD_ACTION_WINDOW_COUNT=1
- 트리거 모드: Selected(선택 즉시), Ctrlkey(Ctrl 키 조합), Shortcut(단축키)
- Agent System: Drizzle ORM + better-sqlite3, 마이그레이션 지원
- API Server: Express, GLOBAL_REQUEST_TIMEOUT_MS=5분, keepAlive=60초
- Web Search: 프로바이더 팩토리 패턴, KB 벡터 DB에 임시 저장 후 검색
- LAN Transfer: Bonjour/mDNS 기반, SERVICE_TYPE='cherrystudio', TCP
- OpenClaw: Node.js 기반 프록시 서버, sudo-prompt으로 권한 상승 가능

---

## 14. For /speckit.plan

- Phase 1: Web Search — 프로바이더 팩토리 + 설정 UI + AI Tool
- Phase 2: Selection Assistant — selection-hook 통합, 플로팅 툴바, 액션 윈도우
- Phase 3: API Server — Express 설정, 기본 라우트, 미들웨어
- Phase 4: Agent System — Drizzle 스키마, 에이전트 CRUD, 세션 관리
- Phase 5: LAN Transfer — Bonjour 서비스 검색, 전송 UI
- Phase 6: OpenClaw — 게이트웨이 프로세스 관리, 채널 설정
- 우선순위: Web Search > Selection > API Server > Agent > LAN > OpenClaw

---

## 15. For /speckit.analyze

- 플랫폼 제한: selection-hook은 Win/Mac 전용. Linux에서는 대체 구현 또는 기능 비활성화
- 네이티브 모듈: selection-hook, bonjour-service — Electron rebuild 필요
- 보안: API 서버 인증 메커니즘 필수. 현재 미들웨어에서 처리
- 성능: 웹 검색 결과를 KB에 임시 저장 → 검색 완료 후 정리 필요
- OpenClaw: Node.js 프로세스 관리 + sudo 권한 → 보안/안정성 리스크
- Agent System: Claude Code CLI 의존 → CLI 버전 호환성 관리 필요
- LAN Transfer: Bonjour 네트워크 환경 의존 → 기업 네트워크에서 차단 가능
- 웹 검색 프로바이더: API 키 비용 + 요청 제한. 프로바이더별 에러 핸들링
