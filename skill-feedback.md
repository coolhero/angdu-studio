# Skill Feedback — spec-kit-skills Improvement Log

> Records issues, gaps, and improvement opportunities discovered during pipeline execution.
> This file is consumed by the spec-kit-skills maintainer session.

---

## [SKF-001] Implement phase lacks parallel agent file-conflict prevention

- **Trigger**: A (자각)
- **Phase**: smart-sdd implement Phase 3-10 (F001-app-shell)
- **Category**: MISSING_RULE
- **Severity**: Major (결과물 품질 저하)
- **Status**: ✅ Reflected — `pipeline.md` L743-750 (Parallel Agent File Ownership Protocol)

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
- **Status**: ✅ Reflected — `pipeline.md` L761-774 (Post-Implement Smoke Launch)

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
- **Status**: ✅ Reflected — `pipeline.md` L752-759 (Implement Checkpoint Display)

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
- **Status**: ✅ Reflected — `pipeline.md` L768-770 (GUI Operability Check in Smoke Launch)

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
- **Status**: ✅ Reflected — `verify-phases.md` L1021-1027 (Code-Level Cross-Reference Rule)

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
- **Status**: ✅ Reflected — `verify-phases.md` L1084-1091 + L418 (cli-limited ad-hoc runtime exploration)

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


---

## [SKF-007] Demo gated by constitution but should detect existing demo pattern

- **Trigger**: B (사용자 지적)
- **Phase**: smart-sdd implement (F002-navigation)
- **Category**: WRONG_ASSUMPTION
- **Severity**: Major (결과물 품질 저하)
- **Status**: ✅ Reflected — `injection/implement.md` L236, `injection/tasks.md` L37, `verify-phases.md` L909-915, `injection/verify.md` L79+L167

### Skill Trace
- **File**: `.claude/skills/smart-sdd/reference/injection/implement.md`
- **Rule**: "## Demo-Ready Delivery (only if VI. Demo-Ready Delivery is in the constitution)"
- **Line**: ~236

### Problem
F002 implement에서 데모 스크립트를 생성하지 않았다. implement injection 규칙이 데모를 constitution "VI. Demo-Ready Delivery" 원칙 유무로 게이팅하는데, 이 프로젝트의 constitution에는 해당 원칙이 없어서 규칙대로 스킵했다. 그러나 F001에서 이미 `demos/F001-app-shell.sh`가 존재하므로 사용자는 당연히 F002에도 데모가 있을 것으로 기대했다.

### Expected
`demos/` 디렉토리에 이전 Feature의 데모가 이미 있으면, constitution 원칙 유무와 관계없이 동일 패턴으로 데모를 생성해야 한다.

### Workaround
사용자 지적 후 수동으로 `demos/F002-navigation.sh` 생성 (CI + interactive 모드)

### Suggested Fix
`reference/injection/implement.md` § Demo-Ready Delivery 조건을 수정:
- 현재: `(only if VI. Demo-Ready Delivery is in the constitution)`
- 수정: `(if VI. Demo-Ready Delivery is in the constitution OR demos/ directory already contains Feature demo scripts from previous pipeline runs)`
- 이렇게 하면 constitution에 원칙이 없어도 프로젝트에 데모 패턴이 확립되어 있으면 자동으로 데모를 생성

---

## [SKF-008] Implement lacks visual reference comparison causing UI layout divergence

- **Trigger**: B (사용자 지적)
- **Phase**: smart-sdd implement (F002-navigation)
- **Category**: MISSING_INJECTION
- **Severity**: Major (결과물 품질 저하)
- **Status**: ✅ Reflected — `injection/implement.md` Visual References Fallback (L143-153) + Checkpoint notification (L635-637)

### Skill Trace
- **File**: `.claude/skills/smart-sdd/reference/injection/implement.md`
- **Rule**: "## Source App Visual Reference (rebuild mode, GUI)" — 원본 앱의 스크린샷을 참조하여 UI를 구현하도록 되어 있으나, 이 섹션이 실행되지 않았음
- **Line**: ~115-148

### Problem
F002-navigation implement에서 원본 Cherry Studio의 UI 형상과 크게 다른 레이아웃을 만들었다:
1. **드래그 영역 누락**: F001의 Titlebar를 Router로 교체하면서 상단 드래그 영역을 제거. Sidebar(48px)만 드래그 가능하여 사실상 윈도우 이동 불가
2. **레이아웃 구조 차이**: 원본은 Navbar가 콘텐츠 영역 상단에만 위치하는데, 수정 후 전체 너비 Titlebar를 추가하여 원본과 다른 구조
3. **Visual Reference 스크린샷 미참조**: `specs/reverse-spec/visual-references/` 디렉토리에 원본 스크린샷이 있었으나, implement 중에 이를 확인하지 않음

### Expected
implement injection 규칙의 "Source App Visual Reference" 섹션에 따라:
1. 원본 앱 스크린샷을 참조하여 레이아웃 구조를 확인
2. 구현 후 시각적 비교 수행
3. 레이아웃 구조 편차 발견 시 즉시 보고

### Workaround
사용자 지적 후 상단 Titlebar 추가로 드래그 문제는 해결. 그러나 원본과의 레이아웃 구조 차이는 아직 존재 (전체 너비 Titlebar vs 콘텐츠 영역 Navbar)

### Suggested Fix
두 가지 수준의 수정 필요:

1. **Injection 실행 강화** (`reference/injection/implement.md`):
   - "Source App Visual Reference" 섹션의 Skip 조건이 너무 관대함. `visual-references/` 디렉토리가 존재하면 반드시 스크린샷을 읽고 참조해야 함
   - implement Checkpoint에서 "📂 Visual References: [N] screenshots available — will reference during UI tasks" 표시 추가

2. **F001→F002 전환 시 UI 연속성 체크 규칙 추가**:
   - "이전 Feature의 UI 구조(App.tsx 등)를 교체할 때, 기존 사용자 인터랙션(드래그, 윈도우 컨트롤 등)이 보존되는지 확인"
   - 이것은 Pattern Constraint "Error Boundary 외부에 Sidebar/WindowControls 배치" 수준의 구조적 검증

---

## [SKF-009] F001 regression: replacing App.tsx without preserving user interaction surfaces

- **Trigger**: B (사용자 지적)
- **Phase**: smart-sdd implement (F002-navigation)
- **Category**: MISSING_RULE
- **Severity**: Major (결과물 품질 저하)
- **Status**: ✅ Reflected — `injection/implement.md` Interaction Surface Preservation (B-3 section) + Checkpoint notification

### Skill Trace
- **File**: `.claude/skills/smart-sdd/reference/injection/implement.md`
- **Rule**: N/A — 이전 Feature의 UI를 교체할 때 interaction surface 보존 규칙 없음
- **Line**: N/A

### Problem
F002 implement에서 F001의 App.tsx를 Router로 교체했다. F001 App.tsx에는:
- Titlebar (36px height, drag-region, 테마 토글, 윈도우 컨트롤)
- Sidebar placeholder
- 메인 콘텐츠 영역

F002 Router에는:
- Sidebar (48px width, drag-region)
- 메인 콘텐츠 (Navbar 없음)

결과: 상단 드래그 영역이 사라져 윈도우 이동 불가. 이것은 F002가 F001의 Titlebar를 "대체"하면서 동일한 기능(드래그, 윈도우 컨트롤)을 Router 레이아웃에 포함하지 않은 것이 원인.

### Expected
이전 Feature의 UI 컴포넌트를 교체할 때:
1. 기존 interaction surface 목록 작성 (드래그 영역, 윈도우 컨트롤, 테마 토글 등)
2. 새 컴포넌트에서 모든 interaction surface가 보존되는지 확인
3. 누락된 것이 있으면 구현 또는 명시적으로 다른 위치로 이동

### Workaround
사용자 지적 후 Router에 상단 Titlebar 추가

### Suggested Fix
`reference/injection/implement.md`에 규칙 추가:
- "이전 Feature의 entry point 컴포넌트(App.tsx 등)를 수정/교체할 때, 기존 컴포넌트의 interaction surface를 열거하고 새 구현에서 보존 여부를 확인해야 한다"
- interaction surface 체크리스트: drag region, window controls, keyboard shortcuts, theme toggle, focus management

## [SKF-010] Implement phase rebuilt layout structure without matching source app structure

- **Trigger**: B (사용자 지적)
- **Phase**: smart-sdd implement (F002-navigation)
- **Category**: AMBIGUOUS_RULE
- **Severity**: Major (결과물 품질 저하)
- **Status**: ✅ Reflected — `injection/implement.md` Layout Structure Analysis subsection (before Visual References Fallback)

### Skill Trace
- **File**: `.claude/skills/smart-sdd/reference/injection/implement.md`
- **Rule**: "Source App Visual Reference (rebuild mode, GUI)" (lines 115-159) — 소스 앱의 런타임 스크린샷을 캡처하고 비교하라는 규칙 존재. 그러나 규칙이 "visual reference"에 집중되어 있고 **layout structure (flex direction, container hierarchy, component nesting)**에 대한 명시적 비교는 없음
- **Line**: 115-159

### Problem
F002 implement에서 Cherry Studio 원본의 레이아웃 구조를 정확히 재현하지 못했다.

Cherry Studio 원본 (left 모드):
- `#root`: `flex-direction: row`
- Sidebar: 전체 높이 (100vh), Mac에서 `margin-top: env(titlebar-area-height)` 오프셋
- 상단에 full-width titlebar 없음
- Navbar는 content 영역 내부에 페이지별로 렌더링
- WindowControls는 Navbar 내부에 배치

F002 구현 결과:
- `flex-direction: column` (전체 레이아웃)
- Full-width titlebar이 Sidebar 위에 추가 (Cherry Studio에 없는 구조)
- Sidebar가 titlebar 아래에 위치 (전체 높이가 아님)
- WindowControls가 전역 titlebar에 배치

이 구조 차이는 스크린샷 비교로는 잡기 어려운 **DOM hierarchy 수준**의 불일치이며, 향후 페이지별 Navbar, 탭 모드 전환 등에 영향을 미침.

### Expected
Implement 시 source app의 **layout structure** (container hierarchy, flex direction, height strategy, platform-specific offsets)를 코드 수준에서 분석하고 재현해야 한다. Visual reference만으로는 구조적 차이를 감지할 수 없다.

### Workaround
1차 사용자 지적: Cherry Studio 소스 코드 분석 → Router.tsx를 flex-row 구조로 재작성, Sidebar를 전체 높이로 변경, full-width titlebar 제거. 그러나 **Navbar를 content 영역에 추가하지 않아** drag region이 사라지고 content 영역의 border-top-left-radius도 누락.
2차 사용자 지적: Navbar를 content 영역 내부에 추가 (drag region + WindowControls), content-container에 `border-top-left-radius: 10px` + border 적용.

**교훈**: 부분적 구조 분석으로는 부족. Cherry Studio의 layout은 4개 layer로 구성됨:
1. `#root` flex-row (Sidebar + Content column)
2. Sidebar 전체 높이 + drag region
3. Content column 내부에 Navbar (drag region + WindowControls)
4. Content area에 `border-top-left-radius: 10px` (시각적 분리)

1차 수정에서 layer 1-2만 반영하고 layer 3-4를 누락한 것이 2차 문제의 원인.

### Suggested Fix
`reference/injection/implement.md`의 "Source App Visual Reference" 섹션에 추가:
- "rebuild 모드에서 GUI Feature를 구현할 때, visual reference 비교와 별개로 소스 앱의 **layout structure를 코드 수준에서 분석**해야 한다:"
  1. Root container의 flex direction, 주요 container의 nesting 관계
  2. Sidebar/Header/Content의 height/width strategy (100vh vs calc vs flex)
  3. Platform-specific offset (Mac titlebar area, fullscreen 처리)
  4. WindowControls/Navbar의 배치 위치 (전역 vs 페이지별)
  5. Content 영역의 시각적 처리 (border-radius, border, background)
- "구조 분석은 **모든 layer를 한번에 파악**해야 하며, 부분적 반영은 새로운 regression을 유발한다"
- "구조 분석 결과를 `specs/{NNN-feature}/layout-structure.md`로 기록하고, 구현 시 참조"

## [SKF-011] Verify phase skipped Playwright runtime verification despite GUI Feature

- **Trigger**: B (사용자 지적)
- **Phase**: smart-sdd verify (F002-navigation)
- **Category**: AMBIGUOUS_RULE
- **Severity**: Major (결과물 품질 저하)
- **Status**: ✅ Reflected — `verify-phases.md` GUI MANDATORY PLAYWRIGHT GATE (Phase 3 entry) + SC matrix empty-list guard (Step 0) + `gui.md` S6 emphasis

### Skill Trace
- **File**: `.claude/skills/smart-sdd/commands/verify-phases.md`
- **Rule**: "Step 3 — UI Verification via Playwright (MANDATORY — do NOT skip)" (lines 1064-1200) — Playwright를 통한 SC-level UI 검증이 MANDATORY라고 명시되어 있으나, 에이전트가 이를 실행하지 않았음
- **Line**: 1064-1200

### Problem
F002-navigation은 GUI Feature (13개 라우트, 사이드바 네비게이션, 테마 토글, 윈도우 컨트롤 등)임에도 verify Phase 3에서 Playwright를 통한 실제 런타임 UI 검증을 수행하지 않았다.

수행된 검증:
- Build (`electron-vite build`) ✅
- TypeScript (`tsc --noEmit`) ✅
- ESLint ✅
- Demo 스크립트 생성 ✅

수행되지 않은 검증:
- Playwright로 앱 실행 → 각 라우트 네비게이션 확인
- 사이드바 아이콘 클릭 → 라우트 전환 확인
- 테마 토글 클릭 → 테마 변경 확인
- 드래그 영역 존재 확인
- WindowControls 존재/동작 확인 (Win/Linux)
- 에러 바운더리 동작 확인
- Navigation transition sanity check (Phase 3c)
- Visual fidelity check (Phase 3b)

결과: 드래그 영역 누락, 레이아웃 구조 차이 등의 문제가 Playwright 검증에서 잡혔을 가능성이 높으나, 수행하지 않아 사용자가 직접 발견해야 했다.

### Expected
GUI Feature의 verify에서 Playwright는 MANDATORY:
1. Electron 앱 시작 (`_electron.launch()`)
2. SC별 UI 검증 (navigate, click, verify selector visible 등)
3. Console error 수집
4. Navigation transition sanity check
5. Visual fidelity check (reference가 있을 경우)

### Workaround
사용자가 직접 앱을 실행하여 문제를 발견하고 지적

### Suggested Fix
1. `commands/verify-phases.md`의 Phase 3 진입 시 **mandatory gate** 추가:
   - "GUI Feature인 경우, Playwright 검증을 건너뛸 수 없다. Playwright가 설치되어 있지 않으면 설치를 시도하고, 설치 불가 시에만 SKIP 사유를 명시하고 사용자 승인을 받아야 한다."
2. Phase 3의 SC verification matrix 구성을 verify 시작 시점에 **강제 표시**:
   - "이 Feature에서 Playwright로 검증할 SC 목록: [SC-001, SC-002, ...]"
   - 목록이 비어있으면 에이전트가 사유를 설명해야 함
3. `domains/interfaces/gui.md`에 강조 추가:
   - "GUI Feature에서 Playwright verification은 build/lint/tsc 검증과 동급의 MANDATORY이다. static 검증만으로 verify를 완료할 수 없다."

## [SKF-012] Stub/temporary implementations lack follow-up tracking mechanism

- **Trigger**: B (사용자 지적)
- **Phase**: smart-sdd implement (F002-navigation)
- **Category**: MISSING_RULE
- **Severity**: Major (결과물 품질 저하)
- **Status**: ✅ Reflected — Dependency Stub Registry: `injection/implement.md` (generate), `context-injection-rules.md` (shared pattern), `injection/specify.md` + `injection/plan.md` + `injection/tasks.md` (inject), `injection/verify.md` (completeness check), `pipeline.md` (brief mention)

### Skill Trace
- **File**: `.claude/skills/smart-sdd/commands/pipeline.md`
- **Rule**: N/A — Feature 구현 시 다른 Feature에 의존하여 임시(stub/placeholder)로 구현한 항목에 대한 추적/기록 메커니즘이 없음
- **Line**: N/A

### Problem
F002-navigation 구현에서 여러 항목이 미래 Feature 의존성으로 인해 임시 구현되었다:
- 사이드바 아이콘 순서: F003(settings) 의존 → `DEFAULT_VISIBLE_ICONS` 하드코딩
- Pinned Apps 영역: F008(MCP) 의존 → 빈 stub 컴포넌트
- Opened Tabs 영역: F008 의존 → 빈 stub 컴포넌트
- `navbarPosition` 설정: F003 의존 → `'left'` 하드코딩
- OpenClaw 아이콘: 커스텀 SVG 미구현 → MessageSquare 중복 사용

이러한 임시 구현들은 `TODO` 주석으로만 표시되어 있고, 해당 의존 Feature가 구현될 때 이들을 찾아서 교체해야 한다는 추적 메커니즘이 없다. 의존 Feature(F003, F008 등)의 spec/plan/tasks에 "F002의 stub을 실제 구현으로 교체" 작업이 자동으로 포함되지 않으므로 누락될 위험이 크다.

### Expected
Feature 구현 시 다른 Feature 의존으로 임시 처리한 항목을 구조화된 형태로 기록하고, 의존 Feature의 pipeline 진입 시 자동으로 컨텍스트에 주입해야 한다.

### Workaround
없음 — 사용자가 "나중에 변경해야 하는데 처리가 없다"고 지적

### Suggested Fix
1. `commands/pipeline.md`의 implement 완료 시 **Dependency Stub Registry** 생성 규칙 추가:
   - implement 완료 후, 해당 Feature에서 다른 Feature 의존으로 stub/placeholder로 구현한 항목을 `specs/{NNN-feature}/stubs.md`에 기록
   - 형식: `| Stub Location | Dependent Feature | Current Impl | Target Impl | TODO marker |`
   - 예: `| Sidebar.tsx:54 | F003-settings | DEFAULT_VISIBLE_ICONS 하드코딩 | settings store에서 읽기 | TODO: Read from F003 |`

2. `reference/context-injection-rules.md`에 **Stub Resolution Injection** 추가:
   - Feature N의 specify/plan/tasks 실행 시, 이전 Feature들의 `stubs.md`를 스캔하여 "Feature N에 의존하는 stub 목록"을 컨텍스트에 주입
   - 이를 통해 해당 Feature의 tasks에 "이전 Feature의 stub을 실제 구현으로 교체" 작업이 자동 포함됨

3. `commands/pipeline.md`의 verify 단계에서 **Stub Completeness Check** 추가:
   - verify 시 현재 Feature가 의존하는 이전 Feature의 stub 중, 이번에 해결 가능한 것이 해결되었는지 확인

## [SKF-013] Reverse-spec/specify got default navbarPosition wrong — no runtime verification of defaults

- **Trigger**: A (자각) + B (사용자 지적)
- **Phase**: smart-sdd verify (F002-navigation) — Playwright 비교 검증 중 발견
- **Category**: MISSING_RULE
- **Severity**: Critical (pipeline 중단)
- **Status**: ✅ Reflected — `reverse-spec/analyze.md` Phase 1.5 Step 5 (Runtime Default Verification) + `smart-sdd/injection/specify.md` (Runtime Default Coverage Check + Checkpoint Display)

### Skill Trace
- **File**: `.claude/skills/reverse-spec/commands/analyze.md`
- **Rule**: N/A — reverse-spec에서 소스 앱의 **런타임 기본값**을 검증하는 규칙 없음. SBI 추출은 코드 정적 분석에 기반하며, 실제 앱 실행 시 어떤 설정이 기본값으로 적용되는지 확인하지 않음
- **Line**: N/A

### Problem
Cherry Studio의 `navbarPosition` 기본값은 `'top'`(탭 모드)이다. 그러나 reverse-spec → specify 과정에서 이를 `'left'`(사이드바 모드)로 잘못 파악했다.

이로 인해 F002-navigation 전체 구현이 left 모드 기준으로 진행되었고, 사용자가 Cherry Studio와 비교 시 모든 UI가 다르게 보이는 근본 원인이 되었다:
- 사이드바가 좌측에 있음 (Cherry Studio top 모드에는 사이드바 없음)
- 설정/테마가 좌측 하단 (Cherry Studio top 모드에서는 우측 상단)
- 전체 레이아웃 구조가 다름

Playwright로 Cherry Studio를 실행하여 확인한 결과:
- `navbar-position` attribute = `"top"`
- Home navbar at (281, 44) — 상단 탭바 레이아웃
- Sidebar (`#app-sidebar`): 없음 (top 모드이므로)

### Expected
reverse-spec 또는 specify 단계에서 소스 앱의 **런타임 기본값**을 Playwright로 검증해야 한다:
1. 앱 실행 → 초기 상태 캡처
2. 설정 store에서 기본값 읽기 (Redux/Zustand state)
3. 코드 분석에서 파악한 기본값과 실제 런타임 기본값 비교

### Workaround
verify 단계에서 Cherry Studio를 Playwright로 직접 실행하여 비교 → 기본 모드가 'top'임을 확인

