# Spec-Kit Skills 개선 v4: F006 교훈

> F006-mcp-tools 구현/검증 경험에서 도출한 문제 분석 및 개선 방안
> v2 (빌드 성공 != 기능 완성), v3 (Foundation-First) 이후 추가 발견 사항
> 작성: 2026-03-10

---

## 0. 요약: v4에서 새로 발견된 문제 카테고리

v2/v3은 "빌드 통과 → 런타임 미동작", "Foundation 누락" 문제에 집중했다.
v4는 **파이프라인 프로세스 자체의 구조적 결함** 5개를 다룬다:

| # | 카테고리 | 영향 단계 | 심각도 |
|---|----------|----------|--------|
| 1 | Demo 스크립트 프로세스 관리 패턴 오류 | implement → verify | HIGH |
| 2 | Cross-Feature 통합 지점 누락 | plan → analyze → implement | CRITICAL |
| 3 | Verify-time 코드 변경 분류 부재 | verify | MEDIUM |
| 4 | i18n 키 커버리지 검증 부재 | implement → verify | MEDIUM |
| 5 | Context Compaction에 의한 절차 유실 | verify | HIGH |
| 6 | Placeholder 구현 vs 실제 동작 괴리 | implement | CRITICAL |
| 7 | UI 인터랙션 과잉 노출 | implement → verify | MEDIUM |
| 8 | Runtime 테스트 미시도 패턴 | implement → verify | CRITICAL |

---

## 1. Demo 스크립트 프로세스 관리 패턴 오류

### 1-1. 문제

```text
발생: F006, F003 demo 스크립트의 interactive 모드
증상: ./demos/F006-mcp-tools.sh 실행 → 앱 시작 후 스크립트 즉시 종료
원인: pnpm run dev & + wait $APP_PID 패턴

  pnpm run dev &          ← pnpm PID 캡처
  APP_PID=$!
  wait $APP_PID           ← pnpm이 electron-vite 위임 후 종료 → wait 즉시 리턴

  pnpm → electron-vite → electron (자식 프로세스)
  부모(pnpm)가 먼저 종료되면 wait이 즉시 리턴
```

### 1-2. 영향 범위

```text
demos/F001-app-core.sh      → interactive: pnpm dev (fg)        ✅ 정상
demos/F002-ai-provider.sh   → interactive: pnpm dev (fg)        ✅ 정상
demos/F003-chat-core.sh     → interactive: & + wait             ❌ 버그 (수정 완료)
demos/F004-settings-data.sh → interactive: pnpm run dev (fg)    ✅ 정상
demos/F005-chat-ui.sh       → interactive: pnpm run dev (fg)    ✅ 정상
demos/F006-mcp-tools.sh     → interactive: & + wait             ❌ 버그 (수정 완료)

CI 모드: 모든 스크립트가 background + sleep + kill 패턴 — 의도적, 정상
```

### 1-3. 근본 원인: 스킬에 프로세스 관리 규칙 부재

현재 `demo-standard.md`는 demo의 **내용**(무엇을 보여줄 것인가)을 잘 정의하지만,
**프로세스 생명주기**(어떻게 앱을 시작하고 유지할 것인가)에 대한 규칙이 없다.

```text
demo-standard.md에 있는 것:
  ✅ Demo = 실행 가능한 스크립트
  ✅ Interactive: Start Feature → "Try it" → Ctrl+C까지 유지
  ✅ CI: Health check → exit
  ✅ Anti-pattern 목록 (markdown, test-only 등)

demo-standard.md에 없는 것:
  ❌ Interactive 모드의 프로세스 시작 방식 (foreground vs background)
  ❌ "& + wait" 패턴이 왜 위험한지
  ❌ exec vs direct call vs background의 차이
  ❌ 프로세스 트리 (pnpm → electron-vite → electron) 고려사항
```

### 1-4. 개선안

#### A. demo-standard.md에 Process Lifecycle Rules 섹션 추가

```markdown
## Process Lifecycle Rules

### Interactive Mode (default)
앱을 foreground에서 실행. 스크립트가 앱과 함께 살고 죽는다.

✅ CORRECT:
  # Option 1: exec (replaces shell process — cleanest)
  exec pnpm run dev

  # Option 2: direct call (blocks until exit)
  pnpm run dev

❌ WRONG:
  pnpm run dev &
  APP_PID=$!
  wait $APP_PID
  # → pnpm이 자식 프로세스 위임 후 종료 시 wait 즉시 리턴

### CI Mode
Background + stability check 패턴 사용. 의도적으로 프로세스를 제어한다.

✅ CORRECT:
  npx electron-vite dev &
  APP_PID=$!
  sleep 10
  kill -0 $APP_PID 2>/dev/null  # 생존 확인
  kill $APP_PID 2>/dev/null     # 정리
  wait $APP_PID 2>/dev/null

### 핵심 규칙
- Interactive = foreground (exec or direct call)
- CI = background + explicit lifecycle management
- NEVER use "& + wait" for interactive mode
```

