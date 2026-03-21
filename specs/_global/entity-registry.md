# Angdu Studio 엔티티 레지스트리

## Entity Index

| 엔티티 | Feature | 저장소 (Cherry) | 저장소 (Angdu) | 설명 |
|--------|---------|----------------|---------------|------|
| AppConfig | F001 | electron-store (main) | better-sqlite3 via ConfigManager (main) | 앱 전역 설정 |
| Provider | F004 | Redux persist (localStorage) | Zustand persist (localStorage) | AI 프로바이더 설정 |
| Model | F004 | Redux persist (localStorage) | Zustand persist (localStorage) | AI 모델 메타데이터 |
| Assistant | F005 | Redux persist (localStorage) | Zustand persist (localStorage) | 어시스턴트 설정 및 프롬프트 |
| AssistantSettings | F005 | Redux persist (내장) | Zustand persist (내장) | 어시스턴트별 모델 파라미터 |
| Topic | F005 | Redux persist (localStorage) | better-sqlite3 via IPC (main) | 대화 토픽 |
| Message | F005 | Dexie (IndexedDB, renderer) | better-sqlite3 via Drizzle (main) | 대화 메시지 |
| MessageBlock | F005 | Dexie (IndexedDB, renderer) | better-sqlite3 via Drizzle (main) | 메시지 블록 (union type) |
| KnowledgeBase | F006 | Redux persist (localStorage) | Zustand persist (localStorage) | 지식베이스 메타데이터 |
| KnowledgeItem | F006 | Redux persist (내장) | Zustand persist (내장) | KB 항목 (file/url/note/sitemap/directory/video) |
| FileMetadata | F001 | Dexie / 파일시스템 | better-sqlite3 (main) + 파일시스템 | 파일 메타데이터 |
| MCPServer | F008 | Redux persist (localStorage) | Zustand persist (localStorage) | MCP 서버 설정 |
| Agent | F010 | SQLite (main, agents DB) | better-sqlite3 via Drizzle (main) | 에이전트 설정 |
| AgentSession | F010 | SQLite (main, agents DB) | better-sqlite3 via Drizzle (main) | 에이전트 세션 |
| AgentSessionMessage | F010 | SQLite (main, agents DB) | better-sqlite3 via Drizzle (main) | 에이전트 세션 메시지 |
| MemoryItem | F009 | SQLite (main, memory DB) | better-sqlite3 via Drizzle (main) | 시맨틱 메모리 항목 |
| TranslateHistory | F007 | Redux persist (localStorage) | Zustand persist (localStorage) | 번역 이력 |
| Painting | F008 | Redux persist (localStorage) | Zustand persist (localStorage) | 이미지 생성 이력 |
| Shortcut | F003 | electron-store (main) | better-sqlite3 via ConfigManager (main) | 키보드 단축키 |
| QuickPhrase | F005 | Redux persist (내장) | Zustand persist (내장) | 빠른 문구 |
| Backup | F003 | 파일시스템 / WebDAV / S3 | 파일시스템 / WebDAV / S3 | 백업 데이터 |

---

## 엔티티 상세

### AppConfig (F001)

앱 전역 설정을 관리하는 ConfigManager가 main process에서 better-sqlite3를 통해 영속화한다.

| 필드 | 타입 | 설명 |
|------|------|------|
| language | string | UI 언어 (ko, en, zh 등) |
| theme | ThemeMode ('light' \| 'dark' \| 'system') | 테마 모드 |
| zoomFactor | number | 화면 확대 비율 |
| launchOnBoot | boolean | 부팅 시 자동 실행 |
| launchToTray | boolean | 트레이로 시작 |
| tray | boolean | 트레이 아이콘 활성화 |
| trayOnClose | boolean | 닫기 시 트레이로 이동 |
| autoUpdate | boolean | 자동 업데이트 |
| spellCheck | boolean | 맞춤법 검사 |
| spellCheckLanguages | string[] | 맞춤법 검사 언어 목록 |
| shortcuts | Shortcut[] | 글로벌 단축키 |
| disableHardwareAcceleration | boolean | GPU 가속 비활성화 |
| useSystemTitleBar | boolean | 시스템 타이틀바 사용 |
| gitBashPath | string \| null | Git Bash 경로 (Windows) |
| testPlan | boolean | 테스트 채널 사용 여부 |

**관계**: 모든 Feature에서 IPC (config:get/set)를 통해 읽기/쓰기
**저장소**: better-sqlite3 (main process), IPC 브릿지를 통해 renderer에서 접근

