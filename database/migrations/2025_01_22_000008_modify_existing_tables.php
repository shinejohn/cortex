<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('news_article_drafts') && !Schema::hasColumn('news_article_drafts', 'raw_content_id')) {
            Schema::table('news_article_drafts', function (Blueprint $table) {
                $table->uuid('raw_content_id')->nullable()->after('id');
                $table->string('processing_tier', 10)->nullable()->after('status');
                $table->jsonb('classification_data')->nullable();
                $table->boolean('auto_publish')->default(false);
                $table->string('generation_model')->nullable();
            });
        }

        if (Schema::hasTable('businesses') && !Schema::hasColumn('businesses', 'is_advertiser')) {
            Schema::table('businesses', function (Blueprint $table) {
                $table->boolean('is_advertiser')->default(false);
                $table->boolean('is_command_center_customer')->default(false);
                $table->integer('mention_count')->default(0);
                $table->timestamp('last_mentioned_at')->nullable();
            });
        }

        if (Schema::hasTable('events') && !Schema::hasColumn('events', 'raw_content_id')) {
            Schema::table('events', function (Blueprint $table) {
                $table->uuid('raw_content_id')->nullable();
                $table->boolean('auto_extracted')->default(false);
            });
        }
    }

    public function down(): void
    {
        Schema::table('news_article_drafts', function (Blueprint $table) {
            $table->dropColumn(['raw_content_id', 'processing_tier', 'classification_data', 'auto_publish', 'generation_model']);
        });
        Schema::table('businesses', function (Blueprint $table) {
            $table->dropColumn(['is_advertiser', 'is_command_center_customer', 'mention_count', 'last_mentioned_at']);
        });
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['raw_content_id', 'auto_extracted']);
        });
    }
};
