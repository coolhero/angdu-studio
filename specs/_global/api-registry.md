# Angdu Studio API 레지스트리

이 프로젝트는 HTTP가 아닌 **Electron IPC**를 기본 API로 사용한다. renderer → main 간 모든 데이터 흐름은 `ipcMain.handle` / `ipcRenderer.invoke`를 통한다. 유일한 HTTP API는 F010의 Agent API 서버 (Express)이다.

## IPC Channel Index

### App 도메인 (F001)

| 채널 | 방향 | 설명 |
|------|------|------|
| App_Info | renderer → main | 앱 정보 반환 (version, paths, arch 등) |
| App_Proxy | renderer → main | 프록시 설정 (system/direct/fixed) |
| App_Reload | renderer → main | 앱 리로드 |
| App_Quit | renderer → main | 앱 종료 |
| App_SetLanguage | renderer → main | UI 언어 변경 |
| App_SetTheme | renderer → main | 테마 변경 (light/dark/system) |
| App_HandleZoomFactor | renderer → main | 줌 팩터 변경 |
| App_ClearCache | renderer → main | 캐시 삭제 |
| App_GetCacheSize | renderer → main | 캐시 크기 조회 |
| App_SetFullScreen | renderer → main | 전체화면 전환 |
| App_IsFullScreen | renderer → main | 전체화면 상태 조회 |
| App_GetSystemFonts | renderer → main | 시스템 폰트 목록 조회 |
| App_SetLaunchOnBoot | renderer → main | 부팅 시 자동 시작 설정 |
| App_SetLaunchToTray | renderer → main | 트레이로 시작 설정 |
| App_SetTray | renderer → main | 트레이 아이콘 활성화 |
| App_SetTrayOnClose | renderer → main | 닫기 시 트레이 설정 |
| App_SetAutoUpdate | renderer → main | 자동 업데이트 설정 |
| App_CheckForUpdate | renderer → main | 업데이트 확인 |
| App_QuitAndInstall | renderer → main | 업데이트 설치 후 재시작 |
| App_SetStopQuitApp | renderer → main | 종료 방지 설정 |
| App_Select | renderer → main | 파일/폴더 선택 다이얼로그 |
| App_SetAppDataPath | renderer → main | 데이터 경로 변경 |
| App_RelaunchApp | renderer → main | 앱 재시작 |
| App_ResetData | renderer → main | 공장 초기화 |
| App_SetDisableHardwareAcceleration | renderer → main | GPU 가속 비활성화 |
| App_SetUseSystemTitleBar | renderer → main | 시스템 타이틀바 사용 |
| App_SetEnableSpellCheck | renderer → main | 맞춤법 검사 활성화 |
| App_SetSpellCheckLanguages | renderer → main | 맞춤법 검사 언어 설정 |
| App_SaveData | main → renderer | 데이터 저장 요청 (종료 전) |
| App_GetDiskInfo | renderer → main | 디스크 공간 조회 |
| App_QuoteToMain | renderer → main | 미니 윈도우에서 메인으로 텍스트 전달 |
| Open_Website | renderer → main | 외부 URL 열기 |
| Open_Path | renderer → main | 파일/폴더 경로 열기 |

### Config 도메인 (F001)

| 채널 | 방향 | 설명 |
|------|------|------|
| Config_Set | renderer → main | 설정값 저장 (key, value, isNotify) |
| Config_Get | renderer → main | 설정값 조회 (key) |

**핵심 상세**: Config는 main process의 ConfigManager (better-sqlite3)가 관리한다. renderer는 반드시 IPC를 통해 접근해야 한다.

### File 도메인 (F001)

