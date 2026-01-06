#!/bin/bash
# Test script to verify all Inertia pages exist

echo "🔍 Testing Inertia Page Components..."
echo ""

missing_pages=()
found_pages=()

# Extract all Inertia::render calls
grep -r "Inertia::render" routes/ app/Http/Controllers/ 2>/dev/null | while IFS= read -r line; do
    # Extract page path from Inertia::render('path')
    page=$(echo "$line" | grep -oP "Inertia::render\(['\"][^'\"]+['\"]" | sed "s/Inertia::render(['\"]//" | sed "s/['\"]//")
    
    if [ -z "$page" ]; then
        continue
    fi
    
    # Check if file exists
    file="resources/js/pages/${page}.tsx"
    if [ -f "$file" ]; then
        echo "✅ $page"
        found_pages+=("$page")
    else
        echo "❌ $page - FILE MISSING: $file"
        missing_pages+=("$page")
    fi
done | sort -u

echo ""
echo "📊 Summary:"
echo "Found pages: ${#found_pages[@]}"
echo "Missing pages: ${#missing_pages[@]}"

if [ ${#missing_pages[@]} -gt 0 ]; then
    echo ""
    echo "⚠️  Missing pages:"
    printf '%s\n' "${missing_pages[@]}"
fi

