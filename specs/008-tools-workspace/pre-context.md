# F008 — tools-workspace Pre-Context

> **모드**: Rebuild, New Stack
> **소스 루트**: `/Users/coolhero/Develop/cherry-studio` (상대 경로 사용)

---

## 1. Brief Summary

보조 도구 모음을 하나의 Feature로 묶은 "catch-all" Feature이다. 다음 6개 하위 기능을 포함한다:

1. **Code Tools** — CLI 도구(Claude Code, Codex 등) 선택, 모델/터미널/작업 디렉토리/환경 변수 설정 후 실행
2. **Paintings** — 이미지 생성. 프로바이더별 페이지(Zhipu, Aihubmix, Silicon, Dmxapi, TokenFlux, OVMS, PPIO, NewApi)
3. **Notes** — 파일 트리 사이드바 + TipTap 에디터. 마크다운/코드 편집, 검색, 정렬
4. **Files** — 앱 내 파일 관리. 타입별 필터, 정렬, 다중 선택, 이름 변경, 삭제
5. **MCP Servers** — MCP 서버 관리 (목록, 추가, 편집, 삭제, 마켓플레이스, 동기화)
6. **Assistant Store** — 어시스턴트 마켓플레이스 프리셋, 검색, 가져오기, 생성

---

## 2. Runtime Exploration Results

| 하위 기능 | 관찰 결과 |
|----------|----------|
| Code Tools | CLI 도구 드롭다운(Claude, Codex 등), 모델 선택, 터미널 선택, 작업 디렉토리 추가, 환경 변수 편집, Launch 버튼 |
| Paintings | 프로바이더 탭 라우팅, Draw/Edit 탭, 모델/사이즈/수량 설정, 프롬프트 입력, 생성 결과 그리드 |
| Notes | 좌측 파일 트리 사이드바, 우측 TipTap 에디터, 마크다운/코드 뷰 전환, 즐겨찾기 |
| Files | 좌측 타입 필터(Document, Image, All), 우측 파일 목록, 정렬(날짜/크기/이름), 다중 선택 삭제 |
| MCP Servers | 서버 카드 목록, Add 버튼, JSON 편집, 마켓플레이스 검색, Sync 기능 |
| Assistant Store | 프리셋 카드 그리드, 카테고리 필터, 검색, 가져오기 버튼 |

---

## 3. Source Reference

