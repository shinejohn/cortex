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
        Schema::create('user_achievement_progress', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('achievement_slug');
            $table->string('category');
            $table->unsignedInteger('current_progress')->default(0);
            $table->unsignedInteger('target_value');
            $table->timestamp('completed_at')->nullable();
            $table->unsignedInteger('points_awarded')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'achievement_slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_achievement_progress');
    }
};