#### B. verify-phases.md Phase 3 Step 5에 프로세스 패턴 검증 추가

```text
Step 5: Validate CI/Interactive path convergence (기존)
  + 추가: Interactive 모드의 프로세스 시작 방식 검증
    → grep -q '& *$' 으로 background 시작 확인
    → interactive 모드에서 background 시작 후 wait만 하는 패턴 탐지
    → 탐지 시 WARN: "Interactive mode uses background process —
       may exit prematurely. Use exec or direct call instead."
```

#### C. speckit-implement의 Demo-Ready Delivery에 프로세스 검증 추가

```text
Demo-Ready Delivery Step 6 (Create executable demo script) 이후:
  Step 6b: Process pattern validation
    → demo 스크립트의 interactive 섹션에서 "command &" + "wait $PID" 패턴 탐지
    → 발견 시 자동으로 exec 패턴으로 교체
    → CI 섹션의 background 패턴은 유지 (정상)
```

---

## 2. Cross-Feature 통합 지점 누락

### 2-1. 문제

```text
발생: F006 implement에서 MCP 도구가 AI 요청에 주입되지 않는 블로커
증상: MCP Tools 버튼 클릭 → 아무 동작 없음, AI 요청에 MCP 도구 미포함

원인 체인:
  1. ParameterBuilder (F003 구현) — assistant.mcpMode + assistant.mcpServers 의존
  2. useMCPStore (F006 구현) — servers[]에 MCP 서버 저장
  3. Default Assistant — mcpMode=undefined, mcpServers=undefined
  → ParameterBuilder와 useMCPStore 사이의 다리(bridge)가 없음

  tasks.md Phase 12: "Wire MCP tool injection into F002 AI provider pipeline"
  → 이 태스크가 존재했지만, bridge의 구체적 구현이 누락됨
```

### 2-2. 근본 원인 분석

```text
파이프라인의 3중 누락:

1. plan 단계 — Integration Point 미정의
   - plan.md에 "ParameterBuilder가 useMCPStore를 읽어야 한다"는 구체적 연결이 없음
   - upstream/downstream 의존성은 Feature 수준으로만 기술 (F002, F005)
   - 실제 코드 레벨의 Integration Point (어떤 함수가 어떤 store를 호출하는지)가 누락

2. analyze 단계 — Cross-feature integration coverage gap 미감지
   - analyze는 spec↔plan↔tasks 일관성을 검사
   - 하지만 "Feature X의 store를 Feature Y의 service가 읽는"
     inter-feature 데이터 흐름을 검사하지 않음

3. implement 단계 — Bridge 코드 미생성
   - tasks.md에 "Wire MCP tool injection" 태스크 존재
   - 하지만 구체적으로 "useMCPStore.getState()를 ParameterBuilder에서 호출"이라는
     코드 수준 지시가 없음 → implement에서 빈 스켈레톤만 생성
```

### 2-3. 개선안

#### A. plan 단계: Integration Point Matrix 필수화

```markdown
## Integration Points (REQUIRED for Features with upstream/downstream deps)

| Source (Provider) | Target (Consumer) | Data Flow | Trigger |
|-------------------|-------------------|-----------|---------|
| useMCPStore.servers | ParameterBuilder.buildStreamTextParams() | active servers → tool injection | user toggles mcpEnabled |
| useMCPStore.mcpEnabled | InputbarTools McpToolsButton | toggle state → UI highlight | user clicks MCP button |
| ParameterBuilder.tools | AI SDK streamText() | MCP tools in request | message send |

### Integration Contract
각 Integration Point에 대해:
- Source: 어떤 store/service의 어떤 필드
- Target: 어떤 service/component의 어떤 함수
- Data: 전달되는 데이터의 타입과 형식
- Trigger: 언제 이 데이터 흐름이 발생하는지
```

#### B. analyze 단계: Cross-Feature Data Flow Analysis 추가

```text
Detection Pass G (신규): Cross-Feature Data Flow

현재 analyze 검사 항목:
  A. Duplication Detection
  B. Ambiguity Detection
  C. Underspecification
  D. Constitution Alignment
  E. Coverage Gaps
  F. Inconsistency

추가:
  G. Cross-Feature Integration Analysis
     - tasks.md에서 다른 Feature의 store/service를 참조하는 태스크 식별
     - 해당 참조가 plan.md의 Integration Points에 명시되어 있는지 확인
     - 참조 대상이 실제로 구현되어 있는지 확인 (기존 코드베이스 검색)
     - 누락 시 SEVERITY=HIGH: "Integration Point X → Y referenced in task T0XX
       but not defined in plan.md Integration Points section"
```

#### C. implement 단계: Integration Point 태스크 구체화

