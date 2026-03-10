# Spec-Kit Skills 근본 개선: Foundation-First 접근법

> F004 + F005 구현 경험에서 도출한 근본 원인 분석
> 핵심 주장: **Feature를 쌓기 전에 "기반(Foundation)"이 확실히 동작해야 한다**
> 작성: 2026-03-09

---

## 0. 핵심 문제: "Feature 단위 개발"이 근본적으로 틀렸다

현재 spec-kit-skills 파이프라인의 전제:

```text
Feature = 독립적으로 specify → plan → tasks → implement → verify 가능한 단위
```

이 전제가 Electron 앱(그리고 대부분의 프레임워크 기반 앱)에서 **틀렸다**.

```text
현실:
  F001 (app-core)     → Electron shell, IPC bridge, config store
  F002 (ai-provider)  → Provider store, model resolution, AI SDK wiring
  F003 (chat-core)    → Message store, conversation service, Dexie DB
  F004 (settings-data) → Settings UI, backup, file management
  F005 (chat-ui)       → Chat UI components, input bar, messages

  각 Feature는 "독립적"이지 않다.
  F005는 F001의 frameless window + F002의 provider + F003의 message store 위에서만 동작한다.
  F004는 F002의 provider UI + F001의 IPC + CSS theme system 위에서만 동작한다.

  그런데 파이프라인은 각 Feature를 독립적으로 verify한다.
  → F004 verify 통과 + F005 verify 통과
  → 합쳐서 실행하면 기본적인 것조차 안 돌아간다
```

---

## 1. Foundation-First 개발 전략

### 1-1. "기반 계층(Foundation Layer)"을 별도로 개발하고 검증

Feature 파이프라인에 들어가기 전에, **앱이 기본적으로 돌아가는 뼈대**를 먼저 완성:

```text
Foundation Layer (Feature 파이프라인 이전에 완성):

  Layer 0: 프로젝트 뼈대
    - CSS theme system (변수 정의, light/dark, Tailwind 토큰 매핑)
    - 기본 레이아웃 (flex container, w-full 패턴)
    - shadcn/ui 컴포넌트 테마 동작 확인
    - Electron window 기본 동작 (drag, close, minimize)

  Layer 1: 데이터 흐름 뼈대
    - Zustand store → React 컴포넌트 바인딩이 실제로 동작
    - IPC bridge → main ↔ renderer 통신이 실제로 동작
    - Dexie DB → 데이터 persist/hydrate가 실제로 동작

  Layer 2: 핵심 E2E 경로
    - Provider 등록 → Model 선택 → 메시지 전송 → AI 응답 수신
    - 이 한 경로가 end-to-end로 동작하는 것을 확인

  Foundation이 확실히 동작한 후에야 Feature 구현 시작
```

### 1-2. 현재 발생한 문제가 Foundation 누락 때문인 이유

| 문제 | Foundation Layer | Feature |
|------|-----------------|---------|
| CSS theme 변수 없음 → 모든 UI 색상 미표시 | Layer 0 | F004, F005 전부 |
| Settings 탭 선택 표시 안 됨 | Layer 0 (bg-accent 미정의) | F004 |
| Display 설정 변경해도 DOM 미반영 | Layer 1 (store→DOM side effect) | F004 |
| 채팅 메시지 전송해도 AI 응답 없음 | Layer 2 (E2E 경로 미구현) | F005 |
| Provider 추가해도 모델 목록 없음 | Layer 2 (model fetch 미구현) | F004 |
| 창 드래그 불가 | Layer 0 (Electron drag region) | F005 |
| 빈 화면 (무한 리렌더링) | Layer 1 (Zustand 셀렉터 패턴) | F005 |

**7개 문제 중 7개가 Foundation 누락**. Feature 로직 자체의 버그는 0개.

---

## 2. Electron Application 기반 개발 검증

### 2-1. Electron 앱의 필수 기반 체크리스트

Feature 파이프라인에 들어가기 전에 반드시 검증해야 하는 항목:

