<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Civic Source Platforms (CivicPlus, Granicus/Legistar, Nixle)
        Schema::create('civic_source_platforms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 50)->unique(); // civicplus, legistar, nixle
            $table->string('display_name', 100);
            $table->text('description')->nullable();
            $table->string('api_base_url')->nullable();
            $table->json('detection_patterns')->nullable(); // URL patterns, HTML signatures
            $table->json('default_config')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Individual Civic Sources (discovered municipal sites/feeds)
        Schema::create('civic_sources', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('region_id')->index();
            $table->uuid('platform_id')->index();
            
            // Source identification
            $table->string('name', 255); // "City of Tampa - Legistar"
            $table->string('source_type', 50); // rss, api, scrape
            $table->string('entity_type', 50)->nullable(); // city, county, school_district, police
            
            // Connection details
            $table->string('base_url')->nullable();
            $table->string('api_endpoint')->nullable();
            $table->string('api_client_name')->nullable(); // For Legistar: "tampa"
            $table->string('rss_feed_url')->nullable();
            $table->string('agency_id')->nullable(); // For Nixle agency IDs
            
            // Geographic targeting
            $table->string('zip_codes')->nullable(); // Comma-separated ZIP codes
            $table->string('county')->nullable();
            $table->string('state', 2)->nullable();
            
            // Platform-specific config
            $table->json('config')->nullable(); // Feed IDs, selectors, etc.
            $table->json('available_feeds')->nullable(); // Discovered RSS feeds
            
            // Collection settings
            $table->integer('poll_interval_minutes')->default(60);
            $table->timestamp('last_collected_at')->nullable();
            $table->integer('last_items_found')->default(0);
            $table->timestamp('next_collection_at')->nullable();
            
            // Health tracking
            $table->boolean('is_enabled')->default(true);
            $table->boolean('is_verified')->default(false);
            $table->integer('consecutive_failures')->default(0);
            $table->integer('health_score')->default(100);
            $table->text('last_error')->nullable();
            $table->timestamp('last_error_at')->nullable();
            
            // Discovery metadata
            $table->boolean('auto_discovered')->default(false);
            $table->timestamp('discovered_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign keys
            $table->foreign('region_id')->references('id')->on('regions')->onDelete('cascade');
            $table->foreign('platform_id')->references('id')->on('civic_source_platforms')->onDelete('cascade');
            
            // Unique constraint
            $table->unique(['region_id', 'base_url', 'source_type'], 'civic_sources_unique');
        });

        // Civic Content Items (raw collected data before processing)
        Schema::create('civic_content_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('civic_source_id')->index();
            $table->uuid('region_id')->index();
            
            // Content type
            $table->string('content_type', 50); // meeting, agenda, alert, advisory, matter, event
            
            // Original content
            $table->string('external_id')->nullable(); // Platform's ID
            $table->string('title', 500);
            $table->text('description')->nullable();
            $table->text('full_content')->nullable();
            $table->string('url', 1000)->nullable();
            
            // Dates
            $table->timestamp('published_at')->nullable();
            $table->timestamp('event_date')->nullable(); // For meetings/events
            $table->timestamp('expires_at')->nullable(); // For alerts
            
            // Classification
            $table->string('category', 100)->nullable(); // government, public_safety, community
            $table->string('subcategory', 100)->nullable();
            $table->json('tags')->nullable();
            
            // For meetings/agendas
            $table->string('body_name')->nullable(); // "City Council", "Planning Board"
            $table->string('meeting_type')->nullable(); // regular, special, emergency
            $table->json('agenda_items')->nullable();
            $table->json('attachments')->nullable();
            
            // For alerts (Nixle)
            $table->string('alert_type')->nullable(); // alert, advisory, community
            $table->string('urgency')->nullable();
            $table->string('severity')->nullable();
            
            // Metadata
            $table->json('raw_data')->nullable(); // Original API/RSS response
            $table->string('content_hash', 64)->index();
            
            // Processing status
            $table->string('processing_status', 20)->default('pending'); // pending, processed, skipped, failed
            $table->uuid('news_article_id')->nullable(); // Link to generated NewsArticle
            $table->uuid('event_id')->nullable(); // Link to generated Event
            $table->timestamp('processed_at')->nullable();
            
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('civic_source_id')->references('id')->on('civic_sources')->onDelete('cascade');
            $table->foreign('region_id')->references('id')->on('regions')->onDelete('cascade');
            
            // Prevent duplicates
            $table->unique(['civic_source_id', 'content_hash'], 'civic_content_unique');
        });

        // Civic Source Collection Runs (tracking)
        Schema::create('civic_collection_runs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('civic_source_id')->index();
            $table->uuid('region_id')->index();
            
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            
            $table->string('status', 20)->default('running'); // running, completed, failed
            $table->integer('items_found')->default(0);
            $table->integer('items_new')->default(0);
            $table->integer('items_updated')->default(0);
            $table->integer('items_skipped')->default(0);
            
            $table->text('error_message')->nullable();
            $table->json('metadata')->nullable();
            
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('civic_source_id')->references('id')->on('civic_sources')->onDelete('cascade');
            $table->foreign('region_id')->references('id')->on('regions')->onDelete('cascade');
        });

        // Seed the platforms
        $this->seedPlatforms();
    }

    /**
     * Seed the civic source platforms
     */
    private function seedPlatforms(): void
    {
        $platforms = [
            [
                'id' => \Illuminate\Support\Str::uuid(),
                'name' => 'civicplus',
                'display_name' => 'CivicPlus',
                'description' => 'Municipal website platform with RSS feeds for agendas, alerts, calendars, and news',
                'api_base_url' => null,
                'detection_patterns' => json_encode([
                    'url_patterns' => ['/rss.aspx', '/AgendaCenter', '/AlertCenter', '/DocumentCenter'],
                    'html_signatures' => ['civicplus', 'civicengage'],
                    'meta_tags' => ['generator' => 'CivicPlus'],
                ]),
                'default_config' => json_encode([
                    'rss_endpoint' => '/rss.aspx',
                    'feed_types' => ['agenda', 'alert', 'calendar', 'news', 'jobs'],
                    'poll_interval_minutes' => 60,
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => \Illuminate\Support\Str::uuid(),
                'name' => 'legistar',
                'display_name' => 'Granicus Legistar',
                'description' => 'Legislative management system with free public API for meetings, agendas, and votes',
                'api_base_url' => 'https://webapi.legistar.com/v1',
                'detection_patterns' => json_encode([
                    'url_patterns' => ['legistar.com'],
                    'html_signatures' => ['granicus', 'legistar', 'insite'],
                ]),
                'default_config' => json_encode([
                    'api_endpoints' => ['events', 'matters', 'bodies', 'persons'],
                    'poll_interval_minutes' => 120,
                    'max_results_per_call' => 100,
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => \Illuminate\Support\Str::uuid(),
                'name' => 'nixle',
                'display_name' => 'Nixle (Everbridge)',
                'description' => 'Public safety alert system for police, fire, and emergency notifications',
                'api_base_url' => 'https://local.nixle.com',
                'detection_patterns' => json_encode([
                    'url_patterns' => ['nixle.com', '888777'],
                    'html_signatures' => ['nixle', 'everbridge'],
                ]),
                'default_config' => json_encode([
                    'scrape_endpoint' => '/zipcode/{zipcode}/',
                    'rss_endpoint' => 'https://rss.nixle.com/pubs/feeds/latest/{agency_id}/',
                    'poll_interval_minutes' => 30,
                    'content_types' => ['alert', 'advisory', 'community'],
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('civic_source_platforms')->insert($platforms);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('civic_collection_runs');
        Schema::dropIfExists('civic_content_items');
        Schema::dropIfExists('civic_sources');
        Schema::dropIfExists('civic_source_platforms');
    }
};
