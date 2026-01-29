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
        if (Schema::hasTable('tags')) {
            return;
        }
        
        Schema::create('tags', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->unsignedInteger('article_count')->default(0);
            $table->unsignedInteger('followers_count')->default(0);
            $table->boolean('is_trending')->default(false);
            $table->unsignedInteger('trending_score')->default(0);
            $table->timestamps();

            $table->index('slug');
            $table->index('is_trending');
            $table->index(['is_trending', 'trending_score']);
        });

        // Pivot table for tags and articles
        Schema::create('day_news_post_tag', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('day_news_post_id');
            $table->uuid('tag_id');
            $table->timestamps();

            $table->unique(['day_news_post_id', 'tag_id']);
            $table->index('tag_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('day_news_post_tag');
        Schema::dropIfExists('tags');
    }
};

