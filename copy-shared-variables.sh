#!/bin/bash
# Script to copy shared variables from Climactic to Shine Dev Environment
# This will export variables from Climactic and import them to Shine Dev

set -e

echo "=========================================="
echo "RAILWAY SHARED VARIABLES MIGRATION"
echo "From: Climactic → To: Shine Dev Environment"
echo "=========================================="
echo ""

# Create temp directory for variable exports
TEMP_DIR="/tmp/railway-var-migration-$(date +%s)"
mkdir -p "$TEMP_DIR"

echo "Step 1: Saving current project context..."
CURRENT_PROJECT=$(railway status 2>/dev/null | grep "Project:" | cut -d: -f2 | xargs)
echo "Current project: $CURRENT_PROJECT"

# We need to manually switch projects since Railway CLI doesn't have a direct command
# We'll need to use the Railway API or do this through the dashboard

echo ""
echo "=========================================="
echo "MANUAL STEPS REQUIRED"
echo "=========================================="
echo ""
echo "The Railway CLI doesn't support switching between projects programmatically."
echo "Please follow these steps:"
echo ""
echo "1. Get Climactic shared variables:"
echo "   - Go to Railway dashboard"
echo "   - Select 'Climactic' project"
echo "   - Go to project Settings → Shared Variables"
echo "   - Copy all 90 variables"
echo ""
echo "2. Add to Shine Dev Environment:"
echo "   - Go to 'Shine Dev Environment' project"
echo "   - Go to project Settings → Shared Variables"
echo "   - Paste all variables"
echo ""
echo "OR use the Railway CLI manually:"
echo ""
echo "# In a separate terminal, link to Climactic:"
echo "cd /tmp && railway link  # Select Climactic"
echo "railway variables --json > $TEMP_DIR/climactic-shared-vars.json"
echo ""
echo "# Then link back to Shine Dev and import"
echo "cd /Users/johnshine/Dropbox/Fibonacco/Day-News/Multisite"
echo "railway link  # Select Shine Dev Environment"
echo ""
echo "# Then manually set each variable from the JSON file"
echo ""
echo "=========================================="
echo ""
echo "Temp directory for exports: $TEMP_DIR"
