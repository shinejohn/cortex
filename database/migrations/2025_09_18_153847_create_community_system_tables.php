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
        // Create communities table
        Schema::create('communities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('slug')->unique();
            $table->string('name');
            $table->text('description');
            $table->string('image')->nullable();
            $table->json('categories')->nullable();
            $table->json('thread_types')->nullable();
            $table->json('popular_tags')->nullable();
            $table->text('guidelines')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->integer('total_events')->default(0);
            $table->integer('active_today')->default(0);
            $table->timestamp('last_activity')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignUuid('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        // Create community_threads table
        Schema::create('community_threads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('content');
            $table->text('preview')->nullable();
            $table->string('type'); // Discussion, Question, Announcement, Resource, Event
            $table->json('tags')->nullable();
            $table->json('images')->nullable();
            $table->integer('views')->default(0);
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_locked')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->timestamp('last_reply_at')->nullable();
            $table->foreignUuid('last_reply_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('community_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('author_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            // Indexes for performance
            $table->index(['community_id', 'created_at']);
            $table->index(['community_id', 'type']);
            $table->index(['community_id', 'is_pinned']);
        });

        // Create community_members table
        Schema::create('community_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('community_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->enum('role', ['member', 'moderator', 'admin'])->default('member');
            $table->timestamp('joined_at')->useCurrent();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamps();

            // Prevent duplicate memberships
            $table->unique(['community_id', 'user_id']);

            // Indexes for performance
            $table->index(['community_id', 'is_active']);
            $table->index(['user_id', 'is_active']);
            $table->index('last_activity_at');
        });

        // Create community_thread_replies table
        Schema::create('community_thread_replies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('thread_id')->constrained('community_threads')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->text('content');
            $table->json('images')->nullable();
            $table->integer('likes_count')->default(0);
            $table->boolean('is_solution')->default(false); // For question threads
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_edited')->default(false);
            $table->timestamp('edited_at')->nullable();
            $table->foreignUuid('reply_to_id')->nullable()->constrained('community_thread_replies')->nullOnDelete();
            $table->timestamps();

            // Indexes for performance
            $table->index(['thread_id', 'created_at']);
            $table->index(['thread_id', 'is_pinned']);
            $table->index(['thread_id', 'is_solution']);
            $table->index(['user_id', 'created_at']);
            $table->index('reply_to_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('community_thread_replies');
        Schema::dropIfExists('community_members');
        Schema::dropIfExists('community_threads');
        Schema::dropIfExists('communities');
    }
};