### Suggested Fix
1. `reverse-spec/commands/analyze.md`에 **Runtime Default Verification** 단계 추가:
   - 소스 앱을 Playwright로 실행하여 초기 UI 상태 캡처
   - 설정 관련 SBI에 대해 실제 런타임 기본값 확인
   - 코드 분석 결과와 불일치 시 런타임 값을 우선 채택
2. `smart-sdd/reference/injection/specify.md`에 추가:
   - "설정/모드 전환이 있는 Feature의 spec 작성 시, 소스 앱의 런타임 기본값을 명시해야 한다"
   - "기본값은 코드 분석이 아닌 실제 앱 실행 결과를 기준으로 한다"

## [SKF-014] Pipeline lacked runtime verification at every phase — wrong default propagated through 6 stages uncaught

- **Trigger**: A (자각) — SKF-013 원인 심층 분석
- **Phase**: smart-sdd pipeline 전체 (reverse-spec → specify → plan → tasks → analyze → implement → verify)
- **Category**: MISSING_RULE
- **Severity**: Critical (pipeline 중단)
- **Status**: ✅ Reflected — Fix 1 covered by SKF-013. `verify-phases.md` Step 3e Source App Comparison (MANDATORY for rebuild+GUI) + `pipeline.md` Error Propagation Warning

### Skill Trace
- **File**: `.claude/skills/smart-sdd/commands/pipeline.md` (전체 파이프라인 흐름)
- **Rule**: N/A — 파이프라인의 어느 단계에서도 "소스 앱 런타임 기본값 확인"이 강제되지 않음. 각 단계는 이전 단계의 산출물을 신뢰하고 진행하므로, 초기 잘못된 가정이 6단계를 모두 통과함
- **Line**: N/A

### Problem
Cherry Studio의 `navbarPosition` 기본값은 `'top'`이지만, 파이프라인 전체가 `'left'`를 기본으로 실행되었다.

**인과 체인 (6단계 전파):**

| 단계 | 잘못된 행동 | 잡을 수 있었던 기회 |
|------|-----------|-----------------|
| reverse-spec | 코드 정적 분석으로 `'left'`를 기본값으로 추론 | 소스 앱 실행하여 초기 UI 확인 |
| specify | reverse-spec 결과를 그대로 spec에 "left-sidebar (default)" 기재 | spec 작성 시 설정 기본값에 대해 소스 앱 확인 |
| plan | spec 기반 left 모드 중심 설계 | plan에서 "기본 모드 확인" 체크 없음 |
| tasks | left 모드 태스크 위주 생성 | tasks에서 "구현 후 소스 앱 비교" 태스크 없음 |
| analyze | FR-Task 매핑 검증 (코드 기반) | analyze에서 런타임 비교 없음 |
| implement | left 모드로 27개 파일 구현 | implement에서 소스 앱 비교 규칙은 있으나 실행 안됨 |
| verify | Build/TSC/Lint만 통과, Playwright 미실행 | **Playwright로 소스 앱 비교했으면 즉시 발견** |

**핵심 문제**: 파이프라인이 "이전 단계 산출물 신뢰" 원칙으로 동작하므로, 초기 오류가 증폭되면서 전파됨. 어느 단계에서도 **독립적 검증 (소스 앱 실행)**이 강제되지 않음.

### Expected
최소한 2개 지점에서 런타임 검증이 강제되어야 했다:
1. **reverse-spec**: SBI 추출 후 소스 앱 실행 → 초기 상태 캡처 → 기본값 검증
2. **verify**: 구현 결과와 소스 앱을 모두 실행 → 비교 → 불일치 감지

이 두 지점이 있었으면 6단계 전파가 불가능했다.

### Workaround
사용자가 3회 피드백 후 verify 단계에서 Cherry Studio를 Playwright로 직접 실행하여 비교 → 기본 모드가 'top'임을 발견 → TabsContainer 구현 → 전체 레이아웃 재구성

### Suggested Fix
1. **reverse-spec에 Runtime Snapshot Gate 추가** (`reverse-spec/commands/analyze.md`):
   - Phase 2 완료 전, 소스 앱을 Playwright로 실행하여 초기 화면 캡처
   - SBI에서 추출한 모드/설정 기본값과 런타임 상태 비교
   - 불일치 시 런타임 값 우선 + 코드 분석 결과에 주석 추가
   - "이 단계를 건너뛰면 이후 전체 파이프라인이 잘못된 기본값으로 진행될 수 있다"

2. **verify에 Source App Comparison MANDATORY Gate 추가** (`commands/verify-phases.md`):
   - rebuild 모드 + GUI Feature인 경우, verify Phase 3에서 소스 앱 비교를 SKIP 불가로 설정
   - "소스 앱을 빌드/실행할 수 없는 경우에만 SKIP 가능하며, 그 사유를 명시해야 한다"
   - 현재 규칙은 "소스 앱 비교는 ⚠️ warnings (NOT blocking)"이지만, 이를 "rebuild GUI에서는 BLOCKING"으로 격상

3. **pipeline.md에 Error Propagation Warning 추가**:
   - "파이프라인의 각 단계는 이전 단계 결과를 신뢰한다. 따라서 초기 단계(reverse-spec, specify)의 오류는 전체 파이프라인에 전파된다."
   - "설정/모드/기본값처럼 런타임에서만 확인 가능한 항목은 코드 분석만으로 확정하지 말고 반드시 런타임 검증을 거쳐야 한다."

## [SKF-015] Pipeline trust model allows single-direction error propagation without cross-stage validation

- **Trigger**: A (자각) — SKF-001~014 전체 패턴 분석
- **Phase**: smart-sdd pipeline 전체 아키텍처
- **Category**: MISSING_RULE
- **Severity**: Critical (pipeline 중단)
- **Status**: ✅ Reflected — `pipeline.md` Cross-Stage Validation Gates section (3 gates: specify entry, implement entry, verify Phase 3e). Gates reference SKF-013/014 fixes + implement Layout Structure Analysis + Interaction Surface Preservation

### Skill Trace
- **File**: `.claude/skills/smart-sdd/commands/pipeline.md`
- **Rule**: "Common Protocol: Assemble → Checkpoint → Execute+Review → Update" — 각 단계가 이전 단계 산출물을 신뢰하고, 현재 단계의 작업만 검증함. 이전 단계의 가정을 독립적으로 재검증하는 메커니즘 없음
- **Line**: N/A (구조적 문제)

### Problem
파이프라인은 단방향 정보 흐름을 전제한다: `reverse-spec → specify → plan → tasks → analyze → implement → verify`. 각 단계는 "이전 단계가 맞다"고 가정하고 자신의 작업만 검증한다.

이 모델은 다음 상황에서 실패한다:
- **런타임 기본값** (SKF-013, 014): 코드 분석이 아닌 실행으로만 확인 가능
- **Interaction surface** (SKF-004, 009): Feature 간 UI 연속성은 개별 Feature spec만으로 파악 불가
- **구조적 레이아웃** (SKF-008, 010): Visual reference와 DOM structure는 다른 차원의 정보

| 단계 | 자체 검증 | 이전 단계 재검증 |
|------|----------|---------------|
| specify | spec 완결성 | ❌ reverse-spec SBI 정확성 |
| plan | 아키텍처 타당성 | ❌ spec의 기본값/전제 |
| implement | 태스크 완료 | ❌ plan의 레이아웃 전제 |
| verify | build/lint/tsc | ❌ implement의 행동적 정확성 |

SKF-001~014 중 **11건**이 이 trust model 문제에 해당한다.

### Expected
파이프라인에 **cross-stage validation checkpoint**가 있어야 한다. 모든 단계를 재검증할 필요는 없지만, **critical assumption**에 대해서는 독립적 검증이 필요하다:

1. **specify 시작 전**: reverse-spec의 설정 기본값을 런타임으로 재확인 (rebuild+GUI)
2. **implement 시작 전**: 이전 Feature의 interaction surface 목록 확인 + 소스 앱 레이아웃 구조 분석
3. **verify Phase 3**: 소스 앱 비교를 MANDATORY로 격상 (rebuild+GUI)

### Workaround
사용자가 반복 피드백으로 각 단계의 가정 오류를 수동 교정

### Suggested Fix
`pipeline.md`에 **Cross-Stage Validation Gates** 섹션 추가:

```
## Cross-Stage Validation Gates (rebuild + GUI only)

파이프라인의 각 단계는 이전 단계를 신뢰하지만, 아래 항목은 독립적으로 재검증한다:

### Gate 1: specify 진입 시
- 소스 앱 실행 → 초기 UI 상태 캡처 → SBI의 설정 기본값과 비교
- 불일치 시: SBI 수정 후 specify 진행

### Gate 2: implement 진입 시
- 이전 Feature의 Interaction Surface Inventory 읽기
- 소스 앱의 해당 Feature 화면 레이아웃 구조 분석 (DOM hierarchy, flex direction, height strategy)
- Pre-Implement Checkpoint에 포함하여 사용자 승인

### Gate 3: verify Phase 3
- 소스 앱과 구현 앱을 동시 실행하여 비교 (MANDATORY, BLOCKING)
- 소스 앱 빌드 불가 시에만 SKIP 허용 (사유 명시 + 사용자 승인 필수)
```

이 3개 gate는 단방향 전파를 차단하는 **circuit breaker** 역할을 한다.

## [SKF-016] No Interaction Surface Inventory artifact — cross-Feature UI regression invisible

- **Trigger**: A (자각) — SKF-004, 009, 011 패턴 분석
- **Phase**: smart-sdd plan/implement (cross-Feature)
- **Category**: MISSING_RULE
- **Severity**: Major (결과물 품질 저하)
- **Status**: ✅ Reflected — `injection/implement.md` Post-Step Update #3 (generate interaction-surfaces.md) + Interaction Surface Preservation (read inventory) + `injection/plan.md` (inject inventory) + `injection/verify.md` Post-Step Update #5 (verify surfaces via Playwright)

### Skill Trace
- **File**: `.claude/skills/smart-sdd/reference/injection/implement.md`
- **Rule**: "B-3 Interaction Surface Preservation" (SKF-009에서 추가된 규칙) — 이전 Feature의 entry point를 수정할 때 interaction surface를 보존하라는 규칙은 있으나, **추적 가능한 artifact**가 없어 에이전트가 어떤 surface를 확인해야 하는지 알 수 없음
- **Line**: N/A (규칙은 있으나 artifact 정의 없음)

### Problem
GUI 프로젝트에서 Feature는 공유 레이아웃(App.tsx, Router, Sidebar)을 수정한다. Interaction surface (드래그 영역, 윈도우 컨트롤, 키보드 단축키, 테마 토글)는 Feature 간 연속성이 필요하지만, 이를 추적하는 artifact가 없다.

F001에서 F002로 넘어갈 때:
- F001: Titlebar (drag region 36px) + WindowControls + Theme toggle
- F002: App.tsx를 Router로 교체하면서 Titlebar 제거 → drag region 소실 (SKF-009)
- 이후 수정에서도 Navbar 누락 → drag region 재소실 (SKF-010)

에이전트는 "어떤 surface가 존재했는지" 목록을 모르므로, 매번 사용자가 발견해야 한다.

### Expected
각 Feature의 plan 또는 implement 완료 시 **Interaction Surface Inventory**를 생성/갱신:

```markdown
## Interaction Surface Inventory — F001-app-shell

| Surface | Type | Location | Size | Requirement |
|---------|------|----------|------|-------------|
| Titlebar drag | Drag Region | App.tsx > Titlebar | 100% × 36px | Window move (macOS/Win/Linux) |
| Window controls | Buttons | Titlebar > WindowControls | 3 × 46px | Minimize/Maximize/Close |
| Theme toggle | Button | Titlebar | 1 × 36px | light/dark/system cycle |
```

다음 Feature가 이 파일들을 수정할 때, implement injection이 이 inventory를 주입하여 보존 여부를 확인한다.

### Workaround
SKF-009 반영으로 "entry point 수정 시 interaction surface 보존" 규칙은 추가되었으나, 에이전트가 참조할 구체적 목록이 없어 실효성 낮음

### Suggested Fix
1. `reference/injection/plan.md`에 추가:
   - "GUI Feature의 plan에서, 이 Feature가 수정하는 공유 컴포넌트의 기존 interaction surface를 열거한다"
   - Plan 산출물에 `specs/{NNN-feature}/interaction-surfaces.md` 포함

2. `reference/injection/implement.md`에 추가:
   - implement 시작 시, 이전 Feature들의 `interaction-surfaces.md`를 읽어 보존 대상 목록을 Checkpoint에 표시
   - implement 완료 시, 이 Feature의 `interaction-surfaces.md`를 생성/갱신

3. `reference/injection/verify.md`에 추가:
   - verify Phase 3에서 interaction surface inventory의 각 항목이 실제로 동작하는지 Playwright로 확인
   - "드래그 영역이 존재하고 충분한 크기인가", "윈도우 컨트롤이 클릭 가능한가" 등

## [SKF-017] Electron CDP connection timing not documented — empty targets cause confusion

- **Trigger**: A (자각)
- **Phase**: reverse-spec Phase 1.5-0 (Playwright Availability Check)
- **Category**: MISSING_RULE
- **Severity**: Major (결과물 품질 저하)
- **Timestamp**: 2026-03-15 12:20
- **Status**: ✅ Reflected — `analyze.md` Phase 1.5-4 Step 1b (env var alternative) + Step 2 (3-phase CDP polling + standalone browser warning)

### Skill Trace
- **File**: `.claude/skills/reverse-spec/commands/analyze.md`
- **Rule**: Phase 1.5-0 Step 1b (Detect Playwright MCP) and Phase 1.5-4 Step 2 (Run and wait for readiness) — Readiness check monitors stdout for "ready" signals and polls the app port, but has NO guidance on CDP-specific readiness
- **Line**: ~475-596

### Problem
Electron app의 CDP 연결에서 세 가지 문제를 겪었다:

**1. CDP HTTP API 타이밍 문제**:
- `--remote-debugging-port=9222`로 Electron을 시작하면 포트가 즉시 열리고 `lsof -i :9222`에 나타나지만, HTTP API (`/json/version`, `/json`)가 응답하기까지 추가 시간이 필요하다.
- 앱이 BrowserWindow를 생성하고 renderer가 로드를 완료한 후에야 CDP targets에 페이지가 나타남.
- 여러 차례 `curl -m 3 -s http://127.0.0.1:9222/json/version`이 타임아웃되어 "CDP가 작동하지 않는다"고 잘못 판단함.
- **실제 원인**: electron-vite dev는 main process 빌드(~18초) → preload 빌드(~1초) → renderer dev server(~5초) → Electron 시작 → BrowserWindow 생성 → renderer 로드의 단계를 거치며, CDP가 완전히 응답하기까지 총 45-60초가 소요됨.

**2. CDP targets 빈 배열 문제**:
- CDP `/json/version`이 응답하더라도 `/json` (targets list)은 빈 배열 `[]`을 반환하는 구간이 있음.
- BrowserWindow가 생성되고 renderer가 로드를 시작해야 targets에 페이지가 나타남.
- 이 구간에서 `chromium.connectOverCDP()`를 호출하면 contexts는 있으나 pages가 0개로 보임.
- **해결**: BrowserWindow 로드 완료까지 추가 10-15초 대기 후 targets가 나타남.

**3. electron-vite의 CDP 전달 방식**:
- electron-vite 5.0.0은 `REMOTE_DEBUGGING_PORT` 환경변수와 `-- --remote-debugging-port=NNNN` 둘 다 지원.
- 두 방식 모두 Electron 프로세스에 `--remote-debugging-port=9222`를 전달하는 것을 ps 명령으로 확인.
- 그러나 analyze.md의 테이블에는 electron-vite의 CDP 명령이 `npx electron-vite dev -- --remote-debugging-port=9222`로만 기재되어 있고, env var 방식은 언급 없음.

**4. Standalone browser로 renderer 접속 실패**:
- `http://localhost:5173`을 일반 Chromium으로 접속하면 splash screen(Cherry Studio 로고)만 표시됨.
- Electron의 preload bridge (`window.api`)가 없어 React app이 초기화되지 않음.
- 이는 Electron 앱의 본질적 제한이지만, analyze.md에 이 제한에 대한 경고가 없어 시간을 낭비함.

### Expected
Phase 1.5의 Electron CDP 연결 절차에 다음이 포함되어야 한다:
1. CDP readiness 폴링: 포트 오픈 확인 → `/json/version` 응답 확인 → `/json` targets 비어있지 않음 확인 (3단계)
2. electron-vite 전체 빌드+시작 시간 고려 (최소 60초 대기)
3. Standalone browser로 renderer URL 접속은 Electron preload 미제공으로 실패한다는 경고

### Workaround
여러 차례 재시작 및 대기 시간 조절 끝에 성공. 핵심은 충분한 대기 시간(45-60초)과 3단계 폴링.

### Suggested Fix
`reverse-spec/commands/analyze.md` Phase 1.5-4 Step 2에 Electron CDP 전용 보조 절차 추가:

```
**Electron CDP readiness (3-phase polling)**:
1. Port open: `lsof -i :9222` (즉시 ~ 5초)
2. CDP HTTP API: `curl -m 5 http://127.0.0.1:9222/json/version` (빌드 시간 후 ~ 30-45초)
3. Targets available: `curl -m 5 http://127.0.0.1:9222/json` returns non-empty array (renderer 로드 후 ~ 45-60초)

