# F005 — Chat Conversation Pre-Context

> **모드**: Rebuild, New Stack
> **소스 루트**: `/Users/coolhero/Develop/cherry-studio`

---

## 1. 요약 (Brief Summary)

앱의 핵심 Feature로, 채팅 메인 페이지(사이드바 + 메시지 영역 + 입력 바), 메시지 렌더링(마크다운, 코드 블록, 인용, 사고 과정, 도구 호출, 이미지, 파일, 비디오), Vercel AI SDK 기반 스트리밍 응답, 토픽 관리(생성/이름 변경/삭제/재정렬/고정), 어시스턴트 관리(생성/편집/삭제/프리셋), InputBar(TipTap 리치 에디터, 도구 툴바, 파일 첨부, @멘션, 웹 검색 토글, KB 토글)를 포함한다. SBI 수가 가장 많은 최대 규모 Feature이다.

---

## 2. 런타임 탐색 결과 (Runtime Exploration Results)

| 항목 | 관찰 결과 |
|------|----------|
| 레이아웃 | Navbar(top) + Sidebar(left: Assistants/Topics 탭 전환) + Chat Main |
| Sidebar 좌측 | "Assistants" / "Topics" 탭 전환 |
| Assistants 탭 | "+ Add Assistant" 버튼, assistant 리스트 (emoji + 이름 + 컨텍스트 메뉴) |
| Topics 탭 | Search input, topic 리스트 (드래그 가능) |
| Navbar 중앙 | 현재 assistant 이름 + model 이름 (클릭으로 모델 전환) |
| InputBar | textarea + 툴바 (파일첨부, 웹검색, 글로벌, 코드, @mention, 이미지, 카메라 등) |
| 기본 assistant | "Default Assistant" (emoji: 😀) |
| 기본 모델 표시 | "Qwen3-Next-80B \| CherryIN" |
| Welcome 메시지 | "Hello, I'm Default Assistant. You can start chatting with me right away" |
| Assistants 패널 너비 | 275px (--assistants-width) |
| Topics 리스트 너비 | 275px (--topic-list-width) |

---

## 3. 소스 참조 (Source Reference)

