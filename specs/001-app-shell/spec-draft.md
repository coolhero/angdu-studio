# App Shell — Spec Draft

> `/reverse-spec` Phase 4에서 자동 생성. `/speckit.specify`의 시드 입력으로 사용.

## Feature 설명

Electron 앱의 부트스트랩, BrowserWindow 생성, IPC 브리지 초기화, better-sqlite3 기반 설정 영속화(get/set), 테마 전환(dark/light/system), 시스템 트레이, 자동 업데이트, 윈도우 관리를 담당하는 기반 셸 Feature이다.

## 기능 요구사항 (Functional Requirements)

### 앱 초기화 및 윈도우 관리
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-001 | 앱 시작 시 단일 인스턴스 락을 획득하여 중복 실행을 방지한다 | — (시스템) | B028 |
| FR-002 | 앱 데이터 디렉토리를 초기화하고, 필요한 서브 디렉토리를 생성한다 | — (시스템) | B029 |
| FR-003 | BrowserWindow를 생성하고, 이전 세션의 위치/크기를 복원한다 | Window | B014 |
| FR-004 | 플랫폼별 titleBar 설정을 적용한다 (macOS: hiddenInset, Win/Linux: frameless) | TitleBar | B014 |
| FR-005 | 미니 윈도우(550×400)를 생성할 수 있다 | Window | B015 |
| FR-006 | 메인 윈도우를 표시하거나 참조를 반환한다 | — (API) | B016 |

### 설정 영속화 (Config)
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-007 | better-sqlite3 기반 ConfigManager로 키-값 설정을 읽는다 (기본값 반환 지원) | — (API) | B001 |
| FR-008 | 설정값을 저장하고 구독자에게 변경을 알린다 | — (API) | B002 |
| FR-009 | 특정 설정 키의 변경을 구독하고 해제할 수 있다 | — (API) | B003 |
| FR-010 | 언어 설정을 읽고 쓸 수 있다 (기본: 시스템 로캘) | — (API) | B004 |
| FR-011 | 줌 팩터를 읽고 쓸 수 있다 (기본: 1.0) | — (API) | B006 |

### 테마 시스템
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-012 | 테마 모드(dark/light/system)를 읽고 쓸 수 있다 | — (API) | B005, B017 |
| FR-013 | 테마 변경 시 nativeTheme.themeSource를 업데이트하고 ConfigManager에 저장한다 | — (시스템) | B018 |
| FR-014 | nativeTheme 변경 시 모든 윈도우의 titleBarOverlay를 갱신하고 IPC로 renderer에 알린다 | — (시스템) | B019 |

### 시스템 트레이
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-015 | 플랫폼별 트레이 아이콘을 생성한다 (macOS: 템플릿 이미지, Win/Linux: 일반) | TrayIcon | B020 |
| FR-016 | 트레이 컨텍스트 메뉴를 구성한다 (Show / Quick Assistant / Quit) | ContextMenu | B021 |
| FR-017 | 닫기 시 트레이로 이동 설정(trayOnClose)을 지원한다 | — (설정) | B009 |

### 자동 업데이트
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-018 | autoUpdater를 초기화하고 feedUrl을 설정한다 | — (시스템) | B022 |
| FR-019 | 앱 시작 시 업데이트를 확인하고 다운로드한다 | Notification | B023 |

### IPC 브리지
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-020 | 모든 IPC 채널 핸들러를 일괄 등록한다 | — (시스템) | B030 |
| FR-021 | preload 스크립트에서 contextBridge로 허용된 API만 노출한다 | — (시스템) | B027 |

### 기타 시스템 서비스
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-022 | 시작 시 실행(Launch on Boot) 등록을 플랫폼별로 처리한다 | — (시스템) | B024 |
| FR-023 | 프록시 설정(HTTP/SOCKS, bypass 규칙)을 적용한다 | — (설정) | B025 |
| FR-024 | 시스템 전원 이벤트를 감지하고 셧다운 핸들러를 실행한다 | — (시스템) | B026 |

## 성공 기준 (Success Criteria)

### Happy Path
| ID | 시나리오 | 조건 | 기대 결과 |
|----|---------|------|----------|
| SC-001 | 앱 정상 기동 | 앱을 최초 실행한다 | bootstrap → config 로드 → mainWindow 표시 → IPC 등록 → tray 생성 순서로 완료 |
| SC-002 | 설정 읽기/쓰기 | renderer에서 config:get/set IPC 호출 | 값이 better-sqlite3에 저장되고, 재시작 후에도 유지된다 |
| SC-003 | 테마 전환 | dark/light/system 테마를 변경한다 | nativeTheme 즉시 반영, titleBarOverlay 색상 갱신, renderer에 IPC 전달 |
| SC-004 | 트레이 동작 | 트레이 아이콘 클릭 | mainWindow가 표시된다 |
| SC-005 | 윈도우 상태 복원 | 앱 재시작 | 이전 세션의 윈도우 위치/크기가 복원된다 |
| SC-006 | 줌 팩터 변경 | Ctrl+/- 입력 | 줌 팩터가 적용되고 ConfigManager에 저장된다 |

### Error Paths
| ID | 시나리오 | 조건 | 기대 결과 |
|----|---------|------|----------|
| SC-E01 | 중복 실행 차단 | 앱이 이미 실행 중일 때 재실행 | 새 인스턴스 종료, 기존 윈도우 focus |
| SC-E02 | 설정 DB 손상 | better-sqlite3 파일이 손상됨 | 기본값으로 폴백, 에러 로깅 |
| SC-E03 | 업데이트 실패 | feedUrl 접속 불가 | 자동 업데이트 건너뛰기, 에러를 무시하고 앱 정상 동작 |

### Cross-Feature
| ID | 시나리오 | 조건 | 기대 결과 |
|----|---------|------|----------|
| SC-X01 | F002 네비게이션 상태 영속화 | F002에서 config:set으로 탭 상태 저장 | 재시작 후 config:get으로 탭 상태 복원 |
| SC-X02 | F003 테마 변경 | F003 DisplaySettings에서 테마 변경 IPC 전송 | ThemeService가 처리하고 모든 윈도우에 반영 |
| SC-X03 | F004 API Key 암호화 | F004에서 safeStorage IPC 호출 | main process에서 암호화/복호화 처리 |
