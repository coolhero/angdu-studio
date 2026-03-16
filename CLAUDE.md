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
- **Timestamp**: YYYY-MM-DD HH:MM (발견 시각, 24시간 형식)

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


## Pipeline Execution Notes

> 이전 파이프라인 실행에서 발견된 이슈와 교훈을 기록합니다.
> smart-sdd pipeline 실행 시 에이전트가 참고해야 할 사항입니다.

### Known Behavioral Issues

1. **spec-kit 출력 억제 필수 (MANDATORY RULE 3)**: `speckit-*` 명령 실행 후 raw output ("Suggested commit", "Ready for /speckit.*", "Constitution finalized" 등)을 사용자에게 보여주지 마세요. 반드시 artifact 파일을 읽고 → Review 포맷으로 표시 → AskUserQuestion 호출 순서를 따르세요. 컨텍스트 한계 시 `💡 Type "continue" to review the results.`를 표시하세요. 이 규칙은 smart-sdd SKILL.md MANDATORY RULE 3에 정의되어 있습니다.

2. **HARD STOP 건너뛰기 금지**: Review 후 사용자 승인 없이 다음 step으로 넘어가지 마세요. "Constitution finalized → F001 pipeline" 처럼 HARD STOP을 건너뛰는 것은 continuity가 아니라 위반입니다.

3. **Feature 의존성 = 구현 순서**: "A의 코드가 B를 import한다"는 런타임 결합이지 Feature 의존성이 아닙니다. Feature 의존성은 "B의 코드가 없으면 A를 처음부터 작성할 수 없는가?"로 판단합니다. F001 (app-shell)은 항상 첫 번째입니다.

### Skill Feedback 작성 원칙

SKF 항목은 **spec-kit-skills의 구조적 문제**에 초점을 맞춘다:
- Problem: "에이전트가 뭘 잘못했는가"가 아니라 "skill 파일의 어떤 규칙 부재/결함이 이 결과를 유발했는가"
- Suggested Fix: "구체적으로 어느 skill 파일의 어느 규칙을 어떻게 수정하면 같은 문제가 재발하지 않는가"
- 단순한 구현 버그, 에이전트의 실수는 SKF가 아님. Skill의 규칙이 해당 상황을 커버하지 못한 구조적 gap만 기록

### F003 파이프라인 교훈 (구조적 결함)

1. **SBI 해상도 부족 (SKF-028)**: 설정 페이지처럼 UI 컨트롤이 밀집된 파일은 파일 단위 SBI로는 개별 기능을 놓침. reverse-spec의 SBI 추출에 "UI 밀집 파일 감지 → 컨트롤 단위 분리" 규칙 필요
2. **Verify Method 단절 (SKF-029)**: plan.md Interaction Chains의 Verify Method 열이 verify Phase 3에서 실행되지 않음. plan에서 정의한 검증 사양이 verify까지 흐르는 연결 규칙 필요
3. **Feature Reachability 미검증 (SKF-030)**: UI Feature가 코드로 존재해도 앱에서 접근할 수 없으면 무의미. verify Phase 0에 "홈에서 UI만으로 대상 Feature에 도달 가능한가" 게이트 필요
4. **Demo TEST PLAN 작성만 하고 검증 안 함 (SKF-031/032)**: Demo 스크립트의 TEST PLAN에 "조작→기대→확인" 형식으로 시나리오를 작성해도, verify에서 이를 실행하는 규칙이 없으면 dead document. verify Phase 3에서 자동화 가능한 항목은 Playwright로 실행하고, 수동 전용은 skip 사유 기록 필요
5. **Verify 자동 테스트가 persist 상태를 고려 안 함 (SKF-033)**: 이전 테스트 세션의 persist된 상태(dark theme, 변경된 언어 등)로 앱이 시작되면 테스트 로직이 오판. "상태 가정 금지 → 현재 값 감지 후 반대로 전환" 패턴 필수
6. **비동기 hydration과 외부 시스템 동기화 누락 (SKF-034)**: i18next 정적 초기화(`lng:'ko'`)와 config persist된 language가 불일치하는 race condition. hydrate 완료 시 `i18n.changeLanguage(config.language)` 무조건 호출 필요

### Execution Log

| Date | Phase | Issue | Resolution |
|------|-------|-------|------------|
| 2026-03-15 | reverse-spec | case-study-log.md가 cherry-studio(소스)에 생성됨 | CWD(angdu-studio)로 복사, analyze.md 경로 수정 |
| 2026-03-15 | reverse-spec | Demo Group SBI Coverage "TBD"로 남음 | roadmap.md에 직접 계산하여 기입, analyze.md 구조 분리 |
| 2026-03-15 | smart-sdd constitution | Review 없이 F001로 바로 진행 | MANDATORY RULE 3 추가 (SKILL.md) |
| 2026-03-15 | smart-sdd specify F001 | "Ready for /speckit.clarify" raw output 표시 후 멈춤 | MANDATORY RULE 3 반영 전 발생, 최신 버전에서 확인 예정 |
| 2026-03-16 | smart-sdd F003 verify | Top 모드에서 Settings 접근 불가 | Navbar에 gear 아이콘 추가 (SKF-030) |
| 2026-03-16 | smart-sdd F003 verify | Cherry Studio 대비 설정 기능 누락 | SBI 해상도 문제 (SKF-028), scope 결정 필요 |

## Active Technologies
(clean restart — no implementation yet)
- TypeScript 5.8+ (strict mode) + Electron v40+, electron-vite, electron-updater, better-sqlite3, Zustand, React 19, Zod (001-app-shell)
- better-sqlite3 for config persistence (main process) (001-app-shell)
- TypeScript 5.8+ (strict mode) + react-router-dom v7 (HashRouter), Zustand, @dnd-kit/core + @dnd-kit/sortable, shadcn/ui (ContextMenu, Tooltip, DropdownMenu), lucide-reac (002-navigation)
- F001's AppConfig via IPC (config:get/set) for tab and navbar persistence (002-navigation)
- TypeScript 5.8+ (strict mode) + React 19, Zustand, shadcn/ui, Tailwind CSS 4, i18next, react-i18next, JSZip, react-router-dom v7 (003-settings)
- electron-store via F001 Config API (IPC) (003-settings)

## Recent Changes
(clean restart — no implementation yet)
