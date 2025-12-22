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
        // Only run if day_news_posts table exists
        if (Schema::hasTable('day_news_posts')) {
            Schema::table('day_news_posts', function (Blueprint $table) {
                if (!Schema::hasColumn('day_news_posts', 'average_rating')) {
                    $table->decimal('average_rating', 3, 2)->nullable()->after('view_count');
                }
                if (!Schema::hasColumn('day_news_posts', 'total_reviews')) {
                    $table->unsignedInteger('total_reviews')->default(0)->after('average_rating');
                }
                
                // Only add index if column exists
                if (Schema::hasColumn('day_news_posts', 'average_rating')) {
                    $indexes = Schema::getConnection()->getDoctrineSchemaManager()->listTableIndexes('day_news_posts');
                    if (!isset($indexes['day_news_posts_average_rating_index'])) {
                        $table->index('average_rating');
                    }
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('day_news_posts', function (Blueprint $table) {
            $table->dropIndex(['average_rating']);
            $table->dropColumn(['average_rating', 'total_reviews']);
        });
    }
};

