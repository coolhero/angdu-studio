# F002 — Navigation Pre-Context

> **모드**: Rebuild, New Stack
> **소스 루트**: `/Users/coolhero/Develop/cherry-studio`

---

## 1. 요약 (Brief Summary)

앱 내비게이션 시스템을 담당하는 Feature이다. 상단(top) 또는 좌측(left) Navbar, 탭 시스템(추가/닫기/재정렬), 사이드바 아이콘 관리, HashRouter 기반 라우팅, 레이아웃 모드 전환을 포함한다. react-router-dom v7의 HashRouter를 사용하며, 탭 모드(top)와 사이드바 모드(left) 두 가지 레이아웃을 지원한다.

---

## 2. 런타임 탐색 결과 (Runtime Exploration Results)

| 항목 | 관찰 결과 |
|------|----------|
| 내비게이션 모드 | tab (top navbar) — 기본값 |
| Navbar 높이 | 44px (--navbar-height) |
| Sidebar 너비 | 50px (--sidebar-width) |
| 기본 탭 | Home (닫기 불가) |
| 탭 추가 | "+" 버튼으로 새 탭 추가 가능 |
| Navbar 우측 | 미니윈도우 아이콘, 설정(gear) 아이콘 |
| 라우팅 | Hash routing (#/) |
| 사용 가능한 페이지 | Home, Knowledge Base, Files, Translate, Paintings, Notes, History, Code Tools, Store |
| DnD | 탭 재정렬: react-beautiful-dnd (@hello-pangea/dnd) |

---

## 3. 소스 참조 (Source Reference)

| File Path | Role | Rebuild Target |
|-----------|------|----------------|
| src/renderer/src/Router.tsx | HashRouter 루트, 라우트 정의, 레이아웃 모드 분기 | TBD |
| src/renderer/src/App.tsx | 앱 루트 컴포넌트, Provider 트리 | TBD |
| src/renderer/src/components/app/Navbar.tsx | 공용 Navbar 컴포넌트 (NavbarLeft, NavbarCenter, NavbarRight) | TBD |
| src/renderer/src/components/app/Sidebar.tsx | 좌측 사이드바 (left 모드용 아이콘 내비게이션) | TBD |
| src/renderer/src/components/Tab/TabContainer.tsx | 탭 컨테이너 (top 모드용 탭 바) | TBD |
| src/renderer/src/components/NavbarIcon.tsx | Navbar 아이콘 버튼 컴포넌트 | TBD |
| src/renderer/src/components/app/PinnedMinapps.tsx | 고정된 미니앱 아이콘 표시 | TBD |
| src/renderer/src/handler/NavigationHandler.tsx | 라우트 전환 핸들러 | TBD |
| src/renderer/src/store/tabs.ts | 탭 상태 관리 (Zustand/Redux) | TBD |
| src/renderer/src/store/settings.ts | 설정 상태 (navbarPosition 포함) | TBD |
| src/renderer/src/hooks/useSettings.ts | 설정 관련 훅 (useNavbarPosition 등) | TBD |
| src/renderer/src/pages/settings/DisplaySettings/SidebarIconsManager.tsx | 사이드바 아이콘 관리 UI | TBD |
| src/renderer/src/pages/settings/DisplaySettings/DisplaySettings.tsx | 디스플레이 설정 (navbar 위치 포함) | TBD |

---

## 4. 소스 행위 목록 (Source Behavior Inventory)

| ID | Source File | Function/Method | Behavior Description | Priority | Origin |
|----|------------|-----------------|---------------------|----------|--------|
| B031 | Router.tsx | Router() | navbarPosition에 따라 Sidebar(left) 또는 TabsContainer(top) 레이아웃 분기 | P0 | source |
| B032 | Router.tsx | routes (useMemo) | 13개 라우트 정의 (/, /store, /paintings/*, /translate, /files, /notes, /knowledge, /apps/:appId, /apps, /code, /openclaw, /settings/*, /launchpad) | P0 | source |
| B033 | TabContainer.tsx | TabContainer() | 탭 바 렌더링, 탭 추가(+) 버튼, 활성 탭 하이라이트 | P0 | source |
| B034 | tabs.ts | addTab() | 새 탭 생성 (라우트 경로 + 라벨) | P0 | source |
| B035 | tabs.ts | removeTab() | 탭 닫기 (Home 탭은 닫기 불가) | P0 | source |
| B036 | tabs.ts | reorderTabs() | 탭 드래그 앤 드롭 재정렬 | P1 | source |
| B037 | tabs.ts | setActiveTab() | 활성 탭 전환 (라우트 이동 트리거) | P0 | source |
| B038 | Navbar.tsx | Navbar() | 공용 Navbar 컴포넌트 (높이 44px, 좌/중앙/우 영역) | P0 | source |
| B039 | Sidebar.tsx | Sidebar() | 좌측 사이드바 아이콘 렌더링 (left 모드), 각 아이콘 클릭 시 라우트 전환 | P0 | source |
| B040 | SidebarIconsManager.tsx | SidebarIconsManager() | 사이드바 아이콘 표시/숨김 관리, 드래그로 순서 변경 | P1 | source |
| B041 | NavigationHandler.tsx | NavigationHandler() | 라우트 변경 감지 및 탭 동기화 | P1 | source |
| B042 | NavbarIcon.tsx | NavbarIcon() | 아이콘 버튼 (tooltip 포함, 클릭 핸들러) | P1 | source |
| B043 | PinnedMinapps.tsx | PinnedMinapps() | 고정된 미니앱 아이콘을 사이드바에 표시 | P2 | source |
| B044 | settings.ts | navbarPosition | 'top' | 'left' 설정값 관리 | P0 | source |
| B045 | useSettings.ts | useNavbarPosition() | navbarPosition 읽기 훅 (isTopNavbar, isLeftNavbar 파생) | P0 | source |
| B046 | DisplaySettings.tsx | Navbar Position 설정 | top/left 전환 UI 컨트롤 | P1 | source |
| B047 | App.tsx | App() | Provider 트리 구성 (Redux, QueryClient, Theme, Antd, Notification, PersistGate) | P0 | source |
| B048 | Router.tsx | HashRouter | Hash 기반 라우팅 (#/path) | P0 | source |
| B049 | tabs.ts | 탭 영속화 | 탭 상태를 config에 저장하여 재시작 시 복원 | P1 | source |
| B050 | Sidebar.tsx | 아이콘 DnD | 사이드바 아이콘 드래그 재정렬 (@dnd-kit/sortable) | P2 | source |

---

## 5. UI 컴포넌트 기능 (UI Component Features)

| 컴포넌트 | 기능 설명 |
|---------|----------|
| Navbar (Top 모드) | 44px 높이의 상단 내비게이션 바. 탭 나열, 우측 미니윈도우/설정 아이콘 |
| TabContainer | 탭 바 (드래그 재정렬, +추가, ×닫기), Home 탭은 항상 표시 |
| Sidebar (Left 모드) | 50px 너비의 좌측 아이콘 사이드바. 각 페이지로 라우트 전환 |
| NavbarIcon | 아이콘 버튼 (Tooltip 포함) — 설정, 미니윈도우 등 |
| SidebarIconsManager | 사이드바에 표시할 아이콘 선택·순서 관리 |
| NavigationHandler | URL 변경 시 탭 상태와 동기화 |

---

## 6. 인터랙션 행위 목록 (Interaction Behavior Inventory)

| 인터랙션 | 트리거 | 결과 |
|---------|--------|------|
| 탭 추가 | "+" 버튼 클릭 | 새 탭 생성, 페이지 선택 팝업 또는 기본 페이지 이동 |
| 탭 닫기 | 탭의 × 클릭 | 탭 제거, 인접 탭으로 이동 (Home은 닫기 불가) |
| 탭 전환 | 탭 클릭 | 활성 탭 변경, 해당 라우트로 이동 |
| 탭 재정렬 | 탭 드래그 앤 드롭 | 탭 순서 변경 (@hello-pangea/dnd) |
| 사이드바 아이콘 클릭 | 아이콘 클릭 (left 모드) | 해당 페이지 라우트로 이동 |
| Navbar 모드 전환 | DisplaySettings에서 top/left 전환 | 레이아웃 재구성 (TabContainer ↔ Sidebar) |
| 키보드 단축키 | Ctrl+숫자 등 | 특정 탭으로 전환 |
| 설정 아이콘 클릭 | Navbar 우측 gear 아이콘 | /settings로 이동 |

---

## 7. 컴포넌트 트리 (Component Tree)

```
App.tsx
├── Provider (Redux)
│   └── PersistGate
│       └── Router.tsx
│           ├── [navbarPosition === 'left']
│           │   ├── Sidebar
│           │   │   ├── NavbarIcon (Home)
│           │   │   ├── NavbarIcon (Knowledge)
│           │   │   ├── NavbarIcon (Files)
│           │   │   ├── NavbarIcon (Translate)
│           │   │   ├── ... (설정 가능한 아이콘들)
│           │   │   └── PinnedMinapps
│           │   └── Routes (페이지 컴포넌트들)
│           │
│           └── [navbarPosition === 'top']
│               └── TabsContainer
│                   ├── TabBar
│                   │   ├── Tab (Home — 고정)
│                   │   ├── Tab (동적 탭들)
│                   │   ├── AddTabButton (+)
│                   │   └── NavbarIcon (설정, 미니윈도우)
│                   └── Routes (페이지 컴포넌트들)
│
└── NavigationHandler
```

---

## 8. 데이터 생명주기 패턴 (Data Lifecycle Patterns)

| 데이터 | 저장소 | 생성 시점 | 읽기 시점 | 갱신 시점 | 삭제 시점 |
|--------|--------|----------|----------|----------|----------|
| 탭 목록 | Redux persist (localStorage) 또는 F001 Config API | 탭 추가 시 | 앱 시작, 렌더링 | 탭 추가/닫기/재정렬 | 탭 닫기 |
| 활성 탭 | Redux | 탭 클릭 또는 라우트 변경 | 렌더링 | 탭 전환 | N/A |
| navbarPosition | Redux persist → F001 Config | 최초 실행 ('top') | 앱 시작, Router 렌더링 | DisplaySettings에서 변경 | N/A |
| 사이드바 아이콘 목록 | Redux persist | 최초 실행 (기본 아이콘 세트) | Sidebar 렌더링 | SidebarIconsManager에서 편집 | N/A |
| 사이드바 아이콘 순서 | Redux persist | 기본 순서 | Sidebar 렌더링 | DnD로 재정렬 | N/A |

---

## 9. 네이밍 리매핑 (Naming Remapping: Cherry → Angdu)

| 위치 | Cherry 원본 | Angdu 대상 |
|------|------------|-----------|
| 해당 Feature에 직접적인 Cherry 브랜딩 없음 | — | — |

> F002는 UI 내비게이션 로직이므로 Cherry 브랜딩 리매핑은 거의 없다. 탭 라벨이나 아이콘에 "Cherry"가 노출되지 않는다.

---

## 10. 정적 리소스 (Static Resources)

| 리소스 | 경로 | 용도 |
|--------|------|------|
| Lucide Icons | lucide-react 패키지 | 사이드바 및 Navbar 아이콘 (Home, Settings, Search 등) |
| 없음 (이미지 등) | — | 내비게이션은 아이콘 폰트/SVG만 사용 |

---

## 11. 환경 변수 (Environment Variables)

| 변수명 | 용도 | 기본값 |
|--------|------|--------|
| 해당 Feature 전용 환경 변수 없음 | — | — |

---

## 12. Feature 계약 (Feature Contracts)

### 제공하는 계약 (Exports)

| 계약 ID | 타입 | 설명 | 소비자 |
|---------|------|------|--------|
| route:navigate | 함수 | 프로그래밍 방식 라우트 이동 (NavigationService) | F003, F005 |
| tab:add | 함수 | 새 탭 추가 | F003, F005 |
| tab:setActive | 함수 | 활성 탭 변경 | 모든 Feature |
| navbar:position | 상태 | 현재 navbar 위치 (top/left) | F005 (레이아웃 조정) |

### 의존하는 계약 (Imports)

| 계약 ID | 제공자 | 설명 |
|---------|--------|------|
| config:get/set | F001 | navbarPosition, 탭 상태 영속화 |
| theme | F001 | Navbar/Sidebar 스타일링에 테마 적용 |

---

## 13. /speckit.specify 참고사항

- react-router-dom v7의 HashRouter를 그대로 사용
- 탭 시스템: @hello-pangea/dnd → @dnd-kit/sortable로 교체 (New Stack 기술 스택)
- 사이드바 아이콘 DnD도 @dnd-kit/sortable 사용
- Redux → Zustand로 전환 (New Stack), 탭 상태 관리 재설계
- Navbar 컴포넌트는 shadcn/ui 기반으로 재구성
- PinnedMinapps는 F002 범위에서 기본 구조만 제공, 실제 미니앱 기능은 별도 Feature

---

## 14. /speckit.plan 참고사항

- F001 (app-shell) 완료 후 구현
- 구현 순서: HashRouter 설정 → Navbar 컴포넌트 → 탭 시스템 → 사이드바 → 아이콘 관리
- 검증: top/left 모드 전환, 탭 추가/닫기/재정렬, 라우트 이동, 상태 영속화
- F005 (chat)의 HomePage는 F002의 라우트 "/"에 매핑됨

---

## 15. /speckit.analyze 참고사항

- App.tsx의 Provider 트리가 매우 깊음 (7단계) → 필요한 것만 유지, 불필요한 Provider 제거
- Router.tsx에 13개 라우트가 정의되어 있으나, F002에서 라우트 선언만 담당하고 각 페이지 구현은 해당 Feature에서 처리
- react-beautiful-dnd → @dnd-kit 마이그레이션 시 API 차이에 유의 (onDragEnd → onDragEnd/onDragOver)
- TabContainer가 top 모드에서만 렌더링되므로, left 모드에서 탭 상태와 라우트 동기화 방식이 다름
- styled-components → Tailwind CSS 4로 전환 예정
