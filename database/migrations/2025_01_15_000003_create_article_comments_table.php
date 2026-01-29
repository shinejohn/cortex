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
        // Create article_comments table - NO FOREIGN KEYS during creation
        // FK constraints will be added in a separate migration after all tables exist
        Schema::create('article_comments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('article_id'); // References day_news_posts - FK added later
            $table->uuid('user_id'); // References users - FK added later
            $table->uuid('parent_id')->nullable(); // Self-reference - FK added later
            $table->text('content');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_pinned')->default(false);
            $table->unsignedInteger('reports_count')->default(0);
            $table->timestamps();

            $table->index(['article_id', 'parent_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index(['article_id', 'is_active', 'created_at']);
        });

        // Article comment likes table - NO FOREIGN KEYS during creation
        Schema::create('article_comment_likes', function (Blueprint $table) {
            $table->id();
            $table->uuid('comment_id'); // References article_comments - FK added later
            $table->uuid('user_id'); // References users - FK added later
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

