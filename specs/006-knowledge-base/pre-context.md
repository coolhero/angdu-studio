# F006 — knowledge-base Pre-Context

> **모드**: Rebuild, New Stack
> **소스 루트**: `/Users/coolhero/Develop/cherry-studio` (상대 경로 사용)

---

## 1. Brief Summary

지식 베이스(Knowledge Base) CRUD 및 RAG 문서 수집 기능을 제공한다.
사용자가 KB를 생성하고, 파일(PDF/DOCX/TXT/MD/CSV/이미지), URL, 사이트맵, 디렉토리, 노트, 동영상 등 다양한 소스를 업로드하면 자동으로 청킹, 전처리, 임베딩을 수행하여 벡터 DB에 저장한다.
유사도 검색(cosine similarity)과 리랭킹을 통해 채팅 컨텍스트에 관련 지식을 주입하며, 동시 수집 제한(80MB 최대, 30개 병렬)으로 리소스를 관리한다.

---

## 2. Runtime Exploration Results

| 항목 | 관찰 결과 |
|------|----------|
| 초기 상태 | "No knowledge base found" 빈 상태, "+ Add" 버튼 표시 |
| KB 생성 | Add 버튼 → AddKnowledgeBasePopup (이름, 임베딩 모델, 차원, 청크 사이즈/오버랩 설정) |
| KB 목록 | 좌측 사이드바에 DraggableList로 KB 목록 렌더링, 컨텍스트 메뉴(이름 변경, 설정, 삭제) |
| 콘텐츠 탭 | Files, Notes, URLs, Sitemaps, Directories, Videos 6개 탭 |
| 파일 업로드 | 드래그 앤 드롭 + 파일 선택 다이얼로그, 진행률 표시 |
| 검색 | KnowledgeSearchPopup으로 KB 내 유사도 검색 테스트 |
| 설정 | KB별 임베딩 모델, 청크 사이즈, 오버랩, threshold, 리랭크 모델, 전처리 프로바이더 설정 |
| IPC 이벤트 | file-preprocess-finished, file-preprocess-progress, file-ocr-progress, directory-processing-percent |

---

## 3. Source Reference

