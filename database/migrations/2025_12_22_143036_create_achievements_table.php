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
        Schema::create('achievements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id');
            
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('source_name')->nullable();
            $table->string('source_url', 500)->nullable();
            
            $table->string('achievement_type', 100)->nullable();
            $table->date('achievement_date')->nullable();
            $table->date('expiration_date')->nullable();
            
            $table->string('icon', 100)->nullable();
            $table->string('badge_image_url', 500)->nullable();
            
            $table->boolean('is_verified')->default(false);
            $table->integer('display_order')->default(0);
            $table->boolean('is_featured')->default(false);
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            
            $table->index('business_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('achievements');
    }
};
