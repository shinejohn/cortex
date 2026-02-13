#!/bin/bash
# ============================================================
# Adaptive Fetcher Installation Script
# 
# Installs the Platform-Aware Adaptive Fetcher into your
# Community Platform Laravel project.
#
# Usage:
#   cd /path/to/Community-Platform
#   bash install-adaptive-fetcher.sh
#
# What it does:
#   1. Copies migration, models, services, seeder, and command
#   2. Runs the migration
#   3. Seeds platform profiles
#   4. Shows next steps
#
# What it does NOT do:
#   - Modify existing files (WebScrapingService, etc.)
#   - Those changes are documented at the bottom for manual review
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(pwd)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE} Adaptive Fetcher Installer${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

# Verify we're in a Laravel project
if [ ! -f "artisan" ]; then
    echo "❌ Error: artisan not found. Run this from your Laravel project root."
    exit 1
fi

if [ ! -d "app/Models" ]; then
    echo "❌ Error: app/Models not found. Is this the right directory?"
    exit 1
fi

echo -e "${GREEN}✓${NC} Laravel project detected at: ${PROJECT_DIR}"
echo ""

# ============================================================
# 1. Create directories
# ============================================================
echo -e "${YELLOW}Creating directories...${NC}"

mkdir -p app/Models
mkdir -p app/Services/Newsroom
mkdir -p app/Console/Commands/Newsroom
mkdir -p database/seeders

echo -e "${GREEN}✓${NC} Directories ready"

# ============================================================
# 2. Copy Migration
# ============================================================
echo -e "${YELLOW}Installing migration...${NC}"

MIGRATION_FILE="database/migrations/$(date +%Y_%m_%d)_000001_create_platform_profiles_table.php"
cat > "${MIGRATION_FILE}" << 'MIGRATION_EOF'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('slug')->unique();
            $table->string('display_name');
            $table->string('category');
            $table->json('detection_signatures');
            $table->string('best_fetch_method')->default('http_get');
            $table->string('fallback_fetch_method')->nullable();
            $table->boolean('needs_js_rendering')->default(false);
            $table->json('content_selectors')->nullable();
            $table->json('noise_selectors')->nullable();
            $table->json('rss_patterns')->nullable();
            $table->json('api_patterns')->nullable();
            $table->float('avg_response_time_ms')->nullable();
            $table->float('avg_content_quality')->nullable();
            $table->integer('sample_size')->default(0);
            $table->float('confidence_score')->default(0);
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::table('news_sources', function (Blueprint $table) {
            $table->uuid('platform_profile_id')->nullable()->after('platform_config');
            $table->foreign('platform_profile_id')->references('id')->on('platform_profiles')->nullOnDelete();
            $table->string('detected_platform_slug')->nullable()->after('platform_profile_id');
            $table->timestamp('platform_detected_at')->nullable()->after('detected_platform_slug');
        });

        Schema::table('collection_methods', function (Blueprint $table) {
            $table->json('auto_detected_config')->nullable()->after('platform_config');
            $table->boolean('is_auto_configured')->default(false)->after('auto_detected_config');
        });

        Schema::create('fetch_performance_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('source_id');
            $table->uuid('collection_method_id')->nullable();
            $table->string('platform_slug')->nullable();
            $table->string('fetch_method');
            $table->boolean('success');
            $table->integer('response_time_ms');
            $table->integer('content_length')->default(0);
            $table->integer('items_extracted')->default(0);
            $table->float('content_quality_score')->nullable();
            $table->boolean('content_changed')->default(false);
            $table->string('error_message', 500)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('source_id')->references('id')->on('news_sources')->cascadeOnDelete();
            $table->index(['source_id', 'created_at']);
            $table->index(['platform_slug', 'fetch_method']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fetch_performance_logs');

        Schema::table('collection_methods', function (Blueprint $table) {
            $table->dropColumn(['auto_detected_config', 'is_auto_configured']);
        });

        Schema::table('news_sources', function (Blueprint $table) {
            $table->dropForeign(['platform_profile_id']);
            $table->dropColumn(['platform_profile_id', 'detected_platform_slug', 'platform_detected_at']);
        });

        Schema::dropIfExists('platform_profiles');
    }
};
MIGRATION_EOF

echo -e "${GREEN}✓${NC} Migration: ${MIGRATION_FILE}"

# ============================================================
# 3. Copy Models
# ============================================================
echo -e "${YELLOW}Installing models...${NC}"

cp "${SCRIPT_DIR}/app/Models/PlatformProfile.php" app/Models/PlatformProfile.php
cp "${SCRIPT_DIR}/app/Models/FetchPerformanceLog.php" app/Models/FetchPerformanceLog.php

echo -e "${GREEN}✓${NC} Models: PlatformProfile, FetchPerformanceLog"

# ============================================================
# 4. Copy Services
# ============================================================
echo -e "${YELLOW}Installing services...${NC}"

cp "${SCRIPT_DIR}/app/Services/Newsroom/PlatformDetectorService.php" app/Services/Newsroom/PlatformDetectorService.php
cp "${SCRIPT_DIR}/app/Services/Newsroom/AdaptiveFetcherService.php" app/Services/Newsroom/AdaptiveFetcherService.php

echo -e "${GREEN}✓${NC} Services: PlatformDetectorService, AdaptiveFetcherService"

# ============================================================
# 5. Copy Seeder
# ============================================================
echo -e "${YELLOW}Installing seeder...${NC}"

cp "${SCRIPT_DIR}/database/seeders/PlatformProfileSeeder.php" database/seeders/PlatformProfileSeeder.php

echo -e "${GREEN}✓${NC} Seeder: PlatformProfileSeeder"

# ============================================================
# 6. Copy Command
# ============================================================
echo -e "${YELLOW}Installing command...${NC}"

cp "${SCRIPT_DIR}/app/Console/Commands/Newsroom/DetectPlatformsCommand.php" app/Console/Commands/Newsroom/DetectPlatformsCommand.php

echo -e "${GREEN}✓${NC} Command: DetectPlatformsCommand"

# ============================================================
# Summary
# ============================================================
echo ""
echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE} Installation Complete${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""
echo -e "Files installed:"
echo -e "  ${GREEN}✓${NC} ${MIGRATION_FILE}"
echo -e "  ${GREEN}✓${NC} app/Models/PlatformProfile.php"
echo -e "  ${GREEN}✓${NC} app/Models/FetchPerformanceLog.php"
echo -e "  ${GREEN}✓${NC} app/Services/Newsroom/PlatformDetectorService.php"
echo -e "  ${GREEN}✓${NC} app/Services/Newsroom/AdaptiveFetcherService.php"
echo -e "  ${GREEN}✓${NC} database/seeders/PlatformProfileSeeder.php"
echo -e "  ${GREEN}✓${NC} app/Console/Commands/Newsroom/DetectPlatformsCommand.php"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "  1. Run the migration:"
echo "     php artisan migrate"
echo ""
echo "  2. Seed platform profiles:"
echo "     php artisan db:seed --class=PlatformProfileSeeder"
echo ""
echo "  3. Test detection on a single URL:"
echo "     php artisan newsroom:detect-platforms --url=https://www.clearwater.gov"
echo ""
echo "  4. Detect platforms for all existing sources:"
echo "     php artisan newsroom:detect-platforms --auto-configure"
echo ""
echo "  5. Wire AdaptiveFetcherService into your collection pipeline:"
echo "     In NewsroomCollectCommand or wherever you call WebScrapingService,"
echo "     replace with AdaptiveFetcherService::fetch() for adaptive behavior."
echo ""
echo -e "${YELLOW}Integration points (manual changes needed):${NC}"
echo ""
echo "  The AdaptiveFetcherService is designed as a DROP-IN replacement."
echo "  Wherever you currently call:"
echo "    \$this->webScrapingService->scrape(\$method)"
echo "  Replace with:"
echo "    \$this->adaptiveFetcherService->fetch(\$method)"
echo ""
echo "  The adaptive fetcher handles RSS, scraping, Playwright, ScrapingBee,"
echo "  and AI extraction automatically based on the detected platform."
echo ""
echo -e "${BLUE}==========================================${NC}"
