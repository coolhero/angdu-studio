#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════════
# clean-restart.sh
#
# Deletes everything except CLAUDE.md, skill-feedback.md, .gitignore,
# and this script itself. Commits and pushes the clean state.
#
# Usage:
#   ./clean-restart.sh              # Execute
#   ./clean-restart.sh --dry-run    # Preview only
# ═══════════════════════════════════════════════════════════════════

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

# ─── Files to KEEP ───────────────────────────────────────────────

KEEP=(
  "CLAUDE.md"
  "skill-feedback.md"
  ".gitignore"
  "clean-restart.sh"
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
    if [[ "$item" == "$keep" ]]; then
      skip=true
      break
    fi
  done
  $skip || TO_DELETE+=("$item")
done

# Also check dotfiles (except .git, .gitignore)
for item in .*; do
  [[ "$item" == "." || "$item" == ".." || "$item" == ".git" ]] && continue
  skip=false
  for keep in "${KEEP[@]}"; do
    if [[ "$item" == "$keep" ]]; then
      skip=true
      break
    fi
  done
  $skip || TO_DELETE+=("$item")
done

echo "  DELETE:"
if [[ ${#TO_DELETE[@]} -eq 0 ]]; then
  echo "    (nothing to delete)"
else
  for f in "${TO_DELETE[@]}"; do
    if [[ -d "$f" ]]; then
      echo "    ✗ $f/"
    else
      echo "    ✗ $f"
    fi
  done
fi
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

echo ""
echo "  Remaining files:"
find . -not -path './.git/*' -not -path './.git' -not -name '.' | sort | head -30
echo ""

# ─── Delete feature branches (local + remote) ──────────────────

echo "  Cleaning up feature branches..."

MAIN_BRANCH="$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')"
MAIN_BRANCH="${MAIN_BRANCH:-main}"
CURRENT_BRANCH="$(git branch --show-current)"

# Switch to main if on a feature branch
if [[ "$CURRENT_BRANCH" != "$MAIN_BRANCH" ]]; then
  echo "  Switching from $CURRENT_BRANCH to $MAIN_BRANCH..."
  git checkout "$MAIN_BRANCH"
fi

# Delete local branches (everything except main)
LOCAL_BRANCHES=$(git branch --format='%(refname:short)' | grep -v "^${MAIN_BRANCH}$" || true)
if [[ -n "$LOCAL_BRANCHES" ]]; then
  echo "$LOCAL_BRANCHES" | while read -r branch; do
    git branch -D "$branch"
    echo "    Deleted local: $branch"
  done
else
  echo "    (no local branches to delete)"
fi

# Delete remote branches (everything except main and HEAD)
git fetch --prune origin 2>/dev/null || true
REMOTE_BRANCHES=$(git branch -r --format='%(refname:short)' | sed 's@^origin/@@' | grep -v "^${MAIN_BRANCH}$" | grep -v "^HEAD$" || true)
if [[ -n "$REMOTE_BRANCHES" ]]; then
  echo "$REMOTE_BRANCHES" | while read -r branch; do
    git push origin --delete "$branch" 2>/dev/null && echo "    Deleted remote: $branch" || echo "    Skip remote: $branch (already gone)"
  done
else
  echo "    (no remote branches to delete)"
fi

echo ""

# ─── Commit and push ─────────────────────────────────────────────

echo "  Staging, committing, and pushing..."

git add -A
git commit -m "$(cat <<'EOF'
chore: clean restart — preserve learnings, delete all implementation

Keep only:
- CLAUDE.md (project instructions)
- skill-feedback.md (SKF learning entries)
- clean-restart.sh (this script)
- .gitignore

Ready for fresh /reverse-spec with runtime verification.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"

git push --force

echo ""
echo "  ✅ Clean restart committed and pushed."
echo ""
echo "  ═══ Next Steps ═══"
echo ""
echo "  1. Run reverse-spec (with runtime verification):"
echo "     /reverse-spec"
echo ""
echo "  2. Then run the pipeline:"
echo "     /smart-sdd pipeline"
echo ""
