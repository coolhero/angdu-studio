# Angdu Studio Constitution Seed

## 소스 코드 참조 원칙

Cherry Studio 소스 코드는 **분석 및 개념적 참조** 대상이다. 직접 복사하지 않는다.

1. **구조 분석**: Cherry Studio의 Feature 구조, 엔티티 관계, IPC 채널 설계를 분석하여 Angdu Studio의 설계에 반영한다.
2. **로직 참조**: 비즈니스 로직 흐름 (스트리밍 파이프라인, RAG 파이프라인 등)을 이해하고, 새로운 스택으로 재구현한다.
3. **타입 참조**: Cherry Studio의 TypeScript 타입 정의를 참조하되, Angdu Studio의 Zod 스키마 우선 접근 방식으로 재정의한다.
4. **복사 금지**: styled-components, Ant Design, Redux 코드를 그대로 가져오지 않는다. Tailwind CSS 4, shadcn/ui, Zustand로 재작성한다.

---

## 추출된 아키텍처 원칙

### Electron Main/Renderer 분리

1. **main process**: 파일 시스템, SQLite, 네트워크, 암호화 등 시스템 리소스 접근
2. **renderer process**: React UI, 상태관리 (Zustand), 사용자 상호작용
3. **데이터 흐름**: renderer → IPC invoke → main → IPC return → renderer
4. **금지 사항**: renderer에서 직접 fs, child_process, better-sqlite3 접근 불가

### IPC-First 데이터 접근

1. 모든 영속 데이터 접근은 IPC 채널을 통한다
2. ConfigManager, FileStorage, KnowledgeService, MemoryService는 main process 전용
3. renderer의 Zustand store는 UI 상태와 캐시 역할만 수행
4. 대량 데이터 전송 시 IPC serialization 비용 고려 필요

### Config via Main Process

1. AppConfig는 main process의 ConfigManager가 관리
2. better-sqlite3로 영속화 (electron-store 대체)
3. renderer에서 config:get/set IPC로만 접근
4. 변경 알림: isNotify=true 시 모든 윈도우에 브로드캐스트

---

## 기술적 제약사항

### Electron 보안

1. **contextIsolation**: true (필수)
2. **nodeIntegration**: false (필수)
3. **sandbox**: true (권장)
4. **preload script**: 허용된 IPC 채널만 노출
5. **CSP**: 외부 스크립트 로딩 제한

### Context Isolation

1. renderer에서 Node.js API 직접 접근 불가
2. preload script에서 `contextBridge.exposeInMainWorld`로 안전한 API만 노출
3. IPC 채널은 화이트리스트 방식으로 관리

### better-sqlite3 Main-Only

1. better-sqlite3는 네이티브 모듈로 main process에서만 로드 가능
2. renderer에서 DB 접근은 반드시 IPC를 통해야 한다
3. DB 연결 관리: 앱 시작 시 열기, 종료 시 닫기
4. 동시 접근: better-sqlite3는 WAL 모드로 동시 읽기 지원, 쓰기는 직렬화

### Electron 윈도우 관리

1. BrowserWindow 생성은 main process에서만 가능
2. 다중 윈도우: 메인 윈도우 + 미니 윈도우 + 트레이스 윈도우
3. 윈도우 간 통신: IPC relay 또는 StoreSyncService

---

## 코딩 컨벤션

### TypeScript Strict Mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Tailwind CSS 4

1. **유틸리티 우선**: 인라인 유틸리티 클래스 사용
2. **CSS 변수**: 테마 색상, 간격 등은 CSS 변수로 정의
3. **dark 모드**: `dark:` 변형 사용 (Tailwind의 class 전략)
4. **커스텀 컴포넌트 스타일**: `@apply` 사용 최소화, 컴포넌트 prop으로 변형 관리
5. **v4 전용 기능**: `@theme`, `@variant` 사용 가능
6. **styled-components 금지**: CSS-in-JS 사용하지 않음

### shadcn/ui

1. **컴포넌트 소스 복사**: node_modules가 아닌 프로젝트에 직접 복사하여 사용
2. **Radix UI 기반**: 접근성 (a11y) 기본 제공
3. **커스터마이징**: 복사된 컴포넌트 파일을 직접 수정
4. **컴포넌트 디렉토리**: `src/renderer/src/components/ui/`
5. **Ant Design 금지**: Ant Design 컴포넌트 사용하지 않음

### Zustand 패턴

