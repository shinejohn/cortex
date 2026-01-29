<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * N8N RSS Feed Integration Migration
 *
 * Creates all tables needed for N8N to manage businesses scraped from Google SERP API,
 * track their RSS feeds, and automatically generate Day News articles from feed content.
 *
 * Tables created:
 * - businesses: Stores businesses from Google SERP API
 * - business_region: Pivot table for businesses in multiple regions
 * - rss_feeds: Tracks RSS feeds for each business
 * - rss_feed_items: Individual items from RSS feeds
 *
 * Also adds RSS feed tracking fields to existing day_news_posts table.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Businesses table
        Schema::create('businesses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workspace_id')->nullable()->cascadeOnDelete();
            $table->string('google_place_id')->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('website')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('country')->default('USA');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->json('categories')->nullable();
            $table->decimal('rating', 3, 2)->nullable();
            $table->integer('reviews_count')->default(0);
            $table->json('opening_hours')->nullable();
            $table->json('images')->nullable();
            $table->json('serp_metadata')->nullable();

            // SERP API: Multiple identifier support for different Google services
            $table->string('data_id')->nullable();
            $table->string('data_cid')->nullable();
            $table->string('lsig')->nullable();
            $table->string('provider_id')->nullable();
            $table->string('local_services_cid')->nullable();
            $table->string('local_services_bid')->nullable();
            $table->string('local_services_pid')->nullable();

            // SERP API: Source and sync tracking
            $table->string('serp_source')->nullable(); // 'local', 'local_services', 'maps'
            $table->timestamp('serp_last_synced_at')->nullable();

            // SERP API: Enhanced business type classification
            $table->string('primary_type')->nullable(); // e.g., 'Electrician', 'Restaurant'
            $table->string('type_id')->nullable();
            $table->json('type_ids')->nullable(); // Multiple type IDs from Google

            // SERP API: Price level
            $table->string('price_level')->nullable(); // '$', '$$', '$$$', '$$$$'

            // SERP API: Enhanced hours information
            $table->string('open_state')->nullable(); // 'Open', 'Closed', 'Open 24 hours'
            $table->string('hours_display')->nullable(); // Human-readable hours string

            // SERP API: Local Services specific fields
            $table->string('google_badge')->nullable(); // 'GOOGLE GUARANTEED', etc.
            $table->json('service_area')->nullable(); // Array of regions served
            $table->integer('years_in_business')->nullable();
            $table->integer('bookings_nearby')->nullable();

            // SERP API: Enhanced verification status
            $table->string('verification_status')->default('unverified'); // 'unverified', 'claimed', 'verified', 'google_guaranteed'
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('claimed_at')->nullable();
            $table->boolean('is_verified')->default(false); // Keep for backward compatibility

            // SERP API: Service options (dine-in, takeout, delivery, etc.)
            $table->json('service_options')->nullable();

            // SERP API: Action URLs
            $table->string('reserve_url')->nullable();
            $table->string('order_online_url')->nullable();

            $table->string('status')->default('active');
            $table->nullableUuidMorphs('claimable');
            $table->timestamps();
            $table->softDeletes();

            $table->index('google_place_id');
            $table->index('workspace_id');
            $table->index('status');
            $table->index('is_verified');
            $table->index('verification_status');
            $table->index('primary_type');
            $table->index('serp_source');
            $table->index('data_id');
            $table->index('data_cid');
            $table->index(['latitude', 'longitude']);
        });

        // 2. Business-Region pivot table
        Schema::create('business_region', function (Blueprint $table) {
            $table->id();
            $table->uuid('business_id');
            $table->uuid('region_id');
            $table->timestamps();

            $table->unique(['business_id', 'region_id']);
        });

        // 3. RSS Feeds table
        Schema::create('rss_feeds', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id');
            $table->string('url')->index();
            $table->string('feed_type')->default('other');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->string('status')->default('active');
            $table->string('health_status')->default('healthy');
            $table->timestamp('last_checked_at')->nullable();
            $table->timestamp('last_successful_fetch_at')->nullable();
            $table->text('last_error')->nullable();
            $table->integer('fetch_frequency')->default(60);
            $table->integer('total_items_count')->default(0);
            $table->json('metadata')->nullable();
            $table->boolean('auto_approved')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('business_id');
            $table->index('status');
            $table->index('health_status');
            $table->index('feed_type');
            $table->index(['business_id', 'url']);
        });

        // 4. RSS Feed Items table
        Schema::create('rss_feed_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('rss_feed_id');
            $table->string('guid');
            $table->string('title');
            $table->text('description')->nullable();
            $table->text('content')->nullable();
            $table->string('url')->nullable();
            $table->string('author')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->json('categories')->nullable();
            $table->json('metadata')->nullable();
            $table->boolean('processed')->default(false);
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('rss_feed_id');
            $table->index('processed');
            $table->index('published_at');
            $table->unique(['rss_feed_id', 'guid']);
        });

        // 5. Add RSS feed tracking to existing day_news_posts table
        Schema::table('day_news_posts', function (Blueprint $table) {
            $table->uuid('rss_feed_id')->nullable()->after('author_id');
            $table->uuid('rss_feed_item_id')->nullable()->after('rss_feed_id');
            $table->string('source_type')->nullable()->after('rss_feed_item_id');

            $table->index('rss_feed_id');
            $table->index('rss_feed_item_id');
            $table->index('source_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove RSS feed fields from day_news_posts
        Schema::table('day_news_posts', function (Blueprint $table) {
            $table->dropForeign(['rss_feed_id']);
            $table->dropForeign(['rss_feed_item_id']);
            $table->dropIndex(['rss_feed_id']);
            $table->dropIndex(['rss_feed_item_id']);
            $table->dropIndex(['source_type']);
            $table->dropColumn(['rss_feed_id', 'rss_feed_item_id', 'source_type']);
        });

        // Drop tables in reverse order (respecting foreign key constraints)
        Schema::dropIfExists('rss_feed_items');
        Schema::dropIfExists('rss_feeds');
        Schema::dropIfExists('business_region');
        Schema::dropIfExists('businesses');
    }
};
