# Angdu Studio 비즈니스 로직 맵

## F001: App Shell

### Config 영속화

1. **ConfigManager** (main process)
   - better-sqlite3에 key-value 형태로 설정 저장
   - `config:get(key)` → 값 반환, `config:set(key, value, isNotify)` → 값 저장 + 선택적 알림
   - isNotify가 true일 때 renderer에 변경 이벤트 브로드캐스트
   - 앱 시작 시 기본값 초기화, 마이그레이션 로직 포함

2. **설정 카테고리**: language, theme, zoomFactor, launchOnBoot, tray, shortcuts, proxy, spellCheck, hardwareAcceleration, systemTitleBar

### 테마 동기화

1. renderer에서 `App_SetTheme(theme)` IPC 호출
2. main process의 ThemeService가 nativeTheme.themeSource 설정
3. 'system' 모드: OS 다크모드 변경 이벤트 구독 → renderer에 자동 전파
4. CSS 변수 및 Tailwind dark 클래스로 UI 반영

### 윈도우 관리

1. **BrowserWindow 생성**: 최소 크기 제약, 이전 위치/크기 복원
2. **프레임리스 윈도우**: useSystemTitleBar false일 때 커스텀 타이틀바
3. **미니 윈도우**: Selection Assistant용 별도 BrowserWindow
4. **트레이 아이콘**: 트레이 활성화 시 최소화/숨기기 → 트레이로 이동
5. **전체화면**: `App_SetFullScreen` → BrowserWindow.setFullScreen
6. **종료 방지**: 작업 중 `before-quit` 이벤트 차단 → 사용자에게 알림

### 파일 관리 (FileStorage)

1. 앱 데이터 디렉토리 내 files/ 폴더에 파일 저장
2. 업로드: 원본 → ID 기반 파일명으로 복사, FileMetadata 반환
3. 이미지: Base64 변환, 붙여넣기 이미지 저장, PDF 페이지 수 조회
4. 파일 감시: chokidar 기반 파일 변경 감지 (Notes 기능용)

---

## F004: Model Provider

### 프로바이더 헬스체크

1. 프로바이더 설정 (apiHost, apiKey) 기반 경량 API 호출
2. OpenAI 호환: `GET /v1/models` 호출
3. Anthropic: Messages API로 최소 요청
4. 성공/실패/타임아웃 상태 반환
5. UI에서 녹색/빨간색 인디케이터 표시

### API Key 암호화

1. renderer에서 API key 입력
2. `Aes_Encrypt(key, secretKey, iv)` IPC로 main process에서 AES 암호화
3. 암호화된 값을 Zustand persist (localStorage)에 저장
4. API 호출 시 `Aes_Decrypt`로 복호화 후 사용
5. **Angdu 변경점**: Electron safeStorage API 사용으로 보안 강화 계획

### 모델 자동 검색

1. 프로바이더의 API 호출로 사용 가능 모델 목록 조회
2. OpenAI 호환: `GET /v1/models` 응답 파싱
3. 모델별 capability 자동 태깅 (id 패턴 매칭: gpt → text, dall-e → image 등)
4. 기존 모델 목록과 병합 (사용자 커스텀 설정 유지)
5. Zustand store에 갱신

### 프로바이더 타입별 분기

| 타입 | 엔드포인트 | 인증 | 특이사항 |
|------|----------|------|---------|
| openai | /v1/chat/completions | Bearer token | stream_options 지원 여부 분기 |
| openai-response | /v1/responses | Bearer token | Responses API 사용 |
| anthropic | /v1/messages | x-api-key | 캐시 제어, 프롬프트 캐싱 |
| gemini | generativelanguage API | API key in URL | 멀티모달, 그라운딩 |
| azure-openai | {host}/openai/deployments/{model} | api-key header | apiVersion 필수 |
| vertexai | Vertex AI API | OAuth2 (서비스 계정) | projectId, location 필요 |
| mistral | /v1/chat/completions | Bearer token | 파일 업로드 별도 |
| aws-bedrock | Bedrock API | IAM / API key | region 기반 |
| ollama | /api/chat | 인증 없음 | 로컬 모델 |

---

## F005: Chat Conversation

### 채팅 스트리밍 파이프라인

```
사용자 입력 → InputBar → Message 생성 → 컨텍스트 구성 → API 호출 → 스트리밍 수신 → MessageBlock 업데이트 → UI 렌더링
```

