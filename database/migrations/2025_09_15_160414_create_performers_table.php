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
        Schema::create('performers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('profile_image')->nullable();
            $table->json('genres'); // Array of genres
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->integer('total_reviews')->default(0);
            $table->integer('follower_count')->default(0);
            $table->text('bio')->nullable();
            $table->integer('years_active')->default(0);
            $table->integer('shows_played')->default(0);
            $table->string('home_city');

            // Performer capabilities and status
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_touring_now')->default(false);
            $table->boolean('available_for_booking')->default(true);
            $table->boolean('has_merchandise')->default(false);
            $table->boolean('has_original_music')->default(false);
            $table->boolean('offers_meet_and_greet')->default(false);
            $table->boolean('takes_requests')->default(false);
            $table->boolean('available_for_private_events')->default(true);
            $table->boolean('is_family_friendly')->default(true);
            $table->boolean('has_samples')->default(false);

            // Performance metrics
            $table->integer('trending_score')->default(0);
            $table->decimal('distance_miles', 8, 2)->nullable();
            $table->date('added_date')->nullable();
            $table->boolean('introductory_pricing')->default(false);

            // Pricing structure
            $table->decimal('base_price', 10, 2)->nullable();
            $table->string('currency', 3)->default('USD');
            $table->integer('minimum_booking_hours')->default(1);
            $table->decimal('travel_fee_per_mile', 8, 2)->nullable();
            $table->decimal('setup_fee', 10, 2)->nullable();
            $table->text('cancellation_policy')->nullable();

            // Account information - workspace-centric
            $table->enum('status', ['active', 'inactive', 'pending', 'suspended'])->default('active');
            $table->uuid('workspace_id');
            $table->uuid('created_by')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['status', 'available_for_booking']);
            $table->index('trending_score');
            $table->index('home_city');
            $table->index('is_verified');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('performers');
    }
};
