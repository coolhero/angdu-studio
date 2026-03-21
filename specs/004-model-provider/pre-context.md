# F004 — Model Provider Pre-Context

> **모드**: Rebuild, New Stack
> **소스 루트**: `/Users/coolhero/Develop/cherry-studio`

---

## 1. 요약 (Brief Summary)

AI 모델 프로바이더 관리 Feature이다. 프로바이더 CRUD(추가/편집/삭제/활성화), API 키 암호화(safeStorage), 모델 관리(목록 조회/추가/편집/삭제/ManagePopup), 연결 상태 확인(Health Check)을 담당한다. 11개 이상의 프로바이더를 Vercel AI SDK v4+로 통합 지원하며, 프로바이더별 커스텀 설정(API Host, 헤더, OAuth 등)을 제공한다.

---

## 2. 런타임 탐색 결과 (Runtime Exploration Results)

| 항목 | 관찰 결과 |
|------|----------|
| 프로바이더 목록 | CherryIN, SiliconFlow, AiHubMix, ocoolAI, BigModel, DeepSeek, Alaya NeW, DMXAPI, AiOnly, BurnCloud, TokenFlux + "Add" 버튼 |
| 프로바이더 상세 | 이름, ON/OFF 토글, Login 버튼, API Key (password input + "Get API Key" + "Check"), API Host (text + preview), Models (Search + "Manage" + "Add") |
| Settings 라우트 | /settings/provider (프로바이더 목록 + 상세), /settings/model (기본 모델 설정) |
| Model 선택 UI | ant-select 드롭다운, 검색 가능 |
| 녹색 토글 | 활성 프로바이더 표시 |

---

## 3. 소스 참조 (Source Reference)

| File Path | Role | Rebuild Target |
|-----------|------|----------------|
| src/renderer/src/pages/settings/ProviderSettings/ProviderList.tsx | 프로바이더 목록 UI | TBD |
| src/renderer/src/pages/settings/ProviderSettings/ProviderSetting.tsx | 프로바이더 상세 설정 UI | TBD |
| src/renderer/src/pages/settings/ProviderSettings/AddProviderPopup.tsx | 프로바이더 추가 팝업 | TBD |
| src/renderer/src/pages/settings/ProviderSettings/index.ts | 프로바이더 설정 export | TBD |
| src/renderer/src/pages/settings/ProviderSettings/ModelList/ | 모델 목록 컴포넌트 | TBD |
| src/renderer/src/pages/settings/ProviderSettings/EditModelPopup/ | 모델 편집 팝업 | TBD |
| src/renderer/src/pages/settings/ProviderSettings/SelectProviderModelPopup.tsx | 프로바이더 모델 선택 (Manage) 팝업 | TBD |
| src/renderer/src/pages/settings/ProviderSettings/ApiOptionsSettings/ | API 옵션 설정 (헤더, 모드 등) | TBD |
| src/renderer/src/pages/settings/ProviderSettings/AnthropicSettings.tsx | Anthropic 전용 설정 | TBD |
| src/renderer/src/pages/settings/ProviderSettings/AwsBedrockSettings.tsx | AWS Bedrock 전용 설정 | TBD |
| src/renderer/src/pages/settings/ProviderSettings/VertexAISettings.tsx | Vertex AI 전용 설정 | TBD |
| src/renderer/src/pages/settings/ProviderSettings/GithubCopilotSettings.tsx | GitHub Copilot OAuth 설정 | TBD |
| src/renderer/src/pages/settings/ProviderSettings/CherryINSettings.tsx | CherryIN 전용 설정 (→ 제거 대상) | TBD |
| src/renderer/src/pages/settings/ProviderSettings/CherryINOAuth.tsx | CherryIN OAuth (→ 제거 대상) | TBD |
| src/renderer/src/pages/settings/ProviderSettings/CustomHeaderPopup.tsx | 커스텀 HTTP 헤더 설정 | TBD |
| src/renderer/src/pages/settings/ProviderSettings/ModelNotesPopup.tsx | 모델 노트 팝업 | TBD |
| src/renderer/src/pages/settings/ProviderSettings/UrlSchemaInfoPopup.tsx | URL 스키마 정보 팝업 | TBD |
| src/renderer/src/pages/settings/ModelSettings/ModelSettings.tsx | 기본 모델 설정 (Default Model 페이지) | TBD |
| src/renderer/src/store/llm.ts | 프로바이더/모델 상태 관리 (Redux slice) | TBD |
| src/renderer/src/config/providers.ts | 시스템 프로바이더 기본값 정의 | TBD |
| src/renderer/src/config/models.ts | 시스템 모델 기본값, 모델 유틸리티 함수 | TBD |
| src/main/services/AnthropicService.ts | Anthropic API 서비스 (main process) | TBD |
| src/main/services/CopilotService.ts | GitHub Copilot OAuth 서비스 (main process) | TBD |
| src/main/services/VertexAIService.ts | Vertex AI 서비스 (main process) | TBD |
| src/main/services/CherryINOAuthService.ts | CherryIN OAuth (→ 제거 대상) | TBD |

