# F003 — Settings Pre-Context

> **모드**: Rebuild, New Stack
> **소스 루트**: `/Users/coolhero/Develop/cherry-studio`

---

## 1. 요약 (Brief Summary)

앱 설정 페이지 전체를 담당하는 Feature이다. General, Display, Data, Shortcuts, About, Quick Assistant, Selection Assistant, Quick Phrases, Document Processing 등 다수의 서브 페이지를 포함한다. 백업/복원(로컬, WebDAV, S3), 단축키 관리, 디스플레이 설정, 데이터 관리 기능을 제공한다. UI 컨트롤 밀도가 매우 높은 Feature로, 각 서브 페이지에 다수의 스위치, 셀렉트, 인풋이 밀집되어 있다.

---

## 2. 런타임 탐색 결과 (Runtime Exploration Results)

| 항목 | 관찰 결과 |
|------|----------|
| Settings 사이드바 메뉴 | Model Provider, Default Model, General, Display, Data, MCP Servers, Web Search, Memories, API Server, Document Processing, Quick Phrases, Keyboard Shortcuts, Quick Assistant |
| Settings 패널 너비 | 250px (--settings-width) |
| 라우트 | /settings/* (중첩 라우트) |
| UI 라이브러리 | Ant Design (Switch, Select, Input, Divider) + styled-components |
| 언어 설정 | 다국어 지원 (i18next), 기본 시스템 로캘 |
| 프록시 설정 | 모드 선택 (System/Manual/None) + URL + bypass 규칙 |

---

## 3. 소스 참조 (Source Reference)

| File Path | Role | Rebuild Target |
|-----------|------|----------------|
| src/renderer/src/pages/settings/SettingsPage.tsx | 설정 메인 레이아웃 (사이드바 + 라우트) | TBD |
| src/renderer/src/pages/settings/index.tsx | 공용 설정 UI 컴포넌트 (SettingContainer, SettingGroup, SettingRow 등) | TBD |
| src/renderer/src/pages/settings/GeneralSettings.tsx | 일반 설정 (언어, 시작, 트레이, 프록시, 데이터 수집, 맞춤법) | TBD |
| src/renderer/src/pages/settings/DisplaySettings/DisplaySettings.tsx | 디스플레이 설정 (테마, 폰트, 메시지 스타일, navbar 위치) | TBD |
| src/renderer/src/pages/settings/DisplaySettings/SidebarIconsManager.tsx | 사이드바 아이콘 표시/순서 관리 | TBD |
| src/renderer/src/pages/settings/DataSettings/DataSettings.tsx | 데이터 설정 메인 (내보내기/가져오기/초기화) | TBD |
| src/renderer/src/pages/settings/DataSettings/LocalBackupSettings.tsx | 로컬 백업 설정 | TBD |
| src/renderer/src/pages/settings/DataSettings/WebDavSettings.tsx | WebDAV 백업 설정 | TBD |
| src/renderer/src/pages/settings/DataSettings/S3Settings.tsx | S3 백업 설정 | TBD |
| src/renderer/src/pages/settings/ShortcutSettings.tsx | 단축키 설정 | TBD |
| src/renderer/src/pages/settings/AboutSettings.tsx | 앱 정보 (버전, 라이선스, 링크) | TBD |
| src/renderer/src/pages/settings/QuickAssistantSettings.tsx | Quick Assistant 설정 | TBD |
| src/renderer/src/pages/settings/SelectionAssistantSettings/ | Selection Assistant 설정 | TBD |
| src/renderer/src/pages/settings/QuickPhraseSettings.tsx | 빠른 문구 관리 | TBD |
| src/renderer/src/pages/settings/DocProcessSettings.tsx | 문서 처리 설정 | TBD |
| src/renderer/src/pages/settings/SettingGroup.tsx | 설정 그룹 공용 컴포넌트 | TBD |
| src/main/services/BackupManager.ts | 백업/복원 로직 (main process) | TBD |
| src/main/services/WebDav.ts | WebDAV 클라이언트 (main process) | TBD |
| src/main/services/S3Storage.ts | S3 스토리지 (main process) | TBD |
| src/renderer/src/store/settings.ts | 설정 상태 (Redux slice) | TBD |
| src/renderer/src/store/shortcuts.ts | 단축키 상태 | TBD |
| src/renderer/src/store/backup.ts | 백업 상태 | TBD |
| src/renderer/src/i18n/ | 다국어 리소스 | TBD |

---

## 4. 소스 행위 목록 (Source Behavior Inventory)

| ID | Source File | Function/Method | Behavior Description | Priority | Origin |
|----|------------|-----------------|---------------------|----------|--------|
| B051 | SettingsPage.tsx | SettingsPage() | 설정 사이드바 메뉴 렌더링 + 중첩 라우트 (Link + Routes) | P0 | source |
| B052 | GeneralSettings.tsx | 언어 변경 | setLanguage() → i18n.changeLanguage() + config 저장 | P0 | source |
| B053 | GeneralSettings.tsx | 시작 시 실행 설정 | setLaunch() → IPC → AppService.setAppLaunchOnBoot() | P1 | source |
| B054 | GeneralSettings.tsx | 트레이 설정 | setTray() → ConfigManager, 연쇄적으로 trayOnClose/launchToTray 갱신 | P1 | source |
| B055 | GeneralSettings.tsx | 프록시 설정 | proxyMode/proxyUrl/bypassRules → IPC → ProxyManager | P1 | source |
| B056 | GeneralSettings.tsx | 데이터 수집 설정 | enableDataCollection on/off | P2 | source |
| B057 | GeneralSettings.tsx | 맞춤법 검사 설정 | enableSpellCheck + spellCheckLanguages 선택 | P2 | source |
| B058 | GeneralSettings.tsx | 하드웨어 가속 비활성화 | disableHardwareAcceleration → 재시작 필요 | P2 | source |
| B059 | GeneralSettings.tsx | 개발자 모드 | enableDeveloperMode 토글 | P2 | source |
| B060 | DisplaySettings.tsx | 테마 변경 | theme 선택 (dark/light/system) → IPC → ThemeService | P0 | source |
| B061 | DisplaySettings.tsx | 폰트 크기/패밀리 | fontSize, fontFamily 설정 | P1 | source |
| B062 | DisplaySettings.tsx | 메시지 스타일 | messageStyle 설정 (bubble/plain) | P1 | source |
| B063 | DisplaySettings.tsx | Navbar 위치 | navbarPosition (top/left) 전환 | P0 | source |
| B064 | DisplaySettings.tsx | 토픽 위치 | topicPosition (left/right) 설정 | P1 | source |
| B065 | SidebarIconsManager.tsx | 아이콘 관리 | 사이드바 표시 아이콘 선택/순서 변경 | P1 | source |
| B066 | DataSettings.tsx | 데이터 내보내기 | 앱 데이터 JSON/ZIP 내보내기 | P1 | source |
| B067 | DataSettings.tsx | 데이터 가져오기 | JSON/ZIP 파일에서 데이터 복원 | P1 | source |
| B068 | DataSettings.tsx | 데이터 초기화 | 모든 데이터 삭제 + 앱 재시작 | P2 | source |
| B069 | LocalBackupSettings.tsx | 로컬 백업 생성 | 앱 데이터를 로컬 파일로 백업 | P1 | source |
| B070 | LocalBackupSettings.tsx | 로컬 백업 복원 | 로컬 백업 파일에서 복원 | P1 | source |
| B071 | WebDavSettings.tsx | WebDAV 연결 | WebDAV 서버 URL/인증 설정 → 연결 테스트 | P2 | source |
| B072 | WebDavSettings.tsx | WebDAV 백업/복원 | WebDAV를 통한 백업 업로드/다운로드 | P2 | source |
| B073 | S3Settings.tsx | S3 연결 | S3 endpoint/bucket/key 설정 → 연결 테스트 | P2 | source |
| B074 | S3Settings.tsx | S3 백업/복원 | S3를 통한 백업 업로드/다운로드 | P2 | source |
| B075 | ShortcutSettings.tsx | 단축키 목록 표시 | 시스템/사용자 단축키 목록 렌더링 | P1 | source |
| B076 | ShortcutSettings.tsx | 단축키 변경 | 키 조합 캡처 → 저장 | P1 | source |
| B077 | AboutSettings.tsx | 앱 정보 표시 | 버전, 라이선스, GitHub 링크, 체크 업데이트 | P1 | source |
| B078 | QuickAssistantSettings.tsx | Quick Assistant 설정 | 활성화, 모델 선택, 단축키 | P2 | source |
| B079 | SelectionAssistantSettings/ | Selection Assistant 설정 | 활성화, 트리거 모드, 필터 모드, 필터 리스트 | P2 | source |
| B080 | QuickPhraseSettings.tsx | 빠른 문구 관리 | 문구 CRUD (추가/편집/삭제/순서) | P2 | source |
| B081 | DocProcessSettings.tsx | 문서 처리 설정 | 문서 변환 옵션 | P2 | source |
| B082 | BackupManager.ts | createBackup() | 앱 데이터 수집 → ZIP 압축 → 파일 저장 | P1 | source |
| B083 | BackupManager.ts | restoreBackup() | ZIP 해제 → 데이터 복원 → 앱 재시작 | P1 | source |
| B084 | WebDav.ts | WebDAV CRUD | webdav 클라이언트 생성, 파일 업로드/다운로드/리스트/삭제 | P2 | source |
| B085 | S3Storage.ts | S3 CRUD | S3 클라이언트 생성, 파일 업로드/다운로드/리스트/삭제 | P2 | source |

---

## 5. UI 컴포넌트 기능 (UI Component Features)

| 컴포넌트 | 기능 설명 |
|---------|----------|
| SettingsPage | 좌측 메뉴 사이드바 + 우측 콘텐츠 영역, 중첩 라우트 |
| SettingGroup | 설정 그룹 카드 (제목 + 설명 + 자식 SettingRow) |
| SettingRow | 설정 행 (라벨 + 컨트롤: Switch/Select/Input) |
| SettingTitle | 설정 섹션 제목 |
| SettingDivider | 구분선 |
| Selector | 공용 드롭다운 선택 컴포넌트 |
| LocalBackupManager | 로컬 백업 목록 표시/생성/복원/삭제 UI |
| WebdavBackupManager | WebDAV 백업 관리 UI |
| S3BackupManager | S3 백업 관리 UI |

---

## 6. 인터랙션 행위 목록 (Interaction Behavior Inventory)

| 인터랙션 | 트리거 | 결과 |
|---------|--------|------|
| 설정 메뉴 전환 | 사이드바 메뉴 항목 클릭 | 해당 서브 페이지 라우트로 이동 |
| 언어 변경 | General > Language 드롭다운 | i18n 언어 변경 + config 저장 |
| 테마 전환 | Display > Theme 선택 | 즉시 테마 적용 (dark/light/system) |
| 프록시 설정 | General > Proxy 영역 | 프록시 모드/URL 입력 → IPC로 적용 |
| 로컬 백업 | Data > Local Backup > 생성 | 파일 다이얼로그 → ZIP 생성 |
| 로컬 복원 | Data > Local Backup > 복원 | 파일 선택 → 확인 다이얼로그 → 복원 → 재시작 |
| WebDAV 연결 테스트 | Data > WebDAV > Test | 서버 연결 시도 → 성공/실패 표시 |
| 단축키 변경 | Shortcuts > 키 조합 클릭 | 키 캡처 모드 → 새 키 입력 → 저장 |
| 데이터 초기화 | Data > Reset | 확인 다이얼로그 → 전체 삭제 → 재시작 |
| 사이드바 아이콘 관리 | Display > Sidebar Icons | 체크박스로 표시/숨김, DnD로 순서 변경 |

---

## 7. 컴포넌트 트리 (Component Tree)

```
SettingsPage
├── Navbar
│   └── NavbarCenter ("Settings")
├── SettingMenus (사이드바)
│   ├── MenuItemLink (/settings/provider) — F004로 위임
│   ├── MenuItemLink (/settings/model) — F004로 위임
│   ├── MenuItemLink (/settings/general)
│   ├── MenuItemLink (/settings/display)
│   ├── MenuItemLink (/settings/data)
│   ├── MenuItemLink (/settings/shortcuts)
│   ├── MenuItemLink (/settings/quick-phrases)
│   ├── MenuItemLink (/settings/quick-assistant)
│   ├── MenuItemLink (/settings/selection-assistant)
│   ├── MenuItemLink (/settings/doc-process)
│   └── MenuItemLink (/settings/about)
└── Routes (콘텐츠 영역)
    ├── GeneralSettings
    │   ├── SettingGroup (Language)
    │   ├── SettingGroup (Startup)
    │   ├── SettingGroup (Tray)
    │   ├── SettingGroup (Proxy)
    │   └── SettingGroup (Advanced)
    ├── DisplaySettings
    │   ├── SettingGroup (Theme)
    │   ├── SettingGroup (Font)
    │   ├── SettingGroup (Layout)
    │   └── SidebarIconsManager
    ├── DataSettings
    │   ├── ExportMenuSettings
    │   ├── ImportMenuSettings
    │   ├── LocalBackupSettings
    │   ├── WebDavSettings
    │   ├── S3Settings
    │   └── ResetSection
    ├── ShortcutSettings
    ├── QuickPhraseSettings
    ├── QuickAssistantSettings
    ├── SelectionAssistantSettings
    ├── DocProcessSettings
    └── AboutSettings
```

---

## 8. 데이터 생명주기 패턴 (Data Lifecycle Patterns)

| 데이터 | 저장소 | 생성 시점 | 읽기 시점 | 갱신 시점 | 삭제 시점 |
|--------|--------|----------|----------|----------|----------|
| General 설정 | F001 Config API (IPC) | 최초 실행 기본값 | 설정 화면 진입 | 사용자 변경 | N/A |
| Display 설정 | Redux persist → Config | 최초 실행 기본값 | 앱 시작, 설정 화면 | 사용자 변경 | N/A |
| 단축키 | F001 Config API | 최초 실행 (ZOOM_SHORTCUTS 기본) | 설정 화면, 앱 전역 | 사용자 편집 | 초기화 시 |
| 백업 파일 (로컬) | 파일시스템 | 사용자 백업 생성 | 복원 시 | N/A | 사용자 삭제 |
| WebDAV 인증 | Config | 사용자 설정 | 백업/복원 시 | 사용자 변경 | 연결 해제 |
| S3 인증 | Config | 사용자 설정 | 백업/복원 시 | 사용자 변경 | 연결 해제 |
| 빠른 문구 | Redux persist | 사용자 추가 | 입력 시 | 편집 | 사용자 삭제 |

---

## 9. 네이밍 리매핑 (Naming Remapping: Cherry → Angdu)

| 위치 | Cherry 원본 | Angdu 대상 |
|------|------------|-----------|
| AboutSettings.tsx | "Cherry Studio" (앱 이름 표시) | "Angdu Studio" |
| AboutSettings.tsx | GitHub 링크 (CherryHQ/cherry-studio) | Angdu 저장소 URL |
| GeneralSettings.tsx | cherry-studio.desktop | angdu-studio.desktop |
| BackupManager.ts | 백업 파일명 접두사 | angdu-studio-backup |

---

## 10. 정적 리소스 (Static Resources)

| 리소스 | 경로 | 용도 |
|--------|------|------|
| Lucide Icons | lucide-react | 설정 메뉴 아이콘 (Settings2, MonitorCog, HardDrive, Command, Info 등) |
| i18n 리소스 | src/renderer/src/i18n/ | 설정 라벨 번역 키 |
| Ant Design 컴포넌트 | antd | Switch, Select, Input, Divider, Tooltip, Flex |

---

## 11. 환경 변수 (Environment Variables)

| 변수명 | 용도 | 기본값 |
|--------|------|--------|
| 해당 Feature 전용 환경 변수 없음 | — | — |

> 프록시 설정은 환경 변수가 아닌 앱 설정으로 관리됨.

---

## 12. Feature 계약 (Feature Contracts)

### 제공하는 계약 (Exports)

| 계약 ID | 타입 | 설명 | 소비자 |
|---------|------|------|--------|
| settings:language | 상태 | 현재 언어 설정 | 모든 Feature (i18n) |
| settings:theme | 상태 | 현재 테마 | 모든 Feature |
| settings:navbarPosition | 상태 | navbar 위치 | F002 |
| settings:messageStyle | 상태 | 메시지 표시 스타일 | F005 |
| settings:fontSize | 상태 | 폰트 크기 | 모든 Feature |
| backup:create | IPC | 백업 생성 | N/A (사용자 직접) |
| backup:restore | IPC | 백업 복원 | N/A (사용자 직접) |

### 의존하는 계약 (Imports)

| 계약 ID | 제공자 | 설명 |
|---------|--------|------|
| config:get/set | F001 | 설정 값 읽기/쓰기 |
| theme:set | F001 | 테마 변경 IPC |
| proxy:set | F001 | 프록시 설정 IPC |
| app:info | F001 | About 화면의 앱 정보 |
| route:navigate | F002 | 설정 메뉴 라우트 이동 |

---

## 13. /speckit.specify 참고사항

- 설정 서브 페이지가 매우 많아 UI 컨트롤 밀도 높음 → 각 서브 페이지를 독립 SBI로 관리 (SKF-028 참조)
- Ant Design → shadcn/ui로 UI 컴포넌트 교체 (New Stack)
- styled-components → Tailwind CSS 4 교체
- Redux slice (settings.ts) → Zustand store로 전환
- BackupManager의 JSZip 의존은 유지
- WebDAV, S3는 main process에서 처리 (Node.js 네트워크 API 필요)
- i18next 정적 초기화와 config persist 언어 불일치 주의 (SKF-034 참조)
- MCP, Web Search, Memories, API Server 설정은 F003 범위 밖 (별도 Feature)

---

## 14. /speckit.plan 참고사항

- F001, F002 완료 후 구현
- 구현 순서: SettingsPage 레이아웃 → GeneralSettings → DisplaySettings → DataSettings → ShortcutSettings → AboutSettings → 나머지 서브 페이지
- 검증: 각 설정 변경 → 저장 → 앱 재시작 후 값 유지 확인
- Feature Reachability 검증 필수: Home에서 설정 페이지까지 UI로 도달 가능한지 확인 (SKF-030)
- 백업/복원 테스트: 생성 → 데이터 변경 → 복원 → 이전 상태로 돌아가는지 확인

---

## 15. /speckit.analyze 참고사항

- SettingsPage.tsx에 Provider(/settings/provider)와 Model(/settings/model) 메뉴가 포함되어 있으나, 이들은 F004 범위로 위임됨 → F003에서는 라우트 선언만 담당
- SelectionAssistant, QuickAssistant는 독립 Feature로 분리될 수 있으나, 현재는 F003 설정 범위에 포함
- DataSettings 하위에 Notion, Joplin, Siyuan, Yuque, Nutstore, Obsidian 등 외부 서비스 연동 있음 → 우선순위 P3 (초기 빌드에서 제외 가능)
- 설정 변경 시 일부는 즉시 적용 (테마), 일부는 재시작 필요 (하드웨어 가속) → 사용자에게 명확히 알려야 함
