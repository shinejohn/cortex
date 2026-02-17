<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $tables = [
            'day_news_posts',
            'events',
            'article_comments',
        ];

        foreach ($tables as $tableName) {
            if (! Schema::hasTable($tableName)) {
                continue;
            }

            if (! Schema::hasColumn($tableName, 'moderation_status')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->string('moderation_status')->default('published');
                    $table->text('moderation_removal_reason')->nullable();
                });
            } elseif (! Schema::hasColumn($tableName, 'moderation_removal_reason')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->text('moderation_removal_reason')->nullable();
                });
            }
        }

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'moderation_status')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->index('moderation_status');
                });
            }
        }
    }

    public function down(): void
    {
        $tables = [
            'day_news_posts',
            'events',
            'article_comments',
        ];

        foreach ($tables as $tableName) {
            if (! Schema::hasTable($tableName)) {
                continue;
            }

            if (Schema::hasColumn($tableName, 'moderation_status')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->dropColumn(['moderation_status', 'moderation_removal_reason']);
                });
            }
        }
    }
};
