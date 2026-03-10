# Spec-Kit Skills 개선 종합 분석 v2

> F004-settings-data + F005-chat-ui 구현 경험을 기반으로 한 구조적 문제 분석 및 개선 방안
> 작성: 2026-03-09

---

## 0. 요약: 현재 파이프라인의 근본 문제

spec-kit-skills 파이프라인의 핵심 문제는 **"빌드 성공 = 기능 완성"이라는 착각**이다.

```text
현재 파이프라인 판정 기준:
  ✅ TypeScript 컴파일 성공
  ✅ 단위 테스트 통과
  ✅ npm run build 성공
  → "Feature 구현 완료" 판정

실제 현실:
  ❌ 앱 실행하면 주요 기능이 동작하지 않음
  ❌ UI 형상이 원본과 전혀 다름
  ❌ IPC 채널명이 테스트 규칙과 불일치
  ❌ 설정 변경해도 실제 DOM에 반영 안 됨
  ❌ AI 테스트를 위한 Provider 설정 UI 자체가 없음
```

F004와 F005에서 공통으로 발생한 패턴: **verify까지 "통과"하고도 실행하면 기본적인 것조차 동작하지 않음**.

---

## 1. Feature 불안정성 — 주요 기능임에도 테스트 불가능한 구성

### 문제 진단

F004에서 발생한 구체적 사례:

| 문제 | 심각도 | 발견 시점 | 파이프라인이 잡았는가? |
|------|--------|----------|---------------------|
| Settings UI가 화면 왼쪽 일부만 차지 | Critical | verify (수동) | ❌ 빌드/테스트에서 미감지 |
| Display 설정 변경해도 실제 반영 안 됨 | Critical | verify (수동) | ❌ store 업데이트만 테스트, DOM side effect 미검증 |
| AI Provider 설정 탭이 없어서 AI 테스트 자체 불가 | Blocker | verify (수동) | ❌ "Feature 범위 밖"으로 분류되었으나, 실제로는 전체 앱 테스트를 막는 블로커 |
| IPC 채널명 camelCase → kebab-case 위반 | Major | verify Phase 1 | ✅ 기존 테스트에서 감지 |
| useBackup의 preload API 이름 불일치 | Critical | verify (수동) | ❌ 런타임에서만 발견 |
| backup-progress 이벤트 채널 형식 오류 | Major | verify Phase 1 | ✅ 테스트에서 감지 |

**핵심**: 6개 문제 중 4개가 파이프라인의 자동 검증(빌드/테스트)에서 잡히지 않음. 모두 **런타임 실행** 후에야 발견됨.

### F005에서도 동일한 패턴 반복

| 문제 | 심각도 |
|------|--------|
| 창 드래그 불가 (frameless window drag region 누락) | Critical |
| 빈 화면 (Zustand 셀렉터 무한 리렌더링) | Critical |
| 채팅 영역이 화면 절반만 차지 (w-full/max-w-3xl) | Major |
| textarea 깜빡임 (useEffect vs useLayoutEffect) | Major |
| 3개 탭 (원본은 2개) | Major |

### 근본 원인

```text
1. 파이프라인이 "컴파일 타임 검증"에만 의존
2. "런타임 동작 검증"이 구조적으로 빠져 있음
3. Feature 간 의존성이 있는데 독립적으로만 검증
4. "Feature가 앱 전체의 어떤 기능을 가능하게 하는가"에 대한 관점 부재
```

### 개선 방안 1-1: Feature Functional Completeness Gate

Feature verify 시 다음을 필수 검증 항목으로 추가:

```markdown
## Feature Functional Completeness Checklist

### Runtime 동작 (MUST)
- [ ] 앱 실행 시 Feature 관련 화면이 정상 렌더링되는가?
- [ ] 주요 UI 요소가 올바른 크기/위치에 배치되는가?
- [ ] 사용자 인터랙션(클릭, 입력, 토글)이 실제로 동작하는가?
- [ ] 설정 변경 시 결과가 즉시 반영되는가? (store 업데이트 + DOM 반영)

### Cross-Feature 의존성 (MUST)
- [ ] 이 Feature가 다른 Feature의 테스트를 막고 있지 않은가?
- [ ] 이 Feature가 의존하는 다른 Feature의 기능이 정상 동작하는가?
- [ ] 이 Feature를 사용하기 위해 필요한 사전 설정(예: Provider 등록)이 가능한가?

### End-to-End 시나리오 (SHOULD)
- [ ] 사용자가 Feature의 주요 기능을 처음부터 끝까지 수행할 수 있는가?
- [ ] 에러 상태에서 적절한 안내가 표시되는가?
```

