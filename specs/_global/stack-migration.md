# Angdu Studio 스택 마이그레이션 가이드

## 마이그레이션 개요

| 카테고리 | Cherry Studio (현재) | Angdu Studio (신규) | 영향도 | 영향 Feature |
|---------|---------------------|---------------------|--------|-------------|
| UI 컴포넌트 | Ant Design (antd) | shadcn/ui + Radix UI | **High** | 전체 |
| 상태관리 | Redux Toolkit + redux-persist | Zustand + persist middleware | **Medium** | 전체 |
| 데이터 저장 | Dexie (IndexedDB, renderer) | better-sqlite3 via IPC (main) | **High** | F005, F006, F009, F010 |
| 스타일링 | styled-components | Tailwind CSS 4 | **Medium** | 전체 |
| LLM 통합 | LangChain + Vercel AI SDK | Vercel AI SDK only | **Medium** | F005, F006, F009 |
| 라우터 | React Router v6 | React Router v7 (HashRouter) | **Low** | F002 |

---

## 카테고리별 마이그레이션 상세

### 1. Ant Design → shadcn/ui + Radix UI (High)

#### 영향 범위

Cherry Studio는 Ant Design을 전면적으로 사용한다. Button, Input, Select, Modal, Drawer, Dropdown, Table, Tabs, Form, Tooltip, Popover, Switch, Slider, ColorPicker 등 거의 모든 UI 요소가 antd에 의존한다.

#### 컴포넌트 매핑

| Ant Design | shadcn/ui | 비고 |
|-----------|-----------|------|
| Button | Button | variant 방식 유사 |
| Input | Input | 기본 제공 |
| Input.TextArea | Textarea | 별도 컴포넌트 |
| Select | Select | Radix UI 기반, 열거형 옵션 |
| Modal | Dialog | AlertDialog (확인/취소), Dialog (일반) |
| Drawer | Sheet | side prop으로 방향 제어 |
| Dropdown | DropdownMenu | Radix UI 기반 |
| Table | Table | 기본 제공, 정렬/필터는 직접 구현 |
| Tabs | Tabs | Radix UI 기반 |
| Form | (직접 구현) | react-hook-form + Zod 조합 권장 |
| Tooltip | Tooltip | Radix UI 기반 |
| Popover | Popover | Radix UI 기반 |
| Switch | Switch | Radix UI 기반 |
| Slider | Slider | Radix UI 기반 |
| ColorPicker | (직접 구현) | react-colorful 또는 커스텀 |
| message (toast) | Toast / Sonner | shadcn/ui의 toast 또는 sonner |
| Notification | Toast | 통합 |
| Spin | Skeleton / Spinner | 커스텀 로딩 컴포넌트 |
| Avatar | Avatar | 기본 제공 |
| Badge | Badge | 기본 제공 |
| Tag | Badge (variant) | Badge로 대체 |
| Divider | Separator | 기본 제공 |
| Collapse | Accordion | Radix UI 기반 |
| Menu | (NavigationMenu 또는 커스텀) | 사이드바용 |
| Progress | Progress | 기본 제공 |
| Segmented | ToggleGroup | Radix UI 기반 |
| Card | Card | 기본 제공 |
| Checkbox | Checkbox | Radix UI 기반 |
| Radio | RadioGroup | Radix UI 기반 |
| InputNumber | Input (type="number") | 커스텀 증감 버튼 |
| List | (직접 구현) | Tailwind로 스타일링 |
| Empty | (직접 구현) | 빈 상태 컴포넌트 |
| Space | flex gap-* | Tailwind 유틸리티로 대체 |
| Row/Col | grid / flex | Tailwind 레이아웃으로 대체 |
| ConfigProvider | ThemeProvider | CSS 변수 기반 테마 |

#### API 차이점

1. **이벤트 핸들러**: antd는 `onChange(value)`, shadcn/ui (Radix)는 `onValueChange(value)` — 이름이 다름
2. **제어 컴포넌트**: antd는 `value/onChange`, shadcn/ui도 동일 패턴이지만 Radix의 `open/onOpenChange` 등 추가 제어
3. **Form 통합**: antd Form은 자체 검증 시스템, shadcn/ui는 react-hook-form + Zod 별도 연동
4. **테마**: antd는 ConfigProvider + token 시스템, shadcn/ui는 CSS 변수 + Tailwind
5. **아이콘**: antd는 @ant-design/icons, Angdu는 lucide-react 사용

#### 마이그레이션 전략

1. shadcn/ui CLI로 필요한 컴포넌트를 프로젝트에 추가 (`npx shadcn@latest add button`)
2. 컴포넌트별 1:1 교체 (antd → shadcn/ui 매핑 테이블 참조)
3. 복합 컴포넌트 (Form, Table with sort/filter)는 직접 조합
4. antd 전용 기능 (ConfigProvider locale, message.success 등)은 커스텀 구현
5. antd CSS 의존성 완전 제거

