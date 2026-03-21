# F009 — memory Pre-Context

> **모드**: Rebuild, New Stack
> **소스 루트**: `/Users/coolhero/Develop/cherry-studio` (상대 경로 사용)

---

## 1. Brief Summary

시맨틱 메모리 시스템으로, 대화에서 자동으로 중요한 정보를 추출하여 벡터 임베딩과 함께 저장한다.
LibSQL 기반 벡터 DB에 메모리를 저장하고, cosine similarity 검색으로 관련 메모리를 찾아 채팅 컨텍스트에 AI Tool로 주입한다.
메모리 CRUD, 해시 기반 중복 방지, 유사도 임계값(0.85) 기반 자동 병합, 삭제 복원, 이력 추적 기능을 제공한다.
사용자는 설정에서 메모리 기능을 활성화/비활성화하고, 임베딩 프로바이더/모델을 지정할 수 있다.

---

## 2. Runtime Exploration Results

| 항목 | 관찰 결과 |
|------|----------|
| 초기 상태 | 메모리 기능 비활성화 (opt-in) |
| 설정 | MemorySettings에서 활성화 토글, 임베딩 프로바이더/모델/차원 설정 |
| 자동 추출 | 대화 완료 후 어시스턴트 응답에서 메모리 자동 추출 |
| 수동 추가 | 사용자가 수동으로 메모리 항목 추가 가능 |
| 검색 | 대화 시 관련 메모리를 벡터 유사도로 검색하여 컨텍스트에 주입 |
| 삭제 | 소프트 삭제 (is_deleted 플래그) — 같은 내용 재추가 시 복원 |
| 이력 | memory_history 테이블에 ADD/UPDATE/DELETE 이력 추적 |
| 싱글톤 | MemoryService는 싱글톤 패턴, reload로 재초기화 가능 |

---

## 3. Source Reference

| File Path | Role | Rebuild Target |
|-----------|------|---------------|
| `src/main/services/memory/MemoryService.ts` | 메인 프로세스 메모리 서비스 (싱글톤, LibSQL 벡터 DB) | TBD |
| `src/main/services/memory/queries.ts` | SQL 쿼리 정의 (테이블 생성, CRUD, 벡터 검색) | TBD |
| `src/renderer/src/pages/settings/MemorySettings.tsx` | 메모리 설정 UI (활성화, 프로바이더, 모델) | TBD |
| `src/renderer/src/pages/settings/MemorySettingsModal.tsx` | 메모리 설정 모달 | TBD |
| `src/renderer/src/pages/settings/UserSelector.tsx` | 사용자 선택 (멀티 유저 메모리) | TBD |
| `src/renderer/src/pages/settings/constants.ts` | 메모리 설정 상수 | TBD |
| `src/renderer/src/pages/settings/index.tsx` | 메모리 설정 인덱스 | TBD |
| `src/main/knowledge/embedjs/embeddings/Embeddings.ts` | 임베딩 생성 (F006과 공유) | TBD |

---

## 4. Source Behavior Inventory