### 개선 방안 1-2: Feature Impact Analysis

Feature를 implement하기 전에 다음을 분석:

```text
F004 (settings-data) 영향 분석:
  - 이 Feature가 가능하게 하는 것: 앱 설정 변경, 데이터 백업/복원, AI 테스트 설정
  - 이 Feature 없이 테스트 불가능한 것: AI Provider 구성, 테마 변경, 백업/복원
  - 이 Feature가 의존하는 것: F001 (IPC bridge), F002 (Provider store — read-only)
  - 이 Feature가 블로킹하는 것: F006 이후 모든 AI 관련 기능 테스트

  결론: Provider 설정 UI가 없으면 F002의 Provider를 등록할 수 없고,
        따라서 AI 채팅 테스트 자체가 불가능 → Settings에 Provider 탭 필수
```

---

## 2. Edge Case 테스트의 사전 설계 — "구현 후 테스트"가 아닌 "테스트 설계 후 구현"

### 문제 진단

현재 파이프라인의 테스트 접근:

```text
현재:
  implement → "구현 완료" → verify (build + unit test) → "통과"
  → Edge case는 누가 잡나? → 아무도 안 잡음

실제 발생한 Edge case:
  - Display 설정: store만 업데이트하고 DOM side effect 없음 (핵심 동작 누락)
  - useBackup: preload API 이름이 hook과 불일치 (API 계약 위반)
  - Settings layout: flex container 자식에 w-full 누락 (CSS 기본 동작 미이해)
  - IPC channel: camelCase로 작성했으나 프로젝트 규칙은 kebab-case (규칙 미준수)
```

### 개선 방안 2-1: Contract-Driven Edge Case Matrix

각 Feature의 spec/plan 단계에서 **Edge Case Matrix**를 사전에 작성:

```markdown
## Edge Case Matrix: F004-settings-data

### Settings UI
| 시나리오 | 기대 결과 | 검증 방법 |
|---------|----------|----------|
| Display 설정 변경 시 | DOM에 즉시 반영 (body.style, CSS vars) | Playwright: 변경 전/후 computed style 비교 |
| Settings 페이지 전체 너비 | 화면 100% 차지 | Playwright: viewport width == settings width |
| 테마 dark → light 전환 | html.classList 즉시 변경 | Playwright: class attribute 확인 |
| font size 변경 | body.style.fontSize 즉시 변경 | Playwright: computed fontSize 확인 |

### IPC Bridge
| 시나리오 | 기대 결과 | 검증 방법 |
|---------|----------|----------|
| 모든 IPC 채널명 | kebab-case 패턴 일치 | 정규식 테스트: /^[a-z-]+:[a-z0-9-]+$/ |
| preload API 이름 | hook에서 사용하는 이름과 일치 | 타입 체크 + 런타임 호출 테스트 |
| 이벤트 리스너 | window.api에 메서드 존재 확인 | guard: if (!window.api?.x) return |

### Backup
| 시나리오 | 기대 결과 | 검증 방법 |
|---------|----------|----------|
| WebDAV 연결 실패 | 에러 토스트 표시 | try/catch + toast.error |
| 백업 진행 중 UI | 프로그레스바 표시 | onProgress 이벤트 수신 확인 |
| 빈 데이터 백업 | 정상 완료 (빈 아카이브) | 빈 store 상태에서 백업 실행 |
```

### 개선 방안 2-2: Side Effect 검증 의무화

"store 업데이트" 외에 **실제 효과(side effect)**를 검증하는 패턴:

```text
설정 변경의 완전한 동작 체인:
  1. UI 인터랙션 (사용자 클릭/입력)
  2. Store 업데이트 (Zustand setState)
  3. Side Effect 발생 (DOM 변경, IPC 호출, CSS 변수 적용)
  4. 사용자에게 시각적 피드백

현재: 2번만 테스트 (store 값 변경 확인)
개선: 2번 + 3번 + 4번 모두 테스트

구체적으로:
  - themeMode 변경 → store 값 확인 + document.documentElement.classList 확인 + 스크린샷 비교
  - fontSize 변경 → store 값 확인 + document.body.style.fontSize 확인 + 렌더링 결과 확인
  - proxyMode 변경 → store 값 확인 + IPC 호출 발생 확인 + main process 반영 확인
```

---

## 3. UI 형상 품질 — 어설픈 형상, 안 맞는 위치/사이즈

### 문제 진단

F004와 F005에서 공통으로 발생:

```text
F004:
  - Settings 페이지가 화면 왼쪽 일부만 차지 (w-full 누락)
  - Add Provider 다이얼로그의 Cancel 버튼이 "취소"와 "Cancel" 혼재

F005:
  - 채팅 영역에 max-w-3xl 적용 → 우측 여백 과도
  - InputBar가 직사각형 (원본은 border-radius: 17px 둥근 형태)
  - textarea padding/min-height가 원본과 불일치
  - 메시지 영역 폭이 제한됨 (원본은 전체 너비)
```

### 근본 원인

```text
1. implement 단계에서 원본 소스의 CSS를 참조하지 않음
2. "일반적인 웹앱 스타일"을 기본 적용 (ChatGPT-style max-width 등)
3. Electron 앱의 전체 화면 활용 패턴을 반영하지 않음
4. flex 레이아웃의 기본 동작(content-based sizing)을 이해하지 못함
5. 원본과의 시각적 비교 과정이 완전히 없음
```

### 개선 방안 3-1: Visual Reference Screenshot (원본 스크린샷 기준선)

**specify 단계**에서 원본 앱의 주요 화면을 Playwright MCP로 캡처하여 기준선 생성:

```text
specify 시작 시:
  1. 원본 CherryStudio를 CDP로 실행
  2. 주요 화면별 스크린샷 캡처:
     - specs/004-settings-data/reference/settings-general.png
     - specs/004-settings-data/reference/settings-display.png
     - specs/004-settings-data/reference/settings-data.png
     - specs/004-settings-data/reference/files-page.png
     - specs/004-settings-data/reference/minapps-page.png
  3. 각 스크린샷에서 핵심 레이아웃 수치 추출:
     - sidebar width: 220px
     - content area: 100% - 220px
     - padding, border-radius 등
  4. 이 reference를 implement 단계에서 직접 참조
```

### 개선 방안 3-2: Layout Verification Checkpoint

각 페이지/컴포넌트 구현 후 즉시 시각적 검증:

```text
컴포넌트 구현 → Playwright 스크린샷 → 원본 reference와 비교
  - 전체 너비 차지 여부 ✓
  - 주요 요소 위치 (좌/우/상/하) ✓
  - padding/margin 비율 ✓
  - border-radius, font-size 등 스타일 속성 ✓

비교 결과가 "확연히 다름"이면 implement를 계속하지 말고 즉시 수정
```

### 개선 방안 3-3: CSS Migration Table (원본 → Tailwind 매핑)

plan 단계에서 원본의 구체적 CSS 수치를 추출하여 implement에서 직접 사용:

```markdown
| 원본 CSS | Tailwind | 적용 대상 |
|---------|---------|----------|
| width: 100% | w-full | Settings content area |
| display: flex; flex: 1 | flex flex-1 | 모든 페이지 root div |
| border-radius: 8px | rounded-lg | 설정 카드 |
| padding: 24px | p-6 | 설정 콘텐츠 영역 |
| gap: 16px | gap-4 | 설정 섹션 간격 |
```

---

## 4. Verify 전 단계에서 완성도가 너무 낮은 채로 넘어오는 문제

### 문제 진단

```text
현재 각 단계의 "통과" 기준:

specify: spec.md 생성됨 + checklist 항목 체크됨 → 통과
  → 문제: 원본과의 구조 일치 여부 미확인

plan: plan.md 생성됨 + tech stack 선택됨 → 통과
  → 문제: anti-pattern, CSS 수치, side effect 패턴 미규정

tasks: tasks.md 생성됨 + 의존성 정의됨 → 통과
  → 문제: 시각적 검증 태스크 없음, 원본 파일 매핑 없음

implement: 모든 태스크 체크됨 + 빌드 성공 → 통과
  → 문제: "코드가 존재함" = "기능이 동작함"으로 간주

verify: 빌드 + 테스트 + 타입체크 성공 → 통과
  → 문제: 런타임 실행 안 해봄, UI 확인 안 함
```

