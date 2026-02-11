<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * All tables whose models use SoftDeletes.
     */
    private array $tables = [
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

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        foreach ($this->tables as $table) {
            if (Schema::hasTable($table) && !Schema::hasColumn($table, 'deleted_at')) {
                Schema::table($table, function (Blueprint $blueprint) {
                    $blueprint->softDeletes();
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        foreach ($this->tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'deleted_at')) {
                Schema::table($table, function (Blueprint $blueprint) {
                    $blueprint->dropSoftDeletes();
                });
            }
        }
    }
};