| File Path | Role | Rebuild Target |
|-----------|------|---------------|
| `src/renderer/src/pages/code/CodeToolsPage.tsx` | Code Tools 페이지 | TBD |
| `src/renderer/src/pages/code/index.ts` | Code Tools 설정/상수 (CLI_TOOLS, 환경 변수 생성) | TBD |
| `src/renderer/src/pages/paintings/PaintingsRoutePage.tsx` | Paintings 라우트 페이지 (프로바이더별 분기) | TBD |
| `src/renderer/src/pages/paintings/ZhipuPage.tsx` | Zhipu 이미지 생성 | TBD |
| `src/renderer/src/pages/paintings/AihubmixPage.tsx` | Aihubmix 이미지 생성 | TBD |
| `src/renderer/src/pages/paintings/SiliconPage.tsx` | Silicon 이미지 생성 | TBD |
| `src/renderer/src/pages/paintings/DmxapiPage.tsx` | Dmxapi 이미지 생성 | TBD |
| `src/renderer/src/pages/paintings/TokenFluxPage.tsx` | TokenFlux 이미지 생성 | TBD |
| `src/renderer/src/pages/paintings/OvmsPage.tsx` | OVMS 이미지 생성 | TBD |
| `src/renderer/src/pages/paintings/PpioPage.tsx` | PPIO 이미지 생성 | TBD |
| `src/renderer/src/pages/paintings/NewApiPage.tsx` | 커스텀 API 이미지 생성 | TBD |
| `src/renderer/src/pages/paintings/components/` | 공유 이미지 생성 컴포넌트 | TBD |
| `src/renderer/src/pages/paintings/config/` | 이미지 생성 설정 | TBD |
| `src/renderer/src/pages/paintings/utils/` | 이미지 생성 유틸리티 | TBD |
| `src/renderer/src/pages/notes/NotesPage.tsx` | Notes 페이지 | TBD |
| `src/renderer/src/pages/notes/NotesSidebar.tsx` | 파일 트리 사이드바 | TBD |
| `src/renderer/src/pages/notes/NotesSidebarHeader.tsx` | 사이드바 헤더 | TBD |
| `src/renderer/src/pages/notes/NotesEditor.tsx` | TipTap 에디터 | TBD |
| `src/renderer/src/pages/notes/HeaderNavbar.tsx` | 에디터 헤더 네비바 | TBD |
| `src/renderer/src/pages/notes/NotesSettings.tsx` | 노트 설정 | TBD |
| `src/renderer/src/pages/notes/MenuConfig.tsx` | 에디터 메뉴 설정 | TBD |
| `src/renderer/src/pages/notes/components/` | 노트 하위 컴포넌트 | TBD |
| `src/renderer/src/pages/notes/context/` | 노트 컨텍스트 | TBD |
| `src/renderer/src/pages/notes/hooks/` | 노트 훅 | TBD |
| `src/renderer/src/pages/files/FilesPage.tsx` | Files 페이지 | TBD |
| `src/renderer/src/pages/files/FileList.tsx` | 파일 목록 | TBD |
| `src/renderer/src/pages/files/FileItem.tsx` | 파일 항목 | TBD |
| `src/renderer/src/pages/files/ContentView.tsx` | 파일 내용 뷰 | TBD |
| `src/renderer/src/pages/settings/MCPSettings/McpSettings.tsx` | MCP 설정 페이지 | TBD |
| `src/renderer/src/pages/settings/MCPSettings/McpServersList.tsx` | MCP 서버 목록 | TBD |
| `src/renderer/src/pages/settings/MCPSettings/McpServerCard.tsx` | MCP 서버 카드 | TBD |
| `src/renderer/src/pages/settings/MCPSettings/AddMcpServerModal.tsx` | MCP 서버 추가 모달 | TBD |
| `src/renderer/src/pages/settings/MCPSettings/EditMcpJsonPopup.tsx` | MCP JSON 편집 팝업 | TBD |
| `src/renderer/src/pages/settings/MCPSettings/McpMarketList.tsx` | MCP 마켓플레이스 | TBD |
| `src/renderer/src/pages/settings/MCPSettings/SyncServersPopup.tsx` | MCP 서버 동기화 | TBD |
| `src/renderer/src/pages/settings/MCPSettings/McpTool.tsx` | MCP 도구 표시 | TBD |
| `src/renderer/src/pages/settings/MCPSettings/McpResource.tsx` | MCP 리소스 표시 | TBD |
| `src/renderer/src/pages/settings/MCPSettings/McpPrompt.tsx` | MCP 프롬프트 표시 | TBD |
| `src/renderer/src/pages/settings/MCPSettings/McpProviderSettings.tsx` | MCP 프로바이더 설정 | TBD |
| `src/renderer/src/pages/settings/MCPSettings/NpxSearch.tsx` | NPX 패키지 검색 | TBD |
| `src/renderer/src/pages/settings/MCPSettings/InstallNpxUv.tsx` | NPX/UV 설치 | TBD |
| `src/renderer/src/pages/settings/MCPSettings/BuiltinMCPServerList.tsx` | 빌트인 MCP 서버 목록 | TBD |
| `src/renderer/src/pages/store/assistants/` | 어시스턴트 스토어 | TBD |

---

## 4. Source Behavior Inventory