---

### Provider (F004)

AI 서비스 프로바이더 설정.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string | Y | 프로바이더 고유 ID |
| type | ProviderType | Y | 'openai' \| 'anthropic' \| 'gemini' \| 'azure-openai' \| 'vertexai' \| 'mistral' \| 'aws-bedrock' \| 'new-api' \| 'gateway' \| 'ollama' \| 'openai-response' |
| name | string | Y | 표시 이름 |
| apiKey | string | Y | API 키 (암호화 저장) |
| apiHost | string | Y | API 엔드포인트 URL |
| apiVersion | string | N | API 버전 (Azure 등) |
| models | Model[] | Y | 사용 가능 모델 목록 |
| enabled | boolean | N | 활성화 여부 |
| isSystem | boolean | N | 시스템 내장 프로바이더 여부 |
| rateLimit | number | N | 요청 제한 (RPM) |
| apiOptions | ProviderApiOptions | N | API 호환성 옵션 |
| serviceTier | ServiceTier | N | OpenAI 서비스 티어 |
| authType | 'apiKey' \| 'oauth' | N | 인증 방식 |
| isVertex | boolean | N | VertexAI 여부 |
| extra_headers | Record<string, string> | N | 추가 HTTP 헤더 |
| anthropicCacheControl | AnthropicCacheControlSettings | N | Anthropic 캐시 설정 |

**관계**: Provider → Model (1:N), Provider → F005/F006/F007/F008 (소비)
**검증**: type은 ProviderTypeSchema (Zod enum)으로 검증
**저장소**: Zustand persist (localStorage), API key는 Electron safeStorage로 암호화

---

### Model (F004)

AI 모델 메타데이터.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string | Y | 모델 ID (프로바이더 API 기준) |
| provider | string | Y | 소속 프로바이더 ID |
| name | string | Y | 표시 이름 |
| group | string | Y | 모델 그룹 |
| owned_by | string | N | 소유자 |
| description | string | N | 설명 |
| capabilities | ModelCapability[] | N | 기능 태그 (text, vision, embedding, reasoning, function_calling, web_search, rerank) |
| pricing | ModelPricing | N | 가격 정보 (input/output per million tokens) |
| endpoint_type | EndpointType | N | 엔드포인트 타입 |
| supported_endpoint_types | EndpointType[] | N | 지원 엔드포인트 목록 |

**관계**: Model → Provider (N:1)
**저장소**: Zustand persist (localStorage), Provider.models 배열 내 포함

---

### Assistant (F005)

어시스턴트 설정 및 프롬프트.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string | Y | 고유 ID |
| name | string | Y | 표시 이름 |
| prompt | string | Y | 시스템 프롬프트 |
| type | string | Y | 어시스턴트 타입 |
| emoji | string | N | 아이콘 이모지 |
| description | string | N | 설명 |
| model | Model | N | 기본 모델 |
| defaultModel | Model | N | 기본값 모델 |
| settings | AssistantSettings | N | 모델 파라미터 설정 |
| topics | Topic[] | Y | 소속 토픽 목록 |
| knowledge_bases | KnowledgeBase[] | N | 연결된 지식베이스 |
| messages | AssistantMessage[] | N | 프리셋 메시지 |
| enableWebSearch | boolean | N | 웹 검색 활성화 |
| mcpMode | McpMode | N | MCP 모드 ('disabled' \| 'auto' \| 'manual') |
| mcpServers | MCPServer[] | N | 연결된 MCP 서버 |
| enableMemory | boolean | N | 메모리 활성화 |
| regularPhrases | QuickPhrase[] | N | 빠른 문구 |
| tags | string[] | N | 태그 |

**관계**: Assistant → Topic (1:N), Assistant → Model (N:1), Assistant → KnowledgeBase (N:N)
**저장소**: Zustand persist (localStorage)

---

### AssistantSettings (F005)

어시스턴트별 모델 파라미터.

| 필드 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| temperature | number | 0.7 | 생성 온도 |
| enableTemperature | boolean | true | 온도 제어 활성화 |
| topP | number | 1.0 | Top-P 샘플링 |
| enableTopP | boolean | false | Top-P 활성화 |
| maxTokens | number | - | 최대 토큰 수 |
| enableMaxTokens | boolean | false | 최대 토큰 제한 활성화 |
| contextCount | number | 5 | 컨텍스트 메시지 수 |
| streamOutput | boolean | true | 스트리밍 출력 |
| reasoning_effort | ReasoningEffortOption | 'default' | 추론 강도 |
| toolUseMode | 'function' \| 'prompt' | 'function' | 도구 사용 모드 |
| customParameters | AssistantSettingCustomParameters[] | [] | 커스텀 파라미터 |

