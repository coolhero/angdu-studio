# Spec-Kit Skills 개선 v4: MCP Tool Integration 런타임 검증 사례

> F005-chat-ui MCP tool execution 수정 경험에서 도출
> 핵심 주장: **IPC 경계를 넘는 기능은 빌드 검증만으로는 절대 부족하며, 런타임 통합 테스트가 필수**
> 부가 주장: **"crash 안 남 ≠ 기능 동작"이라는 검증 수준의 혼동이 다회차 수정의 근본 원인**
> 작성: 2026-03-10 / 갱신: 2026-03-10

---

## 0. 사건 요약

### 왜 단순한 수정이 3세션 × 5회 반복이 되었나

```text
타임라인:
  세션 1 (implement)
    → 코드 작성, 빌드 성공, "완료" 판정
    → 런타임 테스트 안 함

  세션 2 (사용자 보고 → 긴급 수정)
    → 사용자: "MCP 도구 호출하면 crash"
    → Fix 1: result.content null-safe (crash 해결)
    → Fix 2: msg.blocks null-safe (crash 해결)
    → Fix 3: JSON.stringify(undefined) 방어 (crash 해결)
    → "3개 crash 모두 수정 완료" 판정
    → 실제 도구 결과 표시는 확인 안 함

  세션 3-1 (사용자 보고 → 재수정)
    → 사용자: "도구 결과가 "" 로 나옴"
    → 디버그 로그 추가 → part.result === undefined 발견
    → Fix 3-v2: JSON.stringify(part.result ?? '') 적용
    → "빈 문자열이면 안전" 판단
    → 그런데 JSON.stringify('') = '""' (2글자 문자열) → 여전히 "" 표시

  세션 3-2 (근본 원인 추적)
    → 디버그 로그로 확인: execute 콜백은 정상 반환, part.result만 undefined
    → AI SDK v6 소스 분석: fullStream의 tool-result는 output을 전달하지 않음
    → experimental_onToolCallFinish 콜백 발견
    → Fix 3-v3: onToolCallFinish + Map으로 결과 캐시
    → Playwright CDP로 실제 도구 호출 → 결과 정상 표시 확인
    → ✅ 진짜 완료

총 소요: 5회 수정 반복, 3세션 (컨텍스트 소진으로 세션 연장 포함)
```

### 각 반복이 실패한 이유

| 반복 | 수정 내용 | 검증 수준 | 왜 부족했나 |
|------|----------|----------|-----------|
| Fix 1~2 | null-safe 코딩 | "crash 안 남" | crash 없음 ≠ 정상 동작. 도구 결과가 표시되는지 확인 안 함 |
| Fix 3-v1 | `JSON.stringify(undefined)` 방어 | "빌드 성공" | TypeScript가 안전하다고 한 것을 그대로 믿음 |
| Fix 3-v2 | `?? ''` fallback 추가 | "논리적으로 맞음" | `JSON.stringify('') = '""'`라는 JS 동작을 간과 |
| Fix 3-v3 | `onToolCallFinish` 콜백 | **Playwright CDP 런타임 검증** | ✅ 실제 도구 호출 → 실제 결과 확인 |

### 핵심 교훈

```text
문제의 근본 원인은 코딩 실력이 아니라 "검증 수준의 착각":

1. "빌드 성공" → "코드가 맞다" (× TypeScript는 IPC/SDK 경계를 보장하지 않음)
2. "crash 안 남" → "기능이 된다" (× 빈 문자열 표시는 crash가 아니지만 기능 실패)
3. "논리적으로 맞음" → "동작한다" (× JSON.stringify('') = '""' 같은 엣지케이스)
4. "Playwright로 확인" → "진짜 된다" (✅ 유일하게 신뢰할 수 있는 검증)

결론: implement 스킬이 "빌드 성공"에서 멈추지 않고
      "핵심 기능 시나리오의 런타임 실행 성공"까지 포함해야 한다.
```

### 발견된 버그 4건 (모두 런타임에서만 발견 가능)