1. **Store 분리**: Feature별 독립 store (assistantStore, providerStore, settingsStore 등)
2. **Persist middleware**: `persist()` + localStorage (renderer 전용 상태)
3. **Immer middleware**: 복잡한 상태 업데이트 시 `immer` middleware 사용 권장
4. **선택자 패턴**: `useStore(selector)` 형태로 필요한 상태만 구독
5. **비동기 액션**: store 내 async 함수로 정의 (IPC 호출 포함)
6. **Redux 금지**: Redux, Redux Toolkit, redux-persist 사용하지 않음

### 파일 구조

```
src/
  main/           # Electron main process
    services/     # 서비스 계층 (DB, 파일, MCP 등)
    ipc.ts        # IPC 핸들러 등록
    index.ts      # 앱 진입점
  preload/        # preload scripts
  renderer/
    src/
      components/ # React 컴포넌트
        ui/       # shadcn/ui 컴포넌트
      pages/      # 라우트 페이지
      store/      # Zustand stores
      types/      # TypeScript 타입 정의
      hooks/      # React 커스텀 훅
      i18n/       # 다국어 리소스
      utils/      # 유틸리티 함수
```

### 코드 스타일 (Biome)

1. Biome를 formatter + linter로 사용
2. 세미콜론 없음, 작은따옴표, 2 space 들여쓰기
3. import 정렬 자동화
4. ESLint/Prettier 사용하지 않음

---

## 네이밍 컨벤션

### Cherry → Angdu 매핑

| Cherry Studio | Angdu Studio |
|---------------|-------------|
| CherryStudio | AngduStudio |
| cherry-studio | angdu-studio |
| CHERRY_STUDIO | ANGDU_STUDIO |
| CherryIN | (제거 — Angdu 자체 인증 없음) |
| cherryin | (제거) |

### 일반 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `ChatInput`, `ProviderCard` |
| 파일 (컴포넌트) | PascalCase.tsx | `ChatInput.tsx` |
| 파일 (유틸/훅) | camelCase.ts | `useProvider.ts` |
| Zustand store | camelCase + Store | `providerStore.ts` |
| IPC 채널 | PascalCase_PascalCase | `Config_Get`, `File_Upload` |
| CSS 클래스 | Tailwind 유틸리티 | `flex items-center gap-2` |
| 상수 | UPPER_SNAKE_CASE | `MAX_CONTEXT_COUNT` |
| 타입/인터페이스 | PascalCase | `Provider`, `MessageBlock` |
| Zod 스키마 | PascalCase + Schema | `ProviderTypeSchema` |

---

## 아키타입별 원칙 (ai-assistant)

### Streaming-First

1. 모든 LLM 응답은 기본적으로 스트리밍 모드 사용
2. `streamText()` (Vercel AI SDK)를 기본 호출 방식으로 사용
3. 비스트리밍은 `AssistantSettings.streamOutput=false`일 때만 사용
4. 스트리밍 중 UI 업데이트: text delta → 즉시 렌더링, thinking → 별도 블록
5. 스트리밍 중단/일시정지/재개 지원

### Model Agnosticism

1. 프로바이더별 SDK는 Vercel AI SDK로 추상화 (@ai-sdk/openai, @ai-sdk/anthropic 등)
2. UI는 프로바이더 특정 기능에 의존하지 않음
3. 모델 교체가 어시스턴트 설정 변경만으로 가능해야 함
4. 프로바이더별 분기는 SDK 계층에서만 처리

### Token Awareness

1. 컨텍스트 윈도우 크기를 항상 인지
2. 입력 전 예상 토큰 수 표시
3. 응답 후 실제 사용량 (prompt/completion/total) 기록
4. 비용 추적 (ModelPricing 기반)
5. contextCount로 컨텍스트 윈도우 오버플로우 방지

### Offline Resilience

1. 네트워크 끊김 시 로컬 데이터 (어시스턴트, 토픽, 메시지) 접근 가능
2. 오프라인 상태에서 API 호출 실패 → 명확한 에러 메시지
3. 재연결 시 자동 재시도 옵션
4. Ollama (로컬 모델) 지원으로 완전 오프라인 사용 가능

### Prompt Versioning (미구현)

현재 Cherry Studio에 구현되어 있지 않으며, 향후 과제로 남긴다.

---

## 프레임워크 철학 (Electron)

### Main/Renderer Process 분리

1. **main**: 노드 환경, 시스템 리소스, DB, 파일 I/O, 네트워크
2. **renderer**: 브라우저 환경, React, DOM, 사용자 상호작용
3. **preload**: 안전한 IPC 브릿지, contextBridge로 API 노출
4. **규칙**: 비즈니스 로직의 데이터 접근 부분은 main, UI 로직은 renderer