| ID | Source File | Function/Method | Behavior | Priority | Origin |
|----|------------|-----------------|----------|----------|--------|
| B261 | `CodeToolsPage.tsx` | CLI 도구 선택 | 드롭다운으로 CLI 도구(Claude Code, Codex 등) 선택 | P0 | Source |
| B262 | `CodeToolsPage.tsx` | 모델 선택 | ModelSelector로 코드 도구용 LLM 모델 지정 | P0 | Source |
| B263 | `CodeToolsPage.tsx` | 터미널 선택 | 시스템 터미널 앱 감지 + 선택 | P1 | Source |
| B264 | `CodeToolsPage.tsx` | 작업 디렉토리 | 폴더 선택 다이얼로그로 작업 디렉토리 추가/제거 | P1 | Source |
| B265 | `CodeToolsPage.tsx` | 환경 변수 | 환경 변수 키=값 편집 (API 키 등) | P1 | Source |
| B266 | `CodeToolsPage.tsx` | Launch | canLaunch 조건 충족 시 터미널에서 CLI 도구 실행 | P0 | Source |
| B267 | `CodeToolsPage.tsx` | Bun 설치 | Bun 런타임 설치 (MCP 서버 의존) | P2 | Source |
| B268 | `index.ts` | `generateToolEnvironment` | CLI 도구용 환경 변수 생성 (API 키, 모델 ID 등) | P0 | Source |
| B269 | `PaintingsRoutePage.tsx` | 프로바이더 라우팅 | URL 파라미터로 프로바이더별 페이지 분기 | P0 | Source |
| B270 | `ZhipuPage.tsx` | 이미지 생성 (Zhipu) | Zhipu API로 이미지 생성 — 프롬프트, 사이즈, 수량 | P1 | Source |
| B271 | `AihubmixPage.tsx` | 이미지 생성 (Aihubmix) | Aihubmix API로 이미지 생성 | P1 | Source |
| B272 | `SiliconPage.tsx` | 이미지 생성 (Silicon) | Silicon API로 이미지 생성 | P1 | Source |
| B273 | `DmxapiPage.tsx` | 이미지 생성 (Dmxapi) | Dmxapi API로 이미지 생성 | P2 | Source |
| B274 | `TokenFluxPage.tsx` | 이미지 생성 (TokenFlux) | TokenFlux API로 이미지 생성 | P2 | Source |
| B275 | `OvmsPage.tsx` | 이미지 생성 (OVMS) | OVMS 로컬 API로 이미지 생성 | P2 | Source |
| B276 | `PpioPage.tsx` | 이미지 생성 (PPIO) | PPIO API로 이미지 생성 | P2 | Source |
| B277 | `NewApiPage.tsx` | 이미지 생성 (커스텀 API) | 커스텀 API 엔드포인트로 이미지 생성 | P2 | Source |
| B278 | `NotesPage.tsx` | 노트 페이지 레이아웃 | 사이드바 + 에디터 2단 레이아웃 | P0 | Source |
| B279 | `NotesSidebar.tsx` | 파일 트리 | 파일/디렉토리 트리 표시, 생성, 삭제, 이름 변경, 드래그 정렬 | P0 | Source |
| B280 | `NotesEditor.tsx` | TipTap 에디터 | 마크다운/코드 편집, 자동 저장 | P0 | Source |
| B281 | `NotesPage.tsx` | `addNote`, `addDir` | 새 노트/디렉토리 생성 | P0 | Source |
| B282 | `NotesPage.tsx` | `delNode` | 노트/디렉토리 삭제 | P1 | Source |
| B283 | `NotesPage.tsx` | `renameEntry` | 노트/디렉토리 이름 변경 | P1 | Source |
| B284 | `NotesPage.tsx` | `sortTree` | 파일 트리 정렬 (이름, 날짜, 타입) | P2 | Source |
| B285 | `NotesPage.tsx` | `uploadNotes` | 외부 파일 업로드 → 노트로 변환 | P2 | Source |
| B286 | `HeaderNavbar.tsx` | 에디터 헤더 | 파일명 표시, 뷰 전환 (마크다운/코드), 검색 | P1 | Source |
| B287 | `FilesPage.tsx` | 파일 타입 필터 | document/image/all 타입별 필터링 | P0 | Source |
| B288 | `FilesPage.tsx` | 파일 정렬 | created_at/size/name 기준, asc/desc 순서 | P1 | Source |
| B289 | `FilesPage.tsx` | 다중 선택 삭제 | 체크박스 선택 → 일괄 삭제 | P1 | Source |
| B290 | `FilesPage.tsx` | 파일 이름 변경 | 컨텍스트 메뉴 → 이름 변경 | P2 | Source |
| B291 | `FileList.tsx` | 파일 목록 표시 | 파일 메타데이터(이름, 크기, 날짜) 표시 | P0 | Source |
| B292 | `McpSettings.tsx` | MCP 설정 페이지 | MCP 서버 관리 메인 페이지 | P0 | Source |
| B293 | `McpServersList.tsx` | 서버 목록 | MCP 서버 카드 목록 표시 | P0 | Source |
| B294 | `McpServerCard.tsx` | 서버 카드 | 서버 상태, 이름, 도구 수, 활성화 토글 | P0 | Source |
| B295 | `AddMcpServerModal.tsx` | 서버 추가 | 서버 타입(npx/docker/sse 등), 이름, 명령어, 인수, 환경 변수 입력 | P0 | Source |
| B296 | `EditMcpJsonPopup.tsx` | JSON 편집 | MCP 서버 설정 JSON 직접 편집 | P1 | Source |
| B297 | `McpMarketList.tsx` | 마켓플레이스 | MCP 서버 마켓플레이스 검색 및 설치 | P1 | Source |
| B298 | `SyncServersPopup.tsx` | 서버 동기화 | 외부 소스에서 MCP 서버 설정 동기화 | P2 | Source |
| B299 | `McpTool.tsx` | 도구 표시 | MCP 서버의 사용 가능한 도구 목록 | P1 | Source |
| B300 | `McpResource.tsx` | 리소스 표시 | MCP 서버의 리소스 목록 | P1 | Source |
| B301 | `McpPrompt.tsx` | 프롬프트 표시 | MCP 서버의 프롬프트 목록 | P2 | Source |
| B302 | `NpxSearch.tsx` | NPX 검색 | NPX 레지스트리에서 MCP 서버 패키지 검색 | P2 | Source |
| B303 | `InstallNpxUv.tsx` | NPX/UV 설치 | NPX 또는 UV 런타임 설치 안내 | P2 | Source |
| B304 | `BuiltinMCPServerList.tsx` | 빌트인 서버 | 기본 내장 MCP 서버 목록 관리 | P1 | Source |
| B305 | `McpProviderSettings.tsx` | 프로바이더 설정 | MCP 프로바이더별 설정 | P2 | Source |
| B306 | `store/assistants/` | 어시스턴트 스토어 | 프리셋 어시스턴트 마켓플레이스 | P1 | Source |
| B307 | `store/assistants/` | 프리셋 검색 | 카테고리별/키워드별 어시스턴트 프리셋 검색 | P1 | Source |
| B308 | `store/assistants/` | 프리셋 가져오기 | 마켓플레이스 프리셋을 로컬 어시스턴트로 가져오기 | P1 | Source |
| B309 | `NotesPage.tsx` | 파일 감시 | FileChangeEvent로 외부 파일 변경 감지 → 에디터 갱신 | P2 | Source |
| B310 | `NotesPage.tsx` | 즐겨찾기 | starredPaths로 노트 즐겨찾기 관리 | P2 | Source |
| B311 | `paintings/components/` | 이미지 결과 그리드 | 생성된 이미지 미리보기 그리드 표시 | P1 | Source |
| B312 | `paintings/components/` | 이미지 다운로드 | 생성된 이미지 로컬 저장 | P1 | Source |
| B313 | `paintings/config/` | 이미지 생성 설정 | 프로바이더별 모델, 사이즈, 옵션 설정 | P1 | Source |
| B314 | `NotesSettings.tsx` | 노트 설정 | 에디터 폰트, 테마, 자동 저장 간격 등 | P2 | Source |
| B315 | `MenuConfig.tsx` | 에디터 메뉴 | TipTap 에디터 툴바 메뉴 설정 | P2 | Source |
| B316 | `notes/hooks/` | 노트 훅 | useNotesQuery, useNotesSettings 등 | P1 | Source |
| B317 | `notes/context/` | 노트 컨텍스트 | 에디터 컨텍스트 공유 | P2 | Source |
| B318 | `ContentView.tsx` | 파일 내용 뷰 | 파일 미리보기 (이미지, 텍스트) | P2 | Source |
| B319 | `FileItem.tsx` | 파일 항목 | 파일 메타데이터 + 액션 메뉴 | P1 | Source |
| B320 | `McpDescription.tsx` | MCP 설명 | MCP 서버 상세 설명 표시 | P2 | Source |