| File Path | Role | Rebuild Target |
|-----------|------|----------------|
| src/renderer/src/pages/home/HomePage.tsx | 홈 페이지 메인 컴포넌트 (Navbar + Tabs + Chat 조합) | TBD |
| src/renderer/src/pages/home/Chat.tsx | 채팅 영역 (Messages + InputBar + ContentSearch) | TBD |
| src/renderer/src/pages/home/Navbar.tsx | 홈 전용 Navbar (assistant 이름, 모델, 토글 버튼들) | TBD |
| src/renderer/src/pages/home/Tabs/index.tsx | HomeTabs 컨테이너 (Assistants/Topics/Sessions 탭 전환) | TBD |
| src/renderer/src/pages/home/Tabs/AssistantsTab.tsx | 어시스턴트 목록 탭 | TBD |
| src/renderer/src/pages/home/Tabs/TopicsTab.tsx | 토픽 목록 탭 | TBD |
| src/renderer/src/pages/home/Tabs/SessionsTab.tsx | 에이전트 세션 탭 | TBD |
| src/renderer/src/pages/home/Messages/Messages.tsx | 메시지 목록 렌더링 (무한 스크롤, 그룹화) | TBD |
| src/renderer/src/pages/home/Messages/Message.tsx | 개별 메시지 컴포넌트 | TBD |
| src/renderer/src/pages/home/Messages/MessageContent.tsx | 메시지 콘텐츠 렌더링 (블록 기반) | TBD |
| src/renderer/src/pages/home/Messages/MessageGroup.tsx | 메시지 그룹 (user + assistant 응답 쌍) | TBD |
| src/renderer/src/pages/home/Messages/MessageMenubar.tsx | 메시지 액션 바 (복사, 재생성, 편집, 삭제 등) | TBD |
| src/renderer/src/pages/home/Messages/MessageHeader.tsx | 메시지 헤더 (모델명, 타임스탬프) | TBD |
| src/renderer/src/pages/home/Messages/MessageEditor.tsx | 메시지 인라인 편집 | TBD |
| src/renderer/src/pages/home/Messages/MessageImage.tsx | 이미지 메시지 표시 | TBD |
| src/renderer/src/pages/home/Messages/MessageVideo.tsx | 비디오 메시지 표시 | TBD |
| src/renderer/src/pages/home/Messages/MessageSelect.tsx | 메시지 다중 선택 | TBD |
| src/renderer/src/pages/home/Messages/MessageTranslate.tsx | 메시지 번역 | TBD |
| src/renderer/src/pages/home/Messages/MessageTokens.tsx | 토큰 사용량 표시 | TBD |
| src/renderer/src/pages/home/Messages/CitationsList.tsx | 인용 목록 렌더링 | TBD |
| src/renderer/src/pages/home/Messages/ChatNavigation.tsx | 채팅 내 내비게이션 (위/아래 스크롤) | TBD |
| src/renderer/src/pages/home/Messages/Prompt.tsx | 시스템 프롬프트 표시 | TBD |
| src/renderer/src/pages/home/Messages/NarrowLayout.tsx | 좁은 화면 레이아웃 | TBD |
| src/renderer/src/pages/home/Messages/SelectionBox.tsx | 다중 선택 UI | TBD |
| src/renderer/src/pages/home/Messages/Blocks/ | 메시지 블록 렌더링 (Text, Image, Code, Thinking, Tool, Citation, Error, File, Video, Placeholder, Compact, Translation) | TBD |
| src/renderer/src/pages/home/Inputbar/Inputbar.tsx | 메시지 입력 바 (메인) | TBD |
| src/renderer/src/pages/home/Inputbar/InputbarTools.tsx | 입력 바 툴바 (파일, 웹검색, KB, 이미지 등) | TBD |
| src/renderer/src/pages/home/Inputbar/KnowledgeBaseInput.tsx | KB 선택 입력 | TBD |
| src/renderer/src/pages/home/Inputbar/MentionModelsInput.tsx | @멘션 모델 입력 | TBD |
| src/renderer/src/pages/home/Inputbar/SendMessageButton.tsx | 전송 버튼 (Enter/Shift+Enter 분기) | TBD |
| src/renderer/src/pages/home/Inputbar/TokenCount.tsx | 입력 토큰 수 표시 | TBD |
| src/renderer/src/pages/home/Inputbar/AttachmentPreview.tsx | 첨부 파일 미리보기 | TBD |
| src/renderer/src/pages/home/Inputbar/components/ | InputbarCore 등 서브 컴포넌트 | TBD |
| src/renderer/src/pages/home/Inputbar/tools/ | 입력 바 도구 (각 도구별 컴포넌트) | TBD |
| src/renderer/src/pages/home/Inputbar/context/ | InputbarToolsProvider (도구 상태 컨텍스트) | TBD |
| src/renderer/src/pages/home/Inputbar/hooks/ | 입력 바 관련 훅 | TBD |
| src/renderer/src/pages/home/components/ChatNavBar/ | 채팅 전용 Navbar 컴포넌트 | TBD |
| src/renderer/src/pages/home/components/SelectModelButton.tsx | 모델 선택 버튼 (Navbar) | TBD |
| src/renderer/src/pages/home/components/AssistantsDrawer.tsx | 어시스턴트 서랍 (left 모드) | TBD |
| src/renderer/src/pages/home/Markdown/ | 마크다운 렌더링 컴포넌트 | TBD |
| src/renderer/src/pages/home/Messages/Tools/ | 도구 호출 결과 렌더링 | TBD |
| src/renderer/src/store/assistants.ts | 어시스턴트 상태 (Redux slice) | TBD |
| src/renderer/src/store/newMessage.ts | 메시지 상태 관리 | TBD |
| src/renderer/src/store/messageBlock.ts | 메시지 블록 상태 관리 | TBD |
| src/renderer/src/store/runtime.ts | 런타임 상태 (활성 토픽, 에이전트 등) | TBD |
| src/renderer/src/store/thunk/messageThunk.ts | 메시지 전송/저장 thunk | TBD |
| src/renderer/src/services/ApiService.ts | API 호출 서비스 (AI 프로바이더 통합) | TBD |
| src/renderer/src/services/MessagesService.ts | 메시지 유틸리티 서비스 | TBD |
| src/renderer/src/services/AssistantService.ts | 어시스턴트 유틸리티 서비스 | TBD |
| src/renderer/src/services/EventService.ts | 이벤트 버스 (EventEmitter) | TBD |
| src/renderer/src/services/TokenService.ts | 토큰 수 추정 | TBD |
| src/renderer/src/services/WebSearchService.ts | 웹 검색 서비스 | TBD |
| src/renderer/src/services/FileManager.ts | 파일 관리 서비스 | TBD |
| src/renderer/src/services/CacheService.ts | 캐시 서비스 | TBD |
| src/renderer/src/services/NavigationService.ts | 프로그래밍 방식 라우트 이동 | TBD |
| src/renderer/src/hooks/useAssistant.ts | 어시스턴트 관련 훅 | TBD |
| src/renderer/src/hooks/useTopic.ts | 토픽 관련 훅 | TBD |
| src/renderer/src/hooks/useMessageOperations.ts | 메시지 작업 훅 (전송, 로딩, 삭제 등) | TBD |
| src/renderer/src/hooks/useStreaming.ts | 스트리밍 응답 처리 훅 | TBD |
| src/renderer/src/hooks/useChatContext.ts | 채팅 컨텍스트 훅 | TBD |
| src/renderer/src/hooks/useScrollPosition.ts | 스크롤 위치 관리 훅 | TBD |
| src/renderer/src/hooks/useInputText.ts | 입력 텍스트 관리 훅 | TBD |
| src/renderer/src/hooks/useShortcuts.ts | 단축키 훅 | TBD |
| src/renderer/src/databases/ | IndexedDB 데이터베이스 (메시지, 토픽 등) | TBD |
| src/renderer/src/components/ContentSearch.tsx | 채팅 내 검색 | TBD |
| src/renderer/src/components/Popups/MultiSelectionPopup.tsx | 다중 선택 액션 팝업 | TBD |
| src/renderer/src/components/Popups/PromptPopup.tsx | 프롬프트 팝업 | TBD |
| src/renderer/src/components/Popups/SelectModelPopup.tsx | 모델 선택 팝업 | TBD |
| src/renderer/src/components/Popups/SearchPopup.tsx | 검색 팝업 | TBD |
| src/renderer/src/components/QuickPanel/ | 빠른 패널 (/ 명령어) | TBD |

