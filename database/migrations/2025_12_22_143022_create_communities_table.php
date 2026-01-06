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
        if (Schema::hasTable('communities')) {
            return;
        }
        
        Schema::create('communities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Location
            $table->string('city');
            $table->string('state', 100);
            $table->string('country', 100)->default('US');
            $table->string('slug')->unique();
            
            // Display
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('hero_image_url', 500)->nullable();
            $table->string('logo_url', 500)->nullable();
            
            // Statistics (cached)
            $table->integer('total_businesses')->default(0);
            $table->integer('premium_businesses')->default(0);
            $table->integer('total_categories')->default(0);
            
            // SEO
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            
            // Settings
            $table->json('featured_categories')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('launched_at')->nullable();
            
            $table->timestamps();
            
            $table->index('slug');
            $table->index(['city', 'state']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('communities');
    }
};
