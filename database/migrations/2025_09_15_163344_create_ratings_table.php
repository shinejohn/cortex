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
        Schema::create('ratings', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Polymorphic relationship to any ratable entity
            $table->uuidMorphs('ratable'); // ratable_type, ratable_id

            // User who gave the rating (not workspace-specific)
            $table->uuid('user_id');

            // Rating value
            $table->integer('rating')->unsigned(); // 1-5 stars

            // Optional context for quick ratings without full reviews
            $table->string('context')->nullable(); // e.g., 'service', 'quality', 'value', 'overall'
            $table->text('notes')->nullable(); // Brief notes

            // Rating source/type
            $table->enum('type', ['booking', 'general', 'event_attendance'])->default('general');
            $table->uuid('booking_id')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['ratable_type', 'ratable_id'], 'ratings_ratable_idx');
            $table->index(['user_id', 'ratable_type', 'ratable_id'], 'ratings_user_ratable_idx');
            $table->index(['rating', 'type'], 'ratings_rating_type_idx');
            $table->index('context', 'ratings_context_idx');

            // Prevent duplicate ratings from same user for same entity in same context
            $table->unique(['user_id', 'ratable_type', 'ratable_id', 'context'], 'unique_user_rating');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};
