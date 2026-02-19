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
        Schema::table('smb_businesses', function (Blueprint $table) {
            if (! Schema::hasColumn('smb_businesses', 'community_id')) {
                $table->uuid('community_id')->nullable()->after('tenant_id');
                $table->index('community_id');
            }
            if (! Schema::hasColumn('smb_businesses', 'ai_context')) {
                $table->jsonb('ai_context')->nullable();
            }
            if (! Schema::hasColumn('smb_businesses', 'customer_intelligence')) {
                $table->jsonb('customer_intelligence')->nullable();
            }
            if (! Schema::hasColumn('smb_businesses', 'competitor_analysis')) {
                $table->jsonb('competitor_analysis')->nullable();
            }
            if (! Schema::hasColumn('smb_businesses', 'survey_responses')) {
                $table->jsonb('survey_responses')->nullable();
            }
            if (! Schema::hasColumn('smb_businesses', 'profile_completeness')) {
                $table->integer('profile_completeness')->default(0);
            }
            if (! Schema::hasColumn('smb_businesses', 'last_enriched_at')) {
                $table->timestamp('last_enriched_at')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('smb_businesses', function (Blueprint $table) {
            $columns = ['community_id', 'ai_context', 'customer_intelligence', 'competitor_analysis', 'survey_responses', 'profile_completeness', 'last_enriched_at'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('smb_businesses', $column)) {
                    if ($column === 'community_id') {
                        $table->dropIndex(['community_id']);
                    }
                    $table->dropColumn($column);
                }
            }
        });
    }
};