Timeout: 총 120초. 각 단계 실패 시 5초 간격 재시도.
⚠️ Phase 2가 아닌 Phase 3에서야 targets가 나타나는 것은 정상 — BrowserWindow 생성 대기.
⚠️ Standalone browser로 localhost:5173 접속은 Electron preload 미제공으로 실패 — 시도하지 말 것.
```

Also add `REMOTE_DEBUGGING_PORT=9222 npx electron-vite dev` as an alternative form in the Phase 1.5-4 Step 1b table.

---

## [SKF-018] Roadmap dependency graph placed Data & Storage before Electron Shell — wrong foundation order

- **Trigger**: B (사용자 지적)
- **Phase**: smart-sdd pipeline — Feature Selection (Step 4)
- **Category**: WRONG_ASSUMPTION
- **Severity**: Major (결과물 품질 저하)
- **Timestamp**: 2026-03-15 14:30
- **Status**: ✅ Reflected — `analyze.md` Phase 3-2 Dependency Interpretation Rules (3 rules: Shell always RG-1, Foundation sanity check, Dependency Direction Test) + Post-sort validation

### Skill Trace
- **File**: `.claude/skills/reverse-spec/commands/analyze.md`
- **Rule**: Phase 3-2 "Dependency Graph Construction and Release Group Determination" — "Direct Dependency: Uses another Feature's modules via import/require" + "Release 1 (Foundation): Features with no dependencies"
- **Line**: ~1392-1413

### Problem
reverse-spec Phase 3에서 Dependency Graph를 구성할 때, F008 Data & Storage를 "의존성 없음"으로, F001 Electron Shell을 "F008에 의존"으로 설정했다. 그 논리는 "Shell이 시작할 때 DB를 초기화하므로 DB가 먼저 있어야 한다"는 것이었다.

이로 인해 pipeline 시작 시 Feature Selection이 F008을 첫 번째 Feature로 선택했다. 사용자가 "왜 F001부터 하지 않는거지?"라고 지적.

**실제 의존 관계**: Electron Shell은 모든 것의 기초다. 앱 윈도우가 없으면 DB를 초기화할 프로세스 자체가 없다. DB 스키마 정의와 Drizzle ORM 설정은 Shell 내부에서 수행되거나, Shell과 병렬로 진행할 수 있지만, Shell이 DB에 "의존"하는 것은 아니다.

**원인 분석**: analyze.md의 의존성 규칙이 "코드 import 관계"에 집중하여, "Electron main process가 DB를 import한다 → Shell이 DB에 의존한다"로 판단. 그러나 이것은 **런타임 초기화 순서**이지 **Feature 구현 순서**가 아니다. Feature 의존성은 "이 Feature를 구현하려면 다른 Feature가 먼저 완성되어 있어야 하는가?"로 판단해야 한다.

### Expected
F001 Electron Shell은 의존성이 없어야 하며, pipeline의 첫 번째 Feature여야 한다. DB 스키마(F008)는 Shell과 동일한 RG-1에 있지만 Shell에 의존하거나, 독립적으로 병렬 진행 가능해야 한다.

Feature 의존성 판단 기준:
- ✅ "이 Feature를 spec/plan/implement하려면 다른 Feature의 코드가 완성되어 있어야 하는가?"
- ❌ "런타임에서 이 Feature의 코드가 다른 Feature의 코드를 import하는가?"

후자는 코드 결합(coupling)이지 Feature 구현 순서 의존성이 아니다.

### Workaround
사용자 지적 후 sdd-state.md에서 F001의 의존성을 `(none)`으로 수정하여 해결.

### Suggested Fix
`reverse-spec/commands/analyze.md` Phase 3-2 "Dependency Graph Construction"에 규칙 추가:

1. **Feature 의존성 vs 코드 결합 구분 규칙**:
   - "Feature A가 Feature B에 의존한다"는 "Feature A를 **구현/검증**하려면 Feature B의 **코드가 완성**되어 있어야 한다"를 의미한다
   - 런타임 초기화 순서 (import 관계)는 Feature 의존성과 다르다
   - 예: "Shell이 DB를 초기화한다"는 코드 결합이지, "Shell Feature를 구현하려면 DB Feature가 완성되어야 한다"는 아닐 수 있다

2. **Foundation Feature 보호 규칙**:
   - "App Shell / Bootstrap Feature는 특별히 명시적 의존성이 없는 한 항상 RG-1의 첫 번째 Feature여야 한다"
   - "다른 Feature가 Shell에 의존하는 것은 자연스럽지만, Shell이 다른 Feature에 의존하는 것은 이례적이므로 반드시 사용자 확인을 거쳐야 한다"

3. **Dependency Graph 구성 후 sanity check 추가**:
   - "RG-1에 있는 Feature 중 의존성이 있는 Feature가 있으면 경고: '{Feature}는 RG-1(Foundation)이지만 {dep}에 의존합니다. Foundation Feature는 보통 의존성이 없습니다. 맞는지 확인하세요.'"

---

## [SKF-019] Plan research chose better-sqlite3 without verifying native build compatibility with target Electron version

- **Trigger**: A (자각)
- **Phase**: smart-sdd implement Phase 1 (F001-app-shell) — dependency installation
- **Category**: MISSING_RULE
- **Severity**: Major (결과물 품질 저하)
- **Timestamp**: 2026-03-15 16:00
- **Status**: ✅ Reflected — `injection/implement.md` Step 1b (Native/compiled dependency compatibility check)

### Skill Trace
- **File**: `.claude/skills/smart-sdd/reference/injection/implement.md`
- **Rule**: "Plugin/Dependency Pre-flight" (lines 213-248) — 의존성이 package.json에 있는지만 확인하고, 네이티브 모듈의 빌드 호환성은 검증하지 않음
- **Line**: 213-248

### Problem
Plan의 R-001에서 config persistence로 better-sqlite3를 선택했다. 근거는 ACID 트랜잭션, corruption detection, electron-store 대비 우월성이었다. 그러나 실제 구현 시 better-sqlite3 v11.10.0이 Electron 40의 V8 API와 호환되지 않아 네이티브 빌드 실패:

1. **C++ 헤더 호환성**: Electron 40의 V8 headers가 `<source_location>` (C++20)를 요구하는데, macOS 12의 Apple Clang 14는 이 헤더를 제공하지 않음
2. **Python distutils 제거**: Python 3.14에서 distutils가 제거되어 node-gyp 빌드 실패 (setuptools 설치로 해결)
3. **V8 API 변경**: better-sqlite3 v11이 `GetPrototype()` 등 Electron 40에서 제거된 V8 API를 사용
4. **Homebrew LLVM으로도 불가**: C++20 플래그를 강제해도 V8 API 불일치는 해결 불가

결과: implement 전체가 네이티브 모듈 빌드 이슈로 2시간 이상 차단. 최종적으로 electron-store로 대체하여 해결.

### Expected
Plan의 research 단계에서 네이티브 모듈을 선택할 때:
1. 대상 Electron 버전과의 호환성을 확인해야 함 (npm 페이지의 Electron 호환 매트릭스, GitHub issues 확인)
2. 빌드 환경 요구사항 (C++ 표준, Python 버전, node-gyp 버전)을 확인해야 함
3. 호환되지 않는 경우 대안 (electron-store, sql.js WASM build 등)을 우선 제시해야 함

### Workaround
better-sqlite3를 electron-store로 대체:
- ConfigService를 electron-store 기반으로 재작성 (JSON key-value store)
- key-value config에는 electron-store가 충분 (atomic write via temp-file-rename)
- 관계형 데이터가 필요한 F005(conversations/messages)에서 better-sqlite3 호환성을 다시 해결하기로 연기

### Suggested Fix
1. `reference/injection/plan.md` 또는 `reference/injection/implement.md`의 Dependency Pre-flight에 규칙 추가:
   - "네이티브 모듈 (C/C++ addon)을 선택할 때, 대상 Electron 버전과의 호환성을 확인해야 한다"
   - "확인 방법: `npm info {package} → engines.electron` 필드, GitHub issues에서 Electron 버전 관련 이슈 검색, prebuild-install 지원 여부"
   - "네이티브 모듈 빌드 실패 시 대안 순서: (1) prebuild 바이너리, (2) WASM 대체 (sql.js), (3) 순수 JS 대체 (electron-store), (4) Electron 버전 조정"

2. `commands/pipeline.md`의 Plan Research (Phase 0)에 추가:
   - "Electron 프로젝트에서 네이티브 모듈을 dependencies에 포함하려면, plan 단계에서 빌드 호환성 확인 작업을 포함해야 한다"
   - "특히 better-sqlite3, sharp, canvas 등 C++ addon은 Electron headers 재빌드가 필요하며, V8 API 버전 호환성 이슈가 빈번하다"

---

## [SKF-020] Playwright evaluate() triggers Electron DevTools anti-self-XSS warning — may interfere with console error detection

- **Trigger**: B (사용자 지적)
- **Phase**: smart-sdd verify Phase 3 (F001-app-shell) — Playwright runtime SC verification
- **Category**: MISSING_RULE
- **Severity**: Minor (마찰)
- **Timestamp**: 2026-03-15 17:00
- **Status**: ✅ Reflected — `verify-phases.md` Phase 3 Step 3a + Step 6 (Console noise filter), `runtime-verification.md` (Electron Console Noise)

### Skill Trace
- **File**: `.claude/skills/smart-sdd/commands/verify-phases.md`
- **Rule**: Phase 3 SC Verification — Playwright `win.evaluate()` 사용 시 발생하는 Electron/Chromium 경고에 대한 처리 규칙 없음
- **Line**: N/A

### Problem
Playwright `_electron.launch()` 후 `win.evaluate()`로 SC 검증 코드를 주입하면, Electron의 DevTools Console에 다음 경고가 표시된다:

```
Warning: Don't paste code into the DevTools Console that you don't understand or haven't reviewed yourself.
This could allow attackers to steal your identity or take control of your computer.
Please type 'allow pasting' below and press Enter to allow pasting.
```

이 경고 자체는 `evaluate()` 실행을 차단하지 않는다 (Playwright는 CDP를 통해 직접 주입하므로). 그러나 두 가지 문제가 발생할 수 있다:

1. **Console error 수집 오염**: verify Phase 3의 "Console error scan"에서 이 경고를 runtime error로 오탐할 수 있음
2. **사용자 혼란**: 앱을 수동으로 확인할 때 DevTools Console에 이 경고가 보여 기능 문제로 오해할 수 있음

### Expected
Verify Phase 3에서 Electron 앱의 Console 출력을 수집할 때:
1. Chromium/Electron의 시스템 경고 (anti-self-XSS, deprecation 등)를 런타임 에러에서 제외해야 함
2. 사용자에게 "이 경고는 Playwright 자동화에 의한 것이며 앱 문제가 아님"을 안내해야 함

### Workaround
현재 SC 검증은 정상 통과함 (evaluate 실행 자체는 차단되지 않음). 사용자에게 경고 원인을 설명.

### Suggested Fix
1. `commands/verify-phases.md` Phase 3 Console Error Scan에 필터 규칙 추가:
   - "Console 수집 시 Electron/Chromium 시스템 경고를 제외: 'Don't paste code', 'Electron Security Warning', 'DevTools', '[DEP0']"
   - "이러한 경고는 Playwright 자동화의 부산물이며 앱의 런타임 에러가 아님"

2. `reference/runtime-verification.md`에 Electron 전용 주의사항 추가:
   - "Electron 앱에서 Playwright evaluate()를 사용하면 anti-self-XSS 경고가 DevTools Console에 표시됨. 이는 정상이며 차단되지 않음. Console error 수집 시 이 패턴을 필터링할 것"

---

## [SKF-021] speckit-specify auto-numbering conflicts with smart-sdd pre-created Feature branch

- **Trigger**: A (자각) + B (사용자 지적)
- **Phase**: smart-sdd pipeline Step 1 (specify) — speckit-specify execution
- **Category**: WRONG_ASSUMPTION
- **Severity**: Major (결과물 품질 저하)
- **Timestamp**: 2026-03-16 07:42
- **Status**: ✅ Reflected — `pipeline.md` (Feature Number Conflict Prevention), `branch-management.md` (Auto-numbering conflict warning)

### Skill Trace
- **File**: `.claude/skills/smart-sdd/commands/pipeline.md`
- **Rule**: Step 0 (pre-flight) "Create Feature branch {NNN}-{short-name}" (line ~661) AND Step 1 (specify) which invokes `speckit-specify` that calls `create-new-feature.sh` with `--json` flag
- **Line**: ~661 (pre-flight branch creation) + speckit-specify SKILL.md Step 2 (create-new-feature.sh)

### Problem
smart-sdd pipeline은 두 단계에서 branch/directory를 생성한다:

1. **Step 0 (pre-flight)**: `git checkout -b 002-navigation` — smart-sdd가 Feature branch를 먼저 생성
2. **Step 1 (specify)**: `speckit-specify`가 `.specify/scripts/bash/create-new-feature.sh` 실행 — 이 스크립트가 auto-numbering으로 다음 가용 번호를 탐지

스크립트의 auto-numbering 로직은 **기존 branch와 spec directory를 스캔**하여 다음 번호를 결정한다. Step 0에서 이미 `002-navigation` branch가 존재하므로, 스크립트가 002를 "사용 중"으로 판단하고 `003-navigation`을 생성했다.

결과:
- git branch: `003-navigation` (스크립트가 새로 생성 + checkout)
- spec directory: `specs/003-navigation/` (스크립트가 생성)
- 원래 의도: `002-navigation` branch + `specs/002-navigation/`

에이전트가 수동으로 `specs/003-navigation/`을 `specs/002-navigation/`으로 이동하고, `003-navigation` branch를 삭제하고, `002-navigation` branch로 복귀해야 했다. 이 과정에서 `sdd-state.md`의 Feature Mapping도 수동 조정이 필요했다.

### Expected
smart-sdd가 speckit-specify를 호출할 때, Feature 번호가 이미 결정되어 있으므로(sdd-state.md의 Feature ID에서 추출) `create-new-feature.sh`에 `--number` 플래그로 명시적 번호를 전달해야 한다. 또는 smart-sdd가 pre-flight에서 branch를 생성하지 않고 speckit-specify의 스크립트에 branch 생성을 위임해야 한다.

### Workaround
에이전트가 수동으로 수정:
```bash
mv specs/003-navigation specs/002-navigation
git checkout 002-navigation
git branch -D 003-navigation
```

### Suggested Fix
두 가지 접근 중 하나를 선택:

**Option A (권장): smart-sdd가 speckit-specify에 명시적 번호 전달**
`commands/pipeline.md` Step 1 (specify) 실행 시:
- sdd-state.md의 Feature ID에서 번호 추출 (F002 → 002)
- `create-new-feature.sh`에 `--number 002` 전달 (auto-numbering 비활성화)
- 또는: speckit-specify 호출 시 `002-navigation`을 feature description이 아닌 **feature name**으로 전달하여 스크립트가 해당 번호를 사용하도록 유도

**Option B: pre-flight에서 branch 생성을 스킵하고 speckit에 위임**
`commands/pipeline.md` Step 0 (pre-flight)에서 branch 생성 로직을 제거하고, speckit-specify의 `create-new-feature.sh`가 branch를 생성하도록 위임. 이 경우 smart-sdd는 스크립트 완료 후 생성된 branch 이름을 읽어 sdd-state.md에 기록.

**Option A가 권장**: smart-sdd가 Feature ID를 통제하므로 번호를 명시적으로 전달하는 것이 더 안전. Option B는 speckit의 auto-numbering이 roadmap의 Feature ID와 다른 번호를 선택할 위험이 있음.

---

## [SKF-022] Execute + Review continuity rule structurally impossible when using Skill tool for speckit invocation

- **Trigger**: B (사용자 지적) — 3회 이상 반복 발생
- **Phase**: smart-sdd pipeline Step 3 (Execute + Review) — specify, plan 등 모든 speckit-* 호출 시
- **Category**: WRONG_ASSUMPTION
- **Severity**: Critical (pipeline 중단)
- **Timestamp**: 2026-03-16 08:10
- **Status**: ✅ Reflected — `pipeline.md` Step 3 Execute (Inline Execution Protocol — Skill tool 대신 inline 실행을 기본으로 변경)

### Skill Trace
- **File**: `.claude/skills/smart-sdd/commands/pipeline.md`
- **Rule**: "⚠️⚠️⚠️ EXECUTE + REVIEW CONTINUITY RULE ⚠️⚠️⚠️ — Execute and Review are ONE continuous action — they MUST happen in the SAME response." (line ~147-160)
- **Line**: 147-160

### Problem
pipeline.md의 EXECUTE + REVIEW CONTINUITY RULE은 "speckit 실행과 Review가 동일 응답에서 연속으로 이루어져야 한다"고 명시한다. 그러나 이 규칙은 **Skill tool 호출의 구조적 특성으로 인해 준수가 불가능**하다.

**발생 메커니즘 (3단계)**:

1. **smart-sdd 에이전트가 `Skill(speckit-plan)` 호출** → Skill tool이 speckit-plan SKILL.md를 로드하고 실행
2. **speckit-plan이 자체 완료 메시지를 생성** → "Branch: 002-navigation, spec dir: specs/002-navigation/" 등의 completion report
3. **Skill tool이 결과를 smart-sdd 에이전트에 반환** → 이 시점에서 **에이전트의 응답 턴이 종료됨**

핵심 문제: **Skill tool의 결과 반환이 곧 에이전트 응답의 경계**이다. speckit skill은 자체 SKILL.md 지시에 따라 "Report completion" 메시지를 생성하고, 이것이 사용자에게 보이는 최종 응답이 된다. smart-sdd의 "Review를 동일 응답에서 계속하라"는 지시는 이미 소실된 상태.

**실제 관찰된 패턴** (F002 pipeline에서 3회 발생):

| 단계 | speckit 호출 | 실제 동작 | 규칙 위반 |
|------|------------|----------|---------|
| specify | `Skill(speckit-specify)` | speckit이 completion report 출력 → 멈춤 | Review 미표시, continue 안내 없음 |
| plan | `Skill(speckit-plan)` | speckit이 "Branch, artifacts" 출력 → 멈춤 | Review 미표시, continue 안내 없음 |

**사용자 경험**: 에이전트가 speckit 완료 메시지만 보여주고 멈춘다. 사용자는:
- Review가 나올 것을 기다리지만 아무것도 안 나옴
- "continue"를 타이핑해야 한다는 안내도 없음
- 파이프라인이 끝난 것인지, 멈춘 것인지 판단 불가

**Fallback도 작동하지 않는 이유**: pipeline.md line 162-168의 fallback 메시지 (`💡 Type "continue" to review the results.`)는 "에이전트가 Review를 진행할 수 없을 때" 표시하라고 되어 있다. 그러나 문제는 에이전트가 fallback을 표시할 기회 자체가 없다는 것이다 — Skill tool 반환 후 speckit의 completion 메시지가 이미 최종 응답으로 출력되었기 때문.

### Expected
두 가지 중 하나:

**A) Skill tool 호출 후에도 smart-sdd가 응답을 이어갈 수 있어야 함**
- Skill 실행이 smart-sdd의 "하위 단계"로 작동하여, speckit 완료 후 smart-sdd가 동일 응답에서 Review를 계속 표시

**B) Skill tool의 구조적 한계를 인정하고, speckit 완료 후 항상 fallback 메시지를 표시하는 메커니즘**
- speckit skill의 completion 메시지 자체에 "다음 단계" 안내를 포함
- 또는 smart-sdd가 Skill tool 대신 inline execution (Skill Invocation Fallback)을 기본으로 사용

### Workaround
현재 없음 — 사용자가 매번 "continue" 또는 별도 메시지를 입력하여 수동으로 이어감. 3회 반복 발생으로 사용자 경험 심각하게 저하.

### Suggested Fix
**근본 수정 (Option 1 — 권장): speckit-* 호출 시 Skill tool 대신 Inline Execution을 기본으로 사용**

pipeline.md의 Step 3 (Execute) 규칙을 변경:
```
현재: "Invokes speckit-[command] via the Skill tool"
수정: "기본적으로 Skill Invocation Fallback (inline execution)을 사용한다.
       Skill tool은 speckit-*에 대해 사용하지 않는다.
       이유: Skill tool의 응답 경계가 Execute+Review 연속성을 깨뜨리기 때문."
```

Inline execution은 이미 pipeline.md line 108-113에 정의되어 있다:
1. speckit SKILL.md 파일을 직접 읽기
2. 지시사항을 inline 워크플로우 단계로 실행
3. 실행 완료 후 동일 응답에서 바로 Review로 진행

이렇게 하면:
- speckit의 completion 메시지가 생성되지 않음 (별도 Skill 응답 없음)
- smart-sdd 에이전트가 동일 응답 내에서 artifact 읽기 → Review 표시 → AskUserQuestion까지 연속 진행 가능
- EXECUTE + REVIEW CONTINUITY RULE을 구조적으로 준수 가능

**보조 수정 (Option 2 — Option 1이 불가능할 때): speckit SKILL.md에 smart-sdd 인식 규칙 추가**

각 speckit-* SKILL.md에 규칙 추가:
```
"smart-sdd pipeline 내에서 호출된 경우 (대화 컨텍스트에 smart-sdd pipeline 진행 흔적이 있는 경우):
  - completion report를 생성하지 않는다
  - 대신 마지막 줄에 다음을 출력한다:
    '✅ speckit-[command] executed for [FID]-[name]. 💡 Type "continue" to review the results.'
  - 이렇게 해도 Review는 표시되지 않지만, 최소한 사용자가 다음 행동을 알 수 있다"
