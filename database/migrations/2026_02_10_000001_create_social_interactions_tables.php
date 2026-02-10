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
        Schema::create('comment_likes', function (Blueprint $table) {
            $table->id();
            $table->string('comment_type');
            $table->unsignedBigInteger('comment_id');
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['comment_type', 'comment_id', 'user_id']);
            $table->index(['comment_type', 'comment_id']);
        });

        Schema::create('content_shares', function (Blueprint $table) {
            $table->id();
            $table->string('shareable_type');
            $table->unsignedBigInteger('shareable_id');
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('platform')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['shareable_type', 'shareable_id']);
            $table->index('user_id');
        });

        Schema::create('post_reactions', function (Blueprint $table) {
            $table->id();
            $table->string('post_type');
            $table->unsignedBigInteger('post_id');
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('reaction_type')->default('like');
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['post_type', 'post_id', 'user_id', 'reaction_type']);
            $table->index(['post_type', 'post_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_reactions');
        Schema::dropIfExists('content_shares');
        Schema::dropIfExists('comment_likes');
    }
};
