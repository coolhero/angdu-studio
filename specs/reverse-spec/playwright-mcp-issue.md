# Playwright MCP 미활용 문제 분석 및 보완 방안

## 1. 문제 요약

smart-sdd SKILL.md에 "Prerequisites: Playwright MCP must be installed and connected"로 명시했음에도 불구하고, F005-chat-ui 전체 파이프라인(specify → plan → tasks → implement → verify)과 이후 디버깅 과정에서 Playwright MCP가 **단 한 번도 사용되지 않았다.**

결과적으로:

- 빌드 성공 + 테스트 통과 → verify 통과 → merge 완료
- 그러나 실제 앱 실행 시 **빈 화면** (무한 리렌더링)
- UI가 원본 CherryStudio와 **전혀 다른 모양** (3탭 vs 2탭, 과도한 여백, 입력바 스타일 불일치)
- textarea 크기 깜빡임 등 **런타임 UI 버그** 다수

이 모든 문제가 Playwright MCP로 스크린샷 한 장만 찍었으면 즉시 발견 가능했다.

## 2. 근본 원인 체인

```text
CDP endpoint 미실행
  → Playwright MCP가 브라우저 연결 실패
    → MCP 도구가 Claude Code 세션에 등록되지 않음
      → ToolSearch 실패 ("No matching deferred tools found")
        → Claude가 "사용 불가"로 판정
          → 코드 추론만으로 UI 검증 시도
            → 시각적 문제 전부 놓침
```

### 2-1. CDP Endpoint 미실행 (직접적 원인)

```bash
# MCP 등록 (사용자가 실행함)
claude mcp add --scope user playwright -- npx @playwright/mcp@latest --cdp-endpoint http://localhost:9222

# MCP 상태 확인 → "Connected"로 표시됨
claude mcp get playwright
# → Status: ✓ Connected

# 하지만 실제 CDP는?
curl http://localhost:9222/json/version
# → Connection refused ← 여기서 실패
```

**"Connected"의 의미 혼동:**

| 표시 | 실제 의미 | 필요한 의미 |
| --- | --- | --- |
| `Status: ✓ Connected` | MCP 서버 프로세스(`npx @playwright/mcp`)가 실행 중 | Playwright가 브라우저에 연결 성공 |

- MCP 서버 프로세스 실행 ✓
- CDP로 Electron 브라우저에 연결 ✗
- 브라우저 연결 실패 시 도구가 **등록되지 않음**
- Claude Code는 이를 구분하지 못함

### 2-2. Electron + CDP 사전 조건의 워크플로우 누락

Playwright MCP + Electron CDP 방식은 다음 순서가 **반드시** 필요:

```text
1. npm run build                          ← 앱 빌드
2. npx electron out/main/index.js \
     --remote-debugging-port=9222         ← CDP 포트로 앱 실행
3. curl localhost:9222/json/version       ← CDP 접속 확인
4. Claude Code 세션 시작 (또는 재시작)     ← MCP가 CDP 연결 → 도구 로드
```

이 워크플로우가 smart-sdd 파이프라인 어디에도 명시되지 않았다.

### 2-3. ToolSearch 실패 시 추가 검증 미수행

```text
ToolSearch("playwright")           → No matching  → "사용 불가" 판정 (여기서 끝)
ToolSearch("mcp playwright")       → No matching  → "사용 불가" 판정 (여기서 끝)
ToolSearch("select:mcp__playwright__browser_snapshot") → No matching → "사용 불가" 판정 (여기서 끝)
```

해야 했지만 안 한 것:

```text
1. cat ~/.claude.json → mcpServers.playwright 존재 확인 → "MCP는 등록됨"
2. claude mcp get playwright → Status 확인 → "프로세스는 실행 중"
3. curl localhost:9222/json/version → Connection refused → "CDP endpoint 미실행이 원인"
4. "Electron을 --remote-debugging-port=9222로 실행하세요" 안내
```

**3단계의 추가 검증으로 원인 특정 + 해결책 제시가 가능했으나, 1단계에서 중단.**

### 2-4. 분석/디버깅 과정에서의 미활용

verify 단계뿐 아니라, 이후 UI 버그 수정 과정에서도 Playwright를 사용하지 않았다:

| 문제 | 코드 추론으로 한 것 | Playwright로 했어야 할 것 |
| --- | --- | --- |
| 빈 화면 | ErrorBoundary 추가 → 에러 텍스트 표시 요청 | 스크린샷으로 즉시 빈 화면 확인 |
| textarea 크기 | useLayoutEffect/overflow 코드 분석 | 입력 전후 스크린샷 비교 |
| 여백 과다 | max-w-3xl 코드 검색 | 스크린샷에서 레이아웃 즉시 확인 |
| 3탭 vs 2탭 | 원본 소스 코드 비교 | 양쪽 스크린샷 나란히 비교 |
| 입력바 스타일 | CSS 값 추론 | 렌더링 결과 직접 확인 |

**5번의 UI 수정을 거치면서도 단 한 번도 "Playwright를 다시 시도해보자"라는 판단을 하지 않았다.**

## 3. 보완 방안

### 보완 A: verify 단계에 CDP 기동 의무화

smart-sdd의 `verify-phases.md`에 Phase 0 추가:

```markdown
## Phase 0: Runtime Environment Setup (UI features only)

### 0-1. Build
- `npm run build` (또는 해당 빌드 명령)

### 0-2. Start app with CDP
- Electron: `npx electron out/main/index.js --remote-debugging-port=9222 &`
- Web: `npm run dev &` (Vite dev server 등)

### 0-3. Verify CDP connection
- `curl -s http://localhost:9222/json/version` 성공 확인
- 실패 시: 3초 대기 후 재시도 (최대 3회)
- 3회 실패 시: HARD STOP — "CDP 연결 실패. 앱 실행 상태를 확인하세요."

### 0-4. Verify Playwright MCP tools
- `ToolSearch("select:mcp__playwright__browser_snapshot")` 실행
- 성공: Phase 1 진행
- 실패: 세션 재시작 필요 안내 → HARD STOP
```

### 보완 B: ToolSearch 실패 시 3단계 폴백 검증

현재: `ToolSearch 실패 → "사용 불가" 판정 (끝)`

개선:

```text
ToolSearch 실패
  → Step 1: ~/.claude.json에서 mcpServers 확인
    → 미등록: "MCP 서버를 등록하세요: claude mcp add playwright ..."
    → 등록됨: Step 2로
  → Step 2: claude mcp get playwright로 상태 확인
    → 미연결: "MCP 서버가 실행되지 않았습니다. 세션을 재시작하세요."
    → Connected: Step 3으로
  → Step 3: curl localhost:{port}/json/version으로 CDP 확인
    → 실패: "CDP endpoint에 앱이 실행되지 않고 있습니다. 앱을 --remote-debugging-port={port}로 실행하세요."
    → 성공: "MCP 서버와 CDP 모두 정상이나 세션 재시작이 필요할 수 있습니다."
```

### 보완 C: smart-sdd SKILL.md Prerequisites 강화

현재:

```markdown
**Prerequisites**: Playwright MCP must be installed and connected.
For Electron apps, CDP must be pre-configured — see MCP-GUIDE.md.
```

개선:

```markdown
**Prerequisites**: Playwright MCP

1. MCP 서버 등록:
   - `claude mcp add --scope user playwright -- npx @playwright/mcp@latest`
   - Electron CDP: `--cdp-endpoint http://localhost:9222` 추가

2. pipeline 실행 전 (UI feature인 경우):
   - 앱 빌드: `npm run build`
   - CDP로 앱 실행: `npx electron out/main/index.js --remote-debugging-port=9222`
   - CDP 확인: `curl localhost:9222/json/version`
   - Claude Code 세션 시작 (MCP 도구 로딩을 위해)

3. 검증 (세션 시작 직후):
   - `ToolSearch("select:mcp__playwright__browser_snapshot")` 성공 필수
   - 실패 시 보완 B의 3단계 폴백 실행
   - 도구 미사용 가능 시: UI feature의 verify는 FAIL 처리
```

### 보완 D: UI 작업 시 Playwright 적극 활용 규칙

verify 단계뿐 아니라 **모든 UI 관련 작업에서** Playwright 사용을 표준화:

```markdown
## Playwright 사용 시점

### 필수 (MUST)
- verify Phase 1: 앱 실행 + 기본 화면 렌더링 확인
- verify Phase 2: 주요 UI 요소 존재 확인
- verify Phase 3: 기본 인터랙션 테스트

### 권장 (SHOULD)
- CSS 수정 후: 스크린샷으로 결과 즉시 확인
- 레이아웃 변경 후: 변경 전/후 비교
- UI 버그 수정 시: 수정 전 스크린샷 → 원인 파악 → 수정 후 확인

