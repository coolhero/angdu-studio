# Knowledge Base — Spec Draft

> `/reverse-spec` Phase 4에서 자동 생성. `/speckit.specify`의 시드 입력으로 사용.

## Feature 설명

지식 베이스(Knowledge Base) CRUD 및 RAG 문서 수집 기능을 제공한다. 파일(PDF/DOCX/TXT/MD/CSV/이미지), URL, 노트 등 다양한 소스를 업로드하면 청킹, 임베딩, 벡터 DB 저장을 수행하고, 유사도 검색과 리랭킹을 통해 채팅 컨텍스트에 지식을 주입한다.

## 기능 요구사항 (Functional Requirements)

### KB CRUD
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-001 | KB를 생성한다 (이름, 임베딩 모델, 차원, 청크 사이즈/오버랩 설정) | Dialog, TextInput, Select, NumberInput | B201, B238 |
| FR-002 | KB 목록을 좌측 사이드바에 DraggableList로 렌더링한다 | List, DnD | B225 |
| FR-003 | KB 항목 우클릭으로 컨텍스트 메뉴(이름 변경, 설정, 삭제)를 표시한다 | ContextMenu | B226 |
| FR-004 | KB를 삭제한다 (store + 벡터 DB 파일 제거, 확인 다이얼로그) | Dialog, Button | B202 |
| FR-005 | KB 이름을 변경한다 | TextInput | B203 |
| FR-006 | KB 설정을 편집한다 (리랭크 모델, 전처리 프로바이더, threshold 등) | Dialog, Select, NumberInput | B204, B239 |

### 문서 수집 및 콘텐츠 관리
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-007 | 6개 탭(Files/Notes/URLs/Sitemaps/Directories/Videos)으로 콘텐츠를 분류 표시한다 | Tabs | B228 |
| FR-008 | 파일을 드래그 앤 드롭 또는 파일 선택 다이얼로그로 업로드한다 | DropZone, FileDialog | B229 |
| FR-009 | URL을 입력하여 웹 페이지를 크롤링하고 텍스트를 추출한다 | TextInput, Button | B230 |
| FR-010 | 텍스트를 입력하여 노트 항목을 추가한다 | TextArea, Button | B231 |
| FR-011 | 사이트맵 URL을 입력하여 다수 페이지를 크롤링한다 | TextInput, Button | B232 |
| FR-012 | 폴더를 선택하여 하위 파일을 일괄 수집한다 | FolderDialog | B233 |
| FR-013 | KB에서 항목을 제거한다 | Button | B206 |

### 임베딩 및 벡터 검색
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-014 | 텍스트를 벡터 임베딩으로 변환한다 (프로바이더 API 호출) | — (Service) | B213 |
| FR-015 | 파일 타입별 로더를 선택한다 (PDF, DOCX, TXT, MD, CSV, 이미지) | — (Service) | B214 |
| FR-016 | 동시성을 제어한다 (80MB 워크로드, 30개 병렬 처리 제한) | — (Service) | B209 |
| FR-017 | 검색 결과를 리랭킹한다 (rerankModel 설정 시에만 적용) | — (Service) | B218 |

### 진행률 및 상태
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-018 | IPC 이벤트로 처리 진행률을 실시간 표시한다 | ProgressBar | B227 |
| FR-019 | 처리 상태를 아이콘으로 시각화한다 (pending/processing/completed/failed) | StatusIcon | B227 |

### 검색 테스트
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-020 | KB 내 유사도 검색을 테스트하는 다이얼로그를 제공한다 | Dialog, TextInput, List | B237 |

### 전처리
| ID | 요구사항 | UI 컨트롤 | Source |
|----|---------|-----------|--------|
| FR-021 | 전처리 프로바이더(doc2x, mistral, mineru, paddleocr)를 팩토리 패턴으로 생성한다 | — (Service) | B216 |
| FR-022 | 파일 전처리(OCR, 문서 변환)를 실행한다 | — (Service) | B217 |

## 성공 기준 (Success Criteria)

### Happy Path
| ID | 시나리오 | 조건 | 기대 결과 |
|----|---------|------|----------|
| SC-001 | KB 생성 | "+" 버튼 → 이름/모델/설정 입력 → 확인 | 사이드바에 새 KB 표시, 빈 콘텐츠 영역 |
| SC-002 | 파일 업로드 + 임베딩 | Files 탭에 PDF 드래그 앤 드롭 | 진행률 표시 → 전처리 → 청킹 → 임베딩 → completed 상태 |
| SC-003 | 유사도 검색 | 검색 팝업에서 쿼리 입력 → 검색 | 관련 문서 청크가 유사도 점수와 함께 표시 |
| SC-004 | KB 삭제 | 우클릭 → 삭제 → 확인 | KB가 목록에서 제거, 벡터 DB 파일 정리 |

### Error Paths
| ID | 시나리오 | 조건 | 기대 결과 |
|----|---------|------|----------|
| SC-E01 | 임베딩 API 실패 | 잘못된 임베딩 모델 설정 | 항목 상태가 failed로 전환, 에러 메시지 표시 |
| SC-E02 | 대용량 파일 | 80MB 초과 파일 업로드 | 워크로드 제한으로 대기열에 진입, 순서대로 처리 |
| SC-E03 | 전처리 실패 | OCR 서비스 불가 | failed 상태, 재시도 버튼 제공 |

### Cross-Feature
| ID | 시나리오 | 조건 | 기대 결과 |
|----|---------|------|----------|
| SC-X01 | F005 채팅 RAG | 채팅에서 KB 선택 후 질문 | KnowledgeSearchTool이 관련 문서를 찾아 컨텍스트에 주입 |
| SC-X02 | F004 임베딩 모델 | KB 생성 시 모델 선택 | F004의 embedding 능력 모델만 필터링하여 표시 |
| SC-X03 | F005 메시지 → KB 저장 | 채팅 메시지를 KB 노트로 저장 | SaveToKnowledgePopup으로 KB 선택 → 노트 항목으로 추가 |
