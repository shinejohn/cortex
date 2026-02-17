<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_moderation_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // What content is being moderated (polymorphic)
            $table->string('content_type');     // day_news_post, event, ad_campaign, announcement, coupon, classified, listing, comment, social_post
            $table->string('content_id'); // Polymorphic: uuid for Event, string for DayNewsPost id
            $table->uuid('region_id')->nullable();
            $table->uuid('user_id')->nullable(); // who created the content

            // Moderation request
            $table->string('trigger');           // on_create, on_update, on_publish, on_comment, scheduled, manual
            $table->text('content_snapshot');     // Full content at time of moderation
            $table->json('metadata')->nullable(); // Additional context (title, category, etc.)

            // Moderation result
            $table->string('status')->default('pending'); // pending, approved, rejected, needs_review, flagged
            $table->decimal('confidence_score', 5, 4)->nullable(); // 0.0000 to 1.0000
            $table->json('flags')->nullable();   // [{ type: 'spam'|'hate'|'misinformation'|'inappropriate'|'copyright'|'pii', severity: 'low'|'medium'|'high', detail: string }]
            $table->json('suggestions')->nullable(); // [{ type: 'rewrite'|'remove'|'add_disclaimer', target: string, suggestion: string }]
            $table->text('moderator_notes')->nullable();

            // Who/what moderated
            $table->string('moderator_type')->default('ai'); // ai, human, system
            $table->uuid('moderator_id')->nullable();        // user_id if human
            $table->string('ai_model')->nullable();          // model used for AI moderation

            // Resolution
            $table->string('resolution')->nullable();  // published, edited, removed, escalated
            $table->uuid('resolved_by')->nullable();
            $table->timestamp('resolved_at')->nullable();

            $table->timestamps();

            $table->index(['content_type', 'content_id']);
            $table->index(['status']);
            $table->index(['user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_moderation_logs');
    }
};
