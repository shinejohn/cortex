<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_complaints', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('content_type');
            $table->string('content_id');
            $table->uuid('complainant_id');
            $table->string('complaint_reason');
            $table->text('complaint_text')->nullable();
            $table->string('complaint_type')->default('user');
            $table->string('review_decision')->nullable();
            $table->text('review_explanation')->nullable();
            $table->uuid('review_moderation_log_id')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->unique(['content_type', 'content_id', 'complainant_id'], 'unique_complaint_per_user');
            $table->index(['content_type', 'content_id']);
            $table->index(['complainant_id']);
            $table->index(['complaint_reason']);
            $table->index(['review_decision']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_complaints');
    }
};
