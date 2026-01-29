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
            $table->unsignedBigInteger('article_id');
            $table->uuid('user_id');
            $table->uuid('parent_id')->nullable()->cascadeOnDelete();
        });

        // Article comment likes table
        Schema::create('article_comment_likes', function (Blueprint $table) {
            $table->id();
            $table->uuid('comment_id');
            $table->uuid('user_id');
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