```text
speckit-implement에서 Integration Point가 있는 태스크 처리 시:

1. plan.md의 Integration Point Matrix 읽기
2. 각 Integration Point에 대해:
   a. Source 코드의 현재 구현 읽기 (어떤 데이터를 노출하는지)
   b. Target 코드의 현재 구현 읽기 (어떤 데이터를 기대하는지)
   c. Bridge 코드 생성 (Source → Target 연결)
   d. 연결이 실제로 동작하는지 단위 테스트 또는 타입 체크로 확인

이 규칙이 있었다면:
  → plan에서 "useMCPStore.servers → ParameterBuilder" Integration Point 정의
  → implement에서 ParameterBuilder.ts 읽기 → mcpMode/mcpServers 의존 확인
  → useMCPStore.getState() 호출 bridge 코드 생성
  → mcpEnabled toggle state 추가 필요성 자동 도출
```

---

## 3. Verify-time 코드 변경 분류 부재

### 3-1. 문제

```text
발생: F006 verify 중 발견한 버그를 수정할 때
증상: verify 중 코드 수정 → 수정이 어떤 성격인지 분류하는 프로세스 없음

verify 중 수정한 항목:
  1. i18n 키 7개 추가 (ko.json, en.json)
  2. MCP tool injection bridge 코드 3파일 수정
  3. Demo 스크립트 프로세스 패턴 수정

이 수정들의 성격:
  1. Type 1 (Bugfix within scope) — i18n 키 누락은 implement 실수
  2. Type 2 (Design change) — MCP toggle + ParameterBuilder bridge는 설계 변경
  3. Type 1 (Bugfix) — demo 프로세스 패턴은 구현 버그

Type 2는 원래 plan으로 돌아가야 하지만, verify에서 바로 수정됨
→ plan↔implement↔verify 사이의 추적성(traceability) 깨짐
```

### 3-2. 개선안

#### verify-phases.md에 Change Classification Gate 추가

```text
verify 중 코드 수정이 필요할 때 (모든 Phase에서):

Step 0: 변경 분류
  수정 내용을 다음 3가지로 분류:

  Type 1: Scope 내 Bugfix
    - implement에서 누락된 코드, 오타, 잘못된 참조
    - i18n 키 누락, import 경로 오류, 타입 불일치
    - 즉시 수정 가능, plan/tasks 변경 불필요
    - 기록: verify notes에 "Bugfix: [설명]" 추가

  Type 2: Design Change
    - 새로운 state, 새로운 store 필드, 새로운 데이터 흐름
    - 기존 서비스의 호출 패턴 변경
    - 기록: verify notes에 "Design Change: [설명], 원래 plan.md 업데이트 필요"
    - WARN: "이 변경은 plan 수준의 설계 변경입니다. 계속하시겠습니까?"
    - 수정 후: plan.md의 해당 섹션 업데이트 (retroactive documentation)

  Type 3: New Requirement
    - spec.md에 없는 새로운 기능
    - 즉시 수정하지 않음
    - 기록: "New Requirement: [설명] → 별도 Feature 또는 spec 업데이트 필요"
    - HARD STOP: "이 변경은 새로운 요구사항입니다. proceed/defer?"
```

---

## 4. i18n 키 커버리지 검증 부재

### 4-1. 문제

```text
발생: F006 implement에서 i18n 키를 en.json에만 추가, ko.json 누락
      또는 컴포넌트에서 t('key') 사용했지만 i18n JSON에 키 미등록

증상: UI에 "settings.mcp.servers" 같은 raw key string 표시
발견: CDP UI 검증에서 수동으로 발견 (자동 감지 아님)

누락된 키 7개:
  settings.tabs.mcp, settings.mcp.servers, settings.mcp.builtinServers,
  settings.mcp.marketplaces, settings.mcp.npxSearch, settings.mcp.installRuntimes,
  settings.mcp.noServerSelected
```

### 4-2. 근본 원인

```text
1. implement에서 컴포넌트 코드와 i18n JSON을 별도 태스크로 처리
   → 컴포넌트에서 t('key') 사용 → i18n JSON에 키 추가를 깜빡함
   → 또는 en.json에만 추가하고 ko.json 누락

2. verify에서 i18n 완전성 검사 없음
   → "모든 t() 호출의 키가 모든 locale JSON에 존재하는가?" 검사 부재
   → 빌드는 성공함 (i18next는 키 누락 시 키 문자열 자체를 표시)
```

### 4-3. 개선안

#### A. implement 단계: i18n Completeness Check

```text
speckit-implement에서 i18n이 있는 프로젝트의 태스크 완료 시:

Post-task check: i18n key coverage
  1. 이번 태스크에서 생성/수정한 .tsx/.ts 파일에서 t('key') 패턴 추출
  2. 프로젝트의 모든 locale JSON (en.json, ko.json, ...) 에서 해당 키 존재 확인
  3. 누락된 키 발견 시:
     - 자동으로 모든 locale JSON에 키 추가
     - en.json 기준으로 다른 locale에 [TRANSLATE] 마커 추가
     - 또는 기존 번역 패턴에서 유추하여 번역 생성
```

#### B. verify Phase 1: i18n Lint

