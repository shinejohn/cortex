<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('community_history_entries')) {
            Schema::create('community_history_entries', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('region_id');

                // Content reference
                $table->string('content_type'); // day_news_post, event, government_meeting, poll_result
                $table->uuid('content_id');

                // Temporal data
                $table->date('event_date');
                $table->time('event_time')->nullable();
                $table->integer('duration_minutes')->nullable();
                $table->string('recurrence_pattern')->nullable();

                // Geographic data
                $table->string('location_name')->nullable();
                $table->string('location_address')->nullable();
                $table->json('affected_zip_codes')->nullable();

                // Classification
                $table->json('topic_tags')->nullable();
                $table->json('categories')->nullable();
                $table->integer('controversy_level')->default(0); // 0-10
                $table->string('resolution_status')->nullable(); // ongoing, resolved, escalated

                // AI-generated summary for quick context
                $table->text('ai_summary')->nullable();
                $table->json('key_facts')->nullable();

                // Impact tracking
                $table->json('affected_entities')->nullable(); // businesses, people, organizations
                $table->text('ongoing_implications')->nullable();

                // Relationships
                $table->json('related_entry_ids')->nullable();
                $table->uuid('parent_story_id')->nullable(); // for follow-up stories

                // Search optimization
                $table->text('search_text')->nullable(); // Full text for searching

                $table->timestamps();

$1// FK DISABLED: $2

                $table->index(['region_id', 'event_date']);
                $table->index(['content_type', 'content_id']);
                $table->index('event_date');
            });
        }

        // People mentioned in history
        if (!Schema::hasTable('community_history_people')) {
            Schema::create('community_history_people', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('history_entry_id');
                $table->uuid('person_id')->nullable(); // link to community_leaders if exists
                $table->string('name');
                $table->string('role')->nullable(); // quoted, decision_maker, affected_party
                $table->text('quote')->nullable();
                $table->string('position_taken')->nullable(); // for/against/neutral
                $table->json('metadata')->nullable();
                $table->timestamps();

$1// FK DISABLED: $2
                $table->index(['history_entry_id']);
                $table->index(['person_id']);
            });
        }

        // Votes/decisions recorded
        if (!Schema::hasTable('community_history_votes')) {
            Schema::create('community_history_votes', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('history_entry_id');
                $table->string('vote_topic');
                $table->string('outcome'); // passed, failed, tabled, etc.
                $table->json('vote_breakdown')->nullable(); // {for: [...], against: [...], abstain: [...]}
                $table->timestamps();

$1// FK DISABLED: $2
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('community_history_votes');
        Schema::dropIfExists('community_history_people');
        Schema::dropIfExists('community_history_entries');
    }
};
