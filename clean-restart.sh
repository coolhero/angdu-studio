#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════════
# clean-restart.sh
#
# Deletes everything except CLAUDE.md and skill-feedback.md,
# commits the clean state, ready for fresh reverse-spec + pipeline.
#
# Usage:
#   ./scripts/clean-restart.sh              # Execute
#   ./scripts/clean-restart.sh --dry-run    # Preview only
# ═══════════════════════════════════════════════════════════════════

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

# ─── Files to KEEP ───────────────────────────────────────────────
# Everything else gets deleted.

KEEP=(
  "CLAUDE.md"
  "skill-feedback.md"
  ".gitignore"
  ".claude"
  "scripts/clean-restart.sh"
  "scripts/verify-cherry-runtime.ts"
)

echo "═══════════════════════════════════════════════════════════"
echo "  Clean Restart — delete all, keep essentials"
echo "  Mode: $($DRY_RUN && echo 'DRY RUN' || echo 'LIVE')"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  KEEP:"
for f in "${KEEP[@]}"; do
  if [[ -e "$f" ]]; then
    echo "    ✓ $f"
  else
    echo "    - $f (not found, skip)"
  fi
done
echo ""

# ─── Collect files/dirs to DELETE ────────────────────────────────

TO_DELETE=()

for item in *; do
  skip=false
  for keep in "${KEEP[@]}"; do
    # Match exact file or parent dir
    if [[ "$item" == "$keep" ]] || [[ "$keep" == "$item/"* ]]; then
      skip=true
      break
    fi
  done
  $skip || TO_DELETE+=("$item")
done

# Also check dotfiles (except .git, .gitignore, .claude)
for item in .*; do
  [[ "$item" == "." || "$item" == ".." || "$item" == ".git" ]] && continue
  skip=false
  for keep in "${KEEP[@]}"; do
    if [[ "$item" == "$keep" ]] || [[ "$keep" == "$item/"* ]]; then
      skip=true
      break
    fi
  done
  $skip || TO_DELETE+=("$item")
done

echo "  DELETE:"
for f in "${TO_DELETE[@]}"; do
  if [[ -d "$f" ]]; then
    echo "    ✗ $f/"
  else
    echo "    ✗ $f"
  fi
done
echo ""

if $DRY_RUN; then
  echo "  [DRY RUN] No changes made."
  exit 0
fi

# ─── Confirm ─────────────────────────────────────────────────────

read -p "  Proceed? (y/N) " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "  Aborted."
  exit 0
fi

# ─── Execute deletion ────────────────────────────────────────────

echo ""
for f in "${TO_DELETE[@]}"; do
  rm -rf "$f"
  echo "  Deleted: $f"
done

# Ensure KEEP dirs exist
mkdir -p scripts

# Move scripts back if they survived (they're in KEEP)
# They should still be there since scripts/ dir was in KEEP list via its children

echo ""
echo "  Remaining files:"
find . -not -path './.git/*' -not -path './.git' -not -name '.' | sort | head -30
echo ""

# ─── Commit ──────────────────────────────────────────────────────

echo "  Staging and committing..."

git add -A
git commit -m "$(cat <<'EOF'
chore: clean restart — preserve learnings, delete all implementation

Keep only:
- CLAUDE.md (project instructions)
- skill-feedback.md (16 SKF entries from F001/F002 learnings)
- .gitignore
- .claude/ (project settings)
- scripts/ (runtime verification tools)

Delete all:
- Source code (src/, packages/)
- Spec artifacts (specs/, .specify/)
- Build output (out/)
- Config files (package.json, tsconfig, etc.)
- F001/F002 implementation
- reverse-spec artifacts

Ready for fresh /reverse-spec with runtime verification.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"

echo ""
echo "  ✅ Clean restart committed."
echo ""
echo "  ═══ Next Steps ═══"
echo ""
echo "  1. Run reverse-spec (with runtime verification):"
echo "     /reverse-spec"
echo ""
echo "  2. Then run the pipeline:"
echo "     /smart-sdd pipeline"
echo ""
echo "  3. Cherry Studio runtime verification:"
echo "     npx tsx scripts/verify-cherry-runtime.ts"
echo ""
