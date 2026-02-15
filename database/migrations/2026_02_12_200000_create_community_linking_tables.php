<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Counties table
        Schema::create('counties', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('state', 2);
            $table->string('state_full')->nullable();
            $table->string('slug')->unique();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->integer('population')->nullable();

            // AI-generated SEO content
            $table->text('seo_description')->nullable();
            $table->text('ai_overview')->nullable();
            $table->timestamp('content_generated_at')->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['state', 'name']);
        });

        // 2. Cities table
        Schema::create('cities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('state', 2);
            $table->string('state_full')->nullable();
            $table->string('slug')->unique();
            $table->string('county')->nullable();
            $table->uuid('county_id')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->integer('population')->nullable();
            $table->string('timezone')->nullable();
            $table->string('zip_code', 10)->nullable();

            // AI-generated SEO content
            $table->text('seo_description')->nullable();
            $table->text('ai_overview')->nullable();
            $table->text('ai_business_climate')->nullable();
            $table->text('ai_community_highlights')->nullable();
            $table->json('ai_faqs')->nullable();

            $table->timestamp('content_generated_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('county_id')->references('id')->on('counties')->nullOnDelete();
            $table->index(['state', 'name']);
            $table->index('county_id');
            $table->index('is_active');
            $table->index(['latitude', 'longitude']);
        });

        // 3. Categories table (AlphaSite business categories, separate from classified_categories)
        Schema::create('alphasite_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('singular_name');
            $table->string('slug')->unique();
            $table->uuid('parent_id')->nullable();
            $table->string('icon')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);

            // SEO template content
            $table->text('seo_description_template')->nullable();
            $table->text('ai_industry_overview')->nullable();
            $table->json('ai_faq_templates')->nullable();
            $table->json('related_category_ids')->nullable();

            $table->timestamps();

            $table->index('is_active');
            $table->index('parent_id');
        });

        Schema::table('alphasite_categories', function (Blueprint $table) {
            $table->foreign('parent_id')->references('id')->on('alphasite_categories')->nullOnDelete();
        });

        // 4. City-Category Content table (unique AI content per city+category)
        Schema::create('city_category_content', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('city_id');
            $table->uuid('category_id');

            // AI-generated unique content
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->text('ai_intro')->nullable();
            $table->text('ai_hiring_guide')->nullable();
            $table->text('ai_local_insights')->nullable();
            $table->text('ai_cost_guide')->nullable();
            $table->json('ai_faqs')->nullable();
            $table->json('ai_tips')->nullable();

            $table->integer('business_count')->default(0);
            $table->timestamp('content_generated_at')->nullable();
            $table->timestamp('business_count_updated_at')->nullable();
            $table->timestamps();

            $table->foreign('city_id')->references('id')->on('cities')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('alphasite_categories')->onDelete('cascade');
            $table->unique(['city_id', 'category_id']);
            $table->index('city_id');
            $table->index('category_id');
        });

        // 5. Neighboring Cities table (cross-city linking)
        Schema::create('neighboring_cities', function (Blueprint $table) {
            $table->uuid('city_id');
            $table->uuid('neighbor_id');
            $table->decimal('distance_miles', 8, 2)->nullable();

            $table->primary(['city_id', 'neighbor_id']);
            $table->foreign('city_id')->references('id')->on('cities')->onDelete('cascade');
            $table->foreign('neighbor_id')->references('id')->on('cities')->onDelete('cascade');
        });

        // 6. Business Service Areas table (multi-community expansion)
        Schema::create('business_service_areas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id');

            $table->string('area_type', 20); // 'city' or 'county'
            $table->uuid('city_id')->nullable();
            $table->uuid('county_id')->nullable();

            $table->string('status', 30)->default('active');
            $table->string('plan_tier', 50);
            $table->decimal('monthly_price', 10, 2);
            $table->string('billing_cycle', 20)->default('monthly');

            $table->string('stripe_subscription_item_id')->nullable();

            $table->boolean('show_in_listings')->default(true);
            $table->boolean('show_in_search')->default(true);
            $table->integer('ad_slots_included')->default(0);

            $table->timestamp('started_at')->nullable();
            $table->timestamp('canceled_at')->nullable();
            $table->timestamp('expires_at')->nullable();

            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->onDelete('cascade');
            $table->foreign('city_id')->references('id')->on('cities')->nullOnDelete();
            $table->foreign('county_id')->references('id')->on('counties')->nullOnDelete();

            $table->unique(['business_id', 'area_type', 'city_id', 'county_id'], 'unique_service_area');
            $table->index(['city_id', 'status']);
            $table->index(['county_id', 'status']);
            $table->index(['business_id', 'status']);
        });

        // 7. Add city_id and category_id to businesses
        if (! Schema::hasColumn('businesses', 'city_id')) {
            Schema::table('businesses', function (Blueprint $table) {
                $table->uuid('city_id')->nullable()->after('industry_id');
                $table->foreign('city_id')->references('id')->on('cities')->nullOnDelete();
                $table->index('city_id');
            });
        }

        if (! Schema::hasColumn('businesses', 'category_id')) {
            Schema::table('businesses', function (Blueprint $table) {
                $table->uuid('category_id')->nullable()->after('city_id');
                $table->foreign('category_id')->references('id')->on('alphasite_categories')->nullOnDelete();
                $table->index('category_id');
            });
        }
    }

    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            if (Schema::hasColumn('businesses', 'category_id')) {
                $table->dropForeign(['category_id']);
                $table->dropColumn('category_id');
            }
            if (Schema::hasColumn('businesses', 'city_id')) {
                $table->dropForeign(['city_id']);
                $table->dropColumn('city_id');
            }
        });

        Schema::dropIfExists('business_service_areas');
        Schema::dropIfExists('neighboring_cities');
        Schema::dropIfExists('city_category_content');
        Schema::dropIfExists('alphasite_categories');
        Schema::dropIfExists('cities');
        Schema::dropIfExists('counties');
    }
};
