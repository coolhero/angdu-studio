# Skill Feedback — spec-kit-skills Improvement Log

> Records issues, gaps, and improvement opportunities discovered during pipeline execution.
> This file is consumed by the spec-kit-skills maintainer session.

---

## [SKF-001] Implement phase lacks parallel agent file-conflict prevention

- **Trigger**: A (자각)
- **Phase**: smart-sdd implement Phase 3-10 (F001-app-shell)
- **Category**: MISSING_RULE
- **Severity**: Major (결과물 품질 저하)

### Skill Trace
- **File**: `.claude/skills/smart-sdd/commands/pipeline.md`
- **Rule**: N/A — implement 단계에서 여러 background agent를 사용할 때 파일 충돌 방지에 대한 규칙 없음
- **Line**: N/A

### Problem
implement 단계에서 Phase 3-6과 Phase 7-10을 두 개의 배경 에이전트로 병렬 실행했다. 두 에이전트 모두 `src/main/index.ts`와 `src/main/ipc.ts`를 수정하여 충돌 발생:
- index.ts: 한 에이전트는 WindowService 싱글턴을 사용하고, 다른 에이전트는 로컬 createMainWindow() 함수를 작성
- ipc.ts: 한 에이전트는 registerIpc(mainWindow) 시그니처, 다른 에이전트는 registerIpc() 시그니처로 작성
- 결과적으로 메인 에이전트가 수동으로 index.ts를 재작성해야 했음

### Expected
병렬 에이전트가 동일 파일을 수정하지 않도록 파일 소유권을 명확히 분리하거나, 공유 파일은 메인 에이전트가 마지막에 통합하는 패턴이 있었어야 함

### Workaround
메인 에이전트가 양쪽 에이전트의 결과를 읽고 index.ts를 재작성함. ipc.ts는 두 번째 에이전트가 더 완전한 버전을 작성하여 그것을 채택.

### Suggested Fix
`commands/pipeline.md`의 implement 단계에 규칙 추가:
- "병렬 에이전트 사용 시, 각 에이전트의 파일 스코프를 명시적으로 분리해야 한다"
- "공유 진입점 파일(index.ts, ipc.ts 등)은 병렬 에이전트에 할당하지 않고, 에이전트 완료 후 메인 에이전트가 통합한다"
- 또는: "implement는 병렬 에이전트 대신 순차적 phase 실행을 권장한다" (품질 vs 속도 트레이드오프 명시)

---

## [SKF-002] Implement phase lacks runtime launch verification gate

- **Trigger**: A (자각)
- **Phase**: smart-sdd implement (F001-app-shell)
- **Category**: MISSING_RULE
- **Severity**: Major (결과물 품질 저하)

### Skill Trace
- **File**: `.claude/skills/smart-sdd/commands/pipeline.md`
- **Rule**: N/A — implement 완료 후 빌드 성공만 확인하고 런타임 실행은 확인하지 않음
- **Line**: N/A

### Problem
implement 단계 완료 후 `electron-vite build` (정적 빌드)만 성공 확인했다. 그러나 실제 앱을 실행하면 `"Electron failed to install correctly"` 오류로 즉시 크래시. 원인은 `electron.vite.config.ts`의 `inlineDynamicImports: true`가 `externalizeDepsPlugin()`의 electron 외부화를 무효화한 것. 빌드는 성공하지만 런타임에서 실패하는 전형적 케이스.

이 문제는 verify Phase 0 (Dev Mode Stability Probe)에서 발견되었으나, implement에서 이미 잡았어야 했다.

### Expected
implement 완료 조건에 "빌드 성공 + 앱 기동 확인"이 포함되어야 한다. Electron 프로젝트의 경우 `npx electron out/main/index.js`가 크래시 없이 시작되는지 최소한 확인.

### Workaround
verify Phase 0에서 발견하여 `electron.vite.config.ts`에 `external: ['electron']`을 추가하여 해결.

### Suggested Fix
`commands/pipeline.md` implement 단계의 완료 게이트에 규칙 추가:
- "빌드 성공 후, 앱을 실제 기동하여 5초 이상 크래시 없이 실행되는지 확인한다 (Electron: `npx electron out/main/index.js`, Web: dev server 기동)"
- 이것은 verify의 Dev Mode Stability Probe와 중복이지만, implement 단계에서 조기 발견하면 verify의 Source Modification Gate를 거치지 않아도 됨

