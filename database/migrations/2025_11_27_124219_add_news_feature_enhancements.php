<?php

declare(strict_types=1);

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
        // Add storage fields to news_article_drafts
        Schema::table('news_article_drafts', function (Blueprint $table) {
            $table->string('featured_image_path')->nullable()->after('featured_image_url');
            $table->string('featured_image_disk')->nullable()->default('public')->after('featured_image_path');
        });

        // Add storage fields to day_news_posts
        Schema::table('day_news_posts', function (Blueprint $table) {
            $table->string('featured_image_path')->nullable()->after('featured_image');
            $table->string('featured_image_disk')->nullable()->default('public')->after('featured_image_path');
        });

        // Add storage fields to events
        Schema::table('events', function (Blueprint $table) {
            $table->string('image_path')->nullable()->after('image');
            $table->string('image_disk')->nullable()->default('public')->after('image_path');
        });

        // Add relevance scoring to news_articles
        Schema::table('news_articles', function (Blueprint $table) {
            $table->decimal('relevance_score', 5, 2)->nullable()->after('processed');
            $table->json('relevance_topic_tags')->nullable()->after('relevance_score');
            $table->text('relevance_rationale')->nullable()->after('relevance_topic_tags');
            $table->timestamp('scored_at')->nullable()->after('relevance_rationale');

            // Index for performance when selecting scored articles
            $table->index(['region_id', 'relevance_score', 'processed']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('news_article_drafts', function (Blueprint $table) {
            $table->dropColumn(['featured_image_path', 'featured_image_disk']);
        });

        Schema::table('day_news_posts', function (Blueprint $table) {
            $table->dropColumn(['featured_image_path', 'featured_image_disk']);
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['image_path', 'image_disk']);
        });

        Schema::table('news_articles', function (Blueprint $table) {
            $table->dropIndex(['region_id', 'relevance_score', 'processed']);
            $table->dropColumn(['relevance_score', 'relevance_topic_tags', 'relevance_rationale', 'scored_at']);
        });
    }
};