| # | 버그 | 원인 | 빌드에서 감지? | 런타임 증상 |
|---|------|------|-------------|-----------|
| 1 | `result.content` 접근 시 crash | MCP 서버가 `content: undefined` 반환 가능 | ❌ 타입은 `MCPCallToolResponse`로 정의 | crash: `Cannot read properties of undefined` |
| 2 | `msg.blocks` 접근 시 crash | Dexie에서 로드된 메시지의 blocks가 undefined | ❌ 타입 정의에는 `blocks: string[]` | crash: `.map is not a function` |
| 3 | `resultStr.length` crash | `JSON.stringify(undefined)` → JS `undefined` (not string) | ❌ TypeScript는 `string` 반환 추론 | crash: `Cannot read properties of undefined (reading 'length')` |
| 4 | 도구 결과가 `""` 로 표시 | AI SDK v6 fullStream의 tool-result에 output이 없음 | ❌ 타입에는 `output` 필드 존재 | 기능 실패: AI가 "허용 목록이 비어있다"고 오답 |

### 핵심 통찰

```text
버그 1~3: TypeScript 컴파일러가 "안전"이라고 판정한 코드가 런타임에서 crash.
버그 4:   TypeScript 컴파일러와 "논리적 추론" 모두 맞다고 했지만, SDK 내부 동작이 달랐음.

이유:
  1. IPC 경계에서 타입 보장이 사라짐 (main → renderer 직렬화)
  2. 외부 SDK의 실제 반환값이 타입 정의와 다름 (AI SDK의 tool-result.output ≠ execute 반환값)
  3. Dexie (IndexedDB) 데이터가 스키마 정의와 다를 수 있음 (migration 없는 필드 추가)
  4. JSON.stringify의 edge case (undefined → undefined, '' → '""')
```

---

## 1. 근본 원인 분석: IPC 경계의 타입 안전성 환상

### 1.1 문제 패턴

```text
[Renderer] TypeScript → [IPC Serialize] JSON → [Main] MCPService → [MCP SDK] → [External Server]
                                                                                       ↓
[Renderer] stream handler ← [AI SDK] ← streamText() ← tool execute callback ← MCP result
```

이 파이프라인에서 **4번의 직렬화 경계**를 넘음:
1. Renderer → Main (IPC invoke)
2. Main → MCP Server (MCP SDK JSON-RPC)
3. MCP Server → Main (MCP response)
4. Main → Renderer (IPC return)

각 경계에서 TypeScript 타입은 **힌트**일 뿐, **보장**이 아님.

### 1.2 구체적 사례

```typescript
// TypeScript는 이 코드가 안전하다고 판정
const result: MCPCallToolResponse = await window.api.mcp.callTool(...)
const textParts = result.content  // ← crash! content가 undefined
  .filter(c => c.type === 'text')
  .map(c => c.text)

// 실제 IPC 반환값: { content: undefined } 또는 {} 또는 null
// TypeScript의 MCPCallToolResponse 타입에는 content: MCPToolResultContent[]
// 하지만 IPC 직렬화는 타입을 체크하지 않음
```

### 1.3 JSON.stringify(undefined) 함정

```typescript
// TypeScript 관점: JSON.stringify는 항상 string 반환
const resultStr = JSON.stringify(part.result)  // 반환 타입: string

// JavaScript 실제 동작:
JSON.stringify(undefined)  // → undefined (not "undefined", not "null", 진짜 undefined)
JSON.stringify(null)       // → "null" (string)

// TypeScript 타입 정의가 이 edge case를 다루지 않음
// 결과: resultStr.length에서 crash
```

---

## 2. spec-kit-skills 개선 제안

### 개선 #9: IPC 경계 Null-Safety 검증 규칙

**현재**: implement 단계에서 IPC 호출 코드 작성 시 타입 정의만 믿고 null check 생략
**개선**: implement 스킬에 IPC 반환값 null-safety 규칙 추가

```text
규칙: IPC 경계를 넘는 모든 반환값은 다음을 적용:
  1. 반환 객체 자체: result?.field ?? fallback
  2. 배열 필드: (result?.array ?? [])
  3. 중첩 객체: result?.nested?.field ?? default
  4. JSON.stringify 대상: JSON.stringify(value ?? fallback)

검증 체크리스트 (implement 완료 전):
  - [ ] window.api.* 호출의 반환값에 ?. 또는 ?? 적용
  - [ ] IPC로 받은 배열에 ?? [] 적용
  - [ ] JSON.stringify에 undefined 방어 적용
```

### 개선 #10: 외부 SDK 스트림 이벤트 방어 코딩

**현재**: AI SDK의 stream event 타입을 그대로 신뢰
**개선**: 외부 SDK의 스트림 이벤트는 항상 방어적으로 처리