```text
verify Phase 1 (Build + Test + Lint)에 추가:

Step N: i18n coverage lint
  1. src/ 전체에서 t('...') 및 useTranslation 패턴 수집
  2. 모든 locale JSON에서 키 목록 수집
  3. 비교:
     - Code에서 사용하지만 JSON에 없는 키 → ERROR
     - JSON에 있지만 Code에서 사용하지 않는 키 → WARN (dead key)
     - en.json에 있지만 ko.json에 없는 키 → ERROR
  4. ERROR 있으면 verify FAIL

구현: grep 기반 간단한 스크립트로 충분
  grep -roh "t('[^']*')" src/ | sort -u > /tmp/used-keys.txt
  jq -r 'keys[]' src/renderer/src/i18n/en.json | sort > /tmp/en-keys.txt
  jq -r 'keys[]' src/renderer/src/i18n/ko.json | sort > /tmp/ko-keys.txt
  comm -23 /tmp/used-keys.txt /tmp/en-keys.txt  → missing in en
  comm -23 /tmp/en-keys.txt /tmp/ko-keys.txt    → missing in ko
```

---

## 5. Context Compaction에 의한 절차 유실

### 5-1. 문제

```text
발생: F006 verify 중 context window 한계 도달 → 자동 압축
증상: verify의 CDP UI 검증 절차가 통째로 유실 → 건너뜀

이전 대화에서의 실제 순서:
  1. verify Phase 1 (Build + Test) 실행 → 통과
  2. verify Phase 2 (SBI Check) 실행 → 통과
  3. [Context Compaction 발생]
  4. verify Phase 3 (CDP UI) → 건너뜀 (절차 기억 소실)
  5. 사용자가 "왜 Playwright 안 했어?" 질문으로 발견
```

### 5-2. 근본 원인

```text
verify는 multi-phase 프로세스 (Phase 0~4).
각 Phase의 세부 절차가 스킬 프롬프트에 있지만,
context compaction 후에는 "verify 진행 중" 정도의 요약만 남음.
→ 어떤 Phase까지 완료했고 어떤 Phase가 남았는지 추적 불가.
```

### 5-3. 개선안

#### A. verify 진행 상태를 파일로 기록

```text
verify 시작 시 상태 파일 생성:
  specs/006-mcp-tools/verify-progress.md

내용:
  ## Verify Progress — F006-mcp-tools

  | Phase | Status | Started | Completed | Notes |
  |-------|--------|---------|-----------|-------|
  | Phase 0: App Start | ✅ | 10:30 | 10:31 | CDP port 9222 |
  | Phase 1: Build+Test | ✅ | 10:31 | 10:33 | 228/228 tests |
  | Phase 2: SBI Check | ✅ | 10:33 | 10:35 | P1:11/11 |
  | Phase 3: CDP UI | ⬜ | — | — | PENDING |
  | Phase 4: Demo | ⬜ | — | — | PENDING |

각 Phase 완료 시 이 파일 업데이트.
Context compaction 후에도 이 파일을 읽으면 어디까지 진행했는지 알 수 있음.
```

#### B. verify-phases.md에 Compaction Recovery 프로토콜 추가

```text
verify 재개 시 (context compaction 후 또는 세션 재시작):

1. verify-progress.md 읽기
2. 마지막 ✅ Phase 확인
3. 다음 ⬜ Phase부터 재개
4. 이전 Phase 결과를 재실행하지 않음 (이미 기록됨)
```

---

## 6. 종합: 스킬별 개선 사항 매핑

### 6-1. speckit-plan (plan 단계)

| 개선 | 설명 | 대응 문제 |
|------|------|----------|
| Integration Point Matrix | upstream/downstream의 코드 수준 연결 정의 필수화 | #2 Cross-Feature 통합 |

### 6-2. speckit-analyze (analyze 단계)

| 개선 | 설명 | 대응 문제 |
|------|------|----------|
| Detection Pass G: Cross-Feature Data Flow | inter-feature store/service 참조 검사 | #2 Cross-Feature 통합 |

### 6-3. speckit-implement (implement 단계)

| 개선 | 설명 | 대응 문제 |
|------|------|----------|
| Demo Process Pattern Validation | interactive 모드의 foreground 강제 | #1 Demo 프로세스 |
| i18n Completeness Check | 태스크 완료 시 t() 키 ↔ JSON 교차 검증 | #4 i18n 커버리지 |
| Integration Point Task Concretization | bridge 코드 생성 시 Source/Target 코드 읽기 필수 | #2 Cross-Feature 통합 |
| Functional Completeness Check | SDK 호출 시 인자 형태 + execute 존재 확인 | #6 Placeholder 구현 |
| Interaction Surface Audit | hover/click 영역·반응속도·팝업 크기 검증 | #7 UI 과잉 노출 |

### 6-4. smart-sdd verify (verify 단계)

