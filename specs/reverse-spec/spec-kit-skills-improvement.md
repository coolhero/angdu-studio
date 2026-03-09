# spec-kit-skills 파이프라인 개선 방향

> 원본 소스(CherryStudio)를 정확히 재구현하기 위해 spec-kit-skills 파이프라인 각 단계를 어떻게 보완해야 하는지 정리한 문서.
> F005-chat-ui 구현 과정에서 발견된 문제를 기반으로 작성.

---

## 0. 핵심 진단: 왜 기본적인 것조차 안 되었는가

F005-chat-ui 구현 후 실제 앱을 실행했을 때 다음과 같은 **기본적인** 문제가 발생:

| 문제 | 심각도 | 원인 단계 |
|------|--------|----------|
| 창 드래그 불가 (frameless window인데 drag region 없음) | Critical | specify — upstream F001 의존성 미반영 |
| 빈 화면 (무한 리렌더링) | Critical | plan — Zustand 셀렉터 anti-pattern 미지정 |
| 채팅 영역이 화면 절반만 차지 | Major | implement — `w-full` 누락, flex 레이아웃 미이해 |
| textarea 깜빡임 | Major | plan — useLayoutEffect vs useEffect 가이드 부재 |
| 3개 탭 (원본은 2개) | Major | specify — SBI 해석 오류, 원본 미검증 |
| 입력바 스타일 불일치 | Minor | implement — 원본 CSS 값 미참조 |

**공통 근본 원인**: 파이프라인이 **추상화된 요약(SBI)**만 전달하고, **원본 소스 코드**를 직접 참조하지 않음.

### Electron 앱 기본 동작이 안 된 이유

Electron frameless window는 일반 웹앱과 달리 추가 UX 요구사항이 있다:

```text
titleBarStyle: 'hiddenInset' (macOS) / frame: false (Windows)
→ OS 기본 타이틀바가 없음
→ 앱 자체에서 -webkit-app-region: drag 영역을 지정해야 창 이동 가능
→ 버튼 등 인터랙티브 요소는 -webkit-app-region: no-drag 필요
→ macOS는 traffic lights(신호등 버튼)를 위한 좌측 패딩 필요
```

이것은 F001(app-core)에서 이미 결정된 사항이지만, F005(chat-ui) specify 단계에서:

1. **F001의 구현 결과물을 읽지 않았음** — `titleBarStyle` 설정 존재를 모름
2. **Electron frameless window의 필수 UX 패턴을 도출하지 않았음** — SBI에 "window dragging" 항목 자체가 없음
3. **upstream feature → downstream UI 요구사항 자동 도출 메커니즘이 없음**

결과: 빌드 성공, 테스트 통과, verify 통과 → merge 후 앱 실행 → **창을 움직일 수 없음**

---

## 1. specify 단계 개선

### 현재 문제

- SBI(Source Behavior Inventory) 요약이 원본의 구현 디테일을 손실
- upstream feature의 구현이 downstream에 미치는 영향을 분석하지 않음
- 원본 소스를 직접 확인하지 않고 SBI 텍스트만으로 spec 작성

### 개선 1-1: Upstream Implementation Scan

specify 시작 전, upstream feature의 **실제 구현 코드**를 스캔하여 downstream에 필요한 요구사항을 자동 도출:

```text
[입력] F001 구현 결과: src/main/index.ts — titleBarStyle: 'hiddenInset'
[도출] F005 필수 요구사항: "Navbar에 -webkit-app-region: drag 지정"
[도출] F005 필수 요구사항: "macOS traffic lights 영역 (좌측 70px) 패딩"
[도출] F005 필수 요구사항: "모든 인터랙티브 요소에 no-drag 지정"
```

구현 방법:
- specify 단계 앞에 "Upstream Impact Analysis" 단계 추가
- upstream feature의 구현 파일을 읽고, 플랫폼 특성(Electron, Web, Mobile 등)에 따른 필수 UX 패턴을 체크리스트로 검증