**저장소**: Assistant.settings 내 포함 (Zustand persist)

---

### Topic (F005)

대화 토픽.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string | Y | 고유 ID |
| type | TopicType | N | 'chat' \| 'session' |
| assistantId | string | Y | 소속 어시스턴트 ID |
| name | string | Y | 토픽 이름 |
| createdAt | string (ISO) | Y | 생성 시각 |
| updatedAt | string (ISO) | Y | 수정 시각 |
| messages | Message[] | Y | 소속 메시지 목록 |
| pinned | boolean | N | 고정 여부 |
| prompt | string | N | 토픽별 프롬프트 |
| isNameManuallyEdited | boolean | N | 이름 수동 편집 여부 |

**관계**: Topic → Assistant (N:1), Topic → Message (1:N)
**인덱스**: assistantId, createdAt
**저장소**: better-sqlite3 via Drizzle (main process)

---

### Message (F005)

대화 메시지.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string | Y | 고유 ID |
| role | 'user' \| 'assistant' \| 'system' | Y | 역할 |
| assistantId | string | Y | 소속 어시스턴트 ID |
| topicId | string | Y | 소속 토픽 ID |
| createdAt | string (ISO) | Y | 생성 시각 |
| updatedAt | string (ISO) | N | 수정 시각 |
| status | UserMessageStatus \| AssistantMessageStatus | Y | 메시지 상태 |
| modelId | string | N | 사용 모델 ID |
| model | Model | N | 사용 모델 |
| type | 'clear' | N | 특수 메시지 타입 |
| useful | boolean | N | 유용함 표시 |
| askId | string | N | 관련 질문 메시지 ID |
| mentions | Model[] | N | 멘션된 모델 |
| multiModelMessageStyle | string | N | 멀티모델 표시 스타일 |

**관계**: Message → Topic (N:1), Message → MessageBlock (1:N)
**인덱스**: topicId, assistantId, createdAt
**저장소**: better-sqlite3 via Drizzle (main process)

---

### MessageBlock (F005)

메시지 블록 (union type). 하나의 Message가 여러 종류의 블록을 포함한다.

#### BaseMessageBlock (공통 필드)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string | Y | 블록 ID |
| messageId | string | Y | 소속 메시지 ID |
| type | MessageBlockType | Y | 블록 타입 |
| createdAt | string (ISO) | Y | 생성 시각 |
| updatedAt | string (ISO) | N | 수정 시각 |
| status | MessageBlockStatus | Y | 블록 상태 (pending/processing/streaming/success/error/paused) |
| model | Model | N | 사용 모델 |
| metadata | Record<string, any> | N | 메타데이터 |
| error | SerializedError | N | 에러 정보 |

#### 블록 타입별 추가 필드

| 타입 | 추가 필드 | 설명 |
|------|----------|------|
| MAIN_TEXT | content: string, knowledgeBaseIds?: string[], citationReferences?: CitationRef[] | 주요 텍스트 내용 |
| THINKING | content: string, thinking_millsec: number | 모델 사고 과정 |
| TRANSLATION | content: string, targetLanguage: string, sourceBlockId?: string | 번역 결과 |
| CODE | content: string, language: string | 코드 블록 |
| IMAGE | url?: string, file?: FileMetadata | 이미지 |
| TOOL | toolId: string, toolName?: string, arguments?: Record, content?: string\|object | MCP/도구 호출 결과 |
| CITATION | response?: WebSearchResponse, knowledge?: KnowledgeReference[], memories?: MemoryItem[] | 인용 (웹검색/KB/메모리) |
| FILE | file: FileMetadata | 파일 첨부 |
| VIDEO | url?: string, filePath?: string | 비디오 |
| ERROR | (BaseMessageBlock 상속) | 에러 |
| COMPACT | content: string, compactedContent: string | 압축 요약 |

**관계**: MessageBlock → Message (N:1)
**인덱스**: messageId, type
**저장소**: better-sqlite3 via Drizzle (main process)

---

### KnowledgeBase (F006)