| 채널 | 방향 | 설명 |
|------|------|------|
| File_Open | renderer → main | 파일 열기 (기본 앱) |
| File_OpenPath | renderer → main | 경로로 파일 열기 |
| File_Save | renderer → main | 파일 저장 다이얼로그 |
| File_Select | renderer → main | 파일 선택 다이얼로그 |
| File_Upload | renderer → main | 파일 업로드 (앱 저장소로 복사) |
| File_Clear | renderer → main | 파일 정리 |
| File_Read | renderer → main | 파일 읽기 |
| File_ReadExternal | renderer → main | 외부 파일 읽기 |
| File_Delete | renderer → main | 파일 삭제 |
| File_DeleteDir | renderer → main | 디렉토리 삭제 |
| File_Move | renderer → main | 파일 이동 |
| File_Rename | renderer → main | 파일 이름 변경 |
| File_Get | renderer → main | 파일 메타데이터 조회 |
| File_SelectFolder | renderer → main | 폴더 선택 다이얼로그 |
| File_CreateTempFile | renderer → main | 임시 파일 생성 |
| File_Write | renderer → main | 파일 쓰기 |
| File_WriteWithId | renderer → main | ID 기반 파일 쓰기 |
| File_SaveImage | renderer → main | 이미지 저장 |
| File_Base64Image | renderer → main | 이미지 Base64 변환 |
| File_SaveBase64Image | renderer → main | Base64 이미지 저장 |
| File_SavePastedImage | renderer → main | 붙여넣기 이미지 저장 |
| File_GetPdfInfo | renderer → main | PDF 페이지 수 조회 |
| File_Download | renderer → main | 파일 다운로드 |
| File_Copy | renderer → main | 파일 복사 |
| File_IsTextFile | renderer → main | 텍스트 파일 여부 확인 |
| File_IsDirectory | renderer → main | 디렉토리 여부 확인 |
| File_ListDirectory | renderer → main | 디렉토리 내용 목록 |
| File_GetDirectoryStructure | renderer → main | 디렉토리 구조 조회 |
| File_StartWatcher | renderer → main | 파일 감시 시작 |
| File_StopWatcher | renderer → main | 파일 감시 중지 |
| File_BatchUploadMarkdown | renderer → main | 마크다운 파일 일괄 업로드 |
| File_ShowInFolder | renderer → main | 파일 탐색기에서 표시 |

### Backup 도메인 (F003)

| 채널 | 방향 | 설명 |
|------|------|------|
| Backup_Backup | renderer → main | 로컬 백업 생성 |
| Backup_Restore | renderer → main | 로컬 백업 복원 |
| Backup_BackupToWebdav | renderer → main | WebDAV 백업 |
| Backup_RestoreFromWebdav | renderer → main | WebDAV 복원 |
| Backup_ListWebdavFiles | renderer → main | WebDAV 파일 목록 |
| Backup_CheckConnection | renderer → main | WebDAV 연결 확인 |
| Backup_DeleteWebdavFile | renderer → main | WebDAV 파일 삭제 |
| Backup_BackupToLocalDir | renderer → main | 로컬 디렉토리 백업 |
| Backup_RestoreFromLocalBackup | renderer → main | 로컬 디렉토리 복원 |
| Backup_ListLocalBackupFiles | renderer → main | 로컬 백업 파일 목록 |
| Backup_DeleteLocalBackupFile | renderer → main | 로컬 백업 삭제 |
| Backup_BackupToS3 | renderer → main | S3 백업 |
| Backup_RestoreFromS3 | renderer → main | S3 복원 |
| Backup_ListS3Files | renderer → main | S3 파일 목록 |
| Backup_DeleteS3File | renderer → main | S3 파일 삭제 |
| Backup_CheckS3Connection | renderer → main | S3 연결 확인 |

### KnowledgeBase 도메인 (F006)

| 채널 | 방향 | 설명 |
|------|------|------|
| KnowledgeBase_Create | renderer → main | KB 생성 (SQLite 벡터 테이블 초기화) |
| KnowledgeBase_Reset | renderer → main | KB 리셋 (벡터 데이터 삭제) |
| KnowledgeBase_Delete | renderer → main | KB 삭제 |
| KnowledgeBase_Add | renderer → main | KB에 항목 추가 (chunk → embed → store) |
| KnowledgeBase_Remove | renderer → main | KB에서 항목 제거 |
| KnowledgeBase_Search | renderer → main | 벡터 유사도 검색 |
| KnowledgeBase_Rerank | renderer → main | 검색 결과 리랭킹 |

**핵심 상세**: `KnowledgeBase_Add`는 문서를 청크로 분할, 임베딩 모델로 벡터화, better-sqlite3에 저장하는 전체 RAG 인제스션 파이프라인을 main process에서 실행한다.

### Memory 도메인 (F009)