```

**Option 1이 구조적으로 올바른 수정**이며, Option 2는 Skill tool 사용을 유지해야 하는 제약이 있을 때의 차선책이다.

### 영향 범위
이 문제는 smart-sdd pipeline의 **모든 speckit-* 호출**에 영향:
- `speckit-constitution` (Phase 0-3)
- `speckit-specify` (Phase 1 step 1)
- `speckit-clarify` (Phase 1 step 1b)
- `speckit-plan` (Phase 1 step 2)
- `speckit-tasks` (Phase 1 step 3)
- `speckit-analyze` (Phase 1 step 4)
- `speckit-implement` (Phase 1 step 5)

총 7개 호출 지점 × Feature 수 = **매 Feature마다 최대 7회 중단** 가능.
F001~F010 전체 pipeline에서 최대 70회 중단 발생 가능.

---

## [SKF-023] Verify passed without detecting that Tailwind CSS was not rendering — build/TS/smoke all green while UI was completely unstyled

- **Trigger**: B (사용자 지적) — "demo를 실행해보니 이게 뭘 만든건지 모르겠는데"
- **Phase**: smart-sdd verify Phase 1-3 (F002-navigation) + implement Smoke Launch
- **Category**: MISSING_RULE
- **Severity**: Critical (pipeline 중단)
- **Timestamp**: 2026-03-16 09:00
- **Status**: ✅ Reflected — `injection/implement.md` (CSS Build Pipeline Verification), `pipeline.md` (Smoke Launch mandatory snapshot + Foundation Gate CSS Toolchain), `verify-phases.md` (Phase 1 item 5 CSS rendering check)

### Skill Trace
- **File**: `.claude/skills/smart-sdd/commands/pipeline.md`
- **Rule**: Post-Implement Smoke Launch (lines 761-774) — "For GUI projects: Confirm the main window is not blank — if Playwright CLI is available, take a single snapshot to verify basic UI elements rendered"
- **Line**: 761-774 (Smoke Launch) + verify-phases.md Phase 1 (Build gate)

### Problem
F002 implement + verify가 모두 통과했지만, 실제 앱은 **Tailwind CSS가 완전히 적용되지 않은 상태**였다:

1. **Build 통과**: `pnpm run build` 성공. CSS 파일 30.20 KB 생성. 그러나 이 CSS는 F001의 기존 클래스만 포함하고, F002의 새 컴포넌트 클래스는 포함되지 않았음
2. **TypeScript 통과**: `npx tsc --noEmit` 성공. Tailwind 클래스는 string이므로 TS가 검증하지 않음
3. **Smoke Launch 통과**: 앱이 시작되고 크래시 없이 실행됨. 그러나 "blank가 아닌지 확인"이 실행되지 않았음
4. **Verify Phase 1 통과**: Build/TS 게이트 모두 green

**실제 화면**: 사이드바 아이콘이 가로 한 줄로 나열, 배경색/테두리/레이아웃 없음, flex-row/flex-col 적용 안됨. 사용자가 "이게 뭘 만든건지 모르겠다"고 지적.

**근본 원인**: Tailwind CSS 4는 `@tailwindcss/vite` 플러그인이 `electron.vite.config.ts`의 renderer 섹션에 등록되어야 소스 파일을 스캔하여 사용된 클래스를 CSS로 변환한다. F001에서 이 플러그인 없이도 기본 클래스가 동작한 것은 `@import "tailwindcss"` 자체가 일부 reset/base 스타일을 포함하기 때문이지만, 새 컴포넌트의 utility 클래스(w-12, h-11, flex-row, border-border 등)는 누락되었다.

### Expected
세 단계에서 잡았어야 함:

1. **Implement 에이전트**: 새 CSS framework 플러그인이 빌드 파이프라인에 등록되었는지 확인. Tailwind CSS 4 + Vite = `@tailwindcss/vite` 필수
2. **Smoke Launch**: Playwright 스냅샷을 찍고 "기본 UI 요소가 렌더링되었는지" 확인하는 규칙이 있으나, 실제로 스냅샷을 찍지 않았음
3. **Verify Phase 3**: GUI Feature에서 Playwright로 시각적 검증을 해야 하지만, Phase 1 (build/TS) 통과로 바로 Review로 이동

### Workaround
`@tailwindcss/vite` 플러그인 설치 + `electron.vite.config.ts` renderer.plugins에 추가:
```typescript
import tailwindcss from '@tailwindcss/vite'
renderer: { plugins: [tailwindcss(), react()] }
```

### Suggested Fix
**1. Implement B-3 규칙 추가** (`injection/implement.md`):
- "CSS framework (Tailwind CSS, PostCSS 등)를 사용하는 프로젝트에서 새 컴포넌트를 추가할 때, CSS 빌드 파이프라인이 새 파일을 스캔하는지 확인"
- "Tailwind CSS 4: `@tailwindcss/vite` 또는 `@tailwindcss/postcss` 플러그인이 빌드 도구에 등록되어 있는지 확인"
- "CSS 관련 변경 후 빌드된 CSS 파일 크기가 합리적인지 확인 (새 컴포넌트 추가 후 CSS가 줄거나 동일하면 경고)"

**2. Smoke Launch 강화** (`pipeline.md` line 767):
- 현재: "take a single snapshot to verify basic UI elements rendered"
- 강화: "스냅샷을 **반드시 캡처**하고, 캡처된 이미지에서 **레이아웃이 의도대로 적용되었는지** 확인. 모든 요소가 왼쪽 상단에 수직으로 나열되어 있으면 CSS 미적용 경고"

**3. Verify Phase 1에 CSS rendering check 추가** (`verify-phases.md`):
- Build gate 통과 후, GUI Feature에서는 Playwright로 앱 실행 → 스냅샷 → 최소 하나의 flex/grid 레이아웃이 적용되었는지 확인
- "CSS 파일이 생성되었지만 적용되지 않는" 상황은 build gate만으로 잡을 수 없음

**4. Foundation Gate에 CSS toolchain 확인 추가** (`pipeline.md` Step 3b):
- Tailwind CSS 4 프로젝트에서 `@tailwindcss/vite` 또는 `@tailwindcss/postcss`가 빌드 설정에 등록되어 있는지 확인
- 미등록 시 경고 + 자동 설치 제안

---

## [SKF-024] Implement agent produced layout that doesn't match source app — sidebar+tabbar shown simultaneously instead of mode-exclusive

- **Trigger**: B (사용자 지적) — "ui 형상이 cherry studio와 완전히 다르게되었는데 의도된건가?"
- **Phase**: smart-sdd implement (F002-navigation) — layout structure
- **Category**: WRONG_ASSUMPTION
- **Severity**: Major (결과물 품질 저하)
- **Timestamp**: 2026-03-16 09:10
- **Status**: ✅ Reflected — `injection/implement.md` (Rebuild Visual Reference Checkpoint HARD STOP), `pipeline.md` (Post-Implement Completeness Gate with rebuild parity check), `verify-phases.md` (Phase 3e strengthened skip conditions with visual ref fallback)

### Skill Trace
- **File**: `.claude/skills/smart-sdd/reference/injection/implement.md`
- **Rule**: "Source App Visual Reference" (rebuild mode, GUI) — 원본 앱의 레이아웃 구조를 참조하여 구현하라는 규칙 존재. 그러나 실행되지 않음
- **Line**: ~115-159

### Problem
Cherry Studio 원본의 네비게이션 모드는 **상호 배타적**이다:
- **top 모드 (기본)**: 상단에 탭바만 표시. 사이드바 없음. 전체 너비를 콘텐츠가 사용.
- **left 모드**: 좌측에 아이콘 사이드바. 탭바 없음 (또는 콘텐츠 영역 내부에 탭).

그러나 F002 구현 결과: **사이드바와 탭바가 동시에 표시**. navbarPosition과 무관하게 항상 좌측 사이드바가 보이고, 상단 탭바도 보임. 이는 Cherry Studio의 어떤 모드와도 일치하지 않는 혼합 레이아웃.

**원인 분석**: plan.md의 "Layout Strategy"가 Cherry Studio의 "left" 모드 구조를 기본으로 설명하면서, 이것을 navbarPosition에 따라 전환하지 않았다. plan.md가 "In 'top' mode, the Sidebar renders navigation icons"라고 기술했으나, Cherry Studio의 top 모드에는 사이드바 자체가 없다. plan 단계에서 이미 소스 앱의 모드 전환 동작을 잘못 이해한 것이 implement까지 전파됨.

이것은 SKF-014 (잘못된 가정의 파이프라인 전파)의 또 다른 사례:
1. pre-context: "Two navigation paradigms" 기술 (맞음)
2. plan: "Sidebar always visible, TabBar switches" (틀림 — Cherry Studio에서는 Sidebar 자체가 모드에 따라 표시/숨김)
3. implement: plan 따라 구현 (plan이 틀렸으므로 결과도 틀림)

### Expected
- **top 모드**: 사이드바 없음. 전체 너비 상단 탭바 (Cherry Studio의 Navbar.tsx + TabsContainer.tsx)
- **left 모드**: 좌측 사이드바 (아이콘). 콘텐츠 영역 상단에 내비바 (WindowControls + 드래그 영역)
- 모드 전환 시: 한 요소가 사라지고 다른 요소가 나타남

### Workaround
AppLayout.tsx에서 navbarPosition에 따라 Sidebar를 조건부 렌더링하도록 수정. Top 모드에서는 Sidebar 숨기고 TabBar를 전체 너비로 표시.

### Suggested Fix
**이 문제는 plan 단계에서 발생한 가정 오류의 전파**이므로 두 수준의 수정 필요:

1. **Plan 단계에서 소스 앱 모드 전환 동작 확인** (`injection/plan.md`):
   - "설정/모드 전환 Feature의 plan 작성 시, 소스 앱에서 각 모드의 **실제 레이아웃 구조**를 확인해야 한다"
   - "pre-context의 'two paradigms' 같은 요약 설명만으로 레이아웃을 설계하지 말고, 각 모드에서 어떤 컴포넌트가 보이고/숨겨지는지 소스 코드에서 확인"

2. **Implement에서 소스 앱 비교 (SKF-008 관련)**:
   - 이미 SKF-008에서 "implement 시 source app의 layout structure를 코드 수준에서 분석" 규칙이 제안됨
   - 추가: "모드 전환이 있는 Feature에서는 **각 모드별** 레이아웃을 소스에서 확인하고, 모드 간 컴포넌트 가시성 차이를 문서화"

---

## [SKF-025] Verify-time code changes lack Source Modification Gate classification — verify에서 발견된 UI 문제 수정 시 implement 단계로 돌아갈지 판단 없이 즉시 수정

- **Trigger**: B (사용자 지적) — "수정 진행 과정에서 implement의 단계로 내려갈지 여부를 검토하지 않았다면 이 부분도 skill feedback에 반영"
- **Phase**: smart-sdd verify → implement regression (F002-navigation)
- **Category**: MISSING_RULE
- **Severity**: Major (결과물 품질 저하)
- **Timestamp**: 2026-03-16 09:15
- **Status**: ✅ Reflected — Source Modification Gate already exists in `verify-phases.md` (lines 87-200). The issue was agent non-compliance, not missing rule. Reinforced via Post-Implement Completeness Gate and Phase 2 task completion blocking elevation to prevent incomplete features from reaching verify.

### Skill Trace
- **File**: `.claude/skills/smart-sdd/commands/verify-phases.md`
- **Rule**: Source Modification Gate (verify-phases.md) — verify 중 코드 변경이 필요할 때 Type 1 (bugfix) / Type 2 (design change) / Type 3 (new requirement) 분류하여 적절한 단계로 돌아가라는 규칙
- **Line**: ~(verify-phases.md의 Source Modification Gate 섹션)

### Problem
Verify 단계에서 두 가지 문제가 발견됨:
1. **Tailwind CSS 미적용** (SKF-023) — CSS 빌드 파이프라인 설정 누락
2. **레이아웃 구조 불일치** (SKF-024) — 사이드바+탭바 동시 표시 vs 모드별 배타적 표시

에이전트는 이 문제들을 발견 후 **Source Modification Gate 분류 없이** 즉시 수정을 시작했다:
- Tailwind 수정: `electron.vite.config.ts`에 `@tailwindcss/vite` 플러그인 추가 — 이것은 **Type 1 (bugfix)**: 빌드 설정 누락이므로 verify 내에서 수정 가능
- 레이아웃 수정: `AppLayout.tsx`와 `Navbar.tsx`의 레이아웃 구조 변경 — 이것은 **Type 2 (design change)**: plan.md의 Layout Strategy가 잘못되었으므로 implement로 돌아가야 함

Type 2 변경은 plan.md 업데이트 → implement 재실행이 필요하지만, 에이전트는 이 분류를 수행하지 않고 verify 내에서 직접 코드를 수정했다.

### Expected
Verify에서 코드 변경이 필요할 때:
1. Source Modification Gate 분류 수행 (Type 1/2/3)
2. Type 1 (bugfix): verify 내에서 수정 허용
3. Type 2 (design change): HARD STOP → 사용자에게 "이것은 설계 변경입니다. implement로 돌아가서 plan 수정 후 재구현할까요, 아니면 verify 내에서 hot-fix하고 plan은 나중에 업데이트할까요?" 확인
4. Type 3 (new requirement): HARD STOP → specify로 돌아가야 함

### Workaround
에이전트가 분류 없이 직접 수정. 결과적으로 수정 자체는 올바르지만, plan.md의 Layout Strategy는 아직 구 버전(사이드바 항상 표시)으로 남아있어 문서와 코드 불일치 발생.

### Suggested Fix
`commands/verify-phases.md`의 Source Modification Gate 규칙을 더 강하게 강조:
- "verify 중 코드 변경이 필요한 상황이 발생하면, **반드시 먼저** Type 1/2/3 분류를 수행하고 사용자에게 표시해야 한다"
- "Type 2 이상의 변경을 verify 내에서 직접 수행하는 것은 **HARD STOP 위반**이다"
- "분류 결과를 AskUserQuestion으로 제시: 'Type 2 설계 변경 필요 — implement로 돌아갈까요?'"

---

## [SKF-026] speckit-specify의 create-new-feature.sh가 smart-sdd의 사전 생성 브랜치와 충돌

- **Trigger**: A (자각)
- **Phase**: smart-sdd pipeline specify (F003-settings)
- **Category**: WRONG_ASSUMPTION
- **Severity**: Minor (마찰)
- **Timestamp**: 2026-03-16 10:05
- **Status**: ✅ Reflected — `pipeline.md` Feature Number & Branch Conflict Prevention (expanded with branch-already-exists error recovery)

### Skill Trace
- **File**: `.claude/skills/smart-sdd/commands/pipeline.md`
- **Rule**: "smart-sdd creates and switches to the Feature branch... Because spec-kit is initialized with --no-git, speckit-specify does NOT create Feature branches."
- **Line**: Pre-Flight § Create Feature branch

### Problem
smart-sdd가 `git checkout -b 003-settings`로 브랜치를 미리 생성한 후, speckit-specify 내부의 `create-new-feature.sh`를 실행하면 "Branch '003-settings' already exists" 에러 발생. 스크립트가 브랜치 생성을 시도하기 때문.

### Expected
smart-sdd가 브랜치를 미리 만드는 경우 speckit-specify의 브랜치 생성 단계를 건너뛰거나, 이미 존재하는 브랜치를 감지하고 계속 진행해야 함.

### Workaround
speckit-specify의 create-new-feature.sh 호출을 건너뛰고, specs 디렉토리와 spec.md를 수동으로 생성.

### Suggested Fix
`commands/pipeline.md`의 specify 실행 섹션에 명시: "smart-sdd가 이미 Feature branch를 생성했으므로, speckit-specify 호출 시 `create-new-feature.sh`가 에러를 반환하면 무시하고 spec 디렉토리/파일만 수동 생성한다." 또는 `create-new-feature.sh`에 `--skip-branch` 플래그 추가 제안.

---

## [SKF-027] Analyze의 FR coverage gap 기준이 partial coverage에 대해 과도하게 엄격

- **Trigger**: A (자각)
- **Phase**: smart-sdd pipeline analyze (F003-settings)
- **Category**: OVER_ENGINEERED
- **Severity**: Minor (마찰)
- **Timestamp**: 2026-03-16 11:10
- **Status**: ✅ Reflected — `injection/analyze.md` Coverage Severity Rules (MEDIUM tier added: task covers core behavior but lacks implementation detail → MEDIUM, not HIGH)

### Skill Trace
- **File**: `.claude/skills/smart-sdd/reference/injection/analyze.md`
- **Rule**: "FR has task(s) but partial coverage (sub-aspect not explicit) → HIGH severity"
- **Line**: Coverage Severity Rules table

### Problem
FR-011 (avatar style with visual previews), FR-013 (code block theme selection), FR-018 (backup config management) 모두 해당 task가 있지만 task 설명에 세부 구현 방식(preview 이미지, theme 목록 소스, retention 외 다른 config)이 명시되지 않아 HIGH로 분류됨. 실제로는 task 설명을 약간 보강하면 해결되는 수준으로, HIGH보다는 MEDIUM이 적절.

### Expected
Task가 존재하고 FR의 핵심 행동을 커버하지만 세부 구현 방식이 task 설명에 없는 경우 → MEDIUM으로 분류. HIGH는 task가 FR의 핵심 행동 자체를 누락한 경우에 사용.

### Workaround
Task 설명을 보강하여 해결 (T030에 "visual preview icons" + "static theme list constant", T055에 scope 명시).

### Suggested Fix
`reference/injection/analyze.md`의 Coverage Severity Rules에 MEDIUM 등급 추가:
- "FR has task(s) covering core behavior but implementation detail not explicit in task description → MEDIUM"
- HIGH는 "FR has task(s) but a functionally distinct sub-behavior is entirely missing" 으로 변경

---

## [SKF-028] SBI 추출 해상도가 "파일 단위"에 머물러 UI 컨트롤 수준의 기능을 누락시킴

- **Trigger**: C (비교 검증) — Cherry Studio와 Angdu Studio F003 기능 비교
- **Phase**: smart-sdd verify (F003-settings)
- **Category**: MISSING_RULE
- **Severity**: Major (결과물 품질 저하)
- **Timestamp**: 2026-03-16 13:30

### Skill Trace

- **File**: `.claude/skills/reverse-spec/commands/analyze.md`
- **Rule**: N/A — reverse-spec Phase 2의 SBI 추출 규칙이 파일/함수 단위까지만 요구하고, UI 페이지 내 개별 컨트롤 단위 포착 규칙이 없음
- **Line**: N/A

### Problem

SBI 추출의 구조적 해상도 문제. reverse-spec Phase 2는 소스 파일을 읽고 "이 파일이 하는 일"을 SBI로 추출한다. 설정 페이지처럼 하나의 파일에 10+ 개 UI 컨트롤이 밀집된 경우, "General settings 페이지 렌더링(B056)"처럼 파일 수준 SBI만 추출되고 내부 컨트롤(Spell check toggle, Hardware acceleration, Zoom controls 등)은 개별 SBI로 포착되지 않았다. SBI에 없는 기능은 specify에서 FR로 변환되지 않고, plan/tasks/implement로 이어져 최종 구현에서 누락됨.

### Expected

UI 밀집 페이지(설정, 폼, 대시보드)에서는 파일 수준이 아닌 **개별 UI 컨트롤 단위**로 SBI를 추출해야 함. 각 Switch, Select, Button, Slider가 하나의 SBI가 되어야 한다.

### Workaround

Verify 후 Cherry Studio 소스와 수동 비교하여 누락 기능 식별.

### Suggested Fix

`reverse-spec/commands/analyze.md` Phase 2 SBI 추출 지침에 해상도 규칙 추가:
- "**UI 밀집 파일 감지**: 파일 내 form control 요소(Switch, Select, Input, Button, Slider 등)가 5개 이상이면 → 각 컨트롤을 개별 SBI로 분리"
- "**소스 파일 읽기 시**: UI 렌더 함수 내 모든 사용자 상호작용 요소를 나열하고, 각각에 고유 B### ID를 부여"
- "**Phase 1.5 런타임 탐색 연계**: 소스 코드 SBI 추출 후 런타임 탐색에서 실제 UI 요소 수와 교차 검증하여 누락 포착"

---

## [SKF-029] Verify Phase 3가 렌더링 확인에 그치고, plan.md Interaction Chains의 Verify Method를 실행하지 않음

- **Trigger**: A (자각)
- **Phase**: smart-sdd verify Phase 3 (F003-settings)
- **Category**: MISSING_RULE
- **Severity**: Major (결과물 품질 저하)
- **Timestamp**: 2026-03-16 13:30

### Skill Trace

- **File**: `.claude/skills/smart-sdd/commands/verify-phases.md`
- **Rule**: Phase 3 — "Navigate to each SC-related screen → Snapshot → confirm normal rendering"
- **Line**: Phase 3 section

### Problem

파이프라인의 구조적 단절 문제. plan.md에 Interaction Chains 테이블의 Verify Method 열(`verify-state`, `verify-effect`)이 정의되어 있고, 이 열의 목적은 "verify Phase 3에서 자동화된 검증에 사용"이라고 injection/plan.md에 명시되어 있다. 그러나 verify-phases.md의 Phase 3 실행 규칙은 "스크린샷 캡처 + 정상 렌더링 확인"만 요구하고, Verify Method 열을 Playwright에서 실행하라는 규칙이 없다. 결과적으로 plan에서 정의한 검증 방법이 verify에서 사용되지 않는 dead column이 됨.

### Expected

plan.md → tasks.md → implement → verify의 데이터 흐름에서, Verify Method 열이 verify Phase 3에 자동 주입되어 Playwright에서 실행되어야 함. 예: `verify-effect html class "dark"` → `await expect(page.locator('html')).toHaveClass(/dark/)`.

### Workaround

별도 수동 테스트 스크립트에서 확인.

### Suggested Fix

`commands/verify-phases.md` Phase 3에 **Interaction Chain 검증 연결** 규칙 추가:
- "plan.md에 `## Interaction Chains` 섹션이 있으면 → 각 행의 Verify Method 열을 읽어 Playwright 검증으로 변환하여 실행"
- "`verify-state selector attribute \"expected\"` → `expect(page.locator(selector)).toHaveAttribute(attribute, expected)`"
- "`verify-effect target property \"expected\"` → `page.evaluate(...)` + assert"
- "모든 chain의 Verify Method가 PASS해야 Phase 3 통과. FAIL 시 해당 FR과 함께 보고"

이렇게 하면 plan에서 정의한 검증 사양이 verify까지 끊기지 않고 자동화된 검증으로 이어진다.

---

## [SKF-030] 파이프라인에 "Feature 진입점 존재 확인" 게이트가 없어 접근 불가능한 Feature가 verify를 통과함

- **Trigger**: B (사용자 지적) — "demo를 띄웠을때 정작 확인해야할 setting 화면으로 갈 방법이 없어"
- **Phase**: smart-sdd verify (F003-settings)
- **Category**: MISSING_RULE
- **Severity**: Critical (pipeline 중단 — 기능 접근 불가)
- **Timestamp**: 2026-03-16 14:00

### Skill Trace

- **File**: `.claude/skills/smart-sdd/reference/injection/implement.md`, `.claude/skills/smart-sdd/reference/injection/specify.md`, `.claude/skills/smart-sdd/commands/verify-phases.md`
- **Rule**: N/A — 3개 파일 모두 "현재 Feature의 진입점이 기존 UI에 존재하는지 확인" 규칙 없음
- **Line**: N/A

### Problem

파이프라인 전체에 "Feature Reachability" 검증이 없다는 구조적 결함. F003 Settings 구현이 specify → plan → tasks → implement → verify 전 과정을 통과했지만, 기본 Top 모드에서 Settings 페이지로 이동할 UI 진입점(아이콘, 버튼)이 존재하지 않았다. Cherry Studio의 runtime-exploration.md에 "Navbar 우측: settings gear icon"이 기록되어 있었으나, 이 정보가 F002 또는 F003의 어느 파이프라인 단계에서도 "진입점을 구현해야 한다"는 요구사항으로 변환되지 않았다.