---

## 4. 소스 행위 목록 (Source Behavior Inventory)

| ID | Source File | Function/Method | Behavior Description | Priority | Origin |
|----|------------|-----------------|---------------------|----------|--------|
| B086 | ProviderList.tsx | ProviderList() | 프로바이더 목록 렌더링 (검색 필터, 활성 상태 표시) | P0 | source |
| B087 | ProviderSetting.tsx | ProviderSetting() | 프로바이더 상세 설정 폼 (이름, 토글, API Key, API Host, 모델) | P0 | source |
| B088 | AddProviderPopup.tsx | AddProviderPopup() | 새 프로바이더 추가 다이얼로그 (이름, 타입 선택) | P0 | source |
| B089 | llm.ts | addProvider() | 프로바이더 상태에 새 항목 추가 | P0 | source |
| B090 | llm.ts | removeProvider() | 프로바이더 삭제 | P1 | source |
| B091 | llm.ts | updateProvider() | 프로바이더 정보 갱신 (이름, API Key, Host, 활성 상태) | P0 | source |
| B092 | llm.ts | setProviderEnabled() | 프로바이더 활성/비활성 토글 | P0 | source |
| B093 | ProviderSetting.tsx | API Key 입력 | password input → electron safeStorage로 암호화 저장 | P0 | source |
| B094 | ProviderSetting.tsx | Check (Health Check) | API 호출로 프로바이더 연결 상태 확인 → 성공/실패 표시 | P0 | source |
| B095 | ProviderSetting.tsx | API Host 설정 | 커스텀 API 엔드포인트 URL 입력 + preview 표시 | P1 | source |
| B096 | SelectProviderModelPopup.tsx | ManagePopup() | 프로바이더의 전체 모델 목록 조회 → 사용자가 선택한 모델만 추가 | P0 | source |
| B097 | ModelList/ | ModelList() | 프로바이더에 추가된 모델 목록 렌더링 (검색, 정렬) | P0 | source |
| B098 | EditModelPopup/ | EditModelPopup() | 모델 편집 다이얼로그 (이름, ID, 그룹, 능력 태그) | P1 | source |
| B099 | llm.ts | addModel() | 프로바이더에 모델 추가 | P0 | source |
| B100 | llm.ts | removeModel() | 프로바이더에서 모델 삭제 | P1 | source |
| B101 | llm.ts | updateModel() | 모델 정보 갱신 | P1 | source |
| B102 | llm.ts | setDefaultModel() | 기본 모델 설정 | P0 | source |
| B103 | llm.ts | setQuickModel() | Quick 모델 설정 | P1 | source |
| B104 | llm.ts | setTranslateModel() | 번역 모델 설정 | P2 | source |
| B105 | providers.ts | SYSTEM_PROVIDERS | 시스템 기본 프로바이더 목록 (OpenAI, Anthropic, Google 등) | P0 | source |
| B106 | models.ts | isVisionModel() | 모델이 비전 지원 여부 확인 | P1 | source |
| B107 | models.ts | isWebSearchModel() | 모델이 웹 검색 지원 여부 확인 | P1 | source |
| B108 | models.ts | isEmbeddingModel() / isRerankModel() | 임베딩/리랭크 모델 판별 | P1 | source |
| B109 | AnthropicService.ts | Anthropic API | Anthropic 전용 API 호출 (token counting 등) | P1 | source |
| B110 | CopilotService.ts | OAuth 플로우 | GitHub Copilot 디바이스 코드 인증 | P2 | source |
| B111 | VertexAIService.ts | Vertex AI 인증 | Google Vertex AI 서비스 계정 인증 | P2 | source |
| B112 | AwsBedrockSettings.tsx | AWS 인증 설정 | Access Key / Secret Key / Region 설정 | P2 | source |
| B113 | CustomHeaderPopup.tsx | 커스텀 헤더 | 프로바이더별 커스텀 HTTP 헤더 추가/편집 | P2 | source |
| B114 | llm.ts | LlmSettings (ollama) | Ollama keepAliveTime 설정 | P2 | source |
| B115 | llm.ts | LlmSettings (lmstudio) | LMStudio keepAliveTime 설정 | P2 | source |
| B116 | ModelSettings.tsx | 기본 모델 페이지 | defaultModel, quickModel, translateModel 선택 UI | P0 | source |
| B117 | ProviderSetting.tsx | 모델 자동 발견 | /v1/models 엔드포인트 호출 → 사용 가능한 모델 목록 수집 | P1 | source |
| B118 | llm.ts | providers 초기 상태 | SYSTEM_PROVIDERS에서 기본 프로바이더 목록 로드 | P0 | source |
| B119 | ProviderOAuth.tsx | OAuth 공용 컴포넌트 | OAuth 인증 플로우 UI (로그인/로그아웃 버튼) | P2 | source |
| B120 | ModelNotesPopup.tsx | 모델 노트 | 모델별 사용자 메모 저장/표시 | P3 | source |

