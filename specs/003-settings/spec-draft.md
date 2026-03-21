# Settings — Spec Draft

> `/reverse-spec` Phase 4에서 자동 생성. `/speckit.specify`의 시드 입력으로 사용.

## Feature 설명

앱 설정 페이지 전체를 담당하며, General, Display, Data, Shortcuts, About 등 12개 이상의 서브 페이지에서 다양한 UI 컨트롤(Switch, Select, Input, Slider)로 설정을 관리한다. 백업/복원(로컬/WebDAV/S3), 단축키 관리, i18n 언어 전환 기능을 포함한다.

## 기능 요구사항 (Functional Requirements)

### 설정 페이지 레이아웃
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-001 | 좌측 사이드바 메뉴 + 우측 콘텐츠 영역의 중첩 라우트 구조를 렌더링한다 | Layout, Link | B051 |
| FR-002 | SettingGroup/SettingRow/SettingTitle 공용 컴포넌트로 설정 UI를 구성한다 | Card, Row | B051 |

### General 설정
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-003 | 언어를 드롭다운으로 변경한다 (i18n.changeLanguage + config 저장) | Select | B052 |
| FR-004 | 시작 시 실행 설정을 토글한다 | Switch | B053 |
| FR-005 | 트레이 표시/닫기 시 트레이로 이동/트레이로 시작 설정을 관리한다 | Switch | B054 |
| FR-006 | 프록시 모드(System/Manual/None), URL, bypass 규칙을 설정한다 | Select, TextInput | B055 |
| FR-007 | 맞춤법 검사 활성화 및 언어 선택을 설정한다 | Switch, Select | B057 |
| FR-008 | 하드웨어 가속 비활성화를 토글한다 (재시작 필요 알림) | Switch | B058 |

### Display 설정
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-009 | 테마(dark/light/system)를 선택한다 | Select | B060 |
| FR-010 | 폰트 크기와 폰트 패밀리를 설정한다 | Slider, TextInput | B061 |
| FR-011 | 메시지 스타일(bubble/plain)을 선택한다 | Select | B062 |
| FR-012 | Navbar 위치(top/left)를 전환한다 | Select | B063 |
| FR-013 | 토픽 위치(left/right)를 설정한다 | Select | B064 |
| FR-014 | 사이드바 아이콘 표시/숨김과 순서를 관리한다 | Checkbox, DnD | B065 |

### Data 설정
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-015 | 앱 데이터를 JSON/ZIP으로 내보낸다 | Button | B066 |
| FR-016 | JSON/ZIP 파일에서 데이터를 가져온다 | Button, FileDialog | B067 |
| FR-017 | 모든 데이터를 초기화하고 앱을 재시작한다 | Button | B068 |
| FR-018 | 로컬 백업을 생성한다 (ZIP 압축) | Button | B069, B082 |
| FR-019 | 로컬 백업 파일에서 복원한다 | Button, FileDialog | B070, B083 |
| FR-020 | WebDAV 서버 연결을 설정하고 테스트한다 | TextInput, Button | B071 |
| FR-021 | WebDAV를 통해 백업/복원한다 | Button | B072 |
| FR-022 | S3 엔드포인트/버킷/키를 설정하고 테스트한다 | TextInput, Button | B073 |
| FR-023 | S3를 통해 백업/복원한다 | Button | B074 |

### Shortcuts 설정
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-024 | 시스템/사용자 단축키 목록을 렌더링한다 | List | B075 |
| FR-025 | 키 조합을 캡처하여 단축키를 변경한다 | KeyCapture | B076 |

### About 설정
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-026 | 앱 버전, 라이선스, GitHub 링크를 표시한다 | Text, Link | B077 |
| FR-027 | 수동 업데이트 확인 버튼을 제공한다 | Button | B077 |

### 기타 서브 페이지
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-028 | Quick Assistant 설정 (활성화, 모델 선택, 단축키)을 관리한다 | Switch, Select | B078 |
| FR-029 | 빠른 문구 CRUD (추가/편집/삭제/순서)를 관리한다 | TextInput, Button, DnD | B080 |
| FR-030 | 문서 처리 옵션을 설정한다 | Select, Switch | B081 |

## 성공 기준 (Success Criteria)

### Happy Path
| ID | 시나리오 | 조건 | 기대 결과 |
|----|---------|------|----------|
| SC-001 | 언어 변경 | General > Language에서 'English' 선택 | i18n 즉시 전환, config에 저장, 재시작 후 유지 |
| SC-002 | 테마 전환 | Display > Theme에서 'dark' 선택 | 즉시 다크 테마 적용 |
| SC-003 | 로컬 백업/복원 | Data > Local Backup 생성 → 데이터 변경 → 복원 | 백업 시점의 데이터로 정확히 복원 |
| SC-004 | 단축키 변경 | Shortcuts에서 키 조합 클릭 → Cmd+Shift+K 입력 | 새 단축키가 저장되고 즉시 적용 |
| SC-005 | 사이드바 아이콘 관리 | Display에서 아이콘 숨김/순서 변경 | 사이드바에 즉시 반영 |

### Error Paths
| ID | 시나리오 | 조건 | 기대 결과 |
|----|---------|------|----------|
| SC-E01 | WebDAV 연결 실패 | 잘못된 URL/인증 정보 입력 후 Test 클릭 | 실패 메시지 표시, 설정 저장 안 됨 |
| SC-E02 | 데이터 초기화 취소 | Reset 클릭 → 확인 다이얼로그에서 취소 | 데이터 유지, 아무 동작 없음 |
| SC-E03 | 단축키 충돌 | 이미 사용 중인 키 조합 입력 | 충돌 경고 표시 |

### Cross-Feature
| ID | 시나리오 | 조건 | 기대 결과 |
|----|---------|------|----------|
| SC-X01 | F001 config 영속화 | 설정 변경 → 앱 재시작 | F001 config:get으로 변경값 복원 |
| SC-X02 | F002 navbar 위치 반영 | Display에서 navbar 위치 변경 | F002 레이아웃이 즉시 전환 |
| SC-X03 | F004 프로바이더 설정 라우트 | Settings 사이드바에서 Provider 클릭 | F004 ProviderSettings로 라우트 이동 |
