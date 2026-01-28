<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('announcement_region')) {
            Schema::create('announcement_region', function (Blueprint $table) {
                $table->id('id');
                $table->string('announcement_id');
                $table->string('region_id');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('article_comment_likes')) {
            Schema::create('article_comment_likes', function (Blueprint $table) {
                $table->id('id');
                $table->string('comment_id');
                $table->string('user_id');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('business_region')) {
            Schema::create('business_region', function (Blueprint $table) {
                $table->id('id');
                $table->string('business_id');
                $table->string('region_id');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('business_survey_responses')) {
            Schema::create('business_survey_responses', function (Blueprint $table) {
                $table->id('id');
                $table->string('survey_id');
                $table->string('business_id');
                $table->string('customer_id')->nullable();
                $table->text('responses');
                $table->string('overall_score')->nullable();
                $table->string('sentiment')->nullable();
                $table->text('ai_summary')->nullable();
                $table->text('action_items')->nullable();
                $table->date('completed_at')->useCurrent();
                $table->string('source')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('cache_locks')) {
            Schema::create('cache_locks', function (Blueprint $table) {
                $table->string('key');
                $table->string('owner');
                $table->integer('expiration');
            });
        }

        if (!Schema::hasTable('calendar_events')) {
            Schema::create('calendar_events', function (Blueprint $table) {
                $table->id('id');
                $table->string('calendar_id');
                $table->string('event_id');
                $table->string('added_by')->nullable();
                $table->integer('position')->default('0');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('calendar_followers')) {
            Schema::create('calendar_followers', function (Blueprint $table) {
                $table->id('id');
                $table->string('calendar_id');
                $table->string('user_id');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('calendar_roles')) {
            Schema::create('calendar_roles', function (Blueprint $table) {
                $table->id('id');
                $table->string('calendar_id');
                $table->string('user_id');
                $table->string('role')->default('editor');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('cart_items')) {
            Schema::create('cart_items', function (Blueprint $table) {
                $table->id('id');
                $table->string('cart_id');
                $table->string('product_id');
                $table->string('store_id');
                $table->integer('quantity')->default('1');
                $table->string('price');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('civic_collection_runs')) {
            Schema::create('civic_collection_runs', function (Blueprint $table) {
                $table->id('id');
                $table->string('civic_source_id');
                $table->string('region_id');
                $table->date('started_at');
                $table->date('completed_at')->nullable();
                $table->string('status')->default('running');
                $table->integer('items_found')->default('0');
                $table->integer('items_new')->default('0');
                $table->integer('items_updated')->default('0');
                $table->integer('items_skipped')->default('0');
                $table->text('error_message')->nullable();
                $table->text('metadata')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('civic_content_items')) {
            Schema::create('civic_content_items', function (Blueprint $table) {
                $table->id('id');
                $table->string('civic_source_id');
                $table->string('region_id');
                $table->string('content_type');
                $table->string('external_id')->nullable();
                $table->string('title');
                $table->text('description')->nullable();
                $table->text('full_content')->nullable();
                $table->string('url')->nullable();
                $table->date('published_at')->nullable();
                $table->date('event_date')->nullable();
                $table->date('expires_at')->nullable();
                $table->string('category')->nullable();
                $table->string('subcategory')->nullable();
                $table->text('tags')->nullable();
                $table->string('body_name')->nullable();
                $table->string('meeting_type')->nullable();
                $table->text('agenda_items')->nullable();
                $table->text('attachments')->nullable();
                $table->string('alert_type')->nullable();
                $table->string('urgency')->nullable();
                $table->string('severity')->nullable();
                $table->text('raw_data')->nullable();
                $table->string('content_hash');
                $table->string('processing_status')->default('pending');
                $table->string('news_article_id')->nullable();
                $table->string('event_id')->nullable();
                $table->date('processed_at')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('civic_sources')) {
            Schema::create('civic_sources', function (Blueprint $table) {
                $table->id('id');
                $table->string('region_id');
                $table->string('platform_id');
                $table->string('name');
                $table->string('source_type');
                $table->string('entity_type')->nullable();
                $table->string('base_url')->nullable();
                $table->string('api_endpoint')->nullable();
                $table->string('api_client_name')->nullable();
                $table->string('rss_feed_url')->nullable();
                $table->string('agency_id')->nullable();
                $table->string('zip_codes')->nullable();
                $table->string('county')->nullable();
                $table->string('state')->nullable();
                $table->text('config')->nullable();
                $table->text('available_feeds')->nullable();
                $table->integer('poll_interval_minutes')->default('60');
                $table->date('last_collected_at')->nullable();
                $table->integer('last_items_found')->default('0');
                $table->date('next_collection_at')->nullable();
                $table->integer('is_enabled')->default('1');
                $table->integer('is_verified')->default('0');
                $table->integer('consecutive_failures')->default('0');
                $table->integer('health_score')->default('100');
                $table->text('last_error')->nullable();
                $table->date('last_error_at')->nullable();
                $table->integer('auto_discovered')->default('0');
                $table->date('discovered_at')->nullable();
                $table->date('verified_at')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        }

        if (!Schema::hasTable('classified_images')) {
            Schema::create('classified_images', function (Blueprint $table) {
                $table->id('id');
                $table->string('classified_id');
                $table->string('image_path');
                $table->string('image_disk')->default('public');
                $table->integer('order')->default('0');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('classified_payments')) {
            Schema::create('classified_payments', function (Blueprint $table) {
                $table->id('id');
                $table->string('classified_id');
                $table->string('workspace_id');
                $table->string('stripe_payment_intent_id')->nullable();
                $table->string('stripe_checkout_session_id')->nullable();
                $table->integer('amount');
                $table->string('currency')->default('usd');
                $table->string('status')->default('pending');
                $table->text('regions_data')->nullable();
                $table->integer('total_days')->default('7');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('classified_region')) {
            Schema::create('classified_region', function (Blueprint $table) {
                $table->id('id');
                $table->string('classified_id');
                $table->string('region_id');
                $table->integer('days')->default('7');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('community_members')) {
            Schema::create('community_members', function (Blueprint $table) {
                $table->id('id');
                $table->string('community_id');
                $table->string('user_id');
                $table->string('role')->default('member');
                $table->date('joined_at')->useCurrent();
                $table->integer('is_active')->default('1');
                $table->date('last_activity_at')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('community_thread_reply_likes')) {
            Schema::create('community_thread_reply_likes', function (Blueprint $table) {
                $table->id('id');
                $table->string('reply_id');
                $table->string('user_id');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('community_threads')) {
            Schema::create('community_threads', function (Blueprint $table) {
                $table->id('id');
                $table->string('title');
                $table->text('content');
                $table->text('preview')->nullable();
                $table->string('type');
                $table->text('tags')->nullable();
                $table->text('images')->nullable();
                $table->integer('is_pinned')->default('0');
                $table->integer('is_locked')->default('0');
                $table->integer('is_featured')->default('0');
                $table->date('last_reply_at')->nullable();
                $table->string('last_reply_by')->nullable();
                $table->string('community_id');
                $table->string('author_id');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('conversation_participants')) {
            Schema::create('conversation_participants', function (Blueprint $table) {
                $table->id('id');
                $table->string('conversation_id');
                $table->string('user_id');
                $table->date('joined_at');
                $table->date('last_read_at')->nullable();
                $table->integer('is_admin')->default('0');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('coupon_region')) {
            Schema::create('coupon_region', function (Blueprint $table) {
                $table->id('id');
                $table->string('coupon_id');
                $table->string('region_id');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('coupon_usages')) {
            Schema::create('coupon_usages', function (Blueprint $table) {
                $table->id('id');
                $table->string('coupon_id');
                $table->string('user_id')->nullable();
                $table->string('ip_address')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('day_news_post_payments')) {
            Schema::create('day_news_post_payments', function (Blueprint $table) {
                $table->id('id');
                $table->integer('post_id');
                $table->string('workspace_id');
                $table->string('stripe_payment_intent_id')->nullable();
                $table->string('stripe_checkout_session_id')->nullable();
                $table->integer('amount');
                $table->string('currency')->default('usd');
                $table->string('status')->default('pending');
                $table->string('payment_type');
                $table->integer('ad_days')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('day_news_post_region')) {
            Schema::create('day_news_post_region', function (Blueprint $table) {
                $table->id('id');
                $table->integer('day_news_post_id');
                $table->string('region_id');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('day_news_post_tag')) {
            Schema::create('day_news_post_tag', function (Blueprint $table) {
                $table->id('id');
                $table->integer('day_news_post_id');
                $table->string('tag_id');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('event_extraction_drafts')) {
            Schema::create('event_extraction_drafts', function (Blueprint $table) {
                $table->id('id');
                $table->string('news_article_id');
                $table->string('region_id');
                $table->string('status')->default('pending');
                $table->string('detection_confidence')->nullable();
                $table->string('extraction_confidence')->nullable();
                $table->string('quality_score')->nullable();
                $table->text('extracted_data')->nullable();
                $table->string('matched_venue_id')->nullable();
                $table->string('matched_performer_id')->nullable();
                $table->string('published_event_id')->nullable();
                $table->text('ai_metadata')->nullable();
                $table->text('rejection_reason')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('failed_jobs')) {
            Schema::create('failed_jobs', function (Blueprint $table) {
                $table->id('id');
                $table->string('uuid');
                $table->text('connection');
                $table->text('queue');
                $table->text('payload');
                $table->text('exception');
                $table->date('failed_at')->useCurrent();
            });
        }

        if (!Schema::hasTable('hub_analytics')) {
            Schema::create('hub_analytics', function (Blueprint $table) {
                $table->id('id');
                $table->string('hub_id');
                $table->date('date');
                $table->integer('page_views')->default('0');
                $table->integer('unique_visitors')->default('0');
                $table->integer('events_created')->default('0');
                $table->integer('events_published')->default('0');
                $table->integer('articles_created')->default('0');
                $table->integer('articles_published')->default('0');
                $table->integer('members_joined')->default('0');
                $table->integer('followers_gained')->default('0');
                $table->string('engagement_score')->default('0');
                $table->string('revenue')->default('0');
                $table->text('metadata')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('hub_members')) {
            Schema::create('hub_members', function (Blueprint $table) {
                $table->id('id');
                $table->string('hub_id');
                $table->string('user_id');
                $table->string('role')->default('member');
                $table->text('permissions')->nullable();
                $table->date('joined_at');
                $table->integer('is_active')->default('1');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('hub_roles')) {
            Schema::create('hub_roles', function (Blueprint $table) {
                $table->id('id');
                $table->string('hub_id');
                $table->string('name');
                $table->string('slug');
                $table->text('description')->nullable();
                $table->text('permissions')->nullable();
                $table->integer('is_system')->default('0');
                $table->integer('sort_order')->default('0');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('hub_sections')) {
            Schema::create('hub_sections', function (Blueprint $table) {
                $table->id('id');
                $table->string('hub_id');
                $table->string('type');
                $table->string('title');
                $table->text('description')->nullable();
                $table->text('content')->nullable();
                $table->text('settings')->nullable();
                $table->integer('is_visible')->default('1');
                $table->integer('sort_order')->default('0');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('job_batches')) {
            Schema::create('job_batches', function (Blueprint $table) {
                $table->id('id');
                $table->string('name');
                $table->integer('total_jobs');
                $table->integer('pending_jobs');
                $table->integer('failed_jobs');
                $table->text('failed_job_ids');
                $table->text('options')->nullable();
                $table->integer('cancelled_at')->nullable();
                $table->integer('finished_at')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('legal_notice_region')) {
            Schema::create('legal_notice_region', function (Blueprint $table) {
                $table->id('id');
                $table->string('legal_notice_id');
                $table->string('region_id');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('memorial_region')) {
            Schema::create('memorial_region', function (Blueprint $table) {
                $table->id('id');
                $table->string('memorial_id');
                $table->string('region_id');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('messages')) {
            Schema::create('messages', function (Blueprint $table) {
                $table->id('id');
                $table->string('conversation_id');
                $table->string('sender_id');
                $table->text('content');
                $table->string('type')->default('text');
                $table->text('metadata')->nullable();
                $table->date('edited_at')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('news_fact_checks')) {
            Schema::create('news_fact_checks', function (Blueprint $table) {
                $table->id('id');
                $table->string('draft_id');
                $table->text('claim');
                $table->text('verification_result');
                $table->string('confidence_score');
                $table->text('sources')->nullable();
                $table->text('scraped_evidence')->nullable();
                $table->text('metadata')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('news_workflow_runs')) {
            Schema::create('news_workflow_runs', function (Blueprint $table) {
                $table->id('id');
                $table->string('region_id')->nullable();
                $table->string('phase');
                $table->string('status');
                $table->date('started_at');
                $table->date('completed_at')->nullable();
                $table->integer('items_processed')->default('0');
                $table->text('summary')->nullable();
                $table->text('error_message')->nullable();
                $table->text('error_trace')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('order_items')) {
            Schema::create('order_items', function (Blueprint $table) {
                $table->id('id');
                $table->string('order_id');
                $table->string('product_id')->nullable();
                $table->string('product_name');
                $table->text('product_description')->nullable();
                $table->string('price');
                $table->integer('quantity');
                $table->string('total');
                $table->text('metadata')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('orders')) {
            Schema::create('orders', function (Blueprint $table) {
                $table->id('id');
                $table->string('order_number');
                $table->string('store_id');
                $table->string('user_id')->nullable();
                $table->string('customer_email');
                $table->string('customer_name')->nullable();
                $table->string('subtotal');
                $table->string('tax')->default('0');
                $table->string('shipping')->default('0');
                $table->string('total');
                $table->string('status')->default('pending');
                $table->string('payment_status')->default('pending');
                $table->string('stripe_payment_intent_id')->nullable();
                $table->string('stripe_charge_id')->nullable();
                $table->text('shipping_address')->nullable();
                $table->text('billing_address')->nullable();
                $table->text('notes')->nullable();
                $table->date('paid_at')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        }

        if (!Schema::hasTable('password_reset_tokens')) {
            Schema::create('password_reset_tokens', function (Blueprint $table) {
                $table->string('email');
                $table->string('token');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('photo_album_photo')) {
            Schema::create('photo_album_photo', function (Blueprint $table) {
                $table->id('id');
                $table->string('album_id');
                $table->string('photo_id');
                $table->integer('order')->default('0');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('photo_region')) {
            Schema::create('photo_region', function (Blueprint $table) {
                $table->id('id');
                $table->string('photo_id');
                $table->string('region_id');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('photos')) {
            Schema::create('photos', function (Blueprint $table) {
                $table->id('id');
                $table->string('user_id');
                $table->string('album_id')->nullable();
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('image_path');
                $table->string('image_disk')->default('public');
                $table->string('thumbnail_path')->nullable();
                $table->string('category')->nullable();
                $table->string('status')->default('pending');
                $table->integer('width')->nullable();
                $table->integer('height')->nullable();
                $table->integer('file_size')->nullable();
                $table->integer('views_count')->default('0');
                $table->integer('likes_count')->default('0');
                $table->integer('comments_count')->default('0');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('podcast_episodes')) {
            Schema::create('podcast_episodes', function (Blueprint $table) {
                $table->id('id');
                $table->string('podcast_id');
                $table->string('title');
                $table->string('slug');
                $table->text('description')->nullable();
                $table->text('show_notes')->nullable();
                $table->string('audio_file_path');
                $table->string('audio_file_disk')->default('public');
                $table->integer('duration')->nullable();
                $table->integer('file_size')->nullable();
                $table->string('episode_number')->nullable();
                $table->string('status')->default('draft');
                $table->date('published_at')->nullable();
                $table->integer('listens_count')->default('0');
                $table->integer('downloads_count')->default('0');
                $table->integer('likes_count')->default('0');
                $table->integer('comments_count')->default('0');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('podcast_region')) {
            Schema::create('podcast_region', function (Blueprint $table) {
                $table->id('id');
                $table->string('podcast_id');
                $table->string('region_id');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('podcasts')) {
            Schema::create('podcasts', function (Blueprint $table) {
                $table->id('id');
                $table->string('creator_profile_id');
                $table->string('title');
                $table->string('slug');
                $table->text('description')->nullable();
                $table->string('cover_image')->nullable();
                $table->string('category')->nullable();
                $table->string('status')->default('draft');
                $table->date('published_at')->nullable();
                $table->integer('episodes_count')->default('0');
                $table->integer('subscribers_count')->default('0');
                $table->integer('total_listens')->default('0');
                $table->integer('total_duration')->default('0');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('products')) {
            Schema::create('products', function (Blueprint $table) {
                $table->id('id');
                $table->string('store_id');
                $table->string('name');
                $table->string('slug');
                $table->text('description')->nullable();
                $table->text('images')->nullable();
                $table->string('price');
                $table->string('compare_at_price')->nullable();
                $table->integer('quantity')->default('0');
                $table->integer('track_inventory')->default('1');
                $table->string('sku')->nullable();
                $table->integer('is_active')->default('1');
                $table->integer('is_featured')->default('0');
                $table->string('stripe_price_id')->nullable();
                $table->string('stripe_product_id')->nullable();
                $table->text('metadata')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        }

        if (!Schema::hasTable('promo_code_usages')) {
            Schema::create('promo_code_usages', function (Blueprint $table) {
                $table->id('id');
                $table->string('promo_code_id');
                $table->string('user_id');
                $table->string('ticket_order_id');
                $table->string('discount_amount');
                $table->string('original_amount');
                $table->string('final_amount');
                $table->date('used_at');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('region_zipcodes')) {
            Schema::create('region_zipcodes', function (Blueprint $table) {
                $table->id('id');
                $table->string('region_id');
                $table->string('zipcode');
                $table->integer('is_primary')->default('0');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('roles')) {
            Schema::create('roles', function (Blueprint $table) {
                $table->text('name');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('rss_feed_items')) {
            Schema::create('rss_feed_items', function (Blueprint $table) {
                $table->id('id');
                $table->string('rss_feed_id');
                $table->string('guid');
                $table->string('title');
                $table->text('description')->nullable();
                $table->text('content')->nullable();
                $table->string('url')->nullable();
                $table->string('author')->nullable();
                $table->date('published_at')->nullable();
                $table->text('categories')->nullable();
                $table->text('metadata')->nullable();
                $table->integer('processed')->default('0');
                $table->date('processed_at')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        }

        if (!Schema::hasTable('rss_feeds')) {
            Schema::create('rss_feeds', function (Blueprint $table) {
                $table->id('id');
                $table->string('business_id');
                $table->string('url');
                $table->string('feed_type')->default('other');
                $table->string('title')->nullable();
                $table->text('description')->nullable();
                $table->string('status')->default('active');
                $table->string('health_status')->default('healthy');
                $table->date('last_checked_at')->nullable();
                $table->date('last_successful_fetch_at')->nullable();
                $table->text('last_error')->nullable();
                $table->integer('fetch_frequency')->default('60');
                $table->integer('total_items_count')->default('0');
                $table->text('metadata')->nullable();
                $table->integer('auto_approved')->default('1');
                $table->timestamps();
                $table->softDeletes();
            });
        }

        if (!Schema::hasTable('search_suggestions')) {
            Schema::create('search_suggestions', function (Blueprint $table) {
                $table->id('id');
                $table->string('query');
                $table->integer('popularity')->default('1');
                $table->integer('click_count')->default('0');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('sessions')) {
            Schema::create('sessions', function (Blueprint $table) {
                $table->id('id');
                $table->string('user_id')->nullable();
                $table->string('ip_address')->nullable();
                $table->text('user_agent')->nullable();
                $table->text('payload');
                $table->integer('last_activity');
            });
        }

        if (!Schema::hasTable('social_activities')) {
            Schema::create('social_activities', function (Blueprint $table) {
                $table->id('id');
                $table->string('user_id');
                $table->string('actor_id');
                $table->string('type');
                $table->string('subject_type');
                $table->string('subject_id');
                $table->text('data')->nullable();
                $table->integer('is_read')->default('0');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('social_comment_likes')) {
            Schema::create('social_comment_likes', function (Blueprint $table) {
                $table->id('id');
                $table->string('comment_id');
                $table->string('user_id');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('social_friendships')) {
            Schema::create('social_friendships', function (Blueprint $table) {
                $table->id('id');
                $table->string('user_id');
                $table->string('friend_id');
                $table->string('status')->default('pending');
                $table->date('requested_at')->useCurrent();
                $table->date('responded_at')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('social_group_invitations')) {
            Schema::create('social_group_invitations', function (Blueprint $table) {
                $table->id('id');
                $table->string('group_id');
                $table->string('inviter_id');
                $table->string('invited_id');
                $table->string('message')->nullable();
                $table->string('status')->default('pending');
                $table->date('expires_at')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('social_group_members')) {
            Schema::create('social_group_members', function (Blueprint $table) {
                $table->id('id');
                $table->string('group_id');
                $table->string('user_id');
                $table->string('role')->default('member');
                $table->string('status')->default('approved');
                $table->date('joined_at')->useCurrent();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('social_group_posts')) {
            Schema::create('social_group_posts', function (Blueprint $table) {
                $table->id('id');
                $table->string('group_id');
                $table->string('user_id');
                $table->text('content');
                $table->text('media')->nullable();
                $table->integer('is_pinned')->default('0');
                $table->integer('is_active')->default('1');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('social_groups')) {
            Schema::create('social_groups', function (Blueprint $table) {
                $table->id('id');
                $table->string('name');
                $table->text('description')->nullable();
                $table->string('cover_image')->nullable();
                $table->string('creator_id');
                $table->string('privacy')->default('public');
                $table->integer('is_active')->default('1');
                $table->text('settings')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('social_post_likes')) {
            Schema::create('social_post_likes', function (Blueprint $table) {
                $table->id('id');
                $table->string('post_id');
                $table->string('user_id');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('social_post_shares')) {
            Schema::create('social_post_shares', function (Blueprint $table) {
                $table->id('id');
                $table->string('post_id');
                $table->string('user_id');
                $table->text('message')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('social_user_follows')) {
            Schema::create('social_user_follows', function (Blueprint $table) {
                $table->id('id');
                $table->string('follower_id');
                $table->string('following_id');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('social_user_profiles')) {
            Schema::create('social_user_profiles', function (Blueprint $table) {
                $table->id('id');
                $table->string('user_id');
                $table->text('bio')->nullable();
                $table->string('website')->nullable();
                $table->string('location')->nullable();
                $table->date('birth_date')->nullable();
                $table->string('profile_visibility')->default('public');
                $table->text('interests')->nullable();
                $table->string('cover_photo')->nullable();
                $table->text('social_links')->nullable();
                $table->integer('show_email')->default('0');
                $table->integer('show_location')->default('1');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('ticket_orders')) {
            Schema::create('ticket_orders', function (Blueprint $table) {
                $table->id('id');
                $table->string('event_id');
                $table->string('user_id');
                $table->string('status')->default('pending');
                $table->string('subtotal');
                $table->string('fees')->default('0');
                $table->string('discount')->default('0');
                $table->string('total');
                $table->text('promo_code')->nullable();
                $table->text('billing_info')->nullable();
                $table->string('payment_intent_id')->nullable();
                $table->string('payment_status')->default('pending');
                $table->date('completed_at')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('workspace_memberships')) {
            Schema::create('workspace_memberships', function (Blueprint $table) {
                $table->id('id');
                $table->string('workspace_id');
                $table->string('user_id');
                $table->text('role');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('writer_agent_region')) {
            Schema::create('writer_agent_region', function (Blueprint $table) {
                $table->id('id');
                $table->string('writer_agent_id');
                $table->string('region_id');
                $table->integer('is_primary')->default('0');
                $table->timestamps();
            });
        }


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcement_region');
        Schema::dropIfExists('article_comment_likes');
        Schema::dropIfExists('business_region');
        Schema::dropIfExists('business_survey_responses');
        Schema::dropIfExists('cache_locks');
        Schema::dropIfExists('calendar_events');
        Schema::dropIfExists('calendar_followers');
        Schema::dropIfExists('calendar_roles');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('civic_collection_runs');
        Schema::dropIfExists('civic_content_items');
        Schema::dropIfExists('civic_sources');
        Schema::dropIfExists('classified_images');
        Schema::dropIfExists('classified_payments');
        Schema::dropIfExists('classified_region');
        Schema::dropIfExists('community_members');
        Schema::dropIfExists('community_thread_reply_likes');
        Schema::dropIfExists('community_threads');
        Schema::dropIfExists('conversation_participants');
        Schema::dropIfExists('coupon_region');
        Schema::dropIfExists('coupon_usages');
        Schema::dropIfExists('day_news_post_payments');
        Schema::dropIfExists('day_news_post_region');
        Schema::dropIfExists('day_news_post_tag');
        Schema::dropIfExists('event_extraction_drafts');
        Schema::dropIfExists('failed_jobs');
        Schema::dropIfExists('hub_analytics');
        Schema::dropIfExists('hub_members');
        Schema::dropIfExists('hub_roles');
        Schema::dropIfExists('hub_sections');
        Schema::dropIfExists('job_batches');
        Schema::dropIfExists('legal_notice_region');
        Schema::dropIfExists('memorial_region');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('news_fact_checks');
        Schema::dropIfExists('news_workflow_runs');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('photo_album_photo');
        Schema::dropIfExists('photo_region');
        Schema::dropIfExists('photos');
        Schema::dropIfExists('podcast_episodes');
        Schema::dropIfExists('podcast_region');
        Schema::dropIfExists('podcasts');
        Schema::dropIfExists('products');
        Schema::dropIfExists('promo_code_usages');
        Schema::dropIfExists('region_zipcodes');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('rss_feed_items');
        Schema::dropIfExists('rss_feeds');
        Schema::dropIfExists('sales_opportunities');
        Schema::dropIfExists('search_suggestions');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('social_activities');
        Schema::dropIfExists('social_comment_likes');
        Schema::dropIfExists('social_friendships');
        Schema::dropIfExists('social_group_invitations');
        Schema::dropIfExists('social_group_members');
        Schema::dropIfExists('social_group_posts');
        Schema::dropIfExists('social_groups');
        Schema::dropIfExists('social_post_likes');
        Schema::dropIfExists('social_post_shares');
        Schema::dropIfExists('social_user_follows');
        Schema::dropIfExists('social_user_profiles');
        Schema::dropIfExists('ticket_orders');
        Schema::dropIfExists('workspace_memberships');
        Schema::dropIfExists('writer_agent_region');

    }
};