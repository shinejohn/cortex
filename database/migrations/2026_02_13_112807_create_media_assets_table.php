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
        Schema::create('media_assets', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // ── STORAGE ──
            $table->string('storage_disk')->default('public');
            $table->string('storage_path');
            $table->string('public_url', 1024)->nullable();
            $table->string('thumb_url', 1024)->nullable();
            $table->string('small_url', 1024)->nullable();
            $table->string('original_url', 1024)->nullable();
            $table->string('file_hash', 64)->nullable()->unique();

            // ── DIMENSIONS & FORMAT ──
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            $table->string('mime_type')->default('image/jpeg');
            $table->integer('file_size_bytes')->nullable();
            $table->string('dominant_color', 7)->nullable();

            // ── SOURCE & LICENSING ──
            $table->string('source_type');
            $table->string('source_id')->nullable();
            $table->string('license_type')->default('unknown');
            $table->boolean('requires_attribution')->default(true);

            // ── ATTRIBUTION (structured, not HTML blob) ──
            $table->string('photographer_name')->nullable();
            $table->string('photographer_url', 512)->nullable();
            $table->string('source_platform_name')->nullable();
            $table->string('source_platform_url', 512)->nullable();
            $table->text('attribution_html')->nullable();
            $table->json('raw_attributions')->nullable();

            // ── CONTENT METADATA (for search & reuse) ──
            $table->string('alt_text', 512)->nullable();
            $table->text('description')->nullable();
            $table->json('tags')->nullable();
            $table->json('ai_tags')->nullable();
            $table->string('category')->nullable();
            $table->string('subcategory')->nullable();

            // ── GEOGRAPHIC ──
            $table->uuid('region_id')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('location_name')->nullable();

            // ── OWNERSHIP / PROVENANCE ──
            $table->uuid('uploaded_by_user_id')->nullable();
            $table->uuid('business_id')->nullable();
            $table->string('google_place_id')->nullable();

            // ── QUALITY ──
            $table->integer('quality_score')->nullable();
            $table->boolean('is_approved')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_local')->default(false);
            $table->string('quality_notes')->nullable();

            // ── USAGE TRACKING ──
            $table->integer('usage_count')->default(0);
            $table->timestamp('last_used_at')->nullable();
            $table->json('used_in')->nullable();

            // ── STATUS ──
            $table->string('status')->default('active');
            $table->timestamps();
            $table->softDeletes();

            // ── INDEXES ──
            $table->index('source_type');
            $table->index('region_id');
            $table->index('business_id');
            $table->index('category');
            $table->index('is_approved');
            $table->index('is_local');
            $table->index('quality_score');
            $table->index('usage_count');
            $table->index('license_type');
            $table->index('google_place_id');
        });

        Schema::table('media_assets', function (Blueprint $table) {
            $table->foreign('region_id')->references('id')->on('regions')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('media_assets', function (Blueprint $table) {
            $table->dropForeign(['region_id']);
        });

        Schema::dropIfExists('media_assets');
    }
};
