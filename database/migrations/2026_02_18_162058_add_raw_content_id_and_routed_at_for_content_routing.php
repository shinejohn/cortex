<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds raw_content_id to news_articles and routed_at to raw_content for ContentRoutingService bridge.
     */
    public function up(): void
    {
        if (Schema::hasTable('news_articles') && ! Schema::hasColumn('news_articles', 'raw_content_id')) {
            Schema::table('news_articles', function (Blueprint $table) {
                $table->uuid('raw_content_id')->nullable()->after('business_id');
                $table->index('raw_content_id');
            });
        }

        if (Schema::hasTable('raw_content') && ! Schema::hasColumn('raw_content', 'routed_at')) {
            Schema::table('raw_content', function (Blueprint $table) {
                $table->timestamp('routed_at')->nullable()->index();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('news_articles') && Schema::hasColumn('news_articles', 'raw_content_id')) {
            Schema::table('news_articles', function (Blueprint $table) {
                $table->dropIndex(['raw_content_id']);
                $table->dropColumn('raw_content_id');
            });
        }

        if (Schema::hasTable('raw_content') && Schema::hasColumn('raw_content', 'routed_at')) {
            Schema::table('raw_content', function (Blueprint $table) {
                $table->dropIndex(['routed_at']);
                $table->dropColumn('routed_at');
            });
        }
    }
};