```markdown
## Electron Foundation Checklist

### Window & Chrome
- [ ] Frameless window에서 드래그 영역이 동작하는가?
- [ ] macOS traffic lights (빨/노/초) 위치가 올바른가?
- [ ] Windows 커스텀 창 컨트롤이 동작하는가?
- [ ] 앱 시작 시 빈 화면 없이 첫 화면이 렌더링되는가?

### Theme & Styling
- [ ] CSS 변수(--background, --foreground, --accent 등)가 정의되어 있는가?
- [ ] dark/light 모드 전환이 실제로 동작하는가?
- [ ] Tailwind 유틸리티(bg-accent, text-muted-foreground 등)가 색상을 렌더링하는가?
- [ ] shadcn/ui 컴포넌트(Button, Dialog, Switch, Select)가 올바르게 표시되는가?

### IPC & Data
- [ ] renderer → main IPC 호출이 동작하는가? (최소 1개 채널 테스트)
- [ ] main → renderer 이벤트 수신이 동작하는가?
- [ ] Zustand persist → electron-store/Dexie 저장이 동작하는가?
- [ ] 앱 재시작 후 저장된 데이터가 복원되는가?

### Navigation
- [ ] 페이지 전환(chat → settings → files 등)이 동작하는가?
- [ ] 각 페이지가 화면 전체를 차지하는가? (w-full, h-full)
```

### 2-2. Foundation Verification은 Playwright로 자동화

```text
Foundation 검증 자동화:

1. npm run build
2. Electron 앱 CDP 실행
3. Playwright로 기본 검증:
   a. 첫 화면 렌더링 확인
   b. 테마 전환 (dark→light→dark) — 배경색 변경 확인
   c. 페이지 전환 — Settings, Files, MiniApps 모두 접근
   d. Settings 탭 클릭 — 활성 탭 하이라이트 확인
   e. IPC 동작 — 설정 변경 → 저장 → 재시작 → 복원 확인

이 검증이 통과하지 않으면 Feature 파이프라인 진입 불가
```

---

## 3. Framework 기반 Web Application 기반 검증

### 3-1. React + Zustand + Tailwind Foundation

Feature와 무관하게, 프레임워크 조합이 올바르게 동작하는지 검증:

```markdown
## React Framework Foundation Checklist

### Zustand + React 19
- [ ] Zustand store의 상태 변경이 컴포넌트에 반영되는가?
- [ ] Zustand persist middleware가 데이터를 저장/복원하는가?
- [ ] Zustand 셀렉터에서 참조 안정성이 유지되는가? (무한 리렌더링 없음)
- [ ] immer middleware와 persist가 함께 동작하는가?

### Tailwind CSS 4 + shadcn/ui
- [ ] @theme inline 블록이 CSS 변수를 Tailwind 토큰으로 매핑하는가?
- [ ] bg-background, text-foreground 등이 실제 색상을 렌더링하는가?
- [ ] dark: 변형이 .dark 클래스로 전환되는가?
- [ ] shadcn/ui Dialog, Select, Switch, Button이 정상 렌더링되는가?

### Side Effect 체인
- [ ] Store 업데이트 → useEffect 감지 → DOM 변경이 동작하는가?
- [ ] CSS 변수 변경 → 실시간 UI 반영이 동작하는가?
- [ ] i18n 언어 변경 → 전체 UI 즉시 반영이 동작하는가?
```

### 3-2. 왜 이 검증이 필요한가

```text
F004 사례:
  - Tailwind CSS 4의 @theme inline이 없어서 모든 색상 미표시
  - 이것은 F004의 버그가 아님 — 프로젝트 초기 설정의 누락
  - 하지만 F004 verify에서는 "빌드 성공"으로 통과

F005 사례:
  - Zustand 5.x + React 19에서 셀렉터 참조 안정성 문제
  - 이것은 F005의 버그가 아님 — 프레임워크 조합의 패턴 문제
  - 하지만 F005 verify에서는 "테스트 통과"로 통과

공통점: 프레임워크 기반의 문제를 Feature 파이프라인이 감지하지 못함
```

---

## 4. UI Framework 기반 검증

### 4-1. shadcn/ui + Tailwind 테마 시스템 검증