| 개선 | 설명 | 대응 문제 |
|------|------|----------|
| Change Classification Gate | Type 1/2/3 분류 후 처리 | #3 Verify-time 변경 |
| i18n Lint | Phase 1에 i18n 키 커버리지 검사 추가 | #4 i18n 커버리지 |
| SDK Integration Smoke Test | tool() 정의의 필수 필드 존재 런타임 확인 | #6 Placeholder 구현 |
| verify-progress.md | Phase별 진행 상태 파일 기록 | #5 Context Compaction |
| Compaction Recovery Protocol | 재개 시 progress 파일에서 상태 복원 | #5 Context Compaction |
| Demo Process Pattern Check | Phase 3 Step 5에 프로세스 패턴 검증 | #1 Demo 프로세스 |

### 6-5. demo-standard.md (demo 규격)

| 개선 | 설명 | 대응 문제 |
|------|------|----------|
| Process Lifecycle Rules 섹션 | foreground/background 패턴 규칙 명시 | #1 Demo 프로세스 |

---

## 7. 우선순위 및 실행 계획

### 즉시 적용 (다음 Feature 전에)

1. **demo-standard.md에 Process Lifecycle Rules 추가** — 템플릿 수정만으로 적용 가능
2. **verify-progress.md 기록 규칙 추가** — verify-phases.md 수정
3. **i18n lint 스크립트 작성** — grep + jq 기반, verify Phase 1에 통합

### 단기 적용 (스킬 업데이트 시)

4. **plan 템플릿에 Integration Point Matrix 추가** — speckit-plan 스킬 수정
5. **analyze에 Detection Pass G 추가** — speckit-analyze 스킬 수정
6. **verify Change Classification Gate 추가** — verify-phases.md 수정

### 중기 적용 (구조 변경 필요)

7. **implement의 Integration Point Task 처리 로직** — speckit-implement 스킬 수정
8. **implement의 i18n Completeness Check** — speckit-implement 스킬 수정

---

## 8. v2/v3과의 관계

```text
v2 (빌드 성공 != 기능 완성):
  → 문제: 런타임 검증 부재
  → 해결: CDP UI 검증 의무화
  → v4 추가: CDP 검증 자체가 context compaction으로 유실될 수 있음 (#5)

v3 (Foundation-First):
  → 문제: 프레임워크 기반 문제를 Feature 파이프라인이 감지 못함
  → 해결: Foundation Phase 추가
  → v4 추가: Foundation이 완벽해도 cross-feature integration은 별도 문제 (#2)

v4 (Process & Integration):
  → 문제: 파이프라인 프로세스 자체의 구조적 결함
  → v2/v3이 "무엇을 검증할 것인가"를 다뤘다면,
     v4는 "검증 프로세스 자체가 안정적인가"를 다룸
```

---

## 9. 이 개선이 적용되었다면 F006에서 무엇이 달랐을까

```text
#1 Demo 프로세스:
  plan에서 demo-standard.md의 Process Lifecycle Rules 참조
  → implement에서 exec 패턴으로 demo 생성
  → verify에서 프로세스 패턴 자동 검증
  → 결과: 조기 종료 버그 발생하지 않음

#2 Cross-Feature 통합:
  plan에서 Integration Point Matrix 작성
  → "useMCPStore.servers → ParameterBuilder" 명시
  → analyze에서 이 Integration Point의 태스크 커버리지 확인
  → implement에서 Source/Target 코드 읽기 → bridge 코드 생성
  → 결과: MCP tool injection 블로커 발생하지 않음

#3 Verify-time 변경:
  MCP toggle 추가 시 Type 2 (Design Change) 분류
  → plan.md에 mcpEnabled state 추가 기록
  → 추적성 유지
  → 결과: 설계 변경이 문서화됨

#4 i18n 커버리지:
  implement 태스크 완료 시 t() ↔ JSON 자동 교차 검증
  → 7개 키 누락 즉시 발견 → 모든 locale에 자동 추가
  → 결과: CDP에서 raw key string 표시 안 됨

#5 Context Compaction:
  verify-progress.md에 Phase별 상태 기록
  → compaction 후에도 "Phase 3 미완료" 확인 가능
  → CDP UI 검증 건너뛰지 않음
  → 결과: 사용자가 "왜 Playwright 안 했어?" 질문할 필요 없음

#6 Placeholder 구현:
  implement에서 tool definition 생성 시 Functional Completeness Check 적용
  → buildMcpToolsFromStore가 metadata-only 객체를 반환하는 것을 감지
  → "이 tool 정의에 execute function이 없습니다" 경고
  → 결과: 빌드 성공하지만 실제 동작하지 않는 코드 방지

#7 UI 인터랙션 과잉:
  implement에서 Interaction Surface Audit 적용
  → hover 영역이 전체 메시지 행인 것을 감지
  → "넓은 hover 영역 + 즉각적 팝업 = 사용성 저하" 경고
  → 결과: CSS group-hover + transition으로 부드럽게 처리
```

---

## 10. Placeholder 구현 vs 실제 동작 괴리

### 10-1. 문제

