<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Phase 1: Data Structure Improvements
 * 
 * This migration is SAFE to run:
 * - Adding indexes does NOT modify data, only improves query performance
 * - Adding columns does NOT affect existing data (all nullable with defaults)
 * 
 * Estimated run time: 1-5 minutes depending on table sizes
 * 
 * What this fixes:
 * - 90 foreign key columns without indexes (performance)
 * - Missing engagement tracking on day_news_posts (feature readiness)
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // =====================================================================
        // PART 1: Add Engagement Columns to day_news_posts
        // =====================================================================
        
        Schema::table('day_news_posts', function (Blueprint $table) {
            $table->unsignedInteger('likes_count')->default(0)->after('view_count');
            $table->unsignedInteger('shares_count')->default(0)->after('likes_count');
            $table->unsignedInteger('comments_count')->default(0)->after('shares_count');
            $table->decimal('engagement_score', 8, 2)->nullable()->after('comments_count');
            $table->timestamp('engagement_calculated_at')->nullable()->after('engagement_score');
            
            // Index for querying high-engagement posts
            $table->index('engagement_score');
        });

        // =====================================================================
        // PART 2: Add Missing Indexes to Foreign Key Columns
        // Organized by domain for clarity
        // =====================================================================

        // --- Advertising Domain ---
        $this->addIndexSafely('ad_clicks', 'impression_id');
        $this->addIndexSafely('ad_impressions', 'session_id');

        // --- Business Domain ---
        $this->addIndexSafely('business_mentions', 'community_id');
        $this->addIndexSafely('business_mentions', 'raw_content_id');
        $this->addIndexSafely('business_subscriptions', 'stripe_subscription_id');
        $this->addIndexSafely('business_subscriptions', 'stripe_customer_id');
        $this->addIndexSafely('business_subscriptions', 'claimed_by_id');
        $this->addIndexSafely('business_templates', 'industry_id');
        $this->addIndexSafely('businesses', 'provider_id');
        $this->addIndexSafely('businesses', 'type_id');

        // --- Content & Publishing Domain ---
        $this->addIndexSafely('announcements', 'workspace_id');
        $this->addIndexSafely('classifieds', 'workspace_id');
        $this->addIndexSafely('coupons', 'user_id');
        $this->addIndexSafely('creator_profiles', 'user_id');
        $this->addIndexSafely('day_news_posts', 'author_id');
        $this->addIndexSafely('day_news_posts', 'writer_agent_id');
        $this->addIndexSafely('legal_notices', 'user_id');
        $this->addIndexSafely('legal_notices', 'workspace_id');
        $this->addIndexSafely('memorials', 'user_id');
        $this->addIndexSafely('memorials', 'workspace_id');
        $this->addIndexSafely('photo_albums', 'workspace_id');

        // --- News Workflow Domain ---
        $this->addIndexSafely('civic_content_items', 'external_id');
        $this->addIndexSafely('civic_content_items', 'news_article_id');
        $this->addIndexSafely('civic_content_items', 'event_id');
        $this->addIndexSafely('civic_sources', 'agency_id');
        $this->addIndexSafely('news_article_drafts', 'published_post_id');
        $this->addIndexSafely('news_article_drafts', 'raw_content_id');
        $this->addIndexSafely('news_sources', 'region_id');
        $this->addIndexSafely('news_sources', 'business_id');

        // --- Events Domain ---
        $this->addIndexSafely('bookings', 'event_id');
        $this->addIndexSafely('bookings', 'workspace_id');
        $this->addIndexSafely('bookings', 'transaction_id');
        $this->addIndexSafely('event_extraction_drafts', 'matched_venue_id');
        $this->addIndexSafely('event_extraction_drafts', 'matched_performer_id');
        $this->addIndexSafely('event_extraction_drafts', 'published_event_id');
        $this->addIndexSafely('events', 'discussion_thread_id');
        $this->addIndexSafely('events', 'workspace_id');
        $this->addIndexSafely('events', 'source_news_article_id');
        $this->addIndexSafely('performers', 'workspace_id');
        $this->addIndexSafely('venues', 'workspace_id');

        // --- Email Domain ---
        $this->addIndexSafely('email_campaigns', 'template_id');
        $this->addIndexSafely('email_sender_mappings', 'source_id');
        $this->addIndexSafely('email_sender_mappings', 'collection_method_id');
        $this->addIndexSafely('email_subscribers', 'business_id');
        $this->addIndexSafely('incoming_emails', 'message_id');
        $this->addIndexSafely('incoming_emails', 'source_id');
        $this->addIndexSafely('incoming_emails', 'collection_method_id');

        // --- Emergency & Municipal Domain ---
        $this->addIndexSafely('emergency_alerts', 'municipal_partner_id');
        $this->addIndexSafely('emergency_audit_log', 'municipal_partner_id');
        $this->addIndexSafely('emergency_deliveries', 'external_id');
        $this->addIndexSafely('emergency_subscriptions', 'stripe_subscription_id');
        $this->addIndexSafely('municipal_partners', 'primary_contact_id');

        // --- E-commerce Domain ---
        $this->addIndexSafely('cart_items', 'store_id');
        $this->addIndexSafely('order_items', 'order_id');
        $this->addIndexSafely('order_items', 'product_id');
        $this->addIndexSafely('orders', 'store_id');
        $this->addIndexSafely('orders', 'user_id');
        $this->addIndexSafely('orders', 'stripe_payment_intent_id');
        $this->addIndexSafely('orders', 'stripe_charge_id');
        $this->addIndexSafely('products', 'stripe_price_id');
        $this->addIndexSafely('products', 'stripe_product_id');
        $this->addIndexSafely('stores', 'workspace_id');

        // --- Ticketing Domain ---
        $this->addIndexSafely('promo_code_usages', 'ticket_order_id');
        $this->addIndexSafely('ticket_gifts', 'ticket_order_item_id');
        $this->addIndexSafely('ticket_gifts', 'recipient_user_id');
        $this->addIndexSafely('ticket_listings', 'ticket_order_item_id');
        $this->addIndexSafely('ticket_order_items', 'ticket_order_id');
        $this->addIndexSafely('ticket_order_items', 'ticket_plan_id');
        $this->addIndexSafely('ticket_orders', 'payment_intent_id');
        $this->addIndexSafely('ticket_transfers', 'ticket_order_item_id');
        $this->addIndexSafely('ticket_transfers', 'to_user_id');

        // --- User & Social Domain ---
        $this->addIndexSafely('calendars', 'user_id');
        $this->addIndexSafely('community_threads', 'author_id');
        $this->addIndexSafely('communities', 'workspace_id');
        $this->addIndexSafely('social_group_invitations', 'inviter_id');
        $this->addIndexSafely('users', 'current_workspace_id');

        // --- CRM & Sales Domain ---
        $this->addIndexSafely('sales_opportunities', 'business_id');
        $this->addIndexSafely('sales_opportunities', 'community_id');
        $this->addIndexSafely('sales_opportunities', 'trigger_content_id');
        $this->addIndexSafely('smb_businesses', 'place_id');

        // --- Raw Content & Processing Domain ---
        $this->addIndexSafely('raw_content', 'source_id');
        $this->addIndexSafely('raw_content', 'collection_method_id');
        $this->addIndexSafely('raw_content', 'region_id');

        // --- Other ---
        $this->addIndexSafely('alphasite_fourcalls_integrations', 'coordinator_id');
        $this->addIndexSafely('classified_payments', 'stripe_payment_intent_id');
        $this->addIndexSafely('industries', 'parent_id');
        $this->addIndexSafely('industries', 'default_template_id');
        $this->addIndexSafely('notification_log', 'sns_message_id');
        $this->addIndexSafely('notification_subscriptions', 'business_id');
        $this->addIndexSafely('ratings', 'booking_id');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove engagement columns
        Schema::table('day_news_posts', function (Blueprint $table) {
            $table->dropIndex(['engagement_score']);
            $table->dropColumn([
                'likes_count',
                'shares_count',
                'comments_count',
                'engagement_score',
                'engagement_calculated_at',
            ]);
        });

        // Remove indexes (in reverse order)
        $this->dropIndexSafely('ratings', 'booking_id');
        $this->dropIndexSafely('notification_subscriptions', 'business_id');
        $this->dropIndexSafely('notification_log', 'sns_message_id');
        $this->dropIndexSafely('industries', 'default_template_id');
        $this->dropIndexSafely('industries', 'parent_id');
        $this->dropIndexSafely('classified_payments', 'stripe_payment_intent_id');
        $this->dropIndexSafely('alphasite_fourcalls_integrations', 'coordinator_id');
        $this->dropIndexSafely('raw_content', 'region_id');
        $this->dropIndexSafely('raw_content', 'collection_method_id');
        $this->dropIndexSafely('raw_content', 'source_id');
        $this->dropIndexSafely('smb_businesses', 'place_id');
        $this->dropIndexSafely('sales_opportunities', 'trigger_content_id');
        $this->dropIndexSafely('sales_opportunities', 'community_id');
        $this->dropIndexSafely('sales_opportunities', 'business_id');
        $this->dropIndexSafely('users', 'current_workspace_id');
        $this->dropIndexSafely('social_group_invitations', 'inviter_id');
        $this->dropIndexSafely('communities', 'workspace_id');
        $this->dropIndexSafely('community_threads', 'author_id');
        $this->dropIndexSafely('calendars', 'user_id');
        $this->dropIndexSafely('ticket_transfers', 'to_user_id');
        $this->dropIndexSafely('ticket_transfers', 'ticket_order_item_id');
        $this->dropIndexSafely('ticket_orders', 'payment_intent_id');
        $this->dropIndexSafely('ticket_order_items', 'ticket_plan_id');
        $this->dropIndexSafely('ticket_order_items', 'ticket_order_id');
        $this->dropIndexSafely('ticket_listings', 'ticket_order_item_id');
        $this->dropIndexSafely('ticket_gifts', 'recipient_user_id');
        $this->dropIndexSafely('ticket_gifts', 'ticket_order_item_id');
        $this->dropIndexSafely('promo_code_usages', 'ticket_order_id');
        $this->dropIndexSafely('stores', 'workspace_id');
        $this->dropIndexSafely('products', 'stripe_product_id');
        $this->dropIndexSafely('products', 'stripe_price_id');
        $this->dropIndexSafely('orders', 'stripe_charge_id');
        $this->dropIndexSafely('orders', 'stripe_payment_intent_id');
        $this->dropIndexSafely('orders', 'user_id');
        $this->dropIndexSafely('orders', 'store_id');
        $this->dropIndexSafely('order_items', 'product_id');
        $this->dropIndexSafely('order_items', 'order_id');
        $this->dropIndexSafely('cart_items', 'store_id');
        $this->dropIndexSafely('municipal_partners', 'primary_contact_id');
        $this->dropIndexSafely('emergency_subscriptions', 'stripe_subscription_id');
        $this->dropIndexSafely('emergency_deliveries', 'external_id');
        $this->dropIndexSafely('emergency_audit_log', 'municipal_partner_id');
        $this->dropIndexSafely('emergency_alerts', 'municipal_partner_id');
        $this->dropIndexSafely('incoming_emails', 'collection_method_id');
        $this->dropIndexSafely('incoming_emails', 'source_id');
        $this->dropIndexSafely('incoming_emails', 'message_id');
        $this->dropIndexSafely('email_subscribers', 'business_id');
        $this->dropIndexSafely('email_sender_mappings', 'collection_method_id');
        $this->dropIndexSafely('email_sender_mappings', 'source_id');
        $this->dropIndexSafely('email_campaigns', 'template_id');
        $this->dropIndexSafely('venues', 'workspace_id');
        $this->dropIndexSafely('performers', 'workspace_id');
        $this->dropIndexSafely('events', 'source_news_article_id');
        $this->dropIndexSafely('events', 'workspace_id');
        $this->dropIndexSafely('events', 'discussion_thread_id');
        $this->dropIndexSafely('event_extraction_drafts', 'published_event_id');
        $this->dropIndexSafely('event_extraction_drafts', 'matched_performer_id');
        $this->dropIndexSafely('event_extraction_drafts', 'matched_venue_id');
        $this->dropIndexSafely('bookings', 'transaction_id');
        $this->dropIndexSafely('bookings', 'workspace_id');
        $this->dropIndexSafely('bookings', 'event_id');
        $this->dropIndexSafely('news_sources', 'business_id');
        $this->dropIndexSafely('news_sources', 'region_id');
        $this->dropIndexSafely('news_article_drafts', 'raw_content_id');
        $this->dropIndexSafely('news_article_drafts', 'published_post_id');
        $this->dropIndexSafely('civic_sources', 'agency_id');
        $this->dropIndexSafely('civic_content_items', 'event_id');
        $this->dropIndexSafely('civic_content_items', 'news_article_id');
        $this->dropIndexSafely('civic_content_items', 'external_id');
        $this->dropIndexSafely('photo_albums', 'workspace_id');
        $this->dropIndexSafely('memorials', 'workspace_id');
        $this->dropIndexSafely('memorials', 'user_id');
        $this->dropIndexSafely('legal_notices', 'workspace_id');
        $this->dropIndexSafely('legal_notices', 'user_id');
        $this->dropIndexSafely('day_news_posts', 'writer_agent_id');
        $this->dropIndexSafely('day_news_posts', 'author_id');
        $this->dropIndexSafely('creator_profiles', 'user_id');
        $this->dropIndexSafely('coupons', 'user_id');
        $this->dropIndexSafely('classifieds', 'workspace_id');
        $this->dropIndexSafely('announcements', 'workspace_id');
        $this->dropIndexSafely('businesses', 'type_id');
        $this->dropIndexSafely('businesses', 'provider_id');
        $this->dropIndexSafely('business_templates', 'industry_id');
        $this->dropIndexSafely('business_subscriptions', 'claimed_by_id');
        $this->dropIndexSafely('business_subscriptions', 'stripe_customer_id');
        $this->dropIndexSafely('business_subscriptions', 'stripe_subscription_id');
        $this->dropIndexSafely('business_mentions', 'raw_content_id');
        $this->dropIndexSafely('business_mentions', 'community_id');
        $this->dropIndexSafely('ad_impressions', 'session_id');
        $this->dropIndexSafely('ad_clicks', 'impression_id');
    }

    /**
     * Safely add an index, skipping if it already exists
     */
    private function addIndexSafely(string $table, string $column): void
    {
        $indexName = "{$table}_{$column}_index";
        
        if (!Schema::hasTable($table)) {
            return; // Skip if table doesn't exist
        }

        if (!Schema::hasColumn($table, $column)) {
            return; // Skip if column doesn't exist
        }

        // Check if index already exists
        $indexes = Schema::getIndexes($table);
        foreach ($indexes as $index) {
            if ($index['name'] === $indexName) {
                return; // Index already exists
            }
        }

        Schema::table($table, function (Blueprint $table) use ($column) {
            $table->index($column);
        });
    }

    /**
     * Safely drop an index, skipping if it doesn't exist
     */
    private function dropIndexSafely(string $table, string $column): void
    {
        $indexName = "{$table}_{$column}_index";
        
        if (!Schema::hasTable($table)) {
            return;
        }

        $indexes = Schema::getIndexes($table);
        foreach ($indexes as $index) {
            if ($index['name'] === $indexName) {
                Schema::table($table, function (Blueprint $table) use ($column) {
                    $table->dropIndex([$column]);
                });
                return;
            }
        }
    }
};