---

## 4. 소스 행위 목록 (Source Behavior Inventory)

| ID | Source File | Function/Method | Behavior Description | Priority | Origin |
|----|------------|-----------------|---------------------|----------|--------|
| B121 | HomePage.tsx | HomePage() | 홈 페이지 조합 (activeAssistant, activeTopic 상태 관리) | P0 | source |
| B122 | HomePage.tsx | setActiveAssistant() | 어시스턴트 전환 → 해당 토픽 로드 | P0 | source |
| B123 | HomePage.tsx | setActiveTopic() | 토픽 전환 → 메시지 로드, 스크롤 위치 복원 | P0 | source |
| B124 | Chat.tsx | Chat() | 채팅 영역 레이아웃 (Messages + InputBar + Topics sidebar) | P0 | source |
| B125 | Chat.tsx | ContentSearch | 채팅 내 메시지 검색 (Ctrl+F) | P1 | source |
| B126 | Chat.tsx | useShortcut | 키보드 단축키 바인딩 (검색, 새 토픽 등) | P1 | source |
| B127 | Navbar.tsx | HeaderNavbar() | 홈 Navbar (assistant 이름, model 선택, 사이드바 토글) | P0 | source |
| B128 | Navbar.tsx | toggleShowAssistants | 어시스턴트 사이드바 표시/숨김 | P1 | source |
| B129 | Navbar.tsx | toggleShowTopics | 토픽 사이드바 표시/숨김 | P1 | source |
| B130 | AssistantsTab.tsx | AssistantsTab() | 어시스턴트 목록 렌더링, 추가 버튼, DnD 정렬 | P0 | source |
| B131 | TopicsTab.tsx | TopicsTab() | 토픽 목록 렌더링, 검색, DnD 정렬, 컨텍스트 메뉴 | P0 | source |
| B132 | Messages.tsx | Messages() | 메시지 목록 렌더링 (InfiniteScroll, 그룹화, 로드 더) | P0 | source |
| B133 | Messages.tsx | handleScroll | 스크롤 위치 저장/복원 | P1 | source |
| B134 | Messages.tsx | displayMessages | 표시할 메시지 상태 관리 (페이지네이션) | P0 | source |
| B135 | MessageGroup.tsx | MessageGroup() | 유저+어시스턴트 메시지 쌍 그룹 렌더링 | P0 | source |
| B136 | MessageContent.tsx | MessageContent() | 메시지 블록 기반 콘텐츠 렌더링 | P0 | source |
| B137 | Blocks/MainTextBlock.tsx | MainTextBlock() | 마크다운 텍스트 블록 렌더링 (react-markdown + remark-gfm + rehype-raw + shiki) | P0 | source |
| B138 | Blocks/ThinkingBlock.tsx | ThinkingBlock() | AI 사고 과정 블록 (접기/펼치기) | P1 | source |
| B139 | Blocks/ImageBlock.tsx | ImageBlock() | 이미지 블록 (확대, 다운로드) | P1 | source |
| B140 | Blocks/ToolBlock.tsx | ToolBlock() | 도구 호출 결과 블록 | P1 | source |
| B141 | Blocks/CitationBlock.tsx | CitationBlock() | 인용 블록 (출처 링크) | P1 | source |
| B142 | Blocks/FileBlock.tsx | FileBlock() | 파일 첨부 블록 | P1 | source |
| B143 | Blocks/VideoBlock.tsx | VideoBlock() | 비디오 블록 (인라인 재생) | P2 | source |
| B144 | Blocks/ErrorBlock.tsx | ErrorBlock() | 에러 블록 (오류 메시지 표시) | P1 | source |
| B145 | Blocks/CompactBlock.tsx | CompactBlock() | 컴팩트 모드 블록 | P2 | source |
| B146 | Blocks/TranslationBlock.tsx | TranslationBlock() | 번역 결과 블록 | P2 | source |
| B147 | Blocks/PlaceholderBlock.tsx | PlaceholderBlock() | 스트리밍 중 플레이스홀더 | P0 | source |
| B148 | MessageMenubar.tsx | MessageMenubar() | 메시지 액션 버튼 (복사, 재생성, 편집, 삭제, TTS, 번역) | P0 | source |
| B149 | MessageHeader.tsx | MessageHeader() | 메시지 헤더 (모델명, 프로바이더, 타임스탬프) | P1 | source |
| B150 | MessageEditor.tsx | MessageEditor() | 메시지 인라인 편집 (텍스트 수정 → 재전송) | P1 | source |
| B151 | MessageImage.tsx | MessageImage() | 이미지 메시지 갤러리 표시 | P1 | source |
| B152 | MessageSelect.tsx | MessageSelect() | 메시지 다중 선택 모드 (체크박스) | P2 | source |
| B153 | MessageTranslate.tsx | MessageTranslate() | 메시지 번역 UI | P2 | source |
| B154 | MessageTokens.tsx | MessageTokens() | 토큰 사용량 표시 | P2 | source |
| B155 | CitationsList.tsx | CitationsList() | 인용 출처 목록 (하단 표시) | P1 | source |
| B156 | ChatNavigation.tsx | ChatNavigation() | 채팅 위/아래 스크롤 버튼 | P2 | source |
| B157 | NarrowLayout.tsx | NarrowLayout() | 좁은 화면 반응형 레이아웃 | P2 | source |
| B158 | Prompt.tsx | Prompt() | 시스템 프롬프트 표시 영역 | P1 | source |
| B159 | Inputbar.tsx | Inputbar() | 메시지 입력 바 (TipTap 에디터, 전송 로직) | P0 | source |
| B160 | Inputbar.tsx | onSend() | 메시지 전송 (텍스트 + 파일 + 도구 설정 → sendMessage thunk) | P0 | source |
| B161 | Inputbar.tsx | 파일 첨부 처리 | 파일 드롭/선택 → FileManager → 미리보기 표시 | P1 | source |
| B162 | Inputbar.tsx | 토픽 자동 생성 | 첫 메시지 전송 시 getDefaultTopic()으로 새 토픽 생성 | P0 | source |
| B163 | InputbarTools.tsx | InputbarTools() | 입력 바 도구 툴바 (파일, 웹검색, KB, 이미지, 카메라 등) | P0 | source |
| B164 | KnowledgeBaseInput.tsx | KB 선택 | Knowledge Base 선택 드롭다운 (F006 연동) | P1 | source |
| B165 | MentionModelsInput.tsx | @멘션 | @모델명 입력으로 다른 모델에 질문 전달 | P1 | source |
| B166 | SendMessageButton.tsx | 전송 버튼 | Enter/Shift+Enter 분기 (설정에 따라) | P0 | source |
| B167 | TokenCount.tsx | 토큰 수 | 현재 입력의 예상 토큰 수 표시 | P2 | source |
| B168 | AttachmentPreview.tsx | 첨부 미리보기 | 첨부된 파일 썸네일/목록 표시 | P1 | source |
| B169 | assistants.ts | addAssistant() | 새 어시스턴트 생성 (이름, emoji, 프롬프트, 모델) | P0 | source |
| B170 | assistants.ts | removeAssistant() | 어시스턴트 삭제 | P1 | source |
| B171 | assistants.ts | updateAssistant() | 어시스턴트 정보 수정 | P0 | source |
| B172 | assistants.ts | updateDefaultAssistant() | 기본 어시스턴트 설정 변경 | P1 | source |
| B173 | assistants.ts | addTopic() | 어시스턴트에 토픽 추가 | P0 | source |
| B174 | assistants.ts | removeTopic() | 토픽 삭제 | P0 | source |
| B175 | assistants.ts | updateTopic() | 토픽 이름 변경 등 | P0 | source |
| B176 | assistants.ts | reorderTopics() | 토픽 순서 변경 | P1 | source |
| B177 | newMessage.ts | 메시지 상태 관리 | 메시지 CRUD, 스트리밍 메시지 상태 | P0 | source |
| B178 | messageBlock.ts | 블록 상태 관리 | 메시지 블록 CRUD (EntityAdapter) | P0 | source |
| B179 | messageThunk.ts | sendMessage() | 메시지 전송 thunk (API 호출, 스트리밍, DB 저장) | P0 | source |
| B180 | messageThunk.ts | saveMessageAndBlocksToDB() | 메시지 + 블록 DB 저장 | P0 | source |
| B181 | runtime.ts | setActiveAgentId() | 활성 에이전트 ID 설정 | P1 | source |
| B182 | runtime.ts | setActiveTopicOrSessionAction() | 토픽/세션 전환 | P0 | source |
| B183 | ApiService.ts | API 호출 | AI 프로바이더 API 호출 (Vercel AI SDK) | P0 | source |
| B184 | MessagesService.ts | getUserMessage() | 사용자 메시지 객체 생성 | P0 | source |
| B185 | MessagesService.ts | getGroupedMessages() | 메시지 그룹화 (user + assistant 쌍) | P0 | source |
| B186 | MessagesService.ts | getContextCount() | 컨텍스트 윈도우 메시지 수 계산 | P1 | source |
| B187 | AssistantService.ts | getDefaultAssistant() | 기본 어시스턴트 객체 반환 | P0 | source |
| B188 | AssistantService.ts | getDefaultTopic() | 기본 토픽 객체 생성 | P0 | source |
| B189 | TokenService.ts | estimateTextTokens() | 텍스트 토큰 수 추정 | P1 | source |
| B190 | TokenService.ts | estimateHistoryTokens() | 대화 히스토리 토큰 수 추정 | P1 | source |
| B191 | EventService.ts | EventEmitter | 이벤트 버스 (SHOW_TOPIC_SIDEBAR, NEW_TOPIC 등) | P1 | source |
| B192 | useTopic.ts | autoRenameTopic() | 첫 메시지 기반 토픽 자동 이름 변경 | P1 | source |
| B193 | useAssistant.ts | useAssistant() | 어시스턴트 읽기/수정 훅 | P0 | source |
| B194 | useMessageOperations.ts | 메시지 작업 | 전송, 삭제, 편집, 재생성, 중지 | P0 | source |
| B195 | useChatContext.ts | useChatContext() | 채팅 컨텍스트 (다중 선택 모드 등) | P1 | source |
| B196 | useInputText.ts | useInputText() | 입력 텍스트 상태 + TipTap 에디터 연동 | P0 | source |
| B197 | ContentSearch.tsx | ContentSearch() | 채팅 내 텍스트 검색 (하이라이트, 이전/다음) | P1 | source |
| B198 | SelectModelPopup.tsx | SelectModelPopup() | Navbar에서 모델 선택 팝업 | P0 | source |
| B199 | MultiSelectionPopup.tsx | MultiSelectActionPopup() | 다중 선택 시 일괄 액션 (삭제, 내보내기 등) | P2 | source |
| B200 | QuickPanel/ | QuickPanel() | / 명령어로 빠른 액션 (프롬프트 삽입, 모델 전환 등) | P2 | source |