```text
발생: F006 MCP tool injection — 빌드 통과하지만 AI가 도구를 사용하지 못함
증상: MCP Tools 버튼 ON → 메시지 전송 → AI가 "파일시스템에 접근할 수 없습니다" 응답

원인:
  ParameterBuilder.buildMcpToolsFromStore()가 생성한 tool 정의:
    { type: "mcp", serverId: "xxx", serverName: "filesystem" }

  AI SDK streamText()가 기대하는 tool 정의:
    tool({
      description: "...",
      parameters: z.object({ path: z.string() }),
      execute: async (args) => { /* IPC 호출 */ }
    })

  → metadata-only 객체는 AI SDK가 인식하지 못함
  → 빌드는 성공 (타입 체크 `Record<string, unknown>`으로 우회)
  → 런타임에서 tools가 무시됨 → AI가 도구 없이 응답
```

### 10-2. 근본 원인

```text
implement에서 "tool injection" 태스크를 처리할 때:
  1. ParameterBuilder에 tool 객체를 넣는 코드만 작성
  2. 실제 AI SDK의 tool() 함수 시그니처를 확인하지 않음
  3. 타입이 Record<string, unknown>으로 선언되어 어떤 객체든 통과
  4. 빌드/테스트에서 감지 불가 — 런타임에서만 AI의 응답으로 확인 가능

이것은 "Placeholder 구현" 패턴:
  - 코드 구조는 존재하지만 실제 동작하는 로직이 없음
  - 타입 시스템이 느슨하여 컴파일러가 잡지 못함
  - 빌드/테스트가 통과하므로 파이프라인이 "완료"로 판정
```

### 10-3. 개선안

#### A. implement 단계: Functional Completeness Check

```text
speckit-implement에서 외부 SDK/API를 호출하는 태스크 완료 시:

Functional Completeness Check:
  1. 생성된 코드에서 외부 SDK 함수 호출 식별
     (예: streamText(), tool(), fetch(), ipcRenderer.invoke())
  2. 각 호출에 전달되는 인자의 형태가 SDK 문서/타입과 일치하는지 확인
  3. Record<string, unknown>, any, object 등 느슨한 타입으로 우회하는 경우 경고:
     "이 파라미터는 느슨한 타입입니다. SDK가 기대하는 구체적 형태를 확인하세요."
  4. execute/callback 함수가 필요한 곳에 빈 구현이나 누락이 있으면 경고:
     "이 tool 정의에 execute function이 없습니다."
```

#### B. verify Phase 1: SDK Integration Smoke Test

```text
verify Phase 1에 추가:

SDK Integration Smoke Test:
  1. 코드에서 외부 SDK 호출 패턴 식별
  2. 각 SDK 호출에 대해 최소한의 smoke test 생성:
     - streamText() 호출 → tools 파라미터의 형태 검증
     - tool() 정의 → description, parameters, execute 존재 확인
  3. 이 검증은 타입 체크가 아닌 런타임 검증
     → 실제 객체를 생성하여 필수 필드 존재 확인
```

---

## 11. UI 인터랙션 과잉 노출

### 11-1. 문제

```text
발생: 채팅 영역에서 마우스를 움직이면 모든 메시지에 Copy 버튼이 표시
증상: 채팅창 어디에나 마우스를 갖다대면 Copy 버튼 팝업 (메시지 단위 hover)

원인:
  Message.tsx의 hover 처리:
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}

  → 메시지의 전체 행 (px-4 py-2 영역)이 hover 대상
  → 마우스가 스쳐지나가기만 해도 즉시 menubar 표시
  → 스크롤 중에도 지나가는 모든 메시지에 Copy 버튼이 깜빡임
  → 사용자 경험: "아무데나 갖다대도 Copy 버튼이 뜬다"
```

### 11-2. 수정 내용

```text
Before (React state hover):
  const [isHovered, setIsHovered] = useState(false)
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
  {isHovered && <MessageMenubar />}

After (CSS group-hover):
  className="group relative ..."     ← 이미 있음
  <div className="opacity-0 transition-opacity group-hover:opacity-100">
    <MessageMenubar />
  </div>

차이점:
  - React state 제거 → 불필요한 리렌더링 방지
  - CSS transition → 부드러운 나타남/사라짐
  - opacity 기반 → DOM에 항상 존재하지만 보이지 않음 → layout shift 없음
  - 단, 완료된 메시지에만 렌더 (isStreaming/isEditing 체크 유지)
```

### 11-3. 개선안

#### speckit-implement: Interaction Surface Audit

```text
UI 컴포넌트 구현 시 hover/click 인터랙션 체크리스트:

1. Hover 영역 크기: 대상 요소보다 넓은 hover 영역은 의도적인가?
   → 전체 행 hover → 개별 요소 hover 검토
2. Hover 반응 속도: 즉각 반응 vs 딜레이?
   → 빈번한 패스스루 영역은 CSS transition 또는 debounce 필요
3. Hover 팝업 크기: 팝업이 인접 요소를 가리는가?
   → z-index + 포지셔닝 검토
4. 스크롤 중 인터랙션: 스크롤하면서 hover가 트리거되는가?
   → 스크롤 중에는 hover 비활성화 또는 CSS만 사용
5. React state vs CSS:
   → hover 표시만 토글 → CSS group-hover/peer 사용 (리렌더링 없음)
   → hover 시 데이터 로드 필요 → React state 사용
```