### 선택 (MAY)
- 원본 소스와의 시각적 비교
- 반응형 레이아웃 테스트 (viewport 변경)
- 다크 모드 테스트
```

### 보완 E: MCP-GUIDE.md 업데이트

프로젝트 루트의 `MCP-GUIDE.md`에 Electron CDP 워크플로우를 구체적으로 문서화:

```markdown
## Electron + Playwright MCP (CDP 방식)

### 원리
Playwright MCP가 Electron의 Chromium 렌더러에 CDP(Chrome DevTools Protocol)로 연결하여
브라우저 제어 도구(스크린샷, 클릭, 네비게이션 등)를 제공합니다.

### 전제 조건
1. Electron 앱이 `--remote-debugging-port=9222`로 실행 중이어야 함
2. Playwright MCP가 `--cdp-endpoint http://localhost:9222`로 설정되어야 함
3. Claude Code 세션이 위 두 조건 충족 후 시작되어야 함

### 순서가 중요한 이유
- Electron 앱 미실행 → CDP 포트 없음 → MCP 브라우저 연결 실패 → 도구 미등록
- MCP "Connected" 상태 ≠ 브라우저 연결 성공 (프로세스 실행만 의미)
- Claude Code 세션 시작 시점에 도구가 로드되므로, 이후 앱 실행해도 반영 안 됨

### 트러블슈팅
| 증상 | 원인 | 해결 |
| --- | --- | --- |
| ToolSearch에서 playwright 도구 없음 | CDP endpoint 미실행 | 앱을 CDP 포트로 실행 후 세션 재시작 |
| `claude mcp get` Connected인데 도구 없음 | MCP 프로세스 ✓, 브라우저 연결 ✗ | `curl localhost:9222` 확인 |
| curl 성공인데 도구 없음 | 세션 시작 후 앱 실행 | 세션 재시작 필요 |
```

## 4. 코드 추론만으로 UI를 수정하는 것의 구조적 한계

이 문서를 작성하는 과정에서도 동일한 문제가 재현되고 있다:

```text
사용자: "채팅창 사이즈가 여전히 작다. 오른쪽 거의 끝까지 가야하는 거 아닌가?"
Claude: 코드를 읽어봄 → w-full, flex-1, px-[18px] → "전체 너비를 차지해야 하는데..."
        → 실제 렌더링을 볼 수 없으므로 무엇이 문제인지 특정 불가
```

### 코드 추론의 한계가 반복되는 구조

```text
[코드 수정] → [사용자에게 확인 요청] → [여전히 문제] → [다시 코드 분석] → [추론으로 수정] → ...
```

이 루프가 반복되는 이유:

1. **CSS는 컨텍스트 의존적**: `w-full`이라도 부모의 `overflow`, `flex`, `position` 등에 따라 실제 렌더링 크기가 달라짐. 코드만으로 최종 렌더링을 예측하기 어려움
2. **"작다"의 정의가 주관적**: 코드에서는 pixel 단위지만 사용자는 시각적 비율로 판단. 스크린샷 없이는 "어디가 얼마나 작은지" 특정 불가
3. **Tailwind CSS의 cascading**: 여러 유틸리티 클래스가 상호작용하는 결과를 코드만으로 예측하기 어려움
4. **부모-자식 레이아웃 체인**: App → main → HomePage → Chat → Inputbar 까지의 전체 flex/overflow 체인을 머리로 계산해야 함

### 이 문제의 해결은 Playwright MCP뿐

- 스크린샷 한 장이면 "어디가 작은지" 즉시 확인 가능
- 현재 세션에서는 CDP endpoint가 없어서 Playwright 도구를 사용할 수 없음
- **다음 세션에서는 반드시 앱을 CDP로 실행한 후 시작해야 함**

## 5. Playwright MCP를 계속 사용하지 않게 되는 구조적 원인

### 5-1. 세션-MCP-앱의 3중 의존성 문제

Playwright MCP가 CDP 모드로 작동하려면 **3개가 동시에 충족**되어야 함:

```text
① Electron 앱이 --remote-debugging-port=9222로 실행 중
② Playwright MCP 서버가 --cdp-endpoint로 연결 성공
③ Claude Code 세션이 ②가 성공한 후 시작됨
```

하나라도 빠지면 도구 미로드:

| 상태 | ① 앱 실행 | ② MCP 연결 | ③ 세션 시작 | 결과 |
| --- | --- | --- | --- | --- |
| 일반 개발 | ✗ | ✗ | ✓ | 도구 없음 |
| MCP 등록 후 | ✗ | △(프로세스만) | ✓ | 도구 없음 |
| 앱 실행 후 | ✓ | ✗ | 이미 시작됨 | 도구 없음 |
| 올바른 순서 | ✓ → | ✓ → | ✓ | 도구 사용 가능 |

**문제**: 개발자가 자연스럽게 하는 순서(Claude Code 시작 → 코드 작성 → 빌드 → 앱 실행)와 MCP가 필요한 순서(앱 실행 → MCP 연결 → Claude Code 시작)가 **정반대**.

### 5-2. "한번 실패하면 다시 시도하지 않는" 패턴

```text
세션 초반: ToolSearch("playwright") → 실패 → "사용 불가" 판정
... (수시간의 작업) ...
세션 중반: UI 문제 발생 → 코드 추론으로 대응
          이 시점에 "Playwright를 다시 시도해보자"는 판단이 작동하지 않음