### 개선 1-2: Source Structure Verification

SBI 항목을 spec으로 변환할 때, 원본 소스의 **실제 구조**를 확인:

```text
SBI: "B105: Manage sidebar tabs (assistants, topics, sessions)"
→ 현재: "3개 탭으로 구현" (SBI 텍스트만 보고 해석)
→ 개선: 원본 HomeTabs.tsx 직접 확인 → "2개 탭 (Sessions는 Topics 내부 조건부 뷰)"
```

**Playwright MCP 활용**: 원본 앱을 CDP로 연결하여 실제 탭 구조를 스크린샷으로 확인

### 개선 1-3: Platform Pattern Checklist

Electron 앱의 필수 UX 패턴을 체크리스트로 관리:

```markdown
## Electron Frameless Window Checklist
- [ ] Navbar에 -webkit-app-region: drag 지정
- [ ] 모든 버튼/입력에 -webkit-app-region: no-drag 지정
- [ ] macOS: traffic lights 영역 좌측 패딩 (70px)
- [ ] Windows: 커스텀 창 컨트롤 버튼 (최소화/최대화/닫기)
- [ ] Linux: 적절한 drag 영역 + 창 컨트롤

## Electron IPC Checklist
- [ ] 렌더러에서 Node.js API 직접 접근 금지 (window.api 사용)
- [ ] contextBridge로 노출된 API만 사용
- [ ] 파일 시스템 접근은 main process 경유
```

이 체크리스트를 specify 단계에서 자동 참조하여 누락된 요구사항을 추가.

---

## 2. plan 단계 개선

### 현재 문제

- "Zustand 5.x 사용", "Tailwind CSS 4 사용"처럼 **라이브러리 선택만** 명시
- **사용 패턴과 anti-pattern**을 규정하지 않아 implement에서 잘못된 패턴 적용
- 원본 소스의 스타일 수치(padding, border-radius 등)를 추출하지 않음

### 개선 2-1: Anti-Pattern Registry

plan에 각 기술 스택의 **known anti-pattern**을 명시적으로 나열:

```markdown
## Anti-Pattern Registry

### Zustand 5.x + React 19
- ❌ 셀렉터에서 .filter(), .map(), .find() 등 새 참조 생성 → 무한 리렌더링
- ❌ 셀렉터에서 spread({ ...obj }) 사용 → 매 렌더마다 새 객체
- ✅ 원시값 또는 안정 참조만 반환하는 셀렉터 사용
- ✅ 파생 데이터는 useMemo로 컴포넌트 내에서 계산

### DOM 조작
- ❌ useEffect로 DOM 측정/조작 → 레이아웃 깜빡임
- ✅ useLayoutEffect로 DOM 측정/조작 (페인트 전 동기 실행)
- ❌ overflow: auto 상태에서 scrollHeight 측정 → 스크롤바 너비 변동
- ✅ overflow: hidden 후 측정 → 결과 적용 후 overflow 복원

### Flex 레이아웃
- ❌ flex 부모의 자식에 w-full 누락 → content-based width
- ✅ flex-row 부모에서 자식이 전체 너비 차지하려면 w-full 또는 flex-1 필수
```

### 개선 2-2: Source Style Extraction

plan 단계에서 원본 소스의 **구체적 CSS 수치**를 추출하여 migration 매핑 테이블 생성:

```markdown
## Style Migration Table

| 원본 (styled-components) | Tailwind 변환 | 컴포넌트 |
|--------------------------|---------------|---------|
| border-radius: 17px | rounded-[17px] | InputBar container |
| padding: 6px 15px | px-[15px] py-[6px] | textarea |
| min-height: 30px | min-h-[30px] | textarea |
| max-height: 500px | max-h-[500px] | textarea |
| padding: 18px bottom | pb-[18px] | InputBar wrapper |
| width: 100% (no max-width) | w-full (max-w 없음) | Messages area |
```

