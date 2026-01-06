<?php

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
        Schema::table('events', function (Blueprint $table) {
            if (!Schema::hasColumn('events', 'source_news_article_id')) {
                $table->uuid('source_news_article_id')->nullable()->after('created_by');
            }
            if (!Schema::hasColumn('events', 'source_type')) {
                $table->string('source_type')->nullable()->after('source_news_article_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['source_news_article_id', 'source_type']);
        });
    }
};