| File Path | Role | Rebuild Target |
|-----------|------|---------------|
| `src/renderer/src/pages/knowledge/KnowledgePage.tsx` | KB 목록 + 콘텐츠 레이아웃 페이지 | TBD |
| `src/renderer/src/pages/knowledge/KnowledgeContent.tsx` | KB 콘텐츠 영역 (탭 기반 항목 표시) | TBD |
| `src/renderer/src/pages/knowledge/components/AddKnowledgeBasePopup.tsx` | KB 생성 팝업 | TBD |
| `src/renderer/src/pages/knowledge/components/EditKnowledgeBasePopup.tsx` | KB 편집 팝업 | TBD |
| `src/renderer/src/pages/knowledge/components/KnowledgeSearchPopup.tsx` | KB 검색 팝업 | TBD |
| `src/renderer/src/pages/knowledge/components/KnowledgeSettings/KnowledgeBaseFormModal.tsx` | KB 설정 폼 모달 | TBD |
| `src/renderer/src/pages/knowledge/components/StatusIcon.tsx` | 처리 상태 아이콘 | TBD |
| `src/renderer/src/pages/knowledge/items/KnowledgeFiles.tsx` | 파일 항목 관리 | TBD |
| `src/renderer/src/pages/knowledge/items/KnowledgeUrls.tsx` | URL 항목 관리 | TBD |
| `src/renderer/src/pages/knowledge/items/KnowledgeNotes.tsx` | 노트 항목 관리 | TBD |
| `src/renderer/src/pages/knowledge/items/KnowledgeSitemaps.tsx` | 사이트맵 항목 관리 | TBD |
| `src/renderer/src/pages/knowledge/items/KnowledgeDirectories.tsx` | 디렉토리 항목 관리 | TBD |
| `src/renderer/src/pages/knowledge/items/KnowledgeVideos.tsx` | 동영상 항목 관리 | TBD |
| `src/main/services/KnowledgeService.ts` | 메인 프로세스 KB 서비스 (RAG, 벡터 DB, 동시성 관리) | TBD |
| `src/main/knowledge/embedjs/embeddings/Embeddings.ts` | 임베딩 생성기 | TBD |
| `src/main/knowledge/embedjs/loader/` | 파일/URL/노트 로더 | TBD |
| `src/main/knowledge/preprocess/PreprocessProvider.ts` | 전처리 프로바이더 팩토리 | TBD |
| `src/main/knowledge/preprocess/PreprocessProviderFactory.ts` | 전처리 프로바이더 생성 | TBD |
| `src/main/knowledge/preprocess/PreprocessingService.ts` | 전처리 서비스 | TBD |
| `src/main/knowledge/preprocess/Doc2xPreprocessProvider.ts` | Doc2x 전처리 | TBD |
| `src/main/knowledge/preprocess/MistralPreprocessProvider.ts` | Mistral 전처리 | TBD |
| `src/main/knowledge/preprocess/MineruPreprocessProvider.ts` | MinerU 전처리 | TBD |
| `src/main/knowledge/preprocess/PaddleocrPreprocessProvider.ts` | PaddleOCR 전처리 | TBD |
| `src/main/knowledge/reranker/Reranker.ts` | 리랭커 팩토리 | TBD |
| `src/main/knowledge/reranker/GeneralReranker.ts` | 범용 리랭커 | TBD |
| `src/main/knowledge/reranker/BaseReranker.ts` | 리랭커 베이스 클래스 | TBD |
| `src/renderer/src/hooks/useKnowledge.ts` | KB 상태 훅 | TBD |
| `src/renderer/src/hooks/useKnowledgeBaseForm.ts` | KB 폼 훅 | TBD |
| `src/renderer/src/hooks/useKnowledgeFiles.tsx` | KB 파일 관리 훅 | TBD |
| `src/renderer/src/store/knowledge.ts` | Redux 슬라이스 (→ Zustand 전환) | TBD |
| `src/renderer/src/store/thunk/knowledgeThunk.ts` | KB 비동기 액션 | TBD |
| `src/renderer/src/services/KnowledgeService.ts` | 렌더러 KB 서비스 | TBD |
| `src/renderer/src/queue/KnowledgeQueue.ts` | KB 큐 관리 | TBD |
| `src/renderer/src/types/knowledge.ts` | KB 타입 정의 | TBD |
| `src/renderer/src/utils/knowledge.ts` | KB 유틸리티 | TBD |
| `src/main/utils/knowledge.ts` | 메인 프로세스 KB 유틸리티 | TBD |
| `src/renderer/src/aiCore/tools/KnowledgeSearchTool.ts` | AI Tool — KB 검색 | TBD |
| `src/renderer/src/components/Popups/SaveToKnowledgePopup.tsx` | 메시지 → KB 저장 팝업 | TBD |
| `src/renderer/src/pages/home/Inputbar/tools/knowledgeBaseTool.tsx` | 입력바 KB 도구 | TBD |
| `src/renderer/src/pages/home/Inputbar/tools/components/KnowledgeBaseButton.tsx` | KB 버튼 컴포넌트 | TBD |
| `src/renderer/src/pages/home/Inputbar/KnowledgeBaseInput.tsx` | KB 입력 컴포넌트 | TBD |
| `src/renderer/src/pages/home/Messages/Tools/MessageKnowledgeSearch.tsx` | 메시지 내 KB 검색 결과 표시 | TBD |

---

## 4. Source Behavior Inventory

