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
            $table->boolean('is_national')->default(false)->after('status');
            $table->index('is_national');
        });
    }

    public function down(): void
    {
        Schema::table('day_news_posts', function (Blueprint $table) {
            $table->dropColumn('is_national');
        });
    }
};