---

## 5. UI Component Features

### Code Tools
| 컴포넌트 | 기능 설명 |
|----------|----------|
| CodeToolsPage | CLI 도구 선택, 모델/터미널 설정, 환경 변수, Launch |
| ModelSelector | 코드 도구용 LLM 모델 선택 |
| Terminal Select | 시스템 터미널 앱 선택 |
| Directory Selector | 작업 디렉토리 목록 관리 |

### Paintings
| 컴포넌트 | 기능 설명 |
|----------|----------|
| PaintingsRoutePage | 프로바이더별 이미지 생성 페이지 라우팅 |
| 각 프로바이더 Page | 프롬프트 입력, 모델/사이즈 설정, 이미지 결과 그리드 |

### Notes
| 컴포넌트 | 기능 설명 |
|----------|----------|
| NotesPage | 사이드바 + 에디터 레이아웃 |
| NotesSidebar | 파일 트리, 생성/삭제/이름 변경 |
| NotesEditor | TipTap 기반 마크다운/코드 에디터 |

### Files
| 컴포넌트 | 기능 설명 |
|----------|----------|
| FilesPage | 파일 관리 — 타입 필터, 정렬, 다중 선택 |
| FileList | 파일 목록 그리드/리스트 |

### MCP Servers
| 컴포넌트 | 기능 설명 |
|----------|----------|
| McpSettings | MCP 서버 관리 메인 |
| McpServerCard | 서버 상태, 활성화 토글 |
| AddMcpServerModal | 서버 추가 폼 |
| McpMarketList | 마켓플레이스 검색 |

