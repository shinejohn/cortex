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
        // Table 1: Raw news articles from SERP API
        Schema::create('news_articles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('region_id')->index();
            $table->uuid('business_id')->nullable()->index();
            $table->string('source_type'); // 'business' or 'category'
            $table->string('source_name');
            $table->text('title');
            $table->text('url')->unique();
            $table->text('content_snippet')->nullable();
            $table->text('full_content')->nullable();
            $table->string('source_publisher')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->json('metadata')->nullable(); // Raw SERP data
            $table->string('content_hash')->index(); // Deduplication
            $table->boolean('processed')->default(false)->index();
            $table->uuid('writer_agent_id')->nullable()->index();
            $table->timestamps();

            // FK DISABLED
            // FK DISABLED
        });

        // Table 2: AI-generated article drafts tracking workflow progress
        Schema::create('news_article_drafts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('news_article_id')->index();
            $table->uuid('region_id')->index();
            $table->string('status'); // shortlisted, outline_generated, ready_for_generation, ready_for_publishing, published, rejected
            $table->decimal('relevance_score', 5, 2)->nullable(); // Phase 3 AI scoring (0-100)
            $table->decimal('quality_score', 5, 2)->nullable(); // Phase 5 AI scoring (0-100)
            $table->decimal('fact_check_confidence', 5, 2)->nullable(); // Phase 4 average confidence (0-100) - STORED FOR UI
            $table->json('topic_tags')->nullable(); // Topic diversity tracking
            $table->text('outline')->nullable(); // Phase 4 generated outline
            $table->text('generated_title')->nullable(); // Phase 6
            $table->text('generated_content')->nullable(); // Phase 6
            $table->text('generated_excerpt')->nullable(); // Phase 6
            $table->json('seo_metadata')->nullable(); // title, description, keywords
            $table->string('featured_image_url')->nullable();
            $table->json('ai_metadata')->nullable(); // Model used, tokens, etc.
            $table->unsignedBigInteger('published_post_id')->nullable(); // Links to day_news_posts
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            // FK DISABLED
            // FK DISABLED
            // FK DISABLED

            $table->index('status');
            $table->index('quality_score'); // For hybrid auto-publish filtering
        });

        // Table 3: Fact-checking verification results per claim
        Schema::create('news_fact_checks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('draft_id')->index();
            $table->text('claim'); // Extracted claim to verify
            $table->text('verification_result'); // verified, unverified, contradicted
            $table->decimal('confidence_score', 5, 2); // 0-100
            $table->json('sources')->nullable(); // Array of URLs used for verification
            $table->text('scraped_evidence')->nullable(); // Evidence from ScrapingBee
            $table->json('metadata')->nullable();
            $table->timestamps();

            // FK DISABLED
        });

        // Table 4: Workflow execution tracking for observability
        Schema::create('news_workflow_runs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('region_id')->nullable()->index();
            $table->uuid('writer_agent_id')->nullable()->index();
            $table->string('phase'); // business_discovery, news_collection, etc.
            $table->string('status'); // running, completed, failed
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->integer('items_processed')->default(0);
            $table->json('summary')->nullable(); // Stats, counts, etc.
            $table->text('error_message')->nullable();
            $table->json('error_trace')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('news_fact_checks');
        Schema::dropIfExists('news_article_drafts');
        Schema::dropIfExists('news_articles');
        Schema::dropIfExists('news_workflow_runs');
    }
};