```text
규칙: streamText/generateText 등 SDK 스트림 이벤트 핸들러에서:
  1. part.result는 undefined일 수 있음 (tool이 값을 반환하지 않을 수 있음)
  2. part.text는 빈 문자열일 수 있음
  3. part.error는 다양한 형태 (string, Error, AI_APICallError)
  4. 모든 필드에 typeof 또는 ?? 방어 적용
```

### 개선 #11: MCP Tool Integration 런타임 검증 프로토콜

**현재**: MCP 도구 통합은 빌드 성공으로 "완료" 판정
**개선**: verify 단계에 MCP tool e2e 검증 추가

```text
MCP Tool 런타임 검증 체크리스트:
  Phase 1 - Tool Discovery
  - [ ] MCP 서버 활성화 시 도구 목록이 UI에 표시되는가?
  - [ ] 도구의 inputSchema가 정상적으로 파싱되는가?

  Phase 2 - Tool Execution
  - [ ] 사용자 메시지 전송 → AI가 도구 호출 결정 → 도구 실행 → 결과 반환 → AI 최종 응답
  - [ ] 도구 결과가 빈 경우 crash 없이 처리되는가?
  - [ ] 도구 실행 중 에러 발생 시 toast 표시되는가?

  Phase 3 - Multi-step & Edge Cases
  - [ ] maxSteps 내에서 여러 도구 순차 호출이 동작하는가?
  - [ ] 도구 결과가 undefined/null/빈 배열인 경우 처리
  - [ ] 스트림 도중 abort 시 generating 상태가 정상 해제되는가?
  - [ ] 네트워크 에러/타임아웃 시 에러 메시지가 표시되는가?
```

### 개선 #12: Playwright CDP 런타임 검증의 필수화

**v2/v3에서 제안한 "런타임 검증"의 구체적 실행 방법 확립**

```text
verify 스킬의 Phase 3에 다음을 필수로 포함:

1. 앱 실행 확인
   - Electron 앱이 --remote-debugging-port=9222로 실행 중인지 확인
   - Playwright CDP로 연결
   - 콘솔 에러 0개 확인

2. 핵심 기능 시나리오 실행 (Feature별 정의)
   예: F005-chat-ui MCP tool 시나리오
   - MCP Tools 버튼이 "N active"로 표시되는지 확인
   - 메시지 입력 → 전송 → AI 응답 수신 확인
   - 도구 호출 발생 시 도구명 표시 확인
   - 응답 완료 후 Copy 버튼 표시 확인
   - 콘솔 에러 0개 재확인

3. 결과 기록
   - 스크린샷 저장
   - 콘솔 로그 저장
   - 성공/실패 판정
```

### 개선 #13: Stuck Stream 방어 — Generating 상태 자동 해제

**현재**: stream이 비정상 종료되면 `isGenerating`이 true로 남아 UI가 영구히 잠김
**개선**: implement 스킬에 generating 상태 타임아웃 규칙 추가

```text
규칙: generating 상태 관리 시 다음을 반드시 적용:
  1. finally 블록에서 setGenerating(false) 호출
  2. AbortSignal.timeout으로 최대 대기 시간 설정
  3. catch 블록에서도 setGenerating(false) 호출
  4. 앱 재시작 시 stale generating 상태 정리 (runtime store 초기화)

검증: Playwright로 에러 시나리오 테스트
  - API 에러 발생 → 전송 버튼 다시 활성화 확인
  - 타임아웃 발생 → 전송 버튼 다시 활성화 확인
```

### 개선 #14: implement 스킬에 "Happy Path 런타임 검증" 필수화

**근본 원인**: implement 스킬이 "빌드 성공 + 타입 체크 통과"를 완료 조건으로 삼음.
외부 SDK/IPC를 사용하는 기능은 빌드 성공이 기능 동작을 보장하지 않음.

**현재 implement 완료 기준**:
```text
1. 코드 작성 완료
2. 빌드(타입체크) 성공
3. 린트 통과
→ "구현 완료"
```

**개선된 implement 완료 기준**:
```text
1. 코드 작성 완료
2. 빌드(타입체크) 성공
3. 린트 통과
4. ★ 핵심 시나리오 런타임 확인 (implement 단계에서!):
   - 외부 SDK 호출이 있는 경우: 실제 호출 → 실제 반환값 확인
   - IPC 경계를 넘는 경우: 실제 IPC 호출 → 실제 데이터 확인
   - UI 표시가 있는 경우: 실제 화면에서 의도한 내용이 보이는지 확인
→ "구현 완료"
```

