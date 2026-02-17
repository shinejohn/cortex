#!/bin/bash
# Push fixes to GitHub using token

TOKEN="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"
REPO="shinejohn/Community-Platform"
BRANCH="main"

echo "🚀 Pushing fixes to GitHub..."
echo ""

# Set remote with token
git remote set-url origin "https://${TOKEN}@github.com/${REPO}.git"

# Try push
if git push origin main 2>&1; then
    echo ""
    echo "✅ Successfully pushed!"
    echo "Pipeline will auto-trigger in a few minutes"
else
    echo ""
    echo "❌ Push failed. Use GitHub Web UI instead:"
    echo "https://github.com/${REPO}/tree/main/docker"
fi