이 테이블을 implement 단계에서 **직접 참조**하여 정확한 수치 적용.

---

## 3. tasks 단계 개선

### 현재 문제

- 기능 구현 태스크만 있고 **시각적 검증** 태스크가 없음
- 원본과의 **구조 비교** 태스크가 없음
- 구현량 예측이 부정확 (원본 복잡도 미분석)

### 개선 3-1: Visual Verification Tasks

각 UI 컴포넌트 구현 후 시각적 검증 태스크를 자동 추가:

```markdown
- [ ] T015 [US1] Implement InputbarCore in src/renderer/src/pages/home/Inputbar/InputbarCore.tsx
- [ ] T016 [US1] **[VERIFY]** Playwright 스크린샷으로 InputbarCore 레이아웃 검증
  - border-radius, padding, 전체 너비 차지 여부 확인
  - 원본 CherryStudio 스크린샷과 비교
```

### 개선 3-2: Complexity Estimation

tasks 생성 전 원본과의 **복잡도 비교**를 수행:

```text
원본 CherryStudio chat UI: ~3,346 lines (core components)
현재 angdu-studio: ~883 lines (구현 완료 후)
구현률: ~31% → 핵심 기능만 구현, 많은 기능 누락

원본 파일별 복잡도:
- InputbarCore.tsx: 801 lines → 태스크 최소 8개 필요
- Chat.tsx: 320 lines → 태스크 최소 4개 필요
- MessageGroup.tsx: 350 lines → 태스크 최소 4개 필요
```

이 분석을 기반으로 태스크 수와 난이도를 현실적으로 산정.

### 개선 3-3: Source File Mapping

각 태스크에 **원본 소스 파일 경로**를 명시:

```markdown
- [ ] T015 [US1] Implement InputbarCore
  - 원본: cherry-studio/src/renderer/src/pages/home/Inputbar/InputbarCore.tsx (801 lines)
  - 타겟: angdu-studio/src/renderer/src/pages/home/Inputbar/InputbarCore.tsx
  - 핵심 기능: TipTap 에디터, 단축키 처리, 파일 첨부, 멘션
```

---

## 4. implement 단계 개선 (가장 큰 갭)

### 현재 문제

- **원본 코드를 참조하지 않고** SBI 요약만으로 구현
- generic 스타일(ChatGPT-style max-w-3xl 등) 적용 → 원본과 불일치
- 컴포넌트가 등록만 되고 실제 구현은 `() => null` → 빈 껍데기

### 실제 갭 데이터 (F005-chat-ui)

```text
전체 구현율: ~31% (883 / 3,346 lines)

InputbarCore.tsx: 원본 801줄 → 구현 98줄 (88% 미구현)
  - 누락: TipTap 에디터, slash commands, mentions, 파일 드래그앤드롭
  - 구현: plain textarea + 기본 전송 버튼만

Chat.tsx: 원본 320줄 → 구현 68줄 (78% 미구현)
  - 누락: generation state guard, multi-model 응답, abort 처리
  - 구현: 기본 메시지 표시 + 전송만

Input Tools: 16개 등록 → 대부분 render: () => null
  - 누락: 실제 도구 UI (webSearch, knowledgeBase, mcpTools 등)
  - 구현: 도구 레지스트리 구조만 존재

MessageContent: 11개 블록 타입 → 대부분 기본 텍스트만
  - 누락: code execution, HTML artifact, thinking collapse, tool call UI
  - 구현: main_text + error 기본 렌더링만
```

### 개선 4-1: Source-First Implementation

**"SBI → 구현"이 아닌 "원본 코드 → 마이그레이션"으로 접근 전환:**

