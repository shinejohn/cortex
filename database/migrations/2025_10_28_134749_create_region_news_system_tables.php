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
        // Regions table - hierarchical geographic regions
        Schema::create('regions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->enum('type', ['state', 'county', 'city', 'neighborhood']);
            $table->uuid('parent_id')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->json('metadata')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamps();

            $table->index('slug');
            $table->index('type');
            $table->index('parent_id');
            $table->index('is_active');
            $table->index(['latitude', 'longitude']);
        });

        // Add self-referencing foreign key after table creation
        Schema::table('regions', function (Blueprint $table) {
            $table->foreign('parent_id')
                ->references('id')
                ->on('regions')
                ->onDelete('cascade');
        });

        // Region zipcodes table - links zipcodes to regions
        Schema::create('region_zipcodes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('region_id')->constrained('regions')->onDelete('cascade');
            $table->string('zipcode', 10);
            $table->boolean('is_primary')->default(false);
            $table->timestamps();

            $table->unique(['region_id', 'zipcode']);
            $table->index('zipcode');
        });

        // News table - news articles
        Schema::create('news', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('content');
            $table->text('excerpt')->nullable();
            $table->string('featured_image')->nullable();
            $table->foreignUuid('author_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('published_at')->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->integer('view_count')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('slug');
            $table->index('published_at');
            $table->index('status');
            $table->index('author_id');
        });

        // News region pivot table - many-to-many relationship
        Schema::create('news_region', function (Blueprint $table) {
            $table->foreignUuid('news_id')->constrained('news')->onDelete('cascade');
            $table->foreignUuid('region_id')->constrained('regions')->onDelete('cascade');
            $table->timestamps();

            $table->primary(['news_id', 'region_id']);
            $table->index('region_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('news_region');
        Schema::dropIfExists('news');
        Schema::dropIfExists('region_zipcodes');
        Schema::dropIfExists('regions');
    }
};
