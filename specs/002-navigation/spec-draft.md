# Navigation — Spec Draft

> `/reverse-spec` Phase 4에서 자동 생성. `/speckit.specify`의 시드 입력으로 사용.

## Feature 설명

앱 내비게이션 시스템으로, 상단(top) 또는 좌측(left) Navbar, 탭 시스템(추가/닫기/재정렬), 사이드바 아이콘 관리, HashRouter 기반 라우팅을 담당한다.

## 기능 요구사항 (Functional Requirements)

### 라우팅 시스템
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-001 | HashRouter를 사용하여 13개 라우트를 정의한다 | — (Router) | B032, B048 |
| FR-002 | navbarPosition 값(top/left)에 따라 TabsContainer 또는 Sidebar 레이아웃으로 분기한다 | Layout | B031 |
| FR-003 | 라우트 변경 시 탭 상태와 동기화한다 | — (Handler) | B041 |

### 탭 시스템 (Top 모드)
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-004 | 탭 바를 렌더링하고, 활성 탭을 하이라이트한다 | TabBar | B033 |
| FR-005 | "+" 버튼으로 새 탭을 추가한다 | Button | B034 |
| FR-006 | 탭의 × 버튼으로 탭을 닫는다 (Home 탭은 닫기 불가) | Button | B035 |
| FR-007 | 탭을 드래그 앤 드롭으로 재정렬한다 (@dnd-kit/sortable) | DnD | B036 |
| FR-008 | 탭 클릭 시 활성 탭을 전환하고 해당 라우트로 이동한다 | Tab | B037 |
| FR-009 | 탭 상태를 F001 Config API로 영속화하여 재시작 시 복원한다 | — (persist) | B049 |

### Navbar
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-010 | 44px 높이의 공용 Navbar를 렌더링한다 (좌/중앙/우 영역) | Navbar | B038 |
| FR-011 | Navbar 우측에 미니윈도우 아이콘과 설정(gear) 아이콘을 표시한다 | IconButton | B042 |

### 사이드바 (Left 모드)
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-012 | 50px 너비의 좌측 아이콘 사이드바를 렌더링한다 | Sidebar | B039 |
| FR-013 | 각 아이콘 클릭 시 해당 라우트로 이동한다 | IconButton | B039 |
| FR-014 | 사이드바 아이콘을 드래그로 재정렬한다 (@dnd-kit/sortable) | DnD | B050 |
| FR-015 | 사이드바에 표시할 아이콘을 선택하고 순서를 관리한다 | Checkbox, DnD | B040 |

### 레이아웃 모드 전환
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-016 | navbarPosition(top/left)을 F001 Config에 저장한다 | — (persist) | B044 |
| FR-017 | navbarPosition 값을 읽어 레이아웃을 결정하는 훅을 제공한다 | — (Hook) | B045 |

## 성공 기준 (Success Criteria)

### Happy Path
| ID | 시나리오 | 조건 | 기대 결과 |
|----|---------|------|----------|
| SC-001 | 탭 추가 | "+" 버튼 클릭 | 새 탭이 생성되고 해당 페이지로 라우트 이동 |
| SC-002 | 탭 닫기 | 탭의 × 클릭 | 탭 제거, 인접 탭으로 자동 이동 |
| SC-003 | 탭 재정렬 | 탭을 드래그하여 위치 변경 | 탭 순서가 변경되고 영속화됨 |
| SC-004 | 사이드바 모드 | navbarPosition을 left로 변경 | Sidebar 레이아웃으로 즉시 전환 |
| SC-005 | 탭 상태 복원 | 앱 재시작 | 이전 세션의 탭 목록과 활성 탭이 복원됨 |

### Error Paths
| ID | 시나리오 | 조건 | 기대 결과 |
|----|---------|------|----------|
| SC-E01 | Home 탭 닫기 시도 | Home 탭의 × 클릭 | 닫기 무시, Home 탭 유지 |
| SC-E02 | 잘못된 라우트 | 존재하지 않는 라우트 접근 | Home(/)으로 리다이렉트 |

### Cross-Feature
| ID | 시나리오 | 조건 | 기대 결과 |
|----|---------|------|----------|
| SC-X01 | F003에서 navbar 위치 변경 | DisplaySettings에서 top→left 전환 | 즉시 레이아웃 재구성, 탭→사이드바 |
| SC-X02 | F005에서 프로그래밍 라우트 이동 | route:navigate 호출 | 해당 라우트로 이동하고 탭 동기화 |
| SC-X03 | F001 테마 변경 | 테마 dark↔light | Navbar/Sidebar 스타일이 테마에 맞게 갱신 |