```markdown
## UI Framework Foundation Checklist

### CSS 변수 시스템
- [ ] :root에 light 모드 변수가 정의되어 있는가?
- [ ] .dark에 dark 모드 변수가 정의되어 있는가?
- [ ] 변수 형식이 HSL (예: "240 10% 3.9%")인가?
- [ ] @theme inline 블록이 hsl(var(--xxx))로 매핑하는가?

### 컴포넌트 렌더링
- [ ] Button 컴포넌트가 primary/secondary/destructive 색상으로 표시되는가?
- [ ] Dialog가 오버레이 + 센터 정렬로 표시되는가?
- [ ] Switch가 on/off 상태를 시각적으로 구분하는가?
- [ ] Select가 드롭다운 화살표와 옵션 목록을 표시하는가?

### 레이아웃 패턴
- [ ] flex container의 자식이 전체 너비를 차지하는가? (w-full/flex-1)
- [ ] 스크롤 가능한 영역이 올바르게 overflow 처리되는가?
- [ ] border-border, bg-muted, text-muted-foreground가 올바른 색상인가?
```

### 4-2. UI 형상 기준선 확보

원본 CherryStudio의 UI를 **런타임**에서 캡처하여 기준선으로 사용:

```text
Foundation 설정 시:

1. 원본 CherryStudio 실행 → 주요 화면 스크린샷
   - 전체 레이아웃 (사이드바 + 콘텐츠)
   - 설정 페이지 (탭 네비게이션 + 콘텐츠)
   - 입력바 (둥근 모서리, 도구 바)
   - 메시지 영역 (전체 너비, 스타일)

2. 스크린샷에서 핵심 수치 추출:
   - sidebar 너비: 260px
   - navbar 높이: 40px
   - input bar border-radius: 17px
   - 색상: primary #00b96b, background dark #181818

3. 이 수치를 Foundation에 반영:
   - CSS 변수 값 설정
   - 레이아웃 기본값 설정
   - 컴포넌트 스타일 기본값 설정

4. Playwright로 "Foundation 스크린샷" 캡처 → baseline으로 저장
```

---

## 5. 개선된 파이프라인 구조

### 5-1. 현재 vs 개선

```text
현재:
  reverse-spec → SBI
  → F001 (specify→plan→tasks→implement→verify)
  → F002 (specify→plan→tasks→implement→verify)
  → F003 (specify→plan→tasks→implement→verify)
  → F004 (specify→plan→tasks→implement→verify)  ← 여기서 CSS 변수 누락 발견
  → F005 (specify→plan→tasks→implement→verify)  ← 여기서 Zustand 패턴 문제 발견

  문제: Foundation 문제를 Feature N번째에서야 발견. 그때는 이미 수정 비용 막대.

개선:
  reverse-spec → SBI

  ★ Phase 0: Foundation Setup & Verification ★
    → Electron shell 기본 동작 검증
    → CSS theme 시스템 완성 + 시각적 검증 (Playwright)
    → Zustand + React 바인딩 패턴 검증
    → IPC bridge E2E 검증
    → 핵심 E2E 경로 (Provider→Model→Send→Response) 스켈레톤 검증
    → Foundation Playwright 스크린샷 baseline 저장
    ✅ Foundation PASS → Feature 파이프라인 진입 허가

  → F001 (specify→plan→tasks→implement→verify)
  → F002 (specify→plan→tasks→implement→verify)
  → ...

  차이점:
    - Foundation에서 CSS 변수, 레이아웃 패턴, Zustand 패턴이 확정됨
    - 각 Feature는 Foundation 위에서 구현하므로 기본적인 것은 이미 동작
    - Feature verify는 Feature 고유 기능만 검증하면 됨
```

### 5-2. Foundation Phase 구체 항목

