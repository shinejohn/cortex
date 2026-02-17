<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_creator_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('region_id')->nullable();

            // What type of content is being created
            $table->string('content_type'); // article, event, ad, announcement, coupon, classified, legal_notice

            // Real-time AI analysis results (updated as user types)
            $table->json('seo_analysis')->nullable();        // { score, keyword_density, meta_quality, heading_structure, readability_grade }
            $table->json('quality_analysis')->nullable();     // { score, relevance, accuracy, completeness, bias_score }
            $table->json('fact_check_results')->nullable();   // [{ claim, status, confidence, sources }]
            $table->json('classification')->nullable();       // { content_type, category, subcategories, topic_tags }
            $table->json('moderation_result')->nullable();    // { status, flags, suggestions }

            // Content snapshots for AI context
            $table->text('current_title')->nullable();
            $table->text('current_content')->nullable();
            $table->json('ai_suggestions')->nullable();       // Latest AI suggestions cache

            // Session state
            $table->string('status')->default('active');       // active, submitted, published, abandoned
            $table->uuid('published_content_id')->nullable();  // FK to the final published record
            $table->string('published_content_type')->nullable(); // morph type

            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('region_id')->references('id')->on('regions');
            $table->index(['user_id', 'status']);
            $table->index(['content_type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_creator_sessions');
    }
};
