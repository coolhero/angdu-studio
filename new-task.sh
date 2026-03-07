#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# new-task.sh — Full project reset
# Deletes everything except this script and README.md,
# cleans all git branches (local + remote), and creates
# a fresh initial commit.
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_ROOT"

echo ""
echo -e "${RED}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║  WARNING: FULL PROJECT RESET                     ║${NC}"
echo -e "${RED}║  This will PERMANENTLY DELETE everything except:  ║${NC}"
echo -e "${RED}║    - new-task.sh                                  ║${NC}"
echo -e "${RED}║    - README.md                                    ║${NC}"
echo -e "${RED}║  All git branches (local + remote) will be wiped. ║${NC}"
echo -e "${RED}╚══════════════════════════════════════════════════╝${NC}"
echo ""
read -p "Type 'YES' to confirm: " CONFIRM

if [ "$CONFIRM" != "YES" ]; then
  echo -e "${YELLOW}Aborted.${NC}"
  exit 0
fi

echo ""
echo -e "${YELLOW}[1/6] Switching to main branch...${NC}"
git checkout main 2>/dev/null || git checkout -b main

echo -e "${YELLOW}[2/6] Deleting all local branches except main...${NC}"
git branch | grep -v '^\*' | grep -v 'main' | xargs -r git branch -D 2>/dev/null || true

echo -e "${YELLOW}[3/6] Deleting all remote branches except main...${NC}"
REMOTE_BRANCHES=$(git branch -r | grep -v 'origin/main' | grep -v 'origin/HEAD' | sed 's|origin/||' | xargs)
for branch in $REMOTE_BRANCHES; do
  echo "  Deleting remote: origin/$branch"
  git push origin --delete "$branch" 2>/dev/null || true
done

echo -e "${YELLOW}[4/6] Deleting all files except new-task.sh and README.md...${NC}"
find "$REPO_ROOT" -mindepth 1 -maxdepth 1 \
  ! -name 'new-task.sh' \
  ! -name 'README.md' \
  ! -name '.git' \
  -exec rm -rf {} +

# Also clean dotfiles/dirs in root (except .git)
find "$REPO_ROOT" -mindepth 1 -maxdepth 1 -name '.*' \
  ! -name '.git' \
  -exec rm -rf {} +

echo -e "${YELLOW}[5/6] Creating fresh initial commit...${NC}"
git add -A
git commit -m "$(cat <<'EOF'
Start fresh

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"

echo -e "${YELLOW}[6/6] Force pushing to remote...${NC}"
read -p "Force push to origin/main? (y/N): " PUSH_CONFIRM
if [ "$PUSH_CONFIRM" = "y" ] || [ "$PUSH_CONFIRM" = "Y" ]; then
  git push origin main --force
  echo -e "${GREEN}Remote updated.${NC}"
else
  echo -e "${YELLOW}Skipped remote push. Run 'git push origin main --force' manually.${NC}"
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Reset complete!                      ║${NC}"
echo -e "${GREEN}║  Remaining files:                     ║${NC}"
echo -e "${GREEN}║    - new-task.sh                      ║${NC}"
echo -e "${GREEN}║    - README.md                        ║${NC}"
echo -e "${GREEN}║  Branch: main (fresh commit)          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
