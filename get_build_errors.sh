#!/bin/bash
echo "🔍 FETCHING BUILD ERRORS"
echo "========================"
echo ""

PROJECTS=("fibonacco-dev-goeventcity-build" "fibonacco-dev-daynews-build" "fibonacco-dev-downtownguide-build" "fibonacco-dev-alphasite-build" "fibonacco-dev-golocalvoices-build" "fibonacco-dev-base-app-build" "fibonacco-dev-inertia-ssr-build")

for project in "${PROJECTS[@]}"; do
    echo "📦 $project:"
    
    # Get latest build ID
    BUILD_ID=$(aws codebuild list-builds-for-project \
        --project-name "$project" \
        --region us-east-1 \
        --max-items 1 \
        --query 'ids[0]' \
        --output text 2>/dev/null)
    
    if [ "$BUILD_ID" != "None" ] && [ -n "$BUILD_ID" ]; then
        # Get build details
        aws codebuild batch-get-builds \
            --ids "$BUILD_ID" \
            --region us-east-1 \
            --query 'builds[0].[buildStatus,phases[?phaseStatus==`FAILED`].[phaseType,contexts[0].message]]' \
            --output text 2>/dev/null | head -5
        
        echo ""
    fi
done

echo ""
echo "📊 For detailed logs:"
echo "   AWS Console → CodeBuild → Projects → Select project → Latest build → View logs"
