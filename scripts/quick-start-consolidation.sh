#!/bin/bash
# Quick start script for RDS consolidation

set -e

echo "🚀 RDS Database Consolidation - Quick Start"
echo "============================================"
echo ""
echo "This will:"
echo "1. Check which databases have data"
echo "2. Export and migrate databases to shared Aurora cluster"
echo "3. Update AWS Secrets Manager"
echo "4. Update Pulumi code"
echo ""
echo "⚠️  Make sure you have:"
echo "   - PostgreSQL client tools installed (psql, pg_dump, pg_restore)"
echo "   - AWS CLI configured"
echo "   - jq installed"
echo "   - Access to AWS Secrets Manager"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Check prerequisites
echo ""
echo "Checking prerequisites..."

if ! command -v psql &> /dev/null; then
    echo "❌ psql not found. Install PostgreSQL client tools."
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "❌ jq not found. Install jq."
    echo "   macOS: brew install jq"
    echo "   Ubuntu: sudo apt-get install jq"
    exit 1
fi

if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI not configured. Run: aws configure"
    exit 1
fi

echo "✅ Prerequisites met"
echo ""

# Run consolidation script
echo "Running database consolidation..."
./scripts/rds-consolidation.sh

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database consolidation complete!"
    echo ""
    read -p "Update Pulumi code to reference shared cluster? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ./scripts/update-pulumi-for-shared-db.py
        echo ""
        echo "✅ Pulumi code updated!"
        echo ""
        echo "Next steps:"
        echo "1. Review changes: cd INFRASTRUCTURE && pulumi preview"
        echo "2. Apply changes: pulumi up"
        echo "3. Redeploy ECS services to pick up new connection strings"
        echo "4. Test all applications"
        echo "5. After 24-48 hours, delete old RDS instances"
    fi
else
    echo ""
    echo "❌ Consolidation failed. Check errors above."
    exit 1
fi