```markdown
## Foundation Phase (Feature 파이프라인 진입 전 필수)

### Step 1: CSS Theme System
- index.css에 shadcn/ui CSS 변수 정의 (light + dark)
- @theme inline으로 Tailwind v4 토큰 매핑
- body 기본 색상 + border 기본 색상 설정
- Playwright: 빈 페이지에서 bg-background, text-foreground 색상 확인

### Step 2: Core Layout Pattern
- flex container + w-full 패턴 확립
- 페이지 컴포넌트 기본 구조 (h-full w-full flex)
- overflow 처리 패턴 확립
- Playwright: 빈 페이지에서 전체 너비 차지 확인

### Step 3: Zustand Pattern Validation
- 셀렉터 참조 안정성 테스트 (원시값만 반환, useMemo 파생)
- persist middleware 동작 테스트 (저장 → 재시작 → 복원)
- immer + persist 조합 테스트
- 단위 테스트: 1개 store로 전체 패턴 검증

### Step 4: IPC Bridge Validation
- renderer → main 호출 1건 실제 동작 확인
- main → renderer 이벤트 1건 실제 동작 확인
- 채널 네이밍 규칙 (kebab-case) 자동 테스트

### Step 5: E2E Skeleton
- Provider 등록 → Model 목록 표시 → Model 선택 → Send → AI 응답
- 이 전체 경로가 스켈레톤 수준에서 동작하는 것을 확인
- 각 단계에서 데이터가 올바르게 전달되는지 확인

### Step 6: Playwright Baseline
- 앱 실행 → 주요 5개 화면 스크린샷 캡처
- 원본 CherryStudio 스크린샷과 대조
- 레이아웃 비율, 기본 색상, 요소 배치 확인
- baseline 스크린샷 저장 → 이후 regression 비교 기준
```

---

## 6. Foundation 검증 자동화

### 6-1. Foundation Test Suite

```text
tests/foundation/
  ├── theme.test.ts          # CSS 변수 존재 확인, light/dark 전환
  ├── layout.test.ts         # 기본 레이아웃 패턴 (flex, w-full)
  ├── zustand-patterns.test.ts  # 셀렉터 안정성, persist
  ├── ipc-bridge.test.ts     # IPC 채널 동작 + 네이밍 규칙
  └── e2e-skeleton.test.ts   # Provider → Model → Send → Response
```

이 테스트가 **모든 Feature의 implement/verify 전에** 실행됨.

### 6-2. Foundation CI Gate

```text
Feature 파이프라인 verify 시:

Step 0: Foundation 테스트 실행
  → 실패 시: "Foundation 문제 발견. Feature verify 중단."
  → 성공 시: Feature verify 진행

이렇게 하면:
  - CSS 변수 누락 → Foundation 테스트에서 즉시 감지
  - Zustand 패턴 오류 → Foundation 테스트에서 즉시 감지
  - IPC 네이밍 규칙 위반 → Foundation 테스트에서 즉시 감지
  - 레이아웃 패턴 오류 → Foundation 테스트에서 즉시 감지
```

---

## 7. 원본 소스 Runtime 분석 강화

### 7-1. 원본 앱 E2E 동작 캡처

Feature 구현 전에, 원본 앱의 **실제 동작**을 Playwright로 캡처하여 기록:

```text
원본 동작 캡처 프로토콜:

1. 원본 앱(CherryStudio) CDP 실행
2. 주요 사용자 시나리오를 Playwright로 수행:
   a. 설정 열기 → 각 탭 클릭 → 스크린샷
   b. 테마 변경 → 스크린샷
   c. Provider 추가 → Model 목록 확인 → 스크린샷
   d. 채팅 메시지 전송 → AI 응답 수신 → 스크린샷
   e. 파일 업로드 → 목록 확인 → 스크린샷
3. 각 단계의:
   - 스크린샷 저장 (reference/)
   - DOM 구조 저장 (browser_snapshot YAML)
   - Console 출력 확인 (에러 없음)
   - 데이터 흐름 확인 (어떤 API 호출이 발생하는지)
```

### 7-2. 구현된 소스와의 비교 의무화

```text
implement 중간 검증 (매 페이지/컴포넌트 완료 시):

1. 구현된 앱 실행 → 해당 페이지 스크린샷
2. 원본 reference 스크린샷과 비교:
   - 레이아웃 구조 일치?
   - 요소 위치/크기 유사?
   - 색상/스타일 유사?
3. 비교 결과가 "확연히 다름" → 즉시 수정
4. "유사함" → 다음 진행
```