---

## 5. UI 컴포넌트 기능 (UI Component Features)

| 컴포넌트 | 기능 설명 |
|---------|----------|
| HomePage | 홈 페이지 루트 (Navbar + HomeTabs + Chat 조합) |
| HomeTabs | 좌측 사이드바 (Assistants/Topics 탭 전환) |
| AssistantsTab | 어시스턴트 목록 (추가, 선택, DnD 정렬, 컨텍스트 메뉴) |
| TopicsTab | 토픽 목록 (검색, 선택, DnD 정렬, 컨텍스트 메뉴, 핀) |
| Chat | 채팅 영역 (Messages + InputBar + ContentSearch) |
| Messages | 메시지 리스트 (무한 스크롤, 그룹화, 스크롤 위치 복원) |
| MessageGroup | 유저-어시스턴트 메시지 쌍 그룹 |
| Message/MessageContent | 개별 메시지 (블록 기반 렌더링) |
| MessageMenubar | 메시지 호버 시 액션 바 (복사, 재생성, 편집, 삭제 등) |
| Blocks (12종) | MainText, Thinking, Image, Tool, Citation, File, Video, Error, Compact, Translation, Placeholder, ToolGroup |
| Inputbar | 메시지 입력 (TipTap 에디터 + 전송 버튼) |
| InputbarTools | 입력 바 하단 도구 (파일, 웹검색, KB, 이미지, @멘션) |
| AttachmentPreview | 첨부 파일 미리보기 |
| ContentSearch | 채팅 내 검색 바 (Ctrl+F) |
| SelectModelButton | Navbar 모델 선택 버튼 |
| AssistantsDrawer | 어시스턴트 서랍 (left 모드) |
| QuickPanel | / 명령어 패널 |

