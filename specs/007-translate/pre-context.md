# F007 — translate Pre-Context

> **모드**: Rebuild, New Stack
> **소스 루트**: `/Users/coolhero/Develop/cherry-studio` (상대 경로 사용)

---

## 1. Brief Summary

LLM 기반 번역 기능을 제공하는 독립 페이지이다.
좌측 입력 + 우측 출력의 분할 패널 레이아웃으로, 소스 언어 자동 감지(또는 수동 선택)와 대상 언어 드롭다운을 지원한다.
OCR 통합(PaddleOCR)으로 이미지/문서에서 텍스트 추출 후 번역이 가능하며, 번역 이력은 Dexie(IndexedDB) translate_history 테이블에 저장된다.
파일 드래그 앤 드롭으로 텍스트/이미지/문서 파일을 직접 입력할 수 있고, 스트리밍 응답, 마크다운 렌더링, 자동 복사, 스크롤 동기화 등 부가 기능을 제공한다.

---

## 2. Runtime Exploration Results

| 항목 | 관찰 결과 |
|------|----------|
| 초기 상태 | "Auto Detect" 소스 언어 드롭다운, "English" 대상 언어, 빈 텍스트 영역 |
| 번역 실행 | 텍스트 입력 → Send 버튼(또는 Enter) → 우측에 스트리밍 번역 결과 표시 |
| 언어 교환 | SwapOutlined 버튼으로 소스↔대상 언어 교환 |
| 파일 입력 | 드래그 앤 드롭 → 텍스트 파일은 내용 추출, 이미지는 OCR → 텍스트 변환 |
| 번역 설정 | Settings 아이콘 → TranslateSettings 패널 (프롬프트 커스텀, 마크다운 모드 등) |
| 번역 이력 | FolderClock 아이콘 → TranslateHistory 드로어 표시 |
| 모델 선택 | ModelSelectButton으로 번역 모델 변경 |
| 미니 윈도우 | 별도 TranslateWindow로 미니 번역 창 지원 |

---

## 3. Source Reference

| File Path | Role | Rebuild Target |
|-----------|------|---------------|
| `src/renderer/src/pages/translate/TranslatePage.tsx` | 번역 페이지 메인 컴포넌트 | TBD |
| `src/renderer/src/pages/translate/TranslateHistory.tsx` | 번역 이력 드로어 | TBD |
| `src/renderer/src/pages/translate/TranslateSettings.tsx` | 번역 설정 패널 | TBD |
| `src/renderer/src/services/TranslateService.ts` | 번역 실행 서비스 (LLM API 호출, 스트리밍) | TBD |
| `src/renderer/src/hooks/useTranslate.ts` | 번역 설정/프롬프트 훅 | TBD |
| `src/renderer/src/hooks/useOcr.ts` | OCR 훅 | TBD |
| `src/renderer/src/store/translate.ts` | 번역 상태 (입력/출력 텍스트) | TBD |
| `src/renderer/src/store/ocr.ts` | OCR 상태 | TBD |
| `src/renderer/src/config/translate.ts` | 언어 목록 (LanguagesEnum), 번역 설정 상수 | TBD |
| `src/renderer/src/config/ocr.ts` | OCR 설정 상수 | TBD |
| `src/renderer/src/utils/translate.ts` | 번역 유틸리티 (언어 감지, 스크롤 동기화) | TBD |
| `src/renderer/src/types/ocr.ts` | OCR 타입 정의 | TBD |
| `src/renderer/src/i18n/translate/` | 번역 관련 i18n 리소스 | TBD |
| `src/renderer/src/components/LanguageSelect.tsx` | 언어 선택 드롭다운 컴포넌트 | TBD |
| `src/renderer/src/components/TranslateButton.tsx` | 번역 버튼 (외부 컴포넌트용) | TBD |
| `src/renderer/src/pages/home/Messages/MessageTranslate.tsx` | 메시지 내 번역 결과 표시 | TBD |
| `src/renderer/src/pages/settings/TranslateSettingsPopup/TranslateSettingsPopup.tsx` | 번역 설정 팝업 (전역) | TBD |
| `src/renderer/src/pages/settings/TranslateSettingsPopup/TranslatePromptSettings.tsx` | 번역 프롬프트 설정 | TBD |
| `src/renderer/src/windows/mini/translate/TranslateWindow.tsx` | 미니 번역 윈도우 | TBD |
| `src/renderer/src/windows/selection/action/components/ActionTranslate.tsx` | 선택 도우미 번역 액션 | TBD |
| `src/main/services/ocr/builtin/PpocrService.ts` | PaddleOCR 서비스 (메인 프로세스) | TBD |
| `src/main/utils/ocr.ts` | OCR 유틸리티 | TBD |
| `src/renderer/src/services/ocr/` | 렌더러 OCR 서비스 | TBD |
| `src/renderer/src/pages/settings/DocProcessSettings/OcrPpocrSettings.tsx` | PaddleOCR 설정 UI | TBD |