| ID | Source File | Function/Method | Behavior | Priority | Origin |
|----|------------|-----------------|----------|----------|--------|
| B321 | `MemoryService.ts` | `getInstance` | 싱글톤 인스턴스 반환 | P0 | Source |
| B322 | `MemoryService.ts` | `reload` | 기존 인스턴스 닫고 새로 생성 (설정 변경 시) | P1 | Source |
| B323 | `MemoryService.ts` | `init` | LibSQL DB 연결 초기화, 테이블/인덱스 생성 | P0 | Source |
| B324 | `MemoryService.ts` | `createTables` | memories 테이블 + memory_history 테이블 + 인덱스 생성 | P0 | Source |
| B325 | `MemoryService.ts` | `add` | 메모리 추가 — 해시 중복 검사, 삭제된 항목 복원, 임베딩 생성, 유사 메모리 검색 | P0 | Source |
| B326 | `MemoryService.ts` | 해시 기반 중복 방지 | SHA-256 해시로 동일 메모리 중복 방지 | P0 | Source |
| B327 | `MemoryService.ts` | 삭제 복원 | is_deleted=1인 동일 해시 메모리 발견 시 복원 | P1 | Source |
| B328 | `MemoryService.ts` | `generateEmbedding` | 텍스트 → 벡터 임베딩 생성 (Embeddings 클래스 사용) | P0 | Source |
| B329 | `MemoryService.ts` | `hybridSearch` | 벡터 유사도 + 텍스트 기반 하이브리드 검색 | P0 | Source |
| B330 | `MemoryService.ts` | 유사도 임계값 | SIMILARITY_THRESHOLD=0.85 — 유사 메모리 자동 병합 | P1 | Source |
| B331 | `MemoryService.ts` | `addHistory` | memory_history 테이블에 ADD/UPDATE/DELETE 이력 기록 | P1 | Source |
| B332 | `MemoryService.ts` | `migrateMemoryDb` | 이전 경로(userData)에서 새 경로(DATA_PATH/Memory)로 DB 마이그레이션 | P2 | Source |
| B333 | `MemoryService.ts` | `close` | DB 연결 종료 | P1 | Source |
| B334 | `MemoryService.ts` | `embeddingToVector` | 임베딩 배열 → LibSQL 벡터 포맷 변환 | P0 | Source |
| B335 | `MemoryService.ts` | UNIFIED_DIMENSION=1536 | 벡터 차원 통일 (기본값) | P0 | Source |
| B336 | `queries.ts` | `createTables` | memories 테이블 DDL (id, memory, hash, embedding, user_id, agent_id, metadata 등) | P0 | Source |
| B337 | `queries.ts` | `createIndexes` | user_id, agent_id, created_at, hash, vector 인덱스 | P1 | Source |
| B338 | `queries.ts` | `memory.checkExistsIncludeDeleted` | 해시로 메모리 존재 여부 확인 (삭제 포함) | P0 | Source |
| B339 | `queries.ts` | `memory.restoreDeleted` | 삭제된 메모리 복원 쿼리 | P1 | Source |
| B340 | `MemorySettings.tsx` | 설정 UI | 메모리 활성화 토글, 임베딩 프로바이더/모델 선택, 차원 설정 | P0 | Source |
| B341 | `MemorySettingsModal.tsx` | 설정 모달 | 상세 메모리 설정 편집 | P1 | Source |
| B342 | `UserSelector.tsx` | 사용자 선택 | 멀티 유저 환경에서 메모리 소유자 지정 | P2 | Source |
| B343 | `MemoryService.ts` | 벡터 인덱스 폴백 | 벡터 인덱스 미지원 시 비인덱스 검색으로 폴백 | P2 | Source |
| B344 | `MemoryService.ts` | 메모리 설정 (MemoryConfig) | embeddingModel, embeddingDimensions, provider 등 설정 | P0 | Source |
| B345 | `MemoryService.ts` | 소프트 삭제 | is_deleted 플래그 기반 — 물리 삭제 없이 논리 삭제 | P1 | Source |

---

## 5. UI Component Features

| 컴포넌트 | 기능 설명 |
|----------|----------|
| MemorySettings | 메모리 기능 메인 설정 페이지 — 활성화 토글, 프로바이더/모델 선택 |
| MemorySettingsModal | 메모리 상세 설정 모달 — 차원, 임계값 등 고급 설정 |
| UserSelector | 멀티 유저 환경에서 메모리 소유자 선택 드롭다운 |

---

## 6. Interaction Behavior Inventory

| 사용자 동작 | 시스템 응답 |
|------------|-----------|
| 메모리 기능 활성화 | MemoryService 초기화, DB 생성/연결 |
| 임베딩 모델 변경 | MemoryService.reload() — 새 모델로 재초기화 |
| 대화 완료 | 어시스턴트 응답에서 메모리 자동 추출 → 해시 중복 검사 → 벡터 임베딩 → 저장 |
| 수동 메모리 추가 | add() → 해시 검사 → 유사 메모리 검색 → 저장 또는 병합 |
| 메모리 삭제 | 소프트 삭제 (is_deleted=1) + 이력 기록 |
| 메모리 검색 (채팅 시) | hybridSearch로 관련 메모리 검색 → AI Tool로 컨텍스트 주입 |
| 메모리 기능 비활성화 | DB 연결 유지, 자동 추출 중지 |

---

## 7. Component Tree

```
Settings Page
└── MemorySettings
    ├── 활성화 토글
    ├── 프로바이더 선택 (Dropdown)
    ├── 모델 선택 (Dropdown)
    ├── 차원 입력
    ├── UserSelector
    └── MemorySettingsModal (고급 설정)

[메인 프로세스]
MemoryService (Singleton)
├── LibSQL Client
├── Embeddings (F006 공유)
├── MemoryQueries
└── MemoryConfig
```

---

## 8. Data Lifecycle Patterns