### 근본 원인: 각 단계의 Exit Criteria가 너무 느슨함

```text
현재 Exit Criteria: "산출물이 생성되었는가?" (형식 기준)
필요한 Exit Criteria: "산출물이 정확한가?" (품질 기준)
```

### 개선 방안 4-1: 단계별 Quality Gate 강화

```markdown
## specify Exit Criteria
- [ ] 모든 FR이 원본 소스의 실제 동작과 일치하는가?
  → Playwright로 원본 앱 캡처하여 SBI 항목과 대조
- [ ] upstream Feature의 구현이 이 Feature에 미치는 영향이 반영되었는가?
  → 이전 Feature의 실제 코드를 읽고 dependency 도출
- [ ] Feature가 가능하게 하는 cross-feature 기능이 식별되었는가?

## plan Exit Criteria
- [ ] 각 기술 스택의 anti-pattern이 명시되었는가?
- [ ] 원본 소스의 CSS 수치 migration table이 포함되었는가?
- [ ] side effect chain (store → DOM → 사용자 피드백)이 정의되었는가?

## tasks Exit Criteria
- [ ] 각 태스크에 원본 소스 파일 경로가 명시되었는가?
- [ ] 시각적 검증 태스크가 주요 UI 컴포넌트마다 포함되었는가?
- [ ] Edge Case Matrix가 작성되었는가?

## implement Exit Criteria
- [ ] 모든 태스크의 코드가 원본 소스를 참조하여 작성되었는가?
- [ ] 런타임 실행 시 주요 화면이 정상 렌더링되는가? (Playwright 확인)
- [ ] Side effect가 실제로 동작하는가? (store 업데이트 + DOM 반영)

## verify Exit Criteria (강화)
- [ ] 빌드 + 테스트 + 타입체크 성공 (기존)
- [ ] 런타임 실행 → 주요 화면 렌더링 확인 (Playwright)
- [ ] 원본과 시각적 비교 → 레이아웃 일치 확인 (Playwright)
- [ ] 주요 인터랙션 동작 확인 (클릭, 입력, 토글)
- [ ] Cross-feature 기능 테스트 가능 여부 확인
```

### 개선 방안 4-2: Implement → Verify 사이에 "Runtime Check" 단계 추가

```text
현재: implement → verify
개선: implement → runtime-check → verify

runtime-check 단계:
  1. npm run build
  2. Electron 앱을 CDP로 실행
  3. 주요 페이지 순회하며 Playwright 스크린샷
  4. console.error 확인
  5. 주요 인터랙션 테스트 (설정 변경 → 반영 확인)
  6. runtime-check 실패 시 → implement로 돌아감 (verify로 넘어가지 않음)
```

---

## 5. Original Source의 기능 및 Runtime 정밀 파악 (End-to-End 사전 분석)

### 문제 진단

```text
현재 원본 분석 방식:
  reverse-spec → SBI(Source Behavior Inventory) 텍스트 추출
  → "B056: User configures general settings (language, proxy, shortcuts)"
  → 이 한 줄 텍스트만으로 전체 기능을 구현해야 함

실제로 B056이 포함하는 것:
  - 언어 변경 → i18n 즉시 전환 + electron-store 저장
  - 프록시 설정 → main process 네트워크 설정 변경 + IPC 호출
  - 테마 변경 → document.documentElement 클래스 변경 + CSS 변수 갱신
  - 폰트 변경 → body.style 직접 수정 + CSS 변수 갱신
  - launch on boot → electron autoLaunch 설정 + OS 등록

SBI 텍스트에서 이 모든 디테일을 도출하는 것은 불가능.
```

### 개선 방안 5-1: Runtime Behavior Capture (원본 앱 동작 녹화)

specify 단계 전에 원본 앱의 **실제 동작**을 Playwright MCP로 캡처:

```markdown
## 원본 Runtime 분석: Settings

### General Settings
1. 언어 변경 (ko → en):
   - [스크린샷: 변경 전]
   - [스크린샷: 변경 후 — 모든 텍스트가 영어로]
   - 동작: i18n.changeLanguage() → 전체 UI 즉시 재렌더링
   - 부작용: electron-store에 language 키 저장

2. 테마 변경 (dark → light):
   - [스크린샷: dark 모드]
   - [스크린샷: light 모드]
   - 동작: document.documentElement.classList toggle('dark')
   - 부작용: CSS 변수 --background, --foreground 등 변경

3. 폰트 크기 변경 (14 → 18):
   - [스크린샷: 14px]
   - [스크린샷: 18px]
   - 동작: document.body.style.fontSize = '18px'
   - 부작용: 모든 상대 크기(em, rem) 요소 함께 변경
```

### 개선 방안 5-2: End-to-End Flow Documentation

각 Feature의 주요 기능에 대해 **전체 동작 체인**을 문서화:

```text
기능: "사용자가 테마를 다크에서 라이트로 변경"

End-to-End Flow:
  1. [UI] Settings → Display → Theme Mode → "Light" 클릭
  2. [Store] useSettingsStore.setState({ themeMode: 'light' })
  3. [Persist] Zustand persist middleware → electron-store IPC 호출
  4. [Main] electron-store에 themeMode: 'light' 저장
  5. [Side Effect] App.tsx useEffect 감지 → setResolvedTheme('light')
  6. [Theme Store] useThemeStore.setState({ resolved: 'light' })
  7. [DOM] document.documentElement.classList.remove('dark')
  8. [CSS] Tailwind dark: 접두사 비활성화 → 모든 색상 변경
  9. [Visual] 사용자에게 즉시 라이트 모드 표시

검증 포인트:
  - Step 2: store 값 확인
  - Step 4: electron-store 값 확인 (재시작 후 유지)
  - Step 7: DOM 클래스 확인
  - Step 9: Playwright 스크린샷 확인
```

### 개선 방안 5-3: Original Source Code Reading Protocol

implement 단계에서 원본 코드를 체계적으로 읽는 프로토콜:

```text
각 컴포넌트 구현 전 필수 수행:

1. 원본 파일 읽기 (cherry-studio/src/renderer/src/pages/settings/*)
2. 핵심 로직 추출:
   - State 변수 목록
   - Event handler 목록
   - Side effect 목록 (useEffect 내용)
   - CSS/스타일 수치
3. 기술 변환 매핑:
   - Redux dispatch → Zustand setState
   - styled-components → Tailwind 클래스
   - Ant Design 컴포넌트 → shadcn/ui 컴포넌트
4. 누락 방지 체크:
   - 원본에 있는 useEffect가 모두 구현되었는가?
   - 원본의 이벤트 핸들러가 모두 구현되었는가?
   - 원본의 조건부 렌더링이 모두 반영되었는가?
```

---

## 6. 개발된 소스의 기능 및 Runtime 정밀 검토 (End-to-End 구현 검증)

### 문제 진단

```text
현재 검증:
  - TypeScript 컴파일 성공 → "코드 문법이 맞다"
  - 단위 테스트 통과 → "개별 함수가 동작한다"
  - 빌드 성공 → "번들링이 된다"

미검증:
  - 앱 실행 시 화면이 나오는가?
  - 사용자 인터랙션이 동작하는가?
  - Store 업데이트가 DOM에 반영되는가?
  - IPC 호출이 main process에서 처리되는가?
  - 설정 변경이 재시작 후 유지되는가?
```

### 개선 방안 6-1: Automated Runtime Verification Suite

verify Phase 3 (Playwright Demo)를 체계적으로 실행:

```text
## Runtime Verification Protocol

### Step 1: 앱 실행
  npm run build && npx electron out/main/index.js --remote-debugging-port=9222

### Step 2: 기본 렌더링 검증 (30초 이내)
  - Playwright browser_snapshot → 메인 화면 렌더링 확인
  - Console errors 확인 → Critical error 있으면 FAIL
  - 주요 UI 요소 존재 확인 (navigation, content area)

### Step 3: Feature별 인터랙션 검증

  [F004 Settings]
  - Settings 페이지 진입 → 7개 탭 모두 표시 확인
  - General 탭: 언어 변경 → UI 즉시 반영 확인
  - Display 탭: 테마 변경 → 배경색 변경 확인
  - Display 탭: 폰트 크기 변경 → body.style.fontSize 확인
  - AI 제공자 탭: Add Provider → 다이얼로그 표시 확인
  - Data 탭: 백업 UI 렌더링 확인

### Step 4: Cross-Feature 검증
  - Provider 등록 → 채팅에서 AI 응답 가능한지 확인
  - 설정 변경 → 채팅 화면에서 반영되는지 확인

### Step 5: 원본 비교
  - 구현된 앱 스크린샷 vs 원본 앱 스크린샷
  - 레이아웃 비율, 주요 스타일 비교
```

### 개선 방안 6-2: Side Effect Chain 자동 검증

각 설정 변경의 전체 체인이 동작하는지 자동 확인:

```text
테스트: themeMode 변경
  1. Playwright: Display 탭의 "Light" 버튼 클릭
  2. 검증: document.documentElement.classList.contains('dark') === false
  3. 검증: Playwright 스크린샷에서 배경색이 밝은색

테스트: fontSize 변경
  1. Playwright: Display 탭의 fontSize 슬라이더 조작
  2. 검증: document.body.style.fontSize 값 확인
  3. 검증: Playwright 스크린샷에서 텍스트 크기 변경 확인

테스트: language 변경
  1. Playwright: General 탭의 언어 드롭다운에서 English 선택
  2. 검증: 화면의 텍스트가 영어로 변경 확인
```

---

## 7. Original Source Runtime과의 비교를 더 자주, 더 철저히

### 문제 진단

```text
현재 비교 시점:
  reverse-spec (1회) → SBI 추출 → ... → verify (비교 안 함)
                  ↑ 이것이 유일한 원본 접촉 지점

필요한 비교 시점:
  reverse-spec → specify (원본 스크린샷) → plan (원본 CSS 추출)
  → tasks (원본 파일 매핑) → implement (원본 코드 참조 + 중간 비교)
  → verify (최종 비교)
```

### 개선 방안 7-1: 단계별 원본 비교 의무화

```markdown
## 원본 비교 프로토콜

### specify 단계 (구조 비교)
- Playwright로 원본 앱 주요 화면 캡처
- 탭 수, 영역 구성, 네비게이션 구조 확인
- SBI와 실제 UI 구조 cross-reference
→ reference/ 디렉토리에 스크린샷 저장

### plan 단계 (스타일 비교)
- 원본 소스에서 CSS 수치 추출 (padding, margin, border-radius, colors)
- Tailwind migration table 생성
- 레이아웃 패턴 분석 (flex, grid, absolute positioning)

### implement 단계 (중간 비교 — 매 UI 컴포넌트마다)
- 컴포넌트 구현 → Playwright 스크린샷 → 원본 reference와 비교
- 비교 결과 "확연히 다름" → 즉시 수정
- 비교 결과 "유사함" → 다음 컴포넌트로 진행

### verify 단계 (최종 비교)
- 전체 Feature의 주요 화면을 원본과 나란히 비교
- 레이아웃 비율, 색상, 폰트, 간격 확인
- 인터랙션 동작 비교 (클릭 → 결과 동일한지)
```

### 개선 방안 7-2: 원본 앱 병렬 실행 (Dual CDP)

원본과 구현체를 동시에 CDP로 실행하여 실시간 비교:

```text
Terminal 1: CherryStudio (원본)
  → npx electron cherry-studio --remote-debugging-port=9222

Terminal 2: AngduStudio (구현체)
  → npx electron out/main/index.js --remote-debugging-port=9223

Playwright MCP로 양쪽을 번갈아 스크린샷 캡처하여 비교
```

### 개선 방안 7-3: Parity Check 자동화

verify 단계에서 원본과의 **기능 동등성(parity)**을 체계적으로 검증:

