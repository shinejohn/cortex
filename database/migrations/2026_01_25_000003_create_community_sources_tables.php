<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Community leaders/sources database
        if (!Schema::hasTable('community_leaders')) {
            Schema::create('community_leaders', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('region_id');

                // Basic info
                $table->string('name');
                $table->string('title')->nullable();
                $table->string('organization')->nullable();
                $table->string('email')->nullable();
                $table->string('phone')->nullable();
                $table->string('preferred_contact_method')->default('email');

                // Classification
                $table->string('category'); // government_official, law_enforcement, business_leader, organization_leader, academic_expert
                $table->json('expertise_topics')->nullable();
                $table->json('organization_affiliations')->nullable();

                // Profiling (for influencer tracking)
                $table->boolean('is_influencer')->default(false);
                $table->integer('influence_score')->default(0);
                $table->json('social_media_handles')->nullable();
                $table->integer('follower_count')->nullable();

                // Engagement history
                $table->integer('times_contacted')->default(0);
                $table->integer('times_responded')->default(0);
                $table->integer('times_quoted')->default(0);
                $table->decimal('avg_response_time_hours', 8, 2)->nullable();
                $table->timestamp('last_contacted_at')->nullable();
                $table->timestamp('last_responded_at')->nullable();

                // Editorial notes
                $table->text('notes')->nullable();
                $table->boolean('is_verified')->default(false);
                $table->boolean('is_active')->default(true);
                $table->boolean('do_not_contact')->default(false);

                $table->timestamps();
                $table->softDeletes();

$1// FK DISABLED: $2

                $table->index(['region_id', 'category']);
                $table->index(['region_id', 'is_influencer']);
                $table->index('is_active');
            });
        }

        // Quote requests sent to sources
        if (!Schema::hasTable('quote_requests')) {
            Schema::create('quote_requests', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('leader_id');
                $table->uuid('news_article_draft_id')->nullable();
                $table->uuid('requested_by')->nullable(); // user_id

                $table->string('status')->default('pending'); // pending, sent, responded, declined, expired
                $table->string('contact_method'); // email, phone, text

                $table->text('context'); // What the article is about
                $table->text('questions'); // Specific questions asked

                $table->timestamp('sent_at')->nullable();
                $table->timestamp('responded_at')->nullable();
                $table->timestamp('expires_at')->nullable();

                $table->text('response')->nullable();
                $table->boolean('approved_for_publication')->default(false);

                $table->timestamps();

$1// FK DISABLED: $2
                $table->index(['leader_id', 'status']);
                $table->index(['news_article_draft_id']);
            });
        }

        // Government meeting minutes (for quote extraction)
        if (!Schema::hasTable('government_meeting_minutes')) {
            Schema::create('government_meeting_minutes', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('region_id');

                $table->string('body_name'); // City Commission, School Board, Planning Board
                $table->date('meeting_date');
                $table->string('meeting_type')->default('regular'); // regular, special, workshop

                $table->string('source_url')->nullable();
                $table->text('raw_content')->nullable();
                $table->json('extracted_quotes')->nullable();
                $table->json('extracted_votes')->nullable();
                $table->json('agenda_items')->nullable();

                $table->boolean('processed')->default(false);
                $table->timestamp('processed_at')->nullable();

                $table->timestamps();

$1// FK DISABLED: $2
                $table->index(['region_id', 'meeting_date']);
                $table->index(['body_name', 'meeting_date']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('government_meeting_minutes');
        Schema::dropIfExists('quote_requests');
        Schema::dropIfExists('community_leaders');
    }
};
