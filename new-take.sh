#!/usr/bin/env bash

# ============================================================
# new-take.sh — Full project reset
# Deletes everything except this script and README.md,
# optionally archives current state before reset,
# cleans all git branches (local + remote), and creates
# a fresh initial commit.
# ============================================================

set -uo pipefail  # no -e: we handle errors manually

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_ROOT"

echo ""
echo -e "${RED}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║  WARNING: FULL PROJECT RESET                     ║${NC}"
echo -e "${RED}║  This will PERMANENTLY DELETE everything except:  ║${NC}"
echo -e "${RED}║    - new-take.sh                                  ║${NC}"
echo -e "${RED}║    - README.md                                    ║${NC}"
echo -e "${RED}║  All branches, tags (local + remote) wiped.       ║${NC}"
echo -e "${RED}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# --- Archive option ---
read -p "Archive current state before reset? (y/N): " ARCHIVE_CONFIRM
if [[ "$ARCHIVE_CONFIRM" =~ ^[yY]$ ]]; then
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  ARCHIVE_NAME="archive_${TIMESTAMP}.tar.gz"
  echo -e "${CYAN}Archiving to ${ARCHIVE_NAME}...${NC}"
  tar czf "../${ARCHIVE_NAME}" --exclude='.git' -C "$REPO_ROOT" .
  echo -e "${GREEN}Archived to $(cd .. && pwd)/${ARCHIVE_NAME}${NC}"
fi

# --- Confirm reset ---
echo ""
read -p "Type 'YES' to confirm reset: " CONFIRM

if [ "$CONFIRM" != "YES" ]; then
  echo -e "${YELLOW}Aborted.${NC}"
  exit 0
fi

echo ""

# --- [1/8] Switch to main ---
echo -e "${YELLOW}[1/8] Switching to main branch...${NC}"
git checkout main 2>/dev/null || git checkout -b main

# --- [2/8] Delete local branches ---
echo -e "${YELLOW}[2/8] Deleting all local branches except main...${NC}"
LOCAL_BRANCHES=$(git branch --format='%(refname:short)' | grep -v '^main$' || true)
if [ -n "$LOCAL_BRANCHES" ]; then
  echo "$LOCAL_BRANCHES" | xargs git branch -D 2>/dev/null || true
else
  echo "  No other local branches."
fi

# --- [3/8] Delete remote branches ---
echo -e "${YELLOW}[3/8] Deleting all remote branches except main...${NC}"
REMOTE_BRANCHES=$(git branch -r --format='%(refname:short)' | grep -v 'origin/main' | grep -v 'origin/HEAD' | sed 's|^origin/||' || true)
if [ -n "$REMOTE_BRANCHES" ]; then
  for branch in $REMOTE_BRANCHES; do
    echo "  Deleting remote: origin/$branch"
    git push origin --delete "$branch" 2>/dev/null || true
  done
else
  echo "  No other remote branches."
fi

# --- [4/8] Delete local tags ---
echo -e "${YELLOW}[4/8] Deleting all local tags...${NC}"
LOCAL_TAGS=$(git tag -l || true)
if [ -n "$LOCAL_TAGS" ]; then
  echo "$LOCAL_TAGS" | xargs git tag -d 2>/dev/null || true
else
  echo "  No local tags."
fi

# --- [5/8] Delete remote tags ---
echo -e "${YELLOW}[5/8] Deleting all remote tags...${NC}"
REMOTE_TAGS=$(git ls-remote --tags origin 2>/dev/null | awk '{print $2}' | sed 's|refs/tags/||' | grep -v '\^{}' || true)
if [ -n "$REMOTE_TAGS" ]; then
  for tag in $REMOTE_TAGS; do
    echo "  Deleting remote tag: $tag"
    git push origin --delete "$tag" 2>/dev/null || true
  done
else
  echo "  No remote tags."
fi

# --- [6/8] Delete all files except preserved ones ---
echo -e "${YELLOW}[6/8] Deleting all files except new-take.sh and README.md...${NC}"
for item in "$REPO_ROOT"/* "$REPO_ROOT"/.*; do
  basename="$(basename "$item")"
  case "$basename" in
    .|..|.git|new-take.sh|README.md) continue ;;
  esac
  echo "  Removing: $basename"
  rm -rf "$item"
done

# Verify cleanup
REMAINING=$(ls -A "$REPO_ROOT" | grep -v '^\.\(git\)$' | grep -v '^new-take.sh$' | grep -v '^README.md$' || true)
if [ -n "$REMAINING" ]; then
  echo -e "${RED}  Warning: Some items remain: ${REMAINING}${NC}"
fi

# --- [7/8] Fresh commit ---
echo -e "${YELLOW}[7/8] Creating fresh initial commit...${NC}"
git add -A
git commit -m "$(cat <<'EOF'
Start fresh

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"

# --- [8/8] Force push ---
echo -e "${YELLOW}[8/8] Force pushing to remote...${NC}"
read -p "Force push to origin/main? (y/N): " PUSH_CONFIRM
if [[ "$PUSH_CONFIRM" =~ ^[yY]$ ]]; then
  git push origin main --force
  echo -e "${GREEN}Remote updated.${NC}"
else
  echo -e "${YELLOW}Skipped remote push. Run 'git push origin main --force' manually.${NC}"
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Reset complete!                      ║${NC}"
echo -e "${GREEN}║  Remaining files:                     ║${NC}"
echo -e "${GREEN}║    - new-take.sh                      ║${NC}"
echo -e "${GREEN}║    - README.md                        ║${NC}"
echo -e "${GREEN}║  Branch: main (fresh commit)          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