```markdown
## F004 Parity Checklist

### Settings General Tab
- [ ] 언어 변경 → 즉시 반영 (원본 ○ / 구현체 ?)
- [ ] 프록시 설정 → 모드 전환 동작 (원본 ○ / 구현체 ?)
- [ ] send shortcut 변경 → 실제 단축키 반영 (원본 ○ / 구현체 ?)

### Settings Display Tab
- [ ] 테마 전환 → 즉시 반영 (원본 ○ / 구현체 ?)
- [ ] 폰트 크기 변경 → 즉시 반영 (원본 ○ / 구현체 ?)
- [ ] 색상 변경 → 즉시 반영 (원본 ○ / 구현체 ?)

### Settings Data Tab
- [ ] 로컬 백업 생성 → 파일 생성 확인 (원본 ○ / 구현체 ?)
- [ ] WebDAV 연결 테스트 → 결과 표시 (원본 ○ / 구현체 ?)
- [ ] 백업 복원 → 데이터 복원 확인 (원본 ○ / 구현체 ?)
```

---

## 8. Demo Application — Feature의 모든 부분을 검증할 수 있어야 함

### 문제 진단

현재 demo 스크립트의 한계:

```text
현재 demos/F004-settings-data.sh:
  - Electron 앱을 --ci 모드로 실행
  - 빌드 성공 여부만 확인
  - "사용자가 직접 확인하세요" 안내 출력

문제:
  1. 자동화된 기능 검증이 없음
  2. Feature의 일부 기능만 확인 (Settings 페이지 진입만)
  3. Edge case 검증 불가
  4. Cross-feature 동작 검증 불가
  5. "데모"라기보다 "빌드 확인 스크립트"
```

### 개선 방안 8-1: Comprehensive Demo = Feature 기능 전수 검증

Demo는 Feature의 **모든 주요 기능**을 자동으로 시연하고 검증해야 함:

```text
demos/F004-settings-data.sh 개선안:

## Interactive Mode (기본)
1. Electron 앱 실행 (CDP 9222)
2. Playwright로 자동 시연:
   a. Settings 페이지 진입 → 7개 탭 순회 (스크린샷 캡처)
   b. General: 언어 변경 (ko → en → ko)
   c. Display: 테마 변경 (dark → light → dark)
   d. Display: 폰트 크기 변경 (14 → 18 → 14)
   e. AI 제공자: Provider 추가 (OpenAI 타입, 테스트 키)
   f. AI 제공자: Provider 편집 → 삭제
   g. Data: 백업 UI 표시 확인
   h. Shortcuts: 단축키 목록 표시 확인
   i. Quick Phrases: 문구 추가 → 편집 → 삭제
   j. Files 페이지: 파일 목록 표시 확인
   k. MiniApps 페이지: 앱 목록 표시 확인
3. 각 단계에서 스크린샷 저장 → demos/screenshots/F004/
4. 모든 검증 결과 요약 출력

## CI Mode (--ci)
1. 빌드 확인
2. 앱 실행 → 기본 화면 렌더링 확인
3. Settings 페이지 접근 → 탭 렌더링 확인
4. Console error 없음 확인
5. 종료
```

### 개선 방안 8-2: Demo Coverage Matrix

Demo가 Feature의 모든 FR을 커버하는지 추적:

```markdown
## Demo Coverage: F004-settings-data

| FR | 설명 | Demo에서 검증 | 검증 방법 |
|----|------|--------------|----------|
| FR-027 | Settings UI with categorized sections | ✅ | 7개 탭 순회 |
| FR-028 | Backup to local/WebDAV/S3 | ⚠️ UI만 | Data 탭 렌더링 |
| FR-029 | Restore from backup | ⚠️ UI만 | Restore 버튼 존재 |
| FR-030 | File management | ✅ | Files 페이지 진입 |
| FR-031 | Mini app embedding | ✅ | MiniApps 페이지 진입 |
| FR-032 | Keyboard shortcuts | ✅ | Shortcuts 탭 렌더링 |
| FR-033 | Quick phrases | ✅ | CRUD 시연 |
| FR-034 | Immediate persistence | ⚠️ 부분 | 설정 변경 후 재시작 |
| FR-036 | Send message shortcut | ⚠️ UI만 | 선택기 렌더링 |
| FR-037 | Language switching | ✅ | ko → en → ko 전환 |
| FR-038 | Proxy configuration | ⚠️ UI만 | 모드 선택기 렌더링 |
| FR-044 | Display settings | ✅ | 테마/폰트 변경 시연 |

Coverage: 12/18 FRs fully verified, 6/18 UI-only verification
```

### 개선 방안 8-3: Demo Script를 Playwright Test로 작성