| ID | Source File | Function/Method | Behavior | Priority | Origin |
|----|------------|-----------------|----------|----------|--------|
| B201 | `src/renderer/src/store/knowledge.ts` | `addBase` | KnowledgeBase 객체를 store에 추가 | P0 | Source |
| B202 | `src/renderer/src/store/knowledge.ts` | `deleteBase` | KB 삭제 — store에서 제거 + 파일 정리 + IPC 삭제 호출 | P0 | Source |
| B203 | `src/renderer/src/store/knowledge.ts` | `renameBase` | KB 이름 변경 | P1 | Source |
| B204 | `src/renderer/src/store/knowledge.ts` | `updateBase` | KB 설정 전체 업데이트 | P1 | Source |
| B205 | `src/renderer/src/store/knowledge.ts` | `addItem` | KB에 항목(file/url/note/sitemap/directory/video) 추가 | P0 | Source |
| B206 | `src/renderer/src/store/knowledge.ts` | `removeItem` | KB에서 항목 제거 | P0 | Source |
| B207 | `src/main/services/KnowledgeService.ts` | `constructor` | storageDir 초기화, 시작 시 삭제 대기 목록 정리 | P0 | Source |
| B208 | `src/main/services/KnowledgeService.ts` | `addItem` | KB에 항목 추가 — RAG 빌더 구성, 로더 실행, 벡터 DB 저장 | P0 | Source |
| B209 | `src/main/services/KnowledgeService.ts` | 동시성 제어 | 80MB 워크로드 + 30개 병렬 처리 제한 | P0 | Source |
| B210 | `src/main/services/KnowledgeService.ts` | `deleteKnowledgeFile` | KB 벡터 DB 파일 삭제 | P1 | Source |
| B211 | `src/main/services/KnowledgeService.ts` | `cleanupKnowledgeResources` | RAG 앱 인스턴스 + DB 인스턴스 메모리 정리 | P1 | Source |
| B212 | `src/main/services/KnowledgeService.ts` | `pendingDeleteManager` | 삭제 대기 목록 영속화 — 앱 재시작 시 정리 | P2 | Source |
| B213 | `src/main/knowledge/embedjs/embeddings/Embeddings.ts` | `embed` | 텍스트 → 벡터 임베딩 변환 (프로바이더 API 호출) | P0 | Source |
| B214 | `src/main/knowledge/embedjs/loader/` | `addFileLoader` | 파일 타입별 로더 선택 (PDF, DOCX, TXT, MD, CSV, 이미지) | P0 | Source |
| B215 | `src/main/knowledge/embedjs/loader/noteLoader.ts` | `NoteLoader` | 노트 텍스트 → 청크 로더 | P1 | Source |
| B216 | `src/main/knowledge/preprocess/PreprocessProviderFactory.ts` | `create` | 전처리 프로바이더 인스턴스 생성 (doc2x, mistral, mineru, paddleocr) | P1 | Source |
| B217 | `src/main/knowledge/preprocess/PreprocessingService.ts` | `preprocess` | 파일 전처리 실행 — OCR, 문서 변환 | P1 | Source |
| B218 | `src/main/knowledge/reranker/Reranker.ts` | `rerank` | 검색 결과 리랭킹 | P1 | Source |
| B219 | `src/main/knowledge/reranker/GeneralReranker.ts` | `rerank` | 범용 리랭킹 전략 | P1 | Source |
| B220 | `src/renderer/src/hooks/useKnowledge.ts` | `useKnowledge` | 특정 KB의 항목별 필터링 상태 제공 (file/url/note/sitemap/directory/video) | P0 | Source |
| B221 | `src/renderer/src/hooks/useKnowledge.ts` | `useKnowledgeBases` | 전체 KB 목록 + CRUD 액션 제공 | P0 | Source |
| B222 | `src/renderer/src/hooks/useKnowledgeFiles.tsx` | `useKnowledgeFiles` | 파일 업로드/삭제/재시도 관리 | P0 | Source |
| B223 | `src/renderer/src/services/KnowledgeService.ts` | `searchKnowledgeBase` | 렌더러에서 IPC를 통한 KB 유사도 검색 | P0 | Source |
| B224 | `src/renderer/src/queue/KnowledgeQueue.ts` | 큐 관리 | 항목 추가 큐 — 순차 처리 보장 | P1 | Source |
| B225 | `src/renderer/src/pages/knowledge/KnowledgePage.tsx` | `handleAddKnowledge` | KB 추가 팝업 표시 → 새 KB 선택 | P0 | Source |
| B226 | `src/renderer/src/pages/knowledge/KnowledgePage.tsx` | `getMenuItems` | KB 항목 컨텍스트 메뉴 (이름 변경, 설정, 삭제) | P1 | Source |
| B227 | `src/renderer/src/pages/knowledge/KnowledgeContent.tsx` | 진행률 추적 | IPC 이벤트(file-preprocess-progress, file-ocr-progress, directory-processing-percent) 수신하여 progressMap 갱신 | P0 | Source |
| B228 | `src/renderer/src/pages/knowledge/KnowledgeContent.tsx` | 탭 렌더링 | Files/Notes/URLs/Sitemaps/Directories/Videos 6개 탭 분기 | P0 | Source |
| B229 | `src/renderer/src/pages/knowledge/items/KnowledgeFiles.tsx` | 파일 업로드 | 드래그 앤 드롭 + 파일 선택 → 파일 항목 추가 | P0 | Source |
| B230 | `src/renderer/src/pages/knowledge/items/KnowledgeUrls.tsx` | URL 추가 | URL 입력 → URL 항목 추가 및 크롤링 | P1 | Source |
| B231 | `src/renderer/src/pages/knowledge/items/KnowledgeNotes.tsx` | 노트 추가 | 텍스트 입력 → 노트 항목 추가 | P1 | Source |
| B232 | `src/renderer/src/pages/knowledge/items/KnowledgeSitemaps.tsx` | 사이트맵 추가 | 사이트맵 URL → 페이지 크롤링 | P2 | Source |
| B233 | `src/renderer/src/pages/knowledge/items/KnowledgeDirectories.tsx` | 디렉토리 추가 | 폴더 선택 → 하위 파일 일괄 수집 | P1 | Source |
| B234 | `src/renderer/src/pages/knowledge/items/KnowledgeVideos.tsx` | 동영상 추가 | 동영상 파일 → 자막/텍스트 추출 | P2 | Source |
| B235 | `src/renderer/src/aiCore/tools/KnowledgeSearchTool.ts` | KB 검색 도구 | AI Tool로 KB 검색 결과를 채팅에 주입 | P0 | Source |
| B236 | `src/renderer/src/components/Popups/SaveToKnowledgePopup.tsx` | 메시지 저장 | 채팅 메시지를 KB 노트로 저장 | P2 | Source |
| B237 | `src/renderer/src/pages/knowledge/components/KnowledgeSearchPopup.tsx` | 검색 테스트 | KB 내 유사도 검색 테스트 UI | P1 | Source |
| B238 | `src/renderer/src/pages/knowledge/components/AddKnowledgeBasePopup.tsx` | KB 생성 폼 | 이름, 임베딩 모델, 차원, 청크 설정 입력 | P0 | Source |
| B239 | `src/renderer/src/pages/knowledge/components/EditKnowledgeBasePopup.tsx` | KB 수정 폼 | KB 설정 편집 (모델, 리랭커, 전처리 등) | P1 | Source |
| B240 | `src/renderer/src/types/knowledge.ts` | 타입 정의 | KnowledgeBase, KnowledgeItem, KnowledgeItemType, ProcessingStatus, PreprocessProvider 등 | P0 | Source |