| 채널 | 방향 | 설명 |
|------|------|------|
| Memory_Add | renderer → main | 메모리 추가 (메시지에서 추출 → 임베딩 → 저장) |
| Memory_Search | renderer → main | 벡터 유사도 검색으로 관련 메모리 조회 |
| Memory_List | renderer → main | 사용자별 메모리 목록 |
| Memory_Delete | renderer → main | 메모리 삭제 |
| Memory_Update | renderer → main | 메모리 수정 |
| Memory_Get | renderer → main | 메모리 단건 조회 |
| Memory_SetConfig | renderer → main | 메모리 설정 변경 |
| Memory_DeleteUser | renderer → main | 사용자 삭제 |
| Memory_DeleteAllMemoriesForUser | renderer → main | 사용자의 전체 메모리 삭제 |
| Memory_GetUsersList | renderer → main | 사용자 목록 조회 |
| Memory_MigrateMemoryDb | renderer → main | 메모리 DB 마이그레이션 |

### MCP 도메인 (F008)

| 채널 | 방향 | 설명 |
|------|------|------|
| Mcp_RemoveServer | renderer → main | MCP 서버 제거 |
| Mcp_RestartServer | renderer → main | MCP 서버 재시작 |
| Mcp_StopServer | renderer → main | MCP 서버 중지 |
| Mcp_ListTools | renderer → main | MCP 도구 목록 |
| Mcp_CallTool | renderer → main | MCP 도구 호출 |
| Mcp_ListPrompts | renderer → main | MCP 프롬프트 목록 |
| Mcp_GetPrompt | renderer → main | MCP 프롬프트 조회 |
| Mcp_ListResources | renderer → main | MCP 리소스 목록 |
| Mcp_GetResource | renderer → main | MCP 리소스 조회 |
| Mcp_GetInstallInfo | renderer → main | MCP 설치 정보 |
| Mcp_CheckConnectivity | renderer → main | MCP 연결 확인 |
| Mcp_AbortTool | renderer → main | MCP 도구 실행 중단 |
| Mcp_GetServerVersion | renderer → main | MCP 서버 버전 |
| Mcp_GetServerLogs | renderer → main | MCP 서버 로그 |
| Mcp_UploadDxt | renderer → main | DXT 패키지 업로드 |

### Agent 도메인 (F010)

| 채널 | 방향 | 설명 |
|------|------|------|
| AgentMessage_PersistExchange | renderer → main | 에이전트 메시지 교환 영속화 |
| AgentMessage_GetHistory | renderer → main | 에이전트 세션 이력 조회 |

### Window 도메인 (F001)

| 채널 | 방향 | 설명 |
|------|------|------|
| Windows_SetMinimumSize | renderer → main | 최소 윈도우 크기 설정 |
| Windows_ResetMinimumSize | renderer → main | 최소 크기 초기화 |
| Windows_GetSize | renderer → main | 윈도우 크기 조회 |
| Windows_Minimize | renderer → main | 최소화 |
| Windows_Maximize | renderer → main | 최대화 |
| Windows_Unmaximize | renderer → main | 최대화 해제 |
| Windows_Close | renderer → main | 닫기 |
| Windows_IsMaximized | renderer → main | 최대화 상태 조회 |
| Windows_MaximizedChanged | main → renderer | 최대화 상태 변경 알림 |
| MiniWindow_Show | renderer → main | 미니 윈도우 표시 |
| MiniWindow_Hide | renderer → main | 미니 윈도우 숨기기 |
| MiniWindow_Close | renderer → main | 미니 윈도우 닫기 |
| MiniWindow_Toggle | renderer → main | 미니 윈도우 토글 |
| MiniWindow_SetPin | renderer → main | 미니 윈도우 고정 |

### Shortcuts 도메인 (F003)

| 채널 | 방향 | 설명 |
|------|------|------|
| Shortcuts_Update | renderer → main | 단축키 설정 업데이트 및 재등록 |

### AES 암호화 도메인 (F004)

| 채널 | 방향 | 설명 |
|------|------|------|
| Aes_Encrypt | renderer → main | AES 암호화 |
| Aes_Decrypt | renderer → main | AES 복호화 |

### OCR 도메인 (F007)

| 채널 | 방향 | 설명 |
|------|------|------|
| OCR_ocr | renderer → main | OCR 실행 (파일, 프로바이더) |
| OCR_ListProviders | renderer → main | OCR 프로바이더 목록 |

### CodeTools 도메인 (F008)