1. **입력 처리** (InputBar)
   - TipTap 에디터에서 텍스트/이미지/파일 입력
   - @멘션으로 모델 선택
   - 파일 첨부: 드래그앤드롭, 붙여넣기, 파일 선택
   - QuickPhrase 자동완성

2. **메시지 생성**
   - User Message 생성 (id, role='user', topicId, assistantId)
   - MessageBlock 생성 (MAIN_TEXT, FILE, IMAGE 등)
   - Zustand store 업데이트 + SQLite 영속화

3. **컨텍스트 구성**
   - contextCount에 따라 이전 메시지 N개 포함
   - 시스템 프롬프트 (Assistant.prompt) 주입
   - Knowledge Base가 연결된 경우: 사용자 입력으로 KB 검색 → 관련 청크를 컨텍스트에 주입
   - Memory가 활성화된 경우: 사용자 입력으로 메모리 검색 → 관련 메모리를 컨텍스트에 주입
   - MCP 도구가 활성화된 경우: 도구 정의를 API 요청에 포함

4. **API 호출** (Vercel AI SDK)
   - `streamText()` 호출 (프로바이더별 SDK: @ai-sdk/openai, @ai-sdk/anthropic 등)
   - 스트리밍 모드: text delta, tool call, thinking 등 실시간 수신
   - 논스트리밍 모드: 완료 후 한번에 처리

5. **스트리밍 수신 및 블록 업데이트**
   - text-delta → MainTextMessageBlock.content 누적
   - reasoning → ThinkingMessageBlock.content 누적
   - tool-call → ToolMessageBlock 생성/업데이트
   - finish → 상태를 SUCCESS로 전환, usage/metrics 기록
   - error → ErrorMessageBlock 생성

6. **일시정지/재개/중단**
   - 사용자가 중단: AbortController.abort()
   - 일시정지: 스트림 수신 중단 (PAUSED 상태)
   - 재개: 마지막 위치부터 재개 또는 재요청

### 컨텍스트 윈도우 관리

1. `AssistantSettings.contextCount`에 따라 포함할 이전 메시지 수 결정
2. 토큰 카운팅: tiktoken 또는 모델별 토큰 카운터로 현재 컨텍스트 크기 추정
3. 'clear' 타입 메시지로 컨텍스트 경계 설정
4. 파일/이미지 첨부 시 토큰 소비량 추정 포함

### 토큰 카운팅

1. 입력 전 예상 토큰 수 표시
2. 응답 완료 후 실제 사용량 기록 (usage: prompt_tokens, completion_tokens, total_tokens)
3. Metrics: completion_tokens, time_completion_millsec, time_first_token_millsec, time_thinking_millsec

### 메시지 중복 제거

1. askId로 질문-응답 쌍 매칭
2. 같은 askId의 응답이 이미 존재하면 이전 응답 교체 (재생성 기능)
3. 멀티모델 응답: 같은 질문에 여러 모델의 응답을 병렬/순차 표시

### 토픽 자동 이름 생성

1. 첫 번째 메시지 또는 N번째 메시지 이후 자동 이름 생성
2. AI 모델 호출로 대화 요약 → 토픽 이름으로 설정
3. `isNameManuallyEdited=true`이면 자동 이름 생성 건너뜀

---

## F006: Knowledge Base (RAG)

### RAG 파이프라인

```
문서 업로드 → 전처리 → 청크 분할 → 임베딩 → 벡터 저장 → 검색 → 리랭킹 → 컨텍스트 주입
```

1. **문서 수집** (KnowledgeBase_Add)
   - 파일 업로드: PDF, DOCX, TXT, MD, CSV 등
   - URL 수집: 단일 URL 또는 Sitemap
   - 디렉토리 수집: 재귀적 파일 스캔
   - 노트: 직접 입력 텍스트
   - 비디오: 자막 추출

2. **전처리** (선택적)
   - doc2x: PDF → 구조화된 텍스트
   - Mistral OCR: 이미지 기반 문서
   - MinerU: 학술 논문
   - PaddleOCR: 로컬 OCR
   - 전처리 결과를 마크다운으로 변환

3. **청크 분할**
   - chunkSize (기본: 1000자) + chunkOverlap (기본: 200자)
   - 의미 단위 분할 (문단, 섹션 경계 우선)
   - 메타데이터 보존 (소스 파일명, 페이지 번호 등)

