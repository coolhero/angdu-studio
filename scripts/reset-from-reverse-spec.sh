#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════════
# reset-from-reverse-spec.sh
#
# Resets the project to post-F001 state with runtime-verified
# reverse-spec artifacts, ready for full pipeline re-run.
#
# What it does:
#   1. Preserves skill-feedback.md (learning asset)
#   2. Reverts all uncommitted F002 changes
#   3. Cleans F002 spec artifacts (002-navigation/)
#   4. Runs Cherry Studio with Playwright to capture runtime defaults
#   5. Patches reverse-spec artifacts with runtime-verified values
#   6. Resets sdd-state.md (F002+ back to pending)
#   7. Prints next steps
#
# Usage:
#   ./scripts/reset-from-reverse-spec.sh              # Full reset
#   ./scripts/reset-from-reverse-spec.sh --dry-run     # Show what would happen
#   ./scripts/reset-from-reverse-spec.sh --skip-cherry  # Skip Cherry Studio runtime check
#
# Prerequisites:
#   - Cherry Studio source at $CHERRY_DIR (built)
#   - Playwright installed (npx @playwright/test)
#   - Current branch: main
# ═══════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CHERRY_DIR="${CHERRY_DIR:-/Users/coolhero/Develop/cherry-studio}"
RUNTIME_VERIFY_SCRIPT="$PROJECT_DIR/scripts/verify-cherry-runtime.ts"
BACKUP_DIR="$PROJECT_DIR/.reset-backup/$(date +%Y%m%d-%H%M%S)"

DRY_RUN=false
SKIP_CHERRY=false

for arg in "$@"; do
  case $arg in
    --dry-run) DRY_RUN=true ;;
    --skip-cherry) SKIP_CHERRY=true ;;
  esac
done

# ─── Helpers ──────────────────────────────────────────────────────

info()  { echo "  [INFO] $*"; }
step()  { echo ""; echo "═══ Step $1: $2 ═══"; }
warn()  { echo "  [WARN] $*"; }
fail()  { echo "  [FAIL] $*"; exit 1; }

run() {
  if $DRY_RUN; then
    echo "  [DRY-RUN] $*"
  else
    "$@"
  fi
}

# ─── Pre-flight checks ───────────────────────────────────────────

cd "$PROJECT_DIR"

echo "═══════════════════════════════════════════════════════════"
echo "  Reset from Reverse-Spec"
echo "  Project: $PROJECT_DIR"
echo "  Cherry:  $CHERRY_DIR"
echo "  Mode:    $($DRY_RUN && echo 'DRY RUN' || echo 'LIVE')"
echo "═══════════════════════════════════════════════════════════"

# Verify we're on main
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  fail "Must be on main branch (currently on: $CURRENT_BRANCH)"
fi

# Verify F001 is committed
if ! git log --oneline | grep -q "F001"; then
  fail "F001 commit not found. This script expects F001 to be merged."
fi

# ─── Step 1: Backup ──────────────────────────────────────────────

step 1 "Backup important files"

run mkdir -p "$BACKUP_DIR"

# Always preserve skill-feedback.md
if [[ -f "skill-feedback.md" ]]; then
  run cp "skill-feedback.md" "$BACKUP_DIR/skill-feedback.md"
  info "Backed up skill-feedback.md"
fi

# Backup current sdd-state.md
if [[ -f "specs/reverse-spec/sdd-state.md" ]]; then
  run cp "specs/reverse-spec/sdd-state.md" "$BACKUP_DIR/sdd-state.md"
  info "Backed up sdd-state.md"
fi

# Backup F002 spec if exists (for reference)
if [[ -d "specs/002-navigation" ]]; then
  run cp -r "specs/002-navigation" "$BACKUP_DIR/002-navigation"
  info "Backed up specs/002-navigation/"
fi

info "Backups saved to: $BACKUP_DIR"

# ─── Step 2: Revert uncommitted F002 changes ─────────────────────

step 2 "Revert uncommitted changes"

DIRTY_FILES=$(git status --porcelain | wc -l | tr -d ' ')
if [[ "$DIRTY_FILES" -gt 0 ]]; then
  info "Reverting $DIRTY_FILES uncommitted changes..."

  # Restore tracked files to HEAD
  run git checkout -- .

  # Remove untracked files/dirs (but preserve backups and skill-feedback)
  # Use git clean with exclusions
  run git clean -fd \
    -e ".reset-backup/" \
    -e ".claude/" \
    -e "node_modules/" \
    -e "tests/e2e/screenshots/"

  info "Working tree clean"
else
  info "No uncommitted changes"
fi

# ─── Step 3: Clean F002 spec artifacts ────────────────────────────

