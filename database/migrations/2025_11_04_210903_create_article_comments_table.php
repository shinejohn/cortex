<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('article_comments')) {
            return;
        }

        Schema::create('article_comments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('article_id')->constrained('day_news_posts')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('parent_id')->nullable()->constrained('article_comments')->cascadeOnDelete();
        });

        // Article comment likes table
        Schema::create('article_comment_likes', function (Blueprint $table) {
            $table->id();
            $table->uuid('comment_id')->constrained('article_comments')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['comment_id', 'user_id']);
            $table->index(['comment_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('article_comment_likes');
        Schema::dropIfExists('article_comments');
    }
};

