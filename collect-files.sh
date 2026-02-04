#!/bin/bash

# collect-files.sh - Collect multiple files into a single file for context sharing
# Compatible with bash 3.x (macOS default)
#
# Usage: ./collect-files.sh [preset|files...] [-o output_file]
#
# Examples:
#   ./collect-files.sh src/app.js src/utils.js
#   ./collect-files.sh --preset inertia
#   ./collect-files.sh --preset docker
#   ./collect-files.sh -o context.txt file1.js file2.js

set -e

OUTPUT_FILE="collected-files.txt"
FILES=""
APPEND=false
INCLUDE_TREE=false

# Preset definitions (newline-separated file lists)
preset_inertia="bootstrap/ssr/ssr.ts
bootstrap/ssr/ssr.js
resources/js/ssr.tsx
resources/js/ssr.ts
resources/js/ssr.js
resources/js/app.tsx
resources/js/app.ts
resources/js/app.js
vite.config.ts
vite.config.js
tsconfig.json
package.json"

preset_docker="Dockerfile
docker-compose.yml
docker-compose.yaml
docker/standalone/Dockerfile
docker/standalone/entrypoint.d/99-laravel.sh
docker/standalone/etc/supervisor/supervisord.conf
docker/standalone/etc/supervisor/conf.d/horizon.conf
docker/standalone/etc/nginx/conf.d/custom.conf
docker/standalone/etc/nginx/site-opts.d/http.conf
docker/standalone/etc/s6-overlay/scripts/inertia-ssr
.dockerignore"

preset_laravel="composer.json
config/app.php
config/database.php
config/queue.php
config/horizon.php
routes/web.php
routes/api.php
app/Providers/AppServiceProvider.php
.env.example"

preset_github=".github/workflows/deploy.yml
.github/workflows/deploy-railway.yml
.github/workflows/railway.yml
.github/workflows/ci.yml
.github/workflows/test.yml"

preset_vite="vite.config.ts
vite.config.js
package.json
tsconfig.json
postcss.config.js
tailwind.config.js
tailwind.config.ts"

get_preset() {
    case "$1" in
        inertia) echo "$preset_inertia" ;;
        docker) echo "$preset_docker" ;;
        laravel) echo "$preset_laravel" ;;
        github) echo "$preset_github" ;;
        vite) echo "$preset_vite" ;;
        *) echo "" ;;
    esac
}

show_help() {
    echo "Usage: $0 [options] [files...]"
    echo ""
    echo "Options:"
    echo "  -o, --output FILE    Output file (default: collected-files.txt)"
    echo "  -p, --preset NAME    Use a preset file collection"
    echo "  -l, --list-presets   List available presets"
    echo "  -a, --append         Append to output file instead of overwriting"
    echo "  -t, --tree           Include directory tree at the top"
    echo "  -h, --help           Show this help"
    echo ""
    echo "Available presets: inertia, docker, laravel, github, vite"
    echo ""
    echo "Examples:"
    echo "  $0 src/app.js src/utils.js"
    echo "  $0 --preset inertia"
    echo "  $0 --preset docker --preset laravel"
    echo "  $0 -o context.txt -p inertia"
}

list_presets() {
    echo "Available presets:"
    echo ""
    echo "inertia:"
    echo "$preset_inertia" | sed 's/^/  /'
    echo ""
    echo "docker:"
    echo "$preset_docker" | sed 's/^/  /'
    echo ""
    echo "laravel:"
    echo "$preset_laravel" | sed 's/^/  /'
    echo ""
    echo "github:"
    echo "$preset_github" | sed 's/^/  /'
    echo ""
    echo "vite:"
    echo "$preset_vite" | sed 's/^/  /'
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -o|--output)
            OUTPUT_FILE="$2"
            shift 2
            ;;
        -p|--preset)
            PRESET_FILES=$(get_preset "$2")
            if [[ -z "$PRESET_FILES" ]]; then
                echo "Unknown preset: $2"
                echo "Available presets: inertia, docker, laravel, github, vite"
                exit 1
            fi
            FILES="$FILES
$PRESET_FILES"
            shift 2
            ;;
        -l|--list-presets)
            list_presets
            exit 0
            ;;
        -a|--append)
            APPEND=true
            shift
            ;;
        -t|--tree)
            INCLUDE_TREE=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        -*)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
        *)
            FILES="$FILES
$1"
            shift
            ;;
    esac
done

# Remove empty lines and trim
FILES=$(echo "$FILES" | grep -v '^$' | sort -u)

if [[ -z "$FILES" ]]; then
    echo "Error: No files specified"
    show_help
    exit 1
fi

# Initialize or append to output file
if [[ "$APPEND" == false ]]; then
    echo "# Collected Files" > "$OUTPUT_FILE"
    echo "# Generated: $(date)" >> "$OUTPUT_FILE"
    echo "# Working directory: $(pwd)" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
fi

# Optionally include directory tree
if [[ "$INCLUDE_TREE" == true ]]; then
    echo "## Directory Structure" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
    if command -v tree &> /dev/null; then
        tree -L 3 --noreport -I 'node_modules|vendor|.git' >> "$OUTPUT_FILE" 2>/dev/null || echo "(tree not available)" >> "$OUTPUT_FILE"
    else
        find . -maxdepth 3 -type f -not -path '*/node_modules/*' -not -path '*/vendor/*' -not -path '*/.git/*' 2>/dev/null | head -100 >> "$OUTPUT_FILE"
    fi
    echo '```' >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
fi

# Collect files
echo "Collecting files into: $OUTPUT_FILE"
echo ""

echo "$FILES" | while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    
    if [[ -f "$file" ]]; then
        echo "  ✓ $file"
        echo "========================================" >> "$OUTPUT_FILE"
        echo "FILE: $file" >> "$OUTPUT_FILE"
        echo "========================================" >> "$OUTPUT_FILE"
        cat "$file" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
    else
        echo "  ✗ $file (not found)"
    fi
done

echo ""
echo "Done! Output: $OUTPUT_FILE"