### 7-3. Runtime 비교 빈도

```text
현재: 전혀 안 함 (verify에서도 안 함)

개선:
  - Foundation Phase: 원본 캡처 + baseline 저장 (1회)
  - specify: 원본 스크린샷으로 SBI 검증 (매 Feature)
  - implement: 컴포넌트 완료 시 중간 비교 (매 UI 컴포넌트)
  - verify: 최종 비교 (매 Feature)

  총 비교 횟수: Feature당 최소 3회 (specify + implement + verify)
```

---

## 8. Demo Application 개선

### 8-1. Demo = Feature의 모든 부분을 검증

```text
현재 Demo:
  - 쉘 스크립트로 빌드 확인
  - "사용자가 직접 확인하세요" 메시지
  - Feature 기능의 10% 정도만 확인

개선 Demo:
  - Playwright 기반 자동 시연 + 검증
  - Feature의 모든 FR을 순회
  - 각 단계에서 스크린샷 + 결과 검증
  - "Demo Pass/Fail" 판정 → verify 결과에 반영
```

### 8-2. Demo Coverage 요구사항

```text
Demo는 Feature의 모든 주요 기능을 커버해야 함:

  F004 Demo Coverage:
  ✅ Settings 7개 탭 모두 접근 + 렌더링 확인
  ✅ General: 언어 변경 → UI 즉시 반영
  ✅ Display: 테마/폰트 변경 → DOM 즉시 반영
  ✅ AI 제공자: Provider 추가 → 모델 목록 로드
  ✅ Data: 백업 UI 렌더링
  ✅ Shortcuts: 단축키 목록 표시
  ✅ Quick Phrases: CRUD 동작
  ✅ Files: 파일 목록 표시
  ✅ MiniApps: 앱 목록 표시

  누락 시 Demo FAIL → verify FAIL
```

---

## 9. 종합: 개선된 파이프라인 전체 흐름

```text
┌─────────────────────────────────────────────────────────────┐
│ Phase 0: Foundation Setup & Verification                      │
│                                                               │
│ 1. CSS Theme System 완성 + 시각적 검증                         │
│ 2. Core Layout Pattern 확립 + 검증                             │
│ 3. Zustand Pattern 검증 (셀렉터, persist, immer)                │
│ 4. IPC Bridge 검증 (양방향 통신, 네이밍 규칙)                     │
│ 5. E2E Skeleton 검증 (Provider→Model→Send→Response)            │
│ 6. 원본 앱 스크린샷 캡처 → Reference baseline 저장              │
│ 7. Playwright Foundation 스크린샷 → Baseline 저장               │
│                                                               │
│ ✅ Foundation PASS → Feature 파이프라인 진입 허가               │
│ ❌ Foundation FAIL → Feature 진입 불가, Foundation 수정 필요     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Feature Pipeline (각 Feature마다)                              │
│                                                               │
│ specify:                                                      │
│   + 원본 스크린샷으로 SBI 검증                                  │
│   + upstream Feature 영향 분석                                 │
│   + E2E Flow Documentation                                    │
│                                                               │
│ plan:                                                         │
│   + Anti-pattern registry                                     │
│   + CSS migration table (원본 수치)                             │
│   + Side effect chain 정의                                     │
│                                                               │
│ tasks:                                                        │
│   + 원본 파일 매핑                                             │
│   + 시각적 검증 태스크 포함                                     │
│   + Edge case matrix                                          │
│                                                               │
│ implement:                                                    │
│   + 원본 코드 직접 참조 (Source-First)                          │
│   + 컴포넌트 완료 시 Playwright 중간 비교                       │
│   + Foundation 테스트 수시 실행                                 │
│                                                               │
│ verify:                                                       │
│   Phase 0: Foundation 테스트 재실행                             │
│   Phase 1: Build + Test + Type check                          │
│   Phase 2: Runtime 실행 + Playwright 검증                      │
│   Phase 3: 원본 비교 + Demo 전수 검증                           │
│   Phase 4: Global evolution update                            │
│                                                               │
│ ✅ All Pass → Merge 허가                                      │
│ ❌ Any Fail → 해당 Phase로 돌아가서 수정                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. 이 개선이 적용되었다면 F004/F005에서 무엇이 달랐을까

```text
Foundation Phase에서 발견되었을 문제 (Feature 파이프라인 진입 전):
  ✅ CSS 변수 누락 → Theme 테스트에서 즉시 발견, 전체 Feature에 영향 방지
  ✅ Zustand 셀렉터 패턴 → Pattern 테스트에서 즉시 발견, F005 무한 리렌더링 방지
  ✅ IPC 네이밍 규칙 → IPC 테스트에서 즉시 발견
  ✅ 레이아웃 패턴 (w-full) → Layout 테스트에서 즉시 발견
  ✅ E2E 경로 (Send→Response) → Skeleton 테스트에서 스켈레톤 수준 동작 확인