---

## 4. Source Behavior Inventory

| ID | Source File | Function/Method | Behavior | Priority | Origin |
|----|------------|-----------------|----------|----------|--------|
| B241 | `src/renderer/src/services/TranslateService.ts` | `translateText` | LLM에 번역 요청 — 스트리밍 응답, abort 지원 | P0 | Source |
| B242 | `src/renderer/src/services/TranslateService.ts` | `saveTranslateHistory` | 번역 결과를 Dexie translate_history에 저장 | P1 | Source |
| B243 | `src/renderer/src/pages/translate/TranslatePage.tsx` | 소스 언어 감지 | `detectLanguage`로 입력 텍스트의 언어 자동 감지 | P0 | Source |
| B244 | `src/renderer/src/pages/translate/TranslatePage.tsx` | 대상 언어 결정 | `determineTargetLanguage`로 소스 언어 기반 대상 언어 자동 설정 | P1 | Source |
| B245 | `src/renderer/src/pages/translate/TranslatePage.tsx` | 파일 드래그 앤 드롭 | 텍스트/이미지/문서 파일 → 텍스트 추출 → 입력 영역 채우기 | P1 | Source |
| B246 | `src/renderer/src/pages/translate/TranslatePage.tsx` | 언어 교환 | 소스↔대상 언어 swap + 입력↔출력 텍스트 swap (양방향 모드) | P1 | Source |
| B247 | `src/renderer/src/pages/translate/TranslatePage.tsx` | 스크롤 동기화 | 입력/출력 스크롤 위치 동기화 (isScrollSyncEnabled) | P2 | Source |
| B248 | `src/renderer/src/pages/translate/TranslatePage.tsx` | 마크다운 렌더링 | enableMarkdown 토글 → 출력을 마크다운으로 렌더링 | P2 | Source |
| B249 | `src/renderer/src/pages/translate/TranslatePage.tsx` | 자동 복사 | autoCopy 설정 시 번역 완료 후 클립보드 자동 복사 | P2 | Source |
| B250 | `src/renderer/src/pages/translate/TranslatePage.tsx` | 모델 선택 | ModelSelectButton으로 번역 모델 변경 | P0 | Source |
| B251 | `src/renderer/src/hooks/useTranslate.ts` | `useTranslate` | 번역 프롬프트, 언어 설정 제공 | P0 | Source |
| B252 | `src/renderer/src/hooks/useOcr.ts` | `useOcr` | 이미지/문서 OCR 실행 → 텍스트 반환 | P1 | Source |
| B253 | `src/renderer/src/pages/translate/TranslateHistory.tsx` | 이력 표시 | Dexie에서 번역 이력 조회 + 항목 클릭 시 복원 | P1 | Source |
| B254 | `src/renderer/src/pages/translate/TranslateSettings.tsx` | 설정 패널 | 번역 프롬프트 커스텀, 마크다운 모드, 스크롤 동기화 등 | P1 | Source |
| B255 | `src/renderer/src/store/translate.ts` | 번역 상태 | 입력 텍스트, 번역 결과 텍스트 상태 관리 | P0 | Source |
| B256 | `src/renderer/src/config/translate.ts` | `LanguagesEnum` | 지원 언어 목록 상수 | P0 | Source |
| B257 | `src/renderer/src/utils/translate.ts` | `detectLanguage` | 텍스트 기반 언어 자동 감지 | P1 | Source |
| B258 | `src/renderer/src/utils/translate.ts` | `createInputScrollHandler`, `createOutputScrollHandler` | 입출력 스크롤 동기화 핸들러 | P2 | Source |
| B259 | `src/renderer/src/windows/mini/translate/TranslateWindow.tsx` | 미니 윈도우 | 독립 미니 번역 창 (별도 BrowserWindow) | P2 | Source |
| B260 | `src/main/services/ocr/builtin/PpocrService.ts` | PaddleOCR | PaddleOCR 기반 이미지 텍스트 추출 (메인 프로세스) | P1 | Source |

