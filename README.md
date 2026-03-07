# angdu-studio

[spec-kit-skills](https://github.com/coolhero/spec-kit-skills)의 `reverse-spec` → `smart-sdd` 워크플로우를 검증하기 위한 실험 프로젝트.

[Cherry Studio](https://github.com/CherryHQ/cherry-studio)를 대상으로, 기존 소스코드에서 스펙을 역추출한 뒤 SDD 방식으로 재구현하는 과정을 다양한 조합으로 반복 실험한다.

---

## 실험 대상: Cherry Studio

멀티 LLM 프로바이더를 하나의 데스크탑 앱에서 통합 관리하는 크로스플랫폼 AI 클라이언트.

| 항목 | 내용 |
|------|------|
| **런타임** | Electron 40.6.1 |
| **프론트엔드** | React 19, TypeScript 5.8 |
| **빌드** | electron-vite, electron-builder, pnpm |
| **상태관리** | Redux Toolkit, Redux Persist |
| **UI** | Ant Design 5, TailwindCSS 4, Styled Components |
| **DB** | LibSQL + Drizzle ORM, Dexie (IndexedDB) |
| **AI SDK** | Anthropic, OpenAI, Google, Vercel AI SDK, LangChain 등 |
| **기타** | MCP SDK, TipTap 에디터, i18next, Mermaid, Tesseract OCR |

### 주요 기능

- 다중 LLM 프로바이더 (OpenAI, Anthropic, Gemini, Ollama 등)
- 300+ 프리셋 AI 어시스턴트
- 멀티모델 동시 대화
- 문서 처리 (PDF, Word, 이미지, OCR)
- MCP 서버 연동
- 마크다운 렌더링 + Mermaid 다이어그램
- WebDAV 백업

---

## 실험 도구: spec-kit-skills

[spec-kit](https://github.com/github/spec-kit) (Git 기반 SDD 실행 프레임워크)을 확장하는 Claude Code 커스텀 스킬 세트.

spec-kit이 개별 Feature 단위로만 동작하는 한계를 보완하여, **Global Evolution Layer**를 통해 프로젝트 전체의 크로스 Feature 컨텍스트를 관리한다.

### 핵심 워크플로우: reverse-spec → smart-sdd

```
┌─────────────────────────────────────────────────────┐
│  Phase 1: /reverse-spec                             │
│                                                     │
│  기존 소스코드 분석 → Global Evolution Layer 생성     │
│  - roadmap.md        (Feature 맵 + Tier 분류)       │
│  - entity-registry.md (엔티티 레지스트리)             │
│  - api-registry.md    (API 계약 레지스트리)           │
│  - business-logic-map.md (비즈니스 규칙)             │
│  - constitution-seed.md  (아키텍처 원칙 초안)         │
│  - features/F00N/pre-context.md (Feature별 컨텍스트) │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  Phase 2: /smart-sdd pipeline                       │
│                                                     │
│  SDD 파이프라인 실행 (Feature별 순차 처리)            │
│  constitution → specify → plan → tasks →             │
│  analyze → implement → verify → merge                │
│                                                     │
│  매 단계마다 크로스 Feature 컨텍스트 자동 주입         │
│  완료 후 Global Evolution Layer 자동 업데이트          │
└─────────────────────────────────────────────────────┘
```

---

## 실험 변수

각 take는 아래 3가지 축의 조합으로 구성된다.

### Scope: `core` vs `full`

| | core | full |
|---|---|---|
| **범위** | 5-axis 분석으로 Tier 1(Essential)만 우선 구현 | 전체 Feature 한번에 구현 |
| **확장** | 이후 `smart-sdd expand T2`, `expand full`로 점진 확장 | - |
| **적합한 경우** | 대규모 프로젝트, MVP 우선 | 소규모 또는 전체 재현 필요 시 |

### Approach: `new` vs `same`

| | new | same |
|---|---|---|
| **기술 스택** | 원본과 다른 스택으로 재구현 | 원본과 동일 스택으로 재구현 |
| **목적** | 스택 마이그레이션 검증 | 아키텍처 개선에 집중 |

### Granularity: `standard` vs `coarse`

| | standard | coarse |
|---|---|---|
| **Feature 분할** | 중간 단위 (10~15개) | 큰 단위 (5~8개) |
| **적합한 경우** | 세밀한 의존성 관리 | 빠른 실험, 오버헤드 최소화 |

---

## 프로젝트 구조

```
angdu-studio/
├── README.md          # 이 파일 (루트에 유지)
├── .gitignore         # git 무시 규칙 (루트에 유지)
├── new-take.sh        # 새 take 시작 스크립트 (루트에 유지)
├── archive/           # 완료/중단된 이전 take 보관
│   ├── take01-core-new-standard/
│   ├── take02-full-same-coarse/
│   └── ...
└── (현재 작업 파일들)  # 진행 중인 take의 파일들이 루트에 위치
```

### new-take.sh 사용법

```bash
./new-take.sh
```

실행하면:
1. scope(core/full), approach(new/same), granularity(standard/coarse) 선택
2. 루트의 현재 작업 파일들을 `archive/takeNN-...`으로 이동
3. `.git` 삭제 → git 재초기화 → force push
4. 루트가 깨끗한 상태로 새 실험 시작 가능

> `README.md`, `.gitignore`, `new-take.sh`는 이동되지 않고 루트에 유지된다.

---

## Take 기록

| Take | Scope | Approach | Granularity | 비고 |
|------|-------|----------|-------------|------|
| 01 | core | new | standard | Zustand + Shadcn/ui 스택 |
| 02 | full | same | coarse | Redux Toolkit + Ant Design (원본 동일) |

---

## 참고 링크

- [Cherry Studio](https://github.com/CherryHQ/cherry-studio) - 실험 대상 원본
- [spec-kit-skills](https://github.com/coolhero/spec-kit-skills) - reverse-spec + smart-sdd 스킬
- [spec-kit](https://github.com/github/spec-kit) - SDD 실행 프레임워크
