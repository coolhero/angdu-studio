# Angdu Studio — Micro-Interaction Inventory

> `/reverse-spec` Phase 4에서 자동 생성. UI 인터랙션 패턴의 레퍼런스로 사용.

---

## 1. Hover 인터랙션

| 패턴 | 위치 | 트리거 | 동작 | Feature |
|------|------|--------|------|---------|
| 메시지 액션 바 | 메시지 블록 | 메시지 hover | 복사/재생성/편집/삭제/TTS/번역 아이콘 바 표시 (fade-in) | F005 |
| 버튼 hover 상태 | 전역 | 버튼 hover | 배경색 변경 + cursor:pointer (Tailwind hover: 클래스) | 전역 |
| 사이드바 아이콘 tooltip | Sidebar (left 모드) | 아이콘 hover | Tooltip으로 페이지 이름 표시 (200ms 딜레이) | F002 |
| 탭 닫기 버튼 | TabBar (top 모드) | 탭 hover | × 닫기 버튼 표시 (Home 탭 제외) | F002 |
| 프로바이더 목록 항목 | ProviderList | 항목 hover | 배경색 하이라이트 | F004 |
| 토픽 항목 | TopicsTab | 항목 hover | 컨텍스트 메뉴 트리거 아이콘 표시 | F005 |
| 파일 항목 | FileList | 항목 hover | 액션 버튼(이름변경, 삭제) 표시 | F008 |
| KB 사이드바 항목 | KnowledgePage | 항목 hover | 컨텍스트 메뉴 트리거 아이콘 표시 | F006 |
| 이미지 결과 | Paintings 그리드 | 이미지 hover | 다운로드/확대 오버레이 표시 | F008 |

---

## 2. 키보드 단축키

| 단축키 | 동작 | 스코프 | Feature |
|--------|------|--------|---------|
| `Cmd/Ctrl+K` | 글로벌 검색 팝업 열기 | 앱 전역 | F005 |
| `Cmd/Ctrl+N` | 새 토픽 생성 | 채팅 페이지 | F005 |
| `Cmd/Ctrl+M` | 모델 선택 팝업 열기 | 채팅 페이지 | F005 |
| `Cmd/Ctrl+F` | 채팅 내 검색 (ContentSearch) | 채팅 페이지 | F005 |
| `Cmd/Ctrl+,` | 설정 페이지 열기 | 앱 전역 | F003 |
| `Esc` | 현재 팝업/다이얼로그 닫기 | 앱 전역 | 전역 |
| `Esc` | 다중 선택 모드 해제 | 채팅 페이지 | F005 |
| `Enter` | 메시지 전송 (설정에 따라 Shift+Enter와 교체 가능) | InputBar | F005 |
| `Shift+Enter` | 줄바꿈 (설정에 따라 Enter와 교체 가능) | InputBar | F005 |
| `Cmd/Ctrl++` | 줌 인 | 앱 전역 | F001 |
| `Cmd/Ctrl+-` | 줌 아웃 | 앱 전역 | F001 |
| `Cmd/Ctrl+0` | 줌 리셋 (100%) | 앱 전역 | F001 |
| `Cmd/Ctrl+1~9` | 탭 전환 (번호순) | Top 모드 | F002 |
| `/` | QuickPanel 열기 (명령어 팔레트) | InputBar | F005 |
| `@` | 모델 멘션 입력 | InputBar | F005 |

---

## 3. 애니메이션

| 패턴 | 위치 | 동작 | 구현 방식 | Feature |
|------|------|------|----------|---------|
| 사이드바 토글 | Chat 사이드바 | 좌측 사이드바 슬라이드 인/아웃 | CSS transition (width: 0 ↔ 275px, 200ms ease) | F005 |
| 메시지 진입 | Messages | 새 메시지 추가 시 페이드 인 | CSS animation (opacity 0→1, translateY 10px→0) | F005 |
| 스트리밍 커서 | MessageContent | 스트리밍 중 깜빡이는 커서 | CSS animation (blink, opacity 0↔1) | F005 |
| 토픽 목록 DnD | TopicsTab | 드래그 중 항목 그림자/스케일 | @dnd-kit DragOverlay (scale 1.02, shadow) | F005 |
| 탭 DnD | TabBar | 드래그 중 탭 위치 애니메이션 | @dnd-kit transition (200ms) | F002 |
| 모달 오픈/닫기 | 전역 다이얼로그 | 모달 진입 시 스케일+페이드 | shadcn/ui Dialog (scale 0.95→1, opacity 0→1) | 전역 |
| 토스트 알림 | 전역 | 우측 상단에서 슬라이드 인, 자동 페이드 아웃 | shadcn/ui Toast (translateX 100%→0) | 전역 |
| 스위치 토글 | Settings | ON/OFF 전환 시 슬라이드 | shadcn/ui Switch (내장 transition) | F003 |
| 프로그레스 바 | KB 처리 | 진행률 증가 애니메이션 | CSS transition (width, 300ms ease) | F006 |
| 사고 과정 접기/펼치기 | ThinkingBlock | 컨텐츠 접기/펼치기 | CSS transition (max-height, 200ms) | F005 |

