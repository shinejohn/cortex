<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // --- RAW CONTENT: routing and geographic scope ---
        Schema::table('raw_content', function (Blueprint $table) {
            $table->string('geographic_scope', 30)->nullable()
                ->comment('hyperlocal|multi_community|county|regional|statewide|national');
            $table->string('dateline_city')->nullable();
            $table->string('dateline_state', 2)->nullable();
            $table->uuid('press_release_id')->nullable();
            $table->json('routed_outputs')->nullable()
                ->comment('[{type:"news_article",id:"uuid"},{type:"announcement",id:"uuid"}]');
            $table->string('routing_status', 20)->default('pending')
                ->comment('pending|routed|failed');
            $table->timestamp('routed_at')->nullable();

            $table->index(['classification_status', 'routing_status'], 'idx_raw_class_route');
            $table->index('geographic_scope');
        });

        // --- NEWS ARTICLES: traceability back to RawContent ---
        Schema::table('news_articles', function (Blueprint $table) {
            $table->uuid('raw_content_id')->nullable();
            $table->index('raw_content_id');
        });

        // --- ANNOUNCEMENTS: source tracking for auto-generated content ---
        Schema::table('announcements', function (Blueprint $table) {
            $table->uuid('raw_content_id')->nullable();
            $table->uuid('region_id')->nullable();
            $table->uuid('business_id')->nullable();
            $table->boolean('is_ai_generated')->default(false);
            $table->string('source_origin', 30)->nullable()
                ->comment('wire_service|press_release|email|rss|scrape');
            $table->index('raw_content_id');
            $table->index(['region_id', 'created_at']);
        });

        // --- MEMORIALS: source tracking for auto-generated obituary notices ---
        Schema::table('memorials', function (Blueprint $table) {
            $table->uuid('raw_content_id')->nullable();
            $table->uuid('region_id')->nullable();
            $table->boolean('is_ai_generated')->default(false);
            $table->index('raw_content_id');
        });
    }

    public function down(): void
    {
        Schema::table('raw_content', function (Blueprint $table) {
            $table->dropIndex('idx_raw_class_route');
            $table->dropColumn(['geographic_scope', 'dateline_city', 'dateline_state',
                'press_release_id', 'routed_outputs', 'routing_status', 'routed_at']);
        });
        Schema::table('news_articles', function (Blueprint $table) {
            $table->dropColumn('raw_content_id');
        });
        Schema::table('announcements', function (Blueprint $table) {
            $table->dropColumn(['raw_content_id', 'region_id', 'business_id',
                'is_ai_generated', 'source_origin']);
        });
        Schema::table('memorials', function (Blueprint $table) {
            $table->dropColumn(['raw_content_id', 'region_id', 'is_ai_generated']);
        });
    }
};