| 채널 | 방향 | 설명 |
|------|------|------|
| CodeTools_Run | renderer → main | 코드 실행 |
| CodeTools_GetAvailableTerminals | renderer → main | 사용 가능한 터미널 목록 |
| CodeTools_SetCustomTerminalPath | renderer → main | 커스텀 터미널 경로 설정 |
| CodeTools_GetCustomTerminalPath | renderer → main | 커스텀 터미널 경로 조회 |
| CodeTools_RemoveCustomTerminalPath | renderer → main | 커스텀 터미널 경로 제거 |

### Selection 도메인 (F010)

| 채널 | 방향 | 설명 |
|------|------|------|
| (SelectionService.registerIpcHandler()) | 양방향 | 텍스트 선택 → AI 처리 (내부 IPC 등록) |

### System 도메인 (F001)

| 채널 | 방향 | 설명 |
|------|------|------|
| System_GetDeviceType | renderer → main | 디바이스 타입 조회 |
| System_GetHostname | renderer → main | 호스트명 조회 |
| System_GetCpuName | renderer → main | CPU 이름 조회 |
| System_ToggleDevTools | renderer → main | DevTools 토글 |
| System_CheckGitBash | renderer → main | Git Bash 확인 (Windows) |
| System_GetGitBashPath | renderer → main | Git Bash 경로 조회 |
| System_SetGitBashPath | renderer → main | Git Bash 경로 설정 |

### Notification 도메인 (F001)

| 채널 | 방향 | 설명 |
|------|------|------|
| Notification_Send | renderer → main | 시스템 알림 전송 |
| Notification_OnClick | renderer → main | 알림 클릭 핸들러 등록 |

### Export 도메인 (F005)

| 채널 | 방향 | 설명 |
|------|------|------|
| Export_Word | renderer → main | Word 형식으로 내보내기 |

### Zip 도메인 (F001)

| 채널 | 방향 | 설명 |
|------|------|------|
| Zip_Compress | renderer → main | 텍스트 압축 |
| Zip_Decompress | renderer → main | 텍스트 압축 해제 |

### FileService 도메인 (F004)

원격 파일 서비스 (Gemini/Mistral/OpenAI 파일 업로드).

| 채널 | 방향 | 설명 |
|------|------|------|
| FileService_Upload | renderer → main | 원격 파일 업로드 |
| FileService_List | renderer → main | 원격 파일 목록 |
| FileService_Delete | renderer → main | 원격 파일 삭제 |
| FileService_Retrieve | renderer → main | 원격 파일 조회 |

### Trace 도메인 (F005)

스팬 캐시 기반 메시지 트레이싱.

| 채널 | 방향 | 설명 |
|------|------|------|
| TRACE_SAVE_DATA | renderer → main | 스팬 데이터 저장 |
| TRACE_GET_DATA | renderer → main | 스팬 데이터 조회 |
| TRACE_SAVE_ENTITY | renderer → main | 스팬 엔티티 저장 |
| TRACE_GET_ENTITY | renderer → main | 스팬 엔티티 조회 |
| TRACE_BIND_TOPIC | renderer → main | 토픽에 트레이스 바인딩 |
| TRACE_CLEAN_TOPIC | renderer → main | 토픽 트레이스 정리 |
| TRACE_TOKEN_USAGE | renderer → main | 토큰 사용량 기록 |
| TRACE_OPEN_WINDOW | renderer → main | 트레이스 윈도우 열기 |

### VertexAI 도메인 (F004)

| 채널 | 방향 | 설명 |
|------|------|------|
| VertexAI_GetAuthHeaders | renderer → main | VertexAI 인증 헤더 |
| VertexAI_GetAccessToken | renderer → main | 액세스 토큰 |
| VertexAI_ClearAuthCache | renderer → main | 인증 캐시 삭제 |

### Anthropic OAuth 도메인 (F004)

| 채널 | 방향 | 설명 |
|------|------|------|
| Anthropic_StartOAuthFlow | renderer → main | OAuth 흐름 시작 |
| Anthropic_CompleteOAuthWithCode | renderer → main | OAuth 코드로 완료 |
| Anthropic_CancelOAuthFlow | renderer → main | OAuth 취소 |
| Anthropic_GetAccessToken | renderer → main | 액세스 토큰 |
| Anthropic_HasCredentials | renderer → main | 자격증명 확인 |
| Anthropic_ClearCredentials | renderer → main | 자격증명 삭제 |