지식베이스 메타데이터.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string | Y | 고유 ID |
| name | string | Y | 이름 |
| model | Model | Y | 임베딩 모델 |
| dimensions | number | N | 벡터 차원 |
| description | string | N | 설명 |
| items | KnowledgeItem[] | Y | 소속 항목 목록 |
| created_at | number | Y | 생성 타임스탬프 |
| updated_at | number | Y | 수정 타임스탬프 |
| version | number | Y | 버전 |
| documentCount | number | N | 검색 시 반환할 문서 수 |
| chunkSize | number | N | 청크 크기 |
| chunkOverlap | number | N | 청크 중첩 |
| threshold | number | N | 유사도 임계값 |
| rerankModel | Model | N | 리랭킹 모델 |
| preprocessProvider | PreprocessProvider | N | 전처리 프로바이더 (doc2x, mistral, mineru 등) |

**관계**: KnowledgeBase → KnowledgeItem (1:N), KnowledgeBase → Model (임베딩, 리랭킹)
**저장소**: Zustand persist (localStorage) — 메타데이터, better-sqlite3 (main) — 벡터 데이터

---

### KnowledgeItem (F006)

KB 항목 (다형성 union type).

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string | Y | 고유 ID |
| baseId | string | N | 소속 KB ID |
| type | KnowledgeItemType | Y | 'file' \| 'url' \| 'note' \| 'sitemap' \| 'directory' \| 'memory' \| 'video' |
| content | string \| FileMetadata \| FileMetadata[] | Y | 타입별 내용 |
| remark | string | N | 비고 |
| created_at | number | Y | 생성 타임스탬프 |
| updated_at | number | Y | 수정 타임스탬프 |
| processingStatus | ProcessingStatus | N | 'pending' \| 'processing' \| 'completed' \| 'failed' |
| processingProgress | number | N | 처리 진행률 (0-100) |
| processingError | string | N | 처리 에러 메시지 |
| retryCount | number | N | 재시도 횟수 |

#### 타입별 content 구조

| 서브타입 | content 타입 | 추가 필드 |
|---------|-------------|----------|
| KnowledgeFileItem | FileMetadata | — |
| KnowledgeVideoItem | FileMetadata[] | — |
| KnowledgeNoteItem | string | sourceUrl?: string |
| KnowledgeUrlItem | string (URL) | — |
| KnowledgeSitemapItem | string (URL) | — |
| KnowledgeDirectoryItem | string (경로) | — |

**저장소**: KnowledgeBase.items 내 포함 (Zustand persist)

---

### FileMetadata (F001)

파일 메타데이터.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string | Y | 파일 고유 ID |
| name | string | Y | 저장 파일명 |
| origin_name | string | Y | 원본 파일명 (표시용) |
| path | string | Y | 파일 경로 |
| size | number | Y | 파일 크기 (bytes) |
| ext | string | Y | 확장자 (.포함) |
| type | FileType | Y | 'image' \| 'video' \| 'audio' \| 'text' \| 'document' \| 'other' |
| created_at | string (ISO) | Y | 생성 시각 |
| count | number | Y | 파일 카운트 |

**관계**: Message, KnowledgeItem, Painting 등에서 참조
**저장소**: better-sqlite3 (main) + 파일시스템

---

### MCPServer (F008)

MCP (Model Context Protocol) 서버 설정.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string | N | 서버 ID |
| name | string | N | 서버 이름 |
| type | McpServerType | N | 'stdio' \| 'sse' \| 'streamableHttp' \| 'inMemory' |
| description | string | N | 설명 |
| url / baseUrl | string | N | 서버 URL |
| command | string | N | 실행 명령어 (uvx, npx 등) |
| args | string[] | N | 명령어 인수 |
| env | Record<string, string> | N | 환경 변수 |
| registryUrl | string | N | 레지스트리 URL |
| isActive | boolean | N | 활성화 여부 |
| installSource | MCPServerInstallSource | N | 'builtin' \| 'manual' \| 'protocol' \| 'unknown' |

**관계**: MCPServer → Assistant (N:N, 어시스턴트가 MCP 서버 참조)
**저장소**: Zustand persist (localStorage)

---

### Agent (F010)

