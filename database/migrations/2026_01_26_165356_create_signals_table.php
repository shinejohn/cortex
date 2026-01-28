<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('signals', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Core Identity
            $table->string('type'); // url, email, rss_item, etc
            $table->string('source_identifier')->nullable(); // e.g. sender email or feed URL
            $table->string('external_id')->nullable(); // ID from external system
            $table->string('content_hash')->unique(); // For deduplication

            // Content
            $table->string('title');
            $table->text('content')->nullable();
            $table->string('url')->nullable();
            $table->string('author_name')->nullable();

            // Context
            $table->json('metadata')->nullable(); // Flexible storage for scanner-specific data
            $table->timestamp('published_at')->nullable();

            // Workflow Status
            $table->string('status')->default('pending'); // pending, processed, rejected, thread_created
            $table->foreignUuid('related_story_id')->nullable(); // If linked to a Story Thread

            $table->timestamps();

            // Indices for common lookups
            $table->index(['type', 'status']);
            $table->index('published_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('signals');
    }
};
