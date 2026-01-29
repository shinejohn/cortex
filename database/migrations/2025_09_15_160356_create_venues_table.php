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
        Schema::create('venues', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description');
            $table->json('images')->nullable(); // Array of image URLs
            $table->boolean('verified')->default(false);
            $table->string('venue_type');
            $table->integer('capacity');

            // Pricing structure
            $table->decimal('price_per_hour', 10, 2);
            $table->decimal('price_per_event', 10, 2);
            $table->decimal('price_per_day', 10, 2);

            // Rating and reviews (computed from separate models)
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->integer('total_reviews')->default(0);

            // Location information
            $table->string('address');
            $table->string('neighborhood')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('google_place_id')->nullable()->index();
            $table->string('postal_code')->nullable();

            // Additional venue information
            $table->json('amenities')->nullable(); // Array of amenities
            $table->json('event_types')->nullable(); // Array of supported event types
            $table->json('unavailable_dates')->nullable(); // Array of unavailable dates
            $table->integer('last_booked_days_ago')->nullable();
            $table->integer('response_time_hours')->default(24);
            $table->date('listed_date')->nullable();

            // Status and ownership - workspace-centric
            $table->enum('status', ['active', 'inactive', 'pending', 'suspended'])->default('active');
            $table->uuid('workspace_id');
            $table->uuid('created_by')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['venue_type', 'status']);
            $table->index(['latitude', 'longitude']);
            $table->index('capacity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('venues');
    }
};
