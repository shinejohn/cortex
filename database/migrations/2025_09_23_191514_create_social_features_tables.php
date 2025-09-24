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
        // Social posts table
        Schema::create('social_posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->text('content');
            $table->json('media')->nullable(); // Store image/video URLs
            $table->enum('visibility', ['public', 'friends', 'private'])->default('public');
            $table->json('location')->nullable(); // Store location data
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['visibility', 'is_active', 'created_at']);
        });

        // Post likes table
        Schema::create('social_post_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('post_id')->constrained('social_posts')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['post_id', 'user_id']);
            $table->index(['post_id', 'created_at']);
        });

        // Post comments table
        Schema::create('social_post_comments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('post_id')->constrained('social_posts')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->uuid('parent_id')->nullable();
            $table->text('content');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['post_id', 'parent_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
        });

        // Add self-referencing foreign key after table creation
        Schema::table('social_post_comments', function (Blueprint $table) {
            $table->foreign('parent_id')->references('id')->on('social_post_comments')->onDelete('cascade');
        });

        // Comment likes table
        Schema::create('social_comment_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('comment_id')->constrained('social_post_comments')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['comment_id', 'user_id']);
        });

        // Post shares table
        Schema::create('social_post_shares', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('post_id')->constrained('social_posts')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('message')->nullable(); // Optional message when sharing
            $table->timestamps();

            $table->index(['post_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
        });

        // Friends/connections table
        Schema::create('social_friendships', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('friend_id')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['pending', 'accepted', 'blocked'])->default('pending');
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'friend_id']);
            $table->index(['user_id', 'status']);
            $table->index(['friend_id', 'status']);
        });

        // Social groups table
        Schema::create('social_groups', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('cover_image')->nullable();
            $table->foreignUuid('creator_id')->constrained('users')->cascadeOnDelete();
            $table->enum('privacy', ['public', 'private', 'secret'])->default('public');
            $table->boolean('is_active')->default(true);
            $table->json('settings')->nullable(); // Group-specific settings
            $table->timestamps();

            $table->index(['privacy', 'is_active', 'created_at']);
            $table->index(['creator_id', 'created_at']);
        });

        // Group memberships table
        Schema::create('social_group_members', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('group_id')->constrained('social_groups')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('role', ['admin', 'moderator', 'member'])->default('member');
            $table->enum('status', ['pending', 'approved', 'banned'])->default('approved');
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamps();

            $table->unique(['group_id', 'user_id']);
            $table->index(['group_id', 'status', 'role']);
            $table->index(['user_id', 'status']);
        });

        // Group posts table
        Schema::create('social_group_posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('group_id')->constrained('social_groups')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('content');
            $table->json('media')->nullable();
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['group_id', 'is_pinned', 'created_at']);
            $table->index(['user_id', 'created_at']);
        });

        // User profiles table (extended social profile info)
        Schema::create('social_user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('bio')->nullable();
            $table->string('website')->nullable();
            $table->string('location')->nullable();
            $table->date('birth_date')->nullable();
            $table->enum('profile_visibility', ['public', 'friends', 'private'])->default('public');
            $table->json('interests')->nullable(); // Array of interests/hobbies
            $table->string('cover_photo')->nullable();
            $table->json('social_links')->nullable(); // Links to other social platforms
            $table->boolean('show_email')->default(false);
            $table->boolean('show_location')->default(true);
            $table->timestamps();

            $table->unique('user_id');
        });

        // User followers table (for public profile following)
        Schema::create('social_user_follows', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('follower_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('following_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['follower_id', 'following_id']);
            $table->index(['follower_id', 'created_at']);
            $table->index(['following_id', 'created_at']);
        });

        // Group invitations table
        Schema::create('social_group_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('group_id')->constrained('social_groups')->cascadeOnDelete();
            $table->foreignUuid('inviter_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('invited_id')->constrained('users')->cascadeOnDelete();
            $table->string('message')->nullable();
            $table->enum('status', ['pending', 'accepted', 'declined'])->default('pending');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->unique(['group_id', 'invited_id']);
            $table->index(['invited_id', 'status']);
            $table->index(['group_id', 'status']);
        });

        // Activity feed/notifications table
        Schema::create('social_activities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete(); // User who will see this activity
            $table->foreignUuid('actor_id')->constrained('users')->cascadeOnDelete(); // User who performed the action
            $table->enum('type', [
                'post_like', 'post_comment', 'post_share',
                'friend_request', 'friend_accept',
                'group_invite', 'group_join', 'group_post',
                'profile_follow',
            ]);
            $table->string('subject_type');
            $table->uuid('subject_id'); // The thing that was acted upon (post, comment, etc.)
            $table->index(['subject_type', 'subject_id']);
            $table->json('data')->nullable(); // Additional data specific to the activity type
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'is_read', 'created_at']);
            $table->index(['actor_id', 'created_at']);
            $table->index(['type', 'created_at']);
        });

        // Add social-related columns to users table
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_private_profile')->default(false);
            $table->boolean('allow_friend_requests')->default(true);
            $table->boolean('allow_group_invites')->default(true);
            $table->timestamp('last_active_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop tables in reverse order to handle foreign key constraints
        Schema::dropIfExists('social_activities');
        Schema::dropIfExists('social_group_invitations');
        Schema::dropIfExists('social_user_follows');
        Schema::dropIfExists('social_user_profiles');
        Schema::dropIfExists('social_group_posts');
        Schema::dropIfExists('social_group_members');
        Schema::dropIfExists('social_groups');
        Schema::dropIfExists('social_friendships');
        Schema::dropIfExists('social_post_shares');
        Schema::dropIfExists('social_comment_likes');
        Schema::dropIfExists('social_post_comments');
        Schema::dropIfExists('social_post_likes');
        Schema::dropIfExists('social_posts');

        // Remove columns from users table
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'is_private_profile',
                'allow_friend_requests',
                'allow_group_invites',
                'last_active_at',
            ]);
        });
    }
};