---

## 4. 포커스 관리

| 패턴 | 위치 | 트리거 | 동작 | Feature |
|------|------|--------|------|---------|
| InputBar 자동 포커스 | 채팅 페이지 | 페이지 진입, 토픽 전환 | TipTap 에디터에 자동 focus | F005 |
| 검색 입력 자동 포커스 | SearchPopup, ContentSearch | 팝업/바 열림 | 검색 input에 자동 focus | F005 |
| 다이얼로그 첫 입력 포커스 | 전역 다이얼로그 | 다이얼로그 열림 | 첫 번째 입력 필드에 focus | 전역 |
| 단축키 캡처 포커스 | ShortcutSettings | 키 조합 편집 시작 | 해당 행에 키 캡처 포커스 트랩 | F003 |
| 번역 입력 포커스 | TranslatePage | 페이지 진입 | 좌측 TextArea에 자동 focus | F007 |
| 노트 에디터 포커스 | NotesPage | 파일 선택 | TipTap 에디터에 자동 focus | F008 |

---

## 5. 드래그 앤 드롭 (DnD)

| 패턴 | 위치 | 드래그 대상 | 드롭 타겟 | 라이브러리 | Feature |
|------|------|-----------|----------|-----------|---------|
| 탭 재정렬 | TabBar (top 모드) | 개별 탭 | 탭 바 내 위치 | @dnd-kit/sortable | F002 |
| 사이드바 아이콘 재정렬 | Sidebar (left 모드) | 아이콘 | 아이콘 목록 | @dnd-kit/sortable | F002 |
| 토픽 재정렬 | TopicsTab | 토픽 항목 | 토픽 목록 | @dnd-kit/sortable | F005 |
| 어시스턴트 재정렬 | AssistantsTab | 어시스턴트 항목 | 어시스턴트 목록 | @dnd-kit/sortable | F005 |
| KB 사이드바 재정렬 | KnowledgePage | KB 항목 | KB 목록 | @dnd-kit/sortable | F006 |
| 파일 업로드 드롭 | KnowledgeFiles | 외부 파일 | 파일 탭 영역 | native HTML5 DnD | F006 |
| 파일 드롭 번역 | TranslatePage | 외부 파일 | 입력 영역 | native HTML5 DnD | F007 |
| 파일 첨부 드롭 | InputBar | 외부 파일 | InputBar 영역 | native HTML5 DnD | F005 |
| InputBar 도구 재정렬 | InputbarTools | 도구 아이콘 | 도구 바 | @dnd-kit/sortable | F005 |
| 노트 트리 드래그 | NotesSidebar | 파일/폴더 노드 | 트리 내 위치 | @dnd-kit/sortable | F008 |
| 사이드바 아이콘 관리 | SidebarIconsManager | 아이콘 항목 | 표시 목록 | @dnd-kit/sortable | F003 |

---

## 6. 컨텍스트 메뉴 (우클릭)

