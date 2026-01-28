<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Poll calendar (planned polls per community)
        if (!Schema::hasTable('poll_calendars')) {
            Schema::create('poll_calendars', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('region_id');
                $table->integer('year');
                $table->integer('week_number'); // 1-52

                $table->string('category'); // food_beverage, services, entertainment, community
                $table->string('poll_topic'); // best_burger, best_yoga, etc.
                $table->string('display_title'); // "Best Burger in Springfield"

                $table->date('scheduled_start_date');
                $table->date('scheduled_end_date');

                $table->string('status')->default('planned'); // planned, soliciting, active, completed, cancelled

                $table->timestamps();

                $table->foreign('region_id')->references('id')->on('regions')->onDelete('cascade');
                $table->unique(['region_id', 'year', 'week_number']);
                $table->index(['region_id', 'status']);
                $table->index('scheduled_start_date');
            });
        }

        // Main polls table
        if (!Schema::hasTable('polls')) {
            Schema::create('polls', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('region_id');
                $table->uuid('calendar_entry_id')->nullable(); // link to planned poll
                $table->uuid('created_by')->nullable(); // user who created (for reader-requested)

                // Poll identification
                $table->string('slug')->unique();
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('featured_image_url')->nullable();

                // Poll type
                $table->string('poll_type'); // weekly_smb_promotional, rapid_issue, reader_requested

                // For SMB polls
                $table->string('category')->nullable(); // food_beverage, services, etc.
                $table->string('topic')->nullable(); // best_burger, best_yoga, etc.

                // Timing
                $table->timestamp('voting_starts_at');
                $table->timestamp('voting_ends_at');
                $table->boolean('is_active')->default(false);

                // Settings
                $table->boolean('allow_write_ins')->default(false);
                $table->boolean('show_results_during_voting')->default(false);
                $table->boolean('require_login_to_vote')->default(false);
                $table->integer('max_votes_per_user')->default(1);

                // Results
                $table->integer('total_votes')->default(0);
                $table->integer('total_participants')->default(0);
                $table->uuid('winner_option_id')->nullable();

                // Publishing
                $table->uuid('results_article_id')->nullable(); // day_news_post with results
                $table->timestamp('results_published_at')->nullable();

                // SEO
                $table->json('seo_metadata')->nullable();

                $table->timestamps();
                $table->softDeletes();

                $table->foreign('region_id')->references('id')->on('regions')->onDelete('cascade');

                $table->index(['region_id', 'poll_type', 'is_active']);
                $table->index(['region_id', 'voting_starts_at']);
                $table->index('slug');
                $table->index('is_active');
            });
        }

        // Poll options (businesses or choices)
        if (!Schema::hasTable('poll_options')) {
            Schema::create('poll_options', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('poll_id');
                $table->uuid('business_id')->nullable(); // for SMB polls

                $table->string('name');
                $table->text('description')->nullable();
                $table->string('image_url')->nullable();
                $table->string('website_url')->nullable();

                // For SMB promotional tiers
                $table->string('participation_tier')->nullable(); // basic, featured, premium_sponsor
                $table->boolean('is_sponsored')->default(false);
                $table->decimal('sponsorship_amount', 10, 2)->nullable();

                // Special offer from business
                $table->text('special_offer')->nullable();

                // Vote tracking
                $table->integer('vote_count')->default(0);
                $table->integer('rank')->nullable(); // set after poll ends

                // Display order (sponsored first)
                $table->integer('display_order')->default(0);

                $table->timestamps();

                $table->foreign('poll_id')->references('id')->on('polls')->onDelete('cascade');
                $table->foreign('business_id')->references('id')->on('businesses')->onDelete('set null');

                $table->index(['poll_id', 'vote_count']);
                $table->index(['poll_id', 'display_order']);
            });
        }

        // Individual votes
        if (!Schema::hasTable('poll_votes')) {
            Schema::create('poll_votes', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('poll_id');
                $table->uuid('option_id');
                $table->uuid('user_id')->nullable();
                $table->string('voter_ip')->nullable(); // for anonymous vote limiting
                $table->string('voter_fingerprint')->nullable(); // browser fingerprint

                $table->timestamp('voted_at');
                $table->timestamps();

                $table->foreign('poll_id')->references('id')->on('polls')->onDelete('cascade');
                $table->foreign('option_id')->references('id')->on('poll_options')->onDelete('cascade');

                $table->index(['poll_id', 'user_id']);
                $table->index(['poll_id', 'voter_ip']);
                $table->index(['option_id']);
            });
        }

        // SMB poll participation requests (advertising orders)
        if (!Schema::hasTable('poll_participation_requests')) {
            Schema::create('poll_participation_requests', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('poll_id')->nullable(); // null during solicitation phase
                $table->uuid('calendar_entry_id')->nullable();
                $table->uuid('business_id');
                $table->uuid('requested_by')->nullable(); // user_id

                $table->string('status')->default('pending'); // pending, approved, rejected, paid
                $table->string('tier')->default('basic'); // basic, featured, premium_sponsor
                $table->decimal('price', 10, 2)->nullable();

                // Assets submitted
                $table->string('submitted_image_url')->nullable();
                $table->text('submitted_description')->nullable();
                $table->text('submitted_special_offer')->nullable();

                // Payment
                $table->uuid('payment_id')->nullable();
                $table->timestamp('paid_at')->nullable();

                $table->timestamps();

                $table->foreign('business_id')->references('id')->on('businesses')->onDelete('cascade');
                $table->index(['calendar_entry_id', 'status']);
                $table->index(['business_id', 'status']);
            });
        }

        // Reader poll requests (for influencers/experts/sponsors)
        if (!Schema::hasTable('reader_poll_requests')) {
            Schema::create('reader_poll_requests', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('user_id');
                $table->uuid('region_id');

                $table->string('status')->default('pending'); // pending, approved, rejected, published
                $table->string('requester_type'); // influencer, expert, sponsor

                $table->string('proposed_question');
                $table->json('proposed_options')->nullable();
                $table->text('justification')->nullable(); // why this poll matters

                // Editorial review
                $table->uuid('reviewed_by')->nullable();
                $table->timestamp('reviewed_at')->nullable();
                $table->text('review_notes')->nullable();

                // If approved, link to created poll
                $table->uuid('poll_id')->nullable();

                $table->timestamps();

                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                $table->foreign('region_id')->references('id')->on('regions')->onDelete('cascade');

                $table->index(['user_id', 'status']);
                $table->index(['region_id', 'status']);
            });
        }

        // Poll winner badges (displayed on business profiles)
        if (!Schema::hasTable('poll_winner_badges')) {
            Schema::create('poll_winner_badges', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('poll_id');
                $table->uuid('business_id');
                $table->uuid('option_id');

                $table->integer('rank'); // 1st, 2nd, 3rd
                $table->integer('year');
                $table->string('badge_title'); // "Best Burger 2025"
                $table->string('badge_image_url')->nullable();

                $table->boolean('is_displayed')->default(true);
                $table->timestamp('expires_at')->nullable(); // badges last 1 year

                $table->timestamps();

                $table->foreign('poll_id')->references('id')->on('polls')->onDelete('cascade');
                $table->foreign('business_id')->references('id')->on('businesses')->onDelete('cascade');

                $table->index(['business_id', 'is_displayed']);
                $table->index(['business_id', 'year']);
            });
        }

        // Poll discussion threads (for reader-requested polls)
        if (!Schema::hasTable('poll_discussions')) {
            Schema::create('poll_discussions', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('poll_id');
                $table->uuid('user_id');
                $table->uuid('parent_id')->nullable(); // for replies

                $table->text('content');
                $table->integer('likes_count')->default(0);

                $table->boolean('is_flagged')->default(false);
                $table->boolean('is_hidden')->default(false);

                $table->timestamps();
                $table->softDeletes();

                $table->foreign('poll_id')->references('id')->on('polls')->onDelete('cascade');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

                $table->index(['poll_id', 'created_at']);
                $table->index(['parent_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('poll_discussions');
        Schema::dropIfExists('poll_winner_badges');
        Schema::dropIfExists('reader_poll_requests');
        Schema::dropIfExists('poll_participation_requests');
        Schema::dropIfExists('poll_votes');
        Schema::dropIfExists('poll_options');
        Schema::dropIfExists('polls');
        Schema::dropIfExists('poll_calendars');
    }
};