**적용 규칙**:
```text
implement 스킬이 다음 패턴을 감지하면 런타임 확인을 요구:
  - window.api.* (IPC 호출)
  - streamText / generateText (AI SDK)
  - fetch / axios (외부 API)
  - Dexie query (IndexedDB)

확인 방법 (택 1):
  a. Playwright CDP로 실제 시나리오 실행
  b. 앱의 DevTools Console에서 수동 확인
  c. 임시 console.log → 결과 캡처 → 제거

"빌드만 되면 되겠지"로 넘어가면 verify에서 반드시 잡히고,
verify에서도 안 잡히면 사용자가 잡는다 — 가장 비싼 경로.
```

### 개선 #15: "증상 수정" vs "근본 원인 수정" 구분 강제

**근본 원인**: 증상(crash)만 고치고 근본 원인(SDK가 값을 전달하지 않음)을 추적하지 않음.
이로 인해 같은 파일을 5번 수정하는 반복이 발생.

**현재 패턴 (안티패턴)**:
```text
에러 발생 → 에러 메시지에 맞는 수정 → 빌드 성공 → "수정 완료"
  → 다른 증상 발생 → 또 수정 → 빌드 성공 → "수정 완료"
  → 또 다른 증상... (반복)
```

**개선된 패턴**:
```text
에러 발생 → 1단계: 데이터 흐름 전체 추적 (10분 투자)
  "이 값이 어디서 생성되어 → 어디를 거쳐 → 어디에 도착하는가?"
  → 2단계: 경로의 각 지점에서 실제 값 확인 (debug log 또는 breakpoint)
  → 3단계: 가장 상류의 문제를 수정
  → 4단계: 하류의 모든 증상이 함께 해결되는지 확인
```

**이 사례에 적용했다면**:
```text
"도구 결과가 안 나온다"
  → execute 콜백의 return 값 확인: "Allowed directories: /private/tmp" ✅ 정상
  → streamText의 tool-result 이벤트 확인: part.result === undefined ← 여기가 문제
  → AI SDK 문서/소스 확인: fullStream은 tool output을 전달하지 않음
  → 대안 탐색: experimental_onToolCallFinish 콜백 발견
  → 1회 수정으로 완료

실제로는: crash 수정 3회 → "" 표시 발견 → fallback 수정 2회 → 근본 원인 발견
총 5회 수정. 데이터 흐름 추적을 먼저 했으면 2회로 끝났을 것.
```

**implement 스킬에 추가할 규칙**:
```text
버그 수정 시 필수 절차:
  1. 수정 전에 데이터 흐름도를 머릿속으로 그린다
     (입력 → 변환1 → 경계1 → 변환2 → 경계2 → 출력)
  2. 에러가 발생한 지점이 아니라, 잘못된 값이 처음 생성된 지점을 찾는다
  3. 증상 수정(downstream)이 아닌 원인 수정(upstream)을 한다
  4. 수정 후 "이 수정으로 사용자가 보는 최종 결과가 올바른가?"를 확인한다
     (crash 안 남 ≠ 올바른 결과)
```

### 개선 #16: 외부 SDK의 "타입 정의 ≠ 실제 동작" 검증 프로토콜

**근본 원인**: AI SDK v6의 TypeScript 타입에 `output` 필드가 정의되어 있지만,
실제 fullStream 이벤트에서는 값이 전달되지 않음. 타입을 믿고 코딩했으나 실제와 다름.

**현재**: 외부 SDK의 .d.ts 타입 정의를 그대로 신뢰
**개선**: 외부 SDK 사용 시 "타입 정의 신뢰도" 3단계 분류

```text
신뢰도 분류:
  Level 1 (높음): SDK의 동기 함수 반환값
    - 예: jsonSchema(), nanoid()
    - 타입 정의 신뢰 가능

  Level 2 (중간): SDK의 비동기 함수 반환값
    - 예: generateText().text, streamText().usage
    - 대부분 신뢰 가능하나, 에러 케이스에서 다를 수 있음
    - ?? fallback 적용 권장

  Level 3 (낮음): SDK의 스트림/이벤트/콜백 값
    - 예: fullStream의 part.result, part.output
    - 이벤트 타이밍, 값의 유무가 타입과 다를 수 있음
    - ★ 반드시 실제 값을 debug log로 확인 후 사용
    - ★ experimental_* API는 특히 주의 (명시적으로 불안정)

implement 스킬 규칙:
  - Level 3 SDK 사용 시 → 임시 debug log 추가 → 실제 값 확인 → 코드 작성
  - "타입에 있으니까 되겠지" 금지
  - 특히 streaming/event 기반 API에서는 항상 실측 우선
```