근본 원인은 3단계에 분산:
1. **specify**: spec.md에 "사용자가 이 Feature에 어떻게 접근하는가"를 기술하는 FR이 없음
2. **implement**: 이전 Feature UI에 현재 Feature 진입점이 있는지 확인하는 규칙 없음
3. **verify**: "사용자가 앱 시작 → 대상 Feature로 이동 가능한가"를 검증하는 게이트 없음

### Expected

UI Feature는 그 존재만으로는 불충분하고, 사용자가 실제로 도달할 수 있어야 한다. 파이프라인의 최소 1개 단계에서 "Feature Reachability"를 검증해야 함.

### Workaround

Navbar.tsx에 Settings gear 아이콘 수동 추가.

### Suggested Fix

**단일 게이트로 3단계 중 가장 효과적인 위치에 삽입** — verify Phase 0 (앱 시작 직후)이 최적:

`commands/verify-phases.md` Phase 0에 **Feature Reachability Gate** 추가:
- "UI Feature의 verify 시작 시, 앱을 홈 화면에서 시작 → **UI 조작만으로** 대상 Feature 화면에 도달할 수 있는지 확인"
- "도달 방법: 네비게이션 바 아이콘 클릭, 메뉴 항목 선택, 버튼 클릭 등 — URL 직접 입력은 불가"
- "도달 불가 → **CRITICAL BLOCK** — implement로 regression하여 진입점 추가"

부수적으로 specify에도 보강:
- `reference/injection/specify.md`에: "UI Feature spec에는 사용자가 이 Feature에 접근하는 경로를 기술하는 FR 또는 AS(Acceptance Scenario)가 최소 1개 포함되어야 함. 다른 Feature UI 수정이 필요하면 Integration Contract에 명시"

---

## [SKF-031] Demo 스크립트가 "무엇을 시도하라"만 나열하고, 기대 결과와 확인 방법이 없어 테스트 가이드로 기능하지 못함

- **Trigger**: B (사용자 지적) — "demo 파일 안에 주석으로 정확히 사용자가 어떤 테스트를 어떻게 진행해서 어떻게 확인한다는게 명확히 표현되면 좋겠는데"
- **Phase**: smart-sdd implement → demo script generation (F003-settings)
- **Category**: TEMPLATE_GAP
- **Severity**: Major (결과물 품질 저하)
- **Timestamp**: 2026-03-16 14:30

### Skill Trace

- **File**: `.claude/skills/smart-sdd/reference/demo-standard.md`
- **Rule**: Demo script 구조 규정에 "사용자 지침" 출력 요구가 있으나, 각 테스트 항목의 형식이 "조작 → 기대 결과 → 확인 방법"이 아닌 "기능 나열" 수준
- **Line**: Interactive mode section

### Problem

demo-standard.md의 데모 스크립트 템플릿이 interactive 모드에서 사용자에게 출력하는 지침을 "기능 목록 나열" 형태로만 규정한다. 결과적으로 생성된 데모 스크립트(F003-settings.sh)는 "Switch theme: Light / Dark / System"처럼 무엇을 시도하라는 것만 나열하고, **어떻게 조작하고**, **무엇이 기대되고**, **어떻게 확인하는지**가 없다. 사용자가 테마를 Dark로 변경했을 때 "전체 UI가 200ms 이내에 어두운 색상으로 변경되어야 한다"는 기대 결과를 모르면, 정상인지 비정상인지 판단할 수 없다.

### Expected

데모 스크립트의 각 테스트 항목이 다음 3단계 형식을 따라야 함:
```
조작: [사용자가 정확히 무엇을 어떻게 하는지]
기대: [조작 후 어떤 결과가 나타나야 하는지]
확인: [사용자가 무엇을 보고 성공/실패를 판단하는지]
```

### Workaround

F003-settings.sh의 파일 상단 주석에 각 테스트 항목을 "조작 → 기대 → 확인" 3단계로 상세 작성.

### Suggested Fix

`reference/demo-standard.md`의 Interactive Mode 섹션에 **Test Plan Comment Block** 형식 규정 추가:

```
Demo 스크립트 파일 상단에 TEST PLAN 주석 블록을 포함해야 한다.
각 테스트 항목은 다음 형식:

# ── Test N: [테스트 제목] ──
#   사전 조건: [필요한 상태 — 예: "화면 설정 페이지에 있어야 함"]
#   조작: [사용자의 구체적 행동 — 예: "테마에서 '다크' 라디오 버튼 클릭"]
#   기대: [조작 직후 발생해야 하는 결과 — 예: "전체 UI가 200ms 이내에 어두운 색상으로 변경"]
#   확인: [사용자가 시각적으로 확인할 수 있는 것 — 예: "배경 검은색, 텍스트 흰색, 사이드바/탭바 모두 다크 적용"]
```

이 형식은 spec.md의 Acceptance Scenario(Given-When-Then)와 plan.md의 Interaction Chain(Verify Method)에서 자동으로 도출할 수 있으므로, demo 생성 시 이 두 소스를 참조하도록 injection 규칙도 추가한다.

---

## [SKF-032] Demo TEST PLAN의 테스트 항목이 verify에서 실제 실행·검증되지 않음 — 작성만 하고 검증을 건너뜀

- **Trigger**: B (사용자 지적) — "최소한 verify 단계에서 각 테스트 항목을 테스트는 해보고 검증 해야하는것도 반영"
- **Phase**: smart-sdd verify (F003-settings)
- **Category**: MISSING_RULE
- **Severity**: Critical (pipeline 중단 — 검증 없이 통과)
- **Timestamp**: 2026-03-16 14:45

### Skill Trace

- **File**: `.claude/skills/smart-sdd/commands/verify-phases.md`
- **Rule**: N/A — verify에서 demo 스크립트의 TEST PLAN 항목을 실행하라는 규칙 없음. Demo 스크립트는 implement에서 생성되지만 verify에서 그 내용을 검증 자산으로 활용하는 연결이 부재
- **Line**: N/A

### Problem

파이프라인의 구조적 단절. Demo 스크립트의 TEST PLAN에 "조작 → 기대 → 확인" 형식으로 9개 테스트 시나리오를 상세 작성했지만, verify 단계에서 이 항목들을 **실제로 실행하지 않았다**. Verify Phase 3는 스크린샷 캡처 + 콘솔 에러 체크만 수행하고, demo TEST PLAN의 개별 시나리오를 Playwright로 재현하여 기대 결과를 검증하는 과정이 없다.

결과적으로 TEST PLAN은 사용자를 위한 안내문에 그치고, 파이프라인 내부의 품질 게이트로 기능하지 못한다. "테마 전환 시 html.dark 클래스 토글", "앱 재시작 후 설정 persist", "단축키 충돌 경고 표시" 같은 시나리오는 작성되었지만 자동 검증되지 않았다.

### Expected

Demo TEST PLAN 항목은 verify Phase 3에서 **자동화 가능한 것은 Playwright로 실행**하고, **자동화 불가능한 것(파일 다이얼로그, OS 재시작 등)은 사유와 함께 skip 기록**해야 한다. TEST PLAN이 "작성 후 방치"되는 dead document가 아니라, verify의 검증 체크리스트로 기능해야 한다.

### Workaround

없음 — 사용자가 직접 데모를 실행하여 수동 확인.

### Suggested Fix

`commands/verify-phases.md` Phase 3에 **Demo TEST PLAN Execution Gate** 추가:

1. "implement에서 생성된 demo 스크립트 내 TEST PLAN 주석 블록을 파싱"
2. "각 테스트 항목을 분류:
   - **자동화 가능** (UI 조작 + DOM 상태 확인): Playwright로 실행 → PASS/FAIL 기록
   - **반자동** (UI 조작 가능하나 기대 결과가 시각적 판단): Playwright 스크린샷 캡처 + 에이전트가 기대 결과와 대조
   - **수동 전용** (파일 다이얼로그, OS 레벨 동작, 앱 재시작): skip 사유 기록 + 사용자에게 수동 테스트 요청"
3. "자동화 가능 항목 중 FAIL이 있으면 → 기존 Bug Fix Severity Rule에 따라 분류 및 처리"
4. "결과를 verify Review에 표시:
   ```
   ── Demo TEST PLAN Execution ─────────────────
   Total: 9 tests | Auto: 5 PASS | Semi-auto: 2 PASS | Manual: 2 SKIPPED
   ────────────────────────────────────────────────
   ```"

**연결 포인트**: SKF-031에서 TEST PLAN 작성 형식을 표준화하면, 이 게이트가 파싱하기 쉬워진다. SKF-029의 Interaction Chain Verify Method 실행과 통합하면, TEST PLAN + Interaction Chain + SC가 하나의 검증 체계로 수렴한다.

---

## [SKF-033] Verify 자동 테스트가 앱의 persist된 상태를 고려하지 않아 false positive/negative 발생

- **Trigger**: A (자각) — TEST PLAN 실행 시 이전 세션의 persist된 dark theme로 인해 테스트 로직이 오판
- **Phase**: smart-sdd verify Phase 3 (F003-settings)
- **Category**: MISSING_RULE
- **Severity**: Major (결과물 품질 저하)
- **Timestamp**: 2026-03-16 15:00

### Skill Trace

- **File**: `.claude/skills/smart-sdd/commands/verify-phases.md`
- **Rule**: N/A — verify에서 앱 상태를 초기화한 후 테스트를 시작하라는 규칙 없음
- **Line**: N/A

### Problem

Verify 자동 테스트 실행 시, 앱이 이전 테스트 세션의 persist된 상태(dark theme, English 언어 등)로 시작했다. 테스트 로직이 "현재 상태 → 변경 → 검증"을 가정하지만, 시작 상태가 예측 불가능하면 결과가 틀린다:
- T2a: dark→dark 전환 시도 → before=true, after=true → FAIL (실제로는 기능 정상)
- T4: 이전에 English로 전환된 상태에서 한국어 UI로 검색 → 매칭 실패 → FAIL
- T9b: 이전 언어 전환으로 버튼 텍스트가 "삭제"가 아닌 "Clear All Data" → 매칭 실패 → FAIL

3개 FAIL 중 0개가 실제 코드 버그. 전부 **테스트 환경 상태** 문제.

### Expected

Verify 시작 전 앱 상태를 **알려진 초기 상태로 리셋**하거나, 테스트 로직이 **현재 상태를 먼저 감지한 후** 그에 맞게 조작해야 함.

### Workaround

각 테스트에서 "원하는 상태로 먼저 강제 설정 → 반대 상태로 전환 → 검증" 패턴 적용.

### Suggested Fix

`commands/verify-phases.md` Phase 0에 **Test State Isolation** 규칙 추가:
- "Verify 시작 전 `config:reset` IPC를 호출하여 앱 상태를 기본값으로 초기화하거나, 별도 user data 경로(`--user-data-dir`)로 앱을 시작하여 clean state 보장"
- "테스트 자동화 스크립트에서 **상태를 가정하지 말 것**: 토글 테스트 시 `현재 값 읽기 → 반대 값으로 변경 → 변경 확인` 패턴 사용"
- "Playwright 런타임 테스트의 각 시나리오는 이전 시나리오의 상태 변경에 영향 받지 않도록 **순서 독립적**으로 작성"

---

## [SKF-034] i18n hydration 시 config language 값과 i18next 실제 언어가 불일치 — Select UI에 잘못된 언어 표시

- **Trigger**: B (사용자 지적) — "당장 언어가 english로 되있지만 한국어로 되어있잖아"
- **Phase**: smart-sdd verify (F003-settings)
- **Category**: MISSING_RULE
- **Severity**: Major (결과물 품질 저하)
- **Timestamp**: 2026-03-16 15:00

### Skill Trace

- **File**: `.claude/skills/smart-sdd/reference/injection/implement.md`
- **Rule**: N/A — implement 시 "i18n 초기화와 config hydration의 순서/동기화"를 검증하는 규칙 없음
- **Line**: N/A

### Problem

i18next의 초기 언어(`lng: 'ko'`)와 electron-store에 persist된 language config 값이 동기화되지 않는 구조적 문제:
1. `i18n/index.ts`에서 `lng: 'ko'`로 초기화 (정적)
2. `useSettingsStore.hydrate()`에서 `config:getAll` → language 값 로드 (비동기)
3. hydrate 완료 전에 이미 i18next는 'ko'로 렌더링 시작
4. hydrate 후 `setLanguage`가 호출되어야 하지만, config에 저장된 값이 'ko'면 "이미 같으므로" 변경 이벤트가 발생하지 않음
5. 이전 세션에서 'en'으로 변경된 경우, config에는 'en'이 저장되어 있지만 i18next는 'ko'로 시작 → Select에는 'en' 표시, UI는 'ko' — **불일치**

이 문제는 "비동기 config hydration + 정적 i18n 초기화" 패턴에서 구조적으로 발생하며, implement 단계에서 이 race condition을 감지하는 규칙이 없다.

### Expected

i18n 초기 언어가 persist된 config 값과 일치해야 함. hydrate 완료 시 `i18n.changeLanguage(config.language)` 를 반드시 호출하되, 현재 언어와 같더라도 Select UI의 value가 config 값을 반영해야 함.

### Workaround

`useSettingsStore.hydrate()`에서 language 로드 후 무조건 `i18n.changeLanguage(language)` 호출.

### Suggested Fix

`reference/injection/implement.md`에 **Async Hydration Sync** 규칙 추가:
- "비동기로 hydrate되는 store가 외부 시스템(i18n, theme, OS 설정 등)의 상태를 동기화하는 경우, hydrate 완료 시 해당 외부 시스템의 API를 **무조건** 호출하여 동기화. '이미 같은 값'이어도 호출해야 — 외부 시스템이 다른 경로로 다른 값을 가질 수 있음"
- "i18n 특수 사례: i18next의 `lng` 초기값과 persist된 config.language는 다를 수 있다. hydrate에서 `i18n.changeLanguage(config.language)` 를 반드시 호출"

---

## [SKF-035] Verify Phase 3에서 Playwright UI 검증을 실행하지 않고 CI health check만 실행

- **Trigger**: B (사용자 지적)
- **Phase**: smart-sdd F004 verify Phase 3
- **Category**: MISSING_RULE
- **Severity**: Major (결과물 품질 저하)
- **Timestamp**: 2026-03-16 16:30
- **Status**: ✅ Reflected — `verify-phases.md` GUI MANDATORY PLAYWRIGHT GATE rule 5 (Demo --ci ≠ UI Verification)

### Skill Trace
- **File**: spec-kit-skills 내 `smart-sdd/commands/verify-phases.md`
- **Rule**: "For GUI projects (MANDATORY): Take a Playwright snapshot and verify: The window is not blank, Layout structure is reasonable, Content is rendered"
- **Line**: N/A — 규칙이 존재하지만 verify Phase 3 demo 실행과 Playwright UI 검증을 분리하는 명확한 강제 규칙이 없음

### Problem
Verify Phase 3에서 demo script CI 모드(`--ci`)만 실행하고 Playwright로 실제 UI 요소(Switch, provider list, edit panel)를 검증하지 않았다. 에이전트는 Build ✅, TS ✅, Smoke Launch ✅만으로 verify success를 판단하고 Review를 제시했다. 실제 UI가 렌더링되고 상호작용 가능한지는 Playwright 없이 확인 불가능하다. 사용자가 직접 "toggle switch를 찾을 수 없는데" 질문으로 문제를 발견.

### Expected
Verify Phase 3에서 반드시 Playwright `_electron.launch()`로 앱을 실행하고:
1. 해당 Feature의 UI 경로로 네비게이션 (예: `#/settings/provider`)
2. 핵심 UI 요소 존재 확인 (예: `button[role=switch]` count > 0, provider list items, "Add" button)
3. 스크린샷 캡처 후 사용자에게 표시
4. 최소 1개의 상호작용 테스트 (예: provider 클릭 → edit panel 표시)

### Workaround
사용자 지적 후 Playwright `_electron.launch()` 실행. Switch 33개, provider 목록, Add 버튼 모두 확인됨. UI 정상 작동.

### Suggested Fix
`verify-phases.md`에 다음 규칙 추가:
- "Phase 3 Demo 이후, GUI Feature의 경우 **반드시** Playwright `_electron.launch()`로 앱을 실행하고 Feature의 핵심 UI 요소가 렌더링되는지 검증해야 한다. Demo CI 모드의 build/TS/smoke 결과만으로는 UI 검증을 대체할 수 없다."
- "검증 항목: (1) Feature 경로 네비게이션 성공, (2) 핵심 interactive 요소 카운트 > 0, (3) 스크린샷 캡처 및 사용자 표시, (4) 최소 1개 상호작용 (click → 결과 확인)"
- 이를 Phase 3c 또는 Phase 3-post로 분리하여, demo script 실행과 Playwright UI 검증이 별도의 mandatory step이 되도록 구조화

---

## [SKF-036] Tailwind CSS 4 @theme 매핑 누락 — shadcn/ui 컴포넌트가 무스타일로 렌더링

- **Trigger**: B (사용자 지적)
- **Phase**: smart-sdd F004 implement → verify
- **Category**: MISSING_RULE
- **Severity**: Critical (pipeline 중단 — UI가 사실상 작동하지 않음)
- **Timestamp**: 2026-03-16 17:00
- **Status**: ✅ Reflected — `injection/implement.md` Build Toolchain Integration step 4 (CSS Theme Token mapping check), `verify-phases.md` Step 3 CSS Theme Token Rendering Check (getComputedStyle), `gui.md` S7 cross-reference

### Skill Trace
- **File**: spec-kit-skills 내 `smart-sdd/commands/pipeline.md` § Pattern Constraints 및 `smart-sdd/reference/injection/implement.md`
- **Rule**: Pattern Constraints 테이블에 "Build-time plugin" 항목: "@tailwindcss/vite MUST be registered in renderer vite config plugins" — 플러그인 등록은 검증하지만 **@theme 블록 존재 여부**는 검증하지 않음
- **Line**: N/A

### Problem
F004 implement에서 shadcn/ui 컴포넌트(Switch, Button, Input, Dialog 등)를 작성했다. 이 컴포넌트들은 Tailwind 유틸리티 클래스(`bg-primary`, `bg-muted`, `text-foreground` 등)를 사용한다. 빌드는 통과하고 앱도 실행되지만, Tailwind CSS 4에서는 CSS 변수(`--primary: 240 5.9% 10%`)를 `@theme` 블록 없이 정의하면 `bg-primary` 같은 유틸리티 클래스가 아무 스타일도 적용하지 않는다.

결과: Switch 컴포넌트가 렌더링되지만 checked/unchecked 상태 모두 동일한 투명 배경으로 보여 사용자가 토글 상태를 구분할 수 없음. Playwright `button[role=switch]` 카운트 33개로 요소는 존재하지만 시각적으로 "보이지 않는" 상태.

에이전트는 Build ✅, TS ✅, Smoke Launch ✅만으로 verify success를 판단하려 했으나, 사용자가 "toggle switch가 어딨는거야?"로 문제를 발견.

### Expected
1. Pattern Constraints에 Tailwind CSS 4 전용 규칙 추가: **"CSS 변수 기반 테마를 사용하는 프로젝트에서는 `@theme` 블록이 `globals.css`에 존재해야 하며, `bg-primary`, `bg-muted` 등 유틸리티 클래스가 CSS 변수를 올바르게 참조하는지 빌드 후 런타임에서 검증해야 한다"**
2. Verify Phase에서 UI Feature의 경우 최소 1개 interactive 요소의 computed style을 확인 (예: `getComputedStyle(switch).backgroundColor !== 'rgba(0, 0, 0, 0)'`)
3. Implement 단계에서 shadcn/ui 컴포넌트 추가 시 `@theme` 매핑 유무를 자동 확인하는 규칙

### Workaround
`globals.css`에 `@theme inline` 블록을 추가하고, CSS 변수를 `hsl()` 함수로 감싼 중간 변수(`--color-primary-val`)로 매핑. 기존 코드와의 호환성을 위해 legacy 변수도 유지.

### Suggested Fix
1. `smart-sdd/domains/concerns/gui.md` 또는 `_core.md`에 S7 Bug Prevention 규칙 추가:
   - "**Tailwind CSS 4 Theme Mapping**: 프로젝트가 Tailwind CSS 4 + CSS 변수 테마를 사용하는 경우, `@theme` 블록이 필수. `bg-primary` 등의 유틸리티가 `rgba(0,0,0,0)`을 반환하면 테마 매핑 누락. 런타임 스타일 검증 필수"
2. `verify-phases.md` Phase 3에 추가:
   - "GUI Feature verify 시 최소 1개 styled interactive 요소의 `getComputedStyle().backgroundColor`가 `transparent`/`rgba(0,0,0,0)`이 아닌지 확인"
3. `injection/implement.md` Pattern Constraints Injection에 추가:
   - "shadcn/ui 컴포넌트를 새로 추가하는 Feature에서는 `@theme` 블록에 해당 컴포넌트가 사용하는 색상 토큰이 매핑되어 있는지 확인"

---

## F005 파이프라인 교훈 — 종합 정리 (SKF-037~044 통합)

> F005 chat-conversation 구현 과정에서 발견된 모든 문제를 근본 원인별로 분류하고,
> spec-kit-skills의 어느 파일을 어떻게 보강해야 재발을 방지하는지 정리한다.
> 개별 증상이 아닌 **파이프라인 구조의 gap** 중심으로 기술한다.

