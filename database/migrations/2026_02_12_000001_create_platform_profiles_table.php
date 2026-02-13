<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('slug')->unique();                    // 'wordpress', 'civicplus', 'squarespace'
            $table->string('display_name');                      // 'WordPress'
            $table->string('category');                          // 'cms', 'government', 'ecommerce', 'website_builder'
            $table->json('detection_signatures');                // How to identify this platform
            $table->string('best_fetch_method')->default('http_get'); // 'http_get', 'playwright', 'scrapingbee'
            $table->string('fallback_fetch_method')->nullable();
            $table->boolean('needs_js_rendering')->default(false);
            $table->json('content_selectors')->nullable();       // CSS selectors for main content
            $table->json('noise_selectors')->nullable();          // CSS selectors to REMOVE
            $table->json('rss_patterns')->nullable();             // Common RSS URL patterns
            $table->json('api_patterns')->nullable();             // Common API URL patterns
            $table->float('avg_response_time_ms')->nullable();
            $table->float('avg_content_quality')->nullable();     // 0-100 score
            $table->integer('sample_size')->default(0);
            $table->float('confidence_score')->default(0);        // 0-1
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        // Add platform_profile_id to news_sources
        Schema::table('news_sources', function (Blueprint $table) {
            $table->uuid('platform_profile_id')->nullable()->after('platform_config');
            $table->foreign('platform_profile_id')->references('id')->on('platform_profiles')->nullOnDelete();
            $table->string('detected_platform_slug')->nullable()->after('platform_profile_id');
            $table->timestamp('platform_detected_at')->nullable()->after('detected_platform_slug');
        });

        // Add platform tracking to collection_methods
        Schema::table('collection_methods', function (Blueprint $table) {
            $table->json('auto_detected_config')->nullable()->after('platform_config');
            $table->boolean('is_auto_configured')->default(false)->after('auto_detected_config');
        });

        // Track fetch performance per source for learning
        Schema::create('fetch_performance_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('source_id');
            $table->uuid('collection_method_id')->nullable();
            $table->string('platform_slug')->nullable();
            $table->string('fetch_method');                      // 'http_get', 'playwright', 'scrapingbee', 'rss'
            $table->boolean('success');
            $table->integer('response_time_ms');
            $table->integer('content_length')->default(0);
            $table->integer('items_extracted')->default(0);
            $table->float('content_quality_score')->nullable();  // AI-assessed quality 0-100
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
