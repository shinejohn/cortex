<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Fix ALL missing columns and soft deletes across the entire application.
     * This is a comprehensive, idempotent migration that resolves schema mismatches
     * between models and the production database.
     */
    public function up(): void
    {
        // =====================================================================
        // 1. Fix Coupons table - add columns the Model expects
        // =====================================================================
        if (Schema::hasTable('coupons')) {
            Schema::table('coupons', function (Blueprint $table) {
                if (! Schema::hasColumn('coupons', 'valid_from')) {
                    $table->date('valid_from')->nullable();
                }
                if (! Schema::hasColumn('coupons', 'valid_until')) {
                    $table->date('valid_until')->nullable();
                }
                if (! Schema::hasColumn('coupons', 'terms_conditions')) {
                    $table->text('terms_conditions')->nullable();
                }
                if (! Schema::hasColumn('coupons', 'verified_at')) {
                    $table->timestamp('verified_at')->nullable();
                }
                if (! Schema::hasColumn('coupons', 'verified_by')) {
                    $table->uuid('verified_by')->nullable();
                }
                if (! Schema::hasColumn('coupons', 'upvotes_count')) {
                    $table->integer('upvotes_count')->default(0);
                }
                if (! Schema::hasColumn('coupons', 'downvotes_count')) {
                    $table->integer('downvotes_count')->default(0);
                }
                if (! Schema::hasColumn('coupons', 'score')) {
                    $table->integer('score')->default(0);
                }
                if (! Schema::hasColumn('coupons', 'saves_count')) {
                    $table->integer('saves_count')->default(0);
                }
                if (! Schema::hasColumn('coupons', 'view_count')) {
                    $table->integer('view_count')->default(0);
                }
            });

            // Copy data from old columns to new columns if both exist
            if (Schema::hasColumn('coupons', 'start_date') && Schema::hasColumn('coupons', 'valid_from')) {
                DB::statement('UPDATE coupons SET valid_from = start_date WHERE valid_from IS NULL AND start_date IS NOT NULL');
            }
            if (Schema::hasColumn('coupons', 'end_date') && Schema::hasColumn('coupons', 'valid_until')) {
                DB::statement('UPDATE coupons SET valid_until = end_date WHERE valid_until IS NULL AND end_date IS NOT NULL');
            }
            if (Schema::hasColumn('coupons', 'terms') && Schema::hasColumn('coupons', 'terms_conditions')) {
                DB::statement('UPDATE coupons SET terms_conditions = terms WHERE terms_conditions IS NULL AND terms IS NOT NULL');
            }
            if (Schema::hasColumn('coupons', 'views_count') && Schema::hasColumn('coupons', 'view_count')) {
                DB::statement('UPDATE coupons SET view_count = views_count WHERE view_count = 0 AND views_count > 0');
            }
        }

        // =====================================================================
        // 2. Add deleted_at (soft deletes) to ALL tables that need it
        // =====================================================================
        $softDeleteTables = [
            'achievements',
            'account_managers',
            'ad_campaigns',
            'ad_creatives',
            'businesses',
            'campaigns',
            'civic_sources',
            'classifieds',
            'coupons',
            'community_leaders',
            'customers',
            'deals',
            'email_subscribers',
            'emergency_alerts',
            'municipal_partners',
            'news_sources',
            'orders',
            'organization_relationships',
            'poll_discussions',
            'polls',
            'products',
            'rss_feed_items',
            'rss_feeds',
            'sales_opportunities',
            'smb_businesses',
            'smb_crm_customers',
            'stores',
            'story_threads',
            'tenants',
        ];

        foreach ($softDeleteTables as $tableName) {
            if (Schema::hasTable($tableName) && ! Schema::hasColumn($tableName, 'deleted_at')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->softDeletes();
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('coupons')) {
            $columnsToRemove = [
                'valid_from', 'valid_until', 'terms_conditions',
                'verified_at', 'verified_by',
                'upvotes_count', 'downvotes_count', 'score',
                'saves_count', 'view_count',
            ];

            Schema::table('coupons', function (Blueprint $table) use ($columnsToRemove) {
                $existing = [];
                foreach ($columnsToRemove as $col) {
                    if (Schema::hasColumn('coupons', $col)) {
                        $existing[] = $col;
                    }
                }
                if (! empty($existing)) {
                    $table->dropColumn($existing);
                }
            });
        }

        $softDeleteTables = [
            'achievements', 'account_managers', 'ad_campaigns', 'ad_creatives',
            'businesses', 'campaigns', 'civic_sources', 'classifieds', 'coupons',
            'community_leaders', 'customers', 'deals', 'email_subscribers',
            'emergency_alerts', 'municipal_partners', 'news_sources', 'orders',
            'organization_relationships', 'poll_discussions', 'polls', 'products',
            'rss_feed_items', 'rss_feeds', 'sales_opportunities', 'smb_businesses',
            'smb_crm_customers', 'stores', 'story_threads', 'tenants',
        ];

        foreach ($softDeleteTables as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'deleted_at')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->dropSoftDeletes();
                });
            }
        }
    }
};