### F005에서 발생한 문제 목록

| # | 증상 | 근본 원인 | 발견 시점 |
|---|------|----------|----------|
| 1 | UI 구조가 cherry-studio와 완전히 다름 (고정 3-panel vs 동적 탭 전환) | reverse-spec에서 컴포넌트 트리를 추출하지 않음, implement에서 source 코드를 읽지 않음 | verify 후 사용자 지적 |
| 2 | 모델 선택 UI가 없어 채팅 불가 (ModelSelector 컴포넌트 자체 부재) | analyze가 FR을 요소 단위로 분해하지 않아 "model selector dropdown" 누락을 감지 못함 | verify 후 사용자 지적 |
| 3 | AI SDK가 /responses 엔드포인트로 요청 (404) | AI SDK v6에서 기본 API가 Responses API로 변경됨. `.chat()` 명시 필요. source app 참조했으면 발견 가능 | 사용자 채팅 시도 |
| 4 | baseURL에 /v1 누락 (404) | provider.apiHost가 'https://api.openai.com'이고 SDK가 /v1을 자동 추가 안 함 | 사용자 채팅 시도 |
| 5 | API 키가 저장 안 된 것처럼 보임 | useProviderStore에 hydrate() 없음 — localStorage만 읽고 main process에 안 물어봄 | verify 후 사용자 지적 |
| 6 | streaming block이 앱 재시작 시 사라짐 | flushStreamingBlocks가 UPDATE-only (INSERT 안 함) | 코드 리뷰 |
| 7 | fontSize: 22에서 화면 짤림/이중 스크롤 | flex 컨테이너에 min-h-0 누락 | 사용자 환경 Playwright |
| 8 | TipTap editor.view.dom crash | useEffect에서 editor view 접근 시 미초기화 | Playwright 스크린샷 |
| 9 | Playwright 격리 환경과 사용자 환경의 결과가 다름 | _electron.launch는 빈 userData 사용, 사용자 persist data 미반영 | 사용자 지적 |
| 10 | F004 verify 통과했으나 F005에 제공할 인터페이스가 동작 안 함 | verify에서 Provides 인터페이스를 downstream 관점으로 검증하지 않음 | F005 개발 중 발견 |

---

## [SKF-037] reverse-spec에서 source app의 컴포넌트 계층 구조(Component Tree)를 추출하지 않음

- **Trigger**: B (사용자 지적)
- **Phase**: reverse-spec → implement (파이프라인 전체에 영향)
- **Category**: MISSING_RULE
- **Severity**: Critical
- **Timestamp**: 2026-03-17

### Skill Trace
- **File**: `reverse-spec/commands/analyze.md` — Phase 2 (Feature별 pre-context 생성)
- **Rule**: pre-context에 Source Reference(파일 목록), SBI(함수 단위 행동), UI Component Features(라이브러리 매핑)를 기록하는 규칙은 있으나, **컴포넌트 간 부모-자식 관계, 조건부 렌더링 분기, 패널 시스템 구조를 기록하는 규칙이 없음**

### Problem
pre-context.md가 "파일 목록 + 함수 단위 SBI"만 기록하고, 컴포넌트가 어떻게 **조립**되는지(계층, 조건 분기, 공유 상태)를 기록하지 않는다. 결과: plan이 source 구조를 모르고 독자적 아키텍처를 설계하고, implement가 source 코드를 읽지 않고 FR 텍스트만으로 구현한다.

F005 사례: cherry-studio HomePage는 `Navbar(조건부) → HomeTabs(Assistants/Topics 탭 전환) → Chat(ChatNavBar+Messages+Inputbar) → TopicSidebar(조건부)`라는 계층 구조인데, pre-context에는 이 구조가 없어 angdu-studio가 "고정 3-panel"로 구현됨.

### Suggested Fix
`reverse-spec/commands/analyze.md` Phase 2에 **Component Tree Extraction** 추가:

```markdown
## Component Tree (pre-context.md에 추가할 섹션)

reverse-spec Phase 2에서 GUI Feature의 pre-context 생성 시:
1. source app의 주요 페이지(route)별 컴포넌트 계층 구조를 추출
2. 조건부 렌더링 분기(설정에 따라 달라지는 구조)를 명시
3. 공유 state/context 의존성을 기록
4. pre-context.md "## Component Tree" 섹션에 들여쓰기 트리 형태로 기록

예시:
HomePage
├── Navbar (conditional: navbarPosition='left')
├── HomeTabs (left sidebar)
│   ├── Tab: Assistants → AssistantsTab
│   └── Tab: Topics → TopicsTab (conditional: topicPosition='left')
└── Chat
    ├── ChatNavBar
    │   ├── AssistantName (click → settings popup)
    │   ├── SelectModelButton (model selector dropdown)
    │   └── Tools (settings, search)
    ├── Messages (virtual scroll)
    │   └── MessageItem → BlockRenderer → [Text, Code, Thinking, ...]
    ├── Inputbar (TipTap + 14 toolbar buttons)
    └── TopicSidebar (conditional: topicPosition='right')

이 트리가 plan/implement의 구조적 기준선(baseline)이 된다.
```

이 섹션이 있으면 plan 단계에서 "source에 SelectModelButton이 있는데 target plan에 없다"를 즉시 감지할 수 있다.

---

## [SKF-038] plan에서 source→target 컴포넌트 매핑을 강제하지 않아 핵심 컴포넌트가 누락됨

- **Trigger**: B (사용자 지적)
- **Phase**: plan → tasks → implement
- **Category**: MISSING_RULE
- **Severity**: Critical
- **Timestamp**: 2026-03-17

### Skill Trace
- **File 1**: `injection/plan.md` — plan.md 생성 시 file structure 섹션
- **Rule**: plan이 "Project Structure" 파일 트리를 생성하지만, **source app의 어떤 컴포넌트가 target의 어떤 컴포넌트에 대응하는지 매핑하는 규칙이 없음**
- **File 2**: `injection/analyze.md` — FR→Task coverage 검증
- **Rule**: FR 단위로만 매핑하고 **FR 내부의 기능적 요소(model selector dropdown 등)를 분해하지 않음**

### Problem
plan이 source 구조를 참조하지 않고 독자적 파일 트리를 설계할 수 있다. 또한 analyze가 "ChatHeader 태스크가 FR-003을 언급함 = covered"로 판정하여, FR-003의 3개 요소 중 "model selector dropdown"이 누락된 것을 감지하지 못했다.

### Suggested Fix

**1. `injection/plan.md`에 Source Component Mapping Table 추가 (rebuild 모드, BLOCKING)**:

```markdown
## Source → Target Component Mapping (plan.md 필수 섹션)

rebuild 모드에서 plan.md 생성 시:
1. pre-context.md의 Component Tree에서 source 컴포넌트 목록 추출
2. 각 source 컴포넌트에 대응하는 target 컴포넌트를 plan의 file structure에서 매핑
3. 1:1 매핑이 안 되는 경우 "merged into X" 또는 "deferred to F00N" 사유 기록

| Source Component | Source File | Target Component | Target File | Notes |
|---|---|---|---|---|
| HomeTabs | Tabs/index.tsx | HomeSidebar | HomeSidebar.tsx | Tab switcher 유지 |
| SelectModelButton | SelectModelButton.tsx | ModelSelector | ModelSelector.tsx | Popover 구현 |
| Inputbar | Inputbar.tsx | MessageInput | MessageInput.tsx | TipTap + toolbar |

plan Review에서 source 컴포넌트 중 target 매핑이 없고 사유도 없는 항목이 있으면 BLOCKING.
```

**2. `injection/analyze.md`에 FR Element Decomposition 추가**:

```markdown
FR→Task 매핑 시 FR을 기능적 요소로 분해:
- FR 설명에서 "," 또는 "and"로 구분된 각 기능을 개별 요소로 분리
- "selector", "dropdown", "picker" 등 interactive 키워드가 있으면
  대응하는 Interaction Chain + tasks.md 태스크가 반드시 존재해야 함
- 요소 하나라도 누락이면 HIGH gap (전체 FR이 아닌 요소 단위)
```

---

## [SKF-039] implement에서 source 코드를 읽지 않고 구현 + SDK API 버전 차이를 감지 못함

- **Trigger**: B (사용자 지적)
- **Phase**: implement
- **Category**: MISSING_RULE
- **Severity**: Critical
- **Timestamp**: 2026-03-17

### Skill Trace
- **File**: `injection/implement.md` — § Source Reference Injection
- **Rule**: "Read Source Path → Before each task, identify relevant source files → inject as reference context" — 규칙은 존재하지만 **BLOCKING gate가 아니라 가이드라인**. 에이전트가 건너뛸 수 있음

### Problem
3가지 연쇄 실패:

1. **Source 코드 미참조**: implement agent가 cherry-studio의 HomePage.tsx, Chat.tsx, SelectModelButton.tsx 등을 한 번도 읽지 않고 FR 텍스트만으로 독자적 UI를 구현. Source Reference Injection이 가이드라인이라 건너뜀
2. **AI SDK v6 API 변경 미감지**: `@ai-sdk/openai` v3에서 `createOpenAI()(modelId)`가 Responses API(`/responses`)를 기본 사용하도록 변경됨. source app (cherry-studio)의 코드를 읽었으면 `.chat()` 사용 패턴을 발견했을 것
3. **데이터 왕복 미검증**: streaming block을 in-memory에서 DB로 flush할 때 UPDATE-only 사용 (INSERT 없음). source app의 persist 패턴을 참조했으면 UPSERT 패턴을 사용했을 것

### Suggested Fix

**1. Source Reference Injection을 BLOCKING Gate로 승격**:

```markdown
injection/implement.md 수정:

rebuild 모드 UI 태스크 실행 시 (BLOCKING):
1. BEFORE writing code: plan.md의 Source→Target Mapping에서 이 태스크에 대응하는 source 파일을 읽음
2. "📂 Source Reference: [file1, file2] loaded" 메시지 없는 UI 태스크는 BLOCKING 위반
3. source의 구조, props, state, 외부 SDK 사용법을 파악 후 new-stack 패턴으로 재구현
4. AFTER writing: source에 있는 기능이 target에서 누락되면 → 사유 필수 기록
```

**2. SDK Migration Awareness를 implement에서도 실행**:

```markdown
injection/implement.md 수정:

plan.md에 SDK 버전이 명시된 경우, implement 첫 태스크 전에:
1. package.json의 실제 설치 버전 확인
2. plan에 명시된 버전과 다르면 → HARD STOP (breaking change 확인)
3. source app의 SDK 사용 패턴을 확인하여 migration 필요 여부 판단
특히 AI SDK, UI 라이브러리 등 API가 자주 변경되는 의존성에 주의
```

**3. 데이터 왕복 검증 규칙 추가**:

```markdown
injection/implement.md § Pattern Constraints에 추가:

"In-memory → DB flush" 패턴 사용 시:
- flush가 INSERT인지 UPDATE인지 명시적으로 구분
- 새로 생성된 엔티티의 flush는 반드시 UPSERT
- "생성 → persist → reload → 동일 데이터 확인" 라운드트립 검증 필수
```

---

## [SKF-040] verify가 Playwright 격리 환경에서만 테스트하고 사용자 실제 환경을 검증하지 않음

- **Trigger**: B (사용자 지적)
- **Phase**: verify
- **Category**: MISSING_RULE + WRONG_ASSUMPTION
- **Severity**: Critical
- **Timestamp**: 2026-03-17

### Skill Trace
- **File**: `verify-phases.md` — Phase 3 SC Verification
- **Rule**: Playwright `_electron.launch()`로 검증하되, **이 환경이 사용자 환경과 다르다는 경고가 없음**. 또한 Playwright 설정이 없을 때 skip 가능한 경로가 열려 있음

### Problem
4가지 환경 차이로 인한 false positive:

1. **격리된 userData**: Playwright는 빈 상태에서 시작 → persist된 API 키, 모델, 설정이 없음
2. **기본 설정만 테스트**: fontSize:14(기본)에서만 검증 → fontSize:22(사용자 설정)에서 레이아웃 깨짐 미감지
3. **빌드 캐시**: `pnpm run build`가 이전 결과를 재사용 → 코드 변경이 반영 안 됨 (`rm -rf out/` 필요)
4. **Playwright 설정 부재 시 skip**: playwright.config.ts가 없으면 에이전트가 "설정 없으니 skip" 선택 가능

### Suggested Fix

```markdown
verify-phases.md Phase 3 수정:

## Playwright 검증 프로토콜 (BLOCKING)

### Setup Gate (Phase 3 시작 전)
1. playwright.config.ts 없으면 → 자동 생성 (Electron: _electron.launch 패턴)
2. 이전 Feature verify Notes 읽기 → 동일 Playwright 접근 방식 적용
3. "Playwright 없으니 skip"은 BLOCKING 위반

### Dual-Mode Verification (양쪽 모두 통과 필요)

A. 격리 환경 (_electron.launch):
   - `rm -rf out/ && pnpm run build` (캐시 방지)
   - 빈 상태에서 기본 렌더링 + 기능 확인

B. 사용자 환경 시뮬레이션 (_electron.launch + --user-data-dir):
   - 사용자의 실제 userData 경로로 실행
   - persist된 데이터(API 키, 모델, 설정)가 있는 상태에서 검증
   - fontSize를 극단값(12, 24)으로 변경 후 레이아웃 확인
   - Provider에 저장된 API 키로 모델 선택 → 채팅 전송 → 응답 확인

C. Demo 실행:
   - 데모 스크립트를 --ci 모드로 실제 실행 (파일 존재 ≠ 실행 가능)
```

---

## [SKF-041] Feature verify에서 Provides 인터페이스를 downstream 관점으로 검증하지 않음

- **Trigger**: B (사용자 지적)
- **Phase**: verify (Feature 경계)
- **Category**: MISSING_RULE
- **Severity**: Critical
- **Timestamp**: 2026-03-17

### Skill Trace
- **File**: `verify-phases.md` — Phase 2 Cross-Feature Verification
- **Rule**: "현재 Feature가 이전 Feature를 올바르게 소비하는가"만 검증하고, **"이전 Feature가 약속한 인터페이스를 실제로 제공하는가"는 검증하지 않음**

### Problem
F004 verify가 "Build ✅, Playwright UI ✅ (33 switches)"로 통과했지만, F005에 제공해야 하는 3개 인터페이스가 모두 동작하지 않았다:
- provider store hydrate() 부재 → F005에서 모델 목록 빈 배열
- ai:chat SDK API 변경 → /responses 404
- baseURL /v1 누락 → 404

또한 renderer store가 main process IPC로 데이터를 저장하는 경우 hydrate() 메서드가 필수인데, 이를 강제하는 규칙이 없었다.

### Suggested Fix

```markdown
verify-phases.md Phase 2에 추가:

## Provides Interface Verification (BLOCKING)

Feature verify 시 plan.md Integration Contracts의 "Provides →" 항목을 모두 검증:

1. 각 Provides 인터페이스에 대해 downstream Feature 관점의 소비 시나리오 실행
   - IPC 호출 → 올바른 데이터 반환 확인
   - Store hydrate → renderer에 데이터 표시 확인
   - API 호출 → 200 응답 확인

2. persist 의존 인터페이스는 앱 재시작 후 지속성 확인
   - "저장 → 종료 → 재시작 → downstream에서 데이터 접근 가능" 라운드트립

3. renderer store + main process 이중 저장 패턴:
   - renderer store에 hydrate() 있는지 확인
   - App 초기화에서 hydrate() 호출 확인

4. 하나라도 실패 → merge BLOCKING

Merge Checkpoint에 Provides Interface Readiness 항목 추가:
"이 Feature의 Provides 인터페이스가 downstream에서 소비 가능한 상태인가?"
```

- **Trigger**: B (사용자 지적) — "playwright 검증을 한건가?", "지금 제대로 데모가 동작도 안", "Playwright MCP로 electron도 검증이 가능함에도 안된다고 가정한 이유도 분석"
- **Phase**: smart-sdd verify Phase 3 (F005-chat-conversation)
- **Category**: MISSING_RULE + WRONG_ASSUMPTION (복합)
- **Severity**: Critical (pipeline 중단)
- **Timestamp**: 2026-03-16 22:30

### Skill Trace
- **File 1**: `.claude/skills/smart-sdd/commands/verify-phases.md` — Phase 3 Functional SC Verification에 Playwright 실행이 명시되어 있으나, "Playwright 설정이 없을 때 자동 생성" 규칙이 없어 에이전트가 skip 가능
- **File 2**: `.claude/skills/smart-sdd/SKILL.md` — Prerequisites에 "Playwright must be installed. CLI mode uses `_electron.launch()`. MCP mode still requires CDP pre-configuration"이라고 명시
- **File 3**: `.claude/skills/smart-sdd/reference/injection/verify.md` — Phase 3 SC Verification이 implement 다음 단계에서 실행되어야 하지만, "설정 부재 시 어떻게 하는가"에 대한 가이드 없음
- **Rule**: N/A — 다음 규칙들이 모두 부재:
  1. Playwright 설정 부재 시 자동 생성 규칙
  2. Electron 프로젝트에서 Playwright MCP 사용 가능성 명시
  3. 이전 Feature verify 경험 참조 규칙
  4. 데모 스크립트 실제 실행 검증 규칙
  5. implement agent의 "build passes" ≠ "feature works" 구분 규칙

### Problem
5개 skill 파일의 구조적 gap이 연쇄하여 "build ✅ + TS ✅"만으로 implement/verify 모두 통과되었으나, 실제 앱은 에러 바운더리에 걸려 동작하지 않았다.

- `injection/implement.md`: "Build passes" 외에 **런타임 렌더링 확인 규칙 부재** → 40+ 파일 생성했으나 TipTap crash로 전혀 렌더링 안 됨
- `verify-phases.md`: Playwright 설정 부재 시 **자동 생성/BLOCKING 규칙 부재** → "설정 없으니 skip" 경로 선택
- `SKILL.md` Prerequisites: Electron에서 Playwright MCP 접근 가능성이 **명시적이지 않음** → "웹 전용" 가정
- `verify-phases.md` Phase 4: 데모 스크립트 **실제 실행 규칙 부재** → "파일 존재 = 완료" 판정
- `verify-phases.md`: 이전 Feature verify 경험 **참조 규칙 부재** → F003/F004에서 성공한 Playwright 접근 방식이 전달 안 됨

### Expected
1. **implement 완료 기준**에 "최소 1회 앱 실행 + 해당 Feature UI 렌더링 확인" 추가
2. **verify Phase 3**에 Playwright 설정 자동 생성 BLOCKING 게이트:
   - playwright.config.ts 없으면 → 자동 생성
   - Electron: `_electron.launch` 또는 dev server URL로 MCP 접근
   - 테스트 파일 없으면 → SC 기반 최소 검증 테스트 자동 생성
   - "설정이 없으니 skip" 경로 차단
3. **verify Phase 3**에 이전 Feature verify 참조 규칙:
   - "sdd-state.md Feature Detail Log에서 이전 Feature의 verify Notes를 읽고 동일한 Playwright 접근 방식 적용"
4. **verify Phase 4 Demo**에 "실제 실행" 규칙:
   - 데모 스크립트를 `--ci` 모드로 실행하여 exit code 확인
   - 파일 존재만 확인하는 것은 불충분
5. **Electron 프로젝트 Playwright 규칙** 명시:
   - Dev server URL은 항상 웹 브라우저로 접근 가능 → "웹 전용" 가정 금지
   - Playwright MCP `browser_navigate(devServerUrl)` → SC 검증 가능

**4. Cherry-studio와 화면 구조 차이**
Cherry-studio의 HomePage는 동적 패널 시스템(topicPosition left/right 전환, 좌측 Assistants↔Topics 탭 전환, NavBar position left/top)인 반면, F005 implement agent는 고정 3-panel 레이아웃(좌=Assistants, 중=Chat, 우=Topics)을 생성했다. 이 차이는 source reference를 읽지 않았거나, pre-context.md의 Interaction Behavior Inventory를 충분히 반영하지 않은 결과이다.

원인: implement agent가 source app의 런타임 구조를 확인하지 않고 spec의 FR-001("flexible layout with togglable panels")을 자의적으로 해석. Cherry-studio의 패널 전환 로직(showAssistants/showTopics/topicPosition)은 pre-context에 기술되었으나 implement 시 참조되지 않았다.

### Workaround
사용자 지적 후 TipTap `editor.view.dom` 에러를 수정하고 Playwright E2E로 전체 UI 렌더링을 검증. 화면 구조 차이는 향후 iteration에서 보완 예정.

### Suggested Fix
1. `verify-phases.md` Phase 3 앞에 **Playwright Setup Gate** 추가 (BLOCKING):
   ```
   Phase 3 시작 전:
   1. playwright.config.ts 존재? → 없으면 자동 생성
   2. Electron 프로젝트: _electron.launch 또는 dev server URL 접근 경로 확인
   3. 이전 Feature verify Notes 읽기 → 동일 Playwright 접근 방식 적용
   4. SC 기반 최소 검증 테스트 자동 생성
   5. 테스트 1개라도 실행 확인 → 실패 시 HARD STOP
   "Playwright 설정 없으니 skip"은 BLOCKING 위반
   ```
