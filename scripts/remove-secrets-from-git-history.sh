#!/bin/bash
set -e

# CRITICAL: Remove sensitive files from git history
# This script removes .env.testing and related files from all git history

echo "⚠️  CRITICAL SECURITY FIX"
echo "=========================="
echo ""
echo "This will remove .env.testing and related files from git history."
echo "These files contain AWS credentials that were accidentally committed."
echo ""
echo "⚠️  WARNING: This rewrites git history!"
echo "⚠️  Make sure you have a backup and coordinate with your team."
echo ""
read -p "Continue? (type 'yes' to confirm): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

# Files to remove from history
FILES=(
    ".env.testing"
    ".env.testing.bak"
    ".env.bak"
)

echo ""
echo "Removing files from git history..."

# Use git filter-branch or BFG Repo-Cleaner
# For simplicity, using git filter-repo (recommended) or git filter-branch

if command -v git-filter-repo &> /dev/null; then
    echo "Using git-filter-repo..."
    for file in "${FILES[@]}"; do
        git filter-repo --path "$file" --invert-paths --force
    done
elif command -v bfg &> /dev/null; then
    echo "Using BFG Repo-Cleaner..."
    for file in "${FILES[@]}"; do
        bfg --delete-files "$file"
    done
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive
else
    echo "Using git filter-branch (slower, but works)..."
    for file in "${FILES[@]}"; do
        git filter-branch --force --index-filter \
            "git rm --cached --ignore-unmatch $file" \
            --prune-empty --tag-name-filter cat -- --all
    done
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive
fi

echo ""
echo "✅ Files removed from git history"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Force push to remote: git push --force --all"
echo "2. Revoke AWS credentials immediately in AWS Console"
echo "3. Generate new AWS credentials"
echo "4. Update all services with new credentials"
echo ""
echo "⚠️  WARNING: Anyone who cloned the repo before this fix has the credentials!"
echo "   Consider rotating ALL credentials that were in .env.testing"