### Assistant Store
| 컴포넌트 | 기능 설명 |
|----------|----------|
| 어시스턴트 스토어 | 프리셋 카드 그리드, 검색, 가져오기 |

---

## 6. Interaction Behavior Inventory

| 사용자 동작 | 시스템 응답 |
|------------|-----------|
| Code Tools: CLI 도구 선택 | 해당 도구 설정 UI 업데이트, 환경 변수 자동 생성 |
| Code Tools: Launch 클릭 | 터미널에서 CLI 도구 프로세스 실행 |
| Paintings: 프로바이더 탭 전환 | 해당 프로바이더 페이지 라우팅 |
| Paintings: 이미지 생성 실행 | API 호출 → 이미지 결과 그리드 표시 |
| Notes: 사이드바에서 파일 선택 | 에디터에 파일 내용 로드 |
| Notes: 새 파일/폴더 생성 | 트리에 노드 추가, 에디터 포커스 |
| Notes: 에디터에서 편집 | 자동 저장 (debounce) |
| Files: 타입 필터 변경 | 파일 목록 필터링 |
| Files: 정렬 변경 | 파일 목록 재정렬 |
| Files: 다중 선택 삭제 | 확인 다이얼로그 → 일괄 삭제 |
| MCP: Add 버튼 | AddMcpServerModal 표시 |
| MCP: 서버 카드 토글 | 서버 활성화/비활성화 |
| MCP: 마켓플레이스 검색 | NPX 레지스트리 검색 결과 표시 |
| Store: 프리셋 가져오기 | 로컬 어시스턴트 목록에 추가 |