Feature 파이프라인에서 발견되었을 문제 (specify/plan/implement):
  ✅ 원본 탭 구조 (2개 vs 3개) → specify에서 원본 스크린샷으로 발견
  ✅ InputBar 스타일 불일치 → plan의 CSS migration table에서 발견
  ✅ Display 설정 side effect 누락 → plan의 side effect chain에서 발견
  ✅ Provider 설정 UI 필요성 → specify의 cross-feature impact analysis에서 발견

수동 수정이 필요했을 문제:
  → 거의 없음. 기본적인 것은 Foundation에서, Feature 고유 문제는 파이프라인에서 해결.

현재: Feature당 수동 수정 4-6건, 3-5회 수정 라운드
개선: Feature당 수동 수정 0-1건, 0-1회 수정 라운드
```

---

## 11. 즉시 실행 가능한 액션 아이템

### 지금 당장 (다음 Feature 전에)

1. **index.css에 CSS theme 변수 추가** — 이미 이번 세션에서 수행
2. **Foundation Test Suite 작성** — tests/foundation/ 디렉토리
3. **원본 CherryStudio 주요 화면 스크린샷 캡처** — specs/reference/
4. **Zustand 패턴 가이드 문서화** — plan 템플릿에 anti-pattern 섹션 추가
5. **E2E Skeleton 테스트** — Provider → Model → Send → Response

### smart-sdd pipeline에 Foundation Phase 추가

6. **`/smart-sdd foundation`** 명령 추가 — Foundation 검증 실행
7. **pipeline 시작 시 Foundation 검증 자동 실행** — 실패 시 HARD STOP
8. **verify Phase 0에 Foundation 재검증 추가** — Feature가 Foundation을 깨뜨리지 않았는지 확인

### 장기적으로

9. **Playwright 기반 Demo 자동화** — 쉘 스크립트 → Playwright test
10. **Visual Regression** — Foundation baseline과 자동 비교
11. **원본 앱 병렬 CDP 비교** — implement 중 실시간 비교

---

## 12. Plugin/Dependency 설치 유도 방안

### 12-1. 문제: 필수 플러그인 미설치로 기능 불가

```text
F004/F005에서 발생한 플러그인 관련 문제:

1. Playwright MCP 미설치/미연결
   → verify에서 런타임 검증 불가 → 빌드 성공만으로 통과
   → 실제로는 UI가 전혀 동작하지 않는 상태를 놓침

2. shadcn/ui 컴포넌트 미설치
   → plan에서 Dialog, Select, Switch 사용 명시
   → 하지만 실제 컴포넌트 파일이 없으면 빌드 실패
   → 개별 Feature마다 필요한 컴포넌트를 수동 추가

3. npm 패키지 미설치
   → plan에서 명시한 패키지가 실제로 설치되어 있지 않으면 implement 실패
   → 하지만 파이프라인은 이를 사전 검증하지 않음

4. MCP 서버 설정 누락
   → Playwright MCP, Filesystem MCP 등 verify/implement에 필요한 MCP 서버가
     세션마다 연결 상태가 달라 불안정