### IPC for All Cross-Process

1. 동기 IPC (`ipcRenderer.sendSync`) 사용 금지 — 렌더러 블로킹
2. 비동기 IPC (`ipcMain.handle` / `ipcRenderer.invoke`) 패턴만 사용
3. 이벤트 전파: `webContents.send` (main → renderer 알림)
4. 대량 데이터: serialization 비용 고려, 필요 시 shared memory 또는 파일 경유

### Preload Bridge

1. `contextBridge.exposeInMainWorld('api', { ... })` 패턴
2. IPC 채널은 화이트리스트 방식으로 노출
3. 타입 안전성: preload에서 노출한 API의 TypeScript 타입 정의 공유

### Context Isolation

1. renderer의 window 객체에서 Node.js API 접근 불가
2. preload에서 노출한 `window.api`만 사용 가능
3. 보안: 외부 웹 콘텐츠가 로드되더라도 시스템 리소스 접근 차단

---

## 프로젝트별 권장 원칙

### 데이터 계층 일관성

1. **영속 데이터**: 반드시 main process의 better-sqlite3 (Drizzle ORM)을 통해 접근
2. **UI 상태**: Zustand store (localStorage persist)
3. **캐시**: renderer 메모리 (Zustand non-persist) 또는 main process 캐시
4. **금지**: renderer에서 직접 IndexedDB/Dexie 사용하지 않음

### 에러 처리

1. IPC 호출 실패: try-catch로 감싸고 사용자에게 토스트 알림
2. 스트리밍 에러: ErrorMessageBlock 생성, 메시지 상태 ERROR로 전환
3. 네트워크 에러: 재시도 옵션 제공
4. DB 에러: 로깅 + 사용자 알림 + 가능한 경우 복구

### 다국어 (i18n)

1. i18next + react-i18next 사용
2. 번역 키는 네임스페이스 기반 (`settings.general.language`)
3. 기본 언어: 한국어 (ko), 영어 (en) 우선 지원
4. 언어 변경: Config에 저장 + i18n.changeLanguage() + 앱 리로드 불필요

---

## 권장 개발 원칙

### Test-First

1. Feature 구현 전 E2E 테스트 시나리오 작성 (Playwright)
2. 핵심 비즈니스 로직은 단위 테스트 (Vitest) 작성
3. IPC 핸들러는 통합 테스트로 검증

### Think Before Coding

1. Feature 구현 전 SDD (specify → plan → implement → verify) 파이프라인 따름
2. 엔티티 관계, IPC 채널, 상태 흐름을 먼저 설계
3. 코드 작성은 설계 검증 후 시작

### Simplicity First

1. 과도한 추상화 지양
2. 프로바이더별 분기는 SDK 계층에서 한 번만
3. 컴포넌트는 단일 책임 원칙 준수
4. 상태는 필요한 곳에 가장 가까이 배치

### Surgical Changes

1. Feature 간 경계를 명확히 유지
2. 다른 Feature의 코드를 수정해야 할 때는 의존성 방향 확인
3. Cross-Feature 변경은 entity-registry와 api-registry 기준으로 판단

### Goal-Driven

1. 모든 구현은 Demo Group 시나리오 실행 가능을 목표로
2. 동작하지 않는 코드보다 동작하는 최소 구현 우선
3. 리팩토링은 동작 확인 후

### Demo-Ready

1. 각 RG 완료 시 해당 DG의 시나리오가 E2E로 실행 가능해야 함
2. UI는 기능적으로 완전해야 하며, 시각적 완성도는 후순위
3. 에러 상태도 graceful하게 처리

---

## Global Evolution Layer 운영 원칙

1. **roadmap.md**: Feature 추가/삭제, 의존성 변경, RG/DG 변경 시 업데이트
2. **entity-registry.md**: 엔티티 추가/필드 변경/저장소 변경 시 업데이트
3. **api-registry.md**: IPC 채널 추가/삭제/시그니처 변경 시 업데이트
4. **business-logic-map.md**: 비즈니스 규칙 추가/변경 시 업데이트
5. **constitution-seed.md**: 아키텍처 원칙 변경/추가 시 업데이트 (Feature SDD에서 발견된 원칙 승격)
6. **stack-migration.md**: 마이그레이션 전략 변경/새로운 이슈 발견 시 업데이트
7. **우선순위**: Feature별 SDD spec이 Global Layer와 충돌 시, Global Layer를 업데이트 후 Feature spec을 따름
8. **변경 추적**: Global Layer 변경 사유를 커밋 메시지에 명시