2. `injection/implement.md` Post-Implement Verification에 추가:
   - "Build 통과 외에 최소 1회 앱 실행 + 해당 Feature UI가 DOM에 렌더링되는지 확인 (Playwright MCP snapshot 또는 dev server HTML 확인)"
3. `domains/interfaces/gui.md` S6 UI Testing에 추가:
   - "Electron 앱의 렌더러 UI는 dev server URL(`localhost:5173`)을 통해 Playwright MCP로 검증 가능. '웹 전용'이라는 가정 금지"
4. `verify-phases.md` Phase 4에 추가:
   - "Demo 스크립트는 --ci 모드로 실제 실행하여 exit code 0 확인. 파일 존재 ≠ 실행 가능"
5. `verify-phases.md`에 **이전 Feature 참조 규칙** 추가:
   - "현재 Feature verify 시작 시 sdd-state.md Feature Detail Log에서 직전 Feature의 verify Notes를 읽고, 사용된 검증 도구/방법/경로를 현재 Feature에 동일하게 적용"

---

## [SKF-038] Implement agent가 source reference를 읽지 않고 독자적 UI 구조를 생성 — cherry-studio와 완전히 다른 레이아웃

- **Trigger**: B (사용자 지적) — "UI 구조는 cherry studio와 완전히 달라", "chat 화면 구조도 cherry studio와 다른 이유도 분석"
- **Phase**: smart-sdd implement (F005-chat-conversation)
- **Category**: MISSING_RULE
- **Severity**: Critical (pipeline 중단)
- **Timestamp**: 2026-03-16 23:45

### Skill Trace
- **File**: `.claude/skills/smart-sdd/reference/injection/implement.md` — § Source Reference Injection
- **Rule**: "Read Source Path from sdd-state.md → Resolve each file → Before each task, identify relevant source files → inject as reference context" — 규칙은 존재하지만 **에이전트가 실행하지 않음**
- **Line**: implement.md L63-80

### Problem
`injection/implement.md` § Source Reference Injection에 "Read Source Path → Resolve each file → inject as reference context" 규칙이 존재하지만, **실행 강제 게이트가 없어** 에이전트가 source 파일을 한 번도 읽지 않고 FR 목록만으로 독자적 UI를 구현했다.

결과: cherry-studio의 동적 패널 시스템(topicPosition 전환, 탭 전환, Navbar position, Framer Motion, SelectModelPopup)이 고정 3-panel + 최소 ChatHeader로 대체됨. 특히 SelectModelPopup(70+줄)이 아예 없어 모델 선택 자체가 불가능했음.

### Expected
1. **implement 시작 전 Source Reference Gate** (BLOCKING):
   - rebuild 모드 + Source Path ≠ N/A인 경우, implement의 첫 UI 태스크 전에:
   - pre-context.md Source Reference의 모든 파일을 실제로 읽고
   - 현재 Feature의 주요 컴포넌트에 대응하는 source 파일 목록을 생성
   - "Source Reference: [N] files loaded" 표시
   - 이 게이트를 건너뛰면 BLOCKING — AskUserQuestion으로 HARD STOP
2. **implement agent에 source code injection 의무화**:
   - UI 컴포넌트 태스크마다 대응하는 source 파일을 context에 포함
   - 예: "ChatHeader 구현" 태스크 → cherry-studio ChatNavBar/index.tsx + TopicContent.tsx + SelectModelButton.tsx를 읽고 참조
3. **post-implement 구조 비교 게이트**:
   - implement 완료 후, source와 target의 컴포넌트 구조를 비교하는 체크리스트:
   - "source에 있는 SelectModelPopup이 target에도 존재하는가?"
   - "source에 있는 Tab 전환이 target에서 처리되는가?"

### Workaround
사용자가 직접 문제를 발견하여 피드백. Regression to implement 필요.

### Suggested Fix
1. `injection/implement.md` § Source Reference Injection에 **BLOCKING Gate** 추가:
   ```
   rebuild 모드 첫 UI 태스크 전:
   1. pre-context.md Source Reference 파일 목록 읽기
   2. 각 source 파일을 실제로 열고 컴포넌트 구조 파악
   3. "Source Reference Gate: [N] files loaded, [M] components mapped"
   4. 이 게이트 미통과 시 implement 불가
   ```
2. `injection/implement.md`에 **Per-Task Source Injection** 의무화:
   ```
   UI 컴포넌트 태스크 실행 시:
   1. 태스크 대상 컴포넌트와 대응하는 source 파일 식별
   2. source 파일 읽기 (최대 3개)
   3. "📂 Source Reference: [file1, file2] loaded for this task"
   4. source의 구조를 new-stack 패턴으로 재구현 (복사 아님)
   ```
3. `injection/implement.md`에 **Post-Implement Component Audit** 추가:
   ```
   모든 UI 태스크 완료 후:
   1. pre-context Source Reference의 모든 컴포넌트를 나열
   2. target에 대응 컴포넌트가 있는지 확인
   3. 누락된 컴포넌트 목록 → BLOCKING (누락 이유가 정당하지 않으면 implement 재실행)
   ```

---

## [SKF-039] Implement agent가 FR-003 (model selector)을 건너뜀 — 채팅의 핵심 기능인 모델 선택이 불가능

- **Trigger**: B (사용자 지적) — "모델을 선정할수 없어서 채팅을 해도 답이 오지 않아"
- **Phase**: smart-sdd implement (F005-chat-conversation)
- **Category**: MISSING_RULE
- **Severity**: Critical (pipeline 중단)
- **Timestamp**: 2026-03-16 23:45

### Skill Trace
- **File**: `.claude/skills/smart-sdd/reference/injection/implement.md` — § Interaction Chains Injection
- **Rule**: "When a task implements a handler, the agent MUST also implement the full chain: Store Mutation → DOM Effect → Visual Result" — Interaction Chains에 FR-003이 포함되지 않았고, tasks.md에도 ModelSelector 컴포넌트 태스크가 없음
- **Line**: N/A

### Problem
`injection/analyze.md` § Coverage Severity Rules가 **FR 단위로만 매핑**하고 FR 내부의 **기능적 요소 단위로 분해하지 않음**. FR-003은 "assistant name, model selector **dropdown**, topic info" 3개 요소를 포함하지만, analyze는 "ChatHeader 태스크가 FR-003을 언급함" = covered로 판정.

결과: plan→tasks→implement 전체에서 model selector가 누락됨 — plan에 파일 없음, tasks에 태스크 없음, Interaction Chains에 체인 없음. 채팅의 핵심 기능인 모델 선택이 불가능해짐.

### Expected
1. **analyze 단계의 FR→Task 매핑이 기능적 요소 단위로 분해**되어야 함:
   - FR-003: "chat header" = ✅, "assistant name" = ✅, "model selector **dropdown**" = ❌, "topic info" = ✅
   - 기능적 요소 중 하나라도 누락이면 HIGH gap (현재는 FR-003이 "covered"로 판정됨)
2. **plan의 file structure에 필요한 모든 interactive 컴포넌트가 나열**되어야 함:
   - SelectModelPopup이 Interaction Chains에 없으면 plan Review에서 블로킹

### Workaround
없음 — 사용자가 수동 개입하여 발견. Regression to implement 필요.

### Suggested Fix
1. `injection/analyze.md` § Coverage Severity Rules에 추가:
   ```
   FR의 기능적 요소 분해:
   - FR 설명에서 "and" 또는 ","로 구분된 각 기능을 개별 요소로 분리
   - 각 요소에 대해 tasks.md에 대응 태스크가 있는지 확인
   - 하나라도 누락이면 HIGH gap (전체 FR이 아닌 요소 단위)
   예: FR-003 "assistant name, model selector dropdown, topic info"
       → 3개 요소 중 "model selector dropdown" 누락 = HIGH
   ```
2. `injection/plan.md` § Interaction Chain Verification에 추가:
   ```
   FR에 "selector", "dropdown", "picker", "chooser" 등 interactive 키워드가 있으면
   해당 FR에 대응하는 Interaction Chain이 plan.md에 반드시 존재해야 함.
   없으면 BLOCKING — plan 수정 후 진행.
   ```

---

## [SKF-040] Implement agent가 streaming block을 DB에 INSERT하지 않고 UPDATE만 시도 — 채팅 응답이 사라짐

- **Trigger**: B (사용자 지적) — "채팅도 실패하고"
- **Phase**: smart-sdd implement (F005-chat-conversation)
- **Category**: MISSING_RULE
- **Severity**: Critical (pipeline 중단)
- **Timestamp**: 2026-03-17 01:00

### Skill Trace
- **File**: `.claude/skills/smart-sdd/reference/injection/implement.md` — § Post-Implement Verification
- **Rule**: "Build 통과 외에 최소 1회 앱 실행 + 해당 Feature UI가 DOM에 렌더링되는지 확인" — 이 규칙이 있었으면 streaming 후 reload 시 block 소실을 발견했을 것. 현재는 규칙 부재.
- **Line**: N/A (규칙 자체가 없음)

### Problem
`injection/implement.md`에 **데이터 왕복(round-trip) 검증 규칙이 없음**. implement agent가 `useBlockStore.flushStreamingBlocks()`를 `chat:updateBlocksBatch` (SQL UPDATE)로 구현했지만, streaming block은 `setStreamingBlock()`으로 in-memory에만 생성되고 DB에는 INSERT되지 않았음. UPDATE는 존재하지 않는 row에 대해 no-op. 결과: AI 응답이 streaming 중에는 보이지만 앱 재시작 시 사라짐.

### Expected
`injection/implement.md`에 **데이터 persist 왕복 검증** 규칙 추가:
- "DB에 write하는 모든 코드 경로에 대해, write → read → 동일성 확인 패턴이 태스크에 포함되어야 함"
- "특히 in-memory cache → DB flush 패턴은 INSERT vs UPDATE 구분이 필수. UPDATE-only flush는 새로 생성된 데이터를 잃음"

### Workaround
`upsertBlocksBatch` 메서드 추가: 각 block의 DB 존재 여부를 확인 후 INSERT/UPDATE 분기.

### Suggested Fix
1. `injection/implement.md` § Pattern Constraints Injection에 추가:
   ```
   "In-memory → DB flush" 패턴 사용 시:
   - flush가 INSERT인지 UPDATE인지 명시적으로 구분
   - 새로 생성된 엔티티의 flush는 반드시 INSERT (또는 UPSERT)
   - UPDATE-only flush는 기존 row가 반드시 존재하는 경우에만
   ```
2. `verify-phases.md` Phase 1에 추가:
   ```
   데이터 persist 왕복 검증:
   - 앱 실행 → 데이터 생성 → 앱 종료 → 앱 재시작 → 데이터 존재 확인
   - streaming feature는 특히: stream → flush → reload → 동일 데이터 확인
   ```

---

## [SKF-041] F004 provider store에 hydrate()가 없어 API 키가 persist 안 되는 것처럼 보임

- **Trigger**: B (사용자 지적) — "openAI API는 계속 저장이 안되어있어"
- **Phase**: smart-sdd verify (F005-chat-conversation, F004-model-provider 교차)
- **Category**: MISSING_RULE
- **Severity**: Critical (pipeline 중단)
- **Timestamp**: 2026-03-17 02:00

### Skill Trace
- **File**: `.claude/skills/smart-sdd/reference/injection/implement.md` — § Integration Contract 검증 규칙
- **Rule**: Integration Contracts에 "Consumes ← F004 useProviderStore"가 정의되었으나, **provider store가 main process와 동기화되는지 검증하는 규칙이 없음**
- **Line**: N/A

### Problem
F004 implement에서 `useProviderStore`에 `hydrate()` 메서드를 추가하지 않았다. API 키는 main process safeStorage에 정상 저장되지만, renderer store는 localStorage에서만 로드하고 main process에 물어보지 않았다. localStorage의 `partialize`가 `apiKey: ''`로 저장하므로 앱 재시작 시 API 키가 비어 보임.

근본 원인: F004 implement/verify에서 "앱 재시작 후에도 API 키가 표시되는가" 라운드트립 검증이 없었음.

### Expected
`injection/implement.md`에 **Cross-Feature Store Hydration 검증** 규칙 추가:
- "main process에 데이터를 저장하는 renderer store는 반드시 hydrate() 메서드가 있어야 하며, App 초기화 시 호출되어야 함"
- "localStorage persist와 main process store가 공존하는 경우, 앱 재시작 후 main process 데이터가 renderer에 반영되는지 검증"

### Workaround
`useProviderStore.hydrate()` 추가 + App.tsx에서 호출. API 키 입력 필드에 `key` prop 추가로 re-render 강제.

### Suggested Fix
`injection/implement.md`에 추가:
```
IPC 기반 persist 패턴 검증:
- renderer store가 main process IPC로 데이터를 저장하는 경우
- 반드시 hydrate() 메서드가 있어야 함
- App 초기화 시 hydrate() 호출 확인
- "저장 → 앱 종료 → 재시작 → 데이터 표시" 라운드트립 테스트
```

---

## [SKF-042] Feature가 downstream Feature에 제공하는 인터페이스를 verify 시 검증하지 않음 — F004→F005 의존성 체인 전체 실패

- **Trigger**: B (사용자 지적) — "그 전의 feature가 다른 feature에 의존성을 주는 부분은 확실히 검증을 하고 넘어가게 해야하는 것도 있지?"
- **Phase**: smart-sdd verify (F004-model-provider → F005-chat-conversation 교차)
- **Category**: MISSING_RULE
- **Severity**: Critical (pipeline 중단)
- **Timestamp**: 2026-03-17 02:30

### Skill Trace
- **File 1**: `.claude/skills/smart-sdd/commands/verify-phases.md` — Phase 2 Cross-Feature Verification
- **Rule**: Phase 2에 "Cross-feature integration check"이 있으나, **이전 Feature가 제공하는 인터페이스의 downstream 소비자 관점 검증 규칙이 없음**. 현재 규칙은 "현재 Feature가 이전 Feature를 올바르게 소비하는가"만 검증하고, "이전 Feature가 약속한 인터페이스를 실제로 제공하는가"는 검증하지 않음
- **File 2**: `.claude/skills/smart-sdd/reference/injection/verify.md` — Integration Contract 검증
- **Rule**: Integration Contracts의 "Provides →" 방향 검증 규칙 부재. plan.md에 "Provides → F005-chat" 로 기술되어 있지만, F004 verify 시 이 인터페이스가 실제로 동작하는지 테스트하지 않음
- **Line**: verify-phases.md Phase 2, injection/verify.md Post-Step

### Problem
F004 verify가 통과했지만, F004가 F005에 제공해야 하는 3개 핵심 인터페이스가 실제로 동작하지 않았다:

1. **Provider store hydrate()**: F004가 provider 데이터를 main process에 저장하지만, renderer에서 hydrate하는 경로가 없었음 → F005의 ModelSelector가 빈 목록 표시
2. **Model list (provider.models[])**: F004 Settings에서 API 키 저장 후 모델을 fetch해야 하지만, 이 flow가 앱 재시작 후에도 유지되는지 미검증 → F005에서 선택할 모델 없음
3. **ai:chat streaming**: F004의 AICoreService가 stream event를 발송하지만, 실제 provider API 키 + 모델 ID로 end-to-end 호출이 되는지 미검증 → F005에서 메시지 보내도 응답 없음

F004 verify Notes: "Build ✅, TS ✅, Playwright UI ✅ (33 switches, provider list, edit panel)". Playwright로 **UI 요소 존재**만 확인했고, **기능적 flow** (API 키 저장 → 모델 fetch → 모델 선택 → 채팅 가능)는 검증하지 않았다.

### Expected
verify-phases.md에 **Provides → Interface Verification Gate** 추가:

1. **Feature verify 시 plan.md Integration Contracts의 "Provides →" 항목을 모두 검증**:
   - 각 "Provides →" 인터페이스에 대해 downstream Feature 관점의 소비 시나리오를 실행
   - 예: F004 "Provides → F005-chat: ai:chat streaming" → verify에서 실제 ai:chat IPC 호출 + stream event 수신 검증
   - 예: F004 "Provides → F005-chat: Model Registry" → verify에서 모델이 1개 이상 존재하는지 확인

2. **앱 재시작 후 인터페이스 지속성 검증**:
   - Provides 인터페이스 중 persist 의존이 있는 것 (API 키, 모델 목록 등)은 앱 재시작 후에도 동작하는지 확인
   - "저장 → 종료 → 재시작 → downstream Feature 관점에서 데이터 접근 가능" 라운드트립

3. **merge 전 downstream readiness 체크리스트**:
   - Feature merge Checkpoint에 "이 Feature가 Provides하는 인터페이스가 downstream Feature에서 소비 가능한 상태인가?" 항목 추가
   - BLOCKING: Provides 인터페이스 중 하나라도 동작하지 않으면 merge 불가

### Workaround
F005 개발 중 발견하여 수동 수정. F004에 hydrate() 추가, upsertBlocksBatch 추가, ProviderEditPanel Input key prop 수정.

### Suggested Fix
1. `verify-phases.md` Phase 2에 **Provides Interface Verification** 추가:
   ```
   Feature verify Phase 2 — Cross-Feature:
   1. plan.md Integration Contracts에서 "Provides →" 항목 추출
   2. 각 Provides 항목에 대해:
      a. downstream Feature의 소비 관점에서 IPC/store/API 호출 테스트
      b. persist 의존이 있는 인터페이스는 앱 재시작 후 지속성 확인
      c. 결과를 verify Notes에 기록: "Provides → F005: ai:chat ✅, model registry ✅"
   3. 하나라도 실패 → BLOCKING (merge 불가)
   ```
2. `reference/branch-management.md` § Post-Feature Merge에 추가:
   ```
   Merge Checkpoint에 Provides Interface Readiness 항목:
   - "이 Feature의 Provides 인터페이스가 downstream에서 소비 가능한가?"
   - Integration Contracts의 Provides 항목별 검증 결과 표시
   ```
3. `injection/verify.md`에 추가:
   ```
   downstream Feature 관점 검증:
   - Provides 인터페이스의 consumer가 해당 데이터를 올바르게 받는지 시뮬레이션
   - main process persist → renderer hydrate → UI 표시 전체 경로
   - "이 Feature만 설치된 상태에서 downstream Feature가 import할 수 있는가"
   ```

---

## [SKF-043] Playwright E2E 테스트가 사용자의 실제 앱 환경과 다른 격리 환경에서 실행되어 false positive 생성

- **Trigger**: B (사용자 지적) — "너가 실행하는 데모랑 차이가 있는게 큰 문제 같아", "API키는 계속 내가 최근에 입력한게 아니고, 이상한 스크롤이 채팅화면에 생겨"
- **Phase**: smart-sdd verify Phase 3 (F005-chat-conversation)
- **Category**: WRONG_ASSUMPTION
- **Severity**: Critical (pipeline 중단)
- **Timestamp**: 2026-03-17 03:00

### Skill Trace
- **File**: `.claude/skills/smart-sdd/commands/verify-phases.md` — Phase 3 SC Verification
- **Rule**: "Playwright CLI uses `_electron.launch()`" — 이 규칙은 Electron 앱을 Playwright로 실행하는 방법을 명시하지만, **Playwright가 생성하는 격리 환경과 사용자의 실제 환경이 다르다는 점을 경고하지 않음**
- **Line**: SKILL.md Prerequisites

### Problem
Playwright `_electron.launch({ args: ['out/main/index.js'] })`는 다음 차이를 만든다:

1. **빌드된 코드 vs dev 모드**: Playwright는 `pnpm run build` 결과물(`out/`)을 실행. 사용자는 `pnpm run dev`(electron-vite dev, HMR 포함)를 실행. dev 모드에서만 발생하는 문제(HMR race condition, 미빌드 의존성 등)를 Playwright가 잡지 못함
2. **격리된 userData**: Playwright Electron 인스턴스는 새 userData 경로를 사용하므로 **사용자가 저장한 API 키, 모델 목록, 설정이 없음**. 에이전트의 테스트는 "빈 앱"에서 실행되어 항상 깨끗한 상태
3. **persist된 state 무시**: 사용자 환경에는 이전 세션의 localStorage (Zustand persist), electron-store (provider configs), SQLite (messages) 데이터가 있음. Playwright는 빈 상태에서 시작하므로 persist 관련 버그를 놓침
4. **CSS 렌더링 차이**: dev 모드의 Tailwind CSS는 JIT로 동적 생성, 빌드 모드는 정적 추출. 스크롤/레이아웃 차이 가능

결과: Playwright 10/10 pass이지만 사용자 환경에서는 (1) API 키가 보이지 않고, (2) 이상한 스크롤이 생기고, (3) 채팅이 안 됨.

### Expected
verify-phases.md에 **실제 사용자 환경 검증** 규칙 추가:

1. **Playwright 검증은 "격리 환경 검증"으로 명시**: 깨끗한 상태에서의 기본 기능 확인
2. **추가로 "사용자 환경 검증"을 반드시 수행**:
   - `pnpm run dev`로 실행한 앱에 Playwright MCP `browser_navigate(localhost:5173)`로 접속
   - 또는 사용자에게 스크린샷을 요청
   - persist된 데이터가 있는 환경에서의 렌더링 확인
3. **dev 모드 vs build 모드 양쪽 검증**:
   - `_electron.launch()` (빌드 모드) + dev server MCP 접속 (dev 모드) 둘 다 실행

### Workaround
없음 — 사용자가 직접 앱을 실행하여 문제를 계속 보고.

### Suggested Fix
1. `verify-phases.md` Phase 3에 **Dual-Mode Verification** 추가:
   ```
   Phase 3 SC Verification:
   A. 격리 환경 (Playwright _electron.launch):
      - 빈 상태에서 기본 렌더링 + 기능 확인
      - 이것만으로는 verify pass 불가
   B. 사용자 환경 (dev server + Playwright MCP 또는 수동):
      - pnpm run dev 실행 → localhost:{port}에 접속
      - persist된 데이터가 있는 환경에서 UI 확인
      - 스크롤, 레이아웃, 데이터 표시 정상 확인
   양쪽 모두 통과해야 verify pass
   ```
2. `SKILL.md` Prerequisites에 경고 추가:
   ```
   ⚠️ Playwright _electron.launch는 격리 환경에서 실행됨.
   사용자의 실제 환경(persist data, dev mode)과 다를 수 있음.
   verify 시 양쪽 환경 모두 검증 필수.
   ```

---

## [SKF-044] 종합: rebuild 프로젝트에서 source app UI와 동일한 구조로 개발이 진행되지 않는 구조적 원인과 해결책

- **Trigger**: B (사용자 지적) — "처음부터 확실하게 cherry studio와 동일한UI 구조로 개발이 진행되게 하려면 어떻게 해야하는지까지 포함해서 모든 문제를 skill feedback에 반영해"
- **Phase**: smart-sdd pipeline 전체 (reverse-spec → specify → plan → tasks → implement → verify)
- **Category**: MISSING_RULE (복합 — 파이프라인 전체에 걸친 구조적 gap)
- **Severity**: Critical
- **Timestamp**: 2026-03-17 04:00

### Skill Trace
파이프라인의 6개 단계에 각각 구조적 gap이 있으며, 이것들이 누적되어 source app과 완전히 다른 UI를 생산한다.

| 단계 | Skill File | Gap |
|------|-----------|-----|
| reverse-spec | `reverse-spec/commands/analyze.md` | pre-context가 **컴포넌트 계층 구조**를 기록하지 않음. 파일 목록과 SBI만 추출하고, 컴포넌트 간 부모-자식/형제 관계, 조건부 렌더링 분기, 패널 시스템 구조를 기록하는 규칙이 없음 |
| specify | `injection/specify.md` | FR이 **UI 구조 요구사항**을 강제하지 않음. "model selector dropdown" 같은 interactive 요소가 FR에 명시되어도, plan/tasks에 전달되는 강제력이 없음 |
| plan | `injection/plan.md` | **source app 컴포넌트 트리와 target 컴포넌트 트리의 1:1 매핑**을 강제하지 않음. plan이 독자적 아키텍처를 설계할 수 있는 자유도가 너무 높음 |
| tasks | `injection/tasks.md` | **source 컴포넌트별 구현 태스크**를 강제하지 않음. "ChatHeader 구현" 태스크가 source의 ChatNavBar(3개 서브컴포넌트)에 대응하는지 확인하지 않음 |
| implement | `injection/implement.md` | Source Reference Injection 규칙은 있으나 **BLOCKING gate가 아님**. 에이전트가 source를 한 번도 읽지 않고 FR만 보고 구현 가능. 또한 **persist된 사용자 데이터**(큰 폰트, API 키 등)에서의 렌더링을 검증하지 않음 |
| verify | `verify-phases.md` | **Playwright 격리 환경**(빈 데이터)에서만 테스트하고, 사용자의 **실제 환경**(persist data, dev mode)에서 검증하지 않음. Provides 인터페이스 검증도 없음 |

### Problem
F005에서 발견된 **모든 문제의 근본 원인**:

1. **UI 구조가 cherry-studio와 다름**: source의 동적 패널 시스템(topicPosition 전환, 탭 전환, 이중 Navbar)이 고정 3-panel + 최소 ChatHeader로 대체됨. reverse-spec에서 컴포넌트 계층 구조를 추출하지 않았고, plan에서 source 구조를 참조하지 않았고, implement에서 source 코드를 읽지 않았음
2. **모델 선택 불가**: FR-003에 "model selector dropdown"이 명시되었지만, plan→tasks→implement에서 누락됨. analyze가 FR 단위로만 매핑하고 기능적 요소 단위로 분해하지 않았음
3. **API 키 persist 안 됨**: F004가 F005에 제공하는 인터페이스(provider hydrate, model list)를 F004 verify에서 검증하지 않았음
4. **스크롤/짤림**: fontSize: 22(사용자 설정)에서 `min-h-0` 없이 flex 레이아웃이 깨짐. Playwright가 빈 데이터(fontSize: 14)에서만 테스트하여 발견 못함
5. **streaming block 소실**: flushStreamingBlocks가 UPDATE-only로 새 block을 INSERT하지 않음. 데이터 왕복(write→read) 검증 규칙 부재
6. **TipTap crash**: editor.view.dom 접근 시 view 미초기화. Pattern Constraints에 TipTap 규칙이 있었으나 implement agent가 무시

### Expected: 처음부터 source와 동일한 UI 구조로 개발하려면

**A. reverse-spec 단계에 "Component Tree Extraction" 추가**

```
reverse-spec Phase 2에 추가:
1. source app의 주요 페이지별 컴포넌트 계층 구조(tree)를 추출
2. 조건부 렌더링 분기(if/switch)를 명시
3. 패널 시스템(동적 위치, 토글, 탭 전환) 구조를 기록
4. pre-context.md에 "## Component Tree" 섹션으로 기록:

   ## Component Tree
   ```
   HomePage
   ├── Navbar (conditional: navbarPosition)
   ├── HomeTabs (left sidebar with Assistants/Topics tab switcher)
   └── Chat
       ├── ChatNavBar (assistant name, model selector, tools)
       ├── Messages (virtual scroll)
       │   └── MessageItem → BlockRenderer → [TextBlock, CodeBlock, ...]
       ├── Inputbar (TipTap + toolbar with 14 tool buttons)
       └── TopicSidebar (conditional: topicPosition='right')
   ```

이 트리가 plan/implement의 기준선이 됨.
```

**B. plan 단계에 "Source Component Mapping Table" 추가**

```
plan.md에 필수 섹션:
## Source → Target Component Mapping

| Source Component | Source File | Target Component | Target File | Notes |
|---|---|---|---|---|
| HomeTabs | pages/home/Tabs/index.tsx | HomeSidebar | pages/home/HomeSidebar.tsx | Tab 전환 패턴 유지 |
| ChatNavBar | components/ChatNavBar/index.tsx | ChatHeader | components/chat/ChatHeader.tsx | ModelSelector 포함 필수 |
| SelectModelButton | components/ChatNavBar/SelectModelButton.tsx | ModelSelector | components/chat/ModelSelector.tsx | Popover with grouped list |
| Inputbar | pages/home/Inputbar.tsx | MessageInput | components/chat/MessageInput.tsx | TipTap + toolbar |

plan Review에서 이 매핑이 BLOCKING — source에 있는 컴포넌트가 target에 대응 없으면 merge 불가
```

**C. implement 단계에 "Source-First Implementation" 강제**

```
injection/implement.md에 추가:
rebuild 모드 UI 태스크 실행 시:
1. BEFORE writing any code: 대응하는 source 파일을 읽음
2. source의 컴포넌트 구조, props, state 패턴을 파악
3. new-stack 패턴으로 재구현 (복사 아님, 하지만 동일한 구조)
4. AFTER writing: source와 target의 export 비교
5. source에 있는 기능이 target에 없으면 → BLOCKING

"Source Reference: [files] loaded" 메시지가 없는 UI 태스크는 BLOCKING 위반
```

**D. verify 단계에 "Real Environment Verification" 추가**

```
verify-phases.md Phase 3에 추가:
A. 격리 환경 (Playwright _electron.launch): 빈 데이터 기본 검증
B. 사용자 환경 시뮬레이션:
   - fontSize를 극단값(12, 24)으로 변경 후 레이아웃 확인
   - Provider에 mock API 키 설정 후 모델 선택 flow 확인
   - 이전 세션 데이터가 있는 상태에서 앱 재시작 검증
양쪽 모두 통과해야 verify pass
```

**E. verify 단계에 "Provides Interface Verification" 추가**

```
verify-phases.md Phase 2에 추가:
Feature merge 전 Provides 인터페이스 검증:
- plan.md Integration Contracts의 "Provides →" 항목별 검증
- 앱 재시작 후 downstream Feature 관점에서 데이터 접근 가능 확인
- renderer store hydrate → 데이터 표시 전체 경로 검증
```

**F. analyze 단계에 "FR Element Decomposition" 추가**

```
injection/analyze.md에 추가:
FR → Task 매핑 시 FR을 기능적 요소로 분해:
- "," 또는 "and"로 구분된 각 요소를 개별 확인
- "selector", "dropdown", "picker" 등 interactive 키워드가 있으면
  대응하는 Interaction Chain과 tasks.md 태스크가 반드시 존재
- 요소 하나라도 누락이면 HIGH gap
```

### Workaround
F005 세션에서 수동으로 발견한 모든 문제를 하나씩 수정:
- ModelSelector 컴포넌트 추가
- HomeSidebar 탭 전환 구현
- useProviderStore hydrate() 추가
- upsertBlocksBatch 추가
- TipTap handleDOMEvents 수정
- min-h-0 레이아웃 수정
- ProviderEditPanel input key prop 수정

### Suggested Fix
위 A-F 항목을 각 skill 파일에 반영. 특히:
1. `reverse-spec/commands/analyze.md` — Component Tree Extraction 섹션
2. `injection/plan.md` — Source Component Mapping Table (BLOCKING)
3. `injection/implement.md` — Source-First Implementation 게이트 (BLOCKING)
4. `injection/analyze.md` — FR Element Decomposition 규칙
5. `verify-phases.md` — Real Environment Verification + Provides Interface Verification

---

## [SKF-045] specify/plan이 source app의 모델 관리 패러다임(opt-in)을 분석하지 않아 opt-out 방식으로 구현됨

- **Trigger**: B (사용자 지적) — "Models에 들어가면 전체 모델이 디폴트로 선택되는거같은데 이게 cherry studio와 동일한 방식이 맞나?"
- **Phase**: smart-sdd specify/plan/implement (F004-model-provider)
- **Category**: MISSING_RULE
- **Severity**: Major (결과물 품질 저하)
- **Timestamp**: 2026-03-17 13:00

### Skill Trace
- **File**: `.claude/skills/smart-sdd/reference/pipeline-integrity-guards.md` § Guard 7 (Rebuild Fidelity Chain)
- **Rule**: "plan → Source Component Mapping Table (source→target, BLOCKING)" — 이 규칙이 **UI 컴포넌트 구조**만 다루고 **비즈니스 로직 패러다임**(opt-in vs opt-out 같은 UX 패턴)은 커버하지 않음
- **Line**: Guard 7, line 208-209

### Problem
Cherry Studio의 모델 관리는 **opt-in** 패러다임:
- 모델 fetch → Manage Models 팝업에 표시 (추가 안 됨)
- 사용자가 (+) 클릭으로 개별 모델을 명시적으로 추가
- Model 타입에 `enabled` 필드 없음 — 배열에 존재 = 활성

Angdu Studio는 **opt-out** 패러다임으로 구현됨:
- 모델 fetch → 전부 `enabled: true`로 자동 추가
- `AICoreService.listModels()`에서 `enabled: true` 하드코딩 (line 52)
- embedding, tts, whisper 등 non-chat 모델도 전부 enabled
- ModelSelector에 수십 개 모델이 한꺼번에 표시되어 UX 열화

**근본 원인**: Guard 7의 Fidelity Chain이 "컴포넌트 구조"(Component Tree, Source→Target Mapping)에 초점을 맞추고 있어서, source app의 **데이터 흐름 패러다임**(모델이 어떻게 추가/활성화되는지)을 캡처하지 못했음. pre-context.md에는 "ManageModelsPopup", "AddModelPopup" 같은 컴포넌트가 SBI로 기록되어 있었지만, 이것들의 **존재 이유**(opt-in 패턴)가 plan/specify에 전달되지 않았음.

### Expected
1. **reverse-spec Phase 2**에서 SBI 추출 시, "Manage" 패턴의 컴포넌트(ManageModelsPopup, AddModelPopup 등)가 발견되면 → 해당 데이터의 **lifecycle 패러다임**(opt-in/opt-out, CRUD 순서)을 pre-context에 명시
2. **plan Phase**에서 Source Component Mapping 작성 시, UI 컴포넌트뿐만 아니라 **데이터 lifecycle 패턴**도 매핑 (예: "source: opt-in via ManageModelsPopup → target: 동일 패턴 또는 변경 사유 명시")
3. **implement Phase**에서 `listModels()` 구현 시, source의 `ManageModelsPopup` 코드를 읽고 "fetch → 사용자 선택 → 추가" 패턴을 이해한 후 구현

### Workaround
3가지 코드 수정으로 opt-out 방식을 유지하면서 문제 완화:
1. `isChatCapableModel()` 함수 추가 — non-chat 모델(embedding, tts, whisper, dall-e, moderation 등)의 ID 패턴을 감지하여 `enabled: false`로 설정
2. `ModelSelector` 필터링에 `isChatCapableModel()` 추가 — 이중 안전망
3. `ModelList`에 provider 단위 "Select all / Deselect all" 토글 추가

### Suggested Fix
Guard 7 (Rebuild Fidelity Chain)에 **Data Lifecycle Mapping** 단계를 추가:

```
reverse-spec → Component Tree + Data Lifecycle Patterns in pre-context.md
    ↓
specify → FR references data lifecycle (opt-in/opt-out/CRUD sequence)
    ↓
plan → Source Component Mapping + Data Lifecycle Mapping Table
    ↓
implement → Source-First: read lifecycle-related source code BEFORE implementing data flows
```

구체적으로:
1. `reverse-spec/commands/analyze.md` Phase 2에: "Manage/Add/Remove 패턴 컴포넌트 발견 시 → 해당 엔티티의 lifecycle 패러다임(opt-in/opt-out, CRUD 순서)을 pre-context § Data Lifecycle에 기록"
2. `injection/plan.md`에: Source Component Mapping 옆에 "## Data Lifecycle Mapping" 섹션 추가 — `| Entity | Source Pattern | Target Pattern | Justification |` 형식
3. `injection/implement.md`에: "데이터 추가/삭제/활성화 로직 구현 시 source의 동일 흐름 코드를 BLOCKING으로 읽어야 함"

## [SKF-046] Verify Phase 3가 실제 기능 검증 없이 페이지 네비게이션만 확인 — "cosmetic verify" 문제

- **Trigger**: B (사용자 지적)
- **Phase**: smart-sdd verify Phase 3 (F006)
- **Category**: MISSING_RULE
- **Severity**: Critical (pipeline 중단)
- **Timestamp**: 2026-03-19 17:30

### Skill Trace
- **File**: `commands/verify-phases.md`
- **Rule**: Phase 3에서 "SC-level UI verification: Automatically execute UI Action sequences from Coverage header via CLI test runner or MCP tools"라고 기술되어 있으나, **구체적으로 어떤 수준의 기능 검증을 해야 하는지, 무엇이 cosmetic verify이고 무엇이 functional verify인지 구분하는 규칙이 없음**
- **Line**: verify-phases.md Phase 3 section

### Problem
에이전트가 F006 verify Phase 3에서 Playwright E2E 테스트를 5개 작성했으나, 모두 **페이지 네비게이션** 수준에 머물렀음:
1. "KB 페이지 해시 네비게이션으로 접근 가능" — 페이지가 렌더링되는지만 확인
2. "Memory 설정 페이지 접근 가능" — 페이지 존재 여부만 확인
3. "Cross-feature regression — 0 에러" — console error만 확인
4. "Page stability" — 크래시 없음만 확인
5. "Demo CI 확인" — 상수 true 반환

**실제 검증하지 않은 것들:**
- KB 생성 버튼 클릭 → 팝업 열림 → 폼 작성 → 생성 완료 (SC-001)
- 파일 추가 → 임베딩 파이프라인 실행 → 상태 변화 (SC-003)
- 채팅 입력바에 KB 버튼 존재 여부 (FR-031)
- Memory 설정 토글 동작 (SC-007)

이는 verify가 "앱이 크래시하지 않는다"만 확인하고 "기능이 동작한다"는 확인하지 않은 것임.

### Expected
Verify Phase 3에서 spec.md SC-001~SC-012 각각에 대해:
1. SC의 사전 조건 설정 (예: KB 생성 → 파일 추가)
2. SC의 동작 실행 (예: 검색 쿼리 전송)
3. SC의 기대 결과 확인 (예: citation 뱃지 표시)

최소한 P1 SC (SC-001~SC-005)는 Playwright로 자동 검증해야 했음.

### Workaround
없음 — 사용자가 수동으로 앱을 실행하여 기능 미동작을 발견함

### Suggested Fix
`commands/verify-phases.md` Phase 3에 다음 규칙 추가:

1. **Functional SC Gate (🚫 BLOCKING)**:
   ```
   Phase 3에서 작성하는 Playwright 테스트는 반드시 spec.md SC-### 기반이어야 한다.
   - 각 P1 SC에 대해 최소 1개의 functional E2E 테스트 필수
   - "페이지가 존재한다" 수준의 테스트는 SC 검증으로 인정하지 않음
   - SC의 Given/When/Then을 Playwright action으로 변환해야 함
   ```

2. **Cosmetic Verify 금지 규칙**:
   ```
   다음 패턴의 테스트는 SC 검증으로 인정하지 않는다:
   - page.evaluate(() => window.location.hash = '#/route') → "페이지 접근 가능"
   - expect(await page.textContent('body')).toContain('keyword')
   - expect(true).toBeTruthy()

   SC 검증에 인정되는 테스트 최소 요건:
   - 사용자 액션 (click, fill, select) 최소 1회
   - 상태 변화 확인 (새 요소 생성, 텍스트 변경, 상태 아이콘 변화) 최소 1회
   ```

3. **SC Coverage Checklist** (Phase 3 시작 시):
   ```
   Phase 3 시작 전 SC-### 목록을 표시하고 각각에 대해:
   - [ ] SC-001: 테스트 작성 여부 + 검증 방법
   - [ ] SC-002: 테스트 작성 여부 + 검증 방법
   ...
   P1 SC 중 검증되지 않은 항목이 있으면 Phase 3 종료 불가
   ```

## [SKF-047] Implement 후 cross-feature wiring이 실제로 동작하는지 런타임 검증 부재

- **Trigger**: B (사용자 지적)
- **Phase**: smart-sdd implement Phase 11 (F006)
- **Category**: MISSING_RULE
- **Severity**: Major (결과물 품질 저하)
- **Timestamp**: 2026-03-19 17:30

### Skill Trace
- **File**: `reference/injection/implement.md`
- **Rule**: "Per-Task Runtime Verify" 규칙은 있으나, cross-feature wiring 태스크(예: T037 "Wire KB search into F005 chat flow")에 대한 **런타임 검증 의무가 명시적이지 않음**
- **Line**: implement.md § Cross-Feature rows

### Problem
Phase 11 cross-feature wiring 태스크들 (T067: sidebar KB 아이콘, T037: chat inputbar KB 버튼 연결)이 코드로 작성되었지만, **실제로 앱에서 보이는지 런타임 확인을 하지 않음**. 결과적으로:
- 채팅 입력바에 KB 버튼이 보이지 않음 (T033 KBButton 컴포넌트는 생성되었으나, F005의 Inputbar에 실제 import/렌더링이 안 됨)
- Sidebar에 Knowledge 아이콘이 추가되었는지 불확실

이는 "파일을 생성했으나 기존 코드에 실제로 연결하지 않은" 전형적인 cross-feature wiring 실패 패턴임.

### Expected
Cross-feature wiring 태스크 완료 후:
1. 앱을 실행하여 해당 UI 요소가 보이는지 확인
2. 클릭/인터랙션이 동작하는지 확인
3. 안 보이면 기존 파일을 읽고 정확한 삽입 위치를 찾아 수정

### Workaround
없음 — 사용자가 직접 확인

### Suggested Fix
`reference/injection/implement.md`에 추가:
```
## Cross-Feature Wiring Runtime Gate (🚫 BLOCKING)

cross-feature Interaction Chain 행이 있는 경우, 해당 태스크 완료 후 반드시:
1. 앱 실행 (or Playwright snapshot)
2. 대상 Feature의 UI에서 새 요소가 보이는지 확인
3. 보이지 않으면 → 기존 파일 읽기 → import/렌더링 위치 확인 → 수정 → 재확인

"파일 생성 + import 작성"만으로 wiring 완료로 간주하지 않는다.
```