---

## [SKF-003] Implement Checkpoint lacks artifact listing for review

- **Trigger**: A (자각)
- **Phase**: smart-sdd implement checkpoint (F001-app-shell)
- **Category**: MISSING_RULE
- **Severity**: Minor (마찰)

### Skill Trace
- **File**: `.claude/skills/smart-sdd/commands/pipeline.md`
- **Rule**: N/A — implement checkpoint에서 "어떤 파일을 만들 계획인가"를 사용자에게 보여주는 규칙 없음
- **Line**: N/A

### Problem
implement checkpoint에서 "Install dependencies and proceed"만 승인하고 바로 배경 에이전트를 실행했다. 사용자는 어떤 파일이 만들어질지, 어떤 패턴으로 구현될지 사전에 볼 수 없었다. 결과적으로 두 에이전트가 만든 코드가 충돌하는 것도 사전에 감지할 수 없었다.

### Expected
implement checkpoint에서 "생성될 파일 목록 + 각 파일의 역할 + 병렬 에이전트 사용 시 파일 분담 계획"을 보여주고 승인받아야 한다.

### Workaround
없음 — 사용자가 수동 개입할 기회 없이 진행됨

### Suggested Fix
implement checkpoint에 표시 항목 추가:
- 생성/수정 예정 파일 목록 (tasks.md 기반)
- 병렬 실행 계획 (어떤 에이전트가 어떤 파일을 담당)
- 공유 파일 통합 전략

---

## [SKF-004] Implement phase renderer foundation lacks basic UI verification

- **Trigger**: B (사용자 지적)
- **Phase**: smart-sdd implement (F001-app-shell)
- **Category**: MISSING_RULE
- **Severity**: Major (결과물 품질 저하)

### Skill Trace
- **File**: `.claude/skills/smart-sdd/commands/pipeline.md`
- **Rule**: N/A — implement 단계에서 렌더러 UI가 최소한의 인터랙션 가능 상태인지 확인하는 규칙 없음
- **Line**: N/A

### Problem
F001-app-shell implement에서 main process 서비스 10개는 완전히 구현했지만, 렌더러는 "Angdu Studio" 텍스트만 표시하는 빈 페이지로 남김. 사용자가 실제 앱을 실행하면:
- 윈도우를 이동할 수 없음 (Win/Linux: frame:false인데 드래그 영역 없음)
- 윈도우를 닫을/최소화/최대화 방법 없음 (커스텀 타이틀바 없음)
- 테마를 변경할 방법 없음 (ThemeService는 있으나 UI 없음)

사용자가 "윈도우를 이동할수 없고 테마를 변경할 수단도 없어"라고 지적하여 Major-Implement regression 발생.

### Expected
app-shell Feature의 렌더러는 최소한:
1. 커스텀 타이틀바 (드래그 영역 + 윈도우 컨트롤 버튼)
2. IPC로 연결된 윈도우 컨트롤 (minimize, maximize, close)
3. 테마 토글 (dark/light/system)
이 있어야 사용자가 앱을 조작할 수 있음.

### Workaround
없음 — verify에서 pipeline regression하여 implement로 돌아감

### Suggested Fix
`commands/pipeline.md` implement 단계에 규칙 추가:
- "GUI 프로젝트의 경우, implement 완료 전에 '사용자가 앱을 기본적으로 조작할 수 있는가?'를 확인한다"
- 체크리스트: 윈도우 이동 가능, 윈도우 닫기 가능, 핵심 설정 변경 가능
- 또는: tasks.md의 렌더러 Phase 체크포인트를 강화하여 "UI placeholder가 아닌 실제 인터랙티브 컴포넌트 필수"로 명시

---

## [SKF-005] Verify SC code-level check missed runtime theme toggle bug

- **Trigger**: B (사용자 지적)
- **Phase**: smart-sdd verify Phase 3 — SC verification (F001-app-shell)
- **Category**: WRONG_ASSUMPTION
- **Severity**: Major (결과물 품질 저하)

