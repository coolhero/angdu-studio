## Skill Feedback Protocol

Pipeline 실행 중 spec-kit-skills 개선이 필요한 사항을 `skill-feedback.md`에 기록한다.
이 파일은 spec-kit-skills 관리 세션에서 읽고 skill 파일을 수정하는 데 사용된다.

### 기록 트리거

**A. 에이전트 자각** — 실행 중 마찰 발견 시 즉시 기록
- Skill instruction이 모호하거나 해석이 갈릴 때
- 이 상황에 대한 가이드가 skill 파일에 없을 때
- 불필요한 절차, 빈 컨텍스트 주입, 잘못된 가정 등

**B. 사용자 지적** — 사용자가 문제를 알려주면 원인을 skill 파일까지 추적하여 기록
- 사용자가 출력 품질, 누락, 잘못된 결과를 지적하면
- 해당 문제를 일으킨 skill 파일의 어느 규칙(또는 규칙 부재)이 원인인지 분석
- 원인이 skill이면 SKF 기록, 에이전트 한계면 그것도 명시

**C. Checkpoint 비교** — Phase 완료 시 자기 검증
- reverse-spec 완료 후: "이전 실행에서 놓쳤던 것을 이번에 잡았는가?" 자문
- 각 Feature verify 후: "skill이 지시한 검증을 전부 수행했는가?" 자문
- 빠뜨린 항목이 있으면 원인 분석 후 기록

### 원인 분류 (반드시 하나 선택)

| 분류 | 의미 | 수정 방향 |
|------|------|----------|
| **MISSING_RULE** | 이 상황에 대한 가이드가 skill에 없음 | 규칙 추가 |
| **WRONG_RULE** | 규칙대로 했는데 결과가 틀림 | 규칙 수정 |
| **AMBIGUOUS_RULE** | 규칙이 여러 해석 가능, 잘못된 쪽으로 감 | 규칙 명확화 |
| **WRONG_ASSUMPTION** | 규칙이 전제하는 조건이 실제와 다름 | 전제 수정 |
| **MISSING_INJECTION** | 필요한 컨텍스트가 해당 command에 주입 안 됨 | injection 파일 수정 |
| **TEMPLATE_GAP** | 출력 템플릿이 필요한 정보를 담지 못함 | 템플릿 수정 |
| **OVER_ENGINEERED** | 불필요한 절차/검증이 마찰을 만듦 | 간소화 |
| **AGENT_LIMIT** | skill 문제가 아닌 에이전트 능력 한계 | 수정 불가, 우회책만 기록 |

### Entry 형식

항목 ID는 SKF-001부터 순번. 발견 즉시 기록하고 파이프라인은 계속 진행.

~~~
## [SKF-NNN] Short title

- **Trigger**: A (자각) / B (사용자 지적) / C (비교 검증)
- **Phase**: 발생 시점 (예: reverse-spec Phase 2-7b, smart-sdd verify Phase 1)
- **Category**: MISSING_RULE / WRONG_RULE / AMBIGUOUS_RULE / WRONG_ASSUMPTION / MISSING_INJECTION / TEMPLATE_GAP / OVER_ENGINEERED / AGENT_LIMIT
- **Severity**: Critical (pipeline 중단) / Major (결과물 품질 저하) / Minor (마찰) / Idea (개선 아이디어)

### Skill Trace
- **File**: spec-kit-skills 내 원인 파일 (예: `.claude/skills/smart-sdd/commands/verify-phases.md`)
- **Rule**: 해당 파일에서 관련 규칙 원문 인용 (규칙이 없으면 "N/A — 이 상황에 대한 규칙 없음")
- **Line**: 가능하면 줄 번호

### Problem
[에이전트가 실제로 한 행동과 그 결과를 사실 기반으로 기술]

### Expected
[올바른 행동/결과가 무엇이었어야 하는지]

### Workaround
[현장에서 적용한 우회책. 없으면 "없음 — 사용자가 수동 개입"]

### Suggested Fix
[구체적인 수정 제안. 가능하면 "파일 X의 Y 규칙을 Z로 변경" 수준으로]
~~~

### 기록 원칙

1. **Skill Trace가 핵심** — 원인 파일과 규칙(또는 부재)을 반드시 특정. "어딘가 문제" 수준은 불가
2. **Problem과 Expected의 대비** — 둘 다 있어야 수정 방향이 나옴
3. **Workaround 필수 기록** — 현장 우회책이 종종 최선의 수정안이 됨
4. **AGENT_LIMIT도 기록** — skill로 해결 불가한 것을 명시해야 같은 시도를 반복 안 함
5. **한 항목 = 한 이슈** — 복합 문제는 분리해서 각각 기록