... (더 많은 UI 문제) ...
세션 후반: 여전히 코드 추론만 사용
```

Claude는 세션 초반의 ToolSearch 실패를 **영구적 사실**로 기억하고, 이후에 상황이 바뀌었을 가능성(앱이 실행됨, CDP가 활성화됨)을 고려하지 않음.

### 5-3. CDP를 직접 사용하는 우회 경로를 시도하지 않음

이번 세션에서 실제로 발생한 일:
- Playwright MCP 도구 → ToolSearch 실패
- 하지만 CDP endpoint는 동작 중 (`curl localhost:9222` 성공)
- Python + websockets로 CDP 직접 호출 → **스크린샷 캡처 성공**

이 우회 경로는 세션 초반부터 가능했으나, "MCP 도구 없음 = 스크린샷 불가"로 판단하고 시도하지 않았음.

### 5-4. 보완 방안

**즉시 적용 (P0):**

1. **세션 시작 시 자동 검증 스크립트**: `.claude/hooks/session-start.sh`
   ```bash
   # Electron CDP 검증
   if curl -s localhost:9222/json/version > /dev/null 2>&1; then
     echo "✓ CDP endpoint active"
   else
     echo "⚠ CDP not running. Start app with: npx electron out/main/index.js --remote-debugging-port=9222"
   fi
   ```

2. **CDP 직접 사용 폴백**: Playwright MCP 도구 미로드 시, CDP WebSocket으로 직접 스크린샷 촬영
   ```python
   # ToolSearch 실패 시 자동으로 시도하는 폴백
   python3 -c "import asyncio, json, base64, websockets; ..."
   ```

3. **주기적 재검증**: UI 수정 2회 이상 후에도 문제가 계속되면, ToolSearch를 다시 시도하거나 CDP 직접 사용

**파이프라인 개선 (P1):**

4. **verify 단계에 빌드-실행-스크린샷 자동화**:
   ```text
   npm run build
   npx electron out/main/index.js --remote-debugging-port=9222 &
   sleep 3
   python3 cdp_screenshot.py  # CDP 직접 사용 (MCP 불필요)
   ```

5. **MCP-GUIDE.md에 "개발 순서" 명시**:
   ```text
   개발 워크플로우 (Electron + CDP):
   1. npm run build
   2. npx electron ... --remote-debugging-port=9222
   3. claude (세션 시작) ← 이 순서가 중요!
   ```

## 6. 근본적 교훈

### "도구가 없다"는 판정을 의심하지 않은 것이 핵심 실패

```text
ToolSearch 실패 → "사용 불가입니다" → 코드 추론으로 전환
```

이 판단이 **5번의 UI 수정 세션 동안 한 번도 재검토되지 않았다.**

- UI 문제를 코드만 보고 추론 → 수정 → "확인해보세요" → 여전히 문제 → 다시 코드 추론
- 이 루프를 반복하면서도 "시각적 확인 도구를 다시 시도해보자"는 생각이 작동하지 않음

### 보완 원칙

> **UI 문제를 2회 이상 코드 추론으로 수정했는데 사용자가 여전히 문제를 보고하면,
> 반드시 시각적 확인 도구(Playwright MCP)의 사용 가능성을 재검토하라.**
>
> ToolSearch 실패 시 즉시 포기하지 말고, MCP 설정 → CDP endpoint → 세션 상태를
> 순서대로 확인하여 원인을 특정하라.