---

## 12. Runtime 테스트 미시도 패턴

### 12-1. 문제

```text
발생: 모든 Feature의 implement 및 verify 단계
증상: 코드 수정 후 빌드(tsc) + 테스트(vitest)만 실행, 실제 앱 실행 + Playwright 검증 미시도
      사용자가 "runtime 테스트를 해본건가?" 질문으로 발견

패턴:
  1. 코드 수정 → pnpm run build → 성공 ✅
  2. 코드 수정 → pnpm run test → 성공 ✅
  3. "완료되었습니다" 보고
  4. 사용자가 직접 앱 실행 → 동작하지 않음 ❌

이 패턴이 반복된 사례:
  - F006: MCP tool injection — 빌드 성공, 테스트 성공, 런타임에서 AI가 도구 미인식
  - F006: Copy 버튼 hover — 빌드 성공, CSS 수정 완료 보고, 실제 동작 미확인
  - F003~F006: 모든 Feature에서 implement 후 "빌드 성공" = "완료" 취급
```

### 12-2. 근본 원인

```text
왜 runtime 테스트를 시도하지 않는가:

1. 비용 비대칭:
   - 빌드/테스트: 즉시 실행 가능, 결과 명확, 스크립트화 되어 있음
   - 런타임: 앱 시작 필요, CDP 연결 필요, 대기 시간 발생, 수동 검증 필요
   → 빌드/테스트의 편의성 >> 런타임 테스트의 편의성

2. "빌드 성공 = 기능 완성" 인지 편향:
   - TypeScript 컴파일러가 통과하면 "코드가 맞다"고 착각
   - 특히 Record<string, unknown>, any 같은 느슨한 타입에서 위험
   - 테스트가 통과하면 "동작한다"고 착각 (테스트 자체가 불완전할 수 있음)

3. 스킬에 런타임 검증 의무 규정 부재:
   - speckit-implement: "빌드 성공" 확인만 요구
   - verify Phase 1: "Build + Test + Lint" — 모두 정적 검증
   - verify Phase 3: CDP UI 검증 있지만, implement 단계에는 없음
   → implement에서 런타임 검증을 하지 않아도 프로세스 위반이 아님

4. 도구 접근성:
   - Playwright MCP가 연결되어 있어도, 앱이 CDP 포트로 실행 중이어야 사용 가능
   - 앱 시작 → CDP 연결 → 스냅샷/스크린샷의 3단계가 매번 필요
   - implement 중에는 앱이 실행 중이 아닌 경우가 대부분
```

### 12-3. 개선안

#### A. speckit-implement: Post-Implementation Runtime Smoke Test

```text
speckit-implement에서 마지막 태스크 완료 후 (빌드 성공 확인 이후):

Runtime Smoke Test (MANDATORY for UI Features):
  1. 앱 시작 (CDP 포트 활성화)
     → npx electron-vite dev -- --remote-debugging-port=9222 &
     → 10초 대기 (앱 초기화)

  2. Playwright MCP로 기본 검증:
     a. browser_snapshot → 앱이 정상 로드되었는지 확인
     b. 이번 Feature의 주요 UI 요소가 존재하는지 확인
        (예: MCP Settings 페이지의 서버 목록, 채팅 입력바의 MCP 버튼)
     c. browser_take_screenshot → 시각적 확인용 스크린샷 저장

  3. 핵심 인터랙션 1~2개 테스트:
     a. 이번 Feature의 가장 중요한 사용자 흐름 1개 실행
        (예: MCP 버튼 클릭 → 활성화 확인 → 메시지 전송)
     b. 결과 확인 (UI 변화, 응답 내용 등)

  4. 앱 종료

  5. 결과 기록:
     - 성공: "Runtime smoke test passed: [확인 항목]"
     - 실패: HARD STOP → 수정 후 재테스트

건너뛸 수 있는 조건:
  - 순수 백엔드/데이터 레이어 Feature (UI 없음)
  - CLI 도구 (Electron 앱이 아님)
  - 명시적으로 --skip-runtime 플래그 전달
```

#### B. verify Phase 1 확장: Static → Runtime 확인 전환점 명시

```text
현재 verify Phase 1:
  Step 1: Build (tsc, electron-vite build)
  Step 2: Test (vitest)
  Step 3: Lint (eslint)

추가:
  Step 4: Runtime Boot Check (MANDATORY)
    → 앱을 실제 시작하여 crash 없이 로드되는지 확인
    → 이 시점부터 CDP 연결 유지
    → Phase 2 이후에도 CDP 연결 재사용
    → Phase 3 (CDP UI)에서 더 깊은 검증 수행

이 Step이 있었다면:
  → Phase 1에서 앱 시작 → crash/blank screen 즉시 감지
  → Phase 3으로의 전환이 자연스러움 (이미 앱이 실행 중)
  → "빌드 성공했으니 됐지" 편향 차단
```

#### C. implement 완료 보고 시 증거 제출 의무화

