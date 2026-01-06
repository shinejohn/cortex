<?php

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
        Schema::create('smb_businesses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            
            // REQUIRED - NOT NULL
            $table->string('google_place_id')->unique();
            $table->string('display_name');
            
            // Location - REQUIRED
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->text('formatted_address');
            $table->json('address_components')->nullable();
            $table->string('plus_code')->nullable();
            $table->json('viewport')->nullable();
            $table->json('location')->nullable();
            
            // Contact - REQUIRED
            $table->string('phone_national');
            $table->string('phone_international')->nullable();
            $table->string('website_url')->nullable();
            
            // Status
            $table->string('business_status')->default('OPERATIONAL');
            $table->enum('fibonacco_status', ['prospect', 'active', 'churned'])->default('prospect');
            
            // Ratings
            $table->decimal('google_rating', 3, 1)->nullable();
            $table->integer('google_rating_count')->default(0);
            $table->integer('user_rating_total')->default(0);
            
            // Service flags - ALL booleans
            $table->boolean('delivery')->default(false);
            $table->boolean('dine_in')->default(false);
            $table->boolean('takeout')->default(false);
            $table->boolean('reservable')->default(false);
            $table->boolean('outdoor_seating')->default(false);
            $table->boolean('serves_breakfast')->default(false);
            $table->boolean('serves_lunch')->default(false);
            $table->boolean('serves_dinner')->default(false);
            $table->boolean('serves_beer')->default(false);
            $table->boolean('serves_wine')->default(false);
            $table->boolean('serves_brunch')->default(false);
            $table->boolean('serves_vegetarian_food')->default(false);
            $table->boolean('wheelchair_accessible_entrance')->default(false);
            
            // JSON fields
            $table->json('place_types')->nullable();
            $table->json('accessibility_options')->nullable();
            $table->json('payment_options')->nullable();
            $table->json('parking_options')->nullable();
            $table->json('data_sources')->nullable();
            $table->json('opening_hours')->nullable();
            $table->json('current_opening_hours')->nullable();
            $table->json('secondary_opening_hours')->nullable();
            $table->json('editorial_summary')->nullable();
            $table->json('photos')->nullable();
            $table->json('reviews')->nullable();
            $table->integer('utc_offset')->nullable();
            $table->text('adr_address')->nullable();
            $table->string('formatted_phone_number')->nullable();
            $table->string('international_phone_number')->nullable();
            $table->integer('price_level')->nullable();
            $table->string('icon')->nullable();
            $table->string('icon_background_color')->nullable();
            $table->string('icon_mask_base_uri')->nullable();
            $table->string('name')->nullable();
            $table->string('place_id')->nullable();
            $table->string('reference')->nullable();
            $table->string('scope')->nullable();
            $table->json('types')->nullable();
            $table->string('url')->nullable();
            $table->string('vicinity')->nullable();
            $table->json('geometry')->nullable();
            $table->boolean('permanently_closed')->default(false);
            $table->timestamp('permanently_closed_time')->nullable();
            
            // Timestamps
            $table->timestamp('last_google_sync_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->index('google_place_id');
            $table->index('tenant_id');
            $table->index('fibonacco_status');
            $table->index(['latitude', 'longitude']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('smb_businesses');
    }
};
