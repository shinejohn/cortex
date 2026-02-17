<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // --- WIRE SERVICE FEEDS: configuration for each RSS/API feed we poll ---
        Schema::create('wire_service_feeds', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('service_provider', 50)
                ->comment('pr_newswire|business_wire|globenewswire|prlog|rtpr|ein_presswire|pr_com|pr_urgent');
            $table->string('feed_url');
            $table->string('feed_format', 20)->default('rss')
                ->comment('rss|atom|api|ftp');
            $table->json('geographic_filters')->nullable()
                ->comment('State codes, metro areas, or ZIP prefixes to include');
            $table->json('industry_filters')->nullable();
            $table->json('keyword_filters')->nullable();
            $table->integer('poll_interval_minutes')->default(15);
            $table->boolean('is_enabled')->default(true);
            $table->timestamp('last_polled_at')->nullable();
            $table->timestamp('last_successful_at')->nullable();
            $table->integer('consecutive_failures')->default(0);
            $table->string('last_error')->nullable();
            $table->integer('health_score')->default(100);
            $table->text('api_key_encrypted')->nullable();
            $table->timestamps();
            $table->index(['service_provider', 'is_enabled']);
        });

        // --- WIRE SERVICE RUNS: log each poll attempt with stats ---
        Schema::create('wire_service_runs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('feed_id');
            $table->integer('items_found')->default(0);
            $table->integer('items_new')->default(0);
            $table->integer('items_duplicate')->default(0);
            $table->integer('items_filtered_geo')->default(0);
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->string('status', 20)->default('running');
            $table->text('error')->nullable();
            $table->timestamps();
            $table->foreign('feed_id')->references('id')->on('wire_service_feeds')->onDelete('cascade');
            $table->index(['feed_id', 'started_at']);
        });

        // --- PRESS RELEASES: structured press release data extracted from raw content ---
        Schema::create('press_releases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('raw_content_id')->nullable();
            $table->uuid('community_id')->nullable();
            $table->uuid('region_id')->nullable();
            $table->string('company_name')->nullable();
            $table->string('contact_name')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('source_wire_service')->nullable()
                ->comment('pr_newswire|business_wire|globenewswire|direct|email|portal');
            $table->string('headline');
            $table->string('subheadline')->nullable();
            $table->text('body');
            $table->string('dateline_city')->nullable();
            $table->string('dateline_state', 2)->nullable();
            $table->timestamp('release_date')->nullable();
            $table->timestamp('embargo_until')->nullable();
            $table->string('press_release_type', 50)->nullable()
                ->comment('business_announcement|executive_move|product_launch|funding|award|event|partnership|expansion|hiring|closing|obituary');
            $table->string('geographic_scope', 30)->nullable();
            $table->json('output_types_determined')->nullable()
                ->comment('What outputs: ["article","announcement","event","memorial","business_update"]');
            $table->string('status', 20)->default('received')
                ->comment('received|classified|routed|published|rejected');
            $table->json('routed_outputs')->nullable();
            $table->json('attachments')->nullable();
            $table->timestamps();
            $table->index(['region_id', 'status']);
            $table->index(['source_wire_service', 'created_at']);
            $table->index('raw_content_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('press_releases');
        Schema::dropIfExists('wire_service_runs');
        Schema::dropIfExists('wire_service_feeds');
    }
};