---

## 5. UI Component Features

| 컴포넌트 | 기능 설명 |
|----------|----------|
| KnowledgePage | 좌측 KB 목록 사이드바 + 우측 KnowledgeContent 2단 레이아웃 |
| KB 목록 사이드바 | DraggableList 기반, 드래그 정렬, 컨텍스트 메뉴(이름 변경/설정/삭제), "+" 버튼 |
| KnowledgeContent | 선택된 KB의 콘텐츠를 6개 탭(Files/Notes/URLs/Sitemaps/Directories/Videos)으로 분류 표시 |
| AddKnowledgeBasePopup | KB 생성 다이얼로그 — 이름, 임베딩 모델 선택, 차원, 청크 사이즈/오버랩 |
| EditKnowledgeBasePopup | KB 설정 편집 — 리랭크 모델, 전처리 프로바이더, threshold 등 |
| KnowledgeSearchPopup | 검색 테스트 다이얼로그 — 쿼리 입력 → 유사도 결과 표시 |
| StatusIcon | 처리 상태(pending/processing/completed/failed) 시각화 |
| KnowledgeFiles | 파일 목록 + 드래그 앤 드롭 업로드 + 진행률 바 |
| KnowledgeUrls | URL 목록 + URL 입력 폼 |
| KnowledgeNotes | 노트 목록 + 텍스트 입력 폼 |
| KnowledgeSitemaps | 사이트맵 목록 + URL 입력 |
| KnowledgeDirectories | 디렉토리 목록 + 폴더 선택 |
| KnowledgeVideos | 동영상 목록 + 파일 선택 |

