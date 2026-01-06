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
        if (Schema::hasTable('creator_profiles')) {
            return;
        }
        
        Schema::create('creator_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('display_name');
            $table->string('slug')->unique();
            $table->text('bio')->nullable();
            $table->string('avatar')->nullable();
            $table->string('cover_image')->nullable();
            $table->json('social_links')->nullable(); // Twitter, Instagram, etc.
            $table->enum('status', ['pending', 'approved', 'rejected', 'suspended'])->default('pending');
            $table->unsignedInteger('followers_count')->default(0);
            $table->unsignedInteger('podcasts_count')->default(0);
            $table->unsignedInteger('episodes_count')->default(0);
            $table->unsignedInteger('total_listens')->default(0);
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('slug');
        });

        Schema::create('podcasts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('creator_profile_id')->constrained('creator_profiles')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('category')->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->unsignedInteger('episodes_count')->default(0);
            $table->unsignedInteger('subscribers_count')->default(0);
            $table->unsignedInteger('total_listens')->default(0);
            $table->unsignedInteger('total_duration')->default(0); // in seconds
            $table->timestamps();

            $table->index(['creator_profile_id', 'status']);
            $table->index(['status', 'published_at']);
            $table->index('slug');
        });

        Schema::create('podcast_episodes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('podcast_id')->constrained('podcasts')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->text('show_notes')->nullable();
            $table->string('audio_file_path');
            $table->string('audio_file_disk')->default('public');
            $table->unsignedInteger('duration')->nullable(); // in seconds
            $table->unsignedBigInteger('file_size')->nullable(); // in bytes
            $table->string('episode_number')->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->unsignedInteger('listens_count')->default(0);
            $table->unsignedInteger('downloads_count')->default(0);
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('comments_count')->default(0);
            $table->timestamps();

            $table->index(['podcast_id', 'status']);
            $table->index(['status', 'published_at']);
            $table->index('slug');
        });

        Schema::create('podcast_region', function (Blueprint $table) {
            $table->id();
            $table->uuid('podcast_id')->constrained('podcasts')->cascadeOnDelete();
            $table->foreignUuid('region_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['podcast_id', 'region_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('podcast_region');
        Schema::dropIfExists('podcast_episodes');
        Schema::dropIfExists('podcasts');
        Schema::dropIfExists('creator_profiles');
    }
};