| 패턴 | 위치 | 트리거 | 메뉴 항목 | Feature |
|------|------|--------|----------|---------|
| 메시지 컨텍스트 메뉴 | Message | 메시지 우클릭 | 복사, 편집, 삭제, 번역, KB 저장, 멀티 선택 | F005 |
| 토픽 컨텍스트 메뉴 | TopicsTab | 토픽 항목 우클릭 | 이름 변경, 고정, 삭제, 내보내기 | F005 |
| 어시스턴트 컨텍스트 메뉴 | AssistantsTab | 어시스턴트 우클릭 | 편집, 복제, 삭제 | F005 |
| KB 컨텍스트 메뉴 | KnowledgePage | KB 항목 우클릭 | 이름 변경, 설정, 삭제 | F006 |
| 파일 컨텍스트 메뉴 | FileList | 파일 항목 우클릭 | 이름 변경, 삭제, 열기 | F008 |
| 노트 트리 컨텍스트 메뉴 | NotesSidebar | 파일/폴더 우클릭 | 이름 변경, 삭제, 새 파일, 새 폴더 | F008 |
| 트레이 컨텍스트 메뉴 | SystemTray | 트레이 아이콘 우클릭 | Show, Quick Assistant, Quit | F001 |
| 탭 컨텍스트 메뉴 | TabBar | 탭 우클릭 | 닫기, 다른 탭 모두 닫기, 우측 탭 닫기 | F002 |

---

## 7. 스크롤 패턴

| 패턴 | 위치 | 동작 | 구현 | Feature |
|------|------|------|------|---------|
| 무한 스크롤 (메시지) | Messages | 상단 스크롤 시 이전 메시지 로드 | IntersectionObserver + 페이지네이션 | F005 |
| 하단 자동 스크롤 | Messages | 새 메시지/스트리밍 중 | scrollIntoView({ behavior: 'smooth' }) | F005 |
| 스크롤 위치 복원 | Messages | 토픽 전환 시 | 저장된 scrollTop 복원 | F005 |
| 위/아래 네비게이션 | ChatNavigation | 버튼 클릭 | 최상단/최하단으로 smooth scroll | F005 |
| "새 메시지" 배지 | Messages | 스크롤이 하단에 없을 때 새 메시지 도착 | "↓ 새 메시지" 플로팅 배지, 클릭 시 하단 이동 | F005 |
| 입출력 스크롤 동기화 | TranslatePage | 한쪽 스크롤 | 다른 쪽 동기화 (throttle 적용) | F007 |
| 설정 페이지 스크롤 | SettingsPage | 서브 페이지 콘텐츠 | overflow-y: auto, 개별 서브 페이지 스크롤 | F003 |
| 파일 목록 가상화 | FileList | 대량 파일 | @tanstack/react-virtual (가상 스크롤) | F008 |
| 모델 목록 가상화 | ManagePopup | 대량 모델 | @tanstack/react-virtual | F004 |

---

## 8. 기타 인터랙션 패턴

### 로딩 상태
| 패턴 | 위치 | 동작 | Feature |
|------|------|------|---------|
| 스트리밍 플레이스홀더 | PlaceholderBlock | AI 응답 대기 중 점 애니메이션 (···) | F005 |
| Health Check 로딩 | ProviderSetting | Check 버튼 클릭 → 스피너 → 성공/실패 아이콘 | F004 |
| KB 처리 진행률 | KnowledgeFiles | 파일별 프로그레스 바 (0%→100%) | F006 |
| 번역 스트리밍 | TranslatePage | 번역 중 실시간 텍스트 추가 | F007 |

### 복사 피드백
| 패턴 | 위치 | 동작 | Feature |
|------|------|------|---------|
| 클립보드 복사 | MessageMenubar, 번역 출력 | 복사 아이콘 → 체크 아이콘 전환 (2초 후 복귀) | F005, F007 |

### 토글/전환
| 패턴 | 위치 | 동작 | Feature |
|------|------|------|---------|
| 사이드바 토글 | Chat Navbar | 아이콘 클릭 → 사이드바 슬라이드 인/아웃 | F005 |
| 다크/라이트 테마 | 전역 | 즉시 CSS 변수 전환, 부드러운 색상 트랜지션 | F001 |
| 웹 검색 토글 | InputbarTools | 아이콘 상태 변경 (활성: 파란색, 비활성: 회색) | F010 |
| KB 토글 | InputbarTools | KB 선택 드롭다운 표시/숨김 | F006 |

### 확인 다이얼로그
| 패턴 | 위치 | 동작 | Feature |
|------|------|------|---------|
| 삭제 확인 | 토픽, 어시스턴트, KB, 메시지, 파일 | "정말 삭제하시겠습니까?" + 취소/확인 버튼 | 전역 |
| 데이터 초기화 확인 | DataSettings | 2단계 확인 (경고 → 최종 확인) | F003 |
| 백업 복원 확인 | DataSettings | "현재 데이터가 덮어씌워집니다" 경고 | F003 |