```text
현재 흐름:
  SBI 요약 → plan → tasks → implement (원본 코드 미참조)
  → 추상적 기능 설명만으로 구현 → 원본과 다른 결과

개선 흐름:
  SBI 요약 → plan → tasks → implement 시 원본 코드 직접 읽기
  → 원본의 로직, 스타일, 구조를 1:1 마이그레이션
  → 기술 스택만 변환 (styled-components → Tailwind, Redux → Zustand)
```

구체적으로 implement 단계에서:

1. **원본 파일 읽기**: 해당 컴포넌트의 원본 소스를 먼저 읽음
2. **로직 추출**: 상태 관리, 이벤트 핸들링, 조건부 렌더링 등 핵심 로직 파악
3. **기술 변환**: styled-components → Tailwind, Redux → Zustand, Ant Design → shadcn/ui
4. **수치 보존**: padding, margin, border-radius 등 구체적 CSS 값 유지
5. **검증**: Playwright로 렌더링 결과 비교

### 개선 4-2: Component Migration Checklist

각 컴포넌트 마이그레이션 시 체크리스트:

```markdown
## Component: InputbarCore

### 원본 분석 (cherry-studio/src/.../InputbarCore.tsx)
- [ ] 상태 변수 목록 추출
- [ ] 이벤트 핸들러 목록 추출
- [ ] CSS 수치 추출 (padding, margin, border-radius 등)
- [ ] 외부 의존성 확인 (TipTap, react-hotkeys 등)

### 마이그레이션
- [ ] 상태 관리 변환 (Redux → Zustand)
- [ ] 스타일 변환 (styled-components → Tailwind)
- [ ] UI 라이브러리 변환 (Ant Design → shadcn/ui)
- [ ] 핵심 로직 이식 (단축키, 파일 첨부 등)

### 검증
- [ ] Playwright 스크린샷: 원본과 시각적 비교
- [ ] 기본 인터랙션: 텍스트 입력, 전송, 단축키 동작
- [ ] 엣지 케이스: 빈 입력, 긴 텍스트, 파일 첨부
```

### 개선 4-3: 빈 구현(`() => null`) 금지

Input tools 등에서 `render: () => null`로 등록만 하는 패턴을 금지:

```text
현재: 16개 도구 등록 → 대부분 render: () => null → "구현 완료"로 체크
개선: render가 null이면 태스크 미완료 처리 → 최소한의 UI라도 구현 필수
```

---

## 5. verify 단계 개선

### 현재 문제

- `npm run build` 성공 + 테스트 통과 = verify 통과
- **런타임 실행 검증 없음** → 빈 화면도 verify 통과
- **시각적 검증 없음** → 원본과 전혀 다른 UI도 verify 통과
- **Playwright MCP 미활용** → 스크린샷 한 장도 안 찍음

### 개선 5-1: 4단계 verify 프로세스

```text
Phase 0: Runtime Environment Setup
  → 앱 빌드 + CDP 포트로 실행 + Playwright MCP 연결 확인

Phase 1: Runtime Smoke Test (MUST)
  → 앱 실행 → 기본 화면 렌더링 확인
  → console.error 없음 확인
  → 주요 UI 요소 존재 확인 (Playwright browser_snapshot)

Phase 2: Visual Verification (MUST for UI features)
  → 원본 스크린샷과 비교
  → 레이아웃 구조 일치 확인 (탭 수, 영역 비율 등)
  → 핵심 스타일 일치 확인 (border-radius, padding 등)

Phase 3: Interaction Test (SHOULD)
  → 기본 인터랙션 (텍스트 입력, 전송, 탭 전환)
  → 스트리밍 표시 (메시지 블록 렌더링)
  → 에러 상태 처리
```

### 개선 5-2: Playwright MCP 필수화

```text
현재: "Playwright MCP must be installed" (검증/강제 없음)
개선: verify 시작 시 자동 검증

1. ToolSearch("select:mcp__playwright__browser_snapshot")
   → 성공: Phase 1 진행
   → 실패: 3단계 폴백 검증
     a. ~/.claude.json에서 MCP 설정 확인
     b. curl localhost:9222/json/version 확인
     c. CDP 직접 호출 (python3 + websockets) 폴백
   → 모두 실패: HARD STOP — "UI feature verify에 시각적 검증 도구 필수"
```