---

## 5. UI 컴포넌트 기능 (UI Component Features)

| 컴포넌트 | 기능 설명 |
|---------|----------|
| ProviderList | 프로바이더 목록 (검색, 활성 표시, 선택) |
| ProviderSetting | 프로바이더 상세 폼 (이름, 토글, API Key, Host, Models) |
| AddProviderPopup | 새 프로바이더 추가 모달 |
| SelectProviderModelPopup | 모델 Manage 팝업 (전체 모델 목록에서 선택) |
| ModelList | 프로바이더의 활성 모델 목록 |
| EditModelPopup | 모델 정보 편집 모달 |
| HealthStatusIndicator | 프로바이더 연결 상태 인디케이터 (Check 결과) |
| ModelSettings | 기본 모델/Quick 모델/번역 모델 선택 페이지 |
| CustomHeaderPopup | 커스텀 HTTP 헤더 설정 모달 |
| ModelIdWithTags | 모델 ID + 능력 태그 (vision, web-search 등) 표시 |

---

## 6. 인터랙션 행위 목록 (Interaction Behavior Inventory)

| 인터랙션 | 트리거 | 결과 |
|---------|--------|------|
| 프로바이더 선택 | 목록에서 클릭 | 우측에 상세 설정 표시 |
| 프로바이더 추가 | "Add" 버튼 클릭 | AddProviderPopup 표시 → 이름/타입 입력 → 목록에 추가 |
| 프로바이더 삭제 | 컨텍스트 메뉴 또는 삭제 버튼 | 확인 다이얼로그 → 삭제 |
| 프로바이더 활성화 | ON/OFF 토글 | 활성/비활성 전환, 비활성 시 해당 프로바이더 모델 사용 불가 |
| API Key 입력 | password input에 키 입력 | safeStorage로 암호화 저장 |
| Health Check | "Check" 버튼 클릭 | API 호출 → 성공(녹색)/실패(적색) 표시 |
| 모델 Manage | "Manage" 버튼 클릭 | 전체 모델 목록 팝업 → 체크박스로 선택 → 추가 |
| 모델 추가 | "Add" 버튼 클릭 | 수동 모델 추가 (ID 직접 입력) |
| 모델 편집 | 모델 항목 클릭 | EditModelPopup 표시 → 이름/그룹/태그 편집 |
| 모델 삭제 | 모델 항목 삭제 버튼 | 목록에서 제거 |
| 기본 모델 설정 | /settings/model 페이지 드롭다운 | 기본/Quick/번역 모델 선택 |

