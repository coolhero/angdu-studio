# spec-kit-skills 문제 분석 및 보완 방안

> F005-chat-ui 구현 과정에서 발견된 파이프라인 전 단계의 구조적 문제들

## 1. specify 단계 — 요구사항 누락

### 문제 1-1: Electron 필수 UX 누락
- **현상**: `titleBarStyle: 'hiddenInset'` (macOS) / `frame: false` (Windows) 설정이 F001에 이미 구현되어 있으나, 이에 따른 `-webkit-app-region: drag` 드래그 영역 지정이 F005 spec에서 완전히 누락
- **원인**: specify 단계에서 upstream feature(F001)의 구현 결과물이 downstream feature에 미치는 UI 요구사항을 자동으로 도출하지 못함
- **영향**: 앱 창을 마우스로 이동할 수 없는 치명적 UX 결함

### 문제 1-2: 원본 소스 구조 불일치
- **현상**: CherryStudio는 2개 탭(Assistants + Topics/Sessions 통합)이나 F005 spec은 3개 탭으로 분리 구현
- **원인**: SBI(Source Behavior Inventory)에서 B105 "Manage sidebar tabs (assistants, topics, sessions)"를 개별 탭 3개로 해석. 원본 소스의 실제 탭 구조를 확인하지 않음
- **영향**: 원본과 다른 UI 구조 생성

### 보완 방안 A1: Upstream Impact Analysis
- specify 단계에서 upstream feature의 구현 결과를 읽고, downstream에 필요한 UI/UX 요구사항을 자동 도출
- 예: F001이 `frame: false` 설정 → F005 spec에 "드래그 영역 지정" FR 자동 추가

### 보완 방안 A2: Source Behavior 검증 강화
- SBI 항목이 원본 소스 코드의 실제 구현과 일치하는지 cross-reference 검증
- 탭 개수, 레이아웃 구조 등 구조적 요소는 원본 코드에서 직접 확인

---

## 2. plan 단계 — 아키텍처 결정 품질

### 문제 2-1: Zustand 셀렉터 패턴 미지정
- **현상**: plan에서 "Zustand 5.x 사용"만 명시. 셀렉터에서 derived data 생성 금지 규칙 부재
- **원인**: React 19 + `useSyncExternalStore`의 참조 안정성 요구사항이 plan에 반영되지 않음
- **영향**: `useTopicMessages`, `MessageContent`, `MessageAttachments` 등 5개 파일에서 무한 리렌더링 → 빈 화면

### 문제 2-2: CSS 패턴 결정 누락
- **현상**: "Tailwind CSS 4 사용"만 명시. `useLayoutEffect` vs `useEffect` 선택 기준, 인라인 스타일 vs CSS 클래스 전략 미정
- **원인**: plan이 라이브러리 선택에 집중하고 사용 패턴까지 규정하지 않음
- **영향**: textarea 리사이즈에 `useEffect` 사용 → 깜빡임 문제

### 보완 방안 B1: Anti-Pattern Checklist
- 각 기술 스택의 known anti-pattern을 plan에 명시적으로 나열
- 예: "Zustand 셀렉터에서 `.filter()`, `.map()` 등 새 참조 생성 금지"
- 예: "DOM 측정/조작은 반드시 useLayoutEffect 사용"

### 보완 방안 B2: 원본 소스 패턴 추출
- plan 단계에서 원본 소스의 스타일링 패턴을 분석하여 migration 규칙에 반영
- 예: CherryStudio InputBar의 `padding: 6px 15px`, `border-radius: 17px`, `minHeight: 30` 등 구체적 수치

---

## 3. tasks 단계 — 작업 분해 정밀도

### 문제 3-1: UI 구조 검증 태스크 부재
- **현상**: 구현 태스크만 존재하고 "원본과 레이아웃 비교" 태스크 없음
- **원인**: tasks.md가 기능 구현 중심으로 분해되어 시각적 검증이 빠짐
- **영향**: Sessions 탭 추가, max-w-3xl로 인한 과도한 여백 등이 검출되지 않음