| 데이터 | 생성 계기 | 저장소 | 갱신 시점 | 삭제 시점 |
|--------|---------|--------|---------|---------|
| MemoryItem | auto: 대화 완료 시 자동 추출, opt-in: 수동 추가 | LibSQL DB (DATA_PATH/Memory/memories.db) | 유사 메모리 병합 시 업데이트 | 소프트 삭제 (is_deleted=1) |
| MemoryHistoryItem | MemoryItem 변경 시 자동 생성 | LibSQL DB memory_history 테이블 | — (append-only) | 메모리와 함께 |
| MemoryConfig | 사용자가 설정에서 지정 | store (persist) | 설정 변경 시 | 리셋 시 |
| 벡터 임베딩 | MemoryItem 추가 시 자동 생성 | LibSQL DB embedding 컬럼 | 메모리 업데이트 시 재생성 | 메모리 삭제 시 |
| 벡터 인덱스 | DB 초기화 시 생성 시도 | LibSQL 내부 | — | DB 삭제 시 |

---

## 9. Naming Remapping

| 소스 이름 | Angdu 이름 | 사유 |
|----------|-----------|------|
| `@libsql/client` | 유지 | LibSQL 클라이언트 직접 사용 |
| `MemoryService` (싱글톤) | 유지 (메인 프로세스) | 패턴 유지 |
| Redux 기반 설정 | Zustand `useMemoryStore` | 상태 관리 전환 |

---

## 10. Static Resources

| 리소스 | 경로 | 용도 |
|--------|------|------|
| (해당 없음) | — | 메모리 기능에 특화된 정적 리소스 없음 |

---

## 11. Environment Variables

| 변수 | 용도 | 기본값 |
|------|------|--------|
| (해당 없음) | 메모리 기능은 환경 변수를 직접 사용하지 않음. 임베딩 API 키는 F004 프로바이더 설정 경유 | — |

---

## 12. Feature Contracts

### 의존하는 Feature
| Feature | 계약 | 용도 |
|---------|------|------|
| F001 (app-shell) | DATA_PATH, 파일 시스템 | 메모리 DB 파일 저장 경로 |
| F004 (model-provider) | 임베딩 프로바이더/모델 API | 벡터 임베딩 생성 |
| F006 (knowledge-base) | Embeddings 클래스 공유 | 임베딩 생성기 재사용 |

### 제공하는 계약
| 계약 | 소비자 | 설명 |
|------|--------|------|
| 메모리 검색 (AI Tool) | F005 (chat) | 채팅 시 관련 메모리를 AI Tool로 주입 |
| 메모리 자동 추출 | F005 (chat) | 대화 완료 후 메모리 자동 추출 트리거 |

---

## 13. For /speckit.specify

- MemoryService는 싱글톤 패턴. reload()로 설정 변경 시 재초기화
- LibSQL 벡터 DB: memories 테이블에 embedding 컬럼 (벡터 타입)
- UNIFIED_DIMENSION=1536 기본값. MemoryConfig로 커스텀 가능
- SIMILARITY_THRESHOLD=0.85: 이 이상 유사하면 자동 병합
- 해시 기반 중복 방지: SHA-256 해시로 동일 내용 재저장 방지
- 소프트 삭제: is_deleted 플래그. 같은 해시로 재추가 시 복원
- memory_history: 모든 변경 이력 기록 (ADD/UPDATE/DELETE)
- hybridSearch: 벡터 유사도 + 텍스트 매칭 결합 검색
- 임베딩 생성기는 F006 Knowledge Base의 Embeddings 클래스 재사용

---

## 14. For /speckit.plan

- Phase 1: MemoryService 싱글톤 + LibSQL DB 초기화 + 테이블 생성
- Phase 2: 메모리 CRUD (add, search, update, delete) + 해시 중복 방지
- Phase 3: 벡터 임베딩 생성 + 유사도 검색 (hybridSearch)
- Phase 4: 메모리 설정 UI (MemorySettings, MemorySettingsModal)
- Phase 5: 채팅 통합 — 자동 메모리 추출 + AI Tool 주입
- Phase 6: 이력 추적, 소프트 삭제/복원, DB 마이그레이션

---

## 15. For /speckit.analyze

- 핵심 의존: LibSQL 벡터 검색 기능. 벡터 인덱스 미지원 환경에서는 폴백으로 비인덱스 검색
- 성능 고려: 메모리 수 증가 시 벡터 검색 성능. 인덱스 유무에 따라 차이 큼
- 차원 불일치: 모델 변경 시 기존 임베딩과 새 임베딩의 차원이 다를 수 있음. 재인덱싱 전략 필요
- 자동 추출 품질: LLM에 의존한 메모리 추출 → 모델 품질에 따라 노이즈 가능
- 유사도 임계값 0.85: 너무 높으면 관련 정보 누락, 너무 낮으면 노이즈. 사용자 조정 가능 여부 검토
- Embeddings 클래스 공유: F006과 F009가 동일 임베딩 클래스 사용. 의존성 방향 정리 필요