---

## 7. 컴포넌트 트리 (Component Tree)

```
SettingsPage (F003에서 라우트 제공)
└── Routes
    ├── /settings/provider → ProviderList + ProviderSetting
    │   ├── ProviderList
    │   │   ├── SearchInput
    │   │   ├── ProviderItem[] (이름 + 활성 상태)
    │   │   └── AddButton
    │   └── ProviderSetting
    │       ├── ProviderName + Toggle
    │       ├── OAuthSection (해당 시)
    │       ├── ApiKeyInput + CheckButton
    │       ├── ApiHostInput + PreviewUrl
    │       ├── ApiOptionsSettings (커스텀 헤더 등)
    │       ├── ModelList
    │       │   ├── SearchInput
    │       │   ├── ModelItem[] (이름 + 태그)
    │       │   ├── ManageButton → SelectProviderModelPopup
    │       │   └── AddButton → EditModelPopup
    │       └── ProviderSpecificSettings (Anthropic/Bedrock/Vertex 등)
    │
    └── /settings/model → ModelSettings
        ├── DefaultModelSelect
        ├── QuickModelSelect
        └── TranslateModelSelect
```

---

## 8. 데이터 생명주기 패턴 (Data Lifecycle Patterns)

| 데이터 | 저장소 | 생성 시점 | 읽기 시점 | 갱신 시점 | 삭제 시점 |
|--------|--------|----------|----------|----------|----------|
| Provider 목록 | Zustand persist (localStorage) | 최초 실행 (SYSTEM_PROVIDERS) 또는 사용자 추가 | 프로바이더 목록 UI, 모델 선택 드롭다운 | 사용자 편집, 토글 변경 | 사용자 삭제 |
| Provider API Key | Electron safeStorage (암호화) | 사용자 입력 | API 호출 시 복호화 | 사용자 재입력 | 프로바이더 삭제 |
| Model 목록 | Provider.models[] (Zustand persist) | Manage에서 선택 또는 수동 추가 | 모델 선택 UI, 목록 렌더링 | 편집, 태그 변경 | 사용자 삭제 |
| Model 캐시 | Zustand persist | 자동 발견 결과 캐싱 | ManagePopup 재오픈 시 | 새로 Fetch 시 | 프로바이더 변경 |
| 기본 모델 설정 | Zustand persist | 최초 실행 (SYSTEM_MODELS.defaultModel) | 채팅 시 모델 선택 기본값 | 사용자 변경 | N/A |

---

## 9. 네이밍 리매핑 (Naming Remapping: Cherry → Angdu)

| 위치 | Cherry 원본 | Angdu 대상 |
|------|------------|-----------|
| CherryINSettings.tsx | CherryIN 프로바이더 | 제거 (Angdu 전용 프로바이더 없음) |
| CherryINOAuth.tsx | CherryIN OAuth 서비스 | 제거 |
| CherryINOAuthService.ts | CherryIN OAuth 서비스 (main) | 제거 |
| providers.ts | SYSTEM_PROVIDERS 내 CherryIN 항목 | 제거 |
| llm.ts | cherryIn settings | 제거 |

---

## 10. 정적 리소스 (Static Resources)