---

### 2. Redux Toolkit → Zustand (Medium)

#### 영향 범위

Cherry Studio는 Redux Toolkit + redux-persist로 전체 앱 상태를 관리한다. 22개 slice (assistants, settings, llm, mcp, memory, knowledge, tabs 등)가 rootReducer로 결합된다.

#### 패턴 변경

| Redux Toolkit | Zustand | 비고 |
|--------------|---------|------|
| createSlice | create() | 슬라이스 → 독립 store |
| reducer + action | set/get 직접 접근 | 보일러플레이트 감소 |
| useSelector | useStore(selector) | 선택자 패턴 유사 |
| useDispatch + dispatch(action) | store.action() | 직접 호출 |
| createAsyncThunk | async 함수 in store | store 내 비동기 액션 |
| combineReducers | 별도 store 파일 | Feature별 독립 |
| redux-persist | persist middleware | zustand/middleware |
| StoreSyncService | (커스텀 구현) | 윈도우 간 동기화 |
| middleware | middleware | Zustand도 미들웨어 지원 |

#### Store 분리 전략

Cherry Studio의 단일 rootReducer를 Feature별 독립 store로 분리한다:

| Redux Slice | Zustand Store | Feature |
|------------|--------------|---------|
| settings | useSettingsStore | F003 |
| llm (providers) | useProviderStore | F004 |
| assistants | useAssistantStore | F005 |
| tabs | useTabStore | F002 |
| knowledge | useKnowledgeStore | F006 |
| mcp | useMcpStore | F008 |
| memory | useMemoryStore | F009 |
| translate | useTranslateStore | F007 |
| paintings | usePaintingStore | F008 |
| shortcuts | useShortcutStore | F003 |
| runtime | useRuntimeStore | F001 |
| messages | (SQLite, IPC) | F005 |
| messageBlocks | (SQLite, IPC) | F005 |
| note | useNoteStore | F008 |
| ocr | useOcrStore | F007 |
| websearch | useWebSearchStore | F010 |
| selectionStore | useSelectionStore | F010 |
| codeTools | useCodeToolsStore | F008 |
| backup | useBackupStore | F003 |

#### Persist 마이그레이션

```typescript
// Cherry Studio (Redux)
const persistedReducer = persistReducer({
  key: 'cherry-studio',
  storage,  // localStorage
  version: 199,
  blacklist: ['runtime', 'messages', 'messageBlocks', 'tabs', 'toolPermissions'],
  migrate
}, rootReducer)

// Angdu Studio (Zustand)
const useProviderStore = create(
  persist(
    (set, get) => ({
      providers: [],
      // ... actions
    }),
    {
      name: 'angdu-provider',
      version: 1,
      migrate: (persisted, version) => { /* ... */ }
    }
  )
)
```

#### 윈도우 간 동기화

Cherry Studio의 StoreSyncService를 Zustand용으로 재구현해야 한다:
1. IPC를 통해 main process에서 상태 변경 중계
2. 특정 store만 동기화 (assistants, settings, llm 등)
3. BroadcastChannel API 또는 IPC relay 패턴

---

### 3. Dexie/IndexedDB → better-sqlite3 via IPC (High)

#### 영향 범위

Cherry Studio는 Message, MessageBlock을 Dexie (IndexedDB)로 renderer에서 직접 관리한다. Angdu Studio는 이를 main process의 better-sqlite3 + Drizzle ORM으로 이동한다.

#### 아키텍처 변경

```
Cherry Studio:
  renderer → Dexie → IndexedDB (renderer process)

Angdu Studio:
  renderer → IPC invoke → main process → Drizzle → better-sqlite3 → 파일
```

#### 스키마 마이그레이션

| Dexie (IndexedDB) | Drizzle (SQLite) | 비고 |
|-------------------|-----------------|------|
| db.messages | messages 테이블 | topicId, assistantId 인덱스 |
| db.messageBlocks | message_blocks 테이블 | messageId 인덱스, type 구분 |
| (없음, Redux) | topics 테이블 | assistantId 인덱스 |
| (없음, SQLite) | agents 테이블 | 이미 SQLite 사용 |
| (없음, SQLite) | agent_sessions 테이블 | 이미 SQLite 사용 |
| (없음, SQLite) | agent_session_messages 테이블 | 이미 SQLite 사용 |

#### IPC 래퍼 패턴

renderer에서 직접 DB 접근 대신 IPC 래퍼 함수를 사용한다:

```typescript
// Cherry Studio (renderer 직접 접근)
const messages = await db.messages.where('topicId').equals(topicId).toArray()

// Angdu Studio (IPC 경유)
const messages = await window.api.invoke('message:getByTopic', topicId)
```