쉘 스크립트 대신 Playwright test 형태로 demo를 작성하여 자동 실행 가능하게:

```typescript
// demos/F004-settings-data.spec.ts
import { test, expect } from '@playwright/test'

test.describe('F004 Settings & Data Management Demo', () => {
  test('Settings tabs navigation', async ({ page }) => {
    await page.goto('http://localhost:5173')
    // Navigate to settings
    await page.click('[data-testid="nav-settings"]')
    // Verify all 7 tabs
    for (const tab of ['일반', 'AI 제공자', '디스플레이', '데이터', '단축키', '빠른 문구', '정보']) {
      await expect(page.getByRole('button', { name: tab })).toBeVisible()
    }
  })

  test('Theme switching', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.click('[data-testid="nav-settings"]')
    await page.click('text=디스플레이')
    // Switch to light
    await page.click('text=라이트')
    await expect(page.locator('html')).not.toHaveClass(/dark/)
    // Switch to dark
    await page.click('text=다크')
    await expect(page.locator('html')).toHaveClass(/dark/)
  })

  test('Provider CRUD', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.click('[data-testid="nav-settings"]')
    await page.click('text=AI 제공자')
    // Add provider
    await page.click('text=Add Provider')
    await expect(page.getByRole('dialog')).toBeVisible()
    // Verify provider types
    const select = page.locator('select')
    await expect(select).toContainText('OpenAI')
    await expect(select).toContainText('Anthropic')
  })

  // ... 모든 FR에 대한 테스트
})
```

---

## 9. 종합 개선 로드맵

### P0: 즉시 적용 (다음 Feature 전 반드시)

| # | 개선 | 적용 단계 | 효과 |
|---|------|----------|------|
| 1 | Runtime Verification 필수화 (Playwright 앱 실행 + 스크린샷) | verify | "빌드=완성" 착각 방지 |
| 2 | Side Effect Chain 검증 (store → DOM → 사용자 피드백) | verify | 설정 미반영 방지 |
| 3 | Cross-Feature Impact Analysis | specify | Feature 간 블로커 사전 발견 |
| 4 | 원본 스크린샷 Reference 생성 | specify | UI 형상 기준선 확보 |
| 5 | implement 중간에 Playwright 비교 | implement | 어설픈 UI 즉시 감지 |

### P1: 다음 Feature부터 적용

| # | 개선 | 적용 단계 | 효과 |
|---|------|----------|------|
| 6 | End-to-End Flow Documentation | specify/plan | 전체 동작 체인 사전 파악 |
| 7 | CSS Migration Table | plan | 스타일 수치 정밀 매핑 |
| 8 | Edge Case Matrix | specify/plan | 사전 테스트 설계 |
| 9 | Source-First Implementation | implement | 원본 코드 직접 마이그레이션 |
| 10 | Comprehensive Demo Script | verify | Feature 전수 검증 |

### P2: 점진적 개선

| # | 개선 | 적용 단계 | 효과 |
|---|------|----------|------|
| 11 | 원본 앱 병렬 실행 (Dual CDP) | implement/verify | 실시간 비교 |
| 12 | Demo Coverage Matrix | verify | FR 커버리지 추적 |
| 13 | Playwright Demo Test Suite | verify | 자동화된 전수 검증 |
| 14 | Visual Regression Baseline | verify | 의도하지 않은 변경 감지 |
| 15 | Feature Quality Gate 강화 (단계별) | 전체 | 느슨한 Exit Criteria 보완 |

---

## 10. 기대 효과

```text
현재 (F004 + F005 경험):
  - verify 통과 후 수동 수정 필요: 4-6건/Feature
  - 런타임에서만 발견되는 Critical 버그: 2-3건/Feature
  - UI 형상 불일치: 거의 모든 컴포넌트
  - Cross-feature 블로커: 1-2건/Feature
  - 수정 라운드: 3-5회/Feature

개선 후 기대:
  - verify 통과 후 수동 수정: 0-1건/Feature
  - Runtime Critical 버그: 0건 (사전 감지)
  - UI 형상 불일치: 경미한 차이만 (원본 reference 기반)
  - Cross-feature 블로커: 0건 (Impact Analysis로 사전 해결)
  - 수정 라운드: 0-1회/Feature
```