---

## 6. 인터랙션 행위 목록 (Interaction Behavior Inventory)

| 인터랙션 | 트리거 | 결과 |
|---------|--------|------|
| 메시지 전송 | Enter (또는 Shift+Enter) | 사용자 메시지 추가 → AI 스트리밍 응답 시작 |
| 스트리밍 중지 | Stop 버튼 | 스트리밍 중단, 현재까지 수신한 응답 유지 |
| 메시지 재생성 | 메시지 메뉴바 재생성 버튼 | 마지막 AI 응답 삭제 → 재요청 |
| 메시지 편집 | 메시지 메뉴바 편집 버튼 | 인라인 편집 모드 → 수정 후 재전송 |
| 메시지 복사 | 메시지 메뉴바 복사 버튼 | 클립보드에 복사 |
| 메시지 삭제 | 메시지 메뉴바 삭제 버튼 | 확인 후 삭제 |
| 어시스턴트 전환 | Assistants 탭에서 클릭 | 활성 어시스턴트 변경 → 해당 토픽 로드 |
| 어시스턴트 추가 | "+ Add Assistant" 클릭 | 새 어시스턴트 생성 |
| 토픽 전환 | Topics 탭에서 클릭 | 활성 토픽 변경 → 메시지 로드 |
| 토픽 생성 | 첫 메시지 전송 시 자동 | 새 토픽 생성 → 자동 이름 지정 |
| 토픽 이름 변경 | 컨텍스트 메뉴 → Rename | 인라인 편집 |
| 토픽 삭제 | 컨텍스트 메뉴 → Delete | 확인 후 삭제 |
| 토픽 재정렬 | DnD | 토픽 순서 변경 |
| 모델 선택 | Navbar 모델 이름 클릭 | SelectModelPopup 표시 → 모델 선택 |
| 파일 첨부 | 도구바 클릭 또는 DnD | FileManager로 업로드 → 미리보기 표시 |
| @멘션 | 입력 바에서 @입력 | 모델 선택 드롭다운 표시 |
| 채팅 내 검색 | Ctrl+F | ContentSearch 바 표시, 하이라이트 |
| 다중 선택 | 메시지 체크박스 | 선택 모드 활성 → 일괄 액션 가능 |
| 사이드바 토글 | Navbar 토글 버튼 | Assistants/Topics 사이드바 표시/숨김 |