#### 성능 고려사항

1. **Batch 조회**: 메시지 목록은 페이지네이션으로 조회 (한 번에 전체 로드하지 않음)
2. **캐싱**: 현재 토픽의 메시지는 Zustand store에 캐시
3. **IPC 오버헤드**: 직렬화/역직렬화 비용 → 대량 데이터 전송 시 구조화된 클론 사용
4. **트랜잭션**: Drizzle 트랜잭션으로 메시지+블록 원자적 저장

#### 마이그레이션 순서

1. Drizzle 스키마 정의 (messages, message_blocks, topics 테이블)
2. main process에 서비스 계층 구현 (MessageService, TopicService)
3. IPC 핸들러 등록 (message:create, message:getByTopic 등)
4. renderer에서 Dexie 호출을 IPC 호출로 교체
5. Dexie 의존성 제거

---

### 4. styled-components → Tailwind CSS 4 (Medium)

#### 영향 범위

Cherry Studio는 styled-components로 커스텀 스타일을 작성하고, Ant Design의 기본 스타일 위에 오버라이드한다. Angdu Studio는 Tailwind CSS 4 유틸리티 클래스만 사용한다.

#### 변환 패턴

```tsx
// Cherry Studio (styled-components)
const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: var(--color-background);
  border-radius: 8px;
  &:hover {
    background: var(--color-background-soft);
  }
`

// Angdu Studio (Tailwind CSS 4)
<div className="flex flex-col p-4 bg-background rounded-lg hover:bg-muted">
```

#### 테마 통합

1. Cherry Studio의 CSS 변수 → Tailwind CSS 4의 `@theme` 블록으로 매핑
2. 다크 모드: `dark:` 변형으로 전환
3. shadcn/ui의 기본 테마 변수 활용 (--background, --foreground, --muted 등)

#### 마이그레이션 전략

1. styled-components 파일별로 Tailwind 유틸리티 클래스로 변환
2. 동적 스타일: `cn()` 유틸리티 (clsx + tailwind-merge) 사용
3. 복잡한 애니메이션: Tailwind의 `animate-*` 또는 CSS 모듈로 처리
4. 글로벌 스타일: `src/renderer/src/styles/globals.css`에 정의

---

### 5. LangChain → Vercel AI SDK only (Medium)

#### 영향 범위

Cherry Studio는 LangChain을 KB 임베딩, 청크 분할, 벡터 검색에 사용한다. Angdu Studio는 LangChain을 제거하고 Vercel AI SDK + 직접 구현으로 대체한다.

#### 기능 매핑

| LangChain 기능 | 대체 방안 | 비고 |
|---------------|----------|------|
| TextSplitter (RecursiveCharacterTextSplitter) | 직접 구현 (chunkSize, chunkOverlap) | 알고리즘 단순 |
| Embeddings (OpenAIEmbeddings 등) | Vercel AI SDK `embed()` / `embedMany()` | @ai-sdk/* 프로바이더 |
| VectorStore (MemoryVectorStore) | better-sqlite3 + 코사인 유사도 | 직접 구현 |
| Document | KnowledgeItem + 메타데이터 | 자체 타입 |
| RetrievalQAChain | 직접 구현 (검색 → 컨텍스트 주입 → 생성) | 제어력 향상 |

#### RAG 파이프라인 재구현

```
LangChain 방식:
  Document → TextSplitter → Embeddings → VectorStore → RetrievalQA

Angdu Studio 방식:
  KnowledgeItem → customChunker(chunkSize, chunkOverlap)
    → ai.embedMany(chunks, { model: embeddingModel })
    → better-sqlite3 INSERT (content, embedding vector)
    → 검색: ai.embed(query) → SQL 코사인 유사도 → top-N
    → 리랭킹: Rerank API 호출 (선택)
    → 컨텍스트 주입: streamText({ system: basePrompt + relevantChunks })