### 보완 방안 C1: Visual Verification Tasks
- 각 UI 컴포넌트 구현 후 "원본 스크린샷/구조와 비교" 태스크 추가
- Playwright MCP 활용한 스크린샷 비교를 태스크에 포함

---

## 4. implement 단계 — 코드 생성 품질

### 문제 4-1: 불필요한 width 제한
- **현상**: `max-w-3xl` (768px), `max-w-2xl` (672px) 등 임의의 width 제한 적용
- **원인**: ChatGPT-style 레이아웃을 기본으로 적용. CherryStudio는 전체 너비 사용
- **영향**: 넓은 화면에서 우측 여백이 과도하게 넓음

### 문제 4-2: 컴포넌트 스타일 불일치
- **현상**: InputBar가 직사각형 border + 배경색 스타일. 원본은 `border-radius: 17px` 둥근 컨테이너
- **원인**: implement 단계에서 원본 스타일을 참조하지 않고 generic 스타일 적용
- **영향**: 전체적인 UI 느낌이 원본과 크게 다름

### 보완 방안 D1: Style Reference Injection
- implement 단계에서 원본 소스의 styled-components / CSS를 읽어 Tailwind로 변환
- 구체적 수치(padding, border-radius, min-height 등)를 원본에서 추출하여 적용

### 보완 방안 D2: Component-Level Source Mapping
- 각 컴포넌트 구현 시 원본 파일 경로를 명시하고 원본 코드를 참조

---

## 5. verify 단계 — 검증 범위 부족

### 문제 5-1: 런타임 검증 부재
- **현상**: `npm run build` 성공과 단위 테스트 통과만으로 verify 완료 판정
- **원인**: verify 단계가 "빌드 성공 = 기능 동작"으로 가정
- **영향**: 빌드는 성공하지만 앱 실행 시 빈 화면 (무한 리렌더링)

### 문제 5-2: 시각적 검증 부재
- **현상**: UI가 원본과 전혀 다른 모양이지만 verify 통과
- **원인**: verify에 스크린샷 비교나 레이아웃 검증이 없음
- **영향**: merge 후에야 UI 불일치 발견

### 문제 5-3: Playwright MCP 미활용 ★★★ (핵심 문제)

- **현상**: Playwright MCP가 smart-sdd SKILL.md Prerequisites에 "must be installed and connected"로 명시되어 있고, 프로젝트 settings.local.json에 `mcp__playwright__*` 퍼미션까지 허용되어 있으나, verify 단계에서 전혀 사용되지 않음