```

### 12-2. Plugin Dependency Declaration (의존성 선언)

Feature의 plan.md에 필수 플러그인/도구를 명시적으로 선언:

```markdown
## Required Plugins & Tools

### MCP Servers (Runtime Verification)
| MCP Server | Purpose | Install Command | Required Phase |
|------------|---------|-----------------|----------------|
| playwright | UI 검증, 스크린샷 비교 | `claude mcp add playwright -- npx @playwright/mcp@latest` | verify |
| filesystem | 파일 조작 검증 | (built-in) | implement |

### npm Packages (Build Dependencies)
| Package | Version | Purpose | Install |
|---------|---------|---------|---------|
| ai | ^6.0.0 | Vercel AI SDK | `npm i ai` |
| @ai-sdk/openai | ^1.0.0 | OpenAI provider | `npm i @ai-sdk/openai` |
| sonner | ^2.0.0 | Toast notifications | `npm i sonner` |

### shadcn/ui Components
| Component | Used In | Install |
|-----------|---------|---------|
| Dialog | ProviderSettings, BackupDialog | `npx shadcn@latest add dialog` |
| Select | ModelSelector, SettingsForm | `npx shadcn@latest add select` |
| Switch | SettingsToggle | `npx shadcn@latest add switch` |
| Tabs | SettingsPage | `npx shadcn@latest add tabs` |
```

### 12-3. Pre-Flight Dependency Check (사전 의존성 검증)

파이프라인 각 단계 진입 전에 자동으로 의존성을 검증:

```text
Pipeline Pre-Flight Check (매 단계 진입 시):

Step 1: npm 패키지 검증
  → package.json의 dependencies에 plan에 명시된 패키지가 있는지 확인
  → 누락 시: "다음 패키지가 필요합니다: [목록]. 설치하시겠습니까? (Y/n)"
  → 승인 시: `npm install [패키지 목록]` 자동 실행

Step 2: shadcn/ui 컴포넌트 검증
  → src/renderer/src/components/ui/ 디렉토리에서 필요 컴포넌트 파일 존재 확인
  → 누락 시: "다음 shadcn/ui 컴포넌트가 필요합니다: [목록]. 설치하시겠습니까? (Y/n)"
  → 승인 시: `npx shadcn@latest add [컴포넌트 목록]` 자동 실행

Step 3: MCP 서버 검증 (verify 단계만)
  → ToolSearch로 playwright 도구 사용 가능 여부 확인
  → 불가 시: "Playwright MCP가 필요합니다. 설치 방법:"
    → `claude mcp add --scope user playwright -- npx @playwright/mcp@latest`
    → "설치 후 세션을 재시작하세요."
  → HARD STOP: MCP 없이는 verify 진행 불가 (빌드만 확인하는 것은 불충분)

Step 4: 빌드 도구 검증
  → electron-vite, TypeScript 등 빌드에 필요한 도구 확인
  → package.json scripts에 build, dev 등 필수 스크립트 존재 확인
```

### 12-4. Auto-Install Strategy (자동 설치 전략)

```text
자동 설치 수준별 정책:

Level 1: 자동 설치 (사용자 확인 불필요)
  - devDependencies 내 이미 선언된 패키지의 node_modules 재설치 (npm install)
  - 이미 package.json에 있지만 node_modules에 없는 경우

Level 2: 확인 후 설치 (사용자 승인 필요)
  - 새로운 npm 패키지 추가 (package.json 변경)
  - shadcn/ui 컴포넌트 추가 (파일 생성)
  - 설치 목록을 보여주고 "설치하시겠습니까?" 확인

Level 3: 가이드만 제공 (자동 설치 불가)
  - MCP 서버 설치 (세션 재시작 필요)
  - 시스템 도구 (Playwright browser, Node.js 버전 등)
  - 환경 변수 설정 (API 키 등)
  - 설치 명령어와 설명을 출력하고 HARD STOP
```

### 12-5. Foundation Phase에서의 Plugin Verification

```text
Foundation Phase (Phase 0)에서 전체 프로젝트 의존성 일괄 검증:

1. 프로젝트 tech stack에서 필수 패키지 도출:
   - Electron 앱 → electron, electron-vite, electron-store
   - React 19 → react, react-dom, @types/react
   - Zustand 5 → zustand
   - shadcn/ui → tailwindcss, @radix-ui/*, class-variance-authority, clsx
   - AI SDK → ai, @ai-sdk/openai, @ai-sdk/anthropic
   - i18n → i18next, react-i18next

2. shadcn/ui 기본 컴포넌트 사전 설치:
   → Button, Dialog, Input, Select, Switch, Tabs, Label
   → 모든 Feature에서 공통으로 사용하는 컴포넌트를 미리 설치
   → Feature별로 추가 컴포넌트만 후속 설치

3. MCP 서버 연결 검증:
   → Playwright MCP 연결 테스트
   → 실패 시: 설치 가이드 출력 + Foundation FAIL
   → "MCP 없이는 런타임 검증이 불가능합니다. 설치 후 재시작하세요."

4. 검증 결과를 Foundation Report에 기록:
   ✅ npm packages: 32/32 installed
   ✅ shadcn/ui components: 7/7 installed
   ✅ MCP servers: playwright (connected)
   ✅ Build tools: electron-vite, tsc (available)
```

### 12-6. plan.md 템플릿에 Plugin Section 추가

spec-kit의 plan 템플릿에 의존성 섹션을 필수 항목으로 추가:

```markdown
## Dependencies & Plugins (REQUIRED)

### New npm Packages (이 Feature에서 새로 추가하는 패키지)
<!-- plan 작성 시 반드시 기재. implement에서 Pre-Flight Check가 이 목록을 사용. -->

### New shadcn/ui Components (이 Feature에서 새로 사용하는 컴포넌트)
<!-- 이미 설치된 컴포넌트는 제외. 새로 필요한 것만 기재. -->

### MCP Requirements (verify에 필요한 MCP 서버)
<!-- playwright, filesystem 등. verify 단계에서 Pre-Flight Check가 확인. -->

### Environment Requirements (환경 변수, API 키 등)
<!-- implement/verify에 필요한 환경 설정. Level 3 가이드로 제공. -->
```

### 12-7. 실행 예시: F004에서의 Plugin Pre-Flight

```text
F004 implement 시작 시 Pre-Flight Check 실행 예시:

┌─ Pre-Flight Dependency Check ─────────────────────────┐
│                                                        │
│ ✅ npm packages                                        │
│    ai@6.0.0 ............................ installed      │
│    sonner@2.0.1 ........................ installed      │
│    react-hook-form@7.x ................ installed      │
│    zod@3.x ............................ installed      │
│                                                        │
│ ⚠️  shadcn/ui components                              │
│    dialog ............................. installed      │
│    select ............................. installed      │
│    switch ............................. installed      │
│    tabs ............................... ❌ MISSING     │
│    accordion .......................... ❌ MISSING     │
│    slider ............................. ❌ MISSING     │
│                                                        │
│ 3 components missing. Install now? (Y/n): Y           │
│ → Running: npx shadcn@latest add tabs accordion slider│
│ ✅ 3 components installed                             │
│                                                        │
│ ✅ MCP servers                                        │
│    playwright ......................... connected      │
│                                                        │
│ ✅ Pre-Flight PASS — proceeding to implement          │
└────────────────────────────────────────────────────────┘
```

### 12-8. 기대 효과

```text
Plugin 설치 유도 적용 전:
  - implement 중 빌드 실패 → 누락 패키지 발견 → 수동 설치 → 재시도
  - verify에서 Playwright MCP 없음 → 빌드만 확인 → 런타임 버그 놓침
  - Feature마다 shadcn/ui 컴포넌트 수동 설치 → 누락/불일치 발생

Plugin 설치 유도 적용 후:
  - Foundation에서 공통 의존성 일괄 설치 → 기본 환경 보장
  - Pre-Flight Check에서 누락 자동 감지 → 사용자 승인 후 즉시 설치
  - MCP 미연결 시 HARD STOP → "빌드만 통과" 방지
  - 예상 시간 절약: Feature당 15-30분 (수동 디버깅/설치 시간)
```