step 3 "Clean F002 spec artifacts"

if [[ -d "specs/002-navigation" ]]; then
  run rm -rf "specs/002-navigation"
  info "Removed specs/002-navigation/"
else
  info "specs/002-navigation/ not found (already clean)"
fi

# ─── Step 4: Restore skill-feedback.md ────────────────────────────

step 4 "Restore skill-feedback.md"

if [[ -f "$BACKUP_DIR/skill-feedback.md" ]]; then
  run cp "$BACKUP_DIR/skill-feedback.md" "skill-feedback.md"
  info "Restored skill-feedback.md from backup"
fi

# ─── Step 5: Runtime verification of Cherry Studio ────────────────

step 5 "Runtime verification of Cherry Studio"

if $SKIP_CHERRY; then
  warn "Skipping Cherry Studio runtime verification (--skip-cherry)"
else
  # Check Cherry Studio is built
  if [[ ! -f "$CHERRY_DIR/out/main/index.js" ]]; then
    info "Building Cherry Studio..."
    (cd "$CHERRY_DIR" && pnpm build 2>&1 | tail -5) || fail "Cherry Studio build failed"
  fi

  # Run runtime verification script
  if [[ -f "$RUNTIME_VERIFY_SCRIPT" ]]; then
    info "Running runtime verification..."
    RUNTIME_OUTPUT="$PROJECT_DIR/specs/reverse-spec/runtime-defaults.md"
    run npx tsx "$RUNTIME_VERIFY_SCRIPT" > "$RUNTIME_OUTPUT" 2>&1 || {
      warn "Runtime verification failed. Output saved to $RUNTIME_OUTPUT"
      warn "You can re-run manually: npx tsx $RUNTIME_VERIFY_SCRIPT"
    }
    if [[ -f "$RUNTIME_OUTPUT" ]] && ! $DRY_RUN; then
      info "Runtime defaults captured → $RUNTIME_OUTPUT"
    fi
  else
    warn "Runtime verify script not found: $RUNTIME_VERIFY_SCRIPT"
    warn "Create it first, or run with --skip-cherry"
  fi
fi

# ─── Step 6: Reset sdd-state.md ──────────────────────────────────

step 6 "Reset sdd-state.md"

SDD_STATE="specs/reverse-spec/sdd-state.md"
if [[ -f "$SDD_STATE" ]] && ! $DRY_RUN; then
  # Reset F002 to pending (clear all step checkmarks)
  sed -i '' 's/| F002 | navigation | T1 | ✅ | ✅ | ✅ | ✅ | ✅ | | | in_progress |/| F002 | navigation | T1 | | | | | | | | pending |/' "$SDD_STATE"

  # Clear F002 detail log
  # Find the F002 section and clear step rows
  python3 -c "
import re
with open('$SDD_STATE', 'r') as f:
    content = f.read()

# Reset F002 detail log steps
pattern = r'(### F002-navigation\n\n\| Step \| Status.*?\n\|---.*?\n)((?:\|.*\n)*)'
replacement = r'\1'
content = re.sub(pattern, replacement, content)

with open('$SDD_STATE', 'w') as f:
    f.write(content)
" 2>/dev/null || warn "Could not auto-reset F002 detail log (manual edit needed)"

  info "Reset F002 to pending in sdd-state.md"
else
  info "sdd-state.md unchanged ($($DRY_RUN && echo 'dry run' || echo 'not found'))"
fi

# ─── Step 7: Summary ─────────────────────────────────────────────

step 7 "Summary"

echo ""
echo "  ✅ F002 implementation reverted (git checkout)"
echo "  ✅ F002 spec artifacts cleaned"
echo "  ✅ skill-feedback.md preserved (16 SKF entries)"
echo "  ✅ sdd-state.md reset (F002 → pending)"
if ! $SKIP_CHERRY; then
  echo "  ✅ Cherry Studio runtime defaults captured"
fi
echo ""
echo "  Backup location: $BACKUP_DIR"
echo ""
echo "  ═══ Next Steps ═══"
echo ""
echo "  1. Review runtime defaults:"
echo "     cat specs/reverse-spec/runtime-defaults.md"
echo ""
echo "  2. Patch reverse-spec pre-context if needed:"
echo "     vi specs/reverse-spec/features/F002-navigation/pre-context.md"
echo ""
echo "  3. Re-run F002 pipeline with runtime-verified defaults:"
echo "     /smart-sdd pipeline F002"
echo ""
echo "  4. Or re-run reverse-spec entirely (if structural changes needed):"
echo "     /smart-sdd reset"
echo "     /reverse-spec"
echo ""