```

#### 벡터 저장 전략

better-sqlite3에 벡터를 BLOB으로 저장하고, 검색 시 애플리케이션 레벨에서 코사인 유사도를 계산한다:

```sql
CREATE TABLE kb_vectors (
  id TEXT PRIMARY KEY,
  kb_id TEXT NOT NULL,
  chunk_index INTEGER,
  content TEXT NOT NULL,
  embedding BLOB NOT NULL,  -- Float32Array serialized
  metadata TEXT,  -- JSON
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kb_id) REFERENCES knowledge_bases(id)
);
CREATE INDEX idx_kb_vectors_kb_id ON kb_vectors(kb_id);
```

---

### 6. React Router v6 → v7 (Low)

#### 영향 범위

HashRouter를 사용하며, 주요 변경은 API 이름 변경 수준이다.

#### 변경점

| v6 | v7 | 비고 |
|----|-----|------|
| `useNavigate()` | `useNavigate()` | 동일 |
| `<Routes>` | `<Routes>` | 동일 |
| `<Route>` | `<Route>` | 동일 |
| `createHashRouter` | `createHashRouter` | 동일 |
| `useParams` | `useParams` | 동일 |
| `RouterProvider` | `RouterProvider` | 동일 |

v7은 v6와 대부분 호환되며, `future` 플래그가 기본 활성화되는 정도의 차이만 있다. 마이그레이션 비용이 매우 낮다.

---

## Feature별 마이그레이션 노트

### F001: App Shell

- ConfigManager: electron-store → better-sqlite3 (영향: 설정 스키마 동일, 저장소만 변경)
- 테마: CSS 변수 체계를 shadcn/ui 기본 테마와 통합
- preload: IPC 채널 화이트리스트 재정의

### F002: Navigation

- Navbar/Tabs: Ant Design Menu/Tabs → shadcn/ui 커스텀 컴포넌트
- styled-components → Tailwind 유틸리티
- DnD: @dnd-kit 유지 (변경 없음)

### F003: Settings

- 설정 페이지: Ant Design Form/Switch/Select/Slider → shadcn/ui 동등 컴포넌트
- 가장 많은 UI 컴포넌트 교체 필요 (설정 항목이 많음)
- Backup 로직: 변경 없음 (main process)

### F004: Model Provider

- 프로바이더 CRUD UI: Ant Design → shadcn/ui
- Store: Redux llm slice → useProviderStore (Zustand)
- API key 암호화: AES → Electron safeStorage 전환 고려

### F005: Chat Conversation

- **가장 큰 마이그레이션**: Dexie → better-sqlite3 (메시지/블록 데이터 계층 전체 변경)
- 스트리밍 UI: styled-components → Tailwind
- TipTap: 유지 (변경 없음)
- MessageBlock 렌더링: Ant Design 의존 제거 → shadcn/ui + Tailwind

### F006: Knowledge Base

- LangChain 의존 제거: TextSplitter, Embeddings, VectorStore 직접 구현
- 벡터 저장: 이미 better-sqlite3 사용 중이므로 변경 최소
- UI: Ant Design → shadcn/ui

### F007: Translate

- UI: Ant Design → shadcn/ui (단순한 페이지)
- Store: Redux translate slice → useTranslateStore

### F008: Tools Workspace

- Paintings/Notes/Files/MCP: Ant Design → shadcn/ui
- Store: 여러 Redux slice → Feature별 Zustand store
- MCP 로직: 변경 없음 (main process)

### F009: Memory

- Store: Redux memory slice → useMemoryStore
- 벡터 저장: better-sqlite3 유지 (변경 없음)
- UI: Ant Design → shadcn/ui (메모리 관리 페이지)

### F010: Advanced Features

- Agent: 이미 SQLite + Express API 사용 중이므로 데이터 계층 변경 최소
- Selection UI: Ant Design → shadcn/ui (미니 윈도우)
- API Server: Express 유지 (변경 없음)

---

## 리스크 및 완화 전략

### High Risk

| 리스크 | 영향 | 완화 전략 |
|--------|------|----------|
| Dexie → SQLite IPC 성능 저하 | 메시지 로딩 속도 저하, 스크롤 버벅임 | 페이지네이션, 가상 스크롤 (@tanstack/react-virtual), 메시지 캐싱 |
| Ant Design 컴포넌트 누락 | 일부 기능 구현 불가 | shadcn/ui에 없는 컴포넌트는 Radix UI 직접 사용 또는 커스텀 구현 |
| LangChain 제거 후 RAG 품질 저하 | 검색 정확도 하락 | 직접 구현한 chunker/벡터 검색을 Cherry Studio 결과와 비교 테스트 |

### Medium Risk

| 리스크 | 영향 | 완화 전략 |
|--------|------|----------|
| Redux → Zustand 상태 구조 차이 | 데이터 호환 불가 | 마이그레이션 유틸리티로 Redux persist 데이터를 Zustand 형식으로 변환 (필요 시) |
| styled-components → Tailwind 스타일 누락 | UI 깨짐 | Feature별 시각적 비교 테스트, Cherry Studio 스크린샷 참조 |
| 윈도우 간 상태 동기화 | 동기화 누락 | StoreSyncService를 Zustand 미들웨어로 재구현, IPC relay 패턴 |

### Low Risk

| 리스크 | 영향 | 완화 전략 |
|--------|------|----------|
| React Router v7 호환성 | 라우팅 오류 | v6 → v7 마이그레이션 가이드 참조, 변경점 최소 |
| Biome 규칙 충돌 | 린트 에러 | biome.json 설정 조정 |