---

## 5. UI Component Features

| 컴포넌트 | 기능 설명 |
|----------|----------|
| TranslatePage | 번역 페이지 전체 레이아웃 — Navbar + 분할 패널(입력/출력) |
| 입력 영역 | TextArea + LanguageSelect(소스) + 모델 선택 + 파일 업로드 버튼 |
| 출력 영역 | 번역 결과 표시 + LanguageSelect(대상) + 복사 버튼 |
| LanguageSelect | 언어 선택 드롭다운 (Auto Detect 포함) |
| ModelSelectButton | 번역 모델 선택 |
| TranslateHistory | 번역 이력 드로어 — 과거 번역 목록, 클릭 시 복원 |
| TranslateSettings | 설정 패널 — 프롬프트, 마크다운, 스크롤 동기화 |
| SwapOutlined 버튼 | 소스↔대상 언어 교환 |
| TranslateWindow | 미니 번역 윈도우 (독립 BrowserWindow) |

---

## 6. Interaction Behavior Inventory

| 사용자 동작 | 시스템 응답 |
|------------|-----------|
| 텍스트 입력 후 Send 클릭 | LLM API 호출, 스트리밍으로 우측에 번역 결과 표시 |
| Auto Detect 상태에서 입력 | 텍스트 분석 → 소스 언어 자동 감지 |
| 언어 교환 버튼 클릭 | 소스↔대상 언어 swap. 양방향 모드면 입출력 텍스트도 swap |
| 파일 드래그 앤 드롭 | 파일 유형 감지 → 텍스트 추출(텍스트 파일) 또는 OCR(이미지) → 입력 영역 채우기 |
| 파일 업로드 버튼 | 파일 선택 다이얼로그 → 위와 동일 |
| 이력 아이콘 클릭 | TranslateHistory 드로어 열기 |
| 이력 항목 클릭 | 해당 번역 입출력 복원 |
| 설정 아이콘 클릭 | TranslateSettings 패널 표시 |
| 복사 버튼 클릭 | 번역 결과를 클립보드에 복사 |
| 번역 중 정지 버튼 | abort signal로 스트리밍 중단 |
| 모델 변경 | 다음 번역부터 선택된 모델 사용 |

---

## 7. Component Tree

```
TranslatePage
├── Navbar (NavbarCenter: "Translate")
├── ModelSelectButton
├── SplitPane
│   ├── InputSection
│   │   ├── LanguageSelect (source, Auto Detect 포함)
│   │   ├── TextArea (입력)
│   │   ├── 토큰 수 표시
│   │   └── ActionBar
│   │       ├── UploadIcon (파일 업로드)
│   │       ├── SwapOutlined (언어 교환)
│   │       └── SendOutlined (번역 실행)
│   └── OutputSection
│       ├── LanguageSelect (target)
│       ├── 번역 결과 표시 영역 (텍스트 / 마크다운)
│       └── ActionBar
│           ├── CopyIcon (복사)
│           └── Check (복사 완료)
├── FloatButton.Group
│   ├── Settings2 → TranslateSettings
│   └── FolderClock → TranslateHistory (Drawer)
└── TranslateHistory (Drawer)
```

---

## 8. Data Lifecycle Patterns

| 데이터 | 생성 계기 | 저장소 | 갱신 시점 | 삭제 시점 |
|--------|---------|--------|---------|---------|
| 입력 텍스트 | 사용자 타이핑 / 파일 드롭 | Redux store → Zustand | 매 입력 시 | 페이지 이탈 시 (캐시 유지) |
| 번역 결과 | LLM 응답 수신 시 | Redux store → Zustand | 스트리밍 중 실시간 갱신 | 새 번역 시작 시 |
| TranslateHistory | 번역 완료 시 자동 저장 | Dexie (IndexedDB) translate_history → better-sqlite3 | 번역 완료 시 | 사용자 수동 삭제 |
| 소스/대상 언어 | 사용자 선택 또는 자동 감지 | 모듈 스코프 캐시 변수 | 언어 변경 시 | 앱 종료 시 |
| 번역 모델 | 사용자 선택 | store (defaultModel) | 모델 변경 시 | — |
| OCR 결과 | 이미지 파일 드롭 시 | 임시 (입력 영역에 채움) | — | 새 입력 시 |

---

## 9. Naming Remapping