---

## 6. Interaction Behavior Inventory

| 사용자 동작 | 시스템 응답 |
|------------|-----------|
| "+" 버튼 클릭 | AddKnowledgeBasePopup 표시 |
| KB 생성 폼 제출 | store에 KB 추가, 사이드바에 새 항목 표시 |
| 사이드바 KB 항목 클릭 | 해당 KB의 KnowledgeContent 로드 |
| KB 항목 우클릭 | 컨텍스트 메뉴 (이름 변경, 설정, 삭제) |
| 삭제 선택 | 확인 다이얼로그 → KB 삭제 (store + 벡터 DB 파일) |
| Files 탭에서 파일 드래그 앤 드롭 | 파일 업로드 시작, 진행률 표시, 전처리 → 청킹 → 임베딩 |
| URL 탭에서 URL 입력 | URL 크롤링 → 텍스트 추출 → 청킹 → 임베딩 |
| 검색 아이콘 클릭 | KnowledgeSearchPopup 표시, 쿼리 입력 → 유사도 검색 결과 |
| Settings 아이콘 클릭 | EditKnowledgeBasePopup으로 KB 설정 편집 |
| 사이드바 항목 드래그 | KB 순서 변경 |

---

## 7. Component Tree

```
KnowledgePage
├── Navbar (NavbarCenter: "Knowledge Base")
├── SidebarPanel
│   ├── Plus 버튼 → AddKnowledgeBasePopup
│   ├── Search 버튼 → KnowledgeSearchPopup
│   └── DraggableList
│       └── ListItem (KB 항목) × N
│           └── Dropdown (컨텍스트 메뉴)
└── KnowledgeContent
    ├── Header (KB 이름, 프로바이더명, 검색/설정 아이콘)
    └── Tabs
        ├── Files → KnowledgeFiles
        ├── Notes → KnowledgeNotes
        ├── URLs → KnowledgeUrls
        ├── Sitemaps → KnowledgeSitemaps
        ├── Directories → KnowledgeDirectories
        └── Videos → KnowledgeVideos
```

---

## 8. Data Lifecycle Patterns

| 데이터 | 생성 계기 | 저장소 | 갱신 시점 | 삭제 시점 |
|--------|---------|--------|---------|---------|
| KnowledgeBase | opt-in: 사용자가 "+" 버튼으로 생성 | Redux store (→ Zustand) + persist | 이름 변경, 설정 수정 시 | 사용자 명시적 삭제 |
| KnowledgeItem | opt-in: 사용자가 파일/URL/노트 등 추가 | Redux store (→ Zustand) + persist | 재처리(retry) 시 상태 갱신 | 사용자 명시적 삭제 |
| 벡터 DB (LibSQL) | KnowledgeItem 추가 시 자동 생성 | 파일 시스템 (KnowledgeBase/{id}/) | 항목 추가/삭제 시 | KB 삭제 시 전체 삭제, 항목 삭제 시 해당 벡터만 |
| 전처리 결과 | 파일 업로드 → 전처리 완료 시 | 임시 파일 → 로더 입력 | 재처리 시 | 로더 완료 후 정리 |
| processingStatus | 항목 추가 시 pending | store 내 KnowledgeItem | pending → processing → completed/failed | 항목 삭제 시 |
| progressMap | IPC 이벤트 수신 시 | KnowledgeContent 컴포넌트 로컬 상태 | 실시간 IPC 이벤트 | 컴포넌트 언마운트 시 |

---

## 9. Naming Remapping

| 소스 이름 | Angdu 이름 | 사유 |
|----------|-----------|------|
| `cherry-studio` | `angdu-studio` | 프로젝트 리브랜딩 |
| `@cherrystudio/embedjs` | TBD | 커스텀 embedjs 포크, 자체 구현 또는 대체 검토 |
| `@cherrystudio/embedjs-libsql` | TBD | LibSQL 벡터 DB 래퍼 |
| `@cherrystudio/embedjs-loader-sitemap` | TBD | 사이트맵 로더 |
| `@cherrystudio/embedjs-loader-web` | TBD | 웹 페이지 로더 |
| Redux `knowledgeSlice` | Zustand `useKnowledgeStore` | 상태 관리 전환 |

