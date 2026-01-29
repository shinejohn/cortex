<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Reader engagement tracking
        if (!Schema::hasTable('reader_engagements')) {
            Schema::create('reader_engagements', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('user_id')->nullable(); // null for anonymous
                $table->string('session_id')->nullable(); // for anonymous tracking
                $table->uuid('region_id')->nullable();

                // Content engaged with
                $table->string('content_type'); // day_news_post, poll, event, coupon, ad
                $table->uuid('content_id');

                // Engagement type
                $table->string('engagement_type'); // view, click, scroll, share, comment, vote, redeem

                // Engagement metrics
                $table->integer('time_spent_seconds')->nullable();
                $table->integer('scroll_depth_percent')->nullable();
                $table->json('metadata')->nullable(); // additional context

                // Device/source
                $table->string('device_type')->nullable();
                $table->string('referrer_source')->nullable();

                $table->timestamp('engaged_at');
                $table->timestamps();

                $table->index(['user_id', 'engaged_at']);
                $table->index(['content_type', 'content_id']);
                $table->index(['region_id', 'engaged_at']);
                $table->index('engaged_at');
            });
        }

        // Reader preference profiles (aggregated)
        if (!Schema::hasTable('reader_profiles')) {
            Schema::create('reader_profiles', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('user_id')->unique();

                // Computed preferences
                $table->json('topic_interests')->nullable(); // {topic: score}
                $table->json('preferred_categories')->nullable();
                $table->json('preferred_content_types')->nullable();
                $table->json('preferred_reading_times')->nullable();

                // Engagement scores
                $table->integer('engagement_score')->default(0);
                $table->integer('total_articles_read')->default(0);
                $table->integer('total_events_viewed')->default(0);
                $table->integer('total_polls_voted')->default(0);
                $table->integer('total_comments')->default(0);
                $table->integer('total_shares')->default(0);

                // Poll participation
                $table->integer('poll_request_credits')->default(0); // for influencers
                $table->timestamp('last_poll_request_at')->nullable();

                // Status flags
                $table->boolean('is_influencer')->default(false);
                $table->boolean('is_expert')->default(false);
                $table->boolean('is_sponsor')->default(false);

                $table->timestamp('last_active_at')->nullable();
                $table->timestamps();

$1// FK DISABLED: $2
            });
        }

        // Privacy preferences
        if (!Schema::hasTable('reader_privacy_settings')) {
            Schema::create('reader_privacy_settings', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('user_id')->unique();

                $table->boolean('track_reading_history')->default(true);
                $table->boolean('track_search_history')->default(true);
                $table->boolean('allow_personalization')->default(true);
                $table->boolean('share_poll_votes_publicly')->default(false);
                $table->boolean('share_comments_publicly')->default(true);

                $table->timestamps();

$1// FK DISABLED: $2
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('reader_privacy_settings');
        Schema::dropIfExists('reader_profiles');
        Schema::dropIfExists('reader_engagements');
    }
};