| 소스 이름 | Angdu 이름 | 사유 |
|----------|-----------|------|
| Dexie `translate_history` | better-sqlite3 테이블 | DB 통합 (Renderer IndexedDB → Main SQLite) |
| Redux `translate` slice | Zustand `useTranslateStore` | 상태 관리 전환 |
| Redux `runtime.translating` | Zustand `useTranslateStore.translating` | 통합 |
| `styled-components` | Tailwind CSS 4 | 스타일링 전환 |
| Ant Design `TextArea`, `Button` 등 | shadcn/ui 대응 컴포넌트 | UI 라이브러리 전환 |

---

## 10. Static Resources

| 리소스 | 경로 | 용도 |
|--------|------|------|
| OCR 이미지 에셋 | `src/renderer/src/assets/images/ocr/` | OCR 프로바이더 로고 |
| PaddleOCR 로고 | `src/renderer/src/assets/images/providers/paddleocr.png` | PaddleOCR 프로바이더 아이콘 |

---

## 11. Environment Variables

| 변수 | 용도 | 기본값 |
|------|------|--------|
| (해당 없음) | 번역 기능은 환경 변수를 직접 사용하지 않음. LLM API 키는 F004 프로바이더 설정 경유 | — |

---

## 12. Feature Contracts

### 의존하는 Feature
| Feature | 계약 | 용도 |
|---------|------|------|
| F001 (app-shell) | IPC 채널, BrowserWindow (미니 윈도우) | OCR 메인 프로세스 호출, 미니 번역 창 |
| F004 (model-provider) | 모델 선택 API, LLM API 호출 | 번역 모델 선택 및 번역 실행 |
| F003 (settings) | i18n 시스템 | 언어 목록 및 UI 번역 |

### 제공하는 계약
| 계약 | 소비자 | 설명 |
|------|--------|------|
| `TranslateButton` | F005 (chat) | 채팅 메시지 번역 버튼 |
| `ActionTranslate` | F010 (selection assistant) | 선택 도우미에서 번역 액션 |
| `translateText` API | 내부 | 프로그래밍 방식 번역 호출 |

---

## 13. For /speckit.specify

- 번역 서비스는 Vercel AI SDK의 fetchChatCompletion을 사용. LangChain 의존 없음
- 스트리밍 응답: ChunkType.TEXT_DELTA → 실시간 표시, TEXT_COMPLETE → 완료 처리
- 번역 프롬프트는 getDefaultTranslateAssistant로 생성, 사용자 커스텀 가능
- Dexie translate_history → better-sqlite3로 마이그레이션 필요 (Main 프로세스 IPC 경유)
- OCR: PaddleOCR 기반, 메인 프로세스에서 실행. 이미지/PDF → 텍스트 추출
- 미니 번역 윈도우: 독립 BrowserWindow, F001 윈도우 관리 시스템 활용
- 언어 자동 감지: 클라이언트 사이드 텍스트 분석 (LLM 호출 아님)
- reasoningEffort 옵션으로 추론 강도 조절 가능

---

## 14. For /speckit.plan

- Phase 1: TranslatePage 기본 레이아웃 (입력/출력 분할, 언어 선택)
- Phase 2: translateText 서비스 (LLM 스트리밍 호출, abort)
- Phase 3: 언어 자동 감지, 언어 교환, 양방향 모드
- Phase 4: 파일 드래그 앤 드롭 + OCR 통합
- Phase 5: 번역 이력 (better-sqlite3 저장/조회)
- Phase 6: 부가 기능 (마크다운 렌더링, 자동 복사, 스크롤 동기화)
- Phase 7: 미니 번역 윈도우, 번역 설정 팝업

---

## 15. For /speckit.analyze

- 핵심 의존: F004 모델 프로바이더. 임베딩 모델이 아닌 일반 LLM 모델 사용
- OCR 의존: PaddleOCR 네이티브 바이너리 필요 (플랫폼별 빌드)
- 번역 이력 DB 마이그레이션: Dexie → better-sqlite3. 기존 이력 보존 불필요 (clean rebuild)
- 미니 윈도우: Electron BrowserWindow 기반, 별도 렌더러 프로세스. 메모리 사용 고려
- 스트리밍 UX: 긴 텍스트 번역 시 스크롤 동기화 성능 고려 (throttle 적용)
- 언어 감지 정확도: 짧은 텍스트에서는 부정확할 수 있음. 폴백 전략 필요
