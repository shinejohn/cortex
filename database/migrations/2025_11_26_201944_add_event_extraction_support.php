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
        // Add source tracking to events table
        Schema::table('events', function (Blueprint $table) {
            $table->foreignUuid('source_news_article_id')
                ->nullable()
                ->after('created_by')
                ->constrained('news_articles')
                ->nullOnDelete();

            $table->string('source_type')
                ->default('manual')
                ->after('source_news_article_id');

            $table->index('source_type');
        });

        // Create event-region pivot table for many-to-many relationship
        Schema::create('event_region', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignUuid('region_id')->constrained('regions')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['event_id', 'region_id']);
        });

        // Create event extraction drafts table for AI-extracted events
        Schema::create('event_extraction_drafts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('news_article_id')->constrained('news_articles')->cascadeOnDelete();
            $table->foreignUuid('region_id')->constrained('regions')->cascadeOnDelete();

            // Status: pending -> detected -> extracted -> validated -> published/rejected
            $table->string('status')->default('pending');

            // AI confidence scores (0-100)
            $table->decimal('detection_confidence', 5, 2)->nullable();
            $table->decimal('extraction_confidence', 5, 2)->nullable();
            $table->decimal('quality_score', 5, 2)->nullable();

            // Extracted event data (JSON before creating Event)
            $table->json('extracted_data')->nullable();

            // Matched/created references
            $table->foreignUuid('matched_venue_id')->nullable()->constrained('venues')->nullOnDelete();
            $table->foreignUuid('matched_performer_id')->nullable()->constrained('performers')->nullOnDelete();
            $table->foreignUuid('published_event_id')->nullable()->constrained('events')->nullOnDelete();

            // AI metadata (model, tokens, etc.)
            $table->json('ai_metadata')->nullable();

            // Error tracking
            $table->text('rejection_reason')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index('quality_score');
            $table->index(['news_article_id', 'region_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_extraction_drafts');
        Schema::dropIfExists('event_region');

        Schema::table('events', function (Blueprint $table) {
            $table->dropForeign(['source_news_article_id']);
            $table->dropIndex(['source_type']);
            $table->dropColumn(['source_news_article_id', 'source_type']);
        });
    }
};