```text
implement 완료 보고에 포함해야 하는 증거:

현재:
  "빌드 성공 ✅, 테스트 X/X 통과 ✅"

개선:
  "빌드 성공 ✅, 테스트 X/X 통과 ✅, 런타임 확인 ✅"
  + 스크린샷 1장 (앱에서 Feature가 보이는 상태)
  + 핵심 인터랙션 결과 1개 (예: "MCP 버튼 클릭 → 'MCP Tools (1 active)' 표시 확인")

이 규칙이 있었다면:
  → MCP tool injection이 빌드만 성공하고 런타임에서 실패하는 것을
    implement 단계에서 바로 발견
  → 사용자가 "runtime 테스트를 해본건가?" 질문할 필요 없음
  → verify 단계에서의 대규모 수정 방지 (verify는 검증이지 구현이 아님)
```

### 12-4. 이 개선이 적용되었다면

```text
F006 MCP tool injection 타임라인:

AS-IS (현재):
  implement → 빌드 성공 → "완료" 보고
  → verify Phase 1 → 빌드/테스트 통과
  → verify Phase 3 → CDP에서 MCP 버튼 확인 → 메시지 전송 → 동작 안 함
  → 사용자: "runtime 테스트 해본거야?"
  → 코드 수정 (Placeholder → 실제 tool() 정의)
  → 재빌드 → 재테스트 → 런타임 재확인

TO-BE (개선 후):
  implement → 빌드 성공 → Runtime Smoke Test
  → 앱 시작 → MCP 버튼 클릭 → 메시지 전송 → AI 응답에 tool 미사용 감지
  → 코드 수정 (Placeholder → 실제 tool() 정의)
  → 재빌드 → 재 Runtime Smoke Test → 동작 확인
  → "완료" 보고 (스크린샷 + 인터랙션 결과 첨부)
  → verify에서는 edge case와 SBI 검증에 집중 (기본 동작은 이미 확인됨)

시간 절약: verify에서의 대규모 코드 수정 제거 → 전체 파이프라인 1 iteration 절약
품질 향상: implement에서 기본 동작 보장 → verify에서 더 깊은 검증 가능
```

---

## 13. 종합 스킬별 개선 사항 매핑 (v4 최종)

### 13-1. speckit-plan (plan 단계)

| 개선 | 설명 | 대응 문제 |
|------|------|----------|
| Integration Point Matrix | upstream/downstream의 코드 수준 연결 정의 필수화 | #2 Cross-Feature 통합 |

### 13-2. speckit-analyze (analyze 단계)

| 개선 | 설명 | 대응 문제 |
|------|------|----------|
| Detection Pass G: Cross-Feature Data Flow | inter-feature store/service 참조 검사 | #2 Cross-Feature 통합 |

### 13-3. speckit-implement (implement 단계)

| 개선 | 설명 | 대응 문제 |
|------|------|----------|
| Demo Process Pattern Validation | interactive 모드의 foreground 강제 | #1 Demo 프로세스 |
| i18n Completeness Check | 태스크 완료 시 t() 키 ↔ JSON 교차 검증 | #4 i18n 커버리지 |
| Integration Point Task Concretization | bridge 코드 생성 시 Source/Target 코드 읽기 필수 | #2 Cross-Feature 통합 |
| Functional Completeness Check | SDK 호출 시 인자 형태 + execute 존재 확인 | #6 Placeholder 구현 |
| Interaction Surface Audit | hover/click 영역·반응속도·팝업 크기 검증 | #7 UI 과잉 노출 |
| Post-Implementation Runtime Smoke Test | 빌드 후 실제 앱 시작 + Playwright 기본 검증 | #8 Runtime 미시도 |
| 완료 보고 증거 의무화 | 스크린샷 + 인터랙션 결과 첨부 필수 | #8 Runtime 미시도 |

### 13-4. smart-sdd verify (verify 단계)

| 개선 | 설명 | 대응 문제 |
|------|------|----------|
| Change Classification Gate | Type 1/2/3 분류 후 처리 | #3 Verify-time 변경 |
| i18n Lint | Phase 1에 i18n 키 커버리지 검사 추가 | #4 i18n 커버리지 |
| SDK Integration Smoke Test | tool() 정의의 필수 필드 존재 런타임 확인 | #6 Placeholder 구현 |
| verify-progress.md | Phase별 진행 상태 파일 기록 | #5 Context Compaction |
| Compaction Recovery Protocol | 재개 시 progress 파일에서 상태 복원 | #5 Context Compaction |
| Demo Process Pattern Check | Phase 3 Step 5에 프로세스 패턴 검증 | #1 Demo 프로세스 |
| Runtime Boot Check (Phase 1 Step 4) | 정적 검증 → 런타임 확인 전환점 명시 | #8 Runtime 미시도 |

### 13-5. demo-standard.md (demo 규격)

| 개선 | 설명 | 대응 문제 |
|------|------|----------|
| Process Lifecycle Rules 섹션 | foreground/background 패턴 규칙 명시 | #1 Demo 프로세스 |
