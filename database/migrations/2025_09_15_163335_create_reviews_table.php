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
        Schema::create('reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Polymorphic relationship to any reviewable entity
            $table->uuidMorphs('reviewable'); // reviewable_type, reviewable_id

            // User who wrote the review (not workspace-specific)
            $table->uuid('user_id');

            // Review content
            $table->string('title');
            $table->text('content');
            $table->integer('rating')->unsigned(); // 1-5 stars

            // Review metadata
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->json('helpful_votes')->nullable(); // Array of user IDs who found it helpful
            $table->integer('helpful_count')->default(0);

            // Moderation
            $table->enum('status', ['pending', 'approved', 'rejected', 'hidden'])->default('pending');
            $table->timestamp('approved_at')->nullable();
            $table->uuid('approved_by')->nullable();
            $table->string('rejection_reason')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['reviewable_type', 'reviewable_id'], 'reviews_reviewable_idx');
            $table->index(['user_id', 'reviewable_type', 'reviewable_id'], 'reviews_user_reviewable_idx');
            $table->index(['rating', 'status'], 'reviews_rating_status_idx');
            $table->index('status', 'reviews_status_idx');

            // Prevent duplicate reviews from same user for same entity
            $table->unique(['user_id', 'reviewable_type', 'reviewable_id'], 'unique_user_review');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
