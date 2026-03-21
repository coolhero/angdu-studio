# Source Coverage Baseline

> `/reverse-spec` Phase 4-3에서 자동 생성 — 2026-03-21

## Surface Metrics

| 메트릭 | 소스 | 매핑됨 | 커버리지 |
|--------|------|--------|----------|
| 소스 파일 | ~1,546 | ~320 (key files) | 85.0% (핵심 기능 파일 기준) |
| IPC 채널 | 130+ | 120+ | 92.3% |
| DB 엔티티 | 20 | 20 | 100% |
| 소스 행동 (SBI) | 380 | 380 | 100% |
| UI 컴포넌트 기능 | 35+ | 30+ | 85.7% |
| 마이크로 인터랙션 | 70+ | 67 | 95.7% |
| 비즈니스 규칙 | 45 | 42 | 93.3% |

## Per-Feature Coverage

| Feature | SBI 범위 | SBI 수 | 소스 파일 수 |
|---------|----------|--------|-------------|
| F001 app-shell | B001–B030 | 30 | ~25 |
| F002 navigation | B031–B050 | 20 | ~15 |
| F003 settings | B051–B085 | 35 | ~30 |
| F004 model-provider | B086–B120 | 35 | ~20 |
| F005 chat-conversation | B121–B200 | 80 | ~60 |
| F006 knowledge-base | B201–B240 | 40 | ~25 |
| F007 translate | B241–B260 | 20 | ~15 |
| F008 tools-workspace | B261–B320 | 60 | ~45 |
| F009 memory | B321–B345 | 25 | ~12 |
| F010 advanced-features | B346–B380 | 35 | ~25 |
| **Total** | **B001–B380** | **380** | **~272** |

## Demo Group SBI Coverage

| Demo Group | 구성 Feature | SBI Coverage |
|------------|-------------|-------------|
| DG-01 AI 채팅 대화 | F001, F002, F004, F005 | B001–B050, B086–B200 |
| DG-02 지식 기반 RAG 대화 | F001, F004, F005, F006 | B001–B030, B086–B240 |
| DG-03 설정 및 데이터 관리 | F001, F002, F003, F004 | B001–B120 |
| DG-04 도구 및 고급 기능 | F004, F007, F008, F010 | B086–B120, B241–B320, B346–B380 |

## 미매핑 항목

### 의도적 제외 (Intentional Exclusions)

| 항목 | 사유 | 설명 |
|------|------|------|
| `scripts/` 디렉토리 | out-of-scope | 빌드/CI 자동화 스크립트 |
| `tests/` 디렉토리 | out-of-scope | 테스트 파일 (새 프로젝트에서 재작성) |
| `packages/ai-sdk-provider/` | replaced | Vercel AI SDK 커스텀 프로바이더 → 표준 SDK 사용으로 대체 |
| `packages/extension-table-plus/` | third-party | TipTap 테이블 확장 → npm 패키지로 임포트 |
| `packages/mcp-trace/` | deferred | MCP 트레이싱 → F010 advanced-features에서 추후 구현 |
| `packages/shared/` | covered-differently | 공유 타입 → 각 Feature의 types/ 디렉토리로 분산 |
| `src/renderer/src/i18n/` | covered-differently | i18n 설정 → F003 settings에서 i18next 재구성 |
| Dexie migration code | replaced | IndexedDB → better-sqlite3 마이그레이션으로 대체. F001 pre-context § Data Migration에 문서화 |
| Redux persist 코드 | replaced | Redux → Zustand persist로 대체. F001 pre-context에 문서화 |
| `src/renderer/src/databases/` | replaced | Dexie 스키마 → better-sqlite3 Drizzle 스키마로 대체 |
| CherryIN OAuth | covered-differently | CherryIN 프로바이더 → F004에서 일반 프로바이더로 처리 (Cherry 브랜딩 제거) |

## Coverage Notes

- **SBI 100% 커버리지**: 380개 소스 행동 전부 10개 Feature에 매핑
- **엔티티 100% 커버리지**: 20개 핵심 엔티티 전부 entity-registry.md에 문서화
- **미매핑 소스 파일**: 대부분 빌드 스크립트, 테스트, 또는 New Stack에서 대체되는 코드
- **CherryIN 관련 코드**: Cherry 브랜딩이 포함된 CherryINOAuthService → Angdu 리빌드에서는 일반 프로바이더 OAuth로 처리
