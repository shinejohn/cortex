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
        Schema::create('ai_employees', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('role'); // e.g. 'marketing_manager', 'social_media_specialist'
            $table->json('personality_config')->nullable(); // tones, forbidden words, etc.
            $table->string('status')->default('active'); // active, paused, archived
            $table->string('avatar_url')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['business_id', 'status']);
        });

        Schema::create('ai_employee_tasks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('ai_employee_id')->constrained('ai_employees')->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete(); // Denormalized for query speed
            $table->string('type'); // e.g. 'generate_post', 'reply_review'
            $table->string('status')->default('pending'); // pending, processing, completed, failed
            $table->json('payload')->nullable(); // Input data for the task
            $table->json('result')->nullable(); // Output/Result of the task
            $table->text('error_message')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['business_id', 'status']);
            $table->index(['ai_employee_id', 'status']);
            $table->index('scheduled_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_employee_tasks');
        Schema::dropIfExists('ai_employees');
    }
};