---

## 7. 컴포넌트 트리 (Component Tree)

```
HomePage
├── Navbar (HomeNavbar)
│   ├── NavbarLeft
│   │   ├── ToggleAssistantsButton
│   │   └── AssistantsDrawer (left 모드)
│   ├── NavbarCenter
│   │   ├── AssistantName
│   │   └── SelectModelButton → SelectModelPopup
│   └── NavbarRight
│       ├── SearchButton → SearchPopup
│       ├── NarrowModeToggle
│       ├── ToggleTopicsButton
│       └── UpdateAppButton
├── HomeTabs (사이드바)
│   ├── AssistantsTab
│   │   ├── AddAssistantButton
│   │   └── AssistantList (DnD sortable)
│   │       └── AssistantItem[] (emoji + name + ContextMenu)
│   ├── TopicsTab
│   │   ├── SearchInput
│   │   └── TopicList (DnD sortable)
│   │       └── TopicItem[] (name + ContextMenu)
│   └── SessionsTab (에이전트)
└── Chat
    ├── ContentSearch (Ctrl+F)
    ├── Messages
    │   ├── Prompt (시스템 프롬프트)
    │   └── MessageGroup[]
    │       ├── Message (user)
    │       │   ├── MessageHeader
    │       │   ├── MessageContent → Blocks[]
    │       │   └── MessageMenubar
    │       └── Message (assistant)
    │           ├── MessageHeader
    │           ├── MessageContent → Blocks[]
    │           │   ├── MainTextBlock (markdown)
    │           │   ├── ThinkingBlock
    │           │   ├── ImageBlock
    │           │   ├── ToolBlock / ToolBlockGroup
    │           │   ├── CitationBlock
    │           │   ├── FileBlock
    │           │   ├── VideoBlock
    │           │   ├── ErrorBlock
    │           │   └── PlaceholderBlock (스트리밍 중)
    │           ├── MessageMenubar
    │           ├── MessageTokens
    │           └── CitationsList
    ├── ChatNavigation (위/아래 스크롤)
    ├── Topics (topicPosition=right 시)
    └── Inputbar
        ├── InputbarCore (TipTap Editor)
        ├── MentionModelsInput
        ├── KnowledgeBaseInput
        ├── AttachmentPreview
        ├── InputbarTools
        │   ├── FileAttachTool
        │   ├── WebSearchTool
        │   ├── KBTool
        │   ├── ImageTool
        │   ├── CameraTool
        │   └── ... (기타 도구)
        ├── TokenCount
        └── SendMessageButton
```

