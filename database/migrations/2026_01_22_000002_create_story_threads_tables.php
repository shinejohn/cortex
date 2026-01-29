<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Story Threads - Groups related articles into ongoing stories
        Schema::create('story_threads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('region_id')->index();

            // Thread identification
            $table->string('title');                              // "Lifeguard Missing After Rescue"
            $table->string('slug')->unique();                     // URL-friendly identifier
            $table->text('summary')->nullable();                  // AI-generated thread summary

            // Classification
            $table->string('category');                           // crime, accident, politics, etc.
            $table->string('subcategory')->nullable();            // murder, trial, election, etc.
            $table->json('tags')->nullable();                     // ['court-case', 'missing-person']

            // Priority & Status
            $table->enum('priority', ['critical', 'high', 'medium', 'low'])->default('medium');
            $table->enum('status', [
                'developing',      // Active, expecting updates
                'monitoring',      // Watching for developments
                'resolved',        // Story concluded
                'dormant',         // No recent activity
                'archived'         // Old, no longer tracking
            ])->default('developing');

            // Resolution tracking
            $table->boolean('is_resolved')->default(false);
            $table->string('resolution_type')->nullable();        // 'natural', 'verdict', 'abandoned', etc.
            $table->text('resolution_summary')->nullable();
            $table->timestamp('resolved_at')->nullable();

            // Key entities (for monitoring)
            $table->json('key_people')->nullable();               // [{name, role, status}]
            $table->json('key_organizations')->nullable();        // [{name, type}]
            $table->json('key_locations')->nullable();            // [{name, type}]
            $table->json('key_dates')->nullable();                // [{date, event, importance}]

            // Predicted story arc
            $table->json('predicted_beats')->nullable();          // AI-predicted next developments
            $table->json('monitoring_keywords')->nullable();      // Keywords to search for updates

            // Engagement aggregates
            $table->integer('total_articles')->default(0);
            $table->integer('total_views')->default(0);
            $table->integer('total_comments')->default(0);
            $table->integer('total_shares')->default(0);
            $table->decimal('avg_engagement_score', 8, 2)->default(0);

            // Timing
            $table->timestamp('first_article_at')->nullable();
            $table->timestamp('last_article_at')->nullable();
            $table->timestamp('last_development_at')->nullable();
            $table->timestamp('next_check_at')->nullable();       // When to check for updates

            $table->timestamps();
            $table->softDeletes();

// FK DISABLED
            $table->index(['status', 'priority']);
            $table->index(['category', 'status']);
            $table->index('next_check_at');
        });

        // Link articles to story threads
        Schema::create('story_thread_articles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('story_thread_id');
            // Changed from UUID news_article_id to Integer day_news_post_id
            $table->foreignId('day_news_post_id');

            // Position in narrative
            $table->integer('sequence_number')->default(1);       // Order in the story
            $table->string('narrative_role');                     // 'origin', 'development', 'update', 'resolution'
            $table->text('contribution_summary')->nullable();     // What this article adds

            // Engagement at time of linking
            $table->integer('views_at_link')->default(0);
            $table->integer('comments_at_link')->default(0);
            $table->decimal('engagement_score', 8, 2)->default(0);

            $table->timestamps();

// FK DISABLED
// FK DISABLED
            $table->unique(['story_thread_id', 'day_news_post_id']);
            $table->index('narrative_role');
        });

        // Follow-up triggers - conditions that should generate new articles
        Schema::create('story_follow_up_triggers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('story_thread_id');

            // Trigger type
            $table->enum('trigger_type', [
                'time_based',           // Check back in X days
                'engagement_threshold', // When engagement exceeds X
                'date_event',           // Specific date (court date, anniversary)
                'external_update',      // News source mentions keywords
                'resolution_check',     // Check if story resolved
                'scheduled_search',     // Periodic search for updates
            ]);

            // Trigger conditions (JSON for flexibility)
            $table->json('conditions');

            // Status
            $table->enum('status', [
                'pending',      // Waiting to fire
                'triggered',    // Condition met, action needed
                'completed',    // Action taken
                'expired',      // No longer relevant
                'cancelled',    // Manually cancelled
            ])->default('pending');

            // Scheduling
            $table->timestamp('check_at')->nullable();            // When to evaluate
            $table->timestamp('expires_at')->nullable();          // Stop checking after
            $table->integer('check_count')->default(0);           // Times checked
            $table->integer('max_checks')->nullable();            // Max times to check

            // Results
            $table->timestamp('triggered_at')->nullable();
            $table->text('trigger_reason')->nullable();           // Why it triggered
            $table->json('trigger_data')->nullable();             // Data that caused trigger

            // Action taken
            $table->uuid('resulting_article_id')->nullable();     // Article created from trigger
            $table->text('action_taken')->nullable();

            $table->timestamps();

// FK DISABLED
            $table->index(['status', 'check_at']);
            $table->index('trigger_type');
        });

        // Story beats - predicted/actual developments in a story
        Schema::create('story_beats', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('story_thread_id');

            // Beat details
            $table->string('title');                              // "Arrest Made"
            $table->text('description')->nullable();              // What this beat involves
            $table->integer('sequence')->default(0);              // Order in predicted arc

            // Status
            $table->enum('status', [
                'predicted',    // AI predicted this might happen
                'expected',     // Confirmed upcoming (e.g., scheduled court date)
                'occurred',     // Has happened
                'skipped',      // Didn't happen / no longer relevant
            ])->default('predicted');

            // Timing
            $table->date('predicted_date')->nullable();           // When AI thinks it might happen
            $table->date('expected_date')->nullable();            // Confirmed date
            $table->timestamp('occurred_at')->nullable();         // When it actually happened

            // Confidence
            $table->decimal('likelihood', 5, 2)->nullable();      // 0-100% chance of occurring
            $table->string('source')->nullable();                 // How we know about this

            // Linked article
            $table->foreignId('day_news_post_id')->nullable();          // Article covering this beat

            $table->timestamps();

// FK DISABLED
// FK DISABLED
            $table->index(['story_thread_id', 'status']);
        });

        // Engagement thresholds by category (what counts as "high engagement")
        Schema::create('engagement_thresholds', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('region_id');

            $table->string('category');
            $table->string('subcategory')->nullable();

            // Thresholds (articles exceeding these trigger follow-up consideration)
            $table->integer('views_threshold')->default(500);
            $table->integer('comments_threshold')->default(20);
            $table->integer('shares_threshold')->default(50);
            $table->decimal('engagement_score_threshold', 8, 2)->default(75);

            // Calculated from recent data
            $table->decimal('avg_views', 10, 2)->default(0);
            $table->decimal('avg_comments', 10, 2)->default(0);
            $table->decimal('std_dev_views', 10, 2)->default(0);

            $table->timestamp('calculated_at')->nullable();
            $table->timestamps();

// FK DISABLED
            $table->unique(['region_id', 'category', 'subcategory']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('engagement_thresholds');
        Schema::dropIfExists('story_beats');
        Schema::dropIfExists('story_follow_up_triggers');
        Schema::dropIfExists('story_thread_articles');
        Schema::dropIfExists('story_threads');
    }
};