---

## 7. Component Tree

```
[Code Tools]
CodeToolsPage
├── Navbar (NavbarCenter: "Code Tools")
├── CLI 도구 Select
├── ModelSelector
├── Terminal Select
├── Directory List (Add/Remove)
├── Environment Variables Editor
└── Launch Button

[Paintings]
PaintingsRoutePage
├── Provider Selector (sidebar/tabs)
└── Routes
    ├── ZhipuPage
    ├── AihubmixPage
    ├── SiliconPage
    ├── DmxapiPage
    ├── TokenFluxPage
    ├── OvmsPage
    ├── PpioPage
    └── NewApiPage
    각 Page:
    ├── 프롬프트 입력
    ├── 설정 (모델, 사이즈, 수량)
    └── 이미지 결과 그리드

[Notes]
NotesPage
├── HeaderNavbar (파일명, 뷰 전환, 검색)
├── NotesSidebar
│   ├── NotesSidebarHeader (새 파일/폴더 버튼)
│   └── TreeView (NotesTreeNode)
└── NotesEditor (TipTap / CodeEditor)

[Files]
FilesPage
├── Navbar (NavbarCenter: "Files")
├── Sidebar (타입 필터: Document/Image/All)
├── Sort Controls (필드, 순서)
├── Batch Actions (선택/삭제)
└── FileList
    └── FileItem × N

[MCP Servers]
McpSettings
├── McpServersList
│   └── McpServerCard × N
├── AddMcpServerModal
├── EditMcpJsonPopup
├── McpMarketList
├── SyncServersPopup
└── BuiltinMCPServerList

[Assistant Store]
AssistantStorePage
├── 카테고리 필터
├── 검색
└── 프리셋 카드 그리드
```

---

## 8. Data Lifecycle Patterns

| 데이터 | 생성 계기 | 저장소 | 갱신 시점 | 삭제 시점 |
|--------|---------|--------|---------|---------|
| Code Tool 설정 | 사용자 선택 시 | store (persist) | 설정 변경 시 | 리셋 시 |
| 이미지 생성 결과 | API 응답 수신 | 메모리 + 파일 시스템 (다운로드 시) | — | 페이지 이탈 또는 새 생성 시 |
| 노트 파일 | 사용자 생성 | 파일 시스템 (Notes 디렉토리) | 에디터 자동 저장 | 사용자 삭제 |
| 노트 트리 상태 | 앱 시작 시 loadTree | store (persist) | 파일 추가/삭제/이동 시 | — |
| 파일 메타데이터 | 파일 업로드/첨부 시 | Dexie `files` → better-sqlite3 | 이름 변경 시 | 사용자 삭제 |
| MCP 서버 설정 | 사용자 추가 | store (persist) | 편집/동기화 시 | 사용자 삭제 |
| 어시스턴트 프리셋 | 마켓플레이스에서 가져오기 | store (persist) | — | 사용자 삭제 |
| Painting 프로바이더 선택 | 사용자 선택 | store settings | 탭 변경 시 | — |

---

## 9. Naming Remapping

| 소스 이름 | Angdu 이름 | 사유 |
|----------|-----------|------|
| Ant Design `Select`, `Button`, `Checkbox` 등 | shadcn/ui 대응 컴포넌트 | UI 라이브러리 전환 |
| `styled-components` | Tailwind CSS 4 | 스타일링 전환 |
| Dexie `files` 테이블 | better-sqlite3 (Main IPC) | DB 통합 |
| Redux `note`, `mcp`, `settings` slices | Zustand stores | 상태 관리 전환 |
| `react-router-dom` v6 | `react-router-dom` v7 | 라우팅 버전 업 |

---

## 10. Static Resources