---

## 8. 데이터 생명주기 패턴 (Data Lifecycle Patterns)

| 데이터 | 저장소 | 생성 시점 | 읽기 시점 | 갱신 시점 | 삭제 시점 |
|--------|--------|----------|----------|----------|----------|
| Assistant | Redux persist (localStorage) → Zustand | 사용자 추가 또는 최초 실행 (기본 어시스턴트) | 홈 페이지 렌더링 | 사용자 편집 | 사용자 삭제 |
| Topic | Assistant.topics[] (Redux persist) | 첫 메시지 전송 시 자동 생성 | 토픽 탭 렌더링 | 이름 변경, 재정렬 | 사용자 삭제 |
| Message | better-sqlite3 (main process) via Drizzle ORM | 메시지 전송/수신 시 | 토픽 선택 시 로드 | 편집 시 | 사용자 삭제, 토픽 삭제 시 |
| MessageBlock | better-sqlite3 (main process) | 메시지 생성/스트리밍 수신 시 | 메시지 렌더링 시 | 스트리밍 업데이트 | 메시지 삭제 시 |
| Draft (입력 중 텍스트) | Zustand persist (localStorage) | 입력 시작 | 토픽 전환 시 복원 | 입력 변경 | 전송 시 삭제 |
| 스크롤 위치 | 메모리 (useScrollPosition) | 스크롤 시 | 토픽 재진입 시 | 스크롤 시 | 토픽 삭제 |
| 첨부 파일 | 파일시스템 (FileStorage) | 파일 선택/드롭 | 미리보기, 메시지 전송 | N/A | 세션 종료 |

---

## 9. 네이밍 리매핑 (Naming Remapping: Cherry → Angdu)

| 위치 | Cherry 원본 | Angdu 대상 |
|------|------------|-----------|
| Welcome 메시지 | Cherry Studio 관련 텍스트 없음 (generic) | 변경 불필요 |
| 해당 Feature에 직접적인 Cherry 브랜딩 없음 | — | — |

> F005는 채팅 로직으로, Cherry 브랜딩이 직접 노출되는 곳이 없다. 모델 표시에서 "CherryIN" 프로바이더 이름이 보이나 이는 F004 영역이다.

---

## 10. 정적 리소스 (Static Resources)