| 리소스 | 경로 | 용도 |
|--------|------|------|
| Provider 로고 | src/renderer/src/components/ProviderAvatar.tsx | 프로바이더별 아이콘/로고 표시 |
| ProviderLogoPicker | src/renderer/src/components/ProviderLogoPicker/ | 커스텀 프로바이더 로고 선택 |
| Lucide Icons | lucide-react | Cloud, Package, Plus, Trash 등 |

---

## 11. 환경 변수 (Environment Variables)

| 변수명 | 용도 | 기본값 |
|--------|------|--------|
| 해당 Feature 전용 환경 변수 없음 | — | — |

> API Key는 환경 변수가 아닌 safeStorage를 통해 앱 내부에서 관리.

---

## 12. Feature 계약 (Feature Contracts)

### 제공하는 계약 (Exports)

| 계약 ID | 타입 | 설명 | 소비자 |
|---------|------|------|--------|
| provider:list | 상태 | 활성 프로바이더 목록 | F005 (모델 선택 드롭다운) |
| provider:getApiKey | 함수 | 복호화된 API Key 반환 | F005 (AI 호출) |
| model:list | 상태 | 활성 모델 목록 | F005 (모델 선택), F006 (임베딩 모델) |
| model:default | 상태 | 기본 모델 설정값 | F005 (새 채팅 시 기본 모델) |
| model:capabilities | 함수 | 모델 능력 판별 (vision, webSearch, embedding 등) | F005, F006 |

### 의존하는 계약 (Imports)

| 계약 ID | 제공자 | 설명 |
|---------|--------|------|
| config:get/set | F001 | 프로바이더 설정 영속화 (safeStorage) |
| route:navigate | F002 | 설정 페이지 내 라우트 |

---

## 13. /speckit.specify 참고사항

- Redux slice (llm.ts) → Zustand store로 전환, Provider 타입 재정의
- safeStorage API는 Electron main process에서만 사용 가능 → IPC 경유 필수
- Vercel AI SDK v4+ 의존: @ai-sdk/openai, @ai-sdk/anthropic, @ai-sdk/google, @ai-sdk/azure, @ai-sdk/mistral, @ai-sdk/amazon-bedrock
- CherryIN 관련 코드 전부 제거 (CherryINSettings, CherryINOAuth, CherryINOAuthService)
- 모델 자동 발견: /v1/models 호출 → OpenAI 호환 엔드포인트 표준
- Provider 타입: Provider.type으로 프로바이더 종류 식별 (openai, anthropic, google, azure 등)
- 모델 능력 태그: vision, web_search, function_calling, embedding, rerank 등

---

## 14. /speckit.plan 참고사항

- F001 완료 후 구현 가능 (safeStorage IPC 필요)
- F003과 병행 가능 (설정 페이지 구조만 F003에서 제공)
- 구현 순서: Provider 타입 정의 → Zustand store → ProviderList UI → ProviderSetting UI → Health Check → ManagePopup → EditModelPopup → ModelSettings
- 검증: 프로바이더 추가 → API Key 설정 → Health Check 통과 → 모델 Manage → 기본 모델 설정

---

## 15. /speckit.analyze 참고사항

- SYSTEM_PROVIDERS가 10개 이상으로 목록이 길다 → 초기 빌드에서는 주요 5개 (OpenAI, Anthropic, Google, Azure, Ollama)로 축소 가능
- GitHub Copilot OAuth는 디바이스 코드 인증이라 복잡도 높음 → P2로 후순위
- Vertex AI는 서비스 계정 JSON 파일 업로드 필요 → P2
- AWS Bedrock은 authType 분기 (IAM / API Key) → P2
- llm.ts의 LlmSettings 구조가 프로바이더별 분기되어 있어 확장성 제한 → 리팩토링 필요
- 모델 타입 판별 함수 (isVisionModel, isWebSearchModel 등)는 모델 이름 패턴 매칭 기반 → 메타데이터 기반으로 개선 권장