---

## 10. Static Resources

| 리소스 | 경로 | 용도 |
|--------|------|------|
| (해당 없음) | — | KB 기능에 특화된 정적 리소스 없음. 아이콘은 lucide-react 사용 |

---

## 11. Environment Variables

| 변수 | 용도 | 기본값 |
|------|------|--------|
| (해당 없음) | KB 기능은 환경 변수를 직접 사용하지 않음. 임베딩/리랭크 API 키는 F004 프로바이더 설정을 통해 관리 | — |

---

## 12. Feature Contracts

### 의존하는 Feature
| Feature | 계약 | 용도 |
|---------|------|------|
| F001 (app-shell) | IPC 채널, 파일 시스템 접근 | KB 벡터 DB 파일 저장, IPC 통신 |
| F004 (model-provider) | 임베딩 모델/리랭크 모델 선택 API | KB 생성 시 모델 지정 |
| F005 (chat-conversation) | AI Tool 시스템 | KnowledgeSearchTool로 채팅에 KB 검색 결과 주입 |

### 제공하는 계약
| 계약 | 소비자 | 설명 |
|------|--------|------|
| `KnowledgeSearchTool` | F005 (chat) | 채팅 중 KB 유사도 검색 |
| `SaveToKnowledgePopup` | F005 (chat) | 메시지를 KB 노트로 저장 |
| KB 목록 조회 | F005 (chat inputbar) | 채팅 입력바에서 KB 선택 |

---

## 13. For /speckit.specify

- KB CRUD (create/read/update/delete)는 P0. 모든 항목 타입(file/url/note/sitemap/directory/video) 지원
- 임베딩 모델은 F004의 프로바이더 시스템에서 선택. dimensions, chunkSize, chunkOverlap 설정 필수
- 동시성 제어: MAXIMUM_WORKLOAD=80MB, MAXIMUM_PROCESSING_ITEM_COUNT=30 유지
- 전처리 프로바이더: doc2x, mistral, mineru, open-mineru, paddleocr 5종
- 리랭킹은 선택적(rerankModel 설정 시에만 적용)
- processingStatus 상태 머신: pending → processing → completed | failed
- `@cherrystudio/embedjs*` 패키지들은 커스텀 포크. 대체 구현 또는 자체 래퍼 설계 필요
- Redux → Zustand 전환 시 persist 전략 동일 유지

---

## 14. For /speckit.plan

- Phase 1: KnowledgeBase CRUD + Zustand store + 기본 UI (사이드바 + 빈 콘텐츠)
- Phase 2: 파일 업로드 + 전처리 파이프라인 + 진행률 표시
- Phase 3: 임베딩 + 벡터 DB 저장 (LibSQL) + 유사도 검색
- Phase 4: URL/사이트맵/디렉토리/노트/동영상 로더
- Phase 5: 리랭킹 + 검색 테스트 UI
- Phase 6: 채팅 통합 (KnowledgeSearchTool, KB 선택 inputbar)
- 동시성 제어는 Phase 2에서 구현. 워크로드 기반 스케줄링
- 전처리 프로바이더는 플러그인 패턴(Factory)으로 설계

---

## 15. For /speckit.analyze

- 핵심 리스크: `@cherrystudio/embedjs*` 커스텀 포크에 대한 의존성. 소스를 분석하여 자체 구현 범위 결정 필요
- 성능 고려: 대용량 파일(PDF 수백 페이지) 청킹 시 메모리/시간 관리
- 벡터 DB: LibSQL 기반. 차원 수 변경 시 기존 데이터 마이그레이션 불가 → KB 재생성 필요
- 전처리 프로바이더별 외부 API 의존성 (doc2x, mistral 등)은 API 키 관리와 에러 핸들링 주의
- IPC 이벤트 기반 진행률 추적은 렌더러-메인 간 이벤트 누락 가능성 고려
- 동시성 제한(80MB/30개)은 하드코딩. 설정 가능 여부 검토
