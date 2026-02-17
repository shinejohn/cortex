<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('day_news_posts', function (Blueprint $table) {
            $table->json('social_share_status')->nullable()->after('metadata');
        });
    }

    public function down(): void
    {
        Schema::table('day_news_posts', function (Blueprint $table) {
            $table->dropColumn('social_share_status');
        });
    }
};