---

## 3. v2/v3과의 관계

| 문서 | 핵심 주장 | 이 문서의 보완 |
|------|----------|-------------|
| v2 | "빌드 성공 ≠ 기능 완성" | v4가 구체적 실패 사례와 반복 타임라인으로 증명 |
| v3 | "Foundation-First" — 기반이 동작해야 함 | MCP integration 같은 cross-feature 기능의 런타임 검증 필요성 |
| **v4** | **"crash 없음 ≠ 기능 동작" + "증상 수정 ≠ 근본 원인 수정"** | implement 단계에 런타임 검증 필수화, 데이터 흐름 추적 규칙, SDK 타입 신뢰도 분류 |

### v4 고유 기여: "왜 5번 고쳐야 했나"에 대한 프로세스 분석

```text
v2/v3이 "빌드 ≠ 완성"이라는 원칙을 제시했지만,
v4는 그 원칙이 지켜지지 않았을 때 실제로 어떤 비용이 발생하는지를 보여줌:

  비용 1: 시간 — 1회 수정 가능했던 것이 5회 반복 (3세션, 컨텍스트 소진)
  비용 2: 신뢰 — 사용자가 3번 "아직 안 되는데?" 보고 (신뢰도 하락)
  비용 3: 복잡도 — 각 반복마다 debug 코드 추가/제거 오버헤드
  비용 4: 컨텍스트 — LLM 컨텍스트 윈도우 소진으로 세션 재시작 필요

  이 모든 비용이 implement 단계에서 "10분간의 런타임 검증"으로 방지 가능했음.
```

---

## 4. 적용된 수정 사항 (Inputbar.tsx)

### Fix 1: execute callback — null-safe content extraction
```typescript
// Before:
const textParts = result.content.filter(...).map(...)
return textParts.join('\n') || JSON.stringify(result.content)

// After:
const contentArr = result?.content ?? []
const textParts = contentArr.filter(c => c.type === 'text' && c.text).map(c => c.text)
const extracted = textParts.join('\n')
if (extracted) return extracted
return contentArr.length > 0 ? JSON.stringify(contentArr) : '(no content returned)'
```

### Fix 2: message blocks access — null-safe
```typescript
// Before:
const blocks = msg.blocks.map(bid => blockStore.getBlock(bid))

// After:
const blocks = (msg.blocks ?? []).map(bid => blockStore.getBlock(bid))
```

### Fix 3: tool-result handler — AI SDK v6 fullStream workaround
```typescript
// Problem:
// AI SDK v6's fullStream tool-result event has part.result === undefined.
// The execute callback's return value IS sent to the AI model for multi-step,
// but the stream consumer cannot access it via part.result or part.output.

// Before (v1 — crashes on undefined):
const resultStr = typeof part.result === 'string' ? part.result : JSON.stringify(part.result)
const preview = resultStr.length > 500 ? ...

// Before (v2 — shows "" because JSON.stringify('') = '""'):
const resultStr = typeof part.result === 'string' ? part.result : JSON.stringify(part.result ?? '')

// After (v3 — use experimental_onToolCallFinish callback):
// 1. Create a Map<string, string> before streamText()
const toolResultsMap = new Map<string, string>()

// 2. Pass experimental_onToolCallFinish to streamText() to capture results
experimental_onToolCallFinish: (event) => {
  if (event.success && event.output != null) {
    const callId = event.toolCall?.toolCallId
    if (callId) {
      const value = typeof event.output === 'string'
        ? event.output
        : JSON.stringify(event.output)
      toolResultsMap.set(callId, value)
    }
  }
}

// 3. In the tool-result handler, look up from the map
const captured = toolResultsMap.get(part.toolCallId)
const trimmed = (captured ?? '').trim()
if (trimmed && trimmed !== '(no content returned)') {
  const preview = trimmed.length > 500 ? trimmed.slice(0, 500) + '...' : trimmed
  fullText += `\n\`\`\`\n${preview}\n\`\`\`\n\n`
}
```

### Fix 4: tool-call display — cleaner tool name
```typescript
// Before:
fullText += `\n\n> Tool: \`${part.toolName}\`\n`

// After:
const displayName = part.toolName.includes('__')
  ? part.toolName.split('__').slice(1).join('__')
  : part.toolName
fullText += `\n\n> 🔧 \`${displayName}\`\n`
```
