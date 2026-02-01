#!/bin/bash
# deploy-to-codebuild.sh
# Packages local code and triggers AWS CodeBuild for all multisite services

set -e

S3_BUCKET="fibonacco-codebuild-source"
SOURCE_ZIP="source_code.zip"
PROJECT_NAME="fibonacco-multisite-build"

echo "=== Packaging Source Code ==="
# Optimized zip with more exclusions to avoid large node_modules/vendor dirs
# We keep the storage and bootstrap folders but exclude deep contents
zip -r "$SOURCE_ZIP" . -x "node_modules/*" "vendor/*" "*/node_modules/*" "*/vendor/*" ".git/*" "storage/logs/*.log" "storage/framework/sessions/*" "storage/framework/views/*" "storage/framework/cache/*" "public/build/*" "INFRASTRUCTURE/venv/*" ".claude/*" ".cursor/*" "playwright-report/*" "test-results/*" "$SOURCE_ZIP"

echo "=== Uploading to S3 ==="
aws s3 cp "$SOURCE_ZIP" "s3://$S3_BUCKET/source.zip"

echo "=== Triggering CodeBuild Projects ==="

SERVICES=("daynews" "goeventcity" "golocalvoices" "downtownguide" "alphasite" "ssr")

for SVC in "${SERVICES[@]}"; do
    echo "Triggering build for: $SVC"
    aws codebuild start-build \
        --project-name "$PROJECT_NAME" \
        --environment-variables-override name=APP_NAME,value="$SVC",type=PLAINTEXT \
        --query "build.id" --output text
done

echo "=== Cleanup ==="
rm "$SOURCE_ZIP"

echo "✅ All builds triggered. Monitor progress in AWS Console or via 'aws codebuild batch-get-builds'."
