# Advanced Features — Spec Draft

> `/reverse-spec` Phase 4에서 자동 생성. `/speckit.specify`의 시드 입력으로 사용.

## Feature 설명

고급/확장 기능을 묶은 Feature로, Selection Assistant(네이티브 텍스트 선택 → 플로팅 툴바 → AI 액션), Agent System(Claude Code 통합 자율 에이전트), API Server(Express HTTP API), Web Search(다중 프로바이더 웹 검색 통합)을 포함한다.

## 기능 요구사항 (Functional Requirements)

### Selection Assistant
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-001 | selection-hook 네이티브 모듈로 텍스트 선택 이벤트를 감지한다 (Win/Mac) | — (Native) | B346, B347 |
| FR-002 | BrowserWindow로 선택 위치에 플로팅 툴바를 표시한다 (스크린 경계 인식) | FloatingToolbar | B348, B353 |
| FR-003 | 프리로드된 BrowserWindow 풀에서 액션 윈도우를 재사용한다 | Window | B349 |
| FR-004 | 액션 윈도우에서 선택 텍스트 + 액션 프롬프트로 LLM을 호출한다 | ActionWindow | B354 |
| FR-005 | 트리거 모드(Selected/Ctrlkey/Shortcut) 3가지를 지원한다 | Select | B350 |
| FR-006 | 필터 모드(default/whitelist/blacklist)로 앱별 활성화를 제어한다 | Select, List | B351, B352 |
| FR-007 | 선택 도우미 설정(트리거, 액션 목록, 필터)을 관리한다 | Switch, Select, List | B355 |

### Agent System
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-008 | 에이전트를 CRUD(생성/조회/수정/삭제)한다 | Form, Button | B356 |
| FR-009 | 에이전트 실행 세션을 생성/조회/종료한다 | Button, List | B357 |
| FR-010 | 세션 내 메시지를 저장/조회한다 | List | B358 |
| FR-011 | Claude Code CLI를 연동하고 도구 권한을 관리한다 | — (Service) | B359 |
| FR-012 | Drizzle ORM으로 에이전트/세션/메시지 테이블을 관리한다 (마이그레이션 포함) | — (DB) | B360 |
| FR-013 | 플러그인 훅 시스템으로 기능을 확장한다 (메모리 주입 등) | — (Plugin) | B361 |

### API Server
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-014 | Express 기반 HTTP API 서버를 시작한다 (포트, 호스트, 타임아웃 설정) | Button | B363 |
| FR-015 | HTTP 서버를 중지/재시작한다 | Button | B364, B365 |
| FR-016 | 에이전트/채팅/모델 API 엔드포인트를 제공한다 | — (Route) | B367 |
| FR-017 | 인증, 로깅, 에러 핸들링 미들웨어를 적용한다 | — (Middleware) | B368 |

### Web Search
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-018 | 웹 검색 프로바이더(Bing/Google 등)를 팩토리 패턴으로 생성한다 | — (Service) | B370, B371 |
| FR-019 | 웹 검색을 실행하고 결과를 KB에 임시 저장 후 참조한다 | — (Service) | B369 |
| FR-020 | 웹 검색 결과를 AI Tool로 채팅 컨텍스트에 주입한다 | — (AI Tool) | B373 |
| FR-021 | 웹 검색 일반 설정(문서 수, 활성화)을 관리한다 | Switch, NumberInput | B372 |
| FR-022 | 프로바이더별 API 키와 활성화를 설정한다 | TextInput, Switch | B372 |
| FR-023 | 채팅 입력바에 웹 검색 토글 버튼을 제공한다 | ToggleButton | B373 |
| FR-024 | 검색 결과를 메시지에 표시한다 | ResultCard | B369 |

## 성공 기준 (Success Criteria)

### Happy Path
| ID | 시나리오 | 조건 | 기대 결과 |
|----|---------|------|----------|
| SC-001 | 선택 도우미 번역 | 외부 앱에서 텍스트 선택 → 툴바의 번역 아이콘 클릭 | 액션 윈도우에서 LLM 번역 결과 표시 |
| SC-002 | 웹 검색 + 채팅 | 웹 검색 ON → 질문 전송 | 웹 검색 실행 → 결과 컨텍스트 주입 → AI 응답에 검색 결과 반영 |
| SC-003 | API 서버 기동 | Settings에서 포트 설정 → 시작 버튼 | HTTP 서버 시작, 상태 "running" 표시 |
| SC-004 | 에이전트 세션 | 에이전트 생성 → 실행 | 세션 생성 → Claude Code CLI 호출 → 도구 실행 → 결과 반환 |
| SC-005 | 트리거 모드 변경 | Selected → Shortcut 변경 | 텍스트 선택만으로는 툴바 미표시, 단축키 입력 시에만 표시 |

### Error Paths
| ID | 시나리오 | 조건 | 기대 결과 |
|----|---------|------|----------|
| SC-E01 | 선택 도우미 미지원 | Linux 환경 | 선택 도우미 기능 비활성화, 설정에서 안내 |
| SC-E02 | 웹 검색 API 실패 | 잘못된 검색 API 키 | 에러 메시지 표시, 검색 없이 일반 응답 |
| SC-E03 | API 서버 포트 충돌 | 이미 사용 중인 포트 | 시작 실패, 포트 변경 안내 |
| SC-E04 | Claude Code CLI 없음 | CLI 미설치 | 에이전트 실행 실패, 설치 안내 |

### Cross-Feature
| ID | 시나리오 | 조건 | 기대 결과 |
|----|---------|------|----------|
| SC-X01 | F005 웹 검색 도구 | 채팅에서 웹 검색 활성화 | WebSearchTool이 F005 AI Tool 시스템에 주입 |
| SC-X02 | F007 선택 도우미 번역 | 선택 도우미에서 번역 액션 | F007의 translateText API 호출 |
| SC-X03 | F006 웹 검색 결과 저장 | 웹 검색 실행 | F006의 KB 벡터 DB에 임시 저장 |
| SC-X04 | F004 모델 선택 | 에이전트/선택 도우미 모델 | F004의 활성 모델 목록에서 선택 |
