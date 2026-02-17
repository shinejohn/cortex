<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('state_rollouts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('state_code', 2)->unique();
            $table->string('state_name');
            $table->string('status')->default('planned'); // planned|in_progress|completed|paused
            $table->integer('total_communities')->default(0);
            $table->integer('completed_communities')->default(0);
            $table->integer('failed_communities')->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->decimal('total_api_cost', 10, 2)->default(0);
            $table->integer('total_businesses_discovered')->default(0);
            $table->integer('total_news_sources_created')->default(0);
            $table->json('settings')->nullable(); // batch_size, throttle_ms, concurrent_communities, skip_enrichment, priority_communities
            $table->string('initiated_by')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('state_code');
        });

        Schema::create('community_rollouts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('state_rollout_id');
            $table->uuid('community_id');
            $table->string('status')->default('queued'); // queued|phase_1_discovery|phase_2_scanning|phase_3_sources|phase_4_enrichment|phase_5_verification|completed|failed|paused
            $table->integer('current_phase')->default(0); // 1-6

            // Per-phase tracking
            $table->string('phase_1_status')->default('pending'); // pending|running|completed|failed
            $table->string('phase_2_status')->default('pending');
            $table->string('phase_3_status')->default('pending');
            $table->string('phase_4_status')->default('pending');
            $table->string('phase_5_status')->default('pending');
            $table->string('phase_6_status')->default('pending');

            $table->timestamp('phase_1_started_at')->nullable();
            $table->timestamp('phase_1_completed_at')->nullable();
            $table->timestamp('phase_2_started_at')->nullable();
            $table->timestamp('phase_2_completed_at')->nullable();
            $table->timestamp('phase_3_started_at')->nullable();
            $table->timestamp('phase_3_completed_at')->nullable();
            $table->timestamp('phase_4_started_at')->nullable();
            $table->timestamp('phase_4_completed_at')->nullable();
            $table->timestamp('phase_5_started_at')->nullable();
            $table->timestamp('phase_5_completed_at')->nullable();
            $table->timestamp('phase_6_started_at')->nullable();
            $table->timestamp('phase_6_completed_at')->nullable();

            // Outcome counters
            $table->integer('businesses_discovered')->default(0);
            $table->integer('businesses_with_websites')->default(0);
            $table->integer('news_sources_created')->default(0);
            $table->integer('collection_methods_created')->default(0);
            $table->integer('events_venues_created')->default(0);
            $table->integer('directory_listings_created')->default(0);
            $table->integer('crm_leads_created')->default(0);

            // Cost tracking
            $table->integer('api_calls_made')->default(0);
            $table->decimal('api_cost_estimate', 10, 4)->default(0);

            // Error handling
            $table->json('error_log')->nullable();
            $table->integer('retry_count')->default(0);

            $table->timestamps();

            $table->foreign('state_rollout_id')->references('id')->on('state_rollouts')->cascadeOnDelete();
            $table->index(['state_rollout_id', 'status']);
            $table->index('community_id');
            $table->index('status');
        });

        Schema::create('rollout_api_usage', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('community_rollout_id');
            $table->string('api_name'); // google_places|serpapi|scrapingbee|openrouter|unsplash
            $table->string('endpoint'); // text_search|nearby_search|place_details|place_photos
            $table->string('sku_tier'); // essentials|pro|enterprise
            $table->integer('request_count')->default(1);
            $table->decimal('estimated_cost', 10, 4)->default(0);
            $table->integer('actual_response_count')->default(0);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('community_rollout_id')->references('id')->on('community_rollouts')->cascadeOnDelete();
            $table->index(['community_rollout_id', 'api_name']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rollout_api_usage');
        Schema::dropIfExists('community_rollouts');
        Schema::dropIfExists('state_rollouts');
    }
};