### Plugin 도메인 (F010)

Claude Code 에이전트 플러그인 시스템.

| 채널 | 방향 | 설명 |
|------|------|------|
| ClaudeCodePlugin_Install | renderer → main | 플러그인 설치 |
| ClaudeCodePlugin_Uninstall | renderer → main | 플러그인 제거 |
| ClaudeCodePlugin_UninstallPackage | renderer → main | 플러그인 패키지 제거 |
| ClaudeCodePlugin_ListInstalled | renderer → main | 설치된 플러그인 목록 |
| ClaudeCodePlugin_WriteContent | renderer → main | 플러그인 콘텐츠 쓰기 |
| ClaudeCodePlugin_InstallFromZip | renderer → main | ZIP에서 설치 |
| ClaudeCodePlugin_InstallFromDirectory | renderer → main | 디렉토리에서 설치 |

---

## Cross-Feature IPC Dependencies

| 소비 Feature | IPC 채널 그룹 | 제공 Feature | 핵심 채널 |
|-------------|-------------|-------------|----------|
| F002 | Config | F001 | Config_Get, Config_Set |
| F003 | Config, Backup, Shortcuts | F001 | Config_Get/Set, Backup_*, Shortcuts_Update |
| F004 | Config, AES | F001 | Config_Get/Set, Aes_Encrypt/Decrypt |
| F005 | File, KB, Memory, Trace | F001, F006, F009 | File_Upload, KnowledgeBase_Search, Memory_Search |
| F006 | File, KB | F001 | File_Upload/Read, KnowledgeBase_Create/Add/Search |
| F007 | OCR | F001 | OCR_ocr, OCR_ListProviders |
| F008 | File, MCP, CodeTools | F001 | File_*, Mcp_*, CodeTools_* |
| F009 | Memory | F001 | Memory_Add/Search/List |
| F010 | Agent, Plugin, Selection | F001 | AgentMessage_*, ClaudeCodePlugin_* |

---

## API Server (F010) — HTTP Endpoints

F010의 Agent 시스템은 Express 기반 API 서버를 제공한다. localhost에서만 접근 가능하며, 에이전트 CRUD와 세션 관리를 REST API로 노출한다.

### Agent Endpoints

| Method | Path | 설명 |
|--------|------|------|
| POST | /agents | 에이전트 생성 |
| GET | /agents | 에이전트 목록 (페이지네이션) |
| GET | /agents/:agentId | 에이전트 상세 조회 |
| PUT | /agents/:agentId | 에이전트 전체 수정 |
| PATCH | /agents/:agentId | 에이전트 부분 수정 |
| DELETE | /agents/:agentId | 에이전트 삭제 |

### Session Endpoints

| Method | Path | 설명 |
|--------|------|------|
| POST | /agents/:agentId/sessions | 세션 생성 |
| GET | /agents/:agentId/sessions | 세션 목록 (페이지네이션) |
| GET | /agents/:agentId/sessions/:sessionId | 세션 상세 조회 |
| PUT | /agents/:agentId/sessions/:sessionId | 세션 전체 수정 |
| PATCH | /agents/:agentId/sessions/:sessionId | 세션 부분 수정 |
| DELETE | /agents/:agentId/sessions/:sessionId | 세션 삭제 |

### Session Message Endpoints

| Method | Path | 설명 |
|--------|------|------|
| POST | /agents/:agentId/sessions/:sessionId/messages | 메시지 전송 (스트리밍 응답) |
| GET | /agents/:agentId/sessions/:sessionId/messages | 메시지 목록 |
| DELETE | /agents/:agentId/sessions/:sessionId/messages/:messageId | 메시지 삭제 |

### 요청/응답 검증

모든 요청 body와 파라미터는 Zod 스키마로 검증된다:
- `CreateAgentRequestSchema` — 에이전트 생성 body
- `UpdateAgentRequestSchema` — 에이전트 수정 body
- `AgentIdParamSchema` — agentId 파라미터
- `SessionIdParamSchema` — sessionId 파라미터
- `PaginationQuerySchema` — 페이지네이션 쿼리 (limit, offset, status)
- `CreateSessionMessageRequestSchema` — 메시지 body (content, effort?, thinking?)
