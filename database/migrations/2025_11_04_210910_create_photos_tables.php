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
        if (Schema::hasTable('photo_albums')) {
            return;
        }
        
        Schema::create('photo_albums', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('workspace_id')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('cover_image')->nullable();
            $table->enum('visibility', ['public', 'private', 'community'])->default('public');
            $table->unsignedInteger('photos_count')->default(0);
            $table->unsignedInteger('views_count')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'visibility']);
            $table->index('created_at');
        });

        Schema::create('photos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('album_id')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('image_path');
            $table->string('image_disk')->default('public');
            $table->string('thumbnail_path')->nullable();
            $table->string('category')->nullable(); // Nature, Events, Recreation, Community, Sports, etc.
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->unsignedBigInteger('file_size')->nullable(); // in bytes
            $table->unsignedInteger('views_count')->default(0);
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('comments_count')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['album_id', 'created_at']);
            $table->index(['category', 'status']);
            $table->index('created_at');
        });

        Schema::create('photo_album_photo', function (Blueprint $table) {
            $table->id();
            $table->uuid('album_id');
            $table->uuid('photo_id');
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->unique(['album_id', 'photo_id']);
            $table->index(['album_id', 'order']);
        });

        Schema::create('photo_region', function (Blueprint $table) {
            $table->id();
            $table->uuid('photo_id');
            $table->uuid('region_id');
            $table->timestamps();

            $table->unique(['photo_id', 'region_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('photo_region');
        Schema::dropIfExists('photo_album_photo');
        Schema::dropIfExists('photos');
        Schema::dropIfExists('photo_albums');
    }
};

