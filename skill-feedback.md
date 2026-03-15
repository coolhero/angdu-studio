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