- **근본 원인 분석 (실제 조사 결과)**:

  1. **CDP Endpoint 미실행 (primary cause — 실제 조사 결과)**:
     - MCP 서버 등록: `~/.claude.json`에 `--cdp-endpoint http://localhost:9222`로 정상 등록됨
     - `claude mcp get playwright` → `Status: ✓ Connected` (MCP 프로세스 자체는 실행됨)
     - **그러나 CDP endpoint `localhost:9222`에 Electron 앱이 실행되지 않으면 MCP가 브라우저에 연결 실패**
     - `curl http://localhost:9222/json/version` → `Connection refused`
     - Playwright MCP는 CDP 연결 실패 시 도구를 등록하지 않음 → `ToolSearch`에서 발견 불가
     - **해결**: Electron 앱을 `--remote-debugging-port=9222`로 먼저 실행한 후 Claude Code 세션 시작
     - `npx electron out/main/index.js --remote-debugging-port=9222` 실행 후 CDP 정상 동작 확인됨

  2. **MCP 연결 상태의 오해**:
     - `claude mcp get playwright` → `Status: ✓ Connected`는 **MCP 서버 프로세스가 실행 중**이라는 의미
     - MCP 서버(npx @playwright/mcp)가 실행은 되었지만, **CDP로 브라우저에 연결하는 것은 별도 단계**
     - MCP 서버 프로세스 실행 ✓ → CDP 브라우저 연결 ✗ → 도구 미등록
     - 이 구분을 Claude Code의 상태 표시가 명확히 보여주지 않음

  3. **Electron + CDP 사전 조건 미문서화**:
     - smart-sdd SKILL.md에 "Playwright MCP must be installed" + MCP-GUIDE.md 참조라고만 명시
     - "Electron 앱을 CDP 포트와 함께 실행해야 한다"는 구체적 조건이 파이프라인에 없음
     - 올바른 워크플로우:
       1. `npm run build` → Electron 앱 빌드
       2. `npx electron out/main/index.js --remote-debugging-port=9222` → CDP 포트로 앱 실행
       3. Claude Code 세션 시작 (또는 재시작)
       4. `ToolSearch("select:mcp__playwright__browser_snapshot")` → 도구 사용 가능

  4. **Tool Discovery 시 추가 검증 부재**:
     - `ToolSearch` 실패 → "사용 불가"로 즉시 판정
     - MCP 설정 파일(`~/.claude.json`)을 직접 확인하지 않음
     - `claude mcp get playwright` 명령으로 실제 상태 확인도 안 함
     - CDP endpoint 접근 가능 여부(`curl localhost:9222`)도 확인 안 함
     - **"도구가 없다"는 판정을 추가 검증 없이 수용한 것이 핵심 실수**

  5. **Skill 지시의 모호성**:
     - smart-sdd SKILL.md: "Prerequisites: Playwright MCP must be installed and connected"
     - "For Electron apps, CDP must be pre-configured — see MCP-GUIDE.md"라는 참조만 있음
     - 하지만 설치 여부 검증 로직 없음. "must"라고 명시했지만 검증/강제 코드 없음
     - verify 단계에서 "있으면 사용"이 아닌 "없으면 FAIL" 처리 필요
     - **해결**: pipeline 시작 전 (1) `claude mcp get playwright` (2) `curl localhost:9222` 실행하여 양쪽 모두 확인

  6. **사용 시점의 문제 — 분석/디버깅 과정에서의 미활용**:
     - Playwright MCP가 사용 가능했다면 verify뿐 아니라 **일반적인 분석 과정에서도** 적극 활용했어야 함
     - 예: textarea 크기 문제 디버깅 시 실제 렌더링 결과를 스크린샷으로 확인
     - 예: 레이아웃 여백 문제를 시각적으로 확인하여 CSS 값 조정
     - 예: 원본 CherryStudio와 angdu-studio의 UI 비교
     - 하지만 ToolSearch 실패 → "사용 불가"로 판정 → 코드만으로 추론하는 방식으로 전환
     - **수차례 UI 버그를 코드 추론만으로 수정하면서도 Playwright 사용을 재시도하지 않음**
     - CDP endpoint 실행 여부를 확인하고 앱 실행을 제안했어야 함

### 보완 방안 E1: Runtime Smoke Test 의무화
- verify Phase 1에 "앱 실행 → 기본 화면 렌더링 확인" 추가
- Electron: `electron .` 실행 후 CDP로 console error 체크
- Web: dev server 기동 후 페이지 로드 확인

### 보완 방안 E2: Playwright MCP 설치 및 활용 의무화
- **설치 검증 (pipeline 시작 시)**:
  1. `.mcp.json` 또는 `~/.claude/plugins/installed_plugins.json`에서 playwright 존재 확인
  2. 없으면 자동 설치: `claude mcp add playwright -- npx @playwright/mcp@latest`
  3. `ToolSearch("select:mcp__playwright__browser_snapshot")` 성공 여부 확인
  4. 실패 시 HARD STOP — "Playwright MCP 설치 필요" 안내
- **verify 단계에서 필수 사용**:
  ```
  1. 앱 실행 → browser_navigate로 접속
  2. browser_snapshot으로 현재 화면 캡처
  3. 주요 UI 요소 존재 확인 (입력바, 메시지 영역, 사이드바)
  4. 기본 인터랙션 테스트 (텍스트 입력, 버튼 클릭)
  ```
- MCP 연결 불가 시 verify를 FAIL 처리하고 수동 확인 요청

### 보완 방안 E3: 분석/디버깅 과정에서의 적극 활용
- verify뿐 아니라 **UI 버그 수정 시에도** Playwright MCP 사용을 표준화:
  - CSS 수정 → 스크린샷으로 결과 즉시 확인
  - 레이아웃 문제 → 시각적 비교로 원인 특정
  - 원본과의 비교 → 양쪽 스크린샷 나란히 확인