4. **임베딩**
   - KnowledgeBase.model (임베딩 모델)로 각 청크 벡터화
   - 차원 수: dimensions 필드 (모델 기본값)
   - 배치 처리: 프로바이더 rate limit 고려

5. **벡터 저장**
   - better-sqlite3에 벡터 데이터 저장 (main process)
   - KB별 격리된 테이블

6. **검색** (KnowledgeBase_Search)
   - 쿼리 텍스트를 동일 임베딩 모델로 벡터화
   - 코사인 유사도 기반 검색
   - threshold 이상의 결과만 반환
   - documentCount만큼 상위 결과 반환

7. **리랭킹** (KnowledgeBase_Rerank)
   - rerankModel이 설정된 경우 검색 결과를 리랭킹 모델로 재정렬
   - cross-encoder 기반 정밀 순위 조정

### 동시 인제스션 제한

1. 파일 처리는 main process에서 순차/제한 병렬 실행
2. processingStatus로 진행 상태 추적 (pending → processing → completed/failed)
3. 실패 시 retryCount 증가, 최대 재시도 횟수 초과 시 failed 상태

---

## F009: Memory

### 메모리 추출

1. 대화 완료 후 (어시스턴트 응답 성공) 트리거
2. enableMemory가 true인 어시스턴트의 대화만 대상
3. Memory_Add IPC로 메시지 내용 전달
4. main process의 MemoryService가:
   - 메시지에서 기억할 만한 정보 추출 (AI 모델 호출)
   - 추출된 텍스트를 임베딩 모델로 벡터화
   - better-sqlite3에 저장 (userId, content, embedding, metadata)

### 벡터 유사도 검색

1. Memory_Search IPC로 쿼리 전달
2. 쿼리를 임베딩 모델로 벡터화
3. 코사인 유사도로 관련 메모리 검색
4. 상위 N개 결과 반환
5. 채팅 컨텍스트에 "관련 메모리" 섹션으로 주입

### 메모리 관리

1. 사용자별 메모리 목록 조회/수정/삭제
2. 사용자 삭제 시 해당 사용자의 전체 메모리 삭제
3. DB 마이그레이션: Memory_MigrateMemoryDb

---

## Cross-Feature 비즈니스 규칙

### 채팅 + KB 인용 (F005 + F006)

1. 어시스턴트에 knowledge_bases가 설정된 경우
2. 사용자 메시지 전송 시 → KnowledgeBase_Search 호출
3. 검색 결과를 시스템 프롬프트에 컨텍스트로 주입
4. 응답에 인용 정보 포함 → CitationMessageBlock.knowledge에 KnowledgeReference 배열
5. UI에서 인용 참조 링크 표시

### 채팅 + 메모리 주입 (F005 + F009)

1. 어시스턴트에 enableMemory가 true인 경우
2. 사용자 메시지 전송 시 → Memory_Search 호출
3. 관련 메모리를 시스템 프롬프트에 주입
4. 응답 완료 후 → Memory_Add로 새 메모리 추출/저장
5. CitationMessageBlock.memories에 MemoryItem 배열

### 프로바이더 → 모든 소비자 (F004 → F005/F006/F007/F008/F009/F010)

1. 프로바이더 비활성화 시 해당 프로바이더의 모델을 사용하는 모든 Feature에 영향
2. API key 만료/무효화 시 헬스체크 실패 → UI 경고
3. 모델 목록 변경 시 Zustand store를 통해 모든 소비자에 자동 반영
4. rate limit 설정이 KB 인제스션, 메모리 추출 등의 배치 처리에도 적용

### 채팅 + MCP 도구 (F005 + F008)

1. 어시스턴트에 mcpMode가 'auto' 또는 'manual'인 경우
2. MCP 서버의 도구 정의를 API 요청 tools 파라미터에 포함
3. 모델이 tool_call 응답 시 → Mcp_CallTool IPC로 도구 실행
4. 도구 실행 결과를 ToolMessageBlock에 기록
5. 결과를 다시 모델에 전달 (multi-turn tool use)

### 백업/복원 데이터 범위 (F003)

1. **백업 대상**: Redux/Zustand 전체 상태 (어시스턴트, 프로바이더, 설정 등), SQLite DB (메시지, KB 벡터, 메모리), 파일 저장소
2. **복원 시**: 기존 데이터 교체, 앱 재시작
3. **WebDAV/S3 백업**: 압축 후 원격 저장소에 업로드
4. **로컬 백업**: 지정 디렉토리에 저장