| 리소스 | 경로 | 용도 |
|--------|------|------|
| Lucide Icons | lucide-react | Menu, PanelLeftClose, PanelRightClose, Search 등 |
| Emoji | 시스템 이모지 | 어시스턴트 아이콘 |
| Shiki | shiki 패키지 | 코드 블록 구문 강조 |
| KaTeX | (사용 시) | 수학 수식 렌더링 |

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
| chat:sendMessage | 함수 | 메시지 전송 (외부에서 프로그래밍 방식 호출) | F006 (KB 질의 후 채팅) |
| assistant:list | 상태 | 어시스턴트 목록 | Settings (어시스턴트 관리) |
| topic:list | 상태 | 토픽 목록 | Settings (데이터 관리) |

### 의존하는 계약 (Imports)

| 계약 ID | 제공자 | 설명 |
|---------|--------|------|
| config:get/set | F001 | 채팅 설정 영속화 |
| theme | F001 | 채팅 UI 테마 적용 |
| route:navigate | F002 | 채팅 페이지 라우트 |
| navbar:position | F002 | 레이아웃 분기 (top/left) |
| settings:messageStyle | F003 | 메시지 표시 스타일 (bubble/plain) |
| settings:fontSize | F003 | 폰트 크기 |
| provider:list | F004 | 사용 가능한 프로바이더 목록 |
| provider:getApiKey | F004 | API 호출 시 키 복호화 |
| model:list | F004 | 사용 가능한 모델 목록 |
| model:default | F004 | 기본 모델 |

---

## 13. /speckit.specify 참고사항

- Redux (assistants.ts, newMessage.ts, messageBlock.ts, runtime.ts) → Zustand store로 전환
- @hello-pangea/dnd → @dnd-kit/sortable로 교체 (토픽/어시스턴트 DnD)
- TipTap 에디터: @tiptap/react, @tiptap/starter-kit, @tiptap/extension-placeholder, @tiptap/extension-mention
- 마크다운 렌더링: react-markdown + remark-gfm + rehype-raw + shiki (코드 하이라이트)
- 가상 스크롤: @tanstack/react-virtual (대량 메시지 성능)
- 메시지 블록 시스템: Message → MessageBlock[] (text, image, thinking, tool, citation, file, video, error)
- InfiniteScroll: 위로 스크롤 시 이전 메시지 로드 (LOAD_MORE_COUNT)
- 스트리밍: Vercel AI SDK의 streamText() → 청크 수신 → PlaceholderBlock → MainTextBlock 변환
- Agent Session은 별도 Feature로 분리 가능 (AgentSessionInputbar, AgentSessionMessages)

---

## 14. /speckit.plan 참고사항

- F001, F002, F004 완료 후 구현 (모델 선택, API 호출 의존)
- 구현 순서: HomePage 레이아웃 → AssistantsTab/TopicsTab → Messages 렌더링 → MessageBlocks → Inputbar → 스트리밍 → 토픽 관리 → 어시스턴트 관리
- 검증 순서: 메시지 전송 → 스트리밍 응답 수신 → 토픽 자동 생성 → 토픽 전환 → 어시스턴트 전환
- SBI가 80개로 가장 크므로 하위 단계(sub-phase) 분리 권장:
  - Phase A: 메시지 전송/수신 + 기본 렌더링
  - Phase B: 블록 시스템 + 마크다운
  - Phase C: 입력 바 도구 + 파일 첨부
  - Phase D: 토픽/어시스턴트 관리
  - Phase E: 검색, 다중 선택, QuickPanel

---

## 15. /speckit.analyze 참고사항

- assistants.ts에 @ts-nocheck가 있어 타입 안전성 문제 → Zustand 전환 시 완전한 타입 정의 필요
- ipc.ts에 메시지/토픽 관련 IPC 핸들러가 혼재 → F005 전용 IPC 모듈 분리 권장
- Messages.tsx의 InfiniteScroll은 react-infinite-scroll-component 사용 → @tanstack/react-virtual과 결합 전략 필요
- ChatFlowHistory.tsx, PermissionModeDisplay.tsx 등 agent 관련 컴포넌트 → F005 기본 범위 밖
- message 타입이 newMessage.ts의 Message 타입과 기존 타입이 혼재 → v2 리팩토링 타입으로 통일
- styled-components → Tailwind CSS 4 전환
- Ant Design (Flex, Alert, Tooltip) → shadcn/ui 교체
- preprocess.ts (store) 의 메시지 전처리 로직 확인 필요 (웹 검색, KB 컨텍스트 주입 등)