- "코드만 보고 추론"이 아닌 "렌더링 결과를 직접 확인"하는 습관 확립

### 보완 방안 E4: Visual Regression 기준선
- verify 통과 시 스크린샷을 baseline으로 저장
- 이후 변경 시 baseline과 비교하여 의도하지 않은 UI 변경 감지

### 보완 방안 E5: MCP 연결 사전 검증 (3단계)
1. `ToolSearch`로 도구 가용성 확인
2. 실패 시: MCP 설정 파일(`.mcp.json`, `installed_plugins.json`) 직접 확인
3. 미설치 시: 설치 안내 또는 자동 설치 시도 → 세션 재시작 필요 여부 고지
- **핵심**: ToolSearch 실패를 "사용 불가"로 즉시 판정하지 않고, 설정 파일을 직접 확인하여 원인 분석

---

## 6. 파이프라인 전체 — 구조적 문제

### 문제 6-1: 원본 소스 참조 단절
- **현상**: specify에서 SBI 추출 후, plan/tasks/implement에서 원본 소스를 다시 참조하지 않음
- **원인**: SBI가 "요약"이므로 구현 수준의 디테일(CSS 값, 컴포넌트 구조)이 손실
- **영향**: 원본과 다른 UI가 생성되고 verify에서도 잡지 못함

### 문제 6-2: Upstream-Downstream 의존성 검증 부재
- **현상**: F001에서 frameless window 설정 → F005에서 drag region 필요 → 누락
- **원인**: 각 feature가 독립적으로 specify되어 cross-feature 의존성이 검증되지 않음

### 보완 방안 F1: Source Reference Pipeline
- implement 단계에서 각 컴포넌트의 원본 소스 파일을 직접 읽어서 참조
- "SBI 요약 → 구현"이 아닌 "원본 코드 → 마이그레이션"으로 접근

### 보완 방안 F2: Cross-Feature Impact Matrix
- sdd-state.md에 feature 간 영향 매트릭스 추가
- F001 설정 변경 시 F005에 영향받는 요구사항 자동 도출

---

## 수정 이력 (이번 세션)

| 파일 | 문제 | 수정 내용 |
|------|------|----------|
| `Navbar.tsx` | 창 드래그 불가 | `WebkitAppRegion: 'drag'` 추가, macOS traffic lights 패딩 |
| `Tabs/index.tsx` | Sessions 탭 불필요 | 3탭 → 2탭(Assistants + Topics)으로 변경 |
| `Inputbar.tsx` | 레이아웃 불일치 | rounded container 스타일, `max-w-3xl` 제거 |
| `InputbarCore.tsx` | textarea 스타일 불일치 | borderless textarea, CherryStudio 패딩 적용 |
| `useTextareaResize.ts` | 크기 깜빡임 | minHeight 30px, maxHeight 500px, overflow/border 보정 |
| `NarrowLayout.tsx` | 과도한 여백 | non-narrow 모드 패딩 제거 |
| `Message.tsx` | 메시지 폭 제한 | `max-w-3xl` 제거 |

---

## 우선순위별 보완 방안 요약

### P0 (즉시 적용 — 다음 작업 전 반드시)
- **E2**: Playwright MCP 설치 및 활용 의무화 (pipeline 시작 시 설치 검증)
- **E5**: MCP 연결 사전 검증 (ToolSearch 실패 시 설정 파일 직접 확인)
- **E1**: Runtime Smoke Test 의무화
- **E3**: 분석/디버깅 시 Playwright 적극 활용

### P1 (다음 feature부터)
- **A1**: Upstream Impact Analysis
- **D1**: Style Reference Injection (원본 CSS 수치 추출)
- **F1**: Source Reference Pipeline (SBI 요약이 아닌 원본 코드 직접 참조)

### P2 (점진적 개선)
- **A2**: Source Behavior 검증 강화
- **B1**: Anti-Pattern Checklist (Zustand 셀렉터 등)
- **B2**: 원본 소스 패턴 추출
- **C1**: Visual Verification Tasks
- **D2**: Component-Level Source Mapping
- **E4**: Visual Regression 기준선
- **F2**: Cross-Feature Impact Matrix
