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
        Schema::table('day_news_posts', function (Blueprint $table) {
            $table->decimal('average_rating', 3, 2)->nullable()->after('view_count');
            $table->unsignedInteger('total_reviews')->default(0)->after('average_rating');
            
            $table->index('average_rating');
        });
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