자율형 에이전트 설정 (Claude Code SDK 기반).

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string | Y | 고유 ID |
| type | AgentType | Y | 'claude-code' |
| name | string | N | 에이전트 이름 |
| description | string | N | 설명 |
| model | string | Y | 메인 모델 ID |
| plan_model | string | N | 계획/사고 모델 ID |
| small_model | string | N | 경량 모델 ID |
| instructions | string | N | 시스템 프롬프트 |
| accessible_paths | string[] | Y | 접근 가능 디렉토리 경로 |
| allowed_tools | string[] | N | 허용된 도구 ID 목록 |
| mcps | string[] | N | MCP 서버 ID 목록 |
| configuration | AgentConfiguration | N | 에이전트 설정 (avatar, permission_mode, max_turns) |
| created_at | string (ISO) | Y | 생성 시각 |
| updated_at | string (ISO) | Y | 수정 시각 |

**검증**: AgentEntitySchema (Zod)
**인덱스**: type, created_at
**저장소**: better-sqlite3 via Drizzle (main process)

---

### AgentSession (F010)

에이전트 대화 세션.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string | Y | 세션 ID |
| agent_id | string | Y | 에이전트 ID |
| agent_type | AgentType | Y | 에이전트 타입 |
| (AgentBase 필드 상속) | — | — | name, model, instructions 등 |
| created_at | string (ISO) | Y | 생성 시각 |
| updated_at | string (ISO) | Y | 수정 시각 |

**관계**: AgentSession → Agent (N:1), AgentSession → AgentSessionMessage (1:N)
**인덱스**: agent_id, created_at
**저장소**: better-sqlite3 via Drizzle (main process)

---

### AgentSessionMessage (F010)

에이전트 세션 메시지.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | number (auto-increment) | Y | PK |
| session_id | string | Y | 세션 ID |
| role | SessionMessageRole | Y | 'assistant' \| 'user' \| 'system' \| 'tool' |
| content | unknown (JSON) | Y | 메시지 내용 |
| agent_session_id | string | Y | 에이전트 세션 ID (이력 복원용) |
| metadata | Record<string, any> | N | 메타데이터 |
| created_at | string (ISO) | Y | 생성 시각 |
| updated_at | string (ISO) | Y | 수정 시각 |

**검증**: AgentSessionMessageEntitySchema (Zod)
**인덱스**: session_id, created_at
**저장소**: better-sqlite3 via Drizzle (main process)

---

### MemoryItem (F009)

시맨틱 메모리 항목.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string | Y | 고유 ID |
| content | string | Y | 메모리 내용 |
| embedding | number[] | Y | 벡터 임베딩 |
| userId | string | Y | 사용자 ID |
| metadata | Record<string, any> | N | 메타데이터 (소스 메시지 ID, 토픽 ID 등) |
| created_at | string (ISO) | Y | 생성 시각 |
| updated_at | string (ISO) | Y | 수정 시각 |

**관계**: MemoryItem → F005 (채팅 컨텍스트에 주입)
**인덱스**: userId, embedding (벡터 인덱스)
**저장소**: better-sqlite3 (main process, 벡터 저장소)

---

### TranslateHistory (F007)

번역 이력 (TranslateAssistant로 모델링).

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| (Assistant 필드 상속) | — | — | id, name, prompt 등 |
| model | Model | Y | 번역 모델 |
| content | string | Y | 번역 대상 텍스트 |
| targetLanguage | TranslateLanguage | Y | 목표 언어 |

**저장소**: Zustand persist (localStorage)

---

### Painting (F008)

이미지 생성 이력. 프로바이더별 서브타입이 존재한다.

| 필드 (공통) | 타입 | 필수 | 설명 |
|------------|------|------|------|
| id | string | Y | 고유 ID |
| urls | string[] | Y | 생성된 이미지 URL 목록 |
| files | FileMetadata[] | Y | 관련 파일 |
| providerId | string | N | 소속 프로바이더 ID |
| model | string | N | 사용 모델 |
| prompt | string | N | 프롬프트 |

**서브타입**: GeneratePainting, EditPainting, RemixPainting, ScalePainting, DmxapiPainting, TokenFluxPainting, OvmsPainting, PpioPainting
**저장소**: Zustand persist (localStorage)

---

### Shortcut (F003)

키보드 단축키 설정.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| key | string | Y | 단축키 식별자 |
| shortcut | string | Y | 키 조합 (예: 'CmdOrCtrl+Shift+A') |
| enabled | boolean | Y | 활성화 여부 |

**저장소**: ConfigManager (better-sqlite3, main process)

---

### QuickPhrase (F005)

빠른 문구 (어시스턴트별 프리셋).

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| content | string | Y | 문구 내용 |

**저장소**: Assistant.regularPhrases 내 포함 (Zustand persist)