---

## 6. Playwright MCP 활용 구체 방안

### 6-1. 파이프라인 단계별 활용

| 단계 | 활용 방법 | 목적 |
|------|----------|------|
| specify | 원본 앱 스크린샷 캡처 | SBI와 실제 UI 구조 cross-reference |
| plan | 원본 레이아웃 분석 | CSS 수치 추출, 구조 파악 |
| implement | 구현 중간 검증 | 각 컴포넌트 구현 후 즉시 시각적 확인 |
| verify | 최종 검증 | 런타임 동작 + 원본과 시각적 비교 |
| 디버깅 | CSS 문제 진단 | 코드 추론 대신 렌더링 결과 직접 확인 |

### 6-2. specify 단계에서의 활용

```text
1. 원본 CherryStudio를 CDP로 실행
2. browser_snapshot으로 주요 화면 캡처:
   - 메인 화면 (사이드바 + 채팅 영역)
   - 입력바 (기본 상태, 확장 상태)
   - 메시지 렌더링 (일반, 코드, 수식, 다이어그램)
   - 사이드바 탭 (개수, 구조)
3. 캡처된 이미지를 spec에 참조로 첨부
4. SBI 항목과 실제 스크린샷을 대조하여 불일치 발견
```

이렇게 했으면 "3개 탭 vs 2개 탭" 문제를 즉시 발견 가능.

### 6-3. implement 단계에서의 활용

```text
컴포넌트 구현 후:
1. npm run build
2. Electron 앱 CDP 실행
3. browser_snapshot으로 렌더링 결과 캡처
4. 원본 스크린샷과 비교:
   - 전체 레이아웃 비율 일치?
   - 핵심 스타일 (border-radius, padding) 일치?
   - 요소 배치 (좌/우, 상/하) 일치?
5. 불일치 발견 시 즉시 수정 → 재검증
```

### 6-4. 디버깅 시 활용 (코드 추론 대체)

```text
현재 (코드 추론):
  사용자: "채팅창이 작아"
  → 코드 분석: w-full, flex-1, px-[18px] → "전체 너비여야 하는데..."
  → 추측으로 수정 → "확인해보세요" → 여전히 문제 → 반복

개선 (Playwright 활용):
  사용자: "채팅창이 작아"
  → browser_snapshot → 스크린샷에서 정확히 어디가 작은지 확인
  → DevTools 요소 검사 → 실제 computed width 확인
  → 정확한 원인 파악 → 한 번에 수정
```

### 6-5. CDP 직접 호출 폴백

Playwright MCP 도구가 로드되지 않은 경우에도 CDP를 직접 사용:

```python
# cdp_screenshot.py — Playwright MCP 없이 CDP 직접 사용
import asyncio, json, base64, websockets

async def capture():
    # CDP endpoint에서 WebSocket URL 획득
    import urllib.request
    data = json.loads(urllib.request.urlopen('http://localhost:9222/json').read())
    ws_url = data[0]['webSocketDebuggerUrl']

    async with websockets.connect(ws_url) as ws:
        await ws.send(json.dumps({
            'id': 1, 'method': 'Page.captureScreenshot',
            'params': {'format': 'png'}
        }))
        result = json.loads(await ws.recv())
        with open('/tmp/screenshot.png', 'wb') as f:
            f.write(base64.b64decode(result['result']['data']))
    print('Screenshot saved to /tmp/screenshot.png')

asyncio.run(capture())
```

이 스크립트를 verify 단계에서 자동 실행하면 MCP 도구 로드 여부와 무관하게 스크린샷 캡처 가능.

---

## 7. 파이프라인 전체 구조 개선

### 7-1. 원본 소스 참조 연속성

