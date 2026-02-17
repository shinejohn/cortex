<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('content_moderation_logs');

        Schema::create('content_moderation_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('content_type');
            $table->string('content_id');
            $table->uuid('region_id')->nullable();
            $table->uuid('user_id')->nullable();
            $table->string('trigger');
            $table->text('content_snapshot');
            $table->json('metadata')->nullable();
            $table->string('decision');
            $table->string('violation_section')->nullable();
            $table->text('violation_explanation')->nullable();
            $table->string('ai_model');
            $table->integer('processing_ms');
            $table->string('appeal_status')->nullable();
            $table->timestamps();

            $table->index(['content_type', 'content_id']);
            $table->index(['decision']);
            $table->index(['user_id']);
            $table->index(['region_id']);
            $table->index(['violation_section']);
            $table->index(['created_at']);
            $table->index(['content_type', 'decision', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_moderation_logs');
    }
};
