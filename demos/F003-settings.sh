#!/bin/bash
# Demo: F003 Settings — Angdu Studio
#
# Usage:
#   ./demos/F003-settings.sh         # Interactive demo
#   ./demos/F003-settings.sh --ci    # CI health check (build → launch → verify → exit)
#
# ─────────────────────────────────────────────────────────────
# TEST PLAN (Interactive Mode)
#
# 사전 조건: 앱이 시작되면 Home 화면이 나옵니다.
# 진입 방법: Navbar 우측 상단의 ⚙️ (gear) 아이콘을 클릭합니다.
#
# ── Test 1: 설정 페이지 네비게이션 ──
#   조작: ⚙️ 아이콘 클릭
#   기대: "Settings" 탭이 탭바에 추가되고, 설정 페이지로 이동
#   확인: 좌측 사이드바에 "일반 / 화면 / 데이터 / 단축키" 4개 메뉴 표시
#
#   조작: 각 사이드바 메뉴 항목을 순서대로 클릭
#   기대: 우측 콘텐츠 영역이 해당 서브페이지로 전환
#   확인: 페이지 제목이 "일반 설정" → "화면 설정" → "데이터 관리" → "단축키 설정"으로 변경
#
# ── Test 2: 테마 전환 (즉시 적용) ──
#   조작: 화면 설정 → 테마에서 "다크" 라디오 버튼 클릭
#   기대: 전체 UI가 즉시(200ms 이내) 어두운 색상으로 변경
#   확인: 배경이 검은색, 텍스트가 흰색으로 바뀜. 사이드바, 탭바 모두 다크 적용
#
#   조작: "라이트" 라디오 버튼 클릭
#   기대: 전체 UI가 밝은 색상으로 복귀
#   확인: 배경이 흰색, 텍스트가 검은색으로 복귀
#
# ── Test 3: 글꼴 크기 (슬라이더 + 디바운스) ──
#   조작: 화면 설정 → 글꼴 크기 슬라이더를 우측(24px)으로 드래그
#   기대: 모든 텍스트가 즉시 커짐. 슬라이더 우측에 숫자(예: 24) 표시
#   확인: 설정 페이지 내 텍스트 크기가 눈에 띄게 증가
#
#   조작: 슬라이더를 좌측(12px)으로 드래그
#   기대: 텍스트가 작아짐
#   확인: 글자가 작아지고 우측 숫자가 12로 변경
#
# ── Test 4: 언어 전환 ──
#   조작: 일반 설정 → 언어 드롭다운에서 "English" 선택
#   기대: 모든 UI 텍스트가 즉시 영어로 변경
#   확인: 사이드바 "일반"→"General", "화면"→"Display", 페이지 제목 "General"
#
#   조작: 다시 "한국어" 선택
#   기대: 모든 UI 텍스트가 한국어로 복귀
#   확인: 사이드바 "General"→"일반", 페이지 제목 "일반 설정"
#
# ── Test 5: 내비게이션 위치 변경 ──
#   조작: 일반 설정 → 내비게이션 위치에서 "좌측" 라디오 버튼 클릭
#   기대: 상단 탭바가 사라지고, 좌측에 아이콘 사이드바가 나타남
#   확인: 레이아웃이 "상단 탭 + 콘텐츠" → "좌측 아이콘바 + 콘텐츠"로 변경
#
#   조작: "상단" 라디오 버튼 클릭
#   기대: 상단 탭바로 복귀
#   확인: 좌측 사이드바 사라지고 상단에 탭바 다시 표시
#
# ── Test 6: 데이터 내보내기/가져오기 ──
#   조작: 데이터 → "내보내기" 버튼 클릭
#   기대: 파일 저장 다이얼로그가 열림
#   확인: 기본 파일명이 "angdu-studio.YYYYMMDDHHmm.zip" 형식
#
#   조작: 저장 위치 선택 후 저장
#   기대: ZIP 파일이 생성됨
#   확인: 저장된 경로에 .zip 파일이 존재
#
# ── Test 7: 단축키 편집 ──
#   조작: 단축키 → "New Chat" 옆의 키 바인딩 뱃지(예: Cmd+N) 클릭
#   기대: 뱃지가 "키를 누르세요..." 텍스트로 변경 (녹음 모드)
#   확인: 뱃지 테두리가 깜빡이는 강조 효과
#
#   조작: Ctrl+Shift+N 키 조합 입력
#   기대: 뱃지에 "Ctrl+Shift+N"이 표시되고 저장됨
#   확인: 페이지 새로고침 없이 즉시 반영
#
#   조작: 이미 사용 중인 키 조합(예: Cmd+K) 입력
#   기대: "Search과(와) 충돌합니다" 경고 표시
#   확인: 충돌 경고 텍스트가 빨간색으로 표시
#
# ── Test 8: 설정 영속성 (앱 재시작) ──
#   조작: 테마를 다크로 변경 + 글꼴 크기를 20으로 변경
#   조작: Cmd+Q (또는 Ctrl+Q)로 앱 종료 후 다시 실행
#   기대: 다크 테마와 글꼴 크기 20이 유지됨
#   확인: 앱 시작 시 다크 모드이고 텍스트가 큰 상태
#
# ── Test 9: 데이터 전체 삭제 (주의!) ──
#   조작: 데이터 → "모든 데이터 삭제" 버튼 클릭
#   기대: "정말로 삭제하시겠습니까?" 확인 다이얼로그 표시
#   확인: 다이얼로그에 경고 문구와 "네, 모두 삭제" / "취소" 버튼
#
#   조작: "취소" 클릭
#   기대: 데이터 삭제되지 않고 다이얼로그만 닫힘
#   확인: 기존 설정이 그대로 유지
#
# ─────────────────────────────────────────────────────────────