### Skill Trace
- **File**: `.claude/skills/smart-sdd/commands/verify-phases.md`
- **Rule**: Phase 3 SC Verification — "For each chain, verify the key implementation steps exist in the Feature's code (use git diff to scope to changed files)" (code-level grep check)
- **Line**: ~772-789

### Problem
SC-005 (테마 동기화)를 코드 레벨로 검증할 때 "ThemeService.setTheme() 존재 ✅, 브로드캐스트 존재 ✅, titleBarOverlay 업데이트 존재 ✅"로 통과 판정했다. 그러나 실제 런타임에서 테마 토글이 작동하지 않았다:
- `index.html`에 `<body class="dark">`가 하드코딩됨
- App.tsx의 setTheme()가 `document.documentElement`만 토글하고 `body`는 건드리지 않음
- 결과: dark class가 body에 남아있어 CSS 변수가 변하지 않음

코드 레벨 grep은 "setTheme 함수가 존재하는가"만 확인하지, "setTheme이 올바른 DOM 요소를 조작하는가"는 확인하지 않는다. 이것은 cli-limited 백엔드에서 런타임 검증이 불가능한 것이 아니라, SC 검증 깊이가 부족한 것이다.

### Expected
SC 코드 레벨 검증에서 테마 관련 SC는 다음을 추가 확인해야 했다:
1. HTML 파일의 초기 dark class 위치
2. JS의 classList.toggle 대상 요소 (documentElement vs body)
3. 두 값의 일관성

### Workaround
사용자가 "theme 변화가 안되는데"라고 지적하여 발견. html과 body 모두에 dark class를 토글하도록 수정.

### Suggested Fix
`commands/verify-phases.md` Phase 3 SC 검증에 UI 테마 관련 추가 규칙:
- "테마 SC 검증 시, HTML 파일의 초기 class와 JS의 class 토글 대상 요소가 일관되는지 확인"
- 또는: "SC 코드 레벨 검증은 함수 존재뿐 아니라, 함수의 인자/대상이 올바른지도 확인 (cross-reference check)"
- 더 근본적으로: cli-limited에서도 최소한 Playwright `_electron.launch()` 기반 런타임 검증을 수행하도록 권장

---

## [SKF-006] Verify Phase 3 runtime verification skipped with cli-limited backend

- **Trigger**: C (비교 검증)
- **Phase**: smart-sdd verify Phase 3 (F001-app-shell)
- **Category**: AMBIGUOUS_RULE
- **Severity**: Major (결과물 품질 저하)

### Skill Trace
- **File**: `.claude/skills/smart-sdd/commands/verify-phases.md`
- **Rule**: Pre-flight Backend Detection — "cli-limited: ℹ️ Runtime verification: Playwright CLI (limited — no test file yet)"
- **Line**: ~418

### Problem
`RUNTIME_BACKEND = cli-limited`로 판정되어 Phase 3에서 코드 레벨 SC 검증만 수행하고 런타임 검증은 전혀 하지 않았다. "limited"가 "코드 레벨만으로 충분"으로 해석되었으나, 실제로는:
- Playwright CLI는 설치되어 있음 (`npx playwright --version` → 1.58.2)
- `_electron.launch()`로 앱을 실행하고 스냅샷을 찍는 것은 test 파일 없이도 가능
- cli-limited는 "verify spec file이 없다"는 뜻이지 "런타임 접근이 불가능하다"는 뜻이 아님

테마 버그는 간단한 런타임 스냅샷(테마 토글 → DOM class 확인)으로 발견할 수 있었다.

### Expected
cli-limited에서도 최소한의 런타임 탐색을 수행:
- `_electron.launch()` → 앱 시작
- 기본 스냅샷 → UI 요소 존재 확인
- 기본 인터랙션 (클릭) → 상태 변화 확인

### Workaround
사용자가 직접 실행하여 발견

### Suggested Fix
`commands/verify-phases.md`에 cli-limited 백엔드 행동 명확화:
- "cli-limited에서는 verify test file이 없지만, Playwright `_electron.launch()`를 사용한 ad-hoc 런타임 탐색은 수행한다"
- 최소 검증 항목: 앱 시작 → 주요 UI 요소 존재 확인 → SC별 기본 인터랙션 테스트
- 또는: cli-limited일 때 verify test file을 자동 생성하여 SC를 기반으로 기본 테스트 작성

