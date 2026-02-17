<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('ad_impressions', function (Blueprint $table) {
            if (! Schema::hasColumn('ad_impressions', 'ad_campaign_id')) {
                $table->unsignedBigInteger('ad_campaign_id')->nullable()->after('id');
            }

            if (! Schema::hasColumn('ad_impressions', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->after('ad_campaign_id');
            }

            if (! Schema::hasColumn('ad_impressions', 'impression_type')) {
                $table->string('impression_type')->nullable()->after('referrer');
            }

            if (! Schema::hasColumn('ad_impressions', 'context')) {
                $table->json('context')->nullable()->after('impression_type');
            }

            if (! Schema::hasColumn('ad_impressions', 'viewed_at')) {
                $table->timestamp('viewed_at')->nullable()->after('context');
            }
        });

        // Make existing columns nullable to support intent-based impressions
        // that don't use creative/placement system
        Schema::table('ad_impressions', function (Blueprint $table) {
            $table->unsignedBigInteger('creative_id')->nullable()->change();
            $table->unsignedBigInteger('placement_id')->nullable()->change();
            $table->timestamp('impressed_at')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ad_impressions', function (Blueprint $table) {
            $columns = ['ad_campaign_id', 'user_id', 'impression_type', 'context', 'viewed_at'];

            foreach ($columns as $column) {
                if (Schema::hasColumn('ad_impressions', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
