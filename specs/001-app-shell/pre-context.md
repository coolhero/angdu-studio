# F001 — App Shell Pre-Context

> **모드**: Rebuild, New Stack
> **소스 루트**: `/Users/coolhero/Develop/cherry-studio`

---

## 1. 요약 (Brief Summary)

Electron 앱의 부트스트랩, 메인 프로세스 초기화, BrowserWindow 생성, IPC 브리지, 설정 영속화(electron-store), 테마 서비스(dark/light/system), 윈도우 관리(메인/미니), 앱 생명주기(시작 시 실행, 트레이, 자동 업데이트), 프록시, 전원 모니터, 줌, 캐시 관리를 담당하는 기반 셸 Feature이다.

---

## 2. 런타임 탐색 결과 (Runtime Exploration Results)

| 항목 | 관찰 결과 |
|------|----------|
| 테마 기본값 | light (body.class="light") |
| Navbar 높이 | 44px (--navbar-height) |
| Primary 색상 | #00b96b (--color-primary) |
| 폰트 | system font stack (Ubuntu, -apple-system, BlinkMacSystemFont, Segoe UI, ...) |
| Border radius | .625rem (--radius) |
| 라우팅 | Hash routing (#/route) |
| 창 최소 크기 | MIN_WINDOW_WIDTH × MIN_WINDOW_HEIGHT |
| Crash Reporter | CherryHQ / CherryStudio, uploadToServer: false |
| Single Instance Lock | app.requestSingleInstanceLock() 사용 |
| Hardware Acceleration | ConfigManager 설정에 따라 비활성화 가능 |

---

## 3. 소스 참조 (Source Reference)

| File Path | Role | Rebuild Target |
|-----------|------|----------------|
| src/main/index.ts | 메인 프로세스 엔트리, app 생명주기 관리 | TBD |
| src/main/bootstrap.ts | 앱 데이터 디렉토리 초기화, 점유 디렉토리 복사 | TBD |
| src/main/ipc.ts | 모든 IPC 핸들러 등록 | TBD |
| src/preload/index.ts | preload 스크립트, contextBridge API 노출 | TBD |
| src/main/services/ConfigManager.ts | electron-store 기반 설정 영속화 (get/set/subscribe) | TBD |
| src/main/services/WindowService.ts | BrowserWindow 생성·관리 (메인/미니 윈도우) | TBD |
| src/main/services/AppService.ts | 시작 시 실행, 앱 정보 제공 | TBD |
| src/main/services/ThemeService.ts | 테마 모드 관리 (dark/light/system), nativeTheme 연동 | TBD |
| src/main/services/TrayService.ts | 시스템 트레이 아이콘·메뉴 관리 | TBD |
| src/main/services/AppUpdater.ts | 자동 업데이트 (electron-updater) | TBD |
| src/main/services/ProxyManager.ts | 프록시 설정·적용 (HTTP/SOCKS, bypass 규칙) | TBD |
| src/main/services/PowerMonitorService.ts | 시스템 전원 이벤트 감지, 종료 핸들러 등록 | TBD |
| src/main/config.ts | titleBarOverlay 색상 설정 | TBD |
| src/main/constant.ts | 플랫폼 상수 (isMac, isWin, isLinux, isDev) | TBD |

---

## 4. 소스 행위 목록 (Source Behavior Inventory)

| ID | Source File | Function/Method | Behavior Description | Priority | Origin |
|----|------------|-----------------|---------------------|----------|--------|
| B001 | ConfigManager.ts | get() | electron-store에서 키로 설정값 읽기, 기본값 반환 | P0 | source |
| B002 | ConfigManager.ts | set() / setAndNotify() | 설정값 저장 및 구독자 알림 | P0 | source |
| B003 | ConfigManager.ts | subscribe() / unsubscribe() | 특정 설정 키 변경 구독·해제 | P1 | source |
| B004 | ConfigManager.ts | getLanguage() / setLanguage() | 언어 설정 읽기·쓰기 (기본: 시스템 로캘 또는 defaultLanguage) | P1 | source |
| B005 | ConfigManager.ts | getTheme() / setTheme() | 테마 모드 읽기·쓰기 (dark/light/system) | P0 | source |
| B006 | ConfigManager.ts | getZoomFactor() / setZoomFactor() | 줌 팩터 읽기·쓰기 (기본: 1) | P1 | source |
| B007 | ConfigManager.ts | getLaunchToTray() / setLaunchToTray() | 트레이로 시작 설정 | P2 | source |
| B008 | ConfigManager.ts | getTray() / setTray() | 트레이 표시 여부 | P1 | source |
| B009 | ConfigManager.ts | getTrayOnClose() / setTrayOnClose() | 닫기 시 트레이로 이동 설정 | P2 | source |
| B010 | ConfigManager.ts | getAutoUpdate() / setAutoUpdate() | 자동 업데이트 설정 | P1 | source |
| B011 | ConfigManager.ts | getShortcuts() / setShortcuts() | 단축키 설정 읽기·쓰기 | P1 | source |
| B012 | ConfigManager.ts | getDisableHardwareAcceleration() | 하드웨어 가속 비활성화 여부 | P2 | source |
| B013 | ConfigManager.ts | getProxy() 계열 | 프록시 설정 읽기 | P1 | source |
| B014 | WindowService.ts | createMainWindow() | BrowserWindow 생성 (상태 복원, 플랫폼별 titleBar 설정) | P0 | source |
| B015 | WindowService.ts | createMiniWindow() | 미니 윈도우 생성 (550×400 기본) | P2 | source |
| B016 | WindowService.ts | showMainWindow() / getMainWindow() | 메인 윈도우 표시·참조 반환 | P0 | source |
| B017 | ThemeService.ts | constructor() | 저장된 테마 적용, nativeTheme.themeSource 설정 | P0 | source |
| B018 | ThemeService.ts | setTheme() | 테마 변경 → nativeTheme 업데이트 → ConfigManager 저장 | P0 | source |
| B019 | ThemeService.ts | themeUpdatadHandler() | nativeTheme 변경 시 모든 윈도우에 titleBarOverlay 갱신 + IPC 전송 | P0 | source |
| B020 | TrayService.ts | createTray() | 플랫폼별 트레이 아이콘 생성 (Mac 템플릿 이미지, Windows/Linux 일반) | P1 | source |
| B021 | TrayService.ts | updateContextMenu() | 트레이 컨텍스트 메뉴 구성 (Show/Quick Assistant/Quit) | P1 | source |
| B022 | AppUpdater.ts | constructor() | autoUpdater 초기화 (feedUrl, 자동 다운로드 설정) | P1 | source |
| B023 | AppUpdater.ts | checkForUpdate() | 업데이트 확인 및 다운로드 | P1 | source |
| B024 | AppService.ts | setAppLaunchOnBoot() | 시작 시 실행 등록 (플랫폼별: Win/Mac loginItem, Linux .desktop 파일) | P2 | source |
| B025 | ProxyManager.ts | setProxy() / resolveProxy() | 프록시 설정 적용 (HTTP/SOCKS), bypass 규칙 파싱 | P1 | source |
| B026 | PowerMonitorService.ts | init() / registerShutdownHandler() | 시스템 종료 감지, 셧다운 핸들러 등록·실행 | P2 | source |
| B027 | index.ts | app.whenReady() | 앱 초기화 시퀀스 (윈도우 생성, 트레이, IPC 등록, 확장 설치) | P0 | source |
| B028 | index.ts | app.requestSingleInstanceLock() | 단일 인스턴스 보장 | P0 | source |
| B029 | bootstrap.ts | initAppDataDir() | 앱 데이터 디렉토리 초기화 (패키지 모드) | P1 | source |
| B030 | ipc.ts | registerIpc() | 모든 IPC 채널 핸들러 일괄 등록 | P0 | source |

---

## 5. UI 컴포넌트 기능 (UI Component Features)

| 컴포넌트 | 기능 설명 |
|---------|----------|
| WindowControls | Windows/Linux 용 커스텀 창 컨트롤 (최소화, 최대화, 닫기) |
| TitleBar | macOS hidden titleBar + trafficLightPosition, Win/Linux frameless |
| TrayIcon | 시스템 트레이 아이콘 (플랫폼별 이미지 분기) |
| TrayContextMenu | 트레이 우클릭 메뉴 (Show, Quick Assistant, Quit) |
| UpdateNotification | 업데이트 가용 시 알림 표시 |

---

## 6. 인터랙션 행위 목록 (Interaction Behavior Inventory)

| 인터랙션 | 트리거 | 결과 |
|---------|--------|------|
| 앱 시작 | 사용자가 앱 실행 | bootstrap → config 로드 → mainWindow 생성 → IPC 등록 → tray 생성 |
| 테마 전환 | Settings에서 테마 변경 | IPC → ThemeService.setTheme() → nativeTheme 변경 → 모든 윈도우 알림 |
| 트레이 클릭 | 트레이 아이콘 클릭 | mainWindow 표시 또는 Quick Assistant 토글 |
| 트레이 우클릭 | 트레이 아이콘 우클릭 | 컨텍스트 메뉴 표시 |
| 창 닫기 | 닫기 버튼 클릭 | trayOnClose 설정에 따라 트레이로 이동 또는 앱 종료 |
| 줌 변경 | Ctrl+/- 또는 설정 | zoomFactor 적용 → ConfigManager 저장 |
| 자동 업데이트 | 앱 시작 시 | autoUpdater가 feedUrl에서 업데이트 확인 → 다운로드 → 설치 |
| 프록시 설정 | Settings에서 프록시 설정 | ProxyManager에 적용 → session.setProxy() |

---

## 7. 컴포넌트 트리 (Component Tree)

```
[Main Process]
├── bootstrap.ts (앱 데이터 초기화)
├── index.ts (엔트리 포인트)
│   ├── ConfigManager (electron-store)
│   ├── WindowService
│   │   ├── MainWindow (BrowserWindow)
│   │   └── MiniWindow (BrowserWindow)
│   ├── ThemeService (nativeTheme 연동)
│   ├── TrayService (시스템 트레이)
│   ├── AppUpdater (electron-updater)
│   ├── ProxyManager (프록시)
│   ├── PowerMonitorService (전원 감시)
│   └── AppService (시작 시 실행 등)
├── ipc.ts (IPC 핸들러 등록)
└── preload/index.ts (contextBridge)

[Renderer Process]
└── App.tsx
    ├── Provider (Redux)
    ├── ThemeProvider
    ├── AntdProvider
    ├── NotificationProvider
    ├── CodeStyleProvider
    ├── PersistGate
    └── Router
```

---

## 8. 데이터 생명주기 패턴 (Data Lifecycle Patterns)

| 데이터 | 저장소 | 생성 시점 | 읽기 시점 | 갱신 시점 | 삭제 시점 |
|--------|--------|----------|----------|----------|----------|
| AppConfig | electron-store (JSON) | 최초 실행 시 기본값 | 앱 시작, 설정 화면 진입 | 사용자 설정 변경 시 | N/A (덮어쓰기) |
| Theme | electron-store + nativeTheme | 최초 실행 (system) | 앱 시작, 테마 전환 | setTheme() 호출 | N/A |
| WindowState | electron-window-state | 윈도우 생성 | 다음 실행 시 복원 | 윈도우 이동/리사이즈 | N/A |
| ProxyConfig | electron-store | 사용자 설정 | 앱 시작, API 호출 시 | 설정 변경 | N/A |
| ZoomFactor | electron-store | 최초 실행 (1.0) | 앱 시작 | Ctrl+/-로 변경 | N/A |

---

## 9. 네이밍 리매핑 (Naming Remapping: Cherry → Angdu)

| 위치 | Cherry 원본 | Angdu 대상 |
|------|------------|-----------|
| package.json | cherry-studio | angdu-studio |
| crashReporter | CherryStudio (productName) | AngduStudio |
| crashReporter | CherryHQ (companyName) | AngduStudio |
| app.setAppUserModelId | com.kangfenmao.CherryStudio | TBD (angdu 번들 ID) |
| Linux commandLine | class=CherryStudio, name=CherryStudio | class=AngduStudio, name=AngduStudio |
| AppService.ts | cherry-studio.desktop / cherry-studio-dev.desktop | angdu-studio.desktop / angdu-studio-dev.desktop |
| AppService.ts | Name=Cherry Studio | Name=Angdu Studio |
| TrayService.ts | setToolTip('Cherry Studio') | setToolTip('Angdu Studio') |
| ConfigKeys | CHERRY_STUDIO_PROTOCOL | ANGDU_STUDIO_PROTOCOL |
| userData path | CherryStudio | AngduStudio |

---

## 10. 정적 리소스 (Static Resources)

| 리소스 | 경로 | 용도 |
|--------|------|------|
| App Icon | build/icon.png | 앱 아이콘 (Windows/Linux 타이틀바) |
| Tray Icon | build/tray_icon.png | 트레이 아이콘 (기본) |
| Tray Icon Dark | build/tray_icon_dark.png | 트레이 아이콘 (macOS 라이트 모드) |
| Tray Icon Light | build/tray_icon_light.png | 트레이 아이콘 (macOS 다크 모드) |
| TitleBar Overlay | config.ts | titleBarOverlayDark / titleBarOverlayLight 색상 값 |

---

## 11. 환경 변수 (Environment Variables)

| 변수명 | 용도 | 기본값 |
|--------|------|--------|
| NODE_OPTIONS | Node.js 옵션 (예: --max-old-space-size) | 없음 |
| CSLOGGER_MAIN_LEVEL | 메인 프로세스 로그 레벨 | 없음 |
| VITE_MAIN_BUNDLE_ID | 앱 번들 ID | com.kangfenmao.CherryStudio |
| APPIMAGE | Linux AppImage 경로 (시작 시 실행용) | 없음 |
| XDG_SESSION_TYPE | Linux 세션 타입 (wayland 감지) | 없음 |

---

## 12. Feature 계약 (Feature Contracts)

### 제공하는 계약 (Exports)

| 계약 ID | 타입 | 설명 | 소비자 |
|---------|------|------|--------|
| config:get | IPC | 설정값 읽기 | F002, F003, F004, F005 |
| config:set | IPC | 설정값 쓰기 | F003 |
| theme:get | IPC | 현재 테마 조회 | F003 |
| theme:set | IPC | 테마 변경 | F003 |
| window:minimize/maximize/close | IPC | 윈도우 제어 | 모든 Feature |
| app:info | IPC | 앱 버전, 경로 등 정보 | F003 |
| proxy:set | IPC | 프록시 설정 적용 | F003, F004 |
| zoom:set | IPC | 줌 팩터 변경 | F003 |
| cache:clear | IPC | 캐시 삭제 | F003 |

### 의존하는 계약 (Imports)

없음 (최하위 기반 Feature)

---

## 13. /speckit.specify 참고사항

- ConfigManager는 electron-store에서 better-sqlite3 기반으로 교체 예정 (New Stack)
- IPC 채널 정의는 @shared/IpcChannel에서 enum으로 관리 → 그대로 유지
- ThemeService는 nativeTheme 연동이 핵심, renderer에서 CSS 변수 동기화 필요
- 윈도우 상태 복원은 electron-window-state → 자체 구현 또는 유지 결정 필요
- ProxyManager는 undici, fetch-socks, proxy-agent 등 다수 의존 → 범위 축소 검토
- AppUpdater의 UpdateMirror/FeedUrl 체계는 Angdu 자체 인프라로 교체 필요

---

## 14. /speckit.plan 참고사항

- F001은 모든 Feature의 기반이므로 가장 먼저 구현
- ConfigManager → IPC bridge → WindowService → ThemeService 순서로 진행
- TrayService, AppUpdater, ProxyManager는 후순위 가능
- 테스트: 앱 시작 → 메인 윈도우 표시 → 설정 읽기/쓰기 → 테마 전환 순으로 검증
- 미니 윈도우는 Quick Assistant 기능에 의존 → F001 범위에서 기본 생성만 구현

---

## 15. /speckit.analyze 참고사항

- electron-store → better-sqlite3 마이그레이션 전략: 기존 JSON 설정 파일에서 자동 마이그레이션 불필요 (clean rebuild)
- CherryIN OAuth, AnalyticsService, ReduxService 등은 F001 범위 밖 (Cherry 고유 서비스)
- ipc.ts는 300줄 이상의 거대 파일 → Feature별로 IPC 핸들러 분리 권장
- preload의 API 표면이 매우 넓음 → F001에서는 config, theme, window, app 관련만 포함
- CHERRY_STUDIO_PROTOCOL (deep link)은 Angdu 프로토콜로 교체 필요
