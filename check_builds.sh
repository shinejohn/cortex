#!/bin/bash
echo "🔍 CHECKING CODEBUILD STATUS"
echo "============================"
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &>/dev/null; then
    echo "❌ AWS CLI not configured. Run: aws configure"
    exit 1
fi

echo "Checking CodeBuild projects..."
for service in goeventcity daynews downtownguide alphasite golocalvoices base-app inertia-ssr; do
    project="fibonacco-dev-${service}-build"
    echo ""
    echo "📦 ${service}:"
    
    # Get latest build
    build_id=$(aws codebuild list-builds-for-project \
        --project-name "$project" \
        --region us-east-1 \
        --max-items 1 \
        --query 'ids[0]' \
        --output text 2>/dev/null)
    
    if [ "$build_id" != "None" ] && [ -n "$build_id" ]; then
        status=$(aws codebuild batch-get-builds \
            --ids "$build_id" \
            --region us-east-1 \
            --query 'builds[0].buildStatus' \
            --output text 2>/dev/null)
        
        if [ "$status" = "SUCCEEDED" ]; then
            echo "  ✅ SUCCESS"
        elif [ "$status" = "IN_PROGRESS" ]; then
            echo "  🔵 IN PROGRESS"
        elif [ "$status" = "FAILED" ]; then
            echo "  ❌ FAILED"
            # Get error message
            error=$(aws codebuild batch-get-builds \
                --ids "$build_id" \
                --region us-east-1 \
                --query 'builds[0].phases[*].[phaseType,phaseStatus]' \
                --output text 2>/dev/null | grep FAILED | head -1)
            echo "     Error: $error"
        else
            echo "  ⚪ Status: $status"
        fi
    else
        echo "  ⚪ No builds yet"
    fi
done

echo ""
echo "📊 To see detailed logs:"
echo "   AWS Console → CodeBuild → Projects → Select project → Build history"