set -euo pipefail
cd "$(dirname "$0")/.."

if [ "${1:-}" = "--ci" ]; then
  echo "CI mode: quick health check for F003 settings"

  # Build if needed
  if [ ! -d "out/main" ]; then
    echo "Building app..."
    pnpm run build 2>&1 | tail -3
  fi

  # Typecheck to verify F003 types are sound
  echo "Running typecheck..."
  pnpm run typecheck 2>&1 | tail -5
  echo "Typecheck passed"

  # Launch app in background
  npx electron . --no-sandbox &
  PID=$!
  sleep 8

  if kill -0 "$PID" 2>/dev/null; then
    echo "App launched successfully (PID: $PID)"
    kill "$PID" 2>/dev/null || true
    wait "$PID" 2>/dev/null || true
    echo "F003-settings CI check passed"
    exit 0
  else
    echo "App failed to launch"
    exit 1
  fi
fi

# Interactive mode
echo "╔══════════════════════════════════════════════════════════╗"
echo "║          F003 Settings — Interactive Demo               ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "진입: Navbar 우측 상단의 ⚙️ (gear) 아이콘을 클릭하세요."
echo ""
echo "테스트 항목 (위 스크립트 주석에 상세 설명):"
echo ""
echo "  1. 설정 페이지 네비게이션  — 4개 서브페이지 전환 확인"
echo "  2. 테마 전환              — 다크 ↔ 라이트 즉시 적용"
echo "  3. 글꼴 크기              — 슬라이더 드래그 → 텍스트 크기 변경"
echo "  4. 언어 전환              — 한국어 ↔ English 전체 UI 변경"
echo "  5. 내비게이션 위치         — 상단 탭 ↔ 좌측 사이드바 전환"
echo "  6. 데이터 내보내기/가져오기 — ZIP 파일 저장/복원"
echo "  7. 단축키 편집             — 키 녹음, 충돌 감지, 초기화"
echo "  8. 설정 영속성             — 앱 재시작 후 설정 유지 확인"
echo "  9. 데이터 삭제             — 확인 다이얼로그 동작"
echo ""
echo "Press Ctrl+C to stop."
echo ""

exec pnpm run dev
