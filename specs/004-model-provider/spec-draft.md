# Model Provider — Spec Draft

> `/reverse-spec` Phase 4에서 자동 생성. `/speckit.specify`의 시드 입력으로 사용.

## Feature 설명

AI 모델 프로바이더를 관리하는 Feature로, 프로바이더 CRUD(추가/편집/삭제/활성화), API 키 암호화(safeStorage), 모델 관리(목록/추가/편집/삭제/ManagePopup), 연결 상태 확인(Health Check), 기본 모델 설정을 담당한다.

## 기능 요구사항 (Functional Requirements)

### 프로바이더 관리
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-001 | 프로바이더 목록을 렌더링한다 (검색 필터, 활성 상태 표시) | List, SearchInput | B086 |
| FR-002 | 프로바이더 상세 설정 폼을 표시한다 (이름, 토글, API Key, Host, 모델) | Form | B087 |
| FR-003 | 새 프로바이더를 추가하는 다이얼로그를 제공한다 (이름, 타입 선택) | Dialog, TextInput, Select | B088 |
| FR-004 | 프로바이더를 Zustand store에 추가한다 | — (Store) | B089 |
| FR-005 | 프로바이더를 삭제한다 (확인 다이얼로그) | Button, Dialog | B090 |
| FR-006 | 프로바이더 정보를 갱신한다 (이름, API Key, Host, 활성 상태) | TextInput, Switch | B091 |
| FR-007 | 프로바이더 활성/비활성을 토글한다 | Switch | B092 |

### API Key 관리
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-008 | API Key를 password input으로 입력받아 Electron safeStorage로 암호화 저장한다 | PasswordInput | B093 |
| FR-009 | API 호출로 프로바이더 연결 상태를 확인한다 (Health Check) | Button, StatusIndicator | B094 |
| FR-010 | 커스텀 API 엔드포인트 URL을 설정하고 preview를 표시한다 | TextInput, Text | B095 |

### 모델 관리
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-011 | 프로바이더의 전체 모델 목록을 조회하여 사용자가 선택한 모델만 추가한다 (ManagePopup) | Dialog, Checkbox | B096 |
| FR-012 | 프로바이더에 추가된 모델 목록을 렌더링한다 (검색, 정렬) | List, SearchInput | B097 |
| FR-013 | 모델 편집 다이얼로그를 제공한다 (이름, ID, 그룹, 능력 태그) | Dialog, TextInput, TagInput | B098 |
| FR-014 | 프로바이더에 모델을 수동으로 추가한다 (ID 직접 입력) | TextInput, Button | B099 |
| FR-015 | 프로바이더에서 모델을 삭제한다 | Button | B100 |
| FR-016 | /v1/models 엔드포인트를 호출하여 사용 가능한 모델을 자동 발견한다 | — (API) | B117 |
| FR-017 | 모델 능력(vision, web_search, embedding, rerank 등)을 태그로 표시한다 | Tag | B106, B107, B108 |

### 기본 모델 설정
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-018 | 기본 모델(Default Model)을 선택한다 | Dropdown | B102, B116 |
| FR-019 | Quick 모델을 선택한다 | Dropdown | B103 |
| FR-020 | 번역 모델을 선택한다 | Dropdown | B104 |

### 프로바이더별 특화 설정
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-021 | 커스텀 HTTP 헤더를 추가/편집한다 | Dialog, KeyValueInput | B113 |
| FR-022 | AWS Bedrock 인증(Access Key, Secret Key, Region)을 설정한다 | TextInput | B112 |
| FR-023 | GitHub Copilot 디바이스 코드 인증 플로우를 지원한다 | Button, Text | B110 |

## 성공 기준 (Success Criteria)

### Happy Path
| ID | 시나리오 | 조건 | 기대 결과 |
|----|---------|------|----------|
| SC-001 | 프로바이더 추가 | Add 버튼 → 이름/타입 입력 → 확인 | 목록에 새 프로바이더 표시, persist 저장 |
| SC-002 | API Key 설정 + Health Check | API Key 입력 → Check 버튼 | 성공 시 녹색 상태, 실패 시 적색 상태 |
| SC-003 | 모델 Manage | Manage 버튼 → 모델 목록 로드 → 체크박스 선택 | 선택된 모델만 프로바이더에 추가 |
| SC-004 | 기본 모델 설정 | /settings/model에서 Default Model 선택 | 새 채팅 시 선택된 모델이 기본값 |
| SC-005 | 프로바이더 비활성화 | 토글 OFF | 해당 프로바이더의 모델이 선택 드롭다운에서 숨겨짐 |

### Error Paths
| ID | 시나리오 | 조건 | 기대 결과 |
|----|---------|------|----------|
| SC-E01 | Health Check 실패 | 잘못된 API Key로 Check | 적색 상태 표시, 에러 메시지 |
| SC-E02 | 모델 자동 발견 실패 | /v1/models 엔드포인트 응답 없음 | 에러 토스트, 수동 추가로 안내 |
| SC-E03 | 프로바이더 삭제 시 사용 중 | 기본 모델이 해당 프로바이더에 속함 | 경고 다이얼로그 표시 |

### Cross-Feature
| ID | 시나리오 | 조건 | 기대 결과 |
|----|---------|------|----------|
| SC-X01 | F005 모델 선택 | 채팅에서 모델 드롭다운 표시 | 활성 프로바이더의 모델만 목록에 표시 |
| SC-X02 | F006 임베딩 모델 | KB 생성 시 임베딩 모델 선택 | embedding 능력 태그가 있는 모델만 필터링 |
| SC-X03 | F001 safeStorage | API Key 저장 | main process에서 safeStorage로 암호화 |