```text
현재:
  reverse-spec → SBI 추출 → specify (SBI만 참조) → plan → tasks → implement → verify
                     ↑ 원본 소스 접촉 지점              ↑ 이후 원본 소스 미참조

개선:
  reverse-spec → SBI 추출 → specify (원본+SBI) → plan (원본 CSS/구조) → tasks (원본 파일 매핑) → implement (원본 직접 읽기) → verify (원본과 비교)
                                   ↑ 매 단계에서 원본 소스 참조 ↑
```

**핵심**: SBI는 "인덱스" 역할만 하고, 실제 구현은 **원본 코드를 직접 읽어서 마이그레이션**하는 방식으로 전환.

### 7-2. Cross-Feature Dependency Tracking

```text
현재:
  F001 (app-core) → 독립 구현
  F005 (chat-ui) → 독립 specify → F001의 frameless window 영향 누락

개선:
  sdd-state.md에 Feature Impact Matrix 추가:

  | Source Feature | Decision | Affected Features | Required Action |
  |----------------|----------|-------------------|-----------------|
  | F001 | titleBarStyle: hiddenInset | F005, F006 | drag region 지정 필수 |
  | F001 | contextBridge API | F005 | window.api 경유 필수 |
  | F002 | Provider capabilities | F005 | 모델별 UI 조건부 표시 |
  | F003 | MessageBlock 11 types | F005 | 모든 블록 타입 렌더러 구현 |
```

### 7-3. 구현률 검증 게이트

verify 통과 기준에 **구현률**을 추가:

```text
현재 verify 기준:
  ✅ Build success
  ✅ Tests pass
  → verify PASS

개선 verify 기준:
  ✅ Build success
  ✅ Tests pass
  ✅ Runtime smoke test (앱 실행 + 기본 화면)
  ✅ Visual verification (원본과 레이아웃 비교)
  ✅ Implementation coverage > 70% (원본 대비)
  → verify PASS
```

---

## 8. 구체적 실행 계획

### P0: 즉시 적용 (다음 feature 시작 전)

1. **CDP 워크플로우 문서화**: MCP-GUIDE.md에 Electron CDP 실행 순서 명시
2. **verify Phase 0 추가**: 빌드 → CDP 실행 → Playwright 연결 → 스크린샷
3. **CDP 직접 호출 스크립트**: `scripts/cdp-screenshot.py` 작성 (MCP 폴백)
4. **Anti-Pattern Registry**: plan 템플릿에 Zustand/React/CSS anti-pattern 섹션 추가

### P1: 다음 feature부터 적용

5. **Upstream Impact Analysis**: specify 전에 upstream 구현 코드 스캔
6. **Source Style Extraction**: plan에서 원본 CSS 수치 추출 테이블 생성
7. **Source File Mapping**: tasks에 원본 파일 경로 + 라인 수 명시
8. **Source-First Implementation**: implement에서 원본 코드 직접 읽기 의무화

### P2: 점진적 개선

9. **Platform Pattern Checklist**: Electron/Web/Mobile별 필수 UX 체크리스트
10. **Visual Regression Baseline**: verify 통과 시 스크린샷 baseline 저장
11. **Cross-Feature Impact Matrix**: sdd-state.md에 feature 간 영향 추적
12. **Implementation Coverage Gate**: verify에 구현률 70% 이상 검증

---

## 9. 기대 효과

현재 파이프라인으로 F005 구현 시:
- 구현률: ~31% (883/3,346 lines)
- 발견된 버그: 6개 (모두 merge 후 수동 발견)
- 수정 라운드: 5회+ (코드 추론으로 반복 수정)

개선된 파이프라인 기대:
- 구현률: 70%+ (Source-First로 핵심 로직 이식)
- verify에서 발견: 대부분 (Playwright 스크린샷으로 즉시 감지)
- 수정 라운드: 1-2회 (시각적 확인 → 정확한 수정)