| 리소스 | 경로 | 용도 |
|--------|------|------|
| 프로바이더 로고 | `src/renderer/src/assets/images/providers/` | 이미지 생성 프로바이더 아이콘 |
| (기타) | — | 각 하위 기능에서 lucide-react 아이콘 사용 |

---

## 11. Environment Variables

| 변수 | 용도 | 기본값 |
|------|------|--------|
| CLI 도구 환경 변수 | `generateToolEnvironment`로 런타임 생성 (ANTHROPIC_API_KEY, OPENAI_API_KEY 등) | 프로바이더 설정에서 추출 |
| MCP 서버 환경 변수 | MCP 서버 프로세스에 전달 | 서버 설정에서 지정 |

---

## 12. Feature Contracts

### 의존하는 Feature
| Feature | 계약 | 용도 |
|---------|------|------|
| F001 (app-shell) | IPC 채널, 프로세스 실행, 파일 시스템 | CLI 도구 실행, 파일 관리, MCP 서버 프로세스 |
| F002 (navigation) | 탭/라우팅 시스템 | 각 하위 페이지 라우팅 |
| F004 (model-provider) | 프로바이더/모델 API | 코드 도구 모델 선택, 이미지 생성 API |
| F003 (settings) | 설정 페이지 슬롯 | MCP 설정이 Settings 내에 위치 |

### 제공하는 계약
| 계약 | 소비자 | 설명 |
|------|--------|------|
| MCP 도구 목록 | F005 (chat) | 채팅에서 MCP 도구 호출 |
| 어시스턴트 프리셋 | F005 (chat) | 채팅 어시스턴트에 프리셋 적용 |
| 파일 관리 API | 전역 | FileManager를 통한 파일 CRUD |

---

## 13. For /speckit.specify

- 6개 하위 기능은 독립적이므로 각각 SBI 범위 내에서 specify 가능
- Code Tools: CLI_TOOLS 상수 기반 도구 목록, 프로바이더별 환경 변수 매핑 로직 이해 필수
- Paintings: 프로바이더별 API 차이가 크므로 NewApiPage를 범용 구현으로 통합 검토
- Notes: TipTap 에디터 + 파일 시스템 연동. 파일 감시(FileChangeEvent) 고려
- Files: Dexie → better-sqlite3 마이그레이션. useLiveQuery → IPC 기반 쿼리로 전환
- MCP: MCP 프로토콜 서버 관리. npx/docker/sse 타입별 프로세스 관리 로직
- Store: 외부 마켓플레이스 API 의존 (GitHub JSON 등)

---

## 14. For /speckit.plan

- Phase 1: Notes — 파일 트리 + TipTap 에디터 기본 구현
- Phase 2: Files — 파일 목록/필터/정렬/삭제
- Phase 3: Code Tools — CLI 도구 선택, 환경 변수, Launch
- Phase 4: MCP Servers — 서버 CRUD, 활성화/비활성화
- Phase 5: Paintings — 프로바이더 라우팅, 이미지 생성 기본
- Phase 6: Assistant Store — 마켓플레이스 연동, 프리셋 가져오기
- Phase 7: MCP 마켓플레이스, 도구/리소스/프롬프트 표시
- 각 하위 기능은 독립적이므로 병렬 진행 가능

---

## 15. For /speckit.analyze

- 복잡도 분석: 6개 독립 하위 기능 → Feature 분리 검토 가치가 있으나, 각각이 작으므로 catch-all 유지
- Code Tools 보안: API 키가 환경 변수로 CLI 프로세스에 전달. safeStorage 암호화 해제 후 전달
- Paintings 프로바이더: 프로바이더별 페이지가 중복 코드 많음. 공통 추상화 계층 설계 권장
- Notes: 파일 시스템 기반이므로 충돌/동기화 문제 가능. debounce 자동 저장 + 파일 감시
- MCP: 프로세스 라이프사이클 관리(시작/중지/재시작/크래시 복구) 복잡
- Files: 기존 Dexie useLiveQuery 패턴 → IPC 기반 쿼리로 전환 시 실시간성 저하 가능
