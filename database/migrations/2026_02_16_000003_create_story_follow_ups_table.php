<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('story_follow_ups')) {
            Schema::create('story_follow_ups', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('story_thread_id');
                $table->string('type'); // development|update|resolution|anniversary|related
                $table->string('trigger'); // auto_scheduled|new_content_detected|manual|community_tip
                $table->text('description')->nullable();
                $table->uuid('source_content_id')->nullable();
                $table->uuid('generated_article_id')->nullable();
                $table->string('status')->default('pending'); // pending|in_progress|published|dismissed
                $table->timestamp('scheduled_for')->nullable();
                $table->timestamp('completed_at')->nullable();
                $table->timestamps();

                $table->foreign('story_thread_id')->references('id')->on('story_threads')->cascadeOnDelete();
                $table->index(['story_thread_id', 'status']);
                $table->index('scheduled_for');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('story_follow_ups');
    }
};
