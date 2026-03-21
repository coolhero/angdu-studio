# Tools Workspace — Spec Draft

> `/reverse-spec` Phase 4에서 자동 생성. `/speckit.specify`의 시드 입력으로 사용.

## Feature 설명

보조 도구 모음을 하나의 Feature로 묶은 워크스페이스이다. Code Tools(CLI 도구 실행), Paintings(이미지 생성), Notes(TipTap 에디터), Files(파일 관리), MCP Servers(MCP 서버 관리), Assistant Store(프리셋 마켓플레이스) 6개 하위 기능을 포함한다.

## 기능 요구사항 (Functional Requirements)

### Code Tools
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-001 | CLI 도구(Claude Code, Codex 등)를 드롭다운으로 선택한다 | Select | B261 |
| FR-002 | 코드 도구용 LLM 모델을 선택한다 | Select | B262 |
| FR-003 | 시스템 터미널 앱을 감지하고 선택한다 | Select | B263 |
| FR-004 | 폴더 선택 다이얼로그로 작업 디렉토리를 추가/제거한다 | FolderDialog, List, Button | B264 |
| FR-005 | 환경 변수 키=값을 편집한다 (API 키 등 자동 생성 포함) | KeyValueInput | B265, B268 |
| FR-006 | canLaunch 조건 충족 시 터미널에서 CLI 도구를 실행한다 | Button | B266 |

### Paintings
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-007 | URL 파라미터로 프로바이더별 이미지 생성 페이지를 분기한다 | TabRouter | B269 |
| FR-008 | 프롬프트 입력, 모델/사이즈/수량 설정으로 이미지를 생성한다 | TextArea, Select, NumberInput, Button | B270-B277 |
| FR-009 | 생성된 이미지를 그리드로 미리보기 표시한다 | ImageGrid | B311 |
| FR-010 | 생성된 이미지를 로컬에 다운로드한다 | Button | B312 |

### Notes
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-011 | 좌측 파일 트리 사이드바 + 우측 에디터 2단 레이아웃을 구성한다 | Layout | B278 |
| FR-012 | 파일/디렉토리 트리를 표시하고, 생성/삭제/이름 변경/드래그 정렬을 지원한다 | TreeView, ContextMenu, DnD | B279, B281, B282, B283 |
| FR-013 | TipTap 기반 마크다운/코드 에디터로 편집하고 자동 저장한다 | TipTapEditor | B280 |
| FR-014 | 파일 트리를 정렬한다 (이름, 날짜, 타입) | Select | B284 |
| FR-015 | 에디터 헤더에서 뷰 전환(마크다운/코드)과 검색을 제공한다 | Button, SearchInput | B286 |
| FR-016 | 노트 즐겨찾기를 관리한다 | IconButton | B310 |

### Files
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-017 | document/image/all 타입별로 파일 목록을 필터링한다 | Select | B287 |
| FR-018 | created_at/size/name 기준으로 파일을 정렬한다 (asc/desc) | Select | B288 |
| FR-019 | 체크박스로 다중 선택하고 일괄 삭제한다 | Checkbox, Button | B289 |
| FR-020 | 컨텍스트 메뉴로 파일 이름을 변경한다 | ContextMenu, TextInput | B290 |
| FR-021 | 파일 메타데이터(이름, 크기, 날짜)를 표시한다 | List | B291 |

### MCP Servers
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-022 | MCP 서버 카드 목록을 표시한다 (상태, 이름, 도구 수, 활성화 토글) | CardList, Switch | B293, B294 |
| FR-023 | 서버 추가 모달을 제공한다 (타입: npx/docker/sse, 이름, 명령어, 인수, 환경 변수) | Dialog, Select, TextInput | B295 |
| FR-024 | MCP 서버 설정 JSON을 직접 편집한다 | Dialog, CodeEditor | B296 |
| FR-025 | MCP 마켓플레이스에서 서버를 검색하고 설치한다 | SearchInput, List | B297 |
| FR-026 | 외부 소스에서 MCP 서버 설정을 동기화한다 | Dialog, Button | B298 |
| FR-027 | MCP 서버의 도구/리소스/프롬프트 목록을 표시한다 | List | B299, B300, B301 |

### Assistant Store
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-028 | 어시스턴트 프리셋 카드를 그리드로 표시한다 | CardGrid | B306 |
| FR-029 | 카테고리별/키워드별로 프리셋을 검색한다 | Select, SearchInput | B307 |
| FR-030 | 마켓플레이스 프리셋을 로컬 어시스턴트로 가져온다 | Button | B308 |

## 성공 기준 (Success Criteria)

### Happy Path
| ID | 시나리오 | 조건 | 기대 결과 |
|----|---------|------|----------|
| SC-001 | Code Tools 실행 | Claude Code 선택 → 모델/디렉토리 설정 → Launch | 터미널에서 CLI 도구 프로세스가 시작됨 |
| SC-002 | 이미지 생성 | 프롬프트 입력 → 생성 버튼 | API 호출 → 이미지 결과 그리드에 표시 |
| SC-003 | 노트 편집 | 사이드바에서 파일 선택 → 에디터에서 편집 | 자동 저장 (debounce), 파일 시스템에 반영 |
| SC-004 | MCP 서버 추가 | Add → 설정 입력 → 확인 | 서버 카드 목록에 추가, 활성화 토글 가능 |
| SC-005 | 파일 다중 삭제 | 체크박스 선택 → 삭제 버튼 | 확인 다이얼로그 → 일괄 삭제 |

### Error Paths
| ID | 시나리오 | 조건 | 기대 결과 |
|----|---------|------|----------|
| SC-E01 | CLI Launch 불가 | 모델 또는 작업 디렉토리 미설정 | Launch 버튼 비활성화, 필수 설정 안내 |
| SC-E02 | 이미지 생성 실패 | 프로바이더 API 에러 | 에러 메시지 표시, 입력 유지 |
| SC-E03 | MCP 서버 연결 실패 | 서버 프로세스 시작 불가 | 서버 카드에 에러 상태 표시 |

### Cross-Feature
| ID | 시나리오 | 조건 | 기대 결과 |
|----|---------|------|----------|
| SC-X01 | F004 모델 선택 | Code Tools 모델 선택 | F004의 활성 모델 목록에서 선택 |
| SC-X02 | F005 MCP 도구 | 채팅에서 MCP 도구 호출 | F008의 MCP 서버에서 도구 실행 결과 반환 |
| SC-X03 | F005 어시스턴트 프리셋 | Store에서 프리셋 가져오기 | F005의 어시스턴트 목록에 추가 |
